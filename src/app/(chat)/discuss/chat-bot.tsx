"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { DiscussChatComposer } from "./discuss-chat-composer";
import { DiscussChatMessageList } from "./discuss-chat-message-list";
import { useDiscussChat } from "./use-discuss-chat";

export default function ChatBot() {
  const chat = useDiscussChat();

  return (
    <Conversation>
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-36">
        <DiscussChatMessageList
          messages={chat.messages}
          status={chat.status}
        />
      </ConversationContent>

      <DiscussChatComposer
        messages={chat.messages}
        status={chat.status}
        stop={chat.stop}
        handleSubmit={chat.handleSubmit}
        handleSuggestionClick={chat.handleSuggestionClick}
      />
    </Conversation>
  );
}
