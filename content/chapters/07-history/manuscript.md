# 07 History: lithium niobate, 1801 to 2026

| Field | Value |
|---|---|
| Lane | C07 |
| Date | 2026-10-25 |
| Span | 1801 (columbium) and 1928 (first structural report) to 2026-10 |
| Data | `events.yaml` (162 events), `refs.yaml` (213 sources), `images.yaml`, `glossary.yaml` |
| Inputs | R07 (history), R02 (author's reading stream), R04 (OFC 2026 corpus), R09 (industry), R12 (art direction); six research passes on 2026-10-25 (naming and origins; USSR; Japan; commercial Ti:LN and Europe; China; open R07 items); Crossref re-check of every DOI on 2026-10-25 |

## Conventions

- Citation form: `[ref-id, STATUS]`. Ref ids resolve in `refs.yaml`; event ids (`h-YYYY-...`) resolve in `events.yaml`.
- Status: **V** the record (Crossref, publisher abstract, archival scan, or the issuing organization's own page) confirms the publication or announcement and the claim restates it; **P** the publication is confirmed but the stated link or detail comes from a secondary source; **S** secondary only (trade press, snippet, catalog, retrospective); **derived** computed here from cited values, method stated.
- Vendor numbers are vendor claims even when the release itself is V.
- Dates are issue dates (Crossref published-print) unless stated. Institutions are standard attributions unless marked "byline".
- Items that could not be verified are not stated as fact; they sit in `open-questions.md`.
- Depth: L1 lay narrative and one interactive; L2 numbers, equations, mechanisms; L3 sources, status, disputes.

---

## 7.1 A crystal on paper (1801-1958)

### L1

In 1801 Charles Hatchett found an unknown metal in a mineral from North America and called it columbium [hatchett1802, V]. In 1802 Anders Ekeberg named another metal tantalum, after Tantalus of Greek myth, who stood in water he could never drink; the oxide would not dissolve even in excess acid [ekeberg1802, P; rose1844, V]. In 1809 William Hyde Wollaston argued the two were the same element [wollaston1809, V], and chemists accepted that for 35 years.

In 1844 Heinrich Rose in Berlin showed that tantalite from Bavaria held a second metal. He called it niobium, after Niobe, daughter of Tantalus, "to indicate the similarity" with tantalum [rose1844, V]. In 1846 he named a third, pelopium, after Niobe's brother Pelops [rose1846, V]; it was niobium again. In 1818 Berzelius had already named lithium from the Greek for stone, because his student Arfwedson found it in a mineral [arfwedson1818, V; berzelius1818, V]. So LiNbO3 is, by name, stone and Niobe; its sibling LiTaO3 is stone and Tantalus.

The earliest report of the compound found is a 1928 Oslo doctoral thesis by W. H. Zachariasen, a survey of oxide crystal structures [zachariasen1928, P]. In 1949 Bernd Matthias and Joseph Remeika at Bell Labs reported that single crystals of LiNbO3 and LiTaO3 are ferroelectric: each carries a built-in electric polarization that an applied field can reverse [matthias1949, V]. In 1958 Reisman and Holtzberg mapped how lithium oxide and niobium oxide melt together [reisman1958, V].

Interactive: **Family tree of names** (figures.md F7.1). Tantalus at the root, Niobe and Pelops as children; clicking a name shows the sentence in which the chemist coined it, with page and year.

### L2

**The naming sentence.** Rose 1844, Ann. Phys. 139, pp. 335-336: "Ich nenne dasselbe Niobium und sein Oxyd Niobsaure, von Niobe, der Tochter des Tantalus, um durch den Namen die Aehnlichkeit ... anzudeuten" [rose1844, V]. The paper was read to the Berlin Academy on 1844-10-31 [rose1844bericht, V]. Pelopium: Rose 1846, Ann. Phys. 145, p. 119, "von Pelops, dem Sohne des Tantalus, und dem Bruder der Niobe"; read 1846-07-16 [rose1846, V; rose1846bericht, V].

**Untangling.** Rose later recognized that his "pelopic" and "niobic" acids held the same metal; Marignac (1866) identified the white chloride as NbOCl3 and traced Rose's errors to the constant association of Nb with Ta [marignac1866, V]. The name niobium was chosen internationally in 1949 and accepted by IUPAC in 1950 [raynercanham2008, S; vanderkrogt-nb, S].

**Lithium.** Arfwedson's paper (Afhandlingar 6, Stockholm 1818) states that Berzelius proposed "Lithion" from the Greek for stone because the alkali was first found in the mineral kingdom; the petalite came from the Uto iron mine [arfwedson1818, V]. Berzelius announced it in a letter dated 1818-02-09 [berzelius1818, V]. The discovery is commonly dated 1817 [weeks1932, P].

**Ferroelectric, not ilmenite.** Matthias and Remeika titled their letter "Ferroelectricity in the ilmenite structure" and wrote that Zachariasen had described LiNbO3 (as "LiCbO3") "as belonging to the ilmenite structure, which is centro-symmetric" [matthias1949, V]. A centrosymmetric crystal cannot be ferroelectric, so the observation itself flagged the structural label. The 1966 Bell Labs X-ray and neutron studies fixed the structure as R3c [abrahams1966a, V; abrahams1966b, V]; the standard reading is that LN shares ilmenite's oxygen framework but orders its cations differently along c [abrahams1966a, P]. They also report that ceramics "show hardly any effect", which is why single crystals mattered from the start [matthias1949, V].

**Composition.** Reisman and Holtzberg mapped the Li2O-Nb2O5 system in 1958 [reisman1958, V]. Lerner, Legras and Dumas showed in 1968 that commercial crystals are Li-deficient [lerner1968, V]. Carruthers et al. located the congruent composition at 48.6 mol% Li2O by 93Nb NMR and Curie-temperature shifts, with a room-temperature solid solution of 48-50 mol% Li2O [carruthers1971, V]. A melt at the congruent point freezes to a crystal of the same composition, so a boule is uniform end to end; that crystal is lithium-poor.

**Czochralski's method.** "Ein neues Verfahren zur Messung der Kristallisationsgeschwindigkeit der Metalle" measured the maximum speed at which a thin crystal thread can be drawn continuously from its melt, held in a charcoal crucible [czochralski1918, V]. Received 1916-08-19, issued 1917-04-24 in volume 92, which is dated 1918.

### L3

| Claim | Source | Status |
|---|---|---|
| Columbium named 1801 (read 1801-11-26), printed 1802 | hatchett1802 (scan p. 65) | V |
| Tantalum named 1802 for the oxide's failure to take up acid | ekeberg1802 via rose1844 p. 318, wollaston1809 | P |
| Niobium named 1844; pelopium 1846 | rose1844, rose1846, both Berlin Bericht scans | V |
| Lithium from Greek "stone"; announced 1818 | arfwedson1818 p. 153, berzelius1818 | V |
| LiNbO3 in Zachariasen 1928 | citing papers only (matthias1949, abrahams1966a, bartasyte2017) | P |
| Ferroelectricity in LiNbO3, single crystals, 1949 | matthias1949 (full scan read) | V |
| Growth method of the 1949 crystals | not stated in the 1949 letter | open |
| Congruent 48.6 mol% Li2O | carruthers1971 abstract | V |
| Czochralski paper issued 1917-04-24 | issue scan, czochralski1918 | V |
| "Pen dipped in molten tin" (1916) | malecka2013, anecdote | S |

Niobium is 1844; secondary sources that give 1846 merge the niobium and pelopium papers (English Wikipedia text cites the 1844 paper but writes 1846) [rose1844, V; rose1846, V].

---

## 7.2 Bell Labs grows a crystal (1960-1967)

### L1

Between 1964 and 1966 a Bell Telephone Laboratories group measured how a voltage changes the speed of light in it [peterson1964, V], showed it could change laser color efficiently [boyd1964, V], pulled large single crystals from the melt [ballman1965, P], made the electric arrows in a whole crystal point the same way [nassau1966b, V], and published the crystal's complete description as five consecutive papers in one journal issue [nassau1966a, V; abrahams1966c, V]. In June 1965 J. A. Giordmaine and R. C. Miller used it to build the first tunable optical parametric oscillator: green laser light in, two new infrared colors out, tuned by warming the crystal [giordmaine1965, V; harris1969, P; belllabsrecord1965, S]. In the same year a Soviet group reported pulling lithium niobate crystals too [fedulov1965, P], and in 1967 Crystal Technology in Palo Alto began selling them [opticsorg-crystaltech, V].

Interactive: **Pull a boule** (F7.2). A seed is drawn from a melt at a chosen rate and rotation; the boule grows as an illustration; sizes and rates are not data. OPO dial: H2.

### L2

**Phase matching.** Boyd et al. (1964) established LiNbO3 as "an efficient phase matchable nonlinear optical material" [boyd1964, V]. In 1965 Miller, Boyd and Savage reached noncritical (90 degree) phase matching by temperature tuning, which removes walk-off between the fundamental and harmonic beams [miller1965, V].

**Single-domain crystals.** Nassau, Levinstein and Loiacono revealed domains by acid etching [nassau1965, V] and described growth, domain structure, dislocations, etching and the preparation of single-domain crystals in parts 1-2 of the 1966 series [nassau1966a, V; nassau1966b, V]. Abrahams and coworkers gave the X-ray and neutron structures at 24 C and the polycrystal X-ray study from 24 to 1200 C in parts 3-5 [abrahams1966a, V; abrahams1966b, V; abrahams1966c, V]. Electro-optic coefficients of single-domain material followed [lenzo1966, V], and Kaminow and Turner reviewed electro-optic modulators the same year [kaminow1966, V].

**Growth.** Ballman's paper covers Czochralski growth of several piezoelectric and ferroelectric materials, LN included [ballman1965, P]. Bell Labs had pulled large CaWO4 crystals for masers by 1960 [nassau1960, P]. A Bell Laboratories Record item of 1965 credits Ballman with the large-crystal technique and Nassau and Levinstein with crystal quality for the OPO work [belllabsrecord1965, S].

**USSR.** Fedulov et al., Kristallografiya 10, 268 (1965), is cited by four 1966 papers for Czochralski growth of LiNbO3, LiTaO3 and NaNbO3 [fedulov1965, P]. Smolenskii et al. reported the Curie temperature of LiNbO3 in January 1966 [smolenskii1966, V]. Yu. S. Kuz'minov's monographs on LN appeared in Russian in 1975 and 1987 and in English in 1990 (with A. M. Prokhorov) and 1999 [kuzminov-catalog, S].

### L3

| Claim | Source | Status |
|---|---|---|
| EO properties 1964; NLO 1964; noncritical PM 1965 | peterson1964, boyd1964, miller1965 | V |
| Ballman 1965 is LN Czochralski growth | ballman1965 via abrahams1966a, uecker2014 | P |
| First tunable OPO, 1965-06-14 | giordmaine1965 (metadata); "first tunable" per harris1969 (later secondary) | P |
| OPO pump 0.529 um, tuning 0.97-1.15 um by temperature | belllabsrecord1965 (Chinese translation) | S |
| Five-part series, JPCS 27, 983-1026 (1966) | Crossref, five DOIs | V |
| Soviet Czochralski LN 1965 | fedulov1965 via citing reference lists | P |
| Crystal Technology from 1967 | company statements | V (company claim) |

Dispute: who pulled LN first, Ballman (US, 1965-02) or Fedulov et al. (USSR, 1965)? See D3.

---

## 7.3 The damage that became a memory (1966-2018)

### L1

In 1966 a Bell Labs team with Arthur Ashkin as first author saw that laser beams left lasting changes in the refractive index of LiNbO3 and LiTaO3 [ashkin1966, V]. For frequency doubling this "optical damage" was a defect: the beam distorted itself. Two years later Bell Labs turned it around and wrote holograms into the crystal with light, with no chemical processing [chen1968, V]. RCA Laboratories found that warming the crystal fixes a hologram so reading does not erase it [amodei1971b, V], and that iron impurities, the cause of the damage, make better recording media when added on purpose [peterson1971, V; amodei1972, V]. By 1993 Northrop stored 5000 holograms in one iron-doped crystal [mok1993, V].

In 2018 Ashkin shared the Nobel Prize in Physics, for optical tweezers, at 96 [nobelapi-ashkin, V].

Interactive: **Write, fix, erase** (hero story H1, F7.3).

### L2

**Mechanism.** Chen (1969) measured extraordinary-index decreases up to 1e-3 under 20 mW of focused 488 nm light and explained them by photoexcited electrons drifting out of the illuminated region and retrapping at its edge; the resulting space-charge field changes the index through the electro-optic effect [chen1969, V]. Glass, von der Linde and Negran (1974) found that the main driver is a bulk photovoltaic current, with saturation voltages above 1000 V, about 1e5 V/cm, explained by the asymmetry of the lattice [glass1974, V]. Peterson, Glass and Negran (1971) identified iron impurities as the origin [peterson1971, V].

Order of magnitude (derived): Delta n = (1/2) n_e^3 r33 E_sc. With n_e about 2.2 (visible), r33 = 30.8 pm/V (clamped, Turner 1966 as compiled by Weis and Gaylord [weis1985, V]) and E_sc = 1e7 V/m [glass1974, V], Delta n is about 1.6e-3, the same order as Chen's 1e-3.

**Band-transport model.** Kukhtarev, Markov, Odulov, Soskin and Vinetskii (Ferroelectrics 22, Crossref issue date 1978-01, usually cited as 1979) wrote the rate and transport equations that most holographic-storage papers cite as "Kukhtarev's equations" [kukhtarev1978a, V; kukhtarev1978b, V]. In common notation, with donor density N_D, ionized donors N_D+, electrons n, intensity I, photoexcitation cross-section s, thermal rate beta, recombination gamma_R, mobility mu, and photovoltaic constant kappa:

- dN_D+/dt = (s I + beta)(N_D - N_D+) - gamma_R n N_D+
- j = e mu n E + mu k_B T grad(n) + kappa s (N_D - N_D+) I
- dn/dt = dN_D+/dt + (1/e) div(j)
- div(epsilon E) = e (N_D+ - N_A - n)

The photovoltaic term is Glass's [glass1974, V]. Theory of the photovoltaic (photogalvanic) current in noncentrosymmetric media: Fridkin [fridkin1977, V; fridkin1978, V; fridkin1979, V] and Belinicher and Sturman [belinicher1980, V].

**Fixing and doping.** Heating about 30 min at 100 C gives optically nonerasable holograms with diffraction efficiency up to 50% via thermally activated ionic drift [amodei1971b, V]. Transition-metal doping raised storage strength, with diffraction efficiencies "well over 50%" in a few millimeters [amodei1972, V; amodei1971a, V].

**Capacity.** Mok (1993): up to 5000 holograms of 320 x 220 pixel images in one Fe:LiNbO3 crystal, 90 degree geometry, fractal-space multiplexing [mok1993, V].

**The name.** The earliest paper title found with "photorefractive" is Kurz, Ferroelectrics 8, 437 (1974-01) [kurz1974, P]; Glass et al. used it in a title in 1974-08 [glass1974, V].

Damage-resistant dopants (MgO, Zn, In) and stoichiometric growth: 7.6. Consequences for modern devices: chapter 04.

### L3

| Claim | Source | Status |
|---|---|---|
| Discovery 1966-07-01, seven Bell Labs authors | ashkin1966 (no abstract online) | V |
| Holographic storage, no processing, thermally erasable | chen1968 abstract | V |
| Drift and retrapping model, Delta n_e up to 1e-3 | chen1969 abstract | V |
| Bulk photovoltaic driver, > 1000 V | glass1974 abstract | V |
| Iron as origin | peterson1971 abstract | V |
| Fixing at 100 C, 30 min, up to 50% | amodei1971b abstract | V |
| Kukhtarev equations; Kyiv | kukhtarev1978a/b (Crossref); Kyiv from a secondary citation | V / P |
| 5000 holograms; Northrop | mok1993 Optica page | V |
| Ashkin oldest laureate at award (96.08 y) | derived from Nobel API dates; surpassed by Goodenough 2019 | derived |
| First "photorefractive" title 1974 | Crossref and OpenAlex title search | P |


---

## 7.4 Sound on a crystal (1965-2022)

### L1

LiNbO3 is piezoelectric: squeeze it and charge appears, apply a voltage and it deforms. In 1965 Bell Labs measured how elastic waves travel through it [spencer1965, V]. The same year Richard White and Fred Voltmer at Berkeley invented the interdigital transducer, two interleaved metal combs that launch and catch sound waves along a crystal surface. Their first device was on quartz, not lithium niobate [white1965, V; whitevoltmer1965preprint, V].

At Tohoku University in Sendai, Kazuhiko Yamanouchi and Kimio Shibayama found a cut of LiNbO3 with large surface-wave coupling (64 degree rotated Y, 1972) and then a cut that removes a spurious wave (127.86 degree rotated Y, X-propagating, 1976) [yamanouchi1972, V; shibayama1976, V]. Sumitomo Metal Mining lists 128 degree rotated Y LN wafers for SAW filters [smm-products, V]. Surface acoustic wave (SAW) filters became practical in television receivers around 1980 and in radio-frequency filters on rotated-cut LN and LT in the late 1980s [kadota2011, S]. Murata acquired XBAR's developer, Resonant, in 2022 [murata-2022, V].

Interactive: **SAW ripple** (F7.4). An IDT launches a surface wave on a 128 Y-X plate; the finger period p sets the center frequency f0 = v_SAW / p. The substrate toggle switches to quartz, the substrate of the 1965 device, for which no velocity is held (frequency N/A).

### L2

**IDT.** White and Voltmer: "direct piezoelectric surface wave transduction by a spatially-periodic electrode on the plane surface of a piezoelectric plate"; 1000 A aluminum on a quartz bar; 15 and 45 Mc [whitevoltmer1965preprint, V]. The synchronous frequency of an IDT is f0 = v / p, with p the electrode period (one finger pair).

**Cuts.** Yamanouchi and Shibayama (1972): leaky SAW along X on 64 degree rotated Y-cut, K^2 = 0.113, attenuation 0.036 dB per wavelength on a free surface and zero when metallized; the Rayleigh wave on 130 degree Y-cut X-propagation has larger K^2 than Y-cut Z-propagation [yamanouchi1972, V]. Shibayama et al. (1976): a 127.86 degree rotated Y-cut X-propagating plate suppresses the slower shear wave, the most obstructive spurious component, while keeping large coupling [shibayama1976, V].

**Industry.** Kadota (Murata), writing in 2011: TV SAW filters practical about 1980; RF filters on 40-70 degree YX-LN and LT practical from the late 1980s; SiO2/Cu/YX-LN Love-wave duplexer practical 2003; SiO2/Au/YX-LN boundary-wave GSM receive filter 2005 [kadota2011, S]. Shin-Etsu lists LT development in 1984 [shinetsu-history, V]. Sumitomo Metal Mining was studying LN substrates for Ti:LN optics by 1989 [fujiwara1989a, V] and in 2014 planned to expand LT/LN SAW substrate output from 120k to 210k wafers per month [smm-2014, S]. Soitec contracted volume piezoelectric-on-insulator wafers (thin LT on oxide on Si) for Qualcomm filters in 2020 [eenews-2020-soitec, S].

### L3

| Claim | Source | Status |
|---|---|---|
| IDT invented 1965 on quartz | white1965 (Crossref); substrate from whitevoltmer1965preprint full text | V |
| 64 degree Y leaky SAW, K^2 = 0.113 | yamanouchi1972 abstract, Tohoku byline in Crossref | V |
| 127.86 degree Y-X cut | shibayama1976 abstract; Tohoku affiliation not on record | V / P |
| TV SAW ~1980; RF SAW late 1980s | kadota2011 retrospective | S |
| Murata-Resonant completion 2022-03-28 | murata-2022; LN not named by Murata | V |

The 1965 IDT was on quartz; SAW filters on LN date from the 1970s cuts above.

---

## 7.5 Light in a channel (1973-1991)

### L1

To make a modulator small and fast, light must be confined to a channel a few micrometers across, right under the electrodes. In 1973 Bell Labs published "Thin-film LiNbO3 electro-optic light modulator" [kaminow1973, V]. The "thin film" was not a separate film. It was the crystal's own surface, heated until lithium oxide escaped; the lithium-poor skin has a higher extraordinary index and traps light [carruthers1974, V]. In 1974 titanium stripes diffused into the crystal gave the Ti:LN waveguide [schmidt1974, V], the type used in the commercial modulators of 7.7; in 1982 an acid bath that swaps lithium for hydrogen gave another [jackel1982, V]. In 1985 Crystal Technology announced the first commercially available guided-wave modulator [becker1988, V]. In 1989 a French team reported a neodymium-doped LN channel-waveguide laser [lallier1989, V]; in 1991 Paderborn reported an erbium-doped one at 1.532 um [brinkmann1991, V].

Interactive: **Diffusion profile** (F7.5). For proton exchange, sliders set time and temperature and the step-index profile and guided mode update; for Li2O out-diffusion and Ti in-diffusion no diffusion constants are held, so only their reported depths are drawn. Thin film then and now: H3.

### L2

**Out-diffusion (1973-1974).** Kaminow et al.: "An out-diffused planar optical waveguide in LiNbO3 has been used to produce an efficient broad-band electro-optic phase modulator"; modulation index per volt 0.13 V^-1, base bandwidth 3.2 GHz with a 50 ohm load, 0.2 mW/MHz for 1 rad [kaminow1973, V]. Derived: the voltage for pi phase is pi / 0.13 V^-1, about 24 V, for a device whose length the abstract does not give. Carruthers, Kaminow and Stulz: out-diffusion of Li2O raises n_e enough for single- and multimode guides; diffusion activation energy in LiNbO3 68 +- 1.2 kcal/mol; a single-mode guide with effective thickness 12 um [carruthers1974, V].

**Ti in-diffusion (1974).** Ti, V and Ni films diffused into LiNbO3 give low-loss TE and TM guides; Ti gives single-mode guides confining light within about 1 um of the surface, with diffusion parameters controlling the waveguide independently [schmidt1974, V].

**Epitaxial films (1974).** Tien, Riva-Sanseverino and Ballman deflected a beam up to 4 degrees in an epitaxial LiNbO3 film waveguide [tien1974, V].

**Proton exchange (1982).** Benzoic acid melt at 200-250 C; step index increase 0.12 for extraordinary polarization only; diffusion 1.37 um^2/h at 249 C and 0.37 um^2/h at 217 C on x-cut; losses < 0.5 dB/cm at 633 nm; damages y-cut surfaces [jackel1982, V].

**Products and lasers.** Becker (1988): active guided-wave devices reported since about 1975, mostly Ti:LiNbO3; in 1985 Crystal Technology announced "the first commercially available product - a high-speed, efficient, intensity modulator" [becker1988, V]. Alferness reviewed waveguide EO modulators in 1982 [alferness1982, V]. Paderborn implanted erbium into LN waveguides (1990) [brinkmann1990, V] and reported what the authors called "the first integrated optical laser in LiNbO3" (a Nd:MgO:LiNbO3 channel-waveguide laser had been published in 1989-10 [lallier1989, V]; D13): Er3+ in-diffused, Ti channel guide, colour-centre pump at 1.477 um, CW at 1.532 um, threshold about 8 mW absorbed [brinkmann1991, V].

### L3

| Claim | Source | Status |
|---|---|---|
| 1973 "thin film" is an out-diffused guide in bulk LN; 0.13 V^-1; 3.2 GHz | kaminow1973 abstract (Crossref) | V |
| Li2O out-diffusion raises n_e; 12 um single-mode guide | carruthers1974 abstract | V |
| Ti guides within ~1 um of surface | schmidt1974 abstract | V |
| Proton exchange Delta n_e = 0.12 | jackel1982 abstract | V |
| First commercial guided-wave modulator 1985 | becker1988 abstract (single source) | V |
| Nd:MgO:LN channel-waveguide laser 1989; Er:Ti:LN waveguide laser 1991 ("first" is the 1991 authors' claim) | lallier1989 (Crossref), brinkmann1991 abstract | V; D13 |

---

## 7.6 Taming the crystal (1962-2021)

### L1

Two problems limited lithium niobate as a nonlinear crystal: high-power light induced index changes (optical damage), and second-harmonic phase matching held only at one angle and temperature. The responses changed the crystal itself: dopants and composition for the first, domain patterns for the second.

The damage: in 1980 a Chinese group reported that about 4.6 mol% magnesium raises the damage resistance of LiNbO3 at least a hundredfold [iqec1980, P; zheng2016, P]; a US team confirmed it in 1984 (their abstract opens "We have confirmed") and traced it to a hundredfold rise in photoconductivity [bryan1984, V]. Zinc (1990) and indium (1992) followed from Moscow [volk1990, V; volk1992, V]. Growing crystals with the full share of lithium also helped: by vapor treatment of fibers at Stanford (1987) [luh1987, V] and by a double crucible (Kitamura et al., 1992) [kitamura1992, V].

The colors: in 1962 Armstrong, Bloembergen, Ducuing and Pershan proposed flipping the crystal's nonlinearity every coherence length so that converted light keeps adding up [armstrong1962, V]. Electric-field poling of LN came 31 years later [yamada1993, V]. Story: H4.

### L2

**MgO.** The 1980 IQEC abstract (Zhong, Jin, Wu) is cited by Nankai authors for a doping threshold of 4.6 mol% Mg giving at least two orders of magnitude higher damage resistance than congruent LN [zheng2016, P]. Zhong's 1983 paper (Southwest Institute of Technical Physics, Chengdu) reports growth of heavily Mg-doped crystals and up to 2 W average second-harmonic power in an intracavity Q-switched Nd:YAG laser [zhong1983, V]. Bryan, Gerson and Tomaschke: greatly improved resistance at 4.5 at.% MgO or more, from a hundredfold increase in photoconductivity; OH absorption shifts from 2.87 to 2.83 um [bryan1984, V]. In the band-transport picture (7.3), a larger photoconductivity shortens the dielectric relaxation time and lowers the saturated space-charge field.

**Zn, In.** About 50% SHG conversion of 1.06 um without damage in LiNbO3:Zn, threshold about 4-6 mol% Zn in the melt [volk1990, V]; In in 1992 [volk1992, V]; review 1994 [volk1994, V]; monograph [volk2009, V].

**Stoichiometry.** Lerner, Legras and Dumas showed commercial LiNbO3 is Li-deficient [lerner1968, V]; the congruent composition is 48.6 mol% Li2O [carruthers1971, V]. Vapor transport equilibration with Li-rich powder raised the 1064 nm SHG phase-matching temperature of crystal fibers from 4 to 238 C, above the photorefractive annealing temperature [luh1987, V]. Double-crucible Czochralski growth with automatic powder supply gave stoichiometric boules [kitamura1992, V]. Oxide Corporation was founded in 2000-10 by Y. Furukawa, who left NIMS in 2003 [oxide-history, V]; Furukawa and Kitamura co-authored the 2000 study of photorefraction versus [Li]/[Nb] and MgO [furukawa2000, V].

**QPM.** Wave-vector mismatch for SHG: Delta k = k(2 omega) - 2 k(omega). Coherence length l_c = pi / Delta k. First-order QPM period Lambda = 2 l_c = lambda / (2 (n(2 omega) - n(omega))), with lambda the fundamental wavelength. The effective coefficient is d_eff = (2/pi) d33 for a 50% duty cycle (standard result; Fejer et al. 1992 [fejer1992, V]), and the harmonic power grows as N^2 with N coherent domains [xue1983, V]. Derived from the Zelmon et al. congruent-LN Sellmeier coefficients at 21 C [zelmon1997, V]: Lambda about 6.8 um for 1064 to 532 nm and 18.99 um for 1550 to 775 nm.

**Steps to PPLN** (detail in H4): Feng et al. 1980, domains grown in [feng1980, V]; Lim, Fejer, Byer 1989, waveguides [lim1989a, V; lim1989b, V]; Magel 1990, laser-heated pedestal growth, domains as thin as 1 um, SHG down to 407 nm [magel1990, V]; Yamada et al. 1993, field poling at room temperature [yamada1993, V]; Myers et al. 1995, PPLN OPOs [myers1995a, V; myers1995b, V]; Jundt 1997, the temperature-dependent n_e Sellmeier equation used for PPLN design [jundt1997, V]; NTT 2003, direct-bonded QPM-LN ridge waveguides, 44%/W SHG over 13 mm with high photorefractive resistance at room temperature [nishida2003, V]; NTT 2021, a PPLN waveguide OPA module giving 6.3 dB of squeezed light from DC to 6 THz [kashiwazaki2021, V].

**Sibling crystal.** Zhu, Zhu and Ming (Nanjing, 1997) used a quasi-periodic domain superlattice in LiTaO3 to couple SHG and sum-frequency generation and generate the third harmonic directly [zhu1997, V].

### L3

| Claim | Source | Status |
|---|---|---|
| MgO 1980 abstract exists in JOSA 70(6) IQEC block | iqec1980 (no authors in record) | P |
| 4.6 mol% threshold, > 100x | zheng2016 citing the 1980 abstract | P |
| Zhong at SWITP Chengdu (1983) | zhong1983 journal metadata | V |
| MgO >= 4.5 at.%, photoconductivity x100 | bryan1984 abstract | V |
| Bryan, Gerson, Tomaschke affiliations | bylines (journal page) | V |
| Zn 1990, In 1992 | volk1990, volk1992 | V |
| Double-crucible SLN 1992 | kitamura1992; NIRIM affiliation seen on furukawa2000 | V / P |
| Field poling, Sony 1993 | yamada1993 Crossref byline | V |

The 1980 MgO work is not shown to be from Nankai University; the first author's next paper lists the Southwest Institute of Technical Physics, Chengdu (D4). The 1997 Nanjing quasi-periodic superlattice is LiTaO3.

---

## 7.7 The internet's modulator (1985-2021)

### L1

Long-distance fiber links need a modulator that imprints data on a steady laser without disturbing its color. The first commercial guided-wave LN modulator went on sale in 1985 [becker1988, V]. Undersea routes were among the first to use external modulation [lfw-1995, S]; by 1997 vendors described LN modulators for 10 Gb/s [lightwave-1997, S]; by 2000 a review written by JDS Uniphase engineers listed them for 2.5, 10 and 40 Gb/s systems and analog cable TV [wooten2000, V; affiliation P]. Commercial use depended on drift: the bias point wanders as charge moves in the crystal. In 1992 Fujitsu wrote that there had been "no report to guarantee the long-term reliability of Ti:LiNbO3 devices against DC drift" and showed a design assured for 15 years [seino1992, V].

In 2009 Fujitsu introduced what it called the first DP-QPSK LN modulator, which writes data on the phase of light in two polarizations for 100 Gb/s per wavelength [fujitsu-2009, V]. By 2021 it had shipped one million [fujitsu-2021a, V]. The companies changed hands repeatedly: Crystal Technology to Gooch & Housego (2011) [gh-history, V], Lumentum's Italian LN line to Advanced Fiber Resources (2019) [lightwave-2019, S].

Interactive: **Bit rate by decade** (F7.7). A chart (log or linear) of the line rates named in dated sources (1997 10 Gb/s; 1998 10 and 20 Gb/s; 2000 40 Gb/s; 2009 100 Gb/s DP-QPSK; 2022 1.96 Tb/s single wavelength, research); each point opens its source with status.

### L2

**Device.** A Mach-Zehnder modulator splits light into two Ti:LN waveguide arms under traveling-wave electrodes; with push-pull drive the transmission is T = cos^2(pi V / (2 V_pi)) with V measured from the transmission maximum, or T = (1 - sin(pi V / V_pi)) / 2 about quadrature (closed form in chapter 06).

**DC drift.** Seino et al. (Fujitsu, OFC 1992 postdeadline): Ti:LN modulators were in transmission experiments and planned for commercial systems; a Si coating suppressed temperature and humidity drift; long-term DC drift "stable enough for use in commercial optical transmission systems" [seino1992, V]. Sumitomo Cement published DC-drift studies by 1993 [nagata1993, V]. Physics of drift: chapter 04.

**Dated product statements.** UTP: 10 Gb/s LN modulators (1997) [lightwave-1997, S]. Lucent X2600 family for 10 and 20 Gb/s (1998) [lightwave-1998, S]. Wooten et al. (2000): 2.5, 10 and 40 Gb/s digital systems, CATV analog, and 10 Gb/s RZ pulse generation plus data modulation in one device [wooten2000, V]. Fujitsu (2009-09-14): DP-QPSK LN modulator, 25 GHz, maximum 3.5 V drive, shipping 2009-12-01, described by Fujitsu as a world first [fujitsu-2009, V]. Fujitsu (2021-03-31): more than one million coherent LN modulators shipped by the end of 2021-02 and a 70% market share in 2020 (vendor claims) [fujitsu-2021a, V].

**Corporate lineage** (press-level unless marked): Crystal Technology, Palo Alto (oxide crystals from 1967 [opticsorg-crystaltech, V]; first commercial guided-wave modulator 1985 [becker1988, V]; acquired by G&H 2011-04-01 for USD 13.75 M [gh-history, V]). United Technologies Photonics to Uniphase 1995 [lightwave-1995, S], JDS Uniphase 1999 with Ramar [rfb-jdsu, S]. Pirelli Milan components to Corning 2000 [compoundsemi-2000, S]. Codeon to Covega 2003 [lightwave-2003, S]. EOSPACE from Boeing integrated optics, late 1997 [eospace-mgmt, V]. Photline (Besancon, 2000) to iXblue 2013 [photonicsonline-2015, S] to Exail 2022 [exail-2022, S]. Sumitomo Osaka Cement (formed 1994-10-01; Guangdong subsidiary 2011-11) [soc-history, V]. Lumentum's San Donato LN lines to AFR, signed 2019-11-28 [lightwave-2019, S].

### L3

| Claim | Source | Status |
|---|---|---|
| External modulation first deployed on submarine routes (no year) | lfw-1995, vendor authors | S |
| Wooten 2000 authors all JDSU | OpenAlex affiliation | P |
| 2.5/10/40 Gb/s | wooten2000 abstract (OpenAlex) | V |
| 15-year drift assurance 1992 | seino1992 abstract and byline | V |
| 2009 DP-QPSK; 1 M units by 2021-02 | fujitsu-2009, fujitsu-2021a (archived releases) | V (vendor claims) |
| Year Fujitsu or SOC first shipped Ti:LN modulators | not found | open |

---

## 7.8 Peeling the crystal (1995-2014)

### L1

To shrink a lithium niobate waveguide below a micrometer, the crystal itself has to be thin and sit on something with a much lower index. A related method came from silicon. In 1995 Michel Bruel at CEA-LETI in Grenoble implanted hydrogen into silicon, bonded it to another wafer, and heated it until a thin layer split off: Smart Cut [bruel1995, V]. In 1998 a Columbia-led team implanted ions deep into lithium niobate and lifted off 9-micrometer single-crystal films [levy1998, V]. In 2004 ETH Zurich sliced films 680 nm thick onto silicon dioxide and found the electro-optic coefficient intact [rabiei2004, V]. Paderborn and Zurich used the name lithium niobate on insulator, LNOI, in a 2012 review, when it already came as 3-inch wafers [poberaj2012, V]. A company in Jinan, NANOLN, founded in 2010, sold the films [nanoln-about, V].

Interactive: **Ion slice** (F7.8). Three steps on one cross-section: implant (depth set by an energy slider, on an illustrative scale through one sourced pair), bond to an oxidized substrate, split and polish. Thin film then and now: 7.5.

### L2

**Ion slicing.** Levy et al.: "Deep-ion implantation is used to create a buried sacrificial layer in single-crystal c-cut poled wafers of LiNbO3"; 9 um films separated and bonded to Si and GaAs [levy1998, V]. The same group's patent gives 3.8 MeV for a damage layer near 10 um depth and dilute HF etching, without tying them to the paper [us6540827, V]. Rabiei and Gunter: 680 nm films on SiO2 by ion slicing and wafer bonding, crystalline and optical quality comparable to bulk, r33 = 31 pm/V at 633 nm [rabiei2004, V]. CEA-LETI transferred LiNbO3 layers by Smart Cut for RF acoustic resonators in 2008-2010 [pijolat2008, V; moulet2008, V; pijolat2009, V; deguet2010, V].

**First devices.** EO-tunable microrings in a bonded film [guarino2007, V]. Photonic wires by Ar milling down to 1 x 0.73 um^2; 9.9 dB/cm (qTM) and 12.9 dB/cm (qTE) at 1.55 um [hu2009, V]. LNOI review: sub-micrometer films by ion slicing, two bonding techniques, 3-inch wafers, PP-LNOI SHG, microrings, photonic crystals [poberaj2012, V]. Harvard microdisks: Q about 1e5, on-chip SHG 0.109 /W [wang2014, V].

**Before thin-film wafers.** Ridge waveguides were etched into epitaxial Zn-substituted LN by ion-beam enhanced etching: near-vertical sidewalls, 0.9 dB/cm at 1064 nm [hartung2008, V].

**Loss, 2009 to 2017** (derived): 9.9 dB/cm [hu2009, V] to 2.7 dB/m = 0.027 dB/cm [zhang2017, V], a factor of about 370.

### L3

| Claim | Source | Status |
|---|---|---|
| Smart Cut 1995 (silicon) | bruel1995 | V |
| CIS of LN 1998, 9 um films | levy1998 abstract | V |
| He ions, 3.8 MeV | us6540827 (not tied to paper) | P |
| 680 nm films, r33 31 pm/V | rabiei2004 abstract | V |
| "LNOI", 3-inch wafers by 2012 | poberaj2012 abstract | V |
| NANOLN founded 2010 | company page | V |
| NANOLN "world-first 3-inch film" 2015 | company claim via news (S); conflicts with poberaj2012 | S, disputed (D8) |

---

## 7.9 The thin-film renaissance (2017-2023)

### L1

In 2017 a Harvard group etched lithium niobate film so smoothly that a microring reached a quality factor of ten million and light lost only 2.7 dB per meter [zhang2017, V]. In 2018 the same group, with Nokia Bell Labs, showed modulators driven at the voltages a computer chip supplies, carrying 210 Gb/s with under 0.5 dB on-chip loss [wang2018b, V]. Periodic poling moved to thin-film waveguides with a 4 um period [wang2018c, V]. Combs of evenly spaced colors, frequency shifters and lasers followed [zhang2019, V; hu2021, V; snigirev2023, V]. Sun Yat-sen University bonded the crystal onto silicon for 100 Gb/s modulators [he2019, V] and in 2022 reported 1.96 Tb/s on one wavelength with sub-volt drive [xu2022, V]. Companies formed in Cambridge MA (HyperLight, 2018) [lightwave-2021, S], Nanjing (Liobate, 2020) [liobate-company, V] and Lausanne (Luxtelligence, 2022) [luxtelligence-about, V]. In 2021 Fujitsu, which reported a 70% share of coherent LN modulators in 2020 [fujitsu-2021a, V, vendor claim], announced a commercial thin-film modulator rated for 20 years [fujitsu-2021b, V].

Interactive: **Before and after 2018** (F7.9). V_pi L versus 3 dB bandwidth of thin-film LN and LT modulators in the eo-modulator-atlas, by publication year; the year slider shows the devices published up to the chosen year.

### L2

**Platform numbers (abstracts).**

| Year | Result | Source |
|---|---|---|
| 2017 | Q = 1e7; 2.7 dB/m; dry-etched subwavelength waveguides | [zhang2017, V] |
| 2017 | LN film bonded on SiN, no LN etch | [chang2017, V] |
| 2018-01 | MZM 1.8 V cm; 40 Gbps | [wang2018a, V] |
| 2018-09 | Unetched LN on foundry Si photonics, > 106 GHz 3 dB electrical | [weigel2018, V] |
| 2018-10 | V_pi 1.4, 2.3, 4.4 V at 20, 10, 5 mm; 210 Gbit/s; 70 Gbit/s CMOS-driven; < 0.5 dB on-chip | [wang2018b, V] |
| 2018-11 | Nanophotonic PPLN 2600%/W cm^2; period 4 um | [wang2018c, V] |
| 2019-12 | PP-TFLN microring 250,000%/W; 15% at 115 uW | [lu2019, V] |
| 2020-08 | 4- and 6-inch wafers, DUV lithography, 0.27 dB/cm | [luke2020, V] |
| 2021-03 | RF V_pi 1.3 V, 1.8 dB roll-off at 50 GHz | [kharel2021, V] |
| 2022-01 | Dual-pol IQ, sub-1-V, 110 GHz, 1.96 Tb/s net | [xu2022, V] |
| 2022-07 | DP-IQ on Si substrate, single-carrier 1.6 Tb/s | [wang2022, V] |

Derived V_pi L from [wang2018b, V]: 2.8 V cm (20 mm), 2.3 V cm (10 mm), 2.2 V cm (5 mm).

**Commercial statements.** Fujitsu (2021-10-22): "commercializing the world's first thin-film LN modulator ... of the 200GBaud class", DC drift stabilized, 20-year reliability, package 60% smaller, 128 GBd HB-CDM samples planned for 2022-04 [fujitsu-2021b, V]. An 800G DR8 transceiver with a HyperLight TFLN modulator was shown at OFC 2022 [lightwave-2022, S]. HyperLight announced TFLN transmitter PICs for 200 G per lane and 1.6 Tb/s coherent in 2023 [bw-2023, S].

**Europe.** ELENA (EU H2020, 2022-01-01 to 2025-06-30, coordinator CSEM, EU contribution EUR 4.98 M) set out to build a European LN photonic platform and 150 mm LNOI supply [cordis-elena, V]. Luxtelligence was incorporated in 2022-10/2022-12 as an EPFL spin-off and released the open lnoi400 PDK in 2024-01/2024-03 [luxtelligence-about, V]. Lightium (Zurich, 2023) came from CSEM [opticsorg-2024, S].

### L3

| Claim | Source | Status |
|---|---|---|
| All rows in the table above | abstracts (Crossref or OpenAlex) or Nature page text | V |
| 3 dB bandwidth of wang2018b | not in accessible text | open |
| HyperLight founded 2018; founders | trade press, aggregators | S |
| Huawei co-authors on xu2022 | not in Crossref affiliations | open |
| Fujitsu "first" | scoped by Fujitsu to the 200 GBaud class | V (vendor claim), D9 |

---

## 7.10 Into the AI data center (2023-2026)

### L1

From 2023 most events in this chapter concern manufacturing and finance, and vendors tie them to AI infrastructure (HyperLight's 2026 Series C is "to accelerate TFLN deployment for AI infrastructure" [summit-2026, V]). Silicon Austria Labs showed an 8-inch thin-film wafer processed in-house in 2025 [sal-2025, V]; earlier 8-inch claims come from Chinese press reports (D7). In 2026 HyperLight partnered with the foundry UMC for 6- and 8-inch production [bw-2026-umc, V], and MediaTek led its Series C [summit-2026, V]. China issued a national standard for thin-film LN modulator wafers [gbt46611, V]. Switzerland spun out a foundry, CCRAFT [csem-2025, V]. Lithium tantalate, LN's sibling and the phone-filter crystal, entered integrated photonics [wang2024, V].

Interactive: **Dated news ticker** (F7.10). Every item from 2021-10 on with its date, source and status badge; vendor, reporter and institution claims tagged; filters by region and by kind.

### L2

**Wafer size, dated statements.**

| Date | Wafer | Statement | Status |
|---|---|---|---|
| 2012 | 3-inch LNOI | review | V [poberaj2012] |
| 2020-08 | 4- and 6-inch TFLN PICs | paper | V [luke2020] |
| 2023-09 | 8-inch TFLN line, Wuhan (Anpai) | reporter claim | S [sina-2024] |
| 2025-04 | 8-inch LN/LT bulk wafers, mass production (TDG) | company via press | S [cls-2025] |
| 2025-06 | 6-inch TFLN wafer (CHIPX, Wuxi) | trade press | S [c114-2025] |
| 2025-06 | 150 mm Europe-made LNOI (ELENA, Soitec) | trade press | S [picmag-2025; opticsorg-2025] |
| 2025-08 | 4-inch TFLN on quartz handle, > 110 GHz, V_pi < 3 V | paper | V [liu2025] |
| 2025-09 | 8-inch TFLN wafer (SAL, Villach) | institution | V [sal-2025] |
| 2026-01 | 200 mm TFLN-on-SiN and TFLN-on-SOI (Ligentec, X-FAB) | foundry | V [xfab-2026] |
| 2026-03 | 6- and 8-inch TFLN (HyperLight, UMC, Wavetek) | release | V [bw-2026-umc] |

**Devices and integration.** Lithium tantalate PICs on SOI-compatible lines, motivated by the LT wafer supply built for 5G filters [wang2024, V]. Micro-transfer-printed TFLN MZMs on imec silicon photonics, 2 km 160 GBd PAM-4 in the O-band [declercq2025, V]; heterogeneous LT on silicon photonics [niels2026, V]; imec's "double world-first" of both crystals on one platform [imec-2026, V]. A TFLN electro-optic circulator: up to 37 dB isolation over 14 THz, 400G per polarization bidirectional coherent transmission [starnault2026, V]. Review of integrated PPLN OPOs [wang2026, V].

**Money and products** (vendor or press): AFR volume shipment of 96 and 130 GBd TFLN coherent driver modulators and a 400 Gb/s per lane chip debut (2025-04-07) [afr-2025, V]; HyperLight 1.6T-DR8 reference transceiver at 20 W with one CW laser (2026-03-17) [bwchina-2026, V]; HyperLight Series B USD 37 M (2024) [lightwave-2024, S] and Series C USD 80 M led by MediaTek (2026-06-18) [summit-2026, V]; CCRAFT USD 7.8 M (2026-07) [csem-2026, V]; 3.2T OSFP on TFLN at 450 Gb/s per lane, ECOC 2026 [einnews-2026, S].

**China.** GB/T 46611-2025, "Lithium niobate single-crystal thin film for electro-optic modulator", issued 2025-10-31, in force 2026-05-01, drafted by 36 organizations led by Jinan Jingzheng (NANOLN), including universities, chip makers and module makers [gbt46611, V].

### L3

| Claim | Source | Status |
|---|---|---|
| HyperLight-UMC-Wavetek 2026-03-11 (Business Wire) / 2026-03-12 (UMC, press) | archived release | V |
| CEO: "The era of TFLN as a niche technology is over." | opticsorg-2026 | S |
| Every "first 8-inch" claim | see D7 | disputed |

---

## Hero stories

### H1. The damage that became a memory

**L1.** A laser meant to double frequency left lasting index changes in the crystal (1966) [ashkin1966, V]. Bell Labs used them to store holograms (1968) [chen1968, V]. RCA learned to make them permanent (1971) [amodei1971b, V] and stronger with iron (1972) [amodei1972, V]. Northrop stacked 5000 in one crystal (1993) [mok1993, V]. Meanwhile magnesium, zinc and indium raised its damage resistance, MgO at about 4.6 mol% by at least a hundredfold (1980-1992) [zheng2016, P] (7.6). The first author of the 1966 paper won a Nobel Prize in 2018, for a different use of light [nobelapi-ashkin, V].

**Interactive (F7.3).** Move over the plate: a 532 nm beam writes an index pattern, shown on a log scale. Buttons in date order: Read (1968) erases the pattern under uniform light; Fix (1971) copies it into a layer that light does not erase; MgO (1980 conference abstract, 1984 journal paper) raises photoconductivity about 100x, so the trace is weaker and relaxes faster. Model: single-center band transport reduced to a rate equation for the space-charge field (model: chapter 04); time constants are display values, not material data.

**L2.** Delta n = (1/2) n_e^3 r33 E_sc; E_sc up to about 1e5 V/cm from the bulk photovoltaic effect [glass1974, V]; observed Delta n_e up to 1e-3 [chen1969, V]. Fixing works because ions drift at 100 C and compensate the electronic grating, which then survives uniform illumination [amodei1971b, V]. MgO above threshold multiplies photoconductivity by about 100 [bryan1984, V].

**L3.** All events V except the earliest "photorefractive" title (P, title search) and the age ranking (derived); the Kyiv affiliation of the Kukhtarev papers is P.

### H2. The first OPO

**L1.** In 1965 Giordmaine and Miller pumped a lithium niobate crystal with green laser light inside a resonator and got two new beams whose colors moved when they warmed the crystal [giordmaine1965, V; belllabsrecord1965, S]. It was the first tunable optical parametric oscillator [harris1969, V]. In 1995 Stanford built a PPLN OPO, temperature-tuned at a 31 um period [myers1995a, V]. In 2026 reviews describe PPLN OPOs on thin-film chips [wang2026, V].

**Interactive (F7.2b).** An OPO dial: pump 0.529 um (1965) or 1.064 um (1995). The knob is the crystal angle in 1965 mode and the crystal temperature, plus a poling-period model extension, in 1995 mode; signal and idler follow from energy conservation and phase matching with the Zelmon 1997 (1965) and Jundt 1997 (1995) Sellmeier equations. The 1965 tuning band (0.97-1.15 um, S) and 1995 bands (1.66-2.95 um at 31 um period; 1.4-4 um overall) are drawn as reference bars with sources.

**L2.** Energy: 1/lambda_p = 1/lambda_s + 1/lambda_i. Momentum: k_p - k_s - k_i = 0 (birefringent, 1965) or = 2 pi / Lambda (QPM, 1995). Myers et al. (OL, 1995): 1.064 um pumped, temperature-tuned 1.66-2.95 um, threshold about 0.1 mJ, crystal 0.5 mm thick and 5.2 mm long, Lambda = 31 um [myers1995a, V]. JOSA B 1995: 1.4-4 um, threshold as low as 0.012 mJ, cw doubly resonant OPO near 1.96 um pumped by a 978 nm diode [myers1995b, V]. Giordmaine and Miller (S, via the Bell Laboratories Record translation): 5290 A pump, output 9700-11500 A, about 12 C of temperature change shifting each beam by more than 6%, efficiency about 0.45% [belllabsrecord1965, S].

**L3.** Operating details are from a secondary source (S); the 1965 PRL full text was not read. Pump laser type for 1965 not confirmed. Whether the 1965 crystal came from Ballman's Czochralski growth: the Record item credits Ballman with large-crystal growth (S).

### H3. What "thin film" meant: 1973 vs 2018

**L1.** In 1973 Bell Labs titled a paper "Thin-film LiNbO3 electro-optic light modulator" [kaminow1973, V]. The film was the crystal's own skin, made by baking out lithium oxide so the surface index rose [carruthers1974, V]. In 2018 "thin-film LN" meant a separate slice of crystal well under a micrometer thick (680 nm in the 2004 Zurich films [rabiei2004, V]), peeled from a wafer by ion implantation and bonded onto silicon dioxide (1998-2004 methods [levy1998, V; rabiei2004, V]). The same words describe guides about 18 times different in thickness and drive voltages about an order of magnitude apart (not normalized for length).

**Interactive (F7.5b).** Two cross-sections side by side at one scale: 1973, a graded index skin in bulk LN with the mode spread over micrometers; 2018, a sub-micrometer rib on SiO2 on Si with a tightly confined mode and electrodes micrometers away. A scale slider zooms from 50 um to 1 um field of view without moving either drawing's origin. Readouts: guide thickness, voltage for pi phase, bandwidth.

**L2.**

| | 1973-1974 | 2004-2022 |
|---|---|---|
| Guide | Li2O out-diffused skin in bulk LN; n_e raised | Ion-sliced single-crystal film on SiO2 |
| Thickness | single-mode guide effective thickness 12 um [carruthers1974, V] | 680 nm film [rabiei2004, V] |
| Ratio | about 18x (derived, 12 um / 0.68 um) | |
| Voltage | 0.13 rad/V, so about 24 V for pi (derived; length not given) [kaminow1973, V] | V_pi 1.4 V at 20 mm [wang2018b, V] |
| Bandwidth | 3.2 GHz, 50 ohm load [kaminow1973, V] | > 106 GHz 3 dB electrical (bonded hybrid) [weigel2018, V]; 110 GHz [xu2022, V] |
| Loss | N/A (not reported in the abstract) | < 0.5 dB on-chip [wang2018b, V] |

Note: the 12 um figure is from the 1974 kinetics paper by the same group, not the 1973 device; the 24 V figure has no length normalization. Both comparisons are order-of-magnitude.

**L3.** LNOI dates from 1998 (ion slicing) and 2004 (bonded sub-micrometer films), not from 2018 [levy1998, V; rabiei2004, V]. The 1973 guide is the same Li out-diffusion that chapter 04 treats as a fabrication hazard [carruthers1974, V].

### H4. The stripes

**L1.** Light at one color and its double travel at different speeds in a crystal, so the converted light builds up and then cancels every few micrometers. In 1962 Armstrong, Bloembergen, Ducuing and Pershan proposed reversing the crystal's nonlinearity at each of those points [armstrong1962, V]. In 1980 Feng Duan's group at Nanjing grew lithium niobate with such stripes built in [feng1980, V]. In 1989-1990 Stanford put stripes into waveguides and fibers [lim1989a, V; magel1990, V]. In 1993 Sony engineers wrote them by applying an external field at room temperature [yamada1993, V]. In 1995 Stanford built PPLN OPOs tunable from 1.4 to 4 um [myers1995a, V; myers1995b, V], and in 2018 the stripes moved onto chips [wang2018c, V].

**Interactive (F7.6).** A year scrubber from 1962 to 2019 over the rows of the table below. The domain strip changes from the 1962 schematic to growth stripes (1980), pedestal-grown fiber domains (1990) and an electrode-poled grating (1993); the phasor sum of SH contributions per coherence length is drawn live, and SH power grows as N^2 with flipped stripes and stays bounded without. The period readout is the first-order period for the chosen wavelength (Zelmon 1997 Sellmeier equation, derived).

**L2.**

| Year | Step | Numbers | Source |
|---|---|---|---|
| 1962 | Periodic reversal proposed | - | [armstrong1962, V] |
| 1980 | Czochralski-grown periodic laminar domains, half-period near l_c; QPM for d33 approximately realized | | [feng1980, V] |
| 1983 | Order-of-magnitude enhancement; SH power proportional to N^2, N up to 200 | | [xue1983, V] |
| 1989 | Planar PP waveguide, 532 nm, 5%/W cm^2, CW, room temperature | | [lim1989a, V] |
| 1990 | Laser-heated pedestal growth, 1 um domains, 407 nm, > 230 domains effective | | [magel1990, V] |
| 1992 | Tuning and tolerances | | [fejer1992, V] |
| 1993 | Field poling at room temperature; 20.7 mW blue; 600%/W cm^2 | | [yamada1993, V] |
| 1995 | Bulk PPLN OPO, Lambda = 31 um | | [myers1995a, V] |
| 1997 | Quasi-periodic superlattice THG (LiTaO3) | | [zhu1997, V] |
| 2003 | Direct-bonded QPM ridge, 44%/W | | [nishida2003, V] |
| 2018 | Nanophotonic PPLN, Lambda = 4 um, 2600%/W cm^2 | | [wang2018c, V] |
| 2019 | PP-TFLN microring, 250,000%/W | | [lu2019, V] |

Normalized efficiencies have different units (%/W cm^2 for waveguides, %/W for resonators) and are not comparable across rows.

**L3.** The 1980 abstract says only "Czochralski method"; the striation mechanism (rotation off the thermal axis) is the usual secondary account and is not stated in the abstract (P). The 1990 Stanford bulk work used growth, not electric poling; "periodically poled" in its title means periodic domains, however made.

---

## Sidebar: Who did it first?

| # | Question | What the sources say | Verdict on page |
|---|---|---|---|
| D1 | When was LiNbO3 first made or reported? | Zachariasen 1928 thesis, as cited by Matthias & Remeika 1949 [zachariasen1928, P; matthias1949, V]; single crystals by 1949 [matthias1949, V]. Boes et al. 2023: "first synthesized 70 years ago", about 1953 [boes2023, V]. A 2020 review reportedly says 1937 (snippet, unread). | "Structure reported 1928; ferroelectric single crystals 1949." The 2023 "70 years" phrase is approximate and later than the 1949 letter. |
| D2 | Is LN an ilmenite? | Matthias & Remeika call it ilmenite and note ilmenite is centrosymmetric [matthias1949, V]; 1966 structure R3c [abrahams1966a, V]. | Related to ilmenite, distinct cation order; not ilmenite. |
| D3 | First Czochralski LN | Ballman, US, 1965-02 [ballman1965, P]; Fedulov et al., USSR, 1965 [fedulov1965, P]. Exact Soviet month unknown. | Both 1965; credit both. |
| D4 | MgO:LN priority and origin | Zhong, Jin, Wu, IQEC abstract 1980-06 [iqec1980, P]; Bryan et al. 1984 [bryan1984, V]. Common attribution of the 1980 work to Nankai is not supported; Zhong's 1983 paper lists SWITP Chengdu [zhong1983, V]. | 1980 first (conference abstract), 1984 first journal paper. Affiliation of the 1980 abstract open. |
| D5 | Who invented QPM? | Armstrong et al. 1962 [armstrong1962, V]; Franken & Ward 1963 also credited [franken1963, P]. First LN experiment 1980 [feng1980, V]; waveguide 1989 [lim1989a, V]; field poling 1993 [yamada1993, V]. | A sequence, not one inventor. |
| D6 | Was the IDT invented on LN? | No: quartz [whitevoltmer1965preprint, V]. | Quartz, 1965. |
| D7 | First 8-inch TFLN | Anpai, Wuhan line 2023-09 (reporter: "world's first") [sina-2024, S]; Jiufengshan Lab first 8-inch Si-photonic TFLN wafer 2024-03 (reporter claim) [sina-2024, S]; SAL "First 8-Inch TFLN Wafer" 2025-09-25 [sal-2025, V]; 8-inch bulk LN wafers (TDG, 2025) are a different product [cls-2025, S]. | No single "first"; show each claim with date and grade. |
| D8 | First 3-inch LNOI | Poberaj et al. 2012 report LNOI "even as wafer of 3-inch diameter" [poberaj2012, V]; NANOLN news piece claims a world-first 3-inch film in 2015 [ifeng-2026, S]. | 2012 published; 2015 claim conflicts. |
| D9 | First commercial thin-film LN modulator | Fujitsu 2021-10-22, scoped to "200GBaud class" [fujitsu-2021b, V]; a HyperLight TFLN modulator inside an 800G transceiver demo at OFC 2022 [lightwave-2022, S]. | Fujitsu's claim is class-scoped; state it with its scope. |
| D10 | Czochralski 1916, 1917 or 1918? | Received 1916-08-19; issued 1917-04-24; volume dated 1918 [czochralski1918, V]; pen anecdote 1916 [malecka2013, S]. | Discovery 1916, publication 1917 (volume 1918). |
| D11 | Niobium named 1844 or 1846? | Niobium 1844, pelopium 1846 [rose1844, V; rose1846, V]. | 1844. |
| D12 | First OPO crystal's origin | Record item credits Ballman (growth) and Nassau and Levinstein (quality) [belllabsrecord1965, S]. | Bell Labs crystals; growth route not documented here. |
| D13 | First laser in an LN waveguide | Nd:MgO:LiNbO3 channel-waveguide laser, Electron. Lett. 1989-10-26 [lallier1989, V]; Brinkmann et al. 1991 call their Er:Ti:LN laser "the first integrated optical laser in LiNbO3" [brinkmann1991, V]. | 1989 Nd-doped; 1991 Er-doped at 1.532 um. |

---

## People and institutions

| Who / where | Role | Years | Key refs |
|---|---|---|---|
| C. Hatchett; A. G. Ekeberg; W. H. Wollaston | columbium; tantalum; their false identity | 1801-1809 | hatchett1802, ekeberg1802, wollaston1809 |
| J. A. Arfwedson, J. J. Berzelius (Stockholm) | lithium | 1817-1818 | arfwedson1818, berzelius1818 |
| H. Rose (Berlin); C. Marignac (Geneva); C. W. Blomstrand | niobium, pelopium; untangling Nb and Ta | 1844-1866 | rose1844, rose1846, marignac1866 |
| J. Czochralski (Berlin) | crystal pulling | 1916-1917 | czochralski1918 |
| W. H. Zachariasen (Oslo) | structure survey listing LiNbO3 | 1928 | zachariasen1928 |
| B. T. Matthias, J. P. Remeika (Bell Labs) | ferroelectricity | 1949 | matthias1949 |
| A. Reisman, F. Holtzberg (IBM) | phase diagram | 1958 | reisman1958 |
| Bell Labs: A. A. Ballman, K. Nassau, H. J. Levinstein, G. M. Loiacono (growth); S. C. Abrahams (structure); G. D. Boyd, R. C. Miller, J. A. Giordmaine (nonlinear optics, OPO); A. Ashkin, F. S. Chen, A. M. Glass (photorefraction); I. P. Kaminow, E. H. Turner, J. R. Carruthers, R. V. Schmidt, R. C. Alferness, J. L. Jackel (EO, waveguides) | the crystal's characterization and first devices | 1964-1985 | 7.2-7.5 |
| G. A. Smolenskii; S. A. Fedulov; Yu. S. Kuz'minov (USSR) | Curie temperature; Czochralski growth; monographs | 1965-1999 | smolenskii1966, fedulov1965 |
| RCA Laboratories: J. J. Amodei, D. L. Staebler, W. Phillips | hologram fixing, doped LN | 1971-1972 | amodei1971b, amodei1972 |
| N. V. Kukhtarev, V. B. Markov, S. G. Odulov, M. S. Soskin, V. L. Vinetskii | band-transport equations | 1977-1979 | kukhtarev1978a |
| V. M. Fridkin; V. I. Belinicher, B. I. Sturman | bulk photovoltaic theory | 1977-1992 | fridkin1977, belinicher1980 |
| T. R. Volk (Moscow), with M. Wohlecke | Zn, In dopants; monograph | 1990-2009 | volk1990, volk2009 |
| UC Berkeley: R. M. White, F. W. Voltmer | IDT | 1965 | white1965 |
| Tohoku: K. Yamanouchi, K. Shibayama | SAW cuts | 1972-1976 | yamanouchi1972, shibayama1976 |
| Nanjing: Feng Duan (1923-2020 [bjnews-2020, S]), Ming Nai-ben, Zhu Shi-ning, Zhu Yong-yuan | periodic domains; optical superlattices | 1980-1997 | feng1980, zhu1997 |
| Zhong Ji-guo et al. (SWITP Chengdu by 1983) | MgO:LN | 1980-1983 | iqec1980, zhong1983 |
| D. A. Bryan, R. Gerson, H. E. Tomaschke | MgO:LN journal report | 1984 | bryan1984 |
| Stanford: R. L. Byer, M. M. Fejer, E. J. Lim, G. A. Magel, L. E. Myers, D. H. Jundt | QPM theory, PPLN, OPOs | 1987-1997 | fejer1992, myers1995a |
| Sony: M. Yamada, N. Nada, M. Saitoh, K. Watanabe | electric-field poling | 1993 | yamada1993 |
| NIRIM Tsukuba (affiliation P): K. Kitamura, Y. Furukawa; Oxide Corp. | stoichiometric growth | 1992-2001 | kitamura1992, oxide-history |
| NTT | direct-bonded PPLN; squeezers | 2003-2021 | nishida2003, kashiwazaki2021 |
| Fujitsu: M. Seino et al.; Fujitsu Optical Components | drift-assured Ti:LN; coherent LN; TFLN | 1992-2021 | seino1992, fujitsu-2009, fujitsu-2021b |
| Sumitomo Cement / Sumitomo Osaka Cement | LN modulators | 1993- | nagata1993, soc-history |
| Crystal Technology (Palo Alto) | crystals from 1967; first commercial modulator 1985 | 1967-2011 | becker1988, gh-history |
| UTP, Uniphase, JDS Uniphase; Lucent; Corning; Codeon; EOSPACE; Photline | Ti:LN modulator industry | 1995-2003 | 7.7 |
| Paderborn: W. Sohler, R. Brinkmann, H. Suche, H. Hu, R. Ricken | Er:LN lasers; LNOI wires | 1990-2012 | brinkmann1991, hu2009 |
| CEA-LETI: M. Bruel; Smart Cut LN layers | layer transfer | 1995-2010 | bruel1995, pijolat2008 |
| Columbia: M. Levy, R. M. Osgood | crystal ion slicing | 1998 | levy1998 |
| ETH Zurich: P. Gunter, P. Rabiei, G. Poberaj, A. Guarino | bonded LNOI, microrings | 2004-2012 | rabiei2004, poberaj2012 |
| NANOLN (Jinan) | LNOI wafer supply | 2010- | nanoln-about |
| Harvard: M. Loncar, C. Wang, M. Zhang; HyperLight | TFLN revival; startup | 2014-2026 | zhang2017, wang2018b |
| Sun Yat-sen: X. Cai; HUST: J. Xia with Huawei | hybrid Si/LN; DP-IQ | 2019-2022 | he2019, xu2022, wang2022 |
| EPFL: T. J. Kippenberg; SIMIT: X. Ou | LN lasers; TFLT | 2023-2024 | snigirev2023, wang2024 |
| CSEM; CCRAFT; Luxtelligence; Lightium; SAL; imec | European TFLN manufacturing | 2022-2026 | 7.9, 7.10 |
| AFR; Liobate; CHIPX; Anpai; TDG | Chinese TFLN supply chain | 2019-2026 | 7.10 |

---

## Regional threads (event index)

| Region | Events |
|---|---|
| USSR / Russia | h-1965-fedulov, h-1966-smolenskii-tc, h-1977-fridkin-bpve, h-1977-kukhtarev-opt-commun, h-1978-kukhtarev-equations, h-1980-belinicher-sturman, h-1990-volk-zn, h-1994-volk-review |
| Japan | h-1972-yamanouchi-leaky-saw, h-1976-shibayama-128, h-1980-tv-saw-practical, h-1984-shinetsu-lt, h-1980s-rf-saw-yx-ln, h-1989-smm-ti-ln-photorefraction, h-1992-seino-fujitsu-drift, h-1992-kitamura-double-crucible, h-1993-yamada-field-poling, h-1993-sumitomo-cement-drift, h-1994-soc-formed, h-2000-oxide-corp, h-2003-ntt-direct-bonded-ppln, h-2003-murata-love-wave, h-2009-fujitsu-dpqpsk, h-2011-soc-guangdong, h-2014-smm-saw-expansion, h-2021-fujitsu-millionth, h-2021-fujitsu-tfln, h-2021-ntt-ppln-squeezer, h-2022-murata-resonant |
| Europe | h-1990-paderborn-er-ln, h-1991-brinkmann-er-laser, h-1995-bruel-smart-cut, h-2000-photline, h-2004-rabiei-gunter, h-2007-guarino-microring, h-2008-hartung-ibee, h-2009-hu-photonic-wires, h-2012-poberaj-lnoi-review, h-2022-elena, h-2022-luxtelligence, h-2023-lightium, h-2025-ccraft, h-2025-elena-lnoi, h-2025-sal-8inch, h-2025-imec-ecoc, h-2026-ligentec-xfab, h-2026-niels-tflt-sip, h-2026-imec-double |
| China | h-1980-zhong-mgo, h-1980-feng-qpm, h-1983-zhong-mg-ln-growth, h-1997-zhu-quasiperiodic, h-2010-nanoln, h-2019-he-sysu-hybrid, h-2019-lumentum-afr, h-2020-liobate-founded, h-2022-xu-dp-iq, h-2022-hust-huawei, h-2023-anpai-8inch, h-2024-chipx, h-2025-afr-volume, h-2025-tdg-8inch, h-2025-lam-4inch-quartz, h-2025-gbt-46611, h-2026-genuine-3p2t |
| Commercial Ti:LN | h-1967-crystal-technology, h-1985-crystal-technology-modulator, h-1992-seino-fujitsu-drift, h-1995-uniphase-utp, h-1995-utp-submarine, h-1997-utp-oc192, h-1997-eospace, h-1998-lucent-x2600, h-1999-jdsu-merger, h-2000-wooten-review, h-2000-corning-pirelli, h-2003-covega, h-2009-fujitsu-dpqpsk, h-2011-gh-crystal-technology, h-2019-lumentum-afr, h-2021-fujitsu-millionth |
