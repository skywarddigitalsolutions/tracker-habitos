import { getLevelName, computeLevel } from '@/lib/gamification/xp';
import { cn } from '@/lib/utils/cn';

interface LevelBadgeProps {
  xp: number;
  size?: 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

const LEVEL_COLORS = [
  'text-slate-400 bg-slate-800',        // 1
  'text-green-400 bg-green-900/30',     // 2
  'text-emerald-400 bg-emerald-900/30', // 3
  'text-cyan-400 bg-cyan-900/30',       // 4
  'text-blue-400 bg-blue-900/30',       // 5
  'text-violet-400 bg-violet-900/30',   // 6
  'text-purple-400 bg-purple-900/30',   // 7
  'text-amber-400 bg-amber-900/30',     // 8
  'text-orange-400 bg-orange-900/30',   // 9
  'text-red-400 bg-red-900/30',         // 10
];

export function LevelBadge({ xp, size = 'md', showName = false, className }: LevelBadgeProps) {
  const level = computeLevel(xp);
  const name = getLevelName(level);
  const colors = LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];

  if (size === 'sm') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold',
          colors,
          className
        )}
      >
        Nv.{level}
        {showName && <span className="font-normal opacity-80">{name}</span>}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold',
        colors,
        className
      )}
    >
      Nivel {level}
      {showName && <span className="font-normal opacity-80">· {name}</span>}
    </span>
  );
}
