'use client';

import { useEffect, useState } from 'react';
import { Swords, Plus } from 'lucide-react';
import type { Challenge } from '@/lib/supabase/types';
import { ChallengeCard } from '@/components/desafios/ChallengeCard';
import { CreateChallengeModal } from '@/components/desafios/CreateChallengeModal';

interface Progress {
  user_id: string;
  days_completed: number;
}

interface ChallengeWithProgress {
  challenge: Challenge;
  progress: Progress[] | null;
}

interface Props {
  friendUsername: string;
  friendName: string;
  myId: string;
}

export function FriendChallenges({ friendUsername, friendName, myId }: Props) {
  const [items, setItems] = useState<ChallengeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/desafios');
      const json = await res.json();
      const challenges: Challenge[] = (json.data ?? []).filter((c: Challenge) =>
        (c.created_by === myId || c.invited_user === myId) &&
        c.status !== 'cancelled'
      );

      // Fetch progress for active challenges
      const withProgress = await Promise.all(
        challenges.map(async (c) => {
          if (c.status !== 'active') return { challenge: c, progress: null };
          const r = await fetch(`/api/desafios/${c.id}`);
          const j = await r.json();
          return { challenge: c, progress: j.progress ?? null };
        })
      );
      setItems(withProgress);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeOrPending = items.filter((i) =>
    i.challenge.status === 'active' || i.challenge.status === 'pending'
  );

  return (
    <>
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords size={14} style={{ color: 'var(--accent-text)' }} />
            <h3
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Desafíos
            </h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 10px rgba(124,58,237,0.25)',
            }}
          >
            <Plus size={12} />
            Nuevo
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            Cargando...
          </p>
        ) : activeOrPending.length === 0 ? (
          <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
            No hay desafíos activos. ¡Invitá a {friendName}!
          </p>
        ) : (
          <div className="space-y-3">
            {activeOrPending.map(({ challenge, progress }) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                myId={myId}
                partnerName={friendName}
                partnerUsername={friendUsername}
                progress={progress}
                onAction={load}
              />
            ))}
          </div>
        )}
      </div>

      <CreateChallengeModal
        friendUsername={friendUsername}
        friendName={friendName}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={load}
      />
    </>
  );
}
