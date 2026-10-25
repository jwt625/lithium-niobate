// Minimal SVG plotting for chapter 04 figures: linear or log axes mapped to pixel ranges, tick lists, polyline paths.
// Pure functions (server prerender and browser give the same strings); colors come from CSS variables on the SVG.
import { pow10 } from "./fmtq.ts";

export interface Axis { lo: number; hi: number; log: boolean; p0: number; p1: number }
export const axis = (lo: number, hi: number, p0: number, p1: number, log = false): Axis => ({ lo, hi, log, p0, p1 });

/** Data value to pixel (values outside the range extrapolate; callers clamp where needed). */
export function px(a: Axis, v: number): number {
  const t = a.log ? (Math.log10(v) - Math.log10(a.lo)) / (Math.log10(a.hi) - Math.log10(a.lo)) : (v - a.lo) / (a.hi - a.lo);
  return a.p0 + t * (a.p1 - a.p0);
}
export const clampPx = (a: Axis, v: number): number => Math.min(Math.max(a.p0, a.p1), Math.max(Math.min(a.p0, a.p1), px(a, v)));
/** Pixel to data value. */
export function inv(a: Axis, p: number): number {
  const t = (p - a.p0) / (a.p1 - a.p0);
  return a.log ? 10 ** (Math.log10(a.lo) + t * (Math.log10(a.hi) - Math.log10(a.lo))) : a.lo + t * (a.hi - a.lo);
}

export interface Tick { v: number; p: number; label: string; major: boolean }
/** Ticks: log axes get every decade (labels every `every` decades); linear axes a 1-2-5 step near n ticks. */
export function ticks(a: Axis, n = 5, every = 1, fmt?: (v: number) => string): Tick[] {
  const out: Tick[] = [];
  if (a.log) {
    const e0 = Math.ceil(Math.log10(a.lo) - 1e-9), e1 = Math.floor(Math.log10(a.hi) + 1e-9);
    for (let k = e0; k <= e1; k++) {
      const v = 10 ** k;
      out.push({ v, p: px(a, v), label: (k - e0) % every === 0 ? (fmt ? fmt(v) : pow10(k)) : "", major: (k - e0) % every === 0 });
    }
    return out;
  }
  const span = a.hi - a.lo;
  const raw = span / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw * 0.999) ?? 10 * mag;
  const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  for (let v = Math.ceil(a.lo / step - 1e-9) * step; v <= a.hi + step * 1e-6; v += step) {
    const vv = Math.abs(v) < step * 1e-9 ? 0 : v;
    out.push({ v: vv, p: px(a, vv), label: fmt ? fmt(vv) : (vv < 0 ? "−" : "") + Math.abs(vv).toFixed(d), major: true });
  }
  return out;
}

/** Polyline path "M x y L ..." with breaks at non-finite points; y clamped to the axis range (2 px margin). */
export function path(xa: Axis, ya: Axis, xs: ArrayLike<number>, ys: ArrayLike<number>, clampY = true): string {
  let s = "";
  let pen = false;
  const ylo = Math.min(ya.p0, ya.p1) - 2, yhi = Math.max(ya.p0, ya.p1) + 2;
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i], y = ys[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || (xa.log && x <= 0) || (ya.log && y <= 0)) { pen = false; continue; }
    let Y = px(ya, y);
    if (clampY) Y = Math.min(yhi, Math.max(ylo, Y));
    s += `${pen ? "L" : "M"}${px(xa, x).toFixed(1)} ${Y.toFixed(1)}`;
    pen = true;
  }
  return s;
}
/** Log-spaced samples between lo and hi (inclusive). */
export function logspace(lo: number, hi: number, n: number): Float64Array {
  const a = Math.log10(lo), b = Math.log10(hi);
  return Float64Array.from({ length: n }, (_, i) => 10 ** (a + ((b - a) * i) / (n - 1)));
}
export function linspace(lo: number, hi: number, n: number): Float64Array {
  return Float64Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}
