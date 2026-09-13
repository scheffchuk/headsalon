"use client";

import { MessageAction } from "@/components/ai-elements/message";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function DiscussChatCopyAction({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <MessageAction
      label={copied ? "Copied" : "Copy"}
      onClick={() => {
        navigator.clipboard.writeText(content);
        setCopied(true);
      }}
    >
      {copied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </MessageAction>
  );
}
