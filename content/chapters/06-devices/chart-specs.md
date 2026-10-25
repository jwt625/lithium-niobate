# 06 Devices: atlas-driven chart specifications (A1-A7)

| Field | Value |
|---|---|
| As of | 2026-10-25 |
| Shared rules | Fetch, pinned commit `eb97f961165a331599e8191c62e15b5a52ba1d51`, SHA-256 checks, platform mapping, `vpil_best`, qualifier and bound handling, default filters, hover card, layout: `../08-industry/chart-specs.md` sec. 1 (single source; do not duplicate or diverge) |
| Counts | Every acceptance count below was recomputed 2026-10-25 from the pinned CSV bytes |

Column names are exact `devices.csv` / `papers.csv` headers. "Device rows" = `row_kind = device`.

---

## A1 V_pi L vs 3 dB bandwidth (centerpiece)

| Item | Spec |
|---|---|
| Question | Which devices are both efficient and fast, on which platform, and when? |
| x | `bw3db_ghz` (GHz, log 0.5-400); qualifier from `qualifiers` key `bw3db_ghz` |
| y | `vpil_best` (V cm, log 0.01-200); `vpil_source` in hover; qualifier from keys `vpil_dc_vcm`, `vpi_dc_v`, `length_mm`, `vpil_rf_vcm` (whichever produced the value) |
| Filters (default) | device rows; `device_class in {mzm, iq_mzm}`; `band in {o_band, c_band, l_band, cl_band}`; `vpi_convention = mzm_push_pull`; both values non-null |
| Toggles | platforms; all bands; all conventions (hollow, labelled); design rows (crosses); year slider 2017-2026 (points with `year <=` slider at full opacity, later at 0) |
| Bounds | `bw3db_ghz:gt` -> arrow to the right; 30 of the 71 default points |
| Reference lines | none by default (no "frontier" fit); optional iso lines of constant V_pi L / f_3dB ratio are not drawn because the two axes are not jointly constrained by one model |
| Highlight set | `shen2025-a` (0.21 V cm, > 110 GHz), `zhang2022-a` appears only under "all conventions" (`vpi_convention` empty/unspecified, 170 GHz, 2.3 V cm) |
| Axis note | Ranges widened 2026-10-25 from 1-400 GHz and 0.01-100 V cm to 0.5-400 GHz and 0.01-200 V cm so the `li2025b-a` outlier stays on the plot (implementation: src/lib/figures/devices/charts.ts) |
| Acceptance | default 71 points: TFLN 56, TFLT 9, Polymer 3, InP 1, AlGaAs 1, Other 1; with "all bands, all conventions" 146 points; SiPh contributes 0 points under the default and the legend slot says so; no axis rescale when the year slider moves |

## A2 Velocity matching map

| Item | Spec |
|---|---|
| Question | How closely do published traveling-wave LN and LT modulators match RF and optical speeds? |
| x | `ng_opt` (linear 2.0-4.2) |
| y | `n_rf` (linear 2.0-4.2) |
| Filters | platform TFLN or TFLT; both fields non-null (all such rows are device rows) |
| Marks | shape by `electrode_type` (`tw_gsg`, `tw_cpw`, `cl_twe`, `slow_wave`, `lumped`); size proportional to `length_mm` (fixed legend: 1, 5, 10, 20 mm); diagonal `n_rf = ng_opt`; band |n_rf - ng_opt| <= 0.1 shaded |
| Hover extras | `z0_ohm`, `rf_loss_db_per_cm` at `rf_loss_freq_ghz`, `bw3db_ghz` with qualifier; button "load into F6.04" |
| Acceptance | 28 points; 23 within the 0.1 band (inclusive, tolerance 1e-9); outside: `chen2022-c` (2.35, 2.2), `renaud2023-3um-738` (2.22, 2.38), `mao2022-a` (2.34, 2.62), `lin2026a-a` (2.3, 2.8), `chen2023-a` (2.18, 4.0); `approx` qualifiers on `n_rf` or `ng_opt` shown as "about" in hover |

## A3 Implied overlap vs electrode gap (inside F6.03)

| Item | Spec |
|---|---|
| Question | Given the reported V_pi L and gap, what mode-field overlap would the simple push-pull formula need? |
| Derived field | `Gamma_implied = (wavelength_nm x 1e-9) x (electrode_gap_um x 1e-6) / (2 x n_e(wavelength)^3 x r33 x vpil_best x 1e-2)`; n_e = Zelmon 1997 CLN extraordinary at 21 C (PHY Sellmeier); r33 = 30.8e-12 m/V (Turner 1966 via weis1985, clamped, 633 nm) with toggle 28.8e-12; labelled `derived` with the formula in the chart footer slot |
| Filters | platform TFLN; device rows; `device_class in {mzm, iq_mzm}`; `vpi_convention = mzm_push_pull`; `crystal_cut` starts with `x` (case-insensitive); `electrode_gap_um`, `wavelength_nm`, `vpil_best` non-null |
| Marks | x = `electrode_gap_um` (linear 0-15 um); y = Gamma_implied (log 0.1-10); shaded region Gamma > 1 labelled "lateral-gap model not applicable"; hollow markers when `tags` contains any of `slow_light`, `material_enhancement_claim`, `hybrid_si_ln`, `hybrid_sin_ln`, `unetched_ln` |
| Acceptance | 71 points; min 0.15 (`boynton2020-a`), max 6.12 (`shen2025-a`); 45 points in [0.45, 0.67] (`li2026aa-a` = 0.673 falls outside); 8 points above 1: `shen2025-a` 6.12, `shen2025-b` 3.21, `shen2025-c` 1.84, `shen2025-d` 1.31 (one slow-light device, four operating points), `yu2024-s3` 1.47, `yu2024-s2` 1.33 (`material_enhancement_claim`), `xue2026-a`, `xue2026-b` 1.03; values reproduce to 0.01 with n_e(1550 nm) = 2.1376 |

## A4 Footprint: V_pi vs electrode length

| Item | Spec |
|---|---|
| Question | How long must a modulator be for a given drive voltage on each platform? |
| x | `length_mm` (log 0.01-50) |
| y | `vpi_dc_v` (log 0.1-30) |
| Filters | device rows; `device_class in {mzm, iq_mzm}`; telecom band; `vpi_convention = mzm_push_pull`; both fields non-null |
| Reference lines | iso-V_pi L lines at 0.1, 0.3, 1, 3, 10 V cm (V_pi = V_pi L x 10 / length_mm), dashed, labelled at the right edge |
| Acceptance | 91 points: TFLN 60, TFLT 14, Polymer 8, InP 3, Other 3, BTO 2, AlGaAs 1; `shen2025-a` sits on the 0.21 V cm position between the 0.1 and 0.3 lines |

## A5 V_pi L vs wavelength (TFLN, TFLT)

| Item | Spec |
|---|---|
| Question | How much easier is modulation at shorter wavelengths? |
| x | `wavelength_nm` (log 300-5000) |
| y | `vpil_best` (log 0.03-30) |
| Filters | platform TFLN or TFLT; device rows; `vpi_convention = mzm_push_pull`; both non-null; all device classes |
| Overlay | model curve V_pi L(lambda) = lambda g / (2 n_e(lambda)^3 r33 Gamma) for the F6.03 slider state (g, Gamma), labelled `template` inputs; band shading by ITU/ISO bands from schema convention (l) |
| Acceptance | 117 points (TFLN 95, TFLT 22); lowest `lin2026a-a` 0.085 V cm at 375 nm (TFLT, lumped), then `xue2023-c` 0.17 V cm at 450 nm |

## A6 Records strip (not atlas-only)

| Item | Spec |
|---|---|
| Question | What are the best published numbers per metric, and when were they set? |
| Data | Records dataset (API lane `records`, seeded from manuscript 6.12 table): `metric, value, unit, conditions, platform_label, first_author, venue, date, doi, ver` |
| Encoding | one row per metric (20 rows), value on the metric's own log axis segment, date as a tick label; platform label as a mono tag; no cross-metric axis |
| Acceptance | 20 rows; each has DOI and date; every TFLT or LN-on-sapphire row shows its platform tag; no extrapolated value without an "extrapolated" tag |

## A7 Ring and resonator modulators: bandwidth vs loaded Q (inside F6.07)

| Item | Spec |
|---|---|
| Question | Do resonant LN modulators follow the photon-lifetime trade? |
| x | `q_loaded` (log 1e3-1e6) |
| y | `bw3db_ghz` (log 1-300) |
| Filters | platform TFLN or TFLT; device rows; `device_class in {ring, resonator}`; both non-null |
| Marks | filled = `bw_method = eo_s21`; hollow = `photon_lifetime_estimate`; arrow for `bw3db_ghz:gt`; reference line nu0 / Q_L at 1550 nm (193.4 THz / Q_L), labelled "linewidth, not a bound" |
| Acceptance | 13 points: `chen2025-a` (2200, > 110), `kari2025-b` (26595, 4.4), `li2020-b` (14000, 17.5), `li2020-c` (20000, 12.5), `liu2023-a..d` (5450-6450, 29-36, hollow), `tan2024-a` (11180, 16), `wang2018-rt-q18k` (18000, 11), `wang2018-rt-q5p7k` (5700, 40), `wang2018-rt-q8k` (8000, 30), `zhang2023-b` (5400, 104); hover on `zhang2023-b` shows the atlas note (104 GHz at the -8 dB detuning point; authors' photon-lifetime limit 35 GHz) |
