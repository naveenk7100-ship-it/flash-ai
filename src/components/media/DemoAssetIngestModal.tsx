/**
 * FLASH.Ai Screen Recording & Demo Ingestion Modal (Phase 2 - Requirement 3)
 * 
 * Supports user-provided and demo assets:
 * - Screen recordings
 * - Website / demo videos
 * - Screenshots
 * - Project footage
 * 
 * Automatically organizes them into the 5 structured Reel scenes.
 */

import React, { useState } from 'react';
import type { RawMediaAsset } from '../../types/reelProduction';
import { demoAssetLibrary } from '../../services/demoAssetLibrary';
import {
  X,
  Film,
  Monitor,
  Image,
  Video,
  Sparkles,
  Layers
} from 'lucide-react';

interface DemoAssetIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetsOrganized: (assets: {
    screenRecording?: RawMediaAsset;
    websiteDemo?: RawMediaAsset;
    screenshots: RawMediaAsset[];
    projectFootage?: RawMediaAsset;
  }) => void;
}

export const DemoAssetIngestModal: React.FC<DemoAssetIngestModalProps> = ({
  isOpen,
  onClose,
  onAssetsOrganized
}) => {
  const [selectedScreenRec, setSelectedScreenRec] = useState<RawMediaAsset | undefined>(
    demoAssetLibrary.getAssetById('asset-demo-screenshot-terminal')
  );
  const [selectedWebDemo, setSelectedWebDemo] = useState<RawMediaAsset | undefined>(
    demoAssetLibrary.getAssetById('asset-demo-workflow-canvas')
  );
  const [selectedScreenshots, setSelectedScreenshots] = useState<RawMediaAsset[]>([
    demoAssetLibrary.getAssetById('asset-demo-screenshot-metrics') || demoAssetLibrary.getAllAssets()[0]
  ]);
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    onAssetsOrganized({
      screenRecording: selectedScreenRec,
      websiteDemo: selectedWebDemo,
      screenshots: selectedScreenshots
    });
    onClose();
  };

  const handleLoadFullDemoPackage = () => {
    setSelectedScreenRec(demoAssetLibrary.getAssetById('asset-demo-screenshot-terminal'));
    setSelectedWebDemo(demoAssetLibrary.getAssetById('asset-demo-workflow-canvas'));
    setSelectedScreenshots([
      demoAssetLibrary.getAssetById('asset-demo-screenshot-metrics')!,
      demoAssetLibrary.getAssetById('asset-demo-web-recording')!
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-3xl bg-[#090d16] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                ASSET INGESTION & AUTO-ORGANIZER
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              Provide Screen Recordings & Demo Assets
            </h3>
            <p className="text-xs text-slate-400">
              Provide screen recordings, demo clips, or UI screenshots. The engine automatically maps them to Hook, Problem, Demo, Payoff, and CTA scenes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Pack Trigger */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Zero-Credential Creator Demo Assets
            </span>
            <p className="text-[11px] text-slate-300">
              Load realistic terminal logs, workflow canvases, and ROI metrics with 1-click.
            </p>
          </div>
          <button
            onClick={handleLoadFullDemoPackage}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-colors shrink-0"
          >
            Load Demo Package
          </button>
        </div>

        {/* 1. Screen Recording Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-purple-400" />
            1. Screen Recording / Terminal Footage (Problem & Setup)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoAssetLibrary.getAllAssets().map((asset) => {
              const isSelected = selectedScreenRec?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedScreenRec(asset)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-white block truncate text-[11px]">
                    {asset.name}
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono uppercase">
                    {asset.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Website / Product Demo Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-cyan-400" />
            2. Website / Product Demo Footage (Demo & Value Stage)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoAssetLibrary.getAllAssets().map((asset) => {
              const isSelected = selectedWebDemo?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedWebDemo(asset)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-white block truncate text-[11px]">
                    {asset.name}
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono uppercase">
                    {asset.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Screenshots & Metrics */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Image className="w-4 h-4 text-emerald-400" />
            3. Screenshots & Metrics Visuals (Result & Payoff)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoAssetLibrary.getAllAssets().map((asset) => {
              const isSelected = selectedScreenshots.some((s) => s.id === asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedScreenshots(selectedScreenshots.filter((s) => s.id !== asset.id));
                    } else {
                      setSelectedScreenshots([...selectedScreenshots, asset]);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-white block truncate text-[11px]">
                    {asset.name}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono uppercase">
                    {isSelected ? '✓ Selected' : asset.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom URL Ingestion */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Or Paste Custom Video/Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://... or /media/assets/..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              onClick={() => {
                if (customUrl.trim()) {
                  const newAsset = demoAssetLibrary.addAsset({
                    name: 'Custom User Asset',
                    type: 'screenshot',
                    url: customUrl.trim(),
                    tags: ['custom']
                  });
                  setSelectedScreenshots([...selectedScreenshots, newAsset]);
                  setCustomUrl('');
                }
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Add Asset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95"
          >
            <Layers className="w-4 h-4" />
            Auto-Organize into Reel Scenes
          </button>
        </div>
      </div>
    </div>
  );
};
