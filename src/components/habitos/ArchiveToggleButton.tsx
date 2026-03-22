'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore } from 'lucide-react';

interface ArchiveToggleButtonProps {
  habitId: string;
  isArchived: boolean;
}

export function ArchiveToggleButton({ habitId, isArchived }: ArchiveToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/habitos/${habitId}/archivar`, { method: 'PATCH' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isArchived ? 'Desarchivar' : 'Archivar'}
      className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-100 disabled:opacity-50"
    >
      {isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
    </button>
  );
}
