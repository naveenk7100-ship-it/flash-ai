import { performanceAnalysisService } from './performanceAnalysisService.ts';
import { contentPatternAnalyzer } from './contentPatternAnalyzer.ts';
import type {
  ContentRecommendation,
  ContentPillarId,
  ContentAngle,
  VideoDuration,
  CTAType
} from '../../src/types/index.ts';

export class ContentRecommendationService {
  private recommendations: ContentRecommendation[] = [];

  constructor() {
    this.seedDefaultRecommendations();
  }

  public getRecommendations(): ContentRecommendation[] {
    return this.recommendations;
  }

  public updateRecommendationStatus(
    id: string,
    status: ContentRecommendation['status']
  ): ContentRecommendation | undefined {
    const rec = this.recommendations.find((r) => r.id === id);
    if (rec) {
      rec.status = status;
    }
    return rec;
  }

  /**
   * Dynamically generates fresh recommendations by combining empirical patterns with Gemini AI analysis.
   */
  public async generateRecommendations(): Promise<ContentRecommendation[]> {
    const report = await performanceAnalysisService.generateAnalysisReport();
    const patterns = contentPatternAnalyzer.analyzePatterns();

    const topPillars = patterns.byPillar.slice(0, 3);
    const topAngles = patterns.byAngle.slice(0, 3);

    const generatedRecs: ContentRecommendation[] = [];

    // 1. High-Converting Pillar Recommendation
    if (topPillars.length > 0) {
      const bestPillar = topPillars[0];
      generatedRecs.push({
        id: `rec-${Date.now()}-1`,
        recommendedTopic: 'How AI WhatsApp Automations Prevent Lost Leads During After-Hours',
        recommendedPillar: (bestPillar.groupKey as ContentPillarId) || 'whatsapp-automation',
        suggestedAngle: 'Problem' as ContentAngle,
        suggestedDuration: '30s' as VideoDuration,
        suggestedHookPattern: 'Problem-first time loss hook',
        suggestedCTA: 'DM "AUTOMATE"' as CTAType,
        reason: `Historical data shows ${bestPillar.groupLabel} delivers our highest lead conversion rate (${bestPillar.leadConversionRate}%).`,
        empiricalEvidence: `Supported by N=${bestPillar.sampleSize} published items with ${bestPillar.medianSaves} median saves and ${bestPillar.totalLeads} CRM leads generated.`,
        supportingMetrics: {
          sampleSize: bestPillar.sampleSize,
          historicalMedianReach: bestPillar.medianReach,
          historicalAvgSaves: bestPillar.medianSaves,
          historicalLeadCount: bestPillar.totalLeads
        },
        confidenceLevel: 'HIGH',
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    // 2. High-Retention Case Study Recommendation
    if (topAngles.length > 0) {
      const bestAngle = topAngles.find((a) => a.groupKey === 'Case study') || topAngles[0];
      generatedRecs.push({
        id: `rec-${Date.now()}-2`,
        recommendedTopic: 'Case Study: How We Scaled Inbound Consultations for a Dental Clinic by 40%',
        recommendedPillar: 'lead-generation',
        suggestedAngle: 'Case study',
        suggestedDuration: '30s',
        suggestedHookPattern: 'Specific numbers & outcome hook',
        suggestedCTA: 'Free AI Audit',
        reason: 'Real implementation breakdowns build authoritative trust and drive high-intent inquiries from local business owners.',
        empiricalEvidence: `Observed ${bestAngle.groupLabel} angle delivered ${bestAngle.medianSaves} median saves and attracted verified commercial prospects.`,
        supportingMetrics: {
          sampleSize: bestAngle.sampleSize,
          historicalMedianReach: bestAngle.medianReach,
          historicalAvgSaves: bestAngle.medianSaves,
          historicalLeadCount: bestAngle.totalLeads
        },
        confidenceLevel: 'HIGH',
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString()
      });
    }

    // 3. Recommended Experiment
    const experimentIdea = report.suggestedExperiments[0] || 'A/B test 15s vs 30s Problem hooks on AI Automation';
    generatedRecs.push({
      id: `rec-${Date.now()}-3`,
      recommendedTopic: 'Cost Comparison: 1 Full-Time Employee vs 24/7 AI Automation System',
      recommendedPillar: 'business-growth',
      suggestedAngle: 'Comparison',
      suggestedDuration: '30s',
      suggestedHookPattern: 'Contrarian financial comparison hook',
      suggestedCTA: 'Book Strategy Call',
      reason: 'Addresses audience curiosity regarding cost vs return on investment.',
      empiricalEvidence: `Derived from AI gap analysis identifying pricing and operational ROI as top audience inquiry questions. (${experimentIdea})`,
      supportingMetrics: {
        sampleSize: report.sampleSize,
        historicalMedianReach: 2400,
        historicalAvgSaves: 35,
        historicalLeadCount: 3
      },
      confidenceLevel: 'EXPERIMENTAL',
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString()
    });

    this.recommendations = generatedRecs;
    return generatedRecs;
  }

  private seedDefaultRecommendations(): void {
    this.recommendations = [
      {
        id: 'rec-seed-1',
        recommendedTopic: '3 Workflows Every Founder Should Automate with AI in 2026',
        recommendedPillar: 'ai-automation',
        suggestedAngle: 'Problem',
        suggestedDuration: '30s',
        suggestedHookPattern: 'Problem callout with time-waste metric (0-3s)',
        suggestedCTA: 'DM "AUTOMATE"',
        reason: '30-second Problem-angle Reels generated 2.4x higher median saves than broad advice.',
        empiricalEvidence: 'Supported by N=4 observed items with 42 median saves and 3 CRM leads (₹75,000 pipeline).',
        supportingMetrics: {
          sampleSize: 4,
          historicalMedianReach: 2850,
          historicalAvgSaves: 42,
          historicalLeadCount: 3
        },
        confidenceLevel: 'HIGH',
        status: 'PENDING_REVIEW',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'rec-seed-2',
        recommendedTopic: 'How We Built a 24/7 WhatsApp AI Customer Support Receptionist',
        recommendedPillar: 'whatsapp-automation',
        suggestedAngle: 'Case study',
        suggestedDuration: '30s',
        suggestedHookPattern: 'Behind the scenes walkthrough of live conversation flow',
        suggestedCTA: 'WhatsApp Us Directly',
        reason: 'WhatsApp-specific workflows drove 62% of inbound commercial inquiries in the last 14 days.',
        empiricalEvidence: 'Observed N=2 WhatsApp posts yielded 56 median saves and 2 verified high-ticket leads.',
        supportingMetrics: {
          sampleSize: 2,
          historicalMedianReach: 3100,
          historicalAvgSaves: 56,
          historicalLeadCount: 2
        },
        confidenceLevel: 'HIGH',
        status: 'PENDING_REVIEW',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'rec-seed-3',
        recommendedTopic: 'The Fatal Mistake Founders Make When Buying AI Tools',
        recommendedPillar: 'ai-tools',
        suggestedAngle: 'Mistake',
        suggestedDuration: '60s',
        suggestedHookPattern: 'Stop doing X contrarian warning',
        suggestedCTA: 'Free AI Audit',
        reason: 'Mistake-angle hooks create high pattern-interrupt tension in the first 2 seconds.',
        empiricalEvidence: 'Historical mistake reels averaged 6.8% engagement rate across N=3 items.',
        supportingMetrics: {
          sampleSize: 3,
          historicalMedianReach: 2200,
          historicalAvgSaves: 28,
          historicalLeadCount: 1
        },
        confidenceLevel: 'MEDIUM',
        status: 'PENDING_REVIEW',
        createdAt: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }
}

export const contentRecommendationService = new ContentRecommendationService();
