import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONTENT_PILLARS } from '../../constants/pillars';
import {
  Share2,
  ExternalLink,
  Calendar,
  Filter,
  Copy,
  Check
} from 'lucide-react';

export const PublishedContent: React.FC = () => {
  const { contentItems, publishingJobs, showToast, setActiveTab } = useApp();
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine items marked as PUBLISHED and publishingJobs with status PUBLISHED
  const publishedItems = contentItems.filter((item) => item.status === 'PUBLISHED');

  const filteredItems = publishedItems.filter((item) => {
    if (selectedPillar === 'ALL') return true;
    return item.pillarId === selectedPillar;
  });

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied External Media ID: ${id}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Published Content
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              {publishedItems.length} Live / Demo Posts
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Archive of all published Instagram Reels & Carousels with external Meta post IDs and permalinks.
          </p>
        </div>

        {/* Pillar Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Content Pillars</option>
            {CONTENT_PILLARS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">No Published Content Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Approve and publish items from the Approval Queue to view your published Instagram posts here.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('approval')}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-colors"
          >
            Go to Approval Queue ➔
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const pillar =
              CONTENT_PILLARS.find((p) => p.id === item.pillarId) || CONTENT_PILLARS[0];
            const relatedJob = publishingJobs.find(
              (j) => j.contentId === item.id && j.status === 'PUBLISHED'
            );

            const externalId =
              item.publishedMediaId || relatedJob?.externalMediaId || '18029384756192834';
            const permalink =
              item.publishedUrl || relatedJob?.permalink;
            const isDemo = relatedJob ? relatedJob.isDemo : true;

            const publishedDateFormatted = item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recently Published';

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl border border-slate-800 hover:border-cyan-500/40 p-5 space-y-4 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pillar.badgeBg}`}>
                        {pillar.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                        {item.platform}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isDemo
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isDemo ? 'DEMO — NOT PUBLISHED' : 'LIVE ON INSTAGRAM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{publishedDateFormatted}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Caption excerpt */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-slate-300 text-xs line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {item.variant?.caption}
                  </div>

                  {/* External Media ID */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-mono">
                      Meta ID: <strong className="text-slate-200">{externalId}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyId(externalId)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy ID"
                    >
                      {copiedId === externalId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>CTA:</span>
                    <strong className="text-emerald-400">{item.cta}</strong>
                  </div>

                  {permalink && (
                    <a
                      href={permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors"
                    >
                      <span>View on Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
