// Lane P08 config: runs tests/e2e/industry.spec.ts against the shared dev server (no build, no webServer).
// pnpm exec playwright test -c tests/e2e/industry.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /industry\.spec\.ts/,
  outputDir: "../../test-results/industry",
  timeout: 180_000,
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:47614",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
});
