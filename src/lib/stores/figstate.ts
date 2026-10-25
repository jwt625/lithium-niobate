// Shared figure state (DevLog-003b sec. 9.5): one object per instrument, read and written by both the TECH and the VISUAL
// variant, so a mode switch (or a client-side navigation back to the page) keeps every value and the 3D camera.
// Plain mutable objects: the figure modules are imperative and repaint on their own events.

export interface ConoState { E: number; d: number; dir: "x" | "y"; src: "633" | "white" | null }
export interface MzmState { V: number }
export interface RtState { e: 0 | 1 | 2; p: 0 | 1 | 2; s: "turner" | "kaminow" | "free" }
export interface CellState { yaw: number; pitch: number; zoom: number; show: Record<"nb" | "li" | "vac" | "ax" | "bonds" | "sup", boolean> }

/** Conoscope: field E (kV/mm), thickness d (mm), field direction, source (null = mode default: 633 nm TECH, white VISUAL). */
export const cono: ConoState = { E: 0, d: 0.6, dir: "x", src: null };
/** MZM drive voltage (V). */
export const mzm: MzmState = { V: 0 };
/** r-tensor explorer: field direction, optical polarization, coefficient set. */
export const rt: RtState = { e: 2, p: 2, s: "turner" };
export const CELL_DEFAULT = { yaw: (72 * Math.PI) / 180, pitch: (12 * Math.PI) / 180, zoom: 1 } as const;
/** Unit-cell camera and toggles (TECH ASCII and VISUAL three.js share one camera). */
export const cell: CellState = { ...CELL_DEFAULT, show: { nb: true, li: false, vac: true, ax: true, bonds: false, sup: false } };
