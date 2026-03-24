'use client';

import { Star, BookOpen } from 'lucide-react';
import { formatShortDate } from '@/lib/utils/dates';

interface DayNote {
  date: string;
  rating: number | null;
  notes: string | null;
  completionRate: number;
}

interface WeeklyNotesProps {
  data: DayNote[];
}

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < rating ? '#fbbf24' : 'transparent'}
          stroke={i < rating ? '#fbbf24' : '#4b5563'}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function WeeklyNotes({ data }: WeeklyNotesProps) {
  // Only show days that have either a rating or a note, most recent first
  const days = data
    .filter((d) => d.rating !== null || (d.notes && d.notes.trim()))
    .slice()
    .reverse();

  if (days.length === 0) return null;

  return (
    <div className="glass-card p-5 animate-fade-up stagger-3">
      <div className="flex items-center gap-2.5 mb-4">
        <BookOpen size={16} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
        <h3
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Reflexiones de la semana
        </h3>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const d = new Date(day.date + 'T12:00:00');
          const dayName = DAY_NAMES[d.getDay()];
          const shortDate = formatShortDate(d);
          const isToday = day.date === new Date().toLocaleDateString('en-CA');

          return (
            <div
              key={day.date}
              className="rounded-xl px-4 py-3"
              style={{
                background: isToday
                  ? 'rgba(124,58,237,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isToday ? 'rgba(124,58,237,0.22)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isToday ? 'var(--accent-text)' : 'var(--text-secondary)' }}
                  >
                    {isToday ? 'Hoy' : dayName}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {shortDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {day.rating !== null && <StarRow rating={day.rating} />}
                  {day.completionRate > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{
                        background: day.completionRate === 100
                          ? 'rgba(16,185,129,0.12)'
                          : 'rgba(255,255,255,0.06)',
                        color: day.completionRate === 100 ? '#34d399' : 'var(--text-muted)',
                      }}
                    >
                      {day.completionRate}%
                    </span>
                  )}
                </div>
              </div>

              {/* Note text */}
              {day.notes && day.notes.trim() && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {day.notes.trim()}
                </p>
              )}
              {(!day.notes || !day.notes.trim()) && day.rating !== null && (
                <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  Sin nota escrita
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
