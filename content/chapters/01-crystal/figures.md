# 01 The crystal: figure and interactive specs

Lane C01, 2026-10-25. Ten figures. Numbers and their statuses come from `manuscript.md` and `refs.yaml`; nothing below adds data. Requested physics functions are proposals for lane PHY (`src/lib/physics/`); requested data are proposals for lane API (`data/`). Every figure: sharp corners, dark and light themes, no emoji, SI units, fixed-format readouts in reserved boxes, `prefers-reduced-motion` respected, both design systems (DevLog-003a TECH, DevLog-003b VISUAL), shared state object so a mode switch keeps every value (DevLog-003b Sec. 9).

Common readout rule: each readout has a fixed character width (stated per figure) in a box whose width and height are reserved in CSS; values are right-aligned with tabular figures; no readout lives inside a moving element.

---

## FIG-01-01 Cell explorer

| Field | Spec |
|---|---|
| Question | What does the LiNbO3 lattice look like, and how do the hexagonal and rhombohedral cells, the octahedral columns (Nb, empty, Li along +c) and the cleavage plane sit in it? |
| Model | Static geometry. Inputs: setting {hexagonal, rhombohedral, both}, show {Nb octahedra, Li octahedra, empty sites, bonds, axes, cleavage plane (01-12), column highlight}, supercell n x n x 1 (n = 1, 2). Outputs: atom and polyhedron geometry; hover/tap picks an atom or site and reports species, Wyckoff site, fractional and Cartesian coordinates, nearest-neighbour shell. |
| Physics (PHY) | `crystal.ts`: `expandCell(asym, ops)` (exists in `scripts/gen_cell.py`; port or read JSON), `hexToRhomb(a, c)` returning {a_R, alpha, basis vectors}, `planeAngleToC(hkil, a, c)`. |
| Data (API) | `data/structure/linbo3-cell.json` (move of `mockup/data/linbo3-cell.json`, schema `linbo3-cell/1`, hsu1997 via COD 2101845, P-db; expansion derived). |
| Sources | hsu1997, abrahams1966b, weis1985 (Eq. (1), cleavage 32.75 deg), volk2008 (Table 1.1 lattice CLN/SLN). |
| TECH | Existing ASCII z-buffer renderer (`mockup/lattice.js`, `#cell`) extended: setting toggle draws the rhombohedral cell edges with a different line glyph (`:` vs `-`); cleavage plane as a hatched glyph field; column highlight inverts the three glyphs of one column. Controls 18 px segmented buttons. Static unless operated. |
| VISUAL | three.js shaded cell (existing `#fig1`), translucent octahedra coloured by occupant (`--v-nb`, `--v-li`, empty as wireframe); rhombohedral cell drawn as a luminous edge set inside the hexagonal prism; cleavage plane as a thin glass sheet with its 32.75 deg angle labelled; 44 px toggles. Render on demand. |
| Joy | Toggle "rhombohedral" and the 10-atom cell appears inside the 30-atom prism, sharing its long diagonal with c; hover the column highlight and the three octahedra light in sequence Nb, empty, Li as the cursor moves up c. Tilt the cleavage plane toggle and it passes exactly through the empty octahedra. True to the data: every position is from the CIF. |
| Readouts | `a 5.148 A  c 13.863 A` (fixed); setting box `a_R 5.494 A  alpha 55.87 deg` (24 ch); pick box `Nb 6a  (0.0000, 0.0000, 0.9990)  Nb-O 1.876 x3 / 2.130 x3 A` (reserved 2 lines x 52 ch). |
| Acceptance | (1) Atom counts Li 6, Nb 6, O 18, empty 6 per hexagonal cell. (2) a_R and alpha from `hexToRhomb` match 5.4943 A and 55.872 deg within 1e-3. (3) Cleavage angle 32.749 deg within 1e-3. (4) Column sequence along +c at (0,0): empty, Li, Nb, empty, Li, Nb. (5) Bounding boxes of all page elements unchanged across every toggle at 1440 and 390 px. (6) Camera state shared between TECH and VISUAL. |

---

## FIG-01-02 One cell, flipped

| Field | Spec |
|---|---|
| Question | Which atoms move when the polarization reverses, by how much, and why is a single cell not how real crystals switch? |
| Model | Linear interpolation of Li and Nb (and the small O twist) between the "up" structure (hsu1997) and its inversion about the Nb O6 centroid, parameter s in [-1, 1]; s = 0 is the centrosymmetric R-3c reference. Frame selector {O fixed, Nb fixed, centre of mass}. Energy inset: double well drawn from the two sourced points only (well depth 18.3 mRy = 2858 K per 10-atom cell, inbar1996, reported) with a quartic template shape U(s) = U0 (s^2 - 1)^2, labelled template; optional applied-field tilt U - k E s with k chosen so that 21 kV/mm visibly does not remove the barrier (template, stated in caption). |
| Physics (PHY) | `crystal.ts`: `polarDisplacements(cell, frame)` returning {Nb, Li, O} along c in A; `interpolateFlip(cell, s)`. `landau.ts` (template): `quarticWell(s, U0, tilt)`. |
| Data (API) | linbo3-cell.json; property rows `ps` (range 0.71-0.80 C/m^2), `tc`. |
| Sources | hsu1997 (positions), weis1985 (paraelectric Li +-0.37 A), inbar1996 (well depth, Li-alone single well), volk2008 (44 pm / 26-27 pm quote for the frame note). |
| TECH | Side projection along a, ASCII: one octahedral column of 3 octahedra drawn as `/\` `\/` outlines, cations as glyphs, displacement ruler in A; slider s; frame segmented control; energy inset as a 40 x 10 character plot. |
| VISUAL | Close-up 3D of one column (Li octahedron, Nb octahedron, empty octahedron) with the O3 triangle that Li passes through highlighted as a glowing ring when Li crosses it; Ps arrow length proportional to s; double-well inset with a ball at s. 26 px diamond slider. |
| Joy | Drag s from +1 to -1: niobium slides 0.55 A through the middle of its cage, lithium threads its oxygen triangle and drops into the empty octahedron below, and the polar arrow reverses; switch frame and the same motion is redistributed among Li, Nb and O while relative positions stay identical. Then push the field slider to 21 kV/mm and the well barely tilts: the caption says real crystals switch by nucleation and wall motion (FIG-01-09). |
| Readouts | `s +1.00`; frame box `Nb +0.275 A  Li +0.713 A  O +0.000 A` (36 ch, signed, 3 decimals); inset `depth 18.3 mRy (2858 K) per 10-atom cell [reported]`. |
| Acceptance | (1) O-fixed frame at s = 1: Nb 0.275 A, Li 0.713 A (+-0.001). (2) Nb-fixed frame: Li 0.438 A, O -0.275 A. (3) s = 0 positions satisfy R-3c (Li in O plane, Nb at O6 centroid). (4) Total travel Nb 0.550 A, Li 1.426 A. (5) Template elements carry the template badge. (6) No layout shift at s = -1, 0, +1 and field extremes. |

---

## FIG-01-03 Composition dial

| Field | Spec |
|---|---|
| Question | What changes, and by how much, as the Li2O content goes from congruent (about 48.4 mol%) to stoichiometric (50 mol%)? |
| Model | Input c in [48.0, 50.0] mol% Li2O (step 0.01) and defect model {Li-site, Nb-site}. Outputs: R1 = c/(100 - c); x = (1 - 2R2)/(5 - 4R2); defect fractions; Tc from both fits (Iyi, Bordui) shown as a band; UV edge lambda_20 and lambda_15 (valid only for the calibrated range; the figure greys outside 48.0-50.0); anchors only (no interpolation) for Ec and Eint: markers at CLN and near-SLN with sources; melting point 1255 C (CLN) marker on the temperature axis. Background lattice texture (triangular lattice of Li sites) redraws with 4x vacancies and x antisites per site, seeded RNG. |
| Physics (PHY) | `composition.ts`: `liNbRatio(c)`, `defectFractions(c, model)`, `tcIyi(c)`, `tcBordui(c)`, `uvEdge(c, alpha=20|15)` with validity flags; `seededLattice(n, fracVac, fracAnti, seed)`. |
| Data (API) | `data/composition/tc-fits.yaml` (two fits, volk2008 Eqs. (6.2)-(6.3), P-comp), `uv-edge.yaml` (Eqs. (6.5)-(6.6), P-comp), property rows `ec`, `eint`, `tm` with variant keys. |
| Sources | volk2008, iyi1992, bordui1992, kovacs1997, gopalan1998, carruthers1971, weis1985. |
| TECH | Two-column panel: left a monospace table of outputs that updates in place; right an ASCII temperature axis 1100-1300 C with Tc band, Tm marker, and an ASCII bar for lambda_20 on a 300-325 nm axis. Defect texture as a 32 x 12 character field of `.` (Li), ` ` (vacancy), `#` (Nb_Li). |
| VISUAL | Large dial or 44 px slider with tick marks at 48.38, 48.45, 48.6 (each value's source in a hover), 50.0; Tc and Tm on one illustrated temperature axis; UV edge as a spectrum bar with the visible part in computed spectral colour and the UV part hatched (declared, invisible); the page-background Li-vacancy motif (DevLog-003b Sec. 7) follows the dial. |
| Joy | Slide toward 50 mol%: holes in the lattice texture fill in and antisites vanish, Tc climbs 60 C along the axis, the absorption edge slides 17 nm deeper into the UV, and the CLN internal-field marker fades out at the SLN anchor. Switch defect model at 48.45 mol%: the same composition redraws with five times as many antisites and Nb vacancies instead of Li vacancies, the disagreement made visible. |
| Readouts | `c 48.45 mol%  [Li]/[Nb] 0.9399` (30 ch); `Nb_Li 1.01 %  V_Li 4.05 %` (26 ch); `Tc 1141.5-1145.9 C` (18 ch); `lambda_20 320.2 nm` (18 ch). |
| Acceptance | (1) Spot values at 48.38, 48.45, 49.0, 49.5, 50.0 match the manuscript tables to the printed digits. (2) Both defect models give identical R1. (3) No Ec or Eint value is shown between anchors. (4) UV formula disabled outside its calibration with a visible note. (5) Layout stable at c = 48.0 and 50.0 and on model switch. |

---

## FIG-01-04 Defect and polaron gallery

| Field | Spec |
|---|---|
| Question | Which intrinsic and hydrogen-related centres exist in LiNbO3, where are they in the lattice, and what light do they absorb? |
| Model | Catalogue (no simulation). Items: Nb_Li, V_Li, V_Nb (Nb-site model only), bound polaron Nb_Li^4+ (1.6 eV), free polaron Nb_Nb^4+ (0.95 eV), bipolaron (2.5 eV), O^- hole polaron (about 500 nm), OH^- (3482 / 3467 cm^-1 CLN; 3466 cm^-1 SLN). Each item: lattice location, band peak position on a photon-energy axis 0.3-4 eV (and wavenumber inset for OH), lifetime ranges where sourced. Band shapes drawn as markers with a width bar only where a width is sourced (OH FWHM 32 cm^-1); polaron band shapes deferred until schirmer2009 is read (open question Q-DEF-2), shown meanwhile as peak markers. Toggle "pump 532 nm": marks which listed centres absorb at 2.33 eV by peak proximity only, labelled qualitative. |
| Physics (PHY) | `units.ts`: `eVtoNm`, `nmToEV`, `wavenumberToUm`. `spectral.ts` (exists in mockup `visual.js`): wavelength to display colour. |
| Data (API) | `data/defects/centres.yaml` (new): id, notation, site, band_eV, signatures, lifetime ranges, source, status P-comp. |
| Sources | volk2008 pp. 10-26, herth2005, furukawa2001, schirmer2009 (pending). |
| TECH | Table of centres (boxed) beside an ASCII photon-energy axis with `|` markers; selecting a row highlights its marker and prints its notation in Kroeger-Vink form. |
| VISUAL | Specimen cards, one per centre, each with a small 3D vignette (the octahedron with the electron drawn as a localized cloud on Nb_Li, or shared across Nb_Li-Nb_Nb for the bipolaron) and a to-scale band marker on a shared spectrum strip (visible in spectral colour, IR declared false colour, dashed). |
| Joy | Hover the bipolaron card and the reduced-crystal colour appears on the spectrum strip near 500 nm, explaining why chemically reduced LN looks dark; toggle "illuminate below 80 K" and the marker hops from 2.5 eV to 1.6 eV, the photodissociation of the pair into a bound polaron, as observed (volk2008 p. 17). |
| Readouts | selected-centre box (reserved 3 lines x 48 ch): `Nb_Li^4+  bound small polaron  1.6 eV (775 nm)  EPR g_perp 1.72 g_par 1.9`. |
| Acceptance | (1) eV-nm conversions within 1 nm. (2) Every card shows its badge (P-comp) and source. (3) No band shape drawn without a sourced width. (4) Reduced-motion: hop is instant. (5) No layout shift on hover/select. |

---

## FIG-01-05 Threshold explorer (MgO and friends)

| Field | Spec |
|---|---|
| Question | What happens at the damage-resistance threshold of Mg (and Zn, In, Sc, Hf, Zr), and why is it lower in Li-rich crystal? |
| Model | Data browser, no interpolation. Inputs: dopant {MgO, ZnO, In2O3, Sc2O3, HfO2, ZrO2}, host {congruent, melt [Li]/[Nb] = 1.2, near-stoichiometric}, concentration slider (0-9 mol%, step 0.1). Outputs: sourced threshold markers (with spread where sources differ), OH band position step (below / above, Table 2.4 values), one site-occupancy scheme for Mg (iyi1995 via volk2008 Table 2.2, labelled "one proposed scheme"), concentration-basis switch showing the factor of about 2 between the two definitions (labelled approximate, as in the source). |
| Physics (PHY) | none beyond formatting; `composition.ts` `mgBasisConvert(c, from, to)` returns null (no exact relation sourced) and the UI shows the "about 2x" note instead. |
| Data (API) | `data/dopants/thresholds.yaml` (new; rows from manuscript Sec. 6 L2 with variant, basis, source, status), `oh-bands.yaml`. |
| Sources | volk2008, bryan1984, furukawa2000, zhong1980 (via volk2008), iyi1995. |
| TECH | Horizontal monospace concentration axis per host with `^` threshold markers and source keys; a two-cell readout of the OH band below/above. |
| VISUAL | The Li-vacancy texture tile from FIG-01-03 with Mg ions as a third species: below threshold Mg fills vacancies and replaces antisites (drawn per the sourced scheme at 0, 3, 8% only, discrete states, no tweening between unsourced states); an OH absorption line on a wavenumber strip jumps from 3484 to 3534 cm^-1 when the slider crosses the congruent Mg marker. |
| Joy | Cross 4.5-5 mol% MgO in congruent host: the antisites drawn in the texture are gone and the OH line jumps 50 cm^-1; switch the host to near-stoichiometric and the marker slides down to below 1 mol%, showing the same physics at a fifth of the dopant. |
| Readouts | `MgO 4.5 mol%  host CLN` (24 ch); `OH 3484 -> 3534 cm^-1` (22 ch); threshold box listing up to 4 sourced values with keys (reserved 4 lines). |
| Acceptance | (1) Only sourced states drawn; intermediate concentrations show the nearest lower sourced state with a "no data between" label. (2) Basis note visible whenever MgO is shown. (3) Values match manuscript tables. (4) No layout shift across slider range and host switches. |

---

## FIG-01-06 Neumann machine

| Field | Spec |
|---|---|
| Question | How does point group 3m decide which components of each property tensor are zero, equal, or tied, and what appears when an applied field lowers the symmetry? |
| Model | Exact group action. Inputs: property {pyroelectric (rank 1), permittivity (2), piezoelectric d (3), electro-optic r (3), elastic c (4), photoelastic p (4)}, symmetry operations toggles {C3, C3^2, mirror yz, mirror at +60 deg, mirror at -60 deg}, applied field direction {none, x, y, z}. Outputs: Voigt matrix display with each component classed {zero, independent, equal to, minus, factor}, independent count, residual symmetry group name (3m, m, 1). Method: symmetrize a generic full-rank tensor by averaging over the selected group (Reynolds operator), then contract with the stated Voigt factors; identify linear relations numerically (tolerance 1e-12). |
| Physics (PHY) | `tensor.ts` (already in PHY scope: full-rank rotation, Voigt, IEEE 176 frame): add `groupOps3m()` returning 6 matrices in the IEEE frame (x perpendicular to the yz mirror), `symmetrize(T, ops)`, `voigt(T, kind)` with engineering-strain factors, `relations(Tvoigt)`, `stabilizer(ops, vector)`. |
| Data (API) | none required; optional `data/symmetry/3m-forms.json` generated by PHY for llms.txt. |
| Sources | weis1985 (Eqs. (2), (4), (8), (12), (16), (19); Neumann 1833 statement p. 198), nye1985 (method), ieee176 (axes). |
| TECH | Matrix grid in monospace: `0` for zero, symbol for independent (`d15`), relation text for dependent (`-d22`, `2s14`, `(c11-c12)/2`); operation toggles as 18 px segmented controls; independent count in the header strip. |
| VISUAL | Matrix as a glyph grid of squares (filled = independent, outlined = tied with a thin connector to its partner, empty = zero); a 3m stereogram (Gothic-tracery motif, R12) whose mirror lines and threefold symbol light when their operation is on; applied-field arrow drawn into the stereogram. |
| Joy | Start with all operations off: every component is lit (18 for d, 21 for c). Switch on C3: most go dark and survivors pair up. Add one mirror: d collapses to exactly four independents, d15, d22, d31, d33, as in the measured tables. Then apply a field along y: the stereogram keeps one mirror, the group reads m, and new electro-optic-induced components reappear in the impermeability. |
| Readouts | `group 3m  independent 4 / 18` (26 ch); relation list box (reserved 6 lines x 40 ch). |
| Acceptance | (1) Counts 1, 2, 4, 4, 6, 8 for p, eps, d, r, c, p_elastooptic with all of 3m on. (2) Relations match weis1985 forms exactly, including d16 = -2 d22, s66 = 2(s11 - s12), c66 = (c11 - c12)/2, p66 = (p11 - p12)/2. (3) Stabilizer: E || z -> 3m, E || y -> m, E || x -> 1. (4) Unit tests in PHY for each. (5) No layout shift across toggles. |

---

## FIG-01-07 Which face is +z

| Field | Spec |
|---|---|
| Question | How is the sign of the polar axis defined and found on a real crystal? |
| Model | Three qualitative tests with signs from the standards: compress along c (the +c face becomes negative), cool (the +c face becomes positive), etch in acid (the -c face etches much faster). Optional quantitative readouts: charge from cooling Q = p3 A dT with |p3| shown as the sourced spread 4-9.5 x 10^-5 C/(m^2 K) (lane C04 owns pyroelectric values; this figure links there); charge from compression Q = d33 F with d33 range from note-R14 (lane C03 owns piezo values). |
| Physics (PHY) | `units.ts` only; values read from API property rows `pyro_p3`, `piezo_d33` with their status. |
| Data (API) | property rows as above, plus convention record `ieee176-3m` (axes rules text). |
| Sources | weis1985 pp. 192-196, volk2008 pp. 2, 168, ieee176, ire1949. |
| TECH | Three columns, one per test: ASCII crystal block with `+`/`-` glyph rows on the c faces after the action; action buttons; the rule text quoted under each. |
| VISUAL | Illustrated z-cut plate in a vice (compression), on a Peltier stage (cooling), and in an etch dish (etching, the -z face roughening), with Ps arrow drawn inside; charge as small signed markers on the faces. |
| Joy | Squeeze and cool the same plate: the same face turns negative in one test and positive in the other, and both say "this is +z", because compression pushes the cations toward their centred positions while cooling pulls them further out (weis1985 p. 193). |
| Readouts | per test a 1-line box: `+c face: negative` (18 ch); optional `Q 4.0-9.5e-9 C/K per cm^2` (range from |p3| 4-9.5 x 10^-5 C/(m^2 K), derived) with badge. |
| Acceptance | (1) Signs match weis1985 and ieee176 rules. (2) Any numeric charge shows the source range, not a single value. (3) Reduced motion: no vice/etch animation, final state only. |

---

## FIG-01-08 Hysteresis comparator

| Field | Spec |
|---|---|
| Question | How do coercive field, internal field and spontaneous polarization differ between congruent, near-stoichiometric and Mg-doped crystals? |
| Model | P-E loops drawn from sourced anchors only: Ps (range band 0.71-0.80 C/m^2), forward and reverse switching fields from Ec and Eint (E_f = Ec_forward, E_r = Ec_forward - 2 Eint, consistent with a loop shifted by Eint; derived construction), loop shape a template tanh with the slope chosen for display, labelled template. Crystals: CLN, SLN, CLN:5%MgO, SLN:1%MgO, near-SLN:2%MgO (no Eint value: loop drawn symmetric with "Eint not reported" note). Linked wafer-voltage calculator: t (0.1-1 mm) -> V = Ec t. |
| Physics (PHY) | `hysteresis.ts` (template): `loop(E, Ps, Ef, Er, slope)`; `coerciveVoltage(Ec, t)`. |
| Data (API) | property rows `ec`, `eint`, `ps` with variant keys {CLN, SLN, MgO5-CLN, MgO1-SLN, MgO2-SLN}, each with a status; conflicts stored as separate rows (SLN Ec 6.0-6.5 vs p. 118 2.1-2.5 kV/mm flagged). |
| Sources | volk2008 Table 7.1 and pp. 181-186, gopalan1998, chen2001, chen2003. |
| TECH | Monospace data table of anchors with badges, plus an ASCII loop plot (80 x 20 chars) overlaying selected crystals with distinct glyphs; E axis in kV/mm, P in C/m^2. |
| VISUAL | Overlaid loops in neutral line weights with the selected crystal emphasized; the Eint offset drawn as an arrow from E = 0 to the loop centre; wafer cross-section beside it with electrodes and the required voltage. |
| Joy | Select congruent then near-stoichiometric: the loop collapses to less than a third of its width and slides back to centre as Eint vanishes; drag wafer thickness and the voltage readout falls from 10.5 kV to 0.9 kV at 0.5 mm when switching to near-SLN:2%MgO. |
| Readouts | `Ec 21.0 kV/mm  Eint 2.2-3.4 kV/mm` (34 ch); `V 10.5 kV @ 0.50 mm` (20 ch). |
| Acceptance | (1) Anchor values equal manuscript Sec. 8 tables. (2) Loop-shape template badge visible. (3) Conflicting values shown as ranges with both sources. (4) No layout shift across crystal selection and thickness extremes. |

---

## FIG-01-09 Poling bench

| Field | Spec |
|---|---|
| Question | How does a field pulse through comb electrodes turn a single-domain crystal into a periodically poled one, and what does the switching current record? |
| Model | Stochastic cellular automaton on a triangular lattice (hexagonal domains with Y-wall facets), seeded PRNG, render(t) contract (R13): nucleation probability per site per step at the +z electrode edge, increasing with (E - Ec); sideways growth by step nucleation on existing walls along the six Y-wall directions; forward growth along z in a depth view. All rates template. Sourced quantities: Ps (choice 0.71 C/m^2, stated), Ec and Eint anchors (FIG-01-08), Y-wall hexagon orientation (lee2011, volk2008), nucleation at +z (volk2008 p. 199). Outputs: domain map (top view z-cut, and cross-section view), switched area fraction X(t), switching current I(t) = 2 Ps dA/dt + C dV/dt with C a template, integrated charge, duty cycle after the pulse; optional backswitching if the pulse ends before a template critical time, suppressed by a hold at Ec/2 (practice reported in volk2008 pp. 179-180). KAI fit of X(t) shown as an overlay with fitted n. |
| Physics (PHY) | `poling.ts`: `hexAutomaton(state, E, params, rng)`, `switchingCurrent(area_t, Ps, C, V_t)`, `kaiFit(t, X)`; R11 Sec. S9 validation (charge integral = 2 Ps A). Optional WebGL2 ping-pong for 512^2. |
| Data (API) | `ps`, `ec`, `eint` rows; electrode presets (period, duty) labelled template. |
| Sources | volk2008, yamada1993, myers1995, gopalan1999, lee2011, shur2006, note-R11; existing PlayGround poling animation as the visual precedent (x-cut stripe geometry, read-only reference). |
| TECH | Character-cell domain map (`#` reversed, `.` original) at 96 x 32 in a fixed box; ASCII current trace below with a moving `|` cursor; pulse parameters as small numeric inputs; no animation unless "run" is pressed, then step-wise redraw. |
| VISUAL | SHG-microscope-style grey map (wall darkening as a display effect, declared), electrodes in `--v-au`, Ps arrows per stripe; current trace with cursor; optional 3D cross-section showing domains growing down from the +z face. |
| Joy | Press the pulse: hexagons appear at the electrode edges, grow, touch and merge into stripes while the current trace draws itself and the integrated charge climbs to exactly 2 Ps times the area switched; cut the pulse short and watch fresh domains shrink back (backswitching), then repeat with the Ec/2 hold and they stay. |
| Readouts | `t 12.40 ms  V 10.50 kV` (24 ch); `Q 141.9 uC/cm^2  X 0.998` (28 ch); `duty 0.53` (10 ch); `KAI n 2.04` (12 ch, labelled fit). |
| Acceptance | (1) Integrated switching charge equals 2 Ps A of the final map within 0.5%. (2) Domains are hexagons with facets along the three Y-wall directions in the top view. (3) Determinism: same seed gives identical frames. (4) Template badges on every rate. (5) Layout stable during run (reserved canvas and readout boxes). (6) 0 idle frames when not running. |

---

## FIG-01-10 Powers of ten along a wall

| Field | Spec |
|---|---|
| Question | How wide is a domain wall, and on what length scales do its strain, birefringence, and (when charged) conduction live? |
| Model | Log-scale zoom slider from 10 um to 0.1 nm across a 180 degree wall. At each scale the sourced feature at that scale is drawn: X-ray shear-strain region up to 10 um, birefringent region within 2 um, PFM width 65-150 nm (probe-limited), ideal width 1-2 lattice units (drawn as 1-2 in-plane spacings a = 0.515 nm, i.e. 0.5-1.0 nm; derived, labelled approximate because the source does not name the lattice length), TEM bound 0.28 nm (LiTaO3, labelled). Tilt control theta (0-5 deg) computes bound charge sigma_b = 2 Ps sin(theta) and the equivalent sheet electron density; the werner2017 data point (theta about 1 deg, conductivity 0.02 (Ohm cm)^-1 for a 10 nm width) shown as a single marked point, no curve. |
| Physics (PHY) | `units.ts`; `domainWall.ts`: `boundCharge(Ps, theta)`, `sheetDensity(sigma)`. |
| Data (API) | `data/domains/wall-scales.yaml` (new, rows from manuscript Sec. 10 with status), `ps`. |
| Sources | gopalan2007, volk2008, werner2017, schroder2012. |
| TECH | Single horizontal log ruler in monospace with scale labels; the current scale's feature described in a fixed 2-line box; tilt input with numeric readout. |
| VISUAL | Continuous zoom: from a polarizing-microscope view (bright wall line on dark field, display rendering) through a PFM-like amplitude profile to an atomistic strip of the two domains with Li and Nb displaced up on one side and down on the other (positions from FIG-01-02); at nonzero tilt, bound charge drawn as signed dots along the wall. |
| Joy | Zoom from the micrometre halo seen in a microscope down to the two-unit-cell seam where lithium switches from above to below its oxygen plane; tilt the wall by one degree and 1.5 x 10^13 bound charges per cm^2 appear, the charge sheet that makes such walls conduct. |
| Readouts | `scale 100 nm` (12 ch); `theta 1.00 deg  sigma_b 0.0248 C/m^2  1.55e13 e/cm^2` (44 ch). |
| Acceptance | (1) sigma_b at theta = 1 deg, Ps = 0.71: 0.0248 C/m^2, 1.55 x 10^13 e/cm^2. (2) Every scale feature carries its source and badge; LiTaO3 values labelled as such. (3) No conductivity curve drawn beyond the single sourced point. (4) No layout shift across zoom and tilt extremes. |
