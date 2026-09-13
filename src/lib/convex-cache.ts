import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export async function getArticleByParam(param: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `article-${param}`);
  return fetchQuery(api.articles.getArticleByParam, { param });
}

export async function getArticlesByTag(tag: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `tag-${tag}`);
  return fetchQuery(api.articles.getArticlesByTag, { tag });
}

export async function getHomeArticlePage(page: number) {
  "use cache";
  cacheLife("max");
  cacheTag("articles", "home");
  return fetchQuery(api.articles.getHomeArticlePage, { page });
}

export async function getHomeArticleCount() {
  "use cache";
  cacheLife("max");
  cacheTag("articles", "home");
  return fetchQuery(api.articles.getHomeArticleCount, {});
}
