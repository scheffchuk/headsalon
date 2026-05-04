import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@convex": path.resolve(__dirname, "./convex"),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    server: { deps: { inline: ["convex-test"] } },
    environment: "jsdom",
    environmentMatchGlobs: [["convex/**/*.test.ts", "node"]],
  },
});
