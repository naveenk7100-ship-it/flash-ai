import type {
  MediaEngineStatus,
  VisualStoryboard,
  ContentVariant,
  VideoDuration,
  RenderJob,
  MediaAsset,
  MediaAssetType,
  MusicTrack,
  BrandPreset,
  VoiceConfig,
  MusicConfig
} from '../types';

class MediaGenerationService {
  private baseUrl = '/api/media';

  public async getStatus(): Promise<MediaEngineStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Failed to fetch media status from server, returning default state:', err);
      return {
        isConfigured: true,
        ffmpegAvailable: false,
        mediaMode: 'DEMO',
        activeJobsCount: 0,
        completedJobsCount: 0,
        imageProvider: { active: 'Procedural Graphics', isAvailable: true },
        voiceProvider: {
          active: 'Local Silent Wave',
          isAvailable: true,
          availableVoices: [{ id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam - Gen-Z Creator (US)', language: 'en-US' }]
        },
        musicProvider: { tracksCount: 4 },
        storage: { assetsCount: 0, rendersCount: 0, totalSizeBytes: 0 }
      };
    }
  }

  public async createStoryboard(params: {
    contentId: string;
    title: string;
    pillarId: any;
    variant: ContentVariant;
    videoDuration: VideoDuration | string;
    brandPresetId?: string;
  }): Promise<VisualStoryboard> {
    const res = await fetch(`${this.baseUrl}/storyboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create visual storyboard');
    }
    return data.storyboard;
  }

  public async submitRenderJob(params: {
    contentId: string;
    contentTitle: string;
    storyboard: VisualStoryboard;
    voiceConfig?: Partial<VoiceConfig>;
    musicConfig?: Partial<MusicConfig>;
    brandPresetId?: string;
  }): Promise<RenderJob> {
    const res = await fetch(`${this.baseUrl}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit render job');
    }
    return data.job;
  }

  public async getJob(jobId: string): Promise<RenderJob> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get job');
    }
    return data.job;
  }

  public async getAllJobs(): Promise<RenderJob[]> {
    try {
      const res = await fetch(`${this.baseUrl}/jobs`);
      const data = await res.json();
      return data.jobs || [];
    } catch {
      return [];
    }
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}/cancel`, { method: 'POST' });
    const data = await res.json();
    return !!data.success;
  }

  public async retryJob(jobId: string): Promise<RenderJob> {
    const res = await fetch(`${this.baseUrl}/jobs/${jobId}/retry`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to retry job');
    }
    return data.job;
  }

  public async getMusicTracks(): Promise<MusicTrack[]> {
    try {
      const res = await fetch(`${this.baseUrl}/music`);
      const data = await res.json();
      return data.tracks || [];
    } catch {
      return [];
    }
  }

  public async getBrandPresets(): Promise<BrandPreset[]> {
    try {
      const res = await fetch(`${this.baseUrl}/presets`);
      const data = await res.json();
      return data.presets || [];
    } catch {
      return [];
    }
  }

  public async getAssets(): Promise<MediaAsset[]> {
    try {
      const res = await fetch(`${this.baseUrl}/assets`);
      const data = await res.json();
      return data.assets || [];
    } catch {
      return [];
    }
  }

  public async uploadAsset(
    name: string,
    base64Data: string,
    type: MediaAssetType = 'user_image'
  ): Promise<MediaAsset> {
    const res = await fetch(`${this.baseUrl}/assets/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data: base64Data, type })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload asset');
    }
    return data.asset;
  }

  public async deleteAsset(assetId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/assets/${assetId}`, { method: 'DELETE' });
    const data = await res.json();
    return !!data.success;
  }

  public async pollJobUntilComplete(
    jobId: string,
    onProgress?: (job: RenderJob) => void,
    intervalMs = 400,
    maxWaitMs = 120000
  ): Promise<RenderJob> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const job = await this.getJob(jobId);
      if (onProgress) onProgress(job);

      if (job.status === 'COMPLETED') return job;
      if (job.status === 'FAILED' || job.status === 'CANCELLED') {
        throw new Error(job.errorMessage || `Job ended with status: ${job.status}`);
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error('Render job timed out.');
  }
}

export const mediaGenerationService = new MediaGenerationService();
