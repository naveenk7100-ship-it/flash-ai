import type { BrandPreset } from '../../src/types/index.js';

export const FLASH_AI_DEFAULT_PRESET: BrandPreset = {
  id: 'flash-ai-default',
  name: 'FLASH.Ai Cyber Dark (Default)',
  isDefault: true,
  primaryColor: '#00F5FF', // Neon Cyan
  secondaryColor: '#7928CA', // Electric Purple
  accentColor: '#FF0080', // Cyber Pink
  backgroundColor: '#07090E', // Ultra Deep Navy/Black
  fontFamily: 'Inter, system-ui, sans-serif',
  secondaryFontFamily: 'JetBrains Mono, monospace',
  logoUrl: '/favicon.svg',
  watermarkText: 'FLASH.Ai Automation',
  watermarkPosition: 'top-right',
  subtitleStyle: {
    fontSize: 48,
    fontColor: '#FFFFFF',
    bgBox: true,
    bgBoxColor: 'rgba(7, 9, 14, 0.85)',
    positionYPercent: 72, // Instagram Reels safe zone
    uppercase: true,
    highlightColor: '#00F5FF',
    fontFamily: 'Inter, sans-serif'
  },
  ctaButtonColor: '#00F5FF',
  ctaTextColor: '#000000'
};

export const BRAND_PRESETS: BrandPreset[] = [
  FLASH_AI_DEFAULT_PRESET,
  {
    id: 'flash-ai-emerald',
    name: 'FLASH.Ai Growth Emerald',
    isDefault: false,
    primaryColor: '#10B981', // Emerald
    secondaryColor: '#06B6D4', // Cyan
    accentColor: '#3B82F6', // Blue
    backgroundColor: '#041611', // Deep Forest Dark
    fontFamily: 'Inter, sans-serif',
    secondaryFontFamily: 'JetBrains Mono, monospace',
    logoUrl: '/favicon.svg',
    watermarkText: 'FLASH.Ai Solutions',
    watermarkPosition: 'top-right',
    subtitleStyle: {
      fontSize: 48,
      fontColor: '#FFFFFF',
      bgBox: true,
      bgBoxColor: 'rgba(4, 22, 17, 0.9)',
      positionYPercent: 72,
      uppercase: true,
      highlightColor: '#10B981',
      fontFamily: 'Inter, sans-serif'
    },
    ctaButtonColor: '#10B981',
    ctaTextColor: '#000000'
  },
  {
    id: 'flash-ai-sunset',
    name: 'FLASH.Ai High Velocity Sunset',
    isDefault: false,
    primaryColor: '#F59E0B', // Amber
    secondaryColor: '#EF4444', // Crimson
    accentColor: '#8B5CF6', // Purple
    backgroundColor: '#0F0B18', // Deep Purple Night
    fontFamily: 'Inter, sans-serif',
    secondaryFontFamily: 'JetBrains Mono, monospace',
    logoUrl: '/favicon.svg',
    watermarkText: 'FLASH.Ai Automation',
    watermarkPosition: 'top-right',
    subtitleStyle: {
      fontSize: 48,
      fontColor: '#FFFFFF',
      bgBox: true,
      bgBoxColor: 'rgba(15, 11, 24, 0.9)',
      positionYPercent: 72,
      uppercase: true,
      highlightColor: '#F59E0B',
      fontFamily: 'Inter, sans-serif'
    },
    ctaButtonColor: '#F59E0B',
    ctaTextColor: '#000000'
  }
];

export function getBrandPresetById(presetId?: string): BrandPreset {
  if (!presetId) return FLASH_AI_DEFAULT_PRESET;
  const found = BRAND_PRESETS.find((p) => p.id === presetId);
  return found || FLASH_AI_DEFAULT_PRESET;
}
