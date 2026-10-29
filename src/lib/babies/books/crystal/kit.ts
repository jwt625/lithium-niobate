// Hexagon-patchwork kit: seeded fabric prints, English-paper-pieced hexagon
// patches, felt appliqué with blanket stitch, the stitched arrow, the quilted
// page ground with its binding, and the read-aloud label. All textures are
// baked once into offscreen canvases; frames only blit sprites.

import type { Scene, SceneHost } from "../../types";
import { feltText } from "./letters";

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;
export type Pt = [number, number];

export const PAL = {
  ground: "#1D3352",
  binding: "#7A3B69",
  bindingInk: "#F3DCC4",
  cream: "#F7EDD6",
  ecru: "#EFE2C4",
  ivory: "#FAF3E3",
  tan: "#C9A878",
  rose: "#D98C7E",
  room: "#5A7FAE",
  roomInk: "#DDE7F2",
  li: "#D9452F",
  liInk: "#FFF1E2",
  nb: "#F2B032",
  nbInk: "#B8741A",
  arrow: "#3FA34D",
  arrowEdge: "#1E5E29",
  thread: "#F7EDD6",
  threadDark: "#4A3220",
  gold: "#E1A92F",
  apricot: "#F2A98A",
  letters: "#1D3352",
  label: "#FBF4E4",
};

export const SQ3 = Math.sqrt(3);
export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const ease = (x: number): number => {
  const k = clamp(x);
  return 1 - (1 - k) ** 3;
};
export const easeIO = (x: number): number => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};
export const easeBack = (x: number): number => {
  const k = clamp(x) - 1;
  return 1 + 2.4 * k * k * k + 1.4 * k * k;
};

export interface Layer {
  c: HTMLCanvasElement;
  g: Ctx;
}
export function layer(w: number, h: number, s: number): Layer {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w * s));
  c.height = Math.max(1, Math.ceil(h * s));
  const g = c.getContext("2d") as Ctx;
  g.setTransform(s, 0, 0, s, 0, 0);
  return { c, g };
}

// ---------- fabric prints ----------

export type Print = "plain" | "dots" | "gingham" | "floral" | "pin" | "felt" | "lame" | "linen";

function wrapDot(g: Ctx, x: number, y: number, r: number, T: number): void {
  for (const dx of [-T, 0, T])
    for (const dy of [-T, 0, T]) {
      g.beginPath();
      g.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      g.fill();
    }
}

/** Seamless seeded fabric tile as a CanvasPattern in logical units. */
export function fabric(s: number, rng: Rng, print: Print, base: string, ink: string, T = 40, ink2 = "#FFFFFF"): CanvasPattern {
  // tile is an exact multiple of 4 device pixels so the weave stays pixel-aligned (no moire)
  const Tpx = Math.max(8, 4 * Math.round((T * s) / 4));
  const c = document.createElement("canvas");
  c.width = c.height = Tpx;
  const g = c.getContext("2d") as Ctx;
  g.fillStyle = base;
  g.fillRect(0, 0, Tpx, Tpx);
  if (print !== "felt") {
    for (let y = 0; y < Tpx; y += 2) {
      g.fillStyle = (y / 2) % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)";
      g.fillRect(0, y, Tpx, 1);
    }
    for (let x = 0; x < Tpx; x += 2) {
      g.fillStyle = (x / 2) % 2 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      g.fillRect(x, 0, 1, Tpx);
    }
    for (let k = 0; k < Tpx / 6; k++) {
      g.fillStyle = rng() < 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
      const x = Math.floor(rng() * Tpx);
      const y = Math.floor(rng() * (Tpx / 2)) * 2;
      const len = 3 + Math.floor(rng() * 8);
      g.fillRect(x, y, len, 1);
      if (x + len > Tpx) g.fillRect(x - Tpx, y, len, 1);
    }
  }
  const sT = Tpx / T;
  g.setTransform(sT, 0, 0, sT, 0, 0);
  g.fillStyle = ink;
  if (print === "dots") {
    const d = T / 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) wrapDot(g, (i + (j % 2) * 0.5) * d + d / 4, j * d + d / 2, T * 0.06, T);
  } else if (print === "gingham") {
    g.globalAlpha = 0.32;
    for (let k = 0; k < 2; k++) {
      g.fillRect(0, k * (T / 2), T, T / 4);
      g.fillRect(k * (T / 2), 0, T / 4, T);
    }
    g.globalAlpha = 1;
  } else if (print === "floral") {
    for (const [cx, cy] of [
      [T * 0.27, T * 0.3],
      [T * 0.77, T * 0.78],
    ] as Pt[]) {
      g.fillStyle = ink;
      for (let p = 0; p < 5; p++) {
        const a = (p * 2 * Math.PI) / 5;
        wrapDot(g, cx + Math.cos(a) * T * 0.075, cy + Math.sin(a) * T * 0.075, T * 0.055, T);
      }
      g.fillStyle = ink2;
      wrapDot(g, cx, cy, T * 0.04, T);
    }
  } else if (print === "pin") {
    for (let k = 0; k < 14; k++) wrapDot(g, rng() * T, rng() * T, T * 0.025, T);
  } else if (print === "felt") {
    for (let k = 0; k < 70; k++) {
      g.fillStyle = rng() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
      wrapDot(g, rng() * T, rng() * T, 1 + rng() * 4, T);
    }
  } else if (print === "lame") {
    g.strokeStyle = ink;
    g.lineWidth = T * 0.05;
    g.globalAlpha = 0.5;
    for (let k = -2; k < 4; k++) {
      g.beginPath();
      g.moveTo(k * (T / 2), 0);
      g.lineTo(k * (T / 2) + T, T);
      g.stroke();
    }
    g.globalAlpha = 1;
  } else if (print === "linen") {
    for (let k = 0; k < 30; k++) {
      g.fillStyle = rng() < 0.5 ? "rgba(120,90,50,0.08)" : "rgba(255,255,255,0.12)";
      const x = rng() * T;
      const y = rng() * T;
      g.fillRect(x, y, 2 + rng() * 9, 0.6);
    }
  }
  const pat = g.createPattern(c, "repeat") as CanvasPattern;
  pat.setTransform(new DOMMatrix().scale(1 / s));
  return pat;
}

// ---------- geometry ----------

export function hexPts(x: number, y: number, R: number): Pt[] {
  const out: Pt[] = [];
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    out.push([x + R * Math.cos(a), y + R * Math.sin(a)]);
  }
  return out;
}
export function poly(g: Ctx, pts: Pt[]): void {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}

/** Blanket stitch along a closed polygon: thread on the edge, legs pointing inward. */
export function blanket(g: Ctx, pts: Pt[], color: string, leg = 6, gap = 8, w = 1.5): void {
  let cx = 0;
  let cy = 0;
  for (const [x, y] of pts) {
    cx += x / pts.length;
    cy += y / pts.length;
  }
  g.save();
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = "round";
  g.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const len = Math.hypot(bx - ax, by - ay);
    let nx = -(by - ay) / len;
    let ny = (bx - ax) / len;
    if (nx * (cx - (ax + bx) / 2) + ny * (cy - (ay + by) / 2) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const n = Math.max(1, Math.round(len / gap));
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      const x = ax + (bx - ax) * u;
      const y = ay + (by - ay) * u;
      g.moveTo(x, y);
      g.lineTo(x + nx * leg, y + ny * leg);
    }
  }
  g.stroke();
  g.restore();
}

export function circlePts(x: number, y: number, r: number, n = 0): Pt[] {
  const m = n || Math.max(12, Math.round((2 * Math.PI * r) / 8));
  const out: Pt[] = [];
  for (let k = 0; k < m; k++) out.push([x + r * Math.cos((k * 2 * Math.PI) / m), y + r * Math.sin((k * 2 * Math.PI) / m)]);
  return out;
}

function puff(g: Ctx, x: number, y: number, r: number, k = 1): void {
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r * 1.15);
  gr.addColorStop(0, `rgba(255,255,255,${0.32 * k})`);
  gr.addColorStop(0.45, "rgba(255,255,255,0)");
  gr.addColorStop(1, `rgba(40,20,0,${0.26 * k})`);
  g.fillStyle = gr;
  g.fill();
}

// ---------- sprites ----------

export interface Sprite {
  c: HTMLCanvasElement;
  h: number;
}
export function blit(g: Ctx, sp: Sprite, x: number, y: number, k = 1, rot = 0, alpha = 1): void {
  if (alpha <= 0 || k <= 0) return;
  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y);
  if (rot) g.rotate(rot);
  g.drawImage(sp.c, -sp.h * k, -sp.h * k, 2 * sp.h * k, 2 * sp.h * k);
  g.restore();
}

export interface BallSpec {
  pat: CanvasPattern;
  r: number;
  stitch: string;
  label?: string;
  labelColor?: string;
  labelXh?: number;
}

function drawBall(g: Ctx, b: BallSpec, x: number, y: number, labeller?: (g: Ctx, t: string, x: number, y: number, xh: number, c: string) => void): void {
  g.save();
  g.shadowColor = "rgba(20,10,0,0.4)";
  g.shadowBlur = 5;
  g.shadowOffsetY = 2.5;
  g.beginPath();
  g.arc(x, y, b.r, 0, Math.PI * 2);
  g.fillStyle = b.pat;
  g.fill();
  g.restore();
  g.beginPath();
  g.arc(x, y, b.r, 0, Math.PI * 2);
  puff(g, x, y, b.r, 1.1);
  blanket(g, circlePts(x, y, b.r), b.stitch, Math.max(4, b.r * 0.17), 7, 1.4);
  if (b.label && labeller) labeller(g, b.label, x, y, b.labelXh ?? b.r * 0.5, b.labelColor ?? PAL.thread);
}

export interface PatchSpec {
  R: number;
  pat?: CanvasPattern;
  stitch: string;
  quilt?: boolean;
  ball?: BallSpec;
  open?: boolean;
}

/** One hexagon patch (or an open template outline) with optional appliqué ball. */
export function patchSprite(
  s: number,
  p: PatchSpec,
  labeller?: (g: Ctx, t: string, x: number, y: number, xh: number, c: string) => void,
): Sprite {
  const h = p.R + 10;
  const { c, g } = layer(2 * h, 2 * h, s);
  const pts = hexPts(h, h, p.R);
  if (p.open) {
    g.save();
    poly(g, hexPts(h, h, p.R - 3));
    g.fillStyle = "rgba(0,0,0,0.16)";
    g.fill();
    g.setLineDash([5, 4]);
    g.strokeStyle = PAL.thread;
    g.globalAlpha = 0.85;
    g.lineWidth = 2;
    g.lineCap = "round";
    g.stroke();
    g.restore();
    return { c, h };
  }
  g.save();
  g.shadowColor = "rgba(0,0,0,0.38)";
  g.shadowBlur = 5 * s;
  g.shadowOffsetY = 2.5 * s;
  poly(g, pts);
  g.fillStyle = p.pat ?? PAL.cream;
  g.fill();
  g.restore();
  poly(g, pts);
  puff(g, h, h, p.R, p.quilt ? 0.5 : 0.8);
  if (p.quilt) {
    const r = p.R * (SQ3 / 2) - 8;
    g.beginPath();
    g.arc(h, h, r, 0, Math.PI * 2);
    puff(g, h, h, r, 1);
    g.save();
    g.setLineDash([4.5, 3.5]);
    g.strokeStyle = PAL.threadDark;
    g.globalAlpha = 0.75;
    g.lineWidth = 1.5;
    g.stroke();
    g.restore();
  }
  poly(g, pts);
  g.strokeStyle = "rgba(30,15,0,0.45)";
  g.lineWidth = 1.2;
  g.stroke();
  g.save();
  poly(g, hexPts(h, h, p.R - 5));
  g.setLineDash([4, 4]);
  g.strokeStyle = p.stitch;
  g.lineWidth = 1.4;
  g.lineCap = "round";
  g.stroke();
  g.restore();
  if (p.ball) drawBall(g, p.ball, h, h, labeller);
  return { c, h };
}

export function ballSprite(s: number, b: BallSpec, labeller?: (g: Ctx, t: string, x: number, y: number, xh: number, c: string) => void): Sprite {
  const h = b.r + 9;
  const { c, g } = layer(2 * h, 2 * h, s);
  drawBall(g, b, h, h, labeller);
  return { c, h };
}

// ---------- arrow (same glyph on every page) ----------

export function arrowPts(len: number): Pt[] {
  const hw = len * 0.27;
  const sw = len * 0.1;
  const hl = len * 0.4;
  const y0 = len / 2;
  const y1 = -len / 2 + hl;
  return [
    [-sw, y0],
    [-sw, y1],
    [-hw, y1],
    [0, -len / 2],
    [hw, y1],
    [sw, y1],
    [sw, y0],
  ];
}

/** Green felt arrow with blanket-stitched edge, centred at (x, y), pointing up at rot = 0. */
export function drawArrow(g: Ctx, felt: CanvasPattern, x: number, y: number, len: number, rot = 0, alpha = 1): void {
  if (alpha <= 0) return;
  const pts = arrowPts(len);
  g.save();
  g.globalAlpha = alpha;
  g.translate(x, y);
  g.rotate(rot);
  g.save();
  g.translate(2, 3);
  poly(g, pts);
  g.fillStyle = "rgba(10,10,0,0.35)";
  g.fill();
  g.restore();
  poly(g, pts);
  g.fillStyle = felt;
  g.fill();
  poly(g, pts);
  const gr = g.createLinearGradient(-len * 0.27, 0, len * 0.27, 0);
  gr.addColorStop(0, "rgba(255,255,255,0.22)");
  gr.addColorStop(0.5, "rgba(255,255,255,0)");
  gr.addColorStop(1, "rgba(0,0,0,0.18)");
  g.fillStyle = gr;
  g.fill();
  blanket(g, pts, PAL.arrowEdge, Math.max(4, len * 0.03), Math.max(6, len * 0.035), Math.max(1.3, len * 0.007));
  g.restore();
}

// ---------- page ground, binding, label ----------

export const ART = { x0: 40, y0: 40, x1: 960, y1: 728 };
const LABEL = { x0: 44, y0: 742, x1: 956, y1: 962 };

export interface Kit {
  host: SceneHost;
  s: number;
  rng: Rng;
  felt: CanvasPattern;
}

function drawGround(g: Ctx, s: number, rng: Rng, text: string): void {
  g.fillStyle = fabric(s, rng, "plain", PAL.ground, PAL.ground, 32);
  g.fillRect(0, 0, 1000, 1000);
  // diagonal quilting lines
  g.save();
  g.setLineDash([6, 6]);
  g.strokeStyle = "rgba(247,237,214,0.14)";
  g.lineWidth = 1.4;
  g.beginPath();
  for (let k = -1000; k < 1000; k += 76) {
    g.moveTo(k, 0);
    g.lineTo(k + 1000, 1000);
    g.moveTo(k + 1000, 0);
    g.lineTo(k, 1000);
  }
  g.stroke();
  g.restore();
  // binding
  const bp = fabric(s, rng, "pin", PAL.binding, PAL.bindingInk, 36);
  g.fillStyle = bp;
  g.fillRect(0, 0, 1000, 22);
  g.fillRect(0, 978, 1000, 22);
  g.fillRect(0, 0, 22, 1000);
  g.fillRect(978, 0, 22, 1000);
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 1.2;
  g.strokeRect(22, 22, 956, 956);
  g.save();
  g.setLineDash([5, 4]);
  g.strokeStyle = PAL.bindingInk;
  g.lineWidth = 1.4;
  g.strokeRect(11, 11, 978, 978);
  g.restore();
  // label patch
  const lp: Pt[] = [
    [LABEL.x0, LABEL.y0],
    [LABEL.x1, LABEL.y0],
    [LABEL.x1, LABEL.y1],
    [LABEL.x0, LABEL.y1],
  ];
  g.save();
  g.shadowColor = "rgba(0,0,0,0.4)";
  g.shadowBlur = 6 * s;
  g.shadowOffsetY = 3 * s;
  poly(g, lp);
  g.fillStyle = fabric(s, rng, "linen", PAL.label, PAL.label, 48);
  g.fill();
  g.restore();
  blanket(g, lp, PAL.letters, 7, 9, 1.6);
  feltText(g, text, 500, (LABEL.y0 + LABEL.y1) / 2 + 4, {
    felt: PAL.letters,
    edge: "#0F1E33",
    stitch: "rgba(247,237,214,0.85)",
    xh: 31,
    maxW: 880,
    lineH: 64,
  });
}

export interface PageImpl {
  settle: number;
  draw(g: Ctx, t: number): void;
  tap?(x: number, y: number, t: number): number;
}

/** Wraps a page: canvas stage, baked ground + label, pointer -> tap(), deterministic frame(t). */
export function makeScene(host: SceneHost, text: string, seed: number, build: (k: Kit, bg: Ctx) => PageImpl): Scene {
  const canvas = document.createElement("canvas");
  const css = host.el.clientWidth || 800;
  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const px = Math.max(200, Math.round(css * dpr));
  canvas.width = canvas.height = px;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:manipulation";
  host.el.appendChild(canvas);
  const ctx = canvas.getContext("2d") as Ctx;
  const s = px / 1000;
  const rng = host.rng(seed);
  const kit: Kit = { host, s, rng, felt: fabric(s, rng, "felt", PAL.arrow, PAL.arrow, 40) };
  const bg = layer(1000, 1000, s);
  drawGround(bg.g, s, rng, text);
  const page = build(kit, bg.g);
  let lastT = 0;
  const frame = (t: number): void => {
    lastT = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg.c, 0, 0);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(22, 22, 956, LABEL.y0 - 30);
    ctx.clip();
    page.draw(ctx, t);
    ctx.restore();
  };
  const onDown = (e: PointerEvent): void => {
    if (!page.tap) return;
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1000;
    const y = ((e.clientY - r.top) / r.height) * 1000;
    const dur = page.tap(x, y, lastT);
    if (dur > 0 && !host.reduced) host.wake(dur);
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
