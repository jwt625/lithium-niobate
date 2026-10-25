// LiNbO3 lattice geometry (FIG-01-01 Cell explorer, FIG-01-02 One cell, flipped).
// Inputs are a cell object in the `linbo3-cell/1` schema (static/data/linbo3-cell.json: hsu1997 via COD 2101845, P-db; the
// expansion in that file is derived by scripts/gen_cell.py). Functions take the cell as an argument; nothing here embeds coordinates.
//
// Settings (weis1985 Eq. (1), P): a_R = sqrt(3 a^2 + c^2)/3, alpha = 2 arcsin(3 / (2 sqrt(3 + (c/a)^2))).
// Obverse rhombohedral primitive vectors in hexagonal fractional coordinates: (2/3, 1/3, 1/3), (-1/3, 1/3, 1/3), (-1/3, -2/3, 1/3);
// they sum to c (the shared long diagonal). Hexagonal Cartesian frame: x along a1, y in the a1-a2 plane, z along c (Angstrom).
// Plane angle: for (h k i l), i = -(h + k), the reciprocal vector G = h a* + k b* + l c*; angle(plane, c) = 90 deg - angle(G, c).
// Flip model (C01 manuscript Sec. 2 L2, derived): the down structure is the inversion of the up structure about the Nb O6
// centroid; each atom is paired with the nearest same-element atom of the inverted structure; s in [-1, 1] interpolates
// pos(s) = mid + s (up - mid); s = 0 is the centrosymmetric R-3c reference.
import type { Provenance } from "./constants.ts";
import type { Vec3, Mat3 } from "./linalg.ts";

export interface CellAtomSpec {
  label: string;
  wyckoff?: string;
  frac: number[];
}
export interface CellData {
  schema?: string;
  cell: { a_A: number; c_A: number };
  space_group: { operators: string[] };
  asymmetric_unit: CellAtomSpec[];
  empty_octahedral_sites?: { frac: number[] }[];
}
export interface Atom {
  el: string;
  wyckoff?: string;
  /** fractional, wrapped to [0, 1) */
  frac: Vec3;
  cart: Vec3;
}

const DEG = 180 / Math.PI;
const wrap = (x: number): number => {
  const y = x - Math.floor(x);
  return y > 1 - 1e-9 ? 0 : y;
};

/** Hexagonal cell matrix, columns a1, a2, c (Angstrom), as in linbo3-cell.json `matrix_columns_a1_a2_c` (here returned row-major). */
export function hexCellMatrix(a: number, c: number): Mat3 {
  return [
    [a, -a / 2, 0],
    [0, (a * Math.sqrt(3)) / 2, 0],
    [0, 0, c],
  ];
}
export const fracToCart = (M: Mat3, f: readonly number[]): Vec3 => [
  M[0][0] * f[0] + M[0][1] * f[1] + M[0][2] * f[2],
  M[1][0] * f[0] + M[1][1] * f[1] + M[1][2] * f[2],
  M[2][0] * f[0] + M[2][1] * f[1] + M[2][2] * f[2],
];

/** Hexagonal (a, c) to rhombohedral (a_R, alpha) plus the three primitive vectors in hexagonal Cartesian coordinates. */
export function hexToRhomb(a: number, c: number): { aR: number; alpha_deg: number; basis: [Vec3, Vec3, Vec3]; prov: Provenance } {
  const aR = Math.sqrt(3 * a * a + c * c) / 3;
  const alpha = 2 * Math.asin(3 / (2 * Math.sqrt(3 + (c / a) ** 2)));
  const M = hexCellMatrix(a, c);
  const basis: [Vec3, Vec3, Vec3] = [
    fracToCart(M, [2 / 3, 1 / 3, 1 / 3]),
    fracToCart(M, [-1 / 3, 1 / 3, 1 / 3]),
    fracToCart(M, [-1 / 3, -2 / 3, 1 / 3]),
  ];
  return { aR, alpha_deg: alpha * DEG, basis, prov: { source: "weis1985", status: "P", locator: "Eq. (1) p. 194" } };
}

/** Angle (deg) between the lattice plane (h k i l) and the c axis, hexagonal cell (a, c). Throws unless i = -(h + k). */
export function planeAngleToC(hkil: readonly [number, number, number, number], a: number, c: number): number {
  const [h, k, i, l] = hkil;
  if (i !== -(h + k)) throw new RangeError(`(${hkil.join(" ")}): i must equal -(h + k)`);
  // reciprocal basis (no 2 pi): a* = (1/a, 1/(a sqrt3), 0), b* = (0, 2/(a sqrt3), 0), c* = (0, 0, 1/c)
  const G: Vec3 = [h / a, (h + 2 * k) / (a * Math.sqrt(3)), l / c];
  const n = Math.hypot(G[0], G[1], G[2]);
  if (n === 0) throw new RangeError("zero plane index");
  const angGc = Math.acos(Math.abs(G[2]) / n);
  return 90 - angGc * DEG;
}

/** Parse a CIF symmetry operator such as "2/3-y,1/3+x-y,1/3+z" into an affine map on fractional coordinates. */
export function parseSymop(op: string): (f: readonly number[]) => Vec3 {
  const parts = op.replace(/\s+/g, "").split(",");
  if (parts.length !== 3) throw new Error(`symop "${op}"`);
  const rows = parts.map((p) => {
    const coef = [0, 0, 0];
    let t = 0;
    const terms = p.match(/[+-]?[^+-]+/g) ?? [];
    for (const term of terms) {
      const sign = term.startsWith("-") ? -1 : 1;
      const body = term.replace(/^[+-]/, "");
      const ax = "xyz".indexOf(body[body.length - 1]);
      if (ax >= 0 && /^[\d/.]*[xyz]$/.test(body)) {
        const pre = body.slice(0, -1);
        coef[ax] += sign * (pre === "" ? 1 : evalFrac(pre));
      } else t += sign * evalFrac(body);
    }
    return { coef, t };
  });
  return (f) => rows.map((r) => r.coef[0] * f[0] + r.coef[1] * f[1] + r.coef[2] * f[2] + r.t) as Vec3;
}
function evalFrac(s: string): number {
  if (s.includes("/")) {
    const [a, b] = s.split("/");
    return Number(a) / Number(b);
  }
  return Number(s);
}

/** Expand an asymmetric unit with all operators, wrap to [0, 1) and remove duplicates (tolerance in fractional units). */
export function expandCell(cell: CellData, tol = 1e-4): Atom[] {
  const ops = cell.space_group.operators.map(parseSymop);
  const M = hexCellMatrix(cell.cell.a_A, cell.cell.c_A);
  const out: Atom[] = [];
  for (const site of cell.asymmetric_unit) {
    for (const op of ops) {
      const f = op(site.frac).map(wrap) as Vec3;
      const dup = out.some((a) => a.el === site.label && fracDist(a.frac, f) < tol);
      if (!dup) out.push({ el: site.label, wyckoff: site.wyckoff, frac: f, cart: fracToCart(M, f) });
    }
  }
  return out;
}
function fracDist(a: readonly number[], b: readonly number[]): number {
  let m = 0;
  for (let i = 0; i < 3; i++) {
    let d = Math.abs(a[i] - b[i]);
    d = Math.min(d, 1 - d);
    m = Math.max(m, d);
  }
  return m;
}

/** Shortest Cartesian vector from p to q (fractional inputs) over the 27 neighbouring images. */
export function minImage(M: Mat3, p: readonly number[], q: readonly number[]): Vec3 {
  const d0 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]].map((x) => x - Math.round(x));
  let best: Vec3 = [0, 0, 0];
  let bn = Infinity;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const v = fracToCart(M, [d0[0] + i, d0[1] + j, d0[2] + k]);
        const n = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
        if (n < bn) {
          bn = n;
          best = v;
        }
      }
  return best;
}

/** Neighbour shells around a fractional position: entries {el, d_A, n} grouped by element and distance (tolerance tol_A). */
export function neighborShells(cell: CellData, atoms: Atom[], center: readonly number[], rmax_A = 3.1, tol_A = 1e-3): { el: string; d_A: number; n: number }[] {
  const M = hexCellMatrix(cell.cell.a_A, cell.cell.c_A);
  const list: { el: string; d: number }[] = [];
  for (const a of atoms) {
    const v = minImage(M, center, a.frac);
    const d = Math.hypot(v[0], v[1], v[2]);
    if (d > 1e-6 && d <= rmax_A) list.push({ el: a.el, d });
  }
  list.sort((x, y) => x.d - y.d);
  const shells: { el: string; d_A: number; n: number }[] = [];
  for (const it of list) {
    const s = shells.find((q) => q.el === it.el && Math.abs(q.d_A - it.d) < tol_A);
    if (s) s.n++;
    else shells.push({ el: it.el, d_A: it.d, n: 1 });
  }
  return shells;
}

/** Occupants of the octahedral column at fractional (x, y), ordered along +c by z in [0, 1): cations from the expanded cell,
 *  empty sites from `cell.empty_octahedral_sites`. Throws if the cell carries no empty-site list. */
export function octahedralColumn(cell: CellData, atoms: Atom[], xy: readonly [number, number], tol = 1e-3): { z: number; occupant: string }[] {
  if (!cell.empty_octahedral_sites) throw new Error("cell has no empty_octahedral_sites");
  const pts: { z: number; occupant: string }[] = [];
  const onColumn = (f: readonly number[]) => fracDist([f[0], f[1], 0], [xy[0], xy[1], 0]) < tol;
  for (const a of atoms) if (a.el !== "O" && onColumn(a.frac)) pts.push({ z: a.frac[2], occupant: a.el });
  for (const e of cell.empty_octahedral_sites) if (onColumn(e.frac)) pts.push({ z: wrap(e.frac[2]), occupant: "empty" });
  return pts.sort((p, q) => p.z - q.z);
}

// ---------- polar displacement and flip ----------
export type FlipFrame = "O" | "Nb" | "com";
/** Standard atomic weights (abridged, g/mol): IUPAC CIAAW; Li 6.94, Nb 92.906, O 15.999. Sum for LiNbO3 = 147.843, consistent with
 *  M = 147.842 g/mol of weis1985 p. 193. Status `reported` (not yet in the API source register). */
export const ATOMIC_MASS = {
  values: { Li: 6.94, Nb: 92.906, O: 15.999 } as Record<string, number>,
  prov: { source: "ciaaw", status: "reported", note: "IUPAC CIAAW abridged standard atomic weights; cross-check: sum 147.843 vs weis1985 M = 147.842 g/mol" } as Provenance,
};

export interface FlipModel {
  atoms: Atom[];
  /** Cartesian (Angstrom) centrosymmetric reference positions (s = 0) */
  mid: Vec3[];
  /** Cartesian displacement up - mid for each atom (O-sublattice frame as constructed) */
  disp: Vec3[];
  /** inversion centre used (fractional) */
  center: Vec3;
}

/** Build the flip model from the cell: inversion about the O6 centroid around the first Nb of the expanded cell. */
export function flipModel(cell: CellData): FlipModel {
  const atoms = expandCell(cell);
  const M = hexCellMatrix(cell.cell.a_A, cell.cell.c_A);
  const nb = atoms.find((a) => a.el === "Nb");
  if (!nb) throw new Error("no Nb in cell");
  const os = atoms
    .filter((a) => a.el === "O")
    .map((o) => ({ o, v: minImage(M, nb.frac, o.frac) }))
    .sort((p, q) => Math.hypot(...p.v) - Math.hypot(...q.v))
    .slice(0, 6);
  const cen = [0, 0, 0];
  for (const { v } of os) for (let i = 0; i < 3; i++) cen[i] += v[i] / 6;
  // centroid back to fractional: solve M f = cart (M upper-triangular-like for the hexagonal cell)
  const a = cell.cell.a_A;
  const c = cell.cell.c_A;
  const cartC: Vec3 = [nb.cart[0] + cen[0], nb.cart[1] + cen[1], nb.cart[2] + cen[2]];
  const f2 = cartC[1] / ((a * Math.sqrt(3)) / 2);
  const f1 = (cartC[0] + (a / 2) * f2) / a;
  const center: Vec3 = [f1, f2, cartC[2] / c];
  const inverted = atoms.map((at) => ({ el: at.el, frac: at.frac.map((x, i) => wrap(2 * center[i] - x)) as Vec3 }));
  const mid: Vec3[] = [];
  const disp: Vec3[] = [];
  for (const at of atoms) {
    let best: Vec3 = [0, 0, 0];
    let bn = Infinity;
    for (const iv of inverted) {
      if (iv.el !== at.el) continue;
      const v = minImage(M, at.frac, iv.frac);
      const n = Math.hypot(v[0], v[1], v[2]);
      if (n < bn) {
        bn = n;
        best = v;
      }
    }
    const d: Vec3 = [-best[0] / 2, -best[1] / 2, -best[2] / 2];
    disp.push(d);
    mid.push([at.cart[0] - d[0], at.cart[1] - d[1], at.cart[2] - d[2]]);
  }
  return { atoms, mid, disp, center };
}

function frameShift(m: FlipModel, frame: FlipFrame, masses: Record<string, number>): Vec3 {
  const sel = (pred: (el: string) => boolean, w: (el: string) => number): Vec3 => {
    const s: Vec3 = [0, 0, 0];
    let W = 0;
    m.atoms.forEach((a, i) => {
      if (!pred(a.el)) return;
      const wi = w(a.el);
      W += wi;
      for (let k = 0; k < 3; k++) s[k] += wi * m.disp[i][k];
    });
    return [s[0] / W, s[1] / W, s[2] / W];
  };
  if (frame === "O") return sel((e) => e === "O", () => 1);
  if (frame === "Nb") return sel((e) => e === "Nb", () => 1);
  return sel(() => true, (e) => {
    const w = masses[e];
    if (w === undefined) throw new Error(`no mass for ${e}`);
    return w;
  });
}

/** Mean displacement along +c (Angstrom) of Nb, Li and O between s = 0 and s = 1 in the chosen frame. */
export function polarDisplacements(m: FlipModel, frame: FlipFrame, masses: Record<string, number> = ATOMIC_MASS.values): Record<string, number> {
  const sh = frameShift(m, frame, masses);
  const acc: Record<string, { s: number; n: number }> = {};
  m.atoms.forEach((a, i) => {
    const e = (acc[a.el] ??= { s: 0, n: 0 });
    e.s += m.disp[i][2] - sh[2];
    e.n++;
  });
  const out: Record<string, number> = {};
  for (const k of Object.keys(acc)) out[k] = acc[k].s / acc[k].n;
  return out;
}

/** Cartesian positions at flip parameter s in [-1, 1] (s = 1 the input structure, s = -1 its inversion) in the chosen frame. */
export function interpolateFlip(m: FlipModel, s: number, frame: FlipFrame = "O", masses: Record<string, number> = ATOMIC_MASS.values): Vec3[] {
  const sh = frameShift(m, frame, masses);
  return m.mid.map((p, i) => [p[0] + s * (m.disp[i][0] - sh[0]), p[1] + s * (m.disp[i][1] - sh[1]), p[2] + s * (m.disp[i][2] - sh[2])] as Vec3);
}
