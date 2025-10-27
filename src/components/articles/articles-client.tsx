"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArticleCard } from "../article/article-card";

const ARTICLES_PER_PAGE = 10;

type ArticlesClientProps = {
  page?: number;
};

export async function Articles({ page = 1 }: ArticlesClientProps) {
  cacheLife("days");
  cacheTag("articles");

  const currentPage = Math.max(page, 1);
  const itemsPerPage = ARTICLES_PER_PAGE;
  const desiredItemCount = currentPage * itemsPerPage;

  const result = await fetchQuery(api.articles.getArticles, {
    paginationOpts: { cursor: null, numItems: desiredItemCount },
  });

  const results = result.page;
  const isDone = result.isDone;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentPageArticles = results.slice(startIndex, endIndex);

  const showEmpty = isDone && results.length === 0;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = !isDone || results.length > endIndex;

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
        {currentPageArticles.map((article) => (
          <ArticleCard article={article} key={article._id} />
        ))}
      </div>

      {(hasPreviousPage || hasNextPage) && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {hasPreviousPage && (
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage > 2 ? `?page=${currentPage - 1}` : "/"}
                  />
                </PaginationItem>
              )}

              {hasNextPage && (
                <PaginationItem>
                  <PaginationNext href={`?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
