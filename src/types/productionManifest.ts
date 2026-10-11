/**
 * FLASH.Ai Production Manifest & Single Source of Truth
 * 
 * Guarantees 100% traceability across:
 * Content Source -> Verified Script -> Production Manifest -> ElevenLabs Voiceover -> Native Visuals -> Video Streams
 */

import type { VerifiedClaim } from '../services/sourceVerificationService.js';
import type { ProductionQualityScores, ReelTemplateId } from './reelProduction.js';

export interface ProductionSceneManifest {
  scene_id: string;
  narration: string;
  visual_goal: string;
  entities: string[];
  actions: string[];
  visible_text: string;
  animation: string;
  duration: number;
  transition: string;
  caption_segments: string[];
}

export interface ProductionManifest {
  reelId: string;
  projectId: string;
  topic: string;
  sourceType: 'USER_SCRIPT' | 'GENERATED_TOPIC_SCRIPT';
  originalUserScript?: string;
  verifiedClaims: VerifiedClaim[];
  generatedScript?: string;
  finalScript: string;
  scriptHash: string;
  wordCount: number;
  expectedDurationSeconds: number;
  scenes: ProductionSceneManifest[];
  templateId: ReelTemplateId | string;
  templateName: string;
  voiceId: string;
  voiceText: string;
  voiceHash: string;
  audioPath: string;
  audioUrl: string;
  mediaPath?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  captions: Array<{
    startTimeSeconds: number;
    endTimeSeconds: number;
    text: string;
  }>;
  music: {
    trackId: string;
    trackName: string;
    level: number;
  };
  sfx: {
    cues: string[];
    level: number;
  };
  qualityScores?: ProductionQualityScores;
  createdAt: string;
}
