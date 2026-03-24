import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { getLocalDateString } from '@/lib/utils/dates';
import { HabitCompletionGrid } from '@/components/habitos/HabitCompletionGrid';
import { CategoryBadge } from '@/components/habitos/CategoryBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { BadgesDisplay } from '@/components/gamification/BadgesDisplay';
import { StreakComparison } from '@/components/amigos/StreakComparison';
import { EncourageButton } from '@/components/amigos/EncourageButton';
import { FriendChallenges } from './FriendChallenges';
import { getUserBadges, type BadgeId } from '@/lib/gamification/badges';
import { calculateStreakFromDates } from '@/lib/gamification/streaks';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function FriendProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!friendProfile) notFound();

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

  // Get public habits of friend
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

  const habitIds = (habits ?? []).map((h) => h.id);

  // Monthly records for grid
  const { data: records } = habitIds.length > 0
    ? await supabase
        .from('habit_records')
        .select('habit_id, date, completed')
        .in('habit_id', habitIds)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('date', today)
    : { data: [] };

  const recordsMap = new Map<string, boolean>();
  for (const r of records ?? []) {
    if (r.completed) recordsMap.set(r.date, true);
    else if (!recordsMap.has(r.date)) recordsMap.set(r.date, false);
  }

  // --- Streak comparison ---
  // My public habits
  const { data: myHabits } = await supabase
    .from('habits')
    .select('id, name, color')
    .eq('user_id', user.id)
    .eq('is_public', true)
    .eq('is_archived', false);

  // Find habits with matching names (case-insensitive)
  const sharedHabitNames = (myHabits ?? [])
    .map((h) => h.name.toLowerCase())
    .filter((name) => (habits ?? []).some((fh) => fh.name.toLowerCase() === name));

  type StreakHabit = { name: string; color: string | null; myStreak: number; theirStreak: number };
  let streakComparison: StreakHabit[] = [];

  if (sharedHabitNames.length > 0) {
    const ninetyAgo = new Date(today + 'T12:00:00');
    ninetyAgo.setDate(ninetyAgo.getDate() - 90);
    const ninetyStr = getLocalDateString(ninetyAgo);

    const allParticipantIds = [user.id, friendProfile.id];
    const allHabitIds = [
      ...(myHabits ?? []).map((h) => h.id),
      ...habitIds,
    ];

    const { data: streakRecords } = allHabitIds.length > 0
      ? await supabase
          .from('habit_records')
          .select('user_id, habit_id, date, completed')
          .in('user_id', allParticipantIds)
          .in('habit_id', allHabitIds)
          .eq('completed', true)
          .gte('date', ninetyStr)
      : { data: [] };

    streakComparison = sharedHabitNames.map((name) => {
      const myHabit = (myHabits ?? []).find((h) => h.name.toLowerCase() === name)!;
      const theirHabit = (habits ?? []).find((h) => h.name.toLowerCase() === name)!;

      const myDates = (streakRecords ?? [])
        .filter((r) => r.user_id === user.id && r.habit_id === myHabit?.id)
        .map((r: { date: string }) => r.date);
      const theirDates = (streakRecords ?? [])
        .filter((r) => r.user_id === friendProfile.id && r.habit_id === theirHabit?.id)
        .map((r: { date: string }) => r.date);

      return {
        name: myHabit?.name ?? name,
        color: myHabit?.color ?? null,
        myStreak: calculateStreakFromDates(myDates),
        theirStreak: calculateStreakFromDates(theirDates),
      };
    });
  }

  // Badges
  const friendBadges = (isFriend || isSelf)
    ? await getUserBadges(supabase, friendProfile.id)
    : [];

  // Check if already encouraged today
  const { data: todayEncouragement } = await supabase
    .from('encouragements')
    .select('id')
    .eq('from_id', user.id)
    .eq('to_id', friendProfile.id)
    .gte('created_at', today + 'T00:00:00')
    .single();

  const alreadyEncouraged = !!todayEncouragement;

  const myProfile = await supabase.from('profiles').select('display_name, username').eq('id', user.id).single();
  const myName = myProfile.data?.display_name ?? myProfile.data?.username ?? 'Vos';
  const theirName = friendProfile.display_name ?? friendProfile.username;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/amigos" className="p-2 hover:bg-white/5 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-400" />
        </Link>
      </div>

      {/* Profile header */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
          {friendProfile.avatar_url ? (
            <img src={friendProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={28} className="text-slate-400" />
          )}
        </div>
        <h1 className="text-xl font-bold text-white">{theirName}</h1>
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>@{friendProfile.username}</p>

        <div className="flex items-center justify-center gap-2 mb-3">
          <LevelBadge xp={friendProfile.xp ?? 0} showName />
          {friendBadges.length > 0 && (
            <BadgesDisplay badgeIds={friendBadges as BadgeId[]} compact />
          )}
        </div>

        {!isFriend && !isSelf && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
            Solo puedes ver el perfil de tus amigos
          </span>
        )}

        {isFriend && (
          <div className="mt-3">
            <EncourageButton toId={friendProfile.id} alreadyEncouraged={alreadyEncouraged} />
          </div>
        )}
      </div>

      {(isFriend || isSelf) && (
        <>
          {/* Streak comparison */}
          {streakComparison.length > 0 && (
            <StreakComparison
              myName={myName}
              theirName={theirName}
              habits={streakComparison}
            />
          )}

          {/* Challenges */}
          <FriendChallenges
            friendUsername={friendProfile.username}
            friendName={theirName}
            myId={user.id}
          />

          {/* Badges */}
          {friendBadges.length > 0 && (
            <BadgesDisplay badgeIds={friendBadges as BadgeId[]} />
          )}

          {/* Public habits */}
          {(habits ?? []).length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-sm font-semibold text-white mb-4">
                Hábitos públicos ({(habits ?? []).length})
              </h2>
              <div className="space-y-2 mb-4">
                {(habits ?? []).map((habit) => (
                  <div key={habit.id} className="flex items-center gap-2 py-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color ?? '#6366f1' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{habit.name}</span>
                    {habit.category_id && <CategoryBadge categoryId={habit.category_id} />}
                  </div>
                ))}
              </div>
              {recordsMap.size > 0 && (
                <HabitCompletionGrid
                  records={recordsMap}
                  viewMode="mensual"
                  year={year}
                  month={month}
                />
              )}
            </div>
          )}

          {/* Public goals */}
          {(goals ?? []).length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-sm font-semibold text-white mb-4">
                Objetivos públicos ({(goals ?? []).length})
              </h2>
              <div className="space-y-3">
                {(goals ?? []).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{goal.title}</p>
                      {goal.category_id && <CategoryBadge categoryId={goal.category_id} />}
                    </div>
                    <ProgressBar value={goal.current_value} max={goal.target_value} showLabel size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(habits ?? []).length === 0 && (goals ?? []).length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Este usuario no tiene contenido público
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
