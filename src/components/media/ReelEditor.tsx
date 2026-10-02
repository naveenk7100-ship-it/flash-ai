/**
 * FLASH.Ai Reel Editor & Scene Builder (Phase 2 - Requirements 2 & 10)
 * 
 * Supports editing per scene:
 * - duration
 * - media (video clip, screenshot, screen recording, website demo, text scene, backdrop)
 * - text overlays & mobile safe positioning
 * - motion animation (zoom/pan, ken burns, slide, pop)
 * - transition
 * - audio & SFX settings
 * - Real-time 10-Gate QC status & error remediation
 */

import React, { useState } from 'react';
import type {
  ReelProductionProject,
  ProductionTimelineScene,
  SceneAnimationType,
  SceneTransitionType,
  SoundEffectType
} from '../../types/reelProduction';
import { demoAssetLibrary } from '../../services/demoAssetLibrary';
import { autoEditingEngine } from '../../services/autoEditingEngine';
import { reelTemplateEngine } from '../../services/reelTemplateEngine';
import { reelQCEngine } from '../../services/reelQCEngine';
import {
  Layers,
  Clock,
  Film,
  Volume2,
  CheckCircle2,
  Wand2,
  Eye,
  Type
} from 'lucide-react';

interface ReelEditorProps {
  project: ReelProductionProject;
  onUpdateProject: (updated: ReelProductionProject) => void;
  onOpenPreview?: () => void;
}

export const ReelEditor: React.FC<ReelEditorProps> = ({
  project,
  onUpdateProject,
  onOpenPreview
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [activeEditorTab, setActiveEditorTab] = useState<'scenes' | 'audio' | 'qc' | 'captions'>('scenes');

  const activeScene: ProductionTimelineScene | undefined = project.scenes[selectedSceneIndex];
  const template = reelTemplateEngine.getTemplateById(project.templateId);
  const qcReport = project.qcReport || reelQCEngine.evaluateProject(project);

  const handleUpdateActiveScene = (updates: Partial<ProductionTimelineScene>) => {
    if (!activeScene) return;
    const updatedScenes = [...project.scenes];
    updatedScenes[selectedSceneIndex] = {
      ...activeScene,
      ...updates
    };

    // Recompute total duration & time offsets
    let current = 0;
    const recalculated = updatedScenes.map((s) => {
      const start = current;
      const end = +(start + s.durationSeconds).toFixed(1);
      current = end;
      return {
        ...s,
        startTimeSeconds: start,
        endTimeSeconds: end
      };
    });

    const updatedProject: ReelProductionProject = {
      ...project,
      scenes: recalculated,
      totalDurationSeconds: current,
      updatedAt: new Date().toISOString()
    };
    updatedProject.qcReport = reelQCEngine.evaluateProject(updatedProject);
    onUpdateProject(updatedProject);
  };

  const handleAutoPace = () => {
    const edited = autoEditingEngine.autoEditTimeline({
      scenes: project.scenes,
      targetTotalDurationSeconds: 35,
      template,
      topic: project.topic,
      ctaText: project.branding.brandHandle
    });

    const updated: ReelProductionProject = {
      ...project,
      scenes: edited.scenes,
      totalDurationSeconds: edited.totalDurationSeconds,
      updatedAt: new Date().toISOString()
    };
    updated.qcReport = reelQCEngine.evaluateProject(updated);
    onUpdateProject(updated);
  };

  const handleSelectDemoAsset = (assetId: string) => {
    const asset = demoAssetLibrary.getAssetById(assetId);
    if (!asset || !activeScene) return;

    handleUpdateActiveScene({
      media: {
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        label: asset.name,
        fit: asset.type === 'website_demo' || asset.type === 'screen_recording' ? 'contain' : 'cover',
        scale: 1.0,
        positionX: 50,
        positionY: 50,
        trimStartSeconds: 0,
        trimEndSeconds: asset.durationSeconds || 10
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40">
              REEL EDITOR
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                qcReport.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              QC: {qcReport.passed ? 'ALL CHECKS PASSED' : `${qcReport.fatalCount} VIOLATIONS`}
            </span>
          </div>
          <h2 className="text-lg font-black text-white mt-1">{project.title}</h2>
          <p className="text-xs text-slate-400">
            Total Duration: <span className="text-cyan-300 font-mono font-bold">{project.totalDurationSeconds}s</span> &bull; 9:16 Vertical &bull; Template: <strong className="text-white">{template.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoPace}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-500/30 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Auto-Pace Timeline (35s)
          </button>

          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-extrabold hover:opacity-90 transition-all shadow-md shadow-cyan-500/30"
            >
              <Eye className="w-4 h-4" />
              Open Mobile Preview
            </button>
          )}
        </div>
      </div>

      {/* Editor Subtabs */}
      <div className="flex border-b border-slate-800 gap-3">
        <button
          onClick={() => setActiveEditorTab('scenes')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeEditorTab === 'scenes'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Scene Builder ({project.scenes.length} Scenes)
        </button>

        <button
          onClick={() => setActiveEditorTab('qc')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeEditorTab === 'qc'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          QC Health Inspector ({qcReport.checks.length} Gates)
        </button>
      </div>

      {/* TAB 1: SCENE BUILDER */}
      {activeEditorTab === 'scenes' && activeScene && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scene Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reel Scene Flow (Hook ➔ CTA)
            </h3>
            <div className="space-y-2">
              {project.scenes.map((scene, idx) => {
                const isSelected = idx === selectedSceneIndex;
                return (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedSceneIndex(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        0{scene.sceneNumber}
                      </span>
                      <div>
                        <strong className="text-xs text-white block">{scene.block}</strong>
                        <span className="text-[10px] text-slate-400">
                          {scene.durationSeconds}s &bull; {scene.media.type}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {scene.animation}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Scene Detail Customizer */}
          <div className="lg:col-span-8 space-y-5">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                    SCENE 0{activeScene.sceneNumber}
                  </span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    {activeScene.block} Stage
                  </h4>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {activeScene.startTimeSeconds}s - {activeScene.endTimeSeconds}s
                </div>
              </div>

              {/* 1. Duration Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Scene Duration (Seconds)
                  </label>
                  <span className="font-mono font-bold text-cyan-400">
                    {activeScene.durationSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={activeScene.durationSeconds}
                  onChange={(e) =>
                    handleUpdateActiveScene({ durationSeconds: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 2. Media Asset Chooser */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  Visual Media Source
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {demoAssetLibrary.getAllAssets().map((asset) => {
                    const isAttached = activeScene.media.url === asset.url;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleSelectDemoAsset(asset.id)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                          isAttached
                            ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold text-white truncate block text-[11px]">
                          {asset.name}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono uppercase mt-1">
                          {asset.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Text Overlays */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  On-Screen Headline & Feature Callout
                </label>
                <textarea
                  rows={2}
                  value={activeScene.textOverlays[0]?.text || ''}
                  onChange={(e) => {
                    const updatedOverlays = [...activeScene.textOverlays];
                    if (updatedOverlays[0]) {
                      updatedOverlays[0] = { ...updatedOverlays[0], text: e.target.value };
                    } else {
                      updatedOverlays.push({
                        id: `txt-${Date.now()}`,
                        text: e.target.value,
                        type: 'feature_callout',
                        position: { xPercent: 10, yPercent: 25 },
                        fontSize: 44,
                        fontWeight: 'bold',
                        textColor: '#FFFFFF',
                        animation: 'pop',
                        safeAreaChecked: true
                      });
                    }
                    handleUpdateActiveScene({ textOverlays: updatedOverlays });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Enter hook or headline overlay..."
                />
              </div>

              {/* 4. Voiceover Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Scene Voiceover Script
                </label>
                <textarea
                  rows={2}
                  value={activeScene.audioSettings.voiceoverText}
                  onChange={(e) =>
                    handleUpdateActiveScene({
                      audioSettings: {
                        ...activeScene.audioSettings,
                        voiceoverText: e.target.value
                      }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Enter voiceover speech text..."
                />
              </div>

              {/* 5. Motion, Transition & Sound Effects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Zoom/Pan Motion
                  </label>
                  <select
                    value={activeScene.animation}
                    onChange={(e) =>
                      handleUpdateActiveScene({ animation: e.target.value as SceneAnimationType })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="pop">Pop Impact</option>
                    <option value="zoom_in">Zoom In</option>
                    <option value="ken_burns">Ken Burns Scale</option>
                    <option value="slide_left">Slide Left</option>
                    <option value="pulse">Pulse</option>
                    <option value="none">Static None</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Scene Transition
                  </label>
                  <select
                    value={activeScene.transition.type}
                    onChange={(e) =>
                      handleUpdateActiveScene({
                        transition: {
                          ...activeScene.transition,
                          type: e.target.value as SceneTransitionType
                        }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="pop">Pop In</option>
                    <option value="slide_left">Slide Left</option>
                    <option value="zoom_in">Zoom In</option>
                    <option value="wipe">Wipe</option>
                    <option value="fade">Cross Fade</option>
                    <option value="cut">Hard Cut</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Transition SFX
                  </label>
                  <select
                    value={activeScene.audioSettings.sfxType}
                    onChange={(e) =>
                      handleUpdateActiveScene({
                        audioSettings: {
                          ...activeScene.audioSettings,
                          sfxType: e.target.value as SoundEffectType
                        }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="whoosh">Whoosh</option>
                    <option value="pop">Bubble Pop</option>
                    <option value="click">Tech Click</option>
                    <option value="chime">Positive Chime</option>
                    <option value="none">No Sound</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QC HEALTH INSPECTOR */}
      {activeEditorTab === 'qc' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                10-Gate Phase 2 Quality Control Report
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every Reel must pass all strict validation gates before rendering and publishing.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                qcReport.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {qcReport.passed ? '✓ READY TO EXPORT' : `✖ ${qcReport.fatalCount} FATAL CHECKS FAILED`}
            </span>
          </div>

          <div className="space-y-3">
            {qcReport.checks.map((check) => (
              <div
                key={check.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  check.passed
                    ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-300'
                    : check.fatal
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{check.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        check.passed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : check.fatal
                          ? 'bg-rose-500/30 text-rose-200'
                          : 'bg-amber-500/30 text-amber-200'
                      }`}
                    >
                      {check.passed ? 'PASSED' : check.fatal ? 'FATAL ERROR' : 'WARNING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{check.message}</p>
                  {check.suggestion && !check.passed && (
                    <p className="text-[11px] text-cyan-300 italic pt-1">
                      💡 Suggestion: {check.suggestion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
