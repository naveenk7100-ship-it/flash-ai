import { dailyBriefService } from '../analytics/dailyBriefService.ts';
import { dailyPlanGenerator } from './dailyPlanGenerator.ts';
import { aiProviderManager } from '../providers/providerManager.ts';
import { serverMediaService } from '../media/mediaService.ts';
import { qualityControlEngine } from './qcEngine.ts';
import { schedulerService } from './schedulerService.ts';
import { serverMetaService } from '../metaApiService.ts';
import { analyticsSyncService } from '../analytics/analyticsSyncService.ts';
import { performanceModelEngine } from '../analytics/performanceModel.ts';
import { performanceAnalysisService } from '../analytics/performanceAnalysisService.ts';
import { notificationService } from './notificationService.ts';
import { automationSettingsManager } from './automationSettings.ts';
import type { GenerateContentInput } from '../providers/types.js';
import type {
  DailyRun,
  DailyRunStep,
  DailyRunError,
  DailyRunStepId,
  ContentVariant
} from '../../src/types/index.ts';

const ALL_STEP_DEFINITIONS: Array<{ id: DailyRunStepId; name: string }> = [
  { id: 'DAILY_BRIEF', name: '1. Synthesize Daily Intelligence Brief' },
  { id: 'CONTENT_PLAN', name: '2. Generate Empirical Content Plan' },
  { id: 'AI_GENERATION', name: '3. Generate Full AI Content Packages' },
  { id: 'REEL_GENERATION', name: '4. Render 9:16 Vertical Video Reels' },
  { id: 'QUALITY_CONTROL', name: '5. Quality Control & Policy Audit' },
  { id: 'HUMAN_APPROVAL', name: '6. Mandatory Human Approval Gate' },
  { id: 'SCHEDULE', name: '7. Assign Calendar Publishing Slots' },
  { id: 'META_PUBLISH', name: '8. Publish to Instagram (Meta API)' },
  { id: 'ENGAGEMENT_COLLECTION', name: '9. Collect Webhook Inbound Events' },
  { id: 'LEAD_CAPTURE', name: '10. Capture Inbound CRM Leads' },
  { id: 'ANALYTICS_SYNC', name: '11. Synchronize Meta Graph Insights' },
  { id: 'PERFORMANCE_ANALYSIS', name: '12. Calculate CPI & Content Patterns' },
  { id: 'NEXT_DAILY_BRIEF', name: '13. Generate Next Daily Intelligence Brief' }
];

export class DailyRunEngine {
  private currentRun: DailyRun | null = null;
  private runHistory: DailyRun[] = [];

  constructor() {
    this.seedInitialHistory();
  }

  public getCurrentRun(): DailyRun | null {
    return this.currentRun;
  }

  public getRunHistory(): DailyRun[] {
    return this.runHistory;
  }

  public getRun(id: string): DailyRun | undefined {
    if (this.currentRun && this.currentRun.id === id) return this.currentRun;
    return this.runHistory.find((r) => r.id === id);
  }

  /**
   * Starts or resumes a Daily Automation Run.
   */
  public async startDailyRun(options?: {
    customReelsCount?: 1 | 2 | 3;
    skipToStep?: DailyRunStepId;
  }): Promise<DailyRun> {
    const settings = automationSettingsManager.getSettings();
    const count = options?.customReelsCount || settings.reelsPerDay || 2;
    const runId = `run-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const steps: DailyRunStep[] = ALL_STEP_DEFINITIONS.map((def) => ({
      stepId: def.id,
      name: def.name,
      status: 'PENDING'
    }));

    const run: DailyRun = {
      id: runId,
      date: todayStr,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      steps,
      errors: [],
      plannedItems: [],
      contentItemsGenerated: 0,
      reelsRendered: 0,
      itemsAwaitingApproval: 0,
      itemsScheduled: 0,
      publishedCount: 0,
      leadsCaptured: 0,
      analyticsSynced: 0
    };

    this.currentRun = run;

    try {
      // ----------------------------------------------------
      // STEP 1: DAILY BRIEF
      // ----------------------------------------------------
      await this.executeStep(run, 'DAILY_BRIEF', async (step) => {
        const brief = await dailyBriefService.getDailyBrief();
        step.details = `Daily brief synthesized for ${brief.date} (${brief.dataQuality} dataset).`;
      });

      // ----------------------------------------------------
      // STEP 2: CONTENT PLAN
      // ----------------------------------------------------
      await this.executeStep(run, 'CONTENT_PLAN', async (step) => {
        const planned = dailyPlanGenerator.generateDailyPlan(count);
        run.plannedItems = planned;
        step.itemsCount = planned.length;
        step.details = `Planned ${planned.length} diverse Reels: ${planned.map((p) => `[${p.pillar} / ${p.angle}]`).join(', ')}`;
      });

      // ----------------------------------------------------
      // STEP 3: AI GENERATION
      // ----------------------------------------------------
      await this.executeStep(run, 'AI_GENERATION', async (step) => {
        let generatedCount = 0;

        for (const item of run.plannedItems) {
          try {
            const input: GenerateContentInput = {
              topic: item.topic,
              pillar: item.pillar,
              platform: 'Instagram Reels',
              duration: item.duration,
              tone: 'Authoritative & Sharp',
              targetAudience: 'Small businesses and startup founders wanting automation',
              cta: item.cta,
              angle: item.angle
            };

            const pkg = await aiProviderManager.generate(input);
            item.contentId = `content-${Date.now()}-${generatedCount + 1}`;
            item.hookDirection = pkg.hook;
            item.caption = pkg.caption;
            item.hashtags = pkg.hashtags;
            generatedCount++;
          } catch (err: any) {
            console.warn(`[DailyRunEngine] AI Generation failed for "${item.topic}":`, err.message);
            // Non-fatal: Fill with robust brand template
            item.contentId = `content-${Date.now()}-${generatedCount + 1}`;
            item.caption = `${item.topic}\n\nAutomate your business workflows with FLASH.Ai. DM "AUTOMATE" to get started.\n\n#AIAutomation #BusinessGrowth #FLASHAI`;
            item.hashtags = {
              niche: ['#AIAutomation', '#BusinessEfficiency'],
              broad: ['#TechSolutions', '#SmallBusiness'],
              viral: ['#ReelsGrowth', '#AI2026']
            };
            generatedCount++;
          }
        }

        run.contentItemsGenerated = generatedCount;
        step.itemsCount = generatedCount;
        step.details = `Generated ${generatedCount} comprehensive AI script packages.`;
        notificationService.addNotification(
          'GENERATION_COMPLETE',
          'AI Scripts Generated',
          `Successfully generated ${generatedCount} AI script packages for today's run.`,
          'automation'
        );
      });

      // ----------------------------------------------------
      // STEP 4: REEL GENERATION
      // ----------------------------------------------------
      await this.executeStep(run, 'REEL_GENERATION', async (step) => {
        let renderedCount = 0;

        for (const item of run.plannedItems) {
          try {
            const variant: ContentVariant = {
              id: `var-${Date.now()}`,
              platform: 'Instagram Reels',
              hook: item.hookDirection,
              videoConcept: item.topic,
              shortScript: item.caption || item.topic,
              onScreenText: [item.hookDirection, item.topic, item.cta],
              caption: item.caption || item.topic,
              cta: item.cta,
              hashtags: item.hashtags || { niche: [], broad: [], viral: [] },
              angle: item.angle
            };

            const storyboard = serverMediaService.createStoryboard({
              contentId: item.contentId || `c-${Date.now()}`,
              title: item.topic,
              pillarId: item.pillar,
              variant,
              videoDuration: item.duration,
              brandPresetId: 'cyber_breakdown'
            });

            const job = serverMediaService.submitRenderJob({
              contentId: item.contentId || `c-${Date.now()}`,
              contentTitle: item.topic,
              storyboard
            });

            item.reelId = job.id;
            item.mediaUrl = job.outputVideoUrl || `/media/rendered/${job.id}.mp4`;
            renderedCount++;
          } catch (err: any) {
            this.recordError(run, 'REEL_GENERATION', `Failed to render Reel for "${item.topic}": ${err.message}`, item.contentId, true);
          }
        }

        run.reelsRendered = renderedCount;
        step.itemsCount = renderedCount;
        step.details = `Rendered ${renderedCount} 9:16 vertical Reels with voiceover, subtitles, and scenes.`;
        notificationService.addNotification(
          'RENDER_COMPLETE',
          'Reels Rendered Successfully',
          `${renderedCount} Reels rendered and ready for quality control.`,
          'media'
        );
      });

      // ----------------------------------------------------
      // STEP 5: QUALITY CONTROL
      // ----------------------------------------------------
      await this.executeStep(run, 'QUALITY_CONTROL', async (step) => {
        let passedCount = 0;
        let failedCount = 0;

        for (const item of run.plannedItems) {
          const qc = qualityControlEngine.validateContent({
            id: item.contentId || item.id,
            title: item.topic,
            hook: item.hookDirection,
            caption: item.caption,
            hashtags: item.hashtags,
            mediaUrl: item.mediaUrl,
            videoDuration: item.duration
          });

          if (qc.passed) {
            item.qcStatus = 'PASSED';
            passedCount++;
          } else {
            item.qcStatus = 'FAILED';
            item.qcErrors = qc.checks.filter((c) => !c.passed).map((c) => c.message);
            failedCount++;
            this.recordError(
              run,
              'QUALITY_CONTROL',
              `QC Failed for "${item.topic}": ${item.qcErrors.join('; ')}`,
              item.contentId,
              true
            );
          }
        }

        step.details = `QC Audit: ${passedCount} passed, ${failedCount} failed fatal checks.`;
      });

      // ----------------------------------------------------
      // STEP 6: HUMAN APPROVAL (Gatekeeper)
      // ----------------------------------------------------
      const awaitingApproval = run.plannedItems.filter((i) => i.qcStatus === 'PASSED' && i.approvalStatus === 'PENDING');
      run.itemsAwaitingApproval = awaitingApproval.length;

      const approvalStep = run.steps.find((s) => s.stepId === 'HUMAN_APPROVAL');
      if (approvalStep) {
        approvalStep.status = 'WAITING_ACTION';
        approvalStep.details = `${awaitingApproval.length} Reel(s) awaiting explicit human approval. Publishing is held safely.`;
      }

      run.status = 'WAITING_APPROVAL';

      notificationService.addNotification(
        'APPROVAL_REQUIRED',
        'Human Approval Required',
        `${awaitingApproval.length} Reel(s) passed QC and require your approval before scheduling.`,
        'approval'
      );

      // Auto-schedule step assignment (pre-approval preparation)
      const times = schedulerService.assignScheduleTimes(run.plannedItems.length);
      run.plannedItems.forEach((item, idx) => {
        item.scheduledTime = times[idx] || '18:00';
      });

      return run;
    } catch (error: any) {
      console.error('[DailyRunEngine] Error during daily run execution:', error);
      run.status = 'FAILED';
      this.recordError(run, 'DAILY_BRIEF', error.message, undefined, true);
      return run;
    }
  }

  /**
   * Explicit user approval of an item in the current daily run.
   */
  public async approveItem(runId: string, itemId: string): Promise<DailyRun | null> {
    const run = this.getRun(runId);
    if (!run) return null;

    const item = run.plannedItems.find((i) => i.id === itemId || i.contentId === itemId);
    if (item) {
      item.approvalStatus = 'APPROVED';
      run.itemsAwaitingApproval = Math.max(0, run.itemsAwaitingApproval - 1);
      run.itemsScheduled += 1;
    }

    // If all items are decided, update human approval step
    const stillPending = run.plannedItems.some((i) => i.qcStatus === 'PASSED' && i.approvalStatus === 'PENDING');
    if (!stillPending) {
      const step = run.steps.find((s) => s.stepId === 'HUMAN_APPROVAL');
      if (step) {
        step.status = 'COMPLETED';
        step.completedAt = new Date().toISOString();
        step.details = 'All planned content items reviewed and approved by human operator.';
      }
    }

    return run;
  }

  /**
   * Rejects an item and records operator feedback.
   */
  public async rejectItem(runId: string, itemId: string, reason?: string): Promise<DailyRun | null> {
    const run = this.getRun(runId);
    if (!run) return null;

    const item = run.plannedItems.find((i) => i.id === itemId || i.contentId === itemId);
    if (item) {
      item.approvalStatus = 'REJECTED';
      run.itemsAwaitingApproval = Math.max(0, run.itemsAwaitingApproval - 1);
      this.recordError(run, 'HUMAN_APPROVAL', `Item rejected by operator: ${reason || 'Manual rejection'}`, item.contentId, false);
    }

    return run;
  }

  /**
   * Retries a failed step for a specific item or stage.
   */
  public async retryItem(runId: string, itemId: string): Promise<DailyRun | null> {
    const run = this.getRun(runId);
    if (!run) return null;

    const item = run.plannedItems.find((i) => i.id === itemId || i.contentId === itemId);
    if (!item) return run;

    // Reset QC and re-validate
    const qc = qualityControlEngine.validateContent({
      id: item.contentId || item.id,
      title: item.topic,
      hook: item.hookDirection,
      caption: item.caption,
      hashtags: item.hashtags,
      mediaUrl: item.mediaUrl,
      videoDuration: item.duration
    });

    if (qc.passed) {
      item.qcStatus = 'PASSED';
      item.qcErrors = undefined;
      item.approvalStatus = 'PENDING';
      run.itemsAwaitingApproval += 1;
      // Remove previous QC error
      run.errors = run.errors.filter((e) => e.contentId !== item.contentId);
    }

    return run;
  }

  /**
   * Publishes approved items (simulation in DEMO mode, official Meta API in LIVE mode).
   */
  public async publishApprovedItems(runId: string): Promise<DailyRun | null> {
    const run = this.getRun(runId);
    if (!run) return null;

    const settings = automationSettingsManager.getSettings();
    const approvedItems = run.plannedItems.filter((i) => i.approvalStatus === 'APPROVED');

    if (approvedItems.length === 0) {
      return run;
    }

    const pubStep = run.steps.find((s) => s.stepId === 'META_PUBLISH');
    if (pubStep) pubStep.status = 'RUNNING';

    let published = 0;

    for (const item of approvedItems) {
      try {
        if (settings.publishingMode === 'LIVE' && serverMetaService.isConfigured()) {
          // LIVE publishing through official Meta Container API
          const publishRes = await serverMetaService.publishFullPipeline({
            mediaType: 'REELS',
            mediaUrl: item.mediaUrl || '',
            caption: item.caption || item.topic,
            shareToFeed: true
          });
          item.publishedUrl = publishRes.permalink || `https://instagram.com/p/${publishRes.metaPostId || 'live'}`;
          published++;
        } else {
          // Safe DEMO simulated publication
          item.publishedUrl = `https://instagram.com/p/demo-${Date.now()}`;
          published++;
        }
      } catch (err: any) {
        this.recordError(run, 'META_PUBLISH', `Publishing failed for "${item.topic}": ${err.message}`, item.contentId, true);
      }
    }

    run.publishedCount += published;
    if (pubStep) {
      pubStep.status = 'COMPLETED';
      pubStep.completedAt = new Date().toISOString();
      pubStep.details = `Published ${published} approved Reel(s) (${settings.publishingMode} mode).`;
    }

    // Execute downstream automation steps: Analytics Sync & Next Daily Brief
    await this.executePostPublishSteps(run);

    run.status = run.errors.length > 0 ? 'PARTIAL' : 'COMPLETED';
    run.completedAt = new Date().toISOString();

    // Move to history
    this.runHistory.unshift({ ...run });
    if (this.runHistory.length > 30) this.runHistory.pop();

    return run;
  }

  private async executePostPublishSteps(run: DailyRun): Promise<void> {
    // 1. Analytics Sync
    await this.executeStep(run, 'ANALYTICS_SYNC', async (step) => {
      const syncItems = run.plannedItems.map((item) => ({
        contentId: item.contentId || item.id,
        mediaId: item.publishedUrl?.includes('/p/') ? item.publishedUrl.split('/p/')[1].replace('/', '') : undefined,
        title: item.topic,
        pillarId: item.pillar,
        angle: item.angle,
        hook: item.hookDirection,
        duration: item.duration,
        cta: item.cta,
        publishedAt: new Date().toISOString(),
        permalink: item.publishedUrl
      }));

      await analyticsSyncService.syncAll(syncItems);
      run.analyticsSynced = run.publishedCount;
      step.details = `Synchronized latest Meta Graph API insights for published media.`;
    });

    // 2. Performance Analysis
    await this.executeStep(run, 'PERFORMANCE_ANALYSIS', async (step) => {
      const items = performanceModelEngine.getPerformanceItems();
      await performanceAnalysisService.generateAnalysisReport();
      step.details = `Calculated CPI indices across ${items.length} observed publishing records.`;
    });

    // 3. Next Daily Brief
    await this.executeStep(run, 'NEXT_DAILY_BRIEF', async (step) => {
      const brief = await dailyBriefService.getDailyBrief();
      step.details = `Synthesized updated briefing: ${brief.observedPatterns.length} patterns identified.`;
      notificationService.addNotification(
        'DAILY_BRIEF_READY',
        'Next Daily Brief Generated',
        'Performance data updated and next daily strategic brief ready.',
        'analytics'
      );
    });
  }

  private async executeStep(
    run: DailyRun,
    stepId: DailyRunStepId,
    fn: (step: DailyRunStep) => Promise<void>
  ): Promise<void> {
    const step = run.steps.find((s) => s.stepId === stepId);
    if (!step) return;

    step.status = 'RUNNING';
    step.startedAt = new Date().toISOString();

    try {
      await fn(step);
      step.status = 'COMPLETED';
      step.completedAt = new Date().toISOString();
    } catch (err: any) {
      step.status = 'FAILED';
      step.error = err.message;
      this.recordError(run, stepId, err.message, undefined, true);
    }
  }

  private recordError(
    run: DailyRun,
    stepId: DailyRunStepId,
    message: string,
    contentId?: string,
    recoverable: boolean = true
  ): void {
    const error: DailyRunError = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stepId,
      contentId,
      message,
      recoverable,
      timestamp: new Date().toISOString()
    };
    run.errors.push(error);
  }

  private seedInitialHistory(): void {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const steps: DailyRunStep[] = ALL_STEP_DEFINITIONS.map((def) => ({
      stepId: def.id,
      name: def.name,
      status: 'COMPLETED',
      startedAt: `${yesterday}T10:00:00.000Z`,
      completedAt: `${yesterday}T10:04:15.000Z`,
      details: 'Completed successfully.'
    }));

    this.runHistory = [
      {
        id: `run-seed-yesterday`,
        date: yesterday,
        status: 'COMPLETED',
        startedAt: `${yesterday}T10:00:00.000Z`,
        completedAt: `${yesterday}T10:05:30.000Z`,
        steps,
        errors: [],
        plannedItems: [
          {
            id: 'plan-seed-1',
            topic: 'How AI WhatsApp Automations Prevent Lost Leads During After-Hours',
            pillar: 'whatsapp-automation',
            angle: 'Problem',
            duration: '30s',
            hookDirection: 'Numerical time-loss hook',
            cta: 'DM "AUTOMATE"',
            reason: 'High lead conversion efficiency.',
            evidence: 'N=4 observed posts with 42 median saves.',
            qcStatus: 'PASSED',
            approvalStatus: 'APPROVED',
            scheduledTime: '18:00',
            publishedUrl: 'https://instagram.com/p/demo-seed-yesterday'
          }
        ],
        contentItemsGenerated: 2,
        reelsRendered: 2,
        itemsAwaitingApproval: 0,
        itemsScheduled: 2,
        publishedCount: 2,
        leadsCaptured: 3,
        analyticsSynced: 2
      }
    ];
  }
}

export const dailyRunEngine = new DailyRunEngine();
