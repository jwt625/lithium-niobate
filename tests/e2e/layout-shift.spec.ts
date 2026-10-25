// (b) No layout shift: drive every visible control to its extremes (range inputs to min, max, mid; every segmented
// button) and assert that no element of the page moved or resized (port of the mockup checks, DevLog-003b sec. 12.2).
// Also: no element with an id moves between first paint and data load (FEM json, cell json, exact conoscope frames).
import { test, expect, type Page } from "@playwright/test";
import { MODES, WIDTHS, settle, withParams } from "./util";

const PAGES = ["/", "/light/pockels-effect/", "/light/birefringence/", "/light/second-order/", "/light/parametric/", "/light/third-order/", "/light/eo-combs/", "/light/tfln-waveguides/", "/industry/platforms/", "/lab/phase-matching/", "/lab/tensors/", "/data/dispersion/"];

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    // rows of a table body are skipped: sorting or filtering reorders rows on purpose; the table box itself is checked
    const skip = (e: Element): boolean => !!e.closest(".pop, .labels, .v-ell-lab, svg *, #pr-trace, .spine, tbody tr");
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      const s = snap();
      s.forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; /* shown/hidden swap (theme icons): siblings catch any shift */ if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null;
    let controls = 0;
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const b of [...document.querySelectorAll<HTMLButtonElement>(".seg:not(.mode) button, .v-seg button")].filter(vis)) {
      b.click(); await frame(); check(`button ${b.closest("[id]")?.id ?? ""}:${b.textContent}`);
      controls++;
    }
    // pointer-driven readouts: probe sweeps over the heatmaps, the cell stages, the ellipsoid; depth-profile bars
    const sweep = (el: Element, type: string): void => {
      const r = el.getBoundingClientRect();
      for (const [fx, fy] of [[0.05, 0.05], [0.5, 0.5], [0.95, 0.9], [0.3, 0.7]]) el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.x + fx * r.width, clientY: r.y + fy * r.height, pointerType: "mouse", pointerId: 1 }));
    };
    for (const el of [...document.querySelectorAll<HTMLElement>(".fig > canvas, .cstage, #fig1 .stage, #v-ell-stage")].filter(vis)) {
      sweep(el, "pointermove"); await frame(); check(`pointer ${el.closest("[id]")?.id ?? el.className}`); controls++;
    }
    for (const el of [...document.querySelectorAll<SVGElement>("#fd-svg .dpbar")].slice(0, 40)) el.dispatchEvent(new PointerEvent("pointerenter"));
    await frame(); check("depth bars");
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const url of PAGES) for (const mode of MODES) for (const w of WIDTHS) {
  test(`no layout shift at control extremes ${url} ${mode} ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(withParams(url, mode, "dark"));
    await settle(page, 3000);
    const r = await driveControls(page);
    console.log(`${url} ${mode} ${w}: ${r.controls} controls driven, ${r.moved.length} elements moved`);
    expect(r.controls).toBeGreaterThan(3);
    expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
  });

  test(`no layout shift on data load ${url} ${mode} ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    // hold the figure data until the early snapshot is taken
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => { release = r; });
    await page.route("**/data/*.json", async (route) => { await gate; await route.continue(); });
    const rects = (): Promise<Record<string, number[]>> => page.evaluate(() => Object.fromEntries([...document.querySelectorAll("main [id], header [id], footer [id]")].filter((e) => !e.closest(".pop, svg *")).map((e) => { const r = e.getBoundingClientRect(); return [e.id, [r.x, r.y + scrollY, r.width, r.height]]; })));
    await page.goto(withParams(url, mode, "dark"), { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(300);
    const early = await rects();
    release();
    await settle(page, 4000);
    const late = await rects();
    const moved = Object.keys(early).filter((k) => late[k] && early[k].some((v, i) => Math.abs(v - late[k][i]) > 0.5));
    expect(moved, moved.map((k) => `${k}: ${early[k].map((v) => v.toFixed(1))} -> ${late[k].map((v) => v.toFixed(1))}`).join("\n")).toEqual([]);
  });
}
