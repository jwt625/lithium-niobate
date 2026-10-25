// Section 2.3 (second-order nonlinear optics) shared helpers: bulk index functions, fixed-width formatters, badge and
// readout-table markup, wavelength display colors. Client-safe; used by the server load (default markup) and the browser.
import { ZELMON_CLN_E, ZELMON_CLN_O, JUNDT_CLN_E } from "$lib/physics/constants.ts";
import { indexFn, type IndexFn } from "$lib/physics/sellmeier.ts";
import { STATUS, type StatusCode } from "$lib/content/site";
import { spectral } from "../spectral.ts";
import { FS, MINUS } from "../fmt.ts";

/** Zelmon 1997 CLN (21 C only), Jundt 1997 CLN e (20 to 250 C). Throw outside their windows. */
export const nE: IndexFn = indexFn(ZELMON_CLN_E);
export const nO: IndexFn = indexFn(ZELMON_CLN_O);
export const nJ: IndexFn = indexFn(JUNDT_CLN_E);

/** Evaluate, NaN on a throw (model window) or a non-finite result. */
export function safe(f: () => number): number {
  try { const v = f(); return Number.isFinite(v) ? v : Number.NaN; } catch { return Number.NaN; }
}

/** Dash string of display width w (figure spaces + en dash), for invalid states. */
export const dash = (w: number): string => FS.repeat(Math.max(0, w - 1)) + "–";
/** Fixed decimals, padded to w characters with figure spaces; dash string when not finite. */
export function fx(v: number, d: number, w: number): string {
  if (!Number.isFinite(v)) return dash(w);
  const s = (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? MINUS : "") + Math.abs(v).toFixed(d);
  return s.padStart(w, FS);
}
/** Signed fixed: "+0.500", "−0.866", " 0.000"; width d + 3 (one integer digit). */
export function sg(v: number, d: number): string {
  if (!Number.isFinite(v)) return dash(d + 3);
  const z = Math.abs(v) < 0.5 * 10 ** -d;
  return (z ? FS : v < 0 ? MINUS : "+") + Math.abs(z ? 0 : v).toFixed(d);
}
/** Scientific with a fixed width (d + 6): "2.600e−03"; dash string when not finite or negative. */
export function ex(v: number, d = 3): string {
  if (!Number.isFinite(v) || v < 0) return dash(d + 6);
  if (v === 0) return `${(0).toFixed(d)}e+00`;
  let e = Math.floor(Math.log10(v));
  let m = v / 10 ** e;
  if (+m.toFixed(d) >= 10) { m /= 10; e += 1; }
  return `${m.toFixed(d)}e${e < 0 ? MINUS : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
}

/** Badge markup identical to Badge.svelte. */
export const badge = (code: StatusCode, pop?: string, text?: string): string =>
  `<span class="b ${STATUS[code].cls}"${pop ? ` data-pop="${pop}"` : ""}>${text ?? code}</span>`;

/** Readout table body: rows of [label HTML, fixed-width value text, badge HTML]. */
export function roRows(rows: [string, string, string][]): string {
  return `<colgroup><col><col class="cv"><col class="cs"></colgroup><tbody>${rows.map(([l, v, b]) => `<tr><td>${l}</td><td class="v">${v}</td><td class="s">${b}</td></tr>`).join("")}</tbody>`;
}
/** VISUAL readout list (dl.v-hud) items: [label HTML, fixed-width value]. */
export const hudRows = (rows: [string, string][]): string => rows.map(([l, v]) => `<dt>${l}</dt><dd>${v}</dd>`).join("");

/** Display color of light at nm: spectral() over 380-780 nm (shared map: deep red beyond 680 nm, violet below 400 nm);
 *  declared false color outside it (UV below 380 nm dim text color; IR: 1064 nm band orange, longer magenta, as var() so
 *  the theme sets them). `ir` true: draw dashed. */
export function lightColor(nm: number): { c: string; ir: boolean } {
  if (nm >= 380 && nm <= 780) return { c: spectral(nm), ir: false };
  if (nm < 380) return { c: "var(--v-text3)", ir: true };
  return { c: nm < 1300 ? "var(--v-ir1064)" : "var(--v-ir1550)", ir: true };
}

/** Escape text for SVG / HTML. */
export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const r1 = (v: number): string => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
/** 775 nm (SH of 1550 nm) display color. */
export const C775: string = lightColor(775).c;
