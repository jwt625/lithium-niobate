# 04 Quirks: living with lithium niobate

<!--
Manuscript lane C04, 2026-10-25. Binding rules: DevLog-004 "Rules for all lanes".
Source ids resolve in refs.yaml. Glossary terms in glossary.yaml. Figure specs in figures.md.

Status codes (same convention as chapter 02):
  P        value originates in the cited document, read at the given locator
  P-comp   read in a compilation (volk2008, weis1985, schwesyg2011) that cites the original measurement; original not read
  reported number stated in the abstract (or title, where marked) of the cited paper; paper body not read
  S        secondary (named secondary quoting the original)
  V        vendor data sheet; never a material constant
  derived  computed in this chapter; formula and inputs given in the "Derived numbers" table of the section
  template display or model value that holds no data; always labeled as such on the page
  U        unverified; shown only with the U badge, never as fact

Units: SI with field-standard secondary units in parentheses (V/cm, kW/cm^2, mol%).
Sign convention: +z (+c) per IEEE Std 176-1987 and IRE 1949 (ieee176 Table 5; weis1985 pp. 192-193):
+c is the face that becomes negative on compression and positive on cooling.
Photonic acronyms are not expanded; others are expanded on first use.
-->

<!-- Chapter door (VISUAL): kintsugi crack in Au across a 532 nm photorefractive trace (DevLog-003b sec. 5). TECH: chapter number, title, keyword row. -->

Keyword row (L1 index): optical damage, pyroelectric charging, bias drift, green-induced infrared absorption, thermal drift, lithium loss.

---

## 4.1 Light that writes itself: photorefraction

### L1

A beam of visible light passing through lithium niobate leaves behind a change in refractive index that outlasts the beam. Light frees electrons from impurity and defect sites; the crystal's polar structure pushes them along the c axis even without an applied voltage; they are trapped again in the dark edges of the beam. The separated charge sets up an electric field, and the Pockels effect turns that field into an index change. The result was first called "optical damage" (Ashkin et al. 1966, ashkin1966; volk2008 p. 51, P-comp): a focused laser beam gets distorted and scattered by its own track. It is reversible. Uniform light or heat erases it.

> [fig-04-01] Write and erase: a beam writes an index scar into a crystal slab; the scar fades with dark or photo conductivity. Controls: intensity, exposure time, crystal (congruent, Fe-doped, 5 mol% MgO, near-stoichiometric), lights off.

| Quantity | Value | Conditions | Source | Status |
|---|---|---|---|---|
| Lowest intensity at which photorefraction is observed | as low as 10 mW/cm^2 | blue-green light, LiNbO3:Fe; no intensity threshold | volk2008 p. 52 | P-comp |
| Extraordinary index decrease | up to 1e-3 | focused Ar+ laser, 488 nm, 20 mW; ordinary index change much smaller | chen1969 | reported |
| Bulk photovoltaic saturation voltage | > 1000 V (about 1e5 V/cm) | doped LiNbO3 | glass1974 | reported |

### L2

Charge transport has three currents (volk2008 Eq. 3.2, p. 52; schwesyg2011 Eq. 2.23, p. 18; P-comp):

```
j = j_pv + j_diff + j_drift
j_pv,i   = beta_ijk e_j e_k I              (bulk photovoltaic, Glass current)
j_diff   = k_B T mu_e grad(n_e)            (diffusion of conduction-band electrons)
j_drift  = sigma E,   sigma = sigma_d + sigma_ph,  sigma_ph = kappa I
```

- For point group 3m the symmetric photovoltaic tensor has the form of the piezoelectric d tensor, with nonzero beta_311 = beta_322, beta_333, beta_222 = -beta_112 = -beta_121 = -beta_211, beta_113 = beta_223 (volk2008 p. 53; P-comp). beta_113 drives a current that oscillates along the beam; its coherence length (half period) is l_c = lambda / (2 |n_e - n_o|), about 5 lambda in LN (full period lambda / |n_e - n_o|, about 11 lambda); it matters only when the lit region is that small, as in waveguides (volk2008 p. 53; P-comp).
- Scalar form: j_pv = k_G alpha I, with k_G the Glass constant (volk2008 Eq. 3.5; P-comp).
- Open-circuit steady state: the drift current cancels the photovoltaic current, so

```
E_pv = j_pv / (sigma_ph + sigma_d) = k_G alpha I / (sigma_ph + sigma_d)          (volk2008 Eq. 3.6)
```

  Once sigma_ph >> sigma_d and sigma_ph is proportional to I, E_pv saturates and no longer depends on intensity.
- Build-up and decay are set by the dielectric relaxation time (volk2008 Eqs. 3.18-3.19, p. 57; P-comp):

```
E(t) = -E_sat [1 - exp(-t/tau)]      (writing, open circuit)
E(t) =  E_sat exp(-t/tau)            (erasure, uniform light or dark)
tau  = eps eps0 / (sigma_ph + sigma_d)
```

- Index change through the linear electro-optic effect (schwesyg2011 Eq. 2.25; P-comp):

```
Delta n_e = -(1/2) n_e^3 r33 E_z ,   Delta n_o = -(1/2) n_o^3 r13 E_z
```

  r33 is about 3 r13, so extraordinary light sees about three times the change (schwesyg2011 p. 19; P-comp). Sign: the illuminated region shows a decrease of n_e (chen1969, reported). The figure plots the field magnitude and Delta n_e < 0 in the lit region; the direction of j_pv relative to +c is not taken from the held sources.
- Diffusion field of a sinusoidal fringe pattern with modulation m and spatial frequency K, monopolar electron transport (volk2008 Eq. 3.9; P-comp): E_dif(z) = (k_B T / e) K m sin(Kz) / (1 + m cos Kz). It is independent of intensity and shifted by a quarter period from the fringes; the photovoltaic field is in phase with them (volk2008 pp. 54-55; P-comp).

| Quantity | Value | Conditions | Source | Status |
|---|---|---|---|---|
| Glass constant k_G, LiNbO3:Fe | 2.8e-9 cm/V | | volk2008 p. 59 | P-comp |
| Glass constant k_G, LiNbO3:Cu | 5.5e-10 cm/V | | volk2008 p. 59 | P-comp |
| Photoconductivity, as-grown doped crystals | 1e-11 to 1e-12 Ohm^-1 cm^-1 (1e-9 to 1e-10 S/m) | moderate intensity | volk2008 p. 59 | P-comp |
| Saturated photovoltaic field | 1e4 to 1e5 V/cm | LiNbO3:Fe, LiNbO3:Cu | volk2008 p. 59 | P-comp |
| Diffusion field amplitude | about 1.5e3 V/cm | grating period about 1 um | volk2008 p. 58 | P-comp |
| Dark conductivity, undoped or lightly doped CLN | 1e-16 to 1e-18 Ohm^-1 cm^-1 (1e-14 to 1e-16 S/m) | room temperature, extrapolated from high temperature | volk2008 p. 60 | P-comp |
| Dark storage time of gratings, low-doped LiNbO3:Fe | up to about one year | falls to hours or seconds at high Fe content | volk2008 p. 60 | P-comp |
| Electron Hall mobility | about 0.8 cm^2/(V s) | strongly reduced LiNbO3, photo-Hall, room temperature | volk2008 p. 59 | P-comp |
| Sensitivity S'_1, LiNbO3:Fe | 0.01-0.1 cm/J (633 nm); 0.05-0.3 cm/J (488 nm) | | volk2008 p. 57 | P-comp |

Derived numbers (this chapter; inputs as listed):

| Quantity | Value | Formula and inputs | Status |
|---|---|---|---|
| Delta n_e at the saturated photovoltaic field | 1.7e-4 (1e4 V/cm) to 1.7e-3 (1e5 V/cm) | (1/2) n_e^3 r33 E; n_e = 2.2028 at 632.8 nm (weis1985 Table 2, P-comp); r33^T = 32.2 pm/V (weis1985 Table 4, P-comp) | derived |
| Dielectric relaxation time in the dark | 0.29 d (6.9 h) to 29 d | eps eps0 / sigma_d; eps33 = 28 (rounded lower bound of the 28.1-30 spread); sigma_d = 1e-14 to 1e-16 S/m | derived |
| Dielectric relaxation time under light | 0.25 s to 2.5 s | eps33 = 28; sigma_ph = 1e-9 to 1e-10 S/m | derived |
| Diffusion field amplitude per unit modulation (small-m limit), 1 um fringes | 1.6e5 V/m (1.6 kV/cm) | (k_B T / e)(2 pi / Lambda), T = 295 K | derived; agrees with volk2008 p. 58 |

The upper Delta n_e bound agrees in magnitude with the 1e-3 reported by chen1969. The dark relaxation times above conflict with the 5-500 days printed in volk2008 p. 159 for the same conductivity range (R14 row 42a); the page shows the computed range and flags the conflict.

### L3

- Dark conductivity in undoped LN is protonic: one activation energy, about 1.1 eV, covers 200-1000 C, and conductivity scales with hydrogen concentration; Li+ transport has an activation energy near 0.4 eV, which does not match the measured conductivity (volk2008 pp. 59-60; P-comp). At Fe concentrations of 0.2-0.25 % the activation energy drops to 0.3-0.4 eV and electron tunneling between Fe sites takes over (volk2008 pp. 60-61; P-comp).
- Mixed proton-electron dark conduction gives stretched-exponential decay, delta Delta n proportional to exp[-(t/tau)^beta]; purely ionic conduction gives a single exponential (volk2008 p. 61; P-comp). The page model uses a single exponential and says so.
- Charge transport schemes: the one-center model (Fe2+ donor, Fe3+ trap) fails to fit several data sets; the two-center model adds the Nb antisite (Nb_Li) as a shallow electron trap (volk2008 Sec. 3.2.2-3.2.3, pp. 62-73; P-comp). n-type photoconductivity has been confirmed only for congruent LN doped with Fe and Cu (volk2008 p. 59; P-comp).
- Full band-transport model: Kukhtarev et al. (kukhtarev1978; Crossref issue date 1978, often cited as 1979). The page uses the reduced single-time-constant form above plus an optional 1D grating solver (fig-04-02).
- How it is measured: two-beam holographic recording with diffraction efficiency eta = exp(-alpha L / cos theta) sin^2(pi Delta n L / (lambda cos theta)) (volk2008 Eq. 3.11; P-comp); light-induced birefringence change between crossed polarizers; beam distortion and far-field scattering ("fanning"). In waveguides and resonators: resonance shift versus power and time (fig-04-04).
- Error sources: dark and photoconductivity vary by orders of magnitude between samples, so absolute write and erase times are crystal-specific.
- History: optical damage reported in 1966 (ashkin1966); annealing in an electric field made LiTaO3 resistant up to 500 W/cm^2 and helped LN less (levinstein1967, reported); holograms written into LN and erased thermally (chen1968, reported); charge-drift model (chen1969); bulk photovoltaic driver (glass1974); MgO doping (zhong1980; bryan1984). Timeline rows live in chapter 07.

> [fig-04-02] Fringes to field: 1D grating; photovoltaic (local, in phase) versus diffusion (non-local, quarter-period shift) contributions. Controls: fringe period, modulation, photovoltaic weight.

---

## 4.2 Doping the damage out: MgO, Zn, In, Sc, Hf, Zr

### L1

Adding about 5 % magnesium oxide to congruent lithium niobate makes it shrug off visible light that would scar the undoped crystal. Magnesium does not stop the light-driven current. It makes the crystal about a hundred times more photoconductive, so the separated charge leaks back before it builds a large field (bryan1984, reported). Below a threshold concentration the effect is small; above it photorefraction collapses. A crystal closer to the ideal 50:50 Li:Nb ratio needs much less dopant.

> [fig-04-03] Threshold plot: photorefractive damage threshold intensity (log axis) versus MgO concentration for congruent and near-stoichiometric crystals; GRIIRA threshold markers on the same axis.

### L2

| Crystal | Damage threshold intensity (cw green, beam distortion after 10 min) | Source | Status |
|---|---|---|---|
| CLN | 1 kW/cm^2 | volk2008 Table 4.3, p. 97 (data from furukawa2001) | P-comp |
| CLN:3% MgO | 10 kW/cm^2 | same | P-comp |
| CLN:4.5% MgO | 75 kW/cm^2 | same | P-comp |
| CLN:6% MgO | > 8000 kW/cm^2 | same | P-comp |
| NSLN | 0.1 kW/cm^2 | same | P-comp |
| NSLN:0.6% MgO | 10 kW/cm^2 | same | P-comp |
| NSLN:1.8% MgO | > 8000 kW/cm^2 | same | P-comp |

| Quantity | Value | Source | Status |
|---|---|---|---|
| MgO threshold | >= 4.5 at.% MgO | bryan1984 | reported |
| Mechanism at the threshold | photoconductivity up about 100x; Glass current not reduced; Arrhenius activation 0.1 eV (resistant) versus 0.5 eV (undoped) | bryan1984 | reported |
| OH stretch line | 2.83 um above threshold versus 2.87 um below | bryan1984 | reported |
| MgO threshold quoted in compilations | 5 mol% (congruent melt); 4.5-4.9 mol% | volk2008 p. 82; schwesyg2011 p. 19 | P-comp |
| MgO threshold, near-stoichiometric ([Li]/[Nb] = 0.993) | > 0.78 mol%: no measurable damage at 532 nm up to 2 MW/cm^2 | furukawa2000 | reported |
| Near-stoichiometric LN without Mg | lower damage resistance than CLN | furukawa2000 | reported |
| CLN versus NSLN crossover | NSLN shows more photorefraction at low and moderate intensity; CLN rises steeply above 100-200 W/cm^2 | volk2008 p. 77 | P-comp |
| MgO:LN versus CLN transport | photoconductivity 10-100x higher; bulk photovoltaic current about 10x lower (green light) | schwesyg2011 pp. 19-20 | P-comp |
| ZnO threshold, congruent melt | about 6-7 mol% | volk2008 p. 82 | P-comp |
| In2O3, Sc2O3 | 1.7 mol% In2O3 or 1.5 mol% Sc2O3 act like 4.5-5 mol% MgO | volk2008 p. 83 | P-comp |
| HfO2, ZrO2 | Hf about 2 at.% in the crystal; ZrO2 below 2 mol% | volk2008 p. 83 | P-comp |
| LiNbO3:2% Zr | no optical damage up to 20 MW/cm^2 | volk2008 p. 83 (ref. Kong et al.) | P-comp |
| NSLN:1% Mg, VTE NSLN:Mg | resistant to 2-8 MW/cm^2; stable to 26 MW/cm^2 | volk2008 p. 85 | P-comp |
| Space-charge field, NSLN:1% Mg | optical damage delta Delta n drops to about 1e-8, more than 100x below CLN:5% Mg | volk2008 p. 85 (data from furukawa2000) | P-comp |
| Bulk laser damage, MgO:LN | highest 14 J/cm^2 (1.053 um, 1 ns) at 1 mol% MgO; lower above 3 mol% (MgO aggregates scatter) | furukawa1991 | reported |
| First reports | MgO:LN damage resistance, Zhong, Jin, Wu, IQEC 1980 (conference abstract); journal report Bryan et al. 1984 | zhong1980; bryan1984 | S (volk2008 ref. [171], R07); reported |

Mechanism (volk2008 Sec. 2.5, 4.2.2; schwesyg2011 p. 20; P-comp): below threshold, Mg2+ replaces Nb antisites on Li sites. At threshold almost all Nb_Li is gone; further Mg goes onto Nb sites, Fe3+-like impurities are pushed onto Nb sites and stop acting as acceptors, and the OH band shifts. Trivalent and tetravalent dopants need less concentration, which the charge-compensation scheme explains qualitatively (volk2008 p. 83; P-comp).

### L3

- Threshold units differ by source: bryan1984 states at.% MgO, compilations mol% MgO in the melt or crystal. The page prints each value in the unit of its source and does not convert.
- The threshold intensity in the table above is an operational definition (beam distortion after 10 min of cw green light, volk2008 Table 4.3) and depends on beam size and observation time.
- Other routes to lower E_pv: raise dark conductivity (strong reduction, Ag doping, proton exchange), or suppress j_pv (UV instead of blue-green, strong oxidation) (volk2008 p. 75; P-comp). Heating CLN to about 200 C also suppresses photorefractive damage (schwesyg2011 p. 19, citing its ref. [29]; S).
- Above-threshold MgO:LN still shows light-induced index changes when a pyroelectric field is present (sec. 4.6).

---

## 4.3 Photorefraction in thin films: rings and waveguides

### L1

In a thin-film ring the light is confined to a sub-micron film and builds up by circulating, and photorefraction responds fast (jiang2017, title). It shifts a ring's resonance to shorter wavelength as power rises, opposite to the heating shift. It can hold a written shift for hours, which is a nuisance for a frequency reference and a tool for trimming.

> [fig-04-04] Ring sweep: transmission of a thin-film ring while the laser sweeps across a resonance; thermal red shift (triangle) versus photorefractive blue shift; sweep speed and power sliders.

### L2

| Observation | Value | Platform | Source | Status |
|---|---|---|---|---|
| Fast photorefractive response | (title) | LN microresonators | jiang2017 | reported (title) |
| Photorefractive tuning rate in a nanobeam | 0.64 GHz/aJ (84 MHz per photon); Q up to 1e5; quenching of photorefraction observed | LN photonic-crystal nanobeam | liang2017 | reported (arXiv abstract) |
| Cladding dependence | removing the dielectric cladding mitigates photorefraction | TFLN microrings | xu2021oe | reported |
| Cryogenic Bragg scattering | a strongly excited mode imprints a long-lived periodic space-charge field; reconfigurable mode splitting | TFLN rings, cryogenic | xu2021ol | reported |
| Memory | recovery time > 10 h after light excitation and temperature change; strong dependence on film orientation; used for optical trimming | z-cut TFLN microresonators | ren2025 | reported (arXiv abstract) |
| Subwavelength grating | standing-wave pump writes a photorefractive grating; mode splitting; first-order QPM for backward SHG | TFLN microcavity | hou2024 | reported |
| Sign | photorefractive index change opposite to Kerr and thermal; enables turnkey soliton generation (numerical, ordinary polarization) | TFLN rings | lin2021 | reported |
| Self-starting soliton | photorefraction lets soliton mode locking self-start and switch bi-directionally | LN microresonator | he2019 | reported (arXiv abstract) |
| Doped thin films | in-diffused Zn (4.0 mol% surface) and Zr (1.1 mol%) raise photorefractive damage resistance up to 100x versus undoped TFLN; 600 nm z-cut planar guides | TFLN | suntsov2026 | reported |
| Waveguide management | high-temperature operation raises the photorefractive damage threshold; for cryogenic use, an auxiliary co-propagating light restores phase-matching spectra and reduces pyroelectric effects | LN waveguides (SFG) | lange2026 | reported |
| Power ceiling for SHG | LN damage threshold, even MgO-doped, keeps TFLN SH output well below 1 W; PPLT reaches > 1 W SH at 775 nm (4.5 W pump, 7 mm) | TFLN vs thin-film LiTaO3 | kuznetsov2025 | reported (preprint) |

Ring model (fig-04-04, ring.ts): intracavity energy U(t) from coupled-mode theory; detuning Delta(t) = Delta_0 + g_th T_c(t) + g_pr E_sc(t); T_c relaxes with tau_th toward a value proportional to absorbed power; E_sc relaxes with tau_pr = eps eps0 / (sigma_d + kappa I), I the intracavity intensity (proportional to U), toward a value with the opposite sign. g_th uses dn/dT (sec. 4.8); g_pr, tau_th, kappa, and absorption are template. The figure shows the qualitative competition, not a fit to any device.

### L3

- Time scale: the photoconductive relaxation time scales as 1/(kappa I), so resonant build-up of intensity shortens it; cladding changes the effect (xu2021oe). No source found here gives a measured thin-film dark or photoconductivity; the model treats them as template.
- Measurement: power-dependent resonance position at slow and fast sweep, pump-probe on two modes, or time-resolved transmission after a power step. Thermal and photorefractive shifts separate by sign and time constant.
- Error sources: TFLN films from ion slicing differ in hydrogen and defect content from bulk; anneal history matters (shams2022 shows anneals change material loss); results do not transfer between foundries without measurement.

---

## 4.4 Green light, infrared loss: GRIIRA, BLIIRA and polarons

### L1

Intense green or blue light, the kind produced by frequency doubling, makes lithium niobate temporarily absorb infrared light. Electrons excited by the green light get stuck on niobium ions sitting in lithium sites, and each stuck electron absorbs near-infrared photons. The absorbed infrared heats the crystal where the beams overlap, which detunes the phase matching and caps conversion efficiency. The same magnesium doping that cures photorefraction removes the trap sites.

> [fig-04-05] Polaron ladder and GRIIRA chain: energy diagram of the three polaron absorption bands (sourced) plus a rate toy, green intensity -> polaron population -> 1064 nm absorption -> heating -> QPM detuning -> SHG roll-off (template parameters). MgO slider with the threshold.

### L2

| Center | Absorption peak | Width (HWHM) | Source | Status |
|---|---|---|---|---|
| Bound small polaron Nb_Li^4+ | 12900 cm^-1 (1.60 eV, 775 nm) | 3200 cm^-1 | schwesyg2011 Table 2.1, p. 11; volk2008 pp. 15-18 | P-comp |
| Free small polaron Nb_Nb^4+ | 8050 cm^-1 (about 1.0 eV); 0.95 eV in reduced above-threshold MgO:LN | 3000 cm^-1 | schwesyg2011 p. 11; volk2008 p. 19 | P-comp |
| Bound bipolaron Nb_Li^4+-Nb_Nb^4+ | 20140 cm^-1 (2.50 eV) | 4400 cm^-1 | schwesyg2011 p. 12; volk2008 p. 15 | P-comp |
| Bound hole polaron O^- (near a Li vacancy) | 20000 cm^-1 (500 nm), very broad | | schwesyg2011 p. 12; volk2008 p. 14 | P-comp |
| Bipolaron dissociation energy | about 0.3 eV | thermal | volk2008 p. 17 | P-comp |
| Small-polaron hopping activation | 0.49 eV (optical 1.6 eV : thermal about 4:1) | reduced LN | volk2008 pp. 18-19 | P-comp |

| Quantity | Value | Source | Status |
|---|---|---|---|
| GRIIRA assignment | small bound polaron on the Nb antisite, Nb_Li^5+ + e^- -> Nb_Li^4+ | furukawa2001; volk2008 p. 96 | reported; P-comp |
| GRIIRA threshold | same MgO threshold as photorefraction | furukawa2001 | reported |
| GRIIRA thresholds in Mg concentration | about 5 % (CLN), about 1.5 % (NSLN) | volk2008 p. 96 (data furukawa2001) | P-comp |
| GRIIRA measurement conditions | 532 nm pump at 2.5 kW/cm^2, 1064 nm probe at 21 kW/cm^2; decays practically instantly when the pump stops; photothermal technique | volk2008 Fig. 4.14 caption and p. 96; furukawa2001 | P-comp; reported |
| Picosecond BLIIRA | lowest in KNbO3 and MgO-doped congruent and stoichiometric LN; periodic poling slightly increases it | hirohashi2007 | reported |
| Dark (gray) trace | visible absorption rises from 0.03 to 0.15-0.2 cm^-1 after IR pulse exposure; transmission loss 10-15 %; at about 100 MW/cm^2 with repeated pulses | volk2008 pp. 51, 94-95 | P-comp |
| Dark trace lifetime | stable in CLN; decays in 10-20 min in Mg- or Zn-doped crystals above threshold | volk2008 pp. 95-96 | P-comp |
| Consequence | local heating, thermal lens, disturbed phase matching | volk2008 p. 95 | P-comp |

Band shape: volk2008 Eq. 2.11 gives the small-bound-polaron absorption as a Gaussian in photon energy around 4U + eps, fitted to the 1.6 eV band with phonon energy hbar omega_0 ~ 0.1 eV and polaron stabilization energy U ~ 0.3 eV (volk2008 p. 18; P-comp).

### L3

- Band shapes are drawn as Gaussians in photon energy at the tabulated centers and HWHM (Gaussian approximation); the O^- band has no tabulated width and is drawn as a marker.
- Thin-film data gap: no paper quantifying GRIIRA or BLIIRA in TFLN was found (R08 sec. 3.2, open item 7). Bulk values are labeled bulk on the page.
- Polaron model reviews: schirmer2009 (electron small polarons and bipolarons), imlau2015 (optical nonlinearities of small polarons). Their numbers were not read here; band values come from the two compilations above.
- How GRIIRA is measured: photothermal (heating-induced phase change of a probe), pump-probe transmission at 1064 nm under 532 nm pumping, or calorimetry.

---

## 4.5 Optical damage thresholds: the intensity ladder

### L1

"Damage" in lithium niobate means three different things at three intensity scales. Photorefraction distorts a beam, in Fe-doped crystals already at 10 mW/cm^2, and can be erased. Light-induced coloring appears under strong pulses: GRIIRA vanishes when the green light stops; the gray track is stable in congruent crystals until erased by light or heat. Laser-induced breakdown, in the GW/cm^2 range for nanosecond pulses, is permanent physical destruction.

> [fig-04-06] Intensity ladder: one log axis from 1e-2 W/cm^2 to 1e10 W/cm^2 with each sourced threshold placed by its regime (cw, pulsed) and its definition; fluence values on a separate parallel axis.

### L2

| Regime | Value | Conditions | Source | Status |
|---|---|---|---|---|
| Photorefraction onset | as low as 10 mW/cm^2, no threshold | cw blue-green, LiNbO3:Fe | volk2008 p. 52 | P-comp |
| Photorefractive damage threshold, CLN | 1 kW/cm^2 | cw green, 10 min | volk2008 Table 4.3 | P-comp |
| Photorefractive damage threshold, CLN:6% MgO and NSLN:1.8% MgO | > 8 MW/cm^2 | cw green, 10 min | volk2008 Table 4.3 | P-comp |
| GRIIRA, measurement condition | 532 nm pump at 2.5 kW/cm^2; vanishes when the pump stops | cw green | volk2008 Fig. 4.14, p. 96 | P-comp |
| Coloration (gray or dark trace) | about 100 MW/cm^2, after repeated pulses | pulsed | volk2008 p. 51 | P-comp |
| Laser-induced breakdown | GW/cm^2 range at 1064 nm, pulse-length dependent | pulsed | volk2008 p. 51 | P-comp |
| Bulk laser damage fluence, 1 mol% MgO:LN | 14 J/cm^2 | 1.053 um, 1 ns | furukawa1991 | reported |
| Vendor laser damage thresholds | 100-300 MW/cm^2 | 10 ns, 1064 nm | R06 sec. 2.13 | V (not a material constant) |

### L3

- Breakdown thresholds scatter because surface and bulk damage differ and depend on polishing and defects; measured values are often far below literature values (volk2008 p. 51; P-comp).
- Intensity (W/cm^2) and fluence (J/cm^2) are not interchangeable without pulse shape.
- Vendor thresholds lack traceable measurement conditions.

---

## 4.6 Pyroelectricity: charge from heat

### L1

Lithium niobate carries a built-in electric polarization along its c axis, and that polarization shrinks as the crystal warms. Any temperature change therefore leaves uncompensated charge on the two faces perpendicular to c. A wafer taken off a hotplate can build kilovolts across its thickness until the charge finds a path: a spark, a cracked film, a fried electrode, or dust pulled onto the surface. In thin-film devices the same charge shifts the refractive index through the Pockels effect.

> [fig-04-07] Heat a wafer: temperature step on a z-cut or x-cut LN plate; bound surface charge, unscreened field and voltage, the index shift it would cause, and its decay as charge leaks away. Coefficient selector spans the published spread.

### L2

| Quantity | Value | Conditions | Source | Status |
|---|---|---|---|---|
| Pyroelectric coefficient p3 | -4e-5 C/(m^2 K) (-4e-9 C/(cm^2 C)) | 25 C; measured 25-450 C | savage1966; weis1985 Eq. 2, p. 196 | reported; P-comp |
| p3 | -6.4e-5 C/(m^2 K) | room temperature (Bartholomäus et al. 1994) | schwesyg2011 Eq. 2.17 | S |
| p3 | -8.3e-5 C/(m^2 K) | CLN 48.38 mol%, 25 C | cti1999 (R06 sec. 2.2) | V |
| p3 magnitude | about 95 uC/(m^2 K) (9.5e-5) | congruent, interferometric | popescu2013 | reported |
| Spread across sources | magnitude 4e-5 to 9.5e-5 C/(m^2 K) | method, clamping, composition | R14 row 28 | P-comp (range) |
| Decrease of Ps from 25 to 450 C | 3.7 uC/cm^2 | | savage1966 | reported |
| Spontaneous polarization Ps | 80 +/- 5 uC/cm^2 (CLN and near-SLN); compilation gives 71 (CLN) / 62 (near-SLN) | room temperature | gopalan1998; volk2008 Table 1.1 | reported; P-comp (mismatch, R14 row 12) |
| Sign | p3 < 0: on cooling the +c face becomes more positive; on heating more negative | | weis1985 p. 196; volk2008 p. 2 | P; P-comp |
| eps33^T | 28.7 (Warner 1967 set); spread 28.1-30 | low frequency, unclamped | weis1985 Table 1; R14 sec. 2.7 | P-comp |
| Pyroelectric field per kelvin, z-cut plate | 2.6 kV/cm per C | homogeneous heating, unscreened; computed in the source from its p3 = -6.4e-5 | schwesyg2011 Eq. 5.2, p. 71 | P |
| Persistence | such fields may persist for weeks if dark conductivity and surface neutralization are weak | | schwesyg2011 p. 71 (its ref. [121]) | S |

Unscreened z-cut plate, uniform temperature change Delta T:

```
sigma_b = p3 Delta T                     (bound surface charge density)
E_pyro  = -p3 Delta T / (eps33 eps0)     (field inside, no free charge, no electrodes)
V       = E_pyro d                       (plate thickness d)
Delta n_e = -(1/2) n_e^3 r33 E_pyro
```

Derived numbers (eps33^T = 28.7, Warner set; n_e = 2.1376 at 1550 nm, 21 C, Zelmon 1997 via R06 (C); r33^T = 32.2 pm/V at 633 nm, weis1985, P-comp; dispersion of r33 to 1550 nm not available in held sources):

| Quantity | abs(p3) = 4.0e-5 | abs(p3) = 9.5e-5 | Status |
|---|---|---|---|
| E_pyro per kelvin | 1.57 kV/cm | 3.74 kV/cm | derived |
| Delta n_e per kelvin from E_pyro, 1550 nm | 2.5e-5 | 5.9e-5 | derived |
| Bound charge, Delta T = 95 K (25 -> 120 C bake) | 0.38 uC/cm^2 | 0.90 uC/cm^2 | derived |
| E_pyro, Delta T = 95 K | 15 MV/m (15 kV/mm) | 36 MV/m (36 kV/mm) | derived |
| V across a 0.5 mm z-cut wafer, Delta T = 95 K | 7.5 kV | 17.8 kV | derived |
| V across a 600 nm z-cut film, Delta T = 95 K | 9.0 V | 21 V | derived |

The table is linear in Delta T with the 25 C coefficient. savage1966 reports Ps falling by 3.7 uC/cm^2 between 25 and 450 C, an average of 8.7e-5 C/(m^2 K) (derived), so p3 grows with temperature and large heating steps are underestimated. Values of p3 below room temperature are not in the held sources; cryogenic cooldown charge is not computed here.

- The per-kelvin index shift from an unscreened pyroelectric field (2.5e-5 to 5.9e-5) is the same size as the thermo-optic dn_e/dT (3.3e-5 to 3.8e-5 per K near 1550 nm, sec. 4.8). Whether a device sees it depends on screening.
- The unscreened field after a 95 K step, 15-36 kV/mm, is of the order of the congruent coercive field, 21 kV/mm (volk2008 Table 7.1; P-comp). Real wafers lose charge to the air, surfaces, and fixtures; the sparks and cracks in the practitioner notes (sec. 4.10) are consistent with that discharge.
- z-cut versus x-cut: in z-cut films the charge sits on the top and bottom faces and the field is vertical, overlapping the guided mode. In x-cut the charge sits on surfaces perpendicular to the in-plane c axis: sidewalls and chip edges (R08 sec. 3.4; derived from geometry).
- Ti-indiffused z-cut interferometers show large pyroelectric output instabilities; z-cut directional couplers and x-cut interferometers are thermally stable; the decay of induced voltage after a temperature change suggests field-dependent LN resistivity (bulmer1986; reported).

### L3

- Pyroelectric field as a photorefractive driver: the pyroelectric field acts like an applied field; photocarriers screen it in the lit region, which writes an index change even in above-threshold MgO:LN (schwesyg2011josab; schwesyg2011 Ch. 5; volk2008 p. 53 citing Schein et al. 1978). Measured: Delta n up to 0.8e-4 for Delta T = 3 C against 1.3e-4 predicted; screening time tau_di = 14 s, specific photoconductivity kappa = 0.27 pS cm/W; no such damage observed in CLN in the same window because its kappa is more than 30x smaller (schwesyg2011 pp. 99-100; P).
- Remedies tested or proposed there: periodic poling reduces E_pyro up to 140x for the stated parameters, strongly dependent on duty cycle; short-circuit the z faces; flood the crystal with blue light to raise conductivity (schwesyg2011 p. 101; P).
- In TFLN: light and temperature changes leave long-lived index changes in z-cut microresonators (ren2025); an auxiliary light reduces pyroelectric effects in cryogenic waveguides (lange2026).
- Demonstrations of scale: a pyroelectric crystal has driven nuclear fusion (naranjo2005, title); heated monodomain LN emits electrons from its polar faces (bourim2006, title).
- Measurement methods and how they separate primary, secondary (piezoelectric) and thermally stimulated currents: jachalke2017 (review). General background: lang2005. The spread of p3 values is partly a clamping and method spread; the page shows all four values with their method rather than one "true" value.

---

## 4.7 DC bias drift in modulators

### L1

A lithium niobate modulator is set to its operating point with a DC voltage. Over seconds to hours that voltage stops doing its job: mobile charge inside and around the crystal slowly rearranges and cancels part of the applied field, so the operating point walks away. Bulk telecom modulators have been engineered against it since at least 1981 (yamada1981; gee1985). Thin-film modulators show the same effect on much shorter time scales, and the 2024-2026 literature traces it to interfaces, cladding, and contacts.

> [fig-04-08] Drift simulator: layered RC model of a modulator cross-section; apply a bias step or square wave; watch the field in the LN core, the bias point on the transfer curve, and the frequency response from 1 mHz to 1 MHz. Toggles: cladding on or off, interface conductance, temperature (Arrhenius).

<!-- Footer motif (R12, DevLog-003b sec. 7): drifting bias point with re-lock, single-RC display model, tau = 40 s, template badge. -->

### L2

Maxwell-Wagner two-layer model (R11 S8): layer 1 = LN, layer 2 = buffer or cladding, each a parallel capacitance C_i and conductance G_i, in series under a voltage step V:

```
V_1(t) = V [ G2/(G1+G2) + ( C2/(C1+C2) - G2/(G1+G2) ) exp(-t/tau) ],   tau = (C1+C2)/(G1+G2)
```

The LN voltage moves from capacitive division (t = 0+) to resistive division (t -> infinity). Its direction depends on the sign of C2/(C1+C2) - G2/(G1+G2): if the LN share grows with time, the drift is called positive; if it shrinks, negative (convention defined here). Sign conventions differ between papers; the page labels each reported drift with the paper's own term.

| Result | Value | Device | Source | Status |
|---|---|---|---|---|
| Two drift components | short: several seconds (buffer-layer leakage); long: several hours (photorefraction from guided light) | Ti:LN directional coupler, bulk | yamada1981 | reported |
| Conductive buffer | ITO buffer (about 20 Ohm/sq) instead of SiO2: long-term drift < 0.3 % in 8 h; equivalent-circuit model | Ti:LN modulator, bulk | gee1985 | reported |
| Pyroelectric drift | z-cut interferometers unstable with temperature; x-cut stable | Ti:LN | bulmer1986 | reported |
| OH reduction | improved long-term drift (title) | bulk LN intensity modulators | nagata1996 | reported (title) |
| DC-induced thermal shift | DC voltage causes a thermal shift of the bias point (title) | bulk LN | nagata2004 | reported (title) |
| Analysis and control | (title) | bulk LN MZM | salvestrini2011 | reported (title) |
| EO response 1 mHz to 1 MHz | relaxation enhances EO modulation at 1-20 kHz, confounding V_pi measurements; relaxation slowed > 1e4-fold by LN-metal interface control and annealing | TFLN | holzgrafe2024 | reported |
| Anomalous sub-MHz response | improved by LN/metal interface preparation and high-temperature anneal in forming gas | x-cut TFLN phase modulators | puma2022 | reported |
| RC fit | 11.9 ms with SiO2 cladding (positive drift); 88.6 us without cladding (negative drift); relaxation time more than 100x shorter than bulk; optical intensity changes the low-frequency response via photoconductivity | TFLN MZM | li2026photonics | reported |
| Hysteresis | reversible under zero or reverse bias; short-time drift attributed to charge trapping near the contact junction; active reset protocol | TFLN | yeh2026 | reported |
| Ar+ milling pre-treatment | no drift under DC within 1 h; modulator > 40 GHz, stable 30 min at 4.5 V | TFLN | shi2025 | reported |
| Thin-film LiTaO3 | < 1 dB output fluctuation versus 5 dB for TFLN, quadrature bias, 46 h, 12.1 dBm input | TFLT vs TFLN | powell2024 | reported |
| Thin-film LiTaO3, hot | DC-bias stable at 120 C | TFLT | alsayem2026 | reported (preprint) |
| Cryogenic | bias-drift-free 12 h | LNOI MZI with SNSPDs (superconducting nanowire single-photon detectors) | lomonte2021 | reported |
| Liquid nitrogen temperature | stable DC operation | TFLN | warner2025 | reported |
| Heterogeneous Si/TFLN | weak bias drift; V_pi L about 2.9 V cm; 176 Gb/s PAM4 (four-level pulse amplitude modulation) | wafer-scale SOI/TFLN | lizy2024 | reported |
| Thermal biasing | heaters bias TFLN modulators stably but cost power, cross-talk and bandwidth; thermo-optic bias also used in visible and near-infrared TFLN modulators (title) | TFLN | holzgrafe2024; liu2026acs | reported; reported (title) |

Derived numbers:

| Quantity | Value | Formula and inputs | Status |
|---|---|---|---|
| Relaxation time from bulk dark conductivity | 6.9 h to 29 d | eps33 eps0 / sigma_d; eps33 = 28; sigma_d = 1e-14 to 1e-16 S/m (volk2008 p. 60) | derived |
| Effective conductivity implied by the TFLN RC fits | 2.1e-8 S/m (11.9 ms); 2.8e-6 S/m (88.6 us) | eps33 eps0 / tau, eps33 = 28 | derived |
| Ratio to bulk dark conductivity | 2e6 to 3e10 | above / (1e-14 to 1e-16 S/m) | derived |

Bulk LN dark conduction cannot produce millisecond relaxation. Some other path, 6 to 10 orders of magnitude more conductive, carries the screening charge. The papers above point to the LN-metal interface, the cladding, and traps near contacts.

### L3

- Mechanism candidates and their status:

| Candidate | Status in held sources |
|---|---|
| Conduction through buffer or cladding layers | reported for bulk (yamada1981, gee1985) and TFLN (li2026photonics) |
| LN-metal interface and contact traps | reported (holzgrafe2024, puma2022, yeh2026) |
| Photoconductivity from guided light | reported (yamada1981 bulk; li2026photonics TFLN) |
| Pyroelectric charge from temperature changes | reported (bulmer1986) |
| Protons (H+) in bulk LN | dominant dark carrier in bulk LN (volk2008 pp. 59-60, P-comp); OH reduction helps bulk drift (nagata1996, title) |
| Li+ ion migration | not established for TFLN by any primary source found (R08 sec. 3.3 and open item 6); shown as U and not used in the model |

- The two-layer formula has one time constant. Real devices show several (yamada1981) and stretched behavior; the simulator offers a three-layer (cladding / LN / buried oxide) network with independent eps and sigma per layer, solved as a linear ODE system, and an Arrhenius factor sigma_i(T) = sigma_i(T0) exp[-(E_a/k_B)(1/T - 1/T0)] with E_a template.
- Frequency response: H(f) = V_1(f)/V(f) for the same network; the relaxation step appears between the two RC corners. holzgrafe2024 measured the enhancement band at 1-20 kHz in their devices; the figure marks it as a reported band, not a model output.
- Measurement: slow square wave or step bias while monitoring optical output at quadrature; low-frequency EO response by lock-in from mHz up; long-term bias-voltage logs under a control loop.
- Error sources: optical power during the test (photoconductivity), temperature (pyroelectric and Arrhenius), humidity and surface state for uncladded devices (assumption, no source held), and the bias history (hysteresis, yeh2026).

---

## 4.8 Thermal effects: thermo-optic shifts, thermal lenses, ring bistability

### L1

Heat changes lithium niobate's extraordinary index 5 to 11 times more than its ordinary index, depending on wavelength and source (table below). A ring resonator heated by its own light shifts to longer wavelength, so a laser sweeping upward drags the resonance with it and the transmission dip turns into a triangle. A strong beam in a bulk crystal heats its own path and builds a lens.

> [fig-04-09] Thermal calculator: dn_o/dT and dn_e/dT versus wavelength and temperature from sourced models; thermal-lens focal length from beam power, radius, absorption, length; ring resonance shift per kelvin with a template group index.

### L2

| Quantity | Value | Conditions | Source | Status |
|---|---|---|---|---|
| dn_e/dT | 3.34e-5 /K | 1523 nm, 300 K | moretti2005 via zhu2021 | S |
| dn_e/dT | 3.75e-5 / 4.01e-5 / 4.89e-5 /K | CLN, 1550 / 1064 / 633 nm, 25 C | jundt1997 Sellmeier, recomputed (R06 sec. 2.4) | derived (C in R06) |
| dn_o/dT | 0.41e-5 / 0.54e-5 / 0.94e-5 /K | CLN, 1550 / 1064 / 633 nm, 25 C | cti1999 Sellmeier, recomputed (R06 sec. 2.4) | derived from V |
| dn_o/dT, dn_e/dT at 632 nm | (-1.7 + 6.9e-3 T) x 1e-5 /K; (-2.6 + 22.4e-3 T) x 1e-5 /K; at 300 K: 0.37e-5 and 4.12e-5 | T in K (range 300-515 K) | schwesyg2011 Eqs. 2.26-2.27 quoting moretti2005 | S |
| Thermal conductivity | 3.92 W/(m K) CLN; 5.97 W/(m K) near-SLN | room temperature | volk2008 Table 1.1 | P-comp |
| Do not use for dn/dT | Gayer 2008 MgO:LN coefficients give anomalous dn/dT (e.g. -7.1e-5 /K for MgO1-SLN n_e) | 1550 nm | R14 row 36c | derived (flag) |

- Thermal lens (schwesyg2011 Eq. 2.28; S): f ~ pi w^2 K_th / (alpha P L dn/dT), valid for f >> L.
- Ring thermal shift: d lambda_res / dT = lambda Gamma (dn_eff/dT) / n_g, with Gamma and n_g from the mode (template on the page unless a mode solve is attached).
- x-cut anisotropy: in x-cut TFLN the thermo-optic response depends on propagation angle and polarization through the mode's overlap with the o and e axes; a generalized analytical model exists (shim2026; reported).
- Athermal ring: a thin TiO2 cladding on an x-cut LN ring cancels the first-order thermo-optic coefficient at 20 C; residual second-order 0.37 pm/K^2; resonance shift within 0.33 nm over -10 to 50 C (ling2020; reported).
- High power: heating from absorption and beam-quality degradation reported in MgO:PPLN above 10 W pump (schwesyg2011 p. 21, citing its ref. [14]; S). An absorption of 1e-4 cm^-1 is already a concern for cw singly resonant OPOs pumped at 10-20 W (schwesyg2011 p. 21; S).

Derived check of the thermal-lens example in schwesyg2011 p. 21 (10 W, w = 150 um, alpha = 0.005 cm^-1, L = 20 mm, 100 C, K_th = 5 W/(m K)): with dn_e/dT at 632 nm and 373 K from the formula above (5.76e-5 /K), f = 61 mm; the thesis states about 100 mm. Same order; which dn/dT the thesis used is not stated. Status: derived, flagged in open-questions.md.

### L3

- Thermal bistability (carmon2004; title: dynamical thermal behavior and thermal self-stability of microcavities). Standard model used by the figure: absorbed power heats the ring, n rises, the resonance red-shifts; a laser swept toward longer wavelength drags the resonance along its flank until it falls off abruptly (triangular dip); swept toward shorter wavelength it jumps across the resonance (narrowed dip). Photorefraction in LN adds a slower term of opposite sign (lin2021), producing oscillation dynamics (sun2017, title) and self-starting soliton combs (he2019).
- dn/dT sources: moretti2005 (320-515 K, 632 and 1523 nm, interferometric; abstract read, table not read); jundt1997 (temperature-dependent n_e Sellmeier; coefficients via R06, not read here). dn_o/dT values disagree by up to 2.5x between cti1999 and the moretti2005 formula (R14 row 38).
- Measurement: interferometric phase versus temperature on a plate; ring resonance tracking versus stage temperature (separate from optical self-heating by using low probe power).

---

## 4.9 Lithium out-diffusion

### L1

At the temperatures used for diffusion and annealing, lithium oxide leaves the surface (carruthers1974; ranganath1977). The lithium-poor skin has a higher extraordinary index than the crystal below, so it guides light: the 1973 "thin-film LiNbO3" modulator was such a skin, not a film (kaminow1973). The same loss became a problem when titanium was diffused in to make waveguides; Ti indiffusion can also flip the ferroelectric domain at the +c surface (miyazawa1979); and lithium loss remains a question for every high-temperature anneal of thin films.

> [fig-04-10] Out-diffusion profile: a Li2O deficit profile versus depth for an anneal time and temperature, with the resulting n_e profile and local Curie temperature; diffusion coefficient is a template input.

### L2

| Event or quantity | Value | Source | Status |
|---|---|---|---|
| Out-diffused planar guide modulator | broadband EO phase modulator; modulation index per volt 0.13 V^-1; base bandwidth 3.2 GHz (50 Ohm); 0.2 mW/MHz for 1 rad | kaminow1973 | reported |
| Diffusion kinetics and waveguiding of out-diffused layers | (title) | carruthers1974 | reported (title) |
| Ti-indiffused waveguides | Ti, V, Ni diffused into LN; single-mode guides within about 1 um of the surface | schmidt1974 | reported |
| Side effect of Ti indiffusion | accompanying Li2O out-diffusion gives unwanted guided modes in y-cut; suppressed with Li2O | ranganath1977 | reported |
| Suppression by pre-anneal | y-cut substrate annealed in Li2CO3 powder, 600 C, 72 h, before Ti diffusion: single TE and TM modes, no out-diffusion modes at 632.8 nm | miyazawa1977 | reported |
| Li2O compensation applied to planar and channel guides | (title) | burns1978 | reported (title) |
| Domain inversion | Ti diffusion on the +c face forms a surface layer with reversed polarization; none on the -c face | miyazawa1979 | reported |
| Reversal undone by Li-rich vapor | erasure of domain inversion in Ti:LN by Li-rich vapor transport (title) | hua2015 | reported (title) |
| Annealed TFLN material Q | about 1.6e8 (0.2 dB/m) after post-fabrication anneal | shams2022 | reported |
| Hypothesis | Li out-diffusion during anneals as one cause of higher coercive fields in thin films | zhu2021 via R08 sec. 3.6 | S (hypothesis) |

Derived numbers (Schlarb generalized Sellmeier as given in volk2008 Eqs. 6.9-6.10, Table 6.1; status S per R14 N2; 24.5 C):

| Quantity | Value | Status |
|---|---|---|
| dn_e / d(mol% Li2O), 632.8 nm | -9.7e-3 per mol% | derived (S inputs) |
| dn_o / d(mol% Li2O), 632.8 nm | +6.0e-4 per mol% | derived (S inputs) |
| dn_e / d(mol% Li2O), 1064 nm | -9.1e-3 per mol% | derived (S inputs) |
| Curie temperature slope | 39.06-39.26 C per mol% Li2O | Iyi 1992 and Bordui 1992 fits via volk2008 Eqs. 6.2-6.3 (R14 row 17); P-comp |

Loss of Li2O raises n_e (about +1e-2 per mol% lost) and slightly lowers n_o, so a Li-depleted surface layer guides extraordinary light and not ordinary light, and has a locally lower Curie temperature. These are model predictions from the generalized Sellmeier, valid 400-1200 nm with about 2e-3 accuracy (R14 row 37).

### L3

- No diffusion coefficient for Li2O out-diffusion under LNOI anneal conditions was found in held sources (R08 sec. 3.6, not verified). The figure's D is template; the depth axis is shown in units of sqrt(D t) unless a sourced D is attached.
- Why the domain inverts on +c during Ti indiffusion: miyazawa1979 discusses an explanation not stated in its abstract; the common attribution to Li2O out-diffusion is U here.
- Bulk dark conduction is protonic, not Li+ (volk2008 pp. 59-60; sec. 4.1 L3). Out-diffusion is a high-temperature surface process and is separate from room-temperature charge transport; the chapter does not link it to DC drift (sec. 4.7, U row).
- Historical role: out-diffused guides (1973-1974) preceded Ti indiffusion (1974) and proton exchange (1982, R07); the Li2O compensation work of 1977-1978 is the first systematic fight with lithium loss in LN integrated optics. The near-stoichiometric direction (Li-rich vapor transport equilibration) is the same chemistry run in reverse.

---

## 4.10 Fabrication pitfalls: practitioner notes

### L1

Lithium niobate punishes fabrication habits that work on silicon. It is an insulator that charges under electron beams, a pyroelectric that charges on a hotplate, and a crystal whose two polar faces etch at different rates. The items below come from public notes of a TFLN fabrication practitioner (2018-2025; R02), with the mechanism and a primary source added where one exists.

> [fig-04-11] Pitfall cards: six cards, each cause -> mechanism -> number -> fix, with a live number computed from the chapter's models (e.g. bake voltage from fig-04-07). One own SEM per card where the author permits.

### L2

| # | Pitfall (practitioner note, date) | Mechanism and number | Fix in the note | Status |
|---|---|---|---|---|
| 1 | Hotplate bakes fry devices or crack the whole substrate; worse on z-cut (blog-ofs79, 2025-12-29) | pyroelectric charge; 95 K step gives 7.5-17.8 kV across 0.5 mm z-cut, unscreened (sec. 4.6, derived) | conductive coating or aluminum-foil wrap as a discharge path | practitioner report; mechanism derived |
| 2 | 1980s z-cut channel-waveguide interferometers drift more than x-cut (blog-ofs79) | z-cut pyroelectric instability (bulmer1986, reported) | x-cut layout | reported |
| 3 | During a 4 K cooldown an LN chip's field damaged a device on another chip; shielding electrodes protected the neighbor; IDTs (interdigital transducers) on the LN chip still failed (blog-ofs79) | pyroelectric charge on cooling | shielding electrodes | practitioner report (specifics U) |
| 4 | Released x-cut TFLN structures on Si collapsed during 4 K cooldowns after a change of wafer (blog-ofs79) | hypothesis in the note: pyroelectric charge plus electrostatic pull-in; CTE mismatch ruled out because the onset was sudden | Al electrodes shorting LN parts to the Si substrate; collapse stopped | practitioner report; mechanism is a hypothesis |
| 5 | Heating z-cut LN to 120 C could expose ZEP resist (blog-ln-properties, A1; attributed there to "Mostafa et al. 2006", very likely bourim2006, whose first author is El Mostafa Bourim) | pyroelectric electron emission from the polar face (bourim2006, title) | | U (resist claim not checked in the paper) |
| 6 | Electron-beam lithography on LN needs a discharge layer; 5-10 nm Al preferred; a 5 nm Ti discharge layer once cross-linked the top of the resist because it ran too hot; clamp must contact the discharge layer (blog-ebl-2024, 2024-10-13) | charging of an insulating substrate | thin low-melting-point metal (Al); the note removes Al in an alkaline resist developer | practitioner report |
| 7 | a-Si hard mask on oxide over y-cut TFLN cracked and etched non-uniformly under Ar+ milling; cracks transferred to LN edges; mask ran out before LN was etched through (blog-hardmask-2018, 2018-08-20) | film stress and fragile mask edges; films grown on LN may differ from the same films on Si (note's hypothesis) | lower mill angle tried; conclusion: mask poor and fragile near edges | practitioner report |
| 8 | HF clean: the -c end of domains etches much faster than +c (volk2008 p. 168, P-comp; nassau1966; barry1998; sones2002, titles); post-HF SEM of a y-cut nanobeam shows asymmetric hole sidewalls (blog-ln-properties, 2018) | face-dependent etch rate; in x- and y-cut devices sidewalls facing -c and +c recede differently | none stated; the note records that the chip was annealed before fabrication | P-comp; SEM observation |
| 9 | Ion milling depends strongly on residual gas partial pressure; O2 oxidizes metal masks or ashes resist (blog-ln-properties) | | | practitioner report |
| 10 | "Li doesn't form volatiles with Br or Cl" (blog-ln-properties) | | | U (R02 flag: verify before reuse) |

### L3

- The orientation of c in the post-HF SEM is not recorded in the note; the asymmetry and the -c rule are stated, not which side is which.
- Bake voltages are given as ranges spanning the pyroelectric coefficient spread (sec. 4.6).

---

## Cross-links

- Pockels tensor and r33 values: chapter 02 (sec. 2.2).
- Nb antisites, Li vacancies, composition: chapter 01.
- Annealing, ion slicing, Ar+ milling, poling: chapter 05.
- Modulator records and drift-free claims in products: chapter 06.
- History rows 1966 optical damage, 1968 holography, 1969 charge-drift model, 1974 bulk photovoltaic effect, 1980/1984 MgO: chapter 07 (R07).
