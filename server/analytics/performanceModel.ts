import { analyticsSyncService, type SyncedMediaRecord } from './analyticsSyncService.ts';
import { leadAttributionEngine } from './leadAttribution.ts';
import type {
  ContentPerformanceItem,
  ContentPillarId
} from '../../src/types/index.ts';

export class PerformanceModelEngine {
  /**
   * Builds the complete explainable performance model for all synced media items.
   */
  public getPerformanceItems(): ContentPerformanceItem[] {
    const rawRecords = analyticsSyncService.getAllRecords();

    // Calculate account baseline metrics for fair normalization
    const reaches = rawRecords
      .map((r) => r.metrics.reach)
      .filter((r): r is number => typeof r === 'number' && r > 0);

    const medianReach = reaches.length > 0
      ? this.calculateMedian(reaches)
      : 1500;

    return rawRecords.map((record) => {
      const attribution = leadAttributionEngine.getAttributionForContent(
        record.contentId,
        record.contentTitle,
        record.mediaId
      );

      const cpiResult = this.calculateContentPerformanceIndex(
        record.metrics,
        medianReach,
        attribution.totalLeads
      );

      return {
        id: `cpi-${record.contentId}`,
        contentId: record.contentId,
        title: record.contentTitle,
        pillarId: record.pillarId as ContentPillarId,
        angle: record.angle,
        hook: record.hook,
        duration: record.duration,
        cta: record.cta,
        publishedAt: record.publishedAt,
        permalink: record.permalink,
        metrics: record.metrics,
        performanceIndex: cpiResult.score,
        cpiBreakdown: cpiResult.breakdown,
        attributedLeadsCount: attribution.totalLeads,
        attributedQualifiedLeadsCount: attribution.qualifiedLeads,
        attributedPipelineValue: attribution.totalPipelineValue,
        attributedWonValue: attribution.wonRevenue,
        isDemo: record.source === 'DEMO'
      };
    });
  }

  /**
   * Transparent Content Performance Index calculation.
   * Total possible score: 100 points
   *
   * Factors & Weights:
   * 1. Reach Performance (20 pts): Reach relative to account median
   * 2. Engagement Rate (25 pts): (Likes + Comments + Saves + Shares) / Reach
   * 3. Save Rate (20 pts): Saves / Reach (High intent & evergreen bookmarking)
   * 4. Viral Share Rate (15 pts): Shares / Reach (Organic distribution)
   * 5. Inbound Lead Conversion (20 pts): Verified CRM leads generated
   */
  public calculateContentPerformanceIndex(
    metrics: SyncedMediaRecord['metrics'],
    accountMedianReach: number,
    leadsCount: number
  ): {
    score: number;
    breakdown: {
      reachPoints: number;
      engagementPoints: number;
      savePoints: number;
      sharePoints: number;
      leadPoints: number;
      formula: string;
      explanation: string;
    };
  } {
    const reach = metrics.reach ?? 0;
    const saves = metrics.saves || 0;
    const shares = metrics.shares || 0;
    const engRate = metrics.engagementRate ?? 0;

    // 1. Reach Points (Max 20)
    let reachPoints = 0;
    if (accountMedianReach > 0 && reach > 0) {
      const reachRatio = reach / accountMedianReach;
      reachPoints = Math.min(20, Number((reachRatio * 15).toFixed(1)));
    }

    // 2. Engagement Points (Max 25, benchmark 5% = 18pts, 8% = 25pts)
    const engagementPoints = Math.min(25, Number((engRate * 3.125).toFixed(1)));

    // 3. Save Points (Max 20, benchmark 2% saves/reach = 20pts)
    let savePoints = 0;
    if (reach > 0) {
      const saveRate = (saves / reach) * 100;
      savePoints = Math.min(20, Number((saveRate * 10).toFixed(1)));
    }

    // 4. Share Points (Max 15, benchmark 1% shares/reach = 15pts)
    let sharePoints = 0;
    if (reach > 0) {
      const shareRate = (shares / reach) * 100;
      sharePoints = Math.min(15, Number((shareRate * 15).toFixed(1)));
    }

    // 5. Inbound Lead Points (Max 20, 1 lead = 7pts, 2 leads = 14pts, 3+ leads = 20pts)
    const leadPoints = Math.min(20, leadsCount * 7);

    const totalScore = Math.min(
      100,
      Math.round(reachPoints + engagementPoints + savePoints + sharePoints + leadPoints)
    );

    const formula = `CPI (${totalScore}/100) = Reach Points [${reachPoints}/20] + Eng Rate Points [${engagementPoints}/25] + Save Rate Points [${savePoints}/20] + Share Points [${sharePoints}/15] + Lead Points [${leadPoints}/20]`;

    const explanation = `Weighted composite index: 20% Reach vs median (${accountMedianReach}), 25% Engagement Rate (${engRate}%), 20% Saves (${saves}), 15% Shares (${shares}), 20% Inbound Leads (${leadsCount}).`;

    return {
      score: totalScore,
      breakdown: {
        reachPoints,
        engagementPoints,
        savePoints,
        sharePoints,
        leadPoints,
        formula,
        explanation
      }
    };
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}

export const performanceModelEngine = new PerformanceModelEngine();
