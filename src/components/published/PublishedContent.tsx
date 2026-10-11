import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  ExternalLink,
  RefreshCw,
  Heart,
  MessageCircle,
  Film
} from 'lucide-react';

export const PublishedContent: React.FC = () => {
  const { contentItems, setActiveTab } = useApp();
  const [liveMetaMedia, setLiveMetaMedia] = useState<any[]>([]);
  const [localPublishedReels, setLocalPublishedReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPublishedMedia();
  }, []);

  const fetchPublishedMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/meta/published-media');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLiveMetaMedia(data.media || []);
          setLocalPublishedReels(data.localPublishedRecords || []);
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  // Combine local items marked as PUBLISHED and publishingJobs
  const publishedContentItems = contentItems.filter((item) => item.status === 'PUBLISHED');

  const totalCount = publishedContentItems.length + liveMetaMedia.length + localPublishedReels.length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Published Instagram Reels & Posts
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              {totalCount} Total Archived
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Archive of published Instagram Reels to <strong className="text-slate-200">@flash__ai__digital</strong> with official Meta IDs, permalinks and engagement metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPublishedMedia}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync with Meta API'}</span>
          </button>
        </div>
      </div>

      {/* Live Meta Posts Section (if available) */}
      {liveMetaMedia.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Instagram Posts from Meta Graph API
            </h2>
            <span className="text-xs text-slate-400 font-mono">@flash__ai__digital</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMetaMedia.map((metaItem) => (
              <div
                key={metaItem.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {metaItem.media_type || 'REELS'}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {new Date(metaItem.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                    {metaItem.caption || 'No caption available'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {metaItem.like_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                      {metaItem.comments_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                    ID: {metaItem.id}
                  </span>
                  {metaItem.permalink && (
                    <a
                      href={metaItem.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      <span>Open on IG</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Published Records Section */}
      {localPublishedReels.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" />
            Autonomous Reels Published by Scheduler
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localPublishedReels.map((reel) => (
              <div
                key={reel.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                      9:16 REEL &bull; {reel.durationSeconds || 12}s
                    </span>
                    <span className="text-slate-400 font-mono">
                      {reel.publishedAt ? new Date(reel.publishedAt).toLocaleDateString() : 'Scheduled'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {reel.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {reel.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">
                    Meta Post: {reel.metaPostId || '1784...'}
                  </span>
                  {reel.permalink && (
                    <a
                      href={reel.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold"
                    >
                      <span>View Reel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Empty State */}
      {totalCount === 0 && (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">No Published Content Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Reels will appear here automatically once approved and published at 9:00 PM IST via official Meta Graph API.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-colors"
          >
            Go to Studio Overview ➔
          </button>
        </div>
      )}
    </div>
  );
};
