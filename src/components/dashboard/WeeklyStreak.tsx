'use client';

import { Star } from 'lucide-react';

interface WeeklyStreakProps {
  data: { date: string; completionRate: number; rating: number | null }[];
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function WeeklyStreak({ data }: WeeklyStreakProps) {
  const today = new Date().toISOString().split('T')[0];
  const maxRate = Math.max(...data.map((d) => d.completionRate), 1);

  return (
    <div
      className="glass-card p-5 animate-fade-up stagger-1"
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Últimos 7 días
        </h3>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: 'var(--accent-subtle)',
            color: 'var(--accent-text)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          Esta semana
        </span>
      </div>

      {/* Chart */}
      <div
        role="img"
        aria-label="Gráfico de completado de hábitos de los últimos 7 días"
        className="flex items-end justify-between gap-2"
        style={{ height: '64px' }}
      >
        {data.map((day, i) => {
          const isToday = day.date === today;
          const height = day.completionRate === 0 ? 6 : Math.max(10, (day.completionRate / maxRate) * 56);

          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
              {/* Bar */}
              <div
                className="w-full rounded-md transition-all duration-500 cursor-default"
                style={{
                  height: `${height}px`,
                  background:
                    day.completionRate === 0
                      ? 'rgba(255,255,255,0.05)'
                      : isToday
                      ? 'linear-gradient(180deg, #a78bfa, #7c3aed)'
                      : 'linear-gradient(180deg, rgba(167,139,250,0.55), rgba(124,58,237,0.35))',
                  boxShadow:
                    isToday && day.completionRate > 0
                      ? '0 0 10px rgba(124,58,237,0.55)'
                      : 'none',
                }}
                title={`${day.date}: ${day.completionRate}% completado`}
              />
              {/* Star rating — using Lucide icon, not emoji */}
              {day.rating != null && (
                <Star
                  size={8}
                  fill="#fbbf24"
                  stroke="none"
                  aria-label={`Valoración: ${day.rating} estrellas`}
                />
              )}
              {/* Day label */}
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isToday ? 'var(--accent-text)' : 'var(--text-muted)' }}
              >
                {DAYS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
