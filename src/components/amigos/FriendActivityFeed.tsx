'use client';

import { useEffect, useState } from 'react';
import { User, Loader2, Flame } from 'lucide-react';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { EncourageButton } from './EncourageButton';
import Link from 'next/link';

interface FeedItem {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  completedToday: number;
  totalPublic: number;
  streak: number;
  alreadyEncouraged: boolean;
}

export function FriendActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/amigos/feed')
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Aún no tenés amigos agregados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = item.totalPublic > 0
          ? Math.round((item.completedToday / item.totalPublic) * 100)
          : null;

        return (
          <Link key={item.id} href={`/amigos/${item.username}`}>
            <div
              className="flex items-center gap-3 p-3 rounded-xl transition"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.avatar_url ? (
                  <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-slate-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">
                    {item.display_name ?? item.username}
                  </p>
                  <LevelBadge xp={item.xp} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  {pct !== null && (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      ✅ {item.completedToday}/{item.totalPublic} hábitos
                    </span>
                  )}
                  {item.streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-400">
                      <Flame size={10} />
                      {item.streak}d
                    </span>
                  )}
                </div>
              </div>

              {/* Encourage */}
              <EncourageButton
                toId={item.id}
                alreadyEncouraged={item.alreadyEncouraged}
                compact
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
