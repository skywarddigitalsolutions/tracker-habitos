'use client';

import { CheckCircle2, PartyPopper, Zap } from 'lucide-react';

interface TodayProgressProps {
  completed: number;
  total: number;
  userName?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function TodayProgress({ completed, total, userName }: TodayProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const greeting = getGreeting();
  const firstName = userName?.split(' ')[0] ?? 'Explorador';

  const isAllDone = total > 0 && completed === total;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 animate-fade-up"
      style={{
        background: isAllDone
          ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)'
          : 'linear-gradient(135deg, rgba(124,58,237,0.13) 0%, rgba(79,70,229,0.06) 100%)',
        border: `1px solid ${isAllDone ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.22)'}`,
        boxShadow: isAllDone
          ? '0 0 40px rgba(16,185,129,0.06)'
          : '0 0 40px rgba(124,58,237,0.06)',
      }}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: isAllDone
            ? 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="flex items-center justify-between relative gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: isAllDone ? '#34d399' : 'var(--accent-text)' }}>
            {greeting}
          </p>
          <h2
            className="text-xl font-bold text-white mb-3 truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {firstName}
          </h2>

          {total === 0 ? (
            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Zap size={14} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
              <a href="/habitos/nuevo" style={{ color: 'var(--accent-text)' }} className="underline underline-offset-2">
                Creá tu primer hábito
              </a>
            </p>
          ) : isAllDone ? (
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#34d399' }}>
              <PartyPopper size={15} aria-hidden="true" />
              ¡Completaste todos tus hábitos!
            </p>
          ) : (
            <>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                <span className="text-white font-bold text-lg">{completed}</span>
                <span> de </span>
                <span className="text-white font-bold text-lg">{total}</span>
                <span> completados</span>
              </p>
              {/* Progress bar */}
              <div
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso diario: ${percentage}%`}
                className="w-full max-w-[220px] h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #818cf8)',
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Circular progress */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <svg className="-rotate-90" width="84" height="84" viewBox="0 0 88 88">
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="5"
            />
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke={isAllDone ? 'url(#doneGrad)' : 'url(#progressGrad)'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
              style={{ filter: `drop-shadow(0 0 6px ${isAllDone ? 'rgba(16,185,129,0.7)' : 'rgba(124,58,237,0.7)'})` }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="doneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            {isAllDone ? (
              <CheckCircle2 size={22} style={{ color: '#34d399' }} />
            ) : (
              <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {percentage}%
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
