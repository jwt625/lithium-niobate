// Small SVG plotting helpers for chapter 03 figures: scales, nice ticks (linear and log), polyline paths with gaps,
// polar paths. Pure functions; markup is written in the Svelte components. Coordinates rounded to 0.1 px so server and
// browser produce identical strings.

export type Scale = (v: number) => number;
export const r1 = (v: number): string => (Math.round(v * 10) / 10).toString();

export function lin(d0: number, d1: number, r0: number, r1_: number): Scale {
  const k = (r1_ - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
}
export function logS(d0: number, d1: number, r0: number, r1_: number): Scale {
  const l0 = Math.log10(d0), k = (r1_ - r0) / (Math.log10(d1) - l0);
  return (v) => r0 + (Math.log10(v) - l0) * k;
}

/** Nice linear ticks covering [lo, hi] with about n intervals. */
export function ticks(lo: number, hi: number, n = 5): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const raw = span / n, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toPrecision(12));
  return out;
}
/** Decade ticks within [lo, hi] (log axes). */
export function decades(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let e = Math.ceil(Math.log10(lo) - 1e-9); e <= Math.floor(Math.log10(hi) + 1e-9); e++) out.push(10 ** e);
  return out;
}

/** Polyline path through (x[i], y[i]); non-finite points break the line. */
export function path(xs: ArrayLike<number>, ys: ArrayLike<number | null>, sx: Scale, sy: Scale): string {
  let d = "", pen = false;
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i];
    if (y === null || !Number.isFinite(y) || !Number.isFinite(xs[i])) { pen = false; continue; }
    d += `${pen ? "L" : "M"}${r1(sx(xs[i]))} ${r1(sy(y as number))}`;
    pen = true;
  }
  return d;
}

/** Polar path r(t) around (cx, cy), t in radians measured from the +x screen axis counterclockwise (screen y up). */
export function polar(ts: ArrayLike<number>, rs: ArrayLike<number>, cx: number, cy: number, k: number, close = true): string {
  let d = "";
  for (let i = 0; i < ts.length; i++) d += `${i ? "L" : "M"}${r1(cx + k * rs[i] * Math.cos(ts[i]))} ${r1(cy - k * rs[i] * Math.sin(ts[i]))}`;
  return close && d ? d + "Z" : d;
}

/** Signed polar curve split into positive and negative lobes (|r| drawn, sign selects the set); each lobe closed
 *  through the origin so dashed negative lobes and solid positive lobes stay separate. */
export function polarLobes(ts: ArrayLike<number>, rs: ArrayLike<number>, cx: number, cy: number, k: number): { pos: string; neg: string } {
  let pos = "", neg = "";
  let cur: "p" | "n" | null = null;
  for (let i = 0; i <= ts.length; i++) {
    const j = i % ts.length;
    const r = rs[j], s: "p" | "n" = r >= 0 ? "p" : "n";
    const x = r1(cx + k * Math.abs(r) * Math.cos(ts[j])), y = r1(cy - k * Math.abs(r) * Math.sin(ts[j]));
    if (s !== cur) {
      if (cur) { if (cur === "p") pos += `L${r1(cx)} ${r1(cy)}`; else neg += `L${r1(cx)} ${r1(cy)}`; }
      const start = `M${r1(cx)} ${r1(cy)}L${x} ${y}`;
      if (s === "p") pos += start; else neg += start;
      cur = s;
    } else if (s === "p") pos += `L${x} ${y}`; else neg += `L${x} ${y}`;
  }
  return { pos, neg };
}

/** Engineering-style tick label: 1e3 -> "1k" etc. is avoided; plain numbers with trimmed zeros, typographic minus. */
export function tl(v: number, d = 3): string {
  const s = Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(0).replace("e+", "e") : (+v.toPrecision(d + 3)).toString();
  return s.replace("-", "−");
}
/** Decade label as HTML-free text: 10^-3 -> "10⁻³". */
const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const dec = (v: number): string => `10${String(Math.round(Math.log10(v))).split("").map((c) => SUP[c] ?? c).join("")}`;
