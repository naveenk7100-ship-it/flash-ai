import React, { useState, useRef, useEffect } from 'react';
import type { RenderJob, SubtitleCue } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  CheckSquare,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface ReelPreviewProps {
  job: RenderJob;
  onClose?: () => void;
  onEditStoryboard?: () => void;
}

export const ReelPreview: React.FC<ReelPreviewProps> = ({
  job,
  onClose,
  onEditStoryboard
}) => {
  const { addContentItem, showToast, setActiveTab } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const duration = job.duration || job.storyboard.totalDuration || 30;
  const scenes = job.storyboard.scenes || [];
  const subtitles = job.subtitles || [];
  const brand = job.brandPreset;

  // Active scene determination
  useEffect(() => {
    const idx = scenes.findIndex(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    if (idx !== -1 && idx !== activeSceneIndex) {
      setActiveSceneIndex(idx);
    }
  }, [currentTime, scenes, activeSceneIndex]);

  // Playback timer simulation for SVG/Canvas procedural & native MP4s
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - currentTime * 1000;

      const loop = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000;
        if (elapsed >= duration) {
          setCurrentTime(duration);
          setIsPlaying(false);
        } else {
          setCurrentTime(elapsed);
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const handleJumpToScene = (sceneStartTime: number) => {
    setCurrentTime(sceneStartTime);
    setIsPlaying(true);
  };

  // Find active subtitle cue
  const activeCue: SubtitleCue | undefined = subtitles.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const handleSendToApproval = () => {
    const videoUrl = job.outputVideoUrl || `/media/renders/reel_${job.id}.mp4`;

    addContentItem({
      title: job.contentTitle,
      pillarId: job.storyboard.pillarId,
      platform: 'Instagram Reels',
      videoDuration: `${duration}s` as any,
      tone: 'Authoritative & Sharp',
      targetAudience: 'Small business owners & local clinics',
      cta: 'DM "AUTOMATE"',
      status: 'REVIEW',
      mediaUrl: videoUrl,
      mediaType: 'REELS',
      variant: {
        id: `var-${Date.now()}`,
        platform: 'Instagram Reels',
        hook: scenes[0]?.onScreenText || job.contentTitle,
        hookRetentionCue: scenes[0]?.visualDescription,
        videoConcept: job.contentTitle,
        shortScript: scenes.map((s) => s.speechText).join('\n\n'),
        onScreenText: scenes.map((s) => s.onScreenText),
        caption: `🚀 ${job.contentTitle}\n\n${scenes.map((s) => `▪ ${s.onScreenText}`).join('\n')}\n\n👉 DM "AUTOMATE" to install this AI workflow into your business.\n\n#FLASHai #AIBusiness #Automation #BusinessGrowth`,
        cta: 'DM "AUTOMATE"',
        hashtags: {
          niche: ['#AIAutomation', '#BusinessTech', '#FLASHai'],
          broad: ['#Productivity', '#SmallBusinessGrowth'],
          viral: ['#ReelsViral', '#TechInnovation']
        },
        usedRealAI: true,
        qualityScore: 98,
        modelName: 'Gemini 2.0 Flash + FLASH.Ai Media Engine'
      }
    });

    showToast('Reel sent to Human Approval Queue with ready video asset!', 'success');
    setActiveTab('approval');
    if (onClose) onClose();
  };

  const handleDownload = () => {
    if (job.outputVideoUrl) {
      const a = document.createElement('a');
      a.href = job.outputVideoUrl;
      a.download = `${job.contentTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reel.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading Instagram Reel MP4...', 'info');
    } else {
      showToast('Render output available in Media Storage.', 'info');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-5xl mx-auto">
      {/* 9:16 Vertical Reel Player Container */}
      <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto shrink-0">
        <div className="relative aspect-[9/16] rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 bg-[#07090e] flex flex-col justify-between">
          
          {/* Top Reels Safe Overlay Header */}
          <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span className="font-bold text-white tracking-wider">FLASH.Ai REEL</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-black/60 border border-slate-700 text-[10px] text-cyan-300 font-mono">
              9:16 • 1080×1920
            </span>
          </div>

          {/* Video / SVG Scene Stage */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
            {currentScene ? (
              <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center bg-gradient-to-b from-slate-950 via-slate-900 to-black relative">
                {/* Cyber grid background */}
                <div className="absolute inset-0 cyber-grid opacity-25" />
                
                {/* Ambient glow */}
                <div
                  className="absolute w-64 h-64 rounded-full filter blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: brand?.primaryColor || '#00F5FF' }}
                />

                {/* Top Section Tag */}
                <div className="relative z-10 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 uppercase tracking-widest">
                  Scene 0{currentScene.sceneNumber} • {currentScene.section}
                </div>

                {/* Main Dynamic Headline */}
                <h2 className="relative z-10 text-xl sm:text-2xl font-black text-white leading-snug max-w-[280px] drop-shadow-md">
                  {currentScene.onScreenText}
                </h2>

                {/* Visual Direction / HUD Box */}
                <div className="relative z-10 mt-6 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 max-w-[260px] text-left">
                  <span className="text-cyan-400 font-mono text-[10px] block mb-1">
                    &gt; {currentScene.animation.toUpperCase()} ANIMATION
                  </span>
                  {currentScene.visualDescription}
                </div>

                {/* Burned-in Subtitle Overlay (Instagram Safe Zone) */}
                {showSubtitles && activeCue && (
                  <div className="absolute bottom-20 z-30 px-4 w-full flex justify-center">
                    <div className="px-4 py-2 rounded-xl bg-black/90 border border-cyan-500/40 shadow-xl backdrop-blur-md max-w-[90%]">
                      <p className="text-sm font-extrabold text-white tracking-wide uppercase leading-snug">
                        {activeCue.text.split(' ').map((word, wIdx) => {
                          const isEmph = activeCue.emphasisWords?.includes(word);
                          return (
                            <span
                              key={wIdx}
                              className={
                                isEmph ? 'text-cyan-400 drop-shadow-[0_0_8px_#00f5ff]' : 'text-white'
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
            ) : null}
          </div>

          {/* Interactive Play/Pause Big Center Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-25 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all group"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            )}
          </button>

          {/* Bottom Controls Bar */}
          <div className="relative z-30 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2">
            {/* Timeline Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{currentTime.toFixed(1)}s</span>
                <span>{duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                  showSubtitles
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                CC Subtitles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Reel Metadata, Scene Breakdown & Approval Actions */}
      <div className="flex-1 space-y-5 w-full">
        {/* Header Information */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                1080 × 1920 (9:16)
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                H.264 / AAC
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                {duration}s Duration
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Job ID: <span className="text-cyan-400 font-semibold">{job.id.slice(0, 14)}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white">{job.contentTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered with FLASH.Ai automated storyboard composition, dynamic hook retention visual cues, and timed captions.
          </p>
        </div>

        {/* Scene List Inspector */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Storyboard Scene Timeline ({scenes.length} Scenes)
            </h4>
            {onEditStoryboard && (
              <button
                onClick={onEditStoryboard}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                Customize Scenes
              </button>
            )}
          </div>

          <div className="space-y-2">
            {scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => handleJumpToScene(scene.startTime)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        isActive ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {scene.sceneNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white capitalize">{scene.section}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {scene.startTime.toFixed(1)}s - {scene.endTime.toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate max-w-[260px] sm:max-w-md">
                        {scene.onScreenText}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono">
                    {scene.animation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Panel: Approval, Download & Regenerate */}
        <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900 to-indigo-950/20 space-y-4">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Mandatory Human Review Gate
          </div>

          <p className="text-xs text-slate-300">
            This Reel has not been published to Instagram. Approve this video to move it into your scheduled pipeline or publish it immediately.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleSendToApproval}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-sm hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              Send to Approval Queue
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
