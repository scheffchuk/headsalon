/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ 
  content, 
  className = "prose prose-lg max-w-none" 
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          // Headings with better hierarchy and spacing
          h1: ({ node, ...props }) => (
            <h1 
              className="text-4xl font-bold mt-12 mb-8 pb-3 border-b-2 border-border" 
              {...props} 
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 
              className="text-3xl font-bold mt-10 mb-6 pb-2 border-b border-border" 
              {...props} 
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 
              className="text-2xl font-semibold mt-8 mb-4" 
              {...props} 
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 
              className="text-xl font-semibold mt-6 mb-3" 
              {...props} 
            />
          ),
          h5: ({ node, ...props }) => (
            <h5 
              className="text-lg font-semibold mt-5 mb-2" 
              {...props} 
            />
          ),
          h6: ({ node, ...props }) => (
            <h6 
              className="text-base font-semibold mt-4 mb-2 text-muted-foreground" 
              {...props} 
            />
          ),

          // Paragraph with better line height
          p: ({ node, ...props }) => (
            <p className="mb-6 leading-relaxed text-foreground" {...props} />
          ),

          // Links with better styling
          a: ({ node, ...props }) => (
            <a 
              className="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2 transition-colors" 
              target={props.href?.startsWith('http') ? '_blank' : undefined}
              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props} 
            />
          ),

          // Enhanced code styling
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code 
                  className="bg-muted/70 px-1.5 py-0.5 rounded text-sm font-mono border" 
                  {...props} 
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className="block bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-x-auto border" 
                {...props} 
              >
                {children}
              </code>
            );
          },

          // Pre-formatted text with syntax highlighting support
          pre: ({ node, ...props }) => (
            <pre
              className="bg-muted/30 p-6 rounded-lg overflow-x-auto my-6 border shadow-sm"
              {...props}
            />
          ),

          // Enhanced lists with better spacing
          ul: ({ node, ...props }) => (
            <ul 
              className="list-disc list-outside mb-6 ml-6 space-y-2" 
              {...props} 
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-outside mb-6 ml-6 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),

          // Enhanced blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/30 bg-muted/20 pl-6 pr-4 py-4 my-6 italic rounded-r-lg"
              {...props}
            />
          ),

          // Text formatting
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-muted-foreground" {...props} />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t-2 border-border" {...props} />
          ),

          // Tables with comprehensive styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table 
                className="min-w-full border-collapse border border-border rounded-lg"
                {...props} 
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border hover:bg-muted/30 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th 
              className="px-4 py-3 text-left font-semibold border-r border-border last:border-r-0"
              {...props} 
            />
          ),
          td: ({ node, ...props }) => (
            <td 
              className="px-4 py-3 border-r border-border last:border-r-0"
              {...props} 
            />
          ),

          // Images with responsive styling
          img: ({ node, alt, ...props }) => (
            <img 
              className="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto border"
              loading="lazy"
              alt={alt || ""}
              {...props} 
            />
          ),

          // Task lists (GitHub-flavored markdown)
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              return (
                <input 
                  className="mr-2 accent-primary"
                  disabled
                  {...props} 
                />
              );
            }
            return <input {...props} />;
          },

          // Details/Summary for collapsible sections
          details: ({ node, ...props }) => (
            <details 
              className="border border-border rounded-lg p-4 my-4 bg-muted/20"
              {...props} 
            />
          ),
          summary: ({ node, ...props }) => (
            <summary 
              className="font-semibold cursor-pointer hover:text-primary transition-colors mb-2"
              {...props} 
            />
          ),

          // Abbreviations
          abbr: ({ node, ...props }) => (
            <abbr 
              className="underline decoration-dotted cursor-help"
              {...props} 
            />
          ),

          // Keyboard keys
          kbd: ({ node, ...props }) => (
            <kbd 
              className="bg-muted border border-border rounded px-2 py-1 text-xs font-mono shadow-sm"
              {...props} 
            />
          ),

          // Mark/highlight text
          mark: ({ node, ...props }) => (
            <mark 
              className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
              {...props} 
            />
          ),

          // Subscript and superscript
          sub: ({ node, ...props }) => (
            <sub className="text-xs" {...props} />
          ),
          sup: ({ node, ...props }) => (
            <sup className="text-xs" {...props} />
          ),

          // Definition lists
          dl: ({ node, ...props }) => (
            <dl className="my-6 space-y-3" {...props} />
          ),
          dt: ({ node, ...props }) => (
            <dt className="font-semibold text-foreground" {...props} />
          ),
          dd: ({ node, ...props }) => (
            <dd className="ml-6 text-muted-foreground" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
