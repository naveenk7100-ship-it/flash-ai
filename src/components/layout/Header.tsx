import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, Sparkles, ShieldCheck, RefreshCw, Presentation } from 'lucide-react';
import { PublicPresentationModal } from '../presentation/PublicPresentationModal';

export const Header: React.FC = () => {
  const { setActiveTab, stats, resetAllData, metaStatus, publishingMode } = useApp();
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base lg:text-lg">
                  FLASH<span className="text-cyan-400">.Ai</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Meta Publishing Engine
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                AI Automation & Digital Solutions
              </p>
            </div>
          </div>
        </div>

        {/* Center / Status Pills */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target: <strong className="text-slate-100">AI Tools, Model Updates & Workflows</strong></span>
          </div>

          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Meta API:{' '}
              {metaStatus.isConnected ? (
                <span className="text-emerald-400 font-bold">CONNECTED ({metaStatus.username})</span>
              ) : (
                <span className="text-amber-400 font-mono">DEMO MODE</span>
              )}
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
              publishingMode === 'LIVE' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {publishingMode}
            </span>
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-2">
          {stats.awaitingApprovalCount > 0 && (
            <button
              onClick={() => setActiveTab('approval')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Review ({stats.awaitingApprovalCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs shadow-md shadow-cyan-500/25 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">AI Content</span> Generator
          </button>

          <button
            onClick={() => setIsPresentationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all shadow-sm"
            title="System Tour & Showcase"
          >
            <Presentation className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Showcase</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default FLASH.Ai seed state?')) {
                resetAllData();
              }
            }}
            title="Reset Data"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PublicPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </header>
  );
};
