import { describe, expect, test } from "vitest";
import type { Doc } from "@convex/_generated/dataModel";
import { classifyArticleLookup } from "./article-lookup";

const article = {
  _id: "j57abc123def4567890123456789012",
  _creationTime: 1,
  title: "T",
  slug: "legacy-slug",
  content: "body",
  tags: [],
  date: "2025-05-03",
} as unknown as Doc<"articles">;

describe("classifyArticleLookup", () => {
  test("canonical id is an article", () => {
    expect(classifyArticleLookup(article._id, article)).toEqual({
      kind: "article",
      article,
    });
  });

  test("legacy slug is a redirect to the id URL", () => {
    expect(classifyArticleLookup("legacy-slug", article)).toEqual({
      kind: "redirect",
      href: `/articles/${article._id}`,
    });
  });

  test("miss is null", () => {
    expect(classifyArticleLookup("missing", null)).toBeNull();
  });
});
