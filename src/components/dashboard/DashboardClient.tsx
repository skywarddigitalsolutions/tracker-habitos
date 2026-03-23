'use client';

import { useState, useCallback } from 'react';
import { TodayProgress } from './TodayProgress';
import { HabitList } from './HabitList';
import type { Habit, HabitRecord } from '@/lib/supabase/types';

interface DashboardClientProps {
  habits: Habit[];
  initialRecords: HabitRecord[];
  today: string;
  userName?: string;
}

export function DashboardClient({ habits, initialRecords, today, userName }: DashboardClientProps) {
  const [completedCount, setCompletedCount] = useState(() => {
    return initialRecords.filter((r) => r.date === today && r.completed).length;
  });

  const handleToggle = useCallback((wasCompleted: boolean) => {
    setCompletedCount((prev) => wasCompleted ? prev - 1 : prev + 1);
  }, []);

  const activeHabits = habits.filter((h) => !h.is_archived);

  return (
    <>
      <TodayProgress
        completed={completedCount}
        total={activeHabits.length}
        userName={userName}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hábitos de hoy
          </h3>
        </div>
        <HabitList
          habits={activeHabits}
          initialRecords={initialRecords}
          today={today}
          onToggle={handleToggle}
        />
      </div>
    </>
  );
}
