# R04: LN/TFLN industry and technology trends from the author's atlases

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R04 (DevLog-000) |
| Sources | `eo-modulator-atlas` (primary, commit `eb97f96`, 2026-10-20), `photonics-atlas` (commit `26aa340`, 2026-10-23), `advanced-packaging-atlas`, `PlayGround/20260320_OFC` (OFC 2026 metadata + extracted text), `PlayGround/20261001_eo_modulator_atlas` (origin snapshot) |
| Method | Read-only. Counts and statistics computed by a throwaway pandas script over the CSVs (not stored in any repo). Every number below is a count or statistic over atlas rows; device IDs cited so values can be re-checked in `data/devices.csv` and `data/evidence/<paper_id>.yaml`. |
| Status | Facts (sections 1-4) separated from interpretation (marked "Interpretation"). |

Abbreviations: TFLN thin-film lithium niobate; TFLT thin-film lithium tantalate; LNOI/LTOI LN/LT on insulator; SiPh silicon photonics (carrier-depletion); BTO barium titanate; SOH/POH silicon-organic / plasmonic-organic hybrid; MZM Mach-Zehnder modulator; IQ in-phase/quadrature; IM/DD intensity modulation / direct detection; PAM4/6/8 pulse-amplitude modulation with 4/6/8 levels; GBd gigabaud; CPO co-packaged optics; NPO near-packaged optics; LPO linear pluggable optics; TOSA transmitter optical sub-assembly; DAC digital-to-analog converter; PDK process design kit; MPW multi-project wafer; EIC electronic IC; FEC forward error correction.

---

## 1. The atlases

### 1.1 Summary

| Repo | Public URL (GitHub) | Live site (GitHub homepage field) | Visibility | Licence (GitHub `licenseInfo`) | Disk usage | Releases/tags |
|---|---|---|---|---|---|---|
| eo-modulator-atlas | github.com/jwt625/eo-modulator-atlas | outside5sigma.com/eo-modulator-atlas/ | public | none (no LICENSE file) | 864,499 KB (tracks most reference PDFs) | none |
| photonics-atlas | github.com/jwt625/photonics-atlas | outside5sigma.com/photonics-atlas/ | public | none (no LICENSE file); README "Rights": facts with locators, ROR data CC0 | 6,943 KB | not checked (no need) |
| advanced-packaging-atlas | github.com/jwt625/advanced-packaging-atlas | o5s.org/advanced-packaging-atlas (README: outside5sigma.com/advanced-packaging-atlas/) | public | GPL-3.0 | 36,046 KB | not checked |
| PlayGround (folder `20260320_OFC`, `20261001_eo_modulator_atlas`) | github.com/jwt625/PlayGround | - | public | none | - | - |

All three atlases deploy to GitHub Pages via `.github/workflows/deploy.yml` (eo-modulator-atlas uses `BASE_PATH: /eo-modulator-atlas`). Local `main` = `origin/main` for eo-modulator-atlas (0 ahead / 0 behind); `data/devices.csv` on GitHub has the same size (772,730 bytes) as the local file.

### 1.2 eo-modulator-atlas (primary)

Scope (DevLog-000 decision 2): Pockels/EO-effect devices core (TFLN, TFLT, BTO, SOH, polymer, plasmonic, hybrid Si/SiN-LN/LT, InP, AlGaAs); carrier-depletion Si, EAMs (electro-absorption modulators), rings tracked as rows.

| Table (`data/`) | Rows | Key |
|---|---|---|
| `papers.csv` | 233 (years 2012-2026, all `audit_status: audited`) | `paper_id` |
| `devices.csv` | 519 (486 `row_kind=device`, 33 `design`) | `device_id`, FK `paper_id` |
| `organizations.csv` | 284 (125 university, 68 company, 40 research_institute, 30 facility, 9 foundry, 7 national_lab, 3 other, 2 consortium) | `org_name` |
| `candidates.csv` | 461 (228 not yet integrated; of those 54 `lithium_niobate`, 4 `lithium_tantalate` by `platform_guess`) | `paper_id` |
| `author_affiliations.csv` | 2,880 | (paper, author index) |
| `org_sites.csv` | 310 | `org_name` |
| `people.csv` / `paper_authors.csv` | 1,509 / 2,298 | `person_id` |
| `evidence/<paper_id>.yaml` | 224 tracked files | per value: `device_id, field, value, unit, basis, locator, note` |
| `schema/devices.schema.yaml` | binding conventions (a)-(gg), enums, units in column names | - |

`devices.csv` has 84 columns in groups: identity (`device_class, eo_material, eo_effect, waveguide_platform, integration, electrode_type, drive, vpi_convention, band ...`), operating point (`wavelength_nm, length_mm, temperature_k`), drive efficiency (`vpi_dc_v, vpi_rf_v, vpil_dc_vcm, vpil_rf_vcm, vpi_mzm_pushpull_dc_v, r_eff_pm_per_v ...`), bandwidth (`bw3db_ghz, bw3db_reference, bw_method, bw_measured_to_ghz, eo_rolloff_db ...`), optical loss (`il_onchip_db, il_onchip_scope, il_fiber_to_fiber_db, prop_loss_db_per_cm, extinction_ratio_db ...`), RF (`rf_loss_db_per_cm, z0_ohm, n_rf, ng_opt`), geometry (`eo_film_thickness_nm, etch_depth_nm, rib_width_nm, slab_thickness_nm, electrode_gap_um, crystal_cut, substrate ...`), system demo (`max_baud_gbd, modulation_format, max_line_rate_gbps, max_net_rate_gbps, energy_per_bit_fj ...`), bookkeeping (`qualifiers, evidence_ref, notes`).

Conventions that matter for any chart on the LN site:
- Empty cell = not reported. Bounds ("over 67 GHz") are stored as the number plus a `qualifiers` entry (`bw3db_ghz:gt`); a chart must draw these as bounds, not points.
- Vpi conventions are never converted in the CSV (`vpi_convention`: `per_arm_phase_shifter`, `mzm_push_pull`, `mzm_differential`, ...). Vpi measured below 1 GHz goes to `vpi_dc_v`, at/above 1 GHz to `vpi_rf_v`.
- Derived quantities live only in the generated view `app/static/data/atlas.json` (4.37 MB, tracked, generated 2026-10-16): `vpil_dc_vcm_derived = vpi_dc_v * length_mm / 10`, `vpil_best` (reported DC, else derived DC, else reported RF), `il_rf_total_db`, `vpi_il_vdb`, `completeness` (core fields / 7), `fom = f3dB / (Vpi_eff * 10^(IL/10))`.
- Source rights: 66 papers `open_license_ok`, 167 `restricted_local_only` (licences: 70 publisher-copyright, 65 CC-BY-4.0, 53 arXiv-nonexclusive, 21 CC-BY-NC-ND, 7 Optica OA, 4 CC-BY-NC-SA). Only facts + locators are public for restricted sources; OFC 2026 PDFs are local-only.
- Provenance tokens (`discovered_via`, multi-valued): web_search 96, author_group_followup 88, local_corpus 81, ofc2026 54, landmark 43, drive_doc 10, blog posts 11.

Existing app panels (`/explore` a-l) already include Vpi*L vs bandwidth with nominal frontiers, loss vs Vpi*L, Vpi*IL by material, bandwidth/baud/line rate vs year, bandwidth vs length, papers per year by material, organizations/countries, disclosure completeness, geography map and PI lineage. `/sim?id=chen2022-c` runs a browser cross-section solver (all 40 sim configs `unvalidated` as of 2026-10-07).

Origin: `PlayGround/20261001_eo_modulator_atlas` is the 2026-10-01 snapshot (15 papers, 28 device rows, 27 orgs, 198 candidates); the standalone repo supersedes it.

### 1.3 photonics-atlas

Registry + three atlases (README counts on 2026-10-23): 807 components (91 classes, 30 platforms) with 3,575 metric values; 1,069 organizations; 852 products; 1,996 stated product/vendor uses; 39 foundry processes; 24 standards; 401 reliability tests; 1,947 source documents. It reads eo-modulator-atlas and advanced-packaging-atlas through read-only adapters (`config/inputs.yaml`), the same pattern recommended for lithium-niobate.com.

| Table (`data/`) | Rows | LN/LT-relevant content |
|---|---|---|
| `components/components.csv` | 807 | 180 rows on LN/LT platforms (`lnoi_rib` 79, `ltoi_rib` 38, `lnoi_loaded_sin` 14, `lnoi_loaded_si` 9, `lnoi_strip` 8, `lnos_rib` 5, `ltoi_loaded_sin` 3, ...). Top classes: edge couplers 34, rings 24, grating couplers 19, transitions 19, straight waveguides 13, MMIs 13, thermo-optic phase shifters 10 |
| `components/component_metrics.csv` | 3,575 (long format) | see 2.6 |
| `supply/product_usage.csv` | 1,996 | category A2.1 "LNOI": Jinan Jingzheng Electronics (NanoLN) 44 uses in 44 sources; A2.2 "LTOI": Jinan Jingzheng 9, Shanghai Novel Si Integration Technology 3, SIMIT 2; A2.3 "LN-on-sapphire": NGK Insulators 1; B3 "TFLN/TFLT foundry and PDK": Luxtelligence 2, CSEM 1, HyperLight 1; C7 "commercial discrete EO modulators used as references (bulk LN)": Fujitsu 6, Thorlabs 2, HyperLight 2, Liobate 1, NeoPhotonics 1 |
| `supply/products.csv` | 852 | C7 models: Fujitsu FTM7937, FTM7937EZ, FTM7938EZ, FTM7977HQA; Thorlabs LN65S-FC, LNA6112 (all `status: unknown`). No TFLN product model numbers are recorded |
| `supply/foundry_processes.csv` | 39 | TFLN: "Luxtelligence lnoi400 open-source PDK" (source eo:kari2025); "CSEM TFLN multi-project fabrication run" (MPW, eo:larocque2024); Luxtelligence DUV + Ar ion-beam etch of 150 nm x-cut strips (eo:liu2026d); imec 200 mm Si/SiN target wafers for micro-transfer-printed TFLN coupons (eo:zheng2026) |
| `supply/product_specs.csv` | 0 | datasheet specs not started |
| `people/*` | 7,583 people, 12,941 affiliation observations | not used here (personal data; out of scope for the LN site) |

Data quirk to flag upstream: C7 modulator rows carry `role = laser_source` in `product_usage.csv`.

### 1.4 advanced-packaging-atlas

296 papers, 952 test vehicles, 7,521 metrics (2.5D/3D/hybrid bonding/glass/CPO packaging). LN content is negligible: 1 component row mentions "LNOI" as an optional, undemonstrated block (ectc51909.2023.00108); `outputs/candidates.csv` has 9 LN-related titles that were screened but not extracted, e.g. ECTC 2026 "Thin-Film Lithium Niobate Hybrid Integration for Co-packaged Optics" (UC Davis; triage rationale: TFLN MZM flip-chip bonded to a commercial driver, VpiL 2.3 V cm, >45 GHz EO bandwidth), ICEP 2025 Si-LiNbO3 bonding via perhydropolysilazane (Tohoku), IEDM 2025 micro-transfer-printed LN-on-Si ring (NUS), IEDM 2022/2023/2024 TFLN/LNOI acoustic and SAW filter papers. Use: at most a "packaging" pointer; not a data source.

### 1.5 OFC 2026 corpus (`PlayGround/20260320_OFC`)

`output/full_metadata/ofc_full_metadata.csv`: 830 presentation records (+ sessions, short courses, special sessions); 677 papers with extracted text in `extracted_text/`. Titles/affiliations/abstracts are public program data; the PDFs/text are not redistributable (facts only). 56 OFC-venue papers are integrated into eo-modulator-atlas.

### 1.6 How lithium-niobate.com can consume the data without forking

| Option | How | Pros | Cons |
|---|---|---|---|
| A. Build-time fetch, pinned SHA (recommended) | A build script fetches `https://raw.githubusercontent.com/jwt625/eo-modulator-atlas/<sha>/data/{devices,papers,organizations}.csv` and `data/schema/devices.schema.yaml` (or the generated `app/static/data/atlas.json`), filters to LN/LT rows, writes a small JSON into the LN site's build output. SHA + fetch date recorded in the page footer and in a `data-sources.json` | No copy of canonical tables in the LN repo; reproducible; tiny | Needs network at build; derived fields must be recomputed or taken from `atlas.json` |
| B. git submodule (sparse) | Submodule pinned at SHA, sparse-checkout `data/` only | Offline builds | eo-modulator-atlas is 864 MB (tracked PDFs); submodule friction; CI clone cost |
| C. Release artifacts | Add a release workflow upstream publishing `atlas-data-<date>.zip` (CSV + schema + atlas.json + checksum) | Versioned, citable (Zenodo DOI possible) | No releases or tags exist today (2026-10-24); needs an upstream change |
| D. Deep links | Link from LN pages to `/table`, `/explore`, `/sim?id=<paper_id>-<label>` on the atlas site | Zero duplication; atlas stays the place for filtering | Not embedded; depends on atlas URL stability |

Rules for any option: never write back; keep `qualifiers`, `vpi_convention`, `basis`, `evidence_ref` with every plotted value; show "as of <SHA, date>"; recompute nothing that the atlas does not define, or label it derived with formula. Licensing: eo-modulator-atlas and photonics-atlas have no licence file, so third parties have no explicit reuse right; an explicit data licence upstream (author decision) is a prerequisite for advertising the LN site's data endpoints as reusable.

---

## 2. Quantitative trends (eo-modulator-atlas)

### 2.0 Platform mapping used here

`platform` derived from `eo_material` (+ tags): TFLN = `lithium_niobate` except rows tagged `titanium_indiffused` (bulk Ti:LN, only thiele2022, 6 rows); TFLT = `lithium_tantalate`; SiPh = `silicon_plasma_dispersion`; GeSi EAM separate; InP = `inp_mqw`; BTO = `barium_titanate`; Polymer = `eo_polymer` (includes SOH on `soi_slot`, 49 rows, and plasmonic `plasmonic_mim`, 4); Graphene/2D; AlGaAs; Other (PZT, PLZT, STO, ferroelectric nematic LC, TCO, other). A paper counts once per platform it has rows for. 18 papers have no device rows (papers-only rule).

### 2.1 Coverage by platform (all rows)

| Platform | Rows | Device rows | Papers |
|---|---|---|---|
| TFLN | 219 | 209 | 83 |
| SiPh | 62 | 58 | 31 |
| TFLT | 44 | 44 | 22 |
| Polymer (incl. SOH/POH) | 61 | 55 | 20 |
| BTO | 28 | 28 | 15 |
| InP | 30 | 29 | 14 |
| Other | 23 | 18 | 13 |
| Graphene/2D | 35 | 28 | 12 |
| GeSi EAM | 7 | 7 | 3 |
| AlGaAs | 4 | 4 | 1 |
| Bulk Ti:LN | 6 | 6 | 1 |

TFLN breakdown: `waveguide_platform` lnoi_rib 133, lnoi_loaded_sin 29, unspecified 18, lnoi_loaded_si 14, suspended_lnoi 11, lnos_rib (LN on sapphire) 9, lnoi_loaded_oxide 4; `integration` monolithic 158, bonded_heterogeneous 26, foundry_native 15, micro_transfer_printed 14. Device class: MZM 199, resonator 22, ring 20, IQ MZM 11, phase shifter 9. Crystal cut: x-cut 163, not stated 46 (no z-cut rows). Film thickness (167 rows stated): median 400 nm, range 150-1500 nm; most common 300 nm (48), 600 nm (32), 500 nm (21), 400 nm (19). Electrodes: tw_gsg 72, cl_twe (capacitively loaded) 32, lumped 26, tw_cpw 20, slow_wave 15, tw_gssg 8. Bands (TFLN rows): C 81, unstated 46, visible 19, L 18, O 14, NIR below O 10, mid-IR 9.

### 2.2 Papers per year by platform (distinct papers with rows; `papers.year`)

| Platform | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| TFLN | 1 | 2 | 0 | 4 | 6 | 17 | 13 | 9 | 9 | 22 |
| TFLT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 4 | 14 |
| SiPh | 0 | 0 | 0 | 0 | 2 | 1 | 5 | 2 | 4 | 16 |
| InP | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 9 |
| BTO | 0 | 0 | 0 | 1 | 0 | 0 | 3 | 0 | 4 | 7 |
| Polymer | 1 | 0 | 2 | 3 | 0 | 1 | 2 | 0 | 5 | 6 |
| Graphene/2D | 0 | 0 | 1 | 3 | 1 | 1 | 1 | 0 | 1 | 4 |

All papers per year: 2012 1, 2016 1, 2017 2, 2018 2, 2019 4, 2020 12, 2021 10, 2022 21, 2023 26, 2024 22, 2025 37, 2026 95.

Caveat (fact): this is a curated sample, not a census. 2026 is inflated by the OFC 2026 ingestion (54 papers carry `ofc2026` in `discovered_via`; 15 of the TFLN/TFLT papers are OFC 2026). Pre-2020 coverage is landmark-driven. Per-year counts show what the atlas holds, not field output.

### 2.3 Platform comparison: telecom-band (O/C/L/CL) MZM + IQ MZM device rows, all years

Vpi*L statistics use only `vpi_convention = mzm_push_pull` rows (reported `vpil_dc_vcm`, else `vpi_dc_v * length_mm / 10`, else `vpil_rf_vcm`). Vpi = `vpi_dc_v`, any convention. BW = `bw3db_ghz`; "gt share" = fraction of BW values that are lower bounds.

| Platform | Papers / rows | Vpi*L n / median / min (V cm) | Vpi median (V) | BW n / median / max (GHz) | BW gt share | Max baud (GBd) | Max line rate (Gb/s) | Median length (mm) | On-chip IL n / median (dB) |
|---|---|---|---|---|---|---|---|---|---|
| TFLN | 46 / 88 | 66 / 2.44 / 0.21 | 3.40 | 67 / 70 / 170 | 0.42 | 225 | 420 | 6.4 | 25 / 1.80 |
| TFLT | 15 / 21 | 17 / 2.43 / 1.36 | 4.76 | 10 / 85 / 110 | 0.40 | 226 | 768 | 7.5 | 5 / 1.75 |
| SiPh | 14 / 25 | 0 push-pull rows | 8.10 | 21 / 66 / 110 | 0.29 | 192 | 400 | 0.9 | 11 / 3.10 |
| InP | 6 / 12 | 3 / 0.70 / 0.60 | 1.60 | 9 / 67 / 100 | 0.44 | 180 | 360 | 4.0 | 4 / 3.75 |
| BTO | 7 / 9 | 2 / 0.72 / 0.72 | 3.60 | 5 / 70 / 110 | 0.20 | 256 | 448 | 1.38 | 4 / 2.50 |
| Polymer (SOH/POH) | 12 / 36 | 9 / 0.09 / 0.04 | 1.57 | 8 / 80.3 / 110 | 0.12 | 204 | 528 | 0.28 | 21 / 0.64 |

Wider slice (all bands, all Vpi conventions, MZM/IQ/phase-shifter device rows): Vpi*L median TFLN 2.30 (n=133), TFLT 2.43 (29), SiPh 1.13 (15), InP 0.61 (16), BTO 0.70 (13), Polymer 0.09 (17). Propagation loss (`prop_loss_db_per_cm`) median TFLN 0.98 dB/cm (n=34, min 0.02 as an upper bound, arabjuneghani2022-b), TFLT 1.35 (4), SiPh 42 (4), Polymer 38.2 (6), BTO 2525 (6, plasmonic-dominated). Bulk Ti:LN (thiele2022) has propagation loss 0.15 dB/cm and no telecom MZM rows; bulk LN appears in the atlases mainly as commercial reference modulators (1.3).

Facts to keep with this table: line rates mix IM/DD and coherent; "max" values are single demonstrations; the BW gt share means a large fraction of TFLN/TFLT bandwidths are instrument-limited (most frequent bound values: 110 GHz 15, 67 GHz 13, 50 GHz 12 rows of 67 bounded TFLN/TFLT values).

### 2.4 TFLN over time: telecom-band MZM/IQ device rows

| Year | Papers / rows | Vpi*L push-pull n / median / min | Vpi median | BW n / median / max (gt share) | Max baud | Max line rate | Median length (mm) | IL n / median |
|---|---|---|---|---|---|---|---|---|
| 2018 | 2 / 3 | 3 / 2.50 / 2.20 | 6.25 | 3 / 70 / 106 (1.00) | 100 | 112 | 5.0 | 2 / 5.05 |
| 2020 | 3 / 5 | 4 / 2.55 / 2.30 | 2.50 | 3 / 48 / 67 (0.33) | 110 | 320 | 10.0 | 3 / 1.45 |
| 2021 | 2 / 2 | 2 / 2.04 / 1.70 | 4.07 | 2 / 88.5 / 110 (1.00) | 100 | 250 | 5.0 | 0 |
| 2022 | 9 / 18 | 15 / 2.60 / 1.90 | 3.16 | 17 / 79 / 170 (0.18) | 100 | 240 | 6.0 | 8 / 1.95 |
| 2023 | 6 / 10 | 4 / 1.82 / 1.02 | 2.78 | 8 / 65.3 / 110 (0.50) | 112 | 224 | 4.5 | 2 / 1.90 |
| 2024 | 7 / 17 | 15 / 1.23 / 0.21 | 3.20 | 9 / 110 / 145 (0.89) | 180 | 390 | 4.0 | 2 / 12.70 |
| 2025 | 4 / 7 | 7 / 2.92 / 2.67 | 4.40 | 7 / 100 / 111 (0.57) | 128 | 50 | 6.4 | 3 / 0.97 |
| 2026 | 13 / 26 | 16 / 2.54 / 1.25 | 3.50 | 18 / 53.5 / 110 (0.17) | 225 | 420 | 7.0 | 5 / 1.20 |

Per-year TFLN rate records (all bands, device rows): 2017 40 Gb/s NRZ ring (wang2018-rt-eye); 2018 100 GBd OOK / 112 Gb/s PAM4 (he2019-a); 2020 110 GBd QPSK, 320 Gb/s IQ (xu2020-a); 2022 1.96 Tb/s net DP-PCS-400QAM at 130 GBd (xu2022-a, coherent); 2023 112 GBd O-band (meng2023-a); 2024 180 GBd NRZ (shen2025-sys), 390 Gb/s (liu2025-a); 2025 220 GBd (chen2025-a, L-band resonator); 2026 225 GBd PAM4 optical DAC (starnault2026-a), 420 Gb/s PAM4 TOSA at 210 GBd (yu2026-a), 1.2 Tb/s net DP-16QAM (starnault2026-b, polarization emulated). TFLT: 2024 208 GBd / 528 Gb/s (wang2024a-a), 2025 704 Gb/s IQ (cai2025-b), 2026 226 GBd / 768 Gb/s line, 536 Gb/s net (xu2026b-a).

Interpretation:
- Median telecom TFLN Vpi*L has stayed at about 2-3 V cm push-pull for 2018-2026 in this sample; the gains are in bandwidth (bounded at 110 GHz in most recent rows) and symbol rate (100 GBd in 2018 to 225 GBd in 2026), not in median efficiency. The 2024 low (0.21 V cm) is one 1 mm slow-light device.
- TFLT reached TFLN-level Vpi*L (median 2.43 V cm) within its first three years in the atlas and holds the highest line rate (768 Gb/s). TFLT papers grew 4, 4, 14 (2024-2026).
- Footprint is the structural TFLN weakness against SiPh/BTO/polymer: median electrode length 6.4 mm vs 0.9 (SiPh), 1.38 (BTO), 0.28 (polymer).

### 2.5 Integration, band and wafer trends (TFLN + TFLT papers)

| Year | Papers | Non-monolithic (bonded / transfer-printed / foundry) | Heterogeneous (bonded, MTP, or LN-on-Si-loaded) | Foundry-native | O-band | Visible/UV/NIR<O | Mid-IR/NIR>U |
|---|---|---|---|---|---|---|---|
| 2017 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2018 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| 2020 | 4 | 1 | 1 | 0 | 0 | 0 | 0 |
| 2021 | 6 | 1 | 1 | 0 | 0 | 0 | 1 |
| 2022 | 17 | 4 | 7 | 0 | 1 | 4 | 0 |
| 2023 | 13 | 2 | 3 | 0 | 1 | 1 | 0 |
| 2024 | 13 | 1 | 2 | 0 | 2 | 2 | 0 |
| 2025 | 13 | 7 | 6 | 1 | 1 | 1 | 0 |
| 2026 | 36 | 8 | 5 | 3 | 10 | 6 | 3 |

- Wafer supply: 56 of 105 TFLN/TFLT papers state a wafer supplier; 50 of those name NanoLN / Jinan Jingzheng (TFLN 41/43, TFLT 9/13). Others: NGK (LN-on-sapphire), Shanghai Novel Si Integration Technology and SIMIT (LTOI), author-made LTOI. photonics-atlas agrees: 44 LNOI usage records, all Jinan Jingzheng.
- Fabrication: university cleanrooms dominate `foundry_or_fab` (e.g. Center for Nanoscale Systems 6, Center of MicroNanoTechnology 7, EPFL Institute of Physics cleanroom 5); commercial/foundry entries: Sandia (4), Luxtelligence (2), imec (2), LIGENTEC (2), CUMEC (Chongqing United Microelectronics Center, 2), CSEM (1), Liobate (1).
- Disclosure (TFLN device rows, n=209): Vpi*L 64 %, 3 dB BW 60 %, extinction ratio 37 %, on-chip IL 25 %, baud 24 %, ng 21 %, propagation loss 17 %, fiber-to-fiber IL 16 %, RF loss 11 %, Z0 10 %, n_RF 10 %, energy/bit 10 %.

Interpretation: 2026 shows the shift from university monolithic demos to O-band, foundry/200 mm, and heterogeneous (SiN/Si host) work, matching the OFC 2026 signals in section 3. The single-supplier wafer dependence is a strong, data-backed industry fact.

### 2.6 Passive LN/LT components (photonics-atlas, measured values)

| Metric | LN n / min / median / max | Comparison |
|---|---|---|
| Propagation loss (dB/cm) | 14 / 0.17 / 1.70 / 11.4 | Si 25 / 0.10 / 0.70; SiN 19 / 0.20 / 0.50; LT 3 / 1.5 / 2.0 |
| Intrinsic Q | 9 / 2.0e4 / 1.65e6 / 4.5e6 | SiN 8 / median 1.68e7; LT 1 / 4.04e6 |
| Loaded Q | 26 / 2.0e4 / 7.85e5 / 3.97e6 | Si 15 / median 6.6e3 |
| Insertion loss (component, dB) | 12 / 0.3 / 3.9 / 19.0 | Si 91 / median 3.27 |

(Component values come from a small, mixed sample; record-low LN waveguide losses from the literature are not necessarily in it.)

### 2.7 Organizations (TFLN/TFLT papers, counted by paper)

| Rank | Universities (TFLN+TFLT) | Papers | Non-university orgs (`companies` column; includes institutes) | Papers |
|---|---|---|---|---|
| 1 | Zhejiang University | 13 | imec | 7 |
| 2 | EPFL | 11 | Nokia Bell Labs | 6 |
| 3 | South China Normal University | 9 | HyperLight | 4 |
| 4 | Harvard University | 8 | Shanghai Institute of Microsystem and Information Technology | 4 |
| 5 | Karlsruhe Institute of Technology | 7 | Agency for Science, Technology and Research (A*STAR) | 4 |
| 6 | Ghent University | 7 | Huawei Technologies | 3 |
| 7 | UC San Diego | 6 | Sandia National Laboratories | 3 |
| 8 | City University of Hong Kong | 5 | Hefei Laboratory | 3 |
| 9 | Sun Yat-sen University | 5 | Shanghai Research Center for Quantum Sciences | 3 |
| 10 | Huazhong University of Science and Technology; East China Normal University; Shanghai Jiao Tong University | 4 each | LIGENTEC; CUMEC; Wuhan ANPI Optoelectronics; Phase Sensitive Innovations; NSTIC (National Semiconductor Translation and Innovation Centre) | 2 each |

TFLT alone is concentrated: EPFL 9, KIT 7 of 22 papers; companies SIMIT 4, Nokia Bell Labs 4. Countries (TFLN+TFLT papers, affiliation countries): CN 46, US 37, CH 16, DE 10, BE 7, HK 6, SG 5, CA 3, JP 3. Companies named on TFLN rows also include Ligent Technologies, Wuhan HGGenuine Optics, Nexus Photonics, Keysight, Sumitomo Osaka Cement, Ciena, NTT Research, IBM Research Zurich, Pixel Photonics, Flux Photonics, Cetus Photonics.

### 2.8 Commercial products and services in the atlases

| Kind | Entries (source) |
|---|---|
| Bulk LN reference modulators (used in papers' setups) | Fujitsu FTM7937, FTM7937EZ, FTM7938EZ, FTM7977HQA; Thorlabs LN65S-FC, LNA6112; NeoPhotonics DP-IQ modulator (photonics-atlas C7) |
| Commercial TFLN modulators used as test equipment | HyperLight packaged 110 GHz TFLN MZM (OFC Th2A.15, Th2A.46); Liobate high-bandwidth TFLN chips (OFC Th1C.2, Th1C.3) |
| TFLN/TFLT foundry, PDK, MPW | Luxtelligence lnoi400 open-source PDK; CSEM TFLN MPW; HyperLight (B3 usage, source lit:starnault2026: "TFLN circulator PICs designed and manufactured in a commercial TFLN foundry process"); Liobate fab (zhou2026); LIGENTEC (LT-on-SiN, valdez2026); imec 200 mm targets for transfer-printed TFLN |
| Wafers | NanoLN / Jinan Jingzheng (LNOI, LTOI); NGK (LN on sapphire); Shanghai Novel Si Integration Technology, SIMIT (LTOI) |
| TFLN product-like demos | 420 Gb/s O-band TFLN TOSA (Wuhan HGGenuine, yu2026); TFLN 400G/lane for LPO/NPO/CPO (Ligent, zhou2026); TFLN wafer-level CPO engine with driver EIC (SJTU + Wuhan ANPI, huang2026) |

No TFLN product datasheet specs are in any atlas (`product_specs.csv` is empty). Product-level claims for the LN site need a separate public-source pass (R09).

---

## 3. OFC 2026 TFLN/TFLT signals

Corpus facts: of 677 extracted OFC 2026 papers, 56 mention TFLN/LNOI, 83 mention LN in any form, 7 mention LT/TFLT/LTOI, 10 mention PPLN. 4 of 24 postdeadline papers are LN/LT-platform devices. Session W1A is titled "Thin-Film LN/LT and Silicon Mach-Zehnder Modulators" (6 of its 7 papers are LN/LT). Claims below are the authors' abstract claims; atlas row values (where integrated) are given when they differ.

### 3.1 LN/LT is the device platform

| Code | Title (short) | Affiliations | Key claim (abstract) | Atlas row |
|---|---|---|---|---|
| Th4A.2 (postdeadline) | C-band 110 GHz TFLT modulator, 768 (536) Gb/s | University of Michigan; Nokia Bell Labs | Vpi 1.35 V, >110 GHz, record 768 Gb/s line on TFLT | xu2026b-a: 18 mm, 226 GBd |
| Th4A.5 (postdeadline) | Integrated 1064 nm transmitter, GaAs lasers + >100 GHz TFLN | Nexus Photonics; Northeastern University; Keysight | First fully integrated GaAs-on-TFLN 1064 nm transmitter; 100 Gb/s NRZ, 160 Gb/s PAM4 | shen2026-a: Vpi 3.1 V, 1.8 V cm, BW >100 GHz |
| Th4A.6 (postdeadline) | TFLN wafer-level CPO engine | Shanghai Jiao Tong University | TFLN EOM + driver EIC heterogeneously integrated, >100 GHz | huang2026-a/b (Wuhan ANPI co-affiliation) |
| Th4B.2 (postdeadline) | Driver-less 448 Gb/s PAM4 and 1.2 Tb/s 16QAM, TFLN optical DACs | McGill University; HyperLight; Ciena | Driven directly from CMOS logic gates; 448 Gb/s PAM4 at 2 km, 1.2 Tb/s 16QAM at 10 km | starnault2026-a/b: 225 GBd PAM4, net 421 Gb/s |
| W4J.4 | 420 Gb/s/lane O-band PAM4 TOSA on TFLN | Wuhan HG Genuine Optics | 210 GBd co-designed TFLN + driver TOSA | yu2026-a: Vpi < 2 V design value |
| Th1C.3 | 400G/lane for linear-drive optics | Ligent Technologies | TFLN MZM + enhanced CTLE (continuous-time linear equalizer); feasibility for NPO/CPO | zhou2026-a: Vpi < 2.7 V, BW > 67 GHz, 182.5 GBd; fab Liobate |
| M4D.4 | Truly differential drive of TFLN TWE-MZM by linear SiGe driver | Nokia Bell Labs | VpiL 1.1 V cm (differential reference), 140 GBd PAM8, 1.4 pJ/bit | aimone2026-a: authors' 1.1 not reproducible from 3.26 V x 7.5 mm, view derives 2.45 V cm |
| W1A.3 | TFLN on 200 mm Si, 110 GHz, 1.9 V cm | NSTIC (Singapore) | BEOL CMOS foundry; O-band loss < 0.5 dB/cm | zhang2026b: 0.37 dB/cm, best wafer-map 1.87 V cm, chip BW 93-110 GHz |
| Th1D.1 | TFLN + hydrogen-free SiN on 200 mm SiPh | IME; NSTIC; NUS | Die-to-wafer bonding; MZI 2.9 V cm | tobing2026-a: BW about 20 GHz |
| W1A.1 | Integrated EO frequency-domain equalizer | NICT; Sumitomo Osaka Cement; Nagoya Inst. Tech.; Waseda | Review of TFLN TW modulators with integrated equalizer | yamaguchi2026: results from prior paper |
| Th1H.4 | Hybrid calcium titanate + TFLN modulator | Chongqing University | 1.3 V cm, >110 GHz, 0.86 dB IL | su2026-a: 1 mm |
| Tu3C.6 | TFLN filters and modulators (invited-style review) | Zhejiang University | Gratings, Fabry-Perot cavities, compact footprints | - |
| W1A.4 | Sub-V 110 GHz O-band TFLT MZM | University of Michigan | Vpi 1 V (10 Hz-10 kHz), >110 GHz via local Si substrate removal | xu2026a-a: 1.089 V, 15 mm |
| W1A.5 | LT-on-fused-silica MZM, 4-inch wafer | EPFL; KIT | 67 GHz, 1.6 V, 437 Gb/s net PAM8 | li2026a-a |
| W1A.6 | Ring-assisted MZM on LT-on-SiN | LIGENTEC; UC San Diego | 1.36 V cm, 1.75 dB IL, >50 GHz, wafer-scale | valdez2026-a |
| W1A.7 | 1.6 Tb/s WDM IM/DD transmitter on TFLT | EPFL; KIT; SIMIT | Monolithic TFLT transmitter, aggregate 1.6 Tb/s net (PAM4/PAM8) | hulyal2026-a: 8 channels, 100 GBd |
| Th1F.1 | DUV-to-MIR supercontinuum, chirped-poled LT waveguides | Zhejiang University | < 270 nm to > 2400 nm from a 1550 nm fs source | - (not an EO modulator) |
| W4K.4 (withdrawn) | Packaged TFLN quantum receiver, time-bin QKD | Univ. Pavia; Univ. Padova; Advanced Fiber Resources Milan | Packaged TFLN PIC receiver | - |

### 3.2 LN as enabler or reference (not the subject)

- PPLN parametric devices: M1C.1 (NTT, PPLN OPA band conversion to 1702 nm), W3F.3 (NTT, PPLN phase-sensitive amplifier, 14 dB crosstalk suppression), M1G.4 (USC et al., PPLN wave mixing for optical full adder), M4C.1 (Chalmers tutorial: PPLN as chi(2) OPA platform), plus quantum/network papers M1K.6, Tu2K.2, Tu2K.3, Th3A.7, W1H.5, M4D.3 that mention PPLN.
- Transfer printing: M4D.6 (Ghent) names LN integration on Si as a production-ready target.
- Commercial TFLN as lab equipment: HyperLight packaged 110 GHz TFLN MZM (Th2A.15 McGill/Marvell; Th2A.46 McGill et al.); Liobate TFLN chips (Th1C.2 Linktel 400G/lane test). Tu3B.2 (Nokia Bell Labs; UCL) uses a TFLN MZM for D-band comb downconversion (bandwidth figure garbled in the extracted text; verify before quoting).
- Competitor framing: Th4B.3 (McGill/Ciena/Lumiphase BTO net 1.6T) cites TFLN's first net 400G PAM4; W1D.7, Th1C.1, M2B.6 (Coherent), M2B.5 (ETH), W3E.6 (Fraunhofer HHI), Th3J.5 (KIT) all cite TFLN as the bandwidth reference that SiPh, InP, BTO, plasmonic or SOH must match.

### 3.3 Themes (interpretation)

1. 400G/lane IM/DD is the commercial target: TFLN (W4J.4, Th1C.3, Th4B.2) and TFLT (Th4A.2, W1A.5, W1A.7) compete with BTO (Th4B.3), SiPh (Th4A.4 Coherent), InP (W3E.6), SOH/plasmonic.
2. TFLT emerges as LN's sibling for telecom (lower photorefraction/DC drift is the usual argument; not quantified in the atlas): 6 of the 18 items in 3.1 are LT/TFLT, including the postdeadline line-rate record.
3. Manufacturing: 200 mm wafers (W1A.3, Th1D.1), 4-inch LT-on-fused-silica, wafer-scale LT-on-SiN (LIGENTEC), transfer printing (M4D.6).
4. Co-design with electronics: SiGe linear drivers (M4D.4), driver-less optical DACs from CMOS logic (Th4B.2), TOSA (W4J.4), CPO engine (Th4A.6), linear-drive (Th1C.3).
5. Beyond C-band: O-band dominance in datacom papers; 1064 nm GaAs-on-TFLN (Th4A.5); PPLN parametric band extension (M1C.1).
6. Commercial ecosystem visible in methods sections: HyperLight, Liobate, Luxtelligence, LIGENTEC, NanoLN (wafers named in W1A.4).

---

## 4. Candidate interactive charts for lithium-niobate.com

All from eo-modulator-atlas at a pinned SHA unless noted. Every point keeps `device_id`, `paper_id`, `title`, `url`, `qualifiers`, `vpi_convention`, `basis` for the hover card and the evidence link.

| # | Chart | Data fields | Filters / toggles | Notes |
|---|---|---|---|---|
| C1 | Vpi*L vs 3 dB bandwidth, colored by platform, year slider (animate 2017-2026) | `vpil_dc_vcm`, `vpi_dc_v`, `length_mm`, `vpil_rf_vcm` (-> `vpil_best`), `bw3db_ghz`, `qualifiers` (bw3db_ghz:gt -> arrow), `eo_material`, `waveguide_platform`, `year`, `band`, `wavelength_nm`, `vpi_convention`, `row_kind` | platform toggles (TFLN, TFLT, SiPh, InP, BTO, polymer/SOH, other), band (telecom vs visible), convention (push-pull only default), device vs design rows, log axes | Atlas panel (a) exists; LN version should foreground TFLN/TFLT and show instrument-limit bounds as arrows |
| C2 | Symbol rate and line rate over time ("the race to 400G/lane") | `max_baud_gbd`, `max_line_rate_gbps`, `max_net_rate_gbps`, `modulation_format`, `year`, `device_class`, `band`, platform | IM/DD vs coherent (from `modulation_format`/`device_class`), platform | Annotate OFC 2026 postdeadline points (xu2026b-a, starnault2026-a) |
| C3 | Papers per year by platform (stacked or small multiples) with coverage disclaimer | `papers.year`, platform per paper, `discovered_via` | include/exclude `ofc2026`-sourced papers | Without the toggle the 2026 spike misleads |
| C4 | Footprint vs efficiency: Vpi vs length with iso-Vpi*L lines | `vpi_dc_v`, `length_mm`, `vpi_convention`, platform | platform, band | Shows why TFLN electrodes are mm-scale and what slow-light/loaded-SiN changes (shen2025-a) |
| C5 | Vpi*L vs wavelength (TFLN/TFLT) | `vpil_best`, `wavelength_nm`, `band` | material | Physics teaching chart: visible devices (renaud2023 0.42-0.55 V cm at 532-738 nm; xue2023 at 450 nm; lin2026a-a TFLT 0.085 V cm at 375 nm) vs telecom; pairs with an interactive Vpi*L ~ lambda * gap / (n^3 r33 Gamma) explainer |
| C6 | TFLN stack explorer: film thickness, etch depth, electrode gap distributions | `eo_film_thickness_nm`, `etch_depth_nm`, `slab_thickness_nm`, `rib_width_nm`, `electrode_gap_um`, `electrode_type`, `crystal_cut`, `substrate` | year | Feeds the 3D/cross-section pages; link each row to `/sim?id=` where a config exists |
| C7 | Supply map: who makes wafers, who fabs, who publishes | eo: `wafer_supplier`, `foundry_or_fab`, `companies`, `universities`, `countries`; photonics-atlas: `supply/product_usage.csv` (A2.x, B3, C7), `supply/foundry_processes.csv`, `registry/organizations.csv` | role (wafer/fab/publisher), country | Sankey or bipartite graph; NanoLN dominance is the headline |
| C8 | Disclosure completeness heatmap (which metrics TFLN papers report) | core fields presence per row (`vpil`, `bw3db_ghz`, `il_onchip_db`, `rf_loss_db_per_cm`, `z0_ohm`, `n_rf`, `ng_opt`), `year` | platform | Supports a "how to read a modulator paper" page |
| C9 | Institution/geography map of TFLN/TFLT work | `author_affiliations.csv`, `org_sites.csv` (lat/lon), platform per paper | year, platform | Atlas panel (k) exists; LN site could reuse with an LN filter |
| C10 | OFC 2026 TFLN/TFLT board | OFC code, title, affiliations (public program), atlas `device_id` link | theme tag (400G IM/DD, manufacturing, co-design, beyond C-band) | Static table built from section 3; no PDF content |

Minimal LN-site data contract (build output, one JSON): `{source: {repo, sha, fetched_on}, devices: [{device_id, paper_id, year, platform, waveguide_platform, integration, device_class, band, wavelength_nm, length_mm, vpi_dc_v, vpi_convention, vpil_best, vpil_source, bw3db_ghz, bw_gt, max_baud_gbd, max_line_rate_gbps, max_net_rate_gbps, modulation_format, il_onchip_db, prop_loss_db_per_cm, eo_film_thickness_nm, electrode_type, qualifiers, row_kind}], papers: [{paper_id, title, year, venue, url, universities, companies, wafer_supplier, foundry_or_fab, countries, discovered_via}]}`.

---

## 5. Uncertainties and limits

- Sample, not census: 233 papers chosen by search, author-group follow-up, local corpus, landmarks, and OFC 2026. No statement about field-wide growth rates should be made from per-year counts.
- Bounds: 67 of 145 TFLN/TFLT bandwidth values are lower bounds; medians of bounded data understate true bandwidth.
- Conventions: push-pull Vpi*L only for the main comparison; SiPh has no push-pull-convention telecom rows, so SiPh Vpi*L in the wider slice mixes conventions and bias points.
- Year field: `papers.year` = earliest year across versions (arXiv v1), so some 2025 IDs carry year 2024 (e.g. shen2025, liu2025).
- Single-row records (0.21 V cm, 170 GHz, 768 Gb/s) are point claims with notes on method (e.g. zhang2022-a bandwidth from s-parameter calculation with scattered raw sideband data).
- photonics-atlas products have no specs; vendor roles partly mislabeled (`laser_source` on modulators).
- OFC full-text counts depend on text extraction (677 of 830 presentations have text).

---

## Website implications (ranked)

1. Make the TFLN-vs-everything Vpi*L / bandwidth / year chart (C1 + C2) the industry-trends centerpiece, fed by a pinned-SHA build-time fetch from eo-modulator-atlas (option A), with bounds drawn as arrows and push-pull convention as default. It is the single view a PDF review cannot give, and the data and conventions already exist.
2. Tell the honest story the data supports: median telecom TFLN efficiency is flat at about 2-3 V cm since 2018 while symbol rate rose from 100 to 225 GBd and bandwidth hit the 110 GHz instrument limit; footprint (6.4 mm median) is the trade-off. Avoid "exponential growth" language; label the per-year chart as atlas coverage.
3. Give TFLT its own section as LN's sibling: TFLT holds the atlas line-rate record (768 Gb/s, Th4A.2) and matched TFLN median Vpi*L in its first three atlas years (2024-2026); frame LN vs LT differences with sourced material properties (R06), not atlas speculation.
4. Add a supply-chain page (C7): single dominant wafer supplier (50 of 56 supplier statements), emerging foundry/PDK routes (Luxtelligence open PDK, CSEM MPW, HyperLight, Liobate, LIGENTEC, imec/IME 200 mm), commercial TFLN modulators already used as lab instruments. Pull from photonics-atlas, not a copy.
5. OFC 2026 board (C10) as a dated snapshot "2026-03, OFC": 400G/lane, 200 mm manufacturing, driver co-design, beyond C-band; refresh per conference.
6. Use the atlas's physics-rich rows for teaching widgets: Vpi*L vs wavelength (C5), Vpi vs length (C4), stack explorer (C6) linked to the atlas browser solver (`/sim`).
7. Upstream prerequisites (author decisions, not done here): explicit data licence for eo-modulator-atlas and photonics-atlas; optional tagged data releases (option C) for citable versions; fix the `role` quirk in photonics-atlas.
8. Do not use advanced-packaging-atlas as an LN data source (1 relevant row); at most link its CPO packaging context.
