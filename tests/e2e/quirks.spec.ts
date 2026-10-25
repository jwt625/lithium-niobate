// Chapter 04 (Quirks) lane checks, run with tests/e2e/quirks.config.ts against the dev server:
// (a) no layout shift: every visible range input to min, max, mid; every segmented and figure button; selects; theme
//     toggle; both modes; 1440 and 390 px; (b) no console errors; (c) no horizontal page scroll at 390 px.
import { test, expect, type Page } from "@playwright/test";
import { settle, withParams } from "./util";

const ROUTES = ["/quirks/", "/quirks/photorefraction/", "/quirks/mgo-doping/", "/quirks/thin-film-photorefraction/", "/quirks/griira/", "/quirks/damage-thresholds/", "/quirks/pyroelectricity/", "/quirks/dc-bias-drift/", "/quirks/thermal-effects/", "/quirks/lithium-out-diffusion/", "/quirks/fabrication-pitfalls/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;

async function drive(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, svg *, #pr-trace, .spine, .q-live"); // .q-live: data bars whose width is the value
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      const was = inp.disabled; inp.disabled = false;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); inp.disabled = was; await frame();
      controls++;
    }
    const buttons = [...document.querySelectorAll<HTMLButtonElement>("main .seg button, main .v-seg button, main .q-vbtn, main .q-tbtn, main .q-card")].filter(vis);
    for (const b of buttons) { b.click(); await frame(); check(`button ${b.closest("[id]")?.id ?? ""}:${(b.textContent ?? "").trim().slice(0, 24)}`); controls++; }
    for (const s of [...document.querySelectorAll<HTMLSelectElement>("main select")].filter(vis)) {
      for (const o of [...s.options]) { s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); await frame(); check(`select ${o.value}`); }
      controls++;
    }
    // hover readouts on data marks
    for (const g of [...document.querySelectorAll<SVGGElement>("main .q-pt, main .q-row, main .q-vrow, main .q-m")].slice(0, 30)) { g.dispatchEvent(new PointerEvent("pointerenter")); await frame(); check("hover"); g.dispatchEvent(new PointerEvent("pointerleave")); }
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const url of ROUTES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`quirks ${url} ${mode} ${w}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    // other lanes edit files on the shared dev server; block the HMR socket so their full reloads cannot navigate this page
    await page.routeWebSocket(/.*/, () => {});
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(withParams(url, mode, "dark"));
    await settle(page, 1500);
    if (w === 390) {
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw, "horizontal scroll at 390").toBeLessThanOrEqual(cw);
    }
    const r = await drive(page);
    console.log(`${url} ${mode} ${w}: ${r.controls} controls, ${r.moved.length} moved`);
    expect(r.moved, r.moved.slice(0, 25).join("\n")).toEqual([]);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

// Effects on (VISUAL motifs and figure animations): run every animated button to completion; no console errors, and the
// page geometry after the animations equals the geometry before.
for (const url of ROUTES) {
  test(`quirks fx ${url}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.routeWebSocket(/.*/, () => {});
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(withParams(url, "visual", "dark"));
    await settle(page, 1200);
    expect(await page.evaluate(() => document.documentElement.dataset.fx)).toBe("on");
    const rects = (): Promise<number[][]> => page.evaluate(() => [...document.querySelectorAll("main [id], main section")].filter((e) => !e.closest("#depth")).map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; }));
    const before = await rects();
    const n = await page.locator("main .q-vbtn:visible").count();
    for (let i = 0; i < n; i++) await page.locator("main .q-vbtn:visible").nth(i).click();
    await page.mouse.move(400, 400); await page.mouse.move(900, 600);
    await page.waitForTimeout(n ? 4500 : 500);
    const after = await rects();
    const ids = await page.evaluate(() => [...document.querySelectorAll("main [id], main section")].filter((e) => !e.closest("#depth")).map((e) => e.id || e.tagName));
    const moved = before.map((b, i) => (after[i] && (b[2] || b[3]) && b.some((v, k) => Math.abs(v - after[i][k]) > 0.5) ? `${ids[i]} ${b.map((v) => v.toFixed(0))} -> ${after[i].map((v) => v.toFixed(0))}` : "")).filter(Boolean);
    expect(moved, moved.join("\n")).toEqual([]);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
