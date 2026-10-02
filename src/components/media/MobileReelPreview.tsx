/**
 * FLASH.Ai Mobile Reel Preview Player (Production Grade)
 * 
 * Supports:
 * - Direct Dual-Mode View: [🎬 Finished 9:16 Video (H.264 MP4)] vs [📋 Storyboard Blueprint]
 * - True HTML5 <video> element playback for rendered H.264 MP4 video assets
 * - Synchronized interactive scrubber, audio volume, restart, and word-level kinetic captions
 * - Scene inspector & visual flow breakdown
 * - Zero forced generic CTA overlays (user script is the single source of truth)
 * - Direct export & high-speed MP4 download
 */

import React, { useState, useEffect, useRef } from 'react';
import type {
  ReelProductionProject,
  ProductionTimelineScene,
  CaptionCue
} from '../../types/reelProduction';
import { audioEngine } from '../../services/audioEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  CheckCircle,
  Layers,
  Subtitles,
  Film,
  Sparkles
} from 'lucide-react';

interface MobileReelPreviewProps {
  project: ReelProductionProject;
  onExport?: () => void;
  onEditScene?: (sceneIndex: number) => void;
  videoUrl?: string;
}

export const MobileReelPreview: React.FC<MobileReelPreviewProps> = ({
  project,
  onExport,
  onEditScene,
  videoUrl: explicitVideoUrl
}) => {
  // Resolve video URL from props, export status, or first scene media if .mp4
  const detectedVideoUrl =
    explicitVideoUrl ||
    project.exportStatus?.outputVideoUrl ||
    (project.scenes?.[0]?.media?.url?.endsWith('.mp4') ? project.scenes[0].media.url : undefined);

  const [viewMode, setViewMode] = useState<'video' | 'storyboard'>(
    detectedVideoUrl ? 'video' : 'storyboard'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const duration = project.totalDurationSeconds || 24;
  const scenes = project.scenes || [];
  const captions = project.captions?.cues || [];

  // Determine active scene from currentTime
  useEffect(() => {
    const idx = scenes.findIndex(
      (s) => currentTime >= s.startTimeSeconds && currentTime < s.endTimeSeconds
    );
    if (idx !== -1 && idx !== activeSceneIndex) {
      setActiveSceneIndex(idx);
      if (!isMuted && viewMode === 'storyboard' && scenes[idx]?.audioSettings?.sfxType) {
        audioEngine.playProceduralSfx(scenes[idx].audioSettings.sfxType);
      }
    }
  }, [currentTime, scenes, activeSceneIndex, isMuted, viewMode]);

  // Storyboard timer animation loop (when in storyboard blueprint mode)
  useEffect(() => {
    if (viewMode === 'storyboard' && isPlaying) {
      startTimeRef.current = performance.now() - currentTime * 1000;

      const loop = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000;
        if (elapsed >= duration) {
          setCurrentTime(duration);
          setIsPlaying(false);
        } else {
          setCurrentTime(elapsed);
          animFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, duration, viewMode]);

  const togglePlay = () => {
    if (viewMode === 'video' && videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
        setIsPlaying(true);
      } else {
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    if (viewMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      if (!isMuted) audioEngine.playProceduralSfx('whoosh');
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (viewMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleJumpToScene = (index: number) => {
    const scene = scenes[index];
    if (scene) {
      handleSeek(scene.startTimeSeconds);
      setActiveSceneIndex(index);
      setIsPlaying(true);
      if (viewMode === 'video' && videoRef.current) {
        videoRef.current.currentTime = scene.startTimeSeconds;
        videoRef.current.play().catch(() => {});
      } else if (!isMuted && scene.audioSettings?.sfxType) {
        audioEngine.playProceduralSfx(scene.audioSettings.sfxType);
      }
      if (onEditScene) onEditScene(index);
    }
  };

  const handleDownloadMp4 = () => {
    if (detectedVideoUrl) {
      const a = document.createElement('a');
      a.href = detectedVideoUrl;
      a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reel.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (onExport) {
      onExport();
    }
  };

  // Active caption cue
  const activeCue: CaptionCue | undefined = captions.find(
    (c) => currentTime >= c.startTimeSeconds && currentTime <= c.endTimeSeconds
  );

  const currentScene: ProductionTimelineScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-5xl mx-auto">
      {/* 9:16 Vertical Mobile Device Frame */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] mx-auto shrink-0 select-none">
        
        {/* Mode Selector Pill Toggle */}
        <div className="mb-3 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => {
              setViewMode('video');
              if (videoRef.current && isPlaying) videoRef.current.play().catch(() => {});
            }}
            disabled={!detectedVideoUrl}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'video'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-md shadow-cyan-500/20'
                : detectedVideoUrl
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Finished Video</span>
          </button>

          <button
            onClick={() => {
              setViewMode('storyboard');
              if (videoRef.current) videoRef.current.pause();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'storyboard'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storyboard</span>
          </button>
        </div>

        <div className="relative aspect-[9/16] rounded-[40px] overflow-hidden border-4 border-slate-800 shadow-2xl shadow-cyan-950/40 bg-black flex flex-col justify-between">
          {/* Top Mobile Notch / Speaker */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
            <div className="w-8 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Top Instagram Reels Chrome Header */}
          <div className="relative z-20 pt-8 px-4 pb-2 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-wide">Reels</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
                9:16
              </span>
              {viewMode === 'video' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                  H.264 MP4
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Scene 0{currentScene?.sceneNumber || 1}/0{scenes.length || 4}
            </div>
          </div>

          {/* Video / Visual Stage */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            {viewMode === 'video' && detectedVideoUrl ? (
              /* REAL HTML5 VIDEO PLAYER */
              <div className="w-full h-full relative">
                <video
                  ref={videoRef}
                  src={detectedVideoUrl}
                  playsInline
                  muted={isMuted}
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Subtitle Safe Area Overlay over Video */}
                {showSubtitles && activeCue && (
                  <div className="absolute top-[71%] z-30 px-4 w-full flex justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-xl bg-black/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-[92%]">
                      <p className="text-sm font-extrabold text-white tracking-wide uppercase leading-snug">
                        {activeCue.text.split(' ').map((word, wIdx) => {
                          const isEmph = activeCue.highlightWords?.some(
                            (hw) => hw.toLowerCase() === word.toLowerCase()
                          );
                          return (
                            <span
                              key={wIdx}
                              className={
                                isEmph
                                  ? 'text-cyan-400 drop-shadow-[0_0_8px_#00f5ff] underline underline-offset-4'
                                  : 'text-white'
                              }
                            >
                              {word}{' '}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* STORYBOARD BLUEPRINT VIEW */
              currentScene && (
                <div className="w-full h-full relative flex flex-col justify-center items-center text-center">
                  {/* Media Image / SVG Background */}
                  {currentScene.media?.url && !currentScene.media.url.endsWith('.mp4') ? (
                    <img
                      src={currentScene.media.url}
                      alt={currentScene.media.label || 'Scene Media'}
                      className={`absolute inset-0 w-full h-full object-${currentScene.media.fit || 'cover'} transition-transform duration-700 ${
                        currentScene.animation === 'zoom_in'
                          ? 'scale-105'
                          : currentScene.animation === 'ken_burns'
                          ? 'scale-110 translate-y-2'
                          : 'scale-100'
                      }`}
                    />
                  ) : (
                    <div className="absolute inset-0 cyber-grid bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
                  )}

                  {/* Dark Vignette Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                  {/* Mobile Safe Area Overlay - Scene Label Badge (Top 16% Y) */}
                  <div className="absolute top-[16%] z-20 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-[11px] font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                    {currentScene.block.replace('_', ' ')}
                  </div>

                  {/* Dynamic On-Screen Text Overlay */}
                  <div className="absolute top-[24%] px-6 z-20 max-w-[90%]">
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-in fade-in duration-300">
                      {currentScene.textOverlays?.find((t) => t.type === 'hook' || t.type === 'feature_callout')?.text ||
                        currentScene.textOverlays?.[0]?.text ||
                        project.title}
                    </h2>
                  </div>

                  {/* Burned-in Animated Subtitles (Safe zone 71% Y) */}
                  {showSubtitles && activeCue && (
                    <div className="absolute top-[71%] z-30 px-4 w-full flex justify-center pointer-events-none">
                      <div className="px-4 py-2 rounded-xl bg-black/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md max-w-[92%]">
                        <p className="text-sm font-extrabold text-white tracking-wide uppercase leading-snug">
                          {activeCue.text.split(' ').map((word, wIdx) => {
                            const isEmph = activeCue.highlightWords?.some(
                              (hw) => hw.toLowerCase() === word.toLowerCase()
                            );
                            return (
                              <span
                                key={wIdx}
                                className={
                                  isEmph
                                    ? 'text-cyan-400 drop-shadow-[0_0_8px_#00f5ff] underline underline-offset-4'
                                    : 'text-white'
                                }
                              >
                                {word}{' '}
                              </span>
                            );
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Watermark Logo / Handle */}
                  {project.branding?.watermarkEnabled && (
                    <div className="absolute top-[82%] right-4 z-20 text-[10px] font-mono text-cyan-400/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                      {project.branding.brandHandle}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Interactive Play/Pause Center Tap Area */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-25 flex items-center justify-center bg-black/10 hover:bg-black/25 transition-all group"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/60 group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            )}
          </button>

          {/* Bottom Player Controls & Scrubber */}
          <div className="relative z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2">
            {/* Scrubber Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{currentTime.toFixed(1)}s</span>
                <span>{duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={handleRestart}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                  showSubtitles
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                CC Captions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Information Matrix & Diagnostics */}
      <div className="flex-1 space-y-4 w-full">
        {/* Project Header & Template Info */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 uppercase">
                  {project.templateSelection?.templateName || project.templateId?.toUpperCase()} TEMPLATE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                  {(project.pillarId || 'ai-tools').replace(/-/g, ' ').toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  🔒 REVIEW REQUIRED (21:00 IST)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {project.title}
              </h3>
            </div>

            <button
              onClick={handleDownloadMp4}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">Aspect Ratio</span>
              <strong className="text-white font-mono">{project.aspectRatio} (Vertical)</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Resolution</span>
              <strong className="text-cyan-400 font-mono">1080x1920 (H.264)</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Pacing & Duration</span>
              <strong className="text-emerald-400 font-mono">{duration}s</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">QC Validation</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                {project.qcReport?.passed ? 'Passed (10/10)' : `${project.qcReport?.fatalCount || 0} Flags`}
              </span>
            </div>
          </div>
        </div>

        {/* AI Information & Production Plan Diagnostics */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>AI Information Plan & Production Metadata</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hook Strategy</span>
              <p className="text-white font-medium line-clamp-2">
                "{project.scenes?.[0]?.audioSettings?.voiceoverText || project.scenes?.[0]?.textOverlays?.[0]?.text || project.title}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Why Selected (Template Engine)</span>
              <p className="text-cyan-300 font-medium line-clamp-2">
                {project.templateSelection?.reason || 'Semantically matched with AI tool capabilities and educational pacing.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Voice & Audio Model</span>
              <p className="text-emerald-300 font-medium">
                ElevenLabs Liam (TX3LPaxmHKxFdv7VOQHJ) &bull; ~150 WPM Creator Pacing
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Captions & Visual Flow</span>
              <p className="text-purple-300 font-medium">
                71% Y Safe Zone &bull; Word-Level Kinetic Highlighting &bull; 9:16 Canvas
              </p>
            </div>
          </div>

          {/* Visual Highlights Badges */}
          {project.templateSelection?.visualHighlights && project.templateSelection.visualHighlights.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Visual Highlights:</span>
              {project.templateSelection.visualHighlights.map((hl, hIdx) => (
                <span key={hIdx} className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                  {hl}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scene Timeline Navigator */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Scene Breakdown & Audio Directions</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              Click any scene to jump
            </span>
          </div>

          <div className="space-y-2">
            {scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <div
                  key={scene.id || idx}
                  onClick={() => handleJumpToScene(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isActive
                          ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      0{scene.sceneNumber || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-white">
                          {scene.block}
                        </strong>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {scene.durationSeconds}s
                        </span>
                        <span className="text-[10px] text-slate-400">
                          &bull; {scene.media?.type || 'graphic'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        "{scene.audioSettings?.voiceoverText || scene.textOverlays?.[0]?.text}"
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      SFX: {scene.audioSettings?.sfxType || 'none'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption Cue Inspector */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-purple-400" />
              <span>Current Caption Cue</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Position: {project.captions?.positionYPercent || 71}% Y
            </span>
          </div>
          {activeCue ? (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-white font-bold uppercase tracking-wide">
                "{activeCue.text}"
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {activeCue.startTimeSeconds}s - {activeCue.endTimeSeconds}s
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No subtitle active at {currentTime.toFixed(1)}s</p>
          )}
        </div>
      </div>
    </div>
  );
};
