export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-cinema-card rounded ${className}`} />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="w-44 flex-shrink-0">
      <Skeleton className="aspect-[2/3] rounded-xl" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="w-32 flex-shrink-0">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="w-full aspect-[21/9] rounded-b-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-64 h-96 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton({ count = 6 }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
