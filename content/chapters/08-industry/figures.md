# 08 Industry: figure specifications

| Field | Value |
|---|---|
| Chapter | 08 Industry |
| As of | 2026-10-25 |
| Figures | F8.01-F8.11 (this file); atlas charts B1-B6 in `chart-specs.md` (shared conventions sec. 1) |
| Data | Industry rows: manuscript tables (grade, source id, URL, access date) -> API lane `industry_events` and `companies` datasets; atlas: pinned commit `eb97f961165a331599e8191c62e15b5a52ba1d51` |
| Physics modules | none, except F8.11 (arithmetic only; constants from the property dataset) |

Rules applied to every figure (DevLog-003a/003b/004):
- Both systems. TECH: boxed tables and mono tags, static. VISUAL: Isotype pictograms (Neurath/Arntz style) only for sourced counts, wafer pictograms drawn to scale, grade shown by fill pattern (solid F, half V, outline T, hatched E, dotted C, cross-hatched LG), never by color alone.
- Every industry mark carries its grade glyph and opens a source popup: publisher, date, URL, access date, grade definition.
- Default views: grades F, V, T, E. C and LG only where a figure states it, behind a toggle labelled with the grade.
- No layout shift: reserved boxes; filters change opacity or hide rows inside a fixed-height scroll region, never resize the figure; verified with `getBoundingClientRect` at all toggle states, 1440 and 390 px, both modes and themes.
- Data-only plots: axes with units, no titles or editorial captions in the plot area.

---

## F8.01 Rock-to-chip value chain

| Item | Spec |
|---|---|
| Question | Where does an LN chip come from, step by step, and who does each step? |
| Inputs | Manuscript 8.1 node table: node id (`ore_nb`, `ore_li`, `oxide`, `crystal`, `wafer_bulk`, `wafer_thin`, `foundry`, `chip`, `module`, `system`), facts with grade and source id, named companies (only companies listed in sec. 8.2) |
| Outputs | Directed flow left to right (desktop) / top to bottom (phone): ore (Nb, Li) -> Nb2O5, Li2CO3 -> Czochralski crystal -> bulk wafers (branch: SAW filters; PPLN and bulk modulators) -> ion-sliced and bonded thin-film wafers (LNOI, LTOI, POI) -> foundry -> TFLN chip -> module -> data center, quantum, sensing; node card with 2-4 facts |
| TECH | ASCII-style flow (box-drawing characters rendered in Plex Mono), node = boxed cell with mono label; click opens a fixed 360 px card |
| VISUAL | Engraving-style line drawings per node (pyrochlore ore, oxide powder, boule on seed, wafer with flat, bonded stack, foundry wafer, die, pluggable module); flow line drawn as a single optic-axis line through all nodes |
| Moment of joy | The ore node shows "1 wafer = 25.8 g Nb"; clicking it scales a Nb ingot icon against a 6-inch wafer at true mass ratio |
| Readouts | node cards fixed 360 x 220 px; flow canvas reserved height 280 px (desktop), 760 px (phone) |
| Acceptance | 10 nodes; every fact has grade + source id + access date; no company appears that is not listed in sec. 8.2; USGS numbers equal the manuscript (112,000 t; 104,000 t; 93%) |

## F8.02 Ecosystem map

| Item | Spec |
|---|---|
| Question | Who grows crystals, makes thin-film wafers, runs foundries, and builds devices, by region? |
| Inputs | Companies listed in sec. 8.2: company, region (US, EU/CH, CN, JP, TW, UK, CA), stage, fact, grade, source id |
| Outputs | Matrix: rows = stage (crystal, thin-film wafer, foundry, device, PPLN, quantum/computing), columns = region; each cell lists company tags; tag click opens a card with facts and grades |
| TECH | Boxed matrix with mono SKU-style company tags; grade as a 1-letter tag inside the company tag |
| VISUAL | Same matrix as a map-free grid of company cards with a 60-degree facet, grade fill patterns; region columns labelled by name (no flags, no logos) |
| Moment of joy | Hovering a stage highlights the companies that appear in more than one stage (NanoLN: wafer; HyperLight: foundry partner and device; Soitec: POI and LNOI) |
| Readouts | card fixed 360 x 200 px |
| Acceptance | only rows graded F, V, or T appear; no logos; each company has at least one dated fact; C-graded companies listed in `open-questions.md` are absent |

## F8.03 Wafer-size ladder

| Item | Spec |
|---|---|
| Question | How large have LN wafers become, and who said so? |
| Inputs | Manuscript 8.3 wafer milestones (date, milestone, wafer size, product: bulk LN, bulk LT, LNOI, LTOI, TFLN on Si, grade, source) |
| Outputs | Concentric to-scale wafer outlines 3", 4", 6", 8" (76.2, 100, 150, 200 mm); each milestone as a mark on its wafer ring, ordered by date; 12-inch (300 mm) drawn only as a dashed outline with an LG tag; product filter (bulk / thin film) |
| TECH | Mono table (date, size, product, grade) beside static outline drawing |
| VISUAL | Wafers drawn to scale with flats; LNOI wafers tinted by thin-film interference color for a 600 nm film (computed from the TMM widget if available, else neutral; never a guessed color) |
| Moment of joy | The 8-inch outline holds 1.78x the area of the 6-inch outline, shown as the die count of a fixed 5 x 1 mm die placed on both (computed, gross die per wafer, edge exclusion 3 mm declared template) |
| Readouts | die-count readout, whole dies, fixed width for both wafers |
| Acceptance | 12 milestone rows; 12-inch shown only with LG; area ratio (200/150)^2 = 1.778; die count is a computed estimate labelled `derived` with the edge-exclusion template |

## F8.04 Lane-rate ladder

| Item | Spec |
|---|---|
| Question | How fast are LN transmitters in research, and what is shipping? |
| Inputs | atlas yearly maxima of symbol rate (TFLN and TFLT) + sec. 8.3 lane-rate milestones (graded) |
| Outputs | Two aligned panels on one year axis (2017-2026): top = research yearly maximum symbol rate (GBd) from atlas; bottom = product milestones as graded tags (200 G/lane available, 400 G/lane sampling, 130 GBd CDM volume shipment, 1.6T reference transceiver) |
| TECH | Mono step line + tag row |
| VISUAL | Step line with platform markers; product tags drawn as small module pictograms with grade fill |
| Moment of joy | Hover links: the 2026 product tag "400 G/lane sampling" highlights the research points above 200 GBd that make 400 G/lane PAM4 possible (PAM4 at about 200 GBd carries 400 Gb/s gross) |
| Readouts | hover card 360 px |
| Acceptance | atlas values equal the symbol-rate chart of sec. 8.4; product tags only with grade F, V, or T; Genuine Optics 3.2T (C) absent by default |

## F8.05 Platform comparison panel

| Item | Spec |
|---|---|
| Question | How does LN compare with other EO platforms in the atlas sample? |
| Content | Tabbed container for the six atlas charts; tabs share one reserved box sized to the tallest chart |
| TECH | Mono tab strip |
| VISUAL | Tabs as 44 px segmented control with sentence-case names |
| Moment of joy | The year slider of the VπL vs bandwidth chart replays 2017-2026 |
| Acceptance | switching tabs moves no element outside the chart box; stamp line `atlas eb97f96 · 2026-10-20 · fetched <date>` present on every tab |

## F8.06 OFC 2026 board

| Item | Spec |
|---|---|
| Question | What did LN and LT look like at OFC 2026? |
| Inputs | Manuscript 8.5 table (15 rows): code, short title, affiliations, abstract claim, DOI; theme tags from the five themes of sec. 8.5 |
| Outputs | Log table (TECH) / card board (VISUAL) with theme filter: 400G/lane IM/DD, manufacturing (200 mm, wafer scale), co-design with electronics, beyond C band, TFLT |
| TECH | `table.log`, mono uppercase header, codes in mono |
| VISUAL | Cards on a poster-board grid; postdeadline papers marked with a solid corner facet |
| Moment of joy | Filter "TFLT" leaves 5 cards, including the postdeadline line-rate maximum |
| Readouts | fixed-height scroll region 480 px; filter changes visibility only |
| Acceptance | 15 rows; every DOI resolves on Crossref (checked 2026-10-25); postdeadline rows: Th4A.2, Th4A.5, Th4A.6, Th4B.2; no text from full papers |

## F8.07 Market range strips

| Item | Spec |
|---|---|
| Question | What do published market forecasts say, and how much do they disagree? |
| Inputs | Manuscript 8.6 tables: publisher, release date, base value + year, forecast value + year, stated CAGR, definition (TFLN modulator / TFLN devices / bulk LN crystal / China only), grade |
| Outputs | One horizontal bar per publisher from base value (left end, base year label) to forecast value (right end, forecast year label) on a log US$ axis 10 M-10 B; grouped by definition; every bar hatched (LG pattern); GII outlier shown separately below a rule, labelled "outlier, scope unclear"; Zhiyan CNY value shown in CNY on its own row, not converted |
| TECH | Mono bars with hatching; values in mono at bar ends |
| VISUAL | Same, hatched bars; no headline number anywhere; the spread printed as a min-max bracket per group |
| Moment of joy | Toggling "base year only" lines up all base values; the 6.5x spread is visible without a single figure being chosen |
| Readouts | bracket labels fixed 24 ch |
| Acceptance | 6 TFLN rows, 3 bulk rows + 1 China row + 1 outlier; no sum, average, or consensus line; no currency conversion; every bar tagged LG (or LG/C) |

## F8.08 LN in your life

| Item | Spec |
|---|---|
| Question | Where does a non-specialist meet LN? |
| Inputs | Manuscript 8.7 cards (10) |
| Outputs | 10 cards: object, hook, caveat (always visible, not hidden), grade, source link |
| TECH | 2 x 5 boxed card grid, mono grade tag |
| VISUAL | Isotype pictogram per card (phone, server rack, gyroscope, green beam, qubit chip, processor, laser, LiDAR car, rock); counts shown as pictogram rows only where a sourced count exists (card 1: 50 filter glyphs, "> 50 (2018, 4G mid/high tier)") |
| Moment of joy | Card 10 flips to show the 25.8 g of niobium in a 6-inch wafer as a to-scale Nb cube (side 1.44 cm if Nb density is 8.57 g/cm^3; density not yet sourced) |
| Readouts | card height fixed; flip does not resize |
| Acceptance | caveats visible by default; no claim that green pointers use LN; card 1 states that most SAW filters use LT and BAW uses AlN; Nb cube side computed from Nb metal density, which needs a source before shipping (open question Q8.6); until then the cube is omitted |

## F8.09 Events timeline

| Item | Spec |
|---|---|
| Question | What happened in the LN industry, when, and how sure are we? |
| Inputs | Manuscript 8.8 events (25 default rows) plus C-graded rows hidden by default; fields `date, event, entities, region, source_url, accessed, grade` |
| Outputs | Proportional time axis 2020-2026 with event marks (grade glyph), synchronized log table below; filters: grade, region, stage |
| TECH | `table.log` with a mono date column; axis as a 1-line strip of tick marks |
| VISUAL | Time axis with event cards in a snap-scroll row (same pattern as the landing chronology); mark and card highlight each other |
| Moment of joy | Filter "foundry" shows the 2023-2026 cluster of line announcements across four regions |
| Readouts | scroll region fixed 420 px; filters change visibility only |
| Acceptance | 25 default rows; every row has URL and access date; toggling C adds rows without moving the axis |

## F8.10 Neighbors and rivals

| Item | Spec |
|---|---|
| Question | What are LN's competing modulator platforms, and what does each do better? |
| Inputs | Atlas medians per platform (sec. 8.4 charts; sec. 6.3 table): V_pi L median, bandwidth median and lower-bound share, electrode length median, row counts; one sourced sentence per platform: TFLT (wang2024nat: LT already used for 5G RF filters), BTO (PsiQuantum Omega uses BTO switches, R09 S54, C, labelled), InP, SiPh, polymer (atlas only) |
| Outputs | 6 cards (TFLN, TFLT, SiPh, InP, BTO, polymer) with the same four numbers in the same positions; n beside each median |
| TECH | Boxed table, one row per platform |
| VISUAL | Cards with a to-scale electrode bar (median length on a shared 10 mm ruler) |
| Moment of joy | The to-scale electrode bars make the 6.4 mm vs 0.28 mm footprint gap visible at a glance |
| Readouts | numbers in fixed fields: V cm and mm with 2 decimals, GHz with 1 decimal |
| Acceptance | numbers equal manuscript 06 sec. 6.3 table; SiPh V_pi L shown as "no push-pull rows"; BTO sentence shows grade C until a primary page is read |

## F8.11 Niobium per wafer calculator

| Item | Spec |
|---|---|
| Question | How much niobium does an LN wafer contain, and how much of world supply would an industry need? |
| Model | m_LN = rho x pi (D/2)^2 x t; m_Nb = m_LN x w_Nb; w_Nb = M_Nb / M_LiNbO3; total = N x m_Nb x (loss factor); share = total / world mine production |
| Inputs | D 76.2-300 mm (presets 3", 4", 6", 8", 12"); t 0.25-1.0 mm (default 0.5, template); N wafers/yr 1e3-1e7 (log; preset 2.1e6 labelled "TDG 2029 plan scale, V, treated as all LN"); loss factor 1-5 (template, default 1); rho 4,642.8 kg/m^3 (kushibiki1999, P); M from standard atomic weights (property dataset); world Nb production 112,000 t (2025e, usgs2026nb, F) |
| Outputs | readouts: LN mass per wafer (g, 1 decimal), Nb mass per wafer (g, 1 decimal), Nb per year (t, 1 decimal), share of world mine output (%, 4 decimals) |
| TECH | Mono form with four readouts |
| VISUAL | Wafer drawn to scale against a stack of Nb ingots whose height scales with total mass; world production as a fixed reference bar |
| Moment of joy | At 2.1 M 6-inch wafers the share readout reads 0.0483%; even loss factor 5 stays below 0.25% |
| Readouts | 4 fields, fixed 40 ch |
| Acceptance | 150 mm x 0.5 mm: m_LN 41.0 g, m_Nb 25.8 g; 200 mm: 72.9 g, 45.8 g; N = 2.1e6, loss 1: 54.1 t, 0.0483%; loss 5: 0.242%; outputs labelled `E` (estimate) with assumptions listed |
