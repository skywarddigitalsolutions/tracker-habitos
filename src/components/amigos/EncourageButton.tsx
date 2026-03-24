'use client';

import { useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EncourageButtonProps {
  toId: string;
  alreadyEncouraged: boolean;
  compact?: boolean;
}

export function EncourageButton({ toId, alreadyEncouraged, compact = false }: EncourageButtonProps) {
  const [sent, setSent] = useState(alreadyEncouraged);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (sent || loading) return;
    setLoading(true);
    try {
      await fetch('/api/amigos/animar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_id: toId }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={sent || loading}
        title={sent ? 'Animado hoy' : 'Animar'}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg transition text-xs',
          sent
            ? 'bg-orange-900/30 text-orange-400 cursor-default'
            : 'bg-slate-800 text-slate-400 hover:bg-orange-900/30 hover:text-orange-400'
        )}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Flame size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={sent || loading}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition',
        sent
          ? 'bg-orange-900/20 text-orange-400 cursor-default border border-orange-800/30'
          : 'bg-slate-800 text-slate-300 hover:bg-orange-900/20 hover:text-orange-400 border border-slate-700'
      )}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Flame size={12} />
      )}
      {sent ? '¡Animado!' : 'Animar'}
    </button>
  );
}
