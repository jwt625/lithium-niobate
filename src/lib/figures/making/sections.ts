// Chapter-05 section registry: number, route slug, short title, matching Process viewer steps (link-ins), figures.
export interface MkSection { no: string; slug: string; short: string; steps: string[]; figs: string[]; start?: string }

export const MK_SECTIONS: readonly MkSection[] = [
  { no: "5.1", slug: "raw-materials", short: "Raw materials", steps: ["s01_charge"], figs: ["F05-11"] },
  { no: "5.2", slug: "crystal-growth", short: "Growing the crystal", steps: ["s02_melt", "s03_pull", "s04_anneal_pole"], figs: ["F05-02"], start: "s03_pull" },
  { no: "5.3", slug: "wafers", short: "Wafers", steps: ["s05_orient_slice", "s06_lap_polish"], figs: ["F05-03"] },
  { no: "5.4", slug: "bulk-waveguides", short: "Waveguides in bulk wafers", steps: [], figs: ["F05-04"] },
  { no: "5.5", slug: "thin-film", short: "Thin film: LNOI", steps: ["s07_handle", "s08_implant", "s09_bond", "s10_split", "s11_cmp", "s12_recovery_anneal"], figs: ["F05-05", "F05-06"], start: "s10_split" },
  { no: "5.6", slug: "wafer-suppliers", short: "Wafer sizes and suppliers", steps: [], figs: [] },
  { no: "5.7", slug: "patterning", short: "Patterning", steps: ["s13r_hardmask", "s14r_coat", "s15r_expose", "s16r_mask_transfer", "s17r_ln_etch", "s18r_strip", "s13s_hardmask", "s14s_expose", "s15s_mask_transfer", "s16s_ln_etch", "s17s_clean"], figs: ["F05-07", "F05-08", "F05-09"], start: "s17r_ln_etch" },
  { no: "5.8", slug: "cladding", short: "Cladding and annealing", steps: ["s19r_clad"], figs: [] },
  { no: "5.9", slug: "electrodes", short: "Electrodes", steps: ["s20r_electrodes", "s18s_electrodes"], figs: [] },
  { no: "5.10", slug: "poling", short: "Periodic poling of thin films", steps: [], figs: ["F05-10"] },
  { no: "5.11", slug: "packaging", short: "Dicing, facets, packaging", steps: ["s21r_dice", "s19s_facets", "s22_fiber", "s23_rf"], figs: [] },
  { no: "5.12", slug: "process-viewer", short: "The Process viewer", steps: [], figs: ["F05-01"] },
];

/** Figure titles by specification id (the ids are not printed on pages). */
export const FIG_TITLES: Record<string, string> = {
  "F05-01": "Process viewer", "F05-02": "Czochralski growth and composition", "F05-03": "Wafer cut and crystal axes", "F05-04": "Proton-exchange depth, Ti recipes",
  "F05-05": "Ion slicing: implant depth and heat steps", "F05-06": "CMP thickness and film colour", "F05-07": "Pattern writing time", "F05-08": "Argon etching: sidewall and redeposition",
  "F05-09": "Loss by fabrication route", "F05-10": "Thin-film poling field", "F05-11": "From rock to chip",
};

export const mkHref = (s: MkSection): string => `/making/${s.slug}/`;
export const mkBy = (no: string): MkSection => MK_SECTIONS.find((s) => s.no === no) as MkSection;
