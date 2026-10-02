import type {
  MetaAccountInfo,
  MediaType,
  AnalyticsSnapshot
} from '../types';

export interface MetaPublishResponse {
  success: boolean;
  isDemo: boolean;
  metaPostId?: string;
  containerId?: string;
  permalink?: string;
  status: 'PUBLISHED' | 'FAILED';
  publishedAt?: string;
  error?: string;
  message?: string;
}

export interface MetaStatusResponse {
  isConnected: boolean;
  provider: string;
  apiVersion: string;
  isConfigured: boolean;
  mode: 'DEMO' | 'LIVE';
  accountIdMasked?: string;
  username?: string;
  name?: string;
  accountType?: string;
  profilePictureUrl?: string;
  mediaCount?: number;
  followersCount?: number;
  permissions: string[];
  missingConfig: string[];
  lastChecked: string;
  error?: string;
}

export interface PublishMediaParams {
  contentId: string;
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: MediaType;
  isDemo?: boolean;
  shareToFeed?: boolean;
}

class MetaInstagramClientService {
  private baseUrl = '/api/meta';

  /**
   * Retrieves current connection status from server.
   */
  public async getConnectionStatus(): Promise<MetaStatusResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/status`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        isConnected: false,
        provider: 'Meta Instagram Graph API',
        apiVersion: 'v21.0',
        isConfigured: false,
        mode: 'DEMO',
        permissions: [],
        missingConfig: ['META_ACCESS_TOKEN', 'META_INSTAGRAM_ACCOUNT_ID'],
        lastChecked: new Date().toISOString(),
        error: err.message || 'Cannot reach Meta API middleware server'
      };
    }
  }

  /**
   * Validates live Meta Graph API credentials.
   */
  public async validateCredentials(): Promise<{
    valid: boolean;
    username?: string;
    name?: string;
    accountType?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err: any) {
      return {
        valid: false,
        error: err.message || 'Verification request failed'
      };
    }
  }

  /**
   * Fetches safe account info.
   */
  public async getAccountInfo(): Promise<MetaAccountInfo | null> {
    try {
      const res = await fetch(`${this.baseUrl}/account`);
      const data = await res.json();
      if (!data.success) return null;
      return data.account;
    } catch {
      return null;
    }
  }

  /**
   * Publishes media item (Reel, Image, Carousel) through server-side Meta API or Demo simulation.
   */
  public async publishMedia(params: PublishMediaParams): Promise<MetaPublishResponse> {
    const res = await fetch(`${this.baseUrl}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to publish media to Instagram');
    }

    return data;
  }

  /**
   * Checks container status.
   */
  public async checkMediaStatus(creationId: string): Promise<{
    statusCode: 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED';
    errorMessage?: string;
  }> {
    const res = await fetch(`${this.baseUrl}/media-status?creationId=${encodeURIComponent(creationId)}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to check container status');
    }
    return data.status;
  }

  /**
   * Retrieves published media from Meta or returns demo items.
   */
  public async getPublishedMedia(limit: number = 20): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/published?limit=${limit}`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetches organic insights from Meta.
   */
  public async getMediaInsights(mediaId: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/insights?mediaId=${encodeURIComponent(mediaId)}`);
      const data = await res.json();
      return data.insights || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetches aggregate account analytics.
   */
  public async fetchInsights(): Promise<Partial<AnalyticsSnapshot>> {
    // If real credentials, we can aggregate published media insights
    return {
      views: 48920,
      reach: 34150,
      likes: 2840,
      comments: 418,
      shares: 612,
      saves: 1145,
      profileVisits: 3290,
      followersGained: 462,
      leadsGenerated: 24,
      isDemoData: true
    };
  }
}

export const metaApiService = new MetaInstagramClientService();
