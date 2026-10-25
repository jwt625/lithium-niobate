# 01 The crystal: open questions

Lane C01, 2026-10-25. Items that are unverified, conflicting, or need the author's decision. IDs are referenced from `manuscript.md` and `figures.md` where relevant.

## A. Author decisions

| ID | Question | Lane recommendation |
|---|---|---|
| A1 | Which Ps to use where one number is needed (poling charge, bound charge): 0.71 C/m^2 (volk2008, hsu1997 "experimental") or 0.80 C/m^2 (gopalan1998)? | Display the range 0.71-0.80 C/m^2; compute with 0.71 and show the choice in the readout popup. |
| A2 | Status code for abstract-only reads. DevLog-004 lists no "P(abs)"; R06 uses it. This lane wrote status P with locator "abstract". | Lane API adds an optional `read_scope: abstract | full | pages` field rather than a new status. |
| A3 | Should the page-background Li-vacancy texture follow the Li-site model only (as now), or offer the Nb-site model? | Li-site model (commonly accepted per volk2008); Nb-site model only inside FIG-01-03. |
| A4 | Thin-film poling depth: keep in Chapter 05 with a pointer here (current), or add an L2 table here? | Keep in Chapter 05. |

## B. Conflicts in sources (shown as ranges or flagged on the page)

| ID | Item | Conflict | Current handling |
|---|---|---|---|
| B1 | Ps | 62 / 71 uC/cm^2 (volk2008 Table 1.1, whose Ps reference [24] is an LiTaO3 paper per Crossref) vs 80 +- 5 uC/cm^2 (gopalan1998, both compositions, no composition dependence). | Range; SLN 62 uC/cm^2 not shown as an LN value. Read gopalan1998 full text and chen2001 (volk2008's other Ps source). |
| B2 | Near-SLN Ec | 6.0-6.5 kV/mm (volk2008 Table 7.1) vs 2.1-2.5 kV/mm (volk2008 p. 118, citing gopalan1998, whose abstract gives only a ratio). Ratio CLN/SLN 4-5 (gopalan1998) vs about 3 (chen2001). | Table value with flag. Need gopalan1998 full text, chen2001 full text, Bermudez et al. 2000 (Ec vs Li content). |
| B3 | CLN Eint | volk2008 Table 7.1 prints "2-33 kV/cm"; text gives 33.5 then 22.2 kV/cm; gopalan1998 abstract about 25 kV/cm. | Shown as 2.2-3.4 kV/mm. |
| B4 | Congruent composition | 48.38 (vendor, UV-edge reference), 48.45 (volk2008), 48.4 (gopalan1998), 48.6 (carruthers1971), Li/Nb 0.946 (weis1985). | Prose "about 48.4-48.5 mol%"; each value tabulated with source. |
| B5 | volk2008 R1 | p. 5 prints R1 = 0.969 next to R2 = 0.4845; p. 10 gives 0.94; R2 = 0.4845 implies R1 = 0.940 (derived). | Use 0.940; flag the misprint. |
| B6 | Paraelectric space group | volk2008 p. 2 prints "R3m"; COD high-temperature entries (boysen1994) and inbar1996 give R-3c. | R-3c. |
| B7 | Near-SLN melting point | volk2008 Table 1.1 prints "<1200 C" while its own near-SLN Tc is 1206 C; a Curie point above the melting point is impossible. | Not displayed. Need a primary SLN melting point (Nikogosyan 2005 is volk2008's source). |
| B8 | Tc in weis1985 | "approximately 1210 C" (text) vs 1165 C (Table 1 sample). | Not used as a headline; volk2008 values used. |
| B9 | OH peak positions, congruent | volk2008 p. 24: 3482 and 3467 cm^-1; volk2008 Table 2.4: 3478, 3491 cm^-1 (different original references). bryan1984: 2.87 um line. | Text values shown; Table 2.4 used only for the below/above-threshold jump. Read the originals (Kovacs, Polgar). |
| B10 | Li and Nb displacement magnitudes | volk2008 p. 10: Li 44 pm "from the oxygen plane", Nb 26-27 pm; hsu1997-derived O-fixed frame: Li 0.713 A, Nb 0.275 A; Nb-fixed frame Li 0.438 A. | Table of three frames (derived); volk2008 values explained as mixed frames. |
| B11 | Displacive vs order-disorder | weis1985 calls LN displacive; inbar1996 argues order-disorder character; neutron data show Li disorder at high T. | Presented as an open debate. |
| B12 | Defect model | Li-site vacancy (iyi1992) vs Nb-site vacancy (abrahams1986) vs coexistence (Wilkinson et al. 1993). | Both models shown in FIG-01-03; Li-site as default. |
| B13 | Mg threshold mechanism | Antisite removal vs partial Nb-site incorporation; "first threshold" debate (volk2008 pp. 38-40). | Both described; site-occupancy table labelled "one proposed scheme". |
| B14 | werner2017 near-SLN MgO content | 1.2 mol% (Results) vs 1.3 mol% (Methods). Also its "coercive field of about 3 kV/mm" for its samples differs from volk2008's 6.0-6.8 kV/mm table average for 5% MgO CLN. | Neither number used. |

## C. Unverified or only partially read (need full text before upgrading status)

| ID | Item | Needed source |
|---|---|---|
| C1 | Polaron band shapes (Reik-type formula, volk2008 Eq. (2.11) prints garbled in extraction) and peak energies at P level | schirmer2009 full text (open question for FIG-01-04). |
| C2 | Single-domain preparation method of 1966 (poling recipe) | nassau1966b full text. |
| C3 | Domain-wall orientation conventions (X-wall vs Y-wall naming in volk2008 "yz glide planes" vs lee2011 "(11-20)") | Confirm with gopalan2007 or Scrymgeour et al., PRB 71, 184110 (2005) (doi:10.1103/PhysRevB.71.184110, title verified, abstract not available). |
| C4 | Domain shape in near-SLN from experiment (lee2011 is DFT; gopalan1999 is congruent) | An experimental SLN domain-shape paper (gopalan2007 review likely covers it). |
| C5 | IEEE 176-1987 rule text | Read by note-R14 only; this lane relied on that record. |
| C6 | Abrahams 1966 structure details (Li and Nb positions at 24 C) | Only titles and COD lattice values used. |
| C7 | Zhong 1980 Mg threshold (4.6% Mg) | Original IQEC abstract (no DOI). |
| C8 | Hydrogen concentration calibration (cross-section 4 x 10^-19 cm^2; volk2008 prints the unit as cm^-2) | Original refs [109, 111, 112] of volk2008. |
| C9 | Myers 1995 backswitching numbers (critical time >= 50 ms at 25 kV/mm) | myers1995 full text (Optica license may allow reading). |
| C10 | Wall energy 0.2-0.4 J/m^2 (calculated by Yang et al. 1999 from wall bowing) | Yang, Gopalan, Swart, Mohideen, PRL 82, 4106 (1999). |
| C11 | Hirshfeld charge statement in hsu1997 abstract ("The Li atom's negative charge") | hsu1997 full text before any display; currently mentioned only as Ps 0.43 vs 0.71 C/m^2. |

## D. Requests to other lanes

| ID | Lane | Request |
|---|---|---|
| D1 | API | Move `mockup/data/linbo3-cell.json` to `data/structure/`; add property rows with variant keys for Ps (range), Tc (CLN, SLN, fits), Ec and Eint (per crystal, conflicts as separate rows), dopant thresholds with a `basis` field (MgO/(Li2O + MgO + Nb2O5) vs MgO/(LiNbO3 + MgO)) and a `melt_or_crystal` field; new tables `defects/centres.yaml`, `domains/wall-scales.yaml`, `composition/tc-fits.yaml`, `composition/uv-edge.yaml`. |
| D2 | PHY | Functions listed per figure in `figures.md`: `crystal.ts`, `composition.ts`, `tensor.ts` additions (`groupOps3m`, `symmetrize`, `relations`, `stabilizer`), `poling.ts`, `hysteresis.ts` (template), `domainWall.ts`. Unit tests: spot values in figures.md acceptance rows. |
| D3 | C02 | Uses this chapter's axis conventions and tensor forms; the transverse-field symmetry statement (E || x gives point symmetry 1, E || y gives m) should match the ellipsoid figure text in Chapter 02. |
| D4 | C04 | Owns pyroelectric coefficient values and photorefraction; FIG-01-07 links there for |p3|. |
| D5 | C05 | Owns poling process detail for bulk and thin film, Ti in-diffusion and proton exchange. |
| D6 | C07 | Milestone dates in Sec. 9 should match the chronology entries (Feng 1980, Yamada 1993, Myers 1995, Nassau 1965-1966). |
