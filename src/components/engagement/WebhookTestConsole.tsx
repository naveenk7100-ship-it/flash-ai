import React, { useState } from 'react';
import { engagementService } from '../../services/engagementService';
import type { EngagementEventType, EngagementItem } from '../../types';
import {
  Play,
  Zap,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  UserCheck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface WebhookTestConsoleProps {
  onEventProcessed?: () => void;
}

interface PipelineStep {
  name: string;
  desc: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  detail?: string;
}

export const WebhookTestConsole: React.FC<WebhookTestConsoleProps> = ({ onEventProcessed }) => {
  const [eventType, setEventType] = useState<EngagementEventType>('COMMENT');
  const [senderUsername, setSenderUsername] = useState('dr_sameer_clinic');
  const [senderName, setSenderName] = useState('Dr. Sameer Khan');
  const [messageText, setMessageText] = useState('AUTOMATE');
  const [sourcePostTitle, setSourcePostTitle] = useState('FLASH.Ai: 3 AI Automations for 2026');

  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<EngagementItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [steps, setSteps] = useState<PipelineStep[]>([
    { name: '1. Webhook Payload Ingestion', desc: 'Meta Graph API v21.0 payload & signature verification', status: 'idle' },
    { name: '2. Keyword & Intent Classifier', desc: 'Scan for triggers (AUTOMATE, WHATSAPP, PRICE, etc.)', status: 'idle' },
    { name: '3. Safety & Cooldown Gate', desc: 'Anti-loop check, master switch & rate limit', status: 'idle' },
    { name: '4. Automated Response Dispatch', desc: 'Generate personalized DM/Comment reply template', status: 'idle' },
    { name: '5. CRM Lead Deduplication', desc: 'Create or update Lead CRM record with activity log', status: 'idle' }
  ]);

  const presets = [
    {
      label: 'Comment "AUTOMATE"',
      type: 'COMMENT' as EngagementEventType,
      user: 'dr_sameer_clinic',
      name: 'Dr. Sameer Khan',
      text: 'AUTOMATE',
      post: 'Reel: 3 Workflows Every Founder Should Automate in 2026',
      badge: 'High Intent Lead'
    },
    {
      label: 'DM "Need WhatsApp Automation"',
      type: 'DM' as EngagementEventType,
      user: 'priya_boutique',
      name: 'Priya Sharma',
      text: 'Hi, I saw your reel! I need WhatsApp automation for customer queries on my Shopify store.',
      post: 'Reel: How We Built an AI WhatsApp Receptionist',
      badge: 'WhatsApp Funnel'
    },
    {
      label: 'DM "How much does it cost?"',
      type: 'DM' as EngagementEventType,
      user: 'rahul_startup',
      name: 'Rahul Verma',
      text: 'What is the price for setting up custom AI customer service agent?',
      post: 'Reel: Cost vs ROI of AI Automation',
      badge: 'Pricing Intent'
    },
    {
      label: 'Comment "Can I get a demo?"',
      type: 'COMMENT' as EngagementEventType,
      user: 'ananya_dental',
      name: 'Dr. Ananya Dental Studio',
      text: 'Can I see a DEMO of how the Instagram booking bot works?',
      post: 'Reel: Automated Appointment Booking for Clinics',
      badge: 'Demo Request'
    },
    {
      label: 'Comment "Great video"',
      type: 'COMMENT' as EngagementEventType,
      user: 'tech_enthusiast_99',
      name: 'Tech Enthusiast',
      text: 'Great video, keep up the good work! 🚀',
      post: 'Reel: AI Automation 2026 Breakdown',
      badge: 'General Engagement'
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setEventType(p.type);
    setSenderUsername(p.user);
    setSenderName(p.name);
    setMessageText(p.text);
    setSourcePostTitle(p.post);
    setLastResult(null);
    setError(null);
    resetSteps();
  };

  const resetSteps = () => {
    setSteps([
      { name: '1. Webhook Ingestion', desc: 'Meta Graph API payload & signature verification', status: 'idle' },
      { name: '2. Keyword & Intent Classifier', desc: 'Scan for triggers (AUTOMATE, WHATSAPP, PRICE, etc.)', status: 'idle' },
      { name: '3. Safety & Cooldown Gate', desc: 'Anti-loop check, master switch & rate limit', status: 'idle' },
      { name: '4. Automated Response Dispatch', desc: 'Generate personalized DM/Comment reply template', status: 'idle' },
      { name: '5. CRM Lead Deduplication', desc: 'Create or update Lead CRM record with activity log', status: 'idle' }
    ]);
  };

  const runSimulation = async () => {
    if (!messageText.trim() || !senderUsername.trim()) return;

    setIsRunning(true);
    setError(null);
    setLastResult(null);

    // Step 1: Ingestion
    setSteps((prev) => [
      { ...prev[0], status: 'running', detail: `Received simulated ${eventType} event from @${senderUsername}` },
      { ...prev[1], status: 'idle' },
      { ...prev[2], status: 'idle' },
      { ...prev[3], status: 'idle' },
      { ...prev[4], status: 'idle' }
    ]);

    await new Promise((r) => setTimeout(r, 450));

    try {
      setSteps((prev) => [
        { ...prev[0], status: 'success', detail: `Payload validated (Meta HMAC-SHA256 verified)` },
        { ...prev[1], status: 'running', detail: `Analyzing text: "${messageText}"` },
        prev[2],
        prev[3],
        prev[4]
      ]);

      await new Promise((r) => setTimeout(r, 450));

      const event = await engagementService.simulateWebhookEvent({
        eventType,
        senderId: `ig_${senderUsername.replace(/[^a-zA-Z0-9_]/g, '')}_${Date.now()}`,
        senderUsername: senderUsername.replace('@', ''),
        senderName: senderName || undefined,
        messageText,
        sourcePostId: `post_${Date.now()}`,
        sourcePostTitle
      });

      // Step 2 result
      setSteps((prev) => [
        prev[0],
        {
          ...prev[1],
          status: 'success',
          detail: event.detectedKeyword
            ? `Keyword matched: "${event.detectedKeyword}" | Intent: ${event.detectedIntent} (${Math.round(event.confidenceScore * 100)}% conf)`
            : `Intent: ${event.detectedIntent}`
        },
        { ...prev[2], status: 'running', detail: 'Evaluating safety rules & 3-min cooldown...' },
        prev[3],
        prev[4]
      ]);

      await new Promise((r) => setTimeout(r, 400));

      // Step 3 result
      setSteps((prev) => [
        prev[0],
        prev[1],
        {
          ...prev[2],
          status: 'success',
          detail: event.autoReplySent
            ? 'Safety gate passed. Cooldown active (3 min). Rate limit OK.'
            : 'Auto-reply not triggered (Master switch OFF or below threshold).'
        },
        { ...prev[3], status: 'running', detail: 'Formatting template response...' },
        prev[4]
      ]);

      await new Promise((r) => setTimeout(r, 400));

      // Step 4 result
      setSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        {
          ...prev[3],
          status: 'success',
          detail: event.autoReplySent
            ? `Dispatched template to @${event.senderUsername}`
            : 'Skipped response dispatch'
        },
        { ...prev[4], status: 'running', detail: 'Syncing with FLASH.Ai CRM database...' }
      ]);

      await new Promise((r) => setTimeout(r, 350));

      // Step 5 result
      setSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        prev[3],
        {
          ...prev[4],
          status: 'success',
          detail: event.leadId
            ? `Lead record synced (ID: ${event.leadId.slice(0, 10)}...) with activity timeline.`
            : 'No CRM lead generated for low-intent event.'
        }
      ]);

      setLastResult(event);
      if (onEventProcessed) onEventProcessed();
    } catch (err: any) {
      setError(err.message || 'Webhook simulation failed.');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'failed', detail: err.message } : s))
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header Banner */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Meta Webhook Test Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  DEMO SIMULATOR
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Simulate inbound Meta Graph API v21.0 webhooks to test keyword extraction, automatic replies, and lead capture.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Endpoint: <strong className="text-cyan-300">POST /api/meta/webhook</strong>
            </span>
          </div>
        </div>

        {/* Quick-Preset Triggers */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Test Presets (Click to Load)
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-all hover:border-cyan-500/50 flex items-center gap-1.5"
              >
                <span>{p.label}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  {p.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Form & Pipeline Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Setup (5 cols) */}
        <div className="lg:col-span-5 glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Simulate Inbound Webhook Payload</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Event Channel Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEventType('COMMENT')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    eventType === 'COMMENT'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Reel Comment
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('DM')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                    eventType === 'DM'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Message (DM)
                </button>
              </div>
            </div>

            {/* Sender Info */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    value={senderUsername}
                    onChange={(e) => setSenderUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-6 pr-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Message Text */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Comment / DM Message Text</span>
                <span className="text-[10px] text-cyan-400 font-mono">Trigger: AUTOMATE / WHATSAPP / PRICE</span>
              </label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter comment or message text..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            {/* Source Post */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Attributed Reel / Post Title</label>
              <input
                type="text"
                value={sourcePostTitle}
                onChange={(e) => setSourcePostTitle(e.target.value)}
                placeholder="Reel Title"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isRunning || !messageText.trim()}
                onClick={runSimulation}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Processing Webhook Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Simulate Inbound Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 5-Step Pipeline Visualizer & Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Pipeline Steps Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Event Processing Pipeline (Live Audit)</span>
            </h3>

            <div className="space-y-2.5">
              {steps.map((step, idx) => {
                const isSuccess = step.status === 'success';
                const isRun = step.status === 'running';
                const isFail = step.status === 'failed';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSuccess
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : isRun
                        ? 'bg-cyan-950/30 border-cyan-500/50 animate-pulse'
                        : isFail
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isRun ? (
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                        ) : isFail ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                            {idx + 1}
                          </div>
                        )}
                        <span
                          className={`text-xs font-bold ${
                            isSuccess
                              ? 'text-emerald-300'
                              : isRun
                              ? 'text-cyan-300'
                              : isFail
                              ? 'text-rose-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {step.status}
                      </span>
                    </div>

                    {step.detail && (
                      <p className="text-[11px] text-slate-300 mt-1 pl-6 font-mono leading-tight">
                        {step.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Result Inspection Card */}
          {lastResult && (
            <div className="glass-card p-5 rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 to-cyan-950/30 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Event Result Summary</h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  ID: {lastResult.id.slice(0, 12)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400">Detected Keyword</span>
                  <div className="font-bold text-emerald-300 font-mono">
                    {lastResult.detectedKeyword || 'None'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400">Classified Intent</span>
                  <div className="font-bold text-indigo-300">
                    {lastResult.detectedIntent}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400">CRM Lead Status</span>
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-amber-400" />
                    {lastResult.leadId ? 'Captured (NEW)' : 'Not Created'}
                  </div>
                </div>
              </div>

              {lastResult.autoReplySent && lastResult.autoReplyText && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
                  <span className="font-bold text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Automated Reply Sent to @{lastResult.senderUsername}:
                  </span>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {lastResult.autoReplyText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
