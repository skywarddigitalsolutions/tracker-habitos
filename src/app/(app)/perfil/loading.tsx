import { Skeleton } from '@/components/ui/Skeleton';

export default function PerfilLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-5">
      {/* Header */}
      <div className="h-14 flex items-center">
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Form fields */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}
