import { TextEffect } from "@/components/ui/text-effect";

export function LoadingText() {
  return (
    <TextEffect
      preset="fade-in-blur"
      speedReveal={5}
      speedSegment={0.3}
      className="mt-16"
    >
      A Salon for Heads, No Sofa for Ass
    </TextEffect>
  );
}
