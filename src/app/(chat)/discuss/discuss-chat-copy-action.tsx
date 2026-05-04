"use client";

import { MessageAction } from "@/components/ai-elements/message";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function DiscussChatCopyAction({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  }, [content]);

  return (
    <MessageAction label={copied ? "Copied" : "Copy"} onClick={handleClick}>
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </MessageAction>
  );
}
