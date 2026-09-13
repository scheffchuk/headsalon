"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { DefaultChatTransport } from "ai";
import { DiscussChatComposer } from "./discuss-chat-composer";
import { DiscussChatMessageList } from "./discuss-chat-message-list";
import { useRateLimitCountdown } from "@/hooks/use-rate-limit-countdown";
import { getAnonymousSessionId } from "@/lib/anonymous-session";
import { getRateLimitRetryAfter } from "@/lib/rate-limit";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
  /.cloud$/,
  ".site",
);

export function DiscussChatClient() {
  const rateLimit = useRateLimitCountdown();
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${convexSiteUrl}/api/chat`,
      headers: () => ({
        "X-HeadSalon-Session": getAnonymousSessionId(),
      }),
    }),
    onError(error) {
      const retryAfter = getRateLimitRetryAfter(error);
      if (retryAfter !== null) rateLimit.start(retryAfter);
    },
  });

  return (
    <Conversation>
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-36">
        <DiscussChatMessageList messages={messages} status={status} />
      </ConversationContent>

      <DiscussChatComposer
        messages={messages}
        status={status}
        stop={stop}
        isRateLimited={rateLimit.isRateLimited}
        rateLimitMessage={rateLimit.message}
        handleSubmit={(message) => {
          if (!message.text.trim() || rateLimit.isRateLimited) return;
          sendMessage({ text: message.text });
        }}
        handleSuggestionClick={(suggestion) => {
          if (!rateLimit.isRateLimited) sendMessage({ text: suggestion });
        }}
      />
    </Conversation>
  );
}
