// (a) Visual parity with the approved mockup: full-page screenshots of the landing and chapter 2.2, TECH and VISUAL,
// dark and light, 1440 and 390 px, against the mockup pages served at http://127.0.0.1:47613/. Pixel diff with pixelmatch
// (per-pixel color threshold 0.1, antialiasing excluded), block by block (masthead, each section, footer); each view writes
// test-results/parity/<view>.json and one diff PNG per block with differences.
// Reduced motion is emulated (playwright.config.ts) so the VISUAL motifs (bias drift, cursor trace) are static in both.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { MOCKUP, MODES, THEMES, WIDTHS, settle, withParams } from "./util";

const PAGES = [
  { name: "landing", app: "/", mock: `${MOCKUP}/index.html` },
  { name: "pockels", app: "/light/pockels-effect/", mock: `${MOCKUP}/chapter.html` },
];
/** Mismatch tolerances (fraction of compared pixels). Residuals and their causes: DevLog-005 "Test results".
 *  RAW: whole page. MASKED: outside the conoscope canvases, whose resting frame is intentionally different (exact
 *  plane-wave retardance at rest instead of the mockup's weak-birefringence model, lane PHY / coordinator 2026-10-25). */
const TOL_RAW = 0.03, TOL_MASKED = 0.005;
const MASK_SEL = "#conoscope, #v-cono, #v-ret";
/** Blocks changed on purpose after the port (INT 2026-10-25): masthead search entry and built chapters in the nav; landing
 *  index, doors and instrument rows link built pages; the platforms block points to 8.4; footer chapter legends, VISUAL
 *  pointer-effect links and the shortened FEM credit. They are still captured and diffed (test-results/parity), but not
 *  asserted against the mockup. */
const DIVERGED: Record<string, string[]> = {
  landing: ["header.mast", "footer", "#index", "#v-chapters", "#instruments", "#v-instr", "#platforms"],
  // 2.2: lane P02 edited L1-L3 after audits E/F (Kaminow 1980 first, engine V_pi L line, source lines), 2026-10-25
  pockels: ["header.mast", "footer", "#l1", "#l2", "#l3"],
};
/** Font-metric-driven blocks (FINAL 2026-10-25, DevLog-005 "Parity: font-metric blocks"): the landing ASCII cell (#cell) is
 *  a canvas whose character grid is sized from the measured monospace glyph box. The app preloads its fonts; the mockup
 *  measured before its web fonts loaded, so the app canvas is 1-2 px taller and every glyph row is redrawn on a different
 *  baseline (measured mismatch 3.2-7.3% of the block, dh 1-2 px, 2026-10-25). These blocks are excluded from the page
 *  totals (area kept in the denominator) and asserted on their own with FONT_TOL and FONT_DH; the rest of the page stays
 *  a regression guard at TOL_RAW / TOL_MASKED. */
const FONT_METRIC: Record<string, string[]> = { landing: ["#cell"] };
const FONT_TOL = 0.1, FONT_DH = 3;
const OUT = "test-results/parity";

let mockupUp = false;
test.beforeAll(async ({ request }) => {
  try { mockupUp = (await request.get(`${MOCKUP}/index.html`)).ok(); } catch { mockupUp = false; }
  fs.mkdirSync(OUT, { recursive: true });
});

for (const pg of PAGES) for (const mode of MODES) for (const theme of THEMES) for (const w of WIDTHS) {
  const view = `${pg.name}-${mode}-${theme}-${w}`;
  test(`parity ${view}`, async ({ page }) => {
    test.skip(!mockupUp && process.env.PARITY_SKIP === "1", "mockup server not reachable on 47613 (PARITY_SKIP=1)");
    expect(mockupUp, "mockup server must be served at http://127.0.0.1:47613/ (or set PARITY_SKIP=1)").toBe(true);
    await page.setViewportSize({ width: w, height: 900 });
    interface Box { x: number; y: number; w: number; h: number }
    // blocks compared one by one, so a height change in one block (e.g. a line that wraps differently) does not offset
    // every block below it; conoscope canvases masked (see TOL_MASKED)
    const BLOCKS = "header.mast, footer, main > section[id], main > .mv > section[id], main > .crumbs, main > h1, main > nav.depth";
    // Blocks are captured from viewport-sized tiles (scroll, screenshot the viewport, crop), not with a full-page capture:
    // Chrome's beyond-viewport capture repeats canvas content at fixed page offsets (seen as a ghost eyepiece at 390 px).
    const capture = async (b: Box): Promise<PNG> => {
      const vh = page.viewportSize()?.height ?? 900, out = new PNG({ width: Math.floor(b.w), height: Math.floor(b.h) });
      for (let off = 0; off < out.height; off += vh) {
        const top = await page.evaluate((y) => { window.scrollTo(0, y); return new Promise<number>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(scrollY)))); }, b.y + off);
        const tile = PNG.sync.read(await page.screenshot());
        const y0 = Math.round(b.y + off - top), rows = Math.min(vh, out.height - off, tile.height - y0), x0 = Math.round(b.x);
        for (let y = 0; y < rows; y++) tile.data.copy(out.data, (off + y) * out.width * 4, ((y0 + y) * tile.width + x0) * 4, ((y0 + y) * tile.width + x0 + out.width) * 4);
      }
      return out;
    };
    const shot = async (url: string): Promise<{ png: Record<string, PNG>; blocks: Record<string, Box>; mask: Box[]; height: number }> => {
      await page.goto(withParams(url, mode, theme));
      await settle(page, 3500);
      const info = await page.evaluate(([bs, ms]) => {
        const box = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; };
        const vis = (e: Element) => (e as HTMLElement).offsetParent !== null || e.tagName === "FOOTER";
        const blocks: Record<string, ReturnType<typeof box>> = {};
        document.querySelectorAll(bs).forEach((e) => { if (vis(e)) blocks[e.id ? `#${e.id}` : e.tagName.toLowerCase() + (e.className ? `.${String(e.className).split(" ")[0]}` : "")] = box(e); });
        return { blocks, mask: [...document.querySelectorAll(ms)].filter(vis).map(box), height: document.documentElement.scrollHeight };
      }, [BLOCKS, MASK_SEL] as const);
      const png: Record<string, PNG> = {};
      for (const [k, b] of Object.entries(info.blocks)) png[k] = await capture(b);
      return { png, ...info };
    };
    const A = await shot(pg.app), B = await shot(pg.mock);
    const isRed = (d: Buffer, i: number): boolean => d[i] === 255 && d[i + 1] === 0 && d[i + 2] === 0;
    const per: { block: string; dh: number; frac: number; fracMasked: number; area: number; diverged?: boolean; fontMetric?: boolean }[] = [];
    let tot = 0, totM = 0, area = 0;
    for (const [k, ba] of Object.entries(A.blocks)) {
      const bb = B.blocks[k];
      if (!bb) { per.push({ block: k, dh: NaN, frac: 1, fracMasked: 1, area: 0 }); continue; }
      const pa = A.png[k], pb = B.png[k], W = Math.min(pa.width, pb.width), H = Math.min(pa.height, pb.height);
      if (W <= 0 || H <= 0) continue;
      const crop = (p: PNG): Buffer => { const o = Buffer.alloc(W * H * 4); for (let y = 0; y < H; y++) p.data.copy(o, y * W * 4, y * p.width * 4, (y * p.width + W) * 4); return o; };
      const diff = Buffer.alloc(W * H * 4);
      const n = pixelmatch(crop(pa), crop(pb), diff, W, H, { threshold: 0.1, includeAA: false });
      let nm = n;
      for (const m of A.mask) for (let y = Math.max(0, Math.floor(m.y - ba.y)); y < Math.min(H, Math.ceil(m.y - ba.y + m.h)); y++) for (let x = Math.max(0, Math.floor(m.x - ba.x)); x < Math.min(W, Math.ceil(m.x - ba.x + m.w)); x++) if (isRed(diff, (y * W + x) * 4)) nm--;
      const diverged = (DIVERGED[pg.name] ?? []).includes(k), fontMetric = (FONT_METRIC[pg.name] ?? []).includes(k);
      per.push({ block: k, dh: Math.round(ba.h - bb.h), frac: +(n / (W * H)).toFixed(6), fracMasked: +(nm / (W * H)).toFixed(6), area: W * H, diverged, fontMetric });
      // diverged and font-metric blocks keep their area in the denominator but add no mismatch to the page totals
      if (!diverged && !fontMetric) { tot += n; totM += nm; }
      area += W * H;
      if (n) fs.writeFileSync(`${OUT}/${view}-${k.replace(/[^a-z0-9-]/gi, "_")}-diff.png`, PNG.sync.write(Object.assign(new PNG({ width: W, height: H }), { data: diff })));
    }
    const res = { view, appHeight: A.height, mockupHeight: B.height, fraction: +(tot / area).toFixed(6), fractionMasked: +(totM / area).toFixed(6), blocks: per, mask: A.mask };
    fs.writeFileSync(`${OUT}/${view}.json`, JSON.stringify(res, null, 1));
    expect(per.filter((b) => !Number.isFinite(b.dh)).map((b) => b.block), "blocks missing in the mockup").toEqual([]);
    expect(Math.max(...per.filter((b) => !b.diverged).map((b) => Math.abs(b.dh))), "a block height differs from the mockup by more than 30 px").toBeLessThanOrEqual(30);
    for (const b of per.filter((x) => x.fontMetric)) {
      expect(Math.abs(b.dh), `font-metric block ${b.block}: height differs from the mockup by more than ${FONT_DH} px`).toBeLessThanOrEqual(FONT_DH);
      expect(b.fracMasked, `font-metric block ${b.block}: mismatch above FONT_TOL`).toBeLessThan(FONT_TOL);
    }
    expect(res.fraction).toBeLessThan(TOL_RAW);
    expect(res.fractionMasked).toBeLessThan(TOL_MASKED);
  });
}
