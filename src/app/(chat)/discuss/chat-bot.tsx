"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { DiscussChatComposer } from "./discuss-chat-composer";
import { DiscussChatProvider } from "./discuss-chat-context";
import { DiscussChatMessageList } from "./discuss-chat-message-list";

export default function ChatBot() {
  return (
    <DiscussChatProvider>
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-36">
          <DiscussChatMessageList />
        </ConversationContent>

        <DiscussChatComposer />
      </Conversation>
    </DiscussChatProvider>
  );
}
