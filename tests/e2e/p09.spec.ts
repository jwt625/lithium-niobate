// Lane P09 checks (/lab/, /data/, /library/, /colophon/), per route and mode at 1440 and 390 px: (a) no layout shift while
// every visible control is driven to its extremes (range inputs min / max / mid, every option of every select, every
// segmented / toggle button, theme toggle); content inside [data-free] (filtered rows in fixed-height scroll boxes) is
// exempt, the boxes themselves are checked; (b) no console or page errors; (c) no horizontal scroll at 390 px;
// (d) physics spot checks on F2 and F4; (e) every property page renders; (f) optional screenshots ($P09_SHOTS).
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const P09_ROUTES = ["/lab/", "/lab/phase-matching/", "/lab/tensors/", "/data/", "/data/density/", "/data/elastic-stiffness-cE/", "/data/dispersion/", "/data/api/", "/library/", "/colophon/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;
const SHOTS = process.env.P09_SHOTS;
const url = (r: string, mode: string, theme: string): string => `${r}?mode=${mode}&theme=${theme}`;

async function settle(page: Page, ms = 1500): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(ms);
}

async function driveControls(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const skip = (e: Element): boolean => !!e.closest(".pop, svg *, #pr-trace, .spine, [data-free], option, optgroup");
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
    for (const sel of [...document.querySelectorAll<HTMLSelectElement>("main select")].filter(vis)) {
      const v0 = sel.value, n = sel.options.length;
      for (const k of [...new Set([0, n - 1, Math.floor(n / 2)])]) { sel.selectedIndex = k; sel.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${sel.id || sel.dataset.tx || sel.className}=${sel.value}`); }
      sel.value = v0; sel.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const inp of [...document.querySelectorAll<HTMLInputElement>('main input[type="range"]')].filter(vis)) {
      const v0 = inp.value, lo = +inp.min, hi = +inp.max;
      for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id}=${v}`); }
      inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
      controls++;
    }
    for (const b of [...document.querySelectorAll<HTMLButtonElement>("main .seg button, main .v-seg button, main button[aria-pressed], main button[data-pmreset], main button[data-txreset]")].filter(vis)) {
      b.click(); await frame(); check(`button ${b.closest("[id]")?.id ?? ""}:${b.textContent}`);
      controls++;
    }
    const q = document.querySelector<HTMLInputElement>("main input[type=search]");
    if (q && vis(q)) { q.value = "zelmon"; q.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check("search"); q.value = "zzzz-no-match"; q.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check("search empty"); q.value = ""; q.dispatchEvent(new Event("input", { bubbles: true })); await frame(); controls++; }
    await new Promise((r) => setTimeout(r, 300)); await frame(); check("settled");
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const route of P09_ROUTES) for (const mode of MODES) {
  test(`p09 ${route} ${mode}: console, overflow, layout shift`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(url(route, mode, "dark"));
      await settle(page);
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

test("p09 F2 spot values (Zelmon CLN 21 C)", async ({ page }) => {
  await page.goto("/lab/phase-matching/?mode=tech");
  await settle(page, 500);
  const rows = await page.locator(".p9-pm [data-pmo=rows] td.v").allTextContents();
  expect(rows[5].trim()).toBe("18.989"); // 1550 -> 775 nm first-order period
  expect(rows[6].trim()).toBe("9.495"); // coherence length
  expect(rows[10].trim()).toBe("49.55"); // type I o+o->e angle
  await page.evaluate(() => { const i = document.querySelector<HTMLInputElement>("#pm-l1"); if (!i) return; i.value = String(Math.round((Math.log(1.064 / 0.4) / Math.log(5 / 0.4)) * 5000)); i.dispatchEvent(new Event("input", { bubbles: true })); });
  const p = (await page.locator(".p9-pm [data-pmo=rows] td.v").nth(5).textContent())?.trim();
  expect(Math.abs(Number(p) - 6.818)).toBeLessThan(0.01);
});

test("p09 F4 rotation and frame flips", async ({ page }) => {
  await page.goto("/lab/tensors/?mode=tech");
  await settle(page, 500);
  // e (kushibiki1999) in Z-cut: e22 = 2.407 at row 2 col 2; 180 deg about z flips e22 terms only
  const cell = async (r: number, c: number): Promise<string> => ((await page.locator(".p9-tx table.p9-mx tbody tr").nth(r).locator("td").nth(c).textContent()) ?? "").trim();
  expect(await cell(1, 1)).toBe("2.4070");
  await page.locator('.p9-tx button[data-txt="rot180"]').click();
  expect(await cell(1, 1)).toBe("−2.4070");
  expect(await cell(2, 2)).toBe("1.8940"); // e33 unchanged
  expect(await page.locator(".p9-tx table.p9-mx td.fr").count()).toBe(3); // e16, e21, e22
  expect(await page.locator(".p9-tx table.p9-mx td.fz").count()).toBe(8); // every e component flips with +z
  await page.locator('.p9-tx button[data-txt="rot180"]').click();
  await page.locator('.p9-tx button[data-txt="flipZ"]').click();
  expect(await cell(2, 2)).toBe("−1.8940"); // +z reversed flips every e component
  expect(await page.locator(".p9-tx table.p9-mx td.fz").count()).toBe(8);
});

test("p09 every property page renders without errors", async ({ page }) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("/data/");
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll<HTMLAnchorElement>('table.p9-pt a[href^="/data/"]')].map((a) => a.getAttribute("href") ?? ""))]);
  expect(hrefs.length).toBeGreaterThan(50);
  for (const h of hrefs) {
    const r = await page.goto(h);
    expect(r?.status(), h).toBe(200);
    expect(await page.locator('script[type="application/ld+json"]').count(), h).toBeGreaterThan(0);
  }
  expect(errs).toEqual([]);
});

if (SHOTS) {
  for (const route of P09_ROUTES) for (const mode of MODES) for (const theme of ["dark", "light"]) for (const w of WIDTHS) {
    test(`p09 shots ${route} ${mode} ${theme} ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(url(route, mode, theme));
      await settle(page);
      fs.mkdirSync(SHOTS, { recursive: true });
      await page.screenshot({ path: path.join(SHOTS, `${route.replace(/\//g, "_") || "root"}-${mode}-${theme}-${w}.png`), fullPage: true });
    });
  }
}
