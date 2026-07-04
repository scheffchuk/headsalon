import { describe, expect, test } from "vitest";
import { articleUrl, tagUrl } from "./urls";

describe("articleUrl", () => {
  test("uses shortId only", () => {
    expect(articleUrl({ shortId: "a3f9k2X1" })).toBe("/articles/a3f9k2X1");
  });
});

describe("tagUrl", () => {
  test("encodes Chinese tag names", () => {
    expect(tagUrl("哲学")).toBe("/tag/%E5%93%B2%E5%AD%A6");
  });
});
