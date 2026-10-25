// /lab/: index of every instrument. Flagship instruments F1-F6 (DevLog-003 instruments table) and every figure spec in
// content/chapters/*/figures.md, placed in its manuscript section and linked when that section's page exists.
import type { PageMeta } from "$lib/content/site";
import { CHAPTERS } from "$lib/content/site";
import { rawContent, rawPaths } from "$lib/content/loader";
import { parseFigures } from "$lib/figures/p09/figparse";
import CATALOG from "$lib/figures/p09/catalog.json";
import { registryPlacement, routeMatching, sectionMap } from "$lib/figures/p09/sections.server";
import { qpmPeriodSHG } from "$lib/figures/optics";

interface CatEntry { key: string; title: string; q: string; inputs: string; outputs: string; model: string; src: string }
export interface LabRow extends CatEntry { ch: string; sec: string; level: string; href: string; secTitle: string; onSection: boolean }
export interface Flagship { id: string; title: string; inputs: string; outputs: string; model: string; href?: string; where: string; vhref?: string }

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Lab",
    description: "Interactive instruments on lithium niobate: the question each answers, inputs, outputs, model and sources; full-screen phase-matching calculator and tensor rotation with frame conventions.",
  };
  const secs = await sectionMap();
  const link = (sec: string, level: string): string | undefined => {
    const s = secs.get(sec);
    if (!s?.href) return undefined;
    const a = level.toLowerCase();
    return s.anchors.includes(a) ? `${s.href}#${a}` : s.href;
  };
  const chapters: { no: string; title: string; slug: string; rows: LabRow[] }[] = [];
  for (const c of CHAPTERS) {
    const dir = rawPaths().find((p) => new RegExp(`^/content/chapters/${c.no}-[^/]+/figures\\.md$`).test(p));
    if (!dir) continue;
    const md = await rawContent(dir);
    const ms = await rawContent(dir.replace("figures.md", "manuscript.md")).catch(() => "");
    const rows: LabRow[] = [];
    const placed = new Map(parseFigures(c.no, md, ms).map((f) => [f.id, f]));
    const prefix = c.no === "01" ? "FIG-01-" : c.no === "04" ? "fig-04-" : c.no === "05" ? "F05-" : c.no === "02" ? "F2-" : `F${+c.no}.`;
    for (const e of (CATALOG as CatEntry[]).filter((x) => x.key.startsWith(prefix))) {
      const f = placed.get(e.key);
      const sec = f?.sec || (await registryPlacement(e.key));
      const level = f?.level ?? "";
      const h = sec ? link(sec, level) : undefined;
      rows.push({ ...e, ch: c.no, sec, level, href: h ?? `/${c.slug}/`, onSection: !!h, secTitle: secs.get(sec)?.title ?? "" });
    }
    chapters.push({ no: c.no, title: c.title, slug: c.slug, rows });
  }
  const crystal = routeMatching(/crystal-in-hand/);
  const platforms = secs.get("8.4")?.href;
  const qpm = qpmPeriodSHG(1.064).toFixed(2);
  const flagship: Flagship[] = [
    { id: "F1", title: "Conoscope and index ellipsoid", inputs: "cut, thickness, E (x, y, z), &lambda; or white light", outputs: "conoscopic figure, index ellipsoid, induced &Delta;n", model: "Zelmon 1997 n<sub>o</sub>, n<sub>e</sub>; r tensor (Weis &amp; Gaylord 1985); Jones calculus", href: "/#fig0", vhref: "/#v-conoscope", where: "landing, Fig. 0" },
    { id: "F2", title: "Phase matching", inputs: "process (SHG, SFG, DFG, OPO), &lambda;<sub>1</sub>, &lambda;<sub>2</sub>, T, model, order m, length L", outputs: `QPM period (1064 &rarr; 532 nm: ${qpm} &micro;m), coherence length, acceptance bandwidths, tuning curves`, model: "Sellmeier models with errata; first-order perturbation sinc<sup>2</sup>(&Delta;k L/2)", href: "/lab/phase-matching/", where: "full screen" },
    { id: "F3", title: "EO overlap of a TFLN modulator", inputs: "electrode gap, waveguide cross-section, tensor entry", outputs: "dn<sub>eff</sub>/dV, &Gamma;, V<sub>&pi;</sub>L engine vs textbook vs measured", model: 'eo-modulator-atlas FEM, vector solver (Li et al. 2026 cross-section)', href: routeMatching(/eo-overlap-li2026aa/) ? `${routeMatching(/eo-overlap-li2026aa/)}#l3` : undefined, where: "2.2 L3" },
    { id: "F4", title: "Tensors and frame conventions", inputs: "Euler angles (ZXZ); X-, Y-, Z-cut, 128&deg; Y-X; 180&deg; about z, +z flip", outputs: "rotated c, e, d, r, p, &epsilon;; components that change sign; COMSOL-ordered and JSON export", model: "IEEE Std 176-1987 axes; stored 3m tensors (Kushibiki et al. 1999; Weis &amp; Gaylord 1985)", href: "/lab/tensors/", where: "full screen" },
    { id: "F5", title: "Modulator platforms: VπL against bandwidth", inputs: "platform filter: TFLN, TFLT, SiPh, InP, BTO, polymer, bulk Ti:LN", outputs: "V<sub>&pi;</sub>L vs EO bandwidth vs year", model: "eo-modulator-atlas rows, pinned commit", href: platforms, where: "8.4" },
    { id: "F6", title: "Crystal and LNOI wafer in 3D", inputs: "crystal or LNOI wafer orientation, zoom, film thickness", outputs: "R3c lattice, thin-film interference color", model: "Hsu 1997 CIF (COD 2101845), transfer matrix", href: crystal, where: crystal ? crystal.split("/").filter(Boolean).join(" / ") : "–" },
  ];
  const total = chapters.reduce((s, c) => s + c.rows.length, 0);
  return { meta, flagship, chapters, total };
};
