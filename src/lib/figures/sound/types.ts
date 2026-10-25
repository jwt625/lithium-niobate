// Shared types for chapter 03 pages (safe to import from client components).
export interface RefRow { id: string; short: string; cite: string; title: string; href?: string; label?: string }
import type { StatusCode } from "$lib/content/site";
/** A piezoelectric d set for Fig. 3.1 (pC/N, IEEE 176-1987 frame). */
export interface DSetIn { id: "kushibiki1999" | "smithwelsh1971"; label: string; d15: number; d22: number; d31: number; d33: number; code: StatusCode; pop: string }
/** One constant set of the precomputed rotated Y-X SAW sweep (static/data/sound/saw-sweep-<set>.json). */
export interface SweepSet {
  thresholds_mps: number[];
  ray: { vf: (number | null)[]; vm: (number | null)[]; k2: (number | null)[] };
  lsaw: { vf: (number | null)[]; vm: (number | null)[]; k2: (number | null)[]; sf: string[]; sm: string[]; lf: (number | null)[]; lm: (number | null)[] };
}
export interface SweepFile { generated: string; method: string; theta_deg: number[]; sets: Record<string, SweepSet> }
/** SAW field profile of one cut and surface (from saw.sawFields, rounded for transport). */
export interface SawProfile { v: number; vIm: number; orbit: "retrograde" | "prograde"; frac: number; bc: number; depth: number[]; c: number[][] }
export interface SawPreset { id: "YZ" | "128" | "64" | "XZ" | "XY"; label: string; wave: string; open: SawProfile; short: SawProfile }
export interface IdtCut { id: "128" | "YZ" | "64" | "41"; label: string; open: number; short: number }
/** A photoelastic set for Fig. 3.8 (eight independent 3m components as listed by the source). */
export interface PSetIn { id: "avakyants1976" | "andrushchak2009" | "krupych2014" | "coquin"; label: string; p: { p11: number; p12: number; p13: number; p14: number; p31: number; p33: number; p41: number; p44: number }; code: StatusCode; pop: string; frame: string }
