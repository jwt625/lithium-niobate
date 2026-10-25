// FIG-01-02 One cell, flipped: figure data built at prerender from the cell file (static/data/linbo3-cell.json, hsu1997 via
// COD 2101845) with src/lib/physics/crystal.ts (flipModel, interpolateFlip, polarDisplacements). Server use only.
// Selection: the octahedral column at hexagonal fractional (0, 0); the three octahedra between the O planes at z = 0.0625,
// 0.2292, 0.3958, 0.5625 (fractions of c, up structure): empty (bottom), Li (middle), Nb (top). Li threads the O3 face at
// z = 0.2292. Coordinates are shifted so that face sits at z = 0 in the s = 0 reference.
// Interpolation: interpolateFlip(m, s, frame) is linear in s, so each atom is shipped as p0 = interpolateFlip(m, 0, f) (the same
// for every frame) and d[f] = interpolateFlip(m, 1, f) - p0; the client evaluates p0 + s d[f], identical to interpolateFlip.
import { flipModel, interpolateFlip, polarDisplacements, hexCellMatrix, fracToCart, type CellData, type FlipFrame } from "$lib/physics/crystal.ts";
import { INBAR1996_WELL } from "$lib/physics/ferro.ts";
import { KB } from "$lib/physics/constants.ts";
import type { FlData, FlAtom, V3 } from "./flrender";

const FRAMES: FlipFrame[] = ["O", "Nb", "com"];

export function buildFlip(cell: CellData, Ps: number, EcKVmm: number): FlData {
  const m = flipModel(cell);
  const M = hexCellMatrix(cell.cell.a_A, cell.cell.c_A);
  const c = cell.cell.c_A;
  const P0 = interpolateFlip(m, 0, "O");
  const P1 = Object.fromEntries(FRAMES.map((f) => [f, interpolateFlip(m, 1, f)])) as Record<FlipFrame, V3[]>;
  const pick: { i: number; off: V3; el: string; z: number }[] = [];
  for (let i = 0; i < m.atoms.length; i++)
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let k = -1; k <= 1; k++) {
      const off = fracToCart(M, [a, b, k]) as V3;
      const q: V3 = [P0[i][0] + off[0], P0[i][1] + off[1], P0[i][2] + off[2]];
      const zf = q[2] / c;
      if (zf < 0.03 || zf > 0.6 || Math.hypot(q[0], q[1]) > 2.3) continue;
      if (m.atoms[i].el !== "O" && Math.hypot(q[0], q[1]) > 1e-6) continue;
      pick.push({ i, off, el: m.atoms[i].el, z: q[2] });
    }
  // cations: the Li and the Nb inside the window (one each); O: 4 planes x 3
  const li = pick.filter((p) => p.el === "Li"), nb = pick.filter((p) => p.el === "Nb"), os = pick.filter((p) => p.el === "O");
  if (li.length !== 1 || nb.length !== 1 || os.length !== 12) throw new Error(`flip column selection: Li ${li.length}, Nb ${nb.length}, O ${os.length}`);
  const zFace = li[0].z; // s = 0: Li lies in its O3 face
  const order = [li[0], nb[0], ...os.sort((p, q) => p.z - q.z)];
  const atoms: FlAtom[] = order.map((p) => ({
    el: p.el as FlAtom["el"],
    p0: [P0[p.i][0] + p.off[0], P0[p.i][1] + p.off[1], P0[p.i][2] + p.off[2] - zFace],
    d: Object.fromEntries(FRAMES.map((f) => [f, [P1[f][p.i][0] - P0[p.i][0], P1[f][p.i][1] - P0[p.i][1], P1[f][p.i][2] - P0[p.i][2]]])) as Record<FlipFrame, V3>,
  }));
  const planes: number[][] = [0, 1, 2, 3].map((k) => [2 + 3 * k, 3 + 3 * k, 4 + 3 * k]);
  const dist = (i: number, j: number): number => Math.hypot(...([0, 1, 2].map((k) => atoms[i].p0[k] - atoms[j].p0[k]) as V3));
  const edges: [number, number][] = [];
  const oct: [number, number][] = [[0, 1], [1, 2], [2, 3]];
  for (const pl of planes) for (let u = 0; u < 3; u++) for (let v = u + 1; v < 3; v++) edges.push([pl[u], pl[v]]);
  for (const [lo, hi] of oct) for (const j of planes[hi]) {
    const near = [...planes[lo]].sort((p, q) => dist(j, p) - dist(j, q)).slice(0, 2);
    near.forEach((i) => edges.push([i, j]));
  }
  const isEdge = (i: number, j: number): boolean => edges.some(([p, q]) => (p === i && q === j) || (p === j && q === i));
  const faces: number[][][] = oct.map(([lo, hi]) => {
    const v = [...planes[lo], ...planes[hi]], out: number[][] = [];
    for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let k = b + 1; k < 6; k++) if (isEdge(v[a], v[b]) && isEdge(v[b], v[k]) && isEdge(v[a], v[k])) out.push([v[a], v[b], v[k]]);
    if (out.length !== 8) throw new Error(`octahedron ${lo}-${hi}: ${out.length} faces`);
    return out;
  });
  const disp = Object.fromEntries(FRAMES.map((f) => {
    const d = polarDisplacements(m, f);
    return [f, { Nb: d.Nb, Li: d.Li, O: d.O }];
  })) as FlData["disp"];
  const Vcell = (Math.sqrt(3) / 2) * cell.cell.a_A ** 2 * c / 3 * 1e-30; // rhombohedral 10-atom cell, m^3
  // lateral O twist (largest in-plane displacement of an O between s = 0 and s = 1)
  const twist = Math.max(...m.atoms.map((a, i) => (a.el === "O" ? Math.hypot(m.disp[i][0], m.disp[i][1]) : 0)));
  // acceptance (3): s = 0 reference geometry
  const nbCen = [0, 1, 2].map((k) => planes[2].concat(planes[3]).reduce((s, i) => s + atoms[i].p0[k], 0) / 6);
  return {
    atoms, planes, edges, faces, oct, face: 1, disp,
    U0: INBAR1996_WELL.depth_K, mRy: INBAR1996_WELL.depth_mRy,
    kPerE: (Ps * Vcell) / KB * 1e6, // K per (kV/mm): Ps V_cell E / kB with E in V/m = 1e6 x kV/mm
    Ec: EcKVmm, Ps, Vcell, twist,
    ref: { liFace: atoms[0].p0[2] - atoms[planes[1][0]].p0[2], nbOff: atoms[1].p0[2] - nbCen[2], nbLat: Math.hypot(atoms[1].p0[0] - nbCen[0], atoms[1].p0[1] - nbCen[1]) },
  };
}
