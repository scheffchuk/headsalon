/** Canonical article URL: /articles/{id} */
export function articleUrl(article: { _id: string }): string {
  return `/articles/${article._id}`;
}

export function tagUrl(tag: string): string {
  return `/tag/${encodeURIComponent(tag)}`;
}
