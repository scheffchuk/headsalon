"use client";

import { PaginationSkeleton } from "@/components/ui/pagination-skeleton";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArticleCardSkeleton } from "../article/article-card-skeleton";
import { ArticleCard } from "../article/article-card";
import { useQueryState, parseAsInteger } from "nuqs";

const ARTICLES_PER_PAGE = 10;

export function ArticlesClient() {
  const pageParser = useMemo(() => parseAsInteger.withDefault(1), []);
  const [pageValue, setPage] = useQueryState("page", pageParser);
  const [isPending, startTransition] = useTransition();

  const currentPage = Math.max(pageValue ?? 1, 1);
  const itemsPerPage = ARTICLES_PER_PAGE;

  // Use a stable initial page size; avoid offset-style refetching
  const initialPageRef = useRef<number>(Math.max(pageValue ?? 1, 1));
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: initialPageRef.current * itemsPerPage }
  );

  // When the page increases, request one more page worth of items.
  useEffect(() => {
    const requiredCount = currentPage * itemsPerPage;
    if (status === "CanLoadMore" && results.length < requiredCount) {
      const remaining = requiredCount - results.length;
      if (remaining > 0) {
        loadMore(remaining);
      }
    }
  }, [currentPage, itemsPerPage, loadMore, results.length, status]);

  // If we've exhausted results but the current page is beyond the last page,
  // clamp the page to the last available page to avoid empty slices.
  useEffect(() => {
    if (status !== "Exhausted") return;
    if (currentPage <= 1) return;

    const lastPage = Math.max(1, Math.ceil(results.length / itemsPerPage));
    if (currentPage > lastPage) {
      setPage(lastPage === 1 ? null : lastPage, { history: "replace" });
    }
  }, [currentPage, itemsPerPage, results.length, setPage, status]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageArticles = results.slice(startIndex, endIndex);

  const showInitialSkeleton = status === "LoadingFirstPage" && results.length === 0;
  const showPageSkeleton =
    (status === "LoadingMore" || isPending) &&
    results.length < currentPage * itemsPerPage &&
    results.length >= itemsPerPage;
  const showEmpty = status === "Exhausted" && results.length === 0;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = status === "CanLoadMore" || status === "LoadingMore";

  // Navigation function with loading state
  const navigateToPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(page, 1);
      if (nextPage === currentPage) return;
      startTransition(() => {
        setPage(nextPage === 1 ? null : nextPage, { history: "replace" });
      });
    },
    [currentPage, setPage, startTransition]
  );

  if (showEmpty) {
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
        {showInitialSkeleton ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <ArticleCardSkeleton key={`initial-skeleton-${index}`} />
          ))
        ) : (
          <>
            {currentPageArticles.map((article) => (
              <ArticleCard article={article} key={article._id} />
            ))}
            {showPageSkeleton &&
              Array.from(
                {
                  length: Math.max(
                    itemsPerPage - currentPageArticles.length,
                    1
                  ),
                },
                (_, index) => (
                  <ArticleCardSkeleton key={`loading-skeleton-${index}`} />
                )
              )}
          </>
        )}
      </div>

      {showInitialSkeleton || showPageSkeleton ? (
        <PaginationSkeleton />
      ) : (
        (hasPreviousPage || hasNextPage) && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {hasPreviousPage && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => navigateToPage(currentPage - 1)}
                    />
                  </PaginationItem>
                )}

                {hasNextPage && (
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
