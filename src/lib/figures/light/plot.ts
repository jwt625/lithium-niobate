// Chapter 02 plot kit: deterministic SVG strings (same output on the server for the prerendered default state and in the
// browser on every update), linear and log scales, ticks, axes, paths with gaps at non-finite values. Styling by class
// (src/lib/figures/light/light.css): .gl grid, .ax axis, .tk tick label, .al axis label, .s1..s6 series (TECH: dash
// patterns, monochrome; VISUAL: optics colors), .cur cursor, .mk markers. Coordinates rounded to 0.1 user unit.

export type ScaleKind = "lin" | "log";
export interface Tick { v: number; label: string; major: boolean }
export interface Scale { kind: ScaleKind; d: [number, number]; r: [number, number]; f: (v: number) => number; inv: (px: number) => number }

export function scale(kind: ScaleKind, d0: number, d1: number, r0: number, r1: number): Scale {
  if (kind === "log") {
    const a = Math.log10(d0), b = Math.log10(d1);
    return { kind, d: [d0, d1], r: [r0, r1], f: (v) => r0 + ((Math.log10(v) - a) / (b - a)) * (r1 - r0), inv: (p) => 10 ** (a + ((p - r0) / (r1 - r0)) * (b - a)) };
  }
  return { kind, d: [d0, d1], r: [r0, r1], f: (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0), inv: (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0) };
}

const MINUS = "−";
/** Plain number label with a typographic minus, trimmed trailing zeros. */
export function numLabel(v: number, digits = 6): string {
  if (v === 0) return "0";
  let s = Number(v.toPrecision(digits)).toString();
  if (/e/.test(s)) s = v.toExponential(1);
  return s.replace("-", MINUS);
}
/** Decade label: 1, 10, 100, 0.1, 0.01 for |e| <= 3, else 10^e as SVG tspans. */
export function decadeLabel(v: number): string {
  const e = Math.round(Math.log10(v));
  if (e >= -2 && e <= 3) return numLabel(10 ** e);
  return `10<tspan dy="-0.45em" font-size="0.72em">${e < 0 ? MINUS : ""}${Math.abs(e)}</tspan>`;
}

export function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target), p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}
export function ticks(s: Scale, target = 5, fmt?: (v: number) => string): Tick[] {
  const [lo, hi] = s.d[0] < s.d[1] ? s.d : [s.d[1], s.d[0]];
  const out: Tick[] = [];
  if (s.kind === "log") {
    const e0 = Math.floor(Math.log10(lo) + 1e-9), e1 = Math.ceil(Math.log10(hi) - 1e-9);
    const dec = e1 - e0, every = dec > 8 ? 2 : 1;
    for (let e = e0; e <= e1; e++) {
      const v = 10 ** e;
      if (v >= lo * (1 - 1e-9) && v <= hi * (1 + 1e-9) && (e - e0) % every === 0) out.push({ v, label: fmt ? fmt(v) : decadeLabel(v), major: true });
      if (dec <= 4) for (let k = 2; k <= 9; k++) { const w = k * v; if (w > lo && w < hi) out.push({ v: w, label: "", major: false }); }
    }
    return out;
  }
  const st = niceStep(hi - lo, target), d = Math.max(0, -Math.floor(Math.log10(st) + 1e-9));
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-9; v += st) {
    const r = Math.abs(v) < st * 1e-9 ? 0 : v;
    out.push({ v: r, label: fmt ? fmt(r) : r.toFixed(d).replace("-", MINUS), major: true });
  }
  return out;
}

export interface Box { w: number; h: number; l: number; r: number; t: number; b: number }
export interface Frame { box: Box; x: Scale; y: Scale }
export function frame(box: Box, x: { kind?: ScaleKind; d: [number, number] }, y: { kind?: ScaleKind; d: [number, number] }): Frame {
  return {
    box,
    x: scale(x.kind ?? "lin", x.d[0], x.d[1], box.l, box.w - box.r),
    y: scale(y.kind ?? "lin", y.d[0], y.d[1], box.h - box.b, box.t),
  };
}

const r1 = (v: number): string => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
export { r1 as c };

export interface AxesOpts { xlab?: string; ylab?: string; xt?: Tick[]; yt?: Tick[]; grid?: boolean; xTarget?: number; yTarget?: number; xfmt?: (v: number) => string; yfmt?: (v: number) => string; ylabPos?: "left" | "top" }
/** Frame rectangle, grid, ticks and labels. */
export function axes(fr: Frame, o: AxesOpts = {}): string {
  const { box, x, y } = fr;
  const xt = o.xt ?? ticks(x, o.xTarget ?? 6, o.xfmt), yt = o.yt ?? ticks(y, o.yTarget ?? 5, o.yfmt);
  const X0 = box.l, X1 = box.w - box.r, Y0 = box.h - box.b, Y1 = box.t;
  let s = `<rect class="fr" x="${r1(X0)}" y="${r1(Y1)}" width="${r1(X1 - X0)}" height="${r1(Y0 - Y1)}"/>`;
  for (const t of xt) {
    const px = x.f(t.v);
    if (px < X0 - 0.5 || px > X1 + 0.5) continue;
    if (o.grid !== false && t.major) s += `<line class="gl" x1="${r1(px)}" x2="${r1(px)}" y1="${r1(Y1)}" y2="${r1(Y0)}"/>`;
    s += `<line class="ax" x1="${r1(px)}" x2="${r1(px)}" y1="${r1(Y0)}" y2="${r1(Y0 + (t.major ? 5 : 3))}"/>`;
    if (t.label) s += `<text class="tk" x="${r1(px)}" y="${r1(Y0 + 17)}" text-anchor="middle">${t.label}</text>`;
  }
  for (const t of yt) {
    const py = y.f(t.v);
    if (py < Y1 - 0.5 || py > Y0 + 0.5) continue;
    if (o.grid !== false && t.major) s += `<line class="gl" x1="${r1(X0)}" x2="${r1(X1)}" y1="${r1(py)}" y2="${r1(py)}"/>`;
    s += `<line class="ax" x1="${r1(X0 - (t.major ? 5 : 3))}" x2="${r1(X0)}" y1="${r1(py)}" y2="${r1(py)}"/>`;
    if (t.label) s += `<text class="tk" x="${r1(X0 - 8)}" y="${r1(py + 4)}" text-anchor="end">${t.label}</text>`;
  }
  if (o.xlab) s += `<text class="al" x="${r1(X1)}" y="${r1(box.h - 4)}" text-anchor="end">${o.xlab}</text>`;
  if (o.ylab) s += (o.ylabPos ?? "top") === "top"
    ? `<text class="al" x="${r1(X0)}" y="${r1(Y1 - 8)}" text-anchor="start">${o.ylab}</text>`
    : `<text class="al" transform="translate(${r1(12)} ${r1((Y0 + Y1) / 2)}) rotate(-90)" text-anchor="middle">${o.ylab}</text>`;
  return s;
}

/** Polyline path through (xs[i], ys[i]) in data units; non-finite or out-of-domain (log <= 0) points break the line. */
export function path(fr: Frame, xs: ArrayLike<number>, ys: ArrayLike<number>): string {
  let d = "", pen = false;
  for (let i = 0; i < xs.length; i++) {
    const xv = xs[i], yv = ys[i];
    const ok = Number.isFinite(xv) && Number.isFinite(yv) && (fr.x.kind !== "log" || xv > 0) && (fr.y.kind !== "log" || yv > 0);
    if (!ok) { pen = false; continue; }
    d += `${pen ? "L" : "M"}${r1(fr.x.f(xv))} ${r1(fr.y.f(yv))}`;
    pen = true;
  }
  return d;
}
/** Sample f over the x domain (n points, log-spaced on a log axis). */
export function sample(fr: Frame, f: (x: number) => number, n = 200): { xs: Float64Array; ys: Float64Array } {
  const xs = new Float64Array(n), ys = new Float64Array(n);
  const [a, b] = fr.x.d;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const x = fr.x.kind === "log" ? a * (b / a) ** u : a + u * (b - a);
    xs[i] = x;
    let y = Number.NaN;
    try { y = f(x); } catch { y = Number.NaN; }
    ys[i] = y;
  }
  return { xs, ys };
}
/** Clip-path definition for the plot area; reference with clip-path="url(#id)". */
export function clip(fr: Frame, id: string): string {
  const { box } = fr;
  return `<clipPath id="${id}"><rect x="${r1(box.l)}" y="${r1(box.t)}" width="${r1(box.w - box.l - box.r)}" height="${r1(box.h - box.t - box.b)}"/></clipPath>`;
}
/** Clamp a pixel coordinate into the plot area (cursors and markers). */
export const clampX = (fr: Frame, px: number): number => Math.min(fr.box.w - fr.box.r, Math.max(fr.box.l, px));
export const clampY = (fr: Frame, py: number): number => Math.min(fr.box.h - fr.box.b, Math.max(fr.box.t, py));
