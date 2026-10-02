import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AppTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  CheckSquare,
  Users,
  MoreHorizontal,
  BarChart3,
  Sliders,
  GitBranch,
  Share2,
  Activity,
  X,
  Film,
  MessageSquare,
  Zap
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, stats, publishingMode } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: { id: AppTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'generator', label: 'Generate', icon: Sparkles },
    { id: 'approval', label: 'Approval', icon: CheckSquare, badge: stats.awaitingApprovalCount },
    { id: 'leads', label: 'Leads', icon: Users, badge: stats.activeLeadsCount }
  ];

  const moreTabs: { id: AppTab; label: string; icon: React.ElementType; desc: string; badge?: string }[] = [
    {
      id: 'automation',
      label: 'Automation OS',
      icon: Zap,
      desc: '13-stage unified daily content operating pipeline',
      badge: 'STEP 7'
    },
    {
      id: 'inbox',
      label: 'Engagement & Leads Inbox',
      icon: MessageSquare,
      desc: 'Meta Webhooks, keyword auto-replies & CRM capture',
      badge: 'AUTO'
    },
    {
      id: 'media',
      label: 'Reel & Media Studio',
      icon: Film,
      desc: '9:16 vertical MP4 video rendering engine & assets',
      badge: '9:16'
    },
    {
      id: 'published',
      label: 'Published Content',
      icon: Share2,
      desc: 'Archive of published Instagram posts & IDs',
      badge: stats.publishedCount > 0 ? `${stats.publishedCount}` : undefined
    },
    {
      id: 'activity',
      label: 'Publishing Activity Log',
      icon: Activity,
      desc: 'Real-time audit log of publishing events'
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      desc: 'Views, reach, engagement & saves',
      badge: publishingMode
    },
    {
      id: 'architecture',
      label: 'Engine Pipeline',
      icon: GitBranch,
      desc: '10-stage automation blueprint'
    },
    {
      id: 'settings',
      label: 'Meta API & Settings',
      icon: Sliders,
      desc: 'Meta Graph API & safety mode switch'
    }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-6 items-center gap-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/40'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-105' : ''}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-500 text-black font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More Drawer Trigger */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              showMoreMenu || ['inbox', 'media', 'published', 'activity', 'analytics', 'architecture', 'settings'].includes(activeTab)
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-up "More" Sheet on Mobile */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div
            className="flex-1"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="bg-[#0e1320] border-t border-slate-700/80 rounded-t-3xl p-5 pb-8 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  FLASH.Ai Modules
                </h3>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{tab.label}</span>
                        {tab.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
