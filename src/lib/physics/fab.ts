// Fabrication toys for chapter 05 (content/chapters/05-making/figures.md F05-01..F05-11). Pure geometry, kinetics
// laws and bookkeeping; every rate constant is an explicit argument. Sourced anchors are exported with provenance;
// anything without a source is either absent (caller supplies it, rendered as template) or labelled template.
//   Czochralski: L(t) = v t; body mass = rho pi (D/2)^2 L (cylinder; shoulder and tail excluded).
//   Proton exchange: d^2 = r(T) t (jackel1982 "diffusion rate"; meaning d^2/t vs D open, C05 Q5), or d = 2 sqrt(D t)
//     in the alternative convention; r(T) Arrhenius through the two reported points, valid 217-249 C only.
//   EBL write time t = D A / I (dose, area, beam current) times the number of passes.
//   Stepper: count of whole square fields inside the usable circle (diameter - 2 x edge exclusion).
//   Preston: dz/dt = Kp P v (preston1927; bibliographic check pending, C05 Q11). No LN Kp is sourced.
//   Mask-edge recession: tan(a_LN) = S tan(a_mask), S = R_LN / R_mask (derived geometry, manuscript 5.7 L3; upper bound).
//   Implant range: no verified range table (C05 Q6); only the reported 195 keV He point.
//   Mass budget: molar masses from IUPAC abridged standard atomic weights (CIAAW; Prohaska et al., Pure Appl. Chem.
//     94, 573 (2022)): Li 6.94, C 12.011, O 15.999, Nb 92.906 (the values used in manuscript 5.1).
import { KB, QE } from "./constants.ts";
import type { Provenance } from "./constants.ts";

// ---------- Czochralski ----------
export const czBodyLength = (v_mm_per_h: number, t_h: number): number => v_mm_per_h * t_h;
export const czPullTime = (L_mm: number, v_mm_per_h: number): number => L_mm / v_mm_per_h;
/** Cylinder mass (kg) from diameter and length (mm) and density (kg/m^3). */
export const cylinderMass = (D_mm: number, L_mm: number, rho: number): number => rho * Math.PI * (D_mm * 5e-4) ** 2 * L_mm * 1e-3;

export const DENSITY_CLN_VOLK2008 = { value: 4647, unit: "kg/m^3", prov: { source: "volk2008", status: "P-comp", locator: "Table 1.1 (R14 row 8)" } as Provenance };

// ---------- proton exchange ----------
/** jackel1982 x-cut benzoic-acid rates (P(abs)): 1.37 um^2/h at 249 C, 0.37 um^2/h at 217 C. */
export const PE_JACKEL1982 = {
  points: [
    { T_C: 217, r_um2_per_h: 0.37 },
    { T_C: 249, r_um2_per_h: 1.37 },
  ],
  validity_C: [217, 249] as const,
  prov: { source: "jackel1982", status: "P(abs)", note: "rate meaning (d^2/t vs D) not confirmed from the full text (C05 Q5)" } as Provenance,
};
/** Apparent activation energy (eV) from two Arrhenius points. */
export function arrheniusEa(T1_C: number, r1: number, T2_C: number, r2: number): number {
  const T1 = T1_C + 273.15;
  const T2 = T2_C + 273.15;
  return ((KB / QE) * Math.log(r2 / r1)) / (1 / T1 - 1 / T2);
}
/** Rate at T (um^2/h) by Arrhenius through the jackel1982 points; valid = inside 217-249 C (outside: template extrapolation). */
export function peRate(T_C: number): { r_um2_per_h: number; Ea_eV: number; valid: boolean } {
  const [a, b] = PE_JACKEL1982.points;
  const Ea = arrheniusEa(a.T_C, a.r_um2_per_h, b.T_C, b.r_um2_per_h);
  const r = b.r_um2_per_h * Math.exp(-(Ea * QE) / KB * (1 / (T_C + 273.15) - 1 / (b.T_C + 273.15)));
  return { r_um2_per_h: r, Ea_eV: Ea, valid: T_C >= PE_JACKEL1982.validity_C[0] - 1e-9 && T_C <= PE_JACKEL1982.validity_C[1] + 1e-9 };
}
/** Exchange depth (um) after t hours: convention "d2t" (d^2 = r t) or "D" (r read as D, d = 2 sqrt(D t)). */
export function peDepth(T_C: number, t_h: number, convention: "d2t" | "D" = "d2t"): { d_um: number; valid: boolean } {
  const { r_um2_per_h, valid } = peRate(T_C);
  const d = convention === "d2t" ? Math.sqrt(r_um2_per_h * t_h) : 2 * Math.sqrt(r_um2_per_h * t_h);
  return { d_um: d, valid };
}

// ---------- lithography ----------
/** EBL write time (s): dose (uC/cm^2) x area (cm^2) x passes / current (nA). */
export const eblWriteTime = (dose_uC_per_cm2: number, area_cm2: number, current_nA: number, passes = 1): number => (dose_uC_per_cm2 * 1e-6 * area_cm2 * passes) / (current_nA * 1e-9);

/** Whole square fields (side a) inside a circle of radius R for a grid with offset (ox, oy) of a field centre from the
 *  wafer centre. Returns the field centres. */
export function fieldsInCircle(R_mm: number, a_mm: number, ox_mm: number, oy_mm: number): [number, number][] {
  const out: [number, number][] = [];
  const nmax = Math.ceil(R_mm / a_mm) + 1;
  for (let i = -nmax; i <= nmax; i++)
    for (let j = -nmax; j <= nmax; j++) {
      const cx = ox_mm + i * a_mm;
      const cy = oy_mm + j * a_mm;
      const fx = Math.abs(cx) + a_mm / 2;
      const fy = Math.abs(cy) + a_mm / 2;
      if (fx * fx + fy * fy <= R_mm * R_mm + 1e-9) out.push([cx, cy]);
    }
  return out;
}
/** Best stepper field count over the two grid offsets per axis (field centred on the wafer centre, or a field edge on
 *  it), i.e. offsets {0, a/2} in x and y; usable radius = D/2 - edge exclusion. */
export function stepperFieldCount(D_mm: number, a_mm: number, edgeExclusion_mm: number): { count: number; ox_mm: number; oy_mm: number; centres: [number, number][] } {
  const R = D_mm / 2 - edgeExclusion_mm;
  let best = { count: -1, ox_mm: 0, oy_mm: 0, centres: [] as [number, number][] };
  for (const ox of [0, a_mm / 2])
    for (const oy of [0, a_mm / 2]) {
      const c = fieldsInCircle(R, a_mm, ox, oy);
      if (c.length > best.count) best = { count: c.length, ox_mm: ox, oy_mm: oy, centres: c };
    }
  return best;
}

// ---------- CMP ----------
/** Preston removal rate (m/s) = Kp (1/Pa) x P (Pa) x v (m/s). Kp has no LN source: caller supplies it (template). */
export const prestonRate = (Kp_per_Pa: number, P_Pa: number, v_mps: number): number => Kp_per_Pa * P_Pa * v_mps;
/** Time (s) to remove dz (m) at constant P and v. */
export const prestonTime = (dz_m: number, Kp_per_Pa: number, P_Pa: number, v_mps: number): number => dz_m / prestonRate(Kp_per_Pa, P_Pa, v_mps);

// ---------- etching ----------
/** Sidewall angle (deg) from mask-edge recession: atan(S tan(a_mask)). Upper bound (manuscript 5.7 L3). */
export const sidewallAngle = (S: number, aMask_deg: number): number => (Math.atan(S * Math.tan((aMask_deg * Math.PI) / 180)) * 180) / Math.PI;
/** Lateral recession (m) of the mask edge after etching LN depth h at selectivity S with mask angle a_mask. */
export const maskRecession = (h_m: number, S: number, aMask_deg: number): number => h_m / (S * Math.tan((aMask_deg * Math.PI) / 180));

// ---------- ion slicing ----------
export type ImplantIon = "He" | "H";
export interface ImplantRangeResult {
  status: "reported" | "no verified data";
  Rp_um: number | null;
  prov?: Provenance;
}
/** Reported implant anchors only (C05 manuscript 5.5). */
export const IMPLANT_REPORTED = [{ ion: "He" as ImplantIon, E_keV: 195, Rp_um: 0.68, prov: { source: "guarino2007", status: "P", locator: "arXiv; He+ density peak, z-cut CLN, 4e16 cm^-2, 100 C" } as Provenance }];
/** Projected range: no verified range table exists in the sources held (C05 Q6, SRIM run pending). Returns the
 *  reported value at an exact anchor, otherwise status "no verified data" and null. */
export function implantRange(ion: ImplantIon, E_keV: number): ImplantRangeResult {
  const hit = IMPLANT_REPORTED.find((p) => p.ion === ion && Math.abs(p.E_keV - E_keV) < 1e-9);
  return hit ? { status: "reported", Rp_um: hit.Rp_um, prov: hit.prov } : { status: "no verified data", Rp_um: null };
}

// ---------- mass budget ----------
export const ATOMIC_WEIGHT = {
  Li: 6.94,
  C: 12.011,
  O: 15.999,
  Nb: 92.906,
  prov: { source: "iupac-ciaaw", status: "P", note: "abridged standard atomic weights, Prohaska et al., Pure Appl. Chem. 94, 573 (2022); values as used in manuscript 5.1" } as Provenance,
} as const;
const W = ATOMIC_WEIGHT;
export const MOLAR_MASS = {
  LiNbO3: W.Li + W.Nb + 3 * W.O,
  Li2CO3: 2 * W.Li + W.C + 3 * W.O,
  Nb2O5: 2 * W.Nb + 5 * W.O,
  CO2: W.C + 2 * W.O,
};
export const nbMassFraction = (): number => W.Nb / MOLAR_MASS.LiNbO3;
/** Stoichiometric charge per kg LiNbO3 (Li2CO3 + Nb2O5 -> 2 LiNbO3 + CO2), kg. */
export function chargePerKg(): { Li2CO3: number; Nb2O5: number; CO2: number } {
  const mol = 1000 / MOLAR_MASS.LiNbO3;
  return { Li2CO3: ((mol / 2) * MOLAR_MASS.Li2CO3) / 1000, Nb2O5: ((mol / 2) * MOLAR_MASS.Nb2O5) / 1000, CO2: ((mol / 2) * MOLAR_MASS.CO2) / 1000 };
}
/** LN and Nb mass (g) in a round wafer (flats ignored). */
export function waferMass(D_mm: number, t_mm: number, rho = DENSITY_CLN_VOLK2008.value): { LN_g: number; Nb_g: number } {
  const m = cylinderMass(D_mm, t_mm, rho) * 1000;
  return { LN_g: m, Nb_g: m * nbMassFraction() };
}
