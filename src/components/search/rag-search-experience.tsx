"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { parseAsString, useQueryState } from "nuqs";
import type { SearchResult } from "@convex/searchResult";
import { api } from "../../../convex/_generated/api";
import { RagSearchBar } from "@/components/search/rag-search-bar";
import { SearchResults } from "@/components/search/search-results";
import { searchCommittedQuery } from "@/components/search/committed-rag-search";

export function RagSearchExperience() {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [urlQuery, setUrlQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );

  const [draftQuery, setDraftQuery] = useState(urlQuery);
  const [isEditing, setIsEditing] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueriedRef = useRef("");

  const inputValue = isEditing ? draftQuery : urlQuery;

  useEffect(() => {
    const trimmed = urlQuery.trim();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      lastQueriedRef.current = "";
      return;
    }

    let cancelled = false;
    lastQueriedRef.current = trimmed;
    setIsLoading(true);

    void (async () => {
      try {
        const data = await searchCommittedQuery(urlQuery, searchAction);
        if (!cancelled && lastQueriedRef.current === trimmed) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
        if (!cancelled && lastQueriedRef.current === trimmed) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlQuery, searchAction]);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    setIsEditing(false);
    void setUrlQuery(trimmed || null);
  };

  return (
    <div className="mx-auto mt-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <RagSearchBar
          placeholder=""
          searchHistory={true}
          value={inputValue}
          onSearch={handleSearch}
          onQueryChange={(next) => {
            setIsEditing(true);
            setDraftQuery(next);
          }}
          onFocus={() => {
            setIsEditing(true);
            setDraftQuery(urlQuery);
          }}
        />
      </header>

      <main>
        <SearchResults
          query={urlQuery}
          results={results}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
