# DevLog-003: Mockup v2 spec (author feedback 2026-10-25)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Delegated to subagents |
| Scope | Rebuild `mockup/` per author feedback; data license; EO overlap deep layer from real FEM output |
| Authors | Claude Code (coordinator), at Wentao Jiang's request |

## Author feedback (verbatim intent)

1. No filler copy. Example rejected: "Real models in your browser, with every constant traceable. Launch set (P1)." Readers are expert enough to see what a page does; every sentence must carry a fact, number, definition, or an instruction needed to operate a control. Process labels (P1, launch set) never appear on pages.
2. Technical depth must get progressively deeper with real physics: explain the electro-optic tensor properly; visualize how the EO coupling (overlap) is evaluated: numerator integrand composition, normalization.
3. Data license: CC BY 4.0 (code GPL-3.0).
4. Design reference: usgraphics.com (local copies in the author's Downloads: `U.S. Graphics Company - Office.html`, `.pdf`, `_files/`). Balance interactivity and cleanliness; coherent, tight elements; no interactivity for its own sake.
5. A toggle between (a) extreme minimalist, highly technical content and (b) interactive, colorful version.
6. Coordinator does not write page code; subagents implement.

Standing rules (author's global preferences): dark default, sharp corners, dense, minimal text, details in hover tooltips, data-only plots with absolute units, no emoji, no fabricated data (placeholders must say they hold no data), localhost review only (no deployment), no commits unless asked.

## Current files (state at handoff)

- `mockup/styles.css`, `mockup/app.js`: v2 written by the coordinator (tokens, `data-mode="tech|visual"`, masthead, spine, popups, spec/idx tables, panel, record card, chapter classes `.depth .eq .mx .figrow .fig .bar`). Subagent may restyle; keep token and class names stable or update all users.
- `mockup/ln.js`: Zelmon CLN Sellmeier, QPM period, conoscope renderer (`opt.mono` for monochrome 633 nm grayscale).
- `mockup/index.html`, `mockup/chapter.html`: v1 (to be replaced).
- `mockup/data/eo-overlap-li2026aa.json`: FEM export (see L3 below).
- Local static server: `http://127.0.0.1:47613/` serves `mockup/` (already running; do not start another on that port).

## Modes

| | TECH (default) | VISUAL |
|---|---|---|
| Color | monochrome; accent = foreground | 532 nm green accent, provenance badge colors, color maps |
| Conoscope | 633 nm, grayscale | white light, interference colors |
| Effects | none | Li-vacancy lattice texture, photorefractive cursor trace with GRIIRA dimming of IR-colored marks, poled-domain rules, drifting MZM bias point, birefringent headings |
| Heatmaps | grayscale / gray diverging | perceptual (inferno-like) / diverging (red-blue) |

## Landing content spec (no prose beyond the definition)

Definition (2 sentences): trigonal ferroelectric oxide; index changes linearly with field (Pockels); large chi(2); Ti-indiffused bulk waveguides (1974) became the standard fiber-optic modulator; since 2017 sub-micron films on insulator (TFLN) carry the same physics on chips.

Specification table (value | condition | status badge with popup source):

| Property | Value | Condition | Status / source |
|---|---|---|---|
| Point group, space group | 3m, R3c | ferroelectric phase | P-comp (Weis & Gaylord 1985; Hsu et al. 1997 CIF) |
| Lattice a, c | 5.148, 13.863 Angstrom | hexagonal setting, room T | P-comp (W. L. Bond values in Abrahams et al. 1966 via Weis & Gaylord) |
| Density | 4642.8 kg/m^3 | congruent | P (Kushibiki et al., IEEE TUFFC 46, 1315 (1999), doi:10.1109/58.796136) |
| Curie temperature | 1140 C | congruent | P-comp (Volk & Wohlecke 2008, Table 1.1) |
| Melting point | 1255 C | congruent | P-comp (Volk & Wohlecke 2008) |
| Coercive field | 21 kV/mm | congruent, room T | P-comp (Volk & Wohlecke 2008, Table 7.1) |
| Transparency | 0.32 to 5 um | congruent; cutoff criterion not stated | P-comp (Volk & Wohlecke 2008, Table 1.2) |
| n_o, n_e | computed live from Zelmon (2.2111, 2.1376 at 1550 nm) | 21 C | P-db + derived |
| r33 clamped / free | 30.8 / 32.2 pm/V | 633 nm | P-comp (Turner 1966; Zook et al. 1967 via Weis & Gaylord) |
| Thermal conductivity | 3.92 W/(m K) | congruent, room T | P-comp (Volk & Wohlecke 2008) |

Fig. 0: conoscope panel (existing physics in `ln.js`; controls: transverse E 0-5 kV/mm, thickness 0.2-2 mm, E along x or y, source 633 nm or white; HUD with induced delta-n and uniaxial/biaxial state).

Index table (No. | Chapter | L1 | L2 | L3), keywords only:
- 01 Crystal | R3c cell, polarity, congruent vs stoichiometric | Li / Nb / empty octahedra along c; antisite and vacancy models; Tc, Ec vs composition | defect equilibria, domain-wall energetics, composition-dependent tensors
- 02 Light | birefringence, Pockels effect, frequency conversion | index ellipsoid, r and d tensors, QPM, Sellmeier models with errata | EO overlap and its normalization, coupled-mode chi(2), Lugiato-Lefever combs
- 03 Sound | piezoelectricity, SAW | c, e, eps tensors; IDTs; k^2 by cut | Christoffel slowness, piezo-optomechanics, phonon waveguides
- 04 Quirks | optical damage, pyroelectric charging, bias drift | photorefractive transport, GRIIRA, DC-drift mechanisms | multilayer relaxation models, MgO threshold doping
- 05 Making | boule, wafer, thin film | Czochralski, ion slicing, bonding, CMP, Ar+ milling, poling | process windows, sidewall and redeposition, loss vs process
- 06 Devices | modulators, converters, combs, transducers | VpiL vs bandwidth, ring EO tuning, PPLN SHG and OPO | traveling-wave response, records with dated sources
- 07 History | 1949 to 2026 | about 90 dated events | disputed priorities
- 08 Industry | supply chain | platform comparison from eo-modulator-atlas | market estimates by evidence grade, ecosystem by region

Instruments table (ID | Instrument | Inputs | Outputs | Model): F1 conoscope and index ellipsoid; F2 phase matching; F3 modulator (eo-modulator-atlas FEM, 11/11 vs scikit-fem); F4 tensors (IEEE Std 176-1987 axes, COMSOL-ordered export); F5 platforms (eo-modulator-atlas rows, pinned commit); F6 crystal in hand (Hsu 1997 CIF, transfer matrix).

Chronology table (10 rows, date | event | DOI-linked reference): 1949-12-15 Matthias & Remeika (10.1103/PhysRev.76.1886.2); 1965-06-14 Giordmaine & Miller OPO (10.1103/PhysRevLett.14.973); 1965-12-15 White & Voltmer IDT (10.1063/1.1754276); 1966-07-01 Ashkin et al. optical damage (10.1063/1.1754607); 1968-10-01 Chen et al. holographic storage (10.1063/1.1652580); 1974-10-15 Schmidt & Kaminow Ti indiffusion (10.1063/1.1655547); 1993-02-01 Yamada et al. field poling (10.1063/1.108925); 1998-10-19 Levy et al. crystal ion slicing (10.1063/1.121801); 2017-12-20 Zhang et al. TFLN microring (10.1364/OPTICA.4.001536); 2018-10 Wang et al. Nature 562, 101 (10.1038/s41586-018-0551-y).

Data record card (n_e at 1550 nm, CLN, computed; JSON twin; API paths). Platforms row: one line stating F5 is not rendered in the mockup. Footer: wafer-map site map, license line (GPL-3.0 code, CC BY 4.0 data), status-key legend, MZM bias meter.

## Chapter 2.2 spec: the Pockels effect, three depth layers

### L1 phenomenon
- Delta n = -(1/2) n^3 r E. Field and optical polarization along c: r33. At 1550 nm, n_e = 2.1376 (Zelmon), r33 = 30.8 pm/V, E = 1 V/um gives |Delta n_e| = 1.50e-4 (compute live, do not hardcode).
- MZM explorable with the real device li2026aa (9 mm TFLN MZM on silicon, plain G-S-G CPW, push-pull): measured Vpi = 2.90 V at 1550 nm (status reported); T = cos^2(pi V / (2 Vpi)).

### L2 the r tensor
- Index ellipsoid: (1/n^2)_ij x_i x_j = 1; Delta(1/n^2)_I = sum_j r_Ij E_j; contracted I: 1 xx, 2 yy, 3 zz, 4 yz, 5 xz, 6 xy.
- 3m form (x perpendicular to mirror plane, z along c): rows I=1..6, columns E_x, E_y, E_z: [0, -r22, r13], [0, r22, r13], [0, 0, r33], [0, r51, 0], [r51, 0, 0], [-r22, 0, 0].
- Interactive: choose field direction (x, y, z crystal) and optical polarization (x, y, z); highlight active entries; show Delta(1/n^2) components and delta n for the chosen polarization at E = 1 V/um with numbers; note off-diagonal entries rotate the principal axes.
- Coefficient table (pm/V; status P-comp via Weis & Gaylord 1985 unless noted): clamped (S): Turner 1966 r13 8.6, r22 3.4, r33 30.8, r51 28; Kaminow et al. 1980 (preferred by Weis & Gaylord) r13 7.7, r22 3.4, r33 28.8, r51 18.2. Free (T): Zook et al. 1967 r13 10.0, r22 6.81, r33 32.2; Lenzo 1966 r22 6.7; Bernal 1966 r51 32. No 1550 nm EO values in the sources held (gap).
- Device mapping: x-cut, TE, in-plane field along c: r33; z-cut, TM, vertical field: r33; r22 couples in-plane field to in-plane birefringence (the conoscope hero).

### L3 evaluating the overlap (real FEM)
Source: `mockup/data/eo-overlap-li2026aa.json`, exported 2026-10-25 by the eo-modulator-atlas engine (GPL-3.0), vector optical solver, from `sims/li2026aa/config.yaml`. Grid x -3.6..3.6 um, y 1.5..-0.9 um, dx 0.03 um (241 x 81), fields as base64 Float32 (row-major from top): `optEx` (optical E_x, V/m at 1 W), `esEx`, `esEy` (static field per terminal volt, V/m per V), `integrand` (d n_eff/dV per area, 1/(V m^2)), `integrand_r33`. Also `globals`, `surfaceIntegrals`, `geometry` (LN slab y 0-0.12 um, rib trapezoid to y 0.3 um with 3.5 um top width, Au electrodes from |x| = 3 um, 1 um thick; n_e 2.138, n_o 2.211; r values; measured Vpi 2.90 V, VpiL 2.61 V cm).

Engine results (vector solver): dn_eff/dV arm A -1.4367e-5 /V, arm B +1.4366e-5 /V (balance -0.9999); Gamma_A 0.4771; Ebar_A 7.951e4 V/m per V; gap 6 um; n_eff 1.7696; n_g 2.135 (paper's simulated value 2.13); VpiL engine 2.697 V cm; VpiL textbook 3.238 V cm; measured 2.61 V cm. Surface integrals by tensor entry: r33 -1.43186e-5, r13 -4.515e-8, r51 -3.30e-9, r22 0, total -1.43671e-5 /V (r33 99.66%, r13 0.31%, r51 0.02%).

Physics to present:
- First-order perturbation, power normalized: Delta beta = (omega eps0 / 4P) integral E* . Delta eps . E dA, P = (1/2) integral Re(E x H*) . z dA.
- x-cut TE (E approximately E_x along c): Delta eps_xx = -n_e^4 r33 E^RF_x, giving dn_eff/dV = -(n_e^4 r33 / (2 n_eff)) integral_LN e_x |E_x|^2 dA / integral |E_x|^2 dA (scalar-TE form; e_x = static field per volt).
- Conventional: Gamma = (g/V) integral_LN E^RF_x |E|^2 dA / integral |E|^2 dA; Delta n = (1/2) n_e^3 r33 Gamma V/g; push-pull VpiL = lambda g / (2 n_e^3 r33 Gamma) = lambda / (2 n_e^3 r33 Ebar).
- Normalization difference: the power-normalized form carries n_e^4 / n_eff where the conventional form carries n_e^3, a factor n_e/n_eff = 1.208 for this mode (engine VpiL ratio textbook/engine = 1.20; the residual comes from the vector components). TFLN modes have n_eff well below n_e because a large share of the power is in oxide; the conventional formula then overestimates VpiL by about 20% here (3.24 vs 2.70 vs measured 2.61 V cm).
- Figures: (a) |E_x|^2 optical, normalized; (b) e_x static field per volt; (c) integrand (signed, nonzero only in LN) with total vs r33-only toggle; geometry outlines on all; hover readout of x, y, region, values; (d) depth profile: integral over x of the integrand vs y; numbers table: grid integral vs engine dn_eff/dV, split by region (rib vs slab, computed on the grid) and by tensor entry (engine), Gamma, Ebar, VpiL engine / textbook / measured, n_e/n_eff.

## Delegation

| Lane | Owner | Files |
|---|---|---|
| D1 design + landing | subagent | `mockup/styles.css`, `mockup/app.js`, `mockup/index.html`, `DevLog/DevLog-003a-design-language.md` |
| D2 chapter 2.2 | subagent | `mockup/chapter.html`, `mockup/eo.js` (new), `mockup/chapter.css` (new, optional), `scripts/export_eo_overlap.mjs` (copy of the coordinator's export script) |
| D3 hero unit cell | subagent | `mockup/index.html` (hero only), `mockup/lattice.js`, `mockup/data/linbo3-cell.json`, `mockup/vendor/three/`, D3 block in `mockup/styles.css`, `scripts/gen_cell.py` |
| Audit | fresh-context subagent | `DevLog/audits/audit-D-mockup-v2-2026-10-25.md` |

## TODO

- [ ] D1
- [x] D2 (chapter 2.2: L1 live delta-n + MZM with measured Vpi 2.90 V; L2 3m matrix explorer with exact eigen-decomposition; L3 FEM figures a-d, numbers table; grid integral -1.4424e-5 /V vs engine -1.4367e-5 /V, +0.39%, residual unexplained; region split rib 61.4%, slab under rib 38.3%, slab outside 0.3%)
- [x] D1 (landing, design language DevLog-003a)
- [ ] D3 hero 3D unit cell (author request 2026-10-25: "the hero should also have an actual 3D unit cell of the crystal lattice")
- [ ] Audit (slop scan, physics, visuals at 1440 and 390 px, both modes, both themes)
- [ ] Data license note in README (CC BY 4.0)

## Progress log

- 2026-10-25 Spec written; FEM export done (vector solver, 1.9 s run; 523 kB JSON).
- 2026-10-25 D1 done (landing rebuilt per usgraphics study; data record moved under the spec table). D3 launched for the hero unit cell (R3c from Hsu 1997 CIF via the poling-animation experiment).
- 2026-10-25 Author refinement for D3: VISUAL = proper interactive 3D (three.js, shaded atoms, translucent octahedra); TECH = the same cell rendered as interactive ASCII art (z-buffered character grid, distinct glyph per species, line characters for edges, drag/zoom, legend); mode switch keeps camera orientation. Relayed to D3.
- 2026-10-25 D2 done; scripts/export_eo_overlap.mjs added. Audit waits for D3.
- 2026-10-25 Author bug: hero conoscope readout wraps while dragging the field slider (layout shift). Fix sent to D3 (hero owner); D2 resumed to audit chapter readouts for layout shift. Rule: no element may move or resize during interaction; verify with bounding boxes at control extremes.

## Revision: two design systems, not a reskin (author, 2026-10-25)

Author: "the tech vs visual should not be just a color reskin. They should have completely different visual expression, from button size to art to interactivity. i.e., why did you update visual to the USGS style for the tech style??" (USGS = U.S. Graphics Company reference.)

- TECH = the U.S. Graphics-derived system (DevLog-003a): extreme minimal, dense, monospace data, small controls, ASCII-art unit cell, static figures, no effects.
- VISUAL = a separate design system (DevLog-003b, new): illustrative and interactive in the spirit of ciechanow.ski / bruno-simon.com / R12 "Optic Axis" theme: large type and generous spacing, large touch-friendly controls, illustrated figures and real-time 3D (three.js unit cell, later boule/wafer/chip), theme motifs (axis spine, 3m ornaments, poled-domain rules, Li-vacancy texture, photorefractive trace with GRIIRA, drifting bias point), color from polarization optics. Same facts and numbers; layout, components, art, and interaction differ.
- Shared: content, data, physics modules, provenance badges (styled per system), URLs, mode persistence. Mode switch swaps stylesheet layer and mode-specific components (e.g. ASCII vs 3D cell, compact table vs illustrated cards) without reloading.
- Both systems keep the standing rules: sharp corners, dark default with light theme, no filler copy, no layout shift during interaction, no fabricated data.
- 2026-10-25 Author: ASCII cell rejected (single letters). Redo sent to D3: TECH landing opens with a full-viewport ASCII rendering; atoms as shaded spheres with species-specific glyph ramps and display radii, z-buffered edges/bonds/octahedra, id-buffer hover, small font for a large grid, frame < 30 ms. D2 load-time shift fixed (0.0 px with 2 s delayed fetch).
- 2026-10-25 D3 ASCII redo done (240x71 grid at 1440x900, ~5 ms/frame, species glyph ramps, 0 px shift). D4 phase 1 done (DevLog-003b, visual.css/js, visual-proto.html). D4 phase 2 launched with ownership of all mockup files: integrate VISUAL variants into index/chapter, TECH regression diff, spine/#cell overlap fix.
