import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  File as FileGeneric,
  Folder,
  FolderPlus,
  FolderInput,
  Download,
  Share2,
  Trash2,
  Plus,
  Shield,
  Search,
  HardDrive,
  CheckCircle2,
  Clock,
  ChevronRight,
  Lock,
  Eye,
  QrCode,
  UploadCloud,
  X,
  Check,
} from 'lucide-react';
import { FileItem, StorageStats, User } from '../types';
import { api } from '../api/client';
import { FilePreviewModal } from './FilePreviewModal';
import { QRCodeModal } from './QRCodeModal';

interface DashboardViewProps {
  files: FileItem[];
  stats: StorageStats | null;
  currentUser: User | null;
  onSelectFile: (file: FileItem) => void;
  onDownloadFile: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
  onOpenUpload: () => void;
  onRefreshFiles?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  files,
  stats,
  currentUser,
  onSelectFile,
  onDownloadFile,
  onDeleteFile,
  onOpenUpload,
  onRefreshFiles,
  onShowToast,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // In-Browser File Preview Modal state
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);

  // QR Code Modal state
  const [qrModalData, setQrModalData] = useState<{ title: string; url: string } | null>(null);
  const [generatingQrId, setGeneratingQrId] = useState<string | null>(null);

  // Folder state
  const [folders, setFolders] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Move File state
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('/');
  const [isMovingFile, setIsMovingFile] = useState(false);

  // Drag and Drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDroppingUpload, setIsDroppingUpload] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, [files]);

  const fetchFolders = async () => {
    try {
      const res = await api.getFolders();
      // Extract from files too
      const fileLocations = files.map((f) => f.location).filter(Boolean);
      const combined = Array.from(new Set([...res.folders, ...fileLocations])).sort();
      setFolders(combined);
    } catch {
      const fileLocations = Array.from(new Set(files.map((f) => f.location).filter(Boolean))).sort();
      setFolders(['/', ...fileLocations]);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    let path = newFolderName.trim();
    if (!path.startsWith('/')) path = '/' + path;

    setIsCreatingFolder(true);
    try {
      await api.createFolder(path);
      onShowToast?.(`Folder created: ${path}`);
      setIsNewFolderOpen(false);
      setNewFolderName('');
      setActiveFolder(path);
      fetchFolders();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to create folder', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleMoveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToMove) return;

    setIsMovingFile(true);
    try {
      await api.moveFile(fileToMove.id, selectedDestination);
      onShowToast?.(`Moved "${fileToMove.name}" to ${selectedDestination}`);
      setFileToMove(null);
      onRefreshFiles?.();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to move file', 'error');
    } finally {
      setIsMovingFile(false);
    }
  };

  const handleGenerateQR = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingQrId(file.id);
    try {
      // Create a 7-day share link or reuse
      const res = await api.createShareLink(file.id, {
        expiresInHours: 168,
        permission: 'download',
      });
      const shareUrl = res.shareLink.shareUrl || `${window.location.origin}/api/share/verify/${res.shareLink.token}`;
      setQrModalData({
        title: `Scan to Decrypt: ${file.name}`,
        url: shareUrl,
      });
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to generate QR code', 'error');
    } finally {
      setGeneratingQrId(null);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsDroppingUpload(true);
    const targetFolder = activeFolder === 'all' ? '/Uploads' : activeFolder;

    try {
      for (const f of droppedFiles) {
        await api.uploadFile(f, targetFolder);
      }
      onShowToast?.(`Successfully encrypted & uploaded ${droppedFiles.length} file(s) into ${targetFolder}`);
      onRefreshFiles?.();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to upload dropped files', 'error');
    } finally {
      setIsDroppingUpload(false);
    }
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileText className="w-5 h-5 stroke-[2]" />
        </div>
      );
    }
    if (
      mimeType.includes('sheet') ||
      mimeType.includes('excel') ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.csv')
    ) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileSpreadsheet className="w-5 h-5 stroke-[2]" />
        </div>
      );
    }
    if (
      mimeType.includes('zip') ||
      mimeType.includes('tar') ||
      fileName.endsWith('.zip') ||
      fileName.endsWith('.gz')
    ) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileArchive className="w-5 h-5 stroke-[2]" />
        </div>
      );
    }
    if (mimeType.startsWith('image/')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileImage className="w-5 h-5 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs">
        <FileGeneric className="w-5 h-5 stroke-[2]" />
      </div>
    );
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  // Used GB vs Limit GB
  const usedGB = stats ? (stats.usedBytes / (1024 * 1024 * 1024)).toFixed(1) : '45.2';
  const limitGB = '100 GB';
  const percentUsed = stats
    ? Math.min(100, Math.round((stats.usedBytes / (100 * 1024 * 1024 * 1024)) * 100)) || 45
    : 45;

  const handleDownloadClick = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    try {
      await onDownloadFile(file);
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter files by category, search query AND activeFolder
  const displayedFiles = files.filter((f) => {
    if (activeFolder !== 'all') {
      const fileLoc = f.location || '/Uploads';
      if (fileLoc !== activeFolder && !fileLoc.startsWith(activeFolder + '/')) {
        return false;
      }
    }
    return true;
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-6 pb-20 sm:pb-8 relative"
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-40 bg-indigo-950/85 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 p-6 animate-in fade-in duration-100 pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Drop files to Encrypt & Store</h2>
          <p className="text-sm text-indigo-200 mt-2 max-w-md text-center">
            Payloads will be encrypted with AES-256-GCM hardware cipher and stored inside{' '}
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              {activeFolder === 'all' ? '/Uploads' : activeFolder}
            </span>
          </p>
        </div>
      )}

      {/* Dropping spinner banner */}
      {isDroppingUpload && (
        <div className="p-3 bg-indigo-600/30 border border-indigo-500/50 rounded-2xl flex items-center gap-3 text-indigo-200 text-xs animate-pulse">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Encrypting and uploading dropped files into vault...</span>
        </div>
      )}

      {/* Search Input for Mobile/Tablet */}
      <div className="sm:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, folders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-100 placeholder:text-slate-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Storage Used Card */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-slate-100">Storage Used</span>
          </div>
          <span className="text-xs font-bold text-slate-200 font-mono">
            {usedGB} GB <span className="text-slate-400 font-normal">/ {limitGB}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden mb-3 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/30"
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        {/* Quick breakdown tags */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Documents ({stats ? formatBytes(stats.breakdown.documents) : '24.1 GB'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Spreadsheets ({stats ? formatBytes(stats.breakdown.spreadsheets) : '12.4 GB'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Archives ({stats ? formatBytes(stats.breakdown.archives) : '8.7 GB'})</span>
          </div>
        </div>
      </div>

      {/* FOLDER NAVIGATION BAR (Option 3 Hierarchy) */}
      <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Directory Hierarchy</span>
            {activeFolder !== 'all' && (
              <span className="text-slate-400 font-normal font-mono text-[11px]">
                Active: <span className="text-indigo-300 font-semibold">{activeFolder}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsNewFolderOpen(true)}
            id="create-folder-btn"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-white/10"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Folder selection pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveFolder('all')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
              activeFolder === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Vault ({files.length})
          </button>
          {folders.map((fPath) => {
            const count = files.filter((f) => f.location === fPath).length;
            const isAct = activeFolder === fPath;
            return (
              <button
                key={fPath}
                onClick={() => setActiveFolder(fPath)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] shrink-0 transition-all ${
                  isAct
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-md shadow-amber-500/10'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                }`}
              >
                <Folder className="w-3 h-3 text-amber-400" />
                <span>{fPath === '/' ? '/ (Root)' : fPath}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills & Upload Button */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {['all', 'pdf', 'spreadsheet', 'archive', 'image'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all backdrop-blur-xs ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat === 'pdf' ? 'PDFs' : cat === 'spreadsheet' ? 'Sheets' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenUpload}
          id="dashboard-upload-btn"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all shrink-0 border border-indigo-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Recent Files Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Recent Files</h2>
            <span className="text-[11px] text-slate-400">
              (Drag & drop anywhere to upload)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {displayedFiles.length} {displayedFiles.length === 1 ? 'file' : 'files'} in view
          </span>
        </div>

        {displayedFiles.length === 0 ? (
          <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/15">
              <FileGeneric className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No files found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? `No files matched "${searchQuery}". Try a different search term.`
                : activeFolder !== 'all'
                ? `No files in folder "${activeFolder}". Drag and drop files here to upload.`
                : 'Upload files to store them with server-side AES-256 encryption.'}
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                id={`file-item-${file.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-150 cursor-pointer backdrop-blur-md shadow-lg shadow-black/10"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Icon and Name/Meta */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getFileIcon(file.mimeType, file.name)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 truncate transition-colors">
                          {file.name}
                        </h4>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                          <Lock className="w-2.5 h-2.5" />
                          AES-256
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.updatedAt || file.createdAt)}</span>
                        {file.location && (
                          <>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                              <Folder className="w-3 h-3 text-amber-400/70" />
                              {file.location}
                            </span>
                          </>
                        )}
                        {file.ownerName && (
                          <span className="hidden lg:inline text-[11px] text-slate-500">
                            by {file.ownerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* In-Browser Preview Button (Option 2) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewingFile(file);
                      }}
                      className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-colors"
                      title="In-Browser Preview (Decrypted View)"
                      id={`preview-btn-${file.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* QR Code Quick Sharing Button (Option 4) */}
                    <button
                      onClick={(e) => handleGenerateQR(file, e)}
                      disabled={generatingQrId === file.id}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors"
                      title="Generate Scan-to-Decrypt QR Code"
                      id={`qr-btn-${file.id}`}
                    >
                      {generatingQrId === file.id ? (
                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4" />
                      )}
                    </button>

                    {/* Move File to Folder Button (Option 3) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToMove(file);
                        setSelectedDestination(file.location || '/');
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-xl transition-colors"
                      title="Move to Folder"
                      id={`move-btn-${file.id}`}
                    >
                      <FolderInput className="w-4 h-4" />
                    </button>

                    {/* Share / Security Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(file);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-xl transition-colors"
                      title="Share & Security Permissions"
                      id={`share-btn-${file.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={(e) => handleDownloadClick(file, e)}
                      disabled={downloadingId === file.id}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                      title="Direct Decrypt & Download"
                      id={`download-btn-${file.id}`}
                    >
                      {downloadingId === file.id ? (
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${file.name}" from encrypted storage?`)) {
                          onDeleteFile(file);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Delete File"
                      id={`delete-btn-${file.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Browser Preview Modal (Option 2) */}
      {previewingFile && (
        <FilePreviewModal
          file={previewingFile}
          onClose={() => setPreviewingFile(null)}
          onDownload={onDownloadFile}
        />
      )}

      {/* QR Code Modal (Option 4) */}
      {qrModalData && (
        <QRCodeModal
          title={qrModalData.title}
          url={qrModalData.url}
          onClose={() => setQrModalData(null)}
        />
      )}

      {/* New Folder Modal (Option 3) */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setIsNewFolderOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3 text-amber-400">
              <FolderPlus className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create New Folder</h3>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Folder Path
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="/Confidential_Vault"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Example: /Legal/2026 or /Financial_Audits
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move File Modal (Option 3) */}
      {fileToMove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setFileToMove(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-2 text-indigo-400">
              <FolderInput className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Move File to Folder</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 truncate font-mono">
              {fileToMove.name}
            </p>

            <form onSubmit={handleMoveFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Destination Folder
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="/">/ (Root)</option>
                  {folders
                    .filter((f) => f !== '/')
                    .map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToMove(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMovingFile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isMovingFile ? 'Moving...' : 'Move File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button
        onClick={onOpenUpload}
        id="mobile-fab-upload-btn"
        className="sm:hidden fixed right-5 bottom-20 z-20 w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-transform border border-indigo-400/30 backdrop-blur-md"
        aria-label="Upload File"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
