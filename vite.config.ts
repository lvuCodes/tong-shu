import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built site also runs from file:// or a subpath.
  base: "./",
  plugins: [react()],
  server: { port: 5818, watch: { ignored: ["**/coverage/**", "**/dist/**"] } },
  test: {
    // Site tests only — e2e/ belongs to Playwright.
    include: ["src/**/*.test.{ts,tsx}"],
    // Provide an in-memory localStorage for every test (see the setup file).
    // Test files opt into jsdom per-file via `// @vitest-environment jsdom`.
    setupFiles: ["./src/test-setup.ts"],
    // Inline the package so Vite transforms its bundled CSS imports; left
    // externalized, Node's ESM loader chokes on `@lvucodes/ui`'s `.css` side effects.
    server: { deps: { inline: ["@lvucodes/ui"] } },
  },
});
