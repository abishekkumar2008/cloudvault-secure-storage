import React, { useState, useEffect } from 'react';
import {
  Flame,
  KeyRound,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  QrCode,
} from 'lucide-react';
import { SecretItem, User } from '../types';
import { api } from '../api/client';
import { QRCodeModal } from './QRCodeModal';

interface SecretsViewProps {
  currentUser: User | null;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const SecretsView: React.FC<SecretsViewProps> = ({ currentUser, onShowToast }) => {
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Creation State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'credential' | 'note' | 'api_key' | 'crypto_seed'>('note');
  const [burnAfterRead, setBurnAfterRead] = useState(true);
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reveal State
  const [revealedSecret, setRevealedSecret] = useState<{
    id: string;
    title: string;
    content: string;
    burned: boolean;
    viewsRemaining: number;
  } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ title: string; url: string } | null>(null);

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await api.getSecrets();
      setSecrets(res.secrets);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to load secrets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      onShowToast('Title and secret payload are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createSecret({
        title: title.trim(),
        category,
        content: content.trim(),
        burnAfterRead,
        expiresInMinutes,
      });
      onShowToast('Ephemeral secret encrypted with AES-256-GCM & stored.');
      setIsCreateOpen(false);
      setTitle('');
      setContent('');
      fetchSecrets();
    } catch (err: any) {
      onShowToast(err.message || 'Error creating secret', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async (item: SecretItem) => {
    setIsRevealing(true);
    try {
      const res = await api.revealSecret(item.id);
      setRevealedSecret({
        id: item.id,
        title: res.title,
        content: res.content,
        burned: res.burned,
        viewsRemaining: res.viewsRemaining,
      });
      if (res.burned) {
        onShowToast(`Secret "${res.title}" was incinerated immediately after reading.`);
      }
      fetchSecrets();
    } catch (err: any) {
      onShowToast(err.message || 'Secret expired or already destroyed', 'error');
      fetchSecrets();
    } finally {
      setIsRevealing(false);
    }
  };

  const handleManualShred = async (id: string, secretTitle: string) => {
    try {
      await api.deleteSecret(id);
      onShowToast(`Shredded secret: "${secretTitle}"`);
      fetchSecrets();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to shred secret', 'error');
    }
  };

  const handleCopy = () => {
    if (!revealedSecret) return;
    navigator.clipboard.writeText(revealedSecret.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied decrypted secret to clipboard.');
  };

  const formatExpiry = (iso: string | null) => {
    if (!iso) return 'Never';
    try {
      const d = new Date(iso);
      const diffMin = Math.round((d.getTime() - Date.now()) / 60000);
      if (diffMin <= 0) return 'Expired';
      if (diffMin < 60) return `${diffMin}m remaining`;
      return `${Math.round(diffMin / 60)}h remaining`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Top Banner */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 shrink-0 border border-rose-400/30">
            <Flame className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">Burner Vault (Ephemeral Secrets)</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Auto-Incinerating
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Store credentials, private keys, API secrets, or confidential notes with zero-knowledge instant burn.
              Once revealed or expired, the encrypted block is mathematically purged from disk memory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchSecrets}
            id="refresh-secrets-btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            id="create-burner-secret-btn"
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/25 border border-rose-400/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Drop Ephemeral Secret</span>
          </button>
        </div>
      </div>

      {/* Secrets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {secrets.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[160px]">{item.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleManualShred(item.id, item.title)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors"
                  title="Shred Now"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Payload:</span>
                <span className="text-indigo-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> AES-256 Encrypted
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Burn Policy:</span>
                  <span className="font-semibold text-rose-300">
                    {item.burnAfterRead ? 'Burn after 1 read' : `${item.viewsRemaining} views left`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Time Limit:</span>
                  <span className="text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {formatExpiry(item.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => handleReveal(item)}
                id={`reveal-secret-${item.id}`}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Decrypt & Reveal</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setQrModalData({
                    title: `Self-Destruct Secret: ${item.title}`,
                    url: `${window.location.origin}/api/secrets/${item.id}/reveal`,
                  })
                }
                id={`qr-secret-${item.id}`}
                className="p-2 bg-white/10 hover:bg-white/15 text-amber-400 rounded-xl border border-white/10 transition-colors"
                title="Scan with Mobile to Decrypt"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {secrets.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <Flame className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No active ephemeral secrets</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a self-destructing secret note or API token that automatically incinerates upon reading.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Revealed Secret */}
      {revealedSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setRevealedSecret(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{revealedSecret.title}</h3>
                {revealedSecret.burned ? (
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Incinerated from vault memory
                  </p>
                ) : (
                  <p className="text-xs text-amber-300 font-semibold">
                    Views Remaining: {revealedSecret.viewsRemaining}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={revealedSecret.content}
                rows={5}
                className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>
                If you close this modal, the content cannot be recovered once burned. Make sure to copy or note down any required data.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRevealedSecret(null)}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
              >
                I Have Copied It / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Ephemeral Secret */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Drop Ephemeral Secret</h3>
                <p className="text-xs text-slate-400">Encrypted with AES-256-GCM. Burns upon consumption.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSecret} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Secret Label / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master DB Key, Seed Phrase, Recovery Token"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="note">Secure Note</option>
                  <option value="credential">Login Password / Credential</option>
                  <option value="api_key">API Secret / Access Token</option>
                  <option value="crypto_seed">Crypto Seed / Private Key</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confidential Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter secret text, password, token, or private key..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={burnAfterRead}
                    onChange={(e) => setBurnAfterRead(e.target.checked)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-800"
                  />
                  <span>Burn after 1 view (Zero-Knowledge Purge)</span>
                </label>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-400">Expires in:</span>
                  <select
                    value={expiresInMinutes}
                    onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                    className="px-2 py-1 bg-slate-800 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={1440}>24 hours</option>
                    <option value={10080}>7 days</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5" />
                      <span>Create Secret</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
