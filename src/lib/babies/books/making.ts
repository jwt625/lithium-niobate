// "Lithium Niobate for Babies", 05 Making: wordless isometric instruction manual (numbered steps, step arrows,
// flat fills, one accent for heat, ions and field). Art: src/lib/babies/books/making/.
import type { BabyBook, SceneHost } from "../types";
import { growScene } from "./making/p1-grow";
import { wafersScene } from "./making/p2-wafers";
import { thinFilmScene } from "./making/p3-thin-film";
import { chipScene } from "./making/p4-chip";

export const TEXT = [
  "Melt powder in a hot pot. Dip a seed. Turn, pull slowly. A crystal grows!",
  "Slice the crystal like bread. Out come thin, round wafers.",
  "Shoot in tiny bits. Flip it onto a new wafer. Warm it. It splits!",
  "Carve a ridge. Add gold. Zap to flip stripes. Now you know how it is made!",
];

const book: BabyBook = {
  slug: "making",
  title: "Making",
  style: "isometric instruction manual",
  pages: [
    {
      text: TEXT[0],
      sec: "/making/crystal-growth/",
      note: "Czochralski growth: two white powders, lithium carbonate and niobium pentoxide, are melted near 1255 C (ch05:L37; melting point of congruent LN 1255 C, ch05:L97). A seed touches the melt in a crucible, is rotated slowly and pulled up by 1 to 2 mm per hour; the crystal (boule) grows from the meniscus, and a 150 mm boule takes days (ch05:L85). The melt is the congruent composition, slightly short of lithium (ch05:L85). Crucible material is not given in ch05 (ch05:L114), so the pot is drawn generic. Not to scale.",
      scene: (h: SceneHost) => growScene(h, TEXT[0]),
    },
    {
      text: TEXT[1],
      sec: "/making/wafers/",
      note: "The boule is poled to a single domain before slicing, then sliced, lapped and polished into wafers; flats on the wafer edge encode the crystal axes (ch05:L151; process-flow s04, s05). One SAW-wafer maker lists 500 um thick wafers at 6 inch (ch05:L166). The saw is drawn as a generic blade; the process flow names a wire saw (process-flow s05). Not to scale.",
      scene: (h: SceneHost) => wafersScene(h, TEXT[1]),
    },
    {
      text: TEXT[2],
      sec: "/making/thin-film/",
      note: "Ion slicing (crystal ion slicing, the Smart Cut family): helium or hydrogen ions stop at a depth set by their energy, about 0.7 um for 195 keV helium (ch05:L221; 0.68 um peak, ch05:L243). The wafer is flipped and bonded to oxidized silicon; gentle heating makes the implanted gas collect in the buried plane until the crystal splits there, leaving a sub-micrometre film on the oxide; polishing and annealing follow (ch05:L221). Reported split near 230 C after a bond-strengthening anneal below 200 C (ch05:L254-L255). Thicknesses not to scale.",
      scene: (h: SceneHost) => thinFilmScene(h, TEXT[2]),
    },
    {
      text: TEXT[3],
      sec: "/making/patterning/",
      note: "Ridges are cut mostly by argon ions that knock atoms off physically; fluorine chemistry leaves non-volatile LiF (ch05:L318). Gold electrodes a few micrometres from the waveguide carry the microwave signal and are made by lift-off (ch05:L438). For colour conversion the polarization is flipped in stripes a few micrometres wide: a comb electrode carries a short high-voltage pulse and under each tooth the domains reverse (ch05:L462). Poling is for colour-conversion chips, not every chip; ch05 does not fix its order relative to etching.",
      scene: (h: SceneHost) => chipScene(h, TEXT[3]),
    },
  ],
};

export default book;
