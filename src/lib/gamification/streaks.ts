import { getLocalDateString } from '@/lib/utils/dates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function calculateHabitStreak(supabase: any, habitId: string, userId: string): Promise<number> {
  const { data: records } = await supabase
    .from('habit_records')
    .select('date, completed')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(400);

  if (!records || records.length === 0) return 0;

  let streak = 0;
  const today = new Date(getLocalDateString() + 'T12:00:00');
  let expected = new Date(today);

  for (const record of records as { date: string; completed: boolean }[]) {
    const expectedStr = getLocalDateString(expected);
    if (record.date === expectedStr) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else if (streak === 0 && record.date < expectedStr) {
      // Allow yesterday's record to still count if today hasn't been completed yet
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      if (record.date === yesterdayStr) {
        streak++;
        expected = new Date(yesterday);
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

// Calculate streak directly from an array of date strings (sorted desc)
export function calculateStreakFromDates(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  const today = getLocalDateString();
  const yesterday = (() => {
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  })();

  // Streak must start from today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  const startDate = new Date(sorted[0] + 'T12:00:00');
  let expected = new Date(startDate);

  for (const date of sorted) {
    if (getLocalDateString(expected) === date) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
