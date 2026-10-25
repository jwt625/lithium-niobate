# R12: Theme and visual language

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Status | Draft for discussion (design proposals, not facts) |
| Author | Claude Code (coordinator), at Wentao Jiang's request |

Kickoff asks: the material should feel like it welcomes the visitor; subtle thematic details everywhere (background textures, decorative page elements) with one consistent theme, borrowing from art, architecture, nature, and industry to echo fabrication, applications, and physical effects. This note proposes the theme, a design grammar, and a motif catalog. Facts used as design anchors are cited or flagged "verify".

## 1. Anchor facts the theme can stand on

| Anchor | Status | Source |
|---|---|---|
| Niobium is named after Niobe, daughter of Tantalus; tantalum after Tantalus (Heinrich Rose, 1844 naming per most etymologies; Wikipedia account says 1846) | verified (two sources) | https://en.wikipedia.org/wiki/Niobium ; https://www.vanderkrogt.net/elements/element.php?num=41 |
| Rose also named "pelopium" after Pelops, Niobe's brother, later shown not to be a new element | verified | same as above |
| So LiNbO3 and LiTaO3 are, by etymology, daughter and father; lithium is from Greek lithos, "stone" | lithium etymology: verify (R07) | - |
| Trigonal, point group 3m, space group R3c; oxygen octahedra stacked along c, filled in the sequence Li, Nb, vacancy | verify exact wording (R06) | Weis & Gaylord 1985 |
| Uniaxial: a z-cut plate between crossed polarizers in convergent light shows a Maltese-cross isogyre with isochromatic rings; transverse field changes the figure (Pockels effect demonstrations use exactly this) | verified as classroom experiment | https://www.leybold-shop.com/physics/physics-experiments/optics/polarization/pockels-effect/demonstrating-the-pockels-effect-in-a-conoscopic-beam-path/vp5-4-5-1.html |
| Poled domains in congruent z-cut LN tend to hexagonal shapes reflecting threefold symmetry (round at the surface, hexagonal at depth in one study); stoichiometric LN reports differ | partly verified; domain shape vs composition: verify (R08) | https://www.ntmdt-si.com/data/media/files/publications/2005/e_soergel_2005.pdf |
| Congruent LN is colorless to pale yellow; MgO-doped and Fe-doped crystals differ in tint | verify (R06) | - |
| 532 nm green from frequency-doubled 1064 nm is the canonical PPLN / MgO:LN application color; 1550 nm telecom light is invisible | general knowledge; cite in site (R07/R09) | - |

## 2. Theme proposals

Three candidates, one recommended. All share the same physics-true palette (section 4).

| | A. Optic Axis (recommended) | B. Crystal Atelier | C. Niobe's Stone |
|---|---|---|---|
| Core image | The crystal c-axis as the spine of the site; scrolling travels along the axis through the octahedra (Li, Nb, vacancy, repeat) | A crystal-growth and fab workshop: Czochralski puller glowing, wafer maps, cleanroom yellow light | Greek myth: Niobe turned to stone that weeps; light flowing through stone as tears |
| Feel | Precise, luminous, scientific wonder | Warm craft, industry pride | Poetic, classical |
| Strength | One geometric motif that can be held fixed across every page (the APA y = 600 lesson, R13); deep physics in plain sight; lay-friendly color via polarization | Natural home for fab-flow viewer, wafer-map navigation, industry chapter | Memorable origin story; strong lay hook |
| Risk | Can feel cold if not warmed by color and voice | Narrow; history and theory feel bolted on | Melancholy myth vs "welcoming"; cliche classical styling |
| Use | Site-wide grammar | Becomes the Fabrication chapter's art direction | Becomes one story in History ("why the name"), not the theme |

Recommendation: A as the site grammar, with B and C as chapter-level art directions. This keeps one consistent theme while letting chapters borrow different art styles, the way the hybrid-bonding film kept one bond line under many styles (R13).

## 3. Design grammar for theme A

1. The axis line. A thin vertical line (the optic axis, c / z) runs through every page at a fixed x position (left margin on desktop, hidden or top bar on mobile). Section markers are octahedra on that line; their fill cycles Li, Nb, vacancy. Scroll position = position along c. Hover a marker for the section popup.
2. Ornament rule: point group 3m. Every decorative element obeys 3m symmetry (threefold rotation plus three mirror planes): trefoils, equilateral triangles, hexagons drawn as 3m (alternating edge treatment), triangular lattices. No 4-fold or 5-fold ornaments anywhere. An expert notices the in-joke; a lay visitor just sees coherent crystalline ornament. Architectural echo: Gothic tracery trefoils are 3m; only sources with 3-fold content are reduced to 3m (6- and 12-fold rose windows, asanoha / kikko kumiko, 6- and 12-fold star patterns); 4-, 5-, 8-, 10-, 16-fold sources (most girih, many rose windows) are excluded.
3. Polarization is the color source. Most color on the site appears the way it does in a crystal: interference colors between crossed polarizers (Michel-Levy-like birefringence colors), conoscopic rings, SHG green, telecom IR shown as a declared false color. Neutral UI otherwise. This gives a lay visitor color and beauty that is, underneath, real optics.
4. Two depths of every object. Each visual element has a lay reading and an expert reading reachable by hover (gwern-style popup, R10): e.g. a stripe border is "decoration" at first glance, and on hover "periodically poled domains, first-order period 6.8 um for 1064 -> 532 nm SHG in bulk congruent LN (Zelmon 1997, 21 C, `derived`)" (computed by the Sellmeier module, provenance tagged; R11, audit A).
5. Sharp corners (crystal facets), per the author's UI taste; corners can be cut at 60 degrees on hero cards to read as crystal facets rather than generic rectangles.
6. Determinism and provenance (R13): every illustration is a deterministic `render(t)` scene with notes and sources; numbers carry `reported` / `derived` / `template`.

## 4. Palette (physics-true)

| Token | Meaning | Proposed use |
|---|---|---|
| `ink` | Dark field (crossed polarizers, extinction) | Default background (dark default per the author's taste) |
| `paper` | Pale warm white (light theme), the faint yellow of a congruent crystal (verify tint) | Light theme background |
| `crystal` | Very pale straw / transparent | 3D crystal tint, glass panels |
| `shg-532` | 532 nm green | Primary accent: links, active states, nonlinear optics |
| `pump-1064` | Declared false color for 1064 nm | Pump beams |
| `telecom-1550` | Declared false color for 1550 nm (deep magenta or red, labeled as false color) | Telecom signals, modulator light |
| `shg-775` | 775 nm deep red (SHG of 1550) | TFLN PPLN content |
| `gold` | Au electrodes | RF, electrodes, CPW |
| `silicon` | Slate | Substrates |
| `oxide` | Translucent blue-grey | BOX, cladding |
| `interference-*` | Michel-Levy sequence | Decorative fills, data-viz categorical set only where physically motivated |

Colors as CSS tokens on `:root`, light/dark both defined; the dark theme is default.

## 5. Motif catalog: physical effects as subtle site behavior

Each row: physics in one line, borrowed reference, where it lives on the site, reduced-motion fallback. Effects named in the kickoff are marked (K).

| Effect | Physics (one line) | Borrowed reference | Site behavior | Reduced motion |
|---|---|---|---|---|
| Birefringence | Two indices n_o, n_e; double refraction | Iceland spar double image lore; stained glass | Headings show a faint o/e double image that merges on hover (tiny offset, 1-2 px) | Static, no offset |
| Conoscopic figure | Uniaxial crystal in convergent light between crossed polarizers | Gothic rose window | Logo and favicon: Maltese cross with rings; hero renders it live from Jones calculus; tilting the crystal (cursor / device tilt) moves the isogyre | Static logo |
| Pockels effect | Index change linear in E | Moire / op art (Bridget Riley) | Hero "voltage" slider deforms the conoscopic figure; MZI fringes in section dividers shift with scroll | Slider still works, no autoplay |
| Ferroelectric domains, poling, QPM | Spontaneous polarization +/-Ps; inverted domains with period Lambda for quasi-phase matching | Zebra stripes, barcode, woven textiles, Bauhaus stripes | Section dividers are poled-domain stripes with +z / -z arrows visible on hover; the period equals a real QPM period for the content of that page (provenance tagged) | Static stripes |
| Hexagonal domains (K: domain physics) | Domains grow as hexagons in z-cut CLN (verify vs SLN) | Honeycomb, basalt columns, snowflakes (6mm in nature; drawn with 3m decoration) | Background texture in the Materials chapter: sparse hexagonal domain etch pits (as after HF differential etch) | Static |
| Three-wave mixing: SHG, SFG, DFG, OPA, OPO (K) | chi(2): omega1 + omega2 -> omega3, phase matching | Musical chords; Seurat-like color mixing | Cursor "photons" in the Nonlinear chapter: two photons merge into one at the sum frequency when they cross a poled stripe; optional audible chord (off by default) | No cursor effect |
| Four-wave mixing, Kerr combs (K) | chi(3): 2 omega_p -> omega_s + omega_i; comb lines | Organ ranks and harmonic series (the author liked the organ track, R13) | Comb chapter: spectrum with lines that sound as a (declared stylized, zero-offset) harmonic series on hover (off by default) | Silent, static |
| OPO (K) | Parametric gain above threshold in a resonator | Bell, resonance, ripple tank | A ring resonator icon in the nav that "lights up" (oscillates) only after the visitor has scrolled past a threshold amount of content: a threshold phenomenon you trigger by reading | Icon static |
| Photorefractive effect (K, includes charge screening/shielding) | Light excites carriers that drift and trap; the space-charge field (partly screened by mobile charge) changes n via Pockels; reversible, decays with dark conductivity | Long-exposure light painting; cyanotype (light writes an image) | Easter egg: a green "laser" cursor leaves a faint index trace in the background texture that decays over tens of seconds (a stylized dielectric relaxation time); a site setting "MgO doping" makes the trace fainter and erase faster (MgO above threshold raises photoconductivity, reducing the space-charge field; R08 sec. 3.1) | Disabled |
| GRIIRA (K) | Green light induces infrared absorption in LN (relevant to high-power SHG) | Sunburn, photochromic lenses | Coupled to the photorefractive egg: where the green cursor dwells, nearby elements drawn in the IR false color dim slightly, then recover | Disabled |
| Li vacancies, non-stoichiometry, Li out-diffusion (K) | Congruent LN is Li-deficient (~48.4 mol% Li2O, verify); antisite Nb and Li vacancies; Li out-diffuses at high temperature | Pointillism (Seurat), missing tiles in a mosaic | Page background micro-texture: a 3m lattice of dots with a small fraction missing (vacancy concentration set by the selected composition: congruent vs stoichiometric); edges of the page show a slight depletion gradient (out-diffusion) | Static |
| Bias drift / DC drift (K) | Applied DC bias is screened over time by mobile charge, so the operating point drifts; mitigations in TFLN literature (R08) | Tide, sundial shadow | A tiny "bias" indicator in the footer whose operating point drifts slowly while the page is open, with a click to "re-lock" (a bias-control loop). Hover explains the real mechanism and links to the chapter | Static |
| Pyroelectric effect | Temperature change -> surface charge; sparks, cracking of films, dust attraction | Lightning, kintsugi (cracks repaired with gold) | 404 page: a pyroelectric discharge cracked this page; cracks heal in gold (kintsugi) | Static cracked image |
| Piezoelectric / acoustic waves (SAW) | Strain <-> field; interdigital transducers launch surface waves | Ripples on water, ukiyo-e waves | Phone-filter story in the Applications chapter: IDT fingers launching ripples; hover a ripple for velocity and coupling numbers | Static |
| Acousto-optics, piezo-optomechanics (author's PhD) | Phonons and photons coupled in nanostructures | Musical instruments, strings | Author's story page: a nanobeam mode that "plays" when hovered | Static |
| Czochralski growth (Fabrication) | Seed pulled and rotated from a melt near 1250 C (verify) | Glassblowing, honey drip, candle | Loading indicator: a tiny boule being pulled, its length = load progress | Static bar |
| Smart-cut / ion slicing | H or He implantation, bonding, splitting at the damaged layer | Mica cleaving, paper peeling, Japanese washi | Page transitions in the Fabrication chapter as a thin film peeling off | Cut |
| E-beam lithography and Ar ion milling | Raster writing; physical sputtering with sidewall angle and redeposition | Engraving (Duerer), etching (Rembrandt) | Fabrication chapter art direction: etching / engraving style; the e-beam raster draws headings | Static |
| Wafer and flat orientation | Crystal axes keyed to wafer flats; X-cut vs Z-cut | Compass rose, maps | Site map as a wafer map: every page is a die; the flat marks crystal orientation; hover a die to preview the page | Static map |
| Telecom modulator | MZI with traveling-wave electrodes | Railway junctions, rivers splitting and merging | Footer navigation as an MZI: the path splits to two arms (theory, practice) and recombines | Static |

All "behavior" items are subtle by default, respect `prefers-reduced-motion`, never block reading, and each has a hover popup that explains the real physics with sources (the "two depths" rule). Easter eggs can be listed on a hidden "Field guide to this site" page.

## 6. Chapter art directions (borrowed styles, R13 method)

The art style changes rendering, never geometry. Candidate mapping, one primary style per chapter:

| Chapter | Style | Why |
|---|---|---|
| Welcome / hero | Clean luminous 3D (polarized light, conoscopic figure) | Contemporary, joyful, true physics |
| What it is (structure) | Gothic tracery + stained glass in 3m | Symmetry made visible |
| History | Period-true styles per era: 1949 Bell Labs technical drawing, 1960s mid-century scientific illustration, 1980s telecom datasheet, 2017+ SEM false color | Time travel through visual culture |
| How it is made | Engraving / etching (Duerer, Rembrandt) for fab; warm craft lighting for Czochralski | Etch is etching |
| Physics (EO, piezo, nonlinear) | Bauhaus / Swiss International clarity; op art for interference | Diagrams that teach |
| Nonlinear optics | Seurat pointillism for photon mixing; risograph two-color for pump / signal | Color mixing as frequency mixing |
| Applications / industry | Isotype (Otto Neurath / Gerd Arntz pictograms) for markets and counts | Honest quantity graphics |
| The author's story | Lab-notebook (da Vinci red chalk / graph paper) | Personal, handmade |

## 7. Voice

- Lay layer: warm, second person, short sentences; the crystal can be introduced as a character once on the landing page ("Meet lithium niobate"), without a full first-person mascot (avoids cuteness wearing thin). Option to test: a first-person welcome line from the crystal.
- Expert layer: dense, cited, numbers with units and provenance, matching the author's writing standards.
- The author's love for the material shows through specifics: lab anecdotes from public papers, the 2018 notes revisited ("what I got wrong in 2018"), real recipes, honest failure modes.

## Website implications (ranked)

1. Adopt theme A (Optic Axis) with the 3m ornament rule and the polarization-as-color palette as the site-wide grammar.
2. Make the conoscopic figure the logo, favicon, and live hero (lay wow, expert truth, cheap to compute in a fragment shader).
3. Implement 4-6 subtle effect behaviors first (birefringent headings, poled-stripe dividers with real QPM periods, vacancy dot texture by composition, photorefractive cursor trace + GRIIRA, bias-drift footer, wafer-map site map); the rest later.
4. Chapter art directions per section 6, executed with the R13 scene contract.
5. Keep B (fab atelier) and C (Niobe naming story) as chapter-level content, not the site theme.
