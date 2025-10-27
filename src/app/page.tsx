import { Suspense } from "react";
import { Articles } from "../components/articles/articles-client";
import { ArticlesSkeleton } from "@/components/articles/articles-skeleton";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default function HomePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesClient searchParams={searchParams} />
    </Suspense>
  );
}

async function ArticlesClient({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return <Articles page={page} />;
}
