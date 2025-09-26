import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { SearchState, SearchActions, SearchResult } from "@/types/search";

const SEARCH_LIMIT = 40;

export function useSearch(): SearchState & SearchActions {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [isPending, startTransition] = useTransition();
  

  const [queryValue, setQueryValue] = useQueryState("q", parseAsString.withOptions({
    history: "replace",
    scroll: false,
    // Use startTransition from React to reflect loading state during URL updates
    startTransition,
    // Enable server notifications if needed in the future
    shallow: false,
  }));
  
  const query = queryValue ?? "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const lastQueriedRef = useRef<string>("");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === "") {
      setResults([]);
      return;
    }

    let cancelled = false;
    lastQueriedRef.current = trimmed;

    startTransition(() => {
      (async () => {
        try {
          const data = await searchAction({ query: trimmed, limit: SEARCH_LIMIT });
          if (!cancelled && lastQueriedRef.current === trimmed) {
            setResults(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          if (!cancelled) {
            console.error("Search failed:", err);
            setResults([]);
          }
        }
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [query, searchAction]);

  const setQuery = useCallback(
    (value: string) => {
      const nextValue = value.length === 0 ? null : value;
      setQueryValue(nextValue);
    },
    [setQueryValue]
  );

  const handleClear = useCallback(() => {
    setQueryValue(null);
  }, [setQueryValue]);

  return {
    query,
    results,
    isLoading: isPending,
    setQuery,
    handleClear,
  };
}
