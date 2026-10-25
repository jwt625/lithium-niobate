// Popup entries shared by several chapter 08 pages (estimates and atlas statistics).
import type { Pop } from "$lib/content/pops";
import { ATLAS } from "./facts";

export const ATLAS_POP: Pop = {
  h: "eo-modulator-atlas statistic",
  body: `Count or median over atlas rows at commit <span class='v'>${ATLAS.commit.slice(0, 7)}</span> (${ATLAS.date}), computed in the page from the pinned subset (fetched ${ATLAS.fetched}). The atlas is a curated sample of papers, not a census.`,
  badges: [["d", "derived"]],
  src: `<a href='${ATLAS.repo}/tree/${ATLAS.commit}'>github.com/jwt625/eo-modulator-atlas</a> (no license file upstream)`,
};
export const NB_POP: Pop = {
  h: "Niobium in an LN wafer",
  body: "m<sub>LN</sub> = &rho; &pi;(D/2)<sup>2</sup> t; 150 mm &times; 0.5 mm: 8.84 cm<sup>3</sup> &times; 4,642.8 kg/m<sup>3</sup> = 41.0 g. Nb mass fraction 92.906 / 147.843 = 62.8%: 25.8 g Nb. 2.1 M wafers: 54.1 t, 0.0483% of 112,000 t. Flats ignored.",
  badges: [["g8 gE", "E"]],
  src: "Density: Kushibiki et al., IEEE TUFFC 46, 1315 (1999), <a href='https://doi.org/10.1109/58.796136'>doi:10.1109/58.796136</a>, Table IV; atomic weights: IUPAC CIAAW abridged values, Prohaska et al., Pure Appl. Chem. 94, 573 (2022), <a href='https://doi.org/10.1515/pac-2019-0603'>doi:10.1515/pac-2019-0603</a>; world output: USGS MCS 2026",
};

import type { Card } from "./atlas";
const esc = (s: string): string => s.replace(/&(?![a-z]+;)/g, "&amp;").replace(/</g, "&lt;");
/** Atlas hover cards as popup entries "a:<device_id>". */
export function cardPops(cards: Card[]): Record<string, Pop> {
  return Object.fromEntries(cards.map((c) => [`a:${c.id}`, {
    h: `${esc(c.who)} ${c.year ?? ""}: ${esc(c.title)}`,
    body: `${c.year ?? ""}, ${esc(c.venue)}. ${c.meta}.<br><span class='v'>${c.vals}</span>${c.notes ? `<br><span class='i8-note'>${esc(c.notes)}</span>` : ""}`,
    badges: [["d", "atlas row"]],
    src: `${c.link ? `<a href='${esc(c.link)}'>${esc(c.link.replace(/^https?:\/\//, ""))}</a> &middot; ` : ""}<a href='${ATLAS.repo}/blob/${ATLAS.commit}/${esc(c.ev)}'>evidence at ${ATLAS.commit.slice(0, 7)}</a>`,
  } satisfies Pop]));
}
