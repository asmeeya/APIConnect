import React, { useState } from 'react';
import { Globe, ShieldCheck, Plus, Pencil, Trash2, RefreshCw, AlertTriangle, CheckCircle2, Wifi, WifiOff, LogOut, Key, Search } from 'lucide-react';
import { FeatureRecord, UserRecord } from '../types';

interface ClientSimulatorProps {
  features: FeatureRecord[];
  users: UserRecord[];
  jwtToken: string;
  onUpdateFeatures: (newFeatures: FeatureRecord[]) => void;
  onSetJwtToken: (token: string) => void;
  onLogCall: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, status: number, reqBody: any, resBody: any) => void;
}

export const ClientSimulator: React.FC<ClientSimulatorProps> = ({
  features,
  users,
  jwtToken,
  onUpdateFeatures,
  onSetJwtToken,
  onLogCall
}) => {
  // Client User Session
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string } | null>({
    id: 1,
    name: 'Demo Client User',
    email: 'client@example.com'
  });
  
  // Connection & Fault Simulation
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [simulateExpiredToken, setSimulateExpiredToken] = useState<boolean>(false);

  // UI Views
  const [activeView, setActiveView] = useState<'dashboard' | 'features' | 'add' | 'edit'>('dashboard');
  const [editingFeature, setEditingFeature] = useState<FeatureRecord | null>(null);
  const [deleteModalFeature, setDeleteModalFeature] = useState<FeatureRecord | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending' | 'Archived'>('Active');
  
  // Client Flash Messages
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; text: string } | null>({
    type: 'success',
    text: 'Connected to Project 1 REST API Provider with active session.'
  });

  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const triggerFlash = (type: 'success' | 'danger' | 'warning' | 'info', text: string) => {
    setFlashMessage({ type, text });
  };

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiOnline) {
      triggerFlash('danger', 'Unable to connect to API server at http://127.0.0.1:5000. Service offline.');
      onLogCall('POST', '/api/features', 503, { title: formTitle }, { success: false, message: 'Connection refused.' });
      return;
    }

    if (!jwtToken || simulateExpiredToken) {
      triggerFlash('danger', 'API token expired or missing. Please re-authenticate.');
      onLogCall('POST', '/api/features', 401, { title: formTitle }, { success: false, message: 'Unauthorized. Expired JWT.' });
      return;
    }

    if (!formTitle.trim() || !formDesc.trim()) {
      triggerFlash('warning', 'Title and Description are required.');
      return;
    }

    const newRec: FeatureRecord = {
      id: features.length > 0 ? Math.max(...features.map(f => f.id)) + 1 : 1,
      title: formTitle.trim(),
      description: formDesc.trim(),
      category: formCategory.trim() || 'General',
      status: formStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onUpdateFeatures([newRec, ...features]);
    triggerFlash('success', `Feature "${newRec.title}" successfully created via Project 1 API!`);
    onLogCall('POST', '/api/features', 201, { title: formTitle, description: formDesc, category: formCategory, status: formStatus }, {
      success: true,
      message: 'Feature created successfully.',
      data: { feature: newRec }
    });

    setFormTitle('');
    setFormDesc('');
    setActiveView('features');
  };

  const handleUpdateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;

    if (!isApiOnline) {
      triggerFlash('danger', 'Unable to connect to API server. Update failed.');
      return;
    }

    if (!jwtToken || simulateExpiredToken) {
      triggerFlash('danger', 'JWT authentication error. Please refresh token.');
      return;
    }

    const updated: FeatureRecord = {
      ...editingFeature,
      title: formTitle.trim(),
      description: formDesc.trim(),
      category: formCategory.trim() || 'General',
      status: formStatus,
      updated_at: new Date().toISOString()
    };

    onUpdateFeatures(features.map(f => f.id === editingFeature.id ? updated : f));
    triggerFlash('success', `Feature #${updated.id} updated successfully via Project 1 PUT!`);
    onLogCall('PUT', `/api/features/${updated.id}`, 200, { title: formTitle, description: formDesc, category: formCategory, status: formStatus }, {
      success: true,
      message: 'Feature updated successfully.',
      data: { feature: updated }
    });

    setEditingFeature(null);
    setActiveView('features');
  };

  const handleDeleteFeature = () => {
    if (!deleteModalFeature) return;

    if (!isApiOnline) {
      triggerFlash('danger', 'Unable to connect to API server. Delete failed.');
      setDeleteModalFeature(null);
      return;
    }

    if (!jwtToken || simulateExpiredToken) {
      triggerFlash('danger', 'JWT authentication error on delete. Unauthorized.');
      setDeleteModalFeature(null);
      return;
    }

    const id = deleteModalFeature.id;
    onUpdateFeatures(features.filter(f => f.id !== id));
    triggerFlash('success', `Feature #${id} deleted from Project 1 database.`);
    onLogCall('DELETE', `/api/features/${id}`, 200, null, { success: true, message: 'Feature deleted successfully.', data: { deleted_id: id } });
    setDeleteModalFeature(null);
  };

  const startEdit = (f: FeatureRecord) => {
    setEditingFeature(f);
    setFormTitle(f.title);
    setFormDesc(f.description);
    setFormCategory(f.category);
    setFormStatus(f.status);
    setActiveView('edit');
  };

  // Filter features
  const displayedFeatures = features.filter(f => {
    if (filterCategory && f.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (filterStatus && f.status !== filterStatus) return false;
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Simulation Controls & Status Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm shadow-xs">
              P2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Project 2: Flask API Client Dashboard</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded font-mono border border-blue-200">
                  Port 5001 / Flask-Login
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Consuming Project 1 via <code>API_BASE_URL: http://127.0.0.1:5000</code> &bull; Local database: <code>instance/client.db</code>
              </p>
            </div>
          </div>

          {/* Fault injection / Simulation toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setIsApiOnline(!isApiOnline)}
              className={`px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors border text-xs ${
                isApiOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {isApiOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isApiOnline ? 'API Link: Online' : 'Simulate API Offline'}
            </button>

            <button
              onClick={() => setSimulateExpiredToken(!simulateExpiredToken)}
              className={`px-2.5 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors border text-xs ${
                simulateExpiredToken ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              {simulateExpiredToken ? 'Simulating Expired JWT (401)' : 'Valid JWT Token'}
            </button>
          </div>
        </div>

        {/* Flash Message Banner */}
        {flashMessage && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center justify-between border ${
            flashMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            flashMessage.type === 'danger' ? 'bg-red-50 text-red-800 border-red-200' :
            flashMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {flashMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {flashMessage.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              {flashMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              <span>{flashMessage.text}</span>
            </div>
            <button onClick={() => setFlashMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
          </div>
        )}
      </div>

      {/* Simulated Bootstrap Navbar */}
      <div className="bg-slate-900 text-white rounded-t-xl px-4 py-2 flex items-center justify-between shadow-xs text-xs border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-xs flex items-center gap-1.5 text-blue-400 font-mono">
            <Globe className="w-3.5 h-3.5" /> CLIENT_APP
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-2.5 py-1 rounded transition-colors text-xs ${activeView === 'dashboard' ? 'bg-blue-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('features')}
              className={`px-2.5 py-1 rounded transition-colors text-xs ${activeView === 'features' ? 'bg-blue-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Features Explorer
            </button>
            <button
              onClick={() => {
                setEditingFeature(null);
                setFormTitle('');
                setFormDesc('');
                setFormCategory('General');
                setFormStatus('Active');
                setActiveView('add');
              }}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 text-xs ${activeView === 'add' ? 'bg-blue-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Plus className="w-3 h-3" /> Add Feature
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-700">
                {currentUser.name}
              </span>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  triggerFlash('info', 'Logged out of client application.');
                }}
                className="text-slate-400 hover:text-white p-1 rounded"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setCurrentUser({ id: 1, name: 'Demo Client User', email: 'client@example.com' });
                triggerFlash('success', 'Logged in as Demo Client User.');
              }}
              className="bg-blue-600 text-white px-2.5 py-1 rounded font-semibold hover:bg-blue-500 text-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main View Container */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl p-4 sm:p-5 shadow-xs min-h-[380px]">
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Consumer Overview Dashboard</h3>
                <p className="text-xs text-slate-500">Live summary of data consumed from Project 1 REST API.</p>
              </div>
              <button
                onClick={() => {
                  onLogCall('GET', '/api/features', 200, null, { success: true, count: features.length });
                  triggerFlash('info', 'Synchronized live data from Project 1.');
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-semibold flex items-center gap-1.5 text-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh API Data
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Total Records Consumed</span>
                <div className="text-xl font-bold text-blue-600 font-mono">{features.length}</div>
                <span className="text-[10px] text-slate-400">Stored in Project 1 SQLite</span>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">API Provider Health</span>
                <div className={`text-sm font-bold flex items-center gap-1.5 ${isApiOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isApiOnline ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {isApiOnline ? 'Online (200 OK)' : 'Offline / Error'}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">http://127.0.0.1:5000</span>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Active Client Auth</span>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {currentUser ? currentUser.name : 'Signed Out'}
                </div>
                <span className="text-[10px] text-slate-400">Bearer JWT in session</span>
              </div>
            </div>

            {/* Recent Features Table Preview */}
            <div className="bg-white rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Recent Features Fetched from Project 1</h4>
                <button
                  onClick={() => setActiveView('features')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {features.slice(0, 4).map(f => (
                  <div key={f.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800">{f.title}</span>
                      <span className="text-slate-400 text-[10px] ml-2 font-mono">({f.category})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: FEATURES LIST & CRUD */}
        {activeView === 'features' && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Project 1 Business Feature Store</h3>
                <p className="text-xs text-slate-500">Live table rendering records fetched from <code>GET /api/features</code>.</p>
              </div>
              <button
                onClick={() => {
                  setEditingFeature(null);
                  setFormTitle('');
                  setFormDesc('');
                  setFormCategory('General');
                  setFormStatus('Active');
                  setActiveView('add');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Feature
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <div className="relative flex-grow min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search features..."
                  className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="">All Categories</option>
                <option value="Security">Security</option>
                <option value="Finance">Finance</option>
                <option value="Reporting">Reporting</option>
                <option value="Communication">Communication</option>
                <option value="AI & ML">AI &amp; ML</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Features Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Title &amp; Description</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedFeatures.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-400">#{f.id}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900">{f.title}</div>
                        <div className="text-slate-500 text-[11px] max-w-md truncate">{f.description}</div>
                      </td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">{f.category}</span></td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(f)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-slate-200"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteModalFeature(f)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded border border-slate-200"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedFeatures.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                        No features found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: ADD / EDIT FEATURE FORM */}
        {(activeView === 'add' || activeView === 'edit') && (
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <h3 className="font-bold text-slate-900 text-sm">
                {activeView === 'add' ? 'Create New Feature on Project 1' : `Edit Feature #${editingFeature?.id}`}
              </h3>
              <button
                onClick={() => setActiveView('features')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                &larr; Back to Features
              </button>
            </div>

            <form onSubmit={activeView === 'add' ? handleCreateFeature : handleUpdateFeature} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feature Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="e.g. Automated PDF Invoicing"
                  className="w-full p-2 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Finance, Security"
                    className="w-full p-2 border border-slate-300 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-md text-xs bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe technical functionality and capabilities..."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveView('features')}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold shadow-xs transition-colors"
                >
                  {activeView === 'add' ? 'Submit POST /api/features' : 'Save PUT /api/features/<id>'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalFeature && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-red-600 mb-2">
              <div className="p-1.5 bg-red-100 rounded-full">
                <Trash2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Confirm Deletion</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete feature <strong>"{deleteModalFeature.title}"</strong> (#{deleteModalFeature.id})? This executes <code>DELETE /api/features/{deleteModalFeature.id}</code> on Project 1.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalFeature(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFeature}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
