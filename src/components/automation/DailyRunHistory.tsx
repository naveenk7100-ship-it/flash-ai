import React, { useState } from 'react';
import type { DailyRun, DailyRunStep } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Film,
  Sparkles,
  Users,
  Share2,
  Layers
} from 'lucide-react';

interface DailyRunHistoryProps {
  history: DailyRun[];
}

export const DailyRunHistory: React.FC<DailyRunHistoryProps> = ({
  history
}) => {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedRunId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: DailyRun['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            PARTIAL
          </span>
        );
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            RUNNING
          </span>
        );
      case 'WAITING_APPROVAL':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
            <Clock className="w-3 h-3" />
            WAITING APPROVAL
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
            {status}
          </span>
        );
    }
  };

  const getStepStatusIcon = (status: DailyRunStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'RUNNING':
        return <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />;
      case 'WAITING_ACTION':
        return <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mx-0.5 shrink-0" />;
    }
  };

  if (history.length === 0) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-3">
        <Clock className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Automation Run History</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Runs executed through the Daily Content Operating System will be logged here with complete 13-stage execution timelines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Daily Run Execution History</h3>
          <p className="text-[11px] text-slate-400">
            Historical audit logs with step-by-step timestamps and failure recovery inspection.
          </p>
        </div>
        <span className="text-xs text-cyan-400 font-mono font-bold">
          {history.length} Logged Runs
        </span>
      </div>

      <div className="space-y-3">
        {history.map((run) => {
          const isExpanded = expandedRunId === run.id;

          return (
            <div
              key={run.id}
              className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all hover:border-slate-750"
            >
              {/* Header Summary Accordion */}
              <div
                onClick={() => toggleExpand(run.id)}
                className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-slate-850/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusBadge(run.status)}
                  <div>
                    <div className="flex items-center gap-2 font-black text-sm text-white">
                      <span>{run.date}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({run.id})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>
                      {run.completedAt && (
                        <>
                          <span>•</span>
                          <span>Completed: {new Date(run.completedAt).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Pill Ribbon */}
                <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
                  <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <strong>{run.contentItemsGenerated}</strong> Scripts
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Film className="w-3 h-3 text-purple-400" />
                    <strong>{run.reelsRendered}</strong> Reels
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-emerald-400" />
                    <strong>{run.publishedCount}</strong> Pub
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <strong>{run.leadsCaptured}</strong> Leads
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Detailed 13-Stage Stepper & Errors */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                  {/* Step Execution Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>13-Stage Workflow Timeline</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {run.steps.map((step) => (
                        <div
                          key={step.stepId}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-200">
                              {getStepStatusIcon(step.status)}
                              <span className="truncate text-[11px]">{step.name}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                              {step.status}
                            </span>
                          </div>

                          {step.details && (
                            <p className="text-[10px] text-slate-400 line-clamp-2 pl-5">
                              {step.details}
                            </p>
                          )}

                          {step.error && (
                            <p className="text-[10px] text-rose-400 font-mono pl-5">
                              Error: {step.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Planned Items in this Run */}
                  {run.plannedItems && run.plannedItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Planned Reels in this Run
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {run.plannedItems.map((item, i) => (
                          <div
                            key={item.id || i}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-cyan-300 uppercase">
                                {item.pillar}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono ${
                                  item.approvalStatus === 'APPROVED'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : item.approvalStatus === 'REJECTED'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {item.approvalStatus || 'PENDING'}
                              </span>
                            </div>
                            <div className="font-semibold text-white line-clamp-1">
                              {item.topic}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Angle: {item.angle} • Slot: {item.scheduledTime || '18:00'} IST
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Log & Diagnostics if any */}
                  {run.errors && run.errors.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Recoverable Error Log ({run.errors.length})</span>
                      </div>
                      <div className="space-y-1">
                        {run.errors.map((err) => (
                          <div key={err.id} className="text-[11px] text-rose-300 font-mono flex items-start gap-1.5">
                            <span>•</span>
                            <span>
                              <strong>[{err.stepId}]</strong> {err.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
