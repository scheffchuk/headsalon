import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export const getArticleByUrlKey = cache((urlKey: string) =>
  fetchQuery(api.articles.getArticleByUrlKey, { urlKey }),
);

export const getArticleBySlug = cache((slug: string) =>
  fetchQuery(api.articles.getArticleBySlug, { slug }),
);

export const getArticlesByTagKey = cache((tagKey: string) =>
  fetchQuery(api.articles.getArticlesByTagKey, { tagKey }),
);

export const getArticlesByTag = cache((tag: string) =>
  fetchQuery(api.articles.getArticlesByTag, { tag }),
);
