import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@radix-ui/react-use-controllable-state",
    ],
  },
};

export default nextConfig;
