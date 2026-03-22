import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocalDateString, formatDateES, getWeekBounds } from '@/lib/utils/dates';
import { TodayProgress } from '@/components/dashboard/TodayProgress';
import { HabitList } from '@/components/dashboard/HabitList';
import { DayRatingForm } from '@/components/dashboard/DayRatingForm';
import { WeeklyStreak } from '@/components/dashboard/WeeklyStreak';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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

  const completedToday = records.filter((r) => r.completed).length;

  const streakData = last7.map((date) => {
    const dayRecords = (weekRecords ?? []).filter((r) => r.date === date);
    const dayCompleted = dayRecords.filter((r) => r.completed).length;
    const totalForDay = activeHabits.filter(
      (h) => !h.archived_at || h.archived_at > date
    ).length;
    const rate = totalForDay > 0 ? Math.round((dayCompleted / totalForDay) * 100) : 0;
    const rating = weekRatings?.find((r) => r.date === date)?.rating ?? null;
    return { date, completionRate: rate, rating };
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
      <Header
        action={
          <Link
            href="/habitos/nuevo"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={14} />
            Nuevo
          </Link>
        }
      />

      {/* Date heading */}
      <div className="pt-2 pb-1 hidden md:block">
        <h2 className="text-2xl font-bold text-slate-100">Hoy</h2>
        <p className="text-slate-400 capitalize">{formattedDate}</p>
      </div>

      <TodayProgress completed={completedToday} total={activeHabits.length} />

      <WeeklyStreak data={streakData} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Hábitos de hoy</h3>
          <Link
            href="/habitos/nuevo"
            className="hidden md:flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            <Plus size={12} />
            Agregar
          </Link>
        </div>
        <HabitList habits={activeHabits} initialRecords={records} today={today} />
      </div>

      <DayRatingForm today={today} initialRating={todayRating ?? null} />
    </div>
  );
}
