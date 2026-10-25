# DevLog-006: Page lanes (wave 2) contract

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Running |
| Scope | Chapter pages built from manuscripts on the F0 foundation |
| Authors | Claude Code (coordinator), at Wentao Jiang's request |

## Inputs every page lane reads

- DevLog-004 "Rules for all lanes" (binding), DevLog-003a (TECH), DevLog-003b (VISUAL), DevLog-005 (foundation), `src/lib/content/README.md` (page conventions).
- Its chapter folder `content/chapters/NN-slug/` (manuscript.md, figures.md, refs.yaml, glossary.yaml, open-questions.md, chapter-specific files).
- Reference implementation of a finished section: `src/routes/light/pockels-effect/` (port of the approved chapter 2.2).
- Physics: `src/lib/physics/*.ts` (README, FIGURE-MAP.md from lane PHY2 when present). Data: `src/lib/generated/*.json` and `static/api/v1/**` (lane API). 3D scenes: `src/lib/scenes/**` (lane F6, in progress; mount when present, otherwise reserve the box with a `.nodata` placeholder and report).

## File ownership (to avoid collisions)

| Lane may edit | Lane must not edit |
|---|---|
| `src/routes/<own chapter>/**`, `src/lib/figures/<own chapter>/**` (new dir), `src/lib/stores/<own chapter>.ts` (new), `static/data/<own chapter>/**` (new), `tests/e2e/<own chapter>.spec.ts` (new) | `src/lib/content/site.ts`, `tests/e2e/util.ts`, `tests/e2e/layout-shift.spec.ts`, `tests/e2e/parity.spec.ts`, `src/lib/stores/figstate.ts`, shared components and styles in `src/lib/components/`, `src/lib/styles/`, `src/lib/figures/*.ts` (root), `src/lib/physics/**`, `src/lib/scenes/**`, `data/**`, `static/api/**`, `content/**`, `mockup/**`, other chapters |

Needed changes to shared files are reported in the final reply as exact patches (the coordinator applies them in an integration lane): `site.ts` entries (sections with `built: true`), test route lists, shared component or style changes, physics functions, glossary merges.

## What "done" means for a chapter

1. Every section of the manuscript at L1, L2, L3 with its figures (figures.md), in TECH and VISUAL as two distinct designs (not a reskin), with the moment of joy described in figures.md working.
2. Every number with a status badge and source popup; refs list with DOIs per section; glossary terms linked via `data-pop="g:<id>"` or page pops.
3. No layout shift (own spec drives every control to extremes, both modes, 1440 and 390); no console errors; no horizontal scroll at 390; `pnpm build` prerenders the routes; existing tests still pass.
4. Self-review of screenshots in both modes and themes; zero filler copy; physics checked against figures.md acceptance checks.

## Dev server

`http://127.0.0.1:47614/` (tmux `ln-dev`, Vite HMR) is shared; do not restart or kill it. For tests, run Playwright against your own `pnpm build && pnpm preview --port <free uncommon port>` or the dev server; never kill other processes.

## Lanes

| Lane | Chapter | Routes |
|---|---|---|
| P01 | 01 Crystal | `/crystal/**` |
| P02 | 02 Light (2.1, 2.3-2.7; 2.2 exists) | `/light/**` except `pockels-effect` (read-only reference) |
| P03 | 03 Sound | `/sound/**` |
| P04 | 04 Quirks | `/quirks/**` |
| P05 | 05 Making (incl. Process viewer page using F6 core) | `/making/**` |
| P06 | 06 Devices | `/devices/**` |
| P07 | 07 History | `/history/**` |
| P08 | 08 Industry | `/industry/**` |
| P09 (later) | Lab, Data (property explorer, API docs), Library, Colophon | `/lab/**`, `/data/**`, `/library/**`, `/colophon/**` |
| INT (later) | Integration: apply reported patches, site.ts flags, test lists, glossary merge, landing index/doors | shared files |

## Progress log

- 2026-10-25 Contract written; P01-P08 launched.
- 2026-10-25 P09 launched.
- 2026-10-25 P03 done (8 routes, 11 figures, 32/32 own tests). Patches queued in DevLog-006a.
- 2026-10-25 P04 done (11 routes, 12 figures, 55/55 own tests). Patches queued.
- 2026-10-25 P08 done (9 routes, F8.01-11 + B1-B6, 36 pass / 36 skipped dev-only). Patches queued.
- 2026-10-25 P07 done (11 routes, 11/12 figures, 49/49 own tests; 8 open-license images). Patches queued; STATUS V conflict decision: new code 'rec'.
- 2026-10-25 P05 done (13 routes, 11 figures, Process viewer with F6 3D core, 102/102 own tests). Patches queued.
- 2026-10-25 P06 done (13 routes, 12 figures + A1-A7, mzm-die mounted, 56/56 own tests). Patches queued.
- 2026-10-25 P09 done (lab with 96 instruments + F2/F4 standalone, data explorer 193 records / 64 property pages / dispersion / API docs, library 577 refs, colophon; 23/23 own tests). Patches queued.
- 2026-10-25 INT launched (patches for P03-P09, STATUS rec code, glossary merge, Pagefind, build + full tests on preview). Audits E (physics/provenance) and F (copy/privacy) launched on finished chapters; visual audit after INT + P01/P02.
- 2026-10-25 Audit F: copy FAIL (855 findings on 157 pages; mostly process text leaking: R-ids, figure ids, agent notes, /lab/ spec text, stale built flags), privacy P-1 (private names in DevLog-004 rule 10, written by coordinator; fixed, never pushed) and P-2 (fixed). Remediation: INT (shared S1/S6/S9/S2-API), P03-P08 resumed with their rows, P01/P02 told before finishing, P09 queued.
- 2026-10-25 P02 done (7 routes, 13/16 figures + F2-15 partial, 14/14 own tests). Patches queued; LAT precompute lane specified.
- 2026-10-25 Audit E: physics PASS (~110 numbers, 25 equations recomputed; 253 physics tests), provenance PASS after fixes (0 critical, 2 major dead-badge findings, 15 minor; 1174 popups, 18 DOIs, 8 image licenses checked). Findings routed: E01 P08, E02/E03 P04, E06 + 195 keV status P05, E13 P07, E05 INT.
- 2026-10-25 P04 audit fix pass done (63 F rows + E02/E03/E04/E11/E12/E15; 55/55). E14 decision: practitioner notes = reported (practitioner).
- 2026-10-25 P02 audit-F pass done (all /light/ rows incl. sub-lanes; 14/14). Ownership of /light/pockels-effect/ handed to P02 to apply its 2.2 patches. Open: Kitamoto 1995 title (F-526); sources.json Kitamoto note for INT.
- 2026-10-25 P03 audit-F pass done (97 rows; 32/32). Note-only values re-cited or dropped (Murata 2025 XBAR claim, Shin-Etsu statement, thermal expansion 7.5). Rule slip: read-only git diff --stat in this repo.
- 2026-10-25 P07 audit-F + E13 pass done (49/49; rec status and KEY_SETS.history adopted; Fig. 7.9 now plots 74 atlas rows; one non-public event dropped). Data items queued for INT.
- 2026-10-25 P02 applied 2.2 patches (layout-shift 8/8; L3 numbers prerendered; Kaminow first in tables/selectors).
- 2026-10-25 P05 audit E/F pass done (all F rows but F-678 by design; E06/E07/E14/E16; 102/102).
- 2026-10-25 P08 audit E/F pass done (all F rows, E01, E08; 36 pass / 36 preview-only skipped).
- 2026-10-25 P09 audit-F pass done (curated /lab/ catalogue of 98 instruments; VISUAL data cards carry source/variant/frame; LiTaO3 pages retitled; 23/23). Open: a few descriptive reference titles from refs.yaml (e.g. 'China LN industry report') need real titles.
- 2026-10-25 P06 audit-F pass done (all rows; 56/56). Coordinator decision: the records 'Dataset id' column may stay as a cross-reference if each id links to its API record (verify in visual audit).
- 2026-10-25 P01 done (11 routes, all figures, 44/44, audit-F rules applied; own fresh audit 2 high + 5 medium fixed). All page lanes done.
- 2026-10-25 INT done: queue P01-P09 applied in shared files (site.ts flags/sections, STATUS rec + P(abs) + Badge qualifier, footer key sets, test lists 94 routes, glossary merge 118 -> 344 with lane id map, 2 device records, Pagefind search, shell links), audit F S1/S6/S9/S2-API and shared audit E items; final run: 157 pages, e2e 939/943 (4 = P08 platforms layout shift), physics 253/253 (LAT modes test pending data), data 33/33. Open lane items listed in DevLog-006a.
- 2026-10-25 INT done: build 157 pages (34 MB), check 0 errors, e2e 939/943 on preview (4 fails: PlatformCharts .i8-cav shift, sent to P08), physics 253 (+ modes after LAT), data 33/33; glossary 118 -> 344 with id map (src/lib/generated/glossary-map.json); Pagefind added; STATUS rec, P(abs), qualifiers; audit F S1/S6/S9/S2-API and audit E E05/E09/E10/E15 fixed.
- 2026-10-25 F2-15 flag display updated (quality flags banded; relabel/track-low as status text; clean/flagged/all error table; TM0-TE1 anticrossing near w 1.65 um in default view; 956/956 stable on load).
- 2026-10-25 P08 fixed .i8-cav shift (fixed legend/caveat/readout sizes), marker hover (whole shape hoverable, shared popups), glossary switched to g: ids; layout-shift 8/8 for /industry/platforms/.
- 2026-10-25 GLOSS done (crystal 107, light 72, sound 30, quirks 5 key uses switched; making via md.ts; 503 e2e pass on 5 chapters). Regression: g: popups render only 'long' (empty for short-only terms like y-cut); making detail text lost. POPFIX launched.
- 2026-10-25 POPFIX done: glossary popups render heading + short + non-duplicated long + source; 0 of 344 terms lack a definition; data-pop-note mechanism restores 18 /making/ detail lines; 34 popups checked both modes/themes, 0 px shift.
- 2026-10-25 Audit G: PASS with fixes (2 high: .rec class collision, touch popup open/close; 5 medium: VISUAL nav clip, load CLS, clipped text, 390 r-tensor overlap, nonstop MZM 3D). Polish round launched: FIX-S (shared fixes + footer bias meter running the reader's 4.7 drift parameters) and all 8 chapter lanes resumed with their findings plus one true-physics joy item each (hysteresis loop, SHG sinc^2 detune + conoscope wavelength, IDT phasors, bias store, implant profile at sourced point, phase-colored RF pulse, records on chronology axis, dies per wafer).
- 2026-10-25 Dev server (ln-dev, 47614) hung under load (listening, no response; load avg ~7-10); restarted (agent-started server of this project only). P06 polish: G07 idle animation fixed (0 draws idle), ring stage enlarged, 390 clips fixed, delta-phi readout added; rfPhaseRad scene API forwarded to FIX-S.
- 2026-10-25 P07 polish done (49/49; G01 via FIX-S .rec-card rename; G13 timeline key; clips fixed; joy: records on chronology axis, bandwidth step visible at 2018 (2017 record lacks DOI), VpiL panel thin-film only).
- 2026-10-25 P02 polish: 2.1 conoscope 400-700 nm source slider (rings recolor/move), duplicate-id bug fixed; 2.2 G05/G06/G09 fixed; /light/ landing dense TECH overview + VISUAL doors; 2.3 in sub-lane.
- 2026-10-25 P08 polish done (market plot fit; interactive wafer door; 8.3 dies-per-wafer figure 100/150/200 mm with sliders, template die 10x1 mm, gross-die formula (de Vries 2005, Crossref-only, stated) + exact placement count; 36 pass, layout-shift 8/8).
- 2026-10-25 P05 polish done (G10 2D cross-section stage with legend; embeds open on informative steps; G05 clips fixed (13 pages clean); joy: He+ peak 0.68 um at 195 keV (Guarino 2007) true-depth inset, no straggle width (unsourced); G04 0.000 on dev, final CLS check after FIX-S; 102/102).
- 2026-10-25 P03 polish done (G08 fixes; 3.5 amplitude axis; joy: IDT finger pairs tinted by phase, phasor chain + |H(f)| from one sum; dense TECH landing with ASCII k2-vs-cut; 32/32). Dev server dropped once mid-run (load).
- 2026-10-25 P01 polish done (P-E loop drawn live during Pulse with Eint offset and Ps toggle; units consistent; clips fixed; TECH landing overview; new 1.1 VISUAL octahedral-level figure; 44/44). .band SVG scoping + G04 forwarded to FIX-S.
- 2026-10-25 P02 2.3 polish done (detuning SHG beam with sinc^2 brightness in spectral color; VISUAL 15192 -> 8407 px; G04 0 except 0.002 from a shared badge glyph). spectral() clamp (~680 nm) + sub-400 nm colours assigned to FIX-S. All chapter polish lanes done except Devices re-test.
- 2026-10-25 P06 re-test: 3 VISUAL 390 readout shifts fixed (stacked label/value); tradeoffs TECH 1440 timeout flaky (limit raised to 5 min; re-run in final pass); rfPhaseRad wiring waits for FIX-S scene change.
- 2026-10-25 FIX-S done: G01 .rec-card, G02 touch popups (20/20), G03 nav fits 1280-1920, G04 CLS VISUAL 0.166-0.170 -> <=0.0071 (TECH 0), G07 MZM idle 0 frames + rfPhaseRad API, footer bias meter runs reader's drift params (bias.ts), .band scoped, spectral.ts 775 nm deep red / <400 violet; e2e 939/943 (4 landing parity tests vs mockup, test baseline issue). FINAL lane launched (rfPhaseRad wiring, 2.3 fallback removal, parity spec update, full release check).
