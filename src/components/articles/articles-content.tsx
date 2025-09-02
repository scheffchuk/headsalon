import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { unstable_cache } from "next/cache";
import { ArticlesClient } from "@/components/articles/articles-client";

const ARTICLES_PER_PAGE = 10;

// Cache the Convex query with both React cache and Next.js cache
const getCachedArticles = unstable_cache(
  async (page: number) => {
    // Calculate pagination for Convex
    const numItems = page * ARTICLES_PER_PAGE;

    const result = await fetchQuery(api.articles.getArticles, {
      paginationOpts: { numItems, cursor: null },
    });

    return result;
  },
  ["articles"],
  { revalidate: 3600 * 24, tags: ["articles"] }
);

type ArticlesContentProps = {
  page: number;
};

export async function ArticlesContent({ page }: ArticlesContentProps) {
  // Fetch data server-side with improved caching
  const articles = await getCachedArticles(page);

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
