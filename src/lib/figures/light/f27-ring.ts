// Chapter 2.7, ring: in-plane TE index around a ring in the bulk approximation (manuscript 2.7 L2, mode
// confinement ignored). x-cut: 1/n(phi)^2 = cos^2(phi)/n_o^2 + sin^2(phi)/n_e^2 (ellipsoid.ts xcutRingIndex), phi measured
// from crystal z in the film plane; z-cut TE: n_o in every in-plane direction. Indices: Zelmon et al. 1997 congruent LN,
// 21 C (sellmeier.ts, ZELMON_CLN_O/E, valid 0.4 to 5.0 um).
// TECH: polar plot of n(phi) in the crystal frame. VISUAL: the ring on the wafer with its crystal axes and an index band
// around the circumference; the slider rotates the wafer under a probe fixed at the top of the ring, so the angle between
// the light at the probe and crystal z equals the wafer rotation, and the band (period 180 deg) turns with the crystal.
// Both variants share RING; strings are deterministic so the server renders the default state.
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O } from "$lib/physics/constants.ts";
import { xcutRingIndex } from "$lib/physics/ellipsoid.ts";
import { pad } from "../fmt.ts";
import { Disposer, need, onUi, q } from "../dom.ts";
import { c, niceStep } from "./plot.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import type { Part } from "../visual/lifecycle.ts";

export type Cut = "x" | "z";
export interface RingState { lam: number; phi: number; cut: Cut }
/** Shared state of both variants: wavelength (um), angle phi (deg) between propagation and crystal z, wafer cut. */
export const RING: RingState = { lam: 1.55, phi: 30, cut: "x" };

const DEG = Math.PI / 180;
export const indices = (lam: number): { no: number; ne: number } => ({ no: refractiveIndex(ZELMON_CLN_O, lam), ne: refractiveIndex(ZELMON_CLN_E, lam) });
/** In-plane TE index at angle phi (deg) from crystal z. */
export function nRing(s: RingState, phiDeg: number): number {
  const { no, ne } = indices(s.lam);
  return s.cut === "z" ? no : xcutRingIndex(phiDeg * DEG, no, ne);
}

// ---------- readouts ----------
export interface RingRo { n: string; no: string; ne: string; dn: string; phi: string; lam: string }
export function ringRo(s: RingState): RingRo {
  const { no, ne } = indices(s.lam);
  return {
    n: nRing(s, s.phi).toFixed(4),
    no: no.toFixed(4),
    ne: ne.toFixed(4),
    dn: (s.cut === "z" ? 0 : no - ne).toFixed(4),
    phi: pad(`${s.phi.toFixed(0)}°`, 4),
    lam: `${s.lam.toFixed(2)} µm`,
  };
}
export const fmtPhi = (v: number): string => pad(`${v.toFixed(0)}°`, 4);
export const fmtLam = (v: number): string => `${v.toFixed(2)} µm`;

// ---------- TECH: polar plot ----------
const PC = 190, R0 = 28, R1 = 150;
function radial(s: RingState): { lo: number; hi: number; st: number } {
  const { no, ne } = indices(s.lam);
  const lo = Math.floor((ne - 0.004) * 100) / 100, hi = Math.ceil((no + 0.004) * 100) / 100;
  return { lo, hi, st: niceStep(hi - lo, 4) };
}
export function ringPolarSVG(s: RingState): string {
  const { lo, hi, st } = radial(s);
  const { no, ne } = indices(s.lam);
  const R = (n: number): number => R0 + ((n - lo) / (hi - lo)) * (R1 - R0);
  const P = (n: number, a: number): string => `${c(PC + R(n) * Math.cos(a * DEG))} ${c(PC - R(n) * Math.sin(a * DEG))}`;
  let g = "";
  for (let a = 0; a < 360; a += 30) g += `<line class="gl" x1="${c(PC + R0 * Math.cos(a * DEG))}" y1="${c(PC - R0 * Math.sin(a * DEG))}" x2="${c(PC + R1 * Math.cos(a * DEG))}" y2="${c(PC - R1 * Math.sin(a * DEG))}"/>`;
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) {
    g += `<circle class="gl" cx="${PC}" cy="${PC}" r="${c(R(v))}" fill="none"/>`;
    const a = 112 * DEG;
    g += `<text class="tk" x="${c(PC + R(v) * Math.cos(a) - 3)}" y="${c(PC - R(v) * Math.sin(a) - 3)}" text-anchor="end">${v.toFixed(2)}</text>`;
  }
  g += `<circle class="fr" cx="${PC}" cy="${PC}" r="${R0}" fill="none"/><circle class="fr" cx="${PC}" cy="${PC}" r="${R1}" fill="none"/>`;
  // reference circles n_o, n_e
  const refs = `<circle class="s3" cx="${PC}" cy="${PC}" r="${c(R(no))}" fill="none"/><circle class="s6" cx="${PC}" cy="${PC}" r="${c(R(ne))}" fill="none"/>`;
  let d = "";
  for (let i = 0; i <= 360; i += 2) d += `${i ? "L" : "M"}${P(nRing(s, i), i)}`;
  const n = nRing(s, s.phi);
  const m = P(n, s.phi).split(" ");
  const ax = `<line class="ax" x1="${PC - R1 - 8}" y1="${PC}" x2="${PC + R1 + 8}" y2="${PC}"/><line class="ax" x1="${PC}" y1="${PC + R1 + 8}" x2="${PC}" y2="${PC - R1 - 8}"/>`
    + `<text class="al" x="${PC + R1 + 12}" y="${PC + 4}">${s.cut === "z" ? "x" : "z (c)"}</text><text class="al" x="${PC + 6}" y="${PC - R1 - 10}">y</text>`
    + `<text class="tk" x="${PC + R1 * 0.72}" y="${PC - R1 * 0.72 - 4}">φ</text>`;
  const cur = `<line class="cur" x1="${PC}" y1="${PC}" x2="${m[0]}" y2="${m[1]}"/><rect class="mk" x="${c(+m[0] - 3.5)}" y="${c(+m[1] - 3.5)}" width="7" height="7"/>`;
  return `${g}${refs}${ax}<path class="s1" d="${d}Z"/>${cur}`;
}

// ---------- VISUAL: ring on the wafer ----------
const W = 560, WC = 280, WR = 236, RR = 150, BW = 26;
/** fill-opacity of the band for index n between n_e (0.10) and n_o (1). */
/** Opaque band color: LN tint mixed into the wafer surface (no seams between overlapping segments). */
const mix = (u: number): string => `color-mix(in srgb, var(--v-ln) ${(u * 100).toFixed(1)}%, var(--v-ink2))`;
const bandOp = (n: number, no: number, ne: number): number => 0.1 + 0.9 * Math.min(1, Math.max(0, (n - ne) / (no - ne)));
export function ringWaferSVG(s: RingState): string {
  const { no, ne } = indices(s.lam);
  const rot = s.phi; // wafer rotation = angle between the light at the probe (moving along -x lab at the top) and z
  // band in the wafer frame: segment at wafer-frame position angle t (CCW from crystal-frame +horizontal axis); CCW
  // propagation there points along t + 90 deg; angle to the in-plane reference axis (z for x-cut) = t + 90.
  let band = "";
  const N = 120, r0 = RR - BW / 2, r1 = RR + BW / 2;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * 360, a1 = ((i + 1) / N) * 360 + 0.8, am = (a0 + a1 - 0.8) / 2;
    const n = s.cut === "z" ? no : xcutRingIndex((am + 90) * DEG, no, ne);
    const p = (r: number, a: number): string => `${c(WC + r * Math.cos(a * DEG))} ${c(WC - r * Math.sin(a * DEG))}`;
    band += `<path d="M${p(r0, a0)}L${p(r1, a0)}A${r1} ${r1} 0 0 0 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 1 ${p(r0, a0)}Z" style="fill:${mix(bandOp(n, no, ne))}"/>`;
  }
  const axA = s.cut === "z" ? "x" : "c (z)", axB = "y", axN = s.cut === "z" ? "c (z)" : "x";
  const arrow = (x2: number, y2: number, cls: string): string => {
    const L = Math.hypot(x2 - WC, y2 - WC), ux = (x2 - WC) / L, uy = (y2 - WC) / L;
    const h = 14, w = 6;
    return `<line class="${cls}" x1="${WC}" y1="${WC}" x2="${c(x2 - ux * h)}" y2="${c(y2 - uy * h)}"/><path class="${cls}h" d="M${c(x2)} ${c(y2)}L${c(x2 - ux * h - uy * w)} ${c(y2 - uy * h + ux * w)}L${c(x2 - ux * h + uy * w)} ${c(y2 - uy * h - ux * w)}Z"/>`;
  };
  const AL = 112;
  const wafer = `<g transform="rotate(${c(-rot)} ${WC} ${WC})">`
    + `<circle cx="${WC}" cy="${WC}" r="${WR}" class="wf"/>`
    + `<circle cx="${WC}" cy="${WC}" r="${c(r0 - 1)}" class="rg"/><circle cx="${WC}" cy="${WC}" r="${c(r1 + 1)}" class="rg"/>${band}`
    + arrow(WC + AL, WC, "axc") + arrow(WC, WC - AL, "axy")
    + `<text class="axl" x="${WC + AL + 8}" y="${WC + 5}" transform="rotate(${c(rot)} ${WC + AL + 8} ${WC})">${axA}</text>`
    + `<text class="axl" x="${WC - 6}" y="${WC - AL - 10}" transform="rotate(${c(rot)} ${WC - 6} ${WC - AL - 14})" text-anchor="end">${axB}</text>`
    + `<circle cx="${WC}" cy="${WC}" r="7" class="dotn"/><circle cx="${WC}" cy="${WC}" r="2" class="dotc"/>`
    + `<text class="axl" x="${WC + 12}" y="${WC + 22}" transform="rotate(${c(rot)} ${WC + 12} ${WC + 18})">${axN}</text>`
    + `</g>`;
  // probe fixed in the lab at the top of the ring; light circulates counterclockwise (moves toward -x at the top)
  const py = WC - RR;
  const probe = `<path class="pr" d="M${WC} ${py - 11}L${WC + 11} ${py}L${WC} ${py + 11}L${WC - 11} ${py}Z"/>`
    + `<path class="dir" d="M${WC + 46} ${py - 30}H${WC - 40}"/><path class="dirh" d="M${WC - 50} ${py - 30}l12 -6v12z"/>`
    + `<text class="pl" x="${WC + 54}" y="${py - 25}">probe</text>`;
  // legend bar n_e -> n_o
  const LY = 590, LX0 = 110, LX1 = 450;
  let lg = "";
  for (let i = 0; i < 40; i++) lg += `<rect x="${c(LX0 + (i / 40) * (LX1 - LX0))}" y="${LY}" width="${c((LX1 - LX0) / 40 + 0.4)}" height="14" style="fill:${mix(0.1 + 0.9 * (i / 39))}"/>`;
  lg += `<rect x="${LX0}" y="${LY}" width="${LX1 - LX0}" height="14" class="lgf"/>`
    + `<text class="lgt" x="${LX0 - 10}" y="${LY + 12}" text-anchor="end">n<tspan baseline-shift="sub" font-size="10">e</tspan> ${ne.toFixed(4)}</text>`
    + `<text class="lgt" x="${LX1 + 10}" y="${LY + 12}">n<tspan baseline-shift="sub" font-size="10">o</tspan> ${no.toFixed(4)}</text>`;
  return `<svg viewBox="0 0 ${W} 630" role="img" aria-label="Ring on a ${s.cut}-cut wafer with crystal axes; band brightness is the in-plane TE index around the ring">${wafer}${probe}${lg}</svg>`;
}

// ---------- mount ----------
function ringSpecs(): { lam: Parameters<typeof bindRange>[3]; phi: Parameters<typeof bindRange>[3] } {
  return {
    lam: { read: (v) => v, write: (v) => v, fmt: fmtLam, aria: (v) => `${v.toFixed(2)} micrometres`, get: () => RING.lam, set: (v) => { RING.lam = v; } },
    phi: { read: (v) => v, write: (v) => v, fmt: fmtPhi, aria: (v) => `${v.toFixed(0)} degrees`, get: () => RING.phi, set: (v) => { RING.phi = v; } },
  };
}
const setRo = (root: ParentNode, pre: string, r: RingRo): void => {
  for (const k of Object.keys(r) as (keyof RingRo)[]) { const el = q(root, `#${pre}-${k}`); if (el) el.textContent = r[k]; }
};

/** TECH ring panel (always mounted). */
export function mountRingTech(root: HTMLElement): () => void {
  const dis = new Disposer();
  const svg = need(root, "#f27-polar"), sp = ringSpecs();
  const paint = (): void => { svg.innerHTML = ringPolarSVG(RING); setRo(root, "f27-r", ringRo(RING)); };
  const syncs = [
    bindRange(dis, q(root, "#f27-r-lam-in"), q(root, "#f27-r-lam-o"), sp.lam, paint),
    bindRange(dis, q(root, "#f27-r-phi-in"), q(root, "#f27-r-phi-o"), sp.phi, paint),
    bindSeg(dis, q(root, "#f27-r-cut"), () => RING.cut, (v) => { RING.cut = v === "z" ? "z" : "x"; }, paint),
  ];
  const sync = (): void => { syncs.forEach((f) => f()); paint(); };
  dis.add(onUi(sync));
  sync();
  return dis.run;
}

/** VISUAL ring on the wafer (whenVisual). */
export function initRingVisual(root: HTMLElement): Part {
  const dis = new Disposer();
  const stage = need(root, "#f27-wafer"), sp = ringSpecs();
  const paint = (): void => { stage.innerHTML = ringWaferSVG(RING); setRo(root, "f27-vr", ringRo(RING)); };
  const syncs = [
    bindRange(dis, q(root, "#f27-vr-lam-in"), q(root, "#f27-vr-lam-o"), sp.lam, paint),
    bindRange(dis, q(root, "#f27-vr-phi-in"), q(root, "#f27-vr-phi-o"), sp.phi, paint),
    bindSeg(dis, q(root, "#f27-vr-cut"), () => RING.cut, (v) => { RING.cut = v === "z" ? "z" : "x"; }, paint),
  ];
  const repaint = (): void => { syncs.forEach((f) => f()); paint(); };
  repaint();
  return { repaint, dispose: dis.run };
}

