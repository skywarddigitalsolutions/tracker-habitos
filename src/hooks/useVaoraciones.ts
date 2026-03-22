'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DayRating } from '@/lib/supabase/types';

export function useValoraciones(from: string, to: string) {
  const [ratings, setRatings] = useState<DayRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/valoraciones?from=${from}&to=${to}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRatings(json.data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  async function upsertRating(date: string, rating: number, notes?: string) {
    const res = await fetch('/api/valoraciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, rating, notes }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchRatings();
    return json.data;
  }

  function getRating(date: string): DayRating | undefined {
    return ratings.find((r) => r.date === date);
  }

  return { ratings, loading, error, upsertRating, getRating, refetch: fetchRatings };
}
