// Generalized (Schlarb) Sellmeier for composition-dependent LN, as reproduced in volk2008 Eqs. (6.9)-(6.10), Table 6.1, p. 145
// and transcribed in research/R14 note N2 (status S: compilation, not the Schlarb & Betzler 1993/1994 papers):
//   n^2 = (A0 + A_NbLi c_NbLi) / ((lambda0 + mu0 [f(T) - f(T0)])^-2 - lambda^-2) + A_UV - A_IR lambda^2,   lambda in nm,
//   f(T) = (T + 273)^2 + 4.023e5 (coth(261.6 / (T + 273)) - 1), T0 = 24.5 C, c_NbLi = (2/3)(50 - c_Li).
// Validity 400-1200 nm, accuracy about 2e-3 (R14 row 37). Dopant terms (Mg, Zn, In) are not implemented: c_NbLi for doped
// crystals needs the alpha_X factors of volk2008 Eq. (6.10), which N2 does not list; the coefficients are exported for reference.
// Also: Li2O out-diffusion deficit profile (fig-04-10), erfc with diffusion length a template input.
import type { Provenance } from "./constants.ts";

export const SCHLARB_PROV: Provenance = {
  source: "volk2008",
  status: "S",
  locator: "Eqs. (6.9)-(6.10), Table 6.1, p. 145; research/R14 note N2 and row 37",
  note: "Schlarb et al. 1993-1996 coefficients via a compilation; primary not read",
};
export interface SchlarbCoefficients {
  lambda0: number;
  mu0: number;
  A0: number;
  A_IR: number;
  A_NbLi: number;
  A_Mg: number;
  A_Zn: number;
  A_In: number;
  A_UV: number;
}
export const SCHLARB_O: SchlarbCoefficients = { lambda0: 223.219, mu0: 1.1082e-6, A0: 4.5312e-5, A_IR: 3.634e-8, A_NbLi: -7.232e-8, A_Mg: -7.3648e-8, A_Zn: 6.7963e-8, A_In: -2.4e-7, A_UV: 2.6613 };
export const SCHLARB_E: SchlarbCoefficients = { lambda0: 218.203, mu0: 6.4047e-6, A0: 3.9466e-5, A_IR: 3.0998e-8, A_NbLi: 1.18635e-6, A_Mg: 7.6243e-8, A_Zn: 1.9221e-7, A_In: 4.7e-7, A_UV: 2.6613 };
export const SCHLARB_LAMBDA_NM: readonly [number, number] = [400, 1200];
export const SCHLARB_T0_C = 24.5;

const fT = (T_C: number): number => {
  const Tk = T_C + 273;
  const x = 261.6 / Tk;
  return Tk * Tk + 4.023e5 * (1 / Math.tanh(x) - 1);
};

/** Schlarb generalized Sellmeier index (status S) for undoped LN of composition cLi (mol% Li2O, <= 50) at lambda (nm) and
 *  T (C). RangeError outside 400-1200 nm or for cLi > 50. */
export function schlarbIndex(pol: "o" | "e", lambda_nm: number, cLi_mol: number, T_C: number = SCHLARB_T0_C): number {
  if (lambda_nm < SCHLARB_LAMBDA_NM[0] || lambda_nm > SCHLARB_LAMBDA_NM[1]) throw new RangeError(`schlarbIndex: ${lambda_nm} nm outside 400-1200 nm`);
  if (!(cLi_mol <= 50)) throw new RangeError(`schlarbIndex: c_Li ${cLi_mol} mol% > 50 (c_NbLi < 0)`);
  const k = pol === "o" ? SCHLARB_O : SCHLARB_E;
  const cNbLi = (2 / 3) * (50 - cLi_mol);
  const l0 = k.lambda0 + k.mu0 * (fT(T_C) - fT(SCHLARB_T0_C));
  const n2 = (k.A0 + k.A_NbLi * cNbLi) / (1 / (l0 * l0) - 1 / (lambda_nm * lambda_nm)) + k.A_UV - k.A_IR * lambda_nm * lambda_nm;
  return Math.sqrt(n2);
}
/** dn/dc_Li (per mol% Li2O), analytic in c (the model is linear in c_NbLi inside n^2). */
export function schlarbDnDc(pol: "o" | "e", lambda_nm: number, cLi_mol: number, T_C: number = SCHLARB_T0_C): number {
  const k = pol === "o" ? SCHLARB_O : SCHLARB_E;
  const l0 = k.lambda0 + k.mu0 * (fT(T_C) - fT(SCHLARB_T0_C));
  const dn2dc = (k.A_NbLi * (-2 / 3)) / (1 / (l0 * l0) - 1 / (lambda_nm * lambda_nm));
  return dn2dc / (2 * schlarbIndex(pol, lambda_nm, cLi_mol, T_C));
}

/** Complementary error function, Chebyshev-fitted form erfcc of Numerical Recipes 2nd ed. Sec. 6.2 (fractional error
 *  < 1.2e-7 everywhere); adequate for display profiles. */
export function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? r : 2 - r;
}

/** Li2O deficit (mol%) at depth z for a constant surface deficit: dc(z) = dc_s erfc(z / (2 sqrt(D t))). Both dc_s and
 *  sqrt(D t) are template inputs (no sourced diffusion coefficient; manuscript sec. 4.9 L3). */
export const liDeficitProfile = (z_m: number, dcSurface_mol: number, sqrtDt_m: number): number => dcSurface_mol * erfc(z_m / (2 * sqrtDt_m));

/** Out-diffusion index profile: Delta n(z) = n(cBulk - dc(z)) - n(cBulk) from schlarbIndex (S); guides when Delta n(0) > 0. */
export function outDiffusionIndex(pol: "o" | "e", lambda_nm: number, cBulk_mol: number, z_m: number, dcSurface_mol: number, sqrtDt_m: number, T_C = SCHLARB_T0_C): number {
  const dc = liDeficitProfile(z_m, dcSurface_mol, sqrtDt_m);
  return schlarbIndex(pol, lambda_nm, cBulk_mol - dc, T_C) - schlarbIndex(pol, lambda_nm, cBulk_mol, T_C);
}
