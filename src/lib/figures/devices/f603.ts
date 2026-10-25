// F6.03 Cross-section V_pi L calculator (push-pull, x-cut, TE, field along z) with the atlas implied-overlap scatter (A3).
// Physics: devices.ts vpiLPushPullVcm; n_e from Zelmon 1997 CLN (optics.ts nCLN, 21 C).
import { vpiLPushPullVcm } from "$lib/physics/devices.ts";
import { nCLN } from "../optics.ts";
import { pad } from "../fmt.ts";
import type { Look } from "./svgplot.ts";
import { R33 } from "./charts.ts";

export interface CalcState { [k: string]: number | string | boolean; gap: number; Gamma: number; lam: number; r33: string; logy: boolean }
export const CALC_DEFAULT: CalcState = { gap: 5, Gamma: 0.5, lam: 1.55, r33: "turner", logy: true };
export const vpilOf = (s: Pick<CalcState, "gap" | "Gamma" | "lam" | "r33">): number =>
  vpiLPushPullVcm({ lam_um: s.lam, gap_um: s.gap, n: nCLN("e", s.lam), r_pm_per_V: R33[s.r33] ?? 30.8, Gamma: s.Gamma });
export function calcOuts(s: CalcState): Record<string, string> {
  const v = vpilOf(s), v0 = vpilOf({ ...s, lam: 1.55 });
  return {
    vpil: `${pad(v.toFixed(2), 5)} V cm`, ne: pad(nCLN("e", s.lam).toFixed(4), 6), Gamma: pad(s.Gamma.toFixed(2), 4), gap: `${pad(s.gap.toFixed(1), 4)} µm`,
    lam: `${pad(s.lam.toFixed(3), 5)} µm`, rel: `×${pad((v0 / v).toFixed(2), 5)}`, r33: `${(R33[s.r33] ?? 30.8).toFixed(1)} pm/V`,
  };
}

/** Cross-section: lateral true scale, vertical exaggerated (stated in the drawing). Electrodes at +-g/2 from the rib. */
export function crossSection(s: CalcState, w: number, h: number, look: Look): string {
  const span = 24; // um shown laterally
  const k = (w - 20) / span, cx = w / 2;
  const vx = 8; // vertical exaggeration
  const y0 = h * 0.58, film = 0.6 * k * vx * 0.5, slab = film * 0.45, rib = 1.2 * k;
  const X = (u: number): number => cx + u * k;
  const gx = s.gap / 2;
  const el = 4.5; // electrode drawn width (um), template
  const elh = Math.max(6, 0.5 * k * vx * 0.5);
  const parts: string[] = [];
  parts.push(`<rect class="si" x="0" y="${(y0 + 26).toFixed(1)}" width="${w}" height="${(h - y0 - 26).toFixed(1)}"/>`);
  parts.push(`<rect class="ox" x="0" y="${y0.toFixed(1)}" width="${w}" height="26"/>`);
  parts.push(`<path class="ln" d="M0 ${y0}V${(y0 - slab).toFixed(1)}H${(cx - rib / 2 - 3).toFixed(1)}L${(cx - rib / 2).toFixed(1)} ${(y0 - film).toFixed(1)}H${(cx + rib / 2).toFixed(1)}L${(cx + rib / 2 + 3).toFixed(1)} ${(y0 - slab).toFixed(1)}H${w}V${y0}Z"/>`);
  const ey = y0 - slab;
  const L1 = X(-gx - el), L2 = X(-gx), R1 = X(gx), R2 = X(gx + el);
  // field lines between the electrodes (density proportional to 1/g: field per volt)
  const nf = Math.max(2, Math.min(9, Math.round(30 / s.gap)));
  for (let i = 0; i < nf; i++) {
    const t = (i + 0.5) / nf, depth = (0.35 + 1.6 * t) * film;
    parts.push(`<path class="fl" d="M${(L2 - t * 6).toFixed(1)} ${(ey - elh * 0.4).toFixed(1)}Q${cx.toFixed(1)} ${(ey - elh * 0.4 + depth * 1.4 - film * 0.6).toFixed(1)} ${(R1 + t * 6).toFixed(1)} ${(ey - elh * 0.4).toFixed(1)}"/>`);
  }
  // optical mode: 1/e2 contour, size scales with wavelength (display), clipped to the film region
  const mw = Math.max(rib * 0.9, s.lam * 0.75 * k), mh = Math.min(film * 0.95, film * (0.45 + 0.2 * s.lam));
  if (look === "visual") parts.push(`<ellipse class="ov" cx="${cx}" cy="${(y0 - film * 0.55).toFixed(1)}" rx="${(Math.min(mw, (R1 - L2) / 2) / 2).toFixed(1)}" ry="${(mh / 2).toFixed(1)}"/>`);
  parts.push(`<ellipse class="md" cx="${cx}" cy="${(y0 - film * 0.55).toFixed(1)}" rx="${(mw / 2).toFixed(1)}" ry="${(mh / 2).toFixed(1)}"/>`);
  parts.push(`<rect class="au" x="${L1.toFixed(1)}" y="${(ey - elh).toFixed(1)}" width="${(L2 - L1).toFixed(1)}" height="${elh.toFixed(1)}"/>`);
  parts.push(`<rect class="au" x="${R1.toFixed(1)}" y="${(ey - elh).toFixed(1)}" width="${(R2 - R1).toFixed(1)}" height="${elh.toFixed(1)}"/>`);
  // gap dimension
  const dy = ey - elh - (look === "tech" ? 12 : 16);
  parts.push(`<path class="dim" d="M${L2.toFixed(1)} ${dy - 4}V${dy + 4}M${R1.toFixed(1)} ${dy - 4}V${dy + 4}M${L2.toFixed(1)} ${dy}H${R1.toFixed(1)}"/>`);
  parts.push(`<text x="${cx}" y="${(dy - 5).toFixed(1)}" text-anchor="middle">g = ${s.gap.toFixed(1)} µm</text>`);
  // scale bar 5 um
  parts.push(`<path class="dim" d="M10 ${h - 10}H${(10 + 5 * k).toFixed(1)}"/><text x="10" y="${h - 14}">5 µm</text>`);
  parts.push(`<text x="${w - 8}" y="${h - 12}" text-anchor="end">vertical ×${vx}</text>`);
  parts.push(`<text x="${w - 8}" y="${(y0 + 17).toFixed(1)}" text-anchor="end">SiO${look === "tech" ? "2" : "₂"}</text><text x="8" y="${(y0 - slab - 4).toFixed(1)}">LN, x-cut</text>`);
  return `<svg class="dv-art ${look}" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Modulator cross-section: rib waveguide between two gold electrodes">${parts.join("")}</svg>`;
}
