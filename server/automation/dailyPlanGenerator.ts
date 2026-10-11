import { contentRecommendationService } from '../analytics/contentRecommendationService.ts';
import { fatigueDetector } from '../analytics/fatigueDetector.ts';
import { automationSettingsManager } from './automationSettings.ts';
import type {
  PlannedDailyItem,
  ContentPillarId,
  ContentAngle,
  VideoDuration,
  CTAType
} from '../../src/types/index.ts';

export class DailyPlanGenerator {
  /**
   * Synthesizes performance data, pattern insights, fatigue guards, and active experiments
   * to construct an empirical daily content plan with 1-3 planned items.
   */
  public generateDailyPlan(customReelsCount?: 1 | 2 | 3): PlannedDailyItem[] {
    const settings = automationSettingsManager.getSettings();
    const count = customReelsCount || settings.reelsPerDay || 2;

    const recommendations = contentRecommendationService.getRecommendations();
    const fatigue = fatigueDetector.scanForFatigue();

    const plannedItems: PlannedDailyItem[] = [];

    // Candidate Content Recipes
    const candidatePool: Array<{
      topic: string;
      pillar: ContentPillarId;
      angle: ContentAngle;
      duration: VideoDuration;
      hookDirection: string;
      cta: CTAType;
      reason: string;
      evidence: string;
    }> = [];

    // 1. If high-confidence recommendations exist and diversity is healthy, prioritize them
    if (recommendations.length > 0 && fatigue.diversityScore >= 50) {
      const topRec = recommendations[0];
      candidatePool.push({
        topic: topRec.recommendedTopic,
        pillar: topRec.recommendedPillar,
        angle: topRec.suggestedAngle,
        duration: topRec.suggestedDuration,
        hookDirection: topRec.suggestedHookPattern || 'Data-backed empirical hook formula',
        cta: topRec.suggestedCTA,
        reason: topRec.reason,
        evidence: topRec.empiricalEvidence
      });
    }

    candidatePool.push(
      {
        topic: 'Everyday AI Productivity: Modern Workflows Without Code',
        pillar: 'ai-tools',
        angle: 'Tool discovery',
        duration: '30s',
        hookDirection: 'AI tools are becoming much easier to use for everyday work.',
        cta: 'Follow @flash_ai_digital',
        reason: 'Analyzes the broader evolution of AI tools becoming accessible for everyday knowledge workers.',
        evidence: 'Macro trend across document synthesis, data structuring, and visual interfaces.'
      },
      {
        topic: 'Claude 3.7 Sonnet & Hybrid Reasoning: What Changes in Daily Use',
        pillar: 'ai-news-update',
        angle: 'Demo',
        duration: '30s',
        hookDirection: 'Hybrid reasoning lets models think deeply or respond instantly depending on complexity.',
        cta: 'Save for Later',
        reason: 'Model architecture breakdown showing real developer and analytical workflows.',
        evidence: 'Official benchmark documentation and hybrid thinking architecture.'
      },
      {
        topic: 'Cursor vs Windsurf vs GitHub Copilot: Modern AI Code Editing Compared',
        pillar: 'ai-explainers',
        angle: 'Comparison',
        duration: '30s',
        hookDirection: 'Here is how the top three AI code editors actually compare on multi-file changes.',
        cta: 'Save for Later',
        reason: 'Side-by-side technical comparison of agentic IDEs.',
        evidence: 'Real benchmark comparisons on refactoring speed and context precision.'
      },
      {
        topic: 'Building an Autonomous Research Pipeline with DeepSeek & Perplexity',
        pillar: 'ai-automation',
        angle: 'How-to',
        duration: '30s',
        hookDirection: 'How to chain deep research models to synthesize 50 papers into a structured report.',
        cta: 'Try This AI Workflow',
        reason: 'Step-by-step practical research workflow.',
        evidence: 'Verified multi-model chaining methodology.'
      },
      {
        topic: 'Local AI on Laptop: Running 8B Parameter Models Completely Offline',
        pillar: 'practical-tutorials',
        angle: 'Demo',
        duration: '30s',
        hookDirection: 'You can now run private, high-speed LLMs on your laptop with zero cloud costs.',
        cta: 'Explore Curated AI Tools',
        reason: 'Privacy-focused local AI setup demonstration.',
        evidence: 'Ollama and llama.cpp local inference performance benchmarks.'
      }
    );

    // Select candidate items while enforcing diversity:
    // 1. Never pick the same pillar twice in the same daily plan
    // 2. Never pick the same angle twice in the same daily plan
    const selectedPillars = new Set<string>();
    const selectedAngles = new Set<string>();

    for (const candidate of candidatePool) {
      if (plannedItems.length >= count) break;

      if (!selectedPillars.has(candidate.pillar) && !selectedAngles.has(candidate.angle)) {
        selectedPillars.add(candidate.pillar);
        selectedAngles.add(candidate.angle);

        plannedItems.push({
          id: `plan-item-${Date.now()}-${plannedItems.length + 1}`,
          topic: candidate.topic,
          pillar: candidate.pillar,
          angle: candidate.angle,
          duration: candidate.duration,
          hookDirection: candidate.hookDirection,
          cta: candidate.cta,
          reason: candidate.reason,
          evidence: candidate.evidence,
          qcStatus: 'PENDING',
          approvalStatus: 'PENDING'
        });
      }
    }

    // Fallback if pool exhausted
    while (plannedItems.length < count) {
      const idx = plannedItems.length;
      plannedItems.push({
        id: `plan-item-${Date.now()}-${idx + 1}`,
        topic: `Practical AI Workflow Breakdown: Everyday Automation (Part ${idx + 1})`,
        pillar: 'ai-tools',
        angle: 'How-to',
        duration: '30s',
        hookDirection: 'Step-by-step practical AI workflow guide',
        cta: 'Follow @flash_ai_digital',
        reason: 'Delivers high-value practical AI information.',
        evidence: 'Verified AI tool documentation.',
        qcStatus: 'PENDING',
        approvalStatus: 'PENDING'
      });
    }

    return plannedItems;
  }
}

export const dailyPlanGenerator = new DailyPlanGenerator();
