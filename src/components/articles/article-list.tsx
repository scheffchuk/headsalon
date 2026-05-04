"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArticleListRow } from "./article-list-row";
import { ArticleListSkeleton } from "./articles-skeleton";

const PAGE_SIZE = 30;

export function ArticleList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  if (status === "LoadingFirstPage") {
    return <ArticleListSkeleton />;
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {results.map((article) => (
          <ArticleListRow
            key={article.slug}
            article={{
              _id: article._id,
              title: article.title,
              slug: article.slug,
              date: article.date,
              tags: article.tags,
            }}
            titleViewTransitionName={`title-${article.slug}`}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-1">
        <Button
          onClick={() => loadMore(PAGE_SIZE)}
          disabled={status !== "CanLoadMore"}
          variant="ghost"
        >
          {status === "LoadingMore"
            ? "Loading…"
            : status === "Exhausted"
              ? `${results.length} articles`
              : "Load more"}
        </Button>
      </div>
    </div>
  );
}
