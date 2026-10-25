# Audit G: visual systems, defects, coherence, interaction, joy, performance

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Auditor | Fresh-context audit subagent (Claude Code); no prior conversation context; read-only except this file |
| Target | Dev server `http://127.0.0.1:47614/` (Vite dev, unbundled). The `build/` folder is older than 51 source files, so no production build was measured |
| Rules applied | DevLog-003a (TECH), DevLog-003b (VISUAL), DevLog-004 binding rules 4-6 and 9 |
| Method | Playwright 1.64 with system Chrome (headless, SwiftShader WebGL). 32 pages x 6 combinations = 192 full-page screenshots: TECH dark, VISUAL dark, TECH light, VISUAL light at 1440 px; TECH dark and VISUAL dark at 390 px (iPhone 13 touch emulation, DPR 1). Each page was scrolled to the bottom before capture so lazy figures render. Every screenshot was viewed as a slice montage, with full-resolution crops where something looked off. DOM checks on every capture: horizontal overflow, non-zero border radius, broken images, console errors and failed requests, clipped text (overflow hidden without ellipsis), WCAG contrast of body text, readouts, captions, footer, nav, SVG text and badges. Interaction: 25 sliders on 11 figures in each mode driven to min and max, with a bounding-box diff of every element in `main` and a pixel diff of the figure; one button-driven figure (poling Pulse); popups opened by hover, focus, Esc and tap on 24 targets x 2 modes. Performance: cold load with the cache disabled, two runs each, CDP network bytes, paint timing, layout-shift entries, long tasks, idle WebGL and 2D draw counts |
| Pages | `/`; the 8 chapter landings; 2 sections per chapter (crystal/lattice, crystal/poling, light/pockels-effect, light/second-order, sound/surface-waves, sound/idt-filters, quirks/photorefraction, quirks/dc-bias-drift, making/thin-film, making/process-viewer, devices/modulators, devices/frequency-conversion, history/bell-labs-grows-a-crystal, history/thin-film-renaissance, industry/platforms, industry/market); `/lab/`, `/lab/phase-matching/`, `/lab/tensors/`; `/data/`, `/data/curie-temperature/`; `/library/`; `/colophon/` |
| Artifacts | Scratchpad folder `audG/`: `shots/<page>__<mode>-<theme>-<width>.png` (192), `mont/` and `pair/` (slice montages), `crops/` (evidence crops), `ix/` (interaction frames), `metrics.json`, `interact.json`, `clipscan.json`, `perf-2026-10-25.log`, scripts `capture.mjs`, `interact.mjs`, `clipscan.mjs`, `perf.mjs`, `cls.mjs`, `idle.mjs`, `svgc.mjs`, `wafer.mjs` |

## Verdict

**PASS with fixes.** The two systems are clearly distinct on all 32 audited pages, the shell is coherent, and nothing is blank or broken in any of the 192 captures. Two high defects need fixing before review: in TECH, REC provenance badges render as full-width boxed bars across the History chapter (G01), and on touch devices a tap opens a popup and closes it again straight away (G02). Five medium defects remain: VISUAL masthead nav clipped at 1440 px, text clipped in table cells, load-time layout shift on the heavy VISUAL pages and 2.3, an overlapping readout table at 390 px, and the MZM die 3D animating continuously while it is on screen.

Clean on all 192 captures:
- 0 console errors or warnings, 0 failed requests, 0 broken images.
- 0 pages with horizontal page scroll at 390 px (`scrollWidth` = 390 everywhere).
- 0 rounded corners, except two 14 px legend circles (G12).
- Wafer site map and nav state correct on every page: 12 dies, all linked, correct "here" die; active chapter marked; no "(not built)" left.
- All body text, readouts and nav meet WCAG AA 4.5:1.
- Desktop popups open on hover and on focus, close on pointer leave and Esc, and stay inside the viewport.
- Slider-driven figures: 0 px layout shift outside the figure at both extremes, except the Process viewer's internal step list (expected) and one 8.8 px exponent jump (G09).

## 1. TECH vs VISUAL distinctness

| Axis | TECH (measured) | VISUAL (measured) | Distinct |
|---|---|---|---|
| Type | IBM Plex Sans 13 px for h1, h2 and body on all 32 pages | Newsreader h1 88 px, h2 42 px, body 19 px; Inter for UI and numbers | yes, from the first glyph |
| Page | bordered sheet on a desk, hard shadow | full bleed, 72 px optic-axis gutter, poled-domain band with the QPM period printed | yes |
| Controls | slider rows 18 px; segmented buttons mono uppercase | slider rows 44 px, diamond thumbs, sentence-case segmented buttons, 532 nm fill | yes |
| Figures | ASCII cell, ASCII domain maps (poling), ASCII cross-sections (Process viewer), line SVG | 3D cell, boule and LNOI stack, illustrated optical bench, illustrated domain bench, 3D MZM die, colored field maps | yes |
| Data | boxed tables (e.g. `/data/curie-temperature/`) | specimen cards with glyphs; spread chart with diamonds | yes |
| Length | e.g. landing 3085 px, 2.3 7117 px | landing 7189 px, 2.3 15192 px (1.6x to 2.8x TECH) | yes |

Closest to a reskin, though acceptable: reference tables, source lists and L3 data plots (e.g. `/lab/phase-matching/` tuning curves, the 2.2 L3 field maps) use the same chart restyled. Those are data, so a different form would not add anything. No page failed this check.

## 2. Findings

Severity: H = visible breakage or rule violation on many pages; M = visible defect on a page class or a binding-rule miss; L = polish.

| ID | Sev | Page(s) | Mode / theme / width | Finding | Screenshot | Fix |
|---|---|---|---|---|---|---|
| G01 | H | `/history/` (definition, chronology status key: 5 of 303 badges), `/history/a-crystal-on-paper/` (35 of 46), `/history/bell-labs-grows-a-crystal/` (29 of 41), all 7.x pages, `/colophon/` status key | TECH, both themes, all widths | The REC badge `span.b.rec` matches the data-record card rule `.rec { display: grid; grid-template-columns: minmax(0,300px) minmax(0,1fr); border; box-shadow }` in `src/lib/styles/tech.css:231`. Every REC badge inside prose renders as a block about 310 to 580 px wide with a border and shadow, which breaks the definition sentence into fragments ("[Arfwedson 1818 / REC box / ];") | `crops/history-tech-def.png`, `shots/history__tech-dark-1440.png`, `shots/history-bell__tech-dark-1440.png` | Rename the card class (`.rec-card`) or scope it (`div.rec`, `.rec:not(.b)`). VISUAL is unaffected because visual.css restyles `.b.rec` |
| G02 | H | every page with popups | touch (hover: none), TECH and VISUAL, 390 | A tap opens the popup and closes it in the same gesture. Event trace: touchstart, touchend, mouseover, focusin -> `show()` (pop `show` = true), click -> `current === el` -> `hide()` (false). The popup appears on the second tap. In the automated run, 18 of 24 single taps ended with the popup closed. The 6 that "passed" only did so because the previous popup was covering the next target and caught the tap (Playwright: "#ln-pop intercepts pointer events") | `ix/tap-390-after2.png`; trace in `interact-2026-10-25.log` | `src/lib/components/Popups.svelte`: in `focusin`, return early when `touch()`, so the click handler alone toggles; or ignore a click within 500 ms of a focus-show on the same element. After that, give the tapped element priority over a popup covering it (close on outside tap before hit-testing, or place the popup clear of the anchor row) |
| G03 | M | all pages | VISUAL, both themes, 1440 | The masthead chapter nav is `overflow-x: auto` with client width 716 px and scroll width 735 px, so it shows "08 Industr" with a hidden scroll. The active-chapter underline sits under a cut label on Industry pages | `crops/visual-mast-light.png` | Reduce item gaps (19 px are needed), drop the numerals at widths under 1500 px, or let the logotype block shrink |
| G04 | M | `/light/second-order/` TECH (CLS 0.317); `/making/process-viewer/` VISUAL (0.158); `/light/second-order/` VISUAL (0.155 to 0.166); `/crystal/` VISUAL (0.049 to 0.055); `/` VISUAL (0.038) | load | Layout shift during load (rule 4 says no shift on data load). Sources from `layout-shift` entries: the 2.3 TECH `div.panel.f23p` changes height 456 -> 436 -> 457 px within 70 ms; VISUAL h1 moves 207 -> 213 px on every VISUAL page (Newsreader swap); `div.mk-figs` height 164 -> 132; landing `.v-hero-text` height 574 -> 611 -> 574 | `cls.mjs` output in this report, section 6 | Reserve the f23p panel height (fixed rows for its conditional lines); add a size-adjusted fallback face (`size-adjust`, `ascent-override`) for Newsreader, or preload it; fix the `mk-figs` and hero-text heights before hydration |
| G05 | M | `/light/pockels-effect/` VISUAL L1 readout table and coefficients table; `/light/second-order/` TECH value cells ("2600.0 %/W", "301.9 fs/mm"); `/making/thin-film/` TECH status badges ("reported", "template"); `/lab/phase-matching/` ("2.13756 2.13756 2.17837", "rad/µm"); `/lab/tensors/` count line; `/industry/market/` plot (16 px overflow) | 1440, both modes as listed | Text clipped by `overflow: hidden` with no ellipsis: badge words lose their last letters ("P-comp" -> "P-com", unit "rad/mm" -> "rad/m"). 30 instances at 1440 and 50 at 390 (clipscan) | `crops/pockels-vis-l1clip.png`; `clipscan.json` | Size status columns to the longest badge (P-comp, derived and template need about 9 ch plus the glyph); unit columns at least 7 ch; let value cells wrap or widen them |
| G06 | M | `/light/pockels-effect/` L2 r-tensor readout | TECH, 390 | In the "δn along (vector)" rows, the vector "(+1.000, +0.000, +0.000)" overprints the value "−4.162×10⁻⁵" | `crops/pockels-tech390-rt.png` | Below 600 px put the direction vector on its own line (or in the third column); give the value cell `white-space: nowrap` and a min width |
| G07 | M | `/devices/modulators/` | VISUAL, in view | The MZM die 3D draws continuously with no input: 7,471 WebGL draw calls in 4 s idle. It stops when scrolled away and under reduced motion. DevLog-003b sec. 6 says "No autoplay loops; idle = 0 frames", and F6 reported 0 idle frames | `idle.mjs` output | Animate RF pulses only while a drive control is being operated or for 1 s after, then settle; or play on hover/focus of the figure |
| G08 | M | `/quirks/dc-bias-drift/`, `/quirks/photorefraction/`, `/light/second-order/` VISUAL HUD lists; TECH ASCII figures (sound door, IDT comb, photorefraction slab, 2.3 domain strip, landing Fig. 1 caption bar) | 390 | At phone width, HUD `dd` values are cut (e.g. "600 nm, ε 28.0, σ 1.0e−15 S/m" shows 143 of 242 px) and ASCII `pre` art is clipped on the right with no scroll | `pair/quirks-drift__m390.png`, `pair/sound__m390.png`, `clipscan.json` | Stack HUD rows (label above value) below 480 px; set `overflow-x: auto` on ASCII `pre`, or regenerate the art at a phone column count (the figures already know their character pitch) |
| G09 | L | `/light/pockels-effect/` VISUAL | 1440 | The exponent of a readout (sup "−3" / "−4") moves 8.8 px horizontally when the field slider goes from min to max; the readout is not fixed width | `interact.json` (F02 visual s2) | Use a fixed mantissa width (`min-width` in ch) and tabular figures for the exponent |
| G10 | L | `/making/process-viewer/` steps 1-6 and 16-23; `/making/thin-film/` embed | VISUAL | Steps without a 3D model show a large dark stage with the line "No 3D model for this step" and a flat sliver. The thin-film embed opens on step 7 (handle and oxide only), the least informative frame | `ix/pv-visual-strip.png`, `ix/thinfilm-embed-visual-sm.png`, `ix/thinfilm-embed-visual-s10-sm.png` | Draw the 2D cross-section at stage size for those steps (the TECH ASCII cross-section already exists as data); open the embed at step 10 (split) |
| G11 | L | `/lab/` | VISUAL | The VISUAL lab index lists all 98 instruments as large cards: 19,467 px at 1440 and 50,401 px at 390 (TECH: 6,862 / 7,203 px) | `shots/lab__visual-dark-390.png` | Collapse chapter groups by default or show a compact card grid at 390 |
| G12 | L | `/crystal/poling/` | VISUAL | Two legend glyphs (`i.g.dot`, `i.g.x`, 14 px) use `border-radius: 50%`. They are the field-out-of-page and field-into-page symbols, so the circle carries meaning, but it is the only rounded element on the site | `metrics.json` | Draw them as SVG so the no-radius CSS rule stays absolute, or leave as is and record the exception in DevLog-003b |
| G13 | L | `/history/` chronology histogram | VISUAL | The bars use several hues (green, pink, yellow) with no on-chart key; their meaning (chapter, status?) cannot be read from the page. Rule 10 of 003a / sec. 3 of 003b: color only with meaning | `pair/history__m390.png` | Add a key, or use one hue with grade fill patterns |
| G14 | L | all pages (TECH) | dark 4.65:1, light 4.82:1 | The tertiary text token (`--fg3`, #7d7c77 on #0d0d0e) passes AA but is used at 9.5 to 11.5 px for badges, captions and ticks. It is the lowest ratio in TECH | contrast table | Raise `--fg3` in dark to about #8a8984 (5.6:1) for text at or under 11 px |
| G15 | L | page weight, all pages | dev | `src/lib/generated/glossary.json` (264 kB) and `sources.json` (198 kB) are imported on every page in the dev graph. The glossary lane may change this; check after the production build | `req.mjs` output | Lazy-load the glossary (the popup engine already has `loadGlossary`); import per-page source subsets |

Checked and not a defect:
- TECH Industry landing contains a Newsreader paragraph (`p.i8-lede`), but it is the hidden VISUAL variant (height 0).
- The poling Pulse "shift" (1024 moved elements) came from the sticky depth nav; section h2 positions stayed fixed before, during and after the pulse in both modes.
- Process viewer scrubbing moves rows only inside its own list and HUD; section positions did not move (1429 / 2013 px TECH, 1976 / 3106 px VISUAL at min, mid and max).

## 3. Coherence across chapters

| Check | Result |
|---|---|
| Shell (masthead, mode and theme toggles, search, footer with site map, status key, license, MZM bias meter) | identical on all 32 pages in each mode; footer keys list only the codes the page uses (e.g. Sound landing shows only DERIVED) |
| Wafer site map | 12 dies (8 chapters, L, D, R, C, landing), all linked, the "here" die matches the page on all 32 pages; no "(not built)" titles |
| Nav active state | correct for chapters; none on extras (Lab, Data, Library, Colophon), which have no nav cell; the wafer die marks them |
| Depth tabs (L1 / L2 / L3 / Sources) | same component and style on every section page in both modes |
| Chapter landings | same template (definition, sections table or cards, cross-links); VISUAL section cards look the same across chapters 01, 02, 03, 04 (`crops/cards-compare.png`) |
| Figure frames | TECH panels with header strip and badge row everywhere; VISUAL corner-tick frames everywhere; captions with provenance badges under every figure |
| Badges | consistent glyph and word in VISUAL; consistent SKU tags in TECH, except G01 |
| Chapter door art (landing VISUAL) | all eight drawn and matching 003b sec. 5 (stereogram tracery, white-light conoscope, IDT ripples, kintsugi crack over trace, hatched boule, MZI with Au G-S-G and 1550 nm dashed false color, period ticks, wafer pictogram) | 

Inconsistency: door status lines use mixed formats ("1.1 to 1.10", "2.1 to 2.7, L1 to L3", "4.1-4.10, 12 figures", "5.1-5.12 and the Process viewer, L1 to L3", "1801 to 2026: 159 events, 4 hero stories", "8.1 to 8.8"). Unify them as "N.1 to N.k" plus one fact (`crops/landing-vis-doors.png`).

## 4. Interaction spot checks (11 figures, both modes, 1440)

| Figure | Page | Controls driven (min -> max) | Pixels change | Layout shift outside figure | Readouts | Notes |
|---|---|---|---|---|---|---|
| Conoscope | `/` | field E, thickness d | yes | 0 | fixed | VISUAL bench redraws plate and field arrows |
| MZM / Pockels | `/light/pockels-effect/` | drive V, wavelength, field Ez | yes | 0 (VISUAL: exponent moves 8.8 px, G09) | fixed except G09 | |
| SHG growth | `/light/second-order/` | pump power, length | yes | 0 | fixed | VISUAL domain strip grows with L by design (drawn to scale) |
| Poling bench | `/crystal/poling/` | field, pulse; Pulse button | yes | 0 (sections fixed during and after the pulse) | fixed | TECH ASCII nucleation and V/I/Q/X traces are excellent |
| SAW field | `/sound/surface-waves/` | phase ωt | yes | 0 | fixed | |
| Photorefraction slab | `/quirks/photorefraction/` | intensity, exposure | yes | 0 | fixed | |
| Process viewer | `/making/process-viewer/` | scrub min/mid/max | yes | 0 at section level | fixed | step list scrolls internally |
| Modulator eye | `/devices/modulators/` | Vπ/swing, f3dB/symbol rate, bias | yes | 0 | fixed | G07 continuous 3D |
| Phase matching | `/lab/phase-matching/` | λ fund., λ2 | yes | 0 | fixed | |
| Tensors | `/lab/tensors/` | Euler α, β | yes | 0 | fixed | |
| DC drift | `/quirks/dc-bias-drift/` | σ film / cladding conductivity | yes | 0 | fixed | |

Control sizes match the specs: TECH slider rows 18 px, VISUAL 44 px on every figure.

Popups (24 targets per mode on `/`, `/light/pockels-effect/`, `/making/process-viewer/`):
- desktop hover: 24/24 open; pointer leave: 24/24 close; focus: 24/24 open; Esc: 24/24 close. All popups stay within 12 px of the viewport edge.
- touch tap: fails per G02.

## 5. Joy and craft, per chapter

| Chapter | Strongest moment | Weakest moment | Suggestion (true physics, no gimmick) |
|---|---|---|---|
| 01 Crystal | VISUAL 3D boule with a dispersive refraction shader: spectral fringes on the cone edges come from the Zelmon dispersion; TECH ASCII poling bench where domains nucleate at finger edges and merge while the V/I/Q traces draw themselves | `/crystal/` TECH is a plain sections table; the 1.1 VISUAL hero repeats the landing cell | Draw the measured P-E hysteresis loop point by point as Pulse runs (Q/A vs E with the internal-field offset), so the 0.71 / 0.80 µC/cm² sources are seen as a loop rather than a number |
| 02 Light | Live white-light conoscope; applying E splits the isogyres (biaxial), with the HUD giving Δn_ind and the optic-axis angle; 2.2 L3 FEM field maps beside the overlap integrals | 2.3 runs to 15,192 px in VISUAL with many similar line plots; the Light landing is short | On 2.3, let the reader detune the poling period and watch the generated 532 nm beam brightness follow sinc²(ΔkL/2), with the beam color computed at the SHG wavelength. Add a source-wavelength slider to the conoscope so the rings recolor from the computed spectrum |
| 03 Sound | 3.3 partial-wave SAW field with retrograde particle ellipses and a decaying depth profile from the real solver (3978.4 m/s, 128 Y-X) | TECH Sound landing (table plus one ASCII comb); the 3.5 VISUAL wave strip has no amplitude units | On 3.5, sweep the test tone and light each IDT finger pair by its phase contribution, so the sinc response is visibly built from N phasors |
| 04 Quirks | "Write a scar, turn the light off": a 3D slab whose index grating grows with exposure and decays over the computed dielectric relaxation time (1.16 d at 1e-15 S/m); 4.7 layered-relaxation simulator with Arrhenius temperature | 4.7 mitigations scatter: small markers in a large empty frame; heavy tables in 4.1 TECH | Make the footer bias meter run the 4.7 model with the parameters the reader last chose on 4.7, so the drift motif on every page is the reader's own device |
| 05 Making | Process viewer VISUAL: LNOI formation in 3D (implant, bond, split, CMP) with a HUD of reported, derived and template values; hatched-boule door | Steps without 3D show an empty dark stage (G10); the 5.5 embed opens on step 7 | Show He⁺ range and straggle as the implant profile at the reported energy, drawn on the cross-section at true depth scale (when range data are sourced; R13 lists it as a gap) |
| 06 Devices | 3D MZM die beside the transfer curve and live eye diagram; atlas scatter of 71 TFLN rows with Γ_implied | Continuous 3D animation (G07); ring/PhC figures small next to the MZM | Color the RF pulse on the die by the local optical phase difference Δφ(V) that the transfer curve uses, so the eye, the curve and the die show one number |
| 07 History | Period-styled chapter cards, the "Who did it first?" disputes with balance glyphs, licensed portraits | TECH REC badge breakage (G01); VISUAL histogram colors unexplained (G13) | Under the chronology, plot the recorded VπL and bandwidth records (from 6.12 data) on the same time axis, so the 2017 thin-film turn shows up as a data step |
| 08 Industry | 8.4 platforms comparison from the atlas (VπL vs bandwidth by platform); 8.6 market ranges by evidence grade with the grade legend | Static wafer door; market plot overflows 16 px | On 8.3, compute dies per wafer for a stated MZM die size at 100, 150 and 200 mm (gross-die formula, edge exclusion stated), so the wafer-size story is quantitative |

Landing: the strongest page on the site in both modes. The TECH sheet reads like a real data sheet (sourced specification table, ASCII cell, conoscope, chronology). The VISUAL hero puts the 3D cell next to three specimen values and the eight door artworks. Weakest: the VISUAL hero text block shifts during load (G04).

## 6. Contrast (WCAG 2.x, sampled on all 32 pages at 1440)

Ratio = the lowest sample found on any page for that text class. Median of medians in brackets. Effective background = first opaque ancestor, with translucent layers composited.

| Text class | TECH dark | TECH light | VISUAL dark | VISUAL light |
|---|---|---|---|---|
| Body `main p` | 4.65 (15.40), 11.5 px fg3 | 4.82 (17.14) | 5.28 (16.73) | 4.81 (16.01) |
| Readouts (`.ro`, `.cx-ro`, `.v-hud`, `output`) | 8.15 (15.40) | 8.94 (17.14) | 9.73 (16.73) | 8.18 (16.01) |
| Captions | 4.65 (6.40), 11 px | 4.82 (6.88) | 5.28 (5.50) | 4.81 (5.01) |
| Footer | 4.65 (15.40), 10 px | 4.82 (17.14) | 5.50 (15.47) | 4.53 (4.53), 532 nm green link |
| Nav | 8.15 (15.40) | 8.94 (17.14) | 10.13 (16.73) | 4.53 (16.01), green active item |
| Small / meta | 4.65 (4.65) | 4.82 (4.82) | 5.28 (5.50) | 4.81 (4.81) |
| SVG text in figures (422 TECH / 647 VISUAL labels) | 4.65 min, 0 below 4.5 | 4.82 min, 0 below 4.5 | 5.28 min* | 4.53 min* |
| Badges | 4.65 min, 9.5 px | 4.82 min | 5.28 min | 4.67 min |

*The script flagged 3 VISUAL dark and 4 VISUAL light SVG labels at about 1.05:1. On inspection these are labels drawn on top of a filled shape (the "G" electrode label on the Au pad, a white "d33" on a filled tensor cell); measured against their real background they are legible. These are script false positives, not defects.

All classes pass AA (4.5:1). The tightest are TECH `--fg3` at 9.5 to 11.5 px (G14) and the VISUAL light green accent at 4.53:1, which is only just over 4.5; do not darken the straw ground or lighten the green.

## 7. Performance (dev server, unbundled, cache disabled, 1440, two runs)

| Page | Mode | Transfer | Requests | FCP | LCP | Load event | Long tasks | CLS | Top bytes |
|---|---|---|---|---|---|---|---|---|---|
| `/` | TECH | 3.64 MB | 118 | 208 / 224 ms | 292 / 316 ms | 475 / 544 ms | 0 | 0 | script 3.05 MB, font 0.37 MB |
| `/` | VISUAL | 4.80 MB | 120 | 328 / 208 ms | 364 / 240 ms | 578 / 466 ms | 0 | 0.038 | script 4.24 MB |
| `/making/process-viewer/` | TECH | 3.53 MB | 112 | 280 / 256 ms | 280 / 256 ms | 506 / 546 ms | 0 | 0.0001 | document 243 kB |
| `/making/process-viewer/` | VISUAL | 5.06 MB | 121 | 260 / 240 ms | 260 / 240 ms | 496 / 486 ms | 0 | 0.158 | script 4.51 MB (three.js) |
| `/crystal/` (3D boule) | TECH | 3.21 MB | 109 | 248 / 208 ms | 248 / 208 ms | 492 / 469 ms | 0 | 0.0002 | three.js not requested |
| `/crystal/` (3D boule) | VISUAL | 4.72 MB | 119 | 256 / 224 ms | 256 / 224 ms | 470 / 511 ms | 0 | 0.049 to 0.055 | three.js 1.19 MB (dev, unminified) |
| `/light/second-order/` | TECH / VISUAL | 4.06 MB | 125 / 124 | 244 to 264 ms | 240 to 264 ms | 464 to 530 ms | 0 | 0.317 / 0.155 to 0.166 | G04 |
| `/lab/` | TECH / VISUAL | 3.64 / 3.66 MB | 111 / 112 | 228 to 276 ms | 228 to 276 ms | 461 to 527 ms | 0 | 0.0045 / 0.0008 | document 440 kB |

Further observations:
- Console errors: 0 on 192 captures and on all perf runs.
- Idle rendering: 0 WebGL draws and 0 2D fills over 4 s on `/`, `/crystal/`, `/making/process-viewer/` and `/light/pockels-effect/` in VISUAL. The exception is `/devices/modulators/` (G07).
- three.js loads only in VISUAL.
- JS heap 10 to 20 MB.
- Absolute sizes are dev-server sizes (unminified modules, Vite client, HMR). Re-measure on a fresh `pnpm build` + `vite preview`, because `build/` is stale.

## TODO for fix lanes

- [ ] G01 rename or scope `.rec` card selector (tech.css:231)
- [ ] G02 touch tap toggle in Popups.svelte
- [ ] G03 VISUAL masthead nav fit at 1440
- [ ] G04 reserve f23p height; Newsreader fallback metrics; mk-figs and hero-text heights
- [ ] G05 / G08 column widths and phone HUD stacking; ASCII `pre` overflow
- [ ] G06 r-tensor readout layout at 390
- [ ] G07 stop continuous MZM die animation
- [ ] G09-G15 polish
- [ ] Re-measure performance on a production build
