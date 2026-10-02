import React, { useState } from 'react';
import type { ContentItem } from '../../types';
import { CONTENT_PILLARS } from '../../constants/pillars';
import { useApp } from '../../context/AppContext';
import { PublishConfirmModal } from './PublishConfirmModal';
import { ScheduleModal } from './ScheduleModal';
import { StoryboardEditorModal } from '../media/StoryboardEditorModal';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Edit3,
  Calendar,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Send,
  ExternalLink,
  ShieldCheck,
  Film
} from 'lucide-react';

interface ApprovalCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({ item, onEdit }) => {
  const {
    approveContentItem,
    rejectContentItem,
    setActiveTab,
    setGeneratorPrefill,
    publishingMode
  } = useApp();

  const [expanded, setExpanded] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStoryboardModalOpen, setIsStoryboardModalOpen] = useState(false);

  const pillar = CONTENT_PILLARS.find((p) => p.id === item.pillarId) || CONTENT_PILLARS[0];

  const handleQuickApprove = () => {
    approveContentItem(item.id);
  };

  const handleReject = () => {
    rejectContentItem(item.id, rejectReason);
    setShowRejectReason(false);
  };

  const handleRegenerate = () => {
    setGeneratorPrefill({
      topic: item.title,
      pillarId: item.pillarId,
      audience: item.targetAudience
    });
    setActiveTab('generator');
  };

  const isPublished = item.status === 'PUBLISHED';
  const isApproved = item.status === 'APPROVED';

  return (
    <>
      <div
        className={`glass-card rounded-2xl border transition-all overflow-hidden ${
          isPublished
            ? 'border-cyan-500/40 bg-cyan-950/10'
            : isApproved
            ? 'border-emerald-500/40 bg-emerald-950/10'
            : item.status === 'REVIEW'
            ? 'border-amber-500/40 bg-amber-950/10'
            : item.status === 'REJECTED'
            ? 'border-rose-500/40 bg-rose-950/10'
            : 'border-slate-800'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${pillar.badgeBg}`}>
                {pillar.name}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                {item.platform} ({item.videoDuration})
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  isPublished
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : isApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : item.status === 'REVIEW'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {item.status}
              </span>
              {item.variant.usedRealAI && (
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>QC Verified</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>
          </div>

          {/* Date / Time / Published Status */}
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && item.publishedUrl && (
              <a
                href={item.publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs text-cyan-300 font-semibold"
              >
                <span>View on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {item.scheduledDate && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 shrink-0 font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {item.scheduledDate} {item.scheduledTime ? `@ ${item.scheduledTime}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Hook Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>0-3s Retention Hook</span>
            </span>
            <p className="text-xs font-bold text-slate-100">"{item.variant.hook}"</p>
            {item.variant.hookRetentionCue && (
              <p className="text-[11px] text-amber-300/90 pt-1">
                <strong>Delivery Cue:</strong> {item.variant.hookRetentionCue}
              </p>
            )}
          </div>

          {/* Concept / Script excerpt */}
          <div className="text-xs text-slate-300 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Video Concept & Target CTA
            </div>
            <p className="line-clamp-2 leading-relaxed text-slate-400">{item.variant.videoConcept}</p>
            <div className="text-xs text-emerald-400 font-semibold pt-1">
              Primary CTA: <strong className="text-white">{item.cta}</strong>
            </div>
          </div>

          {/* Rejection Reason if Rejected */}
          {item.status === 'REJECTED' && item.rejectionReason && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Rejection Feedback:</strong> {item.rejectionReason}
              </div>
            </div>
          )}

          {/* Expand/Collapse Full Script & Caption */}
          {expanded && (
            <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in">
              {/* Script Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Full Script Breakdown</span>
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {item.variant.shortScript}
                </pre>
              </div>

              {/* Caption Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Caption & Hashtags</span>
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {item.variant.caption}
                </div>
              </div>
            </div>
          )}

          {/* Toggle details button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>{expanded ? 'Hide Full Script & Caption' : 'Show Full Script & Caption'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Reject Reason Form */}
          {showRejectReason && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <label className="text-xs font-semibold text-rose-200">
                Reason for Rejection / Revision Note:
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Tone too aggressive, refine hook to mention WhatsApp bot specifically..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowRejectReason(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Left Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            {/* Create / Customize Reel Button */}
            <button
              onClick={() => setIsStoryboardModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              <span>{item.mediaUrl ? '🎬 Preview / Edit Reel' : '🎬 Create 9:16 Reel'}</span>
            </button>

            {item.status !== 'REJECTED' && !isPublished && (
              <button
                onClick={() => setShowRejectReason(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>

          {/* Right Publishing & Scheduling Actions */}
          <div className="flex items-center gap-2">
            {!isApproved && !isPublished && (
              <button
                onClick={handleQuickApprove}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            )}

            {!isPublished && (
              <>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Approve & Schedule</span>
                </button>

                <button
                  onClick={() => {
                    if (!isApproved) approveContentItem(item.id);
                    setIsPublishModalOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95 ${
                    publishingMode === 'LIVE'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-950/40'
                      : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-950/40'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Publish</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Storyboard & Reel Studio Modal */}
      <StoryboardEditorModal
        isOpen={isStoryboardModalOpen}
        onClose={() => setIsStoryboardModalOpen(false)}
        initialTopic={item.title}
        pillarId={item.pillarId}
        variant={item.variant}
        videoDuration={item.videoDuration}
      />

      {/* Explicit Confirmation Publishing Modal */}
      <PublishConfirmModal
        item={item}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Scheduling Modal */}
      <ScheduleModal
        item={item}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </>
  );
};
