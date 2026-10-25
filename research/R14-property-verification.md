# R14: Property verification against primary and handbook sources

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R14, follow-up to R06 (`research/R06-material-properties-data.md`) |
| Scope | Re-check the R06 rows marked S (secondary) or U (unverified) against sources the author holds. Record value, locator, R06 value and status, new status, and whether they match. |
| Method | Text extraction with pypdf, then a check of every quoted table cell against page images rendered at 2x to 4x. Derived numbers (marked C) come from short scripts; the formula is given in each row. One Crossref lookup (no mailto) was made, for APL 73, 3073. |
| Rules | Only individual values are re-keyed here, with a citation for each. No source table is reproduced in its original layout. PDFs are not redistributed. R06 itself is not edited. |
| Limits | The core gap is unchanged: Wong (EMIS 28), Shoji 1997, Zelmon 1997, Jundt 1997, Jazbinsek & Zgonik 2002, Kim & Smith 1969, Moretti 2005, Leidinger 2015 and the Schlarb papers were **not** among the sources held (Section 5). Weis & Gaylord 1985 does **not** tabulate SHG d coefficients. |

## Status codes used here

R06 codes apply (P, P-db, S, V, C, U), plus one new code:

| Code | Meaning |
|---|---|
| P | The cited document was read directly at the locator, and the value originates in it: a measurement, or the document's own definition or rule. |
| P-comp | Read directly in a compilation (weis1985 or volk2008), which gives the original measurement reference. That reference itself was not read. This is one step closer than R06's S, which usually rested on a third-party quote. |

---

## 1. Sources found and read

| ID | Citation | DOI | What was read | Notes |
|---|---|---|---|---|
| weis1985 | R.S. Weis, T.K. Gaylord, "Lithium niobate: summary of physical properties and crystal structure", Appl. Phys. A 37, 191-203 (1985) | 10.1007/BF00614817 | All 13 pages. Tables 1-7 re-checked against page images | Uses the IRE 1949 axis standard (its ref. [9]). Has no SHG d table and no thermal-expansion values |
| ieee176 | IEEE Std 176-1987, IEEE Standard on Piezoelectricity (1988) | 10.1109/IEEESTD.1988.79638 | Foreword; Sec. 3.2.5, 3.2.5.1, 3.3, 3.5; Table 3; Table 5 (p. 18); p. 22 | Lists LiNbO3 as the 3m example in Table 3 |
| volk2008 | T. Volk, M. Wohlecke, Lithium Niobate: Defects, Photorefraction and Ferroelectric Switching, Springer Ser. Mater. Sci. 115 (Springer, 2008) | 10.1007/978-3-540-70766-0 | Ch. 1 (Tables 1.1, 1.2); Sec. 3.2.1; Ch. 6 (Sec. 6.1, 6.2, Table 6.1, Sec. 6.4); Sec. 7.2 (Table 7.1) | A compilation. Its Table 1.1 is described as "order of magnitude, >10% scatter" (p. 3). Locators are printed book pages |
| gayer2008 | O. Gayer, Z. Sacks, E. Galun, A. Arie, Appl. Phys. B 91, 343-348 (2008); erratum Appl. Phys. B 94, 367 (2009) | 10.1007/s00340-008-2998-2; 10.1007/s00340-008-3316-8 | Full paper and erratum | |
| schwesyg2011 | J.R.M.-L. Schwesyg, "Interaction of light with impurities in lithium niobate crystals", Dr. rer. nat. dissertation, Universitat Bonn (2011) | none | Ch. 2-3 (selected) | New source; not in the R06 register |
| crossref | Crossref record for APL 73, 3073 (1998) | 10.1063/1.122676 | Title and authors only | Used to check a citation in volk2008 |

One more local item, the author's 2018 unit-cell mode notes, was checked. It contains no property data, so it does not bear on the r13 sign note in R06 Section 3, row 5.

---

## 2. Row-by-row verification

Columns:
- **R06** is the R06 value and status.
- **New** is the status after this pass.
- **Result** is one of: match; mismatch; partial; new (no R06 value); conflict (sources disagree with each other).

### 2.1 Structure, composition, ferroelectric

| # | Property | Variant | Conditions | Verified value | Unit | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Point group / space group | all | ferroelectric phase | 3m, R3c | | weis1985 p. 192 Sec. 2.1; volk2008 p. 2 | V/S | P | match. **weis1985 prints "C6v" as the Schoenflies symbol; 3m is C3v** (typo in source) |
| 2 | Paraelectric space group | all | above Tc | printed "R3m" | | volk2008 p. 2 | R-3c (No. 167) via Boysen COD | S | conflict. volk2008 gives no reference; keep R06's R-3c from the CIFs |
| 3 | Lattice a, c (hexagonal) | not stated (1966 crystal) | room temperature | 5.148, 13.863 | Angstrom | weis1985 p. 193 and Fig. 6 (W.L. Bond values quoted in Abrahams et al. 1966 pt 3) | 5.148, 13.863 (hsu1997) P-db | P-comp | match |
| 4 | Lattice a, from density | | | 5.150 (calculated from c = 13.863 A and rho = 4628 kg/m^3) | Angstrom | weis1985 p. 194 | | P | new |
| 5 | Rhombohedral a_R, alpha | | | 5.494 A, 55.867 deg | | weis1985 p. 194, Eq. (1) | 5.493(2) A, 55.89(3) deg (hsu1997) | P | match within the hsu1997 uncertainty |
| 6 | Lattice a, c | CLN | room temperature | 515.0, 1386.4 | pm | volk2008 Table 1.1, p. 3 (ref. Furukawa et al., Jpn. J. Appl. Phys. 38, 1816 (1999)) | 5.151, 13.866 A (cti1999) V | P-comp | match (<0.02 A) |
| 7 | Lattice a, c | near-SLN | room temperature | 514.7, 1385.6 | pm | volk2008 Table 1.1, p. 3 (same ref.) | N/A, U | P-comp | new; closes R06 gap 2 at compilation level |
| 8 | Density | CLN | | 4647 | kg/m^3 | volk2008 Table 1.1 (ref. Takanaga, Hirohashi, Kushibiki, Jpn. J. Appl. Phys. 38, 3201 (1999)); the unit is misprinted "g cm^-1" | 4642.8 +- 0.2 (kushibiki1999) P | P-comp | match (0.1%) |
| 9 | Density | near-SLN | | 4635 | kg/m^3 | volk2008 Table 1.1 | | P-comp | new; SLN is lighter than CLN |
| 10 | Density | not stated | | 4628 (used in a cell-volume calculation; no measurement ref.); 4.7e3 (in acousto-optic figures of merit) | kg/m^3 | weis1985 p. 194, p. 201 | range 4628-4650 | P | match. The low end of R06's range is this Weis value |
| 11 | Congruent composition | CLN | | 48.45 mol% Li2O; [Li]/[Nb] = 0.94 (p. 9); R2 = 0.4845 (p. 5). The UV-edge formula uses 48.38 mol% (p. 142) | | volk2008 pp. 4-5, 9, 142 | 48.38 / 48.45 V/S | P-comp | match; volk2008 uses both values |
| 12 | Spontaneous polarization Ps | CLN / near-SLN | room temperature | 71 / 62 | uC/cm^2 | volk2008 Table 1.1 (refs. [22], [24]) | 80 +- 5 (gopalan1998 abstract) P(abs) | P-comp | **mismatch** (11-22%). See note N1 on ref. [24] |
| 13 | Melting point | CLN / near-SLN | | 1255 / "<1200" | C | volk2008 Table 1.1 (ref. Nikogosyan 2005) | 1240-1275 range | P-comp | match (inside the range) |
| 14 | Curie temperature | not stated (Warner sample) | | 1165 | C | weis1985 Table 1, p. 197 | | P-comp | new |
| 15 | Curie temperature | unstated | | "below 1210 C" (text, no ref.) | C | weis1985 p. 192 | | P | new; inconsistent with the 1165 C in its own Table 1 |
| 16 | Curie temperature | CLN / near-SLN | | 1140 / 1206 | C | volk2008 Table 1.1 (refs. Nikogosyan 2005; Chen et al. 2001) | 1142.3 +- 0.7 (cti1999) V; SLN 1213 (Wong via de.wikipedia) S | P-comp | CLN match; **SLN mismatch by 7 C** |
| 17 | Tc vs crystal composition c (mol% Li2O) | | DTA / dielectric | Tc = 39.26 c - 760.67 (Iyi et al., J. Solid State Chem. 101, 340 (1992)); Tc = 39.064 c - 746.73 (Bordui et al., J. Appl. Phys. 71, 875 (1992)) | C | volk2008 Eqs. (6.2), (6.3), p. 140 | | P-comp | new |
| 17a | Tc from row 17 (C) | 48.38 / 48.45 / 50.0 | | Iyi 1138.7 / 1141.5 / 1202.3; Bordui 1143.2 / 1145.9 / 1206.5 | C | computed | | C | cti1999's 1142.3 at 48.38 agrees with Bordui within 1 C. **The SLN value of 1213 C lies above both fits at 50.0 mol%** |
| 18 | Coercive field Ec | CLN | room temperature | 21 (Table 7.1: 210 kV/cm); 21-22 (p. 118: 210-220 kV/cm) | kV/mm | volk2008 Table 7.1, p. 185 (literature average); p. 118 | about 21, U | P-comp | match |
| 19 | Coercive field Ec | SLN | room temperature | 6.0-6.5 (60-65 kV/cm) | kV/mm | volk2008 Table 7.1, p. 185 | about 4-5, U | P-comp | **mismatch**. Also conflicts within volk2008: p. 118 gives "near-stoichiometric Ec about 21-25 kV/cm" (2.1-2.5 kV/mm), citing gopalan1998 |
| 20 | Coercive field Ec | MgO5 | room temperature | Table average 6.0-6.8 (60-68 kV/cm). Individual reports in the text: switching at 4.45 (44.5 kV/cm, 0.5 mm wafer, Kuroda et al.); poling with 2.5 kV/mm pulses (4.8% MgO, 0.3 mm, Mizuuchi et al.) | kV/mm | volk2008 Table 7.1, p. 185; text p. 184 | about 4-5, U | P-comp | **partial**: the table average is above R06; individual reports span 2.5-4.5 |
| 21 | Coercive field Ec | SLN:1% MgO; near-SLN:2% Mg (VTE) | room temperature | 2.5 (25 kV/cm); 1.8 +- 0.2 (18 kV/cm, Chen et al., J. Appl. Phys. 94, 3350 (2003)) | kV/mm | volk2008 Table 7.1; p. 185 | | P-comp | new |
| 22 | Ec ratio CLN / SLN | | | 3.2-3.5 (C, from Table 7.1); "factor of three" (p. 184, ref. Chen et al. 2001) | | volk2008 | about 4-5 (gopalan1998 abstract) | P-comp | **mismatch**: the sources measured different crystals |
| 23 | Internal field Eint | CLN / SLN / MgO5 | | printed "2-33" kV/cm (likely a misprinted range) / tends to 0 / 5 kV/cm | | volk2008 Table 7.1 | about 2.5 kV/mm = 25 kV/cm, P(abs) | P-comp | partial: 25 kV/cm lies inside the printed range; the range itself is suspect |

### 2.2 Thermal and pyroelectric

| # | Property | Variant | Conditions | Verified value | Unit | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|---|---|---|
| 24 | Thermal expansion alpha_a, alpha_c | CLN | 300 K | 14.1e-6, 4.1e-6 | 1/K | volk2008 Table 1.1 (refs. Nikogosyan 2005; Gallagher et al., Ferroelectrics 75, 71 (1987)) | 15e-6 / 7.5e-6 (cti1999, V); dispute over 4-7.5 ppm/K | P-comp | **sides with alpha_c about 4.1 ppm/K**. kim1969 is still unread. weis1985 p. 195 only points to Kim & Smith 1969 and Browder & Ballard 1977, and adds that c contracts from 600 to 1000 C |
| 25 | Thermal expansion alpha_a, alpha_c | near-SLN | 300 K | 14.1e-6, 6.0e-6 | 1/K | volk2008 Table 1.1 | | P-comp | new; alpha_c depends on composition, which may explain part of the R06 spread |
| 26 | Specific heat cp | CLN / near-SLN | room temperature | 628 / 651 | J/(kg K) | volk2008 Table 1.1 (ref. Nakamura et al., J. Cryst. Growth 290, 144 (2006)) | about 628 / 648, V | P-comp | match |
| 27 | Thermal conductivity | CLN / near-SLN | room temperature | 3.92 / 5.97 | W/(m K) | volk2008 Table 1.1 (ref. Nakamura et al. 2006) | about 4.2, V; "no peer-reviewed primary found" | P-comp | match for CLN. **This gives a peer-reviewed attribution** (primary not read). schwesyg2011 Eq. (2.28) uses 5 W/(m K), citing Wong 2002 (S) |
| 28 | Pyroelectric coefficient p3 | not stated | room temperature | -4e-5 | C/(m^2 K) | weis1985 Eq. (2), p. 196 (ref. Savage, J. Appl. Phys. 37, 3071 (1966)) | -8.3e-5 (cti1999) V; about 9.5e-5 (Popescu 2013) S | P-comp | **spread is now 4-9.5e-5 in magnitude** |
| 29 | Pyroelectric coefficient p3 | not stated | room temperature | -6.4e-5 | C/(m^2 K) | schwesyg2011 Eq. (2.17) (ref. Bartholomaus, Buse, Deuper, Kratzig, phys. stat. sol. (a) 142, 55 (1994), "crystals of different compositions") | as above | S | new |
| 30 | Pyroelectric sign | | | p3 < 0 means that on cooling the +c face becomes more positive | | weis1985 p. 196; volk2008 p. 2 | sign "depends on +z convention" | P | match. The sign is fixed once +z is fixed (row 76) |

### 2.3 Refractive index and dispersion

| # | Property | Variant | Conditions | Verified value | Unit | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|---|---|---|
| 31 | no, ne | CLN | 632.8 nm, 24.5 C | 2.2866, 2.2028 | | weis1985 Table 2, p. 197 (ref. Nelson & Mikulyak, J. Appl. Phys. 45, 3688 (1974)) | cti1999 2.2866 / 2.2028 V; Zelmon (C) 2.2865 / 2.2022 | P-comp | match; cti1999 matches Nelson & Mikulyak exactly. Zelmon's ne is 6e-4 lower |
| 32 | no, ne | CLN | 1060 nm, 24.5 C | 2.2323, 2.1561 | | weis1985 Table 2 | Zelmon (C) at 1064 nm: 2.2321 / 2.1555 | P-comp | match within 6e-4 |
| 33 | no, ne | "stoichiometric" (1967 crystal) | 632.8 nm, 25 C | 2.2910, 2.2005 | | weis1985 Table 2 (ref. Boyd, Bond, Carter, J. Appl. Phys. 38, 1941 (1967)) | | P-comp | new; **conflicts with row 34** |
| 34 | no, ne | near-SLN | 633 nm | 2.288, 2.190 | | volk2008 Table 1.2, p. 4 (refs. [26-28]) | | P-comp | new. Generalized-Sellmeier check (C, row 37): 2.2859 / 2.1867 at 50.0 mol%. That supports volk2008's ne; the 1967 crystal may not have been stoichiometric (speculation) |
| 35 | weis1985 Table 2 typo | CLN | 472.7 nm | printed no = "3.3597" (should read 2.3597 from the neighbouring rows) | | weis1985 Table 2 | | P | do not machine-ingest this table without that fix |
| 36 | Gayer 2008 Sellmeier, all 30 a- and b-coefficients | MgO5 (ne, no); MgO1-SLN (ne) | 20-200 C (ne); no reliable only to 1620 nm and about 20-100 C | identical to R06 Section 2.3 | | gayer2008 Table 1, p. 345; validity p. 348 | a-coefficients P-db; b-coefficients S | P | match. The b-coefficients are now P |
| 36a | Gayer erratum content | | | Replaces Fig. 3 (dispersion plot) only. Table 1 is unchanged | | gayer2008 erratum, Appl. Phys. B 94, 367 | "content not seen" | P | resolved |
| 36b | Gayer 1% material label | | | "1% MgO doped stoichiometric LiNbO3 (SLN)"; SHG sample was 1.2% MgO SLN | | gayer2008 Table 1 caption, p. 345 | label conflict (rii comment vs Wikipedia) | P | the Wikipedia label (MgO1-SLN) is correct; the rii "congruent" comment is wrong |
| 36c | Gayer dn/dT (C) | MgO5 ne / MgO5 no / MgO1-SLN ne | 1550 nm, 24.5 C, central difference +-1 C | 2.65e-4 / 1.11e-4 / -7.1e-5 | 1/K | computed from the primary Table 1. Jundt CLN ne gives 3.75e-5 by the same code | anomaly flagged | C | **The anomaly is in the published coefficients, not a transcription error.** A plausible cause (speculation): QPM data constrain dispersion differences, not the wavelength-independent b1 term. Do not use gayer2008 for absolute dn/dT |
| 36d | Zelmon MgO5 o/e swap, early notice | | | gayer2008 states that in Zelmon et al. the no and ne parameters "were switched by mistake" and swaps them for its comparison | | gayer2008 p. 348 | R06 credits the 2026 erratum | P | **new: the swap was noted in print in 2008**, 18 years before the erratum |
| 37 | Generalized (Schlarb) Sellmeier, composition- and dopant-dependent | CLN to SLN; Mg, Zn, In doped | 400-1200 nm; accuracy about 2e-3 | Form and coefficients in note N2 | | volk2008 Eqs. (6.9)-(6.10), Table 6.1, p. 145 (refs. Schlarb et al., Opt. Mater. 4, 791 (1995); Ferroelectrics 185, 269 (1996); Schlarb & Betzler, PRB 50, 751 (1994)) | schlarb1993 coefficients U | S (reproduced in a compilation, not the 1993 paper) | new. Check (C) at 48.38 mol%, 632.8 nm, 24.5 C: no 2.2849, ne 2.2024, against Zelmon 2.2865 / 2.2022, inside the stated 2e-3 |
| 38 | Thermo-optic dno/dT, dne/dT | CLN | 632 nm, T in K (inferred: the Moretti range is 300-515 K) | dno/dT = (-1.7 + 6.9e-3 T) x 1e-5; dne/dT = (-2.6 + 22.4e-3 T) x 1e-5 per K. At 300 K (C): 0.37e-5 and 4.12e-5 | 1/K | schwesyg2011 Eqs. (2.26)-(2.27), quoting moretti2005 | dne/dT 4.89e-5 at 633 nm, 25 C (Jundt, C); dno/dT 0.94e-5 (cti1999, C from V) | S | partial: dne/dT is 16% below Jundt; dno/dT is 2.5x below cti1999. moretti2005 still needed |

### 2.4 Transparency, absorption, conductivity

| # | Property | Variant | Conditions | Verified value | Unit | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|---|---|---|
| 39 | Transparency range | CLN / near-SLN | criterion not stated | 0.32-5 / 0.3-5 | um | volk2008 Table 1.2, p. 4 | "about 0.35-5 um" recommendation | P-comp | match. The criterion is still unstated |
| 40 | UV edge vs composition | CLN to SLN | 22 C; alpha = 20 (or 15) cm^-1; E parallel to c, k perpendicular to c | lambda20 = 320.4 - 1.829 x - 5.485 x^2 nm; lambda15 = 321.9 - 1.597 x - 5.745 x^2 nm; x = (mol% Li2O) - 48.38 | nm | volk2008 Eqs. (6.5)-(6.6), p. 142 (Fig. 6.4 credits kovacs1997) | claimed CLN about 320, SLN about 300-305 nm, U | P-comp | match. C: lambda20 = 320.4 nm (48.38), 317.2 (49.0), 303.0 (50.0) |
| 41 | Residual absorption | CLN, MgO5 | 400-2000 nm, as-grown | up to 0.04 cm^-1 (transition-metal impurities); about 0.001 cm^-1 H-related bands at 2300-2800 nm. Annealing lowers absorption by up to 10x. In 800-2000 nm the method could not resolve peaks; floor about 1e-4 cm^-1 in some ranges | cm^-1 | schwesyg2011 abstract and Sec. 3.1, 3.3 | alpha(1550) U | P | partial: gives bounds, not alpha(1550). leidinger2015 still needed |
| 42 | Dark conductivity sigma_d | undoped or slightly doped CLN | room temperature, extrapolated from high T | 1e-16 to 1e-18 Ohm^-1 cm^-1 (= 1e-14 to 1e-16 S/m); protonic; Ea about 1.1 eV (200-1000 C) | | volk2008 Sec. 3.2.1, pp. 59-60 | N/A, U | P-comp | new. **It is 8-10 orders of magnitude below the bouchy2022 fitted floor of 1e-6 S/m** |
| 42a | Maxwell time tau_M | as row 42 | | volk2008 p. 159 states 5-500 days | | volk2008 p. 159 | | P-comp | new. **Internal inconsistency (C):** tau = eps eps0 / sigma gives 0.3-29 days (eps = 28) or 0.9-86 days (eps = 84) for row 42's sigma |

### 2.5 Electro-optic (pm/V, 633 nm unless stated)

All values below are from weis1985 Table 4, p. 199, unless another source is named. The original reference is in parentheses.

| # | Coefficient | Clamping | Verified values | R06 | New | Result |
|---|---|---|---|---|---|---|
| 43 | r13 | T | **+10.0** (Zook, Chen, Otto, APL 11, 159 (1967)); 10.9 (Smakula & Claspy 1967) | 10 (cti1999) V; 10.0 (Rauber via Veit) S | P-comp | match. **Sign explicitly positive** in weis1985 |
| 44 | r13 | S | **+7.7** (Turner, as cited in Kaminow et al., J. Appl. Phys. 51, 4379 (1980)); 8.6 (Turner, APL 8, 303 (1966)); 6.5 at 3390 nm (Turner 1966) | 9 V; 8.6 S | P-comp | match for 8.6. weis1985 calls the 1980 values "probably the most accurate" (fringing-field corrected) |
| 45 | r22 | T | 6.7 (Lenzo et al. 1966); +6.81 (Zook 1967); 3.3 (Bernal et al. 1966; flagged); 6.7 (Smakula 1967); 5.4 at 1150 nm; 3.1 at 3390 nm | 7 V; 6.8 S | P-comp | match |
| 46 | r22 | S | +3.4 (Turner via Kaminow 1980); 3.4 (Turner 1966); 3.1 at 3390 nm | 3 V; 3.4 S | P-comp | match |
| 47 | r33 | T | +32.2 (Zook 1967); 34.0 (Smakula 1967) | 33 V; 32.2 S | P-comp | match |
| 48 | r33 | S | +28.8 (Turner via Kaminow 1980); 30.8 (Turner 1966); 28 at 3390 nm | 31 V; 30.8 S | P-comp | match for 30.8. The 1980 value of 28.8 is about 7% lower than the 30.8-31 often used in TFLN papers |
| 49 | r51 | T | 32 (Bernal 1966) | 33 V; 32.6 S | P-comp | match |
| 50 | r51 | S | **+18.2** (Kaminow et al. 1980); 28 (Turner 1966); 23 at 3390 nm | 28 V; 28 S | P-comp | **mismatch.** weis1985's preferred value, 18.2, is 35% below the 28 used by cti1999 and Rauber |
| 51 | EO set, compilation | CLN / near-SLN | volk2008 Table 1.2, p. 4: r33, r13, r22 = 32, 10, 6.8 (T) and 31, 8.6, 3.4 (S) for CLN, ref. Nikogosyan 2005. near-SLN (T): 38, 10.4, value absent | as above | P-comp | match; it repeats the same legacy numbers |
| 51a | r22, Yonekura et al., Opt. Rev. 14, 194 (2007) | labelled "constant stress (clamped)" | 6.54 / 6.2 / 6.97 for CLN / CLN:5%Mg / near-SLN:1.8%Mg | volk2008 p. 150 | P-comp | new. **The label contradicts itself: constant stress means unclamped (T).** The magnitude fits T values |
| 51b | Composition and temperature | | Free (T) EO coefficients do not depend on melt composition within +-5% (Turner, Nash, Bridenbaugh 1970); temperature coefficient about 5e-4 /C (Rauber 1978). The minimum of r22 vs composition is near 48.9 mol% (volk2008 p. 150, ref. Abdi et al. 1998) | weis1985 p. 199; volk2008 p. 150 | P-comp | new |
| 51c | Clamped/unclamped relation | | r^T_ij = r^S_ij + p_ik d_jk (k = 1..6) | weis1985 Eq. (13), p. 199 | P | matches R06 pitfall 7 |

No 1550 nm EO value appears in any source held. The longest wavelengths available are 1150 nm (r22^T = 5.4) and 3390 nm. R06 gap 4 remains open.

### 2.6 Second-order nonlinear d

| # | Item | Verified | Source | R06 | New | Result |
|---|---|---|---|---|---|---|
| 52a | weis1985 coverage | No SHG d table in the paper | weis1985 | "U (not read)" | P | gap confirmed: weis1985 cannot settle d33 / d31 |
| 52b | Compilation d values | d33, d31, d22 = 34, 6, 3 pm/V (CLN, 1.06 um); near-SLN 42, 5, 2.5 | volk2008 Table 1.2, p. 4 (ref. Nikogosyan 2005) | cti1999 33 / 5 / 3 (V, "pre-Shoji scale") | P-comp | match with the legacy scale; about 35% above Shoji's 25.2 (abstract). shoji1997 still needed |

### 2.7 Permittivity

Values from weis1985 Table 1, p. 197. Each set is eps11^T, eps33^T, eps11^S, eps33^S, relative.

| # | Original ref. (as listed by weis1985) | Values | R06 | New | Result |
|---|---|---|---|---|---|
| 53 | Warner, Onoe, Coquin, JASA 42, 1223 (1967); Tc 1165 C | 85.2, 28.7, 44.3, 27.9 | ogi2002 Table III attributes 44.0 / 29.0 to Warner | P-comp | **attribution mismatch**: weis1985 gives Warner the pair 44.3 / 27.9 |
| 54 | Savage, J. Appl. Phys. 37, 3071 (1966) | 84, 30, 44, 29 | | P-comp | new. 44 / 29 is the pair ogi2002 (via R06) labels "Warner" |
| 55 | Smith & Welsh, J. Appl. Phys. 42, 2219 (1971) | 84.6, 28.6 (T only) | ogi2002 attributes 44.3 / 27.9 (S) to S&W | P-comp | **attribution mismatch**: weis1985 lists no S values for S&W |
| 56 | Yamada, Niizeki, Toyoda, Jpn. J. Appl. Phys. 6, 151 (1967) | S only: 43.9, 23.7 | | P-comp | new; this is the low end of eps33^S |
| 57 | Teague, Rice, Gerson, J. Appl. Phys. 46, 2864 (1975) | 84.1, 28.1, 46.5, 27.3 | | P-comp | new |
| 58 | volk2008 Table 1.1 (ref. Tomeno & Matsumura, PRB 38, 606 (1988)) | 84, 30, 44, 29 (CLN) | | P-comp | identical to the Savage set |

Spread including kushibiki1999: eps11^T 83.3-85.2; eps33^T 28.1-30; eps11^S 43.9-46.5; eps33^S 23.7-29.

### 2.8 Piezoelectric

| # | Item | Verified | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|
| 59 | d (pC/N): d15, d22, d31, d33 | S&W 1971: 69.2, 20.8, -0.85, 6.0. Warner 1967: 68, 21, -1.0, 6. Yamada 1967: 74, 21, -0.87, 16. (The table unit is 1e-11 C/N) | weis1985 Table 3, p. 198 | S&W set 69.1 / 20.7 / -0.85 / 6.0 (C); cti1999 69.2 / 20.8 / -0.85 / 6.0 (V) | P-comp | match; cti1999 copies S&W exactly. The 16 pC/N value is Yamada 1967 |
| 60 | Hydrostatic dh = 2 d31 + d33 | Measured 6.31 +- 0.014 pC/N (Graham, Ferroelectrics 10, 65 (1976)); confirmed on 9 samples from 5 suppliers (Graham, J. Appl. Phys. 48, 2153 (1977)). Predicted from the Warner / S&W / Yamada sets: 4.0 / 4.3 / 14.5 | weis1985 p. 198 | "d33 least certain, 6-16" | P-comp | new constraint |
| 60a | d33 implied by dh (C) | 6.31 - 2 d31 = 8.0 pC/N (S&W d31) or 8.4 (kushibiki d31). The kushibiki1999 set gives dh = 6.6 (+5%) | computed | d33 6.0 (S&W) vs 8.7 (kushibiki) | C | **The hydrostatic data favour d33 of about 8-9 pC/N (kushibiki1999) over 6.0, and rule out 12.5-16** |
| 61 | Tensor form | d16 = -2 d22; d24 = d15; d32 = d31 | weis1985 Eq. (8) | same | P | match |
| 62 | Sign of d22, d33 | Both positive, by the axis convention | weis1985 p. 198 | | P | match (rows 76-79) |

### 2.9 Elastic

| # | Item | Verified | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|
| 63 | c^E (GPa): c11, c12, c13, c14, c33, c44 | S&W 1971: 203.0, 57.3, 75.2, 8.5, 242.4, 59.5. Warner 1967: 203, 53, 75, 9, 245, 60. Nakagawa et al. 1973: 200, 54, 60, 8, 243, 60. Graham 1977: c11 = 206 +- 3, c33 = 236 +- 2.8 | weis1985 Table 6, p. 200 (unit 1e11 N/m^2) | S&W and Warner rows S (via ogi2002) | P-comp | match for both rows |
| 64 | Temperature coefficients of c^E (1e-4 /C) | S&W: c11 -1.74, c12 -2.52, c13 -1.59, c14 -2.14, c33 -1.53, c44 -2.04 | weis1985 Table 6 | | P-comp | new |
| 65 | s^E (1e-12 m^2/N): s11, s12, s13, s14, s33, s44 | S&W: 5.831, -1.150, -1.452, -1.000, 5.026, 17.10. Warner: 5.78, -1.01, -1.47, -1.02, 5.02, 17.0. Yamada: 5.64, -, -, -0.84, 4.94, - | weis1985 Table 5, p. 200 | kushibiki-inverted 5.854, -1.182, -1.356, -0.920, 5.058, 16.949 (C) | P-comp | consistent (0.4-7%). s14 < 0 goes with c14 > 0, as in R06 |
| 66 | Temperature coefficients of s^E (1e-4 /C) | S&W: s11 1.66, s12 0.28, s13 1.94, s14 1.33, s33 1.60, s44 2.05 | weis1985 Table 5 | | P-comp | new |
| 67 | c14 sign | +8.5 GPa (S&W) in weis1985's IRE frame, the same sign as kushibiki1999 (+7.83) | weis1985 Table 6 | | P-comp | match. See row 81 |
| 68 | 3m forms | s56 = 2 s14, s66 = 2(s11 - s12); c56 = c14, c66 = (c11 - c12)/2; Voigt factor rules (1, 2, 4) from Nye | weis1985 Eqs. (16)-(17), pp. 199-200 | same | P | match; R06 pitfall 6 is now source-checked for s and c |

### 2.10 Photoelastic (strain-optic) p

| # | Item | Verified | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|
| 69 | Set B origin | Avakyants, Kiselev, Shchitkov, Sov. Phys. Solid State 18, 899 (1976): p11 -0.026, p12 +0.090, p13 +0.133, p14 -0.075, p31 +0.179, p33 +0.071, p41 -0.151, p44 +0.146 | weis1985 Table 7, p. 201 | Set B "likely Avakyants 1976", S | P-comp | **match: Set B is Avakyants 1976**, signs included |
| 70 | Coquin set (via Pinnow, Handbook of Lasers 1971) | p11 -0.02, p12 +0.08, p13 +0.13, p14 -0.08, p31 +0.17, p33 +0.07, p41 -0.15, p44 +0.12 | weis1985 Table 7 | | P-comp | new. The rodrigues2023 set looks like a blend of Avakyants and Coquin (observation) |
| 71 | Unsigned sets | Dixon 1967; Lemanov et al. 1971; O'Brien et al. 1970; ref. [53] of weis1985 (1973); Kludzin 1971. All list p13 at 0.126-0.149 and p31 at 0.138-0.178 | weis1985 Table 7 | | P-comp | new; several entries are flagged as wrong in earlier compilations |
| 72 | Indirect (piezo-EO) part | p13(primary) = p13(measured) - 0.043; p33(primary) = p33(measured) - 0.154 (ref. [53] of weis1985). Applying this to Set B gives p33(primary) of about -0.08 (C), so it matters which p33 a model uses | weis1985 p. 201 | "not verified" (R06 Sec. 2.11 note) | P-comp | new; see caveat N3 |
| 73 | p44 antisymmetric part | p44 (= p55) has symmetric and antisymmetric (rotational) parts (Nelson & Lax 1970-71); weis1985 does not resolve them | weis1985 p. 200 | | P | new |
| 74 | 3m form | p56 = p41, p65 = p14, p66 = (p11 - p12)/2, p42 = -p41, p24 = -p14 | weis1985 Eq. (19), p. 201 | same | P | match |
| 75 | Sign pairing with c14 | weis1985 lists Avakyants' signed p14, p41 < 0 alongside S&W c14 > 0, in one paper that states the IRE frame. It does not say it checked Avakyants' own frame | weis1985 Tables 6-7 | "likely sign mismatch" for c14 > 0 with Set B | P-comp | **partial**: the common TFLN pairing (kushibiki c14 > 0 with Set B) matches the weis1985 compilation. Krupych 2014 (c14 > 0 with p14, p41 > 0, via mys2015) disagrees with it in sign. Open until Avakyants 1976 is read |

### 2.11 Sign and axis conventions

| # | Item | Verified | Source + locator | R06 | New | Result |
|---|---|---|---|---|---|---|
| 76 | +z (+c) sense | +c points out of the face that becomes **negative on compression** (IRE 1949). Equivalently, it becomes positive on cooling (Boyd et al. 1964). Third method: cleavage terracing (Kaminow et al. 1980) | weis1985 pp. 192-193 | U | P | resolved for weis1985 |
| 77 | +z, +y in volk2008 | Same rule: compression gives negative charge at +z and +y; cooling gives positive charge at +z. Cites "Standards on Piezoelectric Crystals", Proc. IRE 46, 764 (1958) | volk2008 p. 2 | | P-comp | match |
| 78 | IEEE 176-1987 rule for 3m | +Z: positive d33. +Y: positive d22. +X completes a right-handed system. X lies along an a axis, which for classes with mirrors is perpendicular to a mirror plane | ieee176 Table 5 (p. 18); Sec. 3.2.5; Table 3 (LiNbO3 listed for 3m) | U | P | new |
| 79 | Meaning of positive d33 | Tension along Z (release of compression) makes the +Z face positive; compression makes it negative | ieee176 p. 22 | | P | **IEEE 1987, IRE 1949 (via weis1985) and IRE 1958 (via volk2008) give the same +z and +y for LN** (C, from the rule texts) |
| 80 | IEEE 1987 vs 1949 difference | The stated change is a 180 deg rotation about Z of the right-handed axes, **for quartz (class 32)** | ieee176 Sec. 3.2.5.1 | "differ for some classes" | P | narrowed: no change is stated for 3m |
| 81 | Consequence for R06 pitfall 2 | A 180 deg rotation about z flips d22. So any frame that obeys IEEE / IRE (d22 > 0) has no leftover sign freedom, and c14 > 0 in it (S&W, kushibiki1999, which also gives e22 > 0) | rows 59, 63, 78 | "residual ambiguity" | C | **A frame with c14 < 0 (as in mytsyk2021, with S14 > 0) is non-standard for LN** (inference; confirm against the mytsyk2021 text) |

---

## 3. Summary counts

| Category | Count (rows in Section 2) |
|---|---|
| R06 S/U/V rows now matched at P or P-comp | 29 entries: rows 1, 6, 11, 13, 16 (CLN), 18, 26, 27, 30, 31, 32, 36, 36a, 36b, 39, 40, 43-49, 51, 52b, 59, 63, 69, 76 |
| Mismatches with R06 values | 7: Ps (12); SLN Tc (16); SLN Ec (19); Ec ratio (22); r51^S (50); eps^S attribution (53, 55). Partial: MgO5 Ec (20); dno/dT (38); p-sign pairing (75) |
| New values filling R06 gaps (at P-comp or S) | SLN lattice (7), SLN density (9), thermal conductivity attribution (27), dark conductivity (42), UV-edge formula (40), Schlarb generalized Sellmeier (37), hydrostatic dh (60), temperature coefficients of c and s (64, 66) |
| Source-internal errors found | weis1985 "C6v" (1) and "3.3597" (35); volk2008 density unit (8), "R3m" (2), Ec 21-25 vs 60-65 kV/cm (19), "constant stress (clamped)" (51a), tau_M vs sigma_d (42a), Eint "2-33" (23), APL 73, 3073 citation (N1) |
| Still unverified | Everything in Section 5 |

---

## 4. Notes

- **N1 (citation error in volk2008).** volk2008 cites ref. [24] (K. Kitamura et al., APL 73, 3073 (1998)) for the Ps column of Table 1.1 and for Fig. 7.13, captioned "hysteresis loops in stoichiometric and congruent LiNbO3". Crossref gives that DOI (10.1063/1.122676) the title "Crystal growth and low coercive field 180 deg domain switching characteristics of stoichiometric LiTaO3". This matches R06 Section 1.1, item 8. Either the Fig. 7.13 caption or the citation is wrong. Do not use Fig. 7.13 as an LN hysteresis source.
- **N2 (Schlarb generalized Sellmeier as given in volk2008 Eqs. (6.9)-(6.10) and Table 6.1).**
  - Equation, with lambda in nm and T in C:

    ```
    n^2 = (A0 + A_NbLi c_NbLi + A_Mg c_Mg + A_Zn c_Zn + A_In c_In)
          / ((lambda0 + mu0 [f(T) - f(T0)])^-2 - lambda^-2) + A_UV - A_IR lambda^2
    ```

  - f(T) = (T + 273)^2 + 4.023e5 (coth(261.6/(T + 273)) - 1), with T0 = 24.5 C.
  - c_NbLi = (2/3)(50 - c_Li) - c_Mg/alpha_Mg - c_Zn/alpha_Zn - c_In/alpha_In. The thresholds are 5.0% (Mg), 6.5% (Zn) and 1.5% (In).
  - Coefficients, o then e:
    - lambda0 = 223.219 / 218.203
    - mu0 = 1.1082e-6 / 6.4047e-6
    - A0 = 4.5312e-5 / 3.9466e-5
    - A_IR = 3.6340e-8 / 3.0998e-8
    - A_NbLi = -7.2320e-8 / 1.18635e-6 (printed as 11.8635e-7)
    - A_Mg = -7.3648e-8 / 7.6243e-8
    - A_Zn = 6.7963e-8 / 1.9221e-7
    - A_In = -2.4e-7 / 4.7e-7
    - A_UV = 2.6613 / 2.6613
  - Status S until checked against Schlarb & Betzler 1994 and Schlarb et al. 1995/1996. The row-37 check uses this code.
- **N3 (indirect photoelastic correction).** The magnitude of the indirect term depends on the direction of acoustic propagation (weis1985 p. 201, citing Nelson & Lax). The two offsets are printed without stating that direction. Treat them as an order-of-magnitude warning, not as a correction to apply.
- **N4 (status meaning).** P-comp rows are still one step from the measurement. For a value the site publishes as a headline constant (r33, r51^S, d33, Ec), the underlying paper should still be read (Section 5).

---

## 5. Still needed (not found locally)

Grouped by which open R06 item each source would close. The author may supply PDFs; listed with bibliographic data only.

1. **Wong (ed.), Properties of Lithium Niobate, EMIS Datareviews 28 (INSPEC/IEE, 2002), ISBN 978-0-85296-799-7.** Needed for the r13 sign comparison (R06 pitfall 5) and many cross-checks.
2. **Shoji et al., JOSA B 14, 2268 (1997)**, DOI 10.1364/JOSAB.14.002268. The absolute d table (no local source has a post-1997 d set).
3. **Zelmon, Small, Jundt, JOSA B 14, 3319 (1997)**, DOI 10.1364/JOSAB.14.003319. Primary check of the CLN coefficients (P-db only so far).
4. **Jundt, Opt. Lett. 22, 1553 (1997)**, DOI 10.1364/OL.22.001553. ne(T) coefficients (still S, via Wikipedia).
5. **Jazbinsek & Zgonik, Appl. Phys. B 74, 407 (2002)**, DOI 10.1007/s003400200818. A consistent EO/elasto-optic set, and its sign frame.
6. **Kaminow, Turner, Barns, Bernstein, J. Appl. Phys. 51, 4379 (1980).** Source of r51^S = 18.2 and r13^S = +7.7 (row 50 mismatch).
7. **Avakyants, Kiselev, Shchitkov, Sov. Phys. Solid State 18, 899 (1976).** The frame behind the p14, p41 signs (row 75).
8. **Krupych et al., Appl. Opt. 53, B1 (2014)**, and **Mytsyk et al., Crystals 11, 1095 (2021)** (gold OA). Frame statements for p14, p41 (row 81).
9. **Kim & Smith, J. Appl. Phys. 40, 4637 (1969)**, DOI 10.1063/1.1657244, and **Gallagher et al., Ferroelectrics 75, 71 (1987).** Thermal expansion (rows 24-25).
10. **Moretti et al., J. Appl. Phys. 98, 036101 (2005)**, DOI 10.1063/1.1988987. dn/dT at 1523 nm and the T unit of row 38.
11. **Leidinger et al., Opt. Express 23, 21690 (2015)**, DOI 10.1364/OE.23.021690 (gold OA). alpha(1550 nm).
12. **Schlarb & Betzler, PRB 48, 15613 (1993)** and **PRB 50, 751 (1994)**; **Schlarb et al., Opt. Mater. 4, 791 (1995)**. Primary check of N2.
13. **Smith, Riccius, Edwin, Opt. Commun. 17, 332 (1976)**, with errata 20, 188 (1977).
14. **Kovacs et al., APL 70, 2801 (1997)**, DOI 10.1063/1.119056. Origin of the UV-edge formula (row 40).
15. **Gopalan et al., APL 72, 1981 (1998)** (full text), and **Myers et al., JOSA B 12, 2102 (1995).** Primary Ec values (rows 18-22) and the volk2008 internal conflict.
16. **Furukawa et al., Jpn. J. Appl. Phys. 38, 1816 (1999).** SLN lattice (row 7).
17. **Takanaga, Hirohashi, Kushibiki, Jpn. J. Appl. Phys. 38, 3201 (1999).** Density vs composition (rows 8-9).
18. **Nakamura et al., J. Cryst. Growth 290, 144 (2006).** Thermal conductivity and cp (rows 26-27).
19. **Bartholomaus et al., phys. stat. sol. (a) 142, 55 (1994)** and **Savage, J. Appl. Phys. 37, 3071 (1966).** Pyroelectric coefficient (rows 28-29).
20. **Graham, Ferroelectrics 10, 65 (1976)** and **J. Appl. Phys. 48, 2153 (1977).** Hydrostatic dh (row 60).
21. **Iyi et al., J. Solid State Chem. 101, 340 (1992)** and **Bordui et al., J. Appl. Phys. 71, 875 (1992).** Tc vs composition (row 17).
22. **Chen et al., Opt. Commun. 188, 359 (2001).** Ps and Tc of near-SLN (rows 12, 16, 22).
23. **IRE "Standards on Piezoelectric Crystals, 1949", Proc. IRE 37, 1378 (1949)**, DOI 10.1109/JRPROC.1949.229975. Read only through weis1985 and IEEE 176-1987 here.
24. **Andrushchak et al., J. Appl. Phys. 106, 073510 (2009).** p, c and e for LN and LN:MgO (still S).
