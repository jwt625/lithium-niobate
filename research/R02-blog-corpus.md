# R02: Author's blog corpus on LN (outside5sigma.com)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R02 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Source | `jwt625.github.io` (Jekyll, public at https://outside5sigma.com), read-only |
| Scope | All LN / TFLN / LNOI / PPLN / LiTaO3-related posts; properties post; literature post; OFS + OFC stream |

## 0. Method and caveats

- URL derivation: `_config.yml` sets `permalink: /:categories/:title/`; Jekyll lowercases categories; `:title` = filename slug. Every URL below was checked to exist in the local `_site` build. `_pages/about.md` links `https://outside5sigma.com/tutorial/ln-properties/`, which confirms the pattern.
- All 2018-2020 posts are 2025 batch imports from older notes. Front matter has `original_date`, and the body says "converted on 2025-09-27" or "2025-10-12". The import pipeline is described in the blog repo at `docs/RFD-004-google-docs-batch-import-pipeline.md`. Math was imported as small inline PNGs, not LaTeX.
- Words: the count of `\w+` tokens in the body, markup included. Use it only for relative length.
- Images: the count of image references in the body. Images were **not opened**. Each is classified from the attribution text next to it and its pixel size (`file` output). Inline equation renders are about 24 px tall. SEM frames are 1024x943.
- Corpus size: 186 entries in `_posts`. 121 OFS issue numbers exist, of which 11 have no post file: #89, 90, 97-101, 111, 112, 116, 119. `_posts/OFC2026-notes.md` has no date prefix, so Jekyll does not render it. It contains no LN content and is excluded.
- Salvage: HIGH = content or structure worth rebuilding on the site. MED = useful facts, figures or story. LOW = only incidental.

## 1. Inventory

### 1A. Core LN posts (2018-2020 imports)

| # | File (`jwt625.github.io/_posts/`) | Public URL (outside5sigma.com) | Orig. date | Topics | Words | Imgs | Salvage | Outdated / self-flagged | Copyright |
|---|---|---|---|---|---|---|---|---|---|
| A1 | `2018-04-28-ln-properties.md` | `/tutorial/ln-properties/` | 2018-04-28 (entries dated to 2020-01-27) | crystal axes, chip/cut orientation naming, eps/n, elasticity, EO, piezo, photoelastic, photorefractive, pyro, thermodynamics, NLO, patterning, HF, Voigt conventions | 2275 | 120 (119 files) | HIGH | "The above is wrong! I have a new method TBA" (radiation pressure section). "TBA: Acoustic waves" is empty. "Thermal properties / Thermal expansion" has a heading only. "Photovoltaic" is one line. "old bender NB coordinate" warns that all pre-April-2018 sims used it but never defines it. r13 sign question left open. p13/p33 typo. Small e15 vs e24 mismatch in the COMSOL vector (see 2.3). | About 75 third-party screenshots: Weis & Gaylord 1985, K. K. Wong, Nye, Boyd, IEEE 176-1987, Auld, Cleland, Yariv & Yeh, Andrushchak 2009, Jermann 1995, Sanna & Schmidt 2010, Savage 1966, Lu 2013, Physical Acoustics vol. 1, two etch papers. The **header/cover image `image25.png` is a paper figure** (Sanna & Schmidt PRB 2010 per caption). |
| A2 | `2018-04-26-ln-photonics-literature.md` | `/tutorial/ln-photonics-literature/` | 2018-04-26 | 9 papers (2002-2018): metrics and fab recipes; finesse estimates | 952 | 10 | HIGH as a dataset seed; the content itself is dated | "Things not understand yet: ... what is optical damage?". Garbled "< 0.\` dB/m". Finesse uses r = 100 um while the Zhang 2017 entry says r = 80 um. Guarino 2007 venue given as "nature" (verify). | All 10 images are paper-figure screenshots, including the cover `image8.png` (placed under Krasnokutska 2018). |
| A3 | `2018-01-03-ln-memos-simulations-2018.md` | `/tutorial/ln-memos-simulations-2018/` | 2018-01-03 to 2018-11-15 | LN piezo bender theory (d33, "curvature bender", zig-zag), electrostriction in LN, reflective-grating readout, trapezoid WG, GA designs | 4352 | 193 | MED (bender theory: "Only one parameter from the material"; precursor of the nanobender work) | "(bad)", "bad idea"; electrostriction "too small, need double check"; links to Wolfram sandbox objects (likely dead) | Mostly own COMSOL screenshots and inline equation PNGs |
| A4 | `2018-01-11-lnnb-unitcell-simulations-1801-1805.md` | `/research/lnnb-unitcell-simulations-1801-1805/` | 2018-01 to 05 | nanobeam (NB) mirror/defect unit cells, GA, sidewall tilt | 1514 | 32 | LOW-MED | "Criteria for disply is wrong!!!"; "previous mirror cell GA geometry wrong!" | own |
| A5 | `2018-01-19-lnnb-full-beam-simulations-1801-1805.md` | `/research/lnnb-full-beam-simulations-1801-1805/` | 2018-01 to 05 | full-NB GA, optomechanical (OM) coupling, PML, piezo mechanics | 3424 | 67 | LOW-MED (the "debugging in public" story) | Several "WRONG"; "Idiot! You also didn't change the coord system!!!"; JVM crash dumps pasted in | own |
| A6 | `2018-05-03-ln2dpc-unitcell-eo-simulation-201805.md` | `/research/ln2dpc-unitcell-eo-simulation-201805/` | 2018-05 | 2D PhC unit cell EO coupling, metal loss, piezo FD | 1348 | 49 | LOW-MED (rough EO estimate with r33 = 32 pm/V; slab estimate E ~ 200 GPa, nu ~ 0.4, rho = 4700) | "BUG FIX: rotation ... almost only a sign change". | own + equation PNGs |
| A7 | `2018-06-01-lnnb-full-beam-simulations-1806-1812.md` | `/research/lnnb-full-beam-simulations-1806-1812/` | 2018-06 to 12 | OM GA, anisotropic photoelastic, fishbone-hole NB, X/Y-cut piezo coupling picture, artificial loss, roto-optic | 7291 | 185 | MED (p22' vs in-plane rotation; LN vs Si photoelastic estimate (2.2/3.5)^4 ~ 0.156 index penalty vs 2-3x from p22'; Y-cut ZXY vs X-cut nZYX polarization picture; loss model (1+i/Q)) | "The radiation pressure code is definitely wrong"; "(wrong, to be updated)"; "The LN crystal coordinates were wrong!"; TBA | own |
| A8 | `2018-06-23-lnnb-unitcell-simulations-1806-1812.md` | `/research/lnnb-unitcell-simulations-1806-1812/` | 2018-06 to 2019-01 | fishbone unit cells, mode naming, in-plane rotation bands | 4664 | 143 | LOW-MED | TBA; "used the wrong 'a'" | own; links a hosted own PDF |
| A9 | `2018-07-18-ln-2d-phonon-shield-simulation-180718.md` | `/research/ln-2d-phonon-shield-simulation-180718/` | 2018-07 to 2019-03 | 2D phononic shield bands, single-mode phonon WG | 603 | 23 (1 GIF) | MED (bandgap 1.783-2.185 GHz on LNX; HSQ-masked Y-cut sidewall 15-20 deg) | "This is Z cut, need to redo" | own |
| A10 | `2018-08-08-phonon-shield-1d-simulation-180808.md` | `/research/phonon-shield-1d-simulation-180808/` | 2018-08 to 2020-11 | 1D phonon shield | 307 | 10 | LOW-MED (gap 1.442-2.206 GHz; LNX 1.598-2.32 GHz) | 2020-11-08: "Okay the old numbers are real." | own |
| A11 | `2018-08-20-lnnb17-fab-si-hardmask-pattern-test-180820.md` | `/research/lnnb17-fab-si-hardmask-pattern-test-180820/` | 2018-08-20 to 24 | a-Si hard mask on LN (Y-cut), CSAR EBL dose sweep, ion mill | 1271 | 24 (22 SEM, 2 photos) | MED (an honest failure story; conclusion "a-Si cracks, doesn't get etched homogeneously") | "Horrible.", "What happened???" | own SEMs (high visual value). |
| A12 | `2018-09-12-rotation-of-photoelastic-tensor-and-piezoelectric.md` | `/tutorial/rotation-of-photoelastic-tensor-and-piezoelectric/` | 2018-09-12 to 2020-05-15 | Mathematica Voigt<->tensor conversion and rotation; COMSOL Euler (ZXZ) semantics; LNY/LNX rotation matrices; p22'; d-tensor rotation | 1936 | 20 | HIGH (directly feeds an interactive tensor rotator) | "20181105, this is wrong!" (LNX in-plane plot, replaced 2018-11-06); "At 45(wrong) 135 deg"; theta = 0 convention changed (note added 2019-11-11); "20200515, rotation of elasticity matrix" has a heading only | Screenshots: Jasper Chan thesis p. 97, Andrushchak 2009, Dixon 1967 (GaAs). Rest own. |
| A13 | `2018-10-13-roto-optic-effect-estimation-on-lnnb-181013.md` | `/research/roto-optic-effect-estimation-on-lnnb-181013/` | 2018-10-13 | roto-optic effect from birefringence | 414 | 15 | MED (birefringence-only roto-optic gives only off-diagonal d-eps, proportional to anisotropy; g_RTO <~ 4% of g_PE for that geometry; COMSOL 0.7 kHz/sqrt(2)) | none | own + equation PNGs |
| A14 | `2018-11-04-ln-on-sapphire-phonon-waveguide-sim-201811.md` | `/research/ln-on-sapphire-phonon-waveguide-sim-201811/` | 2018-11 | LN-on-sapphire phonon WG confinement | 459 | 11 | MED (origin of the LN-on-sapphire (LiSa) phononic circuit line) | TODO. | own |
| A15 | `2018-12-21-thermal-shift-numerical-calculation-20181221.md` | `/research/thermal-shift-numerical-calculation-20181221/` | 2018-12 | quadratic thermo-optic shift model | 191 | 8 | LOW (alpha/2pi = 34 Hz/n^2 used) | - | own |
| A16 | `2019-01-08-lnnb-paper-outline-and-figures-20190108.md` | `/research/lnnb-paper-outline-and-figures-20190108/` | 2019-01 to 03 | outline of the LN piezo-optomechanical crystal paper (Optica 2019) | 1118 | 20 | MED (personal story: how a paper is built) | TODOs; open questions ("what journal are we aiming at?") | own figures |
| A17 | `2019-01-09-lnnb-full-beam-simulation-201901.md` | `/research/lnnb-full-beam-simulation-201901/` | 2019-01 | thin unit cell, optical GA | 300 | 5 | LOW | "cyclic symmetry seems to give the wrong mode profile" | own |
| A18 | `2019-03-19-lnx-pnc-to-wg-20190319.md` | `/research/lnx-pnc-to-wg-20190319/` | 2019-03 | phononic crystal (PNC) cavity to WG leakage | 608 | 20 (6 GIF) | LOW-MED (mode-animation GIFs) | none | own |
| A19 | `2019-06-13-piezoelectric-k-square.md` | `/tutorial/piezoelectric-k-square/` | 2019-06 to 09 | k^2 definitions (Berlincourt, Mason, Ulitko), COMSOL energy and variable conventions | 2653 | 72 | MED-HIGH (definitions; COMSOL local vs global variable map; open/short eigenmode k^2) | "This document is still messy, in development."; v1 "DOES NOT WORK, k\^2 seems very wrong"; negative E*D unresolved; TODO read Ulitko and Mason | Screenshots of Hashimoto, Jaffe, IEEE 1987, Piazza 2017, Ding & Chen, Auld. |
| A20 | `2019-09-03-piezoelectric-eigen-mode-sim-with-different-es-boundary-on-metal.md` | `/tutorial/piezoelectric-eigen-mode-sim-with-different-es-boundary-on-metal/` | 2019-09 | COMSOL terminal BCs in eigenmode sims | 640 | 16 | MED (voltage terminal = short = resonance; charge terminal with Q0 = 0 = open = anti-resonance; k^2 = 20.7% example) | - | own |
| A21 | `2019-09-19-tilt-mirror-with-bender.md` | `/research/tilt-mirror-with-bender/` | 2019-09 | Z-cut LN bender tilting a mirror; DMD comparison | 784 | 17 | LOW-MED | "no, wrong! The field is mirrored" (fixed) | own |
| A22 | `2019-09-27-comparing-ln-and-litao3.md` | `/tutorial/comparing-ln-and-litao3/` | 2019-09-27 | LN vs LiTaO3: c, rho, d (COMSOL library) | 336 | 0 | MED (text values; conclusion "LTO is not as piezoelectric") | Values are "from COMSOL" with no primary citation. "sqrt(M/rho)" leaves M undefined. | none (text only) |
| A23 | `2020-01-28-estimating-a-nanomech-resonator-with-a-jj-or-tuning-it-by-bc.md` | `/tutorial/estimating-a-nanomech-resonator-with-a-jj-or-tuning-it-by-bc/` | 2020-01 to 02 | piezo resonator plus circuit (JJ/LC), COMSOL external circuit | 3866 | 84 | LOW (LN incidental) | "Still giving bullshit results"; several open "why???" | own |

### 1B. Later native posts with LN content

| # | File | URL | Date | LN content | Words | Imgs | Salvage | Issues |
|---|---|---|---|---|---|---|---|---|
| B1 | `2024-10-13-yapping-on-ebeam-lithography.md` | `/tutorial/yapping-on-ebeam-lithography/` | 2024-10-13 | TFLN HSQ mask + etch process development with a labmate; 5-10 nm Al discharge layer on dielectrics such as LN; single-layer CSAR liftoff; SEMs of LN OMC (links Optica 6(7) 845) and LN-on-SOI (links Nat. Phys. s41567-023-02129-w); LN-on-sapphire SEM | 11599 | 29 | MED-HIGH (fab and personal story) | One SEM was colorized by a named labmate: credit or ask permission |
| B2 | `2025-04-02-how-to-excite-tiny-mech-wave.md` | `/tutorial/how-to-excite-tiny-mech-wave/` | 2025-04-02 | piezo transduction scaling (LN vs AlN), GHz phononic circuits on TFLN, mechanical WG tapers | 2813 | 20 | MED (accessible intuition) | Cites third-party documents; link DOIs. |
| B3 | `2025-12-25-how-to-hold-fibers.md` | `/blog/how-to-hold-fibers/` | 2025-12-25 | fiber-coupling photos; cites Sarabalis 2021 thesis (searchworks 13974185), Franken 2025 (10.1063/5.0231827), Qi 2025 (arXiv 2505.23411), Liu 2025 (arXiv 2507.20552), Harvard SEAS 2023 HyLab TFLN chip | 4011 | 110 | LOW-MED | Images of others' setups |
| B4 | `2026-04-04-OFC2026.md` | `/blog/OFC2026/` | 2026-04-04 | NanoLN booth: 6/8 in 300-900 nm TFLN on SiO2/Si, 12 in TFLN; HyperLight "TFLN Chiplet" booth | 26103 | 191 | LOW-MED (industry signals) | Vendor booth/slide photos with OCR. Do not reuse the photos; cite only public statements. |
| B5 | `2026-08-20-silicon-photonics-and-co-packaged-optics.md` | `/tutorial/silicon-photonics-and-co-packaged-optics/` | 2026-08-20 | No TFLN content; only a thin-film LiTaO3 AWG figure (arXiv 2504.12917) | 7405 | 63 | LOW for LN (good cross-link for modulator, lane-rate and CPO context) | none |
| B6 | `_pages/about.md`, `_data/projects.yml` | `/about/` | n/a | PhD summary (thesis purl.stanford.edu/mx877vv9870); LN project cards: Optica 2019 LN piezo-optomechanics, Nat. Commun. 2020 bidirectional transduction, Commun. Phys. 2020 nanobenders, PR Applied 2021 GHz phononic circuits on LiSa; eo-modulator-atlas card | n/a | n/a | MED (already-written public blurbs and author-owned project images) | about.md says "PhD ... from 2017 to 2022" (see Uncertainties) |

### 1C. OFS weekly stream (summary; full item list in section 4)

- 121 issues (2024-06-30 to 2026-10-20), all at `/ofs/weekly-OFS-N/`, category OFS.
- Keyword hits appear in about 57 posts. From OFS-66 (2025-09-28) on, every issue carries a "Projects" footer linking `/tutorial/ln-properties/`. These footers are boilerplate and excluded.
- 83 substantive LN/LT items remain (82 OFS rows plus the OFC 2026 row in section 4): papers, industry news and opinion. They form a curated reading stream with the author's one-line takes.

## 2. Properties post: knowledge structure (`/tutorial/ln-properties/`)

### 2.1 Section map, with text vs image content

| Section (as in post) | Attributed source | Text values present? | Image files (`assets/images/imported/ln-properties/`) | Notes / salvage |
|---|---|---|---|---|
| Material coordinates and symmetries | Weis & Gaylord, Appl. Phys. A 1985; Sanna & Schmidt, PRB 2010 | no | image77 (W&G crystal structure), image25 (Sanna & Schmidt; also the cover) | Redraw the crystal structure as 3D (site centerpiece) |
| LNX chip and pieces orientation (X-cut) | own | partial (naming rules) | image103, image67, image52, image42 | Defines **nZYX / "coordA"** (see 2.2) |
| A labmate's LNX nanobeam orientation: YZX | own | name only | image115, image64 | Third convention in use |
| LNX 45 deg (2018-10-31) | own | no | image82, image28 | Later labeled "45(wrong) 135 deg" in A12 |
| LNY chip orientation (Y-cut) | own | partial | image73, image60, image94 | Defines **ZXY**, "equiv to (pi/2, pi/2, 0)" |
| old bender NB coordinate | own | no | none | Warning only: "all old simulations (most 2018 April and pre-April sims) are with this coordinate!" The convention is never defined. |
| Permittivity, refractive index | W&G 1985 | only "T: unclamped (low freq), S: clamped (high freq)" | image88, image44 | Tables are image-only |
| Elasticity | W&G 1985; K. K. Wong; Nye p. 136 (symmetry of c_ij, s_ij) | COMSOL D-matrix ordering only | image1 (small), image38, image47, image31 (COMSOL entry), image79, image51 (Wong), image68, image34 (Nye) | Tables are image-only |
| Electro-optic effect | K. K. Wong; W&G 1985 | the r13 sign remark; the secondary-effect quote | image58, 118, 101, 104, 113, 53 (Wong); image80, 96, 81 (W&G) | See 2.3 for the r13 discrepancy |
| Magnitude of second order E-O effect | own (from W&G values) | yes: "largest component ~ 1.3e-11 m/V", "largest first-order component ~ 3e-11 m/V", "comparable" | image2, image3, image91, image71 | "Second order" here means the indirect contribution (converse piezo + photoelastic), not the quadratic effect. Relabel. |
| Electro-optic coupling | own | no (equation PNGs) | image4-7 | Retype as LaTeX |
| Piezoelectric and converse piezoelectric | W&G 1985; K. K. Wong | **yes**: full COMSOL `eES` 3x6 vector and its ordering | image8, 9 (small), 36, 46, 41 (W&G); 39, 95, 84, 100 (Wong) | Only full tensor given as text in this post |
| Photoelastic effect | W&G 1985; K. K. Wong; Andrushchak et al., JAP 106, 073510 (2009) | yes: secondary-effect offsets 0.043 and 0.154 | image10, 70, 93, 111, 65 | Typo: "p13(pri)=p13(meas)-0.043, and p13(pri) = p13(meas) - 0.154". The second is presumably p33 (the text says p13 and p33 are affected). Verify against W&G. |
| Photoelastic coupling | own | no | image11-13 | Retype |
| Photorefractive effects | K. K. Wong; Jermann et al., JOSA B 1995; Boyd, Nonlinear Optics p. 525 | mechanism text; pump 514.5 nm / probe 632.8 nm; "Fe doped ... same OOM, ~ 50% higher" | image90, 78, 62, 61, 50, 85, 89, 30 | Good explainer seed (links to the site's "charge screening / bias drift" theme) |
| Photovoltaic effect | none | "Mostly for wavelength ~< 500 nm" | none | Stub |
| Pyroelectric effect | Huihui Lu et al. 2013; W&G; Savage 1966; Mostafa et al. 2006 | "But this is at 25 deg C"; "heating Z-cut LN to 120C could expose ZEP" | image37, 116, 117, 99, 55 | Practical fab hazard, pairs with OFS-79 |
| Radiation pressure coupling for anisotropic media | own | derivation text | image14-22 | **Self-flagged wrong**: "The above is wrong! I have a new method TBA." Do not reuse. |
| TBA: Acoustic waves; Thermal properties / Thermal expansion | K. K. Wong (stated) | none | none | Empty |
| Nonlinear optics | Boyd | no | image87, 56 | Image-only |
| Thermodynamics of equilibrium properties (2018-10-05) | Nye, Physical Properties of Crystals | yes: isothermal vs adiabatic compliance "differ by ~ 1%"; coupled-effect explanation; "There are too many. Go read the book." | image86, 29 (Heckmann-type diagram), 63, 66, 54, 35, 107, 27 | Redraw the coupling diagram interactively (high value) |
| Patterning | none | yes: ion milling depends on residual partial pressure; O2 oxidizes metal or ashes resist; "Li doesn't form volatiles with Br or Cl" | none | Verify the halide-volatility claim before reuse |
| HF clean/etch | Physica B 2006 ("pyroelectric electron emission ..."); "Microstructuring of LN using differential etch-rate between inverted and non-inverted ferroelectric domains"; own SEMs | brief context (Z axis parallel to NB, chip annealed) | image57, 48 (papers); image83, 26, 72, 59 (own SEM, 1024x943) | - |
| Single domain crystal vs polycrystalline | Physical Acoustics vol. 1 p. 218 | no | image33, 40 | Image-only |
| Convention of 2s | IEEE 176-1987; Auld; Cleland, Foundations of Nanomechanics p. 178; Yariv & Yeh; Nye pp. 134, 114 | **yes** (rules, see 2.2) | image119, 49 (IEEE); 102 (Auld); 24, 98, 109, 105, 43 (Cleland); 69 (Yariv & Yeh); 112, 74, 76, 75, 106, 108, 92 (Nye) | HIGH: a standalone explainer |
| Relations between piezoelectric constitutive equations | IEEE 176-1987 | no | image45, 32, 97, 110, 114, 23 | Retype the four forms and the conversion relations |
| Reference | none | "Main: Gaylord." (first author is Weis); "Found a new source on 20200127: ieeexplore document 171403" | none | Identity of IEEE doc 171403 not resolved here |

Image classification (approximate, inferred from captions and sizes):

| Class | Count | Examples | Reuse |
|---|---|---|---|
| Third-party screenshots | ~75 | W&G 15, Wong 14, Nye ~17, IEEE 7, Jermann 6, Cleland 5, Boyd 3, others 1-2 each | Not as-is; retype data and redraw with citation |
| Inline equation renders | ~23 | image1-23, 10-36 px tall | Own math; retype as LaTeX/KaTeX |
| Own orientation diagrams and COMSOL screenshots | ~14 | image103, 67, 52, 42, 115, 64, 82, 28, 73, 60, 94, 31, 91, 71 | Redraw as interactive 3D |
| Own SEMs | 4 | image26, 59, 72, 83 | Reusable after stripping internal labels |

### 2.2 Conventions recorded (verbatim meaning; cross-post sources noted)

- **Orientation naming**: three letters give the crystal axes that lie along global (COMSOL) x, y, z, in that order. An `n` prefix negates the axis it precedes.
  - **nZYX** (X-cut, "coordA"): applies when nanobeams are perpendicular to the wafer flat and run along COMSOL x. Means "negative crystal Z along x and crystal Y along y".
  - **ZXY** (Y-cut, "X perp. to the NB"): "crystal Z along x and crystal X along y". Stated "equiv to (pi/2, pi/2, 0)". Nanobeams (crystal Z) are perpendicular to the long edge, and the long edge is parallel to the wafer flat.
  - **YZX**: a labmate's LNX nanobeam convention. A7 has a 2018-09-06 entry "LNNB mechanics on YZX coordinate".
  - **In-plane rotation**: "LNX 45 deg" (2018-10-31) was later relabeled "45(wrong) 135 deg" in A12. theta = 0 means "Z parallel to x" in A12, but "X parallel to x" in the nanobender paper convention (note added 2019-11-11). **The site must state one convention explicitly.**
- **COMSOL rotated systems (A12)**: Euler angles use the ZXZ convention, which Mathematica supports and MATLAB needed by hand. "the Euler rotation rotates the coordinates, hence the same matrix rotates quantities in rotated coordinates to the global coordinates".
  - LNY + in-plane theta: `RotationMatrix[theta,{0,0,1}].EulerMatrix[{-pi/2,-pi/2,pi},{3,1,3}]`.
  - LNX: `EulerMatrix[{pi/2,-pi/2,-pi/2},{3,1,3}]`, with ZXZ angles (theta - pi/2, pi/2, pi/2).
- **COMSOL scripting order**:
  - 6x6 symmetric D (stiffness) is `{D11, D12, D22, D13, D23, D33, ..., D56, D66}`, i.e., the upper triangle column by column.
  - The 3x6 coupling `eES` is `{e11, e21, e31, e12, e22, ..., e26, e36}`, i.e., column-major.
- **COMSOL variable frames (A19)**:
  - Global frame: `cEg11`, `eESgX1`, `solid.epsilonrXX`, `es.epsilonrS11`, `eXY`, `sxy`.
  - Material/local frame: `D11`, `cE11`, `eES11`, `solid.epsilonrS11`, `el12`, `sl12`.
  - Example: es.epsilonrS22 = 29.16 while es.epsilonrS11 = es.epsilonrS33 = 43.6 (global), whereas solid.epsilonrS33 = 29.16 (local), for a rotated LN domain.
  - Voltage terminal = short; charge terminal (Q0 = 0) = open (A20).
- **Voigt index map (A12 code)**: `iiarray={1,2,3,2,3,1}`, `jjarray={1,2,3,3,1,2}`, i.e., 4 = 23, 5 = 31, 6 = 12. The d tensor takes a factor 2 for indices 4-6 (`coef=2`) when converting to and from the rank-3 tensor.
- **"Convention of 2s"**: "the price you pay by writing higher rank tensor with some symmetry to artificial matrix":
  - extra 2 and 4 for compliance s;
  - extra 2 for strain (S or epsilon) and piezoelectric d;
  - no extra 2 or 4 for stress (T or sigma), stiffness c and piezoelectric e.
  - "IEEE 1987 standard on piezoelectricity is the best!" Auld: "No extra 2 for c."
- **r13 sign discrepancy**: "There's one sign difference (r13) comparing to K. K. Wong? comparing to piezoelectric matrix, I trust Weis and Gaylord". This is unresolved. Hand to R06 to resolve against primary data and axis/sign conventions (IEEE 176-1987 +Z definition). Related: OFS-46 (2025-05-12) Sankey diagram of LN EO coefficients carries the warning "two signs are wrong". **Signs are a known weak point of the old material.**
- **Clamped vs unclamped**: superscript T = unclamped (low frequency), S = clamped (high frequency).
- **Secondary effects**:
  - Secondary EO = converse piezo + photoelastic (quoted from W&G).
  - Secondary photoelastic = piezo + linear EO. It is significant for p13 and p33.

### 2.3 Text values extractable now (all need re-verification against primary sources by R06)

| Quantity | Value as written | Post | Source stated | Flag |
|---|---|---|---|---|
| e (stress-charge), crystal frame, COMSOL order {e11,e21,e31,e12,...,e36} | {0, -2.53764, 0.193644, 0, 2.53764, 0.193644, 0, 0, 1.30863, 0, 3.69548, 0, 3.69594, 0, 0, -2.53384, 0, 0} C/m^2 | A1, A19 | COMSOL material library (implied) | The trigonal symmetry pairs differ slightly: e15 3.69594 vs e24 3.69548, and e22 2.53764 vs -e16 2.53384. Rounding or rotation artifact. |
| d (strain-charge), COMSOL order | e.g. d22 = 2.1e-11, d31 = -1e-12, d33 = 6e-12, d15 = 6.8e-11 C/N | A19, A22 | COMSOL | A19: "COMSOL's e is much more accurate than d". d31 and d33 look low-precision: 1-significant-figure values. |
| c (stiffness), LN, upper triangle | c11 = 202.897, c12 = 52.9177, c13 = 74.9098, c33 = 243.075, c14 = 8.99874, c44 = 59.9034, c66 = 74.8772 GPa | A22 | COMSOL | c14 vs c56 (8.99874 vs 8.98526) and c44 vs c55 (59.9034 vs 59.9018) differ slightly |
| c, LiTaO3 | c11 = 232.966, c12 = 46.8904, c13 = 80.2342, c33 = 275.364, c14 = -11.0267, c44 = 93.8995, c66 = 93.038 GPa | A22 | COMSOL | Sign of c14 is opposite to the LN entry; check the convention |
| d, LiTaO3 | d22 = 7e-12, d31 = -2e-12, d33 = 8e-12, d15 = 2.6e-11 C/N | A22 | COMSOL | Low precision |
| density | LN 4700, LT 7450 kg/m^3 | A22 | COMSOL | "sqrt(M/rho)" velocities 6570 m/s (LN), 5592 m/s (LT); M undefined |
| clamped rel. permittivity | 43.6 (ordinary), 29.16 (extraordinary) | A19 | COMSOL | none |
| photoelastic (LN) | p11 = -0.021, p12 = 0.06, p13 = 0.172, p14 = -0.052, p31 = 0.141, p33 = 0.118, p41 = -0.109, p44 = 0.121 | A12 | Ambiguous: placed after the Andrushchak 2009 and Si (Chan thesis) images. A7 says the same p22' values were first computed with the Yariv & Yeh p. 326 tensor. | Resolve the source before use |
| p22' at 135 deg in-plane | LNX 0.304; LNY 0.223 (closed-form expressions given) | A7, A12 | derived | Labeled "45" in A7 and "45(wrong) 135" in A12 |
| r33 | 32 pm/V (rough estimate); "~30 pm/V" | A6; OFS-86 | none stated | none |
| secondary EO magnitude | ~1.3e-11 m/V vs first-order ~3e-11 m/V | A1 | derived from W&G | Relabel as "indirect" |
| photoelastic secondary offsets | 0.043 (p13), 0.154 (p33, presumed) | A1 | W&G quote | Typo |

## 3. Literature post (`/tutorial/ln-photonics-literature/`)

### 3.1 Papers, numbers and fab recipes as recorded (2018-04-26)

| # | Paper (as recorded) | Year | Venue (as recorded) | Platform | Key numbers (as recorded) | Fab recipe (as recorded) | Issues |
|---|---|---|---|---|---|---|---|
| L1 | Hanxiao Liang, Qiang Lin, "LN PC 1D" | 2017 | Optica | 300 nm X-cut on 2 um BOX on Si | Q_meas ~ 1.09e5; Q_sim ~ 6e6, 5.2e5; photorefraction ~ 0.64 GHz/aJ, ~ 84 MHz/photon; "quenching of photorefraction"; mech mode 1.003 GHz, Q ~ 1465, g_OM ~ 71 kHz | ZEP-520A; Ar-ion mill; over-etch for fine structure and smooth sidewalls; sidewalls 45 deg inside, 75 deg outside | Title abbreviated |
| L2 | D. S. Hines, K. E. Williams, "Patterning of wave guides in LiNbO3 using ion beam etching and reactive ion beam etching" | 2002 | n/a | bulk LN | image only | image only | No text content |
| L3 | Wei C. Jiang, Qiang Lin, "LN disk optomechanics" | 2016 | Scientific Reports | Z-cut NanoLN 400 nm on 2 um BOX | f_m ~ 357 MHz; m_eff ~ 150 pg; g_OM ~ 11.6 kHz | ~1 um ZEP-520A, 170 C bake 2 min; JEOL 9500, 300 uC/cm^2; ion mill ~600 V beam, ~35 nm/min | Title abbreviated |
| L4 | Andrea Guarino, Peter Gunter, "Electro-optically tunable microring resonators in lithium niobate" | 2007 | "nature" | z-cut, sub-um film bonded with BCB | R = 100 um; mod. depth ~7 dB; F ~ 5; Q ~ 4e3 ("limited by implantation-induced defects and scattering losses"); 0.14 GHz/V | BCB bonding | Venue to verify. Author comment: "Device looks horrible". |
| L5 | Mian Zhang, Marko Loncar, "Monolithic ultra-high-Q lithium niobate microring resonator" | 2017 | Optica | NanoLN 600 nm X-cut on 2 um BOX | 2.7 dB/m; Q ~ 1e7; r = 80 um; bending loss ~ 9.3 +- 0.9 dB/m; intrinsic material loss "< 0.\` dB/m" (garbled) | HSQ multi-pass EBL; Ar ion mill tuned to minimize redeposition; 350 nm rib / 250 nm slab; 1.5 um PECVD SiO2 | Finesse calc uses r = 100 um |
| L6 | I. Krasnokutska, A. Peruzzo, "Ultra-low loss photonic circuits in lithium niobate on insulator" | 2018 | Optics Express | NanoLN 500 nm Z-cut rib on 2 um BOX | ~0.4 dB/cm; r ~ 80 um; w ~ 1 um; sidewall roughness < 2 nm RMS; ~75 deg sidewall; quote: MgO:LNOI "170x higher optical damage threshold" | 10 nm sputtered Cr anti-charging before spin; 60 nm e-beam Cr mask, NMP liftoff; CHF3 + Ar, selectivity metal:LN = 1:7; 3 um PECVD SiO2 | none |
| L7 | Cheng Wang, Marko Loncar, "SHG in nano-structured thin-film LN waveguides" | 2017 | Optics Express | 400 nm X-cut NanoLN | ~3.0 dB/cm; ~41 %/W/cm^2 | 800 nm PECVD a-Si mask; EBL, Si RIE, Ar-ion LN etch; 80 C KOH strip; 3 um PECVD SiO2 | none |
| L8 | Cheng Wang, Marko Loncar, "Integrated high quality factor lithium niobate microdisk resonators" | 2014 | Optics Express | thin-film LN microdisk | Q ~ 1e5; SHG ~ 0.109 /W; roughness < 5 nm RMS; quote: 0.28 GHz/V and Q ~ 5e4 means 7 V switches on/off resonance | 15 nm Ti (adhesion and conduction); HSQ FOx-16; second blanket e-beam exposure hardens the mask; Ar+ ECR-RIE (NEXX Cirrus 150), 200 W RF, ~180 V DC bias, ~30 nm/min, 300 nm etched; HSQ strip 2 min 5:1 BOE | none |
| L9 | Cheng Wang, Marko Loncar, "Nanophotonic lithium niobate electro-optic modulators" | 2018 | Optics Express | 700 nm X-cut NanoLN on 2 um BOX; w = 900 nm, h = 400, s = 300, g = 3.5 um | VpiL 1.8 V cm (MZI); ~40 Gbps; 7 pm/V (ring); 94% energy in LN; ER 3 dB (racetrack, Q ~ 8000) and 8 dB (MZI); 5 dB/facet coupling | 800 nm PECVD a-Si mask; HSQ EBL; Si RIE; Ar ion mill ~270 V bias, ~30 nm/min; ~400 nm etch, 300 nm slab; 30% KOH 80 C; 15 nm Ti / 300 nm Au e-beam evap, PMMA/MMA liftoff; 1.5 um PECVD SiO2; PMMA-masked 5 min BOE, second liftoff for top electrodes; diced and polished | none |
| L0 | Finesse estimates (preamble) | n/a | n/a | n/a | L5 ring: alpha = 2.7 dB/m, r = 100 um, F = 1.6e4. Q ~ 200k nanobeam with L_rt = 40 um: F = 3.9e3. | n/a | Arithmetic checks out for r = 100 um. With L5's own r = 80 um, F is about 2.0e4. The NB result implies v_g ~ 1.5e8 m/s, which the post does not state. |

### 3.2 How to turn this into a modern, sortable, cited dataset

- **Do not publish the 2018 notes as-is.** Re-extract every number from the paper, keeping the 2018 note only as a pointer. The notes contain transcription issues (L0, L5) and abbreviated titles.
- **Reuse the eo-modulator-atlas schema (see R04).** Per `_data/projects.yml`, the public atlas already covers "233 papers (2012-2026) and 519 device rows across lithium niobate, lithium tantalate, barium titanate, EO polymer, InP, silicon". The literature dataset should be an LN-filtered, fab-annotated view or extension of it, not a parallel database.
- **Proposed record** (JSON Lines plus CSV; one row per device):
  - Identity: `id`, `doi` (resolved via Crossref, never typed by hand), `first_author`, `year`, `venue`, `title`.
  - Platform: `group`, `platform` (X/Z/Y-cut, film thickness, substrate/BOX, MgO doping, wafer vendor), `device_type` (ring, disk, PhC, MZM, WG, PPLN, OMC).
  - Metrics, each with value, unit, condition and `as_reported` string: Q_i, Q_L, loss dB/cm, VpiL V cm, EO bandwidth GHz, tuning pm/V or GHz/V, SHG %/W/cm^2, g_OM, f_m, Q_m.
  - Fab, as a structured "recipe card": `litho` (resist, tool, dose); `mask` (HSQ, a-Si, Cr, ZEP); `etch` (Ar mill, ECR-RIE, RIBE, CHF3/Ar; bias V; rate nm/min; selectivity; sidewall angle; roughness); `clad`; `electrodes`; `post` (KOH, BOE, anneal).
  - Provenance: `source_post` (blog URL), `verified_by`, `verified_date` (ISO), `figure_ref` (paper figure/table number; no image copy).
- **UI**: a sortable, filterable table (by cut, mask, etch type, year). Linked scatter plots, e.g. loss vs year, VpiL vs bandwidth, etch rate vs bias, colored by mask type. Each row gets a gwern-style hover card with abstract, metrics and DOI.
- **Machine-readable**: `/data/literature.jsonl` and `/api/literature?cut=X&mask=HSQ`, with a schema version and CITATION.cff.
- **Fab recipe cards** get their own page ("how people etched TFLN, 2002 to now"). The 2018 entries show the historical arc: Cr and a-Si hard masks, then HSQ with ECR-RIE or Ar milling. The A11 a-Si failure and the B1 HSQ process work give the first-person thread.

## 4. LN/TFLN items from OFS and OFC posts

Post URL is `https://outside5sigma.com/ofs/weekly-OFS-N/` unless noted. Links are copied as recorded; titles are abbreviated where long. Items hidden in HTML comments are excluded.

| Post date | Issue | Item (author's heading or gist) | Linked source(s) as recorded | Tag |
|---|---|---|---|---|
| 2024-08-04 | 6 | "The list of thin-film lithium niobate foundries keeps growing" (QCi) | quantumcomputinginc.com TFLN foundry page; Optica 6(9) 1244 "Ultra-efficient frequency conversion in QPM LN microrings"; Optica 6(12) 1455 | industry |
| 2024-09-15 | 12 | Pyroelectric fusion with LiTaO3 | Nature nature03575; Wikipedia "Pyroelectric fusion" | LT / pyro / fun |
| 2024-10-13 | 16 | PPLN wafer stacks for multicycle THz | Commun. Phys. s42005-020-00421-2; OE 31(3) 4041; APL 125 141101; Thorlabs PPLN tutorial | bulk NLO |
| 2024-11-24 | 22 | Doping analogies: "magnesium doped lithium niobate to improve optical damage" | (no LN link) | materials |
| 2024-11-30 | 23 | Q.ANT photonic NPU with TFLN-on-insulator | qant.com press releases | industry |
| 2025-01-05 | 28 | "Compact LN Modulator": HyperLight packaged TFLN vs Fujitsu 2009 DP-QPSK LN modulator | hyperlightcorp.com; Fujitsu press release 2009-09-14 | industry / history |
| 2025-01-26 | 31 | "old school" PPLN OPA module in a multiuse optical quantum computer | IEEE Spectrum; Kashiwazaki 2021 10.1063/5.0063118; RIKEN release | quantum |
| 2025-02-09 | 33 | KTN modulators; BTO vs LN EO comparison | 10.1117/12.580527; NTT-AT KTN page; NTT Review | competing materials |
| 2025-02-23 | 35 | VLF transmitter from a high-Q LN rod piezo resonator | Nat. Commun. s41467-019-09680-2 | bulk piezo |
| 2025-02-23 | 35 | LN EOM with BTO cladding on quartz (sim only) | 10.3390/photonics12020157 | EO |
| 2025-03-09 | 37 | Folded TFLN modulators | IEEE 10896707 (Zhu 2025); 10.1364/OE.548003 (Torre 2025) | EO |
| 2025-03-09 | 37 | Shadow masking for LNOI spot-size converters | 10.1364/OE.541701 | fab / coupling |
| 2025-03-09 | 37 | KTaO3 surface superconductivity ("Worked on lithium niobate for years ... nice and messy dielectrics") | 10.1126/science.aba5511; 10.1103/PhysRevX.15.011037 | aside |
| 2025-03-17 | 38 | Meta SiC AR waveguides; LN pain points: "birefringence, the pyroelectric effect, the goddamn lithium that diffuses everywhere" | meta.com blog | materials (quote) |
| 2025-03-17 | 38 | Micro-transfer-printed PPLN on SiPh | arXiv 2503.08783 | integration |
| 2025-03-23 | 39 | Femtosecond-laser LN nanodomains; domain-inverted LiNbO3 SAW superlattices | 10.1038/s41586-022-05042-z; 10.1063/1.3599569 | poling / SAW |
| 2025-03-30 | 40 | Programmable on-chip nonlinearity (compared to LN) | arXiv 2503.19861 | NLO |
| 2025-03-30 | 40 | HyperLight TFLN Chiplet: 6 in production, 8 in expansion; 8 in wafer "holding over 500 1.6T DR8 transmitter PICs" | BusinessWire 2025-03-27 | industry |
| 2025-04-13 | 42 | Queryable materials property database | Materials Project LiNbO3 mp-3731 | data / API (relevant to site API) |
| 2025-04-27 | 44 | TFLT arrayed waveguide gratings | arXiv 2504.12917 | LT |
| 2025-05-12 | 46 | **LN EO coefficients Sankey diagram**: "two signs are wrong"; "next step is to make this interactive while rotating the crystal" | Weis 1985 10.1007/BF00614817 + SharedIt rdcu.be/eluR5 | properties / viz (HIGH) |
| 2025-05-18 | 47 | Cu damascene TFLT modulators | arXiv 2505.04755 | LT |
| 2025-05-18 | 47 | CSEM spin-off TFLN foundry (CCRAFT) | csem.ch press; ccraft.com | industry |
| 2025-06-01 | 49 | Phononic WG on TFLN-on-diamond | arXiv 2505.23100 | phononics |
| 2025-06-08 | 50 | Pockels laser: RSOA + LNOI EO-tunable DBR | 10.1038/s41566-025-01687-0; EPFL news | lasers |
| 2025-06-08 | 50 | LN nanoimprinting (sol-gel) for nonlinear metalenses | 10.1002/adma.202418957 | fab alt / NLO |
| 2025-06-15 | 51 | Hybrid LN EOM on low-loss SiN, wafer-scale SiPh | arXiv 2504.00311 | integration |
| 2025-06-22 | 52 | Ion-beam-enhanced etching of Zn:LN ridge WGs (pre-thin-film era) | 10.1364/OL.33.002320 | fab history |
| 2025-07-21 | 56 | TFLN multichannel PIC for IFOG | 10.1364/OE.567986 | sensing |
| 2025-07-21 | 56 | Single-cycle SAW pulse on LiNbO3 (chirped IDT) | 10.1063/5.0270260 | SAW |
| 2025-08-18 | 60 | Sputter-deposited TFLN RGB multiplexer; visible modulator | 10.1117/1.APN.4.5.056001; 10.1063/5.0088842 | fab alt |
| 2025-08-24 | 61 | Consolidation of semi-active platforms; LT-on-SiN modulators | arXiv 2508.06265 (also 2508.09920; 10.1038/s41586-025-08820-7) | industry / integration |
| 2025-09-15 | 64 | Electrically pumped on-chip PPLN quantum frequency conversion | arXiv 2509.03869 | quantum NLO |
| 2025-09-15 | 64 | 1.1 cm TFLN MZM by micro-transfer printing | 10.1364/OE.568498 | integration |
| 2025-09-28 | 66 | Integrated LN photonic computing circuit | 10.1038/s41467-025-62635-8 | computing |
| 2025-09-28 | 66 | **Author's own TFLN microdisk glowing from SHG (~1550 to ~780 nm)**, posed as a polarization quiz | own photo | personal / NLO (HIGH visual) |
| 2025-10-06 | 67 | LNOI hybrid mode/wavelength multiplexer | 10.1021/acsphotonics.5c01285 | passive |
| 2025-10-13 | 68 | EO coupling overlap integral explained (LT mm-wave receiver) | arXiv 2510.06176 | EO theory |
| 2025-10-20 | 69 | "really good thesis with a lot of fab details on thin-film lithium niobate nonlinear optics" | 10.3990/1.9789036567183 | fab / NLO |
| 2025-11-02 | 71 | Programmable phononic ICs (USTC). Author: "kind of our vision when we did GHz phononic circuits on TFLN on sapphire". Room-temperature loss "~2 dB/mm"; fractional-bandwidth argument. | arXiv 2510.26596 | phononics (HIGH commentary) |
| 2025-11-16 | 73 | ALD of ferroelectric LiNbO3 ("looks horrible") | RSC c3tc30271g (Ostreng 2013) | fab alt |
| 2025-11-23 | 74 | Spin-coated / photochemically patterned LN films ("polycrystalline and porous") | arXiv 2511.12357 | fab alt |
| 2025-11-23 | 74 | Quantum dot to LN hybrid circuits | 10.1038/s41563-025-02398-1 | quantum |
| 2025-12-01 (repeated in #76, 2025-12-07) | 75 | TFLN photonic engine for atomic control at 780 nm (pre-commercial MPW) | 10.1038/s41467-024-55423-3 | quantum / foundry |
| 2025-12-07 | 76 | **"lithium niobate is not created by god"**: use it only where needed (transduction); "Silicon is the best" for quantum phononics | arXiv 2512.04953; arXiv 2502.16426 | opinion (HIGH) |
| 2025-12-07 | 76 | Ta2O5-on-LNOI 3D waveguide crossings | arXiv 2512.04886 | passive |
| 2025-12-15 | 77 | BEOL TFLN on active SiPh | arXiv 2512.07196 | integration |
| 2025-12-15 | 77 | Watt-level SHG in periodically poled TFLT | arXiv 2512.07968 | LT NLO |
| 2025-12-15 | 77 | AFM-tip poling of LN domain nanodot arrays | 10.1063/5.0307329 | poling |
| 2025-12-29 | 79 | **Pyroelectric pitfalls**: hotplate bakes frying devices or cracking substrates; Al-foil wrapping; worse on Z-cut; 1980s Z-cut MZI drift; LN chip ESD-ing a device on another chip at 4 K; author's released X-cut devices collapsing on cooldown (hypothesis: pyro + electrostatic pull-in) | 10.1063/1.96640; author X post | practice (HIGH) |
| 2026-01-11 | 81 | Uncooled TFLN optomechanical thermal sensor | arXiv 2601.02715 | optomechanics |
| 2026-01-11 | 81 | IBEE used "to make early lithium niobate photonics before thin film wafers existed" | 10.1364/OL.33.002320 | fab history |
| 2026-01-25 | 83 | Grating couplers for LN on sapphire | arXiv 2510.02089 | coupling |
| 2026-01-25 | 83 | GHz Lamb-wave cavities on suspended LN for quantum acoustics | arXiv 2601.13509 | quantum acoustics |
| 2026-02-02 | 84 | Review: integrated photonic quantum computing, Si to LN | arXiv 2601.16484 | review |
| 2026-02-02 | 84 | TFLN MZM at 1 um | IEEE 11357954 | EO |
| 2026-02-08 | 85 | Ellipsometry. Author: "countless sessions ... measuring TFLN thickness" (calibration, angles, anisotropy, Euler angles). | Woollam tutorial (BTO example) | metrology |
| 2026-02-17 | 86 | EO polymers >1000 pm/V vs LN "30 pm/V" | 10.1002/adma.202104174 | competing |
| 2026-03-02 | 88 | "LN: am i a supply chain risk now???" (Raytheon domestic supply) | rtx.com 2026-02-17 | industry |
| 2026-03-30 | 92 | Alumina UV piezo-optomechanics; "LN has 3.8 eV bandgap which is 326 nm" | 10.1364/OPTICAQ.582412 | competing (value to verify) |
| 2026-06-07 | 102 | Arista TFLN pluggables since 2022; Fujitsu "first for commercializing thin-film LN modulator (October 22, 2021)" | fujitsu.com press release (**link malformed in post**) | industry / history |
| 2026-06-07 | 102 | Uncooled TFLT modulators | arXiv 2604.27285 | LT |
| 2026-06-07 | 102 | Prediction: "TFLN is not gonna win for 400G per lane"; "Maybe for 800G per lane we'll see tfln or even plasmonics" | (opinion) | industry opinion |
| 2026-06-14 | 103 | Variability-aware TFLN modulator design workflow | arXiv 2605.28765 | design |
| 2026-06-22 | 104 | Micro-transfer printing of LN on 200 mm SiPh | arXiv 2605.28971 | integration |
| 2026-06-22 | 104 | LPO/CPC power; "0.75 V drive voltage with TFLN" | Ethernet Alliance TEF panel PDF (2025-12) | industry |
| 2026-06-29 | 105 | Flip-chip InGaAs PDs on TFLN; 6 in TFLN wafer in an academic demo | arXiv 2606.16150 | integration |
| 2026-06-29 | 105 | Stoichiometric LiNbO3 single-crystal fibers (1987) | 10.1016/0022-0248(87)90233-8; Stanford Byer publications PDF | history |
| 2026-07-15 | 107 | Thick-silica-buffer TFLN modulator; MZM metric comparison | 10.1364/OE.588103 | EO |
| 2026-07-15 | 107 | "TFLN/TFLT papers are really taking off" (OE top downloads 2026-04..06) | (screenshot) | trend |
| 2026-07-15 | 107 | InP's 243 process steps vs "5-10 mask SOI/TFLN process during grad school" | TU/e PDF | personal |
| 2026-07-29 | 109 | Suspended LT MZM, 460 Gbit/s | arXiv 2607.17436 | LT |
| 2026-07-29 | 109 | Segmented coaxial / parallel-plate TFLN modulators (>1 THz) | 10.1364/OE.566284; 10.1109/ACCESS.2026.3708669 | EO |
| 2026-08-23 | 113 | Power handling: proton-exchanged vs ridge PPLN WG ("RWG is better according to them") | HC Photonics PDF; hcphotonics.com; 10.1364/OL.608253 | NLO practice |
| 2026-08-23 | 113 | Bilayer inverse taper at 1064 nm on TFLN | arXiv 2608.00833 | coupling |
| 2026-09-27 | 118 | "tfln is so far mostly for a better modulator ... the propagation loss is no better than Si or nitride" | (opinion) | industry opinion |
| 2026-09-27 | 118 | TFLN signed incoherent photonic matrix core | arXiv 2609.27709 | computing |
| 2026-09-27 | 118 | Dual-band SiN-loaded LN EOM, 600 Gbps; dual-band grating coupler | 10.1364/OPTICA.609834 | EO |
| 2026-09-27 | 118 | TFLN on 8 in SiPh (CUMEC): ~100 GHz EO, vertical coupler 0.1 dB, edge coupler 1.6 dB | 10.1002/lpor.71344; 10.1109/JLT.2026.3711806 | integration |
| 2026-10-14 | 120 | Review: integrated PPLN OPOs | 10.1063/5.0315274 | NLO |
| 2026-10-14 | 120 | 1064 nm transmitters with GaAs lasers and >100 GHz TFLN modulators | IEEE 11524422 | integration |
| 2026-10-20 | 121 | Hybrid InP-LNOI low-RIN transmitter: DFB-LNOI coupling > 2 dB, total IL ~ 7 dB | 10.1063/5.0337394 | integration |
| 2026-04-04 | OFC 2026 (`/blog/OFC2026/`) | NanoLN 6/8/12 in TFLN wafers; HyperLight TFLN Chiplet session | booth photos (do not reuse) | industry |

Observations:
- From 2025-03 to 2026-10 TFLN/LT items appear in most issues. The mix moves from academic devices to integration (MTP, BEOL, 8 in SiPh) and industry.
- LiTaO3 items rise from 2025-04 on: 8 table rows involve LT (OFS-12, 44, 47, 61, 68, 77, 102, 109).
- The opinion items (OFS-38, 71, 76, 79, 102, 118) are the most distinctive content. No review paper carries this practitioner voice.

## 5. Mapping salvageable content to website sections

| Website section | Blog sources | What to salvage | Form on the site |
|---|---|---|---|
| Theory: tensors and symmetry | A1 (Convention of 2s, constitutive relations, Nye thermodynamic diagram), A12 (rotation code, Euler semantics), A19 (k^2 definitions), A13 (roto-optic) | Conventions and derivations, retyped in KaTeX | Interactive tensor rotator. The OFS-46 "next step" idea of an EO Sankey or surface that updates while rotating the crystal. Voigt "factor-of-2" explainer with toggles for IEEE 176-1987, Auld and Nye conventions. |
| Properties (data + API) | A1 tables (image-only, so re-type from W&G 1985, Wong, IEEE std), A22, A19 COMSOL vectors, A12 p values | Structure and caveats (clamped/unclamped, secondary effects, r13 sign); **not** the numbers as-is | Property pages with per-value citation and convention metadata. JSON endpoint emitting COMSOL-ordered vectors (D upper-triangle, eES column-major) and frame (crystal vs rotated). This is a direct fix for the author's 2018 pain points. |
| Orientation / cut explorer | A1 orientation sections (nZYX, ZXY, YZX, 45/135 deg), A12 matrices | Naming rules plus the theta convention conflict | 3D wafer + flat + device explorer: pick a cut and in-plane angle, get the Euler angles and rotated tensors (R05, R11) |
| Fabrication | A2 recipes, A11 a-Si hard-mask failure (own SEMs), A1 patterning/HF/pyro-ZEP notes, B1 HSQ/discharge/liftoff, OFS-79 pyro pitfalls, OFS-52/81 IBEE, OFS-73/74/60 alternative film growth | Recipes (re-verified), failure stories, own SEMs | Recipe-card database; "things that go wrong" page (pyroelectric, charging, Li diffusion, redeposition) |
| Literature | A2 (seed), OFS stream (section 4), B3 citations | Curated paper list with the author's takes | Sortable dataset tied to eo-modulator-atlas; "reading stream" timeline with hover cards |
| History | OFS-28 (Fujitsu 2009 DP-QPSK), OFS-102 (Fujitsu 2021 first commercial TFLN, Arista 2022), OFS-105 (1987 SLN fibers), OFS-52/81 (IBEE), A2 (2007 BCB-bonded film, 2014-2018 Harvard etch progression) | Dated milestones with links | Timeline entries (merge with R07) |
| Industry | OFS-6, 23, 40, 47, 61, 88, 102, 104, 118; B4 OFC 2026 | Foundry/vendor signals and the author's predictions | Industry trend page (merge with R04/R09); opinions clearly labeled as opinion with date |
| Personal story | A3/A5/A7 (2018 GA and "wrong coordinate" saga), A16 (paper outline), A14 (LiSa origin), A11 (failed mask), OFS-66 (own SHG disk photo), OFS-71/76 (phononics view), OFS-107 (5-10 mask process), B1, B6 project cards | Narrative arc 2017-2024, own images | "Lab notebook" page: real snippets, sanitized (no paths, names, internal links), with own SEMs and mode GIFs (A9, A18) |
| Competing materials | A22 (LN vs LT), OFS-33 (KTN/BTO), OFS-86 (polymers), OFS-92 (alumina), LT items | Comparison facts | LN vs LT vs BTO vs polymer comparison table (cited) |

## 6. Do-not-copy list (privacy / copyright)

- Sanitize every reused blog item: remove lab-internal paths, model/script/dataset names, internal links, internal discussion, and personal names (credit people only with consent).
- Every third-party screenshot listed in 1A/2.1, including the A1 and A2 cover images.
- Third-party documents: link DOIs (e.g. `10.1007/BF00614817`, `10.1109/IEEESTD.1988.79638`), never copies.
- Conference booth and slide photos and their OCR text: cite only public statements.

## Uncertainties

- Image classifications are inferred from captions and pixel sizes. No image was opened.
- The source of the A12 photoelastic values is ambiguous: Andrushchak 2009 vs Yariv & Yeh.
- The identity of "ieeexplore document 171403" (A1 reference, 2020-01-27) is unresolved.
- Venue of Guarino 2007 is recorded as "nature". Verify it.
- Confirm the date range for the My LN story page with the author (see R01 for the public record).
- OFS items were found by keyword; LN items phrased without keywords (e.g. only "Pockels" or "EO modulator") may be missed.
