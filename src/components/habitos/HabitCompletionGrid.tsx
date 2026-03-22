'use client';

import { useMemo } from 'react';
import { getDaysInMonth, getDaysInYear, getLocalDateString } from '@/lib/utils/dates';
import { MONTHS_ES, DAYS_ES_SHORT } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

interface HabitCompletionGridProps {
  records: Map<string, boolean>;
  viewMode: 'mensual' | 'anual';
  year: number;
  month?: number;
  habitCreatedAt?: string;
}

function getCellColor(
  dateStr: string,
  completed: boolean | undefined,
  today: string,
  createdAt?: string
): string {
  if (dateStr > today) return 'bg-slate-800/30';
  if (createdAt && dateStr < createdAt.slice(0, 10)) return 'bg-transparent';
  if (completed === true) return 'bg-indigo-500';
  if (completed === false || completed === undefined) return 'bg-slate-700';
  return 'bg-slate-700';
}

function MonthLabel({ month, col }: { month: string; col: number }) {
  return (
    <div className="text-[10px] text-slate-500" style={{ gridColumn: col }}>
      {month}
    </div>
  );
}

export function HabitCompletionGrid({
  records,
  viewMode,
  year,
  month = 1,
  habitCreatedAt,
}: HabitCompletionGridProps) {
  const today = getLocalDateString();

  if (viewMode === 'mensual') {
    const days = getDaysInMonth(year, month);
    // Get day of week for first day (Monday = 0)
    const firstDow = (days[0].getDay() + 6) % 7;

    return (
      <div className="w-full">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_ES_SHORT.map((d) => (
            <div key={d} className="text-[10px] text-slate-500 text-center">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first week offset */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = getLocalDateString(day);
            const completed = records.get(dateStr);
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                title={dateStr}
                className={cn(
                  'aspect-square rounded-md transition-colors',
                  getCellColor(dateStr, completed, today, habitCreatedAt),
                  isToday && 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-950'
                )}
              />
            );
          })}
        </div>
        {/* Day numbers overlay - small */}
        <div className="grid grid-cols-7 gap-1 mt-1">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`n-empty-${i}`} />
          ))}
          {days.map((day) => (
            <div key={day.toISOString()} className="text-[9px] text-slate-600 text-center">
              {day.getDate()}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Annual view - GitHub style
  const allDays = getDaysInYear(year);
  // Group by week columns (ISO week, Mon first)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Pad first week
  const firstDow = (allDays[0].getDay() + 6) % 7;
  for (let i = 0; i < firstDow; i++) {
    currentWeek.push(new Date(0)); // placeholder
  }

  for (const day of allDays) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month label positions
  const monthLabels: { month: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const realDays = week.filter((d) => d.getTime() > 0);
    if (realDays.length > 0) {
      const m = realDays[0].getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ month: MONTHS_ES[m].slice(0, 3), col: i + 1 });
        lastMonth = m;
      }
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-0">
        {/* Month labels */}
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
        >
          {weeks.map((_, i) => {
            const label = monthLabels.find((l) => l.col === i + 1);
            return (
              <div key={i} className="text-[9px] text-slate-500 h-3">
                {label?.month ?? ''}
              </div>
            );
          })}
        </div>

        {/* Day rows */}
        {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
          <div
            key={dow}
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
          >
            {weeks.map((week, wi) => {
              const day = week[dow];
              if (!day || day.getTime() === 0) {
                return <div key={wi} className="w-3 h-3" />;
              }
              const dateStr = getLocalDateString(day);
              const completed = records.get(dateStr);
              const isToday = dateStr === today;
              return (
                <div
                  key={wi}
                  title={dateStr}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors',
                    getCellColor(dateStr, completed, today, habitCreatedAt),
                    isToday && 'ring-1 ring-indigo-400'
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
