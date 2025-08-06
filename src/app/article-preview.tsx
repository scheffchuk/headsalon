"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArticleCard } from "@/components/ArticleCard";
import { Loader2 } from "lucide-react";
import { LoadingText } from "@/components/ui/loading-text";
import { usePersistedPagination } from "@/hooks/usePersistedState";
import { useRef } from "react";

export function ArticlesPreview() {
  const { initialItems, saveItems } = usePersistedPagination();
  const hasRestoredRef = useRef(false);
  
  const { results, status, loadMore } = usePaginatedQuery(
    api.articles.getArticles,
    {},
    { initialNumItems: initialItems }
  );

  // Restore pagination directly when conditions are met (no useEffect needed)
  if (initialItems > 20 && results.length === 20 && status === "CanLoadMore" && !hasRestoredRef.current) {
    loadMore(initialItems - 20);
    hasRestoredRef.current = true;
  }
  if (status === "LoadingFirstPage") {
    return (
      <div className="min-h-screen flex mx-auto py-8">
        <LoadingText />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mx-auto py-8 mt-16">
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">暂无文章</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {results.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>

      {status === "CanLoadMore" && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              loadMore(20);
              saveItems(results.length + 20);
            }}
            className="px-6 py-2 text-gray-800 hover:text-[#3399ff] transition-none cursor-pointer"
          >
            Load More...
          </button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      )}
    </div>
  );
}
