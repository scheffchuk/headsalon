import { Suspense } from "react";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { api } from "../../../../convex/_generated/api";
import { Article } from "./article";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: ArticlePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Fetch article for metadata generation
  const article = await fetchQuery(api.articles.getArticleBySlug, {
    slug: decodeURIComponent(slug),
  });

  if (!article) {
    return {
      title: "文章未找到 - HeadSalon",
      description: "所请求的文章不存在",
    };
  }

  const title = `${article.title} - HeadSalon`;
  const description =
    article.excerpt ||
    article.content?.slice(0, 160) + "..." ||
    "HeadSalon 博客文章";

  return {
    title,
    description,
    keywords: article.tags?.join(", "),
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
    },
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <ViewTransition>
      <Suspense
        fallback={
          <div className="mx-auto py-8">
            <div className="text-center py-16">
              <p className="text-gray-600">Loading article...</p>
            </div>
          </div>
        }
      >
        <ArticleContent params={params} />
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ params }: ArticlePageProps) {
  const { slug } = await params;
  const preloadedArticle = await preloadQuery(api.articles.getArticleBySlug, {
    slug: decodeURIComponent(slug),
  });

  return <Article preloadedArticle={preloadedArticle} />;
}
