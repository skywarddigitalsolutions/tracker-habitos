'use client';

import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import type { Goal } from '@/lib/supabase/types';
import { differenceInDays } from 'date-fns';

const TYPE_LABELS: Record<string, string> = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual',
};

const TYPE_COLORS: Record<string, string> = {
  mensual: 'bg-blue-500/20 text-blue-400',
  trimestral: 'bg-purple-500/20 text-purple-400',
  anual: 'bg-orange-500/20 text-orange-400',
};

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const today = new Date();
  const endDate = new Date(goal.end_date + 'T12:00:00');
  const daysLeft = differenceInDays(endDate, today);
  const percentage = goal.target_value > 0
    ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
    : 0;

  return (
    <Link href={`/objetivos/${goal.id}`}>
      <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 text-sm truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[goal.type]}`}>
              {TYPE_LABELS[goal.type]}
            </span>
            {goal.is_completed && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                ✓ Completado
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {goal.current_value}{goal.unit ? ` ${goal.unit}` : ''}
            <span style={{ color: 'var(--text-muted)' }}>
              {' '}/ {goal.target_value}{goal.unit ? ` ${goal.unit}` : ''}
            </span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{percentage}%</span>
        </div>
        <ProgressBar
          value={goal.current_value}
          max={goal.target_value}
          className="mb-3"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {goal.category_id && <CategoryBadge categoryId={goal.category_id} />}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(goal.start_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
              {' → '}
              {new Date(goal.end_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <span className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-400' : daysLeft < 7 ? 'text-yellow-400' : 'text-slate-500'}`}>
            {daysLeft < 0 ? 'Vencido' : daysLeft === 0 ? 'Hoy vence' : `${daysLeft}d`}
          </span>
        </div>
      </div>
    </Link>
  );
}
