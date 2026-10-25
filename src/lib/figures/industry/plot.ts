// Small plotting helpers for the chapter 08 SVG charts (linear and log scales, ticks, die counts).

export interface Scale { (v: number): number; d: [number, number]; r: [number, number]; log: boolean }
export function scale(d: [number, number], r: [number, number], log = false): Scale {
  const t = (v: number): number => (log ? Math.log10(v) : v);
  const [a, b] = [t(d[0]), t(d[1])];
  const f = ((v: number) => r[0] + ((t(Math.max(v, log ? 1e-12 : -Infinity)) - a) / (b - a)) * (r[1] - r[0])) as Scale;
  f.d = d; f.r = r; f.log = log;
  return f;
}
/** Decade ticks (1, 10, 100 ...) inside [lo, hi], plus 2 and 5 when `minor`. */
export function logTicks(lo: number, hi: number, minor = false): number[] {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of minor ? [1, 2, 5] : [1]) { const v = m * 10 ** e; if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v); }
  return out;
}
export function linTicks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
export const fmtTick = (v: number): string => (v >= 1000 ? `${v / 1000}k` : v >= 1 ? String(v) : String(+v.toPrecision(2)));
export const f1 = (v: number): string => v.toFixed(1);

/** Rectangular dies (w x h mm) fully inside a circle of radius R (mm): best of the grid offsets {0, w/2} x {0, h/2}.
 *  Gross die count, no scribe lanes, flats ignored. Returns the count and the lower-left corners. */
export function diesInCircle(R: number, w: number, h: number): { n: number; ll: [number, number][] } {
  let best: [number, number][] = [];
  for (const ox of [0, w / 2]) for (const oy of [0, h / 2]) {
    const out: [number, number][] = [];
    const nx = Math.ceil(R / w) + 1, ny = Math.ceil(R / h) + 1;
    for (let i = -nx; i <= nx; i++) for (let j = -ny; j <= ny; j++) {
      const x0 = ox + i * w - w / 2, y0 = oy + j * h - h / 2;
      const fx = Math.max(Math.abs(x0), Math.abs(x0 + w)), fy = Math.max(Math.abs(y0), Math.abs(y0 + h));
      if (fx * fx + fy * fy <= R * R + 1e-9) out.push([x0, y0]);
    }
    if (out.length > best.length) best = out;
  }
  return { n: best.length, ll: best };
}
/** One SVG path for many rectangles (lower-left corners, size w x h). */
export const rectsPath = (ll: [number, number][], w: number, h: number): string => ll.map(([x, y]) => `M${x.toFixed(2)} ${y.toFixed(2)}h${w}v${h}h${-w}z`).join("");
