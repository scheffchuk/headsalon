import { SearchResultItem } from "./search-result-item";
import { SearchStates } from "./search-states";
import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
};

export function SearchResults({
  query,
  results,
  isLoading,
}: SearchResultsProps) {
  if (!query.trim()) {
    return <SearchStates state="empty" />;
  }

  if (isLoading) {
    return <SearchStates state="loading" />;
  }

    return (
      

        <div className="flex flex-col space-y-6">
          {results.map((article) => (
            <SearchResultItem key={article._id} article={article} />
          ))}
        </div>
    );
  }

