// FIG-01-05 Threshold explorer: data, re-keyed from content/chapters/01-crystal/manuscript.md Sec. 6 L2 (threshold table,
// Mg site-occupancy table, threshold-signature table) and L3 (units trap). Nothing here is interpolated or converted: every
// marker is a printed value with its source key; concentrations stay on the basis each source printed (mol%, at.%, or "%").
// Popup keys are literal ("r:<id>|<locator>") so sources.server.ts finds them in this file's ?raw text.

export type Dop = "MgO" | "ZnO" | "In2O3" | "Sc2O3" | "HfO2" | "ZrO2";
export type Host = "cln" | "m12" | "nsln";
export type Code = "P" | "P-comp";

export const DOPS: readonly Dop[] = ["MgO", "ZnO", "In2O3", "Sc2O3", "HfO2", "ZrO2"];
export const HOSTS: readonly Host[] = ["cln", "m12", "nsln"];
/** Chemical formula as HTML. */
export const DOP_HTML: Record<Dop, string> = { MgO: "MgO", ZnO: "ZnO", In2O3: "In<sub>2</sub>O<sub>3</sub>", Sc2O3: "Sc<sub>2</sub>O<sub>3</sub>", HfO2: "HfO<sub>2</sub>", ZrO2: "ZrO<sub>2</sub>" };
export const HOST_NAME: Record<Host, { short: string; ascii: string; asciiN: string; html: string }> = {
  cln: { short: "CLN", ascii: "CLN", asciiN: "CLN", html: "Congruent" },
  m12: { short: "melt 1.2", ascii: "melt 1.2", asciiN: "m1.2", html: "Melt [Li]/[Nb] = 1.2" },
  nsln: { short: "NSLN", ascii: "NSLN", asciiN: "NSLN", html: "Near-stoichiometric" },
};

/** One printed threshold value on the concentration axis. kind: "lt" = upper bound (threshold below v); "range" = v to hi. */
export interface Mark { k: string; v: number; hi?: number; kind: "at" | "about" | "ge" | "gt" | "lt" | "range" }
/** One line of the threshold box: the keys it covers, the printed value, a short note, the source, the popup key. */
export interface Row { keys: string; val: string; note: string; src: string; pop: string; code: Code; abs?: boolean }
export interface Group { marks: Mark[]; rows: Row[] }

const G = (marks: Mark[], rows: Row[]): Group => ({ marks, rows });
const NONE: Group = { marks: [], rows: [] };

export const THRESH: Record<Dop, Record<Host, Group>> = {
  MgO: {
    cln: G(
      [{ k: "a", v: 4.5, kind: "ge" }, { k: "b", v: 4.6, kind: "at" }, { k: "c", v: 5.0, kind: "about" }, { k: "d", v: 5.5, kind: "at" }],
      [
        { keys: "a", val: "&ge; 4.5 at.%", note: "photoconductivity &times;100; Glass current unchanged", src: "Bryan et al. 1984", pop: "r:bryan1984|abstract", code: "P", abs: true },
        { keys: "b", val: "4.6 % Mg", note: "damage reduced; first report", src: "Volk & Wöhlecke 2008 p. 34", pop: "r:volk2008|p. 34, orig. Zhong et al. 1980;zhong1980|original abstract, cited via Volk & Wöhlecke 2008", code: "P-comp" },
        { keys: "c", val: "~5 mol%", note: "in the congruent melt", src: "Volk & Wöhlecke 2008 p. 34", pop: "r:volk2008|p. 34", code: "P-comp" },
        { keys: "d", val: "5.5 %", note: "&ldquo;close to the Nb<sub>Li</sub> content&rdquo;", src: "Volk & Wöhlecke 2008 p. 38", pop: "r:volk2008|p. 38", code: "P-comp" },
      ]),
    m12: G(
      [{ k: "a", v: 3.0, kind: "at" }],
      [{ keys: "a", val: "3 %", note: "&ldquo;lowered to 3%&rdquo; in Li-rich melt", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" }]),
    nsln: G(
      [{ k: "a", v: 0.2, kind: "at" }, { k: "b", v: 0.67, kind: "at" }, { k: "c", v: 0.78, kind: "gt" }, { k: "d", v: 1.0, kind: "about" }, { k: "e", v: 1.0, hi: 2.0, kind: "range" }],
      [
        { keys: "c", val: "&gt; 0.78 mol%", note: "no damage at 532 nm to 2 MW/cm<sup>2</sup>; [Li]/[Nb] 0.993", src: "Furukawa et al. 2000", pop: "r:furukawa2000|abstract", code: "P", abs: true },
        { keys: "a b", val: "0.2; 0.67 mol%", note: "other reports; 0.67 mol% by TSSG", src: "Volk & Wöhlecke 2008 p. 43", pop: "r:volk2008|p. 43", code: "P-comp" },
        { keys: "d e", val: "~1 %; 1&ndash;2 %", note: "other reports", src: "Volk & Wöhlecke 2008 p. 43", pop: "r:volk2008|p. 43", code: "P-comp" },
      ]),
  },
  ZnO: {
    cln: G(
      [{ k: "a", v: 6.0, kind: "at" }, { k: "b", v: 7.0, kind: "about" }, { k: "c", v: 7.5, kind: "at" }],
      [
        { keys: "b a", val: "~7 mol%", note: "6 mol% in one report", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" },
        { keys: "c", val: "7.5 %", note: "&ldquo;the largest threshold&rdquo;", src: "Volk & Wöhlecke 2008 p. 40", pop: "r:volk2008|p. 40", code: "P-comp" },
      ]),
    m12: NONE, nsln: NONE,
  },
  In2O3: {
    cln: G([{ k: "a", v: 2.0, kind: "lt" }], [{ keys: "a", val: "&lt; 2 mol% oxide", note: "= 4 at.% In, in the melt", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" }]),
    m12: NONE, nsln: NONE,
  },
  Sc2O3: {
    cln: G([{ k: "a", v: 2.0, kind: "lt" }], [{ keys: "a", val: "&lt; 2 mol% oxide", note: "= 4 at.% Sc, in the melt", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" }]),
    m12: NONE, nsln: NONE,
  },
  HfO2: {
    cln: G([{ k: "a", v: 2.0, kind: "lt" }], [{ keys: "a", val: "&lt; 2 mol%", note: "threshold below this value", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" }]),
    m12: NONE, nsln: NONE,
  },
  ZrO2: {
    cln: G([{ k: "a", v: 2.0, kind: "lt" }], [{ keys: "a", val: "&lt; 2 mol%", note: "threshold below this value", src: "Volk & Wöhlecke 2008 p. 35", pop: "r:volk2008|p. 35", code: "P-comp" }]),
    m12: NONE, nsln: NONE,
  },
};

/** OH stretch band below / above the threshold (volk2008 Table 2.4 p. 49; Mg row at [Li]/[Nb] = 0.945), congruent host only.
 *  step: the printed boundary concentration (% as printed). bryan1984 adds the Mg line positions in um. */
export interface OH { step: number; below: number[]; above: number[]; stepTxt: string; um?: [number, number] }
export const OH_BANDS: Partial<Record<Dop, OH>> = {
  MgO: { step: 4.5, below: [3484], above: [3534], stepTxt: "4.5 % MgO", um: [2.87, 2.83] },
  ZnO: { step: 7.0, below: [3484], above: [3506, 3535], stepTxt: "7 % Zn" },
};
export const OH_POP = "r:volk2008|Table 2.4 p. 49";
export const OH_UM_POP = "r:bryan1984|abstract";

/** Mg site occupancy, Li-site vacancy compensation, one proposed scheme (volk2008 Table 2.2 p. 39, orig. iyi1995).
 *  Fractions per formula unit of Li sites. The 0 % formula gives [Li]/[Nb] = 0.95/1.01 = 0.941 (congruent; derived). */
export interface SiteState { c: number; Li: number; Nb: number; Mg: number; V: number; html: string; ascii: string }
export const SITES: readonly SiteState[] = [
  { c: 0, Li: 0.95, Nb: 0.01, Mg: 0, V: 0.04, html: "[Li<sub>0.95</sub>Nb<sub>0.01</sub>V<sub>0.04</sub>]NbO<sub>3</sub>", ascii: "[Li0.95 Nb0.01 V0.04] Nb O3" },
  { c: 3, Li: 0.94, Nb: 0, Mg: 0.03, V: 0.03, html: "[Li<sub>0.94</sub>Mg<sub>0.03</sub>V<sub>0.03</sub>]NbO<sub>3</sub>", ascii: "[Li0.94 Mg0.03 V0.03] Nb O3" },
  { c: 8, Li: 0.84, Nb: 0, Mg: 0.08, V: 0.08, html: "[Li<sub>0.84</sub>Mg<sub>0.08</sub>V<sub>0.08</sub>]NbO<sub>3</sub>", ascii: "[Li0.84 Mg0.08 V0.08] Nb O3" },
];
export const SITES_POP = "r:volk2008|Table 2.2 p. 39, orig. Iyi et al. 1995;iyi1995|original, cited via Volk & Wöhlecke 2008";

/** Concentration notes per dopant (one fixed line under the figure). MgO: the units trap (volk2008 pp. 36-37). */
export const NOTES: Record<Dop, { html: string; pop: string }> = {
  MgO: { html: "Basis: MgO/(Li<sub>2</sub>O + MgO + Nb<sub>2</sub>O<sub>5</sub>) or MgO/(LiNbO<sub>3</sub> + MgO); the second is about 2&times; the first (approximate). No exact conversion is sourced, so values sit on the axis as printed.", pop: "r:volk2008|pp. 36-37" },
  ZnO: { html: "Zn in crystal vs melt: c<sub>crys</sub> = 1.649 c<sub>melt</sub> &minus; 0.082 c<sub>melt</sub><sup>2</sup>; distribution coefficient about 1 at 5&ndash;6 mol%.", pop: "r:volk2008|pp. 42-43, orig. Schlarb et al." },
  In2O3: { html: "2 mol% In<sub>2</sub>O<sub>3</sub> carries 4 at.% In (two cations per oxide); the value is a melt concentration.", pop: "r:volk2008|p. 35" },
  Sc2O3: { html: "2 mol% Sc<sub>2</sub>O<sub>3</sub> carries 4 at.% Sc (two cations per oxide); the value is a melt concentration.", pop: "r:volk2008|p. 35" },
  HfO2: { html: "Melt and crystal concentrations differ through the distribution coefficient: 1.2&ndash;1.3 at low concentration.", pop: "r:volk2008|p. 42" },
  ZrO2: { html: "Melt and crystal concentrations differ through the distribution coefficient: 1.2&ndash;1.3 at low concentration.", pop: "r:volk2008|p. 42" },
};

export const C_MIN = 0, C_MAX = 9, C_STEP = 0.1;
