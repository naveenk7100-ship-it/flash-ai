import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Film,
  Mic,
  Calendar,
  Layers,
  ExternalLink,
  X,
  Share2,
  Cpu,
  Bot
} from 'lucide-react';

interface PublicPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  reelTitle?: string;
}

export const PublicPresentationModal: React.FC<PublicPresentationModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  reelTitle
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'architecture' | 'templates'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#100c26] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  FLASH<span className="text-cyan-400">.Ai</span> Showcase & System Presentation
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  v2.0 PRODUCTION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous Short-Form AI Content Engine for <strong className="text-cyan-300">@flash__ai__digital</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/flash__ai__digital"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>@flash__ai__digital</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presentation Navigation Tabs */}
        <div className="relative z-10 flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-950/40">
          {[
            { id: 'overview', label: 'Executive Summary', icon: Sparkles },
            { id: 'pipeline', label: '10-Stage Autonomous Pipeline', icon: Layers },
            { id: 'architecture', label: 'Engine Architecture & Safety', icon: Cpu },
            { id: 'templates', label: '12 Topic-Aware Templates', icon: Film }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Hero */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Autonomous Engine &bull; Human Review Safety Gate</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    High-Conversion AI Discovery Reels on Autopilot
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    FLASH.Ai continuously monitors breakthrough AI tools, synthesizes high-retention 9:16 vertical video storyboards, renders pixel-accurate UI scenes with <strong>Resvg + FFmpeg</strong>, generates natural Gen-Z narration via <strong>ElevenLabs</strong>, and automates 9:00 PM IST publishing to Instagram.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-cyan-400 text-lg font-black block font-mono">1080x1920</span>
                      <span className="text-[11px] text-slate-400 font-semibold">9:16 Vertical HD</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-indigo-400 text-lg font-black block font-mono">21:00 IST</span>
                      <span className="text-[11px] text-slate-400 font-semibold">Daily Prime Slot</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="text-emerald-400 text-lg font-black block font-mono">10-Gate QC</span>
                      <span className="text-[11px] text-slate-400 font-semibold">Human Approval Gate</span>
                    </div>
                  </div>
                </div>

                {/* 9:16 Preview Box */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-[220px] aspect-[9/16] rounded-2xl bg-black border-2 border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col justify-between group">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-4 my-auto text-center space-y-3">
                        <Film className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
                        <span className="text-xs font-bold text-white block">
                          {reelTitle || "Today's Active Production Reel"}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          9:16 Vertical &bull; 24s Duration
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-white font-mono text-[9px]">
                        @flash__ai__digital
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 font-mono text-[9px] font-bold">
                        LIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Strip */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">1. Discovery Engine</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scans AI tool repos, launches, and GitHub trends to discover high-interest daily topics.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">2. Natural Voiceover</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ElevenLabs Liam voice synthesis with dynamic pacing, excitement, and AAC studio muxing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
                    <Film className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">3. Native MP4 Renderer</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Resvg SVG rasterization into 1080x1920 frames with motion, camera zoom, and FFmpeg muxing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">4. Human Approval Gate</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero unapproved posts invariant. Mandatory operator sign-off before 21:00 IST scheduled auto-publish.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">The 10-Stage Content Production Lifecycle</h3>
              <p className="text-xs text-slate-400">
                Every daily Reel progresses through 10 deterministic stages ensuring production grade quality:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  { step: '01', title: 'AI Discovery', desc: 'Identifies trending AI breakthroughs, workflows, and tool comparisons.', status: 'COMPLETED' },
                  { step: '02', title: 'Scripting & Hook', desc: 'Drafts high-retention 3-second hook, problem statement, demo, and CTA.', status: 'COMPLETED' },
                  { step: '03', title: 'Storyboard Composition', desc: 'Assigns visual intent, UI mockups, flowchart layouts, and animation cues.', status: 'COMPLETED' },
                  { step: '04', title: 'Scene Rasterization', desc: 'Resvg converts scalable vector UI layouts into 1080x1920 PNG frames.', status: 'COMPLETED' },
                  { step: '05', title: 'ElevenLabs Voiceover', desc: 'Generates natural studio voiceover (Liam, -8.5 dB loudness normalized).', status: 'COMPLETED' },
                  { step: '06', title: 'Native H.264 Muxing', desc: 'FFmpeg encodes pixel frames with synced audio into high-bitrate MP4.', status: 'COMPLETED' },
                  { step: '07', title: '10-Gate Quality Assurance', desc: 'Automated validation of resolution, audio stream, safe zones, and text contrast.', status: 'PASSED (10/10)' },
                  { step: '08', title: 'Human Review & Approval', desc: 'Operator reviews video & storyboard in dashboard. Approves or requests regen.', status: 'PENDING GATE' },
                  { step: '09', title: '21:00 IST Auto-Schedule', desc: 'Approved Reel queued for precision 9:00 PM Asia/Kolkata peak traffic slot.', status: 'SCHEDULED' },
                  { step: '10', title: 'Meta Graph API Publish', desc: 'Published directly to Instagram Reels container via Meta API v21.0.', status: 'ARMED' },
                ].map((item) => (
                  <div key={item.step} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs shrink-0">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs font-bold text-white">{item.title}</strong>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          item.status.includes('PASSED') || item.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">System Architecture & Production Invariants</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                FLASH.Ai is engineered around strict production safety gates to guarantee brand integrity and reliability.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Safety Invariant 1</span>
                  </div>
                  <strong className="text-sm font-bold text-white block">Human Approval Mandate</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <code className="text-cyan-300">REQUIRE_HUMAN_APPROVAL = true</code> is strictly enforced. No Reel is ever published to Instagram without explicit operator sign-off in the command center.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase">
                    <Film className="w-4 h-4" />
                    <span>Safety Invariant 2</span>
                  </div>
                  <strong className="text-sm font-bold text-white block">Physical File Persistence</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every MP4 and audio file is persistently written to disk in <code className="text-indigo-300">media/renders/</code> and verified before database synchronization.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase">
                    <Calendar className="w-4 h-4" />
                    <span>Safety Invariant 3</span>
                  </div>
                  <strong className="text-sm font-bold text-white block">Asia/Kolkata 21:00 Slot</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The autonomous cron scheduler runs daily at 21:00 IST (Asia/Kolkata), targeting the peak engagement window for AI enthusiasts and tech founders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">12 Topic-Aware 9:16 Video Templates</h3>
              <p className="text-xs text-slate-400">
                The Topic-Aware Template Selector dynamically matches incoming scripts to one of 12 specialized layouts:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {[
                  { name: 'Automation Workflow', cat: 'WORKFLOW', match: 'n8n, make, automation, zapier' },
                  { name: 'Tool Comparison', cat: 'COMPARISON', match: 'vs, alternative, better than' },
                  { name: 'AI News Flash', cat: 'NEWS', match: 'announcement, released, update' },
                  { name: 'Code Walkthrough', cat: 'DEVELOPER', match: 'coding, python, typescript, api' },
                  { name: 'Product Teardown', cat: 'ANALYSIS', match: 'how it works, architecture' },
                  { name: 'Quick Tutorial', cat: 'EDUCATION', match: 'step by step, how to' },
                  { name: 'Prompt Engineering', cat: 'PROMPTING', match: 'prompt, chatgpt, claude' },
                  { name: 'Model Benchmark', cat: 'BENCHMARK', match: 'speed, latency, context' },
                  { name: 'Business Case Study', cat: 'ENTERPRISE', match: 'roi, revenue, business' },
                  { name: 'Agent Architecture', cat: 'AGENTS', match: 'autonomous agent, crewai' },
                  { name: 'Design & UI Canvas', cat: 'CREATIVE', match: 'midjourney, figma, visual' },
                  { name: 'Hardware & Chips', cat: 'HARDWARE', match: 'gpu, nvidia, tpu, local llm' }
                ].map((tmpl, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[9px] font-bold">
                      {tmpl.cat}
                    </span>
                    <strong className="text-xs font-bold text-white block truncate">{tmpl.name}</strong>
                    <p className="text-[10px] text-slate-400 truncate">Keywords: {tmpl.match}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex items-center justify-between p-4 px-6 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Target Account: <strong className="text-white">@flash__ai__digital</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors shadow-md shadow-cyan-500/20"
          >
            Enter Command Center
          </button>
        </div>
      </div>
    </div>
  );
};
