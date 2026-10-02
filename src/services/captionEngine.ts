/**
 * FLASH.Ai Subtitle & Caption Engine (Phase 2 - Requirement 7)
 * 
 * Implements:
 * - Subtitle timing generation from script & voiceover timeline
 * - Word & phrase distribution matching modern creator pacing (2.6 words/sec)
 * - Editable caption track interface
 * - Mobile safe zone positioning (68% - 74% Y)
 */

import type {
  CaptionTrack,
  CaptionCue,
  ProductionTimelineScene
} from '../types/reelProduction';

const POWER_KEYWORDS = [
  'ai',
  'automate',
  'automation',
  'hours',
  'minutes',
  'seconds',
  'money',
  'growth',
  'workflow',
  'revenue',
  'zero',
  'instant',
  'system',
  'dm',
  'link'
];

export class CaptionEngine {
  /**
   * Generates timed subtitle cues from scene voiceover text.
   */
  public generateCaptionTrack(scenes: ProductionTimelineScene[]): CaptionTrack {
    const cues: CaptionCue[] = [];

    scenes.forEach((scene) => {
      const text = scene.audioSettings.voiceoverText || scene.textOverlays[0]?.text || '';
      if (!text.trim()) return;

      const sceneCues = this.splitTextIntoTimedCues(
        text,
        scene.id,
        scene.startTimeSeconds,
        scene.endTimeSeconds
      );
      cues.push(...sceneCues);
    });

    return {
      enabled: true,
      cues,
      positionYPercent: 71, // Mobile safe zone (above IG UI)
      style: {
        fontSize: 36,
        fontColor: '#FFFFFF',
        highlightColor: '#00F5FF',
        bgBox: true,
        bgBoxColor: 'rgba(0, 0, 0, 0.85)',
        uppercase: true
      }
    };
  }

  /**
   * Splits a sentence into creator-style 3-6 word punchy rhythmic subtitle chunks.
   */
  private splitTextIntoTimedCues(
    text: string,
    sceneId: string,
    sceneStart: number,
    sceneEnd: number
  ): CaptionCue[] {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    if (words.length === 0) return [];

    const sceneDuration = Math.max(1, sceneEnd - sceneStart);
    const chunkSize = 4; // 4 words per cue for rapid, mobile-friendly subtitle reading
    const chunks: string[][] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize));
    }

    const durationPerChunk = sceneDuration / chunks.length;

    return chunks.map((chunk, idx) => {
      const startTime = +(sceneStart + idx * durationPerChunk).toFixed(2);
      const endTime = +(sceneStart + (idx + 1) * durationPerChunk).toFixed(2);
      const chunkText = chunk.join(' ');

      // Find keywords to highlight
      const highlightWords = chunk.filter((w) =>
        POWER_KEYWORDS.includes(w.toLowerCase().replace(/[^a-z]/g, ''))
      );

      return {
        id: `cue-${sceneId}-${idx}-${Date.now()}`,
        sceneId,
        startTimeSeconds: startTime,
        endTimeSeconds: endTime,
        text: chunkText,
        highlightWords
      };
    });
  }

  /**
   * Updates an existing caption cue.
   */
  public updateCue(
    track: CaptionTrack,
    cueId: string,
    updates: Partial<CaptionCue>
  ): CaptionTrack {
    return {
      ...track,
      cues: track.cues.map((c) => (c.id === cueId ? { ...c, ...updates } : c))
    };
  }

  /**
   * Adds a new caption cue.
   */
  public addCue(track: CaptionTrack, newCue: CaptionCue): CaptionTrack {
    const updated = [...track.cues, newCue].sort(
      (a, b) => a.startTimeSeconds - b.startTimeSeconds
    );
    return {
      ...track,
      cues: updated
    };
  }

  /**
   * Deletes a caption cue.
   */
  public deleteCue(track: CaptionTrack, cueId: string): CaptionTrack {
    return {
      ...track,
      cues: track.cues.filter((c) => c.id !== cueId)
    };
  }
}

export const captionEngine = new CaptionEngine();
