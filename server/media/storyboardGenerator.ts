import type {
  ContentVariant,
  VisualStoryboard,
  StoryboardScene,
  VideoDuration,
  SceneSectionType,
  SceneAnimationType,
  MediaAssetType
} from '../../src/types/index.js';

export function parseDurationSeconds(durationStr: VideoDuration | string): number {
  if (typeof durationStr === 'number') return durationStr;
  if (durationStr === '15s') return 15;
  if (durationStr === '30s') return 30;
  if (durationStr === '60s') return 60;
  if (durationStr === '90s') return 90;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

export function generateStoryboardFromContent(params: {
  contentId: string;
  title: string;
  pillarId: any;
  variant: ContentVariant;
  videoDuration: VideoDuration | string;
  brandPresetId?: string;
}): VisualStoryboard {
  const totalDuration = parseDurationSeconds(params.videoDuration);
  const { variant, title, pillarId, contentId } = params;

  let sceneSplits: Array<{
    section: SceneSectionType;
    ratio: number;
    defaultAnim: SceneAnimationType;
    assetType: MediaAssetType;
  }>;

  if (totalDuration <= 15) {
    sceneSplits = [
      { section: 'hook', ratio: 0.20, defaultAnim: 'pop', assetType: 'gradient_bg' },
      { section: 'problem', ratio: 0.25, defaultAnim: 'slide_left', assetType: 'text_scene' },
      { section: 'solution', ratio: 0.30, defaultAnim: 'zoom_in', assetType: 'ui_mockup' },
      { section: 'value', ratio: 0.10, defaultAnim: 'fade', assetType: 'ai_image' },
      { section: 'cta', ratio: 0.15, defaultAnim: 'pulse', assetType: 'gradient_bg' }
    ];
  } else if (totalDuration <= 30) {
    sceneSplits = [
      { section: 'hook', ratio: 0.13, defaultAnim: 'pop', assetType: 'gradient_bg' },
      { section: 'problem', ratio: 0.20, defaultAnim: 'slide_left', assetType: 'text_scene' },
      { section: 'solution', ratio: 0.35, defaultAnim: 'zoom_in', assetType: 'ui_mockup' },
      { section: 'value', ratio: 0.18, defaultAnim: 'ken_burns', assetType: 'ai_image' },
      { section: 'cta', ratio: 0.14, defaultAnim: 'pulse', assetType: 'gradient_bg' }
    ];
  } else {
    sceneSplits = [
      { section: 'hook', ratio: 0.10, defaultAnim: 'pop', assetType: 'gradient_bg' },
      { section: 'problem', ratio: 0.22, defaultAnim: 'slide_left', assetType: 'text_scene' },
      { section: 'solution', ratio: 0.38, defaultAnim: 'zoom_in', assetType: 'ui_mockup' },
      { section: 'value', ratio: 0.18, defaultAnim: 'ken_burns', assetType: 'ai_image' },
      { section: 'cta', ratio: 0.12, defaultAnim: 'pulse', assetType: 'gradient_bg' }
    ];
  }

  const scriptLines = variant.shortScript
    ? variant.shortScript
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('===') && !l.startsWith('['))
    : [];

  const onScreenList = variant.onScreenText || [];

  let currentTime = 0;
  const scenes: StoryboardScene[] = sceneSplits.map((split, index) => {
    const isLast = index === sceneSplits.length - 1;
    let sceneDuration = Math.round(totalDuration * split.ratio);
    if (sceneDuration < 2) sceneDuration = 2;

    const startTime = currentTime;
    const endTime = isLast ? totalDuration : Math.min(totalDuration, startTime + sceneDuration);
    const actualDuration = Math.max(1, +(endTime - startTime).toFixed(1));
    currentTime = endTime;

    let visualDesc = '';
    let onScreen = '';
    let speech = '';

    switch (split.section) {
      case 'hook':
        visualDesc = variant.hookRetentionCue || 'Fast-paced direct camera intro with high-contrast dynamic text pop';
        onScreen = variant.hook || title;
        speech = scriptLines[0] || variant.hook;
        break;
      case 'problem':
        visualDesc = 'Visualizing the friction, bottlenecks, and manual overhead faced by modern businesses';
        onScreen = onScreenList[0] || 'The Manual Overhead Problem';
        speech = scriptLines[1] || 'Most companies waste hundreds of hours on manual workflows.';
        break;
      case 'solution':
        visualDesc = 'Dynamic workflow demonstration: Automated triggers, instant AI execution, seamless notifications';
        onScreen = onScreenList[1] || 'The Automated AI Solution';
        speech = scriptLines[2] || scriptLines[1] || 'Here is how autonomous AI handles it in seconds.';
        break;
      case 'value':
        visualDesc = 'Metrics and speed comparison: 90% time saved, zero lead leakage, 24/7 reliability';
        onScreen = onScreenList[2] || 'Measurable Business ROI';
        speech = scriptLines[3] || 'Your team gets hours back every day with zero missed opportunities.';
        break;
      case 'cta':
        visualDesc = 'Bold FLASH.Ai call to action card with animated neon button and direct action cue';
        onScreen = variant.cta || 'DM "AUTOMATE" For Free Blueprint';
        speech = variant.cta ? `Want this built for your business? ${variant.cta}.` : 'DM "AUTOMATE" to get started.';
        break;
      default:
        visualDesc = 'High contrast tech presentation';
        onScreen = title;
        speech = scriptLines[index] || '';
    }

    return {
      id: `scene-${index + 1}-${Date.now()}`,
      sceneNumber: index + 1,
      section: split.section,
      startTime: +startTime.toFixed(1),
      endTime: +endTime.toFixed(1),
      duration: actualDuration,
      visualDescription: visualDesc,
      onScreenText: onScreen,
      speechText: speech,
      animation: split.defaultAnim,
      assetType: split.assetType,
      gradientPreset: 'cyan-purple-grid',
      iconName: split.section === 'cta' ? 'Zap' : 'Sparkles'
    };
  });

  return {
    id: `sb-${contentId || Date.now()}`,
    contentId: contentId || `content-${Date.now()}`,
    title: title || 'Untitled FLASH.Ai Reel',
    pillarId: pillarId || 'ai-automation',
    aspectRatio: '9:16',
    resolution: {
      width: 1080,
      height: 1920
    },
    totalDuration,
    scenes,
    brandPresetId: params.brandPresetId || 'flash-ai-default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
