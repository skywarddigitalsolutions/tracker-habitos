'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock } from 'lucide-react';

interface VisibilityToggleButtonProps {
  habitId: string;
  isPublic: boolean;
}

export function VisibilityToggleButton({ habitId, isPublic }: VisibilityToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimistic, setOptimistic] = useState(isPublic);

  async function handleToggle() {
    setLoading(true);
    setOptimistic((prev) => !prev);
    try {
      const res = await fetch(`/api/habitos/${habitId}/visibilidad`, { method: 'PATCH' });
      const json = await res.json();
      if (json.error) {
        setOptimistic((prev) => !prev); // revert on error
        throw new Error(json.error);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={optimistic ? 'Cambiar a privado' : 'Cambiar a público'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
      style={{
        background: optimistic ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${optimistic ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.09)'}`,
        color: optimistic ? 'var(--accent-text)' : 'var(--text-muted)',
      }}
    >
      {optimistic ? <Globe size={13} /> : <Lock size={13} />}
      {optimistic ? 'Público' : 'Privado'}
    </button>
  );
}
