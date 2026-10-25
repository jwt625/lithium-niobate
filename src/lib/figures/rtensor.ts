// 3m Pockels tensor explorer state and math (chapter 2.2 L2), shared by the TECH matrix panel and the VISUAL ellipsoid.
// Physics: src/lib/physics (EO sets with provenance, r3m form, impermeability, Jacobi eigen-decomposition).
import { EO_KAMINOW1980_S, EO_TURNER1966_S, EO_ZOOK1967_T, type EOSet } from "$lib/physics/constants.ts";
import { impermeability as imp } from "$lib/physics/crystaloptics.ts";
import { eigSym3, type Mat3, type Vec3 } from "$lib/physics/linalg.ts";
import { r3m } from "$lib/physics/tensors.ts";
import { rt as st, type RtState } from "$lib/stores/figstate";
import { nCLN } from "./optics.ts";

export { st };
/** Coefficient sets (pm/V, 633 nm, all via Weis & Gaylord 1985, P-comp). "free" = Zook et al. 1967 + Bernal 1966 (r51). */
export const SETS: Record<RtState["s"], EOSet> = { turner: EO_TURNER1966_S, kaminow: EO_KAMINOW1980_S, free: EO_ZOOK1967_T };
type Cell = [name: "r13" | "r22" | "r33" | "r51", sign: number] | null;
/** 3m form, x perpendicular to a mirror plane, z along c; rows I = 1..6 (xx, yy, zz, yz, xz, xy), columns E_x, E_y, E_z. */
export const FORM: Cell[][] = [
  [null, ["r22", -1], ["r13", 1]],
  [null, ["r22", 1], ["r13", 1]],
  [null, null, ["r33", 1]],
  [null, ["r51", 1], null],
  [["r51", 1], null, null],
  [["r22", -1], null, null],
];
export const coef = (S: EOSet, c: Cell): number => (c ? S[c[0]] * c[1] : 0);

export interface Imperm { no: number; ne: number; n: Vec3; dB: number[]; B0: Vec3; B: Mat3 }
/** Impermeability at E = 1 V/um along st.e, lambda = 1.55 um (n_o, n_e: Zelmon 1997). */
export function imperm(): Imperm {
  const S = SETS[st.s], E = 1e6, no = nCLN("o", 1.55), ne = nCLN("e", 1.55);
  const r = r3m({ r13: S.r13 * 1e-12, r22: S.r22 * 1e-12, r33: S.r33 * 1e-12, r51: S.r51 * 1e-12 });
  const Ev: Vec3 = [0, 0, 0]; Ev[st.e] = E;
  const B = imp(no, ne, r, Ev), B0: Vec3 = [1 / no ** 2, 1 / no ** 2, 1 / ne ** 2];
  const dB = r.map((row) => row[0] * Ev[0] + row[1] * Ev[1] + row[2] * Ev[2]); // contracted I = xx, yy, zz, yz, xz, xy
  return { no, ne, n: [no, no, ne], dB, B0, B };
}
/** Symmetric 3x3 eigen-decomposition: values and unit vectors (vec[i] for val[i]). */
export function jacobi(A: Mat3): { val: Vec3; vec: Mat3 } { const r = eigSym3(A); return { val: r.values, vec: r.vectors }; }

/** Notify both views after a state change. */
export const rtChanged = (): void => { window.dispatchEvent(new CustomEvent("ln-rt")); };
export function onRt(cb: () => void): () => void { window.addEventListener("ln-rt", cb); return () => window.removeEventListener("ln-rt", cb); }
