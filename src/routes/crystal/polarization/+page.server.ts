// 1.2 Where the polarization comes from: popups, reference list, FIG-01-02 data and every derived number of the page, computed
// at prerender from the cell file (static/data/linbo3-cell.json: hsu1997 via COD 2101845) with src/lib/physics/crystal.ts and
// ferro.ts. Default figure state (s = +1, O frame, E = 0) is rendered here so the prerendered page shows final values.
import cellJson from "../../../../static/data/linbo3-cell.json";
import type { CellData } from "$lib/physics/crystal.ts";
import { depolarizingField, quarticBarrier } from "$lib/physics/ferro.ts";
import { sectionData } from "$lib/figures/crystal/sources.server";
import { buildFlip } from "$lib/figures/crystal/flbuild";
import { artASCII, colSVG, framesSVG, pos, readouts, wellASCII, wellSVG } from "$lib/figures/crystal/flrender";
import page from "./+page.svelte?raw";

const PS = 0.71, PS_ALT = 0.8; // C/m^2: volk2008 Table 1.1 p. 3 (P-comp) / gopalan1998 abstract (P(abs)); conflict c:ps
const EPS33 = 28; // weis1985 Table 1 (P-comp)
const EC = 21; // kV/mm, congruent: volk2008 Table 7.1 p. 185 (P-comp)

export const load = async () => {
  const D = buildFlip(cellJson as unknown as CellData, PS, EC);
  const st = { s: 1, frame: "O" as const, E: 0 };
  const sci1 = (v: number): string => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)} &times; 10<sup>${e}</sup>`; };
  const Ed = depolarizingField(PS, EPS33), EdAlt = depolarizingField(PS_ALT, EPS33);
  const crit = (8 * D.U0) / (3 * Math.sqrt(3)); // tilt that removes the barrier (quarticBarrier -> 0)
  const f3 = (v: number): string => (Math.abs(v) < 5e-4 ? "0" : `${v < 0 ? "&minus;" : "+"}${Math.abs(v).toFixed(3)}`);
  const fr = D.disp;
  return {
    ...(await sectionData({
      title: "1.2 Where the polarization comes from",
      description: "Origin of the spontaneous polarization of lithium niobate: Li and Nb displacements along c from the centrosymmetric R-3c reference in three frames, the computed double well, the depolarizing field, and why one cell is not how the crystal switches. Interactive flip of one octahedral column.",
      keys: ["P", "P-comp", "P-db", "derived", "template"],
    }, page)),
    fl: D,
    init: { R: readouts(D, st), art: artASCII(D, st), well: wellASCII(D, st), col: colSVG(D, st), wsv: wellSVG(D, st), frames: framesSVG(D) },
    num: {
      frames: { O: [f3(fr.O.Nb), f3(fr.O.Li), f3(fr.O.O)], Nb: [f3(fr.Nb.Nb), f3(fr.Nb.Li), f3(fr.Nb.O)], com: [f3(fr.com.Nb), f3(fr.com.Li), f3(fr.com.O)] },
      travelNb: (2 * fr.O.Nb).toFixed(3), travelLi: (2 * fr.O.Li).toFixed(3),
      Ed: sci1(Ed), EdAlt: sci1(EdAlt), EdG: (Ed / 1e9).toFixed(1), ratio: (Ed / (EC * 1e6)).toFixed(0), ratioAlt: (EdAlt / (EC * 1e6)).toFixed(0),
      k: D.kPerE.toFixed(3), tEc: (D.kPerE * EC).toFixed(0), split: (2 * D.kPerE * EC).toFixed(0),
      barEc: quarticBarrier(D.U0, D.kPerE * EC).toFixed(0), barEcPct: ((100 * quarticBarrier(D.U0, D.kPerE * EC)) / D.U0).toFixed(1),
      Ecrit: (crit / D.kPerE).toFixed(0), critRatio: (crit / D.kPerE / EC).toFixed(0),
      Vcell: (D.Vcell * 1e30).toFixed(2), twist: D.twist.toFixed(3),
      liFace: Math.abs(D.ref.liFace).toFixed(3), nbOff: Math.abs(D.ref.nbOff).toFixed(3), nbLat: D.ref.nbLat.toFixed(3),
      tri: D.planes.map((pl) => `${Math.hypot(...pos(D, pl[0], 1, "O").slice(0, 2) as [number, number]).toFixed(3)} &Aring;`).join(", "),
      mRyK: (D.mRy * 1e-3 * 157887.5).toFixed(0), // 1 Ry = 157 887.5 K (CODATA: Ry hc / kB)
    },
  };
};
