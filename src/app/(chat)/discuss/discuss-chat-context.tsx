"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDiscussChat } from "./use-discuss-chat";

const DiscussChatContext = createContext<ReturnType<typeof useDiscussChat> | null>(
  null,
);

export function DiscussChatProvider({ children }: { children: ReactNode }) {
  const chat = useDiscussChat();
  return (
    <DiscussChatContext.Provider value={chat}>
      {children}
    </DiscussChatContext.Provider>
  );
}

export function useDiscussChatContext() {
  const ctx = useContext(DiscussChatContext);
  if (!ctx) {
    throw new Error(
      "useDiscussChatContext must be used within DiscussChatProvider",
    );
  }
  return ctx;
}
