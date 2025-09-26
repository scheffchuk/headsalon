import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { SearchState, SearchActions, SearchResult } from "@/types/search";

const SEARCH_LIMIT = 30;

export function useSearch(): SearchState & SearchActions {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [results, setResults] = useState<SearchResult[]>([]);
  const lastQueriedRef = useRef<string>("");

  useEffect(() => {
    const trimmed = searchQuery.trim();
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
  }, [searchQuery, searchAction]);

  const executeSearch = useCallback(
    (searchTerm: string) => {
      setSearchQuery(searchTerm);
    },
    []
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setResults([]);
  }, []);

  return {
    query,
    results,
    isLoading: isPending,
    executeSearch,
    handleClear,
  };
}
