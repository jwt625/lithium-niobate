// "Lithium Niobate for Babies", 07 History: Bayeux-style embroidered strip (wool on linen,
// stem-stitch outlines, laid-and-couched fills). One continuous strip; each page is the next
// stretch of it. Events from content/chapters/07-history/events.yaml. Art: ./history/.

import type { BabyBook } from "../types";
import { TEXT } from "./history/pages";
import { stripScene } from "./history/scene";

const book: BabyBook = {
  slug: "history",
  title: "History",
  style: "Bayeux-style embroidered strip",
  pages: [
    {
      text: TEXT[0],
      sec: "/history/a-crystal-on-paper/",
      note: "1949-12-15: B. T. Matthias and J. P. Remeika (Bell Telephone Laboratories) report that single crystals of LiNbO3 and LiTaO3 are strongly ferroelectric, Phys. Rev. 76, 1886 (h-1949-matthias-remeika, ev:L159, status V). The arrow is the built-in electric polarization; the push is an electric field, which flips it. 1949 is the discovery of ferroelectricity in the crystal, not its first synthesis. Plates, button and sizes are drawn for the story.",
      scene: (h) => stripScene(h, 1),
    },
    {
      text: TEXT[1],
      sec: "/history/bell-labs-grows-a-crystal/",
      note: "1965-02: A. A. Ballman (Bell Telephone Laboratories) reports Czochralski pulling of LiNbO3 and other piezoelectric and ferroelectric crystals, J. Am. Ceram. Soc. 48, 112 (h-1965-ballman-czochralski, ev:L245, status P: publication confirmed, its LiNbO3 link rests on citing papers). A Soviet group reported pulling the crystal the same year (h-1965-fedulov, ev:L259, P). Bell Labs' five-paper 1966 series covers growth and single-domain crystals (h-1966-ferroelectric-ln-series, ev:L357, V). Crystal and furnace drawn much bigger than real.",
      scene: (h) => stripScene(h, 2),
    },
    {
      text: TEXT[2],
      sec: "/history/the-internets-modulator/",
      note: "1985: Crystal Technology, Inc. (Palo Alto) announces the first commercially available guided-wave modulator, a high-speed intensity modulator (h-1985-crystal-technology-modulator, ev:L839, status V). 'Light switch' here means this modulator: it writes data onto a steady laser beam. By 2000 a review lists LiNbO3 modulators for 2.5, 10 and 40 Gb/s fiber systems (h-2000-wooten-review, ev:L1375, V); Fujitsu reports one million coherent LiNbO3 modulators shipped by 2021 (h-2021-fujitsu-millionth, ev:L1487, V). Poles and blink pattern are illustration; the 1985 record does not say where the first units were used.",
      scene: (h) => stripScene(h, 3),
    },
    {
      text: TEXT[3],
      sec: "/history/ai-data-center/",
      note: "2018-10: thin-film LiNbO3 modulators driven at CMOS-compatible voltages, C. Wang et al. (Harvard; Nokia Bell Labs), Nature 562, 101 (h-2018-wang-nature, ev:L1701, status V). 2026-03-17: HyperLight and TFC show a 1.6T-DR8 thin-film reference transceiver at OFC 2026, one laser feeding eight 200 Gb/s lanes; vendor claims, a reference design, not a deployed product (h-2026-ofc-1p6t, ev:L2235, V). 2026-06-18: HyperLight's Series C is 'to accelerate TFLN deployment for AI infrastructure' (h-2026-hyperlight-series-c, ev:L2277, V).",
      scene: (h) => stripScene(h, 4),
    },
  ],
};

export default book;
