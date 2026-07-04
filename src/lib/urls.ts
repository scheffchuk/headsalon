/** Canonical article URL: /articles/{shortId} */
export function articleUrl(article: { shortId: string }): string {
  return `/articles/${article.shortId}`;
}

export function tagUrl(tag: string): string {
  return `/tag/${encodeURIComponent(tag)}`;
}

export function searchUrl(query: string, tag?: string | null): string {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  if (tag?.trim()) {
    params.set("tag", tag.trim());
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}
