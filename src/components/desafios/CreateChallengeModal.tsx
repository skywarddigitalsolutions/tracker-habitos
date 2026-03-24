'use client';

import { useState } from 'react';
import { X, Swords, Loader2 } from 'lucide-react';

interface CreateChallengeModalProps {
  friendUsername: string;
  friendName: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const DURATION_OPTIONS = [7, 14, 21, 30];

export function CreateChallengeModal({
  friendUsername,
  friendName,
  isOpen,
  onClose,
  onCreated,
}: CreateChallengeModalProps) {
  const [habitName, setHabitName] = useState('');
  const [duration, setDuration] = useState(21);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!habitName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/desafios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_username: friendUsername,
          habit_name: habitName.trim(),
          duration_days: duration,
        }),
      });
      const json = await res.json();
      if (json.error) { setError(json.error); return; }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#0f0f1a', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Swords size={16} style={{ color: 'var(--accent-text)' }} />
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Desafiar a {friendName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Hábito a desafiar
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Ej: Meditación, Ejercicio..."
              maxLength={60}
              className="input-glass w-full px-4 py-3 text-sm rounded-xl"
              style={{ fontFamily: 'var(--font-body)' }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Duración
            </label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
                  style={{
                    background: duration === d
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'rgba(255,255,255,0.05)',
                    color: duration === d ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${duration === d ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={!habitName.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition"
            style={{
              background: !habitName.trim() || loading
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: !habitName.trim() ? 'var(--text-muted)' : 'white',
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin mx-auto" /> : `Enviar desafío de ${duration} días`}
          </button>
        </form>
      </div>
    </div>
  );
}
