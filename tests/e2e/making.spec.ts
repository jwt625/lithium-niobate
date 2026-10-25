// Chapter 05 (Making): console errors, 390 px overflow, layout shift at control extremes, layout shift across every
// Process viewer step in both routes, determinism of the viewer (forward vs backward), URL hash state, implant-range gap.
// Runs against the shared dev server with tests/e2e/making.config.ts, or the preview build with the main config.
// Layout-shift rule: every element of the page keeps its box; text may reflow only inside boxes of fixed size (listed
// in FIXED), whose own boxes are checked.
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/making/", "/making/raw-materials/", "/making/crystal-growth/", "/making/wafers/", "/making/bulk-waveguides/", "/making/thin-film/", "/making/wafer-suppliers/", "/making/patterning/", "/making/cladding/", "/making/electrodes/", "/making/poling/", "/making/packaging/", "/making/process-viewer/"];
const FIG_ROUTES = ["/making/raw-materials/", "/making/crystal-growth/", "/making/wafers/", "/making/bulk-waveguides/", "/making/thin-film/", "/making/patterning/", "/making/cladding/", "/making/electrodes/", "/making/poling/", "/making/packaging/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const FIXED = ".mk-legend, .mk-v-legend, .mk-v-giz, .mk-v-gap, .mk-scale, .mk-gizmo, .mk-xshead, .mk-note, .mk-proft, .v-cap, .mk-card, .mk-v-params li, .mk-hud td, .mk-ro, .v-hud dd, .mk-v-hud dd, .mk-steps, .mk-v-name, .ph, .ctl output, .v-ctl output, .mk-v-no, .mk-t, .mk-sc-name, .kv td";
const SKIP = ".pop, svg *, pre, .spine, #pr-trace, .mk-v-a *, vite-error-overlay, .depth"; // .depth is sticky (moves with page scroll by design)

const url = (path: string, mode: string, theme = "dark"): string => { const [p, h] = path.split("#"); return `${p}?mode=${mode}&theme=${theme}${h ? "#" + h : ""}`; };

async function open(page: Page, path: string, mode: string, w: number): Promise<string[]> {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(url(path, mode));
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(1500);
  await page.waitForLoadState("networkidle"); // the dev server may reload once after optimizing a lazily imported dependency
  await page.evaluate(() => document.querySelectorAll("vite-error-overlay").forEach((e) => e.remove()));
  return errs;
}

/** Install the snapshot helper in the page: window.__mk = { base(), diff(label) }. */
async function installSnap(page: Page, scope = "header, main, footer"): Promise<void> {
  await page.evaluate(({ scope, FIXED, SKIP }) => {
    const els = [...document.querySelectorAll(`${scope.split(",").map((s) => s.trim() + " *").join(", ")}`)].filter((e) => !e.closest(SKIP) && !(e.parentElement && e.parentElement.closest(FIXED)));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    let base = snap();
    const moved = new Set<string>();
    (window as unknown as { __mk: unknown }).__mk = {
      base: () => { base = snap(); },
      diff: (label: string) => { const s = snap(); s.forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${label}] ${b.map((x) => x.toFixed(0))} -> ${v.map((x) => x.toFixed(0))}`); }); },
      moved: () => [...moved],
      count: () => els.length,
    };
  }, { scope, FIXED, SKIP });
}

const frame = (page: Page): Promise<void> => page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));

test.describe.configure({ mode: "parallel" });

for (const path of ROUTES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`making: console and overflow ${path} ${mode} ${w}`, async ({ page }) => {
    const errs = await open(page, path, mode, w);
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw[0], "horizontal scroll").toBeLessThanOrEqual(sw[1]);
    expect(errs.filter((e) => !/vite|hmr|\[vite\]/i.test(e)), errs.join("\n")).toEqual([]);
  });
}

for (const path of [...FIG_ROUTES, "/making/process-viewer/"]) for (const mode of MODES) for (const w of WIDTHS) {
  test(`making: no layout shift at control extremes ${path} ${mode} ${w}`, async ({ page }) => {
    test.setTimeout(240_000);
    await open(page, path, mode, w);
    await installSnap(page);
    const n = await page.evaluate(async () => {
      const mk = (window as unknown as { __mk: { diff: (l: string) => void } }).__mk;
      const fr = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
      let c = 0;
      for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
        const v0 = inp.value, lo = +inp.min, hi = +inp.max;
        for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await fr(); mk.diff(`${inp.id || inp.getAttribute("aria-label")}=${v}`); }
        inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await fr();
        c++;
      }
      for (const b of [...document.querySelectorAll<HTMLButtonElement>("main .seg:not(.mode) button, main .v-seg button")].filter(vis)) {
        b.click(); await fr(); mk.diff(`button ${b.closest("[aria-label]")?.getAttribute("aria-label") ?? ""}:${b.textContent?.trim()}`); c++;
      }
      // stop any playback started by a transport button
      for (const b of [...document.querySelectorAll<HTMLButtonElement>("main button.on")].filter((x) => /PAUSE|Play or pause/.test(x.textContent + (x.getAttribute("aria-label") ?? "")))) b.click();
      const theme = document.getElementById("theme-btn");
      if (theme) { theme.click(); await fr(); await fr(); mk.diff("theme light"); theme.click(); await fr(); await fr(); mk.diff("theme dark"); }
      return c;
    });
    const moved = await page.evaluate(() => (window as unknown as { __mk: { moved: () => string[] } }).__mk.moved());
    console.log(`${path} ${mode} ${w}: ${n} controls, ${moved.length} moved`);
    expect(n).toBeGreaterThan(0);
    expect(moved, moved.slice(0, 15).join("\n")).toEqual([]);
  });
}

for (const mode of MODES) for (const w of WIDTHS) {
  test(`making: viewer layout fixed across all steps ${mode} ${w}`, async ({ page }) => {
    test.setTimeout(300_000);
    await open(page, "/making/process-viewer/", mode, w);
    await installSnap(page);
    for (const route of ["ridge_duv", "strip_dlc"]) {
      const btn = page.locator(`#pv-main [data-variant="${mode}"] [aria-label="Route"] button`).nth(route === "ridge_duv" ? 0 : 1);
      await btn.click();
      await frame(page);
      const N = await page.evaluate(() => { const i = document.querySelector<HTMLInputElement>(`#pv-main [data-variant] input[type=range]:not([style*="display: none"])`); return i ? +i.max : 0; });
      expect(N).toBeGreaterThan(19);
      for (let k = 0; k < N; k++) for (const t of [0, 0.5, 1]) {
        await page.evaluate(({ v, mode }) => { const i = document.querySelector<HTMLInputElement>(`#pv-main [data-variant="${mode}"] .mk-track input`); if (!i) throw new Error("no scrub"); i.value = String(v); i.dispatchEvent(new Event("input", { bubbles: true })); }, { v: Math.min(N, k + t), mode });
        await frame(page);
        await page.evaluate((l) => (window as unknown as { __mk: { diff: (l: string) => void } }).__mk.diff(l), `${route} ${k + 1} t=${t}`);
      }
    }
    const moved = await page.evaluate(() => (window as unknown as { __mk: { moved: () => string[] } }).__mk.moved());
    expect(moved, moved.slice(0, 15).join("\n")).toEqual([]);
  });
}

test("making: viewer is deterministic (forward vs backward ASCII) and keeps hash state", async ({ page }) => {
  test.setTimeout(240_000);
  await open(page, "/making/process-viewer/#route=strip_dlc&step=s16s_ln_etch&t=0.40", "tech", 1440);
  await expect(page.locator("#pv-main .mk-pv-t .mk-stepno")).toHaveText("16/21");
  const scrub = page.locator("#pv-main .mk-pv-t .mk-track input");
  for (const route of [0, 1]) {
    await page.locator('#pv-main .mk-pv-t [aria-label="Route"] button').nth(route).click();
    const N = +(await scrub.getAttribute("max") ?? 0);
    const vals: number[] = [];
    for (let k = 0; k < N; k++) for (const t of [0, 0.25, 0.5, 0.75, 1]) vals.push(Math.min(N, k + t));
    const read = async (v: number): Promise<string> => { await scrub.evaluate((i: HTMLInputElement, v) => { i.value = String(v); i.dispatchEvent(new Event("input", { bubbles: true })); }, v); await frame(page); return page.locator("#pv-main .mk-pv-t .mk-ascii").innerText(); };
    const fwd: string[] = [];
    for (const v of vals) fwd.push(await read(v));
    const bwd: string[] = [];
    for (const v of [...vals].reverse()) bwd.push(await read(v));
    bwd.reverse();
    const bad = fwd.map((a, i) => (a === bwd[i] ? -1 : i)).filter((i) => i >= 0);
    expect(bad, `mismatch at scrub values ${bad.map((i) => vals[i]).join(", ")}`).toEqual([]);
  }
  await page.waitForTimeout(400);
  expect(page.url()).toContain("route=strip_dlc");
});

test("making: implant range shows the data gap away from the reported point", async ({ page }) => {
  await open(page, "/making/thin-film/", "tech", 1440);
  const E = page.locator("#sl-E");
  await E.evaluate((i: HTMLInputElement) => { i.value = "250"; i.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.locator("[data-variant=tech] .mk-ro").filter({ hasText: "250 keV" })).toContainText("no verified data");
  await E.evaluate((i: HTMLInputElement) => { i.value = "195"; i.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.locator("[data-variant=tech] .mk-ro").filter({ hasText: "195 keV" })).toContainText("0.68 µm");
});
