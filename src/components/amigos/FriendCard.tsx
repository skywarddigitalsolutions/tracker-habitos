'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import type { Profile } from '@/lib/supabase/types';

interface FriendCardProps {
  friend: Profile;
  completedToday?: number;
  totalToday?: number;
}

export function FriendCard({ friend, completedToday = 0, totalToday = 0 }: FriendCardProps) {
  const percentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : null;

  return (
    <Link href={`/amigos/${friend.username}`}>
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition">
        {/* Avatar */}
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt={friend.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={18} className="text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-100 text-sm">{friend.display_name ?? friend.username}</p>
          <p className="text-xs text-slate-500">@{friend.username}</p>
        </div>

        {/* Today's progress */}
        {percentage != null && (
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-indigo-400">{percentage}%</p>
            <p className="text-[10px] text-slate-500">hoy</p>
          </div>
        )}
      </div>
    </Link>
  );
}
