// Chapter 04 fixed-width number formats (layout-shift-safe readouts). Every formatter returns a string whose length depends
// only on its arguments' format, never on the value: sign slot (figure space or typographic minus), fixed mantissa digits,
// signed two-digit exponent. Readout boxes reserve that width in ch (Readout.svelte or white-space: pre outputs).
import { FS, MINUS } from "../fmt.ts";

/** Scientific, fixed width: " 1.23e+03", "−1.70e−04" (sign slot + d decimals + e + sign + 2 digits). */
export function e(v: number, d = 2, signSlot = true): string {
  if (!Number.isFinite(v)) return (signSlot ? FS : "") + "n/a".padStart(d + 6, FS);
  const neg = v < 0;
  const a = Math.abs(v);
  let ex = a === 0 ? 0 : Math.floor(Math.log10(a));
  let m = a === 0 ? 0 : a / 10 ** ex;
  if (Number(m.toFixed(d)) >= 10) { m /= 10; ex += 1; }
  const s = signSlot ? (neg && Number(m.toFixed(d)) !== 0 ? MINUS : FS) : neg ? MINUS : "";
  return `${s}${m.toFixed(d)}e${ex < 0 ? MINUS : "+"}${String(Math.abs(ex)).padStart(2, "0")}`;
}
/** Unsigned scientific (magnitudes): "1.23e+03". */
export const eu = (v: number, d = 2): string => e(Math.abs(v), d, false);
/** Fixed decimals left-padded to w characters with figure spaces; typographic minus. */
export function f(v: number, d: number, w: number): string {
  const s = (v < 0 && Number(Math.abs(v).toFixed(d)) !== 0 ? MINUS : "") + Math.abs(v).toFixed(d);
  return s.padStart(w, FS);
}
/** Signed fixed with a sign slot: "+95.0", "−50.0", " 0.0", padded to w. */
export function sf(v: number, d: number, w: number): string {
  const z = Number(Math.abs(v).toFixed(d)) === 0;
  return ((z ? FS : v < 0 ? MINUS : "+") + Math.abs(v).toFixed(d)).padStart(w, FS);
}
/** Range "a–b" of two fixed-decimal numbers, each padded to w (single value repeated keeps the width). */
export const rng = (a: number, b: number, d: number, w: number): string => `${f(Math.min(a, b), d, w)}–${f(Math.max(a, b), d, w)}`;
/** Range of two scientific numbers. */
export const rnge = (a: number, b: number, d = 1): string => `${eu(Math.min(Math.abs(a), Math.abs(b)), d)}–${eu(Math.max(Math.abs(a), Math.abs(b)), d)}`;
/** Duration with a unit chosen from the value, fixed width 10 ("  2.48 s  ", "  2.87 d  ", "1.2e+03 yr"). */
export function dur(s: number): string {
  if (!Number.isFinite(s)) return "n/a".padStart(10, FS);
  const u: [number, string][] = [[1e-6, "µs"], [1e-3, "ms"], [1, "s"], [60, "min"], [3600, "h"], [86400, "d"], [3.156e7, "yr"]];
  let k = 0;
  for (let i = 0; i < u.length; i++) if (s >= u[i][0] * 0.9995) k = i;
  const v = s / u[k][0];
  const txt = v >= 999.5 ? e(v, 1, false) : v.toFixed(v >= 99.95 ? 0 : v >= 9.995 ? 1 : 2);
  return `${txt.padStart(6, FS)} ${u[k][1].padEnd(3, FS)}`;
}
/** Superscript digits for tick labels (10⁻³). */
const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const pow10 = (n: number): string => `10${String(n).split("").map((c) => SUP[c] ?? c).join("")}`;
