// "Lithium Niobate for Babies", 08 Industry: Isotype counting book. Quantity is shown by repeating one
// pictogram, never by scaling it; flat own-drawn silhouettes in four colours on paper. Art: ./industry/.

import type { BabyBook } from "../types";
import { TEXT, pages } from "./industry/pages";

const book: BabyBook = {
  slug: "industry",
  title: "Industry",
  style: "Isotype counting book",
  pages: [
    {
      text: TEXT[0],
      sec: "/industry/rock-to-chip/",
      note: "Simplified value chain: niobium ore -> niobium oxide powder -> grown crystal -> wafer -> chip; the full chain also has thin-film wafer, foundry, module and system steps (ch08:L40). The crystal does not occur in nature; people grow it, e.g. by Czochralski pulling (ch01:L28, ch08:L54). The rock is a niobium ore, not lithium niobate; LN is about 63% niobium by weight and the lithium comes from separate lithium production (ch08:L38, ch08:L53).",
      scene: pages[0],
    },
    {
      text: TEXT[1],
      sec: "/industry/rock-to-chip/",
      note: "One rock = 8,000 t of niobium content. World mine production about 112,000 t in 2025 (14 rocks), Brazil about 104,000 t, about 93% (13 rocks); USGS estimates, grade F (ch08:L46, ch08:L47). Most of it goes into steel (ch08:L38).",
      scene: pages[1],
    },
    {
      text: TEXT[2],
      sec: "/industry/in-your-life/",
      note: "Phones use acoustic filters to pick their radio bands; many sit on LN or its sister crystal LT (lithium tantalate); most SAW (surface acoustic wave) filters likely use LT (estimate, E), and BAW (bulk acoustic wave) filters use aluminum nitride, not LN (ch08:L304). Filter wafers in LT and LN versions are made for 5G, GPS and Wi-Fi sharing one phone (F, ch08:L305). The three filters stand for three radios, not a count; no source separates LN from LT filters per phone (ch08:L317).",
      scene: pages[2],
    },
    {
      text: TEXT[3],
      sec: "/industry/in-your-life/",
      note: "LN modulators write data onto light in fiber links, and thin-film LN chips drive 1.6 Tb/s reference transceivers (F/V); silicon photonics and InP (indium phosphide) compete, and the thin-film LN market share is not public (ch08:L306). At OFC 2026, thin-film LN and LT were the modulator platform in 4 of 24 postdeadline papers (ch08:L210). Four racks are a picture, not a count.",
      scene: pages[3],
    },
  ],
};

export default book;
