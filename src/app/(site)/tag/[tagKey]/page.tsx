import { Suspense } from "react";
import { ViewTransition } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getArticlesByTag,
  getArticlesByTagKey,
} from "@/lib/convex-cache";
import { tagKeyFromDisplayName } from "@/lib/urlKey";
import { tagUrlFromKey } from "@/lib/urls";
import { ArticlePreviewRow } from "@/components/articles/article-preview-row";

type ArticleForTag = {
  _id: string;
  title: string;
  slug: string;
  urlKey: string;
  excerpt?: string;
  tags: string[];
  date: string;
};

function displayTagForKey(articles: ArticleForTag[], tagKey: string): string {
  for (const article of articles) {
    for (const tag of article.tags) {
      if (tagKeyFromDisplayName(tag) === tagKey) {
        return tag;
      }
    }
  }
  return tagKey;
}

async function resolveTagListing(param: string) {
  const byKey = await getArticlesByTagKey(param);
  if (byKey.length > 0) {
    return {
      articles: byKey,
      tagKey: param,
      displayTag: displayTagForKey(byKey, param),
      redirectTo: null as string | null,
    };
  }

  const byLegacyTag = await getArticlesByTag(param);
  if (byLegacyTag.length > 0) {
    const tagKey = tagKeyFromDisplayName(param);
    return {
      articles: byLegacyTag,
      tagKey,
      displayTag: param,
      redirectTo: tagUrlFromKey(tagKey),
    };
  }

  return {
    articles: [] as ArticleForTag[],
    tagKey: param,
    displayTag: param,
    redirectTo: null as string | null,
  };
}

export async function generateMetadata(
  { params }: PageProps<"/tag/[tagKey]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { tagKey } = await params;
  const { articles, displayTag, redirectTo } = await resolveTagListing(tagKey);

  if (redirectTo) {
    return {};
  }

  const articleCount = articles.length;
  const description =
    articleCount > 0
      ? `浏览所有标记为 "${displayTag}" 的文章，共 ${articleCount} 篇文章`
      : `标记为 "${displayTag}" 的文章`;

  const canonical = tagUrlFromKey(tagKey);

  return {
    title: {
      absolute: `标签: ${displayTag}`,
    },
    description,
    keywords: `${displayTag}, 标签, 文章分类`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `标签: ${displayTag}`,
      description,
      type: "website",
      siteName: "HeadSalon",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: `标签: ${displayTag}`,
      description,
    },
  };
}

export default function TagPage({ params }: PageProps<"/tag/[tagKey]">) {
  return (
    <ViewTransition>
      <div className="mx-auto mt-16 pb-8">
        <header className="mb-8">
          <Suspense
            fallback={
              <h1 className="text-3xl font-bold text-foreground mb-2">标签：</h1>
            }
          >
            {params.then(({ tagKey }) => (
              <TagPageContent tagKey={tagKey} />
            ))}
          </Suspense>
        </header>
      </div>
    </ViewTransition>
  );
}

async function TagPageContent({ tagKey }: { tagKey: string }) {
  const { articles, displayTag, redirectTo } = await resolveTagListing(tagKey);

  if (redirectTo) {
    permanentRedirect(redirectTo);
  }

  if (!articles.length) {
    notFound();
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        标签：{displayTag}
      </h1>
      <p className="text-muted-foreground">找到 {articles.length} 篇相关文章</p>
      <TagArticlesList articles={articles} displayTag={displayTag} />
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
          key={article.urlKey}
          article={{
            _id: article._id,
            title: article.title,
            slug: article.slug,
            urlKey: article.urlKey,
            date: article.date,
            tags: article.tags,
          }}
          emphasizedTag={displayTag}
        />
      ))}
    </div>
  );
}
