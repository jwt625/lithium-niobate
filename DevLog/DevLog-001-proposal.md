# DevLog-001: Proposal for lithium-niobate.com

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Status | Proposal, awaiting author decisions (section 15) |
| Scope | Vision, information architecture, theme, flagship experiences, data/API, 3D, simulation, tech stack, rights, roadmap |
| Inputs | `research/R01`..`R13` (11 subagent notes + 2 coordinator notes) |
| Authors | Claude Code, at Wentao Jiang's request |

Conventions: `[Rnn]` points to the research note holding the source and detail. Numbers marked "estimate" are planning estimates, not measurements.

## 0. Summary

lithium-niobate.com becomes the place people go to see, touch, compute with, and cite lithium niobate (LN). It does what review papers cannot: a living, provenance-tagged records and properties database with AI-readable endpoints; real-time crystal optics and 3D; in-browser solvers; and an honest, dated industry and history narrative. A lay visitor gets beauty and one clear idea within seconds; an expert reaches tensors, equations, data, and sources within 2 clicks.

Core proposals:

1. Theme "Optic Axis": the crystal c-axis as the site's spine, 3m-symmetric ornament, polarization as the source of color, the conoscopic figure as logo and live hero [R12].
2. Four depth levels, every page reachable in at most 3 clicks from the landing page, with hover popups so most depth never needs a click [R10].
3. Five flagship experiences at launch (P1), chosen for value per effort from benchmarked candidates [R11]: Crystal Optics Bench (hero), Phase-Matching Lab, Modulator Designer (closed-form tier), Tensor and Convention Explorer, TFLN vs everything trends chart [R04]; plus one playful real-time 3D piece, Crystal in Hand (F6), so the bruno-simon-style layer is present from day one.
4. A provenance model used everywhere (values tagged `reported` / `derived` / `template`, plus a source-verification status), taken from the author's advanced-packaging-atlas work [R13] and R06's status key.
5. Static API v1 on GitHub Pages: path-parameterized JSON, OpenAPI, `llms.txt`, `.md` twins, Dataset JSON-LD, Zenodo DOI. None of the iconic reference sites do this [R06, R10].
6. Stack: SvelteKit (static adapter) + TypeScript + pnpm; three.js r186 WebGPU with automatic WebGL2 fallback via Threlte; plain-TS physics core; Blender build scripts -> GLB -> gltf-transform [R05, R10, R11].

## 1. Vision, audience, success criteria

| Audience | Arrives with | Leaves with |
|---|---|---|
| Curious public, students | No optics / RF / nanofab background | "This clear crystal bends light with electricity and makes the internet and quantum tech work", plus one moment of delight they remember |
| Engineers adjacent to photonics (datacom, RF, AI infrastructure) | Hears "TFLN" in product news | Why TFLN matters for 200-400G/lane, what limits it (footprint, drift), who makes it, honest trend data |
| Photonics grad students, researchers | Needs numbers and conventions | Verified tensors with frames and signs, Sellmeier with errata, a QPM calculator, records database, fab recipes, failure modes |
| AI agents and tools | Need machine-readable facts | Stable JSON endpoints with units (UCUM), DOIs, status, and versioned citations |

Success criteria (proposed):

- First meaningful interaction within 1 s on a mid-range laptop (static poster paints first; live hero hydrates after) [R10 principle 1].
- Every number on the site is traceable (hover shows source, locator, status). Zero untraceable numbers is a release gate.
- Every flagship explorable has a lay entry point (one slider, one sentence) and an expert mode (full parameters, equations, export).
- Lighthouse-style budgets met (section 10.4); all content readable with JavaScript off.
- The site is cited by others as a data source (Zenodo DOI, `CITATION.cff`).

## 2. What the site adds over review papers

R08 found 45 reviews and perspectives (2012, 2018-2026; one is a preprint). All freeze their tables at publication and none was found with machine-readable metric tables; the reference review (Zhu et al., Adv. Opt. Photon. 2021) is paywalled at the publisher [R08 sec. 1].

| A PDF review gives | The site gives | Evidence it is missing elsewhere |
|---|---|---|
| Static record tables | Living records database (loss, Q, VpiL, bandwidth, baud, SHG efficiency, OPO threshold, squeezing, transduction), sortable, plottable vs year, exportable | R08 #1; R04 (eo-modulator-atlas already holds the modulator part) |
| Tensor tables in one convention, often silent on frames and signs | Full tensors with frame, Voigt convention, clamped/unclamped, sign-convention explorer, COMSOL-ordered export for any cut | R06 sec. 3 (a reported r13 sign discrepancy, unverified; a likely, unconfirmed c14 vs p14/p41 frame mismatch in common TFLN models); R02 (the author's own 2018 convention errors) |
| One Sellmeier, sometimes the wrong columns | All major dispersion models with validity ranges and errata applied (Zelmon 1997 MgO:LN o/e swap, erratum DOI 10.1364/JOSAB.616304, 2026-10-22) | R06, R11 |
| Equations for VpiL, bandwidth, phase matching | The same equations, live, with real data points overlaid | R11 S3, S6 |
| A paragraph on DC drift | A drift simulator on 2024-2026 primary literature (Holzgrafe 2024, Yeh 2026: interfaces, cladding conductivity, contact traps; Li-ion migration not confirmed by a primary source) | R08 #2, sec. 3 |
| 2D figures of 3D devices | Real-time 3D with an illustrative vs true-scale toggle (a 0.3-0.9 um film on a 500-725 um handle is invisible at true scale) | R05, R13 |
| A history paragraph | A dated, sourced, interactive timeline with visible verification badges and "who did it first?" disputes | R07 |
| Market numbers from report teasers | Range strips labeled by grade; dated events with primary sources | R09 |

## 3. Information architecture (progressive depth)

### 3.1 Depth levels

| Level | Form | Reached by | Example |
|---|---|---|---|
| L0 Landing | Live hero + 8 chapter doors + "LN in your life" cards | URL | Conoscopic figure that deforms when you drag a voltage slider |
| L1 Chapter | One idea, one explorable, plain language, hover popups | 1 click | "Light meets crystal": birefringence and the Pockels effect |
| L2 Deep dive | Equations, full parameters, conventions, references, sidenotes | 2 clicks (or inline expansion from L1) | Electro-optic tensor, clamped vs unclamped, sign conventions |
| L3 Data and tools | Property pages, API, records database, full solvers, downloads | 2-3 clicks; also linked from every number's popup | `/properties/electro-optic-r/`, `/api/v1/...`, `/lab/modulator/` |

Rules: no gates (everything expandable, "show all" always available) [R10]; every hover popup has a tap path and a full-page link; depth badge (lay / grad / expert) and "last verified YYYY-MM-DD" on each page.

### 3.2 Site map

| Section | L1 pages (lay) | L2/L3 depth (expert) | Main sources |
|---|---|---|---|
| Welcome | Hero, "Meet lithium niobate", LN in your life | Spectral map UV-THz linking every section [R08 #10] | R09 sec. 5, R12 |
| 1 The crystal | Structure and symmetry; composition (congruent vs stoichiometric); domains and poling | R3c unit cell viewer (point group 3m), defect models (Nb_Li antisite, Li vacancy), composition slider, Curie / coercive field data | R06, R08 #7, R03 poling animation |
| 2 Light | Birefringence; Pockels effect; nonlinear optics (SHG to OPO); Kerr and combs | Index ellipsoid, conoscope, r tensor, d tensor, QPM, coupled-mode SHG/OPA, LLE | R11 S1-S4, S7 |
| 3 Sound | Piezoelectricity; surface acoustic waves; phonons meet photons | c, e, eps tensors; Christoffel slowness; IDT; piezo-optomechanics (author's work) | R06 (kushibiki1999 default set), R11 S10, R01 |
| 4 Quirks (living with LN) | Photorefraction; GRIIRA; pyroelectric sparks; DC drift; thermal effects | Drift RC model, photorefractive and thermal ring sweep, "things that go wrong" fab page | R08 sec. 3, R02 #4, R11 S8 |
| 5 Making it | From boule to wafer; ion slicing; patterning; electrodes and poling | TFLN fab-flow Process viewer, recipes dataset, loss/Q vs method | R13, R08 #8, R02 literature recipes |
| 6 Devices and applications | Modulators; frequency converters; combs; quantum; RF filters | Modulator Designer, records database, applications x maturity map | R04, R08 sec. 4, R11 S6 |
| 7 History | 10-chapter scroll narrative | Timeline data, disputes sidebar, people | R07 |
| 8 Industry | Rock to chip value chain; who makes what; trends | Atlas-fed charts, OFC snapshots, market range strips, ecosystem map by region | R04, R09 |
| Lab | All simulators in one place | Full parameter modes, export JSON | R11 |
| Data | Property explorer, API docs, downloads, citation | `/api/v1`, OpenAPI, `llms.txt` | R06 |
| Library | Reviews (45, with gaps and OA status), literature with the author's dated takes, recipes | Joined to eo-modulator-atlas ids | R08 sec. 1, R02 |
| My LN story | The author's 2017-2024 path in LN | Interactive figure rebuilds from CC BY data; device renders; thesis | R01 |
| Colophon | How this site was made, provenance policy, field guide to hidden details | Changelog, audits | R12, R13 |

Click depth check: Landing -> chapter (1) -> deep dive (2) -> property page / full solver (3). Hover popups expose most L2 facts at L1 with zero clicks.

## 4. Theme and visual language

Full proposal in R12 (theme) and R13 (method). Decisions to confirm in section 15.

- Theme A, "Optic Axis" (recommended): a thin vertical axis line on every page; section markers are octahedra that cycle Li, Nb, vacancy; scroll = travel along c.
- Ornament rule: every decoration obeys point group 3m (trefoils, triangles, 3m hexagons; no 4- or 5-fold motifs). Only sources with 3-fold content are used, reduced to 3m: Gothic trefoils, 6- and 12-fold rose windows, asanoha / kikko kumiko, 6- and 12-fold star patterns. 4-, 5-, 8-, 10-, 16-fold sources (most girih, many rose windows) are excluded.
- Color comes from polarization optics (interference colors, conoscopic rings, 532 nm SHG green), IR shown as declared false color. Neutral UI otherwise. Dark default with a light theme; sharp corners (60-degree cut corners on hero cards to read as facets).
- Physical effects as subtle behaviors, each with a hover explanation and sources, and a reduced-motion fallback (static or off) [R12 sec. 5]. Launch set: birefringent double-image headings; poled-stripe section dividers whose period is a real QPM period for that page's content; vacancy dot texture by composition; photorefractive cursor trace with GRIIRA dimming; bias-drift footer indicator with "re-lock"; wafer-map site map.
- Kickoff-named effects, mapped to motif and phase [R12 sec. 5]:

  | Effect | Motif | Phase |
  |---|---|---|
  | GRIIRA | IR-false-color elements dim where the green cursor dwells, then recover | P1 |
  | Photorefraction, charge screening/shielding | Cursor trace written into the background, erased as screening charge redistributes; hover explains space-charge field and screening | P1 |
  | Bias drift (DC drift, screening of the applied field) | Footer bias indicator drifts, click to re-lock; links to the drift simulator | P1 |
  | Li vacancies, non-stoichiometry | Background dot lattice with missing sites set by composition | P1 |
  | Li out-diffusion | Depletion gradient at page edges; history tie-in (1973 out-diffused surface guide) | P2 |
  | Three-wave mixing (SHG, SFG, DFG) | Poled-stripe dividers with real QPM periods (P1); cursor photons merging at the sum frequency in the Light chapter (P2) | P1/P2 |
  | OPO | Nav ring that oscillates after a reading threshold is passed | P2 |
  | Four-wave mixing, Kerr combs | Comb spectrum in the Light chapter, optional (declared stylized) sound | P2 |
- Chapter art directions borrow real art vocabularies (engraving for fabrication, Bauhaus/Swiss for physics, pointillism for photon mixing, Isotype for industry, lab notebook for the author's story), executed with the hybrid-bonding scene contract: deterministic `render(t)`, no text inside scenes, geometry true, per-scene notes with sources [R13].
- Theme B (crystal atelier) and C (Niobe naming story: niobium after Niobe, daughter of Tantalus, namesake of tantalum) become chapter content, not the site theme.

## 5. Flagship experiences

Launch set (P1) chosen by value per effort; kernels benchmarked in plain JS on one thread [R11 sec. 1]. Phone timings are estimates (3-6x laptop). Phases P1-P3 are used consistently in sections 5, 8, 9, 13.

| # | Experience | Lay entry | Expert depth | Compute (laptop, measured unless noted) | Reuse | Effort |
|---|---|---|---|---|---|---|
| F1 | Crystal Optics Bench (hero): conoscope + index ellipsoid + Pockels deformation | Drag a voltage slider, watch the colored cross split into two isogyres; tilt the crystal | z-cut plate with transverse field (E along x or y: r22, plus r51 for off-axis rays) makes the crystal biaxial; contrast toggle E along z (r13, r33) keeps it uniaxial and only rescales the rings; thickness, wavelength (arbitrary cut in P3); Jones calculus per pixel | < 75 ms CPU; WebGL2 shader < 16 ms/frame (estimate) | New; R06 tensors | S-M |
| F2 | Phase-Matching Lab | "Pick two colors, the crystal makes a third": QPM stripe period appears | Sellmeier models with errata, T tuning, acceptance bandwidths, SHG/SFG/DFG/OPO curves, coupled-mode depletion, OPO threshold | < 75 ms; about 1 ms coupled-mode | `materials.json` seed (R03) | S |
| F3 | Modulator Designer, closed-form tier (P1); atlas FEM tier (P2) | "Turn voltage into light pulses": live eye diagram | VpiL, velocity mismatch, RF loss, impedance, traveling-wave response; real atlas points overlaid; P2 adds the atlas engine | eye about 50 ms; atlas engine 0.8-1.2 s/run, phone 2.4-7 s (estimate) | eo-modulator-atlas engine (226 tests, 11/11 vs scikit-fem) [R03] | S-M (P1), M (P2) |
| F4 | Tensor and Convention Explorer | Spin a crystal, see which way it squeezes or bends light | Any Euler angle; X/Y/Z-cut, 128 deg Y-X; flip-+z and rotate-180 toggles show sign flips; c14 vs p14/p41 frame warning; COMSOL-ordered and JSON export | trivial | Author's 2018 rotation math (R02 A12), R06 tensors | S-M |
| F5 | TFLN vs everything | "Faster and smaller: how chips that modulate light compare" | VpiL vs bandwidth vs year, platform toggles (TFLN, TFLT, SiPh, InP, BTO, polymer, bulk Ti:LN), lower bounds as arrows, push-pull convention default | trivial | eo-modulator-atlas tables, pinned-SHA build-time fetch [R04] | S |
| F6 | Crystal in Hand (playful 3D) | Pick up and spin an LN crystal and an LNOI wafer; the R3c lattice appears inside on zoom; the wafer shows thin-film interference colors that change with film thickness; drag a laser pointer through it | Cut and flat orientation, lattice from Hsu et al. 1997, wafer color from transfer-matrix optics with LN birefringence | real time; budget in sec. 8 | Poling animation lattice (A01), TMM wafer-color widget (R03, R11 S12) | M |

P1 small toys that power theme motifs: DC-drift toy (single RC relaxation) for the footer indicator, photorefractive toy for the cursor trace, LNOI wafer color (inside F6) [R11 S8, S12].

P2, ranked [R11, R08]: multilayer DC-drift simulator (R08 #2); ring resonator + EO comb; boule-to-chip 3D zoom with MZM die and cross-section (A02, A05, A06); live TFLN mode/EO solver with precomputed lattice (about 6.3k solves, about 11 min on 10 workers, estimate) [R11 S5]; Kerr LLE in a worker; coupling game; SPDC JSA; author-story rebuilds (heralded microwave photon from CC BY Zenodo data 10.5281/zenodo.7903643; "follow one microwave photon" signal chain from the CC BY Nat. Commun. 2020 paper) [R01].

P3: TFLN fab-flow Process viewer on the DevLog-016 architecture (R13); photorefractive/thermal ring sweep; Christoffel bulk acoustics then SAW; quantum calculators (squeezing vs loss); GPU poling automaton; effective-index BPM; pulsed chi(2) split-step.

## 6. Content plan highlights

- LN in your life (honest version): most SAW filters in phones use lithium tantalate, LN's sibling, and BAW filters use AlN, and the site says so; no claim that green laser pointers use LN until a primary source is found [R09 sec. 5, R07 unverified].
- History: 10 chapters (A crystal on paper 1928-1958; Bell Labs grows a crystal; The damage that became a memory; Sound on a crystal; Light in a channel; Taming the crystal; The internet's modulator; Peeling the crystal; The thin-film renaissance; Into the AI data center) [R07 sec. 7]. Hero stories: Ashkin's optical damage (1966) becoming holographic storage (1968); first OPO in LN (1965); a "thin-film LiNbO3" modulator in 1973 (Kaminow et al., APL 22, 540; a Li2O out-diffused planar guide in bulk LN, 3.2 GHz) vs the 2018 TFLN-on-insulator modulators (LNOI itself dates from 1998-2004, R07), which also ties into the Li out-diffusion motif; the stripes (QPM proposed 1962, growth striations 1980, field poling 1993, PPLN OPOs 1995).
- Industry, honest trends: telecom TFLN VpiL pooled median 2.44 V cm (push-pull, n = 66), per-year medians about 2-3 V cm except 2024 (1.23, slow-light rows), i.e. no clear efficiency trend (R04's interpretation), while symbol rate rose from 100 to 225 GBd and bandwidth hit the 110 GHz instrument limit; median electrode length 6.4 mm vs 0.9 mm SiPh; TFLT rising (atlas line-rate record 768 Gb/s, OFC 2026 Th4A.2); 50 of the 56 TFLN/TFLT atlas papers that name a wafer supplier name NanoLN (Jinan Jingzheng) [R04]. Atlas counts are coverage, not field growth; the site says so.
- Industry, events (dated, graded): HyperLight with UMC/Wavetek 6"/8" production (2026-03-11 Business Wire, US / 2026-03-12 UMC, Taiwan; primary pages not yet read) and Series C led by MediaTek (2026-06-18); Ligentec and X-FAB TFLN on 200 mm (2026-01-19); 8-inch TFLN wafer at Silicon Austria Labs (2025-09-25) [R07, R09]. Vendor and trade-press claims carry their grade.
- Supply chain: niobium is not the bottleneck (Brazil about 93% of mined Nb; estimate, R09: even a 2029-scale plan of 2.1 M 6-inch-equivalent wafers per year would need about 0.05% of mined Nb, about 0.1-0.25% with growth and kerf losses, shown with its inputs); crystal growth and LNOI bonding are.
- Quirks chapter is the practitioner differentiator: pyroelectric discharge stories, HF / resist / hardmask lessons, DC drift, photorefraction in rings, from the author's own blog material and SEMs (rights clean) plus primary literature [R02 #4, R08 sec. 3].
- Library: 45 reviews and perspectives with scope, OA status, and gaps [R08]; the 2018 literature post re-extracted and joined to eo-modulator-atlas ids; about 80 items from the author's weekly reading posts with his dated one-line takes as hover cards [R02].
- My LN story: PhD-era arc (TFLN optomechanical crystals -> all-LN piezo-optomechanical transducer -> nanobenders (Commun. Phys. 2020; not in the thesis abstract) -> LN-on-SOI -> optically heralded microwave photons), 4 first-author LN papers (Optica 2019, Nat. Commun. 2020, Commun. Phys. 2020, Nat. Phys. 2023), 19 of 27 papers involving LN, thesis public at purl.stanford.edu/mx877vv9870 [R01]. Date range and framing to confirm with the author.

## 7. Data and AI endpoints

Design per R06 sec. 4; summary:

- Record model: every value carries property, symbol, tensor component, value, uncertainty, unit (UCUM required, QUDT URI where it exists), variant (CLN, SLN, MgO5-CLN, TFLN cuts), conditions (T, f, lambda, mechanical S/T and electrical E/D boundary), frame (axes, handedness, +z definition), provenance (source id, DOI, table/equation locator, status, transcription date, derivation), notes.
- Status: R06's key (P primary seen, P(abs) abstract only, P-db CC0 transcription of a primary, S secondary, V vendor, C computed, U unverified) plus R13's role tag (`reported` / `derived` / `template`). Unverified rows stay out of the default endpoint (separate `unverified` endpoint or hidden).
- Defaults: kushibiki1999 for elastic, piezoelectric, permittivity, density, velocities (reproduces eps^T and v_L,z to < 0.1%); Zelmon 1997 CLN dispersion, MgO5 with the 2026 erratum applied; alternatives shown as a spread, never blended [R06].
- URL scheme (GitHub Pages ignores query strings, so parameters live in the path): `/api/v1/index.json`, `/api/openapi.json`, `/api/v1/properties/{property}/{variant}.json`, `/api/v1/tensors/{tensor}/{variant}/{source}.json`, `/api/v1/dispersion/{model}.json` (+ `.rii.yml`), precomputed grids `/api/v1/grids/index/{model}/T{T}C.csv`, ESM evaluator `/api/v1/lib/ln.mjs`; human page per property with Dataset JSON-LD and a `.md` twin.
- Same pattern for records (`/api/v1/records/...`), history events, industry events, publications, 3D geometry sidecars (R05: each GLB has a JSON sidecar of sourced dimensions).
- Discovery: `/llms.txt`, `/llms-full.txt`, `.md` twins, `robots.txt` explicitly allowing AI crawlers, OpenAPI 3.1, JSON Schema 2020-12, `datapackage.json`, `CITATION.cff`, Zenodo concept DOI. MCP server on an edge worker is a later phase (static hosts return 405 for POST).
- License: data CC BY 4.0 (R06 recommendation) or CC0; code MIT, except any GPL component (see section 15).
- CI: dispersion models reproduce published spot values; tensors pass symmetry-form and consistency checks (e.g. eps^T from eps^S plus d, e); every public number resolves to a source.

## 8. 3D plan

- Pipeline (author's proven method, plus a web stage): one `build_<id>.py` headless bpy script per asset, dimensions in TOML with grades mapped to reported / derived / template, GLB export, re-import check, `gltf-transform optimize` (Meshopt + KTX2), JSON sidecar, browser bounds and size test. Strip Blender stamp metadata and PNG text chunks (they embed local paths) [R05].
- LN glass strategy: real time `MeshPhysicalMaterial` (ior about 2.2, within three.js's 2.333 limit; dispersion supported since r164), at most 1-3 transmissive meshes; birefringence needs a custom TSL shader (doubles as an explorable); Cycles pre-renders for boule and wafer hero shots. LN must never read as plain glass or vanish on the dark background [R05, R13].
- P1 assets (for F6 and F4): A01 unit cell (reuse poling animation and `gen_lattice.py`, Hsu et al. 1997, COD 2101845), A03 cut-explorer wafer, A04 LNOI stack with thin-film interference color. P2: A02 boule (pre-render + light real time), A05 MZM die, A06 MZM cross-section (R05 lists all six as its P1; deferred here to keep launch scope). Unsourced dimensions (boule size, flat specs, ring radius, packaged outline) must be sourced or graded `template` before modeling [R05].
- 3D budget (proposed, R05): mobile hero <= 2 MB, desktop <= 5 MB, <= 150k triangles, <= 50 draw calls, <= 64 MB textures; poster image first; lazy load; render on demand; Quality / Renderer / Motion toggles [R05, R10].
- One shared renderer feeding multiple figure canvases on long pages (ciechanow.ski pattern) [R10].

## 9. Simulation plan

From R11 (benchmarks, equations, validation sources there).

| Phase | Sims | Infrastructure |
|---|---|---|
| P1 Launch | Index ellipsoid, conoscope (z-cut, transverse field, white light), Sellmeier/QPM, coupled-mode SHG/OPA (CW) + OPO threshold, modulator closed-form + eye, LNOI wafer color (in F6), drift and photorefractive toys | `physics/` TS core with units, provenance, conventions; property-API loader; URL-hash state; JSON export; WebGL2 shader harness; node:test analytic suite; Playwright smoke with CPU throttling |
| P2 Expert depth | Ring + EO comb; live atlas TFLN mode/EO solver + precomputed lattice; modulator designer wired to atlas outputs; Kerr LLE in a worker; coupling game; SPDC JSA; multilayer drift model | Worker pool with cancel; precompute CLI with held-out checks; content-hashed data; WebGPU progressive path; real-device timing log |
| P3 Breadth | Christoffel bulk acoustics then SAW; effective-index BPM; pulsed chi(2) split-step; fab toys inside the Process viewer; photorefractive/thermal ring sweep; pyroelectric toy; GPU poling automaton; arbitrary-cut conoscope | Tensor rotation module for acoustics; scene contract for video export; fresh-context audit of all sims |

Deviations from R11 tiers: ring + EO comb (R11 tier 1) moves to P2 to keep launch scope for F6; GPU poling automaton (R11 tier 2) moves to P3.

Validation order (author's standard): analytic limits, then reference solvers (atlas engine, scikit-fem, Python references), then published figures. No fitted curves in place of physical models.

## 10. Technical architecture

### 10.1 Stack

| Layer | Choice | Reason |
|---|---|---|
| Site | SvelteKit static adapter, TypeScript, Vite, pnpm | Author default; The Pudding runs SvelteKit [R10] |
| Content | Markdown (mdsvex) with Svelte components for explorables, popups, sidenotes | Prose-first, readable without JS |
| 3D | three.js r186 `three/webgpu` + TSL, automatic WebGL2 fallback, via Threlte | Same approach as bruno-simon.com 2025 [R05, R10] |
| Physics | Plain TS modules, workers for heavy kernels; atlas engine in a worker (P2) | 15 of 17 kernels < 0.3 s single-thread [R11] |
| Plots | uPlot or Plotly per need; data-only, dark default, log toggles, hover details | Author plot standards |
| Popups | Own component on the native Popover API + CSS anchor positioning, Floating UI fallback | gwern code is tied to its Hakyll build; Tippy archived [R10] |
| Math | KaTeX at build time | Static, fast |
| Search | Pagefind | Static index |
| Hosting | GitHub Pages (repo `jwt625/lithium-niobate`), custom domain lithium-niobate.com (DNS setup per open question 11) | Author default; limits 1 GB site, 100 GB/month soft bandwidth, no custom headers [R06] |

GitHub Pages caveat: no custom headers means no COOP/COEP, so no threaded WASM (SharedArrayBuffer). Workers without shared memory are enough for P1-P2. Cloudflare Pages is the fallback if headers or functions become necessary.

### 10.2 Repository layout (proposed)

```
DevLog/              plans, decisions, audits
research/            R01..R13 (this phase)
data/                canonical YAML: properties, sources, dispersion, records, history, industry, publications
  schema/            JSON Schemas
assets3d/            build_<id>.py, <id>.toml, sidecars (GLB built in CI or committed if small)
scenes/              deterministic render(t) illustration scenes + notes.md each (R13 contract)
src/                 SvelteKit app (routes, components, physics/, lib/)
scripts/             data build (YAML -> /api JSON/CSV), atlas fetch (pinned SHA), checks
tests/               analytic physics tests, data consistency, Playwright
static/              llms.txt (generated), robots.txt, CNAME
```

### 10.3 Data flow

`data/*.yaml` (single source of truth, provenance per value) -> `scripts/build_api` -> `/api/v1/*.json|csv`, property pages, popups, `llms.txt`. External atlases fetched at build time at a pinned commit SHA, never forked (eo-modulator-atlas is 864 MB, so no submodule) [R04].

### 10.4 Budgets and accessibility (proposed, not measured)

- Per page excluding 3D: <= ~150 KB gzip HTML+CSS+JS; 3D hero within the sec. 8 budget (mobile <= 2 MB, desktop <= 5 MB) loaded after first paint behind a capability probe; explorables lazy-loaded with IntersectionObserver.
- Native range inputs with `aria-valuetext` including units; full keyboard; `prefers-reduced-motion` honored plus a visible motion toggle; sound off by default.
- Global unit switch (nm / THz / eV; V cm / V mm; dB/cm / dB/m) [R10 F4].

### 10.5 Verification

Physics: analytic tests in CI. Data: schema validation, symmetry and consistency checks, spot-value regressions, "no untraceable number" check. Visual: deterministic scenes allow contact-sheet and screenshot regression (R13 harness); real-device timing log for phones. Fresh-context audits after each phase.

## 11. Provenance, rights, and claims policy

- Figures: use CC BY / CC0 / author-owned (thesis, the author's own SEMs and photos, CC BY Zenodo data) first; redraw or simulate everything else; every figure shows source DOI and license in a popup. Journal versions under CC BY 4.0 among the author's papers: P05, P07, P14, P19, P20, P22; Optica-family open access is non-commercial; APS/AIP/subscription Springer papers are redraw-only [R01 sec. 9].
- Never republish screenshots of handbook tables (the 2018 properties post is about 75 of 120 images from Weis & Gaylord, Wong, Nye, IEEE std); re-key values with per-value citations; do not reproduce whole handbook tables in their layout [R02, R06].
- Paper figure crops are visual references only, never traced or embedded [R13].
- History images: public domain / CC0 first; CC BY-SA with attribution; hold uncertain-license items. No openly licensed LN boule or chip photo was found, so renders or permissioned photos fill that gap [R07].
- Claims: industry items carry grade (fact / vendor claim / trade press / low-grade / estimate / speculation), source URL, and access date; market sizes only as range strips (TFLN modulator base-year estimates span about $73-476M across report teasers) [R09]. Re-verify industry pages after OFC (March) and ECOC (September).
- Unverified items (e.g. green pointers using PPLN, several "firsts") are not published as fact [R07, R09].

## 12. Public-repo hygiene

- No private repositories, their names, or contents; no absolute local paths; no secrets; no private notes. Derived workflow meta only [kickoff].
- Strip metadata from renders and images. Review staged changes before every commit.
- Colleague names appear only as published co-authors.

## 13. Roadmap (proposed)

| Phase | Deliverables | Exit gate |
|---|---|---|
| P0 Foundations | Repo scaffold, design tokens (dark/light), axis-line + 3m ornament prototypes, popup component, data schema + build script, 20-30 primary-verified property rows, CI | Author approves theme from 2-3 rendered prototypes |
| P1 Launch (v0.1) | Landing with live conoscope hero (F1), chapters 1-2 at L1 with popups, F2 Phase-Matching Lab, F3 Modulator Designer (closed-form tier), F4 Tensor Explorer, F5 trends chart, F6 Crystal in Hand (A01, A03, A04), P1 theme motifs, history timeline (data + scroll), My LN story v1, API v1 + `llms.txt`, Colophon | Fresh-context audits (data, physics, visual, privacy) pass; budgets met |
| P2 Depth | F3 atlas-engine tier, multilayer DC-drift simulator, ring + EO comb, Kerr LLE, author-story figure rebuilds, 3D assets A02, A05, A06 and boule-to-chip zoom, chapters 3-6 at L1/L2, records database, industry chapter | Same audits |
| P3 Signature | TFLN fab-flow Process viewer (R13 architecture), acoustics, Library, short LN film from the scene harness | Same audits |
| P4 Living site | Zenodo releases, MCP edge server (if justified), post-OFC/ECOC refresh routine | Ongoing |

Authoring cost dominates (Distill editors: 50+ hours per article; Bruno Simon 2025 site: a little over a year) [R10]. The plan bets on few, excellent explorables and reuse of the author's existing code.

## 14. Risks

| Risk | Mitigation |
|---|---|
| Property values not yet verified against core handbooks (Weis & Gaylord, Wong, Jazbinsek & Zgonik, Shoji full text were not read this phase; web-search budget and publisher anti-bot pages) [R06, R08] | Verification pass from PDFs the author already holds, before any value goes public; unverified rows hidden |
| 2024-2026 coverage of records and industry incomplete (search budget exhausted in several tracks) | Treat records as provisional; targeted follow-up research; dated "as of" stamps |
| GPL-3.0 atlas engine embedded in a site with MIT code | Author decision: dual-license the engine (sole committer) or license the site GPL |
| Transparent LN unreadable in 3D on dark background; mobile transmission cost unknown | Early prototype on real phones; pre-rendered fallbacks |
| Scope creep from the motif catalog | Launch set of 6 behaviors only; others queued |
| WebGPU gaps (Firefox Linux/Android, older Android) | WebGL2 fallback tested, not assumed |
| Hover-only affordances fail on touch | Tap path and full-page link for every popup |

## 15. Open questions for the author

1. Theme: approve "Optic Axis" (A) as the site grammar, with the atelier (B) and Niobe story (C) as chapter content? Or prefer another direction?
2. Default theme: dark (your default) or light for a public, welcoming site? Proposal: dark default, warm light theme one click away.
3. Licenses: site code MIT? Data CC BY 4.0 or CC0? Dual-license the eo-modulator-atlas engine (GPL-3.0) for embedding, or license the site GPL? Add explicit data licenses to eo-modulator-atlas and photonics-atlas (needed before their data is re-served here)?
4. My LN story: confirm the date range and framing you want on that page.
5. Personal assets: which of these may be published: thesis figures, your SEM images, lab photos, COMSOL animation library (LN mechanics, IDT, FBAR clips), physical LN samples you could photograph for a "specimen cabinet"?
6. Paywalled sources: may agents read your local PDFs (e.g. Weis & Gaylord 1985, Wong, IEEE 176-1987) for verification only, never republished?
7. Launch scope: are F1-F6 right for v0.1? Anything you consider essential at launch (e.g. multilayer DC-drift simulator, boule-to-chip zoom, fab-flow viewer)?
8. Voice: one first-person welcome line from the crystal on the landing page, yes or no? First-person narrative on the My LN story page?
9. Sound: allow optional sonification (off by default) for nonlinear optics and combs?
10. Blender: stay on installed 4.2.3, or move to 5.2 LTS (dispersion and Meshopt export)?
11. Hosting: GitHub Pages under `jwt625/lithium-niobate` with the custom domain, or Cloudflare Pages (custom headers, functions)? Will you create the GitHub repo, or should the agent run `gh repo create jwt625/lithium-niobate --public` when you say so? DNS provider and apex/www records for lithium-niobate.com?
12. Poling animation: do you remember the source paper of the V/I waveform it was matched to? Otherwise switch to a generic, cited waveform.
13. Old blog posts: once content moves here, add a "superseded by lithium-niobate.com/..." note on the 2018 LN posts on outside5sigma.com (they contain known 2018 errors)?

## 16. Side findings outside this repo's scope (no action taken)

- Some older blog posts need sanitizing before any of their content is reused here; specifics were reported to the author outside this repo.
- Most of the author's public repos lack a LICENSE file even where the README states MIT; PlayGround has none, which blocks clean reuse of its builders here [R03, R05].

## 17. Research index

| Note | Topic |
|---|---|
| R01 | Author's public LN record (27 papers, ~24 abstracts, patent, thesis, figure rights) |
| R02 | Blog corpus (23 core LN posts, 83 reading-stream items, salvage and do-not-copy lists) |
| R03 | Reusable local tools (16 candidates; atlas engine, poling animation, materials.json) |
| R04 | Industry trends from eo-modulator-atlas, photonics-atlas, OFC 2026 corpus |
| R05 | Blender workflow (meta) and web 3D delivery; asset list |
| R06 | Material properties: sources, seed table, pitfalls, API design |
| R07 | History (about 90 dated events, people, images, disputes, chapters) |
| R08 | TFLN state of the art (45 reviews, records, physical effects, applications, groups) |
| R09 | Industry, market, supply chain (public sources, graded) |
| R10 | Iconic websites teardown and patterns |
| R11 | In-browser simulation feasibility (benchmarks, architecture, roadmap) |
| R12 | Theme and visual language |
| R13 | Inspirations from advanced-packaging-atlas process animation and hybrid bonding video |

## 18. Next steps (TODO)

- [ ] Author answers to section 15; record decisions here with dates.
- [ ] Verification pass before any value ships: core handbooks (Weis & Gaylord 1985, Wong, Jazbinsek & Zgonik, Shoji 1997 full text, Gayer erratum, Schlarb 1993) from PDFs the author provides or approves; R06 U rows.
- [ ] Resolve open facts: Rose niobium naming year (1844 vs 1846, from the original paper); HyperLight-UMC primary release; R07 unverified table; R09 unverified companies; 2024-2026 records coverage (R08).
- [ ] P0 foundations (section 13) after decisions: scaffold, tokens, theme prototypes (2-3 rendered options), popup component, data schema and build script.

