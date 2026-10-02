import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MEDIA_DIRS } from './storagePaths.js';
import type { StoryboardScene, BrandPreset } from '../../src/types/index.js';

export interface ImageGenerationOptions {
  width: number;
  height: number;
  aspectRatio: '9:16';
  style?: string;
  brandPreset: BrandPreset;
}

export interface IImageProvider {
  name: string;
  isAvailable: boolean;
  generateSceneImage(
    scene: StoryboardScene,
    options: ImageGenerationOptions
  ): Promise<{ url: string; localPath: string }>;
}

export class ProceduralImageProvider implements IImageProvider {
  name = 'Procedural FLASH.Ai Graphics Engine';
  isAvailable = true;

  async generateSceneImage(
    scene: StoryboardScene,
    options: ImageGenerationOptions
  ): Promise<{ url: string; localPath: string }> {
    const filename = `scene_${scene.sceneNumber}_${Date.now()}_${randomUUID().slice(0, 8)}.svg`;
    const localPath = path.join(MEDIA_DIRS.assets, filename);
    const { brandPreset } = options;

    const width = options.width || 1080;
    const height = options.height || 1920;

    const svg = this.renderSceneSvg(scene, brandPreset, width, height);

    fs.writeFileSync(localPath, svg, 'utf-8');
    const url = `/media/assets/${filename}`;

    return { url, localPath };
  }

  private renderSceneSvg(
    scene: StoryboardScene,
    brand: BrandPreset,
    width: number,
    height: number
  ): string {
    const primary = brand.primaryColor || '#00F5FF';
    const secondary = brand.secondaryColor || '#7928CA';
    const bg = brand.backgroundColor || '#07090E';

    const sectionTitles: Record<string, string> = {
      hook: 'FLASH.Ai // HOOK',
      problem: 'THE BOTTLENECK // ANALYSIS',
      solution: 'AUTONOMOUS WORKFLOW // SOLUTION',
      value: 'MEASURABLE ROI // METRICS',
      cta: 'NEXT STEP // ACTION'
    };

    const sectionBadge = sectionTitles[scene.section] || 'FLASH.Ai REEL';

    const escapeXml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const cleanOnScreen = escapeXml(scene.onScreenText || '');
    const cleanDesc = escapeXml(scene.visualDescription || '');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="${bg}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="1"/>
    </radialGradient>

    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>

    <pattern id="cyberGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${primary}" stroke-width="0.8" stroke-opacity="0.12"/>
    </pattern>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="${bg}" />
  <rect width="${width}" height="${height}" fill="url(#bgGlow)" />
  <rect width="${width}" height="${height}" fill="url(#cyberGrid)" />

  <path d="M 60 120 L 60 60 L 120 60" fill="none" stroke="${primary}" stroke-width="3" stroke-opacity="0.6"/>
  <path d="M ${width - 60} 120 L ${width - 60} 60 L ${width - 120} 60" fill="none" stroke="${primary}" stroke-width="3" stroke-opacity="0.6"/>
  <path d="M 60 ${height - 120} L 60 ${height - 60} L 120 ${height - 60}" fill="none" stroke="${primary}" stroke-width="3" stroke-opacity="0.6"/>
  <path d="M ${width - 60} ${height - 120} L ${width - 60} ${height - 60} L ${width - 120} ${height - 60}" fill="none" stroke="${primary}" stroke-width="3" stroke-opacity="0.6"/>

  <g transform="translate(80, 140)">
    <rect width="260" height="48" rx="24" fill="#0E131F" stroke="${primary}" stroke-width="1.5" stroke-opacity="0.8"/>
    <circle cx="28" cy="24" r="8" fill="${primary}" filter="url(#glow)"/>
    <text x="50" y="30" fill="#FFFFFF" font-family="${brand.fontFamily}" font-size="18" font-weight="700" letter-spacing="1">FLASH.Ai</text>
    
    <rect x="${width - 320}" y="0" width="160" height="48" rx="24" fill="#131927" stroke="${secondary}" stroke-width="1.5"/>
    <text x="${width - 240}" y="30" fill="${primary}" font-family="${brand.secondaryFontFamily}" font-size="16" font-weight="700" text-anchor="middle">SCENE 0${scene.sceneNumber} / 05</text>
  </g>

  <g transform="translate(80, 360)">
    <rect width="${width - 160}" height="1080" rx="36" fill="#0B0F19" fill-opacity="0.82" stroke="url(#neonGrad)" stroke-width="2.5" />
    
    <rect x="50" y="50" width="360" height="44" rx="10" fill="${primary}" fill-opacity="0.15" stroke="${primary}" stroke-width="1.2"/>
    <text x="70" y="78" fill="${primary}" font-family="${brand.secondaryFontFamily}" font-size="16" font-weight="800" letter-spacing="2">${sectionBadge}</text>

    <foreignObject x="50" y="130" width="${width - 260}" height="420">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #FFFFFF; font-family: ${brand.fontFamily}; font-size: 52px; font-weight: 800; line-height: 1.25; text-shadow: 0 4px 20px rgba(0,0,0,0.8);">
        ${cleanOnScreen}
      </div>
    </foreignObject>

    <g transform="translate(50, 580)">
      <rect width="${width - 260}" height="320" rx="20" fill="#05070B" fill-opacity="0.9" stroke="${primary}" stroke-width="1" stroke-opacity="0.3"/>
      
      <line x1="0" y1="50" x2="${width - 260}" y2="50" stroke="${primary}" stroke-width="0.8" stroke-opacity="0.2"/>
      <circle cx="30" cy="25" r="5" fill="#EF4444"/>
      <circle cx="50" cy="25" r="5" fill="#F59E0B"/>
      <circle cx="70" cy="25" r="5" fill="#10B981"/>
      <text x="100" y="30" fill="#94A3B8" font-family="${brand.secondaryFontFamily}" font-size="14">system://workflow/engine.sh</text>

      <foreignObject x="30" y="70" width="${width - 320}" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: #00F5FF; font-family: ${brand.secondaryFontFamily}; font-size: 20px; line-height: 1.5;">
          &gt; ${cleanDesc}
        </div>
      </foreignObject>
    </g>

    <text x="50" y="980" fill="#64748B" font-family="${brand.secondaryFontFamily}" font-size="18">TIMESTAMP: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s (${scene.duration.toFixed(1)}s)</text>
    <text x="${width - 210}" y="980" fill="${primary}" font-family="${brand.secondaryFontFamily}" font-size="18" text-anchor="end">${scene.animation.toUpperCase()}</text>
  </g>

  <g transform="translate(80, ${height - 240})">
    <rect width="${width - 160}" height="100" rx="24" fill="url(#neonGrad)" />
    <text x="${(width - 160) / 2}" y="60" fill="#000000" font-family="${brand.fontFamily}" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="1">
      ${scene.section === 'cta' ? cleanOnScreen : 'FLASH.Ai // SCALE WITH AUTONOMOUS AI'}
    </text>
  </g>
</svg>`;
  }
}

export function getImageProvider(): IImageProvider {
  return new ProceduralImageProvider();
}
