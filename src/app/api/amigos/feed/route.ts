import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getLocalDateString } from '@/lib/utils/dates';
import { calculateStreakFromDates } from '@/lib/gamification/streaks';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  if (friendIds.length === 0) return NextResponse.json({ data: [] });

  const today = getLocalDateString();

  // Use service client to bypass RLS for cross-user reads
  const service = await createServiceClient();

  const { data: profiles } = await service
    .from('profiles')
    .select('id, username, display_name, avatar_url, xp, level')
    .in('id', friendIds);

  const { data: habits } = await service
    .from('habits')
    .select('id, user_id, name')
    .in('user_id', friendIds)
    .eq('is_archived', false)
    .eq('is_public', true);

  // Today's records for all friends
  const { data: todayRecords } = await service
    .from('habit_records')
    .select('habit_id, user_id, completed')
    .in('user_id', friendIds)
    .eq('date', today);

  // Last 90 days records for streak calculation (completed only)
  const ninetyDaysAgo = new Date(today + 'T12:00:00');
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const { data: recentRecords } = await service
    .from('habit_records')
    .select('user_id, date, completed')
    .in('user_id', friendIds)
    .eq('completed', true)
    .gte('date', getLocalDateString(ninetyDaysAgo));

  // Check who encouraged today (use regular client — this is own data)
  const { data: todayEncouragements } = await supabase
    .from('encouragements')
    .select('to_id')
    .eq('from_id', user.id)
    .gte('created_at', today + 'T00:00:00');

  const encouragedToday = new Set((todayEncouragements ?? []).map((e: { to_id: string }) => e.to_id));

  const feedItems = (profiles ?? []).map((profile) => {
    const userHabits = (habits ?? []).filter((h) => h.user_id === profile.id);
    const publicHabitIds = new Set(userHabits.map((h) => h.id));
    const userTodayRecords = (todayRecords ?? []).filter((r) => r.user_id === profile.id);
    const completedToday = userTodayRecords.filter(
      (r) => r.completed && publicHabitIds.has(r.habit_id)
    ).length;
    const totalPublic = userHabits.length;

    // Streak: count consecutive days with at least one completed record
    const userDates = [...new Set(
      (recentRecords ?? [])
        .filter((r) => r.user_id === profile.id)
        .map((r: { date: string }) => r.date)
    )];
    const streak = calculateStreakFromDates(userDates as string[]);

    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      level: profile.level ?? 1,
      xp: profile.xp ?? 0,
      completedToday,
      totalPublic,
      streak,
      alreadyEncouraged: encouragedToday.has(profile.id),
    };
  });

  return NextResponse.json({ data: feedItems });
}
