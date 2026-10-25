// Pure model and markup builders for 1.3 "Temperature axis" and 1.4 FIG-01-03 "Composition dial" (prefix cp). Server and
// browser. Physics from src/lib/physics/composition.ts only:
//   R1 = c/(100 - c), x = (1 - 2R2)/(5 - 4R2), defect fractions (volk2008 Eqs. (2.5)-(2.6)), Tc fits (Eqs. (6.2)-(6.3)),
//   UV edge (Eqs. (6.5)-(6.6), x = c - 48.38), composition from Tc (inverse of each fit), seededLattice.
// Display rules (FIG-01-03 spec): Ec and Eint only at the two anchors, never interpolated; UV formula greyed outside
// 48.0-50.0 mol%; lattice texture redrawn from the defect fractions with a fixed seed.
import { liNbRatio, defectFractions, tcIyi, tcBordui, tcBand, compositionFromTc, uvEdge, seededLattice, TC_BORDUI1992, type DefectModel, type DefectFractions } from "../../physics/composition.ts";
import { spectral } from "../spectral.ts";

export const C_MIN = 48.0, C_MAX = 50.0;
export const TC_MIN = 1120, TC_MAX = 1210;
const FS = " "; // figure space
const pad = (s: string, n: number): string => s.padStart(n, FS);

// ---------- anchors (manuscript Sec. 8 L2; volk2008 Table 7.1 p. 185) ----------
/** CLN anchor: active over the span of tabulated congruent compositions (48.38-48.6 mol%). Near-SLN anchor: active from
 *  49.8 mol%, the composition C = 0.498 of the near-stoichiometric crystal of gopalan1998 (volk2008 Table 7.1 states none). */
export const ANCHOR = {
  cln: { lo: 48.38, hi: 48.6, at: 48.45, ec: "21 kV/mm", eint: "2.2–3.4 kV/mm" },
  sln: { lo: 49.8, hi: 50.0, at: 49.8, ec: "6.0–6.5 / 2.1–2.5 kV/mm", eint: "→ 0" },
} as const;
export type AnchorId = "cln" | "sln" | null;
export const anchorAt = (c: number): AnchorId => (c >= ANCHOR.cln.lo - 1e-9 && c <= ANCHOR.cln.hi + 1e-9 ? "cln" : c >= ANCHOR.sln.lo - 1e-9 ? "sln" : null);

// ---------- 1.4 readouts ----------
export interface DialRo { [k: string]: string }
export function dialReadouts(c: number, model: DefectModel): DialRo {
  const f = defectFractions(c, model), { lo, hi } = tcBand(c), u20 = uvEdge(c, 20), u15 = uvEdge(c, 15), a = anchorAt(c);
  const p = (v: number): string => `${pad((v * 100).toFixed(2), 5)} %`;
  return {
    c: `${c.toFixed(2)} mol%`,
    cv: c.toFixed(2),
    r1: liNbRatio(c).toFixed(4),
    r2: (c / 100).toFixed(4),
    x: f.x.toFixed(4),
    nbli: p(f.NbLi),
    vli: p(f.VLi),
    vnb: p(f.VNb),
    tc: `${lo.toFixed(1)}–${hi.toFixed(1)} °C`,
    tci: `${tcIyi(c).toFixed(1)} °C`,
    tcb: `${tcBordui(c).toFixed(1)} °C`,
    u20: u20.valid ? `${u20.lambda_nm.toFixed(1)} nm` : "not applied",
    u15: u15.valid ? `${u15.lambda_nm.toFixed(1)} nm` : "not applied",
    ec: a ? ANCHOR[a].ec : "no data between anchors",
    eint: a ? ANCHOR[a].eint : "no data between anchors",
    anchor: a === "cln" ? "congruent" : a === "sln" ? "near-stoichiometric" : "between anchors",
    model: model === "Li-site" ? "Li-site vacancy" : "Nb-site vacancy",
  };
}

// ---------- 1.3 readouts ----------
export function axisReadouts(c: number, tcIn: number): DialRo {
  const { lo, hi } = tcBand(c), ci = compositionFromTc(tcIn), cb = compositionFromTc(tcIn, TC_BORDUI1992);
  const cc = (v: number): string => (v > 50 ? "> 50 (none)" : `${v.toFixed(2)} mol%`);
  return {
    c: `${c.toFixed(2)} mol%`,
    tci: `${tcIyi(c).toFixed(1)} °C`,
    tcb: `${tcBordui(c).toFixed(1)} °C`,
    tc: `${lo.toFixed(1)}–${hi.toFixed(1)} °C`,
    gap: `${(1255 - hi).toFixed(0)}–${(1255 - lo).toFixed(0)} °C`,
    tin: `${tcIn.toFixed(1)} °C`,
    ci: cc(ci),
    cb: cc(cb),
    dc: `${Math.abs(ci - cb).toFixed(2)} mol%`,
  };
}

// ---------- lattice texture ----------
/** Stable site order for a W x H field from seededLattice: the k-th entry is the site that seededLattice(n, k/N, 0, seed)
 *  adds to seededLattice(n, (k-1)/N, 0, seed). seededLattice's partial Fisher-Yates is prefix-stable in the defect count, so
 *  a growing defect count only adds sites: as c rises toward 50 mol% defects disappear in place, none jump. Sites with index
 *  >= W*H (n*n > W*H) are skipped. */
const orders = new Map<string, number[]>();
export function stableOrder(sites: number, count: number, seed: number): number[] {
  const key = `${sites}:${seed}`;
  const have = orders.get(key);
  if (have && have.length >= count) return have;
  const n = Math.ceil(Math.sqrt(sites)), N = n * n, out: number[] = [];
  let prev: Uint8Array = new Uint8Array(N);
  for (let k = 1; k <= N && out.length < count; k++) {
    const cur = seededLattice(n, k / N, 0, seed);
    for (let i = 0; i < N; i++) if (cur[i] && !prev[i]) { if (i < sites) out.push(i); break; }
    prev = cur;
  }
  orders.set(key, out);
  return out;
}
export const CODE = { Li: 0, VLi: 1, NbLi: 2, Nb: 0, VNb: 1 } as const;
/** Li-site field (codes 0 Li, 1 V_Li, 2 Nb_Li) and Nb-site field (0 Nb, 1 V_Nb). Li sites: the first round(5x N) sites of the
 *  stable order are defects in both models (5x per formula unit of Li sites either way); Li-site model: every fifth of them
 *  (rank 2, 7, 12, ...) is an antisite, the rest vacancies (1 : 4); Nb-site model: all are antisites, and round(4x N) Nb sites
 *  of a second order are vacant. Switching the model therefore turns the same Li-site holes into antisites. */
export function fields(sites: number, f: DefectFractions, seed = 1949): { li: Uint8Array; nb: Uint8Array; n: { VLi: number; NbLi: number; VNb: number } } {
  const xMax = defectFractions(C_MIN).x;
  const oLi = stableOrder(sites, Math.ceil(5 * xMax * sites) + 2, seed), oNb = stableOrder(sites, Math.ceil(4 * xMax * sites) + 2, seed + 7);
  const li = new Uint8Array(sites), nb = new Uint8Array(sites);
  const m = Math.round(5 * f.x * sites);
  for (let k = 0; k < m; k++) li[oLi[k]] = f.model === "Nb-site" || k % 5 === 2 ? CODE.NbLi : CODE.VLi;
  const mv = f.model === "Nb-site" ? Math.round(f.VNb * sites) : 0;
  for (let k = 0; k < mv; k++) nb[oNb[k]] = CODE.VNb;
  let VLi = 0, NbLi = 0;
  li.forEach((v) => { if (v === 1) VLi++; else if (v === 2) NbLi++; });
  return { li, nb, n: { VLi, NbLi, VNb: mv } };
}
export const TW = 32, TH = 12; // TECH field, characters
/** TECH 32 x 12 character fields: Li sites '.' Li, ' ' V_Li, '#' Nb_Li; Nb sites ':' Nb, ' ' V_Nb. */
export function asciiFields(c: number, model: DefectModel): { li: string; nb: string; count: string } {
  const F = fields(TW * TH, defectFractions(c, model));
  const rows = (a: Uint8Array, ch: string[]): string => {
    const L: string[] = [];
    for (let j = 0; j < TH; j++) {
      let s = "";
      for (let i = 0; i < TW; i++) { const v = a[j * TW + i]; s += v === 2 ? "<b>#</b>" : ch[v]; }
      L.push(s);
    }
    return L.join("\n");
  };
  return {
    li: rows(F.li, [".", " ", "#"]),
    nb: rows(F.nb, [":", " "]),
    count: `drawn of ${TW * TH}: V_Li ${pad(String(F.n.VLi), 2)}  Nb_Li ${pad(String(F.n.NbLi), 2)}  V_Nb ${pad(String(F.n.VNb), 2)}`,
  };
}
export const VW = 30, VH = 12; // VISUAL tiles, sites
/** VISUAL lattice tile (triangular lattice, site spacing 16 px) for the Li or Nb sublattice. */
export function svgTile(c: number, model: DefectModel, which: "li" | "nb"): string {
  const F = fields(VW * VH, defectFractions(c, model)), a = which === "li" ? F.li : F.nb, s = 16, h = s * 0.866;
  const W = (VW + 0.5) * s, H = VH * h + 4;
  let dots = "", holes = "", anti = "";
  for (let j = 0; j < VH; j++) for (let i = 0; i < VW; i++) {
    const v = a[j * VW + i], x = ((i + 0.5 + (j % 2) * 0.5) * s).toFixed(1), y = ((j + 0.5) * h + 2).toFixed(1);
    if (v === 0) dots += `<circle cx="${x}" cy="${y}" r="${which === "li" ? 3.2 : 3.6}"/>`;
    else if (v === 1) holes += `<circle cx="${x}" cy="${y}" r="4.6"/>`;
    else anti += `<circle cx="${x}" cy="${y}" r="5"/>`;
  }
  return `<svg class="cp-tile cp-tile-${which}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" aria-hidden="true"><g class="d">${dots}</g><g class="v">${holes}</g><g class="a">${anti}</g></svg>`;
}
export function tileCounts(c: number, model: DefectModel): string {
  const F = fields(VW * VH, defectFractions(c, model));
  return `drawn of ${VW * VH} each: ${pad(String(F.n.VLi), 2)} Li vacancies, ${pad(String(F.n.NbLi), 2)} antisites, ${pad(String(F.n.VNb), 2)} Nb vacancies`;
}

// ---------- UV edge ----------
export const UV = { a: 300, b: 325 } as const; // TECH axis, 0.625 nm per character, 41 columns
/** TECH ASCII UV bar: '#' where absorption exceeds the threshold (wavelengths below the edge), '.' above it. */
export function asciiUv(c: number): string {
  const n = 41, cx = (nm: number): number => Math.round(((nm - UV.a) / (UV.b - UV.a)) * (n - 1));
  const lab = (s: string): string => s.padEnd(10, " ");
  let ticks = "";
  for (let nm = UV.a; nm <= UV.b; nm += 5) ticks = ticks.padEnd(cx(nm), " ") + String(nm);
  let axis = "";
  for (let i = 0; i < n; i++) axis += i % 8 === 0 ? "|" : i % 4 === 0 ? "+" : "-";
  const L = [`<span class="dim">${lab("λ / nm")}</span>${ticks}`, `${lab("")}<span class="dim">${axis}</span>`];
  for (const al of [20, 15] as const) {
    const u = uvEdge(c, al), e = Math.max(-1, Math.min(n, cx(u.lambda_nm)));
    let row = "";
    for (let i = 0; i < n; i++) row += i < e ? "#" : i === e ? "|" : ".";
    L.push(lab(`α>${al}/cm`) + (u.valid ? row.replace(/(#+)/, "<b>$1</b>") : `<span class="dim">${"/".repeat(n)}</span>`));
  }
  return L.join("\n");
}
export const UVV = { a: 295, b: 455, vis: 400 } as const; // VISUAL spectrum bar, nm; UV = below 400 nm (ISO 21348)
export const uvHeight = 132;
/** VISUAL spectrum bar at width W px: visible part (>= 400 nm) in computed spectral colour, UV part hatched (invisible,
 *  declared); absorbing side of the edge (alpha above 20 cm^-1) darkened; lambda_20 solid, lambda_15 dashed. */
export function svgUv(W: number, c: number, uid: string): string {
  const H = uvHeight, pl = 18, pr = 18, x = (nm: number): number => pl + ((nm - UVV.a) / (UVV.b - UVV.a)) * (W - pl - pr);
  const f = (v: number): string => v.toFixed(1), y0 = 40, y1 = 86;
  const u20 = uvEdge(c, 20), u15 = uvEdge(c, 15), valid = u20.valid;
  let o = `<svg class="cp-uvsvg${valid ? "" : " cp-invalid"}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><defs>`;
  o += `<pattern id="${uid}-h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="cp-hatch"/></pattern>`;
  o += `<linearGradient id="${uid}-g" x1="${f(x(UVV.vis))}" x2="${f(x(UVV.b))}" y1="0" y2="0" gradientUnits="userSpaceOnUse">`;
  for (let nm = UVV.vis; nm <= UVV.b; nm += 5) o += `<stop offset="${((nm - UVV.vis) / (UVV.b - UVV.vis)).toFixed(3)}" stop-color="${spectral(nm)}"/>`;
  o += `</linearGradient></defs>`;
  o += `<rect class="cp-uvbg" x="${f(x(UVV.a))}" y="${y0}" width="${f(x(UVV.vis) - x(UVV.a))}" height="${y1 - y0}"/>`;
  o += `<rect x="${f(x(UVV.a))}" y="${y0}" width="${f(x(UVV.vis) - x(UVV.a))}" height="${y1 - y0}" fill="url(#${uid}-h)"/>`;
  o += `<rect class="cp-vis" x="${f(x(UVV.vis))}" y="${y0}" width="${f(x(UVV.b) - x(UVV.vis))}" height="${y1 - y0}" fill="url(#${uid}-g)"/>`;
  if (valid) o += `<rect class="cp-abs" x="${f(x(UVV.a))}" y="${y0}" width="${f(x(u20.lambda_nm) - x(UVV.a))}" height="${y1 - y0}"/>`;
  o += `<rect class="cp-frame" x="${f(x(UVV.a))}" y="${y0}" width="${f(x(UVV.b) - x(UVV.a))}" height="${y1 - y0}"/>`;
  for (let nm = 300; nm <= 450; nm += 10) {
    const lab = W < 520 ? nm % 40 === 300 % 40 : nm % 20 === 0;
    o += `<line class="cp-tk" x1="${f(x(nm))}" x2="${f(x(nm))}" y1="${y1}" y2="${y1 + (nm % 20 === 0 ? 8 : 4)}"/>`;
    if (lab) o += `<text class="cp-tl" x="${f(x(nm))}" y="${y1 + 22}" text-anchor="middle">${nm}</text>`;
  }
  o += `<text class="cp-tl" x="${f(W - pr)}" y="${y1 + 22}" text-anchor="end">nm</text>`;
  if (valid) {
    const e20 = x(u20.lambda_nm), e15 = x(u15.lambda_nm);
    o += `<line class="cp-e20" x1="${f(e20)}" x2="${f(e20)}" y1="${y0 - 14}" y2="${y1}"/><line class="cp-e15" x1="${f(e15)}" x2="${f(e15)}" y1="${y0 - 6}" y2="${y1}"/>`;
    const l20 = `λ<tspan class="cp-sub" dy="3">20</tspan><tspan dy="-3"> ${u20.lambda_nm.toFixed(1)} nm</tspan>`;
    const l15 = `λ<tspan class="cp-sub" dy="3">15</tspan><tspan dy="-3"> ${u15.lambda_nm.toFixed(1)}</tspan>`;
    if (e20 - 6 - 96 >= pl) { // lambda_20 left of its line, lambda_15 right of its line
      o += `<text class="cp-el" x="${f(e20 - 6)}" y="${y0 - 18}" text-anchor="end">${l20}</text>`;
      o += `<text class="cp-el cp-el15" x="${f(e15 + 6)}" y="${y0 - 18}" text-anchor="start">${l15}</text>`;
    } else { // near the left edge: both labels right of the lambda_15 line
      o += `<text class="cp-el" x="${f(e15 + 6)}" y="${y0 - 18}" text-anchor="start">${l20}</text>`;
      o += `<text class="cp-el cp-el15" x="${f(e15 + 110)}" y="${y0 - 18}" text-anchor="start">${l15}</text>`;
    }
  } else o += `<text class="cp-el" x="${f(W / 2)}" y="${y0 - 14}" text-anchor="middle">formula not applied outside 48.0–50.0 mol%</text>`;
  return o + "</svg>";
}

// ---------- composition ruler (VISUAL) ----------
export const fracC = (c: number): number => (c - C_MIN) / (C_MAX - C_MIN);
