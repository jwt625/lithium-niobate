# Figure map: figures -> physics functions

Lane PHY2, 2026-10-25. Every figure id in `content/chapters/*/figures.md` (and the chart ids in `06-devices/chart-specs.md`, `08-industry/chart-specs.md`) mapped to the functions it needs in `src/lib/physics/`. Module prefix = file name (`saw.sawCut` = `saw.ts`). "Existing" = written by lane PHY before this lane; everything else was added by PHY2. Tests: `node --test src/lib/physics/` (253 tests, all passing on 2026-10-25).

Status codes: **done** (implemented and tested against the figure's acceptance numbers), **existing** (PHY functions already cover it), **template** (implemented; inputs labelled template in an exported `prov` map, UI must badge them), **stub** (typed function returns a no-data status), **data** (no physics; data lane only), **gap** (needed, not implemented; reason given).

## 01 The crystal

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| FIG-01-01 Cell explorer | `crystal.expandCell`, `hexToRhomb`, `planeAngleToC`, `neighborShells`, `octahedralColumn`, `hexCellMatrix`, `fracToCart` | `static/data/linbo3-cell.json`, (h k i l) -> atoms, a_R 5.4943 A / alpha 55.872 deg, cleavage 32.749 deg, neighbour shells, column order | done |
| FIG-01-02 One cell, flipped | `crystal.flipModel`, `polarDisplacements`, `interpolateFlip`; `ferro.quarticWell`, `quarticBarrier`, `INBAR1996_WELL` | cell, s, frame, field tilt -> positions, displacements (Nb 0.275, Li 0.713 A O-fixed), well curve | done; well shape template; 2858 K vs 2889 K conversion note in `INBAR1996_WELL` |
| FIG-01-03 Composition dial | `composition.liNbRatio`, `defectFractions`, `tcIyi`, `tcBordui`, `tcBand`, `uvEdge`, `seededLattice`, `crystalFromMelt` | c (mol% Li2O), defect model, seed -> [Li]/[Nb], defect fractions, Tc band, lambda_20/15 with validity flag, texture | done |
| FIG-01-04 Defect and polaron gallery | `units.umToEV`/`eVToUm`/`wavenumberToUm` (existing); `prslab.POLARON_BANDS`, `polaronBandShape` | band energies -> nm, Gaussian shapes only where a width is tabulated | existing + done; spectral display colour lives in the UI layer |
| FIG-01-05 Threshold explorer | `composition.mgBasisConvert` (returns `value: null` + note) | basis switch -> note | done; data rows are lane API; the "about 2x" basis note is under audit question (see Gaps) |
| FIG-01-06 Neumann machine | `symmetry.groupOps3m`, `closeGroup`, `symmetrize`, `neumann`, `stabilizer`, `groupName` | tensor kind, operation toggles, field direction -> Voigt classes, independent count (1, 2, 4, 4, 6, 8), group name (3m, m, 1) | done |
| FIG-01-07 Which face is +z | none (`units.ts`; API values) | - | data |
| FIG-01-08 Hysteresis comparator | `ferro.loopFields`, `loopBranch`, `coerciveVoltage`, `HYSTERESIS_TEMPLATE` | Ec, Eint, Ps, t -> loops, wafer voltage | done; loop shape template |
| FIG-01-09 Poling bench | `ferro.createPolingState`, `polingStep`, `runPoling`, `switchingCurrent`, `switchingChargeFromCurrent`, `dutyCycle`, `kaiFit`, `POLING_TEMPLATE` | params, V(t), seed -> domain maps, X(t), I(t), Q = 2 Ps A, duty, KAI n | template (all rates); Eint no longer double-counted (audit fix) |
| FIG-01-10 Powers of ten along a wall | `ferro.boundCharge`, `sheetDensity` | Ps, theta -> sigma_b 0.0248 C/m^2, 1.55e13 e/cm^2 at 1 deg | done |

## 02 Light

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| F2-01 Conoscope | `crystaloptics.conoscope`, `zcutRetardanceExact` (existing); `ellipsoid.ringAngles`, `ringAngle`, `ringAngleSmall`, `opticAxisTilt` | d, lambda, E, direction -> image, dark rings 11.09/15.75/19.38 deg, dn 4.064e-5, tilt | done; exact tilt 1.22 (E y) / 1.30 (E x) deg internal differs from the printed first-order 1.26 by about 3% (spec claims < 1%; spec to be corrected) |
| F2-02 Dispersion and thermo-optic | `sellmeier.*` (existing) | lambda, T, model -> n, n_g, GVD, dn/dT | existing |
| F2-03 Index ellipsoid | `crystaloptics.impermeability`, `eigenIndices`, `extraordinaryIndex`, `walkoffAngle` (existing); `ellipsoid.sectionIndices`, `maxWalkoff` | theta, E -> indices, walk-off max 1.938/2.000/2.150 deg | done |
| F2-04 MZM and bulk dn | `modulator.mzmTransmission` (existing); `ellipsoid.pockelsDn`, `piFieldLength` | V, E -> T, dn 1.504e-4, E L 5.15 kV | done |
| F2-05 EO overlap from FEM | `eo.eoAnalyze`, `eoNumbers`, `eoProbe`, `eoRegion`, `decodeF32` | `static/data/eo-overlap-li2026aa.json` -> region split 61.4/38.3/0.3%, Gamma 0.4771, VpiL 2.697/3.238 V cm, hover probe | done; nodal deviation computes +0.39% (spec prints +0.40%) |
| F2-06 d-tensor explorer | `tensors.dShg3m` (existing); `nonlinear.nonlinearPolarization`, `activeVoigtColumns` | fields, d set -> P_NL, active cells | done |
| F2-07 Phase-matching calculator | `phasematching.*` (existing: `qpmPeriod`, `birefringentAngle`, acceptance, `opoSignalIdler`); `nonlinear.gvm`, `shgQpmTuningRate` | process, lambdas, T -> period, BPM angle, FWHM, GVM 302 fs/mm, 0.115 nm/K | done |
| F2-08 SHG growth | `coupledmode.shgRK4`, `shgUndepleted`, `shgDepleted`, `qpmDeffFactor` (existing) | - | existing |
| F2-09 SHG efficiency ledger | `nonlinear.percentPerW`, `ringShgEfficiency`, `ringShgEfficiencyCritical` | eta_norm, L, g, kappas -> %/W | done |
| F2-10 Parametric gain and OPO | `coupledmode.opaGain` (existing); `nonlinear.opaGainDbPerM`, `opoThreshold`, `opoOutput`, `opoCMT` | eta, P, kappas, g -> 14.0/44.3/140 dB/cm, P_th, output (max at 4 P_th) | done |
| F2-11 Kerr vs cascaded chi(2) | `nonlinear.cascadedPhase`, `cascadedRK4`, `gammaCascaded`, `cascadedShFraction`, `gammaKerr` | eta, P, L, dk, n2, Aeff -> 4.1378e-3 rad, 0.378 /(W m) | done |
| F2-12 Kerr soliton comb | `lle.lleNormalize`, `lleHomogeneous`, `lleBistableRange`, `lleCreate`, `lleSolitonAnsatz`, `lleStep`, `lleSpectrum`, `lleCountSolitons`, `lleScan`, `lleEnergyResidual` | Q, FSR, D2, gamma, Pin -> trace, spectrum, soliton count | template (physical inputs) |
| F2-13 Resonant EO comb | `ring.eoCombThrough`, `eoCombCMT` (existing); `resonators.eoCombIntracavity`, `eoCombSlopeDB`, `eoCombSlopeDBHighFinesse`, `fitLineSlopeDB`, `countLines` | r, beta -> lines, slope 0.8715/0.2177/0.3477 dB/line | done; eq. 2.18 spectrum has 423 lines above -60 dB vs 431 from the envelope estimate printed |
| F2-14 Coupled-ring shifter | `resonators.shifterTransfer`, `shifterTimeDomain` | kappas, G, detuning -> efficiency (max 1 at G = kappa/2) | done |
| F2-15 TFLN rib modes | `ellipsoid.xcutRingIndex` (ring tab, bulk approximation) | phi -> n(phi) | gap: mode lattice needs precomputed FEM data (none held; GPL boundary R11 risk 1) |
| F2-16 Loss and Q ledger | `units.alphaFromQ` (existing); `resonators.qToLoss`, `lossToQ`, `perCmToDbPerM` | Q, n_g, lambda -> 4.05/1.40/0.25 dB/m | done |

## 03 Sound

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| F3.1 Longitudinal piezo surface | `piezo.convertForms`, `longitudinal`, `dirFromAngles`, `longitudinalMaxAbs`; `tensors.voigtToTensor3` | kushibiki1999 c, e, eps^S; theta, phi -> d_L (20.30 / 8.69 pC/N; max 38.80 at 118.9 deg) | done |
| F3.2 Constitutive forms | `piezo.convertForms`, `voigtFactor`, `voigtCellComponents`, `hydrostaticD`, `couplingFactors` | given form, clicked cell -> all forms (c33D 249.35 GPa, g33 0.0345, h33 8.01e9), factor | done |
| F3.3 Bulk slowness | `acoustics.christoffel`, `christoffelSweep` (existing); `piezo.groupVelocity` | direction, stiffening -> v, v_g, power-flow angle | done |
| F3.4 Cut-angle explorer | `saw.sawFrameRotY`, `sawProblem`, `sawSolve`, `sawCut`, `sawSweepRotY` | material set, theta, surface, branch -> v_free, v_met, k^2, leaky loss (dB/lambda), status root / threshold-pinned / none | done; precompute JSON at build time (0.5 deg sweep 25 s) |
| F3.5 SAW anatomy | `saw.sawFields`, `sawPartialWaves` | cut, surface, velocity -> u1, u2, u3, phi vs depth, orbit sense, energy within 1 lambda, BC residual | done |
| F3.6 IDT designer | `saw.idtF0`, `idtArrayFactor` (spec form), `idtArrayFactorFingers`, `idtConductanceShape`, `idtNullBandwidth` | v, p, N -> f0 994.6 MHz at p = 4 um, response, nulls | done; spec form has a grating lobe at 2 f0, use the finger form beyond 1.5 f0; absolute conductance gap (C03 Q5) |
| F3.7 Bragg AO cell | `ao.bragg`, `braggFrequency`, `aoFiguresOfMerit`, `pFromM2`; `sellmeier` | lambda0, f, v, n -> Lambda 6.545 um, theta_B,ext 6.80 deg, M1/M2/M4 | done; efficiency gap (C03 Q6) |
| F3.8 Photoelastic tensor | `photoelastic.fullFrom3m`, `voigtToFull`, `flipP14P41`, `rot180Z`, `inPlaneDir`, `inPlaneSweep`, `inPlaneMaxima`, `shearCoefficient` | p set (tensors.json), cut, phi, flip -> p'_bbbb(phi), maximum | done |
| F3.9 Follow one microwave photon | `optomech.transductionEfficiency`, `internalGain`, `P05_PARAMS` | n_c, detuning -> C, eta, gain | done (reported parameters) |
| F3.10 Heralded microwave photon | `optomech.thermalOccupation` | f, T -> n_th | done; plots are lane API data |
| F3.11 Nanobender | none (closed-form scaling on the page) | - | data |

## 04 Quirks

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| fig-04-01 Write and erase | `prslab.slabState`, `SLAB_PRESETS`, `photoconductivity`, `photovoltaicSaturationField`, `dielectricRelaxationTime`, `scFieldWrite`, `scFieldErase`, `pockelsDeltaN` | I, t, preset, sigma_d -> E(t), tau_lit, tau_dark 2.48e5 s, dn | done; alpha, kappa template |
| fig-04-02 Fringes to field | `prslab.grating1D`, `diffusionField`, `diffusionFieldAmplitude` | Lambda, m, kG weight, T -> I, rho, E, dn, phase (90 / 0 deg limits), 1.597e5 V/m | done |
| fig-04-03 MgO threshold plot | none | - | data |
| fig-04-04 Ring sweep | `thermal.ringSweep`, `ringRates`, `RING_SWEEP_TEMPLATE`, `thermalShiftPerK`; `ring.allPass` (existing) | P, sweep direction/speed, PR on/off -> T(lambda), dT_cav, E_sc (thermal triangle) | template; adiabatic optical field (sweeps slower than the cavity lifetime) |
| fig-04-05 Polaron ladder and GRIIRA | `prslab.POLARON_BANDS`, `polaronBandShape`, `griiraToy`, `griiraNmaxScale`, `GRIIRA_MG_THRESHOLD`; `thermal.qpmDetuningDT` | green I, MgO, crystal -> bands, N, alpha_IR, dT, SHG_rel | bands P-comp; chain template |
| fig-04-06 Intensity ladder | none | - | data |
| fig-04-07 Heat a wafer | `pyro.pyroCharge`, `pyroField`, `pyroVoltage`, `screenedDecay`, `P3_OPTIONS`, `EPS33T_WARNER`; `prslab.pockelsDeltaN` | dT, cut, d, p3, sigma -> charge, field, voltage, dn, decay | done |
| fig-04-08 Drift simulator | `pyro.stackStep`, `stackResponse`, `maxwellWagner2`, `mwTau`, `arrhenius`, `DRIFT_PRESETS`; `drift.*`, `modulator.mzmTransmission` (existing) | layers, V(t), T -> V_LN(t), bias point, H(f); tau 11.9 ms / 88.6 us presets | done; layer values template, tuned to reported tau |
| fig-04-09 Thermal calculator | `thermal.dnedT`, `morettiDnDT`, `thermalLensFocal`, `thermalShiftPerK` | lambda, T, lens/ring inputs -> dn/dT, f (61 mm example), pm/K | done; cti1999 dn_o/dT curve gap (spot values only in data/) |
| fig-04-10 Li out-diffusion | `schlarb.schlarbIndex`, `schlarbDnDc`, `liDeficitProfile`, `outDiffusionIndex`, `erfc`; `composition.tcBordui`, `tcIyi` | surface deficit, sqrt(Dt), lambda -> c(z), n_e/n_o(z), Tc(z) | done (Schlarb status S via R14 N2, undoped only); D template |
| fig-04-11 Pitfall cards | `pyro.pyroVoltage`, `pyroCharge` | - | done |
| fig-04-12 Drift mitigations | none | - | data |
| footer motif | `pyro.displayDrift` | t -> phase | template |

## 05 Making

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| F05-01 Process viewer | `fab.czBodyLength`, `prestonRate`, `sidewallAngle`, `maskRecession`, `implantRange`, `stepperFieldCount`; `thinfilm.lnoiColor` | process-flow.yaml PDims -> HUD values, film colour | done; implant width, Kp, redeposition template |
| F05-02 Czochralski | `fab.czBodyLength`, `czPullTime`, `cylinderMass`; `composition.tcBordui`, `tcIyi` | v, t, D, L, c -> L(110 h) = 110 mm, 9.4 kg, Tc(48.38) 1143.2 / 1138.7 C | done |
| F05-03 Wafer and cut explorer | `tensors.rotatedYCut`, `namedCut`, `eulerZXZFromMatrix` (existing) | cut, theta -> normal (0, -0.616, 0.788 at 128 deg), axes, Euler angles | existing |
| F05-04 Bulk waveguides | `fab.peRate`, `peDepth`, `arrheniusEa`, `PE_JACKEL1982` | T, t, convention -> d 2.34 um at 249 C 4 h, Ea 0.90 eV, validity flag | done; Ti: no sourced D (points only) |
| F05-05 Ion slicing | `fab.implantRange`, `IMPLANT_REPORTED` | ion, E -> R_p only at 195 keV (0.68 um, guarino2007), else `status: "no verified data"` | stub (no verified range table) |
| F05-06 CMP thinning | `fab.prestonRate`, `prestonTime`; `thinfilm.lnoiColor`, `lnoiReflectance`, `stackRT` | h, Kp, P, v, oxide -> removal, sRGB colour | done; Kp template (no LN value) |
| F05-07 E-beam vs stepper | `fab.eblWriteTime`, `stepperFieldCount`, `fieldsInCircle` | dose, area, current, wafer, field, edge -> 21.1 h/cm^2, 6 / 21 fields | done |
| F05-08 Argon etching | `fab.sidewallAngle`, `maskRecession` | S, a_mask -> 88.3 deg (upper bound) | done |
| F05-09 Loss and Q by route | `units.alphaFromQ`, `qFromAlpha` (existing); `resonators.qToLoss` | Q, n_g, lambda -> dB/m | existing |
| F05-10 Thin-film poling | `electrostatics.solveStack2D`, `gradedAxis`, `nodalField`, `fieldAt`, `fieldVsDepth`, `meanFieldInBox`, `capacitancePerLength`; `rf.lnLayer`, `SIO2_TEMPLATE`, `SI_TEMPLATE`; `phasematching.qpmDeffFactor` | geometry, V, period, duty -> E(z), E_peak, d_eff | done; SiO2/Si permittivity template; domain kinetics template (`ferro` automaton) |
| F05-11 Rock to chip | `fab.waferMass`, `MOLAR_MASS`, `nbMassFraction`, `chargePerKg`, `ATOMIC_WEIGHT` | D, t, rho -> LN and Nb mass | done |

## 06 Devices (and chart specs A1-A7)

| Figure | Functions | Inputs -> outputs | Status |
|---|---|---|---|
| F6.01 Device map | none | - | data |
| F6.02 Modulator bench | `modulator.mzmTransmission`, `eyeDiagram`, `prbs` (existing); `devices.eyeDiagramPAM`, `eyeOpeningsPAM`, `symbolsFromBits`, `pamLevel` | baud, format, Vpp, bias, Vpi, f3dB -> eye, openings | done |
| F6.03 VpiL calculator | `devices.vpiLPushPullVcm`, `impliedOverlap`; `sellmeier` | lambda, gap, r33, Gamma -> 2.58 / 2.75 V cm, ratio 4.18 | done |
| F6.04 Traveling-wave response | `modulator.twResponse`, `s21EOdB`, `bandwidth`, `f3dBVelocityMismatch` (existing; series limit added); `rf.twParamsFromLoss`, `f3dBLossOnly`, `twResponseNumeric`, `lineAmplitudes`; `devices.s21Curve`, `PRESET_CHEN2022C` | L, nRF, ng, loss, Z0, Zs, ZL -> S21_EO, -3 dB; 0.443 c/(L dn), 0.738 Np, 88.5 / 317 GHz | done; Chung 1991 equations not readable (closed access): checked against an independent numerical line solution and Alferness 1982 limits |
| F6.04 RF line terms | `rf.coplanarLine` (CPW conformal mapping / partial capacitance), `coplanarLineFD` (2D solver), `ellipticK`, `kRatio`, `quasiTEM` | S, W, layers -> C, eps_eff, n_RF, Z0 | done; partial capacitance 9% high on TFLN stacks: use `coplanarLineFD` there |
| F6.05 Atlas centerpiece (A1) | none (atlas data) | - | data |
| F6.06 Footprint (A4, A5) | `devices.vpiLPushPullVcm` (A5 overlay) | - | data + done |
| F6.07 Ring modulator (A7) | `ring.allPass` (existing); `devices.ringFromQ`, `linewidthGHz`, `photonLifetimePs`, `resonanceShiftPm` | Q_L, lambda, n_g, R -> a, r, 33.9 / 10.7 GHz | done |
| F6.08 SHG converter | `coupledmode.shgDepleted`, `shgUndepleted`, `phasematching.qpmPeriodSHG` (existing) | - | existing (78.9% reproduced) |
| F6.09 OPO threshold | `devices.opoTriplyResonant`, `opoThresholdDRO`, `kappaFromQ`; `nonlinear.opoThreshold` | Q, g -> P_th (Q^-3 / Q^-2), output | done; g template |
| F6.10 Resonant EO comb | `ring.eoCombThrough`, `eoCombCMT` (existing); `devices.combLinesAbove`, `combSpanNm`; `resonators.*` | beta, loss, detuning -> lines | done; zhang2019 formula citation open (C06 Q6.4) |
| F6.11 Transducer efficiency | none | - | data |
| F6.12 IDT across a waveguide | `devices.idtPeriod`; `saw.sawCut` (velocity) | v, f -> pitch | done |
| A2 Velocity matching map | `modulator.f3dBVelocityMismatch` (optional contour) | - | data + existing |
| A3 Implied overlap | `devices.impliedOverlap` | - | done |
| A6 Records strip | none | - | data |

## 07 History

| Figure | Functions | Status |
|---|---|---|
| F7.0 Chronology, F7.1 Family tree, F7.2 Pull a boule (illustration, no data), F7.5b, F7.7, F7.9, F7.10, F7.D, F7.P | none | data |
| F7.2b OPO dial | `phasematching.opoSignalIdler`, `qpmPeriod` (existing) | existing |
| F7.3 Write, fix, erase | `prslab.scFieldWrite`, `scFieldErase` (display time constant) | done (display values labelled) |
| F7.4 SAW ripple | `saw.sawCut` (128 deg Y-X v, k^2), `saw.idtF0` | done |
| F7.5 Diffusion profile | `fab.peDepth`; `schlarb.liDeficitProfile`, `erfc` | done (model curves derived; Ti: points only) |
| F7.6 The stripes | `phasematching.qpmPeriodSHG` (existing: 6.818 / 18.989 um) | existing |
| F7.8 Ion slice | `fab.implantRange` | stub (sourced pairs shown as points) |

## 08 Industry

| Figure | Functions | Status |
|---|---|---|
| F8.01-F8.10, chart specs B1-B6 | none | data |
| F8.11 Niobium per wafer | `fab.waferMass`, `nbMassFraction`, `MOLAR_MASS` (rho from kushibiki1999 or volk2008 per the spec) | done |

## SAW solver reference values (kushibiki1999, `saw.test.ts`)

| Cut | Branch | v_free (m/s) | v_met (m/s) | k^2 | Note |
|---|---|---|---|---|---|
| Y-Z | Rayleigh | 3486.38 | 3412.70 | 4.227% | C03 3486.4 / 3412.7 / 4.23%; vendor 3488 |
| 128 deg Y-X | Rayleigh | 3978.36 | 3870.72 | 5.411% | C03 3978.4 / 3870.7 / 5.41%; vendor 3980; k^2 max 5.42% at 129 deg |
| 64 deg Y-X | leaky | 4691.36 - 4.345i | 4448.22 - 0.271i | 10.37% | loss 0.051 / 0.0033 dB/lambda |
| 41 deg Y-X | leaky | 4749.31 - 0.017i | 4376.20 - 1.284i | 15.71% | isolated root 0.77 m/s below the fast shear velocity (C03 called it threshold-pinned); loss 2.0e-4 / 0.016 dB/lambda |
| 128 deg Y-X | leaky | pinned (4029.0) | pinned | none | genuine merge with the slow shear threshold |

Independent checks: isotropic Rayleigh (v_R/v_s = 0.919402, 1e-8), Bleustein-Gulyaev closed form (open and shorted, 1e-5 m/s), Warner and ogi2002 sets from the lane-API tensors (C03 L3 table), symmetry (e -> -e, propagation reversal).

## Gaps (no fabrication; need data or a decision)

- F2-15 mode lattice: no precomputed FEM data.
- F3.6 absolute IDT conductance, F3.7 AO efficiency: formulas not source-checked (C03 Q5, Q6).
- F05-05 implant range: no verified range table (SRIM run with stored inputs needed); stub returns `no verified data`.
- F05-06 Preston coefficient for LN: none sourced (template input).
- Chung, Chang, Adler 1991 (doi 10.1109/3.81370): closed access, equations not read; the TW response is checked against an independent derivation only.
- fig-04-09 cti1999 dn_o/dT curve: only spot values in data/.
- Thin-film plate modes (C03 Q11): no plate solver.
- Audit open item: `composition.mgBasisConvert` note "about 2x" between MgO bases needs a re-read of volk2008 pp. 36-37.
- Spec corrections found by PHY2 (report to content lanes): F2-01 tilt first-order vs exact about 3%, not < 1%; F2-05 nodal deviation +0.39%; F2-13 423 lines (spectrum) vs 431 (envelope); C03 3.3/3.4 36-41 deg free-surface leaky roots are isolated roots, not threshold-pinned (values unchanged, k^2 not indicative); C03 3.7 sign typo in 4C/(1 -+ C)^2 (code: red (1+C)^2, blue (1-C)^2); C01 well depth 18.3 mRy = 2889 K, not 2858 K, unless the paper prints 2858.
