import { Suspense } from "react";
import ChatBot from "./chat-bot";


export default function DiscussPage() {
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
