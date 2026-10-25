// Chapter 03 (Sound) page checks: no layout shift at control extremes (every range input to min, max, mid; every
// segmented button; pointer sweeps over the VISUAL stages; theme toggle) in TECH and VISUAL at 1440 and 390 px; no
// console errors; no horizontal scroll at 390 px. Runs against the production preview (default config) or the dev
// server (SOUND_BASE env var, own config).
import { test, expect, type Page } from "@playwright/test";
import { MODES, WIDTHS, settle, withParams } from "./util";

export const SOUND_ROUTES = ["/sound/", "/sound/piezoelectricity/", "/sound/bulk-waves/", "/sound/surface-waves/", "/sound/cuts/", "/sound/idt-filters/", "/sound/acousto-optics/", "/sound/phononics/"];
const BASE = process.env.SOUND_BASE ?? "";

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, .labels, .lab, svg *, #pr-trace, .spine");
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      const s = snap();
      s.forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const b of [...document.querySelectorAll<HTMLButtonElement>("main .seg:not(.mode) button, main .v-seg button")].filter(vis)) {
      b.click(); await frame(); check(`button ${b.closest("[id]")?.id ?? ""}:${b.textContent}`);
      controls++;
    }
    for (const b of [...document.querySelectorAll<HTMLButtonElement>("main .seg:not(.mode) button.on, main .v-seg button.on")].filter(vis)) b.click(); // restore defaults
    const sweep = (el: Element, type: string): void => {
      const r = el.getBoundingClientRect();
      for (const [fx, fy] of [[0.05, 0.05], [0.5, 0.5], [0.95, 0.9], [0.3, 0.7]]) el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.x + fx * r.width, clientY: r.y + fy * r.height, pointerType: "mouse", pointerId: 1 }));
    };
    for (const el of [...document.querySelectorAll<HTMLElement>(".snd-stage, .snd-svg")].filter(vis)) {
      sweep(el, "pointerdown"); sweep(el, "pointermove"); el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
      await frame(); check(`pointer ${el.closest("[id]")?.id ?? el.className}`); controls++;
    }
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const url of SOUND_ROUTES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`sound: layout, console, overflow ${url} ${mode} ${w}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + withParams(url, mode, "dark"));
    await settle(page, 2000);
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (w === 390) expect(sw[0], `horizontal scroll at 390: ${sw.join(" > ")}`).toBeLessThanOrEqual(sw[1]);
    const r = await driveControls(page);
    console.log(`${url} ${mode} ${w}: ${r.controls} controls driven, ${r.moved.length} elements moved`);
    expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
