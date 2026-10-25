// FIG-01-09 Poling bench: simulation driver shared by the prerender (+page.server.ts) and the client (pb.ts).
// Physics from src/lib/physics/ferro.ts only (template automaton, sourced Ps / Ec / Eint anchors, Y-wall facets, nucleation at
// the +z electrode edges, backswitching suppressed by a hold at Ec/2). This file adds display-level choices, all template:
//   grid 96 x 64 sites (periodic), comb presets, a trapezoid pulse (0.2 ms edges), a hold at Ec/2 that lasts 55 ms after the
//   pulse, a 60 ms window after the pulse, dt 0.05 ms, a playback schedule (stepAt).
// Electrode capacitance for the displacement term: parallel plate over the comb area of the simulated patch,
// C = eps0 eps33 A_el / d with eps33 = 28 (weis1985 Table 1; same value as section 1.2), fringe fields ignored (derived).
// PbRun mirrors runPoling (ferro.ts) step for step (same RNG order, same V(t - dt/2) sampling), so a run advanced in chunks
// gives the same states as runPoling with the same seed; it exists so the client can spread the work over frames.
// Relative imports with .ts extension so the same file runs under Vite and under plain node (verification scripts).
import { POLING_TEMPLATE, createPolingState, polingStep, siteArea, switchingCurrent, switchingChargeFromCurrent, kaiFit, type PolingParams, type PolingState } from "../../physics/ferro.ts";
import { createRng, type Rng } from "../../physics/prng.ts";
import { EPS0 } from "../../physics/constants.ts";

export type ElKey = "a" | "b" | "c";
export interface PbCfg { E: number; T: number; hold: boolean; el: ElKey; seed: number }

/** Comb presets in lattice columns (template): period and finger width; the grid width 96 is a multiple of each period. */
export const PB_EL: Readonly<Record<ElKey, { period: number; w: number }>> = { a: { period: 32, w: 13 }, b: { period: 32, w: 10 }, c: { period: 48, w: 19 } };
export const PB = { nx: 96, ny: 64, dt: 0.05e-3, tr: 0.2e-3, tail: 60e-3, holdLen: 55e-3, eps33: 28, framesA: 240, framesB: 120, tA: 8e-3 } as const;
/** Control ranges (kV/mm, ms, seed). */
export const PB_RANGE = { E: [18, 26, 0.5], T: [1, 80, 1], seed: [1, 99, 1] } as const;
export const PB_DEFAULT: PbCfg = { E: 22, T: 10, hold: true, el: "a", seed: 7 };

const T0 = POLING_TEMPLATE.params;
export const colPitch_um = (T0.spacing_m * 1e6 * Math.sqrt(3)) / 2;
export const period_um = (k: ElKey): number => PB_EL[k].period * colPitch_um;
export const elDuty = (k: ElKey): number => PB_EL[k].w / PB_EL[k].period;
export const patchArea = (): number => PB.nx * PB.ny * siteArea(T0);

export function pbParams(cfg: PbCfg): PolingParams {
  const e = PB_EL[cfg.el];
  const duty = e.w / e.period;
  const C_F = (EPS0 * PB.eps33 * duty * PB.nx * PB.ny * siteArea(T0)) / T0.thickness_m;
  return { ...T0, nx: PB.nx, ny: PB.ny, period_cols: e.period, duty, C_F };
}

/** Applied voltage (V) at time t (s): ramp to V0, plateau to T, ramp to the hold level (Ec/2 x d) or 0, hold, ramp to 0. */
export function waveform(cfg: PbCfg, p: PolingParams): (t: number) => number {
  const V0 = cfg.E * 1e6 * p.thickness_m, T = cfg.T * 1e-3, tr = PB.tr;
  const Vh = cfg.hold ? p.holdFraction * p.Ec * p.thickness_m : 0, Th = T + PB.holdLen;
  return (t) => (t <= 0 ? 0 : t < tr ? (V0 * t) / tr : t < T ? V0 : t < T + tr ? V0 + ((Vh - V0) * (t - T)) / tr : t < Th ? Vh : t < Th + tr ? Vh * (1 - (t - Th) / tr) : 0);
}

export class PbRun {
  readonly cfg: PbCfg;
  readonly p: PolingParams;
  readonly st: PolingState;
  readonly n: number;
  readonly kPulse: number;
  readonly kA: number;
  readonly t: Float64Array;
  readonly V: Float64Array;
  readonly A: Float64Array;
  readonly X: Float64Array;
  readonly Vf: (t: number) => number;
  k = 0;
  private rng: Rng;
  private a0: number;
  constructor(cfg: PbCfg) {
    this.cfg = { ...cfg };
    this.p = pbParams(cfg);
    this.st = createPolingState(this.p);
    this.rng = createRng(cfg.seed);
    this.a0 = siteArea(this.p);
    this.n = Math.round((cfg.T * 1e-3 + PB.tail) / PB.dt);
    this.kPulse = Math.round((cfg.T * 1e-3) / PB.dt);
    this.kA = Math.min(this.n, Math.round((cfg.T * 1e-3 + PB.tA) / PB.dt));
    this.Vf = waveform(cfg, this.p);
    const m = this.n + 1;
    this.t = new Float64Array(m); this.V = new Float64Array(m); this.A = new Float64Array(m); this.X = new Float64Array(m);
    for (let k = 0; k <= this.n; k++) { this.t[k] = k * PB.dt; this.V[k] = this.Vf(k * PB.dt); }
  }
  get done(): boolean { return this.k >= this.n; }
  /** Playback schedule (display choice): step reached at animation frame f; the pulse and the 8 ms after it take framesA
   *  frames, the rest of the window framesB. A fixed function of the parameters, so frames are reproducible. */
  stepAt(f: number): number {
    const { framesA: A, framesB: B } = PB;
    return f <= A ? Math.round((f / A) * this.kA) : Math.min(this.n, Math.round(this.kA + ((f - A) / B) * (this.n - this.kA)));
  }
  /** Advance up to m steps (same sequence as runPoling). */
  advance(m: number): void {
    if (!(m > 0)) return;
    const { st, p, a0 } = this;
    const N = st.s.length, dt = PB.dt;
    const end = Math.min(this.n, this.k + m);
    for (let k = this.k + 1; k <= end; k++) {
      const tk = k * dt;
      polingStep(st, this.Vf(tk - dt / 2) / p.thickness_m, dt, this.rng);
      let cnt = 0;
      for (let i = 0; i < N; i++) cnt += st.s[i];
      this.A[k] = cnt * a0;
      this.X[k] = cnt / N;
    }
    this.k = end;
  }
  finish(): void { this.advance(this.n - this.k); }
}

export interface PbAnalysis {
  k: number;
  I: Float64Array; // A, samples 0..k
  Q: Float64Array; // C, cumulative int (I - C dV/dt) dt
  Qtot: number; // switchingChargeFromCurrent over 0..k
  QA: number; // 2 Ps A of the map at step k
  Xmax: number; // max X during the pulse plateau (so far)
  fit: { n: number; t0: number; r2: number; used: number } | null; // KAI fit of X / Xmax over the pulse, once the pulse has ended
}

/** Current, charge and KAI fit of the first k + 1 samples for polarization Ps (C/m^2). */
export function analyse(r: PbRun, Ps: number): PbAnalysis {
  const k = r.k, m = k + 1;
  const t = r.t.subarray(0, m), V = r.V.subarray(0, m), A = r.A.subarray(0, m);
  const C = r.p.C_F;
  const I = m > 1 ? switchingCurrent(t, A, Ps, C, V) : new Float64Array(m);
  const Id = m > 1 ? switchingCurrent(t, A, 0, C, V) : new Float64Array(m); // C dV/dt alone
  const Q = new Float64Array(m);
  for (let i = 1; i < m; i++) Q[i] = Q[i - 1] + 0.5 * (I[i] - Id[i] + I[i - 1] - Id[i - 1]) * (t[i] - t[i - 1]);
  const Qtot = m > 1 ? switchingChargeFromCurrent(t, I, C, V) : 0;
  let Xmax = 0;
  const kp = Math.min(k, r.kPulse);
  for (let i = 0; i <= kp; i++) if (r.X[i] > Xmax) Xmax = r.X[i];
  let fit: PbAnalysis["fit"] = null;
  if (k >= r.kPulse && Xmax > 0) {
    const Xn = new Float64Array(r.kPulse + 1);
    for (let i = 0; i <= r.kPulse; i++) Xn[i] = r.X[i] / Xmax;
    const f = kaiFit(r.t.subarray(0, r.kPulse + 1), Xn);
    if (Number.isFinite(f.n)) fit = f;
  }
  return { k, I, Q, Qtot, QA: 2 * Ps * A[k], Xmax, fit };
}

/** Map state as hex string (4 sites per digit) for shipping the prerendered final state to the client. */
export function packState(s: Uint8Array): string {
  let o = "";
  for (let i = 0; i < s.length; i += 4) o += (s[i] | (s[i + 1] << 1) | (s[i + 2] << 2) | (s[i + 3] << 3)).toString(16);
  return o;
}
export function unpackState(h: string, N: number): Uint8Array {
  const s = new Uint8Array(N);
  for (let j = 0; j < h.length; j++) { const v = parseInt(h[j], 16); for (let b = 0; b < 4 && 4 * j + b < N; b++) s[4 * j + b] = (v >> b) & 1; }
  return s;
}
