# DevLog-004a: Questions for the author (collected during the build)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Status | Open; answer inline, the coordinator records decisions in DevLog-004 |

## Status-code convention (coordinator decision)

Abstract-only reads use `P(abs)` (R06 status key). Added to DevLog-004 rules.

## Open

1. C01: spontaneous polarization Ps of congruent LN: 0.71 or 0.80 C/m^2? (details: `content/chapters/01-crystal/open-questions.md`, item A1)
2. C01: near-stoichiometric coercive field: Volk & Wohlecke Table 7.1 vs p. 118 differ tenfold; which to show, or show both with the conflict flagged?
3. C02: default scale for the nonlinear d coefficients: (a) Shoji 1997 values marked U (not held locally), (b) Volk compilation legacy scale (P-comp), (c) symbolic only until Shoji is read. Recommendation: (c) for defaults with (a) and (b) shown as a labelled spread; supply Shoji 1997 if you hold it.
4. C02: default electro-optic set: Turner 1966 (r33 30.8, r51 28) or Kaminow et al. 1980 (r33 28.8, r51 18.2, preferred by Weis & Gaylord as "probably the most accurate"). Recommendation: Kaminow 1980 default, Turner shown alongside, until the 1980 original is read.

5. C03: photoelastic p14/p41 sign pairing relative to c14 > 0 (IEEE 176-1987 frame): the wrong pairing moves the X-cut photoelastic optimum from 45 to 135 deg (no effect on Y-cut); your 2018 notes give 0.304/0.223. Do you know which pairing your 2018-2019 simulations used and whether it was validated against a measurement? (details: content/chapters/03-sound/open-questions.md Q1)

6. C04: may your own SEM images from your public blog posts (e.g. the a-Si hardmask test, HF etch of +z/-z faces) appear on the Quirks pitfall cards? Which ones are cleared (see also review/materials-review.md section D)?
7. C04: how should content derived from your blog notes be attributed on the page: "W. Jiang, outside5sigma.com, YYYY-MM-DD" with a link, or unattributed as site content?

8. C06: add an explicit data license to eo-modulator-atlas (and photonics-atlas) so this site can re-serve derived charts and counts; suggestion CC BY 4.0 to match this site. Charts are pinned to atlas commit eb97f96 (CSVs byte-identical to the local checkout).
9. C06: show market-size numbers at all? Current draft shows them only as range strips by evidence grade (report teasers are low grade), never a headline number. Recommendation: keep the range strips.

## Coordinator decisions (no author input needed)

- Atlas engine (GPL-3.0) may be embedded/run in a worker: site code is GPL-3.0 (author decision), so the licenses are compatible.
- The atlas mode-lattice precompute needed by figure F2-15 is assigned to a wave-2 lane.
- Wave 2 adds lane PHY2: functions requested by manuscripts that PHY lacks (partial-wave SAW solver from C03's derivation, others collected from all figures.md files); API adds LiTaO3 constants for comparison figures.
- Chinese company names: only verified entries are included (C06 added none unverified).
- PHY2 lane to check traveling-wave impedance terms against Chung et al. 1991.
