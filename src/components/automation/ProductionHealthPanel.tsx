import React, { useState, useEffect } from 'react';
import {
  systemService,
  type HealthResponse,
  type StorageStatsResponse,
  type PublicMediaStatusResponse
} from '../../services/systemService';
import {
  Server,
  Database,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  HardDrive
} from 'lucide-react';

interface ProductionHealthPanelProps {
  showToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ProductionHealthPanel: React.FC<ProductionHealthPanelProps> = ({ showToast }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [storage, setStorage] = useState<StorageStatsResponse | null>(null);
  const [mediaUrlStatus, setMediaUrlStatus] = useState<PublicMediaStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setIsRefreshing(true);
    try {
      const [h, s, m] = await Promise.all([
        systemService.getHealth(),
        systemService.getStorageStats(),
        systemService.getPublicMediaStatus()
      ]);
      if (h) setHealth(h);
      if (s) setStorage(s);
      if (m) setMediaUrlStatus(m);
    } catch (err) {
      console.error('Failed to load production health data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const success = await systemService.createBackup();
      if (success) {
        showToast('System state backup created successfully in server/data/backups', 'success');
        await loadHealthData();
      } else {
        showToast('Failed to create backup', 'error');
      }
    } catch {
      showToast('Backup request error', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (days > 0) return `${days}d ${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header Bar */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white">Production Server & Persistence Health</h3>
          </div>
          <p className="text-xs text-slate-400">
            Node.js backend execution state, atomic disk persistence, and Meta LIVE reachability diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHealthData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-black hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBackingUp ? 'Backing Up...' : 'Trigger Backup'}</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Server Uptime & Process */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Process Runtime</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">
            {health ? formatUptime(health.uptime) : 'Online'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Environment: <strong className="text-cyan-300 uppercase">{health?.environment || 'DEVELOPMENT'}</strong>
          </div>
        </div>

        {/* 2. Persistence Mode */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>State Persistence</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white flex items-center gap-1.5">
            <span>FILE</span>
            <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ATOMIC
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Location: <span className="text-slate-300">./server/data/</span>
          </div>
        </div>

        {/* 3. Disk Entity Records */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Persisted Records</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-300 font-mono">
            {storage ? storage.storage.runsCount + storage.storage.jobsCount + storage.storage.leadsCount : 0}
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>{storage?.storage.runsCount || 0} Runs</span>
            <span>•</span>
            <span>{storage?.storage.jobsCount || 0} Jobs</span>
            <span>•</span>
            <span>{storage?.storage.leadsCount || 0} Leads</span>
          </div>
        </div>

        {/* 4. Meta Live Reachability */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Meta Live Delivery</span>
            <Globe className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-sm font-black text-white">
            {mediaUrlStatus?.mediaStatus.isPubliclyAccessible ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PUBLIC HTTPS
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                DEMO / LOCAL ONLY
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {mediaUrlStatus?.mediaStatus.publicBaseUrl || 'PUBLIC_BASE_URL empty'}
          </div>
        </div>
      </div>

      {/* Meta Live Reachability Diagnostic Banner */}
      {mediaUrlStatus && !mediaUrlStatus.mediaStatus.isPubliclyAccessible && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Meta Graph API Public Delivery Requirement</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {mediaUrlStatus.mediaStatus.explanation}
          </p>
          <div className="p-2 rounded-xl bg-slate-900/90 text-[11px] font-mono text-cyan-300 border border-slate-800">
            {mediaUrlStatus.mediaStatus.recommendation}
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Server State Snapshots & Backups
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {storage?.backups.length || 0} Backups Created
          </span>
        </div>

        {storage && storage.backups.length > 0 ? (
          <div className="space-y-2">
            {storage.backups.slice(0, 5).map((b) => (
              <div
                key={b.backupId}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-slate-200">{b.backupId}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(b.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {(b.fileSize / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
            No backup snapshots generated yet. Click "Trigger Backup" above to create an atomic snapshot.
          </div>
        )}
      </div>
    </div>
  );
};
