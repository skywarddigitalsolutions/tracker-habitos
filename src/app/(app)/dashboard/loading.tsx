import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto px-5 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between h-14">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Habit cards */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Weekly streak */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="flex-1 h-12 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Day rating */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="flex-1 h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
