/** Canonical article URL: /articles/{shortId} */
export function articleUrl(article: { shortId: string }): string {
  return `/articles/${article.shortId}`;
}

export function tagUrl(tag: string): string {
  return `/tag/${encodeURIComponent(tag)}`;
}
