# 06 Devices: manuscript

| Field | Value |
|---|---|
| Chapter | 06 Devices |
| As of | 2026-10-25 |
| Lane | C06 (DevLog-004) |
| Inputs | research R03, R04, R08, R12, R14; eo-modulator-atlas at commit `eb97f961165a331599e8191c62e15b5a52ba1d51` (2026-10-20); Crossref records fetched 2026-10-25 (no mailto or personal parameter) |
| Companion files | `figures.md` (F6.01-F6.12), `chart-specs.md` (atlas charts A1-A7), `refs.yaml`, `glossary.yaml`, `open-questions.md` |

## Conventions used in this file

- Source tag after a number: `{status | ref-id | ver}`. `status` uses the DevLog-004 vocabulary: `P` (primary read), `P-comp` (read in a compilation that names the primary), `reported` (value as the authors report it), `derived` (computed here or by the site, formula given), `template` (declared illustrative input, holds no data), `U` (unverified; never shown as fact). `ref-id` keys into `refs.yaml`. `ver` is the R08 verification code for literature numbers: `Y` (number in the Crossref/publisher abstract), `Y(arXiv)`, `Y(conf)`, `Y(preprint)`, `atlas` (eo-modulator-atlas row with evidence locator; `device_id` given).
- Atlas values carry their `device_id`. Bounds from the atlas `qualifiers` column are written with `>` or `<` and are drawn as bounds, never as points.
- "Highest found" means highest found in the R08 literature pass (budget-limited, 2026-10-24) or in the atlas sample at the pinned commit. It is never written as "record" on the page without the date stamp.
- L1 = phenomenon, lay-readable, one interactive. L2 = quantitative model, equations, data. L3 = how it is computed or measured, conventions, error sources.
- Plain citations without a number are written `[ref-id]`.
- Figure placements are marked `[[F6.nn]]` and specified in `figures.md`; atlas charts are `[[A#]]` in `chart-specs.md`.
- Page copy is everything outside blocks marked `Editorial note (not page copy)`.

---

## 6.0 Chapter opener

### L1

Definition block. **Lithium niobate devices** — chips and crystals that turn a voltage, a sound wave, or one color of light into a change of another light wave. The same crystal writes data onto fiber, doubles laser frequencies, filters radio signals in phones, and squeezes quantum noise.

Door art (VISUAL): MZI line drawing with Au G-S-G electrodes and 1550 nm light in declared false color (DevLog-003b sec. 5).

[[F6.01]] Device map: one row per device family; columns = physical effect used (Pockels, chi(2), chi(3), piezoelectric, acousto-optic, heterogeneous gain/absorption); each cell links to its section.

### L2: device families and maturity

Dated maturity evidence; "commercial" requires a dated company statement, otherwise "research".

| Family | Effect | Maturity (dated evidence) | Section |
|---|---|---|---|
| Bulk Ti-indiffused / proton-exchanged LN modulators | Pockels | Commercial; Exail (formerly iXblue) states it has made LN modulators since 2000 (R09 S37) | 6.1 |
| TFLN MZM and IQ modulators | Pockels | Commercial: AFR TFLN 96/130 GBd coherent driver modulators "reached volume shipment" (R09 S31); HyperLight 200 G/lane products available, 400 G/lane sampling (R09 S18); Murata TFLN EO modulator (">100 GHz", "400 Gbps/ch PAM4") shown as a product in development at OFC 2026 `{V | murata2026 | -}` | 6.1-6.3 |
| PPLN frequency converters (bulk, waveguide) | chi(2) QPM | Bulk MgO:PPLN commercial (R09 S41); TFLN PPLN research | 6.4 |
| OPA / OPO on TFLN | chi(2) | Research | 6.5 |
| EO and Kerr combs, EO frequency shifters | Pockels, chi(3) | Research | 6.6 |
| Squeezers, pair sources, quantum frequency converters | chi(2) | Research; Xanadu's Aurora system used the HyperLight TFLN platform (R09 S53) [aghaeerad2025] | 6.7 |
| Microwave-optical transducers | Pockels, piezo-optomechanics | Research (mK and room temperature) | 6.7-6.8 |
| Acousto-optic modulators and frequency shifters | piezoelectric + photoelastic | Research | 6.8 |
| RF acoustic filters (SAW, POI, XBAR) | piezoelectric | Commercial, high volume; LT appears dominant for SAW (inference from product pages; no public share figure), see 6.9 | 6.9 |
| Heterogeneous lasers, amplifiers, detectors on TFLN | III-V gain, Er3+ gain, InP/Si absorption | Research | 6.10 |
| Thin-film lithium tantalate (TFLT) devices | Pockels, chi(2) | Research; earliest TFLT modulator paper in the eo-modulator-atlas sample: 2024 | 6.11 |

---

## 6.1 Electro-optic modulators

### L1

A modulator is an interferometer whose arms are built in a Pockels crystal. A voltage across one or both arms changes the refractive index, shifts the phase of the light in that arm, and moves the output between bright and dark. Thin-film LN confines light to a sub-micron ridge, so the gold electrodes can sit a few microns apart (median gap 5.0 um over 144 TFLN device rows `{derived | atlas | atlas}`); the same index change then needs a few volts, and the electrodes can carry a microwave signal along the chip at nearly the speed of the light.

[[F6.02]] Modulator bench: illustrated MZM top view (two arms, G-S-G push-pull electrodes, 1550 nm light), transfer curve T(V), and an eye diagram driven at the chosen symbol rate.

Control text for F6.02: drag the bias; set drive swing and symbol rate; switch NRZ / PAM4.

### L2: transfer function and half-wave voltage

Mach-Zehnder intensity transfer (lossless, balanced splitters):

T(V) = (1/2) [1 + cos(pi V / V_pi + phi_b)]

- V_pi is the voltage that moves T from maximum to minimum; phi_b is the static bias phase.
- Push-pull drive puts opposite fields in the two arms; one signal electrode between two grounds (G-S-G) does this on x-cut film. For the same electrode, the push-pull MZM V_pi is half the single-arm phase-shifter V_pi.
- IQ modulator: two MZMs nested in an outer interferometer with a 90-degree phase between them; each child MZM is biased at null.

Half-wave voltage-length product for an x-cut film, TE mode, field along the crystal z axis:

V_pi L = lambda g / (2 n_e^3 r33 Gamma)   (push-pull MZM)

- g: electrode gap; Gamma: overlap between the normalized optical intensity and the applied field E_z (Gamma = (g/V) integral of E_z |E_opt|^2 dA / integral of |E_opt|^2 dA). The full tensor overlap is evaluated by the eo-modulator-atlas FEM engine (chapter 2.2, L3).
- Worked value: lambda = 1.55 um, g = 5 um `{template}`, Gamma = 0.5 `{template}`, n_e = 2.1376 at 1550 nm, 21 C `{derived | zelmon1997 | -}`, r33^S = 30.8 pm/V at 633 nm `{P-comp | weis1985 | -}` (Turner 1966 via Weis and Gaylord Table 4): V_pi L = 2.58 V cm `{derived}`.
- r33 choice moves the result: the Kaminow 1980 value 28.8 pm/V `{P-comp | weis1985 | -}` gives 2.75 V cm `{derived}` (+7%). No primary r33 measurement at 1550 nm is available; the 633 nm clamped value is used.
- Atlas cross-check: median telecom push-pull V_pi L for TFLN MZM/IQ device rows is 2.44 V cm (n = 66 rows) `{derived | atlas | atlas}`: eo-modulator-atlas device rows at commit eb97f96, telecom band, push-pull convention, MZM and IQ.

[[F6.03]] Cross-section V_pi L calculator: sliders for gap g, overlap Gamma, wavelength, r33 source; readout V_pi L; atlas rows plotted as implied overlap Gamma_implied = lambda g / (2 n_e^3 r33 V_pi L) against gap.

Implied overlap from the atlas (derived): over 71 x-cut TFLN push-pull MZM/IQ device rows with gap, wavelength, and V_pi L, Gamma_implied spans 0.15 to 6.12, with 45 of 71 rows between 0.45 and 0.67 `{derived | atlas | atlas}`. Values above 1 are not physical overlaps; 8 rows exceed 1 and mark devices outside the lateral-gap model or its inputs: four operating points of the Shen 2024 slow-light MZM (6.12, 3.21, 1.84, 1.31), two Yu 2024 devices that claim a material enhancement (1.33, 1.47), and two Xue 2026 devices (1.03, capacitively loaded, thick silica buffer). The formula assumes the 633 nm clamped r33 at all wavelengths and Zelmon n_e at the row wavelength.

### L2: modulator families

| Family | How it works | Atlas TFLN device rows (by electrode type or device class) | Representative device, values |
|---|---|---|---|
| Lumped electrode | Electrode shorter than the RF wavelength; RC-limited | lumped 26 | Wang 2018 (Opt. Express) rings; see the ring table below |
| Traveling-wave CPW / GSG | Electrode is a transmission line co-propagating with the light | GSG 72, CPW 20, GSSG 8 | CMOS-compatible drive, up to 210 Gb/s, on-chip loss < 0.5 dB `{reported | wang2018nat | Y}` |
| Capacitively loaded (T-rail) traveling wave | Small T-shaped segments reach toward the waveguide; current flows in rails away from the gap | capacitively loaded 32 | RF V_pi 1.3 V with 1.8 dB roll-off at 50 GHz `{reported | kharel2021 | Y}` |
| Slow-wave electrode | Periodic loading raises the RF index to match a high optical group index | slow wave 15 | 0.21 V cm, 1 mm, slow-light SiN-loaded TFLN, bandwidth > 110 GHz `{reported | shen2024lpr | Y; atlas shen2025-a}` |
| Ridge-top transparent electrodes | Conductive oxide on the ridge, field across the film | not counted (no atlas class) | 0.33 V cm, 300 um; 2.4 dB roll-off at 110 GHz; 3 dB bandwidth 145 GHz extrapolated; on-chip IL 2.7 dB `{reported | yu2025oe | Y}` |
| IQ modulator | Nested MZMs | IQ 10 | dual-polarization IQ, sub-1-V drive, 110 GHz, 1.96 Tb/s net single wavelength `{reported | xu2022optica | Y}` |
| Ring / photonic-crystal resonator | Resonance shifted by Pockels effect; photon lifetime limits speed | ring 15, other resonator 16 | see below |
| Heterogeneous Si or SiN + bonded LN | Light in Si/SiN, mode partly in LN; LN unetched | bonded heterogeneous 26 (all TFLN rows) | 110 GHz, 110 mW optical power, hybrid Si-LN `{reported | valdez2022 | title (numbers in title)}`; Si/LN MZM for 100 Gbit/s `{reported | he2019np | title (numbers in title)}` |

Counts: 209 TFLN device rows at atlas commit eb97f96 `{derived | atlas | atlas}`; 31 rows have no electrode type.

### L2: ring and photonic-crystal modulators

Resonance shift per volt: Delta lambda = lambda Delta n_eff / n_g. A resonator stores light for the photon lifetime tau = Q_L / omega_0, so its modulation response rolls off on the scale of the linewidth Delta nu = nu_0 / Q_L; the exact factor depends on detuning.

| Device | Q_L | 3 dB bandwidth | Note | Source |
|---|---|---|---|---|
| TFLN ring, Q 5,700 | 5,700 | 40 GHz | | `{reported | wang2018oe | atlas wang2018-rt-q5p7k}` |
| TFLN ring, Q 8,000 | 8,000 | 30 GHz | Q approximate in source | `{reported | wang2018oe | atlas wang2018-rt-q8k}` |
| TFLN ring, Q 18,000 | 18,000 | 11 GHz | | `{reported | wang2018oe | atlas wang2018-rt-q18k}` |
| PhC cavity | 14,000 (approx.) | 17.5 GHz (approx.) | photonic-crystal modulator | `{reported | li2020nc | atlas li2020-b}` |
| Topological PhC, 64 um electrode | 2,200 | > 110 GHz | 220 GBd NRZ eye | `{reported | chen2025lpr | atlas chen2025-a}` |

The Lorentzian linewidth nu_0/Q_L at 1550 nm is 34 GHz for Q_L = 5,700 and 10.7 GHz for Q_L = 18,000 `{derived}`; measured bandwidths can exceed it when the device is operated detuned (atlas note on `zhang2023-b`: headline 104 GHz at the -8 dB detuning point, authors' photon-lifetime limit 35 GHz).

[[F6.07]] Ring modulator: transmission vs detuning, voltage shifts the dip, Q slider; readout of linewidth and photon-lifetime limit; atlas ring and resonator rows plotted as bandwidth vs Q_L with the nu_0/Q_L line.

### L3: how V_pi and bandwidth are measured, and why papers disagree

- Convention. V_pi can be quoted per phase-shifter arm, for a push-pull MZM, or as a differential (V+ minus V-) value; these differ by factors of 2. Values are kept in the convention each paper states; none are converted. Example: the authors of `aimone2026-a` quote 1.1 V cm (differential reference); 3.26 V x 7.5 mm gives 2.45 V cm `{derived | atlas | atlas aimone2026-a}`.
- Frequency. V_pi measured below 1 GHz (DC, kHz or MHz triangle) and at RF differ: below about 20 kHz, charge relaxation in TFLN enhances the low-frequency response (relaxation-enhanced band 1-20 kHz, response measured 1 mHz to 1 MHz) `{reported | holzgrafe2024 | Y}`. V_pi values are split at 1 GHz into DC and RF values.
- Bandwidth reference. "3 dB EO bandwidth" is 20 log10 of the detected modulation amplitude relative to a stated reference (DC, 1 GHz, or an unstated low-frequency plateau). Methods differ: VNA/LCA EO S21, optical sideband ratio, link EOE response.
- Instrument limits. 67 of 145 TFLN/TFLT bandwidth values in the atlas are lower bounds ("over 67 GHz", "over 110 GHz"); the most frequent bound values are 110 GHz (15 rows), 67 GHz (13), 50 GHz (12) `{derived | atlas | atlas}`. Medians over bounded data understate true bandwidth.
- Extrapolation. Several headline bandwidths are extrapolated beyond the measured range (e.g. 220 / 218 GHz for C / O band at 7 mm, extrapolated `{reported | liu2025lpr | Y}`). Extrapolated bandwidths are a separate class from measured ones.
- Disclosure. Of 209 TFLN device rows, V_pi L is stated or derivable in 64%, 3 dB bandwidth in 60%, on-chip insertion loss in 25%, RF loss in 11%, Z0 in 10%, n_RF in 10% `{derived | atlas | atlas}`.

---

## 6.2 Traveling-wave design: velocity, impedance, RF loss

### L1

At 100 GHz the drive signal on the chip has a wavelength of about 1.4 mm (c / (f n_RF) with n_RF = 2.2 `{derived}`), shorter than the electrode. The electrode is therefore a transmission line: the microwave and the light race down the chip together. If they travel at the same speed and the microwave does not fade, every slice of the electrode adds phase in step, and the modulator stays fast however long it is.

[[F6.04]] Traveling-wave response: sliders for RF index n_RF, optical group index n_g, RF loss, line impedance Z0, source and load impedance, electrode length; EO response from 0 to 300 GHz with the 3 dB point read out.

### L2: model

Voltage on a line with propagation constant gamma = alpha + j omega n_RF / c, load reflection Gamma_L = (Z_L - Z0)/(Z_L + Z0), source reflection Gamma_S = (Z_S - Z0)/(Z_S + Z0):

V(z) = V+ [exp(-gamma z) + Gamma_L exp(-2 gamma L) exp(gamma z)],  V+ = V_S Z0/(Z0 + Z_S) / (1 - Gamma_S Gamma_L exp(-2 gamma L))

The light sees the voltage at the time it reaches z, t = t0 + n_g z / c. The modulation it accumulates, normalized to the electrode length:

m(f) = V+ [ (1 - exp(-u+ L)) / (u+ L) + Gamma_L exp(-2 gamma L) (exp(u- L) - 1) / (u- L) ],  u+ = alpha + j omega (n_RF - n_g)/c,  u- = alpha + j omega (n_RF + n_g)/c

EO response (dB) = 20 log10 |m(f) / m(0)|, with m(0) = V_S Z_L / (Z_S + Z_L). `{derived}` from transmission-line theory; the model class is the one in Chung, Chang, Adler 1991 [chung1991] and Alferness 1982 [alferness1982].

Single-effect limits (derived here from the matched-load form, Z_S = Z_L = Z0):

| Limit | Condition | 3 dB point |
|---|---|---|
| Velocity mismatch only (alpha = 0) | |sin x / x| = 1/sqrt(2) at x = pi f L |n_RF - n_g| / c = 1.392 | f_3dB L = 0.443 c / |n_RF - n_g| `{derived}` |
| RF loss only (n_RF = n_g) | (1 - exp(-a)) / a = 1/sqrt(2) at a = alpha L = 0.738 Np | total electrode RF loss at f_3dB = 6.4 dB `{derived}` |

Worked numbers `{derived}`, using the `chen2022-c` device (capacitively loaded, n_RF 2.35, n_g 2.2, Z0 50.5 ohm, RF loss 2.947 dB/cm at 67 GHz, L = 10 mm) `{reported | atlas chen2022-c}`:
- Velocity term alone: f_3dB = 0.443 c / (0.15 x 10 mm) = 88.5 GHz.
- Loss term alone, loss scaling as sqrt(f): 6.4 dB is reached at 67 GHz x (6.4 / 2.947)^2 = 317 GHz.
- Reported 3 dB bandwidth: > 67 GHz (bound) `{reported | atlas chen2022-c}`.

Design levers:
- Velocity. In a quasi-TEM line n_RF = c sqrt(L' C') and Z0 = sqrt(L' / C'); adding capacitance per length (T-rail loading) raises n_RF and lowers Z0 together. Of 28 TFLN/TFLT device rows that report both indices, 23 have |n_RF - n_g| <= 0.10; the others are `chen2022-c` (0.15), `renaud2023-3um-738` (0.16), `mao2022-a` (0.28), `lin2026a-a` (0.50, lumped), `chen2023-a` (n_g 4.0, approx.) `{derived | atlas | atlas}`.
- RF loss. Narrow gaps raise conductor loss; T-rail segments keep the rails wide while bringing the field close to the waveguide `{reported | kharel2021 | Y}`. Low-k underfill was used to reduce RF loss and reach velocity matching with a narrow gap `{reported | liu2025lpr | Y}`.
- Impedance. A source at 50 ohm into a lower-Z0 line divides the voltage; load mismatch adds a counter-propagating wave whose contribution averages out once omega (n_RF + n_g) L / c >> 1.

[[A2]] Velocity-matching map: atlas n_RF vs n_g (28 TFLN/TFLT device rows), diagonal n_RF = n_g, marker by electrode type.

### L2: slow light and loaded electrodes

In a slow-light waveguide the phase from a given index change grows with the optical group index, which lowers V_pi L; the electrode must then slow the microwave to the same group velocity. A 1 mm SiN-loaded TFLN MZM with slow-light waveguides and capacitively loaded slow-wave electrodes reached 0.21 V cm with bandwidth > 110 GHz `{reported | shen2024lpr | Y; atlas shen2025-a}`.

### L3

- Atlas RF fields: RF index, optical group index, Z0, and RF loss in power dB/cm at a stated frequency (amplitude coefficients converted). A cross-section's RF index and impedance are not the effective values of a periodically loaded line, so cross-section values do not give the loaded-line n_RF or Z0.
- Measured RF loss is usually quoted at one frequency; the sqrt(f) scaling (conductor skin effect) is a model assumption, and dielectric loss scales as f.
- Instrument roll-off, probe and cable de-embedding, and the photodiode response enter measured EO S21 and are removed by the authors with stated or unstated calibrations.

---

## 6.3 The V_pi L, bandwidth, footprint trade

### L1

Low voltage, wide bandwidth, small size: each dot below is one measured device from the literature, placed by its voltage-length product and its bandwidth; arrows mark bandwidths that ran past the instrument.

[[A1]] V_pi L vs 3 dB bandwidth by platform, year slider, bounds as arrows.

### L2: what the atlas sample shows

Statistics over eo-modulator-atlas rows at commit eb97f96: telecom band (O, C, L, CL), MZM and IQ device rows; V_pi L only for the push-pull convention `{derived | atlas | atlas}`.

| Platform | Papers / rows | V_pi L n / median / min (V cm) | BW n / median / max (GHz) | Share of BW values that are bounds | Median electrode length (mm) |
|---|---|---|---|---|---|
| TFLN | 46 / 88 | 66 / 2.44 / 0.21 | 67 / >= 70 / 170 | 0.42 | 6.4 |
| TFLT | 15 / 21 | 17 / 2.43 / 1.36 | 10 / >= 85 / 110 | 0.40 | 7.5 |
| SiPh (carrier depletion) | 14 / 25 | no push-pull rows | 21 / >= 66 / 110 | 0.29 | 0.9 |
| InP | 6 / 12 | 3 / 0.70 / 0.60 | 9 / >= 67 / 100 | 0.44 | 4.0 |
| BTO | 7 / 9 | 2 / 0.72 / 0.72 | 5 / >= 70 / 110 | 0.20 | 1.38 |
| Polymer (incl. SOH/POH) | 12 / 36 | 9 / 0.09 / 0.04 | 8 / >= 80.3 / 110 | 0.12 | 0.28 |


Atlas-sample statistics (not field-wide):
- Median telecom TFLN V_pi L stayed between 1.23 and 2.92 V cm per year from 2018 to 2026, while the highest symbol rate per year rose from 100 GBd (2018) to 225 GBd (2026) `{derived | atlas | atlas}`.
- The 170 GHz maximum is one row (`zhang2022-a`, sideband method, V_pi convention unspecified) whose bandwidth comes from an experimentally verified model with measurements to 325 GHz `{reported | zhang2022prj | Y}`.
- The 0.21 V cm minimum is one 1 mm slow-light device (`shen2025-a`).
- Footprint is the TFLN cost: median electrode length 6.4 mm vs 0.9 mm for SiPh, 1.38 mm for BTO, 0.28 mm for polymer `{derived | atlas | atlas}`.

[[A4]] Footprint: V_pi vs electrode length with iso-V_pi L lines.
[[A5]] V_pi L vs wavelength (TFLN, TFLT): visible devices reach lower V_pi L because V_pi L scales with lambda / n^3 and the gap shrinks with the mode.

| Visible / near-IR device | V_pi L | Wavelength | Source |
|---|---|---|---|
| TFLN MZM | 0.17 V cm (V_pi 0.21 V, 8 mm) | 450 nm | `{reported | xue2023 | atlas xue2023-c}` |
| TFLN MZM | 0.55 V cm, bandwidth > 35 GHz | 738 nm | `{reported | renaud2023 | Y}` |
| TFLT MZM | 0.085 V cm (V_pi 4.2 V, 0.2 mm, lumped) | 375 nm | `{reported | atlas lin2026a-a | Y(preprint)}` |

### L3

- Sample, not census: 233 papers from web search, author-group follow-up, landmark papers and OFC 2026 proceedings; 95 are from 2026, 54 from OFC 2026.
- Paper year is the year of the earliest version (arXiv v1); the Shen slow-light MZM carries 2024.
- Bounds: arrows start at the stated value; medians include bounds at their stated values and are printed as "median >= x" when any input is a lower bound.

---

## 6.4 Frequency converters: PPLN SHG, SFG, DFG

### L1

A periodically poled crystal flips its polarization every few microns so that light at one color keeps feeding light at twice the frequency instead of cancelling it. In a thin-film waveguide the light is squeezed into a cross-section about a micron wide; one such waveguide converted more than 80% of a 20 mW pump in a single pass `{reported | chen2024nn | Y(arXiv)}`.

[[F6.08]] SHG converter: pump power and length sliders; output power from the undepleted law to the depleted tanh^2 law; poling period computed from dispersion; data points from TFLN devices.

### L2

- Undepleted: P_2w = eta_norm L^2 P_w^2. Depleted (perfect phase matching, lossless): P_2w = P_w tanh^2(sqrt(eta_norm P_w) L) `{derived}`.
- QPM period for SHG: Lambda = lambda_w / (2 (n_2w - n_w)) with effective indices of the waveguide modes; bulk values from Sellmeier (chapter 02).
- Consistency check `{derived}`: an overall efficiency near 10^4 %/W (eta L^2 = 100 W^-1) gives tanh^2(sqrt(100 x 0.020)) = 79% at 20 mW, matching "over 80% at 20 mW" `{reported | chen2024nn | Y(arXiv) 2307.11671}`.

| Device | Value | Conditions | Source |
|---|---|---|---|
| PPLN nanowaveguide | 2,600 %/W/cm^2 | 1.5 um pump, 4 um period | `{reported | wang2018optica | Y}` |
| Adapted poling | near 10^4 %/W overall, single pass; > 80% conversion at 20 mW | TFLN waveguide | `{reported | chen2024nn | Y(arXiv)}` |
| Double-layer, polarization-reversed | 9,600 %/W/cm^2 measured; 85% absolute at high power | highest normalized TFLN waveguide value in the papers cited here (to 2026-10-24) | `{reported | li2024apn | Y}` |
| Blue SHG | 33,000 %/W/cm^2 | blue output | `{reported | park2022ol | Y}` |
| Mid-IR DFG, LN on sapphire | 200 %/W/cm^2, out to 3.66 um | | `{reported | mishra2021 | Y}` |
| z-cut PPLN microring | 250,000 %/W; 15% absolute at 115 uW | | `{reported | lu2019optica | Y(arXiv)}` |
| PPLN microring | 5,000,000 %/W | d33 via QPM | `{reported | lu2020optica | Y}` |

Normalized waveguide efficiency (%/W/cm^2) and resonant efficiency (%/W) are different quantities and are plotted on separate axes.

### L3

- eta_norm depends on the mode overlap, d_eff = (2/pi) d33 for 50% duty first-order QPM, and the absolute d33 scale (Shoji et al. 1997 vs older values).
- Thin-film thickness variation shifts the phase-matching wavelength along the device; adapted poling compensates measured local phase-matching variation `{reported | chen2024nn | Y(arXiv)}`.
- Output power of TFLN SHG is commonly limited to tens of mW by optical damage (Kuznetsov, Li, Kippenberg, arXiv 2512.07968) `{reported | kuznetsov2025arxiv | Y(preprint)}`.

---

## 6.5 Optical parametric amplifiers and oscillators

### L1

Run frequency doubling backwards: a strong pump splits into two lower-energy photons, amplifying a weak signal. Put that gain inside a ring and it oscillates once gain beats loss, producing tunable light at colors no laser diode emits.

[[F6.09]] OPO threshold: ring Q and nonlinear coupling sliders; threshold readout; pump above threshold starts oscillation; device points.

### L2

| Device | Value | Source |
|---|---|---|
| Dispersion-engineered PPLN OPA, fs pump | > 50 dB/cm phase-sensitive gain (6 mm); > 100 dB/cm over 600 nm near 2 um | `{reported | ledezma2022 | Y}` |
| Quasi-static OPA | 71 dB (118 dB/cm) unsaturated, 1700-2700 nm, 4 pJ pump; 88 dB (> 146 dB/cm) saturated | `{reported | jankowski2022 | Y}` |
| CW ring OPO | threshold about 30 uW; 11% conversion at 93 uW | `{reported | lu2021optica | Y(arXiv)}` |
| CW microdisk OPO (PLACE) | threshold 19.6 uW | `{reported | gao2021njp | Y}` |
| Ring SHG + OPO | threshold tens of uW; tuning over 1 THz with pump detuning of hundreds of MHz | `{reported | mckenna2022 | Y}` |
| Pulsed tunable OPO | 1.53-3.25 um on one chip | `{reported | ledezma2023 | Y}` |
| fs OPO comb | 1.5-3.3 um | `{reported | roy2023 | Y}` |
| Mid-IR OPO, LN on sapphire | > 25 mW at 3.2 um; 15% power, 45% quantum efficiency | `{reported | hwang2023 | Y(arXiv)}` |
| Electrically tuned mid-IR OPO | 22 THz span, 2.7-3.4 um | `{reported | hwang2026 | Y(arXiv)}` |
| FM-OPO comb | > 93% internal pump-to-comb (34% out-coupled), about 200 modes | `{reported | stokowski2024 | Y}` |
| All-optical switching | tens of fJ, 18 fs | `{reported | guo2022np | Y(arXiv)}` |

### L3

- In the coupled-mode model the OPO threshold falls with the square of the nonlinear coupling rate and with the resonator quality factors (derivation: chapter 2.4). Reported thresholds are on-chip pump powers with coupling loss removed, as stated by each paper.
- Gain in dB/cm from fs pumps is a peak-power figure; it is not comparable to CW gain.

---

## 6.6 Frequency combs and frequency shifters

### L1

A comb is light made of many evenly spaced colors. Drive a low-loss LN ring with a microwave at exactly its round-trip frequency and each pass adds sidebands, building hundreds of lines; pump a ring hard enough and the Kerr effect forms a soliton whose spectrum is a comb.

[[F6.10]] Resonant EO comb: modulation index and ring loss sliders; comb spectrum on a log axis; line-count readout.

### L2

| Device | Value | Source |
|---|---|---|
| Resonant EO comb, microring | > 900 lines at about 10 GHz, wider than the L band | `{reported | zhang2019nat | Y}` |
| Coupled-ring EO comb | 30% efficiency, 132 nm span, 336 fs | `{reported | hu2022np | Y(arXiv)}` |
| EO time-lens pulse source | 520 fs, 30 GHz, 0.54 pJ | `{reported | yu2022nat | Y}` |
| EO comb in TFLT (not LN) | > 450 nm (> 60 THz), > 2,000 lines, triply resonant | `{reported | zhang2025nat | Y}` |
| EO frequency shifter (coupled rings) | up to 28 GHz at about 90% on-chip efficiency; cascaded 119.2 GHz from 29.8 GHz drive | `{reported | hu2021nat | Y}` |
| Acousto-optic frequency shifter | 3 GHz, > 30 dB carrier suppression | `{reported | shao2020oe | Y}` |
| First LN Kerr soliton | self-starting, bidirectional switching via photorefraction | `{reported | he2019optica | Y(arXiv)}` |
| Near-octave soliton | 4/5 octave, 335 GHz repetition rate | `{reported | gong2020 | Y}` |
| Octave-spanning soliton | octave, Raman suppressed | `{reported | song2024lsa | Y}` |
| Photorefraction-assisted soliton | single soliton > 13 h without feedback | `{reported | wan2024lpr | Y}` |

### L3

- EO comb line power falls off with line index at a slope set by round-trip loss relative to modulation index; dispersion limits the span. The figure uses the round-trip recursion of a ring phase-modulated at one FSR [zhang2019nat].
- The n2 of LN tabulated in Zhu 2021 has no traced primary measurement; no n2 value is given.

---

## 6.7 Quantum devices: squeezers, pair sources, converters, transducers

### L1

Quantum light needs low loss and strong nonlinearity on the same chip. TFLN waveguides squeeze the noise of light below the vacuum level, make entangled photon pairs, and convert single photons between colors. With a superconducting circuit nearby, the Pockels effect or a sound wave can turn microwave photons from a quantum processor into optical photons for fiber.

[[F6.11]] Transducer efficiency vs year (log axis), by mechanism (cavity EO, piezo-optomechanical, bulk LN EO), temperature class marked.

### L2: squeezing, pairs, conversion

| Device | Value | Source |
|---|---|---|
| On-chip squeezing, TFLN | 4.9 dB measured, > 25 THz | `{reported | nehra2022 | Y}` |
| Single-pass squeezing | 0.56 dB measured | `{reported | chen2022ol | Y}` |
| OPO squeezing, on-chip SHG pump | 0.55 dB squeezing, 1.55 dB anti-squeezing | `{reported | park2024sa | Y}` |
| Bulk-bonded PPLN ridge (not TFLN), comparison | 8.3 dB, CW | `{reported | kashiwazaki2023 | Y}` |
| Pair source, PPLN waveguide | CAR > 67,000; heralded g2(0) < 0.025 | `{reported | zhao2020prl | Y}` |
| Pair source, PPLN microring | 36.3 MHz pair rate at 13.4 uW; CAR up to 14,682; g2(0) = 0.008 | `{reported | ma2020prl | Y}` |
| Quantum frequency conversion, telecom to near-visible | 73% internal, 900 counts/s noise | `{reported | wang2023npjqi | Y(arXiv)}` |

### L2: microwave-optical transducers

| Device | Efficiency | Conditions | Source |
|---|---|---|---|
| TFLN cavity EO | 2.7e-5 | | `{reported | holzgrafe2020 | Y(arXiv)}` |
| Triply resonant LN on sapphire | 6.6e-6 on chip | cryogenic | `{reported | mckenna2020 | Y}` |
| TFLN + superconducting resonator, EO | 1.02% total (15.2% internal), bidirectional | cryogenic | `{reported | xu2021nc | Y}` |
| Piezo-optomechanical, room temperature | 5.5% with 323 uW blue-detuned pump; acousto-optic V_pi 0.02 V | room temperature | `{reported | jiang2020nc | Y(arXiv)}` |
| Optically heralded microwave photon addition | 5% CW conversion; 15 Hz heralding | cryogenic | `{reported | jiang2023np | Y(arXiv)}` |
| Integrated interface, LN-on-Si mechanics | 0.9% at 1 uW; 14.8 MHz bandwidth | cryogenic | `{reported | weaver2024nn | Y}` |
| Optical control of a superconducting qubit, TFLN EO | up to 1.18% | cryogenic | `{reported | warner2025np | Y(arXiv)}` |
| Bulk LN whispering-gallery EO (not thin film) | 8.7% at 0.16 added noise photons | cryogenic | `{reported | sahu2022nc | Y}` |

Air-clad TFLN raised the sustainable intracavity pump power at cryogenic temperature by suppressing the photorefractive effect `{reported | xu2021nc | Y}`.

### L3

- Squeezing: measured vs inferred (loss-corrected) values differ by several dB; only measured values are tabulated.
- Transducer efficiency definitions differ (total, internal, on-chip, photon-number); added noise matters as much as efficiency; cryogenic and room-temperature devices are marked separately.

---

## 6.8 Acousto-optic and optomechanical devices

### L1

LN is piezoelectric: a voltage on comb-shaped electrodes launches a sound wave across the chip. The sound wave strains the crystal, which changes its refractive index, so a gigahertz sound wave can modulate or frequency-shift light.

[[F6.12]] IDT launches a SAW across a waveguide; frequency slider changes the acoustic wavelength (v / f); hover reads the photoelastic index change direction.

### L2

| Device | Value | Source |
|---|---|---|
| Suspended TFLN AO modulator, room temperature | up to 4.5 GHz; V_pi 0.77 V (racetrack); g0/2pi 1.1 kHz | `{reported | shao2019optica | Y(arXiv)}` |
| LN optomechanical crystal | g0/2pi about 120 kHz; phonon lasing | `{reported | jiang2019optica | Y(arXiv)}` |
| AO modulator, LN on sapphire | first unsuspended devices | `{reported | sarabalis2020 | Y}` |
| AO modulator, TFLN + chalcogenide, unsuspended | V_pi L 0.03 V cm | `{reported | wan2022lsa | Y}` |
| AO frequency shifter | 3 GHz, > 30 dB carrier suppression | `{reported | shao2020oe | Y}` |
| LN phononic resonator + superconducting qubit | phonon-number splitting about 5x qubit linewidth | `{reported | arrangoiz2019 | Y}` |
| Entangled mechanical resonators (LN) | state tomography | `{reported | wollack2022 | Y}` |

### L3

- M2 of LN: no primary value is available (the Uchida and Niizeki compilation value is unverified).
- AO V_pi L (acoustic drive) and EO V_pi L (Pockels drive) share a unit but not a mechanism; they are not comparable.

---

## 6.9 RF acoustic filters

### L1

A phone picks its radio bands out of the air with tiny acoustic filters; a 2018 count put more than 50 in a mid- to high-tier 4G phone (R09 S50). Many are surface-acoustic-wave filters on a lithium tantalate or lithium niobate crystal; the comb electrodes set the frequency. LT appears to dominate SAW filters (inference from product pages; no public share figure) `{E}`; bulk-acoustic-wave (BAW) filters use aluminum nitride, not LN `{E | R09 sec. 5 caveat; no primary source listed}`.

### L2

| Fact | Status | Source |
|---|---|---|
| SAW filters are built on piezoelectric LT or LN substrates; 128-degree Y LN and 36-50-degree rotated Y LT are standard cuts; 4" and 6" wafers | company page | R09 S3 |
| Shin-Etsu's piezo crystal page lists LT only | company page | R09 S4 |
| Soitec POI (piezo-on-insulator) is offered as LT (LT6 150 mm, LT8 200 mm) and LN (LN6 150 mm) | company page | R09 S10 |
| XBAR: 400 nm ZY-LN platelet, resonance about 4,800 MHz, coupling about 25%, resonance Q about 300 | reported | [plessky2019] |
| Murata states its high-frequency filters use LiNbO3 | company statement | [murata2026] |
| Filters per phone: "> 50" in mid/high-tier 4G phones, "> 70" expected with 5G (2018) | trade press | R09 S50 |
| LT vs LN share of SAW filter volume | N/A: no public quantitative source found | - |

[[F6.12]] is shared with 6.8 (IDT and SAW).

### L3

- Electromechanical coupling k^2 and f*Q records for TFLN acoustic resonators are not given here; a mmWave TFLN acoustic review exists `{title | lu2025pqe | title}`.

---

## 6.10 Heterogeneous lasers, amplifiers, detectors

### L1

LN does not emit or detect light well on its own. Bonding a sliver of III-V semiconductor onto the chip adds a laser; doping the film with erbium adds an amplifier; bonding InP or silicon adds a photodiode. The modulator then sits millimeters from its light source and its receiver.

### L2

| Function | Value | Source |
|---|---|---|
| III-V-on-TFLN lasers and amplifiers | electrically pumped, EO-tuned | `{reported | opdebeeck2021 | Y}` |
| Laser transmitter | up to 60 mW in the waveguide; with a 50 GHz modulator | `{reported | shamsansari2022optica | Y}` |
| Pockels laser | 2.0e18 Hz/s frequency-modulation speed; 50 MHz switching | `{reported | li2022nc | Y}` |
| Self-injection-locked Si3N4-LN laser | 3 kHz intrinsic linewidth; 12e15 Hz/s tuning; FMCW LiDAR demo | `{reported | snigirev2023 | Y}` |
| Mode-locked laser (III-V + TFLN) | about 4.8 ps, about 10 GHz, > 2.6 pJ, about 1065 nm | `{reported | guo2023sci | Y}` |
| Er:LNOI waveguide amplifier | > 28 dB fiber-to-fiber net gain at 1531 nm, NF 5.3 dB, > 15 dBm output | `{reported | yu2026lpr | Y}` |
| a-Si detector (visible) | 22-37 mA/W, 635-850 nm | `{reported | desiatov2019apl | Y}` |
| InP MUTC photodiode on TFLN | 110 GHz, 0.4 A/W | `{reported | wei2023lam | Y}` |
| InP-LN wafer-level receiver | photodiode 140 GHz; 7-channel coherent receiver, 3.584 Tb/s aggregate | `{reported | xie2025lsa | Y}` |
| GaAs lasers + TFLN modulator, 1064 nm | 100 Gb/s NRZ, 160 Gb/s PAM4; V_pi 3.1 V, 1.8 V cm, bandwidth > 100 GHz | `{reported | atlas shen2026-a | Y(conf)}` (OFC 2026 Th4A.5) |

### L3

- Internal (on-chip) gain and fiber-to-fiber net gain are not comparable; internal values (e.g. 38 dB internal net gain [wang2024cleo]) are not plotted with fiber-to-fiber values.

---

## 6.11 Thin-film lithium tantalate: the sibling platform

### L1

Lithium tantalate is LN's closest relative: same structure, tantalum in place of niobium. LT wafers are already made in high volume for phone filters. In the eo-modulator-atlas sample (233 papers), thin-film LT modulators reach the same median voltage-length product as LN (2.43 vs 2.44 V cm), and in one paired comparison an LT modulator drifted less under a DC bias than its LN twin `{reported | powell2024 | Y}`.

### L2

| Fact | Value | Source |
|---|---|---|
| LT PICs by wafer bonding, SOI-compatible | 5.6 dB/m loss (DUV stepper); MZM V_pi L 1.9 V cm up to 40 GHz; lower birefringence than LN | `{reported | wang2024nat | Y}` |
| High-speed TFLT MZM | 110 GHz; 176 GBd PAM8, > 400 Gb/s net | `{reported | wang2024optica | Y}` |
| DC stability vs TFLN | < 1 dB (TFLT) vs 5 dB (TFLN) output fluctuation at quadrature over 46 h, 12.1 dBm input; V_pi L 3.4 V cm; 0-70 C operation | `{reported | powell2024 | Y}` |
| TFLT bandwidth + drift | > 67 GHz, V_pi L 2.4 V cm, < 1 dB drift over 60 min | `{reported | chen2026oe | Y}` |
| High-temperature operation (TFLT, not TFLN) | waveguide and resonant modulators DC-bias stable at 120 C; EO modulation and bandwidth unaffected | `{reported | alsayem2026arxiv | Y(preprint)}` (Al Sayem et al., arXiv 2604.27285) |
| Highest line rate in the eo-modulator-atlas sample (any platform) | 768 Gb/s line, 536 Gb/s net; highest symbol rate in the paper 226 GBd; C band, V_pi 1.35 V, > 110 GHz, 18 mm | `{reported | atlas xu2026b-a | Y(conf)}` (OFC 2026 Th4A.2) |
| O band, about 1 V (title: "Sub-V-driven") | V_pi 1.089 V average, range 1.045-1.166 V (10 Hz-10 kHz), > 110 GHz, 15 mm | `{reported | atlas xu2026a-a | Y(conf)}` (OFC 2026 W1A.4) |
| WDM transmitter | 1.6 Tb/s aggregate net | `{reported | hulyal2026cleo | Y(conf)}` |
| EO comb | > 450 nm span, > 2,000 lines | `{reported | zhang2025nat | Y}` |
| Atlas sample | TFLT papers per year: 4 (2024), 4 (2025), 14 (2026); median telecom push-pull V_pi L 2.43 V cm (n = 17) vs TFLN 2.44 (n = 66) | `{derived | atlas | atlas}` |

TFLT concentration: 22 TFLT papers in the atlas; EPFL on 9, KIT on 7 `{derived | atlas | atlas}`.

### L3

- The lower photorefraction / DC drift of LT is argued in papers; no dataset-wide drift comparison exists; Powell 2024 is one paired comparison under stated conditions.
- PPLT coercive field about 4x that of MgO:LN (Kuznetsov, Li, Kippenberg, arXiv 2512.07968) `{reported | kuznetsov2025arxiv | Y(preprint)}`.

---

## 6.12 Records (provisional)

### L1

Highest reported value per metric in the literature searched to 2026-10-24, each with its date and paper.

[[A6]] Records strip: one row per metric, value on a log axis vs date, platform marker; hover = conditions and DOI.

### L2: records table

Highest value found in a literature search to 2026-10-24 or in eo-modulator-atlas commit eb97f96. Platform labels: TFLN, SiN-loaded TFLN, LN on sapphire, bulk-bonded LN, Er:LNOI, InP on TFLN, TFLT.

| Metric | Value | Conditions | Platform | First author, venue, date | DOI | Source checked |
|---|---|---|---|---|---|---|
| Dry-etched ring intrinsic Q | 29 million (1.3 dB/m) | ion-sliced, telecom | TFLN | Zhu, Photon. Res. 12, A63, 2024 | 10.1364/prj.521172 | Y |
| Ring Q, CMP | Q > 1e8; about 0.28 dB/m | film thinned from bulk | TFLN | Gao, Chin. Opt. Lett. 20, 011902, 2022 | 10.3788/col202220.011902 | Y(arXiv) |
| Material-limited loss estimate | about 0.2 dB/m (material Q about 1.6e8) | annealed ion-sliced | TFLN | Shams-Ansari, APL Photonics, 2022 | 10.1063/5.0095146 | Y (inferred limit) |
| Wafer-scale waveguide loss | 0.27 dB/cm | DUV, 4- and 6-inch | TFLN | Luke, Opt. Express, 2020 | 10.1364/oe.401959 | Y |
| Measured 3 dB EO bandwidth | 170 GHz (295 GHz at 6 dB) | measured to 325 GHz; model-verified | TFLN | Zhang, Photon. Res. 10, 2380, 2022 | 10.1364/prj.468518 | Y |
| Telecom V_pi L, non-resonant | 0.21 V cm | 1 mm slow-light MZM, > 110 GHz | SiN-loaded TFLN | Shen, Laser Photon. Rev. 19, 2401092, 2024 | 10.1002/lpor.202401092 | Y |
| Telecom V_pi L, ridge-top electrodes | 0.33 V cm | 300 um, 145 GHz extrapolated | TFLN | Yu, Opt. Express 33, 41353, 2025 | 10.1364/oe.572384 | Y |
| Single-wavelength symbol rate with a TFLN modulator | 440 GBd PS-16-ASK | 221 GHz band-interleaved DAC | TFLN | Deakin, OFC 2025 Th4B.7; Che, JLT 44, 1178, 2026 | 10.1364/ofc.2025.th4b.7 | Y |
| Coherent net rate, single wavelength | 1.96 Tb/s | dual-polarization IQ, 110 GHz | TFLN | Xu, Optica 9, 61, 2022 | 10.1364/OPTICA.449691 | Y |
| Line rate, IM/DD, any platform | 768 Gb/s (536 Gb/s net) | highest symbol rate in the paper 226 GBd | TFLT | Xu, OFC 2026 Th4A.2 | 10.1364/ofc.2026.th4a.2 | Y(conf), atlas |
| Normalized SHG, waveguide | 9,600 %/W/cm^2 | double-layer | TFLN | Li, Adv. Photon. Nexus 3, 066009, 2024 | 10.1117/1.APN.3.6.066009 | Y |
| SHG, microring | 5,000,000 %/W | z-cut PPLN ring | TFLN | Lu, Optica 7, 1654, 2020 | 10.1364/OPTICA.403931 | Y |
| OPA gain | 71 dB (118 dB/cm) unsaturated | fs pump, 4 pJ | TFLN | Jankowski, Optica 9, 273, 2022 | 10.1364/OPTICA.442550 | Y |
| CW OPO threshold | 19.6 uW | PLACE microdisk | TFLN | Gao, New J. Phys., 2021 | 10.1088/1367-2630/ac3d52 | Y |
| On-chip squeezing, measured | 4.9 dB | > 25 THz | TFLN | Nehra, Science 377, 1333, 2022 | 10.1126/science.abo6213 | Y |
| Integrated EO comb span | > 450 nm, > 2,000 lines | triply resonant | TFLT | Zhang, Nature 637, 1096, 2025 | 10.1038/s41586-024-08354-4 | Y |
| TFLN-superconductor EO transduction | 1.02% total | bidirectional, cryogenic | TFLN | Xu, Nat. Commun. 12, 4453, 2021 | 10.1038/s41467-021-24809-y | Y |
| AO modulator V_pi L | 0.03 V cm | unsuspended, chalcogenide hybrid | TFLN | Wan, Light Sci. Appl. 11, 145, 2022 | 10.1038/s41377-022-00840-6 | Y |
| Photodiode bandwidth on LN | 140 GHz | InP-LN wafer level | InP on TFLN | Xie, Light Sci. Appl. 14, 172, 2025 | 10.1038/s41377-025-01821-1 | Y |
| Er amplifier, fiber-to-fiber net gain | > 28 dB at 1531 nm, NF 5.3 dB | bidirectional 1480 nm pump | Er:LNOI | Yu, Laser Photon. Rev., 2026 | 10.1002/lpor.71753 | Y |

### L3

- Records are provisional: literature coverage for 2024-2026 is incomplete. Source checked: Y = number in the published abstract; Y(arXiv), Y(conf), Y(preprint) = in that version's abstract; atlas = eo-modulator-atlas row with evidence locator.
- Exclusions: simulated-only devices (e.g. "0.105 V cm, 235 GHz", Dadkhah 2026, simulation) are never records; extrapolated bandwidths are tagged "extrapolated".
- Each record row is also a machine-readable row in the records dataset (data API), with DOI, date, platform label, conditions, verification code.

---

## Editorial note (not page copy)

- Numbers removed from R08 on verification: Chen P.-K. 2024 "104 %/W overall" in R08 sec. 2.4 is a lost superscript; the arXiv abstract (2307.11671) states "near 10^4 %/W" and the tanh^2 check at 20 mW agrees. Use 10^4 %/W.
- Atlas electrode counts here use device rows only (n = 209); R04 used the same filter.
- R04's `wafer_supplier` count is reproduced exactly: 50 of 56 stated suppliers name NanoLN (match rule in `../08-industry/chart-specs.md`).
- The 2.58 V cm worked value uses template gap and overlap; it is labelled template on the page.
- The site author co-authored jiang2019optica, jiang2020nc, jiang2023np (R08 sec. 2.9-2.10); they appear by physics. No authorship line on the page (DevLog-004 rule 8).
