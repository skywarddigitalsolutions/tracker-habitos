'use client';

import { useState, useCallback } from 'react';
import { HabitCard } from '@/components/habitos/HabitCard';
import type { Habit, HabitRecord } from '@/lib/supabase/types';

interface HabitListProps {
  habits: Habit[];
  initialRecords: HabitRecord[];
  today: string;
  onToggle?: (wasCompleted: boolean) => void;
}

export function HabitList({ habits, initialRecords, today, onToggle }: HabitListProps) {
  const [records, setRecords] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    for (const r of initialRecords) {
      if (r.date === today) {
        map.set(r.habit_id, r.completed);
      }
    }
    return map;
  });
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const toggleHabit = useCallback(async (habitId: string) => {
    const current = records.get(habitId) ?? false;

    // Optimistic update
    onToggle?.(current);
    setRecords((prev) => {
      const next = new Map(prev);
      next.set(habitId, !current);
      return next;
    });
    setToggling((prev) => new Set(prev).add(habitId));

    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date: today, completed: !current }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
    } catch {
      // Revert on error
      onToggle?.(!current);
      setRecords((prev) => {
        const next = new Map(prev);
        next.set(habitId, current);
        return next;
      });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  }, [records, today]);

  if (habits.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          No tenés hábitos activos.{' '}
          <a href="/habitos/nuevo" className="text-indigo-400 hover:text-indigo-300">
            Crear tu primer hábito
          </a>
        </p>
      </div>
    );
  }

  const activeHabits = habits.filter((h) => !h.is_archived);

  return (
    <div className="space-y-2">
      {activeHabits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          completed={records.get(habit.id) ?? false}
          onToggle={() => toggleHabit(habit.id)}
          disabled={toggling.has(habit.id)}
        />
      ))}
    </div>
  );
}
