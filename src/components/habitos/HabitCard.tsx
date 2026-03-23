'use client';

import { Loader2 } from 'lucide-react';
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
  const accentColor = habit.color ?? category?.color ?? '#7c3aed';

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle()}
      disabled={disabled}
      aria-pressed={completed}
      aria-label={`${habit.name}: ${completed ? 'completado, pulsa para desmarcar' : 'pendiente, pulsa para completar'}`}
      className="habit-card w-full flex items-center gap-4 px-4 text-left transition-all duration-200 cursor-pointer select-none rounded-xl"
      style={{
        minHeight: '56px',
        paddingTop: '12px',
        paddingBottom: '12px',
        background: completed
          ? `rgba(${hexToRgb(accentColor)}, 0.08)`
          : 'var(--surface)',
        borderTop: `1px solid ${completed ? `rgba(${hexToRgb(accentColor)}, 0.25)` : 'var(--border)'}`,
        borderRight: `1px solid ${completed ? `rgba(${hexToRgb(accentColor)}, 0.25)` : 'var(--border)'}`,
        borderBottom: `1px solid ${completed ? `rgba(${hexToRgb(accentColor)}, 0.25)` : 'var(--border)'}`,
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: completed ? `0 0 16px rgba(${hexToRgb(accentColor)}, 0.08)` : 'none',
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {/* Checkbox visual */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        aria-hidden="true"
        style={{
          background: completed ? accentColor : 'transparent',
          border: completed ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.18)',
          boxShadow: completed ? `0 0 10px rgba(${hexToRgb(accentColor)}, 0.45)` : 'none',
        }}
      >
        {disabled ? (
          <Loader2 size={11} className="animate-spin text-white" />
        ) : completed ? (
          <svg className="animate-check-pop" width="11" height="9" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-sm truncate transition-all duration-200"
          style={{
            color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecorationLine: completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--text-muted)',
          }}
        >
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Category */}
      {habit.category_id && (
        <CategoryBadge categoryId={habit.category_id} />
      )}

      <style>{`
        .habit-card:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.14) !important;
          background: var(--surface-hover) !important;
        }
        .habit-card:focus-visible {
          outline: 2px solid var(--accent-text);
          outline-offset: 2px;
        }
        .habit-card:active:not(:disabled) {
          transform: scale(0.99);
        }
      `}</style>
    </button>
  );
}

/** Convert #rrggbb to "r, g, b" for use in rgba() */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
