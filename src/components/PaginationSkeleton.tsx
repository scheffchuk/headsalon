import { Skeleton } from "./ui/skeleton";

export function PaginationSkeleton() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center space-x-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}