# Atlas-driven charts: shared fetch and conventions, industry charts B1-B6

| Field | Value |
|---|---|
| As of | 2026-10-25 |
| Scope | Section 1 is the single source of truth for every eo-modulator-atlas chart on the site (chapter 06 charts A1-A7 in `../06-devices/chart-specs.md` reference it). Section 2 specifies chapter 08 charts B1-B6 |
| Data source | eo-modulator-atlas, public repository `github.com/jwt625/eo-modulator-atlas`, read-only |
| Verified | Pinned CSVs fetched 2026-10-25 from raw.githubusercontent.com at the SHA below; SHA-256 equal to the local checkout; every count in this file recomputed from those bytes with a throwaway stdlib script (not stored) |

---

## 1. Shared fetch and conventions

### 1.1 Pinned fetch

| Item | Value |
|---|---|
| Commit | `eb97f961165a331599e8191c62e15b5a52ba1d51` (2026-10-20 12:01:25 -0700) |
| Files | `data/devices.csv`, `data/papers.csv`, `data/schema/devices.schema.yaml`; optional `data/organizations.csv` |
| URL pattern | `https://raw.githubusercontent.com/jwt625/eo-modulator-atlas/<sha>/data/<file>` |
| SHA-256 at the pin | `devices.csv` `0dd95c55abdf711b9511e561c5efa60db657f23553690dd211421f4036b987f7` (772,730 bytes); `papers.csv` `62d5ddf8325cd88f0a4995c62021cefafd9683e72b820ea6044e10585dad1b67` (416,422 bytes) |
| Build behavior | Fetch at build time (R04 option A); verify SHA-256; fail the build on mismatch; never write back upstream; no copy of the full CSVs in this repository |
| Output (proposal; API lane decides path) | one JSON, e.g. `src/lib/generated/atlas_ln.json` and the same rows under `static/api/v1/atlas/`, with `source: {repo, sha, fetched_on, sha256}`, `devices[]`, `papers[]` restricted to the fields in 1.6 |
| Page stamp | Every atlas chart prints `atlas eb97f96 · 2026-10-20 · fetched <ISO date>` in its footer line and links the commit |
| Rows at the pin | 519 rows (486 `row_kind = device`, 33 `design`), 233 papers (215 with device rows), years 2012-2026 |

Licensing: eo-modulator-atlas has no LICENSE file (R04 sec. 1.1). Facts with locators are shown with attribution; an explicit data license upstream is an author decision (open question Q8.1).

### 1.2 Platform mapping

Derived from `eo_material` and `tags` (R04 sec. 2.0):

| Platform label | Rule |
|---|---|
| TFLN | `eo_material = lithium_niobate` and `tags` does not contain `titanium_indiffused` |
| Bulk Ti:LN | `eo_material = lithium_niobate` and `tags` contains `titanium_indiffused` (paper `thiele2022`, 6 rows) |
| TFLT | `eo_material = lithium_tantalate` |
| SiPh | `silicon_plasma_dispersion` |
| InP | `inp_mqw` |
| BTO | `barium_titanate` |
| Polymer (incl. SOH/POH) | `eo_polymer` |
| Graphene/2D | `graphene_2d` |
| GeSi EAM | `germanium_silicon_eam` |
| AlGaAs | `algaas_gaas` |
| Other | every other `eo_material` value |

Row counts at the pin (all rows): TFLN 219, SiPh 62, Polymer 61, TFLT 44, Graphene/2D 35, InP 30, BTO 28, Other 23, GeSi EAM 7, Bulk Ti:LN 6, AlGaAs 4. Papers: TFLN 83, SiPh 31, TFLT 22, Polymer 20, BTO 15, InP 14, Other 13, Graphene/2D 12, GeSi EAM 3, AlGaAs 1, Bulk Ti:LN 1. A paper counts once per platform with rows.

Platform marks: TECH = shape per platform (TFLN filled diamond, TFLT hollow diamond, SiPh square, InP triangle, BTO circle, Polymer cross, Other plus); VISUAL = same shapes plus color. TFLN and TFLT are foregrounded; others at 50% opacity by default.

### 1.3 Derived fields (match atlas `scripts/build_views.py`)

| Field | Rule |
|---|---|
| `vpil_best` | `vpil_dc_vcm` if set (`source = reported_dc`); else `vpi_dc_v * length_mm / 10` if both set (`derived_dc`); else `vpil_rf_vcm` (`reported_rf`); else null. Inherits the row's `vpi_convention`; never converted between conventions |
| `bw_gt`, `bw_lt`, `bw_approx` | from `qualifiers` (1.4) on `bw3db_ghz` |
| `year` | `papers.year` (earliest year over all versions, arXiv v1 included; schema convention (n)) |
| `platform` | 1.2 |
| `telecom` | `band in {o_band, c_band, l_band, cl_band}` |

Nothing else is computed. Any further quantity (e.g. implied overlap, A3) is labelled `derived` with its formula on the chart.

### 1.4 Bounds and qualifiers

- `qualifiers` is a `;`-separated list of `field:op`, `op in {gt, lt, approx}` (schema convention (b)).
- `gt` on a plotted field: draw the marker at the stated value with an arrow in the increasing direction of that axis (length 12 px in TECH, 16 px in VISUAL, independent of axis scale); hover text "> value".
- `lt`: arrow toward decreasing values; hover "< value".
- `approx`: normal marker; hover "about value".
- A bounded value is never used as a point estimate in fits. Medians that include bounds are printed as "median >= x" when any input is `gt` and the bound could raise the median.
- Lower-bound share is printed beside every bandwidth statistic.

### 1.5 Default filters

| Filter | Default | Toggle |
|---|---|---|
| `row_kind` | `device` only | show `design` rows as crosses labelled "design (simulated)" |
| `vpi_convention` for V_pi L axes | `mzm_push_pull` only | "all conventions": other conventions drawn hollow with the convention name in hover |
| Band | `telecom` (O, C, L, CL) | all bands |
| `device_class` for modulator charts | `{mzm, iq_mzm}` | add `phase_shifter`, `ring`, `resonator` |
| Platforms | all on, TFLN/TFLT foregrounded | per-platform toggles |

### 1.6 Fields carried into the build JSON

`device_id, paper_id, year, platform, eo_material, waveguide_platform, integration, electrode_type, device_class, row_kind, tags, band, wavelength_nm, length_mm, vpi_dc_v, vpi_rf_v, vpil_dc_vcm, vpil_rf_vcm, vpi_convention, vpil_best, vpil_source, bw3db_ghz, bw3db_reference, bw_method, bw_measured_to_ghz, max_baud_gbd, modulation_format, max_line_rate_gbps, max_net_rate_gbps, il_onchip_db, il_onchip_scope, prop_loss_db_per_cm, rf_loss_db_per_cm, rf_loss_freq_ghz, z0_ohm, n_rf, ng_opt, q_loaded, eo_film_thickness_nm, electrode_gap_um, crystal_cut, qualifiers, evidence_ref, notes`; from `papers.csv`: `paper_id, title, year, venue, doi, url, universities, companies, foundry_or_fab, wafer_supplier, countries, discovered_via, redistribution`.

### 1.7 Hover card (all atlas charts)

Fixed 360 px wide, anchored to the marker (not the cursor), keyboard focusable: `device_id`; paper title (truncate 90 chars) + year + venue; the two plotted values with units, qualifier, `vpil_source` where relevant, `vpi_convention`; `bw_method`; atlas `notes` truncated to 240 chars; links: DOI or arXiv URL, evidence file `data/evidence/<paper_id>.yaml` at the pinned commit, atlas `/table` deep link.

### 1.8 Layout and plotting rules

- Chart box reserves height (TECH 360 px, VISUAL 480 px; phone 300 / 380 px) before data load; a no-data state uses the same box.
- Log axes for V_pi L (0.01-100 V cm), bandwidth (1-400 GHz), length (0.01-50 mm), wavelength (300-5000 nm); a log toggle per axis where values span less than a decade.
- No in-plot titles or captions; axis labels with units; legend outside the plot area in a fixed slot.
- Year slider (where present) is a native range input with `aria-valuetext`; points enter at their `year`; slider movement changes opacity only, never geometry of axes or legend.

---

## 2. Chapter 08 charts

### B1 Platform comparison: V_pi L vs bandwidth vs year

| Item | Spec |
|---|---|
| Question | Where do LN and LT modulators sit against every other EO platform, and how has that changed by year? |
| Data | Same rows and rendering as A1 (`../06-devices/chart-specs.md`); B1 differs only in defaults: all platforms at full opacity, year slider starts at 2017 and plays to 2026 on demand |
| Filters | 1.5 defaults: telecom, `{mzm, iq_mzm}`, `row_kind = device`, `mzm_push_pull`, `vpil_best` and `bw3db_ghz` set |
| Acceptance | 71 points (TFLN 56, TFLT 9, Polymer 3, InP 1, AlGaAs 1, Other 1); 30 bandwidth lower bounds drawn as arrows; SiPh absent under the push-pull default (no push-pull telecom SiPh rows) and the empty state says so in the legend slot ("SiPh: 0 rows with push-pull V_pi L") |

### B2 Symbol rate and line rate over time

| Item | Spec |
|---|---|
| Question | How fast have LN and LT transmitters been driven, compared with other platforms? |
| Fields | `max_baud_gbd`, `max_line_rate_gbps`, `max_net_rate_gbps`, `modulation_format`, `device_class`, `year`, platform |
| Filters | `row_kind = device`; metric toggle: symbol rate / line rate / net rate; IM/DD vs coherent toggle: coherent = `device_class = iq_mzm` or `modulation_format` contains one of `QAM`, `QPSK`, `DP-` (case-insensitive); else IM/DD |
| Encoding | x = year (2016-2026), y = metric (linear; log toggle); all rows as small markers; per-platform yearly maximum joined by a step line (TFLN, TFLT emphasized) |
| Annotations | Fixed labels only for: `xu2026b-a` (TFLT, 768 Gb/s line), `starnault2026-a` (TFLN, 225 GBd PAM4), `xu2022-a` (TFLN, 1,960 Gb/s net coherent) |
| Acceptance (symbol rate, yearly max) | TFLN 2017 40, 2018 100, 2020 110, 2021 100, 2022 136, 2023 112, 2024 180, 2025 220, 2026 225 GBd; TFLT 2024 208, 2025 208, 2026 226; SiPh 2021 60, 2023 128, 2024 180, 2025 200, 2026 192; InP 2016 100, 2019 128, 2023 80, 2025 192, 2026 200; BTO 2023 216, 2025 256, 2026 225; Polymer 2020 120, 2023 100, 2025 112, 2026 224 GBd; 64 TFLN/TFLT device rows carry `max_baud_gbd` |
| Caveat line (in the chart footer slot) | "Maximum per year in the atlas sample; line rates mix IM/DD and coherent; single demonstrations." |

### B3 Papers per year by platform (TFLT rise), with OFC toggle

| Item | Spec |
|---|---|
| Question | When did each platform appear in the atlas sample, and how much of 2026 is OFC ingestion? |
| Fields | `papers.year`, platform per paper (from its device rows), `papers.discovered_via` |
| Encoding | small multiples, one per platform, bars per year 2017-2026; toggle "exclude papers tagged `ofc2026`" |
| Acceptance | TFLN 2017 1, 2018 2, 2019 0, 2020 4, 2021 6, 2022 17, 2023 13, 2024 9, 2025 9, 2026 22 (OFC-tagged in 2026: 10); TFLT 2024 4, 2025 4, 2026 14 (OFC-tagged in 2026: 5); other platforms match R04 sec. 2.2 |
| Footer slot text | "Atlas coverage, not field output: curated sample of 233 papers." |

### B4 Wafer-supplier concentration

| Item | Spec |
|---|---|
| Question | Who supplies the thin-film wafers behind published LN and LT devices? |
| Fields | `papers.wafer_supplier` (free text) for papers with at least one TFLN or TFLT row |
| Match rule | NanoLN = `wafer_supplier` contains `nanoln` or `jingzheng` (case-insensitive); empty = not stated; everything else = other, listed verbatim in the hover |
| Encoding | One horizontal 100% bar per group: all 105 TFLN+TFLT papers split into NanoLN / other stated / not stated; second bar: the 56 stated papers split NanoLN / other; Isotype variant in VISUAL (one wafer glyph per paper, 56 glyphs) |
| Acceptance | 105 papers; 56 stated; 50 NanoLN, 6 other (NGK Insulators LN-on-sapphire 1; Shanghai Novel Si Integration Technology and/or SIMIT LTOI 3; author-made LTOI 1; "customized TFLN wafer (supplier not named)" 1); TFLN 41 of 43 stated, TFLT 9 of 13 stated |
| Cross-check line | photonics-atlas (commit `26aa340`, 2026-10-23) `supply/product_usage.csv`, category A2.1 LNOI: 44 usage records, all Jinan Jingzheng (R04 sec. 1.3); same upstream papers, not an independent sample |

### B5 How devices are built: integration mode per year

| Item | Spec |
|---|---|
| Question | Is TFLN moving from in-house monolithic chips to foundry and heterogeneous processes? |
| Fields | `devices.integration`, `devices.waveguide_platform`, `devices.band`, `papers.year`; TFLN + TFLT rows (all `row_kind`) |
| Encoding | per year, number of distinct papers with at least one row of: `monolithic`; `bonded_heterogeneous`; `micro_transfer_printed`; `foundry_native`; loaded waveguide (`waveguide_platform in {lnoi_loaded_sin, lnoi_loaded_si, ltoi_loaded_sin, lnoi_loaded_oxide}`); O band. A paper can count in several series; total papers per year drawn as an outline |
| Acceptance | 2022: total 17, monolithic 13, bonded 4, loaded 7, O band 1; 2025: total 13, monolithic 6, bonded 4, MTP 2, foundry-native 1, loaded 3, O band 1; 2026: total 36, monolithic 26, bonded 3, MTP 2, foundry-native 3, loaded 2, O band 10 |

### B6 Footprint by platform

| Item | Spec |
|---|---|
| Question | How long is a modulator on each platform? |
| Fields | `length_mm` (electrode length per arm, convention (q)), platform; telecom `{mzm, iq_mzm}` device rows |
| Encoding | strip plot per platform on a log length axis, median tick; drawn to a shared 1:1 physical scale strip in VISUAL (a 10 mm ruler with each platform's median electrode drawn to scale) |
| Acceptance | medians: TFLN 6.4 mm, TFLT 7.5, SiPh 0.9, InP 4.0, BTO 1.375 (print 1.38), Polymer 0.28 |

### B7 OFC 2026 board

Not a chart; a static table in `figures.md` F8.06, rows keyed by atlas `paper_id` with DOIs verified on Crossref 2026-10-25.
