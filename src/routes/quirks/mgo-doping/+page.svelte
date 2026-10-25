<!-- Chapter 4.2 Doping the damage out. Source: content/chapters/04-quirks/manuscript.md sec. 4.2, figures.md fig-04-03. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import F03Mgo from "$lib/figures/quirks/F03Mgo.svelte";

  let { data }: { data: PageData } = $props();
</script>

<QSection {data} l2="L2 Thresholds and mechanism" l3="L3 Definitions and other routes">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">threshold doping</span></div>
    <div class="body">
      <p class="tx">Adding about 5% magnesium oxide to congruent lithium niobate makes it withstand visible light that would scar the undoped crystal. Magnesium does not stop the light-driven current. It makes the crystal about a hundred times more photoconductive, so the separated charge leaks back before it builds a large field (Bryan et al. 1984 <Src id="bryan1984" code="reported" cite={false} />). Below a threshold concentration the effect is small; above it photorefraction collapses. A crystal closer to the ideal 50:50 Li:Nb ratio (<span class="term" data-pop="g:stoichiometric">near-stoichiometric</span>) needs much less dopant.</p>
      <F03Mgo />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Thresholds and mechanism">
    <div class="sh"><h2 class="biref">L2 Thresholds and mechanism</h2><span class="meta">Volk &amp; W&ouml;hlecke Table 4.3; Bryan 1984; Furukawa 2000</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Crystal</th><th>Damage threshold intensity</th><th>Condition</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>CLN</td><td class="q-v">1 kW/cm<sup>2</sup></td><td rowspan="7" class="q-w">cw green, beam distortion after 10 min</td><td class="q-s"><Src id="volk2008" loc="Table 4.3, p. 97" code="P-comp" /></td></tr>
            <tr><td>CLN:3% MgO</td><td class="q-v">10 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>CLN:4.5% MgO</td><td class="q-v">75 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>CLN:6% MgO</td><td class="q-v">&gt; 8000 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>NSLN</td><td class="q-v">0.1 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>NSLN:0.6% MgO</td><td class="q-v">10 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
            <tr><td>NSLN:1.8% MgO</td><td class="q-v">&gt; 8000 kW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="Table 4.3" code="P-comp" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="q-note">Table 4.3 data are from Furukawa et al. 2001.</p>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>MgO threshold</td><td class="q-v q-w">&ge; 4.5 at.% MgO</td><td class="q-s"><Src id="bryan1984" code="reported" /></td></tr>
            <tr><td>Mechanism at the threshold</td><td class="q-w">photoconductivity up about 100&times;; Glass current not reduced; Arrhenius activation 0.1 eV (resistant) vs 0.5 eV (undoped)</td><td class="q-s"><Src id="bryan1984" code="reported" /></td></tr>
            <tr><td>OH stretch line</td><td class="q-w">2.83 &micro;m above threshold, 2.87 &micro;m below</td><td class="q-s"><Src id="bryan1984" code="reported" /></td></tr>
            <tr><td>MgO threshold in compilations</td><td class="q-w">5 mol% (congruent melt); 4.5-4.9 mol%</td><td class="q-s"><Src id="volk2008" loc="p. 82" code="P-comp" /> <Src id="schwesyg2011" loc="p. 19" code="P-comp" /></td></tr>
            <tr><td>MgO threshold, near-stoichiometric ([Li]/[Nb] = 0.993)</td><td class="q-w">&gt; 0.78 mol%: no measurable damage at 532 nm up to 2 MW/cm<sup>2</sup></td><td class="q-s"><Src id="furukawa2000" code="reported" /></td></tr>
            <tr><td>Near-stoichiometric LN without Mg</td><td class="q-w">lower damage resistance than CLN</td><td class="q-s"><Src id="furukawa2000" code="reported" /></td></tr>
            <tr><td>CLN vs NSLN crossover</td><td class="q-w">NSLN shows more photorefraction at low and moderate intensity; CLN rises steeply above 100-200 W/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="p. 77" code="P-comp" /></td></tr>
            <tr><td>MgO:LN vs CLN transport</td><td class="q-w">photoconductivity 10-100&times; higher; bulk photovoltaic current about 10&times; lower (green light)</td><td class="q-s"><Src id="schwesyg2011" loc="pp. 19-20" code="P-comp" /></td></tr>
            <tr><td>ZnO threshold, congruent melt</td><td class="q-v q-w">about 6-7 mol%</td><td class="q-s"><Src id="volk2008" loc="p. 82" code="P-comp" /></td></tr>
            <tr><td>In<sub>2</sub>O<sub>3</sub>, Sc<sub>2</sub>O<sub>3</sub></td><td class="q-w">1.7 mol% In<sub>2</sub>O<sub>3</sub> or 1.5 mol% Sc<sub>2</sub>O<sub>3</sub> act like 4.5-5 mol% MgO</td><td class="q-s"><Src id="volk2008" loc="p. 83" code="P-comp" /></td></tr>
            <tr><td>HfO<sub>2</sub>, ZrO<sub>2</sub></td><td class="q-w">Hf about 2 at.% in the crystal; ZrO<sub>2</sub> below 2 mol%</td><td class="q-s"><Src id="volk2008" loc="p. 83" code="P-comp" /></td></tr>
            <tr><td>LiNbO<sub>3</sub>:2% Zr</td><td class="q-w">no optical damage up to 20 MW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="p. 83 (Kong et al.)" code="P-comp" /></td></tr>
            <tr><td>NSLN:1% Mg, VTE NSLN:Mg</td><td class="q-w">resistant to 2-8 MW/cm<sup>2</sup>; stable to 26 MW/cm<sup>2</sup></td><td class="q-s"><Src id="volk2008" loc="p. 85" code="P-comp" /></td></tr>
            <tr><td>Space-charge field, NSLN:1% Mg</td><td class="q-w">optical-damage &delta;&Delta;n about 10<sup>&minus;8</sup>, more than 100&times; below CLN:5% Mg</td><td class="q-s"><Src id="volk2008" loc="p. 85 (data Furukawa 2000)" code="P-comp" /></td></tr>
            <tr><td>Bulk laser damage, MgO:LN</td><td class="q-w">highest 14 J/cm<sup>2</sup> (1.053 &micro;m, 1 ns) at 1 mol% MgO; lower above 3 mol% (MgO aggregates scatter)</td><td class="q-s"><Src id="furukawa1991" code="reported" /></td></tr>
            <tr><td>First reports</td><td class="q-w">IQEC 1980 conference abstract (Zhong, Jin, Wu); journal report 1984</td><td class="q-s"><Src id="zhong1980" code="S" /> <Src id="bryan1984" code="reported" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Mechanism (Volk &amp; W&ouml;hlecke Sec. 2.5, 4.2.2; Schwesyg p. 20 <Src id="volk2008" code="P-comp" cite={false} />): below the threshold, Mg<sup>2+</sup> replaces <span class="term" data-pop="g:antisite-nb-li">Nb antisites</span> on Li sites. At the threshold almost all Nb<sub>Li</sub> is gone; further Mg goes onto Nb sites, Fe<sup>3+</sup>-like impurities are pushed onto Nb sites and stop acting as acceptors, and the OH band shifts. Trivalent and tetravalent dopants need less concentration, which the charge-compensation scheme explains qualitatively (p. 83).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Definitions and other routes">
    <div class="sh"><h2 class="biref">L3 Definitions and other routes</h2><span class="meta">units, operational thresholds</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Threshold units differ by source: Bryan et al. state at.% MgO, the compilations mol% MgO in the melt or crystal. Each value is printed in the unit of its source and not converted.</li>
        <li>The threshold intensity of Table 4.3 is an operational definition (beam distortion after 10 min of cw green light) and depends on beam size and observation time.</li>
        <li>Other routes to a lower photovoltaic field: raise the dark conductivity (strong reduction, Ag doping, proton exchange) or suppress j<sub>pv</sub> (UV instead of blue-green, strong oxidation) (p. 75 <Src id="volk2008" code="P-comp" cite={false} />). Heating CLN to about 200 &deg;C also suppresses photorefractive damage (Schwesyg p. 19, citing its ref. 29 <Src id="schwesyg2011" code="S" cite={false} />).</li>
        <li>Above-threshold MgO:LN still shows light-induced index changes when a pyroelectric field is present (<a class="lk" href="/quirks/pyroelectricity/#l3">4.6 L3</a>).</li>
        <li>The same threshold removes GRIIRA (<a class="lk" href="/quirks/griira/">4.4</a>).</li>
      </ul>
    </div>
  </section>
</QSection>
