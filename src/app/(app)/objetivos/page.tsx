import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { GoalCard } from '@/components/objetivos/GoalCard';
import { Header } from '@/components/layout/Header';

export const dynamic = 'force-dynamic';

export default async function ObjetivosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const mensual = (goals ?? []).filter((g) => g.type === 'mensual');
  const trimestral = (goals ?? []).filter((g) => g.type === 'trimestral');
  const anual = (goals ?? []).filter((g) => g.type === 'anual');

  function Section({ title, items }: { title: string; items: typeof goals }) {
    if (!items || items.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h2>
        <div className="flex flex-col gap-4">
          {items.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <Header
        action={
          <Link
            href="/objetivos/nuevo"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={14} />
            Nuevo
          </Link>
        }
      />

      <div className="hidden md:flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-100">Objetivos</h1>
        <Link
          href="/objetivos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus size={16} />
          Nuevo objetivo
        </Link>
      </div>

      {(goals ?? []).length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
          <p className="text-slate-400 text-sm mb-2">No tenés objetivos todavía</p>
          <Link href="/objetivos/nuevo" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Crear tu primer objetivo →
          </Link>
        </div>
      ) : (
        <>
          <Section title="Anuales" items={anual} />
          <Section title="Trimestrales" items={trimestral} />
          <Section title="Mensuales" items={mensual} />
        </>
      )}
    </div>
  );
}
