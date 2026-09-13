import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound, permanentRedirect } from "next/navigation";
import { lookupArticle } from "@/lib/article-lookup";
import { articleUrl } from "@/lib/urls";
import { Article } from "./article";
import { ArticleWithScrollProgress } from "./article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

async function getArticleMetadata(id: string): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `article-${id}`);

  const result = await lookupArticle(id);

  if (result === null) {
    return {
      title: "文章未找到",
      description: "所请求的文章不存在",
    };
  }

  if (result.kind === "redirect") {
    return {};
  }

  const { article } = result;
  const description =
    article.excerpt ||
    article.content?.slice(0, 160) + "..." ||
    "HeadSalon 博客文章";

  const canonical = articleUrl(article);

  return {
    title: {
      absolute: article.title,
    },
    description,
    keywords: article.tags?.join(", "),
    alternates: {
      canonical,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      siteName: "HeadSalon",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[id]">): Promise<Metadata> {
  const { id } = await params;
  return getArticleMetadata(id);
}

export default function ArticlePage({ params }: PageProps<"/articles/[id]">) {
  return (
    <ViewTransition>
      <Suspense fallback={<ArticleSkeleton />}>
        {params.then(({ id }) => (
          <ArticleContent id={id} />
        ))}
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ id }: { id: string }) {
  const result = await lookupArticle(id);

  if (result === null) {
    notFound();
  }

  if (result.kind === "redirect") {
    permanentRedirect(result.href);
  }

  return (
    <ArticleWithScrollProgress>
      <Article article={result.article} />
    </ArticleWithScrollProgress>
  );
}
