"use client";

import { ArticleCard } from "@/components/article-card";
import { ArticleCardSkeleton } from "@/components/article-card-skeleton";
import { PaginationSkeleton } from "@/components/pagination-skeleton";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ArticlesClientProps = {
  articles: Array<{
    _id: string;
    title: string;
    slug: string;
    date: string;
    tags: string[];
  }>;
  currentPage: number;
  canShowPrevious: boolean;
  canShowNext: boolean;
  hasLoadedCurrentPage: boolean;
  isEmpty: boolean;
};

export function ArticlesClient({
  articles,
  currentPage,
  canShowPrevious,
  canShowNext,
  hasLoadedCurrentPage,
  isEmpty,
}: ArticlesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Navigation function with loading state
  const navigateToPage = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url);
    });
  };

  // Empty state
  if (isEmpty) {
    return (
      <div className="mx-auto py-8 mt-16">
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Maybe comeback later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {isPending ? (
          // Show loading skeletons during navigation
          Array.from({ length: 5 }).map((_, index) => (
            <ArticleCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          // Show actual articles when not loading
          articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))
        )}
      </div>

      {/* Show pagination or skeleton based on loading state */}
      {isPending ? (
        <PaginationSkeleton />
      ) : (
        (canShowPrevious || canShowNext) && hasLoadedCurrentPage && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {canShowPrevious && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => navigateToPage(currentPage - 1)}
                    />
                  </PaginationItem>
                )}

                {canShowNext && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => navigateToPage(currentPage + 1)}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )
      )}
    </div>
  );
}