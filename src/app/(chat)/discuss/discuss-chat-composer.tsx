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
import type { DiscussChatRuntime } from "./use-discuss-chat";

const suggestions = ["你是谁？", "什么是达尔萨斯主义", "AI将如何改变人类社会"];

type DiscussChatComposerProps = Pick<
  DiscussChatRuntime,
  "messages" | "status" | "stop" | "handleSubmit" | "handleSuggestionClick"
>;

export function DiscussChatComposer({
  messages,
  status,
  stop,
  handleSubmit,
  handleSuggestionClick,
}: DiscussChatComposerProps) {
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
              />
            ))}
          </Suggestions>
        )}
        <PromptInput onSubmit={handleSubmit} className="pb-4">
          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
