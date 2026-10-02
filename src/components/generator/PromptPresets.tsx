import React from 'react';
import type { ContentPillarId } from '../../types';
import { CONTENT_PILLARS } from '../../constants/pillars';
import { Sparkles } from 'lucide-react';

interface PromptPresetsProps {
  onSelectPreset: (topic: string, pillarId: ContentPillarId, audience: string) => void;
}

export const PromptPresets: React.FC<PromptPresetsProps> = ({ onSelectPreset }) => {
  const presets = [
    {
      topic: '5 AI Tools That Save Hours Every Week',
      pillarId: 'ai-tools' as ContentPillarId,
      audience: 'Creators, developers & tech enthusiasts'
    },
    {
      topic: 'New AI Models & Features You Should Know This Week',
      pillarId: 'ai-news-update' as ContentPillarId,
      audience: 'Tech founders, developers & builders'
    },
    {
      topic: 'How AI Can Turn a Messy Spreadsheet Into Useful Insights',
      pillarId: 'ai-automation' as ContentPillarId,
      audience: 'Data analysts, managers & operators'
    },
    {
      topic: 'Top Useful AI Websites for Everyday Productivity',
      pillarId: 'ai-tools' as ContentPillarId,
      audience: 'Students, professionals & builders'
    },
    {
      topic: 'How Autonomous AI Workflows Actually Connect APIs',
      pillarId: 'flash-builds' as ContentPillarId,
      audience: 'Engineers & workflow builders'
    },
    {
      topic: 'Claude vs GPT: Key Differences in 30 Seconds',
      pillarId: 'ai-tools' as ContentPillarId,
      audience: 'AI practitioners & software engineers'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-300">FLASH.Ai Viral Angles (1-Click Fill):</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p, idx) => {
          const pillar = CONTENT_PILLARS.find((pil) => pil.id === p.pillarId);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset(p.topic, p.pillarId, p.audience)}
              className="text-left px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-all group flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="truncate max-w-xs">{p.topic}</span>
              {pillar && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {pillar.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
