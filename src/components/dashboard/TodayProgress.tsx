'use client';

interface TodayProgressProps {
  completed: number;
  total: number;
}

export function TodayProgress({ completed, total }: TodayProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">Progreso de hoy</p>
          <p className="text-2xl font-bold text-slate-100">
            {completed} <span className="text-slate-500 text-lg font-normal">de {total}</span>
          </p>
          <p className="text-sm text-slate-400 mt-0.5">hábitos completados</p>

          {/* Progress bar */}
          <div className="mt-3 w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Circular progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="#1e293b"
              strokeWidth="4"
            />
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-100">
            {percentage}%
          </span>
        </div>
      </div>

      {total === 0 && (
        <p className="text-xs text-slate-500 mt-3">
          No tenés hábitos activos. ¡Creá uno para empezar!
        </p>
      )}
      {total > 0 && completed === total && (
        <p className="text-xs text-green-400 mt-3 font-medium">
          ¡Completaste todos tus hábitos de hoy! 🎉
        </p>
      )}
    </div>
  );
}
