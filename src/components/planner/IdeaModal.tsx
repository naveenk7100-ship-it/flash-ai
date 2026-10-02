import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentIdea, ContentPillarId, PlatformType, ContentStatus, VideoDuration } from '../../types';
import { CONTENT_PILLARS, CONTENT_STATUSES, VIDEO_DURATIONS } from '../../constants/pillars';
import { REEL_FORMATS, type ReelFormatId } from '../../services/reelFormatEngine';
import { contentMemoryService, type MemoryCheckResult } from '../../services/contentMemoryService';
import { X, Sparkles, Calendar, Tag, Layers, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaToEdit?: ContentIdea | null;
}

export const IdeaModal: React.FC<IdeaModalProps> = ({
  isOpen,
  onClose,
  ideaToEdit
}) => {
  const { addIdea, updateIdea, setActiveTab, setGeneratorPrefill } = useApp();

  const [title, setTitle] = useState('');
  const [pillarId, setPillarId] = useState<ContentPillarId>('ai-automation');
  const [platform, setPlatform] = useState<PlatformType>('Instagram Reels');
  const [formatId, setFormatId] = useState<ReelFormatId>('ai-automation-demo');
  const [status, setStatus] = useState<ContentStatus>('IDEA');
  const [scheduledDate, setScheduledDate] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<VideoDuration>('30s');
  const [notes, setNotes] = useState('');
  const [memoryCheck, setMemoryCheck] = useState<MemoryCheckResult | null>(null);

  useEffect(() => {
    if (ideaToEdit) {
      setTitle(ideaToEdit.title);
      setPillarId(ideaToEdit.pillarId);
      setPlatform(ideaToEdit.platform);
      setStatus(ideaToEdit.status);
      setScheduledDate(ideaToEdit.scheduledDate || '');
      setTargetAudience(ideaToEdit.targetAudience || '');
      setEstimatedDuration(ideaToEdit.estimatedDuration || '30s');
      setNotes(ideaToEdit.notes || '');
    } else {
      setTitle('');
      setPillarId('ai-automation');
      setPlatform('Instagram Reels');
      setStatus('IDEA');
      setScheduledDate('');
      setTargetAudience('Small business owners & local clinics');
      setEstimatedDuration('30s');
      setNotes('');
    }
  }, [ideaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (ideaToEdit) {
      updateIdea(ideaToEdit.id, {
        title: title.trim(),
        pillarId,
        platform,
        status,
        scheduledDate: scheduledDate || undefined,
        targetAudience: targetAudience.trim(),
        estimatedDuration,
        notes: notes.trim()
      });
    } else {
      addIdea({
        title: title.trim(),
        pillarId,
        platform,
        status,
        scheduledDate: scheduledDate || undefined,
        targetAudience: targetAudience.trim(),
        estimatedDuration,
        notes: notes.trim()
      });
    }
    onClose();
  };

  const handleGenerateNow = () => {
    if (!title.trim()) return;
    setGeneratorPrefill({
      topic: title.trim(),
      pillarId: pillarId,
      audience: targetAudience.trim()
    });
    onClose();
    setActiveTab('generator');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl shadow-black/80 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-base font-bold text-white">
              {ideaToEdit ? 'Edit Content Idea' : 'Add New Content Idea'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Content Topic / Idea Title *
              </label>
              {memoryCheck && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-1 ${
                    memoryCheck.isDuplicate ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {memoryCheck.isDuplicate ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>{memoryCheck.repetitionScore}% Repetition Risk</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Fresh Idea ({100 - memoryCheck.repetitionScore}% Novelty)</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (val.trim().length >= 8) {
                  const check = contentMemoryService.evaluateCandidate({
                    topic: val.trim(),
                    hook: val.trim(),
                    formatId
                  });
                  setMemoryCheck(check);
                } else {
                  setMemoryCheck(null);
                }
              }}
              placeholder="e.g. How to automate clinic appointment booking with WhatsApp AI"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />

            {/* Repetition Alert Banner */}
            {memoryCheck && memoryCheck.isDuplicate && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>No-Repeat Warning: Similar concept found in content memory</span>
                </div>
                <div className="text-[10px] text-rose-200/80">
                  {memoryCheck.reasons[0] || 'Consider shifting the angle or choosing a different format.'}
                </div>
              </div>
            )}
          </div>

          {/* Pillar & Reel Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Content Pillar</span>
              </label>
              <select
                value={pillarId}
                onChange={(e) => setPillarId(e.target.value as ContentPillarId)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {CONTENT_PILLARS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Reel Format (15 Types)</span>
              </label>
              <select
                value={formatId}
                onChange={(e) => {
                  const fid = e.target.value as ReelFormatId;
                  setFormatId(fid);
                  if (title.trim().length >= 8) {
                    setMemoryCheck(
                      contentMemoryService.evaluateCandidate({
                        topic: title.trim(),
                        hook: title.trim(),
                        formatId: fid
                      })
                    );
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {REEL_FORMATS.map((fmt) => (
                  <option key={fmt.id} value={fmt.id}>
                    {fmt.name} ({fmt.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Schedule Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Lifecycle Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {CONTENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Publishing Date</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Target Audience & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Local clinics & salon owners"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Video Duration</span>
              </label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value as VideoDuration)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {VIDEO_DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Concept Notes / Angles</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key points, demo highlights, client case study metrics..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-800">
            {title.trim().length > 0 && (
              <button
                type="button"
                onClick={handleGenerateNow}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in AI Generator ➔</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                {ideaToEdit ? 'Save Changes' : 'Create Idea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
