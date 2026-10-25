// Playwright on the system Chrome (channel "chrome"; no browser download). Tests run against the production build served
// by `vite preview` on 47615 (prerendered pages, what ships). The approved mockup must be served at http://127.0.0.1:47613/
// for the parity tests (tests/e2e/parity.spec.ts); they fail when it is not reachable unless PARITY_SKIP=1.
// Project "default" emulates reduced motion (deterministic screenshots); project "fx" runs the page checks with effects on.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results/artifacts",
  timeout: 120_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"], ["json", { outputFile: "test-results/report.json" }]],
  use: {
    baseURL: "http://127.0.0.1:47615",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  projects: [
    { name: "default" },
    { name: "fx", testMatch: /pages\.spec\.ts/, use: { reducedMotion: "no-preference" } },
  ],
  webServer: {
    command: "pnpm build && pnpm preview",
    url: "http://127.0.0.1:47615/",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
