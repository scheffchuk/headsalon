"use client";

import { useChat } from "@ai-sdk/react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { DefaultChatTransport } from "ai";
import { useCallback } from "react";
import { DiscussChatComposer } from "./discuss-chat-composer";
import { DiscussChatMessageList } from "./discuss-chat-message-list";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
  /.cloud$/,
  ".site",
);

export function DiscussChatClient() {
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

  return (
    <Conversation>
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-36">
        <DiscussChatMessageList messages={messages} status={status} />
      </ConversationContent>

      <DiscussChatComposer
        messages={messages}
        status={status}
        stop={stop}
        handleSubmit={handleSubmit}
        handleSuggestionClick={handleSuggestionClick}
      />
    </Conversation>
  );
}
