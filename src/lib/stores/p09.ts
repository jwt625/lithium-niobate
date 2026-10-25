// Shared state of the lane P09 instruments: read and written by both the TECH and the VISUAL variant, so a mode switch
// (or a client-side navigation back) keeps every value. Plain mutable objects; the figure modules repaint on their events.

export type Proc = "shg" | "sfg" | "dfg" | "opo";
export type PmModel = "zelmon-cln" | "zelmon-mgo5" | "gayer-mgo5" | "gayer-mgo1sln" | "jundt-cln";
export interface PmState {
  proc: Proc;
  model: PmModel;
  /** SHG fundamental, SFG wave 1, DFG/OPO pump (um). */
  l1: number;
  /** SFG wave 2, DFG signal (um). */
  l2: number;
  /** OPO poling period (um). */
  period: number;
  T: number;
  m: 1 | 3 | 5;
  duty: number;
  L_mm: number;
}
export const PM_DEFAULT: Readonly<PmState> = { proc: "shg", model: "zelmon-cln", l1: 1.55, l2: 1.55, period: 30, T: 21, m: 1, duty: 0.5, L_mm: 10 };
export const pm: PmState = { ...PM_DEFAULT };

export type TensorId = "c" | "s" | "e" | "d" | "r" | "dshg" | "p" | "epsT";
export interface TxState {
  tensor: TensorId;
  cut: string; // named cut or "euler"
  alpha: number; // deg, Euler ZXZ
  beta: number;
  gamma: number;
  rot180: boolean; // frame rotated 180 deg about z
  flipZ: boolean; // +z reversed (180 deg about x)
}
export const TX_DEFAULT: Readonly<TxState> = { tensor: "e", cut: "Z-cut, X-prop", alpha: 0, beta: 0, gamma: 0, rot180: false, flipZ: false };
export const tx: TxState = { ...TX_DEFAULT };

export interface DataFilter { prop: string; variant: string; status: string; kind: "all" | "scalar" | "tensor" }
export const dataFilter: DataFilter = { prop: "", variant: "", status: "", kind: "all" };

export interface DispState { on: string[]; T: number; lam: number; log: boolean }
export const disp: DispState = { on: ["zelmon1997-cln-o", "zelmon1997-cln-e"], T: 24.5, lam: 1.55, log: true };

export interface LibFilter { ch: string; sec: string; from: number; to: number; q: string }
export const libFilter: LibFilter = { ch: "", sec: "", from: 0, to: 9999, q: "" };
