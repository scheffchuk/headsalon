import { tagKeyFromDisplayName } from "@/lib/urlKey";

export function articleUrl(article: { urlKey: string }): string {
  return `/articles/${article.urlKey}`;
}

export function tagUrl(tag: string): string {
  return `/tag/${tagKeyFromDisplayName(tag)}`;
}

export function tagUrlFromKey(tagKey: string): string {
  return `/tag/${tagKey}`;
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
