# Physics core (`src/lib/physics/`)

Framework-agnostic, dependency-free TypeScript for every in-browser simulation on the site. Pure functions, `Float64Array`/`Float32Array` buffers, no DOM, no `Math.random`, no `Date`. Erasable syntax only (no enums, namespaces, parameter properties, decorators), so Node 23.7 runs the files directly with type stripping.

## Run the tests

```sh
node --test src/lib/physics/                 # 253 tests (directory entry via package.json "main" -> test-all.ts)
node --test "src/lib/physics/*.test.ts"      # same tests, one process per file
```

Node 23.7 does not expand a directory argument for `--test`; it loads the directory as a module, so `package.json` in this folder points `main` at `test-all.ts`, which imports every `*.test.ts`. When adding a test file, add its import to `test-all.ts`. App code imports individual modules (`$lib/physics/sellmeier.ts`), never the directory. The app `tsconfig` needs `allowImportingTsExtensions` (imports carry `.ts`) and should set `verbatimModuleSyntax` and `erasableSyntaxOnly`; the sources and tests type-check under `--strict` with both.

## Modules

| Module | Contents |
|---|---|
| `constants.ts` | Source register (`SOURCES`, ids as in research/R06 and R14), physical constants (SI 2019 exact, CODATA 2018), crystal frame (`FRAME`), dispersion coefficient sets, EO sets, kushibiki1999/ogi2002 elastic, piezo, dielectric, density, measured velocities, Avakyants photoelastic set, legacy-scale SHG d, thermal expansion, dark conductivity, MgO threshold, photovoltaic field order. Every entry carries `prov: {source, status, locator?, note?}` |
| `units.ts` | lambda/frequency/energy/wavenumber, linewidth, dB/dBm/Np, loss (dB/cm <-> 1/m), V cm, pm/V, field units, Q <-> loss |
| `sellmeier.ts` | `refractiveIndex(model, lam_um, T_C?)` with enforced validity windows (RangeError), `refractiveIndexOrNaN`, analytic `dnDlambda`, `d2nDlambda2`, `groupIndex`, `gvd` (fs^2/mm), `dispersionD` (ps/(nm km)), `dnDT`, `defaultModel`, `modelById`, `indexFn` |
| `phasematching.ts` | Delta k (material, QPM), `qpmPeriod`, `qpmPeriodSHG`, odd orders and `qpmDeffFactor`, `qpmTemperature` (optional period expansion), `opoSignalIdler`, `birefringentAngle` (any o/e combination), `acceptanceFWHM`, `shgWavelengthAcceptance`, `shgTemperatureAcceptance`, `shgTuningCurve`, `SINC2_HALF_X` |
| `coupledmode.ts` | `etaNormSHG`, `shgUndepleted`, `shgDepleted` (tanh^2), `shgRK4` (detuning, loss, SH seed), `threeWaveRK4` (photon-flux amplitudes), `gFromEtaSFG`, `opaGamma`, `opaGain`, `degenerateOpaGains`, `opoThresholdGammaL_DRO`, `opoThresholdGammaL_SRO`, `opoThresholdPower` |
| `crystaloptics.ts` | `impermeability(no, ne, r, E)`, `principalIndices`, `eigenIndices(B, k)`, `opticAxes` (2V), `extraordinaryIndex`, `walkoffAngle`, `zcutRetardanceExact`, `conoscopeZcutWeak` (mockup port), `mockupSpectrum`, `conoscope` (any cut, any field, exact or weak retardance, any polarizer/analyzer) |
| `tensors.ts` | Voigt <-> full for rank 2/3/4 with explicit kinds, rotation of full tensors, `rotateVoigt3/4`, `rotX/Y/Z`, `eulerZXZ`, `eulerZXZFromMatrix`, `orientationFromAxes("nZYX")`, `rotatedYCut(theta)`, `namedCut`, 3m forms (`c3m s3m e3m d3m dShg3m r3m p3m eps3m`), `ROT180_Z`, `FLIP_Z`, `C3_Z`, `MIRROR_X`, COMSOL export (`comsolD`, `comsolEES` and inverses) |
| `modulator.ts` | `vpiLPhase`, `vpiLMZM` (push-pull), `vpiFromVpiL`, `mzmTransmission`, `twResponse` (velocity mismatch, RF loss, source/load mismatch), `s21EOdB`, `bandwidth`, `f3dBVelocityMismatch`, `prbs` (ITU-T O.150), `eyeDiagram`, `eyeOpening` |
| `ring.ts` | `allPass`, `allPassField`, `addDrop`, FSR, exact `fwhmPhase`, `finesse`, Q relations, `eoShift`, EO comb: `eoCombThrough`, `eoCombDrop` (closed form at FSR drive), `eoCombCMT` (sideband model with dispersion) |
| `drift.ts` | Exact N-layer Maxwell-Wagner step response (`driftModel`, `layerVoltage`), `layerTransfer` |H(f)|, `twoLayerClosedForm`, `DRIFT_EXAMPLE` (template-labelled stack) |
| `photorefractive.ts` | Reduced single-center model: `relaxationTime`, `darkRelaxationTime`, `saturationField`, `fieldAt`, `fieldSequence`, `field1D`/`field1DSteady` (mean E = 0), `mgoMultiplier`, `deltaNe`, `PR_TEMPLATE` |
| `acoustics.ts` | `christoffel(material, n, piezo)` (velocities, polarizations, longitudinal character), `christoffelSweep`, `bulkCouplingK2`, `acousticMaterial`, `LN_KUSHIBIKI1999` |
| `saw.ts` (PHY2) | Partial-wave SAW solver for piezoelectric half-spaces: `sawProblem`, `sawSolve` (free/metallized, Rayleigh/leaky, threshold windows with fine-window retry), `sawCut` (k^2 = 2 dv/v), `sawSweepRotY`, `sawFields` (depth profiles, orbit, BC residual), `sawPartialWaves`, `sawDetAbs`, `polyRoots`; IDT `idtF0`, `idtArrayFactor`, `idtArrayFactorFingers`, `idtConductanceShape` |
| `rf.ts`, `electrostatics.ts`, `devices.ts` (PHY2) | CPW/CPS quasi-static lines (AGM elliptic K, partial capacitance, 2D-solver route), TW loss helpers and independent TW check; 2D FD Laplace solver for coplanar electrodes on layered anisotropic stacks; C06 helpers (VpiL push-pull, implied overlap, ring from Q, PAM4 eye, triply resonant OPO, comb counts, IDT period) |
| `composition.ts`, `crystal.ts`, `symmetry.ts`, `ferro.ts` (PHY2) | Li2O composition (defects, Tc fits, UV edge, seeded lattice); cell expansion, rhombohedral setting, plane angles, flip model; 3m group and Neumann classification, stabilizer; double well, hysteresis template, poling automaton, switching current, KAI fit, wall bound charge |
| `prslab.ts`, `pyro.ts`, `thermal.ts`, `schlarb.ts` (PHY2) | Photorefractive slab and 1D grating, polaron bands, GRIIRA toy; pyroelectric charge/field/voltage, Maxwell-Wagner wrappers, Arrhenius; ring thermal/photorefractive sweep, thermal lens, QPM detuning; generalized Sellmeier vs composition (status S) |
| `nonlinear.ts`, `lle.ts`, `ellipsoid.ts`, `resonators.ts`, `eo.ts` (PHY2) | P_NL from d, GVM, ring SHG, resonant OPO, cascaded phase, gamma_Kerr; Lugiato-Lefever split-step; conoscope ring angles, field-induced optic-axis tilt; EO comb slope, coupled-ring shifter, Q-loss; FEM EO-overlap integrals (port of mockup/eo.js) |
| `piezo.ts`, `ao.ts`, `photoelastic.ts`, `optomech.ts`, `fab.ts`, `thinfilm.ts` (PHY2) | Piezo form conversion, longitudinal d, group velocity; Bragg AO; photoelastic sweeps and frame flip; transduction efficiency, thermal occupation; fab arithmetic (Cz, PE depth, EBL, stepper fields, Preston, sidewall, implant stub, mass budget); LNOI reflectance and sRGB colour (CIE 1931, D65) |
| `prng.ts` | `createRng(seed)`: xorshift128 (Marsaglia 2003), `next`, `uniform`, `normal`, `int` |
| `linalg.ts`, `fft.ts` | 3x3 Jacobi eigen, 2x2 symmetric eigen, dense solve/invert, bisection; radix-2 complex FFT |

## Conventions

- **Units.** Wavelength in um (`lam_um`), temperature in C (`T_C`), SI elsewhere unless the suffix says otherwise (`L_mm`, `fs^2/mm`, `pm/V` only in constant sets). Delta k in rad/um inside `phasematching.ts`, rad/m inside `coupledmode.ts`.
- **Crystal frame.** IEEE Std 176-1987 for class 3m (R14 rows 76-81): x perpendicular to a mirror plane, z polar, +Z positive d33 (negative on compression), +Y positive d22, right-handed. In this frame c14 > 0, e22 > 0 (kushibiki1999). IRE 1949 and IRE 1958 give the same +z and +y for LN.
- **Voigt.** 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy; engineering shear strain. Factors: c, e, r, SHG d, p carry none; s carries 1/2/4; strain-charge d and pi carry 2 on shear columns. Full-rank tensors are generated by code, never by hand.
- **Rotation.** `R` maps crystal components to global (`v_g = R v_c`); columns of `R` are crystal axes in global coordinates. Euler ZXZ: `R = Rz(alpha) Rx(beta) Rz(gamma)`, the COMSOL rotated-system convention recorded in R02 ("ZXY" = (pi/2, pi/2, 0); "nZYX" = (pi/2, -pi/2, -pi/2)). Orientation names list the crystal axes lying along global x, y, z; `n` negates. Named cuts use global z = wafer normal, global x = propagation. `rotatedYCut(theta)` follows (YXl)theta: +Y turns toward +Z for positive theta.
- **Frame flips.** `ROT180_Z` flips c14, s14, p14, p41, e22, d22, r22, SHG d22. `FLIP_Z` (180 deg about x) flips every odd-rank component (e, d, r, SHG d) and keeps c, s, p.
- **COMSOL export.** `comsolD`: 21-vector, upper triangle column by column. `comsolEES`: 18-vector, column-major. Units are the caller's (pass Pa and C/m^2 for COMSOL SI input).
- **Optics.** Impermeability B = B0 + dB, dB_I = r_Ik E_k. Eigen-indices come from the exact 2x2 projection of B on the plane normal to the wave normal. Pockels coefficients are wavelength independent inside a call (all held sets are at 633 nm; no 1550 nm data exist in the sources held, R14 sec. 2.5).
- **Conoscope.** Pixel (x, y) maps to u = (x + 0.5 - size/2)/(size/2), v = (size/2 - y - 0.5)/(size/2); external sine = NA r. Polarizer and analyzer azimuths from lab x; default crossed (0, pi/2). Fresnel transmission differences are neglected. `retardance: "exact"` refracts each eigenwave with its own direction-dependent index (exact plane-wave phase; matches the exact z-cut formula to < 1e-6 relative). `"weak"` is the first-order model of the mockup class.
- **Phase matching.** 1/lambda3 = 1/lambda1 + 1/lambda2; Delta k = k3 - k1 - k2 - 2 pi m / Lambda. FWHM acceptance = 2 x 2.78311 / (L |d Delta k / dx|).
- **Coupled modes.** SHG amplitudes |A|^2 = P, dA1/dz = -i kappa A2 A1* e^{-i dk z}, dA2/dz = -i kappa A1^2 e^{+i dk z}, kappa^2 = eta. Three-wave amplitudes |a|^2 = photon flux. OPO threshold assumes single-pass gain, undepleted pump, dk = 0, resonance phases met; R_s, R_i are round-trip power survival fractions.
- **Modulator.** Phasor e^{+j w t}. H(f) normalized to the DC divider so H(0) = 1. S21_EO = 20 log10 |H|. RF loss in Np/m (field) with sqrt(f) and linear-in-f terms. Push-pull VpiL is half the single-arm VpiL. The eye generator biases at quadrature by default (phi_b = -pi/2).
- **Ring.** r = self-coupling field coefficient, a = single-pass field transmission (a^2 = e^{-alpha L}); FWHM is where the Airy denominator doubles.
- **Drift and photorefraction.** Series-layer Maxwell-Wagner, exact partial fractions; time constants ascending. Photorefractive field sign: negative along +c for positive photovoltaic coefficient.

## Provenance model

Each constant: `{ value | coefficients, unit, prov: { source, status, locator?, note? } }`, `source` keys into `SOURCES` (citation, DOI). Status codes: P, P-comp, P-db, P(abs), S, V, C, U, reported, derived, template (DevLog-004 rule 3, R06, R14). Rules applied here:

- Dispersion defaults are Zelmon 1997 (P-db) for CLN and MgO5; the MgO5 rows have the 2026-10-22 erratum applied (doi:10.1364/JOSAB.616304; Gayer 2008 had noted the swap in print).
- Jundt 1997 (CLN ne, T-dependent) is status S (coefficients via Wikipedia, primary unread): available, `isDefault: false`.
- Gayer 2008 (MgO5 ne/no, MgO1-SLN ne) is status P (R14 row 36), erratum replaces Fig. 3 only; `isDefault: false` and flagged `dndT-anomalous` (dn/dT 2.65e-4, 1.11e-4, -7.1e-5 /K at 1550 nm, 24.5 C; do not use for absolute dn/dT). MgO5 no is limited to 0.5-1.62 um and 20-100 C.
- Template inputs (drift stack, photorefractive rates, MgO step width) are labelled `template` in their `prov` maps; UI must render them as such.
- Functions take constants as explicit arguments; defaults are only the provenance-tagged objects above, so a caller can always show the source.

## Figure map

`FIGURE-MAP.md`: every chapter figure id -> functions, inputs, outputs, status, and the open gaps.

## Validation summary (references are stated in each test file header)

- Sellmeier: R06/R11 spot values (Zelmon CLN, MgO5 corrected, Jundt, Gayer), independent Nelson & Mikulyak values (weis1985) within 7e-4, negative uniaxial 0.4-5 um, R14 Gayer dn/dT anomaly reproduced, analytic vs finite-difference derivatives.
- QPM: 6.818 um (1064 SHG) and 18.989 um (1550 SHG) per R11/audit C; acceptance FWHM vs measured tuning curves.
- Coupled modes: RK4 vs tanh^2 (1e-8), sinc^2, loss integral, Manley-Rowe, OPA gain vs RK4, degenerate OPA exp(2 sqrt(eta P) L), OPO thresholds vs round-trip determinant.
- Crystal optics: uniaxial limits, E || z closed form, 45 deg rotation for E || x, threefold invariance, optic-axis degeneracy, walk-off vs D/E angle, conoscope port byte-equal to `mockup/ln.js` (VM), exact retardance vs exact z-cut formula.
- Tensors: 3m invariance under C3z and the x mirror for every form, c -> s inversion vs R06, d = e s vs R06, flip tables, R02 Euler/orientation identities, COMSOL eES vector from R02.
- Acoustics: kushibiki1999 measured velocities (six modes) within 0.02-0.03%; stiffening 7102.1 -> 7328.6 m/s; isotropic limit; rotation invariance.
- SAW (PHY2): isotropic Rayleigh 1885 limit (1e-8), Bleustein-Gulyaev closed form (open and shorted), C03 cut table and rotated Y-X sweep (cross-implementation, abs 0.5 m/s, k^2 0.02 pp), Warner and ogi2002 sets from the lane-API tensors, vendor velocities within 3 m/s, symmetry, BC residual < 1e-9, Y-Z u2 = 0.
- Modulator, ring, drift, photorefractive: closed-form limits, Parseval, CMT vs closed-form EO comb (3%), RK4 vs exact drift, 1D steady state vs closed form.

## Benchmarks (Apple M4 Pro, Node 23.7.0, single thread, median of 7, 2026-10-25)

| Kernel | Time |
|---|---|
| Conoscope 400x400, mockup port (z-cut weak) | 2.9 ms |
| Conoscope 400x400, general weak | 8.3 ms |
| Conoscope 400x400, general exact (z-cut + field / 128 deg Y) | 27 / 28 ms |
| Christoffel sweep, 360 directions | 0.43 ms |
| Christoffel 181 x 361 directions | 45 ms |
| Eye diagram, 2^10 bits x 16 samples (TW + filters + noise) | 3.4 ms |
| Eye diagram, PRBS15 x 16 samples | 75 ms |
| SAW `sawDetAbs`, one real / complex velocity | 25 / 50 us |
| SAW `sawCut` Rayleigh (free + metallized) | 27 ms |
| SAW `sawCut` leaky 64 deg (free + metallized) | 88 ms |
| SAW `sawFields`, 301 depths | 0.5 ms |
| SAW `sawSweepRotY` 0-180 deg, 0.5 deg step, both branches (build-time) | 25 s |
| Poling automaton 512 x 256, 200 steps | 230 ms |
| LLE N = 512 | 51.6k steps/s |
| 2D electrostatics, F05-10 cross-section (146 x 167) / `coplanarLineFD` stack | 106 / 586 ms |
| `eoAnalyze` (decode + all integrals) | 2.9 ms |
