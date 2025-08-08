"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ArticlesPaginationProps {
  currentPage: number;
  canShowPrevious: boolean;
  canShowNext: boolean;
}

export function ArticlesPagination({
  currentPage,
  canShowPrevious,
  canShowNext,
}: ArticlesPaginationProps) {
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

  return (
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
  );
}