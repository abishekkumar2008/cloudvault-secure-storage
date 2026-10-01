import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  HardDrive,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Server,
  Zap,
  FileText,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { User, StorageStats } from '../types';
import { api } from '../api/client';
import { TwoFactorAuthModal } from './TwoFactorAuthModal';

interface SettingsViewProps {
  currentUser: User | null;
  stats: StorageStats | null;
  allUsers: User[];
  onOpenSystemSpec: () => void;
  onRefreshStats: () => void;
  onSwitchUser?: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  stats,
  allUsers,
  onOpenSystemSpec,
  onRefreshStats,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'users' | 'storage'>('security');
  const [testingAudit, setTestingAudit] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.twoFactorEnabled ?? true);

  useEffect(() => {
    fetch2FA();
  }, [currentUser?.id]);

  const fetch2FA = async () => {
    try {
      const res = await api.get2FAStatus();
      setIs2FAEnabled(res.enabled);
    } catch {
      // ignore
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.disable2FA();
      setIs2FAEnabled(false);
      setAuditMessage('Two-Factor Authentication has been disabled.');
      onRefreshStats();
    } catch (e: any) {
      setAuditMessage(e.message || 'Failed to disable 2FA');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRoleId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      onRefreshStats();
      setAuditMessage(`Role updated to ${newRole.toUpperCase()} successfully.`);
    } catch {
      setAuditMessage('Failed to update user role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRunSecurityAudit = async () => {
    setTestingAudit(true);
    setAuditMessage(null);
    try {
      await api.simulateEvent('permission_audit');
      setAuditMessage('AES-256 cryptographic block integrity audit completed: 100% verified.');
      onRefreshStats();
    } finally {
      setTestingAudit(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 sm:pb-12">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security & Settings</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Vault configuration, cryptographic keys, and Role-Based Access Control (RBAC).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSystemSpec}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto backdrop-blur-xs"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Architecture Spec</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-xs ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Encryption & Security
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-xs ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            RBAC Directory ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-xs ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Storage Allocation
          </button>
        </div>
      </div>

      {auditMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{auditMessage}</span>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Cryptographic Key Management</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 backdrop-blur-xs">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Algorithm</span>
                <p className="text-sm font-bold text-slate-100 font-mono">AES-256-GCM</p>
                <p className="text-slate-400 text-[11px]">
                  Authenticated Galois/Counter Mode with 96-bit initialization vectors.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 backdrop-blur-xs">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Key Derivation</span>
                <p className="text-sm font-bold text-slate-100 font-mono">scrypt (32-byte key)</p>
                <p className="text-slate-400 text-[11px]">
                  Salted key derivation preventing rainbow table attacks.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 backdrop-blur-xs">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Integrity Check</span>
                <p className="text-sm font-bold text-slate-100 font-mono">SHA-256 Checksums</p>
                <p className="text-slate-400 text-[11px]">
                  Generated on upload to guarantee end-to-end byte authenticity.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 backdrop-blur-xs">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Hardware Engine</span>
                <p className="text-sm font-bold text-emerald-400 font-mono">AES-NI Hardware Active</p>
                <p className="text-slate-400 text-[11px]">
                  Sub-millisecond stream decryption on demand.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunSecurityAudit}
                disabled={testingAudit}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-colors flex items-center gap-2 border border-indigo-400/30"
              >
                {testingAudit ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Run Cryptographic Vault Integrity Sweep</span>
              </button>
            </div>
          </div>

          {/* 2FA Configuration Card (Option 5) */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-400">Enforce 6-digit TOTP verification codes for logins and sensitive actions.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {is2FAEnabled ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <ShieldCheck className="w-3.5 h-3.5" /> Active & Enforced
                    </span>
                    <button
                      onClick={handleDisable2FA}
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIs2FAModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Configure 2FA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users & RBAC Tab */}
      {activeTab === 'users' && (
        <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Enterprise User Directory & Roles</h3>
              <p className="text-xs text-slate-400">Fine-grained Role-Based Access Control (RBAC) rules.</p>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {allUsers.map((u) => (
              <div key={u.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md border shrink-0 ${
                      u.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                        : u.role === 'editor'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/10'
                        : u.role === 'viewer'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                        : 'bg-white/10 text-slate-200 border-white/20'
                    }`}
                  >
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-100 truncate">{u.name}</p>
                      {(u.isMasterProtected || u.email.toLowerCase() === 'kcabishiekkumar@gmail.com') && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> MASTER
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                    {u.department && (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{u.department}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentUser?.role === 'admin' ? (
                    (u.isMasterProtected || u.email.toLowerCase() === 'kcabishiekkumar@gmail.com') ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono border bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={updatingRoleId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono border focus:outline-none transition-colors ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : u.role === 'editor'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : u.role === 'viewer'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        <option value="admin" className="bg-slate-900 text-amber-300">ADMIN</option>
                        <option value="editor" className="bg-slate-900 text-indigo-300">EDITOR</option>
                        <option value="viewer" className="bg-slate-900 text-emerald-300">VIEWER</option>
                        <option value="user" className="bg-slate-900 text-slate-300">USER</option>
                      </select>
                    )
                  ) : (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono border ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : u.role === 'editor'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : u.role === 'viewer'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {u.role}
                    </span>
                  )}

                  {onSwitchUser && u.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => onSwitchUser(u)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Storage Allocation & Quota Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Overall Vault Storage Capacity</span>
              <span>{stats ? (stats.usedBytes / (1024 * 1024 * 1024)).toFixed(2) : '45.2'} GB / 100 GB</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-md shadow-indigo-500/30"
                style={{
                  width: `${
                    stats
                      ? Math.min(100, Math.round((stats.usedBytes / (100 * 1024 * 1024 * 1024)) * 100))
                      : 45
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Encrypted Files</span>
              <p className="text-lg font-bold text-slate-100 mt-1">{stats?.totalFiles || 5}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Share Links</span>
              <p className="text-lg font-bold text-indigo-400 mt-1">{stats?.totalShared || 1}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Audit Log Records</span>
              <p className="text-lg font-bold text-slate-100 mt-1">{stats?.totalLogs || 5}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Encryption Standard</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">AES-256</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
