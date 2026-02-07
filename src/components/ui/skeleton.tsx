export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return <div className="skeleton h-4" style={{ width }} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonLine width="40%" />
      <SkeletonLine />
      <SkeletonLine width="60%" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
