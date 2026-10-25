// F7.2b OPO dial: signal and idler from energy conservation and phase matching, with the site's Sellmeier module.
// 1995 (Myers et al.): pump 1.064 um, first-order QPM e-e-e in congruent LN, Jundt 1997 n_e(lambda, T) (status S;
// valid 0.4-5 um, 20-250 C). 1965 (Giordmaine & Miller): pump 0.529 um, type-I birefringent (o + o -> e) in congruent
// LN at 21 C, Zelmon 1997 (P-db). No temperature-dependent n_o model is held, so the 1965 knob is the crystal angle;
// the 1965 crystal composition and phase-matching temperature are not documented in the sources held.
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { opoSignalIdler } from "$lib/physics/phasematching.ts";
import { JUNDT_CLN_E, ZELMON_CLN_E, ZELMON_CLN_O } from "$lib/physics/constants.ts";

export const LP65 = 0.529, LP95 = 1.064;
const LMAX = 5.0; // um, Sellmeier window
const ne95 = (l: number, T?: number): number => refractiveIndex(JUNDT_CLN_E, l, T);
export interface SI { s: number; i: number }
const NONE: SI = { s: NaN, i: NaN };

/** 1995: signal/idler for period (um) and temperature (C). */
export function opo95(period: number, T: number): SI {
  if (T < 20 || T > 250) return NONE;
  const r = opoSignalIdler(LP95, period, { ns: ne95, ni: ne95, np: ne95 }, 1 / (1 / LP95 - 1 / LMAX) + 1e-4, T);
  return { s: r.signal, i: r.idler };
}

const no = (l: number): number => refractiveIndex(ZELMON_CLN_O, l);
const ne = (l: number): number => refractiveIndex(ZELMON_CLN_E, l);
const neTheta = (th: number, l: number): number => 1 / Math.sqrt(Math.cos(th) ** 2 / no(l) ** 2 + Math.sin(th) ** 2 / ne(l) ** 2);
/** 1965: type-I o + o -> e at polar angle theta (deg) from the c axis, 21 C. Returns the root nearest degeneracy. */
export function opo65(thetaDeg: number): SI {
  const th = (thetaDeg * Math.PI) / 180, kp = neTheta(th, LP65) / LP65;
  const f = (ls: number): number => { const li = 1 / (1 / LP65 - 1 / ls); return kp - no(ls) / ls - no(li) / li; };
  const hi = 2 * LP65, lo = 1 / (1 / LP65 - 1 / LMAX) + 1e-4, N = 600;
  let px = hi, pf = f(hi);
  for (let k = 1; k <= N; k++) {
    const x = hi - ((hi - lo) * k) / N, fx = f(x);
    if (pf * fx <= 0) {
      let a = x, b = px, fa = fx;
      for (let it = 0; it < 60; it++) { const m = 0.5 * (a + b), fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
      const s = 0.5 * (a + b);
      return { s, i: 1 / (1 / LP65 - 1 / s) };
    }
    px = x; pf = fx;
  }
  return NONE;
}

export type Mode = "1965" | "1995";
export interface State { mode: Mode; T: number; period: number; theta: number }
export const DEFAULT: State = { mode: "1995", T: 100, period: 31, theta: 70 };
export const solve = (st: State): SI => (st.mode === "1995" ? opo95(st.period, st.T) : opo65(st.theta));

/** Tuning curve over the active knob: x values and signal/idler (NaN where no solution). */
export function curve(st: State, n = 116): { x: number[]; s: number[]; i: number[]; x0: number; x1: number } {
  const [x0, x1] = st.mode === "1995" ? [20, 250] : [50, 90];
  const x: number[] = [], s: number[] = [], i: number[] = [];
  for (let k = 0; k <= n; k++) {
    const v = x0 + ((x1 - x0) * k) / n;
    const r = st.mode === "1995" ? opo95(st.period, v) : opo65(v);
    x.push(v); s.push(r.s); i.push(r.i);
  }
  return { x, s, i, x0, x1 };
}

/** Reference bands "as reported" with sources. */
export const REF: Record<Mode, { lo: number; hi: number; label: string; src: string; st: "S" | "V" }[]> = {
  "1965": [{ lo: 0.97, hi: 1.15, label: "0.97-1.15 um, 1965, temperature-tuned", src: "belllabsrecord1965", st: "S" }],
  "1995": [
    { lo: 1.66, hi: 2.95, label: "1.66-2.95 um at 31 um, temperature-tuned", src: "myers1995a", st: "V" },
    { lo: 1.4, hi: 4.0, label: "1.4-4 um overall", src: "myers1995b", st: "V" },
  ],
};
export const fmtL = (v: number): string => (Number.isFinite(v) ? `${v.toFixed(3)} µm` : "--.--- µm").padStart(8, " ");
