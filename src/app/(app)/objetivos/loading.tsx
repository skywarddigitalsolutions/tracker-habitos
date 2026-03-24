import { Skeleton } from '@/components/ui/Skeleton';

export default function ObjetivosLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between h-14">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Section */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Second section */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
