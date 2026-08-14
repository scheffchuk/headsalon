import ReactMarkdown from "react-markdown";
import { articleMarkdownComponents } from "@/components/markdown-renderer/article-markdown-components";

export function MarkdownRenderer({
  content,
  className = "prose prose-lg max-w-none",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown components={articleMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
