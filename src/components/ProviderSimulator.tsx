import React, { useState } from 'react';
import { Server, Key, Database, Play, CheckCircle2, AlertCircle, Copy, RefreshCw, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { FeatureRecord, UserRecord, ApiResponse } from '../types';

interface ProviderSimulatorProps {
  features: FeatureRecord[];
  users: UserRecord[];
  jwtToken: string;
  onUpdateFeatures: (newFeatures: FeatureRecord[]) => void;
  onUpdateUsers: (newUsers: UserRecord[]) => void;
  onSetJwtToken: (token: string) => void;
  onLogCall: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, status: number, reqBody: any, resBody: any) => void;
}

export const ProviderSimulator: React.FC<ProviderSimulatorProps> = ({
  features,
  users,
  jwtToken,
  onUpdateFeatures,
  onUpdateUsers,
  onSetJwtToken,
  onLogCall
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'tester' | 'database'>('docs');
  
  // Tester State
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/features');
  const [testPayload, setTestPayload] = useState<string>('{\n  "title": "Automated Webhooks",\n  "description": "Trigger instant event notifications.",\n  "category": "Infrastructure",\n  "status": "Active"\n}');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatusCode, setTestStatusCode] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const executeApiRequest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      let status = 200;
      let response: ApiResponse = { success: true, message: 'OK' };
      let reqBody: any = null;

      try {
        if (['POST', 'PUT'].includes(testMethod) && testPayload.trim()) {
          reqBody = JSON.parse(testPayload);
        }
      } catch (e) {
        status = 400;
        response = { success: false, message: 'Invalid JSON payload format in request body.', errors: ['Syntax error parsing JSON.'] };
        setTestStatusCode(status);
        setTestResponse(response);
        setIsExecuting(false);
        onLogCall(testMethod, testEndpoint, status, testPayload, response);
        return;
      }

      // Check endpoints
      if (testEndpoint === '/api/health') {
        status = 200;
        response = {
          success: true,
          message: 'Flask REST API Provider is healthy and operational.',
          data: { service: 'Flask REST API Provider', status: 'online', timestamp: new Date().toISOString() }
        };
      } else if (testEndpoint === '/api/auth/login') {
        if (testMethod === 'POST') {
          const email = reqBody?.email?.toLowerCase();
          const pass = reqBody?.password;
          const user = users.find(u => u.email.toLowerCase() === email);
          if (user && (pass === 'Admin@123456' || pass === 'Client@123456' || pass?.length >= 6)) {
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: String(user.id), email: user.email, name: user.name, exp: Date.now() + 86400000 }))}.simulated_signature_provider`;
            onSetJwtToken(token);
            status = 200;
            response = {
              success: true,
              message: 'Login successful. JWT token issued.',
              data: { token, token_type: 'Bearer', user: { id: user.id, name: user.name, email: user.email } }
            };
          } else {
            status = 401;
            response = { success: false, message: 'Invalid email or password.', errors: ['Authentication failed.'] };
          }
        }
      } else if (testEndpoint === '/api/auth/register') {
        if (testMethod === 'POST') {
          const name = reqBody?.name?.trim();
          const email = reqBody?.email?.trim().toLowerCase();
          const password = reqBody?.password;
          if (!name || !email || !password) {
            status = 400;
            response = { success: false, message: 'Validation failed', errors: ['name, email, and password are required.'] };
          } else if (users.some(u => u.email.toLowerCase() === email)) {
            status = 400;
            response = { success: false, message: 'An account with this email already exists.', errors: ['Duplicate email.'] };
          } else {
            const newUser: UserRecord = {
              id: users.length + 1,
              name,
              email,
              password_hash: 'pbkdf2:sha256:simulated_hash',
              created_at: new Date().toISOString()
            };
            onUpdateUsers([...users, newUser]);
            status = 201;
            response = {
              success: true,
              message: 'User registered successfully in SQLite database.',
              data: { user: { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at } }
            };
          }
        }
      } else if (testEndpoint === '/api/features' || testEndpoint.startsWith('/api/features/')) {
        if (testEndpoint === '/api/features') {
          if (testMethod === 'GET') {
            status = 200;
            response = {
              success: true,
              message: `Retrieved ${features.length} feature(s) successfully.`,
              data: { count: features.length, features }
            };
          } else if (testMethod === 'POST') {
            if (!jwtToken) {
              status = 401;
              response = {
                success: false,
                message: "Authentication token is missing. Please provide 'Authorization: Bearer <token>' header.",
                errors: ['Missing Authorization header.']
              };
            } else if (!reqBody?.title || !reqBody?.description) {
              status = 400;
              response = { success: false, message: 'Validation failed', errors: ['Field title and description are required.'] };
            } else {
              const newF: FeatureRecord = {
                id: features.length > 0 ? Math.max(...features.map(f => f.id)) + 1 : 1,
                title: reqBody.title,
                description: reqBody.description,
                category: reqBody.category || 'General',
                status: reqBody.status || 'Active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              onUpdateFeatures([newF, ...features]);
              status = 201;
              response = {
                success: true,
                message: 'Feature created successfully in SQLite database.',
                data: { feature: newF }
              };
            }
          }
        } else {
          // /api/features/<id>
          const idMatch = testEndpoint.match(/\/api\/features\/(\d+)/);
          const targetId = idMatch ? parseInt(idMatch[1], 10) : null;
          const found = features.find(f => f.id === targetId);

          if (!targetId || !found) {
            status = 404;
            response = { success: false, message: `Feature with ID ${targetId} not found.`, errors: ['Resource not found.'] };
          } else if (testMethod === 'GET') {
            status = 200;
            response = { success: true, message: 'Feature retrieved successfully.', data: { feature: found } };
          } else if (testMethod === 'PUT') {
            if (!jwtToken) {
              status = 401;
              response = { success: false, message: 'Authentication required. Missing Bearer JWT.', errors: ['Unauthorized.'] };
            } else {
              const updated: FeatureRecord = {
                ...found,
                title: reqBody?.title || found.title,
                description: reqBody?.description || found.description,
                category: reqBody?.category || found.category,
                status: reqBody?.status || found.status,
                updated_at: new Date().toISOString()
              };
              onUpdateFeatures(features.map(f => f.id === targetId ? updated : f));
              status = 200;
              response = { success: true, message: 'Feature updated successfully.', data: { feature: updated } };
            }
          } else if (testMethod === 'DELETE') {
            if (!jwtToken) {
              status = 401;
              response = { success: false, message: 'Authentication required. Missing Bearer JWT.', errors: ['Unauthorized.'] };
            } else {
              onUpdateFeatures(features.filter(f => f.id !== targetId));
              status = 200;
              response = { success: true, message: 'Feature deleted successfully from SQLite database.', data: { deleted_id: targetId } };
            }
          }
        }
      } else {
        status = 404;
        response = { success: false, message: 'The requested endpoint was not found.', errors: ['Resource not found.'] };
      }

      setTestStatusCode(status);
      setTestResponse(response);
      setIsExecuting(false);
      onLogCall(testMethod, testEndpoint, status, reqBody, response);
    }, 200);
  };

  const handleGenerateDefaultJwt = () => {
    const adminUser = users[0] || { id: 1, name: 'Admin Provider', email: 'admin@example.com' };
    const simulatedJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: String(adminUser.id), email: adminUser.email, name: adminUser.name, exp: Date.now() + 86400000 }))}.simulated_flask_signature_provider`;
    onSetJwtToken(simulatedJwt);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Token Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 text-white rounded flex items-center justify-center font-bold text-sm shadow-xs">
              P1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Project 1: Flask REST API Provider</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded font-mono border border-emerald-200">
                  Port 5000 / Gunicorn
                </span>
              </div>
              <p className="text-xs text-slate-500">Flask-SQLAlchemy SQLite engine &bull; Flask-JWT-Extended stateless authentication</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateDefaultJwt}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              {jwtToken ? 'Refresh Admin JWT' : 'Generate Test JWT'}
            </button>
            {jwtToken && (
              <button
                onClick={() => onSetJwtToken('')}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-md"
              >
                Clear JWT
              </button>
            )}
          </div>
        </div>

        {/* Live Token Status */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-mono">
            <span className="font-semibold text-slate-500 text-[11px]">Active Bearer Token:</span>
            {jwtToken ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 truncate max-w-md">
                {jwtToken.slice(0, 45)}...
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                No JWT active (Unauthenticated requests only)
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px] font-mono">Database: <code>instance/database.db</code> ({features.length} records)</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3.5 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'docs'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          API Specification (/api-docs)
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-3.5 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'tester'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Live REST API Console
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'database'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          SQLite Database Inspector ({features.length} features, {users.length} users)
        </button>
      </div>

      {/* Tab 1: API Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-0.5">Endpoints &amp; Specifications</h3>
            <p className="text-xs text-slate-500 mb-4">Complete OpenAPI reference for Project 1 Flask Provider endpoints.</p>

            <div className="space-y-3">
              {/* POST /api/auth/register */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold font-mono">POST</span>
                    <span className="font-mono font-bold text-xs text-slate-800">/api/auth/register</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-medium">Public</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Registers a new user into SQLite with Werkzeug password hashing.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Request Body:</span>
                    {`{\n  "name": "Alex",\n  "email": "alex@example.com",\n  "password": "SecretPassword"\n}`}
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Response (201 Created):</span>
                    {`{\n  "success": true,\n  "message": "User registered successfully.",\n  "data": { "user": { ... } }\n}`}
                  </div>
                </div>
              </div>

              {/* POST /api/auth/login */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold font-mono">POST</span>
                    <span className="font-mono font-bold text-xs text-slate-800">/api/auth/login</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-medium">Public</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Authenticates user and returns JWT Bearer access token.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Request Body:</span>
                    {`{\n  "email": "admin@example.com",\n  "password": "Admin@123456"\n}`}
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Response (200 OK):</span>
                    {`{\n  "success": true,\n  "data": { "token": "eyJ...", "token_type": "Bearer" }\n}`}
                  </div>
                </div>
              </div>

              {/* GET /api/features */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded text-[10px] font-bold font-mono">GET</span>
                    <span className="font-mono font-bold text-xs text-slate-800">/api/features</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-medium">Public</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Fetches list of all business features with optional query filters (<code>?category=</code>, <code>?status=</code>).</p>
                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-xs border border-slate-800">
                  <span className="text-slate-400 block mb-1 text-[10px]">Response (200 OK):</span>
                  {`{\n  "success": true,\n  "message": "Retrieved 5 feature(s) successfully.",\n  "data": { "count": 5, "features": [...] }\n}`}
                </div>
              </div>

              {/* POST /api/features */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold font-mono">POST</span>
                    <span className="font-mono font-bold text-xs text-slate-800">/api/features</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-medium">
                    JWT Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Creates a new feature. Requires header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Payload:</span>
                    {`{\n  "title": "New Feature",\n  "description": "Details...",\n  "category": "General",\n  "status": "Active"\n}`}
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block mb-1 text-[10px]">Response (201 Created):</span>
                    {`{\n  "success": true,\n  "message": "Feature created successfully.",\n  "data": { "feature": { "id": 6, ... } }\n}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live REST API Tester */}
      {activeTab === 'tester' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Interactive REST API Dispatcher</h3>
              <p className="text-xs text-slate-500">Test live requests against the simulated Project 1 Flask runtime.</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setTestMethod('GET'); setTestEndpoint('/api/features'); }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700"
              >
                GET /features
              </button>
              <button
                onClick={() => { setTestMethod('POST'); setTestEndpoint('/api/features'); }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700"
              >
                POST /features
              </button>
              <button
                onClick={() => { setTestMethod('GET'); setTestEndpoint('/api/health'); }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700"
              >
                GET /health
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Method</label>
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value as any)}
                className="w-full text-xs font-bold border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="md:col-span-8">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Endpoint Path</label>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full text-xs font-mono border border-slate-300 rounded-md p-2"
                placeholder="/api/features or /api/features/1"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={executeApiRequest}
                disabled={isExecuting}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Send Request
              </button>
            </div>
          </div>

          {['POST', 'PUT'].includes(testMethod) && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Request Body (JSON)</label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={4}
                className="w-full font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-md border border-slate-700"
              />
            </div>
          )}

          {/* Response Console */}
          {testResponse && (
            <div className="mt-3 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 text-slate-200">
              <div className="bg-slate-900 px-3.5 py-2 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    testStatusCode && testStatusCode < 300 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    HTTP {testStatusCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{testMethod} {testEndpoint}</span>
                </div>
                <span className="text-[11px] text-slate-400">Response Envelope</span>
              </div>
              <pre className="p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Database Inspector */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">SQLite Table: <code>features</code> ({features.length} records)</h3>
                <p className="text-xs text-slate-500">Live feature records managed by Flask-SQLAlchemy in <code>instance/database.db</code>.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Title</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Created</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {features.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-500">#{f.id}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{f.title}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">{f.category}</span></td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">{f.created_at.slice(0, 10)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => onUpdateFeatures(features.filter(item => item.id !== f.id))}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete from SQLite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">SQLite Table: <code>users</code> ({users.length} records)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Password Hash Algorithm</th>
                    <th className="px-4 py-2.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-500">#{u.id}</td>
                      <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">{u.name}</td>
                      <td className="px-4 py-2.5 text-indigo-600">{u.email}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-[11px]">pbkdf2:sha256:260000$werkzeug</td>
                      <td className="px-4 py-2.5 text-slate-400 text-[11px]">{u.created_at.slice(0, 19).replace('T', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

