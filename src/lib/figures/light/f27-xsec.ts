// Chapter 2.7: the Li et al. 2026 rib cross-section drawn to scale (one scale for x and y; the buried oxide is broken).
// Reported (li2026aa, r:li2026aa): 300 nm film, 180 nm etch, 120 nm slab, 3.5 um top width, 60 deg sidewall (reference
// direction not stated), 2 um PECVD SiO2 cladding, 6 um electrode gap. Engine model (eo-modulator-atlas
// sims/li2026aa/config.yaml as exported in static/data/eo-overlap-li2026aa.json, r:atlas-engine): rib base half-width
// 1.85392 um (sidewall 60 deg from the substrate plane), Au electrodes 1.0 um thick on the slab, cladding to y = 2.3 um,
// buried oxide to y = -4.7 um; n_eff 1.7696 and n_g 2.135 at 1550 nm (x-cut TE). Electrodes are drawn to the frame edge
// (their outer widths are outside the modelled window).
import { c } from "./plot.ts";

/** Geometry in um (x lateral, y up from the buried-oxide top). */
export const LI = {
  film: 0.3, slab: 0.12, etch: 0.18, wTop: 3.5, wBase: 2 * 1.85392, side: 60, clad: 2.0, cladTop: 2.3, gap: 6.0, au: 1.0, box: 4.7,
  neff: 1.7696, ng: 2.135,
} as const;

const K = 68; // px per um
const XL = -4.2, XR = 4.2, X0 = 64;
const YT = 2.8, YB1 = -1.15, BRK = 20, YB2 = -4.35, YSI = -5.25, Y0 = 34;
const X = (x: number): number => X0 + (x - XL) * K;
/** y (um) to px; below YB1 the drawing jumps over the broken part of the buried oxide. */
const Y = (y: number): number => (y >= YB1 ? Y0 + (YT - y) * K : Y0 + (YT - YB1) * K + BRK + (YB2 - y) * K);
const XW = X(XR), YBOT = Y(YSI), YBK = Y(YB1);

function shapes(): { si: string; box: string; clad: string; ln: string; s: string; g: string; brk: string } {
  const xb = LI.wBase / 2, xt = LI.wTop / 2;
  const x0 = c(X(XL)), x1 = c(XW);
  const ln = `M${x0} ${c(Y(0))}H${x1}V${c(Y(LI.slab))}H${c(X(xb))}L${c(X(xt))} ${c(Y(LI.film))}H${c(X(-xt))}L${c(X(-xb))} ${c(Y(LI.slab))}H${x0}Z`;
  const s = `M${x0} ${c(Y(LI.slab))}H${c(X(-LI.gap / 2))}V${c(Y(LI.slab + LI.au))}H${x0}Z`;
  const g = `M${c(X(LI.gap / 2))} ${c(Y(LI.slab))}H${x1}V${c(Y(LI.slab + LI.au))}H${c(X(LI.gap / 2))}Z`;
  const clad = `M${x0} ${c(Y(LI.cladTop))}H${x1}V${c(Y(0))}H${x0}Z`;
  const box = `M${x0} ${c(Y(0))}H${x1}V${c(YBK)}H${x0}ZM${x0} ${c(YBK + BRK)}H${x1}V${c(Y(-LI.box))}H${x0}Z`;
  const si = `M${x0} ${c(Y(-LI.box))}H${x1}V${c(YBOT)}H${x0}Z`;
  // break: two zigzags across the buried oxide
  let z1 = `M${c(X(XL) - 6)} ${c(YBK)}`, z2 = `M${c(X(XL) - 6)} ${c(YBK + BRK)}`;
  for (let i = 0, xs = X(XL); xs <= XW + 6; i++, xs += 14) { z1 += `L${c(xs + 7)} ${c(YBK + (i % 2 ? 0 : 5))}`; z2 += `L${c(xs + 7)} ${c(YBK + BRK + (i % 2 ? 0 : 5))}`; }
  return { si, box, clad, ln, s, g, brk: `${z1}${z2}` };
}

/** Horizontal dimension line with end ticks and a centered label above. */
function hdim(xa: number, xb: number, y: number, label: string, cls: string): string {
  return `<path class="${cls}" d="M${c(X(xa))} ${c(Y(y))}H${c(X(xb))}M${c(X(xa))} ${c(Y(y) - 5)}v10M${c(X(xb))} ${c(Y(y) - 5)}v10"/><text class="${cls}t" x="${c((X(xa) + X(xb)) / 2)}" y="${c(Y(y) - 7)}" text-anchor="middle">${label}</text>`;
}
/** Vertical dimension (y in um) at pixel column px. */
function vdim(px: number, ya: number, yb: number, cls: string): string {
  return `<path class="${cls}" d="M${c(px)} ${c(Y(ya))}V${c(Y(yb))}M${c(px - 5)} ${c(Y(ya))}h10M${c(px - 5)} ${c(Y(yb))}h10"/>`;
}

/** TECH: line drawing, monochrome, dimension lines in mono. */
export function xsecTechSVG(): string {
  const S = shapes();
  const RX = XW + 18; // right annotation column
  const sideA = X(-LI.wBase / 2), sideY = Y(LI.slab);
  let d = `<path class="xs-si" d="${S.si}"/><path class="xs-box" d="${S.box}"/><path class="xs-clad" d="${S.clad}"/><path class="xs-ln" d="${S.ln}"/><path class="xs-au" d="${S.s}"/><path class="xs-au" d="${S.g}"/><path class="xs-brk" d="${S.brk}"/>`;
  // dimensions
  d += hdim(-LI.gap / 2, LI.gap / 2, 1.62, "6 µm gap", "xs-dm");
  d += hdim(-LI.wTop / 2, LI.wTop / 2, 0.62, "w 3.5 µm", "xs-dm");
  // film / slab / etch at the right column with leaders
  d += vdim(RX, 0, LI.film, "xs-dm") + vdim(RX + 16, 0, LI.slab, "xs-dm");
  d += `<path class="xs-ld" d="M${c(X(LI.wTop / 2))} ${c(Y(LI.film))}H${c(RX + 5)}"/>`;
  d += `<text class="xs-dmt" x="${c(RX + 26)}" y="${c(Y(LI.film) - 8)}">t 300 nm</text><text class="xs-dmt" x="${c(RX + 26)}" y="${c(Y(LI.slab) + 2)}">e 180 nm</text><text class="xs-dmt" x="${c(RX + 26)}" y="${c(Y(0) + 14)}">slab 120 nm</text>`;
  // cladding 2 um (left column)
  d += vdim(X(XL) - 22, LI.film, LI.cladTop, "xs-dm") + `<path class="xs-ld" d="M${c(X(XL) - 17)} ${c(Y(LI.film))}H${c(X(-LI.wTop / 2))}"/>`;
  d += `<text class="xs-dmt" transform="translate(${c(X(XL) - 30)} ${c(Y((LI.film + LI.cladTop) / 2))}) rotate(-90)" text-anchor="middle">SiO₂ 2 µm</text>`;
  // sidewall angle (leader to the left sidewall)
  const swx = (sideA + X(-LI.wTop / 2)) / 2, swy = (sideY + Y(LI.film)) / 2;
  d += `<path class="xs-ld" d="M${c(swx - 2)} ${c(swy + 3)}L${c(swx - 26)} ${c(swy + 30)}H${c(swx - 38)}"/><text class="xs-dmt" x="${c(swx - 42)}" y="${c(swy + 34)}" text-anchor="end">sidewall 60°</text>`;
  // layer names
  d += `<text class="xs-lb" x="${c(X(-3.95))}" y="${c(Y(0.55))}">Au</text><text class="xs-lb" x="${c(X(3.35))}" y="${c(Y(0.55))}">Au</text>`;
  d += `<text class="xs-lb" x="${c(X(-3.95))}" y="${c(Y(2.0))}">SiO₂ cladding</text><text class="xs-lb" x="${c(X(-3.95))}" y="${c(Y(-0.95))}">buried SiO₂, 4.7 µm</text><text class="xs-lb" x="${c(X(-3.95))}" y="${c((Y(-LI.box) + YBOT) / 2 + 4)}">Si</text>`;
  d += `<text class="xs-lb" x="${c(X(-3.95))}" y="${c(Y(2.62))}">air</text>`;
  // axes triad (x-cut, propagation along y: lab x = crystal z)
  const tx = XW - 76, ty = Y(2.55);
  d += `<path class="xs-ld" d="M${c(tx)} ${c(ty)}h46"/><path class="xs-ar" d="M${c(tx + 52)} ${c(ty)}l-8 -4v8z"/><text class="xs-dmt" x="${c(tx + 58)}" y="${c(ty + 4)}">z (c)</text>`;
  // scale bar 1 um
  d += `<path class="xs-dm" d="M${c(X(XR) - K)} ${c(YBOT + 22)}H${c(X(XR))}M${c(X(XR) - K)} ${c(YBOT + 17)}v10M${c(X(XR))} ${c(YBOT + 17)}v10"/><text class="xs-dmt" x="${c(X(XR) - K / 2)}" y="${c(YBOT + 40)}" text-anchor="middle">1 µm</text>`;
  return `<svg class="lp f27x" viewBox="0 0 760 ${c(YBOT + 48)}" role="img" aria-label="Cross-section of the Li et al. 2026 x-cut TFLN rib waveguide, to scale">${d}</svg>`;
}

/** VISUAL: material colors, c-axis arrow inside the film, large labels. */
export function xsecVisualSVG(): string {
  const S = shapes();
  let d = `<defs><linearGradient id="f27-au" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--v-au)" stop-opacity="1"/><stop offset="1" stop-color="var(--v-au)" stop-opacity="0.72"/></linearGradient></defs>`;
  d += `<path d="${S.si}" fill="var(--v-si)"/><path d="${S.box}" fill="var(--v-sio2)"/><path d="${S.clad}" fill="var(--v-sio2)"/><path d="${S.ln}" fill="var(--v-ln)"/><path d="${S.s}" fill="url(#f27-au)"/><path d="${S.g}" fill="url(#f27-au)"/><path class="vx-brk" d="${S.brk}"/>`;
  // c axis arrow in the rib (x-cut: c lateral)
  const ay = Y(LI.slab + LI.etch / 2 + 0.06);
  d += `<path class="vx-c" d="M${c(X(-0.9))} ${c(ay + 46)}H${c(X(0.82))}"/><path class="vx-ch" d="M${c(X(0.95))} ${c(ay + 46)}l-13 -7v14z"/><text class="vx-cl" x="${c(X(0))}" y="${c(ay + 72)}" text-anchor="middle">c axis of the film</text>`;
  d += `<path class="vx-lead" d="M${c(X(0))} ${c(ay + 4)}V${c(ay + 32)}"/>`;
  // dimensions
  d += hdim(-LI.gap / 2, LI.gap / 2, 1.7, "6 µm", "vx-dm");
  d += hdim(-LI.wTop / 2, LI.wTop / 2, 0.68, "3.5 µm", "vx-dm");
  // labels
  d += `<text class="vx-lb au" x="${c(X(-3.9))}" y="${c(Y(0.5))}">Au</text><text class="vx-lb au" x="${c(X(3.3))}" y="${c(Y(0.5))}">Au</text>`;
  d += `<text class="vx-lb" x="${c(X(-3.9))}" y="${c(Y(2.02))}">SiO₂, 2 µm</text><text class="vx-lb" x="${c(X(-3.9))}" y="${c(Y(-0.6))}">buried SiO₂</text><text class="vx-lb si" x="${c(X(-3.9))}" y="${c((Y(-LI.box) + YBOT) / 2 + 6)}">Si</text>`;
  d += `<text class="vx-lb ln" x="${c(XW + 14)}" y="${c(Y(0.15) + 6)}">LN 300 nm</text>`;
  d += `<path class="vx-lead" d="M${c(X(LI.wTop / 2) + 6)} ${c(Y(LI.film) + 4)}L${c(XW + 10)} ${c(Y(0.15))}"/>`;
  d += `<path class="vx-dm" d="M${c(X(XR) - K)} ${c(YBOT + 24)}H${c(X(XR))}"/><text class="vx-dmt" x="${c(X(XR) - K / 2)}" y="${c(YBOT + 46)}" text-anchor="middle">1 µm</text>`;
  return `<svg viewBox="0 0 760 ${c(YBOT + 56)}" role="img" aria-label="Cross-section of the Li et al. 2026 x-cut TFLN rib waveguide in material colors, to scale, with the crystal c axis">${d}</svg>`;
}
