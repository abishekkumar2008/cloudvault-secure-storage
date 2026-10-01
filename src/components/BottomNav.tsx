import React from 'react';
import { Folder, Share2, Users, ShieldCheck, Flame, History, Settings } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  logsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, logsCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 py-1 px-2 sm:hidden">
      <div className="flex items-center justify-between max-w-lg mx-auto overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('files')}
          id="nav-files-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'files' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Files</span>
        </button>

        <button
          onClick={() => setActiveTab('shared')}
          id="nav-shared-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'shared' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Shared</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          id="nav-accounts-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'accounts' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Login IDs</span>
        </button>

        <button
          onClick={() => setActiveTab('shield')}
          id="nav-shield-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'shield' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Shield</span>
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          id="nav-secrets-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'secrets' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          id="nav-logs-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors relative shrink-0 ${
            activeTab === 'logs' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Logs</span>
          {logsCount && logsCount > 0 ? (
            <span className="absolute top-0.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500/50" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          id="nav-settings-tab"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
