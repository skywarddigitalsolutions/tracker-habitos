'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Habit } from '@/lib/supabase/types';

interface HabitFormProps {
  initialData?: Partial<Habit>;
  onSubmit: (data: {
    name: string;
    description: string;
    category_id: number | null;
    color: string;
    is_public: boolean;
  }) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const PRESET_COLORS = [
  '#6366f1', '#22c55e', '#a855f7', '#3b82f6',
  '#f97316', '#ec4899', '#eab308', '#06b6d4',
  '#ef4444', '#14b8a6',
];

export function HabitForm({ initialData, onSubmit, loading, submitLabel = 'Guardar' }: HabitFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.category_id ?? null);
  const [color, setColor] = useState(initialData?.color ?? '#6366f1');
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del hábito es obligatorio.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description, category_id: categoryId, color, is_public: isPublic });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <Input
        label="Nombre del hábito"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Meditar 10 minutos"
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción breve..."
          rows={2}
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Categoría
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm"
              style={{
                borderColor: categoryId === cat.id ? cat.color : '#334155',
                backgroundColor: categoryId === cat.id ? cat.color + '22' : 'transparent',
                color: categoryId === cat.id ? cat.color : '#94a3b8',
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#fff' : 'transparent',
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer bg-transparent border border-slate-700"
            title="Color personalizado"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
        <div>
          <p className="text-sm font-medium text-slate-200">Hábito público</p>
          <p className="text-xs text-slate-500">Visible para tus amigos</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            isPublic ? 'bg-indigo-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
