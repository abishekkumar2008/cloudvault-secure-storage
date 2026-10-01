import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  title: string;
  subtitle?: string;
  url: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  title,
  subtitle = 'Scan with your mobile camera or authenticator to access this encrypted link.',
  url,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUri) => {
        if (isMounted) {
          setQrDataUrl(dataUri);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `cloudvault-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1 text-indigo-400">
          <QrCode className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">{subtitle}</p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl shadow-inner flex items-center justify-center mx-auto mb-4 border border-white/20 aspect-square w-64 h-64">
          {loading ? (
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="Encrypted QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="text-xs text-rose-500 font-medium">Failed to generate QR Code</div>
          )}
        </div>

        {/* URL Pill & Copy */}
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-2 mb-4">
          <span className="text-[11px] font-mono text-slate-300 truncate max-w-[200px]">
            {url}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs transition-colors"
              title="Open Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Endpoint</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
