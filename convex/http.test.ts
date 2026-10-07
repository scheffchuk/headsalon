import { describe, expect, test } from "vitest";
import type { UIMessage } from "ai";
import { messagesForModel } from "./http";

function message(
  id: string,
  role: UIMessage["role"],
  parts: UIMessage["parts"],
): UIMessage {
  return { id, role, parts };
}

describe("messagesForModel", () => {
  test("keeps the latest assistant tool result and drops older ones", () => {
    const essay = {
      type: "dynamic-tool" as const,
      toolName: "findRelatedArticle",
      toolCallId: "call-1",
      state: "output-available" as const,
      input: { query: "institutions" },
      output: { passage: "a long retrieved essay" },
    };
    const olderTool = {
      type: "tool-findRelatedArticle" as const,
      toolCallId: "call-0",
      state: "output-available" as const,
      input: { query: "older" },
      output: { passage: "previous essay" },
    };

    const history = [
      message("u1", "user", [{ type: "text", text: "first" }]),
      message("a1", "assistant", [
        { type: "text", text: "prior answer" },
        olderTool,
        essay,
      ]),
      message("u2", "user", [{ type: "text", text: "second" }]),
      message("a2", "assistant", [
        { type: "text", text: "latest answer" },
        essay,
      ]),
    ] as UIMessage[];

    expect(messagesForModel(history)).toEqual([
      history[0],
      message("a1", "assistant", [{ type: "text", text: "prior answer" }]),
      history[2],
      history[3],
    ]);
  });

  test("drops an older assistant turn that was only a tool call", () => {
    const essay = {
      type: "dynamic-tool" as const,
      toolName: "findRelatedArticle",
      toolCallId: "call-1",
      state: "output-available" as const,
      input: { query: "institutions" },
      output: { passage: "essay" },
    };
    const history = [
      message("a1", "assistant", [essay]),
      message("u1", "user", [{ type: "text", text: "again" }]),
    ] as UIMessage[];

    expect(messagesForModel(history)).toEqual([history[1]]);
  });

  test("sends only the last 10 messages", () => {
    const history = Array.from({ length: 12 }, (_, index) =>
      message(`m${index}`, "user", [{ type: "text", text: String(index) }]),
    );

    expect(messagesForModel(history).map((item) => item.id)).toEqual(
      history.slice(-10).map((item) => item.id),
    );
  });
});
