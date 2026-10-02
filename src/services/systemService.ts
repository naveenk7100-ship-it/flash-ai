export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  requestId: string;
  subsystems: {
    ai: string;
    aiProvider: string;
    media: string;
    meta: string;
    webhooks: string;
    scheduler: string;
    persistence: string;
    analytics: string;
    leadEngine: string;
  };
  storage: {
    mode: string;
    runsCount: number;
    jobsCount: number;
    leadsCount: number;
  };
}

export interface StorageStatsResponse {
  success: boolean;
  storage: {
    mode: string;
    healthy: boolean;
    storagePath: string;
    runsCount: number;
    jobsCount: number;
    leadsCount: number;
    backupsCount: number;
    lastBackupAt: string | null;
  };
  backups: Array<{
    backupId: string;
    timestamp: string;
    fileSize: number;
  }>;
}

export interface PublicMediaStatusResponse {
  success: boolean;
  mediaStatus: {
    isPubliclyAccessible: boolean;
    publicBaseUrl: string | null;
    status: 'READY_FOR_META_LIVE' | 'NOT_READY_FOR_META_LIVE_PUBLISHING';
    explanation: string;
    recommendation?: string;
  };
}

export class SystemService {
  private baseUrl = '/api';

  public async getHealth(): Promise<HealthResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[SystemService] Health check failed:', err);
    }
    return null;
  }

  public async getReadiness(): Promise<{ ready: boolean; status: string } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ready`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[SystemService] Readiness check failed:', err);
    }
    return { ready: false, status: 'OFFLINE' };
  }

  public async getStorageStats(): Promise<StorageStatsResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/system/storage`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[SystemService] Failed to fetch storage stats:', err);
    }
    return null;
  }

  public async createBackup(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/system/backup`, {
        method: 'POST'
      });
      return res.ok;
    } catch (err) {
      console.error('[SystemService] Backup failed:', err);
      return false;
    }
  }

  public async getPublicMediaStatus(): Promise<PublicMediaStatusResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/system/media-url-status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[SystemService] Failed to fetch media status:', err);
    }
    return null;
  }
}

export const systemService = new SystemService();
