/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@radix-ui/react-use-controllable-state",
    ],
  },
};

module.exports = nextConfig;
