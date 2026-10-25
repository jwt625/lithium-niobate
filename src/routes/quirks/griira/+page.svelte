<!-- Chapter 4.4 GRIIRA, BLIIRA and polarons. Source: content/chapters/04-quirks/manuscript.md sec. 4.4, figures.md fig-04-05. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import F05Griira from "$lib/figures/quirks/F05Griira.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f5-tmpl": { h: "GRIIRA chain parameters", body: "dN/dt = g I<sub>g</sub>(1 &minus; N/N<sub>max</sub>) &minus; N/&tau;<sub>p</sub>, &alpha;<sub>IR</sub> = &sigma;N, &Delta;T = &alpha;<sub>IR</sub>P<sub>IR</sub>L/G<sub>th</sub>, SHG<sub>rel</sub> = sinc<sup>2</sup>(&part;&Delta;k/&part;T &middot; &Delta;T L/2), steady state. g = 4.9&times;10<sup>18</sup> m<sup>&minus;3</sup>s<sup>&minus;1</sup> per W/m<sup>2</sup>, &tau;<sub>p</sub> = 1 ms, &sigma; = 2&times;10<sup>&minus;23</sup> m<sup>2</sup>, N<sub>max</sub> = 10<sup>23</sup> m<sup>&minus;3</sup> scaled linearly to zero at the Mg threshold, G<sub>th</sub> = 0.1 W/K, L = 10 mm: chosen so SHG<sub>rel</sub> is about 0.6 at the 2.5 kW/cm<sup>2</sup> measurement condition. No rate constant, cross-section or thin-film value is held.", badges: [["t", "template"]] },
    "f5-dk": { h: "QPM detuning per kelvin", body: "First-order e-e-e SHG 1064 &rarr; 532 nm in congruent LN, Jundt 1997 Sellmeier (coefficients S): &Lambda; = 6.78 &micro;m at 25 &deg;C, &part;&Delta;k/&part;T = <span class='v'>173 rad/(m K)</span> by central difference, no period expansion.", badges: [["d", "derived"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Bands and thresholds" l3="L3 Band shapes and gaps">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">GRIIRA, BLIIRA</span></div>
    <div class="body">
      <p class="tx">Intense green or blue light, the kind produced by frequency doubling, makes lithium niobate temporarily absorb infrared light (<span class="term" data-pop="g:griira">GRIIRA</span>, <span class="term" data-pop="g:bliira">BLIIRA</span>). Electrons excited by the green light get stuck on niobium ions sitting in lithium sites, and each stuck electron (a bound <span class="term" data-pop="g:polaron">small polaron</span>) absorbs near-infrared photons. The absorbed infrared heats the crystal where the beams overlap, which detunes the phase matching and caps conversion efficiency. The magnesium doping that cures photorefraction removes the trap sites.</p>
      <F05Griira />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Bands and thresholds">
    <div class="sh"><h2 class="biref">L2 Bands and thresholds</h2><span class="meta">Schwesyg Table 2.1; Volk &amp; W&ouml;hlecke pp. 14-19, 94-96</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Center</th><th>Absorption peak</th><th>Width (HWHM)</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Bound small polaron Nb<sub>Li</sub><sup>4+</sup></td><td class="q-v">12900 cm<sup>&minus;1</sup> (1.60 eV, 775 nm)</td><td class="q-v">3200 cm<sup>&minus;1</sup></td><td class="q-s"><Src id="schwesyg2011" loc="Table 2.1, p. 11" code="P-comp" /></td></tr>
            <tr><td>Free small polaron Nb<sub>Nb</sub><sup>4+</sup></td><td class="q-v q-w">8050 cm<sup>&minus;1</sup> (about 1.0 eV); 0.95 eV in reduced above-threshold MgO:LN</td><td class="q-v">3000 cm<sup>&minus;1</sup></td><td class="q-s"><Src id="schwesyg2011" loc="p. 11" code="P-comp" /> <Src id="volk2008" loc="p. 19" code="P-comp" /></td></tr>
            <tr><td>Bound bipolaron Nb<sub>Li</sub><sup>4+</sup>-Nb<sub>Nb</sub><sup>4+</sup></td><td class="q-v">20140 cm<sup>&minus;1</sup> (2.50 eV)</td><td class="q-v">4400 cm<sup>&minus;1</sup></td><td class="q-s"><Src id="schwesyg2011" loc="p. 12" code="P-comp" /></td></tr>
            <tr><td>Bound hole polaron O<sup>&minus;</sup> (near a Li vacancy)</td><td class="q-v">20000 cm<sup>&minus;1</sup> (500 nm), very broad</td><td class="q-v">not tabulated</td><td class="q-s"><Src id="schwesyg2011" loc="p. 12" code="P-comp" /></td></tr>
            <tr><td>Bipolaron dissociation energy</td><td class="q-v">about 0.3 eV</td><td>thermal</td><td class="q-s"><Src id="volk2008" loc="p. 17" code="P-comp" /></td></tr>
            <tr><td>Small-polaron hopping activation</td><td class="q-v q-w">0.49 eV (optical 1.6 eV : thermal about 4:1)</td><td>reduced LN</td><td class="q-s"><Src id="volk2008" loc="pp. 18-19" code="P-comp" /></td></tr>
          </tbody>
        </table>
      </div>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>GRIIRA assignment</td><td class="q-w">small bound polaron on the Nb antisite, Nb<sub>Li</sub><sup>5+</sup> + e<sup>&minus;</sup> &rarr; Nb<sub>Li</sub><sup>4+</sup></td><td class="q-s"><Src id="furukawa2001" code="reported" /> <Src id="volk2008" loc="p. 96" code="P-comp" /></td></tr>
            <tr><td>GRIIRA threshold</td><td class="q-w">same MgO threshold as photorefraction</td><td class="q-s"><Src id="furukawa2001" code="reported" /></td></tr>
            <tr><td>GRIIRA thresholds in Mg</td><td class="q-w">about 5% (CLN), about 1.5% (NSLN)</td><td class="q-s"><Src id="volk2008" loc="p. 96 (data Furukawa 2001)" code="P-comp" /></td></tr>
            <tr><td>Measurement conditions</td><td class="q-w">532 nm pump at 2.5 kW/cm<sup>2</sup>, 1064 nm probe at 21 kW/cm<sup>2</sup>; decays practically instantly when the pump stops; photothermal technique</td><td class="q-s"><Src id="volk2008" loc="Fig. 4.14, p. 96" code="P-comp" /> <Src id="furukawa2001" code="reported" /></td></tr>
            <tr><td>Picosecond BLIIRA</td><td class="q-w">lowest in KNbO<sub>3</sub> and MgO-doped congruent and stoichiometric LN; periodic poling slightly increases it</td><td class="q-s"><Src id="hirohashi2007" code="reported" /></td></tr>
            <tr><td>Dark (gray) trace</td><td class="q-w">visible absorption rises from 0.03 to 0.15-0.2 cm<sup>&minus;1</sup> after IR pulse exposure; transmission loss 10-15%; about 100 MW/cm<sup>2</sup> with repeated pulses</td><td class="q-s"><Src id="volk2008" loc="pp. 51, 94-95" code="P-comp" /></td></tr>
            <tr><td>Dark trace lifetime</td><td class="q-w">stable in CLN; decays in 10-20 min in Mg- or Zn-doped crystals above threshold</td><td class="q-s"><Src id="volk2008" loc="pp. 95-96" code="P-comp" /></td></tr>
            <tr><td>Consequence</td><td class="q-w">local heating, thermal lens, disturbed phase matching</td><td class="q-s"><Src id="volk2008" loc="p. 95" code="P-comp" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Band shape: Volk &amp; W&ouml;hlecke Eq. 2.11 gives the small-bound-polaron absorption as a Gaussian in photon energy around 4U + &epsilon;, fitted to the 1.6 eV band with phonon energy &#8463;&omega;<sub>0</sub> &asymp; 0.1 eV and polaron stabilization energy U &asymp; 0.3 eV (p. 18 <Src id="volk2008" code="P-comp" cite={false} />).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Band shapes and gaps">
    <div class="sh"><h2 class="biref">L3 Band shapes and gaps</h2><span class="meta">bulk data only</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Bands are drawn as Gaussians in photon energy at the tabulated centres and HWHM; the O<sup>&minus;</sup> band has no tabulated width and is drawn as a marker. Peak heights are normalized; relative strengths are not drawn.</li>
        <li>Thin-film gap: no paper quantifying GRIIRA or BLIIRA in TFLN was found. Values on this page are bulk.</li>
        <li>Polaron model reviews: Schirmer et al. 2009 <Src id="schirmer2009" code="reported" text="reported (title)" cite={false} /> (electron small polarons and bipolarons), Imlau et al. 2015 <Src id="imlau2015" code="reported" text="reported (title)" cite={false} /> (optical nonlinearities of small polarons). Their numbers were not read; band values come from the two compilations above.</li>
        <li>Measurement: photothermal (heating-induced phase change of a probe), pump-probe transmission at 1064 nm under 532 nm pumping, or calorimetry.</li>
        <li>The trap that hosts the polaron is the Nb antisite that MgO replaces (<a class="lk" href="/quirks/mgo-doping/#l2">4.2</a>); the gray track and laser breakdown sit higher on the intensity ladder (<a class="lk" href="/quirks/damage-thresholds/">4.5</a>).</li>
      </ul>
    </div>
  </section>
</QSection>
