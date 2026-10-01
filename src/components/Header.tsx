import React, { useState } from 'react';
import {
  Cloud,
  Search,
  Shield,
  LogOut,
  FileText,
  ChevronDown,
  Check,
  Folder,
  Share2,
  Users,
  ShieldCheck,
  Flame,
  History,
  Settings,
  Lock,
} from 'lucide-react';
import { User, AppTab } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onOpenSystemSpec: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUser,
  allUsers,
  onOpenSystemSpec,
  searchQuery,
  setSearchQuery,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isMaster =
    currentUser?.isMasterProtected ||
    currentUser?.email.toLowerCase() === 'kcabishiekkumar@gmail.com' ||
    currentUser?.email.toLowerCase() === 'bothanapriyabothana@gmail.com' ||
    currentUser?.name.toLowerCase().includes('abishek') ||
    currentUser?.name.toUpperCase().includes('BOTHANA');

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'editor':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'viewer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const navTabs: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'files', label: 'Vault', icon: Folder },
    { id: 'shared', label: 'Shared', icon: Share2 },
    { id: 'accounts', label: 'Login IDs', icon: Users },
    { id: 'shield', label: 'Shield', icon: ShieldCheck },
    { id: 'secrets', label: 'Burner Vault', icon: Flame },
    { id: 'logs', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('files')}
              className="flex items-center gap-3 group focus:outline-none"
              id="cloudvault-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:bg-indigo-500 transition-colors">
                <Cloud className="w-6 h-6 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-white">CloudVault</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AES-256
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:inline">
                  Enterprise Encrypted Storage
                </span>
              </div>
            </button>

            {/* System Spec Quick Button */}
            <button
              onClick={onOpenSystemSpec}
              id="view-system-spec-btn"
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-indigo-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-colors ml-1 backdrop-blur-xs"
              title="View Architecture Specification"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Spec</span>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    id={`header-tab-${tab.id}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.id === 'secrets' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-xs shadow-rose-400/50" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Search Bar (Tablet / Desktop) */}
          <div className="flex-1 max-w-xs hidden xl:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                id="global-search-input"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-100 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  id="user-profile-menu-btn"
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition-colors focus:outline-none"
                >
                  <div
                    className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-md border shrink-0 ${
                      isMaster
                        ? 'bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-400/40 shadow-amber-500/20'
                        : 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400/30 shadow-indigo-500/25'
                    }`}
                  >
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[100px]">
                        {currentUser.name}
                      </span>
                      {isMaster ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> MASTER
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                            currentUser.role
                          )}`}
                        >
                          {currentUser.role.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    id="user-dropdown-menu"
                  >
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Session</p>
                        {isMaster && (
                          <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Master Protected
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/10">
                        <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{currentUser.department || 'Enterprise Member'}</span>
                      </div>
                    </div>

                    {/* Quick navigation links in dropdown */}
                    <div className="px-2 py-1.5 border-b border-white/10 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('accounts');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Manage Login IDs Registry</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('shield');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Zero-Trust Shield & Audit</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('secrets');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>Burner Ephemeral Vault</span>
                      </button>
                    </div>

                    {/* Switch User (RBAC demo) */}
                    <div className="px-2 py-2 border-b border-white/10">
                      <p className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Switch Identity / Login ID
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {allUsers.map((u) => {
                          const isUserMaster =
                            u.isMasterProtected ||
                            u.email.toLowerCase() === 'kcabishiekkumar@gmail.com' ||
                            u.email.toLowerCase() === 'bothanapriyabothana@gmail.com' ||
                            u.name.toLowerCase().includes('abishek') ||
                            u.name.toUpperCase().includes('BOTHANA');
                          return (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u);
                                setShowUserMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                                u.id === currentUser.id
                                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-medium'
                                  : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isUserMaster
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-white/10 text-slate-200'
                                  }`}
                                >
                                  {u.name[0]}
                                </div>
                                <span className="truncate">{u.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono border border-white/10">
                                  {u.role}
                                </span>
                                {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        id="logout-button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of CloudVault</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium">Enterprise Security</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
