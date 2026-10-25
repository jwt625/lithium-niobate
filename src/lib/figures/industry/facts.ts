// Chapter 08 industry facts, transcribed from content/chapters/08-industry/manuscript.md (as of 2026-10-25). Each fact keeps
// the manuscript grade and its source key ("r:<refs.yaml id>"; several sources joined with "+"). Atlas counts are not
// written here: they are computed from static/data/industry/atlas-ln.json (atlas.ts) and passed in by the page loads.

export interface Fact { t: string; g: string; r: string }

// ---------- 8.1 value chain (F8.01) ----------
export interface ChainNode { id: string; label: string; sub: string; facts: Fact[]; companies: string[]; atlasFact?: boolean }
export const CHAIN: ChainNode[] = [
  { id: "ore_nb", label: "Nb ore", sub: "pyrochlore, Brazil", companies: [], facts: [
    { t: "World mine production 112,000 t Nb content in 2024 and 2025 (estimated)", g: "F", r: "r:usgs2026nb" },
    { t: "Brazil 104,000 t, about 93% of world production; Canada 6,900 t (2024e), 6,000 t (2025e)", g: "F", r: "r:usgs2026nb" },
    { t: "Reserves: Brazil 14,000,000 t; Canada 640,000 t; world > 21,000,000 t", g: "F", r: "r:usgs2026nb" },
    { t: "US end use: steels about 77%, superalloys about 23%; LN and LT electronics not listed separately (N/A)", g: "F", r: "r:usgs2026nb" },
  ] },
  { id: "ore_li", label: "Li ore, brine", sub: "battery-grade lithium", companies: [], facts: [
    { t: "World production 290,000 t Li content in 2025 (excluding US), up from 222,000 t in 2024", g: "F", r: "r:usgs2026li" },
    { t: "Batteries take 88% of global lithium end use; LN and LT are not broken out (N/A)", g: "F", r: "r:usgs2026li" },
  ] },
  { id: "oxide", label: "Nb₂O₅ + Li₂CO₃", sub: "oxide powders", companies: [], facts: [
    { t: "Nb₂O₅ is 69.904 wt% Nb", g: "F", r: "r:usgs2026nb" },
    { t: "US niobium oxide imports 2021-2024: Brazil 89%, Estonia 4%, Thailand 4%", g: "F", r: "r:usgs2026nb" },
  ] },
  { id: "crystal", label: "Boule", sub: "Czochralski crystal", companies: ["Sumitomo Metal Mining", "TDG Holding", "Nanzhi Xincai"], facts: [
    { t: "Sumitomo Metal Mining grows LT and LN single crystals by the Czochralski method", g: "F", r: "r:smm-ltln" },
    { t: "TDG Holding (SSE 600330) states 8-inch LN is in mass production (IR record 2026-06-03)", g: "F (statement)", r: "r:tdg2026ir" },
    { t: "Nanzhi Xincai (Suzhou): founded 2021-12 on a Nanjing University team; LN/LT crystal materials; Pre-A round over CNY 100 M", g: "T/V", r: "r:r09-s8" },
  ] },
  { id: "wafer_bulk", label: "Bulk wafer", sub: "SAW, PPLN, bulk EO", companies: ["Sumitomo Metal Mining", "Shin-Etsu Chemical", "TDG Holding", "Covesion"], facts: [
    { t: "Sumitomo Metal Mining: 4\" and 6\" wafers; LN 128-degree rotated Y (350 um at 4\", 500 um at 6\"); LT 36-50-degree rotated Y; main use SAW filters in smartphones", g: "F", r: "r:smm-ltln" },
    { t: "Shin-Etsu Chemical: LT crystals and wafers, 4\" and 6\", for SAW devices; LN not listed on its product page", g: "F", r: "r:shinetsu-lt" },
    { t: "TDG Holding plan: 1.68 M piezoelectric + 0.42 M bonded wafers per year by 2029-12", g: "V", r: "r:tdg2026ir" },
    { t: "Branch, bulk devices: Covesion MgO:PPLN crystals for 460-6000 nm", g: "F", r: "r:optica-advr-2025" },
  ] },
  { id: "wafer_thin", label: "LNOI wafer", sub: "ion-sliced, bonded film", companies: ["NanoLN", "Soitec", "ELENA consortium"], atlasFact: true, facts: [
    { t: "NanoLN (Jinan Jingzheng Electronics): 300-900 nm LNOI and LTOI films; thick films 5-50 um", g: "F", r: "r:nanoln-home" },
    { t: "Soitec Connect POI: LT6, LT8 (150 / 200 mm LT) and LN6 (150 mm LN) for RF filters", g: "F", r: "r:soitec-poi" },
    { t: "Soitec to supply Europe-made 150 mm LNOI to CCRAFT; a processed 200 mm wafer shown (2025-06)", g: "T", r: "r:opticsorg-2025-06-25" },
  ] },
  { id: "foundry", label: "TFLN fab", sub: "foundry, 150-200 mm", companies: ["Ligentec + X-FAB", "HyperLight + UMC / Wavetek", "CCRAFT", "Lightium", "QCi", "CHIPX", "Anpai"], facts: [
    { t: "Ligentec and X-FAB: TFLN-on-SiN and TFLN-on-SOI at 200 mm inside X-FAB (announced 2026-01-19; no production dates)", g: "F", r: "r:xfab-2026-01-19" },
    { t: "HyperLight with UMC and its subsidiary Wavetek: high-volume production on 6\" and 8\" (announced 2026-03-11/12); UMC release read through trade-press coverage", g: "T/C", r: "r:r09-s19" },
    { t: "CCRAFT (CSEM spin-off, 2025): pure-play TFLN foundry, MPW runs, 150 mm", g: "T", r: "r:opticsorg-2025-05-13" },
  ] },
  { id: "chip", label: "Modulator chip", sub: "TFLN MZM", companies: ["HyperLight", "AFR", "Murata", "Niobao"], facts: [
    { t: "HyperLight: 200 G/lane products available, 400 G/lane sampling (2026-06)", g: "V", r: "r:r09-s18" },
    { t: "Murata: TFLN EO modulator \">100 GHz\", \"400 Gbps/ch PAM4\", shown as a product in development at OFC 2026", g: "V", r: "r:murata2026" },
    { t: "AFR: 400 G/lane chip for 1.6T and 3.2T (ECOC 2025, 2025-10-01)", g: "F/V", r: "r:afr-2025-10-01" },
  ] },
  { id: "module", label: "Module", sub: "CDM, transceiver", companies: ["AFR", "HyperLight"], facts: [
    { t: "Advanced Fiber Resources (AFR): TFLN 96/130 GBd coherent driver modulators \"reached volume shipment\" (2025-04-07)", g: "F/V", r: "r:afr-2025-04-07" },
    { t: "HyperLight: 1.6T-DR8 reference transceiver at 20 W (2026-03-17)", g: "F/V", r: "r:bwchina-2026-03-17" },
  ] },
  { id: "system", label: "Data center", sub: "also quantum, sensing", companies: ["Xanadu", "Q.ANT", "Exail"], facts: [
    { t: "TDG Holding expects LN modulators to be mainstream for 3.2T and above (statement, 2026-06-03)", g: "F (statement)", r: "r:tdg2026ir" },
    { t: "Xanadu with HyperLight: TFLN waveguide loss < 2 dB/m and EO switch loss about 20 mdB in high-volume fab (2025-07-30)", g: "T/V", r: "r:r09-s53" },
    { t: "Exail: LN modulators since 2000; integrated optical circuits for fiber-optic gyroscopes; over 25,000 FOGs sold", g: "F/V", r: "r:exail-ln" },
  ] },
];

/** 8.1 L2 rows that are not in the node cards (full table on the page). */
export const CHAIN_EXTRA: { node: string; f: Fact }[] = [
  { node: "Niobium ore", f: { t: "Brazil ferroniobium exports 92,000 t in 2024; destinations China 49%, Netherlands 17%, Singapore 9%", g: "F", r: "r:usgs2026nb" } },
];

// ---------- 8.2 ecosystem (F8.02) ----------
export type Region = "US" | "EU/CH" | "UK" | "CN" | "JP" | "TW" | "CA";
export const REGIONS: Region[] = ["US", "CA", "EU/CH", "UK", "CN", "JP", "TW"];
export const STAGES = ["Crystal", "Thin-film wafer", "Foundry", "Device", "PPLN", "Quantum / computing"] as const;
export type Stage = (typeof STAGES)[number];
export interface Co { stage: Stage; name: string; co: string; region: Region; fact: string; g: string; r: string; date: string }
/** Verified entries (manuscript 8.2 L2): grades F, V, T only. `co` groups tags of one company across stages. */
export const COMPANIES: Co[] = [
  { stage: "Crystal", name: "Sumitomo Metal Mining", co: "smm", region: "JP", fact: "LT and LN crystals; 4\" and 6\" wafers for SAW", g: "F", r: "r:smm-ltln", date: "page accessed 2026-10-24" },
  { stage: "Crystal", name: "Shin-Etsu Chemical", co: "shinetsu", region: "JP", fact: "LT crystals and wafers, 4\" and 6\"", g: "F", r: "r:shinetsu-lt", date: "page accessed 2026-10-24" },
  { stage: "Crystal", name: "TDG Holding (Tiantong, SSE 600330)", co: "tdg", region: "CN", fact: "8-inch LN \"in mass production\" (statement); 2029 wafer plan (roadmap); states it does not make optical modules", g: "F / V", r: "r:tdg2026ir", date: "2026-06-03" },
  { stage: "Crystal", name: "Nanzhi Xincai (Suzhou)", co: "nanzhi", region: "CN", fact: "Founded 2021-12 on a Nanjing University team; LN/LT crystal materials; Pre-A round over CNY 100 M", g: "T / V", r: "r:r09-s8", date: "2026-06-17" },
  { stage: "Thin-film wafer", name: "NanoLN (Jinan Jingzheng Electronics)", co: "nanoln", region: "CN", fact: "LNOI and LTOI, 300-900 nm films", g: "F", r: "r:nanoln-home", date: "page accessed 2026-10-24" },
  { stage: "Thin-film wafer", name: "NanoLN (Jinan Jingzheng Electronics)", co: "nanoln", region: "CN", fact: "Investors include Huawei Hubble; preparing an IPO; strategic investment from Shandong Hi-Speed (2026-04)", g: "T", r: "r:r09-s7+r09-s8", date: "2026-06" },
  { stage: "Thin-film wafer", name: "Soitec", co: "soitec", region: "EU/CH", fact: "POI LT6 / LT8 / LN6 for RF filters; 150 mm LNOI for CCRAFT (2025-06)", g: "F / T", r: "r:soitec-poi+opticsorg-2025-06-25", date: "2025-06-25" },
  { stage: "Thin-film wafer", name: "ELENA consortium (EU H2020)", co: "elena", region: "EU/CH", fact: "Claims the first European commercial LNOI substrates (150 mm); states the prior chain \"depended on a single commercial supplier outside the EU\"; project ended 2025-06", g: "T / V", r: "r:r09-s12", date: "2025-06-23" },
  { stage: "Foundry", name: "HyperLight", co: "hyperlight", region: "US", fact: "Volume production on 6\" and 8\" with UMC and Wavetek (2026-03); UMC release read via trade press", g: "T/C", r: "r:r09-s19", date: "2026-03-11" },
  { stage: "Foundry", name: "UMC / Wavetek", co: "umc", region: "TW", fact: "Foundry partner of HyperLight for volume TFLN production on 6\" and 8\" (2026-03)", g: "T/C", r: "r:r09-s19", date: "2026-03-11" },
  { stage: "Foundry", name: "CCRAFT", co: "ccraft", region: "EU/CH", fact: "MPW runs CLN600-Core / CLN600-Plus, 150 mm; targets 12 M chips per year and up to 2,000 wafers per month by 2030", g: "T / V", r: "r:opticsorg-2025-06-25+opticsorg-2025-05-13+r09-s15+r09-s16", date: "2026-07-02" },
  { stage: "Foundry", name: "Lightium", co: "lightium", region: "EU/CH", fact: "Design, foundry, and packaging services; US$7 M seed (reported 2024-09-20)", g: "T / V", r: "r:r09-s24", date: "2024-09-20" },
  { stage: "Foundry", name: "Ligentec + X-FAB", co: "ligentec", region: "EU/CH", fact: "TFLN-on-SiN and TFLN-on-SOI at 200 mm inside X-FAB", g: "F", r: "r:xfab-2026-01-19", date: "2026-01-19" },
  { stage: "Foundry", name: "Quantum Computing Inc.", co: "qci", region: "US", fact: "TFLN foundry; first foundry order announced 2024-11-13", g: "T / V", r: "r:r09-s26", date: "2024-11-13" },
  { stage: "Foundry", name: "CHIPX (Wuxi, SJTU)", co: "chipx", region: "CN", fact: "6\" pilot line; first 6\" TFLN wafer reported 2025-06-09", g: "T", r: "r:r09-s29", date: "2025-06-09" },
  { stage: "Foundry", name: "Anpai Optoelectronics", co: "anpai", region: "CN", fact: "At Jiufengshan Laboratory; reported \"world's first 8-inch TFLN line\", completed 2023-09 (reporter claim)", g: "T", r: "r:r09-s30", date: "2023-09" },
  { stage: "Device", name: "HyperLight", co: "hyperlight", region: "US", fact: "US$80 M Series C led by MediaTek (2026-06-18); 200 G/lane products available, 400 G/lane sampling", g: "F / V", r: "r:r09-s18", date: "2026-06-18" },
  { stage: "Device", name: "Advanced Fiber Resources (AFR)", co: "afr", region: "CN", fact: "TFLN 130 GBd CDM in volume shipment (2025-04-07); 400 G/lane chip for 1.6T and 3.2T (ECOC 2025)", g: "F / V", r: "r:afr-2025-04-07+afr-2025-10-01", date: "2025-10-01" },
  { stage: "Device", name: "Murata", co: "murata", region: "JP", fact: "TFLN EO modulator in development (OFC 2026); states its high-frequency filters use LiNbO3", g: "V", r: "r:murata2026", date: "2026-03-10" },
  { stage: "Device", name: "Exail (formerly iXblue)", co: "exail", region: "EU/CH", fact: "LN modulators since 2000; FOG integrated optical circuits; over 25,000 FOGs sold", g: "F / V", r: "r:exail-ln", date: "page accessed 2026-10-24" },
  { stage: "Device", name: "Jiangsu Niobao Optoelectronics (Nanjing)", co: "niobao", region: "CN", fact: "TFLN modulator chips, full process in house (claim); Series C in progress (2026-06)", g: "T / V", r: "r:r09-s8", date: "2026-06-17" },
  { stage: "PPLN", name: "Covesion", co: "covesion", region: "UK", fact: "MgO:PPLN crystals 460-6000 nm; in Hawthorn Photonics with AdvR (2025-06-05)", g: "F", r: "r:optica-advr-2025", date: "2025-06-05" },
  { stage: "PPLN", name: "AdvR", co: "advr", region: "US", fact: "LN and KTP waveguide frequency converters; joined Hawthorn Photonics (2025-06-05)", g: "F", r: "r:optica-advr-2025", date: "2025-06-05" },
  { stage: "Quantum / computing", name: "Q.ANT", co: "qant", region: "EU/CH", fact: "EUR 62 M Series A (2025-07); TFLN-based photonic processors; \"up to 30x\" energy efficiency (vendor claim)", g: "T / V", r: "r:r09-s51", date: "2025-07-22" },
  { stage: "Quantum / computing", name: "Xanadu (with HyperLight)", co: "xanadu", region: "CA", fact: "TFLN waveguide loss < 2 dB/m and EO switch loss about 20 mdB, high-volume fab (2025-07-30)", g: "T / V", r: "r:r09-s53", date: "2025-07-30" },
];
export const CORRECTIONS = "PsiQuantum's Omega chipset uses barium titanate switches on SiN, not LN (grade C); Lumentum sold its LN modulator line to AFR in 2019 (C/T) and has no TFLN product found; no TFLN modulator announcement was found for Coherent Corp. (C).";
export const NOT_SHOWN_C = "Fujitsu Optical Components TF-LN CDM, Genuine Optics 3.2T, EOSPACE, Thorlabs, HC Photonics, NTT Innovative Devices, Liobate funding, Partow";
export const NOT_SHOWN_LG = "wafer price, supply gap, AFR margins, TDG 12-inch";

// ---------- 8.3 wafer milestones (F8.03) ----------
export type Product = "bulk" | "thin";
export interface WaferMs { date: string; t: string; sizes: number[]; label: string; product: Product; g: string; r: string; reported?: boolean }
export const WAFER_MS: WaferMs[] = [
  { date: "2020-08", t: "Wafer-scale TFLN PICs, 0.27 dB/cm, DUV lithography", sizes: [100, 150], label: "4\" and 6\"", product: "thin", g: "reported", r: "r:luke2020", reported: true },
  { date: "2023-09", t: "Anpai 8-inch TFLN line completed (reporter claim)", sizes: [200], label: "8\"", product: "thin", g: "T", r: "r:r09-s30" },
  { date: "2024-03", t: "Jiufengshan Lab: first 8-inch Si-photonic TFLN wafer (reporter claim)", sizes: [200], label: "8\"", product: "thin", g: "T", r: "r:r09-s30" },
  { date: "2025", t: "4-inch TFLN on quartz, > 110 GHz, VπL 2.92 V cm, 50% yield", sizes: [100], label: "4\"", product: "thin", g: "reported", r: "r:liu2025lam", reported: true },
  { date: "2025-06", t: "Soitec 150 mm LNOI to CCRAFT; 200 mm shown", sizes: [150, 200], label: "6\" / 8\"", product: "thin", g: "T", r: "r:opticsorg-2025-06-25" },
  { date: "2025-06-09", t: "CHIPX first 6-inch TFLN wafer", sizes: [150], label: "6\"", product: "thin", g: "T", r: "r:r09-s29" },
  { date: "2026-01-19", t: "Ligentec + X-FAB TFLN-on-SiN / SOI", sizes: [200], label: "200 mm", product: "thin", g: "F", r: "r:xfab-2026-01-19" },
  { date: "2026-03", t: "TFLN modulators on 200 mm Si in a BEOL CMOS foundry; 1.87 V cm best on wafer map; chip bandwidth 93-110 GHz (OFC 2026 W1A.3)", sizes: [200], label: "200 mm", product: "thin", g: "reported", r: "r:ofc2026-w1a3", reported: true },
  { date: "2026-03", t: "HyperLight + UMC / Wavetek volume production", sizes: [150, 200], label: "6\" / 8\"", product: "thin", g: "T/C", r: "r:r09-s19" },
  { date: "2026-06-03", t: "TDG Holding states 8-inch LN in mass production", sizes: [200], label: "8\" bulk LN", product: "bulk", g: "F (statement)", r: "r:tdg2026ir" },
  { date: "undated", t: "NanoLN lists LNOI and LTOI at 3, 4, 6, 8 inch", sizes: [76.2, 100, 150, 200], label: "3\"-8\"", product: "thin", g: "F", r: "r:nanoln-products" },
  { date: "undated", t: "12-inch optical-grade LN wafer \"prepared\" (TDG, secondary, unsourced)", sizes: [300], label: "12\"", product: "bulk", g: "LG", r: "r:r09-s9" },
];

// ---------- 8.3 lane-rate milestones (F8.04) ----------
export interface LaneMs { date: string; year: number; t: string; g: string; r: string; research: boolean; tag?: string; gbd?: number }
export const LANE_MS: LaneMs[] = [
  { date: "2018", year: 2018, t: "100 GBd OOK, 112 Gb/s PAM4, hybrid Si-LN MZM (research; He et al. 2019)", g: "reported", r: "r:he2019np", research: true },
  { date: "2022", year: 2022, t: "128 GBd PAM16, net 400 Gb/s IM/DD with a TFLN MZM (research)", g: "reported", r: "r:berikaa2022", research: true },
  { date: "2025-04-07", year: 2025.27, t: "AFR: TFLN 130 GBd CDM in volume shipment; 400 Gb/s/lane PAM4 TFLN chip debut", g: "F/V", r: "r:afr-2025-04-07", research: false, tag: "130 GBd CDM volume shipment" },
  { date: "2025", year: 2025, t: "440 GBd single-wavelength PS-16-ASK through a TFLN modulator (research; outside the atlas sample)", g: "reported", r: "r:deakin2025ofc", research: true },
  { date: "2026-03", year: 2026.2, t: "420 Gb/s/lane O-band PAM4 TOSA on TFLN, 210 GBd (OFC 2026 W4J.4)", g: "reported", r: "r:ofc2026-w4j4", research: true },
  { date: "2026-03", year: 2026.2, t: "768 Gb/s line rate on a TFLT MZM (OFC 2026 Th4A.2, postdeadline)", g: "reported", r: "r:ofc2026-th4a2", research: true },
  { date: "2026-03-17", year: 2026.21, t: "HyperLight 1.6T-DR8 TFLN reference transceiver, 20 W", g: "F/V", r: "r:bwchina-2026-03-17", research: false, tag: "1.6T reference transceiver" },
  { date: "2026-06", year: 2026.45, t: "HyperLight: 200 G/lane products available, 400 G/lane sampling", g: "V", r: "r:r09-s18", research: false, tag: "200 G/lane available, 400 G/lane sampling" },
];

// ---------- 8.5 OFC 2026 (F8.06) ----------
export const THEMES = ["400G/lane IM/DD", "Manufacturing", "Co-design with electronics", "Beyond C band", "TFLT"] as const;
export type Theme = (typeof THEMES)[number];
export interface Ofc { code: string; pd: boolean; title: string; aff: string; claim: string; atlas: string; doi: string; r: string; themes: Theme[] }
/** Rows of manuscript 8.5; theme tags from research note R04 sec. 3.3 (themes 1-5) plus the material (TFLT). */
export const OFC: Ofc[] = [
  { code: "Th4A.2", pd: true, title: "C-band 110 GHz TFLT modulator, 768 (536) Gb/s", aff: "U. Michigan; Nokia Bell Labs", claim: "Vπ 1.35 V, > 110 GHz", atlas: "xu2026b-a", doi: "10.1364/ofc.2026.th4a.2", r: "r:ofc2026-th4a2", themes: ["400G/lane IM/DD", "TFLT"] },
  { code: "Th4A.5", pd: true, title: "Integrated 1064 nm transmitter, GaAs lasers + > 100 GHz TFLN", aff: "Nexus Photonics; Northeastern U.; Keysight", claim: "100 Gb/s NRZ, 160 Gb/s PAM4", atlas: "shen2026-a", doi: "10.1364/ofc.2026.th4a.5", r: "r:ofc2026-th4a5", themes: ["Beyond C band"] },
  { code: "Th4A.6", pd: true, title: "TFLN wafer-level co-packaged optics engine", aff: "Shanghai Jiao Tong U.", claim: "TFLN EOM + driver EIC, > 100 GHz", atlas: "huang2026-a", doi: "10.1364/ofc.2026.th4a.6", r: "r:ofc2026-th4a6", themes: ["Co-design with electronics"] },
  { code: "Th4B.2", pd: true, title: "Driver-less 448 Gb/s PAM4 and 1.2 Tb/s 16-QAM, TFLN optical DACs", aff: "McGill U.; HyperLight; Ciena", claim: "driven from CMOS logic", atlas: "starnault2026-a/b", doi: "10.1364/ofc.2026.th4b.2", r: "r:ofc2026-th4b2", themes: ["400G/lane IM/DD", "Co-design with electronics"] },
  { code: "W4J.4", pd: false, title: "420 Gb/s/lane O-band PAM4 TOSA on TFLN", aff: "Wuhan HG Genuine Optics", claim: "210 GBd", atlas: "yu2026-a", doi: "10.1364/ofc.2026.w4j.4", r: "r:ofc2026-w4j4", themes: ["400G/lane IM/DD", "Co-design with electronics", "Beyond C band"] },
  { code: "Th1C.3", pd: false, title: "400G/lane for linear-drive optics", aff: "Ligent Technologies", claim: "TFLN MZM + CTLE; fab Liobate", atlas: "zhou2026-a", doi: "10.1364/ofc.2026.th1c.3", r: "r:ofc2026-th1c3", themes: ["400G/lane IM/DD", "Co-design with electronics"] },
  { code: "M4D.4", pd: false, title: "Truly differential drive of a TFLN TWE-MZM by a linear SiGe driver", aff: "Nokia Bell Labs", claim: "140 GBd PAM8, 1.4 pJ/bit", atlas: "aimone2026-a", doi: "10.1364/ofc.2026.m4d.4", r: "r:ofc2026-m4d4", themes: ["Co-design with electronics"] },
  { code: "W1A.3", pd: false, title: "TFLN on 200 mm Si, 110 GHz, 1.9 V cm", aff: "NSTIC (Singapore)", claim: "BEOL CMOS foundry", atlas: "zhang2026b", doi: "10.1364/ofc.2026.w1a.3", r: "r:ofc2026-w1a3", themes: ["Manufacturing"] },
  { code: "Th1D.1", pd: false, title: "TFLN + hydrogen-free SiN on 200 mm SiPh", aff: "IME; NSTIC; NUS", claim: "die-to-wafer bonding; MZI 2.9 V cm", atlas: "tobing2026-a", doi: "10.1364/ofc.2026.th1d.1", r: "r:ofc2026-th1d1", themes: ["Manufacturing"] },
  { code: "W1A.4", pd: false, title: "Sub-V 110 GHz O-band TFLT MZM", aff: "U. Michigan", claim: "Vπ 1 V (10 Hz-10 kHz)", atlas: "xu2026a-a", doi: "10.1364/ofc.2026.w1a.4", r: "r:ofc2026-w1a4", themes: ["Beyond C band", "TFLT"] },
  { code: "W1A.5", pd: false, title: "LT-on-fused-silica MZM, 4-inch wafer", aff: "EPFL; KIT", claim: "67 GHz, 1.6 V", atlas: "li2026a-a", doi: "10.1364/ofc.2026.w1a.5", r: "r:ofc2026-w1a5", themes: ["400G/lane IM/DD", "Manufacturing", "TFLT"] },
  { code: "W1A.6", pd: false, title: "Ring-assisted MZM on LT-on-SiN", aff: "LIGENTEC; UC San Diego", claim: "1.36 V cm, > 50 GHz, wafer scale", atlas: "valdez2026-a", doi: "10.1364/ofc.2026.w1a.6", r: "r:ofc2026-w1a6", themes: ["Manufacturing", "TFLT"] },
  { code: "W1A.7", pd: false, title: "1.6 Tb/s WDM IM/DD transmitter on TFLT", aff: "EPFL; KIT; SIMIT", claim: "8 channels", atlas: "hulyal2026-a", doi: "10.1364/ofc.2026.w1a.7", r: "r:ofc2026-w1a7", themes: ["400G/lane IM/DD", "TFLT"] },
  { code: "W1A.1", pd: false, title: "Integrated EO frequency-domain equalizer (TFLN TW modulators)", aff: "NICT; Sumitomo Osaka Cement; Nagoya Inst. Tech.; Waseda", claim: "equalizer integrated", atlas: "yamaguchi2026", doi: "10.1364/ofc.2026.w1a.1", r: "r:ofc2026-w1a1", themes: [] },
  { code: "Th1H.4", pd: false, title: "Hybrid calcium titanate + TFLN modulator", aff: "Chongqing U.", claim: "1.3 V cm, > 110 GHz, 0.86 dB IL", atlas: "su2026-a", doi: "10.1364/ofc.2026.th1h.4", r: "r:ofc2026-th1h4", themes: [] },
];

// ---------- 8.6 market (F8.07) ----------
export interface Mkt { pub: string; date: string; def: string; base: [number, number] | [number, number, number] | null; baseYear: number | null; fc: [number, number] | number | null; fcYear: number | null; cagr: string; g: string; r: string; cur: "USD" | "CNY"; note?: string }
/** Values in US$ M (or CNY M for Zhiyan). Ranges [lo, hi] where the source gives a range ("Other teasers"). */
export const MARKET: Mkt[] = [
  { pub: "Valuates Reports", date: "2025-04-04", def: "TFLN modulator", base: [356, 356], baseYear: 2024, fc: 3829, fcYear: 2031, cagr: "41.0%", g: "LG", r: "r:mkt-valuates", cur: "USD" },
  { pub: "24marketreports", date: "2025-09-12", def: "TFLN modulator", base: [476, 476], baseYear: 2024, fc: 1219, fcYear: 2030, cagr: "17.0%", g: "LG", r: "r:mkt-24mr", cur: "USD", note: "player list names AVANEX (defunct)" },
  { pub: "Intel Market Research", date: "2026-08-16", def: "TFLN modulator", base: [73, 73], baseYear: 2025, fc: 2510, fcYear: 2034, cagr: "48%", g: "LG", r: "r:mkt-intel", cur: "USD", note: "player list names NeoPhotonics (acquired by Lumentum in 2022) and \"II-VI Photonics Division\"" },
  { pub: "QYResearch (snippet)", date: "undated", def: "TFLN modulator", base: [137, 137], baseYear: 2024, fc: 317, fcYear: 2031, cagr: "12.2%", g: "LG/C", r: "r:mkt-qyr", cur: "USD" },
  { pub: "QYResearch, another edition (via DRI, snippet)", date: "undated", def: "TFLN modulator", base: [82.61, 82.61], baseYear: 2025, fc: 2485.55, fcYear: 2034, cagr: "N/A", g: "LG/C", r: "r:mkt-qyr-dri", cur: "USD" },
  { pub: "Astute Analytica, \"TFLN devices\"", date: "2025-07-07", def: "TFLN devices", base: null, baseYear: null, fc: 3190, fcYear: 2033, cagr: "N/A", g: "LG/C", r: "r:mkt-astute", cur: "USD" },
  { pub: "QYResearch (LN single crystal)", date: "undated", def: "Bulk LN crystal / wafer", base: [197, 197], baseYear: 2024, fc: 386, fcYear: 2031, cagr: "10.6%", g: "LG/C", r: "r:mkt-qyr-crystal", cur: "USD" },
  { pub: "Dataintelo", date: "undated", def: "Bulk LN crystal / wafer", base: [192, 192], baseYear: 2024, fc: 352, fcYear: 2032, cagr: "7.8%", g: "LG/C", r: "r:mkt-dataintelo", cur: "USD", note: "values \"about\"" },
  { pub: "Other teasers (unnamed in snippet)", date: "undated", def: "Bulk LN crystal / wafer", base: [133, 140], baseYear: 2024, fc: [160, 173], fcYear: 2032, cagr: "N/A", g: "LG/C", r: "r:mkt-dataintelo", cur: "USD" },
  { pub: "Zhiyan Consulting (China only)", date: "2025-09-30", def: "China only", base: [454, 454], baseYear: 2024, fc: null, fcYear: null, cagr: "+12.1% year on year", g: "LG", r: "r:mkt-zhiyan", cur: "CNY" },
  { pub: "GII listing (scope unclear)", date: "undated", def: "Outlier", base: [4740, 4740], baseYear: 2024, fc: 7220, fcYear: 2030, cagr: "N/A", g: "LG/C", r: "r:mkt-gii", cur: "USD" },
];
export const RF_CONTEXT: Fact = { t: "RF filter market (Yole): US$7.3 B (2021), US$8.2 B (2025)", g: "C", r: "r:yole-rf" };

// ---------- 8.7 LN in your life (F8.08) ----------
export interface Life { n: number; obj: string; hook: string; caveat: string; g: string; r: string; icon: string; count?: { n: number; label: string } }
export const LIFE: Life[] = [
  { n: 1, obj: "Phone radio filters", icon: "phone", hook: "A 2018 count put more than 50 acoustic filters in a mid- to high-tier 4G phone, more than 70 expected with 5G; many sit on LN or its sibling LT.", caveat: "Most SAW filters use LT, not LN (inference from product pages, E). BAW filters use aluminum nitride, not LN (E, no primary source listed).", g: "F / T / E", r: "r:smm-ltln+shinetsu-lt+soitec-poi+mwj-2018", count: { n: 50, label: "> 50 filters (2018, 4G mid/high tier)" } },
  { n: 2, obj: "Wi-Fi, GPS, and 5G in one phone", icon: "antenna", hook: "Piezo-on-insulator filter wafers (LT and LN versions) are made for 5G, GNSS, and Wi-Fi coexistence.", caveat: "Soitec does not say which phones use them.", g: "F", r: "r:soitec-poi" },
  { n: 3, obj: "Internet and AI data centers", icon: "rack", hook: "LN modulators write data onto light in fiber links; thin-film LN chips drive 1.6 Tb/s reference transceivers.", caveat: "Silicon photonics and InP compete; TFLN market share is not public.", g: "F / V", r: "r:bwchina-2026-03-17+murata2026" },
  { n: 4, obj: "Navigation in aircraft, ships, satellites", icon: "gyro", hook: "Fiber-optic gyroscopes use LN integrated optical circuits to split and modulate light; Exail states over 25,000 FOGs sold.", caveat: "Vendor figure.", g: "F / V", r: "r:exail-ln" },
  { n: 5, obj: "Green laser light", icon: "beam", hook: "Periodically poled LN turns infrared laser light into green; used in Corning lasers for MicroVision pico-projectors (2010).", caveat: "Cheap green pointers are not claimed to use LN; no primary source found.", g: "T", r: "r:lfw-hecht-2010" },
  { n: 6, obj: "Quantum computers and links", icon: "qubit", hook: "Xanadu's Aurora system used TFLN chips; PPLN makes entangled photon pairs.", caveat: "PsiQuantum uses barium titanate, not LN.", g: "T / F", r: "r:r09-s53+optica-advr-2025" },
  { n: 7, obj: "AI photonic processors", icon: "cpu", hook: "Q.ANT builds TFLN-based photonic processors.", caveat: "Performance figures are vendor claims.", g: "T / V", r: "r:r09-s51" },
  { n: 8, obj: "Lasers in labs and factories", icon: "laser", hook: "LN Pockels cells and Q-switches switch laser pulses on and off.", caveat: "Catalog listing, not market data.", g: "F", r: "r:korth-ln" },
  { n: 9, obj: "LiDAR and sensing", icon: "lidar", hook: "TFLN IQ modulators are offered for FMCW LiDAR; LN modulators for distributed temperature sensing.", caveat: "Niche and industrial so far.", g: "V / F", r: "r:afr-2025-10-01+exail-ln" },
  { n: 10, obj: "The rock in the chip", icon: "rock", hook: "Nearly all niobium comes from Brazil; one 6-inch wafer holds about 26 g of it.", caveat: "Calculated, not measured.", g: "F / E", r: "r:usgs2026nb" },
];

// ---------- atlas stamp ----------
export const ATLAS = { repo: "https://github.com/jwt625/eo-modulator-atlas", commit: "eb97f961165a331599e8191c62e15b5a52ba1d51", date: "2026-10-20", fetched: "2026-10-25" };
export const PATLAS = { repo: "https://github.com/jwt625/photonics-atlas", commit: "26aa34093fde4b588cc92f5bf250ef58f74044a9", date: "2026-10-23", fetched: "2026-10-25" };
