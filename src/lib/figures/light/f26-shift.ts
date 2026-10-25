// Coupled-ring frequency shifter figure (chapter 2.6, figures.md). Two-mode coupled-mode theory in the supermode basis
// (resonators.ts shifterTransfer: steady state, eq. 2.19 at zero detuning; shifterTimeDomain: RK4 of the same equations
// for a step input). Both supermodes carry the same loaded rate kappa (template); rates in units of kappa; the light
// enters on resonance with supermode a, so a microwave detuned from 2 mu by delta leaves the shifted light detuned from
// supermode b by delta. kappa/2pi from a loaded Q of 1.0e6 at 1550 nm (template) converts delta to MHz.
// TECH: ASCII two-level diagram, efficiency vs G plot, time-domain plot, boxed readouts. VISUAL: two rings with electrodes,
// two frequency bins in two declared false colors. One shared state (SHIFT) for both variants.
import { shifterTimeDomain, shifterTransfer, type ShifterParams } from "$lib/physics/resonators.ts";
import { umToTHz } from "$lib/physics/units.ts";
import { FS, MINUS, fix, pad, sgn } from "../fmt.ts";
import { Disposer, isVisual, need, onUi, q, rafQueue } from "../dom.ts";
import { whenVisual, type Part } from "../visual/lifecycle.ts";
import { axes, c, clip, frame, path, ticks } from "./plot.ts";
import { bindRange, bindSeg } from "./ctl.ts";

export interface ShiftState { g: number; k0: number; det: number; mu2: number; ylog: "lin" | "log" }
/** Display defaults (template): G = 0.25 kappa, intrinsic share 0.10, zero detuning, 2 mu / 2 pi = 28.0 GHz. */
export const SHIFT: ShiftState = { g: 0.25, k0: 0.1, det: 0, mu2: 28, ylog: "lin" };
export const SHIFT_DEFAULT: Readonly<ShiftState> = { ...SHIFT };
export const Q_LOADED = 1e6;
export const KAPPA_MHZ = (umToTHz(1.55) * 1e6) / Q_LOADED; // kappa / 2 pi in MHz (193.4)
const G_MAX = 1.5;

const params = (st: ShiftState, g = st.g, k0 = st.k0, det = st.det): ShifterParams => ({ kappa_a: 1, kappa_b: 1, kappa_a_ex: 1 - k0, kappa_b_ex: 1 - k0, G: g, delta_a: 0, delta_b: det });

export interface ShiftModel { eta: number; thru: number; etaMax: number; shiftGHz: number; tdEnd: number; td: { t: Float64Array; Ps: Float64Array; Pt: Float64Array }; qi: number; qex: number }
export function shiftModel(st: ShiftState): ShiftModel {
  const p = params(st), tr = shifterTransfer(p);
  const td = shifterTimeDomain({ ...p, s: () => [1, 0], t_end: 30, steps: 3000, every: 10 });
  return {
    eta: tr.toShifted, thru: tr.through, etaMax: (1 - st.k0) ** 2, shiftGHz: st.mu2 + (st.det * KAPPA_MHZ) / 1000,
    tdEnd: Math.abs(td.Pshift[td.Pshift.length - 1] - tr.toShifted), td: { t: td.t, Ps: td.Pshift, Pt: td.Pthrough },
    qi: st.k0 > 0 ? Q_LOADED / st.k0 : Number.POSITIVE_INFINITY, qex: Q_LOADED / (1 - st.k0),
  };
}

// ---------------------------------------------------------------- formats
const B = (cls: string, txt: string, pop?: string): string => `<span class="b ${cls}"${pop ? ` data-pop="${pop}" tabindex="0"` : ""}>${txt}</span>`;
const BD = (pop = "f26-eta"): string => B("d", "derived", pop);
const BT = B("t", "template", "f26-tpl");
const vu = (num: string, unit = ""): string => num + (unit ? ` ${unit}` : "").padEnd(6, FS);
const dB = (v: number): string => (v > 1e-6 ? pad(fix(10 * Math.log10(v), 1), 6) : pad(`<${MINUS}60`, 6));
const esc = (x: string): string => x.replace(/</g, "&lt;");
const qfmt = (v: number): string => { if (!Number.isFinite(v)) return pad("\u221e", 8); const [m, e] = v.toExponential(2).split("e"); return pad(`${m}e${+e}`, 8); };
const expo = (v: number): string => { if (v === 0) return "0"; const [m, e] = v.toExponential(0).split("e"); return `${m}e${(+e < 0 ? MINUS : "+") + Math.abs(+e)}`; };

export const fmtG = (v: number): string => `${v.toFixed(3)} &kappa;`;
export const fmtK0 = (v: number): string => v.toFixed(2);
export const fmtDet = (v: number): string => `${sgn(v, 2)} &kappa;`;
export const fmtMu = (v: number): string => `${pad(v.toFixed(1), 4)} GHz`;
export interface ShiftOut { g: string; k0: string; det: string; mu: string }
export const shiftOut = (st: ShiftState): ShiftOut => ({ g: fmtG(st.g), k0: fmtK0(st.k0), det: fmtDet(st.det), mu: fmtMu(st.mu2) });

type Row = [string, string, string];
const roTable = (rows: Row[]): string => `<colgroup><col><col class="cv"><col class="cs"></colgroup><tbody>${rows.map(([k, v, s]) => `<tr><td>${k}</td><td class="v">${v}</td><td class="s">${s}</td></tr>`).join("")}</tbody>`;

export function shiftRO(m: ShiftModel, st: ShiftState): string {
  return roTable([
    ["shift &Omega;/2&pi; = 2&mu;/2&pi; + &delta;/2&pi;", vu(pad(`+${m.shiftGHz.toFixed(2)}`, 8), "GHz"), BD("g:electro-optic-frequency-shifter")],
    ["efficiency |s<sub>b,out</sub>/s<sub>in</sub>|&sup2;", vu(pad((m.eta * 100).toFixed(1), 8), "%"), BD()],
    ["carrier |s<sub>a,out</sub>/s<sub>in</sub>|&sup2;", esc(vu(pad(dB(m.thru), 8), "dB")), BD()],
    ["maximum over G at &delta; = 0: (&kappa;<sub>ex</sub>/&kappa;)&sup2;", vu(pad((m.etaMax * 100).toFixed(1), 8), "%"), BD()],
    ["G/&kappa;", vu(pad(st.g.toFixed(3), 8)), BT],
    ["detuning &delta;/2&pi;", vu(pad(sgn(st.det * KAPPA_MHZ, 1), 8), "MHz"), BD()],
    ["&kappa;/2&pi; (loaded Q 1.0e6, 1550 nm)", vu(pad(KAPPA_MHZ.toFixed(1), 8), "MHz"), BT],
    ["Q<sub>i</sub>, Q<sub>ex</sub>", `${qfmt(m.qi)} ${qfmt(m.qex)}`, BD()],
    ["|P<sub>b</sub>(30/&kappa;) &minus; eq. 2.19|", vu(pad(expo(m.tdEnd), 8)), BD("f26-td")],
  ]);
}

// ---------------------------------------------------------------- TECH: ASCII two-level diagram
const COLS = 46;
const BAR = 16;
const bar = (v: number): string => { const n = Math.round(Math.max(0, Math.min(1, v)) * BAR); return `[${"#".repeat(n)}${".".repeat(BAR - n)}]`; };
const row = (x: string): string => (x.length > COLS ? x.slice(0, COLS) : x.padEnd(COLS, " "));
/** Supermodes as lines, the microwave as a vertical arrow (tip on, above or below the b line for delta = 0, > 0, < 0),
 *  bars = output power in the shifted bin (top) and in the input bin (bottom). */
export function shiftASCII(m: ShiftModel, st: ShiftState): string {
  const AC = 9, sp = (n: number): string => " ".repeat(n), L = sp(AC) + "|", BC = 26;
  const up = st.det > 0.05, dn = st.det < -0.05;
  const tipLine = (lab: string): string => `${sp(AC - 4)}....^....  ${lab}`;
  const r = [
    up ? tipLine("ω₀+μ+δ") : "",
    ` b ${"-".repeat(AC - 3)}${up ? "+" : "-"}${"-".repeat(8)}  ω₀+μ    shifted ω+Ω`,
    `${up ? L : dn ? sp(AC + 1) : sp(AC) + "^"}${sp(BC - AC - 1)}${bar(m.eta)}`,
    dn ? tipLine(`ω₀+μ${MINUS}|δ|`) : `${L}  Ω = 2μ + δ`,
    `${L}  δ = ${sgn(st.det, 2)} κ`,
    `${L}  G = ${st.g.toFixed(3)} κ`,
    ` a ${"-".repeat(AC - 3)}+${"-".repeat(8)}  ω₀${MINUS}μ    in ω`,
    `${sp(BC)}${bar(m.thru)}`,
    `  efficiency ${pad((m.eta * 100).toFixed(1), 5)} %, carrier ${dB(m.thru)} dB`,
  ];
  return r.map(row).join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

// ---------------------------------------------------------------- TECH plots
const EB = { w: 420, h: 250, l: 50, r: 12, t: 24, b: 34 };
const TB = { w: 420, h: 250, l: 50, r: 12, t: 24, b: 34 };
const YLOG: [number, number] = [1e-4, 1];

export function effPlotSVG(m: ShiftModel, st: ShiftState, pfx = "s26"): string {
  const log = st.ylog === "log";
  const fr = frame(EB, { d: [0, G_MAX] }, log ? { kind: "log", d: YLOG } : { d: [0, 1] });
  const n = 241, xs = new Float64Array(n), e = new Float64Array(n), t = new Float64Array(n), id = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const g = (G_MAX * i) / (n - 1);
    xs[i] = g;
    const tr = shifterTransfer(params(st, g)); e[i] = tr.toShifted; t[i] = tr.through;
    id[i] = shifterTransfer(params(st, g, 0, 0)).toShifted;
  }
  let s = `<defs>${clip(fr, `${pfx}-clip`)}</defs>` + axes(fr, { xlab: "G / &kappa;", ylab: "power / input", xt: ticks(fr.x, 4), yt: log ? undefined : ticks(fr.y, 5) });
  s += `<g clip-path="url(#${pfx}-clip)"><path class="s3" d="${path(fr, xs, id)}"/><path class="s2" d="${path(fr, xs, t)}"/><path class="s1" d="${path(fr, xs, e)}"/>`;
  const px = fr.x.f(st.g), py = fr.y.f(Math.max(m.eta, YLOG[0] * 0.5));
  s += `<line class="cur" x1="${c(px)}" x2="${c(px)}" y1="${EB.t}" y2="${EB.h - EB.b}"/><line class="cur" x1="${c(fr.x.f(0.5))}" x2="${c(fr.x.f(0.5))}" y1="${EB.t}" y2="${EB.h - EB.b}" stroke-dasharray="1 3"/>`;
  s += `<path class="mk" d="M${c(px)} ${c(py - 5)}l5 5-5 5-5-5z"/></g>`;
  s += `<text class="tk" x="${c(fr.x.f(0.5) + 4)}" y="${EB.h - EB.b - 6}">G = &kappa;/2</text>`;
  return s;
}
export function tdPlotSVG(m: ShiftModel, pfx = "s26"): string {
  const fr = frame(TB, { d: [0, 30] }, { d: [0, 1] });
  let s = `<defs>${clip(fr, `${pfx}-tclip`)}</defs>` + axes(fr, { xlab: "time &kappa;t, step input at 0", ylab: "power / input", xt: ticks(fr.x, 4) });
  const ss = fr.y.f(m.eta);
  s += `<g clip-path="url(#${pfx}-tclip)"><line class="s3" x1="${TB.l}" x2="${TB.w - TB.r}" y1="${c(ss)}" y2="${c(ss)}"/><path class="s2" d="${path(fr, m.td.t, m.td.Pt)}"/><path class="s1" d="${path(fr, m.td.t, m.td.Ps)}"/></g>`;
  return s;
}

// ---------------------------------------------------------------- VISUAL
const VX = { w: 760, h: 470 };
const RA = { x: 150, y: 150, r: 74 }, RB = { x: 302, y: 150, r: 74 };
const BUS_Y = RA.y + RA.r + 10;
const BIN = { x0: 120, x1: 400, base: 410, top: 300 };

export function shiftArtSVG(m: ShiftModel, st: ShiftState): string {
  // push-pull: signal electrode inside each ring's top arc, ground electrodes on the outer sides only (no overlap in the gap)
  const arc = (R: typeof RA, rr: number, a0: number, a1: number): string => {
    const p = (a: number): string => `${c(R.x + rr * Math.cos((a * Math.PI) / 180))} ${c(R.y + rr * Math.sin((a * Math.PI) / 180))}`;
    return `M${p(a0)}A${rr} ${rr} 0 0 1 ${p(a1)}`;
  };
  const ring = (R: typeof RA, id: string, g0: number, g1: number): string => `
    <path d="${arc(R, R.r - 14, 200, 340)}" fill="none" stroke="var(--v-au)" stroke-width="10" stroke-opacity="0.9"/>
    <path d="${arc(R, R.r + 13, g0, g1)}" fill="none" stroke="var(--v-au)" stroke-width="8" stroke-opacity="0.5"/>
    <circle id="${id}0" cx="${R.x}" cy="${R.y}" r="${R.r}" fill="none" class="ir-el" stroke="var(--v26-bin0)" stroke-width="3.5" stroke-dasharray="9 5"/>
    <circle id="${id}1" cx="${R.x}" cy="${R.y}" r="${R.r - 6}" fill="none" class="ir-el" stroke="var(--v26-bin1)" stroke-width="3.5" stroke-dasharray="9 5"/>`;
  return `<svg viewBox="0 0 ${VX.w} ${VX.h}" role="img" aria-label="Two coupled rings with electrodes; input light in one frequency bin, output split between the input bin and the shifted bin; level diagram and output spectrum">
  ${ring(RA, "vs26-ra", 185, 290)}${ring(RB, "vs26-rb", 250, 355)}
  <path class="ir-el" d="M16 ${BUS_Y}H${RA.x}" fill="none" stroke="var(--v26-bin0)" stroke-width="4" stroke-dasharray="9 5"/>
  <path id="vs26-out0" class="ir-el" d="M${RA.x} ${BUS_Y - 3}H430" fill="none" stroke="var(--v26-bin0)" stroke-width="4" stroke-dasharray="9 5"/>
  <path id="vs26-out1" class="ir-el" d="M${RA.x} ${BUS_Y + 3}H430" fill="none" stroke="var(--v26-bin1)" stroke-width="4" stroke-dasharray="9 5"/>
  <text x="16" y="${BUS_Y + 28}" class="v26-m2">in, &#969;</text>
  <text x="430" y="${BUS_Y + 28}" class="v26-m2" text-anchor="end">out, &#969; and &#969; + &#937;</text>
  <path d="M${(RA.x + RB.x) / 2} 40V58" stroke="var(--v-au)" stroke-width="2"/>
  <text x="${(RA.x + RB.x) / 2}" y="30" class="v26-m2" text-anchor="middle">microwave &#937;/2&#960; = <tspan id="vs26-om">${m.shiftGHz.toFixed(2)}</tspan> GHz, push-pull</text>
  <text x="${RA.x}" y="${RA.y + 5}" class="v26-m3" text-anchor="middle">ring 1</text><text x="${RB.x}" y="${RB.y + 5}" class="v26-m3" text-anchor="middle">ring 2</text>
  <g id="vs26-lv">${levelsSVG(m, st)}</g>
  <line x1="${BIN.x0}" x2="${BIN.x1}" y1="${BIN.base}" y2="${BIN.base}" stroke="var(--v-line2)"/>
  <line x1="${BIN.x0}" x2="${BIN.x1}" y1="${BIN.top}" y2="${BIN.top}" stroke="var(--v-line)" stroke-dasharray="2 4"/>
  <text x="${BIN.x0 - 8}" y="${BIN.top + 5}" class="v26-m2" text-anchor="end">1</text><text x="${BIN.x0 - 8}" y="${BIN.base + 5}" class="v26-m2" text-anchor="end">0</text>
  <rect id="vs26-b0" x="${BIN.x0 + 40}" width="34" fill="var(--v26-bin0)" fill-opacity="0.18" stroke="var(--v26-bin0)" stroke-width="2.5" stroke-dasharray="7 4" class="ir-el" ${binAttr(m.thru)}/>
  <rect id="vs26-b1" x="${BIN.x1 - 74}" width="34" fill="var(--v26-bin1)" fill-opacity="0.18" stroke="var(--v26-bin1)" stroke-width="2.5" stroke-dasharray="7 4" class="ir-el" ${binAttr(m.eta)}/>
  <text x="${BIN.x0 + 57}" y="${BIN.base + 24}" class="v26-m2" text-anchor="middle">&#969;</text><text x="${BIN.x1 - 57}" y="${BIN.base + 24}" class="v26-m2" text-anchor="middle">&#969; + &#937;</text>
  <text x="${(BIN.x0 + BIN.x1) / 2}" y="${BIN.base + 46}" class="v26-m2" text-anchor="middle">output power / input</text>
  </svg>`;
}
const binAttr = (v: number): string => { const h = Math.max(0, Math.min(1, v)) * (BIN.base - BIN.top); return `y="${c(BIN.base - h)}" height="${c(h)}"`; };

/** Level diagram: supermode a (input bin) and b (shifted bin) as lines whose thickness follows the output power in each bin;
 *  the microwave as a vertical arrow whose width follows G/kappa, its tip offset by the detuning. */
function levelsSVG(m: ShiftModel, st: ShiftState): string {
  const x0 = 500, x1 = 740, ya = 330, yb = 90, ax = 620;
  const tip = yb + Math.max(-45, Math.min(45, -st.det * 15));
  const w = 1 + 5 * Math.min(1, st.g / G_MAX) * 2;
  return `<line x1="${x0}" x2="${x1}" y1="${yb}" y2="${yb}" stroke="var(--v26-bin1)" stroke-width="${c(2 + 8 * m.eta)}" stroke-dasharray="10 4" class="ir-el"/>
  <line x1="${x0}" x2="${x1}" y1="${ya}" y2="${ya}" stroke="var(--v26-bin0)" stroke-width="${c(2 + 8 * m.thru)}" stroke-dasharray="10 4" class="ir-el"/>
  <path d="M${ax} ${ya - 6}V${c(tip + 12)}" stroke="var(--v-au)" stroke-width="${c(w)}"/><path d="M${ax - 9} ${c(tip + 14)}L${ax} ${c(tip)}L${ax + 9} ${c(tip + 14)}Z" fill="var(--v-au)"/>
  <text x="${x0}" y="${yb - 14}" class="v26-m2">supermode b, &#969;&#8320; + &#956;</text><text x="${x0}" y="${ya + 26}" class="v26-m2">supermode a, &#969;&#8320; &#8722; &#956;</text>
  <text x="${ax + 14}" y="${(ya + yb) / 2 + 5}" class="v26-m2">G = ${st.g.toFixed(2)} &#954;</text>`;
}

export interface ShiftHud { shift: string; eta: string; thru: string; g: string; max: string; det: string; kap: string; q: string; td: string }
export const shiftHud = (m: ShiftModel, st: ShiftState): ShiftHud => ({
  shift: `+${m.shiftGHz.toFixed(2)} GHz`, eta: `${pad((m.eta * 100).toFixed(1), 5)} %`, thru: esc(`${dB(m.thru)} dB`), g: st.g.toFixed(3),
  max: `${pad((m.etaMax * 100).toFixed(1), 5)} %`, det: `${pad(sgn(st.det * KAPPA_MHZ, 1), 7)} MHz`, kap: `${KAPPA_MHZ.toFixed(1)} MHz`,
  q: `${qfmt(m.qi)} / ${qfmt(m.qex)}`, td: expo(m.tdEnd),
});

// ---------------------------------------------------------------- server: default markup
export function shiftInit(): { ascii: string; eff: string; td: string; veff: string; vtd: string; ro: string; out: ShiftOut; art: string; hud: ShiftHud } {
  const st = { ...SHIFT_DEFAULT }, m = shiftModel(st);
  return { ascii: shiftASCII(m, st), eff: effPlotSVG(m, st), td: tdPlotSVG(m), veff: effPlotSVG(m, st, "vs26"), vtd: tdPlotSVG(m, "vs26"), ro: shiftRO(m, st), out: shiftOut(st), art: shiftArtSVG(m, st), hud: shiftHud(m, st) };
}
/** Acceptance (figures.md, shifter): eq. 2.19 at G = kappa/2 with kappa_ex = kappa; G = 0; detuning symmetry; time domain. */
export function shiftChecks(): { max: string; zero: string; sym: string; td: string } {
  const p = (g: number, k0: number, d: number): ShifterParams => ({ kappa_a: 1, kappa_b: 1, kappa_a_ex: 1 - k0, kappa_b_ex: 1 - k0, G: g, delta_a: 0, delta_b: d });
  const max = shifterTransfer(p(0.5, 0, 0)).toShifted, zero = shifterTransfer(p(0, 0.1, 0)).toShifted;
  const sym = Math.abs(shifterTransfer(p(0.4, 0.1, 0.7)).toShifted - shifterTransfer(p(0.4, 0.1, -0.7)).toShifted);
  const td = shifterTimeDomain({ ...p(0.4, 0.1, 0.3), s: () => [1, 0], t_end: 60, steps: 6000 });
  const tdd = Math.abs(td.Pshift[td.Pshift.length - 1] - shifterTransfer(p(0.4, 0.1, 0.3)).toShifted);
  return { max: max.toFixed(12), zero: zero.toFixed(1), sym: expo(sym), td: expo(tdd) };
}

// ---------------------------------------------------------------- browser
export function mountShift(root: HTMLElement): () => void {
  const dis = new Disposer();
  const st = SHIFT;
  let model = shiftModel(st);
  const recompute = (): void => { model = shiftModel(st); };

  const tech = q(root, "#s26");
  const tParts: (() => void)[] = [];
  let paintTech = (): void => {};
  if (tech) {
    const asc = need(tech, "#s26-ascii"), eff = need(tech, "#s26-eff"), td = need(tech, "#s26-td"), ro = need(tech, "#s26-ro");
    paintTech = (): void => { asc.innerHTML = shiftASCII(model, st); eff.innerHTML = effPlotSVG(model, st); td.innerHTML = tdPlotSVG(model); ro.innerHTML = shiftRO(model, st); };
    const sched = rafQueue(() => { recompute(); paintTech(); });
    tParts.push(
      bindRange(dis, q(tech, "#s26-g"), q(tech, "#s26-g-o"), { read: (s) => s, write: (v) => v, fmt: fmtG, html: true, aria: (v) => `G ${v.toFixed(3)} kappa`, get: () => st.g, set: (v) => { st.g = v; } }, sched),
      bindRange(dis, q(tech, "#s26-k0"), q(tech, "#s26-k0-o"), { read: (s) => s, write: (v) => v, fmt: fmtK0, aria: (v) => `intrinsic loss share ${v.toFixed(2)}`, get: () => st.k0, set: (v) => { st.k0 = v; } }, sched),
      bindRange(dis, q(tech, "#s26-det"), q(tech, "#s26-det-o"), { read: (s) => s, write: (v) => v, fmt: fmtDet, html: true, aria: (v) => `detuning ${v.toFixed(2)} kappa`, get: () => st.det, set: (v) => { st.det = v; } }, sched),
      bindRange(dis, q(tech, "#s26-mu"), q(tech, "#s26-mu-o"), { read: (s) => s, write: (v) => v, fmt: fmtMu, aria: (v) => `supermode splitting ${v.toFixed(1)} gigahertz`, get: () => st.mu2, set: (v) => { st.mu2 = v; } }, sched),
      bindSeg(dis, q(tech, "#s26-y"), () => st.ylog, (v) => { st.ylog = v as "lin" | "log"; }, () => paintTech()),
    );
  }
  const syncTech = (): void => { tParts.forEach((f) => f()); recompute(); paintTech(); };

  const offVis = whenVisual((): Part | null => {
    const vis = q(root, "#vs26");
    if (!vis) return null;
    const art = need(vis, "#vs26-art");
    const hud: Record<keyof ShiftHud, HTMLElement> = {
      shift: need(vis, "#vs26-shift"), eta: need(vis, "#vs26-eta"), thru: need(vis, "#vs26-thru"), g: need(vis, "#vs26-gv"),
      max: need(vis, "#vs26-max"), det: need(vis, "#vs26-detv"), kap: need(vis, "#vs26-kap"), q: need(vis, "#vs26-q"), td: need(vis, "#vs26-tdv"),
    };
    const veff = need(vis, "#vs26-eff"), vtd = need(vis, "#vs26-td");
    const paint = (): void => {
      if (!art.querySelector("#vs26-lv")) art.innerHTML = shiftArtSVG(model, st);
      need(art, "#vs26-lv").innerHTML = levelsSVG(model, st);
      const b0 = need(art, "#vs26-b0"), b1 = need(art, "#vs26-b1");
      for (const [el, v] of [[b0, model.thru], [b1, model.eta]] as [Element, number][]) { const h = Math.max(0, Math.min(1, v)) * (BIN.base - BIN.top); el.setAttribute("y", c(BIN.base - h)); el.setAttribute("height", c(h)); }
      need(art, "#vs26-out0").setAttribute("stroke-opacity", (0.15 + 0.85 * model.thru).toFixed(3));
      need(art, "#vs26-out1").setAttribute("stroke-opacity", (0.15 + 0.85 * model.eta).toFixed(3));
      for (const id of ["#vs26-ra1", "#vs26-rb1"]) need(art, id).setAttribute("stroke-opacity", (0.15 + 0.85 * model.eta).toFixed(3));
      need(art, "#vs26-om").textContent = model.shiftGHz.toFixed(2);
      const h = shiftHud(model, st);
      for (const key of Object.keys(hud) as (keyof ShiftHud)[]) hud[key].innerHTML = h[key];
      veff.innerHTML = effPlotSVG(model, st, "vs26"); vtd.innerHTML = tdPlotSVG(model, "vs26");
    };
    const vdis = new Disposer();
    const sched = rafQueue(() => { recompute(); paint(); });
    const parts = [
      bindRange(vdis, q(vis, "#vs26-g"), q(vis, "#vs26-g-o"), { read: (s) => s, write: (v) => v, fmt: fmtG, html: true, aria: (v) => `G ${v.toFixed(3)} kappa`, get: () => st.g, set: (v) => { st.g = v; } }, sched),
      bindRange(vdis, q(vis, "#vs26-k0"), q(vis, "#vs26-k0-o"), { read: (s) => s, write: (v) => v, fmt: fmtK0, aria: (v) => `intrinsic loss share ${v.toFixed(2)}`, get: () => st.k0, set: (v) => { st.k0 = v; } }, sched),
      bindRange(vdis, q(vis, "#vs26-det"), q(vis, "#vs26-det-o"), { read: (s) => s, write: (v) => v, fmt: fmtDet, html: true, aria: (v) => `detuning ${v.toFixed(2)} kappa`, get: () => st.det, set: (v) => { st.det = v; } }, sched),
      bindSeg(vdis, q(vis, "#vs26-y"), () => st.ylog, (v) => { st.ylog = v as "lin" | "log"; }, () => paint()),
      bindRange(vdis, q(vis, "#vs26-mu"), q(vis, "#vs26-mu-o"), { read: (s) => s, write: (v) => v, fmt: fmtMu, aria: (v) => `supermode splitting ${v.toFixed(1)} gigahertz`, get: () => st.mu2, set: (v) => { st.mu2 = v; } }, sched),
    ];
    const repaint = (): void => { parts.forEach((f) => f()); recompute(); paint(); };
    repaint();
    return { repaint, dispose: vdis.run };
  });

  dis.add(onUi(() => { if (!isVisual()) syncTech(); }));
  if (!isVisual()) syncTech(); else tParts.forEach((f) => f());
  return () => { offVis(); dis.run(); };
}
