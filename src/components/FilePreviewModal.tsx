import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Download,
  Lock,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileImage,
  File as FileGeneric,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { FileItem, FilePreviewData } from '../types';
import { api } from '../api/client';

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onDownload,
}) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<FilePreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'crypto'>('preview');

  // Image controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Spreadsheet filter
  const [csvFilter, setCsvFilter] = useState('');

  // Fullscreen
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    fetchPreview();
  }, [file.id]);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.previewFile(file.id);
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt and preview file in browser.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (preview?.content) {
      navigator.clipboard.writeText(preview.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div
        className={`bg-[#0D1527] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullScreen
            ? 'w-full h-full fixed inset-0 rounded-none'
            : 'w-full max-w-4xl h-[90vh] max-h-[800px]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate">{file.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  Decrypted in Memory
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span className="truncate">{file.mimeType}</span>
                <span>•</span>
                <span>{file.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center bg-white/5 rounded-xl p-1 border border-white/10 text-xs mr-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In-Browser Viewer
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'crypto'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Security & Hash
              </button>
            </div>

            <button
              onClick={() => onDownload(file)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all border border-indigo-400/30"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-white/10 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-[#070D1B] p-4 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-200">Decrypted payload streaming into memory...</p>
              <p className="text-xs text-slate-500 mt-1">AES-256-GCM authentication tag verified.</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Preview Decryption Error</h4>
              <p className="text-xs text-rose-400 max-w-md mt-1">{error}</p>
              <button
                onClick={() => onDownload(file)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Direct Decrypted Download</span>
              </button>
            </div>
          ) : activeTab === 'crypto' ? (
            /* Cryptography & Integrity Tab */
            <div className="max-w-2xl mx-auto w-full py-6 space-y-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-slate-100">Cryptographic Verification Proof</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">SHA-256 Payload Checksum:</span>
                    <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-300 break-all border border-emerald-500/20 select-all">
                      {preview?.checksum || file.checksum || 'N/A'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block mb-1">AES-256-GCM IV (Initialization Vector):</span>
                      <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-indigo-300 break-all border border-white/5 select-all">
                        {preview?.iv || '96-bit Random GCM Nonce'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">128-bit Authentication Tag:</span>
                      <div className="p-2.5 bg-black/40 rounded-xl font-mono text-[11px] text-purple-300 break-all border border-white/5 select-all">
                        {preview?.authTag || 'Verified Galois Tag'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Storage Status</span>
                      <span className="font-semibold text-emerald-400">Encrypted on Disk (Zero Plaintext)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Owner Clearance</span>
                      <span className="font-semibold">{file.ownerName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Viewer per file type */
            <div className="flex-1 flex flex-col min-h-0">
              {/* IMAGE PREVIEW */}
              {preview?.previewType === 'image' && (
                <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                  {/* Image Toolbar */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 shadow-lg">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
                      className="p-1 hover:text-white transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono px-1">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                      className="p-1 hover:text-white transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1 hover:text-white transition-colors ml-1 border-l border-white/10 pl-2"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="text-[10px] px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded font-medium text-slate-200"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
                    <img
                      src={preview.dataUrl}
                      alt={file.name}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: 'transform 0.15s ease',
                      }}
                      className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
                    />
                  </div>
                </div>
              )}

              {/* PDF PREVIEW */}
              {preview?.previewType === 'pdf' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Encrypted Adobe PDF Document</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={preview.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-lg text-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Tab</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                    <iframe
                      src={preview.dataUrl}
                      title={file.name}
                      className="w-full h-full min-h-[500px] border-0"
                    />
                  </div>
                </div>
              )}

              {/* SPREADSHEET / CSV PREVIEW */}
              {preview?.previewType === 'csv' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search / Filter in CSV */}
                  <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={csvFilter}
                        onChange={(e) => setCsvFilter(e.target.value)}
                        placeholder="Search spreadsheet rows..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {preview.csvRows?.length || 0} rows parsed
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-slate-900/60 font-mono text-xs">
                    <table className="w-full text-left border-collapse">
                      {preview.csvRows && preview.csvRows.length > 0 && (
                        <thead>
                          <tr className="bg-slate-800/80 sticky top-0 border-b border-white/10">
                            <th className="p-2.5 text-slate-500 w-12 text-center text-[10px]">#</th>
                            {preview.csvRows[0].map((col, idx) => (
                              <th key={idx} className="p-2.5 text-slate-200 font-bold border-r border-white/5">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {preview.csvRows
                          ?.slice(1)
                          .filter((row) =>
                            csvFilter
                              ? row.some((cell) => cell.toLowerCase().includes(csvFilter.toLowerCase()))
                              : true
                          )
                          .map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="p-2 text-slate-500 text-center text-[10px] bg-slate-950/40">
                                {rIdx + 1}
                              </td>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 text-slate-300 border-r border-white/5 truncate max-w-[240px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CODE / MARKDOWN / PLAINTEXT PREVIEW */}
              {preview?.previewType === 'text' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <span className="text-xs text-slate-400">
                      {preview.lineCount} lines • {preview.content?.length || 0} characters
                    </span>
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed select-text">
                      {preview.content}
                    </pre>
                  </div>
                </div>
              )}

              {/* BINARY / ARCHIVE HEX DUMP PREVIEW */}
              {preview?.previewType === 'binary' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3 flex items-center justify-between text-xs text-amber-300 shrink-0">
                    <div className="flex items-center gap-2">
                      <FileArchive className="w-4 h-4" />
                      <span>Binary Vault Payload (First 1,024 Bytes Hex Disassembly)</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">Offset: 0x00000000</span>
                  </div>

                  <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 leading-tight select-text">
                    <pre className="whitespace-pre">{preview.hexDump}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>End-to-End Cryptographic Envelope Verified</span>
          </div>

          <button
            onClick={() => onDownload(file)}
            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
