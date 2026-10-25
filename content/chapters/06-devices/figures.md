# 06 Devices: figure specifications

| Field | Value |
|---|---|
| Chapter | 06 Devices |
| As of | 2026-10-25 |
| Figures | F6.01-F6.12 (this file); atlas charts A1-A7 in `chart-specs.md` |
| Physics modules | `src/lib/physics/modulator.ts`, `src/lib/physics/ring.ts` (PHY lane); nonlinear and Sellmeier modules per PHY naming. Function names below are the interface this chapter needs; PHY owns final names and signatures |
| Data | eo-modulator-atlas `devices.csv` / `papers.csv` at commit `eb97f961165a331599e8191c62e15b5a52ba1d51`, columns by exact name; fetch and conventions in `../08-industry/chart-specs.md` sec. 1 |

Rules applied to every figure (DevLog-003a/003b/004):
- Both systems: TECH = dense, monospace readouts, 18 px controls, static, monochrome; VISUAL = illustrated instrument, 44 px targets, spectral colors computed from wavelength, IR in dashed declared false color.
- No layout shift: every figure box has a reserved height (`aspect-ratio` or fixed px); readouts use fixed-width formats (character counts given) right-aligned in tabular figures; verify with `getBoundingClientRect` on all elements at control minimum, maximum, and midpoint, at 1440 px and 390 px, both modes, both themes.
- Data-only plots: axes with units, no titles or editorial captions inside the plot; log toggles where data span decades.
- Values shown carry a badge (status) that opens the source; template inputs are badged `template`.
- Reduced motion: no animation; all controls stay.

Readout format notation: `%6.2f` = fixed field of 6 characters, 2 decimals; units appended outside the numeric field; sign column reserved where values can be negative.

---

## F6.01 Device map

| Item | Spec |
|---|---|
| Question | Which LN effect does each device family use, and how mature is it? |
| Model / inputs / outputs | No physics. Input: the family table in manuscript 6.0 (family, effect, maturity text, dated source id). Output: grid (rows = 11 families, columns = 6 effects: Pockels, chi(2), chi(3), piezoelectric, acousto-optic, heterogeneous gain/absorption); a filled cell = the family uses that effect; maturity as a 3-level tag (commercial / sampling or in development / research) only where a dated source exists |
| TECH | Boxed table, mono tags; cell = filled square or empty; maturity column as SKU tag; row click jumps to section |
| VISUAL | 11 device cards in a 3m-facet card grid; each card = small line drawing of the device (MZI, poled waveguide, ring, IDT, bonded III-V stack) with its effect glyph; maturity as fill pattern (solid / half / hollow), never color only |
| Moment of joy | Hovering an effect column lights every device that uses it; the Pockels column lights 5 of 11 families (bulk modulators, TFLN MZM/IQ, combs, transducers, TFLT) |
| Readouts | none; card grid fixed at 4 x 3 (desktop), 2 x 6 (<= 760 px), 1 x 11 (<= 430 px) |
| Acceptance | 11 rows; every "commercial" or "sampling" tag has a source id with date; no family lacks a section link; hover highlight changes no element box |

## F6.02 Modulator bench: MZM transfer and eye

| Item | Spec |
|---|---|
| Question | How does a voltage on a Mach-Zehnder become bits, and what do V_pi and bandwidth do to the eye? |
| Model | `modulator.ts`: `mzmTransfer(V, Vpi, phiB)` = 0.5 (1 + cos(pi V / Vpi + phiB)); `eyeDiagram({baud_GBd, format: 'NRZ' or 'PAM4', Vpp, Vbias, Vpi, f3dB_GHz, prbsOrder, seed})` = drive waveform (PRBS, raised-cosine or first-order low-pass with corner f3dB applied to the drive), through `mzmTransfer`, folded at 2 symbol periods; returns traces and eye height / width estimates |
| Inputs | Vpi: template 2.0 V default, or "pick an atlas device" (rows with `vpi_dc_v` or `vpi_rf_v`, `bw3db_ghz`; shows `device_id`, convention badge); bias phase phiB (-pi..pi); drive Vpp 0.1-2 Vpi; baud 10-250 GBd; format NRZ / PAM4 |
| Outputs | T(V) curve with operating point and swing; optical eye; readouts: `V_pi` `%5.2f V`, `bias` `%+6.1f deg`, `Vpp/V_pi` `%4.2f`, `ER` (static extinction from the swing) `%5.1f dB`, `eye height` `%4.2f` (normalized) |
| TECH | Left: T(V) line plot (V axis -2Vpi..2Vpi), operating point dot, swing bracket; right: eye as monochrome density raster (512 x 256 canvas); control rows below in mono |
| VISUAL | Illustrated MZM top view (waveguides, Au G-S-G with push-pull field arrows that flip with drive sign, 1550 nm light in dashed false color whose output-arm brightness follows T); transfer curve and eye under it; 44 px sliders; shared state `LNSTATE.mzm = {V, phiB, Vpp, baud, format}` with the chapter 02 MZM figure |
| Moment of joy | Raising the baud above about 1.5 f3dB closes the eye in real time; selecting a 2018 atlas device then a 2026 device shows the eye reopen at 200 GBd |
| Readouts | Fixed-width fields above; eye canvas fixed 512 x 256 (TECH) / 640 x 320 (VISUAL), scaled by CSS aspect-ratio |
| Acceptance | `mzmTransfer(0, Vpi, 0) = 1`, `mzmTransfer(Vpi, Vpi, 0) = 0` to 1e-12; quadrature (phiB = -pi/2) gives T = 0.5 at V = 0; PAM4 shows 3 eye openings; with f3dB -> infinity the eye is fully open for any baud; picking a row with `vpi_convention != mzm_push_pull` shows the convention badge and a note, never a converted value; no layout shift across baud 10-250 GBd |

## F6.03 Cross-section V_pi L calculator with implied overlap

| Item | Spec |
|---|---|
| Question | What sets V_pi L, and where do measured devices sit in overlap? |
| Model | `modulator.ts`: `vpiL({lambda_um, gap_um, ne, r33_pmV, Gamma, pushPull: true})` = lambda g / (2 n_e^3 r33 Gamma) (push-pull) returned in V cm; `impliedOverlap({lambda_um, gap_um, ne, r33_pmV, vpiL_Vcm})`; n_e from the Sellmeier module (Zelmon 1997 CLN extraordinary, 21 C, 0.4-5 um) |
| Inputs | gap g 1-15 um (template default 5); Gamma 0.1-1.0 (template default 0.5); wavelength 0.4-4 um (default 1.55); r33 source toggle: 30.8 pm/V (Turner 1966, clamped, 633 nm, via weis1985, P-comp) / 28.8 pm/V (Kaminow 1980 via weis1985, P-comp) |
| Atlas inputs | `devices.csv`: `eo_material = lithium_niobate`, tag not `titanium_indiffused`, `row_kind = device`, `device_class in {mzm, iq_mzm}`, `vpi_convention = mzm_push_pull`, `crystal_cut` starting with `x` (case-insensitive), `electrode_gap_um`, `wavelength_nm`, V_pi L = `vpil_dc_vcm`, else `vpi_dc_v * length_mm / 10`, else `vpil_rf_vcm` (atlas `vpil_best` rule); 71 rows at the pinned commit |
| Outputs | Readout `V_pi L` `%5.2f V cm`; scatter of Gamma_implied vs gap (log y toggle) with a shaded band Gamma > 1 labelled "lateral-gap model not applicable"; current slider state as a crosshair |
| TECH | Cross-section line drawing in ASCII-like strokes (film, rib, slab, two electrodes, gap dimension); scatter beside it, monochrome; hollow markers for tags `slow_light`, `material_enhancement_claim`, `hybrid_si_ln`, `hybrid_sin_ln`, `unetched_ln` (same set as chart A3) |
| VISUAL | Cross-section drawn to scale (Au electrodes `--v-au`, LN `--v-ln`, oxide `--v-sio2`); E-field lines between electrodes scale with V; optical mode as a 1550 nm false-color dashed contour; overlap shaded where field and mode coincide; scatter below |
| Moment of joy | Dragging the wavelength from 1.55 to 0.45 um drops V_pi L by 4.18x at fixed gap, overlap, and r33 (lambda ratio 3.44 times (n_e(450)/n_e(1550))^3 = 1.215, derived from Zelmon), and the visible atlas devices light up near the new value |
| Readouts | `V_pi L` 9 ch; `n_e` `%6.4f`; `Gamma` `%4.2f`; hover card fixed 360 px wide: device_id, paper title, year, gap, wavelength, V_pi L with source (`reported_dc`, `derived_dc`, `reported_rf`), Gamma_implied, atlas `notes` truncated to 240 chars |
| Acceptance | At lambda 1.55 um, g 5 um, Gamma 0.5, r33 30.8: V_pi L = 2.58 V cm (+/- 0.01); r33 28.8 gives 2.75; ratio V_pi L(1.55 um) / V_pi L(0.45 um) = 4.18 at fixed g, Gamma, r33; n_e(1550 nm) = 2.1376 and n_e(632.8 nm) = 2.2022 (R06); atlas scatter has 71 points, min Gamma 0.15 (`boynton2020-a`), max 6.12 (`shen2025-a`); 45 points in [0.45, 0.67]; hollow markers on at least `shen2025-a/b/c/d` and `yu2024-s2/s3` (tag set of chart A3); no layout shift at slider extremes |

## F6.04 Traveling-wave EO response

| Item | Spec |
|---|---|
| Question | How do velocity mismatch, RF loss, and impedance mismatch set the bandwidth of a traveling-wave modulator? |
| Model | `modulator.ts`: `twResponse({f_GHz: number[], L_mm, nRF, ng, lossRef_dBcm, fRef_GHz, lossExponent, Z0, Zs, ZL})`. alpha(f) [Np/m] = lossRef_dBcm x 100 / 8.686 x (f / fRef)^lossExponent; gamma = alpha + j 2 pi f nRF / c; Gamma_L = (ZL - Z0)/(ZL + Z0); Gamma_S = (Zs - Z0)/(Zs + Z0); V+ = Z0/(Z0 + Zs) / (1 - Gamma_S Gamma_L e^{-2 gamma L}); m = V+ [ (1 - e^{-u+ L})/(u+ L) + Gamma_L e^{-2 gamma L} (e^{u- L} - 1)/(u- L) ], u+- = alpha + j 2 pi f (nRF -+ ng)/c (u+ uses nRF - ng, u- uses nRF + ng); S21_EO(dB) = 20 log10 |m(f)/m(0)|, m(0) = ZL/(Zs + ZL); returns curve and first -3 dB crossing (linear interpolation in f) or `null` + "no crossing below fmax". Equation form to be checked against chung1991 (open question Q6.2) |
| Inputs | L 0.5-40 mm (default 10); nRF 1.8-4.5 (default 2.25); ng 2.0-4.5 (default 2.25); RF loss at fRef 0-15 dB/cm (default 3 at 67 GHz); lossExponent 0.5 (skin effect) / 1.0 (dielectric) toggle; Z0 20-80 ohm (default 50); Zs 50 ohm fixed; ZL 20-80 ohm or "= Z0"; presets: atlas rows with `n_rf`, `ng_opt`, and optionally `z0_ohm`, `rf_loss_db_per_cm`, `rf_loss_freq_ghz`, `length_mm` (28 TFLN/TFLT device rows) |
| Outputs | S21_EO(f) 0-300 GHz (linear f; log toggle for f); readouts `f3dB` `%6.1f GHz` or `> 300.0 GHz`; `|nRF - ng|` `%5.3f`; total RF loss at f3dB `%5.2f dB`; single-effect limits shown as two dashed reference lines: f_vel = 0.443 c / (L |nRF - ng|), f_loss where total loss = 6.4 dB; preset row shows the atlas `bw3db_ghz` with its qualifier as a marker (arrow for `gt`) |
| TECH | Mono line plot, 3 dB gridline, two reference lines dashed; controls in two rows; preset dropdown lists `device_id` |
| VISUAL | Electrode drawn as a strip with a traveling RF wave (Au) above a dashed 1550 nm optical pulse; their relative drift at the chosen frequency is animated only while a slider is operated (data-fx); response curve below |
| Moment of joy | Setting nRF = ng and loss to 0 flattens the response to 0 dB at every length; adding 0.15 of index mismatch brings back the sinc ripples whose first null moves as 1/L |
| Readouts | f3dB 10 ch reserved (`> 300.0 GHz`); all readouts in one fixed row; curve canvas fixed height 280 px (TECH) / 360 px (VISUAL) |
| Acceptance | Matched, lossless (nRF = ng, alpha = 0, ZL = Z0 = Zs): |S21| = 0 dB to 1e-9 for all f; alpha = 0, Z matched: 3 dB at f L = 0.443 c / |nRF - ng| (+/- 0.5%); nRF = ng: 3 dB where alpha L = 0.738 Np (total 6.41 dB, +/- 0.5%); preset `chen2022-c` gives f_vel = 88.5 GHz and f_loss = 317 GHz (loss exponent 0.5); DC limit equals ZL/(Zs + ZL); no layout shift at L, loss, nRF extremes |

## F6.05 Atlas centerpiece: V_pi L vs bandwidth (A1)

Specified in `chart-specs.md` A1. Placement: manuscript 6.3 L1. Moment of joy: the year slider replays 2017-2026; points appear in the year they were published, bounds as arrows that keep pointing right because instruments stopped at 67 and 110 GHz.

## F6.06 Footprint: V_pi vs length (A4) and V_pi L vs wavelength (A5)

Specified in `chart-specs.md` A4 and A5. Placement: manuscript 6.3 L2. A4 and A5 share one figure box with a two-state toggle (`Footprint` / `Wavelength`); the box height is the larger of the two.

## F6.07 Ring modulator

| Item | Spec |
|---|---|
| Question | Why do resonant modulators trade speed for efficiency? |
| Model | `ring.ts`: `allPassRing({phi, a, r})` T = (a^2 - 2 a r cos phi + r^2) / (1 - 2 a r cos phi + (a r)^2); `ringFromQ({lambda_nm, ng, R_um, QL, regime: 'critical' or 'under' or 'over'})` returns a, r; resonance shift `dLambda = tuning_pm_per_V x V`; `linewidth_GHz = nu0 / QL`; `photonLifetime_ps = QL / (2 pi nu0)` |
| Inputs | Q_L 2e3-2e5 (log slider; default 1e4); tuning 1-30 pm/V (template default 7 pm/V, display note: atlas `wang2018-rt-q50k` reports 0.007 nm/V); V -5..5 V; laser detuning in linewidths |
| Atlas inputs | TFLN/TFLT `row_kind = device`, `device_class in {ring, resonator}`, `q_loaded` and `bw3db_ghz` set: 13 rows (chart A7 in `chart-specs.md`) |
| Outputs | Transmission vs wavelength (pm offset) with the dip moving with V; readouts `Q_L` `%7.0f`, `linewidth` `%6.2f GHz`, `tau_ph` `%6.2f ps`, `shift` `%+6.1f pm`, `T at laser` `%5.3f`; second panel: atlas bandwidth vs Q_L (log-log) with the line nu0/Q_L at 1550 nm |
| TECH | Two mono panels side by side; atlas markers: filled = measured `eo_s21`, hollow = `photon_lifetime_estimate`, arrow = `gt` |
| VISUAL | Illustrated ring with bus waveguide and electrodes; ring glows (1550 nm false color, dashed) with stored energy proportional to the computed circulating power at the laser; panels below |
| Moment of joy | Raising Q_L narrows the dip and makes 1 V swing the output from bright to dark, while the linewidth readout (the speed limit) falls in step |
| Readouts | fixed row of 5 readouts, 44 ch total; panels fixed 260 px height (TECH) / 340 px (VISUAL) |
| Acceptance | Critical coupling (a = r) gives T = 0 on resonance; nu0/Q_L at Q_L = 5,700, lambda = 1550 nm = 33.9 GHz; at 18,000 = 10.7 GHz; atlas panel shows 13 points incl. `wang2018-rt-q5p7k` (5,700, 40 GHz), `chen2025-a` (2,200, > 110 GHz arrow), `zhang2023-b` (5,400, 104 GHz, hover shows atlas note on detuning); no layout shift at Q extremes |

## F6.08 SHG converter

| Item | Spec |
|---|---|
| Question | How much of a pump does a TFLN PPLN waveguide convert, and when does it saturate? |
| Model | PHY nonlinear module: undepleted `P2 = eta L^2 P1^2`; depleted `P2 = P1 tanh^2(sqrt(eta P1) L)` (lossless, phase matched); QPM period `Lambda = lambda1 / (2 (n2 - n1))` from the Sellmeier module with a declared effective-index offset slider (template) or bulk indices (labelled bulk); phase-mismatch sinc^2 vs pump wavelength for length L |
| Inputs | eta_norm 100-10,000 %/W/cm^2 (log, default 2,600, badge points to wang2018optica); L 1-30 mm (default 4); P1 0.1-1000 mW (log); pump wavelength 1.40-1.70 um |
| Outputs | P2 vs P1 log-log with undepleted (slope 2) and depleted curves; readouts `eta L^2` `%8.1f %/W`, `P2` `%8.3f mW`, `conversion` `%5.1f %`, `Lambda` (bulk) `%6.2f um`; device markers: chen2024nn (eta L^2 near 1e4 %/W; > 80% at 20 mW), li2024apn (9,600 %/W/cm^2; 85%) |
| TECH | Mono log-log plot; markers with source badges |
| VISUAL | Poled waveguide drawn with +z / -z domains at 2 px per um (motif scale, DevLog-003b sec. 7), 1550 nm dashed false color fading along the guide as 775 nm (spectral, low luminance) grows; plot below |
| Moment of joy | Sliding the pump past a few tens of mW bends the slope-2 line over into saturation; the domain stripes match the computed period |
| Readouts | 4 fields, fixed 38 ch; plot 280 px / 360 px |
| Acceptance | eta L^2 = 100 W^-1, P1 = 20 mW: conversion 78.9% (+/- 0.1); undepleted and depleted agree to 1% for conversion < 1%; Lambda for 1550 -> 775 nm in bulk CLN at 21 C matches chapter 02 band label (DevLog-003b: 18.99 um) to 0.01 um; normalized (%/W/cm^2) and resonant (%/W) values never share an axis |

## F6.09 OPO threshold

| Item | Spec |
|---|---|
| Question | Why does a parametric oscillator switch on abruptly, and how low can its threshold go on a chip? |
| Model | PHY nonlinear module OPO threshold (coupled-mode, doubly or triply resonant, chapter 02 derivation); below threshold output = 0 (classical model; spontaneous emission not drawn); above threshold signal power from the PHY steady-state solution |
| Inputs | intrinsic Q 1e5-1e8 (log), coupling regime, nonlinear coupling g (template range, labelled template), pump power 1 uW-10 mW (log) |
| Outputs | Output signal vs pump (log-log) with the threshold kink; readout `P_th` `%8.2f uW`; device points: lu2021optica (about 30 uW), gao2021njp (19.6 uW), mckenna2022 (tens of uW, drawn as a range 10-99 uW with "tens of" label) |
| TECH | Mono plot with threshold gridline |
| VISUAL | Ring icon that stays dark below threshold and lights at threshold (this is the R12 "OPO" motif made literal); plot below |
| Moment of joy | The ring lights exactly at the computed threshold, not before |
| Readouts | `P_th` 11 ch; plot fixed height |
| Acceptance | Threshold scales as 1/Q^2 for doubly resonant with equal Q at critical coupling (PHY test); output exactly 0 below threshold; device markers carry status `reported` and ver codes from manuscript 6.5 |

## F6.10 Resonant EO comb

| Item | Spec |
|---|---|
| Question | How does a microwave drive on a low-loss ring make hundreds of evenly spaced lines? |
| Model | `ring.ts` `eoComb({beta, roundTripLoss_dB, detuning, dispersion, N})`: steady state of the resonant EO comb (coupled-mode recursion of sideband amplitudes, PHY implementation); returns line powers; formula and assumptions cited to zhang2019nat main text after PHY reads it (open question Q6.4) |
| Inputs | modulation index beta = pi V / V_pi (0-pi); intrinsic Q (log); drive frequency fixed = FSR (template 10 GHz, labelled template); dispersion toggle (off / on, template value) |
| Outputs | Comb spectrum, line power in dB on a log axis vs frequency offset; readouts `lines above -60 dB` `%5d`, `span` `%6.1f nm` |
| TECH | Mono stem plot |
| VISUAL | Ring with microwave electrodes; comb lines drawn as stems in declared false color at telecom wavelengths |
| Moment of joy | Doubling the drive doubles the span on the dB axis (the triangular comb envelope steepens or flattens) |
| Readouts | 2 fields, 19 ch; plot fixed height |
| Acceptance | beta = 0 gives one line; line count increases monotonically with beta and Q; output labelled model, with zhang2019nat (> 900 lines at about 10 GHz) as a reported reference marker, not a fit |

## F6.11 Transducer efficiency vs year

| Item | Spec |
|---|---|
| Question | How far have LN microwave-to-optical transducers come, and at what temperature? |
| Model | None (data plot). Input rows from manuscript 6.7 transducer table: value, definition (total / internal / on-chip), mechanism (cavity EO, piezo-optomechanical, bulk LN EO), temperature class (cryogenic / room), year, ref id |
| Outputs | log10 efficiency vs year; marker shape = mechanism, fill = temperature class (pattern, not color only); hover card = conditions + DOI |
| TECH | Mono scatter; definition column as a tag in hover |
| VISUAL | Same scatter, markers as small device glyphs (ring, phononic crystal, WGM disk) |
| Moment of joy | Toggling "total efficiency only" removes internal values and shows the honest trend |
| Readouts | hover card fixed 360 x 140 px, anchored, not cursor-following |
| Acceptance | 8 points; xu2021nc shows 1.02% total and 15.2% internal as two linked markers; sahu2022nc labelled "bulk LN (not thin film)"; log toggle default on (data span 6.6e-6 to 8.7%) |

## F6.12 IDT and SAW across a waveguide

| Item | Spec |
|---|---|
| Question | How does a voltage on comb electrodes make a sound wave that modulates light? |
| Model | Acoustic wavelength = v / f; IDT period = acoustic wavelength (single-electrode, two fingers per period); v from chapter 03 SAW data (Christoffel solver, PHY) for the chosen cut, or a template value badged `template` until chapter 03 supplies a sourced velocity; photoelastic index change sign shown qualitatively |
| Inputs | frequency 0.5-6 GHz; cut picker (values from chapter 03 only) |
| Outputs | Top view: IDT fingers at the computed pitch, wave crests crossing a waveguide; readouts `lambda_ac` `%6.3f um`, `pitch` `%6.3f um` |
| TECH | ASCII-style top view, static; readouts |
| VISUAL | Ukiyo-e ripple lines (chapter 03 art direction) launched from Au fingers; the waveguide (1550 nm dashed false color) brightens and dims with crest passage when data-fx is on |
| Moment of joy | Doubling the frequency halves the finger pitch on screen at true relative scale |
| Readouts | 2 fields, 24 ch; drawing canvas fixed 640 x 240 (VISUAL), 480 x 160 (TECH) |
| Acceptance | pitch = v / f exactly for the chosen v; no velocity value shown without a chapter 03 source or a template badge; no layout shift across frequency range |
