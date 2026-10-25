// Composition of LiNbO3 between congruent and stoichiometric: ratios, intrinsic-defect fractions, Curie temperature fits,
// UV absorption edge, melt-to-crystal relation, seeded defect lattice texture (FIG-01-03, FIG-01-05; shared with C04, C05).
//
// c = Li2O content of the crystal in mol% (R2 = [Li]/([Li] + [Nb]) = c / 100, derived identity, C01 manuscript Sec. 4 L2).
// Defect models per formula unit, x = antisite fraction (volk2008 Eqs. (2.5)-(2.6) pp. 12-13, P-comp; C01 manuscript Sec. 5 L2):
//   Li-site vacancy model:  [Li(1-5x) Nb_Li(x) V_Li(4x)] Nb O3
//   Nb-site vacancy model:  [Li(1-5x) Nb_Li(5x)] [Nb(1-4x) V_Nb(4x)] O3
//   both give R2 = (1 - 5x)/(2 - 4x)  =>  x = (1 - 2 R2)/(5 - 4 R2)  (derived).
// Coefficients below equal the API rows named in each `prov.locator` (src/lib/generated/properties.json); the tests re-parse them.
import type { Provenance } from "./constants.ts";
import { createRng } from "./prng.ts";

/** [Li]/[Nb] (R1) from c (mol% Li2O): R1 = c / (100 - c). */
export const liNbRatio = (c_molPct: number): number => c_molPct / (100 - c_molPct);
/** [Li]/([Li] + [Nb]) (R2) = c / 100. */
export const liFraction = (c_molPct: number): number => c_molPct / 100;
/** Antisite fraction x per formula unit, x = (1 - 2 R2)/(5 - 4 R2); 0 at 50 mol%. Negative above 50 mol% (no physical meaning; callers clamp). */
export function antisiteX(c_molPct: number): number {
  const R2 = c_molPct / 100;
  return (1 - 2 * R2) / (5 - 4 * R2);
}

export type DefectModel = "Li-site" | "Nb-site";
export interface DefectFractions {
  model: DefectModel;
  x: number;
  /** fractions of Li sites */
  Li: number;
  NbLi: number;
  VLi: number;
  /** fractions of Nb sites */
  NbNb: number;
  VNb: number;
}
/** Site fractions for either compensation model (volk2008 Eqs. (2.5)-(2.6)). Both models give the same R1. */
export function defectFractions(c_molPct: number, model: DefectModel = "Li-site"): DefectFractions {
  const x = Math.max(0, antisiteX(c_molPct));
  if (model === "Li-site") return { model, x, Li: 1 - 5 * x, NbLi: x, VLi: 4 * x, NbNb: 1, VNb: 0 };
  return { model, x, Li: 1 - 5 * x, NbLi: 5 * x, VLi: 0, NbNb: 1 - 4 * x, VNb: 4 * x };
}
/** R1 implied by a set of site fractions: ([Li]) / ([Nb_Li] + [Nb_Nb]); equal for both models at the same c. */
export const ratioFromFractions = (f: DefectFractions): number => f.Li / (f.NbLi + f.NbNb);

// ---------- Curie temperature fits ----------
export interface LinearFit {
  id: string;
  slope: number;
  intercept: number;
  unit: string;
  prov: Provenance;
}
/** Tc = 39.26 c - 760.67 (C), iyi1992 via volk2008 Eq. (6.2) p. 140 (P-comp; DTA, 4 crystals). */
export const TC_IYI1992: LinearFit = {
  id: "curie-temperature-vs-composition/unspecified/volk2008-iyi1992", slope: 39.26, intercept: -760.67, unit: "C",
  prov: { source: "volk2008", status: "P-comp", locator: "Eq. (6.2) p. 140 (orig. Iyi et al. 1992); API row curie-temperature-vs-composition/unspecified/volk2008-iyi1992" },
};
/** Tc = 39.064 c - 746.73 (C), bordui1992 via volk2008 Eq. (6.3) p. 140 (P-comp; dielectric, 5 VTE crystals). */
export const TC_BORDUI1992: LinearFit = {
  id: "curie-temperature-vs-composition/unspecified/volk2008-bordui1992", slope: 39.064, intercept: -746.73, unit: "C",
  prov: { source: "volk2008", status: "P-comp", locator: "Eq. (6.3) p. 140 (orig. Bordui et al. 1992); API row curie-temperature-vs-composition/unspecified/volk2008-bordui1992" },
};
export const tcIyi = (c_molPct: number): number => TC_IYI1992.slope * c_molPct + TC_IYI1992.intercept;
export const tcBordui = (c_molPct: number): number => TC_BORDUI1992.slope * c_molPct + TC_BORDUI1992.intercept;
/** Band spanned by the two fits (C). */
export function tcBand(c_molPct: number): { lo: number; hi: number } {
  const a = tcIyi(c_molPct);
  const b = tcBordui(c_molPct);
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}
/** Inverse of a linear Tc fit: composition (mol% Li2O) from Tc (C). */
export const compositionFromTc = (Tc_C: number, fit: LinearFit = TC_IYI1992): number => (Tc_C - fit.intercept) / fit.slope;

// ---------- UV absorption edge ----------
/** lambda_alpha = a0 + a1 x + a2 x^2 (nm), x = c - 48.38 mol%, 22 C, E || c, k perpendicular to c (volk2008 Eqs. (6.5)-(6.6), kovacs1997). */
export const UV_EDGE = {
  20: { a: [320.4, -1.829, -5.485] as const },
  15: { a: [321.9, -1.597, -5.745] as const },
  x0_molPct: 48.38,
  /** Display window from C01 figures.md FIG-01-03 (48.0-50.0 mol%); the kovacs1997 calibration range itself was not read. */
  valid_molPct: [48.0, 50.0] as const,
  prov: { source: "volk2008", status: "P-comp", locator: "Eqs. (6.5)-(6.6) p. 142 (calibration of kovacs1997); API row uv-edge-formula/unspecified/volk2008-kovacs1997", note: "validity window is the figure-spec range, not a sourced calibration range" } as Provenance,
} as const;
/** UV edge wavelength (nm) at absorption 20 or 15 cm^-1 with a validity flag (outside the window the value is still returned). */
export function uvEdge(c_molPct: number, alpha_per_cm: 20 | 15 = 20): { lambda_nm: number; valid: boolean } {
  const [a0, a1, a2] = UV_EDGE[alpha_per_cm].a;
  const x = c_molPct - UV_EDGE.x0_molPct;
  const [lo, hi] = UV_EDGE.valid_molPct;
  return { lambda_nm: a0 + a1 * x + a2 * x * x, valid: c_molPct >= lo && c_molPct <= hi };
}

// ---------- melt to crystal ----------
/** Crystal composition from melt composition: c = 48.5 + 0.3436 (cm - 48.5) - 0.02897 (cm - 48.5)^2, valid 45 < cm < 52 mol%,
 *  +-0.3 mol% (volk2008 Eq. (6.1) p. 140, P-comp; C01 manuscript Sec. 4 L2). */
export function crystalFromMelt(cMelt_molPct: number): { c_molPct: number; valid: boolean; uncertainty_molPct: number } {
  const d = cMelt_molPct - 48.5;
  return { c_molPct: 48.5 + 0.3436 * d - 0.02897 * d * d, valid: cMelt_molPct > 45 && cMelt_molPct < 52, uncertainty_molPct: 0.3 };
}

// ---------- dopant concentration basis ----------
export type MgBasis = "MgO/(Li2O+MgO+Nb2O5)" | "MgO/(LiNbO3+MgO)";
/** No exact conversion between the two MgO concentration definitions is sourced; returns null with the source's note
 *  (C01 manuscript Sec. 6: the two definitions differ by a factor of about 2, labelled approximate in the source). */
export function mgBasisConvert(_c: number, from: MgBasis, to: MgBasis): { value: number | null; note: string } {
  if (from === to) return { value: _c, note: "same basis" };
  return { value: null, note: "no exact relation sourced; the two definitions differ by about 2x (approximate, as stated in the source)" };
}

// ---------- seeded lattice texture ----------
export const LATTICE_CODE = { Li: 0, vacancy: 1, antisite: 2 } as const;
/** n x n triangular lattice of Li sites with exactly round(fracVac N) vacancies and round(fracAnti N) Nb antisites, placed by a
 *  seeded partial Fisher-Yates shuffle (deterministic per seed). Codes per LATTICE_CODE. Site (i, j) sits at
 *  (i + 0.5 (j mod 2), j sqrt(3)/2) in units of the site spacing (display only). */
export function seededLattice(n: number, fracVac: number, fracAnti: number, seed: number): Uint8Array {
  const N = n * n;
  const nv = Math.round(Math.max(0, fracVac) * N);
  const na = Math.round(Math.max(0, fracAnti) * N);
  if (nv + na > N) throw new RangeError("fracVac + fracAnti exceeds 1");
  const idx = new Int32Array(N);
  for (let i = 0; i < N; i++) idx[i] = i;
  const rng = createRng(seed);
  const m = nv + na;
  for (let i = 0; i < m; i++) {
    const j = i + rng.int(N - i);
    const t = idx[i];
    idx[i] = idx[j];
    idx[j] = t;
  }
  const out = new Uint8Array(N);
  for (let i = 0; i < nv; i++) out[idx[i]] = LATTICE_CODE.vacancy;
  for (let i = nv; i < m; i++) out[idx[i]] = LATTICE_CODE.antisite;
  return out;
}
