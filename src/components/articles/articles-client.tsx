"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArticleCard } from "../article/article-card";
import { ArticlesSkeleton } from "./articles-skeleton";
import { Button } from "@/components/ui/button";
import { StaggeredMotion } from "../ui/staggered-motion";

const PAGE_SIZE = 10;

export function Articles() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: PAGE_SIZE }
  );

  if (status === "LoadingFirstPage") {
    return <ArticlesSkeleton />;
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {results.map((article) => (
          <ArticleCard article={article} key={article._id} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => loadMore(PAGE_SIZE)}
          disabled={status !== "CanLoadMore"}
          variant="ghost"
        >
          {status === "LoadingMore"
            ? "Loading…"
            : status === "Exhausted"
            ? "No more"
            : "Load more"}
        </Button>
      </div>
    </div>
  );
}
