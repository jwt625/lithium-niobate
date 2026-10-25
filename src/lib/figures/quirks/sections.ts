// Chapter 04 section registry (route slugs, titles, figures, reference ids in list order). Single source for the chapter
// landing, section navigation, and the per-section reference lists built in +page.server.ts loads.

export interface QSection { no: string; slug: string; title: string; short: string; figs: string[]; kw: string; refs: string[] }

export const QSECTIONS: readonly QSection[] = [
  { no: "4.1", slug: "photorefraction", title: "Light that writes itself: photorefraction", short: "Photorefraction", figs: ["04-01", "04-02"],
    kw: "optical damage, bulk photovoltaic current, space-charge field, dielectric relaxation",
    refs: ["ashkin1966", "chen1968", "chen1969", "levinstein1967", "glass1974", "kukhtarev1978", "zhong1980", "bryan1984", "volk2008", "weis1985", "schwesyg2011"] },
  { no: "4.2", slug: "mgo-doping", title: "Doping the damage out: MgO, Zn, In, Sc, Hf, Zr", short: "Damage-resistant doping", figs: ["04-03"],
    kw: "MgO threshold, photoconductivity, Nb antisite replacement, stoichiometry",
    refs: ["bryan1984", "zhong1980", "furukawa1991", "furukawa2000", "furukawa2001", "volk2008", "schwesyg2011"] },
  { no: "4.3", slug: "thin-film-photorefraction", title: "Photorefraction in thin films: rings and waveguides", short: "Thin-film photorefraction", figs: ["04-04"],
    kw: "resonance blue shift, cladding, trimming, cryogenic gratings",
    refs: ["jiang2017", "liang2017", "xu2021oe", "xu2021ol", "ren2025", "hou2024", "lin2021", "he2019", "suntsov2026", "lange2026", "kuznetsov2025", "shams2022"] },
  { no: "4.4", slug: "griira", title: "Green light, infrared loss: GRIIRA, BLIIRA and polarons", short: "GRIIRA and polarons", figs: ["04-05"],
    kw: "small polarons, Nb antisite trap, green-induced infrared absorption, gray track",
    refs: ["furukawa2001", "hirohashi2007", "schirmer2009", "imlau2015", "volk2008", "schwesyg2011"] },
  { no: "4.5", slug: "damage-thresholds", title: "Optical damage thresholds: the intensity ladder", short: "Damage thresholds", figs: ["04-06"],
    kw: "photorefraction, coloration, laser-induced breakdown, fluence vs intensity",
    refs: ["volk2008", "furukawa1991"] },
  { no: "4.6", slug: "pyroelectricity", title: "Pyroelectricity: charge from heat", short: "Pyroelectricity", figs: ["04-07"],
    kw: "p3, bound surface charge, kilovolts from a bake, screening, z-cut vs x-cut",
    refs: ["savage1966", "bartholomaus1994", "cti1999", "popescu2013", "gopalan1998", "weis1985", "ieee176", "volk2008", "schwesyg2011", "schwesyg2011josab", "bulmer1986", "ren2025", "lange2026", "naranjo2005", "bourim2006", "jachalke2017", "lang2005"] },
  { no: "4.7", slug: "dc-bias-drift", title: "DC bias drift in modulators", short: "DC bias drift", figs: ["04-12", "04-08"],
    kw: "Maxwell-Wagner relaxation, cladding, LN-metal interface, TFLT",
    refs: ["yamada1981", "gee1985", "bulmer1986", "nagata1996", "nagata2004", "salvestrini2011", "puma2022", "holzgrafe2024", "lizy2024", "powell2024", "shi2025", "warner2025", "lomonte2021", "li2026photonics", "yeh2026", "alsayem2026", "liu2026acs", "volk2008"] },
  { no: "4.8", slug: "thermal-effects", title: "Thermal effects: thermo-optic shifts, thermal lenses, ring bistability", short: "Thermal effects", figs: ["04-09", "04-04"],
    kw: "dn/dT, thermal lens, thermal triangle, athermal rings",
    refs: ["moretti2005", "jundt1997", "cti1999", "zhu2021", "carmon2004", "lin2021", "sun2017", "he2019", "ling2020", "shim2026", "volk2008", "schwesyg2011"] },
  { no: "4.9", slug: "lithium-out-diffusion", title: "Lithium out-diffusion", short: "Li out-diffusion", figs: ["04-10"],
    kw: "Li2O loss, out-diffused guides, Ti indiffusion, domain inversion",
    refs: ["kaminow1973", "carruthers1974", "schmidt1974", "ranganath1977", "miyazawa1977", "burns1978", "miyazawa1979", "hua2015", "shams2022", "zhu2021", "volk2008"] },
  { no: "4.10", slug: "fabrication-pitfalls", title: "Fabrication pitfalls: practitioner notes", short: "Fabrication pitfalls", figs: ["04-11"],
    kw: "hotplate charging, e-beam discharge layers, hard masks, fast −c etch",
    refs: ["blog-ofs79", "blog-ln-properties", "blog-ebl-2024", "blog-hardmask-2018", "bulmer1986", "bourim2006", "nassau1966", "barry1998", "sones2002", "volk2008"] },
];

export const sectionBySlug = (slug: string): QSection => {
  const s = QSECTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`no chapter 04 section ${slug}`);
  return s;
};
export const qHref = (s: QSection): string => `/quirks/${s.slug}/`;
