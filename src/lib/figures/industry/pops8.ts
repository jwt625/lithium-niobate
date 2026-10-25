// Popup entries of chapter 08: every source in refs.yaml ("r:<id>", composites "r:<id>+<id>" on demand); glossary terms
// use the site glossary ("g:<id>"). Built once per client from the chapter files (bundled as text), shared by all industry pages.
import type { Pop } from "$lib/content/pops";
import { registerPops } from "$lib/content/pops";
import { onMount } from "svelte";
import { parseFlatYaml, refPops, collectKeys, GRADE_DEF } from "./refs";
import { NB_POP, ATLAS_POP } from "./commonpops";

const RAW = import.meta.glob<string>("/content/chapters/08-industry/refs.yaml", { query: "?raw", import: "default", eager: true });
const text = (name: string): string => Object.entries(RAW).find(([k]) => k.endsWith(`/${name}`))?.[1] ?? "";
export const REFS = parseFlatYaml(text("refs.yaml"));
const SINGLE = refPops(REFS, REFS.filter((r) => r.type !== "research_note").map((r) => `r:${r.id}`));

/** Register the chapter entries plus composite source keys found in `data` for the lifetime of the page. */
export function useChapterPops(data: unknown = null, extra: Record<string, Pop> = {}): void {
  const comp = [...collectKeys(data)].filter((k) => k.includes("+"));
  const entries = { ...SINGLE, ...FIXED, LT_SAW, ...refPops(REFS, comp), ...extra };
  onMount(() => {
    // composite source keys written directly in page markup ("r:a+b")
    const inDom = [...document.querySelectorAll<HTMLElement>("[data-pop^='r:']")].map((e) => e.dataset.pop ?? "").filter((k) => k.includes("+") && !(k in entries));
    return registerPops({ ...entries, ...refPops(REFS, [...new Set(inDom)]) });
  });
}

const gp = (k: string, def: string, cls: string): Pop => ({ h: `Grade ${k}`, body: def.charAt(0).toUpperCase() + def.slice(1) + ".", badges: [[cls, k]] });
/** Popups for estimates, display parameters, counts, and grade definitions used across chapter 08. */
const FIXED: Record<string, Pop> = {
  "i8-atlas": ATLAS_POP, "i8-nbwafer": NB_POP,
  ...Object.fromEntries(Object.entries(GRADE_DEF).map(([k, v]) => [`gr:${k}`, gp(k, v, `g8 g${k}`)])),
  "gr:reported": gp("reported", "value as reported by the paper's authors", "r"),
  "gr:derived": gp("derived", "computed in the page from atlas rows or listed inputs", "d"),
  "i8-supply": { h: "Where supply limits could sit", body: "Estimate: niobium for even 2.1 M 6-inch wafers per year is 0.05% to 0.25% of world mine output (section 8.1 L3), so mining is not the constraint. Capacities of high-purity Nb<sub>2</sub>O<sub>5</sub> refining, crystal growth, and thin-film bonding are not public.", badges: [["g8 gE", "E"]] },
  "i8-cong": { h: "Congruent composition", body: "Li<sub>1-5x</sub>Nb<sub>1+x</sub>O<sub>3</sub> (Li-site vacancy model) with [Li]/[Nb] = (1-5x)/(1+x) = 0.94 gives x = 0.0101, M = 148.43 g/mol, Nb mass fraction 63.2%; 41.0 g wafer: 25.9 g Nb.", badges: [["d", "derived"]], src: "[Li]/[Nb] = 0.94: Volk and Woehlecke 2008 (compilation), as on the crystal chapter" },
  "i8-tpl": { h: "Display parameters", body: "Wafer thickness (default 0.5 mm) and loss factor (1 to 5, boule and kerf losses) are assumptions for the estimate, not measured values.", badges: [["t", "template"]] },
  "i8-dies": { h: "Gross die count", body: "5 x 1 mm dies counted when fully inside the wafer circle minus a 3 mm edge exclusion (assumed), best of four grid offsets; no scribe lanes, flats ignored. Area ratio (200/150)<sup>2</sup> = 1.778.", badges: [["d", "derived"], ["t", "template"]] },
  "i8-ofccount": { h: "Counts over the board", body: "Number of the 15 board papers carrying each theme tag. Theme tags are assigned by this site from each paper's title and abstract claim.", badges: [["d", "derived"]] },
  "i8-ofcthemes": { h: "OFC 2026 themes", body: "Estimate: themes read from the 15 board papers (codes listed per theme); not a census of the conference.", badges: [["g8 gE", "E"]] },
  "i8-dpw": { h: "Gross dies per wafer", body: "DPW = &pi;d<sup>2</sup>/(4S) &minus; &pi;d/&radic;(2S): wafer area over die area minus the dies cut by the edge; d = D &minus; 2E is the usable diameter, S the die area. The drawn count places whole dies on a grid (best of four offsets) inside the usable circle. Die size and edge exclusion are display parameters; no scribe lanes, flats, notch, or yield.", badges: [["d", "derived"], ["t", "template"]], src: "Formula as commonly used; compared with exact counts in D. K. de Vries, Investigation of gross die per wafer formulas, IEEE Trans. Semicond. Manuf. 18, 136 (2005), <a href='https://doi.org/10.1109/TSM.2004.836656'>doi:10.1109/TSM.2004.836656</a> (Crossref record checked 2026-10-25; paper not read)" },
  "i8-evcount": { h: "Event count", body: "Number of public industry events, each with source URL, access date, and grade; the same records are served at /api/v1/events/industry.json.", badges: [["d", "derived"]] },
};
/** Estimate (E) that LT, not LN, makes up most SAW filter substrates: basis and sources. */
const LT_SAW: Pop = {
  h: "LT appears to dominate SAW filter substrates",
  body: "Estimate, inferred from product pages: Sumitomo Metal Mining lists LT (36-50 degree rotated Y) and LN (128 degree rotated Y) wafers with smartphone SAW filters as the main use; Shin-Etsu Chemical lists only LT for SAW; Soitec's piezo-on-insulator line has two LT products (LT6, LT8) and one LN product (LN6). No public source gives an LT vs LN volume share (N/A).",
  badges: [["g8 gE", "E"]],
  src: "<a href='https://www.smm.co.jp/en/business/material/products/lithium/'>smm.co.jp</a>; <a href='https://www.shinetsu.co.jp/en/products/electronics-materials/oxide-single-crystals/'>shinetsu.co.jp</a>; <a href='https://www.soitec.com/en/products/poi'>soitec.com</a>; all accessed 2026-10-24",
};
