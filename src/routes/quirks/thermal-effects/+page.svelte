<!-- Chapter 4.8 Thermal effects. Source: content/chapters/04-quirks/manuscript.md sec. 4.8, figures.md fig-04-09, fig-04-04. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F09Thermal from "$lib/figures/quirks/F09Thermal.svelte";
  import F04Ring from "$lib/figures/quirks/F04Ring.svelte";
  import { RING_POPS } from "$lib/figures/quirks/pops-ring";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    ...RING_POPS,
    "f9-j": { h: "dn<sub>e</sub>/dT from the Jundt Sellmeier", body: "Analytic temperature derivative of the Jundt 1997 temperature-dependent Sellmeier for congruent LN (coefficients status S, valid 0.4-5 &micro;m, 20-250 &deg;C). At 25 &deg;C: <span class='v'>4.89, 4.01, 3.75 &times;10<sup>&minus;5</sup> /K</span> at 633, 1064, 1550 nm.", badges: [["d", "derived"], ["s", "S"]] },
    "f9-t": { h: "Ring parameters", body: "Confinement &Gamma; and group index n<sub>g</sub> come from a mode solve of a specific waveguide; none is attached, so both are model parameters.", badges: [["t", "template"]] },
    "lens61": { h: "Thermal-lens check", body: "f = &pi;w<sup>2</sup>K<sub>th</sub>/(&alpha;PL dn/dT) with P = 10 W, w = 150 &micro;m, &alpha; = 0.005 cm<sup>&minus;1</sup>, L = 20 mm, K<sub>th</sub> = 5 W/(m K), dn<sub>e</sub>/dT = 5.76&times;10<sup>&minus;5</sup> /K (Moretti fit, 632 nm, 373 K): <span class='v'>61 mm</span>. The thesis prints about 100 mm.", badges: [["d", "derived"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Coefficients, lens, ring shift" l3="L3 Bistability and sources">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">heat moves n<sub>e</sub> more than n<sub>o</sub></span></div>
    <div class="body">
      <p class="tx">Heat changes lithium niobate's extraordinary index 5 to 11 times more than its ordinary index, depending on wavelength and source (table below; <span class="term" data-pop="g:thermo-optic-coefficient">thermo-optic coefficient</span>). A ring resonator heated by its own light shifts to longer wavelength, so a laser sweeping upward drags the resonance with it and the transmission dip turns into a triangle (<span class="term" data-pop="g:thermal-triangle">thermal triangle</span>). A strong beam in a bulk crystal heats its own path and builds a lens.</p>
      <F09Thermal />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Coefficients, lens, ring shift">
    <div class="sh"><h2 class="biref">L2 Coefficients, lens, ring shift</h2><span class="meta">dn/dT by source</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Conditions</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>dn<sub>e</sub>/dT</td><td class="q-v">3.34&times;10<sup>&minus;5</sup> /K</td><td class="q-w">1523 nm, 300 K</td><td class="q-s"><Src id="moretti2005" loc="via Zhu 2021" code="S" /></td></tr>
            <tr><td>dn<sub>e</sub>/dT</td><td class="q-v q-w">3.75 / 4.01 / 4.89 &times;10<sup>&minus;5</sup> /K</td><td class="q-w">CLN, 1550 / 1064 / 633 nm, 25 &deg;C; Jundt 1997 Sellmeier, recomputed</td><td class="q-s"><Badge code="derived" pop="f9-j" /></td></tr>
            <tr><td>dn<sub>o</sub>/dT</td><td class="q-v q-w">0.41 / 0.54 / 0.94 &times;10<sup>&minus;5</sup> /K</td><td class="q-w">CLN, 1550 / 1064 / 633 nm, 25 &deg;C; data-sheet Sellmeier, recomputed</td><td class="q-s"><Src id="cti1999" code="V" text="derived from V" /></td></tr>
            <tr><td>dn<sub>o</sub>/dT, dn<sub>e</sub>/dT at 632 nm</td><td class="q-w">(&minus;1.7 + 6.9&times;10<sup>&minus;3</sup> T)&times;10<sup>&minus;5</sup> /K; (&minus;2.6 + 22.4&times;10<sup>&minus;3</sup> T)&times;10<sup>&minus;5</sup> /K; at 300 K: 0.37 and 4.12&times;10<sup>&minus;5</sup></td><td class="q-w">T in K, 300-515 K</td><td class="q-s"><Src id="schwesyg2011" loc="Eqs. 2.26-2.27 (Moretti 2005)" code="S" /></td></tr>
            <tr><td>Thermal conductivity</td><td class="q-v">3.92 W/(m K) CLN; 5.97 W/(m K) near-SLN</td><td class="q-w">room temperature</td><td class="q-s"><Src id="volk2008" loc="Table 1.1" code="P-comp" /></td></tr>
            <tr><td>Not for dn/dT</td><td class="q-w">Gayer 2008 MgO:LN coefficients give anomalous dn/dT (e.g. &minus;7.1&times;10<sup>&minus;5</sup> /K for MgO1-SLN n<sub>e</sub> at 1550 nm)</td><td></td><td class="q-s"><Badge code="derived" text="derived; excluded" /></td></tr>
          </tbody>
        </table>
      </div>
      <ul class="q-list">
        <li>Thermal lens (Schwesyg Eq. 2.28 <Src id="schwesyg2011" code="S" cite={false} />): f &asymp; &pi;w<sup>2</sup>K<sub>th</sub>/(&alpha;PL dn/dT), valid for f &gg; L.</li>
        <li>Ring thermal shift: d&lambda;<sub>res</sub>/dT = &lambda;&Gamma;(dn<sub>eff</sub>/dT)/n<sub>g</sub>, with &Gamma; and n<sub>g</sub> from the mode (templates in the figure).</li>
        <li>x-cut anisotropy: in x-cut TFLN the thermo-optic response depends on propagation angle and polarization through the mode's overlap with the o and e axes; a generalized analytical model exists (<Src id="shim2026" code="reported" />).</li>
        <li>Athermal ring: a thin TiO<sub>2</sub> cladding on an x-cut LN ring cancels the first-order thermo-optic coefficient at 20 &deg;C; residual second order 0.37 pm/K<sup>2</sup>; resonance within 0.33 nm over &minus;10 to 50 &deg;C (<Src id="ling2020" code="reported" />).</li>
        <li>High power: absorption heating and beam-quality loss reported in MgO:PPLN above 10 W pump; an absorption of 10<sup>&minus;4</sup> cm<sup>&minus;1</sup> already matters for cw singly resonant OPOs pumped at 10-20 W (Schwesyg p. 21 <Src id="schwesyg2011" code="S" cite={false} />).</li>
      </ul>
      <p class="q-flag"><b>Conflict.</b> The thesis thermal-lens example (10 W, w = 150 &micro;m, &alpha; = 0.005 cm<sup>&minus;1</sup>, L = 20 mm, 100 &deg;C, K<sub>th</sub> = 5 W/(m K)) gives f = 61 mm with dn<sub>e</sub>/dT at 632 nm and 373 K from the Moretti fit <Badge code="derived" pop="lens61" />; the thesis states about 100 mm. Same order; which dn/dT the thesis used is not stated.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Bistability and sources">
    <div class="sh"><h2 class="biref">L3 Bistability and sources</h2><span class="meta">thermal triangle; dn/dT provenance</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Thermal bistability (Carmon et al. 2004 <Src id="carmon2004" code="reported" text="reported (title)" cite={false} />). Standard model used by the figure: absorbed power heats the ring, n rises, the resonance red-shifts; a laser swept toward longer wavelength drags the resonance along its flank until it drops off (triangular dip); swept toward shorter wavelength it jumps across the resonance (narrowed dip). Photorefraction in LN adds a slower term of opposite sign (<Src id="lin2021" code="reported" />), with reported oscillation dynamics (<Src id="sun2017" code="reported" text="reported (title)" />) and self-starting soliton combs (<Src id="he2019" code="reported" />).</li>
        <li>dn/dT sources: Moretti 2005 (320-515 K, 632 and 1523 nm, interferometric; abstract read, table not read); Jundt 1997 (temperature-dependent n<sub>e</sub> Sellmeier; coefficients via a secondary). dn<sub>o</sub>/dT disagrees by up to 2.5&times; between the data-sheet Sellmeier and the Moretti fit.</li>
        <li>Measurement: interferometric phase versus temperature on a plate; ring resonance tracking versus stage temperature, separated from optical self-heating by low probe power.</li>
      </ul>
      <p class="tx">Ring sweep with photorefraction off; switch it on to compare with <a class="lk" href="/quirks/thin-film-photorefraction/#l2">4.3</a>. The template model shows the shortened triangle; it does not produce the oscillations reported by Sun et al.</p>
      <F04Ring preset="thermal" />
    </div>
  </section>
</QSection>
