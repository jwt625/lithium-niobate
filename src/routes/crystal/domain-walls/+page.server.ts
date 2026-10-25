// 1.10 Domain walls up close: popups, reference list, FIG-01-10 data (atom strip from the cell file static/data/linbo3-cell.json,
// hsu1997 via COD 2101845, with src/lib/physics/crystal.ts) and every derived number of the page (bound charge with
// src/lib/physics/ferro.ts), computed at prerender. The default figure state is rendered here so the prerendered page shows
// final values; VISUAL SVGs are redrawn at their pixel size after hydration.
import cellJson from "../../../../static/data/linbo3-cell.json";
import type { CellData } from "$lib/physics/crystal.ts";
import { sectionData } from "$lib/figures/crystal/sources.server";
import { buildColumn } from "$lib/figures/crystal/pwbuild";
import { A_NM, charge, chargeSVG, fmtE, readouts, rulerASCII, rulerSVG, sigmaASCII, viewASCII, viewSVG, ariaView, type PwState } from "$lib/figures/crystal/pw-data";
import { wall } from "$lib/stores/crystal";
import page from "./+page.svelte?raw";
import pwRaw from "$lib/figures/crystal/pw-data.ts?raw";

export const load = async () => {
  const cell = cellJson as unknown as CellData;
  const col = buildColumn(cell);
  if (Math.abs(col.a - A_NM) > 1e-6) throw new Error(`pw-data A_NM ${A_NM} differs from the cell a = ${col.a} nm`);
  const st: PwState = { L: wall.L, th: wall.th, ps: wall.ps };
  const xh = (v: number): string => { const [m, e] = fmtE(v).split("e"); return `${m} &times; 10<sup>${e}</sup>`; };
  const q71 = charge(0.71, 1), q80 = charge(0.8, 1), q5 = charge(0.71, 5), q5b = charge(0.8, 5);
  return {
    ...(await sectionData({
      title: "1.10 Domain walls up close",
      description: "Domain walls in lithium niobate from 10 µm to 0.1 nm: X-ray strain and birefringent halos, probe-limited PFM width, the one-to-two-cell ideal wall, bound charge on tilted walls and charged-wall conduction, with an interactive powers-of-ten zoom across a 180 degree wall.",
      keys: ["P", "P-comp", "P-db", "derived", "template"],
    }, page, pwRaw)),
    col,
    init: {
      R: readouts(st), rul: rulerASCII(st), view: viewASCII(col, st), sig: sigmaASCII(st), aria: ariaView(st),
      vview: viewSVG(col, st, 1000, 500), vrul: rulerSVG(st, 1000), vchg: chargeSVG(st, 560),
    },
    num: {
      a: col.a.toFixed(4), a2: (2 * col.a).toFixed(3), li: (col.liUp * 1000).toFixed(1), c: col.c.toFixed(4),
      s71: q71.sig.toFixed(4), s80: q80.sig.toFixed(4), n71: xh(q71.n), n80: xh(q80.n),
      d71: q71.spacing.toFixed(2), d80: q80.spacing.toFixed(2),
      s5: q5.sig.toFixed(4), s5b: q5b.sig.toFixed(4), n5: xh(q5.n), n5b: xh(q5b.n),
    },
  };
};
