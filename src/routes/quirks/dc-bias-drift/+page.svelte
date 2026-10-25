<!-- Chapter 4.7 DC bias drift in modulators. Source: content/chapters/04-quirks/manuscript.md sec. 4.7, figures.md fig-04-08,
     fig-04-12. The footer bias meter (shell motif) links here. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F08Drift from "$lib/figures/quirks/F08Drift.svelte";
  import F12Timeline from "$lib/figures/quirks/F12Timeline.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f8-tmpl": { h: "Drift-model parameters", body: "LN film 600 nm, &epsilon;<sub>r</sub> 28 (lower bound of the 28.1-30 spread); cladding 1 &micro;m and buried oxide 2 &micro;m with &epsilon;<sub>r</sub> 3.9; interface layer 10 nm, &epsilon;<sub>r</sub> 28; Arrhenius activation 0.5 eV for every layer, referenced to 295 K; the bias step brings the modulator from null to quadrature at t = 0+ (V/V<sub>&pi;</sub> = 0.5). TFLN presets: the free conductivity is solved so the two-layer &tau; equals the reported RC fit; the other layer values are not measured.", badges: [["t", "template"]] },
    "f8-li": { h: "Li<sup>+</sup> ion migration", body: "Proposed in discussions of thin-film drift, but no primary source found here establishes it for TFLN; bulk dark conduction in LN is protonic (Volk &amp; W&ouml;hlecke pp. 59-60). Listed as unverified and not used in the model.", badges: [["u", "U"]] },
    "d47": { h: "Effective conductivities", body: "&sigma; = &epsilon;<sub>33</sub>&epsilon;<sub>0</sub>/&tau; with &epsilon;<sub>33</sub> = 28: <span class='v'>2.1&times;10<sup>&minus;8</sup> S/m</span> (&tau; = 11.9 ms), <span class='v'>2.8&times;10<sup>&minus;6</sup> S/m</span> (88.6 &micro;s). Bulk dark conductivity 10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m gives &tau; = 6.9 h to 29 d. Ratio 2&times;10<sup>6</sup> to 3&times;10<sup>10</sup>.", badges: [["d", "derived"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Layered relaxation" l3="L3 Mechanisms and measurement">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">bias point walks under constant voltage</span></div>
    <div class="body">
      <p class="tx">A lithium niobate modulator is set to its operating point with a DC voltage. Over seconds to hours that voltage stops doing its job: mobile charge inside and around the crystal rearranges and cancels part of the applied field, so the operating point walks away (<span class="term" data-pop="g:dc-bias-drift">DC bias drift</span>). Bulk telecom modulators have been engineered against it since at least 1981 (<Src id="yamada1981" code="reported" />; <Src id="gee1985" code="reported" />). Thin-film modulators show the same effect on much shorter time scales, and the 2024-2026 literature traces it to interfaces, cladding and contacts.</p>
      <p class="tx">The footer <span class="term" data-pop="drift">bias meter</span> uses a single RC with a 40 s display time constant.</p>
      <F12Timeline />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Layered relaxation">
    <div class="sh"><h2 class="biref">L2 Layered relaxation</h2><span class="meta">Maxwell-Wagner, two and three layers</span></div>
    <div class="body">
      <p class="tx">Two-layer model: layer 1 = LN, layer 2 = buffer or cladding, each a parallel capacitance C<sub>i</sub> and conductance G<sub>i</sub>, in series under a voltage step V:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>V</mi><mn>1</mn></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>V</mi><mrow><mo>[</mo><mfrac><msub><mi>G</mi><mn>2</mn></msub><mrow><msub><mi>G</mi><mn>1</mn></msub><mo>+</mo><msub><mi>G</mi><mn>2</mn></msub></mrow></mfrac><mo>+</mo><mrow><mo>(</mo><mfrac><msub><mi>C</mi><mn>2</mn></msub><mrow><msub><mi>C</mi><mn>1</mn></msub><mo>+</mo><msub><mi>C</mi><mn>2</mn></msub></mrow></mfrac><mo>&minus;</mo><mfrac><msub><mi>G</mi><mn>2</mn></msub><mrow><msub><mi>G</mi><mn>1</mn></msub><mo>+</mo><msub><mi>G</mi><mn>2</mn></msub></mrow></mfrac><mo>)</mo></mrow><msup><mi>e</mi><mrow><mo>&minus;</mo><mi>t</mi><mo>/</mo><mi>&tau;</mi></mrow></msup><mo>]</mo></mrow><mo>,</mo><mspace width="1em"/><mi>&tau;</mi><mo>=</mo><mfrac><mrow><msub><mi>C</mi><mn>1</mn></msub><mo>+</mo><msub><mi>C</mi><mn>2</mn></msub></mrow><mrow><msub><mi>G</mi><mn>1</mn></msub><mo>+</mo><msub><mi>G</mi><mn>2</mn></msub></mrow></mfrac></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">The LN voltage moves from capacitive division (t = 0+) to resistive division (t &rarr; &infin;). If the LN share grows with time the drift is called positive here; if it shrinks, negative. Sign conventions differ between papers; each reported drift below keeps the paper's own term.</p>
      <F08Drift />
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Result</th><th>Value</th><th>Device</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Two drift components</td><td class="q-w">short: several seconds (buffer-layer leakage); long: several hours (photorefraction from guided light)</td><td class="q-w">Ti:LN directional coupler, bulk</td><td class="q-s"><Src id="yamada1981" code="reported" /></td></tr>
            <tr><td>Conductive buffer</td><td class="q-w">ITO buffer (about 20 &Omega;/sq) instead of SiO<sub>2</sub>: long-term drift &lt; 0.3% in 8 h; equivalent-circuit model</td><td class="q-w">Ti:LN modulator, bulk</td><td class="q-s"><Src id="gee1985" code="reported" /></td></tr>
            <tr><td>Pyroelectric drift</td><td class="q-w">z-cut interferometers unstable with temperature; x-cut stable</td><td class="q-w">Ti:LN</td><td class="q-s"><Src id="bulmer1986" code="reported" /></td></tr>
            <tr><td>OH reduction</td><td class="q-w">improved long-term drift (title)</td><td class="q-w">bulk LN intensity modulators</td><td class="q-s"><Src id="nagata1996" code="reported" text="reported (title)" /></td></tr>
            <tr><td>DC-induced thermal shift</td><td class="q-w">DC voltage causes a thermal shift of the bias point (title)</td><td class="q-w">bulk LN</td><td class="q-s"><Src id="nagata2004" code="reported" text="reported (title)" /></td></tr>
            <tr><td>Analysis and control</td><td class="q-w">title-level</td><td class="q-w">bulk LN MZM</td><td class="q-s"><Src id="salvestrini2011" code="reported" text="reported (title)" /></td></tr>
            <tr><td>EO response 1 mHz to 1 MHz</td><td class="q-w">relaxation enhances EO modulation at 1-20 kHz, confounding V<sub>&pi;</sub> measurements; relaxation slowed &gt; 10<sup>4</sup>-fold by LN-metal interface control and annealing</td><td class="q-w">TFLN</td><td class="q-s"><Src id="holzgrafe2024" code="reported" /></td></tr>
            <tr><td>Anomalous sub-MHz response</td><td class="q-w">improved by LN/metal interface preparation and high-temperature anneal in forming gas</td><td class="q-w">x-cut TFLN phase modulators</td><td class="q-s"><Src id="puma2022" code="reported" /></td></tr>
            <tr><td>RC fit</td><td class="q-w">11.9 ms with SiO<sub>2</sub> cladding (positive drift); 88.6 &micro;s without cladding (negative drift); relaxation more than 100&times; shorter than bulk; optical intensity changes the low-frequency response via photoconductivity</td><td class="q-w">TFLN MZM</td><td class="q-s"><Src id="li2026photonics" code="reported" /></td></tr>
            <tr><td>Hysteresis</td><td class="q-w">reversible under zero or reverse bias; short-time drift attributed to charge trapping near the contact junction; active reset protocol</td><td class="q-w">TFLN</td><td class="q-s"><Src id="yeh2026" code="reported" /></td></tr>
            <tr><td>Ar<sup>+</sup> milling pre-treatment</td><td class="q-w">no drift under DC within 1 h; modulator &gt; 40 GHz, stable 30 min at 4.5 V</td><td class="q-w">TFLN</td><td class="q-s"><Src id="shi2025" code="reported" /></td></tr>
            <tr><td>Thin-film LiTaO<sub>3</sub></td><td class="q-w">&lt; 1 dB output fluctuation vs 5 dB for TFLN, quadrature bias, 46 h, 12.1 dBm input</td><td class="q-w">TFLT vs TFLN</td><td class="q-s"><Src id="powell2024" code="reported" /></td></tr>
            <tr><td>Thin-film LiTaO<sub>3</sub>, hot</td><td class="q-w">DC-bias stable at 120 &deg;C</td><td class="q-w">TFLT</td><td class="q-s"><Src id="alsayem2026" code="reported" text="reported (preprint)" /></td></tr>
            <tr><td>Cryogenic</td><td class="q-w">bias-drift-free 12 h</td><td class="q-w">LNOI MZI with superconducting nanowire single-photon detectors</td><td class="q-s"><Src id="lomonte2021" code="reported" /></td></tr>
            <tr><td>Liquid-nitrogen temperature</td><td class="q-w">stable DC operation</td><td class="q-w">TFLN</td><td class="q-s"><Src id="warner2025" code="reported" /></td></tr>
            <tr><td>Heterogeneous Si/TFLN</td><td class="q-w">weak bias drift; V<sub>&pi;</sub>L about 2.9 V cm; 176 Gb/s PAM4 (four-level pulse amplitude modulation)</td><td class="q-w">wafer-scale SOI/TFLN</td><td class="q-s"><Src id="lizy2024" code="reported" /></td></tr>
            <tr><td>Thermal biasing</td><td class="q-w">heaters bias TFLN modulators stably but cost power, cross-talk and bandwidth; thermo-optic bias in visible and near-infrared TFLN modulators (title)</td><td class="q-w">TFLN</td><td class="q-s"><Src id="holzgrafe2024" code="reported" /> <Src id="liu2026acs" code="reported" text="reported (title)" /></td></tr>
          </tbody>
        </table>
      </div>
      <h3 class="h3">Derived numbers <Badge code="derived" pop="d47" /></h3>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Formula and inputs</th></tr></thead>
          <tbody>
            <tr><td>Relaxation time from bulk dark conductivity</td><td class="q-v">6.9 h to 29 d</td><td class="q-w">&epsilon;<sub>33</sub>&epsilon;<sub>0</sub>/&sigma;<sub>d</sub>; &epsilon;<sub>33</sub> = 28; &sigma;<sub>d</sub> = 10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m (Volk &amp; W&ouml;hlecke p. 60)</td></tr>
            <tr><td>Effective conductivity implied by the TFLN RC fits</td><td class="q-v">2.1&times;10<sup>&minus;8</sup> S/m; 2.8&times;10<sup>&minus;6</sup> S/m</td><td class="q-w">&epsilon;<sub>33</sub>&epsilon;<sub>0</sub>/&tau; with &tau; = 11.9 ms; 88.6 &micro;s</td></tr>
            <tr><td>Ratio to bulk dark conductivity</td><td class="q-v">2&times;10<sup>6</sup> to 3&times;10<sup>10</sup></td><td class="q-w">above / (10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m)</td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Bulk LN dark conduction cannot produce millisecond relaxation. Some other path, 6 to 10 orders of magnitude more conductive, carries the screening charge; the papers above point to the LN-metal interface, the cladding, and traps near contacts.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Mechanisms and measurement">
    <div class="sh"><h2 class="biref">L3 Mechanisms and measurement</h2><span class="meta">candidates by evidence</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Candidate</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Conduction through buffer or cladding layers</td><td class="q-w">reported for bulk (<Src id="yamada1981" code="reported" />, <Src id="gee1985" code="reported" />) and TFLN (<Src id="li2026photonics" code="reported" />)</td></tr>
            <tr><td>LN-metal interface and contact traps</td><td class="q-w">reported (<Src id="holzgrafe2024" code="reported" />, <Src id="puma2022" code="reported" />, <Src id="yeh2026" code="reported" />)</td></tr>
            <tr><td>Photoconductivity from guided light</td><td class="q-w">reported (Yamada 1981 bulk; Li 2026 TFLN)</td></tr>
            <tr><td>Pyroelectric charge from temperature changes</td><td class="q-w">reported (<Src id="bulmer1986" code="reported" />; <a class="lk" href="/quirks/pyroelectricity/">4.6</a>)</td></tr>
            <tr><td>Protons (H<sup>+</sup>) in bulk LN</td><td class="q-w">dominant dark carrier in bulk LN (<Src id="volk2008" loc="pp. 59-60" code="P-comp" />); OH reduction helps bulk drift (Nagata 1996, title)</td></tr>
            <tr><td>Li<sup>+</sup> ion migration</td><td class="q-w">not established for TFLN by any primary source found <Badge code="U" pop="f8-li" />; not used in the model</td></tr>
          </tbody>
        </table>
      </div>
      <ul class="q-list">
        <li>The two-layer formula has one time constant. Real devices show several (Yamada 1981) and stretched behavior; the simulator adds a thin interface layer (three layers, three-pole network solved exactly) and an Arrhenius factor &sigma;<sub>i</sub>(T) = &sigma;<sub>i</sub>(T<sub>0</sub>) exp[&minus;(E<sub>a</sub>/k<sub>B</sub>)(1/T &minus; 1/T<sub>0</sub>)] with E<sub>a</sub> a template.</li>
        <li>Frequency response: H(f) = V<sub>1</sub>(f)/V(f) for the same network; the relaxation step appears between the RC corners. Holzgrafe et al. measured the enhancement band at 1-20 kHz in their devices; the figure shades it as a reported band, not a model output.</li>
        <li>Measurement: slow square wave or step bias while monitoring optical output at quadrature; low-frequency EO response by lock-in from mHz up; long-term bias-voltage logs under a control loop.</li>
        <li>Error sources: optical power during the test (photoconductivity), temperature (pyroelectric and Arrhenius), humidity and surface state for unclad devices (assumption, no source found), and bias history (hysteresis, Yeh et al. 2026).</li>
      </ul>
    </div>
  </section>
</QSection>
