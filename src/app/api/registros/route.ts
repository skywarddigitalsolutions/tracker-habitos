import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXP, XP_REWARDS } from '@/lib/gamification/xp';
import { calculateHabitStreak } from '@/lib/gamification/streaks';
import { checkStreakBadges, awardBadge } from '@/lib/gamification/badges';
import { getLocalDateString } from '@/lib/utils/dates';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('habit_records')
    .select('*')
    .eq('user_id', user.id);

  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query.order('date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { habit_id, date, completed } = body;

  if (!habit_id || !date) {
    return NextResponse.json({ error: 'habit_id y date son obligatorios' }, { status: 400 });
  }

  // Verify habit belongs to user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habit_id)
    .eq('user_id', user.id)
    .single();

  if (!habit) return NextResponse.json({ error: 'Hábito no encontrado' }, { status: 404 });

  const { data, error } = await supabase
    .from('habit_records')
    .upsert(
      { habit_id, user_id: user.id, date, completed: completed ?? true },
      { onConflict: 'habit_id,date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Award XP only when marking as completed
  if (completed !== false && data) {
    try {
      const streak = await calculateHabitStreak(supabase, habit_id, user.id);
      await awardXP(supabase, user.id, XP_REWARDS.HABIT_COMPLETE, streak);
      await checkStreakBadges(supabase, user.id, streak);

      const today = getLocalDateString();
      const { data: allHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      const { data: todayRecords } = await supabase
        .from('habit_records')
        .select('habit_id, completed')
        .eq('user_id', user.id)
        .eq('date', today);

      const completedIds = new Set(
        (todayRecords ?? [])
          .filter((r: { completed: boolean }) => r.completed)
          .map((r: { habit_id: string }) => r.habit_id)
      );
      const allDone = (allHabits ?? []).every((h: { id: string }) => completedIds.has(h.id));
      if (allDone && (allHabits ?? []).length > 0) {
        await awardXP(supabase, user.id, XP_REWARDS.ALL_HABITS_BONUS);
      }

      // Check perfect_week badge
      const last7: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today + 'T12:00:00');
        d.setDate(d.getDate() - i);
        last7.push(getLocalDateString(d));
      }
      const { data: weekRecords } = await supabase
        .from('habit_records')
        .select('date, completed, habit_id')
        .eq('user_id', user.id)
        .in('date', last7);

      const perfectWeek = last7.every((dateStr) => {
        const dayRecs = (weekRecords ?? []).filter((r: { date: string }) => r.date === dateStr);
        const doneOnDay = new Set(
          dayRecs
            .filter((r: { completed: boolean }) => r.completed)
            .map((r: { habit_id: string }) => r.habit_id)
        );
        return (
          (allHabits ?? []).length > 0 &&
          (allHabits ?? []).every((h: { id: string }) => doneOnDay.has(h.id))
        );
      });
      if (perfectWeek) await awardBadge(supabase, user.id, 'perfect_week');
    } catch {
      // Gamification errors should never break habit recording
    }
  }

  return NextResponse.json({ data });
}
