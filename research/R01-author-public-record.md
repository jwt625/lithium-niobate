# R01: Author's public record on lithium niobate

| Field | Value |
|---|---|
| Track | R01 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Retrieved | 2026-10-24 (all citation counts, licenses, and metadata as of this date) |
| Scope | Public, professional record of Wentao Jiang on LN, emphasis on thin-film LN (TFLN) |
| Method | Google Scholar profile (1 request), OpenAlex API, Crossref API, arXiv API + arXiv OAI-PMH (license field), ORCID public API, Stanford PURL/SearchWorks, Europe PMC, ar5iv (arXiv HTML), Zenodo API, Stanford TechFinder, author's public blog source (cross-check only) |
| Blocked / not used | opg.optica.org full text and meetings-archive.aps.org returned anti-bot / 403; not retried. Nature.com redirected to login; used Europe PMC copy instead |

Conventions: **WJ** = Wentao Jiang. Position given as `k/N`. Facts carry a source (DOI / URL). Lines tagged *[estimate]* or *[speculation]* are not facts. Unknown = N/A.

---

## 1. Identity and disambiguation

| Identifier | Value | Source |
|---|---|---|
| Google Scholar | `ocbnVOMAAAAJ`; verified email at stanford.edu; labels: Nanophotonics, Optomechanics, Nanomechanics, Nanofabrication | https://scholar.google.com/citations?user=ocbnVOMAAAAJ |
| OpenAlex author | `A5041790852` (affiliations: Stanford University, Tsinghua University; 71 works) | https://api.openalex.org/authors/A5041790852 |
| ORCID | 0000-0002-6592-4322; PhD Stanford 2017-09-01 to 2022-12-09; Tsinghua University 2013-09-01 to 2017-07-04; employment: Stanford University, Applied Physics | https://orcid.org/0000-0002-6592-4322 |
| Group | LINQS lab (Amir H. Safavi-Naeini), Ginzton Lab, Stanford | https://linqs.stanford.edu/ ; author's public about page (outside5sigma.com/about) |
| Dissertation | See section 3 | https://purl.stanford.edu/mx877vv9870 |

Disambiguation rule applied: an item is included only if it has Safavi-Naeini as co-author, a Stanford affiliation, or appears on the verified Scholar profile with LINQS co-authors. All 27 journal/preprint items in section 4 satisfy the Safavi-Naeini co-author test (checked on Crossref / arXiv author lists).

Note on dates: The public record says PhD 2017-09 to 2022-12 (ORCID) and dissertation 2022 (PURL). LN co-authorships continue through 2026 (sections 4-5).

## 2. Metrics (Google Scholar, retrieved 2026-10-24)

| Metric | All | Since 2021 |
|---|---|---|
| Citations | 2724 | 2505 |
| h-index | 19 | 18 |
| i10-index | 24 | 23 |

- OpenAlex `A5041790852` reports 1498 citations (it misses some works and is lower than Scholar).
- Per-paper counts below: Scholar (S) and Crossref `is-referenced-by-count` (C), both 2026-10-24. Scholar counts conference and arXiv versions as separate rows in some cases; noted where it does.

## 3. PhD dissertation

| Field | Value |
|---|---|
| Title | Microwave-optics quantum frequency conversion and optically heralded microwave photons |
| Author | Wentao Jiang |
| Degree | Ph.D., Applied Physics, Stanford University, 2022 |
| Advisor / committee | Amir H. Safavi-Naeini (supervisor); Hideo Mabuchi; David I. Schuster |
| Persistent link | https://purl.stanford.edu/mx877vv9870 ; catalog https://searchworks.stanford.edu/view/14423015 |
| Access | Public: PURL rights metadata `read: world`; PDF `Wentao_Jiang_Dissertation_final-augmented.pdf`, 43,926,963 bytes, `publish="yes"` (https://purl.stanford.edu/mx877vv9870.xml) |
| License | No Creative Commons license. "(c) Copyright 2022 by Wentao Jiang" (author holds copyright) |
| Scholar cites | 2 |

Abstract (condensed from the PURL record): telecom transceivers as the classical analogue; superconducting circuits need microwave-to-telecom quantum frequency converters; approach uses a GHz mechanical resonance as intermediary; (1) optomechanical crystals in TFLN for photon-phonon coupling; (2) piezoelectric drive and readout of the mechanics with interdigital transducers (IDTs) and microwave circuits; (3) move to a hybrid LN-on-silicon-on-insulator (LN-on-SOI) platform to improve optomechanical coupling; (4) a fully integrated converter that emitted a microwave photon heralded by optical single-photon detection.

Website relevance: the thesis is the single best public narrative source for a "my LN story" page. The author owns its copyright, so thesis text and original thesis figures can be reused by him. Figures that were first published in journals are subject to the publisher terms in section 9.

## 4. Journal articles and preprints

### 4a. Bibliographic table

Ordered by year. LN class: **TFLN** = thin-film LN device; **TFLN-hyb** = TFLN piezo element on another platform (Si, SOI, diamond); **non-LN** = no LN in the device.

| ID | Year | Title | Venue | DOI | arXiv | WJ pos | LN class | Cites S / C |
|---|---|---|---|---|---|---|---|---|
| P01 | 2017 | Engineering phonon leakage in nanomechanical resonators | Phys. Rev. Applied 8, 041001 | 10.1103/PhysRevApplied.8.041001 | 1705.07869 | 3/5 | non-LN (Si) | 37 / 23 |
| P02 | 2018 | Single-mode phononic wire | Phys. Rev. Lett. 121, 040501 | 10.1103/PhysRevLett.121.040501 | 1711.00847 | 3/6 | non-LN (Si) | 88 / 55 |
| P03 | 2019 | **Lithium niobate piezo-optomechanical crystals** | Optica 6, 845 | 10.1364/OPTICA.6.000845 | 1903.00957 | **1/9** | TFLN | 164 / 123 |
| P04 | 2019 | Resolving the energy levels of a nanomechanical oscillator | Nature 571, 537 | 10.1038/s41586-019-1386-x | 1902.04681 | 5/9 | TFLN | 281 / 178 |
| P05 | 2020 | **Efficient bidirectional piezo-optomechanical transduction between microwave and optical frequency** | Nat. Commun. 11, 1166 | 10.1038/s41467-020-14863-3 | 1909.04627 | **1/8** | TFLN | 390 / 265 |
| P06 | 2020 | Piezoelectric transduction of a wavelength-scale mechanical waveguide | Phys. Rev. Applied 13, 024069 | 10.1103/PhysRevApplied.13.024069 | 1907.13058 | 3/5 | TFLN | 65 / 51 |
| P07 | 2020 | **Nanobenders as efficient piezoelectric actuators for widely tunable nanophotonics at CMOS-level voltages** | Commun. Phys. 3, 156 | 10.1038/s42005-020-00412-3 | 1911.10973 | **1/6** | TFLN | 30 / 15 |
| P08 | 2020 | Cryogenic microwave-to-optical conversion using a triply resonant lithium-niobate-on-sapphire transducer | Optica 7, 1737 | 10.1364/OPTICA.397235 | 2005.00897 | 4/9 | TFLN (LN on sapphire) | 177 / 118 |
| P09 | 2021 | Gigahertz phononic integrated circuits on thin-film lithium niobate on sapphire | Phys. Rev. Applied 15, 014039 | 10.1103/PhysRevApplied.15.014039 | 2007.04961 | **2/6** | TFLN (LN on sapphire) | 112 / 85 |
| P10 | 2021 | Acousto-optic modulation of a wavelength-scale waveguide | Optica 8, 477 | 10.1364/OPTICA.413401 | 2010.12517 | 5/7 | TFLN | 114 / 89 |
| P11 | 2021 | Loss channels affecting lithium niobate phononic crystal resonators at cryogenic temperature | Appl. Phys. Lett. 118, 123501 | 10.1063/5.0034909 | 2010.01025 | 7/9 | TFLN | 80 / 47 |
| P12 | 2021 | Room-temperature mechanical resonator with a single added or subtracted phonon | Phys. Rev. Lett. 127, 133602 | 10.1103/PhysRevLett.127.133602 | 2102.04017 | 5/8 | N/A (material not named in arXiv text checked) | 38 / 26 |
| P13 | 2021 | III/V-on-lithium niobate amplifiers and lasers | Optica 8, 1288 | 10.1364/OPTICA.438620 | N/A (none found) | 9/14 | TFLN (heterogeneous III-V) | 162 / 124 |
| P14 | 2022 | 2022 Roadmap on integrated quantum photonics | J. Phys. Photonics 4, 012501 | 10.1088/2515-7647/ac1ef4 | 2102.03323 | 36/55 | review (section) | 605 / 386 |
| P15 | 2022 | High-bandwidth CMOS-voltage-level electro-optic modulation of 780 nm light in thin-film lithium niobate | Opt. Express 30, 23177 | 10.1364/OE.460119 | 2204.03138 | 8/10 | TFLN (LN on sapphire) | 44 / 33 |
| P16 | 2023 | Platform-agnostic waveguide integration of high-speed photodetectors with evaporated tellurium thin films | Optica 10, 349 | 10.1364/OPTICA.475387 | 2209.04034 | 7/11 | TFLN among Si, SiN | 23 / 23 |
| P17 | 2023 | **Optically heralded microwave photon addition** | Nat. Phys. 19, 1423 | 10.1038/s41567-023-02129-w | 2210.10739 | **1/8** | TFLN-hyb (LN on SOI) | 112 / 68 |
| P18 | 2023 | Flexible integration of gigahertz nanomechanical resonators with a superconducting microwave resonator using a bonded flip-chip method | Appl. Phys. Lett. 123, 104001 | 10.1063/5.0157516 | 2304.13592 | **2/5** | TFLN | 10 / 6 |
| P19 | 2023 | Strong dispersive coupling between a mechanical resonator and a fluxonium superconducting qubit | PRX Quantum 4, 040342 | 10.1103/PRXQuantum.4.040342 | 2304.13589 | 9/13 | TFLN | 45 / 30 |
| P20 | 2024 | Quantum limits of superconducting-photonic links and their extension to millimeter waves | Phys. Rev. Applied 22, 054043 | 10.1103/PhysRevApplied.22.054043 | 2406.14501 | **2/4** | non-LN (photodiode source) | 12 (+3 arXiv row) / 7 |
| P21 | 2025 | Proposal for superconducting quantum networks using multioctave transduction to lower frequencies | Phys. Rev. A 111, 012614 | 10.1103/PhysRevA.111.012614 | 2407.20943 | **2/3** | non-LN (theory, SQUID) | 4 / 1 |
| P22 | 2025 | High photon-phonon pair generation rate in a two-dimensional optomechanical crystal | Nat. Commun. 16, 2576 | 10.1038/s41467-025-57948-7 | 2406.14484 | 5/7 | non-LN (Si 2D OMC) | 32 (+12 arXiv row) / 14 |
| P23 | 2025 | Spectral diffusion of nanomechanical resonators due to single quantum defects | Phys. Rev. Applied 24, 044066 | 10.1103/22rx-v855 | 2501.08289 | 6/8 | TFLN | 13 (+4 arXiv row) / 6 |
| P24 | 2025 | Integrated phononic waveguide on thin-film lithium niobate on diamond | Appl. Phys. Lett. 127, 154001 | 10.1063/5.0285138 | 2505.23100 | 3/9 | TFLN-hyb (LN on diamond) | 5 / 4 |
| P25 | 2026 | Correlated dephasing in a piezoelectrically transduced silicon phononic waveguide | Phys. Rev. Applied 25, 024005 | 10.1103/gv96-8xp1 | 2502.16426 | 3/6 | TFLN-hyb (LN piezo on Si) | 4 / 2 |
| P26 | 2026 | Perturbative sensing of nanoscale quantum materials with millimeter-wave photonic crystals | Phys. Rev. Applied 26, L031001 | 10.1103/bl8b-7yqv | 2602.17527 | 3/10 | non-LN (Si mm-wave cavity) | 0 / 0 |
| P27 | 2026 | A two-dimensional piezo-optomechanical transducer (preprint) | arXiv | 10.48550/arXiv.2607.26161 | 2607.26161 | 8/10 | TFLN-hyb (LN on Si) | 1 / N/A |

Counts: 27 items; 4 first-author (P03, P05, P07, P17), all LN. 19 of 27 involve LN (TFLN or TFLN-hyb). Sources: Crossref API (venue, authors, license), arXiv API (IDs, author order), Scholar (S counts).

### 4b. Full author lists (WJ in bold)

- P01: R. N. Patel, C. J. Sarabalis, **W. Jiang**, J. T. Hill, A. H. Safavi-Naeini
- P02: R. N. Patel, Z. Wang, **W. Jiang**, C. J. Sarabalis, J. T. Hill, A. H. Safavi-Naeini
- P03: **W. Jiang**, R. N. Patel, F. M. Mayor, T. P. McKenna, P. Arrangoiz-Arriola, C. J. Sarabalis, J. D. Witmer, R. Van Laer, A. H. Safavi-Naeini
- P04: P. Arrangoiz-Arriola, E. A. Wollack, Z. Wang, M. Pechal, **W. Jiang**, T. P. McKenna, J. D. Witmer, R. Van Laer, A. H. Safavi-Naeini (Crossref lists 9; arXiv v1 lists 8)
- P05: **W. Jiang**, C. J. Sarabalis, Y. D. Dahmani, R. N. Patel, F. M. Mayor, T. P. McKenna, R. Van Laer, A. H. Safavi-Naeini
- P06: Y. D. Dahmani, C. J. Sarabalis, **W. Jiang**, F. M. Mayor, A. H. Safavi-Naeini
- P07: **W. Jiang**, F. M. Mayor, R. N. Patel, T. P. McKenna, C. J. Sarabalis, A. H. Safavi-Naeini
- P08: T. P. McKenna, J. D. Witmer, R. N. Patel, **W. Jiang**, R. Van Laer, P. Arrangoiz-Arriola, E. A. Wollack, J. F. Herrmann, A. H. Safavi-Naeini
- P09: F. M. Mayor, **W. Jiang**, C. J. Sarabalis, T. P. McKenna, J. D. Witmer, A. H. Safavi-Naeini
- P10: C. J. Sarabalis, R. Van Laer, R. N. Patel, Y. D. Dahmani, **W. Jiang**, F. M. Mayor, A. H. Safavi-Naeini
- P11: E. A. Wollack, A. Y. Cleland, P. Arrangoiz-Arriola, T. P. McKenna, R. G. Gruenke, R. N. Patel, **W. Jiang**, C. J. Sarabalis, A. H. Safavi-Naeini
- P12: R. N. Patel, T. P. McKenna, Z. Wang, J. D. Witmer, **W. Jiang**, R. Van Laer, C. J. Sarabalis, A. H. Safavi-Naeini
- P13: C. Op de Beeck, F. M. Mayor, S. Cuyvers, S. Poelman, J. F. Herrmann, O. Atalar, T. P. McKenna, B. Haq, **W. Jiang**, J. D. Witmer, G. Roelkens, A. H. Safavi-Naeini, R. Van Laer, B. Kuyken
- P14: G. Moody, V. J. Sorger, D. J. Blumenthal, ... (55 authors); WJ at 36, adjacent to T. P. McKenna (37) and A. H. Safavi-Naeini (38). Which section they wrote: N/A (not verified)
- P15: O. T. Celik, C. J. Sarabalis, F. M. Mayor, H. S. Stokowski, J. F. Herrmann, T. P. McKenna, N. R. A. Lee, **W. Jiang**, K. K. S. Multani, A. H. Safavi-Naeini
- P16: G. H. Ahn, A. D. White, H. Kim, N. Higashitarumizu, F. M. Mayor, J. F. Herrmann, **W. Jiang**, K. K. S. Multani, A. H. Safavi-Naeini, A. Javey, J. Vuckovic
- P17: **W. Jiang**, F. M. Mayor, S. Malik, R. Van Laer, T. P. McKenna, R. N. Patel, J. D. Witmer, A. H. Safavi-Naeini
- P18: S. Malik, **W. Jiang**, F. M. Mayor, T. Makihara, A. H. Safavi-Naeini
- P19: N. R. A. Lee, Y. Guo, A. Y. Cleland, E. A. Wollack, R. G. Gruenke, T. Makihara, Z. Wang, T. Rajabzadeh, **W. Jiang**, F. M. Mayor, P. Arrangoiz-Arriola, C. J. Sarabalis, A. H. Safavi-Naeini
- P20: K. K. S. Multani, **W. Jiang**, E. A. Nanni, A. H. Safavi-Naeini
- P21: T. Makihara, **W. Jiang**, A. H. Safavi-Naeini
- P22: F. M. Mayor, S. Malik, A. G. Primo, S. Gyger, **W. Jiang**, T. P. M. Alegre, A. H. Safavi-Naeini
- P23: M. P. Maksymowych, M. Yuksel, O. A. Hitchcock, N. R. Lee, F. M. Mayor, **W. Jiang**, M. L. Roukes, A. H. Safavi-Naeini
- P24: S. Malik, F. M. Mayor, **W. Jiang**, H. Oh, C. Padgett, V. Dharod, J. Venkatraman, A. C. Bleszynski Jayich, A. H. Safavi-Naeini
- P25: O. A. Hitchcock, F. M. Mayor, **W. Jiang**, M. P. Maksymowych, S. Malik, A. H. Safavi-Naeini
- P26: K. K. S. Multani, Z. Ji, **W. Jiang**, S. Qiu (arXiv: Qi), A. G. Hayden, G. Multani, S. R. Platt, E. A. Nanni, Z.-X. Shen, A. H. Safavi-Naeini
- P27: T. Xie, N. Ooi, L. Woodard, S. Malik, F. Mayor, O. A. Hitchcock, A. G. Primo, **W. Jiang**, S. Gyger, A. H. Safavi-Naeini

### 4c. Open access and reuse status

| ID | Journal-version access and license | arXiv license (OAI-PMH) | Open data |
|---|---|---|---|
| P01, P02, P06, P09, P12, P23, P25 | APS default license (subscription) | arXiv non-exclusive distribution | P25: Zenodo 10.5281/zenodo.17138311, CC BY 4.0, `.mat` figure data (Figs. 1d, 2b-d, 4) |
| P03, P08, P10, P13 | Gold OA, Optica Open Access License v1 (OAPA): reuse and build upon with attribution, non-commercial | P03, P08, P10: non-exclusive | N/A |
| P15, P16 | Gold OA, Optica Open Access License v2 | non-exclusive | N/A |
| P04 | Springer Nature subscription | non-exclusive | N/A |
| P05, P07, P22 | **CC BY 4.0** | non-exclusive | N/A found |
| P11, P18, P24 | AIP (subscription; Crossref lists AIP rights page or none) | non-exclusive | N/A |
| P14, P19, P20 | **CC BY 4.0** | P14: CC BY 4.0; P19, P20: non-exclusive | N/A |
| P17 | Springer Nature subscription | **CC BY 4.0** (arXiv 2210.10739) | **Zenodo 10.5281/zenodo.7903643, CC BY 4.0**: source data for Fig. 2, Fig. 3, Ext. Data Figs. 1, 2, 3, 5 (`.xlsx`, `.csv`, about 32 MB total) |
| P21 | APS (subscription; accepted-manuscript license listed) | non-exclusive | Zenodo 10.5281/zenodo.13984170, CC BY 4.0, simulation notebook |
| P26 | APS | **CC0** | N/A |
| P27 | preprint only | non-exclusive | N/A |

Sources: Crossref `license` field per DOI; arXiv OAI-PMH `metadataPrefix=arXiv`; Optica license terms https://opg.optica.org/library/license_v1.cfm; Zenodo API.

### 4d. Science summary and web-content potential (LN items first)

| ID | Platform details | Key results (numbers as published) | Good interactive / 3D web concepts |
|---|---|---|---|
| P03 | X-cut (and Y-cut) TFLN on Si, film thinned about 500 to 300 nm, XeF2 release of Si; 1D nanobeam optomechanical crystal (OMC) with electrodes | g0/2pi about 120 kHz; loaded / intrinsic optical Q 2.5e5 / 3.5e5 at about 1550 nm; mechanical mode near 2 GHz, Qm about 3,500 (room temp.) up to 17,000 (cryo); cooperativity C > 1, phonon lasing; microwave-to-mechanics efficiency about 1e-8; g0 depends strongly on in-plane orientation of anisotropic LN (optimum X-cut, phi = 135 deg) (arXiv 1903.00957 via ar5iv) | (1) 3D nanobeam OMC with animated breathing mode and optical mode overlay; (2) "rotate the crystal" slider: photoelastic g0 vs in-plane angle on X-cut and Y-cut (supplement figures 5-8); (3) phononic band diagram with bandgap highlighted |
| P05 | All-LN suspended TFLN device: IDT, horn taper, 1.3 um mechanical waveguide, OMC; room temperature | f_m = 1.85 GHz; g0/2pi = 70 kHz; loaded / intrinsic Q 1.6e5 / 4.7e5; IDT peak conductance 1.9 mS, bandwidth 3.36 MHz, 50 ohm; acousto-optic V_pi = 0.02 V (24 mV in conclusion); h = 1 modulation at 0.58 uW; bidirectional efficiency 1e-5 (3.3 uW red-detuned pump) and 5.5 % (323 uW blue-detuned pump); "nearly three orders of magnitude" over prior work (PMC7054291) | (1) Signal-chain explorer: microwave -> IDT -> phonon waveguide -> OMC -> light, with energy bookkeeping at each stage; (2) animated SH2 to L1 mode conversion in the horn; (3) efficiency vs intracavity photon number plot (Fig. 4a) rebuilt as interactive model with C0 = 1.2e-5, eta_e = 4.24e-4 sliders. CC BY 4.0, so figures are reusable with attribution |
| P07 | TFLN 300 nm on Si; "nanobender" piezoelectric bending beams driving a sliced photonic crystal (zipper) cavity | Optical tuning about 5 nm/V (0.6 THz/V); 1520 to 1560 nm (about 400 linewidths) within 4 V (Comms. Phys. abstract, DOI above) | (1) 3D bending beam driven by non-uniform field from submicron electrodes, slider for voltage, live resonance shift; (2) "piezo coefficient 0.01 nm/V vs tens of nm/V" intuition widget. CC BY 4.0 |
| P17 | Hybrid: 290 nm X-cut MgO:LN transfer-printed onto 220 nm SOI; Si OMC + LN piezo; separate NbTiN high-impedance (about 1000 ohm) microwave chip, wirebonded; dilution fridge < 10 mK | f_m about 3.6 GHz; g0/2pi about 410 kHz; piezo coupling g_mu/2pi about 420 kHz; conversion efficiency about 5 % (4.9 +/- 0.5 %), 1.5 MHz bandwidth; heralding rate about 15 Hz; added thermal noise < 2 microwave photons (about 1.6) (arXiv 2210.10739 abstract and ar5iv text) | (1) Step-through animation of a heralding event: optical pump pulse -> photon-phonon pair -> optical click -> microwave photon out; (2) interactive phase-space (Wigner/Husimi-style) view of photon-added vs thermal state, built from **CC BY Zenodo source data** (Fig. 3); (3) 3D exploded view of the LN-on-SOI stack and flip/wirebond assembly. Highest-impact item, and data are openly licensed |
| P04 | X-cut TFLN (about 250 nm) phononic crystal defect resonators on same chip as a transmon (Xmon-style) qubit | Phonon-number-resolved qubit spectrum; mode near 2.405 GHz; phonon-number-dependent shifts about 5x the qubit linewidth (arXiv 1902.04681) | "Counting phonons" demo: qubit spectrum splits into peaks as drive amplitude increases (Poisson weights) |
| P06 | Suspended TFLN; IDT to 1 um waveguide | 1.7 GHz; -12 dB conversion efficiency, limited by material loss (arXiv 1907.13058) | IDT design toy: pitch, aperture, impedance match vs frequency |
| P08 | TFLN on sapphire, triply resonant electro-optic transducer with superconducting resonator; dilution fridge | On-chip efficiency 6.6e-6; bandwidth 20 MHz; discusses acoustic-loss management (arXiv 2005.00897) | Triple-resonance diagram (two optical modes + microwave) with detuning sliders; comparison of electro-optic vs piezo-optomechanical routes |
| P09 | TFLN on sapphire (no release; "phononic index guiding") | 50 ohm-matched transducer; 1 um mechanical waveguides; delay lines, racetrack resonators, meanders; Q about 50,000 at 4 K; phononic four-wave mixing (arXiv 2007.04961) | "Photonics, but for sound" page: phononic waveguide modes with live slowness / velocity comparison of LN vs sapphire; racetrack resonator animation |
| P10 | Suspended X-cut TFLN, 250 nm; 1.25 um waveguide; SH0 acoustic mode at 440 MHz; TE0/TE1 optical modes | Measured coupling 0.38 mm^-1 uW^-1/2 (simulated 1.0); max conversion 18 % (RF power limited); about 1000x figure-of-merit gain vs Ti-indiffused / proton-exchanged AOMs (authors' claim) (arXiv 2010.12517) | Collinear AO mode-conversion animation (TE0 -> TE1 with acoustic wave); frequency-shifter / isolator concept toy |
| P11 | TFLN phononic crystal resonators at mK | Internal Qi above 1e5 to 1e6 at high drive (5e6 phonons); TLS and superconducting loss channels; anomalous low-T frequency shift (arXiv 2010.01025) | TLS loss vs temperature / power model with sliders |
| P13 | Heterogeneous III-V gain on TFLN (with Ghent/imec) | Electrically pumped lasers on TFLN with electro-optic wavelength tunability (abstract, DOI above). Short article (Scholar page range 1288-1289) | Laser cavity schematic with EO tuning; tie to industry (laser integration on TFLN) |
| P15 | TFLN on sapphire, visible-NIR (780 nm) | Full-swing voltage 4.2 V; EO bandwidth 2.7 GHz; 0.35 mm^2; loss 1.6 dB/cm; ring intrinsic Q 4.4e5 (arXiv 2204.03138) | Visible-wavelength MZI widget; "why sapphire for 780 nm" explainer |
| P16 | Evaporated Te photodetectors on Si, SiN, and LN waveguides | > 40 GHz bandwidth; visible, telecom, mid-IR detection (arXiv 2209.04034) | Minor; list in "platform" context |
| P18 | TFLN GHz nanomechanical resonators flip-chip bonded to NbTiN kinetic-inductance resonator | Coupling about 15 MHz, magnetic-field-tunable hybridized modes (arXiv 2304.13592) | Avoided-crossing explorer (tune microwave resonator through mechanical modes) |
| P19 | TFLN phononic crystal (690 MHz) flip-chip coupled to fluxonium | g about 2pi x 14 MHz; dispersive regime Delta/g >= 10 (arXiv 2304.13589) | Same avoided-crossing / dispersive widget family as P04, P18 |
| P23 | 250 nm X-cut TFLN phononic crystal resonator arrays, about 450 MHz to 1 GHz | Random telegraph frequency noise attributed to individual TLS, 10 mK to 1 K (arXiv 2501.08289) | Random-telegraph-noise generator with TLS parameters |
| P24 | Transfer-printed TFLN on bulk diamond (LNOD) | 100 um delay line; -5.8 dB total insertion loss at 4 K (> 50 % per transducer); 2.8 GHz (arXiv 2505.23100) | Material-stack 3D cutaway (LN on diamond), color-center coupling concept |
| P25 | TFLN piezo element driving a Si single-mode phononic waveguide, mK | g/2pi = 1.1 MHz; f/2pi = 5 MHz; T1 about 500 us; T_phi about 60 us; correlated frequency noise (arXiv 2502.16426) | Interactive reproduction from CC BY Zenodo `.mat` data |
| P27 | TFLN transfer-printed on released thin-film Si, 2D OMC | Electromechanical damping 4.6 kHz (room temp.); electromech. coupling 0.17 MHz at 10 mK; internal efficiency 0.85 % CW; pulsed pair generation near ground state (arXiv 2607.26161) | 2D OMC + LN block 3D model (successor to P17) |
| P01, P02, P12, P20, P21, P22, P26 | non-LN or material N/A | P22: Si "b-dagger" 2D OMC, 7.4 GHz, g0/2pi about 880 kHz, Q_opt 2.4e5, n_m down to 0.35 (arXiv 2406.14484). P20: optically driven cryogenic mm-wave source, 1e-4 efficiency, 1 uW at 80 GHz (arXiv 2406.14501) | Context only; not LN-site content (P22 optional in a "where it went next" note) |

## 5. Conference abstracts and talks (LN-related; from Scholar, DOIs from OpenAlex)

| Year | Title | Venue | WJ pos | DOI / ID |
|---|---|---|---|---|
| 2017 | Laser-induced phonon-phonon interactions in an on-chip silicon optomechanical crystal | SPIE Photonic and Phononic Properties of Engineered Nanostructures VII (non-LN) | 2/6 | 10.1117/12.2253031 |
| 2019 | High-quality lithium niobate optomechanical crystal | CLEO 2019 | 1/8 | 10.1364/CLEO_SI.2019.SF2J.6 ; 10.23919/CLEO.2019.8749167 |
| 2019 | Lithium niobate optomechanical crystal | APS March Meeting 2019, T70.022 | 1/8 | https://meetings-archive.aps.org/mar/2019/t70/22 |
| 2019 | Quantum acoustics with lithium niobate nanocavities | CLEO 2019 JW4A.4 | 4/7 | 10.1364/CLEO_AT.2019.JW4A.4 |
| 2019 | Low-loss integrated lithium niobate photonics for quantum light generation | OSA Quantum Information and Measurement (QIM) T5A.7 | 2/9 | 10.1364/QIM.2019.T5A.7 |
| 2019 | On-chip microwave-to-optical photon conversion for quantum networks | QIM T5A.10 | 3/7 | 10.1364/QIM.2019.T5A.10 |
| 2019 | Microwave quantum acoustic processor | IEEE IMS 2019 | 4/13 | 10.1109/MWSYM.2019.8700733 |
| 2019 | Strong coupling of a transmon qubit and a phononic crystal cavity array | APS March Meeting 2019 | 5/7 | N/A |
| 2020 | Efficient bidirectional piezo-optomechanical transduction between microwave and optical frequency | CLEO 2020 AF3K.4 | 1/8 | 10.1364/CLEO_AT.2020.AF3K.4 |
| 2020 | Nanobenders: efficient piezoelectric actuators ... | CLEO 2020 STu4J.1 | 1/6 | 10.1364/CLEO_SI.2020.STu4J.1 |
| 2020 | Piezo-optomechanics in lithium niobate on silicon-on-insulator for microwave-to-optics transduction | CLEO 2020 STu4J.2 (also APS March 2020) | 2/10 | 10.1364/CLEO_SI.2020.STu4J.2 |
| 2020 | A lithium niobate electro-optic transducer for quantum networks | APS March Meeting 2020 | 5/9 | N/A |
| 2020 | Optomechanical quantum state tomography; Towards a microwave to mm-wave quantum frequency converter | APS March Meeting 2020 | 5/10; 4/11 | N/A |
| 2020 | Development of a millimeter-wave transducer for quantum networks | IRMMW-THz 2020 | 5/9 | 10.1109/IRMMW-THz46771.2020.9370661 |
| 2022 | Microwave-to-optical quantum frequency conversion with thin-film lithium niobate on silicon-on-insulator piezo-optomechanics | APS March Meeting 2022, B34.010 (session held 2022-03-14, Chicago, per APS session listing) | 1 | https://meetings-archive.aps.org/mar/2022/b34/ |
| 2022 | Heterogeneous integration of high kinetic inductance resonator with TFLN nanomechanical resonators | APS March 2022 B34.005 | 2 | N/A |
| 2023 | Optically heralded microwave photons (Parts 1 and 2) | APS March 2023 M67.002 / M67.003 | 2 | N/A |
| 2023 | Optically heralded microwave photons | CLEO 2023 FTh4A.1 | 2/8 | 10.1364/CLEO_FS.2023.FTh4A.1 |
| 2023 | Coherent millimeter-wave transduction with lithium niobate electro-optics | APS March 2023 Z67.003 | 4 | N/A |
| 2023 | Nanomechanical lithium niobate on silicon resonators for single molecule sensing | APS March 2023 T72.012 | 4 | N/A |
| 2023 | Tunable dual wavelength laser on thin film lithium niobate | IEEE Photonics Conference (IPC) 2023 | 9/11 | 10.1109/IPC57732.2023.10360651 (green OA copy at Ghent University repository) |
| 2023 | Quantum critical electro-optic materials for photonics | CLEO 2023 SF1E.5 (SrTiO3 context, non-LN per title) | 9/11 | 10.1364/CLEO_SI.2023.SF1E.5 |
| 2024 | A two-dimensional optomechanical crystal for quantum transduction; A microwave-to-optical transducer based on a 2D OMC | Optica Quantum 2.0, QTu4A.3 / QTu4A.4 | 5/7; 7/9 | 10.1364/QUANTUM.2024.QTu4A.3 ; .4 |
| 2024 | Millimeter-wave to telecom electro-optic frequency transduction on thin-film lithium niobate | APS March 2024 F53.004 | 4 | N/A |

Talk recordings / seminar videos: none found in public search (2026-10-24). Who presented each multi-author abstract: N/A except where WJ is first author.

## 6. Patent

| Field | Value | Source |
|---|---|---|
| Title | High-throughput single-molecule photoacoustic absorption spectroscopy with nanomechanical oscillators | https://techfinder.stanford.edu/technology/high-throughput-single-molecule-photoacoustic-absorption-spectroscopy-nanomechanical |
| Inventors | Amir Safavi-Naeini, Wentao Jiang, Kaveh Pezeshki | TechFinder; Scholar row |
| Status | US application 18/965,736; published as US 2025/0180467; Stanford docket S23-437; grant status N/A | TechFinder; Scholar |
| LN link | Not stated in the TechFinder summary; the related APS March 2023 abstract "Nanomechanical lithium niobate on silicon resonators for single molecule sensing" suggests an LN-on-Si resonator context *[speculation; not verified in the patent text]* | |

## 7. Pre-Stanford and non-LN items on the profile (verified same person, not LN)

| Item | Evidence of same person |
|---|---|
| Coulomb oscillations in a gate-controlled few-layer graphene quantum dot, Nano Lett. 16, 6245 (2016), 10.1021/acs.nanolett.6b02522, WJ 3/10 | On verified Scholar profile; OpenAlex author shows Tsinghua affiliation; ORCID Tsinghua 2013-2017; author's public about page mentions graphene work at Tsinghua |
| Bound state properties of ABC-stacked trilayer graphene quantum dots, J. Phys.: Condens. Matter 29 (2017), 10.1088/1361-648X/aa6aac, arXiv 1611.09208, WJ 2/4 | Same as above |

## 8. Unverified / ambiguous items

| Item | Issue |
|---|---|
| "Energy to Store One Bit" (2018, 4 cites) and "Energy to transmit one bit" (2018, 2 cites), W. Jiang sole author | On Scholar profile; venue N/A; no DOI found; nature of document N/A |
| "PLEASE CITE THIS ARTICLE AS DOI: 10.1063/5.0157516" | Scholar duplicate of P18 (accepted-manuscript artifact) |
| "Acousto-optic modulation of a wavelength-scale waveguide: supplement" | Scholar duplicate of P10 supplement |
| APS March Meeting 2020, session M02.5 (surfaced by web search near WJ name) | APS archive returned 403; title and authors N/A |
| P12 material | arXiv text checked does not name the OMC material; N/A |
| P14 section authored | N/A |

## 9. Figure-reuse rights summary (for site planning)

| Category | Items | Practical meaning |
|---|---|---|
| CC BY 4.0 journal version | P05, P07, P14, P19, P20, P22 | Figures reusable on a public site with attribution and license note |
| CC BY 4.0 arXiv version | P17 (arXiv 2210.10739), P14 | arXiv-version figures reusable with attribution, even though the Nature Physics version is subscription |
| CC0 arXiv | P26 | Unrestricted (non-LN) |
| CC BY 4.0 open data | P17 (Zenodo 7903643), P25 (Zenodo 17138311), P21 (Zenodo 13984170) | Plots can be regenerated from data under CC BY. Best path to interactive figures |
| Optica OA License (OAPA) | P03, P08, P10, P13, P15, P16 | Reuse with attribution for non-commercial purposes. A non-commercial personal site appears compatible *[estimate; confirm with Optica terms if the site ever carries ads or sales]* |
| APS / AIP / Springer Nature subscription; arXiv non-exclusive | P01, P02, P04, P06, P09, P11, P12, P18, P23, P24, P25 (journal), P27 | Publishers generally grant authors rights to reuse their own figures with citation, but terms differ per publisher: check APS, AIP, Springer Nature author-rights pages before copying. Safer: redraw from own data / thesis, or rebuild as simulations |
| Dissertation | Thesis | Author holds copyright; original thesis figures freely reusable by the author |

## 10. Notable LINQS LN / TFLN papers without WJ (context)

Source: OpenAlex works for Safavi-Naeini (`A5067600960`) with "lithium niobate" search, cites > 20, retrieved 2026-10-24; authorship checked (no WJ). Crossref for 10.1038/s41586-022-04500-y.

| Year | First author | Title (short) | Venue / DOI | Topic |
|---|---|---|---|---|
| 2017 | J. D. Witmer | High-Q photonic resonators and electro-optic coupling using silicon-on-lithium-niobate | Sci. Rep., 10.1038/srep46313 | Si-on-LN hybrid photonics |
| 2018 | P. Arrangoiz-Arriola | Coupling a superconducting quantum circuit to a phononic crystal defect cavity | PRX, 10.1103/PhysRevX.8.031007 | LN quantum acoustics |
| 2019 | A. H. Safavi-Naeini | Controlling phonons and photons at the wavelength scale: integrated photonics meets integrated phononics | Optica, 10.1364/OPTICA.6.000213 | Perspective / review |
| 2020 | C. J. Sarabalis | Acousto-optic modulation in lithium niobate on sapphire | APL Photonics, 10.1063/5.0012288 | LNOS acousto-optics |
| 2020 | C. J. Sarabalis | S-band delay lines in suspended lithium niobate | J. Appl. Phys., 10.1063/1.5126428 | Phononic delay lines |
| 2022 | T. P. McKenna | Ultra-low-power second-order nonlinear optics on a chip | Nat. Commun., 10.1038/s41467-022-31134-5 | PPLN microrings, chi(2) |
| 2022 | E. A. Wollack | Quantum state preparation and tomography of entangled mechanical resonators | Nature, 10.1038/s41586-022-04500-y | LN phononic resonators + qubit |
| 2022 | J. F. Herrmann | Mirror symmetric on-chip frequency circulation of light | Nat. Photonics, 10.1038/s41566-022-01026-7 | EO frequency circulation |
| 2022 | T. Park | High-efficiency second harmonic generation of blue light on TFLN | Opt. Lett., 10.1364/OL.455046 | SHG |
| 2022 | J. Mishra | Ultra-broadband mid-infrared generation in dispersion-engineered TFLN | Opt. Express, 10.1364/OE.467580 | Mid-IR |
| 2022 | O. Atalar | Longitudinal piezoelectric resonant photoelastic modulator | Nat. Commun., 10.1038/s41467-022-29204-9 | Bulk-LN-wafer photoelastic modulator (MHz) |
| 2023 | H. S. Stokowski | Integrated quantum optical phase sensor in TFLN | Nat. Commun., 10.1038/s41467-023-38246-6 | Squeezing / sensing |
| 2023 | A. Y. Hwang | Mid-infrared spectroscopy with a broadly tunable TFLN OPO | Optica, 10.1364/OPTICA.502487 | OPO |
| 2023 | D. Riedel | Efficient photonic integration of diamond color centers and TFLN | ACS Photonics, 10.1021/acsphotonics.3c00992 | Hybrid quantum photonics |
| 2024 | H. S. Stokowski | Integrated frequency-modulated optical parametric oscillator | Nature, 10.1038/s41586-024-07071-2 | FM-OPO |
| 2024 | T. Park | Single-mode squeezed-light generation and tomography with an integrated OPO | Sci. Adv., 10.1126/sciadv.adl1814 | Squeezed light |
| 2024 | M. Hamrouni | Picojoule-level supercontinuum generation in TFLN on sapphire | Opt. Express, 10.1364/OE.514649 | Supercontinuum |
| 2024 | A. Y. Cleland | Studying phonon coherence with a quantum sensor | Nat. Commun., 10.1038/s41467-024-48306-0 | LN phonon coherence |

Observation (fact, from the tables): LINQS LN work splits into (a) piezo/acousto/optomechanics and quantum acoustics (WJ's area) and (b) chi(2) nonlinear and quantum optics in PPLN / TFLN-on-sapphire (OPO, squeezing, SHG, mid-IR), where WJ is not an author.

## 11. Cross-check against the author's public blog

- The author's public about page links the dissertation PURL and an "lithium niobate properties" tutorial (outside5sigma.com/tutorial/ln-properties/), and states PhD at Stanford 2017-2022 (Ginzton Lab, LINQS).
- The blog archive has 2018-2019 posts on LN nanobeam ("lnnb") simulations, LN 2D phononic shield, LN-on-sapphire phonon waveguide simulation, an LN paper outline (2019-01), a roto-optic effect estimate, LN vs LiTaO3, plus "LN photonics literature" and "LN properties" (2018). These map to P03 and P05 era work. Detailed inventory belongs to R02.

## 12. Facts / estimates / speculation

- Facts: everything in sections 1-7 and 10 with a cited DOI / URL; numbers are quoted from abstracts or arXiv full text (via ar5iv or Europe PMC). Journal versions can differ slightly from arXiv v1.
- Estimates: Optica OAPA compatibility with a non-commercial site (section 9).
- Speculation: LN context of the patent (section 6).
- Not checked: journal-version supplements; Optica full text (blocked); APS meeting abstract bodies (blocked).

---

## Website implications (ranked)

1. **"My LN story" timeline page** built from the dissertation arc (thesis owned by the author): TFLN OMC (P03, 2019) -> all-LN piezo-optomechanical transducer (P05, 2020) -> nanobenders (P07, 2020) -> LN-on-SOI hybrid -> optically heralded microwave photon (P17, 2023) -> later TFLN-on-diamond / 2D transducers (P24, P27). Each node: one 3D device render, one headline number, hover popup with citation, license, and a link to arXiv.
2. **Interactive reproduction of the heralded-microwave-photon figures (P17)** from the CC BY Zenodo source data: a step-through heralding animation plus an interactive phase-space plot. Openly licensed data, first-author Nature Physics result; the strongest "a PDF cannot do this" piece.
3. **"Follow one microwave photon" signal-chain explorer (P05)**: IDT -> horn -> phonon waveguide -> OMC -> optical sideband, with per-stage efficiency bookkeeping and sliders for C0, eta_e, pump power (Fig. 4a model). CC BY 4.0, so original figures can sit beside the interactive version.
4. **Anisotropy playground (P03)**: rotate an X-cut / Y-cut LN film and watch photoelastic g0 and piezoelectric coupling change with in-plane angle. Doubles as a general LN tensor-property demo, links to the material-properties API (R06).
5. **Nanobender toy (P07)**: voltage slider bends a 3D LN beam and tunes a zipper cavity resonance; contrasts 0.01 nm/V bulk piezo with tens of nm/V nanobenders. CC BY 4.0.
6. **"Photonics for sound" phononic circuits page (P06, P09, P10, P24, P25)**: TFLN-on-sapphire / suspended / on-diamond phononic waveguides, IDT design toy, collinear acousto-optic mode conversion, racetrack resonator animation. P25 can use CC BY Zenodo data.
7. **Quantum acoustics with LN (P04, P11, P18, P19, P23)**: avoided-crossing and phonon-number-splitting widgets; TLS loss and random-telegraph-noise generators. Mostly simulation-driven, so no figure-rights dependency.
8. **Publication index endpoint**: machine-readable JSON of sections 4-6 (DOI, arXiv, license, LN class, key numbers) for AI/agent access, matching the site's "easy-for-AI endpoints" requirement. Refresh citation counts with a dated field, never "current".
9. **LINQS context sidebar**: a short "neighbouring LN work from the same lab" list (section 10) to place the author's piezo-optomechanics work next to the lab's chi(2) / OPO / squeezing work, with links only (no figure copying).
10. **Rights hygiene**: use CC BY / CC0 / thesis / Zenodo-data assets first; redraw or simulate everything else. Mark each figure with source DOI and license in a hover popup.
