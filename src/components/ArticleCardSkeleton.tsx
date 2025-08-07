import { Skeleton } from "./ui/skeleton";

export function ArticleCardSkeleton() {
  return (
    <article className="py-4">
      {/* Title skeleton - matches h2 text-3xl */}
      <Skeleton className="h-9 w-3/4 mb-3" />
      
      {/* Date skeleton - matches text-sm */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Tags skeleton - matches badges layout */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
    </article>
  );
}