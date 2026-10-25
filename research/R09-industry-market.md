# R09: LN industry, market, and supply chain (public sources)

| Field | Value |
|---|---|
| Track | R09 |
| As of | 2026-10-24 |
| Scope | LiNbO3 (LN) value chain, market sizes, 2023-2026 events, lay "LN in your life" items |
| Method | Web search + direct fetch of company, government, trade-press pages (English, Chinese, Japanese). No paywalled content read. |
| Access date | All URLs accessed 2026-10-24 unless stated otherwise. |
| Limits | Shared web-search budget ran out mid-track. Items marked "not verified" could not be checked further this session (see Section 9). |

## 0. Evidence grades

Every row carries a source ID `[Sn]` (Section 10) and a grade.

| Grade | Meaning |
|---|---|
| F | Fact from a primary source that was opened and read: government data, company filing, company press release or product page, investor-relations record |
| V | Vendor claim: a company statement about its own performance, capacity, or roadmap. Read, but nobody has checked it |
| T | Trade press, opened and read (optics.org, Lightwave, eeNews, Laser Focus World, Shanghai Securities News, etc.) |
| C | Seen only as a search snippet or aggregator listing. The page could not be opened (403/404/redirect) or was not opened |
| LG | Low-grade: paywalled market-report teaser, investor forum, or AI-assisted finance article. Shows direction only, never a number to headline |
| E | My own estimate or calculation. Assumptions are stated |
| S | Speculation, labelled as such |

---

## 1. Value chain map

```
Pyrochlore ore (Brazil ~93% of mined Nb)      Brine / spodumene (Australia, Chile, China, Argentina...)
        |                                                   |
   Nb2O5 (high purity)                               Li2CO3 (high purity)
        \__________________ melt (congruent, MgO-doped, near-stoichiometric) ______/
                                     |
                 Czochralski boule growth -> poling -> slicing -> lapping/polishing
                                     |
         Bulk wafers 3"/4"/6"/8" (128 deg Y LN for SAW; X/Z-cut optical grade; LT for SAW)
          |                       |                                   |
   SAW/RF filters        Ion-slice + bond (Smart Cut / CIS)      Bulk Ti:LN / APE waveguides,
   (LT dominant, LN      -> LNOI / LTOI / POI wafers             PPLN (periodic poling)
   for wideband/XBAR)              |                                   |
                         TFLN foundries / fabs                 Legacy modulators, FOG IOCs,
                         (150 mm -> 200 mm)                    frequency converters
                                   |
                 TFLN modulator chips -> coherent CDM / IMDD 1.6T-3.2T modules -> data centers
                 + quantum, photonic computing, microwave photonics, LiDAR
```

### 1.1 Raw materials

| Item | Data (latest) | Grade | Src |
|---|---|---|---|
| World Nb mine production | 112,000 t Nb content, 2024 and 2025e | F | S1 |
| Brazil Nb | 104,000 t, about 93% of world. Canada 6,000 t (5%), Congo (Kinshasa) 970 t, Russia 300 t, Rwanda 200 t, China 40 t (2025e) | F | S1 |
| Nb reserves | Brazil 14 Mt, China 6.5 Mt, Canada 0.64 Mt, world >21 Mt | F | S1 |
| Brazil ferroniobium exports 2024 | 92,000 t. Destinations: China 49%, Netherlands 17%, Singapore 9%, Korea 8%, US 8% | F | S1 |
| US Nb oxide import sources (2021-24) | Brazil 89%, Estonia 4%, Thailand 4% | F | S1 |
| Nb end use (US) | Steels about 77%, superalloys about 23%. The USGS summary does not list LN/LT electronics separately: N/A | F | S1 |
| Nb2O5 Nb content | 69.904 wt% Nb | F | S1 |
| CBMM (Companhia Brasileira de Metalurgia e Mineracao) share | Secondary sources say about 77% of the global ferroniobium market. Not in USGS. Not verified against CBMM filings | C | S72 |
| World Li production | 290,000 t Li content in 2025 (excl. US), up 31% from 222,000 t in 2024 | F | S2 |
| Li by country, 2025e | Australia 92,000 t, China 62,000, Chile 56,000, Zimbabwe 28,000, Argentina 23,000, Brazil 12,000, Mali 9,400 | F | S2 |
| Li end use (global) | Batteries 88%, ceramics/glass 4%, greases 2%, other 3%. LN/LT not broken out: N/A | F | S2 |
| Li2CO3 price | US contract average US$9,000/t in 2025 (down 31% from 2024). China spot about US$9,300 to 10,300/t (Jan to Nov 2025) | F | S2 |
| China Nb2O5 import dependence | ">90% imported, mainly from a Brazilian mining major". Unsourced in the article | LG | S9 |

How much niobium LN actually uses (E):
- LiNbO3 is 62.8 wt% Nb (from molar masses).
- A 6" x 0.5 mm wafer (density 4.64 g/cm3, flat edges ignored) is about 41 g of LN, which holds about 26 g of Nb. An 8" x 0.5 mm wafer holds about 46 g of Nb.
- Even 2.1 million 6"-equivalent wafers a year (the size of TDG Holding's 2029 plan, Section 1.2) would need about 54 t of Nb. That is about 0.05% of world mine output, before boule and kerf losses (assume about 2-5x), so still well under 1%.
- Conclusion (E): Nb mining does not constrain LN. Constraints, if any, sit in high-purity Nb2O5 refining, crystal growth, and LNOI bonding.

### 1.2 Bulk crystal growth and wafers

| Company | Country | What is verified | Grade | Src |
|---|---|---|---|---|
| Sumitomo Metal Mining Co., Ltd. (Crystal Materials Business Unit) | JP | LT and LN single crystals grown by Czochralski. 4" and 6" wafers. LN 128 deg rotated Y (350 um at 4", 500 um at 6"), LT 36-50 deg rotated Y. Main use: SAW filters and duplexers in smartphones. Claims "top-level flatness in the industry" | F/V | S3 |
| Sumitomo Metal Mining: 2014 expansion | JP | About JPY 3.5 bn LT/LN substrate expansion for smartphone SAW filters, Dec 2014 to Sep 2016, made at subsidiary Sumiko Kunitomi Denshi. The disclosure PDF returned 403, so only the snippet was read | C | S73 |
| Shin-Etsu Chemical Co., Ltd. | JP | LT oxide single crystals (Cz), 4" and 6" crystals and wafers, for SAW devices (mobile, automotive, TV tuners). LN is not listed on its product page | F | S4 |
| TDG Holding Co., Ltd. (Tiantong, SSE 600330) | CN | IR record dated 2026-06-03: claims 8-inch LN in mass production ("fills a domestic gap"). Plan from a 2025-12-30 filing: by 2029-12, 1.68 M piezoelectric wafers plus 0.42 M heterogeneous (bonded) wafers, 2.10 M in total. Bonding line built with partner Qinghe Jingyuan. Says LN modulators are expected to become mainstream for 3.2T and above "per industry research". States the company does not make optical modules | F (statements) / V (roadmap) | S5 |
| TDG Holding (secondary claims) | CN | 12-inch optical-grade LN wafer "prepared". Crystal capacity 1.3-1.4 M wafers/yr. Long-term supply agreement with Zhongji Innolight (about 300k wafers/yr). All unsourced | LG | S9 |
| Nanzhi Xincai Technology Co., Ltd. (Suzhou) | CN | Founded 2021-12 on a Nanjing University team. LN/LT crystal materials for acoustic filters, optical communications, AR waveguides. Pre-A round over CNY 100 M. Phase-1 line "near full load" | T/V | S8 |
| Crystal Technology, Inc. (Palo Alto; EPCOS subsidiary) | US | Historically "market leader in growth and production of LN wafers". Supplied all of EPCOS's SAW-grade LN. Patent assignments later run to EPCOS and then SnapTrack, Inc. Present-day status N/A | C | S44 |
| Korth Kristalle GmbH | DE | Lists LN (Q-switches, SAW substrates, Pockels cells, frequency doublers). The LN entry is not marked "grown in-house", so likely a processor or reseller of LN, not a grower | F | S45 |
| Yamaju Ceramics Co., Ltd. | JP | Not verified (no result in EN/JP searches before the search budget ran out) | - | - |
| CETC 26th Research Institute / SIPAT | CN | SIPAT makes SAW devices (third-party brand page). LN/LT crystal growth by CETC 26 not verified | C | S74 |
| Fujian Fujing Technology Co., Ltd. (CASTECH, SZSE 002222) | CN | Listed by Zhiyan Consulting as an LN-related company. Whether it grows LN crystals: not verified | LG | S65 |
| "Coherent", "EPCOS" as global leaders | - | Chinese market-report claim that Sumitomo Metal Mining, EPCOS, and Coherent lead the global LN crystal market. No data behind it | LG | S65 |

Material grades (context, not market data): congruent LN (CLN) is the standard SAW and optical grade. MgO-doped (about 5 mol%) LN is used for PPLN and high-power optics because it resists photorefractive damage. Near-stoichiometric (SLN, MgO:SLN) is hard to grow and offered by few sources. See R06/R08 for physics.

### 1.3 LNOI / TFLN / POI engineered wafers

| Company | What is verified | Grade | Src |
|---|---|---|---|
| Jinan Jingzheng Electronics Co., Ltd. (NANOLN) | 300-900 nm LNOI and LTOI films. 5-50 um LN/LT thick films. 20-60 um free-standing LT. Thinning, PECVD, CMP, dicing services. Founded 2010 in Jinan by Hu Wen. Industrial production of 300-900 nm LN films | F | S6, S7 |
| Jingzheng: capital and status | Investors include Huawei Hubble and Yuanhe Yida. Preparing for IPO. Strategic investments from Shandong Hi-Speed (2026-04) and Nanjing Venture Capital Group (2026). Funding of "several hundred million CNY" at end-2024 | T | S7, S8 |
| Jingzheng: secondary claims | 8-inch 300-900 nm LN film developed 2023. Top-3 global shipments of 4" TFLN. Led the 2025 national standard for LN thin-film substrates for EO modulators | LG/C | S9, S75 |
| Soitec SA | Connect POI (piezo-on-insulator, Smart Cut) for SAW filters. LT6-MHB, LT6-LB, LN6 at 150 mm. LT8-MHB, LT8-LB at 200 mm. For 5G phones, GNSS, Wi-Fi coexistence, NTN | F | S10 |
| Soitec / Qualcomm | 2020-07: Soitec to make POI (300 nm to 1 um LT on buried oxide on high-resistivity Si) in high volume for Qualcomm RF filters | T | S11 |
| Soitec: LNOI for photonics | 2025-06: will supply Europe-made LNOI to CCRAFT, starting with 150 mm. A processed 200 mm wafer was shown | T | S13 |
| ELENA consortium (EU H2020, EUR 5 M, 42 months, ended 2025-06) | CSEM, CEA-Leti, Soitec, VPIphotonics, ETH Zurich, Vanguard Automation, Thales, III-V Lab, Rosenberger, L-up. Claims the first European commercial LNOI substrates (150 mm). States the prior supply chain "depended on a single commercial supplier outside the EU" | T/V | S12 |
| Partow Technologies LLC (Vista, CA) | Room-temperature (surface-activated) wafer-bonding tools and TFLN substrates, per directory listings. No product page read | C | S76 |
| Shin-Etsu: bonded LT/LN | Not verified | - | - |

S (speculation): the "single commercial supplier outside the EU" in S12 is probably NANOLN. The source does not name it.

### 1.4 TFLN foundries and fabs

| Entity | Model | Wafer | Verified facts | Grade | Src |
|---|---|---|---|---|---|
| HyperLight Corporation (Cambridge, MA) | Platform architect ("TFLN Chiplet"), volume production at foundries | 6" and 8" | 2026-03-11 (Business Wire, US) / 2026-03-12 (UMC, Taiwan): partnership with United Microelectronics Corporation (UMC) and its subsidiary Wavetek for high-volume production. Wavetek had earlier brought TFLN into a customer-qualified 6" CMOS line. UMC adds 8" | T/C | S19, S18 |
| CCRAFT SA (Neuchatel; CSEM spin-off, incorporated 2025-04) | Pure-play TFLN foundry, MPW runs (CLN600-Core, CLN600-Plus) | 150 mm (200 mm shown) | Thousands of chips for >40 partners. Targets 12 M chips/yr and up to 30% world share by 2030, and up to 2,000 wafers/month by 2030. US$7.8 M round (2026-07) led by QBIT Capital | T/V | S13, S14, S15, S16 |
| CSEM SA | R&D and technology owner. MPW operation moved to CCRAFT | 150 mm | PDK for C-band | T | S12, S14 |
| Lightium AG (Zurich, founded 2023) | Design, foundry, packaging services | 200 mm (secondary) | US$7 M seed (Vsquared Ventures, Lakestar), reported 2024-09-20. CHF 2.67 M Innosuisse grant in 2024. Transferring its process to an unnamed commercial CMOS fab. Says it is "first to design and manufacture TFLN chips at industrial scale" (V) | T/V | S24, S13 |
| Quantum Computing Inc. (QCi; Tempe, AZ) | TFLN foundry plus own products | N/A | First order 2024-11-13 (Asian research institute). Five orders by Q1 2025. Foundry construction completed in Q1 2025. Claims capacity for ">US$180 M sellable product in first full year" | T/V/C | S26, S27 |
| Ligentec SA + X-FAB Silicon Foundries | TFLN-on-SiN and TFLN-on-SOI inside X-FAB's foundry | 200 mm | Announced 2026-01-19. Investment described as future scaling, with no dates | F | S28 |
| Q.ANT GmbH (Stuttgart) | Own TFLN pilot line with IMS CHIPS (secondary) for photonic processors | N/A | See Section 1.7 | C | S52 |
| CHIPX (Wuxi Photonic Chip Research Institute, Shanghai Jiao Tong University) | Pilot line | 6" | Construction began 2022-12. Operational 2024-09. First 6" TFLN wafer reported 2025-06-09. Reported devices: about 110 GHz, 3.5 dB IL, 0.2 dB/cm, 1.9 V cm | T (garbled text; dates need recheck) | S29 |
| Anpai Optoelectronics (Shanghai/Wuhan, founded 2021) at Jiufengshan Laboratory (Wuhan) | Own line | 8" | Yicai (2024-08-27) reports "world's first 8-inch TFLN line", completed 2023-09, about CNY 60 M. First 8" Si-photonic TFLN wafer at the lab in 2024-03. Not independently verified | T (reporter claim) | S30 |
| Jiangsu Niobao Optoelectronics Technology Co., Ltd. (Nanjing, founded 2020-07) | TFLN modulator chip designer/maker. Claims the full process in-house | N/A | Raising a Series C to expand lines (2026-06) | T | S8 |
| Xili Photonics (Hangzhou, founded 2025-01) | "TFLN on-chip photonic engine" | N/A | Round led by Lenovo Capital (2026-06). Pre-A led by Futeng Capital (2026-09) | T/C | S8, S77 |
| EOSPACE, Inc. (Redmond, WA) | Bulk LN devices. DoD award for "thin-film niobate manufacturing" (federal contract summary) | N/A | Not opened | C | S39 |
| Xanadu Quantum Technologies | Not a foundry: runs TFLN process development, wafer lots at partner foundries (job postings). Uses HyperLight TFLN | - | - | C | S53 |
| Ligentec alone / Tower / GlobalFoundries TFLN | Not verified | - | - | - | - |

### 1.5 Device makers: modulators

TFLN (thin-film) modulators:

| Company | Product evidence | Grade | Src |
|---|---|---|---|
| HyperLight Corporation | 2023-03-07: TFLN Tx PICs for 200 G/lane IMDD (800G-DR4 OSFP) and 1.6 Tb/s per wavelength coherent. 2026-03-17: 1.6T-DR8 reference transceiver, 20 W fully retimed, about 20% below alternatives, one CW laser instead of 2-4. Engineering support from Suzhou TFC Optical Communication Co., Ltd. 2026-06: 200 G/lane products available, 400 G/lane sampling | C / V | S22, S20, S18 |
| Advanced Fiber Resources (Zhuhai) Ltd. (AFR, SZSE 300620) | OFC 2025 (release 2025-04-07): TFLN 96/130 GBd CDM and AM70 "reached volume shipment". Debuted a 400 Gb/s/lane PAM-4 TFLN chip. ECOC 2025 (2025-10-01): 400 G/lane chip for 1.6T DR4/FR4 and 3.2T DR8/FR8. 130 GBd CDM under 3.5 W. 40 GHz TFLN IQ modulator for FMCW LiDAR | F/V | S31, S32 |
| AFR: secondary figures | Gross margin 48-55%, CNY 1.6 bn orders, 1 M units/yr by end-2026, ">90% domestic share". All unsourced | LG | S9 |
| Fujitsu Optical Components Ltd. (FOC) | TF-LN driver-integrated coherent modulator FTM8300JN, 130 GBd (product page via snippet; FOC site now redirects). IEICE 2023 talk on TF-LN CDM and a path to 200 GBd | C/T | S34, S35 |
| Eoptolink Technology Inc., Ltd. | OFC 2022: 800G OSFP DR8 with a HyperLight TFLN modulator (before the 2023-2026 window) | C | S40 |
| Zhongji Innolight Co., Ltd. | 1.6T modules in mass production. 3.2T in R&D and testing. No TFLN-specific product statement found | T | S8 |
| Genuine Optics | ECOC 2026 (Malaga, 2026-09): 3.2T OSFP on a TFLN platform, up to 450 Gb/s/lane (press release seen only via search snippet) | C / V | S67 |
| Liobate Technologies | Named in market reports. CB Insights shows Series A-II on 2025-02-20 (aggregator). Whether Liobate is the same firm as Jiangsu Niobao is unclear: N/A | C | S71 |

Bulk Ti-diffused / APE LN modulators (legacy and specialty):

| Company | Evidence | Grade | Src |
|---|---|---|---|
| Fujitsu Optical Components | FOC press index title: "Ships 1 Millionth Coherent Lithium-Niobate Modulator, Maintains Top Global Market Share". Year not confirmed (2021 or 2024 per conflicting listings) | C | S34 |
| Sumitomo Osaka Cement Co., Ltd. | LN modulator line at its Guangdong plant (Nikkan Kogyo 2016-12). 100G LN modulator production in China from 2017-09. Present TFLN status N/A | C | S36 |
| Exail (formerly iXblue; includes Photline Technologies, founded 2000 from FEMTO-ST) | LN modulators since 2000. FOG integrated optical circuits (3 per gyroscope). Quantum (atom cooling, QKD), high-energy lasers, space, LiDAR, DTS. Besancon site with ISO 6/7 cleanroom | F/C | S37, S69 |
| Thorlabs, Inc. | Ti-indiffused X/Z-cut intensity, phase, and IQ modulators up to 40 GHz. Several part numbers obsolete (e.g. LN27S-FC discontinued 2022-08-17) | C | S38 |
| EOSPACE, Inc. | Founded 1997, Redmond WA. Ex-Boeing High Technology Center team. Modulators, switches, polarization controllers | C | S39 |
| AFR Milan (ex-Lumentum, ex-Oclaro San Donato Milanese) | 2019-11-28 asset purchase of Lumentum's LN high-speed modulator line and fab, US$17 M (AFR figure; Lumentum did not disclose). Lumentum shifted to InP PICs | C/T | S33 |
| Lumentum Holdings Inc. | Exited LN modulators in 2019 (above). No 2025-2026 TFLN announcement found | T | S33 |
| Coherent Corp. | No TFLN modulator announcement found. Its OFC 2026 3.2T content was InP EML-based (vendor blog, C) | C | S66 |

### 1.6 PPLN and nonlinear frequency conversion

| Company | Evidence | Grade | Src |
|---|---|---|---|
| Covesion Ltd. (UK) | MgO:PPLN crystals 460-6000 nm, ovens, controllers. Part of Hawthorn Photonics, which AdvR joined on 2025-06-05 | F | S41 |
| AdvR, Inc. (Bozeman, MT) | LN/KTP waveguide frequency converters, phase modulators, photon-pair sources | F | S41 |
| HC Photonics Corp. (Hsinchu, founded 2000) | MgO:PPLN/PPLT bulk and waveguides. SHG/SFG/DFG/OPO/SPDC. Quantum, gas sensing, bio-imaging | C | S42 |
| NTT Innovative Devices Corporation | PPLN waveguide wavelength-conversion modules (visible to mid-IR), sold via Acal BFi | C | S43 |
| Crystal Technology, Inc. (EPCOS) | Launched PPLN chips (2009 EPCOS item) | C | S44 |
| Coherent Corp. PPLN | Not verified | - | - |

### 1.7 RF acoustic filters (largest LN/LT volume use)

| Fact | Grade | Src |
|---|---|---|
| SAW filters are built on piezoelectric LT or LN substrates. Rotated-Y LT (36-50 deg) and 128 deg Y LN are standard cuts (SMM product spec) | F | S3 |
| Shin-Etsu's piezo crystal page lists LT only. Sumitomo Metal Mining lists both LT and LN | F | S3, S4 |
| Murata Manufacturing's I.H.P. SAW: thin LT film on Si (Yole teardown page). Thin LT bonded to Si improves temperature coefficient of frequency and Q | C | S49 |
| Soitec POI comes in LT (LT6, LT8) and LN (LN6, "wider RF bands up to 3+ GHz") | F | S10 |
| XBAR (laterally excited bulk-wave resonator) uses thin LN membranes. It was invented at Resonant Inc. and reaches 5 GHz-class filters | T (EPFL record) | S48 |
| Murata completed its acquisition of Resonant Inc. on 2022-03-28 (US time). Price about US$4.50/share, about US$300 M (SEC/secondary) | F / C | S46, S47 |
| Filters per phone: mid/high-tier 4G phones ">50", expected ">70" with 5G (Akoustis contribution, Microwave Journal, 2018). Vendor-sourced and dated | T/V | S50 |
| LT vs LN market share in SAW | N/A. No public quantitative source found. Qualitatively, LT appears dominant for TC-SAW and thin-film SAW, and LN for wideband and XBAR. This is inference from product pages (E) | E | S3, S4, S10, S49 |
| Murata, Qorvo, Skyworks, TDK-EPCOS, Qualcomm (RF360/SnapTrack) as SAW players | C (Yole snippet). Shares not public | C | S78 |
| Skyworks Solutions-Qorvo merger (2025) | Not verified (search budget ran out) | - | - |

### 1.8 Quantum, photonic computing, sensing

| Entity | Fact | Grade | Src |
|---|---|---|---|
| Q.ANT GmbH | EUR 62 M Series A (2025-07-22), co-led by Cherry Ventures, UVC Partners, imec.xpand. TRUMPF participated. Expanded to US$80 M with Duquesne Family Office (2025-10-30). TFLN-based photonic processors in a "Native Processing Server". Claims up to 30x energy efficiency (V) | T/V/C | S51, S52 |
| Xanadu Quantum Technologies + HyperLight | 2025-07-30: TFLN waveguide loss under 2 dB/m and EO switch loss about 20 mdB, made in a high-volume fab. Xanadu's Aurora system used the HyperLight TFLN Chiplet platform | T/V | S53 |
| PsiQuantum Corp. | Omega chipset (2025-02-26) uses barium titanate (BTO) switches on SiN, made at GlobalFoundries. Not LN. Useful as a "competing EO material" note | C | S54 |
| QCi | TFLN foundry plus quantum photonics products (above) | T | S26 |
| Exail | FOG IOCs (LN) for navigation. Over 25,000 FOGs sold | F/V | S37 |
| AFR | 40 GHz TFLN IQ modulator for FMCW LiDAR | V | S32 |

### 1.9 TFLT (thin-film lithium tantalate)

| Fact | Grade | Src |
|---|---|---|
| EPFL (Kippenberg) and SIMIT (Xin Ou), Nature 629, 784-790 (2024-05), DOI 10.1038/s41586-024-07369-1: LT PICs by wafer bonding compatible with SOI lines. 5.6 dB/m loss with a DUV stepper. Argument: LT is already high-volume for 5G RF filters, so wafers are cheaper than LN | F (abstract) | S55 |
| NANOLN sells LTOI | F | S6 |
| Commercial TFLT modulator products | None found as of 2026-10. Academic preprints only (KIT, EPFL, Harvard, Chinese groups) | C | S79 |

---

## 2. Market sizes

All of these come from syndicated-report teasers or press releases (LG). Definitions vary (chip vs module, bulk vs thin film, substrates in or out) and base years differ by about 7x. Use ranges only.

### 2.1 TFLN modulator market

| Publisher (release date) | Base | Forecast | CAGR | Grade | Src |
|---|---|---|---|---|---|
| Valuates Reports (2025-04-04) | US$356 M (2024) | US$3,829 M (2031) | 41.0% | LG | S57 |
| 24marketreports (2025-09-12) | US$476 M (2024) | US$1,219 M (2030) | 17.0% | LG | S58 |
| Intel Market Research (updated 2026-08-16) | US$73 M (2025) | US$2,510 M (2034) | 48% | LG | S59 |
| QYResearch (snippet) | US$137 M (2024) | US$317 M (2031) | 12.2% | LG/C | S60 |
| QYResearch (another edition, via DRI) | US$82.61 M (2025) | US$2,485.55 M (2034) | N/A | LG/C | S61 |
| Astute Analytica (2025-07-07), "TFLN devices" | N/A | US$3.19 B (2033) | N/A | LG/C | S62 |
| LightCounting, Yole | No public TFLN number found | - | - | - | - |

Range: base year about US$73-476 M (2024/2025), forecast about US$0.3-3.8 B (2030-2034).

Quality flags:
- The Intel Market Research player list includes NeoPhotonics (acquired by Lumentum in 2022), "Coherent TFLN Solutions", and "II-VI Photonics Division".
- 24marketreports lists AVANEX (defunct).
- Neither should be cited as industry evidence.

### 2.2 Bulk LN crystal / wafer market

| Publisher | Base | Forecast | Grade | Src |
|---|---|---|---|---|
| QYResearch (LN single crystal) | US$197 M (2024) | US$386 M (2031), 10.6% CAGR | LG/C | S63 |
| Dataintelo | about US$192 M (2024) | about US$352 M (2032), 7.8% | LG/C | S64 |
| Other teasers (unnamed in snippet) | US$133-140 M (2024) | US$160-173 M (2032), about 2.7% | LG/C | S64 |
| GII listing (scope unclear, likely much broader) | US$4.74 B (2024) | US$7.22 B (2030) | LG/C, outlier | S80 |
| Zhiyan Consulting (China only, 2025-09-30) | CNY 454 M (2024), +12.1% YoY | - | LG | S65 |

Range (bulk LN crystal, global): about US$130-200 M (2024), excluding the GII outlier.

Caveat (E): it is unclear whether these figures include SAW-grade LT, which is likely larger by volume than LN. No source separates them.

### 2.3 Context numbers

| Item | Value | Grade | Src |
|---|---|---|---|
| RF filter market | Yole: US$7.3 B (2021), US$8.2 B (2025). Snippet only | C | S78 |
| Modulator chip as share of optical module cost | "about 10-15%". Unsourced | LG | S9 |
| Global high-speed optical module market by 2030 | CNY 50-100 bn ("overseas institutions"). Unsourced | LG | S30 |

---

## 3. Events 2023-2026 (with background)

| Date | Event | Grade | Src |
|---|---|---|---|
| 2019-11-28 | AFR signs to buy Lumentum's LN modulator line and fab (San Donato Milanese), US$17 M (background) | C | S33 |
| 2020-07-07 | Soitec to make POI wafers in volume for Qualcomm RF filters (background) | T | S11 |
| 2022-03 | Eoptolink 800G DR8 with a HyperLight TFLN modulator at OFC 2022 (background) | C | S40 |
| 2022-03-28 | Murata completes acquisition of Resonant (XBAR on thin LN) | F | S46 |
| 2023-03-07 | HyperLight announces TFLN Tx PICs for 1.6T coherent and 200 G/lane IMDD | C | S22 |
| 2023-09 | Anpai Optoelectronics completes an 8-inch TFLN line in Wuhan (reporter claim) | T | S30 |
| 2024-03 | Jiufengshan Lab: first 8-inch Si-photonic TFLN wafer (reporter claim) | T | S30 |
| 2024-05 | Nature paper on LT PICs for volume manufacturing (EPFL/SIMIT): start of TFLT | F | S55 |
| 2024-09 | CHIPX 6-inch TFLN pilot line goes into operation (per c114; text partly garbled) | T | S29 |
| 2024-09-20 | Lightium US$7 M seed reported | T | S24 |
| 2024-09-24 | HyperLight US$37 M Series B led by Summit Partners | T | S21 |
| 2024-11-13 | QCi announces first TFLN foundry order | T | S26 |
| 2025-01 | QCi orders three to five; foundry completed in Q1 2025 | C | S27 |
| 2025-02-20 | Liobate Series A-II (aggregator) | C | S71 |
| 2025-02-26 | PsiQuantum Omega: BTO switches, not LN | C | S54 |
| 2025-04-07 | AFR at OFC 2025: TFLN 130 GBd CDM in volume shipment, 400 G/lane TFLN chip debut | F/V | S31 |
| 2025-05-13 | CCRAFT spun out of CSEM. Targets 12 M chips/yr by 2030 | T/V | S14 |
| 2025-06-05 | AdvR joins Hawthorn Photonics (Covesion's group) | F | S41 |
| 2025-06-09 | CHIPX reports its first 6-inch TFLN wafer | T | S29 |
| 2025-06-23 | ELENA: first Europe-made commercial LNOI (150 mm) | T | S12 |
| 2025-06-25 | Soitec to supply 150 mm LNOI to CCRAFT. 200 mm wafer shown | T | S13 |
| 2025-07-22 | Q.ANT EUR 62 M Series A | T | S51 |
| 2025-07-30 | Xanadu + HyperLight: <2 dB/m, about 20 mdB switch | T/V | S53 |
| 2025-10-01 | AFR at ECOC 2025: 400 G/lane chip for 1.6T/3.2T | F/V | S32 |
| 2025-10-30 | Q.ANT Series A expanded to US$80 M | C | S52 |
| 2025-12-30 | TDG Holding filing: target of 2.10 M piezo + bonded wafers/yr by 2029-12 | F (as reported in S5) | S5 |
| 2026-01-19 | Ligentec + X-FAB: 200 mm TFLN-on-SiN / TFLN-on-SOI scaling | F | S28 |
| 2026-03-11 / 2026-03-12 | HyperLight + UMC + Wavetek: volume foundry on 6" and 8" | T/C | S19 |
| 2026-03-16/18 | OFC 2026: HyperLight 1.6T-DR8 TFLN reference module at 20 W, with TFC | F/V | S20 |
| 2026-04 | Jingzheng: strategic investment from Shandong Hi-Speed fund | T | S7 |
| 2026-06-03 | TDG Holding IR: expects LN modulators to be mainstream for 3.2T+ | F (statement) | S5 |
| 2026-06-17 | Shanghai Securities News: Niobao Series C in progress. Nanzhi Xincai Pre-A >CNY 100 M. Xili round led by Lenovo Capital. Jingzheng preparing IPO | T | S8 |
| 2026-06-18 | HyperLight US$80 M Series C led by MediaTek. Investors include UMC Capital, Jabil, Foxconn, EDBI, CDIB-TEN, QIA | F | S18 |
| 2026-07-02/06 | CCRAFT raises US$7.8 M (QBIT Capital lead). Target 2,000 wafers/month by 2030 | F/T | S16, S15 |
| 2026-09 (about 09-09) | VentureTech Alliance added to HyperLight Series C | C | S23 |
| 2026-09 (ECOC, Malaga) | Genuine Optics 3.2T OSFP on TFLN, 450 Gb/s/lane (press release via snippet) | C/V | S67 |
| 2026-08-01 | Vendor blog: interoperable 3.2T pluggables "not yet a purchasable commodity". TFLN modulators commercially available | C | S66 |

Trend readout (E, built from the rows above):
1. TFLN moved from start-up fabs to merchant CMOS foundries (UMC/Wavetek, X-FAB). Wafer size moved from 4"/6" to 6"/8" between 2024 and 2026.
2. Strategic capital from the silicon and EMS supply chain (MediaTek, UMC, Foxconn, Jabil) replaced pure VC in HyperLight's Series C.
3. Europe built a sovereign chain: Soitec LNOI, then CCRAFT, Lightium, and Ligentec/X-FAB.
4. China built a full domestic chain: TDG Holding (crystal), Jingzheng (LNOI), AFR, Niobao, Anpai (chips), CHIPX (pilot line). Strong state and municipal capital.
5. 200 G/lane TFLN is shipping. 400 G/lane is sampling (2025-2026). 3.2T is still a demo or validation item as of 2026-10.

---

## 4. Supply constraints

| Constraint | Evidence | Grade | Src |
|---|---|---|---|
| LNOI wafer volume | Lightium CEO named wafer volume supply as a key industry challenge (LASER 2025) | T | S13 |
| Single-source LNOI risk (Europe view) | ELENA: the previous chain depended on one non-EU supplier | T | S12 |
| TFLN wafer shortage and price (China) | "Global supply-demand gap about 40%". Single-wafer price peaked at CNY 28,000, "up about 7x". No source given | LG | S9 |
| Capacity timing (China) | New domestic crystal and wafer capacity "H2 2026 to 2027". Unsourced | LG | S9 |
| Nb ore concentration | Brazil about 93% of mined Nb. Nb is mostly a steel input. A 2029-scale scenario (2.1 M 6-inch-equivalent wafers/yr) would need about 0.05% of mine output, about 0.1-0.25% with growth and kerf losses (E, Section 1.1) | F/E | S1 |
| Li | Supply is driven by batteries (88% of use). LN's share is negligible but not quantified: N/A | F | S2 |

---

## 5. "LN in your life" (lay visitors)

| # | Item | Plain-language hook | Honest caveat | Grade | Src |
|---|---|---|---|---|---|
| 1 | Phone radio filters | Your phone uses dozens of acoustic filters (>50 in 2018 4G phones, >70 expected with 5G). Many are carved on LN or its sibling LT | Most SAW filters use LT, not LN. BAW filters use AlN, not LN | F/T | S3, S4, S10, S50 |
| 2 | GPS/GNSS and Wi-Fi coexistence | Piezo-on-insulator filters keep GPS signals apart from 5G | Soitec does not say which phones use them | F | S10 |
| 3 | Internet backbone and AI data centers | Light in long-haul fiber is "written" by LN modulators. Fujitsu alone shipped about 1 million coherent LN modulators. New TFLN chips drive 1.6T links in AI clusters | Silicon photonics and InP compete. TFLN share is not public | C/F | S34, S20 |
| 4 | Navigation (aircraft, ships, satellites) | Fiber-optic gyroscopes use LN chips to split and steer light. Each gyro needs 3 LN chips | - | F | S37 |
| 5 | Green and colored laser light | PPLN turns invisible 1060 nm laser light into 530 nm green. Used in Corning's lasers for MicroVision pico-projectors (2010) | Cheap green pointers are usually doubled Nd lasers. Their crystal (often KTP, per general knowledge) was not verified here. Do not claim pointers use LN | T | S56 |
| 6 | Quantum computers and quantum links | Xanadu's Aurora used TFLN chips. PPLN makes entangled photon pairs | PsiQuantum uses BTO, not LN | T/F | S53, S41, S42 |
| 7 | AI photonic processors | Q.ANT ships TFLN-based photonic co-processors to selected partners | Performance numbers are vendor claims | T/V | S51 |
| 8 | Lasers in labs and industry | LN Pockels cells and Q-switches pulse lasers on and off | - | F | S45 |
| 9 | LiDAR and sensing | TFLN IQ modulators for FMCW LiDAR. LN modulators for distributed temperature sensing | Mostly niche or industrial | V/F | S32, S37 |
| 10 | Rock to chip | The niobium in LN almost all comes from Brazilian pyrochlore. One 6" wafer holds about 26 g of Nb | Calculated, not measured | F/E | S1 |

---

## 6. Corrections to the brief's assumptions

| Brief item | Finding |
|---|---|
| PsiQuantum uses LN? | No: BTO on SiN, made at GlobalFoundries [S54]. |
| Xanadu as a TFLN foundry? | No: uses HyperLight TFLN and partner foundries [S53]. |
| Ligentec TFLN? | Yes, via X-FAB, announced 2026-01-19, not yet in production [S28]. |
| CCRAFT | Real: CSEM spin-off, 2025 [S14]. |
| Lumentum LN | Exited bulk LN in 2019 (sold to AFR) [S33]. No TFLN product found. |
| Shin-Etsu LN | Its product page shows LT only. LN and LNOI not verified [S4]. |
| Soitec POI | Comes in both LT and LN (LN6) [S10]. Also makes LNOI for photonics (2025) [S13]. |
| Korth | Lists LN but not as grown in-house [S45]. |
| Yamaju Ceramics, CETC 26 crystal growth, Sumitomo Osaka Cement TFLN | Not verified. |

---

## 7. Facts vs claims vs estimates (summary)

- Facts (F): USGS Nb/Li data. SMM, Shin-Etsu, and Soitec product specs. TDG IR record. HyperLight and X-FAB releases. Murata/Resonant closing date. ELENA partners.
- Vendor claims (V): all capacity targets (CCRAFT 12 M chips/yr, 2,000 wafers/month; TDG 2.1 M wafers; QCi US$180 M), all power and performance figures (HyperLight 20 W, Q.ANT 30x), and all "first" claims (Anpai, CCRAFT, Lightium).
- Estimates (E): niobium per wafer and LN's share of Nb demand. LT dominance in SAW. Trend readout.
- Low-grade (LG): every market-size figure. All Chinese finance-site numbers (gap, price, AFR orders and margins, TDG 12").

---

## 8. Open items for the proposal author

1. Whether the website should show any market number. If yes, show the range bar plus the LG grade only.
2. Whether to use Chinese company names bilingually (recommended: English legal name plus Chinese name).
3. Whether the industry page links to R04 atlas data for device-level TFLN metrics, keeping R09 for companies and events.

---

## 9. Gaps and uncertainties

- The search budget ran out. Not verified: Yamaju Ceramics; CETC 26 LN/LT growth; Sumitomo Osaka Cement TFLN; Skyworks-Qorvo merger; NTT Innovative Devices primary page; FOC 1-millionth modulator date (2021 vs 2024); Lightium wafer size (200 mm is secondary); Genuine Optics release text; OneTouch Technology OFC 2026 TFLN listing (page 404).
- Pages that returned 403 and were read only via snippet or corroboration: UMC release, Sumitomo Metal Mining 2014 TSE disclosure, Business Wire US, Yole pages, Genuine Optics.
- LT vs LN SAW split: no public quantitative source.
- Chinese ecosystem numbers are mostly secondary. The only primary Chinese document read is the TDG Holding IR record (S5).
- English names of Chinese firms (Niobao vs Liobate; Qinghe Jingyuan; Xili) are transliterations or uncertain mappings.

---

## 10. Sources (all accessed 2026-10-24)

| ID | Publisher, date | URL | Grade |
|---|---|---|---|
| S1 | USGS, Mineral Commodity Summaries 2026, Niobium, 2026-02 | https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-niobium.pdf | F |
| S2 | USGS, MCS 2026, Lithium, 2026-02 | https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf | F |
| S3 | Sumitomo Metal Mining, LT/LN product page | https://www.smm.co.jp/en/business/material/products/lithium/ | F |
| S4 | Shin-Etsu Chemical, Oxide Single Crystals (LT) | https://www.shinetsu.co.jp/en/products/electronics-materials/oxide-single-crystals/ | F |
| S5 | TDG Holding (600330), Investor Relations Activity Record, 2026-06-03 | https://pdf.dfcfw.com/pdf/H22_AN202606041823249221_1.pdf | F |
| S6 | NANOLN (Jinan Jingzheng) homepage | https://www.nanoln.com/ | F |
| S7 | Economic Herald via 10jqka, 2026-06-29 | https://stock.10jqka.com.cn/20260629/c677805800.shtml | T |
| S8 | Shanghai Securities News, 2026-06-17 | https://paper.cnstock.com/html/2026-06/17/content_2232363.htm | T |
| S9 | Securities Star via 10jqka, 2026-10-03 (AI-assisted disclaimer) | https://stock.10jqka.com.cn/20261003/c680435922.shtml | LG |
| S10 | Soitec, Connect POI | https://www.soitec.com/en/products/poi | F |
| S11 | eeNews Europe, 2020-07-07 | https://www.eenewseurope.com/en/qualcomm-adopts-soitec-poi-wafers-for-saw-filters/ | T |
| S12 | PIC Magazine, 2025-06-23 (ELENA) | https://picmagazine.net/article/121970/EU_project_announces_Europe’s_first_commercial_supplier_of_LNOI_wafers | T |
| S13 | optics.org, 2025-06-25 | https://optics.org/news/laser-2025-ccraft-and-lightium-push-thin-film-lithium-niobate-pics | T |
| S14 | optics.org, 2025-05-13 | https://optics.org/news/csem-spins-off-lithium-niobate-photonic-integrated-circuit-foundry | T |
| S15 | Evertiq, 2026-07-06 | https://evertiq.com/news/2026-07-06-ccraft-raises-78-million-to-scale-photonic-chip-manufacturing | T |
| S16 | CSEM press, 2026-07-02 | https://www.csem.ch/en/press/ccraft-photonic-chips-switzerland-scaling/ | F |
| S18 | Summit Partners (HyperLight Series C), 2026-06-18 | https://www.summitpartners.com/news/hyperlight-announces-80-million-series-c-to-accelerate-tfln-deployment-for-ai-infrastructure | F |
| S19 | UMC press release, 2026-03-12 (403; content via search snippet, TrendForce, iConnect007) | https://www.umc.com/en/News/press_release/Content/corporate/20260312 | C |
| S20 | Business Wire China (HyperLight 1.6T-DR8), 2026-03-17 | https://www.businesswirechina.com/en/news/62386.html | F |
| S21 | Lightwave, 2024-09-24 | https://lightwaveonline.com/home/article/55142234/hyperlight-secures-37m-in-new-funding | T |
| S22 | Business Wire (HyperLight TFLN Tx), 2023-03-07 (snippet) | https://www.businesswire.com/news/home/20230307005911/en/HyperLight-Announces-Thin-film-Lithium-Niobate-Transmitter-Chips-Supporting-Energy-Efficient-1.6-Tbps-Transceiver-Modules | C |
| S23 | Pulse 2.0 (VentureTech Alliance joins Series C), 2026-09 (snippet) | https://pulse2.com/hyperlight-adds-venturetech-alliance-to-series-c-to-expand-tfln-semiconductor-ecosystem/ | C |
| S24 | eeNews Europe, 2024-09-20 (Lightium) | https://www.eenewseurope.com/en/swiss-photonic-foundry-lightium-raises-seed-funding/ | T |
| S26 | Lightwave, 2024-11-18 (QCi) | https://www.lightwaveonline.com/business/article/55243823/quantum-computing-inc-receives-first-tfln-foundry-order | T |
| S27 | QCi Q1 2025 results via finanzen.net (snippet) | https://www.finanzen.net/nachricht/aktien/quantum-computing-inc-reports-first-quarter-2025-financial-results-14488766 | C |
| S28 | X-FAB news, 2026-01-19 | https://www.xfab.com/news/details/article/ligentec-and-x-fab-expand-integrated-photonics-offering-with-soi-and-thin-film-lithium-niobate-volume-scaling | F |
| S29 | C114, 2025-06-09 (CHIPX) | https://m.c114.com.cn/w5285-1290717.html | T |
| S30 | Yicai via Sina, 2024-08-27 (Anpai, Jiufengshan) | https://finance.sina.cn/2024-08-27/detail-incmaynh4172882.d.html | T |
| S31 | AFR news, 2025-04-07 (OFC 2025) | https://www.fiber-resources.com/medias/140.html | F |
| S32 | AFR news, 2025-10-01 (ECOC 2025) | https://www.fiber-resources.com/medias/143.html | F |
| S33 | AFR (acquisition) and Lightwave (Lumentum sale), 2019-12 (snippets) | https://www.fiber-resources.com/afr-acquired-assets-of-lumentum-ln-high-speed-modulator-product-line_n22 ; https://www.lightwaveonline.com/business/mergers-acquisitions/article/14072909/lumentum-to-sell-certain-lithium-niobate-based-product-lines-to-afr | C |
| S34 | Fujitsu Optical Components product and press index (now redirects; snippet) | https://www.fujitsu.com/jp/group/foc/en/products/devices/cdm/indexgig5.html | C |
| S35 | IEICE technical report, 2023-08 (Makino, FOC) | https://ken.ieice.org/ken/paper/202308243CWO/eng/ | C |
| S36 | Nikkan Kogyo Shimbun, 2016-12 and 2017-09 (snippets) | https://www.nikkan.co.jp/articles/view/00410032 ; https://www.nikkan.co.jp/articles/view/00442372 | C |
| S37 | Exail, "What is a LN electro-optical modulator" | https://www.exail.com/resources/knowledge-center/resources/what-is-a-lithium-niobate-electro-optical-modulator | F |
| S38 | Thorlabs datasheets (snippets) | https://www.thorlabs.us/catalogpages/obsolete/2022/LN86S-FC.pdf | C |
| S39 | Photonics Buyers' Guide, EOSPACE (snippet) | https://photonics.com/Buyers_Guide/EOSPACE_Inc/c4444 | C |
| S40 | Lightwave (Eoptolink 800G TFLN), 2022 (snippet) | https://www.lightwaveonline.com/optical-tech/transmission/article/14235578/eoptolink-demos-800g-osfp-dr8-optical-transceiver-featuring-thin-film-lithium-niobate-modulator | C |
| S41 | Optica corporate member news, 2025-06-05 | https://www.optica.org/about/newsroom/corporate_member_news/2025/advr_joins_covesion_in_strategic_expansion | F |
| S42 | Laser Focus World directory, HC Photonics (snippet) | https://www.laserfocusworld.com/directory/materials-substrates/optical-materials/company/14049121/hc-photonics-corp | C |
| S43 | Acal BFi, Wavelength Conversion Module (NTT Innovative Devices) (snippet) | https://www.acalbfi.com/technologies/photonics/laser-and-light-sources/wavelength-conversion-module | C |
| S44 | EPCOS AG Form 20-F FY2006 (snippet) | https://www.sec.gov/Archives/edgar/data/0001095409/000119312507061492/d20f.htm | C |
| S45 | Korth Kristalle, LiNbO3 | https://www.korth.de/en/materials/detail/Lithium%20Niobate | F |
| S46 | Murata news, 2022-03-29 | https://corporate.murata.com/newsroom/news/company/general/2022/0329 | F |
| S47 | Resonant Inc. 8-K exhibit, 2022 (snippet) | https://www.sec.gov/Archives/edgar/data/1579910/000110465922023177/tm226596d1_ex99-1.htm | C |
| S48 | EPFL Infoscience, XBARs on thin LN platelets | https://infoscience.epfl.ch/record/272800 | T |
| S49 | Yole, Murata I.H.P. SAW teardown page (snippet) | https://www.yolegroup.com/product/report/murata-incredible-high-performance-ihp-saw-filter | C |
| S50 | Microwave Journal, 2018-10-11 | https://www.microwavejournal.com/articles/31149-sawbaw-new-market-entrants-offer-new-approaches | T |
| S51 | Evertiq, 2025-07-22 (Q.ANT) | https://evertiq.com/news/2025-07-22-qant-raises-62m-to-advance-computing-with-photonic-processing | T |
| S52 | The Quantum Insider, 2025-10-30 (snippet) | https://thequantuminsider.com/2025/10/30/duquesne-family-office-invests-in-q-ant-to-drive-sustainable-photonic-ai-infrastructure/ | C |
| S53 | The Quantum Insider, 2025-07-30 | https://thequantuminsider.com/2025/07/30/xanadu-and-hyperlight-unveil-advances-in-photonic-chips-setting-new-quantum-computing-benchmarks/ | T |
| S54 | The Quantum Insider, 2025-02-26 (snippet) | https://thequantuminsider.com/2025/02/26/psiquantum-announces-omega-a-manufacturable-photonic-quantum-computing-chipset/ | C |
| S55 | Nature 629, 784-790 (2024), DOI 10.1038/s41586-024-07369-1 (RePEc abstract) | https://ideas.repec.org/a/nat/nature/v629y2024i8013d10.1038_s41586-024-07369-1.html | F |
| S56 | Laser Focus World, J. Hecht, 2010-07-01 | https://laserfocusworld.com/lasers-sources/article/16552084/photonic-frontiers-frequencyshifted-diode-lasers-shifting-semiconductor-laser-wavelengths-poses-challenges | T |
| S57 | Valuates Reports via PR Newswire, 2025-04-04 | https://www.prnewswire.com/news-releases/thin-film-lithium-niobate-tfln-modulator-market-to-hit-usd-3-8-billion-by-2031--driven-by-optical-communication-data-centers-and-5g--valuates-reports-302421134.html | LG |
| S58 | 24marketreports, 2025-09-12 | https://www.24marketreports.com/machines/global-thin-film-lithium-niobate-optical-modulator-forecast-market | LG |
| S59 | Intel Market Research, updated 2026-08-16 | https://www.intelmarketresearch.com/thin-film-lithium-niobate-modulator-market-21963 | LG |
| S60 | QYResearch TFLN modulator (page empty; figures via snippet) | https://www.qyresearch.com/reports/4810950/thin-film-lithium-niobate--tfln--modulator | LG/C |
| S61 | QYResearch via DRI (snippet) | https://www.dri.co.jp/auto/report/qyr/260824-thin-film-lithium-niobate-tfln-modulator-.html | LG/C |
| S62 | Astute Analytica via GlobeNewswire, 2025-07-07 (snippet) | https://www.globenewswire.com/news-release/2025/07/07/3111078/0/en/thin-film-lithium-niobate-devices-market-poised-to-attain-valuation-of-us-3-19-billion-by-2033-astute-analytica.html | LG/C |
| S63 | QYResearch LN single crystal via DRI (snippet) | https://www.dri.co.jp/auto/report/qyr/251015-lithium-niobate-single-crystal-global.html | LG/C |
| S64 | Dataintelo and other LN teasers (snippets) | https://marketinsights.odoo.com/blog/news-2/lithium-niobate-market-to-reach-usd-352-million-by-2032-dataintelo-143 | LG/C |
| S65 | Zhiyan Consulting (chyxx), 2025-09-30 | https://www.chyxx.com/industry/1237520.html | LG |
| S66 | Hengtong blog, 2026-08-01 (snippet) | https://www.hengtongglobal.com/info/tfln-3-2t-optics-fiber-cabling-103603656.html | C |
| S67 | EIN Presswire, Genuine Optics, 2026-09 (403; snippet) | https://www.einnews.com/pr_news/943821166/genuine-optics-unveils-3-2t-osfp-module-with-450-gb-s-lanes-at-ecoc-2026 | C |
| S69 | iXblue Photonics Besancon location page (snippet) | https://www.ixblue.com/locations/ixblue-photonics | C |
| S71 | CB Insights, Liobate financials (aggregator) | https://www.cbinsights.com/company/nio-optoelectronics/financials | C |
| S72 | Geopolitical Monitor / critical-minerals-news (CBMM share; snippets) | https://www.geopoliticalmonitor.com/critical-minerals-global-niobium-supply-demand/ | C |
| S73 | Sumitomo Metal Mining TSE disclosure, 2014-12 (403; snippet) | https://www2.jpx.co.jp/disc/57130/140120141218095422.pdf | C |
| S74 | Bomman brand page, SIPAT (snippet) | https://en.bomman.com/brand/SIPAT-991.html | C |
| S75 | 36Kr PitchHub, Jingzheng project page (snippet) | https://pitchhub.36kr.com/project/1678490981790729 | C |
| S76 | Datanyze, Partow Technologies (snippet) | https://www.datanyze.com/companies/partow-technologies/358975839 | C |
| S77 | ChinaVenture, Xili Photonics Pre-A, 2026-09-18 (snippet) | https://m.chinaventure.com.cn/news/113-20260918-393335.html | C |
| S78 | Yole Group, RF filters 2025 insight and SAW comparison (403; snippets) | https://www.yolegroup.com/strategy-insights/rf-filters-in-2025-choosing-the-right-technology-for-performance-cost-and-integration/ | C |
| S79 | arXiv TFLT modulator preprints, e.g. 2505.04755 (snippet) | https://arxiv.org/html/2505.04755v1 | C |
| S80 | GII listing, LN market (snippet) | https://www.giiresearch.com/report/tsci1770895-lithium-niobate-market-global-industry-size-share.html | LG/C |

(IDs S17, S25, S68, S70 are not used.)

---

## Website implications (ranked)

1. **"LN in your life" opener, honest version.** Items 1-10 in Section 5 as hover cards. Each card carries its source and grade. Say plainly that phone filters are mostly LT, a sibling of LN. Do not claim green pointers use LN. Strongest lay hook, low risk.
2. **Rock-to-chip value chain as an interactive flow diagram** (Section 1 ASCII as the spec). Nodes: Brazil pyrochlore, Nb2O5/Li2CO3, Cz boule, wafer, ion-slice/bond, TFLN fab, modulator, module, data center. Each node has a hover popup with 2-4 sourced facts and named companies. The "26 g of Nb per 6-inch wafer, about 0.05% of world Nb" calculation is a memorable, checkable detail.
3. **Dated event timeline (2019-2026) built from a JSON file** with fields `date`, `event`, `entities`, `source_url`, `accessed`, `grade`. Doubles as the machine-readable endpoint required by DevLog-000. Easy to update after each OFC/ECOC.
4. **Wafer-size and lane-rate progression visual.** Bulk 4"/6", then TFLN 4"/6", then 6"/8" foundry (2026), with 12" as an unverified claim. 200 G/lane shipping, 400 G/lane sampling, 3.2T in demos. Data-only plot, ISO dates.
5. **Market numbers only as a range strip** (publisher, base year, forecast, definition). Every bar labelled "report teaser, low-grade". No single headline number. This differentiates the site from the SEO market-report spam.
6. **Ecosystem map by region (US, EU/CH, CN, JP, TW)** with company cards: full legal names, Chinese names alongside, model (grower, LNOI, foundry, device), and verified-only facts. Hide unverified entries (Yamaju, CETC 26) or tag them "not verified".
7. **"Neighbours and rivals" sidebar.** LT and TFLT (Nature 2024), BTO (PsiQuantum), InP and silicon photonics. Puts LN in context without overselling.
8. **Maintenance rule for the site.** Every industry claim needs a source URL, an access date, and a grade. Re-verify yearly after OFC (March) and ECOC (September). Chinese finance-site numbers appear only with the LG tag.
