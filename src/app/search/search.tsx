"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

import SearchBar from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";

// Search configuration constants
const SEARCH_CONFIG = {
  DEBOUNCE_DELAY_MS: 270,
  RESULTS_PER_PAGE: 100,
  PLACEHOLDER_TEXT: "搜索文章标题或内容...",
  PAGE_TITLE: "搜索文章",
  BACK_TO_HOME_TEXT: "← 返回首页",
} as const;

// Type definitions for better type safety
type SearchParams = {
  query: string;
  paginationOpts: {
    numItems: number;
    cursor: null;
  };
};

type SearchResult = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt?: string;
  content?: string;
  _matchType?: "title" | "content";
};

type ConvexSearchResults =
  | {
    page: SearchResult[];
    isDone: boolean;
    continueCursor: string;
  }
  | undefined;

/**
 * Builds search URL with query parameters
 */
const buildSearchUrl = (query: string): string => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return "/search";
  }

  const params = new URLSearchParams();
  params.set("q", trimmedQuery);
  return `/search?${params.toString()}`;
};

/**
 * Creates search parameters for Convex query
 */
const createSearchParams = (query: string): SearchParams | "skip" => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return "skip";
  }

  return {
    query: trimmedQuery,
    paginationOpts: {
      numItems: SEARCH_CONFIG.RESULTS_PER_PAGE,
      cursor: null,
    },
  };
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search query from URL parameters
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Fetch search results from Convex
  const searchResults: ConvexSearchResults = useQuery(
    api.articles.searchArticles,
    createSearchParams(searchQuery)
  );

  /**
   * Handles search input changes with debounced URL updates
   */
  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    updateUrlWithDebounce(newQuery);
  };

  /**
   * Updates the browser URL with debouncing to avoid excessive navigation
   */
  const updateUrlWithDebounce = (query: string) => {
    // Clear any existing timeout to implement debouncing
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Schedule URL update after debounce delay
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newUrl = buildSearchUrl(query);
      router.replace(newUrl, { scroll: false });
    }, SEARCH_CONFIG.DEBOUNCE_DELAY_MS);
  };

  // Derive component state from search query and results
  const hasActiveQuery = Boolean(searchQuery.trim());
  const isLoading = hasActiveQuery && searchResults === undefined;
  const articles = searchResults?.page || [];

  return (
    <div className="mx-auto mt-16">
      {/* Search Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{SEARCH_CONFIG.PAGE_TITLE}</h1>
        <SearchBar
          onSearch={handleSearchChange}
          placeholder={SEARCH_CONFIG.PLACEHOLDER_TEXT}
          initialValue={searchQuery}
          isLoading={isLoading}
        />
      </header>

      {/* Search Results Section */}
      <main>
        <SearchResults
          articles={articles}
          isLoading={isLoading}
          query={searchQuery}
          totalCount={articles.length}
        />
      </main>

      {/* Navigation Footer */}
      <footer className="mt-12 text-center border-t pt-8">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {SEARCH_CONFIG.BACK_TO_HOME_TEXT}
        </Link>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-16 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {SEARCH_CONFIG.PAGE_TITLE}
            </h1>
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded-md"></div>
            </div>
          </header>
          <main>
            <div className="text-center py-12">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          </main>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
