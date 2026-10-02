/**
 * FLASH.Ai Auto Editing Engine (Phase 2 - Requirements 4 & 5)
 * 
 * Implements automated:
 * - Scene trimming & sequencing
 * - Modern zoom/pan effects (Ken Burns scale 1.0 -> 1.08, pan)
 * - Transitions (subtle whip slide, pop, zoom)
 * - Text animations & safe-area clamping (readable on 9:16 mobile screen)
 * - Pacing & intro/outro CTA endings
 */

import type {
  ProductionTimelineScene,
  ReelTemplateDefinition,
  SceneTextOverlay,
  SceneAnimationType,
  SceneTransition
} from '../types/reelProduction';
import { FLASH_AI_BRAND } from '../constants/brandConfig';

export class AutoEditingEngine {
  /**
   * Automatically edits, paces, and enhances a raw scene sequence.
   */
  public autoEditTimeline(params: {
    scenes: ProductionTimelineScene[];
    targetTotalDurationSeconds?: number;
    template: ReelTemplateDefinition;
    topic: string;
    ctaText?: string;
  }): {
    scenes: ProductionTimelineScene[];
    totalDurationSeconds: number;
  } {
    const { scenes, template, topic, ctaText } = params;
    const targetDuration = Math.min(60, Math.max(20, params.targetTotalDurationSeconds || 35));

    // 1. Calculate Paced Durations
    const pacing = template.defaultPacing;
    const templateSum =
      pacing.hookDuration +
      pacing.problemDuration +
      pacing.demoDuration +
      pacing.resultDuration +
      pacing.ctaDuration;

    const scaleFactor = targetDuration / templateSum;

    let currentTime = 0;
    const editedScenes: ProductionTimelineScene[] = scenes.map((scene, idx) => {
      // Calculate scaled duration per block
      let idealDuration: number;
      switch (scene.block) {
        case 'HOOK':
          idealDuration = Math.round(pacing.hookDuration * scaleFactor);
          break;
        case 'PROBLEM_CONTEXT':
          idealDuration = Math.round(pacing.problemDuration * scaleFactor);
          break;
        case 'DEMO_VALUE':
          idealDuration = Math.round(pacing.demoDuration * scaleFactor);
          break;
        case 'RESULT_PAYOFF':
          idealDuration = Math.round(pacing.resultDuration * scaleFactor);
          break;
        case 'CTA':
          idealDuration = Math.round(pacing.ctaDuration * scaleFactor);
          break;
        default:
          idealDuration = Math.round((targetDuration / scenes.length));
      }

      idealDuration = Math.max(2, idealDuration);
      const startTime = currentTime;
      const endTime = +(startTime + idealDuration).toFixed(1);
      currentTime = endTime;

      // 2. Motion & Zoom/Pan Assignment (Clean & Creator-like)
      const animation = this.pickMotionAnimation(scene.block, idx);

      // 3. Transitions
      const transition: SceneTransition = {
        type: template.recommendedTransitions[idx % template.recommendedTransitions.length] || 'slide_left',
        durationSeconds: 0.35
      };

      // 4. Mobile-Safe Text Overlays (Hook, Callouts, Scene Labels, CTA)
      const textOverlays = this.generateSafeTextOverlays({
        block: scene.block,
        sceneNumber: idx + 1,
        topic,
        existingText: scene.textOverlays[0]?.text || '',
        ctaText: ctaText || FLASH_AI_BRAND.ctaStyles[0].label
      });

      return {
        ...scene,
        sceneNumber: idx + 1,
        durationSeconds: idealDuration,
        startTimeSeconds: startTime,
        endTimeSeconds: endTime,
        animation,
        transition,
        textOverlays
      };
    });

    const totalDurationSeconds = +currentTime.toFixed(1);

    return {
      scenes: editedScenes,
      totalDurationSeconds
    };
  }

  /**
   * Generates mobile-safe text overlays positioned strictly within 9:16 safe bounds:
   * - Top margin: >= 15% (clear of Instagram reels header)
   * - Bottom margin: <= 78% (clear of reel caption & audio pill)
   * - Right margin: <= 82% (clear of reel interaction icons)
   */
  public generateSafeTextOverlays(params: {
    block: string;
    sceneNumber: number;
    topic: string;
    existingText: string;
    ctaText: string;
  }): SceneTextOverlay[] {
    const { block, sceneNumber, topic, existingText, ctaText } = params;
    const overlays: SceneTextOverlay[] = [];

    // Top Scene Label (Safe at 16% Y)
    overlays.push({
      id: `label-${sceneNumber}-${Date.now()}`,
      text: `${this.formatBlockLabel(block)}`,
      type: 'scene_label',
      position: { xPercent: 12, yPercent: 16 },
      fontSize: 24,
      fontWeight: 'bold',
      textColor: '#00F5FF',
      bgColor: 'rgba(0, 245, 255, 0.15)',
      animation: 'pop',
      safeAreaChecked: true
    });

    if (block === 'HOOK') {
      // Main Bold Hook (Safe at 25% Y)
      overlays.push({
        id: `hook-text-${sceneNumber}-${Date.now()}`,
        text: existingText || `Stop Doing ${topic} Manually in 2026.`,
        type: 'hook',
        position: { xPercent: 10, yPercent: 25 },
        fontSize: 54,
        fontWeight: 'black',
        textColor: '#FFFFFF',
        highlightColor: '#00F5FF',
        animation: 'pop',
        safeAreaChecked: true
      });
    } else if (block === 'DEMO_VALUE') {
      // Main Demo Feature Callout (Safe at 26% Y)
      overlays.push({
        id: `demo-callout-${sceneNumber}-${Date.now()}`,
        text: existingText || `Autonomous 1-Click Execution`,
        type: 'feature_callout',
        position: { xPercent: 10, yPercent: 26 },
        fontSize: 48,
        fontWeight: 'black',
        textColor: '#FFFFFF',
        highlightColor: '#38BDF8',
        animation: 'slide_up',
        safeAreaChecked: true
      });
    } else if (block === 'CTA') {
      // High-Impact CTA Button Overlay (Safe at 48% Y)
      overlays.push({
        id: `cta-button-${sceneNumber}-${Date.now()}`,
        text: ctaText || `Save for your next project`,
        type: 'cta',
        position: { xPercent: 10, yPercent: 48 },
        fontSize: 52,
        fontWeight: 'black',
        textColor: '#07090E',
        bgColor: '#00F5FF',
        animation: 'glow',
        safeAreaChecked: true
      });
    } else {
      // General Context Callout (Safe at 28% Y)
      overlays.push({
        id: `callout-${sceneNumber}-${Date.now()}`,
        text: existingText || topic,
        type: 'feature_callout',
        position: { xPercent: 10, yPercent: 28 },
        fontSize: 42,
        fontWeight: 'bold',
        textColor: '#FFFFFF',
        animation: 'fade',
        safeAreaChecked: true
      });
    }

    return overlays;
  }

  private pickMotionAnimation(block: string, sceneIdx: number): SceneAnimationType {
    if (block === 'HOOK') return 'pop';
    if (block === 'DEMO_VALUE') return 'zoom_in';
    if (block === 'RESULT_PAYOFF') return 'ken_burns';
    if (block === 'CTA') return 'pulse';
    return sceneIdx % 2 === 0 ? 'slide_left' : 'pan_up';
  }

  private formatBlockLabel(block: string): string {
    switch (block) {
      case 'HOOK':
        return '⚡ 01 • THE HOOK';
      case 'PROBLEM_CONTEXT':
        return '🔍 02 • THE PROBLEM';
      case 'DEMO_VALUE':
        return '🚀 03 • LIVE AI DEMO';
      case 'RESULT_PAYOFF':
        return '📈 04 • THE PAYOFF';
      case 'CTA':
        return '👉 05 • NEXT STEP';
      default:
        return 'FLASH.Ai';
    }
  }
}

export const autoEditingEngine = new AutoEditingEngine();
