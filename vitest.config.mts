import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Tests cover the framework-free logic in `src/mascot/`: no DOM is needed.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
