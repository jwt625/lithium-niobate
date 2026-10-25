// FIG-01-10 Powers of ten along a wall: feature table and pure renderers shared by the server load (prerendered default state)
// and the client module (pw.ts). State: L = log10(scale bar / nm) in [-1, 4], wall tilt th (deg) from c, Ps (C/m^2).
// The view is BARS scale bars wide, centred on a 180 deg wall: left domain s = +1 (P up), right domain s = -1 (P down).
// Bound charge: sigma_b = 2 Ps sin(theta) (ferro.ts boundCharge), electron sheet density sigma_b / e (ferro.ts sheetDensity).
// The drawn tilt leans the top of the wall over the P-up domain, so both polarizations point into the wall (head-to-head,
// sigma_b > 0). Atom positions: PwColumn from pwbuild.ts (crystal.ts flip model on hsu1997, O-sublattice frame).
// Display choices (template, declared in the page popups): view width, microscope halo profile, PFM profile shape, display
// radii, bound-charge dot spacing where the true spacing is below the display minimum.
import { boundCharge, sheetDensity } from "../../physics/ferro.ts";
import { QE } from "../../physics/constants.ts";
import { MINUS, pad } from "../fmt.ts";

export type PwEl = "Li" | "Nb" | "O";
export interface PwAtom { el: PwEl; x: number; z: number }
/** One octahedral column (nm): a, c, atoms for s = +1 (up) and s = -1 (dn), relative to the column axis; z = 0 at the O3 face
 *  the central Li threads. liUp / liDn: height of that Li above the face. */
export interface PwColumn { a: number; c: number; up: PwAtom[]; dn: PwAtom[]; liUp: number; liDn: number }
export interface PwState { L: number; th: number; ps: number }

export const L_MAX = 4, L_MIN = -1;
/** View width in scale bars. */
export const BARS = 8;
/** Lattice parameter a (nm), hsu1997 via static/data/linbo3-cell.json (asserted against the cell in the server load). */
export const A_NM = 0.5148;
export const DEG = Math.PI / 180;

export interface PwFeature { id: "strain" | "biref" | "pfm" | "assumed" | "ideal" | "tem"; letter: string; lo: number; hi: number; kind: "max" | "range" | "assumed"; char: number; label: string }
/** Sourced length scales across the wall (full widths, nm). char = representative length used to pick the feature at a scale
 *  (geometric mean of a range). Sources and status: page markup (feature boxes and legend). */
export const FEATURES: readonly PwFeature[] = [
  { id: "strain", letter: "A", lo: 0, hi: 10000, kind: "max", char: 10000, label: "X-ray shear strain, up to 10 µm" },
  { id: "biref", letter: "B", lo: 0, hi: 2000, kind: "max", char: 2000, label: "birefringent, within 2 µm" },
  { id: "pfm", letter: "C", lo: 65, hi: 150, kind: "range", char: Math.sqrt(65 * 150), label: "PFM 65–150 nm" },
  { id: "assumed", letter: "D", lo: 10, hi: 10, kind: "assumed", char: 10, label: "10 nm assumed, Werner et al. 2017" },
  { id: "ideal", letter: "E", lo: A_NM, hi: 2 * A_NM, kind: "range", char: Math.SQRT2 * A_NM, label: "1–2 a ≈ 0.5–1.0 nm" },
  { id: "tem", letter: "F", lo: 0, hi: 0.28, kind: "max", char: 0.28, label: "TEM ≤ 0.28 nm, LiTaO₃" },
];
export const featureAt = (L: number): PwFeature =>
  FEATURES.reduce((b, f) => (Math.abs(Math.log10(f.char) - L) < Math.abs(Math.log10(b.char) - L) ? f : b));

// ---------- numbers ----------
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
/** smoothstep from 0 at v = a to 1 at v = b */
const ramp = (v: number, a: number, b: number): number => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** Length with three significant digits and nm / µm unit (at most 8 characters). */
export function fmtLen(nm: number): string {
  const um = nm >= 999.5;
  const v = um ? nm / 1000 : nm;
  const d = v >= 99.95 ? 0 : v >= 9.995 ? 1 : v >= 0.9995 ? 2 : 3;
  return `${v.toFixed(d)} ${um ? "µm" : "nm"}`;
}
/** Mantissa-exponent form, "1.55e13" (7 characters for exponents 10..99). */
export function fmtE(v: number): string {
  if (v === 0) return "0";
  let e = Math.floor(Math.log10(v)), m = v / 10 ** e;
  if (+m.toFixed(2) >= 10) { m /= 10; e += 1; }
  return `${m.toFixed(2)}e${e}`;
}
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
const sup = (s: string): string => [...s].map((ch) => SUP[ch] ?? ch).join("");
/** "1.55 × 10¹³" */
export function fmtX(v: number): string {
  if (v === 0) return "0";
  const [m, e] = fmtE(v).split("e");
  return `${m} × 10${sup(e)}`;
}

export interface PwCharge { sig: number; n: number; spacing: number }
/** sigma_b (C/m^2), electron sheet density (1/cm^2), mean spacing of one elementary charge per square (nm). */
export function charge(ps: number, thDeg: number): PwCharge {
  const sig = boundCharge(ps, thDeg * DEG);
  const n = sheetDensity(sig) / 1e4;
  return { sig, n, spacing: n > 0 ? 1 / Math.sqrt(n * 1e-14) : Infinity };
}

export function readouts(st: PwState): Record<string, string> {
  const s = 10 ** st.L;
  const q = charge(st.ps, st.th);
  const sp = Number.isFinite(q.spacing) ? fmtLen(q.spacing) : "none";
  return {
    s: pad(fmtLen(s), 8),
    w: pad(fmtLen(BARS * s), 8),
    th: `${st.th.toFixed(2)} deg`,
    thv: `${st.th.toFixed(2)}°`,
    sig: `${q.sig.toFixed(4)} C/m²`,
    sigv: q.sig.toFixed(4),
    n: `${pad(fmtE(q.n), 7)} e/cm²`,
    nv: pad(fmtX(q.n), 11),
    sp: pad(sp, 8),
    ps: st.ps.toFixed(2),
    line: `θ ${st.th.toFixed(2)} deg  σb ${q.sig.toFixed(4)} C/m²  ${pad(fmtE(q.n), 7)} e/cm²`,
  };
}

// ---------- shared geometry ----------
/** Wall x (nm) at height z (nm) relative to the view centre: the top leans over the P-up (left) side. */
const wallX = (z: number, th: number): number => -z * Math.tan(th * DEG);
/** Smallest drawn spacing of bound-charge marks, in units of the 5 deg, Ps = 0.71 spacing: grows as 1/sigma_b. */
const dotScale = (ps: number, th: number): number => (th > 0 ? boundCharge(0.71, 5 * DEG) / boundCharge(ps, th * DEG) : Infinity);

interface Placed { el: PwEl; x: number; z: number; side: 1 | -1; col: number }
/** Atoms of the strip inside |x| <= hw, |z| <= hh (nm); each atom taken from the s = +1 template left of the wall and from the
 *  s = -1 template right of it (decided per atom height, so a tilted wall is a stepped wall). Columns at x = (n + 1/2) a. */
function placeAtoms(C: PwColumn, th: number, hw: number, hh: number): Placed[] {
  const out: Placed[] = [];
  const n0 = Math.floor(-hw / C.a) - 2, n1 = Math.ceil(hw / C.a) + 1;
  for (let n = n0; n <= n1; n++) {
    const X = (n + 0.5) * C.a;
    for (const [list, side] of [[C.up, 1], [C.dn, -1]] as const)
      for (const p of list) {
        if (Math.abs(p.z) > hh) continue;
        const left = X < wallX(p.z, th);
        if ((side === 1) !== left) continue;
        const x = X + p.x;
        if (Math.abs(x) > hw) continue;
        out.push({ el: p.el, x, z: p.z, side, col: n });
      }
  }
  return out;
}

// ---------- TECH: character grids ----------
type Cell = { ch: string; k: string };
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
const put = (g: Cell[][], r: number, c: number, s: string, k = ""): void => { [...s].forEach((ch, i) => { if (g[r] && c + i >= 0 && c + i < g[r].length) g[r][c + i] = { ch, k }; }); };

/** Grid width of every TECH art block (characters). */
export const TCOLS = 64;
const RC0 = 5; // ruler: column of L = 4
const rulCol = (L: number): number => RC0 + Math.round((L_MAX - L) * 10);
const DECADES = ["10 µm", "1 µm", "100 nm", "10 nm", "1 nm", "0.1 nm"];

/** Log ruler 10 µm to 0.1 nm, 10 columns per decade: labels, ticks, feature letters (active one inverted), cursor. */
export function rulerASCII(st: PwState): string {
  const g = blank(TCOLS, 4);
  DECADES.forEach((lab, i) => put(g, 0, rulCol(L_MAX - i) - Math.floor((lab.length - 1) / 2), lab, "dim"));
  for (let c = rulCol(L_MAX); c <= rulCol(L_MIN); c++) put(g, 1, c, (c - RC0) % 10 === 0 ? "+" : "-", (c - RC0) % 10 === 0 ? "" : "dim");
  for (let d = 0; d < 5; d++) for (let m = 2; m <= 9; m++) { const c = rulCol(L_MAX - d - 1 + Math.log10(m)); if ((c - RC0) % 10) put(g, 1, c, "·", "dim"); }
  const act = featureAt(st.L);
  for (const f of FEATURES) put(g, 2, rulCol(Math.log10(f.char)), f.letter, f === act ? "inv" : "");
  const c = rulCol(st.L), lab = `s ${fmtLen(10 ** st.L)}`;
  put(g, 3, c, "^", "pw-hi");
  if (c + 2 + lab.length <= TCOLS) put(g, 3, c + 2, lab); else put(g, 3, c - 1 - lab.length, lab);
  return serialize(g);
}

const VR = 20, F0 = 2, NF = 61, SR0 = 9, SRC = 14, SR1 = 19; // view grid: field columns F0..F0+NF-1, specimen rows SR0..SR1, centre SRC
/** Character cell height / width (line-height 1.18 em over a 0.6 em monospace advance). */
const ASPECT = 1.18 / 0.6;
/** Finest-scale threshold for the ASCII atom strip (scale bar, nm). */
export const ASCII_ATOMS = 0.8;

/** View across the wall, BARS scale bars wide: scale bar row, one span row per feature (A-F), then the specimen: domains and
 *  wall (tilted, bound-charge marks), or at scale bars <= 0.8 nm the atom strip (L Li, N Nb, o O). */
export function viewASCII(C: PwColumn, st: PwState): string {
  const g = blank(TCOLS, VR);
  const s = 10 ** st.L, W = BARS * s, colNm = W / NF, rowNm = colNm * ASPECT;
  const colOf = (x: number): number => F0 + Math.floor((x / W + 0.5) * NF);
  const mid = F0 + (NF - 1) / 2;
  // row 0: scale bar
  const bl = Math.round(NF / BARS);
  put(g, 0, F0, "|" + "-".repeat(bl - 2) + "|");
  put(g, 0, F0 + bl + 1, fmtLen(s));
  const vw = `view ${fmtLen(W)}`;
  put(g, 0, F0 + NF - vw.length, vw, "dim");
  // rows 1-6: feature spans
  const act = featureAt(st.L);
  FEATURES.forEach((f, i) => {
    const r = 1 + i;
    put(g, r, 0, f.letter, f === act ? "inv" : "");
    const hwc = (f.hi / 2) / colNm, loc = (f.lo / 2) / colNm;
    if (2 * hwc < 1) { put(g, r, mid, ".", "dim"); return; }
    const fill = f.kind === "assumed" ? "~" : "=";
    for (let c = F0; c < F0 + NF; c++) {
      const d = Math.abs(c - mid);
      if (d > hwc - 0.5 + 1e-9) continue;
      put(g, r, c, f.kind === "range" && d <= loc - 0.5 ? "#" : fill, f === act ? "pw-hi" : "");
    }
    if (hwc - 0.5 > (NF - 1) / 2) { put(g, r, F0, "<", "pw-hi"); put(g, r, F0 + NF - 1, ">", "pw-hi"); }
    else if (2 * hwc >= 4) { put(g, r, Math.round(mid - hwc + 0.5), "[", f === act ? "pw-hi" : ""); put(g, r, Math.round(mid + hwc - 0.5), "]", f === act ? "pw-hi" : ""); }
  });
  for (let c = F0; c < F0 + NF; c += 2) put(g, 7, c, "·", "dim");
  // specimen
  const atoms = s <= ASCII_ATOMS + 1e-9;
  put(g, SR0 - 1, F0, atoms ? "s +1, P up" : "P up", "dim");
  const rl = atoms ? "s -1, P down" : "P down";
  put(g, SR0 - 1, F0 + NF - rl.length, rl, "dim");
  const zOf = (r: number): number => (SRC - r) * rowNm;
  const wcol = (r: number): number => colOf(wallX(zOf(r), st.th));
  if (atoms) {
    const hw = W / 2, hh = (SRC - SR0 + 0.5) * rowNm;
    for (let r = SR0; r <= SR1; r++) put(g, r, wcol(r), ":", "dim");
    const P = placeAtoms(C, st.th, hw, hh);
    for (const pass of ["O", "X"]) for (const p of P) {
      if ((pass === "O") !== (p.el === "O")) continue;
      const r = Math.round(SRC - p.z / rowNm), c = colOf(p.x);
      if (r < SR0 || r > SR1 || c < F0 || c >= F0 + NF) continue;
      put(g, r, c, p.el === "O" ? "o" : p.el === "Li" ? "L" : "N", p.el === "O" ? "" : "pw-hi");
    }
  } else {
    for (let r = SR0; r <= SR1; r++) {
      const w = wcol(r);
      for (let c = F0 + 2; c < F0 + NF; c += 4) if (Math.abs(c - w) > 1 && (r - SR0) % 2 === 1) put(g, r, c, c < w ? "^" : "v", "dim");
      put(g, r, w, "|");
    }
  }
  // bound charge: rows at multiples of the drawn spacing from the centre row
  const q = charge(st.ps, st.th);
  if (q.sig > 0) {
    const stepRows = Math.max(q.spacing / rowNm, dotScale(st.ps, st.th));
    for (let k = -20; k <= 20; k++) {
      const r = Math.round(SRC - k * stepRows);
      if (r < SR0 || r > SR1) continue;
      put(g, r, wcol(r), "+", "inv");
      if (stepRows > 40) break;
    }
  }
  return serialize(g);
}

/** sigma_b(theta) for the chosen Ps, 0-5 deg, current point (o) and the werner2017 wall inclination (W). */
export function sigmaASCII(st: PwState): string {
  const H = 9, X0 = 8, NX = 51, NR = 6, SMAX = 0.14;
  const g = blank(TCOLS, H);
  const rowOf = (sig: number): number => Math.round((1 - sig / SMAX) * (NR - 1));
  put(g, 0, 0, "0.14", "dim"); put(g, rowOf(0.07), 0, "0.07", "dim"); put(g, NR - 1, 0, "0", "dim");
  for (let r = 0; r < NR; r++) put(g, r, X0 - 2, "|", "dim");
  for (let c = 0; c < NX; c++) {
    const th = (c / (NX - 1)) * 5;
    put(g, rowOf(boundCharge(st.ps, th * DEG)), X0 + c, "·");
  }
  for (let c = X0 - 2; c < X0 + NX; c++) put(g, NR, c, "-", "dim");
  for (let d = 0; d <= 5; d++) { put(g, NR, X0 + d * 10, "+", "dim"); put(g, NR + 1, X0 + d * 10, String(d), "dim"); }
  put(g, NR + 1, X0 + NX + 1, "deg", "dim");
  put(g, NR, X0 + 10, "W", "pw-hi");
  const c = X0 + Math.round((st.th / 5) * (NX - 1));
  put(g, rowOf(boundCharge(st.ps, st.th * DEG)), c, "o", "inv");
  put(g, NR + 2, 0, `σb C/m², Ps ${st.ps.toFixed(2)}   o current   W Werner 2017, ~1 deg`, "dim");
  return serialize(g);
}

// ---------- VISUAL: SVG ----------
const f1 = (v: number): string => (Math.round(v * 10) / 10).toString();
const escT = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
/** Bracket band height (px) at the top of the stage. */
const BAND = 92, BROW = 21;
/** Display radii (nm), template. */
const RAD: Record<PwEl, number> = { O: 0.032, Nb: 0.03, Li: 0.026 };
const HALO = 1000; // nm: 1/e^2 half-width of the drawn microscope brightness (display), inside the 2 µm region

export interface PwLayers { micro: number; pfm: number; atoms: number }
export function layers(L: number): PwLayers {
  const atoms = 1 - ramp(L, -0.2, 0.1);
  return { micro: ramp(L, 2.0, 2.8), pfm: ramp(L, 0.6, 1.2) * (1 - ramp(L, 2.6, 3.3)), atoms };
}

/** Zoom stage, Wp x Hp px: bracket band (sourced widths at the current scale), then the specimen region: microscope field
 *  (display), hatched strain region, PFM-like profile (display shape, sourced width), domains, tilted wall, atom strip, bound
 *  charge marks, scale bar. */
export function viewSVG(C: PwColumn, st: PwState, Wp: number, Hp: number): string {
  const s = 10 ** st.L, W = BARS * s, k = Wp / W;
  const cx = Wp / 2, y0 = BAND, cy = y0 + (Hp - y0) / 2;
  const hh = (Hp - y0) / 2 / k; // half height of the specimen region, nm
  const tan = Math.tan(st.th * DEG);
  const Ly = layers(st.L);
  const o: string[] = [];
  o.push(`<defs><clipPath id="pw-clip"><rect x="0" y="${y0}" width="${Wp}" height="${f1(Hp - y0)}"/></clipPath>`);
  o.push(`<pattern id="pw-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" class="pw-hl"/></pattern>`);
  const stops: string[] = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, x = (u - 0.5) * 4 * HALO; stops.push(`<stop offset="${u.toFixed(3)}" class="pw-halo" stop-opacity="${Math.exp((-2 * x * x) / (HALO * HALO)).toFixed(3)}"/>`); }
  o.push(`<linearGradient id="pw-g" gradientUnits="userSpaceOnUse" x1="${f1(-2 * HALO * k)}" y1="0" x2="${f1(2 * HALO * k)}" y2="0">${stops.join("")}</linearGradient></defs>`);
  o.push(`<rect class="pw-bg" x="0" y="0" width="${Wp}" height="${Hp}"/>`);
  o.push(`<g clip-path="url(#pw-clip)">`);
  const big = 3 * (Hp + Wp);
  // skewed group: everything that lies along the wall
  o.push(`<g transform="translate(${f1(cx)} ${f1(cy)}) skewX(${(st.th).toFixed(3)})">`);
  if (Ly.micro > 0.002) {
    o.push(`<g opacity="${Ly.micro.toFixed(3)}"><rect class="pw-fld" x="${-big}" y="${-big}" width="${2 * big}" height="${2 * big}"/>`);
    const hb = Math.min(2 * HALO * k, big);
    o.push(`<rect fill="url(#pw-g)" x="${f1(-hb)}" y="${-big}" width="${f1(2 * hb)}" height="${2 * big}"/></g>`);
  }
  const bOp = (f: PwFeature): number => { const px = f.hi * k; return ramp(px, 6, 14) * (1 - ramp(px, 1.4 * Wp, 2.4 * Wp)); };
  const band = (f: PwFeature, cls: string, extra = 1): void => {
    const op = bOp(f) * extra;
    if (op < 0.01) return;
    const hw = Math.min((f.hi / 2) * k, big);
    o.push(`<rect class="${cls}" opacity="${op.toFixed(3)}" x="${f1(-hw)}" y="${-big}" width="${f1(2 * hw)}" height="${2 * big}"/>`);
  };
  band(FEATURES[0], "pw-strain", 1 - 0.6 * Ly.micro);
  band(FEATURES[3], "pw-assum", 1 - Ly.atoms);
  const wallCls = Ly.atoms > 0.5 ? "pw-wall at" : "pw-wall";
  o.push(`<line class="${wallCls}" x1="0" y1="${-big}" x2="0" y2="${big}" opacity="${(1 - 0.6 * Ly.micro).toFixed(3)}"/>`);
  o.push(`</g>`);
  // PFM-like amplitude profile (display shape |tanh(x / x0)|, dip FWHM 65 and 150 nm)
  if (Ly.pfm > 0.002) {
    const base = Hp - 40, amp = (Hp - y0) * 0.46;
    const prof = (w: number): [number, number][] => { const x0 = w / (2 * Math.atanh(0.5)); const pts: [number, number][] = []; for (let i = 0; i <= 160; i++) { const xp = (i / 160) * Wp; pts.push([xp, base - amp * Math.abs(Math.tanh((xp - cx) / k / x0))]); } return pts; };
    const a = prof(65), b = prof(150);
    const d = (P: [number, number][]): string => P.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("");
    o.push(`<g opacity="${Ly.pfm.toFixed(3)}"><path class="pw-pfmf" d="${d(a)}${d([...b].reverse()).replace(/^M/, "L")}Z"/><path class="pw-pfm" d="${d(a)}"/><path class="pw-pfm" d="${d(b)}"/>`);
    o.push(`<line class="pw-pfm0" x1="0" y1="${f1(base)}" x2="${Wp}" y2="${f1(base)}"/><text class="pw-t3" x="${Wp - 14}" y="${f1(base - amp - 8)}" text-anchor="end">PFM amplitude</text></g>`);
  }
  // domain arrows
  const arOp = (1 - Ly.atoms) * (1 - 0.85 * Ly.micro) * (1 - 0.55 * Ly.pfm);
  if (arOp > 0.01) {
    const ar: string[] = [];
    const sp = 74;
    for (let yy = y0 + 40; yy < Hp - 20; yy += sp)
      for (let xx = cx % sp + sp / 2 - sp; xx < Wp; xx += sp) {
        const wx = cx + (yy - cy) * tan;
        if (Math.abs(xx - wx) < 26 || xx < 10 || xx > Wp - 10) continue;
        const up = xx < wx;
        ar.push(up ? `M${f1(xx)} ${f1(yy + 13)}V${f1(yy - 9)}M${f1(xx - 5)} ${f1(yy - 3)}L${f1(xx)} ${f1(yy - 10)}L${f1(xx + 5)} ${f1(yy - 3)}` : `M${f1(xx)} ${f1(yy - 13)}V${f1(yy + 9)}M${f1(xx - 5)} ${f1(yy + 3)}L${f1(xx)} ${f1(yy + 10)}L${f1(xx + 5)} ${f1(yy + 3)}`);
      }
    o.push(`<path class="pw-arr" opacity="${arOp.toFixed(3)}" d="${ar.join("")}"/>`);
  }
  // atom strip
  if (Ly.atoms > 0.002) {
    const P = placeAtoms(C, st.th, W / 2 + 0.2, hh + 0.2);
    const sx = (x: number): number => cx + x * k, sy = (z: number): number => cy - z * k;
    const gl: string[] = [], g0: string[] = [];
    const planes = [...new Set(C.up.filter((p) => p.el === "O").map((p) => p.z))];
    const n0 = Math.floor(-W / 2 / C.a) - 2, n1 = Math.ceil(W / 2 / C.a) + 1;
    for (let n = n0; n <= n1; n++) {
      const X = (n + 0.5) * C.a;
      for (const z of planes) if (Math.abs(z) <= hh + 0.1) (Math.abs(z) < 1e-4 ? g0 : gl).push(`M${f1(sx(X - 0.21))} ${f1(sy(z))}H${f1(sx(X + 0.21))}`);
    }
    o.push(`<g opacity="${Ly.atoms.toFixed(3)}"><path class="pw-opl" d="${gl.join("")}"/><path class="pw-opl0" d="${g0.join("")}"/>`);
    for (const el of ["O", "Nb", "Li"] as PwEl[]) {
      const r = Math.max(1.2, RAD[el] * k);
      o.push(`<g class="pw-at ${el}">${P.filter((p) => p.el === el).map((p) => `<circle cx="${f1(sx(p.x))}" cy="${f1(sy(p.z))}" r="${f1(r)}"/>`).join("")}</g>`);
    }
    o.push(`</g>`);
  }
  // bound charge marks along the wall
  const q = charge(st.ps, st.th);
  if (q.sig > 0) {
    const step = Math.max(q.spacing * k, 12 * dotScale(st.ps, st.th));
    const mk: string[] = [];
    for (let j = 0; j < 400; j++) {
      const kk = j % 2 ? (j + 1) / 2 : -j / 2;
      const yy = cy - kk * step;
      if (yy < y0 + 8 || yy > Hp - 6) { if (Math.abs(kk * step) > Hp) break; continue; }
      const xx = cx + (yy - cy) * tan;
      mk.push(`<circle cx="${f1(xx)}" cy="${f1(yy)}" r="6.5"/><path d="M${f1(xx - 3.6)} ${f1(yy)}H${f1(xx + 3.6)}M${f1(xx)} ${f1(yy - 3.6)}V${f1(yy + 3.6)}"/>`);
    }
    o.push(`<g class="pw-q">${mk.join("")}</g>`);
  }
  // side labels and scale bar
  o.push(`<text class="pw-t2" x="14" y="${y0 + 22}">P ↑  s = +1</text><text class="pw-t2" x="${Wp - 14}" y="${y0 + 22}" text-anchor="end">s = ${MINUS}1  P ↓</text>`);
  const bl = Wp / BARS, by = Hp - 14;
  o.push(`<path class="pw-sb" d="M14 ${by}H${f1(14 + bl)}M14 ${by - 5}V${by + 5}M${f1(14 + bl)} ${by - 5}V${by + 5}"/><text class="pw-t2" x="${f1(14 + bl + 8)}" y="${by + 5}">${fmtLen(s)}</text>`);
  o.push(`</g>`);
  // bracket band
  o.push(`<line class="pw-bsep" x1="0" y1="${y0}" x2="${Wp}" y2="${y0}"/>`);
  const vis = FEATURES.filter((f) => bOp(f) > 0.02);
  const act = featureAt(st.L);
  vis.slice(0, 4).forEach((f, i) => {
    const op = bOp(f), y = 12 + BROW * (i + 1) - 4;
    const hw = (f.hi / 2) * k, lo = (f.lo / 2) * k;
    const xl = cx - hw, xr = cx + hw, cl = Math.max(xl, 8), cr = Math.min(xr, Wp - 8);
    const cls = `pw-br${f === act ? " on" : ""}${f.kind === "assumed" ? " as" : ""}`;
    let d = `M${f1(cl)} ${y}H${f1(cr)}`;
    d += xl >= 8 ? `M${f1(xl)} ${y - 5}V${y + 5}` : `M${f1(cl + 7)} ${y - 4}L${f1(cl)} ${y}L${f1(cl + 7)} ${y + 4}`;
    d += xr <= Wp - 8 ? `M${f1(xr)} ${y - 5}V${y + 5}` : `M${f1(cr - 7)} ${y - 4}L${f1(cr)} ${y}L${f1(cr - 7)} ${y + 4}`;
    if (f.kind === "range" && lo * 2 >= 3 && cx - lo > 8) d += `M${f1(cx - lo)} ${y - 3}V${y + 3}M${f1(cx + lo)} ${y - 3}V${y + 3}`;
    const lab = `${f.letter}  ${f.label}`, tw = lab.length * 6.9;
    let tx = cx, anchor = "middle";
    if (cr - cl < tw + 20) { if (cr + 8 + tw < Wp - 6) { tx = cr + 8; anchor = "start"; } else { tx = cl - 8; anchor = "end"; } }
    const ty = anchor === "middle" ? y - 5 : y + 4;
    o.push(`<g class="${cls}" opacity="${op.toFixed(3)}"><path d="${d}"/><text x="${f1(tx)}" y="${ty}" text-anchor="${anchor}">${escT(lab)}</text></g>`);
  });
  return o.join("");
}

/** Log ruler for the VISUAL zoom slider, aligned with the native range track (thumb half-width m px at each end). */
export function rulerSVG(st: PwState, Wp: number, Hp = 70, m = 13): string {
  const x = (L: number): number => m + ((L_MAX - L) / (L_MAX - L_MIN)) * (Wp - 2 * m);
  const o: string[] = [];
  o.push(`<line class="pw-rb" x1="${f1(x(L_MAX))}" y1="22" x2="${f1(x(L_MIN))}" y2="22"/>`);
  let t = "";
  for (let d = 0; d <= 5; d++) {
    const L = L_MAX - d;
    t += `M${f1(x(L))} 14V30`;
    if (d < 5) for (let mm = 2; mm <= 9; mm++) t += `M${f1(x(L - 1 + Math.log10(mm)))} 18V26`;
    const anc = d === 0 ? "start" : d === 5 ? "end" : "middle";
    o.push(`<text class="pw-rl" x="${f1(x(L))}" y="10" text-anchor="${anc}">${DECADES[d]}</text>`);
  }
  o.push(`<path class="pw-rt" d="${t}"/>`);
  const act = featureAt(st.L);
  for (const f of FEATURES) {
    const xx = x(Math.log10(f.char));
    o.push(`<g class="pw-rf${f === act ? " on" : ""}"><path d="M${f1(xx)} 36L${f1(xx + 6)} 42L${f1(xx)} 48L${f1(xx - 6)} 42Z"/><text x="${f1(xx)}" y="64" text-anchor="middle">${f.letter}</text></g>`);
  }
  o.push(`<line class="pw-rc" x1="${f1(x(st.L))}" y1="12" x2="${f1(x(st.L))}" y2="${Hp}"/>`);
  return o.join("");
}

/** sigma_b(theta) for both Ps values (chosen solid, other dashed) with the current point, and below it the one sourced
 *  conductivity point (werner2017) on a log axis with the bulk bound; no conductivity curve. */
export function chargeSVG(st: PwState, Wp: number, Hp = 300): string {
  const L = 62, R = Wp - 66, T = 18, B1 = 128, T2 = 170, B2 = Hp - 34;
  const xs = (th: number): number => L + (th / 5) * (R - L);
  const SMAX = 0.15, ys = (sg: number): number => B1 - (sg / SMAX) * (B1 - T);
  const KL0 = -16, KL1 = 0, yk = (lg: number): number => B2 - ((lg - KL0) / (KL1 - KL0)) * (B2 - T2);
  const o: string[] = [];
  // grid and axes
  let gr = "";
  for (const v of [0.05, 0.1]) gr += `M${L} ${f1(ys(v))}H${R}`;
  for (const v of [-15, -10, -5]) gr += `M${L} ${f1(yk(v))}H${R}`;
  o.push(`<path class="pw-cg" d="${gr}"/>`);
  o.push(`<path class="pw-ca" d="M${L} ${T}V${B1}H${R}V${T}M${L} ${T2}V${B2}H${R}"/>`);
  let tk = "";
  for (let d = 0; d <= 5; d++) { tk += `M${f1(xs(d))} ${B2}V${B2 + 5}M${f1(xs(d))} ${B1}V${B1 + 4}`; o.push(`<text class="pw-cl" x="${f1(xs(d))}" y="${B2 + 19}" text-anchor="middle">${d}</text>`); }
  o.push(`<path class="pw-ca" d="${tk}"/>`);
  o.push(`<text class="pw-cl" x="${R}" y="${Hp - 2}" text-anchor="end">θ, deg</text>`);
  for (const v of [0, 0.05, 0.1]) o.push(`<text class="pw-cl" x="${L - 6}" y="${f1(ys(v) + 4)}" text-anchor="end">${v === 0 ? "0" : v.toFixed(2)}</text>`);
  o.push(`<text class="pw-cl" x="${L - 6}" y="${T - 6}" text-anchor="end">C/m²</text>`);
  for (const n of [2, 4, 6, 8]) { const sg = n * 1e13 * 1e4 * QE; o.push(`<text class="pw-cl" x="${R + 6}" y="${f1(ys(sg) + 4)}">${n}</text>`); }
  o.push(`<text class="pw-cl" x="${Wp - 2}" y="${T - 6}" text-anchor="end">10¹³ e/cm²</text>`);
  for (const v of [-15, -10, -5, 0]) o.push(`<text class="pw-cl" x="${L - 6}" y="${f1(yk(v) + 4)}" text-anchor="end">${v === 0 ? "1" : `10${sup(String(v))}`}</text>`);
  o.push(`<text class="pw-cl" x="${L - 6}" y="${T2 - 8}" text-anchor="end">(Ω cm)⁻¹</text>`);
  // werner2017 inclination guide
  o.push(`<line class="pw-cw" x1="${f1(xs(1))}" y1="${T}" x2="${f1(xs(1))}" y2="${B2}"/>`);
  // sigma_b curves
  for (const ps of [0.71, 0.8]) {
    const d: string[] = [];
    for (let i = 0; i <= 60; i++) { const th = (i / 60) * 5; d.push(`${i ? "L" : "M"}${f1(xs(th))} ${f1(ys(boundCharge(ps, th * DEG)))}`); }
    const on = Math.abs(ps - st.ps) < 1e-6;
    o.push(`<path class="pw-cs${on ? " on" : ""}" d="${d.join("")}"/>`);
    o.push(`<text class="pw-cl${on ? " on" : ""}" x="${f1(xs(3.4))}" y="${f1(ys(boundCharge(ps, 3.4 * DEG)) + (ps > 0.75 ? -9 : 18))}" text-anchor="middle">P<tspan baseline-shift="sub" font-size="9">s</tspan> ${ps.toFixed(2)}</text>`);
  }
  const sg = boundCharge(st.ps, st.th * DEG);
  o.push(`<path class="pw-cx" d="M${f1(xs(st.th))} ${B1}V${f1(ys(sg))}H${L}"/><circle class="pw-cp" cx="${f1(xs(st.th))}" cy="${f1(ys(sg))}" r="5.5"/>`);
  // the one sourced conductivity point, and the bulk bound
  const xw = xs(1), yw = yk(Math.log10(0.02)), yw1 = yk(Math.log10(0.2)), yb = yk(-15);
  o.push(`<path class="pw-ck" d="M${f1(xw)} ${f1(yw)}V${f1(yw1)}"/><circle class="pw-ch" cx="${f1(xw)}" cy="${f1(yw1)}" r="4"/>`);
  o.push(`<path class="pw-cd" d="M${f1(xw)} ${f1(yw - 7)}L${f1(xw + 7)} ${f1(yw)}L${f1(xw)} ${f1(yw + 7)}L${f1(xw - 7)} ${f1(yw)}Z"/>`);
  o.push(`<path class="pw-ck" d="M${f1(xw)} ${f1(yb - 6)}V${f1(yb + 12)}M${f1(xw - 4)} ${f1(yb + 7)}L${f1(xw)} ${f1(yb + 13)}L${f1(xw + 4)} ${f1(yb + 7)}"/><path class="pw-ck" d="M${f1(xw - 6)} ${f1(yb - 6)}H${f1(xw + 6)}"/>`);
  o.push(`<text class="pw-cl on" x="${f1(xw + 12)}" y="${f1(yw + 5)}">Werner et al. 2017, 0.02 (Ω cm)⁻¹</text>`);
  o.push(`<text class="pw-cl" x="${f1(xw + 12)}" y="${f1(yw + 21)}">10 nm assumed; 1 nm: about 10&times;</text>`);
  o.push(`<text class="pw-cl" x="${f1(xw + 12)}" y="${f1(yb + 4)}">bulk, well below 10⁻¹⁵</text>`);
  return o.join("");
}

/** Plain-text values for screen readers and tests. */
export const ariaView = (st: PwState): string => `View ${fmtLen(BARS * 10 ** st.L)} wide across a 180 degree wall; feature at this scale: ${featureAt(st.L).label}; tilt ${st.th.toFixed(2)} deg`;
