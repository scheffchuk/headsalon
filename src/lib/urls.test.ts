import { describe, expect, test } from "vitest";
import { articleUrl, homePageHref, tagUrl } from "./urls";

describe("articleUrl", () => {
  test("uses Convex document id", () => {
    expect(articleUrl({ _id: "j57abc123def4567890123456789012" })).toBe(
      "/articles/j57abc123def4567890123456789012",
    );
  });
});

describe("tagUrl", () => {
  test("encodes Chinese tag names", () => {
    expect(tagUrl("哲学")).toBe("/tag/%E5%93%B2%E5%AD%A6");
  });
});

describe("homePageHref", () => {
  test("page 1 is the chronological index root", () => {
    expect(homePageHref(1)).toBe("/");
  });

  test("page N is /page/N", () => {
    expect(homePageHref(2)).toBe("/page/2");
    expect(homePageHref(12)).toBe("/page/12");
  });
});
