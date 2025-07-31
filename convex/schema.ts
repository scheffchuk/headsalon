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
    embedding: v.optional(v.array(v.float64())), // For vector search
  })
    // Basic indexes
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_tags", ["tags"])
    
    // Full-text search index for title and content
    .searchIndex("search_title_content", {
      searchField: "title",
      filterFields: ["tags", "date"],
    })
    
    // Search index for content
    .searchIndex("search_content", {
      searchField: "content", 
      filterFields: ["tags", "date"],
    })
    
    // Vector search index for semantic search (optional)
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // OpenAI embedding size
      filterFields: ["tags", "date"],
    }),
});

export default schema;