import { Suspense, ViewTransition } from "react";
import { fetchAction } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { RagSearchExperience } from "@/components/search/rag-search-experience";
import { SearchResults } from "@/components/search/search-results";
import { SearchStates } from "@/components/search/search-states";

async function SearchHits({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  const results = query
    ? await fetchAction(api.rag_search.searchArticlesRAG, {
        query,
        limit: 30,
      })
    : [];

  return (
    <SearchResults query={query} results={results} isLoading={false} />
  );
}

export default function Search({ searchParams }: PageProps<"/search">) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">搜索文章</h1>
          <RagSearchExperience />
        </header>
        <main>
          <Suspense fallback={<SearchStates state="loading" />}>
            <SearchHits searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </ViewTransition>
  );
}
