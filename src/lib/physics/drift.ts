// DC bias drift: Maxwell-Wagner relaxation of a series stack of N layers (each a parallel RC: C = eps0 eps_r A / t,
// G = sigma A / t). A voltage step V at t = 0 divides capacitively at t = 0+ and resistively at t -> infinity.
// Exact solution by partial fractions of V_k(s) = (V/s) Z_k(s) / Z(s), Z_k = 1/(G_k + s C_k), Z = sum_k Z_k:
// the N-1 relaxation rates are the roots of Z(s) = 0, which interlace the layer poles -G_k/C_k.
// References: two-layer form in R11 S8; Salvestrini et al., JLT 29, 1522 (2011) (bulk LN MZM drift); Holzgrafe et al.,
// Opt. Express 32, 3619 (2024) (TFLN relaxation); R08 sec. 3.3 (mechanisms, mitigation).
import { EPS0, DARK_CONDUCTIVITY_CLN, EPS_T_KUSHIBIKI1999 } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { bisect } from "./linalg.ts";

export interface Layer {
  name: string;
  thickness_m: number;
  eps_r: number;
  sigma_S_per_m: number;
}

/** Per-area layer capacitance (F/m^2) and conductance (S/m^2). */
const CG = (l: Layer): [number, number] => [(EPS0 * l.eps_r) / l.thickness_m, l.sigma_S_per_m / l.thickness_m];

export interface DriftModel {
  layers: Layer[];
  /** relaxation rates (1/s, positive) and time constants (s), ascending tau */
  rates: number[];
  taus: number[];
  /** voltage fraction on each layer at t = 0+ and t -> infinity */
  v0: number[];
  vInf: number[];
  /** residues: V_k(t)/V = vInf[k] + sum_m res[k][m] exp(-rates[m] t) */
  res: number[][];
}

/** Build the exact step-response model for a series stack. Layers with sigma = 0 are allowed (they keep the voltage
 *  at t -> infinity, divided among themselves capacitively). */
export function driftModel(layers: Layer[]): DriftModel {
  const N = layers.length;
  if (N < 1) throw new Error("driftModel: need at least one layer");
  const cg = layers.map(CG);
  const invC = cg.map(([C]) => 1 / C);
  const sInvC = invC.reduce((a, b) => a + b, 0);
  const v0 = invC.map((x) => x / sInvC);
  const insul = cg.map(([, G]) => G === 0);
  let vInf: number[];
  if (insul.some((x) => x)) {
    const s = cg.reduce((a, [C], k) => a + (insul[k] ? 1 / C : 0), 0);
    vInf = cg.map(([C], k) => (insul[k] ? 1 / C / s : 0));
  } else {
    const sInvG = cg.reduce((a, [, G]) => a + 1 / G, 0);
    vInf = cg.map(([, G]) => 1 / G / sInvG);
  }
  // poles p_k = -G_k/C_k ; rates are roots of Z(s) = sum 1/(G_k + s C_k) = 0 between distinct consecutive poles
  const poles = [...new Set(cg.map(([C, G]) => G / C))].sort((a, b) => a - b); // as positive rates
  const Zs = (s: number) => cg.reduce((a, [C, G]) => a + 1 / (G + s * C), 0);
  const Zp = (s: number) => cg.reduce((a, [C, G]) => a - C / (G + s * C) ** 2, 0);
  const rates: number[] = [];
  for (let i = 0; i + 1 < poles.length; i++) {
    const a = poles[i];
    const b = poles[i + 1];
    const eps = (b - a) * 1e-12;
    // work in rate q = -s on (a, b)
    const q = bisect((x) => Zs(-x), a + eps, b - eps, (b - a) * 1e-15, 400);
    if (Number.isFinite(q)) rates.push(q);
  }
  rates.sort((x, y) => y - x); // fastest first -> taus ascending
  const res = layers.map((_, k) =>
    rates.map((q) => {
      const s = -q;
      const Zk = 1 / (cg[k][1] + s * cg[k][0]);
      return Zk / (s * Zp(s));
    }),
  );
  return { layers, rates, taus: rates.map((q) => 1 / q), v0, vInf, res };
}

/** Voltage fraction on layer k at time t (s) after a unit step. */
export function layerVoltage(m: DriftModel, k: number, t_s: number): number {
  let v = m.vInf[k];
  for (let i = 0; i < m.rates.length; i++) v += m.res[k][i] * Math.exp(-m.rates[i] * t_s);
  return v;
}

/** |H_k(f)| = |Z_k(j w) / Z(j w)|: small-signal voltage fraction on layer k vs frequency. */
export function layerTransfer(m: DriftModel, k: number, f_Hz: number): number {
  const w = 2 * Math.PI * f_Hz;
  let zr = 0;
  let zi = 0;
  let kr = 0;
  let ki = 0;
  m.layers.forEach((l, j) => {
    const [C, G] = CG(l);
    const d = G * G + w * w * C * C;
    const r = G / d;
    const i = (-w * C) / d;
    zr += r;
    zi += i;
    if (j === k) {
      kr = r;
      ki = i;
    }
  });
  return Math.hypot(kr, ki) / Math.hypot(zr, zi);
}

/** Two-layer closed form (R11 S8): V1(t)/V = G2/(G1+G2) + (C2/(C1+C2) - G2/(G1+G2)) exp(-t/tau), tau = (C1+C2)/(G1+G2). */
export function twoLayerClosedForm(l1: Layer, l2: Layer, t_s: number): number {
  const [C1, G1] = CG(l1);
  const [C2, G2] = CG(l2);
  const tau = (C1 + C2) / (G1 + G2);
  return G2 / (G1 + G2) + (C2 / (C1 + C2) - G2 / (G1 + G2)) * Math.exp(-t_s / tau);
}

/** Example stack, cladding / LN / BOX, for the UI. Status per field: LN eps33^T from kushibiki1999 (P); LN sigma = geometric
 *  mid of the volk2008 dark-conductivity range (P-comp range; the chosen point is a template); SiO2 eps and sigma are
 *  templates (no sourced value in R06/R08). Thicknesses are templates. */
export const DRIFT_EXAMPLE: { layers: Layer[]; prov: Record<string, Provenance> } = {
  layers: [
    { name: "SiO2 cladding", thickness_m: 1e-6, eps_r: 3.9, sigma_S_per_m: 1e-12 },
    { name: "LN film (z field)", thickness_m: 0.6e-6, eps_r: EPS_T_KUSHIBIKI1999.eps33, sigma_S_per_m: Math.sqrt(DARK_CONDUCTIVITY_CLN.min * DARK_CONDUCTIVITY_CLN.max) },
    { name: "SiO2 BOX", thickness_m: 2e-6, eps_r: 3.9, sigma_S_per_m: 1e-13 },
  ],
  prov: {
    "SiO2 cladding.eps_r": { source: "r11", status: "template" },
    "SiO2 cladding.sigma": { source: "r11", status: "template" },
    "LN film.eps_r": EPS_T_KUSHIBIKI1999.prov,
    "LN film.sigma": { source: "volk2008", status: "template", note: "geometric mid of the P-comp range 1e-16 to 1e-14 S/m" },
    "SiO2 BOX.eps_r": { source: "r11", status: "template" },
    "SiO2 BOX.sigma": { source: "r11", status: "template" },
    thicknesses: { source: "r11", status: "template" },
  },
};
