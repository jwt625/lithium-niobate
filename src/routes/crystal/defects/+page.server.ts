// 1.5 Intrinsic defects: popups, reference list, the defect-fraction table (composition.ts defectFractions), the antisite
// density (formula units per volume from the hsu1997 cell, static/data/linbo3-cell.json) and the default state of
// FIG-01-04 (ASCII axis, readouts, spectrum strip, card vignettes), all computed at prerender.
import cellJson from "../../../../static/data/linbo3-cell.json";
import { defectFractions } from "$lib/physics/composition.ts";
import { wavenumberToUm } from "$lib/physics/units.ts";
import { sectionData } from "$lib/figures/crystal/sources.server";
import { CENTRES, bandText, nearPump, stripSVG, techAscii, techReadout, vignette, visHud, nmOfEV, eVOfK, eVOfNm, type DgState } from "$lib/figures/crystal/dg-data.ts";
import { spectral } from "$lib/figures/spectral.ts";
import page from "./+page.svelte?raw";
import dgRaw from "$lib/figures/crystal/dg-data.ts?raw";

export const load = async () => {
  const a = cellJson.cell.a_A, c = cellJson.cell.c_A;
  const V = (Math.sqrt(3) / 2) * a * a * c; // A^3, hexagonal cell, Z = 6
  const n = 6 / (V * 1e-24); // formula units per cm^3
  const pct = (v: number): string => (v === 0 ? "0" : `${(v * 100).toFixed(2)}%`);
  const frac = [48.38, 48.45, 49.0, 49.5, 50.0].map((cm) => {
    const L = defectFractions(cm, "Li-site"), N = defectFractions(cm, "Nb-site");
    return { c: cm.toFixed(2), x: L.x === 0 ? "0" : L.x.toFixed(4), li: `${pct(L.NbLi)} / ${pct(L.VLi)}`, nb: `${pct(N.NbLi)} / ${pct(N.VNb)}` };
  });
  const x4845 = defectFractions(48.45, "Li-site").x;
  const st0: DgState = { sel: "nbli4", pump: false, cold: false };
  return {
    ...(await sectionData({
      title: "1.5 Intrinsic defects",
      description: "Intrinsic defects of lithium niobate: Nb antisites and Li vacancies of the congruent crystal, the two compensation models, electron and hole polarons, bipolarons and OH- with their absorption bands, in a sourced defect and polaron gallery.",
      keys: ["P", "P-comp", "derived", "template"],
    }, page, dgRaw)),
    num: {
      frac,
      n: (n / 1e22).toFixed(3),
      nbli: (x4845 * n / 1e20).toFixed(1),
      x4845: x4845.toFixed(4),
      nm16: nmOfEV(1.6).toFixed(0), nm095: nmOfEV(0.95).toFixed(0), nm25: nmOfEV(2.5).toFixed(0), ev500: eVOfNm(500).toFixed(2),
      ev740: eVOfNm(740).toFixed(3),
      um3482: wavenumberToUm(3482).toFixed(3), um3467: wavenumberToUm(3467).toFixed(3), um3466: wavenumberToUm(3466).toFixed(3),
      ev3482: eVOfK(3482).toFixed(3),
    },
    dg: {
      ascii: techAscii(st0), ro: techReadout(st0), strip: stripSVG(1000, false, st0), hud: visHud(st0),
      legend: `linear-gradient(90deg, ${[680, 610, 570, 530, 490, 450, 410].map((nm) => spectral(nm, 0.9)).join(", ")})`,
      cards: CENTRES.map((k) => ({ id: k.id, vig: vignette(k), band: bandText(k), np: nearPump(k) })),
    },
  };
};
