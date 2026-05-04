"use client";

import dynamic from "next/dynamic";

const ChatBot = dynamic(() => import("./chat-bot"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-muted-foreground">Loading chat...</div>
    </div>
  ),
});

export function DiscussChatClient() {
  return <ChatBot />;
}
