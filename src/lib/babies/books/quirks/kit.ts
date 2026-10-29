// Crayon scratch-art kit (DevLog-007b, 04 Quirks): bright waxy crayon under a black coat; every visible mark is
// black scraped away. Inks are crayon textures used as fill patterns, so a stroke "reveals" the crayon under it.
// Static scratches (lettering, fixed art) are baked once into the black base; moving scratches are stroked per frame.

import type { Scene, SceneHost } from "../../types";

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;
export type Pt = [number, number];

export const CRAYON = {
  red: "#E8352E",
  orange: "#F28C28",
  yellow: "#F6D03C",
  green: "#3BB273",
  blue: "#2F6FDE",
  purple: "#8E44AD",
};
export const BLACK = "#111111";

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const seg = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const ease = (x: number): number => 1 - (1 - clamp(x)) ** 3;
export const easeIO = (x: number): number => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};

// ---------- crayon inks ----------

export type InkName = "rainbow" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "teal" | "sun" | "white";

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BANDS = [CRAYON.red, CRAYON.orange, CRAYON.yellow, CRAYON.green, CRAYON.blue, CRAYON.purple].map(hex);

const TILE_INKS: Record<Exclude<InkName, "rainbow">, [string, string, string]> = {
  // base, streak, rare fleck
  red: [CRAYON.red, CRAYON.orange, CRAYON.yellow],
  orange: [CRAYON.orange, CRAYON.yellow, CRAYON.red],
  yellow: [CRAYON.yellow, "#FBE58A", CRAYON.orange],
  green: [CRAYON.green, "#7FD39B", CRAYON.yellow],
  blue: [CRAYON.blue, "#6C9BF0", CRAYON.purple],
  purple: ["#A157C4", CRAYON.purple, CRAYON.blue],
  teal: ["#2FA3A8", CRAYON.green, CRAYON.blue],
  sun: [CRAYON.orange, CRAYON.yellow, CRAYON.red],
  white: ["#F4EEDC", "#FFFFFF", CRAYON.yellow],
};

/** Waxy streaks: short strokes along `ang`, lighter and darker, wrapped across a tile of size T (0 = no wrap). */
function streaks(g: Ctx, rng: Rng, n: number, W: number, H: number, ang: number, col: string, alpha: number, T = 0): void {
  g.save();
  g.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const x = rng() * W, y = rng() * H, l = 6 + rng() * 26, w = 0.6 + rng() * 1.8;
    const a = ang + (rng() - 0.5) * 0.25;
    g.strokeStyle = col;
    g.globalAlpha = alpha * (0.4 + rng() * 0.6);
    g.lineWidth = w;
    const offs = T ? [-T, 0, T] : [0];
    for (const ox of offs)
      for (const oy of offs) {
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
        g.stroke();
      }
  }
  g.restore();
}

function noisy(img: ImageData, rng: Rng, amp: number): void {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * amp;
    d[i] = clamp(d[i] + n, 0, 255);
    d[i + 1] = clamp(d[i + 1] + n, 0, 255);
    d[i + 2] = clamp(d[i + 2] + n, 0, 255);
  }
}

const INK_PX = 1.2; // ink texture pixels per logical unit
const inkCache = new Map<InkName, HTMLCanvasElement>();

function bakeTile(name: Exclude<InkName, "rainbow">, rng: Rng): HTMLCanvasElement {
  const T = 160, px = Math.round(T * INK_PX);
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d") as Ctx;
  const [base, streak, fleck] = TILE_INKS[name];
  g.fillStyle = base;
  g.fillRect(0, 0, px, px);
  g.setTransform(INK_PX, 0, 0, INK_PX, 0, 0);
  if (name === "teal" || name === "sun") {
    // two crayons laid over each other in patches
    for (let i = 0; i < 26; i++) {
      const x = rng() * T, y = rng() * T, r = 10 + rng() * 22;
      g.fillStyle = streak;
      g.globalAlpha = 0.55;
      for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) {
        g.beginPath();
        g.ellipse(x + ox, y + oy, r * 1.8, r * 0.7, -0.35, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
  }
  streaks(g, rng, 90, T, T, -0.35, streak, 0.55, T);
  streaks(g, rng, 60, T, T, -0.35, "#FFFFFF", 0.22, T);
  streaks(g, rng, 50, T, T, -0.35, "#000000", 0.12, T);
  streaks(g, rng, 8, T, T, -0.35, fleck, 0.6, T);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const img = g.getImageData(0, 0, px, px);
  noisy(img, rng, 26);
  g.putImageData(img, 0, 0);
  return c;
}

/** Full-page diagonal crayon bands with wobbly, waxy borders (the classic rainbow scratch sheet). */
function bakeRainbow(rng: Rng): HTMLCanvasElement {
  const px = Math.round(1000 * INK_PX);
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d") as Ctx;
  const img = g.createImageData(px, px);
  const d = img.data;
  const ph = [rng() * 6.3, rng() * 6.3, rng() * 6.3];
  const BW = 58; // band width, logical units
  const ca = Math.cos(-0.35), sa = Math.sin(-0.35);
  for (let j = 0; j < px; j++) {
    const y = j / INK_PX;
    for (let i = 0; i < px; i++) {
      const x = i / INK_PX;
      const u = -x * sa + y * ca; // across the bands
      const v = x * ca + y * sa; // along the bands
      const wob = 9 * Math.sin(v * 0.021 + ph[0]) + 5 * Math.sin(v * 0.057 + ph[1]) + 2.5 * Math.sin(v * 0.13 + u * 0.05 + ph[2]);
      const q = (u + wob + 2000) / BW;
      const k = Math.floor(q), f = q - k;
      const c0 = BANDS[k % 6], c1 = BANDS[(k + 1) % 6];
      // crayon overlap at the border: a narrow waxy blend
      const m = f > 0.86 ? (f - 0.86) / 0.14 : 0;
      const o = (j * px + i) * 4;
      d[o] = c0[0] + (c1[0] - c0[0]) * m;
      d[o + 1] = c0[1] + (c1[1] - c0[1]) * m;
      d[o + 2] = c0[2] + (c1[2] - c0[2]) * m;
      d[o + 3] = 255;
    }
  }
  noisy(img, rng, 24);
  g.putImageData(img, 0, 0);
  g.setTransform(INK_PX, 0, 0, INK_PX, 0, 0);
  streaks(g, rng, 1400, 1000, 1000, -0.35, "#FFFFFF", 0.2);
  streaks(g, rng, 900, 1000, 1000, -0.35, "#000000", 0.1);
  return c;
}

function inkCanvas(name: InkName, host: SceneHost): HTMLCanvasElement {
  let c = inkCache.get(name);
  if (!c) {
    const seed = 4100 + Object.keys(TILE_INKS).indexOf(name) * 17;
    c = name === "rainbow" ? bakeRainbow(host.rng(4099)) : bakeTile(name, host.rng(seed));
    inkCache.set(name, c);
  }
  return c;
}

export type Inks = (name: InkName) => CanvasPattern;

function makeInks(g: Ctx, host: SceneHost): Inks {
  const pats = new Map<InkName, CanvasPattern>();
  return (name) => {
    let p = pats.get(name);
    if (!p) {
      p = g.createPattern(inkCanvas(name, host), name === "rainbow" ? "no-repeat" : "repeat") as CanvasPattern;
      p.setTransform(new DOMMatrix([1 / INK_PX, 0, 0, 1 / INK_PX, 0, 0]));
      pats.set(name, p);
    }
    return p;
  };
}

// ---------- scratches ----------

export interface Scratch {
  a: Pt[]; // main pass
  b: Pt[]; // second, rougher pass
  cum: number[];
  len: number;
  w: number;
  burrs: [number, number, number, number][]; // x, y, r, arc position
}

function resample(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

/** A hand-scraped stroke along `pts`: jittered double pass and burr flecks at the edges (seeded, baked once). */
export function scratch(pts: Pt[], w: number, rng: Rng, rough = 1): Scratch {
  const r = resample(pts, Math.max(3, w * 0.9));
  const cum = [0];
  for (let i = 1; i < r.length; i++) cum.push(cum[i - 1] + Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]));
  const len = cum[cum.length - 1];
  const nrm = (i: number): Pt => {
    const p = r[Math.max(0, i - 1)], q = r[Math.min(r.length - 1, i + 1)];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [-(q[1] - p[1]) / l, (q[0] - p[0]) / l];
  };
  const p1 = rng() * 6.3, p2 = rng() * 6.3;
  const a: Pt[] = [], b: Pt[] = [];
  r.forEach((p, i) => {
    const [nx, ny] = nrm(i);
    const s = cum[i];
    const j1 = rough * w * 0.1 * Math.sin(s * 0.09 + p1) + rough * w * 0.05 * (rng() - 0.5);
    const j2 = rough * w * 0.22 * Math.sin(s * 0.05 + p2) + rough * w * 0.12 * (rng() - 0.5);
    a.push([p[0] + nx * j1, p[1] + ny * j1]);
    b.push([p[0] + nx * j2, p[1] + ny * j2]);
  });
  const burrs: Scratch["burrs"] = [];
  const nb = Math.floor((len / 9) * rough);
  for (let k = 0; k < nb; k++) {
    const s = rng() * len;
    let i = 0;
    while (i < cum.length - 1 && cum[i + 1] < s) i++;
    const [nx, ny] = nrm(i);
    const side = rng() < 0.5 ? -1 : 1;
    const o = side * w * (0.5 + rng() * 0.45);
    burrs.push([r[i][0] + nx * o, r[i][1] + ny * o, w * (0.06 + rng() * 0.16), s]);
  }
  return { a, b, cum, len, w, burrs };
}

function prefix(path: Pt[], cum: number[], upto: number, g: Ctx): void {
  g.moveTo(path[0][0], path[0][1]);
  for (let i = 1; i < path.length; i++) {
    if (cum[i] <= upto) g.lineTo(path[i][0], path[i][1]);
    else {
      const k = (upto - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      g.lineTo(lerp(path[i - 1][0], path[i][0], k), lerp(path[i - 1][1], path[i][1], k));
      return;
    }
  }
}

/** Reveal the crayon under a scratch, optionally only the first `frac` of its length (arc-length reveal). */
export function drawScratch(g: Ctx, s: Scratch, ink: CanvasPattern | string, frac = 1, burrs = true): void {
  if (frac <= 0 || s.a.length < 2) return;
  const upto = s.len * clamp(frac);
  g.strokeStyle = ink;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.lineWidth = s.w;
  g.beginPath();
  prefix(s.a, s.cum, upto, g);
  g.stroke();
  g.lineWidth = s.w * 0.62;
  g.beginPath();
  prefix(s.b, s.cum, upto, g);
  g.stroke();
  if (burrs && s.burrs.length) {
    g.fillStyle = ink;
    g.beginPath();
    for (const [x, y, r, at] of s.burrs) {
      if (at > upto) continue;
      g.moveTo(x + r, y);
      g.arc(x, y, r, 0, Math.PI * 2);
    }
    g.fill();
  }
}

/** Many scratches of one width in one ink, two passes, no burrs: one path per pass (cheap per-frame batches). */
export function drawBatch(g: Ctx, ss: Scratch[], ink: CanvasPattern | string): void {
  if (!ss.length) return;
  g.strokeStyle = ink;
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const pass of [0, 1]) {
    g.lineWidth = ss[0].w * (pass ? 0.62 : 1);
    g.beginPath();
    for (const s of ss) {
      const p = pass ? s.b : s.a;
      p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    }
    g.stroke();
  }
}

/** Scraper grain: a hair of black left inside wide scratches (bake only). */
export function grain(g: Ctx, s: Scratch, rng: Rng): void {
  if (s.w < 7) return;
  g.save();
  g.strokeStyle = "rgba(17,17,17,0.45)";
  g.lineWidth = Math.max(0.7, s.w * 0.07);
  const o = (rng() - 0.5) * s.w * 0.45;
  g.beginPath();
  s.a.forEach(([x, y], i) => {
    const p = s.a[Math.max(0, i - 1)], q = s.a[Math.min(s.a.length - 1, i + 1)];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const nx = -(q[1] - p[1]) / l, ny = (q[0] - p[0]) / l;
    if (i) g.lineTo(x + nx * o, y + ny * o);
    else g.moveTo(x + nx * o, y + ny * o);
  });
  g.stroke();
  g.restore();
}

/** Parallel hatching clipped to a closed outline (bake only, or small dynamic areas). */
export function hatchLines(clip: Pt[], ang: number, gap: number, w: number, rng: Rng, rough = 0.6): Scratch[] {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of clip) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  const c = Math.cos(ang), s = Math.sin(ang);
  const out: Scratch[] = [];
  for (let u = -R; u <= R; u += gap) {
    const uu = u + (rng() - 0.5) * gap * 0.3;
    const p: Pt = [cx - s * uu, cy + c * uu];
    // intersect the infinite line with the polygon, keep inside spans
    const ts: number[] = [];
    for (let i = 0; i < clip.length; i++) {
      const A = clip[i], B = clip[(i + 1) % clip.length];
      const ex = B[0] - A[0], ey = B[1] - A[1];
      const den = c * ey - s * ex;
      if (Math.abs(den) < 1e-9) continue;
      const tt = ((A[0] - p[0]) * ey - (A[1] - p[1]) * ex) / den;
      const k = ((A[0] - p[0]) * s - (A[1] - p[1]) * c) / den;
      if (k >= 0 && k < 1) ts.push(tt);
    }
    ts.sort((m, n) => m - n);
    for (let i = 0; i + 1 < ts.length; i += 2) {
      const ta = ts[i] + w, tb = ts[i + 1] - w;
      if (tb - ta < 4) continue;
      out.push(scratch([[p[0] + c * ta, p[1] + s * ta], [p[0] + c * tb, p[1] + s * tb]], w, rng, rough));
    }
  }
  return out;
}

export function circle(cx: number, cy: number, rx: number, ry = rx, a0 = 0, a1 = Math.PI * 2, n = 0): Pt[] {
  const m = n || Math.max(12, Math.ceil((Math.abs(a1 - a0) * Math.max(rx, ry)) / 8));
  const out: Pt[] = [];
  for (let i = 0; i <= m; i++) {
    const a = a0 + ((a1 - a0) * i) / m;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
export const rectPts = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];

// ---------- shared figures ----------

export interface Block {
  x0: number; y0: number; x1: number; y1: number; d: number; // front face + depth offset (up-right)
}

/** Crystal block outline (front, top, side) as scratches; top face lightly hatched. */
export function blockScratches(b: Block, rng: Rng, w = 7, hatchTop = true): Scratch[] {
  const { x0, y0, x1, y1, d } = b;
  const out = [
    scratch(rectPts(x0, y0, x1, y1), w, rng),
    scratch([[x0, y0], [x0 + d, y0 - d], [x1 + d, y0 - d], [x1, y0]], w, rng),
    scratch([[x1 + d, y0 - d], [x1 + d, y1 - d], [x1, y1]], w, rng),
  ];
  if (hatchTop) out.push(...hatchLines([[x0, y0], [x0 + d, y0 - d], [x1 + d, y0 - d], [x1, y0]], -0.62, 13, 2.6, rng));
  out.push(...hatchLines([[x1, y0], [x1 + d, y0 - d], [x1 + d, y1 - d], [x1, y1]], 1.2, 13, 2.6, rng));
  return out;
}

/** The book-wide crystal arrow (polar c axis, + end up). */
export function arrowScratches(x: number, yTail: number, yHead: number, rng: Rng, w = 11): Scratch[] {
  const h = Math.min(54, (yTail - yHead) * 0.3);
  return [
    scratch([[x, yTail], [x, yHead + 8]], w, rng),
    scratch([[x - h * 0.62, yHead + h], [x, yHead], [x + h * 0.62, yHead + h]], w, rng),
  ];
}

// ---------- scene wrapper ----------

export interface Kit {
  host: SceneHost;
  ink: Inks;
}

export interface PageImpl {
  settle: number;
  /** Static scratches into the black base (called again after a resize, with a fresh rng of the same seed). */
  bake(g: Ctx, rng: Rng): void;
  /** Moving scratches at time t. */
  draw(g: Ctx, t: number): void;
  down?(x: number, y: number, t: number): number; // returns seconds to keep the loop awake
  move?(x: number, y: number, t: number): number;
  up?(t: number): number;
  drag?: boolean; // claim vertical drags (touch-action: none)
}

function blackCoat(g: Ctx, rng: Rng): void {
  g.fillStyle = BLACK;
  g.fillRect(0, 0, 1000, 1000);
  const sh = g.createLinearGradient(0, 0, 1000, 1000);
  sh.addColorStop(0, "rgba(255,255,255,0.05)");
  sh.addColorStop(0.35, "rgba(255,255,255,0.0)");
  sh.addColorStop(0.55, "rgba(255,255,255,0.035)");
  sh.addColorStop(1, "rgba(255,255,255,0.0)");
  g.fillStyle = sh;
  g.fillRect(0, 0, 1000, 1000);
  g.fillStyle = "rgba(255,255,255,0.025)";
  for (let i = 0; i < 1600; i++) g.fillRect(rng() * 1000, rng() * 1000, 1 + rng() * 3, 0.8);
}

export function makeScene(host: SceneHost, seed: number, build: (k: Kit) => PageImpl): Scene {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:manipulation";
  host.el.appendChild(canvas);
  const ctx = canvas.getContext("2d") as Ctx;
  const kit: Kit = { host, ink: makeInks(ctx, host) };
  const page = build(kit);
  if (page.drag) canvas.style.touchAction = "none";
  const base = document.createElement("canvas");
  let s = 1, px = 0;
  const size = (): void => {
    const css = host.el.clientWidth || 600;
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const want = Math.max(200, Math.round(css * dpr));
    if (Math.abs(want - px) <= 2) return;
    px = want;
    s = px / 1000;
    canvas.width = canvas.height = base.width = base.height = px;
    const bg = base.getContext("2d") as Ctx;
    bg.setTransform(s, 0, 0, s, 0, 0);
    const rng = host.rng(seed);
    blackCoat(bg, rng);
    // scraped page border, a hair inside the edge
    const ink = kit.ink("rainbow");
    drawScratch(bg, scratch([[18, 18], [982, 18], [982, 982], [18, 982], [18, 18]], 4, rng, 0.6), ink, 1, false);
    page.bake(bg, rng);
  };
  let lastT = 0;
  const frame = (t: number): void => {
    lastT = t;
    size();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.save();
    page.draw(ctx, t);
    ctx.restore();
  };
  const at = (e: PointerEvent): Pt => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 1000, ((e.clientY - r.top) / r.height) * 1000];
  };
  let pid = -1;
  const after = (dur: number): void => {
    if (dur > 0) host.wake(dur);
    if (host.reduced || dur <= 0) frame(lastT);
  };
  const onDown = (e: PointerEvent): void => {
    if (!page.down) return;
    pid = e.pointerId;
    if (page.drag) try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
    const [x, y] = at(e);
    after(page.down(x, y, lastT));
  };
  const onMove = (e: PointerEvent): void => {
    if (!page.move || e.pointerId !== pid) return;
    const [x, y] = at(e);
    after(page.move(x, y, lastT));
  };
  const onUp = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    pid = -1;
    if (page.up) after(page.up(lastT));
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
