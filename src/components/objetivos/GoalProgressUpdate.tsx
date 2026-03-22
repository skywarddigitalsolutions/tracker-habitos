'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface GoalProgressUpdateProps {
  goalId: string;
  currentValue: number;
  targetValue: number;
  unit: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function GoalProgressUpdate({
  goalId,
  currentValue,
  targetValue,
  unit,
  isOpen,
  onClose,
  onUpdated,
}: GoalProgressUpdateProps) {
  const [value, setValue] = useState(String(currentValue));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/objetivos/${goalId}/progreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: Number(value), note }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onUpdated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar progreso">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="text-sm text-slate-400 mb-2">
          Progreso actual: <span className="text-slate-100 font-medium">{currentValue}</span> / {targetValue} {unit}
        </div>

        <Input
          label={`Nuevo valor${unit ? ` (${unit})` : ''}`}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
          max={String(targetValue)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nota (opcional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notas sobre el progreso..."
            rows={2}
            className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
