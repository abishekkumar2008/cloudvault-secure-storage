import React, { useState, useRef } from 'react';
import { Upload, X, File, Lock, CheckCircle2, AlertCircle, Shield, Folder } from 'lucide-react';
import { api } from '../api/client';
import { FileItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newFile: FileItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [location, setLocation] = useState('/Q4_Planning');
  const [clientEncryption, setClientEncryption] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setCustomName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCustomName(file.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError(null);
    setUploading(true);
    setProgress(20);

    let progressInterval: any = setInterval(() => {
      setProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 100);

    try {
      const targetName = customName.trim() || selectedFile.name;
      const res = await api.uploadFile(selectedFile, location, targetName);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setProgress(100);

      setTimeout(() => {
        onUploadSuccess(res.file);
        onClose();
        setSelectedFile(null);
        setCustomName('');
        setUploading(false);
        setProgress(0);
      }, 350);
    } catch (err: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setError(err.message || 'Failed to upload and encrypt file');
      setUploading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A]/95 rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Upload to CloudVault</h3>
              <p className="text-xs text-slate-400">AES-256 server-side encryption applied automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-400 bg-indigo-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-white/15 hover:border-indigo-400 bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                  <File className="w-5 h-5" />
                </div>
                <div className="text-left truncate max-w-xs">
                  <p className="text-sm font-semibold text-slate-100 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)} • Ready to encrypt</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-200">
                  <span className="text-indigo-400 font-semibold">Click to browse</span> or drag and drop file here
                </div>
                <p className="text-xs text-slate-400">PDF, Excel, Word, Zip, Images, Code (Max 50MB)</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="file-name-input">
                  File Display Name
                </label>
                <input
                  id="file-name-input"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="file-location-select">
                  Target Directory
                </label>
                <div className="relative">
                  <Folder className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="file-location-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="/Q4_Planning">/Q4_Planning</option>
                    <option value="/Finance/2023">/Finance/2023</option>
                    <option value="/HR/Records">/HR/Records</option>
                    <option value="/Campaigns/Q4">/Campaigns/Q4</option>
                    <option value="/Engineering/Source">/Engineering/Source</option>
                    <option value="/Uploads">/Uploads</option>
                  </select>
                </div>
              </div>

              {/* Encryption Banner */}
              <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">AES-256-GCM Envelope Encryption:</span> File bytes will be transformed using a cryptographic initialization vector and SHA-256 digest on storage.
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Encrypting & Storing in Vault...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200 shadow-md shadow-indigo-500/30"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-upload-btn"
              disabled={!selectedFile || uploading}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt & Upload</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
