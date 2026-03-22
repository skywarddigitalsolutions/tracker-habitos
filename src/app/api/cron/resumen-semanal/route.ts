import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getWeekBounds, getLocalDateString } from '@/lib/utils/dates';
import type { Database } from '@/lib/supabase/types';

function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = getLocalDateString();
  const now = new Date(today + 'T23:59:59');
  const { start: weekStart, end: weekEnd } = getWeekBounds(now);
  const weekStartStr = getLocalDateString(weekStart);
  const weekEndStr = getLocalDateString(weekEnd);

  // Get all users
  const { data: profiles } = await supabase.from('profiles').select('id');

  let processed = 0;
  let errors = 0;

  for (const profile of profiles ?? []) {
    try {
      // Get habits for user
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_archived', false);

      const habitIds = (habits ?? []).map((h) => h.id);
      const totalPossible = habitIds.length * 7;

      let completedCount = 0;
      if (habitIds.length > 0) {
        const { data: records } = await supabase
          .from('habit_records')
          .select('completed')
          .in('habit_id', habitIds)
          .gte('date', weekStartStr)
          .lte('date', weekEndStr);

        completedCount = (records ?? []).filter((r) => r.completed).length;
      }

      // Get avg rating for the week
      const { data: ratings } = await supabase
        .from('day_ratings')
        .select('rating')
        .eq('user_id', profile.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);

      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
        : null;

      const completionRate = totalPossible > 0
        ? Math.round((completedCount / totalPossible) * 100)
        : null;

      // Upsert weekly summary
      await supabase.from('weekly_summaries').upsert(
        {
          user_id: profile.id,
          week_start: weekStartStr,
          week_end: weekEndStr,
          avg_rating: avgRating,
          total_habits: totalPossible,
          completed_habits: completedCount,
          completion_rate: completionRate,
        },
        { onConflict: 'user_id,week_start' }
      );

      processed++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    message: `Resumen semanal procesado`,
    processed,
    errors,
    week: `${weekStartStr} - ${weekEndStr}`,
  });
}
