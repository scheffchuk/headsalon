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

// Create new article and add to RAG system
export const createArticle = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    // Create the article in the database
    const articleId = await ctx.db.insert("articles", args);

    // Create articleTags entries for efficient tag filtering
    for (const tag of args.tags) {
      await ctx.db.insert("articleTags", {
        articleId,
        tag,
        articleDate: args.date,
      });
    }

    // TODO: Add article to RAG system (commented out due to type issues)
    console.log(
      `Article created: ${args.title} (${articleId}) - RAG integration will be handled by migration`
    );

    return articleId;
  },
});

// Update existing article and sync with RAG system
export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    date: v.optional(v.string()),
  },
  returns: v.id("articles"),
  handler: async (ctx, { id, ...updates }) => {
    // Get current article
    const currentArticle = await ctx.db.get(id);
    if (!currentArticle) {
      throw new Error("Article not found");
    }

    // Update the article
    await ctx.db.patch(id, updates);

    // If tags were updated, update articleTags table
    if (updates.tags) {
      // Remove old tag entries
      const oldTagEntries = await ctx.db
        .query("articleTags")
        .withIndex("by_articleId", (q) => q.eq("articleId", id))
        .collect();

      for (const entry of oldTagEntries) {
        await ctx.db.delete(entry._id);
      }

      // Add new tag entries
      const date = updates.date || currentArticle.date;
      for (const tag of updates.tags) {
        await ctx.db.insert("articleTags", {
          articleId: id,
          tag,
          articleDate: date,
        });
      }
    }

    // Get updated article for RAG sync
    const updatedArticle = await ctx.db.get(id);
    if (!updatedArticle) {
      throw new Error("Failed to get updated article");
    }

    // TODO: Update article in RAG system (commented out due to type issues)
    console.log(
      `Article updated: ${updatedArticle.title} (${id}) - RAG sync will be handled by migration`
    );

    return id;
  },
});

// Delete article and remove from RAG system
export const deleteArticle = mutation({
  args: {
    id: v.id("articles"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, { id }) => {
    // Remove from articleTags table
    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_articleId", (q) => q.eq("articleId", id))
      .collect();

    for (const entry of tagEntries) {
      await ctx.db.delete(entry._id);
    }

    // TODO: Remove from RAG system (commented out due to type issues)
    console.log(
      `Article deleted: ${id} - RAG removal will be handled by migration`
    );

    // Delete the article
    await ctx.db.delete(id);

    return { success: true };
  },
});
