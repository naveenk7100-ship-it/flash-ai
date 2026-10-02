import React, { useState } from 'react';
import type { PlannedDailyItem, DailyRun } from '../../types';
import { automationService } from '../../services/automationService';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Film,
  Clock,
  ShieldCheck,
  RefreshCw,
  Send,
  Play
} from 'lucide-react';

interface DailyApprovalCenterProps {
  currentRun: DailyRun | null;
  onRunUpdated: (run: DailyRun) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  publishingMode: 'DEMO' | 'LIVE';
}

export const DailyApprovalCenter: React.FC<DailyApprovalCenterProps> = ({
  currentRun,
  onRunUpdated,
  showToast,
  publishingMode
}) => {
  const [selectedItem, setSelectedItem] = useState<PlannedDailyItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const items = currentRun?.plannedItems || [];

  const handleApprove = async (item: PlannedDailyItem) => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      const updated = await automationService.approveItem(currentRun.id, item.id);
      if (updated) {
        onRunUpdated(updated);
        showToast(`Approved "${item.topic}". Scheduled for ${item.scheduledTime || '18:00'}.`, 'success');
      }
    } catch {
      showToast('Failed to approve item', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentRun || !selectedItem) return;
    setIsProcessing(true);
    try {
      const updated = await automationService.rejectItem(currentRun.id, selectedItem.id, rejectReason);
      if (updated) {
        onRunUpdated(updated);
        showToast(`Item rejected and moved to archive`, 'info');
      }
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
    } catch {
      showToast('Failed to reject item', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async (item: PlannedDailyItem) => {
    if (!currentRun) return;
    setIsProcessing(true);
    try {
      const updated = await automationService.retryItem(currentRun.id, item.id);
      if (updated) {
        onRunUpdated(updated);
        showToast(`Re-validated QC for "${item.topic}"`, 'success');
      }
    } catch {
      showToast('Failed to retry item', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishAllApproved = async () => {
    if (!currentRun) return;
    const approvedCount = items.filter((i) => i.approvalStatus === 'APPROVED').length;
    if (approvedCount === 0) {
      showToast('No approved items to publish. Approve at least one item first.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const updated = await automationService.publishApprovedItems(currentRun.id);
      if (updated) {
        onRunUpdated(updated);
        showToast(
          `Published ${approvedCount} Reel(s) (${publishingMode} mode). Downstream analytics scheduled.`,
          'success'
        );
      }
    } catch {
      showToast('Publishing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-3">
        <Film className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Content Awaiting Review</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start today's Daily Run in the Control Center to automatically generate AI scripts, render 9:16 vertical Reels, and perform quality control audits.
        </p>
      </div>
    );
  }

  const approvedCount = items.filter((i) => i.approvalStatus === 'APPROVED').length;
  const pendingCount = items.filter((i) => i.approvalStatus === 'PENDING').length;
  const rejectedCount = items.filter((i) => i.approvalStatus === 'REJECTED').length;

  return (
    <div className="space-y-4">
      {/* Header Summary Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-black text-white">Human Approval Gatekeeper</h3>
            <p className="text-[11px] text-slate-400">
              Mandatory review: Zero live posts publish without explicit human confirmation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              {pendingCount} Pending
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {approvedCount} Approved
            </span>
            {rejectedCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                {rejectedCount} Rejected
              </span>
            )}
          </div>

          {approvedCount > 0 && (
            <button
              onClick={handlePublishAllApproved}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-xs font-black shadow-md shadow-emerald-500/20 hover:from-emerald-300 hover:to-teal-400 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {publishingMode === 'LIVE' ? 'Publish Live to Meta' : 'Execute Demo Publish'} ({approvedCount})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Items Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const isApproved = item.approvalStatus === 'APPROVED';
          const isRejected = item.approvalStatus === 'REJECTED';
          const isPending = item.approvalStatus === 'PENDING';
          const qcPassed = item.qcStatus === 'PASSED';

          return (
            <div
              key={item.id || idx}
              className={`glass-card rounded-2xl border p-4 sm:p-5 space-y-3 transition-all ${
                isApproved
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isRejected
                  ? 'border-rose-500/30 bg-rose-950/10 opacity-75'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Meta Tags */}
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">
                    {item.pillar}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {item.angle}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {item.duration}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {qcPassed ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      QC PASSED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-bold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      QC FAILED
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Hook */}
              <div>
                <h4 className="font-extrabold text-sm text-white line-clamp-2">{item.topic}</h4>
                <div className="mt-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-cyan-300 italic font-mono">
                  "{item.hookDirection}"
                </div>
              </div>

              {/* Caption & Hashtags Preview */}
              {item.caption && (
                <div className="text-[11px] text-slate-300 line-clamp-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  {item.caption}
                </div>
              )}

              {/* Empirical Reason & Evidence */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[10px] space-y-1">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Reason:</strong> {item.reason}
                </div>
                <div className="text-cyan-400/90 font-mono">
                  <strong className="text-cyan-300">Evidence:</strong> {item.evidence}
                </div>
              </div>

              {/* Scheduled Time & QC Errors if any */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Target Slot: <strong className="text-white">{item.scheduledTime || '18:00'} IST</strong>
                </span>

                <span className="text-purple-300">CTA: {item.cta}</span>
              </div>

              {item.qcErrors && item.qcErrors.length > 0 && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300">
                  <strong>QC Issues:</strong> {item.qcErrors.join(' • ')}
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {item.mediaUrl && (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>Preview Reel</span>
                    </a>
                  )}

                  {!qcPassed && (
                    <button
                      onClick={() => handleRetry(item)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry QC</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRejectModal(true);
                        }}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 text-xs font-black shadow-md shadow-cyan-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready for Schedule
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-xl">
                      Rejected by Operator
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-5 rounded-3xl border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Reject Item</span>
            </div>

            <p className="text-xs text-slate-300">
              Specify feedback for rejecting <strong>"{selectedItem.topic}"</strong>:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Angle too repetitive, hook needs stronger proof, or incorrect topic focus..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 h-24 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
