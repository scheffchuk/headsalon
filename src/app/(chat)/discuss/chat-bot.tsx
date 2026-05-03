"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState } from "react";

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
  /.cloud$/,
  ".site"
);

const suggestions = [
  "你是谁？",
  "什么是达尔萨斯主义",
  "AI将如何改变人类社会",
];

const CopyAction = ({ content }: { content: string }) => {
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
};

export default function ChatBot() {
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
    [sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => sendMessage({ text: suggestion }),
    [sendMessage]
  );

  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-36">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.role === "assistant" &&
              message.parts.filter((part) => part.type === "source-url")
                .length > 0 && (
                <Sources>
                  <SourcesTrigger
                    count={
                      message.parts.filter(
                        (part) => part.type === "source-url"
                      ).length
                    }
                  />
                  <SourcesContent>
                    {message.parts
                      .filter((part) => part.type === "source-url")
                      .map((part) => (
                        <Source
                          key={part.url}
                          href={part.url}
                          title={part.url}
                        />
                      ))}
                  </SourcesContent>
                </Sources>
              )}
            <Message from={message.role}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <MessageResponse key={`${message.id}-${i}`}>
                          {part.text}
                        </MessageResponse>
                      );
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === "streaming"}
                          defaultOpen={false}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    case "tool-findRelatedArticle":
                      return (
                        <Tool
                          key={`${message.id}-${i}`}
                          defaultOpen={false}
                          className="w-full max-w-md"
                        >
                          <ToolHeader
                            type={part.type}
                            state={part.state}
                            title="Searching articles"
                          />
                          <ToolContent>
                            <ToolInput input={part.input} />
                          </ToolContent>
                        </Tool>
                      );
                    default:
                      return null;
                  }
                })}
              </MessageContent>
              {message.role === "assistant" &&
                (status === "ready" ||
                  message.id !== messages.at(-1)?.id) && (
                  <MessageActions>
                    <CopyAction
                      content={message.parts
                        .filter((p) => p.type === "text")
                        .map((p) => p.text)
                        .join("\n")}
                    />
                  </MessageActions>
                )}
            </Message>
          </div>
        ))}
        {status === "submitted" && <Loader />}
      </ConversationContent>

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
          <PromptInput onSubmit={handleSubmit} className="pb-6">
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
    </Conversation>
  );
}
