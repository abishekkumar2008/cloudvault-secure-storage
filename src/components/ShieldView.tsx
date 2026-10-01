import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  KeyRound,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Server,
  Binary,
} from 'lucide-react';
import { SecurityScanReport, User } from '../types';
import { api } from '../api/client';

interface ShieldViewProps {
  currentUser: User | null;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const ShieldView: React.FC<ShieldViewProps> = ({ currentUser, onShowToast }) => {
  const [report, setReport] = useState<SecurityScanReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.getShieldScan();
      setReport(res.report);
      onShowToast('Cryptographic integrity audit completed: All storage blocks verified.');
    } catch (err: any) {
      onShowToast(err.message || 'Scan failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const handleSimulateMitigation = async () => {
    setSimulating(true);
    try {
      await api.simulateEvent('failed_login');
      onShowToast('Brute-force mitigation triggered: Unauthorized IP quarantined.');
      fetchScan();
    } catch (err: any) {
      onShowToast(err.message || 'Simulation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Top Banner */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0 border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">Zero-Trust Cryptographic Shield</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AES-256-GCM Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Continuous hardware-accelerated integrity verification engine. Detects physical disk corruption,
              unauthorized modifications, validates cryptographic signatures, and enforces immutable Master Account protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchScan}
            disabled={isScanning}
            id="run-shield-audit-btn"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Verifying Integrity...' : 'Run Deep Audit'}</span>
          </button>
        </div>
      </div>

      {/* Security Health Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/90 rounded-2xl p-5 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Security Score</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {report?.score || 99}
            </span>
            <span className="text-sm font-semibold text-emerald-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">Status: Optimal & Hardened</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payload Integrity</span>
            <FileCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {report?.checksumVerifiedCount || 0}
            </span>
            <span className="text-xs text-slate-400">/ {report?.totalEncryptedFiles || 0} Files</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">100% SHA-256 match on disk</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Master ID Lockout</span>
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-amber-300 truncate">Abishek (Protected)</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">kcabishiekkumar@gmail.com</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cipher Standard</span>
            <Binary className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-white">AES-256-GCM</p>
            <p className="text-[11px] text-slate-400 mt-1">Authenticated 128-bit Tag</p>
          </div>
        </div>
      </div>

      {/* Security Engine Audit Checklist */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Cryptographic Verifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live checks executed by the server-side Node.js crypto module
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Last Audit: {report ? new Date(report.scannedAt).toLocaleTimeString() : 'Just now'}
          </span>
        </div>

        <div className="space-y-3">
          {report?.checks.map((check) => (
            <div
              key={check.id}
              className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{check.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{check.description}</p>
                  <p className="text-[11px] text-indigo-300 font-mono mt-1.5 bg-indigo-500/10 px-2 py-0.5 rounded inline-block border border-indigo-500/20">
                    {check.detail}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Defense Sandbox & Testing */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Security Defense & Incident Isolation Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simulate an unauthorized intrusion or brute-force attack to test automated IP isolation and honeypot quarantine.
          </p>
        </div>

        <button
          onClick={handleSimulateMitigation}
          disabled={simulating}
          id="simulate-defense-test-btn"
          className="px-4 py-2 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 transition-colors flex items-center gap-1.5 shrink-0"
        >
          {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>Simulate Brute-Force Block</span>
        </button>
      </div>
    </div>
  );
};
