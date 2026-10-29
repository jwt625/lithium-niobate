// Playwright config for the BABY mode spec only: runs tests/e2e/baby.spec.ts against the shared Vite dev server
// (http://127.0.0.1:47614/, tmux ln-dev; not started or stopped here). BASE_URL overrides it (a production preview).
// Browser: system Chrome, or the executable in $PW_CHROMIUM (e.g. a cached Playwright headless shell). Usage:
//   pnpm exec playwright test -c tests/e2e/baby.config.ts
// Screenshots go to $BABY_SHOTS when set (outside the repo), otherwise they are skipped.
import { defineConfig } from "@playwright/test";

const exe = process.env.PW_CHROMIUM;
export default defineConfig({
  testDir: ".",
  testMatch: /baby\.spec\.ts/,
  outputDir: "../../test-results/baby",
  timeout: 120_000,
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:47614",
    ...(exe ? {} : { channel: "chrome" }),
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"], ...(exe ? { executablePath: exe } : {}) },
  },
});
