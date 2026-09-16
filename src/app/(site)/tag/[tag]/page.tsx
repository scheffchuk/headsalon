import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getArticlesByTag } from "@/lib/convex-cache";
import { tagUrl } from "@/lib/urls";
import { ArticleCardSkeleton } from "@/components/article/article-card-skeleton";
import { ArticlePreviewRow } from "@/components/articles/article-preview-row";

async function getTagMetadata(tag: string): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `tag-${tag}`);

  const articles = await getArticlesByTag(tag);
  const articleCount = articles.length;
  const description =
    articleCount > 0
      ? `浏览所有标记为 "${tag}" 的文章，共 ${articleCount} 篇文章`
      : `标记为 "${tag}" 的文章`;
  const canonical = tagUrl(tag);

  return {
    title: {
      absolute: `标签: ${tag}`,
    },
    description,
    keywords: `${tag}, 标签, 文章分类`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `标签: ${tag}`,
      description,
      type: "website",
      siteName: "HeadSalon",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: `标签: ${tag}`,
      description,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/tag/[tag]">): Promise<Metadata> {
  const { tag: encodedTag } = await params;
  return getTagMetadata(decodeURIComponent(encodedTag));
}

export default function TagPage({ params }: PageProps<"/tag/[tag]">) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16 pb-8">
        <Suspense
          fallback={
            <>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  标签：
                </h1>
              </header>
              <div className="space-y-8">
                {Array.from({ length: 5 }).map((_, index) => (
                  <ArticleCardSkeleton key={index} />
                ))}
              </div>
            </>
          }
        >
          <TagPageContent params={params} />
        </Suspense>
      </div>
    </ViewTransition>
  );
}

async function TagPageContent({
  params,
}: Pick<PageProps<"/tag/[tag]">, "params">) {
  const { tag: encodedTag } = await params;
  const decodedTag = decodeURIComponent(encodedTag);
  const articles = await getArticlesByTag(decodedTag);

  if (!articles.length) {
    notFound();
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          标签：{decodedTag}
        </h1>
        <p className="text-muted-foreground">
          找到 {articles.length} 篇相关文章
        </p>
      </header>
      <TagArticlesList articles={articles} displayTag={decodedTag} />
    </>
  );
}

function TagArticlesList({
  articles,
  displayTag,
}: {
  articles: Awaited<ReturnType<typeof getArticlesByTag>>;
  displayTag: string;
}) {
  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <ArticlePreviewRow
          key={article._id}
          article={article}
          emphasizedTag={displayTag}
        />
      ))}
    </div>
  );
}
