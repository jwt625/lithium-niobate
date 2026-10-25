// Playwright config for the chapter 01 lane spec only: runs tests/e2e/crystal.spec.ts against the shared Vite dev server
// (http://127.0.0.1:47614/, tmux ln-dev; not started or stopped here), system Chrome. Usage:
//   pnpm exec playwright test -c tests/e2e/crystal.config.ts [--grep "/crystal/poling/"]
// Screenshots go to $CRYSTAL_SHOTS when set (outside the repo), otherwise they are skipped.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /crystal\.spec\.ts/,
  outputDir: "../../test-results/crystal",
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
