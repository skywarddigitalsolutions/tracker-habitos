import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getLocalDateString } from '@/lib/utils/dates';
import { awardBadge } from '@/lib/gamification/badges';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  // Include self for ranking context
  const allIds = [user.id, ...friendIds];

  // Use service client to bypass RLS for cross-user reads
  const service = await createServiceClient();

  // Get profiles with XP/level
  const { data: profiles } = await service
    .from('profiles')
    .select('id, username, display_name, avatar_url, xp, level')
    .in('id', allIds);

  // Week bounds (Mon–Sun)
  const today = getLocalDateString();
  const todayDate = new Date(today + 'T12:00:00');
  const dayOfWeek = (todayDate.getDay() + 6) % 7; // 0=Mon
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - dayOfWeek);
  const weekStartStr = getLocalDateString(weekStart);

  // Get this week's habit records for all users
  const { data: records } = await service
    .from('habit_records')
    .select('user_id, date, completed')
    .in('user_id', allIds)
    .gte('date', weekStartStr)
    .lte('date', today);

  // Get active habits count per user
  const { data: habits } = await service
    .from('habits')
    .select('id, user_id')
    .in('user_id', allIds)
    .eq('is_archived', false);

  // Compute completion % per user
  const result = (profiles ?? []).map((profile) => {
    const userHabits = (habits ?? []).filter((h) => h.user_id === profile.id);
    const habitCount = userHabits.length;
    const userRecords = (records ?? []).filter((r) => r.user_id === profile.id);
    const completedCount = userRecords.filter((r) => r.completed).length;

    // Days in week so far
    const daysElapsed = dayOfWeek + 1;
    const maxPossible = habitCount * daysElapsed;
    const weekPct = maxPossible > 0 ? Math.round((completedCount / maxPossible) * 100) : 0;

    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      xp: profile.xp ?? 0,
      level: profile.level ?? 1,
      weekPct,
      isMe: profile.id === user.id,
    };
  });

  // Sort by weekPct desc, xp as tiebreaker
  result.sort((a, b) => b.weekPct - a.weekPct || b.xp - a.xp);

  // Award weekly_top badge if user is first and has friends
  if (result.length > 1 && result[0].isMe) {
    await awardBadge(supabase, user.id, 'weekly_top');
  }

  return NextResponse.json({ data: result });
}
