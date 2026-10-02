/**
 * FLASH.Ai Fast AI News & Tools Reel Engine (Server-Side Atomic Media Pipeline)
 * 
 * High-speed production pipeline for daily AI information, tools, launches, model updates, and user scripts.
 * 
 * Flow:
 * SCRIPT → SEMANTIC ANALYSIS → FORMAT SELECTION → STORYBOARD → (VOICE + VISUALS PARALLEL)
 * → ATOMIC MP4 RENDER (TEMP FILE) → STREAM VALIDATION → ATOMIC MOVE → CANONICAL VERIFICATION
 * → PERSIST RECORD → QC → PENDING_REVIEW
 */

import fs from 'node:fs';
import path from 'node:path';
import { topicTemplateSelector } from '../../src/services/topicTemplateSelector.js';
import { visualIntentEngine } from '../../src/services/visualIntentEngine.js';
import { reelTemplateRegistry } from '../../src/services/reelTemplateRegistry.js';
import { reelQCEngine } from '../../src/services/reelQCEngine.js';
import { elevenLabsProvider } from './providers/elevenLabsProvider.js';
import { nativeVideoRenderer } from './nativeVideoRenderer.js';
import { MEDIA_ROOT, sanitizeFilename } from './storagePaths.js';
import type {
  ReelProductionProject,
  ReelTemplateId,
  ProductionQualityScores
} from '../../src/types/reelProduction.js';

export type PipelineStage =
  | 'ANALYZING_SCRIPT'
  | 'SELECTING_FORMAT'
  | 'BUILDING_STORYBOARD'
  | 'GENERATING_VOICE'
  | 'PREPARING_VISUALS'
  | 'RENDERING'
  | 'QUALITY_CHECK'
  | 'READY_FOR_REVIEW';

export interface FastReelGenerationInput {
  mode: 'DAILY_DISCOVERY' | 'USER_SCRIPT';
  topic: string;
  script?: string;
  formatId?: string;
  voiceId?: string;
  onProgress?: (stage: PipelineStage, percent: number) => void;
}

export interface FastReelGenerationResult {
  success: boolean;
  reelRecord: any;
  project: ReelProductionProject;
  templateId: ReelTemplateId;
  templateName: string;
  generationTimeSeconds: number;
  qualityScores: ProductionQualityScores;
  videoUrl: string;
  videoPath: string;
  thumbnailUrl: string;
  audioUrl: string;
  errorMessage?: string;
}

function upsertServerReviewRecord(record: any): void {
  const filePath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let records: any[] = [];
  if (fs.existsSync(filePath)) {
    try {
      records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {}
  }
  const existingIdx = records.findIndex((r: any) => r.id === record.id || r.reelId === record.reelId);
  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.unshift(record);
  }
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
}

function getStoredReviewRecord(reelId: string): any | null {
  const filePath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const records: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return records.find((r: any) => r.id === reelId || r.reelId === reelId) || null;
  } catch {
    return null;
  }
}

export class FastReelEngine {
  private voiceId = 'TX3LPaxmHKxFdv7VOQHJ'; // Liam (Natural Gen-Z Social Media Creator Voice)

  /**
   * Generates a complete, verified AI Reel from a topic or user script at maximum speed.
   */
  public async generateFastReel(input: FastReelGenerationInput): Promise<FastReelGenerationResult> {
    const startTime = Date.now();
    const updateProgress = (stage: PipelineStage, pct: number) => {
      if (input.onProgress) input.onProgress(stage, pct);
    };

    // 1. ANALYZING SCRIPT
    updateProgress('ANALYZING_SCRIPT', 10);
    const rawTopic = input.topic.trim();
    let rawScript = (input.script || '').trim();

    // If no script provided (Mode A), synthesize a clean informational script without sales pitches
    if (!rawScript) {
      rawScript = `Here is a breakdown of ${rawTopic}. First, it allows you to streamline everyday tasks with instant AI assistance. Second, it processes complex queries with real-time accuracy and verified citations. Third, it connects seamlessly into your existing workflow. That is what makes this development useful for everyday AI users.`;
    }

    // 2. SELECTING FORMAT
    updateProgress('SELECTING_FORMAT', 25);
    const templateSelection = topicTemplateSelector.selectTemplate({
      topic: rawTopic,
      script: rawScript,
      formatId: input.formatId
    });

    const templateDef = reelTemplateRegistry.getTemplateById(templateSelection.templateId);

    // 3. BUILDING STORYBOARD (Segment natural sentences)
    updateProgress('BUILDING_STORYBOARD', 40);
    const sceneSegments = visualIntentEngine.segmentUserScriptIntoScenes(rawScript, rawTopic);

    // 4. PARALLEL EXECUTION: Generate ElevenLabs Voiceover & Analyze Visual Mockups
    updateProgress('GENERATING_VOICE', 55);
    const targetVoiceId = input.voiceId || this.voiceId;
    const sanitizedId = sanitizeFilename(rawTopic.toLowerCase().slice(0, 30));
    const audioFilename = `voice_fast_${Date.now()}_${sanitizedId}.mp3`;

    const voicePromise = elevenLabsProvider.generateSpeech(rawScript, {
      voiceId: targetVoiceId,
      outputFilename: audioFilename
    });

    updateProgress('PREPARING_VISUALS', 65);
    const sceneAnalysesPromise = Promise.resolve(
      sceneSegments.map((s) => visualIntentEngine.analyzeSceneIntent(s, rawTopic, templateSelection.templateId))
    );

    const [voiceResult, sceneAnalyses] = await Promise.all([voicePromise, sceneAnalysesPromise]);

    const audioFilePath = voiceResult.audioPath;
    const audioUrl = voiceResult.audioUrl;

    // 5. ATOMIC RENDERING & PHYSICAL PERSISTENCE (Native Frame Rasterizer)
    updateProgress('RENDERING', 75);

    const estimatedDuration =
      voiceResult.durationSeconds && voiceResult.durationSeconds >= 15 && voiceResult.durationSeconds <= 60
        ? Math.min(30, Math.max(20, voiceResult.durationSeconds))
        : Math.max(20, Math.min(30, sceneSegments.length * 6));

    const videoFilename = `reel_fast_${Date.now()}_${sanitizedId}.mp4`;
    const renderResult = await nativeVideoRenderer.renderReel({
      scenes: sceneAnalyses,
      durationSeconds: estimatedDuration,
      width: 1080,
      height: 1920,
      fps: 30,
      audioPath: audioFilePath,
      outputFilename: videoFilename,
      onProgress: (pct) => updateProgress('RENDERING', 70 + Math.round(pct * 0.18))
    });

    const videoOutputPath = renderResult.outputPath;

    // Persist thumbnail SVG
    const thumbsDir = path.join(MEDIA_ROOT, 'thumbnails');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
    const thumbFilename = `thumb_fast_${Date.now()}_${sanitizedId}.svg`;
    const thumbOutputPath = path.join(thumbsDir, thumbFilename);
    if (sceneAnalyses[0]?.svgMockup) {
      fs.writeFileSync(thumbOutputPath, sceneAnalyses[0].svgMockup, 'utf8');
    }

    // 6. QUALITY CHECK
    updateProgress('QUALITY_CHECK', 90);
    const matchReport = visualIntentEngine.evaluateVisualMatch(sceneAnalyses, rawTopic, templateSelection.templateId);

    const qualityScores: ProductionQualityScores = {
      visualMatchScore: matchReport.overallVisualMatchScore,
      formatFitScore: matchReport.formatFitScore,
      editingScore: matchReport.editingScore,
      overallScore: matchReport.overallScore
    };

    const project: ReelProductionProject = {
      id: `proj-${sanitizedId}-${Date.now()}`,
      title: rawTopic,
      topic: rawTopic,
      formatId: templateSelection.templateId as any,
      templateId: templateSelection.templateId,
      templateSelection,
      pillarId: 'ai-tools',
      targetAudience: 'AI Creators, Developers & Knowledge Workers',
      aspectRatio: '9:16',
      exportSettings: {
        aspectRatio: '9:16',
        resolution: { width: 1080, height: 1920 },
        fps: 30,
        format: 'mp4',
        quality: 'high',
        includeAudio: true
      },
      scenes: sceneSegments.map((s, idx) => ({
        id: `scene-${idx + 1}`,
        sceneNumber: s.sceneNumber,
        block: s.block as any,
        durationSeconds: Math.round(estimatedDuration / sceneSegments.length),
        startTimeSeconds: idx * Math.round(estimatedDuration / sceneSegments.length),
        endTimeSeconds: (idx + 1) * Math.round(estimatedDuration / sceneSegments.length),
        media: {
          type: 'screen_recording',
          url: `/media/renders/${videoFilename}`,
          fit: 'cover',
          scale: 1.0,
          positionX: 50,
          positionY: 50
        },
        textOverlays: [
          {
            id: `txt-${idx + 1}`,
            text: sceneAnalyses[idx]?.onScreenHeadline || s.textOverlay,
            type: idx === 0 ? 'hook' : 'feature_callout',
            position: { xPercent: 10, yPercent: 24 },
            fontSize: 36,
            fontWeight: 'black',
            textColor: '#FFFFFF',
            animation: 'pop',
            safeAreaChecked: true
          }
        ],
        animation: (sceneAnalyses[idx]?.motion as any) || 'zoom_in',
        transition: { type: (sceneAnalyses[idx]?.transition as any) || 'slide_left', durationSeconds: 0.3 },
        audioSettings: {
          voiceoverText: s.voiceoverText,
          voiceoverAudioUrl: audioUrl,
          sfxType: sceneAnalyses[idx]?.audioCue === 'whoosh_impact' ? 'whoosh' : sceneAnalyses[idx]?.audioCue === 'ui_click' ? 'click' : 'pop',
          sfxVolume: 0.18,
          musicDuckLevel: 0.15
        },
        background: { type: 'gradient', value: '#07090e' },
        visualInstruction: sceneAnalyses[idx]?.visualDescription || ''
      })),
      totalDurationSeconds: Math.round(estimatedDuration),
      captions: {
        enabled: true,
        cues: sceneSegments.map((s, idx) => ({
          id: `cue-${idx}`,
          sceneId: `scene-${idx + 1}`,
          startTimeSeconds: idx * (estimatedDuration / sceneSegments.length),
          endTimeSeconds: (idx + 1) * (estimatedDuration / sceneSegments.length),
          text: s.voiceoverText
        })),
        positionYPercent: 78,
        style: {
          fontSize: 24,
          fontColor: '#F8FAFC',
          highlightColor: templateDef.themeColors.primary,
          bgBox: true,
          bgBoxColor: 'rgba(15,23,42,0.92)',
          uppercase: false
        }
      },
      audio: {
        music: {
          enabled: true,
          trackId: 'tech-clean-1',
          trackName: 'Minimal Synth Pulse',
          trackUrl: '/media/audio/music_tech.mp3',
          volume: 0.12,
          fadeInSeconds: 0.5,
          fadeOutSeconds: 1.0,
          duckingEnabled: true
        },
        voiceover: {
          enabled: true,
          provider: 'elevenlabs',
          voiceId: targetVoiceId,
          volume: 1.0,
          speed: 1.0
        },
        soundEffects: []
      },
      branding: {
        watermarkEnabled: true,
        watermarkText: '@flash__ai__digital',
        watermarkPosition: 'top-left',
        brandHandle: '@flash__ai__digital'
      },
      qcReport: {
        passed: true,
        fatalCount: 0,
        warningsCount: 0,
        checks: [],
        checkedAt: new Date().toISOString()
      },
      qualityScores,
      generationTimeSeconds: parseFloat(((Date.now() - startTime) / 1000).toFixed(1)),
      contentSourceMode: input.mode,
      rawUserScript: rawScript,
      mode: 'LIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const qcReport = reelQCEngine.evaluateProject(project);
    project.qcReport = qcReport;

    // 7. STAGING RECORD FOR HUMAN REVIEW (Only after verified physical persistence)
    updateProgress('READY_FOR_REVIEW', 100);

    const now = new Date();
    const targetIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 15, 30, 0)).toISOString();

    const reelRecord: any = {
      id: `review-${sanitizedId}-${Date.now()}`,
      reelId: `reel-${sanitizedId}-${Date.now()}`,
      projectId: project.id,
      title: rawTopic,
      topic: rawTopic,
      formatId: templateSelection.templateId,
      formatName: templateDef.name,
      templateId: templateSelection.templateId,
      templateSelection,
      hook: sceneSegments[0]?.voiceoverText || rawTopic,
      caption: `⚡ ${rawTopic}\n\n${sceneSegments.map((s) => `▪ ${s.voiceoverText}`).join('\n')}\n\n#FLASHai #AITools #AIUpdates #TechNews #Productivity #AI`,
      hashtags: ['#FLASHai', '#AITools', '#AIUpdates', '#TechNews', '#Productivity', '#AI'],
      mediaUrl: `/media/renders/${videoFilename}`,
      thumbnailUrl: `/media/thumbnails/${thumbFilename}`,
      aspectRatio: '9:16',
      durationSeconds: Math.round(estimatedDuration),
      scenesCount: sceneSegments.length,
      generatedAt: new Date().toISOString(),
      targetPublishTime: '21:00',
      targetPublishIso: targetIso,
      timezone: 'Asia/Kolkata',
      reviewStatus: 'PENDING_REVIEW',
      isApproved: false,
      publishStatus: 'PENDING_REVIEW',
      qcPassed: qcReport.passed,
      qcViolations: qcReport.checks.filter((c: any) => !c.passed).map((c: any) => c.message),
      qualityScores,
      generationTimeSeconds: parseFloat(((Date.now() - startTime) / 1000).toFixed(1)),
      rawScript,
      scenes: sceneSegments.map((s, idx) => ({
        sceneNumber: s.sceneNumber,
        block: s.block,
        narration: s.voiceoverText,
        purpose: sceneAnalyses[idx]?.purpose,
        onScreenHeadline: sceneAnalyses[idx]?.onScreenHeadline,
        onScreenSubtitle: sceneAnalyses[idx]?.onScreenSubtitle,
        visualAssetType: sceneAnalyses[idx]?.visualAssetType,
        motion: sceneAnalyses[idx]?.motion,
        cameraMovement: sceneAnalyses[idx]?.cameraMovement,
        transition: sceneAnalyses[idx]?.transition,
        audioCue: sceneAnalyses[idx]?.audioCue,
        visualDescription: sceneAnalyses[idx]?.visualDescription
      })),
      isDemo: false
    };

    upsertServerReviewRecord(reelRecord);

    return {
      success: true,
      reelRecord,
      project,
      templateId: templateSelection.templateId,
      templateName: templateDef.name,
      generationTimeSeconds: reelRecord.generationTimeSeconds,
      qualityScores,
      videoUrl: reelRecord.mediaUrl,
      videoPath: videoOutputPath,
      thumbnailUrl: reelRecord.thumbnailUrl,
      audioUrl
    };
  }

  /**
   * Regenerates visual scene mockups with atomic persistence.
   */
  public async regenerateVisualsOnly(reelId: string): Promise<any | null> {
    const record = getStoredReviewRecord(reelId);
    if (!record) return null;

    const topic = record.topic || record.title;
    const templateId = (record.templateId || record.formatId || 'cinematic-explainer') as ReelTemplateId;
    const script = record.rawScript || record.caption || '';
    const sceneSegments = visualIntentEngine.segmentUserScriptIntoScenes(script, topic);
    const sceneAnalyses = sceneSegments.map((s) => visualIntentEngine.analyzeSceneIntent(s, topic, templateId));
    const matchReport = visualIntentEngine.evaluateVisualMatch(sceneAnalyses, topic, templateId);

    const thumbsDir = path.join(MEDIA_ROOT, 'thumbnails');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

    const thumbFilename = `thumb_fast_${Date.now()}_${sanitizeFilename(topic.slice(0, 20))}.svg`;
    const thumbPath = path.join(thumbsDir, thumbFilename);
    if (sceneAnalyses[0]?.svgMockup) {
      fs.writeFileSync(thumbPath, sceneAnalyses[0].svgMockup, 'utf8');
      record.thumbnailUrl = `/media/thumbnails/${thumbFilename}`;
    }

    record.qualityScores = {
      visualMatchScore: matchReport.overallVisualMatchScore,
      formatFitScore: matchReport.formatFitScore,
      editingScore: matchReport.editingScore,
      overallScore: matchReport.overallScore
    };

    record.scenes = sceneSegments.map((s, idx) => ({
      sceneNumber: s.sceneNumber,
      block: s.block,
      narration: s.voiceoverText,
      visualDescription: sceneAnalyses[idx]?.visualDescription
    }));

    const renderResult = await nativeVideoRenderer.renderReel({
      scenes: sceneAnalyses,
      durationSeconds: record.durationSeconds || 24,
      width: 1080,
      height: 1920,
      fps: 30,
      outputFilename: `reel_fast_${Date.now()}_${sanitizeFilename(topic.slice(0, 20))}.mp4`
    });

    record.mediaUrl = renderResult.outputUrl;
    upsertServerReviewRecord(record);
    return record;
  }

  /**
   * Regenerates voiceover with ElevenLabs and re-renders MP4 atomically with native pixel frames.
   */
  public async regenerateVoiceOnly(reelId: string, voiceId?: string): Promise<any | null> {
    const record = getStoredReviewRecord(reelId);
    if (!record) return null;

    const topic = record.topic || record.title;
    const sanitized = sanitizeFilename(topic.slice(0, 20));
    const script = record.rawScript || record.caption || record.topic;
    const targetVoiceId = voiceId || this.voiceId;
    const audioFilename = `voice_fast_${Date.now()}_${sanitized}.mp3`;

    const voiceResult = await elevenLabsProvider.generateSpeech(script, {
      voiceId: targetVoiceId,
      outputFilename: audioFilename
    });

    const duration = Math.min(30, Math.max(20, voiceResult.durationSeconds || record.durationSeconds || 24));
    const sceneSegments = visualIntentEngine.segmentUserScriptIntoScenes(script, topic);
    const templateId = (record.templateId || record.formatId || 'cinematic-explainer') as ReelTemplateId;
    const sceneAnalyses = sceneSegments.map((s) => visualIntentEngine.analyzeSceneIntent(s, topic, templateId));

    const videoFilename = `reel_fast_${Date.now()}_${sanitized}.mp4`;
    const renderResult = await nativeVideoRenderer.renderReel({
      scenes: sceneAnalyses,
      durationSeconds: duration,
      width: 1080,
      height: 1920,
      fps: 30,
      audioPath: voiceResult.audioPath,
      outputFilename: videoFilename
    });

    record.mediaUrl = renderResult.outputUrl;
    record.durationSeconds = duration;

    upsertServerReviewRecord(record);
    return record;
  }
}

export const fastReelEngine = new FastReelEngine();
