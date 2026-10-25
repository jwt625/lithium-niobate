// 5.12 The Process viewer: the full viewer plus its routes, anchors, parameter status counts, engine rules and models.
// Text written for the page from manuscript 5.12, process-flow.yaml (anchors, materials) and figures.md F05-01;
// source tags are converted to badges by md.inline.
import { newBook, inline } from "$lib/figures/making/md";
import { buildFlow } from "$lib/figures/making/flow-build";
import type { PageMeta } from "$lib/content/site";

export const load = async () => {
  const book = await newBook("mk512");
  const { flow, pops } = await buildFlow(book.idx);
  Object.assign(book.pops, pops);
  const I = (s: string): string => inline(s, book);
  const routes = [
    { r: "Ridge, DUV + SiO2 mask", anchor: I("Luke et al. 2020 [luke2020; P (arXiv)]"), why: I("one paper reports the full wafer-scale patterning and cladding sequence (DUV, SiO2 hard mask, Ar ICP-RIE, HF strip, PECVD cladding) on 4- and 6-inch x-cut LNOI"), gaps: I("electrodes from Kharel et al. 2021 [kharel2021; P (arXiv)], same group; facets template") },
    { r: "Strip, DUV + DLC mask", anchor: I("Li et al. 2023 [li2023nc; P]"), why: I("one paper reports DUV, DLC hard mask, Ar IBE, SC-1 redeposition clean, Ti/Au lift-off and etched facets"), gaps: I("no cladding stated (drawn uncladded); Si3N4 and DLC stack thicknesses from a LiTaO3 paper [wang2024nature; P, LT analog]") },
    { r: "Shared front end", anchor: "none", why: I("both anchor papers used commercial LNOI, so crystal growth and LNOI formation are composite"), gaps: "every front-end value is an analog or template" },
  ];
  const materials = [
    ["LN display index", "2.21", I("[zhu2021 Table 1; S]"), "n<sub>o</sub> at 1550 nm; single display index of the 3D material"],
    ["LN edge reflectance F<sub>0</sub>", "0.142", "derived", "((n − 1)/(n + 1))<sup>2</sup> with n = 2.21"],
    ["LN tint", "pale straw", "template", "not sourced"],
    ["DLC", "a-C:H, up to 5% sp<sup>3</sup>", I("[li2023nc; P]"), "Raman D 1312.4, G 1541.0 cm<sup>−1</sup>"],
  ];
  const models = [
    ["3 pull", "L(t) = v t at the 1.5 mm/h midpoint; rotation at the rate midpoint", "reported (analog, review table); seed orientation and cone angles template"],
    ["8 implant", "He plane at the reported 0.68 µm peak; width template", "centre reported (analog); no range table, width template"],
    ["9 bond", "rigid flip about the donor's in-plane Y axis; contact wave from the centre pin", "method reported (analog); wave speed template"],
    ["10 split", "T(t) ramp to about 230 °C; residual donor lifts", "temperatures reported (analog); time axis template"],
    ["11 CMP", "Preston dz/dt = K<sub>p</sub> P v from 680 to 600 nm; 8 mm rim", "K<sub>p</sub> template; edge exclusion reported (analog)"],
    ["15 expose", "serpentine step-and-repeat of 22 × 22 mm fields; field count derived", "reported (anchor) and derived"],
    ["17 / 16 etch", "depth(t) = R t; sidewall from mask recession, drawn at the reported angle", "depth, angle, selectivity reported; rate analog or n/a; redeposition template"],
    ["electrodes", "line-of-sight deposition and lift-off", "thickness reported"],
  ];
  book.code("reported"); book.code("derived"); book.code("template");
  const order = ["P", "P-comp", "P-db", "S", "V", "U", "reported", "derived", "template"] as const;
  const meta: Partial<PageMeta> = {
    title: "5.12 The Process viewer",
    description: "The making of a thin-film lithium niobate Mach-Zehnder modulator in 30 steps and two device routes, played forward or backward, with reported, derived and template status on every parameter.",
    keys: order.filter((c) => book.codes.has(c)), aside: "bias",
  };
  return { meta, flow, routes, materials, models, pops: book.pops };
};
