import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File as FileGeneric,
  Shield,
  Lock,
  Copy,
  Check,
  Download,
  Share2,
  Trash2,
  UserPlus,
  Clock,
  Key,
  ExternalLink,
  ChevronDown,
  Eye,
  AlertCircle,
  Hash,
  QrCode,
} from 'lucide-react';
import { FileItem, ShareLink, User } from '../types';
import { api } from '../api/client';
import { FilePreviewModal } from './FilePreviewModal';
import { QRCodeModal } from './QRCodeModal';

interface ShareSecureViewProps {
  file: FileItem;
  currentUser: User | null;
  onBack: () => void;
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onTestPublicShare: (shareToken: string) => void;
}

export const ShareSecureView: React.FC<ShareSecureViewProps> = ({
  file: initialFile,
  currentUser,
  onBack,
  onDownload,
  onDelete,
  onTestPublicShare,
}) => {
  const [file, setFile] = useState<FileItem>(initialFile);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [clientEncryptionActive, setClientEncryptionActive] = useState(true);

  // New Share Link form state
  const [expiresInHours, setExpiresInHours] = useState<number | null>(168); // 7 days default
  const [sharePassword, setSharePassword] = useState('');
  const [maxDownloads, setMaxDownloads] = useState<string>('50');
  const [creatingLink, setCreatingLink] = useState(false);

  // Add collaborator form state
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState<'editor' | 'viewer'>('viewer');
  const [addingCollab, setAddingCollab] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    fetchFileDetails();
  }, [initialFile.id]);

  const fetchFileDetails = async () => {
    try {
      setLoadingLinks(true);
      const res = await api.getFile(initialFile.id);
      setFile(res.file);
      setShareLinks(res.shareLinks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleCreateShareLink = async () => {
    setCreatingLink(true);
    setErrorMsg(null);
    try {
      const res = await api.createShareLink(file.id, {
        expiresInHours: expiresInHours,
        password: sharePassword.trim() || undefined,
        maxDownloads: maxDownloads ? parseInt(maxDownloads, 10) : null,
        permission: 'download',
      });
      setShareLinks([res.shareLink, ...shareLinks]);
      setSharePassword('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to generate share link');
    } finally {
      setCreatingLink(false);
    }
  };

  const primaryShareLink =
    shareLinks.length > 0
      ? shareLinks[0]
      : {
          token: '8k39f0a1',
          shareUrl: `${window.location.origin}/api/share/verify/8k39f0a1`,
        };

  const fullShareUrl =
    shareLinks.length > 0 && shareLinks[0].shareUrl
      ? shareLinks[0].shareUrl
      : `${window.location.origin}/api/share/verify/8k39f0a1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyChecksum = () => {
    if (file.checksum) {
      navigator.clipboard.writeText(file.checksum);
      setCopiedChecksum(true);
      setTimeout(() => setCopiedChecksum(false), 2000);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;
    setAddingCollab(true);
    setErrorMsg(null);
    try {
      const res = await api.updatePermissions(file.id, collabEmail.trim(), collabRole, 'add');
      setFile({ ...file, collaborators: res.collaborators });
      setCollabEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add collaborator');
    } finally {
      setAddingCollab(false);
    }
  };

  const handleUpdateCollabRole = async (email: string, newRole: string) => {
    try {
      const res = await api.updatePermissions(file.id, email, newRole, 'update');
      setFile({ ...file, collaborators: res.collaborators });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update role');
    }
  };

  const handleRemoveCollaborator = async (email: string) => {
    try {
      const res = await api.updatePermissions(file.id, email, 'viewer', 'remove');
      setFile({ ...file, collaborators: res.collaborators });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove collaborator');
    }
  };

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      await onDownload(file);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const getFileIcon = () => {
    if (file.mimeType.includes('pdf') || file.name.endsWith('.pdf')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (file.mimeType.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (file.mimeType.includes('zip') || file.name.endsWith('.zip')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
          <FileArchive className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs">
        <FileGeneric className="w-6 h-6 stroke-[2]" />
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 sm:pb-12">
      {/* Navigation Back */}
      <button
        onClick={onBack}
        id="back-to-files-btn"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-indigo-300 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 transition-colors backdrop-blur-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Files</span>
      </button>

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* File Header Banner */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {getFileIcon()}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-100 truncate tracking-tight">{file.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Last modified{' '}
                {new Date(file.updatedAt || file.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            id="share-preview-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>In-Browser Preview</span>
          </button>
        </div>
      </div>

      {/* File Information Card */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Information</h3>
        <div className="divide-y divide-white/10 text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Size</span>
            <span className="font-semibold text-slate-200 font-mono">{formatFileSize(file.size)}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Type</span>
            <span className="font-semibold text-slate-200">
              {file.mimeType.includes('pdf')
                ? 'PDF Document'
                : file.mimeType.includes('sheet')
                ? 'Spreadsheet / XLSX'
                : file.mimeType.includes('zip')
                ? 'Compressed Archive (ZIP)'
                : file.mimeType}
            </span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Owner</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {file.ownerName.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200">{file.ownerName}</span>
            </div>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Location</span>
            <span className="font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              {file.location || '/'}
            </span>
          </div>
          {file.checksum && (
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400 font-medium">SHA-256 Digest</span>
              <button
                onClick={handleCopyChecksum}
                className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 px-2 py-1 rounded-lg border border-indigo-500/30"
                title="Click to copy hash"
              >
                <Hash className="w-3 h-3" />
                <span>{file.checksum.substring(0, 16)}...</span>
                {copiedChecksum ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-md space-y-3.5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Security</h3>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-100">Client-side & Server Encryption</h4>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                AES-256 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Encrypt file data before it leaves your device and on physical storage blocks.
            </p>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={() => setClientEncryptionActive(!clientEncryptionActive)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              clientEncryptionActive ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                clientEncryptionActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sharing & Access Card */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Sharing & Access</h3>
          </div>
          {primaryShareLink && (
            <button
              onClick={() => onTestPublicShare(primaryShareLink.token)}
              id="test-public-preview-btn"
              className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/30"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Test Public View</span>
            </button>
          )}
        </div>

        {/* Share via Link Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Share via link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={fullShareUrl}
                id="share-link-url-input"
                className="w-full pl-3 pr-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-mono text-slate-200 focus:outline-none select-all"
              />
            </div>
            <button
              onClick={handleCopyLink}
              id="copy-share-link-btn"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 flex items-center gap-1.5 transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setQrModalData({
                  title: `Scan to Access: ${file.name}`,
                  url: fullShareUrl,
                })
              }
              id="share-qr-modal-btn"
              className="p-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl border border-white/10 transition-colors"
              title="Generate QR Code"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Link Expiration & Security Settings */}
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Link Expiration & Access Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Expiration Period</label>
              <select
                value={expiresInHours === null ? 'never' : expiresInHours.toString()}
                onChange={(e) =>
                  setExpiresInHours(e.target.value === 'never' ? null : parseInt(e.target.value, 10))
                }
                className="w-full p-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="1">1 Hour</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="168">7 Days</option>
                <option value="720">30 Days</option>
                <option value="never">Never (Persistent)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Optional Passcode</label>
              <input
                type="text"
                placeholder="Leave blank for public"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="w-full p-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCreateShareLink}
            disabled={creatingLink}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 backdrop-blur-xs"
          >
            {creatingLink ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-3 h-3 text-indigo-400" />
                <span>Generate New Secure Link</span>
              </>
            )}
          </button>
        </div>

        {/* People with access */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300">People with access</h4>
          <div className="divide-y divide-white/10">
            {file.collaborators?.map((collab, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px] text-slate-200 shrink-0">
                    {collab.name ? collab.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-100 truncate">{collab.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{collab.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {collab.role === 'owner' ? (
                    <span className="text-xs font-medium text-slate-400">Owner</span>
                  ) : (
                    <select
                      value={collab.role}
                      onChange={(e) => handleUpdateCollabRole(collab.email, e.target.value)}
                      className="text-xs bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-slate-200 font-medium focus:outline-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}
                  {collab.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveCollaborator(collab.email)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                      title="Remove access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Collaborator Form */}
          <form onSubmit={handleAddCollaborator} className="flex items-center gap-2 pt-2">
            <input
              type="email"
              placeholder="Add collaborator by email..."
              value={collabEmail}
              onChange={(e) => setCollabEmail(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={collabRole}
              onChange={(e) => setCollabRole(e.target.value as any)}
              className="px-2 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-medium text-slate-300 focus:outline-none"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={addingCollab || !collabEmail}
              className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0 shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Primary Download File Button */}
        <div className="pt-3">
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            id="primary-download-file-btn"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 border border-indigo-400/30"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Decrypting & Streaming File...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {previewOpen && (
        <FilePreviewModal
          file={file}
          onClose={() => setPreviewOpen(false)}
          onDownload={onDownload}
        />
      )}

      {qrModalData && (
        <QRCodeModal
          title={qrModalData.title}
          url={qrModalData.url}
          onClose={() => setQrModalData(null)}
        />
      )}
    </div>
  );
};
