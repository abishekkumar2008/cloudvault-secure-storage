import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ShareSecureView } from './components/ShareSecureView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { SettingsView } from './components/SettingsView';
import { AccountsView } from './components/AccountsView';
import { ShieldView } from './components/ShieldView';
import { SecretsView } from './components/SecretsView';
import { UploadModal } from './components/UploadModal';
import { SystemSpecModal } from './components/SystemSpecModal';
import { PublicShareModal } from './components/PublicShareModal';
import { BottomNav } from './components/BottomNav';
import { api, getStoredUser, getStoredToken, clearAuthSession, setAuthSession } from './api/client';
import { User, FileItem, StorageStats, AppTab } from './types';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App Navigation & Selected State
  const [activeTab, setActiveTab] = useState<AppTab>('files');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSystemSpecOpen, setIsSystemSpecOpen] = useState(false);
  const [testShareToken, setTestShareToken] = useState<string | null>(null);

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const stored = getStoredUser();
      const token = getStoredToken();
      if (stored && token) {
        try {
          const me = await api.getMe();
          setCurrentUser(me.user);
          setAuthSession(token, me.user);
        } catch {
          setCurrentUser(stored);
        }
      } else {
        // Auto-login with Abishek Kumar (Admin) for instant live preview interactivity
        try {
          const res = await api.switchUser(undefined, 'kcabishiekkumar@gmail.com');
          setCurrentUser(res.user);
        } catch {
          try {
            const res = await api.switchUser(undefined, 'priya.sharma@enterprise.com');
            setCurrentUser(res.user);
          } catch {
            // fallback to null
          }
        }
      }
    } catch {
      clearAuthSession();
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, searchQuery, selectedCategory, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [filesRes, statsRes, usersRes] = await Promise.all([
        api.getFiles(searchQuery, selectedCategory),
        api.getStats(),
        api.getUsers(),
      ]);

      if (activeTab === 'shared') {
        // Filter for files with active share links or shared collaborators
        const sharedFiles = filesRes.files.filter(
          (f) =>
            (f.shareLinkCount && f.shareLinkCount > 0) ||
            f.collaborators.some((c) => c.email !== currentUser?.email)
        );
        setFiles(sharedFiles);
      } else {
        setFiles(filesRes.files);
      }

      setStats(statsRes);
      setAllUsers(usersRes.users);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setSelectedFile(null);
    showToast('Signed out of CloudVault.');
  };

  const handleSwitchUser = async (targetUser: User) => {
    try {
      const res = await api.switchUser(targetUser.id, targetUser.email);
      setCurrentUser(res.user);
      setSelectedFile(null);
      showToast(`Switched active profile to ${res.user.name} (${res.user.role.toUpperCase()})`);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to switch user', 'error');
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    try {
      await api.downloadFile(file.id, file.name);
      showToast(`Decrypted & downloaded ${file.name}`);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Download failed', 'error');
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    try {
      await api.deleteFile(file.id);
      showToast(`Deleted ${file.name} from vault`);
      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      }
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleUploadSuccess = (newFile: FileItem) => {
    showToast(`Encrypted & uploaded ${newFile.name} with AES-256`);
    setSelectedCategory('all');
    setSearchQuery('');
    setFiles((prev) => [newFile, ...prev.filter((f) => f.id !== newFile.id)]);
    fetchDashboardData();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_60%)] pointer-events-none" />
        <div className="text-center space-y-3 z-10">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Initializing CloudVault Security Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none -z-0" />
      <div className="fixed top-1/4 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-1/4 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              toastMessage.type === 'success'
                ? 'bg-slate-900/90 text-white border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/30 shadow-rose-500/10'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedFile(null);
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onOpenSystemSpec={() => setIsSystemSpecOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {!currentUser ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : selectedFile ? (
          <ShareSecureView
            file={selectedFile}
            currentUser={currentUser}
            onBack={() => setSelectedFile(null)}
            onDownload={handleDownloadFile}
            onDelete={handleDeleteFile}
            onTestPublicShare={(token) => setTestShareToken(token)}
          />
        ) : activeTab === 'accounts' ? (
          <AccountsView
            currentUser={currentUser}
            allUsers={allUsers}
            onRefreshUsers={fetchDashboardData}
            onShowToast={showToast}
            onSwitchUser={handleSwitchUser}
          />
        ) : activeTab === 'shield' ? (
          <ShieldView
            currentUser={currentUser}
            onShowToast={showToast}
          />
        ) : activeTab === 'secrets' ? (
          <SecretsView
            currentUser={currentUser}
            onShowToast={showToast}
          />
        ) : activeTab === 'logs' ? (
          <ActivityLogsView onRefresh={fetchDashboardData} />
        ) : activeTab === 'settings' ? (
          <SettingsView
            currentUser={currentUser}
            stats={stats}
            allUsers={allUsers}
            onOpenSystemSpec={() => setIsSystemSpecOpen(true)}
            onRefreshStats={fetchDashboardData}
            onSwitchUser={handleSwitchUser}
          />
        ) : (
          <DashboardView
            files={files}
            stats={stats}
            currentUser={currentUser}
            onSelectFile={(f) => setSelectedFile(f)}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={handleDeleteFile}
            onOpenUpload={() => setIsUploadOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      {currentUser && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedFile(null);
            setActiveTab(tab);
          }}
          logsCount={stats?.totalLogs}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* System Spec Modal (Matching Screen 2) */}
      <SystemSpecModal
        isOpen={isSystemSpecOpen}
        onClose={() => setIsSystemSpecOpen(false)}
      />

      {/* Public Share Link Preview & Download Test Modal */}
      <PublicShareModal
        token={testShareToken}
        onClose={() => setTestShareToken(null)}
      />
    </div>
  );
}
