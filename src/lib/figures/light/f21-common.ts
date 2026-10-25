// Chapter 2.1 shared helpers: Pockels coefficient sets in the order shown on chapter 02 pages (Kaminow et al. 1980 first,
// author question DevLog-004a Q4 open), fixed-width number formats.
import { EO_KAMINOW1980_S, EO_TURNER1966_S, EO_ZOOK1967_T, type EOSet } from "$lib/physics/constants.ts";
import { FS, MINUS } from "../fmt.ts";

export type SetKey = "kaminow" | "turner" | "zook";
export const SETS21: Record<SetKey, EOSet> = { kaminow: EO_KAMINOW1980_S, turner: EO_TURNER1966_S, zook: EO_ZOOK1967_T };
export const SET_LABEL: Record<SetKey, string> = { kaminow: "S Kaminow 1980", turner: "S Turner 1966", zook: "T Zook 1967" };

/** Fixed-width scientific: "4.064e-05" (typographic minus), "0.000e+00" for zero. */
export function e3(v: number, d = 3): string {
  if (!Number.isFinite(v)) return "–".padStart(d + 6, FS);
  if (v === 0) return `${(0).toFixed(d)}e+00`;
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  if (Math.abs(m).toFixed(d) === (10).toFixed(d)) { m /= 10; e += 1; }
  return `${m < 0 ? MINUS : ""}${Math.abs(m).toFixed(d)}e${e < 0 ? MINUS : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
}
/** Fixed decimals padded with figure spaces to width w (typographic minus). */
export function fw(v: number, d: number, w: number): string {
  if (!Number.isFinite(v)) return "–".padStart(w, FS);
  const s = (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? MINUS : "") + Math.abs(v).toFixed(d);
  return s.padStart(w, FS);
}
export const padR = (s: string, n: number): string => s + FS.repeat(Math.max(0, n - s.length));
