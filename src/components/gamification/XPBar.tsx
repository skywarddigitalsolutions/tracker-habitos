import { computeLevel, getLevelName, xpToNextLevel, LEVEL_THRESHOLDS } from '@/lib/gamification/xp';

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const level = computeLevel(xp);
  const name = getLevelName(level);
  const { current, needed } = xpToNextLevel(xp);
  const pct = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100;
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nivel {level}</p>
          <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-text)' }}>
            {xp.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP total</p>
        </div>
      </div>

      {!isMaxLevel && (
        <>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent-from), var(--accent-to))',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {current.toLocaleString()} / {needed.toLocaleString()} XP
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Nivel {level + 1}: {getLevelName(level + 1)}
            </p>
          </div>
        </>
      )}

      {isMaxLevel && (
        <p className="text-xs text-center" style={{ color: 'var(--accent-text)' }}>
          ¡Nivel máximo alcanzado! 🏆
        </p>
      )}
    </div>
  );
}
