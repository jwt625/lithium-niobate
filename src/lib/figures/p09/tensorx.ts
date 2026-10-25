// F4 tensor and convention explorer: rotate a stored 3m tensor (src/lib/generated/tensors.json records) into a wafer frame
// with src/lib/physics/tensors.ts, mark the components whose sign depends on the frame choice (180 deg about z, +z flip),
// and export COMSOL-ordered vectors (SI) and JSON. Frame: IEEE Std 176-1987 (x perpendicular to a mirror, z polar).
// R maps crystal components to global ones; global z = wafer normal, global x = propagation. Flips act on the crystal
// frame first: R_total = R_cut F.
import {
  rotateVoigt3, rotateVoigt4, rotateMatrix3, eulerZXZ, eulerZXZFromMatrix, namedCut, NAMED_CUTS, ROT180_Z, FLIP_Z, matMul, comsolD, comsolEES,
  type Matrix, type NamedCut, type Rank3Kind, type Rank4Kind,
} from "$lib/physics/tensors.ts";
import type { Mat3 } from "$lib/physics/linalg.ts";
import type { TxState } from "$lib/stores/p09";
import { MINUS } from "../fmt.ts";

export interface TxRecord {
  id: string; tensor: string; name: string; symbol: string; unit: string; status: string; source: string; label: string; doi?: string; locator?: string;
  voigt: number[][]; conditions: string; frame: string; notes: string; isDefault: boolean;
}
export interface TxKind { tensor: string; label: string; sym: string; rank: 2 | 3 | 4; kind?: Rank3Kind | Rank4Kind; si: number; siUnit: string; comsol: "D" | "EES" | "full" | "none"; comsolName: string }
export const TX_KINDS: readonly TxKind[] = [
  { tensor: "elastic-stiffness-cE", label: "Elastic stiffness c<sup>E</sup>", sym: "c", rank: 4, kind: "c", si: 1e9, siUnit: "Pa", comsol: "D", comsolName: "Elasticity matrix cE (Voigt), 21 values" },
  { tensor: "elastic-compliance-sE", label: "Compliance s<sup>E</sup>", sym: "s", rank: 4, kind: "s", si: 1e-12, siUnit: "1/Pa", comsol: "D", comsolName: "Compliance matrix sE (Voigt), 21 values" },
  { tensor: "piezo-stress-e", label: "Piezoelectric e", sym: "e", rank: 3, kind: "e", si: 1, siUnit: "C/m^2", comsol: "EES", comsolName: "Coupling matrix eES, 18 values" },
  { tensor: "piezo-strain-d", label: "Piezoelectric d", sym: "d", rank: 3, kind: "d", si: 1e-12, siUnit: "C/N", comsol: "EES", comsolName: "Coupling matrix dET, 18 values (same order as eES)" },
  { tensor: "eo-rS", label: "Electro-optic r<sup>S</sup>", sym: "r", rank: 3, kind: "r", si: 1e-12, siUnit: "m/V", comsol: "full", comsolName: "6 x 3 row-major (no COMSOL material slot)" },
  { tensor: "eo-rT", label: "Electro-optic r<sup>T</sup>", sym: "r", rank: 3, kind: "r", si: 1e-12, siUnit: "m/V", comsol: "full", comsolName: "6 x 3 row-major (no COMSOL material slot)" },
  { tensor: "nlo-d", label: "SHG d", sym: "d", rank: 3, kind: "dSHG", si: 1e-12, siUnit: "m/V", comsol: "full", comsolName: "3 x 6 row-major" },
  { tensor: "photoelastic-p", label: "Photoelastic p", sym: "p", rank: 4, kind: "p", si: 1, siUnit: "1", comsol: "full", comsolName: "6 x 6 row-major (p is not symmetric: p14 differs from p41)" },
  { tensor: "permittivity-T", label: "Permittivity &epsilon;<sup>T</sup>/&epsilon;<sub>0</sub>", sym: "&epsilon;", rank: 2, si: 1, siUnit: "1", comsol: "full", comsolName: "3 x 3 column-major, 9 values" },
  { tensor: "permittivity-S", label: "Permittivity &epsilon;<sup>S</sup>/&epsilon;<sub>0</sub>", sym: "&epsilon;", rank: 2, si: 1, siUnit: "1", comsol: "full", comsolName: "3 x 3 column-major, 9 values" },
];
export const kindOf = (tensor: string): TxKind => TX_KINDS.find((k) => k.tensor === tensor) ?? TX_KINDS[2];

export const CUTS: readonly string[] = [...Object.keys(NAMED_CUTS), "128 deg Y-X", "Euler"];

export function rotationOf(s: TxState): Mat3 {
  const R = s.cut === "Euler" ? eulerZXZ((s.alpha * Math.PI) / 180, (s.beta * Math.PI) / 180, (s.gamma * Math.PI) / 180) : namedCut(s.cut as NamedCut);
  let F: Matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (s.rot180) F = matMul(F, ROT180_Z);
  if (s.flipZ) F = matMul(F, FLIP_Z);
  return matMul(R, F) as Mat3;
}
export const cutRotation = (s: TxState): Mat3 => rotationOf({ ...s, rot180: false, flipZ: false });
export function eulerOf(s: TxState): [number, number, number] {
  if (s.cut === "Euler") return [s.alpha, s.beta, s.gamma];
  return eulerZXZFromMatrix(namedCut(s.cut as NamedCut)).map((v) => (v * 180) / Math.PI) as [number, number, number];
}

export function rotate(k: TxKind, M: number[][], R: Mat3): number[][] {
  const out = k.rank === 2 ? rotateMatrix3(M, R) : k.rank === 3 ? rotateVoigt3(M, k.kind as Rank3Kind, R) : rotateVoigt4(M, k.kind as Rank4Kind, R);
  return out.map((r) => r.map((v) => (Math.abs(v) < 1e-12 * maxAbs(M) ? 0 : v)));
}
const maxAbs = (M: number[][]): number => Math.max(1e-300, ...M.flat().map(Math.abs));

export interface TxResult { M: number[][]; base: number[][]; flipped: boolean[][]; flipR: boolean[][]; flipZ: boolean[][]; R: Mat3; euler: [number, number, number]; labels: { rows: string[]; cols: string[] } }
const VO = ["1", "2", "3", "4", "5", "6"], AX = ["1", "2", "3"];
export function computeTx(s: TxState, rec: TxRecord): TxResult {
  const k = kindOf(rec.tensor);
  const R = rotationOf(s), R0 = cutRotation(s);
  const M = rotate(k, rec.voigt, R), base = rotate(k, rec.voigt, R0);
  // sign set by the frame convention: the component changes sign when the crystal frame is turned 180 deg about z
  // (flipR) or when +z is reversed (flipZ), applied on top of the current frame
  const MR = rotate(k, rec.voigt, matMul(R, ROT180_Z) as Mat3), MZ = rotate(k, rec.voigt, matMul(R, FLIP_Z) as Mat3);
  const tol = 1e-9 * maxAbs(rec.voigt);
  const opp = (a: number, b: number): boolean => Math.abs(a) > tol && Math.abs(a + b) <= 1e-6 * Math.abs(a);
  const flipR = M.map((r, i) => r.map((v, j) => opp(v, MR[i][j])));
  const flipZ = M.map((r, i) => r.map((v, j) => opp(v, MZ[i][j])));
  const flipped = M.map((r, i) => r.map((_, j) => flipR[i][j] || flipZ[i][j]));
  const rows = k.rank === 4 ? VO : k.rank === 2 ? AX : k.kind === "r" ? VO : AX;
  const cols = k.rank === 4 ? VO : k.rank === 2 ? AX : k.kind === "r" ? AX : VO;
  return { M, base, flipped, flipR, flipZ, R, euler: eulerOf(s), labels: { rows, cols } };
}

// ---------- formatting ----------
export function fnum(v: number, w = 8): string {
  if (v === 0) return "0".padStart(w, " ");
  const a = Math.abs(v), d = a >= 100 ? 2 : a >= 10 ? 3 : 4;
  return ((v < 0 ? MINUS : "") + a.toFixed(d)).padStart(w, " ");
}
export function matrixHTML(r: TxResult, sym: string): string {
  const head = `<thead><tr><th></th>${r.labels.cols.map((c) => `<th class="r">${c}</th>`).join("")}</tr></thead>`;
  const body = r.M.map((row, i) => `<tr><th>${r.labels.rows[i]}</th>${row.map((v, j) => `<td class="${v === 0 ? "z" : "nz"}${r.flipR[i][j] ? " fr" : ""}${r.flipZ[i][j] ? " fz" : ""}" data-pop="tx-cell" data-ij="${sym}${r.labels.rows[i]}${r.labels.cols[j]}">${fnum(v)}</td>`).join("")}</tr>`).join("");
  return head + `<tbody>${body}</tbody>`;
}
/** VISUAL glyph grid: square area proportional to |value| (sqrt for side), filled = positive, hollow = negative, ring = frame-sign. */
export function glyphGridSVG(r: TxResult): string {
  const nr = r.M.length, nc = r.M[0].length, cell = 44, W = nc * cell + 30, H = nr * cell + 26;
  const mx = maxAbs(r.M);
  let g = "";
  r.labels.cols.forEach((c, j) => { g += `<text x="${30 + j * cell + cell / 2}" y="14" text-anchor="middle" class="tg-l">${c}</text>`; });
  r.M.forEach((row, i) => {
    g += `<text x="12" y="${26 + i * cell + cell / 2 + 4}" text-anchor="middle" class="tg-l">${r.labels.rows[i]}</text>`;
    row.forEach((v, j) => {
      const x = 30 + j * cell, y = 26 + i * cell, side = v === 0 ? 0 : Math.max(3, (cell - 10) * Math.sqrt(Math.abs(v) / mx));
      g += `<rect x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" class="tg-c${r.flipR[i][j] ? " tg-fr" : r.flipZ[i][j] ? " tg-fz" : ""}"/>`;
      if (side) g += `<rect x="${(x + (cell - side) / 2).toFixed(2)}" y="${(y + (cell - side) / 2).toFixed(2)}" width="${side.toFixed(2)}" height="${side.toFixed(2)}" class="${v > 0 ? "tg-p" : "tg-n"}"/>`;
    });
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="p9-tg" role="img" aria-label="Rotated tensor as a glyph grid">${g}</svg>`;
}
/** VISUAL orientation drawing: wafer plate (global xy), propagation x, crystal X, Y, Z axes after R, oblique projection. */
export function orientSVG(R: Mat3): string {
  const P = (v: number[]): [number, number] => [150 + 92 * (v[0] - 0.42 * v[1]), 112 - 92 * (v[2] - 0.32 * v[1])];
  const col = (j: number): number[] => [R[0][j], R[1][j], R[2][j]];
  const w = [[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]].map((p) => P([p[0] * 0.95, p[1] * 0.95, 0]));
  let g = `<path d="M${w.map((p) => p.map((x) => x.toFixed(1)).join(" ")).join("L")}Z" class="to-wafer"/>`;
  const [px, py] = P([1.25, 0, 0]);
  g += `<path d="M150 112L${px.toFixed(1)} ${py.toFixed(1)}" class="to-prop"/><text x="${(px + 6).toFixed(1)}" y="${(py + 18).toFixed(1)}" class="to-t">x, propagation</text>`;
  const [nx, ny] = P([0, 0, 1.15]);
  g += `<path d="M150 112L${nx.toFixed(1)} ${ny.toFixed(1)}" class="to-norm"/><text x="${(nx - 8).toFixed(1)}" y="${(ny + 4).toFixed(1)}" text-anchor="end" class="to-t">z, wafer normal</text>`;
  ["X", "Y", "Z"].forEach((n, j) => {
    const v = col(j), [x, y] = P(v), back = v[1] > 0.05;
    g += `<path d="M150 112L${x.toFixed(1)} ${y.toFixed(1)}" class="to-ax${n === "Z" ? " to-c" : ""}${back ? " to-back" : ""}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" class="to-dot${n === "Z" ? " to-c" : ""}"/><text x="${(x + 8).toFixed(1)}" y="${(y - 6).toFixed(1)}" class="to-n${n === "Z" ? " to-c" : ""}">${n}</text>`;
  });
  return `<svg viewBox="0 0 330 220" class="p9-orient" role="img" aria-label="Crystal axes X, Y, Z in the wafer frame">${g}</svg>`;
}

// ---------- export ----------
export function exportComsol(k: TxKind, M: number[][]): string {
  const si = M.map((r) => r.map((v) => v * k.si));
  let v: number[];
  if (k.comsol === "D") v = comsolD(si);
  else if (k.comsol === "EES") v = comsolEES(si);
  else if (k.rank === 2) v = [0, 1, 2].flatMap((j) => [0, 1, 2].map((i) => si[i][j]));
  else v = si.flat();
  return `{${v.map((x) => (x === 0 ? "0" : x.toExponential(6))).join(", ")}}`;
}
export function exportJSON(k: TxKind, rec: TxRecord, r: TxResult, s: TxState): string {
  const o = {
    tensor: rec.tensor, record: rec.id, symbol: rec.symbol, unit: rec.unit, source: rec.source, doi: rec.doi ?? null, status: rec.status,
    frame: { convention: "IEEE Std 176-1987, 3m: x perpendicular to a mirror plane, z polar (+Z: positive d33)", global: "z = wafer normal, x = propagation", cut: s.cut, euler_zxz_deg: r.euler.map((v) => +v.toFixed(6)), rot180_about_z: s.rot180, plus_z_flipped: s.flipZ, R_crystal_to_global: r.R.map((row) => row.map((v) => +v.toFixed(12))) },
    voigt_order: k.rank === 2 ? "3x3" : "xx, yy, zz, yz, xz, xy; engineering shear strain",
    voigt: r.M.map((row) => row.map((v) => +v.toPrecision(8))),
  };
  return JSON.stringify(o, null, 1);
}
