/**
 * FLASH.Ai Fast AI News & Tools Reel Engine (Client API Service)
 * 
 * Provides browser-safe API calls to the server-side fast Reel engine.
 */

import type {
  ReelProductionProject,
  ReelTemplateId,
  ProductionQualityScores
} from '../types/reelProduction.ts';
import type { ReviewableReelRecord } from './approvalWorkflowEngine.ts';

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
  reelRecord: ReviewableReelRecord;
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

export class FastReelEngineClient {
  public async generateFastReel(input: FastReelGenerationInput): Promise<FastReelGenerationResult> {
    const res = await fetch('/api/automation/fast-reel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      throw new Error(`Fast Reel generation failed with status ${res.status}`);
    }
    return res.json();
  }

  public async regenerateVisualsOnly(reelId: string): Promise<ReviewableReelRecord | null> {
    const res = await fetch('/api/automation/regenerate-visuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelId })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.todayReel || null;
  }

  public async regenerateVoiceOnly(reelId: string, voiceId?: string): Promise<ReviewableReelRecord | null> {
    const res = await fetch('/api/automation/regenerate-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelId, voiceId })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.todayReel || null;
  }
}

export const fastReelEngine = new FastReelEngineClient();
