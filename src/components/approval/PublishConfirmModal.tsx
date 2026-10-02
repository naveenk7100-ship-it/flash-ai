import React, { useState } from 'react';
import type { ContentItem, MediaType } from '../../types';
import { useApp } from '../../context/AppContext';
import { validateMediaForPublishing } from '../../utils/mediaValidator';
import {
  ShieldAlert,
  Send,
  X,
  Play,
  Image as ImageIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface PublishConfirmModalProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    metaStatus,
    publishingMode,
    publishContentItemNow,
    settings
  } = useApp();

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
      'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43400-large.mp4'
  );

  const [isPublishing, setIsPublishing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetAccount = metaStatus.username
    ? `@${metaStatus.username}`
    : 'FLASH.Ai Official (@flash.ai)';

  const handleConfirmPublish = async () => {
    setValidationError(null);

    // 1. Validate Media
    const val = validateMediaForPublishing(item, mediaUrl, mediaType);
    if (!val.isValid) {
      setValidationError(val.errors.join('. '));
      return;
    }

    setIsPublishing(true);
    try {
      const res = await publishContentItemNow(item.id, mediaUrl, mediaType);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setValidationError(res.error || 'Failed to publish');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error occurred while publishing');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="glass-card bg-[#0b0f19] border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${publishingMode === 'LIVE' ? 'bg-rose-500/15 text-rose-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Confirm Instagram Publishing</span>
                {publishingMode === 'DEMO' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    DEMO — NOT PUBLISHED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    LIVE — META GRAPH API
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Target Account: <strong className="text-cyan-300">{targetAccount}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Live Warning Banner */}
          {publishingMode === 'LIVE' ? (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-100">Live Meta Graph API Publishing Active:</span>
                <p className="text-[11px] text-rose-300/90">
                  This action will immediately upload and publish this media container to your live Instagram profile via official Meta Graph API ({metaStatus.apiVersion}).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-100">Safe Demo Publishing Mode:</span>
                <p className="text-[11px] text-amber-300/90">
                  No real Instagram account will be modified. A simulated container creation, processing, and external media ID will be generated.
                </p>
              </div>
            </div>
          )}

          {/* Content Item Title */}
          <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Post Title
            </span>
            <div className="font-bold text-slate-100 text-sm">{item.title}</div>
          </div>

          {/* Media URL Input & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Media Source URL ({mediaType}) *</span>
              </span>
              <span className="text-[10px] text-slate-500">Public HTTP/HTTPS URL</span>
            </label>
            <input
              type="url"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://your-cdn.com/reels/video.mp4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Format Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMediaType('REELS')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                mediaType === 'REELS'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Instagram Reels</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('IMAGE')}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                mediaType === 'IMAGE'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Single Image Post</span>
            </button>
          </div>

          {/* Caption Preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Caption Preview ({item.variant?.caption?.length || 0} / 2,200 chars)</span>
              <span className="text-emerald-400 font-normal">Includes CTA & Hashtags</span>
            </span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
              {item.variant?.caption || 'No caption available.'}
            </div>
          </div>

          {/* Error message */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isPublishing}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handleConfirmPublish}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 ${
              publishingMode === 'LIVE'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-lg shadow-rose-950/40'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-950/40'
            }`}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Meta Container...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{publishingMode === 'LIVE' ? 'Publish LIVE to Instagram' : 'Simulate Demo Publish Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
