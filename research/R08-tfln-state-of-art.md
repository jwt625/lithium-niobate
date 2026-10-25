# R08: TFLN science and technology state of the art (through 2026-10)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Track | R08 (see `DevLog/DevLog-000-kickoff-and-requirements.md`) |
| Scope | Review papers and their gaps; record metrics; physical effects; applications; groups; companies |
| Method | Five parallel research passes plus coordinator spot checks. DOIs checked against the Crossref API; numbers taken from abstracts (Crossref, Europe PMC, arXiv) or official pages. Open-access (OA) status from OpenAlex/Crossref metadata unless noted |
| Status | Draft research note, not yet audited |

## Verification legend

- **Y**: DOI resolves via Crossref (title/author/venue match) and the number appears in the published abstract or official page.
- **Y(arXiv)**: number from the arXiv abstract; the published wording may differ.
- **Y(conf)** / **Y(preprint)**: conference abstract / non-peer-reviewed preprint.
- **title**: only the title (or metadata) was confirmed; no number extracted.
- **unverified**: number from memory, a secondary source, or a paywalled full text not read. Do not publish without a check.
- "Highest found" means highest found in this pass as of 2026-10-24. Web-search budgets were exhausted in every pass; 2024-2026 coverage is incomplete, so treat "record" as provisional.
- Access limits hit: Optica (opg.optica.org) served an anti-bot page, Nature/Springer redirected to login, Business Wire returned 403. Those sites were not retried.

---

## 1. Review papers

Sorted by issue year. "Optica OA" = gold OA under Optica's own OA license (not necessarily CC BY). "Adjacent" = not LN-specific but central to LN work.

| # | Citation | DOI | Year | Scope | OA / license | Gap an interactive site can fill |
|---|---|---|---|---|---|---|
| 1 | Poberaj, Hu, Sohler, Gunter, "Lithium niobate on insulator (LNOI) for micro-photonic devices", Laser Photon. Rev. 6, 488 | 10.1002/lpor.201100035 | 2012 | Historical: ion slicing, first LNOI micro-devices | Paywalled | Predates dry-etched low-loss TFLN; needs a loss/Q-vs-year timeline for context |
| 2 | Boes, Corcoran, Chang, Bowers, Mitchell, "Status and potential of LNOI for photonic integrated circuits", Laser Photon. Rev. 12, 1700256 | 10.1002/lpor.201700256 | 2018 | LNOI platform status and outlook | Free to read (bronze), no license | Benchmarks frozen at 2017; no live loss/VpiL database |
| 3 | Rao, Fathpour, "Compact lithium niobate electrooptic modulators", IEEE JSTQE 24, 3400114 | 10.1109/JSTQE.2017.2779869 | 2018 | Hybrid Si/SiN-LN and LNOI ridge modulators | Green repository copy | No VpiL-bandwidth trade-off calculator or velocity-matching solver |
| 4 | Yu, Wang, Zhang, Loncar, "Chip-based lithium-niobate frequency combs", IEEE PTL 31, 1894 | 10.1109/LPT.2019.2950567 | 2019 | Kerr, EO, supercontinuum combs on LNOI | Green: arXiv:2002.00709 | No comb simulator (Lugiato-Lefever equation, LLE); letter-length |
| 5 | Kong, Bo, Wang, Zheng, ... Xu, "Recent progress in lithium niobate: optical damage, defect simulation, and on-chip devices", Adv. Mater. 32, 1806452 | 10.1002/adma.201806452 | 2020 | Photorefraction, doping, defect modelling, LNOI devices | Paywalled | No interactive defect/doping-to-property explorer |
| 6 | Qi, Li, "Integrated lithium niobate photonics", Nanophotonics 9, 1287 | 10.1515/nanoph-2020-0013 | 2020 | Broad TFLN survey | Gold, CC BY 4.0 | Static figures; no mode solver; metrics not machine-readable |
| 7 | Lin, Bo, Cheng, Xu, "Advances in on-chip photonic devices based on lithium niobate on insulator", Photon. Res. 8, 1910 | 10.1364/PRJ.395305 | 2020 | Femtosecond-laser lithography + chemo-mechanical polishing (CMP), microresonators | Paywalled per OpenAlex (unverified on publisher page) | No 3D process flow; no Q-vs-fabrication-method dataset |
| 8 | Honardoost, Abdelsalam, Fathpour, "Rejuvenating a versatile photonic material: thin-film lithium niobate", Laser Photon. Rev. 14, 2000088 | 10.1002/lpor.202000088 | 2020 | TFLN modulators, nonlinear, hybrid | Paywalled | Tables end 2020 |
| 9 | Sun, Zhang, Wang, Song, ... Liu, "Microstructure and domain engineering of lithium niobate crystal films", Light Sci. Appl. 9, 197 | 10.1038/s41377-020-00434-0 | 2020 | Film microstructure, poling | Gold, CC BY 4.0 | No quasi-phase-matching (QPM) period calculator; no 3D domains |
| 10 | Parriaux, Hammani, Millot, "Electro-optic frequency combs", Adv. Opt. Photon. 12, 223 (adjacent) | 10.1364/AOP.382052 | 2020 | EO comb theory, mostly bulk/fiber | Green (HAL), CC BY on that copy | No EO comb simulator with TFLN ring parameters |
| 11 | Zhu, Shao, Yu, Cheng, ... Loncar, "Integrated photonics on thin-film lithium niobate", Adv. Opt. Photon. 13, 242-352 | 10.1364/AOP.411024 | 2021 | Reference review: material, passives, EO, nonlinear, AO, quantum | Version of record paywalled (checked on Optica page; OpenAlex "CC BY" label is wrong); arXiv:2102.11956; accepted manuscript via CHORUS | Pre-TFLT, pre-foundry PDK, pre-2022 records; static dispersion/phase-matching figures; tables not machine-readable |
| 12 | Zhang, Wang, Kharel, Zhu, Loncar, "Integrated lithium niobate electro-optic modulators: when performance meets scalability", Optica 8, 652 | 10.1364/OPTICA.415762 | 2021 | TFLN EO modulators | Optica OA | No traveling-wave electrode calculator (microwave index, impedance, loss) |
| 13 | Jia, Wang, Chen, "Ion-cut lithium niobate on insulator technology", Appl. Phys. Rev. 8, 011307 | 10.1063/5.0037771 | 2021 | Ion implantation, bonding, LNOI material | Paywalled | No implant-depth tool; no 3D smart-cut animation |
| 14 | Saravi, Pertsch, Setzpfandt, "Lithium niobate on insulator: an emerging platform for integrated quantum photonics", Adv. Opt. Mater. 9, 2100789 | 10.1002/adom.202100789 | 2021 | Pair sources, squeezing, EO quantum circuits | Hybrid OA, CC BY-NC 4.0 | No joint spectral amplitude (JSA) / purity calculator |
| 15 | Xie, Li, Chen, Long, "Microresonators in lithium niobate thin films", Adv. Opt. Mater. 9, 2100539 | 10.1002/adom.202100539 | 2021 | Rings/disks | Paywalled | No ring Q/coupling model; no Q-vs-year dataset |
| 16 | Zheng, Chen, "Nonlinear wave mixing in lithium niobate thin film", Adv. Phys. X 6, 1889402 | 10.1080/23746149.2021.1889402 | 2021 | chi(2)/chi(3) wave mixing | Gold, CC BY 4.0 | No phase-matching calculator |
| 17 | Yuan, Hu, Pan, Ding, ..., "Photonic devices based on thin-film lithium niobate on insulator", J. Semicond. 42, 041304 | 10.1088/1674-4926/42/4/041304 | 2021 | Device survey | Paywalled | Static |
| 18 | Han, Fu, Zou, Jiang, Tang, "Microwave-optical quantum frequency conversion", Optica 8, 1050 (adjacent) | 10.1364/OPTICA.425414 | 2021 | Transduction platforms incl. TFLN EO and piezo-optomechanics | Optica OA | No cooperativity/efficiency calculator |
| 19 | Vazimali, Fathpour, "Applications of thin-film lithium niobate in nonlinear integrated photonics", Adv. Photonics 4, 034001 | 10.1117/1.AP.4.3.034001 | 2022 | SHG, OPA/OPO, supercontinuum, quantum sources | Diamond OA, CC BY 4.0 | No group-velocity mismatch (GVM) / group-velocity dispersion (GVD) explorer |
| 20 | Chen G., Li, Ng, Lin, ... Danner, "Advances in lithium niobate photonics: development status and perspectives", Adv. Photonics 4, 034003 | 10.1117/1.AP.4.3.034003 | 2022 | Bulk to thin film, broad | Diamond OA, CC BY 4.0 | Static tables ending 2022; no property API |
| 21 | Xu, Cai, "Advances in integrated ultra-wideband electro-optic modulators", Opt. Express 30, 7253 | 10.1364/OE.449022 | 2022 | Ultra-wideband modulators across platforms | Optica OA | No sortable cross-platform benchmark |
| 22 | Fedotova, Carletti, Zilli, ... Setzpfandt, "Lithium niobate meta-optics", ACS Photonics 9, 3745 | 10.1021/acsphotonics.2c00835 | 2022 | LN metasurfaces | Paywalled; green copy (CC BY-NC) | No 3D meta-atom viewer |
| 23 | Boes, Chang, Langrock, Yu, Zhang, Lin, Loncar, Fejer, Bowers, Mitchell, "Lithium niobate photonics: unlocking the electromagnetic spectrum", Science 379, eabj4396 | 10.1126/science.abj4396 | 2023 | LN from UV to THz incl. RF/acoustic, bulk to TFLN | Paywalled; green copy on OSTI | No interactive spectral map (transparency, chi(2), EO by band) |
| 24 | Luo, Bo, Kong, Zhang, Xu, "Advances in lithium niobate thin-film lasers and amplifiers", Adv. Photonics 5, 034002 | 10.1117/1.AP.5.3.034002 | 2023 | Rare-earth and hybrid III-V lasers/amps | Diamond OA, CC BY 4.0 | Out of date for 2024+ gain records |
| 25 | Pan, Liu, Huang, Yu, ..., "Perspective on LNOI photonics utilizing the electro-optic and acousto-optic effects", ACS Photonics 10, 2078 | 10.1021/acsphotonics.2c01589 | 2023 | EO and AO devices | Paywalled | No surface acoustic wave (SAW) / interdigital transducer (IDT) overlap calculator |
| 26 | Mookherjea, Mere, Valdez, "Thin-film lithium niobate electro-optic modulators: to etch or not to etch", APL 122, 120501 | 10.1063/5.0142232 | 2023 | Etched vs bonded/etchless modulators | Paywalled | Natural side-by-side cross-section mode/overlap simulator |
| 27 | Zhuang, Ni, Wu, Hao, ..., "Electro-optic frequency combs: theory, characteristics, and applications", Laser Photon. Rev. 17, 2200353 (adjacent) | 10.1002/lpor.202200353 | 2023 | EO comb theory | Paywalled | No comb generator |
| 28 | Xiong, Cao, Xiao, ..., Acta Phys. Sin. 72, 234201 (Chinese) | 10.7498/aps.72.20231295 | 2023 | TFLN device survey | Diamond OA, CC BY | Chinese-language only |
| 29 | Xie, Bo, Lin, Hu, ..., "Recent development in integrated lithium niobate photonics", Adv. Phys. X 9, 2322739 | 10.1080/23746149.2024.2322739 | 2024 | Broad 2024 update | Gold, CC BY 4.0 | No living benchmarks |
| 30 | Zhang, Yin, Zhang, Miao, ..., "Integrated electro-optic frequency combs: theory and current progress", Laser Photon. Rev. 18, 2301363 | 10.1002/lpor.202301363 | 2024 | Integrated (mostly TFLN) EO combs | Paywalled | No resonant EO comb simulator |
| 31 | You, Yuan, Tian, Zhang, ..., "Lithium niobate on insulator: fundamental opto-electronic properties and photonic device prospects", Nanophotonics 13, 3037 | 10.1515/nanoph-2024-0132 | 2024 | Phase matching, EO, thermo-optic, AO fundamentals | Gold, CC BY 4.0 | Tensors as static equations; no crystal-cut rotation tool |
| 32 | Hou, Hu, Liu, Xing, ..., "High-speed electro-optic modulators based on thin-film lithium niobate", Nanomaterials 14, 867 | 10.3390/nano14100867 | 2024 | Modulator survey | Gold, CC BY 4.0 | No RF simulation |
| 33 | Ge, Wu, Liu, Chen, ..., "Recent progress in thin-film lithium niobate photonic crystal", Chin. Opt. Lett. 22, 033602 | 10.3788/COL202422.033602 | 2024 | TFLN photonic crystals | Free to read, no license | No band-structure calculator |
| 34 | Wang, Du, Zhang, Chen, "Optical nonlinearity of thin film lithium niobate", J. Phys. D 58, 023001 | 10.1088/1361-6463/ad7ff7 | 2024 (issue 2025) | chi(2)/chi(3) devices | Paywalled | No efficiency calculator |
| 35 | Murali, Banerjee, Basu, Beilstein J. Nanotechnol. 15, 1415 | 10.3762/bjnano.15.114 | 2024 | Short LNOI review | Diamond OA, CC BY 4.0 | Brief |
| 36 | Fan, Li, Luo, Yu, ..., Sci. Sin. Phys. Mech. Astron. 54, 114203 (Chinese) | 10.1360/SSPMA-2024-0164 | 2024 | TFLN EO modulators | Paywalled | Chinese-language |
| 37 | Han, Ruan, Xiang, "Heterogeneously integrated photonics based on thin film lithium niobate platform", Laser Photon. Rev. 19, 2400649 | 10.1002/lpor.202400649 | 2025 | Lasers, detectors, Si/SiN on TFLN | Paywalled | No 3D stack/taper viewer |
| 38 | Hu, Zhu, Lu, Zhu, ... Loncar, "Integrated electro-optics on thin-film lithium niobate", Nat. Rev. Phys. 7, 237 | 10.1038/s42254-025-00825-5 | 2025 | EO fundamentals to state of the art | Paywalled; arXiv:2404.06398 | No hands-on Pockels/electrode-overlap simulator |
| 39 | Labbe, Ekici, Zhdanov, Muthali, ..., "Thin-film lithium niobate quantum photonics: review and perspectives", Adv. Photonics 7, 044002 | 10.1117/1.AP.7.4.044002 | 2025 | Sources, squeezing, detectors, EO quantum control | Diamond OA, CC BY 4.0 | No squeezing/JSA calculator; metrics not machine-readable |
| 40 | Qu, Wu, Cai, Ren, ..., "Second harmonic generation in lithium niobate on insulator", Laser Photon. Rev. 19, 2401928 | 10.1002/lpor.202401928 | 2025 | SHG in waveguides, rings, metasurfaces | Hybrid OA, CC BY per OpenAlex | No %/W/cm^2 benchmark database |
| 41 | Sun, Jia, Chen, "Thin-film lithium niobate-based detector", Opto-Electron. Sci. 4, 250028 | 10.29026/oes.2025.250028 | 2025 | Detectors on TFLN | Diamond OA, CC BY per OpenAlex | No responsivity/bandwidth dataset |
| 42 | Chakkoria, Dubey, Mitchell, Boes, "Ferroelectric domain engineering of lithium niobate", Opto-Electron. Adv. 8, 240139 | 10.29026/oea.2025.240139 | 2025 | Poling, bulk and thin film | Gold, CC BY per OpenAlex | No poling-waveform simulator; no 3D domain walls |
| 43 | Lu R., "Recent advances in high-performance millimeter-wave acoustic resonators and filters using thin-film lithium niobate", Prog. Quantum Electron. 100-101, 100565 | 10.1016/j.pquantelec.2025.100565 | 2025 | TFLN mmWave acoustic resonators/filters | Paywalled | No Butterworth-Van Dyke (BVD) / k^2 calculator |
| 44 | Karami, Thapalia, Fathpour, "Integrated quantum photonics on thin-film lithium niobate", Prog. Quantum Electron. 106, 100614 | 10.1016/j.pquantelec.2026.100614 | 2026 | TFLN quantum milestones | Paywalled | Overlaps #39 |
| 45 | Feng, Zeng, Ye, ... Marpaung, Wang C., "Integrated lithium niobate microwave photonics: driving next-generation wireless technologies" | arXiv:2605.08939 (2026-05-09) | 2026 | Microwave photonics (MWP): links, filters, processors | Preprint | No RF-link gain / noise figure / spurious-free dynamic range (SFDR) calculator |

Notes:
- **Gaps in the review literature itself** (none found, search incomplete): a dedicated thin-film lithium tantalate (TFLT) review (only a Nat. Photon. 2026 News & Views, 10.1038/s41566-025-01831-w, and an OPN 2026 feature, 10.1364/opn.37.4.000026); a TFLN foundry / wafer-scale manufacturing review; a TFLN etching/fabrication review (partial: #13 and CRC book "Lithium Niobate Nanophotonics" 2021, chapter 10.1201/9781003133773-2); a post-2019 Kerr-comb-on-LN review; a TFLN DC-drift review; an LN-specific transduction review.
- Not searched (budget): Nature Reviews Electrical Engineering, eLight, Light Sci. Appl. 2024-26, Chip, Photonics Insights. A TFLN acousto-optics review in Laser & Optoelectronics Progress 61(11), 1116008 (2024) was seen but not verified.
- Not found under the names suggested in the brief (do not cite): a Jankowski/Marandi "ultrafast nonlinear photonics in TFLN" review; G. Chen "hybrid Si/LN platform" review; a Cheng Wang single-author TFLN modulator review.
- Licensing implication: only CC BY items (#6, 9, 16, 19, 20, 24, 29, 31, 32, 35, 39, and per-OpenAlex 28, 40, 41, 42) allow figure reuse with attribution; recheck each license on the publisher page before reuse.

---

## 2. Record metrics (provisional, as of 2026-10-24)

### 2.1 Propagation loss and intrinsic Q

| Metric | Value, conditions | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Dry-etched ring (baseline) | Q ~1e7; loss down to 2.7 dB/m; telecom | Zhang M., Optica 4, 1536, 2017-12 | 10.1364/OPTICA.4.001536 | Y |
| Wafer-scale deep-UV (DUV) lithography | 0.27 dB/cm on 4- and 6-inch wafers | Luke K., Opt. Express, 2020-08 | 10.1364/oe.401959 | Y |
| **Dry-etched ring, highest found** | Intrinsic Q 29e6, 1.3 dB/m; ion-sliced TFLN | Zhu X., Photon. Res. 12, A63, 2024-07 | 10.1364/prj.521172 | Y |
| Photolithography-assisted chemo-mechanical etching (PLACE) ring with bus | Intrinsic Q 4.04e7, <1 dB/m after anneal | Li, Opt. Express, 2023-09 | 10.1364/oe.498086 | Y |
| PLACE microdisk | Q >1e8; OPO threshold 19.6 uW; SHG 23% | Gao R., New J. Phys., 2021-12 | 10.1088/1367-2630/ac3d52 | Y (Q) |
| CMP microring, film thinned from bulk (no ion slicing) | Q ~1e8; ~0.28 dB/m at 1550 nm | Gao R., Chin. Opt. Lett. 20, 011902, 2022 | 10.3788/col202220.011902 | Y(arXiv) |
| Material-limited estimate (not a device) | Annealed ion-sliced TFLN, material Q ~1.6e8 (0.2 dB/m) | Shams-Ansari A., APL Photonics, 2022-08 | 10.1063/5.0095146 | Y (inferred limit) |
| Visible | 6 dB/m; ring Q_i 11e6 at 637 nm | Desiatov B., Optica 6, 380, 2019-03 | 10.1364/OPTICA.6.000380 | Y |
| Near-IR modulator waveguide | ~0.7 dB/cm at 738 nm | Renaud D., Nat. Commun., 2023-03 | 10.1038/s41467-023-36870-w | Y |
| UV | "Record-low" 2.3 dB/cm UV waveguides; light near 390 nm | Franken C., Nat. Commun. 17, 3651, 2026 | 10.1038/s41467-026-68524-y | partial (loss wavelength not in abstract) |
| Industry claim | <2 dB/m waveguide loss, ~20 mdB switch loss (Xanadu + HyperLight release) | Press, 2025-07-30 | thequantuminsider.com/2025/07/30/xanadu-and-hyperlight-unveil-advances-in-photonic-chips-setting-new-quantum-computing-benchmarks/ | press only |

Takeaway: dry-etched ion-sliced rings top out at ~1.3 dB/m (Q_i 2.9e7). CMP/PLACE devices reach Q >=1e8 (~0.3 dB/m). The inferred material limit is ~0.2 dB/m.

### 2.2 Modulators: Vpi*L and EO bandwidth

Caveat: VpiL definitions differ (push-pull vs single arm, DC vs RF, wavelength). Values are not strictly comparable.

| Metric | Value, conditions | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Early TFLN | VpiL 1.8 V cm; rings and micro-MZIs | Wang C., arXiv 1701.06470, 2017 | arXiv:1701.06470 | Y(arXiv) |
| Benchmark MZM | CMOS-compatible drive; up to 210 Gb/s; on-chip loss <0.5 dB | Wang C., Nature 562, 101, 2018-09 | 10.1038/s41586-018-0551-y | Y (coordinator re-read abstract). "Vpi 1.4 V" and "100 GHz" are main-text figures: unverified here |
| Early mmWave | "THz operating bandwidth" (title); ~40 GHz 3-dB per secondary source | Mercante A., Opt. Express 26, 14810, 2018 | 10.1364/OE.26.014810 | title |
| Segmented (T-) electrodes | RF Vpi 1.3 V, 1.8 dB roll-off at 50 GHz | Kharel P., Optica 8, 357, 2021-03 | 10.1364/OPTICA.416155 | Y |
| Dual-pol IQ | Sub-1-V drive, 110 GHz | Xu M., Optica 9, 61, 2022-01 | 10.1364/OPTICA.449691 | Y |
| **Highest measured 3-dB EO bandwidth found** | 170 GHz (3 dB), 295 GHz (6 dB); RF Vpi 7.3 V at 250 GHz; measured to 325 GHz | Zhang Y., Photon. Res., 2022-09 | 10.1364/prj.468518 | Y |
| Low-k underfill | Vpi 1.9 V (C) / 1.54 V (O), 7 mm; VpiL 1.33 / 1.08 V cm; 3-dB 220 / 218 GHz **extrapolated** | Liu H., Laser Photon. Rev., 2025-03 | 10.1002/lpor.202402053 | Y |
| **Lowest telecom-class VpiL found** | 0.33 V cm, ridge-top transparent electrodes, 300 um device; 2.4 dB roll-off at 110 GHz; 3-dB 145 GHz extrapolated; IL 2.7 dB | Yu, Opt. Express, 2025-09 | 10.1364/oe.572384 | Y (wavelength not in abstract) |
| Visible/NIR | VpiL 0.55 V cm at 738 nm; >35 GHz | Renaud D., Nat. Commun., 2023 | 10.1038/s41467-023-36870-w | Y |
| Etchless TFLN bonded on SiN | VpiL 0.8 V cm at 784 nm; >100 GHz | Valdez F., arXiv 2211.13348, 2022 | arXiv:2211.13348 | Y(preprint) |
| Wafer-scale manufacturing | 4-inch TFLN on quartz; >110 GHz; Vpi <3 V; VpiL 2.92 V cm; 50% yield | Liu, Light Adv. Manuf., 2025 | 10.37188/lam.2025.047 | Y |
| Er-doped amplified MZM | >6 dB net on-chip gain; >110 GHz; 144 Gb/s | Xiong, Photon. Res., 2026-04 | 10.1364/prj.586899 | Y |
| Exclude | "0.105 V cm, 235 GHz": simulated design only | Dadkhah, Adv. Photon. Res., 2026-02 | 10.1002/adpr.202500237 | simulation |

### 2.3 Symbol rate and net bit rate with TFLN modulators

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| **Highest symbol rate found** | 440 GBd PS-16-ASK (probabilistically shaped amplitude-shift keying), single wavelength, 221 GHz band-interleaved DAC (digital-to-analog converter); title claims net >1 Tb/s per modulation dimension | Deakin C. (Nokia Bell Labs), OFC 2025 postdeadline Th4B.7; JLT 2026-02 (Che D.) | 10.1364/ofc.2025.th4b.7 ; 10.1109/jlt.2025.3632244 | Y (exact net rate not in abstract) |
| Earlier step | 314 GBd PS-8-ASK, 158 GHz DAC | Che D., arXiv 2504.15331 | arXiv:2504.15331 | Y(arXiv); venue unverified |
| Coherent | 260 GBd single-wavelength over 100 km, TFLN IQ | Almonacil S., JLT, 2023-06 | 10.1109/jlt.2023.3269740 | title |
| Coherent, single wavelength | 1.96 Tb/s net | Xu M., Optica, 2022 | 10.1364/OPTICA.449691 | Y |
| Coherent, single carrier | 1.6 Tb/s net, DP-IQ on Si | Wang, APL Photonics, 2022-07 | 10.1063/5.0097296 | Y |
| IM/DD (intensity modulation / direct detection) | 128 GBd PAM16, net 400 Gb/s | Berikaa E., Opt. Lett., 2022-12 | 10.1364/ol.476399 | Y |
| IM/DD, dual polarization | 512 Gb/s PAM4 | Zhang, Nanophotonics, 2025-11 | 10.1515/nanoph-2025-0472 | Y |
| IM/DD, microring | 517 Gb/s (200 GBd PAM6), 1.5 fJ/bit | Tian, Research Square, 2026-09 | 10.21203/rs.3.rs-10811928/v1 | Y(preprint) |
| System trial | 8x448G = 3.2T over 2 km, 140 GHz modulators (Ciena + HyperLight + McGill) | Press, 2025-04-01 | secondary coverage only | unverified |
| Industry | HyperLight 400G/lane PICs (2026-03-17); 1.6T-DR8 TFLN reference transceiver (2026-03-16); Murata TFLN modulator >100 GHz, 400G/ch PAM4 at OFC 2026 | hyperlightcorp.com news; corporate.murata.com/en-us/newsroom/news/company/general/2026/0310 | official page (Murata: Y); HyperLight: headline only |

### 2.4 SHG in PPLN nanowaveguides and rings

| Metric | Value, conditions | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Waveguide, normalized | 2600 %/W/cm^2, 1.5 um pump, 4 um period | Wang C., Optica 5, 1438, 2018 | 10.1364/OPTICA.5.001438 | Y |
| Waveguide, normalized | 4600 %/W/cm^2, poling after etching, actively monitored | Rao A., Opt. Express 27, 25920, 2019 | 10.1364/OE.27.025920 | Y (title) |
| Waveguide, shallow etch | 3757 %/W/cm^2 (939 %/W), x-cut MgO:TFLN | Zhao J., Opt. Express, 2020 | 10.1364/OE.395545 | Y |
| Waveguide, adapted poling | 104 %/W overall; >80% conversion at 20 mW | Chen P.-K., Nat. Nanotechnol. 19, 44, 2024 | 10.1038/s41565-023-01525-w | Y |
| **Waveguide, highest normalized found** | 9600 %/W/cm^2 measured; 85% absolute at high power; polarization-reversed double-layer TFLN | Li, Adv. Photonics Nexus, 2024 | 10.1117/1.APN.3.6.066009 | Y |
| Blue SHG | 33,000 %/W/cm^2 | Park T., Opt. Lett. 47, 2706, 2022 | 10.1364/OL.455046 | Y |
| Mid-IR DFG (LN on sapphire) | 200 %/W/cm^2, out to 3.66 um | Mishra J., Optica, 2021 | 10.1364/OPTICA.427428 | Y |
| Modal phase matching (no poling) | 4.7 %/W in 8 mm | Luo R., Optica 5, 1006, 2018 | 10.1364/OPTICA.5.001006 | Y(arXiv) |
| Ring, z-cut PPLN | 250,000 %/W; 15% absolute at 115 uW | Lu J., Optica 6, 1455, 2019 | 10.1364/OPTICA.6.001455 | Y(arXiv) |
| **Ring, highest found** | 5,000,000 %/W; g/2pi ~1.2 MHz; g/kappa approaching 1% | Lu J., Optica, 2020 | 10.1364/OPTICA.403931 | Y |
| Ring, x-cut QPM racetrack | 3.8 %/mW (arXiv v1). The often-quoted 230,000 %/W is unverified | Chen J.-Y., Optica 6, 1244, 2019 | 10.1364/OPTICA.6.001244 | partial |
| Ring SHG + OPO | >10% SHG; OPO threshold tens of uW; >1 THz tuning | McKenna T.P., Nat. Commun., 2022 | 10.1038/s41467-022-31134-5 | Y |

### 2.5 OPA gain and OPO

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| fs OPA | >50 dB/cm phase-sensitive gain (6 mm); >100 dB/cm over 600 nm near 2 um (OPG) | Ledezma L., Optica, 2022 | 10.1364/OPTICA.442332 | Y |
| **fs OPA, highest found** | 71 dB (118 dB/cm) unsaturated, 1700-2700 nm, 4 pJ pump; 88 dB (>146 dB/cm) saturated | Jankowski M., Optica, 2022 | 10.1364/OPTICA.442550 | Y |
| CW OPO threshold, ring | ~30 uW; 11% conversion at 93 uW | Lu J., Optica, 2021 | 10.1364/OPTICA.418984 | Y(arXiv) |
| CW OPO threshold, PLACE microdisk | 19.6 uW | Gao R., New J. Phys., 2021 | 10.1088/1367-2630/ac3d52 | Y |
| Pulsed tunable OPO | 1.53-3.25 um, one chip | Ledezma L., Sci. Adv., 2023 | 10.1126/sciadv.adf9711 | Y |
| fs OPO comb | 1.5-3.3 um, femtojoule-level threshold | Roy A., Nat. Commun., 2023 | 10.1038/s41467-023-42289-0 | Y |
| Mid-IR OPO, LN on sapphire | >25 mW at 3.2 um; 15% power / 45% quantum efficiency | Hwang A.Y., Optica, 2023 | 10.1364/OPTICA.502487 | Y(arXiv) |
| Electrically tuned mid-IR OPO | 22 THz span, 2.7-3.4 um, Vernier tuning | Hwang A.Y., Nat. Photonics, 2026-08-27 | 10.1038/s41566-026-01999-9 | Y(arXiv) |
| FM-OPO comb | >93% internal pump-to-comb (34% out-coupled), ~200 modes (>1 THz) (arXiv v1 said ~1000 modes) | Stokowski H.S., Nature, 2024 | 10.1038/s41586-024-07071-2 | Y |
| All-optical switching | tens of fJ, 18 fs, energy-time product 1.4e-27 J s | Guo Q., Nat. Photonics, 2022 | 10.1038/s41566-022-01044-5 | Y(arXiv) |
| Mode-locked laser (III-V + TFLN) | ~4.8 ps, ~10 GHz, >2.6 pJ, >0.5 W peak, ~1065 nm | Guo Q., Science, 2023 | 10.1126/science.adj5438 | Y |
| Quadratic soliton | (title only) | Roy A., Nat. Photonics, 2022 | 10.1038/s41566-021-00942-4 | title |

### 2.6 Squeezing, photon pairs, quantum frequency conversion (QFC)

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| **On-chip TFLN squeezing, highest found** | 4.9 dB measured, >25 THz, all-optical measurement on chip | Nehra R., Science, 2022 | 10.1126/science.abo6213 | Y (coordinator re-read abstract). "11 dB inferred" not in abstract: unverified |
| Single-pass squeezing | 0.56 dB measured; ~2.6 dB inferred on chip; up to 7 THz | Chen P.-K., Opt. Lett., 2022 (not PRL) | 10.1364/OL.447695 | Y |
| OPO squeezing, on-chip SHG pump + homodyne | 0.55 dB squeezing, 1.55 dB anti-squeezing | Park T., Sci. Adv., 2024 | 10.1126/sciadv.adl1814 | Y |
| Comparison, bulk-bonded PPLN ridge (not TFLN) | 8.3 dB CW | Kashiwazaki T., APL, 2023 | 10.1063/5.0144385 | Y |
| Pairs, waveguide | CAR >67,000; heralded g2(0) <0.025 | Zhao J., PRL 124, 163603, 2020 | 10.1103/PhysRevLett.124.163603 | Y |
| Pairs, PPLN microring | 36.3 MHz at 13.4 uW; CAR up to 14,682; g2(0)=0.008 | Ma Z., PRL 125, 263602, 2020 | 10.1103/PhysRevLett.125.263602 | Y |
| QFC telecom to near-visible | 73% internal, 900 cps noise | Wang X., npj Quantum Inf., 2023 | 10.1038/s41534-023-00704-w | Y(arXiv) |
| QFC, hybrid electrically pumped | 57% on-chip QE; 386,000 %/W ring SHG | arXiv 2509.03869, 2025 | arXiv:2509.03869 | Y(preprint) |

### 2.7 EO combs and EO frequency control

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Resonant EO comb | >900 lines at ~10 GHz, wider than L-band; spacing tunable 10 Hz to 100 MHz | Zhang M., Nature 568, 373, 2019 | 10.1038/s41586-019-1008-7 | Y (coordinator re-read abstract). "80 nm" not in abstract |
| Coupled-ring EO comb | 30% efficiency, 132 nm span, 336 fs | Hu Y., Nat. Photonics, 2022 | 10.1038/s41566-022-01059-y | Y(arXiv) |
| Time-lens pulse generator | 520 fs, 30 GHz, 0.54 pJ | Yu M., Nature, 2022 | 10.1038/s41586-022-05345-1 | Y |
| Non-resonant EO comb | 47 lines at 25 GHz | Zhang K., Commun. Phys., 2023 | 10.1038/s42005-023-01137-9 | Y |
| **Widest integrated EO comb found (TFLT, not LN)** | >450 nm (>60 THz), >2000 lines, triply resonant | Zhang J., Nature, 2025 | 10.1038/s41586-024-08354-4 | Y |
| EO frequency shifter | Up to 28 GHz at ~90% on-chip efficiency; cascaded 119.2 GHz from 29.8 GHz drive | Hu Y., Nature 599, 587, 2021 | 10.1038/s41586-021-03999-x | Y (coordinator re-read abstract; arXiv v1 said ~99%) |
| AO frequency shifter | 3 GHz, >30 dB carrier suppression | Shao L., Opt. Express, 2020 | 10.1364/OE.397138 | Y |

### 2.8 Kerr solitons in LN

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| First LN soliton | Self-starting, bidirectional switching via photorefraction | He Y., Optica 6, 1138, 2019 | 10.1364/OPTICA.6.001138 | Y(arXiv) |
| Monolithic Kerr comb + EO | qualitative | Wang C., Nat. Commun., 2019 | 10.1038/s41467-019-08969-6 | Y |
| Near-octave soliton | 4/5 octave; Raman suppressed; 335 GHz rep rate | Gong Z., Optica, 2020 | 10.1364/OPTICA.400994 | Y |
| **Octave-spanning TFLN soliton** | Octave, Raman suppressed, near-unity yield | Song Y., Light Sci. Appl., 2024 | 10.1038/s41377-024-01546-7 | Y |
| Photorefraction-assisted soliton | Single soliton >13 h without feedback | Wan S., Laser Photon. Rev. 18, 2024 | 10.1002/lpor.202300627 | Y |
| n2 of LN | 1.8e-19 m^2/W as tabulated in Zhu 2021 (10.1364/AOP.411024); primary measurement source not traced | | | unverified (primary) |

### 2.9 Microwave-to-optical transduction

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Room-temp AO, suspended TFLN | up to 4.5 GHz; Vpi 0.77 V (racetrack); g0/2pi 1.1 kHz | Shao L., Optica 6, 1498, 2019 | 10.1364/OPTICA.6.001498 | Y(arXiv) |
| Piezo-optomechanical, room temp | Vpi 0.02 V; 5.5% with 323 uW blue-detuned pump | Jiang W., Nat. Commun., 2020 | 10.1038/s41467-020-14863-3 | Y(arXiv) |
| Cavity EO, TFLN | 2.7e-5 | Holzgrafe J., Optica 7, 1714, 2020 | 10.1364/OPTICA.397513 | Y(arXiv) |
| Triply resonant LN on sapphire, mK | 6.6e-6 on chip | McKenna T.P., Optica 7, 1737, 2020 | 10.1364/OPTICA.397235 | Y |
| EO, TFLN + superconducting resonator | 1.02% total (15.2% internal), bidirectional | Xu Y., Nat. Commun., 2021 | 10.1038/s41467-021-24809-y | Y |
| Optically heralded microwave photon addition | 5% CW conversion; 15 Hz heralding; ~35% heralded efficiency (secondary only) | Jiang W., Nat. Phys., 2023 | 10.1038/s41567-023-02129-w | Y(arXiv); 35% unverified |
| Integrated interface (LN-on-Si mechanics) | 0.9% at 1 uW; 14.8 MHz bandwidth; few added photons | Weaver M.J., Nat. Nanotechnol., 2024 | 10.1038/s41565-023-01515-y | Y |
| Optical control of a qubit, TFLN EO | up to 1.18%; optically driven Rabi | Warner H.K., Nat. Phys., 2025 | 10.1038/s41567-025-02812-0 | Y(arXiv) |
| Bulk LN WGM EO (not thin film), comparison | 8.7% at 0.16 added noise photons | Sahu R., Nat. Commun., 2022 | 10.1038/s41467-022-28924-2 | Y |
| Bulk LN, microwave-optical entanglement | CV entanglement | Sahu R., Science, 2023 | 10.1126/science.adg3812 | Y |
| Bulk LN EO, all-optical qubit readout | single-shot readout | Arnold G., Nat. Phys., 2025 | 10.1038/s41567-024-02741-4 | Y |

### 2.10 Acousto-optics, optomechanics, RF acoustics

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| LN optomechanical crystal | g0/2pi ~120 kHz; phonon lasing | Jiang W., Optica 6, 845, 2019 | 10.1364/OPTICA.6.000845 | Y(arXiv) |
| AO modulator, LN on sapphire | first unsuspended devices | Sarabalis C.J., APL Photonics, 2020 | 10.1063/5.0012288 | Y |
| AO, wavelength-scale waveguide | FoM improved by orders of magnitude (no number in abstract) | Sarabalis C.J., Optica, 2021 | 10.1364/OPTICA.413401 | Y (qual.) |
| **AO modulator VpiL, lowest found** | 0.03 V cm, TFLN + chalcogenide, unsuspended | Wan L., Light Sci. Appl., 2022 | 10.1038/s41377-022-00840-6 | Y |
| Phonon-number resolution (LN + qubit) | number splitting ~5x qubit linewidth | Arrangoiz-Arriola P., Nature, 2019 | 10.1038/s41586-019-1386-x | Y |
| Entangled mechanical resonators (LN) | state tomography | Wollack E.A., Nature, 2022 | 10.1038/s41586-022-04500-y | Y |
| XBAR (laterally excited bulk acoustic resonator), first | ~4.8 GHz, 400 nm ZY-LN, coupling ~25%, Q ~300 | Plessky V., Electron. Lett. 55, 98, 2019 | 10.1049/el.2018.7297 | Y |
| Record kt^2, f*Q, POI filter data | not obtained; see review #43 | | | N/A |

### 2.11 Wafer sizes and foundries

| Item | Statement | Source, date | Ver. |
|---|---|---|---|
| NanoLN (Jinan Jingzheng) LNOI and LTOI | 3, 4, 6, 8 inch; film 300-900 nm; Si, LN, quartz, fused silica substrates | nanoln.com/PRODUCTS.html (undated; fetched 2026-10-24) | Y (company page) |
| Soitec POI (piezoelectric-on-insulator) | LT6/LT8 (150/200 mm LT), LN6 (150 mm LN) | soitec.com/en/products/poi (fetched 2026-10-24) | Y (company page) |
| Lightium (Zurich) | "200 mm wafers in a high-volume foundry environment"; PDK at C, O, 780, 830 nm; closed beta | lightium.com (fetched 2026-10-24) | Y (company claim) |
| HyperLight + UMC + Wavetek | Foundry production on 6- and 8-inch | ConvergeDigest on 2026-06-18 Series C; HyperLight headlines 2026-03 | trade press |
| CCRAFT (CSEM spin-off) | Pure-play TFLN foundry, 150 mm, PDK, MPW | optics.org, 2025-05-13 | Y (trade press) |
| Ligentec + X-FAB | TFLN-on-SiN / TFLN-on-SOI at 200 mm; launched ECOC 2026 | X-FAB news 2026-01-19; picmagazine.net | partial |
| QCi (Tempe) | TFLN foundry opened 2025-05-12 | quantumcomputinginc.com press release 2025-05-13 | Y; wafer size N/A |
| Wuhan NOEIC / Peng Cheng Lab | 4-inch TFLN on quartz, DUV stepper; extendable to 6/8 inch (claim) | 10.37188/lam.2025.047 | Y |
| Academic wafer-scale | 4- and 6-inch DUV | Luke 2020, 10.1364/oe.401959 | Y |
| TFLT, academic | 4-inch fused silica | arXiv 2604.14836 | Y(preprint) |
| Not verified | Partow, Shin-Etsu, NGK, Sumitomo Metal Mining, AFR, Fraunhofer wafer statements | | N/A |

### 2.12 Heterogeneous and hybrid integration (lasers, amplifiers, detectors)

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| III-V on TFLN lasers + amps | electrically pumped, EO-tuned | Op de Beeck C., Optica, 2021-10 | 10.1364/OPTICA.438620 | Y (no numbers in abstract) |
| Laser transmitter | up to 60 mW in waveguide; with 50 GHz modulator | Shams-Ansari A., Optica, 2022-04 | 10.1364/OPTICA.448617 | Y |
| Pockels laser | 2.0e18 Hz/s FM speed; 50 MHz switching | Li M., Nat. Commun., 2022-09 | 10.1038/s41467-022-33101-6 | Y |
| Self-injection-locked Si3N4-LN laser | 3 kHz intrinsic linewidth; 12e15 Hz/s tuning; FMCW LiDAR demo | Snigirev V., Nature, 2023-03 | 10.1038/s41586-023-05724-2 | Y |
| Mode-locked laser | see 2.5 | Guo Q., Science, 2023 | 10.1126/science.adj5438 | Y |
| a-Si detector (visible) | 22-37 mA/W, 635-850 nm | Desiatov B., APL, 2019 | 10.1063/1.5118901 | Y |
| InP MUTC (modified uni-traveling-carrier) PD on TFLN | 110 GHz, 0.4 A/W | Wei C., Light Adv. Manuf. 4:30, 2023 | 10.37188/lam.2023.030 | Y |
| **PD bandwidth, highest found** | 140 GHz; 7-ch coherent receiver 3.584 Tb/s aggregate | Xie X., Light Sci. Appl. 14, 172, 2025-04 | 10.1038/s41377-025-01821-1 | Y |
| **Er:TFLN amp, fiber-to-fiber, highest found** | >28 dB net at 1531 nm; NF 5.3 dB; >15 dBm out | Yu, Laser Photon. Rev., 2026-08 | 10.1002/lpor.71753 | Y |
| Er:TFLN amp, internal | 38 dB internal net gain, 9.16 cm | Wang, CLEO 2024 ATu4M.3 | 10.1364/cleo_at.2024.atu4m.3 | Y(conf) |
| Er/Yb TFLN | 27 dB internal | Zhang, Optica Open, 2023 | 10.1364/opticaopen.23309342 | title |
| Hybrid SOA on TFLN, standalone gain | not obtained | | | N/A |

Internal gain and fiber-to-fiber gain are not comparable.

### 2.13 Thin-film lithium tantalate (TFLT)

| Metric | Value | First author, venue, date | DOI | Ver. |
|---|---|---|---|---|
| Platform paper | 5.6 dB/m (DUV stepper); MZM VpiL 1.9 V cm, up to 40 GHz; much lower birefringence than LN; soliton microcombs; LT already in 5G RF filters | Wang C. (Kippenberg, Ou X.), Nature 629, 784, 2024-05 | 10.1038/s41586-024-07369-1 | Y (coordinator re-read abstract) |
| High-speed | 110 GHz; 176 GBd PAM8 >400 Gb/s net | Wang C., Optica, 2024-11 | 10.1364/OPTICA.537730 | Y |
| DC stability vs TFLN | <1 dB (TFLT) vs 5 dB (TFLN) over 46 h at 12.1 dBm; VpiL 3.4 V cm; 0-70 C | Powell K., Opt. Express 32, 44115, 2024-11 | 10.1364/oe.538870 | Y |
| DC stability, visible | <2 dB vs 8 dB drift at 737 nm, 16 min | Powell K., arXiv 2505.00906, 2025 | arXiv:2505.00906 | Y(preprint) |
| Ultralow DC drift switch | stable 2 h, SiO2-clad, no anneal | Wang, Opt. Lett., 2024-09 | 10.1364/ol.531263 | Y |
| Bandwidth + drift | >67 GHz, VpiL 2.4 V cm, <1 dB drift / 60 min | Chen, Opt. Express, 2026-04 | 10.1364/oe.595937 | Y |
| TFLT EO comb | >450 nm, >2000 lines | Zhang J., Nature, 2025 | 10.1038/s41586-024-08354-4 | Y |
| TFLT on fused silica | 64 GHz; Vpi 1.53 V; bias-stable to 10 mHz; 440.6 Gb/s PAM8 | Li Z., arXiv 2604.14836; OFC 2026 W1A.5 | 10.1364/ofc.2026.w1a.5 | Y(preprint/conf) |
| Suspended TFLT | 110 GHz; 460 Gb/s net PAM8 | Li Z., arXiv 2607.17436 | arXiv:2607.17436 | Y(preprint) |
| O-band sub-V | Vpi 1 V; >110 GHz | Xu, OFC 2026 W1A.4 | 10.1364/ofc.2026.w1a.4 | Y(conf) |
| High temperature | DC-bias stable at 120 C | Al Sayem A., arXiv 2604.27285 | arXiv:2604.27285 | Y(preprint) |
| WDM transmitter | 1.6 Tb/s aggregate net | Hulyal, CLEO 2026 STh1F.2 | 10.1364/cleo_si.2026.sth1f.2 | Y(conf) |
| Resonant | PhC nanobeam Q >1e7; Vpi 12.85 mV (resonant, DC) | He, CLEO 2026 SM4K.1 | 10.1364/cleo_si.2026.sm4k.1 | Y(conf) |
| On-chip PPLT SHG | >1 W SH at 775 nm; PPLT coercive field ~4x MgO:LN | Kuznetsov, Li, Kippenberg, arXiv 2512.07968 | arXiv:2512.07968 | Y(preprint) |

### 2.14 Thermo-optic tuning

- Candidate: Ji et al., "High-efficiency thermo-optic phase shifter based on TFLN platform", JLT, 2025-07-15, 10.1109/jlt.2025.3564158. P_pi not in Crossref metadata: N/A. No verified record P_pi.

---

## 3. Physical effects the site should explain

### 3.1 Photorefractive effect

- **Mechanism.** Light excites electrons from deep traps (Fe2+/Fe3+; Nb_Li antisite polarons in undoped LN). Carriers move by the bulk photovoltaic (Glass) current j = kappa alpha I along c plus drift/diffusion, and retrap in dark regions. The space-charge field saturates near E_sc ~ j_pv/(sigma_d + sigma_ph) and changes the index via Pockels: Delta n_e = -1/2 n_e^3 r33 E_sc. MgO above threshold does not reduce the Glass current; it raises photoconductivity ~100x, collapsing E_sc. In TFLN: blue shift with power (opposite to the thermal red shift), strong dependence on cladding/interfaces, much faster response than bulk.

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| Bulk photovoltaic saturation | >1000 V (~1e5 V/cm) | Glass 1974, 10.1063/1.1655453 | Y |
| MgO threshold, congruent | >=4.5 at.% MgO | Bryan 1984, 10.1063/1.94946 | Y |
| MgO mechanism | ~100x higher photoconductivity; Glass current not reduced; activation 0.1 eV vs 0.5 eV | Bryan 1984 | Y |
| MgO threshold, near-stoichiometric (Li/Nb 0.993) | >0.78 mol%: no damage at 532 nm to 2 MW/cm^2 | Furukawa 2000, 10.1063/1.1318721 | Y |
| TFLN ring photorefractive memory (z-cut) | recovery >10 h; orientation dependent | Ren X., npj Nanophotonics 2, 2025, 10.1038/s44310-024-00052-3 | Y(arXiv) |
| Cladding role | removing SiO2 cladding mitigates photorefraction in rings | Xu Y., Opt. Express 29, 5497, 2021, 10.1364/OE.418877 | Y |

- Key papers: Ashkin et al. APL 9, 72 (1966) 10.1063/1.1754607; Glass et al. 1974; Bryan et al. 1984; Furukawa 2000; Jiang H. et al. Opt. Lett. 42, 3267 (2017) 10.1364/OL.42.003267 (fast photorefraction in LN microresonators; venue is Opt. Lett., not Optica); Xu Y. 2021; Ren 2025; book: Volk and Wohlecke, *Lithium Niobate* (Springer) 10.1007/978-3-540-70766-0.
- Explainer: 1D band-transport (Kukhtarev-type) model; sliders for intensity, wavelength, MgO, cladding conductivity; ring sweep showing photorefractive vs thermal shift, hysteresis, self-locking window vs sweep speed.

### 3.2 GRIIRA, BLIIRA, polarons

- **Mechanism.** Green/blue light (or two-photon absorption) creates carriers that self-trap as small polarons: bound polaron on Nb_Li (Nb_Li^4+), free polaron Nb_Nb^4+, bipolaron Nb_Li-Nb_Nb; holes as O^- polarons near Li vacancies. Their broad absorption bands produce green- (GRIIRA) or blue-light-induced infrared absorption (BLIIRA), heating and dephasing SHG/OPO. MgO above threshold removes Nb_Li; the GRIIRA threshold equals the photorefraction threshold.

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| GRIIRA MgO threshold | same as photorefraction threshold; assigned to Nb_Li polaron | Furukawa 2001, 10.1063/1.1359137 | Y |
| MgO:near-stoichiometric LN | no GRIIRA increase at 3.5 kW/cm^2 green | Furukawa ASSL 2000, 10.1364/ASSL.2000.MF8 | Y |
| ps BLIIRA | lowest in KNbO3 and MgO:LN; periodic poling slightly increases it | Hirohashi 2007, 10.1063/1.2434007 | Y |
| Polaron band peaks | ~1.0 eV free, ~1.6 eV bound, ~2.5 eV bipolaron | Schirmer et al. 2009, 10.1088/0953-8984/21/12/123201 | unverified (recalled) |
| TFLN SHG power ceiling | TFLN SH typically tens of mW, rarely >100 mW; attributed to optical damage | Kuznetsov et al., arXiv 2512.07968 | Y(preprint) |

- Key papers: Furukawa 2001; Hirohashi 2007; Schirmer et al. 2009; Imlau et al. Appl. Phys. Rev. 2, 040606 (2015) 10.1063/1.4931396.
- Gap: no TFLN paper quantifying GRIIRA/BLIIRA was found. This is an open question the site can flag.
- Explainer: configuration-coordinate diagram (polaron well, optical vs thermal hopping) plus a rate-equation toy model (green -> polarons -> IR absorption -> heating -> QPM detuning -> SHG rolloff), MgO slider with threshold.

### 3.3 DC / bias drift and EO relaxation in modulators

- **Mechanism.** Under static bias, mobile charge redistributes and screens the field in the LN core. Sources: electronic and protonic conduction in LN; ionic (Li+, H+) conduction in the SiO2 cladding and buried oxide; interface and surface states; trapping near the metal/LN contact; photo-generated carriers; pyroelectric charge. Minimal model: Maxwell-Wagner multilayer RC stack, tau ~ epsilon/sigma per layer; the sign of drift depends on whether the cladding or LN is more conductive (positive vs negative drift). Relaxation also enhances the EO response at kHz, corrupting low-frequency Vpi measurements. Li-ion migration as a dominant TFLN mechanism was not confirmed by a primary source in this pass (unverified).
- Mitigation: thermo-optic biasing; removing or changing cladding; LN-metal interface control plus annealing; Ar+ milling; TFLT; cryogenic operation.

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| Bulk Ti:LN drift | short (seconds, buffer leakage) and long (hours, photorefraction) | Yamada & Minakata, JJAP 20, 733 (1981), 10.1143/JJAP.20.733 | Y |
| TFLN EO response measured | 1 mHz to 1 MHz; relaxation-enhanced band 1-20 kHz | Holzgrafe et al., Opt. Express 32, 3619 (2024), 10.1364/OE.507536 | Y |
| TFLN relaxation slowed | >10^4-fold by LN-metal interface control + anneal | Holzgrafe 2024 | Y |
| RC fit | ~11.9 ms with SiO2 cladding (positive drift) vs ~88.6 us uncladded (negative drift); TFLN relaxation >100x faster than bulk | Li et al., Photonics 13, 339 (2026) | Y (abstract; DOI not recorded) |
| Hysteresis / trap emission | traps near the contact under long bias | Yeh et al. (Loncar), Nano Lett. 26, 13450 (2026-09-22), 10.1021/acs.nanolett.6c03406 | Y |
| Ar+ milled TFLN | no drift 1 h DC; 30 min at 4.5 V; >40 GHz | Shi et al., Opt. Lett. 50, 1703 (2025), 10.1364/OL.549975 | Y |
| TFLT vs TFLN | <1 dB vs 5 dB, 46 h | Powell 2024, 10.1364/oe.538870 | Y |
| Cryogenic LNOI | bias-drift-free 12 h | Lomonte et al., Nat. Commun. 12 (2021), 10.1038/s41467-021-27205-8 | Y |
| Liquid-nitrogen temperature | DC-stable operation | Warner et al., Opt. Lett. 50, 5398 (2025), 10.1364/OL.571632 | Y (qual.) |
| Estimate | epsilon_r ~28 and rho 1e16-1e18 Ohm cm give tau ~7 h to ~1 month; so ms-s TFLN time constants imply conductive interfaces/cladding | coordinator-pass estimate | rho range unverified |

- Key papers: Yamada & Minakata 1981; Gee et al. APL 47, 211 (1985) 10.1063/1.96220; Nagata et al. Appl. Opt. 35, 6828 (1996) 10.1364/AO.35.006828; Nagata et al. IEEE PTL 16, 2460 (2004) 10.1109/LPT.2004.834928; Salvestrini et al. JLT 29, 1522 (2011) 10.1109/JLT.2011.2136322; Holzgrafe 2024; Yeh 2026; Shi 2025; Powell 2024; Puma et al. CLEO 2022 SF2O.1 10.1364/CLEO_SI.2022.SF2O.1 (anomalous sub-MHz response, x-cut).
- Explainer (high value): editable 2-3 layer RC stack (cladding / LN / BOX, each epsilon and sigma); step or square-wave bias; plots of LN field vs time, bias-point drift, and |H(f)| from mHz to MHz; toggles for cladding removal, interface conductance, Arrhenius temperature, heater bias.

### 3.4 Pyroelectric effect

- **Mechanism.** Ps (along c) decreases with T, so p = dPs/dT < 0. Delta T leaves bound charge sigma = p Delta T on +/-c faces; until screened it creates a field that shifts n_e via r33. z-cut films: field is vertical, strong mode overlap. x-cut: charge on sidewalls/edges perpendicular to c. Cryogenic cooldown builds charge; Zhu 2021 notes discharge damage to superconducting nanowires on bulk LN.

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| p at 25 C | -4e-5 C/m^2/K | Savage 1966, 10.1063/1.1703164 | Y |
| p, congruent (interferometric) | ~95 uC/m^2/K magnitude | Popescu et al. 2013, 10.1063/1.4788696 | Y |
| Range across sources | -40 to -95 uC/m^2/K (method, clamping, sample dependent) | Savage; Popescu; Lang 2005 10.1063/1.2062916 | range |
| Ps | 80 +/- 5 uC/cm^2, insensitive to stoichiometry | Gopalan 1998, 10.1063/1.121491 | Y |
| Estimate (unscreened z-cut) | E ~3e5 V/m per K; Delta n_e ~5e-5 per K, comparable to dn_e/dT | coordinator-pass estimate using p = 80 uC/m^2/K, epsilon33 ~28 | estimate |

- Key papers: Savage 1966; Popescu 2013; Jachalke et al. Appl. Phys. Rev. 4, 021303 (2017) 10.1063/1.4983118 (measurement methods); Ren 2025 (pyroelectric memory in z-cut TFLN rings).
- Explainer: temperature-step sim for z-cut vs x-cut (bound charge, field spike, screening decay), overlaid with the pure thermo-optic shift; optional 4 K cooldown with breakdown threshold.

### 3.5 Thermo-optic

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| dn_e/dT | 3.34e-5 /K at 1523 nm, 300 K | Moretti et al., J. Appl. Phys. 98, 036101 (2005), 10.1063/1.1988987, via Zhu 2021 | Y (secondary) |
| dn_o/dT | smaller than dn_e/dT; value not retrieved | | unverified |
| T-dependent Sellmeier | Jundt 1997 (CLN n_e) 10.1364/OL.22.001553; Gayer 2008 (MgO:CLN/SLN) 10.1007/s00340-008-2998-2; Schlarb & Betzler 1993 (composition + T) 10.1103/PhysRevB.48.15613; Zelmon 1997 10.1364/JOSAB.14.003319 | | Y (DOIs) |

- Thermal bistability: Carmon, Yang, Vahala, Opt. Express 12, 4742 (2004) 10.1364/OPEX.12.004742; photorefractive/thermal competition and oscillation in LN rings: Sun X. et al., Opt. Express 25, 13504 (2017) 10.1364/OE.25.013504; anisotropic TFLN thermo-optic model: Shim et al., arXiv 2601.00174.
- Explainer: live Sellmeier(lambda, T, composition) calculator (n_o, n_e, dn/dT, birefringence, QPM period vs T); ring thermal-triangle simulator (coupled-mode + thermal ODE + optional photorefractive term).

### 3.6 Non-stoichiometry, Li vacancies, Li out-diffusion

- **Mechanism.** Congruent LN is Li-poor. Excess Nb is compensated per the Li-site vacancy model (Nb_Li^4+ + 4 V_Li^-; Lerner 1968, supported by Iyi 1992) or the Nb-site vacancy model (Abrahams & Marsh 1986). Nb_Li drives photorefraction and GRIIRA (polaron sites), the internal field and high coercive field (defect complexes), and shifts Curie and phase-matching temperatures. Near-stoichiometric LN via vapor transport equilibration (VTE; Bordui 1992) or double-crucible Czochralski (Kitamura 1992). High-temperature processing out-diffuses Li2O (Carruthers 1974 used out-diffused layers as waveguides). In LNOI, implant damage is annealed out; anneals reduce material loss; Li out-diffusion during anneals is one hypothesis for higher thin-film coercive fields (Zhu 2021).

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| Congruent composition | Li2O fraction 0.484 | Gopalan 1998, 10.1063/1.121491 | Y (other sources: 48.35-48.6 mol%, unverified) |
| Near-stoichiometric | 0.498 | Gopalan 1998 | Y |
| Switching field ratio CLN / near-SLN | 4-5x | Gopalan 1998 | Y |
| Internal field, CLN | ~2.5 kV/mm; vanishes in SLN | Gopalan 1998 | Y |
| Coercive field CLN ~21 kV/mm, SLN ~4-5 kV/mm | widely quoted | Myers et al. 1995, 10.1364/JOSAB.12.002102 | absolute values unverified |
| Curie temperature | ~1210 C | Zhu 2021 | Y (secondary) |
| Annealed TFLN material Q | ~1.6e8 (0.2 dB/m) | Shams-Ansari 2022, 10.1063/5.0095146 | Y |

- Key papers: Lerner et al. J. Cryst. Growth 3-4, 231 (1968) 10.1016/0022-0248(68)90139-5; Abrahams & Marsh, Acta Cryst. B 42, 61 (1986) 10.1107/S0108768186098567; Iyi et al. J. Solid State Chem. 101, 340 (1992) 10.1016/0022-4596(92)90189-3; Bordui et al. J. Appl. Phys. 71, 875 (1992) 10.1063/1.351308; Kitamura et al. J. Cryst. Growth 116, 327 (1992) 10.1016/0022-0248(92)90640-5; Carruthers et al. Appl. Opt. 13, 2333 (1974) 10.1364/AO.13.002333; Schmidt & Kaminow APL 25, 458 (1974) 10.1063/1.1655547 (Ti indiffusion); ion slicing: Levy et al. APL 73, 2293 (1998) 10.1063/1.121801; Rabiei & Gunter APL 85, 4603 (2004) 10.1063/1.1819527.
- Not verified: Li2O out-diffusion coefficients for LNOI anneal conditions; He+ implant dose/energy.
- Explainer: 3D crystal viewer (cation stacking Li, Nb, vacancy along c); composition slider 48.4-50 mol% Li2O showing defect counts under each compensation model and trends in coercive field, internal field, phase-matching T; Li2O out-diffusion depth vs anneal (needs a sourced diffusion coefficient first).

### 3.7 Domain inversion and poling in thin films

- **Mechanism.** 180 deg switching by nucleation at electrode edges, forward growth along c, sideways wall motion (pinning/depinning; hexagonal domains). x-cut TFLN uses coplanar electrodes with an in-plane field that is non-uniform in depth: incomplete depth, lateral merging at sub-um periods, back-switching, leakage through film/BOX. Fixes: shaped pulses, bipolar preconditioning, poling before vs after etching with in-situ SHG monitoring. z-cut TFLN: vertical poling through the stack, AFM-tip poling, or pole bulk before bonding. Miller's rule scales d coefficients across wavelengths.

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| x-cut TFLN shortest period | 600 nm; features <200 nm | Zhao J. et al., J. Appl. Phys. 127, 193104 (2020), 10.1063/1.5143266 | Y |
| x-cut MgO:TFLN, bipolar preconditioning | 747 nm period | Nagy & Reano, OME 10, 1911 (2020), 10.1364/OME.394724 | Y |
| Wafer-scale continuous poling | 70 mm at 3 um period, ~50% duty | Bollmers et al., arXiv 2509.22342 (2025) | Y(preprint) |
| AFM-tip z-cut poling | ~100 nm features | Zhu 2021 | Y (secondary) |

- Key papers: Miller APL 5, 17 (1964) 10.1063/1.1754022; Yamada M. et al. APL 62, 435 (1993) 10.1063/1.108925; Myers 1995; Gopalan 1998, 1999 (10.1063/1.125055); Shur J. Mater. Sci. 41, 199 (2006) 10.1007/s10853-005-6065-7; Chang et al. Optica 3, 531 (2016) 10.1364/OPTICA.3.000531; Wang C. 2018; Nagy & Reano 2019 10.1364/OME.9.003146; Rusing et al. J. Appl. Phys. 126, 114105 (2019) 10.1063/1.5113727; Rao 2019; Chen P.-K. 2024.
- Explainer (high value): 2D electrostatics of x-cut coplanar electrodes over LN/SiO2/Si (field vs depth); threshold-plus-growth domain model (nucleation probability vs E, wall velocity v(E - E_c)); output duty-cycle map and QPM penalty d_eff = (2/pi) d33 sin(pi D) times depth overlap.

### 3.8 Three-wave mixing, Kerr, cascaded chi(2), EO frequency shifting, acousto-optics: reference numbers

| Quantity | Value | Source | Ver. |
|---|---|---|---|
| n_o, n_e at 1550 nm | 2.21, 2.13 | Zhu 2021 | Y (secondary) |
| d33, d31, d22 (1064 nm) | -27.0, -4.3, 2.10 pm/V | Zhu 2021 Table 1 | Y (secondary) |
| d33 on Shoji absolute scale | ~25 pm/V | Shoji et al. JOSA B 14, 2268 (1997), 10.1364/JOSAB.14.002268 | unverified |
| r33, r13, r22, r51 | 30.9, 9.6, 6.8, 32.6 pm/V | Zhu 2021 Table 1 (column attribution from text extraction) | partial |
| r33 30.8, r13 8.6 pm/V (clamped, 633 nm) | commonly attributed | Weis & Gaylord, Appl. Phys. A 37, 191 (1985), 10.1007/BF00614817 | unverified |
| n2 | 1.8e-19 m^2/W | Zhu 2021; usual primary reference DeSalvo et al. IEEE JQE 32, 1324 (1996) 10.1109/3.511545 (value not retrieved) | unverified (primary) |
| Cascaded chi(2) effective n2 | proportional to -d_eff^2/Delta k; sign and size set by phase mismatch | DeSalvo et al. Opt. Lett. 17, 28 (1992) 10.1364/OL.17.000028; pJ-level cascaded broadening in nanophotonic PPLN: Jankowski 2020, 10.1364/OPTICA.7.000040 | Y (principle) |
| Piezoelectric | d15 74, d22 21, d33 16, d31 -1.0 pC/N | Zhu 2021 | Y (secondary) |
| Photoelastic | p13 0.133, p44 0.146 | Zhu 2021 | Y (secondary) |
| AO figure of merit M2 | ~7e-15 s^3/kg | Uchida & Niizeki, Proc. IEEE 61, 1073 (1973), 10.1109/PROC.1973.9212 | unverified |
| XBAR coupling | ~25% (400 nm ZY-LN) | Plessky 2019 | Y |
| EO frequency shifter | coupled-ring photonic molecule, microwave at mode splitting; 28 GHz at ~90% | Hu 2021, 10.1038/s41586-021-03999-x | Y |

- Explainers: index-ellipsoid / Pockels widget (field direction vs cut -> Delta n, VpiL); QPM/SHG calculator (period, T, d_eff, sinc^2, cascaded-chi(2) toggle); coupled-ring frequency shifter (supermodes, microwave drive, sideband transfer); SAW/IDT on TFLN with AO overlap.

---

## 4. Applications map

| Area | LN role | Maturity (dated evidence) | Representative refs |
|---|---|---|---|
| IM/DD datacom (200G/400G per lane; 1.6T/3.2T pluggables) | TFLN MZMs, 100-145 GHz class | Prototype/sampling: AFR 400G/lane demo 2025-03-27 (optics.org); Murata TFLN modulator at OFC 2026 (official, 2026-03-10); HyperLight 400G/lane and 1.6T-DR8 reference (2026-03, headlines) | 10.1038/s41586-018-0551-y; 10.1038/s41566-019-0378-6 (He 2019, Si/LN hybrid); 10.1364/OPTICA.415762 |
| Co-packaged optics (CPO) | TFLN transmitters near switch ASICs | Vendor intent only (Murata 2026-03-10, AFR 2025-03-27); no deployment found | none verified |
| Coherent | Bulk Ti/APE LN DP-IQ (legacy, decades); TFLN high-bandwidth coherent driver modulators (HB-CDM) | Bulk: commercial (Exail catalog to 40 GHz). TFLN HB-CDM: Furukawa FITEL (ex-Fujitsu Optical Components) lists TF-LN HB-CDM; AFR "volume shipment" claim (secondary) | 10.1038/s41467-020-17806-0 (Xu 2020); 10.1364/OPTICA.449691 |
| Microwave photonics | Linear wideband EO; on-chip RF processing | Research (TFLN); bulk analog-link modulators commercial | 10.1038/s41586-024-07078-9 (Feng 2024, MWP processing engine); 10.1038/s41566-024-01608-7 (Zhu 2025, mmWave radar) |
| Quantum: squeezing, photon sources | PPLN nanowaveguide OPA/SPDC | Research | 10.1126/science.abo6213; 10.1364/OPTICA.442332; 10.1364/OPTICA.6.001244 |
| Quantum: photonic QC hardware | Low-loss fast EO switches | Early commercial: Xanadu Aurora used HyperLight TFLN (Nature 2025, 10.1038/s41586-024-08406-9) | as cited |
| Quantum: transducers | Cavity EO, piezo-optomechanics | Research | see 2.9 |
| Quantum: memories, emitters | Rare-earth-doped TFLN | Research | 10.1021/acs.nanolett.9b04679 (Dutta 2020); 10.1021/acsphotonics.2c01835 (Dutta 2023) |
| LiDAR / beam steering | Fast EO-tuned lasers for FMCW; TFLN optical phased arrays | Research | 10.1038/s41586-023-05724-2; 10.1002/lpor.202400224; 10.1364/OL.491748 (Yue 2023, 2D OPA) |
| Optical computing | High-speed EO encoding/weights | Research + early commercial: Q.ANT TFLN processor "shipping to selected partners" (2025-07-17 release) | 10.1038/s41467-024-53261-x (Lin 2024, 120 GOPS); 10.1038/s41467-025-62635-8 |
| Sensing: E-field | EO field sensors | Bulk commercial (vendors unverified); TFLN research | 10.1109/JPHOT.2023.3301446 |
| Sensing: gyroscopes | IFOG multifunction integrated optical chip (MIOC) | Bulk LN MIOC commercial (vendor unverified); TFLN research | 10.1364/OE.567986 (Li 2025) |
| Visible / AR | Transparent from ~350 nm; low-loss visible TFLN | Research; TFLN AR or RGB projection: no primary source found | 10.1364/OPTICA.6.000380; 10.1021/acsphotonics.6c00668 |
| Frequency combs / metrology | EO, Kerr, visible-UV combs | Research | 10.1038/s41586-019-1008-7; 10.1038/s41566-022-01059-y; 10.1038/s41566-023-01364-0 (Wu 2024, vis-UV) |
| RF acoustic filters | LT/LN SAW; POI substrates; LN-platelet XBAR | Commercial, high volume. Soitec POI LT6/LT8/LN6 (official). Murata XBAR (5150-7125 MHz) mass production 2025-07-08 (official; release says "piezoelectric single-crystal thin film", LN not named) | 10.1049/el.2018.7297 |
| Isolators / circulators | EO or AO time-modulated nonreciprocity | Research | 10.1038/s41566-023-01227-8; 10.1038/s41566-021-00884-x; 10.1038/s41566-026-02008-9 |
| Spectrometers | EO-reconfigurable snapshot spectroscopy | Research | 10.1038/s41586-025-09591-x (Yao 2025) |
| Ultrafast sources | Mode-locked lasers, EO time lenses | Research | 10.1126/science.adj5438; 10.1038/s41586-022-05345-1 |
| THz | EO/chi(2) THz generation, detection | Research | 10.1038/s41467-022-35517-6; 10.1038/s41467-025-65293-y |
| Bulk PPLN products | SHG/OPO/DFG wavelength conversion, green lasers | Commercial (Covesion directory; others unverified) | 10.1364/OPTICA.5.001438 (nanophotonic successor) |
| Spatial light modulators | LN-on-Si SLM | Research | 10.1364/OPTICA.573232 |

---

## 5. Key academic groups (representative paper Crossref-verified)

| PI | Institution | Signature TFLN topics | Rep. DOI |
|---|---|---|---|
| Marko Loncar | Harvard | EO modulators, combs, frequency shifters, transducers | 10.1038/s41586-018-0551-y |
| Amir Safavi-Naeini | Stanford | Piezo-optomechanics, LN-on-sapphire, OPO/squeezing | 10.1038/s41567-023-02129-w |
| Martin Fejer | Stanford | Nanophotonic PPLN, ultrabroadband chi(2) | 10.1364/OPTICA.7.000040 |
| Jonathan Fan | Stanford | Adapted poling, high-efficiency SHG (affiliation from coordinator knowledge, unverified) | 10.1038/s41565-023-01525-w |
| Alireza Marandi | Caltech | OPA, squeezing, mode-locked lasers | 10.1126/science.adj5438 |
| Hong Tang | Yale | PPLN rings, OPO, transduction | 10.1364/OPTICA.6.001455 |
| Qiang Lin | Rochester | chi(2)/chi(3) microcombs, Pockels lasers | 10.1364/OPTICA.6.001138 |
| Cheng Wang | CityU Hong Kong | Microwave photonics, radar, THz | 10.1038/s41586-024-07078-9 |
| Xinlun Cai | Sun Yat-sen U | Si/LN hybrid, coherent modulators | 10.1038/s41566-019-0378-6 |
| Ya Cheng | ECNU / SIOM | PLACE / CMP fabrication, Er:TFLN | 10.1038/srep08072 |
| Xin Ou | SIMIT | Ion-sliced LNOI/LTOI wafers | 10.1038/s41586-024-07369-1 (co-author) |
| Tobias Kippenberg | EPFL | LN-on-SiN, fast tunable lasers, TFLT | 10.1038/s41586-023-05724-2 |
| Sasan Fathpour | UCF CREOL | Early TFLN modulators, nonlinear | 10.1364/OL.41.005700 |
| Wolfram Pernice | Muenster / Heidelberg | Superconducting detectors on LN | 10.1038/s41467-021-27205-8 (co-author) |
| Thomas Pertsch / Frank Setzpfandt | Jena | Poling, LNOI quantum, meta-optics | 10.1002/adom.202100789 |
| Rachel Grange | ETH Zurich | LN etching, nonlinear metasurfaces | 10.1515/nanoph-2022-0676 |
| Arnan Mitchell / Andreas Boes | RMIT / Adelaide | Platform reviews, domain engineering | 10.1126/science.abj4396 |
| David Plant | McGill | TFLN transmission systems | 10.1038/s41566-026-02008-9 |
| Simon Groblacher | TU Delft | Si-on-LN optomechanics, integrated transducers | 10.1021/acs.nanolett.0c03980 |
| Yuping Huang | Stevens (also QCi) | QPM rings, QFC | 10.1364/OPTICA.6.001244 |
| Jingjun Xu / Yongfa Kong | Nankai | Crystal growth, doping, TFLN lasers/amps | 10.1117/1.AP.5.3.034002 |
| Liu Liu | Zhejiang U (affiliation unverified) | Modulators, couplers | 10.3788/COL202523.051301 |
| John Bowers | UCSB | Heterogeneous III-V on TFLN | 10.1364/OL.516486 |
| Paul Juodawlkis | MIT Lincoln Lab | Wafer-scale TFLN-on-SiN | 10.1364/OE.486944 |
| Ali Adibi | Georgia Tech | SiN-on-LN hybrids | 10.1364/OE.517840 |
| Xianfeng Chen | SJTU | PPLN, photonic crystals | 10.3788/COL202422.033602 |
| Shining Zhu / Zhenda Xie | Nanjing U | Microcombs, PPLN | 10.3788/COL202422.051301 |
| Dennis Prather | U Delaware | SiN/LN hybrid modulators | 10.1364/OL.381892 |
| Dirk Englund | MIT | PhC IQ modulators, SLMs | 10.1021/acsphotonics.4c01138 |
| Edo Waks | U Maryland | Rare-earth TFLN, quantum memory | 10.1021/acs.nanolett.9b04679 |
| Scott Diddams | CU Boulder | Visible-UV combs in TFLN | 10.1038/s41566-023-01364-0 |
| Ileana-Cristina Benea-Chelmus | EPFL | THz on TFLN | 10.1038/s41467-022-35517-6 |
| Gaurav Bahl | UIUC | AO/EO nonreciprocity | 10.1038/s41566-021-00884-x |
| Songbin Gong | UIUC | TFLN RF acoustics, XBAR-class resonators (no single paper verified this pass) | see review #43 |
| Lu Fang | Tsinghua | Snapshot spectroscopy | 10.1038/s41586-025-09591-x |
| Yang Li | Tsinghua | TFLN optical phased arrays | 10.1364/OL.491748 |
| Lukas Chrostowski (with Cai) | UBC | Photonic tensor core | 10.1038/s41467-024-53261-x |
| Andrey Sukhorukov | ANU | LN metasurface photon pairs | 10.1126/sciadv.abq4240 |
| Sergey Bozhevolnyi | SDU | Plasmonic monolithic LN | 10.1038/s41467-020-14539-y |
| Qiushi Guo | CUNY ASRC | On-chip mode-locked lasers | 10.1364/OPTICA.584937 |
| Mengjie Yu | (Ren 2025 corresponding group; affiliation not checked) | Photorefraction, EO time lens | 10.1038/s44310-024-00052-3 |

Seeds not confirmed with a TFLN paper in this pass (excluded, not judged inactive): Christian Koos, Mo Li, Lin Chang, Wenjie Wan, Kartik Srinivasan, Kerry Vahala.

## 6. Companies

| Company | Role | Dated evidence |
|---|---|---|
| HyperLight (Cambridge, MA) | TFLN Chiplet PICs, modulators | $37M Series B 2024-09-24 (Lightwave); $80M Series C led by MediaTek 2026-06-18 (ConvergeDigest; Business Wire 403); UMC + Wavetek 6-/8-inch manufacturing; supplied Xanadu Aurora |
| Lightium (Zurich) | TFLN foundry, 200 mm (claim) | ~$7M seed 2024-09-19 (tech.eu); InnoSuisse grant CHF 2.67M 2024-05-16 (Lightwave) |
| CCRAFT (Neuchatel; CSEM spin-off) | Pure-play TFLN foundry, 150 mm | Launched 2025-05-13 (optics.org); CHF 6.3M round ~2026-07 (trade press) |
| Furukawa FITEL Optical Components (ex-Fujitsu Optical Components) | Bulk LN DP-IQ, TF-LN HB-CDM | Acquisition closed and renamed 2025-04-01 (furukawaelectric.com release PDF) |
| Murata | TFLN modulator; XBAR and SAW filters | TFLN modulator OFC 2026 (official 2026-03-10); XBAR mass production 2025-07-08 (official); Resonant merger agreement 2022-02-15 (close not verified) |
| Advanced Fiber Resources (AFR, Zhuhai) | TFLN modulators, CDMs | 400G/lane demo 2025-03-27 (optics.org); volume-shipment claim secondary |
| Liobate Technologies (Nanjing) | TFLN chips, 6-inch line | Founded 2020-07 (Dealroom); POET co-development 2022-02-24 (POET news); later rounds unverified |
| OneTouch Technology | Heterogeneous TFLN-on-Si | OFC 2026 exhibitor news (secondary) |
| Q.ANT (Stuttgart) | TFLN photonic processors | EUR 62M Series A 2025-07-17 (release) |
| QCi (Quantum Computing Inc) | TFLN foundry, Tempe | Opened 2025-05-12 (official) |
| Xanadu | TFLN user (quantum) | Joint release with HyperLight 2025-07-30 |
| Ligentec + X-FAB | TFLN-on-SiN / -SOI, 200 mm | 2026-01-19 (X-FAB news) |
| Exail (ex-iXblue) | Bulk LN modulators to 40 GHz | exail.com product page |
| NanoLN (Jinan Jingzheng Electronics) | LNOI/LTOI wafers 3-8 inch | nanoln.com |
| Soitec | POI substrates (LT6/LT8/LN6) | soitec.com |
| Partow Technologies | Ion-sliced LN wafers, bonding | directory listings only |
| Covesion | Bulk PPLN | directory listing |
| Sumitomo Osaka Cement | LN modulators | TFLN product status unverified |
| Not verified this pass | Lumentum, Coherent (no TFLN announcement found: do not list as TFLN makers), Thorlabs, AdvR, Srico, EOSPACE, NTT Electronics, HC Photonics, Shin-Etsu, Sumitomo Metal Mining, NGK, Qorvo, Skyworks, Ori-Chip | |
| Excluded | Lightwave Logic (EO polymer, not LN) | |

---

## 7. Open items and uncertainties (to resolve before publishing)

1. 2024-2026 coverage is incomplete (search budgets exhausted). Re-check before labelling anything "record": measured EO bandwidth >170 GHz; TFLN squeezing >4.9 dB; OPO threshold <19.6 uW; sub-photon-noise TFLN transducers; Er:TFLN gain; RF acoustic kt^2 / f*Q.
2. Wang 2018 Nature "Vpi 1.4 V" and "100 GHz" are main-text figures, not in the abstract.
3. Nehra 2022 "11 dB inferred", Chen J.-Y. 2019 "230,000 %/W", Zhang M. 2019 "80 nm span", Jiang 2023 "~35% heralded efficiency": not confirmed from abstracts.
4. Preprint vs published differences: Stokowski 2024 (200 vs 1000 modes), Hu 2021 (90% vs 99%), Chen P.-K. OL 2022 (2.6 vs 3 dB). Several values are arXiv-only (Lu 2021, Hu 2022, Guo 2022, Warner 2025, Hwang 2026).
5. Material constants needing primary sources: n2, dn_o/dT, Shoji d33, Weis & Gaylord r coefficients, absolute coercive fields, dark conductivity of LN and SiO2 cladding, pyroelectric coefficient (sources span -40 to -95 uC/m^2/K), polaron band energies, AO M2. Coordinate with R06 (material properties).
6. Li-ion migration as a dominant TFLN DC-drift mechanism is not established by a primary source found here; the 2024-2026 literature (Holzgrafe 2024, Yeh 2026, Li 2026) points to interface, cladding conductivity, and contact traps.
7. No TFLN-specific GRIIRA/BLIIRA quantification found.
8. Industry claims (HyperLight 400G/lane, 1.6T, UMC; Ciena 3.2T; AFR volume shipment; Lightium 200 mm) rest on headlines or trade press.
9. Several venues/DOIs suggested in the brief were wrong and are corrected here: Jiang H. 2017 is Opt. Lett.; Xu Y. 2021 is Opt. Express; Chen P.-K. 2022 squeezing is Opt. Lett., not PRL; femtojoule switching is Guo, Nat. Photonics 2022 (not Roy, Science 2023); Holzgrafe 2024 is 10.1364/OE.507536; Gopalan 1998 is 10.1063/1.121491; Nagy & Reano 2020 is 10.1364/OME.394724.
10. Distinguish platform labels on the site: TFLN vs bulk LN vs LN on sapphire vs TFLT vs bulk-bonded PPLN ridge (e.g. Zhang J. 2025 comb is TFLT; Sahu, Arnold, Kashiwazaki are bulk or bulk-bonded).

---

## 8. Website implications (ranked: where interactivity, 3D, or simulation adds most over a PDF)

1. **Living, machine-readable records database** (loss, Q, VpiL, bandwidth, baud, SHG %/W/cm^2, OPA gain, OPO threshold, squeezing, transduction efficiency, gain), every row with DOI, date, platform label, conditions, verification flag; sortable, plottable vs year, exportable as JSON/CSV. Every review above freezes its tables at publication; this is the single biggest gap and also serves the AI-endpoint requirement.
2. **DC drift / EO relaxation simulator** (multilayer Maxwell-Wagner RC stack, bias step, |H(f)| from mHz to MHz, cladding/interface/temperature toggles, TFLN vs TFLT). No review covers it; it is the top practical pain point for deployment and has fresh 2024-2026 primary literature.
3. **Modulator designer**: cross-section mode + electrode field overlap (x-cut/z-cut, etched vs etchless, T-electrodes), microwave index/impedance/loss, VpiL-bandwidth trade-off with real data points overlaid. Reviews #3, #12, #21, #26, #38 all lack it.
4. **QPM / poling explorer**: Sellmeier(lambda, T, composition) -> poling period; x-cut electrode electrostatics vs depth; domain growth with incomplete depth/merging; d_eff penalty; 3D domain visualization. Directly matches reviews #9, #40, #42 gaps.
5. **Photorefractive + thermal + pyroelectric ring sweep**: coupled-mode + thermal ODE + space-charge term; shows triangular bistability, blue-shift, self-locking, soliton access windows, z-cut temperature-step charge. Uniquely LN, visually compelling, explains a frequent lab surprise.
6. **Dispersion engineering + nonlinear pulse propagation** (GVM/GVD vs film thickness/etch depth/width; SHG/OPA gain bandwidth; LLE soliton spectra; EO comb span vs dispersion). Matches gaps in #4, #19, #30.
7. **3D crystal structure and defect viewer**: 3m unit cell, Li/Nb/vacancy stacking, Nb_Li antisite and Li-vacancy compensation models, polarons, index ellipsoid and Pockels deformation with a field vector; crystal-cut rotation tool (x/y/z-cut, tensor projection). Matches #5, #31.
8. **Fabrication process in 3D**: ion slicing (He+ implant depth, bonding, splitting, CMP), dry etch with sidewall angle, PLACE, heterogeneous III-V bonding; tied to the loss/Q-vs-method data. Matches #7, #13, #37.
9. **Quantum calculators**: squeezing vs loss (measured vs inferred), JSA/purity for PPLN waveguides, transducer efficiency/added noise vs cooperativity with real device points. Matches #14, #18, #39.
10. **Spectral map of LN** (UV-THz: transparency, chi(2), EO, acoustic bands, applications), linking to every section; good landing-page anchor for lay visitors. Matches #23.
11. **Coupled-ring EO frequency shifter / photonic molecule** widget (supermodes, microwave drive, sideband transfer) and **SAW/IDT acousto-optic** widget with a 3D acoustic mode view (relevant to the author's optomechanics background; matches #25, #43).
12. **Applications and ecosystem map** (application x maturity x company/group, dated evidence), refreshed over time; lower simulation value but high navigation value.
