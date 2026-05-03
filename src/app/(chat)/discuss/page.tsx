import { Suspense } from "react";
import { isAiChatEnabled } from "@/lib/ai-chat-enabled";
import ChatBot from "./chat-bot";
import ChatMaintenance from "./chat-maintenance";

export default function DiscussPage() {
  if (!isAiChatEnabled()) {
    return <ChatMaintenance />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading chat...</div>
        </div>
      }
    >
      <ChatBot />
    </Suspense>
  );
}
