// F7.5 Diffusion profile: proton exchange (jackel1982) as a step-index layer of depth d with d^2 = r t (fab.ts peDepth;
// whether the reported rate is d^2/t or D is not confirmed from the full text) and Delta n_e = 0.12; the fundamental
// TE-like mode of the asymmetric slab (air / guide / LN substrate) at 633 nm, n_e from Zelmon 1997 (21 C).
// Li2O out-diffusion and Ti in-diffusion: no diffusion constants in the sources held; only their sourced anchors are drawn.
import { peDepth } from "$lib/physics/fab.ts";
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { ZELMON_CLN_E } from "$lib/physics/constants.ts";

export const LAM = 0.6328, DN_PE = 0.12;
export const NS = refractiveIndex(ZELMON_CLN_E, LAM);

/** Fundamental mode of the asymmetric step slab: effective index and |E|^2 sampled on depth z (um); null if cut off. */
export function slabMode(d: number, dn: number, z: number[]): { N: number; I: number[] } | null {
  const nf = NS + dn, nc = 1, k0 = (2 * Math.PI) / LAM;
  const f = (N: number): number => { const kf = Math.sqrt(nf * nf - N * N), gs = Math.sqrt(N * N - NS * NS), gc = Math.sqrt(N * N - nc * nc); return k0 * d * kf - Math.atan(gs / kf) - Math.atan(gc / kf); };
  let a = NS + 1e-9, b = nf - 1e-9;
  if (f(a) < 0) return null;
  for (let i = 0; i < 80; i++) { const m = 0.5 * (a + b); if (f(m) > 0) a = m; else b = m; }
  const N = 0.5 * (a + b), kf = k0 * Math.sqrt(nf * nf - N * N), gs = k0 * Math.sqrt(N * N - NS * NS), gc = k0 * Math.sqrt(N * N - 1);
  const phi = Math.atan(gc / (kf / k0) / k0); // phase at the surface
  const I = z.map((x) => {
    if (x < 0) return Math.cos(phi) ** 2 * Math.exp(2 * gc * x);
    if (x <= d) return Math.cos(kf * x - phi) ** 2;
    return Math.cos(kf * d - phi) ** 2 * Math.exp(-2 * gs * (x - d));
  });
  const mx = Math.max(...I);
  return { N, I: I.map((v) => v / mx) };
}
export const pe = (T: number, t: number): { d: number; valid: boolean } => { const r = peDepth(T, t, "d2t"); return { d: r.d_um, valid: r.valid }; };
