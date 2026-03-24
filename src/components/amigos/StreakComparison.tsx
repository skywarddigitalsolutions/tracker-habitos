'use client';

import { Flame } from 'lucide-react';

interface HabitStreak {
  name: string;
  color: string | null;
  myStreak: number;
  theirStreak: number;
}

interface StreakComparisonProps {
  myName: string;
  theirName: string;
  habits: HabitStreak[];
}

export function StreakComparison({ myName, theirName, habits }: StreakComparisonProps) {
  if (habits.length === 0) return null;

  const maxStreak = Math.max(...habits.flatMap((h) => [h.myStreak, h.theirStreak]), 1);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame size={15} style={{ color: 'var(--accent-text)' }} />
        <h3
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Rachas en común
        </h3>
      </div>

      <div className="space-y-4">
        {habits.map((habit) => {
          const myWin = habit.myStreak > habit.theirStreak;
          const theyWin = habit.theirStreak > habit.myStreak;

          return (
            <div key={habit.name}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color ?? '#6366f1' }}
                />
                <p className="text-xs font-semibold text-white">{habit.name}</p>
              </div>

              <div className="space-y-1.5">
                {/* My bar */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] w-14 truncate flex-shrink-0 text-right"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {myName}
                  </span>
                  <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{
                        width: `${(habit.myStreak / maxStreak) * 100}%`,
                        background: myWin
                          ? 'linear-gradient(90deg, #7c3aed, #4f46e5)'
                          : 'rgba(255,255,255,0.12)',
                        minWidth: habit.myStreak > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-bold w-10 flex-shrink-0 flex items-center gap-0.5"
                    style={{ color: myWin ? 'var(--accent-text)' : 'var(--text-secondary)' }}
                  >
                    {habit.myStreak}d {myWin && '🥇'}
                  </span>
                </div>

                {/* Their bar */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] w-14 truncate flex-shrink-0 text-right"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {theirName}
                  </span>
                  <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{
                        width: `${(habit.theirStreak / maxStreak) * 100}%`,
                        background: theyWin
                          ? 'linear-gradient(90deg, #059669, #10b981)'
                          : 'rgba(255,255,255,0.12)',
                        minWidth: habit.theirStreak > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-bold w-10 flex-shrink-0 flex items-center gap-0.5"
                    style={{ color: theyWin ? '#34d399' : 'var(--text-secondary)' }}
                  >
                    {habit.theirStreak}d {theyWin && '🥇'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
