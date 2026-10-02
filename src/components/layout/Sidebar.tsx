import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AppTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  CheckSquare,
  Share2,
  Activity,
  Users,
  BarChart3,
  Sliders,
  GitBranch,
  ChevronRight,
  Zap,
  Film,
  MessageSquare
} from 'lucide-react';

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, publishingMode, metaStatus } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'automation',
      label: 'Automation OS',
      icon: Zap,
      badge: 'RUN',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      highlight: true
    },
    {
      id: 'planner',
      label: 'Content Planner',
      icon: CalendarDays,
      badge: stats.plannedCount > 0 ? stats.plannedCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'generator',
      label: 'AI Content Generator',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'media',
      label: 'Reel & Media Studio',
      icon: Film,
      badge: '9:16',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'approval',
      label: 'Approval Queue',
      icon: CheckSquare,
      badge: stats.awaitingApprovalCount > 0 ? stats.awaitingApprovalCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'published',
      label: 'Published Content',
      icon: Share2,
      badge: stats.publishedCount > 0 ? stats.publishedCount : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'inbox',
      label: 'Inbound & Engagement',
      icon: MessageSquare,
      badge: 'AUTO',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    {
      id: 'activity',
      label: 'Activity Log',
      icon: Activity
    },
    {
      id: 'leads',
      label: 'Lead Tracker',
      icon: Users,
      badge: stats.activeLeadsCount > 0 ? stats.activeLeadsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: publishingMode === 'LIVE' && metaStatus.isConnected ? 'LIVE' : 'DEMO',
      badgeColor:
        publishingMode === 'LIVE' && metaStatus.isConnected
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'architecture',
      label: 'Engine Architecture',
      icon: GitBranch
    },
    {
      id: 'settings',
      label: 'Settings & Meta API',
      icon: Sliders
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#090d16] border-r border-slate-800/80 p-4 shrink-0 min-h-[calc(100vh-61px)]">
      {/* Brand Mini Banner */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-200">Meta Graph Engine</span>
          </div>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
              publishingMode === 'LIVE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {publishingMode}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Instagram Reels & Carousel official publishing system.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-cyan-400 group-hover:scale-110'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Account Status */}
      <div className="pt-3 mt-3 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-black text-xs">
            ⚡
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {metaStatus.username ? `@${metaStatus.username}` : 'FLASH.Ai Official'}
            </h4>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {metaStatus.isConnected ? 'Meta Connected' : 'Demo Active'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
