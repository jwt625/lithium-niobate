// SHG growth along the crystal (section 2.3 L1). Coupled-mode equations (2.3 L3) integrated by RK4
// (coupledmode.shgRK4), undepleted eq. 2.13 (shgUndepleted) and the depleted tanh^2 law (shgDepleted) on one z grid.
// QPM uses the domain-averaged coupling: eta_QPM = eta_norm sin^2(pi D) (qpmDeffFactor ratio), Delta k = 0; unpoled uses
// the full d33, eta = eta_norm / (2/pi)^2, with the material mismatch Delta k = 2 pi / Lambda of the chosen grating.
// Inputs from the 2.3 measured table (reported) or bulk Zelmon indices (derived). Shared state s8 drives both variants.
import { shgRK4, shgUndepleted, shgDepleted } from "$lib/physics/coupledmode.ts";
import { qpmPeriodSHG, qpmDeffFactor } from "$lib/physics/phasematching.ts";
import { percentPerW } from "$lib/physics/nonlinear.ts";
import { Disposer, need, q, rafQueue } from "../dom.ts";
import { bindRange, bindSeg, logMap } from "./ctl.ts";
import { frame, axes, path, clip, ticks, decadeLabel, type Frame } from "./plot.ts";
import { FS } from "../fmt.ts";
import { nE, dash, fx, ex, badge, roRows, hudRows, r1, C775 } from "./f23-common.ts";
import type { Part } from "../visual/lifecycle.ts";

/** Measured normalized efficiencies selectable as eta_norm (manuscript 2.3 L2 table, all reported). */
export const ETA = [
  { v: 600, pop: "r:yamada1993", id: "yamada1993", who: "Yamada et al. 1993" },
  { v: 2600, pop: "r:wang2018optica", id: "wang2018optica", who: "Wang et al. 2018" },
  { v: 3757, pop: "r:zhao2020oe", id: "zhao2020oe", who: "Zhao et al. 2020" },
  { v: 4600, pop: "r:rao2019", id: "rao2019", who: "Rao et al. 2019" },
  { v: 9600, pop: "r:li2024apn", id: "li2024apn", who: "Li et al. 2024" },
] as const;
/** Bulk first-order period 1550 -> 775 nm (Zelmon CLN e, 21 C), derived; TFLN period 4 um (wang2018optica, reported). */
export const LAM_BULK = qpmPeriodSHG(1.55, nE);
export const GRAT = { bulk: LAM_BULK, tfln: 4 } as const;

export interface S8 { pol: "qpm" | "none"; grat: "bulk" | "tfln"; P: number; Lmm: number; eta: number; D: number; loss: number; log: boolean }
export const S8_DEFAULT: S8 = { pol: "qpm", grat: "bulk", P: 0.01, Lmm: 10, eta: 1, D: 0.5, loss: 0, log: false };
export const s8: S8 = { ...S8_DEFAULT };

const PMAP = logMap(1e-3, 10, 1000), LMAP = logMap(0.1, 50, 1000);
const NC = 300; // plot columns (min/max decimation)

interface Run {
  qpm: boolean; Lam: number; etaX: number; dk: number; L: number;
  z: Float64Array; P1: Float64Array; P2: Float64Array; und: Float64Array; th: Float64Array | null;
  mz: Float64Array; mP2: Float64Array; ml: number;
}

/** Integrate the current state (main run over [0, L], magnifier run over the first 450 um). */
export function run8(s: S8): Run {
  const qpm = s.pol === "qpm";
  const Lam = GRAT[s.grat];
  const eta = ETA[s.eta].v * 100; // %/(W cm^2) -> 1/(W m^2)
  const f = qpmDeffFactor(1, s.D) / qpmDeffFactor(1, 0.5);
  const etaX = qpm ? eta * f * f : eta / qpmDeffFactor(1, 0.5) ** 2;
  const dk = qpm ? 0 : (2 * Math.PI) / (Lam * 1e-6);
  const L = s.Lmm * 1e-3;
  const a = (s.loss * 100) / (10 / Math.LN10);
  const steps = qpm ? 400 : Math.min(150000, Math.max(800, Math.ceil((L / (Lam * 1e-6)) * 12)));
  const r = shgRK4({ eta: etaX, P0_W: s.P, L_m: L, dk_per_m: dk, alpha1_per_m: a, alpha2_per_m: a, steps });
  const und = new Float64Array(r.z.length);
  const th = qpm ? new Float64Array(r.z.length) : null;
  for (let i = 0; i < r.z.length; i++) {
    und[i] = shgUndepleted(etaX, s.P, r.z[i], dk);
    if (th) th[i] = shgDepleted(etaX, s.P, r.z[i]);
  }
  const ml = Math.min(L, 450e-6);
  const m = shgRK4({ eta: etaX, P0_W: s.P, L_m: ml, dk_per_m: dk, alpha1_per_m: a, alpha2_per_m: a, steps: 900 });
  return { qpm, Lam, etaX, dk, L, z: r.z, P1: r.P1, P2: r.P2, und, th, mz: m.z, mP2: m.P2, ml };
}

/** Min/max per column: arrays of alternating (x, min), (x, max) points; values clamped to lo. */
function decimate(z: Float64Array, y: Float64Array, L: number, sx: number, lo = -Infinity): { xs: number[]; ys: number[] } {
  const xs: number[] = [], ys: number[] = [];
  const n = z.length;
  if (n <= 3 * NC) { for (let k = 0; k < n; k++) { xs.push(z[k] * sx); ys.push(Math.max(lo, y[k])); } return { xs, ys }; }
  let i = 0;
  for (let c = 0; c < NC; c++) {
    const z1 = ((c + 1) / NC) * L;
    let mn = Infinity, mx = -Infinity;
    for (; i < n && (z[i] <= z1 || c === NC - 1); i++) { const v = y[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
    if (mx === -Infinity) continue;
    const x = (((c + 0.5) / NC) * L) * sx;
    xs.push(x, x); ys.push(Math.max(lo, mn), Math.max(lo, mx));
  }
  return { xs, ys };
}
const maxOf = (a: Float64Array): number => { let m = 0; for (const v of a) if (v > m) m = v; return m; };

/** Unit for a power axis: [scale, label]. */
function pUnit(p: number): [number, string] {
  if (p >= 1) return [1, "W"];
  if (p >= 1e-3) return [1e3, "mW"];
  if (p >= 1e-6) return [1e6, "µW"];
  if (p >= 1e-9) return [1e9, "nW"];
  return [1e12, "pW"];
}

/** P_2w(z) plot: numeric, undepleted, tanh^2 (QPM). Shared by TECH (box 560 x 250) and VISUAL (inside the stage). */
function plotP2(s: S8, r: Run, box: { w: number; h: number; l: number; r: number; t: number; b: number }, id: string, cls: [string, string, string], extra = ""): string {
  const um = s.Lmm < 1;
  const sx = um ? 1e6 : 1e3;
  const ymax = Math.max(maxOf(r.P2), 1e-30);
  let fr: Frame, yfmt: ((v: number) => string) | undefined, ylab: string, ys = 1;
  if (s.log) {
    const top = 10 ** Math.ceil(Math.log10(ymax * 1.05)), bot = top * 1e-6;
    fr = frame(box, { d: [0, r.L * sx] }, { kind: "log", d: [bot, top] });
    yfmt = decadeLabel; ylab = "P<tspan baseline-shift=\"sub\" font-size=\"0.75em\">2ω</tspan> (W)";
  } else {
    const [k, u] = pUnit(ymax);
    ys = k;
    fr = frame(box, { d: [0, r.L * sx] }, { d: [0, ymax * k * 1.12] });
    ylab = `P<tspan baseline-shift="sub" font-size="0.75em">2ω</tspan> (${u})`;
  }
  const lo = s.log ? fr.y.d[0] : -Infinity;
  const sc = (a: Float64Array): Float64Array => { if (ys === 1) return a; const o = new Float64Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * ys; return o; };
  const num = decimate(r.z, sc(r.P2), r.L, sx, lo), und = decimate(r.z, sc(r.und), r.L, sx, lo);
  const th = r.th ? decimate(r.z, sc(r.th), r.L, sx, lo) : null;
  const xt = ticks(fr.x, 5);
  let o = `<defs>${clip(fr, id)}</defs>` + axes(fr, { xt, yfmt, ylab, xlab: um ? "z (µm)" : "z (mm)", yTarget: 4 });
  o += `<g clip-path="url(#${id})">`;
  if (th) o += `<path class="${cls[2]}" d="${path(fr, th.xs, th.ys)}"/>`;
  o += `<path class="${cls[1]}" d="${path(fr, und.xs, und.ys)}"/>`;
  o += `<path class="${cls[0]}" d="${path(fr, num.xs, num.ys)}"/>`;
  o += `</g>${extra}`;
  return o;
}

// ---------- TECH ----------
export function techPlot8(s: S8, r: Run): string {
  return `<svg class="lp" viewBox="0 0 560 250" role="img" aria-label="Second-harmonic power along the crystal">${plotP2(s, r, { w: 560, h: 250, l: 60, r: 14, t: 24, b: 32 }, "f08-clip", ["s1", "s2", "s3"])}</svg>`;
}
const fmtP = (v: number): string => (v < 1 ? `${(v * 1e3).toPrecision(3).padStart(4, FS)} mW` : `${v.toPrecision(3).padStart(4, FS)} W${FS}`);
const fmtL = (v: number): string => `${v.toPrecision(3).padStart(5, FS)} mm`;

export function ascii8(s: S8): string {
  const N = 60, Lum = s.Lmm * 1e3, Lam = GRAT[s.grat];
  let row = "";
  for (let i = 0; i < N; i++) {
    if (s.pol === "none") { row += "+"; continue; }
    if (Lum / N > Lam / 4) { row += "±"; continue; }
    const z = ((i + 0.5) / N) * Lum, fr = z / Lam - Math.floor(z / Lam);
    row += fr < s.D ? "+" : "-";
  }
  const lab = `z = L = ${fmtL(s.Lmm).trim()}`;
  return `d(z) |${row}|\n     0${lab.padStart(N + 1, " ")}`;
}

function rows8(s: S8, r: Run): { t: [string, string, string][]; v: [string, string][] } {
  const N = r.z.length - 1, P2 = r.P2[N], P1 = r.P1[N];
  const und = shgUndepleted(r.etaX, s.P, r.L, r.dk);
  const f = qpmDeffFactor(1, s.D) / qpmDeffFactor(1, 0.5);
  const pw = r.qpm ? percentPerW(ETA[s.eta].v * f * f, s.Lmm / 10) : Number.NaN;
  const cons = s.loss === 0 ? Math.abs(P1 + P2 - s.P) / s.P : Number.NaN;
  const e = ETA[s.eta];
  const d = badge("derived", "f23-f08");
  const t: [string, string, string][] = [
    ["P<sub>2ω</sub>(L), RK4", `${ex(P2)} W`, d],
    ["P<sub>2ω</sub>(L) / P<sub>ω</sub>(0)", `${ex(P2 / s.P * 100)} %`, d],
    ["eq. 2.13, undepleted", `${ex(und)} W`, d],
    ["P<sub>ω</sub>(L) / P<sub>ω</sub>(0)", `${fx((P1 / s.P) * 100, 3, 7)} %`, d],
    ["η<sub>norm</sub> (input)", `${String(e.v).padStart(4, FS)} %/W/cm²`, badge("reported", e.pop)],
    ["η<sub>norm</sub> sin²(πD) L², QPM", r.qpm ? `${fx(pw, 1, 9)} %/W` : `${dash(9)} %/W`, d],
    ["L<sub>c</sub> = Λ/2 (unpoled)", `${fx(r.Lam / 2, 3, 7)} µm`, badge("derived", s.grat === "bulk" ? "f23-qpm" : "r:wang2018optica")],
    ["|P<sub>ω</sub> + P<sub>2ω</sub> − P<sub>0</sub>| / P<sub>0</sub>, lossless", s.loss === 0 ? ex(cons, 1) : dash(7), d],
  ];
  const v: [string, string][] = [
    ["Second harmonic at L, RK4", `${ex(P2)} W`],
    ["Converted P<sub>2ω</sub>/P<sub>ω</sub>(0)", `${ex(P2 / s.P * 100)} %`],
    ["Undepleted, eq. 2.13", `${ex(und)} W`],
    ["Pump remaining", `${fx((P1 / s.P) * 100, 3, 7)} %`],
    ["Measured η<sub>norm</sub> (input)", `${String(e.v).padStart(4, FS)} %/W/cm² ${badge("reported", e.pop)}`],
    ["Low-power efficiency, QPM", r.qpm ? `${fx(pw, 1, 9)} %/W` : `${dash(9)} %/W`],
    ["Coherence length L<sub>c</sub> (unpoled)", `${fx(r.Lam / 2, 3, 7)} µm`],
    ["Energy check, lossless", s.loss === 0 ? ex(cons, 1) : dash(7)],
  ];
  return { t, v };
}

// ---------- VISUAL ----------
const X0 = 50, XW = 900;
/** Glow gradient along z: per-column envelope of P_2w, normalized to its maximum in the view. */
function grad(id: string, zs: Float64Array, ys: Float64Array, L: number, n: number): string {
  const env = new Float64Array(n);
  let j = 0;
  for (let c = 0; c < n; c++) { const z1 = ((c + 1) / n) * L; let m = 0; for (; j < zs.length && (zs[j] <= z1 || c === n - 1); j++) if (ys[j] > m) m = ys[j]; env[c] = m; }
  const mx = Math.max(...env) || 1;
  let g = `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">`;
  for (let c = 0; c < n; c++) g += `<stop offset="${(c / (n - 1)).toFixed(3)}" stop-color="${C775}" stop-opacity="${(0.04 + 0.96 * Math.sqrt(env[c] / mx)).toFixed(2)}"/>`;
  return g + "</linearGradient>";
}
/** Magnifier: the first 450 um in true CSS pixels, 2 px per um (domains as a CSS gradient, glow as a 900 px SVG). */
export function visualMag8(s: S8, r: Run): string {
  const Lam = r.Lam, mpx = r.ml * 1e6 * 2;
  const dom = s.pol === "qpm"
    ? `<div class="f23-dom" style="width:${r1(mpx)}px;--a:${(s.D * Lam * 2).toFixed(2)}px;--b:${(Lam * 2).toFixed(2)}px"></div>`
    : `<div class="f23-dom one" style="width:${r1(mpx)}px"></div>`;
  return `<div class="f23-magh"><span>from z = 0 at 2 px per µm</span><span>${s.pol === "qpm" ? `Λ = ${Lam.toFixed(3)} µm, D = ${s.D.toFixed(2)}` : "single domain"}</span></div>`
    + `<div class="f23-magbox">${dom}<svg width="900" height="56" aria-hidden="true"><defs>${grad("f08-gm", r.mz, r.mP2, r.ml, 120)}</defs><rect width="${r1(mpx)}" height="56" fill="url(#f08-gm)"/></svg></div>`
    + `<div class="f23-scale"><span class="bar"></span><span>50 µm</span></div>`;
}
export function visualStage8(s: S8, r: Run): string {
  const Lam = r.Lam;
  let o = `<svg viewBox="0 0 1000 480" style="--f23-sh:${C775}" role="img" aria-label="Waveguide drawn along z with poled domains, the 1550 nm pump and the 775 nm second harmonic; power along z below">`;
  o += `<defs>${grad("f08-gs", r.z, r.P2, r.L, 90)}</defs>`;
  // whole guide [0, L]
  const y0 = 16, h = 64, pxPer = XW / (r.L * 1e6);
  o += `<rect x="${X0}" y="${y0}" width="${XW}" height="${h}" fill="var(--v-ln)" fill-opacity="0.16"/>`;
  if (s.pol === "qpm" && Lam * pxPer >= 3) {
    let d = "";
    for (let z0 = 0; z0 < r.L * 1e6; z0 += Lam) d += `M${r1(X0 + z0 * pxPer)} ${y0}h${r1(s.D * Lam * pxPer)}v${h}h${r1(-s.D * Lam * pxPer)}z`;
    o += `<path d="${d}" fill="var(--v-ln)" fill-opacity="0.42"/>`;
  } else o += `<rect x="${X0}" y="${y0}" width="${XW}" height="${h}" fill="var(--v-ln)" fill-opacity="${s.pol === "qpm" ? "0.30" : "0.26"}"/>`;
  o += `<rect x="${X0}" y="${y0}" width="${XW}" height="${h}" fill="url(#f08-gs)"/>`;
  // pump: dashed false color, width follows P_w(z)/P_w(0)
  const N = r.z.length - 1;
  let pump = "";
  for (let c = 0; c < 36; c++) {
    const i = Math.min(N, Math.round(((c + 0.5) / 36) * N)), w = 1 + 7 * Math.max(0, r.P1[i] / s.P);
    pump += `<path d="M${r1(X0 + (c / 36) * XW)} ${y0 + h / 2}h${r1(XW / 36)}" stroke-width="${w.toFixed(2)}"/>`;
  }
  o += `<g class="ir-el" stroke="var(--v-ir1550)" stroke-dasharray="10 6" fill="none">${pump}</g>`;
  o += `<text class="f23-t2" x="${X0}" y="${y0 + h + 24}">0</text><text class="f23-t2" x="${X0 + XW}" y="${y0 + h + 24}" text-anchor="end">L = ${fmtL(s.Lmm).trim()}</text>`;
  o += `<text class="f23-t3" x="${X0 + XW / 2}" y="${y0 + h + 24}" text-anchor="middle">${s.pol === "qpm" && Lam * pxPer < 3 ? `${Math.round((r.L * 1e6) / Lam)} periods, finer than the drawing` : FS}</text>`;
  o += `<g class="lp">${plotP2(s, r, { w: 1000, h: 480, l: 110, r: 50, t: 150, b: 40 }, "f08-vclip", ["f23-sh", "s2", "s6"])}</g>`;
  o += "</svg>";
  return o;
}

// ---------- server defaults ----------
export function init8(): { plot: string; ascii: string; ro: string; mag: string; stage: string; hud: string } {
  const r = run8(S8_DEFAULT), rw = rows8(S8_DEFAULT, r);
  return { plot: techPlot8(S8_DEFAULT, r), ascii: ascii8(S8_DEFAULT), ro: roRows(rw.t), mag: visualMag8(S8_DEFAULT, r), stage: visualStage8(S8_DEFAULT, r), hud: hudRows(rw.v) };
}
export const fmt8 = { P: fmtP(S8_DEFAULT.P), L: fmtL(S8_DEFAULT.Lmm), D: S8_DEFAULT.D.toFixed(2), loss: `${S8_DEFAULT.loss.toFixed(2)} dB/cm` };

// ---------- mount ----------
/** Bind both variants (TECH ids f08-*, VISUAL ids v08-*); VISUAL controls bound on first VISUAL display. */
export function mount8(root: HTMLElement, onVisual: (init: () => Part | null) => () => void): () => void {
  const dis = new Disposer();
  const syncs: (() => void)[] = [];
  let vis = false;
  const draw = (): void => {
    const r = run8(s8), rw = rows8(s8, r);
    need(root, "#f08-plot").innerHTML = techPlot8(s8, r);
    need(root, "#f08-ascii").textContent = ascii8(s8);
    need(root, "#f08-ro").innerHTML = roRows(rw.t);
    if (vis) { need(root, "#v08-mag").innerHTML = visualMag8(s8, r); need(root, "#v08-stage").innerHTML = visualStage8(s8, r); need(root, "#v08-hud").innerHTML = hudRows(rw.v); }
  };
  const queue = rafQueue(draw);
  const changed = (): void => { syncs.forEach((f) => f()); queue(); };
  const bind = (p: string): void => {
    syncs.push(bindSeg(dis, q(root, `#${p}-pol`), () => s8.pol, (v) => { s8.pol = v as S8["pol"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-grat`), () => s8.grat, (v) => { s8.grat = v as S8["grat"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-eta`), () => String(s8.eta), (v) => { s8.eta = +v; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-ax`), () => (s8.log ? "log" : "lin"), (v) => { s8.log = v === "log"; }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-p`), q(root, `#${p}-p-o`), { read: PMAP.to, write: PMAP.from, fmt: fmtP, aria: (v) => `${(v * 1e3).toPrecision(3)} milliwatt`, get: () => s8.P, set: (v) => { s8.P = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-l`), q(root, `#${p}-l-o`), { read: LMAP.to, write: LMAP.from, fmt: fmtL, aria: (v) => `${v.toPrecision(3)} millimetre`, get: () => s8.Lmm, set: (v) => { s8.Lmm = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-d`), q(root, `#${p}-d-o`), { read: (x) => x, write: (v) => v, fmt: (v) => v.toFixed(2), aria: (v) => `duty cycle ${v.toFixed(2)}`, get: () => s8.D, set: (v) => { s8.D = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-a`), q(root, `#${p}-a-o`), { read: (x) => x, write: (v) => v, fmt: (v) => `${v.toFixed(2)} dB/cm`, aria: (v) => `${v.toFixed(2)} decibel per centimetre`, get: () => s8.loss, set: (v) => { s8.loss = v; } }, changed));
  };
  bind("f08");
  syncs.forEach((f) => f());
  const offV = onVisual(() => { bind("v08"); vis = true; syncs.forEach((f) => f()); draw(); return { repaint: () => { syncs.forEach((f) => f()); draw(); } }; });
  return () => { offV(); dis.run(); };
}
