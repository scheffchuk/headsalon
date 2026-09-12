/// <reference types="vite/client" />
import { register as registerArticleAggregate } from "@convex-dev/aggregate/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(
  ["./schema.ts", "./articles.ts", "./migrations.ts", "./lib/**/*.ts", "./_generated/**/*"],
  {
    eager: false,
  },
);

function setup() {
  const t = convexTest({ schema, modules });
  registerArticleAggregate(t, "articleAggregate");
  return t;
}

function isoDateFromIndex(index: number): string {
  const date = new Date(Date.UTC(2024, 0, 1 + index));
  return date.toISOString().slice(0, 10);
}

async function seedArticles(
  t: ReturnType<typeof setup>,
  count: number,
): Promise<void> {
  await t.run(async (ctx) => {
    for (let i = 0; i < count; i++) {
      await ctx.db.insert("articles", {
        title: `Article ${i}`,
        slug: `article-${i}`,
        content: `secret-body-${i}`,
        tags: ["topic"],
        date: isoDateFromIndex(i),
      });
    }
  });
  await t.mutation(internal.articles.backfillArticleAggregate, {
    cursor: null,
  });
}

describe("articles queries", () => {
  test("getArticleBySlug returns null when slug whitespace only", async () => {
    const t = setup();
    const r = await t.query(api.articles.getArticleBySlug, { slug: "   " });
    expect(r).toBeNull();
  });

  test("getArticleByParam returns null when param blank", async () => {
    const t = setup();
    const r = await t.query(api.articles.getArticleByParam, { param: "  " });
    expect(r).toBeNull();
  });

  test("getArticlesByTag returns empty when tag blank", async () => {
    const t = setup();
    const r = await t.query(api.articles.getArticlesByTag, { tag: "  " });
    expect(r).toEqual([]);
  });

  test("getArticles pagination returns list projection shape", async () => {
    const t = setup();
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
    const t = setup();
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
    const t = setup();
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
    const t = setup();
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

  test("getHomeArticlePage empty corpus returns no items", async () => {
    const t = setup();
    const result = await t.query(api.articles.getHomeArticlePage, { page: 1 });
    expect(result).toEqual({ items: [], totalCount: 0, totalPages: 0 });
  });

  test("getHomeArticlePage returns list projection without content", async () => {
    const t = setup();
    await seedArticles(t, 1);

    const result = await t.query(api.articles.getHomeArticlePage, { page: 1 });

    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      title: "Article 0",
      slug: "article-0",
      date: "2024-01-01",
      tags: ["topic"],
    });
    expect(result.items[0]?._id).toBeTruthy();
    expect(result.items[0]).not.toHaveProperty("content");
  });

  test("getHomeArticlePage is date-desc and last page has the remainder", async () => {
    const t = setup();
    await seedArticles(t, 31);

    const page1 = await t.query(api.articles.getHomeArticlePage, { page: 1 });
    const page2 = await t.query(api.articles.getHomeArticlePage, { page: 2 });

    expect(page1.totalCount).toBe(31);
    expect(page1.totalPages).toBe(2);
    expect(page1.items).toHaveLength(30);
    expect(page1.items[0]?.date).toBe("2024-01-31");
    expect(page1.items[29]?.date).toBe("2024-01-02");
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.date).toBe("2024-01-01");
    expect(page2.items[0]?.title).toBe("Article 0");
  });

  test("getHomeArticlePage out-of-range page returns empty items", async () => {
    const t = setup();
    await seedArticles(t, 1);

    const result = await t.query(api.articles.getHomeArticlePage, { page: 2 });
    expect(result).toEqual({
      items: [],
      totalCount: 1,
      totalPages: 1,
    });
  });

  test("getHomeArticleCount is count only", async () => {
    const t = setup();
    expect(await t.query(api.articles.getHomeArticleCount, {})).toBe(0);
    await seedArticles(t, 31);
    expect(await t.query(api.articles.getHomeArticleCount, {})).toBe(31);
  });
});
