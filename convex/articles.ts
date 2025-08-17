import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel";

// Get articles for home page - paginated
export const getArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("articles")
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

// Get articles by tag - optimized with junction table
export const getArticlesByTag = query({
  args: {
    tag: v.string(),
  },
  handler: async (ctx, { tag }) => {
    if (!tag.trim()) {
      return [];
    }

    // Get article IDs for the tag, ordered by date (newest first)
    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_tag_date", (q) => q.eq("tag", tag))
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
  handler: async (ctx, { slug }) => {
    if (!slug.trim()) {
      return null;
    }

    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});


// Internal query to get article by ID - used by embedding generation
export const getArticleById = internalQuery({
  args: { id: v.id("articles") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Get articles by IDs - used by semantic search results
export const getArticlesByIds = query({
  args: {
    ids: v.array(v.id("articles")),
  },
  handler: async (ctx, { ids }) => {
    const articles = await Promise.all(
      ids.map((id) => ctx.db.get(id))
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
