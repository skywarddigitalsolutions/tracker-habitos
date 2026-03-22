'use client';

import { cn } from '@/lib/utils/cn';

interface WeeklyStreakProps {
  data: { date: string; completionRate: number; rating: number | null }[];
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function WeeklyStreak({ data }: WeeklyStreakProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Últimos 7 días</h3>
      <div className="flex items-end justify-between gap-1">
        {data.map((day, i) => {
          const rate = day.completionRate;
          const isGood = rate >= 75;
          const isMid = rate >= 50 && rate < 75;

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  'w-full rounded-md transition-all',
                  rate === 0 ? 'bg-slate-800 h-2' : 'h-8',
                  isGood ? 'bg-indigo-500' : isMid ? 'bg-indigo-500/60' : 'bg-indigo-500/30'
                )}
                style={{ height: rate > 0 ? `${Math.max(8, rate * 0.32 + 8)}px` : '8px' }}
                title={`${day.date}: ${rate}%`}
              />
              {day.rating != null && (
                <span className="text-[9px] text-yellow-400">{'★'.repeat(Math.round(day.rating))}</span>
              )}
              <span className="text-[10px] text-slate-500">
                {DAYS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
