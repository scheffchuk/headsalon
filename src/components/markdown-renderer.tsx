import ReactMarkdown from "react-markdown";
import { articleMarkdownComponents } from "@/components/markdown-renderer/article-markdown-components";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({
  content,
  className = "prose prose-lg max-w-none",
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={articleMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
