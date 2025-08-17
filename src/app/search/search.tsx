"use client";

import Link from "next/link";
import { useSearch } from "@/hooks/use-search";
import { SearchInput, SearchResults } from "@/components/search";

export default function SearchPageContent() {
  const {
    query,
    results,
    isLoading,
    lastSearchedQuery,
    hasSearched,
    setQuery,
    handleClear,
    handleArticleClick,
  } = useSearch();

  return (
    <div className="mx-auto mt-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <SearchInput
          query={query}
          onChange={setQuery}
          onClear={handleClear}
          isLoading={isLoading}
        />
      </header>

      {/* Results */}
      <main>
        <SearchResults
          query={query}
          results={results}
          isLoading={isLoading}
          lastSearchedQuery={lastSearchedQuery}
          hasSearched={hasSearched}
          onArticleClick={handleArticleClick}
        />
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

