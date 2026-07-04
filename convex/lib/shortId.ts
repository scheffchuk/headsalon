import { customAlphabet } from "nanoid";

/** URL-safe 8-char id — lookup key only; decorative slug is separate. */
const generate = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8,
);

export function generateShortId(): string {
  return generate();
}
