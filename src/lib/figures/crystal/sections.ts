// Chapter 01 section registry (local to the chapter: chapter landing index, prev/next links, VISUAL section cards).
// The shared registry src/lib/content/site.ts gets the same list through the integration lane (reported patch).

export interface CrSection {
  no: string;
  slug: string;
  title: string;
  /** Figures of the section (figure ids from content/chapters/01-crystal/figures.md). */
  figs: string[];
  /** One line of L1 keywords for the chapter index (HTML). */
  kw: string;
  /** L2 (model, data) and L3 (method, debate) keywords (HTML). */
  kw2: string;
  kw3: string;
}

export const CR_SECTIONS: readonly CrSection[] = [
  { no: "1.1", slug: "lattice", title: "The lattice", figs: ["Unit cell, settings, column, cleavage plane"], kw: "R3c, hexagonal and rhombohedral cells, Nb / empty / Li octahedra along +c, cleavage {01&#773;12}", kw2: "cell data, a<sub>R</sub> and &alpha; from a and c, asymmetric unit, Nb&ndash;O and Li&ndash;O distances, octahedral levels", kw3: "1966 X-ray and neutron, 1997 synchrotron refinement, three settings, c-glides, cleavage geometry" },
  { no: "1.2", slug: "polarization", title: "Where the polarization comes from", figs: ["One cell, flipped"], kw: "Li and Nb displacements in three frames, R&#773;3c reference, double well, depolarizing field", kw2: "displacements in O, Nb and centre-of-mass frames, R&#773;3c reference, 18.3 mRy double well, E<sub>dep</sub> 2.9 GV/m", kw3: "displacive vs order-disorder, Hirshfeld P<sub>s</sub>, nucleation rather than a cell flip" },
  { no: "1.3", slug: "ferroelectric-constants", title: "Ferroelectric constants", figs: ["Temperature axis"], kw: "P<sub>s</sub> 0.71 to 0.80 C/m<sup>2</sup>, T<sub>c</sub> 1140 / 1206 &deg;C, melting 1255 &deg;C, T<sub>c</sub> as composition gauge", kw2: "P<sub>s</sub> rows, two T<sub>c</sub>(c) fits, melting point", kw3: "DTA vs dielectric peak, P<sub>s</sub> 62 to 85 &micro;C/cm<sup>2</sup> in print, inconsistent T<sub>c</sub> in one review" },
  { no: "1.4", slug: "composition", title: "Composition: congruent and stoichiometric", figs: ["Composition dial"], kw: "48.4 to 50 mol% Li<sub>2</sub>O, [Li]/[Nb], T<sub>c</sub> fits, UV edge, VTE / DCCZ / TSSG", kw2: "congruent 48.38 to 48.6 mol%, melt-to-crystal law, UV-edge formulas, VTE / DCCZ / K<sub>2</sub>O / TSSG", kw3: "composition from T<sub>c</sub>, UV edge, OH band; why congruent values differ" },
  { no: "1.5", slug: "defects", title: "Intrinsic defects", figs: ["Defect and polaron gallery"], kw: "Nb<sub>Li</sub> antisites, Li vacancies, polarons, bipolarons, OH<sup>&minus;</sup>", kw2: "Li-site and Nb-site models, defect fractions, polaron centres, OH<sup>&minus;</sup> band", kw3: "model debate, Kr&ouml;ger&ndash;Vink notation, reduction test for antisites" },
  { no: "1.6", slug: "dopants", title: "Dopants", figs: ["Damage-resistance thresholds"], kw: "MgO, ZnO, In, Sc, Hf, Zr thresholds; Fe, Ti, Er, Cr sites", kw2: "threshold table, Mg site occupancy, OH band step, Fe / Ti / Er / Cr sites", kw3: "antisite removal vs Nb-site incorporation, MgO concentration basis" },
  { no: "1.7", slug: "symmetry", title: "Symmetry and every tensor", figs: ["Neumann machine", "Which face is +z"], kw: "Neumann's principle, 3m tensor forms, IEEE 176 axes, symmetry under field", kw2: "IEEE 176 axes, 3m forms of p, &epsilon;, d, r, c, s, photoelastic p", kw3: "why x is not polar, residual sign freedom, symmetry under a field" },
  { no: "1.8", slug: "domains", title: "Domains, internal field, coercive field", figs: ["Hysteresis comparator"], kw: "E<sub>c</sub> 21 / 6.0&ndash;6.5 or 2.1&ndash;2.5 / 1.8 kV/mm, E<sub>int</sub>, hexagonal domains, unipolarity", kw2: "E<sub>c</sub> and E<sub>int</sub> table, wafer voltages, switching-time law, domain shapes", kw3: "unipolarity and defect dipoles, conflicting values, temperature" },
  { no: "1.9", slug: "poling", title: "Poling and periodic poling", figs: ["Poling bench"], kw: "2P<sub>s</sub> charge, PPLN, backswitching, duty cycle, KAI kinetics", kw2: "Q/A = 2P<sub>s</sub>, milestones 1962 to 1995, poling practice", kw3: "nucleation and wall motion, switching current, thin films" },
  { no: "1.10", slug: "domain-walls", title: "Domain walls up close", figs: ["Powers of ten along a wall"], kw: "wall width 1-2 cells to 10 &micro;m strain, bound charge, wall conduction", kw2: "wall widths by method, birefringence, bound charge, wall conduction", kw3: "thick walls in congruent crystal, measuring walls, assumed widths" },
];

export const crHref = (s: CrSection): string => `/crystal/${s.slug}/`;
export const crBySlug = (slug: string): CrSection => {
  const s = CR_SECTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`no chapter 01 section ${slug}`);
  return s;
};
