import { type Infer, v } from "convex/values";

export const RelevantChunkValidator = v.object({
  content: v.string(),
  score: v.optional(v.number()),
});

export const SearchResultValidator = v.object({
  _id: v.string(),
  articleId: v.string(),
  title: v.string(),
  slug: v.string(),
  date: v.string(),
  tags: v.array(v.string()),
  score: v.optional(v.number()),
  relevantChunks: v.optional(v.array(RelevantChunkValidator)),
  _meta: v.optional(
    v.object({
      searchType: v.string(),
      semanticScore: v.number(),
    }),
  ),
});

export type SearchResult = Infer<typeof SearchResultValidator>;
