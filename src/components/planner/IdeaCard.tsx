import React from 'react';
import type { ContentIdea, ContentStatus } from '../../types';
import { CONTENT_PILLARS, CONTENT_STATUSES } from '../../constants/pillars';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Users,
  Layers,
  ChevronDown
} from 'lucide-react';

interface IdeaCardProps {
  idea: ContentIdea;
  onEdit: (idea: ContentIdea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onEdit }) => {
  const { deleteIdea, updateIdea, setActiveTab, setGeneratorPrefill } = useApp();

  const pillar = CONTENT_PILLARS.find((p) => p.id === idea.pillarId) || CONTENT_PILLARS[0];

  const statusColors: Record<ContentStatus, string> = {
    IDEA: 'bg-slate-800 text-slate-300 border-slate-700',
    SCRIPT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    CREATIVE: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    REVIEW: 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    PUBLISHED: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  };

  const handleGenerateClick = () => {
    setGeneratorPrefill({
      topic: idea.title,
      pillarId: idea.pillarId,
      audience: idea.targetAudience
    });
    setActiveTab('generator');
  };

  const handleStatusChange = (newStatus: ContentStatus) => {
    updateIdea(idea.id, { status: newStatus });
  };

  return (
    <div className="glass-card-interactive rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 group relative">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${pillar.badgeBg}`}>
          {pillar.name}
        </span>

        {/* Status Dropdown */}
        <div className="relative inline-block">
          <select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value as ContentStatus)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none appearance-none pr-5 ${statusColors[idea.status]}`}
          >
            {CONTENT_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-[#090d16] text-slate-200">
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
        </div>
      </div>

      {/* Main Title & Notes */}
      <div className="space-y-1.5 flex-1">
        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
          {idea.title}
        </h3>

        {idea.notes && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {idea.notes}
          </p>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-purple-400" />
          <span>{idea.platform}</span>
        </div>

        {idea.estimatedDuration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{idea.estimatedDuration}</span>
          </div>
        )}

        {idea.scheduledDate && (
          <div className="flex items-center gap-1 text-cyan-300">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>{idea.scheduledDate}</span>
          </div>
        )}

        {idea.targetAudience && (
          <div className="hidden sm:flex items-center gap-1 text-slate-400 truncate max-w-[150px]">
            <Users className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{idea.targetAudience}</span>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={handleGenerateClick}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Generate</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(idea)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Edit Idea"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete idea "${idea.title}"?`)) {
                deleteIdea(idea.id);
              }
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Idea"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
