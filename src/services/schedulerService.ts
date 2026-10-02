import type {
  ContentItem,
  PublishingJob,
  PublishingStatus,
  PublishingMode,
  MediaType
} from '../types';
import { metaApiService } from './metaApiService';
import { validateMediaForPublishing } from '../utils/mediaValidator';

export interface ExecutePublishResult {
  success: boolean;
  job: PublishingJob;
  error?: string;
}

export class SchedulerService {
  /**
   * Evaluates whether a scheduled job is eligible for execution.
   */
  public isEligibleToPublish(job: PublishingJob, item: ContentItem | undefined): {
    eligible: boolean;
    reason?: string;
  } {
    // 1. Content must exist
    if (!item) {
      return { eligible: false, reason: 'Associated content item not found.' };
    }

    // 2. Content must be APPROVED
    if (item.status !== 'APPROVED') {
      return { eligible: false, reason: `Content item is in status "${item.status}", requires "APPROVED".` };
    }

    // 3. Job must not already be PUBLISHED
    if (job.status === 'PUBLISHED') {
      return { eligible: false, reason: 'Job has already been published.' };
    }

    // 4. Job must be in READY or QUEUED status
    if (job.status !== 'QUEUED' && job.status !== 'READY' && job.status !== 'FAILED') {
      return { eligible: false, reason: `Job is currently in state "${job.status}".` };
    }

    // 5. If scheduled, time must have arrived
    if (job.scheduledFor) {
      const scheduledTime = new Date(job.scheduledFor).getTime();
      const now = Date.now();
      if (scheduledTime > now) {
        return { eligible: false, reason: 'Scheduled time has not yet arrived.' };
      }
    }

    // 6. Media validation
    const validation = validateMediaForPublishing(item, job.mediaUrl, job.mediaType);
    if (!validation.isValid) {
      return { eligible: false, reason: validation.errors.join('; ') };
    }

    return { eligible: true };
  }

  /**
   * Executes publishing for a job with full lifecycle state transitions.
   */
  public async executePublishJob(
    job: PublishingJob,
    item: ContentItem,
    mode: PublishingMode,
    onStatusUpdate?: (job: PublishingJob, status: PublishingStatus, message?: string) => void
  ): Promise<ExecutePublishResult> {
    const isDemo = mode === 'DEMO';

    // Guard duplicate publishing
    if (job.status === 'PUBLISHED') {
      return {
        success: true,
        job,
        error: 'Job was already published.'
      };
    }

    // 1. Validate
    const validation = validateMediaForPublishing(item, job.mediaUrl, job.mediaType);
    if (!validation.isValid) {
      const failedJob: PublishingJob = {
        ...job,
        status: 'FAILED',
        errorMessage: validation.errors.join('. '),
        retryCount: job.retryCount + 1
      };
      onStatusUpdate?.(failedJob, 'FAILED', failedJob.errorMessage);
      return { success: false, job: failedJob, error: failedJob.errorMessage };
    }

    // 2. Transition to UPLOADING / PROCESSING
    let currentJob: PublishingJob = {
      ...job,
      status: 'UPLOADING',
      startedAt: new Date().toISOString(),
      isDemo
    };
    onStatusUpdate?.(currentJob, 'UPLOADING', 'Uploading media to Meta container...');

    try {
      // 3. Format full caption with hashtags
      const formattedCaption = this.buildFullCaption(item);

      currentJob = {
        ...currentJob,
        status: 'PROCESSING'
      };
      onStatusUpdate?.(currentJob, 'PROCESSING', 'Transcoding media container on Instagram servers...');

      // 4. Call Meta API service (Real or Demo)
      const res = await metaApiService.publishMedia({
        contentId: item.id,
        title: item.title,
        caption: formattedCaption,
        mediaUrl: job.mediaUrl,
        mediaType: job.mediaType,
        isDemo
      });

      if (!res.success) {
        throw new Error(res.error || 'Publishing operation failed');
      }

      // 5. Success -> Transition to PUBLISHED
      const completedJob: PublishingJob = {
        ...currentJob,
        status: 'PUBLISHED',
        completedAt: res.publishedAt || new Date().toISOString(),
        externalMediaId: res.metaPostId,
        containerId: res.containerId,
        permalink: res.permalink,
        isDemo: res.isDemo,
        errorMessage: undefined
      };

      onStatusUpdate?.(completedJob, 'PUBLISHED', 'Published successfully to Instagram!');
      return { success: true, job: completedJob };
    } catch (err: any) {
      const failedJob: PublishingJob = {
        ...currentJob,
        status: 'FAILED',
        errorMessage: err.message || 'Failed to publish to Instagram',
        retryCount: currentJob.retryCount + 1
      };

      onStatusUpdate?.(failedJob, 'FAILED', failedJob.errorMessage);
      return { success: false, job: failedJob, error: failedJob.errorMessage };
    }
  }

  /**
   * Helper to format caption + CTA + hashtags.
   */
  private buildFullCaption(item: ContentItem): string {
    const v = item.variant;
    if (!v) return item.title;

    const parts: string[] = [];
    if (v.caption) parts.push(v.caption.trim());

    // Hashtags
    const allHashtags = [
      ...(v.hashtags?.niche || []),
      ...(v.hashtags?.broad || []),
      ...(v.hashtags?.viral || [])
    ].filter(Boolean);

    if (allHashtags.length > 0) {
      parts.push('\n---\n' + allHashtags.join(' '));
    }

    return parts.join('\n\n');
  }

  /**
   * Creates a new safe Publishing Job from a ContentItem.
   */
  public createJobFromItem(
    item: ContentItem,
    mediaUrl: string,
    mediaType: MediaType = 'REELS',
    scheduledFor?: string,
    timezone: string = 'Asia/Kolkata',
    isDemo: boolean = true
  ): PublishingJob {
    return {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      contentId: item.id,
      contentTitle: item.title,
      pillarId: item.pillarId,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      caption: item.variant?.caption || item.title,
      status: scheduledFor ? 'QUEUED' : 'READY',
      createdAt: new Date().toISOString(),
      scheduledFor,
      timezone,
      retryCount: 0,
      isDemo,
      platform: item.platform
    };
  }
}

export const schedulerService = new SchedulerService();
