'use client';

import { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { Check, Moon } from 'lucide-react';
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
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="glass-card p-5 animate-fade-up stagger-2"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Moon size={16} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
        <h3
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¿Cómo fue tu día?
        </h3>
      </div>

      <StarRating
        value={rating}
        onChange={setRating}
        size={30}
        className="mb-4"
      />

      <label htmlFor="day-notes" className="sr-only">Notas del día</label>
      <textarea
        id="day-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas del día (opcional)..."
        rows={2}
        className="input-glass input-glass-textarea px-4 py-3 text-sm mb-4"
        style={{ fontFamily: 'var(--font-body)' }}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={rating === 0 || saving}
        className="btn-primary w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: rating === 0 || saving
            ? 'rgba(255,255,255,0.05)'
            : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: rating === 0 ? 'var(--text-muted)' : 'white',
          cursor: rating === 0 || saving ? 'not-allowed' : 'pointer',
          boxShadow: rating > 0 && !saving ? '0 0 16px rgba(124,58,237,0.3)' : 'none',
          border: '1px solid',
          borderColor: rating === 0 ? 'var(--border)' : 'rgba(124,58,237,0.3)',
          minHeight: '48px',
        }}
      >
        {saved ? (
          <>
            <Check size={15} aria-hidden="true" />
            ¡Guardado!
          </>
        ) : saving ? (
          'Guardando...'
        ) : (
          'Guardar valoración'
        )}
      </button>
    </div>
  );
}
