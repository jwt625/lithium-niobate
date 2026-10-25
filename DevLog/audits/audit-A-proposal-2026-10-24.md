# Audit A: DevLog-001 proposal (traceability, spot checks, coverage, consistency, physics, writing)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Auditor | Fresh-context audit subagent (Claude Code); no prior conversation context used |
| Scope | `DevLog/DevLog-001-proposal.md` against `DevLog/DevLog-000-kickoff-and-requirements.md` and `research/R01`..`R13`; physics of DevLog-001 and `research/R12-theme-and-visual-language.md` |
| Method | Read DevLog-000, DevLog-001, R12, R13 in full; targeted reads/greps of R01-R11 for every number, date, name, DOI cited in DevLog-001. 9 polite external requests (Crossref API without any mailto or personal parameter, Zenodo API, Stanford PURL, Summit Partners page, Wikipedia API, one web search; UMC and Business Wire returned 403). One local Sellmeier calculation from the R06 Zelmon coefficients. No files edited other than this report. |

## Summary verdict

The proposal is well structured, mostly traceable, and covers almost every kickoff requirement. Most numbers match the cited notes exactly (R04 atlas statistics, R11 timings, R06 hosting limits and defaults, R01 counts and licenses, R09 market range and Series C). No emoji. ISO dates are used throughout. The DC-drift statements in DevLog-001 and R12 agree with R08: neither claims Li-ion migration.

Fix before the proposal is treated as final: 0 critical, 7 major, 23 minor findings. The major items are:
- one history hero story that the primary abstract contradicts (Kaminow 1973 is not thin-film LN in the modern sense);
- a wrong QPM period example in R12;
- the launch set contradicts itself (F3);
- two misquoted numbers or claims from R09 ("phone RF filters are mostly LT"; "LN uses about 0.05%" of mined Nb);
- the bruno-simon-style playful 3D is weak at launch;
- public-repo hygiene issue in DevLog-001 sec. 16 and R02 [redacted by coordinator].

## Findings

Severity: critical = blocks publication or factually dangerous; major = wrong or misleading claim, a requirement gap, or a contradiction that changes a decision; minor = imprecision, small mismatch, or hygiene.

| ID | Sev. | Location | Finding | Evidence | Suggested fix |
|---|---|---|---|---|---|
| A01 | major | DevLog-001 sec. 6 (History hero stories): "thin-film LN modulator in 1973 (Kaminow et al., APL 22, 540) vs 2018"; R07 rows/story 4 ("A thin-film LN modulator 45 years before the 2018 TFLN paper") | Misleading physics framing. The 1973 device is an out-diffused planar waveguide in bulk LiNbO3, not a thin LN film on an insulator. R07 itself flags "Film method not checked" / "Paper body not read", but the proposal promotes it to a hero story with no caveat. | Crossref abstract, 10.1063/1.1654500 (APL 22(10), 540-542, 1973-05-15; Kaminow, Carruthers, Turner, Stulz): "An out-diffused planar optical waveguide in LiNbO3 has been used to produce an efficient broad-band electro-optic phase modulator ... 3.2 GHz" | Reframe as "a 'thin-film' modulator in 1973: a Li2O out-diffused surface guide in bulk LN (Carruthers 1974 lineage), not LNOI". This is also a natural tie-in to the kickoff's Li out-diffusion theme. Update R07 status and lay hook. |
| A02 | major | R12 sec. 3 item 4: "period 4.4 um for 1064 -> 532 nm SHG in congruent LN at 25 C" | Wrong number. First-order bulk QPM period for e-e-e 1064 -> 532 nm SHG in CLN is about 6.8 um. 4.4 um is close to typical TFLN 1550 nm SHG periods (waveguide dispersion), not bulk 1064 nm. Contradicts R11. | R11 A1: "bulk QPM period 6.818 um (1064 to 532 SHG)" (Zelmon CLN, 21 C). Recomputed here from the R06 Zelmon CLN n_e coefficients: n_e(1064) = 2.15554, n_e(532) = 2.23357, Lambda = 6.818 um; 1550 -> 775 nm: 18.989 um. | Replace with 6.8 um (Zelmon CLN, 21 C, `derived`), or remove the hard number and keep "computed from the Sellmeier module". |
| A03 | major | DevLog-001 sec. 0 item 3 and sec. 5 ("Launch set (tier 1)" lists F1-F5) vs sec. 13 P1/P2 | Internal contradiction. F3 Modulator Designer is in the launch set in sec. 0/5 but deferred to P2 in the roadmap. The P1 row lists F1, F2, F4, F5 only. | Sec. 13 P1: "F2 ..., F4 ..., F5 ..."; P2: "F3 Modulator Designer (closed-form, then atlas engine)" | Decide: either move F3 closed-form into P1 or say "four flagships at v0.1, F3 in P2". Align sec. 0, 5, 13 and open question 7. |
| A04 | major | DevLog-001 sec. 16; R02 | [redacted by coordinator] Public text pointed to sensitive and copyrighted material in the author's blog source, and recorded an internal process incident. | - | Move specifics out of the public repo; keep a neutral do-not-copy rule. |
| A05 | major | DevLog-001 sec. 6: "phone RF filters are mostly lithium tantalate, LN's sibling, and the site says so" | Misquote of R09. R09's caveat is about SAW filters only. Phone RF front ends also use many BAW/FBAR filters (AlN), so "phone RF filters are mostly LT" is not supported. The overstatement sits on the card labeled "honest version". | R09 sec. 5 row 1: "Most SAW filters use LT, not LN. BAW filters use AlN, not LN" | Change to: "Most SAW filters in phones use LT, LN's sibling; BAW filters use AlN." |
| A06 | major | DevLog-001 sec. 6: "LN uses about 0.05% of it, R09's own calculation shown with its inputs" | Misquote. R09's 0.05% is a hypothetical scenario: 2.1 M 6-inch-equivalent wafers/yr, the size of TDG Holding's 2029 plan, before 2-5x boule and kerf losses. It is not actual LN Nb consumption. With losses the scenario gives about 0.1-0.25%, still well under 1%. | R09 sec. 1.1: "Even 2.1 million 6"-equivalent wafers a year (the size of TDG Holding's 2029 plan ...) would need about 54 t of Nb. That is about 0.05% of world mine output, before boule and kerf losses (assume about 2-5x), so still well under 1%." (Arithmetic re-checked: 62.8 wt% Nb, about 26 g Nb per 6-inch x 0.5 mm wafer, 54.6 t vs about 112 kt.) | "Even a 2029-scale plan of 2.1 M wafers/yr would need about 0.05% of mined Nb (about 0.1-0.25% with growth losses); estimate, R09." Label it an estimate. |
| A07 | major | DevLog-001 sec. 5, 8, 13 vs kickoff req. 6 (bruno-simon.com: "3D, playful (Blender-rendered TFLN products and components)") | Requirement gap at launch. Every Blender asset (A01-A06) and the boule-to-chip zoom are in P2. The P1 3D content is the F1 conoscope (a 2D shader) plus an index ellipsoid. Nothing playful or game-like (Bruno's drivable-world pattern) is planned. R10 F1 proposed the boule -> wafer -> chip hero as the Bruno-pattern piece. | Sec. 13 P2: "3D assets A01-A06 and boule-to-chip zoom"; R10 sec. 5.2 F1; R05 implication 6 calls A01-A06 the "Launch set (P1)" | Bring at least A01 (reuse, procedural), A04 and one playful 3D toy (e.g. a spin-the-crystal or a draggable TFLN chip with a light pulse) into P1, or state explicitly that the Bruno-style piece is deferred. Note that R05 calls A01-A06 "P1", which conflicts with DevLog-001. |
| A08 | minor | DevLog-001 sec. 6: "50 of 56 stated wafer suppliers are NANOLN" | Misphrased. It is 50 of 56 papers that state a supplier (TFLN 41/43, TFLT 9/13), not 50 of 56 suppliers. The source spells it "NanoLN". | R04 sec. 2: "56 of 105 TFLN/TFLT papers state a wafer supplier; 50 of those name NanoLN / Jinan Jingzheng" | "50 of the 56 TFLN/TFLT papers in the atlas that name a wafer supplier name NanoLN (Jinan Jingzheng)." |
| A09 | minor | DevLog-001 sec. 6: "median telecom TFLN VpiL about 2.4 V cm (push-pull, n = 66) flat 2018-2026" | 2.44 is the median pooled over all years. Per-year medians range from 1.23 (2024, n = 15) to 2.92 (2025). R04 says "about 2-3 V cm". "Flat" is R04's interpretation and should be labeled as such. | R04 tables 2.3 and 2.4 | "pooled median 2.44 V cm (n = 66); per-year medians about 2-3 V cm except 2024 (1.23, slow-light rows)". |
| A10 | minor | DevLog-001 sec. 2 row 6: "a 0.4-0.6 um film on a 500-725 um handle" [R05, R13] | Does not match either cited note. | R05: "0.3 to 0.9 um film on a 500 to 725 um handle"; R13: "600 nm film on 500 um handle" | Use R05's range or cite a source for 0.4-0.6 um. |
| A11 | minor | DevLog-001 sec. 8 ("hero <= 2 MB") vs sec. 10.4 ("3D hero <= 2-3 MB") | Internal inconsistency. The budgets come from different notes (R05 mobile 2 MB; R10 "~3 MB"). | R05 budget table; R10 principle 7 | Pick one, e.g. "mobile <= 2 MB, desktop <= 5 MB" per R05. |
| A12 | minor | DevLog-001 sec. 2 row 2: "(r13 sign discrepancies, c14 vs p14/p41 frame mismatch in common TFLN models)" | Overstated. R06 records one r13 sign difference, taken from the author's 2018 notes and not independently verified. The c14/p14 pairing is "a likely sign mismatch", "unconfirmed". | R06 sec. 3 items 2 and 5 | "a reported r13 sign discrepancy (unverified) and a likely c14 vs p14/p41 frame mismatch". |
| A13 | minor | DevLog-001 sec. 2: "R08 found 45 reviews (2012, 2018-2026). All freeze their tables ... none ships machine-readable data" | #45 is an arXiv preprint (2026-05-09), and some entries are marked "adjacent". "None ships machine-readable data" is stronger than R08, which states the gap per review and that all freeze tables at publication. Supplementary data was not checked. | R08 sec. 1 table row 45; R08 implication 1 | "45 reviews and perspectives (1 preprint) ...; none found with machine-readable metric tables". |
| A14 | minor | DevLog-001 sec. 7: "Status: R06's key (primary-seen / secondary / computed / unverified)" | R06's key is P, P(abs), P-db, S, V, C, U. The proposal omits P-db (CC0 transcription) and V (vendor), and both are used in R06 tables. | R06 "Status key" | List the full R06 key. |
| A15 | minor | DevLog-001 sec. 10.1: "custom domain lithium-niobate.com via Cloudflare DNS ... Author default" | Not in any research note. R06 mentions only Cloudflare Pages/Workers as fallbacks. | grep over R01-R13 | Cite the source or move it to open question 11. |
| A16 | minor | DevLog-001 sec. 5 vs sec. 9 vs sec. 13 | Tier naming is inconsistent. Sec. 9 tier 1 "Launch" includes ring + EO comb and drift/photorefractive toys, while sec. 5 lists the DC-drift simulator and ring + EO comb as tier 2/3 "after launch" and the roadmap puts them in P2/P3. | Sec. 5 "Tier 2 and 3"; sec. 9 table; sec. 13 | Use one tier list (P0-P4) across sec. 5, 9, 13. |
| A17 | minor | DevLog-001 sec. 4: "all off under reduced motion [R12 sec. 5]" | R12 gives per-effect fallbacks, many of them "Static" (not off), and the Pockels slider "still works". | R12 sec. 5 last column | "each has a reduced-motion fallback (static or off)". |
| A18 | minor | DevLog-001 sec. 4 launch set vs kickoff req. 7 | The kickoff names three-wave mixing, four-wave mixing, OPO, Li diffusion, and charge screening/shielding. The proposal's launch set covers GRIIRA, vacancies, bias drift and photorefraction. TWM, FWM, OPO and Li out-diffusion appear only by reference to R12 (where they exist), and "screening" is never named in DevLog-001. | Kickoff req. 7; DevLog-001 sec. 4; R12 sec. 5 rows TWM/FWM/OPO/Li | Add a one-line mapping in sec. 4 of every kickoff-named effect to its R12 motif and phase. Name screening under bias drift and photorefraction. |
| A19 | minor | R07 sec. 1.6 vs R09 sec. 1.4/3 (cited together in DevLog-001 sec. 6) | The notes disagree. R07 dates Ligentec + X-FAB as "2026 (ECOC 2026)", TFLN-on-SiN, "no date shown". R09 gives 2026-01-19, TFLN-on-SiN and TFLN-on-SOI, 200 mm (X-FAB news, grade F). | R07 row "2026 (ECOC 2026)"; R09 S28 | Update R07 to 2026-01-19 per R09/S28. |
| A20 | minor | DevLog-001 sec. 6, R07, R09: HyperLight-UMC-Wavetek "2026-03-12" | The date depends on the source. A search shows the Business Wire release at URL `.../20260311544174/...` (2026-03-11, US) with a copy listed on 2026-03-12; the UMC URL carries 20260312. Both primary pages returned 403 here. | Web search 2026-10-24; R09 S19 (403, snippet-only) | Store both: "2026-03-11 (Business Wire, US) / 2026-03-12 (UMC, Taiwan)", grade C until a primary page is read. |
| A21 | minor | R12 sec. 3 item 2: "Gothic tracery trefoils and rose windows are 3m"; R12 sec. 5 hexagonal-domain row: "Honeycomb, basalt columns, snowflakes" | Trefoils are 3m (2D point group), but rose windows typically have 6-, 8-, 12- or 16-fold symmetry. Snowflakes and honeycomb are 6mm. Both conflict with the "only 3m ornament" rule unless the motifs are reduced to 3m subsets. | Symmetry argument | "Rose windows restricted to 3m subsets"; draw 6-fold motifs with 3m decoration (as R12 already does for hexagons). |
| A22 | minor | DevLog-001 sec. 3.1 L0 / sec. 5 F1 / sec. 9 ("conoscope (z-cut + field)") | The field direction is unspecified. The cross splits into two isogyres (uniaxial to biaxial) only for E perpendicular to c (via r22, with r51 for off-axis rays). E parallel to c (r13, r33) keeps the crystal uniaxial and only rescales the rings. R11 S2 and R12 are correct in spirit, but the spec should state it. | 3m EO tensor form (R06 sec. 3); R11 S2 "uniaxial-to-biaxial transition under field" | Specify "transverse field (E along x or y) on a z-cut plate". Optionally offer E parallel to z as a contrast toggle. |
| A23 | minor | DevLog-001 sec. 3.2 row "1 The crystal": "3m unit cell viewer" | Sloppy. 3m is the point group; the cell is the R3c hexagonal setting (R05 A01: a = 5.148 A, c = 13.863 A). | R05 A01; R12 sec. 1 | "R3c unit cell viewer (point group 3m)". |
| A24 | minor | R12 sec. 5 rows: photorefractive ("MgO doping shortens the trace"), FWM ("lines that sound as a harmonic series") | Physics nits. (a) MgO above threshold raises photoconductivity about 100x (R08 3.1), mainly reducing the space-charge amplitude and speeding optical erasure. It is not chiefly a shorter dark decay; a fainter, quicker-erasing trace is more faithful. (b) Comb lines f_n = f_0 + n f_rep form a harmonic series only for zero offset. Fine as a declared stylization. | R08 sec. 3.1 | Reword (a). Declare (b) as stylized in its hover text. |
| A25 | minor | R12 sec. 1 anchor: Rose naming "1844 per most etymologies; Wikipedia account says 1846" | Unresolved date in an anchor fact. The Wikipedia text fetched here gives 1846 for Rose's two-element claim (niobium from Niobe, pelopium from Pelops). | Wikipedia "Niobium" (API extract, 2026-10-24) | Resolve against Rose's original paper (Pogg. Ann.) before the History "why the name" story ships. |
| A26 | minor | DevLog-001 sec. 2 row 5: "A drift simulator on current primary literature" | Writing rule: uses "current" as a time descriptor. | Text | "on 2024-2026 primary literature (Holzgrafe 2024, Yeh 2026, Li 2026)". |
| A27 | minor | R05 key findings item 1 | [redacted by coordinator] Wording conflicted with kickoff req. 8. | - | "across at least 4 public projects". |
| A28 | minor | DevLog-000 TODO and progress log | Stale. R01-R11 and DevLog-001 are unchecked although they exist, and there is no progress entry for synthesis or for launching the audits. | DevLog-000 TODO | Tick the done items and add timestamped entries. |
| A29 | minor | Kickoff req. 3 (reuse and modernize old blog material) | No plan for the old outside5sigma.com LN posts after the content moves (e.g. a "superseded by lithium-niobate.com/..." banner or link on `/tutorial/ln-properties/`). Otherwise two diverging sources remain public, including the 2018 errors. | DevLog-001 sec. 3, 6 | Add an open question or task: banner or link from the old posts to the new pages. |
| A30 | minor | DevLog-001 sec. 6 thesis arc | "nanobenders" is listed as a thesis-arc step, but the PURL abstract summarized in R01 lists OMCs in TFLN -> IDT piezo drive -> LN-on-SOI -> heralded photon. Nanobenders are P07 (first-author, 2020), not stated in the thesis abstract. | R01 sec. 3 | Say "PhD-era arc" or verify against the thesis table of contents. |

Count: 0 critical, 7 major (A01-A07), 23 minor (A08-A30).

### Items checked and found consistent (no action)

- DC drift: DevLog-001 sec. 2 and R12 sec. 5 describe screening by mobile charge, interfaces, cladding and contact traps. Neither asserts Li-ion migration. Consistent with R08 sec. 3.3 and open item 6.
- GRIIRA in R12 ("green light induces infrared absorption, relevant to high-power SHG") is consistent with R08 sec. 3.2. The site behavior (IR-colored elements dim where green dwells, then recover) is a fair stylization of a transient, polaron-mediated absorption.
- 3m statements: "threefold rotation plus three mirror planes" is correct. Octahedra filled Li, Nb, vacancy along c is the standard description. Hexagonal domain shapes are flagged "verify" for SLN.
- Conoscopic figure (R12 sec. 1): a Maltese-cross isogyre with isochromes for a z-cut plate in convergent light between crossed polarizers is correct. Transverse field makes it biaxial (see A22 for the spec). Rough check: E = 1 kV/mm gives in-plane delta-n of about n_o^3 r22 E, about 7e-5, so the internal optic-axis angle 2V is about 3-4 deg (about 7-8 deg in air). The split is visible at realistic fields without exaggeration.
- Kushibiki 1999 default "< 0.1%" (R06), GitHub Pages limits and 405 for POST (R06), three.js r186, ior <= 2.333, dispersion since r164, Blender 4.2.3 / 5.2 LTS (R05), all R11 timings (75 ms, 16 ms estimate, 0.8-1.2 s, phone 2.4-7 s, 6.3k solves, about 11 min), R04 figures (225 GBd, 110 GHz bounds, 6.4 vs 0.9 mm, 768 Gb/s Th4A.2, 864 MB), R01 counts (27 items, 4 first-author, 19 of 27 LN, CC BY list P05/P07/P14/P19/P20/P22), R02 (about 75 of 120 images; 83 items), R09 ($73-476 M; Series C), R10 (Distill 50+ hours; Bruno "a little over a year"; Pudding SvelteKit; Tippy archived): all match their notes.
- `CITATION.cff`, UCUM/QUDT, path-parameterized URLs, `llms.txt`: match R06/R10.

## Requirements coverage (DevLog-000)

| # | Requirement | Where addressed in DevLog-001 | Status |
|---|---|---|---|
| 1 | Author public record (Scholar, indexes) | Sec. 6 "My LN story", sec. 11 rights, R01 | Covered |
| 2a | True 3D visualization | Sec. 8 (pipeline, A01-A06, glass strategy), F1 | Partial at launch: 3D assets in P2 (A07) |
| 2b | Interactivity | F1-F5, popups, sec. 3 | Covered |
| 2c | In-browser simulations | Sec. 9 tiers, F1-F3, R11 | Covered (tier naming inconsistent, A16) |
| 2d | AI-accessible material-property endpoints | Sec. 7 (static API v1, OpenAPI, `llms.txt`, `.md` twins, JSON-LD, Zenodo) | Covered, strong |
| 3 | Reuse and modernize blog ("LN properties", "LN photonics literature") | Sec. 2, 6 (Library), F4 (A12 math), sec. 11 (no screenshot republishing) | Covered; old-post supersession plan missing (A29) |
| 4a | Progressive depth, lay first glance | Sec. 1, 3.1 (L0-L3), hero | Covered |
| 4b | Deeper info in 2-3 clicks | Sec. 3.1 click-depth check (max 3, popups at 0) | Covered |
| 4c | Proper historical review | Sec. 6 (10 chapters, hero stories, disputes) | Covered; one hero story wrong (A01) |
| 4d | Industry trends from eo-modulator-atlas | F5, sec. 6, pinned-SHA fetch | Covered; two misphrased stats (A08, A09) |
| 5 | DYOR, subagents, discussion | R01-R13, sec. 15 open questions | Covered |
| 6a | ciechanow.ski explorables | F1-F5, shared renderer, unit switch | Covered |
| 6b | bruno-simon.com playful 3D with Blender TFLN products, reuse Blender workflows | Sec. 8 pipeline (reuse), boule-to-chip zoom | Partial: no playful element, products deferred to P2 (A07) |
| 6c | gwern.net hover popups | Sec. 3.1 rules, sec. 10.1 popup component | Covered |
| 6d | Welcoming, love, care; lift the floor for the industry | Sec. 1 audiences, open data/licenses, quirks chapter, R12 sec. 7 voice (open question 8) | Covered |
| 7 | Subtle thematic details, one theme, borrowed art/architecture/nature/industry | Sec. 4, R12 | Covered |
| 7-GRIIRA | GRIIRA | Launch behavior (photorefractive trace + GRIIRA dimming); Quirks chapter | Covered |
| 7-Li | Li diffusion and vacancies | Vacancy dot texture (launch); out-diffusion gradient only in R12 | Partial (A18) |
| 7-screen | Charge screening/shielding | Photorefractive trace and bias drift implicitly; word not used | Partial (A18) |
| 7-drift | Bias drift | Footer "re-lock" indicator; drift simulator | Covered |
| 7-TWM | Three-wave mixing | Poled-stripe dividers (QPM); cursor photons only in R12 | Partial (A18) |
| 7-FWM | Four-wave mixing | R12 comb-chapter motif only | Partial (A18) |
| 7-OPO | OPO | R12 nav ring "threshold" motif only | Partial (A18) |
| 8 | Public repo: no private info, no absolute paths | Sec. 12 | Partial (A04, A27; fixed, see Resolution). No absolute local paths found in DevLog-000/001 or R12. |
| 9 | Researched, detailed proposal; DevLog tracking | DevLog-001; DevLog-000 | Covered; DevLog-000 TODO stale (A28) |

## Spot checks against primary sources

| Item | Claim in DevLog-001 / notes | Source checked (2026-10-24) | Result |
|---|---|---|---|
| Zelmon erratum, DOI 10.1364/JOSAB.616304 | Published 2026-10-22; MgO5 o/e column swap in Zelmon 1997 Table 2 | Crossref API: JOSA B 43(11), 2788; published 2026-10-22 (print and online); authors Zelmon, Small, Jundt; abstract "The headings for the ordinary and extraordinary index for 5 mol. % doped lithium niobate are switched."; license Optica OA License v2 | Verified |
| Kaminow et al. 1973, APL 22, 540 | "thin-film LN modulator in 1973" | Crossref API, 10.1063/1.1654500: "Thin-film LiNbO3 electro-optic light modulator", APL 22(10), 540-542, 1973-05-15; Kaminow, Carruthers, Turner, Stulz; abstract: "An out-diffused planar optical waveguide in LiNbO3 ... phase modulator ... 3.2 GHz" | Bibliography verified; "thin-film" framing contradicted by abstract (A01) |
| Zenodo 10.5281/zenodo.7903643 | CC BY 4.0 source data for the heralded microwave photon paper | Zenodo API: title "Optically heralded microwave photon addition", license cc-by-4.0, published 2023-05-07; files Fig 2, Fig 3, ExtFig 1, 2, 3, 5 | Verified |
| Thesis purl.stanford.edu/mx877vv9870 | Public thesis (R01 title "Microwave-optics quantum frequency conversion and optically heralded microwave photons") | PURL page and MODS XML title: "Microwave-optics quantum frequency conversion and optically heralded microwave photons" | Verified |
| HyperLight + UMC + Wavetek, 2026-03-12 | 6-inch and 8-inch TFLN foundry production | UMC and Business Wire pages: HTTP 403. Web search: Business Wire release URL dated 2026-03-11, copy under 2026-03-12; Wavetek 6-inch line, UMC adds 8-inch | Partly verified (content yes; exact date depends on source; primary pages not read) (A20) |
| HyperLight Series C, 2026-06-18 | US$80 M, led by MediaTek | Summit Partners news page: June 18, 2026; $80 M Series C led by MediaTek; UMC Capital, Jabil, Foxconn, EDBI, CDIB-TEN Capital, QIA | Verified |
| Niobium etymology | Niobium after Niobe, daughter of Tantalus, namesake of tantalum; pelopium after Pelops | Wikipedia "Niobium" (API extract): "Niobe, daughter of Tantalus, the namesake of tantalum"; Rose "named them after children of Tantalus: niobium (from Niobe) and pelopium (from Pelops)", dated 1846 there | Verified (myth and naming); year 1844 vs 1846 unresolved (A25) |
| Bulk CLN QPM period (R12) | 4.4 um for 1064 -> 532 nm | Local calculation from R06 Zelmon CLN n_e coefficients: 6.818 um (matches R11 A1) | Contradicted (A02) |

## Writing-rule check

| Rule | Result |
|---|---|
| No emoji | Pass (no non-ASCII characters in DevLog-001 or R12) |
| ISO dates | Pass. Month names appear only as recurring conference months ("OFC (March)", "ECOC (September)"), which is acceptable as a schedule. |
| No "current/recent/now" as time descriptors | One hit: DevLog-001 sec. 2 "current primary literature" (A26) |
| Facts vs estimates labeled | Mostly pass: compute timings, budgets, the phone factor and lattice timing are labeled "estimate" or "proposed". Exceptions: the 0.05% Nb share (A06, a scenario presented as fact), "flat" VpiL (A09), and the c14/p14 mismatch stated as fact (A12). |

## Resolution (coordinator, 2026-10-24)

| ID | Action |
|---|---|
| A01 | Fixed: DevLog-001 sec. 6 and R07 reframe Kaminow 1973 as an out-diffused planar guide in bulk LN ("what thin film meant in 1973 vs 2018"), tied to the Li out-diffusion motif. |
| A02 | Fixed: R12 uses 6.8 um (Zelmon CLN, 21 C, derived). |
| A03, A16 | Fixed: one phase scheme (P1-P3) across sec. 0, 5, 9, 13; F3 closed-form tier in P1, atlas tier in P2; ring + EO comb moved to P2 with the deviation from R11 stated. |
| A04 | Fixed together with audit B (B1, B2, B6). |
| A05 | Fixed: "most SAW filters in phones use LT; BAW filters use AlN". |
| A06 | Fixed: 0.05% labeled an R09 estimate for a 2029-scale scenario, 0.1-0.25% with losses. |
| A07 | Fixed: F6 Crystal in Hand (playful real-time 3D: A01, A03, A04) added to P1; A02, A05, A06 in P2 with the R05 conflict stated. |
| A08, A09, A10, A12, A13, A14, A26 | Fixed as suggested. |
| A11 | Fixed: one budget (mobile <= 2 MB, desktop <= 5 MB) in sec. 8 and 10.4. |
| A15 | Fixed: DNS deferred to open question 11. |
| A17, A18 | Fixed: fallback wording; table mapping every kickoff-named effect (incl. screening/shielding, Li out-diffusion, TWM, FWM, OPO) to motif and phase. |
| A19 | Fixed: R07 Ligentec + X-FAB dated 2026-01-19 per R09 S28. |
| A20 | Fixed: both dates stored, primary pages not yet read. |
| A21, A24 | Fixed in R12 (3m subsets; MgO wording; comb sound declared stylized). |
| A22, A23 | Fixed: transverse-field spec with E-along-z contrast toggle; "R3c unit cell viewer (point group 3m)". |
| A25 | Open: resolve 1844 vs 1846 from Rose's original paper before the naming story ships (tracked in DevLog-001 sec. 18). |
| A27, A28 | Fixed (R05 wording; DevLog-000 updated). |
| A29 | Added as open question 13. |
| A30 | Fixed: "PhD-era arc", nanobenders noted as outside the thesis abstract. |
