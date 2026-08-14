import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export async function getArticleByParam(param: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `article-${param}`);
  return fetchQuery(api.articles.getArticleByParam, { param });
}

export async function getArticleBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `article-slug-${slug}`);
  return fetchQuery(api.articles.getArticleBySlug, { slug });
}

export async function getArticlesByTag(tag: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `tag-${tag}`);
  return fetchQuery(api.articles.getArticlesByTag, { tag });
}
