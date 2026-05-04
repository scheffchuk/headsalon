"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDiscussChat, type DiscussChatRuntime } from "./use-discuss-chat";

const DiscussChatContext = createContext<DiscussChatRuntime | null>(null);

export function DiscussChatProvider({ children }: { children: ReactNode }) {
  const chat = useDiscussChat();
  return (
    <DiscussChatContext.Provider value={chat}>
      {children}
    </DiscussChatContext.Provider>
  );
}

export function useDiscussChatContext(): DiscussChatRuntime {
  const ctx = useContext(DiscussChatContext);
  if (!ctx) {
    throw new Error(
      "useDiscussChatContext must be used within DiscussChatProvider",
    );
  }
  return ctx;
}
