import { preloadQuery } from "convex/nextjs";
import { unstable_ViewTransition as ViewTransition } from "react";
import { api } from "../../../../convex/_generated/api";
import { Article } from "./article";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const preloadedArticle = await preloadQuery(api.articles.getArticleBySlug, {
    slug: decodeURIComponent(slug),
  });

  return (
    <ViewTransition>
      <Article preloadedArticle={preloadedArticle} />
    </ViewTransition>
  );
}
