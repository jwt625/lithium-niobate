// 6.10 Heterogeneous lasers, amplifiers, detectors: manuscript text and popups (no figure in figures.md).
import { buildSection, meta } from "$lib/figures/devices/server";

export const load = async () => {
  const b = await buildSection("6.10");
  return { meta: meta("6.10", "Heterogeneous lasers, amplifiers, detectors", "Chapter 6.10: III-V lasers and amplifiers, Er:LNOI amplifiers and bonded photodiodes on thin-film lithium niobate, with dated sources.", b.keys), b };
};
