'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit } from '@/lib/supabase/types';

export function useHabits(archived = false) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/habitos${archived ? '?archived=true' : ''}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setHabits(json.data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [archived]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  async function createHabit(data: {
    name: string;
    description?: string;
    category_id?: number;
    color?: string;
    is_public?: boolean;
  }) {
    const res = await fetch('/api/habitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchHabits();
    return json.data;
  }

  async function updateHabit(id: string, data: Partial<Habit>) {
    const res = await fetch(`/api/habitos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchHabits();
    return json.data;
  }

  async function deleteHabit(id: string) {
    const res = await fetch(`/api/habitos/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchHabits();
  }

  async function toggleArchive(id: string) {
    const res = await fetch(`/api/habitos/${id}/archivar`, { method: 'PATCH' });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchHabits();
    return json.data;
  }

  return { habits, loading, error, createHabit, updateHabit, deleteHabit, toggleArchive, refetch: fetchHabits };
}
