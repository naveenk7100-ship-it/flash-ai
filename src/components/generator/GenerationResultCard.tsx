import React, { useState } from 'react';
import type { ContentVariant, ContentPillarId, PlatformType, VideoDuration, ToneType, CTAType } from '../../types';
import { CONTENT_PILLARS } from '../../constants/pillars';
import { useApp } from '../../context/AppContext';
import { StoryboardEditorModal } from '../media/StoryboardEditorModal';
import { reelProductionPipeline } from '../../services/reelProductionPipeline';
import { reelProductionEngine } from '../../services/reelProductionEngine';
import {
  Copy,
  Check,
  CheckSquare,
  FileText,
  MessageSquare,
  Hash,
  Video,
  Eye,
  Layers,
  ShieldCheck,
  Zap,
  Film
} from 'lucide-react';

interface GenerationResultCardProps {
  topic: string;
  pillarId: ContentPillarId;
  platform: PlatformType;
  videoDuration: VideoDuration;
  tone: ToneType;
  targetAudience: string;
  cta: CTAType;
  variant: ContentVariant;
  onReset: () => void;
}

export const GenerationResultCard: React.FC<GenerationResultCardProps> = ({
  topic,
  pillarId,
  platform,
  videoDuration,
  tone,
  targetAudience,
  cta,
  variant,
  onReset
}) => {
  const { addContentItem, showToast, setActiveTab } = useApp();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveViewTab] = useState<'script' | 'caption' | 'onscreen' | 'hashtags'>('script');
  const [isStoryboardModalOpen, setIsStoryboardModalOpen] = useState(false);

  const pillar = CONTENT_PILLARS.find((p) => p.id === pillarId) || CONTENT_PILLARS[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    showToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyFullPackage = () => {
    const fullText = `=== FLASH.Ai SOCIAL ENGINE PACKAGE ===
TOPIC: ${topic}
PILLAR: ${pillar.name}
PLATFORM: ${platform} (${videoDuration})
TONE: ${tone}
TARGET AUDIENCE: ${targetAudience}
${variant.angle ? `CONTENT ANGLE: ${variant.angle}\n` : ''}
[1. HOOK & RETENTION CUE]
${variant.hook}
Visual Cue: ${variant.hookRetentionCue || 'Direct-to-camera with screen demonstration'}

[2. VIDEO CONCEPT]
${variant.videoConcept}

[3. TIMED SCRIPT]
${variant.shortScript}

[4. ON-SCREEN TEXT]
${variant.onScreenText.join('\n')}

[5. CAPTION]
${variant.caption}

[6. CALL TO ACTION]
${cta}

[7. HASHTAGS]
Niche: ${variant.hashtags.niche.join(' ')}
Broad: ${variant.hashtags.broad.join(' ')}
Viral: ${variant.hashtags.viral.join(' ')}
`;
    handleCopy(fullText, 'Full Content Package');
  };

  const handleSendToApproval = () => {
    addContentItem({
      title: topic,
      pillarId,
      platform,
      videoDuration,
      tone,
      targetAudience,
      cta,
      status: 'REVIEW',
      variant
    });
    setActiveTab('approval');
  };

  const allHashtags = [
    ...variant.hashtags.niche,
    ...variant.hashtags.broad,
    ...variant.hashtags.viral
  ].join(' ');

  return (
    <div className="glass-card rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-950/20 animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-4 p-5 lg:p-6">
      {/* Top Banner with Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${pillar.badgeBg}`}>
              {pillar.name}
            </span>
            {variant.angle && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                Angle: {variant.angle}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              {platform} ({videoDuration})
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>QC Verified</span>
            </span>
          </div>
          <h2 className="text-base lg:text-lg font-black text-white pt-1">
            {topic}
          </h2>
        </div>

        {/* Global Copy All Button */}
        <button
          onClick={handleCopyFullPackage}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition-all shrink-0"
        >
          {copiedSection === 'Full Content Package' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-cyan-400" />
          )}
          <span>Copy All</span>
        </button>
      </div>

      {/* 1. HOOK & VISUAL CUE HIGHLIGHT BOX */}
      <div className="rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Retention Hook (0 - 3s)
            </span>
          </div>
          <button
            onClick={() => handleCopy(variant.hook, 'Hook')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            {copiedSection === 'Hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy Hook</span>
          </button>
        </div>

        <p className="text-sm font-bold text-white leading-snug">
          "{variant.hook}"
        </p>

        {variant.hookRetentionCue && (
          <div className="flex items-center gap-2 text-xs text-slate-300 pt-1.5 border-t border-slate-800/80">
            <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">
              <strong className="text-amber-300">Visual Delivery Cue:</strong> {variant.hookRetentionCue}
            </span>
          </div>
        )}
      </div>

      {/* 2. VIDEO CONCEPT */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-purple-400" />
          <span>Visual Direction & Concept</span>
        </span>
        <p className="text-slate-300 leading-relaxed">
          {variant.videoConcept}
        </p>
      </div>

      {/* Tab Switcher for Script, Caption, On-Screen Text, Hashtags */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveViewTab('script')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'script'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Timed Script</span>
          </button>

          <button
            onClick={() => setActiveViewTab('caption')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'caption'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Formatted Caption</span>
          </button>

          <button
            onClick={() => setActiveViewTab('onscreen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'onscreen'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>On-Screen Text ({variant.onScreenText.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('hashtags')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'hashtags'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Hashtags</span>
          </button>
        </div>

        {/* Tab 1: Script */}
        {activeTab === 'script' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Sectioned script with exact time stamps:</span>
              <button
                onClick={() => handleCopy(variant.shortScript, 'Script')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'Script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Script</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {variant.shortScript}
            </pre>
          </div>
        )}

        {/* Tab 2: Caption */}
        {activeTab === 'caption' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Instagram-optimized caption with bullet spacing & CTA:</span>
              <button
                onClick={() => handleCopy(variant.caption, 'Caption')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'Caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Caption</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {variant.caption}
            </div>
          </div>
        )}

        {/* Tab 3: On Screen Text */}
        {activeTab === 'onscreen' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Timed text overlays for CapCut / Premiere / Reels editor:</span>
              <button
                onClick={() => handleCopy(variant.onScreenText.join('\n'), 'On-Screen Text')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'On-Screen Text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy All Overlays</span>
              </button>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {variant.onScreenText.map((text, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono flex items-center justify-between"
                >
                  <span>{text}</span>
                  <button
                    onClick={() => handleCopy(text, `Overlay #${idx + 1}`)}
                    className="text-slate-400 hover:text-cyan-400 p-1"
                    title="Copy Line"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Hashtags */}
        {activeTab === 'hashtags' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Categorized clusters for organic discovery:</span>
              <button
                onClick={() => handleCopy(allHashtags, 'All Hashtags')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'All Hashtags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy All Hashtags</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Niche */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">Niche / Target</span>
                  <button
                    onClick={() => handleCopy(variant.hashtags.niche.join(' '), 'Niche Hashtags')}
                    className="text-slate-400 hover:text-cyan-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {variant.hashtags.niche.join(' ')}
                </p>
              </div>

              {/* Broad */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Broad Business</span>
                  <button
                    onClick={() => handleCopy(variant.hashtags.broad.join(' '), 'Broad Hashtags')}
                    className="text-slate-400 hover:text-purple-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {variant.hashtags.broad.join(' ')}
                </p>
              </div>

              {/* Viral */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Viral / Trend</span>
                  <button
                    onClick={() => handleCopy(variant.hashtags.viral.join(' '), 'Viral Hashtags')}
                    className="text-slate-400 hover:text-amber-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {variant.hashtags.viral.join(' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Bar & Queue Actions */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors order-2 sm:order-1"
        >
          ← Generate Another Topic
        </button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
          {/* Create Reel Button */}
          <button
            onClick={() => {
              try {
                const pkg = reelProductionEngine.generateReelPackage({
                  topic,
                  pillarId,
                  targetAudience,
                  cta
                });
                reelProductionPipeline.createProjectFromPackage({
                  reelPackage: pkg
                });
              } catch {
                // fallback
              }
              setIsStoryboardModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all active:scale-95"
          >
            <Film className="w-4 h-4 text-cyan-300" />
            <span>🎬 Create 9:16 Reel</span>
          </button>

          {/* Send to Approval */}
          <button
            onClick={handleSendToApproval}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Send to Approval ➔</span>
          </button>
        </div>
      </div>

      {/* Storyboard & Reel Video Creation Modal */}
      <StoryboardEditorModal
        isOpen={isStoryboardModalOpen}
        onClose={() => setIsStoryboardModalOpen(false)}
        initialTopic={topic}
        pillarId={pillarId}
        variant={variant}
        videoDuration={videoDuration}
      />
    </div>
  );
};
