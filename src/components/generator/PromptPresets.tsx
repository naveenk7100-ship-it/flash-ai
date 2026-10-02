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
      topic: 'How to automate 24/7 client booking on WhatsApp with zero code',
      pillarId: 'whatsapp-automation' as ContentPillarId,
      audience: 'Local clinics, salons, and dental practices'
    },
    {
      topic: 'Why your website gets 5,000 visitors but 0 phone calls (and how AI chat fixes it)',
      pillarId: 'website-solutions' as ContentPillarId,
      audience: 'Small business owners & home service contractors'
    },
    {
      topic: '3 manual business tasks costing you $1,500/month in wasted staff hours',
      pillarId: 'ai-automation' as ContentPillarId,
      audience: 'Founders, agency owners & operations managers'
    },
    {
      topic: 'How we turn Instagram Reel comments into qualified sales calls in 3 seconds',
      pillarId: 'lead-generation' as ContentPillarId,
      audience: 'Coaches, consultants & high-ticket B2B service firms'
    },
    {
      topic: 'FLASH.Ai Build Demo: Live Inbound Lead Hunter & Auto-Qualifier',
      pillarId: 'flash-builds' as ContentPillarId,
      audience: 'Growth-focused founders seeking custom digital workflows'
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
