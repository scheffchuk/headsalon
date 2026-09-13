"use client";

import { ConversationScrollButton } from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import type { useChat } from "@ai-sdk/react";
import type { ComponentProps } from "react";

const suggestions = ["你是谁？", "什么是达尔萨斯主义", "AI将如何改变人类社会"];

export function DiscussChatComposer({
  messages,
  status,
  stop,
  isRateLimited,
  rateLimitMessage,
  handleSubmit,
  handleSuggestionClick,
}: Pick<ReturnType<typeof useChat>, "messages" | "status" | "stop"> & {
  isRateLimited: boolean;
  rateLimitMessage: string | null;
  handleSubmit: ComponentProps<typeof PromptInput>["onSubmit"];
  handleSuggestionClick: ComponentProps<typeof Suggestion>["onClick"];
}) {
  return (
    <div className="sticky bottom-0 mx-auto w-full max-w-3xl px-4">
      <ConversationScrollButton className="absolute -top-12 left-1/2 -translate-x-1/2" />
      <div className="pointer-events-none h-8 bg-gradient-to-t from-background to-transparent" />
      <div className="bg-background">
        {messages.length === 0 && (
          <Suggestions className="pb-4">
            {suggestions.map((s) => (
              <Suggestion
                key={s}
                suggestion={s}
                onClick={handleSuggestionClick}
                disabled={isRateLimited}
              />
            ))}
          </Suggestions>
        )}
        {rateLimitMessage ? (
          <p
            aria-live="polite"
            className="pb-2 text-sm text-destructive"
            role="alert"
          >
            {rateLimitMessage}
          </p>
        ) : null}
        <PromptInput onSubmit={handleSubmit} className="pb-4">
          <PromptInputBody>
            <PromptInputTextarea disabled={isRateLimited} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              disabled={isRateLimited}
              status={status}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
