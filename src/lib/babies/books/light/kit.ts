// Stained-glass kit for the Light book (DevLog-007b, 02 Light): backlit panes with seeded antique-glass streaks and
// bubbles, lead came over them, additive glow for light travelling pane by pane. Canvas2D, logical units 0..1000.
// Layers: glass (baked) -> page tint -> glow ('lighter') -> lead + paint (baked) -> page overlay.
import type { Scene, SceneHost } from "../../types";

export type Pt = [number, number];
export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;

/** Glass palette (DevLog-007b recipe) plus a few mixed tints. */
export const G = {
  cobalt: "#1F4FA8",
  cobaltDeep: "#163A84",
  ruby: "#B3122E",
  emerald: "#1E8A4C",
  amber: "#E2A21B",
  violet: "#5B2A86",
  clear: "#DCE5E7",
  lav: "#C3B6DE",
  lavDeep: "#9C8AC6",
  warm: "#EFE4C4",
  ir: "#6A1420",
  silica: "#A9CBE3",
  slate: "#4B4A66",
  lead: "#1C1C1C",
  paint: "#26170F",
};
export const LIGHT = "255,244,214";
export const GREEN = "70,215,105";
export const IRGLOW = "170,30,45";

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
export const seg = (t: number, a: number, b: number): number => clamp01((t - a) / (b - a));
export const ease = (x: number): number => 1 - (1 - clamp01(x)) ** 3;
export const easeIO = (x: number): number => {
  const v = clamp01(x);
  return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2;
};
export const lerp = (a: number, b: number, x: number): number => a + (b - a) * x;

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Mix a hex colour toward white (k > 0) or black (k < 0). */
export function shade(c: string, k: number): string {
  const [r, g, b] = hex(c);
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

export function polyPath(pts: Pt[], close = true): Path2D {
  const p = new Path2D();
  pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])));
  if (close) p.closePath();
  return p;
}
export function circlePts(cx: number, cy: number, rx: number, ry = rx, n = 48, a0 = 0, a1 = Math.PI * 2): Pt[] {
  const out: Pt[] = [];
  const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const m = full ? n : n + 1;
  for (let i = 0; i < m; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
export const rectPts = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** Ribbon polygon around a centerline (offset by the local normal). */
export function ribbon(c: Pt[], hw: number): Pt[] {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    L.push([c[i][0] + nx * hw, c[i][1] + ny * hw]);
    R.push([c[i][0] - nx * hw, c[i][1] - ny * hw]);
  }
  return L.concat(R.reverse());
}

/** The book-wide crystal arrow (c axis, + end up): same proportions as the other books. Centered at 0,0. */
export function arrowPts(len: number): Pt[] {
  const hw = len * 0.27;
  const sw = len * 0.1;
  const hl = len * 0.4;
  const y0 = len / 2;
  const y1 = -len / 2 + hl;
  return [[-sw, y0], [-sw, y1], [-hw, y1], [0, -len / 2], [hw, y1], [sw, y1], [sw, y0]];
}
export const movePts = (pts: Pt[], dx: number, dy: number, sy = 1): Pt[] => pts.map(([x, y]) => [x + dx, y * sy + dy]);

/** Convex polygon clip by half-plane a*x + b*y <= c (Sutherland-Hodgman). */
function clipHalf(poly: Pt[], a: number, b: number, c: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = a * p[0] + b * p[1] - c;
    const fq = a * q[0] + b * q[1] - c;
    if (fp <= 0) out.push(p);
    if (fp * fq < 0) {
      const k = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]);
    }
  }
  return out;
}
/** Voronoi cells of jittered-grid seeds inside a rectangle. */
export function voronoi(rng: Rng, x0: number, y0: number, x1: number, y1: number, step: number): Pt[][] {
  const seeds: Pt[] = [];
  for (let y = y0 + step / 2; y < y1; y += step * 0.87) {
    const off = ((y - y0) / (step * 0.87)) % 2 < 1 ? 0 : step / 2;
    for (let x = x0 + off; x < x1 + step / 2; x += step) seeds.push([x + (rng() - 0.5) * step * 0.7, y + (rng() - 0.5) * step * 0.6]);
  }
  return seeds.map((s, i) => {
    let poly = rectPts(x0, y0, x1, y1);
    for (let j = 0; j < seeds.length && poly.length; j++) {
      if (j === i) continue;
      const o = seeds[j];
      if (Math.abs(o[0] - s[0]) > step * 2.5 || Math.abs(o[1] - s[1]) > step * 2.5) continue;
      const a = o[0] - s[0];
      const b = o[1] - s[1];
      poly = clipHalf(poly, a, b, (a * (o[0] + s[0]) + b * (o[1] + s[1])) / 2);
    }
    return poly;
  }).filter((p) => p.length > 2);
}

export interface Pane {
  path: Path2D;
  /** Bounding box for the backlight gradient. */
  box: [number, number, number, number];
  color: string;
  /** Backlight strength 0..1 (0.5 default): centre brighter, edges darker. */
  lit?: number;
  lead?: number;
}
export function pane(pts: Pt[], color: string, lit?: number, lead?: number): Pane {
  let x0 = 1e9;
  let y0 = 1e9;
  let x1 = -1e9;
  let y1 = -1e9;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { path: polyPath(pts), box: [x0, y0, x1, y1], color, lit, lead };
}

function layer(px: number): { c: HTMLCanvasElement; g: Ctx } {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  return { c, g: c.getContext("2d") as Ctx };
}

/** Periodic anisotropic value-noise fbm: streaky antique glass. Grayscale with alpha, tiles every 256 units. */
function streakTexture(rng: Rng): HTMLCanvasElement {
  const N = 128;
  const { c, g } = layer(N);
  const lat = (gx: number, gy: number) => {
    const v: number[] = [];
    for (let i = 0; i < gx * gy; i++) v.push(rng());
    return (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const fx = x - xi;
      const fy = y - yi;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const at = (i: number, j: number) => v[(((j % gy) + gy) % gy) * gx + (((i % gx) + gx) % gx)];
      return lerp(lerp(at(xi, yi), at(xi + 1, yi), sx), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), sx), sy);
    };
  };
  const oct = [lat(2, 8), lat(4, 16), lat(8, 32)];
  const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = x / N;
      const w = y / N;
      const n = oct[0](u * 2, w * 8) * 0.55 + oct[1](u * 4, w * 16) * 0.3 + oct[2](u * 8, w * 32) * 0.15;
      const v = n > 0.5 ? 255 : 0;
      const a = Math.min(255, Math.abs(n - 0.5) * 2 * 255 * 1.4);
      const k = (y * N + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = v;
      img.data[k + 3] = a;
    }
  g.putImageData(img, 0, 0);
  return c;
}

let glowSprite: HTMLCanvasElement | null = null;
/** White radial falloff sprite (used tinted through globalAlpha + 'lighter' over coloured fills). */
function sprite(): HTMLCanvasElement {
  if (glowSprite) return glowSprite;
  const { c, g } = layer(128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  glowSprite = c;
  return c;
}

export interface Win {
  host: SceneHost;
  s: number;
  rng: Rng;
  /** Paint a pane on the glass layer and lead it on the lead layer (z-order = call order). */
  add(p: Pane): void;
  addAll(ps: Pane[]): void;
  /** Lead line without a pane (e.g. a came strap). */
  leadLine(pts: Pt[], w?: number): void;
  /** Direct access to the baked glass context (paint after panes, e.g. grisaille). */
  glass: Ctx;
  /** Direct access to the lead/overlay context (drawn above the glow). */
  over: Ctx;
}

const LEAD_W = 9;

export function strokeLead(g: Ctx, path: Path2D, w = LEAD_W): void {
  g.save();
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = G.lead;
  g.lineWidth = w;
  g.stroke(path);
  g.translate(-0.8, -0.9);
  g.strokeStyle = "rgba(120,120,118,0.75)";
  g.lineWidth = Math.max(1.2, w * 0.17);
  g.stroke(path);
  g.restore();
}

/** Backlit glass fill: radial backlight, streak texture, a few bubbles. */
export function fillGlass(g: Ctx, p: Pane, tex: CanvasPattern, rng: Rng): void {
  const [x0, y0, x1, y1] = p.box;
  const lit = p.lit ?? 0.5;
  const cx = lerp(x0, x1, 0.42 + rng() * 0.16);
  const cy = lerp(y0, y1, 0.38 + rng() * 0.16);
  const r = Math.max(30, Math.hypot(x1 - x0, y1 - y0) * 0.62);
  g.save();
  g.clip(p.path);
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, shade(p.color, 0.42 * lit));
  gr.addColorStop(0.55, shade(p.color, 0.08 * lit));
  gr.addColorStop(1, shade(p.color, -0.3 + 0.1 * lit));
  g.fillStyle = gr;
  g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  g.globalAlpha = 0.16;
  g.globalCompositeOperation = "soft-light";
  const m = new DOMMatrix().translateSelf(rng() * 256, rng() * 256).rotateSelf((rng() - 0.5) * 50);
  tex.setTransform(m.scaleSelf(2, 2));
  g.fillStyle = tex;
  g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  const area = (x1 - x0) * (y1 - y0);
  const nb = Math.min(5, Math.floor((area / 9000) * rng() + rng() * 1.4));
  for (let i = 0; i < nb; i++) {
    const bx = lerp(x0, x1, 0.15 + rng() * 0.7);
    const by = lerp(y0, y1, 0.15 + rng() * 0.7);
    const br = 1.2 + rng() * 2.4;
    g.beginPath();
    g.ellipse(bx, by, br * 1.3, br, 0, 0, Math.PI * 2);
    g.strokeStyle = "rgba(255,255,255,0.32)";
    g.lineWidth = 0.9;
    g.stroke();
  }
  g.restore();
}

export interface PageImpl {
  settle: number;
  /** Before glow, after baked glass (source-over). */
  under?(g: Ctx, t: number): void;
  /** Additive light ('lighter' is set). */
  glow?(g: Ctx, t: number): void;
  /** Above the lead layer (moving leaded pieces, bloom). */
  over?(g: Ctx, t: number): void;
  /** Pointer down at logical x, y; returns seconds to wake (0 = ignore). */
  tap?(x: number, y: number, t: number): number;
}

/** Glow helpers bound to the sprite. */
export function blob(g: Ctx, x: number, y: number, r: number, a: number): void {
  if (a <= 0.003) return;
  g.globalAlpha = Math.min(1, a);
  g.drawImage(sprite(), x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}
export function glowFill(g: Ctx, path: Path2D, rgb: string, a: number): void {
  if (a <= 0.003) return;
  g.fillStyle = `rgba(${rgb},${Math.min(1, a)})`;
  g.fill(path);
}

/** Canvas stage with baked glass + lead layers; `build` adds panes and returns the page's dynamic parts. */
export function makeWindow(host: SceneHost, seed: number, build: (w: Win) => PageImpl): Scene {
  const canvas = document.createElement("canvas");
  const css = host.el.clientWidth || 800;
  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const px = Math.max(200, Math.round(css * dpr));
  canvas.width = canvas.height = px;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:manipulation;cursor:pointer";
  host.el.appendChild(canvas);
  const ctx = canvas.getContext("2d") as Ctx;
  const s = px / 1000;
  const rng = host.rng(seed);
  const gl = layer(px);
  const ld = layer(px);
  gl.g.setTransform(s, 0, 0, s, 0, 0);
  ld.g.setTransform(s, 0, 0, s, 0, 0);
  const tex = gl.g.createPattern(streakTexture(host.rng(seed + 99)), "repeat") as CanvasPattern;
  gl.g.fillStyle = "#121212";
  gl.g.fillRect(0, 0, 1000, 1000);
  const w: Win = {
    host,
    s,
    rng,
    glass: gl.g,
    over: ld.g,
    add(p) {
      fillGlass(gl.g, p, tex, rng);
      ld.g.save();
      ld.g.globalCompositeOperation = "destination-out";
      ld.g.fill(p.path);
      ld.g.restore();
      strokeLead(ld.g, p.path, p.lead ?? LEAD_W);
    },
    addAll(ps) {
      for (const p of ps) w.add(p);
    },
    leadLine(pts, lw) {
      strokeLead(ld.g, polyPath(pts, false), lw ?? LEAD_W);
    },
  };
  const page = build(w);
  let lastT = 0;
  const frame = (t: number): void => {
    lastT = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(gl.c, 0, 0);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    if (page.under) page.under(ctx, t);
    if (page.glow) {
      ctx.globalCompositeOperation = "lighter";
      page.glow(ctx, t);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(ld.c, 0, 0);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    if (page.over) page.over(ctx, t);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };
  const onDown = (e: PointerEvent): void => {
    if (!page.tap) return;
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1000;
    const y = ((e.clientY - r.top) / r.height) * 1000;
    const dur = page.tap(x, y, lastT);
    if (dur > 0) host.wake(host.reduced ? 0.05 : dur);
    frame(lastT);
  };
  canvas.addEventListener("pointerdown", onDown);
  return {
    frame,
    settle: page.settle,
    destroy() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.remove();
    },
  };
}

/** Window frame: outer ruby border band with clear pearls, amber corner squares, and a ruby divider above the banner. */
export function frameAndField(w: Win, fieldBottom: number, ground: "cobalt" | "silica" = "cobalt"): void {
  const { rng } = w;
  // field ground mosaic
  const cells = voronoi(rng, 46, 46, 954, fieldBottom, 92);
  for (const c of cells) {
    const r = rng();
    const col = ground === "cobalt" ? (r < 0.22 ? G.cobaltDeep : r < 0.3 ? "#2A5DB8" : G.cobalt) : r < 0.3 ? "#9DC0DA" : "#B5D2E6";
    w.add(pane(c, col, 0.55));
  }
  // border band: ruby segments between pearls
  const B0 = 14;
  const B1 = 46;
  const bandSeg = (x0: number, y0: number, x1: number, y1: number) => w.add(pane(rectPts(x0, y0, x1, y1), G.ruby, 0.5));
  const n = 7;
  const L = 1000 - 2 * B1;
  for (let i = 0; i < n; i++) {
    const a = B1 + (L * i) / n;
    const b = B1 + (L * (i + 1)) / n;
    bandSeg(a, B0, b, B1);
    bandSeg(a, 1000 - B1, b, 1000 - B0);
    bandSeg(B0, a, B1, b);
    bandSeg(1000 - B1, a, 1000 - B0, b);
  }
  for (const [x, y] of [[B0, B0], [1000 - B1, B0], [B0, 1000 - B1], [1000 - B1, 1000 - B1]] as Pt[]) w.add(pane(rectPts(x, y, x + B1 - B0, y + B1 - B0), G.amber, 0.6));
  const pearls: Pt[] = [];
  for (let i = 1; i < n; i++) {
    const a = B1 + (L * i) / n;
    const m = (B0 + B1) / 2;
    pearls.push([a, m], [a, 1000 - m], [m, a], [1000 - m, a]);
  }
  for (const [x, y] of pearls) w.add(pane(circlePts(x, y, 10, 10, 20), G.clear, 0.8, 6));
  // divider band between picture and banner
  const d0 = fieldBottom;
  const d1 = fieldBottom + 26;
  const k = 5;
  for (let i = 0; i < k; i++) w.add(pane(rectPts(B1 + (L * i) / k, d0, B1 + (L * (i + 1)) / k, d1), i % 2 ? G.amber : G.ruby, 0.5));
  // outer lead border
  w.leadLine([[B0, B0], [1000 - B0, B0], [1000 - B0, 1000 - B0], [B0, 1000 - B0], [B0, B0]], 14);
}
