import { PaginationSkeleton } from "@/components/ui/pagination-skeleton";
import { ArticleCardSkeleton } from "../article/article-card-skeleton";

export function ArticlesSkeleton() {
  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <ArticleCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
      <div className="mt-8">
        <PaginationSkeleton />
      </div>
    </div>
  );
}