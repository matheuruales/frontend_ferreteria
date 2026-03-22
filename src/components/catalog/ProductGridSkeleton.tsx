export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col animate-pulse"
        >
          {/* Image placeholder */}
          <div className="aspect-square bg-neutral-100" />

          {/* Info placeholder */}
          <div className="p-4 flex flex-col gap-2 flex-1">
            <div className="h-3 bg-neutral-100 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-3/4" />
            <div className="mt-auto pt-2">
              <div className="h-6 bg-neutral-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
