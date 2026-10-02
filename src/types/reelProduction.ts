/**
 * FLASH.Ai Reel Production Pipeline Types (Phase 2)
 * 
 * Defines models for:
 * - Production Templates (7 required creator templates)
 * - Scene Builder (duration, media, text, position, animation, transition, audio)
 * - Timeline & Asset Ingestion (screen recordings, demo footage, screenshots)
 * - Auto-Editing & Pacing
 * - Text Overlays & Mobile Safe Area (9:16)
 * - Captions & Subtitle Cues
 * - Audio Layer (music, voiceover, SFX, ducking)
 * - Export Pipeline & Quality Control (10 QC gates)
 */

import type { ReelFormatId, ReelStructureBlock } from '../services/reelFormatEngine.ts';

export type ReelTemplateId =
  | 'product-demo'
  | 'tool-showcase'
  | 'news-update'
  | 'ai-update'
  | 'explainer'
  | 'how-to'
  | 'listicle'
  | 'comparison'
  | 'before-after'
  | 'automation-workflow'
  | 'data-insight'
  | 'cinematic-explainer'
  // Backwards compatibility aliases
  | 'ai-tool-demo'
  | 'case-study'
  | 'product-showcase'
  | 'trending-news'
  | 'how-to-tutorial'
  | 'list-top-5'
  | 'story-problem-solution'
  | 'build-showcase'
  | 'website-reveal'
  | 'tutorial';

export type TemplateCategory =
  | 'Demo'
  | 'Showcase'
  | 'News'
  | 'Update'
  | 'Explainer'
  | 'Education'
  | 'List'
  | 'Comparison'
  | 'Workflow'
  | 'Data'
  | 'CaseStudy'
  | 'Story';

export interface TemplateThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  badgeBg: string;
}

export interface ProductionQualityScores {
  visualMatchScore: number; // >= 85
  formatFitScore: number; // >= 85
  editingScore: number; // >= 85
  overallScore: number; // >= 88
}

export interface TemplateSelectionInfo {
  templateId: ReelTemplateId;
  templateName: string;
  category: string;
  confidence: number; // 0.0 - 1.0
  reason: string;
  matchedKeywords: string[];
  visualHighlights: string[];
  sceneStructure: string[];
  selectedAt: string;
}

export interface ReelTemplateDefinition {
  id: ReelTemplateId;
  name: string;
  description: string;
  category: TemplateCategory;
  visualLayoutType:
    | 'product_demo_ui'
    | 'tool_showcase_hero'
    | 'news_update_ticker'
    | 'ai_update_canvas'
    | 'explainer_cards'
    | 'how_to_steps'
    | 'listicle_numbered'
    | 'comparison_split'
    | 'before_after_slider'
    | 'workflow_nodes'
    | 'data_insight_charts'
    | 'cinematic_narrative'
    // Aliases
    | 'ui_zoom_callout'
    | 'case_study_roi'
    | 'hero_showcase'
    | 'breaking_news'
    | 'step_progression'
    | 'numbered_list'
    | 'split_screen_comparison'
    | 'narrative_arc'
    | 'kinetic_explainer';
  themeColors: TemplateThemeColors;
  sampleHook: string;
  keyHighlights: string[];
  defaultPacing: {
    hookDuration: number;
    problemDuration: number;
    demoDuration: number;
    resultDuration: number;
    ctaDuration: number;
  };
  visualSourceSequence: SceneMediaType[];
  recommendedTransitions: SceneTransitionType[];
  soundEffects: SoundEffectType[];
  layoutPreset: {
    safeAreaTopPercent: number; // 15%
    safeAreaBottomPercent: number; // 20%
    safeAreaRightPercent: number; // 15%
    captionYPercent: number; // 72%
    ctaButtonColor: string;
  };
}

export type SceneMediaType =
  | 'video_clip'
  | 'image'
  | 'screenshot'
  | 'website_demo'
  | 'text_scene'
  | 'screen_recording'
  | 'visual_placeholder';

export type SceneAnimationType =
  | 'zoom_in'
  | 'slide_left'
  | 'slide_right'
  | 'ken_burns'
  | 'pop'
  | 'pulse'
  | 'pan_up'
  | 'none';

export type SceneTransitionType =
  | 'cut'
  | 'zoom_in'
  | 'slide_left'
  | 'slide_right'
  | 'fade'
  | 'pop'
  | 'wipe'
  | 'pulse';

export type SoundEffectType =
  | 'whoosh'
  | 'pop'
  | 'click'
  | 'chime'
  | 'none';

export type TextOverlayType =
  | 'hook'
  | 'feature_callout'
  | 'scene_label'
  | 'cta'
  | 'subtitle';

export interface SceneMedia {
  type: SceneMediaType;
  url: string;
  thumbnailUrl?: string;
  label?: string;
  fit: 'cover' | 'contain' | 'fill';
  scale: number; // 1.0 to 1.5 for zoom/pan
  positionX: number; // percentage (0 - 100)
  positionY: number; // percentage (0 - 100)
  trimStartSeconds?: number;
  trimEndSeconds?: number;
}

export interface SceneTextOverlay {
  id: string;
  text: string;
  type: TextOverlayType;
  position: {
    xPercent: number; // 0 - 100
    yPercent: number; // 0 - 100
  };
  fontSize: number; // px at 1080p scale
  fontWeight: 'normal' | 'bold' | 'black';
  textColor: string;
  bgColor?: string;
  highlightColor?: string;
  animation: 'pop' | 'typewriter' | 'slide_up' | 'glow' | 'fade' | 'none';
  safeAreaChecked: boolean;
}

export interface SceneTransition {
  type: SceneTransitionType;
  durationSeconds: number;
}

export interface SceneAudioSettings {
  voiceoverText: string;
  voiceoverAudioUrl?: string;
  sfxType: SoundEffectType;
  sfxVolume: number; // 0.0 to 1.0
  musicDuckLevel: number; // 0.0 (silent) to 1.0 (no ducking), default 0.15
}

export interface SceneBackground {
  type: 'color' | 'gradient' | 'blur_media';
  value: string;
}

export interface ProductionTimelineScene {
  id: string;
  sceneNumber: number;
  block: ReelStructureBlock;
  durationSeconds: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  media: SceneMedia;
  textOverlays: SceneTextOverlay[];
  animation: SceneAnimationType;
  transition: SceneTransition;
  audioSettings: SceneAudioSettings;
  background: SceneBackground;
  visualInstruction: string;
}

export interface CaptionCue {
  id: string;
  sceneId: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  text: string;
  highlightWords?: string[];
}

export interface CaptionTrack {
  enabled: boolean;
  cues: CaptionCue[];
  positionYPercent: number; // safe zone: 68 - 75%
  style: {
    fontSize: number;
    fontColor: string;
    highlightColor: string;
    bgBox: boolean;
    bgBoxColor: string;
    uppercase: boolean;
  };
}

export interface AudioTrackConfig {
  music: {
    enabled: boolean;
    trackId: string;
    trackName: string;
    trackUrl: string;
    volume: number; // 0.0 - 1.0
    fadeInSeconds: number;
    fadeOutSeconds: number;
    duckingEnabled: boolean;
  };
  voiceover: {
    enabled: boolean;
    provider: 'demo' | 'webspeech' | 'elevenlabs' | 'google';
    voiceId: string;
    volume: number;
    speed: number;
  };
  soundEffects: Array<{
    id: string;
    sceneNumber: number;
    timeSeconds: number;
    sfx: SoundEffectType;
    volume: number;
  }>;
}

export interface ReelExportSettings {
  aspectRatio: '9:16';
  resolution: {
    width: number;
    height: number;
  }; // 1080x1920 or 720x1280
  fps: 30 | 60;
  format: 'mp4' | 'webm';
  quality: 'draft' | 'balanced' | 'high';
  includeAudio: boolean;
}

export type ExportJobStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'ASSEMBLING'
  | 'AUDIO_MIXING'
  | 'ENCODING'
  | 'COMPLETED'
  | 'FAILED';

export interface ExportJob {
  id: string;
  projectId: string;
  status: ExportJobStatus;
  progress: number; // 0 - 100
  currentStep: string;
  outputVideoUrl?: string;
  thumbnailUrl?: string;
  fileSizeBytes?: number;
  durationSeconds: number;
  format: 'mp4' | 'webm';
  resolution: string;
  fps: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Phase2QCCheck {
  id: string;
  name: string;
  passed: boolean;
  fatal: boolean;
  message: string;
  suggestion?: string;
}

export interface Phase2QCReport {
  passed: boolean;
  fatalCount: number;
  warningsCount: number;
  checks: Phase2QCCheck[];
  checkedAt: string;
}

export interface ReelProductionProject {
  id: string;
  title: string;
  topic: string;
  formatId: ReelFormatId;
  templateId: ReelTemplateId;
  templateSelection?: TemplateSelectionInfo;
  pillarId: string;
  targetAudience: string;
  aspectRatio: '9:16';
  exportSettings: ReelExportSettings;
  scenes: ProductionTimelineScene[];
  totalDurationSeconds: number;
  captions: CaptionTrack;
  audio: AudioTrackConfig;
  branding: {
    watermarkEnabled: boolean;
    watermarkText: string;
    watermarkPosition: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right';
    logoUrl?: string;
    brandHandle: string;
  };
  qcReport: Phase2QCReport;
  qualityScores?: ProductionQualityScores;
  generationTimeSeconds?: number;
  contentSourceMode?: 'DAILY_DISCOVERY' | 'USER_SCRIPT';
  rawUserScript?: string;
  exportStatus?: ExportJob;
  mode: 'DEMO' | 'LIVE';
  createdAt: string;
  updatedAt: string;
}

export interface RawMediaAsset {
  id: string;
  name: string;
  type: SceneMediaType;
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  dimensions?: { width: number; height: number };
  fileSizeBytes?: number;
  tags: string[];
  createdAt: string;
}
