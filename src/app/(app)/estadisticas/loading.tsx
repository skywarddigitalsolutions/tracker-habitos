import { Skeleton } from '@/components/ui/Skeleton';

export default function EstadisticasLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between h-14">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 space-y-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Chart area 1 */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>

      {/* Chart area 2 */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>

      {/* Heatmap area */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
      </div>
    </div>
  );
}
