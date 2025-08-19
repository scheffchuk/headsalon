import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
  })
    // Basic indexes
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_tags", ["tags"]),

  articleTags: defineTable({
    articleId: v.id("articles"),
    tag: v.string(),
    articleDate: v.string(),
  })
    .index("by_tag_date", ["tag", "articleDate"])
    .index("by_article", ["articleId"]),

  // Legacy table - replaced by RAG component but kept for data cleanup
  articleEmbeddings: defineTable({
    articleId: v.id("articles"),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.float64()), // 3072-dimensional vector (text-embedding-3-large)
    metadata: v.object({
      title: v.string(),
      slug: v.string(),
      tags: v.array(v.string()),
      date: v.string(),
      chunkStart: v.number(),
      chunkEnd: v.number(),
    }),
  })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 3072,
      filterFields: ["articleId", "chunkIndex"],
    })
    .index("by_article", ["articleId"])
    .index("by_article_chunk", ["articleId", "chunkIndex"]),
});

export default schema;
