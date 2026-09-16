import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { homePagerWindow } from "@/lib/home-pagination";
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

  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={atFirst ? homePageHref(page) : homePageHref(page - 1)}
              prefetch={true}
              aria-disabled={atFirst || undefined}
            />
          </PaginationItem>
          {homePagerWindow(page, totalPages).map((item) =>
            item.type === "ellipsis" ? (
              <PaginationItem key={item.key}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item.page}>
                <PaginationLink
                  href={homePageHref(item.page)}
                  prefetch={true}
                  isActive={item.page === page}
                >
                  {item.page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href={atLast ? homePageHref(page) : homePageHref(page + 1)}
              prefetch={true}
              aria-disabled={atLast || undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
    </div>
  );
}
