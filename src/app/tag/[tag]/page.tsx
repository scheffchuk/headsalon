import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { TagArticles } from "./tag-articles";

export async function generateMetadata(
  { params }: PageProps<'/tag/[tag]'>,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  // Fetch articles for this tag to generate metadata
  const articles = await fetchQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  const articleCount = articles.length;
  const description =
    articleCount > 0
      ? `浏览所有标记为 "${decodedTag}" 的文章，共 ${articleCount} 篇文章`
      : `标记为 "${decodedTag}" 的文章`;

  return {
    title: {
      absolute: `标签: ${decodedTag}`,
    },
    description,
    keywords: `${decodedTag}, 标签, 文章分类`,
    openGraph: {
      title: `标签: ${decodedTag}`,
      description,
      type: "website",
      siteName: "HeadSalon",
    },
    twitter: {
      card: "summary",
      title: `标签: ${decodedTag}`,
      description,
    },
  };
}

export default function TagPage({ params }: PageProps<'/tag/[tag]'>) {
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
                </h1>
              </>
            }
          >
            {
              params.then(({tag}) => (
              <TagPageContent tag={tag} />))
            }
          </Suspense>
        </header>
      </div>
    </ViewTransition>
  );
}

async function TagPageContent({ tag }: { tag: string }) {
  const decodedTag = decodeURIComponent(tag);
  const articles = await fetchQuery(api.articles.getArticlesByTag, {
    tag: decodedTag,
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">标签：{decodedTag}</h1>
      <p className="text-gray-600">找到 {articles.length} 篇相关文章</p>
      <TagArticles articles={articles} tag={decodedTag} />
    </>
  );
}
