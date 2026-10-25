<!-- Chapter 4.6 Pyroelectricity. Source: content/chapters/04-quirks/manuscript.md sec. 4.6, figures.md fig-04-07. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F07Pyro from "$lib/figures/quirks/F07Pyro.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f7-u": { h: "Below 25 &deg;C", body: "No p3 value below room temperature was found, so cooling steps (and cryogenic cooldowns) use the 25 &deg;C coefficient only as a placeholder; the sign rule still holds.", badges: [["u", "U"]] },
    "f7-d": { h: "Plate-model derived inputs", body: "n<sub>e</sub> = 2.1376 at 1550 nm, 21 &deg;C (Zelmon 1997 Sellmeier); dn<sub>e</sub>/dT = 3.75&times;10<sup>&minus;5</sup> /K (Jundt 1997 Sellmeier, 1550 nm, 25 &deg;C); r<sub>33</sub><sup>T</sup> = 32.2 pm/V at 633 nm (no 1550 nm value held).", badges: [["d", "derived"]] },
    "f7-t": { h: "Geometry and leakage", body: "Plate thicknesses 0.5 mm, 1 mm, 600 nm are geometry choices. Leakage conductivity: the bulk dark range 10<sup>&minus;16</sup> to 10<sup>&minus;14</sup> S/m is P-comp (Volk &amp; W&ouml;hlecke p. 60); 2.1&times;10<sup>&minus;8</sup> and 2.8&times;10<sup>&minus;6</sup> S/m are the effective values implied by the TFLN RC fits of sec. 4.7 (derived); values in between are model parameters.", badges: [["t", "template"]] },
    "p6-d": { h: "Derived pyroelectric numbers", body: "&epsilon;<sub>33</sub><sup>T</sup> = 28.7 (Warner set, Weis &amp; Gaylord Table 1); n<sub>e</sub> = 2.1376 (1550 nm); r<sub>33</sub><sup>T</sup> = 32.2 pm/V (633 nm). E = |p3|&Delta;T/(&epsilon;&epsilon;<sub>0</sub>), V = E d, &Delta;n<sub>e</sub> = &frac12;n<sub>e</sub><sup>3</sup>r<sub>33</sub>E. Linear in &Delta;T with the 25 &deg;C coefficient.", badges: [["d", "derived"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Coefficients and plate model" l3="L3 Screening, remedies, methods">
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">charge from heat</span></div>
    <div class="body">
      <p class="tx">Lithium niobate carries a built-in electric polarization along its c axis (<span class="term" data-pop="g:spontaneous-polarization">spontaneous polarization</span>), and that polarization shrinks as the crystal warms. Any temperature change therefore leaves uncompensated charge on the two faces perpendicular to c (<span class="term" data-pop="g:pyroelectric-effect">pyroelectric effect</span>). A wafer taken off a hotplate can build kilovolts across its thickness until the charge finds a path: a spark, a cracked film, a fried electrode, or dust pulled onto the surface. In thin-film devices the same charge shifts the refractive index through the Pockels effect.</p>
      <F07Pyro />
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Coefficients and plate model">
    <div class="sh"><h2 class="biref">L2 Coefficients and plate model</h2><span class="meta">p3 spread 4.0 to 9.5 &times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K)</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Conditions</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Pyroelectric coefficient p3</td><td class="q-v">&minus;4&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K)</td><td class="q-w">25 &deg;C; measured 25-450 &deg;C</td><td class="q-s"><Src id="savage1966" code="reported" /> <Src id="weis1985" loc="Eq. 2, p. 196" code="P-comp" /></td></tr>
            <tr><td>p3</td><td class="q-v">&minus;6.4&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K)</td><td class="q-w">room temperature (Bartholom&auml;us et al. 1994)</td><td class="q-s"><Src id="schwesyg2011" loc="Eq. 2.17" code="S" /></td></tr>
            <tr><td>p3</td><td class="q-v">&minus;8.3&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K)</td><td class="q-w">CLN 48.38 mol%, 25 &deg;C, data sheet</td><td class="q-s"><Src id="cti1999" code="V" /></td></tr>
            <tr><td>|p3|</td><td class="q-v">about 9.5&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K)</td><td class="q-w">congruent, interferometric</td><td class="q-s"><Src id="popescu2013" code="reported" /></td></tr>
            <tr><td>Decrease of P<sub>s</sub> from 25 to 450 &deg;C</td><td class="q-v">3.7 &micro;C/cm<sup>2</sup></td><td></td><td class="q-s"><Src id="savage1966" code="reported" /></td></tr>
            <tr><td>Spontaneous polarization P<sub>s</sub></td><td class="q-v q-w">80 &plusmn; 5 &micro;C/cm<sup>2</sup>; compilation: 71 (CLN) / 62 (near-SLN)</td><td class="q-w">room temperature; values conflict</td><td class="q-s"><Src id="gopalan1998" code="reported" /> <Src id="volk2008" loc="Table 1.1" code="P-comp" /></td></tr>
            <tr><td>Sign</td><td class="q-w">p3 &lt; 0: on cooling the +c face becomes more positive; on heating more negative</td><td></td><td class="q-s"><Src id="weis1985" loc="p. 196" code="P" /> <Src id="volk2008" loc="p. 2" code="P-comp" /></td></tr>
            <tr><td>&epsilon;<sub>33</sub><sup>T</sup></td><td class="q-v">28.7 (Warner 1967 set); spread 28.1-30</td><td class="q-w">low frequency, unclamped</td><td class="q-s"><Src id="weis1985" loc="Table 1" code="P-comp" /></td></tr>
            <tr><td>Pyroelectric field per kelvin, z-cut plate</td><td class="q-v">2.6 kV/cm per K</td><td class="q-w">homogeneous heating, unscreened; from p3 = &minus;6.4&times;10<sup>&minus;5</sup></td><td class="q-s"><Src id="schwesyg2011" loc="Eq. 5.2, p. 71" code="P" /></td></tr>
            <tr><td>Persistence</td><td class="q-w">such fields may persist for weeks if dark conductivity and surface neutralization are weak</td><td></td><td class="q-s"><Src id="schwesyg2011" loc="p. 71" code="S" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Unscreened z-cut plate, uniform temperature change &Delta;T, no free charge, no electrodes, thickness d. Sign convention: +c per IEEE Std 176-1987 (<Src id="ieee176" code="P" cite={false} />), the face that becomes negative on compression and positive on cooling.</p>
      <div class="eq"><math display="block"><mrow><msub><mi>&sigma;</mi><mi>b</mi></msub><mo>=</mo><msub><mi>p</mi><mn>3</mn></msub><mi>&Delta;</mi><mi>T</mi><mo>,</mo><mspace width="1em"/><msub><mi>E</mi><mi>pyro</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mrow><msub><mi>p</mi><mn>3</mn></msub><mi>&Delta;</mi><mi>T</mi></mrow><mrow><msub><mi>&epsilon;</mi><mn>33</mn></msub><msub><mi>&epsilon;</mi><mn>0</mn></msub></mrow></mfrac><mo>,</mo><mspace width="1em"/><mi>V</mi><mo>=</mo><msub><mi>E</mi><mi>pyro</mi></msub><mi>d</mi><mo>,</mo><mspace width="1em"/><mi>&Delta;</mi><msub><mi>n</mi><mi>e</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><msub><mi>E</mi><mi>pyro</mi></msub></mrow></math><span class="eqn">(1)</span></div>
      <h3 class="h3">Derived numbers <Badge code="derived" pop="p6-d" /></h3>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th class="r">|p3| = 4.0&times;10<sup>&minus;5</sup></th><th class="r">|p3| = 9.5&times;10<sup>&minus;5</sup></th></tr></thead>
          <tbody>
            <tr><td>E<sub>pyro</sub> per kelvin</td><td class="r q-v">1.57 kV/cm</td><td class="r q-v">3.74 kV/cm</td></tr>
            <tr><td>&Delta;n<sub>e</sub> per kelvin from E<sub>pyro</sub>, 1550 nm</td><td class="r q-v">2.5&times;10<sup>&minus;5</sup></td><td class="r q-v">5.9&times;10<sup>&minus;5</sup></td></tr>
            <tr><td>Bound charge, &Delta;T = 95 K (25 &rarr; 120 &deg;C bake)</td><td class="r q-v">0.38 &micro;C/cm<sup>2</sup></td><td class="r q-v">0.90 &micro;C/cm<sup>2</sup></td></tr>
            <tr><td>E<sub>pyro</sub>, &Delta;T = 95 K</td><td class="r q-v">15 MV/m (15 kV/mm)</td><td class="r q-v">36 MV/m (36 kV/mm)</td></tr>
            <tr><td>V across a 0.5 mm z-cut wafer, &Delta;T = 95 K</td><td class="r q-v">7.5 kV</td><td class="r q-v">17.8 kV</td></tr>
            <tr><td>V across a 600 nm z-cut film, &Delta;T = 95 K</td><td class="r q-v">9.0 V</td><td class="r q-v">21 V</td></tr>
          </tbody>
        </table>
      </div>
      <ul class="q-list">
        <li>Savage reports P<sub>s</sub> falling by 3.7 &micro;C/cm<sup>2</sup> between 25 and 450 &deg;C, an average of 8.7&times;10<sup>&minus;5</sup> C/(m<sup>2</sup> K) <Badge code="derived" pop="p6-d" />, so p3 grows with temperature and large heating steps are underestimated. No p3 value below room temperature was found; cryogenic cooldown charge is not computed.</li>
        <li>The per-kelvin index shift from an unscreened pyroelectric field (2.5 to 5.9&times;10<sup>&minus;5</sup>) is the same size as the <span class="term" data-pop="g:thermo-optic-coefficient">thermo-optic</span> dn<sub>e</sub>/dT (3.3 to 3.8&times;10<sup>&minus;5</sup> /K near 1550 nm, <a class="lk" href="/quirks/thermal-effects/">4.8</a>). Whether a device sees it depends on screening.</li>
        <li>The unscreened field after a 95 K step, 15 to 36 kV/mm, is of the order of the congruent <span class="term" data-pop="g:coercive-field">coercive field</span>, 21 kV/mm (Table 7.1 <Src id="volk2008" code="P-comp" cite={false} />). Real wafers lose charge to the air, surfaces and fixtures; the sparks and cracks in the practitioner reports of <a class="lk" href="/quirks/fabrication-pitfalls/">4.10</a> are consistent with that discharge.</li>
        <li>z-cut vs x-cut: in z-cut films the charge sits on the top and bottom faces and the field is vertical, overlapping the guided mode. In x-cut the charge sits on surfaces perpendicular to the in-plane c axis: sidewalls and chip edges (from geometry).</li>
        <li>Ti-indiffused z-cut interferometers show large pyroelectric output instabilities; z-cut directional couplers and x-cut interferometers are thermally stable; the decay of induced voltage after a temperature change suggests field-dependent LN resistivity (Bulmer et al. 1986 <Src id="bulmer1986" code="reported" cite={false} />).</li>
      </ul>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Screening, remedies, methods">
    <div class="sh"><h2 class="biref">L3 Screening, remedies, methods</h2><span class="meta">pyro-driven photorefraction</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Pyroelectric field as a photorefractive driver: the pyroelectric field acts like an applied field; photocarriers screen it in the lit region, which writes an index change even in above-threshold MgO:LN (Schwesyg Ch. 5; Volk &amp; W&ouml;hlecke p. 53 citing Schein et al. 1978). Measured: &Delta;n up to 0.8&times;10<sup>&minus;4</sup> for &Delta;T = 3 &deg;C against 1.3&times;10<sup>&minus;4</sup> predicted; screening time &tau;<sub>di</sub> = 14 s, specific photoconductivity &kappa; = 0.27 pS cm/W; no such damage in CLN in the same window because its &kappa; is more than 30&times; smaller (pp. 99-100 <Src id="schwesyg2011" code="P" cite={false} />; journal version <Src id="schwesyg2011josab" code="reported" text="not read" cite={false} />).</li>
        <li>Remedies tested or proposed there: periodic poling reduces E<sub>pyro</sub> up to 140&times; for the stated parameters, strongly dependent on duty cycle; short-circuit the z faces; flood the crystal with blue light to raise conductivity (p. 101 <Src id="schwesyg2011" code="P" cite={false} />).</li>
        <li>In TFLN: light and temperature changes leave long-lived index changes in z-cut microresonators (<Src id="ren2025" code="reported" />); an auxiliary light reduces pyroelectric effects in cryogenic waveguides (<Src id="lange2026" code="reported" />).</li>
        <li>Demonstrations of scale: a pyroelectric crystal has driven nuclear fusion (<Src id="naranjo2005" code="reported" text="reported (title)" />); heated monodomain LN emits electrons from its polar faces (<Src id="bourim2006" code="reported" text="reported (title)" />).</li>
        <li>Measurement methods and how they separate primary, secondary (piezoelectric) and thermally stimulated currents: review <Src id="jachalke2017" code="reported" />; background <Src id="lang2005" code="reported" />. The p3 spread is partly a clamping and method spread; the figure plots all four values.</li>
      </ul>
    </div>
  </section>
</QSection>
