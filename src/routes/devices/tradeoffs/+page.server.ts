// 6.3 The V_pi L, bandwidth, footprint trade: manuscript text, A1 centerpiece, F6.06 (A4 / A5).
import { buildSection, meta, atlas, stamp, lab } from "$lib/figures/devices/server";
import { A1_DEFAULT, a1Outs, chartA1, chartA4, chartA5, ptsA1, ptsA4, ptsA5 } from "$lib/figures/devices/charts";

export const load = async () => {
  const a1 = lab(ptsA1(atlas.devices)), a4 = lab(ptsA4(atlas.devices)), a5 = lab(ptsA5(atlas.devices));
  const b = await buildSection("6.3", [], [], ["reported", "derived", "template"]);
  return {
    meta: meta("6.3", "The VπL, bandwidth, footprint trade", "Chapter 6.3: published electro-optic modulators from eo-modulator-atlas, V_pi L against bandwidth, length and wavelength by platform, with lower bounds drawn as bounds.", b.keys),
    b, stamp: stamp(),
    a1: { pts: a1, init: { T: chartA1(a1, A1_DEFAULT, 1100, 360, "tech"), V: chartA1(a1, A1_DEFAULT, 1200, 480, "visual"), outs: a1Outs(a1, A1_DEFAULT) } },
    f606: { a4, a5, init: { T: chartA4(a4, 1100, 360, "tech"), V: chartA4(a4, 1200, 480, "visual") } },
  };
};
