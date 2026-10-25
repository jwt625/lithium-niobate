// Chapter 2.2 page-local popup overrides (registered after POCKELS_POPS, so these entries win): source lines without
// database row ids or source-file paths. POCKELS_POPS stays shared with the landing (v-false).
import type { Pop } from "$lib/content/pops";

export const P22_POPS: Record<string, Pop> = {
  li2026aa: { h: "Li et al. 2026, device d", body: "Li 2026: 9 mm x-cut TFLN MZM on silicon (300 nm film, 180 nm etch, 3.5 &micro;m top width, 6 &micro;m signal-ground gap, 1 &micro;m Au), plain G-S-G coplanar line, push-pull arms. Measured V<sub>&pi;</sub> = 2.90 V at 1550 nm, V<sub>&pi;</sub>L = 2.61 V cm.", badges: [["r", "reported"]], src: "Q. Li et al., Ultra-broadband near- to mid-infrared electro-optic modulator on thin-film lithium niobate, Nat. Commun. 17, 1138 (2026), <a href='https://doi.org/10.1038/s41467-025-67902-2'>doi:10.1038/s41467-025-67902-2</a>, p. 5, Fig. 3(b)." },
  engine: { h: "eo-modulator-atlas engine", body: "2D FEM: electrostatics (E = &minus;&nabla;&phi; per terminal volt), vector optical mode at 1550 nm normalized to 1 W, first-order Pockels perturbation with the full 3m tensor. Conventions: x lateral, y film normal, z propagation; x-cut with propagation along crystal y, so lab x = crystal c. Exported on a 0.03 &micro;m grid (241 &times; 81 nodes) for these figures.", badges: [["d", "engine"]], src: "eo-modulator-atlas FEM engine, W. Jiang, <a href='https://github.com/jwt625/eo-modulator-atlas'>github.com/jwt625/eo-modulator-atlas</a> (GPL-3.0-or-later)." },
};
