import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { getLocalDateString } from '@/lib/utils/dates';
import { HabitCompletionGrid } from '@/components/habitos/HabitCompletionGrid';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function FriendProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get friend profile
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!friendProfile) notFound();

  // Verify friendship exists
  const { data: friendship } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${friendProfile.id}),and(requester_id.eq.${friendProfile.id},addressee_id.eq.${user.id})`
    )
    .eq('status', 'accepted')
    .single();

  const isFriend = !!friendship;
  const isSelf = user.id === friendProfile.id;

  const today = getLocalDateString();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  // Get public habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', friendProfile.id)
    .eq('is_public', true)
    .eq('is_archived', false);

  // Get public goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', friendProfile.id)
    .eq('is_public', true);

  // Get habit records for the month
  const habitIds = (habits ?? []).map((h) => h.id);
  const { data: records } = habitIds.length > 0
    ? await supabase
        .from('habit_records')
        .select('habit_id, date, completed')
        .in('habit_id', habitIds)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('date', today)
    : { data: [] };

  // Build records map
  const recordsMap = new Map<string, boolean>();
  for (const r of records ?? []) {
    if (r.completed) recordsMap.set(r.date, true);
    else if (!recordsMap.has(r.date)) recordsMap.set(r.date, false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/amigos" className="p-2 hover:bg-slate-800 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-400" />
        </Link>
      </div>

      {/* Profile header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
          {friendProfile.avatar_url ? (
            <img src={friendProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={28} className="text-slate-400" />
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-100">
          {friendProfile.display_name ?? friendProfile.username}
        </h1>
        <p className="text-slate-500 text-sm">@{friendProfile.username}</p>

        {!isFriend && !isSelf && (
          <div className="mt-3">
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
              Solo puedes ver el perfil de tus amigos
            </span>
          </div>
        )}
      </div>

      {(isFriend || isSelf) && (
        <>
          {/* Public habits */}
          {(habits ?? []).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">
                Hábitos públicos ({(habits ?? []).length})
              </h2>
              <div className="space-y-2 mb-4">
                {(habits ?? []).map((habit) => (
                  <div key={habit.id} className="flex items-center gap-2 py-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color ?? '#6366f1' }}
                    />
                    <span className="text-sm text-slate-300">{habit.name}</span>
                    {habit.category_id && <CategoryBadge categoryId={habit.category_id} />}
                  </div>
                ))}
              </div>
              <HabitCompletionGrid
                records={recordsMap}
                viewMode="mensual"
                year={year}
                month={month}
              />
            </div>
          )}

          {/* Public goals */}
          {(goals ?? []).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">
                Objetivos públicos ({(goals ?? []).length})
              </h2>
              <div className="space-y-3">
                {(goals ?? []).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">{goal.title}</p>
                      {goal.category_id && <CategoryBadge categoryId={goal.category_id} />}
                    </div>
                    <ProgressBar
                      value={goal.current_value}
                      max={goal.target_value}
                      showLabel
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(habits ?? []).length === 0 && (goals ?? []).length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">Este usuario no tiene contenido público</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
