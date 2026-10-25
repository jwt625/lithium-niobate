# Audit E: physics and provenance of built chapters (2026-10-25)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Auditor | Fresh-context subagent (Claude Code); no prior conversation context; read-only except this file |
| Scope | /sound/ (7 sections), /quirks/ (10), /making/ (12 incl. process viewer), /devices/ (13 incl. records), /history/, /industry/ (8), /lab/ (2), /data/ (3), /library/, /colophon/, landing, /light/pockels-effect/ (65 pages) |
| Rules | DevLog-004 "Rules for all lanes" 3 and 7 (no fabricated data; every number sourced with a status; U never shown as fact; licenses recorded); physics correctness |
| Method | (1) `node --test src/lib/physics/`: 253/253 pass. (2) Rendered HTML of all 65 pages from the dev server (port 47614), converted to text with badges inline. (3) Independent recomputation in scratch scripts (numpy, uv): Kushibiki 1999 constitutive conversions, Christoffel velocities with stiffening over the full sphere, Zelmon/Jundt indices, QPM periods, dn/dT, photorefractive and pyroelectric numbers, Maxwell-Wagner, traveling-wave limits, SHG, ring, OPO, Nb mass, Hsu 1997 bond lengths, conoscope retardance. (4) Headless Chrome sweep: every `data-pop` key on every page (1,174 keys) focused and the popup read back; every failure re-checked by hover in TECH and VISUAL and by querying the popup registry. (5) Crossref REST, no mailto, 2 s spacing: 18 DOIs. (6) Wikimedia Commons extmetadata API: 8 history images. (7) Joins: records page vs src/lib/generated/records.json; landing and chapter statuses vs src/lib/generated/properties.json and chapter refs.yaml. |
| Caveat | Other lanes edited files during the audit; the dev server returned HTTP 500 for about 15 min and some pages changed between the first fetch (about 03:10) and the re-check (03:54). Every finding below was re-confirmed on the 03:54 state unless marked resolved. |

## Verdict

**Physics: pass.** No critical or major physics error found. Of about 110 displayed numbers and 25 equations recomputed or traced, all reproduce to the printed precision except one display readout that uses a first-order approximation (E05, 6% low). Signs, Voigt factors, IEEE 176-1987 frame statements, push-pull conventions and the clamped/free distinction are handled correctly and consistently.

**Provenance: pass with fixes.** 1,174 popup keys checked: after re-checks, 5 visible source badges on 2 industry pages and 3 source badges in the shared quirks ring figure do not open a source (E01, E02). Every other sampled number carries a badge whose popup names a source with DOI/URL or a derived/template explanation. No U value is shown as fact. All 18 DOIs resolve with matching metadata. All 8 history image licenses match Commons; CC BY 2.0 credits lack a license link (E13).

Counts: 0 critical, 2 major, 15 minor; 2 items resolved by other lanes during the audit (R1, R2).

## Findings

| ID | Severity | Page / file:line | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| E01 | major | /industry/ (lede and 8.7 row, 4 badges), /industry/who-makes-it/ (1 badge); src/routes/industry/+page.svelte:31, src/routes/industry/who-makes-it/+page.svelte:28, src/lib/figures/industry/pops8.ts:16 | Composite source keys `r:smm-ltln+shinetsu-lt+soitec-poi` and `r:smm-ltln+shinetsu-lt` are hard-coded in markup, but `useChapterPops` registers composite keys only when they occur in the `data` argument. Hover shows nothing: the E-grade claim "LT appears to dominate SAW filters" and the F-grade crystal-grower claim have no reachable source. | Hover in TECH: popup empty; registry query: key absent. Same pattern resolves on /industry/in-your-life/ where the keys come from data. | Pass these keys in `extra` or collect keys from the page's static markup; add an e2e check that every visible `[data-pop]` opens a popup. |
| E02 | major | /quirks/thin-film-photorefraction/ and /quirks/thermal-effects/, fig-04-04; src/lib/figures/quirks/F04Ring.svelte:124-127, :171 | `Src` badges for weis1985 and moretti2005 (4.3) and weis1985 and xu2021oe (4.8) point to ref ids not registered on the host page, so these badges open no popup. | Focus sweep and hover: empty popup for r:weis1985, r:moretti2005 on 4.3; r:weis1985, r:xu2021oe on 4.8; the same figure's r:lin2021 and r:schwesyg2011 resolve. | Register the figure's own refs with the figure (or merge chapter refs on every quirks page). |
| E03 | minor | /quirks/damage-thresholds/ table and ladder; content/chapters/04-quirks/manuscript.md:257 | Row "Coloration (dark trace, GRIIRA), about 100 MW/cm^2" puts GRIIRA on the 100 MW/cm^2 pulsed rung. On 4.4 the same site gives GRIIRA at 2.5 kW/cm^2 cw 532 nm pump and says it decays instantly; the 100 MW/cm^2 value (volk2008 p. 51) is for the gray trace after repeated IR pulses. | 4.4 table "532 nm pump at 2.5 kW/cm2 ... decays practically instantly". | Relabel the rung "gray (dark) trace"; if GRIIRA appears on the ladder, place it at the 2.5 kW/cm^2 measurement condition. |
| E04 | minor | /quirks/photorefraction/ L2; content/chapters/04-quirks/manuscript.md:54 | "beta_113 drives a current that oscillates along the beam with period l_c = lambda/(2 abs(n_e - n_o))". The o-e cross term varies as cos(Delta k z), whose period is lambda/abs(n_e - n_o); lambda/(2 Delta n) is the half-period (coherence length). | Delta n(532 nm) = 0.0896 (Zelmon): lambda/(2 Delta n) = 5.6 lambda, lambda/Delta n = 11 lambda. volk2008 p. 53 not re-read here. | Check p. 53; either call l_c a coherence length or use lambda/abs(n_e - n_o) and "about 11 lambda". |
| E05 | minor | landing Fig. 0 HUD "Retardation at NA edge 3.08 um at 550 nm"; src/lib/figures/visual/bench.ts:62-69, src/routes/+page.svelte:209 | The readout uses the first-order formula d(no - ne) sin^2(theta)/cos(theta); the resting conoscope image uses the exact model. Exact value for 0.60 mm, NA 0.55, 550 nm: 3.27 um (+6%). conoscope.ts:7 already states the 6% error of the weak model. | Recomputed with exact kz for o and e waves, Zelmon CLN at 550 nm. | Compute the HUD with `zcutRetardanceExact` (crystaloptics.ts:99) or label it first-order. |
| E06 | minor | content/chapters/05-making/process-flow.yaml:72-74; src/lib/scenes/generated/scene-data.ts:805-811; content/chapters/05-making/figures.md:81, :101 | F05-02 melt: data and spec claim the melt colour is "derived" from a Planck spectrum at T_melt through the CIE pipeline ("incandescent", "meniscus glow"). No such computation exists (no Planck/blackbody code in src/); FigCz draws a hatched melt labelled template and the process viewer uses a fixed CSS colour. Not displayed to readers, but a "derived" status on an unimplemented value is in the published scene data. | grep for planck/blackbody in src: only the generated scene-data string; FigCz.svelte:102-111; making.css:211. DevLog-006a:51 lists the blackbody export as open. | Set status to template ("display colour, not computed") until the pipeline exists. |
| E07 | minor | /making/thin-film/ F05-05; src/lib/figures/making/FigSlice.svelte:53, :101 vs :15 | Same value (He+ 195 keV, Rp 0.68 um, guarino2007) carries "reported" in the readout and caption and "P" in the step list and L2 table (manuscript:244-245 "P (arXiv)"). The value itself is sourced: guarino2007 (doi:10.1038/nphoton.2007.93) full arXiv text read. | Rendered page: 3 "reported" badges and 3 "P" badges on src:guarino / mk55:4. | Use one status (P, locator arXiv:0705.2392v1). |
| E08 | minor | /industry/rock-to-chip/ L3; src/routes/industry/rock-to-chip/+page.svelte:59; content/chapters/08-industry/manuscript.md:71 | "Congruent LiNbO3, molar mass 147.84 g/mol" is the stoichiometric formula mass. Congruent Li_{1-5x}Nb_{1+x}O3 with [Li]/[Nb] = 0.94 gives 148.43 g/mol and w_Nb = 63.2% (25.9 g vs 25.8 g Nb per 6-inch wafer, +0.6%). The headline "about 26 g" is unaffected. | Recomputed with the Li-vacancy model and the site's own [Li]/[Nb] = 0.94 (5.2 table). | Say "formula LiNbO3" or use the congruent formula. |
| E09 | minor | /devices/records/ row 2 and row 6; src/lib/figures/devices/records.ts:9-10; data/records.yaml (loss-q-gao2022) | (a) Gao 2022: page "Q > 10^8", dataset value_text "Q ~1e8"; the Crossref title says "above 10^8", so the page is right and the dataset qualifier is stale. (b) Shen LPR 19, 2401092 is cited as 2024 on /devices/records/ and as shen2025-a on /devices/tradeoffs/; Crossref: online 2024-10-12, print 2025-04. (c) Shen 2024 and Xu OFC 2026 Th4A.2 rows are not in records.json (disclosed with "–"). | Crossref records w2, w16; records.json join by DOI (18 of 20 rows matched; dates, DOIs and values otherwise identical). | Fix the dataset qualifier; state one date convention (online or issue); add the two rows to the dataset. |
| E10 | minor | /light/pockels-effect/ "V_pi 2.90 V ... reported"; src/lib/content/pops-pockels.ts:10 | The li2026aa popup gives "devices.csv row li2026aa-d; paper p.5 Fig. 3(b)" but no DOI or citation of the paper; /devices/modulators/ gives doi:10.1038/s41467-025-67902-2 for the same row. | Crossref: Li et al., Nat. Commun. 17, 1138 (2026), online 2026-01-08. | Add the citation and DOI to the pockels popup. |
| E11 | minor | /quirks/pyroelectricity/ derived table | (a) "Delta n_e per kelvin 2.5e-5 / 5.9e-5" and the figure's 5.6e-3 at 95 K use r33T = 32.2 pm/V (free, appropriate for a static field), but the badge line lists only ne and dne/dT; the r33 value and status are not shown. (b) The IEEE 176 sign-convention badge is P-comp here and P on every other page. | 0.5 x 2.1376^3 x 32.2e-12 x 1.574e5 = 2.47e-5; with 30.8 pm/V it would be 2.37e-5. | Add "r33T 32.2 pm/V (P-comp, weis1985)" to the figure provenance; make the ieee176 status P. |
| E12 | minor | fig-04-04 on /quirks/thin-film-photorefraction/ and /quirks/thermal-effects/; F04Ring.svelte:124-125 | (a) "ne 2.1376" is attributed to weis1985 (P-comp); it is the Zelmon 1997 value at 1550 nm (Weis lists 633 and 1060 nm only). (b) "dne/dT 1550 nm: Jundt 1997 Sellmeier, derived" hides that the Jundt coefficients are an S transcription (constants.ts JUNDT_CLN_E, isDefault false). | properties.json: refractive-index-e/cln/zelmon1997-1550nm = 2.1376; weis1985 rows at 632.8 and 1060 nm. | Badge ne as P-db zelmon1997; show the S status of the Jundt input next to "derived". |
| E13 | minor | /history/ "Image credits"; src/lib/figures/history/data.ts:43, :45 | Two CC BY 2.0 images (hatchett.jpg, ashkin.jpg) are credited with author, license name and file page, but without a link to the license (CC BY 2.0 sec. 4b requires the license URI with each copy). Licenses themselves match Commons for all 8 files. | Commons extmetadata 2026-10-25: Hatchett cc-by-2.0 (Wellcome Collection, AttributionRequired true); Ashkin cc-by-2.0 (Bengt Nyman); the other 6 pd/cc0 as credited. No creativecommons.org link in history.html. | Link "CC BY 2.0" to https://creativecommons.org/licenses/by/2.0/ in the credits table and image popups. |
| E14 | minor | site-wide | Status vocabulary drift beyond the rule-3 list and the colophon key: "practitioner", "hypothesis", "reported (title)", "reported (arXiv abstract)", "P(title)", "P, LT", "V/S", "P/V", "derived from V", "derived (flag)", "S (hypothesis)", industry F/E/T grades. Blog notes are U on /making/patterning/ and /making/packaging/ but "practitioner" on /quirks/fabrication-pitfalls/. The /industry/ footer status key lists only V and derived although the page uses E and F (explained only in its L3 table). | Rendered badges; colophon status key. | Publish one status table that includes the qualified forms and the industry grades; use one code for practitioner notes. |
| E15 | minor | VISUAL mode, /quirks/griira/, /quirks/thermal-effects/, /quirks/thin-film-photorefraction/; F05Griira.svelte:156, F04Ring.svelte:171 | `data-pop="v-false"` ("false color") opens nothing on quirks pages; the entry exists only in pops-pockels.ts. | VISUAL-mode hover: empty popup on /quirks/griira/. | Move v-false to shell popups. |
| E16 | minor | /library/ (8 entries), /making/bulk-waveguides/ and /making/wafers/ popups, /lab/ table | Double-escaped entities render literally: "Laser &amp; Photonics Reviews", "Light: Science &amp; Applications", "&ndash;". | `&amp;amp;` and `&amp;ndash;` in the rendered HTML. | Escape once (Crossref titles already contain `&amp;`). |
| E17 | minor | /quirks/photorefraction/ L2 vs volk2008 p. 159 | Self-declared conflict: computed dark relaxation 6.9 h to 29 d vs "5 to 500 days" printed on p. 159 for the same conductivity range. The computation is correct (28 x eps0 / 1e-14 to 1e-16 S/m); the conflict is correctly shown, not hidden. Listed for tracking only. | Recomputed: 2.48e4 s to 2.48e6 s. | Keep; resolve when p. 159 is re-read (different epsilon or sigma definition likely). |

Resolved during the audit by other lanes (confirmed at 03:54):

| ID | Item | State |
|---|---|---|
| R1 | Landing chapter table said "History 1949 to 2026, about 90 dated events" and "Not built" for built chapters; footer site map "(not built)" | Now "1801 to 2026", "160 dated events"; no "not built" strings on the landing (site.ts:165) |
| R2 | /quirks/pyroelectricity/ and /quirks/thermal-effects/ cited cti1999 as "Inc. 1999" | Now "Crystal Technology 1999" |

## Specific items requested

| Item | Result |
|---|---|
| 195 keV implant-range point on /making/ | Sourced. guarino2007 (Nat. Photon. 1, 407, doi:10.1038/nphoton.2007.93; refs.yaml read: full arXiv:0705.2392v1 text): He+ 195 keV, 4e16 cm^-2, holder 100 C, density peak 0.68 um. The range curve elsewhere is correctly "no verified data / SRIM run needed". Only issue: mixed status P vs reported (E07). |
| "1801" start in history | Correct. Event h-1801-hatchett-columbium: paper read to the Royal Society 1801-11-26, printed Phil. Trans. 92, 49-66 (1802); Crossref confirms doi:10.1098/rstl.1802.0005, vol. 92, pp. 49-66; naming sentence quoted with page (p. 65). Status V. |
| Nb mass card (/industry/, in-your-life card 10, rock-to-chip F8.11) | Arithmetic correct: V = 8.836 cm^3, m = 41.02 g LN, 25.78 g Nb, 13.32 g O, 1.93 g Li; 200 mm: 72.9 g, 45.8 g Nb; 2.1 M wafers x 25.78 g = 54.1 t = 0.0483% of 112,000 t; Brazil 104,000 t (93%) per refs.yaml USGS MCS 2026 note. Labelled E (estimate) with inputs badged. Minor wording issue E08. |
| F05-02 melt rendering | FigCz draws the melt hatched and labels melt, crucible, afterheater as template; L(t), t, mass, Tc fits all correct. The unimplemented "derived blackbody colour" claim lives in process-flow.yaml and scene-data.ts (E06). |
| Records table vs records.json | 20 rows; 18 match records.json by DOI with identical value, date and platform text; 2 rows (Shen 2024, Xu OFC 2026) are not in the dataset and are shown with "–". Discrepancies: Gao 2022 qualifier, Shen year (E09). Platform strings on the page are stricter than the dataset ("InP on TFLN" vs "TFLN" for Xie 2025), consistent with the page's stated rule. |

## Crossref spot checks (18 DOIs, all resolve; metadata matches the site's citation)

| DOI | Crossref title (abridged), venue, date | Site use |
|---|---|---|
| 10.1364/JOSAB.616304 | correction to 10.1364/josab.14.003319, JOSA B 43(11) 2788, online 2026-10-22 | Zelmon MgO o/e erratum (constants.ts) |
| 10.1002/lpor.202401092 | "Slow-light MZM achieving 0.21 V cm", LPR 19, online 2024-10-12, print 2025-04 | records row 6 (E09) |
| 10.1364/ofc.2026.th4a.2 | "C-band 110-GHz TFLT modulator, 768 (536) Gbit/s", OFC 2026 | records row 10 |
| 10.1002/lpor.71753 | "Er-doped LNOI amplifier with 28 dB fiber-to-fiber net gain", LPR, 2026-08-17 | records row 20 |
| 10.1038/s41467-026-68524-y | "Milliwatt-level UV generation using sidewall poled LN", Nat. Commun. 17, 3651 (2026) | records dataset |
| 10.3390/photonics13040339 | "Low-frequency time-domain response of TFLN EO modulator", Photonics 13, 339 (2026) | 4.7 RC fits 11.9 ms / 88.6 us |
| 10.1364/prj.521172 | "Twenty-nine million intrinsic Q", Photon. Res. 12, A63, online 2024-07-26 | records row 1 |
| 10.1364/oe.572384 | "0.33 V cm thin-film ...", Opt. Express 33, 41353 (2025-09-22) | records row 7 |
| 10.1038/s41377-025-01821-1 | "3.584 Tbps coherent receiver on InP-LiNbO3", LSA 14, 172 (2025-04-25) | records row 19 |
| 10.1063/1.94946 | Bryan, Gerson, Tomaschke, APL 44, 847 (1984) | MgO threshold |
| 10.1109/58.796136 | Kushibiki et al., IEEE TUFFC 46, 1315 (1999) | acoustic constant set |
| 10.1063/1.1754607 | Ashkin et al., APL 9, 72 (1966) | optical damage |
| 10.1080/00150197908239450 | Kukhtarev et al., Ferroelectrics 22, 949, issued 1978-01 | band-transport model ("Crossref 1978, often cited 1979" is correct) |
| 10.1364/ofc.2025.th4b.7 | "440-GBaud all-electronic signaling", OFC 2025 PDP | records row 8 |
| 10.1117/1.APN.3.6.066009 | "Highly efficient SHG in a double-layer TFLN waveguide", APN 3 (2024-11-07) | records row 11 |
| 10.3788/col202220.011902 | "LN microring with ultra-high Q factor above 10^8", COL 20, 011902 (2022) | records row 2 |
| 10.1038/s41467-025-67902-2 | Li et al., "Ultra-broadband near- to mid-IR EO modulator on TFLN", Nat. Commun. 17, 1138 (2026) | li2026aa-d (E10) |
| 10.1098/rstl.1802.0005 | Hatchett, Phil. Trans. 92, 49-66 | 1801 event |

## Verified correct (recomputed or traced)

Sound (Kushibiki 1999 set, IEEE 176-1987 frame)
- d = e sE: d15 66.38, d22 20.30, d31 -1.037, d33 8.690, d16 = -2 d22 = -40.60 pC/N; dh = 2 d31 + d33 = 6.62 pC/N (+4.9% vs 6.31 measured); d33 implied by dh = 8.0 to 8.4 pC/N.
- eps_T = eps_S + d e^t: 83.34, 28.48; g15 0.0900, g22 0.0275, g33 0.0345 V m/N; h15 9.19, h22 6.05, h33 8.01 x 1e9 V/m; c33D 249.35, c44D 93.45 GPa.
- kt 0.247 (kt^2 0.061), k15 0.600, k33 0.243, k31 -0.027, longitudinal Y 0.309.
- dL(n) = d33 c^3 + (d31 + d15) c s^2 - d22 s^3 sin 3phi derived from d_ijk (factor-2 shear convention correct); |dL|max 38.80 pC/N at theta 118.9 deg (equivalently +38.8 at 61.1 deg), dL(+Y) = +d22.
- 3m e, d, c, p matrix patterns, convention-of-2s table, c66/s66, e16/d16, c56/s56 checks; 180 deg about Z flips c14, e22, d22, p14, p41, r22; +Z sign rule and positive-on-cooling consistent with p3 < 0 and d33 > 0.
- Christoffel with stiffening: Z-L 7328.55, Z-S 3590.39, X-L 6544.61, Y-qL 6806.82, Y-S(x) 3940.60, X fast shear 4750.09, X slow shear 4028.96 m/s; bare Z-L 7102.07; range over all directions 3474 to 7357 m/s (both match the page).
- SAW: 128 deg Y-X 3978.4 m/s gives lambda = 3.978 um at 1 GHz; IDT p = 4 um gives f0 = 994.6 MHz; 2 GHz needs p = 1.989 um; first nulls f0(1 +/- 1/N); c/v = 75,000 to 88,000. Solver tests include the isotropic Rayleigh and Bleustein-Gulyaev closed forms (saw.test.ts:41, :55).
- AO: M1 6.64e-7, M3 1.01e-10 m s^2/kg (printed M3 exponent correctly flagged U), M4 63.0 from n 2.20, rho 4700, v 6570, p 0.287; Bragg Lambda 6.54 um and theta_B 6.8 deg in air at 1550 nm, 1 GHz; X-cut p'(45 deg) = 0.304 (Andrushchak), sign-pairing mirror 45/135 deg reproduced.
- Phononics: hf(2 GHz) = 8.3 ueV; n_th 3.1e3 (300 K), 6.8e-5 (10 mK); eta_m 9.9e-4 = -30.0 dB, eta_o 66% = -1.8 dB, eta_oc 65.2% = -1.9 dB, product 4.26e-4; 4C/(1 - C)^2 at C = 0.478 = +8.5 dB; red/blue sign assignment correct.

Light, Pockels (Turner 1966 clamped set)
- Delta n_e = -1/2 ne^3 r33 E = -1.504e-4 at 1 V/um; Delta phi/L = 0.6097 rad/mm; E L(pi) = 5.153 kV; r13 term delta n = -4.648e-5; 3m r-matrix rows.
- Engine VpiL = lambda/(2 abs(dnA - dnB)) = 2.697 V cm; textbook lambda g/(2 ne^3 r33 Gamma) = 3.238 V cm (Gamma 0.477, g 6 um); ratio about ne/neff = 1.21; measured 2.90 V x 0.9 cm = 2.61 V cm; eq. (4) derivation (Delta eps = -n^4 r E, P = neff/(2 Z0) integral abs(Ex)^2) correct.

Quirks
- Delta n sat 1.7e-4 to 1.7e-3 (ne 2.2028, r33T 32.2); tau_dark 6.9 h to 29 d; tau_light 0.25 to 2.5 s; E_dif 1.6e5 V/m at 1 um; figure state E_sat 2.8e6 V/m, tau 2.48 s / 2.87 d, dn_e -4.73e-4 after 10 s.
- Pyro: E per K 1.57 / 3.74 kV/cm (p3 4.0 / 9.5e-5, eps33T 28.7); Schwesyg 2.6 kV/cm per K; sigma_b 0.38 / 0.90 uC/cm^2 at 95 K; 15 / 36 MV/m; 7.5 / 17.8 kV across 0.5 mm; 9.0 / 21 V across 600 nm; Savage average 8.7e-5 C/(m^2 K); tau 2.94 d at 1e-15 S/m.
- Drift: two-layer V1(t) limits (capacitive at 0+, resistive at infinity, tau = (C1 + C2)/(G1 + G2)); sigma_eff 2.1e-8 and 2.8e-6 S/m from 11.9 ms and 88.6 us; ratio 2e6 to 3e10.
- Thermal: Jundt dne/dT 3.75 / 4.01 / 4.89e-5 /K at 1550 / 1064 / 633 nm; Moretti 4.12 and 0.37e-5 at 300 K; e/o ratio 5 to 11; thesis lens 61 mm; ring shift 20.2 pm/K.
- GRIIRA: band energies 1.60 / 1.0 / 2.50 eV from cm^-1; dDelta k/dT 173.4 rad/(m K) and Lambda 6.78 um (Jundt, 25 C); SHG_rel 0.731 at 1.10 K over 10 mm.
- Li out-diffusion slopes and Tc slopes as printed; damage-ladder values consistent with the MgO table (> 8000 kW/cm^2 = > 8 MW/cm^2).

Making
- Tc Bordui 1143.2 / 1145.9 / 1206.5 C at 48.38 / 48.45 / 50.0 mol%; Iyi 1141.5 C at 48.45; Bordui - Iyi = 4.5 C at 48.38.
- Boule: L = v t (82.5 mm at 1.5 mm/h, 55 h); body mass 7.05 kg (82.5 mm) and 9.40 kg (110 mm) at 4647 kg/m^3.
- CMP: removed 40 of 80 nm at 640 nm; implant recipe and split temperatures each with locator; range curve correctly withheld.

Devices
- VpiL = lambda g/(2 ne^3 r33 Gamma) = 2.58 V cm (Turner) and 2.75 V cm (Kaminow, +7%); aimone2026 3.26 V x 7.5 mm = 2.45 V cm.
- Ring: nu0/QL = 34 GHz (5,700), 10.7 GHz (18,000), 19.34 GHz and tau_ph 8.23 ps (10,000).
- Traveling wave: V(z) with load and source reflections; m(f) with u+- = alpha + j omega (nRF -+ ng)/c re-derived independently (the site's open question Q6.2 can be closed for the form); velocity limit x = 1.3916, f3dB L = 0.443 c/abs(nRF - ng); loss limit alpha L = 0.738 Np = 6.4 dB; chen2022-c 88.5 GHz and 317 GHz.
- SHG: Lambda = lambda/(2(n2w - nw)) = 18.99 um (1550) and 6.82 um (1064, Zelmon 21 C); eta L^2 = 416 %/W; P2w 1.576 mW at 20 mW; tanh^2(sqrt 2) = 79%; deff = (2/(m pi)) sin(m pi D) d33.
- OPO: Pth = hbar omega_p kappa_p^2 kappa_s kappa_i/(16 g^2 kappa_p,ex) re-derived from coupled-mode equations.
- Lab phase matching: Delta k 0.33088 rad/um, coherence length 9.495 um, FWHM 1.176 nm at 10 mm, type I o+o->e 49.55 deg.

Landing, data, colophon
- Hsu 1997 positions give Nb-O 1.876 / 2.130 A and Li-O 2.063 / 2.245 A; a, c, density, Tc, Tm, Ec, transparency, k = 3.92, r33 30.8 / 32.2 match properties.json defaults and their popups; 1 cm^3 = 4.643 g; q = 3.92 kW/m^2 for 1 K over 1 mm; ne - no = -0.0736 / -0.0766 / -0.0842; Delta n_ind = no^3 r22 E with r22 (free) 6.8 pm/V.
- Colophon counts: 36 test files, 85 page sources, 144 scalar + 49 tensor records, 7 dispersion models, 284 sources, 37 unverified claims (29 events + 3 records + 5 scalars).

Provenance sample (badge present, source resolves, status consistent with data/ or refs.yaml): the values above plus /data/ rows (bulk velocities P kushibiki1999 Table II, birefringence C zelmon1997), /industry/ F/E rows, all 20 records rows, 31 /devices/modulators/ keys, 250 /history/ keys (event, source and image popups resolve in their own mode), 5 U-badged statements on devices/making/quirks pages (all phrased as "not printed" or "as recorded in a blog note", none presented as fact), and template labels on every display parameter checked (Vpi/f3dB defaults, gap, Gamma, Kp, layer conductivities, alpha, kappa, crucible geometry).
