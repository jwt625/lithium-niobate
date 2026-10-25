// FIG-01-10 Powers of ten along a wall: atomistic strip built at prerender from the cell file (static/data/linbo3-cell.json,
// hsu1997 via COD 2101845) with src/lib/physics/crystal.ts (flipModel, interpolateFlip, O-sublattice frame). Server use only.
// Selection: the octahedral column on the hexagonal axis (0, 0): Li and Nb on the axis, and the O3 triangles around it (lateral
// distance < 2.3 A), over 6 c centred on the reference Li. Positions for s = +1 (the refined structure) and s = -1 (its inversion). The strip
// repeats this column along a1 at spacing a; the atoms of the neighbouring rows of columns (other y) are omitted.
// z = 0 is set to the O3 face that the Li nearest the origin threads (s = 0: Li lies in that face), so the view centre shows
// Li above its face on the s = +1 side and below it on the s = -1 side.
import { flipModel, interpolateFlip, hexCellMatrix, fracToCart, type CellData } from "../../physics/crystal.ts";
import type { PwAtom, PwColumn } from "./pw-data.ts";

export function buildColumn(cell: CellData): PwColumn {
  const m = flipModel(cell);
  const a = cell.cell.a_A, c = cell.cell.c_A;
  const M = hexCellMatrix(a, c);
  const P0 = interpolateFlip(m, 0, "O"), Pu = interpolateFlip(m, 1, "O"), Pd = interpolateFlip(m, -1, "O");
  type Pick = { el: string; p0: number[]; up: number[]; dn: number[] };
  const pick: Pick[] = [];
  for (let i = 0; i < m.atoms.length; i++)
    for (let ia = -1; ia <= 1; ia++) for (let ib = -1; ib <= 1; ib++) for (let k = -4; k <= 4; k++) {
      const off = fracToCart(M, [ia, ib, k]);
      const sh = (p: number[]): number[] => [p[0] + off[0], p[1] + off[1], p[2] + off[2]];
      const q = sh(P0[i]);
      if (Math.abs(q[2]) > 4.5 * c) continue;
      const r = Math.hypot(q[0], q[1]);
      const el = m.atoms[i].el;
      if (el === "O" ? r > 2.3 : r > 1e-6) continue;
      pick.push({ el, p0: q, up: sh(Pu[i]), dn: sh(Pd[i]) });
    }
  // reference: the Li whose s = 0 position is nearest z = 0; its face is the O plane at that height
  const li0 = pick.filter((p) => p.el === "Li").sort((p, q) => Math.abs(p.p0[2]) - Math.abs(q.p0[2]))[0];
  const z0 = li0.p0[2];
  for (let j = pick.length - 1; j >= 0; j--) { const dz = pick[j].p0[2] - z0 + 1e-3; if (dz < -3 * c || dz >= 3 * c) pick.splice(j, 1); } // half-open window of 6 c
  const conv = (p: Pick, w: number[]): PwAtom => ({ el: p.el as PwAtom["el"], x: +(w[0] / 10).toFixed(5), z: +((w[2] - z0) / 10).toFixed(5) });
  const up = pick.map((p) => conv(p, p.up)), dn = pick.map((p) => conv(p, p.dn));
  const order = (A: PwAtom[]): PwAtom[] => A.sort((p, q) => (p.el === "O" ? 0 : 1) - (q.el === "O" ? 0 : 1) || p.z - q.z);
  const nO = pick.filter((p) => p.el === "O").length, nLi = pick.filter((p) => p.el === "Li").length, nNb = pick.filter((p) => p.el === "Nb").length;
  // acceptance: 6 c of column = 12 Li, 12 Nb, 36 O planes x 3
  if (nLi !== 12 || nNb !== 12 || nO !== 108) throw new Error(`wall strip column: Li ${nLi}, Nb ${nNb}, O ${nO}`);
  const liUp = up.filter((p) => p.el === "Li").sort((p, q) => Math.abs(p.z) - Math.abs(q.z))[0];
  const liDn = dn.filter((p) => p.el === "Li").sort((p, q) => Math.abs(p.z) - Math.abs(q.z))[0];
  return { a: a / 10, c: c / 10, up: order(up), dn: order(dn), liUp: liUp.z, liDn: liDn.z };
}
