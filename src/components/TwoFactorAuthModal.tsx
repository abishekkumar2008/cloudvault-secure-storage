import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  Lock,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api/client';
import { User } from '../types';

interface TwoFactorAuthModalProps {
  user: User | null;
  mode: 'setup' | 'verify';
  actionTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  user,
  mode,
  actionTitle = 'Authenticate Sensitive Action',
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup state
  const [setupData, setSetupData] = useState<{
    secret: string;
    backupCodes: string[];
    qrValue: string;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (mode === 'setup') {
      initializeSetup();
    }
  }, [mode]);

  const initializeSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.setup2FA();
      setSetupData(data);
      const dataUri = await QRCode.toDataURL(data.qrValue, {
        width: 220,
        margin: 2,
        color: { dark: '#020617', light: '#FFFFFF' },
      });
      setQrDataUrl(dataUri);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyBackup = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'setup') {
        await api.enable2FA(code.trim());
      } else {
        await api.verify2FA(code.trim());
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2 text-indigo-400">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {mode === 'setup' ? 'Set Up Two-Factor Authentication (2FA)' : actionTitle}
            </h3>
            <p className="text-[11px] text-slate-400">
              {mode === 'setup'
                ? 'Enhance your CloudVault account with hardware or app-based TOTP'
                : 'Enter your 6-digit authenticator code or emergency backup code to proceed.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'setup' && setupData && (
          <div className="space-y-4 my-4">
            {/* QR Code and Secret */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-3.5 rounded-xl border border-white/10">
              {qrDataUrl && (
                <div className="bg-white p-2 rounded-lg shrink-0 shadow-md">
                  <img src={qrDataUrl} alt="2FA QR Code" className="w-28 h-28 object-contain" />
                </div>
              )}
              <div className="text-xs space-y-2 min-w-0">
                <p className="text-slate-300 font-medium">
                  Scan this QR code using Google Authenticator, Authy, or 1Password.
                </p>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Secret Key:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="text-[11px] font-mono text-indigo-300 bg-black/40 px-2 py-1 rounded truncate">
                      {setupData.secret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Backup Codes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Emergency Backup Codes</span>
                <button
                  onClick={handleCopyBackup}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedBackup ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBackup ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-xs text-slate-300">
                {setupData.backupCodes.map((bc, idx) => (
                  <div key={idx} className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
                    {bc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="2fa-code">
              6-Digit Authenticator Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="2fa-code"
                type="text"
                maxLength={8}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-base font-mono tracking-widest text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-center"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Enter 6 digits from your authenticator app</span>
              <button
                type="button"
                onClick={() => setCode('000000')}
                className="text-indigo-400 hover:underline"
              >
                Auto-fill demo code
              </button>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{mode === 'setup' ? 'Verify & Enable 2FA' : 'Authorize Action'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
