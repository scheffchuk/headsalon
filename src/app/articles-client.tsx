"use client";

import { ArticleCard } from "@/components/ArticleCard";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ArticlesClientProps {
  articles: Array<{
    _id: string;
    title: string;
    slug: string;
    date: string;
    tags: string[];
  }>;
  currentPage: number;
  canShowPrevious: boolean;
  canShowNext: boolean;
  hasLoadedCurrentPage: boolean;
  isEmpty: boolean;
}

export function ArticlesClient({
  articles,
  currentPage,
  canShowPrevious,
  canShowNext,
  hasLoadedCurrentPage,
  isEmpty,
}: ArticlesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Simple navigation function
  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url, { scroll: true });
  };

  // Empty state
  if (isEmpty) {
    return (
      <div className="mx-auto py-8 mt-16">
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Maybe comeback later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>

      {/* Show pagination only when we have content */}
      {(canShowPrevious || canShowNext) && hasLoadedCurrentPage && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {canShowPrevious && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => navigateToPage(currentPage - 1)}
                  />
                </PaginationItem>
              )}

              {canShowNext && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => navigateToPage(currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}