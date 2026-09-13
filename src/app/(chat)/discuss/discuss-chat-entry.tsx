"use client";

import dynamic from "next/dynamic";

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

export default function DiscussChatEntry() {
  return <DiscussChatClient />;
}
