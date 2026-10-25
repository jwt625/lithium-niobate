// F2-12 Kerr soliton comb (manuscript 2.5 L2/L3, eq. 2.17): pure part shared by the page server (default state), the
// browser (plots) and the worker (f25-lle.worker.ts). No DOM access.
// Physics: src/lib/physics/lle.ts (normalized LLE, Strang split-step on N points, homogeneous states, soliton ansatz,
// counting, spectrum, energy residual, normalization). Scan: laser detuning zeta swept linearly from Z0 to zeta1 at a
// fixed rate (per unit time 2/kappa), then held at zeta1. All parameters are template (figures.md F2-12: no data).
// Stepping is in fixed blocks of SUB steps (the first step of each block is the energy-balance diagnostic step), so the
// trajectory does not depend on how the worker splits the run into frames. No photorefractive or Raman term (none sourced).
import { lleCountSolitons, lleCreate, lleEnergyResidual, lleHomogeneous, lleHomogeneousField, lleMeans, lleNormalize, lleSolitonAnsatz, lleSpectrum, lleStep, lleTheta } from "../../physics/lle.ts";
import type { LLEState } from "../../physics/lle.ts";
import { gammaKerr } from "../../physics/nonlinear.ts";
import { C0 } from "../../physics/constants.ts";
import { axes, c, clip, frame, path, type Frame, type Tick } from "./plot.ts";

const MINUS = "−", FS = " ", DASH = "–";

// ---------- template parameters ----------
export const NMODES = 512;
export const Z0 = -2;
export const DT = 1e-3;
export const NOISE = 1e-3;
export const HOLD = 15;
export const TRACE_EVERY = 100;
export const SUB = 20;
export const RATES = [0.04, 0.08, 0.16] as const;
export const SEEDS = [1, 2, 3, 4] as const;

export interface LleCtl { f: number; d2: number; z1: number; rate: number; seed: number }
export const LLE0: Readonly<LleCtl> = { f: 3, d2: 0.3, z1: 10, rate: 0.08, seed: 1 };
export const LIM = { f: [1.5, 4.5], d2: [0.05, 1], z1: [2, 16] } as const;

/** Physical template ring for the printed conversion (figures.md F2-12); gamma from F2-11 (n2 DeSalvo 1996, A_eff 1 um^2). */
export const RING = { lam_um: 1.55, ng: 2.3, FSR_Hz: 200e9, Q: 2e6, etaC: 0.5, gamma: gammaKerr(9.33e-20, 1.55, 1) } as const;
const NORM1 = lleNormalize({ lam_um: RING.lam_um, ng: RING.ng, FSR_Hz: RING.FSR_Hz, Q: RING.Q, etaC: RING.etaC, D2_rad_per_s: 0, gamma_per_W_m: RING.gamma, Pin_W: 1 });
export const KAPPA = NORM1.kappa;
export const PIN_F1 = NORM1.Pin_f1_W;

// ---------- simulation (worker side) ----------
export type Phase = "ansatz" | "scan" | "hold" | "done" | "stopped";
export interface Sim { s: LLEState; ctl: LleCtl; zeta: number; phase: Phase; holdLeft: number; tz: number[]; tp: number[]; tn: number[]; nstep: number; since: number; resid: number }

export function simCreate(ctl: LleCtl): Sim {
  const rho = lleHomogeneous(Z0, ctl.f)[0];
  const s = lleCreate(NMODES, lleHomogeneousField(Z0, ctl.f, rho), NOISE, ctl.seed);
  return { s, ctl: { ...ctl }, zeta: Z0, phase: "scan", holdLeft: HOLD, tz: [], tp: [], tn: [], nstep: 0, since: 0, resid: Number.NaN };
}

/** Advance whole blocks of SUB steps until budgetMs of wall time is used or the scan is done. Per block: one energy-balance
 *  diagnostic step (lleEnergyResidual; residual kept in sim.resid) and SUB - 1 plain steps at the block's detuning, then
 *  the detuning advances by rate * SUB * DT. */
export function simAdvance(sim: Sim, budgetMs: number, now: () => number): number {
  const t0 = now();
  let n = 0;
  while (sim.phase === "scan" || sim.phase === "hold") {
    const p = { zeta: sim.zeta, f: sim.ctl.f, d2: sim.ctl.d2 };
    sim.resid = lleEnergyResidual(sim.s, p, DT);
    lleStep(sim.s, p, DT, SUB - 1);
    sim.nstep += SUB; n += SUB;
    const h = SUB * DT;
    if (sim.phase === "scan") {
      sim.zeta = Math.min(sim.ctl.z1, sim.zeta + sim.ctl.rate * h);
      sim.since += SUB;
      if (sim.since >= TRACE_EVERY) { sim.since -= TRACE_EVERY; sim.tz.push(sim.zeta); sim.tp.push(lleMeans(sim.s).power); sim.tn.push(lleCountSolitons(sim.s)); }
      if (sim.zeta >= sim.ctl.z1) sim.phase = "hold";
    } else {
      sim.holdLeft -= h;
      if (sim.holdLeft <= 0) sim.phase = "done";
    }
    if (now() - t0 >= budgetMs) break;
  }
  return n;
}

export interface LleFrame {
  phase: Phase; zeta: number; t: number; power: number; n: number; span: number; fit: number; resid: number;
  /** 10 log10 |psi_mu|^2, mu = -N/2 .. N/2-1 */
  db: Float32Array;
  /** |psi(theta_n)|^2 */
  w: Float32Array;
  /** new trace points since the previous frame */
  tz: Float32Array; tp: Float32Array; tn: Int16Array;
  ms: number;
}

export function frameOf(sim: Sim, from: number, ms: number): LleFrame {
  const sp = lleSpectrum(sim.s);
  const N = sim.s.N;
  const db = new Float32Array(N), w = new Float32Array(N);
  for (let j = 0; j < N; j++) db[j] = 10 * Math.log10(Math.max(sp.P[j], 1e-30));
  for (let k = 0; k < N; k++) w[k] = sim.s.re[k] ** 2 + sim.s.im[k] ** 2;
  const n = lleCountSolitons(sim.s);
  return {
    phase: sim.phase, zeta: sim.zeta, t: sim.s.t, power: lleMeans(sim.s).power, n, span: spanLines(sp.P), fit: n === 1 ? sech2Ratio(sp.mu, sp.P, sim.zeta, sim.ctl.d2) : Number.NaN, resid: sim.resid,
    db, w, tz: Float32Array.from(sim.tz.slice(from)), tp: Float32Array.from(sim.tp.slice(from)), tn: Int16Array.from(sim.tn.slice(from)), ms,
  };
}

/** Stationary state for the controls (default state, prerendered): single-soliton ansatz (Herr 2014) at zeta1, relaxed
 *  under eq. 2.17 for 3 time units; outside the soliton branch (sqrt(8 zeta1) > pi f) the lower homogeneous state. */
export function ansatzFrame(ctl: LleCtl = LLE0): LleFrame {
  const p = { zeta: ctl.z1, f: ctl.f, d2: ctl.d2 };
  let s: LLEState;
  try { s = lleSolitonAnsatz(NMODES, p); }
  catch { s = lleCreate(NMODES, lleHomogeneousField(p.zeta, p.f, lleHomogeneous(p.zeta, p.f)[0])); }
  lleStep(s, p, DT, 3000);
  const sim: Sim = { s, ctl: { ...ctl }, zeta: ctl.z1, phase: "ansatz", holdLeft: 0, tz: [], tp: [], tn: [], nstep: 3000, since: 0, resid: Number.NaN };
  sim.resid = lleEnergyResidual(s, p, DT);
  return frameOf(sim, 0, 0);
}

// ---------- analysis ----------
/** Number of modes within 40 dB of the strongest mode. */
export function spanLines(P: ArrayLike<number>): number {
  let mx = 0;
  for (let j = 0; j < P.length; j++) mx = Math.max(mx, P[j]);
  let n = 0;
  for (let j = 0; j < P.length; j++) if (P[j] >= mx * 1e-4) n++;
  return n;
}
/** Herr 2014 approximation: psi_sol = sqrt(2 zeta) sech(theta / w), w = sqrt(d2 / (2 zeta)); mode powers
 *  |psi_mu|^2 = (d2 / 4) sech^2(pi mu w / 2) (Fourier series of the sech; derived). */
export const herrW = (zeta: number, d2: number): number => Math.sqrt(d2 / (2 * zeta));
export const herrLine = (mu: number, zeta: number, d2: number): number => (d2 / 4) / Math.cosh((Math.PI * mu * herrW(zeta, d2)) / 2) ** 2;
/** Width from a least-squares line through ln |psi_mu|^2 on both wings (|mu| in [3, 25] / (pi w)), divided by the Herr width. */
export function sech2Ratio(mu: ArrayLike<number>, P: ArrayLike<number>, zeta: number, d2: number): number {
  if (!(zeta > 0)) return Number.NaN;
  const w = herrW(zeta, d2);
  const a = Math.ceil(3 / (Math.PI * w)), b = Math.floor(25 / (Math.PI * w));
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let j = 0; j < mu.length; j++) {
    const m = Math.abs(mu[j]);
    if (m < a || m > b || !(P[j] > 1e-28)) continue;
    const y = Math.log(P[j]);
    n++; sx += m; sy += y; sxx += m * m; sxy += m * y;
  }
  if (n < 6) return Number.NaN;
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return -slope / Math.PI / w;
}
/** Plateaus of the detuning scan: runs of equal soliton number (n >= 1) over >= 10 trace points with < 2% power spread. */
export function plateaus(tz: ArrayLike<number>, tp: ArrayLike<number>, tn: ArrayLike<number>): { z: number; p: number; n: number }[] {
  const out: { z: number; p: number; n: number }[] = [];
  let i = 0;
  while (i < tn.length) {
    let j = i;
    while (j + 1 < tn.length && tn[j + 1] === tn[i]) j++;
    const len = j - i + 1;
    if (tn[i] >= 1 && len >= 10) {
      let s = 0, s2 = 0;
      const a = i + Math.floor(len / 4), b = j - Math.floor(len / 4);
      for (let k = a; k <= b; k++) { s += tp[k]; s2 += tp[k] * tp[k]; }
      const m = s / (b - a + 1), sd = Math.sqrt(Math.max(0, s2 / (b - a + 1) - m * m));
      if (sd < 0.02 * m) out.push({ z: tz[Math.floor((i + j) / 2)], p: m, n: tn[i] });
    }
    i = j + 1;
  }
  return out;
}

// ---------- normalization table ----------
/** Physical values (template ring) that map to the current normalized (zeta, f, d2), and the forward check through
 *  lleNormalize. */
export function conversion(ctl: LleCtl, zeta: number): { Pin: number; D2: number; det: number; kappa2pi: number; tu: number; fwhm: number; back: { f: number; d2: number; zeta: number } } {
  const Pin = ctl.f * ctl.f * PIN_F1;
  const D2 = (ctl.d2 * KAPPA) / 2;
  const det = (zeta * KAPPA) / (4 * Math.PI);
  const nb = lleNormalize({ lam_um: RING.lam_um, ng: RING.ng, FSR_Hz: RING.FSR_Hz, Q: RING.Q, etaC: RING.etaC, D2_rad_per_s: D2, gamma_per_W_m: RING.gamma, Pin_W: Pin, detuning_Hz: det });
  const w = zeta > 0 ? herrW(zeta, ctl.d2) : Number.NaN;
  return { Pin, D2: D2 / (2 * Math.PI), det, kappa2pi: KAPPA / (2 * Math.PI), tu: 2 / KAPPA, fwhm: (2 * Math.acosh(Math.SQRT2) * w) / (2 * Math.PI * RING.FSR_Hz), back: { f: nb.f, d2: nb.d2, zeta: nb.zeta } };
}

// ---------- fixed-format strings ----------
const sg = (v: number, d: number, n: number): string => (Number.isFinite(v) ? ((v < 0 && Math.abs(v).toFixed(d) !== (0).toFixed(d) ? MINUS : "+") + Math.abs(v).toFixed(d)).padStart(n, FS) : DASH.repeat(n));
const fx = (v: number, d: number, n: number): string => (Number.isFinite(v) ? v.toFixed(d).padStart(n, FS) : DASH.repeat(n));
const zp = (v: number, n: number): string => String(Math.max(0, Math.min(10 ** n - 1, Math.round(v)))).padStart(n, FS);
export function sciU(v: number, d = 1): string {
  if (!Number.isFinite(v) || v <= 0) return DASH.repeat(d + 6);
  let e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  if (m.toFixed(d) === (10).toFixed(d)) { m /= 10; e++; }
  return `${m.toFixed(d)}e${e < 0 ? MINUS : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
}
const PHASE_TXT: Record<Phase, string> = { ansatz: "ansatz ", scan: "scan   ", hold: "hold   ", done: "done   ", stopped: "stopped" };

export interface LleRO { n: string; z: string; span: string; pw: string; t: string; fit: string; res: string; st: string }
export function lleRO(fr: LleFrame): LleRO {
  return {
    n: zp(fr.n, 2), z: sg(fr.zeta, 2, 6), span: `${zp(fr.span, 4)} lines`, pw: fx(fr.power, 3, 6), t: fx(fr.t, 1, 6),
    fit: fx(fr.fit, 3, 5), res: sciU(fr.resid, 1), st: PHASE_TXT[fr.phase],
  };
}
export interface ConvRO { pin: string; d2: string; det: string; fwhm: string; back: string; zmax: string }
export function convRO(ctl: LleCtl, zeta: number): ConvRO {
  const k = conversion(ctl, zeta);
  return {
    pin: `${fx(k.Pin * 1e3, 1, 6)} mW`, d2: `${fx(k.D2 / 1e6, 2, 6)} MHz`, det: `${sg(k.det / 1e6, 1, 7)} MHz`,
    zmax: fx((Math.PI * Math.PI * ctl.f * ctl.f) / 8, 2, 6),
    fwhm: `${fx(k.fwhm * 1e15, 0, 5)} fs`, back: `${sg(k.back.zeta, 2, 6)}  ${fx(k.back.f, 2, 4)}  ${fx(k.back.d2, 3, 5)}`,
  };
}
export const KAPPA_TXT = `${(KAPPA / (2 * Math.PI) / 1e6).toFixed(1)} MHz`;
export const TU_TXT = `${((2 / KAPPA) * 1e9).toFixed(2)} ns`;
export const PF1_TXT = `${(PIN_F1 * 1e3).toFixed(2)} mW`;
export const GAMMA_TXT = RING.gamma.toFixed(3);

// ---------- plots (TECH and the VISUAL staircase share these builders; classes from light.css .lp) ----------
const TB = { w: 520, h: 170, l: 56, r: 12, t: 20, b: 30 };
const VB = { w: 440, h: 280, l: 52, r: 14, t: 28, b: 40 };
const yTop = (f: number): number => Math.max(2, Math.ceil(f * f * 1.15));

export function tracePlot(ctl: LleCtl, tz: ArrayLike<number>, tp: ArrayLike<number>, tn: ArrayLike<number>, cur: number | null, big = false, id = "t25"): string {
  const fr = frame(big ? VB : TB, { d: [Z0, ctl.z1] }, { d: [0, yTop(ctl.f)] });
  let s = clip(fr, `${id}c`) + axes(fr, { xlab: "detuning ζ", ylab: "⟨|ψ|²⟩", xTarget: 6, yTarget: 4 });
  // homogeneous branches: stable (s5) and middle, unstable (s6)
  const M = 240, up: number[] = [], lo: number[] = [], mid: number[] = [], zs: number[] = [];
  for (let i = 0; i < M; i++) {
    const z = Z0 + ((ctl.z1 - Z0) * i) / (M - 1), r = lleHomogeneous(z, ctl.f);
    zs.push(z);
    if (r.length === 3) { lo.push(r[0]); mid.push(r[1]); up.push(r[2]); }
    else if (z < ctl.f * ctl.f) { up.push(r[0]); lo.push(Number.NaN); mid.push(Number.NaN); }
    else { lo.push(r[0]); up.push(Number.NaN); mid.push(Number.NaN); }
  }
  s += `<g clip-path="url(#${id}c)"><path class="s2" d="${path(fr, zs, up)}"/><path class="s2" d="${path(fr, zs, lo)}"/><path class="s6" d="${path(fr, zs, mid)}"/>`;
  const zmax = (Math.PI * Math.PI * ctl.f * ctl.f) / 8;
  for (const [z, lab] of [[Math.sqrt(3), "√3"], [zmax, "π²f²/8"]] as [number, string][]) {
    if (z <= Z0 || z >= ctl.z1) continue;
    const x = fr.x.f(z);
    s += `<line class="s6" x1="${c(x)}" x2="${c(x)}" y1="${c(fr.box.t)}" y2="${c(fr.box.h - fr.box.b)}"/><text class="tk" x="${c(x + 4)}" y="${c(fr.box.t + 12)}">${lab}</text>`;
  }
  if (tz.length > 1) s += `<path class="s1" d="${path(fr, tz, tp)}"/>`;
  if (cur !== null && Number.isFinite(cur)) { const x = fr.x.f(Math.min(ctl.z1, Math.max(Z0, cur))); s += `<line class="cur" x1="${c(x)}" x2="${c(x)}" y1="${c(fr.box.t)}" y2="${c(fr.box.h - fr.box.b)}"/>`; }
  for (const p of plateaus(tz, tp, tn)) s += `<text class="v" x="${c(fr.x.f(p.z))}" y="${c(Math.max(fr.box.t + 10, fr.y.f(p.p) - 6))}" text-anchor="middle">${p.n}</text>`;
  return s + "</g>";
}

const SPEC_MU = 128;
export function specPlot(ctl: LleCtl, fr: LleFrame, id = "s25"): string {
  const F = frame(TB, { d: [-SPEC_MU - 0.5, SPEC_MU + 0.5] }, { d: [-120, 0] });
  let s = clip(F, `${id}c`) + axes(F, { xlab: "mode μ", ylab: "|ψ<tspan dy=\"3\" font-size=\"0.75em\">μ</tspan><tspan dy=\"-3\">|² (dB)</tspan>", xt: [-128, -64, 0, 64, 128].map((v): Tick => ({ v, label: v < 0 ? MINUS + -v : String(v), major: true })), yTarget: 6 });
  const N = fr.db.length, y0 = F.box.h - F.box.b;
  let d = "", mx = -999;
  for (let j = 0; j < N; j++) mx = Math.max(mx, fr.db[j]);
  for (let j = 0; j < N; j++) {
    const mu = j - N / 2;
    if (mu < -SPEC_MU || mu > SPEC_MU || fr.db[j] <= -120) continue;
    d += `M${c(F.x.f(mu))} ${c(y0)}V${c(F.y.f(Math.min(0, fr.db[j])))}`;
  }
  s += `<g clip-path="url(#${id}c)"><path class="c25-stem" d="${d}"/>`;
  s += `<path class="s2" d="${herrPath(F, ctl, fr.zeta)}"/>`;
  if (mx > -80) { const y = F.y.f(mx - 40); s += `<line class="cur" x1="${c(F.box.l)}" x2="${c(F.box.w - F.box.r)}" y1="${c(y)}" y2="${c(y)}"/><text class="tk" x="${c(F.box.w - F.box.r - 4)}" y="${c(y - 4)}" text-anchor="end">−40 dB</text>`; }
  return s + "</g>";
}
function herrPath(F: Frame, ctl: LleCtl, zeta: number): string {
  if (!(zeta > 0)) return "";
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i <= 400; i++) { const mu = -SPEC_MU + (2 * SPEC_MU * i) / 400; xs.push(mu); ys.push(10 * Math.log10(herrLine(mu, zeta, ctl.d2))); }
  return path(F, xs, ys);
}

const WB = { w: 520, h: 150, l: 56, r: 12, t: 20, b: 30 };
export const yWave = (ctl: LleCtl): number => Math.ceil(2 * ctl.z1 + 6);
export function wavePlot(ctl: LleCtl, fr: LleFrame, id = "w25"): string {
  const F = frame(WB, { d: [-Math.PI, Math.PI] }, { d: [0, yWave(ctl)] });
  const xt: Tick[] = [[-Math.PI, `${MINUS}π`], [-Math.PI / 2, `${MINUS}π/2`], [0, "0"], [Math.PI / 2, "π/2"], [Math.PI, "π"]].map(([v, label]) => ({ v: v as number, label: label as string, major: true }));
  let s = clip(F, `${id}c`) + axes(F, { xlab: "θ (rad)", ylab: "|ψ(θ)|²", xt, yTarget: 4 });
  const N = fr.w.length, xs = new Float64Array(N + 1), ys = new Float64Array(N + 1);
  for (let k = 0; k < N; k++) { xs[k] = lleTheta(N, k); ys[k] = fr.w[k]; }
  xs[N] = Math.PI; ys[N] = fr.w[0];
  return s + `<g clip-path="url(#${id}c)"><path class="s1" d="${path(F, xs, ys)}"/></g>`;
}

// ---------- VISUAL: ring with circulating field, comb over the telecom band ----------
const RC = 200, R0 = 112;
export function ringSVG(ctl: LleCtl, fr: LleFrame | null, rotDeg: number): string {
  const ym = yWave(ctl), k = 74 / ym;
  let pol = "";
  if (fr) {
    const N = fr.w.length;
    for (let j = 0; j <= N; j++) {
      const kk = j % N, th = lleTheta(N, kk) - Math.PI / 2, r = R0 + 9 + k * Math.min(ym, fr.w[kk]);
      pol += `${j ? "L" : "M"}${c(RC + r * Math.cos(th))} ${c(RC + r * Math.sin(th))}`;
    }
    pol += "Z";
  }
  const rb = R0 + 9, ring0 = `M${RC + rb} ${RC}A${rb} ${rb} 0 1 0 ${RC - rb} ${RC}A${rb} ${rb} 0 1 0 ${RC + rb} ${RC}Z`;
  return `<circle class="c25-wg" cx="${RC}" cy="${RC}" r="${R0}"/><circle class="c25-base" cx="${RC}" cy="${RC}" r="${R0 + 9}"/>`
    + `<path class="c25-bus ir-el" d="M14 ${RC + R0 + 16}H386"/><path class="c25-arrow ir-el" d="M36 ${RC + R0 + 10}l10 6-10 6"/>`
    + `<g transform="rotate(${c(rotDeg)} ${RC} ${RC})"><path class="c25-polf ir-el" fill-rule="evenodd" d="${pol}${pol ? ring0 : ""}"/><path class="c25-pol ir-el" d="${pol}"/></g>`
    + `<text class="c25-lab" x="14" y="${RC + R0 + 40}">pump, 1550 nm</text><text class="c25-lab" x="${RC}" y="${RC + 5}" text-anchor="middle">ring</text>`;
}

const CBX = { l: 70, r: 980, t: 24, b: 236 };
const LAM0 = 1550, NU0 = C0 / (LAM0 * 1e-9);
const LX = (lam: number): number => CBX.l + ((lam - 1360) / (1800 - 1360)) * (CBX.r - CBX.l);
const DY = (db: number): number => CBX.b - ((Math.max(-80, Math.min(0, db)) + 80) / 80) * (CBX.b - CBX.t);
export function combSVG(ctl: LleCtl, fr: LleFrame | null): string {
  let s = "";
  for (const db of [0, -20, -40, -60, -80]) s += `<line class="c25-gl" x1="${CBX.l}" x2="${CBX.r}" y1="${c(DY(db))}" y2="${c(DY(db))}"/><text class="c25-tk" x="${CBX.l - 10}" y="${c(DY(db) + 5)}" text-anchor="end">${db < 0 ? MINUS + -db : db}</text>`;
  for (const lam of [1400, 1500, 1600, 1700, 1800]) s += `<line class="c25-ax" x1="${c(LX(lam))}" x2="${c(LX(lam))}" y1="${CBX.b}" y2="${CBX.b + 6}"/><text class="c25-tk" x="${c(LX(lam))}" y="${CBX.b + 26}" text-anchor="middle">${lam}</text>`;
  s += `<text class="c25-lab" x="${CBX.r}" y="${CBX.b + 56}" text-anchor="end">wavelength (nm), template FSR 200 GHz</text><text class="c25-lab" x="${CBX.l - 10}" y="14" text-anchor="end">dB</text>`;
  if (fr) {
    const N = fr.db.length;
    let d = "", pump = "";
    for (let j = 0; j < N; j++) {
      const mu = j - N / 2, db = fr.db[j];
      if (db <= -80) continue;
      const lam = (C0 / (NU0 + mu * RING.FSR_Hz)) * 1e9;
      if (lam < 1360 || lam > 1800) continue;
      const seg = `M${c(LX(lam))} ${CBX.b}V${c(DY(db))}`;
      if (mu === 0) pump = seg; else d += seg;
    }
    s += `<path class="c25-tooth ir-el" d="${d}"/><path class="c25-pump ir-el" d="${pump}"/>`;
    if (fr.zeta > 0) {
      let e = "";
      for (let i = 0; i <= 300; i++) {
        const mu = -128 + (256 * i) / 300, lam = (C0 / (NU0 + mu * RING.FSR_Hz)) * 1e9;
        e += `${i ? "L" : "M"}${c(LX(lam))} ${c(DY(10 * Math.log10(herrLine(mu, fr.zeta, ctl.d2))))}`;
      }
      s += `<path class="c25-env" d="${e}"/>`;
    }
  }
  return s;
}
