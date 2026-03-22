'use client';

import { cn } from '@/lib/utils/cn';
import { CategoryBadge } from './CategoryBadge';
import type { Habit } from '@/lib/supabase/types';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function HabitCard({ habit, completed, onToggle, disabled }: HabitCardProps) {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === habit.category_id);
  const accentColor = habit.color ?? category?.color ?? '#6366f1';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-slate-900 border rounded-xl transition-all cursor-pointer select-none',
        completed
          ? 'border-indigo-600/30 bg-indigo-950/20'
          : 'border-slate-800 hover:border-slate-700'
      )}
      onClick={() => !disabled && onToggle()}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
          completed
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-slate-600'
        )}
        style={completed ? { borderColor: accentColor, backgroundColor: accentColor } : {}}
      >
        {completed && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate',
          completed ? 'text-slate-400 line-through' : 'text-slate-100'
        )}>
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{habit.description}</p>
        )}
      </div>

      {/* Category */}
      {habit.category_id && (
        <CategoryBadge categoryId={habit.category_id} />
      )}
    </div>
  );
}
