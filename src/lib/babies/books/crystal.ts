// "Lithium Niobate for Babies", 01 Crystal: hexagon patchwork (English paper piecing, quilted appliqué).
// The hexagonal patch grid is the close-packed oxygen sheet. Art: src/lib/babies/books/crystal/.

import type { BabyBook } from "../types";
import { TEXT, pages } from "./crystal/pages";

const book: BabyBook = {
  slug: "crystal",
  title: "Crystal",
  style: "hexagon patchwork",
  pages: [
    {
      text: TEXT[0],
      sec: "/crystal/lattice/",
      note: "The oxygen ions form flat sheets stacked almost like close-packed spheres (ch01:L28). Each hexagon patch is one oxygen ball seen from above. The crystal does not occur in nature; people grow it (ch01:L28).",
      scene: pages[0],
    },
    {
      text: TEXT[1],
      sec: "/crystal/lattice/",
      note: "Between the sheets sit octahedral holes, each caged by six oxygens: one third hold niobium, one third are empty, one third hold lithium, repeating in that order along the c axis (ch01:L28, ch01:L68). Li and Nb are drawn the same size; only color and print tell them apart.",
      scene: pages[1],
    },
    {
      text: TEXT[2],
      sec: "/crystal/polarization/",
      note: "Above the Curie temperature, about 1140 C in congruent crystal, Li sits in the oxygen sheet and Nb at the centre of its octahedron; on cooling both shift the same way along c relative to the oxygen frame (ch01:L90, ch01:L134). The arrow is a built-in electric polarization, not a magnet. Shifts drawn much bigger than real.",
      scene: pages[2],
    },
    {
      text: TEXT[3],
      sec: "/crystal/poling/",
      note: "Flipping the polarization takes about 21 kV per mm in congruent crystal, 10.5 kV across a 0.5 mm wafer (ch01:L422). A comb electrode flips only the stripes under its teeth.",
      scene: pages[3],
    },
  ],
};

export default book;
