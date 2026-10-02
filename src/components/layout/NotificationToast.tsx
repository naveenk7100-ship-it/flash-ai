import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissToast } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-200',
          error: 'border-rose-500/40 bg-slate-900/95 text-rose-200',
          warning: 'border-amber-500/40 bg-slate-900/95 text-amber-200',
          info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-200'
        };

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/60 text-xs transition-all animate-in slide-in-from-right-5 duration-200 ${borders[n.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[n.type]}
              <span className="text-slate-100 font-medium">{n.message}</span>
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
