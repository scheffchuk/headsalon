"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { ArticleCardSkeleton } from "@/components/article-card-skeleton";
import { api } from "../../../convex/_generated/api";
import { ArticlesClient } from "./articles-client";

const ARTICLES_PER_PAGE = 10;

export function ArticlesContainer() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Calculate pagination for Convex
  const numItems = page * ARTICLES_PER_PAGE;

  const articles = useQuery(api.articles.getArticles, {
    paginationOpts: { numItems, cursor: null },
  });

  // Loading state
  if (articles === undefined) {
    return (
      <div className="mx-auto py-8 mt-16">
        <div className="flex flex-col space-y-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <ArticleCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Calculate current page boundaries
  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentPageArticles = articles.page.slice(startIndex, endIndex);

  // Determine pagination state
  const hasLoadedCurrentPage =
    articles.page.length >=
    startIndex + Math.min(currentPageArticles.length, ARTICLES_PER_PAGE);
  const canShowPrevious = page > 1;
  const canShowNext = !articles.isDone || articles.page.length > endIndex;

  return (
    <ArticlesClient
      articles={currentPageArticles}
      currentPage={page}
      canShowPrevious={canShowPrevious}
      canShowNext={canShowNext}
      hasLoadedCurrentPage={hasLoadedCurrentPage}
      isEmpty={articles.page.length === 0 && articles.isDone}
    />
  );
}