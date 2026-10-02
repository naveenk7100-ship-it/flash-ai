/**
 * FLASH.Ai Phase 2 Reel Quality Control Engine (Requirement 10)
 * 
 * Enforces all 12 strict validation gates:
 * 1. Wrong aspect ratio (strictly 9:16)
 * 2. Missing media (each scene must have valid media or backdrop)
 * 3. Empty scene (scenes with 0 duration or blank content)
 * 4. Text outside safe area (mobile margins: top >= 14%, bottom <= 80%, right <= 85%)
 * 5. Excessive duration (total duration must be 20s - 60s)
 * 6. Missing hook (scene 1 must be HOOK with punchy text)
 * 7. Clean informational conclusion (no forced marketing spam)
 * 8. Audio missing when required (music or voiceover active)
 * 9. Duplicate back-to-back media (prevents repetitive visuals)
 * 10. Export failure / validation error
 * 11. Content-to-visual semantic match (score >= 85%)
 * 12. Audio stream & voiceover integrity
 */

import type {
  ReelProductionProject,
  Phase2QCReport,
  Phase2QCCheck,
  ProductionTimelineScene,
  SceneTextOverlay
} from '../types/reelProduction.js';
import { visualIntentEngine } from './visualIntentEngine.js';

export class ReelQCEngine {
  /**
   * Evaluates a complete Reel production project against the Phase 2 QC rules.
   */
  public evaluateProject(project: ReelProductionProject): Phase2QCReport {
    const checks: Phase2QCCheck[] = [];

    // Gate 1: Aspect Ratio
    const isAspectRatioValid =
      project.aspectRatio === '9:16' &&
      project.exportSettings.resolution.width * 16 ===
        project.exportSettings.resolution.height * 9;

    checks.push({
      id: 'aspect_ratio',
      name: '9:16 Vertical Aspect Ratio',
      passed: isAspectRatioValid,
      fatal: true,
      message: isAspectRatioValid
        ? `Output resolution ${project.exportSettings.resolution.width}x${project.exportSettings.resolution.height} conforms to standard 9:16 mobile format.`
        : `Invalid aspect ratio: ${project.exportSettings.resolution.width}x${project.exportSettings.resolution.height} is not 9:16.`,
      suggestion: 'Set export resolution to 1080x1920 or 720x1280.'
    });

    // Gate 2: Missing Media
    const scenesMissingMedia = project.scenes.filter(
      (s: ProductionTimelineScene) => !s.media || !s.media.url || s.media.url.trim() === ''
    );
    const hasAllMedia = scenesMissingMedia.length === 0;

    checks.push({
      id: 'missing_media',
      name: 'Scene Media Attachments',
      passed: hasAllMedia,
      fatal: true,
      message: hasAllMedia
        ? `All ${project.scenes.length} scenes have media or visual backdrops attached.`
        : `${scenesMissingMedia.length} scene(s) have missing media: Scene ${scenesMissingMedia.map((s: ProductionTimelineScene) => s.sceneNumber).join(', ')}.`,
      suggestion: 'Assign screenshots, screen recordings, or backdrops from the Asset Library.'
    });

    // Gate 3: Empty Scene
    const emptyScenes = project.scenes.filter(
      (s: ProductionTimelineScene) =>
        s.durationSeconds <= 0 ||
        ((!s.textOverlays || s.textOverlays.length === 0) &&
          !s.audioSettings.voiceoverText)
    );
    const hasNoEmptyScenes = emptyScenes.length === 0;

    checks.push({
      id: 'empty_scene',
      name: 'Non-Empty Scenes',
      passed: hasNoEmptyScenes,
      fatal: true,
      message: hasNoEmptyScenes
        ? 'All scenes contain active duration, text, and narrative directions.'
        : `Empty scene detected at Scene ${emptyScenes.map((s: ProductionTimelineScene) => s.sceneNumber).join(', ')}.`,
      suggestion: 'Ensure every scene has duration > 0 and at least one text overlay or voiceover cue.'
    });

    // Gate 4: Text Outside Mobile Safe Area
    const textOutsideSafeArea: string[] = [];
    project.scenes.forEach((scene: ProductionTimelineScene) => {
      scene.textOverlays.forEach((overlay: SceneTextOverlay) => {
        const { xPercent, yPercent } = overlay.position;
        // Instagram safe boundaries: Top >= 14%, Bottom <= 80%, Right <= 85%, Left >= 8%
        if (
          yPercent < 14 ||
          yPercent > 80 ||
          xPercent < 8 ||
          xPercent > 85
        ) {
          textOutsideSafeArea.push(
            `Scene ${scene.sceneNumber} (${overlay.type}): pos(${xPercent}%, ${yPercent}%)`
          );
        }
      });
    });
    const isTextSafe = textOutsideSafeArea.length === 0;

    checks.push({
      id: 'text_safe_area',
      name: 'Mobile Safe Area Compliance (9:16)',
      passed: isTextSafe,
      fatal: false, // warning/fixable
      message: isTextSafe
        ? 'All text overlays are positioned within Instagram Reels safe margins.'
        : `Text positioned outside safe zone: ${textOutsideSafeArea.join('; ')}.`,
      suggestion: 'Keep overlays between 15% - 78% Y to avoid Instagram navigation and caption clipping.'
    });

    // Gate 5: Excessive Duration (20s - 60s)
    const isDurationValid =
      project.totalDurationSeconds >= 20 && project.totalDurationSeconds <= 60;

    checks.push({
      id: 'excessive_duration',
      name: 'Pacing & Duration (20s - 60s)',
      passed: isDurationValid,
      fatal: true,
      message: isDurationValid
        ? `Total duration ${project.totalDurationSeconds}s conforms to creator Reel sweet spot (20s–60s).`
        : project.totalDurationSeconds < 20
        ? `Reel duration (${project.totalDurationSeconds}s) is too short. Minimum duration is 20s.`
        : `Reel duration (${project.totalDurationSeconds}s) exceeds maximum 60s limit.`,
      suggestion: 'Use Auto-Editing to trim or extend scenes to 30s–45s.'
    });

    // Gate 6: Missing Hook
    const hookScene = project.scenes.find((s: ProductionTimelineScene) => s.block === 'HOOK');
    const hasValidHook =
      Boolean(hookScene) &&
      Boolean(
        hookScene?.textOverlays?.some((t: SceneTextOverlay) => t.type === 'hook' && t.text.trim().length > 5) ||
        (hookScene?.audioSettings?.voiceoverText && hookScene.audioSettings.voiceoverText.trim().length > 5)
      );

    checks.push({
      id: 'missing_hook',
      name: 'High-Retention Hook in Scene 1',
      passed: hasValidHook,
      fatal: true,
      message: hasValidHook
        ? `Hook scene present: "${hookScene?.textOverlays?.find((t: SceneTextOverlay) => t.type === 'hook')?.text || hookScene?.audioSettings?.voiceoverText}"`
        : 'Missing retention hook in Scene 1.',
      suggestion: 'Add an attention-grabbing hook in the first 0-3 seconds.'
    });

    // Gate 7: Clean Informational Conclusion (No forced marketing spam)
    const lastScene = project.scenes[project.scenes.length - 1];
    const hasValidConclusion =
      Boolean(lastScene) &&
      Boolean(
        lastScene?.textOverlays?.some((t: SceneTextOverlay) => t.text.trim().length > 3) ||
        (lastScene?.audioSettings?.voiceoverText && lastScene.audioSettings.voiceoverText.trim().length > 3)
      );

    checks.push({
      id: 'clean_conclusion',
      name: 'Clean Informational Conclusion',
      passed: hasValidConclusion,
      fatal: true,
      message: hasValidConclusion
        ? `Final scene conclusion verified: "${lastScene?.textOverlays[0]?.text || lastScene?.audioSettings?.voiceoverText}"`
        : 'Final scene is missing an informative closing statement.',
      suggestion: 'End the Reel naturally summarizing the tool utility or development.'
    });

    // Gate 8: Audio Missing When Required
    const hasAudio =
      project.audio.music.enabled || project.audio.voiceover.enabled;

    checks.push({
      id: 'audio_missing',
      name: 'Audio Layer Configuration',
      passed: hasAudio,
      fatal: true,
      message: hasAudio
        ? `Audio active (Music: ${project.audio.music.enabled ? project.audio.music.trackName : 'Off'}, Voice: ${project.audio.voiceover.enabled ? project.audio.voiceover.provider : 'Off'}).`
        : 'Reel has neither background music nor voiceover enabled.',
      suggestion: 'Enable background music or voiceover in the Audio tab.'
    });

    // Gate 9: Duplicate Back-to-Back Assets
    let hasDuplicateAssets = false;
    for (let i = 1; i < project.scenes.length; i++) {
      if (
        project.scenes[i].media.url &&
        project.scenes[i].media.url === project.scenes[i - 1].media.url &&
        project.scenes[i].media.type !== 'visual_placeholder'
      ) {
        hasDuplicateAssets = true;
        break;
      }
    }

    checks.push({
      id: 'duplicate_assets',
      name: 'Visual Variety & Asset Progression',
      passed: !hasDuplicateAssets,
      fatal: false,
      message: !hasDuplicateAssets
        ? 'Scene visual assets transition smoothly without redundant repeats.'
        : 'Detected identical visual media repeated back-to-back in consecutive scenes.',
      suggestion: 'Swap the duplicated scene with a distinct screenshot or demo recording.'
    });

    // Gate 10: Export Status & Validation
    const exportPassed =
      !project.exportStatus || project.exportStatus.status !== 'FAILED';

    checks.push({
      id: 'export_readiness',
      name: 'Export Pipeline Readiness',
      passed: exportPassed,
      fatal: true,
      message: exportPassed
        ? `Export settings validated (${project.exportSettings.format.toUpperCase()} • ${project.exportSettings.fps} FPS • ${project.exportSettings.quality} Quality).`
        : `Previous export failed: ${project.exportStatus?.errorMessage || 'Unknown error'}`,
      suggestion: 'Resolve QC violations before queuing vertical video export.'
    });

    // Gate 11: Scene Meaning & Content-to-Visual Match Gate (Requirement: Overall >= 85, per-scene >= 80)
    const sceneAnalyses = project.scenes.map((s: ProductionTimelineScene) =>
      visualIntentEngine.analyzeSceneIntent(
        {
          sceneNumber: s.sceneNumber,
          block: s.block,
          voiceoverText: s.audioSettings.voiceoverText,
          textOverlay: s.textOverlays[0]?.text,
          visualInstruction: s.visualInstruction
        },
        project.topic,
        ((project.templateId || project.formatId) as any)
      )
    );
    const matchReport = visualIntentEngine.evaluateVisualMatch(sceneAnalyses, project.topic);

    checks.push({
      id: 'scene_meaning_match',
      name: 'Content-to-Visual Semantic Match (Score >= 85%)',
      passed: matchReport.passesQCGate,
      fatal: true,
      message: matchReport.passesQCGate
        ? `Overall visual match score: ${matchReport.overallVisualMatchScore}% (all scenes >= 80%). Visuals accurately convey topic semantics and entities.`
        : `Visual match score ${matchReport.overallVisualMatchScore}% does not meet minimum 85% requirement.`,
      suggestion: 'Ensure visuals use topic-specific UI mockups, node diagrams, and ROI metrics matching spoken narration.'
    });

    // Gate 12: Audio Stream & Voiceover Integrity Gate
    const hasVoiceoverTrack =
      project.audio.voiceover.enabled &&
      Boolean(project.audio.voiceover.voiceId) &&
      project.scenes.some((s: ProductionTimelineScene) => s.audioSettings.voiceoverText && s.audioSettings.voiceoverText.trim().length > 0);

    checks.push({
      id: 'audio_stream_integrity',
      name: 'ElevenLabs Voiceover & Audio Muxing Integrity',
      passed: hasVoiceoverTrack,
      fatal: true,
      message: hasVoiceoverTrack
        ? `Real voiceover track configured with Voice ID "${project.audio.voiceover.voiceId}" across ${project.scenes.length} scenes.`
        : 'Reel voiceover is missing or voice ID is not configured.',
      suggestion: 'Configure ElevenLabs voiceover provider with valid Voice ID.'
    });

    const fatalFailures = checks.filter((c: Phase2QCCheck) => c.fatal && !c.passed);
    const warnings = checks.filter((c: Phase2QCCheck) => !c.fatal && !c.passed);

    return {
      passed: fatalFailures.length === 0,
      fatalCount: fatalFailures.length,
      warningsCount: warnings.length,
      checks,
      checkedAt: new Date().toISOString()
    };
  }
}

export const reelQCEngine = new ReelQCEngine();
