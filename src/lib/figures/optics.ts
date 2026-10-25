// Material optics used by the figures, bound to the physics core (src/lib/physics). No physics is implemented here.
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { qpmPeriodSHG as qpmPeriod } from "$lib/physics/phasematching.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O } from "$lib/physics/constants.ts";

export type OptAxis = "o" | "e";

/** Zelmon 1997 congruent LN, 21 C (P-db). lam in um, clamped to the 0.4-5.0 um validity window so slider end points that
 *  round past the window (e.g. 5.000000001 from a log slider) evaluate at the edge instead of throwing. */
export function nCLN(axis: OptAxis, lam_um: number): number {
  const m = axis === "o" ? ZELMON_CLN_O : ZELMON_CLN_E;
  return refractiveIndex(m, Math.min(m.lambda_um[1], Math.max(m.lambda_um[0], lam_um)));
}

/** First-order QPM period (um) for e-e-e SHG lam -> lam/2 in bulk congruent LN at 21 C. */
export const qpmPeriodSHG = (lam_um: number): number => qpmPeriod(lam_um, (l) => nCLN("e", l));

/** r22, free (T), 6.8 pm/V: the value the mockup conoscope and its popup use (compiled 6.7 Lenzo et al. 1966, +6.81 Zook
 *  et al. 1967; weis1985, volk2008 Table 1.2; status P-comp as shown on the page). In m/V. */
export const R22_T = 6.8e-12;
