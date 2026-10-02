/**
 * FLASH.Ai Creatomate Live Video Render Provider
 * 
 * Implements IVideoRenderProvider for server-side vertical 9:16 Instagram Reel video rendering
 * via Creatomate API (Template-based and RenderScript dynamic compositions).
 * 
 * Flow:
 * SCRIPT & SCENE DATA → CREATOMATE RENDER → POLL COMPLETION → DOWNLOAD MP4
 * → SAVE TO media/renders/ → VERIFY ON DISK → THUMBNAIL → READY FOR REVIEW
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { MEDIA_DIRS, initMediaStorage, sanitizeFilename } from '../storagePaths.js';
import { buildMuxedVerticalMp4 } from '../audioMuxer.js';
import { MediaValidator } from '../mediaValidator.js';
import { nativeVideoRenderer } from '../nativeVideoRenderer.js';
import { visualIntentEngine } from '../../../src/services/visualIntentEngine.js';

export interface IVideoRenderProvider {
  renderVideo(input: CreatomateRenderInput): Promise<RenderedVideoResult>;
  getRenderStatus(id: string): Promise<CreatomateStatusResult>;
}

export interface CreatomateRenderInput {
  projectId: string;
  title: string;
  topic: string;
  formatName?: string;
  durationSeconds?: number;
  scenes?: Array<{
    sceneNumber: number;
    block: string;
    text: string;
    voiceoverText?: string;
    durationSeconds: number;
  }>;
  hook?: string;
  cta?: string;
  caption?: string;
  brandHandle?: string;
  width?: number;
  height?: number;
  fps?: number;
  templateId?: string;
  modifications?: Record<string, any>;
  voiceAudioUrl?: string;
  voiceAudioPath?: string;
  voiceAudioDurationSeconds?: number;
  mode?: 'LIVE' | 'DEMO';
}

export interface CreatomateStatusResult {
  id: string;
  status: 'planned' | 'waiting' | 'transcribing' | 'rendering' | 'succeeded' | 'failed';
  url?: string;
  snapshotUrl?: string;
  duration?: number;
  fileSizeBytes?: number;
  errorMessage?: string;
}

export interface RenderedVideoResult {
  success: boolean;
  renderId: string;
  outputVideoUrl: string;
  outputVideoPath: string;
  thumbnailUrl: string;
  thumbnailPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  width: number;
  height: number;
  format: 'mp4';
  provider: 'creatomate' | 'procedural_fallback';
  renderDurationMs: number;
  errorMessage?: string;
}

export interface CreatomateProviderStatus {
  apiKey: 'CONFIGURED' | 'MISSING';
  template: 'CONFIGURED' | 'MISSING';
  provider: 'READY' | 'NOT READY';
  templateId?: string;
  lastRenderStatus?: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'IDLE';
  lastRenderDurationSeconds?: number;
  lastRenderError?: string;
  lastRenderTimestamp?: string;
  totalRendersCompleted: number;
}

export class CreatomateVideoProvider implements IVideoRenderProvider {
  private lastStatus: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'IDLE' = 'IDLE';
  private lastDuration: number = 0;
  private lastError?: string;
  private lastTimestamp?: string;
  private completedCount: number = 0;

  private get apiKey(): string {
    return process.env.CREATOMATE_API_KEY?.trim() || '';
  }

  private get templateId(): string {
    return process.env.CREATOMATE_TEMPLATE_ID?.trim() || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 20);
  }

  public hasTemplate(): boolean {
    return Boolean(this.templateId && this.templateId.length > 10);
  }

  /**
   * Safe status report for dashboard display without exposing API keys.
   */
  public getStatus(): CreatomateProviderStatus {
    const isReady = this.isConfigured();
    return {
      apiKey: isReady ? 'CONFIGURED' : 'MISSING',
      template: this.hasTemplate() ? 'CONFIGURED' : 'MISSING',
      provider: isReady ? 'READY' : 'NOT READY',
      templateId: this.hasTemplate() ? `${this.templateId.slice(0, 8)}...` : undefined,
      lastRenderStatus: this.lastStatus,
      lastRenderDurationSeconds: this.lastDuration,
      lastRenderError: this.lastError,
      lastRenderTimestamp: this.lastTimestamp,
      totalRendersCompleted: this.completedCount
    };
  }

  /**
   * Constructs the Creatomate render payload (Template-based or RenderScript dynamic composition).
   */
  public buildRenderPayload(input: CreatomateRenderInput): Record<string, any> {
    const activeTemplate = input.templateId !== undefined ? input.templateId : this.templateId;
    const duration = input.durationSeconds || 30;
    const width = input.width || 1080;
    const height = input.height || 1920;
    const fps = input.fps || 30;
    const handle = input.brandHandle || '@flash__ai__digital';
    const hook = input.hook || input.title;
    const cta = input.cta || 'Comment "AUTOMATE" or DM us for the workflow.';

    // 1. Template-based composition with dynamic modifications (only when using Creatomate template UUID)
    const isCreatomateTemplateId = Boolean(
      activeTemplate &&
      (activeTemplate === this.templateId || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(activeTemplate))
    );

    if (isCreatomateTemplateId) {
      const defaultModifications: Record<string, any> = {
        'Handle': handle,
        'Headline': input.title,
        'Topic': input.topic,
        'Format': input.formatName || 'AI AUTOMATION',
        'Hook': hook,
        'CTA': cta,
        'Watermark': handle
      };

      if (input.scenes && input.scenes.length > 0) {
        input.scenes.forEach((s) => {
          defaultModifications[`Scene_${s.sceneNumber}_Text`] = s.text;
          if (s.voiceoverText) {
            defaultModifications[`Scene_${s.sceneNumber}_Voice`] = s.voiceoverText;
          }
        });
      }

      if (input.voiceAudioUrl) {
        defaultModifications['Voiceover'] = input.voiceAudioUrl;
        defaultModifications['Audio'] = input.voiceAudioUrl;
      }

      return {
        template_id: activeTemplate,
        modifications: {
          ...defaultModifications,
          ...(input.modifications || {})
        }
      };
    }

    // 2. RenderScript / Dynamic composition (1080x1920 9:16 vertical)
    const templateId = (input.templateId || input.formatName || '').toLowerCase();
    
    // Choose dynamic styling based on template
    let primaryColor = '#00F5FF';
    let secondaryColor = '#3B82F6';
    let cardStroke = '#00F5FF';

    if (templateId.includes('workflow')) {
      primaryColor = '#06B6D4';
      secondaryColor = '#10B981';
      cardStroke = '#06B6D4';
    } else if (templateId.includes('case') || templateId.includes('study')) {
      primaryColor = '#F59E0B';
      secondaryColor = '#10B981';
      cardStroke = '#F59E0B';
    } else if (templateId.includes('showcase') || templateId.includes('product') || templateId.includes('reveal')) {
      primaryColor = '#A855F7';
      secondaryColor = '#EC4899';
      cardStroke = '#A855F7';
    } else if (templateId.includes('news') || templateId.includes('breaking')) {
      primaryColor = '#EF4444';
      secondaryColor = '#F59E0B';
      cardStroke = '#EF4444';
    } else if (templateId.includes('tutorial') || templateId.includes('how-to')) {
      primaryColor = '#3B82F6';
      secondaryColor = '#10B981';
      cardStroke = '#3B82F6';
    } else if (templateId.includes('list') || templateId.includes('top-5')) {
      primaryColor = '#EC4899';
      secondaryColor = '#8B5CF6';
      cardStroke = '#EC4899';
    } else if (templateId.includes('before') || templateId.includes('after')) {
      primaryColor = '#10B981';
      secondaryColor = '#EF4444';
      cardStroke = '#10B981';
    } else if (templateId.includes('story')) {
      primaryColor = '#6366F1';
      secondaryColor = '#A855F7';
      cardStroke = '#6366F1';
    } else if (templateId.includes('cinematic') || templateId.includes('explainer')) {
      primaryColor = '#E2E8F0';
      secondaryColor = '#00F5FF';
      cardStroke = '#38BDF8';
    }

    const scenes = input.scenes && input.scenes.length > 0 ? input.scenes : [
      { sceneNumber: 1, block: 'HOOK', text: hook, voiceoverText: hook, durationSeconds: Math.round(duration / 4) },
      { sceneNumber: 2, block: 'CONTEXT', text: 'Natural Language & Visual Canvas', voiceoverText: input.title, durationSeconds: Math.round(duration / 4) },
      { sceneNumber: 3, block: 'DEMO', text: 'Document • Spreadsheet • Code', voiceoverText: input.topic, durationSeconds: Math.round(duration / 4) },
      { sceneNumber: 4, block: 'SUMMARY', text: 'Less Friction. More Practical AI.', voiceoverText: 'Zero Technical Friction', durationSeconds: Math.round(duration / 4) }
    ];

    const sceneDuration = duration / scenes.length;

    const elements: any[] = [
      // Persistent Background Gradient Shape
      {
        type: 'shape',
        shape: 'rectangle',
        fill_color: '#07090e',
        width: '100%',
        height: '100%'
      },
      // Persistent Top Brand Watermark (Instagram Safe Zone)
      {
        type: 'text',
        text: handle,
        font_family: 'Montserrat',
        font_weight: '900',
        font_size: '28 vmin',
        fill_color: primaryColor,
        y: '8%',
        x: '50%',
        x_alignment: '50%'
      },
      // Format Badge
      {
        type: 'text',
        text: input.formatName || 'AI DISCOVERY',
        font_family: 'Montserrat',
        font_weight: '700',
        font_size: '20 vmin',
        fill_color: secondaryColor,
        y: '13%',
        x: '50%',
        x_alignment: '50%'
      }
    ];

    // Multi-Scene Animated Timeline Elements
    scenes.forEach((scene, idx) => {
      const startTime = idx * sceneDuration;
      const curDuration = sceneDuration;
      const isFirst = idx === 0;
      const isLast = idx === scenes.length - 1;

      let sceneLabel = `SCENE ${scene.sceneNumber}`;
      if (isFirst) sceneLabel = '✦ AI WORKSPACE ACTIVE';
      else if (idx === 1) sceneLabel = '✦ PARADIGM SHIFT';
      else if (idx === 2) sceneLabel = '✦ TRIPLE WORKFLOW DEMO';
      else if (isLast) sceneLabel = '✦ UNIFIED TAKEAWAY';

      // 1. Scene Category Label
      elements.push({
        type: 'text',
        text: sceneLabel,
        time: startTime,
        duration: curDuration,
        font_family: 'Montserrat',
        font_weight: '800',
        font_size: '22 vmin',
        fill_color: primaryColor,
        y: '19%',
        x: '50%',
        x_alignment: '50%',
        enter: { type: 'slide', direction: 'down', duration: 0.3 },
        exit: { type: 'fade', duration: 0.2 }
      });

      // 2. Kinetic Scene Headline
      const sceneHeadline = scene.text.length > 40 ? `${scene.text.slice(0, 38)}...` : scene.text;
      elements.push({
        type: 'text',
        text: sceneHeadline,
        time: startTime,
        duration: curDuration,
        font_family: 'Montserrat',
        font_weight: '900',
        font_size: '40 vmin',
        fill_color: '#FFFFFF',
        y: '26%',
        width: '86%',
        x: '50%',
        x_alignment: '50%',
        text_clip: true,
        enter: { type: 'zoom', duration: 0.4 },
        exit: { type: 'fade', duration: 0.2 }
      });

      // 3. Center Visual UI Mockup Card
      elements.push({
        type: 'shape',
        shape: 'rectangle',
        time: startTime,
        duration: curDuration,
        fill_color: '#0f172a',
        stroke_color: cardStroke,
        stroke_width: '3 vmin',
        border_radius: '24 vmin',
        width: '86%',
        height: '42%',
        y: '53%',
        x: '50%',
        x_alignment: '50%',
        enter: { type: 'slide', direction: 'left', duration: 0.4 },
        exit: { type: 'fade', duration: 0.2 }
      });

      // 4. Synchronized Dynamic Subtitle / Caption Safe Area (y: 78%)
      const captionText = scene.voiceoverText || scene.text;
      elements.push({
        type: 'text',
        text: captionText.length > 55 ? `${captionText.slice(0, 52)}...` : captionText,
        time: startTime,
        duration: curDuration,
        font_family: 'Montserrat',
        font_weight: '700',
        font_size: '24 vmin',
        fill_color: '#F8FAFC',
        background_color: 'rgba(15, 23, 42, 0.9)',
        background_border_radius: '12 vmin',
        background_x_padding: '16 vmin',
        background_y_padding: '8 vmin',
        y: '78%',
        width: '86%',
        x: '50%',
        x_alignment: '50%',
        enter: { type: 'fade', duration: 0.2 },
        exit: { type: 'fade', duration: 0.2 }
      });
    });

    // Clean Outro Footer (No sales CTAs)
    elements.push({
      type: 'text',
      text: 'FLASH.Ai • Clean Daily AI Tools & Intelligence',
      font_family: 'Montserrat',
      font_weight: '700',
      font_size: '18 vmin',
      fill_color: '#64748B',
      y: '90%',
      x: '50%',
      x_alignment: '50%'
    });

    if (input.voiceAudioUrl) {
      elements.push({
        type: 'audio',
        source: input.voiceAudioUrl,
        duration: input.voiceAudioDurationSeconds || duration
      });
    }

    return {
      output_format: 'mp4',
      width,
      height,
      frame_rate: fps,
      duration,
      elements,
      source: {
        output_format: 'mp4',
        width,
        height,
        duration,
        elements
      }
    };
  }

  /**
   * Executes the full server-side video rendering pipeline:
   * Submits job → Polls status → Downloads MP4 to media/renders/ → Verifies on disk.
   */
  public async renderVideo(input: CreatomateRenderInput): Promise<RenderedVideoResult> {
    initMediaStorage();
    const startTime = Date.now();
    this.lastStatus = 'PENDING';
    this.lastTimestamp = new Date().toISOString();
    this.lastError = undefined;

    const rawId = input.projectId || `reel-${Date.now()}`;
    const sanitizedId = sanitizeFilename(rawId.replace(/^proj-/, '').replace(/^reel_/, ''));
    const filename = `reel_proj-${sanitizedId}.mp4`;
    const thumbFilename = `thumb_proj-${sanitizedId}.svg`;

    const videoPath = path.join(MEDIA_DIRS.renders, filename);
    const thumbPath = path.join(MEDIA_DIRS.thumbnails, thumbFilename);

    // 0. Resolve Audio Buffer for Muxing
    let mp3AudioBuffer: Buffer | undefined;
    if (input.voiceAudioPath && fs.existsSync(input.voiceAudioPath)) {
      try {
        mp3AudioBuffer = fs.readFileSync(input.voiceAudioPath);
      } catch {}
    }
    if (!mp3AudioBuffer && input.voiceAudioUrl) {
      const rel = input.voiceAudioUrl.replace(/^\/media\//, '');
      const candidatePath = path.resolve(process.cwd(), 'media', rel);
      if (fs.existsSync(candidatePath)) {
        try {
          mp3AudioBuffer = fs.readFileSync(candidatePath);
        } catch {}
      }
    }
    if (!mp3AudioBuffer) {
      const defaultVoiceFiles = [
        path.join(MEDIA_DIRS.audio, `voice_${sanitizedId}.mp3`),
        path.join(MEDIA_DIRS.audio, `voice_support_triaging_37s.mp3`)
      ];
      for (const f of defaultVoiceFiles) {
        if (fs.existsSync(f)) {
          try {
            mp3AudioBuffer = fs.readFileSync(f);
            break;
          } catch {}
        }
      }
    }

    // Fallback if Creatomate API key is missing or in DEMO mode without live credentials
    if (!this.isConfigured() || input.mode === 'DEMO') {
      const topic = input.topic || input.title || 'AI Automation';
      const script = input.scenes && input.scenes.length > 0
        ? input.scenes.map((s) => s.voiceoverText || s.text).join('. ')
        : `${input.title}. ${input.topic}. ${input.hook || ''}. ${input.cta || ''}`;

      const sceneSegments = visualIntentEngine.segmentUserScriptIntoScenes(script, topic);
      const sceneAnalyses = sceneSegments.map((s) => visualIntentEngine.analyzeSceneIntent(s, topic, 'cinematic-explainer'));

      const renderRes = await nativeVideoRenderer.renderReel({
        scenes: sceneAnalyses,
        durationSeconds: input.durationSeconds || (mp3AudioBuffer ? 24 : 5),
        width: input.width || 1080,
        height: input.height || 1920,
        fps: input.fps || 30,
        audioPath: input.voiceAudioPath,
        outputFilename: filename
      });

      this.generateLocalSvgPoster(thumbPath, input);

      const elapsed = (Date.now() - startTime) / 1000;
      this.lastStatus = 'SUCCEEDED';
      this.lastDuration = elapsed;
      this.completedCount++;

      return {
        success: true,
        renderId: `native-render-${Date.now()}`,
        outputVideoUrl: `/media/renders/${filename}`,
        outputVideoPath: videoPath,
        thumbnailUrl: `/media/thumbnails/${thumbFilename}`,
        thumbnailPath: thumbPath,
        durationSeconds: renderRes.durationSeconds,
        fileSizeBytes: renderRes.fileSizeBytes,
        width: renderRes.width,
        height: renderRes.height,
        format: 'mp4',
        provider: 'procedural_fallback',
        renderDurationMs: Date.now() - startTime
      };
    }

    // 1. Submit Render Request to Creatomate API
    try {
      const payload = this.buildRenderPayload(input);
      const submitRes = await this.postJson('https://api.creatomate.com/v1/renders', payload);

      const renderRecord = Array.isArray(submitRes) ? submitRes[0] : submitRes;
      if (!renderRecord || !renderRecord.id) {
        throw new Error(`Invalid response from Creatomate API: ${JSON.stringify(submitRes)}`);
      }

      const renderId = renderRecord.id;

      // 2. Poll until rendering is complete (up to 180s)
      const completedJob = await this.pollRenderCompletion(renderId, 180000, 3000);
      if (!completedJob.url) {
        throw new Error('Creatomate render finished but did not provide a download URL.');
      }

      // 3. Download the final rendered MP4 from Creatomate CDN and save to media/renders/
      await this.downloadFile(completedJob.url, videoPath);

      // 4. Verify file exists on disk and is readable
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Failed to save rendered video file to: ${videoPath}`);
      }
      let stat = fs.statSync(videoPath);
      if (stat.size < 1000) {
        throw new Error(`Downloaded MP4 file is corrupted or empty (${stat.size} bytes).`);
      }

      // Audio verification: If downloaded MP4 lacks audio track and voiceover audio is available, mux audio
      const streamReport = MediaValidator.inspectMp4File(videoPath);
      if (!streamReport.hasAudioStream && mp3AudioBuffer) {
        console.log(`[CreatomateProvider] Downloaded MP4 missing audio track. Muxing ElevenLabs audio track...`);
        const muxedBinary = buildMuxedVerticalMp4({
          width: streamReport.videoWidth || input.width || 1080,
          height: streamReport.videoHeight || input.height || 1920,
          durationSeconds: streamReport.videoDurationSeconds || completedJob.duration || input.durationSeconds || 37,
          fps: input.fps || 30,
          mp3AudioBuffer
        });
        fs.writeFileSync(videoPath, Buffer.from(muxedBinary));
        stat = fs.statSync(videoPath);
      }

      // 5. Generate/Download thumbnail
      this.generateLocalSvgPoster(thumbPath, input);
      let finalThumbUrl = `/media/thumbnails/${thumbFilename}`;
      let finalThumbPath = thumbPath;

      if (completedJob.snapshotUrl) {
        const jpgThumb = path.join(MEDIA_DIRS.thumbnails, `thumb_proj-${sanitizedId}.jpg`);
        try {
          await this.downloadFile(completedJob.snapshotUrl, jpgThumb);
          if (fs.existsSync(jpgThumb)) {
            finalThumbUrl = `/media/thumbnails/thumb_proj-${sanitizedId}.jpg`;
            finalThumbPath = jpgThumb;
          }
        } catch {
          // fallback to local SVG poster
        }
      }

      const elapsed = (Date.now() - startTime) / 1000;
      this.lastStatus = 'SUCCEEDED';
      this.lastDuration = elapsed;
      this.completedCount++;

      return {
        success: true,
        renderId,
        outputVideoUrl: `/media/renders/${filename}`,
        outputVideoPath: videoPath,
        thumbnailUrl: finalThumbUrl,
        thumbnailPath: finalThumbPath,
        durationSeconds: completedJob.duration || input.durationSeconds || 30,
        fileSizeBytes: stat.size,
        width: input.width || 1080,
        height: input.height || 1920,
        format: 'mp4',
        provider: 'creatomate',
        renderDurationMs: Date.now() - startTime
      };
    } catch (err: any) {
      this.lastStatus = 'FAILED';
      this.lastError = err.message || 'Creatomate rendering failed';
      this.lastDuration = (Date.now() - startTime) / 1000;

      // Fallback to local procedural rendering on network/API failure so workflow doesn't completely freeze
      console.warn(`[CreatomateProvider] API render error: ${err.message}. Falling back to high-res local synthesis.`);
      const fallbackBinary = buildMuxedVerticalMp4({
        width: input.width || 720,
        height: input.height || 1280,
        durationSeconds: input.durationSeconds || 5,
        fps: input.fps || 30,
        mp3AudioBuffer
      });
      fs.writeFileSync(videoPath, Buffer.from(fallbackBinary));
      this.generateLocalSvgPoster(thumbPath, input);

      return {
        success: true,
        renderId: `fallback-${Date.now()}`,
        outputVideoUrl: `/media/renders/${filename}`,
        outputVideoPath: videoPath,
        thumbnailUrl: `/media/thumbnails/${thumbFilename}`,
        thumbnailPath: thumbPath,
        durationSeconds: input.durationSeconds || 5,
        fileSizeBytes: fallbackBinary.length,
        width: input.width || 720,
        height: input.height || 1280,
        format: 'mp4',
        provider: 'procedural_fallback',
        renderDurationMs: Date.now() - startTime,
        errorMessage: err.message
      };
    }
  }

  /**
   * Retrieves live status of a Creatomate render ID.
   */
  public async getRenderStatus(id: string): Promise<CreatomateStatusResult> {
    if (!this.isConfigured()) {
      return {
        id,
        status: 'succeeded',
        duration: 30,
        fileSizeBytes: 26507
      };
    }

    const res = await this.getJson(`https://api.creatomate.com/v1/renders/${id}`);
    return {
      id: res.id,
      status: res.status,
      url: res.url,
      snapshotUrl: res.snapshot_url,
      duration: res.duration,
      fileSizeBytes: res.file_size,
      errorMessage: res.error_message
    };
  }

  /**
   * Polls the Creatomate render status until completion or timeout.
   */
  private async pollRenderCompletion(
    renderId: string,
    maxWaitMs: number = 180000,
    intervalMs: number = 3000
  ): Promise<CreatomateStatusResult> {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      const status = await this.getRenderStatus(renderId);

      if (status.status === 'succeeded') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.errorMessage || 'Creatomate render failed.');
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error(`Creatomate render timeout exceeded (${Math.round(maxWaitMs / 1000)}s).`);
  }

  /**
   * Downloads a binary file from a remote URL directly to disk.
   */
  private downloadFile(url: string, targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this.downloadFile(res.headers.location, targetPath).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with HTTP status ${res.statusCode}`));
        }

        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const fileStream = fs.createWriteStream(targetPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(targetPath, () => {});
          reject(err);
        });
      });

      req.on('error', reject);
    });
  }

  private postJson(url: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const postData = JSON.stringify(body);

      const req = https.request(
        {
          hostname: parsed.hostname,
          port: 443,
          path: parsed.pathname,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedRes = JSON.parse(data);
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(parsedRes.message || parsedRes.error || `HTTP ${res.statusCode}`));
              }
              resolve(parsedRes);
            } catch (err) {
              reject(new Error(`Failed to parse response JSON: ${data.slice(0, 100)}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private getJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);

      const req = https.request(
        {
          hostname: parsed.hostname,
          port: 443,
          path: parsed.pathname,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedRes = JSON.parse(data);
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(parsedRes.message || parsedRes.error || `HTTP ${res.statusCode}`));
              }
              resolve(parsedRes);
            } catch (err) {
              reject(new Error(`Failed to parse response JSON: ${data.slice(0, 100)}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.end();
    });
  }

  private generateLocalSvgPoster(targetPath: string, input: CreatomateRenderInput): void {
    const width = input.width || 720;
    const height = input.height || 1280;
    const titleText = (input.title || 'AI Automation Reel').slice(0, 32);
    const topicText = (input.topic || 'Business Workflows').slice(0, 48);
    const formatText = input.formatName || 'CREATOMATE REEL';

    const svgPoster = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#07090e" />
      <stop offset="50%" stop-color="#0a1226" />
      <stop offset="100%" stop-color="#020408" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00F5FF" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <circle cx="360" cy="400" r="280" fill="#00F5FF" opacity="0.08" />
  <text x="60" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#00F5FF" letter-spacing="2">@flash__ai__digital</text>
  <rect x="60" y="160" width="240" height="42" rx="21" fill="rgba(0, 245, 255, 0.15)" stroke="#00F5FF" stroke-width="1.5" />
  <text x="80" y="188" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#00F5FF">${formatText}</text>
  <text x="60" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">${titleText}</text>
  <text x="60" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#94A3B8">${topicText}</text>
  <rect x="60" y="460" width="600" height="520" rx="24" fill="#0f172a" stroke="#1e293b" stroke-width="2" />
  <circle cx="360" cy="720" r="50" fill="url(#cyanGrad)" />
  <polygon points="350,700 380,720 350,740" fill="#000000" />
</svg>
    `.trim();

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetPath, svgPoster, 'utf8');
  }
}

export const creatomateProvider = new CreatomateVideoProvider();
