import { persistentStorage } from '../storage/fileStorage.ts';
import type { ScheduledJobRecord } from '../storage/storageAdapter.ts';
import { serverMetaService } from '../metaApiService.ts';
import { automationSettingsManager } from './automationSettings.ts';
import { Logger } from '../utils/logger.ts';
import { notificationService } from './notificationService.ts';

export class PersistentScheduler {
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  public async initialize(): Promise<{
    loadedCount: number;
    armedCount: number;
    missedCount: number;
  }> {
    if (this.isInitialized) {
      const jobs = await persistentStorage.listScheduledJobs();
      return {
        loadedCount: jobs.length,
        armedCount: this.activeTimers.size,
        missedCount: jobs.filter((j) => j.status === 'MISSED').length
      };
    }

    this.isInitialized = true;
    Logger.info('Initializing persistent background scheduler from disk...', { component: 'Scheduler' });

    const jobs = await persistentStorage.listScheduledJobs();
    let armedCount = 0;
    let missedCount = 0;

    const now = Date.now();

    for (const job of jobs) {
      if (job.status !== 'PENDING') continue;

      const schedTime = new Date(job.scheduledTimeIso).getTime();

      if (schedTime <= now) {
        // Scheduled time passed while server was offline -> Flag as MISSED
        await persistentStorage.updateScheduledJob(job.id, {
          status: 'MISSED',
          errorMessage: 'Server was offline when scheduled time arrived. Operator review required.'
        });
        missedCount++;
        Logger.warn(`Scheduled job ${job.id} marked MISSED (scheduled for ${job.scheduledTimeIso})`, {
          component: 'Scheduler',
          jobId: job.id
        });
      } else {
        // Scheduled time is in the future -> Arm timer
        this.armJobTimer(job, schedTime - now);
        armedCount++;
      }
    }

    Logger.info(
      `Persistent scheduler initialized. Loaded: ${jobs.length} jobs, Armed: ${armedCount}, Missed: ${missedCount}`,
      { component: 'Scheduler' }
    );

    return {
      loadedCount: jobs.length,
      armedCount,
      missedCount
    };
  }

  /**
   * Schedules a content item for future publication.
   * Generates a deterministic job ID to prevent duplicate scheduling.
   */
  public async scheduleContentItem(params: {
    contentId: string;
    runId?: string;
    title: string;
    pillarId: string;
    mediaUrl: string;
    caption: string;
    scheduledTimeIso: string;
    approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
    mode: 'DEMO' | 'LIVE';
  }): Promise<ScheduledJobRecord> {
    const timestampMs = new Date(params.scheduledTimeIso).getTime();
    const deterministicId = `scheduled-job-${params.contentId}-${timestampMs}`;

    // Duplicate Check: Check if this exact job already exists
    const existing = await persistentStorage.getScheduledJob(deterministicId);
    if (existing) {
      Logger.warn(`Duplicate job registration prevented for ${deterministicId}`, {
        component: 'Scheduler',
        jobId: deterministicId
      });
      return existing;
    }

    const jobRecord: ScheduledJobRecord = {
      id: deterministicId,
      contentId: params.contentId,
      runId: params.runId,
      title: params.title,
      pillarId: params.pillarId,
      mediaUrl: params.mediaUrl,
      caption: params.caption,
      scheduledTimeIso: params.scheduledTimeIso,
      status: 'PENDING',
      approvalStatus: params.approvalStatus,
      mode: params.mode,
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    await persistentStorage.saveScheduledJob(jobRecord);

    const delayMs = timestampMs - Date.now();
    if (delayMs > 0) {
      this.armJobTimer(jobRecord, delayMs);
    }

    notificationService.addNotification(
      'SCHEDULED_POST_READY',
      'Post Scheduled Successfully',
      `"${params.title}" scheduled for ${new Date(params.scheduledTimeIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      'planner'
    );

    return jobRecord;
  }

  private armJobTimer(job: ScheduledJobRecord, delayMs: number): void {
    // Clear any previous timer for this job ID
    if (this.activeTimers.has(job.id)) {
      clearTimeout(this.activeTimers.get(job.id)!);
      this.activeTimers.delete(job.id);
    }

    // Node.js timeout (capped to max 32-bit int: 24.8 days)
    const safeDelay = Math.min(delayMs, 2147483647);

    const timer = setTimeout(async () => {
      await this.executeJob(job.id);
    }, safeDelay);

    this.activeTimers.set(job.id, timer);
    Logger.debug(`Armed execution timer for ${job.id} (in ${(delayMs / 1000).toFixed(0)}s)`, {
      component: 'Scheduler',
      jobId: job.id
    });
  }

  /**
   * Executes a scheduled job with strict safety checks.
   */
  public async executeJob(jobId: string): Promise<ScheduledJobRecord | null> {
    const job = await persistentStorage.getScheduledJob(jobId);
    if (!job) return null;

    // Safety 1: Duplicate Publication Protection
    if (job.status === 'PUBLISHED') {
      Logger.warn(`Aborted duplicate execution of already published job ${jobId}`, {
        component: 'Scheduler',
        jobId
      });
      return job;
    }

    // Safety 2: Mandatory Human Approval Check
    const settings = automationSettingsManager.getSettings();
    if (settings.requireHumanApproval && job.approvalStatus !== 'APPROVED') {
      Logger.warn(`Aborted execution of unapproved job ${jobId}`, {
        component: 'Scheduler',
        jobId
      });
      await persistentStorage.updateScheduledJob(jobId, {
        status: 'MISSED',
        errorMessage: 'Execution aborted: Mandatory human approval was not granted prior to scheduled slot.'
      });
      return job;
    }

    Logger.info(`Executing scheduled job "${job.title}" (${job.mode} mode)...`, {
      component: 'Scheduler',
      jobId
    });

    try {
      if (job.mode === 'LIVE' && serverMetaService.isConfigured()) {
        const publishRes = await serverMetaService.publishFullPipeline({
          mediaType: 'REELS',
          mediaUrl: job.mediaUrl,
          caption: job.caption,
          shareToFeed: true
        });

        const updated = await persistentStorage.updateScheduledJob(jobId, {
          status: 'PUBLISHED',
          publishedMediaId: publishRes.metaPostId,
          publishedUrl: publishRes.permalink || `https://instagram.com/p/${publishRes.metaPostId}`,
          executedAt: new Date().toISOString()
        });

        notificationService.addNotification(
          'PUBLISH_SUCCESS',
          'Live Reel Published to Meta',
          `"${job.title}" is live on Instagram.`,
          'published'
        );

        return updated;
      } else {
        // DEMO simulated execution
        const updated = await persistentStorage.updateScheduledJob(jobId, {
          status: 'PUBLISHED',
          publishedMediaId: `demo-media-${Date.now()}`,
          publishedUrl: `https://instagram.com/p/demo-${Date.now()}`,
          executedAt: new Date().toISOString()
        });

        notificationService.addNotification(
          'PUBLISH_SUCCESS',
          'Demo Reel Executed',
          `"${job.title}" simulated publication complete.`,
          'published'
        );

        return updated;
      }
    } catch (err: any) {
      Logger.error(`Publishing failed for ${jobId}`, { component: 'Scheduler', jobId }, err);
      const updated = await persistentStorage.updateScheduledJob(jobId, {
        status: 'FAILED',
        errorMessage: err.message,
        retryCount: job.retryCount + 1,
        executedAt: new Date().toISOString()
      });

      notificationService.addNotification(
        'PUBLISH_FAILURE',
        'Publishing Failed',
        `Failed to publish "${job.title}": ${err.message}`,
        'approval'
      );

      return updated;
    } finally {
      this.activeTimers.delete(jobId);
    }
  }

  public async init(): Promise<{
    loadedCount: number;
    armedCount: number;
    missedCount: number;
  }> {
    return await this.initialize();
  }

  public async listScheduledJobs(): Promise<ScheduledJobRecord[]> {
    return await persistentStorage.listScheduledJobs();
  }

  public async getJob(id: string): Promise<ScheduledJobRecord | null> {
    return await persistentStorage.getScheduledJob(id);
  }

  public async scheduleItem(item: {
    id?: string;
    contentId?: string;
    runId?: string;
    title: string;
    pillarId?: string;
    mediaUrl?: string;
    caption?: string;
    scheduledTime?: string;
    scheduledTimeIso?: string;
    isApproved?: boolean;
    requiresApproval?: boolean;
    approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
    mode?: 'DEMO' | 'LIVE';
  }): Promise<ScheduledJobRecord> {
    const contentId = item.contentId || item.id || `content-${Date.now()}`;
    const scheduledTimeIso = item.scheduledTimeIso || item.scheduledTime || new Date(Date.now() + 3600000).toISOString();
    const approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED' =
      item.approvalStatus || (item.isApproved ? 'APPROVED' : 'PENDING');
    const mode = item.mode || 'DEMO';

    return await this.scheduleContentItem({
      contentId,
      runId: item.runId,
      title: item.title,
      pillarId: item.pillarId || 'ai-automation',
      mediaUrl: item.mediaUrl || '/media/rendered/demo.mp4',
      caption: item.caption || item.title,
      scheduledTimeIso,
      approvalStatus,
      mode
    });
  }

  public shutdown(): void {
    Logger.info(`Cancelling ${this.activeTimers.size} active in-memory scheduler timers for graceful shutdown`, {
      component: 'Scheduler'
    });
    for (const timer of this.activeTimers.values()) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  public getArmedTimersCount(): number {
    return this.activeTimers.size;
  }
}

export const persistentScheduler = new PersistentScheduler();
