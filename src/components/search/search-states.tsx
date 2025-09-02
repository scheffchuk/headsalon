import { ArticleCardSkeleton } from "../article/article-card-skeleton";

type SearchStatesProps = {
  state: "empty" | "loading" | "no-results";
  query?: string;
};

export function SearchStates({ state, query }: SearchStatesProps) {
  switch (state) {
    case "empty":
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">请输入关键词</div>
          <div className="text-sm text-muted-foreground">
            支持语义搜索，标题、内容、主题、话题...
          </div>
        </div>
      );

    case "loading":
      return (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      );

    case "no-results":
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            没有找到有关 &quot;{query}&quot; 的文章
          </div>
          <div className="text-sm text-muted-foreground">
            试试不同的关键词？
          </div>
        </div>
      );

    default:
      return null;
  }
}
