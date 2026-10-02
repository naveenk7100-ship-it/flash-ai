import React from 'react';
import { AUTOMATION_PIPELINE_STAGES } from '../../services/automationPipeline';
import { useApp } from '../../context/AppContext';
import {
  GitBranch,
  Sparkles,
  Lock
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const { setActiveTab } = useApp();

  const statusBadge = {
    active: { label: 'Active & Functional', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    manual_review: { label: 'Human-in-the-Loop', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    ready: { label: 'Foundation Ready', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    pending_integration: { label: 'Step 2 Meta API Hook', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              10-Stage Automation Architecture
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              FLASH.Ai Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            The complete end-to-end operational pipeline from viral topic discovery to closed business revenue.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('generator')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md shadow-cyan-500/25 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Generator</span>
        </button>
      </div>

      {/* Architecture Visual Diagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUTOMATION_PIPELINE_STAGES.map((stage, idx) => {
          const badge = statusBadge[stage.status];

          return (
            <div
              key={stage.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    STAGE #{idx + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {stage.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Sub-steps checklist */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Engine Sub-Processes:
                </div>
                {stage.substeps.map((sub, sIdx) => (
                  <div key={sIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-cyan-400 font-mono mt-0.5">•</span>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Protocol Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0c162c] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">Zero Unsafe Automation Guarantee</h4>
            <p className="text-[11px] text-slate-400">
              No browser scraping or unofficial Instagram reverse-engineering is used. Built strictly for the official Meta Graph API container publish flow.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 shrink-0"
        >
          View API Hook Config
        </button>
      </div>
    </div>
  );
};
