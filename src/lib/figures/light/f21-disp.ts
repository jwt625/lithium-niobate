// F2-02 Dispersion and thermo-optic explorer, chapter 2.1 L2/L3: n, n_g, n_e - n_o or dn/dT of every held Sellmeier model
// for the chosen variant (CLN, 5 mol% MgO:CLN, 1% MgO:SLN) at a wavelength cursor and a temperature. Physics: sellmeier.ts
// (refractiveIndexOrNaN, groupIndex, dnDT, inRange) with the coefficient sets of constants.ts; models refuse input outside
// their windows (curves end, readouts print a dash). Zelmon 1997 has no temperature dependence (21 C only). The erratum
// toggle evaluates the 5 mol% MgO Zelmon rows with the o/e headings as printed in 1997 (swapped), which gives n_e > n_o.
import { groupIndex, dnDT, inRange, refractiveIndexOrNaN } from "$lib/physics/sellmeier.ts";
import { GAYER_MGO1SLN_E, GAYER_MGO5_E, GAYER_MGO5_O, JUNDT_CLN_E, ZELMON_CLN_E, ZELMON_CLN_O, ZELMON_MGO5_E, ZELMON_MGO5_O, type DispersionCoefficients } from "$lib/physics/constants.ts";
import { spectral } from "../spectral.ts";
import { FS } from "../fmt.ts";
import { axes, c, frame, path, sample, ticks, type Box, type Frame } from "./plot.ts";
import { e3, fw, padR } from "./f21-common.ts";

export type Variant = "cln" | "mgo5" | "sln";
export type Qty = "n" | "ng" | "bir" | "dndt";
export interface Disp21 { lam: number; T: number; v: Variant; q: Qty; printed: boolean; log: boolean }
export const d21: Disp21 = { lam: 1.55, T: 21, v: "cln", q: "n", printed: false, log: true };
export const LAM0 = 0.4, LAM1 = 5.0;
export const lamOf = (s: number): number => LAM0 * (LAM1 / LAM0) ** (s / 1000);
export const sOfLam = (l: number): number => Math.round((Math.log(l / LAM0) / Math.log(LAM1 / LAM0)) * 1000);

interface Mdl { key: string; label: string; axis: "o" | "e"; m: DispersionCoefficients; status: string; pop: string; cls: string }
const ZEL = "r:zelmon1997", GAY = "r:gayer2008", JUN = "r:jundt1997";
function models(st: Disp21): Mdl[] {
  if (st.v === "cln") return [
    { key: "zo", label: "Zelmon 1997", axis: "o", m: ZELMON_CLN_O, status: "P-db", pop: ZEL, cls: "s1" },
    { key: "ze", label: "Zelmon 1997", axis: "e", m: ZELMON_CLN_E, status: "P-db", pop: ZEL, cls: "s2" },
    { key: "je", label: "Jundt 1997", axis: "e", m: JUNDT_CLN_E, status: "S", pop: JUN, cls: "s3" },
  ];
  if (st.v === "mgo5") return [
    { key: "zo", label: st.printed ? "Zelmon, as printed" : "Zelmon 1997", axis: "o", m: st.printed ? ZELMON_MGO5_E : ZELMON_MGO5_O, status: "P-db", pop: st.printed ? "r:zelmon1997err" : ZEL, cls: "s1" },
    { key: "ze", label: st.printed ? "Zelmon, as printed" : "Zelmon 1997", axis: "e", m: st.printed ? ZELMON_MGO5_O : ZELMON_MGO5_E, status: "P-db", pop: st.printed ? "r:zelmon1997err" : ZEL, cls: "s2" },
    { key: "ge", label: "Gayer 2008", axis: "e", m: GAYER_MGO5_E, status: "P", pop: GAY, cls: "s3" },
    { key: "go", label: "Gayer 2008", axis: "o", m: GAYER_MGO5_O, status: "P", pop: GAY, cls: "s4" },
  ];
  return [{ key: "ge", label: "Gayer 2008", axis: "e", m: GAYER_MGO1SLN_E, status: "P", pop: GAY, cls: "s3" }];
}
const Tfor = (m: DispersionCoefficients, T: number): number | undefined => (m.form === "zelmon" ? undefined : T);
function val(md: Mdl, q: Qty, lam: number, T: number): number {
  const Tm = Tfor(md.m, T);
  if (!inRange(md.m, lam, Tm)) return Number.NaN;
  if (q === "n") return refractiveIndexOrNaN(md.m, lam, Tm);
  if (q === "ng") return groupIndex(md.m, lam, Tm);
  if (q === "dndt") return md.m.form === "zelmon" ? Number.NaN : dnDT(md.m, lam, Tm);
  return Number.NaN;
}
interface Series { label: string; cls: string; status: string; pop: string; f: (lam: number) => number; anomalous: boolean; fixed21: boolean; axis: string }
export function series(st: Disp21): Series[] {
  const M = models(st);
  if (st.q === "bir") {
    const pairs: [Mdl, Mdl][] = [];
    const zo = M.find((m) => m.key === "zo"), ze = M.find((m) => m.key === "ze"), go = M.find((m) => m.key === "go"), ge = M.find((m) => m.key === "ge");
    if (zo && ze) pairs.push([ze, zo]);
    if (go && ge) pairs.push([ge, go]);
    return pairs.map(([e, o]) => ({ label: e.label, cls: e.cls, status: e.status, pop: e.pop, axis: "e−o", anomalous: false, fixed21: e.m.form === "zelmon", f: (l: number) => val(e, "n", l, st.T) - val(o, "n", l, st.T) }));
  }
  return M.filter((m) => !(st.q === "dndt" && m.m.form === "zelmon")).map((m) => ({ label: m.label, cls: m.cls, status: m.status, pop: m.pop, axis: m.axis, anomalous: m.m.flags.some((f) => f.startsWith("dndT-anomalous")) && st.q === "dndt", fixed21: m.m.form === "zelmon", f: (l: number) => val(m, st.q, l, st.T) }));
}

const QLAB: Record<Qty, string> = { n: "n", ng: "n<tspan baseline-shift=\"sub\" font-size=\"0.75em\">g</tspan>", bir: "n<tspan baseline-shift=\"sub\" font-size=\"0.75em\">e</tspan> − n<tspan baseline-shift=\"sub\" font-size=\"0.75em\">o</tspan>", dndt: "dn/dT (1/K)" };
function fmtQ(q: Qty, v: number): string {
  if (!Number.isFinite(v)) return "–".padStart(9, FS);
  if (q === "n") return fw(v, 5, 9);
  if (q === "ng") return fw(v, 4, 9);
  if (q === "bir") return fw(v, 5, 9);
  return e3(v, 3);
}
/** Readout rows: always 4 slots (fixed DOM). */
export interface DispRow { label: string; axis: string; status: string; pop: string; v: string; note: string; cls: string }
export function disp21Rows(st: Disp21): { rows: DispRow[]; spread: string; flag: string } {
  const S = series(st);
  const rows: DispRow[] = [];
  const vals: { axis: string; v: number }[] = [];
  for (const s of S) {
    const v = s.f(st.lam);
    vals.push({ axis: s.axis, v });
    rows.push({ cls: s.cls, label: s.label, axis: s.axis, status: s.status, pop: s.pop, v: fmtQ(st.q, v), note: s.anomalous ? "not physical" : s.fixed21 && st.T !== 21 ? "21 °C only" : Number.isFinite(v) ? "" : "outside window" });
  }
  while (rows.length < 4) rows.push({ cls: "", label: "", axis: "", status: "", pop: "", v: "".padStart(9, FS), note: "" });
  // spread among models of the same axis (n, n_g)
  let spread = Number.NaN;
  if (st.q === "n" || st.q === "ng") for (const ax of ["o", "e"]) { const xs = vals.filter((x) => x.axis === ax && Number.isFinite(x.v)).map((x) => x.v); if (xs.length > 1) spread = Math.max(Number.isFinite(spread) ? spread : 0, Math.max(...xs) - Math.min(...xs)); }
  // sign of the birefringence of each complete o/e pair at the cursor
  const bir = series({ ...st, q: "bir" }).map((s) => s.f(st.lam)).filter(Number.isFinite);
  const flag = !bir.length ? "no o and e pair in this crystal" : bir.some((b) => b > 0) ? "nₑ > nₒ: impossible for LN" : "nₑ < nₒ: negative uniaxial";
  return { rows, spread: Number.isFinite(spread) ? e3(spread, 1) : "–".padStart(7, FS), flag: padR(flag, 31) };
}

// ---------- plots ----------
function yRange(st: Disp21, S: Series[], fr0: Frame): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const s of S) { const { ys } = sample(fr0, s.f, 160); for (const y of ys) if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
  if (st.q === "n" && st.v === "cln") { lo = Math.min(lo, 2.15); hi = Math.max(hi, 2.29); }
  if (!Number.isFinite(lo)) return [0, 1];
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.05 || 1e-5;
  return [lo - pad, hi + pad];
}
/** Nelson and Mikulyak, 24.5 C, read in weis1985 Table 2 (P-comp): [um, n_o, n_e]. */
export const NELSON: [number, number, number][] = [[0.6328, 2.2866, 2.2028], [1.06, 2.2323, 2.1561]];

export function disp21SVG(st: Disp21, visual: boolean): string {
  const box: Box = visual ? { w: 760, h: 400, l: 74, r: 18, t: 54, b: visual ? 62 : 34 } : { w: 600, h: 300, l: 66, r: 14, t: 44, b: 34 };
  const S = series(st);
  const fr0 = frame(box, { kind: st.log ? "log" : "lin", d: [LAM0, LAM1] }, { d: [0, 1] });
  const fr = frame(box, { kind: st.log ? "log" : "lin", d: [LAM0, LAM1] }, { d: yRange(st, S, fr0) });
  const xt = (st.log ? [0.4, 0.6, 1, 2, 3, 5] : [0.5, 1, 2, 3, 4, 5]).map((v) => ({ v, label: String(v), major: true }));
  let s = `<defs><pattern id="${visual ? "v-" : ""}d21h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" class="htl"/></pattern><clipPath id="${visual ? "v-" : ""}d21c"><rect x="${box.l}" y="${box.t}" width="${box.w - box.l - box.r}" height="${box.h - box.t - box.b}"/></clipPath></defs>`;
  s += axes(fr, { xlab: "λ (µm)", ylab: QLAB[st.q], xt, yfmt: st.q === "dndt" ? (v) => (v * 1e5).toFixed(1).replace("-", "−") + "e−5" : undefined, yTarget: 5 });
  // validity windows: one bar per series above the plot, hatched outside
  S.forEach((ser, i) => {
    const m = models(st).find((mm) => mm.label === ser.label && (st.q === "bir" || mm.axis === ser.axis));
    if (!m) return;
    const y = box.t - 30 + i * 6, x0 = fr.x.f(Math.max(LAM0, m.m.lambda_um[0])), x1 = fr.x.f(Math.min(LAM1, m.m.lambda_um[1]));
    s += `<rect x="${box.l}" y="${y}" width="${box.w - box.l - box.r}" height="2" fill="url(#${visual ? "v-" : ""}d21h)" class="vw-out"/><rect class="vw ${ser.cls}b" x="${c(x0)}" y="${y}" width="${c(x1 - x0)}" height="2"/>`;
  });
  if (visual) { // spectrum bar: visible part in computed spectral color, IR declared false color, dashed
    let stops = "";
    for (let nm = 400; nm <= 760; nm += 10) stops += `<stop offset="${((fr.x.f(nm / 1000) - fr.x.f(0.4)) / (fr.x.f(0.76) - fr.x.f(0.4))).toFixed(4)}" stop-color="${spectral(nm, 1, 0.02)}"/>`;
    const yb = box.h - box.b + 30;
    s += `<defs><linearGradient id="v-d21g" gradientUnits="userSpaceOnUse" x1="${c(fr.x.f(0.4))}" x2="${c(fr.x.f(0.76))}" y1="0" y2="0">${stops}</linearGradient></defs>`;
    s += `<rect x="${c(fr.x.f(0.4))}" y="${yb}" width="${c(fr.x.f(0.76) - fr.x.f(0.4))}" height="6" fill="url(#v-d21g)"/>`;
    s += `<line class="ir-el" x1="${c(fr.x.f(0.78))}" x2="${c(fr.x.f(5))}" y1="${yb + 3}" y2="${yb + 3}" stroke="var(--v-ir1550)" stroke-width="3" stroke-dasharray="6 4"/>`;
    for (const [l, t] of [[1.064, "1064"], [1.55, "1550"]] as [number, string][]) s += `<text class="tk" x="${c(fr.x.f(l))}" y="${yb + 22}" text-anchor="middle">${t}</text>`;
  }
  const clipId = `${visual ? "v-" : ""}d21c`;
  s += `<g clip-path="url(#${clipId})">`;
  for (const ser of S) {
    const { xs, ys } = sample(fr, ser.f, 240);
    s += `<path class="${ser.cls}${ser.fixed21 && st.T !== 21 ? " dimc" : ""}${ser.anomalous ? " anom" : ""}" ${visual ? `id="v-d21-${ser.cls}" ` : ""}d="${path(fr, xs, ys)}"/>`;
  }
  if (st.q === "n" && st.v === "cln") for (const [l, no, ne] of NELSON) s += `<circle class="mk" cx="${c(fr.x.f(l))}" cy="${c(fr.y.f(no))}" r="3.2"/><circle class="mko" cx="${c(fr.x.f(l))}" cy="${c(fr.y.f(ne))}" r="3.2"/>`;
  s += `</g>`;
  // cursor
  const x = c(fr.x.f(st.lam)), vis = st.lam <= 0.76;
  const col = visual ? (vis ? spectral(st.lam * 1000, 1, 0.04) : "var(--v-ir1550)") : "";
  s += `<line class="cur${visual && !vis ? " ir-el" : ""}" x1="${x}" x2="${x}" y1="${box.t}" y2="${box.h - box.b}"${visual ? ` style="stroke:${col}" stroke-dasharray="${vis ? "none" : "5 4"}"` : ""}/>`;
  for (const ser of S) { const v = ser.f(st.lam); if (Number.isFinite(v) && v >= fr.y.d[0] && v <= fr.y.d[1]) s += `<circle class="mk" cx="${x}" cy="${c(fr.y.f(v))}" r="3"/>`; }
  void ticks;
  return s;
}
