# 02 Light: open questions

Date: 2026-10-25. Numbered for reference from `manuscript.md` and `figures.md`. "Author" = needs Wentao's decision; "Source" = needs a document not held; "PHY/API" = needs another lane.

## Decisions for the author

1. **Default d scale (Author, Source).** No held source gives a post-1997 absolute d table. Options for F2-06/F2-08 defaults: (a) symbolic d33/d31/d22 with no default number (current spec); (b) Shoji 1997 values (25.2 pm/V claimed) shown with the U badge until the paper is read; (c) the Volk compilation (34 pm/V, legacy scale, P-comp). The choice changes every computed eta_norm by up to 1.85x. Shoji et al., JOSA B 14, 2268 (1997), doi:10.1364/JOSAB.14.002268, closes it.
2. **Coefficient set for the 2.2 engine and the r explorer default (Author).** The approved mockup uses Turner 1966 (r51 = 28 pm/V); weis1985 prefers Kaminow et al. 1980 (r51 = 18.2, r33 = 28.8 pm/V). Keep Turner (matches the atlas engine run and most TFLN papers) or switch the default to Kaminow (the compilation's preferred, fringing-corrected set)?
3. **Mode-lattice dependency (Author, API).** F2-15 needs a precomputed full-vector lattice from the atlas engine (about 6,300 solves per R11 S5) and, for live solves, a decision on shipping the GPL-3.0-or-later engine as a separate worker bundle (R11 risk 1). Until then F2-15 renders a reserved, labeled empty frame. Is the precompute in scope for wave 2?

## Missing primary sources (values currently S or U)

4. **Jundt 1997 primary** (doi:10.1364/OL.22.001553): coefficients and the 570.82 constant in f(T) are transcribed from a secondary source (S). Needed before temperature-dependent n_e leaves S.
5. **Zelmon 1997 primary** (doi:10.1364/JOSAB.14.003319): CLN coefficients are P-db (refractiveindex.info). A primary read would make them P.
6. **Moretti 2005 primary** (doi:10.1063/1.1988987): the dn_o/dT and dn_e/dT fits are quoted via schwesyg2011 (S); the temperature unit of the fit (K inferred) and the 1523 nm values need the paper. dn_o/dT spans 0.37e-5 (Moretti fit, 632 nm) to 0.94e-5 (CTI Sellmeier, vendor) per R14 row 38.
7. **n2 primary** (DeSalvo et al., IEEE JQE 32, 1324 (1996), doi:10.1109/3.511545): 9.33e-20 m^2/W is P-db via refractiveindex.info; the widely tabulated 1.8e-19 m^2/W (zhu2021) has no traced primary. No 1550 nm LN n2 is held. Also unresolved: whether any tabulated LN n2 was corrected for cascaded chi(2) contributions.
8. **Kitamoto 1995** (Opt. Rev. 2, 280): DOI not checked; d31 values U.
9. **r coefficients at 1550 nm:** none in any source held (R14 sec. 2.5). Jazbinsek & Zgonik, Appl. Phys. B 74, 407 (2002) is the candidate consistent set; it would also settle the r13 sign question carried from R06 pitfall 5.
10. **Kaminow et al. 1980, Turner 1966, Zook 1967** originals: r values are P-comp through weis1985; headline constants (r33, r51) should eventually be read in the originals (R14 N4).
11. **Leidinger 2015** (doi:10.1364/OE.23.021690, gold OA): absorption at 1550 nm is in the paper but unread; F2-16 uses only the abstract range.
12. **Thermal expansion for Lambda(T):** F2-07 omits period expansion because no expansion data are paired with a Sellmeier set; alpha_c itself is disputed (4.1 vs 7.5 ppm/K, R14 row 24). Kim & Smith 1969 needed.

## Numbers to re-verify before they ship as "reported"

13. Records whose numbers come from R08 rather than an abstract read in this lane: wang2018optica (2600 %/W/cm^2, 4 um period), chen2024nn, luo2018, zhang2017 (2.7 dB/m), desiatov2019, zhang2019 (>900 lines), hu2021 (28 GHz, about 90%; arXiv v1 said about 99%), hu2022, yu2022, zhangj2025, stokowski2024 (about 200 modes; arXiv v1 about 1000), hwang2026, gao2021 (19.6 uW), gao2022 (0.28 dB/m). Crossref returned no abstract for these; R08 records them as Y or Y(arXiv).
14. **li2026aa V_pi vs wavelength** comes from the eo-modulator-atlas evidence file (audited 2026-10-04, grade B). The 1450 and 1653 nm rows note bandwidth limited by a 67 GHz VNA, the 1970/2000 nm rows by a GeSn photodiode; V_pi values are unaffected but the page should not plot those bandwidths as device limits.
15. **Yamada 1993 waveguide type:** abstract confirms field poling, 600 %/W cm^2 and 20.7 mW blue; the waveguide fabrication (proton exchange or other) was not read, so the manuscript labels it only "LiNbO3 waveguide".

## Physics and convention items

16. **Cascaded chi(2) sign.** The manuscript states negative (defocusing) for Delta k = k_2w - 2k_w - 2pi/Lambda > 0, from coupled-mode level repulsion and an RK4 check in the stated A exp(i(omega t - k z)) convention (audit 2026-10-25 confirmed); confirm against DeSalvo 1992's stated sign convention when the full text is read.
17. **Coupling-rate conventions.** Ring formulas (SHG %/W, OPO threshold) use H/hbar = g(a^2 b^dagger + h.c.) and g(a_p^dagger a_s a_i + h.c.). Published g values (e.g. lu2020, g/2pi about 1.2 MHz) may use other factors; F2-09/F2-10 must state their convention and convert any literature g before plotting it.
18. **EO comb modulation index.** The derived slope 8.686 asinh(|ln r|/beta) dB/line (high-finesse 27.29/(beta F)) uses beta = peak round-trip phase and F = pi sqrt(r)/(1 - r). Kourogi 1993 and Zhang 2019 conventions were not read; the conversion printed on F2-13 must be checked against them.
19. **Grid vs engine residual in 2.2 L3:** +0.39% between the exported-grid integral and the engine quadrature is not isolated (interface-node assignment is one candidate; the engine accuracy note quotes 1.4e-3 to 3.5e-3 relative on its own references).
20. **Clamping in bonded films.** The engine uses clamped r; a low-frequency V_pi on a film bonded to a substrate sees partial clamping. No held source quantifies this for TFLN; it bears on the 3% engine-vs-measured V_pi L gap.
21. **x-cut ring anisotropy model** in F2-15 is the bulk indicatrix projection; real ring modes need azimuthal treatment of the confined mode (R11 S5 caveat). Tan 2024 reports a 2D method for x-cut ring eigenmodes; adopting it would replace the approximation.
22. **Raman gain of TFLN:** soliton design (F2-12) mentions Raman competition (gong2020, song2024) but no Raman gain coefficient is sourced; the LLE simulator excludes Raman until one is.

## Process notes

23. Local PDFs could not be machine-read in this lane (no PDF text tool installed and installs are out of scope); statuses for weis1985, volk2008, gayer2008 and schwesyg2011 rely on R14's page-image checks.
24. Integration: the approved 2.2 mockup uses the status label "engine"; DevLog-004's list does not. Either add "engine" to the status key (as the mockup footer does) or map it to "derived" with a source note.
25. Fresh-context audit (2026-10-25) recomputed every derived number independently; 13 defects found and fixed (QPM tuning slope 0.115 nm/K with one model, reference temperature on acceptance values, SH leakage 1.3e-5 z-averaged, field-phase convention for eq. 2.16, z-cut TE d22 mapping sin(3 alpha), +0.40% grid residual, 2.06x V_pi ratio, missing status tags, title-only attributions reworded, EO comb exact asymptotic slope 8.686 asinh(|ln r|/beta) dB/line).
