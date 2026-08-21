import React, { useState } from 'react';
import { Terminal, Check, Copy, ExternalLink, ShieldCheck, Server, Globe, ArrowRight } from 'lucide-react';

interface DeploymentStep {
  number: number;
  title: string;
  category: 'Project 1' | 'Project 2' | 'End-to-End';
  description: string;
  commands?: string;
  envVars?: { key: string; value: string; note: string }[];
  checklist: string[];
}

const DEPLOYMENT_STEPS: DeploymentStep[] = [
  {
    number: 1,
    title: "Build and Test Project 1 Locally",
    category: "Project 1",
    description: "Initialize python virtual environment, install requirements, and boot Flask API Provider.",
    commands: `cd api_provider
python3 -m venv venv
source venv/bin/activate # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python app.py`,
    checklist: [
      "Virtual environment activated",
      "All dependencies installed from requirements.txt",
      "Server listening on http://127.0.0.1:5000"
    ]
  },
  {
    number: 2,
    title: "Create SQLite Database & Test Authentication",
    category: "Project 1",
    description: "Database is automatically created in instance/database.db with seeded admin user.",
    commands: `curl -X POST http://127.0.0.1:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@example.com", "password": "Admin@123456"}'`,
    checklist: [
      "Auto-created instance/database.db SQLite file",
      "Default admin seeded: admin@example.com / Admin@123456",
      "Received valid JWT Bearer access token in response"
    ]
  },
  {
    number: 3,
    title: "Test All CRUD APIs",
    category: "Project 1",
    description: "Verify GET, POST, PUT, DELETE operations on /api/features with Bearer JWT token.",
    commands: `# 1. GET all features
curl http://127.0.0.1:5000/api/features

# 2. POST create new feature (requires JWT)
curl -X POST http://127.0.0.1:5000/api/features \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"title": "Custom Analytics", "description": "Metrics engine", "category": "Analytics", "status": "Active"}'`,
    checklist: [
      "GET /api/features returns standard JSON envelope",
      "POST /api/features creates record and returns HTTP 201",
      "PUT and DELETE endpoints require valid JWT header"
    ]
  },
  {
    number: 4,
    title: "Push Project 1 to GitHub",
    category: "Project 1",
    description: "Initialize git repository for api_provider and push to GitHub.",
    commands: `cd api_provider
git init
git add .
git commit -m "Initial commit - Flask REST API Provider"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flask-api-provider.git
git push -u origin main`,
    checklist: [
      "Created .gitignore preventing instance/*.db and __pycache__ commits",
      "Committed Procfile, requirements.txt, and runtime.txt",
      "Pushed main branch to remote GitHub repository"
    ]
  },
  {
    number: 5,
    title: "Deploy Project 1 on Render",
    category: "Project 1",
    description: "Create a new Web Service on Render connected to your GitHub repository.",
    envVars: [
      { key: "SECRET_KEY", value: "random-secure-hex-string", note: "App session secret" },
      { key: "JWT_SECRET_KEY", value: "random-secure-jwt-key", note: "JWT signing secret" },
      { key: "FLASK_ENV", value: "production", note: "Production mode flag" }
    ],
    checklist: [
      "Select 'Web Service' in Render Dashboard",
      "Build Command: pip install -r requirements.txt",
      "Start Command: gunicorn 'app:app' --workers 4 --bind 0.0.0.0:$PORT",
      "Set environment variables in Render settings"
    ]
  },
  {
    number: 6,
    title: "Copy Deployed API Base URL",
    category: "Project 1",
    description: "Render provisions a public HTTPS URL (e.g. https://flask-api-provider.onrender.com).",
    checklist: [
      "Verify live service responds at https://your-provider.onrender.com/api/health",
      "Copy URL for Project 2 environment configuration"
    ]
  },
  {
    number: 7,
    title: "Build Project 2 (API Client Application)",
    category: "Project 2",
    description: "Setup Python environment and dependencies for the consumer client application.",
    commands: `cd api_client
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt`,
    checklist: [
      "Client dependencies installed (Flask, Flask-SQLAlchemy, requests, gunicorn)",
      "Client user model configured in client.db"
    ]
  },
  {
    number: 8,
    title: "Test Project 2 Against Local Project 1 API",
    category: "Project 2",
    description: "Run Client on port 5001 while Project 1 runs on port 5000.",
    commands: `export API_BASE_URL=http://127.0.0.1:5000
python app.py`,
    checklist: [
      "Open http://127.0.0.1:5001 in browser",
      "Sign in with client@example.com / Client@123456",
      "Verify features table loads data from Project 1",
      "Create a feature via Client UI and see it persist in Project 1"
    ]
  },
  {
    number: 9,
    title: "Configure API_BASE_URL for Production",
    category: "Project 2",
    description: "Point Project 2 to the live Render URL of Project 1.",
    commands: `export API_BASE_URL=https://your-flask-api-provider.onrender.com`,
    checklist: [
      "Ensure API_BASE_URL does not end with trailing slash",
      "Validate SSL / HTTPS communication between services"
    ]
  },
  {
    number: 10,
    title: "Push Project 2 to GitHub",
    category: "Project 2",
    description: "Initialize a separate GitHub repository for Project 2.",
    commands: `cd api_client
git init
git add .
git commit -m "Initial commit - Flask API Client Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flask-api-client.git
git push -u origin main`,
    checklist: [
      "Created .gitignore preventing client.db commits",
      "Committed Procfile, requirements.txt, and templates",
      "Pushed to GitHub repository"
    ]
  },
  {
    number: 11,
    title: "Deploy Project 2 on Render",
    category: "Project 2",
    description: "Create second Web Service in Render for Project 2.",
    envVars: [
      { key: "API_BASE_URL", value: "https://your-flask-api-provider.onrender.com", note: "Live Project 1 API URL" },
      { key: "SECRET_KEY", value: "random-client-secret-key", note: "Client session encryption" },
      { key: "API_TIMEOUT", value: "10", note: "HTTP request timeout seconds" }
    ],
    checklist: [
      "Select 'Web Service' in Render and connect flask-api-client repo",
      "Build Command: pip install -r requirements.txt",
      "Start Command: gunicorn 'app:app' --workers 4 --bind 0.0.0.0:$PORT",
      "Add API_BASE_URL pointing to Project 1 in Render Environment"
    ]
  },
  {
    number: 12,
    title: "End-to-End System Verification",
    category: "End-to-End",
    description: "Verify full production ecosystem in live cloud container environment.",
    checklist: [
      "Open deployed Project 2 URL in browser",
      "Register new user -> Verifies local client SQLite & API Provider sync",
      "Login -> Exchanges credentials for Project 1 JWT",
      "Add new Feature -> Client submits POST request to Project 1 with Bearer header",
      "Verify updated feature list displays across both client and provider endpoints"
    ]
  }
];

export const DeploymentGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommands = (commands: string, index: number) => {
    navigator.clipboard.writeText(commands);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">GitHub &amp; Render Deployment Runbook</h2>
        <p className="text-xs text-slate-500">
          Complete 12-step guided checklist with copyable terminal commands and environment configurations for deploying both Project 1 &amp; Project 2.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {DEPLOYMENT_STEPS.map((step) => (
          <div key={step.number} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-4.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                  {step.number}
                </span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{step.title}</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                step.category === 'Project 1' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                step.category === 'Project 2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {step.category}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-2.5 ml-8.5">{step.description}</p>

            {/* Bash Commands Box */}
            {step.commands && (
              <div className="ml-8.5 mb-2.5 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs relative group">
                <button
                  onClick={() => handleCopyCommands(step.commands!, step.number)}
                  className="absolute top-2 right-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  {copiedIndex === step.number ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto pr-14 leading-relaxed">{step.commands}</pre>
              </div>
            )}

            {/* Environment Variables Table */}
            {step.envVars && (
              <div className="ml-8.5 mb-2.5 overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-1.5">Environment Variable</th>
                      <th className="px-3 py-1.5">Example / Value</th>
                      <th className="px-3 py-1.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {step.envVars.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-bold text-purple-700">{v.key}</td>
                        <td className="px-3 py-1.5 text-slate-600">{v.value}</td>
                        <td className="px-3 py-1.5 font-sans text-slate-500">{v.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Checklist */}
            <div className="ml-8.5 flex flex-wrap gap-1.5 pt-0.5">
              {step.checklist.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] border border-slate-200 font-medium">
                  <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
