/**
 * FLASH.Ai Automation Scheduler & OS Controller (Phase 3 - Requirements 3 & 4)
 * 
 * Supports:
 * - Master Dashboard Control: AUTOMATION ON / AUTOMATION OFF
 * - Default timezone: Asia/Kolkata
 * - Configurable posting frequency (1, 2, 3 Reels/day)
 * - Configurable posting timeslots (e.g. 11:00, 18:00, 21:00 IST)
 * - Next scheduled Reel calculation
 * - Pause / resume automation
 * - Full autonomous loop: Fresh Concept → Reel Package → 10-Gate QC → Queue → Schedule/Publish
 * - Safety check: strictly blocks publishing if QC fails
 */

import { contentPlanningEngine } from './contentPlanningEngine';
import { reelProductionPipeline } from './reelProductionPipeline';
import { publishingPipelineEngine, type PublishingPipelineJob } from './publishingPipelineEngine';
import { approvalWorkflowEngine, type ReviewableReelRecord } from './approvalWorkflowEngine';

export interface SchedulerConfig {
  automationEnabled: boolean;
  timezone: string; // Default: 'Asia/Kolkata'
  reelsPerDay: 1 | 2 | 3;
  scheduleSlots: string[];
  autoPublish: boolean;
  requireHumanApproval: boolean;
  concurrency: number;
}

export interface NextScheduledSlotInfo {
  nextSlotTime: string;
  nextSlotIso: string;
  countdownString: string;
  slotIndex: number;
  timezone: string;
}

const SCHEDULER_CONFIG_STORAGE_KEY = 'flash_ai_automation_scheduler_config';

export class AutomationScheduler {
  private config: SchedulerConfig = {
    automationEnabled: true,
    timezone: 'Asia/Kolkata',
    reelsPerDay: 1,
    scheduleSlots: ['21:00'],
    autoPublish: false,
    requireHumanApproval: true,
    concurrency: 1
  };

  constructor() {
    this.loadFromStorage();
  }

  public getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<SchedulerConfig>): SchedulerConfig {
    this.config = {
      ...this.config,
      ...partial,
      reelsPerDay: (partial.reelsPerDay && [1, 2, 3].includes(partial.reelsPerDay)
        ? partial.reelsPerDay
        : this.config.reelsPerDay) as 1 | 2 | 3
    };
    this.saveToStorage();
    return this.getConfig();
  }

  public toggleAutomation(enabled?: boolean): boolean {
    this.config.automationEnabled =
      enabled !== undefined ? enabled : !this.config.automationEnabled;
    this.saveToStorage();
    return this.config.automationEnabled;
  }

  /**
   * Calculates the next scheduled Reel publishing slot in the configured timezone.
   */
  public getNextScheduledSlot(): NextScheduledSlotInfo {
    const slots = this.config.scheduleSlots.length > 0
      ? this.config.scheduleSlots
      : ['18:00'];

    const now = new Date();
    // Format current time in configured timezone (Asia/Kolkata)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.config.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    let currentHour = now.getHours();
    let currentMinute = now.getMinutes();

    try {
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(now);
      const h = parts.find((p) => p.type === 'hour')?.value;
      const m = parts.find((p) => p.type === 'minute')?.value;
      if (h && m) {
        currentHour = parseInt(h, 10);
        currentMinute = parseInt(m, 10);
      }
    } catch {
      // fallback
    }

    const currentMinsTotal = currentHour * 60 + currentMinute;

    let targetSlot = slots[0];
    let targetIndex = 0;
    let isTomorrow = true;

    for (let i = 0; i < slots.length; i++) {
      const [sh, sm] = slots[i].split(':').map((v) => parseInt(v, 10));
      const slotMins = sh * 60 + (sm || 0);
      if (slotMins > currentMinsTotal) {
        targetSlot = slots[i];
        targetIndex = i;
        isTomorrow = false;
        break;
      }
    }

    const [th, tm] = targetSlot.split(':').map((v) => parseInt(v, 10));
    const targetDate = new Date(now);
    if (isTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(th, tm || 0, 0, 0);

    const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const countdownString =
      diffHours > 0
        ? `in ${diffHours}h ${diffMins}m`
        : `in ${diffMins}m`;

    return {
      nextSlotTime: targetSlot,
      nextSlotIso: targetDate.toISOString(),
      countdownString: isTomorrow ? `${countdownString} (Tomorrow)` : countdownString,
      slotIndex: targetIndex + 1,
      timezone: this.config.timezone
    };
  }

  /**
   * Executes a complete autonomous cycle (Requirement 4):
   * 1. Select fresh topic & candidate scoring
   * 2. Generate structured Reel package (5 blocks)
   * 3. Run 10-Gate QC validation
   * 4. Assemble scenes and render export
   * 5. Place into queue and schedule/publish
   */
  public async executeAutonomousCycle(): Promise<{
    success: boolean;
    job?: PublishingPipelineJob;
    reviewRecord?: ReviewableReelRecord;
    error?: string;
  }> {
    if (!this.config.automationEnabled) {
      return { success: false, error: 'Automation is currently OFF.' };
    }

    try {
      // 1. Generate & select fresh candidate idea
      const candidates = contentPlanningEngine.generateCandidateIdeas(4, 'ai-automation');
      const bestCandidate = contentPlanningEngine.selectBestIdea(candidates);
      if (!bestCandidate) {
        throw new Error('No valid content candidate generated.');
      }

      // 2. Commit plan item & Reel package
      const plannedItem = contentPlanningEngine.commitPlanItem(bestCandidate);

      if (!plannedItem.productionPackage) {
        throw new Error('Reel package assembly failed.');
      }

      // 3. Assemble full Reel Production Project (with scene assets, pacing, captions, ducking)
      const project = reelProductionPipeline.createProjectFromPackage({
        reelPackage: plannedItem.productionPackage
      });

      // 4. Run 10-Gate Quality Control
      if (!project.qcReport.passed) {
        throw new Error(`QC safety check rejected Reel: ${project.qcReport.checks.filter((c) => c.fatal && !c.passed).map((c) => c.message).join(' ')}`);
      }

      // 5. Render Vertical Video
      const exportJob = await reelProductionPipeline.exportProject(project.id);

      // 6. Stage for Human Review and 9:00 PM Publishing
      const reviewRecord = await approvalWorkflowEngine.stageReelForHumanReview({
        project,
        exportJob,
        timezone: this.config.timezone
      });

      const nextSlot = this.getNextScheduledSlot();
      const pipelineJob = publishingPipelineEngine.stageReelForPublishing({
        project,
        exportJob,
        scheduledFor: this.config.autoPublish ? undefined : nextSlot.nextSlotIso,
        timezone: this.config.timezone
      });

      // 7. If autoPublish is explicitly enabled AND human review is disabled, publish; otherwise keep PENDING_REVIEW
      if (this.config.autoPublish && !this.config.requireHumanApproval) {
        await publishingPipelineEngine.executePublishJob(pipelineJob.id);
      }

      return {
        success: true,
        job: pipelineJob,
        reviewRecord
      };
    } catch (err: any) {
      console.error('[AutomationScheduler] Cycle error:', err);
      return {
        success: false,
        error: err.message || 'Autonomous cycle encountered an error'
      };
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(SCHEDULER_CONFIG_STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch {
      // Storage unavailable
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SCHEDULER_CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Storage unavailable
    }
  }
}

export const automationScheduler = new AutomationScheduler();
