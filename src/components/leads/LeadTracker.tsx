import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Lead, LeadStatus, LeadPlatform } from '../../types';
import { LEAD_STATUSES } from '../../constants/pillars';
import { LeadModal } from './LeadModal';
import {
  Users,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Edit2,
  Trash2,
  Download,
  MessageSquare,
  Activity
} from 'lucide-react';

const ALL_PLATFORMS: Array<LeadPlatform | 'ALL'> = [
  'ALL',
  'Instagram DM',
  'Instagram Comment',
  'Instagram Story Reply',
  'WhatsApp',
  'Website',
  'LinkedIn',
  'Referral'
];

export const LeadTracker: React.FC = () => {
  const { leads, updateLead, deleteLead, showToast, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const statusColors: Record<LeadStatus, string> = {
    NEW: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    CONTACTED: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    REPLIED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    QUALIFIED: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    PROPOSAL: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    WON: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    LOST: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.instagramUsername && lead.instagramUsername.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesPlatform = platformFilter === 'ALL' || lead.platform === platformFilter;

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [leads, searchQuery, statusFilter, platformFilter]);

  // Lead metrics
  const totalLeads = leads.length;
  const instagramLeadsCount = leads.filter((l) => l.platform.startsWith('Instagram')).length;
  const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED' || l.status === 'PROPOSAL' || l.status === 'WON').length;
  const wonCount = leads.filter((l) => l.status === 'WON').length;
  const totalPipeline = leads.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
  const wonPipeline = leads.filter((l) => l.status === 'WON').reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

  const handleOpenAdd = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLead(leadId, { status: newStatus });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Business', 'Platform', 'Source', 'Requirement', 'Status', 'Date', 'Value', 'Instagram', 'Notes'];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.business}"`,
      `"${l.platform}"`,
      `"${l.source}"`,
      `"${l.requirement}"`,
      `"${l.status}"`,
      `"${l.date}"`,
      `"${l.estimatedDealValue || 0}"`,
      `"${l.instagramUsername || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flash_ai_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported leads CSV', 'success');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Lead Tracker (Inbound CRM)</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track inquiries, direct messages, and comments generated by FLASH.Ai content funnels and Meta Webhooks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Inbound Inbox</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-md shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">{totalLeads}</div>
          <div className="text-[10px] text-slate-400">All inbound channels</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Instagram Leads</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-300">{instagramLeadsCount}</div>
          <div className="text-[10px] text-cyan-400 font-mono">DMs & Comments</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Qualified</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">{qualifiedCount}</div>
          <div className="text-[10px] text-slate-400">High intent prospects</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Deals Won</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">{wonCount}</div>
          <div className="text-[10px] text-emerald-400 font-mono">
            ₹{(wonPipeline / 1000).toFixed(0)}k Closed
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Pipeline</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-300">
            ₹{(totalPipeline / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-slate-400">Estimated value</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead, business, @handle..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 w-full"
            >
              {ALL_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Channels' : p}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 flex-1 sm:flex-initial"
          >
            <option value="ALL">All Statuses</option>
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table (Responsive Desktop & Mobile Cards) */}
      {filteredLeads.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No leads match your search</h3>
            <p className="text-xs text-slate-400">
              Log client inquiries from Instagram comments, WhatsApp, or website forms.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all"
          >
            Log New Lead
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Lead & Business</th>
                    <th className="p-3.5">Platform & Source</th>
                    <th className="p-3.5">Requirement & Intent</th>
                    <th className="p-3.5">Pipeline Status</th>
                    <th className="p-3.5">Est. Value</th>
                    <th className="p-3.5">Activity Log</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredLeads.map((lead) => {
                    const activityCount = lead.activityTimeline?.length || 0;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{lead.name}</span>
                            {lead.instagramUsername && (
                              <span className="text-[10px] text-cyan-400 font-mono">
                                @{lead.instagramUsername}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{lead.business}</div>
                          {lead.contactInfo?.handle && !lead.instagramUsername && (
                            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                              {lead.contactInfo.handle}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-300">{lead.platform}</span>
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {lead.sourcePostTitle || lead.source}
                          </div>
                        </td>

                        <td className="p-3.5 max-w-xs text-slate-300 space-y-1">
                          <div className="line-clamp-1">{lead.requirement}</div>
                          {lead.intent && (
                            <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                              Intent: {lead.intent}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${statusColors[lead.status]}`}
                          >
                            {LEAD_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-[#090d16] text-slate-200">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                          {lead.estimatedDealValue ? `₹${lead.estimatedDealValue.toLocaleString()}` : '—'}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => handleEdit(lead)}
                            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{activityCount} events</span>
                          </button>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Edit Lead & Timeline"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete lead "${lead.name}"?`)) {
                                  deleteLead(lead.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Mobile Card View (320px - 480px friendly) */}
          <div className="lg:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{lead.name}</span>
                      {lead.instagramUsername && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          @{lead.instagramUsername}
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-400">{lead.business}</div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${statusColors[lead.status]}`}
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-[#090d16] text-slate-200">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Requirement</span>
                    {lead.intent && (
                      <span className="text-indigo-400 font-mono lowercase">#{lead.intent}</span>
                    )}
                  </div>
                  <p>{lead.requirement}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">{lead.platform}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {lead.estimatedDealValue ? `₹${lead.estimatedDealValue.toLocaleString()}` : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>{lead.activityTimeline?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete lead "${lead.name}"?`)) {
                          deleteLead(lead.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-slate-800 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leadToEdit={editingLead}
      />
    </div>
  );
};
