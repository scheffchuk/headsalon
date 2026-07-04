import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getArticleByShortId,
  getArticleBySlug,
} from "@/lib/convex-cache";
import {
  articleDecorativeMatches,
  articleUrl,
} from "@/lib/urls";
import { Article } from "../article";
import { ArticleWithScrollProgress } from "../article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

type ArticleRouteParams = {
  shortId: string;
  slug?: string[];
};

async function resolveArticle(shortId: string) {
  const byShortId = await getArticleByShortId(shortId);
  if (byShortId) {
    return { article: byShortId, legacyRedirect: null as string | null };
  }

  const bySlug = await getArticleBySlug(shortId);
  if (bySlug) {
    return {
      article: bySlug,
      legacyRedirect: articleUrl({
        shortId: bySlug.shortId,
        slug: bySlug.slug,
      }),
    };
  }

  return { article: null, legacyRedirect: null as string | null };
}

function canonicalRedirect(
  article: { shortId: string; slug: string },
  slugSegments: string[] | undefined,
): string | null {
  if (!articleDecorativeMatches(article, slugSegments)) {
    return articleUrl(article);
  }
  return null;
}

export async function generateMetadata(
  { params }: PageProps<"/articles/[shortId]/[[...slug]]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { shortId, slug } = await params;
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

  if (canonicalRedirect(article, slug)) {
    return {};
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
}: PageProps<"/articles/[shortId]/[[...slug]]">) {
  return (
    <ViewTransition>
      <Suspense fallback={<ArticleSkeleton />}>
        {params.then(({ shortId, slug }) => (
          <ArticleContent shortId={shortId} slug={slug} />
        ))}
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ shortId, slug }: ArticleRouteParams) {
  const { article, legacyRedirect } = await resolveArticle(shortId);

  if (legacyRedirect) {
    permanentRedirect(legacyRedirect);
  }

  if (!article) {
    notFound();
  }

  const decorativeRedirect = canonicalRedirect(article, slug);
  if (decorativeRedirect) {
    permanentRedirect(decorativeRedirect);
  }

  return (
    <ArticleWithScrollProgress>
      <Article article={article} />
    </ArticleWithScrollProgress>
  );
}
