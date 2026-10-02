/**
 * FLASH.Ai Reel Export Modal (Phase 2 - Requirement 8)
 * 
 * Supports:
 * - 9:16 vertical resolution configuration (1080x1920, 720x1280)
 * - Format selection (MP4, WebM)
 * - Configurable FPS (30 / 60)
 * - Quality preset (Draft, Balanced, High)
 * - Live step-by-step progress tracking
 * - Download link generation
 */

import React, { useState } from 'react';
import type {
  ReelProductionProject,
  ExportJob
} from '../../types/reelProduction';
import { reelProductionPipeline } from '../../services/reelProductionPipeline';
import { useApp } from '../../context/AppContext';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film
} from 'lucide-react';

interface ReelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ReelProductionProject;
  onExportComplete?: (job: ExportJob) => void;
}

export const ReelExportModal: React.FC<ReelExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportComplete
}) => {
  const { showToast } = useApp();

  const [resolution, setResolution] = useState<'1080x1920' | '720x1280'>('1080x1920');
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [fps, setFps] = useState<30 | 60>(30);
  const [quality, setQuality] = useState<'draft' | 'balanced' | 'high'>('high');
  const [includeAudio, setIncludeAudio] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    const [wStr, hStr] = resolution.split('x');
    const width = parseInt(wStr, 10);
    const height = parseInt(hStr, 10);

    // Update project export settings
    const updated = reelProductionPipeline.updateProject(project.id, {
      exportSettings: {
        aspectRatio: '9:16',
        resolution: { width, height },
        fps,
        format,
        quality,
        includeAudio
      }
    });

    try {
      const completedJob = await reelProductionPipeline.exportProject(
        updated.id,
        (job) => {
          setExportJob({ ...job });
        }
      );

      setExportJob(completedJob);
      setIsExporting(false);
      showToast('Vertical Reel exported successfully!', 'success');
      if (onExportComplete) onExportComplete(completedJob);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMessage(err.message || 'Export failed during video compilation.');
      showToast(err.message || 'Export failed', 'error');
    }
  };

  const handleDownloadFile = () => {
    if (!exportJob?.outputVideoUrl) return;
    const a = document.createElement('a');
    a.href = exportJob.outputVideoUrl;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reel_9x16.${exportJob.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-xl bg-[#090d16] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                EXPORT PIPELINE (9:16)
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              Export Production-Ready Vertical Reel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Form or Progress View */}
        {!isExporting && !exportJob?.outputVideoUrl ? (
          <div className="space-y-4">
            {/* Resolution & Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Mobile Vertical Resolution (9:16)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResolution('1080x1920')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    resolution === '1080x1920'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-white">1080 × 1920 (Full HD)</strong>
                  <span className="text-[10px] text-cyan-400 font-mono">Instagram Preferred</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('720x1280')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    resolution === '720x1280'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-white">720 × 1280 (HD)</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Fast Draft Export</span>
                </button>
              </div>
            </div>

            {/* Format & FPS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="mp4">MP4 (H.264 / AAC)</option>
                  <option value="webm">WebM (VP9 / Opus)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Frame Rate (FPS)
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value, 10) as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={60}>60 FPS (Ultra Smooth)</option>
                </select>
              </div>
            </div>

            {/* Quality Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Encoding Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'balanced', 'draft'] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`p-2 rounded-xl border text-center text-xs uppercase font-bold transition-all ${
                      quality === q
                        ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Burn Audio & Subtitles</span>
                <span className="text-[10px] text-slate-400">Includes background music & ducking</span>
              </div>
              <input
                type="checkbox"
                checked={includeAudio}
                onChange={(e) => setIncludeAudio(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95"
              >
                Start 9:16 Render
              </button>
            </div>
          </div>
        ) : isExporting ? (
          /* Live Progress Display */
          <div className="space-y-5 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {exportJob?.status}
              </h4>
              <p className="text-xs text-cyan-300 font-mono">
                {exportJob?.currentStep}
              </p>
            </div>

            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${exportJob?.progress || 10}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Progress: {exportJob?.progress}% &bull; 9:16 Vertical Video Engine
            </div>
          </div>
        ) : (
          /* Completed Download View */
          <div className="space-y-5 py-2 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-white">
                Render Complete & Validated!
              </h4>
              <p className="text-xs text-slate-400">
                Your 9:16 creator Reel is packaged with burned-in safe-area subtitles, motion transitions, and ducked audio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">Resolution</span>
                <span className="text-cyan-300">{exportJob?.resolution}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Format & FPS</span>
                <span className="text-white">{exportJob?.format.toUpperCase()} @ {exportJob?.fps} FPS</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Duration</span>
                <span className="text-emerald-400">{exportJob?.durationSeconds}s</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Status</span>
                <span className="text-emerald-400">100% READY</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:opacity-95"
              >
                <Download className="w-4 h-4" />
                Download 9:16 Video File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
