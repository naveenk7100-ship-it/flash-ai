/**
 * FLASH.Ai Template Preview Modal (Topic-Aware Template Engine v2)
 * 
 * Allows operators and creators to inspect the 9:16 layout, pacing,
 * visual elements, and selection reasoning for all 10 production templates:
 * 1. AI Tool Demo
 * 2. Automation Workflow
 * 3. Case Study
 * 4. Product Showcase
 * 5. Trending News / Topic
 * 6. How-To / Tutorial
 * 7. List / Top 5
 * 8. Before vs After
 * 9. Story / Problem-Solution
 * 10. Cinematic Explainer
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layout,
  Clock,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Info,
  Maximize2
} from 'lucide-react';
import type {
  ReelTemplateId,
  TemplateSelectionInfo,
  ReelTemplateDefinition
} from '../../types/reelProduction';
import { reelTemplateRegistry } from '../../services/reelTemplateRegistry';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: ReelTemplateId | string;
  topicTitle?: string;
  selectionInfo?: TemplateSelectionInfo;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  initialTemplateId = 'automation-workflow',
  topicTitle,
  selectionInfo
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<ReelTemplateId>(
    (initialTemplateId as ReelTemplateId) || 'automation-workflow'
  );

  useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId as ReelTemplateId);
    }
  }, [initialTemplateId, isOpen]);

  if (!isOpen) return null;

  const allTemplates = reelTemplateRegistry.getAllTemplates();
  const currentTemplate: ReelTemplateDefinition = reelTemplateRegistry.getTemplateById(selectedTemplateId);
  const previewSvg = reelTemplateRegistry.generateTemplatePreviewSvg(
    selectedTemplateId,
    topicTitle || currentTemplate.sampleHook
  );

  const totalDefaultDuration =
    currentTemplate.defaultPacing.hookDuration +
    currentTemplate.defaultPacing.problemDuration +
    currentTemplate.defaultPacing.demoDuration +
    currentTemplate.defaultPacing.resultDuration +
    currentTemplate.defaultPacing.ctaDuration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-5xl bg-[#090d16] p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                  TOPIC-AWARE TEMPLATE ENGINE v2
                </span>
                <span className="text-xs text-slate-400 font-mono">10 Production Layouts</span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                9:16 Vertical Video Template Layout &amp; Blueprint
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10 Template Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin shrink-0">
          {allTemplates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            const isAutoSelected = selectionInfo?.templateId === tmpl.id;

            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span>{tmpl.name}</span>
                {isAutoSelected && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    Auto
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content: Split Grid (Left: 9:16 Preview, Right: Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Real 9:16 Procedural SVG Layout Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl bg-black border-2 border-cyan-500/50 shadow-2xl overflow-hidden group">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="px-2 py-0.5 rounded-full bg-black/80 text-cyan-300 font-mono text-[10px] backdrop-blur-md border border-cyan-500/30 font-bold">
                  {currentTemplate.category.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-mono text-[10px] backdrop-blur-md border border-slate-700">
                  {totalDefaultDuration}s Target
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-2 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              1080 × 1920 (9:16 Vertical Safe Zones Active)
            </span>
          </div>

          {/* Right 7 Cols: Detailed Layout Spec & Selection Analysis */}
          <div className="lg:col-span-7 space-y-4">
            {/* Auto-Selection Reasoning Card (if matched for current Reel) */}
            {selectionInfo && selectionInfo.templateId === currentTemplate.id && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>TOPIC SELECTION ENGINE ANALYSIS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                    {Math.round(selectionInfo.confidence * 100)}% Confidence Match
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {selectionInfo.reason}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Matched Signals:</span>
                  {selectionInfo.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 font-mono text-[10px] border border-cyan-500/30"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Template Header & Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white">{currentTemplate.name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                  Layout: {currentTemplate.visualLayoutType}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentTemplate.description}
              </p>
            </div>

            {/* Key Visual Highlights */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Visual Features &amp; Motion Elements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentTemplate.keyHighlights.map((hl, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Block Pacing Timeline Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Scene Timeline &amp; Pacing ({totalDefaultDuration}s Total)
                </span>
                <span className="text-[10px] font-mono text-cyan-300">Fast 9:16 Retention Cuts</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 block">Hook</span>
                  <span className="text-xs font-black text-white">{currentTemplate.defaultPacing.hookDuration}s</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-amber-400 block">Problem</span>
                  <span className="text-xs font-black text-white">{currentTemplate.defaultPacing.problemDuration}s</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-indigo-400 block">Demo / Body</span>
                  <span className="text-xs font-black text-white">{currentTemplate.defaultPacing.demoDuration}s</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block">Result</span>
                  <span className="text-xs font-black text-white">{currentTemplate.defaultPacing.resultDuration}s</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-rose-400 block">CTA</span>
                  <span className="text-xs font-black text-white">{currentTemplate.defaultPacing.ctaDuration}s</span>
                </div>
              </div>
            </div>

            {/* Audio, SFX & Safe Zones Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-purple-400" />
                  SFX &amp; Transitions
                </span>
                <p className="text-[11px] text-slate-300 font-mono">
                  SFX: {currentTemplate.soundEffects.slice(0, 3).join(', ')}
                </p>
                <p className="text-[11px] text-slate-300 font-mono">
                  Transitions: {currentTemplate.recommendedTransitions.slice(0, 3).join(', ')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Safe Zones (1080x1920)
                </span>
                <p className="text-[11px] text-slate-300 font-mono">
                  Top Header: {currentTemplate.layoutPreset.safeAreaTopPercent}% Safe
                </p>
                <p className="text-[11px] text-slate-300 font-mono">
                  Subtitles Y: {currentTemplate.layoutPreset.captionYPercent}% Safe
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Creatomate server renders dynamic SVG &amp; MP4 layers automatically.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
