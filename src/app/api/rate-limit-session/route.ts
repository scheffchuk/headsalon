import { cookies } from "next/headers";
import { RATE_LIMIT_SESSION_COOKIE } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const payload: unknown = await request.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("sessionId" in payload) ||
    typeof payload.sessionId !== "string"
  ) {
    return new Response(null, { status: 400 });
  }

  const sessionId = payload.sessionId;
  const cookieStore = await cookies();
  cookieStore.set(RATE_LIMIT_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(null, { status: 204 });
}
