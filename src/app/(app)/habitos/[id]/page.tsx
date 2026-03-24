import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getLocalDateString, getDaysInMonth } from '@/lib/utils/dates';
import { HabitCompletionGrid } from '@/components/habitos/HabitCompletionGrid';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import { ArchiveToggleButton } from '@/components/habitos/ArchiveToggleButton';
import { VisibilityToggleButton } from '@/components/habitos/VisibilityToggleButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MONTHS_ES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HabitoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: habit } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!habit) notFound();

  const today = getLocalDateString();
  const now = new Date(today + 'T12:00:00');
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Fetch all records for this habit
  const { data: rawRecords } = await supabase
    .from('habit_records')
    .select('date, completed')
    .eq('habit_id', id)
    .eq('user_id', user.id);

  const records = new Map<string, boolean>();
  for (const r of rawRecords ?? []) {
    records.set(r.date, r.completed);
  }

  // Stats
  const totalRecords = (rawRecords ?? []).length;
  const completedRecords = (rawRecords ?? []).filter((r) => r.completed).length;
  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;

  // Current streak
  let streak = 0;
  const d = new Date(today + 'T12:00:00');
  while (true) {
    const dateStr = getLocalDateString(d);
    if (records.get(dateStr) === true) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/habitos" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-100 truncate">{habit.name}</h1>
          {habit.description && (
            <p className="text-sm text-slate-400">{habit.description}</p>
          )}
        </div>
        <ArchiveToggleButton habitId={habit.id} isArchived={habit.is_archived} />
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {habit.category_id && <CategoryBadge categoryId={habit.category_id} size="md" />}
        <VisibilityToggleButton habitId={habit.id} isPublic={habit.is_public} />
        {habit.is_archived && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
            Archivado
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{streak}</p>
          <p className="text-xs text-slate-500 mt-0.5">Racha actual</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{completedRecords}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completados</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-100">{completionRate}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Tasa</p>
        </div>
      </div>

      {/* Monthly grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          {MONTHS_ES[month - 1]} {year}
        </h3>
        <HabitCompletionGrid
          records={records}
          viewMode="mensual"
          year={year}
          month={month}
          habitCreatedAt={habit.created_at}
        />
      </div>

      {/* Annual grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Año {year}</h3>
        <HabitCompletionGrid
          records={records}
          viewMode="anual"
          year={year}
          habitCreatedAt={habit.created_at}
        />
      </div>
    </div>
  );
}
