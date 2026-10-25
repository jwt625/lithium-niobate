// Fixed-width number formats for chapter 03 readouts (figure-space padding, typographic minus): every string for a given
// slot has the same length, so live updates cannot reflow anything.
import { FS, MINUS } from "../fmt.ts";

/** Signed fixed: sign slot (+, minus, figure space for zero) + zero-padded integer part of width w + d decimals. */
export function sf(v: number, w: number, d: number): string {
  if (!Number.isFinite(v)) return FS + "-".repeat(w) + (d ? "." + "-".repeat(d) : "");
  const a = Math.abs(v).toFixed(d);
  const zero = +a === 0;
  const [i, f] = a.split(".");
  return (zero ? FS : v < 0 ? MINUS : "+") + i.padStart(w, "0") + (f !== undefined ? "." + f : "");
}
/** Unsigned fixed, integer part padded with figure spaces to width w. */
export function uf(v: number, w: number, d: number): string {
  if (!Number.isFinite(v)) return FS.repeat(Math.max(0, w - 1)) + "-" + (d ? "." + "-".repeat(d) : "");
  const [i, f] = Math.abs(v).toFixed(d).split(".");
  return i.padStart(w, FS) + (f !== undefined ? "." + f : "");
}
/** Unsigned fixed, zero-padded integer part. */
export function zf(v: number, w: number, d: number): string {
  if (!Number.isFinite(v)) return "-".repeat(w) + (d ? "." + "-".repeat(d) : "");
  const [i, f] = Math.abs(v).toFixed(d).split(".");
  return i.padStart(w, "0") + (f !== undefined ? "." + f : "");
}
/** Engineering exponent format, constant length: "+1.234e+05" / "−1.234e−05" (10 ch for d = 3). */
export function ef(v: number, d = 3, signed = true): string {
  if (!Number.isFinite(v)) return (signed ? FS : "") + "-." + "-".repeat(d) + "e" + FS + "--";
  if (v === 0) return (signed ? FS : "") + (0).toFixed(d) + "e" + FS + "00";
  const [m, e] = v.toExponential(d).split("e");
  const ev = +e;
  const sm = m.startsWith("-") ? MINUS + m.slice(1) : (signed ? "+" : "") + m;
  return sm + "e" + (ev < 0 ? MINUS : "+") + String(Math.abs(ev)).padStart(2, "0");
}
/** Pad any string to n characters with figure spaces (left) or normal spaces (right). */
export const padL = (s: string, n: number): string => s.padStart(n, FS);
export const padR = (s: string, n: number): string => s.padEnd(n, " ");
export const deg = (v: number, w = 3, d = 1): string => zf(v, w, d) + "°";
/** Signed fixed with figure-space padding before the sign (tables): " +8.69", "−40.60". Total width w + d + 2. */
export function sp(v: number, w: number, d: number): string {
  if (!Number.isFinite(v)) return FS.repeat(w + d + 1) + "-";
  const a = Math.abs(v).toFixed(d), zero = +a === 0;
  return ((zero ? FS : v < 0 ? MINUS : "+") + a).padStart(w + d + 2, FS);
}
const SUPD: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
/** Scientific notation with Unicode superscript exponent: 6.65×10⁻⁷. */
export function exS(v: number, d = 2): string {
  if (!Number.isFinite(v)) return "–";
  const [m, e] = v.toExponential(d).split("e");
  return `${m.replace("-", "−")}×10${String(+e).split("").map((c) => SUPD[c] ?? c).join("")}`;
}
