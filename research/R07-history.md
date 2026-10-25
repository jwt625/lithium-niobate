# R07: History of lithium niobate, 1928 to 2026

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R07 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Scope | Dated events, people, institutions, primary citations, lay hooks, open-license images, dating controversies, narrative chapters |
| Method | Bibliographic metadata (title, authors, journal, volume, pages, issue date) checked one DOI at a time against the Crossref REST API on 2026-10-24. Company and institutional claims checked on primary pages (press releases, company sites) where those could be fetched. Image licenses checked against the Wikimedia Commons API (`extmetadata`). No files were downloaded. |
| Limits | Paper bodies were mostly not read; paywalled publisher pages returned HTTP 403. Most institution lines come from standard attribution and were not re-checked against the paper's byline (marked `*`). The shared web-search budget ran out partway through, so several leads are parked in the Unverified table. |

## Legend

- **Status V**: Crossref or a primary page confirms the publication or announcement (title, authors, date). The significance line restates the title or abstract, or the standard reading of the result.
- **Status P**: the publication itself is confirmed, but its link to the specific LN claim comes from a secondary source.
- **Status S**: secondary or trade-press source only (named in the row).
- `*` after an institution: standard attribution, not re-checked against the byline.
- Dates are issue dates from Crossref (`published-print`, or `issued` when there is no print date). Online-first dates can be earlier.

---

## 1. Timeline (verified and partially verified)

### 1.1 Discovery and characterization, 1928-1966

| Date | Event | People | Institution | Primary citation | Significance | Lay hook (<=20 words) | St |
|---|---|---|---|---|---|---|---|
| 1928 (Oslo series; one catalog lists the volume as appearing in 1929) | Structural survey of ABO3 compounds. Reviews cite it as the first report of LiNbO3. | W. H. Zachariasen | Univ. of Oslo (doctoral work under V. M. Goldschmidt, per biographies) | "Untersuchungen über die Kristallstruktur von Sesquioxyden und Verbindungen ABO3", Skr. Nor. Vidensk.-Akad. Oslo, Mat.-Naturvidensk. Kl. 1928, No. 4. Cited for LN by Bartasyte et al., Adv. Mater. Interfaces 2017, doi:10.1002/admi.201600998 | Earliest structural mention found. The original text was not inspected. | A young Norwegian crystallographer lists LiNbO3 among many oxides; its fame comes decades later. | P |
| 1949-12-15 | Ferroelectricity reported in LiNbO3 and LiTaO3 | B. T. Matthias, J. P. Remeika | Bell Telephone Laboratories* | Phys. Rev. 76, 1886 (1949), doi:10.1103/PhysRev.76.1886.2 | Identifies LN as ferroelectric. The title says "ilmenite structure"; later work (1966 series below) showed the LN structure is related to ilmenite but distinct from it. | Two Bell Labs scientists find a crystal with a built-in, flippable electric arrow. | V |
| 1958-12 | Li2O-Nb2O5 phase diagram | A. Reisman, F. Holtzberg | IBM* | J. Am. Chem. Soc. 80, 6503 (1958), doi:10.1021/ja01557a010 | Liquidus maximum near 48.6 mol% Li2O (as summarized in a 2021 review, PMC8617696). This is the root of the "congruent" composition. | The recipe card: the crystal prefers to be slightly short on lithium. | V |
| 1962-09-15 | Theory of nonlinear wave mixing, including the periodic-reversal (QPM, quasi-phase-matching) idea | J. A. Armstrong, N. Bloembergen, J. Ducuing, P. S. Pershan | Harvard* | Phys. Rev. 127, 1918 (1962), doi:10.1103/PhysRev.127.1918 | Foundational nonlinear-optics paper. QPM went unrealized for decades and became the basis of PPLN (periodically poled LN). | Flip the crystal's grain every few microns and light waves keep adding up instead of cancelling. | V |
| 1964-08-01 | Electro-optic properties of LiNbO3 | G. E. Peterson, A. A. Ballman, P. V. Lenzo, P. M. Bridenbaugh | Bell Labs* | Appl. Phys. Lett. 5, 62 (1964), doi:10.1063/1.1754053 | Among the first EO (electro-optic) measurements on LN | Apply a voltage and the crystal changes how fast light travels through it. | V |
| 1964-12-01 | "LiNbO3: an efficient phase matchable nonlinear optical material" | G. D. Boyd, R. C. Miller, K. Nassau, W. L. Bond, A. Savage | Bell Labs* | Appl. Phys. Lett. 5, 234 (1964), doi:10.1063/1.1723604 | Establishes LN as a practical frequency-conversion crystal | Shine infrared in, get green out: the crystal can change light's color. | V |
| 1965-02 | Czochralski growth of piezoelectric and ferroelectric crystals, LN included | A. A. Ballman | Bell Labs* | J. Am. Ceram. Soc. 48, 112 (1965), doi:10.1111/j.1151-2916.1965.tb11814.x | Large single crystals pulled from the melt. This is the standard "first Czochralski LN" citation (but see Controversies). | Dip a seed into a glowing oxide melt, pull slowly, and a glassy boule grows. | V |
| 1965-02-15 | Noncritical (90 degree) phase matching in LN | R. C. Miller, G. D. Boyd, A. Savage | Bell Labs* | Appl. Phys. Lett. 6, 77 (1965), doi:10.1063/1.1754174 | Temperature-tuned phase matching with no walk-off | Warm the crystal just right and the colors line up perfectly. | V |
| 1965-06-01 | Domain structure and etching | K. Nassau, H. J. Levinstein, G. M. Loiacono | Bell Labs* | Appl. Phys. Lett. 6, 228 (1965), doi:10.1063/1.1754147 | Acid etching shows the ferroelectric domains, the start of domain engineering | Acid reveals hidden "north" and "south" regions inside the crystal. | V |
| 1965-06-14 | Tunable coherent parametric oscillation in LiNbO3 (widely credited as the first OPO, optical parametric oscillator) | J. A. Giordmaine, R. C. Miller | Bell Labs* | Phys. Rev. Lett. 14, 973 (1965), doi:10.1103/PhysRevLett.14.973 | The first widely tunable coherent source based on nonlinear optics | The first "rainbow laser": one color in, tunable colors out. | V |
| 1965-08-01 | Elastic wave propagation in LN | E. G. Spencer, P. V. Lenzo, K. Nassau | Bell Labs* | Appl. Phys. Lett. 7, 67 (1965), doi:10.1063/1.1754303 | Acoustic constants for acousto-optic and SAW (surface acoustic wave) use | The crystal is also a superb bell: sound rings through it cleanly. | V |
| 1965-12-15 | Interdigital transducer (IDT): direct piezoelectric coupling to surface elastic waves | R. M. White, F. W. Voltmer | UC Berkeley* | Appl. Phys. Lett. 7, 314 (1965), doi:10.1063/1.1754276 | Invention of the IDT, the basis of every SAW filter. Substrate not verified here (see Unverified). | Comb-shaped electrodes turn radio signals into tiny earthquakes on a chip. | V |
| 1966 | Electro-optic light modulators (review) | I. P. Kaminow, E. H. Turner | Bell Labs* | Proc. IEEE 54, 1374 (1966), doi:10.1109/PROC.1966.5124; also Appl. Opt. 5, 1612 (1966) | Early framework for EO modulators, LN prominent | - | V |
| 1966-05 | EO coefficients of single-domain LN | P. V. Lenzo, E. G. Spencer, K. Nassau | Bell Labs* | J. Opt. Soc. Am. 56, 633 (1966), doi:10.1364/JOSA.56.000633 | Reference r-coefficients on poled crystal | - | V |
| 1966-06 | "Ferroelectric lithium niobate" five-part series: (1) growth, domains, dislocations, etching; (2) single-domain preparation; (3) X-ray structure at 24 C; (4) neutron structure at 24 C; (5) polycrystal X-ray, 24-1200 C | K. Nassau, H. J. Levinstein, G. M. Loiacono (1, 2); S. C. Abrahams, J. M. Reddy, J. L. Bernstein (3); Abrahams, W. C. Hamilton, Reddy (4); Abrahams, Levinstein, Reddy (5) | Bell Labs* (Hamilton: Brookhaven*) | J. Phys. Chem. Solids 27, 983 / 989 / 997 / 1013 / 1019 (1966), doi:10.1016/0022-3697(66)90070-9 through 90074-6. Abstracts also in Solid State Commun. 4 (1966-03) | Definitive structure (R3c) and the poling recipe. The single-domain wafer begins here. | Bell Labs publishes the crystal's full biography in five chapters, all in one journal issue. | V |

### 1.2 The damage that became a feature, 1966-1976

| Date | Event | People | Institution | Primary citation | Significance | Lay hook | St |
|---|---|---|---|---|---|---|---|
| 1966-07-01 | Discovery of "optical damage" (now: photorefractive effect) | A. Ashkin, G. D. Boyd, J. M. Dziedzic, R. G. Smith, A. A. Ballman, J. J. Levinstein, K. Nassau | Bell Labs* | Appl. Phys. Lett. 9, 72 (1966), doi:10.1063/1.1754607 | A laser beam left lasting refractive-index changes, a nuisance for nonlinear optics that later enabled holography. Ashkin later won the 2018 Nobel Prize in Physics for optical trapping. | A laser beam leaves a ghostly scar in the crystal. Annoying, until someone stores pictures in it. | V |
| 1967-07-01 | First reports of reducing damage susceptibility | H. J. Levinstein, A. A. Ballman, R. T. Denton, A. Ashkin, J. M. Dziedzic | Bell Labs* | J. Appl. Phys. 38, 3101 (1967), doi:10.1063/1.1710070 | The start of the 60-year fight against photorefraction | - | V |
| 1968-01 | Stoichiometry of LN single crystals (congruent composition) | P. Lerner, C. Legras, J. P. Dumas | France* | J. Cryst. Growth 3-4, 231 (1968), doi:10.1016/0022-0248(68)90139-5 | Shows that commercial "LiNbO3" is Li-deficient | Nearly every commercial LN crystal is slightly lithium-poor, by design. | V |
| 1968-10-01 | Holographic storage in LN | F. S. Chen, J. T. LaMacchia, D. B. Fraser | Bell Labs* | Appl. Phys. Lett. 13, 223 (1968), doi:10.1063/1.1652580 | Turns optical damage into a recording medium | The "damage" becomes a memory: holograms written inside a crystal. | V |
| 1969-07-01 | Charge-drift model of optically induced index change | F. S. Chen | Bell Labs* | J. Appl. Phys. 40, 3389 (1969), doi:10.1063/1.1658195 | First mechanism model (charge transport plus EO effect) | - | V |
| 1971-04-01 | Nonstoichiometry and crystal growth | J. R. Carruthers, G. E. Peterson, M. Grasso, P. M. Bridenbaugh | Bell Labs* | J. Appl. Phys. 42, 1846 (1971), doi:10.1063/1.1660455 | Congruent melt composition for uniform boules | - | V |
| 1971-06-15 | Thermal fixing of holograms | D. L. Staebler, J. J. Amodei | RCA Laboratories* | Appl. Phys. Lett. 18, 540 (1971), doi:10.1063/1.1653530. Fe-doped LN: Amodei, Phillips, Staebler, IEDM 1971, doi:10.1109/IEDM.1971.188425; Appl. Opt. 11, 390 (1972) | Fe:LN and fixing made long-lived holograms possible | Bake the crystal and the hologram stays put. | V |
| 1973-05-15 | "Thin-film LiNbO3 electro-optic light modulator" | I. P. Kaminow, J. R. Carruthers, E. H. Turner, L. W. Stulz | Bell Labs* | Appl. Phys. Lett. 22, 540 (1973), doi:10.1063/1.1654500 | Per the Crossref abstract, the "thin film" is an out-diffused planar optical waveguide in bulk LiNbO3 (broadband phase modulator, 3.2 GHz), not a thin film on insulator (audit A, 2026-10-24) | In 1973 "thin-film LN" meant a light-guiding skin made by letting lithium escape from the crystal surface. | V |
| 1974-08-15 | Bulk photovoltaic effect as the photorefractive driver | A. M. Glass, D. von der Linde, T. J. Negran | Bell Labs* | Appl. Phys. Lett. 25, 233 (1974), doi:10.1063/1.1655453 | Explains how light builds kV/cm fields inside LN | Light alone pushes charge through the crystal, building surprisingly high voltages. | V |
| 1974-10-15 | Metal (Ti) indiffused optical waveguides | R. V. Schmidt, I. P. Kaminow | Bell Labs* | Appl. Phys. Lett. 25, 458 (1974), doi:10.1063/1.1655547 | Ti:LN waveguides, the workhorse of 40 years of telecom modulators | Bake titanium stripes into the crystal and light follows them like wires. | V |
| 1974-11-15 | Epitaxial LN waveguides, beam scanning and deflection | P. K. Tien, S. Riva-Sanseverino, A. A. Ballman | Bell Labs* | Appl. Phys. Lett. 25, 563 (1974), doi:10.1063/1.1655311 | Early thin LN film guiding work | - | V |
| 1976 | Optimum rotated Y-cut LN for SAW filters (about 128 degrees) | K. Shibayama, K. Yamanouchi, H. Sato, T. Meguro | Tohoku Univ.* | Proc. IEEE 64, 595 (1976), doi:10.1109/PROC.1976.10181 | The 128 Y-X LN cut, later standard for SAW | Cut the crystal at exactly the right angle and the sound behaves perfectly. | V |

### 1.3 Taming the crystal, and the telecom era, 1980-2000

| Date | Event | People | Institution | Primary citation | Significance | Lay hook | St |
|---|---|---|---|---|---|---|---|
| 1980-06 | MgO doping raises optical-damage resistance | Zhong Gi-Guo, Jin Jian, Wu Zhong-Kang | Not verified (often attributed to Nankai Univ.) | 11th Int. Quantum Electronics Conf. (IQEC), Washington DC, 1980-06, IEEE Cat. 80CH1561-0, p. 631. Also cited as J. Opt. Soc. Am. 70, 631 (1980), conference abstract | Origin of MgO:LN. Priority over Bryan 1984 is often emphasized (see Controversies). | A pinch of magnesium makes the crystal shrug off intense light. | P |
| 1980-10-01 | SHG enhancement in LN with periodic laminar domains made by growth striations | D. Feng (Feng Duan*), N.-B. Ming, J.-F. Hong, Y.-S. Yang, J.-S. Zhu, Z. Yang, Y.-N. Wang | Nanjing Univ.* | Appl. Phys. Lett. 37, 607 (1980), doi:10.1063/1.92035 | First experimental QPM in periodically domained LN | Wobble the crystal while growing it and you get built-in stripes that double light's frequency. | V |
| 1982-08 | Waveguide electro-optic modulators (review) | R. C. Alferness | Bell Labs* | IEEE Trans. Microw. Theory Tech. 30, 1121 (1982), doi:10.1109/TMTT.1982.1131213 | Canonical Ti:LN modulator review | - | V |
| 1982-10-01 | Proton exchange (benzoic acid) waveguides | J. L. Jackel, C. E. Rice, J. J. Veselka | Bell Labs* | Appl. Phys. Lett. 41, 607 (1982), doi:10.1063/1.93615 | Low-temperature, high-index, damage-resistant waveguides; later the basis of APE (annealed proton exchange) PPLN waveguides | Swap lithium for hydrogen in an acid bath and you have a waveguide. | V |
| 1984-05-01 | Increased optical damage resistance (MgO:LN) | D. A. Bryan, R. Gerson, H. E. Tomaschke | Not verified | Appl. Phys. Lett. 44, 847 (1984), doi:10.1063/1.94946 | The widely cited journal report for MgO:LN | - | V |
| 1985 | First commercially available guided-wave modulator (high-speed intensity modulator) announced by Crystal Technology, Inc. | - | Crystal Technology, Inc. (Palo Alto) | R. A. Becker, "Optical-guided-wave modulators", MRS Bull. 13(8), 21 (1988), doi:10.1557/S0883769400064630 | Start of commercial LN integrated optics | The first light-switch-on-a-chip you could buy. | S |
| 1985-08 | "Lithium niobate: summary of physical properties and crystal structure" | R. S. Weis, T. K. Gaylord | Georgia Tech* | Appl. Phys. A 37, 191 (1985), doi:10.1007/BF00614817 | Standard property compendium | - | V |
| 1989-02-02 / 1989-05-25 | Green, then blue, SHG in periodically poled LN waveguides | E. J. Lim, M. M. Fejer, R. L. Byer (+ W. J. Kozlovsky for blue) | Stanford* (Kozlovsky: IBM*) | Electron. Lett. 25, 174 (1989), doi:10.1049/el:19890127; Electron. Lett. 25, 731 (1989), doi:10.1049/el:19890495 | Waveguide QPM in LN | - | V |
| 1990-01-08 | Blue SHG in bulk periodically poled LN | G. A. Magel, M. M. Fejer, R. L. Byer | Stanford* | Appl. Phys. Lett. 56, 108 (1990), doi:10.1063/1.103276 | Bulk QPM | - | V |
| 1992 | QPM SHG: tuning and tolerances (theory) | M. M. Fejer, G. A. Magel, D. H. Jundt, R. L. Byer | Stanford* | IEEE J. Quantum Electron. 28, 2631 (1992), doi:10.1109/3.161322 | The standard QPM design reference | - | V |
| 1993-02-01 | First-order QPM waveguide periodically poled by an external electric field | M. Yamada, N. Nada, M. Saitoh, K. Watanabe | Sony* | Appl. Phys. Lett. 62, 435 (1993), doi:10.1063/1.108925 | Electric-field poling, the method still used for PPLN | Zap the crystal through a comb electrode and its domains flip in a precise pattern. | V |
| 1993-06-01 | Angle-multiplexed storage of 5000 holograms in LN | F. H. Mok | Not verified | Opt. Lett. 18, 915 (1993), doi:10.1364/OL.18.000915 | Peak of the holographic data-storage era | 5000 holograms stacked in one crystal, just by tilting the beam. | V |
| 1995-01-01 / 1995-11 | QPM OPOs in bulk PPLN | L. E. Myers, R. C. Eckardt, M. M. Fejer, R. L. Byer, W. R. Bosenberg, J. W. Pierce (G. D. Miller on the OL paper) | Stanford* (with industry co-authors) | Opt. Lett. 20, 52 (1995), doi:10.1364/OL.20.000052; J. Opt. Soc. Am. B 12, 2102 (1995), doi:10.1364/JOSAB.12.002102 | PPLN becomes the standard mid-IR OPO crystal | Thirty years after the first OPO, the same crystal does it better with stripes. | V |
| 1995-07-06 | Smart Cut (H implantation plus bonding) for silicon-on-insulator | M. Bruel | CEA-LETI* | Electron. Lett. 31, 1201 (1995), doi:10.1049/el:19950805 | The process family later adapted to LN | - | V |
| 1997-10-15 | Temperature-dependent Sellmeier equation for n_e of congruent LN | D. H. Jundt | Not verified | Opt. Lett. 22, 1553 (1997), doi:10.1364/OL.22.001553 | Most-used PPLN design dispersion data | - | V |
| 1998-10-19 | Single-crystal LN films by crystal ion slicing (CIS) | M. Levy, R. M. Osgood Jr., R. Liu, L. E. Cross, G. S. Cargill III, A. Kumar, H. Bakhru | Columbia Univ.* (with Penn State* and SUNY Albany* co-authors) | Appl. Phys. Lett. 73, 2293 (1998), doi:10.1063/1.121801 | Birth of LNOI (LN on insulator) | Implant helium, heat, and peel off a crystal layer thinner than a soap bubble. | V |
| 2000-01 | Review of LN modulators for fiber-optic communications | E. L. Wooten, K. M. Kissa, A. Yi-Yan, E. J. Murphy, D. A. Lafaw, P. F. Hallemeier, et al. | Industry (affiliation not checked) | IEEE J. Sel. Top. Quantum Electron. 6, 69 (2000), doi:10.1109/2944.826874 | Snapshot of the commercial Ti:LN modulator at the dot-com peak | - | V |

### 1.4 Peeling the crystal: LNOI, 2004-2016

| Date | Event | People | Institution | Primary citation | Significance | Lay hook | St |
|---|---|---|---|---|---|---|---|
| 2004-11-15 | Submicrometer LN slab waveguides by CIS plus wafer bonding | P. Rabiei, P. Günter | ETH Zurich* | Appl. Phys. Lett. 85, 4603 (2004), doi:10.1063/1.1819527 | Bonded sub-micron LN films with EO function | - | V |
| 2007-07 | Electro-optically tunable microring resonators in LN | A. Guarino, G. Poberaj, D. Rezzonico, R. Degl'Innocenti, P. Günter | ETH Zurich* | Nat. Photonics 1, 407 (2007), doi:10.1038/nphoton.2007.93 | First high-profile TFLN microring | A racetrack for light, tuned by voltage, carved in a film of crystal. | V |
| 2009-09-17 | MgO-doped PPLN chips for 1060 to 530 nm green conversion (pico-projectors, HUDs) | - | Crystal Technology (EPCOS subsidiary) | Product news, electronicsonline.net.au, 2009-09-17 | PPLN as a mass-market green source for projectors | Your pocket projector's green may have come from a striped crystal. | S |
| 2009-12-21 | "Lithium niobate photonic wires" | H. Hu, R. Ricken, W. Sohler | Univ. Paderborn* | Opt. Express 17, 24261 (2009), doi:10.1364/OE.17.024261 | Early LNOI ridge waveguides | - | V |
| 2010 | NANOLN (Jinan Jingzheng Electronics) established; supplies LNOI and LTOI wafers | - | Jinan, China | nanoln.com "About NanoLN" ("established in 2010") | The commercial wafer supply that much of the 2017+ revival ran on | - | S (company statement) |
| 2011-03 | Gooch & Housego acquires Crystal Technology, LLC; crystal growth moved from Palo Alto to Cleveland | - | Gooch & Housego | G&H release, photonicsonline.com, 2013-03-15 | Consolidation of US bulk LN | - | S |
| 2012-07-16 | "Lithium niobate on insulator (LNOI) for micro-photonic devices" (review) | G. Poberaj, H. Hu, W. Sohler, P. Günter | ETH Zurich* / Paderborn* | Laser Photonics Rev. 6, 488 (2012), doi:10.1002/lpor.201100035 | Platform review that names "LNOI" | - | V |
| 2014-12-15 | Integrated high-Q LN microdisk resonators | C. Wang, M. J. Burek, Z. Lin, H. A. Atikian, V. Venkataraman, I.-C. Huang, et al. | Harvard* | Opt. Express 22, 30924 (2014), doi:10.1364/OE.22.030924 | Start of the Lončar-group TFLN line | - | V |

### 1.5 Thin-film renaissance, 2017-2023

| Date | Event | People | Institution | Primary citation | Significance | Lay hook | St |
|---|---|---|---|---|---|---|---|
| 2017-02-15 | Heterogeneous LN/SiN waveguides at wafer scale | L. Chang, M. H. P. Pfeiffer, N. Volet, ..., T. J. Kippenberg, J. E. Bowers | UCSB* / EPFL* | Opt. Lett. 42, 803 (2017), doi:10.1364/OL.42.000803 | Hybrid route to wafer-scale LN PICs (photonic integrated circuits) | - | V |
| 2017-12-20 | Monolithic ultra-high-Q LN microring | M. Zhang, C. Wang, R. Cheng, A. Shams-Ansari, M. Lončar | Harvard* | Optica 4, 1536 (2017), doi:10.1364/OPTICA.4.001536 | Showed that etched TFLN can be very low loss | Etch the notoriously hard-to-etch crystal smooth enough that light circles thousands of times. | V |
| 2018-01-22 | Nanophotonic LN EO modulators | C. Wang, M. Zhang, B. Stern, M. Lipson, M. Lončar | Harvard* / Columbia* | Opt. Express 26, 1547 (2018), doi:10.1364/OE.26.001547 | Precursor to the Nature paper | - | V |
| 2018 | HyperLight founded, spun out of Harvard | Mian Zhang (CEO, co-founder); Christian Reimer (co-founder, per Optica OPN 2023) | Cambridge MA | Lightwave, 2021-09-13 ("a startup founded out of Harvard in 2018") | Early TFLN startup | - | S |
| 2018-09-03 | Bonded TFLN modulator on a silicon photonics platform, >100 GHz 3 dB electrical bandwidth | P. O. Weigel, J. Zhao, ..., S. Mookherjea | UCSD* / Sandia* | Opt. Express 26, 23728 (2018), doi:10.1364/OE.26.023728 | Hybrid Si plus LN route | - | V |
| 2018-10 | Integrated LN EO modulators at CMOS-compatible voltages | C. Wang, M. Zhang, X. Chen, M. Bertrand, A. Shams-Ansari, S. Chandrasekhar, P. Winzer, M. Lončar | Harvard* / Nokia Bell Labs* | Nature 562, 101 (2018), doi:10.1038/s41586-018-0551-y | The TFLN inflection point: low drive voltage and high bandwidth at once | A modulator that runs on the voltage of a computer chip, not a wall plug. | V |
| 2018-11-20 | Nanophotonic PPLN, ultrahigh-efficiency wavelength conversion | C. Wang, C. Langrock, A. Marandi, M. Jankowski, M. Zhang, B. Desiatov, M. M. Fejer, M. Lončar | Harvard* / Stanford* | Optica 5, 1438 (2018), doi:10.1364/OPTICA.5.001438 | 1990s PPLN meets 2010s TFLN | The 1990s striped crystal, shrunk a hundredfold onto a chip. | V |
| 2019-02-28 | Monolithic LN circuits for Kerr comb generation and modulation | C. Wang, M. Zhang, M. Yu, R. Zhu, H. Hu, M. Lončar | Harvard* | Nat. Commun. 10, 978 (2019), doi:10.1038/s41467-019-08969-6 | - | - | V |
| 2019-03-20 | Ultra-low-loss visible TFLN photonics | B. Desiatov, A. Shams-Ansari, M. Zhang, C. Wang, M. Lončar | Harvard* | Optica 6, 380 (2019), doi:10.1364/OPTICA.6.000380 | - | - | V |
| 2019-04 | Broadband EO frequency comb in an LN microring | M. Zhang, B. Buscaino, C. Wang, A. Shams-Ansari, C. Reimer, R. Zhu, et al. | Harvard* | Nature 568, 373 (2019), doi:10.1038/s41586-019-1008-7 | - | A ruler made of light, with hundreds of evenly spaced colors. | V |
| 2019-05 | Hybrid Si/LN MZMs (Mach-Zehnder modulators) for 100 Gbit/s and beyond | M. He, M. Xu, Y. Ren, J. Jian, Z. Ruan, Y. Xu, et al. (X. Cai) | Sun Yat-sen Univ.* | Nat. Photonics 13, 359 (2019), doi:10.1038/s41566-019-0378-6 | Strong Chinese academic entry into TFLN | - | V |
| 2019-12-20 | PP-TFLN microring, SHG efficiency 250,000%/W | J. Lu, J. B. Surya, X. Liu, A. W. Bruch, Z. Gong, Y. Xu, H. X. Tang | Yale* | Optica 6, 1455 (2019), doi:10.1364/OPTICA.6.001455 | - | - | V |
| 2020-01-20 | Ultrabroadband nonlinear optics in nanophotonic PPLN | M. Jankowski, C. Langrock, B. Desiatov, ..., M. Lončar, M. M. Fejer | Stanford* / Harvard* | Optica 7, 40 (2020), doi:10.1364/OPTICA.7.000040 | - | - | V |
| 2020-08-17 | Wafer-scale low-loss LN PICs | K. Luke, P. Kharel, C. Reimer, L. He, M. Lončar, M. Zhang | HyperLight* / Harvard* | Opt. Express 28, 24452 (2020), doi:10.1364/OE.401959 | Startup-authored wafer-scale process paper | - | V |
| 2021-03-20 | Micro-structured electrodes break the voltage-bandwidth limit | P. Kharel, C. Reimer, K. Luke, L. He, M. Zhang | HyperLight* | Optica 8, 357 (2021), doi:10.1364/OPTICA.416155 | - | - | V |
| 2021-06-30 | "Integrated photonics on thin-film lithium niobate" (review) | D. Zhu, L. Shao, M. Yu, ..., M. Zhang, M. Lončar | Harvard* | Adv. Opt. Photonics 13, 242 (2021), doi:10.1364/AOP.411024 | Standard TFLN review | - | V |
| 2021-11-25 | On-chip EO frequency shifters and beam splitters | Y. Hu, M. Yu, D. Zhu, ..., M. Lončar | Harvard* | Nature 599, 587 (2021), doi:10.1038/s41586-021-03999-x | - | - | V |
| 2022-01-20 | Dual-polarization TFLN IQ modulators for Tb/s transmission | M. Xu, Y. Zhu, ..., X. Cai | Sun Yat-sen* / Huawei* | Optica 9, 61 (2022), doi:10.1364/OPTICA.449691 | Coherent-telecom-grade TFLN | - | V |
| 2023-01-06 | "Lithium niobate photonics: Unlocking the electromagnetic spectrum" (review) | A. Boes, L. Chang, C. Langrock, M. Yu, M. Zhang, Q. Lin, et al. | multi-institution | Science 379, eabj4396 (2023), doi:10.1126/science.abj4396 | - | - | V |
| 2023-03-16 | Ultrafast tunable lasers using LN integrated photonics | V. Snigirev, A. Riedhauser, ..., P. Seidler, T. J. Kippenberg | EPFL* / IBM Zurich* | Nature 615, 411 (2023), doi:10.1038/s41586-023-05724-2 | - | - | V |

### 1.6 Into the AI data center, 2024-2026

| Date | Event | People / org | Primary citation | Significance | Lay hook | St |
|---|---|---|---|---|---|---|
| 2024-05-23 | Lithium tantalate (LT) PICs for volume manufacturing (TFLT) | C. Wang, Z. Li, ..., X. Ou, T. J. Kippenberg | Nature 629, 784 (2024), doi:10.1038/s41586-024-07369-1 | LN's sibling crystal enters PICs, motivated by the existing SAW-filter LT wafer supply chain | LN's twin, already used in phone radio filters, joins the photonics party. | V |
| 2024-11 (about 11-20) | Q.ANT launches a commercial photonic "NPU" (native processing unit) using TFLN modulator arrays | Q.ANT | The Quantum Insider (URL dated 2024-11-20); eeNews Europe | TFLN outside telecom: analog photonic compute | - | S |
| 2025-09-25 | First 8-inch TFLN wafer at an in-house research cleanroom (Villach) | Silicon Austria Labs | Optica corporate member news, 2025-09-25 | Moves to CMOS-standard wafer size | - | S (institutional press) |
| 2025-09-28 | TFLN MZM on a foundry-compatible SiPh platform, 320 Gb/s unamplified link | J. Declercq et al. (imec) | ECOC 2025, doi:10.1109/ECOC66593.2025.11263113 | Micro-transfer-printed TFLN on silicon photonics | - | V |
| 2026-02 | Heterogeneous LT on silicon photonics, high speed | M. Niels, T. Vanackere, ..., G. Roelkens, et al. (imec / Ghent*) | Nat. Photonics 20, 225 (2026), doi:10.1038/s41566-025-01832-9 | - | - | V |
| 2026-03-11 (Business Wire, US) / 2026-03-12 (UMC, Taiwan) | HyperLight manufacturing deal with UMC and its subsidiary Wavetek for 6-inch and 8-inch TFLN | HyperLight, UMC | optics.org, 2026-03-12 (CEO: "The era of TFLN as a niche technology is over.") | Pure-play TFLN moves into a large CMOS foundry | - | S |
| 2026-03-16 | 1.6T-DR8 TFLN reference transceiver (single CW laser) assembled by TFC | HyperLight, TFC | Business Wire, 2026-03-16 (seen via search summary; page returned 403) | Vendor claim | - | S |
| 2026-03-17 | 400G-per-lane TFLN PICs for AI interconnects | HyperLight | Business Wire, 2026-03-17 (seen via search summary; page returned 403) | Vendor claim, at OFC 2026 | - | S |
| 2026-03-26 | imec "double world first": TFLN and LT modulators integrated on silicon photonics | imec | imec article, 2026-03-26 | Path to 400 Gb/s per lane, per imec | - | V (primary page) |
| 2026-09-11 (online) | Integrated EO circulator on TFLN for bidirectional fiber transmission | C. St-Arnault, C. Laperle, D. Kita, C. Reimer, D. V. Plant | Nat. Photonics (2026), doi:10.1038/s41566-026-02008-9 | Non-reciprocal TFLN device | - | V |
| 2026-01-19 | TFLN on SiN and TFLN on SOI, 200 mm, with X-FAB | Ligentec | X-FAB news (see R09 S28); PIC Magazine video page | Foundry SiN player adds TFLN | - | S |

---

## 2. People and institutions (one line each)

| Who / where | Role in LN history | Era |
|---|---|---|
| W. H. Zachariasen (Oslo) | First structural report (per secondary citation) | 1928 |
| B. T. Matthias, J. P. Remeika (Bell Labs*) | Ferroelectricity | 1949 |
| Bell Labs (Murray Hill, Holmdel*) | Growth (Ballman, Nassau, Levinstein, Loiacono), structure (Abrahams), nonlinear optics (Boyd, Miller, Giordmaine), damage (Ashkin, Chen), EO and waveguides (Kaminow, Turner, Schmidt, Alferness, Jackel, Glass) | 1964-1985 |
| RCA Laboratories* (Amodei, Staebler, Phillips) | Fe:LN, hologram fixing | 1971-1972 |
| Nanjing Univ.* (Feng Duan 1923-2020, Ming Nai-Ben) | Growth-striation QPM | 1980 |
| Zhong, Jin, Wu (institution not verified) | MgO:LN | 1980 |
| Sony* (Yamada et al.) | Electric-field poling | 1993 |
| Stanford (Byer, Fejer, Magel, Jundt, Myers, Langrock) | QPM theory, PPLN, OPOs, later nanophotonic PPLN | 1989-2020 |
| Columbia* (Levy, Osgood) | Crystal ion slicing | 1998 |
| ETH Zurich* (Günter, Poberaj, Rabiei, Guarino); Paderborn* (Sohler, Hu) | LNOI films and devices | 2004-2012 |
| Harvard (Lončar group: C. Wang, M. Zhang, et al.) | TFLN revival | 2014-2021 |
| HyperLight (2018, Cambridge MA), NANOLN (2010, Jinan) | Startup and wafer supply | 2010-2026 |
| EPFL (Kippenberg) + co-authors | TFLT 2024, LN lasers 2023 | 2023-2024 |
| Crystal Technology, Inc. (Palo Alto; "since 1967" per company profile; EPCOS subsidiary by 2009; G&H 2011) | Bulk LN, first commercial modulator (1985), PPLN green chips | 1967-2011 |

## 3. Human stories (sourced)

1. **The damage that became a feature.** Ashkin co-discovered optical damage in LN (APL 1966) while working on nonlinear optics. The effect was first treated as a defect, and it became holographic storage (Chen 1968) and the whole field of photorefractive optics. Ashkin received the 2018 Nobel Prize in Physics for optical tweezers, in his 90s (born 1922, died 2020-09-21; Wikipedia).
2. **First tunable "rainbow" laser.** The first widely tunable parametric oscillator (Giordmaine and Miller, PRL 1965-06) used LN. Ballman's Czochralski paper from the same lab appeared four months earlier (1965-02); whether the OPO crystal came from that growth was not checked.
3. **Five papers, one issue.** Bell Labs published the 1966 "Ferroelectric lithium niobate" series, parts 1 to 5, consecutively in J. Phys. Chem. Solids vol. 27 (pp. 983-1026). It reads as a complete biography of the crystal.
4. **"Thin film" in 1973.** Kaminow et al. published "Thin-film LiNbO3 electro-optic light modulator" in 1973; the abstract describes an out-diffused planar guide in bulk LN, not a film on insulator. The story is how the meaning of "thin film" changed: from a Li-depleted surface layer to a sub-micron crystal bonded on oxide via ion slicing (2017-2018 revival).
5. **Stripes by wobbling.** D. Feng (identified as Feng Duan*) and the Nanjing group made periodic domains in 1980 by growth striations (APL 37, 607), more than a decade before field poling.
6. **Matthias and niobium.** A public AIP photo shows Bernd Matthias pointing at niobium on the periodic table. The photo is about superconductivity, not LN, but it suits a "meet the element" vignette (license caveat in section 4).
7. **The striped crystal goes pocket-sized.** By 2009, MgO-PPLN chips were sold as green sources for phone and notebook pico-projectors (Crystal Technology/EPCOS).

## 4. Images (license per Wikimedia Commons metadata, 2026-10-24; nothing downloaded)

| File (Commons) | Subject | License | Author / credit | Notes |
|---|---|---|---|---|
| `File:Lithium_Niobate_Crystal_(7788237698).jpg` | Small LN crystal in a NIST quantum-optics setup (2012) | Public domain (NIST, US Gov) | NIST | Safe for any use |
| `File:Lithium_Niobate_Wafer.jpg` | LN single-crystal wafer, 4000x3000 | CC0 | Smithy71 | Safe; good hero image |
| `File:LiNbO3.png` | Crystal structure with NbO6 octahedra | Public domain | "Solid State" | Better to re-render ourselves in 3D |
| `File:Linbo3_Unit_Cell.png` | Hexagonal unit cell | CC BY-SA 3.0 | Ahellwig | Attribution plus share-alike |
| `File:Lithium_niobate_crystal.jpg` | Cracked LN crystal, Science Museum object 1982-139 (55x15x15 mm, from the Royal Signals and Radar Establishment) | Commons: CC BY 4.0. Science Museum Group page: CC BY-NC-SA 4.0, (c) Board of Trustees of the Science Museum | Science Museum Group | **License conflict. Treat as NC (non-commercial) or skip.** "1982" is the accession year, not the crystal's date. |
| `File:Laser-Induced_Optical_Damage_in_LiNbO3.jpg` | Laser damage in LN, 150x Nomarski microscopy | CC BY-SA 4.0 | Jason Yager | Fits the photorefractive chapter |
| `File:J._Czochralski_ca_1910.jpg`, `File:Jan_Czochralski.jpg` | Jan Czochralski portraits | Public domain | unknown | Growth chapter |
| `File:Kyocera_38.9MN_SAW_filter.jpg` (and `_01`, `_02`, `_03`) | 1990s TV IF SAW filter (38.9 MHz) | CC BY-SA 4.0 | Mister rf | Substrate not stated. Do not caption it as LN. |
| `File:Siemens_OFW_G1961_SAW_filter.jpg`, `File:OFW_G1961_case_opened.jpg` | 1980s Siemens TV IF SAW filter, case opened | CC BY-SA 4.0 | Mister rf | Same substrate caveat |
| `File:Bernd_Matthias.jpg`, `File:Matthias_and_Kunzler_periodic_table.jpg` | Matthias portrait; Matthias pointing at niobium | "Copyrighted free use" on Commons; source AIP Emilio Segre Visual Archives | AIP ESVA, Physics Today Collection | Check AIP terms before publishing |
| `File:Arthur_Ashkin_D81_2485_(44417144580)_(cropped).jpg` | Ashkin at the 2018 Nobel week | CC BY 2.0 | Bengt Nyman | Attribution required |
| `File:Nicolaas_Bloembergen_1981.jpg` | Bloembergen, Lindau 1981 | CC BY-SA 3.0 nl | Vetter (Spaarnestad Photo) | QPM-proposal vignette |
| `File:Bell_Telephone_Laboratories,_Murray_Hill,_New_Jersey._LOC_gsc.5a08712.jpg` | Bell Labs Murray Hill, 1942, 8836x6417 | Public domain (LOC, Gottscho-Schleisner) | Gottscho-Schleisner | Era-setting image |
| `File:Single-crystal_silicon_boule.jpg` | Si Czochralski boule (not LN) | Public domain | Sebastian Wallroth | Only as an analogy, clearly labeled |

**Gaps:** no openly licensed photo of an LN boule, an early Ti:LN modulator, a PPLN chip, or a TFLN chip turned up on Commons. Bell Labs/Nokia archive photos were not found under an open license. Options: ask vendors or labs for permission, use the author's own photos, or render in Blender (R05).

## 5. Controversies and dating uncertainties

| Topic | What the sources say | Status |
|---|---|---|
| First synthesis or report | Zachariasen 1928 is cited by Bartasyte et al. (2017) and in informal sources. A search summary says Boes et al., Science 2023, puts first synthesis "70 years ago" (about 1950). That wording was not read directly. | Unresolved. Website: "first reported in 1928 (structure survey); ferroelectric 1949". |
| "Ilmenite" label | Matthias & Remeika (1949) title says "ilmenite structure". The 1966 Abrahams X-ray and neutron work fixed the R3c LN-type structure, which is related to ilmenite but distinct in cation ordering. | Interpretation; standard |
| First single crystals | Matthias & Remeika (1949) had crystals, method not verified. Czochralski: Ballman (1965-02) is the standard Western citation. A Soviet Czochralski report from 1965 (Fedulov et al.) is claimed in some literature but was not found (see Unverified). | Open |
| MgO:LN priority | Zhong, Jin, Wu: IQEC conference abstract, 1980-06. Bryan, Gerson, Tomaschke: APL 1984. Chinese sources stress the 1980 priority; Western papers usually cite 1984. | Both dates verified as publications. Credit both. |
| QPM origin | Armstrong et al. 1962 (verified). Franken & Ward, Rev. Mod. Phys. 35, 23 (1963), doi:10.1103/RevModPhys.35.23, is also often credited (publication verified; QPM content not inspected). First LN QPM experiment: Feng et al. 1980. Waveguide: Lim et al. 1989. Field poling: Yamada et al. 1993. | Credit as a sequence, not a single "inventor" |
| Optical damage "discovery" | Ashkin et al., APL 1966-07 is standard. The mechanism came from Chen 1969 and Glass 1974. | Settled |
| First commercial LN modulator | Crystal Technology, 1985, per Becker (1988, MRS Bull.) | Single secondary source |
| HyperLight founders | Lightwave (2018, Harvard). CEO and co-founder Mian Zhang. Reimer co-founder per Optica OPN. Lončar, C. Wang, K. Luke listed only on a directory site. | Partly unverified |
| Crystal Technology founding | "since 1967" (company profile, optics.org buyers' guide). Other years are sometimes quoted. | Company statement |
| EOSPACE founding | 1997 in most directories, 1999 in one | Unverified (directories only) |

## 6. Unverified (do not publish without a primary source)

| Claim | Why unverified | Lead |
|---|---|---|
| Czochralski discovered the method in 1916 (pen dipped into molten tin) and published it in 1918 (Z. Phys. Chem. 92, 219) | Not checked this pass; the pen story is an anecdote | Original paper; Polish Academy history pages |
| Fedulov, Shapiro, Ladyzhinskii (1965), Czochralski growth of LiNbO3, LiTaO3, NaNbO3, Kristallografiya 10, 268 | No record found in search | Russian journal archive (Kristallografiya / Sov. Phys. Crystallogr.) |
| White & Voltmer used a quartz substrate | Not in the sources fetched | Paper text (APL 7, 314) |
| Zhong et al. affiliation (Nankai Univ.); MgO threshold (4.6 vs >4.8 mol%, sources differ) | Secondary sources only | Original IQEC 1980 abstract |
| Bryan et al. affiliation; Yamada et al. at Sony; Mok affiliation | Bylines not inspected | Paper first pages |
| Plessey first to manufacture SAW TV IF filters commercially | Company or biographical claim (IEEE UFFC profile of D. P. Morgan) | Morgan, "A history of SAW devices" |
| By 1979, SAW TV IF filter production ran to "several million units annually" | Europhysics News 1979 PDF, seen only via a search snippet | europhysicsnews.org 1979/12 |
| Which substrates (LN vs LT vs quartz) were used in specific TV IF and phone SAW filters | Only a general statement found (a patent notes Y-cut, Z-propagating LN in TV IF filters) | Morgan's book; Hashimoto reviews |
| Murata acquired Resonant (XBAR resonators on thin LN) in 2022 | Not checked | Murata press release |
| Telecom vendor timelines: AT&T/Lucent/Agere, Uniphase/JDSU (UTP), Sumitomo Osaka Cement (a distributor says "over 20 years", undated), Fujitsu, Corning | No primary corporate histories fetched | Company annual reports; Wooten 2000 review body |
| EOSPACE: founded 1997, Redmond WA, founder Suwat Thaniyavarn, Boeing High Technology Center roots | Directory sites only | eospace.com |
| Consumer green laser pointers use PPLN | Most low-cost pointers are believed to use Nd:YVO4 + KTP; PPMgLN is documented for projector green modules (2009 product news, McMaster/C2C mGreen) | Product teardowns |
| A Japanese group got >1 W green from room-temperature PPMgLN | Photonics.com article, date not seen | photonics.com a19195 |
| Light: Adv. Manuf. 2025, "Volume manufacturing of TFLN modulators >110 GHz on 4-inch wafer with quartz handle" (doi:10.37188/lam.2025.047) | Seen in search results; not inspected | DOI |
| Liobate 1.6T coherent PDM-IQ modulator and AFR 200G/400G TFLN chips at OFC 2026 | Vendor or market-blog roundups | Company press releases |
| Ashkin was the oldest Nobel laureate at the time | Not checked | nobelprize.org (returned 403) |
| How the 1973 Kaminow "thin film" was made | Abstract says out-diffused planar guide in bulk LN; paper body not read | APL 22, 540 |
| The term "photorefractive" first appeared in a specific year | Not checked | - |

## 7. Suggested narrative chapters (10)

| # | Title (working) | Span | Anchor events | Interactive or visual idea |
|---|---|---|---|---|
| 1 | A crystal on paper | 1928-1958 | Zachariasen; Matthias & Remeika; Reisman phase diagram | Rotate the R3c cell; flip the polarization arrow |
| 2 | Bell Labs grows a crystal | 1964-1966 | Ballman; Boyd/Miller; first OPO; five-part series | Czochralski pull animation; OPO color dial |
| 3 | The damage that became a memory | 1966-1975 | Ashkin; Chen holography; Fe:LN fixing; bulk photovoltaic | Write and erase a photorefractive grating in the browser |
| 4 | Sound on a crystal | 1965-1990s | IDT; 128 Y-X cut; TV IF filters; phones | SAW ripple on a comb electrode |
| 5 | Light in a channel | 1973-1985 | Kaminow 1973; Ti indiffusion; proton exchange; first commercial modulator (1985) | Diffusion profile slider; Mach-Zehnder toggle |
| 6 | Taming the crystal | 1968-1997 | Congruent composition; MgO; QPM to PPLN; field poling; PPLN OPOs | QPM "flip the stripes" phase-sum animation |
| 7 | The internet's modulator | 1985-2015 | Ti:LN in long-haul telecom; Wooten 2000 | Fiber link: bit rate versus decade |
| 8 | Peeling the crystal | 1995-2014 | Smart Cut; crystal ion slicing; LNOI; Günter/Sohler; NANOLN | Ion-slice animation (implant, bond, split) |
| 9 | The thin-film renaissance | 2017-2023 | Zhang 2017; Wang 2018 (Nature, Optica); combs; startups | Before/after 2018: Vpi-L vs bandwidth scatter (data from R08) |
| 10 | Into the AI data center | 2024-2026 | TFLT; 8-inch wafers; foundry deals; 400G/lane | Dated "news ticker", each item with a status badge |

---

## Website implications (ranked)

1. **Store the timeline as data, not prose.** One YAML/JSON record per event (date, precision, people, institution, DOI, status V/P/S, hook, chapter). The same file feeds the page, hover popups (gwern-style), and the machine-readable endpoint. Show the status badge to visitors. Experts will trust it, and errors stay fixable.
2. **Lead with four hero stories:** damage to holography (Ashkin), the first OPO, what "thin film" meant in 1973 vs 2018, and stripes (1962 idea, 1980 growth, 1993 poling). Each is a 20-word hook plus one interactive.
3. **Use the 10 chapters as a scrolling narrative.** Pair each chapter with one in-browser vignette (R11): photorefractive grating, QPM phase sum, SAW ripple, ion slicing.
4. **Make "Who did it first?" a visible sidebar** for first synthesis, the ilmenite label, first crystals, MgO priority, and QPM. Presenting dating disputes openly earns expert credibility and is fun for lay readers.
5. **Image policy:** use public-domain and CC0 first (NIST crystal, CC0 wafer, Czochralski, Bell Labs 1942). CC BY-SA needs attribution and share-alike. Hold the AIP "copyrighted free use" photos and the Science Museum crystal (license conflict) until terms are confirmed. Make up for the missing LN boule, chip, and modulator photos with Blender renders (R05) or permissioned photos.
6. **Mark everything from 2024 to 2026 as dated press claims,** and keep it separate from peer-reviewed milestones. Do not show market or performance numbers from vendor releases without a "vendor claim" tag.
7. **Before publishing the commercial chapters (5, 7),** source corporate timelines properly. Telecom vendor history and the SAW-substrate history are the weakest-sourced parts of this note.
8. **Fill coverage gaps in a follow-up pass:** Soviet/Russian growth work, Japanese SAW and modulator industry (Sumitomo Osaka Cement, Fujitsu, Murata), Chinese TFLN ecosystem (NANOLN, foundries), and European LNOI (Paderborn, ETH Zurich, CSEM).
