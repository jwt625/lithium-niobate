// Chapter 01 figure state shared between the TECH and VISUAL variant of each instrument (DevLog-003b sec. 9.5), so a mode
// switch or a client-side navigation back to a section keeps every value. Plain mutable objects; figure modules repaint on
// their own events. The unit-cell camera and lattice toggles stay in src/lib/stores/figstate.ts (`cell`, shared with the
// landing page); this file holds only the chapter's additions.

/** FIG-01-01 overlays on the shared unit cell: rhombohedral primitive cell, cleavage plane (01-12), octahedral column. */
export const cellx = { rh: false, cl: false, col: false };

/** FIG-01-06 Neumann machine: property, generator toggles of 3m, applied static field direction ("0" = none). */
export const neumann: { kind: "pyro" | "eps" | "d" | "r" | "c" | "s" | "p"; ops: { C3: boolean; myz: boolean; mp60: boolean; mm60: boolean }; field: "0" | "x" | "y" | "z" } =
  { kind: "d", ops: { C3: true, myz: true, mp60: true, mm60: true }, field: "0" };

/** FIG-01-07 Which face is +z: plate turned over (face B is +z), and the three tests applied (compress, cool, etch). */
export const plusz = { flip: false, sq: false, cool: false, etch: false };

/** 1.3 Temperature axis and FIG-01-03 Composition dial (shared): crystal Li2O content c (mol%), defect compensation model,
 *  Curie temperature entered for the inverse gauge (C). */
export const comp: { c: number; model: "Li-site" | "Nb-site"; tcIn: number } = { c: 48.45, model: "Li-site", tcIn: 1142.3 };

/** FIG-01-02 One cell, flipped: flip parameter s in [-1, 1], displacement frame, applied field along +c (kV/mm). */
export const flip: { s: number; frame: "O" | "Nb" | "com"; E: number } = { s: 1, frame: "O", E: 0 };

/** FIG-01-04 Defect and polaron gallery: selected centre, 532 nm pump marker, illumination below 80 K (bipolaron hop). */
export const defects: { sel: "nbli" | "vli" | "vnb" | "nbli4" | "nbnb4" | "bip" | "hole" | "oh" | "b740"; pump: boolean; cold: boolean } =
  { sel: "nbli4", pump: false, cold: false };

/** FIG-01-05 Threshold explorer: dopant, host crystal, dopant content (mol% as printed, 0-9, step 0.1). */
export const thresh: { dop: string; host: string; c: number } = { dop: "MgO", host: "cln", c: 2.5 };

/** FIG-01-08 Hysteresis comparator: emphasized crystal, crystals overlaid in the loop plot, wafer thickness (mm, 0.1-1). */
export const hyst: { sel: "cln" | "sln" | "mg5" | "zn8" | "smg1" | "smg2"; show: Record<"cln" | "sln" | "mg5" | "zn8" | "smg1" | "smg2", boolean>; t: number } =
  { sel: "cln", show: { cln: true, sln: true, mg5: true, zn8: true, smg1: true, smg2: true }, t: 0.5 };

/** FIG-01-09 Poling bench: pulse amplitude (kV/mm), duration (ms), hold at Ec/2 after the pulse, comb preset, random seed,
 *  Ps used for current and charge (C/m^2; 0.71 or 0.80, conflict c:ps), VISUAL image contrast (SHG walls or etched face),
 *  logarithmic time axis of the traces. */
export const poling: { E: number; T: number; hold: boolean; el: "a" | "b" | "c"; seed: number; ps: number; view: "shg" | "etch"; tlog: boolean } =
  { E: 22, T: 10, hold: true, el: "a", seed: 7, ps: 0.71, view: "shg", tlog: true };

/** FIG-01-10 Powers of ten along a wall: L = log10(scale bar / nm) in [-1, 4], wall tilt from c (deg, 0-5), Ps used for the
 *  bound charge (C/m^2; 0.71 or 0.80, conflict c:ps). */
export const wall: { L: number; th: number; ps: number } = { L: 4, th: 0, ps: 0.71 };

/** 1.1 VISUAL octahedral columns: selected octahedral level k (0-5, one per c/6). */
export const octcol = { k: 0 };
