import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { TagArticles } from "./tag-articles";

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
      <Suspense
        fallback={
          <div className="mx-auto py-8">
            <div className="text-center py-16">
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        }
      >
        <TagPageContent params={params} />
      </Suspense>
    </ViewTransition>
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
