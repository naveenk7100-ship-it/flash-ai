import React, { useState, useEffect } from 'react';
import { engagementService } from '../../services/engagementService';
import type { KeywordRule, EngagementIntent } from '../../types';
import {
  Sliders,
  Zap,
  Plus,
  Save,
  CheckCircle2,
  Sparkles,
  DollarSign
} from 'lucide-react';

const INTENT_OPTIONS: EngagementIntent[] = [
  'AUTOMATION',
  'WEBSITE',
  'WHATSAPP',
  'LEAD_GENERATION',
  'AI_TOOLS',
  'PRICING',
  'DEMO',
  'GENERAL',
  'UNKNOWN'
];

export const KeywordRulesEditor: React.FC = () => {
  const [rules, setRules] = useState<KeywordRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newKeyword, setNewKeyword] = useState('');
  const [newIntent, setNewIntent] = useState<EngagementIntent>('AUTOMATION');
  const [newResponse, setNewResponse] = useState('');
  const [newValue, setNewValue] = useState<number>(50000);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await engagementService.getRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (rule: KeywordRule) => {
    const updated = { ...rule, autoReplyEnabled: !rule.autoReplyEnabled };
    setSavingId(rule.id);
    await engagementService.updateRule(updated);
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    setSavingId(null);
  };

  const handleUpdateField = (id: string, field: keyof KeywordRule, value: any) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRule = async (rule: KeywordRule) => {
    setSavingId(rule.id);
    try {
      await engagementService.updateRule(rule);
      setSuccessMsg(`Rule for "${rule.keyword}" saved successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newResponse.trim()) return;

    const newRule: KeywordRule = {
      id: `rule_${Date.now()}`,
      keyword: newKeyword.trim().toUpperCase(),
      intent: newIntent,
      responseTemplate: newResponse.trim(),
      autoReplyEnabled: true,
      leadEstimatedValue: Number(newValue) || 50000
    };

    setSavingId(newRule.id);
    await engagementService.updateRule(newRule);
    setRules((prev) => [...prev, newRule]);
    setIsAddingNew(false);
    setNewKeyword('');
    setNewResponse('');
    setSavingId(null);
    setSuccessMsg(`Added new keyword rule for "${newRule.keyword}"`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Keyword Automation & Response Rules</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {rules.length} Active Rules
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Define keyword triggers from Reel captions (e.g. "Comment AUTOMATE"), map them to client intents, and customize automated DM response templates.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keyword Rule</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Add New Rule Drawer */}
      {isAddingNew && (
        <div className="glass-card p-5 rounded-3xl border border-cyan-500/40 bg-slate-900/90 space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Create New Trigger Keyword</span>
            </h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNew} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Trigger Keyword</label>
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. CONSULT"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white font-mono font-bold uppercase focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Classified Intent</label>
                <select
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value as EngagementIntent)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white focus:border-cyan-400 focus:outline-none"
                >
                  {INTENT_OPTIONS.map((intent) => (
                    <option key={intent} value={intent}>
                      {intent}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Est. Lead Value (₹)</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Response Message Template</span>
                <span className="text-[10px] text-slate-400 font-mono">Use {'{username}'} for dynamic handle</span>
              </label>
              <textarea
                rows={3}
                required
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Hey {username}! Thanks for reaching out about..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-750 text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Save New Keyword Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules List */}
      {loading ? (
        <div className="glass-card p-10 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
          Loading automation rules...
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const isSaving = savingId === rule.id;

            return (
              <div
                key={rule.id}
                className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3.5 hover:border-slate-750 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black font-mono text-xs sm:text-sm flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      "{rule.keyword}"
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        {rule.intent}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        ₹{rule.leadEstimatedValue.toLocaleString()} deal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        rule.autoReplyEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {rule.autoReplyEnabled ? 'Auto-Reply ON' : 'Auto-Reply PAUSED'}
                    </button>

                    <button
                      onClick={() => handleSaveRule(rule)}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Template Editor Box */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-medium flex items-center justify-between">
                    <span>Direct Message / Comment Response Template:</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Placeholders: {'{username}'}
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={rule.responseTemplate}
                    onChange={(e) => handleUpdateField(rule.id, 'responseTemplate', e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Value & Intent Customizer Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target Intent:</span>
                    <select
                      value={rule.intent}
                      onChange={(e) => handleUpdateField(rule.id, 'intent', e.target.value as EngagementIntent)}
                      className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                    >
                      {INTENT_OPTIONS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center sm:justify-end gap-2">
                    <span className="text-slate-400">CRM Deal Value (₹):</span>
                    <input
                      type="number"
                      value={rule.leadEstimatedValue}
                      onChange={(e) => handleUpdateField(rule.id, 'leadEstimatedValue', Number(e.target.value))}
                      className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono w-28 text-right"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
