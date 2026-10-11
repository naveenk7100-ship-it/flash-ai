import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Flame,
  Film,
  Filter
} from 'lucide-react';

export interface DiscoveredTrend {
  id: string;
  title: string;
  source: 'HackerNews' | 'GitHub' | 'DevTo' | 'CuratedPool';
  url: string;
  points?: number;
  comments?: number;
  publishedAt: string;
  category: 'AI_AGENT' | 'MODEL_RELEASE' | 'DEV_WORKFLOW' | 'OPEN_SOURCE' | 'PROMPT_TECHNIQUE';
  angle: 'WORKFLOW_SPEEDRUN' | 'HIDDEN_FEATURE' | 'PERFORMANCE_SHOWCASE' | 'PRACTICAL_BLUEPRINT';
  relevanceScore: number;
  reelConcept?: {
    hook: string;
    targetAudience: string;
    scenes: Array<{
      sceneNumber: number;
      durationSeconds: number;
      heading: string;
      narration: string;
      visualFocus: string;
    }>;
    suggestedFormat: string;
    totalDurationSeconds: number;
    hashtags: string[];
  };
}

export const TrendsFeedView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [trends, setTrends] = useState<DiscoveredTrend[]>([]);
  const [topTrend, setTopTrend] = useState<DiscoveredTrend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends(false);
  }, []);

  const fetchTrends = async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const url = refresh ? '/api/trends/discover?refresh=true' : '/api/trends/discover';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.trends)) {
        setTrends(data.trends);
        setTopTrend(data.topSelectedTrend || data.trends[0] || null);
        setLastFetched(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (refresh) {
          showToast(`Aggregated ${data.trends.length} fresh real trends from Hacker News, GitHub & Dev.to`, 'success');
        }
      } else {
        showToast('Failed to load live trends', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error connecting to Trend Engine', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReelFromTrend = async (trend: DiscoveredTrend) => {
    setIsGeneratingId(trend.id);
    showToast(`Producing 9:16 Reel from trend: "${trend.title.slice(0, 40)}..."`, 'info');
    try {
      const res = await fetch('/api/trends/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trend.title })
      });
      const data = await res.json();
      if (data.success && data.todayReel) {
        showToast(`Reel "${data.todayReel.title}" produced & passed 10-Gate QC!`, 'success');
        setActiveTab('media');
      } else {
        showToast(data.error || 'Failed to generate Reel from trend', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Generation error', 'error');
    } finally {
      setIsGeneratingId(null);
    }
  };

  const filteredTrends = trends.filter((t) => {
    return selectedSource === 'ALL' || t.source.toLowerCase() === selectedSource.toLowerCase();
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'HackerNews':
        return <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-bold">Hacker News</span>;
      case 'GitHub':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">GitHub Trending</span>;
      case 'DevTo':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">Dev.to API</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">Verified Pool</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Autonomous Daily Trend Engine</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE AGGREGATOR
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-source topic discovery from Hacker News, GitHub Trending & Dev.to API with anti-repetition memory.
            {lastFetched && <span className="ml-2 text-slate-500">Synced at {lastFetched}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTrends(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Aggregating...' : 'Refresh Trends'}</span>
          </button>
        </div>
      </div>

      {/* Top Selected Trend Highlight */}
      {topTrend && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Today's #1 Ranked Discovery
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
              Relevance: {topTrend.relevanceScore}/100
            </span>
          </div>

          <h2 className="text-lg font-bold text-white mb-2 leading-tight">
            {topTrend.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
            {getSourceBadge(topTrend.source)}
            <span className="text-slate-500">•</span>
            <span>Category: <strong className="text-slate-300">{topTrend.category}</strong></span>
            <span className="text-slate-500">•</span>
            <span>Angle: <strong className="text-slate-300">{topTrend.angle}</strong></span>
            {topTrend.points ? <span>• {topTrend.points} pts</span> : null}
            {topTrend.comments ? <span>• {topTrend.comments} comments</span> : null}
          </div>

          {topTrend.reelConcept && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="font-semibold text-slate-300">Generated 5-Scene Storyboard Concept:</span>
                <span className="ml-auto font-mono text-[10px] text-cyan-400">{topTrend.reelConcept.totalDurationSeconds}s vertical MP4</span>
              </div>
              <p className="text-xs text-cyan-200 font-medium italic">
                "{topTrend.reelConcept.hook}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {topTrend.reelConcept.scenes.map((sc) => (
                  <div key={sc.sceneNumber} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>S{sc.sceneNumber}</span>
                      <span>{sc.durationSeconds}s</span>
                    </div>
                    <p className="font-medium text-slate-200 line-clamp-1">{sc.heading}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{sc.visualFocus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <a
              href={topTrend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <span>View Original Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => handleGenerateReelFromTrend(topTrend)}
              disabled={isGeneratingId === topTrend.id}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Film className="w-4 h-4" />
              <span>{isGeneratingId === topTrend.id ? 'Producing Reel...' : 'Produce Today\'s Daily Reel ➔'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Sources:</span>
          {['ALL', 'HackerNews', 'GitHub', 'DevTo'].map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSource === src
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {src === 'ALL' ? 'All Sources' : src}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredTrends.length} discovered concepts
        </span>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrends.map((trend) => {
          const isExpanded = expandedConceptId === trend.id;
          const isGeneratingThis = isGeneratingId === trend.id;

          return (
            <div
              key={trend.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getSourceBadge(trend.source)}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(trend.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400 font-bold border border-slate-700">
                    Score: {trend.relevanceScore}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug mb-2">
                  {trend.title}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]">
                    {trend.category}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    {trend.angle}
                  </span>
                </div>

                {trend.reelConcept && (
                  <div className="mt-2 text-xs">
                    <p className="text-slate-300 text-[11px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2">
                      <span className="text-cyan-400 font-semibold">Hook:</span> "{trend.reelConcept.hook}"
                    </p>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Scene-by-Scene Storyboard ({trend.reelConcept.totalDurationSeconds}s)
                        </div>
                        {trend.reelConcept.scenes.map((s) => (
                          <div key={s.sceneNumber} className="p-2 rounded bg-slate-950/80 text-[10px] space-y-0.5 border border-slate-850">
                            <div className="flex justify-between font-bold text-slate-300">
                              <span>Scene {s.sceneNumber}: {s.heading}</span>
                              <span className="text-cyan-400">{s.durationSeconds}s</span>
                            </div>
                            <p className="text-slate-400">Narration: "{s.narration}"</p>
                            <p className="text-slate-500">Visual: {s.visualFocus}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <button
                  onClick={() => setExpandedConceptId(isExpanded ? null : trend.id)}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {isExpanded ? 'Hide Storyboard ▲' : 'View Storyboard ▼'}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Open Source URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleGenerateReelFromTrend(trend)}
                    disabled={isGeneratingThis}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>{isGeneratingThis ? 'Generating...' : 'Produce Reel'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
