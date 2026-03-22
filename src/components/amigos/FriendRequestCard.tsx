'use client';

import { useState } from 'react';
import { Check, X, User } from 'lucide-react';
import type { Friendship, Profile } from '@/lib/supabase/types';

interface FriendRequestCardProps {
  friendship: Friendship & { requester: Profile };
  onAction: () => void;
}

export function FriendRequestCard({ friendship, onAction }: FriendRequestCardProps) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  async function accept() {
    setLoading('accept');
    try {
      await fetch('/api/amigos/aceptar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendship.id }),
      });
      onAction();
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading('reject');
    try {
      await fetch('/api/amigos/rechazar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendship_id: friendship.id }),
      });
      onAction();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
        {friendship.requester.avatar_url ? (
          <img src={friendship.requester.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <User size={18} className="text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-100 text-sm">
          {friendship.requester.display_name ?? friendship.requester.username}
        </p>
        <p className="text-xs text-slate-500">@{friendship.requester.username} quiere seguirte</p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={accept}
          disabled={loading !== null}
          className="p-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition"
          title="Aceptar"
        >
          <Check size={14} />
        </button>
        <button
          onClick={reject}
          disabled={loading !== null}
          className="p-2 bg-slate-700 hover:bg-red-600 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg transition"
          title="Rechazar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
