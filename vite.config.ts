import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

// Serves the gitignored local/ defaults (personal people and event) to the dev
// server only, so a build or a test never bundles personal data.
function localDefaults(): Plugin {
  const id = "virtual:local-defaults";
  let enabled = false;
  const read = (name: string) => {
    const file = resolve(__dirname, "local", name);
    return existsSync(file) ? readFileSync(file, "utf8") : "null";
  };
  return {
    name: "local-defaults",
    configResolved(config) {
      enabled = config.command === "serve" && config.mode !== "test";
    },
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(loaded) {
      if (loaded !== `\0${id}`) return;
      if (!enabled) return "export default null;";
      return `export default { couple: ${read("couple.json")}, app: ${read("app-defaults.json")} };`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built site also runs from file:// or a subpath.
  base: "./",
  plugins: [react(), localDefaults()],
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
