"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "../ui/badge";
import { ArticleListSkeleton } from "./articles-skeleton";

const PAGE_SIZE = 10;

export function ArticleList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: PAGE_SIZE }
  );

  if (status === "LoadingFirstPage") {
    return <ArticleListSkeleton />;
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {results.map((article) => (
          <article className="py-4" key={article.slug}>
          <ViewTransition name={`title-${article.slug}`}>
            <Link href={`/articles/${article.slug}`} prefetch={true}>
              <h2 className="text-3xl font-semibold text-[#3399ff] hover:text-blue-500 transition-colors mb-3">
                {article.title}
              </h2>
            </Link>
          </ViewTransition>
    
          <div className="flex items-center justify-between text-sm text-gray-500">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </div>
          {article.tags?.length ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {article.tags.map((tag) => (
                <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : null}
        </article>
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
