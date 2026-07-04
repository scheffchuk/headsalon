import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getArticleBySlug,
  getArticleByUrlKey,
} from "@/lib/convex-cache";
import { articleUrl } from "@/lib/urls";
import { Article } from "./article";
import { ArticleWithScrollProgress } from "./article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

async function resolveArticle(param: string) {
  const byUrlKey = await getArticleByUrlKey(param);
  if (byUrlKey) {
    return { article: byUrlKey, redirectTo: null as string | null };
  }

  const bySlug = await getArticleBySlug(param);
  if (bySlug) {
    return {
      article: bySlug,
      redirectTo: articleUrl({ urlKey: bySlug.urlKey }),
    };
  }

  return { article: null, redirectTo: null as string | null };
}

export async function generateMetadata(
  { params }: PageProps<"/articles/[urlKey]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { urlKey } = await params;
  const { article, redirectTo } = await resolveArticle(urlKey);

  if (redirectTo) {
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

  const canonical = articleUrl({ urlKey: article.urlKey });

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
}: PageProps<"/articles/[urlKey]">) {
  return (
    <ViewTransition>
      <Suspense fallback={<ArticleSkeleton />}>
        {params.then(({ urlKey }) => (
          <ArticleContent urlKey={urlKey} />
        ))}
      </Suspense>
    </ViewTransition>
  );
}

async function ArticleContent({ urlKey }: { urlKey: string }) {
  const { article, redirectTo } = await resolveArticle(urlKey);

  if (redirectTo) {
    permanentRedirect(redirectTo);
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
