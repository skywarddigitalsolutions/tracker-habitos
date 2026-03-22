'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FriendCard } from '@/components/amigos/FriendCard';
import { FriendSearch } from '@/components/amigos/FriendSearch';
import { FriendRequestCard } from '@/components/amigos/FriendRequestCard';
import type { Profile, Friendship } from '@/lib/supabase/types';
import { Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type PendingRequest = Friendship & { requester: Profile };

interface FriendsClientProps {
  friends: Profile[];
  pendingRequests: PendingRequest[];
}

export function FriendsClient({ friends, pendingRequests }: FriendsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'amigos' | 'solicitudes'>('amigos');

  function handleAction() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
        <button
          onClick={() => setTab('amigos')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition',
            tab === 'amigos'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Users size={14} />
          Amigos ({friends.length})
        </button>
        <button
          onClick={() => setTab('solicitudes')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition',
            tab === 'solicitudes'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Bell size={14} />
          Solicitudes
          {pendingRequests.length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'amigos' && (
        <>
          {friends.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">No tenés amigos todavía</p>
              <p className="text-slate-500 text-xs mt-1">Buscá usuarios para conectarte</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
          <FriendSearch onRequestSent={handleAction} />
        </>
      )}

      {tab === 'solicitudes' && (
        <>
          {pendingRequests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">No tenés solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <FriendRequestCard key={req.id} friendship={req} onAction={handleAction} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
