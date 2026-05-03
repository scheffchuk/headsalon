import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { getArticleBySlug } from "@/lib/convex-cache";
import { Article } from "./article";
import { ArticleWithScrollProgress } from "./article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

export async function generateMetadata(
  { params }: PageProps<'/articles/[slug]'>,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Fetch article for metadata generation
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "文章未找到",
      description: "所请求的文章不存在",
    };
  }

  const description =
    article.excerpt ||
    article.content?.slice(0, 160) + "..." ||
    "HeadSalon 博客文章";

  return {
    title: {
      absolute: article.title,
    },
    description,
    keywords: article.tags?.join(", "),
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      siteName: "HeadSalon",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default function ArticlePage({ params }: PageProps<'/articles/[slug]'>) {
  return (
    <ViewTransition>
      <Suspense fallback={<ArticleSkeleton />}>
      {
        params.then(({slug}) => (
        <ArticleContent slug={slug} />))
      }
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  const article = await getArticleBySlug(slug);

  return (
    <ArticleWithScrollProgress>
      <Article article={article} />
    </ArticleWithScrollProgress>
  );
}
