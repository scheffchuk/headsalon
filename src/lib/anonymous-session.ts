"use client";

const SESSION_STORAGE_KEY = "headsalon-anonymous-session:v1";

export function getAnonymousSessionId(): string {
  try {
    const existingSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existingSessionId) return existingSessionId;

    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return window.crypto.randomUUID();
  }
}

export async function syncAnonymousSessionCookie(): Promise<void> {
  const response = await fetch("/api/rate-limit-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: getAnonymousSessionId() }),
  });

  if (!response.ok) {
    throw new Error("Unable to initialize the search session.");
  }
}
