import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel";

const articleListItemValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  date: v.string(),
  tags: v.array(v.string()),
});

const articleByTagItemValidator = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  excerpt: v.optional(v.string()),
  tags: v.array(v.string()),
  date: v.string(),
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

export const getArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(articleListItemValidator),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(
      v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null()),
    ),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("articles")
      .withIndex("by_date")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        date: article.date,
        tags: article.tags,
      })),
    };
  },
});

export const getArticlesByTag = query({
  args: {
    tag: v.string(),
  },
  returns: v.array(articleByTagItemValidator),
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
        excerpt: article.excerpt,
        tags: article.tags,
        date: article.date,
      }));
  },
});

export const getArticleById = query({
  args: { id: v.id("articles") },
  returns: v.union(fullArticleValidator, v.null()),
  handler: async (ctx, { id }) => {
    return await ctx.db.get("articles", id);
  },
});

/** Legacy lookup by decorative Unicode slug (redirect resolution). */
export const getArticleBySlug = query({
  args: { slug: v.string() },
  returns: v.union(fullArticleValidator, v.null()),
  handler: async (ctx, { slug }) => {
    if (!slug.trim()) {
      return null;
    }

    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
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
