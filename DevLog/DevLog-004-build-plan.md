# DevLog-004: Build plan (full site)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Build complete for review (2026-10-25); awaiting author review and answers in DevLog-004a |
| Scope | Build the real site from the approved mockup: content, data/API, physics, all chapters, 3D, both design systems |
| Authors | Claude Code (coordinator), at Wentao Jiang's request |

## Author direction (2026-10-25)

"I approve the overall layout and visual style. Now go ahead build out the actual details. Delegate to subagents accordingly and build in parallel as much as possible. Keep in mind the original goal and purpose of this website. Pay attention to details. It should spark joy, and people should think of this website whenever they hear or think of LN again."

Original goals (DevLog-000): augment review papers with what a PDF cannot give (true 3D, interactivity, in-browser simulation, AI-accessible property endpoints); progressive depth (lay first glance, expert depth in 2-3 clicks); proper history; industry trends from eo-modulator-atlas; joyful, welcoming, iconic; subtle theme details echoing fabrication, applications, and effects (GRIIRA, Li diffusion and vacancies, charge screening, bias drift, TWM, FWM, OPO).

## Architecture decisions

| Topic | Decision | Reason |
|---|---|---|
| App | SvelteKit (adapter-static) + TypeScript + Vite + pnpm, at the repo root (`package.json`, `src/`, `static/`) | Author default for new projects; DevLog-001 sec. 10 |
| Design systems | Port of the approved mockup: TECH (DevLog-003a) and VISUAL (DevLog-003b) as two layers with mode-specific component variants | Approved 2026-10-25 |
| Reference implementation | `mockup/` stays read-only as the visual reference until the port is complete | Fidelity |
| Physics | `src/lib/physics/*.ts`, pure functions, erasable TypeScript only (no enums, namespaces, parameter properties), tests `*.test.ts` runnable with `node --test` (Node 23.7 strips types) | Framework-agnostic, testable before the app exists |
| Data | Canonical YAML in `data/` with JSON Schemas in `data/schema/`; builder `scripts/build_data.py` (uv, PEP 723 inline deps) writes `static/api/v1/**`, `static/llms.txt`, `static/llms-full.txt`, `src/lib/generated/*.json` | Provenance-first, one source of truth (DevLog-001 sec. 7, R06 sec. 4) |
| Content | Chapter manuscripts in `content/chapters/NN-slug/manuscript.md` + `refs.yaml` + `figures.md` (figure specs) + `glossary.yaml`; integration lanes turn them into routes | Content research runs in parallel with the scaffold |
| Licenses | Code GPL-3.0; data CC BY 4.0 | Author decision |
| Hosting | None yet (localhost review only) | Author rule |

## Rules for all lanes (binding)

1. Zero filler copy. Every sentence states a fact, number, definition, mechanism, or how to operate a control. No meta-claims about the site, no process labels on pages. Readers are experts or curious adults; never condescend.
2. Progressive depth: L1 (phenomenon, lay-readable, one interactive), L2 (quantitative model, equations, tensors, data), L3 (how it is computed or measured, normalization, conventions, error sources, primary data).
3. No fabricated data. Every number has a source (DOI/URL/local research note id) and a status (P, P(abs) abstract only, P-comp, P-db, S, V, U, reported, derived, template). Unverified values are labeled U and never presented as fact. Placeholders say they hold no data.
4. No layout shift during interaction or on data load (fixed-format readouts, reserved boxes); verify with bounding boxes at control extremes.
5. Both design systems for every component: TECH (minimal, dense, monospace, small controls, ASCII where art is needed, static) and VISUAL (illustrative, large type and controls, color from optics, 3D where it explains, theme motifs). Not a reskin.
6. Sharp corners; dark default plus light theme; no emoji; ISO dates; SI or field-standard units with absolute values; data-only plots with log toggles where data span decades.
7. Copyright: never copy paper figures or handbook tables in their layout; re-key values with citations; redraw or simulate. Public-domain or CC images only with license recorded.
8. Privacy: public repo; no absolute local paths, no private repos or their existence, no personal info beyond the author's public record; the author's own career story is inspiration only (no "my story" page); his published work may appear where it fits the physics.
9. Joy: delight comes from true physics made tangible (a figure that responds the way the crystal does), from craft (typography, alignment, motion with purpose), and from the theme motifs (R12). Not from decoration or gimmicks.
10. No git commands, no deployment, no installs except where a lane is explicitly given ownership of `package.json`. Do not read the author's private repositories or folders (the coordinator names them in briefs, never in repo files). Do not send personal info (email etc.) to any web service. Polite web access; stop on anti-bot.

## Waves and lanes

### Wave 1 (parallel)

| Lane | Deliverable | Owns |
|---|---|---|
| PHY | Physics core with tests: units, Sellmeier models (Zelmon CLN/MgO with erratum, Jundt, Gayer with erratum status), phase matching and QPM, coupled-mode SHG/SFG/DFG/OPA, OPO threshold, conoscope (Jones), index ellipsoid and r-tensor with exact eigen-decomposition, tensor rotation (Voigt and full, IEEE 176-1987 frames, COMSOL ordering), MZM closed form and eye diagram, ring resonator and EO comb, DC-drift RC model, photorefractive (band transport, reduced) toy, Christoffel solver | `src/lib/physics/` |
| API | Data model, schemas, seed data from R06/R14 (verified rows only in default endpoints), sources registry, dispersion models, history events (from R07), industry events (from R04/R09), publications (author's public LN record, R01), records (R08), glossary seed; builder; llms.txt; OpenAPI; datapackage; CITATION.cff; tests (spot values, schema validation, symmetry) | `data/`, `scripts/build_data.py`, `static/api/`, `static/llms*.txt`, `CITATION.cff`, `tests/data/` |
| C01 | Manuscript: The crystal (structure, composition, defects, domains, poling) | `content/chapters/01-crystal/` |
| C02 | Manuscript: Light (birefringence, Pockels incl. existing 2.2, nonlinear optics: SHG/SFG/DFG, QPM, OPA/OPO, Kerr and EO combs) | `content/chapters/02-light/` |
| C03 | Manuscript: Sound (piezoelectricity, elastic/acoustic waves, SAW/IDT, acousto-optics, piezo-optomechanics incl. the author's published work) | `content/chapters/03-sound/` |
| C04 | Manuscript: Quirks (photorefraction, GRIIRA/BLIIRA, pyroelectricity, DC drift, thermal effects, Li out-diffusion, charge screening) | `content/chapters/04-quirks/` |
| C05 | Manuscript: Making (Czochralski, wafers, LNOI by ion slicing and bonding, CMP, lithography, Ar+ milling and alternatives, electrodes, poling, packaging), incl. the fab-flow Process viewer spec (R13) | `content/chapters/05-making/` |
| C06 | Manuscript: Devices + Industry (modulators, frequency converters, combs, quantum, RF filters; records; atlas-driven trends; supply chain; market ranges by grade) | `content/chapters/06-devices/`, `content/chapters/08-industry/` |
| C07 | Manuscript: History (10 chapters, about 90 events, disputes, people, images with licenses) | `content/chapters/07-history/` |

D4 (mockup VISUAL integration) finishes first; F0 starts after D4.

### Wave 2

| Lane | Deliverable |
|---|---|
| F0 | SvelteKit scaffold, port of the shell (masthead, modes, theme, spine, popups, badges, readouts, footer), landing and chapter 2.2 port at fidelity, routes skeleton, Playwright harness incl. layout-shift and screenshot tests |
| P01..P08 | Chapter pages from manuscripts on F0, figures implemented with PHY |
| F6 | Crystal in Hand + VISUAL 3D scenes (boule, wafer, LNOI stack, MZM die) per R05 |
| A | Fresh-context audits: physics, data provenance, copy (slop scan), visual (both systems, both themes, 1440/390), privacy |

## TODO

- [x] Wave 1: PHY, API, C01-C07
- [x] D4 integration (mockup), then F0
- [x] Wave 2 lanes (P01-P09, F6, PHY2, LAT, INT, GLOSS, POPFIX)
- [x] Audits and fixes (E physics/provenance, F copy/privacy, G visual; polish round; FIX-S; FINAL)

## Progress log

- 2026-10-25 Plan written; wave 1 launched.
- 2026-10-25 Wave 1 running: PHY, API, C01, C02, C03, C04, C05, C06 (06+08), C07 (9 lanes) plus D4 phase 2 on the mockup (10 concurrent). F0 queued after D4.
- 2026-10-25 D4 phase 2 done (mockup carries both systems; TECH regression clean; 0 px shift). F0 launched (SvelteKit port). C01 manuscript done (10 sections, 10 figures, 54 refs). Author questions collected in DevLog-004a.
- 2026-10-25 C05 manuscript done (sections 5.0-5.12, 11 figures incl. Process viewer spec, process-flow.yaml 30 steps / 2 routes anchored on Luke 2020 and Li 2023, 74 refs). Gaps: He/H implant range vs energy (needs SRIM or published range data), wafer flat specs, boule poling, Preston coefficient (template). Note for page lanes: eo-modulator-atlas, photonics-atlas, advanced-packaging-atlas are public and may be cited.
- 2026-10-25 PHY done: 92 tests pass (node --test via folder package.json main=test-all.ts; import single files). QPM 6.818/18.989 um; Christoffel vs kushibiki1999 within 0.03%; conoscope exact path (mockup path off ~6% retardance at NA 0.55); R11 acceptance-bandwidth formula was half width (code uses full width); drift/photorefractive parameters template pending sources. F0 told to use PHY (exact conoscope on idle).
- 2026-10-25 C02 done (2.1-2.7, 16 figures, 98 refs, 66 glossary terms, own audit fixed 13 defects). Questions 3-4 added to DevLog-004a; GPL worker decision resolved.
- 2026-10-25 C03 done (3.0-3.7, 11 figures, 65 refs, own audit fixed 3 high issues). SAW 128YX 3978.4 m/s k2 5.41%; quoted 41/64 deg k2 traced to Warner constants. Needs: PHY2 lane (SAW partial-wave solver etc.), LiTaO3 constants in API. Q5 added.
- 2026-10-25 C04 done (10 sections, 12 figures, 79 refs, own audit fixed 11 errors). Relayed: 120 C DC-stable result is TFLT (to C06, API); Photonics 2026 DOI 10.3390/photonics13040339 (to API); LiTaO3 constants requested from API. Q6-Q7 added.
- 2026-10-25 C06 done (06: 6.0-6.12, F6.01-12, charts A1-A7, 20-row records table; 08: 8.0-8.9, F8.01-11, charts B1-B6; 132+78 refs; audit fixed 18). Atlas pinned at eb97f96. R08 correction: Chen 2024 SHG ~1e4 %/W (not 104). Rule slip: one read-only git log in eo-modulator-atlas (reported to author). Q8-Q9 added.
- 2026-10-25 API done: 33/33 tests, deterministic rebuild; sources 118, scalars 149 (144 public), tensors 49, dispersion 7, history events 91 (83 public), industry 51 (31 public), publications 29, records 132, glossary 118, 382 API files + llms.txt. LT: c14, Bond 1965 indices, r33 only (full LT sets unverified). Gaps: 1550 nm EO values; kushibiki1999 c^E and e table locators. Launched PHY2 (figure-needed functions, SAW solver, Chung 1991 check) and F6 (3D scenes: crystal-in-hand, LNOI stack, MZM die, process-viewer core).
- 2026-10-25 C07 done (10 chapters, 4 hero stories, disputes D1-D13, 162 events, 213 refs; audit 59 issues, all high fixed). Resolved: niobium named 1844-10-31; Czochralski 1917-04-24; 1965 IDT on quartz; Mok 1993 Northrop. API lane resumed to merge events and the 20 R07 corrections. Wave 1 manuscripts complete (C01-C07).
- 2026-10-25 API merge of C07 done: history 170 events (160 public, 10 U), industry 51 (32 public), sources 284, 548 API files; id map data/events/c07-source-id-map.yaml for page lanes; volk2008 issued 2009 (id kept).
- 2026-10-25 F0 done (SvelteKit 2.70/Svelte 5/Vite 7, three 0.169.0, 94 e2e tests pass, parity vs mockup <=0.18% outside conoscope, dev http://127.0.0.1:47614/ tmux ln-dev). Wave 2 page lanes P01-P08 launched per DevLog-006 (with PHY2, F6 = 10 concurrent). README updated.
- 2026-10-25 F6 done: scenes crystal-in-hand (custom refraction shader, Zelmon C/d/F), lnoi-stack (TMM thin film; Malitson SiO2, Green 2008 Si), mzm-die (li2026aa, pulses with RF, Vpi 2.90 V), process-viewer core (s07-s15); budgets within limits (27k tris, <=42 draws, 0 idle frames, deterministic). Open: LNOI colors muted (physically expected, unverified vs photo), wafer reads grey, no Blender stills. Scenes relayed to P01/P05/P06. P09 launched (lab, data, library, colophon).
- 2026-10-25 PHY2 done: 253 tests (92+161), FIGURE-MAP.md; saw.ts reproduces C03 (128YX 3978.36/3870.72 m/s, 5.411%); correction: 36-41 deg YX leaky root is real (k2 15.71% not indicative, loss 2.0e-4 dB/lambda); Chung 1991 closed access (twResponse checked vs numerical line + Alferness 1982); gaps: TFLN mode lattice, IDT conductance, AO efficiency, Preston, implant range, MgO basis re-read. Relayed to all page lanes.
- 2026-10-25 LAT: full 6300-solve run in tmux ln-lat (started 11:18Z, ETA ~12:25Z; single 4.2 GB process, 58% RAM free at check). Pilot OK; li2026aa within 1e-3. Follow-ups: run node --test src/lib/physics/modes.test.ts after lattice.json lands; width axis stops at 3.0 um while li2026aa is 3.5 um (extend axis if the figure needs the device point inside the lattice). logs/ added to .gitignore.
- 2026-10-25 LAT run complete: lattice.json 677 kB, 6300 solves; modes tests 6 pass / 1 skip (live engine, optional). Held-out (126): clean TE0 n_eff median 1.0e-3, p95 4.1e-3; n_g median 4.8e-4, p95 6.3e-3; flagged points p95 up to ~0.07. P02 resumed to wire F2-15.
- 2026-10-25 F2-15 live mode-lattice figure done (TECH/VISUAL, flags, error table, Li 2026 out-of-range reference; 936/936 stable on load). Bug found: TE0/TM0 swapped at x-cut t=900 nm (TE fraction 0.007) without a flag; LATFIX launched (relabel by dominant polarization, POL_RELABELED/POL_HYBRID flags, recompute held-out incl. flagged-only stats).
- 2026-10-25 LATFIX done: 1374 points relabelled by dominant polarization (no re-solve); flags POL_RELABELED=128, POL_HYBRID=256; 809 TRACK_LOW; physics tests 260 pass / 1 skip; held-out TE0 n_eff all p95 4.1e-3 (was 9.7e-3). f27 flag-mask update sent to its owner.
- 2026-10-25 FINAL release check: e2e 943/943 on production preview (19.3 min), physics 260 pass / 1 skip, data 33/33, data build deterministic, pnpm check 0 errors (83 warnings), build 157 pages 35 MB, hygiene clean (no paths/secrets/private names/emoji, no files > 5 MB). Not committed. Known: spectral.ts renders 450 nm as violet (#7500ff), should read blue. Review server: tmux ln-dev http://127.0.0.1:47614/.
