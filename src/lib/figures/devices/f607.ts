// F6.07 Ring modulator: all-pass ring at critical coupling built from a loaded Q (devices.ts ringFromQ), transmission
// versus wavelength offset with the dip shifted by the EO tuning slope, readouts of linewidth and photon lifetime.
import { allPass } from "$lib/physics/ring.ts";
import { linewidthGHz, photonLifetimePs, resonanceShiftPm, ringFromQ } from "$lib/physics/devices.ts";
import { Plot, type Look } from "./svgplot.ts";
import { pad, sgn } from "../fmt.ts";

export interface RingState { [k: string]: number | string | boolean; QL: number; tune: number; V: number; det: number }
export const RING_DEFAULT: RingState = { QL: 1e4, tune: 7, V: 0, det: -0.5 };
const LAM = 1550, NG = 2.3, R_UM = 100; // display templates: group index and radius set the FSR only
const ringCache = new Map<number, { a: number; r: number; fsrPm: number }>();
function ring(QL: number): { a: number; r: number; fsrPm: number } {
  const k = Math.round(QL);
  let v = ringCache.get(k);
  if (!v) { const g = ringFromQ({ lambda_nm: LAM, ng: NG, R_um: R_UM, QL: k, regime: "critical" }); v = { a: g.a, r: g.r, fsrPm: ((LAM * 1e-3) ** 2 / (NG * g.L_um)) * 1e6 }; ringCache.set(k, v); }
  return v;
}
export const lwPm = (QL: number): number => (LAM * 1e3) / QL;
/** Through-port T at wavelength offset d (pm) from the unbiased resonance, with the resonance shifted by s (pm). */
export function ringT(QL: number, d: number, shift: number): number { const g = ring(QL); return allPass((2 * Math.PI * (d - shift)) / g.fsrPm, g.r, g.a); }
/** Circulating power at the coupler relative to its on-resonance value (critical coupling): display glow. */
export function ringGlow(QL: number, d: number, shift: number): number {
  const g = ring(QL), ph = (2 * Math.PI * (d - shift)) / g.fsrPm;
  const f = (p: number): number => (1 - g.r * g.r) / (1 - 2 * g.a * g.r * Math.cos(p) + (g.a * g.r) ** 2);
  return f(ph) / f(0);
}
export function ringOuts(s: RingState): Record<string, string> {
  const sh = resonanceShiftPm(s.tune, s.V), dl = s.det * lwPm(s.QL);
  return {
    QL: pad(Math.round(s.QL).toFixed(0), 7), lw: `${pad(linewidthGHz(LAM, s.QL).toFixed(2), 6)} GHz`, tau: `${pad(photonLifetimePs(LAM, s.QL).toFixed(2), 6)} ps`,
    shift: `${pad(sgn(sh, 1), 6)} pm`, T: pad(ringT(s.QL, dl, sh).toFixed(3), 5), V: `${pad(sgn(s.V, 2), 5)} V`, tune: `${pad(s.tune.toFixed(1), 4)} pm/V`,
    det: `${pad(sgn(s.det, 2), 5)} Δν`, lwpm: `${pad(lwPm(s.QL).toFixed(1), 5)} pm`,
  };
}
export function ringPlot(s: RingState, w: number, h: number, look: Look): string {
  const X = 300;
  const p = new Plot({ w, h, look, x: { min: -X, max: X, label: "wavelength offset (pm)" }, y: { min: 0, max: 1, label: "transmission T", ticks: [0, 0.25, 0.5, 0.75, 1] } }).axes();
  const sh = resonanceShiftPm(s.tune, s.V);
  const n = 600, a: [number, number][] = [], b: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const d = -X + (2 * X * i) / n; a.push([d, ringT(s.QL, d, 0)]); b.push([d, ringT(s.QL, d, sh)]); }
  if (Math.abs(sh) > 1e-9) p.line(a, "ref");
  p.line(b, look === "tech" ? "cur" : "ir1550");
  const dl = s.det * lwPm(s.QL);
  p.vline(dl, "xh");
  if (p.inX(dl)) p.add(`<circle class="pt0" cx="${p.sx(dl).toFixed(1)}" cy="${p.sy(ringT(s.QL, dl, sh)).toFixed(1)}" r="${look === "tech" ? 3.5 : 6}"/>`);
  if (p.inX(dl)) p.text(p.sx(dl) + 4, p.y1 + (look === "tech" ? 10 : 14), "laser", "lab");
  return p.svg(`dv-plot ${look}`, "Ring transmission versus wavelength offset");
}
/** VISUAL ring illustration: bus, ring with electrodes, dashed 1550 nm false colour whose opacity follows stored energy. */
export function ringArt(s: RingState, w: number, h: number): string {
  const sh = resonanceShiftPm(s.tune, s.V), dl = s.det * lwPm(s.QL);
  const glow = ringGlow(s.QL, dl, sh), T = ringT(s.QL, dl, sh);
  const R = Math.min(h * 0.32, w * 0.2), cx = w / 2, cy = h * 0.42, by = cy + R + 10;
  const op = (0.12 + 0.88 * Math.min(1, glow)).toFixed(2);
  return `<svg class="dv-art visual" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Ring modulator: bus waveguide, ring and electrodes">`
    + `<path class="au" d="M${cx - R - 26} ${cy - R - 14}h${2 * R + 52}v10h${-(2 * R + 52)}z" opacity="0.9"/>`
    + `<circle class="au" cx="${cx}" cy="${cy}" r="${(R * 0.62).toFixed(1)}" opacity="0.9"/>`
    + `<circle class="wg" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}"/>`
    + `<circle class="ir" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}" style="opacity:${op}"/>`
    + `<path class="wg" d="M20 ${by}H${w - 20}"/>`
    + `<path class="ir" d="M20 ${by}H${cx}"/>`
    + `<path class="ir" d="M${cx} ${by}H${w - 20}" style="opacity:${(0.1 + 0.9 * T).toFixed(2)}"/>`
    + `<text x="20" y="${by + 22}">in, 1550 nm</text><text x="${w - 20}" y="${by + 22}" text-anchor="end">out: T = ${T.toFixed(3)}</text>`
    + `<text x="${cx}" y="${(cy - R - 22).toFixed(1)}" text-anchor="middle">Au</text>`
    + `</svg>`;
}
