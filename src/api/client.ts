import {
  User,
  FileItem,
  ShareLink,
  ActivityLog,
  StorageStats,
  LogCategory,
  SecretItem,
  SecurityScanReport,
  FilePreviewData,
} from '../types';

const TOKEN_KEY = 'cloudvault_auth_token';
const USER_KEY = 'cloudvault_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getHeaders(isJson = true): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password = 'password123'): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Authentication error');
    }
    const data = await res.json();
    setAuthSession(data.token, data.user);
    return data;
  },

  async register(name: string, email: string, password = 'password123', role = 'user', department = 'General'): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, department }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration error');
    }
    const data = await res.json();
    setAuthSession(data.token, data.user);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/users', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async switchUser(userId?: string, email?: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to switch user' }));
      throw new Error(err.error || 'Failed to switch user');
    }
    const data = await res.json();
    setAuthSession(data.token, data.user);
    return data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ user: User }> {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update role' }));
      throw new Error(err.error || 'Failed to update role');
    }
    return res.json();
  },

  async createUser(data: { name: string; email: string; password?: string; role?: string; department?: string }): Promise<{ user: User }> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create login ID' }));
      throw new Error(err.error || 'Failed to create login ID');
    }
    return res.json();
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete login ID' }));
      throw new Error(err.error || 'Failed to delete login ID');
    }
    return res.json();
  },

  async purgeNonMasterUsers(): Promise<{ success: boolean; purgedCount: number; remainingUsers: User[] }> {
    const res = await fetch('/api/users/purge-non-master', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to purge guest accounts' }));
      throw new Error(err.error || 'Failed to purge guest accounts');
    }
    return res.json();
  },

  // Files
  async getFiles(search?: string, category?: string): Promise<{ files: FileItem[] }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);
    const res = await fetch(`/api/files?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  },

  async getFile(id: string): Promise<{ file: FileItem; shareLinks: ShareLink[] }> {
    const res = await fetch(`/api/files/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch file details');
    return res.json();
  },

  async uploadFile(file: File, location = '/Uploads', customName?: string): Promise<{ file: FileItem }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('location', location);
    if (customName) formData.append('name', customName);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/files/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload file');
    }
    return res.json();
  },

  async downloadFile(id: string, fileName: string): Promise<void> {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/files/${id}/download`, {
      headers,
    });

    if (!res.ok) {
      throw new Error('Download failed or permission denied');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async deleteFile(id: string): Promise<void> {
    const res = await fetch(`/api/files/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(err.error || 'Failed to delete file');
    }
  },

  async updatePermissions(fileId: string, email: string, role: string, action: 'add' | 'remove' | 'update'): Promise<{ collaborators: any[] }> {
    const res = await fetch(`/api/files/${fileId}/permissions`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ email, role, action }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Permission update failed' }));
      throw new Error(err.error || 'Failed to update permissions');
    }
    return res.json();
  },

  // Share Links
  async createShareLink(
    fileId: string,
    options: { expiresInHours?: number | null; password?: string; maxDownloads?: number | null; permission?: 'view' | 'download' }
  ): Promise<{ shareLink: ShareLink }> {
    const res = await fetch(`/api/share/${fileId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create share link' }));
      throw new Error(err.error || 'Error creating link');
    }
    return res.json();
  },

  async verifyShareLink(token: string): Promise<any> {
    const res = await fetch(`/api/share/verify/${token}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid share link' }));
      throw new Error(err.error || 'Link verification failed');
    }
    return res.json();
  },

  async downloadSharedFile(token: string, password?: string, fileName?: string): Promise<void> {
    const res = await fetch(`/api/share/download/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(err.error || 'Download error');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'shared-vault-download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Activity Logs
  async getActivityLogs(category?: LogCategory, page = 1, search?: string): Promise<{ logs: ActivityLog[]; page: number; totalPages: number; total: number }> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const res = await fetch(`/api/activity-logs?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  },

  // Stats
  async getStats(): Promise<StorageStats> {
    const res = await fetch('/api/stats', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch storage stats');
    return res.json();
  },

  // Security Simulator
  async simulateEvent(eventType: 'failed_login' | 'permission_audit'): Promise<void> {
    await fetch('/api/system/simulate-event', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ eventType }),
    });
  },

  // Zero-Trust Security Shield Scan
  async getShieldScan(): Promise<{ report: SecurityScanReport }> {
    const res = await fetch('/api/shield/scan', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to run security scan');
    return res.json();
  },

  // Ephemeral Burner Vault
  async getSecrets(): Promise<{ secrets: SecretItem[] }> {
    const res = await fetch('/api/secrets', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch secrets');
    return res.json();
  },

  async createSecret(data: {
    title: string;
    category?: 'credential' | 'note' | 'api_key' | 'crypto_seed';
    content: string;
    burnAfterRead?: boolean;
    expiresInMinutes?: number;
  }): Promise<{ secret: SecretItem }> {
    const res = await fetch('/api/secrets', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create secret' }));
      throw new Error(err.error || 'Failed to create secret');
    }
    return res.json();
  },

  async revealSecret(id: string): Promise<{
    content: string;
    burned: boolean;
    viewsRemaining: number;
    title: string;
    category: string;
  }> {
    const res = await fetch(`/api/secrets/${id}/reveal`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to decrypt secret' }));
      throw new Error(err.error || 'Secret expired or incinerated');
    }
    return res.json();
  },

  async deleteSecret(id: string): Promise<void> {
    const res = await fetch(`/api/secrets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to shred secret' }));
      throw new Error(err.error || 'Failed to shred secret');
    }
  },

  // File Preview
  async previewFile(id: string): Promise<FilePreviewData> {
    const res = await fetch(`/api/files/${id}/preview`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to preview file' }));
      throw new Error(err.error || 'Failed to preview file');
    }
    return res.json();
  },

  // Folders & Moving
  async getFolders(): Promise<{ folders: string[] }> {
    const res = await fetch('/api/folders', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch folders');
    return res.json();
  },

  async createFolder(folderPath: string): Promise<{ success: boolean; folderPath: string }> {
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ folderPath }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create folder' }));
      throw new Error(err.error || 'Failed to create folder');
    }
    return res.json();
  },

  async moveFile(id: string, location: string): Promise<{ success: boolean; file: FileItem }> {
    const res = await fetch(`/api/files/${id}/location`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ location }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to move file' }));
      throw new Error(err.error || 'Failed to move file');
    }
    return res.json();
  },

  // 2FA Authentication
  async get2FAStatus(): Promise<{ enabled: boolean; secret: string; backupCodes: string[] }> {
    const res = await fetch('/api/auth/2fa/status', {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get 2FA status');
    return res.json();
  },

  async setup2FA(): Promise<{ secret: string; backupCodes: string[]; qrValue: string }> {
    const res = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to initialize 2FA');
    return res.json();
  },

  async enable2FA(code: string): Promise<{ success: boolean; enabled: boolean }> {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid 2FA code' }));
      throw new Error(err.error || 'Invalid 2FA code');
    }
    return res.json();
  },

  async disable2FA(): Promise<{ success: boolean; enabled: boolean }> {
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to disable 2FA');
    return res.json();
  },

  async verify2FA(code: string): Promise<{ verified: boolean; isBackup?: boolean }> {
    const res = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid 6-digit code' }));
      throw new Error(err.error || 'Invalid 6-digit code');
    }
    return res.json();
  },
};
