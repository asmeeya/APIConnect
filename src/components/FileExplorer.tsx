import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, Layers, Eye, Server, Globe } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PROJECT_1_FILES, PROJECT_2_FILES } from '../data/projectFiles';
import { ProjectFile } from '../types';

export const FileExplorer: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<'api_provider' | 'api_client'>('api_provider');
  const [activeFile, setActiveFile] = useState<ProjectFile>(PROJECT_1_FILES[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const currentFiles = selectedProject === 'api_provider' ? PROJECT_1_FILES : PROJECT_2_FILES;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopiedPath(activeFile.path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadZip = async (project: 'api_provider' | 'api_client') => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const filesToZip = project === 'api_provider' ? PROJECT_1_FILES : PROJECT_2_FILES;
      const folderName = project === 'api_provider' ? 'flask-api-provider' : 'flask-api-client';

      const rootFolder = zip.folder(folderName);
      if (rootFolder) {
        for (const f of filesToZip) {
          const relativePath = f.path.replace(`${project}/`, '');
          rootFolder.file(relativePath, f.content);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Project Selector & ZIP Export */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Project Codebase &amp; File Explorer</h2>
            <p className="text-xs text-slate-500">
              Inspect, copy, or export complete runnable source codes for both Project 1 and Project 2.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownloadZip('api_provider')}
              disabled={isExporting}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Project 1 ZIP
            </button>
            <button
              onClick={() => handleDownloadZip('api_client')}
              disabled={isExporting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Project 2 ZIP
            </button>
          </div>
        </div>

        {/* Project Switcher Tabs */}
        <div className="flex gap-2 mt-3.5 border-t border-slate-100 pt-3">
          <button
            onClick={() => {
              setSelectedProject('api_provider');
              setActiveFile(PROJECT_1_FILES[0]);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedProject === 'api_provider'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Project 1: api_provider/ ({PROJECT_1_FILES.length} files)
          </button>
          <button
            onClick={() => {
              setSelectedProject('api_client');
              setActiveFile(PROJECT_2_FILES[0]);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedProject === 'api_client'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Project 2: api_client/ ({PROJECT_2_FILES.length} files)
          </button>
        </div>
      </div>

      {/* Explorer Dual-Pane (File Tree + Code Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: File Tree */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-2">
            <Folder className="w-4 h-4 text-amber-500" />
            <span className="font-mono font-bold text-xs text-slate-800">{selectedProject}/</span>
          </div>

          <div className="space-y-0.5">
            {currentFiles.map((file) => {
              const isSelected = activeFile.path === file.path;
              const shortName = file.path.replace(`${selectedProject}/`, '');
              return (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md font-mono text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? selectedProject === 'api_provider'
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                        : 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{shortName}</span>
                  </div>
                  <span className="text-[9px] uppercase text-slate-400 font-sans ml-2 flex-shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* File Header */}
          <div className="bg-slate-950 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-xs font-bold text-slate-200 truncate">{activeFile.path}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">
                {activeFile.language}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copiedPath === activeFile.path ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File Code</span>
                </>
              )}
            </button>
          </div>

          {/* Description banner */}
          <div className="bg-slate-900/80 px-3.5 py-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">File Role:</span> {activeFile.description}
          </div>

          {/* Code content */}
          <pre className="p-3.5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
