import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getLocalDateString } from '@/lib/utils/dates';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { StatsClient } from './StatsClient';

export const dynamic = 'force-dynamic';

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getLocalDateString();
  const now = new Date(today + 'T12:00:00');
  const year = now.getFullYear();

  // Fetch all records for this year
  const { data: allRecords } = await supabase
    .from('habit_records')
    .select('date, completed, habit_id')
    .eq('user_id', user.id)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);

  // Fetch all ratings for this year
  const { data: allRatings } = await supabase
    .from('day_ratings')
    .select('date, rating')
    .eq('user_id', user.id)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);

  // Fetch habits with categories
  const { data: habits } = await supabase
    .from('habits')
    .select('id, category_id')
    .eq('user_id', user.id);

  // Build all records map (combined across all habits)
  const combinedRecords = new Map<string, { completed: number; total: number }>();
  for (const r of allRecords ?? []) {
    const existing = combinedRecords.get(r.date) ?? { completed: 0, total: 0 };
    combinedRecords.set(r.date, {
      completed: existing.completed + (r.completed ? 1 : 0),
      total: existing.total + 1,
    });
  }

  // Daily completion rate data
  const dailyData = Array.from(combinedRecords.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30) // last 30 days
    .map(([date, { completed, total }]) => ({
      date,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }));

  // Weekly average ratings
  const weeklyRatings = new Map<string, number[]>();
  for (const r of allRatings ?? []) {
    const d = new Date(r.date + 'T12:00:00');
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = getLocalDateString(weekStart);
    const existing = weeklyRatings.get(key) ?? [];
    weeklyRatings.set(key, [...existing, r.rating]);
  }
  const weeklyData = Array.from(weeklyRatings.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, ratings]) => ({
      week: week.slice(5),
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    }));

  // Monthly average ratings
  const monthlyRatings = new Map<number, number[]>();
  for (const r of allRatings ?? []) {
    const m = new Date(r.date + 'T12:00:00').getMonth() + 1;
    const existing = monthlyRatings.get(m) ?? [];
    monthlyRatings.set(m, [...existing, r.rating]);
  }
  const monthlyData = Array.from(monthlyRatings.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, ratings]) => ({
      month,
      avg: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
    }));

  // Category breakdown
  const habitCategoryMap = new Map<string, number | null>();
  for (const h of habits ?? []) {
    habitCategoryMap.set(h.id, h.category_id);
  }

  const categoryStats = new Map<number, { completed: number; total: number }>();
  for (const r of allRecords ?? []) {
    const catId = habitCategoryMap.get(r.habit_id);
    if (catId == null) continue;
    const existing = categoryStats.get(catId) ?? { completed: 0, total: 0 };
    categoryStats.set(catId, {
      completed: existing.completed + (r.completed ? 1 : 0),
      total: existing.total + 1,
    });
  }

  const categoryData = DEFAULT_CATEGORIES
    .filter((c) => categoryStats.has(c.id))
    .map((c) => {
      const stats = categoryStats.get(c.id)!;
      return {
        category: c.name,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      };
    });

  // Annual grid - aggregate all completions
  const annualRecordsMap = new Map<string, boolean>();
  for (const r of allRecords ?? []) {
    if (r.completed) {
      annualRecordsMap.set(r.date, true);
    } else if (!annualRecordsMap.has(r.date)) {
      annualRecordsMap.set(r.date, false);
    }
  }

  // Overall stats
  const totalCompleted = (allRecords ?? []).filter((r) => r.completed).length;
  const totalRecords = (allRecords ?? []).length;
  const overallRate = totalRecords > 0 ? Math.round((totalCompleted / totalRecords) * 100) : 0;
  const avgRating = allRatings && allRatings.length > 0
    ? Math.round((allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length) * 10) / 10
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <Header />
      <div className="hidden md:block mb-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-100">Estadísticas {year}</h1>
      </div>

      <StatsClient
        dailyData={dailyData}
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        categoryData={categoryData}
        annualRecordsMap={Object.fromEntries(annualRecordsMap)}
        year={year}
        overallRate={overallRate}
        avgRating={avgRating}
        totalCompleted={totalCompleted}
      />
    </div>
  );
}
