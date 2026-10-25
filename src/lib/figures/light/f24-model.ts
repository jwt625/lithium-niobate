// Chapter 2.4 Parametric amplification and OPOs: shared state, display adapters over src/lib/physics, fixed-format
// readouts and deterministic SVG markup for the parametric gain and OPO threshold figures and the OPO tuning figure (signal / idler vs
// period and temperature). Server-safe (no DOM): +page.server.ts renders the default state with these builders and the
// browser module (f24-mount.ts) re-renders from the same functions, so prerendered and live strings are identical.
import { HBAR, C0, ZELMON_CLN_E, JUNDT_CLN_E } from "$lib/physics/constants.ts";
import { opoThreshold, opoOutput, opaGainDbPerM } from "$lib/physics/nonlinear.ts";
import { opaGain } from "$lib/physics/coupledmode.ts";
import { opoSignalIdler, qpmPeriod } from "$lib/physics/phasematching.ts";
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { FS, MINUS, pad, fix } from "../fmt.ts";
import { frame, axes, path, clip, ticks, c, type Frame, type Box } from "./plot.ts";

// ---------------------------------------------------------------- shared state (TECH and VISUAL bind to it)
export interface OpoState { P: number; Qp: number; Qs: number; ep: number; es: number; g2pi: number }
export interface OpaState { eta: number; Pp: number; Lmm: number; dk: number; ylog: boolean }
export interface TuneState { L: number; T: number }
/** Display defaults (template): g/2pi 1 MHz, intrinsic Q 1e6, critical coupling, P 100 uW; OPA 1 W peak, 6 mm;
 *  eta_norm 2600 %/W/cm^2 (wang2018optica, reported); tuning at Lambda 29.91 um (manuscript), T 100 C. */
export const DEF = {
  opo: { P: 100e-6, Qp: 1e6, Qs: 1e6, ep: 0.5, es: 0.5, g2pi: 1e6 } as OpoState,
  opa: { eta: 2600, Pp: 1, Lmm: 6, dk: 0, ylog: false } as OpaState,
  tune: { L: 29.91, T: 100 } as TuneState,
};
export const S24 = { opo: { ...DEF.opo }, opa: { ...DEF.opa }, tune: { ...DEF.tune } };
export type S24T = typeof S24;

// ---------------------------------------------------------------- formats (fixed width, figure-space padded)
const SUPD: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
const sup = (n: number): string => String(n).split("").map((ch) => SUPD[ch] ?? ch).join("");
/** m.mm x 10^e with unicode superscripts, padded to w characters. */
export function sciU(v: number, d = 2, w = 9): string {
  if (!Number.isFinite(v) || v <= 0) return pad("–", w);
  let e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  if (+m.toFixed(d) >= 10) { m /= 10; e += 1; }
  return pad(`${m.toFixed(d)}×10${sup(e)}`, w);
}
const PRE: [number, string][] = [[-15, "f"], [-12, "p"], [-9, "n"], [-6, "µ"], [-3, "m"], [0, FS], [3, "k"], [6, "M"], [9, "G"], [12, "T"]];
/** SI-prefixed value, 3 significant digits: "23.3 µW", " 233 nW", "1.00  W" (8 characters for a 1-letter unit). */
export function si(v: number, unit: string): string {
  const w = 6 + unit.length;
  if (v === 0) return pad(`0 ${FS}${unit}`, w);
  if (!Number.isFinite(v) || v < 0) return pad(`– ${FS}${unit}`, w);
  let e = Math.floor(Math.log10(v) / 3) * 3;
  e = Math.max(-15, Math.min(12, e));
  let m = v / 10 ** e;
  const r = (x: number): string => (x >= 99.95 ? x.toFixed(0) : x >= 9.995 ? x.toFixed(1) : x.toFixed(2));
  if (+r(m) >= 1000 && e < 12) { e += 3; m = v / 10 ** e; }
  const p = PRE.find(([k]) => k === e)?.[1] ?? FS;
  return pad(`${r(m)} ${p}${unit}`, w);
}
export const dB = (v: number, w = 6): string => (Number.isFinite(v) ? `${pad(fix(v, 1), w)} dB` : `${pad("–", w)} dB`);
export const pctF = (v: number): string => (Number.isFinite(v) ? `${pad(fix(v * 100, 1), 5)} %` : `${pad("–", 5)} %`);
export const nmF = (um: number): string => (Number.isFinite(um) ? `${pad((um * 1e3).toFixed(1), 6)} nm` : `${pad("–", 6)} nm`);
export const sgnF = (v: number, d: number, w: number): string => (Number.isFinite(v) ? pad((v < 0 ? MINUS : "+") + Math.abs(v).toFixed(d), w) : pad("–", w));
/** Relative energy-conservation residual; values below 1e-16 (double-precision floor) print as "< 10^-16". */
export const resF = (r: number): string => (!Number.isFinite(r) ? pad("–", 9) : r < 1e-16 ? pad("< 10⁻¹⁶", 9) : sciU(r, 1, 9));

// ---------------------------------------------------------------- OPO model (eq. 2.15; degenerate wavelengths)
export const LP_OPO = 0.775, LS_OPO = 1.55; // um: pump 775 nm, signal = idler = 1550 nm (omega_s = omega_i = omega_p / 2)
const W_P = (2 * Math.PI * C0) / (LP_OPO * 1e-6), W_S = W_P / 2;
export interface OpoOut {
  kp: number; ks: number; kpex: number; ksex: number; QpL: number; QsL: number; g: number;
  Pth: number; nth: number; x: number; np: number; Psi: number; eff: number; effMax: number;
  out: (P: number) => number; npOf: (P: number) => number; pthAt: (Qp: number, Qs: number) => number;
}
/** Loaded rates from intrinsic Q and coupling ratio eta = kappa_ex / kappa: kappa = (omega / Q_i) / (1 - eta). */
export function opoModel(o: OpoState): OpoOut {
  const g = 2 * Math.PI * o.g2pi;
  const rates = (Qp: number, Qs: number) => {
    const kp = W_P / Qp / (1 - o.ep), ks = W_S / Qs / (1 - o.es);
    return { kp, ks, kpex: o.ep * kp, ksex: o.es * ks };
  };
  const r = rates(o.Qp, o.Qs);
  const th = opoThreshold({ omega_p: W_P, kappa_p: r.kp, kappa_p_ex: r.kpex, kappa_s: r.ks, kappa_i: r.ks, g });
  const cpl = { kappa_s_ex: r.ksex, kappa_s: r.ks, kappa_p_ex: r.kpex, kappa_p: r.kp };
  const out = (P: number): number => opoOutput(P, th.P_th_W, cpl);
  // intracavity pump photons: 4 kappa_p,ex P / (hbar omega_p kappa_p^2) below threshold, clamped at kappa_s kappa_i / (4 g^2)
  const npOf = (P: number): number => Math.min((4 * r.kpex * P) / (HBAR * W_P * r.kp ** 2), th.nPump_th);
  const pthAt = (Qp: number, Qs: number): number => { const q = rates(Qp, Qs); return opoThreshold({ omega_p: W_P, kappa_p: q.kp, kappa_p_ex: q.kpex, kappa_s: q.ks, kappa_i: q.ks, g }).P_th_W; };
  const Psi = out(o.P);
  return { ...r, QpL: W_P / r.kp, QsL: W_S / r.ks, g, Pth: th.P_th_W, nth: th.nPump_th, x: o.P / th.P_th_W, np: npOf(o.P), Psi, eff: Psi / o.P, effMax: o.ep * o.es, out, npOf, pthAt };
}

/** Reported thresholds drawn as ticks (manuscript 2.4 table; values as printed there). */
export const REPORTED_TH = [
  { P: 19.6e-6, lab: "19.6 µW", id: "gao2021" },
  { P: 30e-6, lab: "30 µW", id: "lu2021" },
] as const;

const OPO_BOX: Box = { w: 520, h: 340, l: 58, r: 14, t: 26, b: 340 - 196 };
const OPO_BOX2: Box = { w: 520, h: 340, l: 58, r: 14, t: 222, b: 30 };
const PX: [number, number] = [1e-7, 1e-1];

/** TECH OPO plot: summed signal + idler output and fractions vs pump power, log P axis, reported thresholds as ticks. */
export function opoPlotSVG(o: OpoState): string {
  const m = opoModel(o);
  const f1 = frame(OPO_BOX, { kind: "log", d: PX }, { kind: "log", d: [1e-9, 1e-1] });
  const f2 = frame(OPO_BOX2, { kind: "log", d: PX }, { d: [0, 1] });
  const xt = ticks(f1.x).map((t) => ({ ...t, label: "" }));
  let s = `<defs>${clip(f1, "p24-c1")}${clip(f2, "p24-c2")}</defs>`;
  s += axes(f1, { xt, ylab: "P<tspan dy='3' font-size='0.8em'>s+i</tspan><tspan dy='-3'> (W)</tspan>" });
  s += axes(f2, { xlab: "pump P in bus (W)", yt: ticks(f2.y, 2), ylab: "fraction" });
  // sample: log grid plus points just above threshold so the knee drops to the floor
  const n = 260, xs: number[] = [];
  for (let i = 0; i < n; i++) xs.push(PX[0] * (PX[1] / PX[0]) ** (i / (n - 1)));
  for (let k = 1; k <= 9; k++) xs.push(m.Pth * (1 + 10 ** -k));
  xs.push(m.Pth);
  xs.sort((a, b) => a - b);
  const out = xs.map((P) => m.out(P)), eff = xs.map((P, i) => (P > m.Pth ? out[i] / P : 0)), npr = xs.map((P) => m.npOf(P) / m.nth);
  s += `<g clip-path="url(#p24-c1)"><path class="s1" d="${path(f1, xs, out)}"/></g>`;
  s += `<g clip-path="url(#p24-c2)"><path class="s1" d="${path(f2, xs, eff)}"/><path class="s2" d="${path(f2, xs, npr)}"/></g>`;
  // threshold, 4 P_th, cursor
  const vline = (P: number, cls: string, y0: number, y1: number): string => {
    const px = f1.x.f(P);
    return px >= OPO_BOX.l && px <= OPO_BOX.w - OPO_BOX.r ? `<line class="${cls}" x1="${c(px)}" x2="${c(px)}" y1="${c(y0)}" y2="${c(y1)}"/>` : "";
  };
  s += vline(m.Pth, "s3", 26, 310) + vline(4 * m.Pth, "s6", 222, 310);
  const pthX = f1.x.f(m.Pth);
  if (pthX >= OPO_BOX.l && pthX <= OPO_BOX.w - OPO_BOX.r - 30) s += `<text class="lg" x="${c(pthX + 4)}" y="${c(190)}">P<tspan dy="3" font-size="0.8em">th</tspan></text>`;
  const p4 = f1.x.f(4 * m.Pth);
  if (p4 >= OPO_BOX.l && p4 <= OPO_BOX.w - OPO_BOX.r - 40) s += `<text class="lg" x="${c(p4 + 4)}" y="${c(236)}">4 P<tspan dy="3" font-size="0.8em">th</tspan></text>`;
  s += vline(o.P, "cur", 26, 310);
  // markers
  const mk = (fr: Frame, x: number, y: number, cls: string): string => {
    const px = fr.x.f(x), py = fr.y.f(y);
    if (!(px >= fr.box.l && px <= fr.box.w - fr.box.r && py >= fr.box.t - 0.5 && py <= fr.box.h - fr.box.b + 0.5)) return "";
    return `<path class="${cls}" d="M${c(px)} ${c(py - 4)}L${c(px + 4)} ${c(py)}L${c(px)} ${c(py + 4)}L${c(px - 4)} ${c(py)}Z"/>`;
  };
  if (m.Psi > 0) s += mk(f1, o.P, m.Psi, "mk");
  s += mk(f2, 4 * m.Pth, m.effMax, "mko") + mk(f2, o.P, m.eff, "mk") + mk(f2, o.P, m.np / m.nth, "mk");
  // reported thresholds: ticks on the P axis (top edge of the output frame)
  for (const [i, r] of REPORTED_TH.entries()) {
    const px = f1.x.f(r.P);
    s += `<path class="p24-rt" d="M${c(px)} ${c(OPO_BOX.t)}V${c(OPO_BOX.t + 9)}"/><path class="p24-rtm" d="M${c(px - 3.5)} ${c(OPO_BOX.t - 7)}H${c(px + 3.5)}L${c(px)} ${c(OPO_BOX.t - 1)}Z"/>`;
    s += `<text class="lg" x="${c(px + (i ? 6 : -6))}" y="${c(OPO_BOX.t - 9)}" text-anchor="${i ? "start" : "end"}">${r.lab}</text>`;
  }
  return s;
}

export interface Row { k: string; v: string; s?: string }
const rowsHTML = (rows: Row[]): string => `<tbody>${rows.map((r) => `<tr><td>${r.k}</td><td class="v">${r.v}</td></tr>`).join("")}</tbody>`;

/** TECH OPO readout rows. */
export function opoRows(o: OpoState): string {
  const m = opoModel(o);
  const on = m.x > 1;
  return rowsHTML([
    { k: "loaded Q<sub>p</sub>", v: sciU(m.QpL, 2) },
    { k: "loaded Q<sub>s</sub> = Q<sub>i</sub>", v: sciU(m.QsL, 2) },
    { k: "threshold P<sub>th</sub>", v: si(m.Pth, "W") },
    { k: "P / P<sub>th</sub>", v: pad(m.x >= 999.5 ? ">999" : m.x.toFixed(m.x < 9.995 ? 2 : m.x < 99.95 ? 1 : 0), 6) },
    { k: "pump photons |a<sub>p</sub>|<sup>2</sup>", v: sciU(m.np, 2) },
    { k: "clamp &kappa;<sub>s</sub>&kappa;<sub>i</sub>/4g<sup>2</sup>", v: sciU(m.nth, 2) },
    { k: "signal + idler P<sub>s+i</sub>", v: si(m.Psi, "W") },
    { k: "state", v: on ? pad("oscillating", 11) : pad("below", 11) },
    { k: "conversion P<sub>s+i</sub>/P", v: pctF(m.eff) },
    { k: "maximum, at 4 P<sub>th</sub>", v: pctF(m.effMax) },
  ]);
}

// ---------------------------------------------------------------- threshold scaling (shared DOM, both modes)
const SC_BOX: Box = { w: 520, h: 250, l: 58, r: 14, t: 26, b: 30 };
const QX: [number, number] = [1e4, 1e8];
export function scalingSVG(o: OpoState): string {
  const m = opoModel(o);
  const fr = frame(SC_BOX, { kind: "log", d: QX }, { kind: "log", d: [1e-12, 1e4] });
  let s = `<defs>${clip(fr, "p24-c3")}</defs>` + axes(fr, { xlab: "intrinsic Q", ylab: "P<tspan dy='3' font-size='0.8em'>th</tspan><tspan dy='-3'> (W)</tspan>" });
  const n = 60, xs: number[] = [];
  for (let i = 0; i < n; i++) xs.push(QX[0] * (QX[1] / QX[0]) ** (i / (n - 1)));
  const all = xs.map((Q) => m.pthAt(Q, Q)), si2 = xs.map((Q) => m.pthAt(o.Qp, Q)), p1 = xs.map((Q) => m.pthAt(Q, o.Qs));
  s += `<g clip-path="url(#p24-c3)"><path class="s1" d="${path(fr, xs, all)}"/><path class="s2" d="${path(fr, xs, si2)}"/><path class="s6" d="${path(fr, xs, p1)}"/></g>`;
  for (const r of REPORTED_TH) { const py = fr.y.f(r.P); s += `<path class="p24-rt" d="M${c(SC_BOX.l)} ${c(py)}H${c(SC_BOX.l + 9)}"/>`; }
  const px = fr.x.f(o.Qs), py = fr.y.f(m.Pth);
  if (px >= SC_BOX.l && px <= SC_BOX.w - SC_BOX.r && py >= SC_BOX.t && py <= SC_BOX.h - SC_BOX.b) s += `<path class="mk" d="M${c(px)} ${c(py - 4)}L${c(px + 4)} ${c(py)}L${c(px)} ${c(py + 4)}L${c(px - 4)} ${c(py)}Z"/>`;
  return s;
}
/** Local log slopes d log P_th / d log Q (factor 10 step) for the three sweeps. */
export function slopes(o: OpoState): { all: number; si: number; p: number } {
  const m = opoModel(o);
  const L = (a: number, b: number): number => Math.log10(b / a);
  return {
    all: L(m.pthAt(o.Qp, o.Qs), m.pthAt(o.Qp * 10, o.Qs * 10)),
    si: L(m.pthAt(o.Qp, o.Qs), m.pthAt(o.Qp, o.Qs * 10)),
    p: L(m.pthAt(o.Qp, o.Qs), m.pthAt(o.Qp * 10, o.Qs)),
  };
}
export function scalingRows(o: OpoState): string {
  const k = slopes(o);
  return rowsHTML([
    { k: "all three Q (triply resonant)", v: sgnF(k.all, 3, 6) },
    { k: "Q<sub>s</sub> = Q<sub>i</sub> only (DRO scaling)", v: sgnF(k.si, 3, 6) },
    { k: "Q<sub>p</sub> only", v: sgnF(k.p, 3, 6) },
    { k: "P<sub>th</sub> at the marker", v: si(opoModel(o).Pth, "W") },
  ]);
}

// ---------------------------------------------------------------- OPA (eq. 2.14 and non-degenerate gain)
export const etaSI = (pct: number): number => pct * 100; // %/W/cm^2 -> 1/(W m^2)
/** Phase-insensitive gain in dB, G = 1 + (Gamma/q)^2 sinh^2(q L), q^2 = Gamma^2 - (dk/2)^2 (opaGain), with the large-qL
 *  asymptote 20 log10(Gamma/q) + 20 log10(e) q L - 20 log10 2 where sinh overflows. */
export function gainPIdB(Gamma: number, L_m: number, dk: number): number {
  const q2 = Gamma * Gamma - (dk / 2) ** 2;
  if (q2 > 0 && Math.sqrt(q2) * L_m > 30) { const q = Math.sqrt(q2); return 20 * Math.log10(Gamma / q) + (20 / Math.LN10) * q * L_m - 20 * Math.log10(2); }
  return 10 * Math.log10(opaGain(Gamma, L_m, dk));
}
export interface OpaOut { Gamma: number; dBcm: number; Gps: number; Gpi0: number; Gpi: number; ratio: number }
export function opaModel(a: OpaState): OpaOut {
  const eta = etaSI(a.eta), L = a.Lmm * 1e-3, dk = a.dk * 1e3;
  const Gamma = Math.sqrt(eta * a.Pp);
  const dBm = opaGainDbPerM(eta, a.Pp);
  return { Gamma, dBcm: dBm / 100, Gps: dBm * L, Gpi0: gainPIdB(Gamma, L, 0), Gpi: gainPIdB(Gamma, L, dk), ratio: dk / (2 * Gamma) };
}
const OPA_BOX: Box = { w: 520, h: 250, l: 58, r: 14, t: 26, b: 30 };
const LMAX = 20;
function niceMax(v: number): number {
  const p = 10 ** Math.floor(Math.log10(v)), r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
}
/** Gain curves vs length for the current pump: phase-sensitive, phase-insensitive (dk = 0 and set dk), small-gain limit. */
export function opaCurves(a: OpaState, n = 161): { xs: number[]; ps: number[]; pi0: number[]; pi: number[]; lo: number[] } {
  const eta = etaSI(a.eta), Gamma = Math.sqrt(eta * a.Pp), dBm = opaGainDbPerM(eta, a.Pp), dk = a.dk * 1e3;
  const xs: number[] = [], ps: number[] = [], pi0: number[] = [], pi: number[] = [], lo: number[] = [];
  for (let i = 0; i < n; i++) {
    const Lmm = (LMAX * i) / (n - 1), L = Lmm * 1e-3;
    xs.push(Lmm); ps.push(dBm * L); pi0.push(gainPIdB(Gamma, L, 0)); pi.push(gainPIdB(Gamma, L, dk)); lo.push(10 * Math.log10(1 + (Gamma * L) ** 2));
  }
  return { xs, ps, pi0, pi, lo };
}
export function opaPlotSVG(a: OpaState): string {
  const cv = opaCurves(a);
  const ymax = niceMax(Math.max(1, cv.ps[cv.ps.length - 1]));
  const fr = frame(OPA_BOX, { d: [0, LMAX] }, a.ylog ? { kind: "log", d: [0.01, 1e4] } : { d: [0, ymax] });
  let s = `<defs>${clip(fr, "p24-c4")}</defs>` + axes(fr, { xlab: "length L (mm)", ylab: "gain G (dB)" });
  s += `<g clip-path="url(#p24-c4)"><path class="s5" d="${path(fr, cv.xs, cv.lo)}"/><path class="s3" d="${path(fr, cv.xs, cv.pi)}"/><path class="s2" d="${path(fr, cv.xs, cv.pi0)}"/><path class="s1" d="${path(fr, cv.xs, cv.ps)}"/></g>`;
  const px = fr.x.f(a.Lmm);
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${c(OPA_BOX.t)}" y2="${c(OPA_BOX.h - OPA_BOX.b)}"/>`;
  const m = opaModel(a);
  const py = fr.y.f(m.Gps);
  if (py >= OPA_BOX.t && py <= OPA_BOX.h - OPA_BOX.b) s += `<path class="mk" d="M${c(px)} ${c(py - 4)}L${c(px + 4)} ${c(py)}L${c(px)} ${c(py + 4)}L${c(px - 4)} ${c(py)}Z"/>`;
  return s;
}
export function opaRows(a: OpaState): string {
  const m = opaModel(a);
  return rowsHTML([
    { k: "&Gamma; = (&eta;<sub>norm</sub>P<sub>p</sub>)<sup>1/2</sup>", v: `${pad((m.Gamma * 1e-3).toFixed(3), 7)} /mm` },
    { k: "gain, eq. 2.14", v: `${pad(m.dBcm.toFixed(1), 7)} dB/cm` },
    { k: "G phase-sensitive", v: dB(m.Gps, 7) },
    { k: "de-amplified quadrature", v: dB(-m.Gps, 7) },
    { k: "G cosh<sup>2</sup>(&Gamma;L), &Delta;k = 0", v: dB(m.Gpi0, 7) },
    { k: "G at &Delta;k", v: dB(m.Gpi, 7) },
    { k: "&Delta;k / 2&Gamma;", v: pad(m.ratio.toFixed(3), 7) },
    { k: "q<sup>2</sup> = &Gamma;<sup>2</sup> &minus; (&Delta;k/2)<sup>2</sup>", v: pad(m.ratio < 1 ? "> 0" : m.ratio === 1 ? "0" : "< 0", 7) },
  ]);
}

// ---------------------------------------------------------------- OPO tuning
export const LP_TUNE = 1.064; // um, pump
const nZ = (l: number): number => refractiveIndex(ZELMON_CLN_E, l);
const nJ = (l: number, T?: number): number => refractiveIndex(JUNDT_CLN_E, l, T);
const WZ = { ns: nZ, ni: nZ, np: nZ }, WJ = { ns: nJ, ni: nJ, np: nJ };
const LS_LO = 1.3; // um, lower signal bound of the root scan (idler then exceeds the 5 um model window)
export const LAM_X: [number, number] = [26, 32];

/** Signal / idler at period L (um): Zelmon 21 C when T is undefined, otherwise Jundt at T (20-250 C). */
export function tunePoint(L: number, T?: number): { s: number; i: number } {
  try {
    const r = T === undefined ? opoSignalIdler(LP_TUNE, L, WZ, LS_LO) : opoSignalIdler(LP_TUNE, L, WJ, LS_LO, T);
    return { s: r.signal, i: r.idler };
  } catch { return { s: Number.NaN, i: Number.NaN }; }
}
/** Degenerate period (signal = idler = 2 lambda_p). */
export function degPeriod(T?: number): number {
  const l = 2 * LP_TUNE;
  return T === undefined ? qpmPeriod(l, l, { n1: nZ, n2: nZ, n3: nZ }) : qpmPeriod(l, l, { n1: (x) => nJ(x, T), n2: (x) => nJ(x, T), n3: (x) => nJ(x, T) });
}
/** Closed tuning curve lambda(Lambda): signal branch up to degeneracy, then the idler branch back (energy conserved per point). */
const curveMemo = new Map<string, { xs: number[]; ys: number[]; resid: number }>();
export function tuneCurve(T?: number, n = 121): { xs: number[]; ys: number[]; resid: number } {
  const key = `${T ?? "z"}:${n}`, hit = curveMemo.get(key);
  if (hit) return hit;
  const v = tuneCurveRaw(T, n);
  if (curveMemo.size > 64) curveMemo.clear();
  curveMemo.set(key, v);
  return v;
}
function tuneCurveRaw(T: number | undefined, n: number): { xs: number[]; ys: number[]; resid: number } {
  const sx: number[] = [], sy: number[] = [], iy: number[] = [];
  let resid = 0;
  const Ld = degPeriod(T);
  for (let k = 0; k < n; k++) {
    const L = LAM_X[0] + ((LAM_X[1] - LAM_X[0]) * k) / (n - 1);
    if (L >= Ld) break;
    const p = tunePoint(L, T);
    if (!Number.isFinite(p.s)) { sx.push(L); sy.push(Number.NaN); iy.push(Number.NaN); continue; }
    resid = Math.max(resid, Math.abs(1 - LP_TUNE / p.s - LP_TUNE / p.i));
    sx.push(L); sy.push(p.s); iy.push(p.i);
  }
  const xs = [...sx, Ld, ...sx.slice().reverse()], ys = [...sy, 2 * LP_TUNE, ...iy.slice().reverse()];
  return { xs, ys, resid };
}
export const nuTHz = (um: number): number => C0 / (um * 1e-6) / 1e12;

const TA_BOX: Box = { w: 520, h: 260, l: 58, r: 14, t: 26, b: 30 };
const TB_BOX: Box = { w: 520, h: 260, l: 58, r: 14, t: 26, b: 30 };
const LY: [number, number] = [1.3, 5.0];
const dia = (x: number, y: number, cls: string, r = 4): string => `<path class="${cls}" d="M${c(x)} ${c(y - r)}L${c(x + r)} ${c(y)}L${c(x)} ${c(y + r)}L${c(x - r)} ${c(y)}Z"/>`;

/** TECH (a): signal / idler vs period, Zelmon 21 C (solid) and Jundt at T (dashed). */
export function tuneASVG(t: TuneState): string {
  const fr = frame(TA_BOX, { d: LAM_X }, { d: LY });
  let s = `<defs>${clip(fr, "p24-c5")}</defs>` + axes(fr, { xlab: "period &Lambda; (&micro;m)", ylab: "&lambda; (&micro;m)" });
  const z = tuneCurve(undefined), j = tuneCurve(t.T);
  s += `<g clip-path="url(#p24-c5)">${fanStatic(fr, "s6")}<path class="s1" d="${path(fr, z.xs, z.ys)}"/><path class="s2" d="${path(fr, j.xs, j.ys)}"/></g>`;
  const px = fr.x.f(t.L);
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${c(TA_BOX.t)}" y2="${c(TA_BOX.h - TA_BOX.b)}"/>`;
  const pz = tunePoint(t.L), pj = tunePoint(t.L, t.T);
  for (const [p, cls] of [[pz, "mk"], [pj, "mko"]] as const) if (Number.isFinite(p.s)) s += dia(px, fr.y.f(p.s), cls) + dia(px, fr.y.f(p.i), cls);
  return s;
}
/** TECH (b): signal and idler frequency vs temperature at the set period (Jundt), mirror images about nu_p / 2. */
export function tuneBSVG(t: TuneState): string {
  const nh = nuTHz(LP_TUNE) / 2;
  const Ts: number[] = [], ns: number[] = [], ni: number[] = [];
  let span = 10;
  for (let T = 20; T <= 250.001; T += 2.5) {
    const p = tunePoint(t.L, T);
    Ts.push(T); ns.push(nuTHz(p.s)); ni.push(nuTHz(p.i));
    if (Number.isFinite(p.s)) span = Math.max(span, Math.abs(nuTHz(p.s) - nh));
  }
  const hs = niceMax(span * 1.08);
  const fr = frame(TB_BOX, { d: [20, 250] }, { d: [nh - hs, nh + hs] });
  let s = `<defs>${clip(fr, "p24-c6")}</defs>` + axes(fr, { xlab: "T (&deg;C)", ylab: "&nu; (THz)", yfmt: (v) => v.toFixed(0) });
  s += `<line class="s6" x1="${c(TB_BOX.l)}" x2="${c(TB_BOX.w - TB_BOX.r)}" y1="${c(fr.y.f(nh))}" y2="${c(fr.y.f(nh))}"/>`;
  s += `<g clip-path="url(#p24-c6)"><path class="s1" d="${path(fr, Ts, ns)}"/><path class="s2" d="${path(fr, Ts, ni)}"/></g>`;
  const px = fr.x.f(t.T);
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${c(TB_BOX.t)}" y2="${c(TB_BOX.h - TB_BOX.b)}"/>`;
  const p = tunePoint(t.L, t.T);
  if (Number.isFinite(p.s)) s += dia(px, fr.y.f(nuTHz(p.s)), "mk") + dia(px, fr.y.f(nuTHz(p.i)), "mko");
  s += `<text class="lg" x="${c(TB_BOX.w - TB_BOX.r - 4)}" y="${c(fr.y.f(nh) - 5)}" text-anchor="end">&nu;<tspan dy="3" font-size="0.8em">p</tspan><tspan dy="-3">/2</tspan></text>`;
  return s;
}
/** Temperature slopes d lambda / dT (nm/K) of signal and idler at (L, T), central difference over +-1 K inside 20-250 C. */
export function tuneSlopes(L: number, T: number): { s: number; i: number } {
  const a = Math.max(20, T - 1), b = Math.min(250, T + 1);
  const pa = tunePoint(L, a), pb = tunePoint(L, b);
  return { s: ((pb.s - pa.s) / (b - a)) * 1e3, i: ((pb.i - pa.i) / (b - a)) * 1e3 };
}
export function tuneRows(t: TuneState): string {
  const pz = tunePoint(t.L), pj = tunePoint(t.L, t.T), sl = tuneSlopes(t.L, t.T);
  const r = Math.max(tuneCurve(undefined).resid, tuneCurve(t.T).resid);
  const res = Number.isFinite(pj.s) ? Math.abs(1 - LP_TUNE / pj.s - LP_TUNE / pj.i) : Number.NaN;
  return rowsHTML([
    { k: "signal, Zelmon 21 &deg;C", v: nmF(pz.s) },
    { k: "idler, Zelmon 21 &deg;C", v: nmF(pz.i) },
    { k: "signal, Jundt at T", v: nmF(pj.s) },
    { k: "idler, Jundt at T", v: nmF(pj.i) },
    { k: "d&lambda;<sub>s</sub>/dT", v: `${sgnF(sl.s, 3, 7)} nm/K` },
    { k: "d&lambda;<sub>i</sub>/dT", v: `${sgnF(sl.i, 3, 7)} nm/K` },
    { k: "degenerate &Lambda;, Zelmon", v: `${pad(degPeriod().toFixed(3), 7)} &micro;m` },
    { k: "degenerate &Lambda;, Jundt at T", v: `${pad(degPeriod(t.T).toFixed(3), 7)} &micro;m` },
    { k: "|1 &minus; &lambda;<sub>p</sub>/&lambda;<sub>s</sub> &minus; &lambda;<sub>p</sub>/&lambda;<sub>i</sub>| here", v: resF(res) },
    { k: "maximum over both curves", v: resF(r) },
    { k: "pump &nu;<sub>p</sub>", v: `${pad(nuTHz(LP_TUNE).toFixed(1), 6)} THz` },
    { k: "signal &nu;<sub>s</sub>, Jundt at T", v: `${pad(Number.isFinite(pj.s) ? nuTHz(pj.s).toFixed(1) : "–", 6)} THz` },
    { k: "idler &nu;<sub>i</sub>, Jundt at T", v: `${pad(Number.isFinite(pj.i) ? nuTHz(pj.i).toFixed(1) : "–", 6)} THz` },
  ]);
}

// ---------------------------------------------------------------- VISUAL: ring OPO instrument
export const RING = { x0: 70, x1: 614, u: 68, cx: 370, cy: 160, r: 104, by: 290 } as const;
export interface RingDyn { pumpOp: string; sigOp: string; sigW: string; outOp: string; pumpLen: number; outLen: number; over: boolean }
/** Drawing state: intracavity pump glow follows |a_p|^2 / clamp (freezes at 1 above threshold); signal glow and output
 *  arrow follow P_s+i; arrow lengths are P / P_th and P_s+i / P_th on one axis (length ratio = conversion). */
export function ringDyn(o: OpoState): RingDyn {
  const m = opoModel(o);
  const fill = m.np / m.nth;
  const sg = m.Psi > 0 ? Math.min(1, (Math.sqrt(m.x) - 1) / (Math.sqrt(8) - 1)) : 0;
  return {
    pumpOp: (0.12 + 0.88 * fill).toFixed(3),
    sigOp: m.Psi > 0 ? (0.4 + 0.6 * sg).toFixed(3) : "0",
    sigW: (5 + 7 * sg).toFixed(1),
    outOp: m.Psi > 0 ? "1" : "0",
    pumpLen: Math.min(8, m.x) * RING.u,
    outLen: Math.min(8, m.Psi / m.Pth) * RING.u,
    over: m.x > 8,
  };
}
const arrowD = (x0: number, y: number, len: number): string => len < 1 ? `M${x0} ${y}H${x0}` : `M${x0} ${y}H${c(x0 + len)}`;
const headD = (x0: number, y: number, len: number): string => len < 1 ? "" : `M${c(x0 + len - 9)} ${y - 7}L${c(x0 + len + 1)} ${y}L${c(x0 + len - 9)} ${y + 7}`;
export function ringSVG(o: OpoState): string {
  const R = RING, d = ringDyn(o);
  const yA = 352, yP = 378, yO = 404;
  let ax = `<line class="p24v-ax" x1="${R.x0}" x2="${R.x1 + 14}" y1="${yA}" y2="${yA}"/>`;
  for (let k = 0; k <= 8; k++) {
    const x = R.x0 + k * R.u, big = k === 1 || k === 4;
    ax += `<line class="p24v-ax${big ? " hi" : ""}" x1="${x}" x2="${x}" y1="${yA - (big ? 9 : 5)}" y2="${yA}"/><text class="p24v-tk${big ? " hi" : ""}" x="${x}" y="${yA - 14}" text-anchor="middle">${k === 1 ? "P<tspan dy='3' font-size='0.75em'>th</tspan>" : k === 4 ? "4P<tspan dy='3' font-size='0.75em'>th</tspan>" : k}</text>`;
  }
  return `<defs><filter id="p24v-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>
<rect class="p24v-bus" x="20" y="${R.by - 5}" width="680" height="10"/>
<circle class="p24v-wg" cx="${R.cx}" cy="${R.cy}" r="${R.r}"/>
<circle id="p24v-pg" class="p24v-pump gl" cx="${R.cx}" cy="${R.cy}" r="${R.r}" style="opacity:${d.pumpOp}"/>
<circle id="p24v-sgb" class="p24v-sig gl ir-el" cx="${R.cx}" cy="${R.cy}" r="${R.r}" filter="url(#p24v-blur)" style="opacity:${d.sigOp};stroke-width:${d.sigW}"/>
<circle id="p24v-sg" class="p24v-sig gl ir-el" cx="${R.cx}" cy="${R.cy}" r="${R.r}" style="opacity:${d.sigOp}"/>
<path class="p24v-pin" d="M20 ${R.by}H${R.cx}"/>
<path id="p24v-so" class="p24v-sig gl ir-el" d="M${R.cx} ${R.by}H700" style="opacity:${d.outOp}"/>
<text class="p24v-l" x="24" y="${R.by + 30}">pump in, 775 nm</text>
<text class="p24v-l" x="696" y="${R.by + 30}" text-anchor="end">signal + idler out, 1550 nm</text>
${ax}
<text class="p24v-tk" x="${R.x1 + 34}" y="${yA + 4}">P/P<tspan dy="3" font-size="0.75em">th</tspan></text>
<path id="p24v-pa" class="p24v-arr pump" d="${arrowD(R.x0, yP, d.pumpLen)}"/><path id="p24v-ph" class="p24v-hd pump" d="${headD(R.x0, yP, d.pumpLen)}"/>
<path id="p24v-ov" class="p24v-hd pump" d="M${R.x1 + 10} ${yP - 7}l6 7-6 7M${R.x1 + 18} ${yP - 7}l6 7-6 7" style="opacity:${d.over ? 1 : 0}"/>
<path id="p24v-oa" class="p24v-arr sig ir-el" d="${arrowD(R.x0, yO, d.outLen)}"/><path id="p24v-oh" class="p24v-hd sig ir-el" d="${headD(R.x0, yO, d.outLen)}"/>
<text class="p24v-l" x="${R.x0 - 8}" y="${yP + 5}" text-anchor="end">pump</text>
<text class="p24v-l" x="${R.x0 - 8}" y="${yO + 5}" text-anchor="end">out</text>`;
}
export interface RingHud { x: string; P: string; Pth: string; np: string; nth: string; Psi: string; eff: string; effMax: string; QpL: string; QsL: string; g: string }
export function ringHud(o: OpoState): RingHud {
  const m = opoModel(o);
  return {
    x: pad(m.x >= 999.5 ? ">999" : m.x.toFixed(m.x < 9.995 ? 2 : m.x < 99.95 ? 1 : 0), 5),
    P: si(o.P, "W"), Pth: si(m.Pth, "W"), np: sciU(m.np, 2), nth: sciU(m.nth, 2), Psi: si(m.Psi, "W"), eff: pctF(m.eff), effMax: pctF(m.effMax),
    QpL: sciU(m.QpL, 2), QsL: sciU(m.QsL, 2), g: si(o.g2pi, "Hz"),
  };
}

// ---------------------------------------------------------------- VISUAL: OPA waveguide strip + gain curves
const VA_BOX: Box = { w: 760, h: 440, l: 70, r: 24, t: 214, b: 40 };
/** Chip on the 0-20 mm axis, lit up to the set length; signal field envelopes on a linear amplitude scale set to the chip
 *  output: amplified quadrature a0 exp(Gamma z) (hatched), de-amplified a0 exp(-Gamma z) (dotted), equal input a0. */
export function vOpaSVG(a: OpaState): string {
  const m = opaModel(a), cv = opaCurves(a);
  const x0 = 70, x1 = 736, zx = (mm: number): number => x0 + (mm / LMAX) * (x1 - x0), yc = 98, H = 56;
  const G = m.Gamma * 1e-3, L = a.Lmm; // 1/mm, mm
  const amp = (z: number): number => H * Math.exp(G * (z - L)), dq = (z: number): number => H * Math.exp(-G * L) * Math.exp(-G * z);
  const N = 80;
  let up = "", lo = "", du = "", dl = "";
  for (let i = 0; i <= N; i++) {
    const z = (L * i) / N, X = c(zx(z));
    up += `${i ? "L" : "M"}${X} ${c(yc - amp(z))}`; lo = `L${X} ${c(yc + amp(z))}` + lo;
    du += `${i ? "L" : "M"}${X} ${c(yc - dq(z))}`; dl += `${i ? "L" : "M"}${X} ${c(yc + dq(z))}`;
  }
  const xL = zx(L);
  let s = `<defs><pattern id="p24v-hs" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="p24v-hl"/></pattern>${clip(frame(VA_BOX, { d: [0, LMAX] }, { d: [0, 1] }), "p24v-c1")}</defs>`;
  s += `<rect class="p24v-chip" x="${x0}" y="${yc - 72}" width="${c(xL - x0)}" height="144"/><rect class="p24v-chip off" x="${c(xL)}" y="${yc - 72}" width="${c(x1 - xL)}" height="144"/>`;
  s += `<line class="p24v-pumpline" x1="${x0}" x2="${c(xL)}" y1="${yc}" y2="${yc}"/>`;
  s += `<path class="p24v-wedge ir-el" d="${up}${lo}Z"/><path class="p24v-dq ir-el" d="${du}"/><path class="p24v-dq ir-el" d="${dl}"/>`;
  s += `<text class="p24v-l" x="${x0 + 8}" y="${yc - 54}">amplified quadrature</text><text class="p24v-l" x="${x0 + 8}" y="${yc + 64}">de-amplified quadrature, dotted</text>`;
  s += `<text class="p24v-l dim" x="${x1}" y="${yc + 96}" text-anchor="end">field envelope, linear; pump undepleted</text>`;
  const ymax = niceMax(Math.max(1, cv.ps[cv.ps.length - 1]));
  const fr = frame(VA_BOX, { d: [0, LMAX] }, a.ylog ? { kind: "log", d: [0.01, 1e4] } : { d: [0, ymax] });
  s += axes(fr, { xlab: "z (mm)", ylab: "gain (dB)" });
  s += `<g clip-path="url(#p24v-c1)"><path class="s6" d="${path(fr, cv.xs, cv.lo)}"/><path class="s2" d="${path(fr, cv.xs, cv.pi)}"/><path class="s1" d="${path(fr, cv.xs, cv.pi0)}"/><path class="s4 ir-el" d="${path(fr, cv.xs, cv.ps)}"/></g>`;
  const px = fr.x.f(a.Lmm);
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${c(yc - 72)}" y2="${c(VA_BOX.h - VA_BOX.b)}"/>`;
  const py = fr.y.f(m.Gps);
  if (py >= VA_BOX.t && py <= VA_BOX.h - VA_BOX.b) s += dia(px, py, "p24v-pt", 7);
  return s;
}
export interface OpaHud { Gamma: string; dBcm: string; Gps: string; Gdq: string; Gpi0: string; Gpi: string; ratio: string }
export function vOpaHud(a: OpaState): OpaHud {
  const m = opaModel(a);
  return { Gamma: `${pad((m.Gamma * 1e-3).toFixed(3), 7)} /mm`, ratio: pad(m.ratio.toFixed(3), 7), dBcm: `${pad(m.dBcm.toFixed(1), 7)} dB/cm`, Gps: dB(m.Gps, 7), Gdq: dB(-m.Gps, 7), Gpi0: dB(m.Gpi0, 7), Gpi: dB(m.Gpi, 7) };
}

// ---------------------------------------------------------------- VISUAL: tuning fan + photon-energy bar
const FAN_T = [20, 66, 112, 158, 204, 250];
const VF_BOX: Box = { w: 760, h: 470, l: 70, r: 24, t: 24, b: 470 - 286 };
const fanCache = new Map<string, string>();
/** Jundt tuning curves at the fan temperatures 20 to 250 C (static; cached per frame and class). */
function fanStatic(fr: Frame, cls: string): string {
  const key = `${fr.box.w}:${cls}`, hit = fanCache.get(key);
  if (hit) return hit;
  let s = "";
  for (const T of FAN_T) { const cv = tuneCurve(T, 81); s += `<path class="${cls}" d="${path(fr, cv.xs, cv.ys)}"/>`; }
  fanCache.set(key, s);
  return s;
}
export function vFanSVG(t: TuneState): string {
  const fr = frame(VF_BOX, { d: LAM_X }, { d: LY });
  let s = `<defs><pattern id="p24v-hp" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="p24v-hp"/></pattern><pattern id="p24v-hi" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="8" class="p24v-hl"/></pattern><pattern id="p24v-hj" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" class="p24v-hl"/></pattern>${clip(fr, "p24v-c2")}</defs>`;
  s += axes(fr, { ylab: "wavelength (&micro;m)" }) + `<text class="al" x="${VF_BOX.w - VF_BOX.r}" y="${VF_BOX.h - VF_BOX.b + 36}" text-anchor="end">poling period &Lambda; (&micro;m)</text>`;
  const cv = tuneCurve(t.T);
  s += `<g clip-path="url(#p24v-c2)">${fanStatic(fr, "p24v-fan ir-el")}<path class="p24v-ref" d="${path(fr, tuneCurve(undefined).xs, tuneCurve(undefined).ys)}"/><path class="p24v-cur ir-el" d="${path(fr, cv.xs, cv.ys)}"/></g>`;
  const px = fr.x.f(t.L), p = tunePoint(t.L, t.T);
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${c(VF_BOX.t)}" y2="${c(VF_BOX.h - VF_BOX.b)}"/>`;
  const right = px < 560;
  if (Number.isFinite(p.s)) {
    const ys = fr.y.f(p.s), yi = fr.y.f(p.i);
    s += dia(px, ys, "p24v-pt", 7) + dia(px, yi, "p24v-pt", 7);
    s += `<text class="p24v-l" x="${c(px + (right ? 12 : -12))}" y="${c(ys + 18)}" text-anchor="${right ? "start" : "end"}">signal</text><text class="p24v-l" x="${c(px + (right ? 12 : -12))}" y="${c(yi - 10)}" text-anchor="${right ? "start" : "end"}">idler</text>`;
  }
  // photon-energy bar: nu_p = nu_s + nu_i on one frequency axis
  const nP = nuTHz(LP_TUNE), bx0 = 70, bx1 = 736, X = (nu: number): number => bx0 + (nu / nP) * (bx1 - bx0);
  const y1 = 352, y2 = 406, hb = 24;
  s += `<rect class="p24v-bar pump ir-el" x="${bx0}" y="${y1}" width="${bx1 - bx0}" height="${hb}"/>`;
  s += `<text class="p24v-l" x="${bx0}" y="${y1 - 8}">pump 1064 nm, &nu;<tspan dy="4" font-size="0.75em">p</tspan><tspan dy="-4"> = ${nP.toFixed(1)} THz</tspan></text>`;
  if (Number.isFinite(p.s)) {
    const ns = nuTHz(p.s), ni = nuTHz(p.i), xs = X(ns);
    s += `<rect class="p24v-bar sig ir-el" x="${bx0}" y="${y2}" width="${c(xs - bx0)}" height="${hb}"/><rect class="p24v-bar idl ir-el" x="${c(xs)}" y="${y2}" width="${c(bx1 - xs)}" height="${hb}"/>`;
    s += `<line class="p24v-split" x1="${c(xs)}" x2="${c(xs)}" y1="${y1 + hb + 4}" y2="${y2 + hb + 8}"/>`;
    s += `<text class="p24v-l" x="${bx0}" y="${y2 + hb + 22}">signal &nu;<tspan dy="4" font-size="0.75em">s</tspan><tspan dy="-4"> = ${ns.toFixed(1)} THz</tspan></text><text class="p24v-l" x="${bx1}" y="${y2 + hb + 22}" text-anchor="end">idler &nu;<tspan dy="4" font-size="0.75em">i</tspan><tspan dy="-4"> = ${ni.toFixed(1)} THz</tspan></text>`;
  } else {
    s += `<rect class="p24v-bar none" x="${bx0}" y="${y2}" width="${bx1 - bx0}" height="${hb}"/><text class="p24v-l dim" x="${(bx0 + bx1) / 2}" y="${y2 + 18}" text-anchor="middle">no phase-matched pair at this period and temperature</text>`;
  }
  return s;
}
export interface FanHud { s: string; i: string; zs: string; zi: string; dS: string; dI: string; degZ: string; degJ: string; res: string }
export function vFanHud(t: TuneState): FanHud {
  const p = tunePoint(t.L, t.T), sl = tuneSlopes(t.L, t.T);
  const res = Number.isFinite(p.s) ? Math.abs(1 - LP_TUNE / p.s - LP_TUNE / p.i) : Number.NaN;
  return {
    s: nmF(p.s), i: nmF(p.i), zs: nmF(tunePoint(t.L).s), zi: nmF(tunePoint(t.L).i),
    degZ: `${pad(degPeriod().toFixed(3), 7)} µm`, degJ: `${pad(degPeriod(t.T).toFixed(3), 7)} µm`, dS: `${sgnF(sl.s, 3, 7)} nm/K`, dI: `${sgnF(sl.i, 3, 7)} nm/K`,
    res: resF(res),
  };
}

// ---------------------------------------------------------------- server: default markup for both variants
export function initAll() {
  const o = DEF.opo, a = DEF.opa, t = DEF.tune;
  return {
    opoSvg: opoPlotSVG(o), opoRo: opoRows(o), scSvg: scalingSVG(o), scRo: scalingRows(o),
    opaSvg: opaPlotSVG(a), opaRo: opaRows(a), taSvg: tuneASVG(t), tbSvg: tuneBSVG(t), tuRo: tuneRows(t),
    ring: ringSVG(o), ringHud: ringHud(o), vOpa: vOpaSVG(a), vOpaHud: vOpaHud(a), fan: vFanSVG(t), fanHud: vFanHud(t),
  };
}

// ---------------------------------------------------------------- slider ranges (log sliders: integer steps 0..N)
export const LOG = {
  P: [1e-7, 1e-1, 600], Q: [1e4, 1e8, 400], g: [1e4, 1e7, 300], eta: [100, 50000, 540], Pp: [1e-3, 1e2, 500], vQ: [1e5, 1e8, 300],
} as const satisfies Record<string, readonly [number, number, number]>;
/** Slider position of value v on a log slider [lo, hi, N] (same mapping as ctl.ts logMap). */
export const lpos = (v: number, [lo, hi, N]: readonly [number, number, number]): number => Math.max(0, Math.min(N, Math.round((Math.log(v / lo) / Math.log(hi / lo)) * N)));
export const lval = (s: number, [lo, hi, N]: readonly [number, number, number]): number => lo * (hi / lo) ** (s / N);
/** Fixed-format slider outputs (shared by the server default and the live update). */
export const OUT = {
  P: (v: number): string => si(v, "W"),
  Q: (v: number): string => sciU(v, 1, 7),
  e: (v: number): string => v.toFixed(2),
  g: (v: number): string => si(v, "Hz"),
  eta: (v: number): string => `${pad(v.toFixed(0), 5)} %/W/cm²`,
  Pp: (v: number): string => si(v, "W"),
  L: (v: number): string => `${pad(v.toFixed(1), 4)} mm`,
  dk: (v: number): string => `${v.toFixed(2)} rad/mm`,
  lam: (v: number): string => `${v.toFixed(2)} µm`,
  T: (v: number): string => `${pad(v.toFixed(1), 5)} °C`,
  x: (v: number): string => pad(v >= 999.5 ? ">999" : v.toFixed(v < 9.995 ? 2 : v < 99.95 ? 1 : 0), 5),
};
