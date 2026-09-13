import type { SearchResult } from "@convex/searchResult";

export const RAG_SEARCH_LIMIT = 30;

export async function searchCommittedQuery(
  query: string,
  search: (args: {
    query: string;
    limit: number;
  }) => Promise<SearchResult[]>,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const data = await search({ query: trimmed, limit: RAG_SEARCH_LIMIT });
  return Array.isArray(data) ? data : [];
}
