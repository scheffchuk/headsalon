"use client";

import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import type { DiscussChatRuntime } from "./use-discuss-chat";
import { DiscussChatCopyAction } from "./discuss-chat-copy-action";

type DiscussChatMessageListProps = Pick<DiscussChatRuntime, "messages" | "status">;

export function DiscussChatMessageList({
  messages,
  status,
}: DiscussChatMessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          {message.role === "assistant" &&
            message.parts.filter((part) => part.type === "source-url").length >
              0 && (
              <Sources>
                <SourcesTrigger
                  count={
                    message.parts.filter((part) => part.type === "source-url")
                      .length
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
              (status === "ready" || message.id !== messages.at(-1)?.id) && (
                <MessageActions>
                  <DiscussChatCopyAction
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
      {status === "submitted" && (
        <Message from="assistant">
          <Loader className="self-start" />
        </Message>
      )}
    </>
  );
}
