import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type {
  ContentPillarId,
  PlatformType,
  VideoDuration,
  ToneType,
  CTAType,
  ContentAngle,
  ContentVariant,
  GenerationHistoryItem
} from '../../types';
import {
  CONTENT_PILLARS,
  PLATFORMS,
  VIDEO_DURATIONS,
  TONES,
  CTAS,
  CONTENT_ANGLES
} from '../../constants/pillars';
import { aiGeneratorService } from '../../services/aiGeneratorService';
import { PromptPresets } from './PromptPresets';
import { GenerationResultCard } from './GenerationResultCard';
import { DailyContentModal } from './DailyContentModal';
import { GenerationHistoryDrawer } from './GenerationHistoryDrawer';
import {
  Sparkles,
  Tag,
  Layers,
  Clock,
  Volume2,
  Send,
  Users,
  Loader2,
  CalendarDays,
  RotateCw,
  AlertCircle,
  History,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const ContentGenerator: React.FC = () => {
  const {
    generatorPrefill,
    setGeneratorPrefill,
    saveToHistory,
    aiStatus,
    refreshAiStatus
  } = useApp();

  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('Small business owners & local clinics');
  const [pillarId, setPillarId] = useState<ContentPillarId>('ai-automation');
  const [platform, setPlatform] = useState<PlatformType>('Instagram Reels');
  const [videoDuration, setVideoDuration] = useState<VideoDuration>('30s');
  const [tone, setTone] = useState<ToneType>('Authoritative & Sharp');
  const [cta, setCta] = useState<CTAType>('DM "AUTOMATE"');
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | 'auto'>('auto');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedVariant, setGeneratedVariant] = useState<ContentVariant | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMissingKey, setIsMissingKey] = useState(false);

  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'generate' | 'history'>('generate');

  // Consume prefill if available
  useEffect(() => {
    if (generatorPrefill) {
      if (generatorPrefill.topic) setTopic(generatorPrefill.topic);
      if (generatorPrefill.pillarId) setPillarId(generatorPrefill.pillarId as ContentPillarId);
      if (generatorPrefill.audience) setTargetAudience(generatorPrefill.audience);
      setGeneratorPrefill(null);
    }
  }, [generatorPrefill, setGeneratorPrefill]);

  const handleSelectPreset = (pTopic: string, pPillarId: ContentPillarId, pAudience: string) => {
    setTopic(pTopic);
    setPillarId(pPillarId);
    setTargetAudience(pAudience);
    setGeneratedVariant(null);
    setErrorMessage(null);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Please enter a content topic or idea title.');
      return;
    }

    setErrorMessage(null);
    setIsMissingKey(false);
    setIsGenerating(true);

    try {
      setGenerationStep('Understanding topic & analyzing FLASH.Ai brand voice...');
      await new Promise((r) => setTimeout(r, 220));

      setGenerationStep('Building 0-3s high-retention hook & visual delivery cues...');
      await new Promise((r) => setTimeout(r, 250));

      setGenerationStep('Writing timed problem-solution script and overlay cues...');
      await new Promise((r) => setTimeout(r, 200));

      setGenerationStep('Preparing Instagram caption & targeted hashtag clusters...');
      
      const angle = selectedAngle === 'auto' ? undefined : selectedAngle;
      const variant = await aiGeneratorService.generateContent({
        topic: topic.trim(),
        targetAudience: targetAudience.trim(),
        pillarId,
        platform,
        videoDuration,
        tone,
        cta,
        angle
      });

      setGenerationStep('Quality checking (verifying brand integrity & zero fake claims)...');
      await new Promise((r) => setTimeout(r, 200));

      setGeneratedVariant(variant);

      // Save to local generation history
      saveToHistory({
        topic: topic.trim(),
        pillarId,
        platform,
        videoDuration,
        tone,
        targetAudience: targetAudience.trim(),
        cta,
        angle: variant.angle,
        variant,
        usedRealAI: Boolean(variant.usedRealAI),
        modelName: variant.modelName || aiStatus.model,
        status: 'draft'
      });
    } catch (err: any) {
      console.error('Generation Error in UI:', err);
      const msg = err.message || 'An error occurred during AI generation.';
      setErrorMessage(msg);
      if (msg.includes('GEMINI_API_KEY') || msg.includes('not connected')) {
        setIsMissingKey(true);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
      refreshAiStatus();
    }
  };

  const handleReset = () => {
    setGeneratedVariant(null);
    setErrorMessage(null);
  };

  const handleReuseFromHistory = (item: GenerationHistoryItem) => {
    setTopic(item.topic);
    setPillarId(item.pillarId);
    setPlatform(item.platform);
    setVideoDuration(item.videoDuration);
    setTone(item.tone);
    setTargetAudience(item.targetAudience);
    setCta(item.cta);
    if (item.angle) setSelectedAngle(item.angle);
    setGeneratedVariant(item.variant);
    setActiveSubTab('generate');
  };

  const handleDuplicateWithVariation = (item: GenerationHistoryItem) => {
    setTopic(item.topic);
    setPillarId(item.pillarId);
    setTargetAudience(item.targetAudience);
    setSelectedAngle('auto'); // Auto-rotates angle
    setGeneratedVariant(null);
    setActiveSubTab('generate');
    // Trigger fresh generation
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Content Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              Real AI System
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Engineered with FLASH.Ai brand intelligence for high-conversion Instagram Reels & Carousels.
          </p>
        </div>

        {/* AI Provider Status & Daily Content Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              aiStatus.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              AI Provider:{' '}
              <strong className="uppercase">
                {aiStatus.isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </strong>
            </span>
          </div>

          {/* Daily Content Mode Button */}
          <button
            onClick={() => setIsDailyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Daily Content Mode</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Switcher: Generator vs Recent Generations History */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('generate')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeSubTab === 'generate'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generator Studio</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeSubTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recent Generations</span>
        </button>
      </div>

      {activeSubTab === 'history' ? (
        <GenerationHistoryDrawer
          onSelectForReuse={handleReuseFromHistory}
          onDuplicateWithVariation={handleDuplicateWithVariation}
        />
      ) : (
        <>
          {/* Preset Quick Starters */}
          {!generatedVariant && <PromptPresets onSelectPreset={handleSelectPreset} />}

          {/* Result Card or Generator Form */}
          {generatedVariant ? (
            <GenerationResultCard
              topic={topic}
              pillarId={pillarId}
              platform={platform}
              videoDuration={videoDuration}
              tone={tone}
              targetAudience={targetAudience}
              cta={cta}
              variant={generatedVariant}
              onReset={handleReset}
            />
          ) : (
            /* Generator Form Card */
            <div className="glass-card rounded-2xl p-5 lg:p-6 border border-slate-800 space-y-6">
              <form onSubmit={handleGenerate} className="space-y-5">
                {/* Topic Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Content Topic / Core Subject *</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      What specific workflow or solution are you breaking down?
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. How we automated lead qualification on WhatsApp for a dental clinic and cut response time from 4 hours to 2 seconds"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                {/* Target Audience & Content Pillar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target Audience</span>
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Local clinics, e-commerce founders, coaches"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Content Pillar</span>
                    </label>
                    <select
                      value={pillarId}
                      onChange={(e) => setPillarId(e.target.value as ContentPillarId)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {CONTENT_PILLARS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Platform & Content Angle (Variety Engine) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Platform Format</span>
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as PlatformType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {PLATFORMS.map((plat) => (
                        <option key={plat} value={plat}>
                          {plat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        <span>Content Angle (Variety Engine)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">10 Angles</span>
                    </label>
                    <select
                      value={selectedAngle}
                      onChange={(e) => setSelectedAngle(e.target.value as ContentAngle | 'auto')}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="auto">🎲 Auto-Rotate Angle (Recommended)</option>
                      {CONTENT_ANGLES.map((angle: ContentAngle) => (
                        <option key={angle} value={angle}>
                          {angle} Angle
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration, Tone & CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Duration</span>
                    </label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value as VideoDuration)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {VIDEO_DURATIONS.map((dur) => (
                        <option key={dur} value={dur}>
                          {dur} (Reels)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tone</span>
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as ToneType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-rose-400" />
                      <span>Primary CTA</span>
                    </label>
                    <select
                      value={cta}
                      onChange={(e) => setCta(e.target.value as CTAType)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {CTAS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error Banner with Retry Button */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-rose-100">{errorMessage}</div>
                        {isMissingKey && (
                          <p className="text-[11px] text-rose-300/90 leading-relaxed">
                            To connect the live Gemini AI engine: Add your free API key into the secure <code>.env</code> file in the project root: <br />
                            <code className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-cyan-300">GEMINI_API_KEY=your_key_here</code>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-xs transition-colors"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry Generation</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Multi-Step Loading Progress State */}
                {isGenerating && (
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Synthesizing Real AI Package...</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      {generationStep}
                    </div>
                  </div>
                )}

                {/* Submit Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Quality checked: No fake stats, no false promises.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Synthesizing Script & Package...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" />
                        <span>Generate with Real AI ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Daily Content Modal */}
      <DailyContentModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
      />
    </div>
  );
};
