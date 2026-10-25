// Visible-range optical constants for the LNOI stack colour (pure, no DOM).
// LN: Zelmon 1997 CLN o/e (src/lib/physics/sellmeier.ts, P-db, 0.4-5 um, 21 C).
// SiO2: Malitson 1965, J. Opt. Soc. Am. 55, 1205, doi:10.1364/JOSA.55.001205, Sellmeier "formula 1" as transcribed in
//   refractiveindex.info main/SiO2/nk/Malitson.yml (CC0; fetched 2026-10-25), fused silica 20 C, 0.21-6.7 um.
//   Used for thermal SiO2 (approximation, labelled in assets3d/lnoi.toml).
// Si: M. A. Green, Sol. Energ. Mat. Sol. Cells 92, 1305 (2008), doi:10.1016/j.solmat.2008.06.009, 300 K, tabulated n, k
//   as transcribed in refractiveindex.info main/Si/nk/Green-2008.yml (CC0; fetched 2026-10-25), rows 390-800 nm, linear
//   interpolation between the 10 nm rows.
import { refractiveIndex } from "../../physics/sellmeier.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O, ZELMON_MGO5_E, ZELMON_MGO5_O } from "../../physics/constants.ts";

export type LnMaterial = "CLN" | "MgO5-CLN";

/** Malitson 1965 fused silica, lambda in um. */
export function nSiO2(lam_um: number): number {
  const L2 = lam_um * lam_um;
  const n2 = 1 + (0.6961663 * L2) / (L2 - 0.0684043 ** 2) + (0.4079426 * L2) / (L2 - 0.1162414 ** 2) + (0.8974794 * L2) / (L2 - 9.896161 ** 2);
  return Math.sqrt(n2);
}

// Green 2008, [lambda nm, n, k]
const SI_GREEN2008: readonly (readonly [number, number, number])[] = [
  [390, 6.039, 0.445], [400, 5.613, 0.296], [410, 5.33, 0.227], [420, 5.119, 0.176], [430, 4.949, 0.138], [440, 4.812, 0.107],
  [450, 4.691, 0.086302], [460, 4.587, 0.071381], [470, 4.497, 0.062086], [480, 4.419, 0.055004], [490, 4.35, 0.049131],
  [500, 4.294, 0.044165], [510, 4.241, 0.039367], [520, 4.193, 0.036415], [530, 4.151, 0.033108], [540, 4.112, 0.030295],
  [550, 4.077, 0.027968], [560, 4.045, 0.025758], [570, 4.015, 0.024131], [580, 3.988, 0.022524], [590, 3.963, 0.021081],
  [600, 3.94, 0.019934], [610, 3.918, 0.018446], [620, 3.898, 0.017367], [630, 3.879, 0.016444], [640, 3.861, 0.015432],
  [650, 3.844, 0.014431], [660, 3.828, 0.013498], [670, 3.813, 0.012743], [680, 3.798, 0.011905], [690, 3.784, 0.011201],
  [700, 3.772, 0.010528], [710, 3.759, 0.010057], [720, 3.748, 0.0096257], [730, 3.737, 0.0089461], [740, 3.727, 0.008362],
  [750, 3.717, 0.0078185], [760, 3.708, 0.007197], [770, 3.699, 0.0067402], [780, 3.691, 0.0063933], [790, 3.683, 0.005834],
  [800, 3.675, 0.0054113],
];

/** Si complex index n + i k at lambda (nm), 390-800 nm; throws outside the table. */
export function nkSi(lam_nm: number): [number, number] {
  const T = SI_GREEN2008;
  if (!(lam_nm >= T[0][0] && lam_nm <= T[T.length - 1][0])) throw new RangeError(`Si Green 2008 table: ${lam_nm} nm outside 390-800 nm`);
  const i = Math.min(T.length - 2, Math.floor((lam_nm - T[0][0]) / 10));
  const a = T[i], b = T[i + 1], f = (lam_nm - a[0]) / (b[0] - a[0]);
  return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** LN ordinary and extraordinary index (Zelmon 1997, 21 C) at lambda (um). */
export function nLN(material: LnMaterial, lam_um: number): { o: number; e: number } {
  const [mo, me] = material === "CLN" ? [ZELMON_CLN_O, ZELMON_CLN_E] : [ZELMON_MGO5_O, ZELMON_MGO5_E];
  return { o: refractiveIndex(mo, lam_um), e: refractiveIndex(me, lam_um) };
}
