// Site registry: chapters, other sections, build state, per-page shell defaults. Single source for the masthead nav, the
// footer wafer map, the landing index, and the chapter landing pages. Page lanes flip `built` and add `sections` here.

export type StatusCode = "P" | "P(abs)" | "P-comp" | "P-db" | "S" | "V" | "U" | "reported" | "derived" | "template" | "engine" | "rec";

/** Badge class (styles: tech.css `.b.*`, visual.css) and the footer status-key definition of each code. */
export const STATUS: Readonly<Record<StatusCode, { cls: string; def: string }>> = {
  P: { cls: "p", def: "source read at the locator; the value originates there" },
  "P(abs)": { cls: "pc", def: "only the abstract (qualifier title: only the title) read; the value is stated there" },
  "P-comp": { cls: "pc", def: "read in a compilation that cites the original; original not read" },
  "P-db": { cls: "pc", def: "CC0 database transcription of a primary source" },
  S: { cls: "s", def: "secondary source quoting the original" },
  V: { cls: "v", def: "vendor datasheet; not traceable to a specific measurement" },
  U: { cls: "u", def: "unverified: claimed value and claimed source listed; not shown as fact" },
  reported: { cls: "r", def: "as reported by the authors" },
  derived: { cls: "d", def: "computed in the page from the listed inputs" },
  template: { cls: "t", def: "display parameter, not a material property" },
  engine: { cls: "d", def: "computed by the eo-modulator-atlas FEM engine" },
  rec: { cls: "rec", def: "bibliographic record verified at the source" },
};

/** One footer-key row outside STATUS (evidence grades, chapter-specific codes): label, badge class, definition. */
export interface KeyDef { code: string; cls: string; def: string }
/** A titled footer-key definition set, shown after the status key (PageMeta.keyDefs). */
export interface KeySet { title: string; defs: readonly KeyDef[] }

/** Chapter-specific footer legends. Industry: evidence grades of chapter 08 (badge classes in
 *  src/lib/figures/industry/industry.css). History: record status of chapter 07 (data/events/history.yaml status V is
 *  published as `rec`; P, S, derived keep their chapter 07 meaning; badge classes in src/lib/figures/history/history.css). */
export const KEY_SETS = {
  industry: { title: "Evidence grade", defs: [
    { code: "F", cls: "g8 gF", def: "fact from a primary source opened and read (government data, filing, company release or product page)" },
    { code: "V", cls: "g8 gV", def: "vendor claim about its own performance, capacity, or roadmap (read, not checked)" },
    { code: "T", cls: "g8 gT", def: "trade press, opened and read" },
    { code: "C", cls: "g8 gC", def: "seen only as a snippet or aggregator; page not opened" },
    { code: "LG", cls: "g8 gLG", def: "low grade (paywalled market teaser, investor forum, AI-assisted finance article): direction only" },
    { code: "E", cls: "g8 gE", def: "estimate by this site, assumptions stated" },
  ] },
  history: { title: "Record status", defs: [
    { code: "rec", cls: "rec", def: "bibliographic record verified at the source (Crossref, publisher abstract, archival scan, or the issuing organization's page)" },
    { code: "P", cls: "hp", def: "publication confirmed; the stated link or detail comes from a secondary source" },
    { code: "S", cls: "hs", def: "secondary source only: trade press, snippet, catalog, or retrospective" },
    { code: "derived", cls: "hd", def: "computed here from cited values; the method is stated with the value" },
  ] },
} satisfies Record<string, KeySet>;

export interface Section {
  /** Number as printed, e.g. "2.2". */
  no: string;
  title: string;
  /** Route path, trailing slash. */
  href: string;
  built: boolean;
}

export interface Chapter {
  no: string;
  slug: string;
  title: string;
  built: boolean;
  /** Index keywords per depth layer (landing Index table, DevLog-003). HTML allowed. */
  kw: { l1: string; l2: string; l3: string };
  /** Poled-band SHG wavelength (um) for pages of this chapter. */
  qpm?: number;
  /** Status line on the VISUAL chapter door when built. */
  door?: string;
  sections: Section[];
}

export const CHAPTERS: readonly Chapter[] = [
  { no: "01", slug: "crystal", title: "Crystal", built: true,
    sections: [
      { no: "1.1", title: "The lattice", href: "/crystal/lattice/", built: true },
      { no: "1.2", title: "Where the polarization comes from", href: "/crystal/polarization/", built: true },
      { no: "1.3", title: "Ferroelectric constants", href: "/crystal/ferroelectric-constants/", built: true },
      { no: "1.4", title: "Composition: congruent and stoichiometric", href: "/crystal/composition/", built: true },
      { no: "1.5", title: "Intrinsic defects", href: "/crystal/defects/", built: true },
      { no: "1.6", title: "Dopants", href: "/crystal/dopants/", built: true },
      { no: "1.7", title: "Symmetry and every tensor", href: "/crystal/symmetry/", built: true },
      { no: "1.8", title: "Domains, internal field, coercive field", href: "/crystal/domains/", built: true },
      { no: "1.9", title: "Poling and periodic poling", href: "/crystal/poling/", built: true },
      { no: "1.10", title: "Domain walls up close", href: "/crystal/domain-walls/", built: true },
    ],
    kw: { l1: "R3c cell, polarity, congruent vs stoichiometric", l2: "Li / Nb / empty octahedra along c; antisite and vacancy models; T<sub>c</sub>, E<sub>c</sub> vs composition", l3: "defect equilibria, domain-wall energetics, composition-dependent tensors" } },
  { no: "02", slug: "light", title: "Light", built: true, qpm: 1.55, door: "2.1 to 2.7, L1 to L3",
    sections: [
      { no: "2.1", title: "Birefringence and the index ellipsoid", href: "/light/birefringence/", built: true },
      { no: "2.2", title: "The Pockels effect", href: "/light/pockels-effect/", built: true },
      { no: "2.3", title: "Second-order nonlinear optics", href: "/light/second-order/", built: true },
      { no: "2.4", title: "Parametric amplification and OPOs", href: "/light/parametric/", built: true },
      { no: "2.5", title: "Third-order effects", href: "/light/third-order/", built: true },
      { no: "2.6", title: "EO combs and frequency shifters", href: "/light/eo-combs/", built: true },
      { no: "2.7", title: "Waveguides in TFLN", href: "/light/tfln-waveguides/", built: true },
    ],
    kw: { l1: "birefringence, Pockels effect, frequency conversion", l2: "index ellipsoid, r and d tensors, QPM, Sellmeier models with errata", l3: "EO overlap and its normalization, coupled-mode &chi;<sup>(2)</sup>, Lugiato-Lefever combs" } },
  { no: "03", slug: "sound", title: "Sound", built: true, door: "3.1 to 3.7, L1 to L3",
    sections: [
      { no: "3.1", title: "Piezoelectricity", href: "/sound/piezoelectricity/", built: true },
      { no: "3.2", title: "Elastic constants and bulk waves", href: "/sound/bulk-waves/", built: true },
      { no: "3.3", title: "Surface and guided waves", href: "/sound/surface-waves/", built: true },
      { no: "3.4", title: "Cuts and coupling", href: "/sound/cuts/", built: true },
      { no: "3.5", title: "IDTs and SAW filters", href: "/sound/idt-filters/", built: true },
      { no: "3.6", title: "Acousto-optics", href: "/sound/acousto-optics/", built: true },
      { no: "3.7", title: "GHz phononics and piezo-optomechanics on thin-film LN", href: "/sound/phononics/", built: true },
    ],
    kw: { l1: "piezoelectricity, SAW", l2: "c, e, &epsilon; tensors; IDTs; k<sup>2</sup> by cut", l3: "Christoffel slowness, piezo-optomechanics, phonon waveguides" } },
  { no: "04", slug: "quirks", title: "Quirks", built: true, door: "4.1-4.10, 12 figures",
    sections: [
      { no: "4.1", title: "Light that writes itself: photorefraction", href: "/quirks/photorefraction/", built: true },
      { no: "4.2", title: "Doping the damage out: MgO, Zn, In, Sc, Hf, Zr", href: "/quirks/mgo-doping/", built: true },
      { no: "4.3", title: "Photorefraction in thin films: rings and waveguides", href: "/quirks/thin-film-photorefraction/", built: true },
      { no: "4.4", title: "Green light, infrared loss: GRIIRA, BLIIRA and polarons", href: "/quirks/griira/", built: true },
      { no: "4.5", title: "Optical damage thresholds: the intensity ladder", href: "/quirks/damage-thresholds/", built: true },
      { no: "4.6", title: "Pyroelectricity: charge from heat", href: "/quirks/pyroelectricity/", built: true },
      { no: "4.7", title: "DC bias drift in modulators", href: "/quirks/dc-bias-drift/", built: true },
      { no: "4.8", title: "Thermal effects: thermo-optic shifts, thermal lenses, ring bistability", href: "/quirks/thermal-effects/", built: true },
      { no: "4.9", title: "Lithium out-diffusion", href: "/quirks/lithium-out-diffusion/", built: true },
      { no: "4.10", title: "Fabrication pitfalls: practitioner notes", href: "/quirks/fabrication-pitfalls/", built: true },
    ],
    kw: { l1: "optical damage, pyroelectric charging, bias drift", l2: "photorefractive transport, GRIIRA, DC-drift mechanisms", l3: "multilayer relaxation models, MgO threshold doping" } },
  { no: "05", slug: "making", title: "Making", built: true, door: "5.1-5.12 and the Process viewer, L1 to L3",
    sections: [
      { no: "5.1", title: "Raw materials", href: "/making/raw-materials/", built: true },
      { no: "5.2", title: "Growing the crystal", href: "/making/crystal-growth/", built: true },
      { no: "5.3", title: "Wafers", href: "/making/wafers/", built: true },
      { no: "5.4", title: "Waveguides in bulk wafers", href: "/making/bulk-waveguides/", built: true },
      { no: "5.5", title: "Thin film: LNOI", href: "/making/thin-film/", built: true },
      { no: "5.6", title: "Wafer sizes and suppliers", href: "/making/wafer-suppliers/", built: true },
      { no: "5.7", title: "Patterning", href: "/making/patterning/", built: true },
      { no: "5.8", title: "Cladding and annealing", href: "/making/cladding/", built: true },
      { no: "5.9", title: "Electrodes", href: "/making/electrodes/", built: true },
      { no: "5.10", title: "Periodic poling of thin films", href: "/making/poling/", built: true },
      { no: "5.11", title: "Dicing, facets, packaging", href: "/making/packaging/", built: true },
      { no: "5.12", title: "The Process viewer", href: "/making/process-viewer/", built: true },
    ],
    kw: { l1: "boule, wafer, thin film", l2: "Czochralski, ion slicing, bonding, CMP, Ar<sup>+</sup> milling, poling", l3: "process windows, sidewall and redeposition, loss vs process" } },
  { no: "06", slug: "devices", title: "Devices", built: true, qpm: 1.55, door: "6.1 to 6.12, L1 to L3",
    sections: [
      { no: "6.1", title: "Electro-optic modulators", href: "/devices/modulators/", built: true },
      { no: "6.2", title: "Traveling-wave design: velocity, impedance, RF loss", href: "/devices/traveling-wave/", built: true },
      { no: "6.3", title: "The VπL, bandwidth, footprint trade", href: "/devices/tradeoffs/", built: true },
      { no: "6.4", title: "Frequency converters: PPLN SHG, SFG, DFG", href: "/devices/frequency-conversion/", built: true },
      { no: "6.5", title: "Optical parametric amplifiers and oscillators", href: "/devices/parametric/", built: true },
      { no: "6.6", title: "Frequency combs and frequency shifters", href: "/devices/combs/", built: true },
      { no: "6.7", title: "Quantum devices: squeezers, pair sources, converters, transducers", href: "/devices/quantum/", built: true },
      { no: "6.8", title: "Acousto-optic and optomechanical devices", href: "/devices/acousto-optics/", built: true },
      { no: "6.9", title: "RF acoustic filters", href: "/devices/rf-filters/", built: true },
      { no: "6.10", title: "Heterogeneous lasers, amplifiers, detectors", href: "/devices/heterogeneous/", built: true },
      { no: "6.11", title: "Thin-film lithium tantalate: the sibling platform", href: "/devices/tantalate/", built: true },
      { no: "6.12", title: "Records (provisional)", href: "/devices/records/", built: true },
    ],
    kw: { l1: "modulators, converters, combs, transducers", l2: "V<sub>&pi;</sub>L vs bandwidth, ring EO tuning, PPLN SHG and OPO", l3: "traveling-wave response, records with dated sources" } },
  { no: "07", slug: "history", title: "History", built: true, door: "1801 to 2026: 159 events, 4 hero stories",
    sections: [
      { no: "7.1", title: "A crystal on paper", href: "/history/a-crystal-on-paper/", built: true },
      { no: "7.2", title: "Bell Labs grows a crystal", href: "/history/bell-labs-grows-a-crystal/", built: true },
      { no: "7.3", title: "The damage that became a memory", href: "/history/damage-to-memory/", built: true },
      { no: "7.4", title: "Sound on a crystal", href: "/history/sound-on-a-crystal/", built: true },
      { no: "7.5", title: "Light in a channel", href: "/history/light-in-a-channel/", built: true },
      { no: "7.6", title: "Taming the crystal", href: "/history/taming-the-crystal/", built: true },
      { no: "7.7", title: "The internet's modulator", href: "/history/the-internets-modulator/", built: true },
      { no: "7.8", title: "Peeling the crystal", href: "/history/peeling-the-crystal/", built: true },
      { no: "7.9", title: "The thin-film renaissance", href: "/history/thin-film-renaissance/", built: true },
      { no: "7.10", title: "Into the AI data center", href: "/history/ai-data-center/", built: true },
    ],
    kw: { l1: "1801 to 2026", l2: "159 dated events", l3: "disputed priorities" } },
  { no: "08", slug: "industry", title: "Industry", built: true,
    sections: [
      { no: "8.1", title: "Rock to chip", href: "/industry/rock-to-chip/", built: true },
      { no: "8.2", title: "Who grows, slices, fabs, and builds", href: "/industry/who-makes-it/", built: true },
      { no: "8.3", title: "Wafer size and lane rate", href: "/industry/wafers-and-lanes/", built: true },
      { no: "8.4", title: "Platform comparison from the atlas", href: "/industry/platforms/", built: true },
      { no: "8.5", title: "OFC 2026 snapshot", href: "/industry/ofc-2026/", built: true },
      { no: "8.6", title: "Market size: ranges by evidence grade", href: "/industry/market/", built: true },
      { no: "8.7", title: "LN in your life", href: "/industry/in-your-life/", built: true },
      { no: "8.8", title: "Events, 2020-2026", href: "/industry/events/", built: true },
    ],
    kw: { l1: "supply chain", l2: "platform comparison from eo-modulator-atlas", l3: "market estimates by evidence grade, ecosystem by region" } },
];

/** Non-chapter sections (wafer-map dies after the chapters). */
export const EXTRAS: readonly { code: string; slug: string; title: string; built: boolean }[] = [
  { code: "L", slug: "lab", title: "Lab", built: true },
  { code: "D", slug: "data", title: "Data", built: true },
  { code: "R", slug: "library", title: "Library", built: true },
  { code: "C", slug: "colophon", title: "Colophon", built: true },
];

export const chapterHref = (c: Chapter): string => `/${c.slug}/`;

/** Wafer-map pages in die order: code, name, href when built. */
export function waferPages(): { code: string; name: string; href?: string }[] {
  return [
    ...CHAPTERS.map((c) => ({ code: c.no, name: c.title, href: c.built ? chapterHref(c) : undefined })),
    ...EXTRAS.map((e) => ({ code: e.code, name: e.title, href: e.built ? `/${e.slug}/` : undefined })),
    { code: "/", name: "Landing", href: "/" },
  ];
}

export type FooterAside = "bias" | "fem";

/** Shell settings of a page. Defaults by path (`metaFor`); a page overrides fields through `load` -> `{ meta }`. */
export interface PageMeta {
  title: string;
  description: string;
  /** Wafer-map die name of this page ("Landing", a chapter title, or an extra's title). */
  here: string;
  /** Active chapter slug in the masthead nav (none on the landing). */
  chapter?: string;
  /** Poled-band SHG wavelength, um (1.064 landing; per chapter otherwise). */
  qpm: number;
  /** Status codes listed in the footer key (the ones the page uses; default none except on the landing). */
  keys: StatusCode[];
  /** Extra footer-key definition set after the status key (chapter legends such as evidence grades); none by default
   *  except on chapter 08 pages (industry grades). A page overrides it through `load` -> `{ meta: { keyDefs } }`. */
  keyDefs?: KeySet;
  /** Fourth footer column: MZM bias meter or the FEM data credit. */
  aside: FooterAside;
  landing: boolean;
}

export const LANDING_KEYS: StatusCode[] = ["P", "P-comp", "P-db", "S", "reported", "derived", "template"];

export function metaFor(pathname: string): PageMeta {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!seg) return { title: "Lithium Niobate", description: "Lithium niobate (LiNbO3): properties with sources, live conoscope, chapter index, chronology.", here: "Landing", qpm: 1.064, keys: LANDING_KEYS, aside: "bias", landing: true };
  const ch = CHAPTERS.find((c) => c.slug === seg);
  if (ch) return { title: ch.title, description: `Lithium niobate, chapter ${ch.no}: ${ch.title}.`, here: ch.title, chapter: ch.slug, qpm: ch.qpm ?? 1.064, keys: [], keyDefs: ch.slug === "industry" ? KEY_SETS.industry : undefined, aside: "bias", landing: false };
  const ex = EXTRAS.find((e) => e.slug === seg);
  return { title: ex?.title ?? "Lithium Niobate", description: `Lithium niobate: ${ex?.title ?? ""}.`, here: ex?.title ?? "", qpm: 1.064, keys: [], aside: "bias", landing: false };
}
