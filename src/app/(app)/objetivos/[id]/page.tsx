import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import { GoalDetailClient } from './GoalDetailClient';
import { MONTHS_ES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!goal) notFound();

  const { data: progressEntries } = await supabase
    .from('goal_progress_entries')
    .select('*')
    .eq('goal_id', id)
    .order('recorded_at', { ascending: true });

  const percentage = goal.target_value > 0
    ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
    : 0;

  const TYPE_LABELS: Record<string, string> = {
    mensual: 'Mensual',
    trimestral: 'Trimestral',
    anual: 'Anual',
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/objetivos" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-100 truncate">{goal.title}</h1>
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
            {TYPE_LABELS[goal.type]}
          </span>
          {goal.category_id && <CategoryBadge categoryId={goal.category_id} />}
          {goal.is_completed && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              ✓ Completado
            </span>
          )}
        </div>

        {goal.description && (
          <p className="text-sm text-slate-400 mb-4">{goal.description}</p>
        )}

        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-slate-100">{goal.current_value}</span>
          <span className="text-slate-500 text-lg"> / {goal.target_value}</span>
          {goal.unit && <span className="text-slate-400 text-sm ml-1">{goal.unit}</span>}
          <p className="text-indigo-400 font-medium mt-1">{percentage}%</p>
        </div>

        <ProgressBar value={goal.current_value} max={goal.target_value} />

        <div className="flex justify-between text-xs text-slate-500 mt-3">
          <span>Inicio: {goal.start_date}</span>
          <span>Fin: {goal.end_date}</span>
        </div>
      </div>

      <GoalDetailClient
        goalId={goal.id}
        currentValue={goal.current_value}
        targetValue={goal.target_value}
        unit={goal.unit}
        progressEntries={progressEntries ?? []}
      />
    </div>
  );
}
