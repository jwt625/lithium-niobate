// Photorefraction for chapter 04 figures (fig-04-01 write/erase slab, fig-04-02 1D grating, fig-04-05 GRIIRA chain).
// Reduced band-transport model as written in content/chapters/04-quirks/manuscript.md sec. 4.1 L2:
//   j = j_pv + j_diff + j_drift,  j_pv = k_G alpha I (Glass current, volk2008 Eq. 3.5),
//   j_diff = k_B T mu grad(n_e) = (k_B T / e) grad(sigma_ph)  (sigma_ph = e mu n_e, monopolar electrons),
//   j_drift = sigma E, sigma = sigma_d + sigma_ph, sigma_ph = kappa I.
//   Open-circuit saturation E_pv = k_G alpha I / (sigma_ph + sigma_d) (volk2008 Eq. 3.6);
//   write E(t) = -E_sat (1 - exp(-t/tau)), erase E(t) = E_start exp(-t/tau), tau = eps eps0 / (sigma_ph + sigma_d)
//   (volk2008 Eqs. 3.18-3.19); Delta n = -(1/2) n^3 r E (schwesyg2011 Eq. 2.25);
//   diffusion field E_dif = (k_B T / e) K m sin Kz / (1 + m cos Kz) (volk2008 Eq. 3.9).
// The existing photorefractive.ts keeps its PRParams API; this module adds the SI scalar signatures requested by C04.
// Sign convention: k_G > 0 means j_pv along +c; the direction of j_pv relative to +c is not taken from held sources
// (manuscript sec. 4.1), so figures plot |E| and Delta n_e with the sign the chapter states (decrease in the lit region).
import { EPS0, KB, QE, EO_ZOOK1967_T } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { sinc } from "./phasematching.ts";

/** Dielectric (Maxwell) relaxation time (s): eps_r eps0 / (sigma_d + sigma_ph). */
export const dielectricRelaxationTime = (epsR: number, sigmaDark_S_m: number, sigmaPhoto_S_m = 0): number => (epsR * EPS0) / (sigmaDark_S_m + sigmaPhoto_S_m);
/** Photoconductivity (S/m) = kappa I; kappa in S/m per W/m^2 (= S m / W). */
export const photoconductivity = (kappa_S_m_per_W: number, I_W_m2: number): number => kappa_S_m_per_W * I_W_m2;
/** Open-circuit saturated photovoltaic field magnitude (V/m) = k_G alpha I / (sigma_ph + sigma_d) (volk2008 Eq. 3.6). kG in m/V. */
export const photovoltaicSaturationField = (kG_m_per_V: number, alpha_per_m: number, I_W_m2: number, sigmaDark_S_m: number, sigmaPhoto_S_m: number): number =>
  (kG_m_per_V * alpha_per_m * I_W_m2) / (sigmaPhoto_S_m + sigmaDark_S_m);
/** Writing transient, open circuit, from E = 0: E(t) = -E_sat (1 - exp(-t/tau)) (volk2008 Eq. 3.18). */
export const scFieldWrite = (t_s: number, Esat_V_m: number, tau_s: number): number => -Esat_V_m * -Math.expm1(-t_s / tau_s);
/** Erasure (uniform light or dark) from the field at the start of erasure: E(t) = E_start exp(-t/tau) (volk2008 Eq. 3.19). */
export const scFieldErase = (t_s: number, Estart_V_m: number, tau_s: number): number => Estart_V_m * Math.exp(-t_s / tau_s);
/** Linear EO index change -(1/2) n^3 r E (r in m/V). */
export const pockelsDeltaN = (n: number, r_m_per_V: number, E_V_m: number): number => -0.5 * n ** 3 * r_m_per_V * E_V_m;
/** Diffusion-field amplitude (V/m) of a fringe pattern in the small-modulation limit: (k_B T / e)(2 pi / Lambda) m. */
export const diffusionFieldAmplitude = (Lambda_m: number, T_K: number, m: number): number => ((KB * T_K) / QE) * ((2 * Math.PI) / Lambda_m) * m;
/** Exact steady diffusion field (volk2008 Eq. 3.9), photovoltaic and dark conductivity off: (k_B T/e) K m sin Kz / (1 + m cos Kz). */
export const diffusionField = (z_m: number, Lambda_m: number, T_K: number, m: number): number => {
  const K = (2 * Math.PI) / Lambda_m;
  return ((KB * T_K) / QE) * ((K * m * Math.sin(K * z_m)) / (1 + m * Math.cos(K * z_m)));
};

// ---------------------------------------------------------------------------------------------
// fig-04-01 presets
// ---------------------------------------------------------------------------------------------
export interface SlabPreset {
  id: string;
  label: string;
  kG_m_per_V: number;
  alpha_per_m: number;
  kappa_S_m_per_W: number;
  prov: Record<string, Provenance>;
}
const KG_FE = 2.8e-11; // 2.8e-9 cm/V
const ALPHA_T = 1000; // 10 /cm, template
const KAPPA_T = 1e-14; // S m / W: sigma_ph = 1e-10 S/m at 1e4 W/m^2 (1 W/cm^2), inside the volk2008 p. 59 doped range
const tProv = (note: string): Provenance => ({ source: "volk2008", status: "template", note });
/** Slab presets for fig-04-01. kG(Fe) is P-comp (volk2008 p. 59); alpha and kappa are templates chosen so that
 *  sigma_ph = 1e-10 S/m at 1 W/cm^2, the lower end of the as-grown doped photoconductivity range (volk2008 p. 59, P-comp),
 *  and alpha(Fe) = 10 cm^-1 so the saturated field kG alpha / kappa = 2.8e6 V/m lies inside the 1e6-1e7 V/m range
 *  (volk2008 p. 59, P-comp). MgO: kappa x 100, kG unchanged (bryan1984, reported). */
export const SLAB_PRESETS: readonly SlabPreset[] = [
  {
    id: "fe", label: "LiNbO3:Fe", kG_m_per_V: KG_FE, alpha_per_m: ALPHA_T, kappa_S_m_per_W: KAPPA_T,
    prov: {
      kG: { source: "volk2008", status: "P-comp", locator: "p. 59", note: "2.8e-9 cm/V" },
      alpha: tProv("10 cm^-1: puts kG alpha/kappa = 2.8e6 V/m inside the P-comp 1e6-1e7 V/m range"),
      kappa: tProv("sigma_ph = 1e-10 S/m at 1 W/cm^2 (doped range 1e-10 to 1e-9 S/m, volk2008 p. 59)"),
    },
  },
  {
    id: "cln", label: "congruent undoped", kG_m_per_V: KG_FE, alpha_per_m: 1, kappa_S_m_per_W: KAPPA_T,
    prov: { kG: tProv("Fe value reused; no undoped kG held"), alpha: tProv("0.01 cm^-1 display value"), kappa: tProv("as Fe preset") },
  },
  {
    id: "mgo5", label: "5 mol% MgO", kG_m_per_V: KG_FE, alpha_per_m: 1, kappa_S_m_per_W: 100 * KAPPA_T,
    prov: {
      kG: { source: "bryan1984", status: "reported", note: "Glass current not reduced above threshold (abstract)" },
      alpha: tProv("as congruent preset"),
      kappa: { source: "bryan1984", status: "reported", note: "photoconductivity about 100x the congruent template" },
    },
  },
  {
    id: "nsln", label: "near-stoichiometric", kG_m_per_V: KG_FE, alpha_per_m: 1, kappa_S_m_per_W: KAPPA_T,
    prov: { kG: tProv("no near-SLN kG held"), alpha: tProv("display value"), kappa: tProv("no near-SLN kappa held") },
  },
];
/** Shared material inputs of fig-04-01 (manuscript sec. 4.1 derived table). */
export const SLAB_MATERIAL = {
  eps33: { value: 28, unit: "1", prov: { source: "weis1985", status: "P-comp", note: "28 (figure spec value); weis1985 spread 28.1-30 (R14 sec. 2.7), so 28 lies just below it" } as Provenance },
  ne633: { value: 2.2028, unit: "1", prov: { source: "weis1985", status: "P-comp", locator: "Table 2" } as Provenance },
  r33T_m_per_V: { value: EO_ZOOK1967_T.r33 * 1e-12, unit: "m/V", prov: EO_ZOOK1967_T.prov },
} as const;

export interface SlabState {
  sigmaPh: number;
  Esat: number;
  tauLit: number;
  tauDark: number;
}
/** All fig-04-01 scalars for intensity I (W/m^2) and dark conductivity. */
export function slabState(p: SlabPreset, I_W_m2: number, sigmaDark_S_m: number, epsR: number = SLAB_MATERIAL.eps33.value): SlabState {
  const sigmaPh = photoconductivity(p.kappa_S_m_per_W, I_W_m2);
  return {
    sigmaPh,
    Esat: photovoltaicSaturationField(p.kG_m_per_V, p.alpha_per_m, I_W_m2, sigmaDark_S_m, sigmaPh),
    tauLit: dielectricRelaxationTime(epsR, sigmaDark_S_m, sigmaPh),
    tauDark: dielectricRelaxationTime(epsR, sigmaDark_S_m, 0),
  };
}

// ---------------------------------------------------------------------------------------------
// fig-04-02 1D grating: drift + diffusion + photovoltaic, periodic window
// ---------------------------------------------------------------------------------------------
export interface Grating1DOpts {
  /** grid points over `periods` grating periods */
  N?: number;
  periods?: number;
  Lambda_m: number;
  /** fringe modulation 0 <= m < 1 */
  m: number;
  I0_W_m2: number;
  kG_m_per_V: number;
  alpha_per_m: number;
  kappa_S_m_per_W: number;
  sigmaDark_S_m: number;
  epsR: number;
  T_K: number;
  /** diffusion on/off (default on) */
  diffusion?: boolean;
  /** time step and number of steps; if steps is 0 or omitted the closed-form steady state is returned */
  dt_s?: number;
  steps?: number;
  /** index for Delta n output (default extraordinary at 632.8 nm, r33^T) */
  n?: number;
  r_m_per_V?: number;
}
export interface Grating1DResult {
  z: Float64Array;
  I: Float64Array;
  rho: Float64Array;
  E: Float64Array;
  dn: Float64Array;
  /** phase of the fundamental Fourier component of dn relative to I (deg, (-180, 180]); +90 = quarter-period shift */
  phase_deg: number;
  /** amplitude of the fundamental component of E (V/m) */
  E1_V_m: number;
  t_s: number;
}
/** 1D photorefractive grating along c. Charge conservation in a periodic window with the uniform current J(t) fixed by
 *  mean(E) = 0 (short circuit): eps eps0 dE/dt = J - sigma(z) E - g(z), g = k_G alpha I + (k_B T/e) d(sigma_ph)/dz.
 *  Each step uses the exact exponential solution per point for frozen J (unconditionally stable, implicit in sigma E);
 *  J solves mean(E_new) = 0 exactly. rho = eps eps0 dE/dz (spectral-accurate central difference, 4th order). Steady state
 *  (steps = 0): E = (J - g)/sigma with J = mean(g/sigma)/mean(1/sigma). Local charge neutrality is not imposed. */
export function grating1D(o: Grating1DOpts): Grating1DResult {
  const N = o.N ?? 256;
  const P = o.periods ?? 2;
  const Lw = P * o.Lambda_m;
  const h = Lw / N;
  const K = (2 * Math.PI) / o.Lambda_m;
  const kT = o.diffusion === false ? 0 : (KB * o.T_K) / QE;
  const e = o.epsR * EPS0;
  const z = new Float64Array(N);
  const I = new Float64Array(N);
  const sig = new Float64Array(N);
  const g = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    z[i] = i * h;
    I[i] = o.I0_W_m2 * (1 + o.m * Math.cos(K * z[i]));
    const dI = -o.I0_W_m2 * o.m * K * Math.sin(K * z[i]);
    sig[i] = o.sigmaDark_S_m + o.kappa_S_m_per_W * I[i];
    g[i] = o.kG_m_per_V * o.alpha_per_m * I[i] + kT * o.kappa_S_m_per_W * dI;
  }
  const E = new Float64Array(N);
  const steps = o.steps ?? 0;
  let t = 0;
  if (steps <= 0) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < N; i++) {
      a += g[i] / sig[i];
      b += 1 / sig[i];
    }
    const J = a / b;
    for (let i = 0; i < N; i++) E[i] = (J - g[i]) / sig[i];
    t = Number.POSITIVE_INFINITY;
  } else {
    const dt = o.dt_s ?? 0.1 * dielectricRelaxationTime(o.epsR, o.sigmaDark_S_m, o.kappa_S_m_per_W * o.I0_W_m2);
    const aF = new Float64Array(N);
    let A = 0;
    for (let i = 0; i < N; i++) {
      aF[i] = Math.exp((-sig[i] * dt) / e);
      A += -Math.expm1((-sig[i] * dt) / e) / sig[i];
    }
    for (let s = 0; s < steps; s++) {
      let B = 0;
      for (let i = 0; i < N; i++) B += E[i] * aF[i] + ((1 - aF[i]) * -g[i]) / sig[i];
      const J = -B / A;
      for (let i = 0; i < N; i++) {
        const Es = (J - g[i]) / sig[i];
        E[i] = Es + (E[i] - Es) * aF[i];
      }
    }
    t = steps * dt;
  }
  const rho = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const ip = (i + 1) % N, im = (i - 1 + N) % N, ip2 = (i + 2) % N, im2 = (i - 2 + N) % N;
    rho[i] = (e * (-E[ip2] + 8 * E[ip] - 8 * E[im] + E[im2])) / (12 * h);
  }
  const n = o.n ?? SLAB_MATERIAL.ne633.value;
  const r = o.r_m_per_V ?? SLAB_MATERIAL.r33T_m_per_V.value;
  const dn = Float64Array.from(E, (x) => pockelsDeltaN(n, r, x));
  // fundamental Fourier components at wavenumber K
  const four = (f: Float64Array): [number, number] => {
    let c = 0;
    let s = 0;
    for (let i = 0; i < N; i++) {
      c += f[i] * Math.cos(K * z[i]);
      s += f[i] * Math.sin(K * z[i]);
    }
    return [(2 * c) / N, (2 * s) / N];
  };
  const [Ic, Is] = four(I);
  const [nc, ns] = four(dn);
  const [Ec, Es] = four(E);
  // f = c cos + s sin = A cos(Kz - phi) with phi = atan2(s, c); dn leads I by (phi_I - phi_dn)
  let ph = ((Math.atan2(Is, Ic) - Math.atan2(ns, nc)) * 180) / Math.PI;
  while (ph <= -180) ph += 360;
  while (ph > 180) ph -= 360;
  return { z, I, rho, E, dn, phase_deg: ph, E1_V_m: Math.hypot(Ec, Es), t_s: t };
}

// ---------------------------------------------------------------------------------------------
// fig-04-05 GRIIRA chain (template toy) and polaron bands (data)
// ---------------------------------------------------------------------------------------------
/** 1 eV in cm^-1 = e / (h c) / 100 (SI 2019 exact constants). */
export const EV_TO_CM1 = 8065.543937349212;
export interface PolaronBand {
  id: string;
  label: string;
  center_cm1: number;
  /** half width at half maximum, cm^-1; null where not tabulated (drawn as a marker) */
  hwhm_cm1: number | null;
  prov: Provenance;
}
/** Bands of manuscript sec. 4.4 (schwesyg2011 Table 2.1 p. 11-12; volk2008 pp. 14-19; P-comp). */
export const POLARON_BANDS: readonly PolaronBand[] = [
  { id: "NbLi4+", label: "bound small polaron Nb_Li^4+", center_cm1: 12900, hwhm_cm1: 3200, prov: { source: "schwesyg2011", status: "P-comp", locator: "Table 2.1 p. 11" } },
  { id: "NbNb4+", label: "free small polaron Nb_Nb^4+", center_cm1: 8050, hwhm_cm1: 3000, prov: { source: "schwesyg2011", status: "P-comp", locator: "p. 11" } },
  { id: "bipolaron", label: "bound bipolaron Nb_Li^4+-Nb_Nb^4+", center_cm1: 20140, hwhm_cm1: 4400, prov: { source: "schwesyg2011", status: "P-comp", locator: "p. 12" } },
  { id: "O-", label: "bound hole polaron O^-", center_cm1: 20000, hwhm_cm1: null, prov: { source: "schwesyg2011", status: "P-comp", locator: "p. 12", note: "no width tabulated" } },
];
/** Normalized Gaussian band shape in photon energy (peak 1) at photon energy E (eV): exp(-ln2 ((E - E0)/HWHM)^2).
 *  Gaussian approximation as labelled in fig-04-05 (volk2008 Eq. 2.11 form). Returns NaN for bands without a width. */
export function polaronBandShape(band: PolaronBand, E_eV: number): number {
  if (band.hwhm_cm1 === null) return Number.NaN;
  const x = (E_eV * EV_TO_CM1 - band.center_cm1) / band.hwhm_cm1;
  return Math.exp(-Math.LN2 * x * x);
}

export interface GriiraOpts {
  /** green intensity (W/m^2) */
  Ig_W_m2: number;
  /** polaron generation per intensity (1/(m^3 s) per W/m^2), template */
  gen: number;
  /** polaron lifetime (s), template */
  tauPol_s: number;
  /** IR absorption cross section (m^2), template */
  sigmaAbs_m2: number;
  /** saturation density (1/m^3), scaled by griiraNmaxScale for MgO */
  Nmax_m3: number;
  /** IR power (W), thermal conductance (W/K), d(Delta k)/dT (rad/m/K), crystal length (m) */
  Pir_W: number;
  Gth_W_per_K: number;
  dDkdT_per_m_K: number;
  L_m: number;
  /** time after pump-on (s); omitted = steady state */
  t_s?: number;
}
/** GRIIRA chain (template toy, fig-04-05 Part B): dN/dt = g I_g (1 - N/N_max) - N/tau_p; alpha_IR = sigma_abs N;
 *  dT = alpha_IR P_IR L / G_th; SHG_rel = sinc^2(dDk/dT dT L / 2). N(t) solved exactly from N(0) = 0. */
export function griiraToy(o: GriiraOpts): { Npol: number; alphaIR: number; dT: number; shgRel: number } {
  let N = 0;
  if (o.Nmax_m3 > 0 && o.Ig_W_m2 > 0) {
    const G = o.gen * o.Ig_W_m2;
    const rate = G / o.Nmax_m3 + 1 / o.tauPol_s;
    const Nss = G / rate;
    N = o.t_s === undefined ? Nss : Nss * -Math.expm1(-rate * o.t_s);
  }
  const alphaIR = o.sigmaAbs_m2 * N;
  const dT = (alphaIR * o.Pir_W * o.L_m) / o.Gth_W_per_K;
  const shgRel = sinc((o.dDkdT_per_m_K * dT * o.L_m) / 2) ** 2;
  return { Npol: N, alphaIR, dT, shgRel };
}
/** GRIIRA thresholds in Mg (volk2008 p. 96, data furukawa2001; P-comp): about 5 % (CLN), about 1.5 % (NSLN). */
export const GRIIRA_MG_THRESHOLD = {
  CLN: { value: 5, unit: "% Mg", prov: { source: "volk2008", status: "P-comp", locator: "p. 96 (data furukawa2001)" } as Provenance },
  NSLN: { value: 1.5, unit: "% Mg", prov: { source: "volk2008", status: "P-comp", locator: "p. 96 (data furukawa2001)" } as Provenance },
} as const;
/** N_max scale factor vs Mg content: linear fall of the Nb_Li fraction to zero at the threshold (scaling law: template). */
export const griiraNmaxScale = (cMg: number, crystal: "CLN" | "NSLN"): number => Math.max(0, 1 - cMg / GRIIRA_MG_THRESHOLD[crystal].value);
export const GRIIRA_TEMPLATE_PROV: Record<string, Provenance> = {
  gen: { source: "volk2008", status: "template", note: "no rate constant held" },
  tauPol: { source: "volk2008", status: "template", note: "decays practically instantly when the pump stops (p. 96); value template" },
  sigmaAbs: { source: "volk2008", status: "template" },
  Nmax: { source: "volk2008", status: "template" },
  NmaxScale: { source: "volk2008", status: "template", note: "linear in Mg up to the P-comp thresholds" },
  Gth: { source: "volk2008", status: "template" },
};
