import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
  RefreshCw
} from 'lucide-react';

export const PublishingActivityLog: React.FC = () => {
  const { activityLogs, clearActivityLogs, publishingJobs, retryPublishingJob } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredLogs = activityLogs.filter((log) => {
    if (filterStatus === 'ALL') return true;
    return log.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>ERROR</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>PROCESSING</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Publishing Activity Log
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              {activityLogs.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time audit log of container creations, status checks, publishing runs, and retry events.
          </p>
        </div>

        {/* Filter & Clear Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-slate-200"
            >
              <option value="ALL">All Events</option>
              <option value="SUCCESS">Success Only</option>
              <option value="ERROR">Errors Only</option>
              <option value="PROCESSING">Processing</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Clear all publishing activity logs?')) {
                clearActivityLogs();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Activity Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <Activity className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-300">No Activity Logged</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Publishing operations, Meta verification calls, and scheduler actions will be logged here.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => {
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              const relatedFailedJob = log.status === 'ERROR' && log.jobId
                ? publishingJobs.find((j) => j.id === log.jobId && j.status === 'FAILED')
                : null;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(log.status)}
                      <span className="font-bold text-slate-100">{log.action}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleDateString()} @ {timeFormatted}
                      </span>
                      {log.isDemo && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[9px] font-bold">
                          DEMO
                        </span>
                      )}
                    </div>

                    <div className="text-slate-300 font-medium pt-0.5">
                      {log.contentTitle}
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      {log.message}
                    </p>
                  </div>

                  {/* Retry Button for Failed Jobs */}
                  {relatedFailedJob && (
                    <button
                      onClick={() => retryPublishingJob(relatedFailedJob.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Job</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
