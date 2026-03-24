export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];
export const LEVEL_NAMES = [
  'Semilla', 'Brote', 'Árbol', 'Bosque', 'Roble',
  'Montaña', 'Horizonte', 'Maestro', 'Sabio', 'Filósofo',
];

export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  ALL_HABITS_BONUS: 25,
  DAY_RATING: 5,
  GOAL_COMPLETE: 100,
  ENCOURAGE_FRIEND: 2,
} as const;

export function computeLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 7) return 1.5;
  return 1.0;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; levelXP: number } {
  const level = computeLevel(xp);
  const levelStart = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const levelEnd = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return {
    current: xp - levelStart,
    needed: levelEnd - levelStart,
    levelXP: levelStart,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function awardXP(supabase: any, userId: string, baseAmount: number, streak = 0): Promise<number> {
  const multiplier = getStreakMultiplier(streak);
  const amount = Math.round(baseAmount * multiplier);

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  const currentXP = (profile?.xp as number) ?? 0;
  const newXP = currentXP + amount;
  const newLevel = computeLevel(newXP);

  await supabase
    .from('profiles')
    .update({ xp: newXP, level: newLevel })
    .eq('id', userId);

  return amount;
}
