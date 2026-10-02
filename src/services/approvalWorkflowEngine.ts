/**
 * FLASH.Ai Human Approval & 9:00 PM Auto-Publish Workflow Engine (Requirements 1, 3, 4, 5, 6, 8, 10, 11)
 * 
 * Implements the official production lifecycle:
 * CONTENT GENERATION
 * → REEL PRODUCTION
 * → HUMAN REVIEW NOTIFICATION
 * → USER APPROVAL
 * → SCHEDULE FOR 9:00 PM IST
 * → AUTOMATIC INSTAGRAM PUBLISH
 * 
 * Target:
 * - Instagram: @flash__ai__digital (Account ID: 17841436234295944)
 * - Timezone: Asia/Kolkata
 * - Default publish time: 21:00 IST (9:00 PM)
 * 
 * Safety:
 * - Mandatory Human Review strictly enforced (no approval = NO PUBLISH)
 * - Duplicate publish prevention (idempotency by Reel ID & Meta Container ID)
 * - Missed 21:00 schedule safety: flags missed window, never publishes unapproved
 */

import type { ReelProductionProject, ExportJob } from '../types/reelProduction';
import { publishingPipelineEngine, type PipelinePublishingStatus } from './publishingPipelineEngine';
import { notificationManager } from './notificationService';
import { contentPlanningEngine } from './contentPlanningEngine';
import { reelProductionPipeline } from './reelProductionPipeline';
import { instagramProviderManager } from './instagramPublisher';
import { contentMemoryService } from './contentMemoryService';
import {
  synthesizeAndStoreReelVideo,
  ensureReelVideoPersistedAsync,
  verifyMediaAssetAsync
} from './videoSynthesizerService';

export type ReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'MISSED_REVIEW_WINDOW';

export interface ReviewableReelRecord {
  id: string;
  reelId: string;
  projectId: string;
  title: string;
  topic: string;
  formatId: string;
  formatName: string;
  templateId?: string;
  templateSelection?: import('../types/reelProduction').TemplateSelectionInfo;
  hook: string;
  caption: string;
  hashtags: string[];
  mediaUrl: string;
  thumbnailUrl?: string;
  aspectRatio: '9:16';
  durationSeconds: number;
  scenesCount: number;
  generatedAt: string;
  targetPublishTime: string; // "21:00"
  targetPublishIso: string;
  timezone: string; // "Asia/Kolkata"
  reviewStatus: ReviewStatus;
  isApproved: boolean;
  approvalTimestamp?: string;
  approvalSource?: 'dashboard' | 'whatsapp' | 'api';
  publishStatus: PipelinePublishingStatus;
  metaPostId?: string;
  containerId?: string;
  permalink?: string;
  errorMessage?: string;
  qcPassed: boolean;
  qcViolations: string[];
  qualityScores?: {
    visualMatchScore: number;
    formatFitScore: number;
    editingScore: number;
    overallScore: number;
  };
  generationTimeSeconds?: number;
  rawScript?: string;
  scenes?: Array<{
    sceneNumber: number;
    block: string;
    narration: string;
    purpose?: string;
    onScreenHeadline?: string;
    onScreenSubtitle?: string;
    visualAssetType?: string;
    motion?: string;
    cameraMovement?: string;
    transition?: string;
    audioCue?: string;
    visualDescription?: string;
  }>;
  publishedAt?: string;
  isDemo: boolean;
}

const REVIEW_RECORDS_STORAGE_KEY = 'flash_ai_reviewable_reel_records';

const inMemoryFallbackStore = new Map<string, ReviewableReelRecord>();

export class ApprovalWorkflowEngine {
  private records: Map<string, ReviewableReelRecord> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  public getTodayReel(): ReviewableReelRecord | undefined {
    const list = Array.from(this.records.values()).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    return list[0];
  }

  public getAllRecords(): ReviewableReelRecord[] {
    return Array.from(this.records.values()).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  public getRecordById(id: string): ReviewableReelRecord | undefined {
    return this.records.get(id);
  }

  public upsertRecord(record: ReviewableReelRecord): void {
    this.records.set(record.id, record);
    this.saveToStorage();
  }

  private getStorageFilePath(): string | null {
    if (typeof window === 'undefined') {
      try {
        const proc = (globalThis as any).process;
        if (proc && typeof proc.getBuiltinModule === 'function') {
          const path = proc.getBuiltinModule('node:path');
          return path.resolve(proc.cwd(), 'data', 'storage', 'review_records.json');
        }
      } catch {}
    }
    return null;
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(REVIEW_RECORDS_STORAGE_KEY);
        if (raw) {
          const list: ReviewableReelRecord[] = JSON.parse(raw);
          list.forEach((r) => {
            this.records.set(r.id, r);
            inMemoryFallbackStore.set(r.id, r);
          });
        }
      } catch {
        // Storage fallback
      }
    } else {
      // Node.js / process environment fallback
      const filePath = this.getStorageFilePath();
      if (filePath) {
        try {
          const proc = (globalThis as any).process;
          const fs = proc.getBuiltinModule('node:fs');
          if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            const list: ReviewableReelRecord[] = JSON.parse(raw);
            list.forEach((r) => {
              this.records.set(r.id, r);
              inMemoryFallbackStore.set(r.id, r);
            });
          }
        } catch {}
      }

      inMemoryFallbackStore.forEach((val, key) => {
        this.records.set(key, val);
      });
    }

    // Ensure all stored records have persistent physical MP4 files on disk
    this.validateAndHealAllStoredReels();
  }

  /**
   * Synchronizes records fetched from backend server into local store.
   */
  public syncWithBackend(records: ReviewableReelRecord[]): void {
    if (!Array.isArray(records)) return;
    records.forEach((r) => {
      this.records.set(r.id, r);
    });
    this.saveToStorage();
  }

  /**
   * Scans all stored records, ensures the corresponding MP4 video exists on disk,
   * heals broken links, and preserves all metadata while keeping unapproved state.
   */
  public validateAndHealAllStoredReels(): void {
    for (const record of this.records.values()) {
      if (!record.mediaUrl || !record.mediaUrl.endsWith('.mp4')) {
        if (typeof window === 'undefined') {
          const synth = synthesizeAndStoreReelVideo({
            projectId: record.projectId || record.id,
            title: record.title,
            topic: record.topic,
            formatName: record.formatName,
            durationSeconds: record.durationSeconds || 5
          });
          record.mediaUrl = synth.outputVideoUrl;
          record.thumbnailUrl = synth.thumbnailUrl;
        }
      } else {
        // If running in Node, check if physical file is missing before synthesizing
        if (typeof window === 'undefined') {
          try {
            const proc = (globalThis as any).process;
            if (proc && typeof proc.getBuiltinModule === 'function') {
              const fs = proc.getBuiltinModule('node:fs');
              const path = proc.getBuiltinModule('node:path');
              if (fs && path) {
                const relative = decodeURIComponent(record.mediaUrl.replace(/^\/media\//, ''));
                const absPath = path.resolve(proc.cwd(), 'media', relative);
                if (!fs.existsSync(absPath)) {
                  synthesizeAndStoreReelVideo({
                    projectId: record.projectId || record.id,
                    title: record.title,
                    topic: record.topic,
                    formatName: record.formatName,
                    durationSeconds: record.durationSeconds || 5
                  });
                }
              }
            }
          } catch {}
        }
      }
    }
  }

  private saveToStorage(): void {
    inMemoryFallbackStore.clear();
    this.records.forEach((val, key) => inMemoryFallbackStore.set(key, val));

    if (typeof localStorage !== 'undefined') {
      try {
        const list = Array.from(this.records.values());
        localStorage.setItem(REVIEW_RECORDS_STORAGE_KEY, JSON.stringify(list));
      } catch {
        // Storage fallback
      }
    } else {
      const filePath = this.getStorageFilePath();
      if (filePath) {
        try {
          const proc = (globalThis as any).process;
          const fs = proc.getBuiltinModule('node:fs');
          const path = proc.getBuiltinModule('node:path');
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          const list = Array.from(this.records.values());
          fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
        } catch {}
      }
    }
  }

  /**
   * Calculates the target 21:00 Asia/Kolkata timestamp for today (or tomorrow if past 21:00).
   */
  public calculateTarget9PmSlot(nowDate: Date = new Date(), timezone: string = 'Asia/Kolkata'): {
    targetTimeFormatted: string;
    targetIso: string;
    isTomorrow: boolean;
  } {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    let currentHour = nowDate.getHours();
    let currentMinute = nowDate.getMinutes();

    try {
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(nowDate);
      const h = parts.find((p) => p.type === 'hour')?.value;
      const m = parts.find((p) => p.type === 'minute')?.value;
      if (h && m) {
        currentHour = parseInt(h, 10);
        currentMinute = parseInt(m, 10);
      }
    } catch {
      // fallback
    }

    const currentTotalMins = currentHour * 60 + currentMinute;
    const targetMins = 21 * 60; // 21:00 IST (9:00 PM)

    const isTomorrow = currentTotalMins >= targetMins;
    const targetDate = new Date(nowDate);
    if (isTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(21, 0, 0, 0);

    return {
      targetTimeFormatted: '9:00 PM IST',
      targetIso: targetDate.toISOString(),
      isTomorrow
    };
  }

  /**
   * 1. DAILY CONTENT WORKFLOW:
   * Verifies physical video file existence and stages a newly produced Reel into PENDING_REVIEW state.
   */
  public async stageReelForHumanReview(params: {
    project: ReelProductionProject;
    exportJob: ExportJob;
    timezone?: string;
    reviewUrlBase?: string;
  }): Promise<ReviewableReelRecord> {
    const { project, exportJob } = params;
    const timezone = params.timezone || 'Asia/Kolkata';

    // 1. Ensure persistent physical MP4 file is written to server
    let mediaUrl = exportJob?.outputVideoUrl;
    let thumbnailUrl = exportJob?.thumbnailUrl;

    if (!mediaUrl || !mediaUrl.endsWith('.mp4')) {
      const synthResult = await ensureReelVideoPersistedAsync({
        projectId: project.id,
        title: project.title,
        topic: project.topic,
        formatName: project.formatId,
        durationSeconds: project.totalDurationSeconds || 5
      });
      mediaUrl = synthResult.outputVideoUrl;
      thumbnailUrl = synthResult.thumbnailUrl;
    }

    // 2. Strict physical asset verification: block review if video is missing or unreadable
    const assetVerification = await verifyMediaAssetAsync(mediaUrl);
    if (!assetVerification.exists || !assetVerification.isReadable) {
      throw new Error(`Cannot stage Reel for review: Physical video asset verification failed for ${mediaUrl}`);
    }

    // 3. Pre-publish safety validation
    const safety = publishingPipelineEngine.validatePrePublishSafety(project, mediaUrl);
    if (!safety.isValid) {
      throw new Error(`Cannot stage Reel for review: Pre-publish QC failed (${safety.violations.join('; ')})`);
    }

    const slotInfo = this.calculateTarget9PmSlot(new Date(), timezone);

    const hashtags = [
      '#FLASHai',
      '#AIAutomation',
      '#Productivity',
      '#BusinessGrowth',
      '#TechTools',
      '#Workflows'
    ];

    const caption = `🚀 ${project.title}\n\n${project.scenes.map((s) => `▪ ${s.textOverlays[0]?.text || s.block}`).join('\n')}\n\n👉 Comment "AUTOMATE" or DM us to install this AI workflow.\n\n${hashtags.join(' ')}`;

    const reelId = `reel-${project.id}-${Date.now()}`;
    const record: ReviewableReelRecord = {
      id: reelId,
      reelId,
      projectId: project.id,
      title: project.title,
      topic: project.topic,
      formatId: project.formatId,
      formatName: project.formatId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      templateId: project.templateId,
      templateSelection: project.templateSelection,
      hook:
        project.scenes[0]?.audioSettings?.voiceoverText ||
        project.scenes[0]?.textOverlays[0]?.text ||
        project.title,
      caption,
      hashtags,
      mediaUrl,
      thumbnailUrl,
      aspectRatio: '9:16',
      durationSeconds: project.totalDurationSeconds,
      scenesCount: project.scenes.length,
      generatedAt: new Date().toISOString(),
      targetPublishTime: '21:00',
      targetPublishIso: slotInfo.targetIso,
      timezone,
      reviewStatus: 'PENDING_REVIEW',
      isApproved: false,
      publishStatus: 'PENDING_REVIEW',
      qcPassed: safety.isValid,
      qcViolations: safety.violations,
      errorMessage: safety.isValid ? undefined : safety.violations.join('; '),
      isDemo: instagramProviderManager.getMode() === 'DEMO'
    };

    this.records.set(record.id, record);
    this.saveToStorage();

    // Stage in underlying pipeline engine with PENDING_REVIEW
    publishingPipelineEngine.stageReelForPublishing({
      project,
      exportJob,
      scheduledFor: record.targetPublishIso,
      timezone
    });

    // 2. Dispatch Dashboard In-App Review Notification
    const baseUrl = params.reviewUrlBase || (typeof window !== 'undefined' ? window.location.origin : 'https://flash-ai.app');
    const reviewUrl = `${baseUrl}/#review-${record.id}`;
    await notificationManager.sendReviewNotification({
      reelId: record.id,
      title: record.title,
      topic: record.topic,
      formatName: record.formatName,
      targetPublishTime: '9:00 PM IST',
      reviewUrl,
      videoUrl: record.mediaUrl,
      captionPreview: record.caption.slice(0, 120) + '...'
    });

    return record;
  }

  /**
   * 3. APPROVAL SYSTEM — APPROVE:
   * Marks Reel as APPROVED and schedules it strictly for 21:00 Asia/Kolkata.
   */
  public approveReel(
    reelId: string,
    options?: { source?: 'dashboard' | 'whatsapp' | 'api' }
  ): ReviewableReelRecord {
    const record = this.records.get(reelId);
    if (!record) throw new Error(`Reel ${reelId} not found.`);

    if (record.publishStatus === 'PUBLISHED') {
      throw new Error(`Reel ${reelId} is already PUBLISHED.`);
    }

    record.reviewStatus = 'APPROVED';
    record.isApproved = true;
    record.approvalTimestamp = new Date().toISOString();
    record.approvalSource = options?.source || 'dashboard';
    record.publishStatus = 'SCHEDULED';
    record.errorMessage = undefined;

    this.saveToStorage();
    return record;
  }

  /**
   * 3. APPROVAL SYSTEM — REJECT:
   * Marks Reel as REJECTED and removes it from the active publishing queue.
   */
  public rejectReel(reelId: string, reason?: string): ReviewableReelRecord {
    const record = this.records.get(reelId);
    if (!record) throw new Error(`Reel ${reelId} not found.`);

    record.reviewStatus = 'REJECTED';
    record.isApproved = false;
    record.publishStatus = 'REJECTED';
    record.errorMessage = reason || 'Rejected by user during human review.';

    this.saveToStorage();
    return record;
  }

  /**
   * 3. APPROVAL SYSTEM — REGENERATE:
   * Generates a fresh production Reel version and resets state to PENDING_REVIEW.
   */
  public async regenerateReel(reelId: string): Promise<ReviewableReelRecord> {
    const existing = this.records.get(reelId);
    const preferredPillar = existing ? 'ai-automation' : 'ai-tools';

    // Generate fresh candidate with distinct variety
    const candidates = contentPlanningEngine.generateCandidateIdeas(4, preferredPillar);
    const bestCandidate = contentPlanningEngine.selectBestIdea(candidates);
    const plannedItem = contentPlanningEngine.commitPlanItem(bestCandidate);

    if (!plannedItem.productionPackage) {
      throw new Error('Failed to generate fresh production Reel package.');
    }

    const project = reelProductionPipeline.createProjectFromPackage({
      reelPackage: plannedItem.productionPackage
    });

    const exportJob = await reelProductionPipeline.exportProject(project.id);
    return this.stageReelForHumanReview({
      project,
      exportJob,
      timezone: existing?.timezone || 'Asia/Kolkata'
    });
  }

  /**
   * 4 & 6. 9:00 PM SCHEDULER & DUPLICATE PUBLISH PROTECTION:
   * Executes publishing at 21:00 IST IF AND ONLY IF the Reel is approved.
   */
  public async executeScheduledPublishAt9PM(reelId: string): Promise<ReviewableReelRecord> {
    const record = this.records.get(reelId);
    if (!record) throw new Error(`Reel ${reelId} not found.`);

    // 1. Idempotency Check: Prevent duplicate publishing
    if (record.publishStatus === 'PUBLISHED' || record.metaPostId) {
      console.warn(`[ApprovalWorkflowEngine] Duplicate publish blocked for Reel ${reelId}. Already published with ID: ${record.metaPostId}`);
      return record;
    }

    // 2. Explicit Human Approval Verification
    if (!record.isApproved || record.reviewStatus !== 'APPROVED') {
      record.publishStatus = 'FAILED';
      record.errorMessage = 'Cannot publish: Mandatory human approval is required before 9:00 PM publishing.';
      this.saveToStorage();
      throw new Error(record.errorMessage);
    }

    // 3. QC Safety Check
    if (!record.qcPassed) {
      record.publishStatus = 'FAILED';
      record.errorMessage = `Cannot publish: Pre-publish QC failed (${record.qcViolations.join('; ')})`;
      this.saveToStorage();
      throw new Error(record.errorMessage);
    }

    record.publishStatus = 'PROCESSING';
    this.saveToStorage();

    try {
      // 4. Publish via Live Meta Instagram Provider
      const result = await instagramProviderManager.publishReel({
        contentId: record.projectId,
        title: record.title,
        caption: record.caption,
        mediaUrl: record.mediaUrl,
        mediaType: 'REELS',
        isDemo: record.isDemo
      });

      if (!result.success) {
        throw new Error(result.error || 'Meta Instagram publishing failed.');
      }

      record.publishStatus = 'PUBLISHED';
      record.metaPostId = result.metaPostId;
      record.containerId = result.containerId;
      record.permalink = result.permalink;
      record.publishedAt = result.publishedAt || new Date().toISOString();
      record.errorMessage = undefined;

      // Commit to persistent Content Memory
      contentMemoryService.commitContent({
        id: `mem-${record.id}`,
        topic: record.topic,
        hook: record.hook,
        formatId: record.formatId,
        scriptConcept: record.title,
        visualConcept: 'Screen recording demo'
      });
    } catch (err: any) {
      record.publishStatus = 'FAILED';
      record.errorMessage = err.message || 'Publish execution error';
    }

    this.saveToStorage();
    return record;
  }

  /**
   * 5. MISSED SCHEDULE SAFETY:
   * Inspects all pending/scheduled jobs when server starts/ticks.
   * If 21:00 passed while server was offline:
   * - If unapproved -> MISSED_REVIEW_WINDOW (never publishes)
   * - If approved -> MISSED (safe handling, no duplicate)
   */
  public checkAndHandleMissedSchedules(currentTime: Date = new Date()): {
    missedUnapprovedCount: number;
    missedApprovedCount: number;
  } {
    let missedUnapprovedCount = 0;
    let missedApprovedCount = 0;

    const nowMs = currentTime.getTime();

    for (const record of this.records.values()) {
      if (record.publishStatus === 'PUBLISHED' || record.publishStatus === 'REJECTED') {
        continue;
      }

      const targetMs = new Date(record.targetPublishIso).getTime();

      // If scheduled time has passed by more than 15 minutes
      if (targetMs < nowMs - 15 * 60 * 1000) {
        if (!record.isApproved || record.reviewStatus !== 'APPROVED') {
          // Unapproved job whose review window passed -> Mark MISSED_REVIEW_WINDOW
          record.reviewStatus = 'MISSED_REVIEW_WINDOW';
          record.publishStatus = 'MISSED_REVIEW_WINDOW';
          record.errorMessage = 'Review window expired at 9:00 PM IST without human approval. Publishing safely blocked.';
          missedUnapprovedCount++;
        } else {
          // Approved job whose time passed while offline -> Mark MISSED (requires safe reschedule)
          record.publishStatus = 'MISSED';
          record.errorMessage = 'Server was offline at 9:00 PM IST. Reel is approved and ready for safe reschedule.';
          missedApprovedCount++;
        }
      }
    }

    this.saveToStorage();
    return {
      missedUnapprovedCount,
      missedApprovedCount
    };
  }
}

export const approvalWorkflowEngine = new ApprovalWorkflowEngine();
