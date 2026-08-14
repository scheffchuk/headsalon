import type { ArticlePreview } from "@convex/searchResult";

/** Canonical article URL: /articles/{id} */
export function articleUrl(article: Pick<ArticlePreview, "_id">): string {
  return `/articles/${article._id}`;
}

export function tagUrl(tag: string): string {
  return `/tag/${encodeURIComponent(tag)}`;
}
