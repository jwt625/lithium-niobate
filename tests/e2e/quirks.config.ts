// Chapter 04 (Quirks) lane config: runs only quirks.spec.ts against the shared dev server (no build, no webServer),
// system Chrome, reduced motion (deterministic) plus an effects project for the console check.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /quirks\.spec\.ts/,
  outputDir: "../../test-results/quirks",
  timeout: 180_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: process.env.QUIRKS_BASE ?? "http://127.0.0.1:47614",
    channel: "chrome",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
});
