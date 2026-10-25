// Chapter 03 (Sound) figure state: one object per figure, shared by the TECH and VISUAL variants and kept across a mode
// switch or a client-side navigation back to the page (DevLog-003b sec. 9.5). Svelte 5 deep state.

export type DSet = "kushibiki1999" | "smithwelsh1971";
export const f31 = $state({ th: 90, ph: 90, set: "kushibiki1999" as DSet, view: "oblique" as "oblique" | "top" });

export type FormKey = "e" | "d" | "g" | "h" | "cE" | "cD" | "sE" | "sD" | "epsS" | "epsT";
export const f32 = $state({ form: "d" as FormKey, idx: "voigt" as "voigt" | "full", cell: [0, 5] as [number, number] });

export const f33 = $state({ plane: "YZ" as "XY" | "YZ" | "XZ", stiff: true, mode: 0 as 0 | 1 | 2, ang: 90, view: "oblique" as "oblique" | "top" | "side" });

export type SawSetId = "kushibiki1999" | "ogi2002" | "warner1967";
export const f34 = $state({ theta: 128, set: "kushibiki1999" as SawSetId, ray: true, lsaw: true, logK: false });

export type CutPreset = "YZ" | "128" | "64" | "XZ" | "XY";
export const f35 = $state({ cut: "128" as CutPreset, surface: "open" as "open" | "short", phase: 0 });

export const f36 = $state({ cut: "128" as "128" | "YZ" | "64" | "41", surface: "open" as "open" | "short", p_um: 4, N: 20, eta: 0.5, tone: 0 });

export const f37 = $state({ lam_nm: 1550, logf: 9, mode: "XL" as "XL" | "ZS" | "SAW", pol: "e" as "o" | "e" });

export type PSet = "avakyants1976" | "andrushchak2009" | "krupych2014" | "coquin";
export const f38 = $state({ cut: "X" as "X" | "Y" | "Z", phi: 45, set: "andrushchak2009" as PSet });

export const f39 = $state({ lognc: 4.6, det: "blue" as "red" | "blue", kC0: 0, kEtaM: 0 });

export const f310 = $state({ step: 0, panel: "fig2a" as string });

export const f311 = $state({ logR: 1, U: 1, act: "bender" as "plate" | "extension" | "bender" });
