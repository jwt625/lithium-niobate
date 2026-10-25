# Chapter 03 Sound: figure and interactive specs

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Count | 11 (F3.1-F3.11) plus door art (manuscript sec. 3.0) |
| Data | API tensors per R06 sec. 4.3: `/api/v1/tensors/{tensor}/{variant}/{source_id}.json`, variant `cln`. Default source kushibiki1999; alternates ogi2002, warner1967 (P-comp/S), smithwelsh1971 (P-comp) |
| Frame | IEEE Std 176-1987 (manuscript header). Every figure that shows a signed tensor component prints the frame tag `IEEE-176-1987, +Z: d33>0, +Y: d22>0` in its L3 popup |
| Rules | DevLog-004 rules 1-9. Readouts in fixed `ch` widths; plot boxes with reserved height (`aspect-ratio` or fixed px); verify `getBoundingClientRect` of every element at control extremes in TECH and VISUAL, 1440 and 390 px |

PHY functions named below are either in the PHY lane list (DevLog-004: tensor rotation, Christoffel solver) or requested here (marked REQ). All REQ items are pure functions over plain arrays with unit-suffixed names (R11 sec. 4).

Tolerance convention for acceptance: "abs" absolute, "rel" relative. Derived reference values come from the C03 scratch check of 2026-10-25 (manuscript "derived (calc)").

---

## F3.1 Longitudinal piezoelectric surface (sec. 3.1, L1)

| Item | Spec |
|---|---|
| Question | Which way do you press LN to get the most charge, and why does the answer have threefold symmetry? |
| Model | d = e s^E (kushibiki1999), d_L(n) = d_ijk n_i n_j n_k. Closed form: d33 cos^3(theta) + (d31 + d15) cos(theta) sin^2(theta) - d22 sin^3(theta) sin(3 phi) |
| Inputs | press direction (theta 0-180 deg, phi 0-360 deg) by drag on a sphere (VISUAL) or two sliders (TECH); data set selector (kushibiki1999, smithwelsh1971 d via weis1985) |
| Outputs | d_L in pC/N (signed); face charge density for 1 MPa: sigma = d_L x 10^6 Pa (uC/m^2); free-crystal displacement per volt along n (pm/V, = d_L numerically) |
| PHY | `tensor.voigtToFull3(d, {strain:"engineering"})` (PHY list), `piezo.convertForms({cE, e, epsS})` -> {sE, d, g, h, cD, epsT} (REQ), `piezo.longitudinal(dFull, n)` (REQ) |
| API | `piezo-e/cln/kushibiki1999`, `elastic-stiffness-cE/cln/kushibiki1999`, `permittivity-epsS/cln/kushibiki1999` |
| TECH | 2D: polar plot of d_L(phi) in the XY plane (theta = 90 deg) and d_L(theta) in the YZ plane, monochrome, positive lobes solid, negative dashed; numeric table of d15, d22, d31, d33 with badges; ASCII stereogram glyph of 3m beside the plot |
| VISUAL | 3D surface r = abs(d_L(n)) colored by sign (two neutral tones, legend "sign of charge on the +n face"); a translucent LN cube with crystal axes; dragging the press arrow places a press on the cube and lights the face with charge dots whose density follows abs(d_L) |
| Moment of joy | Dragging around the equator: the charge flips sign every 60 deg (sin 3 phi), the threefold axis seen directly; pressing along Z gives less than half the charge of pressing along Y |
| Readouts (fixed width) | `d_L = +20.30 pC/N` (17 ch, value field `+00.00`); `theta = 090.0 deg`, `phi = 090.0 deg`; reserved 3-line box |
| Acceptance | d_L(+Y) = d22 = 20.30 +- 0.01 pC/N; d_L(+Z) = 8.69 +- 0.01; d_L(+X) = 0; d_L(phi = 30 deg, theta = 90) = -20.30 (since sin 90 deg = 1); maximum of abs(d_L) over the sphere = 38.80 pC/N (negative) at theta = 118.9 deg, phi = 30 deg and at phi +- 120 deg (derived (calc), confirmed by the C03 audit; abs 0.05 pC/N); epsT from convertForms = 83.34 / 28.48 (rel 1e-3) vs measured 83.3 / 28.5; d16 = -2 d22 |

## F3.2 Constitutive forms and the convention of 2s (sec. 3.1, L2-L3)

| Item | Spec |
|---|---|
| Question | How do e, d, g, h and the stiff/compliant, clamped/free constants convert into each other, and where do factors of 2 come from? |
| Model | IEEE 176 Eq. 43 relations; Voigt maps per ieee176 Eqs. 22, 25, 44-45 |
| Inputs | pick a form (e, d, g, h) as the "given" set; toggle Voigt display (IEEE engineering strain / full tensor index view); click any matrix cell |
| Outputs | all four coefficient matrices, c^E, c^D, s^E, s^D, eps^S, eps^T; for a clicked Voigt cell, the full-tensor components it represents and the factor applied (1, 2 or 4) |
| PHY | `piezo.convertForms` (REQ), `tensor.voigtFactor(kind, p, q)` (REQ; kinds: stiffness, compliance, piezo_e, piezo_d, photoelastic_p, piezooptic_pi) |
| API | as F3.1 plus `permittivity-epsT/cln/kushibiki1999` (measured, for comparison) |
| TECH | 3 x 6 and 6 x 6 matrices as boxed mono grids (one heading size), zero cells as `.`, symmetry-dependent cells marked with their relation on hover (e.g. `c66 = (c11-c12)/2`, `s66 = 2(s11-s12)`); one-line relation list under the grid |
| VISUAL | matrix as a glyph grid (cell area = magnitude, fill tone = sign); clicking a Voigt cell expands into the full-tensor 3x3 sub-block it stands for, with the factor written on the connector; a "measured vs computed" bar for eps11^T (83.3 vs 83.34) |
| Moment of joy | Clicking s66 shows four full-tensor entries collapsing into one number times 2; clicking c66 shows the same entries with no factor |
| Readouts | matrix cells in a fixed engineering format `+0.000e+00` (10 ch) so g (0.0345) and c (249.35e9) share one cell width; no reflow when switching forms (identical grid geometry for all forms) |
| Acceptance | round trip e -> d -> e reproduces kushibiki1999 e to 1e-12 rel; c^E s^E = I to 1e-12; eps^T computed 83.34 / 28.48 vs measured 83.3 +- 0.8 / 28.5 +- 0.3 (inside error); d_h = 2 d31 + d33 = 6.62 pC/N displayed beside Graham's measured 6.31 +- 0.014 (P-comp); c33^D = 249.35 GPa, c44^D = 93.45 GPa; g33 = 0.0345 V m/N; h33 = 8.01 x 10^9 V/m (all rel 1e-3) |

## F3.3 Bulk slowness surfaces with piezoelectric stiffening (sec. 3.2)

| Item | Spec |
|---|---|
| Question | How fast does sound travel in each direction of LN, and how much does piezoelectricity stiffen it? |
| Model | Christoffel equation with stiffening (ieee176 Eq. 47); group velocity per jaeken2016 |
| Inputs | stiffening on/off; plane section (XY, YZ, XZ) or 3D; mode (slow shear, fast shear, quasi-longitudinal); data set |
| Outputs | phase velocity, slowness 1/v, group velocity and power-flow angle per direction; polarization vector; stiffening increment (v_stiff - v_unstiff) |
| PHY | `acoustics.christoffel(cFull, eFull, epsS, rho, n, {piezo:true})` (PHY list: "Christoffel solver"), `acoustics.groupVelocity` (REQ), `tensor.rotate` (PHY list) |
| API | `elastic-stiffness-cE`, `piezo-e`, `permittivity-epsS`, `density`, `bulk-velocity/cln/kushibiki1999` (measured, Table II; for markers) |
| TECH | three 2D slowness curves per plane, 1 px lines, measured kushibiki1999 velocities as `+` markers with values on hover; table of the six measured vs computed velocities |
| VISUAL | 3D nested slowness surfaces (three sheets, translucent), cusps visible on the slow shear sheet if present; a direction probe arrow; stiffening toggle animates the quasi-longitudinal sheet bulging along Z (within 0.5 s); polarization shown as a small oscillating segment at the probe tip |
| Moment of joy | Toggle stiffening: the Z-longitudinal velocity jumps from 7102 to 7329 m/s and lands on the measured marker, while the Y-shear polarized along X does not move at all (purely elastic, as IEEE 176 Eq. 53 states) |
| Readouts | `v = 7328.6 m/s` (14 ch, value field `0000.0`), `dv_piezo = +226.5 m/s`, `PFA = +00.0 deg`, polarization `(+0.000, +0.000, +1.000)` |
| Acceptance | velocity range over the sphere 3474.0 to 7356.9 m/s (derived, audit-confirmed; abs 0.5 m/s). vs kushibiki1999 Table II (measured): Z-L 7328.20 (computed 7328.55), Z-S 3590.41 (3590.39), X-L 6544.53 (6544.61), X fast shear 4750.67 (4750.09), Y quasi-L 6806.55 (6806.82), Y shear 3940.49 (3940.60): abs 1.0 m/s. Unstiffened Z-L 7102.07 +- 0.1. Isotropic test tensor: two degenerate shear branches, v = sqrt(c44/rho) (R11 S10). Threefold symmetry: v(phi) = v(phi + 120 deg) in the XY plane to 1e-9 rel |

## F3.4 Cut-angle explorer (sec. 3.4)

| Item | Spec |
|---|---|
| Question | Why are 128 deg Y-X, 41 deg Y-X and 64 deg Y-X the standard LN SAW cuts? |
| Model | partial-wave SAW solver (campbell1968), Rayleigh (real v) and leaky SAW (complex v), open and shorted surface; k^2 = 2(v_free - v_met)/v_free (ingebrigtsen1969); rotated Y-cut, X propagation, (YXl) theta |
| Inputs | theta 0-180 deg (slider and number box, 0.5 deg step); data set (kushibiki1999, ogi2002, warner1967); show Rayleigh / LSAW |
| Outputs | v_free, v_met, k^2 per branch; LSAW propagation loss (dB per wavelength, open and shorted); thresholds (slow shear 4029.0 m/s, fast shear 4750.1 m/s along X) as horizontal guide lines |
| PHY | `saw.solve({cFull, eFull, epsS, rho}, frame, {surface:"open"|"short", branch:"rayleigh"|"leaky"})` (REQ; nondimensionalize, 4-root selection by decay and Poynting flux, threshold exclusion window 1 m/s), `saw.frameRotY(theta_deg)` (REQ), precomputed sweep JSON at 0.5 deg for the three data sets (REQ, build-time) |
| API | as F3.3; vendor values `saw-velocity/cln/fomos-ln` (V) as optional markers, labelled vendor |
| TECH | two stacked uPlot panels sharing the theta axis: (a) velocity vs theta (four curves: Rayleigh open/short, LSAW open/short), (b) k^2 vs theta (log toggle); vertical cursors at 41, 64, 128 deg; points within 1 m/s of a threshold not plotted and listed as gaps |
| VISUAL | a boule cross-section dial: drag the cutting plane around X on an illustrated boule (Z up, Y' normal drawn), the wafer face updates; beside it the two curves with the current theta marked; at 128 deg and 64 deg small ripple glyphs show which wave is active (Rayleigh: elliptical orbit; LSAW: in-plane shear) |
| Moment of joy | Sliding through 128 deg: the Rayleigh coupling peaks (5.42% at 129 deg) where the leaky branch has faded out (1.3% at 120 deg, no root resolved at 130 deg); near 60-70 deg the reverse happens (Rayleigh near 0, leaky 9-11%). The industrial cuts sit where one wave is strong and the other absent |
| Readouts | `theta = 128.0 deg`; `v_free = 3978.4 m/s`, `v_met = 3870.7 m/s`, `k2 = 05.41 %`, `loss = 0.0000 dB/lambda` for each branch; fixed 2 x 4 grid, `---.-` placeholder where a branch has no isolated root |
| Acceptance | kushibiki1999, derived (calc), abs 0.5 m/s and k^2 abs 0.02 pp: 128 deg 3978.4 / 3870.7 / 5.41%; Y-Z (separate frame, see F3.5) 3486.4 / 3412.7 / 4.23%; 41 deg LSAW v_met 4376.2 (isolated root) and v_free pinned at the fast-shear threshold 4750.1 (the solver must report "threshold-pinned" there, not a root; k^2 15.71% shown as indicative); 64 deg LSAW 4691.4 / 4448.2 / 10.37% (free root 59 m/s below threshold; complex-velocity root, to be confirmed independently); Rayleigh k^2 maximum 5.42% at 129 deg (1 deg sweep 122-136). warner1967 (rho 4700 assumed, eps^S 44.3/27.9): 41 deg 4784.7 (threshold-pinned; fast shear 4785.5) / 4378.2 / 16.99%; 64 deg 4736.6 / 4475.4 / 11.03%. Vendor cross-check (V, fomos-ln): 3488 / 3980 / 4690 / 4750 m/s within 3 m/s for kushibiki1999. Losses 64 deg: 0.051 open, 0.0033 shorted dB/lambda; 41 deg: 0.016 shorted, open not resolved (rel 30%, approximate method) |

## F3.5 SAW anatomy (sec. 3.3)

| Item | Spec |
|---|---|
| Question | What does a surface wave look like inside the crystal, and how is a leaky wave different? |
| Model | eigenvector of the SAW solution from `saw.solve`: amplitudes of the 4 partial waves; u1, u2, u3, phi vs depth x3 (0 to -3 lambda); vacuum potential decays as exp(-k x3) above |
| Inputs | cut preset (Y-Z, 128 deg Y-X, 64 deg Y-X LSAW, X-Z, X-Y); surface open/short; time scrub (phase 0-360 deg) |
| Outputs | depth profiles (normalized), particle orbit at the surface (ellipse, sense of rotation), fraction of energy within 1 lambda (derived), power-flow angle |
| PHY | `saw.solve` (REQ) returning partial-wave amplitudes and alpha roots; `saw.fields(sol, x1, x3, phase)` (REQ) |
| API | as F3.3 |
| TECH | four line profiles (u1, u2, u3 normalized; phi normalized) vs depth in units of lambda, side by side; orbit as a small ASCII ellipse with arrow; static unless scrubbed |
| VISUAL | a deformed grid (2D section x1-x3) animated only while the reader holds a play control (no autoplay), exaggerated displacement with the factor printed; potential as a translucent overlay above and below the surface; for the LSAW preset, faint radiating wavefronts into the bulk |
| Moment of joy | On 128 deg Y-X the surface atoms trace ellipses and the motion dies within about a wavelength; switching to 64 deg Y-X, the motion turns mostly horizontal-shear and a faint ray leaks downward |
| Readouts | `lambda = 3.978 um at 1 GHz` (24 ch), `orbit: retrograde` (17 ch, `prograde ` padded), `E(<1 lambda) = 00.0 %` (20 ch); fixed 3-line box |
| Acceptance | v matches F3.4 for the same cut; field continuity at x3 = 0 (traction residual < 1e-9 of max stress, D3 matched to vacuum); Y-Z sagittal displacement only (u2 = 0 within 1e-9) since the SH partial decouples for propagation along Z on a Y-cut (check against the solver; record the result); depth decay monotonic beyond 2 lambda for Rayleigh presets |

## F3.6 IDT designer (sec. 3.5)

| Item | Spec |
|---|---|
| Question | How does a comb of electrodes pick one frequency out of a radio signal? |
| Model | f0 = v / p (p = electrode period of one finger pair); normalized array factor H(f) = sin(X)/(N sin(X/N)) with X = N pi (f - f0)/f0, radiation conductance shape G(f)/G(f0) = [sin(X)/X]^2; null-to-null bandwidth 2 f0/N. Absolute conductance: template until the smith1969 prefactor is source-checked (open-questions Q5); the measured TFLN point (1.9 mS, 3.36 MHz at 1.85 GHz, p05, reported) is shown as a labelled marker only |
| Inputs | cut (velocity from F3.4 at the chosen theta, open or shorted), period p (0.5-20 um), finger pairs N (1-200), metallization ratio (display only) |
| Outputs | f0 (MHz/GHz), finger width (p/4 at ratio 0.5), fractional bandwidth, wavelength drawn to scale under the comb |
| PHY | `saw.idtArrayFactor(f_Hz, f0_Hz, N)` (REQ), velocity from the F3.4 precompute |
| API | precomputed F3.4 sweep |
| TECH | comb drawn as ASCII (`|_|_|`) with N pairs (truncated with count if N > 40); |H(f)|^2 plot in dB (log default) with -3 dB and null markers |
| VISUAL | top view of Au fingers (`--v-au`) on a straw LN die with a ripple field launched from the gaps, wavelength to scale; the frequency response beside it; sweeping a test-tone slider shows the ripple amplitude grow and fade through the passband |
| Moment of joy | Doubling N halves the bandwidth: the ripples from many gaps add in phase only at f0, and the reader can watch them cancel when the test tone is detuned by f0/N |
| Readouts | `f0 = 0994.6 MHz`, `w_finger = 1.000 um`, `BW_null = 02.00 %`; fixed widths |
| Acceptance | p = 4 um on 128 deg Y-X open: f0 = 994.6 MHz (abs 0.2 MHz; v = 3978.4 m/s); 2 GHz on 128 deg Y-X -> p = 1.989 um; first nulls at f0 (1 +- 1/N) exactly; H(f0) = 1 |

## F3.7 Bragg acousto-optic cell (sec. 3.6)

| Item | Spec |
|---|---|
| Question | How does a sound wave diffract light, and what sets the angle and the frequency shift? |
| Model | Lambda = v/f; sin(theta_B) = lambda0/(2 n Lambda) inside (external angle via Snell); diffracted order shifted by +f (upshift for the order moving with the sound); figures of merit M1, M2, M4 from weis1985 Eq. 20 (definitions, P); diffraction efficiency not modelled until a source formula is read (chang1976 or dixon1967; open-questions Q6) |
| Inputs | lambda0 (400-1700 nm), RF frequency (10 MHz-5 GHz, log slider), acoustic mode (X-longitudinal 6544.6 m/s, Z-shear 3590.4 m/s, 128 deg Y-X SAW 3978.4 m/s), optical polarization (o/e) for n |
| Outputs | Lambda, theta_B (internal, external), frequency shift, wavevector diagram |
| PHY | `ao.bragg(lambda0_m, n, v_mps, f_Hz)` (REQ), Sellmeier n from PHY (Zelmon CLN) |
| API | `bulk-velocity`, dispersion model `zelmon1997` |
| TECH | wavevector triangle (k_in, k_out, K) as a line drawing with lengths to scale; numbers table; M1, M2, M4 table with sources |
| VISUAL | a crystal block with a sound wave drawn as moving density stripes (moves only while the reader drags the RF slider), an input beam in spectral color (or IR false color, dashed) and a diffracted beam at the computed angle |
| Moment of joy | Sweeping RF frequency swings the diffracted beam like a scanner, the basis of an acousto-optic deflector; the frequency readout of the light ticks up by exactly the RF frequency |
| Readouts | `Lambda = 06.545 um`, `theta_B,ext = 06.80 deg`, `df = +1.000 GHz`; fixed |
| Acceptance | lambda0 = 1550 nm, f = 1 GHz, v = 6544.6 m/s: Lambda = 6.545 um, theta_B,ext = 6.80 deg (abs 0.01 deg); M1 6.65e-7, M2 6.99e-15, M4 62.9 displayed with P-comp badges; M3 absent (printed value inconsistent; manuscript sec. 3.6) |

## F3.8 Photoelastic tensor and the sign pitfall (sec. 3.6, L3)

| Item | Spec |
|---|---|
| Question | Which in-plane direction on an X-cut or Y-cut film gives the largest strain-optic response, and what happens if the p14/p41 signs are paired with the wrong frame? |
| Model | p_ijkl from Voigt p_IJ (no factors; manuscript sec. 3.1 table), p'_bbbb(phi) = p_ijkl b_i b_j b_k b_l; also the in-plane shear-to-index coefficient p'_bbab for a chosen pair (a, b) (REQ, optional) |
| Inputs | cut (X, Y, Z), phi 0-180 deg, data set (Avakyants 1976 Set B, Andrushchak 2009, Krupych 2014, Coquin), toggle "flip p14, p41" (equivalent to a 180 deg rotation about Z for the p tensor only) |
| Outputs | p'_bbbb(phi) curve, maximum and its angle, frame tag of the chosen set, warning text when the selected set's frame is unconfirmed |
| PHY | `tensor.rotate` (PHY list), `photoelastic.voigtToFull(pIJ)` (REQ, asymmetric p), `photoelastic.longitudinal(pFull, b)` (REQ) |
| API | `photoelastic-p/cln/{avakyants1976, andrushchak2009, krupych2014, coquin-pinnow1971}` with fields `frame_stated`, `c14_sign_paired`, `wavelength_nm: 633`, `status` |
| TECH | polar plot of p'_bbbb(phi) for X-cut and Y-cut side by side, two curves when the flip toggle is on (solid as listed, dashed flipped), numeric table at 0/45/90/135 deg |
| VISUAL | a wafer top view with the flat and crystal axes; a nanobeam glyph rotates with phi; beam tint intensity follows abs(p'_bbbb); toggling the flip makes the bright direction jump from about 45 to about 135 deg on X-cut and stay put on Y-cut |
| Moment of joy | The pitfall becomes visible: a sign convention error does not change how large the effect is, only which way to lay out the device on an X-cut chip, and does nothing at all on Y-cut |
| Readouts | `p'_bbbb = +0.304` (17 ch), `max at phi = 044.0 deg` (22 ch); fixed |
| Acceptance | derived (calc), audit-confirmed: Andrushchak X-cut max +0.3041 at 44 deg (flip: 136 deg); values at 0/45/90/135: -0.021, +0.304, +0.118, +0.143; Y-cut +0.2235 at 45 and 135 deg, maximum +0.2304 at 50.7 and 129.3 deg (flip-invariant); Set B X-cut max +0.3520 at 42 deg (flip: 138 deg), Y-cut max +0.2380 at 48.3 and 131.7 deg; abs 1e-4 (angles abs 0.5 deg). Z-cut check: p'_bbbb = p11 for every in-plane phi (threefold symmetry plus b -> -b makes the basal-plane longitudinal coefficient isotropic; follows from p66 = (p11 - p12)/2) |

## F3.9 Follow one microwave photon (sec. 3.7)

| Item | Spec |
|---|---|
| Question | Where is the energy lost when a microwave signal is turned into light through a phonon? |
| Model | p05 Eq. 4 (arXiv v1): eta_total = eta_oc eta_o eta_m 4C/(1 -+ C)^2, C = C0 n_c; reported parameters eta_oc = 0.652, eta_o = 0.66, eta_m = 9.9e-4, C0 = 1.2e-5 (fit), eta_e = 4.24e-4; red (upper sign) and blue (lower sign) detuning |
| Inputs | intracavity photon number n_c (10^2-10^5, log), detuning sign, sliders for C0 and eta_m within one decade of the reported values (labelled "what if") |
| Outputs | eta_total, C, internal gain, a stage-by-stage bar (microwave -> IDT/waveguide -> optomechanical -> chip -> fiber) |
| PHY | `om.transductionEfficiency({etaOc, etaO, etaM, C0, nc, detuning})` (REQ) |
| API | `publications/p05` record with the reported parameters and license CC BY 4.0 |
| TECH | log-log plot eta_total vs n_c (red and blue), reported points not reproduced (no data file); the original Fig. 4a may be placed beside it (CC BY 4.0, attribution: Jiang et al., Nat. Commun. 11, 1166 (2020)) |
| VISUAL | an illustrated chip: IDT (Au), horn taper, 1.3 um waveguide, nanobeam, optical fiber; a "packet" travels the chain on a play control and shrinks at each stage by the computed factor; 1550 nm light in IR false color (dashed) |
| Moment of joy | Raising the pump on the blue side, the efficiency climbs past 5% and then diverges at C = 1 (phonon lasing), while on the red side it peaks at the external efficiency at C = 1 and then falls; the bottleneck stage (eta_m about 0.1%) is the visibly smallest bar |
| Readouts | `C = 0.000` (9 ch), `eta = 0.00e-00` (15 ch), stage factors in a fixed 9 ch column |
| Acceptance | blue detuning at n_c = 4 x 10^4: C = 0.48, eta_total = 4.24e-4 x 4(0.48)/(0.52)^2 = 3.0e-3 (derived). The reported 5.5% is the highest stable efficiency in the linear regime, reached by reducing the detuning with the pump power capped near 300 uW by the setup (abstract: 323 uW), internal gain G_int approx 21 dB (p05 arXiv v1, Fig. 4b text; reported); 4.24e-4 x 10^(21/10) = 5.3%, and G_int = 4C/(1-C)^2 = 126 at C = 0.837 (derived). The plot marks 5.5% as a reported point at its gain, not as a point on the n_c axis. Red side: eta_total peaks at eta_e at C = 1 and falls for C > 1; identity eta_oc eta_o eta_m = 4.26e-4 vs fit eta_e = 4.24e-4 (rel 1%) |

## F3.10 Optically heralded microwave photon (sec. 3.7)

| Item | Spec |
|---|---|
| Question | How can detecting one optical photon add exactly one photon to a microwave resonator? |
| Model | step-through of the published protocol (blue-detuned pulse -> photon-phonon pair -> optical click -> phonon swapped to microwave via piezoelectric coupling); plots rebuilt from the CC BY source data (Zenodo 10.5281/zenodo.7903643: Fig. 2, Fig. 3, Extended Data Figs. 1, 2, 3, 5) |
| Inputs | step control (5 steps), data panel selector (files from the Zenodo record), heralded vs unconditional toggle where the data provide both |
| Outputs | the published curves; headline numbers 5% CW efficiency, 15 Hz heralding, < 2 thermal microwave photons (reported) |
| PHY | none beyond plotting; optional `quantum.thermalOccupation(f_Hz, T_K)` (REQ) for the scale bar (2 GHz: 3.1e3 at 300 K, 6.8e-5 at 10 mK) |
| API | `/api/v1/datasets/p17-zenodo-7903643/...` converted at build time from the Zenodo files with license and attribution fields (REQ to API lane) |
| TECH | data-only plots with axes in absolute units as given in the files; step text as a numbered list |
| VISUAL | exploded 3D stack (Si optomechanical crystal, LN piezo block, NbTiN chip, wirebond) per R05 with the event sequence lit step by step; the data panel beside it |
| Moment of joy | The click on the optical detector and the jump in the microwave photon number appear on the same timeline |
| Readouts | step label `Step 0/5: ` prefix plus a 48 ch label box (longest label fits; shorter padded); plot boxes fixed height 320 px TECH, 440 px VISUAL |
| Acceptance | file checksums recorded in the build log; every plotted series traceable to a Zenodo file and column; attribution line "Jiang et al., Nat. Phys. 19, 1423 (2023); data CC BY 4.0" visible |

## F3.11 Nanobender (sec. 3.7)

| Item | Spec |
|---|---|
| Question | How can a piezoelectric crystal whose bulk coefficient is about 0.01 nm/V move a photonic cavity by tens of nm per volt? |
| Model | p07 Eq. 1 (arXiv v1; reported): end displacement of a bending beam driven by a field reversing across its width, Delta approx (1/2) d (dE/dz) L^2 ~ (0.01 nm/V) R^2 U, vs extension under a uniform transverse field Delta ~ (0.01 nm/V) R U and a plain plate Delta ~ (0.01 nm/V) U; aspect ratio R = L/w. Optical tuning: reported small-signal slope approx 5 nm/V (0.6 THz/V) from a linear fit at abs(U) < 0.5 V; the full tuning curve is nonlinear; 1520-1560 nm within 4 V (p07; reported). No linear extrapolation of 5 nm/V is drawn beyond 0.5 V |
| Inputs | aspect ratio R (1-100, log) and voltage U (0-4 V) for the scaling panel; actuator type (plate / transverse extension / bender) |
| Outputs | displacement per volt for the three actuator types at the chosen R (order-of-magnitude, labelled "scaling law, prefactor 0.01 nm/V"); reported tuning points (0 V slope, 4 V span) as markers |
| PHY | none (closed form); bending-beam FEM is out of scope |
| API | `publications/p07` (CC BY 4.0) |
| TECH | log-log plot of displacement per volt vs R for the three actuator types (slopes 0, 1, 2); reported values as labelled markers; d22 = 20.3 pm/V and d15 = 66.4 pm/V (derived) as reference ticks |
| VISUAL | 3D bending beam with submicron electrodes, curvature exaggerated (factor printed), sliced photonic-crystal cavity gap opening; the R slider stretches the beam and the three displacement bars grow as R^0, R^1, R^2 |
| Moment of joy | Stretching the beam tenfold multiplies the bender's displacement a hundredfold while the plain plate does not move more: geometry, not material, supplies the gain |
| Readouts | `R = 010.0` (8 ch), `Delta/U = 1.0e+00 nm/V` (sci, 20 ch) per actuator type; fixed 3-row box |
| Acceptance | scaling panel at R = 10: plate 0.01, extension 0.1, bender 1 nm/V (prefactor 0.01 nm/V per p07 Eq. 1); reported markers 5 nm/V (slope at 0 V) and 40 nm span (1520-1560 nm) within 4 V, the latter shown as a span, not a slope; reference ticks d22 = 20.3, d15 = 66.4 pm/V (rel 1e-3) |

---

## Placement map

| Section | L1 | L2 | L3 |
|---|---|---|---|
| 3.1 Piezoelectricity | F3.1 | F3.2 | F3.2 (Voigt view) |
| 3.2 Bulk waves | F3.3 (plane view) | F3.3 (3D, group velocity) | F3.3 table vs measured |
| 3.3 Surface waves | F3.5 | F3.5 + cut table | constant-set table (static) |
| 3.4 Cuts | F3.4 | F3.4 (sweep table) | F3.4 data-set switch |
| 3.5 IDT and filters | F3.6 | F3.6 | - |
| 3.6 Acousto-optics | F3.7 | F3.7, p-set table | F3.8 |
| 3.7 Phononics, piezo-optomechanics | F3.9 | F3.10, F3.11 | F3.9 "what if" sliders |

## Requests to other lanes

| Lane | Request |
|---|---|
| PHY | `piezo.convertForms`, `piezo.longitudinal`, `tensor.voigtFactor`, `acoustics.groupVelocity`, `saw.solve` (Rayleigh and leaky, open/short, nondimensionalized), `saw.frameRotY`, `saw.fields`, `saw.idtArrayFactor`, `ao.bragg`, `photoelastic.voigtToFull`, `photoelastic.longitudinal`, `om.transductionEfficiency`, `quantum.thermalOccupation`; tests with the acceptance numbers above |
| API | tensors: `elastic-stiffness-cE`, `piezo-e`, `permittivity-epsS`, `permittivity-epsT`, `density`, `bulk-velocity` (kushibiki1999, ogi2002); warner1967 and smithwelsh1971 c, e, d as P-comp/S alternates; `photoelastic-p` sets with frame fields; `saw-velocity/cln/fomos-ln` (V); publication records p03-p17 with license; Zenodo 7903643 conversion |
| F6 / 3D | boule with cutting-plane dial (F3.4), LN-on-SOI exploded stack (F3.10), suspended chip (F3.9), bending beam (F3.11) |
