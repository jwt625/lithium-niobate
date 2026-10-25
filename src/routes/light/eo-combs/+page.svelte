<!-- Chapter 2.6, EO combs and frequency shifters (manuscript 2.6): L1 phenomenon with the resonant EO comb figure, L2 eq. 2.18
     and the line slope, reported generators, the coupled-ring shifter with eq. 2.19 and its figure, L3 conventions, the analytic
     envelope, line-count definitions and numerical checks. Figures: src/lib/figures/light/f26-comb.ts, f26-shift.ts. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/eo-combs.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { EOCOMB_POPS } from "$lib/figures/light/f26-pops";
  import { mountComb, R_MAP, COMB_DEFAULT } from "$lib/figures/light/f26-comb";
  import { mountShift } from "$lib/figures/light/f26-shift";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  usePops(data.content.pops);
  usePops(EOCOMB_POPS);
  const I = $derived(data.init);
  const R0 = R_MAP.from(1 - COMB_DEFAULT.r);

  let first: HTMLElement;
  onMount(() => {
    const root = first.closest("main") as HTMLElement;
    const offs = [installRangeFill(), mountComb(root), mountShift(root)];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("eo-combs")} title="2.6 EO combs and frequency shifters"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Conventions and error sources" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={first}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">phase modulator in a ring; photonic molecule</span></div>
    <div class="body">
      <p class="tx">Drive a phase modulator inside a ring at exactly the ring's <span class="term" data-pop="g:free-spectral-range">free spectral range</span> (FSR) and every sideband lands on the next resonance; the sidebands cascade into a <span class="term" data-pop="g:eo-comb">comb</span> whose lines are spaced by the drive frequency. In a TFLN microring this produced more than 900 lines at about 10 GHz spacing <Badge code="reported" pop="r:zhang2019" />. The same physics in a lithium niobate disk resonator inside a microwave cavity appeared in the same Nature issue (<span class="term" data-pop="r:rueda2019">Rueda et al. 2019</span>; companion conference paper <a href="https://doi.org/10.1364/nlo.2019.nm2a.5">doi:10.1364/nlo.2019.nm2a.5</a>).</p>
      <p class="tx">Two coupled rings form a <span class="term" data-pop="g:photonic-molecule">photonic molecule</span> with two supermodes split by the coupling. A microwave at that splitting moves light from one supermode to the other, shifting its frequency by up to 28 GHz at about 90% on-chip efficiency <Badge code="reported" pop="r:hu2021" />.</p>

      <!-- comb figure, TECH -->
      <div class="panel lt-fig" id="c26" data-variant="tech" data-pair="f213">
        <div class="ph"><span>Resonant EO comb: intracavity lines of eq. 2.18</span><span>&beta; = &pi;V<sub>p</sub>/V<sub>&pi;,rt</sub>, round-trip peak phase</span></div>
        <div class="lt-split">
          <div class="c26-main">
            <div class="plotbox"><svg class="lp" id="c26-svg" viewBox="0 0 640 310" role="img" aria-label="Comb line power versus line index on a log axis, with the analytic envelope and the counting threshold">{@html I.comb.plot}</svg></div>
            <div class="lgd"><span><i class="k"></i>lines, FFT of eq. 2.18</span><span><i class="k s2"></i>analytic envelope</span><span><i class="k s3"></i>envelope at 2V<sub>p</sub></span><span><i class="k s4"></i>coupled-mode lines with D<sub>2</sub> (D<sub>2</sub> &gt; 0)</span><span><i class="k cur"></i>threshold</span></div>
            <div class="c26-ctl">
            <div class="ctl"><label for="c26-vr">V<sub>p</sub> / V<sub>&pi;,rt</sub></label><input id="c26-vr" type="range" min="0.01" max="0.5" step="0.001" value={COMB_DEFAULT.vr}><output id="c26-vr-o" for="c26-vr">{I.comb.out.vr}</output></div>
            <div class="ctl seg2"><span class="k">Drive</span><div class="seg" id="c26-x" role="group" aria-label="Halve or double the drive voltage"><button type="button" data-act="half">V<sub>p</sub> &divide; 2</button><button type="button" data-act="x2">V<sub>p</sub> &times; 2</button></div></div>
            <div class="ctl"><label for="c26-r">r, round trip</label><input id="c26-r" type="range" min="0" max="1000" step="1" value={R0}><output id="c26-r-o" for="c26-r">{I.comb.out.r}</output></div>
            <div class="ctl"><label for="c26-fsr">FSR = &Omega;/2&pi;</label><input id="c26-fsr" type="range" min="5" max="50" step="0.5" value={COMB_DEFAULT.fsr}><output id="c26-fsr-o" for="c26-fsr">{I.comb.out.fsr}</output></div>
            <div class="ctl"><label for="c26-thr">Threshold</label><input id="c26-thr" type="range" min="20" max="80" step="1" value={COMB_DEFAULT.thr}><output id="c26-thr-o" for="c26-thr">{I.comb.out.thr}</output></div>
            <div class="ctl"><label for="c26-d2">D<sub>2</sub>/2&pi;</label><input id="c26-d2" type="range" min="0" max="60" step="1" value={COMB_DEFAULT.d2s}><output id="c26-d2-o" for="c26-d2">{I.comb.out.d2}</output></div>
            <div class="ctl seg2"><span class="k">Window</span><div class="seg" id="c26-win" role="group" aria-label="Line index window"><button type="button" data-v="50">&plusmn;50</button><button type="button" data-v="500" class="on">&plusmn;500</button><button type="button" data-v="5000">&plusmn;5000 lines</button></div></div>
            </div>
          </div>
          <div><table class="ro ro26" id="c26-ro">{@html I.comb.ro}</table></div>
        </div>
        <div class="pf"><span>Controls: display parameters <Badge code="template" pop="f26-tpl" /></span><span>slope, counts, span: <Badge code="derived" pop="f26-slope" /></span><span>N-point FFT of eq. 2.18 over one drive period, N = 4096 to 65536 by line count.</span><span>V<sub>p</sub> &times; 2 halves the slope where |ln r| &#8810; &beta;.</span></div>
      </div>

      <!-- comb figure, VISUAL -->
      <div class="v-inst wide v26-comb" id="vc26" data-variant="visual" data-pair="f213">
        <div class="v26-row">
          <div class="v-stage" id="vc26-ring">{@html I.comb.ring}</div>
          <div class="v-stage" id="vc26-rank">{@html I.comb.rank}</div>
        </div>
        <div class="v-ctls">
          <div class="v-ctl" style="--w:6ch"><label for="vc26-vr">Drive V<sub>p</sub>/V<sub>&pi;,rt</sub></label><output id="vc26-vr-o" for="vc26-vr">{I.comb.out.vr}</output><input id="vc26-vr" type="range" min="0.01" max="0.5" step="0.001" value={COMB_DEFAULT.vr}></div>
          <div class="v-ctl"><span class="v-lab">Drive</span><div class="v-seg" id="vc26-x" role="group" aria-label="Halve or double the drive voltage"><button type="button" data-act="half">V<sub>p</sub> &divide; 2</button><button type="button" data-act="x2">V<sub>p</sub> &times; 2</button></div></div>
          <div class="v-ctl" style="--w:7ch"><label for="vc26-r">Round-trip transmission r</label><output id="vc26-r-o" for="vc26-r">{I.comb.out.r}</output><input id="vc26-r" type="range" min="0" max="1000" step="1" value={R0}></div>
          <div class="v-ctl" style="--w:9ch"><label for="vc26-fsr">FSR = drive</label><output id="vc26-fsr-o" for="vc26-fsr">{I.comb.out.fsr}</output><input id="vc26-fsr" type="range" min="5" max="50" step="0.5" value={COMB_DEFAULT.fsr}></div>
          <div class="v-ctl" style="--w:6ch"><label for="vc26-thr">Counting threshold</label><output id="vc26-thr-o" for="vc26-thr">{I.comb.out.thr}</output><input id="vc26-thr" type="range" min="20" max="80" step="1" value={COMB_DEFAULT.thr}></div>
          <div class="v-ctl" style="--w:9ch"><label for="vc26-d2">Dispersion D<sub>2</sub>/2&pi;</label><output id="vc26-d2-o" for="vc26-d2">{I.comb.out.d2}</output><input id="vc26-d2" type="range" min="0" max="60" step="1" value={COMB_DEFAULT.d2s}></div>
          <div class="v-ctl"><span class="v-lab">Lines shown</span><div class="v-seg" id="vc26-win" role="group" aria-label="Line index window"><button type="button" data-v="100">&plusmn;100</button><button type="button" data-v="1000" class="on">&plusmn;1000</button><button type="button" data-v="10000">&plusmn;10000</button></div></div>
          <dl class="v-hud">
            <dt>Finesse F</dt><dd id="vc26-F">{I.comb.hud.F}</dd>
            <dt>&beta;</dt><dd id="vc26-beta">{I.comb.hud.beta}</dd>
            <dt>Skirt slope</dt><dd id="vc26-slope">{I.comb.hud.slope}</dd>
            <dt>Slope at 2V<sub>p</sub> / slope</dt><dd id="vc26-ratio">{@html I.comb.hud.ratio}</dd>
            <dt>Slope, FFT fit k 5&ndash;40</dt><dd id="vc26-fit">{@html I.comb.hud.fit}</dd>
            <dt>Slope, 27.29/(&beta;F)</dt><dd id="vc26-hf">{@html I.comb.hud.hf}</dd>
            <dt>Pump line above envelope</dt><dd id="vc26-excess">{@html I.comb.hud.excess}</dd>
            <dt>Lines above threshold</dt><dd id="vc26-lines">{I.comb.hud.lines}</dd>
            <dt>2&lfloor;threshold/slope&rfloor; + 1</dt><dd id="vc26-asym">{@html I.comb.hud.asym}</dd>
            <dt>Lines, coupled-mode with D<sub>2</sub></dt><dd id="vc26-cmt-n">{@html I.comb.hud.cmt}</dd>
            <dt>Span (lines &minus; 1) FSR</dt><dd id="vc26-spanT">{@html I.comb.hud.spanT}</dd>
            <dt>Span at 1550 nm</dt><dd id="vc26-span">{@html I.comb.hud.span}</dd>
          </dl>
        </div>
        <p class="v-cap"><b>Organ rank.</b> One pipe per drawn line; height is line power in dB above the counting threshold, pump at the centre. Dotted: analytic envelope; gold dashed: coupled-mode lines with dispersion (D<sub>2</sub> &gt; 0). Double the drive and the rank doubles its width. N-point FFT of eq. 2.18 over one drive period, N = 4096 to 65536 by line count; V<sub>p</sub> &times; 2 halves the slope where |ln r| &#8810; &beta;.</p>
      </div>
      <div class="v-prov" data-variant="visual">
        <span>&gt; 900 lines at about 10 GHz in TFLN <Badge code="reported" pop="r:zhang2019" /></span>
        <span>controls: display parameters <Badge code="template" pop="f26-tpl" /></span>
        <span>slope, line count, span <Badge code="derived" pop="f26-slope" /></span>
        <span>light: 1550 nm, <span class="term" data-pop="v-false">false color</span></span>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">eq. 2.18 resonant comb; eq. 2.19 shifter</span></div>
    <div class="body">
      <p class="tx"><b>Resonant EO comb, steady state.</b> Dispersion-free ring, drive &Omega; = 2&pi; FSR, round-trip amplitude transmission <i>r</i>, peak round-trip phase modulation &beta;; the intracavity-modulator comb generator of <span class="term" data-pop="r:kourogi1993">Kourogi et al. 1993</span>:</p>
      <div class="eq"><math display="block"><mrow><mi>E</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><msub><mi>t</mi><mi>c</mi></msub><msub><mi>E</mi><mi>in</mi></msub></mrow><mrow><mn>1</mn><mo>&minus;</mo><mi>r</mi><mspace width="0.15em"/><mi>exp</mi><mo>(</mo><mi>i</mi><mi>&beta;</mi><mspace width="0.1em"/><mi>cos</mi><mspace width="0.1em"/><mi>&Omega;</mi><mi>t</mi><mo>)</mo></mrow></mfrac></mrow></math><span class="eqn">(2.18)</span></div>
      <p class="tx">Far from the pump the line power decays at a constant rate per line, set by the complex-time singularity of eq. 2.18, <i>r</i> exp(<i>i</i>&beta; cos <i>t</i>) = 1; for high <span class="term" data-pop="g:finesse">finesse</span> <i>F</i> = &pi;&radic;<i>r</i>/(1 &minus; <i>r</i>) the amplitude envelope is exp(&minus;&pi;|<i>k</i>|/(&beta;<i>F</i>)) <Badge code="derived" pop="f26-slope" />:</p>
      <div class="eq e26w"><math display="block"><mrow><mfrac><mrow><mi>&Delta;</mi><mi>P</mi></mrow><mtext>line</mtext></mfrac><mo>=</mo><mn>8.686</mn><mspace width="0.15em"/><mi>asinh</mi><mo>(</mo><mfrac><mrow><mo>|</mo><mi>ln</mi><mspace width="0.1em"/><mi>r</mi><mo>|</mo></mrow><mi>&beta;</mi></mfrac><mo>)</mo><mspace width="0.3em"/><mtext>dB</mtext></mrow></math><math display="block"><mrow><mo>&asymp;</mo><mspace width="0.4em"/><mfrac><mn>27.29</mn><mrow><mi>&beta;</mi><mi>F</mi></mrow></mfrac><mspace width="0.3em"/><mtext>dB</mtext><mo>,</mo></mrow></math><math display="block"><mrow><mi>&beta;</mi><mo>=</mo><mfrac><mrow><mi>&pi;</mi><msub><mi>V</mi><mi>p</mi></msub></mrow><msub><mi>V</mi><mrow><mi>&pi;</mi><mo>,</mo><mi>rt</mi></mrow></msub></mfrac></mrow></math></div>
      <p class="tx">Numerical Fourier analysis of eq. 2.18 at <i>r</i> = 0.99, &beta; = 0.1: fit over lines 5 to 40 {I.l2.fit} dB/line, asymptotic {I.l2.asym}, high-finesse form {I.l2.hf} <Badge code="derived" pop="f26-slope" />. Doubling the drive voltage halves the slope; doubling the finesse does the same. Published definitions of &beta; differ (per pass or per round trip, peak or rms voltage); here &beta; is the round-trip peak phase.</p>
      <p class="tx">Dispersion limits the span: line <i>k</i> is detuned from its resonance by the accumulated dispersion, and the cascade stops where that detuning exceeds the modulation coupling (design treatment: <span class="term" data-pop="r:buscaino2020">Buscaino et al. 2020</span>). Set D<sub>2</sub> &gt; 0 in the comb figure to see the span shrink.</p>

      <h3 class="h3">Reported comb generators</h3>
      <div class="scrollx">
        <table class="idx r26">
          <thead><tr><th>Generator</th><th>Result</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td class="h">TFLN microring, resonant</td><td>&gt; 900 lines, about 10 GHz</td><td class="b0">Zhang et al. 2019 <Badge code="reported" pop="r:zhang2019" /></td></tr>
            <tr><td class="h">coupled-ring generator</td><td>30% efficiency, 132 nm span</td><td class="b0">Hu et al. 2022 <Badge code="reported" pop="r:hu2022" /></td></tr>
            <tr><td class="h">non-resonant, 4 passes through one modulator</td><td>47 lines at 25 GHz with 28 dBm (0.63 W) RF; 15&times; lower RF power than a single pass</td><td class="b0">Zhang et al. 2023 <Badge code="reported" pop="r:zhangk2023" /></td></tr>
            <tr><td class="h">EO time lens</td><td>520 fs pulses at 30 GHz</td><td class="b0">Yu et al. 2022 <Badge code="reported" pop="r:yu2022" /></td></tr>
            <tr><td class="h">thin-film lithium tantalate (TFLT), triply resonant</td><td>&gt; 450 nm, &gt; 2000 lines (lithium tantalate, not LN)</td><td class="b0">Zhang et al. 2025 <Badge code="reported" pop="r:zhangj2025" /></td></tr>
          </tbody>
        </table>
      </div>

      <p class="tx" style="margin-top:14px"><b>Frequency shifter, coupled-mode.</b> Two rings with coupling &mu; have supermodes split by 2&mu;. A push-pull microwave at &Omega; = 2&mu; couples the supermodes at a rate <i>G</i> proportional to the drive voltage. Steady state, zero detuning, input into supermode <i>a</i>, output from supermode <i>b</i> (<span class="term" data-pop="g:electro-optic-frequency-shifter">EO frequency shifter</span>):</p>
      <div class="eq"><math display="block"><mrow><msup><mrow><mo>|</mo><mfrac><msub><mi>s</mi><mrow><mi>b</mi><mo>,</mo><mi>out</mi></mrow></msub><msub><mi>s</mi><mi>in</mi></msub></mfrac><mo>|</mo></mrow><mn>2</mn></msup><mo>=</mo><mfrac><mrow><msub><mi>&kappa;</mi><mrow><mi>a</mi><mo>,</mo><mi>ex</mi></mrow></msub><msub><mi>&kappa;</mi><mrow><mi>b</mi><mo>,</mo><mi>ex</mi></mrow></msub><msup><mi>G</mi><mn>2</mn></msup></mrow><msup><mrow><mo>(</mo><msub><mi>&kappa;</mi><mi>a</mi></msub><msub><mi>&kappa;</mi><mi>b</mi></msub><mo>/</mo><mn>4</mn><mo>+</mo><msup><mi>G</mi><mn>2</mn></msup><mo>)</mo></mrow><mn>2</mn></msup></mfrac></mrow></math><span class="eqn">(2.19)</span></div>
      <p class="tx">It reaches 1 at <i>G</i> = &kappa;/2 when &kappa;<sub>ex</sub> = &kappa; (no intrinsic loss) <Badge code="derived" pop="f26-eta" />. Reported: shifts up to 28 GHz at about 90% on-chip, cascaded to 119.2 GHz with a 29.8 GHz drive <Badge code="reported" pop="r:hu2021" /> (arXiv v1 stated about 99%).</p>

      <!-- shifter figure, TECH -->
      <div class="panel lt-fig" id="s26" data-variant="tech" data-pair="f214">
        <div class="ph"><span>Coupled-ring frequency shifter: supermode basis</span><span>rates in units of &kappa; = &kappa;<sub>a</sub> = &kappa;<sub>b</sub></span></div>
        <div class="lt-split">
          <pre class="ascii s26-ascii" id="s26-ascii" aria-label="Two-level diagram: supermodes a and b, microwave arrow, output bars">{@html I.shift.ascii}</pre>
          <div class="plotbox"><svg class="lp" id="s26-eff" viewBox="0 0 420 250" role="img" aria-label="Shifted-bin efficiency and carrier versus G over kappa">{@html I.shift.eff}</svg></div>
        </div>
        <div class="lgd"><span><i class="k"></i>shifted bin, eq. 2.19 with loss and detuning</span><span><i class="k s2"></i>carrier (input bin)</span><span><i class="k s3"></i>shifted bin, &kappa;<sub>0</sub> = 0, &delta; = 0</span></div>
        <div class="lt-split">
          <div>
            <div class="ctl"><label for="s26-g">G / &kappa;</label><input id="s26-g" type="range" min="0" max="1.5" step="0.005" value="0.25"><output id="s26-g-o" for="s26-g">{@html I.shift.out.g}</output></div>
            <div class="ctl"><label for="s26-k0">&kappa;<sub>0</sub> / &kappa;, <span class="term" data-pop="g:q-factor">intrinsic</span></label><input id="s26-k0" type="range" min="0" max="0.6" step="0.01" value="0.1"><output id="s26-k0-o" for="s26-k0">{I.shift.out.k0}</output></div>
            <div class="ctl"><label for="s26-det">&delta; = &Omega; &minus; 2&mu;</label><input id="s26-det" type="range" min="-3" max="3" step="0.01" value="0"><output id="s26-det-o" for="s26-det">{@html I.shift.out.det}</output></div>
            <div class="ctl"><label for="s26-mu">2&mu;/2&pi;</label><input id="s26-mu" type="range" min="5" max="40" step="0.1" value="28"><output id="s26-mu-o" for="s26-mu">{I.shift.out.mu}</output></div>
            <div class="ctl seg2"><span class="k">Efficiency axis</span><div class="seg" id="s26-y" role="group" aria-label="Efficiency axis scale"><button type="button" data-v="lin" class="on">linear</button><button type="button" data-v="log">log</button></div></div>
            <table class="ro ro26 ro26s" id="s26-ro">{@html I.shift.ro}</table>
          </div>
          <div class="plotbox"><svg class="lp" id="s26-td" viewBox="0 0 420 250" role="img" aria-label="Shifted-bin and carrier power versus time after a step input">{@html I.shift.td}</svg></div>
        </div>
        <div class="pf"><span>Controls: display parameters <Badge code="template" pop="f26-tpl" /></span><span>efficiency, carrier, maximum: <Badge code="derived" pop="f26-eta" /></span><span>Right plot: step input at t = 0; solid shifted bin, dashed carrier, dotted eq. 2.19.</span></div>
      </div>

      <!-- shifter figure, VISUAL -->
      <div class="v-inst" id="vs26" data-variant="visual" data-pair="f214">
        <div class="v26-sstage">
          <div class="v-stage" id="vs26-art">{@html I.shift.art}</div>
          <div class="v26-plots">
            <div class="v-stage"><svg class="lp" id="vs26-eff" viewBox="0 0 420 250" role="img" aria-label="Shifted-bin efficiency and carrier versus G over kappa">{@html I.shift.veff}</svg></div>
            <div class="v-stage"><svg class="lp" id="vs26-td" viewBox="0 0 420 250" role="img" aria-label="Shifted-bin and carrier power versus time after a step input">{@html I.shift.vtd}</svg></div>
          </div>
          <p class="v-cap"><b>Plots.</b> Left: shifted bin with the set loss and detuning (solid), carrier (dashed), shifted bin without loss at &delta; = 0 (gold). Right: step input at t = 0; shifted bin (solid), carrier (dashed), eq. 2.19 (gold).</p>
        </div>
        <div class="v-side">
          <div class="v-ctl" style="--w:8ch"><label for="vs26-g">Microwave coupling G</label><output id="vs26-g-o" for="vs26-g">{@html I.shift.out.g}</output><input id="vs26-g" type="range" min="0" max="1.5" step="0.005" value="0.25"></div>
          <div class="v-ctl" style="--w:5ch"><label for="vs26-k0">Intrinsic loss share &kappa;<sub>0</sub>/&kappa;</label><output id="vs26-k0-o" for="vs26-k0">{I.shift.out.k0}</output><input id="vs26-k0" type="range" min="0" max="0.6" step="0.01" value="0.1"></div>
          <div class="v-ctl" style="--w:8ch"><label for="vs26-det">Microwave detuning from 2&mu;</label><output id="vs26-det-o" for="vs26-det">{@html I.shift.out.det}</output><input id="vs26-det" type="range" min="-3" max="3" step="0.01" value="0"></div>
          <div class="v-ctl" style="--w:9ch"><label for="vs26-mu">Supermode splitting 2&mu;/2&pi;</label><output id="vs26-mu-o" for="vs26-mu">{I.shift.out.mu}</output><input id="vs26-mu" type="range" min="5" max="40" step="0.1" value="28"></div>
          <div class="v-ctl"><span class="v-lab">Efficiency axis</span><div class="v-seg" id="vs26-y" role="group" aria-label="Efficiency axis scale"><button type="button" data-v="lin" class="on">Linear</button><button type="button" data-v="log">Log</button></div></div>
          <dl class="v-hud">
            <dt>Shift &Omega;/2&pi;</dt><dd id="vs26-shift">{I.shift.hud.shift}</dd>
            <dt>Into the shifted bin</dt><dd id="vs26-eta">{I.shift.hud.eta}</dd>
            <dt>Left in the input bin</dt><dd id="vs26-thru">{@html I.shift.hud.thru}</dd>
            <dt>G / &kappa;</dt><dd id="vs26-gv">{I.shift.hud.g}</dd>
            <dt>Maximum over G at &delta; = 0, (&kappa;<sub>ex</sub>/&kappa;)&sup2;</dt><dd id="vs26-max">{@html I.shift.hud.max}</dd>
            <dt>Detuning &delta;/2&pi;</dt><dd id="vs26-detv">{@html I.shift.hud.det}</dd>
            <dt>&kappa;/2&pi;, loaded Q 1.0&times;10<sup>6</sup> at 1550 nm <Badge code="template" pop="f26-tpl" /></dt><dd id="vs26-kap">{@html I.shift.hud.kap}</dd>
            <dt>Q<sub>i</sub> / Q<sub>ex</sub></dt><dd id="vs26-q">{@html I.shift.hud.q}</dd>
            <dt>|P<sub>b</sub>(30/&kappa;) &minus; eq. 2.19|</dt><dd id="vs26-tdv">{@html I.shift.hud.td}</dd>
          </dl>
          <p class="v-cap"><b>Two bins.</b> Set G = &kappa;/2 with zero intrinsic loss: the input bin empties into the shifted bin. Detune the microwave and the transfer collapses.</p>
        </div>
      </div>
      <div class="v-prov" data-variant="visual">
        <span>up to 28 GHz at about 90% on-chip <Badge code="reported" pop="r:hu2021" /></span>
        <span>controls: display parameters <Badge code="template" pop="f26-tpl" /></span>
        <span>transfer: eq. 2.19 <Badge code="derived" pop="f26-eta" /></span>
        <span>light: two bins near 1550 nm, <span class="term" data-pop="v-bins26">false colors</span></span>
      </div>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Conventions and error sources">
    <div class="sh"><h2 class="biref">L3 Conventions and error sources</h2><span class="meta">&beta; convention, line counts, numerical checks</span></div>
    <div class="body">
      <p class="tx"><b>Modulation index.</b> &beta; = &pi;V<sub>p</sub>/V<sub>&pi;,rt</sub> with V<sub>&pi;,rt</sub> the voltage for a &pi; round-trip phase <Badge code="derived" pop="f26-beta" />. Whether a paper quotes a single-pass or round-trip index, peak or rms voltage, must be read from its methods.</p>
      <p class="tx"><b>Line counts.</b> They depend on the optical spectrum analyzer's dynamic range and on the threshold used; the comb figure prints the threshold with the count. At <i>r</i> = 0.99, &beta; = 0.314 rad (slope {I.count.slope} dB/line), {I.count.n423} lines lie within 60 dB of the pump line ({I.count.NK} FFT points give the same count) <Badge code="derived" pop="f26-count" />. The estimate 2&lfloor;60/slope&rfloor; + 1 = {I.count.n431} refers the threshold to the envelope extrapolated to <i>k</i> = 0, which lies {I.count.excess} dB below the pump line.</p>
      <p class="tx"><b>Analytic envelope.</b> The residue of eq. 2.18 at its pole <i>t</i> = &pi;/2 &minus; <i>ia</i> gives the dashed envelope in the comb figure <Badge code="derived" pop="f26-env" />; lines with |<i>k</i>| &ge; 2 lie on it, the pump line above it:</p>
      <div class="eq"><math display="block"><mrow><msup><mrow><mo>|</mo><msub><mi>c</mi><mi>k</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mo>&asymp;</mo><msup><mrow><mo>|</mo><msub><mi>t</mi><mi>c</mi></msub><msub><mi>E</mi><mi>in</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mfrac><msup><mi>e</mi><mrow><mo>&minus;</mo><mn>2</mn><mi>a</mi><mo>|</mo><mi>k</mi><mo>|</mo></mrow></msup><msup><mrow><mo>(</mo><mi>&beta;</mi><mspace width="0.1em"/><mi>cosh</mi><mspace width="0.1em"/><mi>a</mi><mo>)</mo></mrow><mn>2</mn></msup></mfrac><mo>,</mo><mspace width="1.2em"/><mi>a</mi><mo>=</mo><mi>asinh</mi><mo>(</mo><mfrac><mrow><mo>|</mo><mi>ln</mi><mspace width="0.1em"/><mi>r</mi><mo>|</mo></mrow><mi>&beta;</mi></mfrac><mo>)</mo></mrow></math></div>
      <p class="tx"><b>Lumped model.</b> Microwave loss and velocity mismatch on the ring electrode reduce &beta; at high drive frequency; eq. 2.18 assumes a lumped, uniform phase per round trip. The coupled-mode lines (comb figure, D<sub>2</sub> &gt; 0) uses &kappa; = &minus;2 ln <i>r</i> / T<sub>rt</sub>; at D<sub>2</sub> = 0 its lines lie within {I.cmt} dB of eq. 2.18 for |<i>k</i>| &le; 200 <Badge code="derived" pop="f26-cmt" />.</p>
      <p class="tx"><b>Contrast with Kerr combs.</b> EO combs need no phase matching and no anomalous dispersion; their span is set by &beta;<i>F</i> and dispersion, their spacing by an electronic oscillator, which makes them locked by construction (<span class="term" data-pop="g:kerr-frequency-comb">Kerr solitons</span>: <a href="/light/third-order/">2.5</a>).</p>

      <h3 class="h3">Numerical checks: resonant comb</h3>
      <div class="scrollx">
        <table class="idx r26c">
          <thead><tr><th class="r">r</th><th class="r">&beta; (rad)</th><th class="r">F</th><th class="r">asinh form (dB/line)</th><th class="r">FFT fit, k 5&ndash;40</th><th class="r">27.29/(&beta;F)</th><th class="r">high-finesse error</th><th class="r">Parseval error</th></tr></thead>
          <tbody>{@html I.checks}</tbody>
        </table>
      </div>
      <p class="fine">FFT on N = 8192 points over one drive period; Parseval error = |&Sigma;<sub>k</sub>|c<sub>k</sub>|<sup>2</sup> / &lang;|E|<sup>2</sup>&rang; &minus; 1|. &beta; &rarr; 0 leaves a single line. <Badge code="derived" pop="f26-slope" /></p>
      <h3 class="h3">Numerical checks: frequency shifter</h3>
      <p class="tx">Eq. 2.19 at <i>G</i> = &kappa;/2, &kappa;<sub>ex</sub> = &kappa;: {I.sh.max}. At <i>G</i> = 0: {I.sh.zero}. Detuning &plusmn;0.7&kappa; at <i>G</i> = 0.4&kappa;, &kappa;<sub>0</sub> = 0.1&kappa;: difference {I.sh.sym}. Time-domain steady state (&kappa;t = 60) minus eq. 2.19: {I.sh.td}. <Badge code="derived" pop="f26-td" /></p>
    </div>
  </section>

  <SectionEnd slug="eo-combs" refs={data.content.refList} />
</ChapterPage>
