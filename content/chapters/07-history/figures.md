# 07 History: figure specs

| Field | Value |
|---|---|
| Lane | C07 |
| Date | 2026-10-25 |
| Data | `events.yaml` (one record per event; ids `h-YYYY-slug`), `refs.yaml`, `images.yaml` |
| Systems | TECH (DevLog-003a) and VISUAL (DevLog-003b); both carry the same events, dates, sources, badges |
| Binding rules | DevLog-004 rules 1-10: no layout shift, both systems, sharp corners, dark default and light theme, no fabricated data, data-only plots |

Every figure below reads only fields present in `events.yaml` or values cited in the manuscript. Display constants that are not material data (animation time constants, illustrative scales) are labeled "display value" in the figure itself.

---

## F7.0 Chronology (chapter landing)

### TECH: log table

Format per DevLog-003a `.table-log`: no cell borders, 20 px rows, IBM Plex Mono uppercase header with a 1 px rule.

| Column | Field | Width | Format |
|---|---|---|---|
| DATE | `date` | 10 ch | ISO as stored; ranges print `1985/1989` |
| P | `date_precision` | 1 ch | D, M, Y, ~ (approx), R (range) |
| EVENT | `title` | flex, one line, ellipsis | full title and `hook` in the row popup |
| WHO | `people` | 22 ch, ellipsis | first two names, then "+n" |
| WHERE | `institution` | 22 ch, ellipsis | full string in popup |
| REF | `doi` or `url` | 9 ch | `doi` shows `DOI`, `url` shows `URL`, neither shows `-` |
| ST | `status` | 7 ch | SKU badge: V solid border, P dotted, S dashed, `derived` dashed with a "d" prefix |

- Controls (one row above the table, 22 px segmented buttons, inverted when active): chapter `ALL 7.1 ... 7.10`; status `V P S D`; kind toggles derived from the manuscript's regional index (`USSR JP EU CN TI:LN`); sort `DATE` ascending or descending.
- Row popup (DevLog-003a popup box, 360 px): title, hook, people (all), institution, citation, DOI link, notes, status badge with its definition.
- Count line under the controls in mono: `162 EVENTS  V 127  P 7  S 27  D 1` recomputed from the filtered set. Fixed width: each count is padded to 3 digits so the line never reflows.
- ASCII strip above the table: one character per year from 1801 to 2026, broken at 1949 by `//`; a year with at least one event prints `|`, otherwise `.`; the current filter's years print `#`. Monospace, one line, horizontal scroll inside its own box on narrow screens.
- Layout: table height is fixed to the viewport band (e.g. 28 rows) with internal scroll, so filtering never changes page height. Empty filter result prints one row: `NO EVENTS MATCH THIS FILTER`.

### VISUAL: illustrated timeline

- Two tiers in a `page`-width band (1320 px):
  1. **Overview axis.** A proportional time axis with one break. Left segment 1801-1948 compressed to 15% of width (prehistory of names and Czochralski); right segment 1949-2026 linear. One tick per event, height by status (V tall, P medium, S short, derived dotted), color by chapter period palette (below). Hover or focus on a tick opens the event card popup; the corresponding chapter card highlights.
  2. **Chapter cards.** Ten cards in a snap-scroll row (DevLog-003b chronology pattern), each 300 x 420 px fixed: chapter number and span in Newsreader display numerals, a period-art vignette (below), the chapter title, three anchor events with dates. Below the row a fixed-height event-card box is reserved at load (3 card rows on desktop, 2 on phone) with internal scroll; selecting a card fills it, and with no selection it shows the chapter's anchor events, so the page height never changes.
- Event card: date in display numerals (Inter tabular for precision suffix), title, hook, people, status diamond (fill = grade), source link. Fixed 280 x 200 px; text clamped to the box with the full text in the popup.
- Density: 2017-2026 holds 55 of the 162 events. The overview axis stacks ticks in up to four lanes within a year (paper, product, company, institution, inferred from the presence of `doi` and from the title); stacking is deterministic (sorted by date then id) so the layout is identical on every load.
- Axis labels: decades only, Inter 13 px. No editorial captions on the axis.

### Period art directions (one per chapter; rendering style only, geometry true)

| Ch | Span | Style | Vignette content (procedural, code-drawn; no copied figures) |
|---|---|---|---|
| h01 | 1801-1958 | 19th-century copperplate line engraving for the names; 1949 Bell Labs drafting for the ferroelectric letter (stencil lettering, ruled border) | Family tree Tantalus to Niobe and Pelops with element symbols Ta, Nb; a hysteresis loop drawn as a drafting figure |
| h02 | 1960-1967 | Mid-century scientific illustration, two-color line art (black plus one spot color) | Czochralski puller cross-section with a boule on a seed; OPO resonator with pump and two output beams |
| h03 | 1966-2018 | Computed interference fringes as the art itself (real two-beam fringe pattern, period from the drawn angle) | A grating in a crystal block with a reconstructed beam |
| h04 | 1965-2022 | Ukiyo-e ripple lines (DevLog-003b chapter 03 door) launched from IDT fingers | IDT on a 128 Y-X plate, ripples, axes labeled |
| h05 | 1973-1991 | 1970s journal figure: hand-inked graph and stencil lettering | Index-depth profile of an out-diffused guide beside a Ti stripe profile |
| h06 | 1962-2021 | Lab-notebook graph paper with etched-domain micrograph texture rendered procedurally (hexagonal domains as in DevLog-003b texture rules) | Domain stripe strip with the phasor staircase above it |
| h07 | 1985-2021 | 1980s-2000s telecom data sheet: boxed spec tables, butterfly-package outline drawing, eye diagram | Ti:LN MZM top view with Au electrodes; an eye diagram computed from the chapter 06 MZM model |
| h08 | 1995-2014 | Process-flow cross sections in flat cleanroom-yellow fills | Implant, bond, split sequence on one cross-section |
| h09 | 2017-2023 | SEM false color (grayscale procedural rib with a single false-color overlay, labeled as a render) | TFLN rib on SiO2 with a mode overlay |
| h10 | 2023-2026 | Wafer maps | 8-inch wafer map with die grid |

Color: each chapter takes one accent from the VISUAL palette (DevLog-003b section 3), assigned by physics where possible: h03 and h06 `--v-l532`; h05 and h07 `--v-ir1550` (declared false color, dashed); h04 `--v-au`; others neutral ink with one spot color. Infrared marks are never solid.

---

## Chapter figures

Each chapter has one L1 interactive (manuscript names them). Specs give inputs, outputs, data source, readout format, and the reduced-motion and layout rules.

### F7.1 Family tree of names (h01)

- Nodes: Tantalus; Niobe, Pelops; Ta, Nb; Li (lithos); LiNbO3, LiTaO3. Edges show mythic and chemical relations.
- Click a node: a fixed 360 x 160 px panel shows the coining sentence (original language, short quote, then English gloss), author, year, page, and the ref badge (rose1844 pp. 335-336; rose1846 p. 119; arfwedson1818 p. 153; hatchett1802 p. 65; ekeberg1802 via rose1844 p. 318, P badge).
- TECH: an ASCII tree, monospace, same panel below.
- VISUAL: engraved-line tree on a pale field; nodes as 3m trefoils (DevLog-003b ornament rule).

### F7.2 Pull a boule (h02)

- Inputs: pull rate slider (labeled display range), rotation toggle. Output: an animated boule growing from a seed into a melt.
- No material numbers are shown (growth rates and diameters are not sourced in this chapter); the panel says "illustration, no data".
- Reduced motion: final state drawn statically.

### F7.2b OPO dial (H2)

- Mode toggle: 1965 (pump 0.529 um, birefringent phase matching, temperature knob) or 1995 (pump 1.064 um; temperature knob at the experimental 31 um period, plus a QPM period knob 26-32 um labeled as a model extension, since the 1995 experiment was temperature-tuned).
- Computation: signal and idler from energy conservation and the phase-matching condition with the Zelmon 1997 and Jundt 1997 Sellmeier equations; readouts: signal and idler wavelength in fixed-width fields; a dash when no phase-matched solution exists.
- Reference bars from sources, labeled "as reported": 1965 band 0.97-1.15 um (S badge, belllabsrecord1965; the reported range is not an energy-conjugate pair for a 0.529 um pump, e.g. 0.97 um pairs with 1.164 um); 1995 band 1.66-2.95 um at 31 um (V, myers1995a); 1.4-4 um overall (V, myers1995b).
- The plotted tuning curve is computed (derived badge) and drawn against those bars; mismatches are visible and not hidden.

### F7.3 Write, fix, erase (H1)

- A square plate (fixed 440 x 440 px). Cursor or touch writes with a 532 nm brush. The trace is an index map shown as a phase image (gray) with optional diffraction preview.
- Buttons in date order, each citing its paper: `READ 1968` (trace fades while read; chen1968), `FIX 1971` (decay stops; amodei1971b), `MGO 1980` (trace weaker and decays faster, from a hundredfold photoconductivity rise; bryan1984), `RESET`.
- Model: one-trap rate equation for the index, decay time constant labeled "display value"; the panel prints the order-of-magnitude result from the manuscript (Delta n about 1e-3, chen1969) as text, not as a simulated output.
- Reduced motion: no decay animation; buttons switch static states.

### F7.4 SAW ripple (h04)

- A 128 Y-X plate with an IDT; finger-period slider; readout `f0 = v / p` in a fixed field.
- v_SAW and K^2 come from chapter 03 data with their badges; if chapter 03 has no verified value, the readout shows `N/A` and the figure draws ripples with a "no data" label.
- Toggle quartz or LN substrate (labels the 1965 White and Voltmer device as quartz).

### F7.5 Diffusion profile (h05)

- Process toggle: Li2O out-diffusion (1973), Ti in-diffusion (1974), proton exchange (1982).
- Inputs: time, temperature. Output: index-versus-depth curve and the fundamental mode intensity, both on fixed axes (depth 0-20 um; Delta n 0-0.15 linear, or 1e-4 to 0.15 on the log toggle).
- Sourced anchors drawn as markers: 12 um single-mode out-diffused guide (carruthers1974), about 1 um Ti confinement (schmidt1974), Delta n_e = 0.12 step (jackel1982), proton-exchange diffusion constants 1.37 and 0.37 um^2/h (jackel1982). Profiles between anchors are model curves with a derived badge.

### F7.5b 1973 vs 2018 (H3)

- Two cross-sections side by side, same scale, same origin. Left: graded skin in bulk LN. Right: sub-micrometer rib on SiO2 on Si.
- Scale slider: field of view 50 um to 1 um; neither drawing's origin moves.
- Readouts (fixed 18-ch fields): `GUIDE 12 um / 0.68 um` (left: carruthers1974; right: rabiei2004), `V(pi) ~24 V* / 1.4 V` (kaminow1973 / wang2018b), `BW 3.2 GHz / N/A**` (kaminow1973 / wang2018b). One device per value; * derived from 0.13 rad/V, device length not in the abstract; ** bandwidth of wang2018b not in accessible text.

### F7.6 The stripes (H4)

- Year scrubber 1962-2018 with snap points at the table years in the manuscript.
- Strip: domain pattern morphs between stages (schematic 1962, growth stripes 1980, fiber domains 1990, poled grating 1993, nanophotonic 2018).
- Above the strip: live phasor sum of SH contributions per coherence length (computed); below: SH power versus number of domains, N^2 with QPM and bounded oscillation without, log toggle.
- Readout: first-order period for the chosen fundamental from the Sellmeier module (derived badge), e.g. about 6.8 um at 1064 nm, 18.99 um at 1550 nm (DevLog-003b values).

### F7.7 Bit rate by decade (h07)

- Step chart, log y (Gb/s), x 1985-2025. Points only where a dated source states a rate: 1997 10 (S), 1998 20 (S), 2000 40 (V), 2009 100 (V, vendor), 2022 1960 (V, research, single wavelength net).
- No interpolation or trend line. Points carry status glyphs; research and product points use different marks, labeled in the legend.

### F7.8 Ion slice (h08)

- Three-step cross-section: implant (energy slider; depth label "illustrative scale" except the sourced pair 3.8 MeV / about 10 um from us6540827, P badge), bond, split and polish.
- Final film thickness readout lists sourced films: 9 um (levy1998), 680 nm (rabiei2004).

### F7.9 Before and after 2018 (h09)

- Scatter: V_pi L (V cm) versus 3 dB bandwidth (GHz), log axes toggle. Data: eo-modulator-atlas thin-film LN and LT device rows at a pinned commit, each point with its paper; the atlas subset holds no bulk Ti:LN rows; LN and LT distinguished by marker shape.
- A vertical rule at 2018-10 in a year slider filters points by publication date.

### F7.10 Dated news ticker (h10)

- Vertical list (not an auto-scrolling marquee) of all 7.10 events and the 7.9 events from 2021-10 on, newest first.
- Each row: date, title, status badge, kind tag (paper, foundry, funding, product, standard), source link. Vendor claims carry a `VENDOR CLAIM` tag in TECH and a hatched badge in VISUAL.
- Fixed row height; filters by kind and region.

### F7.D Who did it first? (sidebar)

- Twelve dispute cards (manuscript D1-D12). Each: the question, the competing claims as dated rows with status badges, and the verdict line.
- TECH: boxed table, one row per dispute, expandable in place inside a fixed-height scroll box.
- VISUAL: cards with a "claim A / claim B" split and a balance glyph; the side with stronger evidence is not visually weighted, only labeled.

### F7.P People grid

- One cell per row of the manuscript's people table; portrait only where `images.yaml` marks `use: ok` or `attrib` (Rose, Berzelius, Hatchett, Czochralski, Ashkin); others get a 3m ornament placeholder with initials. No AI-generated portraits.

---

## Moment of joy: the timeline remembers

In VISUAL mode, the site already has a photorefractive cursor trace (DevLog-003b section 7). On the history page it gains a sequence tied to the dated events, so the reader acts out hero story H1 by scrolling:

1. Before the 1966 card enters view, the cursor writes no trace.
2. Once the 1966 card (ashkin1966) has been in view, the 532 nm cursor leaves its usual faint trace over the timeline band.
3. When the 1968 card (chen1968) enters view, the band briefly reconstructs the reader's own trace as a diffracted image (a computed Fourier-plane rendering of the trace bitmap) for 1 s, then returns.
4. After the 1971 card (amodei1971b), the trace stops decaying for the rest of the session ("fixed").
5. After the 1980 MgO card (iqec1980), the trace is fainter and fades faster.

Each step's popup names the event and cites it. TECH mode: none of this; the log table is static. `prefers-reduced-motion`: steps 2-5 are off and the cards carry a static icon noting the step.

---

## Layout-shift safety (all figures)

- Every figure box has CSS-fixed width and height (or `aspect-ratio`) before data loads; skeleton frames use the same box.
- All numeric readouts use fixed `ch` widths with tabular numerals and right alignment; unit strings are part of the fixed field.
- Popups and the row popup are absolutely positioned overlays; they never push content.
- Filtering changes only content inside fixed-height scroll containers; count lines are zero-padded.
- Event cards clamp text to their box; no card grows on hover.
- Verification for the integration lane: record `getBoundingClientRect()` of each figure container and of the page `scrollHeight` at load, after each filter extreme (ALL, single chapter, empty result), at slider extremes (F7.2b, F7.5, F7.5b, F7.6, F7.8), and in both modes and both themes at 1440 and 390 px; all must match to the pixel.
