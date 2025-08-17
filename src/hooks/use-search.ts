import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  cacheSearchResults, 
  getCachedSearchResults, 
  clearSearchCache 
} from "@/utils/search-cache";
import type { SearchResult, SearchState, SearchActions } from "@/types/search";

const SEARCH_LIMIT = 40;
const SEARCH_DEBOUNCE = 300;
const URL_DEBOUNCE = 500;

export function useSearch(): SearchState & SearchActions {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchAction = useAction(api.semantic_search.searchArticles);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Check for cached results on component mount and restore state
  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      const cached = getCachedSearchResults(initialQuery, SEARCH_LIMIT);
      if (cached) {
        setResults(cached.results);
        setLastSearchedQuery(initialQuery);
        setHasSearched(true);
        // Restore scroll position after a brief delay to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo({ top: cached.scrollPosition, behavior: 'smooth' });
        }, 50);
      }
    }
  }, [searchParams]);

  // Search when query changes
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setLastSearchedQuery("");
        setHasSearched(false);
        return;
      }

      // Check cache first
      const cached = getCachedSearchResults(query, SEARCH_LIMIT);
      if (cached) {
        setResults(cached.results);
        setLastSearchedQuery(query);
        setHasSearched(true);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchAction({ query, limit: SEARCH_LIMIT });
        const results = searchResults || [];
        setResults(results);
        setLastSearchedQuery(query);
        setHasSearched(true);
        
        // Cache the results
        cacheSearchResults(query, SEARCH_LIMIT, results);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setLastSearchedQuery(query);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(search, SEARCH_DEBOUNCE);
    return () => clearTimeout(timeoutId);
  }, [query, searchAction]);

  // Update URL when query changes
  useEffect(() => {
    const updateUrl = () => {
      const url = query.trim() ? `/search?q=${encodeURIComponent(query)}` : "/search";
      router.replace(url, { scroll: false });
    };

    const timeoutId = setTimeout(updateUrl, URL_DEBOUNCE);
    return () => clearTimeout(timeoutId);
  }, [query, router]);

  // Actions
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setLastSearchedQuery("");
    setHasSearched(false);
    clearSearchCache();
  };

  const handleArticleClick = () => {
    if (query.trim() && results.length > 0) {
      const scrollPosition = window.scrollY;
      cacheSearchResults(query, SEARCH_LIMIT, results, scrollPosition);
    }
  };

  return {
    query,
    results,
    isLoading,
    lastSearchedQuery,
    hasSearched,
    setQuery,
    handleClear,
    handleArticleClick,
  };
}