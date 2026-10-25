# 08 Industry: open questions

| Field | Value |
|---|---|
| As of | 2026-10-25 |
| Owner | C06 lane; (author) = Wentao's decision, (API) data lane, (audit) fresh-context check |

## Needs a decision

| # | Question | Why it matters | Proposed default |
|---|---|---|---|
| Q8.1 (author) | Data licenses for eo-modulator-atlas and photonics-atlas (no LICENSE files, R04 sec. 1.1). | Charts B1-B6 and the atlas endpoint republish facts and derived counts. | Facts with locators and attribution; no CSV redistribution until licensed |
| Q8.2 (author) | Show market numbers at all? (R09 sec. 8 item 1) | Every figure is a report teaser (LG). | Show range strips only, every bar LG, no headline, no average (F8.07) |
| Q8.3 (author) | Chinese company names alongside English names | R09 sec. 9: several English-Chinese mappings are uncertain (Niobao vs Liobate; Qinghe Jingyuan; Xili). | English names as the cited source writes them; add Chinese names only from the company's own page |
| Q8.4 (author) | Maintenance cadence | Rule in manuscript 8.9 editorial note: re-verify after OFC (March) and ECOC (September). | Adopt; next pass after OFC 2027 |

## Data lane (API)

| # | Item | Detail |
|---|---|---|
| Q8.5 | Industry datasets | `industry_events` (manuscript 8.8, 25 default rows + C rows hidden), `companies` (8.2 verified table), `market_ranges` (8.6), each row with `source_url`, `accessed`, `grade`. |
| Q8.6 | Nb metal density for F8.08 cube | Needs a sourced value (property dataset) before the cube ships; until then omitted. |
| Q8.7 | Atlas JSON path | Proposal in `chart-specs.md` sec. 1.1. |

## Graded C or LG: not shown by default, verify before promoting

| # | Item | Grade | Source (R09) | What would verify it |
|---|---|---|---|---|
| Q8.8 | Fujitsu Optical Components TF-LN driver-integrated coherent modulator FTM8300JN, 130 GBd | C | S34, S35 | Product page or datasheet (FOC site now redirects); R08 notes Furukawa FITEL Optical Components as ex-FOC with acquisition closed 2025-04-01, URL not recorded |
| Q8.9 | FOC "1 millionth coherent LN modulator" (year 2021 or 2024) | C | S34 | Press release text with date |
| Q8.10 | Genuine Optics 3.2T OSFP on TFLN, 450 Gb/s/lane (ECOC 2026) | C / V | S67 | Release page (EIN Presswire returned 403) |
| Q8.11 | HyperLight 2023-03-07 TFLN Tx PICs (200 G/lane IMDD, 1.6T coherent) | C | S22 | Business Wire page (403) or HyperLight newsroom |
| Q8.12 | UMC release 2026-03-12 (HyperLight / Wavetek) | C (shown as T/C) | S19 | UMC page (403) |
| Q8.13 | QCi foundry opening date (2025-05-12 per R08) and orders | C / T | S27, R08 sec. 6 | QCi press release URL |
| Q8.14 | Liobate Technologies funding; identity vs Jiangsu Niobao | C | S71 | Company registry or company page |
| Q8.15 | Partow Technologies wafers and bonding | C | S76 | Company product page |
| Q8.16 | EOSPACE DoD "thin-film niobate manufacturing" award | C | S39 | Federal contract record |
| Q8.17 | Thorlabs Ti:LN modulators to 40 GHz; HC Photonics PPLN; NTT Innovative Devices PPLN modules | C | S38, S42, S43 | Product pages |
| Q8.18 | CBMM share of ferroniobium market (about 77%) | C | S72 | CBMM filing |
| Q8.19 | Murata I.H.P. SAW thin LT on Si | C | S49 | Murata product page |
| Q8.20 | RF filter market US$7.3 B (2021) / 8.2 B (2025) | C | S78 | Yole page (403) |
| Q8.21 | TFLN wafer price peak CNY 28,000, supply gap about 40%, AFR margins and orders, TDG 12-inch wafer, TDG-Innolight 300k wafers/yr agreement | LG | S9 | Company filings |
| Q8.22 | Not verified at all: Yamaju Ceramics, CETC 26 LN/LT growth, Sumitomo Osaka Cement TFLN, Shin-Etsu bonded LT/LN, Skyworks-Qorvo merger, Lightium wafer size (200 mm is secondary), Coherent PPLN, Tower / GlobalFoundries TFLN | - | R09 sec. 9 | Primary pages |
| Q8.23 | CCRAFT round currency: US$7.8 M (Evertiq, CSEM) vs CHF 6.3 M (R08 trade press) | T / F | S15, S16; R08 sec. 6 | Read CSEM release figure and currency |

## Facts not available (N/A, shown as N/A)

- LT vs LN share of SAW filter volume: no public quantitative source (R09 sec. 1.7).
- LN/LT share of niobium and lithium end use: not broken out by USGS.
- TFLN modulator market share by company: not public.
- LightCounting or Yole TFLN market figures: none found publicly.

## Corrections found in inputs (for the audit log)

| # | Input | Correction |
|---|---|---|
| C8.1 | R09 S19 grade | R09 table 1.4 grades the HyperLight-UMC row T/C, the source register grades S19 C. Manuscript uses T/C with the reason printed. |
| C8.2 | R09 / R08 Q.ANT date | R09 dates the Series A 2025-07-22 (Evertiq article date); R08 gives the release date 2025-07-17. Manuscript lists 2025-07-22 with "trade-press date". |
