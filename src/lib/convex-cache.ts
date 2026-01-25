import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export const getArticleBySlug = cache((slug: string) =>
  fetchQuery(api.articles.getArticleBySlug, {
    slug: decodeURIComponent(slug),
  })
);

export const getArticlesByTag = cache((tag: string) =>
  fetchQuery(api.articles.getArticlesByTag, {
    tag: decodeURIComponent(tag),
  })
);
