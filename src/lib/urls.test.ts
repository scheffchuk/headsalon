import { describe, expect, test } from "vitest";
import {
  articleDecorativeMatches,
  articleUrl,
  decodeDecorativeSlug,
  encodeDecorativeSlug,
  tagUrl,
} from "./urls";

describe("articleUrl", () => {
  test("builds shortId + encoded decorative slug", () => {
    expect(
      articleUrl({ shortId: "a3f9k2X1", slug: "食物与人类6向下开拓" }),
    ).toBe("/articles/a3f9k2X1/%E9%A3%9F%E7%89%A9%E4%B8%8E%E4%BA%BA%E7%B1%BB6%E5%90%91%E4%B8%8B%E5%BC%80%E6%8B%93");
  });
});

describe("articleDecorativeMatches", () => {
  test("matches encoded decorative segment", () => {
    const slug = "食物与人类6向下开拓";
    const encoded = encodeDecorativeSlug(slug);
    expect(
      articleDecorativeMatches({ slug }, [encoded]),
    ).toBe(true);
    expect(decodeDecorativeSlug(encoded)).toBe(slug);
  });

  test("false when tail missing or wrong", () => {
    expect(articleDecorativeMatches({ slug: "foo" }, undefined)).toBe(false);
    expect(articleDecorativeMatches({ slug: "foo" }, ["bar"])).toBe(false);
  });
});

describe("tagUrl", () => {
  test("encodes Chinese tag names", () => {
    expect(tagUrl("哲学")).toBe("/tag/%E5%93%B2%E5%AD%A6");
  });
});
