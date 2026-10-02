import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Lead, LeadStatus, LeadPlatform } from '../../types';
import { LEAD_STATUSES } from '../../constants/pillars';
import {
  X,
  User,
  Building,
  Activity,
  MessageSquare,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

const PLATFORM_OPTIONS: LeadPlatform[] = [
  'Instagram DM',
  'Instagram Comment',
  'Instagram Story Reply',
  'WhatsApp',
  'Website',
  'LinkedIn',
  'Referral'
];

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  leadToEdit
}) => {
  const { addLead, updateLead } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [platform, setPlatform] = useState<LeadPlatform>('Instagram DM');
  const [source, setSource] = useState('Reel: Comment "AUTOMATE"');
  const [requirement, setRequirement] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [handle, setHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [estimatedDealValue, setEstimatedDealValue] = useState<number | ''>(50000);

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setBusiness(leadToEdit.business);
      setPlatform(leadToEdit.platform);
      setSource(leadToEdit.source);
      setRequirement(leadToEdit.requirement);
      setStatus(leadToEdit.status);
      setDate(leadToEdit.date);
      setNotes(leadToEdit.notes);
      setHandle(leadToEdit.contactInfo?.handle || leadToEdit.instagramUsername ? `@${leadToEdit.instagramUsername}` : '');
      setPhone(leadToEdit.contactInfo?.phone || '');
      setEmail(leadToEdit.contactInfo?.email || '');
      setEstimatedDealValue(leadToEdit.estimatedDealValue || '');
      setActiveTab('details');
    } else {
      setName('');
      setBusiness('');
      setPlatform('Instagram DM');
      setSource('Reel: Comment "AUTOMATE"');
      setRequirement('WhatsApp AI Automation Bot');
      setStatus('NEW');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setHandle('');
      setPhone('');
      setEmail('');
      setEstimatedDealValue(50000);
      setActiveTab('details');
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !business.trim()) return;

    const leadData = {
      name: name.trim(),
      business: business.trim(),
      platform,
      source: source.trim(),
      requirement: requirement.trim(),
      status,
      date,
      notes: notes.trim(),
      contactInfo: {
        handle: handle.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined
      },
      estimatedDealValue: typeof estimatedDealValue === 'number' ? estimatedDealValue : undefined
    };

    if (leadToEdit) {
      updateLead(leadToEdit.id, leadData);
    } else {
      addLead(leadData);
    }
    onClose();
  };

  const timeline = leadToEdit?.activityTimeline || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-slate-700/80 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {leadToEdit ? `Lead: ${leadToEdit.name}` : 'Log New Inbound Lead'}
            </h2>
            {leadToEdit?.intent && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                {leadToEdit.intent}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if lead exists */}
        {leadToEdit && (
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-1 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Lead Details & Pipeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`pb-1 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Activity Timeline ({timeline.length})</span>
            </button>
          </div>
        )}

        {/* TAB 1: Lead Details Form */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Name & Business */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contact Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sameer Khan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>Business / Organization *</span>
                </label>
                <input
                  type="text"
                  required
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="e.g. Apex Health Clinics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Platform & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Platform Channel</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as LeadPlatform)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Origin / Post Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Reel: WhatsApp Booking Bot"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Requirement */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Requirement / Service Sought</label>
              <input
                type="text"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="e.g. 24/7 WhatsApp AI receptionist and calendar sync"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Status, Date & Deal Value */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Pipeline Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Capture Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Est. Deal Value (₹)</label>
                <input
                  type="number"
                  value={estimatedDealValue}
                  onChange={(e) => setEstimatedDealValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Handle / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Instagram Handle / WhatsApp</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@dr.sameer or +91 98000 00000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sameer@clinic.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Notes & Conversation Summary</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Next steps, demo call schedule, client pain points..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 resize-none focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/25"
              >
                {leadToEdit ? 'Save Changes' : 'Save Inbound Lead'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Activity Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {timeline.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No automated activity logged yet for this lead.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-3 py-2">
                {timeline.map((act) => {
                  const isComment = act.type === 'COMMENT_RECEIVED';
                  const isDM = act.type === 'DM_RECEIVED';
                  const isKeyword = act.type === 'KEYWORD_DETECTED';
                  const isAutoReply = act.type === 'AUTO_REPLY_SENT';

                  return (
                    <div key={act.id} className="relative space-y-1">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                          isAutoReply
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                            : isKeyword
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : isDM || isComment
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isAutoReply ? (
                          <Zap className="w-3 h-3" />
                        ) : isKeyword ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{act.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
