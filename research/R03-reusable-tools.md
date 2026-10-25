# R03: Reusable interactive tools and code (author's own and adjacent repos)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R03 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Method | Read-only inspection of local working trees, `git remote -v`, `git log`, `gh repo view` / `gh api repos/<repo>/license` (2026-10-24). No builds, installs, servers or runs. |
| Scope | Only repositories that are public on GitHub (or public third-party projects) are listed. Paths are `<repo>/<path>`; PlayGround subprojects are `PlayGround/<folder>`. |
| Author | Claude Code (subagent), at Wentao Jiang's request |

Conventions: "client" = runs in the visitor's browser; "server" = needs Python/native/GPU backend. Effort S = days, M = 1-3 weeks, L = more. "No license" = no LICENSE file at the repo root and GitHub reports none, so default copyright applies (the author can still relicense code he alone wrote).

## 1. Summary table

| # | Repo / folder | Purpose | Stack | Compute | License (evidence) | Public | Maturity / validation | Reuse on LN site | Effort |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `eo-modulator-atlas` (engine + app `/sim`) | EO modulator literature DB + browser cross-section solver | Plain ES modules (engine), SvelteKit 3 + Svelte 5 + Plotly (app), web worker | Client (JS, no WASM) | Engine: GPL-3.0-or-later (`engine/LICENSE`, `engine/package.json`); repo root: none | Yes, github.com/jwt625/eo-modulator-atlas, homepage outside5sigma.com/eo-modulator-atlas/ | High: engine 226 tests (223 pass, 2 skipped, 1 todo), 11/11 independent-reference tests, 27 app smoke checks (`DevLog/audits/simulator-final-gates-2026-10-15.md`) | Full TFLN modulator cross-section calculator; LN material library with provenance | M |
| 2 | `PlayGround/20261001_LN_poling_animation` | Animated x-cut LN periodic-poling explainer: V/I waveform, SHG-style top view, 3D multi-cell lattice, 3D unit cell with Li/Nb flip | Static HTML + vanilla JS, vendored three.js r147 + OrbitControls; Python `scripts/gen_lattice.py` | Client (no build, file://) | PlayGround: none; vendored three.js MIT (`vendor/LICENSE-three.txt`) | Yes (in github.com/jwt625/PlayGround) | v1 + 2 revisions, screenshot-verified on software GL only; real-GPU frame rate not verified (`DevLog/DevLog-000-request-and-plan.md`) | LN crystal-structure data generator, poling/unit-cell 3D scenes, domain-growth model | S-M |
| 3 | `eo-modulator-atlas/engine/data/materials.json` | Material constants for the engine | JSON | n/a | GPL-3.0 tree (data file) | Yes | Per-entry citations, retrieval dates, "not read" caveats | Seed for LN property pages and machine-readable endpoint | S |
| 4 | `mode-guessr` (= later copy of `PlayGround/20260913_mode_overlap`) | Game: estimate mode overlap / mismatch loss | SvelteKit + Svelte 5 + TS, adapter-static, dependency-free physics ES modules | Client | None (`gh api` 404 on license) | Yes, github.com/jwt625/mode-guessr; GitHub Pages workflow in `.github/workflows/deploy.yml` | Gaussian overlaps and 1D slab FDE validated vs closed form; 2D scalar FEM slab-limit only; 2D full-vector experimental, "NOT release-eligible" (`src/physics/fullvector2d.mjs` header, README) | Quiz/game engine pattern; Gaussian overlap kernel; fiber-to-TFLN coupling quiz | M |
| 5 | `PlayGround/20251117_GDSJam/gdsjam` | Collaborative GDSII/DXF viewer | Svelte 5 + TS + Vite, Pixi.js v8 (WebGL2), `gdsii` (TinyTapeout), rbush, Y.js/WebRTC, Tauri desktop | Client (optional Node server for Python exec / file storage in `server/`) | README badge says MIT; no LICENSE file; `gh api` 404. Deps: pixi.js MIT, gdsii MIT OR Apache-2.0 | Yes, github.com/jwt625/gdsjam, live gdsjam.com | Mature (330 commits, CI + deploy workflows) | iframe embed `?embed=true&url=<gds>` to show TFLN device layouts | S |
| 6 | `PlayGround/20260203_transfer_matrix_film_thickness` | Thin-film color vs thickness (built for BTO on Si) | Python (numpy, scipy): TMM, CIE 1931 2-degree CMF to sRGB | Server/offline (port needed) | PlayGround: none | Yes | Working demos; LN not included | "LNOI wafer color vs LN/oxide thickness" widget after JS port | S |
| 7 | `magic-crystals` (quantacrystals.org) | Satirical crystal site with 3D lattices | Next.js 15 static export, React 19, three.js 0.171, React Three Fiber/Drei, Framer Motion | Client; lattices pre-generated at build (`scripts/generate-lattices.ts`) | README says MIT; no LICENSE file; `gh api` 404 | Yes, github.com/jwt625/magic-crystals | Production site; lattice data simplified (sapphire `a` "doubled for more sparse visualization", "simplified representation", `components/CrystalLattice/lattices/sapphire.ts`) | R3F atom/bond instanced renderers, particle/scintillation effects; build-time lattice JSON pattern | S-M |
| 8 | `hardware-milestones` | Unit-aware interactive log plots of historical hardware metrics | Vite 8, vanilla JS, `plotly.js-basic-dist-min` 4.1.1 | Client | None | Yes, outside5sigma.com/hardware-milestones/ | Model tests + Playwright browser suite incl. mobile overflow (README) | Plot component pattern (independent log toggles, SVG export, unit-aware axes) for property plots | S |
| 9 | `WebSpice` | Browser SPICE schematic editor + transient sim | SvelteKit, Svelte 5, `eecircuit-engine` (NGSpice WASM, MIT per its `package.json`), webgl-plot, CodeMirror, elkjs | Client (WASM in worker) | README "MIT"; no LICENSE file | Yes, outside5sigma.com/WebSpice/ | Working app (40 commits) | Equivalent-circuit demos (e.g. RC model of DC bias drift, driver/termination) | M |
| 10 | `PlayGround/20260610_crystal_growth` | Qualitative Czochralski-like furnace heat conduction | Static HTML + vanilla JS (477-line `app.js`), explicit FD in r-z | Client | PlayGround: none | Yes | Qualitative, "conduction-only", presets are silicon (`DevLog-001-heat-transfer-demo-work-plan.md`, `app.js` PRESETS) | Starting point for an LN Czochralski growth illustration | S-M |
| 11 | `BPM` (+ Hugging Face Space jwt625/BPM) | 2D beam propagation (RK4, PML), slab mode solver | Python, Gradio GUI | Server | MIT (`BPM/LICENSE`, `gh api` = MIT) | Yes | Toy library; convergence tests in `tests/`, `run_convergence_tests.py` | Algorithm reference for a WebGL/JS BPM (MMI, Y-branch, taper in TFLN) | M-L |
| 12 | `interactwave` | Real-time WebGL BPM wave visualizer | Vite, regl, GLSL shaders (`src/shaders/bpm_rk4.js`, `compute_k1..k4.frag`), `@microsoft/clarity` | Client (GPU fragment shaders) | Fork of github.com/chiuhans111/interactwave; upstream has no license | Yes (fork); upstream homepage chiuhans111.github.io/interactwave | Demo; 27 upstream-author + 25 Wentao commits | Concept only; code cannot be relicensed without upstream permission | n/a |
| 13 | `PlayGround/20260614_2d_eo_fem_solver` (`eo_fem`) | Predecessor of the atlas engine: browser structured-grid electrostatics + scalar/"vector reconstruction" optical modes; Python reference; Gmsh mesh backend | Vanilla JS (`web/core`), Python, Gmsh; PyMFEM planned | Client (core); Gmsh meshing via local dev API | GPL-3.0 (`LICENSE`, `pyproject.toml`) | Yes (PlayGround) | Superseded: "vector_mode" is scalar candidates + reconstruction (`web/core/vector_mode_solver.js`); MFEM solver "remain planned" (README) | History only; use atlas engine instead | n/a |
| 14 | `PlayGround/20260130_TFLN_stop_drinking_meme` | Meme remake of a third-party PSA video with TFLN pain points | Python + ffmpeg drawtext | Offline | PlayGround: none; source video third-party | Yes (scripts, `voiceline.md`; video files git-ignored) | Done | Copy only: the pain-point vocabulary list (Pyroelectric, GRIIRA, Drift, Shielding, MgO doping, Annealing, Stable bias) as theme seeds | S |
| 15 | `PlayGround/20260322_sim_gifs` | Montage pipeline over the author's simulation GIF library | Shell + Python + ffmpeg/ImageMagick | Offline | PlayGround: none | Scripts and notes only; media and manifests are local-only (README "Local-Only Artifacts") | Done | Inventory pointer: `montage_script.md` lists LN mechanics (19 GIFs), LN optics (4), IDT/piezo wave transport, flip-chip LN/Si, FBAR, fiber-to-LN coupling | S (curation) |
| 16 | `PlayGround/20261002_interconnect_film`, `PlayGround/20261009_pigeon_pluggable` | Blender explainer films (optical interconnect; pluggable) | Blender + Python | Offline render | PlayGround: none | Yes | In progress | Covered by R05 (Blender workflow); component assets possibly reusable | see R05 |

## 2. Detail per candidate

### 2.1 eo-modulator-atlas engine and `/sim` (rank 1)
- Engine (`engine/README.md`, `engine/src/*.mjs`, about 13.1k lines): conforming triangle meshing in JS; anisotropic electrostatic FEM (P2 default); C', L', n_RF, Z0; full-vector optical FEM (Nedelec/Lagrange order 2, `src/vector-mode.mjs`), group index; `eo_overlap` (first-order Pockels overlap with full tensor incl. shear, DC VpiL and Vpi); `rf_line` (quasi-TEM, conductor + dielectric loss); `loaded_line` (periodic T-rail Bloch cell); `eo_response` (traveling-wave S21_EO, 3/6 dB bandwidth); silicon drift-diffusion stage (DevLog-039).
- Same `src/run.mjs` drives the browser worker (`app/src/lib/sim.worker.ts`) and a Node CLI, so a site widget can call it directly.
- 43 per-paper configs in `sims/` (e.g. `sims/chen2022/config.yaml`); reference cases `validation/cases/K*.yaml`; independent Python reference `validation/eoref/fmode.py` (scikit-fem, diagonal-anisotropic full-vector, cross-checked against femwell 0.1.12 for isotropic media).
- Bench example (`logs/bench-baseline-20261015T0926.json`, local log): analytic GSG case VpiL 0.52737 vs target 0.52738 V cm (tol 0.2%); `renaud2023-eo-vector-p2` VpiL 0.637 vs paper 0.55 V cm (tol 10%), i.e. not all paper cases match. Runtime per solve in a browser: N/A (not measured in this track; gate run peak RSS about 1 GB for the Node test suite).
- Reuse: (a) "Build your own TFLN modulator" widget with 3 to 5 sliders (rib width, etch depth, gap, film thickness, cut) over a fixed template config; show E-field, optical mode, overlap, VpiL; (b) expert link-out to the full `/sim` page.
- Risks: GPL-3.0-or-later. Commit history shows only the author (`Wentao`, `jwt625`), so he can dual-license; otherwise the site bundle that links the engine must be GPL-compatible. Engine deps: `yaml` ISC, `robust-predicates` Unlicense (from `node_modules/*/package.json`). Memory/time on mobile unknown; needs a coarse-mesh preset and a cancel button (cancellation exists). Expert UI (YAML editor) is too dense for first-glance visitors.

### 2.2 LN poling animation (rank 2)
- Files: `index.html`, `js/{waveform,domain,lattice,graph,topview,overview,unitcell,app}.js` (about 820 lines JS), `data/lattice_data.js` (generated), `scripts/gen_lattice.py` (93 lines, numpy), `references/cif/COD_2101845_Hsu1997.cif`, `references/cif/COD_1541936_Abrahams1966.cif`, `references/README.md`.
- Physics content (from `DevLog/DevLog-000-request-and-plan.md`): R3c hexagonal, a = 5.148, c = 13.863 A (Hsu et al., Acta Cryst. B53, 420 (1997), COD 2101845); computed Nb-O 1.876/2.130 A, Li-O 2.063/2.245 A match the Hsu bond table; flip constructed by inversion about the Nb O6 octahedron centre: Nb travel 0.55 A, Li travel 1.426 A, O twist 0.086 A. Double-well inset is schematic.
- Reuse: (a) `gen_lattice.py` as the canonical LN lattice generator (extend to emit JSON with up/down states, bonds, octahedra); (b) unit-cell scene with Li hop and Nb shift for a "why LN is ferroelectric" section; (c) multi-cell film with domain front for a PPLN/poling section; (d) the arrival-parameter domain model (`js/domain.js`) that ties switched area to integrated current.
- Adaptation: migrate from global-script three.js r147 to ES-module three.js (current API), add LOD or reduced cell count for mobile (21,866 instanced atoms + 702 arrows in panel c; only about 1.5 fps under software GL, real GPU untested), scroll-driven timeline instead of fixed playback.
- Risks: the V/I waveform was "synthesized to match the features of the supplied figure" whose "source publication [was] not identified" (`references/README.md`); replace with a cited or explicitly generic waveform before publishing. Ps = 0.71 C/m2 was taken from secondary literature (primary not opened). Domain needles/spikes and SHG contrast are cosmetic. COD CIF data: COD is an open-access database (license terms not re-checked in this track).

### 2.3 LN material library (rank 3)
- `engine/data/materials.json`: `lithium_niobate` dispersion = Zelmon, Small, Jundt, JOSA B 14, 3319 (1997), ordinary and extraordinary Sellmeier (form `sellmeier_c`), sourced via the refractiveindex.info database YAML; `lithium_niobate_congruent` RF permittivity and Pockels coefficients from Weis and Gaylord, Appl. Phys. A 37, 191 (1985) (e.g. eps_r perp 44 / par 27.9; r13 8.6, r22 3.4 pm/V per the 2026-10-15 audit G4), plus explicit caveats: no 1550 nm Pockels row in Weis and Gaylord Table 4 (default is the 633 nm clamped row); sample composition not labelled congruent/stoichiometric; original measurements not read.
- Reuse: direct seed for R06 (property pages + JSON endpoint); the caveat fields are exactly what a public endpoint should expose.
- Risk: values flagged as single-reader in places (G11); R06 should re-verify against primaries. Data facts are not copyrightable, but the file sits in a GPL tree; re-emit as a separately licensed dataset (e.g. CC BY) authored by the site.

### 2.4 mode-guessr (rank 5)
- Physics core `src/physics/*.mjs` (about 2.3k lines, no deps): `gaussian.mjs`, `overlap.mjs`, `slab.mjs` (1D full-vector FDE), `fem2d.mjs`, `fullvector2d.mjs`, `materials.mjs` with validity windows that refuse extrapolation. Game shell: speedrun/practice/gallery routes, seeded deterministic question bank (`static/cache/manifest.json`, 146 ready analytic examples).
- LN status: `ln` "isotropic proxy, disabled" and `lno` "scalar screening proxy, placeholder" (`src/physics/materials.mjs`); presets include `tfln-ridge` and `sin-ln-stack` (`data/presets.json`). Correct anisotropic TFLN modes would need the atlas vector solver.
- Reuse: "guess the coupling loss" mini-game for fiber/lensed-fiber to TFLN edge couplers using validated Gaussian overlap; flash A/B presentation pattern.
- Risks: no license file; 2D numerical modes not release-eligible.

### 2.5 GDSJam embed (rank 4)
- README section "Embedding (iframe)": `https://gdsjam.com/?embed=true&url=<GDS_URL>`; remote host must allow CORS.
- Reuse: show published-design-like TFLN layouts (MZM, ring, PPLN grating) as zoomable "image-like" viewers; can host GDS files on lithium-niobate.com with CORS headers.
- Risks: README badge claims MIT but there is no LICENSE file; one external contributor (4 commits) in history, relevant only if code (not the hosted service) is copied. Any GDS shown must be public-safe: generate fresh illustrative layouts (e.g. gdsfactory) rather than lab tape-out files.

### 2.6 Thin-film TMM color (rank 6)
- `src/transfer_matrix.py` (s/p TMM, oblique incidence), `src/color_conversion.py` (CIE 1931 2-degree CMF table at 5 nm, illuminants, XYZ to sRGB), `src/materials.py` (BTO Sellmeier, Malitson SiO2, Aspnes-Studna Si). Built for BTO-on-Si wafer photos (`DevLog-000-thin-film-optical-model.md`).
- Reuse: port about 200 lines to JS for a slider "LN film / buried oxide thickness to wafer color" (LNOI wafers are visibly colored by interference); pairs with the Zelmon LN dispersion.
- Caveats: LN is birefringent; x-cut in-plane anisotropy makes color polarization-dependent (needs ordinary/extraordinary handling); visible-range validity of the chosen LN dispersion must be checked by R06. Do not reuse the BTO wafer images/data.

### 2.7 magic-crystals renderers (rank 7)
- `components/CrystalLattice/effects/{AtomRenderer,BondRenderer,ParticleSystem,ScintillationEffect}.tsx`, `CrystalScene.tsx`, `utils/crystallography.ts` (fractional to Cartesian, bond finding), build-time JSON generation.
- Reuse: rendering/effects code if the LN site uses React/R3F; otherwise port ideas to Svelte/Threlte or vanilla three.js. Sapphire is corundum (R-3c); LN's structure is corundum-related, which could support a visual "sapphire vs LN" comparison, but only with corrected crystallographic data.
- Risks: crystallographic data are deliberately simplified/scaled; do not reuse as data. README says MIT; no LICENSE file.

### 2.8 Smaller items
- `hardware-milestones` (`src/main.js`, `src/model.js`, about 300 lines): Plotly basic bundle about 388 kB gzipped (README); good pattern for n(lambda), d33/r33 vs temperature, etc. Bundle size matters on mobile.
- `WebSpice`: NGSpice WASM worker wrapper (`src/lib/simulation/simulation.worker.ts`) could run a toy equivalent circuit for DC drift (RC network of LN bulk, buffer oxide, cladding). This is an idea; no LN model exists in the repo. NGSpice's own license terms were not checked in this track.
- `PlayGround/20260610_crystal_growth`: replace silicon presets with LN melt/crystal/Pt-crucible properties (to be sourced) for a qualitative Czochralski panel; label as qualitative, as the current app does.
- `BPM` (MIT) and `interactwave`: a client-side BPM for TFLN components would be a fresh implementation (WebGL2/WebGPU) using `BPM/bpm/core.py` and `pml.py` as algorithm references; do not copy interactwave shaders (upstream unlicensed).
- `PlayGround/20250328_PIC_torch`: small torch modules (Y-splitter, directional coupler, ring, MZI network); concept for a transfer-matrix circuit toy (MZM transfer function, ring EO tuning). Trivial to rewrite in JS.
- `SLM-Guessr` (github.com/jwt625/SLM-Guessr, public, outside5sigma.com/SLM-Guessr): sibling Svelte training-game; same pattern as mode-guessr.

### 2.9 Not suitable / out of reuse scope
| Item | Reason |
|---|---|
| `PlayGround/20260918_volumetric_edge_coupling` | Silicon edge coupler reproduction of a third-party arXiv paper; pymeep/MPB (conda) server-side; acceptance "still in progress" (README); tracked folder includes a cached copy of the third-party paper PDF |
| `fdtdx` (github.com/ymahlau/fdtdx) | Third-party JAX FDTD, MIT; GPU/server only; could generate offline field movies for the site, crediting the project |
| `GDS2WebGL` (fork of s-holst/GDS2WebGL, MIT, (c) 2020 Stefan Holst) | Third-party; layer defaults for SKY130 VLSI; superseded by GDSJam for this use |
| `PlayGround/20260823_photonics_lineage` | People/organization graph; includes LinkedIn-sourced grade-C claims (`PROGRESS.md`); personal-data risk on a public material site; at most a pointer for R07 history |
| `photonics-atlas` | Sibling literature atlas; covered by R04 |
| `PlayGround/20261001_eo_modulator_atlas` | Frozen 2026-10-01 copy; the standalone `eo-modulator-atlas` repo is the continuation (its first commit: "Initial public spin-off of EO modulator atlas from PlayGround") |
| `PlayGround/20260130_TFLN_stop_drinking_meme` video | Derived from a third-party PSA video; publish the word list only |

## 3. Licensing and provenance notes
- Root of `jwt625/PlayGround`, `mode-guessr`, `magic-crystals`, `WebSpice`, `hardware-milestones`, `gdsjam`: no license detected by GitHub (some READMEs state MIT without a LICENSE file). Before copying into the LN repo, the author should pick a license for the LN site and add LICENSE files where READMEs promise MIT.
- GPL-3.0: `eo-modulator-atlas/engine`, `PlayGround/20260614_2d_eo_fem_solver`. Author is the only committer in both histories inspected, so dual licensing is possible; decide before the site links the engine.
- Third-party code that cannot be relicensed: `interactwave` upstream (no license; all rights reserved by its author), three.js (MIT, keep notice), `gdsii` (MIT OR Apache-2.0), `eecircuit-engine` (MIT), `yaml` (ISC), `robust-predicates` (Unlicense), `fdtdx` (MIT), `GDS2WebGL` (MIT). These permit reuse with notices except interactwave.
- PlayGround `.gitignore` excludes `*.json`, `*.gif`, `*.mp4`, `*.gds`, `*.txt`; some local artifacts (caches, media) exist only in local working trees, not on GitHub.

## 4. Website implications (ranked reuse candidates)
1. **Atlas engine as the in-browser TFLN modulator simulator.** Highest value and only validated anisotropic EO solver in hand; wrap a simplified "3-slider" front end in a worker, link to the full `/sim`. Effort M. Blockers: license decision (GPL vs dual), mobile runtime measurement.
2. **Poling animation and `gen_lattice.py` as the LN crystal/ferroelectric centerpiece.** Re-base the waveform on a cited source, port to ES-module three.js, add LOD. Effort S-M. Directly serves "true 3D" and "lasting association" goals.
3. **`materials.json` LN entries as the seed dataset for the property API (R06).** Keep the provenance and caveat fields. Effort S.
4. **GDSJam iframe embeds** for zoomable device layouts drawn fresh for the site. Effort S.
5. **mode-guessr engine for a TFLN coupling-loss game**, using only validated Gaussian overlap until anisotropic modes are wired in. Effort M.
6. **TMM wafer-color widget** (port from Python, add LN birefringence). Effort S. Approachable for non-experts.
7. **Rendering patterns**: magic-crystals effects (if React) and hardware-milestones Plotly plotting (property plots). Effort S each.
8. **Thematic copy**: TFLN meme vocabulary (pyroelectric, GRIIRA, drift, shielding, MgO doping) feeds the decorative-theme track.
9. **Author's own LN COMSOL GIF library** (mechanics, IDTs, FBAR, fiber-to-LN coupling; local-only) as gallery media, after the author screens each clip for unpublished or lab-owned content.
10. **Later / optional**: WebSpice bias-drift circuit toy (M), LN Czochralski heat demo (S-M), new WebGL BPM for TFLN MMI/taper (M-L), Blender assets (R05).

## 5. Open questions for the author
1. License for the LN site code and data, and whether to dual-license the atlas engine (GPL-3.0) for embedding.
2. Source publication of the poling V/I reference figure, or approval to switch to a generic/cited waveform.
3. Which LN COMSOL GIFs are cleared for public use (published work only).
