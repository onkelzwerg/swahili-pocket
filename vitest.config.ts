import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Bewusst eigenständig statt vite.config.ts wiederzuverwenden:
// die App-Config zieht Cloudflare-/TanStack-Start-Plugins mit, die für
// reine Logik-Unittests weder nötig noch lauffähig sind.
// Getestet wird nur src/lib — reine Funktionen ohne DOM (siehe Leitplanke 5).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
