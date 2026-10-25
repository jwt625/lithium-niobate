// FIG-01-08 Hysteresis comparator: pure renderers shared by the server load (prerendered default state) and the client
// module (hy.ts). Sourced inputs per crystal (hy-data.ts): forward coercive field Ec and internal field Eint as ranges;
// Ps band 0.71-0.80 C/m^2. Switching fields from ferro.ts loopFields (virgin Ps along +z): E_down = -Ec, E_up = Ec - 2 Eint,
// centre -Eint; every range is carried by interval arithmetic over the corners. Loop shape: ferro.ts loopBranch (tanh,
// template) with steepness w = 0.05 Ec (template). A drawn band = pointwise min..max over the corners (switching field
// interval x Ps band): loopBranch is monotonic in E, Ps and the switching field, so the extremes lie on the corners.
import { loopFields, loopBranch, coerciveVoltage } from "$lib/physics/ferro.ts";
import { fix, pad, FS, MINUS } from "../fmt.ts";
import { HY, PS, E_MAX, P_MAX, hyById, type HyCrystal, type HyId, type Rng } from "./hy-data";

export interface Shape { ec: Rng; eint: Rng }
export interface Sw { edown: Rng; eup: Rng; ctr: Rng; width: Rng }
export interface HyState { sel: HyId; show: Record<HyId, boolean>; t: number }

export const shapeOf = (c: HyCrystal): Shape => ({ ec: { ...c.ec }, eint: { ...c.eint } });
const lr = (a: Rng, b: Rng, u: number): Rng => ({ lo: a.lo + (b.lo - a.lo) * u, hi: a.hi + (b.hi - a.hi) * u });
export const lerpShape = (a: Shape, b: Shape, u: number): Shape => ({ ec: lr(a.ec, b.ec, u), eint: lr(a.eint, b.eint, u) });
/** template steepness of the tanh branches (kV/mm) */
export const widthT = (s: Shape): number => 0.05 * s.ec.hi;

export function switching(s: Shape): Sw {
  const cs = [s.ec.lo, s.ec.hi].flatMap((ec) => [s.eint.lo, s.eint.hi].map((ei) => loopFields(ec, ei)));
  const r = (f: (x: ReturnType<typeof loopFields>) => number): Rng => ({ lo: Math.min(...cs.map(f)), hi: Math.max(...cs.map(f)) });
  const hw = r((x) => x.halfWidth);
  return { edown: r((x) => x.Edown), eup: r((x) => x.Eup), ctr: r((x) => x.center), width: { lo: 2 * hw.lo, hi: 2 * hw.hi } };
}

/** min..max of one branch at field E over the corners (switching-field interval x Ps band). */
function env(E: number, sw: Sw, w: number, br: "up" | "down"): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const ps of [PS.lo, PS.hi]) for (const k of [0, 1]) {
    const p = loopBranch(E, ps, k ? sw.eup.hi : sw.eup.lo, k ? sw.edown.hi : sw.edown.lo, w, br);
    if (p < lo) lo = p;
    if (p > hi) hi = p;
  }
  return [lo, hi];
}

// ---------- number formats (fixed width) ----------
const f1 = (v: number): string => fix(v, 1);
/** range text: one value, "a–b" for non-negative ranges, "a to b" when negatives are involved */
export const rngTxt = (r: Rng, d = 1): string =>
  Math.abs(r.hi - r.lo) < 1e-9 ? fix(r.lo, d) : r.lo >= 0 ? `${fix(r.lo, d)}–${fix(r.hi, d)}` : `${fix(r.lo, d)} to ${fix(r.hi, d)}`;
const kv = (v: number): number => coerciveVoltage(v * 1e6, 1e-3) / 1e3; // kV per mm of thickness for Ec in kV/mm
/** wafer voltage V = Ec t (kV) as text, t in mm */
export function vTxt(c: HyCrystal, t: number): string {
  if (c.pm) return `${(kv(c.pm.c) * t).toFixed(2)} ± ${(kv(c.pm.u) * t).toFixed(2)}`;
  const lo = kv(c.ec.lo) * t, hi = kv(c.ec.hi) * t, d = hi >= 10 ? 1 : 2;
  return Math.abs(hi - lo) < 1e-9 ? lo.toFixed(d) : `${lo.toFixed(d)}–${hi.toFixed(d)}`;
}
const eintShort = (c: HyCrystal): string => (c.eintState === "nr" ? "not rep." : c.eintTxt);

export function readouts(st: HyState): Record<string, string> {
  const c = hyById(st.sel), sw = switching(shapeOf(c));
  const zero = c.eintState !== "value";
  const altV = c.alt ? `p. 118: ${(kv(c.alt.lo) * st.t).toFixed(2)}–${(kv(c.alt.hi) * st.t).toFixed(2)} kV` : "";
  const R: Record<string, string> = {
    name: c.name,
    line: `Ec ${pad(c.ecTxt, 9)} kV/mm  Eint ${pad(eintShort(c), 8)} kV/mm`,
    ec: `${c.ecTxt} kV/mm`,
    eint: c.eintState === "nr" ? "not reported" : `${c.eintTxt} kV/mm`,
    edown: `${pad(rngTxt(sw.edown), 12)} kV/mm`,
    eup: `${pad(rngTxt(sw.eup), 12)} kV/mm`,
    ctr: `${pad(zero ? "0" : rngTxt(sw.ctr), 12)} kV/mm`,
    width: `${pad(rngTxt(sw.width), 12)} kV/mm`,
    t: `${st.t.toFixed(2)} mm`,
    v: pad(vTxt(c, st.t), 11),
    vk: `${vTxt(c, st.t)} kV`,
    vline: `V ${pad(vTxt(c, st.t), 11)} kV @ ${st.t.toFixed(2)} mm`,
    valt: altV.padEnd(22, FS),
    edownN: pad(rngTxt(sw.edown), 12),
    eupN: pad(rngTxt(sw.eup), 12),
    ctrN: pad(zero ? "0" : rngTxt(sw.ctr), 12),
    widthN: pad(rngTxt(sw.width), 12),
    valtN: (c.alt ? `${(kv(c.alt.lo) * st.t).toFixed(2)}–${(kv(c.alt.hi) * st.t).toFixed(2)}` : "").padStart(11, FS),
    eintNote: c.eintState === "zero" ? "drawn 0: source gives “tends to 0”" : c.eintState === "nr" ? "drawn 0: not reported" : "",
  };
  for (const x of HY) R[`v-${x.id}`] = pad(vTxt(x, st.t), 11);
  return R;
}

// ---------- TECH: ASCII loop plot, 80 x 20 plot cells ----------
const AW = 80, AH = 20, LM = 6, EW = (2 * E_MAX) / AW;
const colOf = (E: number): number => Math.max(0, Math.min(AW - 1, Math.floor((E + E_MAX) / EW)));
/** symmetric rows: 0-9 hold P > 0 (0.1 C/m^2 each, row 9 ends at P = 0), 10-19 hold P < 0 */
const rowOf = (P: number): number => {
  const k = Math.max(0, Math.min(AH / 2 - 1, Math.floor((P_MAX - Math.abs(P)) / (2 * P_MAX / AH) + 1e-9)));
  return P >= 0 ? k : AH - 1 - k;
};
type Cell = { ch: string; k: string };
const esc = (ch: string): string => (ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch);
function serialize(g: Cell[][]): string {
  return g.map((row) => {
    let out = "", cur = "", buf = "";
    const flush = (): void => { if (buf) out += cur ? `<span class="${cur}">${buf}</span>` : buf; buf = ""; };
    for (const c of row) { if (c.k !== cur) { flush(); cur = c.k; } buf += esc(c.ch); }
    flush();
    return out;
  }).join("\n");
}

function asciiBand(g: Cell[][], s: Shape, glyph: string, k: string): void {
  const sw = switching(s), w = widthT(s);
  for (let c = 0; c < AW; c++) {
    const e0 = -E_MAX + c * EW, e1 = e0 + EW;
    for (const br of ["down", "up"] as const) {
      const a = env(e0, sw, w, br), b = env(e1, sw, w, br);
      const r0 = rowOf(Math.max(a[1], b[1])), r1 = rowOf(Math.min(a[0], b[0]));
      for (let r = r0; r <= r1; r++) g[r][LM + c] = { ch: glyph, k };
    }
  }
}

export function asciiPlot(st: HyState, shape?: Shape): string {
  const W = LM + AW, H = AH + 3;
  const g: Cell[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ ch: " ", k: "" })));
  const put = (r: number, c: number, s: string, k = ""): void => { [...s].forEach((ch, i) => { if (c + i >= 0 && c + i < W) g[r][c + i] = { ch, k }; }); };
  const sel = hyById(st.sel), s = shape ?? shapeOf(sel);
  // frame, zero lines (underscore sits on the cell's lower edge = P 0 between rows 9 and 10), margin labels
  for (let r = 0; r < AH; r++) put(r, LM - 1, "|", "dim");
  for (let c = 0; c < AW; c++) put(AH / 2 - 1, LM + c, "_", "dim");
  for (let r = 0; r < AH; r++) put(r, LM + colOf(0), ":", "dim");
  put(1, 0, "+0.8_", "dim"); put(AH / 2 - 1, 0, "   0_", "dim"); put(AH - 3, 0, `${MINUS}0.8_`, "dim");
  // other crystals first, the emphasized one last
  for (const c of HY) if (c.id !== st.sel && st.show[c.id]) asciiBand(g, shapeOf(c), c.glyph, "dim");
  asciiBand(g, s, sel.glyph, "hi");
  // E axis, ticks, labels
  put(AH, LM - 1, "+" + "-".repeat(AW), "dim");
  for (const E of [-20, -10, 0, 10, 20]) {
    const c = LM + colOf(E);
    put(AH, c, "+", "dim");
    const lab = E < 0 ? `${MINUS}${-E}` : `${E}`;
    put(AH + 1, c - Math.floor(lab.length / 2), lab, "dim");
  }
  put(AH + 1, LM + AW - 5, "kV/mm", "dim");
  if (sel.alt) for (const sgn of [-1, 1]) for (let E = sel.alt.lo; E <= sel.alt.hi + 1e-9; E += EW / 2) put(AH, LM + colOf(sgn * E), "!", "hi");
  // internal-field arrow: E = 0 to the loop centre (range)
  const sw = switching(s), z = LM + colOf(0), r = AH + 2;
  if (sw.ctr.lo < -0.05) {
    const a = LM + colOf(sw.ctr.lo), b = LM + colOf(sw.ctr.hi);
    for (let c = a; c < z; c++) put(r, c, c <= b ? "=" : "-", "hi");
    put(r, a, "<", "hi"); put(r, z, "|", "hi");
    put(r, z + 2, `Eint ${sel.eintState === "value" ? sel.eintTxt : "0"} kV/mm`, "hi");
  } else {
    put(r, z, "^", "hi");
    put(r, z + 2, sel.eintState === "nr" ? "Eint not reported, drawn 0" : "Eint → 0, loop centred", "hi");
  }
  return serialize(g);
}

// ---------- VISUAL: loop plot SVG ----------
const VW = 800, VH = 480, X0 = 64, X1 = 784, Y0 = 18, Y1 = 418;
const xE = (E: number): number => X0 + ((E + E_MAX) / (2 * E_MAX)) * (X1 - X0);
const yP = (P: number): number => Y0 + ((P_MAX - P) / (2 * P_MAX)) * (Y1 - Y0);
const n1 = (v: number): string => v.toFixed(1);

function bandPath(s: Shape): string {
  const sw = switching(s), w = widthT(s);
  const base = Array.from({ length: 241 }, (_, i) => -E_MAX + (i * 2 * E_MAX) / 240);
  let d = "";
  for (const br of ["down", "up"] as const) {
    const iv = br === "up" ? sw.eup : sw.edown;
    const dense = Array.from({ length: 61 }, (_, i) => iv.lo - 4 * w + (i * (iv.hi - iv.lo + 8 * w)) / 60);
    const Es = [...base, ...dense].filter((E) => E >= -E_MAX && E <= E_MAX).sort((a, b) => a - b);
    const up: string[] = [], dn: string[] = [];
    for (const E of Es) { const [lo, hi] = env(E, sw, w, br); up.push(`${n1(xE(E))} ${n1(yP(hi))}`); dn.push(`${n1(xE(E))} ${n1(yP(lo))}`); }
    d += `M${up.join("L")}L${dn.reverse().join("L")}Z`;
  }
  return d;
}
const arrowHead = (x: number, y: number, dir: 1 | -1, k: string, sz = 9): string => `<path class="${k}" d="M${n1(x)} ${n1(y)}l${-dir * sz} ${-sz * 0.6}v${sz * 1.2}z"/>`;

export function loopSVG(st: HyState, shape?: Shape): string {
  const sel = hyById(st.sel), s = shape ?? shapeOf(sel), sw = switching(s);
  let o = "";
  // grid and Ps band
  for (let E = -E_MAX; E <= E_MAX; E += 5) o += `<line class="${E === 0 ? "ax" : "gr"}" x1="${n1(xE(E))}" y1="${Y0}" x2="${n1(xE(E))}" y2="${Y1}"/>`;
  for (const P of [-0.8, -0.4, 0.4, 0.8]) o += `<line class="gr" x1="${X0}" y1="${n1(yP(P))}" x2="${X1}" y2="${n1(yP(P))}"/>`;
  o += `<line class="ax" x1="${X0}" y1="${n1(yP(0))}" x2="${X1}" y2="${n1(yP(0))}"/>`;
  for (const sg of [1, -1]) { const a = yP(sg * PS.hi), b = yP(sg * PS.lo); o += `<rect class="psb" x="${X0}" y="${n1(Math.min(a, b))}" width="${X1 - X0}" height="${n1(Math.abs(b - a))}"/>`; }
  o += `<rect class="fr" x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}"/>`;
  for (const E of [-20, -10, 0, 10, 20]) o += `<text class="tl" x="${n1(xE(E))}" y="${Y1 + 28}" text-anchor="middle">${E < 0 ? MINUS + -E : E}</text>`;
  o += `<text class="ul" x="${X1}" y="${Y1 + 54}" text-anchor="end">E, kV/mm</text>`;
  for (const P of [-0.8, -0.4, 0, 0.4, 0.8]) o += `<text class="tl" x="${X0 - 10}" y="${n1(yP(P) + 5)}" text-anchor="end">${P < 0 ? MINUS + (-P).toFixed(1) : P.toFixed(1)}</text>`;
  o += `<text class="ul" x="${X0 + 10}" y="${Y0 + 22}">P, C/m²</text>`;
  // other crystals, then the alternative near-SLN Ec (dashed), then the emphasized crystal
  o += `<g class="oth">`;
  for (const c of HY) if (c.id !== st.sel && st.show[c.id]) o += `<path class="hy-band o" d="${bandPath(shapeOf(c))}"/>`;
  o += `</g>`;
  if (sel.alt) o += `<path class="hy-band alt" d="${bandPath({ ec: sel.alt, eint: { lo: 0, hi: 0 } })}"/>`;
  // loop centre (range) and the internal-field arrow from E = 0
  const cl = xE(sw.ctr.lo), ch = xE(sw.ctr.hi), x0 = xE(0), y0 = yP(0);
  o += `<rect class="ctr" x="${n1(cl)}" y="${n1(yP(PS.hi))}" width="${n1(Math.max(1.5, ch - cl))}" height="${n1(yP(-PS.hi) - yP(PS.hi))}"/>`;
  o += `<path class="hy-band s" d="${bandPath(s)}"/>`;
  // traversal chevrons on the emphasized loop (display placement at the centre)
  const xm = (cl + ch) / 2, yt = yP((PS.lo + PS.hi) / 2), yb = yP(-(PS.lo + PS.hi) / 2);
  o += `<path class="chev" d="M${n1(xm + 6)} ${n1(yt - 7)}l-9 7l9 7"/><path class="chev" d="M${n1(xm - 6)} ${n1(yb - 7)}l9 7l-9 7"/>`;
  if (sw.ctr.lo < -0.05) {
    o += `<rect class="ein" x="${n1(cl)}" y="${n1(y0 - 10)}" width="${n1(Math.max(2, ch - cl))}" height="20"/>`;
    o += `<line class="eia" x1="${n1(x0)}" y1="${n1(y0)}" x2="${n1(cl + 8)}" y2="${n1(y0)}"/>` + arrowHead(cl, y0, -1, "eih");
    o += `<text class="eil" x="${n1(x0 + 12)}" y="${n1(y0 - 14)}">E<tspan class="sb" dy="5">int</tspan><tspan dy="-5"> ${sel.eintState === "value" ? `${sel.eintTxt} kV/mm` : sel.eintState === "zero" ? "→ 0" : "not reported"}</tspan></text>`;
  } else {
    o += `<circle class="eio" cx="${n1(x0)}" cy="${n1(y0)}" r="6"/>`;
    o += `<text class="eil" x="${n1(x0 + 12)}" y="${n1(y0 - 14)}">E<tspan class="sb" dy="5">int</tspan><tspan dy="-5"> ${sel.eintState === "nr" ? "not reported" : "→ 0"}</tspan></text>`;
  }
  if (sel.mark) { const xm2 = xE(-sel.mark); o += `<line class="mkl" x1="${n1(xm2)}" y1="${n1(y0 + 10)}" x2="${n1(xm2)}" y2="${n1(y0 + 22)}"/><path class="mk" d="M${n1(xm2)} ${n1(y0 + 22)}l5 6l-5 6l-5 -6z"/>`; }
  return o;
}
export const LOOP_VB = `0 0 ${VW} ${VH}`;

// ---------- VISUAL: wafer cross-section SVG ----------
const WW = 360, WH = 300, SX0 = 30, SX1 = 250, SY0 = 64, PXMM = 180;
export function waferSVG(st: HyState): string {
  const sel = hyById(st.sel), h = PXMM * st.t, SY1 = SY0 + h;
  let o = "";
  o += `<rect class="ln" x="${SX0}" y="${SY0}" width="${SX1 - SX0}" height="${n1(h)}"/>`;
  o += `<rect class="au" x="${SX0 + 14}" y="${SY0 - 7}" width="${SX1 - SX0 - 28}" height="7"/><rect class="au" x="${SX0 + 14}" y="${n1(SY1)}" width="${SX1 - SX0 - 28}" height="7"/>`;
  // Ps of the virgin crystal along +z (up); the applied field points down (forward switching)
  const L = Math.max(8, h - 16);
  for (let i = 0; i < 5; i++) {
    const x = SX0 + 40 + i * 35, yb = SY0 + h / 2 + L / 2, yt = SY0 + h / 2 - L / 2;
    o += `<line class="ps" x1="${x}" y1="${n1(yb)}" x2="${x}" y2="${n1(yt + 6)}"/><path class="psh" d="M${x} ${n1(yt)}l-5 ${n1(Math.min(8, L / 2))}h10z"/>`;
  }
  // wires to the source
  o += `<path class="wr" d="M${(SX0 + SX1) / 2} ${SY0 - 7}V30H${SX1 + 70}"/><path class="wr" d="M${(SX0 + SX1) / 2} ${n1(SY1 + 7)}V${n1(SY1 + 26)}H${SX1 + 70}"/>`;
  o += `<text class="pl" x="${SX1 + 70}" y="22" text-anchor="end">+${vTxt(sel, st.t)} kV</text><text class="pl" x="${SX1 + 74}" y="${n1(SY1 + 31)}">0 V</text>`;
  // thickness dimension
  o += `<line class="dm" x1="${SX1 + 22}" y1="${SY0}" x2="${SX1 + 22}" y2="${n1(SY1)}"/><line class="dm" x1="${SX1 + 16}" y1="${SY0}" x2="${SX1 + 28}" y2="${SY0}"/><line class="dm" x1="${SX1 + 16}" y1="${n1(SY1)}" x2="${SX1 + 28}" y2="${n1(SY1)}"/>`;
  o += `<text class="dl" x="${SX1 + 34}" y="${n1(SY0 + h / 2 + 6)}">${st.t.toFixed(2)} mm</text>`;
  o += `<text class="zl" x="${SX0 + 6}" y="${n1(SY0 - 14)}">+z</text>`;
  o += `<text class="ecl" x="${SX0}" y="22">E<tspan class="sb" dy="5">c</tspan><tspan dy="-5"> ${sel.ecTxt} kV/mm</tspan></text>`;
  return o;
}
export const WAFER_VB = `0 0 ${WW} ${WH}`;
