'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HabitRecord } from '@/lib/supabase/types';

export function useRegistros(from: string, to: string) {
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/registros?from=${from}&to=${to}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRecords(json.data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function toggleRecord(habitId: string, date: string, currentCompleted: boolean) {
    // Optimistic update
    setRecords((prev) => {
      const existing = prev.find((r) => r.habit_id === habitId && r.date === date);
      if (existing) {
        return prev.map((r) =>
          r.habit_id === habitId && r.date === date
            ? { ...r, completed: !currentCompleted }
            : r
        );
      } else {
        return [
          ...prev,
          {
            id: 'temp-' + Date.now(),
            habit_id: habitId,
            user_id: '',
            date,
            completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }
    });

    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date, completed: !currentCompleted }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      // Sync with server response
      await fetchRecords();
    } catch {
      // Revert on error
      await fetchRecords();
    }
  }

  function getRecord(habitId: string, date: string): HabitRecord | undefined {
    return records.find((r) => r.habit_id === habitId && r.date === date);
  }

  function isCompleted(habitId: string, date: string): boolean {
    return getRecord(habitId, date)?.completed ?? false;
  }

  return { records, loading, error, toggleRecord, getRecord, isCompleted, refetch: fetchRecords };
}
