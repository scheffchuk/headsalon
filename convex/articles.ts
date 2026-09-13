import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { articleAggregate } from "./lib/articleAggregate";
import { internalMutation } from "./lib/functions";
import { HOME_PAGE_SIZE } from "./lib/homePageSize";

const articleListItemValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  date: v.string(),
  tags: v.array(v.string()),
});

const fullArticleValidator = v.object({
  _id: v.id("articles"),
  _creationTime: v.number(),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),
  tags: v.array(v.string()),
  date: v.string(),
});

export const getHomeArticleCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return await articleAggregate.count(ctx);
  },
});

export const getHomeArticlePage = query({
  args: {
    page: v.number(),
  },
  returns: v.object({
    items: v.array(articleListItemValidator),
    totalCount: v.number(),
    totalPages: v.number(),
  }),
  handler: async (ctx, { page }) => {
    const totalCount = await articleAggregate.count(ctx);
    const totalPages = Math.ceil(totalCount / HOME_PAGE_SIZE);
    if (totalCount === 0 || page < 1 || page > totalPages) {
      return { items: [], totalCount, totalPages };
    }

    const offset = (page - 1) * HOME_PAGE_SIZE;
    const start = await articleAggregate.at(ctx, -(offset + 1));
    const { page: aggregatePage } = await articleAggregate.paginate(ctx, {
      bounds: {
        upper: { key: start.key, id: start.id, inclusive: true },
      },
      order: "desc",
      pageSize: HOME_PAGE_SIZE,
    });

    const docs = await Promise.all(
      aggregatePage.map((item) => ctx.db.get("articles", item.id)),
    );

    return {
      items: docs
        .filter((article): article is Doc<"articles"> => article !== null)
        .map((article) => ({
          _id: article._id,
          title: article.title,
          slug: article.slug,
          date: article.date,
          tags: article.tags,
        })),
      totalCount,
      totalPages,
    };
  },
});

export const backfillArticleAggregate = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
  },
  returns: v.object({
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    inserted: v.number(),
  }),
  handler: async (ctx, { cursor, numItems }) => {
    const pageSize = numItems ?? 64;
    const page = await ctx.db.query("articles").paginate({
      numItems: pageSize,
      cursor,
    });

    for (const article of page.page) {
      await articleAggregate.insertIfDoesNotExist(ctx, article);
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.articles.backfillArticleAggregate, {
        cursor: page.continueCursor,
        numItems: pageSize,
      });
    }

    return {
      isDone: page.isDone,
      continueCursor: page.continueCursor,
      inserted: page.page.length,
    };
  },
});

export const getArticlesByTag = query({
  args: {
    tag: v.string(),
  },
  returns: v.array(articleListItemValidator),
  handler: async (ctx, { tag }) => {
    if (!tag.trim()) {
      return [];
    }

    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_tag_and_articleDate", (q) => q.eq("tag", tag))
      .order("desc")
      .collect();

    const articles = await Promise.all(
      tagEntries.map((entry) => ctx.db.get("articles", entry.articleId)),
    );

    return articles
      .filter((article): article is Doc<"articles"> => article !== null)
      .map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        tags: article.tags,
        date: article.date,
      }));
  },
});

/** Route param may be a Convex id or a legacy slug — try both. */
export const getArticleByParam = query({
  args: { param: v.string() },
  returns: v.union(fullArticleValidator, v.null()),
  handler: async (ctx, { param }) => {
    const trimmed = param.trim();
    if (!trimmed) {
      return null;
    }

    if (looksLikeConvexId(trimmed)) {
      const byId = await ctx.db.get("articles", trimmed as Id<"articles">);
      if (byId) {
        return byId;
      }
    }

    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", trimmed))
      .unique();
  },
});

function looksLikeConvexId(value: string): boolean {
  return (
    value.length >= 20 &&
    /^[a-z0-9]+$/i.test(value) &&
    !/[\u4e00-\u9fff]/.test(value)
  );
}
