# Chapter 05 open questions

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Lane | C05 |
| Rule | Nothing below is rendered as fact. Each item names what is missing, where it is used, and the best lead |

| # | Missing or conflicting | Used in | Current treatment | Lead |
|---|---|---|---|---|
| Q1 | Purity specifications of Li2CO3 and Nb2O5 for optical-grade growth; calcination temperature and time of the charge | 5.1; process-flow s01 | `na` | Volk and Woehlecke 2008 ch. 1; grower technical notes; Kong et al. Adv. Mater. 2020 (10.1002/adma.201806452) |
| Q2 | Production Cz details: crucible material, atmosphere, afterheater, seed orientation, cone angles, cooling rate | 5.2; F05-02; s02, s03 | template labels | Wang et al. CrystEngComm 22, 794 (2020) full text (paywalled); Ballman 1965 full text |
| Q3 | Single-domain poling of boules: field, temperature schedule, electrode method | 5.2; s04 | template procedure, U badge | Nassau, Levinstein, Loiacono, J. Phys. Chem. Solids 27, 989 (1966) full text |
| Q4 | Wafer flats (lengths, orientation vs +X/-X), TTV, bow, warp, LTV, roughness, orientation tolerance; reduced-LN process | 5.3; F05-03; s05 | not shown. Vendor listings seen only as search snippets (UniversityWafer: TTV < 3 um, bow +-30, warp < 40 um, LTV < 1 um over 5 x 5 mm, roughness < 0.5 nm, primary flats 22/32/42.5/57.5 mm; MTI: primary flat normal to +X, secondary 90 deg clockwise) are U | IEC 62276:2025 text; vendor PDF datasheets (MTI page returned HTTP 429 on 2026-10-25; retry later) |
| Q5 | Meaning of Jackel's "diffusion rate" in um^2/h (d^2/t or D with d = 2 sqrt(D t)) | 5.4; F05-04 | toggle with both conventions; activation energy 0.90 eV labelled template-grade | Jackel, Rice, Veselka APL 41, 607 (1982) full text |
| Q6 | Range and straggle of He+ and H+ in LiNbO3 vs energy (50-400 keV); energy used by commercial wafer makers for 600 nm films | 5.5; F05-05; s08 | reported points only; curve "SRIM pending" | Run SRIM-2013 (Ziegler 2010) with density 4647 kg/m^3, LiNbO3 stoichiometry, 7 deg tilt; store inputs and output table as `derived`. Check Jia, Wang, Chen, Appl. Phys. Rev. 8, 011307 (2021) for tabulated values |
| Q7 | CTE of Si handle and quartz handle (sourced) for the bonding-strain note | 5.5 L3 | Si value not stated | R06/R14 property lane, or a primary Si thermal-expansion reference |
| Q8 | DLC hardness unit conflict in Li et al. 2023 ("19-23 MPa" and "20 GPa" in the same section) | process-flow s13s | value kept with note | Supplementary Fig. 1 of li2023nc |
| Q9 | Packaged TFLN modulator: housing outline, fiber attach adhesive, hermeticity, RF connector | 5.11; F6 assets A11 | not shown | Public datasheets of commercial TFLN modulators (R09 list); grade V |
| Q10 | Public catalogue URL for Langrock 2007 dissertation | refs.yaml langrock2007 | cited without URL | Stanford SearchWorks / purl |
| Q11 | Bibliographic check of Preston 1927 (journal, volume, pages) | F05-06 | U bibliographic | Library catalogue of J. Soc. Glass Technol. |
| Q12 | Ar etch rate and beam voltage for the `strip_dlc` IBE step; SC-1 temperature and time; Si3N4 thickness | s16s, s17s, s13s | `na` | li2023nc Supplementary Information |
| Q13 | Etch rate, gas flows, and bias for the `ridge_duv` Ar ICP-RIE step (playback uses an analog rate from kaufmann2023) | s17r | analog | luke2020 cites its ref. [4] (Zhang 2017) for the etch; Zhang 2017 gives bias power 112 W only |
| Q14 | Facet preparation in the `ridge_duv` route; 2018 "diced and polished" recipe (R02 L9) not re-read in the published version | s21r; 5.11 | template / U | Wang et al. Opt. Express 26, 1547 (2018) published version (Optica site served an anti-bot page in R08) |
| Q15 | Published values recorded in the author's 2018 notes but absent from the arXiv versions read here: Krasnokutska 60 nm Cr and 1:7 selectivity; Wang 2018 OE a-Si 800 nm, KOH strip, 15 nm Ti / 300 nm Au; Zhang 2017 HSQ details; 45/75 deg sidewalls of Liang 2017 | 5.7 | U, not rendered | Published versions of each paper |
| Q16 | Curie temperature of near-SLN: 1206 C (Volk) vs 1213 C (secondary); Ps 80 vs 71 uC/cm^2; SLN coercive field 6.0-6.5 vs 4-5 kV/mm vs 2.1-2.5 kV/mm | 5.2 | shown as conflicts with both sources | R14 rows 12, 16, 19, 22; primary papers cited there |
| Q17 | Material-limited Q after anneal: 180 million (arXiv v1 of shamsansari2022) vs 1.6e8 (R08) | 5.7 table | both stated | Published APL Photonics 7, 081301 text |
| Q18 | Rabiei and Guenter 2004 implant energy (whether 195 keV, matching 680 nm) | 5.5 L3 | stated as unknown | APL 85, 4603 full text |
| Q19 | Thermal treatment that NanoLN or Soitec apply to commercial LNOI after splitting (process-flow s12) | s12 | `na` | Supplier application notes; Jia 2021 review |
| Q20 | Thin-film minimum domain-growth field 28.2 kV/mm quoted by chen2024materials from its ref. 20: original not read | 5.10; F05-10 | S | Ref. 20 of chen2024materials |

## Notes for the integration lane (P05) and F6

- `process-flow.yaml` is content, not a contract. The engine contract (R13 style) should be written by the engine lane and reviewed by the coordinator before the builder converts this file (R13 process recommendation).
- Overlaps to coordinate: F05-03 (cut explorer) with C01/C02 tensor rotation and the PHY lane; F05-10 (thin-film poling) with C01 (domains) and C02 (QPM); F05-11 (value chain) with C08 (industry). This chapter keeps the fabrication view; physics derivations live in their chapters.
- Analog values from LiTaO3 (wang2024nature) are kept only where no LN value with the same detail was found; replace them when LN sources appear.
