import { isAiChatEnabled } from "@/lib/ai-chat-enabled";
import { DiscussChatClient } from "./discuss-chat-client";
import ChatMaintenance from "./chat-maintenance";

export default function DiscussPage() {
  if (!isAiChatEnabled()) {
    return <ChatMaintenance />;
  }

  return <DiscussChatClient />;
}
