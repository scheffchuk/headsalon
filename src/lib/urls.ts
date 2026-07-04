/** Percent-encode decorative slug segment(s) for hrefs. */
export function encodeDecorativeSlug(slug: string): string {
  return encodeURIComponent(slug);
}

export function decodeDecorativeSlug(encoded: string): string {
  return decodeURIComponent(encoded);
}

/** Canonical article URL: /articles/{shortId}/{decorative-slug} */
export function articleUrl(article: { shortId: string; slug: string }): string {
  return `/articles/${article.shortId}/${encodeDecorativeSlug(article.slug)}`;
}

/** True when optional catch-all slug tail matches the article decorative slug. */
export function articleDecorativeMatches(
  article: { slug: string },
  slugSegments: string[] | undefined,
): boolean {
  if (!slugSegments?.length) {
    return false;
  }
  const pathDecorative = decodeDecorativeSlug(slugSegments.join("/"));
  return pathDecorative === article.slug;
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
