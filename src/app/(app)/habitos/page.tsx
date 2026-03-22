import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Archive } from 'lucide-react';
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={14} />
            Nuevo
          </Link>
        }
      />

      <div className="hidden md:flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-100">Mis Hábitos</h1>
        <Link
          href="/habitos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus size={16} />
          Nuevo hábito
        </Link>
      </div>

      {/* Active habits */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Activos ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm mb-2">No tenés hábitos activos</p>
            <Link href="/habitos/nuevo" className="text-indigo-400 hover:text-indigo-300 text-sm">
              Crear tu primer hábito →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((habit) => (
              <Link
                key={habit.id}
                href={`/habitos/${habit.id}`}
                className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color ?? '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-100 text-sm truncate">{habit.name}</p>
                  {habit.description && (
                    <p className="text-xs text-slate-500 truncate">{habit.description}</p>
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
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Archive size={14} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Archivados ({archived.length})
            </h2>
          </div>
          <div className="space-y-2 opacity-60">
            {archived.map((habit) => (
              <Link
                key={habit.id}
                href={`/habitos/${habit.id}`}
                className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl transition hover:opacity-100"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 opacity-50"
                  style={{ backgroundColor: habit.color ?? '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-400 text-sm truncate line-through">{habit.name}</p>
                </div>
                {habit.category_id && <CategoryBadge categoryId={habit.category_id} />}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
