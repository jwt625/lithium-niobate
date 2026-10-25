// Chapter 08 Industry (lane P08): every route in TECH and VISUAL at 1440 and 390 px.
// (a) no console errors on load and while controls are driven; (b) no horizontal page scroll at 390 px;
// (c) no layout shift: every visible range input to min, max, mid; every segmented button; every chapter-08 control
//     (value-chain nodes, company tags, product tags, legend toggles, flip buttons, timeline marks, chart tabs and the
//     controls of each tab); theme toggle and back. Elements inside fixed-size regions (cards, plot boxes, scroll
//     regions) may change; the regions themselves and everything else may not move or resize.
import { test, expect, type Page } from "@playwright/test";

const ROUTES8 = ["/industry/", "/industry/rock-to-chip/", "/industry/who-makes-it/", "/industry/wafers-and-lanes/", "/industry/platforms/", "/industry/ofc-2026/", "/industry/market/", "/industry/in-your-life/", "/industry/events/"];
const MODES = ["tech", "visual"] as const;
const WIDTHS = [1440, 390] as const;

async function drive(page: Page): Promise<{ moved: string[]; controls: number }> {
  return page.evaluate(async () => {
    const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const FIXED = ".i8-card, .i8-ecard, .i8-box, .i8-scroll, .i8-cards, .i8-lv, .i8-msc";
    // sticky elements (depth nav, side cards) follow intended scrolling (a phone value-chain card scrolls into view)
    const sticky = (e: Element): boolean => { for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === "sticky") return true; return false; };
    const skip = (e: Element): boolean => !!e.closest(".pop, svg *, #pr-trace, .spine") || !!e.parentElement?.closest(FIXED) || sticky(e);
    const els = [...document.querySelectorAll("header *, main *, footer *")].filter((e) => !skip(e));
    const path = (e: Element): string => { const p: string[] = []; for (let n: Element | null = e; n && n !== document.body && p.length < 4; n = n.parentElement) p.unshift(n.id ? `#${n.id}` : n.tagName.toLowerCase() + (n.classList.length ? `.${[...n.classList].join(".")}` : "")); return p.join(" > "); };
    const snap = (): (number[] | null)[] => els.map((e) => { if (!e.isConnected) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height]; });
    const base = snap();
    const moved = new Set<string>();
    const check = (what: string): void => {
      snap().forEach((v, i) => { const b = base[i]; if (!v || !b) return; if ((!v[2] && !v[3]) || (!b[2] && !b[3])) return; if (v.some((x, k) => Math.abs(x - b[k]) > 0.5)) moved.add(`${path(els[i])} [${what}]`); });
    };
    const vis = (e: HTMLElement): boolean => e.offsetParent !== null || getComputedStyle(e).position === "sticky" || (e instanceof SVGElement && !!e.closest("svg")?.getBoundingClientRect().width);
    let controls = 0;
    const ranges = async (root: ParentNode): Promise<void> => {
      for (const inp of [...root.querySelectorAll<HTMLInputElement>('input[type="range"]')].filter(vis)) {
        const v0 = inp.value, lo = +inp.min, hi = +inp.max;
        for (const v of [lo, hi, (lo + hi) / 2]) { inp.value = String(v); inp.dispatchEvent(new Event("input", { bubbles: true })); await frame(); check(`${inp.id || "range"}=${v}`); }
        inp.value = v0; inp.dispatchEvent(new Event("input", { bubbles: true })); await frame();
        controls++;
      }
    };
    const SEL = ".seg:not(.mode):not(.i8-tabs) button, .v-seg:not(.i8-tabs) button, .i8-node, .i8-vn, .i8-co, .i8-cc, .i8-ptag, .i8-lg, .i8-flipb, .i8-play, .i8-ax .mk, .i8-sth, .i8-bandh, .i8-wg";
    const buttons = async (root: ParentNode): Promise<void> => {
      for (const b of [...root.querySelectorAll<HTMLElement>(SEL)].filter(vis).slice(0, 80)) {
        b.dispatchEvent(new MouseEvent("mouseenter")); if (typeof (b as HTMLElement).click === "function") b.click(); else b.dispatchEvent(new MouseEvent("click", { bubbles: true })); await frame(); check(`click ${b.closest("[id]")?.id ?? ""}:${(b.textContent ?? "").trim().slice(0, 24)}`);
        b.dispatchEvent(new MouseEvent("mouseleave")); b.dispatchEvent(new FocusEvent("focus")); await frame(); check(`focus ${(b.textContent ?? "").trim().slice(0, 24)}`); b.dispatchEvent(new FocusEvent("blur"));
        controls++;
      }
    };
    await ranges(document);
    await buttons(document);
    for (const tabs of [...document.querySelectorAll<HTMLElement>(".i8-tabs")].filter(vis)) {
      const box = tabs.parentElement as HTMLElement;
      for (const t of [...tabs.querySelectorAll<HTMLButtonElement>("button")]) {
        t.click(); await frame(); check(`tab ${t.textContent}`); controls++;
        await ranges(box); await buttons(box.querySelector(".i8-box") ?? box);
      }
      (tabs.querySelector("button") as HTMLButtonElement).click(); await frame();
    }
    const theme = document.getElementById("theme-btn");
    if (theme) { theme.click(); await frame(); await frame(); check("theme light"); theme.click(); await frame(); await frame(); check("theme dark"); controls += 2; }
    return { moved: [...moved], controls };
  });
}

for (const url of ROUTES8) for (const mode of MODES) for (const w of WIDTHS) {
  test(`industry ${url} ${mode} ${w}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    // other lanes edit files on the shared dev server; hold the HMR socket so their reloads cannot navigate this page
    await page.routeWebSocket(/.*/, () => {});
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(`${url}?mode=${mode}&theme=dark`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(1200);
    if (w === 390) {
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw, "horizontal page scroll at 390 px").toBeLessThanOrEqual(cw);
    }
    const r = await drive(page);
    console.log(`${url} ${mode} ${w}: ${r.controls} controls, ${r.moved.length} moved`);
    expect(r.moved, r.moved.slice(0, 20).join("\n")).toEqual([]);
    if (w === 390) {
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw, "horizontal page scroll at 390 px after interaction").toBeLessThanOrEqual(cw);
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

// (d) No shift between the prerendered markup and the hydrated page: scripts are held until a first snapshot of every
//     section, figure, and id'd element is taken, then released. Production build only: the Vite dev server injects
//     component CSS from JavaScript, so held scripts also hold the styles there.
for (const url of ROUTES8) for (const mode of MODES) for (const w of WIDTHS) {
  test(`industry hydration shift ${url} ${mode} ${w}`, async ({ page, baseURL }) => {
    test.skip((baseURL ?? "").includes(":47614"), "dev server: component CSS arrives with the scripts");
    await page.setViewportSize({ width: w, height: 900 });
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => { release = r; });
    await page.route("**/*", async (route) => { if (route.request().resourceType() === "script") await gate; await route.continue(); });
    const rects = (): Promise<Record<string, number[]>> => page.evaluate(() => Object.fromEntries([...document.querySelectorAll("main > section, main [id], .i8-fig, .i8-box, .i8-card, .i8-ecard")]
      .filter((e) => !e.closest(".pop") && (e as HTMLElement).offsetParent !== null).map((e, i) => { const r = e.getBoundingClientRect(); return [`${e.id || e.className.toString().split(" ")[0]}#${i}`, [r.x, r.y + scrollY, r.width, r.height]]; })));
    await page.goto(`${url}?mode=${mode}&theme=dark`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(300);
    const early = await rects();
    release();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const late = await rects();
    const moved = Object.keys(early).filter((k) => late[k] && early[k].some((v, i) => Math.abs(v - late[k][i]) > 0.5));
    expect(moved, moved.slice(0, 15).map((k) => `${k}: ${early[k].map((v) => v.toFixed(1))} -> ${late[k].map((v) => v.toFixed(1))}`).join("\n")).toEqual([]);
  });
}
