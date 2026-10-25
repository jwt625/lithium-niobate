# Chapter 03 Sound

| Field | Value |
|---|---|
| Chapter | 03 Sound: piezoelectricity, elastic and acoustic waves, SAW and IDT, acousto-optics, GHz phononics and piezo-optomechanics |
| Lane | C03 (DevLog-004) |
| Date | 2026-10-25 |
| Files | `manuscript.md` (this), `figures.md` (F3.1-F3.11), `refs.yaml`, `glossary.yaml`, `open-questions.md` |
| Default data set | kushibiki1999 (c^E, e, eps^S, eps^T, rho, bulk velocities; SAW-grade congruent LN; status P per R06 re-check) |
| Frame | IEEE Std 176-1987: Z parallel to c with +Z such that d33 > 0; X along an a axis, perpendicular to a mirror plane; Y in the mirror plane with +Y such that d22 > 0; right-handed (ieee176 Table 5, Sec. 3.2.5; status P). In this frame c14 > 0 and e22 > 0 (kushibiki1999; weis1985 Table 6; R14 rows 67, 78-81) |
| Voigt order | 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy; engineering shear strain S4 = 2 S23 (ieee176 Table 2, Eq. 25) |

Status codes (DevLog-004 rule 3): P (primary read at the locator), P-comp (read in a compilation that names the original), P-db, S (secondary), V (vendor), U (unverified; never shown as fact), reported (number stated by the device paper), derived (computed here from listed inputs; method stated), template (illustrative, holds no data).

"derived (calc)" below (refs id c03-calc) means: computed in this lane on 2026-10-25 with a scratch script from the kushibiki1999 constants (tensor algebra; Christoffel 3x3 eigenproblem with piezoelectric stiffening per ieee176 Eq. 47; partial-wave SAW solver with 8 roots per trial velocity, traction-free and either open (vacuum) or shorted electrical boundary, complex velocity for leaky waves). Integration note (not page copy): PHY reproduces every derived value within the tolerances in `figures.md` before a figure ships.

---

## 3.0 Chapter door

L1 copy (door card, one line): A crystal that turns a voltage into a ripple and a ripple into a voltage; most SAW filters in phones ride on it or on its sibling LiTaO3.

- Door art (VISUAL): ukiyo-e ripple lines launched from IDT fingers (DevLog-003b sec. 5.4). Ripple pitch on the door is drawn to scale for a 128 deg Y-X SAW at 1 GHz (lambda = v/f = 3.98 um with v = 3978 m/s, derived (calc)); the hover popup gives f, lambda and the source.
- Door art (TECH): ASCII comb of 8 finger pairs with a row of `~` characters at the same pitch.

---

## 3.1 Piezoelectricity

### L1 (phenomenon)

Squeeze a lithium niobate crystal along certain directions and charge appears on its faces; apply a voltage and it changes shape. The effect needs a crystal without a center of symmetry; LN (point group 3m) qualifies. The response depends strongly on direction: pressing along the crystal Y axis gives a charge about 2.3 times larger than pressing along the polar Z axis (d22 = 20.3 vs d33 = 8.7 pC/N, derived (calc) from kushibiki1999). One volt across a free crystal moves its faces by about 20 pm along Y.

Interactive: F3.1 (longitudinal piezoelectric surface; press direction picker).

### L2 (quantitative model)

Constitutive equations, stress-charge form (ieee176 Eqs. 17-18, 23-24; P):

```
T_ij = c^E_ijkl S_kl - e_kij E_k          T_p = c^E_pq S_q - e_kp E_k
D_i  = e_ikl S_kl + eps^S_ik E_k           D_i = e_iq S_q + eps^S_ik E_k
```

IEEE 176 states that this pair (independent variables S, E) is the only form that yields the field equations of the unbounded continuum; the other three forms are exact but used where boundaries make some variables approximately zero (ieee176 Sec. 2.6; P). The four forms (ieee176 Eqs. 37-42; P):

| Form | Independent | Equations | Coefficient |
|---|---|---|---|
| stress-charge (e) | S, E | T = c^E S - e^t E; D = e S + eps^S E | e (C/m^2) |
| strain-charge (d) | T, E | S = s^E T + d^t E; D = d T + eps^T E | d (C/N = m/V) |
| strain-voltage (g) | T, D | S = s^D T + g^t D; E = -g T + beta^T D | g (V m/N = m^2/C) |
| stress-voltage (h) | S, D | T = c^D S - h^t D; E = -h S + beta^S D | h (V/m = N/C) |

Relations (ieee176 Eq. 43; P), compressed notation:

```
c^E s^E = 1          beta^S eps^S = 1
c^D = c^E + e^t h    eps^T = eps^S + d e^t
e = d c^E            g = beta^T d
c^D s^D = 1          beta^T eps^T = 1
s^D = s^E - d^t g    beta^T = beta^S - g h^t
d = eps^T g          h = g c^D
```

Tensor form for 3m in the IEEE frame (ieee176 Table 8 class 3m; weis1985 Eq. 8; R06 sec. 2.10; P):

```
e = [[ 0,    0,    0,   0,   e15, -e22],
     [-e22,  e22,  0,   e15, 0,    0  ],
     [ e31,  e31,  e33, 0,   0,    0  ]]
d: same pattern, except d16 = -2 d22 (factor 2 from the strain convention)
```

LN values (CLN, SAW grade):

| Quantity | Value | Unit | Source | Status |
|---|---|---|---|---|
| e15, e22, e31, e33 | 3.655 +- 0.022, 2.407 +- 0.015, 0.328 +- 0.032, 1.894 +- 0.054 | C/m^2 | kushibiki1999 Table V | P |
| e15, e22, e31, e33 (resonant ultrasound spectroscopy, 30 C) | 3.65 +- 0.03, 2.39 +- 0.03, 0.31 +- 0.04, 1.72 +- 0.18 | C/m^2 | ogi2002 | P |
| eps11^T/eps0, eps33^T/eps0 | 83.3 +- 0.8, 28.5 +- 0.3 | - | kushibiki1999 Table IV | P |
| eps11^S/eps0, eps33^S/eps0 | 44.9 +- 0.4, 26.7 +- 0.3 | - | kushibiki1999 Table V | P |
| eps^T recomputed from eps^S + d e^t | 83.34, 28.48 | - | kushibiki1999 set | derived (calc); matches measured eps^T to < 0.1% |
| d15, d22, d31, d33 | 66.4, 20.3, -1.04, 8.69 (d16 = -40.6) | pC/N | d = e s^E, kushibiki1999 set | derived (calc); R06 sec. 2.10 gives the same |
| d15, d22, d31, d33 (Smith and Welsh 1971) | 69.2, 20.8, -0.85, 6.0 | pC/N | weis1985 Table 3 | P-comp |
| d15, d22, d31, d33 (Warner et al. 1967) | 68, 21, -1.0, 6 | pC/N | weis1985 Table 3 | P-comp |
| d33 (Yamada et al. 1967) | 16 | pC/N | weis1985 Table 3 | P-comp |
| Hydrostatic d_h = 2 d31 + d33, measured | 6.31 +- 0.014 | pC/N | graham1976 via weis1985 p. 198 | P-comp |
| d_h from the kushibiki1999 set | 6.62 | pC/N | derived (calc) | derived; +4.9% vs measured |
| g15, g22, g33 | 0.0900, 0.0275, 0.0345 | V m/N | g = beta^T d | derived (calc) |
| h15, h22, h33 | 9.19, 6.06, 8.01 | 10^9 V/m | h = beta^S e | derived (calc) |
| c33^D, c44^D | 249.35, 93.45 | GPa | c^D = c^E + e^t h | derived (calc) |

d33 is the least certain coefficient: tabulated values span 6 to 16 pC/N, and the measured hydrostatic coefficient d_h = 6.31 pC/N implies d33 of about 8.0 to 8.4 pC/N given d31 of -0.85 to -1.04 pC/N, which rules out 12.5 to 16 (R14 rows 60-60a; derived from P-comp inputs).

Longitudinal response along a unit vector n (polar angle theta from +Z, azimuth phi from +X):

```
d_L(n) = d_ijk n_i n_j n_k = d33 cos^3(theta) + (d31 + d15) cos(theta) sin^2(theta) - d22 sin^3(theta) sin(3 phi)
```

(derived from the 3m d tensor; d_L(+Y) = +d22, d_L(+Z) = +d33). The sin(3 phi) term is the threefold axis made visible: in the XY plane the response alternates sign every 60 deg. F3.1 plots this surface.

Coupling factors. IEEE 176 defines quasistatic material coupling factors from energy ratios, e.g. k33^2 = d33^2/(s33^E eps33^T) = (s33^E - s33^D)/s33^E, and thickness-mode factors k_t = e33/(c33^D eps33^S)^(1/2), k15 = e15/(c55^D eps11^S)^(1/2) (ieee176 Eqs. 124-125, Table 10; P). For the kushibiki1999 set:

| Factor | Value | Status |
|---|---|---|
| k_t (thickness extensional, Z-cut plate) | 0.247 (k_t^2 = 0.061) | derived (calc) |
| k15 (thickness shear) | 0.600 (k15^2 = 0.360) | derived (calc) |
| k33 (rod along Z) | 0.243 | derived (calc) |
| k31 | -0.027 | derived (calc) |
| longitudinal factor along Y, d22/(s22^E eps22^T)^(1/2) | 0.309 | derived (calc) |

For a Y-cut plate IEEE 176 shows that no single thickness coupling factor exists for class 3m, because two stiffened waves couple at the electrodes (ieee176 Sec. 4.3, Eqs. 64-65; P).

### L3 (computation, conventions, error sources)

- Convention of 2s (ieee176 Eqs. 22, 25, 44-45; P). Compressing symmetric index pairs into Voigt indices puts factors on some quantities and not others:

| Quantity | Voigt rule | Factor |
|---|---|---|
| stress T_p, stiffness c_pq, piezo e_ip, photoelastic p_pq (strain-optic), EO r_pk | T_p = T_ij; c_pq = c_ijkl; e_ip = e_ikl | none |
| strain S_p | S_p = S_ij for p = 1..3; S_p = 2 S_ij for p = 4..6 | 2 on shear |
| compliance s_pq | s_ijkl; 2 s_ijkl if one of p, q in 4..6; 4 s_ijkl if both | 1, 2, 4 |
| piezo d_iq (and g_iq) | d_ikl for q = 1..3; 2 d_ikl for q = 4..6 | 2 on shear |
| piezo-optic pi_pq (stress-optic) | as s | 1, 2, 4 (hence pi66 = 2(pi11 - pi12) in Nye's convention; textbook, not source-checked; R06 pitfall 6) |

Consequences that are easy to check numerically: c66 = (c11 - c12)/2 but s66 = 2(s11 - s12); e16 = -e22 but d16 = -2 d22; c56 = c14 but s56 = 2 s14; p66 = (p11 - p12)/2 (weis1985 Eqs. 16-17, 19; P). Software that stores tensors in Voigt form must state the convention; the data endpoints of this chapter carry full-rank tensors generated by code (R06 sec. 3, pitfall 6).

- Sign frame. +Z is the end that becomes negative on compression (equivalently, positive on cooling); IEEE 1987, IRE 1949 (via weis1985 pp. 192-193) and IRE 1958 (via volk2008 p. 2) give the same +Z and +Y for LN (R14 rows 76-79; P / P-comp). IEEE 176 states a 180 deg rotation about Z between its 1987 and 1949 axes for quartz (class 32) only (ieee176 Sec. 3.2.5.1; P). A 180 deg rotation about Z flips c14, s14, e22, d22, p14, p41 and r22 together; once d22 > 0 is imposed, no sign freedom remains, and c14 > 0 follows (R14 row 81, derived). Flipping +Z (180 deg about X) flips every odd-rank tensor (e, d, r, chi(2), pyroelectric p3) but not c or p (R06 pitfall 3).

- Clamped vs free. eps^T (free, below mechanical resonances) vs eps^S (clamped, above them) differ by almost 2x for eps11 (83.3 vs 44.9), because d15 and e15 are large. The same mechanism makes r^T - r^S = p d large for r22 and r51 (weis1985 Eq. 13; R14 row 51c); see chapter 02.

- Isothermal vs adiabatic. IEEE 176 makes no notational distinction; adiabatic constants apply under rapidly varying conditions (ieee176 p. 7, text after Eq. 21; P).

- Data spread. eps33^S spans 23.7 to 29 and eps11^T 83.3 to 85.2 across compiled sets (R14 sec. 2.7, P-comp). Values from different sets are shown as a spread, not blended.

- Measurement. kushibiki1999 obtained c^E, e and eps^S by fitting bulk-wave velocities measured on X-, Y- and Z-cut plates together with eps^T and density (kushibiki1999 abstract; Table II velocities, Tables IV-V constants; P). ogi2002 used resonant ultrasound spectroscopy at 30 C (P).

---

## 3.2 Elastic constants and bulk waves

### L1

Sound in LN travels at 3.5 to 7.4 km/s depending on direction and polarization (3474 to 7357 m/s over all directions, derived (calc)): 7.33 km/s for a compression wave along the polar axis, 3.59 km/s for a shear wave along the same axis (kushibiki1999 Table II; P). Because the crystal is piezoelectric, an acoustic wave carries an electric field with it, and that field makes the crystal stiffer for that wave: the compression wave along Z is 3.2% faster than it would be in a non-piezoelectric crystal with the same elastic constants (7328.6 vs 7102.1 m/s, derived (calc)).

Interactive: F3.3 (slowness surfaces with a stiffening toggle).

### L2

Elastic stiffness at constant E, 3m form (weis1985 Eq. 17; R06 sec. 2.9; P): c22 = c11, c23 = c13, c24 = -c14, c55 = c44, c56 = c14, c66 = (c11 - c12)/2; six independent constants.

| Source | c11 | c12 | c13 | c14 | c33 | c44 | c66 | Status |
|---|---|---|---|---|---|---|---|---|
| kushibiki1999 (GPa) | 198.86 +- 0.03 | 54.67 +- 0.04 | 67.99 +- 0.55 | 7.83 +- 0.02 | 234.18 +- 0.75 | 59.85 +- 0.01 | 72.09 +- 0.02 | P |
| ogi2002 (GPa, 30 C) | 199.5 +- 0.2 | 55.27 +- 0.13 | 67.67 +- 0.26 | 8.7 +- 0.2 | 235.2 +- 0.4 | 59.48 +- 0.04 | 72.10 +- 0.01 | P |
| Smith and Welsh 1971 (GPa) | 203.0 | 57.3 | 75.2 | 8.5 | 242.4 | 59.5 | - | P-comp (weis1985 Table 6) |
| Warner et al. 1967 (GPa) | 203 | 53 | 75 | 9 | 245 | 60 | - | P-comp (weis1985 Table 6) |
| Density (kg/m^3) | 4642.8 +- 0.2 (kushibiki1999 Table IV, P); 4636 (ogi2002, P); 4647 CLN, 4635 near-SLN (volk2008 Table 1.1, P-comp) | | | | | | | |

Temperature coefficients of c^E (Smith and Welsh): c11 -1.74, c12 -2.52, c13 -1.59, c14 -2.14, c33 -1.53, c44 -2.04 x 10^-4 /K (weis1985 Table 6; P-comp).

Christoffel equation with piezoelectric stiffening (ieee176 Eqs. 46-50; P). For a plane wave with unit wave normal n:

```
Gamma_jk = c^E_ijkl n_i n_l + (e_mij n_m n_i)(e_nkl n_n n_l) / (eps^S_rs n_r n_s)
det(Gamma_jk - rho v^2 delta_jk) = 0   -> three velocities, orthogonal polarizations
```

The second term is the stiffening: the wave's longitudinal electric field (quasistatic, curl-free) adds stiffness proportional to the square of the effective piezoelectric constant.

Bulk velocities, computed from the kushibiki1999 constants vs measured (kushibiki1999 Table II; P):

| Direction | Mode | Measured (m/s) | Computed, stiffened (m/s) | Computed, unstiffened (m/s) |
|---|---|---|---|---|
| Z | longitudinal | 7328.20 +- 0.32 | 7328.55 | 7102.07 |
| Z | shear (degenerate) | 3590.41 +- 0.23 | 3590.39 | 3590.39 |
| X | longitudinal | 6544.53 +- 0.30 | 6544.61 | 6544.61 |
| X | fast shear (resonance method) | 4750.67 +- 0.59 | 4750.09 | - |
| Y | quasi-longitudinal | 6806.55 +- 0.26 | 6806.82 | - |
| Y | shear, polarized along X | 3940.49 +- 0.21 | 3940.60 | 3940.60 |

Computed columns: derived (calc). The agreement (< 0.6 m/s) is a consistency check, not an independent test, since kushibiki1999 fitted its constants to these velocities. Along X the remaining shear branch is 4028.96 m/s (computed). Along Y the X-polarized shear is purely elastic (unstiffened) and the other two waves are stiffened and couple longitudinal and transverse motion, as ieee176 Eq. 53 states for class 3m (P).

### L3

- Solver: Gamma is real symmetric; Jacobi or closed-form 3x3 eigen per direction. Group velocity and power-flow angle from the gradient of the slowness surface (algorithm reference jaeken2016; paper not yet read, S via R11).
- Rotation: rotate full-rank tensors (c_ijkl, e_ijk, eps_ij) with a_ip; the Bond 6x6 matrices (bond1943) are equivalent and convenient for Voigt storage. IEEE 176 warns that compressed notation hides transformation properties; transform with tensor indices (ieee176 p. 8, after Table 2; P).
- Unstiffened vs stiffened: setting e = 0 gives the "unstiffened" velocities; stiffening vanishes for directions where e_mij n_m n_i = 0.
- c66 consistency: kushibiki1999 lists c66 = 72.09 while (c11 - c12)/2 = 72.095; computations enforce the symmetry relation (derived).
- Composition: elastic and photoelastic properties change little with MgO doping (andrushchak2009 abstract via R06; S). The dependence of SAW velocity on Li2O content is not quantified here (open-questions Q12).

---

## 3.3 Surface and guided waves

### L1

A sound wave can also cling to a surface, like a ripple on water, with its energy within about one wavelength of the top. On LN such a surface acoustic wave (SAW) travels at about 3.4 to 4.0 km/s, 75,000 to 88,000 times slower than light, so a 1 GHz signal becomes a ripple only 4 um long that a pair of comb-shaped electrodes can launch and catch. Some crystal cuts carry a faster surface wave that leaks a little energy into the bulk as it travels; on the right cut that leak is tiny.

Interactive: F3.5 (SAW anatomy: particle orbit and depth profile, Rayleigh on 128 deg Y-X vs leaky shear wave on 64 deg Y-X).

### L2

- Rayleigh wave: traction-free surface wave on an elastic half-space, displacement in the sagittal plane, decaying with depth (rayleigh1885; definition, bibliographic check only). On a piezoelectric substrate the partial waves also carry an electric potential that extends into the vacuum; the wave is slower when the surface is shorted by a thin metal film.
- Partial-wave method (campbell1968): fields ~ exp[i k (x1 + alpha x3 - v t)]; for each trial v the extended 4x4 Christoffel system (u1, u2, u3, phi) gives an 8th-order polynomial in alpha; keep the 4 roots that decay into the substrate (or radiate away from the surface, for leaky waves); the SAW velocity is the root of the 4x4 boundary determinant (three traction components plus D3 continuity with the vacuum, or phi = 0 for a shorted surface).
- Coupling: k^2 approx 2 (v_free - v_met)/v_free (ingebrigtsen1969 as cited in R11 S10; S).
- Leaky SAW (pseudo-SAW): a predominantly shear-horizontal surface wave faster than the slow shear bulk wave; it radiates into the bulk and its velocity is complex (yamanouchi1972 treats leaky surface waves in LN; title only). The computed losses below quantify the radiation for 41 and 64 deg Y-X.
- Guided waves in thin films (the TFLN regime):
  - Love-type and index-guided waves: a film whose shear velocity is lower than the substrate's guides acoustic waves without suspension. LN on sapphire uses this "phononic analogue of index guiding" (p09 abstract; reported).
  - Plate (Lamb and shear-horizontal) modes in suspended films: SH0, S0 (symmetric), A0, and thickness-shear overtones such as A1. A 400 nm ZY-LN platelet excited by lateral fields (XBAR) resonates near 4.8 GHz with coupling about 25% and Q about 300 (plessky2019 via R08 sec. 2.10; reported). Estimate: the bulk shear velocity along Z, 3590 m/s, over twice the thickness gives 3590/(2 x 400 nm) = 4.5 GHz (derived; ignores stiffening and electrode loading).
  - Wavelength-scale mechanical waveguides (1 um wide) on suspended TFLN and on LN on sapphire; section 3.7.

SAW properties of standard cuts, computed from kushibiki1999 (derived (calc); open = free surface, shorted = metallized):

| Cut (IEEE notation) | Wave | v_free (m/s) | v_met (m/s) | k^2 = 2 dv/v | Vendor check (V, Fomos) |
|---|---|---|---|---|---|
| Y-Z | Rayleigh | 3486.4 | 3412.7 | 4.23% | 3488 m/s; "5.04%" |
| (YXl) 128 deg, "128 deg Y-X" | Rayleigh | 3978.4 | 3870.7 | 5.41% | 3980 m/s; "5.7%" |
| X-Z | Rayleigh | 3482.3 | 3405.9 | 4.39% | - |
| X-Y | Rayleigh | 3696.4 | 3640.0 | 3.05% | - |
| Z-X | Rayleigh | 3785.6 | 3777.4 | 0.43% | - |
| (YXl) 64 deg | leaky SAW | 4691.4 | 4448.2 | 10.37% | 4690 m/s; "10%" |
| (YXl) 41 deg | leaky SAW | 4749.3, isolated root 0.77 m/s below the fast-shear threshold (see note) | 4376.2 | 15.71% | 4750 m/s; "17%" |
| (YXl) 36 deg (LN) | leaky SAW | 4749.4, isolated root just below the fast-shear threshold | 4347.6 | 16.92% | - |

Fomos values from the vendor knowledge base (fomos-ln; V); the page does not define its coupling coefficient, so its "%" is not compared numerically.

Note on 36-41 deg: the free-surface leaky root sits 0.7-0.8 m/s below the fast-shear bulk velocity along X (4750.1 m/s for kushibiki1999); the same near-threshold position occurs for ogi2002 (4721.3 vs 4722.1) and Warner (4784.7 vs 4785.5) (derived (calc)). The complex-velocity solver (src/lib/physics/saw.ts, 2026-10-25) resolves it as an isolated complex root (41 deg: 4749.31 - 0.017i m/s), not a threshold artefact, so the k^2 values for these angles stand as computed (status derived). The shorted-surface velocities are isolated roots too. The vendor 4750 m/s for 41 deg agrees with this root to 1 m/s.

Propagation loss of the leaky waves (derived (calc), imaginary part of the complex root; approximate): 64 deg Y-X 0.051 dB per wavelength free, 0.0033 dB per wavelength shorted; 41 deg Y-X 2.0e-4 dB per wavelength free, 0.016 dB per wavelength shorted, so on the free surface the 41 deg leaky wave is almost a true surface wave until the surface is metallized.

### L3

- Constant-set sensitivity (derived (calc), same solver):

| Cut | kushibiki1999 | ogi2002 c, e, rho (4636) with kushibiki1999 eps^S (blended sensitivity case; ogi2002 reports no eps^S) | Warner 1967 c (P-comp), e (S), eps^S 44.3/27.9 (weis1985 Table 1, P-comp), rho 4700 assumed (the value weis1985 uses in its AO figures; Warner's own density not read) |
|---|---|---|---|
| Y-Z v_free, k^2 | 3486.4, 4.23% | 3485.2, 4.41% | 3489.8, 4.91% |
| 128 deg Y-X | 3978.4, 5.41% | 3974.2, 5.41% | 3991.9, 5.27% |
| 41 deg Y-X LSAW (v_free: isolated root just below the fast-shear threshold) | 4749.3, 15.71% | 4721.3, 15.57% | 4784.7, 16.99% |
| 64 deg Y-X LSAW | 4691.4, 10.37% | 4666.8, 10.31% | 4736.6, 11.03% |

The older Warner set gives about 17% and 11% for 41 and 64 deg; the kushibiki1999 and ogi2002 sets give 15.6-15.7% and 10.3-10.4%. A k^2 quoted for a cut is meaningful only with its constant set named.

- Root selection. Below the limiting velocity (1/max s1 on the sagittal-plane slowness curves, which can lie below the slowest bulk velocity along x1 for rotated cuts) all 8 roots are complex; keep Im(alpha) < 0 (substrate at x3 < 0). For leaky waves keep the real roots whose time-averaged Poynting component points into the substrate, then continue the selection to complex velocity. Nondimensionalize (c by 10^11 Pa, potential by sqrt(c0/eps_ref)) or the 8x8 generalized eigenproblem is ill-conditioned and the Y-Z root is lost in numerical noise.
- Spurious minima: the determinant has false minima at bulk thresholds (e.g. 3590.4 m/s on Y-Z, 4750.1 m/s on X-propagating cuts); exclude a 1 m/s window around each bulk velocity along x1.
- k^2 definitions differ: 2 dv/v (Ingebrigtsen) vs electrode-admittance or effective-permittivity definitions; vendor sheets often do not state theirs (open-questions Q3).
- Temperature coefficient of frequency (TCF): vendor values -95 (Y-Z), -72 (128 deg Y-X), -70 (64 and 41 deg Y-X) ppm/K (fomos-ln; V). A computed TCF needs temperature coefficients of c, e, eps and thermal expansion as one consistent set; Smith and Welsh 1971 has c and s coefficients (weis1985 Tables 5-6; P-comp); thermal expansion alpha_c is disputed (4.1 vs 7.5 ppm/K, R14 row 24).

---

## 3.4 Cuts and coupling

### L1

Rotate the cutting plane of an LN boule and the surface wave changes speed and strength. At a cut rotated about 128 deg from the Y axis, the ordinary surface wave is close to its strongest coupling (5.4%) and the competing fast wave carries almost none (derived (calc)); 128 deg rotated Y wafers are the LN SAW product of crystal suppliers (smm-ln-lt; P). Near 41 and 64 deg the fast, leaky wave dominates instead, with two to three times the coupling.

Interactive: F3.4 (cut-angle explorer, k^2 and velocity vs rotation angle).

### L2

- Cut notation (ieee176 Sec. 3.6; P): a singly rotated plate (YXl) theta starts as a Y-cut plate with length along X and is rotated by theta about its length (X). "128 deg Y-X" = (YXl) 128 deg, wave propagating along X. Plate normal Y' = Y cos(theta) + Z sin(theta).
- Rotated Y-X sweep from kushibiki1999 (derived (calc)):

| theta (deg) | Rayleigh v_free | Rayleigh k^2 | LSAW v_free | LSAW k^2 |
|---|---|---|---|---|
| 0 | 3717.7 | 1.42% | 4642.3 | 21.05% |
| 20 | 3662.9 | 0.61% | 4732.0 | 20.48% |
| 40 | 3640.5 | 0.23% | 4749.4 | 15.95% |
| 60 | 3667.2 | 0.06% | 4711.7 | 11.32% |
| 70 | 3699.7 | 0.00% | 4653.4 | 9.00% |
| 90 (Z-cut) | 3785.6 | 0.43% | 4480.3 | 5.52% |
| 110 | 3891.7 | 2.42% | 4214.9 | 3.43% |
| 128 | 3978.4 | 5.41% | no leaky root resolved | - |
| 129 | 3977.5 | 5.42% (maximum of the 1 deg sweep, 122-136 deg) | - | - |
| 150 | 3859.7 | 3.30% | 4305.3 | 12.79% |
| 170 | 3756.6 | 2.00% | 4569.6 | 19.49% |

Observation from these numbers: the Rayleigh coupling peaks at 128-129 deg, where the leaky wave's coupling has fallen to 1.3% at 120 deg and no leaky root is resolved at 130 deg; the Rayleigh coupling falls to about zero near 60-70 deg, where the leaky wave carries 9-11%. One cut gives a clean Rayleigh filter; the other a clean, strongly coupled leaky-wave filter. Shibayama et al. 1976 reported an optimum rotated Y cut for SAW filters, recorded in R07 as about 128 deg (shibayama1976 via R07; S; criterion not read).
- Cuts in use: LN 128 deg rotated Y wafers (350 um at 4 in, 500 um at 6 in) and LT 36-50 deg rotated Y wafers, mainly for smartphone SAW filters and duplexers (smm-ln-lt, product page via R09 S3; P for the product list, V for performance claims).
- Thin-film LN cuts: X-cut and Z-cut films (and LN on sapphire) used for phononic circuits; the in-plane propagation angle matters in addition to the cut (sarabalis2020 abstract: piezoelectric and optomechanical coupling depend on crystal orientation; reported).

### L3

- The leaky-wave column needs the complex-velocity solver; points marked "no leaky root resolved" are where the leaky mode merges with the slow-shear threshold (4029 m/s along X) and the 4x4 determinant has no isolated minimum. Near 36-41 deg the free-surface root lies 0.7-0.8 m/s below the fast-shear threshold and is an isolated complex root (note in sec. 3.3); a minimum that stays at the edge of the 1 m/s exclusion window around a bulk velocity is reported as threshold-pinned, never as a root.
- Euler-angle semantics: COMSOL rotated systems use ZXZ Euler angles that rotate coordinates (R02 sec. 2.2). Convention in this chapter: rotation matrix rows = new axes in crystal coordinates; cut = (YXl) theta.

---

## 3.5 IDTs and SAW filters

### L1

An interdigital transducer (IDT) is a pair of interleaved metal combs on the crystal. A voltage across the combs strains the surface under every finger gap; the ripples add up only at the frequency whose wavelength equals the comb period, so the comb is both a launcher and a filter. Two combs facing each other make a delay line; resonators and ladders of them make many of the radio filters in phones, which carried more than 50 acoustic filters (SAW and BAW) per mid- and high-tier 4G phone in 2018, with more than 70 expected with 5G (vendor contribution in trade press, 2018; mwj-2018-filters; V).

Interactive: F3.6 (IDT designer: period, finger pairs, cut; response and wavelength drawn to scale).

### L2

- Invention: direct piezoelectric coupling to surface elastic waves (white1965; title only); R07 records this as the invention of the IDT (S); substrate of the first device not verified (R07). Elastic wave propagation in LN was reported the same year (spencer1965; title-level).
- Synchronous frequency f0 = v/p_IDT, with p_IDT the electrode period (one finger pair). On 128 deg Y-X (v_free = 3978 m/s, derived (calc)): p = 4 um gives f0 = 995 MHz; a 2 GHz filter needs p = 1.99 um, i.e. 0.50 um fingers at metallization ratio 0.5 (derived).
- Delta-function model (smith1969 equivalent-circuit lineage): an N-pair uniform IDT has a radiation conductance with a sinc^2 shape, G_a(f) proportional to N^2 [sin(X)/X]^2, X = N pi (f - f0)/f0, so the fractional bandwidth between first nulls is 2/N (shape: textbook result; the absolute prefactor in terms of k^2, the capacitance per pair and the aperture is not yet checked against smith1969: U).
- Measured TFLN example: an IDT on suspended TFLN with 1.9 mS peak conductance and 3.36 MHz bandwidth, matched to 50 ohm at 1.85 GHz (p05 arXiv v1; reported).
- LN vs LT in phones (R09 sec. 1.7):
  - SAW filters use rotated Y LT (36-50 deg) or 128 deg Y LN (smm-ln-lt; P, product page).
  - Shin-Etsu's piezo crystal page lists LT only; Sumitomo Metal Mining lists both (R09 S3, S4; P, product pages).
  - LT vs LN market share in SAW: no public quantitative source found (R09; N/A). From product pages, LT appears to dominate temperature-compensated and thin-film SAW and LN to serve wideband and XBAR (R09 inference; U).
  - Coupling: LN leaky waves reach 10-16% (64 and 41 deg tables in 3.3). LT values are not shown because LT constants are not yet entered (open-questions Q4).
- POI (piezoelectric-on-insulator) substrates: Soitec Connect POI, a thin LT or LN layer by Smart Cut on buried oxide on silicon: LT6-MHB, LT6-LB, LN6 at 150 mm; LT8-MHB, LT8-LB at 200 mm; for 5G, GNSS, Wi-Fi coexistence (soitec-poi; P, product page). In 2020 Soitec announced volume POI supply (300 nm to 1 um LT on oxide on high-resistivity Si) for Qualcomm RF filters (eenews-2020-soitec-qualcomm; S, trade press).
- XBAR on thin LN: first report 2019 (plessky2019; reported); Murata completed its acquisition of Resonant Inc. on 2022-03-28 (murata-2022; P) and announced XBAR mass production on 2025-07-08 (company release as recorded in R08 sec. 4, applications map; S; the release names "piezoelectric single-crystal thin film", not LN).

### L3

- The equivalent-circuit and coupling-of-modes models (smith1969; hashimoto2000) are the standard design tools. F3.6 uses only the normalized array factor and f0 = v/p; absolute admittance is template until the prefactor is source-checked (open-questions Q5).
- Second-order effects not modelled: electrode mass loading and reflection (velocity shift with metal thickness), bulk-wave radiation, diffraction for small apertures, and triple-transit echoes.
- Composition and growth are covered in chapter 01; SAW velocity vs Li2O content: open-questions Q12.

---

## 3.6 Acousto-optics

### L1

A sound wave in a crystal is a moving grating of compressed and stretched regions, and the refractive index follows the strain. Light crossing it is diffracted and shifted in frequency by exactly the sound frequency. In LN the same crystal can launch the sound piezoelectrically, so a modulator, frequency shifter or deflector needs no glued-on transducer.

Interactive: F3.7 (Bragg cell geometry and figures of merit), F3.8 (photoelastic tensor and the sign pitfall).

### L2

- Photoelastic (strain-optic) relation: Delta(1/n^2)_ij = p_ijkl S_kl (weis1985 Eq. 18; P). Nelson and Lax showed the independent variable is the displacement gradient, not only strain: rotations of volume elements contribute in birefringent crystals, so p_ijkl is not symmetric in kl for shear waves; in LN p44 = p55 has symmetric and antisymmetric parts, not resolved by the available data (weis1985 p. 200; nelsonlax1970, nelsonlax1971; P-comp).
- 3m form, eight independent coefficients p11, p12, p13, p14, p31, p33, p41, p44, with p22 = p11, p23 = p13, p24 = -p14, p32 = p31, p42 = -p41, p55 = p44, p56 = p41, p65 = p14, p66 = (p11 - p12)/2 (weis1985 Eq. 19; P). p_IJ is not a symmetric matrix (p14 differs from p41).

| Set | p11 | p12 | p13 | p14 | p31 | p33 | p41 | p44 | Status |
|---|---|---|---|---|---|---|---|---|---|
| Avakyants et al. 1976 ("Set B"), 633 nm | -0.026 | +0.090 | +0.133 | -0.075 | +0.179 | +0.071 | -0.151 | +0.146 | P-comp (weis1985 Table 7; R14 row 69) |
| Coquin (via Pinnow 1971) | -0.02 | +0.08 | +0.13 | -0.08 | +0.17 | +0.07 | -0.15 | +0.12 | P-comp (weis1985 Table 7) |
| Andrushchak et al. 2009, 633 nm | -0.021 +- 0.018 | 0.060 +- 0.019 | 0.172 +- 0.029 | -0.052 +- 0.007 | 0.141 +- 0.017 | 0.118 +- 0.020 | -0.109 +- 0.017 | 0.121 +- 0.019 | S (via sarabalis2020 Table I and mytsyk2021 Table 6) |
| Krupych et al. 2014 (via mys2015) | -0.023 | 0.076 | 0.147 | +0.057 | 0.157 | 0.141 | +0.051 | 0.126 | S |
| TFLN fit, LN on sapphire | - | - | - | - | - | 0.038 | -0.038 | 0.085 | S (sarabalis2020 fit via R06 sec. 2.11; three components only) |

- Indirect (piezo-electro-optic) contribution: strain makes a field through e, the field changes the index through r. It depends on the acoustic propagation direction and matters for p13 and p33: p13(primary) = p13(measured) - 0.043, p33(primary) = p33(measured) - 0.154 (weis1985 p. 201, ref. [53]; P-comp; propagation direction not stated, R14 N3). Applied to Set B this gives p33(primary) of about -0.08 (derived), so which p33 a model uses matters.
- Figures of merit (weis1985 Eq. 20; P): M1 = n^7 p^2/(rho v), M2 = n^6 p^2/(rho v^3), M3 = n^7 p^2/(rho v^2), M4 = n^8 p^2 v/rho. For a longitudinal wave along X with extraordinary light at 35 deg to y (n = 2.20, rho = 4.7 x 10^3 kg/m^3, v = 6.57 x 10^3 m/s): M1 = 6.65 x 10^-7 m^2 s/kg and M2 = 6.99 x 10^-15 s^3/kg (dixon1967 via weis1985 p. 201; P-comp), M4 = 62.9 m^4 s^-1 kg^-1 (chang1976 via weis1985; P-comp). weis1985 prints M3 = "1.01 x 10^-16 m s^2 kg"; the four definitions with the stated n, rho, v and the p implied by M2 (p = 0.287, derived) give M1 = 6.64 x 10^-7, M4 = 63.0 and M3 = 1.01 x 10^-10 m s^2/kg (derived), so the printed M3 exponent and unit are misprints; M3 is not shown as a value (U) until dixon1967 is read.
- Bragg condition (momentum conservation): sin(theta_B) = lambda0/(2 n Lambda), Lambda = v/f; the diffracted light is shifted by +-f. Example: lambda0 = 1550 nm, f = 1 GHz, X-longitudinal v = 6544.6 m/s gives Lambda = 6.54 um and theta_B = 6.8 deg in air (derived).
- Integrated acousto-optics on LN: collinear TE0-TE1 conversion by an SH0 wave at 440 MHz in a 1.25 um wide suspended X-cut waveguide, up to 18% conversion (p10; reported via R01); acousto-optic modulators in X-cut LN on sapphire (sarabalis2020; reported); AO modulator V_pi L of 0.03 V cm in TFLN with chalcogenide, unsuspended (wan2022 via R08 sec. 2.10; reported); a bulk-wafer longitudinal piezoelectric resonant photoelastic modulator (atalar2022; title-level).

### L3: sign and frame pitfalls

1. Pair signs only within one frame. The p14 and p41 signs flip with c14 (and e22, d22) under a 180 deg rotation about Z. Never combine p14, p41 from one paper with c14, e22 from another without checking the frame (R06 pitfall 2).
2. What is known: weis1985 lists Avakyants' p14, p41 < 0 next to Smith and Welsh's c14 > 0 in a paper that states the IRE frame, without saying it checked Avakyants' own frame; Krupych 2014 pairs c14 > 0 with p14, p41 > 0 (via mys2015); mytsyk2021 uses S14 > 0 (c14 < 0), a frame that is non-standard for LN if d22 > 0 is imposed (R14 rows 75, 81). The common TFLN pairing (kushibiki1999 c14 > 0 with Set B) therefore matches the weis1985 compilation but is not confirmed at the primary level (open-questions Q1).
3. What a mismatch does (derived (calc)): for a film with in-plane unit vector b (light polarization and dominant strain both along b), the longitudinal coefficient p'_bbbb = p_ijkl b_i b_j b_k b_l. On an X-cut film with b = (0, cos(phi), sin(phi)), phi measured from +Y toward +Z:

| Set | p'_bbbb at phi = 0, 45, 90, 135 deg | Maximum |
|---|---|---|
| Andrushchak 2009 as listed | -0.021, +0.304, +0.118, +0.143 | +0.304 at 44 deg |
| Andrushchak 2009 with p14, p41 sign-flipped | -0.021, +0.143, +0.118, +0.304 | +0.304 at 136 deg |
| Set B as listed | -0.026, +0.348, +0.071, +0.122 | +0.352 at 42 deg |
| Set B sign-flipped | -0.026, +0.122, +0.071, +0.348 | +0.352 at 138 deg |

On X-cut the flip mirrors the optimum orientation from about 45 deg to about 135 deg; the magnitude is unchanged. On Y-cut (b = (cos(phi), 0, sin(phi))) the flip changes nothing (Andrushchak: +0.2235 at 45 and 135 deg; maximum +0.2304 at 50.7 and 129.3 deg; Set B maximum +0.2380 at 48.3 and 131.7 deg). The Andrushchak values at 45/135 deg, 0.304 (X-cut) and 0.223 (Y-cut), equal the "p22'" values in the author's public 2018 note on photoelastic tensor rotation (outside5sigma.com/tutorial/rotation-of-photoelastic-tensor-and-piezoelectric/; R02 sec. 2.3), where the X-cut angle was relabelled from 45 to 135 deg. Inference, not verified: a p14/p41 sign or frame inconsistency produces exactly such a relabelling; a change of the theta = 0 reference, also recorded in those notes (R02 sec. 2.2), is an alternative explanation. Which orientation is right depends on the unresolved pairing in item 2.
4. Optical wavelength: the Avakyants and Andrushchak sets are at 633 nm (R06 sec. 2.11); the wavelengths of the Coquin and Krupych sets are not recorded here. TFLN devices at 1550 nm reuse 633 nm values (no 1550 nm set found).
5. Rotation (Nelson-Lax) term: for shear waves in a birefringent crystal it adds Delta eps terms proportional to (eps_ii - eps_jj) times the rotation; an estimate for one LN nanobeam geometry put it below 4% of the photoelastic coupling (author's public 2018 note, R02 A13; unreviewed, S). Optomechanical coupling calculations on TFLN include moving-boundary and photoelastic terms; the rotation term is usually omitted.

---

## 3.7 GHz phononics and piezo-optomechanics on thin-film LN

### L1

In thin-film LN, sound and light can be confined in the same wavelength-scale structure. At 2 GHz the acoustic wavelength in LN is about 2 um (3978 m/s / 2 GHz = 1.99 um, derived), comparable to the 0.70 um wavelength of 1550 nm light inside the crystal (1550 nm / n_o, n_o = 2.211 from zelmon1997 per R06 sec. 2.4, derived): a nanostructured beam can trap both and let a single phonon modulate the light. Because LN is also piezoelectric, electrodes on the same chip couple that phonon to a microwave circuit. The result is a chain microwave -> phonon -> photon, which is how superconducting quantum processors operating at GHz can be connected to optical fibers.

Interactive: F3.9 (signal chain), F3.10 (heralded microwave photon), F3.11 (nanobender).

### L2

Scales (derived): a 2 GHz phonon carries h f = 8.3 ueV; a 1550 nm photon carries 0.80 eV, about 10^5 times more. Thermal occupation n = 1/(exp(hf/k_B T) - 1) of a 2 GHz mode is about 3.1 x 10^3 at 300 K and 6.8 x 10^-5 at 10 mK.

Platforms and results (numbers as published; "reported"):

| Device (ref) | Platform | Key numbers | License for figure reuse |
|---|---|---|---|
| Piezo-optomechanical crystal (p03; Optica 2019) | Suspended thin-film LN photonic-crystal nanobeam with electrodes | g0/2pi approx 120 kHz; optomechanical cooperativity C > 1 with phonon lasing; microwave-to-mechanics quantum efficiency approx 10^-8; phononic bandgap observed by piezoelectric drive and optical readout (arXiv abstract) | Optica Open Access License (attribution, non-commercial; R01 sec. 4c): redraw |
| Bidirectional piezo-optomechanical transducer (p05; Nat. Commun. 2020) | All-LN suspended film: IDT, horn taper converting SH2 to L1, 1.3 um mechanical waveguide, optomechanical crystal; room temperature | f_m = 1.85 GHz; g0/2pi = 70 kHz (backaction) and 84 kHz (deduced from C0); loaded optical Q 1.6 x 10^5; IDT 1.9 mS peak conductance, 3.36 MHz bandwidth; acousto-optic V_pi = 0.02 V; efficiency 10^-5 at 3.3 uW red-detuned pump and 5.5% at 323 uW blue-detuned (highest stable value in the linear regime, internal gain approx 21 dB); fit C0 = 1.2 x 10^-5, eta_e = 4.24 x 10^-4, eta_m = 9.9 x 10^-4 (arXiv v1) | CC BY 4.0 (journal): figures reusable with attribution |
| Wavelength-scale waveguide transducer (p06; PR Applied 2020) | Suspended thin-film LN, 1 um waveguide | 1.7 GHz; -12 dB conversion, limited by material loss (arXiv abstract) | APS: redraw |
| Nanobenders (p07; Commun. Phys. 2020) | Piezoelectric bending beams in thin-film LN driving a sliced photonic-crystal cavity | Standard piezoelectric coefficients approx 0.01 nm/V vs tens of nm/V for nanobenders; bending displacement scales as (0.01 nm/V) R^2 U with aspect ratio R (Eq. 1); tuning approx 5 nm/V (0.6 THz/V) from a linear fit at |U| < 0.5 V, the full tuning curve being nonlinear; 1520-1560 nm (approx 400 linewidths) within 4 V (arXiv abstract and v1 text) | CC BY 4.0 |
| GHz phononic integrated circuits (p09; PR Applied 2021) | Thin-film LN on sapphire, no suspension (index guiding) | 50 ohm matched transducer; 1 um waveguides; delay lines, racetrack resonators, meanders; Q approx 50,000 at 4 K; phononic four-wave mixing (arXiv abstract) | APS: redraw |
| Optically heralded microwave photon addition (p17; Nat. Phys. 2023) | 290 nm X-cut MgO:LN transfer-printed on 220 nm SOI (Si optomechanical crystal + LN piezo), NbTiN microwave chip, < 10 mK | 5% continuous conversion efficiency (4.9 +- 0.5%); 15 Hz heralding rate; thermal noise < 2 microwave photons; f_m approx 3.6 GHz; g0/2pi approx 410 kHz (arXiv abstract; R01 sec. 4d from arXiv text) | arXiv version CC BY 4.0; source data zenodo7903643 (10.5281/zenodo.7903643), CC BY 4.0 |

Model used in F3.9 (p05 Eq. 4 and App. A; reported): at pump detuning Delta = +-omega_m,

```
eta_total = eta_oc eta_o eta_m 4C / (1 +- C)^2,   C = C0 n_c,   C0 = 4 g0^2 / (kappa gamma)
```

with eta_oc = 65.2 +- 0.4% (fiber-to-chip), eta_o = kappa_e/kappa = 66 +- 1%, and the upper sign for a red-detuned pump (beam-splitter interaction; ideal conversion at C = 1) and the lower sign for blue detuning (two-mode squeezing; gain diverges at C = 1, phonon lasing). Sign convention as in src/lib/physics/optomech.ts: red 4C/(1 + C)^2 (maximum 1 at C = 1), blue 4C/(1 - C)^2 (diverges at C = 1); the earlier "(1 -+ C)^2, upper sign red" form had the signs swapped.

Other groups (context): microwave-to-optical conversion with thin-film LN acoustic resonators (shao2019; room temperature, up to 4.5 GHz, R08); an integrated LN-on-Si microwave-to-optics interface reaching 0.9% at 1 uW (weaver2024; R08). Same lab, quantum acoustics: phonon-number resolution with a qubit coupled to LN phononic-crystal resonators (p04; arrangoiz2018), entangled mechanical resonators (wollack2022), loss channels of LN phononic-crystal resonators at mK (p11); a perspective on integrated phononics (safavinaeini2019).

### L3

- Optomechanical coupling g0 in LN combines photoelastic and moving-boundary terms; the photoelastic term depends on in-plane orientation through the rotated p tensor (section 3.6, item 3), with the optimum stated for X-cut in p03 (in-plane angle convention of that paper to be mapped to this chapter's convention; open-questions Q7).
- Transduction efficiency bookkeeping: total = optical coupling x optical external ratio x microwave-to-mechanics x internal optomechanical term; in p05 the microwave-to-mechanics factor (eta_m approx 0.1%) dominates the loss.
- Material limits named by the papers: optical absorption heating the mechanics at mK (p17: added thermal noise), two-level-system and other loss channels in LN phononic crystals at cryogenic temperature (p11), material loss limiting waveguide transduction (p06).
- Journal vs arXiv: numbers above are from arXiv versions (abstract or v1 text); journal versions may differ in the last digit (open-questions Q8).

---

## Cross-links

- Chapter 01 (crystal): point group 3m, +Z sense, congruent composition (SAW-grade CLN).
- Chapter 02 (light): clamped vs free EO coefficients, r^T - r^S = p d; index ellipsoid.
- Chapter 04 (quirks): pyroelectric charging of SAW wafers (cite there).
- Chapter 05 (making): thin-film transfer, LN on sapphire, POI by Smart Cut.
- Chapter 06/08 (devices, industry): RF filter market, Murata XBAR, Soitec POI.
- Chapter 07 (history): White and Voltmer 1965; Shibayama et al. 1976; Spencer, Lenzo, Nassau 1965.
