'use client';

import Link from 'next/link';
import { User, Flame } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';
import { LevelBadge } from '@/components/gamification/LevelBadge';

interface FriendCardProps {
  friend: Profile;
  completedToday?: number;
  totalToday?: number;
  streak?: number;
}

export function FriendCard({ friend, completedToday = 0, totalToday = 0, streak = 0 }: FriendCardProps) {
  const percentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

  return (
    <Link href={`/amigos/${friend.username}`}>
      <div
        className="flex items-center gap-3 p-4 rounded-xl transition"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt={friend.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={18} className="text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">
            {friend.display_name ?? friend.username}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{friend.username}</p>
            <LevelBadge xp={friend.xp ?? 0} size="sm" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-orange-400 font-semibold">
              <Flame size={11} />
              {streak}d
            </span>
          )}
          {percentage != null && (
            <div className="text-right">
              <p
                className="text-sm font-bold"
                style={{ color: percentage === 100 ? 'var(--success)' : 'var(--accent-text)' }}
              >
                {percentage}%
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>hoy</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
