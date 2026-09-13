import { describe, expect, test } from "vitest";
import {
  articleRagFilterValues,
  preprocessChineseQuery,
  projectSearchResults,
} from "./articleRag";

const article = {
  articleId: "a1",
  title: "Title",
  slug: "slug",
  content: "body",
  tags: ["哲学", "topic"],
  date: "2025-05-03",
  creationTime: 1_700_000_000_000,
};

describe("RAG article module", () => {
  test("filterValues stay inside the module", () => {
    expect(articleRagFilterValues(article)).toEqual([
      { name: "slug", value: "slug" },
      { name: "date", value: "2025-05-03" },
      { name: "creationTime", value: "1700000000000" },
      { name: "tag", value: "哲学|topic" },
      { name: "title", value: "Title" },
    ]);
  });

  test("short Chinese queries are expanded", () => {
    expect(preprocessChineseQuery("  法  ")).toBe("关于法的内容");
    expect(preprocessChineseQuery("达尔萨斯主义")).toBe("达尔萨斯主义");
  });

  test("projectSearchResults is the SearchResult seam", () => {
    const results = projectSearchResults(
      {
        results: [
          {
            entryId: "e1",
            score: 0.9,
            content: [{ text: "chunk-a" }, { text: "chunk-b" }],
          },
          {
            entryId: "e1",
            score: 0.4,
            content: [{ text: "lower" }],
          },
        ],
        entries: [
          {
            entryId: "e1",
            key: "a1",
            filterValues: [
              { name: "title", value: "Title" },
              { name: "slug", value: "slug" },
              { name: "date", value: "2025-05-03" },
              { name: "tag", value: "哲学|topic" },
            ],
          },
        ],
      },
      10,
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      _id: "a1",
      articleId: "a1",
      title: "Title",
      slug: "slug",
      date: "2025-05-03",
      tags: ["哲学", "topic"],
      score: 0.9,
    });
    expect(results[0]?.relevantChunks).toEqual([
      { content: "chunk-a", score: 0.9 },
      { content: "chunk-b", score: 0.9 },
    ]);
  });

  test("missing results project to empty", () => {
    expect(projectSearchResults({}, 5)).toEqual([]);
  });
});
