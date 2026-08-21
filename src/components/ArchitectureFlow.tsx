import React, { useState } from 'react';
import { Database, ShieldCheck, ArrowRight, Server, Globe, Key, CheckCircle2, Play, RefreshCw, Layers, Cpu, Terminal } from 'lucide-react';

interface Step {
  step: number;
  title: string;
  actor: string;
  action: string;
  details: string;
  badge: string;
  color: string;
}

const FLOW_STEPS: Step[] = [
  {
    step: 1,
    title: "User Action & Local Session",
    actor: "End-User / Browser",
    action: "User submits credentials or interacts with Client UI",
    details: "Project 2 (Client) verifies local session in client.db or loads dashboard view.",
    badge: "Client Session",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    step: 2,
    title: "JWT Authentication Handshake",
    actor: "Project 2 -> Project 1",
    action: "POST /api/auth/login with credentials",
    details: "Project 1 verifies hashed password via Werkzeug and issues signed JWT Bearer Token.",
    badge: "Flask-JWT-Extended",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200"
  },
  {
    step: 3,
    title: "Token Storage & Request Forwarding",
    actor: "Project 2 (Client Backend)",
    action: "Stores token in session['api_jwt_token'] & attaches header",
    details: "Client service constructs HTTP request using Python 'requests' library with Authorization: Bearer <token>.",
    badge: "Bearer Token",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    step: 4,
    title: "REST API Validation & DB Query",
    actor: "Project 1 (API Provider)",
    action: "@jwt_required() validation & SQLAlchemy query",
    details: "Project 1 decodes token, validates payload, executes CRUD on SQLite database.db.",
    badge: "SQLAlchemy / SQLite",
    color: "bg-amber-100 text-amber-800 border-amber-200"
  },
  {
    step: 5,
    title: "Standard JSON Response Delivery",
    actor: "Project 1 -> Project 2",
    action: "Returns HTTP 200/201 with standard schema",
    details: "{ success: true, message: '...', data: { ... }, errors: [] } returned with standard status codes.",
    badge: "JSON Envelope",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  {
    step: 6,
    title: "Client UI Rendering",
    actor: "Project 2 (Client Dashboard)",
    action: "Renders Bootstrap 5 templates with dynamic data",
    details: "User sees updated features table, flash messages, status badges, or error alerts.",
    badge: "Bootstrap 5 UI",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200"
  }
];

export const ArchitectureFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const startPlayback = () => {
    setIsAutoPlaying(true);
    setActiveStep(1);
    let curr = 1;
    const interval = setInterval(() => {
      curr += 1;
      if (curr > FLOW_STEPS.length) {
        clearInterval(interval);
        setIsAutoPlaying(false);
      } else {
        setActiveStep(curr);
      }
    }, 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* High-Level Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Project 2 Client */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-xs">
                P2
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Client Consumer</span>
                <h3 className="font-bold text-slate-900 text-sm">Flask UI Dashboard</h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Standalone Flask web app with user sessions, Bootstrap 5 UI, and a dedicated HTTP client service consuming Project 1.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">client.db</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">requests</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">Port 5001</span>
          </div>
        </div>

        {/* Bridge / JWT Channel */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 shadow-xs relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Communication Gateway</span>
              <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[9px] font-mono border border-indigo-800">REST + JWT</span>
            </div>
            <h3 className="font-bold text-sm mb-1 text-slate-100">Authorization Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Requests flow over HTTP using <code className="text-amber-300 font-mono text-[11px]">API_BASE_URL</code> with <code className="text-emerald-400 font-mono text-[11px]">Bearer &lt;token&gt;</code> headers.
            </p>
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-400 truncate">
            Authorization: Bearer eyJhbGci...
          </div>
        </div>

        {/* Project 1 Provider */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 bg-purple-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-xs">
                P1
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">API Provider</span>
                <h3 className="font-bold text-slate-900 text-sm">Flask REST API</h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Central Flask REST API with Flask-JWT-Extended security, SQLAlchemy persistence, and standard JSON envelope responses.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">database.db</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">JWT-Extended</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">Port 5000</span>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Flow Animator */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">End-to-End Request Lifecycle</h3>
            <p className="text-xs text-slate-500">Trace execution path from browser click down to SQLite database storage and back.</p>
          </div>
          <button
            onClick={startPlayback}
            disabled={isAutoPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            {isAutoPlaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? "Simulating Flow..." : "Play Step-by-Step Flow"}</span>
          </button>
        </div>

        {/* Step Selector Pills */}
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {FLOW_STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`p-2.5 text-left rounded-lg border transition-all text-xs ${
                  activeStep === s.step
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                    activeStep === s.step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {s.step}
                  </span>
                  {activeStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="font-semibold text-slate-800 truncate text-[11px]">{s.actor.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 truncate">{s.badge}</div>
              </button>
            ))}
          </div>

          {/* Active Step Highlight Card */}
          {(() => {
            const current = FLOW_STEPS[activeStep - 1];
            return (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold">Step {current.step}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{current.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${current.color}`}>
                    {current.badge}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Actor &amp; Trigger:</span>
                    <div className="font-bold text-slate-800 mb-1 text-xs">{current.actor}</div>
                    <div className="text-slate-600 font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">{current.action}</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Execution Mechanism:</span>
                    <p className="text-slate-700 leading-relaxed text-xs">{current.details}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

