import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArticleSkeleton() {
  return (
    <div className="mx-auto py-8">
      <Card className="border-none shadow-none rounded-sm">
        <CardHeader>
          <CardTitle className="text-4xl font-bold leading-relaxed">
            <Skeleton className="h-12 w-4/5 rounded-sm" />
          </CardTitle>
          <CardDescription className="text-lg">
            <Skeleton className="mt-2 h-6 w-32 rounded-sm" />
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <Skeleton className="h-6 w-16 rounded-sm" />
            <Skeleton className="h-6 w-20 rounded-sm" />
            <Skeleton className="h-6 w-24 rounded-sm" />
            <Skeleton className="h-6 w-18 rounded-sm" />
          </div>
        </CardHeader>

        <CardContent className="wrap-normal">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-4/5 rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

