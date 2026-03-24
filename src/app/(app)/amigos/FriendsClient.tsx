'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FriendCard } from '@/components/amigos/FriendCard';
import { FriendSearch } from '@/components/amigos/FriendSearch';
import { FriendRequestCard } from '@/components/amigos/FriendRequestCard';
import { FriendActivityFeed } from '@/components/amigos/FriendActivityFeed';
import { Leaderboard } from '@/components/amigos/Leaderboard';
import type { Profile, Friendship } from '@/lib/supabase/types';
import { Users, Bell, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type PendingRequest = Friendship & { requester: Profile };

interface FriendsClientProps {
  friends: Profile[];
  pendingRequests: PendingRequest[];
}

export function FriendsClient({ friends, pendingRequests }: FriendsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'hoy' | 'amigos' | 'solicitudes'>('hoy');

  function handleAction() {
    router.refresh();
  }

  const tabs = [
    { id: 'hoy' as const, label: 'Hoy', icon: Zap },
    { id: 'amigos' as const, label: `Amigos (${friends.length})`, icon: Users },
    { id: 'solicitudes' as const, label: 'Solicitudes', icon: Bell, badge: pendingRequests.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition',
              tab === id
                ? 'text-white'
                : 'hover:text-white'
            )}
            style={{
              background: tab === id ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
              color: tab === id ? 'white' : 'var(--text-muted)',
            }}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{id === 'amigos' ? friends.length : id === 'solicitudes' ? 'Sol.' : label}</span>
            {badge ? (
              <span className="bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Hoy: Feed + Leaderboard */}
      {tab === 'hoy' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Leaderboard />
          </div>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Actividad de hoy
            </p>
            <FriendActivityFeed />
          </div>
        </div>
      )}

      {/* Amigos */}
      {tab === 'amigos' && (
        <>
          {friends.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center border border-dashed"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tenés amigos todavía</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Buscá usuarios para conectarte</p>
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

      {/* Solicitudes */}
      {tab === 'solicitudes' && (
        <>
          {pendingRequests.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No tenés solicitudes pendientes
              </p>
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
