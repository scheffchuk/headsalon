import { RagSearchExperienceClient } from "@/components/search/rag-search-client";
import { Suspense, ViewTransition } from "react";

function SearchFallback() {
  return (
    <div className="mx-auto mt-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
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
  );
}

export default function Search() {
  return (
    <ViewTransition>
      <Suspense fallback={<SearchFallback />}>
        <RagSearchExperienceClient />
      </Suspense>
    </ViewTransition>
  );
}
