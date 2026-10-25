// Chapter 02 (Light) lane checks, per route, mode and width: (a) no layout shift while every visible control is driven to
// its extremes (range inputs to min, max, mid; every segmented / toggle button; pointer sweeps over [data-sweep] stages;
// theme toggle), (b) no console or page errors, (c) no horizontal scroll at 390 px, (d) optional screenshots in both
// themes ($LIGHT_SHOTS). Relative URLs: runs against the dev server (light.config.ts) or the main preview config.
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const LIGHT_ROUTES = ["/light/", "/light/birefringence/", "/light/pockels-effect/", "/light/second-order/", "/light/parametric/", "/light/third-order/", "/light/eo-combs/", "/light/tfln-waveguides/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const SHOTS = process.env.LIGHT_SHOTS;

const url = (r: string, mode: string, theme: string): string => `${r}?mode=${mode}&theme=${theme}`;
async function settle(page: Page, ms = 2500): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(ms);
}

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, .labels, .v-ell-lab, svg *, #pr-trace, .spine, [data-free]");
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const pth = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${pth(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null && !!e.closest("main");
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const b of [...document.querySelectorAll<HTMLButtonElement>("main .seg button, main .v-seg button, main button[aria-pressed], main button[data-act]")].filter(vis)) {
      b.click(); await frame(); check(`button ${b.closest("[id]")?.id ?? ""}:${b.textContent}`);
      controls++;
    }
    const sweep = (el: Element, type: string): void => {
      const r = el.getBoundingClientRect();
      for (const [fx, fy] of [[0.05, 0.05], [0.5, 0.5], [0.95, 0.9], [0.3, 0.7]]) el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.x + fx * r.width, clientY: r.y + fy * r.height, pointerType: "mouse", pointerId: 1 }));
    };
    for (const el of [...document.querySelectorAll<HTMLElement>("main [data-sweep]")].filter(vis)) { sweep(el, "pointermove"); await frame(); check(`pointer ${el.id || el.className}`); controls++; }
    await new Promise((r) => setTimeout(r, 400)); await frame(); check("settled");
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const route of LIGHT_ROUTES) for (const mode of MODES) {
  test(`light ${route} ${mode}: console, overflow, layout shift`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(url(route, mode, "dark"));
      await settle(page, 2500);
      if (w === 390) {
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw, `${route} ${mode}: scrollWidth ${o.sw} > clientWidth ${o.cw}`).toBeLessThanOrEqual(o.cw);
      }
      const r = await driveControls(page);
      console.log(`${route} ${mode} ${w}: ${r.controls} controls driven, ${r.moved.length} elements moved`);
      expect(r.moved, r.moved.slice(0, 25).join("\n")).toEqual([]);
    }
    expect(errs).toEqual([]);
  });
}

if (SHOTS) {
  for (const route of LIGHT_ROUTES) for (const mode of MODES) for (const theme of ["dark", "light"]) {
    test(`light shots ${route} ${mode} ${theme}`, async ({ page }) => {
      fs.mkdirSync(SHOTS, { recursive: true });
      const name = (route.replace(/\//g, "_").replace(/^_|_$/g, "") || "light");
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(url(route, mode, theme));
        await settle(page, 3500);
        await page.screenshot({ path: path.join(SHOTS, `${name}-${mode}-${theme}-${w}.png`), fullPage: true });
      }
    });
  }
}
