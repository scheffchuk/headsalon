type SearchStatesProps = {
  state: 'empty' | 'loading' | 'no-results';
  query?: string;
};

export function SearchStates({ state, query }: SearchStatesProps) {
  switch (state) {
    case 'empty':
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">请输入关键词搜索文章</div>
          <div className="text-sm text-muted-foreground">支持搜索标题、内容</div>
        </div>
      );

    case 'loading':
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-3 w-3/4" />
              <div className="h-4 bg-muted rounded mb-2 w-1/4" />
            </div>
          ))}
        </div>
      );

    case 'no-results':
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            没有找到包含 &quot;{query}&quot; 的文章
          </div>
          <div className="text-sm text-muted-foreground">尝试使用不同的关键词</div>
        </div>
      );

    default:
      return null;
  }
}