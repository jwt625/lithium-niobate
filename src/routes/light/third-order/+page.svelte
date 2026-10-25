<!-- Chapter 2.5 Third-order effects (manuscript content/chapters/02-light/manuscript.md sec. 2.5): L1 n2 and Kerr combs,
     Kerr vs cascaded chi(2) figure; L2 gamma, eq. 2.16 with its RK4 check, the LLE (eq. 2.17) and the soliton comb
     simulator (worker); L3 conventions, n2 data, normalization and numerics. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/third-order.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { F25_POPS } from "$lib/figures/light/f25-pops";
  import { mountKerr, TX } from "$lib/figures/light/f25-kerr";
  import { mountLLE } from "$lib/figures/light/f25-lle-run";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  usePops(F25_POPS);
  usePops(data.content.pops);
  const K = $derived(data.init.k);
  const L = $derived(data.init.l);
  const W = $derived(data.work);
  const tx = TX.toFixed(4);

  let first: HTMLElement;
  onMount(() => {
    const root = first.closest("main") as HTMLElement;
    const offs = [mountKerr(root), mountLLE(root), installRangeFill(), whenVisual(() => ({ repaint: () => undefined }))];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("third-order")} title="2.5 Third-order effects"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Conventions and error sources" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={first}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">n<sub>2</sub>, Kerr combs, cascaded &chi;<sup>(2)</sup></span></div>
    <div class="body">
      <p class="tx">The index also rises with intensity, the <span class="term" data-pop="g:kerr-effect">optical Kerr effect</span>:</p>
      <div class="eq c25-eq"><math display="block"><mrow><mi>n</mi><mo>=</mo><msub><mi>n</mi><mn>0</mn></msub><mo>+</mo><msub><mi>n</mi><mn>2</mn></msub><mi>I</mi></mrow></math></div>
      <p class="tx">For LN, <i>n</i><sub>2</sub> = 9.33&times;10<sup>&minus;20</sup> m<sup>2</sup>/W at 1064 nm (Z-scan, 30 ps pulses, e-polarized) <Badge code="P-db" pop="r:desalvo1996" />, transcribed in <span class="term" data-pop="r:rii2024">refractiveindex.info</span>. The widely tabulated 1.8&times;10<sup>&minus;19</sup> m<sup>2</sup>/W <Badge code="S" pop="r:zhu2021" /> is {W.n2r} times that <Badge code="derived" pop="d25-ratio" /> and has no traced primary.</p>
      <p class="tx">In a high-Q ring, four-wave mixing builds a <span class="term" data-pop="g:kerr-frequency-comb">Kerr frequency comb</span>, and in the right detuning range a dissipative soliton. TFLN rings have produced self-starting solitons (<span class="term" data-pop="r:he2019">He et al. 2019</span>), combs spanning 4/5 of an octave at 335 GHz spacing with <span class="term" data-pop="g:stimulated-raman-scattering">stimulated Raman scattering</span> suppressed <Badge code="reported" pop="r:gong2020" />, full-octave solitons with near-unity device yield <Badge code="reported" pop="r:song2024" />, and a photorefraction-stabilized soliton running for more than 13 h without feedback <Badge code="reported" pop="r:wan2024" />. One chip has generated a Kerr comb, selected a line with an electro-optic filter and modulated it <Badge code="reported" pop="r:wang2019nc" />.</p>
      <p class="tx">A phase-mismatched &chi;<sup>(2)</sup> process imitates a Kerr effect whose size and sign the designer chooses: <span class="term" data-pop="g:cascaded-chi-2">cascaded &chi;<sup>(2)</sup></span>. Drag the mismatch &Delta;k through zero: the cascaded phase grows as 1/&Delta;k, flips sign and decays, while the Kerr phase stays fixed.</p>

      <!-- Kerr vs cascaded, TECH -->
      <div class="panel c25-k lt-fig" id="kerr" data-variant="tech" data-pair="kerr">
        <div class="ph"><span>Kerr vs cascaded &chi;<sup>(2)</sup>, 1550 nm</span><span>eq. (2.16), RK4</span></div>
        <div class="ctl"><label for="k-dk">Mismatch &Delta;k</label><input id="k-dk" type="range" min={-tx} max={tx} step="any" value={K.sDk}><output id="k-dk-o" for="k-dk">{K.dk}</output></div>
        <div class="ctl"><label for="k-p">Power P</label><input id="k-p" type="range" min="0" max="1000" step="any" value={K.sP}><output id="k-p-o" for="k-p">{K.p}</output></div>
        <div class="ctl"><label for="k-l">Length L</label><input id="k-l" type="range" min="0" max="1000" step="any" value={K.sL}><output id="k-l-o" for="k-l">{K.l}</output></div>
        <div class="ctl"><label for="k-eta"><span class="term" data-pop="g:normalized-conversion-efficiency">&eta;<sub>norm</sub></span></label><input id="k-eta" type="range" min="0" max="1000" step="any" value={K.sEta}><output id="k-eta-o" for="k-eta">{K.eta}</output></div>
        <div class="ctl"><label for="k-aeff"><span class="term" data-pop="g:effective-area">A<sub>eff</sub></span></label><input id="k-aeff" type="range" min="0" max="1000" step="any" value={K.sAeff}><output id="k-aeff-o" for="k-aeff">{K.aeff}</output></div>
        <div class="ctl seg2"><span class="k">n<sub>2</sub> source</span><div class="seg" id="k-n2" role="group" aria-label="n2 source"><button type="button" data-v="desalvo" class="on" aria-pressed="true">DeSalvo 1996, 1064 nm</button><button type="button" data-v="zhu" aria-pressed="false">Zhu 2021 table</button></div></div>
        <div class="lt-split">
          <div class="plotbox">
            <svg class="lp" id="k-plot" viewBox="0 0 520 300" role="img" aria-label="Nonlinear phase versus phase mismatch on symmetric log axes: Kerr phase constant, cascaded phase odd in the mismatch">{@html K.plot}</svg>
          </div>
          <div><table class="ro c25-ro" id="k-ro">{@html K.table}</table></div>
        </div>
        <div class="lgd"><span><span class="k"></span>eq. (2.16)</span><span><span class="k s2"></span>Kerr &gamma;PL</span><span>&#9675; RK4, coupled equations</span><span>&#9632; RK4 at the cursor</span><span>dashed vertical: cursor</span></div>
        <div class="pf">
          <span>&eta;<sub>norm</sub> 2600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:wang2018optica" /></span>
          <span>P, L, &Delta;k defaults <Badge code="template" pop="t25-design" /></span>
          <span>A<sub>eff</sub> 1 &micro;m<sup>2</sup> <Badge code="template" pop="t25-aeff" /></span>
          <span>n<sub>2</sub> 9.33&times;10<sup>&minus;20</sup> m<sup>2</sup>/W <Badge code="P-db" pop="r:desalvo1996" /></span>
          <span>1.8&times;10<sup>&minus;19</sup> m<sup>2</sup>/W <Badge code="S" pop="r:zhu2021" /></span>
        </div>
      </div>

      <!-- Kerr vs cascaded, VISUAL -->
      <div class="c25-vwrap" data-variant="visual" data-pair="kerr">
        <div class="v-inst">
          <div class="v-stage"><svg id="vk-stage" viewBox="0 0 1000 530" role="img" aria-label="Top view of an LN waveguide: a 1550 nm beam narrows or widens with the sign of the net nonlinear phase; below, the 775 nm harmonic oscillating along the guide and bars of the Kerr and cascaded phases">{@html K.stage}</svg></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:13ch"><label for="vk-dk">Phase mismatch &Delta;k</label><output id="vk-dk-o" for="vk-dk">{K.dk}</output><input id="vk-dk" type="range" min={-tx} max={tx} step="any" value={K.sDk}></div>
            <div class="v-ctl" style="--w:9ch"><label for="vk-p">Power P</label><output id="vk-p-o" for="vk-p">{K.p}</output><input id="vk-p" type="range" min="0" max="1000" step="any" value={K.sP}></div>
            <div class="v-ctl" style="--w:9ch"><label for="vk-l">Length L</label><output id="vk-l-o" for="vk-l">{K.l}</output><input id="vk-l" type="range" min="0" max="1000" step="any" value={K.sL}></div>
            <div class="v-ctl"><span class="v-lab">n<sub>2</sub> source</span><div class="v-seg" id="vk-n2" role="group" aria-label="n2 source"><button type="button" data-v="desalvo" class="on" aria-pressed="true">DeSalvo 1996</button><button type="button" data-v="zhu" aria-pressed="false">Zhu 2021</button></div></div>
            <dl class="v-hud">
              <dt>Kerr phase &gamma;PL</dt><dd data-vk="phiK">{K.ro.phiK}</dd>
              <dt>Cascaded phase</dt><dd data-vk="phiC">{K.ro.phiC}</dd>
              <dt>Net phase</dt><dd data-vk="net">{K.ro.net}</dd>
              <dt>Cascaded / Kerr</dt><dd data-vk="ratio">{K.ro.ratio}</dd>
              <dt>Net nonlinearity</dt><dd data-vk="sgnN">{K.ro.sgnN}</dd>
              <dt>Harmonic fraction, z-average</dt><dd data-vk="sh">{K.ro.sh}</dd>
            </dl>
            <p class="v-cap">Positive phase raises the index and narrows the beam; &Delta;k &gt; 0 pushes the fundamental down. <Badge code="derived" pop="v25-kdraw" text="drawing" /></p>
          </div>
        </div>
        <div class="v-prov">
          <span>&eta;<sub>norm</sub> 2600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:wang2018optica" /></span>
          <span>P, L, &Delta;k defaults <Badge code="template" pop="t25-design" /></span>
          <span>A<sub>eff</sub> 1 &micro;m<sup>2</sup> <Badge code="template" pop="t25-aeff" /></span>
          <span>n<sub>2</sub> <Badge code="P-db" pop="r:desalvo1996" /> <Badge code="S" pop="r:zhu2021" /></span>
          <span>1550 nm: <span class="term" data-pop="v-false">false color</span>, dashed; 775 nm: spectral color</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">&gamma;, eq. (2.16), Lugiato-Lefever</span></div>
    <div class="body">
      <h3 class="h3">Kerr</h3>
      <div class="eq c25-eq"><math display="block"><mrow><mi>&gamma;</mi><mo>=</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi><msub><mi>n</mi><mn>2</mn></msub></mrow><mrow><mi>&lambda;</mi><msub><mi>A</mi><mi>eff</mi></msub></mrow></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><mi>&Delta;</mi><msub><mi>&phi;</mi><mi>Kerr</mi></msub><mo>=</mo><mi>&gamma;</mi><mi>P</mi><mi>L</mi></mrow></math></div>
      <p class="tx">The <span class="term" data-pop="g:nonlinear-parameter">nonlinear parameter</span> at 1550 nm with A<sub>eff</sub> = 1 &micro;m<sup>2</sup> <Badge code="template" pop="t25-aeff" /> is &gamma;<sub>Kerr</sub> = {W.gK} /(W m) <Badge code="derived" pop="d25-kerr" />, using <i>n</i><sub>2</sub> = 9.33&times;10<sup>&minus;20</sup> m<sup>2</sup>/W measured at 1064 nm; the dispersion of <i>n</i><sub>2</sub> to 1550 nm is not sourced.</p>

      <h3 class="h3">Cascaded &chi;<sup>(2)</sup></h3>
      <p class="tx">For |&Delta;k|L &gt;&gt; 1 the coupled equations of 2.3 L3 give a fundamental-wave phase</p>
      <div class="eq c25-eq"><math display="block"><mrow><mi>&Delta;</mi><msub><mi>&phi;</mi><mi>NL</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mrow><msub><mi>&eta;</mi><mi>norm</mi></msub><mi>P</mi><mi>L</mi></mrow><mrow><mi>&Delta;</mi><mi>k</mi></mrow></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><msub><mi>&gamma;</mi><mi>casc</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><msub><mi>&eta;</mi><mi>norm</mi></msub><mrow><mi>&Delta;</mi><mi>k</mi></mrow></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><mi>&Delta;</mi><mi>k</mi><mo>=</mo><msub><mi>k</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><mo>&minus;</mo><mn>2</mn><msub><mi>k</mi><mi>&omega;</mi></msub><mo>&minus;</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi></mrow><mi>&Lambda;</mi></mfrac></mrow></math><span class="eqn">(2.16)</span></div>
      <p class="tx">&Delta;&phi;<sub>NL</sub> carries the sign of a Kerr phase &gamma;PL (positive = index increase); in the field convention of 2.3 L3, arg A<sub>&omega;</sub> = &minus;&Delta;&phi;<sub>NL</sub>. The fundamental couples to a second harmonic detuned above it (&Delta;k &gt; 0) and is pushed down: a negative, self-defocusing nonlinearity. &Delta;k &lt; 0 gives self-focusing (principle: <span class="term" data-pop="r:desalvo1992">DeSalvo et al. 1992</span>; sign from the level-repulsion picture <Badge code="derived" pop="d25-casc" />). Along z the undepleted harmonic carries</p>
      <div class="eq c25-eq"><math display="block"><mrow><mfrac><msup><mrow><mo>|</mo><msub><mi>A</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><mo>|</mo></mrow><mn>2</mn></msup><mi>P</mi></mfrac><mo>=</mo><mfrac><mrow><mn>4</mn><msub><mi>&eta;</mi><mi>norm</mi></msub><mi>P</mi><msup><mi>sin</mi><mn>2</mn></msup><mo>(</mo><mi>&Delta;</mi><mi>k</mi><mi>z</mi><mo>/</mo><mn>2</mn><mo>)</mo></mrow><mrow><mi>&Delta;</mi><msup><mi>k</mi><mn>2</mn></msup></mrow></mfrac></mrow></math></div>
      <div class="scrollx">
        <table class="idx c25-work">
          <thead><tr><th>Worked example</th><th class="r">Value</th><th>Note</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td>&eta;<sub>norm</sub></td><td class="num">2.6&times;10<sup>5</sup> /(W m<sup>2</sup>)</td><td>2600 %/W/cm<sup>2</sup>, TFLN PPLN</td><td class="r b0"><Badge code="reported" pop="r:wang2018optica" /></td></tr>
            <tr><td>P, L, &Delta;k</td><td class="num">0.1 W, 1 cm, 2&pi;/(100 &micro;m)</td><td>design point</td><td class="r b0"><Badge code="template" pop="t25-design" /></td></tr>
            <tr><td>&Delta;&phi;<sub>NL</sub>, eq. (2.16)</td><td class="num">{@html W.phiC} rad</td><td>self-defocusing</td><td class="r b0"><Badge code="derived" pop="d25-casc" /></td></tr>
            <tr><td>arg A<sub>&omega;</sub>, RK4</td><td class="num">+{@html W.argA} rad</td><td>&Delta;&phi;<sub>NL</sub> = &minus;arg A<sub>&omega;</sub></td><td class="r b0"><Badge code="derived" pop="d25-rk4" /></td></tr>
            <tr><td>|&gamma;<sub>casc</sub>|</td><td class="num">{W.gC} /(W m)</td><td>{W.ratio} &times; &gamma;<sub>Kerr</sub> = {W.gK} /(W m)</td><td class="r b0"><Badge code="derived" pop="d25-casc" /></td></tr>
            <tr><td>harmonic fraction</td><td class="num">{@html W.shAvg}</td><td>z-average; peak {@html W.shPk}</td><td class="r b0"><Badge code="derived" pop="d25-sh" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">The cascaded nonlinearity is {W.ratio} times the Kerr one while on average only {@html W.shAvg} of the power sits in the harmonic. In nanophotonic PPLN, strong phase mismatch broadens both harmonics with 2 pJ pulses <Badge code="reported" pop="r:jankowski2020" />.</p>

      <h3 class="h3"><span class="term" data-pop="g:lugiato-lefever-equation">Lugiato-Lefever equation</span></h3>
      <p class="tx">Normalized (<span class="term" data-pop="r:lugiato1987">Lugiato &amp; Lefever 1987</span>; <span class="term" data-pop="r:chembo2013">Chembo &amp; Menyuk 2013</span>; <span class="term" data-pop="r:coen2013">Coen et al. 2013</span>):</p>
      <div class="eq c25-eq"><math display="block"><mrow><mfrac><mrow><mi>&part;</mi><mi>&psi;</mi></mrow><mrow><mi>&part;</mi><mi>t</mi></mrow></mfrac><mo>=</mo><mo>&minus;</mo><mo>(</mo><mn>1</mn><mo>+</mo><mi>i</mi><mi>&zeta;</mi><mo>)</mo><mi>&psi;</mi><mo>+</mo><mi>i</mi><msup><mrow><mo>|</mo><mi>&psi;</mi><mo>|</mo></mrow><mn>2</mn></msup><mi>&psi;</mi><mo>+</mo><mi>i</mi><mfrac><msub><mi>d</mi><mn>2</mn></msub><mn>2</mn></mfrac><mfrac><mrow><msup><mi>&part;</mi><mn>2</mn></msup><mi>&psi;</mi></mrow><mrow><mi>&part;</mi><msup><mi>&theta;</mi><mn>2</mn></msup></mrow></mfrac><mo>+</mo><mi>f</mi></mrow></math><span class="eqn">(2.17)</span></div>
      <p class="tx">&zeta; = 2(&omega;<sub>0</sub> &minus; &omega;<sub>p</sub>)/&kappa; is the detuning, <i>f</i> the normalized pump, <i>d</i><sub>2</sub> the normalized second-order dispersion (anomalous: <i>d</i><sub>2</sub> &gt; 0 here), &theta; the angle around the ring. Solitons exist on the red-detuned side above the bistability threshold; scanning the laser from blue to red crosses chaotic modulation instability into discrete <span class="term" data-pop="g:soliton-step">soliton steps</span> (<span class="term" data-pop="r:herr2014">Herr et al. 2014</span>; review <span class="term" data-pop="r:kippenberg2018">Kippenberg et al. 2018</span>). Press Run: the scan starts on noise at &zeta; = &minus;2, passes through chaos, and drops onto plateaus whose height counts the solitons; the default ends on one soliton with a sech<sup>2</sup> spectrum.</p>

      <!-- soliton comb, TECH -->
      <div class="panel c25-l lt-fig" id="lle" data-variant="tech" data-pair="lle">
        <div class="ph"><span>Kerr soliton comb, eq. (2.17), N = 512, split-step Fourier</span><span><Badge code="template" pop="t25-lle" /></span></div>
        <div class="ctl"><label for="l-f">Pump f</label><input id="l-f" type="range" min="1.5" max="4.5" step="0.01" value="3"><output id="l-f-o" for="l-f">3.00</output></div>
        <div class="ctl"><label for="l-d2">Dispersion d<sub>2</sub></label><input id="l-d2" type="range" min="0.05" max="1" step="0.005" value="0.3"><output id="l-d2-o" for="l-d2">0.300</output></div>
        <div class="ctl"><label for="l-z1">Scan end &zeta;<sub>1</sub></label><input id="l-z1" type="range" min="2" max="16" step="0.05" value="10"><output id="l-z1-o" for="l-z1">+10.00</output></div>
        <div class="ctl seg2"><span class="k">Scan rate d&zeta;/dt</span><div class="seg" id="l-rate" role="group" aria-label="Scan rate per unit time 2/kappa"><button type="button" data-v="0.04" aria-pressed="false">0.04</button><button type="button" data-v="0.08" class="on" aria-pressed="true">0.08</button><button type="button" data-v="0.16" aria-pressed="false">0.16</button></div></div>
        <div class="ctl seg2"><span class="k">Noise seed</span><div class="seg" id="l-seed" role="group" aria-label="Noise seed"><button type="button" data-v="1" class="on" aria-pressed="true">1</button><button type="button" data-v="2" aria-pressed="false">2</button><button type="button" data-v="3" aria-pressed="false">3</button><button type="button" data-v="4" aria-pressed="false">4</button></div></div>
        <div class="ctl seg2"><span class="k">&zeta; from &minus;2 to &zeta;<sub>1</sub>, hold 15</span><div><button class="c25-run" id="l-run" type="button" data-act="run" data-run="Run" data-stop="Stop" aria-pressed="false"><span class="c25-rt">Run</span></button></div></div>
        <div class="lt-split">
          <div class="c25-plots">
            <svg class="lp" id="l-tr" viewBox="0 0 520 170" role="img" aria-label="Mean intracavity power versus detuning during the scan, with the homogeneous steady states">{@html L.tr}</svg>
            <svg class="lp" id="l-sp" viewBox="0 0 520 170" role="img" aria-label="Comb spectrum in dB per mode">{@html L.sp}</svg>
            <svg class="lp" id="l-wv" viewBox="0 0 520 150" role="img" aria-label="Intracavity intensity around the ring">{@html L.wv}</svg>
          </div>
          <div class="c25-tabs">
            <table class="ro c25-ro" id="l-ro">
              <colgroup><col><col class="c25-v"><col class="c25-s"></colgroup>
              <tbody>
                <tr><td>solitons</td><td class="v" data-l="n">{L.ro.n}</td><td class="s"><Badge code="derived" pop="d25-lle" /></td></tr>
                <tr><td>&zeta;, laser detuning</td><td class="v" data-l="z">{L.ro.z}</td><td class="s"><Badge code="template" pop="t25-lle" /></td></tr>
                <tr><td>span (&minus;40 dB)</td><td class="v" data-l="span">{L.ro.span}</td><td class="s"><Badge code="derived" pop="d25-lle" /></td></tr>
                <tr><td>&lang;|&psi;|<sup>2</sup>&rang;</td><td class="v" data-l="pw">{L.ro.pw}</td><td class="s"></td></tr>
                <tr><td>t (units of 2/&kappa;)</td><td class="v" data-l="t">{L.ro.t}</td><td class="s"></td></tr>
                <tr><td>sech<sup>2</sup> fit, w / w<sub>Herr</sub></td><td class="v" data-l="fit">{L.ro.fit}</td><td class="s"><Badge code="derived" pop="d25-lle" /></td></tr>
                <tr><td>energy residual, one step</td><td class="v" data-l="res">{L.ro.res}</td><td class="s"><Badge code="derived" pop="d25-lle" /></td></tr>
                <tr><td>state</td><td class="v" data-l="st">{L.ro.st}</td><td class="s"></td></tr>
                <tr><td>existence limit &pi;<sup>2</sup>f<sup>2</sup>/8</td><td class="v" data-cv="zmax">{L.cv.zmax}</td><td class="s"><Badge code="derived" pop="d25-lle" /></td></tr>
              </tbody>
            </table>
            <table class="ro c25-ro" id="l-cv">
              <colgroup><col><col class="c25-v"><col class="c25-s"></colgroup>
              <tbody>
                <tr><td colspan="3" class="c25-th">Template ring &rarr; normalized parameters</td></tr>
                <tr><td>&lambda;, n<sub>g</sub>, FSR</td><td class="v">1550 nm, 2.30, 200 GHz</td><td class="s"><Badge code="template" pop="t25-ring" /></td></tr>
                <tr><td>Q<sub>L</sub>, &eta;<sub>c</sub> = &kappa;<sub>ex</sub>/&kappa;</td><td class="v">2.0e+06, 0.50</td><td class="s"><Badge code="template" pop="t25-ring" /></td></tr>
                <tr><td>&gamma;</td><td class="v">{L.gamma} /(W m)</td><td class="s"><Badge code="derived" pop="d25-kerr" /></td></tr>
                <tr><td>&kappa;/2&pi;, time unit 2/&kappa;</td><td class="v">{L.kappa}, {L.tu}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
                <tr><td>P<sub>in</sub> = f<sup>2</sup> &times; {L.pf1}</td><td class="v" data-cv="pin">{L.cv.pin}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
                <tr><td>D<sub>2</sub>/2&pi; = d<sub>2</sub>&kappa;/4&pi;</td><td class="v" data-cv="d2">{L.cv.d2}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
                <tr><td>(&omega;<sub>0</sub> &minus; &omega;<sub>p</sub>)/2&pi; = &zeta;&kappa;/4&pi;</td><td class="v" data-cv="det">{L.cv.det}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
                <tr><td>soliton FWHM</td><td class="v" data-cv="fwhm">{L.cv.fwhm}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
                <tr><td>back: &zeta;, f, d<sub>2</sub></td><td class="v" data-cv="back">{L.cv.back}</td><td class="s"><Badge code="derived" pop="d25-conv" /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="lgd"><span><span class="k"></span>simulated</span><span><span class="k s2"></span>trace: homogeneous states (dotted: unstable); spectrum: Herr sech<sup>2</sup> envelope</span><span>numbers on the trace: solitons per plateau</span></div>
        <div class="pf"><span>Default view: soliton ansatz at &zeta;<sub>1</sub>, relaxed for 3 time units. Run: homogeneous state plus noise at &zeta; = &minus;2, linear scan, 15 time units at &zeta;<sub>1</sub>. Markers: &zeta; = &radic;3 (bistability threshold), &zeta; = &pi;<sup>2</sup>f<sup>2</sup>/8 (soliton existence limit).</span></div>
      </div>

      <!-- soliton comb, VISUAL -->
      <div class="c25-vwrap" data-variant="visual" data-pair="lle">
        <div class="v-inst">
          <div class="v-stage c25-vstage">
            <div class="c25-vring"><svg id="vl-ring" viewBox="0 0 400 400" role="img" aria-label="Ring resonator with the intracavity intensity drawn as radial height; soliton pulses appear as spikes">{@html L.ring}</svg></div>
            <div class="c25-vtr"><svg class="lp" id="vl-tr" viewBox="0 0 440 280" role="img" aria-label="Mean intracavity power versus detuning: chaos, then soliton steps">{@html L.vtr}</svg></div>
            <div class="c25-vcomb"><svg id="vl-comb" viewBox="0 0 1000 300" role="img" aria-label="Comb lines over the telecom band in dB">{@html L.comb}</svg></div>
          </div>
          <div class="v-side">
            <button class="c25-vrun" id="vl-run" type="button" data-act="run" data-run="Run detuning scan" data-stop="Stop scan" aria-pressed="false"><span class="c25-rt">Run detuning scan</span></button>
            <div class="v-ctl" style="--w:5ch"><label for="vl-f">Pump f</label><output id="vl-f-o" for="vl-f">3.00</output><input id="vl-f" type="range" min="1.5" max="4.5" step="0.01" value="3"></div>
            <div class="v-ctl" style="--w:6ch"><label for="vl-d2">Dispersion d<sub>2</sub></label><output id="vl-d2-o" for="vl-d2">0.300</output><input id="vl-d2" type="range" min="0.05" max="1" step="0.005" value="0.3"></div>
            <div class="v-ctl" style="--w:7ch"><label for="vl-z1">Scan end &zeta;<sub>1</sub></label><output id="vl-z1-o" for="vl-z1">+10.00</output><input id="vl-z1" type="range" min="2" max="16" step="0.05" value="10"></div>
            <div class="v-ctl"><span class="v-lab">Scan rate per 2/&kappa;</span><div class="v-seg" id="vl-rate" role="group" aria-label="Scan rate"><button type="button" data-v="0.04" aria-pressed="false">0.04</button><button type="button" data-v="0.08" class="on" aria-pressed="true">0.08</button><button type="button" data-v="0.16" aria-pressed="false">0.16</button></div></div>
            <div class="v-ctl"><span class="v-lab">Noise seed</span><div class="v-seg" id="vl-seed" role="group" aria-label="Noise seed"><button type="button" data-v="1" class="on" aria-pressed="true">1</button><button type="button" data-v="2" aria-pressed="false">2</button><button type="button" data-v="3" aria-pressed="false">3</button><button type="button" data-v="4" aria-pressed="false">4</button></div></div>
            <dl class="v-hud">
              <dt>Solitons</dt><dd data-l="n">{L.ro.n}</dd>
              <dt>Detuning &zeta;</dt><dd data-l="z">{L.ro.z}</dd>
              <dt>Span, &minus;40 dB</dt><dd data-l="span">{L.ro.span}</dd>
              <dt>Mean power &lang;|&psi;|<sup>2</sup>&rang;</dt><dd data-l="pw">{L.ro.pw}</dd>
              <dt>Time, units of 2/&kappa;</dt><dd data-l="t">{L.ro.t}</dd>
              <dt>sech<sup>2</sup> width / Herr</dt><dd data-l="fit">{L.ro.fit}</dd>
              <dt>Energy residual, one step</dt><dd data-l="res">{L.ro.res}</dd>
              <dt>State</dt><dd data-l="st">{L.ro.st}</dd>
              <dt>Existence limit &pi;<sup>2</sup>f<sup>2</sup>/8</dt><dd data-cv="zmax">{L.cv.zmax}</dd>
            </dl>
            <p class="v-cap">Faster scans and other seeds end on more solitons. <Badge code="template" pop="t25-lle" /> <Badge code="derived" pop="v25-ldraw" text="drawing" /></p>
          </div>
        </div>
        <div class="c25-vconv">
          <h4 class="c25-vh">Template ring and normalized parameters <Badge code="template" pop="t25-ring" /> <Badge code="derived" pop="d25-conv" /></h4>
          <dl class="v-hud">
            <dt>&lambda;, n<sub>g</sub>, FSR</dt><dd>1550 nm, 2.30, 200 GHz</dd>
            <dt>Loaded Q, &eta;<sub>c</sub> = &kappa;<sub>ex</sub>/&kappa;</dt><dd>2.0e+06, 0.50</dd>
            <dt>&gamma;</dt><dd>{L.gamma} /(W m)</dd>
            <dt>&kappa;/2&pi;, time unit 2/&kappa;</dt><dd>{L.kappa}, {L.tu}</dd>
            <dt>Pump P<sub>in</sub> = f<sup>2</sup> &times; {L.pf1}</dt><dd data-cv="pin">{L.cv.pin}</dd>
            <dt>D<sub>2</sub>/2&pi; = d<sub>2</sub>&kappa;/4&pi;</dt><dd data-cv="d2">{L.cv.d2}</dd>
            <dt>Laser detuning (&omega;<sub>0</sub> &minus; &omega;<sub>p</sub>)/2&pi;</dt><dd data-cv="det">{L.cv.det}</dd>
            <dt>Soliton FWHM</dt><dd data-cv="fwhm">{L.cv.fwhm}</dd>
            <dt>Back to &zeta;, f, d<sub>2</sub></dt><dd data-cv="back">{L.cv.back}</dd>
          </dl>
          <p class="v-cap">Default view: soliton ansatz at &zeta;<sub>1</sub>, relaxed for 3 time units. Run: homogeneous state plus noise at &zeta; = &minus;2, linear scan, 15 time units at &zeta;<sub>1</sub>. Markers on the scan: &zeta; = &radic;3 (bistability threshold) and, when inside the scan range, &zeta; = &pi;<sup>2</sup>f<sup>2</sup>/8 (soliton existence limit).</p>
        </div>
        <div class="v-prov">
          <span>All LLE parameters <Badge code="template" pop="t25-lle" /></span>
          <span>Unit conversion <Badge code="template" pop="t25-ring" /></span>
          <span>Comb and pump: 1550 nm band, <span class="term" data-pop="v-false">false color</span>, dashed</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Conventions and error sources">
    <div class="sh"><h2 class="biref">L3 Conventions and error sources</h2><span class="meta">n<sub>2</sub> data, normalization, numerics</span></div>
    <div class="body">
      <ul class="c25-ul">
        <li class="tx"><b>Z-scan n<sub>2</sub></b> depends on pulse duration (slow thermal and electrostrictive contributions grow with it), wavelength (two-photon absorption raises n<sub>2</sub> toward the band edge) and polarization. No 1550 nm LN n<sub>2</sub> measurement is held.</li>
        <li class="tx"><b>Cascaded contamination.</b> An n<sub>2</sub> measured in a non-centrosymmetric crystal can include a cascaded &chi;<sup>(2)</sup> contribution from residual phase mismatch; whether the tabulated LN values were corrected for it is not stated in the sources held.</li>
        <li class="tx"><b>Raman.</b> LN is strongly Raman-active: soliton combs must place no cavity mode under the Raman gain peak or control the dissipation spectrum there <Badge code="reported" pop="r:gong2020" /> <Badge code="reported" pop="r:song2024" />. Raman gain coefficients for TFLN are not sourced here; the soliton simulation has no Raman term.</li>
        <li class="tx"><b>LN-specific dynamics.</b> Photorefraction produces a blue shift that counteracts the thermal red shift and extends the soliton existence range, giving spontaneous, deterministic single solitons <Badge code="reported" pop="r:wan2024" />; self-starting LN solitons were first reported by <span class="term" data-pop="r:he2019">He et al. 2019</span>. The soliton simulation has no photorefractive or thermal term.</li>
      </ul>

      <h3 class="h3">n<sub>2</sub> of LN</h3>
      <div class="scrollx">
        <table class="idx c25-n2">
          <thead><tr><th>&lambda;</th><th class="r">n<sub>2</sub> (m<sup>2</sup>/W)</th><th>Conditions</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td>1064 nm</td><td class="num">9.33&times;10<sup>&minus;20</sup></td><td>Z-scan, 30 ps, e-polarized</td><td class="r b0"><Badge code="P-db" pop="r:desalvo1996" /></td></tr>
            <tr><td>532 nm</td><td class="num">8.25&times;10<sup>&minus;19</sup></td><td>same study; two-photon absorption regime</td><td class="r b0"><Badge code="P-db" pop="r:desalvo1996" /></td></tr>
            <tr><td>not stated</td><td class="num">1.8&times;10<sup>&minus;19</sup></td><td>review table, no traced primary</td><td class="r b0"><Badge code="S" pop="r:zhu2021" /></td></tr>
            <tr><td>1550 nm</td><td class="num u">&ndash;</td><td>no measurement held</td><td class="r b0"></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">LLE normalization</h3>
      <p class="tx">Time in units of 2/&kappa;; field, pump and dispersion as in <span class="term" data-pop="r:chembo2013">Chembo &amp; Menyuk 2013</span>, with &kappa; = &omega;<sub>0</sub>/Q<sub>L</sub>, &psi; = &radic;(2g<sub>0</sub>/&kappa;) a (|a|<sup>2</sup> = intracavity photons) and the Kerr frequency shift per photon g<sub>0</sub> from the waveguide &gamma;:</p>
      <div class="eq c25-eq"><math display="block"><mrow><mi>&zeta;</mi><mo>=</mo><mfrac><mrow><mn>2</mn><mo>(</mo><msub><mi>&omega;</mi><mn>0</mn></msub><mo>&minus;</mo><msub><mi>&omega;</mi><mi>p</mi></msub><mo>)</mo></mrow><mi>&kappa;</mi></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><msub><mi>d</mi><mn>2</mn></msub><mo>=</mo><mfrac><mrow><mn>2</mn><msub><mi>D</mi><mn>2</mn></msub></mrow><mi>&kappa;</mi></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><msup><mi>f</mi><mn>2</mn></msup><mo>=</mo><mfrac><mrow><mn>8</mn><msub><mi>g</mi><mn>0</mn></msub><msub><mi>&kappa;</mi><mi>ex</mi></msub><msub><mi>P</mi><mi>in</mi></msub></mrow><mrow><msup><mi>&kappa;</mi><mn>3</mn></msup><mi>&hbar;</mi><msub><mi>&omega;</mi><mn>0</mn></msub></mrow></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><msub><mi>g</mi><mn>0</mn></msub><mo>=</mo><mi>&hbar;</mi><msub><mi>&omega;</mi><mn>0</mn></msub><mi>&gamma;</mi><msub><mi>v</mi><mi>g</mi></msub><mi>FSR</mi></mrow></math></div>
      <p class="tx">D<sub>2</sub> from &omega;<sub>&mu;</sub> = &omega;<sub>0</sub> + D<sub>1</sub>&mu; + D<sub>2</sub>&mu;<sup>2</sup>/2. Both views of the soliton simulation print this conversion for a template ring <Badge code="template" pop="t25-ring" />.</p>

      <h3 class="h3">Single-soliton approximation</h3>
      <div class="eq c25-eq"><math display="block"><mrow><mi>&psi;</mi><mo>&asymp;</mo><msub><mi>&psi;</mi><mi>cw</mi></msub><mo>+</mo><msqrt><mrow><mn>2</mn><mi>&zeta;</mi></mrow></msqrt><msup><mi>e</mi><mrow><mi>i</mi><msub><mi>&phi;</mi><mn>0</mn></msub></mrow></msup><mi>sech</mi><mo>(</mo><mi>&theta;</mi><mo>/</mo><mi>w</mi><mo>)</mo><mo>,</mo></mrow></math><math display="block"><mrow><mi>w</mi><mo>=</mo><msqrt><mfrac><msub><mi>d</mi><mn>2</mn></msub><mrow><mn>2</mn><mi>&zeta;</mi></mrow></mfrac></msqrt><mo>,</mo></mrow></math><math display="block"><mrow><mi>cos</mi><msub><mi>&phi;</mi><mn>0</mn></msub><mo>=</mo><mfrac><msqrt><mrow><mn>8</mn><mi>&zeta;</mi></mrow></msqrt><mrow><mi>&pi;</mi><mi>f</mi></mrow></mfrac><mo>,</mo></mrow></math><math display="block"><mrow><msup><mrow><mo>|</mo><msub><mi>&psi;</mi><mi>&mu;</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mo>&asymp;</mo><mfrac><msub><mi>d</mi><mn>2</mn></msub><mn>4</mn></mfrac><msup><mi>sech</mi><mn>2</mn></msup><mfrac><mrow><mi>&pi;</mi><mi>&mu;</mi><mi>w</mi></mrow><mn>2</mn></mfrac></mrow></math></div>
      <p class="tx">Herr et al. 2014 <span class="term" data-pop="r:herr2014">(Methods)</span>; &psi;<sub>cw</sub> is the lower homogeneous state. The soliton branch requires &radic;(8&zeta;) &le; &pi;f, so it ends at &zeta; = &pi;<sup>2</sup>f<sup>2</sup>/8; the mode powers follow from the Fourier series of the sech <Badge code="derived" pop="d25-lle" />. The dashed soliton-comb spectra follow this envelope; for the default single soliton (&zeta; = 10, f = 3, d<sub>2</sub> = 0.3) the fitted width is {W.fit} of w.</p>

      <h3 class="h3">Numerics of the soliton simulation</h3>
      <p class="tx">Strang split-step Fourier on N = 512 points in &theta;: Kerr rotation exp(i|&psi;|<sup>2</sup>dt/2), then loss, detuning, dispersion and pump integrated exactly per mode, then the second Kerr half step; dt = 10<sup>&minus;3</sup>. The scan advances &zeta; after every block of 20 steps, so a run is deterministic for a given seed; the first step of each block is the energy-balance check d&lang;|&psi;|<sup>2</sup>&rang;/dt = &minus;2&lang;|&psi;|<sup>2</sup>&rang; + 2f Re&lang;&psi;&rang; (dispersion and Kerr conserve energy).</p>
    </div>
  </section>

  <SectionEnd slug="third-order" refs={data.content.refList} />
</ChapterPage>
