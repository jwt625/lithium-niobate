// 1.1 The lattice: popups, reference list, and every derived number of the page computed at prerender from the cell data
// (static/data/linbo3-cell.json: hsu1997 via COD 2101845) with src/lib/physics/crystal.ts.
import cellJson from "../../../../static/data/linbo3-cell.json";
import { expandCell, hexCellMatrix, hexToRhomb, planeAngleToC, neighborShells, type CellData } from "$lib/physics/crystal.ts";
import { sectionData } from "$lib/figures/crystal/sources.server";
import type { CellxData, ColumnSite } from "$lib/figures/crystal/cellx";
import { sideSVG, topSVG, ocReadout, type OcData, type Occ } from "$lib/figures/crystal/oc";
import page from "./+page.svelte?raw";

type V3 = [number, number, number];

export const load = async () => {
  const cell = cellJson as unknown as CellData & { empty_octahedral_sites: { frac: number[] }[] };
  const a = cell.cell.a_A, c = cell.cell.c_A;
  const atoms = expandCell(cell);
  const M = hexCellMatrix(a, c); // row-major
  const Mcols: [V3, V3, V3] = [[M[0][0], M[1][0], M[2][0]], [M[0][1], M[1][1], M[2][1]], [M[0][2], M[1][2], M[2][2]]];
  const rh = hexToRhomb(a, c);
  const cleave = planeAngleToC([0, 1, -1, 2], a, c);
  const V = (Math.sqrt(3) / 2) * a * a * c; // A^3
  const NA = 6.02214076e23, Mmol = 147.842; // g/mol, weis1985 p. 193
  const rho = (6 * Mmol) / (NA * V * 1e-24) * 1e3; // kg/m^3
  const nPerCm3 = 6 / (V * 1e-24);
  const near = (x: number) => Math.abs(x - Math.round(x)) < 1e-3;
  const column: ColumnSite[] = [
    ...atoms.filter((t) => t.el !== "O" && near(t.frac[0]) && near(t.frac[1])).map((t) => ({ el: t.el as "Nb" | "Li", z: t.frac[2] })),
    ...cell.empty_octahedral_sites.filter((e) => near(e.frac[0]) && near(e.frac[1])).map((e) => ({ el: "empty" as const, z: e.frac[2] - Math.floor(e.frac[2]) })),
  ].sort((p, q) => p.z - q.z);
  const empties = cell.empty_octahedral_sites.map((e) => e.frac as V3);
  const nb = atoms.find((t) => t.el === "Nb")!, li = atoms.find((t) => t.el === "Li")!;
  const sh = (center: number[]) => neighborShells(cell, atoms, center, 2.3).filter((x) => x.el === "O");
  const cellx: CellxData = { a, c, M: Mcols, rh: { basis: rh.basis, aR: rh.aR, alpha: rh.alpha_deg }, cleaveN0: empties[0][1] + 2 * empties[0][2], cleaveAngle: cleave, column, empties };
  const counts = { Li: atoms.filter((t) => t.el === "Li").length, Nb: atoms.filter((t) => t.el === "Nb").length, O: atoms.filter((t) => t.el === "O").length, empty: empties.length };
  const raw = cellJson as unknown as { columns_along_c: { column_frac_xy: [number, number]; along_c: { z_frac: number; occupant: string }[] }[] };
  const oLayers: V3[][] = Array.from({ length: 6 }, () => []);
  for (const t of atoms.filter((x) => x.el === "O")) oLayers[(Math.round((t.frac[2] - 1 / 12) * 6) + 6) % 6].push(t.frac as V3);
  const oc: OcData = {
    a, c,
    cols: raw.columns_along_c.map((col) => ({ xy: col.column_frac_xy, lv: col.along_c.map((L) => ({ z: L.z_frac, occ: L.occupant as Occ })) })),
    cat: atoms.filter((t) => t.el !== "O").map((t) => ({ el: t.el as "Nb" | "Li", f: t.frac as V3 })),
    oLayers,
  };
  // every level holds one Nb, one Li, one empty site (checked here so a data change fails the prerender)
  for (let k = 0; k < 6; k++) { const occ = oc.cols.map((col) => col.lv[k].occ).sort().join(","); if (occ !== "Li,Nb,empty") throw new Error(`level ${k}: ${occ}`); }
  const levels = Array.from({ length: 6 }, (_, k) => ({ z: oc.cols[0].lv[k].z.toFixed(4), occ: oc.cols.map((col) => col.lv[k].occ) }));
  return {
    oc, ocInit: { side: sideSVG(oc, 0), top: topSVG(oc, 0), ro: ocReadout(oc, 0) }, levels,
    ...(await sectionData({
      title: "1.1 The lattice",
      description: "Lithium niobate crystal structure: R3c, hexagonal and rhombohedral cells from the 1997 synchrotron refinement, the Nb / empty / Li octahedral columns along +c, and the {01-12} cleavage plane, with an interactive unit cell.",
      keys: ["P", "P-comp", "P-db", "S", "derived"],
    }, page)),
    cellx,
    num: {
      ca: (c / a).toFixed(4), V: V.toFixed(2), Vr: (V / 3).toFixed(2), n: (nPerCm3 / 1e22).toFixed(3), rho: rho.toFixed(0),
      aR: rh.aR.toFixed(4), alpha: rh.alpha_deg.toFixed(3), cleave: cleave.toFixed(3),
      nbO: sh(nb.frac).map((x) => `${x.d_A.toFixed(3)} &times;${x.n}`).join(", "), liO: sh(li.frac).map((x) => `${x.d_A.toFixed(3)} &times;${x.n}`).join(", "),
      counts, column: column.map((s) => `${s.el} ${s.z.toFixed(3)}`).join(" &rarr; "),
    },
  };
};
