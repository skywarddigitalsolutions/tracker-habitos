import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocalDateString, formatDateES, getWeekBounds } from '@/lib/utils/dates';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DayRatingForm } from '@/components/dashboard/DayRatingForm';
import { WeeklyStreak } from '@/components/dashboard/WeeklyStreak';
import { WeeklyNotes } from '@/components/dashboard/WeeklyNotes';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const today = getLocalDateString();
  const todayDate = new Date(today + 'T12:00:00');
  const formattedDate = formatDateES(todayDate);

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  // Fetch today's records
  const { data: todayRecords } = await supabase
    .from('habit_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today);

  // Fetch today's rating
  const { data: todayRating } = await supabase
    .from('day_ratings')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // Last 7 days streak data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - 6 + i);
    return getLocalDateString(d);
  });

  const { data: weekRecords } = await supabase
    .from('habit_records')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', last7[0])
    .lte('date', last7[6]);

  const { data: weekRatings } = await supabase
    .from('day_ratings')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', last7[0])
    .lte('date', last7[6]);

  const activeHabits = habits ?? [];
  const records = todayRecords ?? [];

  const streakData = last7.map((date) => {
    const dayRecords = (weekRecords ?? []).filter((r) => r.date === date);
    const dayCompleted = dayRecords.filter((r) => r.completed).length;
    const totalForDay = activeHabits.filter(
      (h) => !h.archived_at || h.archived_at > date
    ).length;
    const rate = totalForDay > 0 ? Math.round((dayCompleted / totalForDay) * 100) : 0;
    const ratingEntry = weekRatings?.find((r) => r.date === date);
    return {
      date,
      completionRate: rate,
      rating: ratingEntry?.rating ?? null,
      notes: ratingEntry?.notes ?? null,
    };
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-5 py-5 space-y-4">
      {/* Mobile header with CTA */}
      <Header
        action={
          <Link
            href="/habitos/nuevo"
            aria-label="Crear nuevo hábito"
            className="flex items-center gap-1.5 px-3 py-2 text-white text-sm font-semibold rounded-xl transition"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 12px rgba(124,58,237,0.35)',
              minHeight: '44px',
            }}
          >
            <Plus size={14} aria-hidden="true" />
            Nuevo
          </Link>
        }
      />

      {/* Desktop heading row — single CTA, no duplicate */}
      <div className="hidden md:flex items-center justify-between pt-2 pb-1">
        <div>
          <p className="text-xs capitalize mb-0.5" style={{ color: 'var(--text-muted)' }}>
            {formattedDate}
          </p>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Inicio
          </h1>
        </div>
        <Link
          href="/habitos/nuevo"
          aria-label="Crear nuevo hábito"
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 0 14px rgba(124,58,237,0.3)',
            minHeight: '44px',
          }}
        >
          <Plus size={15} aria-hidden="true" />
          Nuevo hábito
        </Link>
      </div>

      <DashboardClient
        habits={activeHabits}
        initialRecords={records}
        today={today}
        userName={profile?.display_name ?? profile?.username ?? undefined}
      />

      <WeeklyStreak data={streakData} />

      <DayRatingForm today={today} initialRating={todayRating ?? null} />

      <WeeklyNotes data={streakData} />
    </div>
  );
}
