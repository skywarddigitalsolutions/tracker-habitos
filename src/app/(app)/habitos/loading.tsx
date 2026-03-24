import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitosLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between h-14 mb-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Section label */}
      <Skeleton className="h-3 w-24 mb-3" />

      {/* Habit list items */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: '56px' }}
          >
            <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
