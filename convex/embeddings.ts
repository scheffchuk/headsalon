import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { api } from "./_generated/api";

// Database operations for embeddings (mutations and queries only)

// Store a single embedding
export const storeEmbedding = internalMutation({
  args: {
    articleId: v.id("articles"),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.number()),
    metadata: v.object({
      title: v.string(),
      slug: v.string(),
      tags: v.array(v.string()),
      date: v.string(),
      chunkStart: v.number(),
      chunkEnd: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articleEmbeddings", args);
  },
});

// Get embeddings by article ID (internal query)
export const getEmbeddingsByArticle = internalQuery({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    return await ctx.db
      .query("articleEmbeddings")
      .withIndex("by_article", (q) => q.eq("articleId", articleId))
      .collect();
  },
});

// Delete embeddings for an article (useful for regeneration)
export const deleteEmbeddingsForArticle = internalMutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    const embeddings = await ctx.db
      .query("articleEmbeddings")
      .withIndex("by_article", (q) => q.eq("articleId", articleId))
      .collect();
    
    for (const embedding of embeddings) {
      await ctx.db.delete(embedding._id);
    }
    
    return { deletedCount: embeddings.length };
  },
});

// Helper function to get all article IDs (for migration)
export const getAllArticleIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    return articles.map(article => ({ _id: article._id }));
  },
});

// Get a single embedding by ID (for vector search)
export const getEmbeddingById = internalQuery({
  args: { id: v.id("articleEmbeddings") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Wrapper mutation for scheduling embedding generation
export const scheduleEmbeddingGeneration = internalMutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    // Schedule the action to run
    await ctx.scheduler.runAfter(0, api.embeddings_actions.generateEmbeddingsForArticle, {
      articleId,
    });
  },
});