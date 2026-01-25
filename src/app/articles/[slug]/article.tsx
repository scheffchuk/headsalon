import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Article = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  date: string;
};

type ArticleProps = {
  article: Article | null;
};

export function Article({ article }: ArticleProps) {
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
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
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
    </Card>
  );
}
