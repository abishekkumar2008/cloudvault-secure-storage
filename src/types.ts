export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

export type AppTab = 'files' | 'shared' | 'accounts' | 'shield' | 'secrets' | 'logs' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  storageUsedBytes: number;
  storageLimitBytes: number;
  department?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  loginCount?: number;
  isMasterProtected?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

export interface Collaborator {
  userId?: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  location: string;
  encrypted: boolean;
  encryptionAlgorithm: string;
  checksum: string;
  createdAt: string;
  updatedAt: string;
  collaborators: Collaborator[];
  shareLinkCount?: number;
}

export interface ShareLink {
  id: string;
  token: string;
  fileId: string;
  fileName: string;
  createdBy: string;
  createdByName: string;
  expiresAt: string | null;
  hasPassword: boolean;
  maxDownloads: number | null;
  downloadCount: number;
  permission: 'view' | 'download';
  active: boolean;
  createdAt: string;
  shareUrl: string;
}

export type LogCategory = 'All' | 'Security' | 'File Ops' | 'Sharing' | 'Auth';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  category: 'Security' | 'File Ops' | 'Sharing' | 'Auth';
  resourceName: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  timestamp: string;
}

export interface StorageStats {
  usedBytes: number;
  limitBytes: number;
  totalFiles: number;
  totalShared: number;
  totalLogs: number;
  totalUsers?: number;
  breakdown: {
    documents: number;
    spreadsheets: number;
    archives: number;
    media: number;
    others: number;
  };
}

export interface SecretItem {
  id: string;
  title: string;
  category: 'credential' | 'note' | 'api_key' | 'crypto_seed';
  burnAfterRead: boolean;
  viewsRemaining: number;
  expiresAt: string | null;
  createdAt: string;
  createdByName: string;
  content?: string;
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'critical';
  detail: string;
}

export interface SecurityScanReport {
  score: number;
  status: 'optimal' | 'warning' | 'critical';
  scannedAt: string;
  totalEncryptedFiles: number;
  checksumVerifiedCount: number;
  activeAccountsCount: number;
  protectedMasterAdmin: string;
  checks: SecurityCheckItem[];
}

export interface FilePreviewData {
  file: FileItem;
  previewType: 'text' | 'image' | 'pdf' | 'csv' | 'binary';
  content?: string;
  dataUrl?: string;
  hexDump?: string;
  csvRows?: string[][];
  lineCount?: number;
  checksum: string;
  iv: string;
  authTag: string;
  size: number;
}

