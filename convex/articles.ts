import { v } from "convex/values";
import { query, internalQuery, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel";

// Get articles for home page - paginated
export const getArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("articles"),
        title: v.string(),
        slug: v.string(),
        date: v.string(),
        tags: v.array(v.string()),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
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
  returns: v.array(
    v.object({
      _id: v.id("articles"),
      title: v.string(),
      slug: v.string(),
      excerpt: v.optional(v.string()),
      tags: v.array(v.string()),
      date: v.string(),
    })
  ),
  handler: async (ctx, { tag }) => {
    if (!tag.trim()) {
      return [];
    }

    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_tag_and_articleDate", (q) => q.eq("tag", tag))
      .order("desc")
      .collect();

    // Batch retrieve articles by ID
    const articles = await Promise.all(
      tagEntries.map((entry) => ctx.db.get(entry.articleId))
    );

    // Filter out null results and return with excerpt
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

// Get article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.optional(v.string()),
      tags: v.array(v.string()),
      date: v.string(),
    }),
    v.null()
  ),
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

// Internal query to get article by ID - used by embedding generation
export const getArticleById = internalQuery({
  args: { id: v.id("articles") },
  returns: v.union(
    v.object({
      _id: v.id("articles"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.optional(v.string()),
      tags: v.array(v.string()),
      date: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});