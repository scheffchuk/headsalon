"use client";

import { useChat } from "@ai-sdk/react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport } from "ai";
import { useCallback } from "react";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
  /.cloud$/,
  ".site",
);

export function useDiscussChat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${convexSiteUrl}/api/chat`,
    }),
  });

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text.trim()) return;
      sendMessage({ text: message.text });
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => sendMessage({ text: suggestion }),
    [sendMessage],
  );

  return {
    messages,
    status,
    stop,
    handleSubmit,
    handleSuggestionClick,
  };
}

export type DiscussChatRuntime = ReturnType<typeof useDiscussChat>;
