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
        <div className="relative h-[calc(100vh-10rem)] mt-3">
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading chat...</div>
          </div>
        </div>
      }
    >
      <ChatBot />
    </Suspense>
  );
}
