import TagArticleItem from "@/components/tag-article-item";

type Article = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  tags: string[];
  date: string;
};

type TagArticlesProps = {
  articles: Article[];
  tag: string;
};

export function TagArticles({ articles, tag }: TagArticlesProps) {
  return (
    <div>
      {/* Articles List */}
      {!articles.length ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">该标签下暂无文章</p>
        </div>
      ) : (
        <div className="space-y-8">
          {articles.map((article, index) => (
            <TagArticleItem article={article} tag={tag} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}
