"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      return;
    }
    const client = new ConvexReactClient(url);
    // Cache Components prerender forbids Math.random() in ConvexReactClient.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client is an external handle
    setConvex(client);
    return () => {
      void client.close();
    };
  }, []);

  if (!convex) {
    return children;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
