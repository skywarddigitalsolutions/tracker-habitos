import { BADGES, type BadgeId } from '@/lib/gamification/badges';

interface BadgesDisplayProps {
  badgeIds: BadgeId[];
  compact?: boolean;
}

export function BadgesDisplay({ badgeIds, compact = false }: BadgesDisplayProps) {
  if (badgeIds.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {badgeIds.map((id) => {
          const badge = BADGES[id];
          if (!badge) return null;
          return (
            <span
              key={id}
              title={badge.description}
              className="text-base leading-none"
              aria-label={badge.label}
            >
              {badge.icon}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3
        className="text-sm font-bold text-white mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Logros
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {badgeIds.map((id) => {
          const badge = BADGES[id];
          if (!badge) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-2xl leading-none flex-shrink-0">{badge.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{badge.label}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked badges */}
      {badgeIds.length < Object.keys(BADGES).length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(BADGES) as BadgeId[])
            .filter((id) => !badgeIds.includes(id))
            .map((id) => (
              <div
                key={id}
                title={BADGES[id].description}
                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-25 grayscale"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-base leading-none">{BADGES[id].icon}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
