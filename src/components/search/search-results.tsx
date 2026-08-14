import { ArticlePreviewRow } from "@/components/articles/article-preview-row";
import { SearchStates } from "./search-states";
import type { SearchResult } from "@convex/searchResult";

export function SearchResults({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}) {
  if (!query.trim()) {
    return <SearchStates state="empty" />;
  }

  if (isLoading) {
    return <SearchStates state="loading" />;
  }

  return (
    <div className="flex flex-col space-y-6">
      {results.map((hit) => (
        <ArticlePreviewRow
          key={hit._id}
          article={hit}
          titleViewTransitionName={`title-${hit._id}`}
          openArticleInNewTab
        />
      ))}
    </div>
  );
}
