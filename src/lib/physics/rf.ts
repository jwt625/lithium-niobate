// RF electrode terms for traveling-wave LN modulators: quasi-static coplanar waveguide (CPW) and coplanar strips (CPS)
// by conformal mapping and partial capacitance, anisotropic layers, quasi-TEM line constants, atlas-style loss inputs,
// and an independent numerical check of the traveling-wave EO response in modulator.ts.
//
// Sources and status
// - CPW conformal-mapping formulas: Qucs Technical Papers, "Coplanar waveguides", Eqs. (12.2)-(12.13), read 2026-10-25
//   at https://qucs.sourceforge.net/tech/node86.html (which credits K.C. Gupta, R. Garg, I. Bahl, P. Bhartia,
//   Microstrip Lines and Slotlines, 2nd ed., Artech House (1996), pp. 375 ff.). Used: C_d = 2 eps0 eps_r K(k1)/K'(k1),
//   C_a = 2 eps0 K(k1)/K'(k1), k1 = W/(W + 2s) (Eqs. 12.2-12.3); eps_re = (eps_r + 1)/2 (12.6); Z = 30 pi K'(k1)/
//   (sqrt(eps_re) K(k1)) (12.7); finite substrate eps_re = 1 + (eps_r - 1)/2 K(k2) K'(k1)/(K'(k2) K(k1)) with
//   k2 = sinh(pi W/4h)/sinh(pi (W + 2s)/4h) (12.8-12.9); Hilberg approximations for K/K' (12.4-12.5, used only in tests).
//   Qucs symbols: W = centre strip width, s = gap. Here: S_m = centre strip width, W_m = gap.
// - Multilayer partial capacitance: superposition of the single-layer partial capacitances of Eq. (12.8), each layer
//   contributing (eps_i - eps_{i+1}) times the capacitance of a layer of depth H_i (cumulative). Status: derived. It is
//   exact for one layer by construction (reduces to Eq. 12.8) and approximate otherwise (notably when a lower layer has
//   a higher permittivity, e.g. Si under SiO2). electrostatics.test.ts measures its error against the finite-difference
//   solver for the LN/SiO2/Si stack.
// - Coplanar strips: air capacitance from Babinet/Booker duality with the CPW in air (Z_CPW Z_CPS = eta0^2/4), giving
//   Z_CPS = 120 pi K(k)/(sqrt(eps_re) K'(k)), k = S/(S + 2W), S = gap, W = strip width, eps_re = (eps_r + 1)/2 on a
//   half-space. Status: derived; checked against the finite-difference solver (rf.test.ts). No finite-layer CPS formula
//   was verified: `coplanarLine` refuses layered CPS; use `coplanarLineFD`.
// - Accuracy of the partial-capacitance CPW model against the finite-difference route (regression snapshot, not external data) (S = 10 um, W = 5 um,
//   rf.test.ts): half-space (isotropic or uniaxial) exact to < 1e-4 in eps_eff; one 3 um eps 10 layer on air: Eq. (12.8)
//   gives 3.256 vs 3.345 (-2.7%); x-cut LN 0.6 um / SiO2 4.7 um / Si 500 um: 5.368 vs 4.920 (+9.1%). For TFLN stacks use
//   `coplanarLineFD` (eps_eff = C/C_air on one grid, so the edge-singularity discretization error cancels).
// - Uniaxial layers (eps_x lateral, eps_z vertical): the coordinate scaling z' = z sqrt(eps_x/eps_z) maps the anisotropic
//   Laplace equation to an isotropic one with eps = sqrt(eps_x eps_z) and thickness h sqrt(eps_x/eps_z); potential and
//   normal D stay continuous at interfaces, so the map is exact for layered stacks. Status: derived (verified in tests by
//   the finite-difference solver, which uses eps_x and eps_z directly).
// - Quasi-TEM relations n_RF = c sqrt(L' C'), Z0 = sqrt(L'/C'), L' = 1/(c^2 C'_air): standard transmission-line theory.
//
// Chung, Chang, Adler, IEEE JQE 27, 608 (1991), doi:10.1109/3.81370: NOT READ. The full text is closed access
// (Semantic Scholar record: openAccessPdf status CLOSED, abstract elided by the publisher; IEEE Xplore page not
// retrievable, 2026-10-25). No equation of that paper is reproduced or claimed here. Instead, `twResponseNumeric` solves
// the same physical model by an independent route (boundary-value solution of the telegrapher line for V+ and V-, then
// composite Simpson quadrature of V(z) exp(j w n_g z / c)) so the closed form `twResponse` in modulator.ts can be
// checked against it; the matched limits follow Alferness, IEEE TMTT 30, 1121 (1982) as listed in R11 S6.
//
// Electrodes are zero-thickness, perfectly conducting; conductor loss is an input (atlas convention), not computed.
import { C0, EPS0, EPS_S_KUSHIBIKI1999 } from "./constants.ts";
import type { Dielectric3m, Provenance } from "./constants.ts";
import { twResponse } from "./modulator.ts";
import { capacitancePerLength, solveStack2D } from "./electrostatics.ts";
import type { StackLayer } from "./electrostatics.ts";
import type { TWParams } from "./modulator.ts";

// ---------------------------------------------------------------------------------------------
// Complete elliptic integral of the first kind (arithmetic-geometric mean)
// ---------------------------------------------------------------------------------------------
/** AGM(a, b) to machine precision. */
export function agm(a: number, b: number): number {
  for (let i = 0; i < 64; i++) {
    const an = 0.5 * (a + b);
    const bn = Math.sqrt(a * b);
    if (Math.abs(an - bn) <= 1e-16 * an) return an;
    a = an;
    b = bn;
  }
  return 0.5 * (a + b);
}
/** K(k) = pi / (2 AGM(1, k')), modulus k in [0, 1). Pass kp = k' when it is known more accurately than sqrt(1 - k^2). */
export function ellipticK(k: number, kp?: number): number {
  const kc = kp ?? Math.sqrt((1 - k) * (1 + k));
  if (!(kc > 0)) return Infinity;
  return Math.PI / (2 * agm(1, kc));
}
/** K(k)/K'(k) with K'(k) = K(k'), k' = sqrt(1 - k^2); accurate for k near 0 and near 1. */
export function kRatio(k: number): number {
  const kp = Math.sqrt((1 - k) * (1 + k));
  return ellipticK(k, kp) / ellipticK(kp, k);
}
/** Hilberg approximation of K(k)/K'(k), Qucs Eqs. (12.4)-(12.5); test reference only. */
export function kRatioHilberg(k: number): number {
  const kp = Math.sqrt((1 - k) * (1 + k));
  if (k <= Math.SQRT1_2) {
    const s = Math.sqrt(kp);
    return Math.PI / Math.log((2 * (1 + s)) / (1 - s));
  }
  const s = Math.sqrt(k);
  return Math.log((2 * (1 + s)) / (1 - s)) / Math.PI;
}

// ---------------------------------------------------------------------------------------------
// Layers
// ---------------------------------------------------------------------------------------------
/** Dielectric layer below the electrode plane. thickness_m = Infinity for a half-space. eps_x: lateral (across the gap),
 *  eps_z: vertical (normal to the wafer). */
export interface RFLayer {
  name?: string;
  thickness_m: number;
  epsX: number;
  epsZ: number;
  prov?: Provenance;
}

/** Template permittivities for the non-LN layers (no SiO2 or Si RF permittivity is held in data/ or constants.ts). */
export const SIO2_TEMPLATE: { epsX: number; epsZ: number; prov: Provenance } = {
  epsX: 3.9,
  epsZ: 3.9,
  prov: { source: "r11", status: "template", note: "thermal SiO2 relative permittivity 3.9, the customary design value; no SiO2 entry in data/; replace when API holds one" },
};
export const SI_TEMPLATE: { epsX: number; epsZ: number; prov: Provenance } = {
  epsX: 11.7,
  epsZ: 11.7,
  prov: { source: "r11", status: "template", note: "high-resistivity Si treated as a lossless dielectric, eps 11.7 (customary design value); no Si entry in data/" },
};

export type LNCutField = "x-cut, field along z" | "x-cut, field along y" | "z-cut" | "y-cut, field along z" | "y-cut, field along x";
/** LN layer for a wafer cut and lateral field direction: eps_x = permittivity along the lateral field, eps_z = along the
 *  wafer normal. Default dielectric set: kushibiki1999 clamped eps^S (template choice of boundary condition: GHz drive
 *  is assumed to lie above the piezoelectric resonances of the die; pass EPS_T_KUSHIBIKI1999 for the free values). */
export function lnLayer(cut: LNCutField, thickness_m: number, eps: Dielectric3m = EPS_S_KUSHIBIKI1999): RFLayer {
  const e11 = eps.eps11;
  const e33 = eps.eps33;
  switch (cut) {
    case "x-cut, field along z":
      return { name: "LN", thickness_m, epsX: e33, epsZ: e11, prov: eps.prov };
    case "x-cut, field along y":
      return { name: "LN", thickness_m, epsX: e11, epsZ: e11, prov: eps.prov };
    case "z-cut":
      return { name: "LN", thickness_m, epsX: e11, epsZ: e33, prov: eps.prov };
    case "y-cut, field along z":
      return { name: "LN", thickness_m, epsX: e33, epsZ: e11, prov: eps.prov };
    case "y-cut, field along x":
      return { name: "LN", thickness_m, epsX: e11, epsZ: e11, prov: eps.prov };
  }
}

/** Isotropic equivalent of a uniaxial layer: eps = sqrt(eps_x eps_z), thickness scaled by sqrt(eps_x/eps_z). */
export function isotropicEquivalent(l: RFLayer): { eps: number; thickness_m: number } {
  return { eps: Math.sqrt(l.epsX * l.epsZ), thickness_m: l.thickness_m * Math.sqrt(l.epsX / l.epsZ) };
}

/** sinh(a)/sinh(b) for a <= b, overflow-free. */
function sinhRatio(a: number, b: number): number {
  if (b < 20) return Math.sinh(a) / Math.sinh(b);
  return Math.exp(a - b) * ((1 - Math.exp(-2 * a)) / (1 - Math.exp(-2 * b)));
}

// ---------------------------------------------------------------------------------------------
// Coplanar lines
// ---------------------------------------------------------------------------------------------
export type CoplanarKind = "cpw" | "cps";
export interface CoplanarInput {
  kind: CoplanarKind;
  /** CPW: centre strip width; CPS: gap between the two strips (m) */
  S_m: number;
  /** CPW: gap to each ground; CPS: width of each strip (m) */
  W_m: number;
  /** layers below the electrode plane, top to bottom; the last may be a half-space (thickness Infinity); air below a
   *  finite stack */
  layers: RFLayer[];
  /** uniform medium above the electrodes (default air) */
  coverEps?: number;
}
export interface CoplanarResult {
  C_F_per_m: number;
  Cair_F_per_m: number;
  epsEff: number;
  nRF: number;
  Z0_ohm: number;
  L_H_per_m: number;
  /** modulus of the air (infinite-depth) problem */
  k0: number;
  /** per-layer moduli k_i (cumulative scaled depth H_i) and partial-capacitance terms (F/m) */
  k: number[];
  partial_F_per_m: number[];
}

/** Quasi-static CPW / CPS line constants by conformal mapping and partial capacitance (see header for sources). */
export function coplanarLine(inp: CoplanarInput): CoplanarResult {
  const { S_m: S, W_m: W } = inp;
  if (!(S > 0 && W > 0)) throw new RangeError("S and W must be positive");
  const k0 = S / (S + 2 * W);
  if (inp.kind === "cps" && inp.layers.some((l) => Number.isFinite(l.thickness_m)))
    throw new RangeError("coplanarLine: layered CPS has no verified closed form here; use coplanarLineFD");
  const ratio = (k: number) => (inp.kind === "cpw" ? kRatio(k) : 1 / kRatio(k));
  const P = inp.kind === "cpw" ? 2 * EPS0 : EPS0 / 2; // capacitance prefactor per half-space
  const R0 = ratio(k0);
  const cover = inp.coverEps ?? 1;
  const eq = inp.layers.map(isotropicEquivalent);
  let H = 0;
  const ks: number[] = [];
  const parts: number[] = [];
  let C = P * cover * R0;
  for (let i = 0; i < eq.length; i++) {
    H += eq[i].thickness_m;
    const epsBelow = i + 1 < eq.length ? eq[i + 1].eps : 1;
    const ki = Number.isFinite(H) ? sinhRatio((Math.PI * S) / (4 * H), (Math.PI * (S + 2 * W)) / (4 * H)) : k0;
    const term = Number.isFinite(H) ? P * (eq[i].eps - epsBelow) * ratio(ki) : P * eq[i].eps * R0;
    ks.push(ki);
    parts.push(term);
    C += term;
    if (!Number.isFinite(H)) break;
  }
  if (Number.isFinite(H)) C += P * 1 * R0; // air half-space below a finite stack
  const Cair = 2 * P * R0;
  const epsEff = C / Cair;
  const nRF = Math.sqrt(epsEff);
  const Lp = 1 / (C0 * C0 * Cair);
  const Z0 = Math.sqrt(Lp / C);
  return { C_F_per_m: C, Cair_F_per_m: Cair, epsEff, nRF, Z0_ohm: Z0, L_H_per_m: Lp, k0, k: ks, partial_F_per_m: parts };
}

/** Line constants from the finite-difference solver (electrostatics.ts): eps_eff = C/C_air computed on the same grid
 *  (layers and all-air), C_air from the exact conformal value, Z0 = 1/(c sqrt(eps_eff) C_air), n_RF = sqrt(eps_eff).
 *  Lateral extent and depth of the domain: `extent` x (S/2 + W) on each side (default 60), Neumann outer walls, finite
 *  stacks have air below. Grid: hMin = min(S, W)/hDiv (default 200). Returns the coplanarLine fields plus solver stats. */
export function coplanarLineFD(inp: CoplanarInput, o: { extent?: number; hDiv?: number; growth?: number } = {}): CoplanarResult & { iterations: number; nodes: number } {
  const { S_m: S, W_m: W } = inp;
  const X = (o.extent ?? 60) * (S / 2 + W);
  const hMin = Math.min(S, W) / (o.hDiv ?? 200);
  const L: StackLayer[] = [];
  let depth = 0;
  for (const l of inp.layers) {
    const t = Number.isFinite(l.thickness_m) ? l.thickness_m : Math.max(X - depth, X / 2);
    L.push({ thickness_m: t, epsX: l.epsX, epsZ: l.epsZ });
    depth += t;
    if (!Number.isFinite(l.thickness_m)) break;
  }
  if (inp.layers.every((l) => Number.isFinite(l.thickness_m))) {
    L.push({ thickness_m: Math.max(X - depth, X / 2), epsX: 1, epsZ: 1 });
  }
  const cpw = inp.kind === "cpw";
  const electrodes = cpw
    ? [{ x0_m: 0, x1_m: S / 2, V: 1 }, { x0_m: S / 2 + W, x1_m: X, V: 0 }]
    : [{ x0_m: S / 2, x1_m: S / 2 + W, V: 1 }, { x0_m: -S / 2 - W, x1_m: -S / 2, V: 0 }];
  const cover = { epsX: inp.coverEps ?? 1, epsZ: inp.coverEps ?? 1 };
  const base = { coverHeight_m: X, xMin_m: cpw ? 0 : -X, xMax_m: X, electrodes, lateral: "neumann" as const, bottom: "neumann" as const, hMin_m: hMin, hMax_m: X / 20, growth: o.growth ?? 1.15 };
  const r = solveStack2D({ ...base, layers: L, cover });
  const ra = solveStack2D({ ...base, layers: L.map((l) => ({ ...l, epsX: 1, epsZ: 1 })) });
  const epsEff = capacitancePerLength(r, 1) / capacitancePerLength(ra, 1);
  const k0 = S / (S + 2 * W);
  const Cair = cpw ? 4 * EPS0 * kRatio(k0) : EPS0 / kRatio(k0);
  const C = epsEff * Cair;
  const Lp = 1 / (C0 * C0 * Cair);
  return { C_F_per_m: C, Cair_F_per_m: Cair, epsEff, nRF: Math.sqrt(epsEff), Z0_ohm: Math.sqrt(Lp / C), L_H_per_m: Lp, k0, k: [], partial_F_per_m: [], iterations: r.iterations + ra.iterations, nodes: r.nx * r.nz };
}

/** Quasi-TEM line constants from per-length C and L: n = c sqrt(L C), Z0 = sqrt(L / C). */
export const quasiTEM = (C_F_per_m: number, L_H_per_m: number): { nRF: number; Z0_ohm: number } => ({
  nRF: C0 * Math.sqrt(L_H_per_m * C_F_per_m),
  Z0_ohm: Math.sqrt(L_H_per_m / C_F_per_m),
});

// ---------------------------------------------------------------------------------------------
// Atlas-style RF loss input
// ---------------------------------------------------------------------------------------------
/** dB (power or amplitude ratio, same number) per cm -> field attenuation Np/m. */
export const dbPerCmToNpPerM = (dB_per_cm: number): number => (dB_per_cm * 100) / (20 / Math.LN10);
/** Field attenuation alpha(f) = alphaRef (f/fRef)^exponent, alphaRef from dB/cm at fRef (GHz). */
export function rfLossNpPerM(f_GHz: number, lossRef_dB_per_cm: number, fRef_GHz: number, exponent: number): number {
  return dbPerCmToNpPerM(lossRef_dB_per_cm) * (f_GHz / fRef_GHz) ** exponent;
}
/** Map an atlas-style loss (dB/cm at fRef, exponent 0.5 or 1) onto the TWParams loss fields of modulator.ts. */
export function twParamsFromLoss(p: {
  L_m: number;
  nRF: number;
  ng: number;
  lossRef_dB_per_cm: number;
  fRef_GHz: number;
  exponent: 0.5 | 1;
  Z0?: number;
  Zs?: number;
  ZL?: number;
}): TWParams {
  const aRef = dbPerCmToNpPerM(p.lossRef_dB_per_cm);
  const base: TWParams = { L_m: p.L_m, nRF: p.nRF, ng: p.ng, Z0: p.Z0, Zs: p.Zs, ZL: p.ZL };
  if (p.exponent === 0.5) return { ...base, alpha0_Np_per_m_sqrtGHz: aRef / Math.sqrt(p.fRef_GHz) };
  return { ...base, alphaD_Np_per_m_GHz: aRef / p.fRef_GHz };
}

// ---------------------------------------------------------------------------------------------
// Independent check of the traveling-wave response (no closed-form integrals)
// ---------------------------------------------------------------------------------------------
type C = [number, number];
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cexp = (a: C): C => [Math.exp(a[0]) * Math.cos(a[1]), Math.exp(a[0]) * Math.sin(a[1])];
const cscale = (a: C, s: number): C => [a[0] * s, a[1] * s];

/** Line voltage amplitudes V+ and V- (V(z) = V+ e^{-gz} + V- e^{gz}) for source Vs = 1 with impedance Zs at z = 0 and
 *  load ZL at z = L, from the 2x2 boundary-value problem V(0) + Zs I(0) = 1, V(L) = ZL I(L), I = (V+ e^{-gz} - V- e^{gz})/Z0. */
export function lineAmplitudes(f_Hz: number, p: TWParams): { Vp: C; Vm: C; g: C } {
  const fG = f_Hz / 1e9;
  const alpha = (p.alpha0_Np_per_m_sqrtGHz ?? 0) * Math.sqrt(fG) + (p.alphaD_Np_per_m_GHz ?? 0) * fG;
  const g: C = [alpha, (2 * Math.PI * f_Hz * p.nRF) / C0];
  const Z0 = p.Z0 ?? 50;
  const Zs = p.Zs ?? Z0;
  const ZL = p.ZL ?? Z0;
  const eM = cexp(cscale(g, -p.L_m)); // e^{-gL}
  const eP = cexp(cscale(g, p.L_m)); // e^{+gL}
  // row 1: V+ (1 + Zs/Z0) + V- (1 - Zs/Z0) = 1
  const a11: C = [1 + Zs / Z0, 0];
  const a12: C = [1 - Zs / Z0, 0];
  // row 2: V+ e^{-gL} (1 - ZL/Z0) + V- e^{gL} (1 + ZL/Z0) = 0
  const a21 = cscale(eM, 1 - ZL / Z0);
  const a22 = cscale(eP, 1 + ZL / Z0);
  const det = csub(cmul(a11, a22), cmul(a12, a21));
  const Vp = cdiv(a22, det);
  const Vm = cdiv(cscale(a21, -1), det);
  return { Vp, Vm, g };
}

/** H(f) by quadrature: Phi = int_0^L V(z) e^{j w n_g z / c} dz (composite Simpson, n even intervals), normalized to the
 *  DC value L ZL/(Zs + ZL). Independent of the closed-form integrals in modulator.ts `twResponse`. Returns [re, im]. */
export function twResponseNumeric(f_Hz: number, p: TWParams, n = 2000): [number, number] {
  if (f_Hz === 0) return [1, 0];
  const N = n % 2 === 0 ? n : n + 1;
  const { Vp, Vm, g } = lineAmplitudes(f_Hz, p);
  const bo = (2 * Math.PI * f_Hz * p.ng) / C0;
  const h = p.L_m / N;
  let s: C = [0, 0];
  for (let i = 0; i <= N; i++) {
    const z = i * h;
    const V = cadd(cmul(Vp, cexp(cscale(g, -z))), cmul(Vm, cexp(cscale(g, z))));
    const w = i === 0 || i === N ? 1 : i % 2 === 1 ? 4 : 2;
    s = cadd(s, cscale(cmul(V, [Math.cos(bo * z), Math.sin(bo * z)]), w));
  }
  const Phi = cscale(s, h / 3);
  const Z0 = p.Z0 ?? 50;
  const Zs = p.Zs ?? Z0;
  const ZL = p.ZL ?? Z0;
  const norm = (p.L_m * ZL) / (ZL + Zs);
  return [Phi[0] / norm, Phi[1] / norm];
}

/** Re-export for figure code that wants both forms side by side. */
export const twResponseClosed = twResponse;

/** alpha L (Np) where the velocity-matched lossy response (1 - e^{-a})/a falls to 1/sqrt(2): 0.7384 Np (6.414 dB total). */
export const LOSS_3DB_ALPHA_L: number = (() => {
  let lo = 0.1;
  let hi = 2;
  for (let i = 0; i < 200; i++) {
    const m = 0.5 * (lo + hi);
    if ((1 - Math.exp(-m)) / m > Math.SQRT1_2) lo = m;
    else hi = m;
  }
  return 0.5 * (lo + hi);
})();

/** Loss-only 3 dB frequency (GHz): total electrode loss alpha(f) L reaches LOSS_3DB_ALPHA_L, alpha = alphaRef (f/fRef)^e. */
export function f3dBLossOnly(L_m: number, lossRef_dB_per_cm: number, fRef_GHz: number, exponent: number): number {
  const aRefL = dbPerCmToNpPerM(lossRef_dB_per_cm) * L_m;
  return fRef_GHz * (LOSS_3DB_ALPHA_L / aRefL) ** (1 / exponent);
}
