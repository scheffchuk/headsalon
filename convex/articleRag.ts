export const ARTICLE_RAG_NAMESPACE = "articles";

export const ARTICLE_RAG_FILTER_NAMES = [
  "slug",
  "date",
  "creationTime",
  "tag",
  "title",
] as const;

export type ArticleRagFilters = Record<
  (typeof ARTICLE_RAG_FILTER_NAMES)[number],
  string
>;
