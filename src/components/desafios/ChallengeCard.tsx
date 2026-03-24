'use client';

import { useState } from 'react';
import { Swords, Check, X, Loader2 } from 'lucide-react';
import type { Challenge } from '@/lib/supabase/types';
import { formatShortDate } from '@/lib/utils/dates';

interface Progress {
  user_id: string;
  days_completed: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  myId: string;
  partnerName: string;
  partnerUsername: string;
  progress?: Progress[] | null;
  onAction: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  active: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
  active: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
  completed: 'text-green-400 bg-green-900/20 border-green-800/30',
  cancelled: 'text-slate-400 bg-slate-800 border-slate-700',
};

export function ChallengeCard({ challenge, myId, partnerName, progress, onAction }: ChallengeCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const isInvited = challenge.invited_user === myId;
  const myProgress = progress?.find((p) => p.user_id === myId);
  const theirProgress = progress?.find((p) => p.user_id !== myId);

  async function handleAction(action: 'accept' | 'cancel') {
    setLoading(action);
    try {
      await fetch(`/api/desafios/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      onAction();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Swords size={14} style={{ color: 'var(--accent-text)' }} />
          <p className="text-sm font-bold text-white">{challenge.habit_name}</p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[challenge.status]}`}
        >
          {STATUS_LABEL[challenge.status]}
        </span>
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {challenge.duration_days} días con {partnerName}
        {challenge.started_at && (
          <span> · Inició {formatShortDate(challenge.started_at)}</span>
        )}
      </p>

      {challenge.status === 'active' && progress && (
        <div className="space-y-2 mb-3">
          {[
            { label: 'Vos', days: myProgress?.days_completed ?? 0 },
            { label: partnerName, days: theirProgress?.days_completed ?? 0 },
          ].map(({ label, days }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-[11px] font-semibold text-white">
                  {days}/{challenge.duration_days}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(days / challenge.duration_days) * 100}%`,
                    background: 'linear-gradient(90deg, var(--accent-from), var(--accent-to))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {challenge.status === 'pending' && isInvited && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('accept')}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {loading === 'accept' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Aceptar
          </button>
          <button
            onClick={() => handleAction('cancel')}
            disabled={loading !== null}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {loading === 'cancel' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          </button>
        </div>
      )}

      {challenge.status === 'active' && (
        <button
          onClick={() => handleAction('cancel')}
          disabled={loading !== null}
          className="text-xs text-slate-500 hover:text-red-400 transition"
        >
          Abandonar
        </button>
      )}
    </div>
  );
}
