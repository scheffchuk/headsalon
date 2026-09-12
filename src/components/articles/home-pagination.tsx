import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { homePageHref } from "@/lib/urls";

export function HomePagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent>
          {page > 1 ? (
            <PaginationItem>
              <PaginationPrevious href={homePageHref(page - 1)} />
            </PaginationItem>
          ) : null}
          {pages.map((n) => (
            <PaginationItem key={n}>
              <PaginationLink href={homePageHref(n)} isActive={n === page}>
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
          {page < totalPages ? (
            <PaginationItem>
              <PaginationNext href={homePageHref(page + 1)} />
            </PaginationItem>
          ) : null}
        </PaginationContent>
      </Pagination>
      <p className="text-sm text-muted-foreground">
        {page} of {totalPages}
      </p>
    </div>
  );
}
