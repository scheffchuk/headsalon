import { Skeleton } from "./ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <article className="py-4">
      {/* Title skeleton */}
      <Skeleton className="h-10 w-3/5 mb-3 rounded-sm" />

      {/* Date skeleton */}
      <div className="flex items-center justify-between text-sm mb-2">
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
    </article>
  );
}