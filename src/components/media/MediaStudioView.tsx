/**
 * FLASH.Ai Reel Production Studio & Media Dashboard (Phase 2 - Requirement 12)
 * 
 * Integrated Hub for:
 * 1. Production Queue (active and queued Reel projects)
 * 2. Asset Library (screen recordings, demo clips, screenshots)
 * 3. Reel Editor (scene builder, duration, text overlays, transitions)
 * 4. Preview (9:16 mobile simulator)
 * 5. Export History (rendered MP4/WebM downloads)
 * 6. QC Status (10-gate health report)
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { reelProductionPipeline } from '../../services/reelProductionPipeline';
import { reelExportEngine } from '../../services/reelExportEngine';
import { demoAssetLibrary } from '../../services/demoAssetLibrary';
import { reelTemplateEngine } from '../../services/reelTemplateEngine';
import type {
  ReelProductionProject,
  ExportJob,
  RawMediaAsset
} from '../../types/reelProduction';
import { MobileReelPreview } from './MobileReelPreview';
import { ReelEditor } from './ReelEditor';
import { ReelExportModal } from './ReelExportModal';
import { DemoAssetIngestModal } from './DemoAssetIngestModal';
import {
  Film,
  Sparkles,
  Layers,
  FolderOpen,
  Eye,
  Download,
  CheckCircle2,
  Play,
  Sliders,
  Trash2,
  Monitor
} from 'lucide-react';

export const MediaStudioView: React.FC = () => {
  const { showToast } = useApp();

  const [activeTab, setActiveStudioTab] = useState<
    'queue' | 'editor' | 'preview' | 'assets' | 'history' | 'qc'
  >('queue');

  const [projects, setProjects] = useState<ReelProductionProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportJob[]>([]);
  const [assets, setAssets] = useState<RawMediaAsset[]>([]);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const projs = reelProductionPipeline.getAllProjects();
    setProjects(projs);
    if (projs.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projs[0].id);
    }
    setExportHistory(reelExportEngine.getExportHistory());
    setAssets(demoAssetLibrary.getAllAssets());
  };

  const selectedProject: ReelProductionProject | undefined =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateDemoReel = () => {
    try {
      const demoProj = reelProductionPipeline.createDemoReelProject();
      setProjects(reelProductionPipeline.getAllProjects());
      setSelectedProjectId(demoProj.id);
      setActiveStudioTab('preview');
      showToast('Demo 9:16 Reel project generated with creator assets!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create demo reel', 'error');
    }
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    reelProductionPipeline.deleteProject(id);
    const updated = reelProductionPipeline.getAllProjects();
    setProjects(updated);
    if (selectedProjectId === id) {
      setSelectedProjectId(updated[0]?.id || null);
    }
    showToast('Project removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono">
              PHASE 2 MEDIA ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
              9:16 VERTICAL REEL PIPELINE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              ZERO-CREDENTIAL DEMO MODE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-cyan-400" />
            FLASH.Ai Reel Production Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Automated creator-style vertical Reel pipeline: Scene Planner &bull; Asset Ingestion &bull; Timeline Pacing &bull; Safe-Area Text &bull; Audio Ducking &bull; 10-Gate QC &bull; 9:16 Export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateDemoReel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Demo Reel
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Reel Projects</span>
          <div className="text-2xl font-black text-white">{projects.length}</div>
          <p className="text-[11px] text-cyan-400 font-mono">In Production Queue</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Rendered Exports</span>
          <div className="text-2xl font-black text-emerald-400">{exportHistory.length}</div>
          <p className="text-[11px] text-slate-400 font-mono">9:16 MP4 / WebM</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Asset Pool</span>
          <div className="text-2xl font-black text-purple-300">{assets.length}</div>
          <p className="text-[11px] text-slate-400 font-mono">Screen recordings & UI clips</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Aspect Ratio</span>
          <div className="text-2xl font-black text-cyan-300">9:16</div>
          <p className="text-[11px] text-emerald-400 font-mono">100% Mobile Safe-Area</p>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveStudioTab('queue')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'queue'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Production Queue ({projects.length})
        </button>

        <button
          onClick={() => setActiveStudioTab('editor')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'editor'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Reel Editor
        </button>

        <button
          onClick={() => setActiveStudioTab('preview')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'preview'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          Mobile Preview
        </button>

        <button
          onClick={() => setActiveStudioTab('assets')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'assets'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Asset Library ({assets.length})
        </button>

        <button
          onClick={() => setActiveStudioTab('history')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          Export History ({exportHistory.length})
        </button>

        <button
          onClick={() => setActiveStudioTab('qc')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'qc'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          QC Status
        </button>
      </div>

      {/* TAB 1: PRODUCTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <Film className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Production Queue is Empty</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Generate Demo Reel" to build a 9:16 creator project with screen recordings, or go to Content Planner to plan from AI ideas.
                </p>
              </div>
              <button
                onClick={handleCreateDemoReel}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Instant Demo Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                const tmpl = reelTemplateEngine.getTemplateById(p.templateId);
                const qc = p.qcReport;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`glass-card rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all space-y-4 ${
                      isSelected
                        ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                          {tmpl.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.totalDurationSeconds}s &bull; 9:16
                          </span>
                          <button
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-2">
                        {p.title}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] pt-1">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            qc.passed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {qc.passed ? 'QC Verified' : `${qc.fatalCount} Flags`}
                        </span>
                        <span className="text-slate-500">&bull;</span>
                        <span className="text-slate-400">{p.scenes.length} Scenes</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                          setActiveStudioTab('editor');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Edit Scenes
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                          setActiveStudioTab('preview');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Watch Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REEL EDITOR */}
      {activeTab === 'editor' && selectedProject && (
        <ReelEditor
          project={selectedProject}
          onUpdateProject={(updated) => {
            reelProductionPipeline.updateProject(updated.id, updated);
            setProjects(reelProductionPipeline.getAllProjects());
          }}
          onOpenPreview={() => setActiveStudioTab('preview')}
        />
      )}

      {/* TAB 3: MOBILE PREVIEW */}
      {activeTab === 'preview' && selectedProject && (
        <MobileReelPreview
          project={selectedProject}
          onExport={() => setIsExportModalOpen(true)}
          onEditScene={() => setActiveStudioTab('editor')}
        />
      )}

      {/* TAB 4: ASSET LIBRARY */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Creator asset pool containing screen recordings, UI mockups, terminal executions, and background backdrops.
            </p>
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Ingest Recordings & Demo Footage
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {assets.map((a) => (
              <div
                key={a.id}
                className="glass-card rounded-2xl border border-slate-800 p-2.5 text-center space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="aspect-[9/16] rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                  <img
                    src={a.url}
                    alt={a.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white truncate">{a.name}</p>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase">{a.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {exportHistory.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-2">
              <Download className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Exports Yet</h3>
              <p className="text-xs text-slate-400">
                Click "Export 9:16 Reel" from any preview to package a vertical video file.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {exportHistory.map((job) => (
                <div key={job.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{job.format.toUpperCase()} Video</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        {job.resolution} (9:16)
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Job ID: <span className="font-mono text-cyan-400">{job.id.slice(0, 18)}</span> &bull; {job.durationSeconds}s Duration &bull; {job.fps} FPS
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.outputVideoUrl && (
                      <a
                        href={job.outputVideoUrl}
                        download={`reel_${job.id}.mp4`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: QC STATUS */}
      {activeTab === 'qc' && selectedProject && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Active Project: {selectedProject.title}
              </h3>
              <p className="text-xs text-slate-400">
                Full 10-Gate Quality Control validation status.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedProject.qcReport?.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {selectedProject.qcReport?.passed ? '✓ PASSED (READY TO PUBLISH)' : '✖ REJECTED'}
            </span>
          </div>

          <div className="space-y-2">
            {selectedProject.qcReport?.checks.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  c.passed
                    ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-300'
                    : c.fatal
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{c.name}</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
                      {c.passed ? 'PASS' : c.fatal ? 'FATAL' : 'WARN'}
                    </span>
                  </div>
                  <p className="text-slate-300">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {selectedProject && (
        <ReelExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={selectedProject}
          onExportComplete={() => {
            loadAllData();
          }}
        />
      )}

      {/* Demo Asset Ingest Modal */}
      <DemoAssetIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onAssetsOrganized={(incoming) => {
          if (selectedProject) {
            const template = reelTemplateEngine.getTemplateById(selectedProject.templateId);
            const organized = reelProductionPipeline.createProjectFromPackage({
              reelPackage: {
                id: `pkg-${Date.now()}`,
                topic: selectedProject.topic,
                format: { id: selectedProject.formatId } as any,
                pillarId: selectedProject.pillarId,
                targetAudience: selectedProject.targetAudience,
                aspectRatio: '9:16',
                resolution: { width: 1080, height: 1920 },
                hook: selectedProject.scenes[0]?.textOverlays[0]?.text || selectedProject.topic,
                hookRetentionCue: 'Screen recording demo',
                conceptSummary: selectedProject.title,
                scenes: selectedProject.scenes as any,
                totalDurationSeconds: selectedProject.totalDurationSeconds,
                cta: selectedProject.branding.brandHandle,
                caption: selectedProject.title,
                hashtags: { niche: [], broad: [], viral: [] },
                qcStatus: 'PASSED',
                mode: 'DEMO',
                createdAt: new Date().toISOString()
              },
              templateId: template.id,
              userAssets: incoming
            });
            loadAllData();
            setSelectedProjectId(organized.id);
            setActiveStudioTab('preview');
            showToast('Screen recordings organized into Reel scenes!', 'success');
          }
        }}
      />
    </div>
  );
};
