<!-- Chapter 4.1 Light that writes itself: photorefraction. Source: content/chapters/04-quirks/manuscript.md sec. 4.1,
     figures.md fig-04-01, fig-04-02. -->
<script lang="ts">
  import type { PageData } from "./$types";
  import QSection from "$lib/figures/quirks/QSection.svelte";
  import type { Pop } from "$lib/content/pops";
  import Src from "$lib/figures/quirks/ui/Src.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import F01Slab from "$lib/figures/quirks/F01Slab.svelte";
  import F02Grating from "$lib/figures/quirks/F02Grating.svelte";

  let { data }: { data: PageData } = $props();
  const pops: Record<string, Pop> = {
    "f1-tmpl": { h: "Write-and-erase model parameters", body: "Absorption &alpha; = 10 cm<sup>&minus;1</sup> (Fe) or 0.01 cm<sup>&minus;1</sup> (others) and photoconductivity per intensity &kappa; = 10<sup>&minus;14</sup> S m/W are chosen so &sigma;<sub>ph</sub> = 10<sup>&minus;10</sup> S/m at 1 W/cm<sup>2</sup> (low end of the doped range, Volk &amp; W&ouml;hlecke p. 59) and k<sub>G</sub>&alpha;/&kappa; = 2.8&times;10<sup>6</sup> V/m (inside 10<sup>6</sup> to 10<sup>7</sup> V/m, same page). k<sub>G</sub> of undoped and near-stoichiometric LN reuses the Fe value. Beam radius and 1 mm thickness are drawing geometry. The local open-circuit formula ignores lateral currents.", badges: [["t", "template"]] },
    "f2-tmpl": { h: "Grating model parameters", body: "I<sub>0</sub> = 1 W/cm<sup>2</sup>, &kappa; = 10<sup>&minus;14</sup> S m/W, &sigma;<sub>d</sub> = 10<sup>&minus;15</sup> S/m, &alpha; = 10 cm<sup>&minus;1</sup>: display values. Photovoltaic weight 1 = k<sub>G</sub> of LiNbO<sub>3</sub>:Fe (P-comp). Steady state of charge conservation with the short-circuit condition mean(E) = 0, solved in closed form on 256 points over two periods.", badges: [["t", "template"]] },
    "dn-sat": { h: "&Delta;n<sub>e</sub> at the saturated field", body: "&frac12; n<sub>e</sub><sup>3</sup> r<sub>33</sub> E with n<sub>e</sub> = 2.2028 (632.8 nm) and r<sub>33</sub><sup>T</sup> = 32.2 pm/V, Weis &amp; Gaylord 1985 Tables 2 and 4: <span class='v'>1.7&times;10<sup>&minus;4</sup></span> at 10<sup>6</sup> V/m, <span class='v'>1.7&times;10<sup>&minus;3</sup></span> at 10<sup>7</sup> V/m.", badges: [["d", "derived"]] },
    "tau-d": { h: "Dielectric relaxation time", body: "&epsilon;<sub>33</sub>&epsilon;<sub>0</sub>/&sigma; with &epsilon;<sub>33</sub> = 28 (rounded lower bound of the 28.1 to 30 spread). Dark: &sigma;<sub>d</sub> = 10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m gives <span class='v'>2.5&times;10<sup>4</sup> s (6.9 h) to 2.5&times;10<sup>6</sup> s (29 d)</span>. Light: &sigma;<sub>ph</sub> = 10<sup>&minus;9</sup> to 10<sup>&minus;10</sup> S/m gives <span class='v'>0.25 s to 2.5 s</span>.", badges: [["d", "derived"]] },
    "edif": { h: "Diffusion field per unit modulation", body: "(k<sub>B</sub>T/e)(2&pi;/&Lambda;) at T = 295 K, &Lambda; = 1 &micro;m: <span class='v'>1.6&times;10<sup>5</sup> V/m</span> (1.6 kV/cm); Volk &amp; W&ouml;hlecke p. 58 quote about 1.5 kV/cm.", badges: [["d", "derived"]] },
  };
</script>

<QSection {data} {pops} l2="L2 Charge transport" l3="L3 Mechanism and measurement">
  <!-- ================= L1 ================= -->
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">optical damage, 1966</span></div>
    <div class="body">
      <p class="tx">A beam of visible light passing through lithium niobate leaves behind a change in refractive index that outlasts the beam. Light frees electrons from impurity and defect sites; the crystal's polar structure pushes them along the c axis without an applied voltage (the <span class="term" data-pop="g:bulk-photovoltaic-effect">bulk photovoltaic effect</span>); they are trapped again in the dark edges of the beam. The separated charge sets up a <span class="term" data-pop="g:space-charge-field">space-charge field</span>, and the <span class="term" data-pop="g:pockels-effect">Pockels effect</span> turns that field into an index change.</p>
      <p class="tx">It was first called <span class="term" data-pop="g:photorefraction">optical damage</span> (Ashkin et al. 1966 <Src id="ashkin1966" code="reported" text="reported (title)" cite={false} />): a focused laser beam is distorted and scattered by its own track. It is reversible; uniform light or heat erases it.</p>
      <F01Slab />
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Conditions</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Lowest intensity at which photorefraction is observed</td><td class="q-v">10 mW/cm<sup>2</sup></td><td class="q-w">blue-green light, LiNbO<sub>3</sub>:Fe; no intensity threshold</td><td class="q-s"><Src id="volk2008" loc="p. 52" code="P-comp" /></td></tr>
            <tr><td>Extraordinary index decrease</td><td class="q-v">up to 10<sup>&minus;3</sup></td><td class="q-w">focused Ar<sup>+</sup> laser, 488 nm, 20 mW; ordinary change much smaller</td><td class="q-s"><Src id="chen1969" code="reported" /></td></tr>
            <tr><td>Bulk photovoltaic saturation voltage</td><td class="q-v">&gt; 1000 V (about 10<sup>5</sup> V/cm)</td><td class="q-w">doped LiNbO<sub>3</sub></td><td class="q-s"><Src id="glass1974" code="reported" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Charge transport">
    <div class="sh"><h2 class="biref">L2 Charge transport</h2><span class="meta">Volk &amp; W&ouml;hlecke Eqs. 3.2-3.19; Schwesyg Eqs. 2.23-2.25</span></div>
    <div class="body">
      <p class="tx">Three currents (Volk &amp; W&ouml;hlecke Eq. 3.2, p. 52; Schwesyg Eq. 2.23 <Src id="volk2008" code="P-comp" cite={false} />): the bulk photovoltaic (Glass) current, diffusion of conduction-band electrons, and drift in the total conductivity.</p>
      <div class="eq"><math display="block"><mrow><mi mathvariant="bold">j</mi><mo>=</mo><msub><mi mathvariant="bold">j</mi><mi>pv</mi></msub><mo>+</mo><msub><mi mathvariant="bold">j</mi><mi>diff</mi></msub><mo>+</mo><msub><mi mathvariant="bold">j</mi><mi>drift</mi></msub><mo>,</mo><mspace width="1em"/><msub><mi>j</mi><mrow><mi>pv</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><msub><mi>&beta;</mi><mrow><mi>i</mi><mi>j</mi><mi>k</mi></mrow></msub><msub><mi>e</mi><mi>j</mi></msub><msub><mi>e</mi><mi>k</mi></msub><mi>I</mi><mo>,</mo><mspace width="1em"/><msub><mi mathvariant="bold">j</mi><mi>diff</mi></msub><mo>=</mo><msub><mi>k</mi><mi>B</mi></msub><mi>T</mi><msub><mi>&mu;</mi><mi>e</mi></msub><mo>&nabla;</mo><msub><mi>n</mi><mi>e</mi></msub><mo>,</mo><mspace width="1em"/><msub><mi mathvariant="bold">j</mi><mi>drift</mi></msub><mo>=</mo><mo>(</mo><msub><mi>&sigma;</mi><mi>d</mi></msub><mo>+</mo><mi>&kappa;</mi><mi>I</mi><mo>)</mo><mi mathvariant="bold">E</mi></mrow></math><span class="eqn">(1)</span></div>
      <ul class="q-list">
        <li>For point group 3m the symmetric <span class="term" data-pop="g:photovoltaic-tensor">photovoltaic tensor</span> has the pattern of the piezoelectric d tensor: nonzero &beta;<sub>311</sub> = &beta;<sub>322</sub>, &beta;<sub>333</sub>, &beta;<sub>222</sub> = &minus;&beta;<sub>112</sub> = &minus;&beta;<sub>121</sub> = &minus;&beta;<sub>211</sub>, &beta;<sub>113</sub> = &beta;<sub>223</sub> (p. 53 <Src id="volk2008" code="P-comp" cite={false} />). &beta;<sub>113</sub> drives a current that oscillates along the beam; its coherence length (half period) is l<sub>c</sub> = &lambda; / (2|n<sub>e</sub> &minus; n<sub>o</sub>|), about 5&lambda; in LN, and the full period &lambda;/|n<sub>e</sub> &minus; n<sub>o</sub>| about 11&lambda;; it matters only when the lit region is that small, as in waveguides.</li>
        <li>Scalar form: j<sub>pv</sub> = k<sub>G</sub>&alpha;I with k<sub>G</sub> the <span class="term" data-pop="g:glass-constant">Glass constant</span> (Eq. 3.5).</li>
        <li>Open circuit, steady state: drift cancels the photovoltaic current. Once &sigma;<sub>ph</sub> = &kappa;I &gg; &sigma;<sub>d</sub>, the field no longer depends on intensity.</li>
      </ul>
      <div class="eq"><math display="block"><mrow><msub><mi>E</mi><mi>pv</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>k</mi><mi>G</mi></msub><mi>&alpha;</mi><mi>I</mi></mrow><mrow><msub><mi>&sigma;</mi><mi>ph</mi></msub><mo>+</mo><msub><mi>&sigma;</mi><mi>d</mi></msub></mrow></mfrac><mo>,</mo><mspace width="1.2em"/><mi>E</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>&minus;</mo><msub><mi>E</mi><mi>sat</mi></msub><mo>[</mo><mn>1</mn><mo>&minus;</mo><msup><mi>e</mi><mrow><mo>&minus;</mo><mi>t</mi><mo>/</mo><mi>&tau;</mi></mrow></msup><mo>]</mo><mo>,</mo><mspace width="1.2em"/><mi>E</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><msub><mi>E</mi><mi>sat</mi></msub><msup><mi>e</mi><mrow><mo>&minus;</mo><mi>t</mi><mo>/</mo><mi>&tau;</mi></mrow></msup><mo>,</mo><mspace width="1.2em"/><mi>&tau;</mi><mo>=</mo><mfrac><mrow><mi>&epsilon;</mi><msub><mi>&epsilon;</mi><mn>0</mn></msub></mrow><mrow><msub><mi>&sigma;</mi><mi>ph</mi></msub><mo>+</mo><msub><mi>&sigma;</mi><mi>d</mi></msub></mrow></mfrac></mrow></math><span class="eqn">(2)</span></div>
      <p class="tx">Writing (open circuit) and erasure (uniform light or dark) follow Eqs. 3.18-3.19 (p. 57). The <span class="term" data-pop="g:dielectric-relaxation-time">dielectric relaxation time</span> &tau; sets both. Index change through the linear electro-optic effect (Schwesyg Eq. 2.25 <Src id="schwesyg2011" code="P-comp" cite={false} />):</p>
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><msub><mi>n</mi><mi>e</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><msub><mi>E</mi><mi>z</mi></msub><mo>,</mo><mspace width="1.2em"/><mi>&Delta;</mi><msub><mi>n</mi><mi>o</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>o</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>13</mn></msub><msub><mi>E</mi><mi>z</mi></msub></mrow></math><span class="eqn">(3)</span></div>
      <p class="tx">r<sub>33</sub> is about 3 r<sub>13</sub>, so extraordinary light sees about three times the change (Schwesyg p. 19). The lit region shows a decrease of n<sub>e</sub> (Chen 1969 <Src id="chen1969" code="reported" cite={false} />); the figures plot |E| and &Delta;n<sub>e</sub> &lt; 0, since Volk &amp; W&ouml;hlecke and Schwesyg do not give the sign of j<sub>pv</sub> relative to +c.</p>
      <p class="tx">A fringe pattern with modulation m and wave number K gives a diffusion field (monopolar electrons, Eq. 3.9) that is independent of intensity and shifted a quarter period from the fringes; the photovoltaic field is in phase with them (pp. 54-55):</p>
      <div class="eq"><math display="block"><mrow><msub><mi>E</mi><mi>dif</mi></msub><mo>(</mo><mi>z</mi><mo>)</mo><mo>=</mo><mfrac><mrow><msub><mi>k</mi><mi>B</mi></msub><mi>T</mi></mrow><mi>e</mi></mfrac><mfrac><mrow><mi>K</mi><mi>m</mi><mi>sin</mi><mi>K</mi><mi>z</mi></mrow><mrow><mn>1</mn><mo>+</mo><mi>m</mi><mi>cos</mi><mi>K</mi><mi>z</mi></mrow></mfrac></mrow></math><span class="eqn">(4)</span></div>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Conditions</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Glass constant k<sub>G</sub>, LiNbO<sub>3</sub>:Fe</td><td class="q-v">2.8&times;10<sup>&minus;9</sup> cm/V</td><td></td><td class="q-s"><Src id="volk2008" loc="p. 59" code="P-comp" /></td></tr>
            <tr><td>Glass constant k<sub>G</sub>, LiNbO<sub>3</sub>:Cu</td><td class="q-v">5.5&times;10<sup>&minus;10</sup> cm/V</td><td></td><td class="q-s"><Src id="volk2008" loc="p. 59" code="P-comp" /></td></tr>
            <tr><td>Photoconductivity, as-grown doped crystals</td><td class="q-v">10<sup>&minus;9</sup> to 10<sup>&minus;10</sup> S/m</td><td class="q-w">moderate intensity (10<sup>&minus;11</sup> to 10<sup>&minus;12</sup> &Omega;<sup>&minus;1</sup>cm<sup>&minus;1</sup>)</td><td class="q-s"><Src id="volk2008" loc="p. 59" code="P-comp" /></td></tr>
            <tr><td>Saturated photovoltaic field</td><td class="q-v">10<sup>6</sup> to 10<sup>7</sup> V/m</td><td class="q-w">LiNbO<sub>3</sub>:Fe, LiNbO<sub>3</sub>:Cu (10<sup>4</sup> to 10<sup>5</sup> V/cm)</td><td class="q-s"><Src id="volk2008" loc="p. 59" code="P-comp" /></td></tr>
            <tr><td>Diffusion field amplitude</td><td class="q-v">about 1.5&times;10<sup>5</sup> V/m</td><td class="q-w">grating period about 1 &micro;m</td><td class="q-s"><Src id="volk2008" loc="p. 58" code="P-comp" /></td></tr>
            <tr><td><span class="term" data-pop="g:dark-conductivity">Dark conductivity</span>, undoped or lightly doped CLN</td><td class="q-v">10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m</td><td class="q-w">room temperature, extrapolated from high temperature</td><td class="q-s"><Src id="volk2008" loc="p. 60" code="P-comp" /></td></tr>
            <tr><td>Dark storage time of gratings, low-doped LiNbO<sub>3</sub>:Fe</td><td class="q-v">up to about 1 year</td><td class="q-w">hours or seconds at high Fe content</td><td class="q-s"><Src id="volk2008" loc="p. 60" code="P-comp" /></td></tr>
            <tr><td>Electron Hall mobility</td><td class="q-v">about 0.8 cm<sup>2</sup>/(V s)</td><td class="q-w">strongly reduced LiNbO<sub>3</sub>, photo-Hall, room temperature</td><td class="q-s"><Src id="volk2008" loc="p. 59" code="P-comp" /></td></tr>
            <tr><td>Sensitivity S&prime;<sub>1</sub>, LiNbO<sub>3</sub>:Fe</td><td class="q-v">0.01-0.1 cm/J; 0.05-0.3 cm/J</td><td class="q-w">633 nm; 488 nm</td><td class="q-s"><Src id="volk2008" loc="p. 57" code="P-comp" /></td></tr>
          </tbody>
        </table>
      </div>
      <h3 class="h3">Derived numbers</h3>
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Quantity</th><th>Value</th><th>Formula and inputs</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>&Delta;n<sub>e</sub> at the saturated photovoltaic field</td><td class="q-v">1.7&times;10<sup>&minus;4</sup> to 1.7&times;10<sup>&minus;3</sup></td><td class="q-w">&frac12; n<sub>e</sub><sup>3</sup> r<sub>33</sub> E; n<sub>e</sub> = 2.2028 at 632.8 nm, r<sub>33</sub><sup>T</sup> = 32.2 pm/V (Weis &amp; Gaylord Tables 2, 4); E = 10<sup>6</sup> to 10<sup>7</sup> V/m</td><td class="q-s"><Badge code="derived" pop="dn-sat" /></td></tr>
            <tr><td>Dielectric relaxation time, dark</td><td class="q-v">6.9 h to 29 d</td><td class="q-w">&epsilon;&epsilon;<sub>0</sub>/&sigma;<sub>d</sub>; &epsilon;<sub>33</sub> = 28; &sigma;<sub>d</sub> = 10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m</td><td class="q-s"><Badge code="derived" pop="tau-d" /></td></tr>
            <tr><td>Dielectric relaxation time, light</td><td class="q-v">0.25 s to 2.5 s</td><td class="q-w">&epsilon;<sub>33</sub> = 28; &sigma;<sub>ph</sub> = 10<sup>&minus;9</sup> to 10<sup>&minus;10</sup> S/m</td><td class="q-s"><Badge code="derived" pop="tau-d" /></td></tr>
            <tr><td>Diffusion field per unit modulation, 1 &micro;m fringes</td><td class="q-v">1.6&times;10<sup>5</sup> V/m</td><td class="q-w">(k<sub>B</sub>T/e)(2&pi;/&Lambda;), T = 295 K; agrees with p. 58</td><td class="q-s"><Badge code="derived" pop="edif" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="q-flag"><b>Conflict.</b> The computed dark relaxation times (6.9 h to 29 d) disagree with the 5 to 500 days printed on p. 159 of the same compilation for the same conductivity range; the upper &Delta;n<sub>e</sub> bound matches the 10<sup>&minus;3</sup> reported by Chen 1969.</p>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Mechanism and measurement">
    <div class="sh"><h2 class="biref">L3 Mechanism and measurement</h2><span class="meta">dark conduction, transport schemes, holography</span></div>
    <div class="body">
      <ul class="q-list">
        <li>Dark conductivity in undoped LN is protonic: one activation energy of about 1.1 eV covers 200 to 1000 &deg;C and the conductivity scales with hydrogen concentration; Li<sup>+</sup> transport has an activation energy near 0.4 eV, which does not match the measured conductivity (pp. 59-60 <Src id="volk2008" code="P-comp" cite={false} />). At 0.2 to 0.25% Fe the activation energy drops to 0.3 to 0.4 eV and electron tunneling between Fe sites takes over (pp. 60-61).</li>
        <li>Mixed proton-electron dark conduction gives stretched-exponential decay, &delta;&Delta;n &prop; exp[&minus;(t/&tau;)<sup>&beta;</sup>]; purely ionic conduction gives a single exponential (p. 61). The write-and-erase figure uses a single exponential.</li>
        <li>Transport schemes: the one-center model (Fe<sup>2+</sup> donor, Fe<sup>3+</sup> trap) fails to fit several data sets; the two-center model adds the Nb antisite (<span class="term" data-pop="g:antisite-nb-li">Nb<sub>Li</sub></span>) as a shallow electron trap (Sec. 3.2.2-3.2.3, pp. 62-73). n-type photoconductivity is confirmed only for congruent LN doped with Fe and Cu (p. 59).</li>
        <li>Full band-transport model: Kukhtarev et al. <Src id="kukhtarev1978" code="reported" text="reported (title)" cite={false} /> (Crossref issue date 1978, often cited as 1979). The figures use the reduced single-time-constant form and a 1D grating solver.</li>
        <li>Measurement: two-beam holographic recording with diffraction efficiency &eta; = exp(&minus;&alpha;L/cos &theta;) sin<sup>2</sup>(&pi;&Delta;nL/(&lambda; cos &theta;)) (Eq. 3.11); light-induced birefringence between crossed polarizers; beam distortion and far-field scattering (fanning). In waveguides and resonators: resonance shift versus power and time (<a class="lk" href="/quirks/thin-film-photorefraction/">4.3</a>).</li>
        <li>Error sources: dark and photoconductivity vary by orders of magnitude between samples, so absolute write and erase times are crystal-specific.</li>
      </ul>
      <F02Grating />
      <h3 class="h3">Dated steps</h3>
      <div class="scrollx">
        <table class="log">
          <thead><tr><th>Year</th><th>Step</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>1966</td><td class="e">optical damage reported in LiNbO<sub>3</sub> and LiTaO<sub>3</sub></td><td><Src id="ashkin1966" code="reported" text="reported (title)" /></td></tr>
            <tr><td>1967</td><td class="e">annealing in an electric field made LiTaO<sub>3</sub> resistant up to 500 W/cm<sup>2</sup>; helped LN less</td><td><Src id="levinstein1967" code="reported" /></td></tr>
            <tr><td>1968</td><td class="e">holograms written into LN and erased thermally</td><td><Src id="chen1968" code="reported" /></td></tr>
            <tr><td>1969</td><td class="e">charge-drift model of the index change</td><td><Src id="chen1969" code="reported" /></td></tr>
            <tr><td>1974</td><td class="e">bulk photovoltaic current as the driver</td><td><Src id="glass1974" code="reported" /></td></tr>
            <tr><td>1980, 1984</td><td class="e">MgO doping: conference abstract, then journal report (<a class="lk" href="/quirks/mgo-doping/">4.2</a>)</td><td><Src id="zhong1980" code="S" /> <Src id="bryan1984" code="reported" /></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</QSection>
