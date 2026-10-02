import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { automationService, type SystemStatusData } from '../../services/automationService';
import { DailyApprovalCenter } from './DailyApprovalCenter';
import { DailyRunHistory } from './DailyRunHistory';
import { ProductionHealthPanel } from './ProductionHealthPanel';
import type { DailyRun, AutomationSettings, InternalNotification } from '../../types';
import {
  Zap,
  Play,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Bell,
  Layers,
  Clock,
  Film,
  Users,
  ShieldCheck,
  Cpu,
  Server,
  HardDrive
} from 'lucide-react';

export const AutomationControlCenter: React.FC = () => {
  const { publishingMode, metaStatus, showToast, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'run' | 'approval' | 'history' | 'settings' | 'notifications' | 'health'
  >('run');

  const [statusData, setStatusData] = useState<SystemStatusData | null>(null);
  const [currentRun, setCurrentRun] = useState<DailyRun | null>(null);
  const [history, setHistory] = useState<DailyRun[]>([]);
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const [settings, setSettings] = useState<AutomationSettings>({
    dailyAutomationEnabled: true,
    reelsPerDay: 2,
    autoGenerate: true,
    autoRender: true,
    requireHumanApproval: true,
    autoPublish: false,
    publishingMode: 'DEMO',
    scheduleSlots: ['11:00', '18:00', '21:00'],
    preferredPillars: ['ai-automation', 'whatsapp-automation'],
    concurrency: 1
  });

  const [reelsCountChoice, setReelsCountChoice] = useState<1 | 2 | 3>(2);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      const [status, run, hist, notifData] = await Promise.all([
        automationService.getStatus(),
        automationService.getCurrentRun(),
        automationService.getRunHistory(),
        automationService.getNotifications()
      ]);

      if (status) {
        setStatusData(status);
        if (status.settings) {
          setSettings(status.settings);
          setReelsCountChoice(status.settings.reelsPerDay);
        }
      }
      if (run) setCurrentRun(run);
      if (hist) setHistory(hist);
      setNotifications(notifData.notifications);
      setUnreadNotifsCount(notifData.unreadCount);
    } catch (err) {
      console.error('Failed to load automation data:', err);
    }
  };

  const handleStartDailyRun = async () => {
    setIsRunningPipeline(true);
    try {
      const run = await automationService.startDailyRun(reelsCountChoice);
      if (run) {
        setCurrentRun(run);
        showToast(`Started Daily Run for today (${reelsCountChoice} Reels planned)`, 'success');
        // Auto-switch to Run or Approval tab if awaiting approval
        if (run.status === 'WAITING_APPROVAL') {
          setActiveSubTab('approval');
        } else {
          setActiveSubTab('run');
        }
        await loadAutomationData();
      }
    } catch {
      showToast('Failed to start daily run', 'error');
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated = await automationService.updateSettings(settings);
      setSettings(updated);
      showToast('Automation settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleMarkNotifsRead = async () => {
    try {
      await automationService.markNotificationRead(undefined, true);
      setUnreadNotifsCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      showToast('Failed to update notifications', 'error');
    }
  };

  const sysStatus = statusData?.systemStatus || {
    ai: 'CONNECTED',
    aiProvider: 'gemini',
    media: 'READY',
    meta: metaStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED',
    webhook: 'VERIFIED',
    scheduler: 'RUNNING',
    analytics: publishingMode === 'LIVE' ? 'LIVE' : 'DEMO',
    leadEngine: 'READY'
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & System Status Grid */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] tracking-wider uppercase border border-cyan-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Step 7 Unified Operating System
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Mandatory Human-in-the-Loop
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Daily Content Operating System
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Unified 13-stage orchestration connecting Briefing, Empirical Planning, AI Generation, 9:16 Reel Rendering, QC Audits, Scheduling, Meta Publishing, Inbound Leads, and Analytics Sync.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAutomationData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh System Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartDailyRun}
              disabled={isRunningPipeline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black text-xs font-black shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isRunningPipeline ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isRunningPipeline ? 'Executing Run...' : "Start Today's Daily Run"}</span>
            </button>
          </div>
        </div>

        {/* System Health Indicators Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>System Subsystem Status Matrix</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            {/* AI Provider */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">AI ENGINE</div>
              <div className="font-extrabold flex items-center gap-1 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>{sysStatus.ai}</span>
              </div>
            </div>

            {/* Media Studio */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">MEDIA STUDIO</div>
              <div className="font-extrabold flex items-center gap-1 text-emerald-400 text-[11px]">
                <Film className="w-3 h-3" />
                <span>{sysStatus.media}</span>
              </div>
            </div>

            {/* Meta API */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">META API</div>
              <div
                className={`font-extrabold flex items-center gap-1 text-[11px] ${
                  sysStatus.meta === 'CONNECTED' ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <span>{sysStatus.meta}</span>
              </div>
            </div>

            {/* Webhooks */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">WEBHOOKS</div>
              <div className="font-extrabold flex items-center gap-1 text-cyan-400 text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>{sysStatus.webhook}</span>
              </div>
            </div>

            {/* Scheduler */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">SCHEDULER</div>
              <div className="font-extrabold flex items-center gap-1 text-purple-400 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{sysStatus.scheduler}</span>
              </div>
            </div>

            {/* Analytics */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">ANALYTICS</div>
              <div
                className={`font-extrabold flex items-center gap-1 text-[11px] ${
                  sysStatus.analytics === 'LIVE' ? 'text-emerald-400' : 'text-pink-400'
                }`}
              >
                <span>{sysStatus.analytics}</span>
              </div>
            </div>

            {/* Lead CRM */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 font-mono">LEAD CRM</div>
              <div className="font-extrabold flex items-center gap-1 text-amber-400 text-[11px]">
                <Users className="w-3 h-3" />
                <span>{sysStatus.leadEngine}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveSubTab('run')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'run'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Today's Run Stepper</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approval')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'approval'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>QC & Approvals</span>
          {currentRun && currentRun.itemsAwaitingApproval > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
              {currentRun.itemsAwaitingApproval}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Run History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Automation Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'notifications'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
          {unreadNotifsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-400 text-black text-[10px] font-black">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'health'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Production Health & Persistence</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: TODAY'S LIVE RUN & 13-STAGE STEPPER */}
      {/* ========================================================= */}
      {activeSubTab === 'run' && (
        <div className="space-y-5">
          {/* Daily Run Controls Ribbon */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">Reels for Today's Run:</span>
              <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
                {([1, 2, 3] as const).map((num) => (
                  <button
                    key={num}
                    onClick={() => setReelsCountChoice(num)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                      reelsCountChoice === num
                        ? 'bg-cyan-500 text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Reel{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Current Run Status:{' '}
                <strong className="text-cyan-300">{currentRun?.status || 'IDLE'}</strong>
              </span>
            </div>
          </div>

          {/* 13-Stage Visual Pipeline Stepper */}
          {currentRun ? (
            <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">13-Stage Daily Run Timeline</h3>
                  <p className="text-[11px] text-slate-400">
                    Execution date: {currentRun.date} • Run ID: {currentRun.id}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    currentRun.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentRun.status === 'WAITING_APPROVAL'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : currentRun.status === 'PARTIAL'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {currentRun.status}
                </span>
              </div>

              {/* Stepper Grid */}
              <div className="space-y-2.5">
                {currentRun.steps.map((step, idx) => {
                  const isCompleted = step.status === 'COMPLETED';
                  const isRunning = step.status === 'RUNNING';
                  const isWaiting = step.status === 'WAITING_ACTION';
                  const isFailed = step.status === 'FAILED';

                  return (
                    <div
                      key={step.stepId}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                        isRunning
                          ? 'border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                          : isWaiting
                          ? 'border-purple-500/50 bg-purple-950/20'
                          : isCompleted
                          ? 'border-emerald-500/30 bg-slate-900/60'
                          : isFailed
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : 'border-slate-800/80 bg-slate-900/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500 text-black'
                              : isRunning
                              ? 'bg-cyan-500 text-black animate-pulse'
                              : isWaiting
                              ? 'bg-purple-500 text-white'
                              : isFailed
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div>
                          <div className="font-extrabold text-xs text-white flex items-center gap-2">
                            <span>{step.name}</span>
                            {isWaiting && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.2 rounded-full border border-purple-500/30">
                                Action Required
                              </span>
                            )}
                          </div>
                          {step.details && (
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              {step.details}
                            </div>
                          )}
                          {step.error && (
                            <div className="text-[11px] text-rose-400 font-mono mt-0.5">
                              Error: {step.error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        {isWaiting && (
                          <button
                            onClick={() => setActiveSubTab('approval')}
                            className="px-3 py-1 rounded-lg bg-purple-500 text-white font-bold hover:bg-purple-400 transition-colors"
                          >
                            Review & Approve
                          </button>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase ${
                            isCompleted
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : isRunning
                              ? 'text-cyan-400 bg-cyan-500/10 animate-pulse'
                              : isWaiting
                              ? 'text-purple-400 bg-purple-500/10'
                              : isFailed
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <Cpu className="w-12 h-12 text-cyan-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">Daily Run Engine Idle</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click <strong>"Start Today's Daily Run"</strong> to trigger the automated 13-stage pipeline for today.
                </p>
              </div>
              <button
                onClick={handleStartDailyRun}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
              >
                Execute Pipeline Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: QC & HUMAN APPROVAL HUB */}
      {/* ========================================================= */}
      {activeSubTab === 'approval' && (
        <DailyApprovalCenter
          currentRun={currentRun}
          onRunUpdated={(updated) => setCurrentRun(updated)}
          showToast={showToast}
          publishingMode={publishingMode}
        />
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: EXECUTION HISTORY */}
      {/* ========================================================= */}
      {activeSubTab === 'history' && <DailyRunHistory history={history} />}

      {/* ========================================================= */}
      {/* SUB-TAB 4: AUTOMATION SETTINGS */}
      {/* ========================================================= */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-3xl">
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5">
            <div>
              <h3 className="text-sm font-black text-white">Automation & Scheduling Policies</h3>
              <p className="text-xs text-slate-400">
                Configure production automation rules, reels per day, and mandatory human safety controls.
              </p>
            </div>

            {/* Daily Automation Active Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <div className="font-bold text-xs text-white">Daily Automation Pipeline</div>
                <div className="text-[11px] text-slate-400">
                  Allow system to run daily planning and rendering jobs
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyAutomationEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, dailyAutomationEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Reels Per Day */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-xs text-white">Reels Published Cadence</div>
              <div className="text-[11px] text-slate-400">
                Number of Reels generated and scheduled per day (1, 2, or 3)
              </div>
              <div className="flex gap-2 pt-1">
                {([1, 2, 3] as const).map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setSettings({ ...settings, reelsPerDay: num })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      settings.reelsPerDay === num
                        ? 'bg-cyan-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num} Reel{num > 1 ? 's' : ''}/day
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Human Approval */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/20">
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Human Approval (Strict Default: ON)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Requires operator to review and approve every Reel before live publishing.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireHumanApproval}
                onChange={(e) =>
                  setSettings({ ...settings, requireHumanApproval: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Scheduler Persistence Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scheduler Runtime Architecture</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Background scheduler requires persistent server runtime. Automated jobs run via Node.js server execution layer.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Automation Policies'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: INTERNAL NOTIFICATIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">Internal System Notifications</h3>
              <p className="text-[11px] text-slate-400">
                Automatic internal event log for generation, rendering, approvals, and syncs.
              </p>
            </div>

            {unreadNotifsCount > 0 && (
              <button
                onClick={handleMarkNotifsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                No notifications logged yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    !n.read
                      ? 'bg-slate-900 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-white">{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{n.message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {n.linkTab && (
                    <button
                      onClick={() => setActiveTab(n.linkTab as any)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold shrink-0"
                    >
                      View
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 6: PRODUCTION HEALTH & PERSISTENCE */}
      {/* ========================================================= */}
      {activeSubTab === 'health' && (
        <ProductionHealthPanel showToast={showToast} />
      )}
    </div>
  );
};
