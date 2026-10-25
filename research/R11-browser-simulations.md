# R11: In-browser simulations and calculators for LN

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R11 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Method | Read-only review of R03 tools (eo-modulator-atlas engine source, bench logs, DevLog-025; LN poling animation); standalone Node micro-benchmarks of every candidate kernel (not committed); DOI checks via the Crossref API; license checks via `gh api repos/<repo>/license` and `npm view <pkg> license` (2026-10-24) |
| Author | Claude Code (subagent), at Wentao Jiang's request |

Conventions in this note:
- Levels: L = lay (one slider, picture first), I = intermediate (student / adjacent engineer), E = expert (real solver, numbers you can cite).
- Effort: S = days, M = 1-3 weeks, L = more (same as R03).
- Provenance tags (R13): `reported` (from a paper), `derived` (computed from reported inputs), `template` (illustrative).
- "Measured" = timed in this track. "Estimate" = reasoning given, not measured.
- Every equation cites a primary paper or a standard book. DOIs below were resolved on Crossref on 2026-10-24.

## 0. Key findings

1. Almost every candidate is cheap in plain JS. On the test laptop, 15 of 17 timed kernels ran in under 0.3 s single-threaded, and the conoscope, Sellmeier/QPM, coupled-mode SHG, EO-comb, Christoffel and eye-diagram kernels each took under 75 ms. The two slower kernels were the LLE at N = 2048 (0.57 s per 10k steps) and the naive 20k-unknown FD mode solver (1.0 s). WebGPU is optional, not a prerequisite; WebGL2 fragment shaders cover the per-pixel visuals (conoscope, poling, BPM painting).
2. The only heavy candidate is the TFLN cross-section solver. The atlas engine's full EO pipeline (meshing, anisotropic electrostatics, full-vector optical FEM, overlap) takes 0.8 to 1.2 s per run on an Apple M4 Pro in Node (atlas bench log, 2026-10-15). Estimated phone time is 2.4 to 7 s per run. That suits "solve on release", not dragging a slider; use a precomputed lattice plus interpolation for the lay and intermediate tiers.
3. A naive scalar finite-difference (FD) mode solver written for this track (banded LU) was not faster: 0.23 s for 7.2k unknowns and 1.0 s for 20k. It is also scalar, which is wrong for high-contrast anisotropic TFLN. Reuse the atlas engine; do not write a new solver.
4. Data alert: on 2026-10-22, JOSA B published an erratum to Zelmon et al. (1997), doi:10.1364/JOSAB.616304. It says the ordinary and extraordinary column headings for 5 mol% MgO:LN in Table 2 were switched. The refractiveindex.info database lists only the congruent Zelmon entries (o, e) under `main/LiNbO3/nk` (checked 2026-10-24). Any MgO:LN Sellmeier entry or calculator built on Zelmon Table 2 needs checking (flag for R06).
5. The highest value per effort is a "crystal optics bench" family: index ellipsoid, conoscope, Sellmeier/QPM/phase matching, SHG coupled modes and ring/EO comb. These are closed-form or ODE kernels, S effort each, validated against analytic limits. They show live, linked, parameter-swept physics that no review PDF has.

## 1. Cost model and measurements

### 1.1 Method
- Machine: Apple M4 Pro, Node v23.7.0 (V8, the same engine as Chrome), single thread, warm JIT, median of 3 runs. Script: one standalone ES module, not committed. It can be added later as `bench/r11-kernels.mjs`.
- Mid-range laptop: estimated 1.5 to 2.5 times slower than the M4 Pro. This is an assumption and has not been measured.
- Mid-range phone: estimated 3 to 6 times slower. The basis is the Geekbench 6 single-core gap:
  - Apple M4 Pro scores about 3,573 to 3,940 ([Tom's Guide](https://tomsguide.com/computing/m4-pro-benchmark-results-intel-amd-and-qualcomm-never-stood-a-chance), [CPU Monkey](https://www.cpu-monkey.com/en/benchmark-apple_m4_pro_12_cpu_16_gpu-geekbench_6_single_core)).
  - Snapdragon 7s Gen 3 scores about 1,162 to 1,189 ([NanoReview](https://nanoreview.net/ru/soc/qualcomm-snapdragon-7s-gen-3), [Gizmochina](https://www.gizmochina.com/ptag/snapdragon-7s-gen-3)). The ratio is about 3.0 to 3.4.
  - On top of that ratio, a margin is assumed for thermal throttling, browser JIT and memory differences (Safari uses JavaScriptCore, not V8).
  - Verify on a real device before launch (section 5.3).
- Interaction budgets (design targets): under 16 ms counts as "live while dragging"; under 100 ms as "live on input"; under 2 s as "solve on release with a spinner"; over 2 s as "explicit Run button with progress and cancel".

### 1.2 Measured kernels (this track)

| # | Kernel | Size | M4 Pro (measured) | Phone (estimate, x3-6) | Sanity check |
|---|---|---|---|---|---|
| A1 | Sellmeier + first-order QPM period | single point | < 0.01 ms | < 0.1 ms | Zelmon CLN, 21 C: n_e(1550) = 2.13756, n_o(1550) = 2.21111, n_g,e(1550) = 2.182; bulk QPM period 6.818 um (1064 to 532 SHG) and 18.989 um (1550 to 775 SHG) |
| A2 | OPO tuning curve (bisection on Delta k = 0) | 400 periods | 0.74 ms | 2-4 ms | 363 of 400 periods phase-matched for 1.064 um pump, 28-32 um periods |
| B1 | Conoscope, uniaxial, Jones per pixel (CPU) | 512^2, 1 wavelength | 8.2 ms | 25-50 ms | (visual) |
| B2 | Conoscope, white light | 512^2 x 16 wavelengths | 53 ms | 160-320 ms | (visual); GPU path needed for live drag |
| B3 | Biaxial eigen-indices per pixel (Pockels-deformed impermeability, 2x2 projection) | 512^2 | 19 ms | 56-112 ms | closed form per pixel |
| C1 | Coupled-mode SHG, depleted pump, RK4 | 1000 steps | 0.66 ms | 2-4 ms | P_2w / P_0 = 0.81929336 vs tanh^2 analytic 0.81929336 |
| C2 | Same, detuning sweep | 200 x 1000 steps | 71 ms | 0.2-0.4 s | sinc^2 with depletion |
| D1 | Lugiato-Lefever equation (LLE) split-step Fourier | N = 512, 10k steps | 138 ms | 0.4-0.8 s | about 72k steps/s on the laptop |
| D2 | Same | N = 2048, 10k steps | 574 ms | 1.7-3.4 s | |
| E1 | EO comb in a ring, steady state at drive = free spectral range (FSR), + FFT | 4096 samples | 0.31 ms | 1-2 ms | closed form per fast-time sample |
| F1 | Eye diagram: pseudo-random binary sequence PRBS15 x 16 samples/bit, 2^19-point FFT filter, cos^2 MZM, histogram | 524k samples | 54 ms | 0.16-0.32 s | |
| G1 | Christoffel equation with piezo stiffening, Jacobi 3x3 | 181 x 361 directions | 30 ms | 0.09-0.18 s | timing only; placeholder tensors |
| H1 | Scalar FD mode, banded LU, shift-invert | 120 x 60 = 7.2k unknowns | 225 ms | 0.7-1.4 s | n_eff 1.904 (scalar, not converged) |
| H2 | Same | 200 x 100 = 20k unknowns | 992 ms | 3-6 s | n_eff 1.917 |
| I1 | Poling toy: stochastic nucleation + hexagonal growth, cellular automaton (CPU) | 512^2 x 300 steps | 287 ms | 0.9-1.7 s | about 1 ms/step; GPU ping-pong is trivially real-time |
| J1 | 2D (x, z) FD beam propagation method (BPM), Crank-Nicolson | 1024 x 4000 steps | 69 ms | 0.2-0.4 s | power conserved: 1.0027 vs 1.0027 initial |
| K1 | Spontaneous parametric down-conversion (SPDC) joint spectral amplitude (JSA) purity via Tr(rho^2) | 256^2 / 512^2 | 13 / 83 ms | 40-80 / 250-500 ms | separable input gives P = 1.000000 |

### 1.3 Existing measurements (atlas engine, R03 item 1)

All rows come from the atlas bench log `logs/bench-20261015T0926.jsonl` (M4 Pro, Node, median of 5) and atlas `DevLog-025`.

| Case | Stages | DOF | Wall time |
|---|---|---|---|
| mao2022, P1 electrostatics | electrostatics | 55.5k (nnz(L) 1.8M) | 375 ms |
| mao2022, P2 electrostatics | electrostatics | 77.2k (nnz(L) 3.0M) | 407 ms |
| mao2022, P2 fine mesh | electrostatics | 221k (nnz(L) 11.1M) | 1430 ms |
| mao2022, scalar optical | electrostatics + optical | 2.9k optical | 358 ms |
| mao2022, full-vector P2 optical | electrostatics + optical | | 785 ms |
| renaud2023, full-vector EO | optical + eo_overlap | 61k electrostatic | 1226 ms |
| mao2022, Wheeler skin-effect | rf_line, 3 extra vacuum solves | 165k | 978 ms |
| Vector mode only (DevLog-025) | | 50-80k | 300-450 ms per arm; "~20k edges well under 1 s": 301 ms (order 1) |

- Phone estimate: 2.4 to 7 s for a full EO run.
- Memory estimate: about 25 to 90 MB for the factor (nnz(L) 3 to 11M at 8 bytes per value, plus index arrays) on top of the mesh. Phone tab limits are N/A here; measure.
- Engine source: 0.93 MB raw, 275 kB gzip, unminified, including the silicon drift-diffusion stage, which an LN site can drop.

## 2. Candidate summary

| # | Simulation | Level | Method | Laptop / phone | Effort | Reuse | What a PDF cannot show |
|---|---|---|---|---|---|---|---|
| S1 | Index ellipsoid + Pockels deformation explorer | L/I/E | Closed form, 3x3 symmetric eigen | < 1 ms / < 1 ms | S | atlas tensor conventions; three.js (MIT) | Rotatable 3D ellipsoid; drag E and see which r_ij acts; cut and propagation direction linked to n1, n2 and walk-off |
| S2 | Conoscopic figure (Jones per pixel) | L/I/E | Fragment shader (WebGL2); CPU fallback | GPU: under 16 ms/frame (estimate); CPU 8-53 ms | S-M | R12 logo/hero; CIE colour-matching functions (CMF) table from R03 item 6 | Live isogyres and isochromes vs cut, thickness, wavelength, field, tilt; uniaxial-to-biaxial transition under field |
| S3 | Sellmeier / group index / QPM / tuning / acceptance | I/E | Closed form + bisection | < 1 ms | S | atlas `materials.json`; refractiveindex.info DB (CC0) | Any process, any composition, any temperature; linked tuning curves; provenance per number |
| S4 | Coupled-mode SHG / SFG / OPA; OPO threshold | I/E | Analytic + RK4 ODE | 1-70 ms | S | none needed | Depletion, detuning and loss interplay as you drag; threshold map |
| S5 | TFLN waveguide mode solver (anisotropic, full vector) | E (live), I (lattice) | 2D FEM (atlas, JS, worker) + precomputed lattice | 0.3-1.2 s / 1-7 s (est.) | M | atlas engine (GPL-3.0-or-later) | Your own geometry, full-vector modes, overlap with electrodes, numbers with convergence notes |
| S6 | EO modulator designer + eye diagram | L/I/E | Atlas stages or closed form (Alferness) + FFT | 50 ms (closed form) / 1-7 s (live FEM) | M | atlas `eo_overlap`, `rf_line`, `eo_response` | VpiL vs bandwidth trade-off, live S21_EO, eye opening vs baud and length |
| S7a | Ring: transmission, EO tuning | L/I | Closed form | < 1 ms | S | PIC_torch concept (R03 2.8) | Drag coupling and loss through critical coupling |
| S7b | EO comb (Kerr-free) | I/E | Closed form at FSR drive; coupled-mode ODE with dispersion | 0.3 ms / 10-100 ms (est.) | S | | Comb width vs modulation depth, Q, dispersion |
| S7c | Kerr soliton comb (LLE) | E | Split-step Fourier, worker; optional WebGPU batch | 72k steps/s (N = 512) | M | gnlse-python (MIT) as a reference | Watch the soliton steps form in a detuning scan; photorefractive variant |
| S8 | Photorefractive / dark-conductivity toy; DC-drift RC network | L/I | ODE (Maxwell-Wagner), 1D reduced Kukhtarev | < 1 ms | S | WebSpice (R03 item 9) idea | Drift time constants vs layer conductivities; why the bias walks |
| S9 | Poling: nucleation and growth toy | L/I | Stochastic cellular automaton on GPU; KAI kinetics | 1 ms/step CPU; trivial GPU | M | LN poling animation (R03 item 2) | Domain merging, hexagonal shapes, current transient tied to switched area |
| S10 | Bulk acoustic slowness surfaces (Christoffel); SAW / IDT | I/E | 3x3 eigen per direction; partial-wave SAW root finding | 30 ms / 0.1-0.2 s; SAW est. 0.1-1 s | M (bulk), L (SAW) | none in hand; Jaeken & Cottenier algorithm (paper) | 3D slowness and group-velocity surfaces for any cut; k^2 vs rotation angle |
| S11 | Fab toys: Czochralski, smart-cut depth, Ar milling sidewall | L | 2D FD heat; lookup table; level-set or string model | < 0.3 s | M each | crystal_growth (R03 item 10); SRIM tables generated offline | Process cause and effect, labelled `template` |
| S12 | LNOI wafer colour vs film / BOX thickness (added) | L/I | Transfer matrix method (TMM), CIE CMF to sRGB | < 1 ms per colour | S | R03 item 6 (Python to port) | Why wafers are coloured; o/e polarization dependence for x-cut |
| S13 | Fiber-to-chip coupling loss game (added) | L/I | Gaussian overlap closed form | < 1 ms | S | mode-guessr (R03 item 4) | Guess-then-reveal intuition for mode mismatch |
| S14 | Effective-index BPM for TFLN components (added) | I | 2D FD-BPM (Crank-Nicolson), CPU or WebGL | 69 ms per 4000 steps | M | BPM repo (MIT) as reference | Paint a multimode interference (MMI) coupler, Y-branch or taper and watch the light propagate |
| S15 | SPDC joint spectral amplitude and purity (added) | E | Closed form + one matrix product | 13-83 ms | S | none | Shape the JSA with pump bandwidth and length; see purity and Schmidt number live |
| S16 | Pyroelectric charge toy (added) | L | Closed form Q = p A Delta T | < 1 ms | S | | Heat a wafer, see the volts (and why wafers spark) |

## 3. Candidate details

### S1. Index ellipsoid and Pockels deformation
- **Model:** Index ellipsoid sum_ij (1/n^2)_ij x_i x_j = 1. With a field applied, Delta(1/n^2)_i = sum_k r_ik E_k, using the contracted Voigt index i = 1..6 (xx, yy, zz, yz, xz, xy).
  - 3m form (Yariv and Yeh, *Optical Waves in Crystals*, Wiley 1984, ch. 7; axes as in Weis and Gaylord 1985, doi:10.1007/BF00614817: z = c, x normal to a mirror plane): rows xx (0, -r22, r13), yy (0, r22, r13), zz (0, 0, r33), yz (0, r51, 0), xz (r51, 0, 0), xy (-r22, 0, 0).
  - The new principal indices and axes come from a 3x3 symmetric eigen decomposition.
  - For a propagation direction k, the two eigen-indices come from the 2x2 projection of the impermeability onto the plane normal to k (closed form; kernel B3).
  - Extraordinary walk-off: tan rho = (n_e(theta)^2 / 2)(1/n_e^2 - 1/n_o^2) sin 2 theta (Dmitriev, Gurzadyan, Nikogosyan, *Handbook of Nonlinear Optical Crystals*, Springer, 3rd ed. 1999).
- **Worked cases for the UI:**
  - E along z keeps the crystal uniaxial: n_o and n_e shift by -n^3 r13 E / 2 and -n^3 r33 E / 2.
  - E along x adds xy (-r22) and xz (r51) terms. The in-plane principal axes rotate 45 degrees, so a z-cut plate becomes biaxial. This is the classroom transverse-field Pockels demonstration referenced in R12.
- **Default constants:** atlas `materials.json` (Weis and Gaylord Table 4, clamped, 633 nm): r13 8.6, r22 3.4, r33 30.8, r51 28 pm/V. The entry itself caveats that there is no 1550 nm row and no stated composition. Show that caveat in the UI.
- **Level:**
  - L: drag a field slider and the ellipsoid squashes, exaggerated with a declared scale factor.
  - I: choose cut and direction, then read n1, n2 and the walk-off.
  - E: full tensor, sign conventions, clamped vs unclamped switch.
- **Compute:** closed form, under 1 ms. Rendering is a three.js ellipsoid plus the k vector and the elliptical section.
- **Validation:** uniaxial limits (n along z gives n_o, n_o; along x gives n_o, n_e); field-along-z closed form; 45-degree axis rotation for E along x; invariance under the threefold rotation; cross-check against the atlas eo_overlap tensor code (the same convention must give the same dn).
- **Reuse:** the atlas engine's tensor rotation (`rotation_deg` convention fixed in its audit Q2 F6); three.js (MIT).
- **Effort:** S.
- **Beyond a PDF:** A rotatable, field-deformable ellipsoid tied to the crystal axes and to a real cut. A PDF shows only static sections.
- **Pitfalls:** Sign conventions of r and d (which face is +z) differ across sources. Pin one convention in code (IEEE Std 176-1987 axes) and name it in every exported JSON.

### S2. Conoscopic interference figure
- **Model:** Each pixel is one propagation direction, (u, v) = sin(theta_ext)(cos phi, sin phi).
  - For each eigenwave, find the internal angle by Snell's law with its own index, and the eigen-polarization azimuth psi (from S1).
  - Plate Jones matrix J = R(-psi) diag(exp(-i k0 n1 d / cos theta1), exp(-i k0 n2 d / cos theta2)) R(psi). Intensity is I = |A J P E|^2 between polarizer P and analyzer A.
  - White light: I(lambda) is summed with an illuminant times the CIE 1931 colour-matching functions, then converted XYZ to sRGB.
  - Sources: Born and Wolf, *Principles of Optics*, ch. 15 (crystal optics); Yariv and Yeh 1984 (Jones calculus).
  - Fresnel transmission differences between the eigenwaves are neglected (state this in the notes).
- **Inputs:** cut (z, x, arbitrary Euler angles), thickness (thin film to mm), wavelength or white light, field vector (via S1), sample tilt from cursor or device orientation, numerical aperture.
- **Compute:** a WebGL2 fragment shader (no WebGPU needed). The CPU fallback costs 8 ms (1 wavelength) or 53 ms (16 wavelengths) at 512^2 on the laptop.
- **GPU estimate:** about 50 floating-point operations (flops) per pixel per wavelength. 16 wavelengths at 1080p is about 1.6 GFLOP per frame, so under 16 ms on an integrated or phone GPU with order-100-GFLOPS throughput (assumption; not measured).
- **Physics teaching moments, both derived here and checkable live:**
  - A transverse field of 1 kV/mm on a 1 mm z-cut plate gives Pockels retardation of about 2 pi d n_o^3 r22 E / lambda ≈ 0.37 rad at 633 nm. The figure visibly splits.
  - An x-cut 600 nm TFLN film gives a normal-incidence retardation of about 2 pi (0.6 um)(0.074)/(0.55 um) ≈ 0.5 rad. The wafer shows a low-order (grey to white) interference colour, not rings. This links S2 to S12 (wafer colour).
- **Validation:** a z-cut plate gives a Maltese cross with ring radii from the exact uniaxial retardation formula. Under field, melatope separation should match the closed-form optic-axis angle of a biaxial crystal (Born and Wolf). For qualitative comparison, use the classroom demonstration (R12 cites the Leybold transverse-field conoscopy experiment).
- **Reuse:** CIE CMF table (R03 item 6, Python; CIE data are published tables); R12 logo and hero spec.
- **Level:** L (hero, tilt-to-play), I (cut and thickness), E (field, NA, exported retardation map).
- **Effort:** S for uniaxial z-cut; M for an arbitrary cut with field and white light.
- **Beyond a PDF:** an interactive, real-physics figure at site-logo level; the uniaxial-to-biaxial transition under voltage, animated.

### S3. Sellmeier, dispersion, QPM and tuning calculator
- **Model:**
  - Wave vector: k(lambda, T) = 2 pi n(lambda, T) / lambda.
  - Phase mismatch: Delta k = k3 - k1 - k2 - 2 pi m / Lambda(T), with first-order QPM at m = 1 (Fejer et al., IEEE JQE 28, 2631 (1992), doi:10.1109/3.161322).
  - Group index: n_g = n - lambda dn/dlambda. Group-velocity dispersion (GVD) comes from the second derivative.
  - Acceptance: sinc^2(Delta k L / 2) falls to half at Delta k L = 2.78, so the full width is delta x = 2.78 / (L |d Delta k / dx|) for x = lambda, T or angle (Fejer 1992).
  - Thermal expansion of Lambda(T): coefficients must come from the same primary as the Sellmeier set (to source; not entered here).
  - Processes: SHG, SFG, DFG, OPO signal and idler vs period and temperature (kernel A2), type-0 (eee) by default; type-I/II birefringent phase matching as an E option.
- **Data:**

| Set | Composition | o/e | T-dependent | DOI | Status |
|---|---|---|---|---|---|
| Zelmon, Small, Jundt 1997 | CLN; 5% MgO:CLN | both | no (21 C) | 10.1364/JOSAB.14.003319 | CLN coefficients verified in the refractiveindex.info YAML (CC0); MgO Table 2 o/e headings corrected by erratum 10.1364/JOSAB.616304 (2026-10-22) |
| Jundt 1997 | CLN | e only | yes | 10.1364/OL.22.001553 | DOI verified; coefficients to transcribe from the primary |
| Edwards and Lawrence 1984 | CLN | both | yes | 10.1007/BF00620081 | DOI verified |
| Schlarb and Betzler 1993 / 1994 | composition- and Mg-dependent | e / o + Mg | yes | 10.1103/PhysRevB.48.15613; 10.1103/PhysRevB.50.751 | DOI verified |
| Gayer, Sacks, Galun, Arie 2008 | MgO:CLN, MgO:SLN | both | yes | 10.1007/s00340-008-2998-2 | DOI verified; coefficients not transcribed (could not read the primary in this track) |

- **TFLN mode:** replace n with n_eff(lambda) from the S5 lattice (dispersion-engineered waveguides; Jankowski et al., Optica 7, 40 (2020), doi:10.1364/OPTICA.7.000040). Show bulk and waveguide periods side by side. Bulk 1550 SHG needs 18.99 um; TFLN devices use about 4 to 5 um because of geometric dispersion (R08 to supply sourced device values).
- **Compute:** closed form; a 400-point tuning curve takes 0.74 ms.
- **Validation:**
  - Reproduce the measured periods: 6.82 um for 1064 nm SHG and 18.99 um for 1550 nm SHG, from Zelmon CLN at 21 C (this track).
  - Cross-check against SNLO (AS-Photonics; free, closed source) for selected points, and against published PPLN OPO tuning (Myers et al., JOSA B 12, 2102 (1995), doi:10.1364/JOSAB.12.002102).
  - Refuse to extrapolate outside each set's validity window (the mode-guessr `materials.mjs` pattern, R03 item 4).
- **Effort:** S.
- **Beyond a PDF:** a linked calculator in which every value carries its Sellmeier source and validity range. It also drives the R12 decorative "poled stripe" periods.

### S4. Coupled-mode SHG / SFG / OPA; OPO threshold
- **Model:** Armstrong et al., Phys. Rev. 127, 1918 (1962), doi:10.1103/PhysRev.127.1918; Boyd, *Nonlinear Optics*, ch. 2.
  - Fields: dA1/dz = -i kappa A2 A1* exp(-i Delta k z) and dA2/dz = -i kappa A1^2 exp(+i Delta k z), with |A|^2 = power and propagation loss optional.
  - Undepleted SHG: P_2w = eta_norm P_w^2 L^2 sinc^2(Delta k L / 2), with eta_norm = 8 pi^2 d_eff^2 / (eps0 c n_w^2 n_2w lambda_w^2 A_eff) and d_eff = (2/pi) d33 for first-order QPM. TFLN values are usually quoted in %/W/cm^2 (Wang et al., Optica 5, 1438 (2018), doi:10.1364/OPTICA.5.001438).
  - Depleted SHG at Delta k = 0: P_2w = P_0 tanh^2(sqrt(eta_norm P_0) L) (verified numerically, kernel C1).
  - OPA: G = 1 + (Gamma^2 / g^2) sinh^2(g L), with g^2 = Gamma^2 - (Delta k / 2)^2 and Gamma^2 proportional to eta P_p.
- **OPO threshold (estimate tier):** coupled-mode theory (CMT) threshold where the parametric gain rate equals the geometric mean of the signal and idler field decay rates. Ring formulas follow Lu et al., Optica 8, 539 (2021), doi:10.1364/OPTICA.418984 and McKenna et al., Nat. Commun. 13 (2022), doi:10.1038/s41467-022-31134-5 (the author's group). For bulk singly resonant oscillators, follow Myers 1995.
- **Pulsed / broadband (E, later):** a single-envelope chi(2) split-step model (Jankowski 2020) with N = 2^12 to 2^14 FFT points. The FFT cost scales from D1/F1 to about 1 to 10 ms per step on the laptop (estimate).
- **Compute:** analytic, plus RK4 at 0.66 ms per run; a 200-point detuning map takes 71 ms.
- **Validation:** sinc^2 and tanh^2 limits; energy conservation (Manley-Rowe); OPA gain at Delta k = 0 against cosh^2; threshold against the cited papers' stated formula and values.
- **Effort:** S (CW), M (pulsed).
- **Beyond a PDF:** the depletion knee and the detuning tolerance appear as you drag power and length. "Where does a 1 mW pump get you" becomes tangible.

### S5. TFLN waveguide mode solver (anisotropic, full vector)
- **Model:** curl-curl Maxwell eigenproblem with a diagonal or in-plane-rotated permittivity tensor. The atlas `vector-mode.mjs` uses Nedelec/Lagrange order 2 with shift-invert block Arnoldi and a supernodal LDL^T factorization with approximate minimum degree (AMD) ordering. The electrostatics are anisotropic P2 FEM. Everything is described in atlas `engine/README.md` and `DevLog-025`.
- **Validation (exists):** 226 engine tests, including the PEC-guide closed forms (G1, relative error 4.8e-7 to 1.5e-4) and the slab exact values (G3). The independent Python reference (scikit-fem, BSD-3-Clause) was cross-checked against femwell (GPL-3.0) for isotropic media; see R03.
- **Feasibility in a browser:**
  - The engine is already browser-ready (SvelteKit worker shares `run.mjs` with the CLI).
  - Cost is 0.3 to 0.45 s per vector solve and 0.8 to 1.2 s for a full EO run on the laptop, so an estimated 1 to 7 s on a phone.
  - That is fine for an "E" page with a Run button and cancel, which the atlas already has (worker termination). It is not fine for dragging a slider.
  - WASM or WebGPU rewrites are not justified now: there is no mature browser sparse direct solver on GPU, and a naive FD (H1/H2) was slower than the atlas FEM.
- **Precomputed lattice (fallback, and primary for L/I):**

| Axis | Example grid (proposal) | Points |
|---|---|---|
| Film thickness | 300-900 nm | 7 |
| Etch fraction | 0.2-1.0 | 5 |
| Rib top width | 0.6-3.0 um | 10 |
| Sidewall angle | 60, 70, 80 deg | 3 |
| Wavelength | 0.775, 1.064, 1.55 um | 3 |
| Cut / polarization | x-cut TE, z-cut TM | 2 |

  - Total: 6,300 optical solves. At about 1 s each in Node that is about 1.75 h single-threaded, or about 11 min with 10 workers (estimate from the bench above).
  - Stored scalars per point (n_eff, n_g, A_eff, confinement in LN, dn_eff/dV per unit gap field) are under 1 MB in total.
  - Field images: 64 x 48 float16 x 3 components ≈ 18 kB per point. Ship fields only for a sparse subset (for example 300 points, about 5.5 MB lazy-loaded); the live solver covers the rest.
  - Interpolation: multilinear or cubic, under 1 ms per query.
  - Error control: held-out random points solved live in CI. Target |Delta n_eff| < 1e-3 (proposal); report the actual error in the UI.
  - Tag every lattice value `derived` with the engine version hash.
- **Physics caveats to state:**
  - In x-cut, TE light propagating along y sees n_e. A bend or ring sees an angle-dependent index, so ring modes in x-cut need azimuthal treatment (straight-section lattice only).
  - A metal in the optical window is rejected by default (atlas policy).
- **License:** the engine is GPL-3.0-or-later and the author is the sole committer (R03). Options: dual-license, or ship it as a separately loaded GPL worker bundle with its source linked. This decision blocks S5 and S6 live mode.
- **Level:** E (live), I (lattice sliders), L (one slider, "make the waveguide narrower", picture of the mode).
- **Effort:** M (wrapper UI + lattice pipeline + CI held-out checks).
- **Beyond a PDF:** your own geometry solved in your browser, with mesh and convergence diagnostics and exportable numbers.

### S6. EO modulator designer and eye diagram
- **Model:**
  - Half-wave voltage-length product: VpiL = n_conv lambda g / (n_e^3 r33 Gamma). Gamma (field-optical overlap) is computed by the atlas `eo_overlap` with the full tensor; the push-pull convention is stated explicitly (atlas `vpi_convention`). Review: Zhu et al., Adv. Opt. Photon. 13, 242 (2021), doi:10.1364/AOP.411024.
  - Line: quasi-TEM C', L', n_RF, Z0 and alpha(f) from `rf_line`.
  - Traveling-wave response: H(f) = Phi(f)/Phi_DC, with Phi = int_0^L V(z) exp(+j beta_o z) dz (atlas `eo-response.mjs`, which follows Alferness, IEEE TMTT 30, 1121 (1982), doi:10.1109/TMTT.1982.1131213, Sec. VI.B, eqs. 18-22).
- **Closed-form tier (L/I, under 1 ms):**
  - Pure velocity mismatch: |H| = |sin u / u| with u = pi f L |n_RF - n_g| / c, so f_3dB,el = 1.39 c / (pi L |n_RF - n_g|).
  - Pure RF loss: |H| = (1 - exp(-alpha L)) / (alpha L).
  - Impedance mismatch via source and load reflection coefficients (atlas formula).
- **Eye diagram:**
  - Chain: PRBS, then driver (raised cosine), then H(f), then MZM field cos(pi V / (2 Vpi) + phi_b) for a chirp-free push-pull MZM, then intensity, then photodiode filter, then optional noise, then a 2D histogram.
  - Cost: 54 ms for PRBS15 x 16 samples per bit on the laptop, an estimated 0.16 to 0.32 s on a phone. Use PRBS9 to PRBS11 for live updates.
- **Wedge:** baud, length, n_RF - n_g, alpha_0 sqrt(f), Z0 vs 50 ohm, then the eye closes. Show the VpiL x alpha trade-off curve with the atlas literature points (R04) as context.
- **Validation:** atlas K-case references and S7 tests; Alferness closed-form limits (sinc, loss-only); energy check H(0) = 1. The eye is shown qualitatively only; no claim of matching a published eye.
- **Reuse:** atlas `eo_overlap`, `rf_line`, `loaded_line`, `eo_response` (GPL); the lattice from S5 for Gamma and n_g.
- **Effort:** M.
- **Beyond a PDF:** the whole chain from cross-section to eye on one page, with every intermediate quantity shown.

### S7. Ring resonator, EO comb, Kerr comb
- **S7a ring:**
  - All-pass transmission T = (a^2 - 2 r a cos phi + r^2) / (1 - 2 a r cos phi + (r a)^2); add-drop analogous (Bogaerts et al., Laser Photon. Rev. 6, 47 (2012), doi:10.1002/lpor.201100017).
  - EO tuning: Delta lambda = lambda Delta n_eff / n_g, with dn_eff/dV from S5/S6.
  - Validation: critical coupling at r = a; FSR = lambda^2 / (n_g L).
  - Effort S.
- **S7b EO comb (Kerr-free):**
  - With a phase modulator at exactly one FSR and negligible dispersion, each fast-time sample has the steady-state solution E(t) = t_c E_in / (1 - r exp(i beta cos Omega t)) (kernel E1, 0.3 ms). The spectrum comes from one FFT.
  - Dispersion and detuning: coupled-mode ODE over N sidebands, da_k/dt = (-kappa/2 + i Delta_k) a_k + i (beta/2)(a_{k-1} + a_{k+1}) + drive (sign conventions per Buscaino et al., JLT 38, 1400 (2020), doi:10.1109/JLT.2020.2973884). For N about 200, RK4 runs at order 10 to 100 ms (estimate).
  - Validation: comb envelope and width vs Zhang et al., Nature 568, 373 (2019), doi:10.1038/s41586-019-1008-7 and Buscaino 2020; coupled-ring EO comb generators, Hu et al., Nat. Photon. 16, 679 (2022), doi:10.1038/s41566-022-01059-y.
  - Historical anchor: Kourogi et al., IEEE JQE 29, 2693 (1993), doi:10.1109/3.250392.
  - Effort S.
- **S7c Kerr soliton comb:**
  - Normalized LLE: dpsi/dt = -(1 + i zeta) psi + i |psi|^2 psi + i (d2 / 2) d^2 psi / dtheta^2 + f (Lugiato and Lefever, PRL 58, 2209 (1987), doi:10.1103/PhysRevLett.58.2209). The microresonator form follows Chembo and Menyuk, PRA 87, 053852 (2013), doi:10.1103/PhysRevA.87.053852; Coen et al., Opt. Lett. 38, 37 (2013), doi:10.1364/OL.38.000037; and Herr et al., Nat. Photon. 8, 145 (2014), doi:10.1038/nphoton.2013.343. Review: Kippenberg et al., Science 361 (2018), doi:10.1126/science.aan8083.
  - Cost: 72k steps/s at N = 512 on the laptop (kernel D1). A detuning scan of order 1e5 to 1e6 steps takes about 1.4 to 14 s on the laptop and 4 to 80 s on a phone (estimates; the step count depends on dt and scan rate). Live animation runs about 1000 steps per frame in a worker.
  - WebGPU helps only for batches, for example a 256-detuning stability map. A single N = 512 FFT is too small to amortize GPU dispatch (estimate).
  - LN specifics: a photorefractive effect counteracts the thermal triangle and enables turnkey or self-starting solitons (He et al., Optica 6, 1138 (2019), doi:10.1364/OPTICA.6.001138; Lin et al., Opt. Express 29, 42932 (2021), doi:10.1364/OE.446527). An optional slow index term is labelled `template`.
  - Validation: single-soliton analytic sech approximation and existence range (Herr 2014); cross-check against gnlse-python (MIT) or pyLLE (NIST; GitHub license field NOASSERTION, so check before use) for the same normalized parameters.
  - Effort M.
- **Beyond a PDF:** watching the comb lines appear, step and lock is the canonical "a PDF cannot do this" moment. R12 pairs it with optional sonification.

### S8. Photorefractive and DC-drift toys
- **Photorefractive:**
  - Band transport: Kukhtarev et al., Ferroelectrics 22, 949 (Crossref issue date 1978), doi:10.1080/00150197908239450.
  - Reduced toy: the space-charge field builds and decays with the dielectric relaxation time tau = eps0 eps_r / (sigma_dark + sigma_photo(I)). Index change Delta n = -(1/2) n^3 r E_sc.
  - 1D grating option: drift plus diffusion, with N = 256 grid and implicit stepping (well under 1 ms per step, estimate).
  - Label `template`: conductivities span orders of magnitude between samples (to be sourced in R06/R08).
- **DC drift:** Maxwell-Wagner two-layer series model (LN film = 1, buffer/cladding = 2):
  - V_1(t) = V [G2/(G1+G2) + (C2/(C1+C2) - G2/(G1+G2)) exp(-t/tau)], with tau = (C1+C2)/(G1+G2).
  - The bias point moves from the capacitive to the resistive voltage division.
  - Multi-node RC networks fit WebSpice (R03 item 9, NGSpice WASM) or a 10-line ODE.
  - References: Salvestrini et al., JLT 29, 1522 (2011), doi:10.1109/JLT.2011.2136322 (bulk LN MZM drift); Holzgrafe et al., Opt. Express 32, 3619 (2024), doi:10.1364/OE.507536 (TFLN relaxation).
- **Validation:** t = 0 and t = infinity limits; single exponential; parameter fits shown only against published curves, with figure crops never embedded (R13 rule).
- **Level:** L (footer bias-drift easter egg in R12; "re-lock" button), I (layer sliders).
- **Effort:** S.
- **Beyond a PDF:** the time axis is the content; drag a conductivity and watch decades of time compress.

### S9. Poling: nucleation and growth toy
- **Model:**
  - Kolmogorov-Avrami-Ishibashi (KAI) switched fraction X(t) = 1 - exp(-(t/t0)^n) (Ishibashi and Takagi, J. Phys. Soc. Jpn. 31, 506 (1971), doi:10.1143/JPSJ.31.506).
  - LN-specific kinetics and hexagonal domain shapes: Shur, J. Mater. Sci. 41, 199 (2006), doi:10.1007/s10853-005-6065-7.
  - Coercive field vs stoichiometry: Gopalan et al., APL 72, 1981 (1998), doi:10.1063/1.121491 (values to quote via R06).
  - Switching charge Q = 2 P_s A ties the current transient to the switched area. This is already the "arrival-parameter" model of the poling animation, R03 2.2. The P_s source there is secondary, so re-source it.
- **Compute:** stochastic cellular automaton on a hexagonal lattice with field-dependent nucleation and wall-velocity probabilities. CPU costs about 1 ms per step at 512^2 (kernel I1). A WebGL2 ping-pong framebuffer makes it trivially real-time. A deterministic seeded PRNG keeps the R13 `render(t)` contract.
- **Validation:** X(t) from the automaton fit to the KAI form (n about 2 for 2D growth from constant nucleation; Avrami); current integral equals 2 P_s A; qualitative domain shapes vs Shur. Label `template` for all rates.
- **Effort:** M. It links to and modernizes the existing animation.
- **Beyond a PDF:** you apply the pulse; domains nucleate, grow as hexagons and merge, while the current trace draws itself.

### S10. Piezoelectric and acoustic waves
- **Bulk (Christoffel):**
  - Gamma_il = c^E_ijkl n_j n_k + gamma_i gamma_l / eps_n, with gamma_i = e_kij n_k n_j and eps_n = n_k eps^S_kl n_l (piezoelectrically stiffened). Solve rho v^2 from the 3x3 eigenproblem (Auld, *Acoustic Fields and Waves in Solids*, Wiley 1973, vol. 1; Royer and Dieulesaint, *Elastic Waves in Solids*, Springer 2000).
  - Group velocity and power-flow angle: Jaeken and Cottenier, Comput. Phys. Commun. 207, 445 (2016), doi:10.1016/j.cpc.2016.06.014 (algorithm; code license not found, so implement from the paper).
  - Rotated cuts use the Bond 6x6 transformation (Auld); cut notation follows IEEE Std 176-1987, for example 128 degree rotated Y-cut, X-propagating.
- **Constants:** Kovacs et al., IEEE Ultrason. Symp. 1990, 435, doi:10.1109/ULTSYM.1990.171403; Warner, Onoe, Coquin, JASA 42, 1223 (1967), doi:10.1121/1.1910709. Neither was read in this track; R06 must enter them with provenance.
- **SAW:** partial-wave method, an 8x8 eigenproblem in the depth decay constant per trial velocity, plus a boundary determinant root (Campbell and Jones, IEEE Trans. Sonics Ultrason. 15, 209 (1968), doi:10.1109/T-SU.1968.29477).
  - k^2 ≈ 2 (v_free - v_metallized) / v_free (Ingebrigtsen, JAP 40, 2681 (1969), doi:10.1063/1.1658060).
  - IDT synchronous frequency f0 = v / lambda_IDT.
  - Cost estimate: 361 directions x about 50 root iterations x about 10 us ≈ 0.2 s on the laptop.
- **Validation:** isotropic limit (two degenerate shear branches); pure-mode directions; published SAW velocity and k^2 for 128 degree Y-X and Y-Z LN from the constants' primary paper (values to be read, not quoted here).
- **Level:** I (3D slowness surface, rotate the cut), E (k^2 vs rotation angle, SAW). It connects to the author's piezo-optomechanics work (R01) and the phone-filter story (R09).
- **Effort:** M (bulk), L (SAW).
- **Beyond a PDF:** a rotatable 3D slowness surface and live cut-angle optimization curves.

### S11. Fab toys (label `template` unless a parameter is `reported`)

| Toy | Model | Cost | Reuse | Honesty notes |
|---|---|---|---|---|
| Czochralski | Conduction-only FD heat equation in r-z (existing app) + interface where T = T_melt | under 0.3 s per frame-set (existing app runs live) | R03 item 10 (silicon presets) | Replace with sourced LN melt, crystal and Pt crucible properties (R06); keep the "qualitative" label as the existing app does |
| Smart-cut depth | Projected range and straggle vs ion species and energy from an offline SRIM table; Gaussian damage profile; split at peak | under 1 ms (lookup) | SRIM (Ziegler et al., NIMB 268, 1818 (2010), doi:10.1016/j.nimb.2010.02.091); pysrim wrapper MIT | SRIM is distributed free by its authors but is not open source; check its terms before publishing derived tables. Ion-slicing reference: Levy et al., APL 73, 2293 (1998), doi:10.1063/1.121801 |
| Ar milling sidewall | 2D string or level-set surface evolution with angle-dependent sputter yield and line-of-sight redeposition | under 0.3 s for 200 steps (estimate; 1D front of about 1000 nodes) | none | Yield form after Yamamura-type models (Yamamura and Tawara, ADNDT 62, 149 (1996), doi:10.1006/adnd.1996.0005, monatomic targets only), so LN parameters are `template`; compare only qualitatively to published SEM cross-sections |

Effort M each. Value: mostly L-level narrative for the R13 fab-flow viewer. Do these after the optics set.

### S12. LNOI wafer colour (added)
- **Model:** 2x2 thin-film TMM for air / LN / SiO2 / Si at normal or oblique incidence, s and p polarizations. In-plane anisotropy uses n_o or n_e by polarization for x-cut. Reflectance R(lambda) is weighted by the CIE CMFs and an illuminant, then converted XYZ to sRGB.
- **Cost:** under 1 ms per colour. A GPU per-pixel thickness map (wafer non-uniformity) is a nice L toy.
- **Validation:** port of the R03 item 6 Python code; check against the Python output, and the quarter-wave and zero-thickness limits. The Zelmon validity range starts at 0.4 um, so the blue end of the visible band is at the edge (flag).
- **Effort:** S.
- **Beyond a PDF:** "why your wafer is purple", plus "rotate the polarizer" for x-cut.

### S13. Fiber-to-chip coupling game (added)
- **Model:** Gaussian overlap per axis, eta = 2 w1 w2 / (w1^2 + w2^2) times offset and tilt factors (closed form in mode-guessr `overlap.mjs`, already validated per R03).
- **Effort:** S.
- **Level:** L/I. It reuses the speedrun or quiz pattern. Use real TFLN mode sizes from the S5 lattice and an elliptical-Gaussian fit labelled `derived`.

### S14. Effective-index BPM (added)
- **Model:** paraxial scalar FD-BPM, Crank-Nicolson, transparent or PML boundary (algorithm reference: BPM repo, MIT, R03 item 11). The vertical dimension is collapsed by the effective-index method, which must be labelled as approximate for a high-contrast TFLN rib.
- **Cost:** 69 ms for 1024 x 4000 steps on the laptop. A WebGL fragment-shader version enables painting the index in real time. Write it fresh; do not copy interactwave shaders (unlicensed upstream, R03).
- **Validation:** power conservation; free-space Gaussian diffraction; MMI self-imaging length L_pi = 4 n_r W_e^2 / (3 lambda) (Soldano and Pennings, JLT 13, 615 (1995), doi:10.1109/50.372474).
- **Effort:** M.

### S15. SPDC joint spectral amplitude (added)
- **Model:** f(ws, wi) = alpha(ws + wi) phi(ws, wi), with pump envelope alpha and phase-matching function phi = sinc(Delta k L / 2) exp(i Delta k L / 2) (Grice and Walmsley, PRA 56, 1627 (1997), doi:10.1103/PhysRevA.56.1627).
  - Purity is P = Tr(rho^2) / Tr(rho)^2 with rho = J J^dagger, and the Schmidt number is K = 1/P. This needs no SVD: one matrix product (kernel K1, 13 ms at 256^2).
  - Delta k comes from S3 (bulk) or the S5 lattice (TFLN).
- **Validation:** a separable JSA gives P = 1 (kernel K1 check); Gaussian-approximation closed form for K.
- **Effort:** S.
- **Beyond a PDF:** "make a pure photon": drag pump bandwidth and length to the separable point.

### S16. Pyroelectric toy (added)
- **Model:** Q = p A Delta T and V = Q / C. The coefficient p for LN comes from R06 (not entered here).
- **Level:** L only. It explains wafer sparking and handling rules and links the R12 404-page "kintsugi" motif.
- **Effort:** S.

## 4. Architecture recommendations

| Concern | Recommendation | Rationale |
|---|---|---|
| Physics core | One TypeScript package (`physics/`, no DOM): pure functions, `Float64Array` buffers, unit-suffixed names (`lambda_um`, `E_V_per_m`) plus branded unit types at API boundaries | Same code in browser, worker, Node CLI (precompute, CI); mirrors the atlas `run.mjs` design |
| Tensor conventions | One module that owns the axes (IEEE Std 176-1987: z = c, x normal to a mirror plane), Voigt mapping, Bond rotation, Euler-angle cut definitions, and the sign convention of r and d; every exported JSON carries `convention_id` | Sign and axis conventions are the most common LN error source (S1 pitfalls); atlas already versions its conventions (`EO_RESPONSE_CONVENTIONS.id`) |
| Materials | Loaded from the site property API JSON (R06) at runtime. Each value carries `{value, unit, condition, source_doi, locator, provenance: reported/derived/template, validity}`; solvers refuse inputs outside validity | A single source of truth; the atlas `materials.json` caveat fields are the model (R03 2.3) |
| Results | Every function returns `{value, unit, provenance: {formula_id, inputs, sources, engine_version}}`; the UI renders `template` values visibly different (R13) | Traceability; AI-friendly endpoints |
| Compute tiers | (1) closed form on the main thread; (2) workers for anything over about 16 ms (eye, LLE, FEM), with Comlink (Apache-2.0) for RPC and cancellation by terminating the worker; (3) WebGL2 fragment shaders for per-pixel visuals; (4) WebGPU compute only as progressive enhancement (LLE batches, large automata) with an automatic fallback | WebGPU: Chrome/Edge desktop and Android (Chrome 121+, Android 12+), Safari 26 (macOS/iOS), Firefox 141+ on Windows and 145+ on Apple Silicon macOS, Firefox Android not confirmed ([web.dev, 2025-11](https://web.dev/blog/webgpu-supported-major-browsers)); WebGL2 is near-universal |
| Heavy solver | Atlas engine as a lazily loaded worker bundle (about 275 kB gzip unminified; drop the semiconductor stage); coarse-mesh preview, then fine on release; progress events; hard vertex budget (atlas default 80k) and a phone budget (proposal 20-30k) | Measured 0.3-1.2 s on the laptop; the phone estimate needs a coarse preset |
| Licensing boundary | Keep GPL code in its own chunk with a source link, or dual-license (author decision); site-authored physics core under a permissive license; data under CC BY (R03 2.3) | Avoid an accidental GPL scope over the whole site |
| Determinism | Seeded PRNG; animations are pure `render(t)` (R13); no `Date` or `Math.random` in physics; fixed-order reductions | Screenshot tests, video export, reproducible links |
| State | URL hash with a versioned schema (`#s=eo-mod&v=1&cut=x&lam_nm=1550&gap_um=5...`); a short canonical parameter order; migrations per version | Shareable "look at this design" links; citations of exact states |
| Export | "Download JSON" = inputs + outputs + provenance + `convention_id` + engine hash, matching the property API schema; CSV for curves; SVG/PNG for plots | Results are reusable by experts and AI agents |
| Plotting | uPlot (MIT, small) for live curves; Plotly basic (MIT, about 388 kB gzip per R03 2.8) only on expert pages; three.js (MIT) or Threlte (MIT) for 3D | Mobile bundle budget |
| Performance | Render on demand (0 idle frames, R13); debounce solves; progressive refinement; `prefers-reduced-motion` respected; numeric inputs next to every slider; units always visible | Lay usability plus expert precision |
| Precompute pipeline | Node CLI over the same core (atlas `studies` sweeps for S5); outputs content-hashed, versioned data files; CI re-solves random held-out points | Lattice trustworthiness |
| FFT / linear algebra | Own radix-2 FFT (about 30 lines, as in the bench) or fft.js (MIT); ml-matrix (MIT) only if needed; no heavy math dependencies | Small, auditable |

## 5. Validation plan

### 5.1 Unit tests against analytic limits (node:test, run in CI)

| Sim | Tests (tolerance proposal) |
|---|---|
| S1 | Uniaxial limits exact to 1e-12; E along z closed form; 45-degree rotation for E along x; threefold invariance |
| S2 | Ring radii vs exact uniaxial retardation (1e-6 rad); zero thickness gives dark field; symmetry of the cross |
| S3 | Zelmon CLN n_e, n_o at 1.55 um vs refractiveindex.info values (1e-5); QPM periods 6.818 / 18.989 um (regression); acceptance FWHM = 2.78 / (L dDelta k/dx) |
| S4 | sinc^2 and tanh^2 limits (1e-8; met in kernel C1); Manley-Rowe; OPA cosh^2 |
| S5 | Atlas suite as is (226 tests, K references); lattice: held-out live solves |
| S6 | Alferness sinc and loss limits; H(0) = 1; reflection-free case for Z_s = Z_L = Z0 |
| S7 | Critical coupling; FSR; EO comb closed form vs coupled-mode ODE at zero dispersion; LLE energy balance and the single-soliton sech fit |
| S8 | t = 0 and t = infinity voltage division; tau formula |
| S9 | Automaton X(t) KAI fit exponent; charge integral = 2 P_s A |
| S10 | Isotropic limit; v^2 = c44 / rho shear check; Bond-rotation invariants |
| S12 | Quarter-wave reflectance minimum; Python TMM parity |
| S14 | Power conservation (kernel J1: 1.0027 vs 1.0027); Gaussian beam waist growth |
| S15 | Separable JSA gives K = 1 (met in kernel K1) |

### 5.2 Cross-checks against Python and published references
- **Mode / EO:** atlas `validation/eoref/fmode.py` (scikit-fem, BSD-3-Clause), femwell (GPL-3.0; external check only, not shipped), EMpy (MIT) for isotropic cases.
- **Nonlinear:** SNLO points (free, closed source) for S3/S4; published PPLN tuning (Myers 1995); TFLN SHG efficiency definitions (Wang 2018).
- **Combs:** gnlse-python (MIT) or pyLLE (license to check) for S7c; Zhang 2019 and Buscaino 2020 for S7b.
- **Acoustics:** published 128 degree Y-X and Y-Z SAW values, after R06 enters the constants.
- **Golden JSON snapshots** for each sim's default state; any change needs an explicit baseline update (atlas `bench.mjs` pattern).

### 5.3 Browser and device checks
- Playwright (Apache-2.0) smoke runs per sim: render, run, export JSON, reload from the URL hash, then confirm the outputs match.
- Phone proxy: Chrome DevTools Protocol `Emulation.setCPUThrottlingRate` at 4x and 6x, plus at least one real mid-range Android and one iPhone (Safari JavaScriptCore). Record the time per sim into a dated log and replace the section 1 estimates.
- GPU paths: compare a pixel sample against the CPU reference (S2, S9, S14) within a tolerance; test the WebGPU-absent fallback.
- Fresh-context audit after implementation (author standing rule).

## 6. Risks and open questions
1. The atlas engine license (GPL-3.0-or-later) blocks live S5/S6 until decided (also R03 Q1).
2. Phone timings are estimates (x3-6 from Geekbench single-core ratios plus margin). Phone memory for 3 to 11M-nonzero factors is unmeasured.
3. Material constants not entered here: Gayer, Jundt and Edwards-Lawrence coefficients, LN elastic, piezoelectric and permittivity tensors (Kovacs 1990, Warner 1967), pyroelectric p, thermal expansion for Lambda(T), coercive fields. All of these go to R06 with provenance.
4. Zelmon MgO:LN o/e labelling erratum (2026-10-22): check any existing site or atlas use of MgO entries. The atlas `lithium_niobate` dispersion is the congruent set (R03 2.3), so it is not affected.
5. The 1550 nm Pockels coefficients are not in Weis and Gaylord. The default is clamped at 633 nm; the UI must show this.
6. Rings in x-cut have an angle-dependent index; straight-section lattices do not cover them.
7. The fab toys (S11) are mostly `template`. Keep them clearly labelled or defer them.

## Website implications

### Ranked list (best value per effort first)
1. **S3 Sellmeier / QPM / phase-matching calculator (S, I/E).** High daily utility for experts. It also feeds the R12 poled-stripe periods. Ship it with the Zelmon erratum handled and provenance on every number.
2. **S2 conoscope + S1 index ellipsoid "crystal optics bench" (S-M, L/I/E).** It doubles as the R12 logo and live hero. It runs on WebGL2 and costs under 16 ms per frame (estimate).
3. **S4 coupled-mode SHG/OPA + OPO threshold (S, I/E).** Analytic and RK4 kernels at about 1 ms; strong in-browser value (depletion and detuning as you drag).
4. **S7a/S7b ring + EO comb (S, L/I/E).** Closed form in under 1 ms. It showcases the TFLN-defining EO comb.
5. **S6 EO modulator designer, closed-form tier + eye diagram (S-M, L/I).** Live 50 ms eye. Expert numbers come from the atlas later.
6. **S12 LNOI wafer colour (S, L)** and **S13 coupling game (S, L/I).** Approachable, both reuse R03 code.
7. **S8 DC-drift and photorefractive toys (S, L/I).** These power the R12 bias-drift footer and photorefractive cursor with real equations.
8. **S15 SPDC JSA (S, E).** A cheap quantum-optics hook.
9. **S5 live TFLN mode/EO solver + lattice (M, E/I).** Highest expert value, but blocked by the license decision and needs lattice infrastructure.
10. **S7c Kerr LLE (M, E).** Iconic, worker-based. WebGPU is optional.
11. **S9 poling automaton (M, L/I).** It modernizes the existing animation.
12. **S10 Christoffel bulk acoustic (M); SAW partial-wave (L).**
13. **S14 effective-index BPM (M, I).**
14. **S11 fab toys (M each, L, `template`-heavy)** and **S16 pyroelectric (S, L).**

### Simulation roadmap (3 tiers)

| Tier | Scope | Sims | Infrastructure delivered |
|---|---|---|---|
| 1, launch (about 3-5 weeks of effort, estimate) | Closed-form and ODE kernels, all on the main thread or one worker; L entry points on landing and chapter pages | S1, S2 (z-cut + field, white light), S3, S4 (CW), S7a, S7b, S6 closed-form + eye, S12, S8 | `physics/` TS core with units, provenance and conventions; property-API loader; URL-hash state; JSON export; uPlot; WebGL2 shader harness; node:test analytic suite; Playwright smoke with CPU throttling |
| 2, expert depth | Real solvers and precomputed data | S5 lattice (6.3k solves) + live atlas worker (after the license decision); S6 wired to atlas Gamma, n_RF, Z0, S21_EO; S7c LLE in a worker; S13; S15; S9 GPU automaton | Worker pool + cancel; precompute CLI + CI held-out checks; content-hashed data files; WebGPU progressive path (LLE batches); real-device timing log |
| 3, breadth and polish | Acoustics, components, fab narrative | S10 (bulk, then SAW), S14 BPM, S4 pulsed chi(2) split-step, S11 fab toys integrated into the R13 fab-flow viewer, S16; S2 arbitrary cuts | Bond-rotation tensor module for acoustics; scene-contract integration (`render(t)`) for video export; fresh-context audit of all sims |
