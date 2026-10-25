// Atlas charts A1-A5, A7 (content/chapters/06-devices/chart-specs.md): point extraction (server, from the vendored rows)
// and SVG renderers (server default state and browser live state). Bounds are arrows, never points; fixed axes.
import { Plot, marker, arrow, esc, type Look } from "./svgplot.ts";
import { type Dev, type Pt, qual, qualVpil, hasTag, isMZM, isLNLT, platCls, shapeOf, PLATFORMS } from "./atlas.ts";
import { impliedOverlap, vpiLPushPullVcm } from "$lib/physics/devices.ts";
import { nCLN } from "../optics.ts";

const HOLLOW_TAGS = ["slow_light", "material_enhancement_claim", "hybrid_si_ln", "hybrid_sin_ln", "unetched_ln"];
const yr = (d: Dev): number => d.year ?? 0;

// ---------- extraction (server) ----------
export function ptsA1(devs: Dev[]): Pt[] {
  return devs.filter((d) => isMZM(d) && d.vpil_best != null && d.bw3db_ghz != null && (d.row_kind === "device" || d.row_kind === "design")).map((d) => ({
    id: d.device_id, pl: d.platform, x: d.bw3db_ghz as number, y: d.vpil_best as number, qx: qual(d, "bw3db_ghz"), qy: qualVpil(d), yr: yr(d),
    ...(d.telecom ? { tel: 1 as const } : {}), ...(d.vpi_convention === "mzm_push_pull" ? { pp: 1 as const } : {}), ...(d.row_kind === "design" ? { dz: 1 as const } : {}), conv: d.vpi_convention,
  }));
}
export function ptsA2(devs: Dev[]): Pt[] {
  return devs.filter((d) => isLNLT(d) && d.n_rf != null && d.ng_opt != null).map((d) => ({
    id: d.device_id, pl: d.platform, x: d.ng_opt as number, y: d.n_rf as number, qx: qual(d, "ng_opt"), qy: qual(d, "n_rf"), yr: yr(d), et: d.electrode_type ?? "", L: d.length_mm,
  }));
}
export function ptsA3(devs: Dev[]): Pt[] {
  return devs.filter((d) => d.platform === "TFLN" && d.row_kind === "device" && isMZM(d) && d.vpi_convention === "mzm_push_pull" && /^x/i.test(d.crystal_cut ?? "") && d.electrode_gap_um != null && d.wavelength_nm != null && d.vpil_best != null)
    .map((d) => ({ id: d.device_id, pl: d.platform, x: d.electrode_gap_um as number, y: d.vpil_best as number, yr: yr(d), g: d.electrode_gap_um, lam: d.wavelength_nm, ...(HOLLOW_TAGS.some((t) => hasTag(d, t)) ? { ho: 1 as const } : {}) }));
}
export function ptsA4(devs: Dev[]): Pt[] {
  return devs.filter((d) => d.row_kind === "device" && isMZM(d) && d.telecom && d.vpi_convention === "mzm_push_pull" && d.length_mm != null && d.vpi_dc_v != null).map((d) => ({
    id: d.device_id, pl: d.platform, x: d.length_mm as number, y: d.vpi_dc_v as number, qx: qual(d, "length_mm"), qy: qual(d, "vpi_dc_v"), yr: yr(d),
  }));
}
export function ptsA5(devs: Dev[]): Pt[] {
  return devs.filter((d) => isLNLT(d) && d.row_kind === "device" && d.vpi_convention === "mzm_push_pull" && d.wavelength_nm != null && d.vpil_best != null).map((d) => ({
    id: d.device_id, pl: d.platform, x: d.wavelength_nm as number, y: d.vpil_best as number, qy: qualVpil(d), yr: yr(d),
  }));
}
export function ptsA7(devs: Dev[]): Pt[] {
  return devs.filter((d) => isLNLT(d) && d.row_kind === "device" && (d.device_class === "ring" || d.device_class === "resonator") && d.q_loaded != null && d.bw3db_ghz != null).map((d) => ({
    id: d.device_id, pl: d.platform, x: d.q_loaded as number, y: d.bw3db_ghz as number, qx: qual(d, "q_loaded"), qy: qual(d, "bw3db_ghz"), yr: yr(d), ...(d.bw_method === "photon_lifetime_estimate" ? { ho: 1 as const } : {}),
  }));
}

// ---------- shared drawing ----------
const R = (look: Look): number => (look === "tech" ? 3.6 : 5.2);
const AL = (look: Look): number => (look === "tech" ? 12 : 16);
/** One mark: marker + bound arrows (gt/lt on either axis). */
function mark(p: Plot, d: Pt, look: Look, opt: { shape?: ReturnType<typeof shapeOf>; r?: number; cls?: string; hollow?: boolean } = {}): string {
  if (!p.inX(d.x) || !p.inY(d.y)) return "";
  const x = p.sx(d.x), y = p.sy(d.y), r = opt.r ?? R(look);
  const cls = `mk ${platCls(d.pl)}${opt.hollow || d.ho ? " ho" : ""}${opt.cls ? ` ${opt.cls}` : ""}`;
  let s = "";
  const al = AL(look);
  if (d.qx === "gt") s += arrow(x + r, y, 1, 0, al, `bd ${platCls(d.pl)}`);
  if (d.qx === "lt") s += arrow(x - r, y, -1, 0, al, `bd ${platCls(d.pl)}`);
  if (d.qy === "gt") s += arrow(x, y - r, 0, -1, al, `bd ${platCls(d.pl)}`);
  if (d.qy === "lt") s += arrow(x, y + r, 0, 1, al, `bd ${platCls(d.pl)}`);
  s += marker(opt.shape ?? shapeOf(d.pl), x, y, r, cls, `data-id="${esc(d.id)}" tabindex="0" aria-label="${esc(d.lb ?? d.id)}"`);
  return `<g class="pt${opt.cls ? ` ${opt.cls}` : ""}">${s}</g>`;
}
/** Draw marks with TFLN / TFLT on top. */
function marks(p: Plot, pts: Pt[], look: Look, f: (d: Pt) => Parameters<typeof mark>[3] | null): void {
  const fg = (d: Pt): number => (d.pl === "TFLN" ? 2 : d.pl === "TFLT" ? 1 : 0);
  const out: string[] = [];
  for (const d of [...pts].sort((a, b) => fg(a) - fg(b))) { const o = f(d); if (o) out.push(mark(p, d, look, o)); }
  p.add(out.join(""));
}

// ---------- A1 ----------
export interface A1State { [k: string]: number | string | boolean; year: number; bands: boolean; conv: boolean; design: boolean; pl_TFLN: boolean; pl_TFLT: boolean; pl_SiPh: boolean; pl_InP: boolean; pl_BTO: boolean; pl_Polymer: boolean; pl_AlGaAs: boolean; pl_Other: boolean }
export const A1_DEFAULT: A1State = { year: 2026, bands: false, conv: false, design: false, pl_TFLN: true, pl_TFLT: true, pl_SiPh: true, pl_InP: true, pl_BTO: true, pl_Polymer: true, pl_AlGaAs: true, pl_Other: true };
export const a1Visible = (s: A1State, d: Pt): boolean => (s[`pl_${d.pl}`] ?? s.pl_Other) !== false && (s.design || !d.dz) && (s.bands || !!d.tel) && (s.conv || !!d.pp);
export function chartA1(pts: Pt[], s: A1State, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 0.5, max: 400, log: true, label: "3 dB EO bandwidth (GHz)" }, y: { min: 0.01, max: 200, log: true, label: "V<tspan dy='3' font-size='0.8em'>π</tspan><tspan dy='-3'>L (V cm)</tspan>" } }).axes();
  marks(p, pts, look, (d) => {
    if (!a1Visible(s, d)) return null;
    const fut = d.yr > s.year;
    const fgnd = d.pl === "TFLN" || d.pl === "TFLT";
    return { shape: d.dz ? "cross" : undefined, hollow: !d.pp, cls: `${fut ? "fut" : ""}${fgnd ? "" : " bgp"}${d.dz ? " dz" : ""}`.trim() };
  });
  return p.svg(`dv-plot ${look}`, "V_pi L versus 3 dB bandwidth, eo-modulator-atlas");
}
export function a1Counts(pts: Pt[], s: A1State): Record<string, number> {
  const c: Record<string, number> = { all: 0 };
  for (const d of pts) if (a1Visible(s, d) && d.yr <= s.year) { c[d.pl] = (c[d.pl] ?? 0) + 1; c.all++; if (d.qx === "gt") c.gt = (c.gt ?? 0) + 1; }
  return c;
}

export function a1Outs(pts: Pt[], s: A1State): Record<string, string> {
  const c = a1Counts(pts, s);
  const o: Record<string, string> = { all: String(c.all ?? 0).padStart(3, " "), gt: String(c.gt ?? 0).padStart(3, " "), year: String(s.year) };
  for (const p of PLATFORMS) o[`n_${p}`] = String(c[p] ?? 0).padStart(3, " ");
  return o;
}

// ---------- A2 ----------
export const ET_SHAPE: Record<string, ReturnType<typeof shapeOf>> = { tw_gsg: "diamond", tw_cpw: "square", tw_gssg: "diamondo", cl_twe: "tri", slow_wave: "circle", lumped: "cross" };
export const lenR = (L: number | undefined, look: Look): number => (look === "tech" ? 2 : 3) + (look === "tech" ? 1.1 : 1.5) * Math.sqrt(Math.max(0.5, L ?? 1));
export function chartA2(pts: Pt[], sel: string, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 2, max: 4.2, label: "optical group index n<tspan dy='3' font-size='0.8em'>g</tspan>" }, y: { min: 2, max: 4.2, label: "RF index n<tspan dy='3' font-size='0.8em'>RF</tspan>" } }).axes();
  const band = [[2, 2.1], [4.1, 4.2], [4.2, 4.2], [4.2, 4.1], [2.1, 2], [2, 2]].map(([a, b]) => `${p.sx(Math.min(4.2, Math.max(2, a))).toFixed(1)},${p.sy(Math.min(4.2, Math.max(2, b))).toFixed(1)}`).join(" ");
  p.add(`<polygon class="band" points="${band}" clip-path="url(#CLIP)"/>`);
  p.line([[2, 2], [4.2, 4.2]], "ref");
  p.text(p.sx(3.65), p.sy(3.65) - 8, "n<tspan dy='3' font-size='0.8em'>RF</tspan><tspan dy='-3'> = n</tspan><tspan dy='3' font-size='0.8em'>g</tspan>", "an", "end");
  marks(p, pts, look, (d) => ({ shape: ET_SHAPE[d.et ?? ""] ?? "plus", r: lenR(d.L, look), cls: d.id === sel ? "sel" : "" }));
  return p.svg(`dv-plot ${look}`, "RF index versus optical group index");
}

// ---------- A3 ----------
export const R33: Record<string, number> = { turner: 30.8, kaminow: 28.8 };
export function gammaImplied(d: Pt, r33: number): number {
  return impliedOverlap({ lam_um: (d.lam as number) / 1000, gap_um: d.g as number, n: nCLN("e", (d.lam as number) / 1000), r_pm_per_V: r33, vpiL_Vcm: d.y });
}
export function chartA3(pts: Pt[], s: { gap: number; Gamma: number; lam: number; r33: string; logy: boolean }, w: number, h: number, look: Look): string {
  const r33 = R33[s.r33] ?? 30.8;
  const p = new Plot({ w, h, look, x: { min: 0, max: 15, label: "electrode gap g (µm)" }, y: s.logy ? { min: 0.1, max: 10, log: true, label: "implied overlap Γ" } : { min: 0, max: 7, label: "implied overlap Γ" } }).axes();
  p.hband(1, s.logy ? 10 : 7, "na");
  p.text(p.x1 - 6, p.sy(s.logy ? 7.2 : 6.5), "lateral-gap model not applicable (Γ &gt; 1)", "an na-t", "end");
  const lamNm = s.lam * 1000;
  marks(p, pts.map((d) => ({ ...d, x: d.g as number, y: gammaImplied(d, r33) })), look, (d) => {
    const near = Math.abs(Math.log((d.lam as number) / lamNm)) < 0.12;
    return { cls: near ? "near" : "far" };
  });
  const cx = p.sx(s.gap), cy = p.inY(s.Gamma) ? p.sy(s.Gamma) : null;
  p.add(`<line class="xh" x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${p.y1}" y2="${p.y0}"/>`);
  if (cy != null) p.add(`<line class="xh" x1="${p.x0}" x2="${p.x1}" y1="${cy.toFixed(1)}" y2="${cy.toFixed(1)}"/><circle class="xp" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${look === "tech" ? 4 : 6}"/>`);
  return p.svg(`dv-plot ${look}`, "Implied overlap versus electrode gap");
}

// ---------- A4 / A5 ----------
export function chartA4(pts: Pt[], w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, m: look === "tech" ? [10, 46, 34, 50] : [14, 62, 46, 62], x: { min: 0.01, max: 50, log: true, label: "electrode length (mm)" }, y: { min: 0.1, max: 30, log: true, label: "V<tspan dy='3' font-size='0.8em'>π</tspan><tspan dy='-3'> (V)</tspan>" } }).axes();
  for (const v of [0.1, 0.3, 1, 3, 10]) {
    p.line([[0.01, (v * 10) / 0.01], [50, (v * 10) / 50]], "iso");
    const yR = (v * 10) / 50;
    if (p.inY(yR)) p.text(p.x1 + 4, p.sy(yR) + 3.5, `${v} V cm`, "an iso-t");
    else { const xT = (v * 10) / 30; if (p.inX(xT)) p.text(p.sx(xT) + 3, p.y1 + 10, `${v}`, "an iso-t"); }
  }
  marks(p, pts, look, (d) => ({ cls: d.pl === "TFLN" || d.pl === "TFLT" ? "" : "bgp" }));
  return p.svg(`dv-plot ${look}`, "V_pi versus electrode length");
}
export const BANDS: [string, number, number][] = [["O", 1260, 1360], ["E", 1360, 1460], ["S", 1460, 1530], ["C", 1530, 1565], ["L", 1565, 1625]];
export function chartA5(pts: Pt[], s: { gap: number; Gamma: number }, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 300, max: 5000, log: true, label: "wavelength (nm)" }, y: { min: 0.03, max: 30, log: true, label: "V<tspan dy='3' font-size='0.8em'>π</tspan><tspan dy='-3'>L (V cm)</tspan>" } }).axes();
  for (const [n, a, b] of BANDS) {
    p.add(`<rect class="bnd" x="${p.sx(a).toFixed(1)}" y="${p.y1}" width="${(p.sx(b) - p.sx(a)).toFixed(1)}" height="${(p.y0 - p.y1).toFixed(1)}"/>`);
    p.text((p.sx(a) + p.sx(b)) / 2, p.y1 + (look === "tech" ? 10 : 13), n, "an bnd-t", "middle");
  }
  const curve: [number, number][] = [];
  for (let i = 0; i <= 120; i++) { const lam = 400 * (5000 / 400) ** (i / 120); curve.push([lam, vpiLPushPullVcm({ lam_um: lam / 1000, gap_um: s.gap, n: nCLN("e", lam / 1000), r_pm_per_V: 30.8, Gamma: s.Gamma })]); }
  p.line(curve, "model");
  marks(p, pts, look, () => ({}));
  return p.svg(`dv-plot ${look}`, "V_pi L versus wavelength, TFLN and TFLT");
}

// ---------- A7 ----------
export function chartA7(pts: Pt[], QL: number, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 1e3, max: 1e6, log: true, label: "loaded Q" }, y: { min: 1, max: 300, log: true, label: "3 dB EO bandwidth (GHz)" } }).axes();
  p.line([[1e3, 193414 / 1e3], [1e6, 193414 / 1e6]], "ref");
  const xl = 4.5e3;
  p.text(p.sx(xl) + 4, p.sy(193414 / xl) - 6, "&nu;<tspan dy='3' font-size='0.8em'>0</tspan><tspan dy='-3'>/Q</tspan><tspan dy='3' font-size='0.8em'>L</tspan><tspan dy='-3'> at 1550 nm: linewidth, not a bound</tspan>", "an");
  p.vline(QL, "xh");
  marks(p, pts, look, () => ({}));
  return p.svg(`dv-plot ${look}`, "Bandwidth versus loaded Q, resonant modulators");
}
