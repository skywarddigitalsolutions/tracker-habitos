'use client';

import { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import type { DayRating } from '@/lib/supabase/types';

interface DayRatingFormProps {
  today: string;
  initialRating: DayRating | null;
}

export function DayRatingForm({ today, initialRating }: DayRatingFormProps) {
  const [rating, setRating] = useState(initialRating?.rating ?? 0);
  const [notes, setNotes] = useState(initialRating?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (rating === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/valoraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, rating, notes }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">¿Cómo fue tu día?</h3>

      <StarRating
        value={rating}
        onChange={setRating}
        size={28}
        className="mb-4"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas del día (opcional)..."
        rows={2}
        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none text-sm mb-3"
      />

      <Button
        size="sm"
        onClick={handleSave}
        loading={saving}
        disabled={rating === 0}
        className="w-full"
      >
        {saved ? '¡Guardado!' : 'Guardar valoración'}
      </Button>
    </div>
  );
}
