import { unstable_ViewTransition as ViewTransition } from "react";

import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { TagArticles } from "./tag-articles";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const preloadedArticles = await preloadQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  return (
    <ViewTransition>
      <TagArticles preloadedArticles={preloadedArticles} tag={decodedTag} />
    </ViewTransition>
  );
}
