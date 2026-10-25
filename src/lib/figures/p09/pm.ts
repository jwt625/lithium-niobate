// F2 phase-matching calculator: compute (pure, physics from src/lib/physics) and markup (SVG plots, fixed-format readouts)
// shared by the server load (default state, prerendered) and the browser (live). Type-0 e-e-e quasi-phase matching,
// waves 1 + 2 -> 3 with 1/l3 = 1/l1 + 1/l2 (SHG: 1 = 2; DFG and OPO: 3 is the pump). Birefringent type I (o-o-e) angle
// for the same wavelengths where the model has an o index.
import { refractiveIndex, inRange, type DispersionCoefficients } from "$lib/physics/sellmeier.ts";
import {
  deltaKMaterial, deltaKQPM, qpmDeffFactor, opoSignalIdler, birefringentAngle, acceptanceFWHM, derivative, differenceWavelength, sumWavelength, sinc2,
} from "$lib/physics/phasematching.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O, ZELMON_MGO5_E, ZELMON_MGO5_O, GAYER_MGO5_E, GAYER_MGO5_O, GAYER_MGO1SLN_E, JUNDT_CLN_E } from "$lib/physics/constants.ts";
import type { PmModel, PmState, Proc } from "$lib/stores/p09";
import { FS, MINUS, pad } from "../fmt.ts";

export interface ModelDef { id: PmModel; label: string; short: string; e: DispersionCoefficients; o?: DispersionCoefficients; status: "P" | "P-db" | "S"; tdep: boolean; note: string; src: string }
export const PM_MODELS: readonly ModelDef[] = [
  { id: "zelmon-cln", label: "Zelmon 1997, congruent", short: "Zelmon CLN", e: ZELMON_CLN_E, o: ZELMON_CLN_O, status: "P-db", tdep: false, note: "21 &deg;C only; 0.4 to 5.0 &micro;m", src: "D. E. Zelmon, D. L. Small, D. Jundt, JOSA B 14, 3319 (1997), <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>, Table 2 via the refractiveindex.info YAML (CC0)." },
  { id: "zelmon-mgo5", label: "Zelmon 1997, 5 mol% MgO", short: "Zelmon MgO5", e: ZELMON_MGO5_E, o: ZELMON_MGO5_O, status: "P-db", tdep: false, note: "21 &deg;C only; o and e rows of Table 2 swapped back per the 2026 erratum", src: "Zelmon et al. 1997 (as above); erratum <a href='https://doi.org/10.1364/JOSAB.616304'>doi:10.1364/JOSAB.616304</a>." },
  { id: "gayer-mgo5", label: "Gayer 2008, 5 mol% MgO:CLN", short: "Gayer MgO5", e: GAYER_MGO5_E, o: GAYER_MGO5_O, status: "P", tdep: true, note: "n<sub>e</sub> 0.5 to 4.0 &micro;m, 20 to 200 &deg;C; n<sub>o</sub> to 1.62 &micro;m, 20 to 100 &deg;C; dn/dT from these coefficients is anomalous", src: "O. Gayer, Z. Sacks, E. Galun, A. Arie, Appl. Phys. B 91, 343 (2008), <a href='https://doi.org/10.1007/s00340-008-2998-2'>doi:10.1007/s00340-008-2998-2</a>, Table 1." },
  { id: "gayer-mgo1sln", label: "Gayer 2008, 1 mol% MgO:SLN", short: "Gayer MgO:SLN", e: GAYER_MGO1SLN_E, status: "P", tdep: true, note: "n<sub>e</sub> only; 0.5 to 4.0 &micro;m, 20 to 200 &deg;C; dn/dT from these coefficients is anomalous", src: "Gayer et al. 2008 (as above), Table 1." },
  { id: "jundt-cln", label: "Jundt 1997, congruent (n<sub>e</sub>)", short: "Jundt CLN", e: JUNDT_CLN_E, status: "S", tdep: true, note: "n<sub>e</sub> only; 0.4 to 5.0 &micro;m, 20 to 250 &deg;C; coefficients via a secondary transcription", src: "D. H. Jundt, Opt. Lett. 22, 1553 (1997), <a href='https://doi.org/10.1364/OL.22.001553'>doi:10.1364/OL.22.001553</a>; coefficients via en.wikipedia (primary not read)." },
];
export const modelOf = (id: PmModel): ModelDef => PM_MODELS.find((m) => m.id === id) ?? PM_MODELS[0];

export interface PmResult {
  ok: boolean;
  why: string;
  l1: number; l2: number; l3: number;
  n1: number; n2: number; n3: number;
  dk: number; // material, rad/um
  period: number; // QPM order m, um
  lc: number; // coherence length, um
  deff: number;
  fwhmL: number; // nm (wave 1, wave 2 or pump fixed as stated)
  fwhmT: number; // K, NaN when not available
  tNote: string;
  theta: number; // type I o-o-e angle, deg, NaN when none
  thetaWhy: string;
  T: number;
  curve: { x: number[]; y: number[]; x0: number; label: string };
  tune: { x: number[]; y: number[]; y2?: number[]; x0: number; y0: number; xl: string; yl: string };
}

const lamMin = (m: DispersionCoefficients): number => m.lambda_um[0];
const lamMax = (m: DispersionCoefficients): number => m.lambda_um[1];
export const tOf = (s: PmState): number => (modelOf(s.model).tdep ? s.T : modelOf(s.model).e.T_ref_C);

/** Wavelengths (l1, l2) of the mixing pair for the state; OPO solves for signal and idler at the given period. */
function pair(s: PmState, def: ModelDef, T: number): [number, number] | string {
  const n = (l: number): number => refractiveIndex(def.e, l, T);
  const lo = lamMin(def.e);
  if (s.proc === "shg") return [s.l1, s.l1];
  if (s.proc === "sfg") return [s.l1, s.l2];
  if (s.proc === "dfg") {
    if (!(s.l2 > s.l1)) return "signal must be longer than the pump";
    return [s.l2, differenceWavelength(s.l1, s.l2)];
  }
  const r = opoSignalIdler(s.l1, s.period, { ns: n, ni: n, np: n }, Math.max(lo, s.l1 * 1.0001), T, s.m);
  if (!Number.isFinite(r.signal)) return "no signal and idler inside the model window for this pump and period";
  return [r.signal, r.idler];
}

export function computePM(s: PmState): PmResult {
  const def = modelOf(s.model);
  const T = tOf(s);
  const nE = (l: number, t = T): number => refractiveIndex(def.e, l, t);
  const w = { n1: nE, n2: nE, n3: nE };
  const empty: PmResult = { ok: false, why: "", l1: NaN, l2: NaN, l3: NaN, n1: NaN, n2: NaN, n3: NaN, dk: NaN, period: NaN, lc: NaN, deff: qpmDeffFactor(s.m, s.duty), fwhmL: NaN, fwhmT: NaN, tNote: "", theta: NaN, thetaWhy: "–", T, curve: { x: [], y: [], x0: NaN, label: "" }, tune: { x: [], y: [], x0: NaN, y0: NaN, xl: "", yl: "" } };
  let p: [number, number] | string;
  try { p = pair(s, def, T); } catch { p = `outside ${def.short} validity (${lamMin(def.e)} to ${lamMax(def.e)} µm)`; }
  if (typeof p === "string") return { ...empty, why: p };
  const [l1, l2] = p;
  const l3 = sumWavelength(l1, l2);
  const inWin = (l: number): boolean => inRange(def.e, l, T);
  if (![l1, l2, l3].every(inWin)) return { ...empty, l1, l2, l3, why: `outside ${def.short} validity (${lamMin(def.e)} to ${lamMax(def.e)} µm${def.tdep ? `, ${def.e.T_range_C?.[0]} to ${def.e.T_range_C?.[1]} °C` : ""})` };
  const dk = deltaKMaterial(l1, l2, w, T);
  const period = s.proc === "opo" ? s.period : (2 * Math.PI * s.m) / dk;
  const L = s.L_mm * 1e3;
  // wavelength acceptance: SHG fundamental; SFG wave 1 with wave 2 fixed; DFG / OPO signal with the pump fixed
  const dkOf = (x: number): number => {
    if (s.proc === "shg") return deltaKQPM(x, x, w, period, s.m, T);
    if (s.proc === "sfg") return deltaKQPM(x, l2, w, period, s.m, T);
    return deltaKQPM(x, differenceWavelength(l3, x), w, period, s.m, T);
  };
  let fwhmL = NaN;
  try { fwhmL = acceptanceFWHM(derivative(dkOf, l1, 1e-5), L) * 1e3; } catch { /* window edge */ }
  let fwhmT = NaN, tNote = "";
  if (!def.tdep) tNote = "model has no temperature dependence";
  else if (def.e.flags.some((f) => f.startsWith("dndT-anomalous"))) tNote = "not computed: dn/dT of this model is anomalous";
  else {
    try { fwhmT = acceptanceFWHM(derivative((t) => deltaKQPM(l1, l2, { n1: (l) => nE(l, t), n2: (l) => nE(l, t), n3: (l) => nE(l, t) }, period, s.m, t), T, 1e-2), L); }
    catch { tNote = "temperature window edge"; }
  }
  let theta = NaN, thetaWhy = def.o ? "no o window" : "no n_o";
  if (def.o && [l1, l2].every((l) => inRange(def.o as DispersionCoefficients, l, T)) && inRange(def.e, l3, T)) {
    const no = (l: number, t?: number): number => refractiveIndex(def.o as DispersionCoefficients, l, t ?? T);
    thetaWhy = "none";
    try { theta = (birefringentAngle("ooe", l1, l2, no, (l, t) => nE(l, t ?? T), T) * 180) / Math.PI; } catch { theta = NaN; }
  }
  // tuning curve sinc^2(dk L / 2) around wave 1 (period fixed)
  const half = Math.max(3 * (Number.isFinite(fwhmL) ? fwhmL : 1) * 1e-3, 2e-4);
  const cx: number[] = [], cy: number[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = l1 - half + (2 * half * i) / 160;
    let y = NaN;
    try { y = sinc2((dkOf(x) * L) / 2); } catch { /* outside */ }
    cx.push(x); cy.push(y);
  }
  // period curve (SHG, SFG, DFG) or signal / idler vs period (OPO)
  const tx: number[] = [], ty: number[] = [], ty2: number[] = [];
  let x0 = l1, y0 = period, xl = "", yl = "";
  if (s.proc === "opo") {
    xl = "period Λ (µm)"; yl = "signal, idler (µm)"; x0 = s.period; y0 = l1;
    const n = (l: number): number => nE(l);
    for (let i = 0; i <= 48; i++) {
      const P = PERIOD_RANGE[0] + ((PERIOD_RANGE[1] - PERIOD_RANGE[0]) * i) / 48;
      let r = { signal: NaN, idler: NaN };
      try { r = opoSignalIdler(s.l1, P, { ns: n, ni: n, np: n }, Math.max(lamMin(def.e), s.l1 * 1.0001), T, s.m); } catch { /* none */ }
      tx.push(P); ty.push(r.signal); ty2.push(r.idler);
    }
  } else {
    xl = s.proc === "shg" ? "fundamental λ (µm)" : s.proc === "sfg" ? "λ1 (µm), λ2 fixed" : "signal λ (µm), pump fixed";
    yl = `period Λ${s.m > 1 ? `, m = ${s.m}` : ""} (µm)`;
    const lo = s.proc === "shg" ? Math.max(2 * lamMin(def.e), 0.6) : s.proc === "sfg" ? Math.max(lamMin(def.e) * 1.02, 0.45) : l3 * 1.02;
    const hi = s.proc === "dfg" ? Math.min(lamMax(def.e), 2 * l3) * 0.999 : lamMax(def.e);
    for (let i = 0; i <= 120; i++) {
      const x = lo * (hi / lo) ** (i / 120);
      let y = NaN;
      try {
        const a = s.proc === "shg" ? [x, x] : s.proc === "sfg" ? [x, l2] : [x, differenceWavelength(l3, x)];
        const d = deltaKMaterial(a[0], a[1], w, T);
        y = d > 0 ? (2 * Math.PI * s.m) / d : NaN;
      } catch { /* outside */ }
      tx.push(x); ty.push(y);
    }
  }
  return {
    ok: true, why: "", l1, l2, l3, n1: nE(l1), n2: nE(l2), n3: nE(l3), dk, period, lc: Math.PI / Math.abs(dk), deff: qpmDeffFactor(s.m, s.duty), fwhmL, fwhmT, tNote, theta, thetaWhy, T,
    curve: { x: cx, y: cy, x0: l1, label: s.proc === "shg" ? "fundamental λ (µm)" : s.proc === "sfg" ? "λ1 (µm)" : "signal λ (µm)" },
    tune: { x: tx, y: ty, y2: s.proc === "opo" ? ty2 : undefined, x0, y0, xl, yl },
  };
}
export const PERIOD_RANGE: readonly [number, number] = [1, 40];

// ---------------- formatting (fixed widths) ----------------
const fx = (v: number, d: number, w: number): string => (Number.isFinite(v) ? pad((v < 0 ? MINUS : "") + Math.abs(v).toFixed(d), w) : pad("–", w));
export interface PmRows { k: string; v: string; u: string; key?: string }
export function pmRows(r: PmResult, s: PmState): PmRows[] {
  const pl = s.proc;
  const name = (i: 1 | 2 | 3): string => (pl === "shg" ? ["", "λ fundamental", "λ fundamental", "λ second harmonic"][i] : pl === "sfg" ? ["", "λ1", "λ2", "λ3 sum"][i] : ["", "λ signal", "λ idler", "λ pump"][i]);
  return [
    { k: name(1), v: fx(r.l1, 4, 8), u: "µm" },
    { k: name(2), v: fx(r.l2, 4, 8), u: "µm" },
    { k: name(3), v: fx(r.l3, 4, 8), u: "µm" },
    { k: "n<sub>e</sub> at 1, 2, 3", v: `${fx(r.n1, 5, 7)} ${fx(r.n2, 5, 7)} ${fx(r.n3, 5, 7)}`, u: "" },
    { k: "&Delta;k material", v: fx(r.dk, 5, 9), u: "rad/µm" },
    { k: pl === "opo" ? "&Lambda; set" : `&Lambda;<sub>QPM</sub>, m = ${s.m}`, v: fx(r.period, 3, 8), u: "µm" },
    { k: "coherence length &pi;/|&Delta;k|", v: fx(r.lc, 3, 8), u: "µm" },
    { k: "d<sub>eff</sub> / d<sub>33</sub>", v: fx(r.deff, 3, 8), u: "" },
    { k: `FWHM &lambda;<sub>${pl === "shg" ? "fund" : pl === "sfg" ? "1" : "s"}</sub>, L = ${s.L_mm < 1 ? s.L_mm.toFixed(2) : s.L_mm.toFixed(1)} mm`, v: fx(r.fwhmL, 3, 9), u: "nm" },
    { k: "FWHM T", v: Number.isFinite(r.fwhmT) ? fx(r.fwhmT, 2, 9) : pad("n/a", 9), u: "K" },
    { k: "type I o+o&rarr;e angle", v: Number.isFinite(r.theta) ? fx(r.theta, 2, 8) : pad(r.thetaWhy, 8), u: Number.isFinite(r.theta) ? "deg" : "" },
  ];
}
export const rowsHTML = (rows: PmRows[]): string => `<colgroup><col><col class="cv"><col class="cu"></colgroup><tbody>${rows.map((x) => `<tr><td>${x.k}</td><td class="v">${x.v}</td><td class="u">${x.u}</td></tr>`).join("")}</tbody>`;
export const statusLine = (r: PmResult): string => (r.ok ? (r.tNote ? `FWHM T: ${r.tNote}` : FS) : r.why);

// ---------------- plots ----------------
export interface PlotOpts { w: number; h: number; visual: boolean; color?: string }
const PAD = { l: 52, r: 12, t: 10, b: 30 };
export function ticks(lo: number, hi: number, n = 5): { v: number[]; d: number } {
  const span = hi - lo || Math.abs(hi) || 1, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
  const k = [1, 2, 2.5, 5, 10].find((q) => span / (q * mag) <= n) ?? 10, step = k * mag;
  const d = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9) + (k === 2.5 ? 1 : 0));
  const v: number[] = []; for (let x = Math.ceil(lo / step - 1e-9) * step; x <= hi + step * 1e-9; x += step) v.push(+x.toPrecision(12));
  return { v, d };
}
export const tfmt = (v: number, d: number): string => (v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? MINUS : "") + Math.abs(v).toFixed(d);

/** Generic line plot as SVG inner markup (no outer <svg>), fixed view box w x h. */
export function linePlot(series: { x: number[]; y: number[]; cls: string }[], o: PlotOpts & { xl: string; yl: string; x0?: number; y0?: number; ylo?: number; yhi?: number }): string {
  const xs = series.flatMap((s) => s.x).filter(Number.isFinite), ys = series.flatMap((s) => s.y).filter(Number.isFinite);
  const W = o.w - PAD.l - PAD.r, H = o.h - PAD.t - PAD.b;
  if (!xs.length || !ys.length) return `<rect x="${PAD.l}" y="${PAD.t}" width="${W}" height="${H}" class="pf-frame"/><text x="${PAD.l + W / 2}" y="${PAD.t + H / 2}" class="pf-na" text-anchor="middle">no data in the model window</text>`;
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = o.ylo ?? Math.min(...ys), y1 = o.yhi ?? Math.max(...ys);
  if (y1 - y0 < 1e-12) { y0 -= 0.5; y1 += 0.5; }
  const X = (x: number): number => PAD.l + ((x - x0) / (x1 - x0 || 1)) * W, Y = (y: number): number => PAD.t + H - ((y - y0) / (y1 - y0)) * H;
  let g = `<rect x="${PAD.l}" y="${PAD.t}" width="${W}" height="${H}" class="pf-frame"/>`;
  const tx = ticks(x0, x1), ty = ticks(y0, y1, 4);
  for (const t of tx.v) g += `<path d="M${X(t).toFixed(1)} ${PAD.t + H}v4" class="pf-tick"/><text x="${X(t).toFixed(1)}" y="${PAD.t + H + 15}" text-anchor="middle" class="pf-t">${tfmt(t, tx.d)}</text>`;
  for (const t of ty.v) g += `<path d="M${PAD.l - 4} ${Y(t).toFixed(1)}h4" class="pf-tick"/><path d="M${PAD.l} ${Y(t).toFixed(1)}h${W}" class="pf-grid"/><text x="${PAD.l - 7}" y="${(Y(t) + 3.5).toFixed(1)}" text-anchor="end" class="pf-t">${tfmt(t, ty.d)}</text>`;
  for (const s of series) {
    let d = "", pen = false;
    s.x.forEach((x, i) => { const y = s.y[i]; if (!Number.isFinite(y)) { pen = false; return; } d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.min(y1, Math.max(y0, y))).toFixed(1)}`; pen = true; });
    g += `<path d="${d}" class="${s.cls}"/>`;
  }
  if (o.x0 !== undefined && Number.isFinite(o.x0) && o.x0 >= x0 && o.x0 <= x1) g += `<path d="M${X(o.x0).toFixed(1)} ${PAD.t}V${PAD.t + H}" class="pf-cur"/>`;
  if (o.x0 !== undefined && o.y0 !== undefined && Number.isFinite(o.y0) && o.y0 >= y0 && o.y0 <= y1 && o.x0 >= x0 && o.x0 <= x1) g += `<rect x="${(X(o.x0) - 3).toFixed(1)}" y="${(Y(o.y0) - 3).toFixed(1)}" width="6" height="6" class="pf-pt" transform="rotate(45 ${X(o.x0).toFixed(1)} ${Y(o.y0).toFixed(1)})"/>`;
  g += `<text x="${PAD.l + W}" y="${o.h - 3}" text-anchor="end" class="pf-l">${o.xl}</text><text x="4" y="${PAD.t + 8}" class="pf-l" transform="rotate(-90 4 ${PAD.t + 8}) translate(${-H + 8} 6)">${o.yl}</text>`;
  return g;
}

export function tuningSVG(r: PmResult, o: PlotOpts): string {
  return linePlot([{ x: r.curve.x, y: r.curve.y, cls: "pf-line" }], { ...o, xl: r.curve.label, yl: "sinc²(ΔkL/2)", x0: r.curve.x0, y0: 1, ylo: 0, yhi: 1 });
}
export function periodSVG(r: PmResult, o: PlotOpts): string {
  const s = [{ x: r.tune.x, y: r.tune.y, cls: "pf-line" }];
  if (r.tune.y2) s.push({ x: r.tune.x, y: r.tune.y2, cls: "pf-line2" });
  return linePlot(s, { ...o, xl: r.tune.xl, yl: r.tune.yl, x0: r.tune.x0, y0: r.tune.y0 });
}

// ---------------- sliders: log mapping for wavelengths and length ----------------
export const LAM: readonly [number, number] = [0.4, 5.0];
export const lamFromSlider = (v: number): number => +(LAM[0] * (LAM[1] / LAM[0]) ** (v / 5000)).toFixed(4);
export const sliderFromLam = (l: number): number => Math.round((Math.log(l / LAM[0]) / Math.log(LAM[1] / LAM[0])) * 5000);
export const LEN: readonly [number, number] = [0.1, 50];
export const lenFromSlider = (v: number): number => +(LEN[0] * (LEN[1] / LEN[0]) ** (v / 1000)).toPrecision(3);
export const sliderFromLen = (l: number): number => Math.round((Math.log(l / LEN[0]) / Math.log(LEN[1] / LEN[0])) * 1000);
export const PROCS: readonly [Proc, string][] = [["shg", "SHG"], ["sfg", "SFG"], ["dfg", "DFG"], ["opo", "OPO"]];
