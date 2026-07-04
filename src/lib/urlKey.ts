import { pinyin } from "pinyin-pro";

const MAX_KEY_LENGTH = 80;
const CJK_RE = /[\u4e00-\u9fff]/;
const CJK_SEGMENT_RE = /[\u4e00-\u9fff]+|[^\u4e00-\u9fff]+/g;

function transliterateMixedText(text: string): string {
  const segments: string[] = [];

  for (const part of text.match(CJK_SEGMENT_RE) ?? []) {
    if (CJK_RE.test(part)) {
      segments.push(pinyin(part, { toneType: "none", separator: " " }));
    } else {
      segments.push(part);
    }
  }

  return segments.join(" ");
}

/** ASCII SEO slug: pinyin for CJK, lowercase hyphenated alphanumerics. */
export function slugifyForUrlKey(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "item";
  }

  const key = transliterateMixedText(trimmed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_KEY_LENGTH)
    .replace(/-$/, "");

  return key || "item";
}

/** Deterministic tag key — same display tag always maps to one key. */
export function tagKeyFromDisplayName(tag: string): string {
  return slugifyForUrlKey(tag);
}
