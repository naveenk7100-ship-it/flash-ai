import { analyticsSyncService } from './analyticsSyncService.ts';
import type {
  FatigueWarning
} from '../../src/types/index.ts';

export class FatigueDetector {
  /**
   * Scans existing and recent content items for repetition, hook fatigue, and pillar imbalance.
   */
  public scanForFatigue(items?: Array<{
    id: string;
    title: string;
    pillarId: string;
    angle?: string;
    hook?: string;
    cta?: string;
    publishedAt?: string;
  }>): {
    warnings: FatigueWarning[];
    diversityScore: number; // 0 - 100
    healthyPillarsCount: number;
  } {
    const dataset = items && items.length > 0
      ? items
      : analyticsSyncService.getAllRecords().map((r) => ({
          id: r.contentId,
          title: r.contentTitle,
          pillarId: r.pillarId,
          angle: r.angle,
          hook: r.hook,
          cta: r.cta,
          publishedAt: r.publishedAt
        }));

    const warnings: FatigueWarning[] = [];

    if (dataset.length < 2) {
      return { warnings: [], diversityScore: 100, healthyPillarsCount: 1 };
    }

    // 1. Check for consecutive same-angle repetition (3 in a row)
    let consecutiveAngleCount = 1;
    let lastAngle = dataset[0].angle;

    for (let i = 1; i < dataset.length; i++) {
      const curAngle = dataset[i].angle;
      if (curAngle && curAngle === lastAngle) {
        consecutiveAngleCount++;
        if (consecutiveAngleCount >= 3) {
          warnings.push({
            id: `fatigue-angle-${i}`,
            type: 'CONSECUTIVE_ANGLE',
            title: `Consecutive "${curAngle}" Angle Detected`,
            message: `You have published or scheduled 3 consecutive posts using the "${curAngle}" angle. Audiences may experience pattern fatigue.`,
            severity: 'MEDIUM',
            affectedContentIds: [dataset[i - 2].id, dataset[i - 1].id, dataset[i].id],
            suggestion: 'Introduce a "Case study", "How-to", or "Demo" angle in your next post to maintain narrative contrast.'
          });
          break;
        }
      } else {
        consecutiveAngleCount = 1;
        lastAngle = curAngle;
      }
    }

    // 2. Check for Topic Similarity (>70% word overlap)
    for (let i = 0; i < dataset.length; i++) {
      for (let j = i + 1; j < dataset.length; j++) {
        const similarity = this.calculateTitleSimilarity(dataset[i].title, dataset[j].title);
        if (similarity > 0.70) {
          warnings.push({
            id: `fatigue-sim-${i}-${j}`,
            type: 'SIMILAR_TOPIC',
            title: 'High Topic Similarity Warning',
            message: `"${dataset[i].title}" is highly similar (${Math.round(similarity * 100)}% overlap) to "${dataset[j].title}".`,
            severity: 'HIGH',
            affectedContentIds: [dataset[i].id, dataset[j].id],
            suggestion: 'Differentiate the focus by targeting a distinct industry niche or changing the core problem being solved.'
          });
        }
      }
    }

    // 3. Check for CTA Overuse (>70% same CTA across past 5 posts)
    const recent5 = dataset.slice(0, 5);
    const ctaCounts = new Map<string, number>();
    for (const item of recent5) {
      if (item.cta) {
        ctaCounts.set(item.cta, (ctaCounts.get(item.cta) || 0) + 1);
      }
    }

    for (const [cta, count] of ctaCounts.entries()) {
      if (count >= 4) {
        warnings.push({
          id: `fatigue-cta-${Date.now()}`,
          type: 'CTA_OVERUSE',
          title: `Call To Action Overuse: "${cta}"`,
          message: `${count} of your last ${recent5.length} posts used the exact same Call To Action ("${cta}").`,
          severity: 'LOW',
          affectedContentIds: recent5.filter((r) => r.cta === cta).map((r) => r.id),
          suggestion: 'Rotate between "DM AUTOMATE", "Free AI Audit", and "WhatsApp Us" to capture different stages of buyer readiness.'
        });
      }
    }

    // Calculate Diversity Score (0 - 100)
    const uniquePillars = new Set(dataset.map((d) => d.pillarId)).size;
    const uniqueAngles = new Set(dataset.map((d) => d.angle)).size;
    const penalty = warnings.reduce((acc, w) => acc + (w.severity === 'HIGH' ? 20 : w.severity === 'MEDIUM' ? 10 : 5), 0);
    const rawScore = (uniquePillars * 10) + (uniqueAngles * 10) - penalty;
    const diversityScore = Math.max(20, Math.min(100, rawScore + 40));

    return {
      warnings,
      diversityScore,
      healthyPillarsCount: uniquePillars
    };
  }

  private calculateTitleSimilarity(titleA: string, titleB: string): number {
    const wordsA = new Set(
      titleA.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3)
    );
    const wordsB = new Set(
      titleB.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3)
    );

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let overlap = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) overlap++;
    }

    return (2 * overlap) / (wordsA.size + wordsB.size);
  }
}

export const fatigueDetector = new FatigueDetector();
