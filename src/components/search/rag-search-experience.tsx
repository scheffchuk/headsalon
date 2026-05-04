"use client";

import { useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { SearchResult } from "@convex/searchResult";
import { RagSearchBar } from "@/components/search/rag-search-bar";
import { SearchResults } from "@/components/search/search-results";

export function RagSearchExperience() {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueriedRef = useRef("");
  /** Latest input from the bar; used to drop stale responses if the user edits mid-flight. */
  const queryInputRef = useRef("");

  const handleQueryChange = (value: string) => {
    setQuery(value);
    queryInputRef.current = value;
    if (value.trim() !== lastQueriedRef.current) {
      setResults([]);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed === "") {
      setResults([]);
      setIsLoading(false);
      lastQueriedRef.current = "";
      return;
    }

    lastQueriedRef.current = trimmed;
    setIsLoading(true);

    try {
      const data = await searchAction({ query: trimmed, limit: 30 });
      if (
        lastQueriedRef.current === trimmed &&
        queryInputRef.current.trim() === trimmed
      ) {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Search failed:", err);
      if (queryInputRef.current.trim() === trimmed) {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <RagSearchBar
          placeholder=""
          searchHistory={true}
          onSearch={handleSearch}
          onQueryChange={handleQueryChange}
        />
      </header>

      <main>
        <SearchResults query={query} results={results} isLoading={isLoading} />
      </main>
    </div>
  );
}
