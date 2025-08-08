import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { LoadingText } from "@/components/ui/loading-text";
import { ArticlesClient } from "./articles-client";

const ARTICLES_PER_PAGE = 20;

// Cache the Convex query with both React cache and Next.js cache
const getCachedArticles = cache(
  unstable_cache(
    async (page: number) => {
      // Calculate pagination for Convex
      const numItems = page * ARTICLES_PER_PAGE;

      const result = await fetchQuery(api.articles.getArticles, {
        paginationOpts: { numItems, cursor: null },
      });

      return result;
    },
    ["articles"],
    { revalidate: 300, tags: ["articles"] }
  )
);

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  
  // Fetch data server-side
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
    <Suspense fallback={<LoadingText />}>
      <ArticlesClient
        articles={currentPageArticles}
        currentPage={page}
        canShowPrevious={canShowPrevious}
        canShowNext={canShowNext}
        hasLoadedCurrentPage={hasLoadedCurrentPage}
        isEmpty={articles.page.length === 0 && articles.isDone}
      />
    </Suspense>
  );
}
