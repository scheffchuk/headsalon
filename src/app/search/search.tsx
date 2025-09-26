"use client";

import Link from "next/link";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "@/components/search";
import { SmartSearch } from "@/components/smart-search";

export default function SearchPageContent() {
  const { query, results, isLoading, executeSearch } = useSearch();

  return (
    <div className="mx-auto mt-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
        <SmartSearch
          placeholder="你感兴趣的主题..."
          searchHistory={true}
          // suggestions={suggestions}
          onSearch={executeSearch}
          urlSync={true}
        />
      </header>

      {/* Results */}
      <main>
        <SearchResults query={query} results={results} isLoading={isLoading} />
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
