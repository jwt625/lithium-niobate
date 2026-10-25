# Chapter 05 figures

| Field | Value |
|---|---|
| Chapter | 05-making |
| Date | 2026-10-25 |
| Count | 11 (F05-01 to F05-11) |
| Status | Specification for wave-2 lanes P05 and F6; nothing here is implemented |
| Rules | DevLog-004 rules 1-9; DevLog-003a (TECH), 003b (VISUAL); R13 scene contract and provenance; R05 budgets |

Common to every figure:
- Provenance: every rendered number carries `reported`, `derived`, or `template` (Process viewer adds `analog` and `na`), with the badge styles of DevLog-003a item 6 (TECH) and 003b sec. 3.3 (VISUAL). Template values are desaturated and dashed, tooltip "not reported; illustrative".
- Determinism: each animated scene is `render(state, t)` with no `Math.random`, `Date`, or free-running loop; seeded PRNG only for decorative textures (R13).
- Readouts: fixed `ch` width per format, `font-variant-numeric: tabular-nums`, right-aligned, reserved boxes; the figure box has a fixed `aspect-ratio` or height (DevLog-003b sec. 2). Formats are listed per figure.
- Layout-shift check (DevLog-004 rule 4): `getBoundingClientRect` on every element of the figure and the page at each control's min, max, and mid, at 1440 and 390 px, both modes, both themes: 0 moved or resized.
- Render on demand; 0 idle frames; IntersectionObserver gating; `prefers-reduced-motion` disables autoplay and motion motifs (controls stay).
- Copyright: no paper figure is traced; every curve is re-computed or re-keyed from the cited values (DevLog-004 rule 7).
- Plots: data only, absolute units, log toggles where data span decades.

---

## F05-01 Process viewer: making a TFLN modulator

Placement: top of chapter (full width), and a compact link-in at each section (5.2-5.11) that opens the viewer at the matching step.

Question: What happens, in order and to scale, between a powder charge and a fibered thin-film LN modulator, and which numbers are known?

Data: `process-flow.yaml` (30 steps; 2 device routes `ridge_duv` and `strip_dlc`; PDim count by status from the file as written 2026-10-25: reported 75 of which analog 36, derived 9, template 10, na 21; the builder recomputes these).

### Engine contract (R13)

| # | Rule | LN specifics |
|---|---|---|
| E1 | Scene = pure function of (route, step index, t in [0, 1]). Reverse play, step back, scrub are evaluations at other (step, t). Step-boundary snapshots cached | Forward vs backward state and pixel mismatch = 0 on both routes (check P1) |
| E2 | Step phases: approach (tool moves in), ops (process), retract. Equal playback duration per step at 1x (6 s x weight, weight from the YAML, default 1) | Real process time shown in HUD, never used for playback speed |
| E3 | Linked scales: boule, wafer, die, cross_section. Each step names a primary scale; a secondary scale is a picture-in-picture synced to the same t. Layouts: Main, Inset, Side by side, Stacked, Swap | Boule -> wafer at s05; wafer -> cross-section at s16r/s15s; die at s20r/s18s; the PiP shows where the current cross-section sits on the die and the die on the wafer site map |
| E4 | Illustrative vs true-scale toggle. Illustrative: one frozen z-map per step, untouched bodies keep on-screen height, thinned bodies shrink. True scale: ruler with SI units | 600 nm LN on 4.7 um SiO2 on 500 um Si: at true scale the film is 0.12% of the stack height; the toggle animates between z-maps in 240 ms |
| E5 | Camera persists across steps, scrub, play; re-targets only at steps with `camera.retarget: true` (flip, bond, split, dice, scale change) | Re-target eases over 600 ms; never enters a tool body |
| E6 | Procedural materials only (no image textures); F0 from sourced n, k; LN transparent with a single display ior and a faint straw tint marked template | LN must never read as glass or vanish on the dark field (R13 audit lesson): edge rim from F0 = 0.142 (derived, n = 2.21), plus a crystal-axis gizmo on every LN body |
| E7 | Tools: only the most involved part, built procedurally | Cz puller (crucible, seed rod, meniscus), wire saw web, CMP pad + head + slurry arm, implanter end station with scanned beam, wafer bonder chucks with centre pin, stepper reticle + lens bottom + stage, ICP coil glow, gridded IBE source with tilted stage, wet bench cassette, e-beam evaporator vapour cone, grinder cup wheel, 6-axis fiber stage, GSG probe |
| E8 | HUD: step n/N, step name, route, equipment, real elapsed process time, parameters with badges, mini profile plot (T(t) for anneal/split, depth(t) for etch, thickness(t) for CMP) | Parameter list = the step's PDims; `na` shows "n/a"; analog values show the source key and an analog mark |
| E9 | Controls: play/pause, reverse play, step back/forward, scrub bar with step ticks coloured by phase, speed 0.5x/1x/2x/4x, loop, route switch, scale toggle, layout switch; keyboard (space, left/right, shift+left/right, [ / ]); URL hash `#route=ridge_duv&step=s17r_ln_etch&t=0.40` | Route switch keeps the step if it exists in both routes, otherwise jumps to the nearest shared step |
| E10 | Budgets (R05 B9): mobile <= 150k triangles, <= 50 draw calls, 1 transmissive mesh; desktop <= 500k, <= 150; DPR cap 2; lazy chunk; poster first | The R13 reference viewer reached 126 draw calls on desktop; the LN viewer must meet the mobile budget at 390 px |

### Physical models (inputs from `process-flow.yaml`)

| Step | Model | Status of inputs |
|---|---|---|
| s03 pull | L(t) = v_pull t; rotation at rotation_rate; meniscus drawn at the melt surface | reported (analog, review table); seed orientation and cone angles template |
| s08 implant | Gaussian He profile centred at 0.68 um; width template; damage shading | centre reported (analog); width template until SRIM table (open-questions Q6) |
| s09 bond | rigid flip about donor Y; bonding wave radiates from the centre pin | method reported (analog); wave speed template |
| s10 split | T(t) ramp to split temperature; residual donor lifts (peel motif) | temperatures reported (analog) |
| s11 CMP | Preston dz/dt = Kp P v; thickness map from a template non-uniformity; edge rim 8 mm | Kp template; edge exclusion reported (analog) |
| s15r expose | serpentine step-and-repeat of 22 x 22 mm fields; field count derived from wafer diameter and edge exclusion | reported (anchor) / derived |
| s17r, s16s etch | depth(t) = R t; mask-edge recession tan(a_LN) = S tan(a_mask); redeposition film ~ etched volume (template coefficient) | depth, angle, selectivity reported; rate analog or na; redeposition template |
| s17s clean | redeposition film removal over the step | ratio reported; rate template |
| s20r, s18s electrodes | line-of-sight deposition, lift-off | thickness reported |

### Acceptance checks (P = process viewer)

| ID | Check | Pass |
|---|---|---|
| P1 | Determinism: render all steps forward at t = 0, 0.25, 0.5, 0.75, 1 and backward; compare state hashes and pixels | 0 mismatches, both routes |
| P2 | Provenance: every number on screen resolves to a PDim; every reported PDim has source and locator; every template has a note | 0 orphans (scripted) |
| P3 | Analog marking: all analog PDims (36 in the 2026-10-25 file) show the analog mark and source key in the HUD | 36 / 36 |
| P4 | Scale: true-scale ruler reads 500 um handle, 4.7 um BOX, 600 nm film within 1 px of computed positions | pass at 1440 and 390 px |
| P5 | Constant aspect: during s11 CMP only the LN film height changes on screen; during s17r only the etched region changes | measured bounding boxes |
| P6 | Camera: pose unchanged across steps without `retarget`; scrubbing across a retarget step and back restores the prior pose exactly | pose equality |
| P7 | Budget: draw calls and triangles per step at 390 px within mobile budget; 0 idle frames after 1 s | log per step |
| P8 | Flip correctness: after s09 the crystal-axis gizmo shows the donor's +X pointing down (into the bond) and the in-plane axes mirrored consistently; directional ops after the flip act on the top (split) face | visual test plus state assert |
| P9 | Etch acts on the correct face and leaves the slab only in `ridge_duv`; `strip_dlc` exposes the BOX | state assert |
| P10 | HUD readouts do not shift layout across all steps (fixed formats below) | 0 shifts |
| P11 | Reduced motion: no autoplay; step buttons still work; motifs static | manual + scripted |

Fixed readout formats: step `07/30` (5 ch); process time `110.0 h` (`####.# u`, 8 ch, unit from {s, min, h}); temperature `1255 C` (6 ch); thickness `0600 nm` (7 ch); energy `195 keV` (7 ch); fluence `4.0e16 cm-2` (11 ch); rate `24.0 nm/min` (11 ch).

### TECH treatment
Static by default. Left: a step list as a log table (mono, uppercase header: `#`, `STEP`, `TOOL`, `T_PROC`, `STATUS MIX`). Right: an ASCII cross-section of the current step (characters per material: `L` LN, `o` SiO2, `S` Si, `A` Au, `d` DLC, `r` resist, `~` redeposition), drawn in illustrative z-map, with a true-scale bar beneath. HUD as a boxed table of PDims with SKU badges. Controls: 18 px segmented buttons, scrub as a native range input with step ticks. No 3D, no motion except the scrub the reader drives.

### VISUAL treatment
three.js scene (R05 B5 stack), engraving-style art direction for tools (chapter art, DevLog-003b sec. 5: hatch shading in a post pass, geometry true), luminous LN with axis gizmo, melt in a template display colour (a blackbody colour at the melt temperature is not computed), IBE beam as a translucent cone, ICP glow as a toroid. PiP inset bottom-right with the wafer site map (R12 wafer-map motif) highlighting the current die. HUD in a right rail with 22 px tabular readouts and diamond badges. 44 px controls.

### Moment of joy
At s10 the residual donor lifts off the bonded wafer like a page peeling (R12 ion-slice peel motif), revealing a film whose true thickness the reader can then toggle into view: at true scale the 600 nm film disappears into a line, and the illustrative z-map grows it back.

---

## F05-02 Czochralski puller and composition

Placement: 5.2.

Question: How fast does a 150 mm boule grow, and why is the melt not LiNbO3 of formula composition?

Model and data:
- Inputs: pull rate 1-2 mm/h, rotation 5-10 rpm, 153 mm x 110 mm (reported via review, S); Bordui and Iyi Tc fits (P-comp); congruent 48.45 mol% (P-comp); melting point 1255 C (P-comp).
- Outputs: body length vs time L(t) = v t (derived), pull time 55-110 h (derived), body mass 9.4 kg (derived), Tc(c) curves for both fits with the reported Tc points (CLN 1140, 1142.3; SLN 1206, 1213 marked "conflict").
- Template: crucible size, seed orientation, cone angles, afterheater (labelled).

TECH: two panels. (a) Side profile of the boule as an ASCII silhouette growing with a time slider 0-110 h; readouts `L = 082.5 mm`, `t = 055.0 h`. (b) Tc vs composition plot 48-50 mol% Li2O, two lines (Bordui, Iyi), points with badges.

VISUAL: cutaway puller (crucible, RF coil, afterheater) with the crystal rotating at the selected rate and rising; meniscus glow in a template display colour; growth striations faintly visible every rotation (template, decorative). Composition panel beneath as a temperature axis that places Tc for the chosen composition next to Tm.

Moment of joy: dragging composition toward 50 mol% moves Tc up the shared temperature axis toward the melting point, and the label explains why near-stoichiometric crystals need a double crucible or VTE instead of a plain melt.

Readouts: `L 000.0 mm` (10 ch), `t 000.0 h` (9 ch), `Tc 0000.0 C` (11 ch), `c 00.00 mol%` (12 ch).

Acceptance: L(t) at 110 h equals 110 mm at 1 mm/h; Tc(48.38) = 1143.2 C (Bordui) and 1138.7 C (Iyi); layout-shift test at slider extremes.

---

## F05-03 Wafer and cut explorer

Placement: 5.3.

Question: Which crystal axis is normal to an x-, y-, z-, or 128 deg Y-X cut wafer, and which electro-optic coefficient does a TE mode use on each?

Model and data:
- Rotation of crystal axes into wafer axes (IEEE 176-1987 frame; uses PHY lane tensor rotation).
- Outputs: wafer-normal direction, in-plane axes, the r-coefficient engaged for TE/TM with an in-plane or vertical field (from PHY lane tensors, derived), Euler angles in the convention the page states (one convention only; R02 sec. 2.2 warns of conflicts).
- Flats: template positions (vendor-specific; open-questions Q4); wafer diameters 76.2, 100, 150, 200 mm and thicknesses 350 um (4-inch) and 500 um (6-inch) reported for 128 Y LN [R09:S3].

TECH: wafer outline with flat, axis triad as ASCII arrows; table of cut, normal, in-plane axes, Euler angles; badge per row.

VISUAL: rotating translucent wafer with crystal-axis gizmo, flat edge highlighted; a ghost of the hexagonal prism (from C01's cell) shows the cut plane through the crystal.

Moment of joy: rotating the cut angle continuously from Y to 128 deg Y-X shows the cut plane sweeping through the prism, landing on the SAW cut used in phone filters.

Readouts: `theta 128.0 deg` (15 ch), `n = (+0.000, -0.616, +0.788)` (fixed signed format).

Acceptance: normal vector for 128 deg Y-X matches PHY rotation output to 1e-6; flat drawn with template badge; layout-shift test.

---

## F05-04 Bulk waveguides: Ti indiffusion and proton exchange

Placement: 5.4.

Question: How deep do Ti and proton-exchange waveguides form for a given temperature and time?

Model and data:
- Proton exchange: depth^2 = r(T) t with r = 1.37 um^2/h at 249 C and 0.37 um^2/h at 217 C (x-cut, reported [jackel1982; P(abs)]); Arrhenius interpolation through the two points gives E_a = 0.90 eV (derived) and is valid only between 217 and 249 C; outside that band the curve is drawn dashed (template extrapolation). The meaning of "rate" (d^2/t vs D) is open (Q5); a toggle shows both conventions, labelled.
- Ti: reported recipes as points only (80 nm Ti, 1060 C, 9 h [luo2019sciadv]; 1035 C, 12 h [chung2017]). No diffusion coefficient sourced: no Ti curve is drawn (placeholder text "no sourced diffusion coefficient; recipes shown as points").
- Index step for PE: +0.12 extraordinary (reported).

TECH: depth vs time plot (log toggle on time), temperature slider 200-250 C; points for Ti recipes in a separate panel.

VISUAL: cross-section of an x-cut wafer under a mask opening with the exchanged region growing; ordinary vs extraordinary index shown as two colours (only the e-index rises).

Moment of joy: switching polarization from TE to TM on the same PE guide shows the guided mode vanish, because only the extraordinary index rises.

Readouts: `T 249 C`, `t 04.0 h`, `d 2.34 um`.

Acceptance: d at 249 C, 4 h = 2.34 um under the d^2/t convention (derived); dashed outside 217-249 C; layout-shift test.

---

## F05-05 Ion slicing: implant depth and peel

Placement: 5.5.

Question: How does implant energy set film thickness, and what are the thermal steps from implant to split?

Model and data:
- Reported anchor points: He+ 195 keV -> peak 0.68 um (guarino2007); 680 nm film (rabiei2004, energy not in abstract); LNOI He above 200 keV (wang2024nature statement); H+ 100 keV, 7e16 cm^-2 (LiTaO3, analog).
- Range curve R_p(E) for He and H in LiNbO3: template until a SRIM table is computed and stored with inputs (density 4647 kg/m^3, stoichiometry, 7 deg tilt, SRIM version) as `derived` (Q6). Until then the figure draws only the reported points and a dashed "SRIM pending" band.
- Thermal timeline: implant at 100 C; RT bond; < 200 C strengthening; about 230 C split (er_smartcut2022); alternatives 150 C 2 h (you2019), 190 C 10 h (LT analog); 520 C 2 h O2 device anneal (shamsansari2022).

TECH: two panels: (a) depth vs energy with points and the pending band; (b) temperature vs step timeline as a step plot with badges.

VISUAL: donor wafer in cross-section; ions rain in at the chosen energy and stop in a glowing plane; after bond and flip, warming makes the plane bloom with microcavities (template visual) and the donor peels away (R12 peel motif).

Moment of joy: the peel. Dragging the energy slider before the peel changes how thick a film comes off.

Readouts: `E 195 keV`, `Rp 0.68 um` (badge reported or template), `T 230 C`.

Acceptance: no curve drawn without a stored derived table; the 195 keV point sits at 0.68 um; layout-shift test.

---

## F05-06 CMP thinning and thickness maps

Placement: 5.5 (after split) and 5.7 (wafer-scale uniformity).

Question: How much is polished off after the split, and how uniform is a 600 nm film across a 100 mm wafer?

Model and data:
- Preston: dz/dt = Kp P v [preston1927; U bibliographic]. Kp for LN: template (no source). P and v sliders with template ranges; removal target derived from split depth minus target (0.68 um - 0.60 um = 80 nm, derived from analog inputs).
- Uniformity: etch-depth standard deviation 5.9 nm over a 4-inch wafer with 8 mm edge exclusion, 3.2 nm with a further 6 mm excluded (luke2020); the thickness map itself is not re-keyed (paper figure); the site renders a template map with the reported standard deviation and states so.
- Optional overlay: interference colour of the film under white light from the PHY thin-film model (derived), matching the site's wafer-colour widget (R03, R05 A04).

TECH: wafer outline with a contour map (template field, labelled), readouts of mean and sigma; Preston controls.

VISUAL: CMP pad, head, and slurry arm over the wafer; film colour shifts through interference orders as it thins (derived colour from thickness).

Moment of joy: the film changes colour as it is polished, the way the real wafer does under room light; the colour is computed from the thickness and LN dispersion.

Readouts: `h 0600 nm`, `sigma 05.9 nm`, `Kp template`.

Acceptance: colour at 600 nm equals PHY thin-film output; template badges on Kp and the map; layout-shift test.

---

## F05-07 Writing the pattern: e-beam raster vs DUV stepper

Placement: 5.7.

Question: Why did wafer-scale TFLN need optical steppers?

Model and data:
- EBL time t = D A / I (derived) with presets from kaufmann2023 (bulk 7600 uC/cm^2 at 100 nA; sleeve 1900 uC/cm^2 x 4 passes at 8 nA), jiang2016 (300 uC/cm^2 at 2 nA). Pattern-area fraction slider (template default).
- DUV: under 1 min per wafer; authors' EBL estimate above 8 days at 10 nA, 125 kV (luke2020).
- Site map: 22 x 22 mm fields stepped across 100 or 150 mm wafers with the 8 mm edge exclusion; field count derived.

TECH: log-scale bar chart of write time per wafer (EBL presets vs DUV), with the area-fraction slider; ASCII wafer site map with field grid.

VISUAL: a beam spot rastering a serpentine over one waveguide (R12 e-beam raster motif) beside a stepper flashing whole fields across the wafer; the timers run at the same compressed rate.

Moment of joy: both machines start together; the stepper finishes the wafer while the e-beam is still on its first ring.

Readouts: `t_EBL 0021.1 h/cm2`, `t_DUV < 1 min/wafer`, `fields 006` (100 mm, 8 mm exclusion, best of 2 grid offsets; 150 mm gives 021, derived).

Acceptance: t = 21.1 h per cm^2 at 7600 uC/cm^2, 100 nA, 100% area; field count matches geometric computation; log toggle; layout-shift test.

---

## F05-08 Argon etching: sidewall angle and redeposition

Placement: 5.7.

Question: What sets the sidewall angle of an Ar-etched LN waveguide, and when does redeposition stop?

Model and data:
- Mask-edge recession (derived geometry): tan(a_LN) = S tan(a_mask), S = R_LN / R_mask. Inputs: S = 3 (DLC) and 1 (SiO2) (li2023nc); a_mask = 85 deg (HSQ after development, kaufmann2023); others template.
- Measured comparison points: about 60 deg (SiO2-masked ridges, as characterized by li2023nc), about 75 deg (Cr mask, krasnokutska2018), 80 deg (DLC, li2023nc).
- Redeposition regime: map of DC bias (100-800 V) and pressure (0.3-15 mTorr) with the reported redeposition-free regions (5-7 mTorr at 600 V, about 11 mTorr at 400 V) and lateral-etch onsets (7 mTorr at 600 V, 9 mTorr at 400 V) from kaufmann2023, drawn as points and bands, not as a fitted surface.
- Redeposition film growth: template coefficient (labelled).

TECH: cross-section ASCII profile updated by S and a_mask; regime map as a boxed scatter with badges; readout of model angle vs nearest measured point.

VISUAL: animated cross-section with an ion flux, mask eroding, sidewall forming, grey redeposition crust accumulating; toggle "SC-1 clean" dissolves it.

Moment of joy: raising S from 1 to 3 straightens the sidewall in real time, and the reported 80 deg DLC point lights up near the model curve; the model upper bound sits above the measured angles, and the caption names the reasons (angle-dependent yield, redeposition).

Readouts: `S 3.0`, `a_mask 85.0 deg`, `a_LN 88.3 deg (model, upper bound)`.

Acceptance: tan(a_LN) identity holds numerically; measured points carry their badges; no fitted surface drawn on the regime map; layout-shift test.

---

## F05-09 Loss and Q by fabrication route

Placement: 5.7 end.

Question: Which fabrication routes produced the lowest loss, and when?

Data: rows from manuscript 5.7 "Loss and Q by fabrication route" and R08 sec. 2.1 (each with DOI, date, route, metric, status). Units: dB/m on a log axis; intrinsic Q on a secondary log axis via Q-to-loss conversion at 1550 nm (derived, with group index stated per row or template n_g if not reported, labelled).

TECH: log-scale scatter of loss vs year, marker shape by route (EBL+Ar, DUV+Ar, DUV+DLC, PLACE, CMP-from-bulk), material-limit line at about 0.2 dB/m (shamsansari2022) dashed.

VISUAL: same data as a "descent" chart with route colours; hover card per paper.

Moment of joy: hovering the material-limit line shows how close each route came, and the anneal arrow (1.5 to 0.2 dB/m) from shamsansari2022 shows the gap closing.

Readouts: hover card in a fixed 360 px box.

Acceptance: every point has DOI and status; log toggle; Q conversion formula shown in L3; no point from preprints without the preprint badge.

---

## F05-10 Periodic poling of a thin film

Placement: 5.10.

Question: How does a comb electrode on an x-cut film flip domains, and what limits the period?

Model and data:
- Electrostatics of coplanar electrodes on LN/SiO2/Si (PHY lane solver), field vs depth.
- Threshold rule: domain growth where |E| > E_threshold; E_threshold slider default 21 kV/mm (bulk CLN, reported) with marks at 28.2 kV/mm (thin-film value quoted by chen2024materials, S) and 3 Ec peak (chen2024materials).
- Period presets 4.38 and 5.51 um (chen2024materials), 600 nm (zhao2020jap), 747 nm (R08 for nagy2020).
- Duty cycle and depth fraction outputs; d_eff = (2/pi) d33 sin(pi D) x depth overlap (formula from R08 sec. 3.7; d33 from PHY data).
- Template: nucleation and wall-velocity kinetics (no LN thin-film parameters sourced).

TECH: cross-section field map (ASCII shading levels) under one electrode period, duty-cycle readout.

VISUAL: comb electrode in 3D over the film; pulse button sends a voltage; domains grow from tooth edges as hexagon-faceted fronts (template kinetics), domain walls glow under a simulated SH microscope view.

Moment of joy: shrinking the period until neighbouring domains merge shows why sub-micrometre poling needs special pulses.

Readouts: `Lambda 4.38 um`, `E_peak 63.0 kV/mm`, `D 0.50`.

Acceptance: field solution matches PHY solver; kinetics labelled template; layout-shift test.

---

## F05-11 From rock to chip: value chain with mass budget

Placement: 5.1.

Question: Where do the atoms in a modulator come from, and how much niobium does a wafer hold?

Data: USGS 2026 Nb and Li figures (R09 S1, S2; F); LN mass and Nb mass per wafer (derived, manuscript 5.1); R09 value-chain nodes (pyrochlore, brine/spodumene, Nb2O5, Li2CO3, boule, wafer, LNOI, foundry, chip, module) each with 2-4 sourced facts and grades.

TECH: horizontal flow of boxed nodes (DevLog-003a table style), mass readout per wafer size selector.

VISUAL: Isotype-style quantity graphics (chapter 08 rule: only sourced counts), a wafer whose niobium content is shown as a small cube to scale beside the wafer.

Moment of joy: choosing 200 mm shows a 46 g niobium cube next to a wafer, against 112,000 t of world niobium output a year.

Readouts: `m_LN 041.1 g`, `m_Nb 025.8 g`.

Acceptance: masses recompute from density 4647 kg/m^3 and molar masses; every node fact has a grade badge; layout-shift test.
