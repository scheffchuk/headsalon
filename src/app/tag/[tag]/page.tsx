import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { TagArticles } from "./tag-articles";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ArticlesSkeleton } from "@/components/articles/articles-skeleton";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata(
  { params }: TagPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  // Fetch articles for this tag to generate metadata
  const articles = await fetchQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  const articleCount = articles.length;
  const title = `标签: ${decodedTag} - HeadSalon`;
  const description =
    articleCount > 0
      ? `浏览所有标记为 "${decodedTag}" 的文章，共 ${articleCount} 篇文章`
      : `标记为 "${decodedTag}" 的文章`;

  return {
    title,
    description,
    keywords: `${decodedTag}, 标签, 文章分类, HeadSalon`,
    openGraph: {
      title: `标签: ${decodedTag}`,
      description,
      type: "website",
    },
  };
}

export default function TagPage({ params }: TagPageProps) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16 pb-8">
        {/* Header */}
        <header className="mb-8">
          <Suspense
            fallback={
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  标签：
                  <span className="inline-block bg-gray-200 animate-pulse rounded px-2">
                    ...
                  </span>
                </h1>
                <p className="text-gray-600">
                  找到{" "}
                  <span className="inline-block bg-gray-200 animate-pulse rounded px-2">
                    —
                  </span>{" "}
                  篇相关文章
                </p>
              </>
            }
          >
            <TagHeaderContent params={params} />
          </Suspense>
        </header>

        {/* Articles List */}
        <Suspense
          fallback={
            <ArticlesSkeleton />
          }
        >
          <TagPageContent params={params} />
        </Suspense>
      </div>
    </ViewTransition>
  );
}

async function TagHeaderContent({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const articles = await fetchQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">标签：{decodedTag}</h1>
      <p className="text-gray-600">找到 {articles.length} 篇相关文章</p>
    </>
  );
}

async function TagPageContent({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const preloadedArticles = await preloadQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  return <TagArticles preloadedArticles={preloadedArticles} tag={decodedTag} />;
}
