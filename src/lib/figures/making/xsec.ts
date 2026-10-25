// Process viewer 2D cross-section: a pure function of (route, step, t, scale) -> display intervals per column, rendered
// as ASCII (TECH) or SVG paths (VISUAL, link-in cards). No DOM, no clock, no randomness except the seeded domain
// pattern of the boule-poling step (prng.ts). Dimensions come from process-flow.yaml through `Geom` (built on the
// server); dimensions the flow does not give are listed in GEOM_TEMPLATE and shown as template in the page.
// Illustrative z-map (frozen per step, R13): Si handle 4 rows, buried oxide 3 rows, donor bulk 8 rows, everything
// thinner than a few micrometres at 1 row = 0.15 um, so untouched bodies keep their height and thinned bodies shrink.
// True scale: one linear scale for the whole stack of the step.
import { createRng } from "../../physics/prng.ts";

export type Mat = "si" | "box" | "ln" | "lnr" | "imp" | "sio2" | "arc" | "res" | "resx" | "dlc" | "sin" | "au" | "redep" | "clad" | "melt" | "powder" | "cruc" | "rod" | "dom+" | "dom-" | "wire" | "elec";
export const CHAR: Record<Mat, string> = {
  si: "S", box: "o", ln: "L", lnr: "^", imp: "*", sio2: "o", arc: "a", res: "r", resx: ".", dlc: "d", sin: "n", au: "A", redep: "~", clad: "o",
  melt: "m", powder: ":", cruc: "U", rod: "|", "dom+": "+", "dom-": "-", wire: "=", elec: "#",
};
export const MAT_NAME: Record<Mat, string> = {
  si: "Si", box: "SiO2 (thermal)", ln: "LN", lnr: "LN, rough split face", imp: "He+ implant plane", sio2: "SiO2 (PECVD mask)", arc: "ARC", res: "resist", resx: "resist, exposed",
  dlc: "DLC", sin: "Si3N4", au: "Au", redep: "redeposited LN", clad: "SiO2 cladding", melt: "melt", powder: "powder charge", cruc: "crucible", rod: "seed rod", "dom+": "domain +Z", "dom-": "domain -Z", wire: "wire web", elec: "electrode",
};

/** Geometry inputs, um unless named. Built on the server from process-flow.yaml (see flow.ts geomFrom). */
export interface Geom {
  siRidge: number; siStrip: number; ox: number; donor: number; split: number; target: number;
  hmSio2: number; arc: number; resist: number; etchRidge: number; angleRidge: number;
  dlc: number; dlcUsed: number; etchStrip: number; angleStrip: number; baseStrip: number;
  clad: number; auRidge: number; tiStrip: number; auStrip: number; gapRidge: number;
  boule: { D_mm: number; L_mm: number };
}
/** Drawn dimensions without a source in the flow (template). */
export const GEOM_TEMPLATE = {
  cell: 12, // unit-cell width, um
  ridgeTop: 1.5, // ridge top width, um (luke2020 width not in the flow)
  maskFacet: 85, // mask facet angle, deg (kaufmann2023 HSQ value used as illustration)
  resistStrip: 0.4, // DUV resist on the DLC stack, um (not stated in li2023nc)
  sinTop: 0.06, // Si3N4 over DLC, um (wang2024nature LiTaO3 stack, analog)
  redep: 0.06, // redeposition film at the end of the etch, um
  maskErode: 0.3, // resist eroded during the ridge etch, um
  gapStrip: 5, // electrode gap of the strip route, um
};

export const ROWS = 24;
export const COLS = 48;
const FINE = 1 / 0.15; // rows per um in the illustrative fine region
const R_SI = 4, R_OX = 3, R_DONOR = 8, R_DONOR_ALONE = 10;
const MARKER = new Set<Mat>(["imp", "lnr", "arc", "sin", "redep"]);

export interface DIv { r0: number; r1: number; m: Mat }
export interface XS {
  kind: "stack" | "boule";
  cols: DIv[][]; // per column, display rows (0 = bottom)
  rows: number;
  /** crystal axes of the LN body on screen: up and right labels (x-cut film: X normal, Z lateral) */
  gizmo: { up: string; right: string } | null;
  /** true-scale bookkeeping: um per row and the thin layers below one row */
  umPerRow: number | null;
  stackUm: number;
  note: string;
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const smooth = (x: number): number => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const seg = (t: number, a: number, b: number): number => clamp01((t - a) / (b - a));

export type Route = "ridge_duv" | "strip_dlc";

/** Numeric state of the wafer stack at (route, step id, t), given the ordered step ids of the route. */
export interface Stack {
  si: number; ox: number; film: number; rough: number; implant: number;
  donor: "none" | "alone" | "pair" | "bonded";
  flip: number; lift: number; // flip 0..1 (squash through edge-on at 0.5), lift in rows
  hm: number; hmKind: "sio2" | "dlc" | null; sin: number; arc: number; res: number; resExposed: number; develop: number;
  maskEtch: number; etch: number; angle: number; topW: number; redep: number; strip: number; clad: number; au: number; ti: number; gap: number;
  maskErode: number;
}

export function stackAt(G: Geom, route: Route, order: readonly string[], id: string, t: number): Stack {
  const k = order.indexOf(id);
  const done = (sid: string): boolean => { const i = order.indexOf(sid); return i >= 0 && k > i; };
  const at = (sid: string): boolean => id === sid;
  const frac = (sid: string, a = 0, b = 1): number => (done(sid) ? 1 : at(sid) ? seg(t, a, b) : 0);
  const R = route === "ridge_duv";
  const s: Stack = {
    si: R ? G.siRidge : G.siStrip, ox: G.ox * frac("s07_handle"), film: 0, rough: 0, implant: frac("s08_implant"),
    donor: "none", flip: 0, lift: 0, hm: 0, hmKind: null, sin: 0, arc: 0, res: 0, resExposed: 0, develop: 0, maskEtch: 0,
    etch: 0, angle: R ? G.angleRidge : G.angleStrip, topW: 0, redep: 0, strip: 0, clad: 0, au: 0, ti: 0, gap: R ? G.gapRidge : GEOM_TEMPLATE.gapStrip, maskErode: 0,
  };
  const iBond = order.indexOf("s09_bond");
  if (k < iBond) s.donor = order.indexOf("s07_handle") <= k ? (k === order.indexOf("s07_handle") ? "none" : "alone") : "alone";
  if (at("s07_handle")) s.donor = "none";
  if (at("s09_bond")) { s.donor = "pair"; s.flip = smooth(t / 0.4); s.lift = 4 * (1 - smooth(seg(t, 0.4, 0.85))); }
  if (done("s09_bond")) s.donor = "bonded";
  const splitAt = 0.62;
  if (at("s10_split") && t >= splitAt) { s.lift = 4 * smooth(seg(t, splitAt, 1)); }
  if (done("s10_split")) s.donor = "none";
  if (done("s09_bond")) { s.film = G.split; s.rough = 1; }
  if (at("s11_cmp")) { s.film = G.split + (G.target - G.split) * t; s.rough = 1 - t; }
  if (done("s11_cmp")) { s.film = G.target; s.rough = 0; }
  // device: hard mask, resist, exposure, transfer, etch
  if (R) {
    s.topW = GEOM_TEMPLATE.ridgeTop;
    s.hm = G.hmSio2 * frac("s13r_hardmask"); s.hmKind = s.hm > 0 ? "sio2" : null;
    const c = frac("s14r_coat"); s.arc = G.arc * c; s.res = G.resist * c;
    s.resExposed = frac("s15r_expose", 0.15, 0.85);
    s.develop = frac("s16r_mask_transfer", 0, 0.3); s.maskEtch = frac("s16r_mask_transfer", 0.3, 0.95);
    s.etch = G.etchRidge * frac("s17r_ln_etch", 0.1, 0.9); s.redep = GEOM_TEMPLATE.redep * frac("s17r_ln_etch", 0.1, 0.9); s.maskErode = GEOM_TEMPLATE.maskErode * frac("s17r_ln_etch", 0.1, 0.9);
    const st = frac("s18r_strip", 0.1, 0.9); s.strip = st; if (st > 0) s.redep *= 1 - st;
    s.clad = G.clad * frac("s19r_clad", 0.1, 0.9);
    s.au = G.auRidge * frac("s20r_electrodes", 0.15, 0.85);
  } else {
    const hmf = frac("s13s_hardmask"); s.hm = G.dlc * hmf; s.sin = GEOM_TEMPLATE.sinTop * hmf; s.hmKind = s.hm > 0 ? "dlc" : null;
    s.res = at("s14s_expose") || done("s14s_expose") ? GEOM_TEMPLATE.resistStrip : 0;
    s.resExposed = frac("s14s_expose", 0.15, 0.85);
    s.develop = frac("s15s_mask_transfer", 0, 0.3); s.maskEtch = frac("s15s_mask_transfer", 0.3, 0.95);
    const e = frac("s16s_ln_etch", 0.1, 0.9);
    s.etch = G.etchStrip * e; s.redep = GEOM_TEMPLATE.redep * e; s.hm = G.dlc * hmf - G.dlcUsed * e;
    s.topW = G.baseStrip - (2 * G.etchStrip) / Math.tan((G.angleStrip * Math.PI) / 180);
    const cl = frac("s17s_clean", 0.05, 0.5), ash = frac("s17s_clean", 0.5, 0.95);
    if (cl > 0) s.redep *= 1 - cl;
    if (ash > 0) { s.hm *= 1 - ash; s.sin *= 1 - ash; s.strip = ash; }
    const el = frac("s18s_electrodes", 0.15, 0.85); s.ti = G.tiStrip * el; s.au = G.auStrip * el;
  }
  return s;
}

/** Interval stack of one column x (um from cell centre) in true um, plus the scale class of each interval. */
type Cls = "si" | "ox" | "fine" | "donor";
interface TIv { z0: number; z1: number; m: Mat; c: Cls }

function column(G: Geom, route: Route, s: Stack, x: number): { base: TIv[]; donor: TIv[] } {
  const R = route === "ridge_duv";
  const base: TIv[] = [];
  let z = 0;
  const push = (h: number, m: Mat, c: Cls): void => { if (h > 1e-9) { base.push({ z0: z, z1: z + h, m, c }); z += h; } };
  const donor: TIv[] = [];
  if (s.donor === "alone") {
    // donor wafer by itself (s05, s06, s08): bulk, then the top 0.68 um film part with the implant plane at its bottom
    let zz = 0;
    const d = (h: number, m: Mat, c: Cls): void => { base.push({ z0: zz, z1: zz + h, m, c }); zz += h; };
    d(G.donor - G.split, "ln", "donor");
    if (s.implant > 0) d(0.05, "imp", "fine"); else d(0.05, "ln", "fine");
    d(G.split - 0.05, "ln", "fine");
    return { base, donor };
  }
  push(s.si, "si", "si");
  push(s.ox, "box", "ox");
  if (s.donor === "pair" || s.donor === "bonded") {
    // donor in its own group (flipped: implanted face down); local z from the implanted face
    let zz = 0;
    const d = (h: number, m: Mat, c: Cls): void => { donor.push({ z0: zz, z1: zz + h, m, c }); zz += h; };
    d(G.split - 0.05, "ln", "fine");
    d(0.05, "imp", "fine");
    d(G.donor - G.split, "ln", "donor");
    return { base, donor };
  }
  if (s.film <= 0) return { base, donor };
  // LN film with etched profile: full thickness within topW/2, slope band, etched field beyond
  const ax = Math.abs(x);
  const run = s.etch / Math.tan((s.angle * Math.PI) / 180);
  let lnTop = s.film;
  if (s.etch > 0) {
    if (ax <= s.topW / 2) lnTop = s.film;
    else if (ax >= s.topW / 2 + run) lnTop = s.film - s.etch;
    else lnTop = s.film - ((ax - s.topW / 2) / run) * s.etch;
  }
  const roughTop = s.rough > 0 ? Math.min(0.06 * s.rough, lnTop) : 0;
  push(lnTop - roughTop, "ln", "fine");
  push(roughTop, "lnr", "fine");
  let surf = z;
  // redeposition on the sidewall and next to it
  if (s.redep > 0 && s.etch > 0 && ax > s.topW / 2 - 0.05 && ax < s.topW / 2 + run + 0.35) push(s.redep, "redep", "fine");
  // masks (pattern = ridge top width after develop; uniform before)
  const patterned = s.develop > 0 || s.etch > 0;
  const onLine = ax <= s.topW / 2 + (R ? 0 : 0);
  const facetRun = (h: number): number => h / Math.tan((GEOM_TEMPLATE.maskFacet * Math.PI) / 180);
  if (s.hmKind && s.hm > 1e-6 && s.strip < 1) {
    let h = s.hm * (1 - s.strip);
    if (patterned && !onLine) {
      // outside the line the mask is etched down during transfer (facet at the edge)
      const out = ax - s.topW / 2;
      const left = s.maskEtch >= 1 || s.etch > 0 ? 0 : h * (1 - s.maskEtch);
      h = out < facetRun(h) ? h - (out / facetRun(h)) * (h - left) : left;
      if (s.etch > 0) h = out < facetRun(s.hm) ? Math.max(0, s.hm * (1 - s.strip) * (1 - out / facetRun(s.hm))) : 0;
    }
    push(h, R ? "sio2" : "dlc", "fine");
    if (!R) push(s.sin * (patterned && !onLine ? 0 : 1) * (1 - s.strip), "sin", "fine");
  }
  if (s.arc > 0 && s.strip < 1 && (!patterned || onLine)) push(s.arc * (1 - s.strip), "arc", "fine");
  if (s.res > 0 && s.strip < 1) {
    const exposedHere = !onLine && s.resExposed > 0.5;
    const r = s.res - (onLine ? s.maskErode : 0);
    if (!patterned) push(r, exposedHere ? "resx" : "res", "fine");
    else if (onLine && (R || s.maskEtch < 1)) push(r * (1 - s.strip) * (R ? 1 : 1 - s.maskEtch), "res", "fine");
    else if (!onLine && s.develop < 1) push(r * (1 - s.develop), "resx", "fine");
  }
  surf = z;
  // cladding (conformal per column) and electrodes
  if (s.clad > 0) push(s.clad, "clad", "fine");
  const eHalf = s.gap / 2;
  if ((s.au > 0 || s.ti > 0) && ax >= eHalf) { push(s.ti, "au", "fine"); push(s.au, "au", "fine"); }
  void surf;
  return { base, donor };
}

/** Cross-section at (route, step, t). `order` = step ids of the route; `scale` illustrative or true. */
export function crossSection(G: Geom, route: Route, order: readonly string[], id: string, t: number, scale: "illustrative" | "true", cols = COLS): XS {
  if (["s01_charge", "s02_melt", "s03_pull", "s04_anneal_pole", "s05_orient_slice"].includes(id)) return boule(G, id, t, cols);
  const s = stackAt(G, route, order, id, t);
  const W = GEOM_TEMPLATE.cell;
  const xs = Array.from({ length: cols }, (_, i) => -W / 2 + ((i + 0.5) * W) / cols);
  const colsT = xs.map((x) => column(G, route, s, x));
  // frozen scale for the step: true stack height = max over the step (end state for growth, start for thinning)
  const all = colsT.flatMap((c) => [...c.base, ...c.donor]);
  const trueH = (iv: TIv[]): number => (iv.length ? iv[iv.length - 1].z1 : 0);
  let stackUm = Math.max(...colsT.map((c) => trueH(c.base) + trueH(c.donor)));
  const endS = stackAt(G, route, order, id, 1);
  const endCols = xs.map((x) => column(G, route, endS, x));
  stackUm = Math.max(stackUm, ...endCols.map((c) => trueH(c.base) + trueH(c.donor)));
  const kTrue = (ROWS - 1) / Math.max(stackUm, 1e-9);
  const rowsOf = (iv: TIv): number => {
    const h = iv.z1 - iv.z0;
    if (scale === "true") return h * kTrue;
    if (iv.c === "si") return R_SI;
    if (iv.c === "ox") return (R_OX * h) / G.ox;
    if (iv.c === "donor") return s.donor === "alone" ? R_DONOR_ALONE : R_DONOR;
    // marker layers thinner than one row (implant plane, rough split face, ARC, Si3N4, redeposition) drawn one row high
    if (MARKER.has(iv.m)) return Math.max(1, h * FINE);
    return h * FINE;
  };
  void all;
  const out: DIv[][] = colsT.map((c) => {
    const res: DIv[] = [];
    let r = 0;
    for (const iv of c.base) { const h = rowsOf(iv); res.push({ r0: r, r1: r + h, m: iv.m }); r += h; }
    if (c.donor.length) {
      // donor group: flip squashes through edge-on (|cos|), orientation reverses past half; lift in rows
      const parts = c.donor.map((iv) => rowsOf(iv));
      const H = parts.reduce((a, b) => a + b, 0);
      const sq = Math.max(0.08, Math.abs(Math.cos(Math.PI * s.flip)));
      const flipped = s.donor === "bonded" || s.flip >= 0.5;
      // at the split (bonded, lift > 0) the remainder lifts and the film part stays bonded
      const splitNow = s.lift > 0 && s.donor === "bonded";
      let acc = 0;
      c.donor.forEach((iv, i) => {
        const h = parts[i];
        // local position from the bottom of the group: flipped -> implanted face (index 0) at the bottom
        const y0 = flipped ? acc : H - acc - h;
        acc += h;
        if (s.donor === "pair") {
          const a = r + s.lift + (H * (1 - sq)) / 2 + y0 * sq;
          res.push({ r0: a, r1: a + h * sq, m: iv.m });
        } else {
          const a = r + y0 + (splitNow && iv.c === "donor" ? s.lift : 0);
          res.push({ r0: a, r1: a + h, m: splitNow && iv.m === "imp" ? "lnr" : iv.m });
        }
      });
    }
    return res;
  });
  const lnUp = s.donor === "alone" || (s.donor === "pair" && s.flip < 0.5) ? "+X" : "-X";
  const lnRight = lnUp === "+X" ? "+Z" : "-Z";
  const hasLn = out.some((c) => c.some((d) => d.m === "ln"));
  return { kind: "stack", cols: out, rows: ROWS, gizmo: hasLn ? { up: lnUp, right: lnRight } : null, umPerRow: scale === "true" ? 1 / kTrue : null, stackUm, note: "" };
}

/** Boule-scale steps (s01-s05): side profile of crucible, melt, crystal, to scale (153 mm x 110 mm body). */
function boule(G: Geom, id: string, t: number, cols: number): XS {
  const rows = ROWS;
  const out: DIv[][] = Array.from({ length: cols }, () => []);
  const W = 240; // mm across the drawing
  const mmPerRow = 240 / rows / 1.0; // square-ish cells drawn at 2:1 char aspect -> rows cover 10 mm
  const xAt = (i: number): number => -W / 2 + ((i + 0.5) * W) / cols;
  const R = G.boule.D_mm / 2;
  const crR = R * 1.5; // crucible radius: template (1.5x crystal radius)
  const crucTop = 6.5, meltTop = 5;
  const fill = (i: number, r0: number, r1: number, m: Mat): void => { if (r1 > r0) out[i].push({ r0, r1, m }); };
  const rng = createRng(7);
  const dom = Array.from({ length: cols * rows }, () => rng.next() < 0.5);
  for (let i = 0; i < cols; i++) {
    const x = xAt(i), ax = Math.abs(x);
    if (id === "s01_charge" || id === "s02_melt" || id === "s03_pull") {
      if (ax <= crR + 6 && ax > crR) fill(i, 0, crucTop, "cruc");
      if (ax <= crR) {
        fill(i, 0, 0.6, "cruc");
        if (id === "s01_charge") fill(i, 0.6, 0.6 + 3.4 * (0.4 + 0.6 * t), "powder");
        else if (id === "s02_melt") { const p = 0.6 + 3.4 * (1 - t * 0.35); const mm = 0.6 + (meltTop - 0.6) * t * 0.9; fill(i, 0.6, Math.min(p, Math.max(mm, 0.6)), "melt"); if (p > mm) fill(i, Math.max(mm, 0.6), p, "powder"); }
        else fill(i, 0.6, meltTop - 0.8 * t, "melt");
      }
      if (id === "s03_pull") {
        // crystal grows from the meniscus; body length L = v t at the 1.5 mm/h midpoint, scaled into the drawing
        const Lmm = G.boule.L_mm * t, shoulder = R; // 45 deg shoulder (template)
        const top = meltTop - 0.8 * t;
        const bottomRow = top + 0.2;
        const lenRows = Lmm / mmPerRow, shRows = shoulder / mmPerRow;
        const bodyTop = bottomRow + lenRows;
        if (ax <= R) fill(i, bottomRow, bodyTop, "ln");
        const shoulderH = Math.max(0, shRows * (1 - ax / R));
        if (ax <= R) fill(i, bodyTop, bodyTop + shoulderH, "ln");
        if (ax <= 4) fill(i, bodyTop + (ax <= R ? shRows : 0), rows, "rod");
      }
    } else if (id === "s04_anneal_pole") {
      const L = G.boule.L_mm / mmPerRow, y0 = 4;
      if (ax <= R) for (let r = 0; r < Math.ceil(L); r++) {
        const p = dom[i * rows + r] ? "dom+" : "dom-";
        const settled = t > 0.15 + 0.7 * ((r + 0.5) / L);
        fill(i, y0 + r, Math.min(y0 + r + 1, y0 + L), settled ? "dom+" : p);
      }
      if (ax <= R) { fill(i, y0 - 1, y0, "elec"); fill(i, y0 + L, y0 + L + 1, "elec"); }
    } else {
      // s05: boule on its side, sliced into x-cut wafers by the wire web
      const L = G.boule.L_mm, y0 = 4, hRows = G.boule.D_mm / mmPerRow;
      if (ax <= L / 2) for (let r = 0; r < Math.ceil(hRows); r++) {
        const zc = (r + 0.5) * mmPerRow;
        const inCircle = Math.abs(zc - R) <= R;
        if (!inCircle) continue;
        const wireRow = r % 2 === 1 && (r + 0.5) / hRows < t * 1.05;
        fill(i, y0 + r, y0 + r + 1, wireRow ? "wire" : "ln");
      }
    }
  }
  return { kind: "boule", cols: out, rows, gizmo: null, umPerRow: null, stackUm: 0, note: `1 row = ${mmPerRow.toFixed(0)} mm` };
}

/** ASCII raster (top row first). */
export function ascii(xs: XS): string[] {
  const lines: string[] = [];
  for (let r = xs.rows - 1; r >= 0; r--) {
    let line = "";
    for (const col of xs.cols) {
      const c = r + 0.5;
      let ch = " ";
      for (const d of col) if (c >= d.r0 && c < d.r1) ch = CHAR[d.m];
      line += ch;
    }
    lines.push(line);
  }
  return lines;
}

/** SVG paths per material (viewBox width = cols * cw, height = rows * rh). */
export function svgPaths(xs: XS, cw = 10, rh = 10): { m: Mat; d: string }[] {
  const by = new Map<Mat, string[]>();
  const H = xs.rows * rh;
  xs.cols.forEach((col, i) => {
    for (const d of col) {
      const y1 = H - Math.min(d.r1, xs.rows + 2) * rh, y0 = H - d.r0 * rh;
      if (y0 - y1 < 0.05) continue;
      const a = by.get(d.m) ?? [];
      a.push(`M${(i * cw).toFixed(1)} ${y1.toFixed(2)}h${cw}V${y0.toFixed(2)}h-${cw}Z`);
      by.set(d.m, a);
    }
  });
  return [...by.entries()].map(([m, a]) => ({ m, d: a.join("") }));
}

/** Materials present (legend). */
export const matsOf = (xs: XS): Mat[] => [...new Set(xs.cols.flat().map((d) => d.m))];
