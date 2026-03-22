import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color,
  className,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color ?? '#6366f1',
          }}
        />
      </div>
    </div>
  );
}
