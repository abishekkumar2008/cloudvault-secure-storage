import React from 'react';
import { X, CheckCircle2, Shield, Server, HardDrive, Database, Lock, Cpu, Code2 } from 'lucide-react';

interface SystemSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSpecModal: React.FC<SystemSpecModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A]/95 rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0F172A]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">CloudVault System Spec</h2>
              <p className="text-xs text-slate-400">Production-Ready File Storage & Sharing System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-300">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-2">CloudVault: Production-Ready File Storage System</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CloudVault delivers an enterprise-grade, zero-trust cloud file storage infrastructure with AES-256-GCM hardware-accelerated envelope encryption, role-based access control (RBAC), secure link generation with automated expiration, and continuous audit trail activity logging.
            </p>
          </div>

          {/* System Architecture */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 backdrop-blur-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>System Architecture</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-slate-200">Frontend:</strong> Responsive Mobile-First UI (Tailwind CSS, React 19, Motion animations, Frosted Glass theme)
              </li>
              <li>
                <strong className="text-slate-200">Backend:</strong> Node.js (Express) with Token Session Auth & RESTful APIs
              </li>
              <li>
                <strong className="text-slate-200">Storage:</strong> Local Vault Storage Engine (Mocking AWS S3 with encrypted on-disk storage blocks)
              </li>
              <li>
                <strong className="text-slate-200">Encryption Layer:</strong> AES-256-GCM cipher with random 96-bit IVs and 128-bit authentication tags
              </li>
              <li>
                <strong className="text-slate-200">Database:</strong> Embedded schema (User, File, Log, Permission, ShareLink) with live JSON persistence
              </li>
            </ul>
          </div>

          {/* Directory Structure */}
          <div className="bg-slate-950/80 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1 border border-white/10">
            <div className="text-indigo-400 font-bold mb-1">Directory Structure</div>
            <div>/cloudvault</div>
            <div className="text-slate-400">├── /backend</div>
            <div className="text-slate-400">│   ├── /controllers (auth, file, share, log)</div>
            <div className="text-slate-400">│   ├── /models (Schema definitions)</div>
            <div className="text-slate-400">│   ├── /routes (API endpoints)</div>
            <div className="text-slate-400">│   ├── /middleware (Auth, Encryption)</div>
            <div className="text-slate-400">│   └── server.ts (Express + Vite)</div>
            <div className="text-slate-400">├── /data/uploads (AES-256 Encrypted block storage)</div>
            <div className="text-slate-400">└── /frontend (Tailwind CSS, React 19 UI workspace)</div>
          </div>

          {/* Cryptographic Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl space-y-1 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>AES-256-GCM Envelope</span>
              </div>
              <p className="text-[11px] text-indigo-200/80">
                Uploaded file buffers are encrypted using 256-bit derived keys before hitting physical disk blocks.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl space-y-1 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Digest Verification</span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Every file stores cryptographic digests to prevent silent bitrot or tampering in transit.
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/25 border border-indigo-400/30"
            >
              Close Specification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
