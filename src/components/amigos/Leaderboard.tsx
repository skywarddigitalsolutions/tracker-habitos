'use client';

import { useEffect, useState } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { User } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  weekPct: number;
  isMe: boolean;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/amigos/leaderboard')
      .then((r) => r.json())
      .then((j) => setData(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (data.length <= 1) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Agregá amigos para ver el ranking
        </p>
      </div>
    );
  }

  const myPosition = data.findIndex((d) => d.isMe);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} style={{ color: 'var(--accent-text)' }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Esta semana
        </h3>
        {myPosition >= 0 && (
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            Estás {myPosition + 1}° de {data.length}
          </span>
        )}
      </div>

      {data.map((entry, i) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{
            background: entry.isMe
              ? 'rgba(124,58,237,0.08)'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${entry.isMe ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <span className="text-base w-6 text-center flex-shrink-0">
            {i < 3 ? MEDAL[i] : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>}
          </span>

          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {entry.avatar_url ? (
              <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {entry.display_name ?? entry.username}
              {entry.isMe && <span className="ml-1 opacity-50">(vos)</span>}
            </p>
            <LevelBadge xp={entry.xp} size="sm" />
          </div>

          <div className="text-right flex-shrink-0">
            <p
              className="text-sm font-bold"
              style={{ color: entry.weekPct === 100 ? 'var(--success)' : 'var(--text-primary)' }}
            >
              {entry.weekPct}%
            </p>
            <div
              className="w-16 h-1 rounded-full mt-1 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${entry.weekPct}%`,
                  background: entry.weekPct === 100
                    ? 'var(--success)'
                    : 'linear-gradient(90deg, var(--accent-from), var(--accent-to))',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
