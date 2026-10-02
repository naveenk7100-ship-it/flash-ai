import React from 'react';
import { useApp } from '../../context/AppContext';
import { CONTENT_PILLARS } from '../../constants/pillars';
import type { GenerationHistoryItem } from '../../types';
import {
  History,
  Trash2,
  CheckSquare,
  Copy,
  RotateCcw
} from 'lucide-react';

interface GenerationHistoryDrawerProps {
  onSelectForReuse: (item: GenerationHistoryItem) => void;
  onDuplicateWithVariation: (item: GenerationHistoryItem) => void;
}

export const GenerationHistoryDrawer: React.FC<GenerationHistoryDrawerProps> = ({
  onSelectForReuse,
  onDuplicateWithVariation
}) => {
  const {
    generationHistory,
    deleteHistoryItem,
    clearHistory,
    addContentItem,
    showToast,
    setActiveTab
  } = useApp();

  if (generationHistory.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center space-y-2">
        <History className="w-6 h-6 text-slate-500 mx-auto" />
        <h4 className="text-xs font-bold text-slate-300">No Generation History Yet</h4>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          Generated hooks, scripts, and captions will be automatically tracked here for 1-click reuse.
        </p>
      </div>
    );
  }

  const handleSendToApproval = (item: GenerationHistoryItem) => {
    addContentItem({
      title: item.topic,
      pillarId: item.pillarId,
      platform: item.platform,
      videoDuration: item.videoDuration,
      tone: item.tone,
      targetAudience: item.targetAudience,
      cta: item.cta,
      status: 'REVIEW',
      variant: item.variant
    });
    setActiveTab('approval');
  };

  const handleCopyHook = (hook: string) => {
    navigator.clipboard.writeText(hook);
    showToast('Copied hook to clipboard', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recent AI Generations ({generationHistory.length})
          </h3>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Clear all generation history?')) {
              clearHistory();
            }
          }}
          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {generationHistory.map((item) => {
          const pillar =
            CONTENT_PILLARS.find((p) => p.id === item.pillarId) || CONTENT_PILLARS[0];
          const timeFormatted = new Date(item.generatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${pillar.badgeBg}`}>
                      {pillar.name}
                    </span>
                    {item.angle && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] font-semibold">
                        Angle: {item.angle}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{timeFormatted}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {item.topic}
                </h4>

                {/* Hook preview */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                  <div className="text-[9px] font-bold text-cyan-400 uppercase flex items-center justify-between">
                    <span>Hook (0-3s)</span>
                    <button
                      onClick={() => handleCopyHook(item.variant.hook)}
                      className="text-slate-400 hover:text-white"
                      title="Copy Hook"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <p className="line-clamp-2 italic">"{item.variant.hook}"</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectForReuse(item)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                    title="Load into generator"
                  >
                    Reuse
                  </button>
                  <button
                    onClick={() => onDuplicateWithVariation(item)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium flex items-center gap-1"
                    title="Rotate angle and generate new variation"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Variant</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSendToApproval(item)}
                    className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Approval ➔</span>
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
