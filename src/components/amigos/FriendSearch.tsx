'use client';

import { useState, useCallback } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  username: string;
  display_name: string | null;
}

export function FriendSearch({ onRequestSent }: { onRequestSent?: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/buscar-usuarios?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      setResults(json.data ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function sendRequest(username: string) {
    setSending(username);
    try {
      const res = await fetch('/api/amigos/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!json.error) {
        setSent((prev) => new Set(prev).add(username));
        onRequestSent?.();
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Buscar usuarios</h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de usuario..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : 'Buscar'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100">{user.display_name ?? user.username}</p>
                <p className="text-xs text-slate-500">@{user.username}</p>
              </div>
              <button
                onClick={() => sendRequest(user.username)}
                disabled={sending === user.username || sent.has(user.username)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-medium rounded-lg transition"
              >
                {sent.has(user.username) ? (
                  'Enviada'
                ) : sending === user.username ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <><UserPlus size={12} /> Agregar</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && !searching && (
        <p className="text-sm text-slate-500 text-center py-2">No se encontraron usuarios</p>
      )}
    </div>
  );
}
