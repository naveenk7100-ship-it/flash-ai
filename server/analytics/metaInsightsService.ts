import type {
  ContentPerformanceMetrics,
  DataQualityStatus
} from '../../src/types/index.ts';

export interface MetaRawInsightItem {
  name: string;
  period: string;
  values: Array<{ value: number }>;
  title?: string;
  description?: string;
  id?: string;
}

export interface MetaInsightsResult {
  mediaId: string;
  metrics: ContentPerformanceMetrics;
  isLive: boolean;
  error?: string;
}

export class MetaInsightsService {
  private apiVersion = process.env.META_API_VERSION?.trim() || 'v21.0';
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  private getAccessToken(): string | undefined {
    return process.env.META_ACCESS_TOKEN?.trim();
  }

  private getInstagramAccountId(): string | undefined {
    return process.env.META_INSTAGRAM_ACCOUNT_ID?.trim();
  }

  public isLiveConfigured(): boolean {
    return (
      Boolean(this.getAccessToken()) &&
      Boolean(this.getInstagramAccountId()) &&
      process.env.META_PUBLISHING_MODE === 'LIVE'
    );
  }

  /**
   * Fetches official Meta Graph API insights for a specific Instagram Media object.
   * Uses metric parameters: views/plays, reach, saved, shares, total_interactions
   */
  public async fetchMediaInsights(
    mediaId: string,
    isReel: boolean = true
  ): Promise<MetaInsightsResult> {
    const accessToken = this.getAccessToken();

    // If live API is not configured or in DEMO mode, return safe demo metrics
    if (!this.isLiveConfigured() || !accessToken) {
      return {
        mediaId,
        metrics: this.getDemoMetricsForMedia(mediaId),
        isLive: false
      };
    }

    try {
      // 1. Fetch public post fields (like_count, comments_count, timestamp, media_type)
      const postDetailsUrl = `${this.baseUrl}/${mediaId}?fields=like_count,comments_count,media_type,timestamp,permalink&access_token=${accessToken}`;
      const postRes = await fetch(postDetailsUrl);
      const postData: any = await postRes.json();

      if (postData.error) {
        console.warn(`[MetaInsights] Failed to fetch post details for ${mediaId}:`, postData.error.message);
        return {
          mediaId,
          metrics: this.getUnavailableMetrics(),
          isLive: true,
          error: postData.error.message
        };
      }

      const likes = typeof postData.like_count === 'number' ? postData.like_count : 0;
      const comments = typeof postData.comments_count === 'number' ? postData.comments_count : 0;

      // 2. Query official Meta Insights endpoint
      // Note: Meta Graph API v21.0 supports 'reach', 'saved', 'shares', 'plays', 'total_interactions' for IG Reels
      const metricsList = isReel
        ? 'reach,saved,shares,plays,total_interactions'
        : 'reach,saved,shares,impressions';

      const insightsUrl = `${this.baseUrl}/${mediaId}/insights?metric=${metricsList}&access_token=${accessToken}`;
      const insightsRes = await fetch(insightsUrl);
      const insightsData: any = await insightsRes.json();

      if (insightsData.error) {
        console.warn(`[MetaInsights] Insights query not available for ${mediaId}:`, insightsData.error.message);
        // Meta sometimes returns error if media has < 5 views or was published < 24h ago
        return {
          mediaId,
          metrics: {
            views: null,
            reach: null,
            likes,
            comments,
            saves: 0,
            shares: 0,
            profileVisits: null,
            follows: null,
            engagementRate: null,
            engagementRateFormula: 'Cannot calculate with available data (Insights require minimum view threshold).',
            dataStatus: 'PARTIAL',
            lastSyncedAt: new Date().toISOString()
          },
          isLive: true,
          error: insightsData.error.message
        };
      }

      const rawItems: MetaRawInsightItem[] = insightsData.data || [];
      const metricMap = new Map<string, number>();

      for (const item of rawItems) {
        if (item.values && item.values.length > 0) {
          metricMap.set(item.name, item.values[0].value);
        }
      }

      const reach = metricMap.get('reach') ?? null;
      const views = metricMap.get('plays') ?? metricMap.get('impressions') ?? null;
      const saves = metricMap.get('saved') ?? 0;
      const shares = metricMap.get('shares') ?? 0;

      // Calculate transparent engagement rate
      let engagementRate: number | null = null;
      let formulaStr = 'Cannot calculate with available data.';

      if (reach !== null && reach > 0) {
        const totalEngagements = likes + comments + saves + shares;
        engagementRate = Number(((totalEngagements / reach) * 100).toFixed(2));
        formulaStr = `(Likes [${likes}] + Comments [${comments}] + Saves [${saves}] + Shares [${shares}]) / Reach [${reach}] * 100 = ${engagementRate}%`;
      }

      const dataStatus: DataQualityStatus = reach !== null ? 'LIVE' : 'PARTIAL';

      return {
        mediaId,
        metrics: {
          views,
          reach,
          likes,
          comments,
          saves,
          shares,
          profileVisits: metricMap.get('profile_visits') ?? null,
          follows: metricMap.get('follows') ?? null,
          engagementRate,
          engagementRateFormula: formulaStr,
          dataStatus,
          lastSyncedAt: new Date().toISOString()
        },
        isLive: true
      };
    } catch (err: any) {
      console.error(`[MetaInsights] Network error fetching insights for ${mediaId}:`, err.message);
      return {
        mediaId,
        metrics: this.getUnavailableMetrics(),
        isLive: true,
        error: err.message
      };
    }
  }

  /**
   * Generates realistic, non-fabricated demo metrics for development/demo mode.
   * Deterministically mapped to mediaId so numbers stay stable between syncs.
   */
  public getDemoMetricsForMedia(mediaId: string): ContentPerformanceMetrics {
    // Generate deterministic seed from mediaId
    let hash = 0;
    for (let i = 0; i < mediaId.length; i++) {
      hash = (hash << 5) - hash + mediaId.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const views = 1800 + (seed % 3400);
    const reach = Math.round(views * (0.65 + (seed % 20) / 100));
    const likes = 60 + (seed % 190);
    const comments = 8 + (seed % 35);
    const saves = 12 + (seed % 58);
    const shares = 4 + (seed % 26);
    const profileVisits = 14 + (seed % 42);
    const follows = 2 + (seed % 12);

    const totalEngagements = likes + comments + saves + shares;
    const engagementRate = Number(((totalEngagements / reach) * 100).toFixed(2));
    const formulaStr = `(Likes [${likes}] + Comments [${comments}] + Saves [${saves}] + Shares [${shares}]) / Reach [${reach}] * 100 = ${engagementRate}%`;

    return {
      views,
      reach,
      likes,
      comments,
      saves,
      shares,
      profileVisits,
      follows,
      engagementRate,
      engagementRateFormula: formulaStr,
      dataStatus: 'DEMO',
      lastSyncedAt: new Date().toISOString()
    };
  }

  private getUnavailableMetrics(): ContentPerformanceMetrics {
    return {
      views: null,
      reach: null,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      profileVisits: null,
      follows: null,
      engagementRate: null,
      engagementRateFormula: 'Cannot calculate with available data.',
      dataStatus: 'UNAVAILABLE',
      lastSyncedAt: new Date().toISOString()
    };
  }
}

export const metaInsightsService = new MetaInsightsService();
