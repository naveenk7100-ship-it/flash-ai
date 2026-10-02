import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AutomationSetting, CTAType } from '../../types';
import { CTAS } from '../../constants/pillars';
import { InstagramConnectionPanel } from './InstagramConnectionPanel';
import { BrandSettingsPanel } from './BrandSettingsPanel';
import {
  Sliders,
  Bot,
  Clock,
  Save,
  Eye,
  EyeOff,
  Zap,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, resetAllData } = useApp();
  const [formData, setFormData] = useState<AutomationSetting>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'engine' | 'brand'>('engine');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('All automation and API settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Settings & Brand Hub</h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              {activeSubTab === 'engine' ? 'Official Meta & AI Config' : 'FLASH.Ai Brand System'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Configure Meta Graph API connection, AI intelligence model, FLASH.Ai brand identity, typography, and publishing rules.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'engine'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Engine & API</span>
          </button>
          <button
            onClick={() => setActiveSubTab('brand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'brand'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Settings</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'brand' ? (
        <BrandSettingsPanel showToast={showToast} />
      ) : (
        <>
          {/* 1. OFFICIAL META GRAPH API CONNECTION PANEL */}
          <InstagramConnectionPanel />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 2. AI PROVIDER CONFIGURATION */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100">
                2. AI Provider & Generation Engine
              </h3>
            </div>
            <span className="text-[11px] text-purple-300 font-mono">Multi-Model Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Active AI Engine</label>
              <select
                value={formData.aiProvider.activeProvider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aiProvider: {
                      ...formData.aiProvider,
                      activeProvider: e.target.value as any,
                      model: e.target.value === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o'
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="local">Local Ollama / Self-Hosted</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Model Name</label>
              <input
                type="text"
                value={formData.aiProvider.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aiProvider: { ...formData.aiProvider, model: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Creativity / Temperature ({formData.aiProvider.temperature})
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={formData.aiProvider.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aiProvider: { ...formData.aiProvider, temperature: parseFloat(e.target.value) }
                  })
                }
                className="w-full accent-cyan-400 mt-2"
              />
            </div>

            {/* API Key placeholder */}
            <div className="sm:col-span-3 space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Google Gemini API Key (Loaded server-side from .env)</span>
                <span className="text-[10px] text-slate-500 font-mono">GEMINI_API_KEY</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.aiProvider.apiKeyPlaceholder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiProvider: { ...formData.aiProvider, apiKeyPlaceholder: e.target.value }
                    })
                  }
                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BRAND & CTA PREFERENCES */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                3. Brand Positioning & Default CTA Funnels
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-bold">FLASH.Ai Brand</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Brand Name</label>
              <input
                type="text"
                value={formData.brandPreferences.brandName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brandPreferences: { ...formData.brandPreferences, brandName: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Default CTA Trigger</label>
              <select
                value={formData.brandPreferences.defaultCTA}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brandPreferences: { ...formData.brandPreferences, defaultCTA: e.target.value as CTAType }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200"
              >
                {CTAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Audit / Booking Link</label>
              <input
                type="text"
                value={formData.brandPreferences.customCTALink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brandPreferences: { ...formData.brandPreferences, customCTALink: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">WhatsApp Direct Number</label>
              <input
                type="text"
                value={formData.brandPreferences.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brandPreferences: { ...formData.brandPreferences, whatsappNumber: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 4. PUBLISHING & SAFETY PREFERENCES */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                4. Publishing & Safety Controls
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">Safety First</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Mandatory Human Review</div>
                <div className="text-[11px] text-slate-400">
                  Enforce human sign-off in Approval Queue before publish.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.instagram.requireManualApproval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, requireManualApproval: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Direct Auto-Publishing</div>
                <div className="text-[11px] text-slate-400">
                  Disabled by default for brand protection.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.instagram.autoPublishEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, autoPublishEnabled: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* 5. MEDIA GENERATION & VIDEO RENDERING ENGINE (STEP 4) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🎬</span>
              <h3 className="text-sm font-bold text-slate-100">
                5. Media Engine & Video Compositor Configuration
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">1080×1920 9:16 Vertical</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Voiceover TTS Provider</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200">
                <option value="none">Local Silent Audio Fallback (Default)</option>
                <option value="google">Google Cloud Text-to-Speech</option>
                <option value="elevenlabs">ElevenLabs Studio TTS</option>
              </select>
              <p className="text-[10px] text-slate-500">Configure GOOGLE_TTS_API_KEY or ELEVENLABS_API_KEY in .env</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Background Music Level</label>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                <span className="text-slate-200 font-bold">12% Ducked</span>
                <span className="text-[10px] text-purple-400 font-mono">Voice Over Priority (100%)</span>
              </div>
              <p className="text-[10px] text-slate-500">Royalty-free synthwave/ambient library</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Default Brand Theme Preset</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200">
                <option value="flash-ai-default">FLASH.Ai Cyber Dark (#00F5FF)</option>
                <option value="flash-ai-emerald">FLASH.Ai Growth Emerald (#10B981)</option>
                <option value="flash-ai-sunset">FLASH.Ai Sunset High Velocity</option>
              </select>
              <p className="text-[10px] text-slate-500">Includes safe-zone burned subtitles & logo</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all engine data and settings back to original seed?')) {
                resetAllData();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Reset Engine to Default Seed
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  );
};
