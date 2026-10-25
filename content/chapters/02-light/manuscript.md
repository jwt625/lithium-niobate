# 02 Light

Manuscript for chapter 02. Conventions for integration:

- Source tags: `[id STATUS]`, id from `refs.yaml`. Status codes: P, P-comp, P-db, S, V, U, reported, derived, template, engine (DevLog-004 rule 3; `engine` = eo-modulator-atlas FEM output, as on the approved 2.2 mockup).
- `[derived: ids]` = computed for this chapter from the listed inputs (scratch computation, 2026-10-25; formulas given in L3). PHY tests must reproduce every derived number to the printed digits.
- `{{FIG F2-xx}}` = figure placement; specs in `figures.md`.
- Units SI or field standard. Wavelengths are vacuum wavelengths. Crystal frame: IEEE Std 176-1987, z = c (polar axis, +z by positive d33), x perpendicular to a mirror plane [ieee176 P; R14 rows 76-79].
- Numbers marked U never appear as plain text on a page: they carry the U badge and the popup names the claimed source.

---

## 2.1 Birefringence and the index ellipsoid

### L1 Phenomenon

LiNbO3 is optically uniaxial and negative: light polarized along the c axis sees the extraordinary index n_e, light polarized perpendicular to it sees the ordinary index n_o, and n_e < n_o. At 1550 nm, n_o = 2.2111 and n_e = 2.1376, a difference of -0.07355 [derived: zelmon1997 P-db]. A z-cut plate between crossed polarizers in a cone of convergent light shows a dark cross (isogyres) and concentric dark rings (isochromes); for a 1.00 mm plate at 632.8 nm the first three dark rings sit at 11.1, 15.7 and 19.4 degrees from the axis, measured in air [derived: zelmon1997]. A field across the plate (along x or y) makes the crystal biaxial through r22: the single optic axis splits in two, and the cross opens into two hyperbolic brushes.

{{FIG F2-01}}

### L2 Quantitative model

**Index ellipsoid.** With no field, in the crystal frame

    x^2/n_o^2 + y^2/n_o^2 + z^2/n_e^2 = 1.                                  (2.1)

A wave with wave vector at angle theta to c has one ordinary index n_o and one extraordinary index

    1/n_e(theta)^2 = cos^2(theta)/n_o^2 + sin^2(theta)/n_e^2.               (2.2)

The extraordinary Poynting vector walks off the wave vector by rho, tan(rho) = (n_e(theta)^2/2)(1/n_e^2 - 1/n_o^2) sin(2 theta). Largest walk-off: 2.150 deg at theta = 43.92 deg (632.8 nm), 2.000 deg at 44.00 deg (1064 nm), 1.938 deg at 44.03 deg (1550 nm) [derived: zelmon1997].

{{FIG F2-03}} (state E = 0: section of the ellipsoid normal to k, n_e(theta), rho)

**Dispersion.** Zelmon et al. fitted congruent LN (CLN) at 21 C over 0.4 to 5.0 um [zelmon1997 P-db]:

    n^2 - 1 = sum_{i=1..3} B_i lambda^2 / (lambda^2 - C_i),   lambda in um, C_i in um^2.   (2.3)

| Axis | B1 | C1 | B2 | C2 | B3 | C3 | Status |
|---|---|---|---|---|---|---|---|
| o | 2.6734 | 0.01764 | 1.2290 | 0.05914 | 12.614 | 474.60 | [zelmon1997 P-db] |
| e | 2.9804 | 0.02047 | 0.5981 | 0.0666 | 8.9543 | 416.08 | [zelmon1997 P-db] |

Computed values (21 C; group index n_g = n - lambda dn/dlambda) [derived: zelmon1997]:

| lambda (um) | n_o | n_e | n_e - n_o | n_g,o | n_g,e |
|---|---|---|---|---|---|
| 0.400 | 2.43927 | 2.33212 | -0.10715 | 3.0623 | 2.8619 |
| 0.532 | 2.32319 | 2.23357 | -0.08962 | 2.5847 | 2.4562 |
| 0.6328 | 2.28646 | 2.20222 | -0.08424 | 2.4568 | 2.3480 |
| 0.775 | 2.25866 | 2.17837 | -0.08029 | 2.3686 | 2.2728 |
| 1.064 | 2.23211 | 2.15554 | -0.07657 | 2.2969 | 2.2113 |
| 1.310 | 2.21997 | 2.14512 | -0.07485 | 2.2738 | 2.1912 |
| 1.550 | 2.21111 | 2.13756 | -0.07355 | 2.2637 | 2.1823 |
| 2.000 | 2.19670 | 2.12533 | -0.07136 | 2.2599 | 2.1787 |
| 3.390 | 2.14473 | 2.08158 | -0.06315 | 2.2992 | 2.2115 |
| 5.000 | 2.05080 | 2.00253 | -0.04827 | 2.4142 | 2.3087 |

The birefringence shrinks by a factor 2.2 from 0.4 to 5 um. The group index has its minimum where material group-velocity dispersion (GVD) changes sign: 1.913 um (e) and 1.899 um (o) [derived: zelmon1997].

Check against measurement: Nelson and Mikulyak measured n_o = 2.2866, n_e = 2.2028 at 632.8 nm and 24.5 C, and 2.2323, 2.1561 at 1060 nm [nelson1974 P-comp via weis1985]. Zelmon gives 2.2865, 2.2022 at 632.8 nm: n_o agrees to 1e-4, n_e is 6e-4 lower [R14 row 31].

**Models and errata.**

| Model | Material | Axes | T range | Status | Erratum or caveat |
|---|---|---|---|---|---|
| Zelmon 1997 | CLN | o, e | 21 C only | [zelmon1997 P-db] | none for CLN |
| Zelmon 1997 | 5 mol% MgO:CLN | o, e | 21 C only | [zelmon1997 P-db] | Table 2 o/e headings switched; erratum published 2026-10-22 [zelmon1997err reported]. The swap was already stated in print in 2008 [gayer2008 P, p. 348; R14 row 36d]. Code copied from the 1997 table gives n_e > n_o, impossible for negative uniaxial LN |
| Jundt 1997 | CLN | e only | 20 to 250 C | coefficients [jundt1997 S] | primary not held; f = (T - 24.5)(T + 570.82) as transcribed |
| Gayer 2008 | MgO5, 1% MgO:SLN | e (both); o (MgO5) | n_e 20 to 200 C; n_o to 1620 nm and about 20 to 100 C | [gayer2008 P] | erratum replaces Fig. 3 only, Table 1 unchanged [gayer2008err P]; dn/dT from its b-coefficients is anomalous (below) |
| Schlarb generalized | CLN to SLN, Mg/Zn/In | o, e | 400 to 1200 nm | [volk2008 S] | accuracy about 2e-3; 1993-1996 primaries not held |
| Edwards and Lawrence 1984 | CLN | o, e | T-dependent | [edwards1984] | coefficients not entered |

At 1550 nm: Jundt n_e = 2.13786 at 24.5 C vs Zelmon 2.13756 at 21 C [derived: jundt1997, zelmon1997]. Gayer MgO5: n_e = 2.13057, n_o = 2.20881 at 24.5 C [derived: gayer2008]. Composition moves n_e far more than n_o: near-stoichiometric LN (SLN) has n_o = 2.288, n_e = 2.190 at 633 nm [volk2008 P-comp, Table 1.2], so n_e drops by 0.012 relative to CLN (Zelmon) while n_o changes by +1.5e-3; the generalized Sellmeier gives 2.2859 and 2.1867 at 50.0 mol% Li2O [derived: volk2008 S; R14 row 34].

**Thermo-optic coefficients.**

| Quantity | Value (1/K) | Condition | Status |
|---|---|---|---|
| dn_e/dT | 4.89e-5 / 4.01e-5 / 3.75e-5 | CLN, 632.8 / 1064 / 1550 nm, 25 C | [derived: jundt1997 S] |
| dn_e/dT | 4.12e-5 | CLN, 632 nm, 300 K, fit (-2.6 + 22.4e-3 T) x 1e-5 | [schwesyg2011 S, quoting moretti2005] |
| dn_o/dT | 0.37e-5 | CLN, 632 nm, 300 K, fit (-1.7 + 6.9e-3 T) x 1e-5 | [schwesyg2011 S, quoting moretti2005] |
| dn_e/dT | 3.34e-5 | CLN, 1523 nm, 300 K | [zhu2021 S, quoting moretti2005] |
| dn_e/dT from Gayer b-coefficients | 2.65e-4 (MgO5 e), 1.11e-4 (MgO5 o), -7.1e-5 (1% MgO:SLN e) | 1550 nm, 24.5 C | [derived: gayer2008; R14 row 36c] Not physical; do not use for absolute dn/dT |

n_e is about 10 times more temperature-sensitive than n_o, so heating a plate changes its birefringence almost entirely through n_e. Moretti's measured range is 320 to 515 K (abstract) while the title states 300 to 515 K [moretti2005 reported].

### L3 How it is computed and measured

- **Conoscope.** Each pixel is one propagation direction (u, v) = sin(theta_ext)(cos phi, sin phi). Internal angles follow Snell's law with each eigenwave's own index (the extraordinary angle by fixed-point iteration of eq. 2.2). Retardation Gamma = (2 pi d / lambda)(n_o cos theta_o - n_e(theta_e) cos theta_e). Intensity between crossed polarizers: I = sin^2(2 psi) sin^2(Gamma/2), psi = azimuth of the eigen-polarization relative to the polarizer. Dark rings at Gamma = 2 pi m; isogyres where psi = 0 or 90 deg. Fresnel transmission differences between eigenwaves are neglected. White light: I(lambda) integrated against the CIE 1931 2-degree color-matching functions [bornwolf; color pipeline as in DevLog-003b sec. 3.2]. The ring angles in L1 come from this exact phase, not the small-angle formula.
- **Field-induced biaxiality.** For E along x or y on a z-cut plate, the in-plane impermeability splits by r22 E, so the birefringence for propagation along z is n_o^3 r22 E. At 632.8 nm, E = 1 kV/mm, r22 = 3.4 pm/V (clamped, Turner via weis1985), this is 4.06e-5, a retardation of 0.404 rad for d = 1 mm [derived: zelmon1997, weis1985 P-comp]. The optic axes tilt from c by theta with (n_o - n_e) sin^2(theta) = n_o^3 r22 E: 1.26 deg inside, 2.88 deg in air at 1 kV/mm [derived: zelmon1997, weis1985; first-order in E]. The page computes the exact eigen-decomposition (F2-03 code path), so this formula is only the acceptance check.
- **Evaluating Sellmeier models.** Inputs are vacuum wavelength in um and temperature in C; each model refuses input outside its stated validity window. Tests: n_e < n_o over the whole window (catches the MgO5 swap); Zelmon CLN at 1.55 um: n_o = 2.21111, n_e = 2.13756 (R11 kernel A1 regression). n_g by central difference (step 1e-4 um); GVD from the second derivative.
- **Error budget at 1550 nm.** Zelmon (21 C) vs Jundt (24.5 C) differ by 3.0e-4 in n_e; 3.5 K x 3.75e-5/K = 1.3e-4 of that is the temperature offset, the residual 1.7e-4 is model-to-model spread. This spread moves the first-order SHG QPM period at 1550 nm by 13 nm (18.989 vs 18.976 um) [derived: zelmon1997, jundt1997].
- **Composition and doping** dominate all other uncertainties for n_e (0.012 between CLN and SLN at 633 nm). Every index served by the site names its variant (CLN, SLN, MgO5, MgO1-SLN) [R06 pitfall 8].
- **Primary-data caveats.** weis1985 Table 2 misprints n_o at 472.7 nm as 3.3597 (2.3597 from neighbouring rows) [R14 row 35]; any machine ingestion needs that fix. Zelmon and Jundt primaries are not held; their coefficients are P-db and S [R14 sec. 5].

---

## 2.2 The Pockels effect

### L1 Phenomenon

A static or microwave field E changes the optical impermeability 1/n^2 of a non-centrosymmetric crystal linearly. With field and optical polarization both along c, the extraordinary index shifts by

    Delta n_e = -(1/2) n_e^3 r33 E_z,      Delta phi = (2 pi / lambda) Delta n_e L.     (2.4)

A positive r33 E_z lowers n_e. At 1550 nm, n_e = 2.1376 [derived: zelmon1997], r33 = 30.8 pm/V (clamped, 633 nm) [turner1966 P-comp via weis1985], E = 1 V/um: |Delta n_e| = 1.504e-4 [derived; recomputed live on the page]. A pi phase shift needs E L = lambda/(n_e^3 r33) = 5.15 kV for a uniform field that fills the mode [derived].

**Device: li2026aa.** 9 mm x-cut TFLN Mach-Zehnder modulator (MZM) on silicon, plain ground-signal-ground (G-S-G) coplanar line, one arm in each gap so the arms see opposite fields (push-pull). Measured V_pi = 2.90 V at 1550 nm, V_pi L = 2.61 V cm [li2026aa reported]. Transmission at zero bias phase: T = cos^2(pi V / (2 V_pi)).

{{FIG F2-04}}

r33 is held at its 633 nm clamped value: no electro-optic coefficient at 1550 nm exists in any source held [R14 sec. 2.5].

### L2 The r tensor

Index ellipsoid and its first-order perturbation [yariv1984; weis1985]; contracted index I: 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy; j runs over field components:

    sum_ij (1/n^2)_ij x_i x_j = 1,   Delta(1/n^2)_I = sum_j r_Ij E_j,   delta n_k = -(1/2) n_k^3 Delta(1/n^2)_kk.   (2.5)

The last relation holds for polarization along a principal axis k; off-diagonal terms (I = 4, 5, 6) rotate the principal axes instead. Point group 3m, x perpendicular to a mirror plane, z along c: four independent coefficients.

    r = [[  0,  -r22, r13],
         [  0,   r22, r13],
         [  0,    0,  r33],
         [  0,   r51,  0 ],
         [ r51,   0,   0 ],
         [-r22,   0,   0 ]]                                            (2.6)

{{FIG F2-03}} (state: field on; matrix explorer + ellipsoid)

Coefficients (pm/V, 633 nm unless noted):

| Set | Condition | r13 | r22 | r33 | r51 | Status |
|---|---|---|---|---|---|---|
| Turner 1966 | clamped (S) | 8.6 | 3.4 | 30.8 | 28 | [turner1966 P-comp via weis1985] |
| Kaminow et al. 1980 | clamped (S), fringing-field corrected; preferred by weis1985 | 7.7 | 3.4 | 28.8 | 18.2 | [kaminow1980 P-comp via weis1985] |
| Zook et al. 1967 | free (T) | 10.0 | 6.81 | 32.2 | - | [zook1967 P-comp via weis1985] |
| Lenzo 1966 | free (T) | - | 6.7 | - | - | [lenzo1966 P-comp via weis1985] |
| Bernal 1966 | free (T) | - | - | - | 32 | [bernal1966 P-comp via weis1985] |

Clamped (S): strain fixed, above the acoustic resonances. Free (T): includes the indirect contribution (converse piezoelectric strain times photoelastic coupling), r^T_ij = r^S_ij + p_ik d_jk [weis1985 P, eq. 13]. The indirect part matters most for r22 and r51; for r33 the two sets differ by 4.5%. Kaminow's r51 = 18.2 pm/V is 35% below the 28 pm/V used by most TFLN models [R14 row 50]. Free coefficients are composition-independent within +-5% [weis1985 P-comp, citing Turner, Nash, Bridenbaugh 1970]; r22 has a minimum near 48.9 mol% Li2O [volk2008 P-comp]. The L3 engine run uses the Turner set.

Device mapping:

| Cut | Propagation | Optical field | Static field | Coefficient | Index change |
|---|---|---|---|---|---|
| x-cut | y (in plane) | TE, lateral = z | in-plane, lateral = z | r33 | -(1/2) n_e^3 r33 E |
| z-cut | in plane | TM, vertical = z | vertical = z | r33 | -(1/2) n_e^3 r33 E |
| z-cut plate | z (along c) | any, in xy | in-plane, x or y | r22 | birefringence n_o^3 r22 E; axes at 45 deg for E_x, along x, y for E_y |
| li2026aa | y | TE | lateral, 6 um gap | r33 | L3 |

The z-cut plate row is the conoscope (F2-01): E perpendicular to c makes the uniaxial crystal biaxial.

**V_pi vs wavelength, same device** [li2026aa reported; 9 mm; DC, push-pull]:

| lambda (nm) | 1310 | 1450 | 1485 | 1550 | 1590 | 1653 | 1970 | 2000 |
|---|---|---|---|---|---|---|---|---|
| V_pi (V) | 2.13 | 2.66 | 2.75 | 2.90 | 3.04 | 3.21 | 4.33 | 4.38 |
| V_pi L (V cm) | 1.92 | 2.39 | 2.48 | 2.61 | 2.74 | 2.89 | 3.90 | 3.94 |

From 1310 to 2000 nm, V_pi (and V_pi L) grows by 2.06x (4.38/2.13). Wavelength and n_e^3 dispersion alone account for 1.57x (lambda ratio 1.527 times (n_e(1.31)/n_e(2.00))^3 = 1.028) [derived: zelmon1997]; the remaining factor 1.31 comes from the mode itself (overlap and n_eff both change as the mode spreads into oxide at longer wavelength) and from any dispersion of r33, which no held source quantifies.

### L3 Evaluating the overlap (real FEM)

Source: eo-modulator-atlas engine, full-vector optical solver, case `sims/li2026aa/config.yaml`, exported 2026-10-25 on a 0.03 um grid (241 x 81 nodes; x -3.6 to 3.6 um, y 1.5 to -0.9 um) [atlas-engine engine]. Geometry: LN slab y 0 to 0.12 um, rib trapezoid to y = 0.30 um with 3.5 um top width, Au electrodes from |x| = 3 um, 1 um thick; n_e = 2.138, n_o = 2.211 (engine library); Turner clamped r set.

First-order perturbation of a guided mode normalized to power P, with Delta eps = -eps Delta(eps^-1) eps:

    Delta beta = (omega eps0 / 4P) integral E* . Delta eps . E dA,   P = (1/2) integral Re(E x H*) . z dA.   (2.7)

x-cut TE, E approximately E_x along c: Delta eps_xx = -n_e^4 r33 E_x^RF, and H_y = n_eff E_x / Z0 gives P = (n_eff / 2 Z0) integral |E_x|^2 dA. With e_x the static field per terminal volt:

    dn_eff/dV = -(n_e^4 r33 / (2 n_eff)) integral_LN e_x |E_x|^2 dA / integral |E_x|^2 dA.   (2.8)

Conventional overlap with gap g and the push-pull half-wave product it implies (engine: V_pi L = lambda / (2 |dn_A - dn_B|)):

    Gamma = (g/V) integral_LN E_x^RF |E|^2 dA / integral |E|^2 dA,   Delta n = -(1/2) n_e^3 r33 Gamma V/g,
    V_pi L = lambda g / (2 n_e^3 r33 Gamma) = lambda / (2 n_e^3 r33 Ebar).            (2.9)

{{FIG F2-05}}

Engine results [atlas-engine engine]:

| Quantity | Value | Unit |
|---|---|---|
| dn_eff/dV, arm A / arm B | -1.4367e-5 / +1.4366e-5 | 1/V |
| balance B/A | -0.9999 | |
| Gamma (arm A) | 0.4771 | |
| Ebar (arm A) | 7.951e4 | V/m per V |
| gap | 6 | um |
| n_eff / n_g at 1550 nm | 1.7696 / 2.135 | |
| V_pi L engine / textbook (eq. 2.9 with n_e^3) | 2.697 / 3.238 | V cm |
| V_pi engine (9 mm) | 2.997 | V |
| measured V_pi L / V_pi | 2.61 / 2.90 [li2026aa reported] | V cm / V |
| surface integral by tensor entry: r33 / r13 / r51 / r22 | -1.43186e-5 / -4.515e-8 / -3.30e-9 / 0 (99.66% / 0.31% / 0.02% / 0) | 1/V |
| RF line (engine): n_RF, Z0, C', L' | 2.049, 43.5 ohm, 157.3 pF/m, 297.1 nH/m | |

Compare the paper's simulated n_g = 2.13 and design Z0 of about 42 ohm [li2026aa reported] with the engine's 2.135 and 43.5 ohm.

Grid checks [derived: atlas-engine export]: nodal sum of the exported integrand -1.4424e-5 /V, +0.40% vs the engine quadrature (the engine integrates on its own triangles; residual not isolated). Split by region: rib 61.4%, slab under the rib 38.3%, slab outside the rib 0.3%.

**Normalization.** The power-normalized form (eq. 2.8) carries n_e^4 / n_eff where the conventional form (eq. 2.9) carries n_e^3: a factor n_e/n_eff = 1.208 for this mode. The engine ratio textbook/engine is 1.20; the residual comes from the non-E_x vector components. TFLN modes have n_eff well below n_e because a large share of the power travels in oxide; the conventional formula then overestimates V_pi L by about 20% here (3.24 vs 2.70 vs measured 2.61 V cm).

Error sources, in order of size for this device: r33 at 1550 nm (633 nm clamped value used; no 1550 nm data); mechanical boundary condition (the engine uses the clamped set, while a low-frequency V_pi on a film bonded to a substrate sees an intermediate, unquantified clamping); waveguide position in the gap, cladding profile and sidewall reference inferred (atlas grade B); film thickness tolerance; interface-node assignment on the export grid (eo.js note). Low-frequency V_pi in TFLN can also be distorted by charge relaxation (chapter 04, DC drift).

---

## 2.3 Second-order nonlinear optics

### L1 Phenomenon

In LN the polarization contains a term quadratic in the optical field, so two photons can merge into one at the sum frequency (sum-frequency generation, SFG; second-harmonic generation, SHG, when both are equal) or split one photon into two (difference-frequency generation, DFG; parametric amplification). The largest coefficient, d33, couples fields all polarized along c, but dispersion makes 775 nm light slower than 1550 nm light in bulk CLN: the second harmonic slips out of phase after the coherence length L_c = pi/Delta k and converts back; L_c = 9.495 um [derived: zelmon1997]. Reversing the ferroelectric domain every L_c (period Lambda = 18.99 um, periodically poled LN, PPLN) restarts the growth on every domain, and the harmonic power grows as L^2 [derived: zelmon1997]. In a TFLN waveguide the same process runs in a guide etched from a sub-micrometre film, with a period near 4 um set by waveguide dispersion [wang2018optica reported]; measured normalized efficiencies reach thousands of percent per watt per square centimetre (table in L2).

{{FIG F2-08}}

### L2 Quantitative model

**d tensor.** Contracted notation, l: 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy. Point group 3m with Kleinman symmetry (d15 = d24 = d31) [kleinman1962; R06 sec. 2.7]:

    d = [[  0,    0,   0,   0,  d31, -d22],
         [-d22,  d22,  0,  d31,  0,    0 ],
         [ d31,  d31, d33,  0,   0,    0 ]]                                 (2.10)

    P_i(2 omega) = 2 eps0 sum_l d_il [E_x^2, E_y^2, E_z^2, 2E_yE_z, 2E_xE_z, 2E_xE_y]_l      (2.11)

(complex-amplitude convention of [boyd2008]; chi(2) = 2d).

{{FIG F2-06}}

Values (pm/V). No source held tabulates a post-1997 absolute d set; every value below is a legacy-scale compilation, a secondary table without per-cell references, or unverified.

| Source | Fundamental | d33 | d31 | d22 | Status |
|---|---|---|---|---|---|
| Volk & Wohlecke Table 1.2 (CLN), citing Nikogosyan 2005 | 1.06 um | 34 | 6 | 3 | [volk2008 P-comp], legacy scale |
| same, near-SLN | 1.06 um | 42 | 5 | 2.5 | [volk2008 P-comp], legacy scale |
| Zhu et al. review Table 1 (no per-cell reference) | 1064 nm | -27.0 | -4.3 | 2.10 | [zhu2021 S] |
| Shoji et al. 1997 (absolute scale) | 1.064 um | 25.2 (claimed) | about 4.6 (claimed) | - | [shoji1997 U] |
| Kitamoto et al. 1995 (parametric fluorescence) | 488 / 532 nm pump | - | 4.8 +- 0.5 / 4.3 +- 0.5 | - | [kitamoto1995 U] |

weis1985 has no SHG d table [R14 row 52a]. The legacy d33 = 34 pm/V is 35% above Shoji's claimed 25.2 pm/V; Shoji attributes the older values to multiple-reflection errors (abstract as recorded by R06, U). Any d value on the site states its fundamental wavelength and its scale (legacy or post-1997) [R06 pitfall 11]. Miller's rule scales chi(2) with the product of linear susceptibilities at the three frequencies [miller1964]; Shoji reports it holds poorly for LN (U).

Field mapping (from eq. 2.10, no assumption beyond the tensor form):

| Cut, mode | Fields | Active coefficient | Phase matching |
|---|---|---|---|
| x-cut, TE, propagation y | E along z at omega and 2 omega | d33 | QPM, type 0 (e + e -> e) |
| z-cut, TM | E mostly along z | d33 | QPM, type 0 |
| z-cut, TE, in-plane polarization at angle alpha from x | E in xy | TE SH: -2 eps0 d22 E^2 sin(3 alpha), largest for E along y (propagation x), zero for E along x (propagation y); TM SH via d31 | modal or QPM |
| bulk, type I (o + o -> e) | ordinary inputs, no z component | d31, d22 only | birefringent, angle-tuned |

Birefringent phase matching (BPM) never uses d33: ordinary inputs have no z component, so only the xx, yy, xy columns act.

**Phase matching.** Wave-vector mismatch with an m-th order grating of period Lambda:

    Delta k = k_3 - k_1 - k_2 - 2 pi m / Lambda.                                  (2.12)

- *BPM, type I SHG in bulk CLN at 21 C* [derived: zelmon1997]: at 1550 nm, theta_pm = 49.55 deg with SH walk-off 2.03 deg; at 2000 nm, 45.01 deg. At 1064 nm no angle exists: n_e(532) - n_o(1064) = +1.46e-3 > 0, so 1064 nm type-I SHG in CLN needs temperature tuning (noncritical phase matching) rather than an angle.
- *QPM.* Order m, duty cycle D: d_eff = (2/(m pi)) d33 sin(m pi D) (Fourier coefficient of the square-wave sign of d; form as in [fejer1992]), so (2/pi) d33 at D = 0.5, m = 1.

First-order QPM periods, bulk CLN, e + e -> e, 21 C [derived: zelmon1997]:

| Process | Lambda (um) |
|---|---|
| SHG 1064 -> 532 nm | 6.818 |
| SHG 1550 -> 775 nm (also degenerate OPO pumped at 775 nm) | 18.989 |
| SHG 2090 -> 1045 nm | 31.07 |
| OPO / DFG, pump 1064 nm, signal 1550 nm, idler 3393 nm | 29.91 |

Coherence lengths L_c = Lambda/2: 3.409 um (1064 nm SHG), 9.495 um (1550 nm SHG). TFLN waveguides shift the period to a few um because n_eff disperses differently from bulk n_e; x-cut films have been poled at 600 nm [zhao2020jap reported] and 747 nm periods [nagy2020 reported]. Early thin-film PPLN converters: [chang2016].

**Undepleted SHG.**

    P_2w = eta_norm P_w^2 L^2 sinc^2(Delta k L / 2),
    eta_norm = 8 pi^2 d_eff^2 / (eps0 c n_w^2 n_2w lambda_w^2 A_eff).                      (2.13)

Example: d33 = 25 pm/V [shoji1997 U], d_eff = 15.9 pm/V, A_eff = 1 um^2 [template], 1550 nm, bulk indices: eta_norm = 3.15e5 /(W m^2) = 3151 %/W/cm^2 [derived]. With d33 = 27 pm/V [zhu2021 S]: 3675 %/W/cm^2 [derived]. Depleted, at Delta k = 0: P_2w = P_0 tanh^2(sqrt(eta_norm P_0) L) [armstrong1962; R11 kernel C1].

Bulk focusing cannot reach the L^2 law: a Gaussian beam diffracts, the optimum is a confocal parameter b = L/2.84 [boydkleinman1968 reported], and P_2w then grows only linearly in L. Waveguides hold A_eff fixed over centimetres, hence the L^2 law and the 1/A_eff gain.

**Measured normalized efficiencies** (waveguides, %/W/cm^2; rings, %/W):

| Device | Value | Normalization | Source |
|---|---|---|---|
| LiNbO3 waveguide, field-poled at room temperature, first-order QPM, blue SHG (1993) | 600 %/W cm^2; 20.7 mW blue | waveguide | [yamada1993 reported] |
| TFLN PPLN, 1.5 um pump, 4 um period | 2600 %/W/cm^2 | waveguide | [wang2018optica reported] |
| TFLN, shallow etch, MgO, 5 mm | 3757 %/W/cm^2 (939 %/W) | waveguide | [zhao2020oe reported] |
| TFLN, actively monitored poling | 4600 %/W/cm^2 | waveguide | [rao2019 reported] |
| double-layer, polarization-reversed TFLN | 9600 %/W/cm^2 measured; >10,000 theory; 85% absolute at high power | waveguide | [li2024apn reported] |
| TFLN, blue SHG | 33,000 %/W/cm^2 | waveguide | [park2022 reported] |
| TFLN on sapphire, DFG to 3.66 um | up to 200 %/W/cm^2 | waveguide (DFG) | [mishra2021 reported] |
| TFLN, modal phase matching (no poling), 8 mm | 4.7 %/W | waveguide, %/W | [luo2018 reported] |
| z-cut PPLN microring | 250,000 %/W | ring | [lu2019 reported] |
| PPLN microring | 5,000,000 %/W; g/2pi about 1.2 MHz | ring | [lu2020 reported] |

**Acceptance bandwidths.** sinc^2(x/2) falls to one half at x = 2.783, so the full width at half maximum in any parameter q is delta q = 2 x 2.783 / (L |d Delta k / dq|) = 5.566 / (L |d Delta k / dq|) [derived; form as in fejer1992]. Bulk CLN, first-order QPM, L = 1 cm [derived: zelmon1997, jundt1997]:

| SHG pump | Wavelength FWHM x L (Zelmon, 21 C) | Temperature FWHM x L (Jundt, 25 C, no thermal expansion) | QPM tuning d lambda/dT (Jundt, 25 C) |
|---|---|---|---|
| 1064 nm | 0.205 nm cm | 3.21 K cm | - |
| 1550 nm | 1.18 nm cm | 10.1 K cm | 0.115 nm/K |

Group-velocity mismatch, bulk, e-polarized 1550/775 nm: Delta n_g = 0.0905, 302 fs/mm [derived: zelmon1997]. Comparison with a TFLN device: Zhao et al. report a 1 nm linewidth for 5 mm and 0.1 nm/C tuning [zhao2020oe reported]; the bulk numbers scaled to 5 mm give 2.35 nm and 0.115 nm/K. The temperature acceptance shifts with the reference temperature (10.1 K cm at 24.5 C, 10.3 K cm at 21 C for 1550 nm SHG) [derived: jundt1997]. Waveguide dispersion is what lets nanophotonic PPLN cancel group-velocity mismatch and run femtosecond SHG with < 100 fJ [jankowski2020 reported].

{{FIG F2-07}}

### L3 Normalizations, conventions, measurement

**Why the efficiency numbers do not compare directly.**

| Normalization | Definition | Valid when | Breaks when |
|---|---|---|---|
| %/W/cm^2 (eta_norm) | P_2w / (P_w^2 L^2), low-power slope, phase matched | uniform QPM, no loss, undepleted; on-chip powers | nonuniform film or poling (effective length < L, so eta_norm falls with L); loss; quoted with fiber-coupled powers |
| %/W | P_2w / P_w^2 for one device | rings and resonators; also used for whole waveguides | compares devices of different length or Q; ring value scales with resonant build-up |
| absolute % | P_2w / P_w at a stated pump | high-power, depleted regime | says nothing about low-power efficiency |
| pulse energy (fJ, pJ) | energy at which a stated conversion or gain is reached | femtosecond, dispersion-engineered devices | not convertible to CW numbers without the pulse shape |

Ring build-up, from coupled-mode theory (CMT) with H/hbar = g (a^2 b^dagger + h.c.), energy decay rates kappa_a (FH), kappa_b (SH), external rates kappa_a,ex, kappa_b,ex, zero detuning: P_b / P_a^2 = 64 g^2 kappa_a,ex^2 kappa_b,ex omega_b / (hbar omega_a^2 kappa_a^4 kappa_b^2), which at critical coupling (kappa_ex = kappa/2) and omega_b = 2 omega_a is 16 g^2 / (hbar omega_a kappa_a^2 kappa_b) [derived]. A ring's %/W therefore scales as Q^3 at fixed g; published definitions of g differ by numerical factors, so g values from different papers are compared only after converting to one Hamiltonian.

eta_norm also scales as 1/(lambda^2 A_eff) at fixed d_eff (eq. 2.13); A_eff itself scales roughly with lambda^2 in a geometrically scaled guide, and d_eff disperses (Miller). Blue SHG at 33,000 %/W/cm^2 [park2022 reported] and 1550 nm SHG at 2600 to 9600 %/W/cm^2 are therefore not ranked by one number.

**Overlap.** For dominant field components normalized to unit power, 1/A_eff = |integral_chi2 E_2w* E_w^2 dA|^2 / ((integral |E_w|^2 dA)^2 integral |E_2w|^2 dA), the numerator integrated where d is nonzero (LN, with sign flips in poled regions). Some authors fold n_eff into this definition; the page states the definition next to every computed A_eff.

**Coupled-mode equations** [armstrong1962; boyd2008], |A|^2 = power, fields written as A exp(i(omega t - k z)) (the complex conjugate of the convention in boyd2008, so phases of A carry the opposite sign): dA_w/dz = -i kappa A_2w A_w* exp(-i Delta k z), dA_2w/dz = -i kappa A_w^2 exp(+i Delta k z), kappa^2 = eta_norm. These conserve P_w + P_2w (Manley-Rowe) and reproduce eq. 2.13 and the tanh^2 law (R11 kernel C1 matches the analytic value 0.81929336).

**Error sources in measured eta_norm.** Facet-loss calibration at two wavelengths (the SH often exits multimode); poling duty-cycle errors and missing domains (d_eff falls as sin(pi D)) [fejer1992]; film-thickness variation that moves the phase-matching wavelength along the device, which adapted poling compensates [chen2024nn reported]; photorefraction and green-induced infrared absorption at high SH power (chapter 04). The d scale itself carries the largest systematic uncertainty: 25 vs 34 pm/V changes eta_norm by 1.85x.

Reviews: TFLN platform [zhu2021]; LN photonics from UV to microwave [boes2023]; LNOI phase-matching schemes (BPM, modal, QPM) and tuning effects [you2024]; SHG in LNOI [R08 sec. 1, review 40].

---

## 2.4 Parametric amplification and OPOs

### L1 Phenomenon

A strong pump at omega_p amplifies a weak signal at omega_s and creates an idler at omega_i = omega_p - omega_s. Put the gain inside a cavity and the device oscillates once gain beats loss: an optical parametric oscillator (OPO), tunable by period, temperature or pump frequency. Giordmaine and Miller demonstrated tunable parametric oscillation in LiNbO3 in 1965 [giordmaine1965]. On chip, TFLN rings oscillate at about 30 uW of pump [lu2021 reported], microdisks with Q above 1e8 at 19.6 uW [gao2021 reported], and dispersion-engineered PPLN waveguides amplify by 118 dB/cm [jankowski2022 reported].

{{FIG F2-10}}

### L2 Quantitative model

**Phase-sensitive gain (degenerate, Delta k = 0).** From the coupled equations of 2.3 L3 with a fixed pump of power P_p, the in-phase quadrature grows as exp(Gamma z) with

    Gamma = sqrt(eta_norm P_p),     G_dB / L = 20 log10(e) Gamma = 8.686 sqrt(eta_norm P_p).      (2.14)

Example: eta_norm = 2600 %/W/cm^2 [wang2018optica reported] gives 14.0, 44.3, 140 dB/cm at P_p = 0.1, 1, 10 W peak [derived; P_p template]. Non-degenerate with mismatch: G = 1 + (Gamma^2/g^2) sinh^2(g L), g^2 = Gamma^2 - (Delta k/2)^2 [R11 S4; boyd2008].

Reported gain: > 50 dB/cm phase-sensitive in a 6 mm waveguide, > 100 dB/cm over 600 nm near 2 um [ledezma2022 reported]; 71 dB (118 dB/cm) unsaturated over 1700 to 2700 nm with 4 pJ pump pulses, 88 dB (> 146 dB/cm) saturated [jankowski2022 reported].

**OPO threshold, resonator.** CMT, H/hbar = g (a_p^dagger a_s a_i + h.c.), energy decay rates kappa_p, kappa_s, kappa_i, pump input coupling kappa_p,ex, all detunings zero:

    |a_p|^2_th = kappa_s kappa_i / (4 g^2),     P_th = hbar omega_p kappa_p^2 kappa_s kappa_i / (16 g^2 kappa_p,ex).     (2.15)

Above threshold the intracavity pump clamps; the summed signal and idler output is P_s+i = P_th (4 kappa_s,ex kappa_p,ex / (kappa_s kappa_p)) (sqrt(P/P_th) - 1) for kappa_s = kappa_i, omega_s = omega_i = omega_p/2. Conversion P_s+i / P peaks at P = 4 P_th, reaching 100% only for fully overcoupled modes [derived]. Threshold scales as Q^-3 when all three modes are resonant (triply resonant), Q^-2 for signal and idler resonant with a single-pass pump (doubly resonant, DRO) [derived from eq. 2.15]; a singly resonant OPO (SRO) resonates one wave only: higher threshold, but no requirement that signal and idler both sit on resonances (TFLN example: [hwang2023]).

| Device | Threshold or output | Source |
|---|---|---|
| TFLN PPLN ring, telecom | about 30 uW; 11% pump-to-signal+idler at 93 uW | [lu2021 reported] |
| TFLN circuit, SHG + OPO | tens of uW; > 1 THz tuning by changing pump frequency by hundreds of MHz | [mckenna2022 reported] |
| microdisk, Q > 1e8 | 19.6 uW | [gao2021 reported] |
| dispersion-engineered PPLN, 100 ns pulses near 1 um | tuning 1.53 to 3.25 um, tens of mW | [ledezma2023 reported] |
| femtosecond OPO combs | 1.5 to 3.3 um, femtojoule thresholds, up-converted to 620 nm | [roy2023 reported] |
| SRO, TFLN on sapphire | 1.5 to 3.3 um; > 25 mW at 3.2 um, 15% | [hwang2023 reported] |
| electrically tuned mid-IR OPO | 22 THz, 2.7 to 3.4 um | [hwang2026 reported] |
| frequency-modulated OPO comb | > 93% internal pump-to-comb, about 200 modes | [stokowski2024 reported] |

**Tuning.** Bulk PPLN OPOs [myers1995]. Bulk CLN, pump 1064 nm, Lambda = 29.91 um phase-matches signal 1550 nm and idler 3393 nm [derived: zelmon1997]; F2-07 draws the full signal/idler curve vs period and temperature.

### L3 Conventions and error sources

- Eq. 2.15 uses energy decay rates and a non-degenerate Hamiltonian; for degenerate operation with H/hbar = (g/2)(a_p^dagger a_s^2 + h.c.) the threshold changes by a factor set by that 1/2. Convert any published g before comparing thresholds.
- Threshold is quoted as on-chip pump power in the bus waveguide; fiber-coupled thresholds include facet loss.
- In a doubly or triply resonant OPO, signal and idler must both sit on resonances; with unequal FSRs the oscillation hops between clusters of mode pairs as the pump tunes; this is one way a pump change of hundreds of MHz can move the emission by > 1 THz [mckenna2022 reported; mechanism as interpreted here].
- Photorefraction shifts resonances with power (blue shift; chapter 04) and competes with thermal red shift during threshold sweeps; cladding removal mitigates it in TFLN rings [xu2021 reported].
- Review: integrated PPLN OPOs, CW vs femtosecond pumping, sub-um poling for mirrorless OPOs [wang2026apr].

---

## 2.5 Third-order effects

### L1 Phenomenon

The index also rises with intensity, n = n_0 + n2 I (the optical Kerr effect). For LN, n2 = 9.33e-20 m^2/W at 1064 nm (Z-scan, 30 ps, e-polarized) [desalvo1996 P-db via rii2024]; the widely tabulated 1.8e-19 m^2/W [zhu2021 S] is 1.9 times that, with no traced primary. In a high-Q ring, four-wave mixing builds a Kerr frequency comb, and in the right detuning range a dissipative soliton: TFLN rings have produced self-starting solitons [he2019], combs spanning 4/5 of an octave at 335 GHz spacing with stimulated Raman scattering suppressed [gong2020 reported], full-octave solitons with near-unity device yield [song2024 reported], and a photorefraction-stabilized soliton running > 13 h without feedback [wan2024 reported]; one chip has generated a Kerr comb, selected a line with an electro-optic filter and modulated it [wang2019nc reported]. A phase-mismatched chi(2) process imitates a Kerr effect whose size and sign the designer chooses: cascaded chi(2).

{{FIG F2-11}}

### L2 Quantitative model

**Kerr.** gamma = 2 pi n2 / (lambda A_eff): at 1550 nm with A_eff = 1 um^2 [template], gamma_Kerr = 0.378 /(W m) using n2 = 9.33e-20 m^2/W (measured at 1064 nm; dispersion of n2 to 1550 nm not sourced) [derived].

**Cascaded chi(2).** For |Delta k| L >> 1 the coupled equations of 2.3 L3 give a fundamental-wave phase

    Delta phi_NL = -eta_norm P L / Delta k,   gamma_casc = -eta_norm / Delta k,   Delta k = k_2w - 2 k_w - 2 pi/Lambda.   (2.16)

Delta phi_NL carries the sign of a Kerr phase gamma P L (positive = index increase); with the field convention of 2.3 L3, arg(A_w) = -Delta phi_NL. [derived; checked by fourth-order Runge-Kutta (RK4) integration of the coupled equations: arg(A_w) = +4.1378e-3 rad numeric, i.e. Delta phi_NL = -4.1378e-3 rad, vs -4.1380e-3 rad from eq. 2.16 at eta_norm = 2.6e5 /(W m^2), P = 0.1 W, L = 1 cm, Delta k = 2 pi/(100 um)]. Sign: the fundamental couples to a second harmonic detuned above it (Delta k > 0) and is pushed down, a negative (self-defocusing) nonlinearity; Delta k < 0 gives self-focusing [principle: desalvo1992; sign derived from the level-repulsion picture]. With these numbers |gamma_casc| = 4.1 /(W m), 11 times gamma_Kerr above, while on average along z only 1.3e-5 of the power sits in the harmonic (|A_2w|^2/P = 4 eta_norm P sin^2(Delta k z/2)/Delta k^2, peak 2.6e-5) [derived: eq. 2.16 inputs, desalvo1996]. In nanophotonic PPLN, strong phase mismatch broadens both harmonics with 2 pJ pulses [jankowski2020 reported].

**Lugiato-Lefever equation (LLE)** [lugiato1987; chembo2013; coen2013], normalized:

    d psi/dt = -(1 + i zeta) psi + i |psi|^2 psi + i (d2/2) d^2 psi / d theta^2 + f,           (2.17)

zeta = 2 (omega_0 - omega_p)/kappa (detuning), f = normalized pump, d2 = normalized second-order dispersion (anomalous: d2 > 0 here). Solitons exist on the red-detuned side above the bistability threshold; scanning the laser from blue to red crosses chaotic modulation instability into discrete soliton steps (standard picture; [herr2014]; review [kippenberg2018]).

{{FIG F2-12}}

### L3 Conventions and error sources

- n2 from Z-scan depends on pulse duration (slow thermal and electrostrictive contributions grow with duration), wavelength (two-photon absorption raises n2 toward the band edge: 8.25e-19 m^2/W at 532 nm [desalvo1996 P-db via rii2024]) and polarization. No 1550 nm LN n2 measurement is held.
- An n2 measured in a non-centrosymmetric crystal can include a cascaded chi(2) contribution from residual phase mismatch; whether the tabulated LN values were corrected for it is not stated in the sources held (open question).
- LN is strongly Raman-active: soliton combs must place no cavity mode under the Raman gain peak or control the dissipation spectrum there [gong2020; song2024]. Raman gain coefficients for TFLN are not sourced here.
- LN-specific dynamics: photorefraction produces a blue shift that counteracts the thermal red shift and extends the soliton existence range, giving spontaneous, deterministic single solitons [wan2024 reported]; self-starting LN solitons were first reported in [he2019]. The F2-12 simulator labels any photorefractive term `template`.
- LLE normalization: time in units of 2/kappa; field, pump and dispersion normalized as in [chembo2013]; the page prints the conversion from (Q, FSR, D2, gamma, P_in) to (zeta, f, d2) next to the plot.

---

## 2.6 EO combs and frequency shifters

### L1 Phenomenon

Drive a phase modulator inside a ring at exactly the ring's free spectral range (FSR) and every sideband lands on the next resonance; the sidebands cascade into a comb whose lines are spaced by the drive frequency. In a TFLN microring this produced more than 900 lines at about 10 GHz spacing [zhang2019 reported]; the same physics in a lithium niobate disk resonator inside a microwave cavity was reported in the same Nature issue [rueda2019; companion conference title doi:10.1364/nlo.2019.nm2a.5]. Two coupled rings form a photonic molecule with two supermodes split by the coupling; a microwave at that splitting moves light from one supermode to the other, shifting its frequency by up to 28 GHz at about 90% on-chip efficiency [hu2021 reported].

{{FIG F2-13}}

### L2 Quantitative model

**Resonant EO comb, steady state** (dispersion-free, drive Omega = 2 pi FSR, round-trip amplitude transmission r, peak round-trip phase modulation beta) [R11 S7b; intracavity-modulator comb generator: kourogi1993]:

    E(t) = t_c E_in / (1 - r exp(i beta cos(Omega t))).                                       (2.18)

Far from the pump the line power decays by 8.686 asinh(|ln r|/beta) dB per line (set by the complex-time singularity of eq. 2.18, r exp(i beta cos t) = 1); for high finesse F = pi sqrt(r)/(1 - r) this is 27.29/(beta F) dB per line, an amplitude envelope exp(-pi |k|/(beta F)) [derived; numerical Fourier analysis of eq. 2.18 at r = 0.99, beta = 0.1: 0.871 dB/line vs 0.8715 exact asymptotic, 0.873 high-finesse form]. Doubling the drive voltage halves the slope; doubling the finesse does the same. Published definitions of beta differ (per pass or per round trip); the page uses the round-trip peak phase and prints the conversion.

Dispersion limits the span: line k is detuned from its resonance by the accumulated dispersion, and the cascade stops where that detuning exceeds the modulation coupling (design treatment: [buscaino2020]).

| Generator | Result | Source |
|---|---|---|
| TFLN microring, resonant | > 900 lines, about 10 GHz | [zhang2019 reported] |
| coupled-ring generator | 30% efficiency, 132 nm span | [hu2022 reported] |
| non-resonant, 4 passes through one modulator | 47 lines at 25 GHz with 28 dBm (0.63 W) RF; 15x lower RF power than a single pass | [zhangk2023 reported] |
| EO time lens | 520 fs pulses at 30 GHz | [yu2022 reported] |
| thin-film lithium tantalate (TFLT), triply resonant | > 450 nm, > 2000 lines | [zhangj2025 reported] (LT, not LN) |

**Frequency shifter, coupled-mode.** Two rings, coupling mu, supermodes split by 2 mu. A push-pull microwave at Omega = 2 mu couples the supermodes at rate G proportional to drive voltage. Steady state, zero detuning, input into supermode a, output from supermode b:

    |s_b,out / s_in|^2 = kappa_a,ex kappa_b,ex G^2 / (kappa_a kappa_b / 4 + G^2)^2,                (2.19)

which reaches 1 at G = kappa/2 when kappa_ex = kappa (no intrinsic loss) [derived]. Reported: shifts up to 28 GHz at about 90% on-chip, cascaded to 119.2 GHz with a 29.8 GHz drive [hu2021 reported; arXiv v1 stated about 99%].

{{FIG F2-14}}

### L3 Conventions and error sources

- beta = pi V_p / V_pi,rt with V_pi,rt the voltage for a pi round-trip phase; whether a paper quotes single-pass or round-trip modulation index, peak or rms voltage, must be read from its methods.
- Line counts depend on the optical spectrum analyzer's dynamic range and the threshold used (e.g. 60 dB below the pump); F2-13 prints the threshold with the count.
- Microwave loss and velocity mismatch on the ring electrode reduce beta at high drive frequency; the closed form assumes a lumped, uniform phase per round trip.
- EO combs need no phase matching and no anomalous dispersion; their span is set by beta F and dispersion, their spacing by an electronic oscillator, which makes them locked by construction (contrast with Kerr solitons, 2.5).

---

## 2.7 Waveguides in TFLN

### L1 Phenomenon

Thin-film LN on insulator (LNOI, TFLN) is a crystalline film, 300 to 900 nm thick in one supplier's range [nanoln V], bonded on a silica layer; partial etching leaves a rib on a thinner slab (li2026aa: 300 nm film, 120 nm slab, 3.5 um rib [li2026aa reported]). The mode is confined to a cross-section of order the wavelength squared, the index contrast to the silica cladding allows tight bends, and electrodes sit micrometres from the guide (6 um gap in li2026aa [li2026aa reported]). Measured propagation loss: 0.27 dB/cm on 4- and 6-inch wafers patterned by deep-UV lithography [luke2020 reported]; 1.3 dB/m in dry-etched rings (intrinsic Q 29 million) [zhu2024 reported] and Q above 1e8 in chemo-mechanically polished rings [gao2022 reported]; the material limit of annealed ion-sliced film is estimated at 0.2 dB/m (Q 1.6e8) [shamsansari2022 reported].

{{FIG F2-15}}

### L2 Quantitative model

**Geometry.** Film thickness t, etch depth e (slab t - e), top width w, sidewall angle; cladding air or oxide. li2026aa: t = 300 nm, e = 180 nm, slab 120 nm, w = 3.5 um, sidewall 60 deg (reference direction not stated), 2 um PECVD SiO2 cladding [li2026aa reported]; engine n_eff = 1.7696, n_g = 2.135 at 1550 nm [atlas-engine engine].

**x-cut vs z-cut.**

| | x-cut, propagation along y | z-cut |
|---|---|---|
| TE index | n_e (2.1376 at 1550 nm) | n_o (2.2111), same in every in-plane direction |
| TM index | n_o | n_e |
| EO, in-plane electrodes | TE uses r33 | TE uses r22; TM with vertical field uses r33 |
| chi(2) | TE type 0 uses d33 | TM uses d33 |
| rings | TE index varies around the ring | TE isotropic in plane |
| poling | coplanar in-plane electrodes, field nonuniform with depth | vertical field through the stack |

(indices [derived: zelmon1997]; coefficient mapping from eqs. 2.6 and 2.10.)

**Anisotropy around a ring (x-cut, bulk approximation).** For TE propagating at angle phi from crystal z within the film plane, the in-plane polarization sees 1/n(phi)^2 = cos^2(phi)/n_o^2 + sin^2(phi)/n_e^2, varying between n_e (propagation along y) and n_o (propagation along z): 2.1376 to 2.2111 at 1550 nm [derived: zelmon1997; bulk approximation, mode confinement ignored]. Consequences: the local phase velocity, the QPM condition and the r33 projection all vary twice per round trip.

**Mode hybridization.** Where a TE and a TM mode of the same waveguide would cross in n_eff, any broken symmetry (slanted sidewalls, a slab on one side, an off-axis crystal orientation) couples them into hybrid modes with an anticrossing: in TFLN ridges this affects even the fundamental modes [pan2019]; in x-cut strip waveguides the hybrid regions depend on dimensions, sidewall angle and wavelength, and tapers through them convert TM0 to higher-order TE (99.5%, numerical) [kaushalram2020 reported]; in x-cut microrings the rotating birefringence converts TE to TM and creates avoided mode crossings that suppress one four-wave-mixing sideband [tan2024 reported]; arrayed-waveguide gratings need anisotropy-aware layouts [wangc2024].

**Loss and Q.**

    alpha = 2 pi n_g / (Q_i lambda),     alpha_dB = 4.343 alpha.                               (2.20)

At 1550 nm with n_g = 2.3 [template]: Q_i = 1e7 -> 4.05 dB/m; 2.9e7 -> 1.40 dB/m; 1.6e8 -> 0.253 dB/m [derived]. Published conversions use each device's own n_g (e.g. 1.3 dB/m for Q_i 29 million [zhu2024 reported]).

| Platform | Loss or Q | Source |
|---|---|---|
| dry-etched TFLN ring (2017) | Q about 1e7; 2.7 dB/m | [zhang2017 reported] |
| wafer-scale DUV lithography | 0.27 dB/cm | [luke2020 reported] |
| dry-etched ring, highest found | Q_i 29e6; 1.3 dB/m | [zhu2024 reported] |
| CMP microring | Q > 1e8 | [gao2022 reported] |
| microdisk | Q > 1e8 | [gao2021 reported] |
| visible (637 nm) | 6 dB/m; Q_i 11e6 | [desiatov2019 reported] |
| material limit, annealed ion-sliced film | Q 1.6e8; 0.2 dB/m | [shamsansari2022 reported] |
| bulk CLN absorption, 390 to 3800 nm | < 1e-4 to 2 /cm (1e-4 /cm = 0.043 dB/m) | [leidinger2015 reported; conversion derived] |

### L3 Mechanisms, computation, measurement

**Loss mechanisms.**
- Sidewall and top-surface roughness scattering, set by lithography and Ar+ milling (redeposition: chapter 05).
- Material absorption: transition-metal impurities give up to 0.04 /cm in as-grown crystals, H-related bands about 0.001 /cm at 2300 to 2800 nm; annealing lowers absorption up to 10x [schwesyg2011 P]. Ion-slicing damage: post-fabrication annealing raises the material-limited Q [shamsansari2022].
- Cladding absorption in the mid-IR: silica absorbs beyond 2.5 um, which motivates LN on sapphire [mishra2021 reported].
- Bend radiation and substrate leakage (slab modes, thin buried oxide).
- Metal absorption where electrodes approach the mode; li2026aa attributes its 2.8 dB on-chip loss to splitters, propagation and electrode absorption [li2026aa reported].
- Photorefractive and charge effects at high power (chapter 04); removing the dielectric cladding mitigates photorefraction in rings [xu2021 reported].

**Computing modes.** Full-vector finite-element method (FEM) with the anisotropic permittivity rotated into the lab frame (x lateral, y vertical, z propagation; x-cut with propagation along crystal y puts crystal z along lab x) [atlas-engine]. A scalar or effective-index solver is wrong for high-contrast anisotropic ribs, and a naive scalar finite-difference solver was also slower than the atlas FEM in browser benchmarks [R11 sec. 0]. F2-15 uses a precomputed lattice (film thickness, etch fraction, width, sidewall angle, wavelength, cut/polarization) from the same engine, interpolated, with held-out live solves reporting the interpolation error [R11 S5].

**Measuring loss.** Ring transmission fits give loaded Q and, with the coupling regime identified (under- vs overcoupled), intrinsic Q; conversion to dB/m needs n_g from the measured FSR (FSR = lambda^2/(n_g L_rt)). Cut-back measurements separate propagation from facet loss but need many lengths for sub-dB/cm accuracy.

**Errors.** Bulk Zelmon indices at 21 C stand in for film indices; ion-sliced and annealed films may differ (composition, residual strain, Li out-diffusion: chapter 01, 05). Film-thickness nonuniformity across a wafer moves n_eff and therefore QPM wavelength (2.3) and ring resonances.
