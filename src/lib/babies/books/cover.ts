// Cover book "Lithium Niobate for Babies" in Chinese paper-cut (jianzhi), DevLog-007 sec. 7 / DevLog-007b.
import type { BabyBook } from "../types";
import { unfoldScene } from "./cover/p1-unfold";
import { growScene } from "./cover/p2-grow";
import { arrowScene } from "./cover/p3-arrow";
import { doorsScene } from "./cover/p4-doors";

const book: BabyBook = {
  slug: "cover",
  title: "Lithium Niobate for Babies",
  style: "Chinese paper-cut (jianzhi)",
  pages: [
    {
      text: "Lithium Niobate for Babies",
      sec: "/",
      note: "The cut is LiNbO3 seen down the c axis. Big gold holes: the columns where Nb, an empty site and Li stack along c. Small holes: O columns (near-coincident ones merged). Fold a disc in half, then in thirds, cut, unfold: the creases are the three mirror lines 60 deg apart of the projection (plane group p31m; point group 3m, ch01:L30, ch01:L36). Positions computed from R3c, a = 5.148 A, O at x = 0.04751, y = 0.34301 (ch01:L38, ch01:L66).",
      scene: unfoldScene,
    },
    {
      text: "Lithium, niobium and oxygen make this crystal. People grow it.",
      sec: "/crystal/",
      note: "LiNbO3 does not occur in nature (ch01:L28). Commercial crystals are pulled from a melt on a seed by the Czochralski method (ch05:L85).",
      scene: growScene,
    },
    {
      text: "It has an arrow inside. The arrow lets it play with light and sound.",
      sec: "/crystal/polarization/",
      note: "The arrow is the spontaneous electric polarization Ps along the c axis, about 71 uC/cm^2 in congruent LN at room temperature (ch01:L140). It is electric, not magnetic.",
      scene: arrowScene,
    },
    {
      text: "Pick a door!",
      sec: "/",
      scene: doorsScene,
    },
  ],
};

export default book;
