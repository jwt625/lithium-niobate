# 04 Quirks: figure and interactive specs

Lane C04, 2026-10-25. Twelve figures. Placement markers `[fig-04-NN]` sit in manuscript.md.

Common rules for every figure below:
- Units SI internally; display units as stated per readout. Every constant on screen carries its badge (P, P-comp, reported, S, V, derived, template, U) and opens its source (refs.yaml id).
- template parameters are drawn with the template badge and the caption line "model parameter, no data". No template value appears in a readout without that badge.
- No layout shift: plot boxes have fixed CSS height (`aspect-ratio` or px); axes ranges are fixed per figure unless the reader toggles log/lin or a range preset; every readout has a fixed character width (formats below) in tabular numerals, right-aligned. Acceptance for every figure: `getBoundingClientRect` of every element unchanged (0 px) at slider minimum, maximum, midpoint and at each toggle state, at 1440 px and 390 px, TECH and VISUAL, dark and light.
- Reduced motion (`data-fx="off"`): time-domain animations render the final frame plus a static time axis; controls stay live.
- Readout strings in the specs show the fixed format only; their digits are placeholders unless the acceptance row names the value.
- Canvases render on demand; IntersectionObserver gating (300 px margin); idle = 0 frames.
- PHY function names below are requests to the PHY lane (`src/lib/physics/`); final names are PHY's choice, signatures and units are the contract. Pure functions, erasable TypeScript, `node --test` tests.
- API rows are requests to the API lane (`data/`), keyed by the refs.yaml ids.

Physics function requests (summary):

| Module | Function (proposed) | Signature (SI) | Used by |
|---|---|---|---|
| photorefractive.ts | `dielectricRelaxationTime` | `(epsR, sigmaDark_S_m, sigmaPhoto_S_m) => s` | 01, 02, 07, 08 |
| photorefractive.ts | `photoconductivity` | `(kappa_S_m_per_W, I_W_m2) => S/m` | 01, 02, 04 |
| photorefractive.ts | `photovoltaicSaturationField` | `(kG_m_per_V, alpha_per_m, I_W_m2, sigmaDark, sigmaPhoto) => V/m` (= kG alpha I / (sigma_ph + sigma_d)) | 01 |
| photorefractive.ts | `scFieldWrite`, `scFieldErase` | `(t_s, Esat_V_m, tau_s) => V/m` | 01 |
| photorefractive.ts | `pockelsDeltaN` | `(n, r_m_per_V, E_V_m) => -(1/2) n^3 r E` | 01, 02, 07 |
| photorefractive.ts | `diffusionFieldAmplitude` | `(Lambda_m, T_K, m) => V/m` (= (kB T/e)(2 pi/Lambda) m) | 02 |
| photorefractive.ts | `grating1D` | `({N, Lambda, m, I0, kG, alpha, kappa, sigmaDark, epsR, T, dt, steps}) => {z, I, rho, E, dn}` implicit drift + diffusion + photovoltaic, periodic boundary, local charge neutrality off | 02 |
| photorefractive.ts | `griiraToy` | `({Ig, gen, tauPol, sigmaAbs, Nmax, Pir, Gth, dDkdT, L}) => {Npol, alphaIR, dT, shgRel}` | 05 |
| drift.ts | `pyroCharge`, `pyroField`, `pyroVoltage` | `(p3_C_m2K, dT_K) => C/m^2`; `(p3, dT, epsR) => V/m`; `(p3, dT, epsR, d_m) => V` | 07, 11 |
| drift.ts | `screenedDecay` | `(E0, t, tau) => E0 exp(-t/tau)` | 07 |
| drift.ts | `maxwellWagner2` | `(V, C1, G1, C2, G2, t) => V1` and `mwTau(C1, G1, C2, G2)` | 08 |
| drift.ts | `stackStep` | `(layers: {epsR, sigma, thickness_m}[], V, t[]) => V_layer[][]` (1-3 layers in series, per unit area; exact solution via eigenvectors) | 08 |
| drift.ts | `stackResponse` | `(layers, f_Hz[]) => {mag, phase}` of V_LN/V | 08 |
| drift.ts | `arrhenius` | `(sigma0, Ea_eV, T_K, T0_K) => sigma` | 08 |
| drift.ts | `displayDrift` | `(t_s, tau_s = 40, span_rad = pi/2) => phi` (footer motif, template) | footer |
| ring.ts | `allPass` | `(a, r, phi) => T` | 04 |
| ring.ts | `ringSweep` | `({lambda0, ng, L, a, r, Gamma, dndT, absFrac, tauTh, Rth, prSign, prGain, kappa, sigmaDark, epsR, P, lambdaStart, lambdaStop, sweepRate, dt}) => {t, lambda, T, dTcav, Esc}` coupled-mode amplitude + thermal ODE + photorefractive ODE | 04 |
| ring.ts | `thermalShiftPerK` | `(lambda_m, Gamma, dndT, ng) => m/K` | 04, 09 |
| ring.ts | `thermalLensFocal` | `(w_m, kTh, alpha_per_m, P_W, L_m, dndT) => m` (pi w^2 kTh / (alpha P L dndT)) | 09 |
| sellmeier (existing PHY) | `jundtNe(lambda, T)`, `dnedT(lambda, T)`; `schlarbIndex(pol, lambda_nm, cLi_mol, T_C)` (generalized Sellmeier, R14 N2, status S) | | 05, 09, 10 |
| qpm (existing PHY) | `qpmDetuning(lambda, Lambda, T)` | | 05 |

API rows requested (all with source id and status as in manuscript.md): `pyroelectric_p3` (4 rows: savage1966 reported, schwesyg2011/bartholomaus1994 S, cti1999 V, popescu2013 reported) plus sign rule (weis1985 P); `eps33T` (weis1985 Table 1 sets, P-comp); `dark_conductivity_cln` (volk2008 p. 60, P-comp, range); `photoconductivity_doped` (volk2008 p. 59, range); `glass_constant` (Fe, Cu); `pr_damage_threshold` (7 rows, volk2008 Table 4.3); `odri_threshold` (MgO, ZnO, In2O3, Sc2O3, HfO2, ZrO2 rows); `polaron_bands` (4 rows); `thermo_optic` (rows of sec. 4.8); `thermal_conductivity` (CLN, near-SLN); `damage_ladder` (sec. 4.5 rows); `drift_results` (sec. 4.7 table rows); `r33T`, `r33S`, `n_e(632.8 nm)` from weis1985 (shared with chapter 02).

---

## fig-04-01 Write and erase (photorefractive slab)

| Field | Spec |
|---|---|
| Section, level | 4.1 L1 (with L2 readouts) |
| Question | How large an index scar does a beam write, how fast, and how long does it last after the light goes off? |
| Model | Reduced band transport: sigma_ph = kappa I; E_sat = kG alpha I / (sigma_ph + sigma_d); writing E(t) = -E_sat (1 - exp(-t/tau_light)), tau_light = eps eps0 / (sigma_ph + sigma_d); lights off: E(t) = E_end exp(-t/tau_dark), tau_dark = eps eps0 / sigma_d; Delta n_e = -(1/2) n_e^3 r33 E |
| Inputs | Intensity I: 1e-2 to 1e6 W/cm^2 (log slider). Exposure time: 0.1 s to 1e4 s (log). Crystal preset: "LiNbO3:Fe" (kG = 2.8e-9 cm/V, P-comp; alpha template), "congruent undoped" (kG, alpha template), "5 mol% MgO" (sigma_ph x100 relative to congruent per bryan1984, reported; kG unchanged per bryan1984), "near-stoichiometric" (template). sigma_d slider 1e-16 to 1e-14 S/m (range P-comp, volk2008 p. 60). Lights-off button. eps33 = 28 (P-comp range 28.1-30). n_e = 2.2028 at 632.8 nm, r33^T = 32.2 pm/V (weis1985, P-comp) |
| Outputs | |E|(t) and Delta n_e(t) (negative in the lit region, chen1969) on a log time axis spanning 1e-3 s to 1e7 s; index profile across the beam (Gaussian beam, E proportional to local saturation) drawn as a dent in the slab |
| PHY | `photoconductivity`, `photovoltaicSaturationField`, `dielectricRelaxationTime`, `scFieldWrite`, `scFieldErase`, `pockelsDeltaN` |
| API | `glass_constant`, `dark_conductivity_cln`, `photoconductivity_doped`, `eps33T`, `r33T`, `n_e` |
| TECH | 2-panel: left, slab cross-section in ASCII shading (index change quantized in 8 levels); right, line plot E(t) log-log. Readout row below. Mono labels, 18 px controls |
| VISUAL | Illustrated bench: 532 nm beam (`--v-l532`) entering a straw-colored crystal block; the written scar glows as an index-contrast shimmer (refraction distortion of a background grid seen through the crystal, computed from Delta n profile); lights-off dims the beam and the scar fades on the computed clock (time compressed with a visible "x 1e5" speed label). 44 px controls, 22 px readouts |
| Moment of joy | Press lights-off: the "scar lifetime" readout jumps from seconds (under light) to days or weeks (dark), and the scar stays while the beam is gone. Switch to 5 mol% MgO: the same beam barely marks the crystal |
| Readouts (fixed width) | `I        1.00e+03 W/cm^2` (24 ch); `|E_sat|  1.23e+06 V/m` ; `dn_e    -1.70e-04` ; `tau_lit  2.48e+00 s` ; `tau_dark 2.48e+05 s (2.87 d)` (32 ch reserved) |
| Status display | kG (P-comp), sigma_d range (P-comp), alpha and kappa (template), MgO x100 (reported) |
| Acceptance | t = 0 gives E = 0; t = 20 tau gives E within 1e-8 relative of E_sat; erase curve single exponential (log slope -1/tau within 1e-9); MgO preset reduces E_sat by >= 100x at sigma_ph >> sigma_d; dark tau equals 2.48e5 s for sigma_d = 1e-15 S/m, eps = 28 (derived table); layout check at I and t extremes and every preset; reduced motion shows the final state |
| Motif link | Caption line: the background cursor trace (R12 motif) uses a 15 s display time constant, not this model |

## fig-04-02 Fringes to field (1D photorefractive grating)

| Field | Spec |
|---|---|
| Section, level | 4.1 L2 / L3 |
| Question | Why is a photovoltaic grating in phase with the light while a diffusion grating is shifted by a quarter period? |
| Model | `grating1D`: N = 256 points over two periods, I(z) = I0 (1 + m cos Kz); currents j_pv = kG alpha I (along c), j_diff = kB T mu grad n, j_drift = sigma E; Gauss law and continuity; implicit time stepping to steady state. Closed-form overlay: E_dif(z) = (kB T/e) K m sin Kz / (1 + m cos Kz) (volk2008 Eq. 3.9) |
| Inputs | Grating period Lambda 0.2-20 um (log); modulation m 0-0.95 (Eq. 3.9 diverges at m = 1); photovoltaic weight (kG scale) 0 to 1x of the Fe:LN value (P-comp at 1x); temperature 77-400 K |
| Outputs | Stacked traces over z: I(z), rho(z), E_sc(z), Delta n(z); phase shift readout (degrees) between I and Delta n |
| PHY | `grating1D`, `diffusionFieldAmplitude`, `pockelsDeltaN` |
| API | `glass_constant`, `eps33T`, `r33T` |
| TECH | Four aligned sparkline rows, mono axis ticks, phase readout |
| VISUAL | Interference fringes drawn as 532 nm light bands over a crystal strip; charge as +/- glyphs migrating; index grating as a height ribbon; the quarter-period shift shown by a sliding caliper between fringe peak and index peak |
| Moment of joy | Slide photovoltaic weight from 1 to 0: the index grating slides a quarter period sideways and the phase readout moves from 0 deg to 90 deg |
| Readouts | `phase    +90.0 deg` (16 ch); `E_dif    1.60e+05 V/m` ; `Lambda   1.00 um` |
| Acceptance | m -> 0 gives zero modulation; with kG = 0 steady phase = 90.0 +/- 0.5 deg; with diffusion off phase = 0.0 +/- 0.5 deg; E_dif amplitude per unit m at Lambda = 1 um, T = 295 K (small-m limit) equals 1.597e5 V/m within 0.5 %; layout check |

## fig-04-03 MgO threshold plot

| Field | Spec |
|---|---|
| Section, level | 4.2 L1 (data) |
| Question | How much MgO removes photorefractive damage, and how does stoichiometry change it? |
| Model | None (data plot). Points re-keyed from volk2008 Table 4.3 (data furukawa2001); lower bounds (> 8000 kW/cm^2) drawn as upward arrows. Vertical markers: GRIIRA thresholds about 5 % (CLN) and about 1.5 % (NSLN) (volk2008 p. 96), bryan1984 >= 4.5 at.% (reported), furukawa2000 > 0.78 mol% (reported) |
| Inputs | Log/lin y toggle (default log); series toggles CLN / NSLN; unit note (mol% vs at.%) in hover |
| Outputs | Scatter with connecting guide lines (thin, dashed, labeled "guide, not a fit") |
| API | `pr_damage_threshold`, `odri_threshold` |
| TECH | Monochrome scatter, open/filled markers per series, boxed table of the 7 rows beside the plot (same numbers) |
| VISUAL | Two series in neutral and `--v-l532`; arrows for lower bounds; a strip under the axis shows Mg ions replacing Nb antisites (glyph count proportional to MgO up to threshold, illustrative, labeled) |
| Moment of joy | Log axis makes the cliff visible: at least three decades between 3 % and 6 % MgO in CLN (6 % is a lower bound) |
| Readouts | Hover card: `CLN:4.5% MgO  75 kW/cm^2  cw green, 10 min  volk2008 T4.3  P-comp` (fixed 2-line card, 360 px) |
| Acceptance | 7 points exactly as table; arrows on the two lower bounds; no interpolation drawn as data; units in axis label `kW/cm^2`; layout check on hover |

## fig-04-04 Ring sweep: thermal versus photorefractive

| Field | Spec |
|---|---|
| Section, level | 4.3 L2 and 4.8 L3 |
| Question | Why does a TFLN ring's resonance deform into a triangle on one sweep direction, and how does photorefraction fight it? |
| Model | `ringSweep`: field amplitude a(t) with da/dt = (i Delta(t) - kappa_tot/2) a + sqrt(kappa_ex) s_in; Delta(t) = 2 pi c/lambda_laser(t) - omega_0 [1 - (Gamma/ng)(dndT dT_cav + dn_pr)]; dT_cav/dt = (R_th P_abs - dT_cav)/tau_th, P_abs proportional to |a|^2; dn_pr from E_sc with dE_sc/dt = (E_target(|a|^2) - E_sc)/tau_pr, tau_pr = eps eps0/(sigma_d + kappa I), opposite sign to thermal (lin2021, reported) |
| Inputs | Pump power 0.01-100 mW (log, template range); sweep direction in wavelength (increasing/decreasing); sweep speed 1e-3 to 1e3 nm/s (log); photorefraction on/off; photorefractive strength (template); cladding preset "SiO2-clad" / "air-clad" changes sigma_d and PR strength only qualitatively (xu2021oe, reported trend; magnitudes template) |
| Sourced inputs | dn_e/dT = 3.34e-5 /K (S) or 3.75e-5 /K (derived, Jundt 1550 nm) selectable; lambda0 = 1550 nm. Everything else template: Q_i, Q_c, ng, Gamma, R_th, tau_th, PR gain, kappa |
| Outputs | Transmission versus laser wavelength for increasing- and decreasing-wavelength sweeps overlaid; detuning trace; inset time traces of dT_cav and E_sc |
| PHY | `allPass` (static check), `ringSweep`, `thermalShiftPerK`, `dielectricRelaxationTime` |
| API | `thermo_optic` |
| TECH | Two overlaid line plots (up = solid, down = dashed), mono; parameter list printed with badges |
| VISUAL | Top-view ring with 1550 nm false-color dashed light (declared false color), heat shown as warm halo intensity, space charge as faint +/- along the ring; transmission plot below; sweep cursor moves along the wavelength axis |
| Moment of joy | Turn photorefraction on at slow sweep: the thermal triangle shortens and, at some speeds, the transmission oscillates (sun2017 title-level), all from two competing time constants |
| Readouts | `sweep    +1.00e+00 nm/s` ; `P        1.00e+01 mW` ; `shift_th +1.23e+01 pm` ; `shift_pr -4.56e+00 pm` (fixed 22 ch each) |
| Acceptance | PR off and P -> 0: Lorentzian dip, FWHM = lambda/Q_loaded within 1 %; critical coupling r = a gives T_min < 1e-6 in `allPass`; thermal only, increasing-wavelength triangle width grows monotonically with P; reversing PR sign reproduces thermal-like broadening (sanity); all template parameters badged; layout check across sweeps |

## fig-04-05 Polaron ladder and GRIIRA chain

| Field | Spec |
|---|---|
| Section, level | 4.4 L1 / L2 |
| Question | Where does green-induced infrared absorption come from, and how does it cut second-harmonic output? |
| Model | Part A (data): absorption bands drawn as Gaussians in photon energy at the tabulated centers and HWHM (3200, 3000, 4400 cm^-1 for Nb_Li, Nb_Nb, bipolaron; schwesyg2011 Table 2.1), labeled "Gaussian approximation"; O^- (no width tabulated) drawn as a marker. Part B (template toy): dN/dt = g I_g (1 - N/N_max) - N/tau_p; alpha_IR = sigma_abs N; dT = alpha_IR P_IR L / G_th; SHG_rel = sinc^2(Delta k(dT) L/2), Delta k(dT) from PHY `qpmDetuning` with dn/dT. MgO slider: N_max scales with the Nb_Li fraction, falling to zero at threshold (5 % CLN, 1.5 % NSLN per volk2008 p. 96; scaling law template) |
| Inputs | Green intensity 0-10 kW/cm^2 (range covers the 2.5 kW/cm^2 measurement condition, P-comp); MgO 0-6 %; crystal CLN/NSLN; IR power (template) |
| Outputs | Part A: band spectrum 0.3-3.5 eV with 1064 nm and 1550 nm (false color, dashed) and 532 nm (spectral) markers; Part B: chain of five linked gauges (green -> polarons -> alpha_IR -> dT -> SHG_rel) |
| PHY | `griiraToy`, `qpmDetuning`, `dnedT` |
| API | `polaron_bands`, `odri_threshold` |
| TECH | Part A as a log-free line plot with band labels; Part B as an ASCII flow line `I_g -> N -> alpha -> dT -> SHG` with numeric readouts |
| VISUAL | Configuration-coordinate sketch per polaron (parabola wells, optical vertical arrow at the band energy), then the chain as instrument dials; IR marks dashed and dim as alpha_IR rises (ties to the GRIIRA motif) |
| Moment of joy | Push MgO past the threshold: the 1.6 eV bound-polaron band vanishes and the SHG gauge springs back to full |
| Readouts | `E_band   1.60 eV  (775 nm)` ; `HWHM     0.40 eV` ; `SHG_rel  0.87` (fixed widths); every Part B value badged template |
| Acceptance | Band centers equal table values (12900, 8050, 20140, 20000 cm^-1 converted with 1 eV = 8065.54 cm^-1); MgO >= threshold gives N_max = 0 and SHG_rel = 1; Part B never shows a unitful absolute absorption without template badge; text "no TFLN GRIIRA data found" visible under Part B; layout check |

## fig-04-06 Intensity ladder

| Field | Spec |
|---|---|
| Section, level | 4.5 L1 |
| Question | At what intensity does each kind of "damage" start? |
| Model | None (data). Log axis 1e-2 to 1e10 W/cm^2 for intensities; separate parallel axis 1e-1 to 1e2 J/cm^2 for fluence (furukawa1991). Each row: value, regime (cw / pulsed), definition, crystal |
| Inputs | Filter by regime; crystal highlight (CLN, MgO:CLN, NSLN, Fe:LN) |
| Outputs | Ladder of labeled ticks; V row (vendor 100-300 MW/cm^2) in a separate dashed row labeled "vendor, not a material constant" |
| API | `damage_ladder`, `pr_damage_threshold` |
| TECH | Single vertical log axis with mono labels left (value) and right (definition) |
| VISUAL | A tall column like a thermometer: reversible effects in cool tones at the bottom, permanent breakdown at the top drawn with a crack (kintsugi Au line) |
| Moment of joy | Eleven orders of magnitude on one axis: Fe-doped LN is distorted by cw light at 10 mW/cm^2, while breakdown needs GW/cm^2 nanosecond pulses |
| Readouts | Hover card fixed 2 lines |
| Acceptance | No conversion between fluence and intensity anywhere; every tick carries source and status; vendor row visually separated; layout check |

## fig-04-07 Heat a wafer (pyroelectric charge)

| Field | Spec |
|---|---|
| Section, level | 4.6 L1 / L2 |
| Question | How much charge and voltage does a temperature change put on a lithium niobate wafer or film, and does it matter next to the thermo-optic shift? |
| Model | sigma_b = p3 dT; E = -p3 dT/(eps33 eps0) (unscreened, isolated plate); V = E d; Delta n_e = -(1/2) n_e^3 r33 E; screening: E(t) = E0 exp(-t/tau), tau = eps eps0 / sigma (sigma slider, template beyond the P-comp bulk range); comparison bar: dn_e/dT dT |
| Inputs | dT -50 to +200 K (signed; sign rule per weis1985). The model is linear in dT with the 25 C coefficient; savage1966 shows Ps falling 3.7 uC/cm^2 over 25-450 C (average 8.7e-5 C/(m^2 K), derived), so large heating steps are underestimated, and below room temperature p3(T) is not in held sources (cooling region shaded U); cut: z-cut (charge on top/bottom) or x-cut (charge on sidewalls/edges perpendicular to in-plane c); thickness preset: 0.5 mm wafer, 1 mm wafer, 600 nm film (template geometry); p3 selector: 4.0e-5 (savage1966, reported), 6.4e-5 (S), 8.3e-5 (V), 9.5e-5 (popescu2013, reported), or "show spread" (band); sigma for screening 1e-16 to 1e-6 S/m (log; marks at the P-comp bulk range and at the TFLN-implied values of sec. 4.7, derived) |
| Outputs | Charge density, field, voltage, Delta n_e, coercive-field reference line (21 kV/mm, volk2008 Table 7.1, P-comp), decay curve |
| PHY | `pyroCharge`, `pyroField`, `pyroVoltage`, `pockelsDeltaN`, `screenedDecay`, `dielectricRelaxationTime` |
| API | `pyroelectric_p3`, `eps33T`, `r33T`, `thermo_optic` |
| TECH | Plate cross-section with + and - counts as ASCII rows; four readouts; a bar pair comparing pyro Delta n_e and thermo-optic Delta n_e |
| VISUAL | A wafer on a hotplate (3D-lite isometric SVG), surface charge drawn as glyph density on the +c and -c faces (which face goes positive follows the sign rule and dT sign), field lines, and a voltage needle; when the unscreened field passes the coercive line, the needle pins and a gold kintsugi crack is drawn as a reminder that real wafers discharge first (caption states this is illustrative, no breakdown model) |
| Moment of joy | Slide dT to +95 K on a 0.5 mm z-cut wafer: the voltmeter reads 7.5-17.8 kV (with the spread band) from heat alone; flip to x-cut and the charge moves to the edges |
| Readouts | `dT        +95.0 K` ; `sigma_b   0.38-0.90 uC/cm^2` ; `E        1.5e+07-3.6e+07 V/m` ; `V         7.5-17.8 kV` ; `dn_e     2.5e-05-5.9e-05 /K` (range format reserved even for single p3: `x.xe+xx` fields fixed) |
| Acceptance | Reproduces the derived table of sec. 4.6 to 2 significant figures; sign: cooling makes the +c face positive (weis1985 rule) in both views; x-cut view puts charge on faces perpendicular to c only; screening decay single exponential; spread band ordered min/max; layout check at dT extremes and each p3 option |
| Link | 404 page kintsugi motif (R12) uses this figure's art at fixed state |

## fig-04-08 Drift simulator (layered RC)

| Field | Spec |
|---|---|
| Section, level | 4.7 L2 / L3 |
| Question | Why does the bias point of a modulator walk, which way, and on what time scale? |
| Model | `stackStep` for 2 or 3 layers in series (cladding / LN / buried oxide), each eps_r, sigma, thickness per unit area: C_i = eps_r,i eps0 / t_i, G_i = sigma_i / t_i; step or square-wave V; `maxwellWagner2` closed form checks the 2-layer case; `stackResponse` gives |H(f)| = |V_LN/V| for 1 mHz-1 MHz; bias point phi = phi_0 + pi V_LN/V_pi with MZM transfer T = cos^2(phi/2); `arrhenius` scales each sigma with temperature (E_a template) |
| Inputs | Preset "bulk-like" (sigma_LN = 1e-15 S/m, P-comp range), "TFLN clad", "TFLN air-clad" (sigmas chosen so tau matches the reported 11.9 ms and 88.6 us of li2026photonics; badge: "tuned to reported tau, layer values template"); per-layer eps_r and sigma sliders (log 1e-18 to 1e-4 S/m); interface conductance toggle (adds a thin conductive layer); temperature 77-400 K; waveform step / square (period 1e-3 to 1e4 s) |
| Outputs | V_LN(t) on log time 1e-6 to 1e6 s; bias point on the transfer curve (dot moving); |H(f)| log-log with the reported 1-20 kHz enhancement band of holzgrafe2024 shaded and labeled "reported band, this device" |
| PHY | `stackStep`, `maxwellWagner2`, `mwTau`, `stackResponse`, `arrhenius`, MZM transfer |
| API | `dark_conductivity_cln`, `eps33T`, `drift_results` |
| TECH | Three stacked plots (time, transfer curve, frequency), mono, parameter table with badges; drift sign printed as "LN share grows (positive)" or "shrinks (negative)" |
| VISUAL | Cross-section of a TFLN modulator (Au electrodes, LN rib, SiO2, Si) with field arrows whose length tracks V_LN(t); mobile charge drawn as drifting dots accumulating at the interface layer; transfer curve with the operating dot; "re-lock" button resets to quadrature (same control as the footer motif) |
| Moment of joy | Drag the cladding conductivity across eight decades and watch the relaxation move from weeks to microseconds on the same axis, and the drift flip sign when the conductive path changes |
| Readouts | `tau       1.19e-02 s` ; `V_LN(0+)  0.62 V` ; `V_LN(inf) 0.91 V` ; `drift     positive` (fixed 22 ch) |
| Acceptance | 2-layer stackStep equals maxwellWagner2 to 1e-9 relative at 50 log-spaced times; t = 0+ capacitive division and t -> inf resistive division exact; |H(f)| -> capacitive ratio at high f and resistive ratio at low f; presets reproduce tau = 11.9 ms and 88.6 us within 1 %; Li+ migration is not a selectable mechanism (U, sec. 4.7 L3); layout check at slider extremes |
| Footer motif | `displayDrift` (tau 40 s, span pi/2, template) shares the transfer-curve component |

## fig-04-09 Thermal calculator

| Field | Spec |
|---|---|
| Section, level | 4.8 L2 |
| Question | How much do the indices move with temperature, how strong is the thermal lens, and how far does a ring resonance shift per kelvin? |
| Model | dn_e/dT from Jundt temperature-dependent Sellmeier (via PHY, coefficients S/derived); dn_o/dT from cti1999 Sellmeier (derived from V) and Moretti formula at 632 nm (S) shown side by side; thermal lens f = pi w^2 K_th/(alpha P L dn/dT); ring shift lambda Gamma (dn/dT)/ng |
| Inputs | Wavelength 0.4-5 um (log); temperature 20-200 C; polarization o/e; lens: P 0.1-100 W, w 10-1000 um, alpha 1e-4 to 1e-1 cm^-1, L 1-50 mm, K_th preset 3.92 (CLN) or 5.97 (near-SLN) W/(m K) (P-comp); ring: Gamma 0.5-1, ng 2.0-2.4 (template) |
| Outputs | dn/dT curves (o and e) versus wavelength with source markers at 633, 1064, 1523/1550 nm; focal length readout with validity flag (f >> L); ring shift in pm/K |
| PHY | `jundtNe`, `dnedT`, `thermalLensFocal`, `thermalShiftPerK` |
| API | `thermo_optic`, `thermal_conductivity` |
| TECH | Plot plus three boxed result cells |
| VISUAL | A beam passing a heated crystal bending into a lens drawn to scale with the computed f; ring dial for pm/K |
| Moment of joy | Set the schwesyg2011 example (10 W, 150 um, 0.005 cm^-1, 20 mm, 100 C): the lens lands at about 6 cm, and the page shows the thesis's own "about 100 mm" next to it with the discrepancy note |
| Readouts | `dn_e/dT  3.75e-05 /K` ; `dn_o/dT  4.1e-06 /K` ; `f        6.1e+01 mm` ; `ring     +xx.x pm/K` (fixed) |
| Acceptance | Values at 633/1064/1550 nm reproduce R06 sec. 2.4 numbers to 3 significant figures; lens example gives 61 mm (derived); Gayer coefficients excluded from dn/dT (R14 row 36c) with a visible note; layout check |

## fig-04-10 Lithium out-diffusion profile

| Field | Spec |
|---|---|
| Section, level | 4.9 L1 / L2 |
| Question | What does losing lithium at the surface do to the index and the Curie temperature, and why does the depleted skin guide light? |
| Model | Deficit profile dc(z) = dc_s erfc(z / (2 sqrt(D t))) (template: D, dc_s); n_e(z), n_o(z) from the generalized Sellmeier at 632.8 or 1064 nm (status S, valid 400-1200 nm); Curie temperature T_c(z) = 39.064 c - 746.73 (Bordui fit via volk2008, P-comp) with Iyi fit as alternate; "guides e / guides o" flag from sign of n(surface) - n(bulk) |
| Inputs | Surface deficit 0-1.5 mol% Li2O (template); sqrt(D t) 0.1-20 um (depth scale, template; no sourced D); wavelength 632.8 / 1064 nm |
| Outputs | Three aligned depth profiles: c(z), n_e and n_o (as Delta from bulk), T_c(z); guide flags; caption shows dn/dc values of the derived table |
| PHY | `schlarbIndex`, erfc helper |
| API | none required beyond Schlarb coefficients (R14 N2, S) |
| TECH | Three line plots on one depth axis; flags as text `e: guided   o: not guided` |
| VISUAL | The page-edge Li out-diffusion gradient motif (R12) enlarged: a crystal block whose surface dots thin out with depth, the index profile drawn as a glowing well for e-light (532 nm beam stays in) while o-light leaks into the substrate |
| Moment of joy | Raise the surface deficit and watch the extraordinary beam lock into the skin while the ordinary beam spills out, the physics behind the 1973 "thin-film" modulator |
| Readouts | `dc_s     0.50 mol%` ; `dn_e(0) +4.85e-03` ; `dn_o(0) -3.00e-04` ; `Tc(0)   1124 C` (fixed) |
| Acceptance | Schlarb index at 48.38 mol%, 632.8 nm, 24.5 C equals 2.2849 (o), 2.2024 (e) (R14 row 37 check); slope dn_e/dc = -9.7e-3 per mol% within 2 %; D badge template always visible; depth axis labeled in sqrt(Dt) units when no sourced D; layout check |

## fig-04-11 Pitfall cards

| Field | Spec |
|---|---|
| Section, level | 4.10 L1 / L2 |
| Question | What goes wrong in LN fabrication, why, and what fixes were used? |
| Model | Six cards (rows 1, 3/4 combined, 6, 7, 8, and 2), each: cause (one line), mechanism (one line, source id), live number from another figure where one is sourced (bake voltage from fig-04-07 at dT = 95 K, 0.5 mm z-cut; for the 4 K cooldown card no number is shown because p3 below room temperature is not in held sources; -c faster etch rule), fix as recorded |
| Inputs | Card selector; the live numbers inherit p3 selection from fig-04-07 (shared state) |
| Outputs | Card faces with numbers in ranges (p3 spread) |
| Assets | Author's own SEMs from the 2018 notes (post-HF nanobeam hole sidewalls; a-Si hard-mask cracks) only with the author's explicit approval, cropped to remove the instrument data bar (it shows an institution name and date), no sample ids; otherwise a drawn schematic |
| PHY | `pyroVoltage`, `pyroCharge` |
| API | `pyroelectric_p3` |
| TECH | Six-row boxed table: cause, mechanism, number, fix, status |
| VISUAL | Six cards with one 60 deg facet each (DevLog-003b sec. 4), illustrated scene per card (hotplate, cryostat, e-beam column, ion mill, HF beaker); flip on click to the mechanism side |
| Moment of joy | The hotplate card: a 25 -> 120 C bake on a 0.5 mm z-cut wafer computes to 7.5-17.8 kV unscreened, live from the coefficient spread; the cooldown card says plainly that the low-temperature coefficient is missing |
| Readouts | number fields fixed `xx.x-xx.x kV` |
| Acceptance | No names, internal paths, tool recipe names, sample ids or links on any card; every card shows its status (practitioner report, derived, P-comp, U); U items (ZEP exposure, halide volatility) appear only with the U badge or not at all; layout check (cards fixed height; flip is a cross-fade in place) |

## fig-04-12 Drift mitigations over time

| Field | Spec |
|---|---|
| Section, level | 4.7 L1 (data) |
| Question | What has been tried against bias drift since 1981, and what stability did each report? |
| Model | None (data). Rows from manuscript sec. 4.7 table: year, platform (bulk Ti:LN, TFLN, TFLT), mitigation class (buffer/cladding, interface and anneal, surface treatment, material swap, temperature, heterogeneous, reset protocol, thermal bias), reported metric as text (e.g. "< 0.3 % in 8 h", "drift-free 12 h", "< 1 dB over 46 h", "> 1e4 slower relaxation") |
| Inputs | Platform filter; class filter |
| Outputs | Time axis 1980-2026 with markers per row; marker shape by platform; no y-axis quantity (metrics are not comparable), rows stacked by class |
| API | `drift_results` |
| TECH | Log table (DevLog-003a log-table style) with year, platform, class, metric, source, status |
| VISUAL | Horizontal timeline with lanes per class; TFLT rows in a distinct hatched marker (different material) |
| Moment of joy | The same two levers recur 40 years apart: conductive buffer layers in 1985 (gee1985) and cladding or interface control in 2024-2026 |
| Readouts | Hover card fixed 3 lines |
| Acceptance | No invented common metric; every row with source and status; preprints marked; TFLT never labeled TFLN; layout check |

---

## Placement summary

| Figure | Section | Level | Interactivity | Effort (relative) |
|---|---|---|---|---|
| fig-04-01 | 4.1 | L1 | live model | S |
| fig-04-02 | 4.1 | L2/L3 | live PDE (1D) | M |
| fig-04-03 | 4.2 | L1 | data plot | S |
| fig-04-04 | 4.3, 4.8 | L2 | ODE sweep | M |
| fig-04-05 | 4.4 | L1/L2 | data + toy | M |
| fig-04-06 | 4.5 | L1 | data ladder | S |
| fig-04-07 | 4.6 | L1/L2 | closed form | S |
| fig-04-08 | 4.7 | L2/L3 | linear ODE + frequency response | M |
| fig-04-09 | 4.8 | L2 | closed form | S |
| fig-04-10 | 4.9 | L1/L2 | closed form | S |
| fig-04-11 | 4.10 | L1/L2 | cards | S |
| fig-04-12 | 4.7 | L1 | data timeline | S |
