"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { parseAsString, useQueryStates } from "nuqs";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import { RagSearchBar } from "@/components/search/rag-search-bar";
import { SearchResults } from "@/components/search/search-results";

export function RagSearchExperience() {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [{ q: urlQuery, tag: tagFilter }, setSearchParams] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      tag: parseAsString.withDefault(""),
    },
    { history: "push", shallow: false },
  );

  const [draftQuery, setDraftQuery] = useState(urlQuery);
  const [isEditing, setIsEditing] = useState(false);
  const [results, setResults] = useState<
    FunctionReturnType<typeof api.rag_search.searchArticlesRAG>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueriedRef = useRef("");

  const inputValue = isEditing ? draftQuery : urlQuery;

  useEffect(() => {
    const trimmed = urlQuery.trim();
    const tag = tagFilter.trim();

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
        const data = await searchAction({
          query: trimmed,
          limit: 30,
          ...(tag ? { tagFilter: tag } : {}),
        });
        if (!cancelled && lastQueriedRef.current === trimmed) {
          setResults(Array.isArray(data) ? data : []);
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
  }, [urlQuery, tagFilter, searchAction]);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    setIsEditing(false);
    void setSearchParams({
      q: trimmed || null,
      tag: tagFilter.trim() || null,
    });
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
