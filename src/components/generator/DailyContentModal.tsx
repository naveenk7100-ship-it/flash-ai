import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONTENT_PILLARS } from '../../constants/pillars';
import { aiGeneratorService } from '../../services/aiGeneratorService';
import { mediaGenerationService } from '../../services/mediaGenerationService';
import type { ContentItem, ContentPillarId } from '../../types';
import {
  CalendarDays,
  Sparkles,
  Loader2,
  X,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Film
} from 'lucide-react';

interface DailyContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyContentModal: React.FC<DailyContentModalProps> = ({ isOpen, onClose }) => {
  const { batchAddContentItems, showToast, setActiveTab, aiStatus } = useApp();

  const [postsPerDay, setPostsPerDay] = useState<number>(1);
  const [daysCount, setDaysCount] = useState<number>(3);
  const [outputMode, setOutputMode] = useState<'TEXT_ONLY' | 'REEL' | 'BOTH'>('REEL');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([
    'AI Automation',
    'WhatsApp Automation',
    'Lead Generation'
  ]);
  const [targetAudience, setTargetAudience] = useState('Small business owners & local clinics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPosts = postsPerDay * daysCount;

  const togglePillar = (pillarName: string) => {
    setSelectedPillars((prev) =>
      prev.includes(pillarName)
        ? prev.filter((p) => p !== pillarName)
        : [...prev, pillarName]
    );
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPillars.length === 0) {
      setErrorMessage('Please select at least one content pillar.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      setProgressText(`Connecting to ${aiStatus.model}...`);
      await new Promise((r) => setTimeout(r, 200));

      setProgressText(`Rotating angles & engineering ${totalPosts} short-form Reels...`);
      
      const variants = await aiGeneratorService.generateDailyBatch({
        postsPerDay,
        daysCount,
        selectedPillars,
        targetAudience
      });

      if (variants.length === 0) {
        throw new Error('No items generated. Please verify server connection.');
      }

      // Convert generated variants to ContentItem queue with scheduled dates
      const today = new Date();
      const newItems: Array<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>> = [];

      for (let index = 0; index < variants.length; index++) {
        const variant: any = variants[index];
        const dayOffset = Math.floor(index / postsPerDay) + 1;
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + dayOffset);
        const dateString = scheduleDate.toISOString().split('T')[0];

        const pillarObj =
          CONTENT_PILLARS.find((p) => p.name === variant.contentPillar) ||
          CONTENT_PILLARS[0];

        const itemTitle = variant.suggestedTitle || `Daily Reel #${index + 1}: ${variant.hook.slice(0, 40)}...`;

        // If REEL or BOTH mode is selected, generate storyboard and queue background render job
        let mediaUrl: string | undefined = undefined;
        if (outputMode === 'REEL' || outputMode === 'BOTH') {
          try {
            const sb = await mediaGenerationService.createStoryboard({
              contentId: `batch-item-${Date.now()}-${index}`,
              title: itemTitle,
              pillarId: pillarObj.id,
              variant,
              videoDuration: '30s'
            });

            const job = await mediaGenerationService.submitRenderJob({
              contentId: sb.contentId,
              contentTitle: itemTitle,
              storyboard: sb
            });

            mediaUrl = `/media/renders/reel_${job.id}.mp4`;
          } catch (mErr) {
            console.warn('Batch media job notice:', mErr);
          }
        }

        newItems.push({
          title: itemTitle,
          pillarId: pillarObj.id as ContentPillarId,
          platform: 'Instagram Reels',
          videoDuration: '30s',
          tone: 'Authoritative & Sharp',
          targetAudience,
          cta: (variant.cta as any) || 'DM "AUTOMATE"',
          status: 'REVIEW',
          scheduledDate: dateString,
          mediaUrl,
          mediaType: 'REELS',
          variant
        });
      }

      batchAddContentItems(newItems);
      showToast(
        `Generated & queued ${newItems.length} daily posts in Approval Queue${
          outputMode !== 'TEXT_ONLY' ? ' with 9:16 Reel render jobs' : ''
        }!`,
        'success'
      );
      onClose();
      setActiveTab('approval');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate daily content batch.');
    } finally {
      setIsGenerating(false);
      setProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Content Mode</h2>
              <p className="text-[11px] text-slate-400">
                Generate a multi-day rotating content queue for FLASH.Ai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Connection Banner */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                aiStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              Engine: <strong className="text-slate-100 uppercase">{aiStatus.provider} ({aiStatus.model})</strong>
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              aiStatus.isConnected
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {aiStatus.isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerateBatch} className="space-y-4 text-xs">
          {/* Posts per day & Days count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Posts Per Day</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPostsPerDay(num)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      postsPerDay === num
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
                    }`}
                  >
                    {num} / day
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                <span>Schedule Length</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[3, 5, 7, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDaysCount(days)}
                    className={`py-2 rounded-xl font-bold border transition-all text-[11px] ${
                      daysCount === days
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/20'
                        : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Output Mode (Step 4 Media Integration) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>Content Output Mode</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {outputMode === 'REEL' ? 'Default: 9:16 Vertical MP4s' : outputMode}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setOutputMode('TEXT_ONLY')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                  outputMode === 'TEXT_ONLY'
                    ? 'bg-slate-700 text-white border-slate-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
                }`}
              >
                Text Only
              </button>
              <button
                type="button"
                onClick={() => setOutputMode('REEL')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                  outputMode === 'REEL'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
                }`}
              >
                <span>🎬 REEL (Default)</span>
              </button>
              <button
                type="button"
                onClick={() => setOutputMode('BOTH')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                  outputMode === 'BOTH'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/20'
                    : 'bg-slate-900 text-slate-400 border-slate-750 hover:text-slate-200'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Pillar Multi-Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span>Rotate Pillars ({selectedPillars.length} selected)</span>
              <span className="text-[10px] text-slate-500">Auto-rotates without consecutive repeat</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {CONTENT_PILLARS.map((p) => {
                const isSelected = selectedPillars.includes(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePillar(p.name)}
                    className={`p-2 rounded-lg text-left text-[11px] font-medium border transition-all flex items-center justify-between ${
                      isSelected
                        ? `${p.badgeBg} border-cyan-400/50`
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Audience</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Small business owners, local clinics, startups"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Generating {totalPosts} Daily Reels...</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">{progressText}</p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Safety Enforced:</strong> All generated posts are routed to your Approval Queue for review. Never auto-published.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Synthesizing Queue...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Generate {totalPosts} Daily Reels ➔</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
