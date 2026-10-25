// Playwright config for lane P09 only (/lab/, /data/, /library/, /colophon/): runs tests/e2e/p09.spec.ts against the shared
// Vite dev server http://127.0.0.1:47614/ (tmux ln-dev; never started or stopped here), system Chrome. Usage:
//   pnpm exec playwright test -c tests/e2e/p09.config.ts [--grep "/lab/"]
// Screenshots go to $P09_SHOTS when set (outside the repo), otherwise they are skipped.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /p09\.spec\.ts/,
  outputDir: "../../test-results/p09",
  timeout: 300_000,
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
