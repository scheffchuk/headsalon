"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardSkeleton } from "@/components/ArticleCardSkeleton";
import { LoadingText } from "@/components/ui/loading-text";
import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ARTICLES_PER_PAGE = 20;

export function ArticlesPreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: ARTICLES_PER_PAGE }
  );

  // Memoized navigation function with smooth scroll to top
  const navigateToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url, { scroll: true });
    },
    [router, pathname, searchParams]
  );

  // Simplified loading logic - load more items if we need them for the current page
  useEffect(() => {
    const itemsNeeded = currentPage * ARTICLES_PER_PAGE;
    const canLoadMore =
      status === "CanLoadMore" && results.length < itemsNeeded;

    if (canLoadMore) {
      loadMore(ARTICLES_PER_PAGE);
    }
  }, [currentPage, results.length, status, loadMore]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="min-h-screen flex mx-auto py-8">
        <LoadingText />
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && status === "Exhausted") {
    return (
      <div className="mx-auto py-8 mt-16">
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Maybe comeback later</p>
        </div>
      </div>
    );
  }

  // Calculate current page boundaries
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentPageArticles = results.slice(startIndex, endIndex);

  // Determine if we can show next/previous pages
  const hasLoadedCurrentPage =
    results.length >=
    startIndex + Math.min(currentPageArticles.length, ARTICLES_PER_PAGE);
  const canShowPrevious = currentPage > 1;
  const canShowNext = status === "CanLoadMore" || results.length > endIndex;

  // Show loading skeletons when loading more or when current page is incomplete
  const isLoadingCurrentPage =
    status === "LoadingMore" ||
    (currentPageArticles.length === 0 &&
      status === "CanLoadMore" &&
      results.length < startIndex + 1);

  const skeletonCount = isLoadingCurrentPage
    ? ARTICLES_PER_PAGE - currentPageArticles.length
    : 0;

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {currentPageArticles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}

        {skeletonCount > 0 &&
          Array.from({ length: skeletonCount }, (_, index) => (
            <ArticleCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Show pagination only when we have content or are loading */}
      {(canShowPrevious || canShowNext) && hasLoadedCurrentPage && (
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
      )}
    </div>
  );
}
