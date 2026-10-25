// Fixed-format number output (layout-shift-safe readouts). Ports of the mockup formatters (eo.js, visual.js).

/** Figure space: same advance as a tabular digit. */
export const FS = " ";
/** Typographic minus. */
export const MINUS = "−";
export const DASH = "–";

/** Signed fixed with figure-space sign slot: " 0.00", "+1.25", "-1.25" (visual.js sgn). */
export const sgn = (v: number, d: number): string => (Math.abs(v) < 0.5 * 10 ** -d ? FS : v < 0 ? MINUS : "+") + Math.abs(v).toFixed(d);
/** Left-pad with figure spaces to n characters. */
export const pad = (s: string, n: number): string => s.padStart(n, FS);
/** Fixed decimals with a typographic minus only when the rounded value is nonzero (eo.js fix). */
export const fix = (v: number, d: number): string => (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? MINUS : "") + Math.abs(v).toFixed(d);

/** Scientific notation as HTML: plain fixed for 1e-2..1e3, else m&times;10<sup>e</sup> (eo.js sci). */
export function sci(v: number, d = 3): string {
  if (!Number.isFinite(v)) return "n/a";
  if (v === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e <= 3) return fix(v, Math.max(0, d - e));
  let m = v / 10 ** e;
  if (Math.abs(m).toFixed(d) === (10).toFixed(d)) { m /= 10; e += 1; }
  return `${fix(m, d)}&times;10<sup>${e < 0 ? MINUS : ""}${Math.abs(e)}</sup>`;
}
export const pct = (v: number, d = 2): string => `${fix(v * 100, d)}%`;
export const sgnPct = (v: number, d = 2): string => `${v >= 0 ? "+" : MINUS}${Math.abs(v * 100).toFixed(d)}%`;
/** Constant-length signed component, e.g. "+0.707". */
export const sgn3 = (c: number): string => `${c < 0 ? MINUS : "+"}${Math.abs(c).toFixed(3)}`;
