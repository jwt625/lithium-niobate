# 08 Industry: manuscript

| Field | Value |
|---|---|
| Chapter | 08 Industry |
| As of | 2026-10-25 |
| Lane | C06 (DevLog-004) |
| Inputs | research R04 (atlas trends), R09 (industry, grades, sources; all URLs accessed 2026-10-24), R08 sec. 2.11 and 6; eo-modulator-atlas at commit `eb97f961165a331599e8191c62e15b5a52ba1d51`; USGS Mineral Commodity Summaries 2026 (niobium) re-read 2026-10-25; Murata release 2026-03-10 read 2026-10-25; Crossref records fetched 2026-10-25 (no mailto or personal parameter) |
| Companion files | `figures.md` (F8.01-F8.11), `chart-specs.md` (shared atlas conventions and charts B1-B6), `refs.yaml`, `glossary.yaml`, `open-questions.md` |

## Conventions used in this file

- Every industry claim carries `{grade | ref-id | accessed}`. Grades (R09 sec. 0): `F` fact from a primary source opened and read (government data, filing, company release or product page); `V` vendor claim about its own performance, capacity, or roadmap (read, unchecked); `T` trade press opened and read; `C` seen only as a snippet or aggregator, page not opened; `LG` low-grade (paywalled market teaser, investor forum, AI-assisted finance article: direction only, never a headline number); `E` estimate by this site with stated assumptions; `S` speculation, labelled.
- A company statement about itself is `V` even when the page is the primary source; a company statement of a dated event (an agreement signed, a product shipped) is `F/V`.
- Default views show only `F`, `V`, `T`, `E`. `C` and `LG` items appear only where the section says so, with their grade printed. `T/C` marks an event read only through trade-press coverage of a primary page that could not be opened; it is shown, with the grade printed, because two trade sources agree (R09 S19).
- Atlas statistics carry `{derived | atlas | atlas}`: counts over eo-modulator-atlas rows at the pinned commit (sample, not census).
- Dates ISO. Company names: English name as the company or the cited source writes it; Chinese names are added only after verification (open question Q8.3).
- Page copy is everything outside blocks marked `Editorial note (not page copy)`.

---

## 8.0 Chapter opener

### L1

Definition block. **The lithium niobate industry** — the chain that turns Brazilian ore and battery-grade lithium into crystals, wafers, thin films, and chips. LN and its sibling crystal LT are cut into acoustic filters for phones in high volume (LT appears to dominate SAW filters: inference from product pages, E); thin-film LN is entering data-center optics as modulator chips.

Door art (VISUAL): wafer pictogram; Isotype counts only where a sourced count exists (DevLog-003b sec. 5).

Stamp line under the heading: `Industry facts accessed 2026-10-24 · atlas eb97f96 (2026-10-20)`.

---

## 8.1 Rock to chip

### L1

Lithium niobate is about 63% niobium by weight. Almost all of that niobium is mined in Brazil, mostly for steel. A 6-inch wafer holds about 26 g of niobium; even 2 million such wafers a year would use about 0.05% of world niobium output (estimate, 8.1 L3). Supply limits, if any, sit downstream in oxide refining, crystal growth, and thin-film bonding (estimate, E).

[[F8.01]] Value-chain flow: ore -> oxide -> crystal -> wafer -> thin-film wafer -> foundry -> chip -> module -> system. Each node opens a card with 2-4 graded facts and named companies.

### L2: node facts

| Node | Fact | Grade | Source |
|---|---|---|---|
| Niobium ore | World mine production 112,000 t Nb content in 2024 and 2025 (estimated) | F | usgs2026nb (re-read 2026-10-25) |
| | Brazil 104,000 t, about 93% of world production; Canada 6,900 t (2024e), 6,000 t (2025e) | F | usgs2026nb |
| | Reserves: Brazil 14,000,000 t; Canada 640,000 t; world > 21,000,000 t | F | usgs2026nb |
| | Brazil ferroniobium exports 92,000 t in 2024; destinations China 49%, Netherlands 17%, Singapore 9% | F | usgs2026nb |
| | US niobium end use: steels about 77%, superalloys about 23%; LN/LT electronics not listed separately (N/A) | F | usgs2026nb |
| Niobium oxide | Nb2O5 is 69.904 wt% Nb | F | usgs2026nb |
| | US niobium oxide imports 2021-2024: Brazil 89%, Estonia 4%, Thailand 4% | F | usgs2026nb |
| Lithium | World production 290,000 t Li content in 2025 (excl. US), up from 222,000 t in 2024; batteries 88% of global end use; LN/LT not broken out (N/A) | F | usgs2026li (R09 S2, accessed 2026-10-24) |
| Bulk crystal and wafer | Sumitomo Metal Mining: LT and LN by Czochralski; 4" and 6" wafers; LN 128-degree rotated Y (350 um at 4", 500 um at 6"); LT 36-50-degree rotated Y; main use SAW filters in smartphones | F | smm-ltln (R09 S3) |
| | Shin-Etsu Chemical: LT single crystals and wafers, 4" and 6", for SAW devices; LN not listed on its product page | F | shinetsu-lt (R09 S4) |
| | TDG Holding (Tiantong, SSE 600330): states 8-inch LN in mass production (IR record 2026-06-03); plan for 1.68 M piezoelectric + 0.42 M bonded wafers per year by 2029-12 | F (statement) / V (roadmap) | tdg2026ir (R09 S5) |
| Thin-film wafer (LNOI, LTOI, POI) | NanoLN (Jinan Jingzheng Electronics Co., Ltd.): 300-900 nm LNOI and LTOI films; thick films 5-50 um | F | nanoln-home (R09 S6) |
| | Soitec Connect POI: LT6, LT8 (150 / 200 mm LT) and LN6 (150 mm LN) for RF filters | F | soitec-poi (R09 S10) |
| | Soitec to supply Europe-made 150 mm LNOI to CCRAFT; a processed 200 mm wafer shown (2025-06) | T | opticsorg-2025-06-25 (R09 S13) |
| | Of 56 TFLN/TFLT papers in the atlas that state a wafer supplier, 50 name NanoLN | derived | atlas (chart B4) |
| Foundry | Ligentec and X-FAB: TFLN-on-SiN and TFLN-on-SOI at 200 mm inside X-FAB (announced 2026-01-19; no production dates) | F | xfab-2026-01-19 (R09 S28) |
| | HyperLight with UMC and its subsidiary Wavetek: high-volume production on 6" and 8" (announced 2026-03-11/12) | T/C (UMC release returned 403; content read through trade-press coverage) | R09 S19 |
| | CCRAFT (CSEM spin-off, 2025): pure-play TFLN foundry, MPW runs, 150 mm | T | opticsorg-2025-05-13 (R09 S14) |
| Chip and module | Advanced Fiber Resources (Zhuhai) Ltd. (AFR): TFLN 96/130 GBd coherent driver modulators "reached volume shipment" (2025-04-07) | F/V | afr-2025-04-07 (R09 S31) |
| | Murata: TFLN EO modulator ">100 GHz", "400 Gbps/ch PAM4", shown as a product in development at OFC 2026 | V | murata2026 (read 2026-10-25) |
| | HyperLight: 1.6T-DR8 reference transceiver at 20 W (2026-03-17) | F/V | bwchina-2026-03-17 (R09 S20) |

### L3: how much niobium is in a wafer

Estimate `{E}`, assumptions stated:
- Formula LiNbO3 molar mass 147.84 g/mol (Li 6.94, Nb 92.906, O 15.999); Nb mass fraction 62.8%. Congruent Li(1-5x)Nb(1+x)O3 with [Li]/[Nb] = 0.94 (x = 0.0101): 148.43 g/mol, 63.2% Nb, 25.9 g Nb per 150 mm x 0.5 mm wafer.
- Density 4,642.8 kg/m^3 (congruent, SAW grade) `{P | kushibiki1999}` (R06).
- 150 mm x 0.5 mm wafer, flats ignored: volume 8.84 cm^3, mass 41.0 g LN, 25.8 g Nb. 200 mm x 0.5 mm: 72.9 g LN, 45.8 g Nb.
- Scenario: 2.1 M 6-inch-equivalent wafers per year (the size of TDG Holding's 2029 plan, which mixes piezoelectric LT and LN wafers; treated here as all LN, an upper bound) need 54 t Nb, 0.05% of 2025 world mine output; with boule and kerf losses of 2-5x (assumed), 0.1-0.25%.
- Conclusion `{E}`: niobium mining does not constrain LN supply. Constraints, if any, sit in high-purity Nb2O5 refining, crystal growth, and thin-film bonding capacity.

---

## 8.2 Who grows, slices, fabs, and builds

### L1

Crystal growers that list LN or LT on their own product pages include Sumitomo Metal Mining and Shin-Etsu (LT only). One supplier, NanoLN, is named in 50 of the 56 published TFLN/TFLT papers that state where their wafers came from. Since 2023, companies and institutes in China, the US, Europe, and Taiwan have announced thin-film LN production or pilot lines (8.3).

[[F8.02]] Ecosystem map by region (US, EU/CH, CN, JP, TW) and stage (crystal, thin-film wafer, foundry, device/module); one card per company, graded facts only.

### L2: verified entries (F, V, T)

| Stage | Company (region) | Verified fact | Grade | Source |
|---|---|---|---|---|
| Crystal | Sumitomo Metal Mining (JP) | LT and LN crystals and 4"/6" wafers for SAW | F | R09 S3 |
| Crystal | Shin-Etsu Chemical (JP) | LT crystals and wafers 4"/6" | F | R09 S4 |
| Crystal | TDG Holding Co., Ltd. (Tiantong, SSE 600330) (CN) | 8-inch LN "in mass production" (statement); 2029 wafer plan; states it does not make optical modules | F / V | R09 S5 |
| Crystal | Nanzhi Xincai Technology Co., Ltd. (Suzhou) (CN) | founded 2021-12 on a Nanjing University team; LN/LT crystal materials; Pre-A round over CNY 100 M | T / V | R09 S8 |
| Thin-film wafer | NanoLN, Jinan Jingzheng Electronics (CN) | LNOI/LTOI 300-900 nm films | F | R09 S6 |
| Thin-film wafer | NanoLN (CN) | investors include Huawei Hubble; preparing IPO; strategic investment from Shandong Hi-Speed (2026-04) | T | R09 S7, S8 |
| Thin-film wafer | Soitec (FR) | POI LT6/LT8/LN6; 150 mm LNOI for CCRAFT (2025-06) | F / T | R09 S10, S13 |
| Thin-film wafer | ELENA consortium (EU H2020, ended 2025-06) | claims the first European commercial LNOI substrates (150 mm); states the prior chain "depended on a single commercial supplier outside the EU" | T / V | R09 S12 |
| Foundry | HyperLight (US) with UMC / Wavetek (TW) | volume production on 6" and 8" (2026-03) | T/C | R09 S19 |
| Foundry | CCRAFT (CH) | MPW runs CLN600-Core / CLN600-Plus, 150 mm; targets 12 M chips/yr and up to 2,000 wafers/month by 2030 | T / V | R09 S13-S16 |
| Foundry | Lightium (CH) | design, foundry, packaging services; US$7 M seed (reported 2024-09-20) | T / V | R09 S24 |
| Foundry | Ligentec + X-FAB (CH/DE) | TFLN-on-SiN / TFLN-on-SOI at 200 mm (2026-01-19) | F | R09 S28 |
| Foundry | Quantum Computing Inc. (US) | TFLN foundry; first foundry order announced 2024-11-13 | T / V | R09 S26 |
| Foundry | CHIPX, Wuxi Photonic Chip Research Institute of SJTU (CN) | 6" pilot line; first 6" TFLN wafer reported 2025-06-09 | T (text partly garbled) | R09 S29 |
| Foundry | Anpai Optoelectronics at Jiufengshan Laboratory (CN) | reported "world's first 8-inch TFLN line", completed 2023-09 | T (reporter claim) | R09 S30 |
| Device | HyperLight (US) | US$80 M Series C led by MediaTek (2026-06-18); 200 G/lane products available, 400 G/lane sampling (2026-06) | F / V | R09 S18 |
| Device | AFR (CN) | TFLN 130 GBd CDM volume shipment (2025-04-07); 400 G/lane chip for 1.6T and 3.2T (ECOC 2025, 2025-10-01) | F / V | R09 S31, S32 |
| Device | Murata (JP) | TFLN EO modulator in development (OFC 2026); states its high-frequency filters use LiNbO3 | V | murata2026 |
| Device | Exail, formerly iXblue (FR) | LN modulators since 2000; FOG integrated optical circuits; over 25,000 FOGs sold | F / V | R09 S37 |
| Device | Jiangsu Niobao Optoelectronics Technology Co., Ltd. (Nanjing) (CN) | TFLN modulator chips, full process in house (claim); Series C in progress (2026-06) | T / V | R09 S8 |
| PPLN | Covesion (UK), with AdvR (US) in Hawthorn Photonics (2025-06-05) | MgO:PPLN crystals 460-6000 nm; AdvR LN/KTP waveguide converters | F | R09 S41 |
| Quantum / computing | Q.ANT (DE) | EUR 62 M Series A (2025-07); TFLN-based photonic processors; "up to 30x" energy efficiency (vendor claim) | T / V | R09 S51 |
| Quantum | Xanadu (CA) with HyperLight | TFLN waveguide loss < 2 dB/m and EO switch loss about 20 mdB, high-volume fab (2025-07-30) | T / V | R09 S53 |

Corrections that keep this table honest (R09 sec. 6): PsiQuantum's Omega chipset uses barium titanate switches on SiN, not LN (C, S54); Lumentum sold its LN modulator line to AFR in 2019 (C/T, S33) and has no TFLN product found; no TFLN modulator announcement was found for Coherent Corp. (C, S66).

### L2: who fabricates published devices (atlas)

`papers.foundry_or_fab` over 105 TFLN/TFLT papers `{derived | atlas | atlas}`: university and shared cleanrooms lead (Center of MicroNanoTechnology 7; Center for Nanoscale Systems 6; EPFL Institute of Physics cleanroom 5); commercial or foundry entries: Sandia National Laboratories 4, Luxtelligence 2, imec 2, LIGENTEC 2, Chongqing United Microelectronics Center 2, CSEM 1, Liobate 1. Affiliation countries (papers): CN 46, US 37, CH 16, DE 10, BE 7, HK 6, SG 5, JP 3, CA 3.

### L3

- "Verified" here means the page was opened and read on the access date; it does not mean the claim was checked independently (that is grade F for dated events and statements only).
- Entries graded `C` (Fujitsu Optical Components TF-LN CDM, Genuine Optics 3.2T, EOSPACE, Thorlabs, HC Photonics, NTT Innovative Devices, Liobate funding, Partow) and `LG` (wafer price, supply gap, AFR margins, TDG 12-inch) are kept in `open-questions.md` until a primary page is read.

---

## 8.3 Wafer size and lane rate

### L1

Larger wafers carry more chips per process step. Between 2023 and 2026, 6- and 8-inch thin-film LN lines were announced in China, Europe, and Taiwan, two of them inside merchant silicon foundries (UMC/Wavetek, X-FAB). By 2026, vendors stated 200 Gb/s-per-lane TFLN products available and 400 Gb/s per lane sampling.

[[F8.03]] Wafer-size ladder: wafer outlines drawn to scale (3", 4", 6", 8"), each annotated with dated, graded milestones; 12-inch shown only as a dashed outline labelled with its LG grade.
[[F8.04]] Lane-rate ladder: research symbol-rate maxima per year from the atlas (chart B2) beside dated product milestones (graded).

### L2: wafer milestones

| Date | Milestone | Wafer | Grade | Source |
|---|---|---|---|---|
| 2020-08 | Wafer-scale TFLN PICs, 0.27 dB/cm, DUV lithography | 4" and 6" | reported, Y | luke2020 |
| 2023-09 | Anpai 8-inch TFLN line completed (reporter claim) | 8" | T | R09 S30 |
| 2024-03 | Jiufengshan Lab: first 8-inch Si-photonic TFLN wafer (reporter claim) | 8" | T | R09 S30 |
| 2025 | 4-inch TFLN on quartz, > 110 GHz, V_pi L 2.92 V cm, 50% yield | 4" | reported, Y | liu2025lam |
| 2025-06 | Soitec 150 mm LNOI to CCRAFT; 200 mm shown | 6" / 8" | T | R09 S13 |
| 2025-06-09 | CHIPX first 6-inch TFLN wafer | 6" | T | R09 S29 |
| 2026-01-19 | Ligentec + X-FAB TFLN-on-SiN / SOI | 200 mm | F | R09 S28 |
| 2026-03 | TFLN modulators on 200 mm Si in a BEOL CMOS foundry; 1.87 V cm best on wafer map; chip bandwidth 93-110 GHz (OFC 2026 W1A.3) | 200 mm | reported, atlas `zhang2026b` | ofc2026-w1a3 |
| 2026-03 | HyperLight + UMC / Wavetek volume production | 6" / 8" | T/C | R09 S19 |
| 2026-06-03 | TDG Holding states 8-inch LN in mass production | 8" (bulk LN) | F (statement) | R09 S5 |
| undated | NanoLN lists LNOI/LTOI at 3, 4, 6, 8 inch | 3"-8" | F (company page) | R08 sec. 2.11 |
| undated | 12-inch optical-grade LN wafer "prepared" (TDG, secondary, unsourced) | 12" | LG | R09 S9 |

### L2: lane-rate milestones

| Date | Milestone | Grade | Source |
|---|---|---|---|
| 2018 | 100 GBd OOK, 112 Gb/s PAM4, hybrid Si-LN MZM (research) | reported | atlas `he2019-a`; he2019np |
| 2022 | 128 GBd PAM16, net 400 Gb/s IM/DD with a TFLN MZM (research) | reported, Y | berikaa2022 |
| 2025-04-07 | AFR: TFLN 130 GBd CDM in volume shipment; 400 Gb/s/lane PAM4 TFLN chip debut | F / V | R09 S31 |
| 2025 | 440 GBd single-wavelength PS-16-ASK through a TFLN modulator (research) | reported, Y | deakin2025ofc |
| 2026-03 | 420 Gb/s/lane O-band PAM4 TOSA on TFLN, 210 GBd (OFC 2026 W4J.4) | reported, Y(conf) | ofc2026-w4j4 |
| 2026-03 | 768 Gb/s line rate on a TFLT MZM (OFC 2026 Th4A.2 postdeadline) | reported, Y(conf) | ofc2026-th4a2 |
| 2026-03-17 | HyperLight 1.6T-DR8 TFLN reference transceiver, 20 W | F / V | R09 S20 |
| 2026-06 | HyperLight: 200 G/lane products available, 400 G/lane sampling | V | R09 S18 |

Trend readout `{E}` (built only from the rows above): 200 G/lane TFLN is shipping and 400 G/lane is sampling (2025-2026).

### L3

- A "line" announcement is not a capacity figure; wafer starts per month are public only as targets (CCRAFT 2,000 wafers/month by 2030, V).
- Bulk LN (SAW, 8-inch at TDG) and thin-film LN (LNOI, 8-inch foundry lines) are different wafer products; the ladder labels each milestone with its product.

---

## 8.4 Platform comparison from the atlas

### L1

LN is one of several ways to put data on light. Each mark below is one published device; LN and its sibling LT are highlighted.

[[B1]] V_pi L vs bandwidth vs year, all platforms.
[[B2]] Symbol rate and line rate per year.
[[B3]] Papers per year by platform, with and without OFC 2026 ingestion; TFLT appears in 2024.
[[B4]] Wafer-supplier concentration: 50 of 56.
[[B5]] Integration mode per year.
[[B6]] Footprint by platform.

### L2: readings (atlas sample, pinned commit) `{derived | atlas | atlas}`

- TFLN telecom push-pull V_pi L median 2.44 V cm (n = 66) vs TFLT 2.43 (n = 17); TFLN bandwidth median >= 70 GHz (n = 67, 42% lower bounds), maximum 170 GHz.
- TFLT papers: 4 (2024), 4 (2025), 14 (2026; 5 of them OFC-tagged). TFLT holds the atlas line-rate maximum (768 Gb/s, `xu2026b-a`).
- Highest symbol rate per year for TFLN rose from 100 GBd (2018) to 225 GBd (2026); BTO reached 256 GBd (2025), SiPh 200 GBd (2025), InP 200 GBd (2026), polymer 224 GBd (2026).
- Footprint: median electrode length TFLN 6.4 mm, TFLT 7.5, InP 4.0, BTO 1.38, SiPh 0.9, polymer 0.28 mm.
- Wafers: 50 of 56 TFLN/TFLT papers that name a supplier name NanoLN (TFLN 41 of 43, TFLT 9 of 13).
- Integration: in 2026, 3 of 36 TFLN/TFLT papers report a foundry-native process, 3 bonded-heterogeneous, 2 micro-transfer-printed, and 10 have O-band rows (2022: 0 foundry-native, 1 O-band of 17).

### L3

- The atlas is a curated sample of 233 papers (web search, author-group follow-up, local corpus, landmarks, OFC 2026); it is not a census and per-year counts are not growth rates.
- Bounds are drawn as arrows; V_pi L comparisons use the push-pull convention only; SiPh has no push-pull telecom rows and is absent from the default V_pi L view.
- Source rights in the atlas: 66 papers open-license, 167 restricted (facts and locators only) (R04 sec. 1.2).

---

## 8.5 OFC 2026 snapshot

### L1

At the 2026 Optical Fiber Communication Conference (2026-03), thin-film LN and LT were the modulator platform in four of the 24 postdeadline papers, and one regular session (W1A) had 6 LN/LT papers of 7.

[[F8.06]] OFC 2026 board: one row per paper, theme tags (400G/lane IM/DD, manufacturing, co-design with electronics, beyond C band), atlas link.

### L2

Corpus counts from the local OFC 2026 corpus (public program metadata; full texts not redistributed) `{derived | R04 sec. 3}`: 677 papers with extracted text; 56 mention TFLN/LNOI, 83 mention LN in any form, 7 mention LT/TFLT/LTOI, 10 mention PPLN; 4 of 24 postdeadline papers are LN/LT-platform devices; session W1A "Thin-Film LN/LT and Silicon Mach-Zehnder Modulators" has 6 LN/LT papers of 7.

| Code | Title (short) | Affiliations | Claim (abstract) | Atlas | DOI (Crossref 2026-10-25) |
|---|---|---|---|---|---|
| Th4A.2 (PD) | C-band 110 GHz TFLT modulator, 768 (536) Gb/s | U. Michigan; Nokia Bell Labs | V_pi 1.35 V, > 110 GHz | `xu2026b-a` | 10.1364/ofc.2026.th4a.2 |
| Th4A.5 (PD) | Integrated 1064 nm transmitter, GaAs lasers + > 100 GHz TFLN | Nexus Photonics; Northeastern U.; Keysight | 100 Gb/s NRZ, 160 Gb/s PAM4 | `shen2026-a` | 10.1364/ofc.2026.th4a.5 |
| Th4A.6 (PD) | TFLN wafer-level co-packaged optics engine | Shanghai Jiao Tong U. | TFLN EOM + driver EIC, > 100 GHz | `huang2026-a` | 10.1364/ofc.2026.th4a.6 |
| Th4B.2 (PD) | Driver-less 448 Gb/s PAM4 and 1.2 Tb/s 16-QAM, TFLN optical DACs | McGill U.; HyperLight; Ciena | driven from CMOS logic | `starnault2026-a/b` | 10.1364/ofc.2026.th4b.2 |
| W4J.4 | 420 Gb/s/lane O-band PAM4 TOSA on TFLN | Wuhan HG Genuine Optics | 210 GBd | `yu2026-a` | 10.1364/ofc.2026.w4j.4 |
| Th1C.3 | 400G/lane for linear-drive optics | Ligent Technologies | TFLN MZM + CTLE; fab Liobate | `zhou2026-a` | 10.1364/ofc.2026.th1c.3 |
| M4D.4 | Truly differential drive of a TFLN TWE-MZM by a linear SiGe driver | Nokia Bell Labs | 140 GBd PAM8, 1.4 pJ/bit | `aimone2026-a` | 10.1364/ofc.2026.m4d.4 |
| W1A.3 | TFLN on 200 mm Si, 110 GHz, 1.9 V cm | NSTIC (Singapore) | BEOL CMOS foundry | `zhang2026b` | 10.1364/ofc.2026.w1a.3 |
| Th1D.1 | TFLN + hydrogen-free SiN on 200 mm SiPh | IME; NSTIC; NUS | die-to-wafer bonding; MZI 2.9 V cm | `tobing2026-a` | 10.1364/ofc.2026.th1d.1 |
| W1A.4 | Sub-V 110 GHz O-band TFLT MZM | U. Michigan | V_pi 1 V (10 Hz-10 kHz) | `xu2026a-a` | 10.1364/ofc.2026.w1a.4 |
| W1A.5 | LT-on-fused-silica MZM, 4-inch wafer | EPFL; KIT | 67 GHz, 1.6 V | `li2026a-a` | 10.1364/ofc.2026.w1a.5 |
| W1A.6 | Ring-assisted MZM on LT-on-SiN | LIGENTEC; UC San Diego | 1.36 V cm, > 50 GHz, wafer scale | `valdez2026-a` | 10.1364/ofc.2026.w1a.6 |
| W1A.7 | 1.6 Tb/s WDM IM/DD transmitter on TFLT | EPFL; KIT; SIMIT | 8 channels | `hulyal2026-a` | 10.1364/ofc.2026.w1a.7 |
| W1A.1 | Integrated EO frequency-domain equalizer (TFLN TW modulators) | NICT; Sumitomo Osaka Cement; Nagoya Inst. Tech.; Waseda | equalizer integrated | `yamaguchi2026` | 10.1364/ofc.2026.w1a.1 |
| Th1H.4 | Hybrid calcium titanate + TFLN modulator | Chongqing U. | 1.3 V cm, > 110 GHz, 0.86 dB IL | `su2026-a` | 10.1364/ofc.2026.th1h.4 |

Themes `{E}` (R04 sec. 3.3): 400G/lane IM/DD is the commercial target; TFLT appears as LN's sibling for telecom; manufacturing moves to 200 mm and wafer-scale bonding; modulators are co-designed with drivers; work extends beyond the C band (O band, 1064 nm).

Commercial TFLN used as lab equipment in OFC 2026 papers: HyperLight packaged 110 GHz TFLN MZM (Th2A.15, Th2A.46); Liobate TFLN chips (Th1C.2) (R04 sec. 3.2) `{derived | R04}`.

### L3

- Claims are the authors' abstract claims; atlas values differ where noted in the atlas (e.g. `aimone2026-a`: authors quote 1.1 V cm differential; the atlas view derives 2.45 V cm from 3.26 V x 7.5 mm).
- OFC full texts are local-only and not redistributed; only program metadata and facts with locators are used.

---

## 8.6 Market size: ranges, by evidence grade

### L1

Market-research firms publish forecasts for thin-film LN modulators that differ by a factor of 6.5 in the base-year value and 12 in the forecast value. None of the public teaser pages shows data or method. The bars below show each published number with its grade; there is no single headline figure.

[[F8.07]] Range strips: one bar per publisher (base year value to forecast value), grouped by product definition, every bar tagged LG.

### L2: TFLN modulator market (all LG)

| Publisher (release date) | Base | Forecast | CAGR stated | Grade | Source |
|---|---|---|---|---|---|
| Valuates Reports (2025-04-04) | US$356 M (2024) | US$3,829 M (2031) | 41.0% | LG | R09 S57 |
| 24marketreports (2025-09-12) | US$476 M (2024) | US$1,219 M (2030) | 17.0% | LG | R09 S58 |
| Intel Market Research (updated 2026-08-16) | US$73 M (2025) | US$2,510 M (2034) | 48% | LG | R09 S59 |
| QYResearch (snippet) | US$137 M (2024) | US$317 M (2031) | 12.2% | LG/C | R09 S60 |
| QYResearch, another edition (via DRI, snippet) | US$82.61 M (2025) | US$2,485.55 M (2034) | N/A | LG/C | R09 S61 |
| Astute Analytica (2025-07-07), "TFLN devices" | N/A | US$3.19 B (2033) | N/A | LG/C | R09 S62 |

Spread `{E}`: base year US$73-476 M (2024/2025); forecast US$0.3-3.8 B (2030-2034). No public TFLN figure from LightCounting or Yole was found.

Quality flags (R09 sec. 2.1): the Intel Market Research player list names NeoPhotonics (acquired by Lumentum in 2022) and "II-VI Photonics Division"; 24marketreports lists AVANEX (defunct).

### L2: bulk LN crystal / wafer market (all LG)

| Publisher | Base | Forecast | Grade | Source |
|---|---|---|---|---|
| QYResearch (LN single crystal) | US$197 M (2024) | US$386 M (2031), 10.6% CAGR | LG/C | R09 S63 |
| Dataintelo | about US$192 M (2024) | about US$352 M (2032), 7.8% | LG/C | R09 S64 |
| Other teasers (unnamed in snippet) | US$133-140 M (2024) | US$160-173 M (2032) | LG/C | R09 S64 |
| Zhiyan Consulting (China only, 2025-09-30) | CNY 454 M (2024), +12.1% year on year | - | LG | R09 S65 |
| GII listing (scope unclear) | US$4.74 B (2024) | US$7.22 B (2030) | LG/C, outlier, excluded from the range | R09 S80 |

Spread `{E}`: about US$130-200 M (2024), GII outlier excluded. Whether these include SAW-grade LT is not stated by any source.

### L2: context

| Item | Value | Grade | Source |
|---|---|---|---|
| RF filter market (Yole) | US$7.3 B (2021), US$8.2 B (2025) | C | R09 S78 |

### L3

- Definitions differ (chip vs module, bulk vs thin film, substrates in or out); base years differ; teaser pages are not reports.
- The strips plot each bar on a log axis from base to forecast; the axis spans US$10 M-US$10 B; the CAGR column is the publisher's, not recomputed.
- Unsourced numbers in Chinese finance articles (wafer price peak "CNY 28,000, about 7x", supply gap "about 40%", modulator share of module cost "10-15%") are LG and not plotted.

---

## 8.7 LN in your life

### L1

[[F8.08]] Ten cards. Each card: object, one-line hook, the honest caveat, grade, source.

| # | Object | Hook | Caveat | Grade | Source |
|---|---|---|---|---|---|
| 1 | Phone radio filters | A 2018 count put more than 50 acoustic filters in a mid- to high-tier 4G phone, more than 70 expected with 5G; many sit on LN or its sibling LT | Most SAW filters use LT, not LN (inference from product pages, E); BAW filters use aluminum nitride, not LN (E, no primary source listed) | F / T / E | R09 S3, S4, S10, S50; R09 sec. 1.7 |
| 2 | Wi-Fi, GPS, and 5G sharing one phone | Piezo-on-insulator filter wafers (LT and LN versions) are made for 5G, GNSS, and Wi-Fi coexistence | Soitec does not say which phones use them | F | R09 S10 |
| 3 | Internet and AI data centers | LN modulators write data onto light in fiber links; thin-film LN chips drive 1.6 Tb/s reference transceivers | Silicon photonics and InP compete; TFLN market share is not public | F / V | R09 S20; murata2026 |
| 4 | Navigation in aircraft, ships, satellites | Fiber-optic gyroscopes use LN integrated optical circuits to split and modulate light; Exail states over 25,000 FOGs sold | Vendor figure | F / V | R09 S37 |
| 5 | Green laser light | Periodically poled LN turns infrared laser light into green; used in Corning lasers for MicroVision pico-projectors (2010) | Cheap green pointers are not claimed to use LN; no primary source found | T | R09 S56 |
| 6 | Quantum computers and quantum links | Xanadu's Aurora system used TFLN chips; PPLN makes entangled photon pairs | PsiQuantum uses barium titanate, not LN | T / F | R09 S53, S41 |
| 7 | AI photonic processors | Q.ANT builds TFLN-based photonic processors | Performance figures are vendor claims | T / V | R09 S51 |
| 8 | Lasers in labs and factories | LN Pockels cells and Q-switches switch laser pulses on and off | Catalog listing, not market data | F | R09 S45 |
| 9 | LiDAR and sensing | TFLN IQ modulators are offered for FMCW LiDAR; LN modulators for distributed temperature sensing | Niche and industrial so far | V / F | R09 S32, S37 |
| 10 | The rock in the chip | Nearly all niobium comes from Brazil; one 6-inch wafer holds about 26 g of it | Calculated, not measured | F / E | usgs2026nb; sec. 8.1 L3 |

### L3

- Cards never state counts of LN devices per phone, car, or home: no public source separates LN from LT.

---

## 8.8 Events, 2020-2026

### L1

[[F8.09]] Dated event timeline from a JSON file (`date`, `event`, `entities`, `source_url`, `accessed`, `grade`), filterable by grade and region; the same file is the API endpoint.

### L2: events (F, V, T only in the default view)

| Date | Event | Grade | Source |
|---|---|---|---|
| 2020-07-07 | Soitec to make POI wafers in volume for Qualcomm RF filters | T | R09 S11 |
| 2022-03-28 | Murata completes acquisition of Resonant (XBAR on thin LN) | F | R09 S46 |
| 2023-09 | Anpai completes an 8-inch TFLN line in Wuhan (reporter claim) | T | R09 S30 |
| 2024-05 | Nature paper on LT PICs for volume manufacturing (EPFL, SIMIT) | F | wang2024nat |
| 2024-09-20 | Lightium US$7 M seed reported | T | R09 S24 |
| 2024-09-24 | HyperLight US$37 M Series B | T | R09 S21 |
| 2024-11-13 | QCi announces first TFLN foundry order | T | R09 S26 |
| 2025-04-07 | AFR at OFC 2025: TFLN 130 GBd CDM in volume shipment; 400 G/lane chip | F / V | R09 S31 |
| 2025-05-13 | CCRAFT spun out of CSEM | T / V | R09 S14 |
| 2025-06-05 | AdvR joins Hawthorn Photonics (Covesion's group) | F | R09 S41 |
| 2025-06-09 | CHIPX reports first 6-inch TFLN wafer | T | R09 S29 |
| 2025-06-23 | ELENA: first Europe-made commercial LNOI (150 mm) | T | R09 S12 |
| 2025-06-25 | Soitec to supply 150 mm LNOI to CCRAFT | T | R09 S13 |
| 2025-07-22 | Q.ANT EUR 62 M Series A (trade-press date) | T | R09 S51 |
| 2025-07-30 | Xanadu + HyperLight: < 2 dB/m, about 20 mdB switch | T / V | R09 S53 |
| 2025-10-01 | AFR at ECOC 2025: 400 G/lane chip for 1.6T / 3.2T | F / V | R09 S32 |
| 2025-12-30 | TDG Holding filing: 2.10 M piezo + bonded wafers per year by 2029-12 | F (as reported in IR record) / V | R09 S5 |
| 2026-01-19 | Ligentec + X-FAB: 200 mm TFLN-on-SiN / SOI | F | R09 S28 |
| 2026-03-10 | Murata announces TFLN EO modulator (in development) for OFC 2026 | V | murata2026 |
| 2026-03-11 | HyperLight + UMC + Wavetek: volume foundry on 6" and 8" | T/C | R09 S19 |
| 2026-03-17 | HyperLight 1.6T-DR8 TFLN reference transceiver, 20 W | F / V | R09 S20 |
| 2026-06-03 | TDG Holding IR: expects LN modulators to be mainstream for 3.2T and above | F (statement) | R09 S5 |
| 2026-06-17 | Shanghai Securities News: Niobao Series C in progress; Nanzhi Xincai Pre-A; NanoLN preparing IPO | T | R09 S8 |
| 2026-06-18 | HyperLight US$80 M Series C led by MediaTek | F | R09 S18 |
| 2026-07-02 | CCRAFT funding round (QBIT Capital lead); target 2,000 wafers/month by 2030 | F / V | R09 S16 |

### L3

- Each event row stores the source URL and its access date; `C` events (HyperLight 2023 Tx PICs, QCi 2025 orders, Liobate Series A-II, PsiQuantum Omega, Q.ANT expansion, Genuine Optics ECOC 2026) are kept in the file with grade C and hidden by default.

---

## 8.9 Data provenance

### L3 (page copy)

- Industry facts: source URL, access date, grade on every row. Atlas facts: commit, fetch date, `device_id`, evidence file.
- Atlas sample: 233 papers, 519 rows (486 device, 33 design), commit `eb97f96` (2026-10-20). Market numbers: report teasers only (LG).

### Editorial note (not page copy): maintenance rule

- Re-verify every industry row after OFC (March) and ECOC (September) each year, and before any public release: open each URL, update `accessed`, re-grade, add new events with grades.
- Bump the atlas pin only by an explicit decision; re-run the acceptance counts in `chart-specs.md` and update every count in both chapter manuscripts in the same change.
- Never promote an LG or C number to a headline; never merge two publishers' market numbers into one figure.
