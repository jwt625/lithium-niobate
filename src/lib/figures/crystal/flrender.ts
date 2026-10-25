// FIG-01-02 One cell, flipped: pure renderers shared by the server load (prerendered default state) and the client module
// (fl.ts). Inputs: FlData from flbuild.ts (positions derived from hsu1997 with crystal.ts), s in [-1, 1], frame, field E (kV/mm).
// Energy: U(s) = U0 (s^2 - 1)^2 - t s (ferro.ts quarticWell, template shape) with U0 = 2858 K (inbar1996, as printed) and
// t = Ps V_cell E / kB (template coupling: the 10-atom cell's dipole taken linear in s; kPerE in K per kV/mm).
// TECH: character grids (side projection along a, viewed from +a, screen right = +y, 0.25 A per row, 0.125 A per column, so one row = two columns = isotropic
// for a 0.6 em glyph on a 1.18 em line). VISUAL: SVG, orthographic view from +a, 16 deg above the basal plane.
import { quarticWell, quarticBarrier } from "$lib/physics/ferro.ts";
import { sgn, fix, pad, FS, MINUS } from "../fmt.ts";

export type V3 = [number, number, number];
export type Frame = "O" | "Nb" | "com";
export interface FlAtom { el: "Li" | "Nb" | "O"; p0: V3; d: Record<Frame, V3> }
export interface FlData {
  /** [0] Li, [1] Nb, [2..13] O by plane (bottom to top) */
  atoms: FlAtom[];
  /** 4 O planes, bottom to top, atom indices */
  planes: number[][];
  edges: [number, number][];
  /** faces per octahedron (8 triangles each) */
  faces: number[][][];
  /** octahedra as [lower plane, upper plane] */
  oct: [number, number][];
  /** plane index of the O3 face Li passes */
  face: number;
  disp: Record<Frame, { Nb: number; Li: number; O: number }>;
  U0: number; mRy: number; kPerE: number; Ec: number; Ps: number; Vcell: number; twist: number;
  ref: { liFace: number; nbOff: number; nbLat: number };
}

export const FRAME_LABEL: Record<Frame, string> = { O: "O sublattice fixed", Nb: "Nb fixed", com: "centre of mass fixed" };
export const pos = (D: FlData, i: number, s: number, f: Frame): V3 => { const a = D.atoms[i]; return [a.p0[0] + s * a.d[f][0], a.p0[1] + s * a.d[f][1], a.p0[2] + s * a.d[f][2]]; };
const planeZ = (D: FlData, k: number, s: number, f: Frame): number => pos(D, D.planes[k][0], s, f)[2];

// ---------- readouts (fixed width) ----------
export interface FlState { s: number; frame: Frame; E: number }
export function readouts(D: FlData, st: FlState): Record<string, string> {
  const { s, frame: f, E } = st;
  const d = D.disp[f];
  const li = pos(D, 0, s, f), fz = planeZ(D, D.face, s, f);
  const fo = D.planes[D.face].map((i) => pos(D, i, s, f));
  const lio = Math.min(...fo.map((p) => Math.hypot(p[0] - li[0], p[1] - li[1], p[2] - li[2])));
  const t = D.kPerE * E, U = quarticWell(s, D.U0, t), bar = quarticBarrier(D.U0, t);
  return {
    s: sgn(s, 2),
    frame: FRAME_LABEL[f].padEnd(20, FS),
    nb: `${sgn(s * d.Nb, 3)} Å`, li: `${sgn(s * d.Li, 3)} Å`, o: `${sgn(s * d.O, 3)} Å`,
    box: `Nb ${sgn(s * d.Nb, 3)} Å  Li ${sgn(s * d.Li, 3)} Å  O ${sgn(s * d.O, 3)} Å`,
    lif: `${sgn(li[2] - fz, 3)} Å`,
    lio: `${lio.toFixed(3)} Å`,
    u: `${pad(fix(U, 0), 5)} K`,
    e: `${sgn(E, 1)} kV/mm`,
    eec: `${pad(fix(E / D.Ec, 2), 5)}`,
    tilt: `${pad(fix(2 * Math.abs(t), 0), 4)} K`,
    bar: `${pad(bar.toFixed(0), 4)} K ${pad((100 * bar / D.U0).toFixed(1), 5)}%`,
  };
}

// ---------- TECH: column art, side projection along a ----------
type Cell = { ch: string; k: string };
const COLS = 56, ROWS = 33, DZ = 0.25, DY = 0.125, ZTOP = 5.25, XC = 24, LAB = 41;
const esc = (c: string): string => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c);
function serialize(g: Cell[][]): string {
  return g.map((row) => {
    let out = "", cur = "", buf = "";
    const flush = (): void => { if (buf) out += cur ? `<span class="${cur}">${buf}</span>` : buf; buf = ""; };
    for (const c of row) { if (c.k !== cur) { flush(); cur = c.k; } buf += esc(c.ch); }
    flush();
    return out;
  }).join("\n");
}
const blank = (w: number, h: number): Cell[][] => Array.from({ length: h }, () => Array.from({ length: w }, () => ({ ch: " ", k: "" })));
const text = (g: Cell[][], r: number, c: number, s: string, k = ""): void => { [...s].forEach((ch, i) => { if (g[r] && c + i >= 0 && c + i < g[r].length) g[r][c + i] = { ch, k }; }); };

export function artASCII(D: FlData, st: FlState): string {
  const { s, frame: f } = st;
  const g = blank(COLS, ROWS + 7);
  const cr = (p: V3): [number, number] => [XC + p[1] / DY, (ZTOP - p[2]) / DZ];
  const R = (v: number): number => Math.round(v);
  const li = pos(D, 0, s, f), nb = pos(D, 1, s, f), fz = planeZ(D, D.face, s, f);
  const near = Math.abs(li[2] - fz) < 0.3;
  const faceSet = new Set(D.planes[D.face]);
  // z ruler (A, from the O3 face at s = 0)
  for (let r = 0; r < ROWS; r++) {
    const z = ZTOP - r * DZ;
    if (Math.abs(z - Math.round(z)) < 1e-6) text(g, r, 0, `${pad(sgn(z, 1), 5)}-`, "dim");
    else text(g, r, 5, "|", "dim");
  }
  text(g, 0, 0, "z, Å", "dim");
  // octahedron edges
  for (const [i, j] of D.edges) {
    const [c0, r0] = cr(pos(D, i, s, f)), [c1, r1] = cr(pos(D, j, s, f));
    const dx = (c1 - c0) * 0.6, dy = (r1 - r0) * 1.18, ang = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
    const a = ang > 90 ? 180 - ang : ang;
    const ch = a < 22.5 ? "-" : a > 67.5 ? "|" : (dx > 0) === (dy < 0) ? "/" : "\\";
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0))));
    const k = near && faceSet.has(i) && faceSet.has(j) ? "inv" : "dim";
    for (let q = 0; q <= n; q++) { const cc = R(c0 + ((c1 - c0) * q) / n), rr = R(r0 + ((r1 - r0) * q) / n); if (g[rr]?.[cc] && g[rr][cc].ch === " " || g[rr]?.[cc]?.k === "dim" && k === "inv") g[rr][cc] = { ch, k }; }
  }
  // empty octahedron centroids
  D.oct.forEach(([lo, hi]) => {
    const zl = planeZ(D, lo, s, f), zh = planeZ(D, hi, s, f);
    const occ = [li, nb].some((p) => p[2] > zl + 0.05 && p[2] < zh - 0.05);
    if (!occ) { const [c, r] = cr([0, 0, (zl + zh) / 2]); text(g, R(r), R(c), "·", "dim"); }
  });
  // atoms
  for (let i = 2; i < D.atoms.length; i++) { const [c, r] = cr(pos(D, i, s, f)); text(g, R(r), R(c), "O", near && faceSet.has(i) ? "inv" : "hi"); }
  { const [c, r] = cr(nb); text(g, R(r), R(c) - 1, "Nb", "hi"); }
  { const [c, r] = cr(li); text(g, R(r), R(c) - 1, "Li", near ? "inv" : "hi"); }
  // labels: octahedron occupants and the face
  D.oct.forEach(([lo, hi]) => {
    const zl = planeZ(D, lo, s, f), zh = planeZ(D, hi, s, f), r = R((ZTOP - (zl + zh) / 2) / DZ);
    const lab = nb[2] > zl && nb[2] < zh ? "NbO6" : li[2] > zl + 0.06 && li[2] < zh - 0.06 ? "LiO6" : "empty";
    text(g, r, LAB, lab, lab === "empty" ? "dim" : "");
  });
  text(g, R((ZTOP - fz) / DZ), LAB, Math.abs(li[2] - fz) < 0.06 ? "Li in O3 face" : "O3 face", near ? "hi" : "dim");
  // displacement ruler: 0.05 A per column, -1 .. +1 A
  const r0 = ROWS + 1, z0 = 26, A = 20; // column of zero, columns per A
  text(g, r0, 6, `along c from s = 0, ${f === "com" ? "c.o.m." : f} frame`, "dim");
  [-1, -0.5, 0, 0.5, 1].forEach((v) => { const l = v === 0 ? "0" : `${v < 0 ? MINUS : "+"}${Math.abs(v).toFixed(1)}`; text(g, r0 + 1, z0 + v * A - (l.length === 1 ? 0 : 2), l, "dim"); });
  text(g, r0 + 2, 6, "|----+----|----+----|----+----|----+----|", "dim");
  const d = D.disp[f];
  ([["Nb", d.Nb], ["Li", d.Li], ["O", d.O]] as const).forEach(([el, v], k) => {
    const r = r0 + 3 + k, x = s * v, n = Math.round(Math.abs(x) * A);
    text(g, r, 1, el, "hi");
    if (n === 0) text(g, r, z0, "|");
    else for (let q = 1; q <= n; q++) text(g, r, x > 0 ? z0 + q : z0 - q, q === n ? (x > 0 ? ">" : "<") : "=");
    text(g, r, 49, `${sgn(x, 3)}`);
  });
  return serialize(g);
}

// ---------- TECH: energy inset, 40 x 10 characters ----------
const WC = 40, WR = 10, SMIN = -1.5, SMAX = 1.5, UMIN = -400, UMAX = 3400;
export function wellASCII(D: FlData, st: FlState): string {
  const t = D.kPerE * st.E;
  const g = blank(48, WR + 3);
  const col = (s: number): number => Math.round(((s - SMIN) / (SMAX - SMIN)) * (WC - 1));
  const row = (U: number): number => Math.round(((UMAX - U) / (UMAX - UMIN)) * (WR - 1));
  text(g, row(D.U0), 0, `${pad(String(D.U0), 5)}-`, "dim");
  text(g, row(0), 0, `${pad("0", 5)}-`, "dim");
  for (let r = 0; r < WR; r++) if (g[r][5].ch === " ") text(g, r, 5, "|", "dim");
  let prev = -1;
  for (let c = 0; c < WC; c++) {
    const s = SMIN + ((SMAX - SMIN) * c) / (WC - 1), r = row(quarticWell(s, D.U0, t));
    if (r >= 0 && r < WR) text(g, r, 7 + c, ".");
    if (prev >= 0 && Math.abs(r - prev) > 1) for (let q = Math.min(r, prev) + 1; q < Math.max(r, prev); q++) if (q >= 0 && q < WR) text(g, q, 7 + c - (r > prev ? 1 : 0), ":");
    prev = r;
  }
  const rb = row(quarticWell(st.s, D.U0, t));
  if (rb >= 0 && rb < WR) text(g, rb, 7 + col(st.s), "@", "inv");
  text(g, WR, 6, "+" + "-".repeat(WC), "dim");
  text(g, WR + 1, 7 + col(-1) - 1, `${MINUS}1`, "dim"); text(g, WR + 1, 7 + col(0), "0", "dim"); text(g, WR + 1, 7 + col(1) - 1, "+1", "dim"); text(g, WR + 1, 7 + WC - 1, "s", "dim");
  text(g, WR + 2, 0, "U, K per 10-atom cell", "dim");
  return serialize(g);
}

// ---------- VISUAL: column, oblique orthographic SVG ----------
const TH = (16 * Math.PI) / 180, KS = 60, X0 = 200, Y0 = 372;
// camera on the +a side, elevated by TH, looking toward -a: screen right = +y (right-handed), depth grows away from the camera
const proj = (p: V3): [number, number, number] => [X0 + KS * p[1], Y0 - KS * (p[2] * Math.cos(TH) - p[0] * Math.sin(TH)), -p[0] * Math.cos(TH) - p[2] * Math.sin(TH)];
const CAM: V3 = [Math.cos(TH), 0, Math.sin(TH)];
const f1 = (v: number): string => v.toFixed(1);
const R_EL = { Nb: 15, Li: 12, O: 10 } as const;

export function colSVG(D: FlData, st: FlState): string {
  const { s, frame: f } = st;
  const P = D.atoms.map((_, i) => pos(D, i, s, f));
  const Q = P.map(proj);
  const li = P[0], nb = P[1], fz = planeZ(D, D.face, s, f);
  const glow = Math.max(0, 1 - Math.abs(li[2] - fz) / 0.35);
  const pts = (ix: number[]): string => ix.map((i) => `${f1(Q[i][0])},${f1(Q[i][1])}`).join(" ");
  let back = "", front = "", lab = "";
  D.oct.forEach(([lo, hi], k) => {
    const zl = P[D.planes[lo][0]][2], zh = P[D.planes[hi][0]][2];
    const occ = nb[2] > zl && nb[2] < zh ? "Nb" : li[2] > zl + 0.02 && li[2] < zh - 0.02 ? "Li" : "e";
    const ids = [...D.planes[lo], ...D.planes[hi]];
    const cen = [0, 1, 2].map((q) => ids.reduce((a, i) => a + P[i][q], 0) / 6);
    for (const fc of D.faces[k]) {
      const fcen = [0, 1, 2].map((q) => fc.reduce((a, i) => a + P[i][q], 0) / 3);
      const facing = (fcen[0] - cen[0]) * CAM[0] + (fcen[1] - cen[1]) * CAM[1] + (fcen[2] - cen[2]) * CAM[2] > 0;
      const poly = `<polygon class="fc ${occ}" points="${pts(fc)}"/>`;
      if (facing) front += poly; else back += poly;
    }
    const yc = Y0 - KS * ((zl + zh) / 2) * Math.cos(TH);
    lab += `<text class="ol ${occ}" x="338" y="${f1(yc + 5)}">${occ === "Nb" ? "NbO<tspan class='sb6' dy='5'>6</tspan>" : occ === "Li" ? "LiO<tspan class='sb6' dy='5'>6</tspan>" : "empty"}</text>`;
  });
  // ghosts (s = 0 reference positions) and displacement arrows
  let ghost = "";
  D.atoms.forEach((a, i) => {
    const g = proj(a.p0), q = Q[i], dd = Math.hypot(q[0] - g[0], q[1] - g[1]);
    if (a.el === "O") { ghost += `<circle class="gO" cx="${f1(g[0])}" cy="${f1(g[1])}" r="2.5"/>`; return; }
    ghost += `<circle class="g${a.el}" cx="${f1(g[0])}" cy="${f1(g[1])}" r="${R_EL[a.el]}"/>`;
    if (dd > 4) {
      const ux = (q[0] - g[0]) / dd, uy = (q[1] - g[1]) / dd, ex = q[0] - ux * (R_EL[a.el] + 3), ey = q[1] - uy * (R_EL[a.el] + 3);
      if (Math.hypot(ex - g[0], ey - g[1]) > 4) ghost += `<line class="da" x1="${f1(g[0] + 0 * ux)}" y1="${f1(g[1])}" x2="${f1(ex)}" y2="${f1(ey)}"/><path class="dh" d="M${f1(ex)},${f1(ey)} l${f1(-ux * 7 - uy * 4)},${f1(-uy * 7 + ux * 4)} l${f1(uy * 8)},${f1(-ux * 8)}Z"/>`;
    }
  });
  const sph = (i: number): string => { const a = D.atoms[i], q = Q[i]; return `<circle class="at ${a.el}" cx="${f1(q[0])}" cy="${f1(q[1])}" r="${R_EL[a.el]}" fill="url(#fl-g${a.el})"/>`; };
  const cats = [0, 1].sort((a, b) => Q[b][2] - Q[a][2]).map(sph).join("");
  const oIdx = D.atoms.map((_, i) => i).slice(2).sort((a, b) => Q[b][2] - Q[a][2]);
  const oBack = oIdx.filter((i) => P[i][0] < 0).map(sph).join(""), oFront = oIdx.filter((i) => P[i][0] >= 0).map(sph).join("");
  const ring = `<polygon class="ring" points="${pts(D.planes[D.face])}" style="opacity:${glow.toFixed(3)}"/>`;
  // polarization arrow (length proportional to s), +c axis, 1 A scale bar
  const ym = Y0 - KS * 1.155 * Math.cos(TH), L = 118 * s;
  const arrow = Math.abs(s) < 0.02 ? `<circle class="pa0" cx="478" cy="${f1(ym)}" r="3"/>` :
    `<line class="pa" x1="478" y1="${f1(ym + L)}" x2="478" y2="${f1(ym - L + Math.sign(s) * 14)}"/><path class="pah" d="M478,${f1(ym - L)} l-9,${f1(Math.sign(s) * 18)} h18Z"/>`;
  const fixed = `<line class="ax" x1="26" y1="560" x2="26" y2="80"/><path class="axh" d="M26,68 l-6,14 h12Z"/><text class="axl" x="36" y="80">+c</text>` +
    `<line class="sb" x1="46" y1="600" x2="${46 + KS}" y2="600"/><line class="sb" x1="46" y1="594" x2="46" y2="606"/><line class="sb" x1="${46 + KS}" y1="594" x2="${46 + KS}" y2="606"/><text class="sbl" x="${52 + KS}" y="605">1 Å</text>` +
    `<text class="pl" x="494" y="${f1(ym + 10)}">P</text>`;
  const defs = `<defs>${(["Nb", "Li", "O"] as const).map((e) => `<radialGradient id="fl-g${e}" cx="0.35" cy="0.32" r="0.75"><stop offset="0" class="s0 ${e}"/><stop offset="0.55" class="s1 ${e}"/><stop offset="1" class="s2 ${e}"/></radialGradient>`).join("")}</defs>`;
  return `${defs}${fixed}<g class="bk">${back}</g><g class="gh">${ghost}</g>${oBack}${ring}${cats}<g class="fr">${front}</g>${oFront}${lab}${arrow}`;
}

// ---------- VISUAL: double-well inset ----------
const WX0 = 58, WX1 = 404, WY0 = 16, WY1 = 178;
export function wellSVG(D: FlData, st: FlState): string {
  const t = D.kPerE * st.E;
  const X = (s: number): number => WX0 + ((s - SMIN) / (SMAX - SMIN)) * (WX1 - WX0);
  const Y = (U: number): number => WY0 + ((UMAX - U) / (UMAX - UMIN)) * (WY1 - WY0);
  const path = (tt: number): string => { let d = ""; for (let k = 0; k <= 150; k++) { const s = SMIN + ((SMAX - SMIN) * k) / 150; d += `${k ? "L" : "M"}${f1(X(s))},${f1(Y(quarticWell(s, D.U0, tt)))}`; } return d; };
  const bx = X(st.s), by = Y(quarticWell(st.s, D.U0, t));
  const ticks = [-1, 0, 1].map((s) => `<line class="tk" x1="${f1(X(s))}" y1="${WY1}" x2="${f1(X(s))}" y2="${WY1 + 6}"/><text class="tl" x="${f1(X(s))}" y="${WY1 + 22}" text-anchor="middle">${s < 0 ? MINUS + "1" : s > 0 ? "+1" : "0"}</text>`).join("");
  const yt = [[0, "0"], [D.U0, `${D.U0} K`]].map(([u, l]) => `<line class="tk" x1="${WX0 - 6}" y1="${f1(Y(+u))}" x2="${WX0}" y2="${f1(Y(+u))}"/><line class="gr" x1="${WX0}" y1="${f1(Y(+u))}" x2="${WX1}" y2="${f1(Y(+u))}"/><text class="tl" x="${WX0 - 10}" y="${f1(Y(+u) + 5)}" text-anchor="end">${l}</text>`).join("");
  return `<defs><clipPath id="fl-wc"><rect x="${WX0}" y="${WY0 - 12}" width="${WX1 - WX0}" height="${WY1 - WY0 + 12}"/></clipPath></defs>` +
    `<line class="axw" x1="${WX0}" y1="${WY0 - 6}" x2="${WX0}" y2="${WY1}"/><line class="axw" x1="${WX0}" y1="${WY1}" x2="${WX1}" y2="${WY1}"/>${yt}${ticks}` +
    `<text class="tl" x="${WX1}" y="${WY1 + 22}" text-anchor="end">s</text>` +
    `<g clip-path="url(#fl-wc)">${Math.abs(t) > 1e-9 ? `<path class="u0" d="${path(0)}"/>` : ""}<path class="uc" d="${path(t)}"/></g>` +
    `<circle class="ball" cx="${f1(bx)}" cy="${f1(by - 9)}" r="9"/>`;
}

// ---------- VISUAL: the same displacement in three frames (L2 specimen; numbers as in the TECH table) ----------
export function framesSVG(D: FlData): string {
  const ZMIN = -0.4, ZMAX = 0.8, XA = 190, XB = 740;
  const X = (z: number): number => XA + ((z - ZMIN) / (ZMAX - ZMIN)) * (XB - XA);
  const rows: [Frame, string][] = [["O", "O sublattice held"], ["Nb", "Nb held"], ["com", "Centre of mass held"]];
  let out = "";
  for (let z = -0.4; z <= 0.8 + 1e-9; z += 0.2) {
    const x = X(z), l = Math.abs(z) < 1e-9 ? "0" : `${z < 0 ? MINUS : "+"}${Math.abs(z).toFixed(1)}`;
    out += `<line class="${Math.abs(z) < 1e-9 ? "z0" : "gr"}" x1="${f1(x)}" y1="30" x2="${f1(x)}" y2="214"/><text class="tl" x="${f1(x)}" y="236" text-anchor="middle">${l}</text>`;
  }
  out += `<text class="tl" x="${XB}" y="16" text-anchor="end">displacement along +c from s = 0, Å</text>`;
  const Y = (k: number): number => 62 + k * 62;
  (["Nb", "Li", "O"] as const).forEach((el) => {
    out += `<polyline class="tr ${el}" points="${rows.map(([f], k) => `${f1(X(D.disp[f][el]))},${Y(k)}`).join(" ")}"/>`;
  });
  rows.forEach(([f, lab], k) => {
    const y = Y(k);
    out += `<text class="rl" x="0" y="${y + 5}">${lab}</text><line class="rw" x1="${XA}" y1="${y}" x2="${XB}" y2="${y}"/>`;
    (["O", "Nb", "Li"] as const).forEach((el) => {
      const v = D.disp[f][el], x = X(v);
      out += `<rect class="mk ${el}" x="${f1(x - 7)}" y="${y - 7}" width="14" height="14" transform="rotate(45 ${f1(x)} ${y})"/><text class="ml ${el}" x="${f1(x)}" y="${y - 16}" text-anchor="middle">${el} ${sgn(v, 3)}</text>`;
    });
  });
  return out;
}
