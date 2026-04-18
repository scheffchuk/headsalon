/** AI chat UI is on only when explicitly enabled (Vercel: NEXT_PUBLIC_AI_CHAT_ENABLED=true). */
export function isAiChatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === "true";
}
