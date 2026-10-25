// Lane P07: run tests/e2e/history.spec.ts against the shared dev server (no build, no web server started).
//   pnpm exec playwright test --config tests/e2e/history.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /history\.spec\.ts/,
  outputDir: "../../test-results/history",
  timeout: 180_000,
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:47614",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
});
