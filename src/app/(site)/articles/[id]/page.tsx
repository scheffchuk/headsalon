import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleByParam } from "@/lib/convex-cache";
import { articleUrl } from "@/lib/urls";
import { Article } from "./article";
import { ArticleWithScrollProgress } from "./article-with-scroll-progress";
import { ArticleSkeleton } from "@/components/article/article-skeleton";

async function resolveArticle(param: string) {
  const article = await getArticleByParam(param);
  if (!article) {
    return { article: null, legacyRedirect: null as string | null };
  }

  if (param !== article._id) {
    return {
      article,
      legacyRedirect: articleUrl(article),
    };
  }

  return { article, legacyRedirect: null as string | null };
}

export async function generateMetadata(
  { params }: PageProps<"/articles/[id]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const { article, legacyRedirect } = await resolveArticle(id);

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
  const { article, legacyRedirect } = await resolveArticle(id);

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
