import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentIdea, ContentPillarId, ContentStatus } from '../../types';
import { CONTENT_PILLARS, CONTENT_STATUSES } from '../../constants/pillars';
import { IdeaCard } from './IdeaCard';
import { IdeaModal } from './IdeaModal';
import { PublishingCalendar } from './PublishingCalendar';
import {
  contentPlanningEngine,
  type CandidateIdea,
  type PlannedContentRecord
} from '../../services/contentPlanningEngine';
import {
  CalendarDays,
  List,
  Grid,
  Plus,
  Search,
  Filter,
  Sparkles,
  Calendar,
  History,
  CheckCircle2,
  TrendingUp,
  Trash2
} from 'lucide-react';

export const ContentPlanner: React.FC = () => {
  const { ideas, addIdea, setActiveTab, setGeneratorPrefill, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<ContentPillarId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'history'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);

  // Fresh Ideas Generator State
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [candidateIdeas, setCandidateIdeas] = useState<CandidateIdea[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateIdea | null>(null);
  const [isGeneratingCandidates, setIsGeneratingCandidates] = useState(false);

  // History State
  const [planHistory, setPlanHistory] = useState<PlannedContentRecord[]>(() =>
    contentPlanningEngine.getPlanRecords()
  );

  // Filter ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (idea.notes && idea.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (idea.targetAudience && idea.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPillar = selectedPillar === 'all' || idea.pillarId === selectedPillar;
      const matchesStatus = selectedStatus === 'all' || idea.status === selectedStatus;

      return matchesSearch && matchesPillar && matchesStatus;
    });
  }, [ideas, searchQuery, selectedPillar, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingIdea(null);
    setIsModalOpen(true);
  };

  const handleEditIdea = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setIsModalOpen(true);
  };

  const handleGenerateFreshCandidates = () => {
    setIsGeneratingCandidates(true);
    setShowIdeaGenerator(true);
    setTimeout(() => {
      const pId = selectedPillar !== 'all' ? selectedPillar : undefined;
      const candidates = contentPlanningEngine.generateCandidateIdeas(4, pId);
      setCandidateIdeas(candidates);
      const best = contentPlanningEngine.selectBestIdea(candidates);
      setSelectedCandidate(best);
      setIsGeneratingCandidates(false);
      showToast('Generated 4 fresh ideas scored by novelty & format variety!', 'info');
    }, 350);
  };

  const handleCommitCandidate = (candidate: CandidateIdea) => {
    // 1. Commit to planning engine
    const record = contentPlanningEngine.commitPlanItem(candidate);
    // 2. Add to app ideas context
    addIdea({
      title: record.topic,
      pillarId: record.pillarId as ContentPillarId,
      platform: 'Instagram Reels',
      status: 'IDEA',
      scheduledDate: record.publishDate,
      targetAudience: record.targetAudience,
      notes: `Format: ${record.formatName} • Hook: ${record.hook.slice(0, 80)}...`
    });
    setPlanHistory(contentPlanningEngine.getPlanRecords());
    showToast(`Committed "${record.topic.slice(0, 35)}..." to Planned Reels!`, 'success');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    contentPlanningEngine.deletePlanRecord(id);
    setPlanHistory(contentPlanningEngine.getPlanRecords());
    showToast('Plan record removed from history', 'info');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Content Planner</h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              {filteredIdeas.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Intelligent planning engine with freshness scoring, 15 creator formats, no-repeat memory, and publishing timeline.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Fresh Idea Generator Trigger */}
          <button
            onClick={handleGenerateFreshCandidates}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>AI Ideas Generator</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Timeline/Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'history' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Content History & Formats Ledger"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-xs shadow-md shadow-cyan-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Idea</span>
          </button>
        </div>
      </div>

      {/* FRESH CANDIDATE IDEAS ENGINE DRAWER / CARD */}
      {showIdeaGenerator && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-b from-[#110d24] to-[#0a0d16] space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Content Intelligence: Candidate Idea Batch
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                NO-REPEAT MEMORY ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateFreshCandidates}
                disabled={isGeneratingCandidates}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>{isGeneratingCandidates ? 'Scoring Candidates...' : 'Regenerate Batch'}</span>
              </button>
              <button
                onClick={() => setShowIdeaGenerator(false)}
                className="text-xs text-slate-500 hover:text-slate-300 ml-2"
              >
                Close
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The planner engine generates multiple topics, scores each for novelty against previous hooks and formats, and identifies the optimal Reel to produce:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {candidateIdeas.map((candidate, idx) => {
              const isBest = idx === 0;
              const isSelected = selectedCandidate?.id === candidate.id;

              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-purple-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isBest && (
                          <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 text-black text-[9px] font-black rounded-md tracking-wider uppercase shadow-sm">
                            RECOMMENDED
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                          {candidate.format.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        <span className="font-bold text-cyan-300">{candidate.overallScore}%</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 line-clamp-2">
                      {candidate.topic}
                    </h4>

                    <div className="text-[11px] text-slate-400 line-clamp-2 italic">
                      "{candidate.hookSample}"
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Freshness: <strong className="text-emerald-400">{candidate.freshnessScore}%</strong></span>
                      <span>Variety: <strong className="text-cyan-400">{candidate.varietyScore}%</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommitCandidate(candidate);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[11px] flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Commit Reel</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pillar Horizontal Pills Filter (Only when not in History mode) */}
      {viewMode !== 'history' && (
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedPillar('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedPillar === 'all'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Pillars ({ideas.length})
            </button>

            {CONTENT_PILLARS.map((pillar) => {
              const count = ideas.filter((i) => i.pillarId === pillar.id).length;
              const isSelected = selectedPillar === pillar.id;

              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(pillar.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${pillar.badgeBg} border-cyan-400 shadow-sm`
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{pillar.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {viewMode !== 'history' && (
        <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, topics, audience..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ContentStatus | 'all')}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              {CONTENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      {viewMode === 'history' ? (
        /* CONTENT HISTORY & NO-REPEAT LEDGER VIEW */
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Content Planning History & Memory Ledger ({planHistory.length} records)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Tracks topic, format, hook, script concept, status and publish date
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Format (15 Types)</th>
                  <th className="p-3">Opening Hook</th>
                  <th className="p-3">Script / Concept</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Publish Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {planHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-100 max-w-xs">
                      <div className="line-clamp-2">{item.topic}</div>
                      <div className="text-[10px] text-cyan-400 font-normal">{item.pillarName}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                        {item.formatName}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 italic max-w-xs">
                      <div className="line-clamp-2">"{item.hook}"</div>
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs">
                      <div className="line-clamp-2">{item.scriptSummary}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300 text-[11px]">
                      {item.publishDate || '—'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteHistoryRecord(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors"
                        title="Remove record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredIdeas.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No content ideas found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedPillar !== 'all' || selectedStatus !== 'all'
                ? 'Try clearing your search or filter tags.'
                : 'Click "AI Ideas Generator" above to instantly synthesize fresh creator topics.'}
            </p>
          </div>
          <button
            onClick={handleGenerateFreshCandidates}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md shadow-cyan-500/25 transition-all"
          >
            Generate Fresh Ideas Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onEdit={handleEditIdea} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Topic / Title</th>
                  <th className="p-3.5">Pillar</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredIdeas.map((idea) => {
                  const pillar = CONTENT_PILLARS.find((p) => p.id === idea.pillarId) || CONTENT_PILLARS[0];
                  return (
                    <tr key={idea.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5 font-medium text-slate-100 max-w-xs">
                        <div className="font-semibold line-clamp-1">{idea.title}</div>
                        {idea.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">{idea.notes}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${pillar.badgeBg}`}>
                          {pillar.name}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{idea.platform}</td>
                      <td className="p-3.5 text-cyan-300 font-mono text-[11px]">
                        {idea.scheduledDate || '—'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {idea.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setGeneratorPrefill({
                                topic: idea.title,
                                pillarId: idea.pillarId,
                                audience: idea.targetAudience
                              });
                              setActiveTab('generator');
                            }}
                            className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30"
                          >
                            AI Generate
                          </button>
                          <button
                            onClick={() => handleEditIdea(idea)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Interactive Publishing Calendar View */
        <PublishingCalendar />
      )}

      {/* Idea Add / Edit Modal */}
      <IdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ideaToEdit={editingIdea}
      />
    </div>
  );
};
