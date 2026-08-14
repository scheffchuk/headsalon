import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { tagUrl } from "@/lib/urls";
import type { Doc } from "@convex/_generated/dataModel";
import { BackButton } from "./back-button";

export function Article({ article }: { article: Doc<"articles"> | null }) {
  if (!article) {
    notFound();
  }

  return (
    <Card className="border-none shadow-none rounded-sm">
      <CardHeader>
        <CardTitle className="text-4xl font-bold leading-relaxed">
          {article.title}
        </CardTitle>
        <CardDescription className="text-lg">
          发布于
          <time dateTime={article.date} className="text-muted-foreground">
            {formatDate(article.date)}
          </time>
        </CardDescription>
        {article.tags?.length ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <Link key={tag} href={tagUrl(tag)}>
                <Badge
                  variant="secondary"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="wrap-normal">
        <MarkdownRenderer content={article.content} />
      </CardContent>

      <CardFooter>
        <BackButton />
      </CardFooter>
    </Card>
  );
}
