import { Suspense } from "react";
import { ArticlesSkeleton } from "@/components/articles/articles-skeleton";
import { ArticlesContent } from "../components/articles/articles-content";

type HomePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesContent page={page} />
    </Suspense>
  );
}
