import React, { useState } from 'react';
import { FLASH_AI_BRAND, type BrandConfig } from '../../constants/brandConfig';
import { Sparkles, Camera, Type, Shield, Save, CheckCircle } from 'lucide-react';

interface BrandSettingsPanelProps {
  onSave?: (config: BrandConfig) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BrandSettingsPanel: React.FC<BrandSettingsPanelProps> = ({ onSave, showToast }) => {
  const [config, setConfig] = useState<BrandConfig>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('flash_ai_brand_config');
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return FLASH_AI_BRAND;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('flash_ai_brand_config', JSON.stringify(config));
      }
    } catch {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onSave) onSave(config);
    if (showToast) showToast('FLASH.Ai Brand System configuration saved successfully!', 'success');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. BRAND IDENTITY & INSTAGRAM HANDLE */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              1. Brand Identity & Social Handles
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
            CENTRALIZED CONFIG
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Brand Name</label>
            <input
              type="text"
              value={config.brandName}
              onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Official Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono">@</span>
              <input
                type="text"
                value={config.instagramHandle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    instagramHandle: e.target.value.replace(/^@/, ''),
                    instagramUrl: `https://instagram.com/${e.target.value.replace(/^@/, '')}`
                  })
                }
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Default Aspect Ratio</label>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-cyan-300 font-bold font-mono flex items-center justify-between">
              <span>9:16 Vertical (1080×1920)</span>
              <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/40">REELS</span>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 space-y-1">
            <label className="font-semibold text-slate-300">Content Niche Focus</label>
            <textarea
              rows={2}
              value={config.niche}
              onChange={(e) => setConfig({ ...config, niche: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. TONE & CREATOR PACING */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              2. Tone, Pacing & Reel Duration Standards
            </h3>
          </div>
          <span className="text-xs text-purple-400 font-medium">Fast, Modern & Creator-Like</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Tone Directive</label>
            <input
              type="text"
              value={config.tone.primary}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tone: { ...config.tone, primary: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Target Duration Window</label>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 font-mono flex items-center justify-between">
              <span>{config.formatSpecs.durationRange.minSeconds}s – {config.formatSpecs.durationRange.maxSeconds}s</span>
              <span className="text-[10px] text-emerald-400 font-bold">Target: {config.formatSpecs.durationRange.defaultSeconds}s</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Voiceover Pacing (WPM)</label>
            <input
              type="number"
              min={120}
              max={180}
              value={config.motion.pacingWpm}
              onChange={(e) =>
                setConfig({
                  ...config,
                  motion: { ...config.motion, pacingWpm: parseInt(e.target.value, 10) || 150 }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. TYPOGRAPHY & MOTION SYSTEM */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              3. Typography & Motion Transitions
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">9:16 High-Contrast Subtitles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Primary Font Family</label>
            <input
              type="text"
              value={config.typography.primaryFont}
              onChange={(e) =>
                setConfig({
                  ...config,
                  typography: { ...config.typography, primaryFont: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Subtitle Font Size (px)</label>
            <input
              type="number"
              value={config.typography.subtitleFontSize}
              onChange={(e) =>
                setConfig({
                  ...config,
                  typography: { ...config.typography, subtitleFontSize: parseInt(e.target.value, 10) || 44 }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Default Scene Transition</label>
            <select
              value={config.motion.defaultTransition}
              onChange={(e) =>
                setConfig({
                  ...config,
                  motion: { ...config.motion, defaultTransition: e.target.value as any }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="pop">Pop (Dynamic Punch)</option>
              <option value="zoom_in">Zoom In (Focus demo)</option>
              <option value="slide_left">Slide Left (Workflow shift)</option>
              <option value="ken_burns">Ken Burns (Cinematic image)</option>
              <option value="fade">Smooth Fade</option>
              <option value="cut">Direct Cut (High velocity)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. WATERMARK & BRAND PROTECTION */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              4. Watermark & Brand Overlay
            </h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Anti-Rip Protection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Watermark Text</label>
            <input
              type="text"
              value={config.watermark.text}
              onChange={(e) =>
                setConfig({
                  ...config,
                  watermark: { ...config.watermark, text: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Position</label>
            <select
              value={config.watermark.position}
              onChange={(e) =>
                setConfig({
                  ...config,
                  watermark: { ...config.watermark, position: e.target.value as any }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="top-right">Top Right (Recommended)</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="none">Disabled</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Watermark Opacity ({config.watermark.opacity})</label>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={config.watermark.opacity}
              onChange={(e) =>
                setConfig({
                  ...config,
                  watermark: { ...config.watermark, opacity: parseFloat(e.target.value) }
                })
              }
              className="w-full accent-cyan-400 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Brand Configuration Saved!</span>
          </span>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Brand Settings</span>
        </button>
      </div>
    </form>
  );
};
