// "Lithium Niobate for Babies", 04 Quirks: crayon scratch-art. Bright crayon under a black coat; every mark is
// black scraped away, and a scraped mark stays, as light writes and the writing stays (photorefraction).
// Art: src/lib/babies/books/quirks/.

import type { BabyBook } from "../types";
import { TEXT1, writeScene } from "./quirks/p1-write";
import { TEXT2, magnesiumScene } from "./quirks/p2-magnesium";
import { TEXT3, warmScene } from "./quirks/p3-warm";
import { TEXT4, driftScene } from "./quirks/p4-drift";

const book: BabyBook = {
  slug: "quirks",
  title: "Quirks",
  style: "crayon scratch-art",
  pages: [
    {
      text: TEXT1,
      sec: "/quirks/photorefraction/",
      note: "Light frees electrons from impurity and defect sites; the crystal's polar structure pushes them along the c axis with no applied voltage, and they are trapped in the dark edges of the beam. Their field changes the refractive index (Pockels effect), so the mark is an index change, not a burn. First called optical damage, it is reversible: uniform light or heat erases it (ch04:L33). Seen from 10 mW/cm^2 in Fe-doped LN with blue-green light, no threshold (ch04:L39); index change up to 1e-3 (ch04:L40). Mark drawn much bigger than real.",
      scene: writeScene,
    },
    {
      text: TEXT2,
      sec: "/quirks/mgo-doping/",
      note: "About 5 % MgO in congruent LN. Magnesium does not stop the light-driven current; it makes the crystal about 100x more photoconductive, so the separated charge leaks back before it builds a large field (ch04:L121, ch04:L140, bryan1984). Below a threshold, about 4.5 at.% MgO, the effect is small (ch04:L139).",
      scene: magnesiumScene,
    },
    {
      text: TEXT3,
      sec: "/quirks/pyroelectricity/",
      note: "The built-in polarization along c shrinks as the crystal warms, so any temperature change leaves charge on the two faces across c (ch04:L275). Warming makes the +c face (arrow head) more negative, cooling more positive (ch04:L290). A wafer off a hotplate can build kilovolts until a spark, a cracked film or pulled-in dust discharges it (ch04:L275): unscreened, 7.5 to 17.8 kV across a 0.5 mm z-cut wafer for a 95 K step (ch04:L312, derived).",
      scene: warmScene,
    },
    {
      text: TEXT4,
      sec: "/quirks/dc-bias-drift/",
      note: "A modulator is set to its operating point with a DC voltage. Over seconds to hours, mobile charge in and around the crystal rearranges and cancels part of the applied field, so the operating point walks away (ch04:L336). Bulk Ti:LN shows a seconds component (buffer leakage) and an hours component (ch04:L354, yamada1981); thin films drift faster (ch04:L336). The pointer follows a one-time-constant Maxwell-Wagner response (ch04:L344-L347); tap re-locks it, as a bias control loop does (ch04:L397).",
      scene: driftScene,
    },
  ],
};

export default book;
