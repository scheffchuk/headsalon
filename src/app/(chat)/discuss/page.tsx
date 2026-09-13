import dynamic from "next/dynamic";
import { Suspense } from "react";
import { isAiChatEnabled } from "@/lib/ai-chat-enabled";
import ChatMaintenance from "./chat-maintenance";

const DiscussChatClient = dynamic(
  () =>
    import("./discuss-chat-client").then((mod) => mod.DiscussChatClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    ),
  },
);

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
      <DiscussChatClient />
    </Suspense>
  );
}
