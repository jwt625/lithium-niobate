// Chapter 2.7 Waveguides in TFLN: shell overrides, server-computed default markup of both variants (ring anisotropy,
// Li et al. 2026 cross-section, loss and Q ledger), and the page's popups and reference list (refs.yaml / glossary.yaml keys
// found in this page and its figure modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { RING, ringPolarSVG, ringRo, ringWaferSVG } from "$lib/figures/light/f27-ring";
import { xsecTechSVG, xsecVisualSVG } from "$lib/figures/light/f27-xsec";
import { LOSS, lossRo, lossStairSVG, lossTechSVG, qInput, fmtNg, fmtLam } from "$lib/figures/light/f27-loss";
import { logMap } from "$lib/figures/light/ctl";
import { qToLoss } from "$lib/physics/resonators.ts";
import { MS, WMAP, heldRows, modeRo, modesTechSVG, modesVisualSVG, type HeldMode } from "$lib/figures/light/f27-modes";
import type { Pop } from "$lib/content/pops";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface LatMeta { engine_commit: string; solves: number; heldout: { n: number; stats: Record<string, HeldMode> } }
/** Lattice metadata (provenance and held-out error) for the static source line, the error table and the popups. */
function latticeMeta(): LatMeta {
  return (JSON.parse(readFileSync(resolve("static/data/tfln-modes/lattice.json"), "utf8")) as { meta: LatMeta }).meta;
}

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f27-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Waveguides in TFLN",
    description: "Chapter 2.7: thin-film lithium niobate waveguides: the Li et al. 2026 rib to scale, x-cut vs z-cut, index anisotropy around an x-cut ring, mode hybridization, and propagation loss vs intrinsic Q with records and material floors.",
    keys: ["P", "V", "reported", "engine", "derived", "template"],
    aside: "bias",
  };
  const r = ringRo(RING), l = lossRo(LOSS);
  const M = latticeMeta(), commit = M.engine_commit.slice(0, 7);
  const init = {
    polar: ringPolarSVG(RING), wafer: ringWaferSVG(RING), ring: r,
    xsT: xsecTechSVG(), xsV: xsecVisualSVG(),
    lossT: lossTechSVG(LOSS), lossV: lossStairSVG(LOSS), loss: l,
    qPos: logMap(1e5, 1e9, 1000).from(LOSS.Q), qTx: qInput(LOSS.Q), aTx: qToLoss({ Q: LOSS.Q, ng: LOSS.ng, lam_um: LOSS.lam }).dB_per_m.toFixed(2),
    ng: fmtNg(LOSS.ng), lam: fmtLam(LOSS.lam),
    mSvg: modesTechSVG(MS, null), mVis: modesVisualSVG(MS, null), mRo: modeRo(MS, null), wPos: WMAP.from(MS.w),
    held: heldRows(M.heldout.stats),
    src: `Full-vector FEM (Nedelec/Lagrange order 2), eo-modulator-atlas engine, commit ${commit}, GPL-3.0-or-later: ${M.solves} solves on the grid t 300 to 900 nm, etch fraction 0.2 to 1.0, w 0.6 to 3.0 µm (geometric), sidewall 60/70/80°, λ 0.775/1.064/1.55 µm, x- and z-cut; multilinear interpolation, λ on the grid only. Stack: LN film on SiO₂ with SiO₂ cladding over the rib; no Si substrate (substrate leakage not modelled), no electrodes. LN: Zelmon 1997 congruent, 21 °C; SiO₂: Malitson 1965. Held-out set: ${M.heldout.n} random geometries solved directly.`,
  };
  const content = await lightContent(Object.values(RAW));
  const pops: Record<string, Pop> = {
    "f27-lat": {
      h: "Rib mode lattice",
      body: `Full-vector finite-element solves (eo-modulator-atlas engine, commit <span class='v'>${commit}</span>) of an LN rib on SiO<sub>2</sub> with SiO<sub>2</sub> cladding; no Si substrate, no electrodes. Bottom width = w + 2 t &middot; etch / tan(sidewall). Lab frame x lateral, y normal: x-cut propagates along crystal y (TE sees n<sub>e</sub>), z-cut along crystal x (TM sees n<sub>e</sub>). Labels follow the dominant polarization, then n<sub>eff</sub> order, checked against field overlap between neighbouring widths. Values between nodes: multilinear interpolation; held-out error in the table.`,
      badges: [["d", "engine"]],
      src: "Zelmon, Small &amp; Jundt 1997, <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>; Malitson 1965, <a href='https://doi.org/10.1364/JOSA.55.001205'>doi:10.1364/JOSA.55.001205</a>; engine: <a href='https://github.com/jwt625/eo-modulator-atlas'>github.com/jwt625/eo-modulator-atlas</a>",
    },
    "f27-flags": {
      h: "Lattice flags",
      body: "Status of the lattice nodes around the query. <b>out of range</b>: a geometry axis outside the lattice (values not shown). <b>not found</b>: no mode of this label at a node. <b>leaky</b>: n<sub>eff</sub> below the outer-slab index of its own polarization or below the cladding. <b>window edge</b>: more than 1% of the power within 10% of the solver window edge (or eigen residual too large). <b>near anticrossing</b>: TE fraction between 0.1 and 0.9 (or 0.3 to 0.7 at a node), or the label moves to another mode between widths. <b>lateral leak risk</b>: bound, but below the other polarization's slab index. These, plus a TE/TM label made ambiguous by a TE fraction of 0.3 to 0.7, are drawn as the grey band. Informational only: <b>pol. relabelled</b> (label assigned by dominant polarization, then n<sub>eff</sub> order) and <b>low track overlap</b> (field overlap with the previous width below 0.9 or not stored).",
    },
    "f27-slab": {
      h: "Slab limit",
      body: "Fundamental TE and TM index of a symmetric SiO<sub>2</sub>-clad LN slab of the full film thickness t (anisotropic, lab-frame permittivity of the chosen cut): the limit of a very wide rib.",
      badges: [["pc", "P-db inputs"], ["d", "derived"]],
      src: "Zelmon 1997 (LN), Malitson 1965 (SiO<sub>2</sub>)",
    },
  };
  Object.assign(content.pops, pops);
  return { meta, init, content };
};
