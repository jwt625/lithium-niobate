// Piezo-optomechanical transduction bookkeeping and thermal occupation.
//   p05 (Jiang et al., Nat. Commun. 11, 1166 (2020); arXiv v1 Eq. 4 and App. A; reported):
//     eta_total = eta_oc eta_o eta_m 4C / (1 +- C)^2,  C = C0 n_c,
//   upper sign red-detuned pump (beam-splitter; ideal conversion at C = 1), lower sign blue-detuned (two-mode squeezing;
//   gain diverges at C = 1, phonon lasing). Note: manuscript sec. 3.7 prints "(1 -+ C)^2, upper sign red", which would
//   make the red side diverge at C = 1; its own text and the F3.9 acceptance (blue: 4C/(1 - C)^2) fix the signs used here. Reported fit parameters: eta_oc 0.652, eta_o 0.66, eta_m 9.9e-4,
//   C0 1.2e-5, eta_e 4.24e-4 (content/chapters/03-sound/manuscript.md sec. 3.7).
//   Thermal occupation n = 1/(exp(h f / k_B T) - 1) (Bose-Einstein).
import { H, KB } from "./constants.ts";
import type { Provenance } from "./constants.ts";

export type Detuning = "red" | "blue";

export interface TransductionParams {
  /** fiber-to-chip, optical external ratio kappa_e/kappa, microwave-to-mechanics efficiencies */
  etaOc: number;
  etaO: number;
  etaM: number;
  /** single-photon cooperativity and intracavity photon number */
  C0: number;
  nc: number;
  detuning: Detuning;
  /** optional fitted external efficiency used instead of etaOc etaO etaM (p05 reports 4.24e-4) */
  etaE?: number;
}

export interface TransductionResult {
  C: number;
  /** internal factor 4C/(1 -+ C)^2 */
  gain: number;
  /** product of the external stages */
  etaE: number;
  eta: number;
  /** blue detuning with C >= 1: parametric instability (phonon lasing); eta returned as Infinity */
  unstable: boolean;
}

export function transductionEfficiency(p: TransductionParams): TransductionResult {
  const C = p.C0 * p.nc;
  const etaE = p.etaE ?? p.etaOc * p.etaO * p.etaM;
  if (p.detuning === "blue" && C >= 1) return { C, gain: Number.POSITIVE_INFINITY, etaE, eta: Number.POSITIVE_INFINITY, unstable: true };
  const gain = internalGain(C, p.detuning);
  return { C, gain, etaE, eta: etaE * gain, unstable: false };
}

/** Internal factor: 4C/(1 + C)^2 for red detuning (maximum 1 at C = 1), 4C/(1 - C)^2 for blue (diverges at C = 1). */
export function internalGain(C: number, detuning: Detuning): number {
  return detuning === "red" ? (4 * C) / (1 + C) ** 2 : (4 * C) / (1 - C) ** 2;
}

/** Reported p05 parameters (arXiv v1; reported). */
export const P05_PARAMS: { etaOc: number; etaO: number; etaM: number; C0: number; etaE: number; prov: Provenance } = {
  etaOc: 0.652,
  etaO: 0.66,
  etaM: 9.9e-4,
  C0: 1.2e-5,
  etaE: 4.24e-4,
  prov: { source: "p05", status: "reported", locator: "arXiv v1 Eq. 4, App. A; content/chapters/03-sound/manuscript.md sec. 3.7" },
};

/** Mean thermal occupation of a mode at frequency f (Hz) and temperature T (K). */
export function thermalOccupation(f_Hz: number, T_K: number): number {
  if (T_K <= 0) return 0;
  const x = (H * f_Hz) / (KB * T_K);
  return 1 / Math.expm1(x);
}
