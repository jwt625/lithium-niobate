# Chapter 05 - Making it

| Field | Value |
|---|---|
| Chapter | 05-making |
| Lane | C05 (DevLog-004, wave 1) |
| Date | 2026-10-25 |
| Status | Manuscript draft, not yet audited |
| Companion files | `figures.md` (11 figures, F05-01 to F05-11), `process-flow.yaml` (Process viewer data), `refs.yaml`, `glossary.yaml`, `open-questions.md` |
| Inputs | DevLog-003a, 003b, 004; research R02, R05, R06, R07, R08, R09, R12, R13, R14; primary papers listed in `refs.yaml` |

## Conventions used in this file

- Inline source tag: `[key; status]`. `key` is an id in `refs.yaml` or a research-note row (`R09:S3`, `R14:#18`). Several keys are separated by commas.
- Status codes (DevLog-004 rule 3):

| Code | Meaning in this chapter |
|---|---|
| P | Value read in the primary document (full text, or the arXiv version of it; the version is named in `refs.yaml`) |
| P(abs) | Value read in the primary abstract only (Crossref record) |
| P-comp | Read in a compilation that cites the original (Volk and Woehlecke 2008, Weis and Gaylord 1985, a review table) |
| S | Secondary: a review or a research note quoting another source |
| V | Vendor statement about its own product |
| T | Trade press |
| U | Unverified. Never rendered as fact; shown only with a U badge, or kept in `open-questions.md` |
| derived | Computed here from tagged inputs; formula given |
| template | Illustrative value with no source; rationale given; rendered visibly as template (R13) |

- "Analog" marks a reported value taken from a different paper than the one that anchors a flow, or from LiTaO3 instead of LiNbO3. Analogs are never silently merged into a flow (R13).
- Figure placements are written `> FIGURE F05-nn` and refer to `figures.md`.
- Crystal axes: X, Y, Z are the crystal-physics axes of IEEE Std 176-1987 [ieee176; P-comp]; "x-cut" means the wafer normal is parallel to X.

---

## 5.0 Chapter door

L1. Every lithium niobate device starts as two white powders, lithium carbonate and niobium pentoxide, melted near 1255 C and pulled into a single crystal on a rotating seed. The crystal is sawn into wafers, and for modern photonics a layer about 600 nm thick is peeled off a wafer, bonded to oxidized silicon, and etched into waveguides narrower than a micrometre.

Door art (VISUAL): engraving hatch of a Czochralski boule on its seed (DevLog-003b sec. 5). TECH: ASCII boule profile with the pull axis labelled `c` or `-c` per the seed orientation chosen in F05-02.

> FIGURE F05-01 (Process viewer, full width, directly under the chapter title; the chapter is organised along its steps)

---

## 5.1 Raw materials: Li2CO3 and Nb2O5

### L1
Lithium niobate is one part lithium, one part niobium, three parts oxygen. Niobium is 62.8% of its mass. The niobium comes almost entirely from Brazilian pyrochlore ore; the lithium from brine and spodumene mined mostly for batteries. A 150 mm wafer 0.5 mm thick holds about 26 g of niobium.

### L2
Solid-state reaction used to prepare the charge (stoichiometric chemistry; [chen2021molecules; S] names Li2CO3 and Nb2O5 as the usual starting materials):

Li2CO3 + Nb2O5 -> 2 LiNbO3 + CO2

| Quantity | Value | Source; status |
|---|---|---|
| Molar mass LiNbO3 | 147.84 g/mol | derived (IUPAC atomic masses Li 6.94, Nb 92.906, O 15.999) |
| Nb mass fraction | 62.84 wt% | derived |
| Charge per kg LiNbO3 (stoichiometric) | 0.250 kg Li2CO3 + 0.899 kg Nb2O5, releasing 0.149 kg CO2 | derived |
| Congruent charge | 48.38 mol% (vendor) and 48.45 mol% (compilation) Li2O, i.e. Li-poor relative to the 50 mol% formula | [cti1999; V], [volk2008 pp. 4-5, 9; P-comp] |
| World Nb mine production | 112,000 t Nb (2024 and 2025e); Brazil 104,000 t, about 93% | [R09:S1; P] |
| World Li production | 290,000 t Li (2025, excl. US); batteries 88% of end use | [R09:S2; P] |
| Li2CO3 price | US contract average US$9,000/t (2025) | [R09:S2; P] |
| LN or LT use of Nb or Li | not broken out by the USGS Mineral Commodity Summaries 2026: N/A | [R09:S1], [R09:S2] |

Mass of LN and Nb in one wafer (density 4647 kg/m^3 [volk2008 Table 1.1; P-comp]; flats ignored; derived):

| Wafer | LN mass | Nb mass |
|---|---|---|
| 76.2 mm x 0.5 mm | 10.6 g | 6.7 g |
| 100 mm x 0.35 mm | 12.8 g | 8.0 g |
| 150 mm x 0.5 mm | 41.1 g | 25.8 g |
| 200 mm x 0.5 mm | 73.0 g | 45.9 g |

### L3
- Purity grades of Nb2O5 and Li2CO3 used by crystal growers, and impurity limits (Fe in particular, which sets photorefraction), were not found in a primary source: N/A (`open-questions.md` Q1).

> FIGURE F05-11 (value chain with mass budget) placed here.

---

## 5.2 Growing the crystal

### L1
Commercial LN is grown by the Czochralski method: a seed crystal touches the surface of the melt in a crucible, is rotated slowly and pulled upward by one or two millimetres per hour, and the crystal grows from the meniscus. A 150 mm (6-inch) boule takes days to grow. The melt is not LiNbO3 of formula composition but the congruent composition, slightly short of lithium, because only that melt freezes to a solid of the same composition from top to bottom.

### L2

Composition and phase behaviour

| Quantity | Value | Source; status |
|---|---|---|
| Liquidus maximum (congruent melt) | near 48.6 mol% Li2O | [reisman1958; P-comp via a 2021 review] |
| Congruent composition | 48.45 mol% Li2O; [Li]/[Nb] = 0.94 | [volk2008 pp. 4-5, 9; P-comp] |
| Congruent composition, vendor value | 48.38 ± 0.01 mol% | [cti1999; V] |
| Congruent vs near-stoichiometric (mole fraction Li2O) | 0.484 vs 0.498 | [gopalan1998; P(abs)] |
| Melting point, CLN | 1255 C (compilation); about 1250 C (vendor) | [volk2008 Table 1.1; P-comp], [cti1999; V] |
| Curie temperature, CLN | 1140 C (Volk); 1142.3 +- 0.7 C at 48.38 mol% (vendor) | [volk2008 Table 1.1; P-comp], [cti1999; V] |
| Curie temperature, near-SLN | 1206 C (Volk) vs 1213 C (secondary): conflict | [volk2008 Table 1.1; P-comp], [wong2002 as quoted in an encyclopedia entry; S] |
| Tc vs crystal composition c (mol% Li2O) | Tc = 39.064 c - 746.73 (Bordui 1992); Tc = 39.26 c - 760.67 (Iyi 1992) | [volk2008 Eqs. (6.2), (6.3), p. 140; P-comp] |
| Tc from the Bordui fit at 48.38 / 48.45 / 50.0 mol% | 1143.2 / 1145.9 / 1206.5 C | derived |

Czochralski growth parameters reported for LN (re-keyed from the table in [chen2021molecules; S]; originals cited there)

| Pull rate (mm/h) | Rotation (rpm) | Crystal diameter x length (mm) | Li content spread (unit as printed: mol%/cm) | Original |
|---|---|---|---|---|
| 1-2 | 5-10 | 153 x 110 | delta[Li2O] about 0.001 | [wang2020cryst; S] |
| 2.8-4.0 | 3-10 | 100 x 80 | delta[Li2O] < 0.002 | ref. 22 of [chen2021molecules; S] |
| 1-2.5 | 10-25 | 80 x 60 | delta[Li2O] < 0.02 | ref. 30 of [chen2021molecules; S] |
| 0.4-1.5 | 10-30 | 50 x 30 | delta[Li2O] < 0.005 | ref. 29 of [chen2021molecules; S] |

- The 153 mm boule grown at 1-2 mm/h and 5-10 rpm showed a Curie-temperature deviation of at most 1.3 C across the crystal [chen2021molecules; S]. Its body (110 mm) therefore takes 55 to 110 h to pull (derived: length / rate; shoulder, tail, and cool-down excluded). Body mass about 9.4 kg (derived: cylinder 153 mm x 110 mm, 4647 kg/m^3).
- First Western report of Czochralski-grown LN: Ballman, J. Am. Ceram. Soc. 1965 [ballman1965; P(title)].
- Crucible material, atmosphere, afterheater design, and seed orientation used for production boules: not found in a primary source in this pass (`open-questions.md` Q2). The F05-02 tool model uses template values for these and labels them.

Routes to near-stoichiometric LN (SLN)

| Route | What the source states | Source; status |
|---|---|---|
| Double-crucible Czochralski with automatic powder supply | Growth of stoichiometric LiNbO3 single crystals by a double-crucible Cz method with an automatic powder supply system | [kitamura1992; P(title)] |
| Vapour transport equilibration (VTE) | Off-congruent crystals prepared by VTE; Tc and noncritical phase-matching temperature nearly linear in Li/Nb; crystals equilibrated to the Li-rich phase boundary had excellent optical homogeneity; Li-poor preparation hampered by very slow Li diffusivity and second-phase precipitation | [bordui1992; P(abs)] |
| Why SLN matters for making things | Switching (coercive) field ratio CLN / near-SLN 4-5; internal field about 2.5 kV/mm in CLN, vanishing in SLN | [gopalan1998; P(abs)] |
| Coercive field, literature averages | CLN 21 kV/mm; SLN 6.0-6.5 kV/mm; 5% MgO:CLN 6.0-6.8 kV/mm (individual reports 2.5-4.5 kV/mm) | [volk2008 Table 7.1; P-comp]; p. 118 of the same compilation gives 2.1-2.5 kV/mm for near-SLN [volk2008 p. 118; P-comp] |

MgO doping

| Quantity | Value | Source; status |
|---|---|---|
| Threshold for damage resistance, congruent | 4.5 at.% MgO or more; photoconductivity up 100x; Glass current not reduced; activation energy 0.1 eV vs 0.5 eV; OH line moves from 2.87 to 2.83 um | [bryan1984; P(abs)] |
| Priority | Zhong, Jin, Wu, IQEC 1980 conference abstract; journal report Bryan 1984 | [zhong1980; P(title)], [bryan1984; P(abs)] |
| Near-stoichiometric MgO:SLN threshold | above 0.78 mol% MgO, no damage at 532 nm to 2 MW/cm^2 | [furukawa2000; P(abs)] |

Single-domain boules
- Nassau, Levinstein, and Loiacono reported the domain structure of LN crystals revealed by etching (1965) [nassau1965; P(title)] and the preparation of single-domain crystals (1966) [nassau1966b; P(title)].
- The procedure (field applied while the boule cools through Tc; electrode and field values) is not quoted here because the paper body was not read (`open-questions.md` Q3). F05-02 shows the poling step with template values and a U badge on the procedure.

### L3
- Lineage: congruent Li-deficiency of commercial crystals [lerner1968; P(title)]; congruent melt for uniform boules [carruthers1971; P(title)].
- Composition is measured indirectly: Curie temperature (linear in Li/[Li+Nb]), UV absorption edge, Raman line widths [chen2021molecules Table 2; S]. Tc fits by Bordui and Iyi differ by 4.5 C at 48.38 mol% (derived from the fits above); the SLN Tc of 1213 C sits above both fits at 50.0 mol% (derived from the fits above).
- Ps differs between sources: 80 +- 5 uC/cm^2 [gopalan1998; P(abs)] vs 71 (CLN) and 62 (near-SLN) uC/cm^2 [volk2008 Table 1.1; P-comp].
- Thermal expansion along c disagrees across sources (4.1 to 7.5 ppm/K); Volk gives alpha_a = 14.1e-6 /K and alpha_c = 4.1e-6 /K for CLN at 300 K [volk2008 Table 1.1; P-comp]. The anisotropy matters for boule cracking and for bonding to Si (5.5).
- The growth table above mixes congruent and doped crystals from different groups; it shows ranges, not one recipe.

> FIGURE F05-02 (Czochralski puller and composition) placed here.

---

## 5.3 Wafers

### L1
A poled boule is sliced, lapped, and polished into wafers; flats on the wafer edge encode the crystal axes. The cut names the crystal axis normal to the wafer surface. Optics uses x-cut and z-cut wafers; phone filters use a Y-cut rotated by 128 degrees about X, reported in 1976 as the optimum rotated cut for surface-acoustic-wave substrates.

### L2

| Cut | Normal | Main use | Source; status |
|---|---|---|---|
| x-cut | X | TFLN modulators: TE mode and in-plane field along Z use r33 | [wang2018oe; P (arXiv)] |
| z-cut | Z | Bulk PPLN and APE waveguides (domains inverted through the thickness); TM modes in thin film | [langrock2007; P], [sun2020lsa; P] |
| y-cut | Y | Proton exchange in benzoic acid damages the y-cut surface | [jackel1982; P(abs)] |
| 128 deg rotated Y, X-propagating (128 Y-X) | Y rotated 128 deg about X | SAW filters; optimum cut reported in 1976 | [shibayama1976; P(title)], [R09:S3; V] |
| 36-50 deg rotated Y LiTaO3 | | SAW (LT, not LN) | [R09:S3; V] |

| Wafer specification | Value | Source; status |
|---|---|---|
| Diameters in production | 4 and 6 inch (one SAW-wafer maker); 8-inch LN claimed in mass production by one grower | [R09:S3; V], [R09:S5; V] |
| Thickness, 128 Y LN | 350 um at 4 inch, 500 um at 6 inch | Sumitomo Metal Mining [R09:S3; V] |
| Donor thickness used for LTOI | 525 um (LiTaO3) | [wang2024nature; P, LT analog] |
| Flat lengths, TTV, bow, warp, LTV, roughness | not found in a primary or standard text in this pass | `open-questions.md` Q4 |
| Standard covering SAW wafers | IEC 62276 (LN, LT, quartz, LBO, LGS); the 2012 edition added "reduced LN/LT" terms; edition 4.0 in 2025. Numerical limits not read | [iec62276; S (catalogue pages)] |
| Optical vs acoustic grade (shown for LiTaO3) | Acoustic grade is chemically reduced (annealed in carbon powder), optical grade is not; both congruent, same cost; optical grade had a narrower XRD rocking curve | [wang2024nature; P, LT analog] |

### L3
- Flat convention: the primary-flat orientation relative to +X or -X, and the sign of +Z on the polished face, differ between vendors; the site's cut explorer must take them from a vendor drawing per wafer, and F05-03 labels the default as template.
- Sign of Z: +Z is the face that becomes negative on compression under IEEE 176-1987; the pyroelectric sign follows once +Z is fixed [weis1985 p. 196; P-comp].
- Reduced ("black") LN for SAW is mentioned in the IEC scope; its reduction conditions for LN were not read (Q4).

> FIGURE F05-03 (wafer and cut explorer) placed here.

---

## 5.4 Waveguides in bulk wafers (1974 to today)

### L1
Before thin films, light was guided in a slightly raised-index skin near the surface of a bulk wafer. Two routes made it: baking titanium stripes into the crystal at about 1000 C, or swapping lithium for hydrogen in hot benzoic acid. Both give waveguides several micrometres wide with weak confinement (Ti stripes 7 um wide [luo2019sciadv]; ion-diffused index contrast below 0.02 [wang2018oe]; proton exchange +0.12 on the extraordinary index only [jackel1982]), which is why bulk LN circuits have large footprints [sun2020lsa]. Etched thin films reach an index contrast of 0.67 against SiO2 [wang2018oe].

### L2

Titanium indiffusion

| Quantity | Value | Source; status |
|---|---|---|
| First report | Ti, V, and Ni films diffused into LiNbO3; Ti gives single-mode low-loss guides confined within about 1 um of the surface | [schmidt1974; P(abs)] |
| Recipe, z-cut, telecom | 7 um wide, 80 nm thick Ti stripes; 1060 C for 9 h | [luo2019sciadv; P] |
| Recipe, z-cut | Ti on the -z face; 1035 C with constant O2 flow for 12 h | [chung2017; P] |
| Commercial Ti:LN modulators | up to 40 GHz (Exail catalogue) | [R09:S37; V] |

Proton exchange (PE), annealed PE (APE), reverse PE (RPE)

| Quantity | Value | Source; status |
|---|---|---|
| Melt | benzoic acid, 200-250 C | [jackel1982; P(abs)] |
| Index change | +0.12 for the extraordinary index only; step profile (633 nm) | [jackel1982; P(abs)] |
| Diffusion rate, x-cut | 1.37 um^2/h at 249 C; 0.37 um^2/h at 217 C; slower along z | [jackel1982; P(abs)] |
| Apparent activation energy from those two points | 0.90 eV | derived: Arrhenius fit through two points; meaning of "rate" (d^2/t vs D) not confirmed from the full text, so this is a template-grade estimate (Q5) |
| Loss | < 0.5 dB/cm, x-cut, 633 nm | [jackel1982; P(abs)] |
| RPE waveguides | normalized SHG efficiency about 100 %/W/cm^2 (1 W^-1 cm^-2); 0.1-0.2 dB/cm loss typical | [langrock2007; P] |
| Ridge vs PE for power handling | vendor statement (HC Photonics) that ridge waveguides handle more power | [R02:OFS-113; V] |

### L3
- APE and RPE add a high-temperature anneal and a Li-rich reverse exchange that bury the index profile; the as-exchanged layer has strongly reduced nonlinearity [langrock2007; P].
- Out-diffusion of Li2O at high temperature also raises the surface index; the 1973 "thin-film LiNbO3" modulator used such an out-diffused planar guide in bulk LN [kaminow1973; P(abs)].
- Ion-beam-enhanced etching produced ridge waveguides in bulk (Zn:LN) before thin films existed [hartung2008; P(title)], [R02:OFS-52; S], [R02:OFS-81; S].

> FIGURE F05-04 (diffusion depth vs time and temperature) placed here.

---

## 5.5 Thin film: lithium niobate on insulator (LNOI)

### L1
Helium or hydrogen ions shot into a LN wafer stop at a depth set by their energy, about 0.7 um for 195 keV helium. The wafer is flipped and bonded to oxidized silicon. Gentle heating makes the implanted gas collect in a buried plane until the crystal splits there, leaving a sub-micrometre single-crystal film on the oxide. Polishing removes the damaged top, and annealing repairs the lattice. This is the same "Smart Cut" family of processes that makes silicon-on-insulator wafers.

### L2

Lineage

| Year | Step | Source; status |
|---|---|---|
| 1995 | Smart Cut for SOI (H implantation plus bonding) | [bruel1995; P(title)] |
| 1998 | Crystal ion slicing of LN: deep implantation makes a buried sacrificial layer in poled c-cut wafers; 9 um films bonded to Si and GaAs; same dielectric and pyroelectric constants and Tc as bulk | [levy1998; P(abs)] |
| 2004 | 680 nm films by ion slicing and wafer bonding on SiO2 over electrodes; r33 = 31 pm/V at 633 nm | [rabiei2004; P(abs)] |
| 2007 | BCB-bonded z-cut films; microring R = 100 um; 0.14 GHz/V; EO response about 50% of bulk because BCB limits annealing to 320 C (full recovery needs about 800 C) | [guarino2007; P (arXiv)] |
| 2009 | LNOI photonic wires | [hu2009; P(title)] |
| 2012 | LNOI wafers of 3-inch diameter by ion slicing and bonding | [poberaj2012; P(abs)] |
| 2021 | Ion-cut LNOI review (implantation, bonding, material) | [jia2021; P(abs)] |
| as of 2026-10-24 | 300-900 nm LNOI on 3, 4, 6, 8 inch (NanoLN); LN6 at 150 mm (Soitec POI) | [R09:S6; V], [R09:S10; V] |

Ion implantation

| Quantity | Value | Source; status |
|---|---|---|
| He+ energy, fluence, temperature (z-cut CLN) | 195 keV; 4 x 10^16 cm^-2; holder at 100 C | [guarino2007 arXiv:0705.2392v1; reported] |
| He+ density peak at 195 keV | 0.68 um | [guarino2007 arXiv:0705.2392v1; reported] |
| LNOI convention | He+ above 200 keV | [wang2024nature; P (statement citing jia2021)] |
| H+ for LTOI (analog) | 100 keV, 7.0 x 10^16 cm^-2, 4-inch x-cut LiTaO3; beam current ten times higher than for He | [wang2024nature; P, LT analog] |
| Tilt to avoid channelling (H, LN, 4-inch) | 7 deg from normal | [you2019; P] |
| Range vs energy curve for He and H in LN | not tabulated in any source read | N/A |

Bonding, splitting, recovery

| Step | Value | Source; status |
|---|---|---|
| Pre-bond clean and activation | RCA clean; N2 plasma activation; room-temperature direct bonding (EVG 301) | [you2019; P] |
| Bond-strengthening anneal | below 200 C | [er_smartcut2022; P (arXiv)] |
| Split | about 230 C | [er_smartcut2022; P (arXiv)] |
| Split, after RT bond (H-implanted LN on Pt/SiO2/LN) | 150 C in N2 for 2 h | [you2019; P] |
| Split (LiTaO3 analog) | 190 C for 10 h | [wang2024nature; P, LT analog] |
| Handle used for TFLN photonics | Si with 4.7 um thermal SiO2 (500 or 525 um); quartz 500 um; LN substrate with 2 um SiO2 | [luke2020; P], [kharel2021; P], [krasnokutska2018; P (arXiv)] |
| Post-split surface | edge removal and CMP remove the rough, implantation-damaged layer and thin to target (LiTaO3: to 600 nm) | [wang2024nature; P, LT analog]; [er_smartcut2022; P (arXiv)] |
| Device-level recovery anneal | O2, atmospheric pressure, 520 C, 2 h; material-limited loss of ion-sliced LN reduced from about 1.5 dB/m to about 0.2 dB/m | [shamsansari2022; P (arXiv)] |

Thickness metrology (wafer-scale)

| Quantity | Value | Source; status |
|---|---|---|
| Edge exclusion for film-thickness mapping, 4-inch | 8 mm (rough rim from wafer production) | [luke2020; P (arXiv)] |
| Etch-depth standard deviation, 300 nm etch, 4-inch | 5.9 nm (3.2 nm excluding a further 6 mm) | [luke2020; P (arXiv)] |
| LTOI thickness map (analog) | 600 to 630 nm colour scale across the wafer (axis range of Fig. 1c) | [wang2024nature; P, LT analog; range read from axis labels only] |

Alternative routes

| Route | What is reported | Source; status |
|---|---|---|
| Bonding plus grinding and CMP, no implantation | LN bulk bonded on 2 um silica, thinned by CMP to 4 um; microrings with Q about 10^8 | [gao2022col; P (arXiv)] |
| Thick films (5-50 um) | offered commercially | [R09:S6; V] |
| BCB adhesive bonding | large-area (> 1.5 cm^2) films; limits anneal to 320 C | [guarino2007; P (arXiv)] |
| Epitaxy (1974) | epitaxial LN waveguides for beam scanning | [tien1974; P(title)] |
| Sputter deposition | sputter-deposited TFLN RGB multiplexer (638, 520, 473 nm) | [shimura2025; P(abs)] |
| Chemical beam epitaxy | c-axis LN on C-plane sapphire at 400 C, for SAW | [smagin2026; P(abs)] |
| Atomic layer deposition | ferroelectric LiNbO3 by ALD | [ostreng2013; P(title)] |
| Sol-gel nanoimprint | nanoimprinted LN for nonlinear metalenses | [talts2025; P(title)] |

### L3
- Why the film must be annealed: implantation damage raises absorption [shamsansari2022; P]; post-slicing recovery of r33 needs high temperature [guarino2007; P]. Annealing also risks Li2O out-diffusion, one hypothesis for higher coercive fields in thin films [chen2024materials; P].
- Thermal mismatch: LN expands 14.1 ppm/K along a and 4.1 ppm/K along c [volk2008 Table 1.1; P-comp]; in x-cut films both axes lie in the plane, so the film strain on a Si handle is anisotropic. Si handle CTE is not sourced in this lane (Q7).
- Which face ends up on top: the implanted surface becomes the buried interface; the split surface is on top and is polished. For x-cut, flipping about an in-plane axis reverses the on-screen direction of +Z or +Y (F05-01 check P8).
- 680 nm (Rabiei) and 0.68 um (Guarino peak) coincide numerically; whether Rabiei used 195 keV is not stated in the abstract.

> FIGURE F05-05 (ion slice: depth vs energy, peel) and FIGURE F05-06 (CMP thinning and wafer thickness map) placed here.

---

## 5.6 Wafer sizes and suppliers (as of 2026-10-24)

### L1
Thin-film LN wafers grew from chips cut from 3-inch wafers in 2012 to 150 mm and 200 mm wafers run in CMOS-class foundries in 2025-2026.

### L2

| Supplier or fab | Wafer statement | Source; grade |
|---|---|---|
| NanoLN (Jinan Jingzheng Electronics) | LNOI and LTOI, 3, 4, 6, 8 inch; films 300-900 nm; Si, LN, quartz, fused silica handles; thick films 5-50 um | [R09:S6; V] |
| Soitec (Smart Cut POI) | LT6, LT8 (150, 200 mm LT); LN6 (150 mm LN); 150 mm LNOI for CCRAFT from 2025-06, 200 mm processed wafer shown | [R09:S10; V], [R09:S13; S] |
| ELENA (EU) | first European commercial LNOI substrates, 150 mm | [R09:S12; S] |
| CCRAFT | pure-play TFLN foundry, 150 mm (200 mm shown) | [R09:S13; S], [R09:S16; V] |
| HyperLight with UMC and Wavetek | 6- and 8-inch TFLN production | [R09:S18; V] |
| Ligentec and X-FAB | TFLN-on-SiN and TFLN-on-SOI at 200 mm | [R09:S28; V] |
| Academic wafer-scale demonstrations | 4- and 6-inch DUV LN PICs, 0.27 dB/cm | [luke2020; P(abs)] |

### L3
Every row is a company statement or trade press; none is an independent capacity measurement. Wafer prices quoted in finance media are low grade and are not given here.

---

## 5.7 Patterning: lithography, masks, and etching

### L1
LN is hard to etch: fluorine chemistries form non-volatile LiF, so most low-loss TFLN waveguides are cut by argon ions that knock atoms off physically. Physical etching removes the mask too, and some of the removed LN lands back on the sidewalls. Mask choice, ion energy, and chamber pressure decide how steep and smooth the sidewalls are, and the sidewalls decide the loss.

### L2

Lithography

| Item | Value | Source; status |
|---|---|---|
| EBL, HSQ (FOx-16) negative resist, 4-inch LNOI, 100 kV | about 500 nm HSQ; sleeve 150 nm wide, 4 passes at 1900 uC/cm^2, 8 nA, 5 nm step; bulk 7600 uC/cm^2, 100 nA, 25 nm step; develop 5 min in 1:3 AZ351B:DI water; resist sidewall 85 deg | [kaufmann2023; P] |
| EBL, ZEP-520A positive resist | about 1 um, baked 170 C for 2 min; 300 uC/cm^2 at 2 nA (JEOL 9500) | [jiang2016; P] |
| EBL, HSQ multi-pass | HSQ with multi-pass exposure | [zhang2017; P (arXiv)] |
| DUV stepper | 248 nm; 22 mm x 22 mm reticle stepped across 4- and 6-inch wafers; 60 nm ARC + 600 nm resist on 650 nm PECVD SiO2 hard mask | [luke2020; P (arXiv)] |
| DUV vs EBL write time | DUV exposure under 1 min per wafer vs more than 8 days for EBL at 10 nA, 125 kV (authors' estimate) | [luke2020; P (arXiv)] |
| EBL write time, bulk dose above, per cm^2 | 21.1 h at 100 nA | derived: t = D A / I = 7600 uC/cm^2 x 1 cm^2 / 100 nA |
| Stepper for poling electrodes | 0.15 um and 0.5 um steppers for combs and pads | [chen2024materials; P] |
| Femtosecond-laser direct writing (PLACE) | ablates a 600 nm sputtered Cr film into a hard mask | [li2023oe; P (arXiv)] |

Hard masks

| Mask | Reported use | Source; status |
|---|---|---|
| HSQ (spin-on oxide) | direct EBL resist and mask for Ar+ etching; microdisks with HSQ masks from 2014 [wang2014oe; P(title)] | [kaufmann2023; P], [zhang2017; P (arXiv)], [shen2024; P (arXiv)] |
| SiO2 (PECVD, 650 nm) | DUV pattern transferred by C3F8 etch; removed with HF | [luke2020; P (arXiv)] |
| a-Si (deposited Si) | EBL then Ar+ plasma etch of LN; also used for nanophotonic SHG waveguides [wang2017shg; P(title)] | [wang2018oe; P (arXiv)]; author's failure note: a-Si mask cracked and etched inhomogeneously on Y-cut [R02:A11; reported, practitioner] |
| Cr (lift-off) | EBL lift-off Cr mask; F + Ar plasma; about 75 deg sidewalls, < 2 nm RMS roughness, 0.4 dB/cm | [krasnokutska2018; P (arXiv)] |
| Cr (sputtered, 600 nm, fs-laser patterned) | mask for CMP-based pattern transfer (PLACE) | [li2023oe; P (arXiv)] |
| DLC (PECVD from CH4, 300 nm) | DUV pattern into Si3N4 (F chemistry), then DLC (O2 plasma); LN:DLC selectivity up to 3 vs about 1 for SiO2 masks; 80 deg sidewalls | [li2023nc; P] |
| ZEP (polymer) | direct mask for Ar ion milling, slanted sidewalls | [jiang2016; P] |

Argon etching: reported conditions

| Tool and conditions | Result | Source; status |
|---|---|---|
| ICP, Ar 10 sccm, 1 mTorr, 20 C, DC bias swept 100-800 V | redeposition falls and trenching rises with bias | [kaufmann2023; P] |
| ICP 300 W, 1 mTorr, 600 V | 24 nm/min | [kaufmann2023; P] |
| Pressure sweep 1-15 mTorr (400 V, 600 W) and 0.3-13 mTorr (600 V, 300 W) | etch rate and sidewall angle fall with pressure; lateral etching dominates near 9 mTorr (400 V) and 7 mTorr (600 V); redeposition-free near 11 mTorr (400 V) and 5-7 mTorr (600 V); minimum rates 27 and 12 nm/min | [kaufmann2023; P] |
| ICP-RIE Ar+, bias power 112 W | 350 nm etched, 250 nm slab; Q_i 10.0 +- 0.7 million | [zhang2017; P (arXiv)] |
| ICP-RIE Ar plasma | about 80 nm/min; 200 nm of a 400 nm film | [chen2022; P] |
| Ion mill, 600 V beam | about 35 nm/min; smooth, slanted sidewalls | [jiang2016; P] |
| Ar IBE with DLC mask | full etch of 0.7 um, base width 3.3 um, 80 deg | [li2023nc; P] |
| IBE, incidence angles 0, 15, 25, 35 deg | used to test the redeposition argument | [kaufmann2023; P] |

Redeposition removal

| Method | Value | Source; status |
|---|---|---|
| SC-1 wet clean | NH4OH:H2O2:H2O = 1:1:5 | [li2023nc; P] |
| KOH:H2O2 (LiTaO3 analog) | 3:1 KOH(40%):H2O2(30%) | [wang2024nature; P, LT analog] |
| Dry-only regimes | three methods: tuned bias and pressure; dense patterns or a retained slab; trapezoidal mask | [kaufmann2023; P] |

Sidewall angles reported

| Angle | Context | Source; status |
|---|---|---|
| about 60 deg | stated typical for ridge waveguides with SiO2 masks | [li2023nc; P (their characterization of prior work)] |
| about 75 deg | Cr mask, F + Ar | [krasnokutska2018; P (arXiv)] |
| 80 deg | DLC mask, Ar IBE | [li2023nc; P] |
| 85 deg | HSQ resist after development (before etch) | [kaufmann2023; P] |

Alternatives to Ar etching

| Method | Reported | Source; status |
|---|---|---|
| Fluorine RIE | LiF by-products are non-volatile and impede etching | [luke2020; P (arXiv)], [krasnokutska2018; P (arXiv)] |
| PLACE (photolithography-assisted chemo-mechanical etching) | 700 nm z-cut; Cr mask by fs laser; CMP transfers the pattern; Cr wet strip; second CMP; anneal 450 C, 2 h, air; ring R = 200 um, gap 3.8 um; Q_L 4.29e6, Q_i 4.04e7, < 1 dB/m | [li2023oe; P (arXiv), P(abs)] |
| PLACE microdisk | Q > 10^8; OPO threshold 19.6 uW | [gao2021njp; P(abs)] |
| PLACE origin (microdisks) | Q above 10^7 | [wu2018ol; P(title)] |

Loss and Q by fabrication route

| Route | Best value found | Source; status |
|---|---|---|
| EBL + Ar ICP-RIE, ion-sliced, ring | Q_i 2.9e7, 1.3 dB/m | [zhu2024prj; P(abs)] |
| EBL + Ar ICP-RIE, ring (2017 baseline) | Q_i about 1e7, 2.7 dB/m | [zhang2017; P (arXiv)] |
| DUV + SiO2 mask + Ar ICP-RIE, wafer-scale | 0.27 +- 0.05 dB/cm across a 4-inch wafer | [luke2020; P (arXiv)] |
| DUV + DLC + Ar IBE, strip | down to 4 dB/m | [li2023nc; P] |
| HSQ + tuned Ar ICP, redeposition-free | 1.55 dB/cm | [kaufmann2023; P] |
| PLACE ring with bus | < 1 dB/m (Q_i 4.04e7) | [li2023oe; P(abs)] |
| CMP film from bulk, ring | Q about 1e8 | [gao2022col; P (arXiv)] |
| Material limit after anneal | about 0.2 dB/m (material-limited Q 180 million in arXiv v1) | [shamsansari2022; P (arXiv)] |

### L3
- Etched vs etchless: bonding TFLN onto patterned Si or SiN avoids LN etching altogether; the trade-offs are reviewed in [mookherjea2023; P(title)].
- Why the angle matters: a slanted ridge needs a wider base, raises bend radius, and reduces electrode overlap; vertical strips allow tighter integration [li2023nc; P].
- Sidewall model used in F05-08 (derived geometry, inputs template unless a row above supplies them): a mask edge of slope angle a_m receding vertically at rate R_m retreats laterally at R_m / tan(a_m); the LN etched at R_LN then takes slope tan(a_LN) = S tan(a_m) with S = R_LN / R_m. With S = 1 and a_m = 85 deg the model gives 85 deg; measured sidewalls are lower because sputter yield depends on incidence angle and redeposition builds a second slope [kaufmann2023; P]. The model is an upper bound.
- Etch rates are tool-specific; Kaufmann et al. vary ICP power only to keep the endpoint system in range and report that power has only a minor effect on redeposition at fixed bias and pressure [kaufmann2023; P].
- Charging: a 5-10 nm Al discharge layer on dielectrics such as LN during EBL is the author's practice note [R02:B1; reported, practitioner].
- Pyroelectric hazard: heating z-cut LN on a hotplate can expose resist by pyroelectric discharge and crack substrates; author's notes [R02:A1; reported, practitioner], [R02:OFS-79; reported, practitioner]. Pyroelectric coefficient magnitude 4e-5 C/(m^2 K) in one compilation [weis1985 Eq. (2), p. 196; P-comp] and 8.3e-5 C/(m^2 K) from a vendor [cti1999; V].

> FIGURE F05-07 (EBL raster vs DUV stepping, wafer site map), FIGURE F05-08 (Ar+ milling sidewall and redeposition), FIGURE F05-09 (loss and Q by route) placed here.

---

## 5.8 Cladding and annealing

### L1
After etching, the waveguides are usually covered with silicon dioxide, which protects them, lets electrodes sit closer, and changes how the crystal holds charge. Low deposition temperature and a final oxygen anneal both lower optical loss.

### L2

| Recipe | Value | Source; status |
|---|---|---|
| PECVD SiO2 | 800 nm at 300 C substrate temperature | [shamsansari2022; P (arXiv)] |
| ICPCVD SiO2 | 800 nm at 80 C, then re-anneal; mean Q_int 1.5 (PECVD), 2.5 (annealed), 5 million (annealed, ICPCVD, re-annealed) | [shamsansari2022; P (arXiv)] |
| PECVD, wafer-scale | 800 nm after mask strip | [luke2020; P (arXiv)] |
| PECVD | 1.5 um | [zhang2017; P (arXiv)] |
| PECVD | 900 nm, before electrodes, with 1.8 um electrode gap | [chen2022; P] |
| Hydrogen-free PECVD (LiTaO3 analog) | 2 um, avoids Si-OH overtone absorption near 1.5 um; after 500 C O2 anneal | [wang2024nature; P, LT analog] |
| HSQ cladding | 900 nm HSQ, EBL-defined, annealed 400 C, 1 h; chosen over PECVD to suppress photorefraction | [shen2024; P (arXiv)] |
| Uncladded rings | removing the dielectric cladding mitigates photorefraction in microrings | [xu2021; P(abs)] |

### L3
- Cladding also sets DC-drift behaviour (C04); LN-metal interface control plus anneal slowed EO relaxation by more than 10^4 [holzgrafe2024; P(abs)]. RC fits of about 11.9 ms with SiO2 cladding vs about 88.6 us uncladded are reported [li2026photonics; P(abs)].
- The anneal temperature must stay below what electrodes and bonding layers tolerate (BCB 320 C [guarino2007]; Nb superconducting electrodes cannot be annealed [shen2024; P]).

---

## 5.9 Electrodes

### L1
Gold electrodes a few micrometres from the waveguide carry the microwave signal. They are made by lift-off: resist is patterned, metal is evaporated over it, and the resist is dissolved so that only the pattern stays.

### L2

| Electrode | Value | Source; status |
|---|---|---|
| Ti/Au, DUV lift-off, e-beam evaporation | 5 nm Ti + 400 nm Au | [li2023nc; P] |
| Au, lift-off, segmented TW electrodes | 800 nm Au; gap 5 um; on 600 nm film, 350 nm etch, quartz handle; 1 um SiO2 cladding | [kharel2021; P (arXiv)] |
| Au, two lift-offs | 200 nm T-segments, 1.1 um unloaded electrodes; signal width 75 um; gap 1.8 um; Si undercut by isotropic ICP etch | [chen2022; P] |
| DUV lift-off with a dielectric sacrificial layer (LiTaO3 analog) | PECVD SiO2 thicker than the metal, patterned, BHF undercut, evaporate, lift off | [wang2024nature; P, LT analog] |
| Cr/Au poling electrodes | 40 nm Cr + 30 nm Au, AZ-5214E lift-off | [chen2024materials; P] |
| Nb (superconducting) | 200-300 nm, e-beam evaporated at 2 x 10^-8 torr, about 10 Å/s, PMMA lift-off | [shen2024; P (arXiv)] |
| Waveguide-electrode geometry (2018) | w = 900 nm, rib 400 nm, slab 300 nm, gap 3.5 um; loss about 3 dB/cm; about 5 dB/facet | [wang2018oe; P (arXiv)] |

### L3
- Electrode-gap choice trades VpiL against metal absorption; a 900 nm overcladding allowed a 1.8 um gap without excess absorption [chen2022; P].
- Thick Au lowers RF loss; segmented electrodes break the voltage-bandwidth limit (C06).
- The 2018 MZM at CMOS-compatible voltages used x-cut TFLN with Au electrodes beside etched ridges [wang2018nature; P(abs)]; its main-text Vpi and bandwidth were not read (abstract only).

---

## 5.10 Periodic poling of thin films

### L1
To convert colours efficiently, the crystal's polarization is flipped in stripes a few micrometres wide. A comb electrode on the film carries a short high-voltage pulse; under each tooth the domains reverse.

### L2

| Quantity | Value | Source; status |
|---|---|---|
| Bulk CLN poling field | 21 kV/mm | [langrock2007; P], [volk2008 Table 7.1; P-comp] |
| First-order QPM by external-field poling (1993) | room temperature; 20.7 mW blue; 600 %/W cm^2 | [yamada1993; P(abs)] |
| Wafer-scale TFLN poling | 4-inch, 600 nm x-cut on 4.7 um SiO2 on 500 um Si; periods 4.38-5.51 um; reversal lengths 0.5-10.17 mm; about 1 cm^2 per operation; 100% success, 98% high-quality on average; 50% duty cycle | [chen2024materials; P] |
| Poling pulse | peak field above 3 Ec; silicone oil against air breakdown; current monitored | [chen2024materials; P] |
| Minimum field for domain growth in thin film | 28.2 kV/mm (quoted from their ref. 20) | [chen2024materials; S] |
| Shortest x-cut TFLN period | 600 nm | [zhao2020jap; P(abs)] |
| Bipolar preconditioning, MgO:TFLN | submicrometre periods (747 nm) | [nagy2020; P(abs)] |
| First nanophotonic PPLN waveguides (2018) | 2600 %/W/cm^2 at a 4 um period | [wang2018optica; P(abs)] |
| Poling with in-situ SHG monitoring | efficiency value not verified | [rao2019; P(title)] |

### L3
- Thin-film coercive fields exceed bulk; candidate reasons given are bonding to SiO2 and Li+ out-diffusion during LNOI annealing [chen2024materials; P (as hypothesis)].
- Domain quality is checked by confocal SH microscopy and PFM [chen2024materials; P], [zhao2020jap; P(abs)]; in bulk, by HF etching of the -z face for 20 min [langrock2007; P].

> FIGURE F05-10 (thin-film poling) placed here.

---

## 5.11 Dicing, facets, packaging, fiber attach

### L1
A finished wafer is cut into chips. Light enters through a polished or etched facet, and a fiber is aligned and fixed in front of a taper that enlarges the sub-micrometre mode to fiber size.

### L2

| Step | Value | Source; status |
|---|---|---|
| Chip separation, wafer-scale | deep dry etch, then backside grinding: clean, vertical facets without a Si pedestal | [li2023nc; P] |
| Chip release (LiTaO3 analog) | SiO2 boundary etch (F chemistry), Bosch Si etch, backside grind | [wang2024nature; P, LT analog] |
| Inverse taper to lensed fiber, strip | 250 nm tip; about 3 dB/facet | [li2023nc; P] |
| Bilayer inverse taper to lensed fiber, rib | < 1.7 dB/facet | [he2019ol; P(abs)] |
| Typical before couplers | > 10 dB/facet | [he2019ol; P(abs)] |
| Grating couplers | about 6 dB per facet | [kharel2021; P] |
| Photonic wire bonding to TFLN | amplifier-TFLN hybrid laser | [franken2025; P(abs)] |

### L3
- Packaged TFLN modulator outlines, adhesives, and hermeticity were not found in a primary source (Q9).
- Coupling losses are not comparable across tapers without stating fiber mode field diameter and polarization.

---

## 5.12 The Process viewer

### L1
The viewer plays the making of a thin-film LN modulator, forward or backward, from a powder charge to a fibered chip. Every number on screen says where it came from.

### L2
- Flow: `process-flow.yaml`, 3 shared phases (crystal, wafer, LNOI) and 2 device routes: `ridge_duv` anchored on Luke et al. 2020 (DUV, SiO2 mask, Ar ICP-RIE) with electrodes from Kharel et al. 2021 (analog), and `strip_dlc` anchored on Li et al. 2023 (DUV, DLC, Ar IBE, SC-1, Ti/Au, etched facets).
- Provenance count (`process-flow.yaml` summary block): most crystal and LNOI values are analogs or template, as expected for a composite flow; each device route draws its reported values from its anchor paper.

### L3
Specification: `figures.md` F05-01. Engine rules carried over from R13: deterministic scene f(step, t); step-boundary snapshot cache; forward vs backward state mismatch 0; one frozen z-map per step; persistent camera re-targeted only on flip, bond, split, or dice; HUD with real process time and parameters with status badges; render on demand.
