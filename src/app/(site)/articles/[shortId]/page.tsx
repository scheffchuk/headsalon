import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getArticleByShortId,
  getArticleBySlug,
} from "@/lib/convex-cache";
import { articleUrl } from "@/lib/urls";
import { Article } from "./article";
import { ArticleWithScrollProgress } from "./article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

async function resolveArticle(param: string) {
  const byShortId = await getArticleByShortId(param);
  if (byShortId) {
    return { article: byShortId, legacyRedirect: null as string | null };
  }

  const bySlug = await getArticleBySlug(param);
  if (bySlug) {
    return {
      article: bySlug,
      legacyRedirect: articleUrl({ shortId: bySlug.shortId }),
    };
  }

  return { article: null, legacyRedirect: null as string | null };
}

export async function generateMetadata(
  { params }: PageProps<"/articles/[shortId]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { shortId } = await params;
  const { article, legacyRedirect } = await resolveArticle(shortId);

  if (legacyRedirect) {
    return {};
  }

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

export default function ArticlePage({
  params,
}: PageProps<"/articles/[shortId]">) {
  return (
    <ViewTransition>
      <Suspense fallback={<ArticleSkeleton />}>
        {params.then(({ shortId }) => (
          <ArticleContent shortId={shortId} />
        ))}
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ shortId }: { shortId: string }) {
  const { article, legacyRedirect } = await resolveArticle(shortId);

  if (legacyRedirect) {
    permanentRedirect(legacyRedirect);
  }

  if (!article) {
    notFound();
  }

  return (
    <ArticleWithScrollProgress>
      <Article article={article} />
    </ArticleWithScrollProgress>
  );
}
