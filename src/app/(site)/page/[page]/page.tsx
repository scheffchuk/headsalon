import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeArticleIndex } from "@/components/articles/home-article-index";
import { ArticleListSkeleton } from "@/components/articles/articles-skeleton";
import { getHomeArticleCount, getHomeArticlePage } from "@/lib/convex-cache";
import { homeStaticParamsFromCount, parseHomePageParam } from "@/lib/home-pagination";

export async function generateStaticParams() {
  const totalCount = await getHomeArticleCount();
  const params = homeStaticParamsFromCount(totalCount);
  // Cache Components requires at least one result.
  return params.length > 0 ? params : [{ page: "2" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/page/[page]">): Promise<Metadata> {
  const { page: pageParam } = await params;
  const page = parseHomePageParam(pageParam);
  if (page === null || page === 1) {
    return {};
  }
  return {
    title: `Page ${page}`,
  };
}

export default async function HomePagedPage({
  params,
}: PageProps<"/page/[page]">) {
  const { page: pageParam } = await params;
  const page = parseHomePageParam(pageParam);
  if (page === null) {
    notFound();
  }
  if (page === 1) {
    redirect("/");
  }

  const result = await getHomeArticlePage(page);
  if (result.totalPages === 0 || page > result.totalPages) {
    notFound();
  }

  return (
    <Suspense fallback={<ArticleListSkeleton />}>
      <HomeArticleIndex page={page} />
    </Suspense>
  );
}
