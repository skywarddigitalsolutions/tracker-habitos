import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Archive, PlusCircle } from 'lucide-react';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import { Header } from '@/components/layout/Header';

export const dynamic = 'force-dynamic';

export default async function HabitosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const active = (habits ?? []).filter((h) => !h.is_archived);
  const archived = (habits ?? []).filter((h) => h.is_archived);

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <Header
        action={
          <Link
            href="/habitos/nuevo"
            aria-label="Crear nuevo hábito"
            className="flex items-center gap-1.5 px-3 py-2 text-white text-sm font-semibold rounded-xl transition"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 12px rgba(124,58,237,0.35)',
              minHeight: '44px',
            }}
          >
            <Plus size={14} aria-hidden="true" />
            Nuevo
          </Link>
        }
      />

      {/* Desktop heading */}
      <div className="hidden md:flex items-center justify-between mb-6 pt-4">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Mis Hábitos
        </h1>
        <Link
          href="/habitos/nuevo"
          aria-label="Crear nuevo hábito"
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 12px rgba(124,58,237,0.3)',
            minHeight: '44px',
          }}
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo hábito
        </Link>
      </div>

      {/* Active habits */}
      <section className="mb-6" aria-label="Hábitos activos">
        <h2
          className="text-xs font-semibold mb-3 uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Activos ({active.length})
        </h2>

        {active.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center border border-dashed"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <PlusCircle
              size={36}
              className="mx-auto mb-3"
              style={{ color: 'var(--text-muted)' }}
              aria-hidden="true"
            />
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              No tenés hábitos activos aún
            </p>
            <Link
              href="/habitos/nuevo"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 0 12px rgba(124,58,237,0.3)',
              }}
            >
              <Plus size={14} aria-hidden="true" />
              Crear primer hábito
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((habit) => (
              <Link
                key={habit.id}
                href={`/habitos/${habit.id}`}
                className="habit-list-item flex items-center gap-3 p-4 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '56px',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  aria-hidden="true"
                  style={{ backgroundColor: habit.color ?? '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {habit.name}
                  </p>
                  {habit.description && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {habit.description}
                    </p>
                  )}
                </div>
                {habit.category_id && <CategoryBadge categoryId={habit.category_id} />}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Archived habits */}
      {archived.length > 0 && (
        <section aria-label="Hábitos archivados">
          <div className="flex items-center gap-2 mb-3">
            <Archive size={14} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
            <h2
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Archivados ({archived.length})
            </h2>
          </div>
          <div className="space-y-2 opacity-55">
            {archived.map((habit) => (
              <Link
                key={habit.id}
                href={`/habitos/${habit.id}`}
                className="habit-list-item flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:opacity-100"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '52px',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 opacity-50"
                  aria-hidden="true"
                  style={{ backgroundColor: habit.color ?? '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate line-through"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {habit.name}
                  </p>
                </div>
                {habit.category_id && <CategoryBadge categoryId={habit.category_id} />}
              </Link>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .habit-list-item:hover {
          background: var(--surface-hover) !important;
          border-color: var(--border-hover) !important;
        }
      `}</style>
    </div>
  );
}
