/**
 * FLASH.Ai Asset Organizer Service (Phase 2 - Requirement 3)
 * 
 * Supports:
 * - Screen recordings
 * - Website / demo videos
 * - Screenshots
 * - Project footage
 * 
 * Automatically organizes and assigns these assets into Reel scenes based on the template.
 */

import type {
  RawMediaAsset,
  SceneMedia,
  SceneMediaType,
  ProductionTimelineScene
} from '../types/reelProduction';
import type { ReelTemplateDefinition } from '../types/reelProduction';
import { demoAssetLibrary } from './demoAssetLibrary';

export interface IngestedAssetPayload {
  screenRecording?: RawMediaAsset | string;
  websiteDemo?: RawMediaAsset | string;
  screenshots?: Array<RawMediaAsset | string>;
  projectFootage?: RawMediaAsset | string;
}

export class AssetOrganizerService {
  /**
   * Automatically organizes incoming assets into 5 structured Reel scenes.
   */
  public organizeAssetsIntoScenes(params: {
    template: ReelTemplateDefinition;
    scenes: ProductionTimelineScene[];
    assets?: IngestedAssetPayload;
  }): ProductionTimelineScene[] {
    const { template, scenes, assets } = params;

    // Convert string URLs or raw objects into RawMediaAsset format
    const screenRec = this.normalizeAsset(assets?.screenRecording, 'screen_recording', 'Main Screen Recording');
    const webDemo = this.normalizeAsset(assets?.websiteDemo, 'website_demo', 'Interactive Web Demo');
    const footage = this.normalizeAsset(assets?.projectFootage, 'video_clip', 'Project Demo Footage');
    const screenshots = (assets?.screenshots || [])
      .map((s, idx) => this.normalizeAsset(s, 'screenshot', `Screenshot ${idx + 1}`))
      .filter((s): s is RawMediaAsset => Boolean(s));

    // Available asset pool
    const pool = {
      screenRecording: screenRec,
      websiteDemo: webDemo,
      footage: footage,
      screenshots: screenshots
    };

    return scenes.map((scene, idx) => {
      const targetType = template.visualSourceSequence[idx] || scene.media.type;
      const assignedMedia = this.pickBestAssetForScene(scene.block, targetType, pool, idx);

      return {
        ...scene,
        media: assignedMedia
      };
    });
  }

  private pickBestAssetForScene(
    block: string,
    targetType: SceneMediaType,
    pool: {
      screenRecording?: RawMediaAsset;
      websiteDemo?: RawMediaAsset;
      footage?: RawMediaAsset;
      screenshots: RawMediaAsset[];
    },
    sceneIndex: number
  ): SceneMedia {
    let chosenRaw: RawMediaAsset | undefined;

    switch (block) {
      case 'HOOK':
        chosenRaw = pool.screenshots[0] || pool.footage || demoAssetLibrary.findBestMatchingAsset('screenshot');
        break;

      case 'PROBLEM_CONTEXT':
        chosenRaw = pool.screenRecording || pool.screenshots[1] || demoAssetLibrary.findBestMatchingAsset('screen_recording', 'terminal');
        break;

      case 'DEMO_VALUE':
        chosenRaw = pool.websiteDemo || pool.screenRecording || pool.footage || demoAssetLibrary.findBestMatchingAsset('website_demo', 'workflow');
        break;

      case 'RESULT_PAYOFF':
        chosenRaw = pool.screenshots[2] || pool.screenshots[0] || demoAssetLibrary.findBestMatchingAsset('screenshot', 'metrics');
        break;

      case 'CTA':
        chosenRaw = demoAssetLibrary.findBestMatchingAsset('visual_placeholder', 'brand');
        break;

      default:
        chosenRaw = demoAssetLibrary.findBestMatchingAsset(targetType);
    }

    if (!chosenRaw) {
      chosenRaw = demoAssetLibrary.getAllAssets()[sceneIndex % demoAssetLibrary.getAllAssets().length];
    }

    // Determine smart fit and positioning
    // Fullscreen backdrops use cover; UI recordings use contain to prevent cropping essential buttons
    const isUiRecording = chosenRaw.type === 'website_demo' || chosenRaw.type === 'screen_recording';
    const fit = isUiRecording ? 'contain' : 'cover';

    return {
      type: chosenRaw.type,
      url: chosenRaw.url,
      thumbnailUrl: chosenRaw.thumbnailUrl,
      label: chosenRaw.name,
      fit,
      scale: isUiRecording ? 1.05 : 1.0,
      positionX: 50,
      positionY: 50,
      trimStartSeconds: 0,
      trimEndSeconds: chosenRaw.durationSeconds || 10
    };
  }

  private normalizeAsset(
    item: RawMediaAsset | string | undefined,
    fallbackType: SceneMediaType,
    defaultName: string
  ): RawMediaAsset | undefined {
    if (!item) return undefined;
    if (typeof item === 'string') {
      return {
        id: `ingested-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: defaultName,
        type: fallbackType,
        url: item,
        tags: [fallbackType, 'user_upload'],
        createdAt: new Date().toISOString()
      };
    }
    return item;
  }
}

export const assetOrganizerService = new AssetOrganizerService();
