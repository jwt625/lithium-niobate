// Dispersion models: refractive index, derivatives, group index, GVD, dn/dT.
// Coefficients and provenance live in constants.ts. Validity windows are enforced: evaluation outside
// the published wavelength or temperature range throws a RangeError naming the model and the window.
// Lambda in um, T in C.
import { C0, DISPERSION_MODELS } from "./constants.ts";
import type { Axis, DispersionCoefficients, JundtCoefficients, Material, SellmeierCoefficients } from "./constants.ts";

export type { Axis, DispersionCoefficients, Material };

/** Jundt/Gayer temperature parameter f = (T - 24.5)(T + 570.82), T in C. */
export const jundtF = (T_C: number): number => (T_C - 24.5) * (T_C + 570.82);
const jundtFprime = (T_C: number): number => 2 * T_C + 570.82 - 24.5;

/** True when (lam, T) lies inside the model window. T undefined means the model reference temperature. */
export function inRange(m: DispersionCoefficients, lam_um: number, T_C?: number): boolean {
  if (!(lam_um >= m.lambda_um[0] && lam_um <= m.lambda_um[1])) return false;
  if (m.form === "zelmon") return T_C === undefined || T_C === m.T_ref_C;
  const T = T_C ?? m.T_ref_C;
  return T >= m.T_range_C[0] && T <= m.T_range_C[1];
}

function check(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  if (!(lam_um >= m.lambda_um[0] && lam_um <= m.lambda_um[1]))
    throw new RangeError(`${m.id}: lambda ${lam_um} um outside validity ${m.lambda_um[0]}-${m.lambda_um[1]} um`);
  if (m.form === "zelmon") {
    if (T_C !== undefined && T_C !== m.T_ref_C)
      throw new RangeError(`${m.id}: defined at ${m.T_ref_C} C only (no temperature dependence); got ${T_C} C`);
    return m.T_ref_C;
  }
  const T = T_C ?? m.T_ref_C;
  if (!(T >= m.T_range_C[0] && T <= m.T_range_C[1]))
    throw new RangeError(`${m.id}: T ${T} C outside validity ${m.T_range_C[0]}-${m.T_range_C[1]} C`);
  return T;
}

// n^2 and its lambda derivatives (no range check)
function n2Zelmon(m: SellmeierCoefficients, L: number): [number, number, number] {
  const L2 = L * L;
  let N = 1;
  let N1 = 0;
  let N2 = 0;
  for (let i = 0; i < 3; i++) {
    const B = m.coef[2 * i];
    const C = m.coef[2 * i + 1];
    const D = L2 - C;
    N += (B * L2) / D;
    N1 += (-2 * B * C * L) / (D * D);
    N2 += (2 * B * C * (3 * L2 + C)) / (D * D * D);
  }
  return [N, N1, N2];
}

function n2Jundt(m: JundtCoefficients, L: number, T: number): [number, number, number] {
  const [a1, a2, a3, a4, a5, a6] = m.a;
  const [b1, b2, b3, b4] = m.b;
  const f = jundtF(T);
  const L2 = L * L;
  const P1 = a2 + b2 * f;
  const Q1 = (a3 + b3 * f) ** 2;
  const P2 = a4 + b4 * f;
  const Q2 = a5 * a5;
  const D1 = L2 - Q1;
  const D2 = L2 - Q2;
  const N = a1 + b1 * f + P1 / D1 + P2 / D2 - a6 * L2;
  const N1 = (-2 * L * P1) / (D1 * D1) + (-2 * L * P2) / (D2 * D2) - 2 * a6 * L;
  const N2 = (P1 * (6 * L2 + 2 * Q1)) / D1 ** 3 + (P2 * (6 * L2 + 2 * Q2)) / D2 ** 3 - 2 * a6;
  return [N, N1, N2];
}

function n2(m: DispersionCoefficients, L: number, T: number): [number, number, number] {
  return m.form === "zelmon" ? n2Zelmon(m, L) : n2Jundt(m, L, T);
}

/** Refractive index n(lambda, T). Throws RangeError outside the model validity window. */
export function refractiveIndex(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  const T = check(m, lam_um, T_C);
  return Math.sqrt(n2(m, lam_um, T)[0]);
}

/** Index without range enforcement: returns NaN outside the window (for per-pixel loops that pre-check). */
export function refractiveIndexOrNaN(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  return inRange(m, lam_um, T_C) ? Math.sqrt(n2(m, lam_um, T_C ?? m.T_ref_C)[0]) : Number.NaN;
}

/** dn/dlambda (1/um), analytic. */
export function dnDlambda(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  const T = check(m, lam_um, T_C);
  const [N, N1] = n2(m, lam_um, T);
  return N1 / (2 * Math.sqrt(N));
}

/** d2n/dlambda2 (1/um^2), analytic. */
export function d2nDlambda2(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  const T = check(m, lam_um, T_C);
  const [N, N1, N2] = n2(m, lam_um, T);
  const n = Math.sqrt(N);
  return N2 / (2 * n) - (N1 * N1) / (4 * n * n * n);
}

/** Group index n_g = n - lambda dn/dlambda. */
export function groupIndex(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  return refractiveIndex(m, lam_um, T_C) - lam_um * dnDlambda(m, lam_um, T_C);
}

/** Group-velocity dispersion beta2 = lambda^3/(2 pi c^2) d2n/dlambda2, returned in fs^2/mm. */
export function gvd(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  const L = lam_um * 1e-6;
  const d2 = d2nDlambda2(m, lam_um, T_C) * 1e12; // 1/m^2
  const beta2 = (L ** 3 / (2 * Math.PI * C0 * C0)) * d2; // s^2/m
  return beta2 * 1e30 * 1e-3; // fs^2/mm
}

/** Dispersion parameter D = -(lambda/c) d2n/dlambda2, in ps/(nm km). */
export function dispersionD(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  const d2 = d2nDlambda2(m, lam_um, T_C) * 1e12; // 1/m^2
  const D = -((lam_um * 1e-6) / C0) * d2; // s/m^2
  return D * 1e12 * 1e-9 * 1e3; // ps/(nm km)
}

/** dn/dT (1/K), analytic, for temperature-dependent models. Throws for fixed-temperature models.
 *  Check m.flags: Gayer 2008 values are flagged anomalous for absolute dn/dT (R14 row 36c). */
export function dnDT(m: DispersionCoefficients, lam_um: number, T_C?: number): number {
  if (m.form === "zelmon") throw new RangeError(`${m.id}: no temperature dependence in this model`);
  const T = check(m, lam_um, T_C);
  const [, a2, a3, , a5] = m.a;
  const [b1, b2, b3, b4] = m.b;
  const f = jundtF(T);
  const fp = jundtFprime(T);
  const L2 = lam_um * lam_um;
  const A3 = a3 + b3 * f;
  const D1 = L2 - A3 * A3;
  const D2 = L2 - a5 * a5;
  const dN = fp * (b1 + b2 / D1 + ((a2 + b2 * f) * 2 * A3 * b3) / (D1 * D1) + b4 / D2);
  const n = Math.sqrt(n2(m, lam_um, T)[0]);
  return dN / (2 * n);
}

/** Look up a model by id. */
export function modelById(id: string): DispersionCoefficients {
  const m = DISPERSION_MODELS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown dispersion model ${id}`);
  return m;
}

/** Default model for a material and axis (isDefault rows only; Zelmon for CLN and MgO5). */
export function defaultModel(material: Material, axis: Axis): DispersionCoefficients {
  const m = DISPERSION_MODELS.find((x) => x.material === material && x.axis === axis && x.isDefault);
  if (!m) throw new Error(`no default dispersion model for ${material} ${axis}`);
  return m;
}

/** Index function bound to a model, the form phasematching.ts consumes. */
export type IndexFn = (lam_um: number, T_C?: number) => number;
export const indexFn = (m: DispersionCoefficients): IndexFn => (lam, T) => refractiveIndex(m, lam, T);
