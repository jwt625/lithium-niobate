// Chapter 01 (The crystal) lane checks, run against the dev server with tests/e2e/crystal.config.ts:
//   (a) no layout shift with every control at its extremes (range inputs min / max / mid, every segmented button, selects,
//       buttons marked data-drive, pointer sweeps over figure stages marked data-sweep or the cell stages, theme toggle),
//       TECH and VISUAL, 1440 and 390 px;
//   (b) no console errors or page errors; (c) no horizontal page scroll at 390 px;
//   (d) with CRYSTAL_SHOTS=<dir>: full-page screenshots, both modes, both themes, 1440 and 390 (for visual review).
// Filter one section: --grep "/crystal/poling/".
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const CRYSTAL_ROUTES = [
  "/crystal/", "/crystal/lattice/", "/crystal/polarization/", "/crystal/ferroelectric-constants/", "/crystal/composition/", "/crystal/defects/",
  "/crystal/dopants/", "/crystal/symmetry/", "/crystal/domains/", "/crystal/poling/", "/crystal/domain-walls/",
];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const url = (r: string, mode: string, theme: string): string => `${r}?mode=${mode}&theme=${theme}`;

async function settle(page: Page, ms = 1500): Promise<void> {
  // the dev server sometimes reloads a page once right after first load (Vite reconnect); wait until navigation is quiet
  let last = Date.now();
  const onNav = (f: { parentFrame(): unknown }): void => { if (!f.parentFrame()) last = Date.now(); };
  page.on("framenavigated", onNav);
  await page.waitForLoadState("networkidle");
  while (Date.now() - last < 1500) { await page.waitForTimeout(250); }
  page.off("framenavigated", onNav);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // lazy figures mount on intersection: walk the page once
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(ms);
}

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, .labels, svg *, #pr-trace, .spine, .cellpop, [data-noshift]");
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const pathOf = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${pathOf(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
    const where = (e: Element): string => e.closest("[id]")?.id ?? "";
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); await frame(); check(`${where(inp)} ${inp.id || inp.name}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const sel of [...document.querySelectorAll<HTMLSelectElement>("main select")].filter(vis)) {
      const v0 = sel.value;
      for (const o of [...sel.options]) { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); await frame(); check(`${where(sel)} select=${o.value}`); }
      sel.value = v0; sel.dispatchEvent(new Event("change", { bubbles: true })); await frame();
      controls++;
    }
    const buttons = [...document.querySelectorAll<HTMLButtonElement>("main .seg:not(.mode) button, main .v-seg button, main button[data-drive], main button[data-t], main button[data-cx]")].filter(vis);
    for (const b of [...new Set(buttons)]) { b.click(); await frame(); check(`button ${where(b)}:${(b.textContent ?? "").trim()}`); controls++; }
    // second pass: buttons return to their first state where they toggle
    for (const b of [...new Set(buttons)]) { if (b.matches("[data-t], [data-cx], [aria-pressed]")) { b.click(); await frame(); check(`button again ${where(b)}:${(b.textContent ?? "").trim()}`); } }
    const sweep = (el: Element): void => {
      const r = el.getBoundingClientRect();
      for (const [fx, fy] of [[0.05, 0.05], [0.5, 0.5], [0.95, 0.9], [0.3, 0.7]]) {
        const o = { bubbles: true, clientX: r.x + fx * r.width, clientY: r.y + fy * r.height, pointerType: "mouse", pointerId: 1 };
        el.dispatchEvent(new PointerEvent("pointermove", o)); el.dispatchEvent(new MouseEvent("mousemove", o));
      }
    };
    for (const el of [...document.querySelectorAll<HTMLElement>("main .cstage, main #fig1 .stage, main [data-sweep]")].filter(vis)) { sweep(el); await frame(); check(`pointer ${where(el) || el.className}`); controls++; }
    await new Promise((r) => setTimeout(r, 600)); // running animations (poling bench) advance; layout must hold
    check("after 600 ms");
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const route of CRYSTAL_ROUTES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`crystal ${route} ${mode} ${w}: no shift at control extremes, console clean, no horizontal scroll`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(url(route, mode, "dark"));
    await settle(page);
    if (w === 390) {
      const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(o.sw, `scrollWidth ${o.sw} > clientWidth ${o.cw}`).toBeLessThanOrEqual(o.cw);
    }
    const r = await driveControls(page);
    console.log(`${route} ${mode} ${w}: ${r.controls} controls driven, ${r.moved.length} elements moved`);
    expect(r.moved, r.moved.slice(0, 25).join("\n")).toEqual([]);
    if (w === 390) {
      const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(o.sw, `after controls: scrollWidth ${o.sw} > clientWidth ${o.cw}`).toBeLessThanOrEqual(o.cw);
    }
    expect(errs).toEqual([]);
  });
}

const SHOTS = process.env.CRYSTAL_SHOTS;
if (SHOTS) for (const route of CRYSTAL_ROUTES) for (const mode of MODES) for (const theme of ["dark", "light"] as const) for (const w of WIDTHS) {
  test(`crystal shot ${route} ${mode} ${theme} ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(url(route, mode, theme));
    await settle(page, 2500);
    const slug = route.split("/").filter(Boolean).slice(1).join("-") || "index";
    fs.mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: path.join(SHOTS, `${slug}-${mode}-${theme}-${w}.png`), fullPage: true });
  });
}
