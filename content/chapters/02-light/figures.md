# 02 Light: figures and interactives

16 entries. Function names refer to the PHY lane (`src/lib/physics/*.ts`); names marked "(requested)" are not in the DevLog-004 PHY list verbatim and are proposed here for PHY to adopt or rename. Data paths refer to the API lane (`data/*`, served under `static/api/v1/`). Numbers in "Acceptance" come from `manuscript.md` (derived values were computed for this chapter on 2026-10-25 and must be reproduced by PHY tests to the printed digits).

Shared rules for every entry (DevLog-003a/003b, DevLog-004):
- Readouts use fixed-width formats in tabular figures (TECH: IBM Plex Mono; VISUAL: Inter `tnum`), reserved `ch` widths, right-aligned; out-of-range or invalid states print a fixed-width dash string of the same length, never a reflowing message. Canvas and SVG boxes reserve height via CSS (`aspect-ratio` or fixed height) before data loads.
- Layout-shift test: `getBoundingClientRect` on every element at each control's minimum, maximum and one interior value, both modes, 1440 and 390 px: zero moved or resized elements.
- Every plotted or printed number carries a provenance badge (P, P-comp, P-db, S, V, U, reported, derived, template, engine) whose popup names the source id from `refs.yaml`.
- TECH: monochrome, static between inputs, 18 px controls, no motion. VISUAL: 44 px targets, color only from optics (spectral colors computed from wavelength; 1064/1550 nm in declared false color, always dashed), motion under `data-fx` and off under `prefers-reduced-motion`.
- Log-axis toggle wherever plotted data span more than one decade.

---

## F2-01 Conoscope: uniaxial to biaxial

- **Placement:** 2.1 L1 (chapter door art in VISUAL uses the E = 0 white-light state, DevLog-003b sec. 5).
- **Question:** What does a z-cut LN plate look like between crossed polarizers, and what does a transverse field do to it?
- **Model:** Jones calculus per pixel (manuscript 2.1 L3): exact Snell angles per eigenwave, retardation Gamma(theta), eigen-polarization azimuth from the field-perturbed impermeability; white light by CIE 1931 2-degree integration. Port of `mockup/ln.js` conoscope.
- **Functions:** `conoscope.ts: renderConoscope({d_mm, lambda_nm | 'white', E_kV_per_mm, dir: 'x'|'y', NA, mono})`, `ringAngles(d_mm, lambda_um, m)` (requested), `opticAxisTilt(E, rSet, lambda)` (requested; via `ellipsoid.ts: eigSym3`), `sellmeier.ts: nZelmon`.
- **Data:** `data/dispersion/zelmon1997-cln.yaml`; `data/properties/r-tensor.yaml` (Turner clamped default; set selectable).
- **Inputs:** thickness 0.2 to 2.0 mm; source 632.8 nm or white; E 0 to 5 kV/mm; E along x or y; NA fixed 0.55.
- **Outputs (readouts):** `Delta n induced  4.064e-05` (format `0.000e+00`), `optic-axis tilt  +2.88 deg` (in air, `+0.00 deg`), `state  uniaxial|biaxial ` (8 ch, padded), `ring 1  11.09 deg`.
- **TECH:** 384 px square grayscale eyepiece at 632.8 nm, 1 px reticle with tick marks every 5 deg of external angle; control rows below; HUD row of four fixed readouts.
- **VISUAL:** optical bench illustration (lamp, polarizer P along x, condenser, plate between electrodes, objective, analyzer A along y, Bertrand lens); eyepiece 440 px circle in white light; retardation (Michel-Levy) legend strip spanning 0 to Gamma at the NA edge; field arrow length = E.
- **Joy:** drag E up and the Maltese cross opens into two brushes whose melatopes separate along the 45-deg diagonal for E along x and along the axis for E along y, exactly at the computed optic-axis tilt; switch to white light and the first-order gray-white-yellow sequence appears around the center as the induced retardation grows.
- **Acceptance:** E = 0, d = 1.00 mm, 632.8 nm: dark rings at 11.09, 15.75, 19.38 deg external (+-0.02 deg); d -> 0 gives a dark field; fourfold symmetry of the pattern at E = 0; E = 1 kV/mm, r22 = 3.4 pm/V: induced Delta n = 4.064e-5, retardation along z 0.404 rad, tilt 1.26 deg internal / 2.88 deg external (first-order formula agrees with the eigen-decomposition to < 1%); E along x rotates in-plane axes by 45 deg, E along y does not rotate them.

## F2-02 Dispersion and thermo-optic explorer

- **Placement:** 2.1 L2 (n, n_g, birefringence), 2.1 L3 (model comparison, errata, dn/dT).
- **Question:** What are n_o, n_e, n_g of LN at any wavelength and temperature, how much do the published models disagree, and what do the errata change?
- **Model:** Sellmeier models as in manuscript table "Models and errata"; n_g and GVD by finite differences; dn/dT by central difference (+-1 K).
- **Functions:** `sellmeier.ts: nZelmon(lambda_um, axis, variant, {erratum: true|false})`, `nJundt(lambda_um, T_C)`, `nGayer(lambda_um, T_C, axis, variant)`, `groupIndex(nFn, lambda_um)`, `gvd(nFn, lambda_um)`, `dndT(nFn, lambda_um, T_C)`; each model exposes `validity: {lambda_um: [min, max], T_C: [min, max]}` and returns `null` outside it.
- **Data:** `data/dispersion/{zelmon1997-cln, zelmon1997-mgo5, jundt1997-cln-e, gayer2008-mgo5, gayer2008-mgo1sln}.yaml` with `errata` arrays; measured points `data/properties/indices-measured.yaml` (Nelson & Mikulyak via weis1985, P-comp; 472.7 nm row corrected and flagged).
- **Inputs:** wavelength cursor 0.4 to 5.0 um (log axis default on); temperature 20 to 250 C (models outside validity grey out); variant CLN / MgO5 / MgO1-SLN; quantity n | n_g | n_e - n_o | dn/dT; toggle "MgO5 as printed in 1997 / corrected".
- **Outputs:** readouts at the cursor for every active model, format `n_e 2.13756`, `n_g 2.1823`, `dn/dT 3.752e-05 /K`; max model spread at the cursor `spread 3.0e-04`.
- **TECH:** one 2D plot, 1 px lines distinguished by dash pattern, model legend as a boxed table with status badges; validity windows as hatched bands; readout table to the right.
- **VISUAL:** curves drawn over a spectrum bar (visible part in computed spectral color, 1064/1550 nm in declared false color); validity windows as soft bands; erratum toggle animates the MgO5 o and e curves swapping places (240 ms).
- **Joy:** flip the erratum toggle: the 1997-as-printed MgO5 curves cross into n_e > n_o, the readout flags "positive birefringence: impossible for LN" and the curves snap back; scrub temperature and watch n_e move about ten times more than n_o.
- **Acceptance:** Zelmon CLN 21 C: n_o(1.55) = 2.21111, n_e(1.55) = 2.13756; n_o(0.6328) = 2.28646, n_e = 2.20222; n_g,e(1.55) = 2.1823; zero material GVD at 1.913 um (e) and 1.899 um (o). Jundt n_e(1.55, 24.5 C) = 2.13786; dn_e/dT at 25 C: 4.888e-5 (632.8 nm), 4.010e-5 (1064), 3.752e-5 (1550). Gayer MgO5 24.5 C: n_e(1.55) = 2.13057, n_o = 2.20881. n_e < n_o everywhere inside validity for every corrected model. Measured Nelson & Mikulyak 632.8 nm points within 6e-4 of Zelmon.

## F2-03 Index ellipsoid: sections, walk-off, field deformation

- **Placement:** 2.1 L2 (state E = 0) and 2.2 L2 (state field on; includes the existing r-tensor matrix explorer of `mockup/chapter.html`).
- **Question:** Which index does a wave see for a given direction and polarization, and how does a field reshape the ellipsoid?
- **Model:** impermeability B = B0 + Delta B, Delta B_I = r_Ij E_j (eq. 2.6), exact 3 x 3 symmetric eigen-decomposition; section of the ellipsoid normal to k (2 x 2 projection) gives the two eigen-indices; walk-off from eq. in 2.1 L2.
- **Functions:** `tensors.ts: rTensor3m(set)`, `ellipsoid.ts: impermeability(n0, rSet, E)`, `eigSym3(B)`, `sectionIndices(B, k)`, `nExtraordinary(theta, no, ne)`, `walkoff(theta, no, ne)` (requested); `sellmeier.ts: nZelmon`.
- **Data:** `data/properties/r-tensor.yaml` (Turner S, Kaminow S, Zook/Lenzo/Bernal T).
- **Inputs:** E = 0 state: propagation polar angle theta 0 to 90 deg, azimuth phi; wavelength. Field state (existing): field direction x/y/z, optical polarization x/y/z, coefficient set, E = 1 V/um.
- **Outputs:** `n_o 0.00000`, `n(theta) 0.00000`, `rho 0.000 deg` (format masks); field state as in the mockup (index along polarization, delta n first order, principal indices, largest principal-axis tilt).
- **TECH:** wireframe ellipsoid as ASCII-shaded z-buffer render (same renderer family as the landing ASCII cell) with the elliptical section drawn in line characters; matrix explorer as the existing 6 x 3 boxed table with highlighted active entries.
- **VISUAL:** three.js ellipsoid (translucent, crystal straw tint), k arrow, section ellipse, Poynting vector drawn separately at the walk-off angle; field state deforms the ellipsoid with the declared x500 exaggeration (existing `v-ell` popup text); matrix as a glyph grid.
- **Joy:** sweep theta and watch the Poynting arrow peel away from k, reaching its largest separation just short of 45 deg, then rejoin at 90 deg; in the field state, E along x visibly twists the cross-section by 45 deg.
- **Acceptance:** theta = 0: both indices n_o; theta = 90 deg: n_o and n_e; max walk-off 1.938 deg at 44.03 deg (1550 nm), 2.000 deg at 44.00 deg (1064 nm), 2.150 deg at 43.92 deg (632.8 nm); field along z keeps the crystal uniaxial with delta n = -(1/2) n^3 r13 E and -(1/2) n^3 r33 E; field along x rotates in-plane axes by 45 deg; invariance under 120 deg rotation about z; same delta n as the atlas eo_overlap tensor code for the same convention (R11 S1).

## F2-04 MZM li2026aa and bulk Delta n

- **Placement:** 2.2 L1 (existing, port at fidelity).
- **Question:** How much does a volt change the index, and what does that do to a real modulator?
- **Model:** eq. 2.4 live; T = cos^2(pi V / (2 V_pi)); engine dashed curve from V_pi L engine over 0.9 cm.
- **Functions:** `mzm.ts: mzmT(V, Vpi, phi0)`, `sellmeier.ts: nZelmon`.
- **Data:** `data/devices/li2026aa.yaml` (V_pi 2.90 V at 1550 nm, reported; plus the V_pi vs wavelength rows 1310 to 2000 nm for the L2 table); `static/data/eo-overlap-li2026aa.json` (engine V_pi L).
- **Inputs:** drive voltage -6 to +6 V; bulk calculator: wavelength, E_z.
- **Outputs:** existing readouts (T, T in dB, phase in units of pi, |Delta n_eff| per arm measured-derived and engine).
- **TECH / VISUAL:** as approved in `mockup/chapter.html` and DevLog-003b sec. 8 (VISUAL: illustrated MZM top view, Au G-S-G, push-pull field arrows, 1550 nm false-color light, 44 px slider).
- **Joy:** at V = 2.90 V the illustrated output port goes dark while the field arrows in the two arms point in opposite directions; the engine curve sits 3% to the right of the measured one.
- **Acceptance:** |Delta n_e| = 1.504e-4 at 1 V/um, 1550 nm; E L for pi = 5.15 kV; T(V_pi) = 0; engine V_pi = 2.997 V.

## F2-05 EO overlap from FEM (li2026aa)

- **Placement:** 2.2 L3 (existing, port at fidelity; tightened copy in manuscript).
- **Question:** Where in the cross-section does the phase shift come from, and why does the textbook formula overestimate V_pi L by 20%?
- **Model:** eqs. 2.7 to 2.9; grid integrals of exported fields; numbers table.
- **Functions:** `eo.ts` (port of `mockup/eo.js`: decode base64 Float32, nodal and column-trapezoid integrals, region split, Gamma_x, scalar-TE eq. 2.8).
- **Data:** `static/data/eo-overlap-li2026aa.json` (moved from `mockup/data/`), 523 kB.
- **Inputs:** integrand total / r33 only; hover position.
- **Outputs:** hover readout `x +0.000 um  y +0.000 um  region rib   value +0.000e+00` (fixed); numbers table as in the mockup.
- **TECH:** grayscale and gray-diverging heatmaps (a) |E_x|^2, (b) e_x, (c) integrand, (d) depth profile bars; geometry outlines.
- **VISUAL:** inferno / red-blue maps; phase 2b exploded 3D stack (a) x (b) -> (c) as specified in DevLog-003b sec. 8.
- **Joy:** toggle total vs r33-only and the integrand map does not visibly change (r33 carries 99.66%); the depth profile shows 38% of the effect coming from the 120 nm slab under the rib.
- **Acceptance:** engine dn_eff/dV -1.4367e-5 /V; grid nodal sum -1.4424e-5 /V (+0.40%); region split 61.4 / 38.3 / 0.3%; Gamma 0.4771; Ebar 7.951e4 V/m per V; n_e/n_eff 1.208; V_pi L engine 2.697, textbook 3.238, measured 2.61 V cm.

## F2-06 d-tensor explorer

- **Placement:** 2.3 L2.
- **Question:** Which nonlinear coefficient does a given cut and polarization use, and why does birefringent phase matching give up d33?
- **Model:** eq. 2.11 with the 3m Kleinman-symmetric d (eq. 2.10); input field polarizations (two inputs for SFG/DFG, one for SHG) projected onto crystal axes; output nonlinear polarization vector and its projection on the chosen output mode.
- **Functions:** `tensors.ts: dTensor3m(set)`, `nonlinearPolarization(d, E1, E2)` (requested).
- **Data:** `data/properties/d-tensor.yaml` with rows: Volk compilation (legacy, P-comp), Zhu review (S), Shoji claimed (U), Kitamoto d31 (U). Default display set: symbolic (d33, d31, d22 as symbols, no numbers) until the author decides the default scale (open-questions Q1); numeric sets selectable, each with its badge.
- **Inputs:** cut x/y/z; propagation direction in plane; input polarization TE/TM (or o/e for bulk); coefficient set.
- **Outputs:** `P_NL / (2 eps0) = (+0.00, +0.00, +1.00) d33 E^2` (fixed vector format), `active  d33`, and with a numeric set `d33  25.2 pm/V` carrying that set's badge (U for Shoji).
- **TECH:** 3 x 6 boxed matrix with active cells inverted; input/output vectors as mono rows; small ASCII stereogram of the cut.
- **VISUAL:** crystal slab with c axis, input E arrows colored by wavelength (false color for IR), the radiated SH arrow in its spectral color; matrix as glyph grid where active glyphs glow.
- **Joy:** set bulk o + o inputs and rotate them in the xy plane: the d33 cell never lights, only d31 and d22; switch to x-cut TE and d33 fills the whole response.
- **Acceptance:** x-cut TE (E along z) -> P along z via d33 only; o-polarized inputs never activate column 3; E along x gives P_y = -2 eps0 d22 E_x^2 and P_z = 2 eps0 d31 E_x^2; E along y gives P_y = +2 eps0 d22 E_y^2; Kleinman: d15 = d24 = d31; 120 deg rotation about z leaves the response invariant.

## F2-07 Phase-matching calculator (BPM, QPM, OPO tuning, acceptance)

- **Placement:** 2.3 L2 (periods, BPM angle), 2.3 L3 (acceptance), 2.4 L2 (OPO tuning).
- **Question:** What period or angle phase-matches a process, how tolerant is it, and where does an OPO tune?
- **Model:** eq. 2.12 with bulk indices (Zelmon 21 C; Jundt for temperature, e only; Gayer for MgO variants); type-I BPM angle from eq. 2.2; acceptance FWHM = 2.783 / (L |d Delta k/dq|); OPO signal/idler by bisection on Delta k = 0 at fixed period (R11 kernel A2). Waveguide mode: n_eff(lambda) from the F2-15 lattice when available, with bulk and waveguide periods side by side.
- **Functions:** `phasematch.ts: deltaK(process, lambdas_um, T_C, model)`, `qpmPeriod(...)`, `bpmAngleTypeI(lambda_um, model)` (requested), `acceptance(process, L_m, param)`, `opoTuning(lambda_p_um, Lambda_um, T_C, model)`, `gvm(lambda1, lambda2, model)`; `sellmeier.ts`.
- **Data:** dispersion models (F2-02); thermal expansion of the period is not included (no sourced coefficient set paired with a Sellmeier set; R11 S3) and the readout says so.
- **Inputs:** process SHG / SFG / DFG / OPO; wavelengths; temperature; model; QPM order m and duty D; length L; mode bulk / waveguide.
- **Outputs:** `Lambda 18.989 um`, `L_c 9.495 um`, `theta_pm 49.55 deg | ------`, `rho 2.034 deg`, `FWHM lambda 0.588 nm`, `FWHM T 5.06 K` (Jundt, 25 C), `d lambda/dT 0.115 nm/K`, `GVM 302 fs/mm`; OPO: signal/idler curve vs period and vs temperature.
- **TECH:** two small plots (Delta k vs parameter; OPO tuning curve) and a boxed result table; poled stripe as an ASCII rule `|+|-|+|-|` scaled to the computed period at a fixed um-per-character.
- **VISUAL:** poled-domain strip drawn at the site-wide 2 px per um scale (DevLog-003b motif), so the bulk 1550 nm period (38 px) and the TFLN period (about 8 px) sit one above the other; OPO tuning curve as a rainbow of signal (visible colors where applicable, IR dashed false color); the sinc^2 acceptance curve fills under its FWHM.
- **Joy:** drag temperature and the whole OPO tuning fan swings, signal and idler moving in opposite directions with energy conserved at every point; switch bulk to waveguide and the poled strip compresses from 38 px to about 8 px.
- **Acceptance:** Zelmon CLN 21 C periods: 6.818 um (1064 SHG), 18.989 um (1550 SHG), 31.07 um (2090 SHG), 29.91 um (pump 1064, signal 1550, idler 3393.4 nm); Jundt 24.5 C 1550 SHG 18.976 um; coherence lengths 3.409 / 9.495 um; type-I BPM 1550 nm 49.55 deg (walk-off 2.034 deg), 2000 nm 45.01 deg, 1064 nm none (n_e(532) - n_o(1064) = +1.46e-3); FWHM x L: 0.102 nm cm (1064), 0.588 nm cm (1550); T FWHM x L (Jundt, 25 C): 1.60 / 5.06 K cm (1.61 / 5.07 at 24.5 C; 1.63 / 5.13 at 21 C); tuning 0.115 nm/K (1550, Jundt, 25 C); GVM 302 fs/mm; energy conservation 1/lambda_p = 1/lambda_s + 1/lambda_i to 1e-12 on every tuning point; R11 regression 6.818 / 18.989 um.

## F2-08 SHG growth along the crystal

- **Placement:** 2.3 L1 and L2.
- **Question:** Why does second-harmonic power oscillate without poling, grow as L^2 with it, and saturate at high pump?
- **Model:** coupled-mode equations (2.3 L3) integrated by RK4 along z with a poling function d(z) = +-d_eff (or uniform d for the unpoled case); undepleted and depleted limits overlaid.
- **Functions:** `coupledmode.ts: cmtIntegrate({kappa, dk, poling: 'none'|'qpm'|'custom', duty, loss_dB_per_cm, P0, L}, steps)`, `shgUndepleted(etaNorm, P, L, dk)`, `shgDepleted(etaNorm, P, L)`, `etaNorm(deff, lambda, nw, n2w, Aeff)`.
- **Data:** none beyond F2-02 indices; eta_norm input default 2600 %/W/cm^2 badge [wang2018optica reported]; alternative: compute from d (U) and A_eff (template).
- **Inputs:** poling none / QPM / QPM with duty error; pump power 1 mW to 10 W (log); length 0.1 to 50 mm; eta_norm; loss.
- **Outputs (format masks):** `P_2w 0.000e+00 W`, `conversion 00.00 %`, `eta_norm 00000 %/W/cm^2`, `%/W 00000.0` (for the chosen L), `absolute 00.00 %`.
- **TECH:** P_2w(z) on log/linear axes, 1 px lines for numeric, analytic undepleted, analytic tanh^2; domain map as a 1-line ASCII strip above the plot.
- **VISUAL:** the waveguide drawn as a long strip with domains alternating at the poled-rule motif, 775 nm light brightening along it in its computed spectral color (deep red), 1550 nm pump as dashed false color thinning as it depletes.
- **Joy:** with poling off, the SH glow pulses on and off every 9.5 um coherence length in bulk; switch poling on and the glow ramps monotonically; push the pump to watts and the curve bends from L^2 to tanh^2 while the pump trace fades.
- **Acceptance:** RK4 vs tanh^2 at Delta k = 0: 0.81929336 (R11 kernel C1, 1e-8); undepleted limit matches eq. 2.13 to 1e-6 at P_2w/P_w < 1e-4; unpoled bulk oscillation period in z = 2 L_c = 18.99 um at 1550 nm; Manley-Rowe P_w + P_2w conserved to 1e-9 without loss; duty error D: d_eff proportional to sin(pi D).

## F2-09 SHG efficiency ledger: records and normalizations

- **Placement:** 2.3 L3.
- **Question:** What do %/W/cm^2, %/W and absolute % each measure, and how do reported devices compare when the normalization is respected?
- **Model:** records plotted by year with the normalization as a separate series (never one shared axis for %/W/cm^2 and %/W); converter: eta_norm, L -> %/W; ring formula 16 g^2/(hbar omega kappa_a^2 kappa_b) for %/W vs Q at fixed g.
- **Functions:** `coupledmode.ts: ringShgEfficiency(g, kappa_a, kappa_b, kappa_ex)` (requested), `units.ts`.
- **Data:** `data/records/shg.yaml` from R08 2.4 and the manuscript table (yamada1993, wang2018optica, zhao2020oe, rao2019, li2024apn, park2022, mishra2021 (DFG), lu2019, lu2020), each row with normalization, wavelength, platform, verification flag.
- **Inputs:** series filter (waveguide / ring / DFG); log toggle (default on); converter fields.
- **Outputs:** hover card: value, unit, wavelength, platform, date (ISO), source, status; converter `%/W for L = 0.0 mm: 00000.0` (format mask).
- **TECH:** log-scale scatter with mono labels, one marker shape per normalization; table of the same rows below (sortable).
- **VISUAL:** two stacked panels sharing the year axis; markers colored by SH wavelength (computed spectral color; IR outputs dashed false color); the 1993 bulk-waveguide point drawn as the historical anchor.
- **Joy:** drag the ring Q slider in the converter and watch %/W climb as Q^3 past the ring records, while the %/W/cm^2 panel does not move: two different quantities made visible.
- **Acceptance:** plotted values equal `data/records/shg.yaml` exactly; no point appears on a panel whose unit differs from its own; converter: 2600 %/W/cm^2 and L = 0.5 cm -> 650 %/W; ring formula reproduces the general-coupling expression at kappa_ex = kappa/2.

## F2-10 Parametric gain and OPO threshold

- **Placement:** 2.4 L1 and L2.
- **Question:** How much gain does a pump give, and how much pump does a resonator need to oscillate?
- **Model:** eq. 2.14 (phase-sensitive gain), non-degenerate gain with mismatch; eq. 2.15 threshold and above-threshold output; reported devices as points.
- **Functions:** `coupledmode.ts: opaGain({etaNorm, Pp, L, dk})`, `opoThreshold({omega_p, kappa_p, kappa_p_ex, kappa_s, kappa_i, g})`, `opoOutput(P, Pth, couplingFactor)` (requested).
- **Data:** `data/records/opa-opo.yaml` (ledezma2022, jankowski2022, lu2021, mckenna2022, gao2021, ledezma2023, roy2023, hwang2023, hwang2026, stokowski2024).
- **Inputs:** OPA: eta_norm, pump peak power, length, Delta k. OPO: intrinsic Q at pump and signal, coupling ratios, g/2pi; pump power.
- **Outputs (format masks):** `gain 000.0 dB/cm`, `G 000.0 dB`, `P_th 0.00e+00 W`, `P_s+i 0.00e+00 W`, `efficiency 00.0 %`.
- **TECH:** gain vs length (log dB), P_out vs P_in with the threshold knee, both 1 px; reported thresholds as tick marks on the P axis.
- **VISUAL:** ring resonator illustration that stays dark below threshold and lights (signal and idler colors) above it; pump arrow length = P/P_th; the R12 "OPO" motif tied to real threshold arithmetic.
- **Joy:** drag the pump across threshold and the ring ignites at exactly P_th, the intracavity pump readout freezes (clamping) while output grows as sqrt(P/P_th) - 1, peaking in efficiency at 4 P_th.
- **Acceptance:** eta_norm 2600 %/W/cm^2: 14.0 / 44.3 / 140 dB/cm at 0.1 / 1 / 10 W; non-degenerate at Delta k = 0: G = cosh^2(Gamma L), tending to 1 + (Gamma L)^2 for small Gamma L; threshold scaling P_th proportional to Q^-3 (all resonant), Q^-2 (single-pass pump); efficiency maximum at P = 4 P_th equals (4 kappa_s,ex kappa_p,ex/(kappa_s kappa_p))/4, i.e. 100% only for kappa_ex = kappa at both modes.

## F2-11 Kerr vs cascaded chi(2)

- **Placement:** 2.5 L2.
- **Question:** When does a phase-mismatched chi(2) process out-pull the intrinsic Kerr effect, and with which sign?
- **Model:** eq. 2.16 against gamma_Kerr = 2 pi n2/(lambda A_eff); full RK4 for small |Delta k| L where eq. 2.16 fails.
- **Functions:** `kerr.ts: gammaKerr(n2, lambda, Aeff)` (requested), `coupledmode.ts: cascadedPhase({etaNorm, P, L, dk})` (requested), `cmtIntegrate`.
- **Data:** `data/properties/n2.yaml` (desalvo1996 P-db 9.33e-20 at 1064 nm; zhu2021 S 1.8e-19).
- **Inputs:** Delta k (signed, via period detuning or directly, log-symmetric slider), P, L, eta_norm, A_eff, n2 source.
- **Outputs:** `phi_Kerr +3.78e-04 rad`, `phi_casc -4.14e-03 rad`, `ratio -10.9`, `SH fraction (z-avg) 1.3e-05`, `sign defocusing|focusing ` (padded).
- **TECH:** phi vs Delta k on a symlog axis: Kerr as a horizontal line, cascaded as the odd 1/Delta k curve; RK4 points overlay.
- **VISUAL:** a pulse drawn as an envelope that compresses or spreads in a schematic waveguide according to the net sign; colors only from wavelengths involved.
- **Joy:** sweep Delta k through zero: the cascaded phase diverges, flips sign and decays, while the Kerr line stays flat; at the chosen design point the arrow reads "11x Kerr".
- **Acceptance:** RK4 vs eq. 2.16: 4.1378e-3 vs 4.1380e-3 rad at eta_norm 2.6e5 /(W m^2), P 0.1 W, L 1 cm, Delta k 2 pi/(100 um); |gamma_casc| 4.1 /(W m); z-averaged SH fraction 1.3e-5 (peak 2.6e-5); arg(A_w) = +4.1378e-3 rad in the A exp(i(omega t - k z)) convention (= -Delta phi_NL); gamma_Kerr 0.378 /(W m) at A_eff 1 um^2; sign: Delta k > 0 negative (defocusing); odd symmetry in Delta k.

## F2-12 Kerr soliton comb (LLE)

- **Placement:** 2.5 L2 / L3.
- **Question:** How do soliton steps form in a detuning scan, and what sets the comb span?
- **Model:** eq. 2.17, split-step Fourier, N = 512 default (2048 expert), Web Worker; normalized parameters with conversion from physical (Q, FSR, D2, gamma, P_in) printed; optional slow index term for photorefraction labeled template.
- **Functions:** `kerr.ts: lleStep(state, params, dt)`, `lleNormalize({Q, FSR, D2, gamma, Pin})`, `lleScan(params, zetaRange, rate)` (requested names; PHY list has "Lugiato-Lefever" via R11 S7c).
- **Data:** none (all template defaults, clearly badged); reference cases cross-checked offline against gnlse-python or pyLLE (R11 5.2).
- **Inputs:** pump f, detuning scan range and rate, d2, photorefractive term on/off.
- **Outputs:** intracavity power vs detuning (steps), spectrum (log), waveform; format masks `solitons 00`, `zeta +00.00`, `span(-40 dB) 0000 lines`.
- **TECH:** three stacked plots (trace, spectrum, waveform), monochrome, updated per frame only while running; Run / Stop buttons.
- **VISUAL:** spectrum lines drawn as a comb in false color over the telecom band, waveform as a ring with soliton pulses circulating; optional sonification off by default (R12).
- **Joy:** run the red-detuning scan and watch chaotic noise collapse into discrete steps, each step one soliton fewer, ending on a single smooth sech^2 spectrum.
- **Acceptance:** single-soliton spectrum fits sech^2 with the analytic width for the given zeta, d2 (Herr 2014 approximation); energy balance check per step; existence range lower edge consistent with the bistability threshold; worker stays under 16 ms per frame at N = 512 (R11 measured 72k steps/s).

## F2-13 Resonant EO comb

- **Placement:** 2.6 L1 and L2.
- **Question:** How do drive voltage and finesse set the width of an electro-optic comb?
- **Model:** eq. 2.18 steady state sampled on 4096 fast-time points + FFT (R11 kernel E1); analytic asymptotic slope 8.686 asinh(|ln r|/beta) dB/line (high-finesse form 27.29/(beta F)); dispersion and detuning via coupled-mode ODE over N sidebands (R11 S7b) in expert mode.
- **Functions:** `ring.ts: eoCombSteady(r, beta, N)`, `eoCombSlopeDB(r, beta)` (requested), `eoCombCMT(params)` (requested), `allPass(...)`.
- **Data:** `data/records/eo-comb.yaml` (zhang2019, hu2022, zhangk2023, yu2022, zhangj2025 tagged LT).
- **Inputs:** V_p / V_pi,rt (beta), intrinsic Q and coupling (or r), FSR, D2 (expert), counting threshold (dB).
- **Outputs:** `F 0000.0`, `beta 0.000 rad`, `slope 0.000 dB/line`, `lines(-60 dB) 0000`, `span 000.0 nm` (format masks; example state r = 0.99, beta = 0.314 rad gives F 312.6, slope 0.278 dB/line, 431 lines above -60 dB).
- **TECH:** log-power stem plot of lines with the analytic envelope as a dashed line; boxed readouts.
- **VISUAL:** ring with electrode drawn; comb lines rising from the pump like an organ rank (R12 four-wave/comb motif applied to EO), in false color with spectral color only if lines enter the visible.
- **Joy:** double the voltage and the comb's skirt lowers its slope by exactly half; the numerical lines sit on the analytic envelope line to within a line width.
- **Acceptance:** asymptotic slope 8.686 asinh(|ln r|/beta) dB/line: 0.8715 (r = 0.99, beta = 0.1), 0.2177 (r = 0.995, beta = 0.2), 0.3477 (r = 0.998, beta = 0.05); numerical fit over lines 5 to 40 within 0.001 dB/line of these; high-finesse form 27.29/(beta F) within 0.5% at F > 300; beta -> 0 gives a single line; spectrum conserves total power to 1e-9 against the time-domain mean.

## F2-14 Coupled-ring frequency shifter

- **Placement:** 2.6 L2.
- **Question:** How does a microwave move light between two frequency bins of a photonic molecule?
- **Model:** two-mode coupled-mode theory in the supermode basis; eq. 2.19 steady state; time-domain view of Rabi-like transfer for pulsed input.
- **Functions:** `ring.ts: shifterTransfer({kappa_a, kappa_b, kappa_a_ex, kappa_b_ex, G, detuning})` (requested), `shifterTimeDomain(...)` (requested).
- **Data:** `data/records/eo-shifter.yaml` (hu2021: 28 GHz, about 90%, cascaded 119.2 GHz with 29.8 GHz drive).
- **Inputs:** ring coupling mu (sets 2 mu), microwave frequency, drive voltage (G), intrinsic and external Q.
- **Outputs (format masks):** `shift +00.0 GHz`, `efficiency 00.0 %`, `G/kappa 0.00`, `carrier -00.0 dB`.
- **TECH:** two-level diagram in ASCII (supermodes as lines, microwave as a vertical arrow) plus efficiency vs G plot.
- **VISUAL:** two rings illustrated with electrodes; light drawn in two false-color hues for the two frequency bins, flowing from one supermode to the other as G rises.
- **Joy:** set G = kappa/2 with no intrinsic loss and the input bin empties completely into the shifted bin; detune the microwave from 2 mu and the transfer collapses.
- **Acceptance:** eq. 2.19 maximum 1 at G = kappa/2, kappa_ex = kappa; zero transfer at G = 0; symmetric in detuning; time-domain steady state equals eq. 2.19.

## F2-15 TFLN rib waveguide: modes, hybridization, ring anisotropy

- **Placement:** 2.7 L1 and L2.
- **Question:** How do film thickness, etch depth, width and cut set the mode, where do TE and TM hybridize, and how does an x-cut ring see a rotating crystal?
- **Model:** precomputed full-vector FEM lattice from the atlas engine (R11 S5: thickness 300 to 900 nm, etch fraction 0.2 to 1.0, width 0.6 to 3.0 um, sidewall 60/70/80 deg, wavelengths 0.775/1.064/1.55 um, x-cut TE/TM and z-cut TE/TM), interpolated; held-out live solves report the interpolation error; ring tab: bulk-approximation n(phi) (manuscript 2.7 L2) labeled as approximation.
- **Functions:** `modes.ts: modeLattice.query({t, etch, w, sidewall, lambda, cut, pol})` (requested; new module), `ellipsoid.ts: nExtraordinary`; live solve via the atlas worker only after the GPL boundary decision (R11 risk 1).
- **Data:** `data/tfln-modes/lattice.json` + sparse field images (not yet in the API lane plan; requires an atlas precompute run; until then the figure shows a reserved, labeled empty frame).
- **Inputs:** t, etch depth, width, sidewall, wavelength, cut, polarization; ring tab: propagation angle phi.
- **Outputs (format masks):** `n_eff 0.0000`, `n_g 0.000`, `A_eff 0.00 um^2`, `LN fraction 0.00`, `hybrid TE 0.00 / TM 0.00`, `interp. error 0e+00`; ring tab `n(phi) 0.0000`.
- **TECH:** n_eff vs width curves for TE0, TM0, TE1 with the anticrossing marked; field map in grayscale; ring tab as a polar plot of n(phi).
- **VISUAL:** extruded 3D cross-section (Si, oxide, LN with c-axis arrow, electrodes) with the mode as a translucent intensity surface and its polarization ellipses; ring tab shows the ring drawn on the wafer with crystal axes and an index color band around the circumference.
- **Joy:** drag the width through the TE1/TM0 crossing in an x-cut rib with slanted sidewalls: the mode's polarization ellipses rotate into diagonal hybrids and back; in the ring tab, rotate the wafer and watch the index band (twice per round trip) move with the crystal.
- **Acceptance:** at li2026aa geometry (300 nm film, 180 nm etch, 3.5 um, 60 deg, x-cut TE, 1550 nm) lattice n_eff within 1e-3 of 1.7696 and n_g within 1e-3 of 2.135 (engine); slab limit (w large) approaches the slab-waveguide solution; z-cut TE ring: n(phi) constant; x-cut ring bulk approximation spans exactly n_e to n_o (2.1376 to 2.2111 at 1550 nm); hybridization trends consistent with kaushalram2020 (dependence on sidewall angle and wavelength) and tan2024 (x-cut ring TE-TM conversion).

## F2-16 Loss and Q ledger

- **Placement:** 2.7 L2 / L3.
- **Question:** How do Q and dB/m convert, and how close are TFLN devices to the material floor?
- **Model:** eq. 2.20 converter (needs n_g and lambda); records by year with floors: material-limited estimate (shamsansari2022) and bulk absorption range lower bound (leidinger2015).
- **Functions:** `units.ts: qToLoss({Q, ng, lambda})`, `lossToQ(...)` (requested).
- **Data:** `data/records/loss.yaml` (zhang2017, luke2020, zhu2024, gao2022, gao2021, desiatov2019, shamsansari2022), `data/properties/absorption.yaml` (leidinger2015 range; schwesyg2011 bounds).
- **Inputs:** Q_i, n_g, wavelength (converter); log toggle (default on).
- **Outputs:** `alpha 1.40 dB/m`, `Q_i 2.90e+07`, `alpha 0.322 /m`.
- **TECH:** log-loss vs year scatter, horizontal dashed lines for floors, boxed converter.
- **VISUAL:** a staircase of ring illustrations whose rim brightness encodes Q, descending the loss axis toward the material floor drawn as a glowing band.
- **Joy:** type the material-limit Q into the converter and the cursor lands on the floor band; the gap between the best dry-etched ring and that band is printed as a factor.
- **Acceptance:** Q_i 1e7, n_g 2.3, 1550 nm -> 4.05 dB/m; 2.9e7 -> 1.40 dB/m; 1.6e8 -> 0.25 dB/m; 1e-4 /cm = 0.043 dB/m; plotted points equal the data file.
