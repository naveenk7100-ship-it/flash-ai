import fs from 'node:fs';
import path from 'node:path';
import { EnvConfig } from '../config/env.ts';
import { Logger } from '../utils/logger.ts';
import type {
  IStorageAdapter,
  ScheduledJobRecord,
  SystemBackupData
} from './storageAdapter.ts';
import type { DailyRun, Lead } from '../../src/types/index.ts';

export class FileStorageAdapter implements IStorageAdapter {
  public readonly mode = 'FILE' as const;
  private rootDir: string;
  private runsDir: string;
  private jobsDir: string;
  private leadsDir: string;
  private backupsDir: string;

  constructor(customRoot?: string) {
    this.rootDir = path.resolve(customRoot || EnvConfig.storageRoot);
    this.runsDir = path.join(this.rootDir, 'runs');
    this.jobsDir = path.join(this.rootDir, 'jobs');
    this.leadsDir = path.join(this.rootDir, 'leads');
    this.backupsDir = path.join(this.rootDir, 'backups');

    this.initDirectories();
  }

  private initDirectories(): void {
    try {
      [this.rootDir, this.runsDir, this.jobsDir, this.leadsDir, this.backupsDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    } catch (err: any) {
      Logger.error(`Failed to initialize storage directory at ${this.rootDir}`, { component: 'Storage' }, err);
    }
  }

  /**
   * Performs an atomic file write via temporary file replacement.
   */
  private async atomicWriteJson(filePath: string, data: any): Promise<void> {
    const tmpPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    const jsonStr = JSON.stringify(data, null, 2);

    try {
      await fs.promises.writeFile(tmpPath, jsonStr, 'utf8');
      await fs.promises.rename(tmpPath, filePath);
    } catch (err: any) {
      // Clean up temp file if rename fails
      if (fs.existsSync(tmpPath)) {
        try {
          await fs.promises.unlink(tmpPath);
        } catch {}
      }
      throw err;
    }
  }

  private async safeReadJson<T>(filePath: string): Promise<T | null> {
    try {
      if (!fs.existsSync(filePath)) return null;
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch (err: any) {
      Logger.warn(`Failed to read JSON from ${filePath}: ${err.message}`, { component: 'Storage' });
      return null;
    }
  }

  // ==========================================
  // 1. DAILY RUN PERSISTENCE
  // ==========================================
  public async saveDailyRun(run: DailyRun): Promise<void> {
    this.initDirectories();
    const safeId = run.id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.runsDir, `${safeId}.json`);
    await this.atomicWriteJson(filePath, run);
    Logger.debug(`Saved daily run ${run.id}`, { component: 'Storage', runId: run.id });
  }

  public async getDailyRun(id: string): Promise<DailyRun | null> {
    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.runsDir, `${safeId}.json`);
    return await this.safeReadJson<DailyRun>(filePath);
  }

  public async listDailyRuns(): Promise<DailyRun[]> {
    this.initDirectories();
    try {
      const files = await fs.promises.readdir(this.runsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const runs: DailyRun[] = [];
      for (const file of jsonFiles) {
        const run = await this.safeReadJson<DailyRun>(path.join(this.runsDir, file));
        if (run) runs.push(run);
      }

      return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    } catch (err: any) {
      Logger.error('Failed to list daily runs', { component: 'Storage' }, err);
      return [];
    }
  }

  // ==========================================
  // 2. SCHEDULED JOBS PERSISTENCE
  // ==========================================
  public async saveScheduledJob(job: ScheduledJobRecord): Promise<void> {
    this.initDirectories();
    const id = job.id || (job as any).jobId;
    if (!id) throw new Error('ScheduledJobRecord must have an id or jobId');
    const safeId = String(id).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.jobsDir, `${safeId}.json`);
    await this.atomicWriteJson(filePath, { ...job, id });
    Logger.debug(`Saved scheduled job ${id}`, { component: 'Storage', jobId: id });
  }

  public async getScheduledJob(id: string): Promise<ScheduledJobRecord | null> {
    if (!id) return null;
    const safeId = String(id).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.jobsDir, `${safeId}.json`);
    return await this.safeReadJson<ScheduledJobRecord>(filePath);
  }

  public async updateScheduledJob(
    id: string,
    updates: Partial<ScheduledJobRecord>
  ): Promise<ScheduledJobRecord | null> {
    const existing = await this.getScheduledJob(id);
    if (!existing) return null;

    const updated: ScheduledJobRecord = {
      ...existing,
      ...updates
    };

    await this.saveScheduledJob(updated);
    return updated;
  }

  public async deleteScheduledJob(id: string): Promise<boolean> {
    if (!id) return false;
    const safeId = String(id).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.jobsDir, `${safeId}.json`);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async listScheduledJobs(): Promise<ScheduledJobRecord[]> {
    this.initDirectories();
    try {
      const files = await fs.promises.readdir(this.jobsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const jobs: ScheduledJobRecord[] = [];
      for (const file of jsonFiles) {
        const job = await this.safeReadJson<ScheduledJobRecord>(path.join(this.jobsDir, file));
        if (job) jobs.push(job);
      }

      return jobs.sort(
        (a, b) => new Date(a.scheduledTimeIso).getTime() - new Date(b.scheduledTimeIso).getTime()
      );
    } catch (err: any) {
      Logger.error('Failed to list scheduled jobs', { component: 'Storage' }, err);
      return [];
    }
  }

  // ==========================================
  // 3. LEADS PERSISTENCE
  // ==========================================
  public async saveLead(lead: Lead): Promise<void> {
    this.initDirectories();
    const safeId = lead.id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.leadsDir, `${safeId}.json`);
    await this.atomicWriteJson(filePath, lead);
  }

  public async getLead(id: string): Promise<Lead | null> {
    if (!id) return null;
    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.leadsDir, `${safeId}.json`);
    return await this.safeReadJson<Lead>(filePath);
  }

  public async deleteLead(id: string): Promise<boolean> {
    if (!id) return false;
    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(this.leadsDir, `${safeId}.json`);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async listLeads(): Promise<Lead[]> {
    this.initDirectories();
    try {
      const files = await fs.promises.readdir(this.leadsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const leads: Lead[] = [];
      for (const file of jsonFiles) {
        const lead = await this.safeReadJson<Lead>(path.join(this.leadsDir, file));
        if (lead) leads.push(lead);
      }

      return leads.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err: any) {
      Logger.error('Failed to list leads', { component: 'Storage' }, err);
      return [];
    }
  }

  // ==========================================
  // 4. BACKUP CREATION & LISTING
  // ==========================================
  public async createBackup(): Promise<SystemBackupData> {
    this.initDirectories();
    const runs = await this.listDailyRuns();
    const jobs = await this.listScheduledJobs();
    const leads = await this.listLeads();

    const timestamp = new Date().toISOString();
    const backupId = `backup-${timestamp.replace(/[:.]/g, '-')}`;

    const backupData: SystemBackupData = {
      backupId,
      timestamp,
      version: '1.0.0',
      dailyRuns: runs,
      scheduledJobs: jobs,
      leads,
      stats: {
        totalRuns: runs.length,
        totalJobs: jobs.length,
        totalLeads: leads.length
      }
    };

    const filePath = path.join(this.backupsDir, `${backupId}.json`);
    await this.atomicWriteJson(filePath, backupData);
    Logger.info(`Created system backup ${backupId} (${runs.length} runs, ${jobs.length} jobs)`, {
      component: 'Backup'
    });

    return backupData;
  }

  public async listBackups(): Promise<Array<{ backupId: string; timestamp: string; fileSize: number }>> {
    this.initDirectories();
    try {
      const files = await fs.promises.readdir(this.backupsDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      const result: Array<{ backupId: string; timestamp: string; fileSize: number }> = [];
      for (const file of jsonFiles) {
        const filePath = path.join(this.backupsDir, file);
        const stats = await fs.promises.stat(filePath);
        const backupId = file.replace('.json', '');
        result.push({
          backupId,
          timestamp: stats.mtime.toISOString(),
          fileSize: stats.size
        });
      }

      return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err: any) {
      Logger.error('Failed to list backups', { component: 'Backup' }, err);
      return [];
    }
  }

  // ==========================================
  // 5. STORAGE DIAGNOSTICS
  // ==========================================
  public async getStorageStats(): Promise<{
    mode: string;
    healthy: boolean;
    storagePath: string;
    runsCount: number;
    jobsCount: number;
    leadsCount: number;
    backupsCount: number;
    lastBackupAt: string | null;
  }> {
    this.initDirectories();
    try {
      const runs = await this.listDailyRuns();
      const jobs = await this.listScheduledJobs();
      const leads = await this.listLeads();
      const backups = await this.listBackups();

      const lastBackupAt = backups.length > 0 ? backups[0].timestamp : null;

      return {
        mode: this.mode,
        healthy: true,
        storagePath: this.rootDir,
        runsCount: runs.length,
        jobsCount: jobs.length,
        leadsCount: leads.length,
        backupsCount: backups.length,
        lastBackupAt
      };
    } catch (err: any) {
      return {
        mode: this.mode,
        healthy: false,
        storagePath: this.rootDir,
        runsCount: 0,
        jobsCount: 0,
        leadsCount: 0,
        backupsCount: 0,
        lastBackupAt: null
      };
    }
  }
}

export const persistentStorage = new FileStorageAdapter();
export const fileStorage = persistentStorage;
