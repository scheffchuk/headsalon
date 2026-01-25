"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <Button className="rounded-full" variant="ghost" onClick={() => router.back()}>
      <ArrowLeft />
    </Button>
  );
}
