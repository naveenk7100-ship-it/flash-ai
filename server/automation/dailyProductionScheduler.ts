import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '../utils/logger.ts';
import { serverMetaService } from '../metaApiService.ts';
import { fastReelEngine } from '../media/fastReelEngine.ts';
import { notificationService } from './notificationService.ts';
import { PublicMediaValidator } from '../media/publicMediaValidator.ts';
import { trendDiscoveryEngine } from '../trends/trendDiscoveryEngine.ts';
import { automationSettingsManager } from './automationSettings.ts';

export interface DailyWorkflowStatus {
  timezone: string; // 'Asia/Kolkata'
  generationTime: string; // '12:00'
  publishTime: string; // '21:00'
  currentIstTime: string;
  isWithinReviewWindow: boolean;
  todayReel: any | null;
  workflowStage: 'AWAITING_GENERATION' | 'GENERATED_PENDING_REVIEW' | 'APPROVED_SCHEDULED' | 'PUBLISHED' | 'MISSED_REVIEW' | 'REJECTED' | 'HELD_FAILED';
  metaLiveConfigured: boolean;
  metaAccount: string;
  autonomousPublishingEnabled: boolean;
}

export class DailyProductionScheduler {
  private timezone = 'Asia/Kolkata';
  private generationHour = 12; // 12:00 PM IST
  private publishHour = 21;    // 9:00 PM IST
  private static globalInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private getStoragePath(): string {
    return path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
  }

  public getRecords(): any[] {
    const filePath = this.getStoragePath();
    if (!fs.existsSync(filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
    } catch {
      return [];
    }
  }

  public saveRecords(records: any[]): void {
    const filePath = this.getStoragePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
  }

  private updateSingleRecord(record: any): void {
    const records = this.getRecords();
    const idx = records.findIndex((r) => r.id === record.id || r.reelId === record.reelId);
    if (idx !== -1) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    this.saveRecords(records);
  }

  public getTodayReel(): any | null {
    const records = this.getRecords();
    if (records.length === 0) return null;
    return records.sort((a, b) => new Date(b.generatedAt || 0).getTime() - new Date(a.generatedAt || 0).getTime())[0] || null;
  }

  /**
   * Retrieves current time components in Asia/Kolkata timezone.
   */
  public getIstDate(now: Date = new Date()): {
    dateStr: string;
    hour: number;
    minute: number;
    totalMinutes: number;
    formattedTime: string;
  } {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(now);

    const year = parts.find((p) => p.type === 'year')?.value || '2026';
    const month = parts.find((p) => p.type === 'month')?.value || '10';
    const day = parts.find((p) => p.type === 'day')?.value || '09';
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    return {
      dateStr: `${year}-${month}-${day}`,
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
      formattedTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`
    };
  }

  /**
   * Evaluates the current workflow stage and system status.
   */
  public getWorkflowStatus(): DailyWorkflowStatus {
    const ist = this.getIstDate();
    const todayReel = this.getTodayReel();
    const isMetaConfigured = serverMetaService.isConfigured();
    const settings = automationSettingsManager.getSettings();

    const isWithinWindow = ist.hour >= this.generationHour && ist.hour < this.publishHour;

    let workflowStage: DailyWorkflowStatus['workflowStage'] = 'AWAITING_GENERATION';

    if (todayReel) {
      if (todayReel.publishStatus === 'PUBLISHED') {
        workflowStage = 'PUBLISHED';
      } else if (todayReel.reviewStatus === 'REJECTED' || todayReel.publishStatus === 'HOLD' || todayReel.publishStatus === 'FAILED' || todayReel.reviewStatus === 'HELD_FAILED') {
        workflowStage = 'HELD_FAILED';
      } else if (todayReel.reviewStatus === 'MISSED_REVIEW_WINDOW' || todayReel.publishStatus === 'NOT_PUBLISHED') {
        workflowStage = 'MISSED_REVIEW';
      } else if (todayReel.isApproved && todayReel.reviewStatus === 'APPROVED') {
        workflowStage = 'APPROVED_SCHEDULED';
      } else {
        workflowStage = 'GENERATED_PENDING_REVIEW';
      }
    }

    return {
      timezone: this.timezone,
      generationTime: '12:00',
      publishTime: '21:00',
      currentIstTime: ist.formattedTime,
      isWithinReviewWindow: isWithinWindow,
      todayReel,
      workflowStage,
      metaLiveConfigured: isMetaConfigured,
      metaAccount: '@flash__ai__digital',
      autonomousPublishingEnabled: settings.autoPublish !== false
    };
  }

  /**
   * Generates today's Reel autonomously from fresh live trends.
   * Automatically approves only when all mandatory QC gates pass.
   */
  public async generateDailyAutonomousReel(customTopic?: string): Promise<any> {
    Logger.info('[DailyProductionScheduler] Starting autonomous trend-driven daily Reel production...');
    
    let topicToUse = customTopic;
    let trendSourceData: any = null;

    if (!topicToUse) {
      const trendReport = await trendDiscoveryEngine.discoverDailyTrends(false);
      const topTrend = trendReport.topSelectedTrend;
      if (topTrend) {
        topicToUse = topTrend.title;
        trendSourceData = topTrend;
      } else {
        topicToUse = 'Everyday AI Productivity: Modern Workflows Without Code';
      }
    }

    const genResult = await fastReelEngine.generateFastReel({
      mode: 'DAILY_DISCOVERY',
      topic: topicToUse,
      formatId: trendSourceData?.reelConcept?.suggestedFormat || 'ai-update'
    });

    if (genResult.success && genResult.reelRecord) {
      const record = genResult.reelRecord;
      const settings = automationSettingsManager.getSettings();

      // MANDATORY QUALITY CONTROL GATE
      if (record.qcPassed === true) {
        if (settings.requireHumanApproval === false) {
          // AUTONOMOUS APPROVAL MODE: Auto-approve on 10/10 QC pass
          record.isApproved = true;
          record.reviewStatus = 'APPROVED';
          record.publishStatus = 'SCHEDULED';
          record.targetPublishTime = '21:00';
          record.targetPublishIso = this.calculateTargetPublishIso();
          record.approvalTimestamp = new Date().toISOString();
          record.approvalSource = 'autonomous_qc_engine';
          record.errorMessage = undefined;

          this.updateSingleRecord(record);

          Logger.info(`[DailyProductionScheduler] Reel "${record.title}" passed 10-Gate QC. AUTONOMOUSLY APPROVED & SCHEDULED for 21:00 IST.`, {
            component: 'Scheduler',
            reelId: record.id
          });

          notificationService.addNotification(
            'REEL_AUTONOMOUS_APPROVED',
            'Autonomous Reel Ready & Scheduled',
            `"${record.title}" passed 10-Gate QC. Scheduled for 9:00 PM IST auto-publish.`,
            'approval'
          );
        } else {
          // MANUAL APPROVAL MODE: Hold in PENDING_REVIEW for operator sign-off
          record.isApproved = false;
          record.reviewStatus = 'PENDING_REVIEW';
          record.publishStatus = 'PENDING_REVIEW';
          record.targetPublishTime = '21:00';
          record.targetPublishIso = this.calculateTargetPublishIso();

          this.updateSingleRecord(record);

          Logger.info(`[DailyProductionScheduler] Reel "${record.title}" generated. Manual approval mode active. PENDING_REVIEW before 21:00 IST.`, {
            component: 'Scheduler',
            reelId: record.id
          });

          notificationService.addNotification(
            'REEL_NEEDS_REVIEW',
            'Reel Ready for Review',
            `"${record.title}" is ready. Manual review required prior to 9:00 PM IST.`,
            'approval'
          );
        }
      } else {
        // MANDATORY QC FAILURE HOLD: Never bypass safety gates
        record.isApproved = false;
        record.reviewStatus = 'HELD_FAILED';
        record.publishStatus = 'HOLD';
        record.errorMessage = `Reel held: Mandatory 10-Gate QC failed: ${(record.qcViolations || ['Quality checks did not meet production standards']).join('; ')}`;

        this.updateSingleRecord(record);

        Logger.warn(`[DailyProductionScheduler] Reel "${record.title}" failed mandatory QC. HELD FROM PUBLISHING: ${record.errorMessage}`, {
          component: 'Scheduler',
          reelId: record.id
        });

        notificationService.addNotification(
          'REEL_QC_FAILED',
          'Quality Gate Failure (Reel Held)',
          `"${record.title}" held from publishing due to QC violations: ${(record.qcViolations || []).join('; ')}`,
          'system'
        );
      }

      return record;
    } else {
      notificationService.addNotification(
        'REEL_GENERATION_FAILED',
        'Daily Reel Generation Alert',
        `Generation held: ${genResult.errorMessage || 'Validation check failed.'}`,
        'system'
      );
      throw new Error(genResult.errorMessage || 'Autonomous daily Reel generation failed.');
    }
  }

  /**
   * Approves a Reel for publishing.
   */
  public approveReel(reelId: string, source: 'dashboard' | 'api' = 'dashboard'): any {
    const records = this.getRecords();
    const idx = records.findIndex((r) => r.id === reelId || r.reelId === reelId);
    if (idx === -1) {
      throw new Error(`Reel with ID ${reelId} not found`);
    }

    const record = records[idx];

    if (record.publishStatus === 'PUBLISHED') {
      throw new Error(`Reel ${reelId} has already been published to Instagram.`);
    }

    const physicalPath = record.mediaPath || (record.mediaUrl?.startsWith('/media/') ? path.join(process.cwd(), record.mediaUrl.replace(/^\//, '')) : null);
    if (!physicalPath || !fs.existsSync(physicalPath) || fs.statSync(physicalPath).size < 1000) {
      throw new Error(`Cannot approve Reel: Verified MP4 file is missing on disk at ${physicalPath || record.mediaPath || record.mediaUrl}`);
    }

    record.isApproved = true;
    record.reviewStatus = 'APPROVED';
    record.publishStatus = 'SCHEDULED';
    record.targetPublishTime = '21:00';
    record.targetPublishIso = this.calculateTargetPublishIso();
    record.approvalTimestamp = new Date().toISOString();
    record.approvalSource = source;
    record.errorMessage = undefined;

    records[idx] = record;
    this.saveRecords(records);

    Logger.info(`[DailyProductionScheduler] Reel "${record.title}" APPROVED. Scheduled for 21:00 IST.`, {
      component: 'Scheduler',
      reelId
    });

    notificationService.addNotification(
      'REEL_APPROVED',
      'Reel Approved & Scheduled',
      `"${record.title}" approved. Scheduled for 9:00 PM IST publish to @flash__ai__digital.`,
      'approval'
    );

    return record;
  }

  /**
   * Rejects a Reel from the publishing pipeline.
   */
  public rejectReel(reelId: string, reason: string = 'Rejected by operator'): any {
    const records = this.getRecords();
    const idx = records.findIndex((r) => r.id === reelId || r.reelId === reelId);
    if (idx === -1) {
      throw new Error(`Reel with ID ${reelId} not found`);
    }

    const record = records[idx];

    if (record.publishStatus === 'PUBLISHED') {
      throw new Error(`Cannot reject Reel ${reelId}: Already published.`);
    }

    record.isApproved = false;
    record.reviewStatus = 'REJECTED';
    record.publishStatus = 'REJECTED';
    record.errorMessage = reason;

    records[idx] = record;
    this.saveRecords(records);

    notificationService.addNotification(
      'REEL_REJECTED',
      'Reel Rejected',
      `"${record.title}" rejected. It will not be published.`,
      'approval'
    );

    return record;
  }

  /**
   * Asserts whether a Reel can be regenerated (fails if already published).
   */
  public assertCanRegenerate(reelId: string): void {
    const records = this.getRecords();
    const target = records.find((r) => r.id === reelId || r.reelId === reelId);
    if (target && target.publishStatus === 'PUBLISHED') {
      throw new Error(`Cannot regenerate Reel ${reelId}: already published to Instagram.`);
    }
  }

  /**
   * Core 9:00 PM IST Publishing Decision & Execution Gate:
   * - Enforces Idempotency (Never publishes duplicate).
   * - Validates Mandatory 10-Gate QC pass.
   * - Verifies Physical MP4 existence and integrity.
   * - Verifies Meta Graph API Authentication.
   * - Verifies Public HTTPS Delivery URL accessibility.
   * - Holds Reel with clear reason if any check fails.
   * - Supports dryRun for automated tests without posting to live Instagram.
   */
  public async execute9PmPublishSlot(reelId?: string, dryRun: boolean = false): Promise<{
    published: boolean;
    missed: boolean;
    reason: string;
    record?: any;
    metaResponse?: any;
  }> {
    const target = reelId
      ? this.getRecords().find((r) => r.id === reelId || r.reelId === reelId)
      : this.getTodayReel();

    if (!target) {
      return { published: false, missed: false, reason: 'No Reel record found for today.' };
    }

    // 1. Idempotency Check: Prevent duplicate publishing
    if (target.publishStatus === 'PUBLISHED' || target.metaPostId) {
      Logger.warn(`[DailyProductionScheduler] Duplicate publish prevented for ${target.id}. Already published with ID: ${target.metaPostId}`);
      return {
        published: true,
        missed: false,
        reason: 'Already published (duplicate prevented)',
        record: target
      };
    }

    // 2. Mandatory QC Verification
    if (target.qcPassed !== true) {
      target.isApproved = false;
      target.reviewStatus = 'HELD_FAILED';
      target.publishStatus = 'HOLD';
      target.errorMessage = `Publishing held: 10-Gate QC validation check failed: ${(target.qcViolations || ['Quality checks failed']).join('; ')}`;
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_HELD',
        'Publishing Blocked (QC Failure)',
        `Reel "${target.title}" held: Mandatory QC check failed.`,
        'system'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target
      };
    }

    // 3. Physical MP4 Existence & Integrity Verification
    const physicalPath = target.mediaPath || (target.mediaUrl?.startsWith('/media/') ? path.join(process.cwd(), target.mediaUrl.replace(/^\//, '')) : null);
    if (!physicalPath || !fs.existsSync(physicalPath) || fs.statSync(physicalPath).size < 1000) {
      target.isApproved = false;
      target.reviewStatus = 'HELD_FAILED';
      target.publishStatus = 'HOLD';
      target.errorMessage = `Publishing held: Verified MP4 file is missing or corrupted on disk at ${physicalPath || target.mediaPath || target.mediaUrl}`;
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_HELD',
        'Publishing Blocked (Missing Media)',
        `Reel "${target.title}" held: Rendered MP4 file missing on disk.`,
        'system'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target
      };
    }

    // 4. Approval Gate Check (Manual vs Autonomous Mode)
    const settings = automationSettingsManager.getSettings();
    if (settings.requireHumanApproval === true) {
      if (!target.isApproved || target.reviewStatus !== 'APPROVED') {
        Logger.warn(`[DailyProductionScheduler] 9:00 PM Slot reached, but Reel ${target.id} was NOT approved. Holding publish.`);
        
        target.reviewStatus = 'MISSED_REVIEW_WINDOW';
        target.publishStatus = 'NOT_PUBLISHED';
        target.errorMessage = 'Reel held: Quality approval was not granted prior to 9:00 PM IST.';
        this.updateSingleRecord(target);

        notificationService.addNotification(
          'REVIEW_WINDOW_MISSED',
          'Review Window Closed (9:00 PM IST)',
          `"${target.title}" was not approved before 9:00 PM IST. Post marked NOT_PUBLISHED.`,
          'approval'
        );

        return {
          published: false,
          missed: true,
          reason: target.errorMessage,
          record: target
        };
      }
    } else {
      // In autonomous mode with QC passed, ensure state is set to APPROVED / SCHEDULED
      if (target.qcPassed === true && (!target.isApproved || target.reviewStatus !== 'APPROVED')) {
        target.isApproved = true;
        target.reviewStatus = 'APPROVED';
        target.publishStatus = 'SCHEDULED';
        this.updateSingleRecord(target);
      }
    }

    // 5. Meta Graph API Authentication & Credentials Verification
    if (!serverMetaService.isConfigured()) {
      target.publishStatus = 'HOLD';
      target.errorMessage = 'Publishing held: Meta Graph API credentials not configured in server environment.';
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_HELD',
        'Publishing Blocked (Meta Credentials Missing)',
        'Meta Graph API access token or account ID is not configured.',
        'system'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target
      };
    }

    try {
      const credCheck = await serverMetaService.validateCredentials();
      if (!credCheck.valid) {
        target.publishStatus = 'HOLD';
        target.errorMessage = `Publishing held: Meta Graph API authentication token is invalid or expired: ${credCheck.error || 'Token verification failed'}`;
        this.updateSingleRecord(target);

        notificationService.addNotification(
          'PUBLISH_HELD',
          'Publishing Blocked (Invalid Meta Token)',
          `Meta Graph API authentication failed: ${credCheck.error}`,
          'system'
        );

        return {
          published: false,
          missed: false,
          reason: target.errorMessage,
          record: target
        };
      }
    } catch (authErr: any) {
      target.publishStatus = 'HOLD';
      target.errorMessage = `Publishing held: Meta Graph API authentication check error: ${authErr.message}`;
      this.updateSingleRecord(target);
      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target
      };
    }

    // 6. Public Media Delivery URL Verification
    const publicStatus = PublicMediaValidator.getStatus();
    const rawMediaUrl = target.mediaUrl || (target.mediaPath ? `/media/renders/${path.basename(target.mediaPath)}` : '');
    const resolvedMediaUrl = PublicMediaValidator.resolvePublicMediaUrl(rawMediaUrl);

    if (!publicStatus.isPubliclyAccessible && !dryRun) {
      target.publishStatus = 'HOLD';
      target.errorMessage = 'Publishing held: Public HTTPS media delivery URL unreachable for Meta container ingestion.';
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_HELD',
        'Publishing Blocked (Public URL Unreachable)',
        'Cannot ingest media to Meta without a reachable public HTTPS base URL (e.g. ngrok tunnel).',
        'system'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target
      };
    }

    // 7. Safe Dry-Run Mode Simulation (For Tests)
    if (dryRun) {
      Logger.info(`[DailyProductionScheduler] DRY-RUN publishing test passed for "${target.title}". Real Meta API call skipped.`);
      return {
        published: true,
        missed: false,
        reason: 'Dry-run publish simulation successful (preconditions verified, no live post created).',
        record: target
      };
    }

    // 8. Publish via Official Live Meta Graph API
    Logger.info(`[DailyProductionScheduler] Publishing APPROVED Reel "${target.title}" to @flash__ai__digital via LIVE Meta provider...`, {
      component: 'Scheduler',
      reelId: target.id
    });

    // Check if target already has an existing container ID from a prior attempt
    let existingContainerId = target.containerId;
    if (!existingContainerId && target.errorMessage && target.errorMessage.includes('Container ID: ')) {
      const match = target.errorMessage.match(/Container ID:\s*([0-9]+)/);
      if (match) {
        existingContainerId = match[1];
      }
    }

    if (existingContainerId) {
      try {
        const contStatus = await serverMetaService.checkMediaStatus(existingContainerId);
        if (contStatus.statusCode === 'FINISHED') {
          Logger.info(`[DailyProductionScheduler] Reusing existing FINISHED Meta container: ${existingContainerId}`);
        } else if (contStatus.statusCode === 'ERROR' || contStatus.statusCode === 'EXPIRED') {
          Logger.warn(`[DailyProductionScheduler] Previous container ${existingContainerId} status is ${contStatus.statusCode}. Discarding and creating fresh container.`);
          existingContainerId = undefined;
        }
      } catch {
        existingContainerId = undefined;
      }
    }

    let publishResult: any;
    try {
      publishResult = await serverMetaService.publishFullPipeline({
        mediaType: 'REELS',
        mediaUrl: resolvedMediaUrl,
        caption: target.caption,
        shareToFeed: true,
        existingContainerId
      });
    } catch (metaErr: any) {
      target.publishStatus = 'FAILED';
      target.errorMessage = `Meta Instagram publishing error: ${metaErr.message}`;
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_FAILURE',
        'Instagram Publishing Error',
        `Failed to publish "${target.title}": ${metaErr.message}`,
        'published'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target,
        metaResponse: { error: metaErr.message }
      };
    }

    if (!publishResult.success || !publishResult.metaPostId) {
      target.publishStatus = 'FAILED';
      target.errorMessage = publishResult.error || 'Meta Instagram publishing failed to return a valid post ID.';
      this.updateSingleRecord(target);

      notificationService.addNotification(
        'PUBLISH_FAILURE',
        'Instagram Publishing Failed',
        `Meta returned failure for "${target.title}": ${target.errorMessage}`,
        'published'
      );

      return {
        published: false,
        missed: false,
        reason: target.errorMessage,
        record: target,
        metaResponse: publishResult
      };
    }

    // 9. Update Record with Real Meta Post Confirmation
    target.publishStatus = 'PUBLISHED';
    target.metaPostId = publishResult.metaPostId;
    target.containerId = publishResult.containerId;
    target.permalink = publishResult.permalink || `https://instagram.com/reel/${publishResult.metaPostId}`;
    target.publishedAt = publishResult.publishedAt || new Date().toISOString();
    target.errorMessage = undefined;
    this.updateSingleRecord(target);

    Logger.info(`[DailyProductionScheduler] SUCCESS: Published Reel to Instagram! Meta Post ID: ${publishResult.metaPostId}`, {
      component: 'Scheduler',
      metaPostId: publishResult.metaPostId
    });

    notificationService.addNotification(
      'PUBLISH_SUCCESS',
      'Reel Live on Instagram',
      `"${target.title}" successfully published to @flash__ai__digital!`,
      'published'
    );

    return {
      published: true,
      missed: false,
      reason: 'Published successfully to Instagram via Meta Graph API',
      record: target,
      metaResponse: publishResult
    };
  }

  private calculateTargetPublishIso(): string {
    const ist = this.getIstDate();
    const targetDate = new Date();
    if (ist.hour >= this.publishHour) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(21, 0, 0, 0);
    return targetDate.toISOString();
  }

  /**
   * Starts the background scheduler loop with singleton guarantee across server and dev environments.
   */
  public startSchedulerLoop(): void {
    if (DailyProductionScheduler.globalInterval || (globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__) {
      Logger.debug('[DailyProductionScheduler] Singleton background loop already active. Skipping duplicate initialization.');
      return;
    }

    Logger.info('[DailyProductionScheduler] Singleton background scheduler loop active (12:00 PM IST generate, 9:00 PM IST publish)', {
      component: 'Scheduler'
    });

    // Check every 60 seconds
    const interval = setInterval(async () => {
      await this.runScheduledTick();
    }, 60000);

    if (interval && typeof interval.unref === 'function') {
      interval.unref();
    }

    DailyProductionScheduler.globalInterval = interval;
    (globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__ = interval;

    // Graceful process exit cleanup
    if (typeof process !== 'undefined' && process.once) {
      process.once('SIGINT', () => this.stopSchedulerLoop());
      process.once('SIGTERM', () => this.stopSchedulerLoop());
    }
  }

  public stopSchedulerLoop(): void {
    if (DailyProductionScheduler.globalInterval) {
      clearInterval(DailyProductionScheduler.globalInterval);
      DailyProductionScheduler.globalInterval = null;
    }
    if ((globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__) {
      clearInterval((globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__);
      (globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__ = null;
    }
  }

  public isLoopActive(): boolean {
    return Boolean(DailyProductionScheduler.globalInterval || (globalThis as any).__FLASH_AI_DAILY_SCHEDULER_LOOP__);
  }

  public async runScheduledTick(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const ist = this.getIstDate();

      // Check 1: 12:00 PM IST Daily Generation Slot
      if (ist.hour === this.generationHour && ist.minute === 0) {
        const today = this.getTodayReel();
        const todayStr = ist.dateStr;
        const alreadyGeneratedToday = today && today.generatedAt && today.generatedAt.startsWith(todayStr);

        if (!alreadyGeneratedToday) {
          Logger.info(`[DailyProductionScheduler] 12:00 PM IST arrived. Triggering daily autonomous Reel generation from fresh trends...`);
          await this.generateDailyAutonomousReel();
        }
      }

      // Check 2: 9:00 PM IST Daily Publish Slot
      if (ist.hour === this.publishHour && ist.minute === 0) {
        Logger.info(`[DailyProductionScheduler] 9:00 PM IST arrived. Evaluating publish eligibility...`);
        await this.execute9PmPublishSlot();
      }
    } catch (err: any) {
      Logger.error('[DailyProductionScheduler] Error in scheduler tick', { component: 'Scheduler' }, err);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const dailyProductionScheduler = new DailyProductionScheduler();

