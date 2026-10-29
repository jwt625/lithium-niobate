// One camera over the one strip. Everything (linen, borders, every stretch's scenes and lettering)
// is stitched into a strip canvas in world coordinates, seeded per world tile / panel / page, so a
// given stretch bakes to the same pixels in every scene. On an in-book page turn (host.from) the
// camera starts exactly at the previous page's resting view and pans along the strip to this
// stretch; nothing re-stitches. On a fresh entry the page rests at its stretch and its own
// elements stitch in once.

import type { Scene, SceneHost } from "../../types";
import { borders } from "./motifs";
import { BUILD, FINAL, type Art, type St } from "./pages";
import { Emb, W, clamp, drawItem, drawRun, itemAt, type Ctx } from "./stitch";

export const INTRO = 3.2; // fresh entry: stitch-in settles
const TILE = 200;

/** Ease with slow start, fast middle, gentle stop (smootherstep). */
const glide = (x: number): number => {
  const k = clamp(x);
  return k * k * k * (k * (k * 6 - 15) + 10);
};

/** Linen for world x in [x0, x1]: warp threads and slubs seeded per world tile, weft tones per row. */
function linen(g: Ctx, x0: number, x1: number, rng: (seed: number) => () => number): void {
  g.fillStyle = W.linen;
  g.fillRect(x0, 0, x1 - x0, 1000);
  const rows = rng(911);
  g.lineWidth = 0.9;
  for (let y = 0; y < 1000; y += 3.2) {
    g.strokeStyle = rows() < 0.5 ? "rgba(120,96,60,0.09)" : "rgba(255,250,235,0.2)";
    g.beginPath();
    g.moveTo(x0, y);
    g.lineTo(x1, y);
    g.stroke();
  }
  for (let ti = Math.floor(x0 / TILE); ti * TILE < x1; ti++) {
    const r = rng(20000 + ti * 13);
    const tx = ti * TILE;
    g.lineWidth = 0.9;
    for (let k = 0; k < TILE / 3.2; k++) {
      g.strokeStyle = r() < 0.5 ? "rgba(120,96,60,0.10)" : "rgba(255,250,235,0.22)";
      g.beginPath();
      g.moveTo(tx + k * 3.2, 0);
      g.lineTo(tx + k * 3.2, 1000);
      g.stroke();
    }
    g.lineWidth = 1.6;
    g.strokeStyle = "rgba(140,110,70,0.13)";
    for (let i = 0; i < TILE / 9; i++) {
      const x = tx + r() * TILE, y = r() * 1000, l = 20 + r() * 60;
      g.beginPath();
      g.moveTo(x, y);
      if (r() < 0.5) g.lineTo(x + l, y);
      else g.lineTo(x, y + l);
      g.stroke();
    }
  }
}

export function stripScene(host: SceneHost, p: number): Scene {
  const ox = 1000 * (p - 1);
  const n = BUILD.length;
  const fp = host.from !== undefined && host.from + 1 !== p && !host.reduced ? clamp(host.from + 1, 1, n) : p;
  const pan = fp !== p;
  const fx = 1000 * (fp - 1);
  const dist = Math.abs(p - fp);
  const D = pan ? Math.min(2, 0.35 + 0.75 * dist) : 0; // 1.1 s for one page, capped at 2 s
  const lo = Math.min(p, fp), hi = Math.max(p, fp);
  const st: St = { taps: 0, tapT: 0, reduced: host.reduced, rng: host.rng };
  // every stretch the strip canvas touches (neighbours included for overhanging elements)
  const arts = new Map<number, Art>();
  for (let q = Math.max(1, lo - 1); q <= Math.min(n, hi + 1); q++) arts.set(q, BUILD[q - 1](host.rng(7000 + q)));
  const art = arts.get(p) as Art;
  const fresh = !pan && !host.reduced;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:pointer";
  host.el.appendChild(canvas);
  const ctx = canvas.getContext("2d") as Ctx;
  let px = 0, s = 1, wx0 = 0;
  let cache: HTMLCanvasElement | null = null;
  let cg: Ctx | null = null;
  // fresh entry: this stretch's items move into the strip canvas once finished (drawing order; free items any time)
  const baked: boolean[] = art.items.map(() => !fresh);

  const bake = (): void => {
    const css = host.el.clientWidth || 600;
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    px = Math.max(200, Math.round(css * dpr));
    canvas.width = canvas.height = px;
    s = px / 1000;
    // strip canvas origin on the world pixel lattice, so a stretch rasterizes identically in every scene
    const p0 = Math.floor(1000 * (lo - 1) * s) - 2, p1 = Math.ceil(1000 * hi * s) + 2;
    wx0 = p0 / s;
    const wx1 = p1 / s;
    const c = document.createElement("canvas");
    c.width = p1 - p0;
    c.height = px;
    const g = c.getContext("2d") as Ctx;
    g.setTransform(s, 0, 0, s, -p0, 0);
    linen(g, wx0, wx1, host.rng);
    for (const e of borders((i) => new Emb(host.rng(31000 + i * 7)), wx0, wx1)) for (const r of e.runs) drawRun(g, r);
    for (const [q, a] of arts) {
      if (q === p) {
        a.items.forEach((it, i) => {
          if (baked[i]) drawItem(g, it, 1);
        });
      } else {
        for (const it of a.items) drawItem(g, it, 1);
        a.dyn?.(g, FINAL, { taps: 0, tapT: 0, reduced: false, rng: host.rng });
      }
    }
    cache = c;
    cg = g;
  };
  bake();

  let lastT = 0;
  /** Clock for this stretch's moving parts: on a page turn they are already settled. */
  const dynT = (t: number): number => (st.reduced ? FINAL : fresh ? t : t + 100);
  const frame = (t: number): void => {
    lastT = t;
    const css = host.el.clientWidth || 600;
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    if (css > 0 && Math.abs(Math.round(css * dpr) - px) > 2) bake();
    const vx = pan ? fx + (ox - fx) * glide(t / D) : ox;
    if (fresh) {
      let chain = true;
      art.items.forEach((it, i) => {
        if (baked[i]) return;
        if (itemAt(it, t) >= 1 && (chain || it.free) && cg) {
          baked[i] = true;
          drawItem(cg, it, 1);
        } else if (!it.free) chain = false;
      });
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (cache) ctx.drawImage(cache, vx * s - wx0 * s, 0, px, px, 0, 0, px, px);
    ctx.setTransform(s, 0, 0, s, -vx * s, 0);
    if (fresh) art.items.forEach((it, i) => {
      if (!baked[i]) drawItem(ctx, it, itemAt(it, t));
    });
    art.dyn?.(ctx, dynT(t), st);
  };

  let down: { x: number; y: number; id: number } | null = null;
  const onDown = (e: PointerEvent): void => {
    down = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onUp = (e: PointerEvent): void => {
    if (!down || down.id !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 14 || !art.tap) return;
    st.taps++;
    st.tapT = dynT(lastT);
    host.wake(art.tap(lastT, st));
    if (st.reduced) frame(lastT);
  };
  const onCancel = (): void => {
    down = null;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);

  return {
    frame,
    settle: pan ? D : fresh ? INTRO : 0,
    destroy() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.remove();
      cache = null;
    },
  };
}
