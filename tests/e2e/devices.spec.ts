// Chapter 06 Devices (lane P06): every route, TECH and VISUAL, 1440 and 390 px.
// (a) no console errors, (b) no horizontal scroll at 390 px, (c) no layout shift while every control is driven to its
// extremes (range min / max / mid, segmented and toggle buttons, selects first / last, hover cards on marks),
// (d) atlas chart point counts equal chart-specs.md acceptance counts.
// Runs against any server: the root config (preview on 47615) or DEVICES_BASE (e.g. the shared dev server 47614).
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.DEVICES_BASE ?? "";
const ROUTES = ["/devices/", "/devices/modulators/", "/devices/traveling-wave/", "/devices/tradeoffs/", "/devices/frequency-conversion/", "/devices/parametric/",
  "/devices/combs/", "/devices/quantum/", "/devices/acousto-optics/", "/devices/rf-filters/", "/devices/heterogeneous/", "/devices/tantalate/", "/devices/records/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const url = (p: string, mode: string): string => `${BASE}${p}?mode=${mode}&theme=dark`;

async function open(page: Page, p: string, mode: string, w: number): Promise<string[]> {
  const errs: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(url(p, mode));
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(1500);
  return errs;
}

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, .dv-hc, svg, canvas, [data-p] *, [data-scene] *, #pr-trace, .spine, header, footer");
    const els = [...document.querySelectorAll("main *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
    const inMain = (e: Element): boolean => !!e.closest("main");
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const sel of [...document.querySelectorAll<HTMLSelectElement>("main select")].filter(vis)) {
      const v0 = sel.value;
      for (const i of [1, sel.options.length - 1, 0]) { if (!sel.options[i]) continue; sel.value = sel.options[i].value; sel.dispatchEvent(new Event("change", { bubbles: true })); await frame(); check(`${sel.id}#${i}`); }
      sel.value = v0; sel.dispatchEvent(new Event("change", { bubbles: true })); await frame();
      controls++;
    }
    const buttons = [...document.querySelectorAll<HTMLButtonElement>("main .seg button, main .v-seg button, main button[data-t], main button[data-col]")].filter((b) => vis(b) && inMain(b));
    for (const b of buttons) { b.click(); await frame(); check(`button ${b.closest("[data-fig]")?.getAttribute("data-fig") ?? ""}:${b.textContent?.trim()}`); controls++; }
    for (const b of buttons) { if (b.matches("button[data-t], button[data-col]")) { b.click(); await frame(); } }
    // hover cards: focus the first marks of every visible plot
    for (const m of [...document.querySelectorAll<SVGElement>("main [data-p] [data-id]")].filter((m) => (m as unknown as HTMLElement).getClientRects().length).slice(0, 12)) {
      m.dispatchEvent(new PointerEvent("pointerover", { bubbles: true })); await new Promise((r) => setTimeout(r, 60)); await frame(); check(`hover ${m.getAttribute("data-id")}`);
      m.dispatchEvent(new PointerEvent("pointerout", { bubbles: true })); controls++;
    }
    return { moved: [...moved], controls };
  });
}

for (const p of ROUTES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`devices ${p} ${mode} ${w}: console, overflow, layout shift`, async ({ page }) => {
    test.setTimeout(300_000);
    // a dev server may reload the page (HMR from unrelated edits); re-open and drive again when that happens
    let errs: string[] = [], r: { moved: string[]; controls: number } | null = null;
    for (let attempt = 0; attempt < 3 && !r; attempt++) {
      errs = await open(page, p, mode, w);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (w === 390) expect(sw, `horizontal scroll at 390: ${sw} > ${cw}`).toBeLessThanOrEqual(cw);
      try { r = await driveControls(page); } catch (e) { if (!/context was destroyed|navigation/i.test(String(e))) throw e; }
    }
    if (!r) throw new Error("page kept reloading");
    console.log(`${p} ${mode} ${w}: ${r.controls} controls driven, ${r.moved.length} elements moved`);
    expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
    expect(errs.filter((e) => !/favicon/.test(e)), errs.join("\n")).toEqual([]);
  });
}

// (d) acceptance counts (chart-specs.md), counted as marks in the prerendered / first-rendered TECH plots
const COUNTS: [string, string, number][] = [
  ["/devices/tradeoffs/", "a1", 71],
  ["/devices/modulators/", "f603", 71],
  ["/devices/modulators/", "f607", 13],
  ["/devices/traveling-wave/", "a2", 28],
];
for (const [p, fig, n] of COUNTS) {
  test(`devices ${p} ${fig}: ${n} atlas marks`, async ({ page }) => {
    await open(page, p, "tech", 1440);
    const got = await page.evaluate((f) => {
      const box = document.querySelector(`[data-fig="${f}"][data-look="tech"]`);
      const ids = new Set([...(box?.querySelectorAll("[data-p] g.pt:not(.fut) [data-id]") ?? [])].map((e) => e.getAttribute("data-id")));
      return ids.size;
    }, fig);
    expect(got).toBe(n);
  });
}
