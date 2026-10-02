import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CONTENT_PILLARS } from '../../constants/pillars';
import type { ContentItem } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const PublishingCalendar: React.FC = () => {
  const { contentItems } = useApp();
  const [calendarView, setCalendarView] = useState<'today' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filter approved or scheduled or published content items
  const scheduledItems = useMemo(() => {
    return contentItems.filter(
      (item) => item.scheduledDate || item.status === 'APPROVED' || item.status === 'PUBLISHED'
    );
  }, [contentItems]);

  // Group items by date string (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    scheduledItems.forEach((item) => {
      const dateKey = item.scheduledDate || new Date(item.createdAt).toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });
    return map;
  }, [scheduledItems]);

  // Generate days for Week view (7 days around currentDate)
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Today string
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarView === 'today') next.setDate(next.getDate() - 1);
    else if (calendarView === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarView === 'today') next.setDate(next.getDate() + 1);
    else if (calendarView === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Publishing Calendar
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Timezone: Asia/Kolkata (IST)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCalendarView('today')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                calendarView === 'today'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                calendarView === 'week'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                calendarView === 'month'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month
            </button>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Now
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. TODAY VIEW */}
      {calendarView === 'today' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200">
              Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {(itemsByDate[currentDate.toISOString().split('T')[0]] || []).length} Posts Scheduled
            </span>
          </div>

          <div className="space-y-3">
            {(itemsByDate[currentDate.toISOString().split('T')[0]] || []).length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/40 text-center text-xs text-slate-500">
                No content scheduled for this date.
              </div>
            ) : (
              (itemsByDate[currentDate.toISOString().split('T')[0]] || []).map((item) => (
                <CalendarItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {calendarView === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const items = itemsByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[220px] transition-colors ${
                  isToday
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday ? 'bg-cyan-500 text-black' : 'text-slate-300'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => {
                      const pillar =
                        CONTENT_PILLARS.find((p) => p.id === item.pillarId) || CONTENT_PILLARS[0];

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs space-y-1.5 ${
                            item.status === 'PUBLISHED'
                              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-sm'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-bold text-cyan-400 font-mono">
                              {item.scheduledTime || '18:00'}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded border font-semibold ${pillar.badgeBg}`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="font-bold text-[11px] line-clamp-2 text-white">
                            {item.title}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                            <span>Angle: {item.angle || 'Problem'}</span>
                            <span>•</span>
                            <span>{item.videoDuration || '30s'}</span>
                          </div>

                          {item.status === 'PUBLISHED' && (
                            <div className="pt-1 border-t border-cyan-500/20 text-[9px] text-emerald-300 font-mono flex items-center justify-between">
                              <span>Actual: Live</span>
                              <span className="text-cyan-300">CTA: {item.cta || 'DM "AUTOMATE"'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {items.length === 0 && (
                  <div className="text-[10px] text-slate-600 text-center py-4">
                    Empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MONTH VIEW (Simplified high-density grid) */}
      {calendarView === 'month' && (
        <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {scheduledItems.length} Scheduled & Published Items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 max-h-[460px] overflow-y-auto">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const dateStr = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
              const items = itemsByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  className={`p-2 rounded-xl border min-h-[90px] flex flex-col justify-between text-xs ${
                    dateStr === todayStr
                      ? 'bg-cyan-950/30 border-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-300">{dayNum}</span>
                    {items.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-black text-[9px] font-bold">
                        {items.length}
                      </span>
                    )}
                  </div>
                  {items.length > 0 ? (
                    <div className="space-y-0.5 mt-1">
                      {items.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-[9px] truncate text-slate-300 font-medium">
                          • {item.title}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-[8px] text-cyan-400">+{items.length - 2} more</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-600">No posts</div>
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

interface CalendarItemCardProps {
  item: ContentItem;
}

const CalendarItemCard: React.FC<CalendarItemCardProps> = ({ item }) => {
  const pillar = CONTENT_PILLARS.find((p) => p.id === item.pillarId) || CONTENT_PILLARS[0];

  return (
    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${pillar.badgeBg}`}>
            {pillar.name}
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] font-semibold">
            {item.platform}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[9px] font-mono">
            {item.scheduledTime || '18:00'} (Asia/Kolkata)
          </span>
        </div>
        <h4 className="text-sm font-bold text-white pt-0.5">{item.title}</h4>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
            item.status === 'PUBLISHED'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : item.status === 'APPROVED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
};
