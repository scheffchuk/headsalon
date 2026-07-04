import { describe, expect, test } from "vitest";
import { slugifyForUrlKey, tagKeyFromDisplayName } from "./urlKey";

describe("slugifyForUrlKey", () => {
  test("transliterates Chinese to pinyin segments", () => {
    const key = slugifyForUrlKey("食物与人类6向下开拓");
    expect(key).toMatch(/^[a-z0-9-]+$/);
    expect(key).toContain("6");
  });

  test("preserves ASCII words", () => {
    expect(slugifyForUrlKey("Hello World")).toBe("hello-world");
  });

  test("returns item for blank input", () => {
    expect(slugifyForUrlKey("   ")).toBe("item");
  });
});

describe("tagKeyFromDisplayName", () => {
  test("is deterministic", () => {
    const a = tagKeyFromDisplayName("哲学");
    const b = tagKeyFromDisplayName("哲学");
    expect(a).toBe(b);
  });
});
