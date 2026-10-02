import { performanceAnalysisService } from './performanceAnalysisService.ts';
import { performanceModelEngine } from './performanceModel.ts';
import { contentRecommendationService } from './contentRecommendationService.ts';
import type {
  DailyIntelligenceBrief
} from '../../src/types/index.ts';

export class DailyBriefService {
  private lastBrief: DailyIntelligenceBrief | null = null;

  public async getDailyBrief(): Promise<DailyIntelligenceBrief> {
    const items = performanceModelEngine.getPerformanceItems();
    const report = await performanceAnalysisService.generateAnalysisReport();
    const recommendations = contentRecommendationService.getRecommendations();

    const isLive = items.some((i) => i.metrics.dataStatus === 'LIVE');
    const totalReach = items.reduce((sum, i) => sum + (i.metrics.reach || 0), 0);
    const totalEngagement = items.reduce(
      (sum, i) => sum + (i.metrics.likes + i.metrics.comments + i.metrics.saves + i.metrics.shares),
      0
    );
    const leadsCaptured = items.reduce((sum, i) => sum + i.attributedLeadsCount, 0);
    const pipelineValue = items.reduce((sum, i) => sum + i.attributedPipelineValue, 0);

    const brief: DailyIntelligenceBrief = {
      id: `brief-${new Date().toISOString().split('T')[0]}`,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dataRange: report.dateRange,
      contentPublishedCount: items.length,
      totalReach,
      totalEngagement,
      leadsCaptured,
      pipelineValue,
      observedPatterns: report.recurringPatterns.slice(0, 4),
      audienceQuestions: report.audienceQuestions.slice(0, 3),
      suggestedExperiments: report.suggestedExperiments.slice(0, 2),
      suggestedContentDirections: recommendations.map((r) => `${r.recommendedTopic} (${r.suggestedAngle} • ${r.suggestedCTA})`),
      dataLimitations: isLive
        ? 'Live Meta Graph API streaming active. Insights reflect organic audience interactions.'
        : 'Demo performance dataset active for system simulation. Connect Meta production credentials in Settings to stream live Graph API insights.',
      dataQuality: isLive ? 'LIVE' : 'DEMO'
    };

    this.lastBrief = brief;
    return brief;
  }

  public getPreviousBrief(): DailyIntelligenceBrief | null {
    return this.lastBrief;
  }
}

export const dailyBriefService = new DailyBriefService();
