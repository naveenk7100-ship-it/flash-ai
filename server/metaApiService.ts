/**
 * Server-Side Official Meta / Instagram Graph API Service
 * Handles official Instagram Content Publishing (Reels & Images), Container polling,
 * Account Verification, and Media Insights.
 *
 * All requests are executed server-side.
 * Access tokens and App Secrets NEVER reach the client.
 */

export interface MetaConnectionStatus {
  isConnected: boolean;
  provider: 'Meta Instagram Graph API';
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

export interface CreateContainerParams {
  mediaType: 'REELS' | 'IMAGE' | 'CAROUSEL' | 'STORY';
  mediaUrl: string;
  caption: string;
  coverUrl?: string;
  shareToFeed?: boolean;
}

export interface PublishResult {
  success: boolean;
  metaPostId?: string;
  permalink?: string;
  containerId?: string;
  status: 'PUBLISHED' | 'FAILED';
  isDemo: boolean;
  publishedAt: string;
  error?: string;
}

export class MetaInstagramService {
  public get appId(): string {
    return process.env.META_APP_ID?.trim() || '';
  }

  private get appSecret(): string {
    return process.env.META_APP_SECRET?.trim() || '';
  }

  private get accessToken(): string {
    return (
      process.env.META_ACCESS_TOKEN?.trim() ||
      process.env.META_USER_ACCESS_TOKEN?.trim() ||
      ''
    );
  }

  private get accountId(): string {
    return (
      process.env.META_INSTAGRAM_ACCOUNT_ID?.trim() ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
      ''
    );
  }

  private get apiVersion(): string {
    return process.env.META_API_VERSION?.trim() || 'v21.0';
  }

  private get graphBaseUrl(): string {
    if (this.accessToken.startsWith('IG')) {
      return `https://graph.instagram.com/${this.apiVersion}`;
    }
    return `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Sanitizes error messages to prevent token or secret leakage.
   */
  private sanitizeError(err: unknown): string {
    let msg = err instanceof Error ? err.message : String(err);
    if (this.accessToken) {
      msg = msg.replaceAll(this.accessToken, '[REDACTED_ACCESS_TOKEN]');
    }
    if (this.appSecret) {
      msg = msg.replaceAll(this.appSecret, '[REDACTED_APP_SECRET]');
    }
    return msg;
  }

  /**
   * Checks if required environment variables are set.
   */
  public isConfigured(): boolean {
    return Boolean(this.accessToken && this.accountId);
  }

  /**
   * Synchronous basic status snapshot for health checks.
   */
  public getStatus(): { isConnected: boolean; isConfigured: boolean; mode: 'DEMO' | 'LIVE' } {
    const configured = this.isConfigured();
    return {
      isConnected: configured,
      isConfigured: configured,
      mode: configured ? 'LIVE' : 'DEMO'
    };
  }

  /**
   * Returns safe connection status.
   */
  public async getConnectionStatus(): Promise<MetaConnectionStatus> {
    const missing: string[] = [];
    if (!this.accessToken) missing.push('META_ACCESS_TOKEN');
    if (!this.accountId) missing.push('META_INSTAGRAM_ACCOUNT_ID');

    if (missing.length > 0) {
      return {
        isConnected: false,
        provider: 'Meta Instagram Graph API',
        apiVersion: this.apiVersion,
        isConfigured: false,
        mode: 'DEMO',
        permissions: [],
        missingConfig: missing,
        lastChecked: new Date().toISOString(),
        error: `Missing required environment variables: ${missing.join(', ')}`
      };
    }

    try {
      const account = await this.getAccountInfo();
      return {
        isConnected: true,
        provider: 'Meta Instagram Graph API',
        apiVersion: this.apiVersion,
        isConfigured: true,
        mode: 'LIVE',
        accountIdMasked: this.maskId(this.accountId),
        username: account.username,
        name: account.name,
        accountType: account.accountType,
        profilePictureUrl: account.profilePictureUrl,
        mediaCount: account.mediaCount,
        followersCount: account.followersCount,
        permissions: [
          'instagram_basic',
          'instagram_content_publish',
          'instagram_manage_insights',
          'pages_show_list',
          'pages_read_engagement'
        ],
        missingConfig: [],
        lastChecked: new Date().toISOString()
      };
    } catch (err) {
      return {
        isConnected: false,
        provider: 'Meta Instagram Graph API',
        apiVersion: this.apiVersion,
        isConfigured: true,
        mode: 'DEMO',
        accountIdMasked: this.maskId(this.accountId),
        permissions: [],
        missingConfig: [],
        lastChecked: new Date().toISOString(),
        error: this.sanitizeError(err)
      };
    }
  }

  /**
   * Validates configured credentials against official Meta Graph API:
   * GET /{ig-user-id}?fields=id,username,name,account_type,media_count,followers_count,profile_picture_url
   */
  public async validateCredentials(): Promise<{
    valid: boolean;
    username?: string;
    name?: string;
    accountType?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        valid: false,
        error: 'Meta credentials are not configured in .env file.'
      };
    }

    try {
      const info = await this.getAccountInfo();
      return {
        valid: true,
        username: info.username,
        name: info.name,
        accountType: info.accountType
      };
    } catch (err) {
      return {
        valid: false,
        error: this.sanitizeError(err)
      };
    }
  }

  /**
   * Fetches official account info.
   */
  public async getAccountInfo(): Promise<{
    id: string;
    username: string;
    name: string;
    accountType: string;
    profilePictureUrl?: string;
    mediaCount?: number;
    followersCount?: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured.');
    }

    const fields = this.accessToken.startsWith('IG')
      ? 'id,username,account_type,media_count,profile_picture_url'
      : 'id,username,name,account_type,media_count,followers_count,profile_picture_url';

    const url = `${this.graphBaseUrl}/${this.accountId}?fields=${fields}&access_token=${encodeURIComponent(
      this.accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      if (this.accessToken.startsWith('IG')) {
        const meUrl = `${this.graphBaseUrl}/me?fields=id,username,account_type,media_count,profile_picture_url&access_token=${encodeURIComponent(
          this.accessToken
        )}`;
        const meRes = await fetch(meUrl);
        const meData = (await meRes.json()) as any;
        if (meRes.ok && !meData.error) {
          return {
            id: meData.id || this.accountId,
            username: meData.username || 'flash__ai__digital',
            name: meData.name || meData.username || 'FLASH.Ai Official',
            accountType: meData.account_type || 'BUSINESS',
            profilePictureUrl: meData.profile_picture_url,
            mediaCount: meData.media_count || 0,
            followersCount: meData.followers_count || 0
          };
        }
      }
      const errMessage = data.error?.message || `Meta API returned HTTP ${res.status}`;
      throw new Error(errMessage);
    }

    return {
      id: data.id,
      username: data.username || 'flash__ai__digital',
      name: data.name || data.username || 'FLASH.Ai Official',
      accountType: data.account_type || 'BUSINESS',
      profilePictureUrl: data.profile_picture_url,
      mediaCount: data.media_count || 0,
      followersCount: data.followers_count || 0
    };
  }

  /**
   * Step 1 of Official Publishing Flow:
   * Create Instagram Media Container.
   * POST /{ig-user-id}/media
   */
  public async createMediaContainer(params: CreateContainerParams): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured in server environment.');
    }

    const url = `${this.graphBaseUrl}/${this.accountId}/media`;
    const bodyParams = new URLSearchParams();

    bodyParams.append('access_token', this.accessToken);
    bodyParams.append('caption', params.caption);

    if (params.mediaType === 'REELS') {
      bodyParams.append('media_type', 'REELS');
      bodyParams.append('video_url', params.mediaUrl);
      bodyParams.append('share_to_feed', params.shareToFeed === false ? 'false' : 'true');
      if (params.coverUrl) {
        bodyParams.append('cover_url', params.coverUrl);
      }
    } else if (params.mediaType === 'IMAGE' || params.mediaType === 'STORY') {
      if (params.mediaType === 'STORY') {
        bodyParams.append('media_type', 'STORIES');
        bodyParams.append('image_url', params.mediaUrl);
      } else {
        bodyParams.append('image_url', params.mediaUrl);
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      body: bodyParams
    });

    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Failed to create container (HTTP ${res.status})`;
      throw new Error(errMsg);
    }

    if (!data.id) {
      throw new Error('Meta did not return a container creation ID.');
    }

    return data.id;
  }

  /**
   * Step 2 of Official Publishing Flow:
   * Poll Media Container Status.
   * GET /{creation-id}?fields=status_code,status,error_message,error_subcode
   */
  public async checkMediaStatus(creationId: string): Promise<{
    statusCode: 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED';
    statusText?: string;
    errorMessage?: string;
    errorSubcode?: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured.');
    }

    const url = `${this.graphBaseUrl}/${creationId}?fields=status_code,status,error_message,error_subcode&access_token=${encodeURIComponent(
      this.accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `Failed to check container status (${res.status})`);
    }

    return {
      statusCode: data.status_code || (data.status === 'FINISHED' ? 'FINISHED' : 'IN_PROGRESS'),
      statusText: data.status,
      errorMessage: data.error_message,
      errorSubcode: data.error_subcode
    };
  }

  /**
   * Helper: Polls container status until FINISHED, ERROR, or max attempts reached.
   */
  public async pollContainerUntilReady(
    creationId: string,
    maxAttempts: number = 10,
    delayMs: number = 3000
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const status = await this.checkMediaStatus(creationId);

      if (status.statusCode === 'FINISHED') {
        return;
      }

      if (status.statusCode === 'ERROR' || status.statusCode === 'EXPIRED') {
        throw new Error(
          `Media container processing failed with status ${status.statusCode}: ${
            status.errorMessage || 'Invalid video encoding or timeout.'
          }`
        );
      }

      // Still in progress, wait before polling again
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    throw new Error(
      `Media container processing timed out after ${maxAttempts * (delayMs / 1000)} seconds. Container ID: ${creationId}`
    );
  }

  /**
   * Step 3 of Official Publishing Flow:
   * Publish Media Container.
   * POST /{ig-user-id}/media_publish?creation_id={creation_id}
   */
  public async publishMedia(creationId: string): Promise<{ id: string }> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured.');
    }

    const url = `${this.graphBaseUrl}/${this.accountId}/media_publish`;
    const bodyParams = new URLSearchParams();
    bodyParams.append('creation_id', creationId);
    bodyParams.append('access_token', this.accessToken);

    const res = await fetch(url, {
      method: 'POST',
      body: bodyParams
    });

    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Publish request failed (HTTP ${res.status})`;
      throw new Error(errMsg);
    }

    return { id: data.id };
  }

  /**
   * Full 3-Step Official Publishing Pipeline.
   * Container Creation -> Status Polling -> Publish -> Save ID & Permalink
   */
  public async publishFullPipeline(params: CreateContainerParams): Promise<PublishResult> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured in server environment.');
    }

    // 1. Create container
    const containerId = await this.createMediaContainer(params);

    // 2. Poll until FINISHED (videos/Reels need transcoding)
    if (params.mediaType === 'REELS') {
      await this.pollContainerUntilReady(containerId, 10, 3000);
    }

    // 3. Publish
    const published = await this.publishMedia(containerId);

    // 4. Fetch permalink if available
    let permalink: string | undefined;
    try {
      const metaItem = await this.getMediaDetails(published.id);
      permalink = metaItem.permalink;
    } catch {
      permalink = `https://instagram.com/p/${published.id}/`;
    }

    return {
      success: true,
      metaPostId: published.id,
      containerId,
      permalink,
      status: 'PUBLISHED',
      isDemo: false,
      publishedAt: new Date().toISOString()
    };
  }

  /**
   * Fetches published media items.
   * GET /{ig-user-id}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,shortcode
   */
  public async getPublishedMedia(limit: number = 20): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const url = `${this.graphBaseUrl}/${this.accountId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,shortcode&limit=${limit}&access_token=${encodeURIComponent(
      this.accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch published media.');
    }

    return data.data || [];
  }

  /**
   * Fetches single media item details.
   */
  public async getMediaDetails(mediaId: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Meta credentials not configured.');
    }

    const url = `${this.graphBaseUrl}/${mediaId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,shortcode&access_token=${encodeURIComponent(
      this.accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch media details.');
    }

    return data;
  }

  /**
   * Fetches media insights (v21.0/v22.0 supported metrics: views, reach, likes, comments, saved, shares).
   */
  public async getMediaInsights(mediaId: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    const url = `${this.graphBaseUrl}/${mediaId}/insights?metric=views,reach,likes,comments,saved,shares&access_token=${encodeURIComponent(
      this.accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      console.warn('Insights query warning:', data.error?.message);
      return null;
    }

    const metricsMap: Record<string, number> = {};
    if (Array.isArray(data.data)) {
      data.data.forEach((metric: any) => {
        metricsMap[metric.name] = metric.values?.[0]?.value ?? metric.total_value?.value ?? 0;
      });
    }

    return metricsMap;
  }

  /**
   * Helper to mask sensitive IDs.
   */
  private maskId(id: string): string {
    if (!id || id.length < 8) return '********';
    return `${id.slice(0, 6)}••••${id.slice(-4)}`;
  }
}

export const serverMetaService = new MetaInstagramService();
