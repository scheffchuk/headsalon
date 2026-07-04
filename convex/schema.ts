import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  articles: defineTable({
    title: v.string(),
    /** Decorative slug (often Chinese title) — SEO tail in URL, not used for lookup. */
    slug: v.string(),
    /** ASCII lookup key — only segment that resolves the article. */
    shortId: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_shortId", ["shortId"])
    .index("by_date", ["date"])
    .index("by_tags", ["tags"]),

  articleTags: defineTable({
    articleId: v.id("articles"),
    tag: v.string(),
    articleDate: v.string(),
  })
    .index("by_tag_and_articleDate", ["tag", "articleDate"])
    .index("by_articleId", ["articleId"]),
});

export default schema;
