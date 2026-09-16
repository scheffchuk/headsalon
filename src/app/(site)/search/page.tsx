import { Suspense, ViewTransition } from "react";
import { fetchAction } from "convex/nextjs";
import { cookies } from "next/headers";
import type { SessionId } from "convex-helpers/server/sessions";
import { api } from "../../../../convex/_generated/api";
import { RagSearchExperience } from "@/components/search/rag-search-experience";
import { SearchResults } from "@/components/search/search-results";
import { SearchStates } from "@/components/search/search-states";
import { getRateLimitRetryAfter, RATE_LIMIT_SESSION_COOKIE } from "@/lib/rate-limit";

async function SearchPageContent({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  const sessionId = query
    ? (await cookies()).get(RATE_LIMIT_SESSION_COOKIE)?.value
    : undefined;
  const needsSessionCookie = Boolean(query && !sessionId);

  const search = await (async () => {
    if (!query || !sessionId) {
      return { results: [], retryAfter: null };
    }

    try {
      return {
        results: await fetchAction(api.rag_search.searchArticlesRAG, {
          query,
          limit: 30,
          sessionId: sessionId as SessionId,
        }),
        retryAfter: null,
      };
    } catch (error) {
      const retryAfter = getRateLimitRetryAfter(error);
      if (retryAfter === null) throw error;
      return { results: [], retryAfter };
    }
  })();
  return (
    <>
      <header className="mb-8">
        <RagSearchExperience
          key={search.retryAfter ?? "search"}
          initialRetryAfter={search.retryAfter}
          needsSessionCookie={needsSessionCookie}
        />
      </header>
      <main>
        <SearchResults
          query={query}
          results={search.results}
          isLoading={needsSessionCookie}
        />
      </main>
    </>
  );
}

export default function Search({ searchParams }: PageProps<"/search">) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16">
        <h1 className="mb-4 text-3xl font-bold">搜索文章</h1>
        <Suspense fallback={<SearchStates state="loading" />}>
          <SearchPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </ViewTransition>
  );
}
