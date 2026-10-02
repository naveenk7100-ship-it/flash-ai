import type {
  DailyRun,
  Lead
} from '../../src/types/index.ts';

export interface ScheduledJobRecord {
  id: string; // e.g. scheduled-job:content-123:1790439200000
  contentId: string;
  runId?: string;
  title: string;
  pillarId: string;
  mediaUrl: string;
  caption: string;
  scheduledTimeIso: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'MISSED' | 'CANCELLED';
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  mode: 'DEMO' | 'LIVE';
  publishedMediaId?: string;
  publishedUrl?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  executedAt?: string;
}

export interface SystemBackupData {
  backupId: string;
  timestamp: string;
  version: string;
  dailyRuns: DailyRun[];
  scheduledJobs: ScheduledJobRecord[];
  leads: Lead[];
  stats: {
    totalRuns: number;
    totalJobs: number;
    totalLeads: number;
  };
}

export interface IStorageAdapter {
  readonly mode: 'FILE' | 'DATABASE' | 'DEMO';
  
  // Daily Runs
  saveDailyRun(run: DailyRun): Promise<void>;
  getDailyRun(id: string): Promise<DailyRun | null>;
  listDailyRuns(): Promise<DailyRun[]>;
  
  // Scheduled Jobs
  saveScheduledJob(job: ScheduledJobRecord): Promise<void>;
  getScheduledJob(id: string): Promise<ScheduledJobRecord | null>;
  updateScheduledJob(id: string, updates: Partial<ScheduledJobRecord>): Promise<ScheduledJobRecord | null>;
  listScheduledJobs(): Promise<ScheduledJobRecord[]>;
  
  // Leads
  saveLead(lead: Lead): Promise<void>;
  getLead(id: string): Promise<Lead | null>;
  listLeads(): Promise<Lead[]>;
  
  // Backups
  createBackup(): Promise<SystemBackupData>;
  listBackups(): Promise<Array<{ backupId: string; timestamp: string; fileSize: number }>>;
  
  // Diagnostics
  getStorageStats(): Promise<{
    mode: string;
    healthy: boolean;
    storagePath: string;
    runsCount: number;
    jobsCount: number;
    leadsCount: number;
    backupsCount: number;
    lastBackupAt: string | null;
  }>;
}
