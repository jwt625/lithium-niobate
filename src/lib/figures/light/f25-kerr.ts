// F2-11 Kerr vs cascaded chi(2) (manuscript 2.5 L1/L2, eq. 2.16). Physics: src/lib/physics/nonlinear.ts (gammaKerr,
// cascadedPhase, gammaCascaded, cascadedShFraction, cascadedRK4 = RK4 of the coupled equations of 2.3 L3).
// Phases in the Kerr-sign convention (positive = index increase); arg(A_w) = -Delta phi_NL in the A exp(i(wt - kz)) field
// convention. Axes: symlog (sign(v) log10(1 + |v|/c)), so the odd 1/Delta k curve shows both signs.
// Design point (manuscript): eta_norm 2.6e5 /(W m^2) (= 2600 %/W/cm^2, wang2018optica, reported), P 0.1 W, L 1 cm,
// Delta k = 2 pi / 100 um (template), A_eff 1 um^2 (template), n2 9.33e-20 m^2/W at 1064 nm (desalvo1996, P-db).
import { cascadedPhase, cascadedRK4, cascadedShFraction, gammaCascaded, gammaKerr } from "../../physics/nonlinear.ts";
import { axes, c, clip, frame, type Frame, type Tick } from "./plot.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import { Disposer, isVisual, onUi, q, qa, rafQueue } from "../dom.ts";

const MINUS = "−", FS = " ", DASH = "–";

export type N2Key = "desalvo" | "zhu";
export const N2: Record<N2Key, number> = { desalvo: 9.33e-20, zhu: 1.8e-19 };
export interface KerrState { dk: number; P: number; L: number; eta: number; aeff: number; n2: N2Key }
export const KERR0: Readonly<KerrState> = { dk: (2 * Math.PI) / 100e-6, P: 0.1, L: 0.01, eta: 2.6e5, aeff: 1, n2: "desalvo" };
export const kerrState: KerrState = { ...KERR0 };
export const LAM_UM = 1.55;

// ---------- symlog maps ----------
const CX = 10, CY = 1e-6;
export const symlog = (v: number, k: number): number => Math.sign(v) * Math.log10(1 + Math.abs(v) / k);
export const symexp = (t: number, k: number): number => Math.sign(t) * k * (10 ** Math.abs(t) - 1);
export const TX = symlog(1e6, CX), TY = symlog(10, CY);
/** Continuous log map for a range input with step="any": slider s in [0, N] <-> value in [lo, hi]. */
export const lmap = (lo: number, hi: number, N = 1000) => ({ to: (s: number): number => lo * (hi / lo) ** (s / N), from: (v: number): number => (Math.log(v / lo) / Math.log(hi / lo)) * N, N });
export const MAP = { P: lmap(1e-3, 1), L: lmap(1e-3, 0.02), eta: lmap(1e3, 1e6), aeff: lmap(0.3, 10) };

// ---------- model ----------
export interface KerrOut { gK: number; phiK: number; phiC: number; gC: number; ratio: number; net: number; shAvg: number; shPk: number; dkL: number; beat_um: number }
export function kerrClosed(s: KerrState): KerrOut {
  const gK = gammaKerr(N2[s.n2], LAM_UM, s.aeff), phiK = gK * s.P * s.L;
  const ok = s.dk !== 0;
  const phiC = ok ? cascadedPhase(s.eta, s.P, s.L, s.dk) : Number.NaN;
  const x = s.dk * s.L;
  // z-average over [0, L] of the undepleted SH fraction 4 eta P sin^2(dk z / 2) / dk^2 (exact integral)
  const shAvg = ok ? ((2 * s.eta * s.P) / s.dk ** 2) * (1 - Math.sin(x) / x) : Number.NaN;
  const shPk = ok ? cascadedShFraction(s.eta, s.P, s.dk, Math.min(s.L, Math.PI / Math.abs(s.dk))) : Number.NaN;
  return { gK, phiK, phiC, gC: ok ? gammaCascaded(s.eta, s.dk) : Number.NaN, ratio: phiC / phiK, net: phiC + phiK, shAvg, shPk, dkL: Math.abs(x), beat_um: ok ? ((2 * Math.PI) / Math.abs(s.dk)) * 1e6 : Number.NaN };
}
/** RK4 step count: 40 steps per beat period 2 pi/|dk| and per coupling length 1/sqrt(eta P), at least 4000, at most 40000. */
export const rk4Steps = (s: { dk: number; L: number; eta: number; P: number }): number =>
  Math.min(40000, Math.max(4000, Math.ceil((40 * Math.abs(s.dk) * s.L) / (2 * Math.PI)), Math.ceil(40 * Math.sqrt(s.eta * s.P) * s.L)));
export const kerrRK4 = (s: KerrState): number => cascadedRK4({ eta: s.eta, P_W: s.P, L_m: s.L, dk_per_m: s.dk, steps: rk4Steps(s) }).dPhiNL;
/** RK4 points where eq. 2.16 fails or is marginal: symlog grid of Delta k with |Delta k| L <= 1000, including 0. */
export function rk4Points(s: KerrState): { T: number[]; phi: number[] } {
  const T: number[] = [], phi: number[] = [];
  for (let i = -20; i <= 20; i++) {
    const t = i * 0.25, dk = symexp(t, CX);
    if (Math.abs(dk) * s.L > 1000) continue;
    const r = cascadedRK4({ eta: s.eta, P_W: s.P, L_m: s.L, dk_per_m: dk, steps: Math.min(8000, rk4Steps({ ...s, dk })) });
    T.push(t); phi.push(r.dPhiNL);
  }
  return { T, phi };
}

// ---------- fixed-format strings ----------
/** Signed scientific, d decimals, always d + 7 characters: "+3.78e−04". */
export function sciS(v: number, d = 2): string {
  if (!Number.isFinite(v)) return DASH.repeat(d + 7);
  if (v === 0) return `${FS}${(0).toFixed(d)}e+00`;
  let e = Math.floor(Math.log10(Math.abs(v))), m = Math.abs(v) / 10 ** e;
  if (m.toFixed(d) === (10).toFixed(d)) { m /= 10; e++; }
  return `${v < 0 ? MINUS : "+"}${m.toFixed(d)}e${e < 0 ? MINUS : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
}
export function sciP(v: number, d = 2): string {
  if (!Number.isFinite(v) || v <= 0) return DASH.repeat(d + 6);
  let e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  if (m.toFixed(d) === (10).toFixed(d)) { m /= 10; e++; }
  return `${m.toFixed(d)}e${e < 0 ? MINUS : "+"}${String(Math.abs(e)).padStart(2, "0")}`;
}
const fx = (v: number, d: number, n: number): string => (Number.isFinite(v) ? v.toFixed(d).padStart(n, FS) : DASH.repeat(n));
/** Ratio, 7 characters: "  −10.9", or signed scientific with one decimal beyond |r| >= 1e4. */
function ratioS(r: number): string {
  if (!Number.isFinite(r)) return DASH.repeat(7);
  if (Math.abs(r) >= 9999.95) return sciS(r, 0).padStart(7, FS);
  return `${r < 0 ? MINUS : "+"}${Math.abs(r).toFixed(1)}`.padStart(7, FS);
}
const signTxt = (v: number): string => (!Number.isFinite(v) || v === 0 ? DASH.repeat(10) : v > 0 ? "focusing  " : "defocusing");
export const timesKerr = (r: number): string => { const a = Math.abs(r); return !Number.isFinite(a) ? "" : a >= 9.95 ? `${Math.round(a)}× Kerr` : `${a.toFixed(1)}× Kerr`; };

export interface KerrRO { [k: string]: string }
export function kerrRO(o: KerrOut, rk: number): KerrRO {
  return {
    phiK: `${sciS(o.phiK)} rad`, phiC: `${sciS(o.phiC)} rad`, phiR: `${sciS(rk)} rad`, ratio: ratioS(o.ratio), net: `${sciS(o.net)} rad`,
    gK: `${fx(o.gK, 3, 6)} /(W m)`, gC: `${sciS(o.gC)} /(W m)`, sh: sciP(o.shAvg), shPk: sciP(o.shPk), sgnC: signTxt(o.phiC), sgnN: signTxt(o.net),
    dkL: fx(o.dkL, 1, 7), beat: o.beat_um < 1e5 ? `${fx(o.beat_um, 1, 7)} µm` : `${DASH.repeat(7)} µm`,
  };
}
export const ctlTxt = {
  dk: (v: number): string => `${sciS(v)} /m`,
  P: (v: number): string => `${fx(v * 1e3, 1, 6)} mW`,
  L: (v: number): string => `${fx(v * 1e3, 2, 5)} mm`,
  eta: (v: number): string => `${fx(v / 100, 0, 6)} %/W/cm²`,
  aeff: (v: number): string => `${fx(v, 2, 5)} µm²`,
};

/** TECH readout table rows: [key, label HTML, badge HTML]. */
const BD = (cls: string, pop: string, t: string): string => `<span class="b ${cls}" data-pop="${pop}">${t}</span>`;
const ROWS: [string, string, string][] = [
  ["phiK", "Δφ<sub>Kerr</sub> = γ<sub>Kerr</sub>PL", BD("d", "d25-kerr", "derived")],
  ["phiC", "Δφ<sub>casc</sub>, eq. (2.16)", BD("d", "d25-casc", "derived")],
  ["phiR", "Δφ<sub>casc</sub>, RK4 = −arg A<sub>ω</sub>", BD("d", "d25-rk4", "derived")],
  ["ratio", "Δφ<sub>casc</sub> / Δφ<sub>Kerr</sub>", BD("d", "d25-casc", "derived")],
  ["net", "net Δφ<sub>Kerr</sub> + Δφ<sub>casc</sub>", BD("d", "d25-casc", "derived")],
  ["gK", "γ<sub>Kerr</sub>", BD("d", "d25-kerr", "derived")],
  ["gC", "γ<sub>casc</sub> = −η<sub>norm</sub>/Δk", BD("d", "d25-casc", "derived")],
  ["sh", "SH fraction, z-average", BD("d", "d25-sh", "derived")],
  ["shPk", "SH fraction, peak", BD("d", "d25-sh", "derived")],
  ["sgnC", "cascaded sign", BD("d", "d25-casc", "derived")],
  ["sgnN", "net sign", BD("d", "d25-casc", "derived")],
  ["dkL", "|Δk|L", ""],
  ["beat", "2π/|Δk|", ""],
];
export function kerrTableHTML(ro: KerrRO): string {
  return `<colgroup><col><col class="c25-v"><col class="c25-s"></colgroup><tbody>${ROWS.map(([k, lab, b]) => `<tr><td>${lab}</td><td class="v" data-k="${k}">${ro[k]}</td><td class="s">${b}</td></tr>`).join("")}</tbody>`;
}

// ---------- TECH plot ----------
const PB = { w: 520, h: 300, l: 62, r: 14, t: 26, b: 36 };
const sup = (e: number): string => `10<tspan dy="-0.45em" font-size="0.72em">${e < 0 ? MINUS : ""}${Math.abs(e)}</tspan>`;
function xTicks(): Tick[] {
  const t: Tick[] = [{ v: 0, label: "0", major: true }];
  for (const e of [2, 4, 6]) { t.push({ v: symlog(10 ** e, CX), label: sup(e), major: true }); t.push({ v: -symlog(10 ** e, CX), label: `${MINUS}${sup(e)}`, major: true }); }
  for (const e of [1, 3, 5]) { t.push({ v: symlog(10 ** e, CX), label: "", major: false }); t.push({ v: -symlog(10 ** e, CX), label: "", major: false }); }
  return t;
}
function yTicks(): Tick[] {
  const t: Tick[] = [{ v: 0, label: "0", major: true }];
  for (const e of [-4, -2, 0]) { const lab = e === 0 ? "1" : sup(e); t.push({ v: symlog(10 ** e, CY), label: lab, major: true }); t.push({ v: -symlog(10 ** e, CY), label: `${MINUS}${lab}`, major: true }); }
  for (const e of [-5, -3, -1, 1]) { t.push({ v: symlog(10 ** e, CY), label: "", major: false }); t.push({ v: -symlog(10 ** e, CY), label: "", major: false }); }
  return t;
}
export function kerrPlotSVG(s: KerrState, o: KerrOut, pts: { T: number[]; phi: number[] } | null, rk: number): string {
  const F: Frame = frame(PB, { d: [-TX, TX] }, { d: [-TY, TY] });
  const X = (dk: number): number => F.x.f(symlog(dk, CX)), Y = (p: number): number => F.y.f(symlog(p, CY));
  let svg = clip(F, "k25c") + axes(F, { xt: xTicks(), yt: yTicks(), xlab: "Δk (rad/m), symlog", ylab: "Δφ<tspan dy=\"3\" font-size=\"0.75em\">NL</tspan><tspan dy=\"-3\"> (rad), symlog</tspan>" });
  svg += `<g clip-path="url(#k25c)">`;
  const yK = Y(o.phiK);
  svg += `<line class="s2" x1="${c(F.box.l)}" x2="${c(F.box.w - F.box.r)}" y1="${c(yK)}" y2="${c(yK)}"/>`;
  // closed form, both branches
  for (const sgn of [-1, 1]) {
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const t = sgn * (0.02 + (i / 200) * (TX - 0.02)), dk = symexp(t, CX);
      d += `${i ? "L" : "M"}${c(F.x.f(t))} ${c(Math.max(F.box.t - 40, Math.min(F.box.h - F.box.b + 40, Y(cascadedPhase(s.eta, s.P, s.L, dk)))))}`;
    }
    svg += `<path class="s1" d="${d}"/>`;
  }
  if (pts) for (let i = 0; i < pts.T.length; i++) svg += `<circle class="mko" cx="${c(F.x.f(pts.T[i]))}" cy="${c(Y(pts.phi[i]))}" r="2.6"/>`;
  // cursor at the current Delta k, arrow from the Kerr level to the cascaded phase
  const xc = X(s.dk);
  svg += `<line class="cur" x1="${c(xc)}" x2="${c(xc)}" y1="${c(F.box.t)}" y2="${c(F.box.h - F.box.b)}"/>`;
  if (Number.isFinite(rk)) svg += `<rect class="mk" x="${c(xc - 3)}" y="${c(Y(rk) - 3)}" width="6" height="6"/>`;
  if (Number.isFinite(o.phiC)) {
    const yC = Math.max(F.box.t + 2, Math.min(F.box.h - F.box.b - 2, Y(o.phiC))), up = yC < yK ? 1 : -1;
    svg += `<path class="s1" d="M${c(xc)} ${c(yK)}V${c(yC)}"/>`;
    if (Math.abs(yC - yK) > 10) svg += `<path class="mk" d="M${c(xc)} ${c(yC)}l-4 ${c(8 * up)}h8z"/>`;
    const right = xc < F.box.w - F.box.r - 110;
    svg += `<text class="v" x="${c(xc + (right ? 8 : -8))}" y="${c((yK + yC) / 2 + 4)}" text-anchor="${right ? "start" : "end"}">${timesKerr(o.ratio)}</text>`;
  }
  svg += `<text class="lg" x="${c(F.box.w - F.box.r - 4)}" y="${c(yK - 5)}" text-anchor="end">Kerr γPL</text>`;
  return svg + "</g>";
}

// ---------- VISUAL stage: beam in a slab, SH beat along z, phase bars ----------
const G = { x0: 70, x1: 930, yc: 150, hh: 92 };
export function kerrStageSVG(s: KerrState, o: KerrOut): string {
  const a = Number.isFinite(o.net) ? 0.45 * Math.tanh(o.net / 3e-3) : 0; // drawn width change (schematic); straight where eq. 2.16 is undefined
  const w0 = 74, W = (u: number): number => w0 * (1 - a * u * u);
  let up = "", lo = "";
  for (let i = 0; i <= 120; i++) {
    const u = i / 120, x = G.x0 + u * (G.x1 - G.x0), w = W(u) / 2;
    up += `${i ? "L" : "M"}${c(x)} ${c(G.yc - w)}`; lo = `L${c(x)} ${c(G.yc + w)}` + lo;
  }
  let fronts = "";
  for (let k = 1; k <= 7; k++) {
    const u = k / 8, x = G.x0 + u * (G.x1 - G.x0), w = W(u) / 2, dx = 16 * a;
    fronts += `M${c(x + dx)} ${c(G.yc - w)}Q${c(x - dx)} ${G.yc} ${c(x + dx)} ${c(G.yc + w)}`;
  }
  let svg = `<rect class="c25-slab" x="${G.x0}" y="${G.yc - G.hh}" width="${G.x1 - G.x0}" height="${2 * G.hh}"/>`
    + `<text class="c25-lab" x="${G.x0 + 10}" y="${G.yc - G.hh + 22}">LN waveguide, top view (schematic)</text>`
    + `<path class="c25-beam ir-el" d="${up}${lo}Z"/><path class="c25-front ir-el" d="${fronts}"/>`
    + `<path class="c25-arrow ir-el" d="M${G.x0 - 46} ${G.yc}h34m-8 -6l8 6-8 6"/><text class="c25-lab" x="${G.x0 + 10}" y="${G.yc + G.hh - 12}">input: 1550 nm</text>`;
  // SH fraction along z, normalized to its peak 4 eta P / dk^2
  const yb = 372, hs = 64;
  svg += `<line class="c25-ax" x1="${G.x0}" x2="${G.x1}" y1="${yb}" y2="${yb}"/>`;
  if (o.dkL >= 2 * Math.PI) {
    const pk = (4 * s.eta * s.P) / s.dk ** 2;
    let d = `M${G.x0} ${yb}`;
    for (let i = 0; i <= 1400; i++) { const u = i / 1400; d += `L${c(G.x0 + u * (G.x1 - G.x0))} ${c(yb - (hs * cascadedShFraction(s.eta, s.P, s.dk, u * s.L)) / pk)}`; }
    svg += `<path class="c25-sh" d="${d}L${G.x1} ${yb}Z"/>`;
    svg += `<text class="c25-lab" x="${G.x0}" y="${yb - hs - 12}">775 nm second harmonic along z, peak ${sciP(pk, 1)} of P</text>`;
  } else svg += `<text class="c25-lab" x="${G.x0}" y="${yb - 22}">|Δk|L &lt; 2π: phase matched, the harmonic grows; eq. (2.16) does not apply</text>`;
  svg += `<text class="c25-tk" x="${G.x1}" y="${yb + 22}" text-anchor="end">z = L = ${fx(s.L * 1e3, 1, 4).trim()} mm</text><text class="c25-tk" x="${G.x0}" y="${yb + 22}">z = 0</text>`;
  // phase bars on a fixed symlog scale
  const cx = 520, span = 380, Xp = (p: number): number => cx + (symlog(p, CY) / TY) * span;
  const yb2 = 470;
  svg += `<line class="c25-ax" x1="${cx - span}" x2="${cx + span}" y1="${yb2}" y2="${yb2}"/>`;
  for (const e of [-4, -2, 0]) for (const sg of [-1, 1]) { const x = Xp(sg * 10 ** e); svg += `<line class="c25-ax" x1="${c(x)}" x2="${c(x)}" y1="${yb2}" y2="${yb2 + 6}"/><text class="c25-tk" x="${c(x)}" y="${yb2 + 24}" text-anchor="middle">${sg < 0 ? MINUS : ""}${e === 0 ? "1" : sup(e)}</text>`; }
  svg += `<line class="c25-ax" x1="${cx}" x2="${cx}" y1="400" y2="${yb2 + 6}"/><text class="c25-tk" x="${cx}" y="${yb2 + 24}" text-anchor="middle">0</text>`;
  const bar = (p: number, y: number, cls: string): string => { if (!Number.isFinite(p)) return ""; const x = Math.max(cx - span, Math.min(cx + span, Xp(p))); return `<rect class="${cls}" x="${c(Math.min(cx, x))}" y="${y}" width="${c(Math.abs(x - cx))}" height="16"/>`; };
  svg += bar(o.phiK, 408, "c25-bk") + bar(o.phiC, 430, "c25-bc");
  svg += `<text class="c25-lab" x="${cx - span - 12}" y="421" text-anchor="end">Kerr</text><text class="c25-lab" x="${cx - span - 12}" y="443" text-anchor="end">cascaded</text>`;
  if (Number.isFinite(o.phiC)) {
    const xC = Math.max(cx - span, Math.min(cx + span, Xp(o.phiC))), r = xC >= cx;
    svg += `<text class="c25-val" x="${c(xC + (r ? 10 : -10))}" y="443" text-anchor="${r ? "start" : "end"}">${timesKerr(o.ratio)}</text>`;
    const xn = Math.max(cx - span, Math.min(cx + span, Xp(o.net)));
    svg += `<path class="c25-net" d="M${c(xn)} ${yb2 - 9}l7 9-7 9-7-9z"/>`;
  }
  svg += `<text class="c25-tk" x="${cx + span}" y="${yb2 + 46}" text-anchor="end">nonlinear phase (rad), symlog; diamond: net</text>`;
  return svg;
}
export const VK_ROWS = ["phiK", "phiC", "net", "ratio", "sgnN", "sh"] as const;

// ---------- mount (browser) ----------
export function mountKerr(root: HTMLElement): () => void {
  const dis = new Disposer();
  const S = kerrState;
  let out = kerrClosed(S), rk = kerrRK4(S), pts: { T: number[]; phi: number[] } | null = null, ptsKey = "";
  let rkTimer = 0, ptsTimer = 0;
  const key = (): string => `${S.eta}|${S.P}|${S.L}`;
  const techSvg = q<SVGSVGElement>(root, "#k-plot"), visSvg = q<SVGSVGElement>(root, "#vk-stage");
  const roCells = qa<HTMLElement>(root, "[data-k]"), hud = qa<HTMLElement>(root, "[data-vk]");
  const paint = (): void => {
    const ro = kerrRO(out, rk);
    for (const el of roCells) el.textContent = ro[el.dataset.k ?? ""] ?? "";
    for (const el of hud) el.textContent = ro[el.dataset.vk ?? ""] ?? "";
    if (isVisual()) { if (visSvg) visSvg.innerHTML = kerrStageSVG(S, out); }
    else if (techSvg) techSvg.innerHTML = kerrPlotSVG(S, out, pts, rk);
  };
  const queue = rafQueue(paint);
  const schedule = (): void => {
    out = kerrClosed(S);
    clearTimeout(rkTimer);
    if (rk4Steps(S) <= 8000) rk = kerrRK4(S);
    else { rk = Number.NaN; rkTimer = window.setTimeout(() => { rk = kerrRK4(S); queue(); }, 120); }
    if (key() !== ptsKey) {
      clearTimeout(ptsTimer);
      ptsTimer = window.setTimeout(() => { pts = rk4Points(S); ptsKey = key(); queue(); }, 150);
    }
    queue();
  };
  const syncs: (() => void)[] = [];
  const range = (sel: string, read: (s: number) => number, write: (v: number) => number, fmt: (v: number) => string, aria: (v: number) => string, get: () => number, set: (v: number) => void): void => {
    for (const pre of ["k", "vk"]) {
      const inp = q<HTMLInputElement>(root, `#${pre}-${sel}`), o = q<HTMLElement>(root, `#${pre}-${sel}-o`);
      syncs.push(bindRange(dis, inp, o, { read, write, fmt, aria, get, set }, () => { syncAll(); schedule(); }));
    }
  };
  const syncAll = (): void => syncs.forEach((f) => f());
  range("dk", (t) => symexp(t, CX), (v) => symlog(v, CX), ctlTxt.dk, (v) => `${v.toExponential(2)} radians per metre`, () => S.dk, (v) => { S.dk = v; });
  range("p", MAP.P.to, MAP.P.from, ctlTxt.P, (v) => `${(v * 1e3).toFixed(1)} milliwatts`, () => S.P, (v) => { S.P = v; });
  range("l", MAP.L.to, MAP.L.from, ctlTxt.L, (v) => `${(v * 1e3).toFixed(2)} millimetres`, () => S.L, (v) => { S.L = v; });
  range("eta", MAP.eta.to, MAP.eta.from, ctlTxt.eta, (v) => `${(v / 100).toFixed(0)} percent per watt per square centimetre`, () => S.eta, (v) => { S.eta = v; });
  range("aeff", MAP.aeff.to, MAP.aeff.from, ctlTxt.aeff, (v) => `${v.toFixed(2)} square micrometres`, () => S.aeff, (v) => { S.aeff = v; });
  for (const pre of ["k", "vk"]) syncs.push(bindSeg(dis, q(root, `#${pre}-n2`), () => S.n2, (v) => { S.n2 = v as N2Key; }, () => { syncAll(); schedule(); }));
  dis.add(onUi(() => { syncAll(); queue(); }));
  dis.add(() => { clearTimeout(rkTimer); clearTimeout(ptsTimer); });
  syncAll();
  ptsKey = "";
  schedule();
  return dis.run;
}
