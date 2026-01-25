"use client";

import { useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SearchResults } from "@/components/search/search-results";
import { SmartSearch } from "@/components/smart-search";
import type { SearchResult } from "@/types/search";

export default function SearchPageContent() {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueriedRef = useRef<string>("");

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed === "") {
      setResults([]);
      setIsLoading(false);
      return;
    }

    lastQueriedRef.current = trimmed;
    setIsLoading(true);

    try {
      const data = await searchAction({ query: trimmed, limit: 30 });
      if (lastQueriedRef.current === trimmed) {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <SmartSearch
          placeholder=""
          searchHistory={true}
          // suggestions={suggestions}
          onSearch={handleSearch}
          onQueryChange={setQuery}
          urlSync={false}
        />
      </header>

      {/* Results */}
      <main>
        <SearchResults query={query} results={results} isLoading={isLoading} />
      </main>
    </div>
  );
}
