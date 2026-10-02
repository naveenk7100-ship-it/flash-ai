import React, { useState, useEffect } from 'react';
import type {
  VisualStoryboard,
  StoryboardScene,
  ContentVariant,
  ContentPillarId,
  VideoDuration,
  RenderJob,
  VoiceConfig,
  MusicConfig,
  SceneAnimationType,
  MediaAssetType
} from '../../types';
import { mediaGenerationService } from '../../services/mediaGenerationService';
import { ReelPreview } from './ReelPreview';
import { useApp } from '../../context/AppContext';
import {
  X,
  Volume2,
  Music,
  Sliders,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface StoryboardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
  pillarId: ContentPillarId;
  variant: ContentVariant;
  videoDuration: VideoDuration | string;
}

export const StoryboardEditorModal: React.FC<StoryboardEditorModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  pillarId,
  variant,
  videoDuration
}) => {
  const { showToast } = useApp();

  const [storyboard, setStoryboard] = useState<VisualStoryboard | null>(null);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Settings
  const [voiceProvider, setVoiceProvider] = useState<string>('none');
  const [voiceId] = useState<string>('neutral-pro');
  const [musicTrackId, setMusicTrackId] = useState<string>('track-cyber-pulse');
  const [musicVolume, setMusicVolume] = useState<number>(0.12);
  const [brandPresetId, setBrandPresetId] = useState<string>('flash-ai-default');

  // Render Execution State
  const [isRendering, setIsRendering] = useState(false);
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize or fetch storyboard
  useEffect(() => {
    if (isOpen) {
      setIsLoadingStoryboard(true);
      setErrorMessage(null);
      setShowPreview(false);
      setRenderJob(null);

      mediaGenerationService
        .createStoryboard({
          contentId: `content-${Date.now()}`,
          title: initialTopic,
          pillarId,
          variant,
          videoDuration,
          brandPresetId
        })
        .then((sb) => {
          setStoryboard(sb);
          setIsLoadingStoryboard(false);
        })
        .catch((err) => {
          console.error('Failed to create storyboard:', err);
          setErrorMessage(err.message || 'Failed to initialize visual storyboard');
          setIsLoadingStoryboard(false);
        });
    }
  }, [isOpen, initialTopic, pillarId, variant, videoDuration, brandPresetId]);

  if (!isOpen) return null;

  const handleUpdateScene = (
    index: number,
    field: keyof StoryboardScene,
    value: any
  ) => {
    if (!storyboard) return;
    const updatedScenes = [...storyboard.scenes];
    updatedScenes[index] = {
      ...updatedScenes[index],
      [field]: value
    };
    setStoryboard({
      ...storyboard,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    });
  };

  const handleStartRender = async () => {
    if (!storyboard) return;
    setIsRendering(true);
    setErrorMessage(null);

    try {
      const voiceConfig: Partial<VoiceConfig> = {
        provider: voiceProvider as any,
        voiceId,
        language: 'en-US',
        speed: 1.0,
        volume: 1.0
      };

      const musicConfig: Partial<MusicConfig> = {
        trackId: musicTrackId,
        volume: musicVolume,
        enabled: musicTrackId !== 'none'
      };

      const initialJob = await mediaGenerationService.submitRenderJob({
        contentId: storyboard.contentId,
        contentTitle: storyboard.title,
        storyboard,
        voiceConfig,
        musicConfig,
        brandPresetId
      });

      setRenderJob(initialJob);

      // Poll until render completion
      const finalJob = await mediaGenerationService.pollJobUntilComplete(
        initialJob.id,
        (updatedJob) => {
          setRenderJob({ ...updatedJob });
        }
      );

      setRenderJob(finalJob);
      setIsRendering(false);
      setShowPreview(true);
      showToast('Reel rendered successfully! Preview loaded.', 'success');
    } catch (err: any) {
      console.error('Render failed:', err);
      setIsRendering(false);
      setErrorMessage(err.message || 'Render failed during video generation.');
      showToast(err.message || 'Render failed', 'error');
    }
  };

  const currentScene = storyboard?.scenes[activeSceneIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-5xl bg-[#090d16] p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-black text-sm">
              🎬
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                FLASH.Ai Visual Storyboard & Reel Studio
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                  9:16 VERTICAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customizable 5-scene visual pacing, animations, voiceover mix, and subtitle sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error banner if any */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">Render Notification:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Live Rendering Stage Visualizer */}
        {isRendering && renderJob && (
          <div className="my-6 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-sm font-bold text-cyan-200">
                  {renderJob.currentStage}
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {renderJob.progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${renderJob.progress}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 font-mono">
              &gt; {renderJob.stageMessage || 'Processing reel layers...'}
            </p>
          </div>
        )}

        {/* Content Body: Either Storyboard Editor or Reel Preview */}
        {showPreview && renderJob ? (
          <div className="mt-6">
            <ReelPreview
              job={renderJob}
              onClose={onClose}
              onEditStoryboard={() => setShowPreview(false)}
            />
          </div>
        ) : isLoadingStoryboard ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-400">Structuring 5-scene visual storyboard...</p>
          </div>
        ) : storyboard && currentScene ? (
          <div className="mt-6 space-y-6">
            {/* Storyboard Scene Selector Pills */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              {storyboard.scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                    activeSceneIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className="font-mono">0{scene.sceneNumber}</span>
                  <span className="capitalize">{scene.section}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {scene.startTime}s-{scene.endTime}s
                  </span>
                </button>
              ))}
            </div>

            {/* Active Scene Editor Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase">
                    Scene 0{currentScene.sceneNumber}: {currentScene.section}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Duration: {currentScene.duration}s ({currentScene.startTime}s to {currentScene.endTime}s)
                  </span>
                </div>

                {/* Animation and Asset Selectors */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Animation:</span>
                    <select
                      value={currentScene.animation}
                      onChange={(e) =>
                        handleUpdateScene(
                          activeSceneIndex,
                          'animation',
                          e.target.value as SceneAnimationType
                        )
                      }
                      className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 rounded-lg px-2.5 py-1"
                    >
                      <option value="pop">Pop / Snap</option>
                      <option value="zoom_in">Zoom In</option>
                      <option value="slide_left">Slide Left</option>
                      <option value="slide_right">Slide Right</option>
                      <option value="ken_burns">Ken Burns Pacing</option>
                      <option value="fade">Smooth Fade</option>
                      <option value="pulse">Neon Pulse</option>
                      <option value="none">Static</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Asset Type:</span>
                    <select
                      value={currentScene.assetType}
                      onChange={(e) =>
                        handleUpdateScene(
                          activeSceneIndex,
                          'assetType',
                          e.target.value as MediaAssetType
                        )
                      }
                      className="bg-slate-900 border border-slate-700 text-xs text-purple-300 rounded-lg px-2.5 py-1"
                    >
                      <option value="gradient_bg">Gradient Tech Backdrop</option>
                      <option value="ai_image">AI Generated Visual</option>
                      <option value="ui_mockup">UI / Workflow Mockup</option>
                      <option value="text_scene">High-Contrast Text Card</option>
                      <option value="user_image">User Uploaded Image</option>
                      <option value="user_video">User Uploaded Video Clip</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* On-Screen Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Main On-Screen Headline (Shown prominently on 9:16 vertical card)</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentScene.onScreenText.length} chars
                  </span>
                </label>
                <input
                  type="text"
                  value={currentScene.onScreenText}
                  onChange={(e) =>
                    handleUpdateScene(activeSceneIndex, 'onScreenText', e.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Enter hook or scene punchline..."
                />
              </div>

              {/* Visual Cue / Blueprint description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Visual Direction & HUD Demonstration Cue
                </label>
                <textarea
                  rows={2}
                  value={currentScene.visualDescription}
                  onChange={(e) =>
                    handleUpdateScene(activeSceneIndex, 'visualDescription', e.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none resize-none font-mono"
                  placeholder="Describe visual flow or HUD overlay..."
                />
              </div>

              {/* Voiceover Speech Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Voiceover Narration Script (Audio Track & Subtitle Sync)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    ~{Math.round(currentScene.speechText.split(' ').length / 2.2)}s spoken
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={currentScene.speechText}
                  onChange={(e) =>
                    handleUpdateScene(activeSceneIndex, 'speechText', e.target.value)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none resize-none"
                  placeholder="Script spoken during this scene..."
                />
              </div>
            </div>

            {/* Audio & Brand Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Voiceover Config */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Voiceover Engine
                </div>
                <select
                  value={voiceProvider}
                  onChange={(e) => setVoiceProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  <option value="none">No Voiceover (Silent Audio Track)</option>
                  <option value="google">Google Cloud TTS (AI Voice)</option>
                  <option value="elevenlabs">ElevenLabs Studio TTS</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Default voice: Neutral Professional (US English)
                </p>
              </div>

              {/* Background Music */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Music className="w-4 h-4 text-purple-400" />
                    Background Music
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(musicVolume * 100)}% Ducked
                  </span>
                </div>
                <select
                  value={musicTrackId}
                  onChange={(e) => setMusicTrackId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  <option value="track-cyber-pulse">Cybernetic Velocity Pulse</option>
                  <option value="track-deep-focus-ai">Deep Neural Focus</option>
                  <option value="track-future-roi">Autonomous Momentum</option>
                  <option value="track-tech-minimalist">Clean Silicon Minimal</option>
                  <option value="none">No Music (Voice Only)</option>
                </select>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Brand Preset */}
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Brand Visual Theme
                </div>
                <select
                  value={brandPresetId}
                  onChange={(e) => setBrandPresetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5"
                >
                  <option value="flash-ai-default">FLASH.Ai Cyber Dark (#00F5FF)</option>
                  <option value="flash-ai-emerald">FLASH.Ai Growth Emerald (#10B981)</option>
                  <option value="flash-ai-sunset">FLASH.Ai High Velocity Sunset</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Controls subtitle boxes, HUD borders, and logo watermark
                </p>
              </div>
            </div>

            {/* Bottom Render Trigger Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Renders local 1080×1920 MP4 &bull; Enters Approval Queue</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleStartRender}
                  disabled={isRendering}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rendering Reel...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Render 1080×1920 Reel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
