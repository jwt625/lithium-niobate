// Pyroelectric charge (fig-04-07, fig-04-11) and DC-drift layer networks (fig-04-08) for chapter 04.
// Pyro (manuscript sec. 4.6 L2): sigma_b = p3 dT; E = -p3 dT / (eps33 eps0) (unscreened isolated plate); V = E d;
// screening E(t) = E0 exp(-t/tau), tau = eps eps0 / sigma. Sign rule: p3 < 0, so cooling (dT < 0) makes the +c face positive
// (weis1985 p. 196; volk2008 p. 2). Drift (sec. 4.7 L2-L3): Maxwell-Wagner two-layer closed form (R11 S8) and the exact
// N-layer series network of drift.ts; Arrhenius sigma(T) = sigma(T0) exp[-(E_a/k_B)(1/T - 1/T0)].
import { EPS0, KB, QE } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { driftModel, layerVoltage } from "./drift.ts";
import type { Layer } from "./drift.ts";

// ---------------------------------------------------------------------------------------------
// Pyroelectric plate
// ---------------------------------------------------------------------------------------------
/** Bound surface charge density on the +c face (C/m^2) = p3 dT. With p3 < 0, cooling gives a positive +c face. */
export const pyroCharge = (p3_C_m2K: number, dT_K: number): number => p3_C_m2K * dT_K;
/** Unscreened field inside an isolated plate (V/m, along +c) = -p3 dT / (eps_r eps0). */
export const pyroField = (p3_C_m2K: number, dT_K: number, epsR: number): number => (-p3_C_m2K * dT_K) / (epsR * EPS0);
/** Voltage across a plate of thickness d (V) = E d (signed: returns E d with E along +c; the potential of the +c face minus the -c face is -E d). */
export const pyroVoltage = (p3_C_m2K: number, dT_K: number, epsR: number, d_m: number): number => pyroField(p3_C_m2K, dT_K, epsR) * d_m;
/** Screening decay of a field by conduction: E0 exp(-t/tau). */
export const screenedDecay = (E0: number, t_s: number, tau_s: number): number => E0 * Math.exp(-t_s / tau_s);

export interface P3Option {
  id: string;
  value: number;
  unit: "C/(m^2 K)";
  conditions: string;
  prov: Provenance;
}
/** p3 options of fig-04-07 (manuscript sec. 4.6 table; data/properties rows pyroelectric-p3/* except popescu2013). */
export const P3_OPTIONS: readonly P3Option[] = [
  { id: "savage1966", value: -4.0e-5, unit: "C/(m^2 K)", conditions: "25 C; measured 25-450 C", prov: { source: "weis1985", status: "P-comp", locator: "Eq. 2, p. 196 (savage1966, reported)" } },
  { id: "schwesyg2011", value: -6.4e-5, unit: "C/(m^2 K)", conditions: "room temperature (Bartholomaus et al. 1994)", prov: { source: "schwesyg2011", status: "S", locator: "Eq. 2.17" } },
  { id: "cti1999", value: -8.3e-5, unit: "C/(m^2 K)", conditions: "CLN 48.38 mol%, 25 C", prov: { source: "cti1999", status: "V" } },
  { id: "popescu2013", value: -9.5e-5, unit: "C/(m^2 K)", conditions: "congruent, interferometric; magnitude about 95 uC/(m^2 K), sign by the weis1985 rule", prov: { source: "popescu2013", status: "reported" } },
];
/** eps33^T of the Warner 1967 set (weis1985 Table 1, P-comp), the value used in the sec. 4.6 derived table. */
export const EPS33T_WARNER: { value: number; prov: Provenance } = { value: 28.7, prov: { source: "weis1985", status: "P-comp", locator: "Table 1, p. 197 (Warner 1967)" } };

// ---------------------------------------------------------------------------------------------
// Layered RC drift
// ---------------------------------------------------------------------------------------------
/** Two-layer Maxwell-Wagner time constant (s) = (C1 + C2)/(G1 + G2) (per-area C, G). */
export const mwTau = (C1: number, G1: number, C2: number, G2: number): number => (C1 + C2) / (G1 + G2);
/** Voltage on layer 1 after a step V at t = 0 (R11 S8): V [G2/(G1+G2) + (C2/(C1+C2) - G2/(G1+G2)) exp(-t/tau)]. */
export function maxwellWagner2(V: number, C1: number, G1: number, C2: number, G2: number, t_s: number): number {
  const r = G2 / (G1 + G2);
  return V * (r + (C2 / (C1 + C2) - r) * Math.exp(-t_s / mwTau(C1, G1, C2, G2)));
}

export interface StackLayer {
  epsR: number;
  sigma: number; // S/m
  thickness_m: number;
  name?: string;
}
const toLayer = (l: StackLayer, i: number): Layer => ({ name: l.name ?? `layer ${i}`, thickness_m: l.thickness_m, eps_r: l.epsR, sigma_S_per_m: l.sigma });
/** Per-area capacitance (F/m^2) and conductance (S/m^2) of a layer. */
export const layerCG = (l: StackLayer): { C: number; G: number } => ({ C: (l.epsR * EPS0) / l.thickness_m, G: l.sigma / l.thickness_m });

/** Step response of a series stack (1-N layers): V_layer[k][i] = voltage on layer k at time t[i] for a step V (exact,
 *  drift.ts partial fractions). Also returns the relaxation time constants (s, ascending). */
export function stackStep(layers: StackLayer[], V: number, t_s: ArrayLike<number>): { V: Float64Array[]; taus: number[] } {
  const m = driftModel(layers.map(toLayer));
  const out = layers.map((_, k) => Float64Array.from({ length: t_s.length }, (_, i) => V * layerVoltage(m, k, t_s[i])));
  return { V: out, taus: m.taus };
}

/** Small-signal transfer V_k / V of layer k (default 0) vs frequency: magnitude and phase (rad), Z_k / sum Z, Z = 1/(G + j w C). */
export function stackResponse(layers: StackLayer[], f_Hz: ArrayLike<number>, k = 0): { mag: Float64Array; phase: Float64Array } {
  const n = f_Hz.length;
  const mag = new Float64Array(n);
  const phase = new Float64Array(n);
  const cg = layers.map(layerCG);
  for (let i = 0; i < n; i++) {
    const w = 2 * Math.PI * f_Hz[i];
    let zr = 0, zi = 0, kr = 0, ki = 0;
    cg.forEach(({ C, G }, j) => {
      const d = G * G + w * w * C * C;
      const r = G / d, im = (-w * C) / d;
      zr += r;
      zi += im;
      if (j === k) {
        kr = r;
        ki = im;
      }
    });
    const dd = zr * zr + zi * zi;
    const hr = (kr * zr + ki * zi) / dd;
    const hi = (ki * zr - kr * zi) / dd;
    mag[i] = Math.hypot(hr, hi);
    phase[i] = Math.atan2(hi, hr);
  }
  return { mag, phase };
}

/** Arrhenius scaling of a conductivity from T0 to T (K): sigma0 exp[-(E_a/k_B)(1/T - 1/T0)]. */
export const arrhenius = (sigma0: number, Ea_eV: number, T_K: number, T0_K: number): number => sigma0 * Math.exp(((-Ea_eV * QE) / KB) * (1 / T_K - 1 / T0_K));

/** Footer motif (template, display only): bias phase phi(t) = span (1 - exp(-t/tau)). Not a device model. */
export const displayDrift = (t_s: number, tau_s = 40, span_rad = Math.PI / 2): number => span_rad * -Math.expm1(-t_s / tau_s);

// ---------------------------------------------------------------------------------------------
// fig-04-08 presets: layer values are templates; TFLN presets tuned so the two-layer tau equals the reported RC fits
// ---------------------------------------------------------------------------------------------
export interface DriftPreset {
  id: string;
  label: string;
  /** layer 0 = LN, layer 1 = partner layer (cladding or buried oxide) */
  layers: [StackLayer, StackLayer];
  targetTau_s?: number;
  prov: Record<string, Provenance>;
}
const LN_EPS = 28; // manuscript sec. 4.7 derived table (eps33 = 28)
const T_LN = 0.6e-6; // template film thickness
const T_OX = 2e-6; // template oxide thickness
const EPS_OX = 3.9; // template SiO2 permittivity (not sourced in held data)
const SIG_BULK = 1e-15; // inside the volk2008 P-comp range 1e-16 to 1e-14 S/m
const tune = (tau: number, which: 0 | 1, other: StackLayer, lnFixed: StackLayer): number => {
  // solve for sigma of the free layer so that (C1 + C2)/(G1 + G2) = tau
  const C1 = layerCG(lnFixed).C, C2 = layerCG(other).C;
  const Gtot = (C1 + C2) / tau;
  const Gfixed = which === 0 ? layerCG(other).G : layerCG(lnFixed).G;
  const t = which === 0 ? lnFixed.thickness_m : other.thickness_m;
  return (Gtot - Gfixed) * t;
};
const TP = (note: string): Provenance => ({ source: "li2026photonics", status: "template", note });
const lnBase: StackLayer = { name: "LN", epsR: LN_EPS, sigma: SIG_BULK, thickness_m: T_LN };
const cladBase: StackLayer = { name: "SiO2 cladding", epsR: EPS_OX, sigma: 0, thickness_m: 1e-6 };
const boxBase: StackLayer = { name: "SiO2 BOX", epsR: EPS_OX, sigma: 1e-18, thickness_m: T_OX };
export const DRIFT_PRESETS: readonly DriftPreset[] = [
  {
    id: "bulk", label: "bulk-like", layers: [lnBase, { ...boxBase }],
    prov: {
      "LN.sigma": { source: "volk2008", status: "template", note: "1e-15 S/m, a point inside the P-comp range 1e-16 to 1e-14 S/m (p. 60)" },
      "LN.epsR": { source: "weis1985", status: "P-comp", note: "28 (figure spec value); the weis1985 spread is 28.1-30, so 28 lies just below it" },
      partner: { source: "r11", status: "template" },
    },
  },
  {
    id: "clad", label: "TFLN clad", targetTau_s: 11.9e-3,
    layers: [lnBase, { ...cladBase, sigma: tune(11.9e-3, 1, cladBase, lnBase) }],
    prov: { tau: { source: "li2026photonics", status: "reported", note: "RC fit 11.9 ms with SiO2 cladding, positive drift" }, layers: TP("cladding sigma tuned to the reported tau; thicknesses and eps template") },
  },
  {
    id: "airclad", label: "TFLN air-clad", targetTau_s: 88.6e-6,
    layers: [{ ...lnBase, sigma: tune(88.6e-6, 0, boxBase, lnBase) }, boxBase],
    prov: { tau: { source: "li2026photonics", status: "reported", note: "RC fit 88.6 us without cladding, negative drift" }, layers: TP("LN effective sigma tuned to the reported tau; thicknesses and eps template") },
  },
];
