// (c) No console errors or page errors on any route in either mode; (d) no horizontal page scroll at 390 px;
// client-side navigation landing -> chapter -> landing keeps the chapter layer off the landing; build output.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { MODES, ROUTES, settle, withParams } from "./util";

for (const mode of MODES) for (const route of ROUTES) {
  test(`console clean and no horizontal scroll ${route} ${mode}`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
    for (const w of [1440, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(withParams(route, mode, "dark"));
      await settle(page, 1500);
      if (w === 390) {
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw, `scrollWidth ${o.sw} > clientWidth ${o.cw}`).toBeLessThanOrEqual(o.cw);
      }
    }
    expect(errs).toEqual([]);
  });
}

test("client-side navigation keeps the chapter layer scoped and figures mounted", async ({ page }) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?mode=tech&theme=dark");
  await settle(page, 1500);
  const padBefore = await page.locator("#fig0 .ctl").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns);
  await page.locator(".nav a", { hasText: "Light" }).click();
  await page.waitForURL("**/light/");
  await page.locator("a", { hasText: "The Pockels effect" }).first().click();
  await page.waitForURL("**/light/pockels-effect/");
  await settle(page, 2500);
  expect(await page.locator("#ntab tbody tr").count()).toBeGreaterThan(20);
  await page.locator("a.brand").click();
  await page.waitForURL((u) => u.pathname === "/");
  await settle(page, 1500);
  expect(await page.locator("#fig0 .ctl").first().evaluate((e) => getComputedStyle(e).gridTemplateColumns)).toBe(padBefore);
  // the landing figures remounted: readouts filled, conoscope painted, cell toggles wired
  await expect(page.locator("#hud-src")).toHaveText("632.8 nm");
  await expect(page.locator("#eo")).toHaveText("0.00 kV/mm");
  const lit = await page.locator("#conoscope").evaluate((c) => { const cv = c as HTMLCanvasElement, g = cv.getContext("2d"); if (!g) return 0; const d = g.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 40) n++; return n; });
  expect(lit).toBeGreaterThan(1000);
  await expect(page.locator("#cell button[data-t=nb]")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#e").fill("3");
  await expect(page.locator("#eo")).toHaveText("3.00 kV/mm");
  await expect(page.locator("#hud-st")).toContainText("biaxial");
  expect(errs).toEqual([]);
});

test("mode and theme persist and are applied before first paint", async ({ page }) => {
  await page.goto("/");
  await settle(page, 500);
  await page.locator(".seg.mode button[data-m=visual]").click();
  await page.locator("#theme-btn").click();
  // record html state and variant visibility when <main> is parsed, before the app's module scripts run
  await page.addInitScript(() => {
    const w = window as unknown as { __early?: unknown };
    new MutationObserver((_, mo) => {
      const main = document.querySelector("main"), v = document.querySelector("[data-variant=visual]");
      if (!main || !v) return;
      mo.disconnect();
      w.__early = { m: document.documentElement.dataset.mode, t: document.documentElement.dataset.theme, visualShown: getComputedStyle(v).display !== "none" };
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/light/pockels-effect/");
  await settle(page, 500);
  expect(await page.evaluate(() => (window as unknown as { __early?: unknown }).__early)).toEqual({ m: "visual", t: "light", visualShown: true });
  await expect(page.locator(".seg.mode button[data-m=visual]")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#theme-btn")).toHaveAttribute("title", "Dark theme");
  // URL parameters override storage without writing it
  await page.goto("/?mode=tech&theme=dark");
  expect(await page.evaluate(() => [document.documentElement.dataset.mode, localStorage.getItem("ln-mode")])).toEqual(["tech", "visual"]);
});

test("build: every route prerendered to build/<route>/index.html", () => {
  for (const r of ["/", "/light/", "/light/pockels-effect/", "/crystal/", "/sound/", "/quirks/", "/making/", "/devices/", "/history/", "/industry/", "/lab/", "/data/", "/library/", "/colophon/"]) {
    const f = `build${r}index.html`;
    expect(fs.existsSync(f), f).toBe(true);
    expect(fs.readFileSync(f, "utf8")).toContain("<main");
  }
  expect(fs.existsSync("build/data/eo-overlap-li2026aa.json")).toBe(true);
});
