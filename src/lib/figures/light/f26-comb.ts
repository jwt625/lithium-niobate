// Resonant EO comb figure (chapter 2.6, content/chapters/02-light/figures.md). Model: eq. 2.18 steady state
// E(t) = t_c E_in / (1 - r exp(i beta cos(Omega t))), line powers by FFT (resonators.ts eoCombIntracavity); analytic
// envelope |c_k|^2 = exp(-2 a |k|) / (beta cosh a)^2, a = asinh(|ln r| / beta) (residue of eq. 2.18 at its complex-time
// pole; the power slope 20 log10(e) a = eoCombSlopeDB); dispersion expert view: ring.ts eoCombCMT (coupled-mode sideband
// equations, kappa_ex = -2 ln r / T_rt, kappa_0 = 0, k != 0 lines scaled by 1 / ((1 - r^2)(-2 ln r)) to the eq. 2.18 units).
// TECH: log-power stem plot + boxed readouts. VISUAL: ring with electrode and an organ rank of lines (1550 nm false color).
// One shared state (COMB) for both variants; strings are deterministic so the server renders the default state.
import { countLines, eoCombIntracavity, eoCombLineCountAsymptotic, eoCombSlopeDB, eoCombSlopeDBHighFinesse, finesseFromR, fitLineSlopeDB } from "$lib/physics/resonators.ts";
import { eoCombCMT } from "$lib/physics/ring.ts";
import { THzToUm, umToTHz } from "$lib/physics/units.ts";
import { FS, MINUS, fix, pad, sgn } from "../fmt.ts";
import { Disposer, fxOn, isVisual, need, onUi, q, qa, rafQueue } from "../dom.ts";
import { whenVisual, type Part } from "../visual/lifecycle.ts";
import { axes, c, clip, decadeLabel, frame, ticks, type Frame, type Tick } from "./plot.ts";
import { bindRange, bindSeg, logMap } from "./ctl.ts";

// ---------------------------------------------------------------- state
export type Win = "50" | "500" | "5000";
export type VWin = "100" | "1000" | "10000";
export interface CombState { vr: number; r: number; fsr: number; thr: number; d2s: number; win: Win; vwin: VWin }
/** Display defaults (template): V_p/V_pi,rt 0.1 (beta = 0.314 rad), r = 0.99 (F = 312.6), FSR 10 GHz, 60 dB threshold. */
export const COMB: CombState = { vr: 0.1, r: 0.99, fsr: 10, thr: 60, d2s: 0, win: "500", vwin: "1000" };
export const COMB_DEFAULT: Readonly<CombState> = { ...COMB };

/** Slider for 1 - r, log mapped 0.05 -> 0.002 (r 0.95 -> 0.998). */
export const R_MAP = logMap(0.05, 0.002, 1000);
/** D2/2pi slider: step 0 = 0, steps 1..60 log from 0.1 to 100 kHz. */
export const d2kHz = (s: number): number => (s <= 0 ? 0 : 0.1 * 1000 ** ((s - 1) / 59));
const LAM0_UM = 1.55;
const DB20 = 20 / Math.LN10;

// ---------------------------------------------------------------- model
export interface CombModel {
  beta: number; F: number; a: number; A: number; slope: number; slopeHF: number; ratio2: number; a2: number; A2: number;
  N: number; K: number; P: Float64Array; pmax: number; count: number; countAsym: number; fit: number; excessDB: number;
  spanTHz: number; spanNm: number; d2: number; Pc: Float64Array; countD2: number; parseval: number;
}

function envParams(r: number, beta: number): { a: number; A: number } {
  const a = Math.asinh(Math.abs(Math.log(r)) / beta);
  return { a, A: 1 / (beta * Math.cosh(a)) ** 2 };
}

export function combModel(st: CombState): CombModel {
  const beta = Math.PI * st.vr, r = st.r, F = finesseFromR(r);
  const slope = eoCombSlopeDB(r, beta), slopeHF = eoCombSlopeDBHighFinesse(beta, F);
  const { a, A } = envParams(r, beta), e2 = envParams(r, 2 * beta);
  // lines needed: down to the threshold (plus the near-pump excess) and down to the plot floor 1e-12
  const depth = Math.max(st.thr + 8, 10 * Math.log10(A / 1e-12) + 10);
  let K = Math.min(Math.max(Math.ceil(depth / slope) + 8, 64), 12000);
  let N = 4096;
  while (N < 4 * K && N < 65536) N *= 2;
  K = Math.min(K, N / 2 - 1);
  const cmb = eoCombIntracavity({ r, beta, N, K });
  const P = cmb.P;
  let pmax = 0;
  for (const v of P) pmax = Math.max(pmax, v);
  const count = countLines(P, st.thr);
  // numerical slope fit over lines 5..40 where the lines stay above the FFT round-off floor
  let kv = 0;
  for (let k = 1; k <= Math.min(40, K); k++) if (P[K + k] > pmax * 1e-25) kv = k;
  const fit = kv >= 10 ? fitLineSlopeDB(cmb.k, P, 5, kv) : Number.NaN;
  const spanTHz = ((count - 1) * st.fsr) / 1000, f0 = umToTHz(LAM0_UM), h = spanTHz / 2;
  const spanNm = h < f0 ? (THzToUm(f0 - h) - THzToUm(f0 + h)) * 1000 : Number.NaN;
  // coupled-mode view with dispersion (always computed; plotted when D2 > 0)
  const d2 = d2kHz(st.d2s), Trt = 1 / (st.fsr * 1e9), kex = (-2 * Math.log(r)) / Trt;
  const cm = eoCombCMT({ kappaEx_per_s: kex, kappa0_per_s: 0, beta, Trt_s: Trt, K, D2_rad_per_s: 2 * Math.PI * d2 * 1e3 });
  const sc = (1 - r * r) * (-2 * Math.log(r));
  const Pc = new Float64Array(2 * K + 1);
  const lim = pmax * 10 ** (-st.thr / 10);
  let countD2 = 1;
  for (let i = 0; i < Pc.length; i++) {
    if (i === K) { Pc[i] = Number.NaN; continue; }
    Pc[i] = cm.P[i] / sc;
    if (Pc[i] >= lim) countD2++;
  }
  return {
    beta, F, a, A, slope, slopeHF, ratio2: eoCombSlopeDB(r, 2 * beta) / slope, a2: e2.a, A2: e2.A, N, K, P, pmax, count,
    countAsym: eoCombLineCountAsymptotic(r, beta, st.thr), fit, excessDB: 10 * Math.log10(P[K] / A), spanTHz, spanNm, d2, Pc, countD2,
    parseval: Math.abs(cmb.totalLinePower / cmb.meanPower - 1),
  };
}

// ---------------------------------------------------------------- formats
const B = (cls: string, txt: string, pop?: string): string => `<span class="b ${cls}"${pop ? ` data-pop="${pop}" tabindex="0"` : ""}>${txt}</span>`;
export const BD = (pop = "f26-slope"): string => B("d", "derived", pop);
export const BT = B("t", "template", "f26-tpl");
const na = (n: number): string => `<span class="na">${pad("n/a", n)}</span>`;
const fx = (v: number, d: number, n: number): string => (Number.isFinite(v) ? pad(fix(v, d), n) : na(n));
const int = (v: number, n: number): string => pad(String(v), n);
const expo = (v: number): string => { if (v === 0) return pad("0", 7); const [m, e] = v.toExponential(1).split("e"); return pad(`${m}e${(+e < 0 ? MINUS : "+") + Math.abs(+e)}`, 7); };

export const fmtVr = (v: number): string => v.toFixed(3);
export const fmtR = (r: number): string => r.toFixed(4);
export const fmtFsr = (f: number): string => `${pad(f.toFixed(1), 4)} GHz`;
export const fmtThr = (t: number): string => `${pad(String(Math.round(t)), 2)} dB`;
export const fmtD2 = (s: number): string => `${pad(d2kHz(s).toFixed(1), 5)} kHz`;

export interface CtlOut { vr: string; r: string; fsr: string; thr: string; d2: string }
export const ctlOut = (st: CombState): CtlOut => ({ vr: fmtVr(st.vr), r: fmtR(st.r), fsr: fmtFsr(st.fsr), thr: fmtThr(st.thr), d2: fmtD2(st.d2s) });

type Row = [string, string, string];
const roTable = (rows: Row[]): string => `<colgroup><col><col class="cv"><col class="cs"></colgroup><tbody>${rows.map(([k, v, s]) => `<tr><td>${k}</td><td class="v">${v}</td><td class="s">${s}</td></tr>`).join("")}</tbody>`;

/** Value slot: 8-character number + unit field padded to 8 characters (fixed 16 ch, units aligned). */
const vu = (num: string, unit = ""): string => num + (unit ? ` ${unit}` : "").padEnd(8, FS);

/** TECH readout table. */
export function combRO(m: CombModel, st: CombState): string {
  const t = Math.round(st.thr);
  return roTable([
    ["finesse F", vu(fx(m.F, 1, 8)), BD("g:finesse")],
    ["&beta;", vu(fx(m.beta, 3, 8), "rad"), BD("f26-beta")],
    ["slope, asinh form", vu(fx(m.slope, 4, 8), "dB/line"), BD()],
    ["slope, FFT fit k 5&ndash;40", vu(fx(m.fit, 4, 8), "dB/line"), BD()],
    ["slope, 27.29 / (&beta;F)", vu(fx(m.slopeHF, 4, 8), "dB/line"), BD()],
    ["slope ratio 2V<sub>p</sub> : V<sub>p</sub>", vu(fx(m.ratio2, 4, 8)), BD()],
    ["pump line above envelope", vu(pad(sgn(m.excessDB, 2), 8), "dB"), BD("f26-env")],
    [`lines &ge; &minus;${t} dB re pump`, vu(int(m.count, 8)), BD("f26-count")],
    [`2&lfloor;${t} / slope&rfloor; + 1`, vu(int(m.countAsym, 8)), BD("f26-count")],
    [`lines &ge; &minus;${t} dB, CMT, D<sub>2</sub>`, vu(int(m.countD2, 8)), BD("f26-cmt")],
    ["span (lines &minus; 1) FSR", vu(fx(m.spanTHz, 2, 8), "THz"), BD()],
    ["span at 1550 nm", vu(fx(m.spanNm, 1, 8), "nm"), BD()],
  ]);
}

// ---------------------------------------------------------------- TECH plot
const BOX = { w: 640, h: 310, l: 58, r: 14, t: 26, b: 44 };
const YD: [number, number] = [1e-12, 1e6];
const WIN_N: Record<Win, number> = { "50": 50, "500": 500, "5000": 5000 };

/** Per-pixel-column maximum of line powers over k in [-W, W] (one stem per line when lines are wider than 3 px). */
function columns(fr: Frame, P: Float64Array, K: number, W: number, skip0 = false): [number, number][] {
  const out: [number, number][] = [];
  const perLine = (fr.box.w - fr.box.l - fr.box.r) / (2 * W) >= 3;
  if (perLine) {
    for (let k = -W; k <= W; k++) { if (skip0 && k === 0) continue; if (Math.abs(k) > K) continue; const v = P[K + k]; if (v > YD[0]) out.push([fr.x.f(k), v]); }
    return out;
  }
  const col = new Map<number, number>();
  for (let k = -Math.min(W, K); k <= Math.min(W, K); k++) {
    if (skip0 && k === 0) continue;
    const v = P[K + k];
    if (!(v > YD[0])) continue;
    const px = Math.round(fr.x.f(k));
    if (!(v <= (col.get(px) ?? 0))) col.set(px, v);
  }
  for (const [px, v] of [...col.entries()].sort((x, y) => x[0] - y[0])) out.push([px, v]);
  return out;
}

const envPath = (fr: Frame, A: number, a: number, W: number): string => {
  const y = (k: number): number => Math.max(A * Math.exp(-2 * a * Math.abs(k)), 1e-40);
  return `M${c(fr.x.f(-W))} ${c(fr.y.f(y(W)))}L${c(fr.x.f(0))} ${c(fr.y.f(A))}L${c(fr.x.f(W))} ${c(fr.y.f(y(W)))}`;
};

export function combPlotSVG(m: CombModel, st: CombState): string {
  const W = WIN_N[st.win];
  const fr = frame(BOX, { d: [-W, W] }, { kind: "log", d: YD });
  const xt = ticks(fr.x, 6, (v) => (v < 0 ? MINUS : "") + Math.abs(v));
  const yt: Tick[] = [];
  for (let e = -12; e <= 6; e++) yt.push({ v: 10 ** e, label: e % 3 === 0 ? decadeLabel(10 ** e) : "", major: e % 3 === 0 });
  let s = `<defs>${clip(fr, "c26-clip")}</defs>`;
  s += axes(fr, { xt, yt, xlab: "line index k", ylab: "|c<tspan baseline-shift=\"sub\" font-size=\"0.75em\">k</tspan>|² / |t<tspan baseline-shift=\"sub\" font-size=\"0.75em\">c</tspan>E<tspan baseline-shift=\"sub\" font-size=\"0.75em\">in</tspan>|²" });
  const y0 = c(fr.y.f(YD[0]));
  let st1 = "";
  for (const [px, v] of columns(fr, m.P, m.K, W)) st1 += `M${c(px)} ${y0}V${c(fr.y.f(Math.min(v, YD[1])))}`;
  s += `<g clip-path="url(#c26-clip)"><path class="s1 c26-st" d="${st1}"/>`;
  s += `<path class="s3" d="${envPath(fr, m.A2, m.a2, W)}"/>`;
  s += `<path class="s2" d="${envPath(fr, m.A, m.a, W)}"/>`;
  if (m.d2 > 0) {
    const pts = columns(fr, m.Pc, m.K, W, true);
    let d = "", prev = Number.NaN;
    for (const [px, v] of pts) { d += `${px - prev > 8 || (prev < fr.x.f(0) && px > fr.x.f(0)) || !d ? "M" : "L"}${c(px)} ${c(fr.y.f(v))}`; prev = px; }
    s += `<path class="s4" d="${d}"/>`;
  }
  const ythr = m.pmax * 10 ** (-st.thr / 10), py = fr.y.f(ythr);
  s += `<line class="cur" x1="${BOX.l}" x2="${BOX.w - BOX.r}" y1="${c(py)}" y2="${c(py)}"/></g>`;
  s += `<text class="tk" x="${BOX.w - BOX.r - 4}" y="${c(py - 4)}" text-anchor="end">${MINUS}${Math.round(st.thr)} dB re pump</text>`;
  return s;
}

// ---------------------------------------------------------------- VISUAL: ring with electrode, organ rank
const VW: Record<VWin, number> = { "100": 100, "1000": 1000, "10000": 10000 };
const RK = { w: 720, h: 400, l: 64, r: 40, t: 34, base: 330 };
const NP = 50; // pipes per side
const kLab = (kk: number): string => `${kk < 0 ? MINUS : kk > 0 ? "+" : ""}${Math.abs(kk)}`;

export function ringArtSVG(st: CombState): string {
  return `<svg viewBox="0 0 440 300" role="img" aria-label="Ring resonator with a phase-modulating electrode driven at the free spectral range; pump enters on the bus waveguide, the comb leaves on it">
  <path d="M220 52A88 88 0 0 1 300.9 104.6" fill="none" stroke="var(--v-au)" stroke-width="13" stroke-opacity="0.9"/>
  <path d="M220 52A88 88 0 0 0 139.1 104.6" fill="none" stroke="var(--v-au)" stroke-width="13" stroke-opacity="0.9"/>
  <path d="M220 24A116 116 0 0 1 330.3 104.2" fill="none" stroke="var(--v-au)" stroke-width="10" stroke-opacity="0.55"/>
  <path d="M220 24A116 116 0 0 0 109.7 104.2" fill="none" stroke="var(--v-au)" stroke-width="10" stroke-opacity="0.55"/>
  <circle cx="220" cy="140" r="102" fill="none" class="ir-el" stroke="var(--v-ir1550)" stroke-width="3.5" stroke-dasharray="9 5"/>
  <path class="ir-el" d="M14 252H426" fill="none" stroke="var(--v-ir1550)" stroke-width="3.5" stroke-dasharray="9 5"/>
  <line x1="220" y1="24" x2="220" y2="8" stroke="var(--v-au)" stroke-width="2"/>
  <text x="234" y="16" class="v26-m2">RF at FSR <tspan id="vc26-fsr-t">${st.fsr.toFixed(1)}</tspan> GHz</text>
  <text x="14" y="276" class="v26-m2">pump 1550 nm</text>
  <text x="426" y="276" class="v26-m2" text-anchor="end">comb out</text>
  <text x="220" y="146" class="v26-m3" text-anchor="middle">ring, r = <tspan id="vc26-r-t">${st.r.toFixed(4)}</tspan></text>
  <text x="220" y="166" class="v26-m3" text-anchor="middle">Au electrode over the top arc</text>
  </svg>`;
}

interface RankGeo { k: number[]; h: number[]; env: string; cmt: string; envPump: number; W: number; M: number }
function rankGeo(m: CombModel, st: CombState): RankGeo {
  const W = VW[st.vwin], M = W / NP, H = RK.base - RK.t, thr = st.thr;
  const hOf = (P: number): number => { const db = 10 * Math.log10(P / m.pmax); return Number.isFinite(db) ? Math.max(0, Math.min(1, 1 + db / thr)) * H : 0; };
  const k: number[] = [], h: number[] = [];
  for (let i = -NP; i <= NP; i++) { const kk = i * M; k.push(kk); h.push(Math.abs(kk) <= m.K ? hOf(m.P[m.K + kk]) : 0); }
  const X = (kk: number): number => RK.l + ((kk + W) / (2 * W)) * (RK.w - RK.l - RK.r);
  // analytic envelope in the same dB mapping (straight in dB); clipped at the baseline
  const yE = (kk: number): number => RK.base - Math.max(0, (1 + (10 * Math.log10(m.A / m.pmax) - DB20 * m.a * Math.abs(kk)) / thr) * H);
  const kz = Math.max(0, Math.min(W, (thr + 10 * Math.log10(m.A / m.pmax)) / (DB20 * m.a)));
  const env = `M${c(X(-kz))} ${c(yE(kz))}L${c(X(0))} ${c(yE(0))}L${c(X(kz))} ${c(yE(kz))}`;
  // coupled-mode lines with dispersion (pipe tops, k != 0), drawn when D2 > 0
  let cmt = "";
  if (m.d2 > 0) {
    for (const side of [-1, 1]) {
      let pen = false;
      for (let i = 1; i <= NP; i++) {
        const kk = side * i * M;
        if (Math.abs(kk) > m.K) break;
        const hh = hOf(m.Pc[m.K + kk]);
        cmt += `${pen ? "L" : "M"}${c(X(kk))} ${c(RK.base - hh)}`; pen = true;
        if (hh <= 0) break;
      }
    }
  }
  return { k, h, env, cmt, envPump: yE(0), W, M };
}

export function rankSVG(m: CombModel, st: CombState): string {
  const g = rankGeo(m, st), H = RK.base - RK.t;
  const X = (kk: number): number => RK.l + ((kk + g.W) / (2 * g.W)) * (RK.w - RK.l - RK.r);
  let pipes = "";
  g.k.forEach((kk, i) => { const x = c(X(kk)); pipes += `<line x1="${x}" x2="${x}" y1="${c(RK.base - g.h[i])}" y2="${RK.base}"/>`; });
  let ax = `<line x1="${RK.l}" x2="${RK.w - RK.r}" y1="${RK.base}" y2="${RK.base}" stroke="var(--v-line2)"/>`;
  for (const f of [0, 0.5, 1]) {
    const y = RK.base - (1 - f) * H;
    ax += `<line x1="${RK.l - 6}" x2="${RK.w - RK.r}" y1="${c(y)}" y2="${c(y)}" stroke="var(--v-line)" stroke-dasharray="${f === 1 ? "0" : "2 4"}"/>`;
  }
  const W = g.W;
  [-W, -W / 2, 0, W / 2, W].forEach((kk, i) => { ax += `<text x="${c(X(kk))}" y="${RK.base + 26}" text-anchor="middle" class="v26-m2" id="vc26-x${i}">${kLab(kk)}</text>`; });
  return `<svg viewBox="0 0 ${RK.w} ${RK.h}" role="img" aria-label="Comb lines as an organ rank: one pipe per drawn line, height = line power in dB above the counting threshold">
  ${ax}
  <text x="${RK.l - 10}" y="${RK.t + 5}" text-anchor="end" class="v26-m2">0</text>
  <text x="${RK.l - 10}" y="${c(RK.t + H / 2 + 5)}" text-anchor="end" class="v26-m2" id="vc26-mid">${MINUS}${Math.round(st.thr / 2)}</text>
  <text x="${RK.l - 10}" y="${RK.base + 5}" text-anchor="end" class="v26-m2" id="vc26-lo">${MINUS}${Math.round(st.thr)}</text>
  <text x="${RK.l}" y="${RK.t - 14}" class="v26-m2">dB re pump</text>
  <text x="${RK.w - RK.r}" y="${RK.h - 6}" text-anchor="end" class="v26-m2" id="vc26-every">line index k, every ${g.M}${g.M === 2 ? "nd" : "th"} line drawn</text>
  <g id="vc26-pipes" class="ir-el v26-pipes" stroke="var(--v-ir1550)" stroke-dasharray="7 3">${pipes}</g>
  <path id="vc26-env" d="${g.env}" fill="none" stroke="var(--v-text)" stroke-width="1.6" stroke-dasharray="2 4"/>
  <path id="vc26-cmt" d="${g.cmt}" fill="none" stroke="var(--v-au)" stroke-width="2" stroke-dasharray="10 4"/>
  </svg>`;
}

export interface CombHud { F: string; beta: string; slope: string; lines: string; span: string; ratio: string; fit: string; hf: string; excess: string; asym: string; cmt: string; spanT: string }
export function combHud(m: CombModel, st: CombState): CombHud {
  return {
    F: fx(m.F, 1, 7), beta: `${fx(m.beta, 3, 6)} rad`, slope: `${fx(m.slope, 4, 8)} dB/line`,
    lines: `${int(m.count, 6)} (${MINUS}${pad(String(Math.round(st.thr)), 2)} dB)`, span: `${fx(m.spanNm, 1, 7)} nm`, ratio: fx(m.ratio2, 4, 7),
    fit: `${fx(m.fit, 4, 8)} dB/line`, hf: `${fx(m.slopeHF, 4, 8)} dB/line`, excess: `${pad(sgn(m.excessDB, 2), 7)} dB`, asym: int(m.countAsym, 6),
    cmt: int(m.countD2, 6), spanT: `${fx(m.spanTHz, 2, 7)} THz`,
  };
}

// ---------------------------------------------------------------- server: default markup
export function combInit(): { plot: string; ro: string; out: CtlOut; ring: string; rank: string; hud: CombHud } {
  const st = { ...COMB_DEFAULT }, m = combModel(st);
  return { plot: combPlotSVG(m, st), ro: combRO(m, st), out: ctlOut(st), ring: ringArtSVG(st), rank: rankSVG(m, st), hud: combHud(m, st) };
}

/** Acceptance table (figures.md, resonant comb): analytic slope, numerical fit (lines 5..40), high-finesse form, Parseval. */
export function combChecks(): string {
  const cases: [number, number][] = [[0.99, 0.1], [0.995, 0.2], [0.998, 0.05], [0.99, 0.314]];
  let s = "";
  for (const [r, b] of cases) {
    const F = finesseFromR(r), sl = eoCombSlopeDB(r, b), hf = eoCombSlopeDBHighFinesse(b, F);
    const cm = eoCombIntracavity({ r, beta: b, N: 8192, K: 60 });
    const fit = fitLineSlopeDB(cm.k, cm.P, 5, 40), pv = Math.abs(cm.totalLinePower / cm.meanPower - 1);
    s += `<tr><td class="num">${r.toFixed(3)}</td><td class="num">${b.toFixed(3)}</td><td class="num">${F.toFixed(1)}</td><td class="num">${sl.toFixed(4)}</td><td class="num">${fit.toFixed(4)}</td><td class="num">${hf.toFixed(4)}</td><td class="num">${((hf / sl - 1) * 100).toFixed(2)}%</td><td class="num">${expo(pv).trim()}</td></tr>`;
  }
  return s;
}
/** Line count at the figures.md example state (r 0.99, beta 0.314, 60 dB) and its convergence in N. */
export function countFacts(): { n423: number; n431: number; excess: string; slope: string; NK: string } {
  const r = 0.99, b = 0.314;
  const counts = ([[4096, 600], [8192, 1000], [32768, 4000]] as const).map(([N, K]) => countLines(eoCombIntracavity({ r, beta: b, N, K }).P, 60));
  const cm = eoCombIntracavity({ r, beta: b, N: 8192, K: 1000 }), { A } = envParams(r, b);
  return {
    n423: counts[2], n431: eoCombLineCountAsymptotic(r, b, 60), excess: (10 * Math.log10(cm.P[1000] / A)).toFixed(2), slope: eoCombSlopeDB(r, b).toFixed(4),
    NK: counts.every((v) => v === counts[0]) ? "N = 4096 to 32768" : `varies: ${counts.join(", ")}`,
  };
}
/** D2 = 0 offset between the coupled-mode lines and eq. 2.18 (dB, max over 1 <= |k| <= 200). */
export function cmtOffset(): string {
  const st = { ...COMB_DEFAULT }, m = combModel(st);
  let mx = 0;
  for (let k = 1; k <= 200; k++) mx = Math.max(mx, Math.abs(10 * Math.log10(m.Pc[m.K + k] / m.P[m.K + k])));
  return mx.toFixed(2);
}

// ---------------------------------------------------------------- browser
export function mountComb(root: HTMLElement): () => void {
  const dis = new Disposer();
  const st = COMB;
  let model = combModel(st);
  const recompute = (): void => { model = combModel(st); };

  // ---------- TECH ----------
  const tech = q(root, "#c26");
  const techParts: (() => void)[] = [];
  let paintTech = (): void => {};
  if (tech) {
    const svg = need(tech, "#c26-svg"), ro = need(tech, "#c26-ro"), oVr = need(tech, "#c26-vr-o");
    paintTech = (): void => { svg.innerHTML = combPlotSVG(model, st); ro.innerHTML = combRO(model, st); };
    const sched = rafQueue(() => { recompute(); paintTech(); });
    techParts.push(
      bindRange(dis, q(tech, "#c26-vr"), oVr, { read: (s) => s, write: (v) => v, fmt: fmtVr, aria: (v) => `V_p over V_pi round trip ${v.toFixed(3)}, beta ${(Math.PI * v).toFixed(3)} radians`, get: () => st.vr, set: (v) => { st.vr = v; } }, sched),
      bindRange(dis, q(tech, "#c26-r"), q(tech, "#c26-r-o"), { read: (s) => 1 - R_MAP.to(s), write: (v) => R_MAP.from(1 - v), fmt: fmtR, aria: (v) => `round-trip amplitude transmission ${v.toFixed(4)}`, get: () => st.r, set: (v) => { st.r = v; } }, sched),
      bindRange(dis, q(tech, "#c26-fsr"), q(tech, "#c26-fsr-o"), { read: (s) => s, write: (v) => v, fmt: fmtFsr, aria: (v) => `${v.toFixed(1)} gigahertz`, get: () => st.fsr, set: (v) => { st.fsr = v; } }, sched),
      bindRange(dis, q(tech, "#c26-thr"), q(tech, "#c26-thr-o"), { read: (s) => s, write: (v) => v, fmt: fmtThr, aria: (v) => `${v} decibels below the pump line`, get: () => st.thr, set: (v) => { st.thr = v; } }, sched),
      bindRange(dis, q(tech, "#c26-d2"), q(tech, "#c26-d2-o"), { read: (s) => s, write: (v) => v, fmt: fmtD2, aria: (v) => `D2 over 2 pi ${d2kHz(v).toFixed(1)} kilohertz`, get: () => st.d2s, set: (v) => { st.d2s = v; } }, sched),
      bindSeg(dis, q(tech, "#c26-win"), () => st.win, (v) => { st.win = v as Win; }, () => paintTech()),
    );
    for (const b of qa<HTMLButtonElement>(tech, "#c26-x button")) dis.on(b, "click", () => {
      st.vr = Math.min(0.5, Math.max(0.01, Math.round((b.dataset.act === "x2" ? st.vr * 2 : st.vr / 2) * 1000) / 1000));
      techParts[0]();
      sched();
    });
  }
  const syncTech = (): void => { techParts.forEach((f) => f()); recompute(); paintTech(); };

  // ---------- VISUAL ----------
  const offVis = whenVisual((): Part | null => {
    const vis = q(root, "#vc26");
    if (!vis) return null;
    const ringBox = need(vis, "#vc26-ring"), rankBox = need(vis, "#vc26-rank");
    const hud: Record<keyof CombHud, HTMLElement> = {
      F: need(vis, "#vc26-F"), beta: need(vis, "#vc26-beta"), slope: need(vis, "#vc26-slope"), lines: need(vis, "#vc26-lines"), span: need(vis, "#vc26-span"), ratio: need(vis, "#vc26-ratio"),
      fit: need(vis, "#vc26-fit"), hf: need(vis, "#vc26-hf"), excess: need(vis, "#vc26-excess"), asym: need(vis, "#vc26-asym"), cmt: need(vis, "#vc26-cmt-n"), spanT: need(vis, "#vc26-spanT"),
    };
    let shown: number[] | null = null, anim = 0;
    const paintPipes = (target: number[]): void => {
      const lines = qa<SVGLineElement>(rankBox, "#vc26-pipes line");
      const set = (h: number[]): void => lines.forEach((ln, i) => ln.setAttribute("y1", c(RK.base - h[i])));
      cancelAnimationFrame(anim);
      if (!fxOn() || !shown || shown.length !== target.length) { set(target); shown = target; return; }
      const from = shown, t0 = performance.now();
      const step = (t: number): void => {
        const u = Math.min(1, (t - t0) / 240), e = 1 - (1 - u) ** 3;
        const h = target.map((v, i) => from[i] + (v - from[i]) * e);
        set(h); shown = h;
        if (u < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    const paint = (): void => {
      const g = rankGeo(model, st);
      if (!rankBox.querySelector("#vc26-pipes")) rankBox.innerHTML = rankSVG(model, st);
      paintPipes(g.h);
      need(rankBox, "#vc26-env").setAttribute("d", g.env);
      need(rankBox, "#vc26-cmt").setAttribute("d", g.cmt);
      need(rankBox, "#vc26-mid").textContent = `${MINUS}${Math.round(st.thr / 2)}`;
      need(rankBox, "#vc26-lo").textContent = `${MINUS}${Math.round(st.thr)}`;
      need(rankBox, "#vc26-every").textContent = `line index k, every ${g.M}${g.M === 2 ? "nd" : "th"} line drawn`;
      [-g.W, -g.W / 2, 0, g.W / 2, g.W].forEach((kk, i) => { need(rankBox, `#vc26-x${i}`).textContent = kLab(kk); });
      const t1 = q(ringBox, "#vc26-fsr-t"), t2 = q(ringBox, "#vc26-r-t");
      if (t1) t1.textContent = st.fsr.toFixed(1);
      if (t2) t2.textContent = st.r.toFixed(4);
      const h = combHud(model, st);
      for (const key of Object.keys(hud) as (keyof CombHud)[]) hud[key].innerHTML = h[key];
    };
    const vdis = new Disposer();
    const sched = rafQueue(() => { recompute(); paint(); });
    const parts = [
      bindRange(vdis, q(vis, "#vc26-vr"), q(vis, "#vc26-vr-o"), { read: (s) => s, write: (v) => v, fmt: fmtVr, aria: (v) => `V_p over V_pi round trip ${v.toFixed(3)}`, get: () => st.vr, set: (v) => { st.vr = v; } }, sched),
      bindRange(vdis, q(vis, "#vc26-r"), q(vis, "#vc26-r-o"), { read: (s) => 1 - R_MAP.to(s), write: (v) => R_MAP.from(1 - v), fmt: fmtR, aria: (v) => `round-trip amplitude transmission ${v.toFixed(4)}`, get: () => st.r, set: (v) => { st.r = v; } }, sched),
      bindRange(vdis, q(vis, "#vc26-fsr"), q(vis, "#vc26-fsr-o"), { read: (s) => s, write: (v) => v, fmt: fmtFsr, aria: (v) => `${v.toFixed(1)} gigahertz`, get: () => st.fsr, set: (v) => { st.fsr = v; } }, sched),
      bindRange(vdis, q(vis, "#vc26-thr"), q(vis, "#vc26-thr-o"), { read: (s) => s, write: (v) => v, fmt: fmtThr, aria: (v) => `${v} decibels below the pump line`, get: () => st.thr, set: (v) => { st.thr = v; } }, sched),
      bindRange(vdis, q(vis, "#vc26-d2"), q(vis, "#vc26-d2-o"), { read: (s) => s, write: (v) => v, fmt: fmtD2, aria: (v) => `D2 over 2 pi ${d2kHz(v).toFixed(1)} kilohertz`, get: () => st.d2s, set: (v) => { st.d2s = v; } }, sched),
      bindSeg(vdis, q(vis, "#vc26-win"), () => st.vwin, (v) => { st.vwin = v as VWin; }, () => paint()),
    ];
    for (const b of qa<HTMLButtonElement>(vis, "#vc26-x button")) vdis.on(b, "click", () => {
      st.vr = Math.min(0.5, Math.max(0.01, Math.round((b.dataset.act === "x2" ? st.vr * 2 : st.vr / 2) * 1000) / 1000));
      parts[0]();
      sched();
    });
    const repaint = (): void => { parts.forEach((f) => f()); recompute(); paint(); };
    repaint();
    return { repaint, dispose: () => { cancelAnimationFrame(anim); vdis.run(); } };
  });

  dis.add(onUi(() => { if (!isVisual()) syncTech(); }));
  if (!isVisual()) syncTech(); else techParts.forEach((f) => f());
  return () => { offVis(); dis.run(); };
}

/** L2 numerical check quoted in the text (r 0.99, beta 0.1): FFT fit over lines 5..40, asymptotic and high-finesse slopes. */
export function l2Check(): { fit: string; asym: string; hf: string } {
  const r = 0.99, b = 0.1, cm = eoCombIntracavity({ r, beta: b, N: 8192, K: 60 });
  return { fit: fitLineSlopeDB(cm.k, cm.P, 5, 40).toFixed(4), asym: eoCombSlopeDB(r, b).toFixed(4), hf: eoCombSlopeDBHighFinesse(b, finesseFromR(r)).toFixed(4) };
}
