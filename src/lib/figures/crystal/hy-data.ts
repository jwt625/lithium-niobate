// FIG-01-08 Hysteresis comparator: sourced anchors (content/chapters/01-crystal/manuscript.md Sec. 8 L2 table). Values in
// kV/mm, room temperature, forward coercive field (from the virgin state) and internal field. Ranges stay ranges: every
// renderer works on {lo, hi}. Popup keys are literal so the server-side popup scan finds them (sources.server.ts).
import type { StatusCode } from "$lib/content/site";

export type HyId = "cln" | "sln" | "mg5" | "zn8" | "smg1" | "smg2";
export interface Rng { lo: number; hi: number }
export interface HyCrystal {
  id: HyId;
  /** full name (HUD, tables) */
  name: string;
  /** short label (buttons, ASCII key) */
  short: string;
  /** ASCII plot glyph */
  glyph: string;
  ec: Rng;
  /** Ec as printed by the source */
  ecTxt: string;
  /** value +- uncertainty as reported (chen2003), used for the voltage readout */
  pm?: { c: number; u: number };
  ecCode: StatusCode; ecBadge?: string; ecPop: string;
  /** "value": a sourced number or range; "zero": source says "tends to 0" (drawn 0); "nr": not reported (drawn 0) */
  eintState: "value" | "zero" | "nr";
  eint: Rng;
  eintTxt: string;
  eintCode: StatusCode; eintBadge?: string; eintPop: string;
  /** near-SLN: second Ec printed by the same source (volk2008 p. 118), conflict c:ec-sln */
  alt?: Rng;
  /** congruent: single-value Eint report (gopalan1998 abstract) */
  mark?: number;
}

export const PS: Rng = { lo: 0.71, hi: 0.8 }; // C/m^2, conflict c:ps (Volk & Wöhlecke 2008 Table 1.1 p. 3 / Gopalan et al. 1998 abstract)
export const E_MAX = 25; // kV/mm, half-span of the plotted field axis
export const P_MAX = 1; // C/m^2, half-span of the plotted polarization axis

export const HY: readonly HyCrystal[] = [
  { id: "cln", name: "Congruent", short: "CLN", glyph: "#", ec: { lo: 21, hi: 21 }, ecTxt: "21", ecCode: "P-comp", ecPop: "r:volk2008|Table 7.1 p. 185",
    eintState: "value", eint: { lo: 2.2, hi: 3.4 }, eintTxt: "2.2–3.4", eintCode: "P-comp", eintPop: "r:volk2008|Table 7.1 p. 185 and p. 181", mark: 2.5 },
  { id: "sln", name: "Near-stoichiometric", short: "near-SLN", glyph: "o", ec: { lo: 6.0, hi: 6.5 }, ecTxt: "6.0–6.5", ecCode: "P-comp", ecPop: "r:volk2008|Table 7.1 p. 185",
    eintState: "zero", eint: { lo: 0, hi: 0 }, eintTxt: "→ 0", eintCode: "P-comp", eintPop: "r:volk2008|Table 7.1 p. 185", alt: { lo: 2.1, hi: 2.5 } },
  { id: "mg5", name: "CLN + 5% MgO", short: "CLN:5%MgO", glyph: "+", ec: { lo: 6.0, hi: 6.8 }, ecTxt: "6.0–6.8", ecCode: "P-comp", ecPop: "r:volk2008|Table 7.1 p. 185",
    eintState: "value", eint: { lo: 0.5, hi: 0.5 }, eintTxt: "0.5", eintCode: "P-comp", eintPop: "r:volk2008|Table 7.1 p. 185" },
  { id: "zn8", name: "CLN + 8% ZnO", short: "CLN:8%ZnO", glyph: "x", ec: { lo: 2.5, hi: 3.5 }, ecTxt: "2.5–3.5", ecCode: "P-comp", ecPop: "r:volk2008|Table 7.1 p. 185",
    eintState: "value", eint: { lo: 0.5, hi: 0.5 }, eintTxt: "0.5", eintCode: "P-comp", eintPop: "r:volk2008|Table 7.1 p. 185" },
  { id: "smg1", name: "Near-SLN + 1% MgO", short: "nSLN:1%MgO", glyph: "*", ec: { lo: 2.5, hi: 2.5 }, ecTxt: "2.5", ecCode: "P-comp", ecPop: "r:volk2008|Table 7.1 p. 185",
    eintState: "zero", eint: { lo: 0, hi: 0 }, eintTxt: "→ 0", eintCode: "P-comp", eintPop: "r:volk2008|Table 7.1 p. 185" },
  { id: "smg2", name: "Near-SLN + 2.0 mol% MgO (VTE)", short: "nSLN:2%MgO", glyph: "@", ec: { lo: 1.6, hi: 2.0 }, ecTxt: "1.8 ± 0.2", pm: { c: 1.8, u: 0.2 }, ecCode: "P", ecBadge: "P(abs)", ecPop: "r:chen2003|abstract",
    eintState: "nr", eint: { lo: 0, hi: 0 }, eintTxt: "not reported", eintCode: "P", eintBadge: "P(abs)", eintPop: "r:chen2003|abstract" },
];

export const hyById = (id: HyId): HyCrystal => HY.find((c) => c.id === id) as HyCrystal;
