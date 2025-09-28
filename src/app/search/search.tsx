"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useAction } from "convex/react";
import { useDebouncer } from "@tanstack/react-pacer";
import { api } from "../../../convex/_generated/api";
import { SearchResults } from "@/components/search";
import { SearchStates } from "@/components/search";
import { SmartSearch } from "@/components/smart-search";
import type { SearchResult } from "@/types/search";

export default function SearchPageContent() {
  const searchAction = useAction(api.rag_search.searchArticlesRAG);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastQueriedRef = useRef<string>("");

  const searchDebouncer = useDebouncer(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (trimmed === "") {
        setResults(null);
        return;
      }

      let cancelled = false;
      lastQueriedRef.current = trimmed;

      startTransition(() => {
        (async () => {
          try {
            const data = await searchAction({ query: trimmed, limit: 30 });
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
    },
    { wait: 300 }
  );

  useEffect(() => {
    searchDebouncer.maybeExecute(query);
  }, [query, searchDebouncer]);

  return (
    <div className="mx-auto mt-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <SmartSearch
          placeholder="你感兴趣的主题..."
          debounceMs={300}
          searchHistory={true}
          // suggestions={suggestions}
          onSearch={setQuery}
          urlSync={false}
        />
      </header>

      {/* Results */}
      <main>
        {results === null ? (
          <SearchStates state="empty" />
        ) : isPending ? (
          <SearchStates state="loading" />
        ) : results.length === 0 ? (
          <SearchStates state="no-results" query={query} />
        ) : (
          <SearchResults
            query={query}
            results={results}
            isLoading={isPending}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center border-t pt-8">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          ← 返回首页
        </Link>
      </footer>
    </div>
  );
}
