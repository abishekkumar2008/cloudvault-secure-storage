import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Trash2,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  HardDrive,
  KeyRound,
  UserPlus,
  RefreshCw,
  ShieldAlert,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api/client';

interface AccountsViewProps {
  currentUser: User | null;
  allUsers: User[];
  onRefreshUsers: () => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onSwitchUser: (user: User) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  currentUser,
  allUsers,
  onRefreshUsers,
  onShowToast,
  onSwitchUser,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer' | 'user'>('user');
  const [newDepartment, setNewDepartment] = useState('Product Operations');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isMasterUser = (u: User) => {
    const email = (u.email || '').toLowerCase().trim();
    const name = (u.name || '').trim();
    return (
      u.isMasterProtected === true ||
      email === 'kcabishiekkumar@gmail.com' ||
      email === 'bothanapriyabothana@gmail.com' ||
      name.toLowerCase().includes('abishek') ||
      name.toUpperCase() === 'BOTHANA' ||
      name.toUpperCase().includes('BOTHANA')
    );
  };

  const filteredUsers = allUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchesQuery =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (isMasterUser(userToDelete)) {
      onShowToast(
        `Action Denied: Protected Administrator account (${userToDelete.name}) is permanently protected and cannot be deleted.`,
        'error'
      );
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteUser(userToDelete.id);
      onShowToast(`Permanently deleted login ID: ${userToDelete.email}`);
      setUserToDelete(null);
      onRefreshUsers();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePurgeAllExceptMaster = async () => {
    setIsPurging(true);
    try {
      const res = await api.purgeNonMasterUsers();
      onShowToast(`Wiped ${res.purgedCount} guest login IDs. Protected Administrators (Abishek & BOTHANA) are retained.`);
      setIsPurgeModalOpen(false);
      onRefreshUsers();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to purge guest accounts', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      onShowToast('Name and email are required', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await api.createUser({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
        department: newDepartment,
      });
      onShowToast(`Provisioned new Login ID for ${newEmail}`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('password123');
      onRefreshUsers();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to create login ID', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'editor':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'viewer':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatLastLogin = (iso?: string) => {
    if (!iso) return 'Never logged in';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const masterAccount = allUsers.find(isMasterUser);

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 border border-indigo-400/30">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">Login IDs & Session Registry</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Zero-Trust Access
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Centralized security directory storing all Login IDs authenticated into this CloudVault node.
              Manage credentials, inspect active IPs and session counters, or permanently purge unauthorized accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onRefreshUsers()}
            id="refresh-login-ids-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
            title="Refresh login list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="add-login-id-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Login ID</span>
          </button>

          <button
            onClick={() => setIsPurgeModalOpen(true)}
            id="purge-guest-accounts-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-all"
            title="Purge all other accounts and keep protected administrators Abishek & BOTHANA"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Except Admins</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Login IDs */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Login IDs</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">{allUsers.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Identities stored in vault</p>
        </div>

        {/* Card 2: Protected Master & Co-Admin Accounts */}
        <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Protected Administrators</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm font-bold text-amber-200 mt-2 truncate">
            Abishek Kumar & BOTHANA
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-300/80 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Dual Admin Protection (Immune)</span>
          </div>
        </div>

        {/* Card 3: Active Administrators */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Privileged Roles</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {allUsers.filter((u) => u.role === 'admin').length}{' '}
            <span className="text-xs font-normal text-slate-400">Admins</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {allUsers.filter((u) => u.role !== 'admin').length} Editors & Viewers
          </p>
        </div>

        {/* Card 4: Deletion Protection Status */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security Policy</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Defense Engine Active
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Abishek & BOTHANA permanently protected
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by login email, name, department..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 backdrop-blur-md"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">Role Filter:</span>
          {['all', 'admin', 'editor', 'viewer', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Login IDs Registry Table / Cards */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">User & Login Identifier</th>
                <th className="py-3 px-4">Protection & Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Last Login & Station</th>
                <th className="py-3 px-4 text-center">Login Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isMaster = isMasterUser(u);
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-white/5 transition-colors ${
                      isMaster ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* User & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                            isMaster
                              ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white border border-amber-400/40 shadow-amber-500/20'
                              : 'bg-white/10 text-slate-200 border border-white/10'
                          }`}
                        >
                          {u.name ? u.name.substring(0, 2).toUpperCase() : 'ID'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white truncate">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-slate-400 text-[11px] font-mono truncate">{u.email}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(u.email);
                                setCopiedId(u.id);
                                setTimeout(() => setCopiedId(null), 2000);
                                onShowToast(`Copied Login ID: ${u.email}`);
                              }}
                              className="p-0.5 text-slate-500 hover:text-indigo-300 transition-colors"
                              title="Copy Login ID"
                            >
                              {copiedId === u.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Protection & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {isMaster ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/20">
                            <Lock className="w-3 h-3" /> Master Protected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" /> Standard ID
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                          {u.twoFactorEnabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                              <ShieldCheck className="w-2.5 h-2.5" /> 2FA Active
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="truncate block max-w-[150px]">
                        {u.department || 'General Member'}
                      </span>
                    </td>

                    {/* Last Login & IP */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-[11px]">
                        <span className="text-slate-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          {formatLastLogin(u.lastLogin)}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1 mt-0.5">
                          <Globe className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          {u.lastLoginIp || '127.0.0.1 (Direct)'}
                        </span>
                      </div>
                    </td>

                    {/* Login Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-semibold text-slate-200">
                        {u.loginCount || 1}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Switch user button for quick test */}
                        {!isCurrent && (
                          <button
                            onClick={() => onSwitchUser(u)}
                            className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-lg transition-colors"
                            title={`Switch session to ${u.name}`}
                          >
                            Switch To
                          </button>
                        )}

                        {/* Delete Button */}
                        {isMaster ? (
                          <div
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-300/80 rounded-lg border border-amber-500/20 text-[11px] cursor-not-allowed select-none"
                            title={`Protected Administrator (${u.name}) is permanently immune and cannot be deleted.`}
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>Protected</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setUserToDelete(u)}
                            id={`delete-user-${u.id}`}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                            title={`Delete Login ID (${u.email})`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No login IDs match your query</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search keywords or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Delete Single Login ID */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setUserToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete Login ID</h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to permanently delete this login identifier from CloudVault?
              </p>
              <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <p className="text-xs font-semibold text-white">{userToDelete.name}</p>
                <p className="text-xs font-mono text-slate-400">{userToDelete.email}</p>
                <p className="text-[11px] text-slate-400">
                  Role: <span className="uppercase text-slate-200">{userToDelete.role}</span> &bull; Logins: {userToDelete.loginCount || 1}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                id="confirm-delete-login-id-btn"
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Purge All Except Master */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsPurgeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Purge All Login IDs Except Protected Admins</h3>
              <p className="text-xs text-slate-300 mt-1">
                This will delete every non-admin account from the database. Protected Administrators{' '}
                <span className="font-semibold text-amber-300">Abishek (kcabishiekkumar@gmail.com)</span> and{' '}
                <span className="font-semibold text-amber-300">BOTHANA (bothanapriyabothana@gmail.com)</span> will remain protected and active.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                disabled={isPurging}
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllExceptMaster}
                id="confirm-purge-all-except-master-btn"
                disabled={isPurging}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging Accounts...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Purge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Login ID */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add New Login ID</h3>
                <p className="text-xs text-slate-400">Provision credentials to access the encrypted vault</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Login ID</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. rachel.a@company.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-login-id-btn"
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Provision Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
