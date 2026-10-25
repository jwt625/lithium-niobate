// Chapter 05 suite against the shared dev server (http://127.0.0.1:47614, tmux ln-dev; not started or stopped here).
// Usage: pnpm exec playwright test -c tests/e2e/making.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /making\.spec\.ts/,
  outputDir: "../../test-results/making",
  timeout: 120_000,
  fullyParallel: true,
  workers: 3,
  retries: 1, // the shared dev server reloads pages when other lanes edit files (HMR)
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:47614",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
});
