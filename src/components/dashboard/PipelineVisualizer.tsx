import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lightbulb,
  FileText,
  Sparkles,
  CheckCircle,
  Share2,
  ChevronRight
} from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const { ideas, contentItems, setActiveTab } = useApp();

  const stageCounts = {
    idea: ideas.filter((i) => i.status === 'IDEA').length,
    script: ideas.filter((i) => i.status === 'SCRIPT').length,
    creative: contentItems.filter((c) => c.status === 'CREATIVE').length,
    review: contentItems.filter((c) => c.status === 'REVIEW').length,
    approved: contentItems.filter((c) => c.status === 'APPROVED').length,
    published: contentItems.filter((c) => c.status === 'PUBLISHED').length
  };

  const steps = [
    { key: 'idea', label: 'Idea', count: stageCounts.idea, icon: Lightbulb, color: 'text-blue-400', tab: 'planner' as const },
    { key: 'script', label: 'Script', count: stageCounts.script, icon: FileText, color: 'text-cyan-400', tab: 'planner' as const },
    { key: 'creative', label: 'Creative', count: stageCounts.creative, icon: Sparkles, color: 'text-purple-400', tab: 'generator' as const },
    { key: 'review', label: 'Review', count: stageCounts.review, icon: CheckCircle, color: 'text-amber-400', tab: 'approval' as const, highlight: stageCounts.review > 0 },
    { key: 'approved', label: 'Approved', count: stageCounts.approved, icon: CheckCircle, color: 'text-emerald-400', tab: 'approval' as const },
    { key: 'published', label: 'Published', count: stageCounts.published, icon: Share2, color: 'text-indigo-400', tab: 'analytics' as const }
  ];

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Live Content Pipeline Flow
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('architecture')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
        >
          <span>View Full Engine</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              onClick={() => setActiveTab(step.tab)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                step.highlight
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${step.color}`} />
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    step.count > 0 ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.count}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200">{step.label}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                <span>Step {idx + 1}</span>
                {idx < steps.length - 1 && <span className="text-slate-600 ml-auto">➔</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
