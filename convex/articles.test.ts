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

  test("getArticleByParam returns null when param blank", async () => {
    const t = convexTest({ schema, modules });
    const r = await t.query(api.articles.getArticleByParam, { param: "  " });
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
      date: "2025-05-04",
      tags: ["topic"],
    });
    expect(page.page[0]._id).toBeTruthy();
  });

  test("getArticleByParam resolves by slug then by id", async () => {
    const t = convexTest({ schema, modules });
    const articleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        title: "T",
        slug: "legacy-slug",
        content: "c",
        tags: [],
        date: "2025-05-03",
      }),
    );

    const bySlug = await t.query(api.articles.getArticleByParam, {
      param: "legacy-slug",
    });
    expect(bySlug?._id).toBe(articleId);

    const byId = await t.query(api.articles.getArticleByParam, {
      param: articleId,
    });
    expect(byId?._id).toBe(articleId);
  });

  test("getArticlesByTag joins articleTags index", async () => {
    const t = convexTest({ schema, modules });
    const tag = "topic";
    const articleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        title: "T",
        slug: "slug-t",
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
      title: "T",
      tags: [tag],
    });
  });

  test("backfillArticleTags inserts missing join rows", async () => {
    const t = convexTest({ schema, modules });
    const articleId = await t.run(async (ctx) =>
      ctx.db.insert("articles", {
        title: "Hello World",
        slug: "legacy-slug",
        content: "c",
        tags: ["哲学"],
        date: "2025-05-01",
      }),
    );

    const result = await t.mutation(internal.migrations.backfillArticleTags, {});
    expect(result.tagRowsInserted).toBe(1);

    const rows = await t.query(api.articles.getArticlesByTag, { tag: "哲学" });
    expect(rows[0]?._id).toBe(articleId);
  });
});
