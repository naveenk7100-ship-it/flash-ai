import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { engagementService } from '../../services/engagementService';
import type { EngagementItem, EngagementStatus } from '../../types';
import { WebhookTestConsole } from './WebhookTestConsole';
import { KeywordRulesEditor } from './KeywordRulesEditor';
import {
  MessageSquare,
  MessageCircle,
  Users,
  Zap,
  CheckCircle2,
  Search,
  Sliders,
  UserCheck,
  Ban,
  Play
} from 'lucide-react';

export const EngagementInbox: React.FC = () => {
  const { setActiveTab } = useApp();

  const [inbox, setInbox] = useState<EngagementItem[]>([]);
  const [status, setStatus] = useState<EngagementStatus | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'test_console' | 'rules'>('inbox');

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInboxOnly, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadInbox = async () => {
    try {
      const [items, s] = await Promise.all([
        engagementService.getInbox(),
        engagementService.getStatus()
      ]);
      setInbox(items);
      setStatus(s);
    } catch (err) {
      console.error('Failed to load engagement inbox:', err);
    }
  };

  const loadInboxOnly = async () => {
    try {
      const items = await engagementService.getInbox();
      setInbox(items);
    } catch {
      // silent
    }
  };

  const handleToggleMasterSwitch = async () => {
    if (!status) return;
    const nextState = !status.autoReplyMasterSwitch;
    await engagementService.updateSettings({ autoReplyMasterSwitch: nextState });
    setStatus({ ...status, autoReplyMasterSwitch: nextState });
  };

  const handleBlockUser = async (userId: string, username: string) => {
    if (confirm(`Block automated replies for @${username}?`)) {
      await engagementService.blockUser(userId);
      setInbox((prev) =>
        prev.map((item) =>
          item.senderId === userId ? { ...item, status: 'BLOCKED' } : item
        )
      );
    }
  };

  const filteredItems = inbox.filter((item) => {
    const matchesSearch =
      item.senderUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.messageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.detectedKeyword && item.detectedKeyword.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'dm') return matchesSearch && item.eventType === 'DM';
    if (filterType === 'comment') return matchesSearch && item.eventType === 'COMMENT';
    if (filterType === 'leads') return matchesSearch && !!item.leadId;
    if (filterType === 'keywords') return matchesSearch && !!item.detectedKeyword;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono">
              STEP 5 ENGAGEMENT & LEAD ENGINE
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                status?.autoReplyMasterSwitch
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              AUTO-REPLY: {status?.autoReplyMasterSwitch ? 'ENABLED' : 'DISABLED (OFF)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            Instagram Inbound Engagement & Lead Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Meta webhook receiver & automatic keyword lead capturer. Ingests comments and DMs from Reels, detects intent, sends configured templates, and creates deduplicated CRM leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleMasterSwitch}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
              status?.autoReplyMasterSwitch
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {status?.autoReplyMasterSwitch ? 'Turn Auto-Reply OFF' : 'Turn Auto-Reply ON'}
          </button>

          <button
            onClick={() => setActiveSubTab('test_console')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Webhook Test Console
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Engagements</span>
          <div className="text-2xl font-black text-white">{inbox.length}</div>
          <p className="text-[10px] text-cyan-400 font-mono">DMs & Reel Comments</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Direct Messages</span>
          <div className="text-2xl font-black text-purple-300">
            {inbox.filter((i) => i.eventType === 'DM').length}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Instagram Direct</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Reel Comments</span>
          <div className="text-2xl font-black text-blue-300">
            {inbox.filter((i) => i.eventType === 'COMMENT').length}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Organic engagement</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Auto-Replies Sent</span>
          <div className="text-2xl font-black text-emerald-400">
            {inbox.filter((i) => i.autoReplySent).length}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Cooldown protected</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-slate-400 font-medium">Leads Captured</span>
          <div className="text-2xl font-black text-amber-300">
            {inbox.filter((i) => !!i.leadId).length}
          </div>
          <p className="text-[10px] text-amber-400 font-mono">Synced to Lead CRM</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'inbox'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Engagement Feed ({inbox.length})
        </button>

        <button
          onClick={() => setActiveSubTab('test_console')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'test_console'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Webhook Test Console (Demo Simulator)
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'rules'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Keyword Automation Rules ({status?.activeKeywordsCount || 5})
        </button>
      </div>

      {/* SUB-TAB 1: INBOX FEED */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by @username, keyword, or message..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="all">All Inbound ({inbox.length})</option>
                <option value="dm">Direct Messages</option>
                <option value="comment">Comments</option>
                <option value="keywords">Keywords Detected</option>
                <option value="leads">Leads Created</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Mode: <strong className="text-cyan-300">{status?.engagementMode || 'DEMO'}</strong>
            </div>
          </div>

          {/* List of Messages */}
          {filteredItems.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Inbound Engagements Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Trigger simulated comments or DMs using the Webhook Test Console to test the keyword intent classifier and automatic lead creation.
              </p>
              <button
                onClick={() => setActiveSubTab('test_console')}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30"
              >
                Open Test Console
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`glass-card rounded-2xl border p-4 sm:p-5 transition-all ${
                    item.autoReplySent
                      ? 'border-cyan-500/30 bg-cyan-950/10'
                      : item.status === 'BLOCKED'
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs">
                        {item.senderUsername.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            @{item.senderUsername}
                          </span>
                          {item.senderName && (
                            <span className="text-xs text-slate-400">
                              ({item.senderName})
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              item.eventType === 'DM'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {item.eventType}
                          </span>
                          {item.isDemo && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                              DEMO EVENT
                            </span>
                          )}
                        </div>
                        {item.sourcePostTitle && (
                          <p className="text-[11px] text-slate-400 pt-0.5">
                            Source: <span className="text-cyan-400">{item.sourcePostTitle}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Message Body & Analysis Badges */}
                  <div className="py-3 space-y-2">
                    <p className="text-sm font-semibold text-slate-100 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      "{item.messageText}"
                    </p>

                    {/* Detected Keyword & Intent Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.detectedKeyword && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          Keyword: "{item.detectedKeyword}"
                        </span>
                      )}

                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                        Intent: {item.detectedIntent}
                      </span>

                      {item.leadId && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          CRM Lead Created ({item.leadStatus || 'NEW'})
                        </span>
                      )}
                    </div>

                    {/* Auto Reply Box */}
                    {item.autoReplySent && item.autoReplyText && (
                      <div className="mt-2 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          Automated Response Sent:
                        </span>
                        <p className="leading-relaxed whitespace-pre-line text-slate-300">
                          {item.autoReplyText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.leadId && (
                        <button
                          onClick={() => setActiveTab('leads')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View in Lead CRM ➔
                        </button>
                      )}

                      <button
                        onClick={() => handleBlockUser(item.senderId, item.senderUsername)}
                        className="text-slate-400 hover:text-rose-400 text-xs font-semibold px-2 py-1 flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Block Automation
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      Event ID: {item.id.slice(0, 14)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TEST CONSOLE */}
      {activeSubTab === 'test_console' && (
        <WebhookTestConsole onEventProcessed={() => loadInbox()} />
      )}

      {/* SUB-TAB 3: KEYWORD RULES */}
      {activeSubTab === 'rules' && <KeywordRulesEditor />}
    </div>
  );
};
