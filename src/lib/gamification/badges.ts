export type BadgeId =
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'streak_365'
  | 'perfect_week'
  | 'first_friend'
  | 'encourager_10'
  | 'weekly_top';

export type BadgeDef = {
  id: BadgeId;
  label: string;
  description: string;
  icon: string;
  color: string;
};

export const BADGES: Record<BadgeId, BadgeDef> = {
  streak_7: {
    id: 'streak_7',
    label: '7 días',
    description: '7 días de racha en un hábito',
    icon: '🔥',
    color: 'text-orange-400',
  },
  streak_30: {
    id: 'streak_30',
    label: '30 días',
    description: '30 días de racha en un hábito',
    icon: '⚡',
    color: 'text-yellow-400',
  },
  streak_100: {
    id: 'streak_100',
    label: '100 días',
    description: '100 días de racha en un hábito',
    icon: '💎',
    color: 'text-cyan-400',
  },
  streak_365: {
    id: 'streak_365',
    label: '1 año',
    description: '365 días de racha — ¡Increíble!',
    icon: '👑',
    color: 'text-amber-400',
  },
  perfect_week: {
    id: 'perfect_week',
    label: 'Semana perfecta',
    description: '7 días consecutivos completando todos tus hábitos',
    icon: '✨',
    color: 'text-purple-400',
  },
  first_friend: {
    id: 'first_friend',
    label: 'Primer amigo',
    description: 'Conectaste con tu primer amigo',
    icon: '🤝',
    color: 'text-green-400',
  },
  encourager_10: {
    id: 'encourager_10',
    label: 'Motivador',
    description: 'Animaste a tus amigos 10 veces',
    icon: '💪',
    color: 'text-blue-400',
  },
  weekly_top: {
    id: 'weekly_top',
    label: 'Top semanal',
    description: 'Terminaste 1° en el leaderboard semanal',
    icon: '🏆',
    color: 'text-amber-400',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function awardBadge(supabase: any, userId: string, badgeId: BadgeId): Promise<boolean> {
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single();

  // If unique constraint fires (already earned), error is ignored
  return !error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkStreakBadges(supabase: any, userId: string, streak: number): Promise<void> {
  const milestones: Array<[number, BadgeId]> = [
    [7, 'streak_7'],
    [30, 'streak_30'],
    [100, 'streak_100'],
    [365, 'streak_365'],
  ];
  for (const [threshold, badgeId] of milestones) {
    if (streak >= threshold) {
      await awardBadge(supabase, userId, badgeId);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserBadges(supabase: any, userId: string): Promise<BadgeId[]> {
  const { data } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .order('earned_at', { ascending: true });

  return (data ?? []).map((b: { badge_id: string }) => b.badge_id as BadgeId);
}
