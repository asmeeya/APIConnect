import React, { useState } from 'react';
import { Server, Globe, GitBranch, Terminal, FileCode, Layers, Activity, ShieldCheck, Database, RefreshCw, Radio, CheckCircle2, ChevronRight, HardDrive, Cpu } from 'lucide-react';
import { FeatureRecord, UserRecord, ApiCallLog } from './types';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { ProviderSimulator } from './components/ProviderSimulator';
import { ClientSimulator } from './components/ClientSimulator';
import { FileExplorer } from './components/FileExplorer';
import { DeploymentGuide } from './components/DeploymentGuide';

// Initial SQLite Seed Data
const INITIAL_USERS: UserRecord[] = [
  {
    id: 1,
    name: "Admin Provider",
    email: "admin@example.com",
    password_hash: "pbkdf2:sha256:260000$werkzeug$simulated_admin",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 2,
    name: "Client Consumer",
    email: "client@example.com",
    password_hash: "pbkdf2:sha256:260000$werkzeug$simulated_client",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const INITIAL_FEATURES: FeatureRecord[] = [
  {
    id: 1,
    title: "JWT Authentication & Refresh Engine",
    description: "Stateless security layer with token rotation and RSA256 signature verification.",
    category: "Security",
    status: "Active",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 2,
    title: "SQLAlchemy Auto-Migration Engine",
    description: "Database schema migration and declarative mapping for SQLite and PostgreSQL.",
    category: "Infrastructure",
    status: "Active",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 3,
    title: "Stripe Recurring Billing Webhooks",
    description: "Real-time subscription synchronization, invoice creation, and dunning management.",
    category: "Finance",
    status: "Pending",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 4,
    title: "Automated PDF Report Dispatcher",
    description: "Scheduled weekly telemetry digest generation with asynchronous email delivery.",
    category: "Reporting",
    status: "Active",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 5,
    title: "Multi-Tenant Team RBAC",
    description: "Granular permission sets (Admin, Editor, Viewer) with hierarchical scope enforcement.",
    category: "Security",
    status: "Active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'client' | 'provider' | 'files' | 'deployment'>('architecture');
  
  // Shared SQLite & API State
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [features, setFeatures] = useState<FeatureRecord[]>(INITIAL_FEATURES);
  const [jwtToken, setJwtToken] = useState<string>(
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: "1", email: "admin@example.com", name: "Admin Provider", exp: Date.now() + 86400000 }))}.simulated_flask_provider_token`
  );

  // Live HTTP telemetry logs
  const [callLogs, setCallLogs] = useState<ApiCallLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      method: 'GET',
      endpoint: '/api/features',
      caller: 'Project 2 Client',
      authHeader: 'Bearer eyJhbGci...',
      statusCode: 200,
      responseBody: { success: true, count: 5 },
      durationMs: 34
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString(),
      method: 'POST',
      endpoint: '/api/auth/login',
      caller: 'Project 2 Client',
      authHeader: null,
      statusCode: 200,
      responseBody: { success: true, token: "Bearer eyJhb..." },
      durationMs: 18
    }
  ]);
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);

  const handleLogCall = (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, status: number, reqBody: any, resBody: any) => {
    const newLog: ApiCallLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      caller: 'Project 2 Client',
      authHeader: jwtToken ? `Bearer ${jwtToken.slice(0, 15)}...` : null,
      statusCode: status,
      requestBody: reqBody,
      responseBody: resBody,
      durationMs: Math.floor(Math.random() * 45) + 15
    };
    setCallLogs(prev => [newLog, ...prev.slice(0, 29)]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* High Density Top Navbar */}
      <nav className="h-14 bg-slate-900 flex items-center justify-between px-4 sm:px-6 border-b border-slate-700/80 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white text-xs shadow-xs tracking-wider">
            FS
          </div>
          <div>
            <span className="text-white font-semibold text-xs sm:text-sm tracking-tight uppercase flex items-center gap-2">
              Flask-Stack Multi-Project System
            </span>
            <span className="text-[10px] text-slate-400 hidden md:block">REST Provider &bull; Consumer Client &bull; SQLite &bull; Render</span>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center">
          {/* Status Pills */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-300 font-medium">Provider: Online (v1.0.4)</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-300 font-medium">Consumer: Online (v1.0.0)</span>
          </div>

          {/* Logs Drawer Trigger */}
          <button
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              showLogsDrawer
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono">{callLogs.length} reqs</span>
          </button>

          {/* User Badge */}
          <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 text-xs font-bold font-mono">
            AP
          </div>
        </div>
      </nav>

      {/* Main Body with High Density Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* High Density Left Sidebar */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col p-3 sm:p-4 shrink-0 hidden lg:flex">
          <div className="mb-6">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2 px-3">
              Deployment Control
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between text-left transition-colors ${
                    activeTab === 'architecture'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    System Overview
                  </span>
                  {activeTab === 'architecture' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveTab('provider')}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between text-left transition-colors ${
                    activeTab === 'provider'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    Project 1: Provider
                  </span>
                  {activeTab === 'provider' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between text-left transition-colors ${
                    activeTab === 'client'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Project 2: Client
                  </span>
                  {activeTab === 'client' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between text-left transition-colors ${
                    activeTab === 'files'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    Source Files &amp; ZIP
                  </span>
                  {activeTab === 'files' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              </li>

              <li>
                <button
                  onClick={() => setActiveTab('deployment')}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between text-left transition-colors ${
                    activeTab === 'deployment'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                    Render Runbook
                  </span>
                  {activeTab === 'deployment' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              </li>
            </ul>
          </div>

          {/* SQLite Status Card */}
          <div className="mt-auto p-3 bg-slate-800/60 rounded-lg border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <HardDrive className="w-3 h-3 text-indigo-400" />
              SQLite Storage
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-300">api_provider.db:</span>
                <span className="text-indigo-300 font-bold">4.2 MB</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-300">client.db:</span>
                <span className="text-indigo-300 font-bold">1.1 MB</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SQLAlchemy Engine</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Mobile Tab Pills */}
          <div className="flex lg:hidden bg-slate-200 p-1 rounded-lg text-xs font-semibold overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'provider' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              Provider
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'client' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              Client
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'files' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Source Files
            </button>
            <button
              onClick={() => setActiveTab('deployment')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${activeTab === 'deployment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Deploy
            </button>
          </div>

          {/* High Density Metric Cards Strip */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200">
              <p className="text-slate-500 text-xs font-medium mb-0.5">Total Users (Global)</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">{users.length + 1246}</p>
              <div className="mt-1 flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                <span>&uarr; 12%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200">
              <p className="text-slate-500 text-xs font-medium mb-0.5">API Requests (24h)</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">48.5k</p>
              <div className="mt-1 flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                <span>&uarr; 8.2%</span>
                <span className="text-slate-400 font-normal">active throughput</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200">
              <p className="text-slate-500 text-xs font-medium mb-0.5">Avg Latency (ms)</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">42ms</p>
              <div className="mt-1 flex items-center gap-1 text-slate-400 text-[10px] font-normal">
                <span>Render &bull; Frankfurt (fra-1)</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200">
              <p className="text-slate-500 text-xs font-medium mb-0.5">Active JWT Tokens</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">312</p>
              <div className="mt-1 flex items-center gap-1 text-indigo-600 text-[10px] font-bold">
                <span>99.9%</span>
                <span className="text-slate-400 font-normal">uptime reliability</span>
              </div>
            </div>
          </section>

          {/* Active View Module */}
          <div className="space-y-5">
            {activeTab === 'architecture' && <ArchitectureFlow />}
            
            {activeTab === 'client' && (
              <ClientSimulator
                features={features}
                users={users}
                jwtToken={jwtToken}
                onUpdateFeatures={setFeatures}
                onSetJwtToken={setJwtToken}
                onLogCall={handleLogCall}
              />
            )}

            {activeTab === 'provider' && (
              <ProviderSimulator
                features={features}
                users={users}
                jwtToken={jwtToken}
                onUpdateFeatures={setFeatures}
                onUpdateUsers={setUsers}
                onSetJwtToken={setJwtToken}
                onLogCall={handleLogCall}
              />
            )}

            {activeTab === 'files' && <FileExplorer />}

            {activeTab === 'deployment' && <DeploymentGuide />}
          </div>
        </main>
      </div>

      {/* High Density Footer */}
      <footer className="h-8 bg-slate-200 border-t border-slate-300 px-4 sm:px-6 flex items-center justify-between shrink-0 text-[10px] z-30">
        <div className="flex gap-4 text-slate-600 font-medium">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            API Gateway Active
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            JWT Signed-Session
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Flask 3.0.x &bull; SQLite &bull; Bootstrap 5 &bull; Flask-JWT-Extended &bull; Render
        </div>
      </footer>

      {/* HTTP Logs Drawer */}
      {showLogsDrawer && (
        <div className="fixed bottom-8 inset-x-0 bg-slate-950 text-slate-200 border-t border-slate-800 shadow-2xl z-50 max-h-72 flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                Live HTTP Traffic &bull; Project 2 &harr; Project 1
              </span>
              <span className="text-slate-400 font-mono text-[10px]">({callLogs.length} events logged)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCallLogs([])}
                className="text-slate-400 hover:text-slate-200 text-[11px]"
              >
                Clear Log
              </button>
              <button
                onClick={() => setShowLogsDrawer(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>
          </div>
          <div className="p-3 overflow-y-auto font-mono text-xs space-y-1.5 flex-1">
            {callLogs.map((log) => (
              <div key={log.id} className="p-2 rounded bg-slate-900 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                    log.method === 'GET' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    log.method === 'POST' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    log.method === 'PUT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {log.method}
                  </span>
                  <span className="text-slate-200 font-mono">{log.endpoint}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    log.statusCode < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    HTTP {log.statusCode}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{log.durationMs}ms</span>
                  {log.authHeader && <span className="text-indigo-300 font-mono">{log.authHeader}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
