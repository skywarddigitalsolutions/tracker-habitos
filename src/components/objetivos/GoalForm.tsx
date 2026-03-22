'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_CATEGORIES, GOAL_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getLocalDateString } from '@/lib/utils/dates';
import type { Goal } from '@/lib/supabase/types';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSubmit: (data: {
    title: string;
    description: string;
    category_id: number | null;
    type: 'mensual' | 'trimestral' | 'anual';
    target_value: number;
    unit: string;
    start_date: string;
    end_date: string;
    is_public: boolean;
  }) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

function getDefaultEndDate(type: string): string {
  const now = new Date();
  if (type === 'mensual') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  }
  if (type === 'trimestral') {
    return new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().slice(0, 10);
  }
  return `${now.getFullYear()}-12-31`;
}

export function GoalForm({ initialData, onSubmit, loading, submitLabel = 'Guardar' }: GoalFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.category_id ?? null);
  const [type, setType] = useState<'mensual' | 'trimestral' | 'anual'>(initialData?.type ?? 'mensual');
  const [targetValue, setTargetValue] = useState(String(initialData?.target_value ?? 100));
  const [unit, setUnit] = useState(initialData?.unit ?? '');
  const [startDate, setStartDate] = useState(initialData?.start_date ?? getLocalDateString());
  const [endDate, setEndDate] = useState(initialData?.end_date ?? getDefaultEndDate('mensual'));
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(newType: 'mensual' | 'trimestral' | 'anual') {
    setType(newType);
    setEndDate(getDefaultEndDate(newType));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description,
        category_id: categoryId,
        type,
        target_value: Number(targetValue),
        unit,
        start_date: startDate,
        end_date: endDate,
        is_public: isPublic,
      });
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
        label="Título del objetivo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej: Leer 12 libros este año"
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción opcional..."
          rows={2}
          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de objetivo</label>
        <div className="flex gap-2">
          {GOAL_TYPES.map((gt) => (
            <button
              key={gt.value}
              type="button"
              onClick={() => handleTypeChange(gt.value as 'mensual' | 'trimestral' | 'anual')}
              className="flex-1 py-2 px-3 text-sm rounded-lg border transition"
              style={{
                borderColor: type === gt.value ? '#6366f1' : '#334155',
                backgroundColor: type === gt.value ? '#6366f120' : 'transparent',
                color: type === gt.value ? '#818cf8' : '#94a3b8',
              }}
            >
              {gt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor objetivo"
          type="number"
          min="1"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
        />
        <Input
          label="Unidad (opcional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="libros, km, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha inicio"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Fecha fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
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
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
        <div>
          <p className="text-sm font-medium text-slate-200">Objetivo público</p>
          <p className="text-xs text-slate-500">Visible para tus amigos</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-indigo-600' : 'bg-slate-600'}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
