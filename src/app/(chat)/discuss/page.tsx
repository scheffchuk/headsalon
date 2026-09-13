import { isAiChatEnabled } from "@/lib/ai-chat-enabled";
import ChatMaintenance from "./chat-maintenance";
import DiscussChatEntry from "./discuss-chat-entry";

export default function DiscussPage() {
  if (!isAiChatEnabled()) {
    return <ChatMaintenance />;
  }

  return <DiscussChatEntry />;
}
