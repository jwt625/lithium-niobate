# 06 Devices: open questions

| Field | Value |
|---|---|
| As of | 2026-10-25 |
| Owner | C06 lane; items marked (author) need Wentao's decision, (PHY) the physics lane, (API) the data lane, (audit) a fresh-context check |

## Needs a decision

| # | Question | Why it matters | Proposed default |
|---|---|---|---|
| Q6.1 (author) | Data license for eo-modulator-atlas (no LICENSE file at commit `eb97f96`). | Charts A1-A7 republish atlas facts and derived views; a reuse license makes the site's atlas endpoints citable. | Facts with locators and attribution until a license is chosen; no CSV redistribution |
| Q6.5 (author) | Show the site author's co-authored papers (jiang2019optica, jiang2020nc, jiang2023np) with any mark? | DevLog-004 rule 8: published work may appear where it fits; no "my story". | No mark; cited by physics like every other paper |
| Q6.6 (author) | Atlas pin policy: stay at `eb97f96` or bump before launch? | Every count in manuscript 6.1-6.3 and chart acceptance checks is tied to the pin. | Stay pinned; bump only with a re-run of all acceptance counts |

## Physics lane (PHY)

| # | Item | Detail |
|---|---|---|
| Q6.2 | Traveling-wave response form | F6.04 uses the forward + reflected wave integral derived in manuscript 6.2 (matched-load limits verified analytically here: f_3dB L = 0.443 c / |n_RF - n_g|; 6.41 dB total loss). Check the impedance-mismatch terms (V+ with multiple reflections, Gamma_L term with u- = alpha + j omega (n_RF + n_g)/c) against Chung, Chang, Adler 1991 (10.1109/3.81370) before shipping. |
| Q6.3 | Function names | `modulator.ts`: mzmTransfer, vpiL, impliedOverlap, twResponse, eyeDiagram; `ring.ts`: allPassRing, ringFromQ, eoComb; nonlinear module: SHG depleted/undepleted, OPO threshold. Names are this chapter's proposal; PHY owns the final API. |
| Q6.4 | EO comb model source | F6.10 needs the resonant EO comb steady-state model with its assumptions; cite Zhang 2019 main text (10.1038/s41586-019-1008-7) or Parriaux 2020 (10.1364/AOP.382052) after reading. No formula is printed until then. |
| Q6.7 | r33 at 1550 nm | No primary 1550 nm r33 in the sources held (R06 gap 4, R14). V_pi L calculator uses 633 nm clamped values with a toggle (30.8 / 28.8 pm/V). |
| Q6.8 | SAW velocity for F6.12 | Needs a sourced velocity per cut from chapter 03 (Christoffel solver + kushibiki1999 constants). Until then the figure shows template values with a template badge. |

## Data lane (API)

| # | Item | Detail |
|---|---|---|
| Q6.9 | Records dataset | Seed `records` from manuscript 6.12 (20 rows: metric, value, unit, conditions, platform label, first author, venue, date, DOI, ver). |
| Q6.10 | Atlas build JSON | Path and endpoint names proposed in `../08-industry/chart-specs.md` sec. 1.1; API lane decides. |

## Facts still to verify (not printed as fact)

| # | Item | Status |
|---|---|---|
| Q6.11 | Wang 2018 Nature "V_pi 1.4 V" and "100 GHz" | main-text figures, not in abstract (R08) - not printed |
| Q6.12 | Nehra 2022 "11 dB inferred" squeezing | not in abstract - not printed |
| Q6.13 | Chen J.-Y. 2019 "230,000 %/W" ring SHG | unverified - not printed |
| Q6.14 | Zhang 2019 "80 nm" comb span | not in abstract - not printed |
| Q6.15 | Jiang 2023 "about 35% heralded efficiency" | secondary only - not printed |
| Q6.16 | LN n2 primary measurement | Zhu 2021 tabulates 1.8e-19 m^2/W; primary not traced (R08 sec. 2.8) - not printed |
| Q6.17 | LN acoustic figure of merit M2 | about 7e-15 s^3/kg (Uchida and Niizeki 1973), unverified - not printed |
| Q6.18 | TFLN acoustic resonator k^2 and f*Q records | not obtained (R08 sec. 2.10) - no record row |
| Q6.19 | Murata XBAR mass production 2025-07-08 | R08 cites an official release that names a "piezoelectric single-crystal thin film", not LN; URL not recorded in R08 - not printed in 6.9 |
| Q6.20 | Er:TFLN internal gain 38 dB (Wang, CLEO 2024, 10.1364/cleo_at.2024.atu4m.3) | R08 Y(conf); DOI not re-checked in this lane - quoted only in L3 as a non-comparable class |
| Q6.21 | 2024-2026 record coverage | R08 search budgets ran out; re-check measured EO bandwidth > 170 GHz, squeezing > 4.9 dB, OPO threshold < 19.6 uW, Er gain, TFLN transducers before calling any value a record (R08 sec. 7) |

## Corrections found in inputs (for the audit log)

| # | Input | Correction |
|---|---|---|
| C6.1 | R08 sec. 2.4, Chen P.-K. 2024 "104 %/W overall" | Lost superscript. arXiv 2307.11671 abstract: "overall second-harmonic efficiency near 10^4 %/W"; tanh^2 check gives 79% at 20 mW, matching "> 80% at 20 mW". Manuscript uses 10^4 %/W. R08 not edited (not owned by this lane). |
| C6.2 | R04 sec. 2.1 electrode counts | R04 lists tw_gsg 72, cl_twe 32 for TFLN; these are device-row counts (all-row counts are 76 and 37). Manuscript states the device-row filter. |
| C6.3 | R08 / lane C04 relay: 120 C DC-stable modulator result | Verified 2026-10-25 against arXiv 2604.27285 abstract: the platform is thin-film lithium tantalate (TFLT). Cited only as TFLT in 6.11; not in the records table. |
