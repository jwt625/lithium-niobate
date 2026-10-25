// Phase-matching calculator, SHG/SFG/DFG (section 2.3 L2; OPO tuning is in 2.4). Eq. 2.12 with
// bulk CLN indices: periods (phasematching.qpmPeriod), d_eff/d33 for order m and duty D (qpmDeffFactor), type-I BPM angle
// (birefringentAngle "ooe", Zelmon 21 C) and e walk-off (crystaloptics.walkoffAngle); SHG acceptance FWHM in wavelength
// (shgWavelengthAcceptance) and temperature (shgTemperatureAcceptance, Jundt), tuning rate (shgQpmTuningRate), GVM.
// FWHM = 2 x 2.783 / (L |d Delta k / dq|) (full width; the manuscript's 2.783/(L |...|) is the half width).
// Period thermal expansion is not included (no expansion data paired with a Sellmeier set). Shared state s7.
// Detuned operation (SHG): a fixed grating Lambda_g = m Lambda_1(lambda_1, 40 C, Jundt) + offset, operated at T; the generated
// SH brightness follows sinc^2(Delta k L / 2) (d_eff / d_eff,max)^2 with Delta k from eq. 2.12 (deltaKQPM, Jundt n_e).
import { qpmPeriod, qpmPeriodSHG, qpmDeffFactor, birefringentAngle, shgWavelengthAcceptance, shgTemperatureAcceptance, deltaKQPM, sinc2, sumWavelength, differenceWavelength, acceptanceFWHM } from "$lib/physics/phasematching.ts";
import { gvm, groupIndexFn, shgQpmTuningRate } from "$lib/physics/nonlinear.ts";
import { walkoffAngle } from "$lib/physics/crystaloptics.ts";
import type { IndexFn } from "$lib/physics/sellmeier.ts";
import { Disposer, need, q, rafQueue } from "../dom.ts";
import { bindRange, bindSeg, logMap } from "./ctl.ts";
import { frame, axes, path, clip, ticks, c as r1p } from "./plot.ts";
import { FS } from "../fmt.ts";
import { nE, nO, nJ, safe, dash, fx, badge, roRows, hudRows, lightColor, r1 } from "./f23-common.ts";
import type { Part } from "../visual/lifecycle.ts";

export interface S7 { proc: "shg" | "sfg" | "dfg"; l1: number; l2: number; m: number; D: number; Lmm: number; T: number; model: "zel" | "jun"; dL: number; ax: "lam" | "T" | "per" }
export const S7_DEFAULT: S7 = { proc: "shg", l1: 1.55, l2: 1.064, m: 1, D: 0.5, Lmm: 10, T: 40, model: "zel", dL: 0, ax: "T" };
export const T_DESIGN = 40; // C, design temperature of the fixed grating (Jundt)
export const s7: S7 = { ...S7_DEFAULT };
const LMAP = logMap(0.1, 50, 1000);
export const TFLN_PERIOD = 4; // um, wang2018optica (reported, 1.5 um pump)

export interface PM {
  la: number; lb: number; l3: number; out: number; n: IndexFn; Tn: number | undefined;
  P1: number; Pm: number; Lc: number; deff: number; th: number; rho: number;
  fwL: number; fwT: number; tune: number; gvm: number; dng: number; PJ: number; shg: boolean;
  /** detuned operation: design and grating period (um), Delta k (rad/um), x = Delta k L / 2, sinc^2, relative SH, FWHM in Lambda (nm), FWHM in lambda (nm, Jundt at T) */
  Pd: number; Pg: number; dk: number; x: number; s2: number; rel: number; fwP: number; fwLJ: number;
}
export function pm7(s: S7): PM {
  const jun = s.model === "jun";
  const n: IndexFn = jun ? nJ : nE;
  const Tn = jun ? s.T : undefined;
  let la = s.l1, lb = s.l1, l3 = s.l1 / 2, out = l3;
  if (s.proc === "sfg") { la = s.l1; lb = s.l2; l3 = sumWavelength(la, lb); out = l3; }
  if (s.proc === "dfg") { la = s.l2; lb = s.l2 > s.l1 ? differenceWavelength(s.l1, s.l2) : Number.NaN; l3 = s.l1; out = lb; }
  const w = { n1: n, n2: n, n3: n };
  const P1 = safe(() => qpmPeriod(la, lb, w, 1, Tn));
  const th = safe(() => birefringentAngle("ooe", la, lb, nO, nE));
  const rho = safe(() => walkoffAngle(th, nO(l3), nE(l3)));
  const shg = s.proc === "shg";
  const PJ = shg ? safe(() => qpmPeriodSHG(s.l1, nJ, 1, s.T)) : Number.NaN;
  return {
    la, lb, l3, out, n, Tn, P1, Pm: P1 > 0 ? s.m * P1 : Number.NaN, Lc: P1 > 0 ? P1 / 2 : Number.NaN, deff: qpmDeffFactor(s.m, s.D), th, rho,
    fwL: shg ? safe(() => shgWavelengthAcceptance(s.l1, n, s.Lmm, Tn) * 1e3) : Number.NaN,
    fwT: shg ? safe(() => shgTemperatureAcceptance(s.l1, nJ, PJ, s.Lmm, s.T)) : Number.NaN,
    tune: shg ? safe(() => shgQpmTuningRate(s.l1, nJ, s.T)) : Number.NaN,
    gvm: shg ? safe(() => gvm(s.l1, nE, s.l1 / 2, nE)) : Number.NaN,
    dng: shg ? safe(() => groupIndexFn(nE, s.l1 / 2) - groupIndexFn(nE, s.l1)) : Number.NaN,
    PJ, shg, ...op7(s, shg),
  };
}
const WJ = { n1: nJ, n2: nJ, n3: nJ };
/** Detuned SHG operation of a fixed grating (Jundt n_e): Delta k at (lambda_1, T, Lambda_g). */
export const dk7 = (s: S7, lam: number, T: number, Pg: number): number => safe(() => deltaKQPM(lam, lam, WJ, Pg, s.m, T));
function op7(s: S7, shg: boolean): Pick<PM, "Pd" | "Pg" | "dk" | "x" | "s2" | "rel" | "fwP" | "fwLJ"> {
  const nan = Number.NaN;
  if (!shg) return { Pd: nan, Pg: nan, dk: nan, x: nan, s2: nan, rel: nan, fwP: nan, fwLJ: nan };
  const Pd = safe(() => s.m * qpmPeriodSHG(s.l1, nJ, 1, T_DESIGN)), Pg = Pd + s.dL * 1e-3;
  const dk = dk7(s, s.l1, s.T, Pg), x = (dk * s.Lmm * 1e3) / 2, s2 = safe(() => sinc2(x));
  const f = qpmDeffFactor(s.m, s.D) / qpmDeffFactor(1, 0.5);
  return {
    Pd, Pg, dk, x, s2, rel: s2 * f * f,
    fwP: safe(() => acceptanceFWHM((2 * Math.PI * s.m) / (Pg * Pg), s.Lmm * 1e3) * 1e3),
    fwLJ: safe(() => shgWavelengthAcceptance(s.l1, nJ, s.Lmm, s.T) * 1e3),
  };
}

const deg = (r: number): number => (r * 180) / Math.PI;
const fmtLam = (v: number): string => `${fx(v, 3, 5)} µm`;
const fmtL = (v: number): string => `${v.toPrecision(3).padStart(5, FS)} mm`;

function rows7(s: S7, p: PM): { t: [string, string, string][]; v: [string, string][] } {
  const dt = badge("derived", "f23-det"), dq = badge("derived", "f23-qpm"), db = badge("derived", "f23-bpm"), da = badge("derived", "f23-acc"), dj = badge("derived", "f23-jun");
  const outLab = s.proc === "shg" ? "λ<sub>SH</sub>" : s.proc === "sfg" ? "λ<sub>3</sub> = (1/λ<sub>1</sub> + 1/λ<sub>2</sub>)<sup>−1</sup>" : "idler (1/λ<sub>p</sub> − 1/λ<sub>s</sub>)<sup>−1</sup>";
  const thS = Number.isFinite(p.th) ? `${fx(deg(p.th), 2, 6)}°` : `${"none".padStart(6, FS)}${FS}`;
  const t: [string, string, string][] = [
    [outLab, fmtLam(p.out), dq],
    [`Λ, order m = ${s.m}`, `${fx(p.Pm, 3, 8)} µm`, s.model === "zel" ? dq : dj],
    ["L<sub>c</sub> = π/Δk", `${fx(p.Lc, 3, 8)} µm`, s.model === "zel" ? dq : dj],
    ["d<sub>eff</sub>/d<sub>33</sub> = 2 sin(mπD)/(mπ)", `${fx(p.deff, 4, 8)}${FS}${FS}${FS}`, badge("derived", "f23-deff")],
    ["θ<sub>pm</sub> type I (o + o → e)", thS, db],
    ["walk-off ρ of the e wave", Number.isFinite(p.rho) ? `${fx(deg(p.rho), 3, 6)}°` : `${dash(6)}${FS}`, db],
    ["FWHM in λ<sub>ω</sub> at L (SHG)", `${fx(p.fwL, 3, 8)} nm`, s.model === "zel" ? da : dj],
    ["FWHM in T at L (SHG, Jundt)", `${fx(p.fwT, 2, 8)} K${FS}`, dj],
    ["dλ<sub>ω</sub>/dT at fixed Λ (SHG, Jundt)", `${fx(p.tune, 4, 8)} nm/K`, dj],
    ["GVM 1/v<sub>g,2ω</sub> − 1/v<sub>g,ω</sub> (SHG)", `${fx(p.gvm, 1, 8)} fs/mm`, da],
    ["grating Λ<sub>g</sub> = mΛ(40 °C) + ΔΛ (SHG, Jundt)", `${fx(p.Pg, 4, 8)} µm`, dt],
    ["Δk at λ<sub>ω</sub>, T, Λ<sub>g</sub> (eq. 2.12)", `${fx(p.dk * 1e3, 3, 8)} rad/mm`, dt],
    ["ΔkL/2", `${fx(p.x, 3, 8)} rad`, dt],
    ["sinc²(ΔkL/2)", `${fx(p.s2, 4, 8)}${FS}${FS}${FS}`, dt],
    ["SH power / matched 1st order, D = 0.5", `${fx(p.rel, 4, 8)}${FS}${FS}${FS}`, dt],
    ["FWHM in Λ at L", `${fx(p.fwP, 2, 8)} nm`, dt],
  ];
  const v: [string, string][] = [
    ["Output wavelength", fmtLam(p.out)],
    [`Period Λ, order ${s.m}`, `${fx(p.Pm, 3, 8)} µm`],
    ["Coherence length", `${fx(p.Lc, 3, 8)} µm`],
    ["d<sub>eff</sub> / d<sub>33</sub>", fx(p.deff, 4, 8)],
    ["Type-I angle from c", thS],
    ["FWHM in wavelength", `${fx(p.fwL, 3, 8)} nm`],
    ["FWHM in temperature", `${fx(p.fwT, 2, 8)} K`],
    ["Tuning dλ/dT", `${fx(p.tune, 4, 8)} nm/K`],
    ["Group-velocity mismatch", `${fx(p.gvm, 1, 8)} fs/mm`],
    ["Grating Λ<sub>g</sub>", `${fx(p.Pg, 4, 8)} µm`],
    ["Δk", `${fx(p.dk * 1e3, 3, 8)} rad/mm`],
    ["ΔkL/2", `${fx(p.x, 3, 8)} rad`],
    ["sinc²(ΔkL/2)", fx(p.s2, 4, 8)],
    ["SH power / matched 1st order", fx(p.rel, 4, 8)],
    ["FWHM in Λ", `${fx(p.fwP, 2, 8)} nm`],
  ];
  return { t, v };
}

/** Domain sign pattern along z (1 um per character), period Lam, duty D. */
function strip(Lam: number, D: number, N: number): string {
  if (!(Lam > 0)) return " ".repeat(N);
  let o = "";
  for (let i = 0; i < N; i++) { const z = i + 0.5, f = z / Lam - Math.floor(z / Lam); o += f < D ? "+" : "-"; }
  return o;
}
/** SH beam as ASCII intensity (TECH): bar length follows the relative SH power. */
export function ascii7(s: S7, p: PM): string {
  const N = 40, sh = Math.round(s.l1 * 500);
  const bar = p.shg && Number.isFinite(p.rel) ? "#".repeat(Math.round(N * Math.min(1, p.rel))).padEnd(N, ".") : "-".repeat(N);
  return `bulk CLN, order ${s.m}, Λ ${fx(p.Pm, 3, 8).trim()} µm, D ${s.D.toFixed(2)}\n`
    + `|${strip(p.Pm, s.D, 50)}|\n`
    + `TFLN, Λ 4 µm reported (Wang et al. 2018, 1.5 µm pump)\n`
    + `|${strip(TFLN_PERIOD, 0.5, 50)}|\n`
    + ` 0         10        20        30        40        50 µm\n`
    + `SH ${p.shg ? `${sh} nm` : "--- nm"} |${bar}| ${p.shg ? fx(p.rel, 3, 5) : dash(5)}`;
}

/** sinc^2 curve of the fixed grating versus the selected parameter (wavelength, temperature, period offset). */
interface Curve { xs: Float64Array; ys: Float64Array; x0: number; y0: number; lab: string; unit: string; ok: boolean }
function curve7(s: S7, p: PM, n = 241): Curve {
  const xs = new Float64Array(n), ys = new Float64Array(n).fill(Number.NaN);
  const L = s.Lmm * 1e3;
  const sc = (dk: number): number => safe(() => sinc2((dk * L) / 2));
  if (!p.shg || !(p.Pg > 0)) return { xs, ys, x0: 0, y0: Number.NaN, lab: "", unit: "", ok: false };
  if (s.ax === "lam") {
    const sp = 3 * (Number.isFinite(p.fwLJ) ? p.fwLJ : 1);
    for (let i = 0; i < n; i++) { xs[i] = s.l1 * 1e3 - sp + (2 * sp * i) / (n - 1); ys[i] = sc(dk7(s, xs[i] * 1e-3, s.T, p.Pg)); }
    return { xs, ys, x0: s.l1 * 1e3, y0: p.s2, lab: "pump λ<tspan baseline-shift=\"sub\" font-size=\"0.75em\">ω</tspan> (nm)", unit: "nm", ok: true };
  }
  if (s.ax === "T") {
    const sp = Math.max(3 * (Number.isFinite(p.fwT) ? p.fwT : 2), Math.abs(s.T - T_DESIGN) * 1.25);
    const lo = Math.max(20, Math.min(s.T, T_DESIGN) - sp / 2), hi = Math.min(250, Math.max(s.T, T_DESIGN) + sp / 2);
    for (let i = 0; i < n; i++) { xs[i] = lo + ((hi - lo) * i) / (n - 1); ys[i] = sc(dk7(s, s.l1, xs[i], p.Pg)); }
    return { xs, ys, x0: s.T, y0: p.s2, lab: "T (°C), Jundt", unit: "°C", ok: true };
  }
  const sp = Math.max(3 * (Number.isFinite(p.fwP) ? p.fwP : 10), Math.abs(s.dL) * 1.25);
  for (let i = 0; i < n; i++) { xs[i] = -sp + (2 * sp * i) / (n - 1); ys[i] = sc(dk7(s, s.l1, s.T, p.Pd + xs[i] * 1e-3)); }
  return { xs, ys, x0: s.dL, y0: p.s2, lab: "period offset ΔΛ (nm)", unit: "nm", ok: true };
}

function accPlot(id: string, box: { w: number; h: number; l: number; r: number; t: number; b: number }, c: Curve, curveCls: string, fill: string, mk: { cls: string; r: number }): string {
  const d0 = c.ok ? c.xs[0] : -1, d1 = c.ok ? c.xs[c.xs.length - 1] : 1;
  const fr = frame(box, { d: [d0, d1] }, { d: [0, 1.08] });
  let o = `<defs>${clip(fr, id)}</defs>` + axes(fr, { xlab: c.lab, ylab: "sinc²(ΔkL/2)", yt: ticks(fr.y, 3).filter((t) => t.v <= 1), xTarget: 5 });
  if (!c.ok) return o + `<text class="tk" x="${r1p((box.l + box.w - box.r) / 2)}" y="${r1p((box.t + box.h - box.b) / 2)}" text-anchor="middle">SHG only</text>`;
  // area inside the FWHM (samples at or above one half: the main lobe only)
  let d = "", run: [number, number][] = [];
  const flush = (): void => { if (run.length > 1) d += `M${r1p(fr.x.f(run[0][0]))} ${r1p(fr.y.f(0))}` + run.map(([x, y]) => `L${r1p(fr.x.f(x))} ${r1p(fr.y.f(y))}`).join("") + `L${r1p(fr.x.f(run[run.length - 1][0]))} ${r1p(fr.y.f(0))}Z`; run = []; };
  for (let i = 0; i < c.xs.length; i++) { if (c.ys[i] >= 0.5) run.push([c.xs[i], c.ys[i]]); else flush(); }
  flush();
  if (d) o += fill ? `<path d="${d}" style="${fill}" clip-path="url(#${id})"/>` : `<path class="f23-band" d="${d}" clip-path="url(#${id})"/>`;
  o += `<line class="cur" x1="${r1p(fr.x.f(d0))}" x2="${r1p(fr.x.f(d1))}" y1="${r1p(fr.y.f(0.5))}" y2="${r1p(fr.y.f(0.5))}"/>`;
  o += `<path class="${curveCls}" d="${path(fr, c.xs, c.ys)}" clip-path="url(#${id})"/>`;
  // operating point
  const X = Math.min(box.w - box.r, Math.max(box.l, fr.x.f(c.x0)));
  o += `<line class="cur" x1="${r1p(X)}" x2="${r1p(X)}" y1="${r1p(fr.y.f(1.08))}" y2="${r1p(fr.y.f(0))}"/>`;
  if (Number.isFinite(c.y0)) o += `<rect class="${mk.cls}" x="${r1p(X - mk.r)}" y="${r1p(fr.y.f(c.y0) - mk.r)}" width="${2 * mk.r}" height="${2 * mk.r}" transform="rotate(45 ${r1p(X)} ${r1p(fr.y.f(c.y0))})"/>`;
  return o;
}

export function techPlots7(s: S7, p: PM): string {
  const c = curve7(s, p);
  return `<svg class="lp" viewBox="0 0 600 200" role="img" aria-label="SHG phase-matching curve of the fixed grating versus the selected parameter; marker at the operating point">${accPlot("f07-ca", { w: 600, h: 200, l: 50, r: 14, t: 22, b: 42 }, c, "s1", "", { cls: "mk", r: 4 })}</svg>`;
}

// ---------- VISUAL ----------
/** Domain strips in true CSS pixels, 2 px per um (CSS gradient), computed bulk period above the reported TFLN period. */
export function visualStrips7(s: S7, p: PM): string {
  const strip = (lab: string, sub: string, Lam: number, D: number): string =>
    `<div class="f23-strip"><div class="f23-magh"><b>${lab}</b><span>${sub}</span></div><div class="f23-stripbox">${Lam > 0 ? `<div class="f23-dom" style="--a:${(D * Lam * 2).toFixed(2)}px;--b:${(Lam * 2).toFixed(2)}px"></div>` : ""}</div></div>`;
  return strip(`Bulk CLN, order ${s.m}, computed`, Number.isFinite(p.Pm) ? `Λ = ${p.Pm.toFixed(3)} µm = ${(p.Pm * 2).toFixed(1)} px` : "no period in the model window", p.Pm, s.D)
    + strip("TFLN waveguide, reported", "Λ ≈ 4 µm at 1.5 µm pump = 8 px", TFLN_PERIOD, 0.5)
    + `<div class="f23-scale"><span class="bar"></span><span>50 µm at 2 px per µm</span></div>`;
}
export function visualStage7(s: S7, p: PM): string {
  const cin = lightColor(s.l1 * 1000), cin2 = lightColor(s.l2 * 1000), cout = lightColor(p.out * 1000);
  const nm = (l: number): string => (Number.isFinite(l) ? `${Math.round(l * 1000)} nm` : "–");
  let o = `<svg viewBox="0 0 1000 470" style="--f23-acc:${cout.c}" role="img" aria-label="Pump, crystal and generated light whose brightness follows the phase matching; phase-matching curve below with the operating point">`;
  const inLab = s.proc === "shg" ? `pump ${nm(s.l1)}` : s.proc === "sfg" ? `${nm(s.l1)} + ${nm(s.l2)}` : `pump ${nm(s.l1)}, signal ${nm(s.l2)}`;
  const y = 70;
  // pump (declared false color in the IR, always dashed)
  o += `<path class="${cin.ir ? "ir-el" : ""}" d="M30 ${y}h300" stroke="${cin.c}" stroke-width="5"${cin.ir ? ' stroke-dasharray="12 7"' : ""} fill="none"/><path class="${cin.ir ? "ir-el" : ""}" d="M330 ${y - 9}l14 9l-14 9z" fill="${cin.c}"/>`;
  if (s.proc !== "shg") o += `<path class="${cin2.ir ? "ir-el" : ""}" d="M30 ${y + 14}h300" stroke="${cin2.c}" stroke-width="3"${cin2.ir ? ' stroke-dasharray="12 7"' : ""} fill="none"/>`;
  o += `<text class="f23-t2" x="30" y="${y - 22}">${inLab}</text>`;
  // crystal with its grating
  o += `<defs><pattern id="v07-pp" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="6" height="10" fill="var(--v-ln)" fill-opacity="0.55"/></pattern></defs>`;
  o += `<rect x="360" y="${y - 26}" width="260" height="52" fill="var(--v-ln)" fill-opacity="0.16" stroke="var(--v-line2)"/><rect x="360" y="${y - 26}" width="260" height="52" fill="url(#v07-pp)"/>`;
  o += `<text class="f23-t3" x="490" y="${y + 50}" text-anchor="middle">L = ${fmtL(s.Lmm).trim()}${p.shg ? `, Λ<tspan baseline-shift="sub" font-size="0.75em">g</tspan> = ${fx(p.Pg, 3, 8).trim()} µm, T = ${fx(s.T, 1, 5).trim()} °C` : ""}</text>`;
  // generated light: brightness follows sinc^2 (SHG); other processes drawn at full strength
  const a = p.shg ? Math.max(0.03, Math.min(1, Number.isFinite(p.rel) ? p.rel : 0)) : 1;
  const dash = cout.ir ? ' stroke-dasharray="12 7"' : "";
  o += `<path class="${cout.ir ? "ir-el" : ""}" d="M640 ${y}h300" stroke="${cout.c}" stroke-opacity="${(0.3 * a).toFixed(3)}" stroke-width="26"${dash} fill="none"/>`;
  o += `<path class="${cout.ir ? "ir-el" : ""}" d="M640 ${y}h300" stroke="${cout.c}" stroke-opacity="${a.toFixed(3)}" stroke-width="8"${dash} fill="none"/><path class="${cout.ir ? "ir-el" : ""}" d="M940 ${y - 12}l18 12l-18 12z" fill="${cout.c}" fill-opacity="${a.toFixed(3)}"/>`;
  o += `<text class="f23-t2" x="960" y="${y - 22}" text-anchor="end">${s.proc === "dfg" ? "idler " : s.proc === "shg" ? "SH " : ""}${nm(p.out)}${p.shg ? `, sinc² ${fx(p.s2, 3, 5).trim()}` : ""}</text>`;
  const fill = cout.ir ? "fill:var(--v-text3);fill-opacity:0.18" : `fill:${cout.c};fill-opacity:0.35`;
  o += `<g class="lp">${accPlot("v07-acc", { w: 1000, h: 470, l: 110, r: 50, t: 160, b: 48 }, curve7(s, p), cout.ir ? "f23-acc ir ir-el" : "f23-acc", fill, { cls: "f23-op", r: 8 })}</g>`;
  o += "</svg>";
  return o;
}

// ---------- server defaults ----------
export function init7(): { ro: string; plots: string; ascii: string; strips: string; stage: string; hud: string } {
  const p = pm7(S7_DEFAULT), rw = rows7(S7_DEFAULT, p);
  return { ro: roRows(rw.t), plots: techPlots7(S7_DEFAULT, p), ascii: ascii7(S7_DEFAULT, p), strips: visualStrips7(S7_DEFAULT, p), stage: visualStage7(S7_DEFAULT, p), hud: hudRows(rw.v) };
}
const fmtDL = (v: number): string => `${v > 0 ? "+" : v < 0 ? "−" : FS}${Math.abs(v).toFixed(1).padStart(5, FS)} nm`;
export const fmt7 = { l1: fmtLam(S7_DEFAULT.l1), l2: fmtLam(S7_DEFAULT.l2), D: S7_DEFAULT.D.toFixed(2), L: fmtL(S7_DEFAULT.Lmm), T: `${fx(S7_DEFAULT.T, 1, 5)} °C`, dL: fmtDL(S7_DEFAULT.dL) };

/** Table of first-order bulk periods and acceptance values (server; manuscript 2.3 L2 tables, recomputed). */
export function tables7(): { qpm: [string, string, string][]; acc: { pump: string; fwL: string; fwT: string; tune: string; fwT245: string; fwT21: string }[]; gvm: string; dng: string; zhao5mm: string; bpm: { l: string; th: string; rho: string }[]; dn1064: string; jundt245: string } {
  const w = { n1: nE, n2: nE, n3: nE };
  const qpm: [string, string, string][] = [
    ["SHG 1064 → 532 nm", qpmPeriodSHG(1.064, nE).toFixed(3), (qpmPeriodSHG(1.064, nE) / 2).toFixed(3)],
    ["SHG 1550 → 775 nm (also degenerate OPO pumped at 775 nm)", qpmPeriodSHG(1.55, nE).toFixed(3), (qpmPeriodSHG(1.55, nE) / 2).toFixed(3)],
    ["SHG 2090 → 1045 nm", qpmPeriodSHG(2.09, nE).toFixed(2), (qpmPeriodSHG(2.09, nE) / 2).toFixed(2)],
    ["DFG / OPO: pump 1064, signal 1550, idler " + (differenceWavelength(1.064, 1.55) * 1000).toFixed(1) + " nm", qpmPeriod(1.55, differenceWavelength(1.064, 1.55), w).toFixed(2), (qpmPeriod(1.55, differenceWavelength(1.064, 1.55), w) / 2).toFixed(2)],
  ];
  const acc = [1.064, 1.55].map((l) => ({
    pump: `${Math.round(l * 1000)} nm`,
    fwL: (shgWavelengthAcceptance(l, nE, 10) * 1e3).toFixed(3),
    fwT: shgTemperatureAcceptance(l, nJ, qpmPeriodSHG(l, nJ, 1, 25), 10, 25).toFixed(2),
    fwT245: shgTemperatureAcceptance(l, nJ, qpmPeriodSHG(l, nJ, 1, 24.5), 10, 24.5).toFixed(2),
    fwT21: shgTemperatureAcceptance(l, nJ, qpmPeriodSHG(l, nJ, 1, 21), 10, 21).toFixed(2),
    tune: shgQpmTuningRate(l, nJ, 25).toFixed(3),
  }));
  const bpm = [1.55, 2.0].map((l) => { const th = birefringentAngle("ooe", l, l, nO, nE); return { l: `${Math.round(l * 1000)} nm`, th: deg(th).toFixed(2), rho: deg(walkoffAngle(th, nO(l / 2), nE(l / 2))).toFixed(3) }; });
  return {
    qpm, acc, bpm,
    gvm: gvm(1.55, nE, 0.775, nE).toFixed(0), dng: (groupIndexFn(nE, 0.775) - groupIndexFn(nE, 1.55)).toFixed(4),
    zhao5mm: (shgWavelengthAcceptance(1.55, nE, 5) * 1e3).toFixed(2),
    dn1064: (nE(0.532) - nO(1.064)).toExponential(2), jundt245: qpmPeriodSHG(1.55, nJ, 1, 24.5).toFixed(3),
  };
}

// ---------- mount ----------
export function mount7(root: HTMLElement, onVisual: (init: () => Part | null) => () => void): () => void {
  const dis = new Disposer();
  const syncs: (() => void)[] = [];
  let vis = false;
  const draw = (): void => {
    const p = pm7(s7), rw = rows7(s7, p);
    need(root, "#f07-ro").innerHTML = roRows(rw.t);
    need(root, "#f07-plots").innerHTML = techPlots7(s7, p);
    need(root, "#f07-ascii").textContent = ascii7(s7, p);
    if (vis) { need(root, "#v07-strips").innerHTML = visualStrips7(s7, p); need(root, "#v07-stage").innerHTML = visualStage7(s7, p); need(root, "#v07-hud").innerHTML = hudRows(rw.v); }
  };
  const queue = rafQueue(draw);
  const changed = (): void => { syncs.forEach((f) => f()); queue(); };
  const lam = (p: string, k: "l1" | "l2"): void => {
    syncs.push(bindRange(dis, q(root, `#${p}-${k}`), q(root, `#${p}-${k}-o`), { read: (x) => x, write: (v) => v, fmt: fmtLam, aria: (v) => `${v.toFixed(3)} micrometre`, get: () => s7[k], set: (v) => { s7[k] = v; } }, changed));
  };
  const bind = (p: string): void => {
    syncs.push(bindSeg(dis, q(root, `#${p}-proc`), () => s7.proc, (v) => { s7.proc = v as S7["proc"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-m`), () => String(s7.m), (v) => { s7.m = +v; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-model`), () => s7.model, (v) => { s7.model = v as S7["model"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-ax`), () => s7.ax, (v) => { s7.ax = v as S7["ax"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-pump`), () => (s7.proc === "shg" && (s7.l1 === 1.064 || s7.l1 === 1.55) ? String(s7.l1) : ""), (v) => { s7.l1 = +v; s7.proc = "shg"; }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-dl`), q(root, `#${p}-dl-o`), { read: (x) => x, write: (v) => v, fmt: fmtDL, aria: (v) => `period offset ${v.toFixed(1)} nanometre`, get: () => s7.dL, set: (v) => { s7.dL = v; } }, changed));
    lam(p, "l1"); lam(p, "l2");
    syncs.push(bindRange(dis, q(root, `#${p}-d`), q(root, `#${p}-d-o`), { read: (x) => x, write: (v) => v, fmt: (v) => v.toFixed(2), aria: (v) => `duty cycle ${v.toFixed(2)}`, get: () => s7.D, set: (v) => { s7.D = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-l`), q(root, `#${p}-l-o`), { read: LMAP.to, write: LMAP.from, fmt: fmtL, aria: (v) => `${v.toPrecision(3)} millimetre`, get: () => s7.Lmm, set: (v) => { s7.Lmm = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-t`), q(root, `#${p}-t-o`), { read: (x) => x, write: (v) => v, fmt: (v) => `${fx(v, 1, 5)} °C`, aria: (v) => `${v.toFixed(1)} degrees Celsius`, get: () => s7.T, set: (v) => { s7.T = v; } }, changed));
  };
  bind("f07");
  syncs.forEach((f) => f());
  const offV = onVisual(() => { bind("v07"); vis = true; syncs.forEach((f) => f()); draw(); return { repaint: () => { syncs.forEach((f) => f()); draw(); } }; });
  return () => { offV(); dis.run(); };
}
