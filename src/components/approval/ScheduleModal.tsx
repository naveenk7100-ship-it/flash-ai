import React, { useState } from 'react';
import type { ContentItem, MediaType } from '../../types';
import { useApp } from '../../context/AppContext';
import { validateMediaForPublishing } from '../../utils/mediaValidator';
import {
  Calendar,
  Clock,
  Globe,
  X,
  Play,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ScheduleModalProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { schedulePublishJob, settings, approveContentItem } = useApp();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState<string>(item.scheduledDate || defaultDate);
  const [scheduledTime, setScheduledTime] = useState<string>(item.scheduledTime || '18:45');
  const [timezone, setTimezone] = useState<string>(settings.publishing?.timezone || 'Asia/Kolkata');
  const [mediaType, setMediaType] = useState<MediaType>(
    item.platform === 'Instagram Carousels'
      ? 'CAROUSEL'
      : item.platform === 'Instagram Single Post'
      ? 'IMAGE'
      : 'REELS'
  );
  const [mediaUrl, setMediaUrl] = useState<string>(
    item.mediaUrl ||
      settings.publishing?.defaultVideoUrl ||
      'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate media
    const val = validateMediaForPublishing(item, mediaUrl, mediaType);
    if (!val.isValid) {
      setValidationError(val.errors.join('. '));
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setValidationError('Please select both a scheduled date and time.');
      return;
    }

    // Ensure item is approved first
    if (item.status !== 'APPROVED') {
      approveContentItem(item.id);
    }

    // Queue in scheduler
    schedulePublishJob(item.id, scheduledDate, scheduledTime, timezone, mediaUrl, mediaType);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="glass-card bg-[#0b0f19] border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Approve & Schedule Publishing
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated publishing will trigger once scheduled timestamp is reached.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSchedule} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Post Title */}
          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Content Item
            </span>
            <div className="font-bold text-slate-100 text-xs sm:text-sm">{item.title}</div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Publishing Date *</span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Publishing Time *</span>
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Timezone (Default: Asia/Kolkata)</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30) [Default]</option>
              <option value="America/New_York">America/New_York (EST/EDT, UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT, UTC-8)</option>
              <option value="Europe/London">Europe/London (GMT/BST, UTC+0)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
            </select>
          </div>

          {/* Media URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Media Source URL ({mediaType}) *</span>
              </span>
              <span className="text-[10px] text-slate-500">Direct CDN Link</span>
            </label>
            <input
              type="url"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://assets.yourcdn.com/reels/video.mp4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Format Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMediaType('REELS')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all ${
                mediaType === 'REELS'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Instagram Reels</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('IMAGE')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all ${
                mediaType === 'IMAGE'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Single Image Post</span>
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Schedule Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
