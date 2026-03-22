import { getWeekNumber, getLocalDateString } from './dates';

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function calculateStreak(records: boolean[]): number {
  let streak = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateAvgRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function groupByWeek(
  records: { date: string; completed: boolean }[],
  year: number
): Map<number, { completed: number; total: number }> {
  const map = new Map<number, { completed: number; total: number }>();
  for (const record of records) {
    const d = new Date(record.date + 'T00:00:00');
    if (d.getFullYear() !== year) continue;
    const week = getWeekNumber(d);
    const existing = map.get(week) ?? { completed: 0, total: 0 };
    map.set(week, {
      completed: existing.completed + (record.completed ? 1 : 0),
      total: existing.total + 1,
    });
  }
  return map;
}

export function groupByMonth(
  records: { date: string; completed: boolean }[],
  year: number
): Map<number, { completed: number; total: number }> {
  const map = new Map<number, { completed: number; total: number }>();
  for (const record of records) {
    const d = new Date(record.date + 'T00:00:00');
    if (d.getFullYear() !== year) continue;
    const month = d.getMonth() + 1;
    const existing = map.get(month) ?? { completed: 0, total: 0 };
    map.set(month, {
      completed: existing.completed + (record.completed ? 1 : 0),
      total: existing.total + 1,
    });
  }
  return map;
}
