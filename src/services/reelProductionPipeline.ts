/**
 * FLASH.Ai Reel Production Pipeline Orchestrator (Phase 2 - Requirements 1 & 13)
 * 
 * Executes the complete 10-stage pipeline:
 * CONTENT PLAN
 * → SCENE PLAN
 * → ASSET COLLECTION
 * → TIMELINE
 * → TEXT OVERLAYS
 * → CAPTIONS
 * → AUDIO
 * → TRANSITIONS
 * → QC
 * → EXPORT
 * 
 * Works out of the box with zero external API credentials via realistic demo assets and local synthesis.
 */

import type {
  ReelProductionProject,
  ProductionTimelineScene,
  ReelTemplateId,
  ExportJob
} from '../types/reelProduction';
import type { ProductionReelPackage } from './reelProductionEngine';
import { reelTemplateEngine } from './reelTemplateEngine';
import { topicTemplateSelector } from './topicTemplateSelector';
import { assetOrganizerService, type IngestedAssetPayload } from './assetOrganizerService';
import { autoEditingEngine } from './autoEditingEngine';
import { captionEngine } from './captionEngine';
import { audioEngine } from './audioEngine';
import { reelQCEngine } from './reelQCEngine';
import { reelExportEngine } from './reelExportEngine';
import { FLASH_AI_BRAND } from '../constants/brandConfig';
import { reelProductionEngine } from './reelProductionEngine';

const PROJECTS_STORAGE_KEY = 'flash_ai_reel_projects';

export class ReelProductionPipeline {
  private activeProjects: Map<string, ReelProductionProject> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Turns a Phase 1 Content Plan / Reel Package into a production-ready 9:16 vertical Reel project.
   */
  public createProjectFromPackage(params: {
    reelPackage: ProductionReelPackage;
    templateId?: ReelTemplateId;
    userAssets?: IngestedAssetPayload;
  }): ReelProductionProject {
    const { reelPackage, userAssets } = params;

    // 1. TOPIC-AWARE TEMPLATE SELECTION (v2)
    const templateSelection = topicTemplateSelector.selectTemplate({
      topic: reelPackage.topic,
      script: reelPackage.scenes.map((s) => s.voiceoverText).join(' '),
      hook: reelPackage.scenes[0]?.textOverlay,
      formatId: reelPackage.format.id,
      pillarId: reelPackage.pillarId,
      cta: reelPackage.cta
    });

    const template = params.templateId
      ? reelTemplateEngine.getTemplateById(params.templateId)
      : reelTemplateEngine.getTemplateById(templateSelection.templateId);

    // 2. SCENE PLAN
    const rawScenes: ProductionTimelineScene[] = reelPackage.scenes.map((s, idx) => ({
      id: `scene-${reelPackage.id}-${idx + 1}`,
      sceneNumber: idx + 1,
      block: s.block,
      durationSeconds: s.durationSeconds,
      startTimeSeconds: 0,
      endTimeSeconds: s.durationSeconds,
      media: {
        type: 'visual_placeholder',
        url: '',
        fit: 'cover',
        scale: 1.0,
        positionX: 50,
        positionY: 50
      },
      textOverlays: [
        {
          id: `txt-${idx + 1}`,
          text: s.textOverlay,
          type: idx === 0 ? 'hook' : idx === reelPackage.scenes.length - 1 ? 'cta' : 'feature_callout',
          position: { xPercent: 10, yPercent: 25 },
          fontSize: 48,
          fontWeight: 'bold',
          textColor: '#FFFFFF',
          animation: 'pop',
          safeAreaChecked: true
        }
      ],
      animation: 'none',
      transition: {
        type: s.transition === 'wipe' ? 'wipe' : s.transition === 'slide_left' ? 'slide_left' : 'pop',
        durationSeconds: 0.35
      },
      audioSettings: {
        voiceoverText: s.voiceoverText,
        sfxType: template.soundEffects[idx % template.soundEffects.length] || 'whoosh',
        sfxVolume: 0.7,
        musicDuckLevel: 0.15
      },
      background: {
        type: 'gradient',
        value: 'from-slate-950 via-slate-900 to-black'
      },
      visualInstruction: s.visualInstruction
    }));

    // 3. ASSET COLLECTION (screen recording, website demo, screenshots)
    const scenesWithAssets = assetOrganizerService.organizeAssetsIntoScenes({
      template,
      scenes: rawScenes,
      assets: userAssets
    });

    // 4. TIMELINE & AUTO EDITING & 5. TEXT OVERLAYS & 8. TRANSITIONS
    const edited = autoEditingEngine.autoEditTimeline({
      scenes: scenesWithAssets,
      targetTotalDurationSeconds: reelPackage.totalDurationSeconds || 35,
      template,
      topic: reelPackage.topic,
      ctaText: reelPackage.cta
    });

    // 6. CAPTIONS
    const captions = captionEngine.generateCaptionTrack(edited.scenes);

    // 7. AUDIO LAYER
    const audio = audioEngine.createAudioConfig({
      scenes: edited.scenes
    });

    // Initial project assembly
    const project: ReelProductionProject = {
      id: `proj-${reelPackage.id}`,
      title: reelPackage.topic,
      topic: reelPackage.topic,
      formatId: reelPackage.format.id,
      templateId: template.id,
      templateSelection,
      pillarId: reelPackage.pillarId,
      targetAudience: reelPackage.targetAudience,
      aspectRatio: '9:16',
      exportSettings: {
        aspectRatio: '9:16',
        resolution: { width: 1080, height: 1920 },
        fps: 30,
        format: 'mp4',
        quality: 'high',
        includeAudio: true
      },
      scenes: edited.scenes,
      totalDurationSeconds: edited.totalDurationSeconds,
      captions,
      audio,
      branding: {
        watermarkEnabled: FLASH_AI_BRAND.watermark.enabled,
        watermarkText: FLASH_AI_BRAND.instagramHandle,
        watermarkPosition: FLASH_AI_BRAND.watermark.position as any,
        brandHandle: FLASH_AI_BRAND.instagramHandle
      },
      qcReport: {
        passed: true,
        fatalCount: 0,
        warningsCount: 0,
        checks: [],
        checkedAt: new Date().toISOString()
      },
      mode: 'DEMO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 9. AUTOMATIC QC
    project.qcReport = reelQCEngine.evaluateProject(project);

    this.activeProjects.set(project.id, project);
    this.saveToStorage();
    return project;
  }

  /**
   * Generates a complete creator Demo Reel project with realistic assets without requiring external API keys.
   */
  public createDemoReelProject(preferredTemplateId?: ReelTemplateId, customTopic?: string): ReelProductionProject {
    const pkg = reelProductionEngine.generateReelPackage({
      topic: customTopic || 'How AI Agents Process 50 Inbound Dental Appointments Daily',
      pillarId: 'ai-automation',
      targetDurationSeconds: 32,
      cta: 'DM "AUTOMATE"'
    });

    return this.createProjectFromPackage({
      reelPackage: pkg,
      templateId: preferredTemplateId || 'build-showcase'
    });
  }

  public getProject(id: string): ReelProductionProject | undefined {
    return this.activeProjects.get(id);
  }

  public getAllProjects(): ReelProductionProject[] {
    return Array.from(this.activeProjects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public updateProject(
    id: string,
    updates: Partial<ReelProductionProject>
  ): ReelProductionProject {
    const existing = this.activeProjects.get(id);
    if (!existing) {
      throw new Error(`Project with ID ${id} not found.`);
    }

    const updated: ReelProductionProject = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate duration & re-run QC
    updated.totalDurationSeconds = updated.scenes.reduce(
      (acc, s) => acc + s.durationSeconds,
      0
    );
    updated.qcReport = reelQCEngine.evaluateProject(updated);

    this.activeProjects.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  public deleteProject(id: string): boolean {
    const deleted = this.activeProjects.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  /**
   * 10. EXPORT
   */
  public async exportProject(
    projectId: string,
    onProgress?: (job: ExportJob) => void
  ): Promise<ExportJob> {
    const project = this.activeProjects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    // Verify QC
    const qc = reelQCEngine.evaluateProject(project);
    project.qcReport = qc;
    if (!qc.passed) {
      throw new Error(`Cannot export Reel: ${qc.checks.filter((c) => c.fatal && !c.passed).map((c) => c.message).join(' ')}`);
    }

    const job = await reelExportEngine.exportReel(project, onProgress);
    project.exportStatus = job;
    this.saveToStorage();
    return job;
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        const list: ReelProductionProject[] = JSON.parse(stored);
        list.forEach((p) => this.activeProjects.set(p.id, p));
      }
    } catch {
      // Storage unavailable
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const list = Array.from(this.activeProjects.values());
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage unavailable
    }
  }
}

export const reelProductionPipeline = new ReelProductionPipeline();
