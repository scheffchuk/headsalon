import { describe, expect, test, vi } from "vitest";
import type { SearchResult } from "@convex/searchResult";
import {
  RAG_SEARCH_LIMIT,
  searchCommittedQuery,
} from "./committed-rag-search";

const hit: SearchResult = {
  _id: "a1",
  articleId: "a1",
  title: "T",
  slug: "t",
  date: "2025-05-03",
  tags: ["topic"],
};

describe("searchCommittedQuery", () => {
  test("blank query returns empty without calling search", async () => {
    const search = vi.fn();
    await expect(searchCommittedQuery("   ", search)).resolves.toEqual([]);
    expect(search).not.toHaveBeenCalled();
  });

  test("committed query in, SearchResult[] out", async () => {
    const search = vi.fn().mockResolvedValue([hit]);
    await expect(searchCommittedQuery("  达尔萨斯  ", search)).resolves.toEqual([
      hit,
    ]);
    expect(search).toHaveBeenCalledWith({
      query: "达尔萨斯",
      limit: RAG_SEARCH_LIMIT,
    });
  });

  test("non-array search payload is empty", async () => {
    const search = vi.fn().mockResolvedValue(null);
    await expect(
      searchCommittedQuery("q", search as never),
    ).resolves.toEqual([]);
  });
});
