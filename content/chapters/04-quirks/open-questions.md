# 04 Quirks: open questions

Lane C04, 2026-10-25. Items that block a stronger status or a number on the page. Each names what would close it.

## Data gaps (block numbers)

| # | Question | Current handling | What closes it |
|---|---|---|---|
| 1 | Dark and photoconductivity of ion-sliced TFLN films (and of PECVD SiO2 cladding) | template in fig-04-04 and fig-04-08; derived effective conductivity 2e-8 to 3e-6 S/m from li2026photonics RC fits | a primary measurement of film and cladding conductivity versus anneal |
| 2 | GRIIRA/BLIIRA in TFLN | bulk values only, labeled bulk; fig-04-05 Part B template | any TFLN measurement (R08 open item 7) |
| 3 | Li2O out-diffusion coefficient under LNOI anneal conditions | depth in units of sqrt(Dt); D template | a primary diffusion study (Carruthers 1974 body may contain bulk D; not read) |
| 4 | p3 below room temperature | cryogenic cooldown charge not computed; cooling region shaded U | a p3(T) measurement to 4 K |
| 5 | r33 at 1550 nm | pyro Delta n uses 633 nm r33^T (R14: no 1550 nm EO value in held sources) | jazbinsek2002 or another 1550 nm EO measurement (R14 sec. 5 item 5) |
| 6 | Moretti 2005 table values (dn/dT at 1523 nm) | S via zhu2021 and schwesyg2011 | read moretti2005 |
| 7 | Polaron band values in the primary review | P-comp via volk2008 and schwesyg2011 | read schirmer2009 |
| 8 | Furukawa 2001 full text (threshold table, GRIIRA magnitudes) | P-comp via volk2008 Table 4.3 | read furukawa2001 |

## Conflicts (shown on the page as conflicts)

| # | Conflict | Sources | Handling |
|---|---|---|---|
| 9 | Dielectric relaxation time for sigma_d = 1e-16 to 1e-18 Ohm^-1 cm^-1 | volk2008 p. 159 (5-500 d) vs eps eps0/sigma (0.29-29 d, eps 28) | computed range shown; conflict flagged (R14 row 42a) |
| 10 | Thermal-lens example | schwesyg2011 p. 21 "about 100 mm" vs 61 mm from its own formula and inputs (dn_e/dT at 632 nm, 373 K) | both shown; which dn/dT the thesis used is unknown |
| 11 | Pyroelectric coefficient magnitude 4.0e-5 to 9.5e-5 C/(m^2 K) | savage1966, bartholomaus1994 (S), cti1999 (V), popescu2013 | all four shown with method; no single value |
| 12 | Ps 80 +/- 5 vs 71/62 uC/cm^2 | gopalan1998 vs volk2008 Table 1.1 | both shown (R14 row 12) |
| 13 | Laser damage fluence 14 vs 14.6 J/cm^2 | furukawa1991 abstract vs volk2008 p. 51 | abstract value used |
| 14 | MgO threshold units | bryan1984 at.% vs compilations mol% | each in source unit, not converted |
| 15 | dn_o/dT up to 2.5x apart | cti1999 Sellmeier vs moretti2005 formula | both shown (R14 row 38) |

## Mechanism questions (keep U until a primary source)

| # | Question | Status |
|---|---|---|
| 16 | Li+ ion migration as a TFLN DC-drift mechanism | not established by any primary source found (R08 open item 6); not in the model; listed as U |
| 17 | Why the +c face inverts during Ti indiffusion (miyazawa1979) | attribution to Li2O out-diffusion is U; read the paper body |
| 18 | Li out-diffusion during anneals as cause of higher thin-film coercive fields | hypothesis (zhu2021, S) |
| 19 | "Heating z-cut LN to 120 C could expose ZEP" (practitioner note citing "Mostafa et al. 2006", very likely bourim2006) | U; check whether bourim2006 mentions resist exposure |
| 20 | "Li doesn't form volatiles with Br or Cl" (practitioner note) | U; needs a chemistry source (R02 flag) |
| 21 | 4 K inter-chip ESD and the "100 kV by rapid heating" example in the practitioner post cite social-media posts | practitioner report only; find the underlying papers |
| 22 | Drift sign conventions (positive/negative) across papers | page uses each paper's own term and defines the model's convention |

## Asset and permission questions for the author

| # | Question |
|---|---|
| 23 | May the post-HF nanobeam SEMs and the a-Si hard-mask SEMs from the 2018 notes appear in fig-04-11, cropped to remove the instrument data bar (it carries an institution name and date)? |
| 24 | The pitfall rows quote public notes impersonally ("practitioner notes") without a link. Is that attribution acceptable, or should the site name the author? (DevLog-004 rule 8: his published work may appear where it fits the physics; no "my story" page.) |
| 25 | Released x-cut device collapse at 4 K (blog-ofs79) is an unpublished observation. Keep it as a practitioner report, or drop it? |

## Checks before publishing

- Re-pull Crossref for zhong1980 (no DOI; title as commonly cited, not checked).
- volk2008 Eq. 2.11 (small-polaron line shape) is damaged in the text layer of the held copy; re-key from a clean copy if the exact form is wanted.
- schwesyg2011josab abstract and body not read; the thesis chapter was used. Confirm the journal version states the same tau_di = 14 s, kappa = 0.27 pS cm/W, 140x poling reduction.
- kuznetsov2025 and alsayem2026 are preprints; re-check for journal versions.
- R08 listed the 120 C DC-stable result under TFLN; the arXiv abstract (alsayem2026) is thin-film lithium tantalate. The chapter labels it TFLT; tell the C06 lane.
- li2026photonics had no DOI in R08; DOI 10.3390/photonics13040339 found here. Tell the API lane.
