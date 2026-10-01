import React, { useState, useEffect } from 'react';
import { X, Lock, Download, AlertCircle, FileText, CheckCircle2, Shield, Clock } from 'lucide-react';
import { api } from '../api/client';

interface PublicShareModalProps {
  token: string | null;
  onClose: () => void;
}

export const PublicShareModal: React.FC<PublicShareModalProps> = ({ token, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fileMeta, setFileMeta] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (token) {
      verifyLink();
    }
  }, [token]);

  if (!token) return null;

  const verifyLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyShareLink(token);
      setFileMeta(res);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired share link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloading(true);
    setError(null);
    try {
      await api.downloadSharedFile(token, password || undefined, fileMeta?.fileName);
    } catch (err: any) {
      setError(err.message || 'Download failed. Check password if required.');
    } finally {
      setDownloading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A]/95 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">CloudVault Public Link Access</h3>
              <p className="text-[11px] text-slate-400 font-mono">Token: {token}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Verifying share token cryptographic permissions...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Access Restricted</p>
                <p className="mt-0.5 text-rose-300">{error}</p>
              </div>
            </div>
          ) : fileMeta ? (
            <form onSubmit={handleDownload} className="space-y-4">
              {/* File details card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3.5 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-100 truncate">{fileMeta.fileName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{formatBytes(fileMeta.size)}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">AES-256 Verified</span>
                  </div>
                </div>
              </div>

              {/* Expiration Note */}
              {fileMeta.expiresAt && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    Link expires on {new Date(fileMeta.expiresAt).toLocaleDateString()} at{' '}
                    {new Date(fileMeta.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Password prompt if protected */}
              {fileMeta.hasPassword && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="share-password-input">
                    Password Protected File
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="share-password-input"
                      type="password"
                      required
                      placeholder="Enter share password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Download Action */}
              <button
                type="submit"
                disabled={downloading}
                id="public-download-submit-btn"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Decrypting & Streaming...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Decrypted File</span>
                  </>
                )}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};
