import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { intelligenceService } from '../../services/intelligenceService';
import type {
  ContentPerformanceItem,
  ContentPatternGroup,
  AIAnalysisReport,
  ContentRecommendation,
  ContentExperiment,
  FatigueWarning,
  DailyIntelligenceBrief,
  SyncStatusInfo
} from '../../types';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Bookmark,
  Eye,
  Heart,
  HelpCircle,
  ArrowRight,
  Split,
  AlertTriangle,
  Info,
  Layers,
  Filter
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const {
    publishingJobs,
    setActiveTab,
    publishingMode,
    setGeneratorPrefill,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'patterns' | 'brief' | 'recommendations' | 'experiments' | 'health'
  >('overview');

  const [items, setItems] = useState<ContentPerformanceItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo | null>(null);
  const [patterns, setPatterns] = useState<{
    byPillar: ContentPatternGroup[];
    byAngle: ContentPatternGroup[];
    byDuration: ContentPatternGroup[];
    byHookType: ContentPatternGroup[];
    byCTA: ContentPatternGroup[];
    byDayOfWeek: ContentPatternGroup[];
    totalSampleCount: number;
  }>({
    byPillar: [],
    byAngle: [],
    byDuration: [],
    byHookType: [],
    byCTA: [],
    byDayOfWeek: [],
    totalSampleCount: 0
  });

  const [selectedPatternDimension, setSelectedPatternDimension] = useState<
    'pillar' | 'angle' | 'duration' | 'hookType' | 'cta' | 'dayOfWeek'
  >('pillar');

  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);
  const [dailyBrief, setDailyBrief] = useState<DailyIntelligenceBrief | null>(null);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [experiments, setExperiments] = useState<ContentExperiment[]>([]);
  const [fatigueData, setFatigueData] = useState<{
    warnings: FatigueWarning[];
    diversityScore: number;
    healthyPillarsCount: number;
  }>({ warnings: [], diversityScore: 100, healthyPillarsCount: 1 });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [selectedCpiItem, setSelectedCpiItem] = useState<ContentPerformanceItem | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [pillarFilter, setPillarFilter] = useState<string>('ALL');
  const [angleFilter, setAngleFilter] = useState<string>('ALL');
  const [durationFilter, setDurationFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAllIntelligenceData();
  }, []);

  const loadAllIntelligenceData = async () => {
    try {
      const [
        perfItems,
        syncInf,
        patternData,
        recs,
        exps,
        fatigue,
        brief
      ] = await Promise.all([
        intelligenceService.getPerformanceItems(),
        intelligenceService.getSyncStatus(),
        intelligenceService.getObservedPatterns(),
        intelligenceService.getRecommendations(),
        intelligenceService.getExperiments(),
        intelligenceService.checkContentFatigue(),
        intelligenceService.getDailyBrief()
      ]);

      setItems(perfItems);
      setSyncStatus(syncInf);
      setPatterns(patternData);
      setRecommendations(recs);
      setExperiments(exps);
      setFatigueData(fatigue);
      setDailyBrief(brief);
    } catch (err) {
      console.error('Failed to load performance intelligence:', err);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const published = publishingJobs
        .filter((j) => j.status === 'PUBLISHED')
        .map((j) => ({
          contentId: j.contentId,
          mediaId: j.externalMediaId,
          title: j.contentTitle,
          pillarId: j.pillarId,
          publishedAt: j.completedAt || j.createdAt,
          permalink: j.permalink
        }));

      await intelligenceService.triggerSync(published);
      await loadAllIntelligenceData();
      showToast('Performance metrics synced from Meta Graph API', 'success');
    } catch {
      showToast('Failed to sync performance metrics', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunAIAnalyst = async () => {
    setIsAnalyzing(true);
    try {
      const report = await intelligenceService.runAIAnalysis();
      if (report) {
        setAiReport(report);
        const updatedBrief = await intelligenceService.getDailyBrief();
        setDailyBrief(updatedBrief);
        const updatedRecs = await intelligenceService.getRecommendations();
        setRecommendations(updatedRecs);
        showToast('Gemini Performance Analyst report generated!', 'success');
      }
    } catch {
      showToast('AI analysis error', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseRecommendation = (rec: ContentRecommendation) => {
    intelligenceService.updateRecommendationStatus(rec.id, 'DRAFT_CREATED');
    setGeneratorPrefill({
      topic: rec.recommendedTopic,
      pillarId: rec.recommendedPillar,
      audience: 'Small businesses and founders looking for AI automation'
    });
    setActiveTab('generator');
    showToast(`Loaded "${rec.recommendedTopic}" into Content Generator`, 'info');
  };

  const isLiveData = syncStatus?.isLiveConnected && publishingMode === 'LIVE';

  // Filtered Performance Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesPillar = pillarFilter === 'ALL' || item.pillarId === pillarFilter;
      const matchesAngle = angleFilter === 'ALL' || item.angle === angleFilter;
      const matchesDuration = durationFilter === 'ALL' || item.duration === durationFilter;

      if (!matchesPillar || !matchesAngle || !matchesDuration) return false;

      if (dateFilter === 'all') return true;
      const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
      const cutoff = Date.now() - days * 86400000;
      const itemTime = new Date(item.publishedAt).getTime();
      return isNaN(itemTime) || itemTime >= cutoff;
    });
  }, [items, dateFilter, pillarFilter, angleFilter, durationFilter]);

  // Aggregate Metrics across filtered items
  const totalReach = filteredItems.reduce((sum, i) => sum + (i.metrics.reach || 0), 0);
  const totalLikes = filteredItems.reduce((sum, i) => sum + i.metrics.likes, 0);
  const totalComments = filteredItems.reduce((sum, i) => sum + i.metrics.comments, 0);
  const totalSaves = filteredItems.reduce((sum, i) => sum + i.metrics.saves, 0);
  const totalShares = filteredItems.reduce((sum, i) => sum + i.metrics.shares, 0);
  const totalLeads = filteredItems.reduce((sum, i) => sum + i.attributedLeadsCount, 0);
  const totalPipeline = filteredItems.reduce((sum, i) => sum + i.attributedPipelineValue, 0);
  const totalWon = filteredItems.reduce((sum, i) => sum + i.attributedWonValue, 0);

  const totalEngagements = totalLikes + totalComments + totalSaves + totalShares;
  const overallEngRate = totalReach > 0
    ? Number(((totalEngagements / totalReach) * 100).toFixed(2))
    : 0;

  const currentPatternList = useMemo(() => {
    switch (selectedPatternDimension) {
      case 'pillar':
        return patterns.byPillar;
      case 'angle':
        return patterns.byAngle;
      case 'duration':
        return patterns.byDuration;
      case 'hookType':
        return patterns.byHookType;
      case 'cta':
        return patterns.byCTA;
      case 'dayOfWeek':
        return patterns.byDayOfWeek;
      default:
        return patterns.byPillar;
    }
  }, [patterns, selectedPatternDimension]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* 1. Top Banner: Data Quality, Status, and Sync Trigger */}
      <div
        className={`glass-card p-5 sm:p-6 rounded-3xl border transition-all ${
          isLiveData
            ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30'
            : 'border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono">
                STEP 6 PERFORMANCE INTELLIGENCE
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                  isLiveData
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLiveData ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'
                  }`}
                />
                <span>{isLiveData ? 'LIVE META GRAPH API STREAMING' : 'DEMO PERFORMANCE DATASET'}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Content Performance Intelligence & Optimization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real Meta Graph API analytics, empirical content pattern recognition, transparent Content Performance Indexing (CPI), and Gemini-powered optimization briefings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Insights...' : 'Sync Graph API'}</span>
            </button>

            <button
              onClick={handleRunAIAnalyst}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black text-xs font-extrabold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Analyzing Data...' : 'Run AI Analyst'}</span>
            </button>
          </div>
        </div>

        {/* Sync Info Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Last Sync:{' '}
              <strong className="text-slate-200">
                {syncStatus?.lastSuccessfulSync
                  ? new Date(syncStatus.lastSuccessfulSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Active'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Observed Posts: <strong className="text-cyan-300">{items.length} items</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Diversity Health:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                fatigueData.diversityScore >= 80
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : fatigueData.diversityScore >= 50
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {fatigueData.diversityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Reach */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Reach</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalReach.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Unique accounts</p>
        </div>

        {/* Engagement Rate */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Engagement Rate</span>
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-pink-300">
            {overallEngRate}%
          </div>
          <p className="text-[10px] text-pink-400 font-mono">{totalEngagements.toLocaleString()} total interactions</p>
        </div>

        {/* Total Saves */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Saves</span>
            <Bookmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300">
            {totalSaves.toLocaleString()}
          </div>
          <p className="text-[10px] text-purple-400 font-mono">High-intent intent saves</p>
        </div>

        {/* Instagram Inbound Leads */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Inbound Leads</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {totalLeads}
          </div>
          <p className="text-[10px] text-amber-400 font-mono">Synced to Lead CRM</p>
        </div>

        {/* Pipeline Value */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            ₹{(totalPipeline / 1000).toFixed(0)}k
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">₹{(totalWon / 1000).toFixed(0)}k closed won</p>
        </div>

        {/* Published Posts */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Analyzed Posts</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-300">
            {filteredItems.length}
          </div>
          <p className="text-[10px] text-blue-400 font-mono">{dateFilter.toUpperCase()} window</p>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation Bar */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Performance Index Matrix (CPI)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patterns')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'patterns'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Observed Patterns ({patterns.totalSampleCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('brief')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'brief'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Performance Analyst & Daily Brief</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'recommendations'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>AI Recommendations ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('experiments')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'experiments'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Split className="w-3.5 h-3.5" />
          <span>Controlled Experiments ({experiments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'health'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Fatigue & Health ({fatigueData.warnings.length})</span>
        </button>
      </div>

      {/* 4. Global Filters Bar */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Date Filter */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            {(['7d', '30d', '90d', 'all'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  dateFilter === d
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Pillar Filter */}
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Pillars</option>
            <option value="ai-automation">AI Automation</option>
            <option value="whatsapp-automation">WhatsApp Automation</option>
            <option value="business-growth">Business Growth</option>
            <option value="lead-generation">Lead Generation</option>
            <option value="website-solutions">Website Solutions</option>
            <option value="ai-tools">AI Tools</option>
          </select>

          {/* Angle Filter */}
          <select
            value={angleFilter}
            onChange={(e) => setAngleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Angles</option>
            <option value="Problem">Problem</option>
            <option value="Mistake">Mistake</option>
            <option value="How-to">How-to</option>
            <option value="Demo">Demo</option>
            <option value="Case study">Case study</option>
            <option value="Comparison">Comparison</option>
          </select>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Durations</option>
            <option value="15s">15s Reels</option>
            <option value="30s">30s Reels</option>
            <option value="60s">60s Reels</option>
          </select>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Explain CPI Formula & Math</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: OVERVIEW & CPI PERFORMANCE MATRIX */}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Insufficient Data for Current Filter</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No published posts match the selected date or pillar filters. Reset filters or sync latest Meta insights.
              </p>
              <button
                onClick={() => {
                  setDateFilter('all');
                  setPillarFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Content & Hook</th>
                      <th className="p-4">Pillar & Angle</th>
                      <th className="p-4">Reach / Views</th>
                      <th className="p-4">Saves / Shares</th>
                      <th className="p-4">Eng. Rate</th>
                      <th className="p-4">Attributed Leads</th>
                      <th className="p-4">Performance Index (CPI)</th>
                      <th className="p-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-slate-100 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                            "{item.hook}"
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            {new Date(item.publishedAt).toLocaleDateString()} • {item.duration}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                            {item.pillarId}
                          </span>
                          <div className="text-[10px] text-cyan-400 font-mono mt-1">
                            Angle: {item.angle}
                          </div>
                        </td>

                        <td className="p-4 font-mono">
                          <div className="text-white font-bold">{item.metrics.reach?.toLocaleString() ?? '—'}</div>
                          <div className="text-[10px] text-slate-400">{item.metrics.views?.toLocaleString() ?? '—'} views</div>
                        </td>

                        <td className="p-4 font-mono">
                          <div className="text-purple-300 font-bold">{item.metrics.saves} saves</div>
                          <div className="text-[10px] text-slate-400">{item.metrics.shares} shares</div>
                        </td>

                        <td className="p-4 font-mono">
                          {item.metrics.engagementRate !== null ? (
                            <span className="font-bold text-pink-300">{item.metrics.engagementRate}%</span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Unavailable</span>
                          )}
                        </td>

                        <td className="p-4 font-mono">
                          {item.attributedLeadsCount > 0 ? (
                            <div className="text-emerald-400 font-bold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{item.attributedLeadsCount} Lead{item.attributedLeadsCount === 1 ? '' : 's'} (₹{(item.attributedPipelineValue / 1000).toFixed(0)}k)</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">0 leads</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 text-right font-black font-mono text-sm text-cyan-300">
                              {item.performanceIndex}
                            </div>
                            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.performanceIndex >= 80
                                    ? 'bg-emerald-400'
                                    : item.performanceIndex >= 60
                                    ? 'bg-cyan-400'
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${item.performanceIndex}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedCpiItem(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition-colors"
                            title="Inspect Score Factors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: OBSERVED CONTENT PATTERNS */}
      {/* ========================================================= */}
      {activeSubTab === 'patterns' && (
        <div className="space-y-4">
          {/* Dimension Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pillar', label: 'By Content Pillar' },
              { id: 'angle', label: 'By Narrative Angle' },
              { id: 'duration', label: 'By Video Duration' },
              { id: 'hookType', label: 'By Hook Archetype' },
              { id: 'cta', label: 'By Call to Action' },
              { id: 'dayOfWeek', label: 'By Day of Week' }
            ].map((dim) => (
              <button
                key={dim.id}
                onClick={() => setSelectedPatternDimension(dim.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPatternDimension === dim.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dim.label}
              </button>
            ))}
          </div>

          {/* Pattern Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPatternList.map((group) => (
              <div
                key={group.groupKey}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {group.groupLabel}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        group.isSufficientSample
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      Sample N={group.sampleSize}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    {group.observedInsight}
                  </p>
                </div>

                {/* Metric Summary Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Median Saves</div>
                    <div className="font-bold text-purple-300 font-mono mt-0.5">{group.medianSaves}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">Avg Eng. Rate</div>
                    <div className="font-bold text-pink-300 font-mono mt-0.5">{group.avgEngagementRate}%</div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400">CRM Leads</div>
                    <div className="font-bold text-emerald-300 font-mono mt-0.5">{group.totalLeads}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: AI PERFORMANCE ANALYST & DAILY BRIEF */}
      {/* ========================================================= */}
      {activeSubTab === 'brief' && (
        <div className="space-y-6">
          {/* Daily Intelligence Brief Card */}
          {dailyBrief && (
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                    ⚡
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                      FLASH.Ai Daily Intelligence Brief
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {dailyBrief.date} • Observed Period: {dailyBrief.dataRange}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 self-start sm:self-auto">
                  {dailyBrief.dataQuality} DATASTREAM
                </span>
              </div>

              {/* Observed Executive Patterns */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Observed Performance Patterns</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {dailyBrief.observedPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{pat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Questions & Demand Signals */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Audience Questions & Market Inquiries</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {dailyBrief.audienceQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200"
                    >
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Content Directions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Suggested Next Content Directions</span>
                </h4>
                <div className="space-y-2">
                  {dailyBrief.suggestedContentDirections.map((dir, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center justify-between gap-2"
                    >
                      <span>{dir}</span>
                      <button
                        onClick={() => setActiveSubTab('recommendations')}
                        className="text-[11px] text-cyan-400 font-bold hover:underline shrink-0"
                      >
                        View Recommendation ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Limitations Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{dailyBrief.dataLimitations}</span>
              </div>
            </div>
          )}

          {/* AI Report Breakdown Card */}
          {aiReport && (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Gemini AI Deep Diagnostic Summary
                </h3>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                {aiReport.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    High-Conversion Hook Archetypes:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {aiReport.strongHookPatterns.map((h, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Low-Retention / Weak Hook Patterns:
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {aiReport.weakHookPatterns.map((h, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: AI RECOMMENDATIONS (HUMAN IN THE LOOP) */}
      {/* ========================================================= */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Data-Backed Next Content Plan (Human Approval Required)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Generated from empirical pattern analysis and audience demand signals. Approving a recommendation loads it into the AI Generator to produce drafts for human review.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                      {rec.recommendedPillar.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                      {rec.suggestedAngle} • {rec.suggestedDuration}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        rec.confidenceLevel === 'HIGH'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.confidenceLevel} CONFIDENCE
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Status: <strong className="text-slate-200">{rec.status}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white">
                    {rec.recommendedTopic}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Hook Strategy:</strong> {rec.suggestedHookPattern} • <strong>Call to Action:</strong> {rec.suggestedCTA}
                  </p>
                </div>

                {/* Empirical Evidence Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Empirical Reason & Historical Evidence:</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {rec.reason} {rec.empiricalEvidence}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Zero automated publishing • Enters Human Approval Queue
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => intelligenceService.updateRecommendationStatus(rec.id, 'DISMISSED')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleUseRecommendation(rec)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 transition-all"
                    >
                      <span>Create Draft in Generator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: CONTROLLED EXPERIMENTS (A/B TESTING) */}
      {/* ========================================================= */}
      {activeSubTab === 'experiments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Split className="w-4 h-4 text-purple-400" />
                <span>Controlled Single-Variable Experiments (A/B Tests)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Strict single-variable scientific testing to verify hook, angle, and duration hypotheses without changing multiple factors simultaneously.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                        VARIABLE: {exp.isolatedVariable}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{exp.name}</h4>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {exp.id}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-300">
                  <strong className="text-purple-300">Hypothesis:</strong> {exp.hypothesis}
                </div>

                {/* Side-by-side Variant Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Variant A */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{exp.variantA.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {exp.variantA.leadsCount} Leads (₹{(exp.variantA.pipelineValue / 1000).toFixed(0)}k)
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs">"{exp.variantA.variableValue}"</p>
                    {exp.variantA.metrics && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                        <span>{exp.variantA.metrics.reach?.toLocaleString()} Reach</span>
                        <span>•</span>
                        <span>{exp.variantA.metrics.saves} Saves</span>
                        <span>•</span>
                        <span className="text-pink-300 font-bold">{exp.variantA.metrics.engagementRate}% Eng</span>
                      </div>
                    )}
                  </div>

                  {/* Variant B */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{exp.variantB.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {exp.variantB.leadsCount} Leads (₹{(exp.variantB.pipelineValue / 1000).toFixed(0)}k)
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs">"{exp.variantB.variableValue}"</p>
                    {exp.variantB.metrics && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                        <span>{exp.variantB.metrics.reach?.toLocaleString()} Reach</span>
                        <span>•</span>
                        <span>{exp.variantB.metrics.saves} Saves</span>
                        <span>•</span>
                        <span className="text-pink-300 font-bold">{exp.variantB.metrics.engagementRate}% Eng</span>
                      </div>
                    )}
                  </div>
                </div>

                {exp.observedFinding && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Observed Conclusion:</strong> {exp.observedFinding}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 6: FATIGUE & CONTENT HEALTH */}
      {/* ========================================================= */}
      {activeSubTab === 'health' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Content Health & Repetition Fatigue Scanner</span>
            </h3>
            <p className="text-xs text-slate-300">
              Scans published and scheduled drafts to prevent content over-saturation, repetitive phrasing, and audience fatigue.
            </p>
          </div>

          {fatigueData.warnings.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Content Fatigue Detected</h4>
              <p className="text-xs text-slate-400">
                Your content mix maintains strong pillar distribution and narrative variety.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fatigueData.warnings.map((warn) => (
                <div
                  key={warn.id}
                  className={`glass-card p-4 sm:p-5 rounded-2xl border space-y-2 ${
                    warn.severity === 'HIGH'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : warn.severity === 'MEDIUM'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        warn.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {warn.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Severity: {warn.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">{warn.message}</p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400">Optimization Suggestion:</strong> {warn.suggestion}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CPI Mathematical Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-[#0e1320] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Content Performance Index (CPI) Explained</h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The <strong>Content Performance Index (CPI)</strong> is an objective, weighted 100-point metric combining reach, high-intent bookmarking, viral distribution, and verified commercial lead conversion.
            </p>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800 text-cyan-300 leading-relaxed">
              <div>CPI = Reach Pts (20) + Eng Rate Pts (25) + Save Rate Pts (20) + Share Rate Pts (15) + Lead Pts (20)</div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Reach Points (20):</strong> Scaled relative to account median reach.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-400 font-bold">•</span>
                <span><strong>Engagement Rate (25):</strong> (Likes + Comments + Saves + Shares) / Reach * 100.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Save Rate (20):</strong> Saves / Reach (High-intent evergreen bookmarking).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Share Rate (15):</strong> Shares / Reach (Organic network distribution).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Inbound Lead Conversion (20):</strong> Verified CRM client inquiries generated.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CPI Item Details Breakdown Modal */}
      {selectedCpiItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-[#0e1320] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedCpiItem.title}</h3>
                <p className="text-[10px] text-slate-400 font-mono">CPI Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedCpiItem(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Overall Content Performance Index</div>
              <div className="text-3xl font-black text-cyan-400 font-mono">{selectedCpiItem.performanceIndex} / 100</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Reach Contribution (Max 20):</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedCpiItem.cpiBreakdown.reachPoints} pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Engagement Rate Contribution (Max 25):</span>
                <span className="font-mono text-pink-300 font-bold">{selectedCpiItem.cpiBreakdown.engagementPoints} pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Save Rate Contribution (Max 20):</span>
                <span className="font-mono text-purple-300 font-bold">{selectedCpiItem.cpiBreakdown.savePoints} pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Share Rate Contribution (Max 15):</span>
                <span className="font-mono text-blue-300 font-bold">{selectedCpiItem.cpiBreakdown.sharePoints} pts</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Inbound Lead Contribution (Max 20):</span>
                <span className="font-mono text-emerald-300 font-bold">{selectedCpiItem.cpiBreakdown.leadPoints} pts</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed">
              {selectedCpiItem.cpiBreakdown.explanation}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCpiItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
