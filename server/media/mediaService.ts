import fs from 'node:fs';
import path from 'node:path';
import {
  MEDIA_DIRS,
  initMediaStorage,
  getStorageStats,
  sanitizeFilename
} from './storagePaths.js';
import { detectFfmpeg } from './videoRenderer.js';
import { renderQueue } from './renderQueue.js';
import { generateStoryboardFromContent } from './storyboardGenerator.js';
import { BRAND_PRESETS } from './brandPresets.js';
import { ROYALTY_FREE_TRACKS } from './musicLibrary.js';
import {
  creatomateProvider,
  type CreatomateRenderInput,
  type RenderedVideoResult,
  type CreatomateProviderStatus
} from './providers/creatomateProvider.js';
import {
  elevenLabsProvider,
  type ElevenLabsSpeechOptions,
  type ElevenLabsSpeechResult,
  type ElevenLabsProviderStatus
} from './providers/elevenLabsProvider.js';
import {
  synthesizeAndPersistServerReel,
  type ServerVideoSynthesisOptions,
  type ServerSynthesizedVideoResult
} from './videoSynthesizer.js';
import type {
  MediaEngineStatus,
  VisualStoryboard,
  ContentVariant,
  VideoDuration,
  RenderJob,
  MediaAsset,
  MediaAssetType
} from '../../src/types/index.js';

class ServerMediaService {
  constructor() {
    initMediaStorage();
  }

  public getStatus(): MediaEngineStatus {
    const ffmpeg = detectFfmpeg();
    const storage = getStorageStats();
    const allJobs = renderQueue.getAllJobs();
    const activeJobs = allJobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'FAILED' && j.status !== 'CANCELLED');
    const completedJobs = allJobs.filter((j) => j.status === 'COMPLETED');

    const mediaMode = process.env.MEDIA_PUBLISHING_MODE === 'LIVE' ? 'LIVE' : 'DEMO';

    return {
      isConfigured: true,
      ffmpegAvailable: ffmpeg.available,
      ffmpegVersion: ffmpeg.version,
      mediaMode,
      activeJobsCount: activeJobs.length,
      completedJobsCount: completedJobs.length,
      imageProvider: {
        active: 'FLASH.Ai Procedural 1080x1920 Graphics Engine',
        isAvailable: true
      },
      voiceProvider: {
        active: process.env.GOOGLE_TTS_API_KEY
          ? 'Google Cloud Text-to-Speech'
          : process.env.ELEVENLABS_API_KEY
          ? 'ElevenLabs TTS'
          : 'Local Silent Wave Fallback',
        isAvailable: true,
        availableVoices: [
          { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam - Gen-Z Social Media Creator (US)', language: 'en-US' },
          { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel - Professional Clear (US)', language: 'en-US' },
          { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi - Energetic Creator (US)', language: 'en-US' },
          { id: 'none', name: 'No Voiceover (Silent Audio)', language: 'en' }
        ]
      },
      musicProvider: {
        tracksCount: ROYALTY_FREE_TRACKS.length
      },
      storage
    };
  }

  public createStoryboard(params: {
    contentId: string;
    title: string;
    pillarId: any;
    variant: ContentVariant;
    videoDuration: VideoDuration | string;
    brandPresetId?: string;
  }): VisualStoryboard {
    return generateStoryboardFromContent(params);
  }

  public submitRenderJob(params: {
    contentId: string;
    contentTitle: string;
    storyboard: VisualStoryboard;
    voiceConfig?: any;
    musicConfig?: any;
    brandPresetId?: string;
  }): RenderJob {
    return renderQueue.createJob(params);
  }

  public getJob(id: string): RenderJob | undefined {
    return renderQueue.getJob(id);
  }

  public getAllJobs(): RenderJob[] {
    return renderQueue.getAllJobs();
  }

  public cancelJob(id: string): boolean {
    return renderQueue.cancelJob(id);
  }

  public retryJob(id: string): RenderJob | undefined {
    return renderQueue.retryJob(id);
  }

  public getMusicTracks() {
    return ROYALTY_FREE_TRACKS;
  }

  public getBrandPresets() {
    return BRAND_PRESETS;
  }

  public getAssets(): MediaAsset[] {
    initMediaStorage();
    const assets: MediaAsset[] = [];
    try {
      if (fs.existsSync(MEDIA_DIRS.assets)) {
        const files = fs.readdirSync(MEDIA_DIRS.assets);
        files.forEach((file) => {
          const filePath = path.join(MEDIA_DIRS.assets, file);
          const stats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          let type: MediaAssetType = 'gradient_bg';
          if (ext === '.mp4' || ext === '.mov') type = 'user_video';
          else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') type = 'user_image';
          else if (ext === '.svg') type = 'ai_image';

          assets.push({
            id: `asset-${file}`,
            name: file,
            type,
            url: `/media/assets/${file}`,
            fileSize: stats.size,
            tags: ['uploaded', type],
            createdAt: stats.birthtime.toISOString()
          });
        });
      }
    } catch (err) {
      console.error('[ServerMediaService] Error listing assets:', err);
    }
    return assets;
  }

  public saveAsset(
    name: string,
    buffer: Buffer,
    type: MediaAssetType = 'user_image'
  ): MediaAsset {
    initMediaStorage();
    const safeName = `${Date.now()}_${sanitizeFilename(name)}`;
    const targetPath = path.join(MEDIA_DIRS.assets, safeName);
    fs.writeFileSync(targetPath, buffer);

    return {
      id: `asset-${safeName}`,
      name,
      type,
      url: `/media/assets/${safeName}`,
      fileSize: buffer.length,
      tags: ['uploaded', type],
      createdAt: new Date().toISOString()
    };
  }

  public deleteAsset(assetId: string): boolean {
    initMediaStorage();
    const cleanId = assetId.replace('asset-', '');
    const targetPath = path.join(MEDIA_DIRS.assets, cleanId);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
    return false;
  }

  /**
   * Returns live Creatomate provider status for dashboard health checks.
   */
  public getCreatomateStatus(): CreatomateProviderStatus {
    return creatomateProvider.getStatus();
  }

  /**
   * Safe status report for ElevenLabs AI voice provider.
   */
  public getElevenLabsStatus(): ElevenLabsProviderStatus {
    return elevenLabsProvider.getStatus();
  }

  /**
   * Generates AI voiceover audio using ElevenLabs and persists to media/audio/.
   */
  public async generateVoiceover(
    text: string,
    options?: ElevenLabsSpeechOptions
  ): Promise<ElevenLabsSpeechResult> {
    return elevenLabsProvider.generateSpeech(text, options);
  }

  /**
   * Generates a voice test sentence via ElevenLabs and saves to media/audio/.
   */
  public async generateVoiceTest(
    customText?: string,
    mode: 'LIVE' | 'DEMO' = 'LIVE'
  ): Promise<ElevenLabsSpeechResult> {
    const text = customText || 'Stop manually editing your Instagram Reels. FLASH.Ai generates, renders, and auto-publishes high-converting content with zero effort.';
    return elevenLabsProvider.generateSpeech(text, {
      mode,
      outputFilename: `voice_test_${Date.now()}.mp3`
    });
  }

  /**
   * Renders a video using Creatomate (or high-res procedural fallback) and persists to disk.
   */
  public async renderWithCreatomate(input: CreatomateRenderInput): Promise<RenderedVideoResult> {
    return creatomateProvider.renderVideo(input);
  }

  /**
   * Renders a test Reel in DEMO/TEST mode and persists to disk.
   */
  public async renderTestReel(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<RenderedVideoResult> {
    const testId = `test-reel-${Date.now()}`;
    return creatomateProvider.renderVideo({
      projectId: testId,
      title: 'How AI Automation Saves Founders 20+ Hours Every Week',
      topic: 'AI Lead Generation & Social Media Automation Workflows',
      formatName: 'AI AUTOMATION DEMO',
      durationSeconds: 30,
      hook: 'Stop manually qualifying leads—let our 24/7 AI agent handle it.',
      cta: 'Comment "AUTOMATE" or DM us to install this AI workflow.',
      brandHandle: '@flash__ai__digital',
      mode
    });
  }

  /**
   * Synthesizes and writes the valid 9:16 vertical MP4 video and poster to persistent server storage.
   */
  public synthesizeAndPersistReelFile(
    options: ServerVideoSynthesisOptions
  ): ServerSynthesizedVideoResult {
    return synthesizeAndPersistServerReel(options);
  }

  /**
   * Validates whether a media URL corresponds to a real, readable file on disk with valid size.
   */
  public verifyAssetExistence(mediaUrl: string): {
    exists: boolean;
    size: number;
    absolutePath: string;
    isReadable: boolean;
    mimeType: string;
  } {
    initMediaStorage();
    const relative = decodeURIComponent(mediaUrl.replace(/^\/media\//, ''));
    const absolutePath = path.normalize(path.join(MEDIA_DIRS.root, relative));

    if (!fs.existsSync(absolutePath)) {
      return {
        exists: false,
        size: 0,
        absolutePath,
        isReadable: false,
        mimeType: 'application/octet-stream'
      };
    }

    try {
      const stat = fs.statSync(absolutePath);
      const isReadable = stat.size > 0 && !stat.isDirectory();
      const ext = path.extname(absolutePath).toLowerCase();
      const mimeType = ext === '.mp4' ? 'video/mp4' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';

      return {
        exists: true,
        size: stat.size,
        absolutePath,
        isReadable,
        mimeType
      };
    } catch {
      return {
        exists: false,
        size: 0,
        absolutePath,
        isReadable: false,
        mimeType: 'application/octet-stream'
      };
    }
  }
}

export const serverMediaService = new ServerMediaService();
