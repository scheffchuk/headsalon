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
    }),

  articleTags: defineTable({
    articleId: v.id("articles"),
    tag: v.string(),
    articleDate: v.string(),
  })
    .index("by_tag_date", ["tag", "articleDate"])
    .index("by_article", ["articleId"]),
});

export default schema;
