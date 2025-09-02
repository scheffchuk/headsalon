import { Skeleton } from "./skeleton";

export function PaginationSkeleton() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center space-x-6">
        <Skeleton className="h-10 w-18" />
        <Skeleton className="h-10 w-18" />
      </div>
    </div>
  );
}