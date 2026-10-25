# 01 The crystal

Manuscript, lane C01, 2026-10-25. Source ids resolve in `refs.yaml`; figure ids in `figures.md`; terms in `glossary.yaml`.

Citation format: `[id; locator; STATUS]`. Status codes (DevLog-004): P = read directly in the cited document at the locator (for "abstract" locators, only the Crossref abstract was read); P-comp = read directly in a compilation (weis1985, volk2008) that names the original measurement, which was not read; P-db = database transcription of a primary source; derived = computed in this lane from cited inputs, method stated; template = display choice, no data; U = unverified, not for display as fact. Book locators for volk2008 are printed page numbers. `[Editor: ...]` marks instructions for integration lanes; they are not page copy.

Sections:

1. The lattice
2. Where the polarization comes from
3. Ferroelectric constants: Ps, Tc, melting
4. Composition: congruent and stoichiometric
5. Intrinsic defects
6. Dopants
7. Symmetry and every tensor
8. Domains, internal field, coercive field
9. Poling and periodic poling
10. Domain walls up close

---

## 1. The lattice

[FIG-01-01 Cell explorer]

### L1

Lithium niobate, LiNbO3, is a crystal that does not occur in nature [weis1985; p. 191; P]. Its oxygen atoms form flat sheets stacked almost like close-packed spheres. Between the sheets sit octahedral holes, each caged by six oxygens. One third of the holes hold lithium, one third hold niobium, and one third are empty, and along the crystal's unique axis c they repeat in the order niobium, empty, lithium [weis1985; pp. 191-192; P].

The crystal has a threefold rotation axis along c and three mirror planes that contain it, 60 degrees apart [weis1985; p. 192, Fig. 3; P]. Nothing else: no inversion centre, no fourfold axis. That short list of symmetries fixes which of its electrical, optical and mechanical responses can exist at all (Section 7).

### L2

| Quantity | Value | Source |
|---|---|---|
| Crystal system, point group | trigonal, 3m (Schoenflies C3v) | [weis1985; p. 192 Sec. 2.1; P]; weis1985 prints "C6v", a typo [note-R14; row 1; P] |
| Space group (ferroelectric phase) | R3c, No. 161 | [weis1985; p. 192; P]; [hsu1997; abstract; P] |
| Hexagonal cell, 293 K | a = 5.148 A, c = 13.863 A, Z = 6 formula units | [hsu1997; COD 2101845; P-db] |
| Hexagonal cell, 24 C | a = 5.14829 A, c = 13.8631 A | [abrahams1966b; COD 1541936; P-db] |
| Hexagonal cell, congruent / near-stoichiometric | a = 515.0 / 514.7 pm; c = 1386.4 / 1385.6 pm | [volk2008; Table 1.1 p. 3, orig. Furukawa et al. 1999; P-comp] |
| c/a | 2.6929 | derived from hsu1997 |
| Cell volume | 318.17 A^3 (hexagonal), 106.06 A^3 (rhombohedral) | derived: V = (sqrt(3)/2) a^2 c |
| Formula units per volume | 1.886 x 10^22 cm^-3 | derived: 6 / V |
| X-ray density | 4629 kg/m^3 (M = 147.842 g/mol) | derived from hsu1997 cell; M from [weis1985; p. 193; P] |
| Measured density | congruent 4642.8 +- 0.2 kg/m^3 | [kushibiki1999; Table IV; P (per note-R06)] |
| Measured density | congruent 4647, near-stoichiometric 4635 kg/m^3 | [volk2008; Table 1.1 p. 3 (unit misprinted "g cm^-1"), orig. Takanaga et al. 1999; P-comp] |
| Rhombohedral cell | a_R = 5.494 A, alpha = 55.87 deg, Z = 2 | derived from hsu1997 with weis1985 Eq. (1); [weis1985; p. 194: 5.494 A, 55.867 deg; P]; [hsu1997; abstract: 5.493(2) A, 55.89(3) deg; P] |
| Nb-O distances | 1.876 A x3, 2.130 A x3 | [hsu1997; CIF bond table via COD 2101845; P-db]; recomputed from all periodic images [cell data `checks`; derived] |
| Li-O distances | 2.063 A x3, 2.245 A x3 | same |
| Six-coordinate ionic radii | Li+ 76 pm, Nb5+ 64 pm | [volk2008; Table 2.1 p. 10, after Shannon and Prewitt; P-comp] |
| Natural cleavage | {01-12}; angle between plane and +c: 32.75 deg measured, 32.7502 deg calculated | [weis1985; p. 194; P]; 32.749 deg from hsu1997 lattice (derived) |

Setting conversion (hexagonal to rhombohedral) [weis1985; Eq. (1); P]:

```
a_R   = sqrt(3 a^2 + c^2) / 3
alpha = 2 arcsin( 3 / (2 sqrt(3 + (c/a)^2)) )
```

Asymmetric unit (hexagonal axes, R3c :H) [hsu1997; COD 2101845; P-db]:

| Atom | Wyckoff | x | y | z |
|---|---|---|---|---|
| Li | 6a | 0 | 0 | 0.2806 |
| Nb | 6a | 0 | 0 | -0.0010 |
| O | 18b | 0.04751 | 0.34301 | 0.0625 |

Cation sequence along +c in the octahedral column at (0, 0) of the hexagonal cell, from the expanded cell: empty z = 0.146, Li 0.313, Nb 0.479, empty 0.646, Li 0.813, Nb 0.979 [cell data `columns_along_c`; derived], i.e. Nb, empty, Li, Nb, ... going up c, as stated by [weis1985; p. 192; P] and drawn as Li-Nb-(empty) chains of face-sharing octahedra by [volk2008; p. 10, Fig. 2.1; P-comp].

The c axis length equals two Nb-Li spacings plus two Li-Nb spacings along the column: 2 x 3.922 A + 2 x 3.010 A = 13.864 A [weis1985; p. 193, Figs. 5-6; P].

### L3

How it is known. The full structure was solved at Bell Labs in 1966 by single-crystal X-ray diffraction (part 3) and neutron diffraction (part 4) at 24 C, with polycrystal X-ray data from 24 C to 1200 C (part 5) [abrahams1966a; abrahams1966b; abrahams1966c; titles via Crossref; P]. The coordinates used here come from a later synchrotron refinement (20 keV, 0.7 A, 293 K, R = 0.015) [hsu1997; COD 2101845 header; P-db]. The cell data file expands the asymmetric unit with all 18 operators of R3c :H, removes duplicates, and locates the empty octahedra as O6 centroids with no cation within 1.0 A (`scripts/gen_cell.py`, data CC BY 4.0).

Settings. Three cells are in use: hexagonal (Z = 6, 30 atoms), rhombohedral (Z = 2, 10 atoms), and the orthohexagonal Cartesian frame used for tensors [volk2008; p. 2; P-comp]. Popular secondary sources mix them; one widely read encyclopedia entry pairs a = 5.1501 A with c = 5.4952 A [note-R06; Sec. 3 pitfall 9; S]. A value of c near 13.86 A is hexagonal; a value near 5.49 A is the rhombohedral edge.

The mirror operations of the space group carry a translation c/2 (operators such as -y, -x, 1/2 + z in the CIF), so in R3c they are c-glide planes; the point group 3m keeps only their rotational part, a mirror [hsu1997 CIF operators; derived]. Weis and Gaylord note that the 3.054 A Nb-Li distance is not perpendicular to c, correcting the 1966 description [weis1985; p. 193; P].

Cleavage: the empty octahedra lie in the {01-12} planes, midway between Li and Nb planes; weak bonding across that vacancy plane is the qualitative explanation [weis1985; p. 194; P]. The angle follows from the lattice alone: tan(phi) = c / (sqrt(3) a) for the plane normal, plane-to-c angle = 90 deg - phi.

---

## 2. Where the polarization comes from

[FIG-01-02 One cell, flipped]

### L1

Above about 1140 C (congruent crystal) the lithium ions sit in the oxygen sheets and the niobium ions sit at the centres of their octahedra; the arrangement looks the same upside down, so it carries no net electric dipole [weis1985; p. 192; P]. On cooling through the Curie temperature both cations shift the same way along c relative to the oxygen frame. Every unit cell now holds a dipole pointing the same way: a built-in polarization, about 0.7 C per square metre of crystal face, that no applied field created [volk2008; Table 1.1 p. 3; P-comp].

The two possible directions, up and down c, are mirror images. A strong enough field pushes lithium back through its oxygen triangle and niobium through the middle of its octahedron, and the crystal's polar axis flips. That reversibility is what makes LiNbO3 a ferroelectric, and what lets engineers write patterns of up and down regions into it (Sections 8-9).

### L2

Displacements from the centrosymmetric reference, computed from the hsu1997 coordinates with the paraelectric positions Nb at z = 0, Li at z = 1/4 and O layers at z = 1/12 + n/6 (R-3c), expressed in three frames (derived):

| Frame | Nb along c | Li along c | O along c |
|---|---|---|---|
| O sublattice fixed | +0.275 A (offset from its O6 centroid) | +0.713 A (height above its O3 plane) | 0 |
| Nb fixed | 0 | +0.438 A | -0.275 A |
| Centre of mass fixed | +0.069 A | +0.507 A | -0.206 A |

Only the relative displacements are physical; the table shows why quoted numbers differ. [volk2008; p. 10; P-comp] quotes Li 44 pm from the oxygen plane and Nb 26-27 pm from the octahedron centre: the Nb value matches the O-fixed frame and the Li value matches the Nb-fixed frame (derived comparison). Total travel on reversal in the O-fixed frame: Nb 0.55 A, Li 1.43 A, through the O3 triangle into the adjacent, previously empty octahedron [derived; inversion of the structure about the Nb O6 centroid].

| Quantity | Value | Source |
|---|---|---|
| Paraelectric space group | R-3c, No. 167 | [boysen1994; COD 2101175-2101185 high-T entries; P-db (per note-R06)]; average structure R-3c with a 10-atom cell [inbar1996; Sec. I; P] |
| Paraelectric Li position | equally probable 0.37 A above or below the O layer (average in the layer) | [weis1985; p. 192, Fig. 1 caption, after Abrahams et al.; P] |
| Li off its regular site at 600 K | about 9% (distributed over Li and empty octahedra); increases with T | [volk2008; p. 13, orig. boysen1994 and Lehnert et al. 1997; P-comp] |
| Double-well depth, coupled Li + O displacement along the soft-mode coordinate | 18.3 mRy (2889 K) per 10-atom cell (LiTaO3: 17.3 mRy) | [inbar1996; Sec. III, Fig. 2b; P] (LAPW frozen-phonon, LDA) |
| Li displacement alone | single anharmonic well; "hardly changes the energy" | [inbar1996; abstract and Sec. III; P] |
| Soft-mode frequency, calculated vs measured | 250 cm^-1 vs 250-275 cm^-1 | [inbar1996; Sec. III; P] |
| Unscreened depolarizing field of a uniformly polarized plate, E = Ps / (eps0 eps33) | 2.9 x 10^9 V/m for Ps = 0.71 C/m^2, eps33 = 28 | derived; Ps [volk2008; Table 1.1; P-comp]; eps33 [weis1985; Table 1; P-comp] |

The last row is why bare polar faces never show it: 2.9 GV/m is about 140 times the coercive field of congruent material (21 kV/mm, Section 8), so surface charge from the surroundings or from internal conduction screens Ps almost completely; only changes of Ps (pyroelectric, piezoelectric) appear as charge (derived comparison).

### L3

Displacive or order-disorder. Weis and Gaylord class LiNbO3 with displacive ferroelectrics such as BaTiO3 [weis1985; p. 192; P]. Inbar and Cohen review conflicting experimental claims for both pictures and find, from first principles, a double well 2889 K deep, far deeper than kTc, which they read as order-disorder character, driven by oxygen-lithium coupling and strong Nb d - O p hybridization, the same family of mechanism as in the perovskites [inbar1996; abstract, Secs. I and III; P]. Neutron diffraction at high temperature sees lithium distributed over split positions [volk2008; p. 13; P-comp]. The debate is open. [Editor: FIG-01-02 draws the computed well depth with a template shape.]

Charge density. A synchrotron deformation-density analysis computes Ps = 0.43 C/m^2 from Hirshfeld charges against 0.71 C/m^2 measured, and reports electron density transferred from Nb toward the large O3 triangle near Li [hsu1997; abstract; P]. Point-charge estimates of Ps depend on the charge partition. [Editor: display measured Ps only.]

Why the switching animation is a cartoon at the atomic scale. The coercive field (about 21 kV/mm) does not remove a 2889 K per-cell barrier; real reversal proceeds by nucleation at surfaces and sideways motion of domain walls (Section 8). [Editor: FIG-01-02 caption states this.]

---

## 3. Ferroelectric constants: Ps, Tc, melting

[Shown on the temperature axis of FIG-01-03]

### L1

LiNbO3 keeps its polarization up to about 1140 C in the usual congruent crystal and about 1206 C in near-stoichiometric crystal; congruent crystal melts at 1255 C, only 115 degrees higher [volk2008; Table 1.1 p. 3; P-comp]. That high Curie temperature is why the polarization of a commercial wafer is, for practical purposes, permanent: no device processing step comes close.

### L2

| Quantity | Congruent | Near-stoichiometric | Source |
|---|---|---|---|
| Spontaneous polarization Ps, room temperature | 71 uC/cm^2 | 62 uC/cm^2 | [volk2008; Table 1.1 p. 3; P-comp]; the SLN column cites an LiTaO3 paper (see L3) |
| Ps (P-E loop) | 71 uC/cm^2 | | [volk2008; p. 181, Gopalan group; P-comp]; "experimental 0.71 C/m^2" [hsu1997; abstract; P] |
| Ps (P-E loop) | 80 +- 5 uC/cm^2, "relatively insensitive" to stoichiometry and hydrogen | same | [gopalan1998; abstract; P] |
| Curie temperature Tc | 1140 C | 1206 C | [volk2008; Table 1.1 p. 3; P-comp] |
| Tc, 48.38 mol% Li2O | 1142.3 +- 0.7 C | | [cti1999; data sheet; V] |
| Tc in weis1985 | "approximately 1210 C" in text; 1165 C for one listed sample | | [weis1985; p. 191 and Table 1; P]; internally inconsistent [note-R14; rows 14-15] |
| Melting point | 1255 C | printed "<1200 C" | [volk2008; Table 1.1 p. 3; P-comp]; printed SLN value lies below its own SLN Tc (see open questions) |
| Pyroelectric sign | p3 < 0: on cooling the +c face becomes more positive | | [weis1985; p. 196 Eq. (2); P] |

Tc as a composition gauge (c = Li2O content of the crystal, mol%; Tc in C):

```
Tc = 39.26 c - 760.67     (DTA, 4 crystals, chemical analysis)   [iyi1992 via volk2008 Eq. (6.2), p. 140; P-comp]
Tc = 39.064 c - 746.73    (dielectric, 5 VTE crystals)           [bordui1992 via volk2008 Eq. (6.3), p. 140; P-comp]
```

| c (mol% Li2O) | Tc, Iyi fit | Tc, Bordui fit |
|---|---|---|
| 48.38 | 1138.7 C | 1143.2 C |
| 48.45 | 1141.5 C | 1145.9 C |
| 49.00 | 1163.1 C | 1167.4 C |
| 50.00 | 1202.3 C | 1206.5 C |

(derived from the two fits). Slope: 39 C per mol% Li2O; across the room-temperature solid-solution range Tc changes by about 150 C [volk2008; p. 140; P-comp].

### L3

Tc is measured by differential thermal analysis or by the dielectric peak; its closeness to the melting point is the method's drawback [volk2008; p. 140; P-comp]. Weis and Gaylord call Tc "a very reliable and accurate indicator" of composition [weis1985; p. 194; P]. The two fits differ by 4 C, i.e. 0.1 mol% [volk2008; p. 141; P-comp]. A neutron study puts Tc near 1430 K for an unstated composition [boysen1994; abstract via note-R06; P].

Disagreement on Ps. Reported values span 62 to 85 uC/cm^2. volk2008 cites, for the Ps column of its Table 1.1, a 1998 APL paper whose Crossref title concerns stoichiometric LiTaO3 [kitamura1998; Crossref title; P], so the 62 uC/cm^2 SLN entry has no LN source on record [note-R14; note N1]. gopalan1998, measured on both compositions, reports 80 +- 5 uC/cm^2 and no composition dependence. [Editor: display Ps as the range 0.71-0.80 C/m^2 with both sources; compute with 0.71 C/m^2 where one number is needed and state the choice; open question A1.]

---

## 4. Composition: congruent and stoichiometric

[FIG-01-03 Composition dial]

### L1

"LiNbO3" is a range, not a formula. The crystal is stable from roughly 47 to 50 mol% Li2O, always on the lithium-poor side of the ideal 50% [volk2008; p. 10; P-comp]. When the melt and the growing crystal have the same composition, the crystal grows uniform from seed to tail. For LiNbO3 that congruent point is about 48.4-48.5 mol% Li2O, a lithium-to-niobium ratio of 0.94 [volk2008; pp. 4, 10; P-comp], so in nearly every commercial crystal about one lithium site in twenty holds no lithium (derived, Section 5).

Removing that deficit changes the crystal: Curie temperature up by about 60 C, ultraviolet absorption edge moves about 17 nm toward shorter wavelengths, the field needed to flip the polarization falls several-fold, and the built-in bias field disappears (Sections 3, 8). Stoichiometric crystal cannot simply be pulled from a stoichiometric melt; it needs one of the special growth methods below.

### L2

| Quantity | Value | Source |
|---|---|---|
| Phase diagram Li2O-Nb2O5 | Reisman and Holtzberg 1958 | [reisman1958; Crossref title; P] |
| Congruent composition | 48.45 mol% Li2O, [Li]/[Nb] = 0.94 | [volk2008; pp. 4, 10; P-comp] |
| Congruent composition | 48.6 mol% Li2O; room-temperature solid solution 48-50 mol% | [carruthers1971; abstract; P] |
| Congruent composition | Li/Nb mole ratio 0.946 | [weis1985; p. 197; P] |
| Congruent composition | C = Li2O/(Li2O + Nb2O5) = 0.484 | [gopalan1998; abstract; P] |
| Congruent composition | 48.38 +- 0.01 mol% | [cti1999; V]; also the reference point of the UV-edge formula [volk2008; p. 142; P-comp] |
| Solid-solution width | about 6 mol% above 1150 C; diffuse liquidus maximum at about 48.45 mol% | [volk2008; p. 4; P-comp] |
| Required uniformity for optics | [Li]/[Nb] fixed within 10^-3 | [volk2008; p. 5; P-comp] |
| Melt to crystal | c = 48.5 + 0.3436 (c_melt - 48.5) - 0.02897 (c_melt - 48.5)^2, valid 45 < c_melt < 52 mol%, +-0.3 mol% | [volk2008; Eq. (6.1) p. 140; P-comp] |

Composition ratios used in the literature: R1 = [Li]/[Nb], R2 = [Li]/([Li] + [Nb]) = c/100 (derived identity). At c = 48.45 mol%, R1 = 0.940 (derived). volk2008 prints R1 = 0.969 next to R2 = 0.4845 on p. 5, inconsistent with its own 0.94 on p. 10 (derived check; see open questions).

UV absorption edge vs composition, 22 C, E parallel to c, k perpendicular to c, x = c - 48.38 mol% [volk2008; Eqs. (6.5)-(6.6) p. 142, calibration of kovacs1997; P-comp]:

```
lambda_20 = 320.4 - 1.829 x - 5.485 x^2   nm   (absorption 20 cm^-1)
lambda_15 = 321.9 - 1.597 x - 5.745 x^2   nm   (absorption 15 cm^-1)
```

lambda_20 = 320.4 nm (48.38), 317.2 nm (49.0), 311.5 nm (49.5), 303.0 nm (50.0) (derived). Above 49.5 mol%, 0.1 mol% maps to about 2 nm [volk2008; p. 142; P-comp].

Growth routes to near-stoichiometric LiNbO3 (all reported 1992-1997):

| Method | Principle | Reported parameters | Source |
|---|---|---|---|
| Vapor transport equilibration (VTE) | crystal plate and Li-rich powder in one Pt crucible, no contact; Li diffuses in | > 1000 C for days; plates < 1 mm, up to 3 mm reported; "extremely slow lithium diffusivity" for Li-poor targets | [volk2008; p. 6; P-comp]; [bordui1992; abstract; P] |
| Double-crucible Czochralski (DCCZ) | pull from an Li-rich inner melt (about 58-60 mol% Li2O) in equilibrium with near-stoichiometric solid; stoichiometric powder fed continuously to the outer crucible, weight-controlled | | [volk2008; p. 7, Fig. 1.3; P-comp]; [kitamura1992; Crossref title; P] |
| Growth from K2O-containing melt | melt with up to 10% K2O; negligible K in crystal; compositions 49.95 mol% or more | | [volk2008; p. 6; P-comp]; [malovichko1993; Crossref title; P] |
| Top-seeded solution growth (TSSG) | same chemistry treated as a high-temperature solution | boules 20 mm diameter | [volk2008; p. 6; P-comp]; [polgar1997; Crossref title; P] |

### L3

How composition is measured. Non-optical: chemical analysis, Tc, density, NMR and EPR linewidths, diffraction. Optical: UV edge, OH-band shape, Raman linewidths, phase-matching temperature; optical methods reach 0.1 mol% absolute and about 0.01 mol% relative accuracy [volk2008; p. 7; P-comp]; [kovacs1997; abstract; P]. The UV-edge method needs a reflection correction of about 1 nm and fails when an impurity such as Fe absorbs near the edge [volk2008; pp. 142-143; P-comp]. For near-stoichiometric crystal the intensity ratio of the OH components at 3480 and 3465 cm^-1 decreases linearly with Li2O from 49.7 to 50 mol% [volk2008; p. 143; P-comp].

Why "48.38 vs 48.45 vs 48.6". The congruent point depends on how the melt composition was determined, and on the oxygen content of the Nb2O5 feedstock, which may be oxygen-deficient [volk2008; p. 5; P-comp]. [Editor: prose uses "about 48.4-48.5 mol%"; tables give each value with its source.]

---

## 5. Intrinsic defects

[FIG-01-04 Defect and polaron gallery; texture motif: Li-vacancy lattice (DevLog-003b Sec. 7)]

### L1

Where does the missing lithium go? Not into missing oxygen: as-grown LiNbO3 has essentially no oxygen vacancies, unusual for an oxide [volk2008; p. 10; P-comp]. Instead some niobium ions sit on lithium sites (antisites), and charge balance is restored by empty lithium sites. In congruent crystal about 1 in 100 lithium sites holds a niobium and about 4 in 100 are empty [volk2008; p. 12, orig. iyi1992; P-comp].

These few percent of misplaced ions matter far beyond their number. An electron captured by a niobium antisite stays put, dressed by the lattice distortion it causes: a small polaron with its own near-infrared absorption band. Antisites trap the charge behind optical damage, set the built-in bias field, and raise the coercive field (Sections 6, 8).

### L2

Compensation models, written per formula unit, x = antisite fraction [volk2008; Eqs. (2.5)-(2.6) pp. 12-13; P-comp]:

```
Li-site vacancy model:  [Li(1-5x) Nb_Li(x) V_Li(4x)] Nb O3            (1 Nb_Li^4+ compensated by 4 V_Li^-)
Nb-site vacancy model:  [Li(1-5x) Nb_Li(5x)] [Nb(1-4x) V_Nb(4x)] O3   (5 Nb_Li^4+ compensated by 4 V_Nb^5-)
```

Both give R2 = (1 - 5x)/(2 - 4x), so x = (1 - 2 R2)/(5 - 4 R2) (derived). Fractions of Li sites:

| c (mol% Li2O) | x | Li-site model: Nb_Li / V_Li | Nb-site model: Nb_Li / V_Nb (of Nb sites) |
|---|---|---|---|
| 48.38 | 0.0106 | 1.06% / 4.23% | 5.29% / 4.23% |
| 48.45 | 0.0101 | 1.01% / 4.05% | 5.06% / 4.05% |
| 49.00 | 0.0066 | 0.66% / 2.63% | 3.29% / 2.63% |
| 49.50 | 0.0033 | 0.33% / 1.32% | 1.66% / 1.32% |
| 50.00 | 0 | 0 / 0 | 0 / 0 |

(derived). At 48.45 mol% the Li-site model gives 1.9 x 10^20 Nb_Li per cm^3 (derived, with 1.886 x 10^22 formula units per cm^3).

| Observation | Value | Source |
|---|---|---|
| Nb on Li sites, X-ray (Abrahams and Marsh) | 4.9% of Li sites (supports Nb-site model) | [volk2008; p. 12, orig. abrahams1986; P-comp] |
| Nb on Li sites, X-ray + neutron (Iyi et al.) | about 1% Nb_Li, about 4% empty Li sites (supports Li-site model) | [volk2008; p. 12, orig. iyi1992; P-comp] |
| Formation energies (atomistic simulation), per reaction: Li2O out-diffusion compensated by V_Li + Nb_Li / by V_Nb + Nb_Li / by (Nb_Li-V_Nb) clusters | 4.56 / 15.17 / 10.67 eV | [volk2008; p. 12, orig. donnerberg1989; P-comp] |
| Density rises as Li content falls | consistent only with Nb entering Li sites | [volk2008; p. 11, orig. lerner1968; P-comp] |

Electron and hole centres (polaron model) [volk2008; pp. 14-23; P-comp unless stated]:

| Centre | Notation | Optical band | Other signature |
|---|---|---|---|
| Bound small polaron | Nb_Li^4+ (electron on an antisite) | about 1.6 eV (about 770 nm) | 10-line 93Nb hyperfine EPR, g_perp = 1.72, g_par = 1.9 |
| Free small polaron | Nb_Nb^4+ (electron on a regular Nb) | about 0.95 eV (about 1300 nm), seen in reduced crystals with Mg above threshold | no EPR under low-temperature illumination |
| Bipolaron | (Nb_Li-Nb_Nb)^2- electron pair | about 2.5 eV (about 500 nm), the colour of chemically reduced crystal | diamagnetic; dissociation energy about 0.3 eV |
| Bound hole polaron | O^- next to a Li vacancy | broad, peak about 500 nm | EPR, trapped-hole g between 2.002 and 2.047 |
| Laser-pulse-induced IR band | assigned to Nb_Li^4+ | 740 nm (1.67 eV), composition independent | [herth2005; via volk2008 p. 22; P-comp] |

Wavelengths in this table are hc/E, derived. Polaron stabilization energy about 0.3 eV, phonon energy about 0.1 eV used in band-shape fits [volk2008; p. 18; P-comp]. Nb_Li^4+ lifetime at room temperature: microseconds in congruent crystal, 10-100 ms near stoichiometry, up to seconds in Li-enriched Mg-doped crystal [volk2008; p. 21; P-comp]; formation within 400 fs [volk2008; p. 22, orig. Beyer et al.; P-comp]. GRIIRA (green-induced infrared absorption) shares the MgO threshold of photorefraction and is assigned to the Nb_Li polaron [furukawa2001; abstract; P].

Hydrogen. Hydrogen enters from the atmosphere during or after growth and sits as OH^- on oxygen sites [volk2008; p. 24; P-comp].

| Quantity | Value | Source |
|---|---|---|
| OH stretch band, congruent | strong peak 3482 cm^-1 (2.87 um), weaker 3467 cm^-1 (2.88 um); FWHM about 32 cm^-1 | [volk2008; p. 24; P-comp] |
| Polarization | absorption for ordinary light much larger than extraordinary: O-H bond vibrates in the plane perpendicular to c | [volk2008; p. 24; P-comp] |
| Near-stoichiometric | narrows; 3466 cm^-1 | [volk2008; p. 25 and Table 2.4 p. 49; P-comp] |
| Concentration | c_H = 2 x 10^18 cm^-2 x alpha(2.87 um); as-grown alpha = 1-2 cm^-1, i.e. about 10^18 cm^-3 (other estimates 3-6 x 10^19 cm^-3) | [volk2008; p. 26; P-comp] |
| Dark conductivity carrier | protons, single activation energy about 1.1 eV from 200 to 1000 C | [volk2008; p. 59; P-comp] |

### L3

The model debate. Two diffraction studies of congruent crystal disagree on where the excess Nb compensation sits: Abrahams and Marsh (1986) and Iyi et al. (1992). volk2008 calls the Li-site vacancy model "commonly accepted" and notes a third reading, that the degree of filling depends on growth conditions so all three faults (Nb_Li, V_Li, V_Nb) coexist [volk2008; p. 13, orig. Wilkinson et al. 1993; P-comp]. The two models predict identical composition and differ in density and site occupancies, which is why the decision came from occupancy refinement plus NMR, not from chemistry [volk2008; pp. 12-13; P-comp]. [Editor: the background texture draws the Li-site model and its popup says so.]

Kroeger-Vink notation: a prime is negative and a bullet positive charge relative to the host site; many authors write - and + instead [volk2008; p. 12; P-comp]. Nb_Li^4bullet denotes Nb5+ on an Li+ site (four excess positive charges).

Reduction and the test for antisites. Annealing in vacuum or hydrogen at 400-600 C creates bipolarons; low-temperature illumination converts them into Nb_Li^4+ with the 1.6 eV band and the 10-line EPR, which serves as a spectroscopic test for antisites; above 600 C oxygen vacancies do form and complicate the picture [volk2008; pp. 16-20; P-comp]. An alternative reading of the visible band in terms of oxygen vacancies "has not been completely ruled out" [volk2008; p. 17; P-comp]. The polaron review of Schirmer et al. is the primary reference for band shapes [schirmer2009; Crossref title; P]; its numbers were not read in this lane.

High temperature. The room-temperature defect picture does not hold at high temperature; Li disorder grows (Section 2). A synchrotron study finds a small fraction of Li on the vacant octahedra even in stoichiometric crystal at room temperature [volk2008; p. 13, orig. Etschmann et al. 2001; P-comp].

---

## 6. Dopants

[FIG-01-05 Threshold explorer]

### L1

Most foreign ions in LiNbO3 take a lithium site, whatever their charge, because the lithium octahedron is the larger one [volk2008; p. 28; P-comp]. Iron is the famous troublemaker: it switches between Fe2+ and Fe3+, donates electrons under visible light and holds them in the dark, which writes light patterns into the refractive index (Chapter 04).

Magnesium does the opposite. Above about 5 mol% MgO in congruent crystal, optical damage drops by more than a hundredfold [volk2008; p. 34; P-comp]. The magnesium displaces the niobium antisites that trap charge [volk2008; p. 38; P-comp] and raises the photoconductivity a hundredfold, so light-induced fields leak away before they can grow [bryan1984; abstract; P]. Zinc, indium, scandium, hafnium and zirconium act the same way, each above its own threshold [volk2008; p. 35; P-comp].

### L2

Damage-resistant dopants (congruent crystal unless stated):

| Dopant | Threshold | Source |
|---|---|---|
| MgO, first report | damage reduced at 4.6% Mg | [volk2008; p. 34, orig. zhong1980; P-comp]; publication date 1980-06 [note-R07; Sec. 1.3; P] |
| MgO | >= 4.5 at.% MgO; photoconductivity up 100x, Glass current unchanged; activation energy 0.1 eV vs 0.5 eV | [bryan1984; abstract; P] |
| MgO | about 5 mol% MgO in the congruent melt; 5.5% "close to the Nb_Li content" | [volk2008; pp. 34, 38; P-comp] |
| MgO, melt [Li]/[Nb] = 1.2 | lowered to 3% | [volk2008; p. 35; P-comp] |
| MgO, near-stoichiometric ([Li]/[Nb] = 0.993) | > 0.78 mol%: no measurable photorefractive damage at 532 nm up to 2 MW/cm^2 | [furukawa2000; abstract; P] |
| MgO, near-stoichiometric (other reports) | 1-2%; about 1%; 0.67 mol% (TSSG); 0.2 mol% | [volk2008; p. 43; P-comp] |
| ZnO | about 7 mol% (6 mol% in one report); 7.5% "the largest threshold" | [volk2008; pp. 35, 40; P-comp] |
| In2O3, Sc2O3 | below 2 mol% oxide (4 at.%) in the melt | [volk2008; p. 35; P-comp] |
| HfO2, ZrO2 | below 2 mol% | [volk2008; p. 35; P-comp] |

Site occupancy with Mg (Li-site vacancy compensation; one proposed scheme) [volk2008; Table 2.2 p. 39, orig. iyi1995; P-comp]:

| MgO (%) | Formula |
|---|---|
| 0 | [Li0.95 Nb0.01 V0.04] Nb O3 |
| 3.0 | [Li0.94 Mg0.03 V0.03] Nb O3 |
| 8.0 | [Li0.84 Mg0.08 V0.08] Nb O3 |

| Threshold signature | Below | Above | Source |
|---|---|---|---|
| OH band, Mg ([Li]/[Nb] = 0.945) | 3484 cm^-1 (< 4.5% MgO) | 3534 cm^-1 (> 4.5% MgO) | [volk2008; Table 2.4 p. 49; P-comp] |
| OH band, Zn | 3484 cm^-1 (< 7% Zn) | 3506, 3535 cm^-1 | same |
| OH line, Mg | 2.87 um | 2.83 um | [bryan1984; abstract; P] |
| Fe3+ EPR with Mg or Zn | Li-site axial spectrum | new isotropic line above 5.5% MgO or 7% ZnO; Fe3+ on Nb sites deduced | [volk2008; p. 45; P-comp] |

Other effects of damage-resistant dopants: Tc and density increase, UV edge shifts to shorter wavelength, noncritical phase-matching temperature rises; no new absorption within 0.35-4 um [volk2008; pp. 36-37; P-comp]. Distribution coefficient 1.2-1.3 at low concentration, about 1 for MgO and ZnO at 5-6 mol% [volk2008; p. 42; P-comp]. Zn in the crystal vs melt: c_crys = 1.649 c_melt - 0.082 c_melt^2 [volk2008; p. 43, orig. Schlarb et al.; P-comp].

Photorefractive and spectroscopic dopants:

| Ion | Site and states | Spectroscopy | Source |
|---|---|---|---|
| Fe | Fe2+ and Fe3+ on Li sites (congruent); [Fe2+]/[Fe3+] = 0.1-0.2 as grown, set by oxidation-reduction anneals | Fe2+ to Nb5+ intervalence band at 2.6 eV (oscillator strength 10^-2); Fe2+ d-d at 1.1 eV (4 x 10^-4); O to Fe3+ charge transfer at 3.1 eV | [volk2008; pp. 28-29; P-comp] |
| Fe, near-stoichiometric | partial Fe3+ on Nb sites proposed from EPR; disputed | | [volk2008; p. 30; P-comp] |
| Fe, Cu photovoltaic (Glass) constants | 2.8 x 10^-9 and 5.5 x 10^-10 cm/V | saturated photovoltaic fields 10^4-10^5 V/cm | [volk2008; p. 59; P-comp] |
| Ti | Ti4+ substitutes for Li (congruent); Ti3+ EPR at Li sites independent of [Li]/[Nb]; with 6% Mg, Ti3+ mainly on Nb sites | | [volk2008; p. 47; P-comp] |
| Er | Er3+ on Li sites; site-selective spectroscopy resolves at least 11 centres in SLN:Er and 13 in CLN:Er, narrower lines in SLN | lanthanides sit 30-50 pm off-centre in the Li octahedron | [volk2008; pp. 32-34; P-comp] |
| Cr | Cr3+ on Li sites in low-doped congruent crystal; not photovoltaic-active | | [volk2008; pp. 27, 31, 59; P-comp] |

### L3

Two mechanisms for the threshold, both partly right according to volk2008. (1) Mg fills Li vacancies and replaces Nb_Li until the antisites are gone; the threshold scales with the antisite content and falls with Li enrichment [volk2008; p. 38; P-comp]. (2) Diffraction on Zn- and In-doped crystal shows that near and above threshold the dopant begins to occupy Nb sites; volk2008 calls this association of the threshold with partial Nb-site incorporation "unambiguous" [volk2008; p. 40; P-comp]. Whether antisites vanish at the threshold or at a lower "first threshold" is open; one energetic analysis finds the two-step scheme unfavourable and simultaneous substitution more likely [volk2008; p. 39, orig. Donnerberg 1996; P-comp].

Units trap. MgO content is written either as MgO/(Li2O + MgO + Nb2O5) or as MgO/(LiNbO3 + MgO); for usual concentrations the second is about twice the first [volk2008; pp. 36-37; P-comp]. Melt vs crystal concentrations also differ through the distribution coefficient. [Editor: store dopant concentrations with an explicit `basis` field; request D1.]

Ti in-diffusion at 950-1020 C inverts the polarization of a surface layer on the +c face only [miyazawa1979; abstract; P]; [volk2008; p. 177; P-comp]. Waveguide fabrication belongs to Chapter 05.

---

## 7. Symmetry and every tensor

[FIG-01-06 Neumann machine; FIG-01-07 Which face is +z]

### L1

A crystal property can have no less symmetry than the crystal. This is Neumann's principle, stated in 1833 [weis1985; p. 198; P]. For LiNbO3 it means every response must look the same after a 120 degree turn about c and after reflection in any of the three mirror planes. Most conceivable coefficients fail that test and are exactly zero; the survivors are tied together in fixed ratios.

Consequences you can see: the crystal has one optic axis, along c, so light travelling along c sees one index whatever its polarization; along any other direction it splits in two (Chapter 02). Heating or cooling puts charge only on the c faces. Compression along any axis never charges the x faces, which are perpendicular to a mirror plane [weis1985; p. 195; P].

### L2

Axes for tensors (IRE 1949 / IEEE 176-1987, as used by weis1985 and volk2008):

| Axis | Rule | Source |
|---|---|---|
| z | parallel to c, the threefold axis | [weis1985; p. 195; P] |
| x | along one of the equivalent a axes, perpendicular to a mirror plane; non-polar | [weis1985; p. 195; P]; [ieee176; Sec. 3.2.5, Table 5; P (per note-R14)] |
| y | completes a right-handed set; lies in a mirror plane | [weis1985; p. 195; P] |
| +z sense | the c face that becomes negative on compression; equivalently positive on cooling; third test: cleavage terracing | [weis1985; pp. 192-193; P]; [volk2008; p. 2; P-comp] |
| +y sense | the y face that becomes negative on compression | [weis1985; p. 195; P] |
| IEEE 176-1987 | +Z gives positive d33, +Y positive d22 | [ieee176; Table 5 p. 18; P (per note-R14)] |

Forms allowed in point group 3m (Voigt contraction 11->1, 22->2, 33->3, 23->4, 13->5, 12->6):

| Property | Rank | Non-zero pattern | Independent | Source |
|---|---|---|---|---|
| Pyroelectric p | 1 | (0, 0, p3) | 1 | [weis1985; Eq. (2); P] |
| Permittivity | 2 | diag(e11, e11, e33) | 2 | [weis1985; Eq. (4); P] |
| Any other symmetric rank-2 property (impermeability, thermal expansion, thermal conductivity) | 2 | diag(t11, t11, t33) | 2 | derived (Neumann's principle, same group action) |
| Piezoelectric d (3 x 6) | 3 | d15 = d24, d16 = -2 d22, d21 = -d22, d31 = d32, d33 | 4 | [weis1985; Eq. (8); P] |
| Linear electro-optic r (6 x 3) | 3 | r13 = r23, r33, r22 = -r12 = -r61, r42 = r51 | 4 | [weis1985; Eq. (12); P] |
| Elastic stiffness c (6 x 6) | 4 | c11, c12, c13, c14, c33, c44; c24 = -c14, c56 = c14, c66 = (c11 - c12)/2 | 6 | [weis1985; Eqs. (16)-(17); P] |
| Elastic compliance s (6 x 6) | 4 | as c, but s56 = 2 s14, s66 = 2 (s11 - s12) | 6 | [weis1985; Eq. (16); P] |
| Photoelastic p (6 x 6) | 4 | p11, p12, p13, p14, p31, p33, p41, p44; p42 = -p41, p24 = -p14, p56 = p41, p65 = p14, p66 = (p11 - p12)/2 | 8 | [weis1985; Eq. (19); P (per note-R14 row 74)] |

The factors 2 in d16, s56, s66 come from the contraction (engineering shear strain), not from the crystal [weis1985; pp. 199-200; P]. Neumann's principle must be applied to the full tensor, then contracted [weis1985; p. 198; P].

| Example of the result | Value | Source |
|---|---|---|
| Optic axis | c; negative uniaxial: n_o = 2.2866, n_e = 2.2028 at 632.8 nm, 24.5 C, congruent | [weis1985; Table 2, orig. Nelson and Mikulyak 1974; P-comp] |
| Signs fixed by axis rules | d22 > 0 and d33 > 0 | [weis1985; p. 198; P] |

### L3

Why x is not polar: x is perpendicular to a mirror plane, so any charge displaced on one side is mirrored on the other; the x faces cannot charge under stress [weis1985; p. 195; P]. Practical orientation: in boules pulled along z, the mirror planes outcrop as three facets along the growth axis, 120 degrees apart, which mark y [volk2008; p. 2; P-comp].

Residual sign freedom. A 180 degree rotation about z keeps the axis rules for z but flips d22; once +y is fixed by d22 > 0 no freedom remains, so c14 > 0 in any frame that obeys IEEE 176 or IRE 1949 [note-R14; rows 78-81; derived]. A 180 degree rotation about x flips z and therefore every odd-rank tensor (p, d, r, chi(2)) but not c or the photoelastic p [note-R06; Sec. 3 pitfall 3; derived]. IEEE 176-1987 states a convention change from 1949 only for quartz (class 32), none for 3m [note-R14; row 80; P].

Breaking the symmetry. A static field is a polar vector, so the crystal under field keeps only the elements of 3m that leave the field unchanged (Curie's principle; derived). E along z keeps all of 3m: the crystal stays uniaxial and n_o, n_e shift through r13 and r33. E along y, which lies in a mirror plane, keeps that one mirror: point symmetry m. E along x, which is perpendicular to a mirror plane, keeps no mirror (the mirror normal to x reverses E_x; the other two mirror normals sit at 60 and 120 degrees to x): point symmetry 1. For either transverse direction the impermeability changes through r22 and acquires an off-diagonal term through r51, and a z-cut plate becomes biaxial; the in-plane principal axes rotate by 45 degrees only for E along x (for E along y they stay along x and y) [note-R11; Sec. S1; derived]. FIG-01-06 shows this as the converse of Neumann's principle: lower the symmetry and new components appear.

---

## 8. Domains, internal field, coercive field

[FIG-01-08 Hysteresis comparator]

### L1

A region of crystal with one polarization direction is a domain. In LiNbO3 the polarization can point only up or down c, so neighbouring domains always differ by 180 degrees and are separated by thin walls [gopalan2007; abstract; P]. Wafers are sold single-domain.

Flipping a domain takes a field of about 21 kV per millimetre in congruent crystal (10.5 kV across a standard 0.5 mm wafer), but only about 6 kV/mm in near-stoichiometric crystal and under 2 kV/mm in near-stoichiometric crystal with a little MgO [volk2008; Table 7.1 p. 185; P-comp]; [chen2003; abstract; P]. Congruent crystal also remembers which way it grew: it flips more easily back to its original direction than away from it, as if a built-in bias field of about 2.5 kV/mm pointed along the original polarization [gopalan1998; abstract; P]. That bias comes from the same antisite defects as optical damage and vanishes in stoichiometric crystal.

Seen from above, domains in LiNbO3 grow as hexagons whose walls are parallel to the crystal's mirror planes, an image of the threefold symmetry [volk2008; p. 186; P-comp]; [gopalan1999; abstract; P].

### L2

Coercive and internal fields at room temperature (literature averages compiled by volk2008, plus individual reports):

| Crystal | Ec (forward, from virgin state) | Eint | Source |
|---|---|---|---|
| Congruent | 21 kV/mm (210-220 kV/cm) | 2.2-3.4 kV/mm (22.2 kV/cm refined; 33.5 kV/cm first report) | [volk2008; Table 7.1 p. 185 and p. 181; P-comp] |
| Congruent | | about 2.5 kV/mm | [gopalan1998; abstract; P] |
| Near-stoichiometric | 6.0-6.5 kV/mm | tends to 0 | [volk2008; Table 7.1; P-comp] |
| Ratio congruent / near-stoichiometric (C = 0.484 vs 0.498) | 4-5 | | [gopalan1998; abstract; P] |
| Ratio, another near-stoichiometric crystal | about 3 | | [volk2008; p. 184, orig. chen2001; P-comp] |
| Congruent + 5% MgO | 6.0-6.8 kV/mm (table average); switching at 4.45 kV/mm (0.5 mm wafer); poling with 2.5 kV/mm pulses (4.8% MgO, 0.3 mm) | 0.5 kV/mm | [volk2008; Table 7.1, p. 184; P-comp] |
| Congruent + 8% ZnO | 2.5-3.5 kV/mm | 0.5 kV/mm | [volk2008; Table 7.1; P-comp] |
| Near-stoichiometric + 1% MgO | 2.5 kV/mm | tends to 0 | [volk2008; Table 7.1; P-comp] |
| Near-stoichiometric + 2.0 mol% MgO (VTE) | 1.8 +- 0.2 kV/mm | | [chen2003; abstract; P] |

Derived consequences for a wafer of thickness t (voltage = Ec x t; derived):

| Crystal | t = 0.5 mm | t = 1 mm |
|---|---|---|
| Congruent, 21 kV/mm | 10.5 kV | 21 kV |
| Near-stoichiometric, 6.0 kV/mm | 3.0 kV | 6.0 kV |
| Near-stoichiometric + 2% MgO, 1.8 kV/mm | 0.9 kV | 1.8 kV |

Switching time with internal field, empirical activation law [volk2008; Eq. (7.32) p. 186, orig. Gopalan et al.; P-comp]:

```
t_s ~ exp( delta / (E +- E_int) )     (+ for reverse, - for forward switching)
```

| Domain-shape observation | Source |
|---|---|
| Congruent LiNbO3: almost equilateral hexagons, walls parallel to the yz (glide) planes | [volk2008; p. 186; P-comp] |
| Congruent LiNbO3: nucleate and grow as six-sided polygons; spike-like wall velocity, pinning-depinning | [gopalan1999; abstract; P] |
| Stoichiometric LiNbO3 and LiTaO3: Y-walls, parallel to (11-20), lower in energy than X-walls, parallel to (10-10), so domains are hexagons bounded by Y-walls (DFT) | [lee2011; abstract; P] |
| Congruent LiNbO3: antisite-wall interactions too weak to reverse that order, domains remain hexagonal; congruent LiTaO3: triangles bounded by one type of X-wall | [lee2011; abstract; P] |
| Antiparallel domains nucleate near the +z surface (without illumination) | [volk2008; p. 199; P-comp] |

Etching reveals domains: the -c end of a domain etches much faster than the +c end [volk2008; p. 168; P-comp], first used on LN by Nassau, Levinstein and Loiacono [nassau1965; Crossref title; P].

### L3

Unipolarity and its origin. The asymmetric P-E loop (forward field larger than reverse) was measured with liquid electrodes on z-cut plates; Eint did not depend on thickness (0.5 and 0.25 mm), so it is a bulk property [volk2008; p. 181; P-comp]. Hydrogen content has no effect on switching or internal field [gopalan1998; abstract; P]. After reversal, Eint keeps its original direction at room temperature and realigns with the new Ps after heating above a threshold of about 100 C in LN (150 C in LiTaO3) [volk2008; p. 182; P-comp]. The proposed mechanism is a frozen defect dipole, an Nb_Li antisite with its four Li vacancies, that cannot reorient with Ps at room temperature; volk2008 notes that no spectroscopic proof of dipole realignment exists and that the model does not explain the very low Ec of highly doped crystals, which contain other defects [volk2008; pp. 195-197; P-comp]. In LiTaO3 the internal field correlates with changes in the OH^- band after reversal [gopalan1996; abstract; P].

Conflicts in the numbers. (1) SLN Ec: volk2008 Table 7.1 gives 60-65 kV/cm, while its p. 118 gives 21-25 kV/cm for near-stoichiometric crystal citing gopalan1998, whose abstract gives only a ratio [note-R14; row 19]. A factor of 10 between two pages of one book suggests a unit slip (speculation). [Editor: use the table value with a conflict flag.] (2) The congruent Eint is printed "2-33 kV/cm" in Table 7.1; the text on p. 181 gives 33.5 and later 22.2 kV/cm, so the table entry is read as 22-33 kV/cm. (3) Ec depends on how it is defined (threshold of first domains, half-switched charge, loop midpoint), ramp rate, temperature and Li content within "near-stoichiometric" [volk2008; pp. 181-186; P-comp].

Temperature. Ec falls with temperature; in laser-heated crystal at 800-900 C antiparallel domains appeared at 200 V/cm [volk2008; p. 176; P-comp]. Ultraviolet light lowers the coercive field of Mg-doped crystal near threshold by more than 30% at 305 nm and 10-12 mW/cm^2 [volk2008; p. 198; P-comp].

---

## 9. Poling and periodic poling

[FIG-01-09 Poling bench]

### L1

To pole is to set the polarization with a field. A uniform field across a whole wafer makes one domain; a field applied through a comb of electrodes flips only the stripes under the teeth. The result, periodically poled lithium niobate (PPLN), alternates the sign of the crystal's nonlinear and electro-optic coefficients every few micrometres. That alternation is what lets light waves of different colours stay in step over centimetres of crystal (quasi-phase-matching, Chapter 02).

Every flipped domain moves a fixed charge: twice the spontaneous polarization times its area. Flipping one square centimetre takes 142 microcoulombs, so the current trace of a poling pulse is a direct record of how much crystal has switched (derived from Ps = 0.71 C/m^2).

### L2

| Quantity | Value | Source |
|---|---|---|
| Switched charge per area, Q/A = 2 Ps | 1.42 C/m^2 = 142 uC/cm^2 (Ps = 0.71 C/m^2); 160 uC/cm^2 (Ps = 0.80 C/m^2) | derived |
| Charge to invert a whole 76.2 mm (3 inch) wafer | 6.5 mC (Ps = 0.71 C/m^2) | derived, area pi (38.1 mm)^2 |
| Optimum duty cycle for first-order QPM | 0.5 | [volk2008; p. 179; P-comp] |

Milestones of domain engineering (dates as published; Chapter 07 holds the full chronology):

| Year | Step | Source |
|---|---|---|
| 1962 | Periodic reversal of the nonlinear coefficient proposed for phase matching | [armstrong1962; Crossref title; P] (QPM content per note-R07, Sec. 5) |
| 1965 | Domains revealed by etching | [nassau1965; Crossref title; P] |
| 1966 | Preparation of single-domain crystals | [nassau1966b; Crossref title; P] |
| 1979 | Ti in-diffusion inverts a surface layer on the +c face | [miyazawa1979; abstract; P] |
| 1980 | Periodic laminar domains grown in by Czochralski growth striations; SHG enhanced by QPM on d33 | [feng1980; abstract; P]; Y-doped, period 7 um [volk2008; p. 177; P-comp] |
| 1993 | First-order QPM waveguide poled by an external field at room temperature; 20.7 mW blue, 600 %/(W cm^2) | [yamada1993; abstract; P]; pulse 24 kV/mm, 100 us, period 2.8 um [volk2008; p. 178; P-comp] |
| 1994-1995 | Liquid-electrode poling, period from 9 um to 4.5 um; d_eff from 2 to 19 pm/V against a 22 pm/V limit | [volk2008; p. 179, orig. Webjorn et al., Pruneri et al.; P-comp] |
| 1995 | Bulk PPLN optical parametric oscillators; backswitching found and controlled | [myers1995; Crossref title; P]; [volk2008; pp. 179-180; P-comp] |

Poling practice reported for bulk congruent crystal [volk2008; pp. 179-180; P-comp]:

- Backswitching: if the pulse is too short the new domains flip back; at 25 kV/mm the critical time was at least 50 ms. Remedies: hold at about Ec/2 after the pulse, or use ramped fields.
- Domain merging: domains spread beyond the electrode, so electrode duty cycle is set below the target.
- Electrodes: Al stripes on +z under photoresist (or resist openings under a conductor), contacted through LiCl electrolyte; electrolyte on -z.
- Stability: PPLN survived heating to 800 C.

### L3

Kinetics. Switching proceeds by nucleation (at the +z surface in undoped crystal), forward growth along c, and sideways wall motion; wall motion itself proceeds by nucleation of steps on the existing wall, which accounts for the activation-type field dependence [volk2008; pp. 164, 186-190; P-comp]; [shur2006; Crossref title; P]. A Kolmogorov-Avrami-Ishibashi switched fraction X(t) = 1 - exp(-(t/t0)^n) is the standard fit form [note-R11; Sec. S9; S]. In FIG-01-09 all rates are template values; only Ps, the Ec anchors, Eint and domain shape are sourced.

What the switching current measures. Integrated current minus the capacitive part equals 2 Ps A of the switched area; Ps disagreement (0.71 vs 0.80 C/m^2) is therefore an 11% uncertainty in any area inferred from charge (derived).

Thin films. Poling of x-cut and z-cut thin-film LN (coplanar electrodes, sub-um periods, depth incompleteness) is covered with process detail in Chapter 05; reported records (600 nm period in x-cut, Zhao et al. 2020) are in [note-R08; Sec. 3.7].

---

## 10. Domain walls up close

[FIG-01-10 Powers of ten along a wall]

### L1

An ideal 180 degree wall in LiNbO3 is only one or two unit cells wide, yet around a freshly written wall the crystal stays strained and slightly birefringent over micrometres, enough to see walls in a polarizing microscope [gopalan2007; abstract; P]; [volk2008; p. 195; P-comp]. If a wall is tilted away from c, the polarization on its two sides no longer meets it edge-on and leaves a sheet of bound charge; mobile electrons gather to screen it, and the wall conducts. In MgO-doped LN such tilted walls conduct more than 10^13 times better than the surrounding crystal [werner2017; abstract and Results; P].

### L2

| Quantity | Value | Source |
|---|---|---|
| Ideal wall width | 1-2 lattice units | [gopalan2007; abstract; P] |
| Wall width by piezoresponse force microscopy (PFM) | 65-150 nm (probe-limited) | [volk2008; p. 196; P-comp] |
| Wall width by TEM, LiTaO3 | not exceeding 0.28 nm | [volk2008; p. 196; P-comp] |
| Switching-induced birefringence near walls, congruent | 10^-5 to 10^-4; reduced about 10x by annealing; much smaller near stoichiometry | [volk2008; pp. 181, 195; P-comp] |
| Width of the birefringent region | within 2 um; shear-strain region by X-ray topography up to 10 um | [volk2008; pp. 195-196; P-comp] |
| Wall energy, from wall bowing between pinning centres | 0.2-0.4 J/m^2 (calculated) | [volk2008; p. 191, orig. Yang et al. 1999; P-comp] |
| Bound charge on a wall inclined by theta to c | sigma_b = 2 Ps sin(theta); 0.025 C/m^2 = 1.5 x 10^13 e/cm^2 at theta = 1 deg, Ps = 0.71 C/m^2 | derived |

Charged-wall conduction (one sourced example):

| Quantity | Value | Source |
|---|---|---|
| Crystal | z-cut congruent LN + 5 mol% MgO, 300 um | [werner2017; Methods; P] |
| Wall writing | room-temperature tip ("calligraphic") poling with current feedback at about 30 nA; lines about 10 um wide, mm long | [werner2017; Methods; P] |
| Wall inclination | about 1 deg | [werner2017; Results; P] |
| Wall conductivity (wall width 10 nm assumed) | about 0.02 (Ohm cm)^-1; bulk dark conductivity well below 10^-15 (Ohm cm)^-1 | [werner2017; Results; P] |
| Current | single wall about 0.55 uA at 50 V; 732 parallel 1 mm walls approach 10 mA | [werner2017; Results; P] |
| Stability | stable at <= 70 C (about 1% fluctuation over 35 h at 30 C); activation energy 0.10 +- 0.01 eV below 70 C | [werner2017; Results; P] |
| Earlier demonstration | mm-thick LN single crystals; wall conduction switched by super-bandgap light and tuned by wall tilt | [schroder2012; abstract; P] |

### L3

Why walls are "thick" in congruent crystal. The extended strain and space-charge fields are attributed to defect clusters pinning the wall [volk2008; pp. 195-197; P-comp]; [gopalan2007; abstract; P]: the review states that extrinsic point defects and their clustering control the local wall structure and change macroscopic properties by orders of magnitude. PFM profiles are symmetric across walls in stoichiometric crystal and asymmetric in congruent crystal, read indirectly as a trace of Eint [volk2008; p. 197; P-comp]. The mechanism remains qualitative.

Measuring walls. Methods: selective etching (Miller-Savage wall-velocity method), polarizing microscopy of wall birefringence, electro-optic imaging, near-field optics, PFM, SHG microscopy, X-ray topography [volk2008; pp. 168-171, 181; P-comp]. The wall width measured depends on the probe; the 0.28 nm TEM value is for LiTaO3, not LiNbO3.

Conduction numbers depend on the assumed wall width (10 nm gives 0.02 (Ohm cm)^-1; 1 nm gives about ten times more) [werner2017; Results; P]; in schroder2012, wall transport in undoped crystal was switched by super-bandgap illumination. [Editor: present werner2017 as one data point, not a material constant.]
