import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByTag } from "@/lib/convex-cache";
import { tagUrl } from "@/lib/urls";
import { ArticlePreviewRow } from "@/components/articles/article-preview-row";

type ArticleForTag = {
  _id: string;
  title: string;
  slug: string;
  shortId: string;
  excerpt?: string;
  tags: string[];
  date: string;
};

export async function generateMetadata(
  { params }: PageProps<"/tag/[tag]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { tag: encodedTag } = await params;
  const decodedTag = decodeURIComponent(encodedTag);
  const articles = await getArticlesByTag(decodedTag);

  const articleCount = articles.length;
  const description =
    articleCount > 0
      ? `浏览所有标记为 "${decodedTag}" 的文章，共 ${articleCount} 篇文章`
      : `标记为 "${decodedTag}" 的文章`;

  const canonical = tagUrl(decodedTag);

  return {
    title: {
      absolute: `标签: ${decodedTag}`,
    },
    description,
    keywords: `${decodedTag}, 标签, 文章分类`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `标签: ${decodedTag}`,
      description,
      type: "website",
      siteName: "HeadSalon",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: `标签: ${decodedTag}`,
      description,
    },
  };
}

export default function TagPage({ params }: PageProps<"/tag/[tag]">) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16 pb-8">
        <header className="mb-8">
          <Suspense
            fallback={
              <h1 className="text-3xl font-bold text-foreground mb-2">标签：</h1>
            }
          >
            {params.then(({ tag }) => (
              <TagPageContent encodedTag={tag} />
            ))}
          </Suspense>
        </header>
      </div>
    </ViewTransition>
  );
}

async function TagPageContent({ encodedTag }: { encodedTag: string }) {
  const decodedTag = decodeURIComponent(encodedTag);
  const articles = await getArticlesByTag(decodedTag);

  if (!articles.length) {
    notFound();
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        标签：{decodedTag}
      </h1>
      <p className="text-muted-foreground">找到 {articles.length} 篇相关文章</p>
      <TagArticlesList articles={articles} displayTag={decodedTag} />
    </>
  );
}

function TagArticlesList({
  articles,
  displayTag,
}: {
  articles: ArticleForTag[];
  displayTag: string;
}) {
  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <ArticlePreviewRow
          key={article.shortId}
          article={{
            _id: article._id,
            title: article.title,
            slug: article.slug,
            shortId: article.shortId,
            date: article.date,
            tags: article.tags,
          }}
          emphasizedTag={displayTag}
        />
      ))}
    </div>
  );
}
