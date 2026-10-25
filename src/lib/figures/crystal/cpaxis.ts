// Temperature axis shared by 1.3 "Temperature axis" and 1.4 FIG-01-03 "Composition dial" (prefix cp). Pure string builders
// (server and browser): TECH ASCII rows, VISUAL SVG at a given pixel width.
//   Tc(c) band: the two linear fits of volk2008 Eqs. (6.2)-(6.3) (iyi1992, bordui1992), from src/lib/physics/composition.ts.
//   Markers (volk2008 Table 1.1 p. 3, P-comp): Tc congruent 1140 C, Tc near-stoichiometric 1206 C, melting point congruent
//   1255 C. The near-stoichiometric melting point printed there (below its own Tc) is not drawn (open question B7).
import { tcBand } from "../../physics/composition.ts";

export const AX = { T0: 1100, T1: 1300, dT: 5 } as const; // TECH: 5 C per character, 41 columns
export const MARK = { tcCln: 1140, tcSln: 1206, tmCln: 1255 } as const;
const NCOL = (AX.T1 - AX.T0) / AX.dT + 1;
const LBL = 10;
const col = (T: number): number => Math.max(0, Math.min(NCOL - 1, Math.round((T - AX.T0) / AX.dT)));

export interface AxisState {
  c: number;
  /** temperature cursor (1.3 inverse gauge); omitted in 1.4 */
  tcIn?: number | null;
}

type Cell = [string, string]; // [char, class]; class "b" renders as <b> (.cx-ascii b)
function runs(cells: Cell[]): string {
  let out = "", cls = "", buf = "";
  const flush = (): void => { if (buf) out += cls === "b" ? `<b>${buf}</b>` : cls ? `<span class="${cls}">${buf}</span>` : buf; buf = ""; };
  for (const [ch, k] of cells) { if (k !== cls) { flush(); cls = k; } buf += ch; }
  flush();
  return out;
}
const lab = (s: string): string => s.padEnd(LBL, " ").slice(0, LBL);

/** ASCII temperature axis, 1100-1300 C (LBL + 41 characters wide). Rows: tick labels, axis, phase row for the current c
 *  ('=' below the Tc band, '#' between the two fits, '-' above), markers '^', optional cursor '|'. */
export function asciiAxis(s: AxisState): string {
  const { lo, hi } = tcBand(s.c);
  const L: string[] = [];
  let ticks = "";
  for (let T = AX.T0; T <= AX.T1; T += 50) ticks = ticks.padEnd(col(T), " ") + String(T);
  L.push(`<span class="dim">${lab("T / °C")}</span>${ticks}`);
  let axis = "";
  for (let i = 0; i < NCOL; i++) axis += i % 10 === 0 ? "|" : i % 5 === 0 ? "+" : "-";
  L.push(`${lab("")}<span class="dim">${axis}</span>`);
  const a = col(lo), b = col(hi);
  const ph: Cell[] = [];
  for (let i = 0; i < NCOL; i++) ph.push(i < a ? ["=", ""] : i <= b ? ["#", "b"] : ["-", "dim"]);
  L.push(lab(`c ${s.c.toFixed(2)}`) + runs(ph));
  const mk = (name: string, T: number, ch = "^"): string => {
    const cells: Cell[] = [];
    for (let i = 0; i < NCOL; i++) cells.push(i === col(T) ? [ch, "b"] : [" ", ""]);
    return lab(name) + runs(cells).replace(/\s+$/, "");
  };
  L.push(mk("Tc CLN", MARK.tcCln));
  L.push(mk("Tc nSLN", MARK.tcSln));
  L.push(mk("Tm CLN", MARK.tmCln));
  if (s.tcIn != null) L.push(mk("Tc input", s.tcIn, "|"));
  return L.join("\n");
}

/** VISUAL temperature axis as SVG markup, drawn at width W px (height from axisHeight). Classes styled in cp.css.
 *  `uid` makes the pattern ids unique per instance. */
export const axisHeight = (withCursor: boolean): number => (withCursor ? 236 : 208);
export function svgAxis(W: number, s: AxisState, uid: string): string {
  const H = axisHeight(s.tcIn != null), pl = 18, pr = 18;
  const x = (T: number): number => pl + ((Math.max(AX.T0, Math.min(AX.T1, T)) - AX.T0) / (AX.T1 - AX.T0)) * (W - pl - pr);
  const f = (v: number): string => v.toFixed(1);
  const { lo, hi } = tcBand(s.c);
  const y0 = 36, y1 = 78;
  let o = `<svg class="cp-axsvg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><defs>`;
  // ferroelectric phase: +/- domain stripes (domains exist only below Tc); liquid: wave lines above the congruent melting point
  o += `<pattern id="${uid}-fe" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="6" height="10" class="cp-fe1"/><rect x="6" width="6" height="10" class="cp-fe2"/></pattern>`;
  o += `<pattern id="${uid}-lq" width="16" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 Q4 0 8 4 T16 4" class="cp-lq"/></pattern></defs>`;
  o += `<rect class="cp-para" x="${f(x(AX.T0))}" y="${y0}" width="${f(x(AX.T1) - x(AX.T0))}" height="${y1 - y0}"/>`;
  o += `<rect x="${f(x(AX.T0))}" y="${y0}" width="${f(x(lo) - x(AX.T0))}" height="${y1 - y0}" fill="url(#${uid}-fe)"/>`;
  o += `<rect x="${f(x(MARK.tmCln))}" y="${y0}" width="${f(x(AX.T1) - x(MARK.tmCln))}" height="${y1 - y0}" fill="url(#${uid}-lq)"/>`;
  o += `<rect class="cp-band" x="${f(x(lo))}" y="${y0 - 6}" width="${f(Math.max(2, x(hi) - x(lo)))}" height="${y1 - y0 + 12}"/>`;
  // band label, clamped inside the drawing
  const bl = `T<tspan class="cp-sub" dy="3">c</tspan><tspan dy="-3">(c) ${lo.toFixed(1)}–${hi.toFixed(1)} °C</tspan>`; // band label
  const bx = Math.max(pl + 96, Math.min(W - pr - 96, (x(lo) + x(hi)) / 2));
  o += `<text class="cp-bl" x="${f(bx)}" y="20" text-anchor="middle">${bl}</text>`;
  o += `<rect class="cp-frame" x="${f(x(AX.T0))}" y="${y0}" width="${f(x(AX.T1) - x(AX.T0))}" height="${y1 - y0}"/>`;
  // ticks
  const step = W < 520 ? 50 : 25;
  for (let T = AX.T0; T <= AX.T1; T += 10) {
    const maj = T % 50 === 0;
    o += `<line class="cp-tk" x1="${f(x(T))}" x2="${f(x(T))}" y1="${y1}" y2="${y1 + (maj ? 9 : 4)}"/>`;
    if (T % step === 0) o += `<text class="cp-tl" x="${f(x(T))}" y="${y1 + 24}" text-anchor="${T === AX.T0 ? "start" : T === AX.T1 ? "end" : "middle"}">${T}</text>`;
  }
  o += `<text class="cp-tl" x="${f(W - pr)}" y="${y0 - 8}" text-anchor="end">°C</text>`;
  // marker rows
  const sub = (k: string, rest: string): string => `T<tspan class="cp-sub" dy="3">${k}</tspan><tspan dy="-3">${rest}</tspan>`;
  const narrow = W < 640;
  const rows: [string, number, string, number][] = [
    [sub("c", narrow ? " CLN 1140 °C" : " congruent 1140 °C"), MARK.tcCln, "cp-mk", narrow ? 14 : 20],
    [sub("c", narrow ? " near-SLN 1206 °C" : " near-stoichiometric 1206 °C"), MARK.tcSln, "cp-mk", narrow ? 19 : 30],
    [sub("m", narrow ? " CLN 1255 °C" : " congruent 1255 °C"), MARK.tmCln, "cp-mk cp-tm", narrow ? 14 : 20],
  ];
  if (s.tcIn != null) rows.unshift([`input ${s.tcIn.toFixed(1)} °C`, s.tcIn, "cp-mk cp-cur", 16]); // cursor first: shortest line
  // all marker lines first, then diamonds and labels; labels sit on a background box (field colour) that masks any line
  // they cross, so a label may sit on the side with room even when another marker's line passes under it
  let lines = "", labs = "";
  rows.forEach(([t, T, cls, nch], i) => {
    const yr = 128 + i * 26, xm = x(T), est = nch * 7 + 14;
    const later = rows.slice(i + 1).map((r) => x(r[1]));
    const room = (r: boolean): boolean => (r ? W - pr - xm >= est : xm - pl >= est);
    const clear = (r: boolean): boolean => !later.some((xl) => (r ? xl > xm && xl < xm + est : xl < xm && xl > xm - est));
    const right = room(true) && clear(true) ? true : room(false) && clear(false) ? false : room(true) ? true : room(false) ? false : W - pr - xm >= xm - pl;
    lines += `<g class="${cls}"><line x1="${f(xm)}" x2="${f(xm)}" y1="${y0 - 2}" y2="${yr - 5}"/></g>`;
    labs += `<g class="${cls}"><rect x="${f(xm - 4)}" y="${yr - 9}" width="8" height="8" transform="rotate(45 ${f(xm)} ${yr - 5})"/>`;
    const tx = xm + (right ? 12 : -12), bw = est - 10;
    labs += `<rect class="cp-lbg" x="${f(right ? tx - 3 : tx - bw + 3)}" y="${yr - 13}" width="${f(bw)}" height="18"/>`;
    labs += `<text x="${f(tx)}" y="${yr}" text-anchor="${right ? "start" : "end"}">${t}</text></g>`;
  });
  o += lines + labs;
  return o + "</svg>";
}
