import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeArticleIndex } from "@/components/articles/home-article-index";
import { ArticleListSkeleton } from "@/components/articles/articles-skeleton";
import { getHomeArticleCount } from "@/lib/convex-cache";
import { homeStaticParamsFromCount, parseHomePageParam } from "@/lib/home-pagination";

export async function generateStaticParams() {
  const totalCount = await getHomeArticleCount();
  return homeStaticParamsFromCount(totalCount);
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

export default function HomePagedPage({
  params,
}: PageProps<"/page/[page]">) {
  return (
    <Suspense fallback={<ArticleListSkeleton />}>
      {params.then(({ page }) => (
        <HomePagedContent pageParam={page} />
      ))}
    </Suspense>
  );
}

async function HomePagedContent({ pageParam }: { pageParam: string }) {
  const page = parseHomePageParam(pageParam);
  if (page === null) {
    notFound();
  }
  if (page === 1) {
    redirect("/");
  }
  return <HomeArticleIndex page={page} />;
}
