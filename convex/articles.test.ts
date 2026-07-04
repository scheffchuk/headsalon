/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob<{ default?: unknown }>(
  ["./schema.ts", "./articles.ts", "./migrations.ts", "./lib/**/*.ts", "./_generated/**/*"],
  {
    eager: false,
  },
);

describe("articles queries", () => {
  test("getArticleBySlug returns null when slug whitespace only", async () => {
    const t = convexTest({ schema, modules });
    const r = await t.query(api.articles.getArticleBySlug, { slug: "   " });
    expect(r).toBeNull();
  });

  test("getArticleByShortId returns null when shortId whitespace only", async () => {
    const t = convexTest({ schema, modules });
    const r = await t.query(api.articles.getArticleByShortId, { shortId: "   " });
    expect(r).toBeNull();
  });

  test("getArticlesByTag returns empty when tag blank", async () => {
    const t = convexTest({ schema, modules });
    const r = await t.query(api.articles.getArticlesByTag, { tag: "  " });
    expect(r).toEqual([]);
  });

  test("getArticles pagination returns list projection shape", async () => {
    const t = convexTest({ schema, modules });
    await t.run(async (ctx) => {
      await ctx.db.insert("articles", {
        title: "Hello",
        slug: "hello",
        shortId: "abc12345",
        content: "body",
        tags: ["topic"],
        date: "2025-05-04",
      });
    });

    const page = await t.query(api.articles.getArticles, {
      paginationOpts: { numItems: 10, cursor: null },
    });

    expect(page.page).toHaveLength(1);
    expect(page.page[0]).toMatchObject({
      title: "Hello",
      slug: "hello",
      shortId: "abc12345",
      date: "2025-05-04",
      tags: ["topic"],
    });
    expect(page.page[0]._id).toBeTruthy();
  });

  test("getArticlesByTag joins articleTags index", async () => {
    const t = convexTest({ schema, modules });
    const tag = "topic";
    const articleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        title: "T",
        slug: "slug-t",
        shortId: "short001",
        content: "c",
        excerpt: "e",
        tags: [tag],
        date: "2025-05-03",
      }),
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("articleTags", {
        articleId,
        tag,
        articleDate: "2025-05-03",
      });
    });

    const rows = await t.query(api.articles.getArticlesByTag, { tag });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      slug: "slug-t",
      shortId: "short001",
      title: "T",
      tags: [tag],
    });
  });

  test("backfillShortIds assigns shortId", async () => {
    const t = convexTest({ schema, modules });
    const articleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        title: "Hello World",
        slug: "legacy-slug",
        shortId: "",
        content: "c",
        tags: ["哲学"],
        date: "2025-05-01",
      }),
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("articleTags", {
        articleId,
        tag: "哲学",
        articleDate: "2025-05-01",
      });
    });

    const result = await t.mutation(internal.migrations.backfillShortIds, {});
    expect(result.articlesUpdated).toBe(1);

    const article = await t.run(async (ctx) => ctx.db.get("articles", articleId));
    expect(article?.shortId).toMatch(/^[a-zA-Z0-9]{8}$/);
    expect(article?.slug).toBe("legacy-slug");
  });
});
