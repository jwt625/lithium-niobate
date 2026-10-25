// Chapter 07 History (/history/**): layout shift under every control (log filters, timeline ticks and chapter cards,
// dispute rows, hero interactives and every chapter figure), console errors, no horizontal scroll at 390 px, and the
// VISUAL "timeline remembers" trace. Both modes, 1440 and 390 px. Runs under the default config (preview build) or
// tests/e2e/history.config.ts (shared dev server).
import { test, expect, type Page } from "@playwright/test";

const SLUGS = ["a-crystal-on-paper", "bell-labs-grows-a-crystal", "damage-to-memory", "sound-on-a-crystal", "light-in-a-channel", "taming-the-crystal", "the-internets-modulator", "peeling-the-crystal", "thin-film-renaissance", "ai-data-center"];
const ROUTES = ["/history/", ...SLUGS.map((s) => `/history/${s}/`)];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const url = (path: string, mode: string, theme = "dark"): string => `${path}?mode=${mode}&theme=${theme}`;

async function settle(page: Page, ms = 1200): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(ms);
}

/** Drive the controls selected by `which` and report elements (outside scroll boxes and SVG) that moved or resized. */
async function drive(page: Page, which: "landing" | "figures"): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async (which) => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const INNER = ".hx-logbox, .hx-tl-box, .hx-tk-box, .hx-vtk-box, .hx-dsp-box, .hx-tl-chs, .hx-strip, .hx-ft-p, .hx-vft-p";
    const skip = (e: Element): boolean => !!e.closest(".pop, svg *, #pr-trace, .spine") || !!e.parentElement?.closest(INNER);
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].slice(0, 2).join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; });
    const base = snap(), h0 = document.documentElement.scrollHeight;
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b || (!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
      if (Math.abs(document.documentElement.scrollHeight - h0) > 0.5) moved.add(`page height ${h0} -> ${document.documentElement.scrollHeight} [${what}]`);
    };
    const vis = (e: Element): boolean => (e as HTMLElement).offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
    let controls = 0;
    const click = async (b: HTMLElement, what: string): Promise<void> => { b.click(); await frame(); check(what); controls++; };
    const scope = which === "landing" ? document.querySelector("main") as HTMLElement : document.querySelector("main") as HTMLElement;
    const figs = which === "landing" ? [scope] : [...scope.querySelectorAll<HTMLElement>(".hx-fig")];
    for (const f of figs) {
      for (const inp of [...f.querySelectorAll<HTMLInputElement>('input[type="range"]')].filter(vis)) {
        const v0 = inp.value, lo = +inp.min, hi = +inp.max;
        for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
        inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); controls++;
      }
      const buttons = [...f.querySelectorAll<HTMLElement>(".seg:not(.mode) button, .v-seg button, .hx-vst, .hx-chc-b, .hx-clear, .hx-dsp-q, .hx-ft-tree button, .hx-vst2-ticks button")].filter(vis);
      for (const b of buttons) await click(b, `button ${b.closest("[id]")?.id ?? ""}:${(b.textContent ?? "").trim().slice(0, 24)}`);
      // second pass restores toggles and exercises combined states (e.g. all status filters off: empty result)
      for (const b of buttons) { if ((b as HTMLButtonElement).disabled) continue; b.click(); }
      await frame(); check("second pass"); controls++;
      for (const g of [...f.querySelectorAll<SVGGElement>(".hx-tk, .hx-vft-n")].filter((g) => (g.closest("svg") as unknown as HTMLElement | null)?.getBoundingClientRect().width).slice(0, 12)) {
        g.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true })); g.dispatchEvent(new MouseEvent("click", { bubbles: true })); await frame(); check(`svg ${g.getAttribute("aria-label")?.slice(0, 30)}`); controls++;
      }
      for (const c of [...f.querySelectorAll<HTMLCanvasElement>(".hx-pl-c")].filter(vis)) {
        const r = c.getBoundingClientRect();
        for (const [fx, fy] of [[0.2, 0.2], [0.5, 0.5], [0.8, 0.7]]) c.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: r.x + fx * r.width, clientY: r.y + fy * r.height, pointerType: "mouse" }));
        await new Promise((r) => setTimeout(r, 300)); check("plate writing"); c.dispatchEvent(new PointerEvent("pointerleave")); controls++;
      }
    }
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); }
    return { moved: [...moved], controls };
  }, which);
}

for (const mode of MODES) for (const w of WIDTHS) {
  test(`history landing: no layout shift ${mode} ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(url("/history/", mode));
    await settle(page);
    const r = await drive(page, "landing");
    expect(r.controls).toBeGreaterThan(8);
    expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
  });

  for (const s of SLUGS) {
    test(`history ${s}: figures without layout shift ${mode} ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(url(`/history/${s}/`, mode));
      await settle(page);
      const r = await drive(page, "figures");
      if (s !== "thin-film-renaissance") expect(r.controls).toBeGreaterThan(0);
      expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
    });
  }

  test(`history routes: console clean, no horizontal scroll ${mode} ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${page.url()}: ${m.text()}`); });
    page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
    for (const r of ROUTES) {
      await page.goto(url(r, mode));
      await settle(page, 400);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw, `${r} scrollWidth`).toBeLessThanOrEqual(cw);
      await expect(page.locator("main h1")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test.describe("timeline remembers (VISUAL, effects on)", () => {
  test.use({ reducedMotion: "no-preference" });
  test("trace appears only after the 1966 card has been in view", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url("/history/", "visual"));
    await settle(page);
    const band = page.locator("#hx-tl");
    const alpha = (): Promise<number> => page.evaluate(() => { const c = document.querySelector<HTMLCanvasElement>(".hx-joy"); const d = c?.getContext("2d")?.getImageData(0, 0, c.width, c.height).data; let s = 0; if (d) for (let i = 3; i < d.length; i += 4) s += d[i]; return s; });
    const sweep = async (): Promise<void> => { const b = await band.boundingBox(); if (!b) return; const y = Math.max(b.y, 0) + 40; await page.mouse.move(b.x + 40, y); for (let k = 1; k <= 20; k++) await page.mouse.move(b.x + 40 + k * 30, y + (k % 2) * 40); };
    // band top at the viewport top: the axis and chapter cards are in view, the 1966 card (third row of the box) is not
    await band.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY }));
    await page.locator(".hx-tl-box").evaluate((b) => b.scrollTo({ top: 0 }));
    await page.waitForTimeout(300);
    await sweep();
    expect(await alpha()).toBe(0);
    await page.locator('.hx-tl-box [data-ev="h-1966-ashkin-optical-damage"]').evaluate((c) => c.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(400);
    await sweep();
    expect(await alpha()).toBeGreaterThan(0);
  });
});
