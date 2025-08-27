import { SearchResultItem } from "./search-result-item";
import { SearchStates } from "./search-states";
import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  lastSearchedQuery: string;
  hasSearched: boolean;
  onArticleClick: () => void;
};

export function SearchResults({
  query,
  results,
  isLoading,
  lastSearchedQuery,
  hasSearched,
  onArticleClick,
}: SearchResultsProps) {
  // Determine current state
  if (!query.trim()) {
    return <SearchStates state="empty" />;
  }

  if (isLoading) {
    return <SearchStates state="loading" />;
  }

  if (results.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground border-b pb-3">
          找到{" "}
          <span className="font-medium text-foreground">{results.length}</span>{" "}
          篇有关
          <span className="font-medium text-foreground">
            {" "}
            &quot;{query}&quot;{" "}
          </span>
          的文章
        </div>

        <div className="flex flex-col space-y-6">
          {results.map((article) => (
            <SearchResultItem
              key={article._id}
              article={article}
              onClick={onArticleClick}
            />
          ))}
        </div>
      </div>
    );
  }

  // Only show no-results if we have actually searched and got no results
  if (
    results.length === 0 &&
    query.trim() === lastSearchedQuery &&
    hasSearched
  ) {
    return <SearchStates state="no-results" query={query} />;
  }

  // Default case: query doesn't match lastSearchedQuery (waiting for new search)
  return null;
}
