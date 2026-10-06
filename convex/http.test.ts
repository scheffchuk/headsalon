/// <reference types="vite/client" />

import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "./schema";

const modules = import.meta.glob(
  [
    "./schema.ts",
    "./http.ts",
    "./articleRag.ts",
    "./rag_search.ts",
    "./searchResult.ts",
    "./rateLimits.ts",
    "./_generated/**/*",
  ],
  { eager: false },
);

function setup() {
  const t = convexTest({ schema, modules });
  registerRateLimiter(t);
  return t;
}

describe("discuss chat", () => {
  test("returns 503 while chat is disabled", async () => {
    const t = setup();

    const response = await t.fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HeadSalon-Session": "browser-a",
      },
      body: JSON.stringify({ messages: [] }),
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ kind: "Disabled" });
  });
});
