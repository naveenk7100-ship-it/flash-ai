import { performanceModelEngine } from './performanceModel.ts';
import type {
  ContentPatternGroup,
  ContentPerformanceItem
} from '../../src/types/index.ts';

export class ContentPatternAnalyzer {
  /**
   * Analyzes all historical content items across multiple dimensions.
   */
  public analyzePatterns(): {
    byPillar: ContentPatternGroup[];
    byAngle: ContentPatternGroup[];
    byDuration: ContentPatternGroup[];
    byHookType: ContentPatternGroup[];
    byCTA: ContentPatternGroup[];
    byDayOfWeek: ContentPatternGroup[];
    totalSampleCount: number;
  } {
    const items = performanceModelEngine.getPerformanceItems();

    return {
      byPillar: this.groupByDimension(items, 'pillar', (item) => item.pillarId),
      byAngle: this.groupByDimension(items, 'angle', (item) => item.angle || 'Unspecified'),
      byDuration: this.groupByDimension(items, 'duration', (item) => item.duration || '30s'),
      byHookType: this.groupByDimension(items, 'hookType', (item) => this.classifyHookType(item.hook)),
      byCTA: this.groupByDimension(items, 'cta', (item) => item.cta || 'Unspecified'),
      byDayOfWeek: this.groupByDimension(items, 'dayOfWeek', (item) => {
        const d = new Date(item.publishedAt);
        return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString('en-US', { weekday: 'long' });
      }),
      totalSampleCount: items.length
    };
  }

  private groupByDimension(
    items: ContentPerformanceItem[],
    dimension: ContentPatternGroup['dimension'],
    keyExtractor: (item: ContentPerformanceItem) => string
  ): ContentPatternGroup[] {
    const map = new Map<string, ContentPerformanceItem[]>();

    for (const item of items) {
      const key = keyExtractor(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    const groups: ContentPatternGroup[] = [];

    for (const [key, groupItems] of map.entries()) {
      const sampleSize = groupItems.length;
      const isSufficientSample = sampleSize >= 2;

      const reaches = groupItems
        .map((i) => i.metrics.reach)
        .filter((r): r is number => typeof r === 'number');

      const saves = groupItems.map((i) => i.metrics.saves);
      const shares = groupItems.map((i) => i.metrics.shares);
      const engRates = groupItems
        .map((i) => i.metrics.engagementRate)
        .filter((e): e is number => typeof e === 'number');

      const totalLeads = groupItems.reduce((sum, i) => sum + i.attributedLeadsCount, 0);
      const totalPipelineValue = groupItems.reduce((sum, i) => sum + i.attributedPipelineValue, 0);

      const medianReach = reaches.length > 0 ? this.calculateMedian(reaches) : 0;
      const medianSaves = saves.length > 0 ? this.calculateMedian(saves) : 0;
      const medianShares = shares.length > 0 ? this.calculateMedian(shares) : 0;
      const avgEngagementRate = engRates.length > 0
        ? Number((engRates.reduce((a, b) => a + b, 0) / engRates.length).toFixed(2))
        : 0;

      const totalReachSum = reaches.reduce((a, b) => a + b, 0);
      const leadConversionRate = totalReachSum > 0
        ? Number(((totalLeads / totalReachSum) * 100).toFixed(3))
        : 0;

      const observedInsight = this.formatObservedInsight(
        dimension,
        key,
        sampleSize,
        medianReach,
        medianSaves,
        avgEngagementRate,
        totalLeads
      );

      groups.push({
        dimension,
        groupKey: key,
        groupLabel: this.formatLabel(key),
        sampleSize,
        isSufficientSample,
        medianReach,
        medianSaves,
        medianShares,
        avgEngagementRate,
        leadConversionRate,
        totalLeads,
        totalPipelineValue,
        observedInsight
      });
    }

    // Sort by total leads & median saves
    return groups.sort((a, b) => b.totalLeads - a.totalLeads || b.medianSaves - a.medianSaves);
  }

  private classifyHookType(hookText?: string): string {
    if (!hookText) return 'Direct Statement';
    const text = hookText.toLowerCase();
    if (text.includes('?') || text.startsWith('what') || text.startsWith('why') || text.startsWith('how')) {
      return 'Direct Question';
    }
    if (text.includes('mistake') || text.includes('stop') || text.includes('fatal') || text.includes('wrong')) {
      return 'Mistake Callout';
    }
    if (text.includes('%') || text.includes('hours') || text.includes('seconds') || /\d+/.test(text)) {
      return 'Statistic / Numbers';
    }
    if (text.includes('watch how') || text.includes('live demo') || text.includes('built a')) {
      return 'Behind the Scenes / Demo';
    }
    return 'Bold Contrarian Claim';
  }

  private formatObservedInsight(
    dimension: string,
    label: string,
    n: number,
    medianReach: number,
    medianSaves: number,
    engRate: number,
    leads: number
  ): string {
    if (n < 2) {
      return `Sample size too small (N=${n}) to draw statistically meaningful patterns for ${dimension}.`;
    }

    return `Across ${n} observed items (${dimension}), ${this.formatLabel(label)} averaged ${engRate}% engagement with median reach of ${medianReach.toLocaleString()}, ${medianSaves} saves, and generated ${leads} CRM lead${leads === 1 ? '' : 's'}.`;
  }

  private formatLabel(key: string): string {
    return key
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
}

export const contentPatternAnalyzer = new ContentPatternAnalyzer();
