import { describe, expect, test } from "vitest";
import { generateShortId } from "./shortId";

describe("generateShortId", () => {
  test("returns 8 URL-safe characters", () => {
    const id = generateShortId();
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });

  test("generates unique values", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateShortId()));
    expect(ids.size).toBe(20);
  });
});
