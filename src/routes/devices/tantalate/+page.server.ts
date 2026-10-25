// 6.11 Thin-film lithium tantalate: manuscript text (no figure in figures.md).
import { buildSection, meta } from "$lib/figures/devices/server";

export const load = async () => {
  const b = await buildSection("6.11");
  return { meta: meta("6.11", "Thin-film lithium tantalate", "Chapter 6.11: thin-film lithium tantalate modulators and combs, the sibling platform of TFLN, with dated sources and atlas counts.", b.keys), b };
};
