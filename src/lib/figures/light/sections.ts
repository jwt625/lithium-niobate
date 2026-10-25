// Chapter 02 sections (local registry for the chapter landing, crumbs and prev/next links). The site registry
// (src/lib/content/site.ts, owned by the integration lane) receives the same list as a patch.
export interface LightSection { no: string; title: string; slug: string; href: string; figs: string; kw: string }

export const LIGHT_SECTIONS: readonly LightSection[] = [
  { no: "2.1", title: "Birefringence and the index ellipsoid", slug: "birefringence", href: "/light/birefringence/", figs: "conoscope under a transverse field; index models with errata; index ellipsoid and walk-off", kw: "n<sub>o</sub>, n<sub>e</sub>, Sellmeier models with errata, walk-off, dn/dT" },
  { no: "2.2", title: "The Pockels effect", slug: "pockels-effect", href: "/light/pockels-effect/", figs: "MZM transfer curve; FEM overlap of a TFLN modulator; r tensor and index ellipsoid", kw: "r tensor, &Delta;n = &minus;&frac12;n<sup>3</sup>rE, V<sub>&pi;</sub>L of a TFLN MZM" },
  { no: "2.3", title: "Second-order nonlinear optics", slug: "second-order", href: "/light/second-order/", figs: "SHG growth along z; d tensor by cut; phase matching and acceptance; reported efficiencies", kw: "d tensor, QPM, acceptance bandwidths, %/W/cm<sup>2</sup>" },
  { no: "2.4", title: "Parametric amplification and OPOs", slug: "parametric", href: "/light/parametric/", figs: "parametric gain; OPO threshold and output; OPO tuning", kw: "phase-sensitive gain, OPO threshold, signal/idler tuning" },
  { no: "2.5", title: "Third-order effects", slug: "third-order", href: "/light/third-order/", figs: "Kerr vs cascaded &chi;<sup>(2)</sup>; soliton comb from the Lugiato-Lefever equation", kw: "n<sub>2</sub>, cascaded &chi;<sup>(2)</sup>, Lugiato-Lefever solitons" },
  { no: "2.6", title: "EO combs and frequency shifters", slug: "eo-combs", href: "/light/eo-combs/", figs: "resonant EO comb lines; coupled-ring frequency shifter", kw: "resonant EO comb, line slope vs &beta;F, photonic molecule" },
  { no: "2.7", title: "Waveguides in TFLN", slug: "tfln-waveguides", href: "/light/tfln-waveguides/", figs: "rib cross-section and ring anisotropy; loss and Q records", kw: "x-cut vs z-cut, ring anisotropy, hybridization, loss vs Q" },
];

export const sectionBy = (slug: string): LightSection => {
  const s = LIGHT_SECTIONS.find((x) => x.slug === slug);
  if (!s) throw new Error(`unknown light section ${slug}`);
  return s;
};
export const crumbsFor = (slug: string): { label: string; href?: string }[] => [
  { label: "lithium niobate", href: "/" }, { label: "02 Light", href: "/light/" }, { label: sectionBy(slug).no },
];
/** Previous and next sections (for the page-end navigation row). */
export function neighbours(slug: string): { prev?: LightSection; next?: LightSection } {
  const i = LIGHT_SECTIONS.findIndex((x) => x.slug === slug);
  return { prev: i > 0 ? LIGHT_SECTIONS[i - 1] : undefined, next: i >= 0 && i < LIGHT_SECTIONS.length - 1 ? LIGHT_SECTIONS[i + 1] : undefined };
}
