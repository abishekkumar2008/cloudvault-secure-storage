import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileText,
  Share2,
  Lock,
  Trash2,
  Download,
  Key,
  UserCheck,
  Clock,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ActivityLog, LogCategory } from '../types';
import { api } from '../api/client';

interface ActivityLogsViewProps {
  onRefresh?: () => void;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ onRefresh }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory, page, search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getActivityLogs(selectedCategory, page, search);
      setLogs(res.logs);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateThreat = async () => {
    setSimulating(true);
    try {
      await api.simulateEvent('failed_login');
      await fetchLogs();
      if (onRefresh) onRefresh();
    } finally {
      setSimulating(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const ms = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(ms / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} mins ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch {
      return 'Recently';
    }
  };

  const getActionIcon = (log: ActivityLog) => {
    if (log.action.includes('Failed') || log.category === 'Security') {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (log.action.includes('Shared')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-xs">
          <Share2 className="w-4 h-4" />
        </div>
      );
    }
    if (log.action.includes('Deleted')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
          <Trash2 className="w-4 h-4" />
        </div>
      );
    }
    if (log.action.includes('Login') || log.action.includes('Auth') || log.category === 'Auth') {
      return (
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-xs">
          <UserCheck className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-xs">
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Activity Log</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Comprehensive audit trail of recent user actions and system events.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateThreat}
              disabled={simulating}
              id="simulate-security-event-btn"
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Test security audit logging"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Threat</span>
            </button>
            <button
              onClick={fetchLogs}
              className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Security', 'File Ops', 'Sharing', 'Auth'] as LogCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 backdrop-blur-xs ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md divide-y divide-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No audit logs found for this filter.
          </div>
        ) : (
          logs.map((log) => {
            const isSecurity = log.category === 'Security' || log.action.includes('Failed');
            return (
              <div
                key={log.id}
                className={`p-4 sm:px-6 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors ${
                  isSecurity ? 'bg-rose-500/10' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {getActionIcon(log)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-200">{log.userName}</span>
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.2 rounded-md ${
                          isSecurity
                            ? 'text-rose-300 bg-rose-500/20 font-semibold border border-rose-500/30'
                            : 'text-slate-300 bg-white/10'
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>

                    {/* Resource tag */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {log.resourceName && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-lg border ${
                            isSecurity
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-semibold'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}
                        >
                          {log.resourceName}
                        </span>
                      )}

                      {log.category === 'Sharing' && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                          External
                        </span>
                      )}

                      {log.action.includes('SSO') && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                          SSO via Okta
                        </span>
                      )}
                    </div>

                    {log.details && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xl line-clamp-2">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Timestamp */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-slate-400">
                    {formatRelativeTime(log.timestamp)}
                  </span>
                  {log.ip && (
                    <p className="text-[10px] font-mono text-slate-500 hidden sm:block mt-0.5">
                      {log.ip}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-white/5 flex items-center justify-center gap-4 text-xs font-semibold text-slate-300 border-t border-white/10">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
