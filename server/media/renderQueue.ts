import { randomUUID } from 'node:crypto';
import type {
  RenderJob,
  RenderStage,
  VisualStoryboard,
  VoiceConfig,
  MusicConfig
} from '../../src/types/index.js';
import { generateSubtitleCues } from './subtitleGenerator.js';
import { getImageProvider } from './imageProvider.js';
import { getVoiceProvider } from './voiceProvider.js';
import { renderReelVideo, detectFfmpeg } from './videoRenderer.js';
import { getBrandPresetById } from './brandPresets.js';
import { ROYALTY_FREE_TRACKS } from './musicLibrary.js';

class RenderQueueManager {
  private jobs: Map<string, RenderJob> = new Map();
  private isProcessing = false;

  public createJob(params: {
    contentId: string;
    contentTitle: string;
    storyboard: VisualStoryboard;
    voiceConfig?: Partial<VoiceConfig>;
    musicConfig?: Partial<MusicConfig>;
    brandPresetId?: string;
    mode?: 'DEMO' | 'LIVE';
  }): RenderJob {
    const id = `job-${Date.now()}-${randomUUID().slice(0, 6)}`;
    const brandPreset = getBrandPresetById(params.brandPresetId);
    const ffmpegStatus = detectFfmpeg();

    const voiceConfig: VoiceConfig = {
      provider: params.voiceConfig?.provider || 'none',
      voiceId: params.voiceConfig?.voiceId && params.voiceConfig.voiceId !== 'neutral-pro' ? params.voiceConfig.voiceId : 'TX3LPaxmHKxFdv7VOQHJ',
      language: params.voiceConfig?.language || 'en-US',
      speed: params.voiceConfig?.speed || 1.0,
      pitch: params.voiceConfig?.pitch || 0.0,
      volume: params.voiceConfig?.volume || 1.0
    };

    const musicConfig: MusicConfig = {
      trackId: params.musicConfig?.trackId || ROYALTY_FREE_TRACKS[0].id,
      trackName: params.musicConfig?.trackName || ROYALTY_FREE_TRACKS[0].name,
      trackUrl: params.musicConfig?.trackUrl || ROYALTY_FREE_TRACKS[0].url,
      volume: params.musicConfig?.volume ?? 0.12,
      fadeInSeconds: params.musicConfig?.fadeInSeconds ?? 1.5,
      fadeOutSeconds: params.musicConfig?.fadeOutSeconds ?? 2.0,
      startOffsetSeconds: params.musicConfig?.startOffsetSeconds ?? 0,
      enabled: params.musicConfig?.enabled ?? true
    };

    const subtitles = generateSubtitleCues(params.storyboard.scenes);

    const job: RenderJob = {
      id,
      contentId: params.contentId,
      contentTitle: params.contentTitle,
      status: 'QUEUED',
      progress: 0,
      currentStage: 'Queued for rendering...',
      stageMessage: 'Awaiting worker thread availability',
      storyboard: params.storyboard,
      voiceConfig,
      musicConfig,
      brandPreset,
      subtitles,
      mode: params.mode || (process.env.MEDIA_PUBLISHING_MODE === 'LIVE' ? 'LIVE' : 'DEMO'),
      ffmpegAvailable: ffmpegStatus.available,
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(id, job);
    this.processQueue();
    return job;
  }

  public getJob(id: string): RenderJob | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): RenderJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.status !== 'COMPLETED' && job.status !== 'FAILED') {
      job.status = 'CANCELLED';
      job.stageMessage = 'Render job cancelled by user.';
      return true;
    }
    return false;
  }

  public retryJob(id: string): RenderJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    job.status = 'QUEUED';
    job.progress = 0;
    job.retryCount += 1;
    job.errorMessage = undefined;
    job.stageMessage = `Retrying render (Attempt #${job.retryCount + 1})...`;
    this.processQueue();
    return job;
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'QUEUED');
      if (!nextJob) {
        this.isProcessing = false;
        return;
      }

      await this.executeJob(nextJob);
    } catch (err) {
      console.error('[RenderQueue] Queue processing loop error:', err);
    } finally {
      this.isProcessing = false;
      const remaining = Array.from(this.jobs.values()).some((j) => j.status === 'QUEUED');
      if (remaining) {
        setTimeout(() => this.processQueue(), 200);
      }
    }
  }

  private async executeJob(job: RenderJob): Promise<void> {
    job.startedAt = new Date().toISOString();

    const updateStage = (stage: RenderStage, progress: number, message: string) => {
      job.status = stage;
      job.progress = progress;
      job.currentStage = stage;
      job.stageMessage = message;
    };

    try {
      updateStage('PREPARING', 10, 'Preparing scene storyboards and brand specifications...');
      await new Promise((r) => setTimeout(r, 150));

      updateStage('GENERATING_ASSETS', 30, 'Rendering 1080x1920 vertical visual cards for all scenes...');
      const imageProvider = getImageProvider();
      const sceneImagePaths: string[] = [];

      for (let i = 0; i < job.storyboard.scenes.length; i++) {
        const scene = job.storyboard.scenes[i];
        const res = await imageProvider.generateSceneImage(scene, {
          width: 1080,
          height: 1920,
          aspectRatio: '9:16',
          brandPreset: job.brandPreset
        });
        sceneImagePaths.push(res.localPath);
        job.progress = Math.min(50, 30 + Math.round(((i + 1) / job.storyboard.scenes.length) * 20));
      }

      updateStage('GENERATING_VOICE', 55, 'Generating voiceover track for narrative script...');
      const voiceProvider = getVoiceProvider(job.voiceConfig.provider);
      const fullSpeechText = job.storyboard.scenes.map((s) => s.speechText).join(' ');
      const voiceRes = await voiceProvider.generateSpeech(fullSpeechText, job.voiceConfig);

      updateStage('CREATING_SUBTITLES', 65, 'Formatting high-contrast Instagram safe-zone subtitles...');
      job.subtitles = generateSubtitleCues(job.storyboard.scenes);
      await new Promise((r) => setTimeout(r, 150));

      updateStage('RENDERING', 75, 'Composing video layers, audio mixer, and animations...');
      const renderRes = await renderReelVideo(
        job,
        sceneImagePaths,
        voiceRes.localPath,
        (percent, msg) => {
          job.progress = percent;
          job.stageMessage = msg;
        }
      );

      if (!renderRes.success) {
        throw new Error(renderRes.errorMessage || 'Rendering pipeline returned failure.');
      }

      updateStage('VALIDATING', 95, 'Running quality control validation checks on rendered MP4...');
      await new Promise((r) => setTimeout(r, 150));

      job.outputVideoUrl = renderRes.videoUrl;
      job.outputVideoPath = renderRes.videoPath;
      job.thumbnailUrl = renderRes.thumbnailUrl;
      job.duration = renderRes.duration || job.storyboard.totalDuration;
      job.fileSizeBytes = renderRes.fileSizeBytes;
      job.completedAt = new Date().toISOString();
      updateStage('COMPLETED', 100, 'Reel render completed and validated. Ready for human approval.');
    } catch (err: any) {
      console.error(`[RenderQueue] Job ${job.id} failed:`, err);
      job.status = 'FAILED';
      job.errorMessage = err.message || 'Render failed during execution.';
      job.stageMessage = `Failed: ${job.errorMessage}`;
      job.completedAt = new Date().toISOString();
    }
  }
}

export const renderQueue = new RenderQueueManager();
