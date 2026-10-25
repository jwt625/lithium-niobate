# R06: LiNbO3 material properties - authoritative data and machine-readable API design

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R06 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Scope | (1) verified source register, (2) seed property table, (3) convention pitfalls, (4) AI-accessible data/API design |
| Method | Crossref and OpenAlex DOI lookups; primary PDFs where legally open (institutional repositories, arXiv); the CC0 refractiveindex.info database YAML; secondary sources and vendor sheets, labelled as such. Four parallel research subagents, with coordinator spot checks (marked "re-checked"). |
| Limits | The shared web-search budget for this session ran out. Optica (opg.optica.org) served an anti-bot page and Springer required a login, so no workaround was attempted. Weis & Gaylord 1985, Wong (EMIS), Jazbinsek & Zgonik 2002, Shoji 1997, Zelmon 1997, Jundt 1997, Gayer 2008, Andrushchak 2009 full text, Moretti 2005 and Leidinger 2015 full text were **not** read. Their numbers appear below only when quoted by an accessible page, and are labelled that way. |

## Status key (used in every table)

| Code | Meaning |
|---|---|
| P | Primary source seen: the paper table or a primary repository PDF. P(abs) = only the abstract seen (Crossref or OpenAlex). |
| P-db | CC0 transcription of a primary source (refractiveindex.info database YAML) |
| S | Secondary: a review, another paper quoting the primary, or Wikipedia. Original attribution given. |
| V | Vendor datasheet (usually untraceable to a specific measurement) |
| C | Computed in this note from listed P/S inputs, not a published number (script logic described inline) |
| U | Unverified: claimed value and claimed source listed; must not ship without a primary check |

Variant codes:
- CLN: congruent, about 48.4-48.5 mol% Li2O.
- SLN: stoichiometric or near-stoichiometric.
- MgO5: 5 mol% MgO:CLN.
- MgO1-SLN: 1 mol% MgO:SLN.
- TFLN: thin film on insulator or sapphire.

---

## 1. Source register (verified bibliographic data)

All DOIs were checked against `api.crossref.org/works/{doi}` on 2026-10-24. OA = open-access status per OpenAlex or the publisher.

### 1.1 Corrections to the commonly cited list (read first)

1. **Zelmon et al. 1997 has a new erratum, published 2026-10-22.** JOSA B 43(11), 2788, DOI 10.1364/JOSAB.616304, Optica OA license. Crossref abstract, re-checked: "The headings for the ordinary and extraordinary index for 5 mol.% doped lithium niobate are switched." refractiveindex.info had already swapped the MgO5 rows and flagged them. Any code copied verbatim from the 1997 Table 2 has MgO5 no and ne swapped.
2. **Gayer et al. 2008 has an erratum**: Appl. Phys. B 94, 367 (2009), DOI 10.1007/s00340-008-3316-8, free to read. Its content was not seen (login wall). See the dn/dT anomaly in Section 2.4.
3. **Smith, Riccius, Edwin 1976 has errata**: Opt. Commun. 20, 188 (1977), DOI 10.1016/0030-4018(77)90191-2. The Jundt 1997 abstract misprints the original as "17, 322 (1996)"; the correct citation is 17, 332 (1976).
4. **"Abrahams 1966 parts I-V" is wrong.** Parts 1-2 of the J. Phys. Chem. Solids 27 series "Ferroelectric lithium niobate" are by Nassau, Levinstein and Loiacono (growth, domains). Abrahams et al. wrote parts 3-5. Part 5 is polycrystal X-ray at 24-1200 C, not single-crystal.
5. **Both Boysen & Altorfer 1994 and Hsu et al. 1997 exist** (neutron powder and synchrotron X-ray respectively).
6. **Sanna & Schmidt, PRB 81, 214116 (2010) is a surface study** (X-, Y- and Z-cut surfaces), not a bulk-structure reference. For bulk first-principles work use Inbar & Cohen, PRB 53, 1193 (1996).
7. **Andrushchak 2009 (106, 073510) and Moretti 2005 (98, 036101) use article numbers, not pages.** Moretti's title says 300-515 K, but the abstract says the measurements ran from 320 to 515 K.
8. **Gopalan et al. 1998 does not give absolute coercive fields.** Its abstract gives a 4-5x CLN/SLN ratio and a 2.5 kV/mm internal field. Kitamura et al., APL 73, 3073 (1998) is about LiTaO3.
9. **Wong (ed.), EMIS Datareview No. 28 (2002) has no DOI.** ISBN 978-0-85296-799-7; the 1st edition is EMIS No. 5 (1989), ISBN 0-85296-482-X, editor not found in the catalogues checked.
10. **Volk & Wohlecke**: DOI 10.1007/978-3-540-70766-0. Crossref gives the print year as 2009 (chapters dated 2008). The series volume 115 is not confirmed in Crossref.

### 1.2 Register

| ID | Citation | DOI | OA | Contents relevant here | Read? |
|---|---|---|---|---|---|
| weis1985 | R.S. Weis, T.K. Gaylord, Appl. Phys. A 37, 191-203 (1985) | 10.1007/BF00614817 | closed | Canonical tensor summary (eps, r, d, e, c, p), structure, hexagonal vs rhombohedral cells, axis convention | not read |
| wong2002 | K.K. Wong (ed.), Properties of Lithium Niobate, EMIS Datareviews 28, INSPEC/IEE (2002) | none | closed | Datareview compendium | not read |
| volk2008 | T. Volk, M. Wohlecke, Lithium Niobate: Defects, Photorefraction and Ferroelectric Switching, Springer (2008/2009) | 10.1007/978-3-540-70766-0 | closed | Defects, photorefraction, switching | not read |
| zelmon1997 | D.E. Zelmon, D.L. Small, D. Jundt, JOSA B 14, 3319 (1997) + erratum JOSA B 43, 2788 (2026) | 10.1364/JOSAB.14.003319; 10.1364/JOSAB.616304 | closed; erratum OA | Sellmeier for CLN and MgO5, no and ne, 0.4-5 um, 21 C | P-db, erratum P(abs) |
| jundt1997 | D.H. Jundt, Opt. Lett. 22, 1553 (1997) | 10.1364/OL.22.001553 | closed | T-dependent Sellmeier, ne only, CLN, room temperature to 250 C, 0.4-5 um | P(abs); coefficients S |
| gayer2008 | O. Gayer, Z. Sacks, E. Galun, A. Arie, Appl. Phys. B 91, 343 (2008) + erratum 94, 367 (2009) | 10.1007/s00340-008-2998-2; 10.1007/s00340-008-3316-8 | closed; erratum free | T-dependent Sellmeier, MgO5 and MgO1-SLN | P-db (24.5 C a-coefficients); b-coefficients S |
| smith1976 | D.S. Smith, H.D. Riccius, R.P. Edwin, Opt. Commun. 17, 332 (1976); errata 20, 188 (1977) | 10.1016/0030-4018(76)90273-X | closed | Index data | not read |
| schlarb1993 | U. Schlarb, K. Betzler, PRB 48, 15613 (1993) | 10.1103/PhysRevB.48.15613 | closed | Generalized Sellmeier: 400-1200 nm, 47-50 mol% Li2O, 50-600 K | P(abs) |
| kovacs1997 | L. Kovacs, G. Ruschhaupt, K. Polgar, G. Corradi, M. Wohlecke, APL 70, 2801 (1997) | 10.1063/1.119056 | closed | UV edge vs composition calibration; 0.1 mol% absolute, <0.01 mol% relative accuracy near SLN | P(abs) |
| kovacs1984 | L. Kovacs, Zs. Szalay, R. Capelletti, Solid State Commun. 52, 1029 (1984) | 10.1016/0038-1098(84)90503-9 | closed | OH band vs stoichiometry | not read |
| gopalan2007 | V. Gopalan, V. Dierolf, D.A. Scrymgeour, Annu. Rev. Mater. Res. 37, 449 (2007) | 10.1146/annurev.matsci.37.052506.084247 | closed | Defect-domain wall review | not read |
| gopalan1998 | V. Gopalan, T.E. Mitchell, Y. Furukawa, K. Kitamura, APL 72, 1981 (1998) | 10.1063/1.121491 | closed | Switching field ratio CLN/SLN, internal field, Ps | P(abs) |
| abrahams1966 | S.C. Abrahams et al., J. Phys. Chem. Solids 27: pt 3, 997; pt 4, 1013; pt 5, 1019 (1966) | 10.1016/0022-3697(66)90072-2; ...073-4; ...074-6 | closed | Structure: X-ray, neutron, high temperature | via COD CIF |
| abrahams1986 | S.C. Abrahams, P. Marsh, Acta Cryst. B 42, 61 (1986) | 10.1107/S0108768186098567 | closed | Defect structure vs composition | not read |
| boysen1994 | H. Boysen, F. Altorfer, Acta Cryst. B 50, 405 (1994) | 10.1107/S0108768193012820 | closed | Neutron powder diffraction to 1505 K; COD 2101175-2101185 | via COD |
| hsu1997 | R. Hsu, E.N. Maslen, D. du Boulay, N. Ishizawa, Acta Cryst. B 53, 420 (1997) | 10.1107/S010876819600777X | closed | Synchrotron structure; COD 2101845 | via COD |
| kushibiki1999 | J. Kushibiki, I. Takanaga, M. Arakawa, T. Sannomiya, IEEE TUFFC 46, 1315 (1999) | 10.1109/58.796136 | green (Tohoku repository) | Full c^E, e, eps^S, eps^T, density, bulk velocities, SAW-grade CLN | **P, re-checked** |
| kushibiki2002 | J. Kushibiki et al., J. Appl. Phys. 91, 6341 (2002) | 10.1063/1.1467608 | green | Composition dependence, 48.0-49.0 mol% Li2O | not read |
| ogi2002 | H. Ogi, Y. Kawasaki, M. Hirao, H. Ledbetter, J. Appl. Phys. 92, 2451 (2002) | 10.1063/1.1497702 | green (Osaka repository) | Resonant ultrasound spectroscopy (RUS) c^E and e at 30 C, plus a literature comparison table (Table III) | **P, re-checked** |
| andrushchak2009 | A.S. Andrushchak et al., J. Appl. Phys. 106, 073510 (2009) | 10.1063/1.3238507 | bronze (not reachable here) | c, s, e, photoelastic p for LN and LN:MgO | P(abs); numbers S |
| jazbinsek2002 | M. Jazbinsek, M. Zgonik, Appl. Phys. B 74, 407 (2002) | 10.1007/s003400200818 | closed | Consistent EO/elasto-optic tensor set | not read |
| shoji1997 | I. Shoji, T. Kondo, A. Kitamoto, M. Shirane, R. Ito, JOSA B 14, 2268 (1997) | 10.1364/JOSAB.14.002268 | closed | Absolute d by SHG at 1.548/1.533/1.313/1.064/0.852 um for CLN, MgO1, MgO5; older standard values overestimated | P(abs) |
| kitamoto1995 | A. Kitamoto, T. Kondo, I. Shoji, R. Ito, Opt. Rev. 2, 280 (1995) | (not checked) | abstract page | d31 by parametric fluorescence | P(abs) |
| warner1967 | A.W. Warner, M. Onoe, G.A. Coquin, JASA 42, 1223 (1967) | 10.1121/1.1910709 | closed | 3m elastic/piezo constant method; LN, LT | via ogi2002/kushibiki1999 |
| smithwelsh1971 | R.T. Smith, F.S. Welsh, J. Appl. Phys. 42, 2219 (1971) | 10.1063/1.1660528 | closed | c, e, eps and temperature derivatives, 0-110 C | P(abs); numbers via ogi2002 |
| kim1969 | Y.S. Kim, R.T. Smith, J. Appl. Phys. 40, 4637 (1969) | 10.1063/1.1657244 | closed | Thermal expansion parallel and perpendicular to c, 25-500 C | P(abs); numbers U |
| moretti2005 | M. Moretti et al., J. Appl. Phys. 98, 036101 (2005) | 10.1063/1.1988987 | closed | dn/dT, no and ne, 632 and 1523 nm, 320-515 K | P(abs); number S |
| leidinger2015 | J. Leidinger et al., Opt. Express 23, 21690 (2015) | 10.1364/OE.23.021690 | gold (blocked by anti-bot here) | Absorption of CLN, o/e, 390-3800 nm, <1e-4 to 2 cm^-1 | P(abs) |
| bryan1984 | D.A. Bryan, R. Gerson, H.E. Tomaschke, APL 44, 847 (1984) | 10.1063/1.94946 | closed | Photorefractive resistance at >= 4.5 at.% MgO | P(abs) |
| thierfelder2010 | C. Thierfelder et al., phys. stat. sol. (c) 7, 362 (2010) | 10.1002/pssc.200982473 | closed | "Do we know the band gap of LN?" | P(abs) |
| riefer2013 | A. Riefer et al., PRB 87, 195208 (2013) | 10.1103/PhysRevB.87.195208 | closed | GW+BSE optical response, chi(2) | not read |
| inbar1996 | I. Inbar, R.E. Cohen, PRB 53, 1193 (1996) | 10.1103/PhysRevB.53.1193 | closed | First-principles LN/LT | not read |
| ieee176 | IEEE Std 176-1987, IEEE Standard on Piezoelectricity; reprinted in IEEE TUFFC 43, 717 (1996) | 10.1109/IEEESTD.1988.79638; 10.1109/TUFFC.1996.535477 | closed | Piezo conventions | not read |
| ire1949 | IRE, "Standards on Piezoelectric Crystals, 1949", Proc. IRE 37, 1378 (1949) | 10.1109/JRPROC.1949.229975 | closed | Older axis convention | not read |
| zhu2021 | D. Zhu et al., Adv. Opt. Photon. 13, 242 (2021), arXiv:2102.11956 | (journal) | arXiv | TFLN review; Table 1 has no per-cell references | S |
| zhang2017 | M. Zhang et al., Optica 4, 1536 (2017) | 10.1364/OPTICA.4.001536 | | TFLN microring, 2.7 dB/m (value via zhu2021) | S |
| sarabalis2020 | C.J. Sarabalis et al., "Acousto-optic modulation in lithium niobate on sapphire", arXiv:2005.00916 | | arXiv | TFLN photoelastic fit, effective d | P (via subagent) |
| jiang2019 | W. Jiang et al., "Lithium niobate piezo-optomechanical crystals", Optica 6, 845 (2019), arXiv:1903.00957 | | arXiv | Supplement Eq. 65: p-matrix symmetry form | P (via subagent) |
| rodrigues2023 | C.C. Rodrigues et al., "Stimulated Brillouin scattering by surface acoustic waves in LN waveguides", arXiv:2302.03890 | | arXiv | Eqs. 7-8: c and p sets used in TFLN modelling | S |
| mytsyk2021 | B. Mytsyk et al., Crystals 11, 1095 (2021) | 10.3390/cryst11091095 | gold | Photoelastic sets plus sign-convention statement | S/P |
| mys2015 | O. Mys et al., Appl. Opt. 54, 8176 (2015), arXiv:1508.01075 | | arXiv | Quotes Krupych 2014 photoelastic set | S |
| bouchy2022 | S. Bouchy et al., Materials 2022 (PMC9267966) | | gold | c, e, eps comparison tables (unit labels inconsistent) | P/S |
| cti1999 | Crystal Technology Inc., "LiNbO3 material properties" data sheet DC-12 8/99 (CLN, 48.38 mol% Li2O) | | vendor PDF | Broad property sheet citing reviews, no per-value citations | V |
| rii | M.N. Polyanskiy, refractiveindex.info database; Sci. Data 11, 94 (2024) | | CC0 | Sellmeier YAML | P-db |
| cod | Crystallography Open Database | | CC0 | CIFs 1541936, 1541937, 1544665, 2101845, 2101175-85, 2300665-7, 2311704 | P-db |
| mp3731 | Materials Project mp-3731 (OSTI DOI 10.17188/1184005) | 10.17188/1184005 | see Section 4 | DFT LiNbO3 R3c, E_hull = 0 | partial |

---

## 2. Seed property table

Columns: property | symbol | value | unit | variant | conditions | source (DOI + locator) | status | notes.

All tensor components are in the crystal-physics frame used by each source (Section 3).

### 2.1 Structure and basic

| Property | Symbol | Value | Unit | Variant | Conditions | Source | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Crystal system / point group | | trigonal, 3m (C3v) | | all | ferroelectric phase | cti1999; weis1985 | V/S | |
| Space group | | R3c (No. 161) | | all | below Tc | cti1999; COD CIFs | V/P-db | Paraelectric phase R-3c (No. 167): Boysen COD entries at high temperature are R-3c |
| Lattice a, c (hexagonal) | a, c | 5.14829, 13.8631 | Angstrom | not stated (1966 crystal) | 24 C, neutron | abrahams1966 pt 4 via COD 1541936 | P-db | |
| Lattice a, c | a, c | 5.148, 13.863 | Angstrom | not stated | room temperature, synchrotron | hsu1997 via COD 2101845 | P-db | Rhombohedral a_rh = 5.493(2) A, alpha = 55.89(3) deg |
| Lattice a, c | a, c | 5.1502, 13.8653 | Angstrom | not stated | | Ohgaki et al., Mineral. J. 16, 150 (1992), COD 1544665 | P-db | |
| Lattice a, c | a, c | 5.151, 13.866 | Angstrom | CLN 48.38 | | cti1999 | V | |
| Lattice, SLN | a, c | N/A | Angstrom | SLN | | abrahams1986; Iyi 1992 (not read) | U | Composition-dependent; do not publish an SLN value until read |
| Density | rho | 4642.8 +- 0.2 | kg/m^3 | CLN (SAW grade) | Archimedes | kushibiki1999 Table IV | P | |
| Density | rho | 4636 | kg/m^3 | not stated | 30 C | ogi2002 | P | Handbook value 4633 is also quoted there |
| Density | rho | 4650 | kg/m^3 | CLN | | cti1999 | V | Range across sources 4628-4650. Wikipedia "4.30 g/cm3" is wrong |
| Congruent composition | | 48.38 +- 0.01 / 48.45 | mol% Li2O | CLN | | cti1999 / Wong via de.wikipedia | V/S | Range 48.38-48.6 in common use |
| Spontaneous polarization | Ps | 80 +- 5 | uC/cm^2 | CLN and near-SLN | | gopalan1998 abstract | P(abs) | Insensitive to stoichiometry and H content |
| Melting point | Tm | 1250 (approx.), 1253, 1240, 1275 | C | CLN | | cti1999; vendors; CRC via en.wikipedia; Alfa Aesar via de.wikipedia | V/S | Publish as a range, about 1240-1275 C, pending wong2002 |
| Curie temperature | Tc | 1142.3 +- 0.7 | C | CLN 48.38 | | cti1999 | V | 1143 C (48.45 mol%), Wong via de.wikipedia, S |
| Curie temperature | Tc | 1213 | C | SLN | | Wong via de.wikipedia | S | Strongly composition-dependent; vendor 1157 C (Tydex) is unattributed |
| Curie temperature (neutron) | Tc | about 1430 K | K | not stated | | boysen1994 abstract | P(abs) | About 1157 C; composition not seen |
| Mohs hardness | | 5 | | | | cti1999; vendors | V | Korth "630" is a mislabel |
| Coercive field ratio | Ec(CLN)/Ec(SLN) | about 4-5 | | CLN (C = 0.484) vs near-SLN (0.498) | room temperature | gopalan1998 abstract | P(abs) | |
| Internal field | Eint | about 2.5 | kV/mm | CLN; vanishes in SLN | | gopalan1998 abstract | P(abs) | |
| Coercive field | Ec | about 21 | kV/mm | CLN | room temperature | claimed: Myers et al. JOSA B 12, 2102 (1995) and others | U | Abstract does not state it |
| Coercive field | Ec | about 4-5 | kV/mm | SLN; MgO5 | room temperature | claimed: Kitamura, Furukawa et al. | U | |

### 2.2 Thermal, pyroelectric

| Property | Symbol | Value | Unit | Variant | Conditions | Source | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Thermal expansion | alpha_a, alpha_c | 15e-6, 7.5e-6 | 1/K | CLN | 25 C | cti1999 | V | |
| Thermal expansion | alpha_a, alpha_c | 14.8e-6, 4.1e-6 (Korth); 15.7e-6, 4e-6 (Tydex); 15.4e-6, 7.5e-6 (arXiv:1806.04755) | 1/K | | | vendors / S | V/S | **alpha_c disagrees, 4-7.5 ppm/K.** The primary kim1969 is needed (abstract: the z expansion shows a maximum near the top of 25-500 C). Castech "2.0e-6" is wrong |
| Thermal conductivity | kappa | about 4.2 | W/(m K) | CLN | 25 C | cti1999 (1e-2 cal/(cm s C)) | V | |
| Thermal conductivity | kappa_c, kappa_a(?) | 4.61, 4.19 | W/(m K) | | 300 K | Tydex | V | Axis label lost in extraction; "38 W/(m K)" on some vendor pages is wrong |
| Thermal conductivity vs T | kappa(T) | proportional to T^-alpha, alpha near 1 | | SLN | FDTR | Zhou et al., arXiv:2607.01673 (2026-07-02, preprint) | S | No peer-reviewed primary found this pass |
| Specific heat | cp | about 628 / 648 | J/(kg K) | CLN | 25 C | cti1999 (0.15 cal/(g C)) / Tydex | V | |
| Pyroelectric coefficient | p3 | -8.3e-5 | C/(m^2 K) | CLN | 25 C | cti1999 | V | Sign depends on the +z convention (Section 3) |
| Pyroelectric coefficient | |p3| | about 9.5e-5 | C/(m^2 K) | CLN | interferometric | Popescu et al., J. Appl. Phys. 113, 043101 (2013), abstract via a secondary page | S | |

### 2.3 Dispersion (Sellmeier) models

**zelmon1997**. Form (rii formula 2): `n^2 - 1 = B1 L^2/(L^2 - C1) + B2 L^2/(L^2 - C2) + B3 L^2/(L^2 - C3)`, with L in um and C in um^2. Conditions: 21 C, valid 0.4-5.0 um.

| Variant | Axis | B1 | C1 | B2 | C2 | B3 | C3 | Status |
|---|---|---|---|---|---|---|---|---|
| CLN | o | 2.6734 | 0.01764 | 1.2290 | 0.05914 | 12.614 | 474.60 | P-db, re-checked |
| CLN | e | 2.9804 | 0.02047 | 0.5981 | 0.0666 | 8.9543 | 416.08 | P-db, re-checked |
| MgO5 | o | 2.4272 | 0.01478 | 1.4617 | 0.05612 | 9.6536 | 371.216 | P-db (rii-swapped; consistent with the 2026 erratum) |
| MgO5 | e | 2.2454 | 0.01242 | 1.3005 | 0.05313 | 6.8972 | 331.33 | P-db (as above) |

**jundt1997**. CLN, ne only, 20-250 C, 0.4-5 um. Coefficients via en.wikipedia (S); the primary was not read.

```
ne^2 = 5.35583 + 4.629e-7 f + (0.100473 + 3.862e-8 f)/(L^2 - (0.20692 - 0.89e-8 f)^2)
       + (100 + 2.657e-5 f)/(L^2 - 11.34927^2) - 1.5334e-2 L^2
f = (T - 24.5)(T + 570.82),  T in C, L in um
```

**gayer2008**. Same functional form, with a1..a6 and b1..b4:

```
n^2 = a1 + b1 f + (a2 + b2 f)/(L^2 - (a3 + b3 f)^2) + (a4 + b4 f)/(L^2 - a5^2) - a6 L^2
```

| Coef | MgO5 ne | MgO5 no | MgO1-SLN ne |
|---|---|---|---|
| a1 | 5.756 | 5.653 | 5.078 |
| a2 | 0.0983 | 0.1185 | 0.0964 |
| a3 | 0.2020 | 0.2091 | 0.2065 |
| a4 | 189.32 | 89.61 | 61.16 |
| a5 | 12.52 | 10.85 | 10.55 |
| a6 | 1.32e-2 | 1.97e-2 | 1.59e-2 |
| b1 | 2.860e-6 | 7.941e-7 | 4.677e-7 |
| b2 | 4.700e-8 | 3.134e-8 | 7.822e-8 |
| b3 | 6.113e-8 | -4.641e-9 | -2.653e-8 |
| b4 | 1.516e-4 | -2.188e-6 | 1.096e-4 |

Gayer status:
- a-values: P-db (rii, 24.5 C files).
- b-values: S (en.wikipedia; reproduced identically in arXiv:2408.05907 Eq. 1).
- rii validity: ne 0.5-4.0 um; no 0.5-1.7 um.
- **Labelling conflict:** the rii "Gayer-1-e" comment calls the 1% material congruent, while Wikipedia calls it 1% MgO:SLN.
- **Anomaly (C):** dne/dT from these b-values is about 2.7e-4 /K at 1550 nm. That is about 7x Jundt's CLN value, so the b-values or their transcription are suspect.
- **Rule:** do not publish temperature-dependent Gayer until the 2009 erratum is read.

**cti1999** (V, unattributed). CLN T-dependent Sellmeier with λ in nm:

```
n^2 = A1 + (A2 + B1 F)/(λ^2 - (A3 + B2 F)^2) + B3 F - A4 λ^2
F = (T - 24.5)(T + 570.5)
```

| Axis | A1 | A2 | A3 | A4 | B1 | B2 | B3 |
|---|---|---|---|---|---|---|---|
| ne | 4.582 | 9.921e4 | 2.109e2 | 2.194e-8 | 5.2716e-2 | -4.9143e-5 | 2.2971e-7 |
| no | 4.9048 | 1.1775e5 | 2.1802e2 | 2.7153e-8 | 2.2314e-2 | -2.9671e-5 | 2.1429e-8 |

Not retrieved:
- schlarb1993: a composition-dependent model (47-50 mol% Li2O, 50-600 K, 400-1200 nm). It is the right model for an SLN/CLN slider; coefficients U.
- smith1976.
- A pure-SLN Sellmeier.

### 2.4 Refractive index, birefringence, thermo-optic

| Property | Symbol | Value | Unit | Variant | Conditions | Source | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Index | no, ne | 2.2865, 2.2022 | | CLN | 632.8 nm, 21 C | zelmon1997 | C (re-computed) | cti1999 table: 2.2866 / 2.2028 (V) |
| Index | no, ne | 2.2321, 2.1555 | | CLN | 1064 nm, 21 C | zelmon1997 | C | Jundt ne at 24.5 C: 2.1558 |
| Index | no, ne | 2.2111, 2.1376 | | CLN | 1550 nm, 21 C | zelmon1997 | C | Jundt ne at 24.5 C: 2.1379 |
| Index | no, ne | 2.2088, 2.1306 | | MgO5 | 1550 nm, 24.5 C | gayer2008 a-coefficients | C | Zelmon MgO5 (corrected): 2.2082 / 2.1299 |
| Birefringence | ne - no | -0.0842 / -0.0766 / -0.0736 | | CLN | 633 / 1064 / 1550 nm | zelmon1997 | C | Negative uniaxial; depends on composition and temperature |
| Thermo-optic | dne/dT | 3.34e-5 | 1/K | CLN | 1523 nm, 300 K | moretti2005 via zhu2021 | S | Moretti's own table not read |
| Thermo-optic | dne/dT | 3.75e-5 / 4.01e-5 / 4.89e-5 | 1/K | CLN | 1550 / 1064 / 633 nm, 25 C | jundt1997 | C (re-computed) | |
| Thermo-optic | dno/dT | 0.41e-5 / 0.54e-5 / 0.94e-5 | 1/K | CLN | 1550 / 1064 / 633 nm, 25 C | cti1999 Sellmeier | C from V | no is about 10x less T-sensitive than ne |
| Nonlinear index | n2 | 9.33e-20 | m^2/W | not stated | 1064 nm, 30 ps, Z-scan, e-polarization | DeSalvo et al., IEEE JQE 32, 1324 (1996), via rii | P-db | 8.25e-19 m^2/W at 532 nm (22 ps); zhu2021 gives 1.8e-19 (S) |

Known bad values circulating:
- Korth "no = 2.237, ne = 2.158 at 633 nm".
- en.wikipedia "no = 2.3007, ne = 2.2116" with no wavelength.

### 2.5 Transparency, absorption, bandgap

| Property | Value | Unit | Variant | Conditions | Source | Status | Notes |
|---|---|---|---|---|---|---|---|
| Optical bandgap (frequently cited) | 3.7 | eV | | direct, from optics | thierfelder2010 abstract | P(abs) | GW calculations give a fundamental gap at least 1 eV larger. The site should say "about 3.7 eV optical; quasiparticle gap debated" |
| UV absorption edge | composition-dependent | nm | CLN to SLN | | kovacs1997 | P(abs) | Calibration curve not read. Claimed CLN about 320 nm and SLN about 300-305 nm: U |
| UV cutoff | 340 | nm | CLN | 1/e, 1 cm thick | cti1999 | V | |
| IR cutoff | 4600 | nm | CLN | 1/e, 1 cm thick | cti1999 | V | |
| Transparency window | about 0.32-0.42 to 4.5-5.6 | um | | thickness-dependent | various | S/V | Always state the criterion and thickness; recommend "about 0.35-5 um" with a range |
| OH stretch line | 2.87 | um | CLN | | bryan1984 abstract | P(abs) | 2.83 um in MgO >= 4.5 at.% |
| Absorption coefficient, transparent range | <1e-4 to 2 | cm^-1 | CLN, o and e | 390-3800 nm | leidinger2015 abstract | P(abs) | Value at 1550 nm is in the paper (gold OA) but unread here. U. 1e-4 cm^-1 = 0.043 dB/m |
| Bulk material loss limit | <0.4 | dB/m | CLN | bulk whispering-gallery resonators | zhu2021 citing its refs [92,93] | S | |
| TFLN waveguide loss | 2.7 | dB/m | TFLN | microring, 2017 | zhang2017 via zhu2021 | S | Later records exist; not verified this pass |

### 2.6 Electro-optic (pm/V)

Tensor form for 3m with the mirror plane perpendicular to x (Section 3), contracted index I = (ij):

```
r = [[  0,  -r22, r13],
     [  0,   r22, r13],
     [  0,    0,  r33],
     [  0,   r51,  0 ],
     [ r51,   0,   0 ],
     [-r22,   0,   0 ]]       r42 = r51
```

| Source | λ | Clamping | r13 | r22 | r33 | r51 | rc | Status |
|---|---|---|---|---|---|---|---|---|
| cti1999 | 633 nm | unclamped (T, low frequency) | 10 | 7 | 33 | 33 | 18 | V |
| cti1999 | 633 nm | clamped (S, high frequency) | 9 | 3 | 31 | 28 | 19 | V |
| Rauber 1978 via Veit et al. (arXiv cond-mat/0311240, Table 1) | not stated | unclamped | 10.0 | 6.8 | 32.2 | 32.6 | | S |
| same | not stated | clamped | 8.6 | 3.4 | 30.8 | 28 | | S |
| Hf-doped LN study (arXiv:0808.2802, Table 1), CLN reference sample | 633 nm, room temperature | T / S | | 6.4 +- 0.4 / 3.8 +- 0.3 | | | 19.7 +- 2 / 19.7 +- 2 | P (via subagent) |
| zhu2021 Table 1 | not stated | not labelled | 9.6 | 6.8 | 30.9 | 32.6 | | S |
| jazbinsek2002; weis1985; wong2002 | | | | | | | | U (not read) |

Notes:
- **r22 depends on composition**: unclamped values of 1.5-9.9 pm/V (Abdi et al., J. Appl. Phys. 84, 2251 (1998), via Veit; S).
- The clamped/unclamped gap is large for r22 and r51 and small for r13 and r33, because the acoustic (piezo plus photoelastic) contribution matters most for r22 and r51.
- **No accessible 1550 nm EO values were found.** TFLN papers usually reuse 633 nm r33 of about 30.9-31 pm/V; this is an open data gap.
- Signs: all accessible tables list magnitudes; see Section 3.

### 2.7 Second-order nonlinear d (pm/V)

Form, with Kleinman symmetry: d15 = d24 = d31.

```
d = [[0,0,0,0,d31,-d22],[-d22,d22,0,d31,0,0],[d31,d31,d33,0,0,0]]
```

| Source | λ (fundamental) | d33 | d31 | d22 | Variant | Status | Notes |
|---|---|---|---|---|---|---|---|
| shoji1997 | 1.064 um (also 1.313, 1.533, 1.548, 0.852) | claimed 25.2 | claimed about 4.6 | | CLN; MgO1 and MgO5 also measured | P(abs), numbers U | Abstract: "many of the currently accepted standard values are overestimated" (multiple reflections); Miller's rule "not so good" for scaling |
| kitamoto1995 | parametric fluorescence, 488 / 532 nm pump | | 4.8 +- 0.5 / 4.3 +- 0.5 | | CLN | P(abs) | Earlier 5.8 judged overestimated |
| zhu2021 Table 1 | 1064 nm | -27.0 | -4.3 | 2.10 | not stated | S | No reference |
| cti1999 | 1.06 um | -33 | -5 | 3 | CLN | V | Pre-Shoji scale |
| Vendors (Tydex, Shalom) | | 34.4-37.8 | 5.1 | 2.46 | | V | Likely inflated |

QPM d_eff = (2/π) d33. Any number quoted needs the λ and the scale (pre- or post-Shoji).

### 2.8 Relative permittivity

| Property | Value | Variant | Conditions | Source | Status |
|---|---|---|---|---|---|
| eps11^T / eps0 | 83.3 +- 0.8 | CLN | constant stress (free), low frequency | kushibiki1999 Table IV | P, re-checked |
| eps33^T / eps0 | 28.5 +- 0.3 | CLN | as above | kushibiki1999 Table IV | P |
| eps11^S / eps0 | 44.9 +- 0.4 | CLN | constant strain (clamped), derived in the fit | kushibiki1999 Table V | P |
| eps33^S / eps0 | 26.7 +- 0.3 | CLN | as above | kushibiki1999 Table V | P |
| eps^T computed from eps^S + d e | 83.3 / 28.5 | CLN | | kushibiki1999 set | C, matches measured |
| eps11^T, eps33^T, eps11^S, eps33^S | 85, 28.7, 44, 27.9 | CLN | <500 kHz / >10 MHz | cti1999 | V |
| eps^S (Warner; S&W; Kovacs) | 44.0 / 29.0; 44.3 / 27.9; 45.6 / 26.3 | | | ogi2002 Table III (in 1e-12 F/m, converted) | S + C |

Spread in the literature: eps33^S about 24-29 and eps11^T about 83-85.

### 2.9 Elastic stiffness c^E (GPa) and compliance s^E

For 3m with the mirror perpendicular to x:
- c22 = c11, c23 = c13, c24 = -c14, c55 = c44, c56 = c14, c66 = (c11 - c12)/2.

| Source | c11 | c12 | c13 | c14 | c33 | c44 | c66 | Status |
|---|---|---|---|---|---|---|---|---|
| kushibiki1999 (SAW-grade CLN) | 198.86 +- 0.03 | 54.67 +- 0.04 | 67.99 +- 0.55 | 7.83 +- 0.02 | 234.18 +- 0.75 | 59.85 +- 0.01 | 72.09 +- 0.02 | **P, re-checked** |
| ogi2002 (RUS, 30 C) | 199.5 +- 0.2 | 55.27 +- 0.13 | 67.67 +- 0.26 | 8.7 +- 0.2 | 235.2 +- 0.4 | 59.48 +- 0.04 | 72.10 +- 0.01 | **P, re-checked** |
| warner1967 | 203 | 53 | 75 | 9 | 245 | 60 | 75 | S (via ogi2002, kushibiki1999) |
| smithwelsh1971 | 203.0 | 57.3 | 75.2 | 8.5 | 242.4 | 59.5 | 72.8 | S (via ogi2002); cti1999 copies this set |
| Kovacs 1990 (IEEE Ultrason. Symp.) | 198.4 | 54.72 | 65.13 | 7.88 | 227.9 | 59.65 | 71.84 | S (via ogi2002) |
| andrushchak2009 | 199 | 54.7 | 70.0 | 7.9 | 240 | 59.9 | | S (via bouchy2022) |

Compliance s^E (1e-12 m^2/N, C) by inverting the Kushibiki c^E with engineering shear strain:
- s11 = 5.854, s12 = -1.182, s13 = -1.356, s14 = -0.920.
- s33 = 5.058, s44 = 16.949, s66 = 14.071.
- s66 = 2(s11 - s12); s56 = 2 s14.

Note: in the same Kushibiki table, LiTaO3 has c14 = -10.75 GPa, while LN has +7.83 GPa. The c14 sign therefore differs between LN and LT in one consistent convention.

### 2.10 Piezoelectric

Form: e = [[0,0,0,0,e15,-e22],[-e22,e22,0,e15,0,0],[e31,e31,e33,0,0,0]].

| Source | e15 | e22 | e31 | e33 (C/m^2) | Status |
|---|---|---|---|---|---|
| kushibiki1999 | 3.655 +- 0.022 | 2.407 +- 0.015 | 0.328 +- 0.032 | 1.894 +- 0.054 | P, re-checked |
| ogi2002 | 3.65 +- 0.03 | 2.39 +- 0.03 | 0.31 +- 0.04 | 1.72 +- 0.18 | P, re-checked |
| warner1967 / smithwelsh1971 / Kovacs 1990 | 3.7 / 3.76 / 3.69 | 2.5 / 2.43 / 2.42 | 0.2 / 0.23 / 0.30 | 1.3 / 1.33 / 1.77 | S |
| andrushchak2009 | 3.67 | 2.38 | 0.34 | 1.60 | S |

Strain constants d = e s^E (pC/N):

| Source | d15 | d22 | d31 | d33 | Status |
|---|---|---|---|---|---|
| kushibiki1999 set | 66.4 | 20.3 | -1.04 | 8.7 | C (d16 = -2 d22 = -40.6) |
| smithwelsh1971 set | 69.1 | 20.7 | -0.85 | 6.0 | C (subagent) |
| cti1999 | 69.2 | 20.8 | -0.85 | 6.0 | V (consistent with S&W) |
| TFLN fit (LN on sapphire) | d_YZY of about 62 vs 69 bulk | | | | P (sarabalis2020, via subagent) |

**d33 is the least certain piezo coefficient**: 6-16 pC/N across sources, and the 12.5 and 16 values are inconsistent with every measured e/c set.

### 2.11 Photoelastic (strain-optic) p at 633 nm

Form: p22 = p11, p23 = p13, p24 = -p14, p32 = p31, p42 = -p41, p55 = p44, p56 = p41, p65 = p14, p66 = (p11 - p12)/2. Note that p_IJ is not symmetric (p14 ≠ p41).

| Source | p11 | p12 | p13 | p14 | p31 | p33 | p41 | p44 | Status |
|---|---|---|---|---|---|---|---|---|---|
| andrushchak2009 (via sarabalis2020 Table I; mytsyk2021 Table 6) | -0.021 +- 0.018 | 0.060 +- 0.019 | 0.172 +- 0.029 | -0.052 +- 0.007 | 0.141 +- 0.017 | 0.118 +- 0.020 | -0.109 +- 0.017 | 0.121 +- 0.019 | S |
| Set B: mytsyk2021 row 2 (likely Avakyants 1976); also zhu2021 | -0.026 | 0.090 | 0.133 | -0.075 | 0.179 | 0.071 | -0.151 | 0.146 | S |
| rodrigues2023 Eq. 8 | -0.026 | 0.088 | 0.134 | -0.083 | 0.177 | 0.07 | -0.151 | 0.145 | S |
| Krupych et al., Appl. Opt. 53, B1 (2014) via mys2015 | -0.023 | 0.076 | 0.147 | +0.057 | 0.157 | 0.141 | +0.051 | 0.126 | S |
| sarabalis2020 TFLN fit | | | | | | 0.038 | -0.038 | 0.085 | P (fit, three components) |

The p14 and p41 signs flip with the c14 sign convention; see Section 3. weis1985 (as recorded in the author's 2018 notes) separates primary and secondary contributions for p13 and p33; that is not verified here.

### 2.12 Acoustic velocities (bulk, measured)

| Mode | Direction | v (m/s) | Source | Status |
|---|---|---|---|---|
| Longitudinal | Z (006) | 7328.20 +- 0.32 | kushibiki1999 Table II | P |
| Shear | Z (006) | 3590.41 +- 0.23 | same | P |
| Longitudinal | X (110) | 6544.53 +- 0.30 | same | P |
| Longitudinal | Y (300) | 6806.55 +- 0.26 | same | P |
| Shear | Y (300) | 3940.49 +- 0.21 | same | P |
| Shear (resonance) | X (110) | 4750.67 +- 0.59 | same | P |
| Check | Z longitudinal, piezo-stiffened, from the kushibiki1999 constants | 7328.6 (unstiffened 7102.1) | C | matches to 0.4 m/s |
| SAW | Y-Z / 128 deg Y-X / 64 deg Y-X / 41 deg Y-X | 3488 / 3980 / 4690 / 4750 | Fomos knowledge base | V |

### 2.13 Photorefraction, damage, conductivity

| Property | Value | Variant | Source | Status | Notes |
|---|---|---|---|---|---|
| MgO threshold for photorefractive resistance | >= 4.5 at.% MgO; about 100x photoconductivity increase | MgO:CLN | bryan1984 abstract | P(abs) | Activation energy 0.1 eV (resistant) vs 0.5 eV |
| Laser damage threshold | 100-300 MW/cm^2, 10 ns, 1064 nm | CLN, MgO:PPLN | vendors | V | Do not publish as a material constant |
| Dark conductivity | N/A | | | U | No accessible source. The fitted floor of 1e-6 S/m in bouchy2022 is inconsistent with hour-scale drift |
| Bias drift mechanism | tau = eps rho; ms to hours or longer in TFLN | TFLN | zhu2021 Sec. 7.1 | S | |

### 2.14 Gaps: values requested but not verifiable in this pass

1. Coercive fields (CLN, SLN, MgO5).
2. SLN lattice constants.
3. Shoji d table.
4. jazbinsek2002 EO set, and EO at 1550 nm.
5. weis1985 and wong2002 tables, including the r13 sign.
6. Moretti dn/dT table.
7. Leidinger alpha(1550 nm).
8. kim1969 alpha values.
9. Peer-reviewed thermal conductivity.
10. Dark conductivity.
11. Kovacs UV-edge calibration.
12. Gayer erratum content.
13. schlarb1993 coefficients.

**Action:** obtain these PDFs through institutional access and transcribe them with locators.

---

## 3. Known pitfalls (conventions)

| # | Pitfall | What is verified | Recommendation |
|---|---|---|---|
| 1 | **Axis frame for 3m.** x is perpendicular to the mirror plane (a-axis), y lies in the mirror plane, z is parallel to c (polar axis). The tensor forms above, with e22 and r22 at those positions and c24 = -c14, correspond to this choice. | The forms in kushibiki1999 and ogi2002 match this (C, by symmetry). | Store the frame explicitly per dataset: `frame: {x: "perp-to-mirror", z: "polar", handedness: "right"}`. |
| 2 | **Residual sign ambiguity: 180 deg rotation about z.** In a right-handed frame this flips c14, s14, p14, p41, e22, d22 and r22 together, but not c11, e33 and the like. | Symmetry argument (C). mytsyk2021 abstract: signs of pi14 and pi41 "are defined by the choice of the right crystal-physics coordinate system"; it uses S14 > 0 (so c14 < 0). Krupych 2014 (via mys2015) uses c14 > 0 with p14, p41 > 0, which is physically equivalent. | **Never mix p14/p41 from one paper with c14/e22 from another without checking that the c14 sign matches.** Common TFLN practice pairs c14 > 0 (Kushibiki) with p14 = -0.083, p41 = -0.151 (Set B). That pairing is consistent only if Set B was measured in a c14 > 0 frame, which is unconfirmed. Treat it as a likely sign mismatch. |
| 3 | **+z face definition.** Flipping +z (180 deg about x) flips all odd-rank tensors (e, d, r, d_NLO, pyroelectric p3) but not c or p. | Symmetry (C). IEEE 176-1987 vs IRE 1949 wording not read (U). | Store `z_sign_definition` as text quoted from the source. The site should explain physically which face goes positive on cooling or compression, with a citation, before publishing signed odd-rank values. |
| 4 | **IEEE 176-1987 vs IRE 1949.** The two standards differ in axis/sign rules for some classes. | DOIs verified; text not read. Veit et al. state that they follow the IRE convention (Hulme et al., J. Phys. C 2, 855 (1969)). | Record `convention: "IEEE-176-1987" or "IRE-1949" or "unstated"` per dataset; default to "unstated" rather than guessing. |
| 5 | **r13 sign discrepancy.** The author's 2018 notes recorded one sign difference in r13 between the Wong and Weis & Gaylord tables, and trusted W&G after comparing with the piezo matrix. | Not independently verified (both sources unread). | Show r13 as positive in a stated frame (all accessible tables list it positive) and flag the discrepancy in a hover note. |
| 6 | **Voigt "convention of 2s"** (engineering shear strain S4 = 2 S23). | ogi2002 states it uses engineering strain. jiang2019 and rodrigues2023 give p66 = (p11 - p12)/2. Computed: s66 = 2(s11 - s12) and d16 = -2 d22. | Each payload states `voigt: {order: ["xx","yy","zz","yz","xz","xy"], shear_strain: "engineering"}`. Also ship full-rank tensors (3x3x3, 3x3x3x3) generated by code, so consumers never apply factors by hand. The pi66 = 2(pi11 - pi12) relation (Nye) is textbook, not source-checked in this pass. |
| 7 | **Clamped vs unclamped.** For EO and permittivity: T = constant stress (free, below acoustic resonances, low frequency), S = constant strain (clamped, above resonances). For elastic constants: c^E (constant E) vs c^D (constant D). | kushibiki1999: eps^T measured, eps^S fitted, and they are consistent (C). | Mandatory `mechanical_boundary: "S" or "T"` and `electrical_boundary: "E" or "D"` fields. For high-speed modulators, S values apply; r22 and r51 roughly halve. |
| 8 | **Composition (CLN vs SLN vs MgO).** Affects Tc (about 1142 vs 1213 C), coercive field (4-5x), UV edge, r22 (1.5-9.9 pm/V) and ne (Schlarb). Elastic and photoelastic properties change little with MgO (andrushchak2009 abstract). | As cited. | `variant` is a required key, with `Li2O_mol_pct` and a `dopant` object. Never publish "LN" without a variant. |
| 9 | **Hexagonal vs rhombohedral cells.** | hsu1997: a_rh = 5.493 A, alpha = 55.89 deg vs hexagonal a = 5.148, c = 13.863 A. en.wikipedia mixes the settings (a = 5.1501, c = 5.4952 A). The Materials Project OPTIMADE endpoint stores a 40-site non-standard cell. | Always give the setting and Z. Link the COD CIF for structure. |
| 10 | **Sellmeier swaps and errata.** | Zelmon MgO5 o/e swap (erratum 2026-10-22); Gayer erratum; Smith errata. | An `errata` array per model; unit tests that require ne < no (negative uniaxial) over the validity range. |
| 11 | **Pre-Shoji d scale.** | shoji1997 abstract. | Tag d datasets with `scale: "post-Shoji-1997" or "legacy"`. |
| 12 | **Vendor-sheet errors.** | Examples: Castech alpha = 2e-6/K, kappa = 38 W/(m K), resistivity 2e-6 Ohm cm; Korth indices; Wikipedia density 4.30 g/cm3. | Never ingest vendor values as authoritative; show them only as context. |

---

## 4. API and data design for AI accessibility

### 4.1 Survey of conventions (status 2026-10-24)

| Convention | Status | Relevance | Verdict |
|---|---|---|---|
| llms.txt (llmstxt.org) | Proposed 2024-09-03; page says v2 modified 2026-08-10. Only the H1 is required; H2 link lists; `.md` twins of pages. Live on docs.anthropic.com, docs.stripe.com, docs.materialsproject.org. llms-full.txt is a de facto convention, not in the spec. | Index for agents pointed at the site | Ship it. Evidence that crawlers read it is weak and anecdotal; its value is for user-directed agents |
| schema.org Dataset JSON-LD | Google Dataset structured-data page updated 2026-09-08. Required: name, description (50-5000 characters). Recommended: creator, citation, identifier (DOI), license, distribution/DataDownload, variableMeasured, measurementTechnique, version, isAccessibleForFree. schema.org V30.1 (2026-09-16). | Discovery (Google Dataset Search, crawlers) | Ship one Dataset per property page, with `about: ChemicalSubstance` (chemicalComposition "LiNbO3"). There is no schema.org type for a tensor or material property; use one PropertyValue per quantity |
| OpenAPI | 3.2.0 released 2025-09-19 (latest page shows 3.2.1, 2026-09-10); 3.1+ uses JSON Schema 2020-12 | Describes static GET paths fine | Ship `/api/openapi.json` (3.1 for tooling reach), with no query parameters |
| JSON Schema 2020-12 | Current | Payload validation | One schema per payload type |
| ai-plugin.json | Dead (ChatGPT plugins sunset 2024) | | Do not ship |
| Frictionless Data Package v2 | Released 2024-06-26; Table Schema has no `unit` field (extra properties allowed) | CSV bundle metadata | Ship `datapackage.json` with a custom `unit_ucum` per field |
| CSVW (W3C 2015) | Stable, low uptake; Google support beta | | Optional |
| Parquet | | Data is KB-MB in size | Skip |
| Zenodo GitHub integration | Concept DOI (all versions) plus a version DOI per release; `.zenodo.json` overrides CITATION.cff | Citability | Ship. Cite the concept DOI on the site and the version DOI in each payload's `meta` |
| CITATION.cff | cff-version 1.2.0 | GitHub citation box | Ship |
| MCP | Spec 2026-07-28 (stateless; Streamable HTTP POST). A static host returns 405 for POST (tested on GitHub Pages) | Agent tool access | Needs an edge function (e.g. Cloudflare Worker, free tier 100k requests/day, 10 ms CPU). Discovery (SEP-2127 server cards, IETF `.well-known/mcp-server` draft) is unsettled. Later phase |
| UCUM | v2.2 (2024-06-17); validates pm/V, pC/N, C/m2, GPa, m2/N, K-1, W/(m.K), J/(kg.K), kg/m3, nm | Machine unit field | **Required** unit field |
| QUDT | v3.5.3 (2026-10-20), CC BY 4.0. Has C-PER-M2, GigaPA, M2-PER-N, PER-K, W-PER-M-K, J-PER-KiloGM-K, KiloGM-PER-M3, FARAD-PER-M. **No PicoM-PER-V and no C-PER-N / PicoC-PER-N** | Linked-data unit URIs | Optional URI where one exists |
| schema.org unitCode | UN/CEFACT 3-character code or URL; UCUM goes in unitText | | Use the QUDT URI as unitCode where available, and UCUM in unitText |
| OPTIMADE | v1.3.0 (2025-12-17). Static files allowed only for an index meta-database; entry endpoints need the filter grammar | Crystal structure interop | Skip compliance. Link COD (CC0) and MP IDs. Borrow the OPTIMADE property/unit-definition pattern for field metadata |
| Materials Project | mp-3731: LiNbO3, E_hull = 0 (GGA/GGA+U/r2SCAN), last modified 2023-03-11. Legacy terms: CC BY 4.0. Current terms page returned 403; band gap not retrieved | DFT cross-link | Link only; do not copy |
| refractiveindex.info | Database CC0; LiNbO3 Zelmon o/e; MgO Gayer-1-e, Gayer-5-e/o, Zelmon (swapped); DeSalvo n2. No Schlarb entry, no CLN Gayer | Dispersion interop | Emit an rii-compatible YAML export for each dispersion model |
| COD | CC0 | Structure | Link CIFs |
| ICSD, SpringerMaterials, NIST SRD | ICSD prohibits redistribution; NIST SRD is copyrighted (15 USC 290e) | | Do not ingest |
| robots.txt | RFC 9309. Tokens: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, Google-Extended. IETF aipref drafts (vocab-08, 2026-09-13) are not yet RFCs | | Explicitly allow; add aipref once standardized |
| GitHub Pages behavior (tested) | Sends `access-control-allow-origin: *`, `cache-control: max-age=600`, and `application/json` for .json. POST/OPTIONS return 405. **Query strings are ignored** (identical body). No custom headers. Limits: 1 GB site, 100 GB/month soft bandwidth | Hosting | Works for static JSON. Use Cloudflare Pages only if headers or Functions are needed |

### 4.2 Copyright and license

- **US:** under Feist v. Rural, 499 U.S. 340 (1991), facts are not copyrightable. Original selection or arrangement of a compilation gets "thin" protection.
- **EU:** Directive 96/9/EC adds a sui generis database right. The article text was not read this pass (EUR-Lex blocked).
- **Rules for this site:**
  - Re-key individual values with per-value citations.
  - Do not reproduce whole handbook tables in their layout (weis1985, wong2002, Landolt-Bornstein).
  - Do not redistribute PDFs; the Osaka repository copy of ogi2002 is "personal use only".
  - Do not ingest NIST SRD, ICSD or SpringerMaterials.
- **Recommendation:** release the compiled data as **CC BY 4.0**. It matches Materials Project (legacy terms) and QUDT, and Section 4 of the license covers sui generis database rights. Use MIT for code.
- **Alternative:** CC0 (refractiveindex.info and COD precedent) if frictionless reuse by AI and tooling is preferred over attribution. This is a decision for the author.
- Not legal advice.

### 4.3 URL scheme (static, path-parameterized; no query strings)

```
/llms.txt                                   index for agents (links below + key explainer pages)
/llms-full.txt                              concatenated markdown of property pages
/api/v1/index.json                          catalog: properties, variants, sources, schema links, version, DOI
/api/openapi.json                           OpenAPI 3.1 describing every GET path below
/api/v1/schema/{type}.schema.json           scalar | tensor | dispersion-model | source | grid
/api/v1/variants.json                       cln, sln, mgo5-cln, mgo1-sln, tfln-x-cut ... (composition, dopant)
/api/v1/sources.json                        all sources (CSL-JSON + DOI + OA + license notes)
/api/v1/sources/{source_id}.json            e.g. kushibiki1999
/api/v1/properties.json                     flat list of all scalar records (also as CSV)
/api/v1/properties/{property}.json          all records for one property, all variants/sources
/api/v1/properties/{property}/{variant}.json  recommended record + alternatives
/api/v1/tensors/{tensor}/{variant}/{source_id}.json   e.g. elastic-stiffness-cE/cln/kushibiki1999.json
/api/v1/dispersion/{model_id}.json          e.g. zelmon1997-cln-e (formula, coefficients, validity, errata)
/api/v1/dispersion/{model_id}.rii.yml       refractiveindex.info-compatible export
/api/v1/grids/index/{model_id}/T{T_C}C.csv  precomputed n(lambda) at 1 nm steps, 400-5000 nm
/api/v1/grids/index/{model_id}/lambda{nm}nm.csv   n(T) at fixed wavelengths (532, 633, 1064, 1550, 2000)
/api/v1/lib/ln.mjs                          ESM evaluator: sellmeier(), rotateTensor(), voigtToFull()
/data/linbo3-properties-v{semver}.csv + datapackage.json
/properties/{property}/                     human page (with Dataset JSON-LD, .md twin at index.md)
```

### 4.4 Record schema (scalar or tensor component), example

```json
{
  "id": "eps33-T/cln/kushibiki1999",
  "property": "relative_permittivity",
  "symbol": "eps33^T/eps0",
  "tensor": {"rank": 2, "component": "33"},
  "value": 28.5,
  "uncertainty": {"type": "stated", "value": 0.3},
  "unit": {"ucum": "1", "qudt": "http://qudt.org/vocab/unit/UNITLESS", "display": "1"},
  "variant": {"id": "cln", "Li2O_mol_pct": null, "note": "SAW-grade congruent, composition not stated in source", "dopant": null},
  "conditions": {"temperature_K": null, "frequency_Hz": null, "wavelength_nm": null,
                 "mechanical_boundary": "T", "electrical_boundary": null},
  "frame": {"setting": "crystal-physics", "x": "perpendicular to mirror plane", "z": "polar c-axis",
            "handedness": "right", "convention": "unstated", "z_sign_definition": "unstated"},
  "provenance": {"source_id": "kushibiki1999", "doi": "10.1109/58.796136", "locator": "Table IV",
                 "status": "primary-seen", "transcribed": "2026-10-24", "derivation": null},
  "notes": "Free (constant stress) permittivity, measured."
}
```

Tensor payloads add the following fields:
- `independent`: the dict of independent components.
- `voigt`: the 6x6, 3x6 or 6x3 matrix, plus `voigt_convention`.
- `full`: the nested 3x3x3x3 or 3x3x3 array, generated by code.
- `symmetry_form`: the point group and the relation list.
- `consistency`: computed checks, for example eps^T from eps^S + d e.

Dispersion payloads carry the following, and all must reproduce published spot values in CI:
- `formula`: a named form plus a MathML/LaTeX string.
- `coefficients`.
- `lambda_unit`.
- `valid_lambda_um` and `valid_T_C`.
- `reference_T_C`.
- `errata`.
- `check_values`.

### 4.5 Computed endpoints on a static host

| Option | How | Pro | Con |
|---|---|---|---|
| A. Precomputed grids (path-encoded) | Build step writes CSV/JSON for the common T and λ | Works on any static host and for curl and agents | Grid density x models x T grows; keep a fixed small set |
| B. Formula plus coefficients, client-side | `ln.mjs`, plus a Python snippet in each payload | Exact at any (λ, T); tiny files | The agent must execute code |
| C. Edge function | Cloudflare Worker `/api/v1/eval/n/{model}/{lambda_nm}/{T_C}` and an optional MCP server | True "query" API | Second platform; ops burden |

Recommendation: A + B now, C later only if usage justifies it. Path-encoded parameters keep A and C URL-compatible.

---

## 5. Website implications (ranked)

1. **Publish a provenance-first data layer, not a numbers table.** Every value carries variant, boundary condition (S/T, E/D), frame/convention, DOI + locator, and status (P / S / V / C / U). This is the site's differentiator over Wikipedia, vendor sheets and LLM recall, which disagree on density, Tc, alpha_c and d33.
2. **Lead with the two primary-verified, self-consistent sets as defaults:**
   - kushibiki1999 for c^E, e, eps, rho and velocities (eps^T and v_L,z reproduce to <0.1%).
   - Zelmon 1997 CLN, with the 2026 erratum applied to MgO5.
   - Show alternatives (Ogi, Smith & Welsh, Warner, Andrushchak) as a spread, not as one blended number.
3. **Sign-convention explorer as a signature interactive.** Show a 3D crystal with the mirror plane and the polar axis. Toggles for "rotate 180 deg about z" and "flip +z" live-update which tensor components flip sign. Add a warning when a user pairs c14 and p14/p41 from incompatible frames. No PDF can do this, and it fixes a real TFLN modelling error.
4. **Tensor rotation tool for cuts.** X-cut, Y-cut, Z-cut, 128 deg Y-X and arbitrary Euler angles, using the stored full tensors. Exports COMSOL ordering (with the ordering documented) and JSON, and shows effective r, d, e and velocities along a waveguide direction. This builds on the author's 2018 COMSOL orientation notes.
5. **Static API v1** following the Section 4.3 scheme:
   - OpenAPI 3.1, JSON Schema 2020-12, CSV + datapackage.json.
   - llms.txt / llms-full.txt and `.md` twins.
   - Dataset JSON-LD on property pages, UCUM units with QUDT URIs where they exist.
   - robots.txt allowing AI crawlers.
   - Zenodo concept DOI and CITATION.cff, data under CC BY 4.0 (or CC0, an author decision).
6. **Dispersion calculator:**
   - Zelmon, Jundt, Gayer (once the erratum is checked) and Schlarb (once transcribed).
   - Variant and temperature sliders; validity-range shading.
   - QPM period and dn/dT outputs, plus an rii-compatible YAML export.
   - CI tests: negative uniaxial check and spot-value regression.
7. **Clamped vs unclamped explainer.** Show r22 and r51 halving above acoustic resonances and the eps^T vs eps^S gap, with the frequency axis. This links to the modulator pages.
8. **Composition (CLN to SLN) slider** for Tc, Ec ratio, UV edge, ne (Schlarb) and r22, with each curve tied to a source. This needs the gap-list PDFs first.
9. **"Known bad values" page.** Vendor and Wikipedia errors, the Zelmon MgO swap, and the pre-Shoji d scale. Useful to humans and as a negative signal for AI training and grounding.
10. **Close the gaps before launch:**
    - Obtain the Section 2.14 PDFs (weis1985, wong2002, jazbinsek2002, shoji1997, Gayer erratum, schlarb1993, kim1969, leidinger2015, moretti2005).
    - Keep every U row hidden from the public API until it is verified, or publish it with status "unverified" in a separate endpoint.
11. **MCP server on an edge Worker:** later phase, after discovery standards settle. Its tools would read the static JSON.
