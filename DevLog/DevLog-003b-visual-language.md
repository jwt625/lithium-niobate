# DevLog-003b: VISUAL design system

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Phase 2 done: VISUAL integrated into `index.html` and `chapter.html` as mode-specific variants (switch without reload; shared conoscope, MZM, r-tensor, camera state; scroll anchor). `visual-proto.html` reduced to a redirect pointer |
| Scope | A second design system over the same content and data as TECH (DevLog-003a). Typography, scale, grid, color, controls, art direction, motion, shipped motifs, component map TECH to VISUAL, mode-switch architecture |
| Authors | Claude Code (lane D4), at Wentao Jiang's request |
| Inputs | DevLog-003 (content, numbers, sources; final section "two design systems, not a reskin"), DevLog-003a (TECH), research R10 (ciechanow.ski, bruno-simon.com, gwern.net), R12 (theme "Optic Axis", palette, motifs, chapter art), R13 (APA scene contract, provenance) |

## 0. Principle

TECH is a data sheet: one heading size, monospace numbers, boxed tables, 18 px controls, static figures, monochrome. VISUAL is an illustrated explorable: a type scale spanning 13 to 88 px, a reading serif, figures drawn as instruments and specimens, real-time 3D where geometry is the point, 44 px controls, color that comes from polarization optics. Both carry the same facts, numbers, sources, and badges; neither has prose the other lacks except control instructions. Standing rules apply to both: sharp corners, dark default with a light theme, no filler copy, no layout shift during interaction, no fabricated data, no emoji.

| Axis | TECH (003a) | VISUAL (this document) |
|---|---|---|
| Page | bordered 1180 px sheet on a desk, hard shadow | full-bleed field, no sheet; 72 px optic-axis gutter on the left at >= 1100 px |
| Type | IBM Plex Sans / Mono, all headings 13 px | Newsreader (serif, optical sizes) for display and reading; Inter for UI and numbers; 13 to 88 px scale |
| Density | 13 px on 20 px; tables | 18 px on 30 px reading text; cards, figures, one idea per block |
| Controls | 18 px slider, 22 px segmented buttons, mono uppercase | 44 px targets, 26 px diamond slider thumb, sentence-case labels, 22 px tabular readouts |
| Figures | panels with header strip, static unless operated | illustrated instruments (optical bench, specimen cards, device top views), live 3D cell, art per chapter |
| Data presentation | boxed tables | specimen sheet: one card per property with a to-scale glyph (stereogram, cell prism, temperature axis, spectrum bar) |
| Color | monochrome; accent = foreground | spectral colors computed from wavelength; declared false colors for IR; material colors (Au, Si, SiO2, LN) |
| Motion | none | purposeful, <= 0.5 s to visible signature, settled by 1 s; motifs gated by `data-fx` |
| Badges | mono SKU tags, border style = grade | diamond glyph + word; fill pattern = grade (solid / half / hollow / hatched) |

## 1. Typography

| Role | Face (Google Fonts, OFL) | Settings |
|---|---|---|
| Display (h1, hero name, chapter-door numerals, big values) | Newsreader, `opsz` 72, `wght` 300 to 500; Greek letters fall back to STIX Two Text (OFL), since Newsreader has no Greek | tracking -0.01 em at >= 56 px; old-style figures off for values (`lnum`, `tnum`) |
| Section headings (h2, h3) | Newsreader, `opsz` 36 to 48, `wght` 400 | sentence case |
| Reading text, definitions, captions longer than one line | Newsreader, `opsz` 16 to 24, `wght` 400 | 18 px / 30 px; measure 60 to 70 ch |
| UI: labels, buttons, nav, readouts, axis ticks, badges | Inter, `opsz` 14 to 32, `wght` 400 / 500 / 600 | `font-variant-numeric: tabular-nums` on every readout |
| Code (JSON twin only) | system `ui-monospace` stack | no web font |

Newsreader carries optical sizes 6 to 72, so one family covers 13 px captions and 88 px display. Inter supplies tabular figures for fixed-width readouts. IBM Plex stays the TECH face; the two systems share no family, so a mode switch is visible in the first glyph.

### Scale (perfect fourth, 1.333; px)

| Token | Desktop | <= 640 px | Use |
|---|---|---|---|
| `--v-t-cap` | 13 / 18 | 13 / 18 | ticks, badge words, footnotes |
| `--v-t-ui` | 15 / 22 | 15 / 22 | buttons, labels, nav |
| `--v-t-body` | 18 / 30 | 17 / 28 | reading text |
| `--v-t-lede` | 24 / 36 | 20 / 30 | definition, figure titles |
| `--v-t-h3` | 24 / 30 | 21 / 28 | card titles |
| `--v-t-h2` | 42 / 48 | 32 / 38 | section headings |
| `--v-t-val` | 44 / 48 | 36 / 40 | specimen values |
| `--v-t-h1` | 88 / 88 | 52 / 54 | hero name, chapter title |

## 2. Spacing and grid

- 8 px base; steps `--v-s1..8` = 4, 8, 16, 24, 32, 48, 72, 112 px. Section gap 112 px desktop, 72 px phone.
- 12 columns, 24 px gutter, page max 1320 px plus the 72 px axis gutter; side padding 24 px desktop, 16 px phone.
- Named widths (Distill pattern, R10): `body` 680 px (reading), `wide` 1040 px (instrument + caption), `page` 1320 px (card grids, timeline), `bleed` (bands).
- Every interactive figure reserves its height in CSS (`aspect-ratio` or fixed `height`), so data loading and control changes move nothing.

## 3. Color

Dark theme = crossed polarizers (extinction field). Light theme = parallel polarizers (bright field) on a pale straw ground. Color appears where light of a stated wavelength, an interference order, or a material is drawn; UI chrome stays neutral.

### 3.1 Spectral colors (computed, not picked)

`visual.js` computes the display color of a wavelength: CIE 1931 2-degree color-matching functions (Wyman, Sloan, Shirley 2013 multi-lobe fit) -> XYZ -> linear sRGB -> add white (D65 = equal linear RGB) until no channel is negative, which keeps the dominant wavelength -> scale to the theme's luminance -> sRGB gamma. CSS holds static fallbacks of the same values; JS overwrites them at load.

| Token | Wavelength | Kind | Use |
|---|---|---|---|
| `--v-l532` | 532 nm | spectral | accent: links, active controls, nonlinear optics, photorefractive trace |
| `--v-l633` | 632.8 nm (He-Ne) | spectral | conoscope monochromatic source |
| `--v-l775` | 775 nm | spectral, low luminance | SHG of 1550 nm (TFLN PPLN) |
| `--v-ir1064` | 1064 nm | declared false color, always dashed | pump beams |
| `--v-ir1550` | 1550 nm | declared false color, always dashed | telecom light, modulator figures |

Rule: an infrared mark is never solid. It is dashed or hatched and its legend says "false color". GRIIRA dimming acts only on these marks (`.ir-el`).

### 3.2 Interference colors

White-light colors between crossed polarizers for retardation G: T(lambda) = sin^2(pi G / lambda), integrated against the color-matching functions (equal-energy illuminant) and normalized to the T = 1 white. Used for the conoscope in white light (already in `ln.js`) and for the retardation legend under the eyepiece, whose span is the computed retardation at the NA edge for the current plate thickness.

### 3.3 Material and neutral tokens (dark / light)

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--v-ink0` | #05060a | #f3efe3 | page field |
| `--v-ink1` | #0a0d13 | #fbf8ef | card surface |
| `--v-ink2` | #111621 | #ece6d6 | raised surface, stage frame |
| `--v-line` | #222a38 | #d6cfbd | hairlines |
| `--v-line2` | #364258 | #a99f88 | control borders |
| `--v-text` | #efe9db | #16140f | text (pale straw on ink) |
| `--v-text2` | #bdb7a8 | #4a463c | secondary |
| `--v-text3` | #8a8578 | #77705f | tertiary, ticks |
| `--v-au` | #dcaa4a | #8a6410 | Au electrodes, RF |
| `--v-si` | #6e788a | #5a6474 | Si handle |
| `--v-sio2` | rgba(140,170,210,0.16) | rgba(70,100,150,0.14) | oxide, cladding |
| `--v-ln` | #efe4c2 | #b49a52 | LN crystal (pale straw; tint not sourced, R12 "verify") |
| `--v-nb` / `--v-li` / `--v-o` | lattice species | | shared with `lattice.js` through `--nb`, `--gold` |

Provenance in VISUAL keeps the grade in the glyph fill, not only in color: P solid diamond; P-comp / P-db half-filled; derived / engine hollow; template hatched; reported solid in `--v-au`.

## 4. Controls

| Control | Spec |
|---|---|
| Hit target | >= 44 x 44 px (WCAG 2.5.5 level AAA size) on every slider, toggle, button, door |
| Slider | native `input[type=range]` (keyboard, `aria-valuetext` with units); 44 px row; 4 px track; filled part from the minimum (unipolar) or from zero (bipolar, e.g. MZM voltage) in `--v-l532`; 26 px thumb drawn as a diamond (rotated square, the octahedron's projection) |
| Readout | Inter 22 px, tabular, fixed `ch` width per format (e.g. `+5.00 kV/mm` = 11 ch), right-aligned; never inside the moving thumb |
| Segmented toggle | 44 px tall, 2 px border `--v-line2`, sentence case 15 px; active = `--v-l532` fill with ink text; hover = 8% tint |
| Icon button | 44 x 44, 2 px border, SVG 20 px |
| Focus | 3 px `--v-l532` outline, 3 px offset, on `:focus-visible` only |
| Corners | radius 0 everywhere; cards and doors may carry one 60 degree facet (top right, 18 x 31 px), a crystal face, via `clip-path` |
| Disabled | 40% opacity, `aria-disabled`, not a link (unbuilt chapters) |

## 5. Figure and art direction

1. Instruments are drawn as instruments. The conoscope is an optical bench (lamp, polarizer P along x, condenser NA 0.55, z-cut plate between electrodes, objective, analyzer A along y, Bertrand lens) with the live figure as the eyepiece view; each control sits under the element it changes; the drawing reflects state (beam color = source, field arrow length and direction = E, plate thickness = d).
2. Specimens are drawn to scale. Point group as a 3m stereogram; lattice as the hexagonal prism with c/a = 2.693; Tc and Tm on one temperature axis; transparency on a log wavelength axis with the visible part in spectral color and 1064 / 1550 nm in declared false color; r33 clamped vs free as bars on one pm/V axis.
3. Real-time 3D only where geometry explains: the R3c cell (shared camera with the TECH ASCII cell, `lattice.js`), later boule -> wafer -> chip and the L3 overlap stack. Render on demand; idle = 0 frames.
4. Chapter art (R12 sec. 6), one primary style per chapter, applied to the chapter door and the chapter's decorative scenes; geometry stays true, the style changes rendering only (R13):

| Chapter | Door art (procedural, code-drawn) | Basis |
|---|---|---|
| 01 Crystal | Gothic tracery from the 3m stereogram; octahedra column Nb, empty, Li along +c | symmetry made visible |
| 02 Light | live white-light conoscope at E = 0, op-art rings | interference |
| 03 Sound | ukiyo-e ripple lines launched from IDT fingers | SAW |
| 04 Quirks | kintsugi crack in Au over a photorefractive trace | pyroelectric cracking, optical damage |
| 05 Making | engraving hatch of a Czochralski boule on its seed | etching = etching |
| 06 Devices | MZI line drawing with Au G-S-G electrodes, 1550 nm false color | modulators |
| 07 History | ticks 1949 to 2026 in period styles (1949 technical drawing, 1960s scientific illustration, 1980s data sheet, 2017+ SEM false color) | visual culture by era |
| 08 Industry | wafer pictogram; Isotype counts only once sourced counts exist | honest quantity graphics |

5. No text inside scenes except axis ticks and labels with units. Captions state what is drawn and how to operate it.

## 6. Motion

| Rule | Value |
|---|---|
| Durations | 120 ms hover / press; 240 ms state change; 600 ms figure transition; signature motion visible within 0.5 s, settled by 1 s (author preference, R13) |
| Easing | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| What may move | only what the reader operates, plus the declared motifs (bias drift, photorefractive decay, door art on hover). No autoplay loops, no scroll-jacking, no parallax |
| Rendering | canvases render on demand; IntersectionObserver gating (300 px margin, ciechanow.ski pattern) |
| Reduced motion | `prefers-reduced-motion: reduce` -> `data-fx="off"`: motifs static, door art static, transitions 0; colors and all controls stay |
| Layout | nothing moves or resizes during interaction; verified with `getBoundingClientRect` at control extremes |

## 7. Shipped motifs (R12 sec. 5)

| Motif | Physics anchor | Data | Behavior in VISUAL | Reduced motion |
|---|---|---|---|---|
| Optic-axis spine with octahedra | c axis; octahedral columns repeat Nb, empty, Li along +c | `lattice.js` / Hsu 1997 | luminous axis line in the 72 px gutter; one shaded octahedron per section (cycle Li, Nb, empty); cursor = scroll position along c; hover names the section | static marks |
| 3m ornaments | point group 3m: threefold axis, three mirror planes | Weis & Gaylord 1985 | stereogram glyph before every h2; 60 degree facets on cards; no 4-, 5-, 8-fold ornament anywhere | static |
| Poled-domain rules | +/-z domains with first-order QPM period | `LN.qpmPeriodSHG`, Zelmon 1997, 21 C | masthead band and section rules drawn at a fixed scale of 2 px per um, so periods are comparable across pages: landing 1064 -> 532 nm, chapter 2 1550 -> 775 nm; popup gives the formula and value | static |
| Li-vacancy texture | congruent LN is Li-deficient | [Li]/[Nb] = 0.94 (Volk & Woehlecke 2008, p. 9, P-comp); Li-site vacancy model (Li(1-5x) Nb(x) V(4x)) Nb O3 assumed | triangular dot lattice; 4.0% of sites empty, 1.0% drawn as Nb antisites (x = 0.0101, derived) | static |
| Photorefractive cursor trace + GRIIRA | light-written index change decays with dark conductivity; green-induced IR absorption | display time constant, not measured | 532 nm trace behind content decays over about 15 s; IR false-color marks within 40 px of the cursor dim to 35% and recover | off |
| Drifting MZM bias point | DC bias screened by mobile charge (Holzgrafe et al. 2024) | single-RC display model, tau 40 s, 90 degree span (declared display values) | illustrated MZI with transfer curve in the footer; click re-locks | fixed at quadrature |
| Retardation legend | isochromatic ring order G = d (n_o - n_e) sin^2(theta) / cos(theta) | Zelmon 1997 | Michel-Levy strip under the eyepiece spanning 0 to G at the NA edge for the current d | static |

Not shipped in phase 1: three-wave-mixing cursor photons, OPO nav icon, comb sonification, pyroelectric 404, peeling page transitions (R12 rows kept for later chapters).

## 8. Component map, TECH to VISUAL

| Component | TECH (003a, current markup) | VISUAL |
|---|---|---|
| Masthead | 30 px row: 20 px conoscope logo, Plex Condensed wordmark, mono segmented TECH/VISUAL, 22 px theme icon; dot band; 8-cell nav grid | 88 px row: 44 px live white-light conoscope logo, Newsreader wordmark 28 px, chapter nav as numbered serif links in the same row (scroll strip on phone), 44 px "Tech / Visual" switch and theme button; poled-domain band at 2 px/um with the computed period label |
| Spine | 1 px gray line, 13 px flat diamonds, desk gutter >= 1260 px | glowing 2 px axis in a reserved 72 px gutter >= 1100 px; 22 px shaded octahedra; labels on hover |
| Hero definition | bordered definition block, 13 px | 88 px display name, formula line, 24 px serif lede (same two sentences) |
| Fig. 0 conoscope | 384 px panel, control rows, HUD row | optical bench illustration + 440 px circular eyepiece view, controls under bench elements, retardation legend, 22 px fixed readouts |
| Fig. 1 unit cell | ASCII z-buffer render | three.js shaded atoms, translucent octahedra, 600 px stage, 44 px toggles; same camera state |
| Specification | 10-row boxed table | specimen sheet: card grid, each card = value at 44 px + condition + badge + to-scale glyph; n(lambda) card with a wavelength slider |
| Data record | label/JSON two-column card | specimen label with a two-state view (label / JSON) in one fixed-height box |
| Index | 8 x 5 boxed keyword table | 8 chapter doors (4 x 2, 2 x 4, 1 x 8 by width), procedural art per chapter, L1 keywords, L2 / L3 in the door's popup; unbuilt doors disabled |
| Instruments | 6-row boxed table | instrument cards with input -> output diagrams; F1 links to the bench (phase 2) |
| Chronology | 10-row log table | proportional time axis 1945 to 2025 with markers, plus a snap-scroll row of event cards (date in display numerals, event, DOI link); marker and card highlight each other |
| Platforms | one no-data line | dashed frame with the same no-data sentence |
| Footer | wafer map 180 px, status key, license, 220 px bias curve | larger wafer map, key with VISUAL badges, license, illustrated MZI + bias curve |
| Popups | 360 px bordered box, mono values | same engine (`app.js`); 400 px, Newsreader body 16 px, Inter values, 2 px border |
| Badges | mono uppercase SKU tags | diamond glyph + sentence-case word, fill = grade |
| Chapter L1 | calculator panel + MZM T(V) plot | illustrated MZM top view (waveguides, Au G-S-G, push-pull field arrows, 1550 nm false-color light) + T(V) curve + 44 px voltage slider, measured V_pi 2.90 V (reported) |
| Chapter L2 | 6 x 3 matrix table, segmented pickers | index ellipsoid in 3D deforming with the chosen field (exact eigen-decomposition from `eo.js`), matrix as a glyph grid, 44 px pickers |
| Chapter L3 | figures (a) to (d) as heatmaps + numbers table | exploded stack in 3D: (a) optical |E_x|^2 and (b) static e_x as translucent planes over the extruded cross-section, (c) their product as a height field; numerator and denominator areas shaded; numbers table as cards |

## 9. Mode-switch architecture

1. **Shared base**: tokens with semantic names (`--bg --fg --fg2 --fg3 --rule --rule2 --acc --nb --gold --ir --shg`) that every module reads; reset; popup engine; physics and data modules (`ln.js`, `eo.js` math, `lattice.js` data); URL parameters and `localStorage` keys (`ln-mode`, `ln-theme`); the `ln-mode` event.
2. **TECH layer**: `styles.css` rules scoped to `:root[data-mode="tech"]` (phase 2; today unscoped) plus TECH-only blocks.
3. **VISUAL layer**: `visual.css` (all rules under `:root[data-mode="visual"]`; redefines the shared tokens so `lattice.js`, `eo.js`, and the popup engine pick up VISUAL colors with no code change) and `visual.js` (VISUAL-only components; registers on `ln-mode`; lazy-initializes on the first VISUAL display; idle when TECH).
4. **Variant blocks**: where the DOM differs, both variants sit in the same slot: `<div data-variant="tech">` and `<div data-variant="visual">`; `:root[data-mode="tech"] [data-variant="visual"], :root[data-mode="visual"] [data-variant="tech"] { display: none }`. Masthead and footer keep one DOM (ids used by `app.js` stay unique) and are restyled only.
5. **Shared state**: one state object per component (`window.LNSTATE.cono = {E, d, dir, src}`, `.mzm = {V}`, `.cell = {yaw, pitch, zoom, show}`, `.rt = {field, pol, set}`); both variants bind to it by `data-bind` attributes instead of ids, so a switch keeps every value and the 3D camera.
6. **Scroll anchor**: before the swap, record the first `[data-spine]` section whose top is in view and its offset; after the swap, restore that offset, since the two variants differ in height.
7. **No reload**: the switch sets `data-mode`, `app.js` emits `ln-mode`, each module repaints. Heavy VISUAL resources (three.js, door art) load on first VISUAL display and stay cached.

## 12. Phase 2: what was integrated (2026-10-25)

### 12.1 Files
| File | Change |
|---|---|
| `index.html` | VISUAL fonts link (Inter, Newsreader, STIX Two Text) and `visual.css`; `.band` gains `data-qpm="1.064"` and `data-pop-visual="v-qpm"`; TECH blocks `#cell`, `#spec`, `#index`, `#instruments`, `#chronology` marked `data-variant="tech"`; VISUAL siblings `#v-top` (hero with the three.js `#fig1`, moved out of the TECH figure column, where it was hidden), `#v-conoscope` (bench), `#v-spec` (specimen sheet + data record), `#v-chapters` (doors), `#v-instr` (six instrument cards, new), `#v-chron` (timeline); `#platforms` and footer shared, restyled; footer "Background lattice" line `data-variant="visual"`; POPS gain `v-cono`, `v-ring`, `v-qpm`, `v-false`, `v-vac`, `d01`..`d08`; the TECH Fig. 0 script reads and writes `LNSTATE.cono`, sizes its canvas when visible, resyncs inputs on `ln-mode`, and skips drawing in VISUAL |
| `chapter.html` | fonts and `visual.css`; `.band` `data-qpm="1.55"` (Lambda 18.99 um); `#mzm` panel `data-variant="tech"` with VISUAL sibling `.v-mzm-wrap` (illustrated push-pull MZM, T(V), slider); `#rt` panel `data-variant="tech"` with VISUAL sibling `#v-ell` (three.js index ellipsoid, 44 px pickers, exact readouts); `data-pair` on `#l1..#l3`, `#mzm`/`.v-mzm-wrap`, `#rt`/`#v-ell`; POPS gain `v-qpm` (1550 nm), `v-false`, `v-ell` |
| `styles.css` | variant rule (`[data-variant]` shown only in its mode); `.band > svg` hidden (VISUAL draws it); spine `z-index` 5 -> 0 (under `main`), `z-index` 6 on hover |
| `app.js` | spine marks built from visible `[data-spine]` only, rebuilt on `ln-mode`, re-placed when the body height changes (ResizeObserver); popups read `data-pop-visual` in VISUAL; scroll anchor across the mode switch (last visible `data-pair` block starting above 120 px; same offset, or same fraction scrolled past) |
| `eo.js` | `window.LNEO = {st, SETS, jacobi, imperm, update}` (impermeability at 1 V/um, 1550 nm; exact Jacobi eigen-decomposition); `ln-rt` event after each table update; MZM voltage in `LNSTATE.mzm` (resynced on `ln-mode`); depth-nav highlight tracks the set of layers in the band instead of transition entries only |
| `chapter.css` | at <= 520 px the colorbar unit moves to its own row (it overflowed the 390 px viewport by 19 px in TECH and VISUAL) |
| `visual.css` | masthead and footer rules retargeted to the shared DOM (`.mast` grid with `.row { display: contents }`, `.brand`, `.nav`, `.seg.mode`, `.iconbtn`, `.band`, `footer`); all range inputs and `.seg` get the VISUAL control style; restyle of TECH markup shown in VISUAL (`.sh`, `.crumbs`, `h1.ch-title`, `nav.depth`, `.tx`, `.eq`, `.panel`, `.fig`, tables, readouts); instrument cards; ellipsoid and MZM blocks |
| `visual.js` | bench and MZM bound to `LNSTATE`; `.band` poled drawing; `initEllipsoid()` (B0 + 500 dB drawn, semi-axes 1 + 10 (n_i / n_mean - 1), wireframe at E = 0, drag or arrow keys to orbit, render on demand); range fill for every range input in VISUAL; idle preload of the VISUAL faces while in TECH; doors painted at init |
| `visual-proto.html` | reduced to a redirect pointer to `index.html?mode=visual` (links to both pages) |

Deviation from plan 11.1: `styles.css` was not wrapped in `:root:not([data-mode="visual"])`. Wrapping raises every TECH rule's specificity above the unwrapped `chapter.css` rules that override it, which would have changed TECH. `visual.css` keeps its overrides instead; TECH stays untouched by construction.

### 12.2 Verification (headless Chrome, SwiftShader; harness pages created in `mockup/` and deleted after use)
- Layout shift: every visible range input at min, max, mid and every segmented button, both pages, both modes, 1440 and 390 px: 0 elements moved or resized. Data load (t = 0.3 s vs 6 s after load): 0 moved. No horizontal page scroll at 390 px on either page in either mode.
- Mode switch: conoscope E = 3.2 kV/mm, d = 1.25 mm and MZM V = 1.45 V carry over in both directions; scroll anchor kept to within 1 px (index `#index` <-> `#v-chapters`, chapter `#rt` <-> `#v-ell`). Cell camera: one camera object in `lattice.js` (D3), not separately measured.
- Ellipsoid: E_y, polarization y, Turner set gives "biaxial, 3 distinct" and largest axis tilt 0.1121 deg (exact), matching 0.5 atan(2 r51 E / (1/n_o^2 - 1/n_e^2)).
- Console: no errors on either page in either mode.
- TECH regression, baseline captured before any phase 2 edit (1440 dark, 1440 light, 390 dark; segment screenshots through a same-origin iframe), diffed per pixel:
  - identical or max channel difference <= 5/255 (antialiasing): all index segments except the first; chapter segments 1 and 3 at 1440; chapter 390 segments 0 to 3.
  - intended: spine no longer drawn over the full-bleed `#cell` (index segment 0, x 16 to 29 px); chapter at 390 px, colorbar unit row (+9 px below Fig. (a), segments 4 to 8).
  - capture timing, not code: chapter 1440 segment 2 (L3 figure state; also differs between two baseline runs), chapter 1440 segment 4 depth-nav tab (the observer is not re-evaluated after the harness's programmatic iframe scroll; direct loads of `chapter.html#l2` and `#l3` highlight the right tab), chapter light segment 0 spine mark placement, index 390 segment 0 (the baseline shot was taken before the ASCII cell rendered; the new shot shows it).
- Screenshots of both pages in both modes and themes at 1440 and 390 reviewed (scratchpad, not in the repo).

### 12.3 Open
- L3 exploded 3D stack (a) x (b) -> (c): specified (sec. 8), not built.
- The 390 px MZM top view is legible only as a diagram (labels about 6 px); the T(V) plot and readouts carry the numbers.
- three.js figures are not captured by headless screenshots inside a 390 px iframe at short time budgets; they render at 700 px and 1440 px.

## TODO

- [x] Read inputs (DevLog-003, 003a, R10, R12, R13; current `index.html`, `chapter.html`, `styles.css`, `app.js`, `chapter.css`, `lattice.js`)
- [x] Write this system definition
- [x] `mockup/visual.css`, `mockup/visual.js`, `mockup/visual-proto.html` (masthead, hero with the three.js cell, conoscope bench, specimen sheet, chapter doors, timeline, chapter figure, footer)
- [x] Verify: 1440 px dark and light, 390 px iframe, side by side with `index.html?mode=tech`; layout-shift check at control extremes
- [x] Phase 2 integration (section 12)

## 10. Phase 1 files

| File | Content |
|---|---|
| `mockup/visual.css` | tokens (dark, light), redefinition of shared tokens, every VISUAL component; all rules under `:root[data-mode="visual"]` via CSS nesting |
| `mockup/visual.js` | spectral palette (CIE fit), Li-vacancy texture, poled band and rules (`LN.qpmPeriodSHG`, 2 px/um), spine octahedra, range fill, conoscope bench + eyepiece + ring scale + HUD, specimen glyphs, n(lambda) card, data record, chapter-door art (8 procedural scenes), chronology axis + cards, MZM figure; `window.LNVIS = {spectral, qpm}`; on `ln-mode` |
| `mockup/visual-proto.html` | standalone page: loads `styles.css` + `visual.css`, `ln.js`, `app.js`, `visual.js`, `lattice.js` (D3's VISUAL `#fig1` contract). Opens in VISUAL without writing `localStorage`; its Tech button opens `index.html?mode=tech` |

Not touched: `index.html`, `chapter.html`, `styles.css`, `app.js`, `eo.js`, `chapter.css`, `lattice.js`.

## 11. Phase 2 integration plan (after D2, D3)

Shared code first, then pages.

### 11.1 `styles.css` (shared base + TECH layer)
1. Keep `:root` tokens, reset, `#pr-trace`, `.spine` geometry, `.pop` positioning base unscoped.
2. Wrap all TECH presentation (sheet body, 13 px headings, `.mast .row/.brand/.band/.nav`, `.seg`, `.iconbtn`, tables, SKU badges, `input[type=range]`, `.panel`, `.rec`, footer, chapter classes) in `:root:not([data-mode="visual"]) { ... }` (nesting). Then delete the VISUAL color patches now in `styles.css` (`:root[data-mode="visual"] ...`, `[data-fx="on"] .band/.sh/.biref` stripes) since `visual.css` owns VISUAL.
3. Add the variant switch: `:root[data-mode="visual"] [data-variant="tech"], :root:not([data-mode="visual"]) [data-variant="visual"] { display: none !important; }`.
4. After 2, remove the specificity overrides in `visual.css` that exist only to beat `styles.css` (`.b.*`, `.pop`, `#fig1 .stage/.reset/.legend1/.readout1`, `.seg.mode`, light-theme `--acc`).

### 11.2 `app.js`
1. Spine: build marks from visible `[data-spine]` only (`offsetParent !== null`) and rebuild on `ln-mode` (hidden variants carry their own `data-spine`).
2. Scroll anchor: before changing `data-mode`, store the first `[data-spine]` whose top is >= 0 and its `top`; after `emit()`, `scrollBy` the difference.
3. Popups: `fill()` reads `el.dataset.popVisual` when `visual()` and the attribute exists (e.g. band: `data-pop="qpm" data-pop-visual="v-qpm"`; TECH text "drawn not to scale", VISUAL "2 px per um").
4. `paintVacancy()` and the QPM label: return early when `visual()` (`visual.js` owns both in VISUAL).
5. Shared state: `window.LNSTATE = {cono: {E, d, dir, src}, mzm: {V}, cell: {...}}`; the TECH conoscope script (now inline in `index.html`) and `visual.js` bench read and write it and resync inputs on `ln-mode`. Source default stays mode-dependent until the reader picks one (current TECH rule).
6. Mode buttons: label text from CSS (`text-transform: uppercase` in TECH), so one DOM serves both.

### 11.3 `index.html`
| Block (current) | Phase 2 |
|---|---|
| `<head>` | one Google Fonts link adds `Inter:opsz,wght@14..32,400..600`, `Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,400`, `STIX+Two+Text:ital@0;1`; `visual.css` after `styles.css` |
| `header.mast` | same DOM, restyled in `visual.css` (port `.v-mast/.v-brand/.v-nav/.v-switch/.v-icon` rules onto `.mast/.brand/.nav/.seg.mode/.iconbtn`); `.band` gains `<svg>` and `data-qpm="1.064"`; `visual.js` `poled()` targets `.band, .v-band` |
| `section#cell` (D3 ASCII hero) | `data-variant="tech"` |
| new `section.v-hero` | `data-variant="visual"`: kicker, display name, lede (same two sentences as `.def`), key numbers, and D3's `#fig1` moved here (one `#fig1` in the page; `lattice.js` already treats it as the VISUAL figure) |
| `section.hero#spec` (definition, spec table, data record, `#fig0`) | `data-variant="tech"`; VISUAL siblings: `section#v-cono` (bench, from the prototype) and `section#v-spec` (specimen sheet incl. data record) |
| inline conoscope script | move to `cono.js` (shared), bound by `data-bind="cono.E"` etc., so TECH panel and VISUAL bench drive one state; `visual.js` `initBench()` becomes the VISUAL view of it |
| `section#index` | `data-variant="tech"`; VISUAL sibling `section#v-chapters` (doors) |
| `section#instruments` | `data-variant="tech"`; VISUAL sibling: six instrument cards (input -> output diagram, F1 links to `#v-cono`); not yet prototyped |
| `section#chronology` + inline `EV` | `data-variant="tech"`; VISUAL sibling `section#v-chron`; move `EV` to `chron.js` (or `data/chronology.json`) used by both |
| `section#platforms` | shared, restyled |
| `footer` | same DOM, restyled (port `.v-foot` rules); add the "Background lattice" line with `data-pop="v-vac"` |
| `window.POPS` | add `v-qpm`, `v-false`, `v-vac`, `v-ring`, `d01`..`d08` from the prototype |
| scripts | `visual.js` after `app.js` and `cono.js`; `lattice.js` unchanged |

### 11.4 `chapter.html`
| Block | Phase 2 |
|---|---|
| `<head>`, masthead, footer | as index; `.band` `data-qpm="1.55"` (Lambda = 18.99 um, 38 px at 2 px/um) |
| crumbs, `h1.ch-title`, `nav.depth` | restyle only: 88 px Newsreader title; depth nav as 44 px tabs |
| L1 `#calc`, `#mzm` | `data-variant="tech"`; VISUAL sibling: MZM illustrated figure (`initMZM()` from the prototype) + bulk calculator as a specimen card; `LNSTATE.mzm.V` shared |
| L2 `#rt`, coefficient and mapping tables | `#rt` `data-variant="tech"`; VISUAL sibling: index ellipsoid in three.js deformed by the chosen field, using the eigen-decomposition in `eo.js` (D2 to expose it, e.g. `window.LNEO.rt(set, field, pol)`); tables shared, restyled |
| L3 equations, figures (a) to (d), numbers table | figures shared (`eo.js` already switches color maps on `LNUI.visual()`), restyled; VISUAL adds the exploded 3D stack (a) x (b) -> (c) as phase 2b |
| `chapter.css` | unchanged; VISUAL chapter rules go into a chapter block of `visual.css` |

### 11.5 Checks after integration
Layout-shift harness at control extremes for both variants (1440, 390), mode switch keeps conoscope state, MZM voltage, cell camera, and scroll position; reduced-motion run; both themes.

## Progress log

- 2026-10-25 System written (sections 0 to 9) before implementation.
- 2026-10-25 Phase 1 built: `visual.css`, `visual.js`, `visual-proto.html` (no edits to files owned by D2/D3 or to `styles.css`/`app.js`). D3 changed the `lattice.js` contract during this run (`#cell` = TECH ASCII hero, `#fig1` = VISUAL three.js panel); the prototype uses `#fig1` and renders the shaded 3D cell.
- 2026-10-25 Verified (headless Chrome, SwiftShader): 1440 px dark and light; 390 px in a same-origin iframe; layout-shift measurement with `getBoundingClientRect` on every HTML element at slider min / max / mid (conoscope E 0 to 5 kV/mm, d 0.2 to 2 mm, wavelength 0.4 to 5 um, MZM -6 to +6 V and 0 to -V_pi) and toggles (source, field direction, cell toggles): 0 elements moved or resized at 1440 and 390 px (the only changes at 390 px were `lattice.js` replacing its axis-label nodes, i.e. detached nodes, not shifts). 390 px document width = viewport after fixing one non-wrapping provenance line. Loaded fonts: Inter, Newsreader, STIX Two Text. Computed `--v-l532` #45ff9c, `--v-l633` #ff385c (dark). QPM band Lambda = 6.82 um.
- 2026-10-25 Phase 2 integrated (section 12): index and chapter carry both systems; TECH baseline diff and layout-shift checks in section 12.2.
- 2026-10-25 Known gaps (phase 1): three.js cell does not appear in headless screenshots of the 390 px iframe (renderer and legend are created per DOM probe; at 700 px direct it renders with a 25 s virtual-time budget); instrument cards and the L2/L3 3D views are specified, not built; 390 px bench SVG labels are small (alternating rows at 24 units).
