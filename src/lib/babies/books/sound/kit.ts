// Black-line woodcut kit for the Sound book (DevLog-007b sec. 03): paper, ink, one red spot colour,
// tapered gouge strokes with seeded rough edges, static tooth + ink-starve speckle, the carved text
// block, and the scene wrapper (canvas stage, pointer -> page handlers, deterministic frame(t)).
// "Boiling": stroke-edge noise cycles through 3 seeded inkings at 10 fps.

import type { Scene, SceneHost } from "../../types";
import { carveText } from "./letters";

export type Ctx = CanvasRenderingContext2D;
export type Pt = [number, number];

export const PAL = { paper: "#EFE6D2", ink: "#141414", red: "#C23B22", paperInk: "#F4ECDA" };

export const clamp = (x: number, a = 0, b = 1): number => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));
export const ease = (x: number): number => 1 - (1 - clamp(x)) ** 3;
export const easeIO = (x: number): number => {
  const u = clamp(x);
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
};
export const TAU = Math.PI * 2;

/** Integer hash -> [0,1). Deterministic, stateless (used for per-vertex edge noise). */
export function hash(a: number, b: number): number {
  let x = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35);
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** Smooth 1D value noise in [0,1). */
export function noise1(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed), hash(i + 1, seed), u);
}

/** Boil index: which of the 3 inkings is shown at time t (10 fps). */
export const boil = (t: number): number => Math.floor(t * 10 + 1e-6) % 3;
/** Time quantized to the 10 fps print rate. */
export const q10 = (t: number): number => Math.floor(t * 10 + 1e-6) / 10;

export interface GougeOpt {
  /** 0 = parallel sides, 1 = pointed both ends (gouge entry and exit). */
  taper?: number;
  /** Edge roughness amplitude in logical units. */
  rough?: number;
  seed?: number;
  step?: number;
  /** Slow width wobble, fraction of w. */
  wobble?: number;
}

function resample(pts: Pt[], step: number): { p: Pt[]; L: number } {
  const out: Pt[] = [pts[0]];
  let L = 0;
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d < 1e-9) continue;
    let s = step - carry;
    while (s <= d) {
      out.push([x0 + ((x1 - x0) * s) / d, y0 + ((y1 - y0) * s) / d]);
      s += step;
    }
    carry = d - (s - step);
    L += d;
  }
  const last = pts[pts.length - 1];
  const pl = out[out.length - 1];
  if (Math.hypot(last[0] - pl[0], last[1] - pl[1]) > step * 0.3) out.push(last);
  else out[out.length - 1] = last;
  return { p: out, L };
}

/** Adds one tapered gouge stroke (closed sub-path) to the current path. Caller fills. All strokes
 *  wind the same way (left side out, right side back), so nonzero fill unions overlapping strokes. */
export function gouge(g: Ctx, pts: Pt[], w: number, o: GougeOpt = {}): void {
  if (pts.length < 2) return;
  const taper = o.taper ?? 1;
  const rough = o.rough ?? 1;
  const seed = o.seed ?? 1;
  const wob = o.wobble ?? 0.12;
  const { p, L } = resample(pts, o.step ?? 3);
  const n = p.length;
  if (n < 2 || L < 0.5) return;
  const closed = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 0.5;
  const left: Pt[] = [];
  const right: Pt[] = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0) acc += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const s = acc / L;
    const prof = closed ? 1 : 1 - taper + taper * Math.pow(Math.sin(Math.PI * clamp(s, 0.02, 0.98)), 0.55);
    const h = (w / 2) * prof * (1 + wob * (noise1(acc / 23, seed + 7) * 2 - 1));
    const rl = rough * (noise1(acc / 4.5, seed) * 2 - 1);
    const rr = rough * (noise1(acc / 4.5, seed + 101) * 2 - 1);
    left.push([p[i][0] - ty * (h + rl), p[i][1] + tx * (h + rl)]);
    right.push([p[i][0] + ty * (h + rr), p[i][1] - tx * (h + rr)]);
  }
  g.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) g.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
  g.closePath();
}

/** Rough-edged blob (gouge dot / punched mark). Adds a sub-path; caller fills. */
export function blob(g: Ctx, x: number, y: number, r: number, seed: number, rough = 0.9): void {
  const n = Math.max(10, Math.round(r * 1.6));
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r + rough * (noise1((i % n) * 0.9, seed) * 2 - 1);
    const px = x + rr * Math.cos(a);
    const py = y + rr * Math.sin(a);
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

/** Rough-edged polygon outline (a block of ink with a hand-cut edge). Adds a sub-path. */
export function roughPoly(g: Ctx, pts: Pt[], seed: number, rough = 1.4, step = 6): void {
  const ring = [...pts, pts[0]];
  const { p } = resample(ring, step);
  let acc = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)];
    const b = p[i + 1];
    const tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / tl;
    const ny = (b[0] - a[0]) / tl;
    if (i > 0) acc += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const r = rough * (noise1(acc / 7, seed) * 2 - 1);
    const x = p[i][0] + nx * r;
    const y = p[i][1] + ny * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
}

export const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** Polyline of a function sampled every `dx` from x0 to x1. */
export function fx(x0: number, x1: number, dx: number, f: (x: number) => number): Pt[] {
  const out: Pt[] = [];
  const n = Math.max(1, Math.ceil((x1 - x0) / dx));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    out.push([x, f(x)]);
  }
  return out;
}

/** Fat carved arrow (shaft + head) from (x0,y0) to (x1,y1). Adds sub-paths; caller fills. */
export function arrow(g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, seed: number): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const hl = w * 2.1;
  const bx = x1 - ux * hl;
  const by = y1 - uy * hl;
  gouge(g, [[x0, y0], [bx + ux * 2, by + uy * 2]], w, { taper: 0.25, rough: 1, seed });
  const hw = w * 1.6;
  roughPoly(g, [[x1, y1], [bx - uy * hw, by + ux * hw], [bx + uy * hw, by - ux * hw]], seed + 3, 1, 5);
}

// ---------- layers, page ground, text block, scene wrapper ----------

export interface Layer {
  c: HTMLCanvasElement;
  g: Ctx;
}
export function layer(px: number, s: number): Layer {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d") as Ctx;
  g.setTransform(s, 0, 0, s, 0, 0);
  return { c, g };
}

/** Art window (inside the printed border) and the carved text block. */
export const ART = { x0: 46, y0: 46, x1: 954, y1: 718 };
export const TEXTBOX = { x0: 40, y0: 736, x1: 960, y1: 962 };

function paperGround(g: Ctx, rng: () => number): void {
  g.fillStyle = PAL.paper;
  g.fillRect(0, 0, 1000, 1000);
  // static tooth: tiny fibres, ~6 % darker / lighter
  for (let i = 0; i < 2600; i++) {
    const x = rng() * 1000;
    const y = rng() * 1000;
    const a = rng() * Math.PI;
    const l = 1 + rng() * 4;
    g.strokeStyle = rng() < 0.6 ? "rgba(90,70,40,0.07)" : "rgba(255,252,240,0.25)";
    g.lineWidth = 0.6 + rng() * 0.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + l * Math.cos(a), y + l * Math.sin(a));
    g.stroke();
  }
}

/** Printed border around the art window: a cut black rule. */
function border(g: Ctx): void {
  g.fillStyle = PAL.ink;
  g.beginPath();
  const { x0, y0, x1, y1 } = ART;
  const t = 8;
  roughPoly(g, rect(x0 - t, y0 - t, x1 + t, y1 + t), 11, 1.2);
  roughPoly(g, [[x0, y0], [x0, y1], [x1, y1], [x1, y0]], 12, 1.2);
  g.fill("nonzero");
}

/** Black text block with wood grain, letters carved out (paper shows through). */
function textBlock(g: Ctx, text: string, redFrom: number): void {
  const { x0, y0, x1, y1 } = TEXTBOX;
  g.fillStyle = PAL.ink;
  g.beginPath();
  roughPoly(g, rect(x0, y0, x1, y1), 21, 1.6);
  g.fill();
  // wood grain: a few long, thin, faint cuts, sin(f*(y+noise))
  g.save();
  g.beginPath();
  g.rect(x0 + 4, y0 + 4, x1 - x0 - 8, y1 - y0 - 8);
  g.clip();
  g.fillStyle = "rgba(239,230,210,0.13)";
  g.beginPath();
  for (let k = 0; k < 15; k++) {
    const yb = y0 + 8 + k * 15.5;
    const pts = fx(x0, x1, 8, (x) => yb + 5 * Math.sin(x / 140 + k * 0.7 + 3 * noise1(x / 90, 300 + k)));
    // break the grain into long tapered pieces
    let a = 0;
    while (a < pts.length - 4) {
      const len = 8 + Math.floor(hash(k, a) * 30);
      const gap = 3 + Math.floor(hash(a, k + 50) * 14);
      gouge(g, pts.slice(a, Math.min(pts.length, a + len)), 1.4, { taper: 1, rough: 0.3, seed: 400 + k * 13 + a });
      a += len + gap;
    }
  }
  g.fill();
  g.restore();
  carveText(g, text, (x0 + x1) / 2, (y0 + y1) / 2, { xh: 31, maxW: x1 - x0 - 44, lineH: 64, color: PAL.paperInk, red: PAL.red, redFrom, seed: 77 });
}

/** Ink-starve speckle (paper specks left in solid ink) + fibre grain, laid over the art. */
function overlay(g: Ctx, rng: () => number): void {
  for (let i = 0; i < 520; i++) {
    const x = ART.x0 + rng() * (ART.x1 - ART.x0);
    const y = ART.y0 + rng() * (ART.y1 - ART.y0);
    const r = 0.5 + rng() * rng() * 2.2;
    g.fillStyle = `rgba(239,230,210,${(0.35 + rng() * 0.5).toFixed(2)})`;
    g.beginPath();
    g.ellipse(x, y, r * (1 + rng()), r, rng() * Math.PI, 0, TAU);
    g.fill();
  }
}

export interface PageImpl {
  /** Seconds after which draw(t) no longer changes without input (Infinity = idle loop). */
  settle: number;
  draw(g: Ctx, t: number): void;
  /** Redraw key: if it returns the same value as last frame (and no input happened), skip drawing. */
  key?(t: number): string;
  /** Pointer handlers, logical coordinates; return seconds to keep the loop awake (0 = none). */
  down?(x: number, y: number, t: number): number;
  move?(x: number, y: number, t: number): number;
  up?(x: number, y: number, t: number): number;
}

export interface Kit {
  host: SceneHost;
  reduced: boolean;
}

/** Wraps a page: canvas stage, baked paper + border + carved text, pointer handlers, frame(t). */
export function makeScene(host: SceneHost, text: string, seed: number, build: (k: Kit) => PageImpl, redFrom = -1): Scene {
  const canvas = document.createElement("canvas");
  const css = host.el.clientWidth || 800;
  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const px = Math.max(200, Math.round(css * dpr));
  canvas.width = canvas.height = px;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none;cursor:pointer";
  host.el.appendChild(canvas);
  const ctx = canvas.getContext("2d") as Ctx;
  const s = px / 1000;
  const rng = host.rng(seed);
  const bg = layer(px, s);
  paperGround(bg.g, rng);
  textBlock(bg.g, text, redFrom);
  const ov = layer(px, s);
  overlay(ov.g, rng);
  const fr = layer(px, s);
  border(fr.g);
  const page = build({ host, reduced: host.reduced });
  let lastT = 0;
  let lastKey = "";
  let dirty = true;
  const frame = (t: number): void => {
    lastT = t;
    const key = page.key ? page.key(t) : String(t);
    if (!dirty && key === lastKey) return;
    lastKey = key;
    dirty = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg.c, 0, 0);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(ART.x0, ART.y0, ART.x1 - ART.x0, ART.y1 - ART.y0);
    ctx.clip();
    page.draw(ctx, t);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(ov.c, 0, 0);
    ctx.drawImage(fr.c, 0, 0);
  };
  const toLogical = (e: PointerEvent): Pt => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / (r.width || 1)) * 1000, ((e.clientY - r.top) / (r.height || 1)) * 1000];
  };
  const handle = (fn: ((x: number, y: number, t: number) => number) | undefined, e: PointerEvent): void => {
    if (!fn) return;
    const [x, y] = toLogical(e);
    const dur = fn(x, y, lastT);
    if (dur > 0) {
      dirty = true;
      if (!host.reduced) host.wake(dur);
      frame(lastT);
    }
  };
  let pressed = false;
  const onDown = (e: PointerEvent): void => {
    pressed = true;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events have no active pointer */
    }
    handle(page.down, e);
  };
  const onMove = (e: PointerEvent): void => {
    if (pressed) handle(page.move, e);
  };
  const onUp = (e: PointerEvent): void => {
    if (!pressed) return;
    pressed = false;
    handle(page.up, e);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  return {
    frame,
    settle: page.settle,
    destroy() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.remove();
    },
  };
}
