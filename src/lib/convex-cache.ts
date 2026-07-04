import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export const getArticleByParam = cache((param: string) =>
  fetchQuery(api.articles.getArticleByParam, { param }),
);

export const getArticleBySlug = cache((slug: string) =>
  fetchQuery(api.articles.getArticleBySlug, { slug }),
);

export const getArticlesByTag = cache((tag: string) =>
  fetchQuery(api.articles.getArticlesByTag, { tag }),
);
