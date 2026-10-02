import { metaInsightsService } from './metaInsightsService.ts';
import type {
  ContentPerformanceMetrics,
  SyncStatusInfo,
  DataQualityStatus
} from '../../src/types/index.ts';

export interface SyncedMediaRecord {
  mediaId: string;
  contentId: string;
  contentTitle: string;
  pillarId: string;
  angle: string;
  hook: string;
  duration: string;
  cta: string;
  publishedAt: string;
  permalink?: string;
  metrics: ContentPerformanceMetrics;
  lastSyncedAt: string;
  syncStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  errorMessage?: string;
  source: DataQualityStatus;
}

export class AnalyticsSyncService {
  private records: Map<string, SyncedMediaRecord> = new Map();
  private syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR' = 'IDLE';
  private lastSuccessfulSync: string | null = null;
  private lastFailedSync: string | null = null;
  private lastErrorMessage: string | null = null;

  constructor() {
    this.seedHistoricalRecords();
  }

  public getSyncStatus(): SyncStatusInfo {
    return {
      syncStatus: this.syncStatus,
      lastSuccessfulSync: this.lastSuccessfulSync,
      lastFailedSync: this.lastFailedSync,
      errorMessage: this.lastErrorMessage,
      syncedItemsCount: this.records.size,
      isLiveConnected: metaInsightsService.isLiveConfigured()
    };
  }

  public getAllRecords(): SyncedMediaRecord[] {
    return Array.from(this.records.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  public getRecord(contentId: string): SyncedMediaRecord | undefined {
    return this.records.get(contentId);
  }

  /**
   * Syncs performance metrics for all published media items.
   */
  public async syncAll(publishedItems: Array<{
    contentId: string;
    mediaId?: string;
    title: string;
    pillarId: string;
    angle?: string;
    hook?: string;
    duration?: string;
    cta?: string;
    publishedAt: string;
    permalink?: string;
  }>): Promise<{
    synced: number;
    failed: number;
    records: SyncedMediaRecord[];
  }> {
    this.syncStatus = 'SYNCING';
    this.lastErrorMessage = null;

    let syncedCount = 0;
    let failedCount = 0;

    try {
      for (const item of publishedItems) {
        const mediaId = item.mediaId || `demo-ig-media-${item.contentId}`;
        const isReel = (item.duration || '').includes('s');

        try {
          const result = await metaInsightsService.fetchMediaInsights(mediaId, isReel);

          const record: SyncedMediaRecord = {
            mediaId,
            contentId: item.contentId,
            contentTitle: item.title,
            pillarId: item.pillarId,
            angle: item.angle || 'Problem',
            hook: item.hook || 'You are losing leads while you sleep',
            duration: item.duration || '30s',
            cta: item.cta || 'DM "AUTOMATE"',
            publishedAt: item.publishedAt,
            permalink: item.permalink,
            metrics: result.metrics,
            lastSyncedAt: new Date().toISOString(),
            syncStatus: result.error ? 'PARTIAL' : 'SUCCESS',
            errorMessage: result.error,
            source: result.metrics.dataStatus
          };

          this.records.set(item.contentId, record);
          syncedCount++;
        } catch (err: any) {
          failedCount++;
          console.error(`[AnalyticsSync] Failed to sync ${item.contentId}:`, err.message);
        }
      }

      this.syncStatus = 'SUCCESS';
      this.lastSuccessfulSync = new Date().toISOString();
    } catch (err: any) {
      this.syncStatus = 'ERROR';
      this.lastFailedSync = new Date().toISOString();
      this.lastErrorMessage = err.message || 'Sync failed due to an unexpected error.';
    }

    return {
      synced: syncedCount,
      failed: failedCount,
      records: this.getAllRecords()
    };
  }

  /**
   * Pre-populates historical baseline records to allow immediate analysis in demo mode.
   */
  private seedHistoricalRecords(): void {
    const seedItems = [
      {
        contentId: 'pub-seed-1',
        mediaId: '1784140001',
        contentTitle: '3 AI Automations Every Founder Needs in 2026',
        pillarId: 'ai-automation',
        angle: 'Problem',
        hook: '90% of business owners waste 15 hours a week on tasks an AI can do in 3 seconds.',
        duration: '30s',
        cta: 'DM "AUTOMATE"',
        publishedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo1'
      },
      {
        contentId: 'pub-seed-2',
        mediaId: '1784140002',
        contentTitle: 'How We Built a 24/7 WhatsApp AI Receptionist for Clinics',
        pillarId: 'whatsapp-automation',
        angle: 'Case study',
        hook: 'What happens when a dental clinic gets 40 inquiries at 11 PM on a Sunday?',
        duration: '30s',
        cta: 'WhatsApp Us Directly',
        publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo2'
      },
      {
        contentId: 'pub-seed-3',
        mediaId: '1784140003',
        contentTitle: 'The Fatal Mistake Small Businesses Make on Instagram Ads',
        pillarId: 'business-growth',
        angle: 'Mistake',
        hook: 'Stop running ads to a broken landing page with no instant follow-up.',
        duration: '60s',
        cta: 'Free AI Audit',
        publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo3'
      },
      {
        contentId: 'pub-seed-4',
        mediaId: '1784140004',
        contentTitle: 'Live Demo: AI Inbound Lead Qualifier in Action',
        pillarId: 'lead-generation',
        angle: 'Demo',
        hook: 'Watch how this AI qualifies a customer inquiry and syncs it to CRM in 4 seconds.',
        duration: '30s',
        cta: 'DM "AUTOMATE"',
        publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo4'
      },
      {
        contentId: 'pub-seed-5',
        mediaId: '1784140005',
        contentTitle: 'Why Traditional 5-Page Websites Are Dying in 2026',
        pillarId: 'website-solutions',
        angle: 'Before/After',
        hook: 'Static brochures dont convert. Interactive AI web apps do.',
        duration: '30s',
        cta: 'Book Strategy Call',
        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo5'
      },
      {
        contentId: 'pub-seed-6',
        mediaId: '1784140006',
        contentTitle: 'Top 5 AI Tools That Run Our Entire Agency',
        pillarId: 'ai-tools',
        angle: 'Tool discovery',
        hook: 'Here are the exact 5 AI tools that power our agency operations.',
        duration: '60s',
        cta: 'Check Link in Bio',
        publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        permalink: 'https://instagram.com/p/C_demo6'
      }
    ];

    for (const item of seedItems) {
      const metrics = metaInsightsService.getDemoMetricsForMedia(item.mediaId);
      this.records.set(item.contentId, {
        mediaId: item.mediaId,
        contentId: item.contentId,
        contentTitle: item.contentTitle,
        pillarId: item.pillarId,
        angle: item.angle,
        hook: item.hook,
        duration: item.duration,
        cta: item.cta,
        publishedAt: item.publishedAt,
        permalink: item.permalink,
        metrics,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: 'SUCCESS',
        source: 'DEMO'
      });
    }

    this.lastSuccessfulSync = new Date().toISOString();
  }
}

export const analyticsSyncService = new AnalyticsSyncService();
