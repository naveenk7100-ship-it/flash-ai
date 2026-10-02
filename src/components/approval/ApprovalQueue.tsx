import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentItem } from '../../types';
import { ApprovalCard } from './ApprovalCard';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Share2
} from 'lucide-react';

export const ApprovalQueue: React.FC = () => {
  const {
    contentItems,
    approveContentItem,
    setActiveTab,
    updateContentItem,
    showToast
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'>('REVIEW');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'ALL') return contentItems;
    return contentItems.filter((item) => item.status === selectedFilter);
  }, [contentItems, selectedFilter]);

  const pendingCount = contentItems.filter((c) => c.status === 'REVIEW').length;
  const approvedCount = contentItems.filter((c) => c.status === 'APPROVED').length;
  const rejectedCount = contentItems.filter((c) => c.status === 'REJECTED').length;
  const publishedCount = contentItems.filter((c) => c.status === 'PUBLISHED').length;

  const handleApproveAllPending = () => {
    const pending = contentItems.filter((c) => c.status === 'REVIEW');
    if (pending.length === 0) return;
    pending.forEach((item) => approveContentItem(item.id));
    showToast(`Approved all ${pending.length} pending items!`, 'success');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateContentItem(editingItem.id, {
      title: editingItem.title,
      cta: editingItem.cta,
      variant: {
        ...editingItem.variant,
        hook: editingItem.variant.hook,
        shortScript: editingItem.variant.shortScript,
        caption: editingItem.variant.caption
      }
    });
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Approval Queue (Human-in-the-Loop)
            </h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Review AI-generated reels & posts before publication. Maintain 100% brand voice control and accuracy.
          </p>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={handleApproveAllPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Approve All Pending ({pendingCount})</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedFilter('REVIEW')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedFilter === 'REVIEW'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Needs Review ({pendingCount})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('APPROVED')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedFilter === 'APPROVED'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Approved ({approvedCount})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('PUBLISHED')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedFilter === 'PUBLISHED'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Published ({publishedCount})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('REJECTED')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedFilter === 'REJECTED'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Rejected ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-slate-800 text-white border-slate-600'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Items ({contentItems.length})
        </button>
      </div>

      {/* Content Items Queue List */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {selectedFilter === 'REVIEW'
                ? 'No items awaiting review!'
                : `No ${selectedFilter.toLowerCase()} items found.`}
            </h3>
            <p className="text-xs text-slate-400">
              Generate fresh automation content or check the Content Planner.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('generator')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all"
          >
            Launch AI Content Generator
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onEdit={(it) => setEditingItem(it)}
            />
          ))}
        </div>
      )}

      {/* Edit Content Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Edit Generated Content Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Title / Topic</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Retention Hook</label>
                <input
                  type="text"
                  value={editingItem.variant.hook}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      variant: { ...editingItem.variant, hook: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Short Script</label>
                <textarea
                  rows={5}
                  value={editingItem.variant.shortScript}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      variant: { ...editingItem.variant, shortScript: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 font-mono resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Caption</label>
                <textarea
                  rows={4}
                  value={editingItem.variant.caption}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      variant: { ...editingItem.variant, caption: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
