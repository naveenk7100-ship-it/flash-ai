import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { PublishingMode } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Info,
  HelpCircle,
  Zap,
  MessageSquare,
  Copy,
  ExternalLink
} from 'lucide-react';

export const InstagramConnectionPanel: React.FC = () => {
  const {
    metaStatus,
    verifyMetaConnection,
    publishingMode,
    setPublishingMode,
    showToast,
    setActiveTab
  } = useApp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [showLiveConfirmModal, setShowLiveConfirmModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const webhookCallbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/meta/webhook`
    : 'https://flash-ai.app/api/meta/webhook';

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyMetaConnection();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookCallbackUrl);
    setCopiedUrl(true);
    showToast('Copied Webhook URL to clipboard', 'info');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleToggleMode = (newMode: PublishingMode) => {
    if (newMode === 'LIVE') {
      if (!metaStatus.isConnected) {
        showToast('Cannot switch to LIVE mode: Meta Graph API credentials are not verified.', 'error');
        return;
      }
      setShowLiveConfirmModal(true);
    } else {
      setPublishingMode('DEMO');
    }
  };

  const confirmSwitchToLive = () => {
    setPublishingMode('LIVE');
    setShowLiveConfirmModal(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Meta & Instagram Graph API Connection</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                API {metaStatus.apiVersion || 'v21.0'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Official Instagram Content Publishing API for Reels and image feed posts.
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {metaStatus.isConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CONNECTED</span>
            </div>
          ) : metaStatus.error ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>ERROR / NOT VERIFIED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>REQUIRES META CONFIGURATION</span>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher: DEMO vs LIVE */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200">
              Engine Publishing Mode (Safety Switch)
            </span>
            <p className="text-[11px] text-slate-400">
              DEMO mode simulates full container creation & publishing without posting to Instagram.
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              type="button"
              onClick={() => handleToggleMode('DEMO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                publishingMode === 'DEMO'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DEMO MODE
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('LIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                publishingMode === 'LIVE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIVE PUBLISHING
            </button>
          </div>
        </div>

        {publishingMode === 'DEMO' ? (
          <div className="text-[11px] text-amber-300/90 flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Active: Safe Demo mode. Zero risk of accidental live posts during development.</span>
          </div>
        ) : (
          <div className="text-[11px] text-rose-300/90 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Active: LIVE Publishing via Meta Graph API. Approved items will go live to @{metaStatus.username || 'your account'}.</span>
          </div>
        )}
      </div>

      {/* Verified Account Information Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Connected Username
          </span>
          <div className="font-bold text-white text-xs sm:text-sm font-mono truncate">
            {metaStatus.username ? `@${metaStatus.username}` : '@flash.ai (Demo)'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Instagram Account ID
          </span>
          <div className="font-bold text-slate-300 text-xs sm:text-sm font-mono truncate">
            {metaStatus.accountIdMasked || '1784••••0000'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Account Type & Permissions
          </span>
          <div className="font-bold text-emerald-400 text-xs sm:text-sm">
            {metaStatus.accountType || 'BUSINESS (Professional)'}
          </div>
        </div>
      </div>

      {/* STEP 5: Meta Webhook & Engagement Receiver Configuration */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-cyan-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Meta Webhook & Inbound Engagement Gateway (Step 5)
            </h4>
          </div>
          <button
            onClick={() => setActiveTab('inbox')}
            className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Inbound Inbox ➔</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Meta Webhook Callback URL (HTTPS endpoint):</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookCallbackUrl}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Webhook URL"
              >
                {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Verify Token (hub.verify_token):</span>
              <div className="font-mono text-xs text-slate-200">
                <code>flash_ai_webhook_verify_token_2026</code>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">HMAC-SHA256 Signature Header:</span>
              <div className="font-mono text-xs text-emerald-400 font-bold">
                X-Hub-Signature-256 (Protected)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error or Missing Configuration Warning */}
      {!metaStatus.isConnected && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Meta Graph API Credentials Pending</span>
          </div>
          <p className="text-[11px] text-amber-300/90 leading-relaxed">
            To enable live publishing and webhooks for your official FLASH.Ai Instagram account, add your Meta Developer credentials into the secure <code>.env</code> file in the project root:
          </p>
          <div className="p-2.5 rounded-lg bg-black/50 font-mono text-[11px] text-cyan-300 space-y-1 border border-slate-800">
            <div>META_APP_ID=your_app_id</div>
            <div>META_APP_SECRET=your_app_secret</div>
            <div>META_ACCESS_TOKEN=your_long_lived_system_token</div>
            <div>META_INSTAGRAM_ACCOUNT_ID=your_instagram_business_account_id</div>
            <div>META_API_VERSION=v21.0</div>
            <div>META_WEBHOOK_VERIFY_TOKEN=flash_ai_webhook_verify_token_2026</div>
          </div>
        </div>
      )}

      {/* Verification Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showInstructions ? 'Hide Setup Guide' : 'View Meta Developer Setup Guide'}</span>
        </button>

        <button
          type="button"
          disabled={isVerifying}
          onClick={handleVerify}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Verifying with Meta API...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Connection</span>
            </>
          )}
        </button>
      </div>

      {/* Meta Developer Setup Instructions Collapsible */}
      {showInstructions && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-300 space-y-3 animate-in fade-in">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Meta Graph API Setup Steps</span>
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <li>
              <strong>Create Meta App:</strong> Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Meta for Developers <ExternalLink className="w-3 h-3" /></a> and create a "Business" type app.
            </li>
            <li>
              <strong>Link Instagram Account:</strong> Switch your FLASH.Ai Instagram account to a Professional (Business) account and link it to your Facebook Page.
            </li>
            <li>
              <strong>Add Permissions:</strong> Add <code>instagram_basic</code>, <code>instagram_content_publish</code>, <code>instagram_manage_insights</code>, <code>instagram_manage_comments</code>, and <code>instagram_manage_messages</code>.
            </li>
            <li>
              <strong>Configure Webhook:</strong> In Meta App Dashboard $\rightarrow$ Webhooks $\rightarrow$ Instagram, set Callback URL to <code>https://your-domain.com/api/meta/webhook</code> and Verify Token to <code>flash_ai_webhook_verify_token_2026</code>. Subscribe to <code>messages</code> and <code>comments</code>.
            </li>
            <li>
              <strong>Generate System User Token:</strong> Generate a Permanent System User Token in Meta Business Suite and add it to your root <code>.env</code> file.
            </li>
          </ol>
        </div>
      )}

      {/* Confirmation Modal to switch to LIVE Mode */}
      {showLiveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-[#0e1320] border border-rose-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Enable LIVE Instagram Publishing?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to switch the engine to <strong>LIVE PUBLISHING MODE</strong>. Any content approved and published will immediately create real Instagram containers and post publicly to <strong>@{metaStatus.username || 'your account'}</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLiveConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Keep Demo Mode
              </button>
              <button
                onClick={confirmSwitchToLive}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold"
              >
                Yes, Enable LIVE Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
