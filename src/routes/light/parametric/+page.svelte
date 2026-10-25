<!-- Chapter 2.4 Parametric amplification and OPOs: L1 phenomenon (OPO threshold: TECH output plot, VISUAL ring that
     ignites at P_th), L2 quantitative model (eq. 2.14 gain, eq. 2.15 threshold with Q scaling and reported devices, OPO
     tuning vs period and temperature), L3 conventions and error sources. Text: content/chapters/02-light/manuscript.md
     section 2.4. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/parametric.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { P24_POPS } from "$lib/figures/light/f24-pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { DEF, LOG, OUT, lpos, opoModel } from "$lib/figures/light/f24-model";
  import { mountP24, initP24Visual } from "$lib/figures/light/f24-mount";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  usePops(P24_POPS);
  usePops(data.content.pops);
  const I = $derived(data.init);
  const o = DEF.opo, a = DEF.opa, t = DEF.tune;
  const x0 = opoModel(o).x;

  let body: HTMLElement;
  onMount(() => {
    const root = body.closest("main") as HTMLElement;
    const offs = [mountP24(root), installRangeFill(), whenVisual(() => initP24Visual(root))];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("parametric")} title="2.4 Parametric amplification and OPOs"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Conventions and error sources" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">three-wave mixing with gain; resonator threshold</span></div>
    <div class="body">
      <p class="tx">A strong pump at &omega;<sub>p</sub> amplifies a weak signal at &omega;<sub>s</sub> and creates an idler at &omega;<sub>i</sub> = &omega;<sub>p</sub> &minus; &omega;<sub>s</sub> (<span class="term" data-pop="g:opa">optical parametric amplification</span>). Inside a cavity the device oscillates once gain beats loss: an <span class="term" data-pop="g:opo">optical parametric oscillator</span> (OPO), tunable by poling period, temperature or pump frequency. <span class="term" data-pop="r:giordmaine1965">Giordmaine and Miller</span> demonstrated tunable parametric oscillation in LiNbO<sub>3</sub> in 1965. On chip, TFLN rings oscillate at about 30 &micro;W of pump <Badge code="reported" pop="r:lu2021" />, microdisks with Q above 10<sup>8</sup> at 19.6 &micro;W <Badge code="reported" pop="r:gao2021" />, and dispersion-engineered <span class="term" data-pop="g:ppln">PPLN</span> waveguides amplify by 118 dB/cm <Badge code="reported" pop="r:jankowski2022" />.</p>

      <div class="panel p24-panel lt-fig" id="p24-opo" data-variant="tech" data-pair="p24-opo">
        <div class="ph"><span>OPO in a ring: output, conversion and intracavity pump vs pump power</span><span>eq. 2.15</span></div>
        <div class="lt-split"><div><div class="plotbox"><svg id="p24-opo-svg" class="lp" viewBox="0 0 520 340" role="img" aria-label="Signal plus idler output and conversion versus pump power, threshold knee, reported thresholds as ticks">{@html I.opoSvg}</svg></div>
        <div class="lgd"><span><i class="k"></i>P<sub>s+i</sub>; conversion P<sub>s+i</sub>/P</span><span><i class="k s2"></i>|a<sub>p</sub>|<sup>2</sup> / clamp</span><span><i class="k s3"></i>P<sub>th</sub></span><span>&#9662; reported thresholds: 19.6 &micro;W <Badge code="reported" pop="r:gao2021" /> 30 &micro;W <Badge code="reported" pop="r:lu2021" /></span></div>
        </div><div><div class="ctl"><label for="p24-P">pump P in bus</label><input id="p24-P" type="range" min="0" max={LOG.P[2]} step="1" value={lpos(o.P, LOG.P)}><output id="p24-P-o" for="p24-P">{OUT.P(o.P)}</output></div>
        <div class="ctl"><label for="p24-qp">intrinsic Q<sub>p</sub></label><input id="p24-qp" type="range" min="0" max={LOG.Q[2]} step="1" value={lpos(o.Qp, LOG.Q)}><output id="p24-qp-o" for="p24-qp">{OUT.Q(o.Qp)}</output></div>
        <div class="ctl"><label for="p24-qs">intrinsic Q<sub>s</sub> = Q<sub>i</sub></label><input id="p24-qs" type="range" min="0" max={LOG.Q[2]} step="1" value={lpos(o.Qs, LOG.Q)}><output id="p24-qs-o" for="p24-qs">{OUT.Q(o.Qs)}</output></div>
        <div class="ctl"><label for="p24-ep">&kappa;<sub>p,ex</sub>/&kappa;<sub>p</sub></label><input id="p24-ep" type="range" min="0.05" max="0.95" step="0.01" value={o.ep}><output id="p24-ep-o" for="p24-ep">{OUT.e(o.ep)}</output></div>
        <div class="ctl"><label for="p24-es">&kappa;<sub>s,ex</sub>/&kappa;<sub>s</sub></label><input id="p24-es" type="range" min="0.05" max="0.95" step="0.01" value={o.es}><output id="p24-es-o" for="p24-es">{OUT.e(o.es)}</output></div>
        <div class="ctl"><label for="p24-g">g/2&pi;</label><input id="p24-g" type="range" min="0" max={LOG.g[2]} step="1" value={lpos(o.g2pi, LOG.g)}><output id="p24-g-o" for="p24-g">{OUT.g(o.g2pi)}</output></div>
        <table class="ro" id="p24-opo-ro">{@html I.opoRo}</table></div></div>
        <div class="pf">H/&hbar; = g(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub>a<sub>i</sub> + h.c.), energy decay rates, zero detunings; pump 775 nm, signal = idler 1550 nm. Defaults <Badge code="template" pop="p24-tpl-opo" />; P<sub>th</sub>, output, clamp <Badge code="derived" pop="p24-der-pth" />. Ticks are measured devices, not computed from these inputs.</div>
      </div>

      <div class="p24v lt-fig" data-variant="visual" data-pair="p24-opo">
        <div class="v-inst">
          <div class="v-stage"><svg id="p24v-ring" viewBox="0 0 720 430" role="img" aria-label="Ring resonator OPO on a bus waveguide: the ring lights in signal and idler false color above threshold; pump and output arrows on one P over P-threshold axis">{@html I.ring}</svg></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:5ch"><label for="p24v-x">Pump power, P / P<sub>th</sub></label><output id="p24v-x-o" for="p24v-x">{I.ringHud.x}</output><input class="v-range" id="p24v-x" type="range" min="0.1" max="8" step="0.01" value={Math.min(8, x0)}></div>
            <div class="v-ctl" style="--w:7ch"><label for="p24v-q">Intrinsic Q, all three modes</label><output id="p24v-q-o" for="p24v-q">{OUT.Q(o.Qs)}</output><input class="v-range" id="p24v-q" type="range" min="0" max={LOG.vQ[2]} step="1" value={lpos(o.Qs, LOG.vQ)}></div>
            <div class="v-ctl"><span class="v-lab">Coupling &kappa;<sub>ex</sub>/&kappa;, pump and signal</span><div class="v-seg" id="p24v-cpl" role="group" aria-label="Coupling ratio"><button type="button" data-v="0.25">under 0.25</button><button type="button" data-v="0.5" class="on">critical 0.5</button><button type="button" data-v="0.9">over 0.9</button></div></div>
            <dl class="v-hud">
              <dt>Pump power P</dt><dd id="p24v-hP">{I.ringHud.P}</dd>
              <dt>Threshold P<sub>th</sub></dt><dd id="p24v-hPth">{I.ringHud.Pth}</dd>
              <dt>Loaded Q, pump</dt><dd id="p24v-hqp">{I.ringHud.QpL}</dd>
              <dt>Loaded Q, signal = idler</dt><dd id="p24v-hqs">{I.ringHud.QsL}</dd>
              <dt>g/2&pi;</dt><dd id="p24v-hg">{I.ringHud.g}</dd>
              <dt>Intracavity pump photons</dt><dd id="p24v-hnp">{I.ringHud.np}</dd>
              <dt>Clamp &kappa;<sub>s</sub>&kappa;<sub>i</sub>/4g<sup>2</sup></dt><dd id="p24v-hnth">{I.ringHud.nth}</dd>
              <dt>Signal + idler out</dt><dd id="p24v-hPsi">{I.ringHud.Psi}</dd>
              <dt>Conversion</dt><dd id="p24v-heff">{I.ringHud.eff}</dd>
              <dt>Conversion at 4 P<sub>th</sub></dt><dd id="p24v-hmax">{I.ringHud.effMax}</dd>
            </dl>
            <p class="v-cap">Drag the pump past 1: the ring lights at P = P<sub>th</sub>, the intracavity pump stops rising, and conversion peaks at 4 P<sub>th</sub>. Raising Q at fixed pump power lowers P<sub>th</sub>. Arrow lengths on one axis: their ratio is the conversion.</p>
          </div>
        </div>
        <div class="v-prov">
          <span>Q, coupling, g/2&pi; (default 1 MHz) with H/&hbar; = g(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub>a<sub>i</sub> + h.c.) <Badge code="template" pop="p24-tpl-opo" /></span>
          <span>P<sub>th</sub>, output, clamp: eq. 2.15 <Badge code="derived" pop="p24-der-pth" /></span>
          <span>measured devices, not computed from these inputs: about 30 &micro;W <Badge code="reported" pop="r:lu2021" />, 19.6 &micro;W <Badge code="reported" pop="r:gao2021" /></span>
          <span>pump 775 nm, signal = idler 1550 nm, zero detunings; pump in spectral color, 1550 nm in <span class="term" data-pop="v-false">false color</span>, dashed</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">coupled modes of 2.3 L3; resonator CMT</span></div>
    <div class="body">
      <h3 class="h3">Phase-sensitive gain</h3>
      <p class="tx">Degenerate, &Delta;k = 0: from the coupled equations of 2.3 L3 with a fixed pump of peak power P<sub>p</sub>, the in-phase quadrature grows as exp(&Gamma;z) and the other decays as exp(&minus;&Gamma;z), with the <span class="term" data-pop="g:normalized-conversion-efficiency">normalized efficiency</span> &eta;<sub>norm</sub> of the matching SHG process:</p>
      <div class="eq"><math display="block"><mrow><mi>&Gamma;</mi><mo>=</mo><msqrt><mrow><msub><mi>&eta;</mi><mi>norm</mi></msub><msub><mi>P</mi><mi>p</mi></msub></mrow></msqrt><mo>,</mo><mspace width="1.4em"/><mfrac><msub><mi>G</mi><mi>dB</mi></msub><mi>L</mi></mfrac><mo>=</mo><mn>20</mn><msub><mi>log</mi><mn>10</mn></msub><mo>(</mo><mi>e</mi><mo>)</mo><mspace width="0.2em"/><mi>&Gamma;</mi><mo>=</mo><mn>8.686</mn><msqrt><mrow><msub><mi>&eta;</mi><mi>norm</mi></msub><msub><mi>P</mi><mi>p</mi></msub></mrow></msqrt></mrow></math><span class="eqn">(2.14)</span></div>
      <p class="tx">&eta;<sub>norm</sub> = 2600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:wang2018optica" /> gives 14.0, 44.3 and 140 dB/cm at P<sub>p</sub> = 0.1, 1 and 10 W peak <Badge code="derived" pop="p24-der-gain" />. Non-degenerate with mismatch, no input idler (q replaces the g of the literature form, to keep g for the coupling rate):</p>
      <div class="eq"><math display="block"><mrow><mi>G</mi><mo>=</mo><mn>1</mn><mo>+</mo><mfrac><msup><mi>&Gamma;</mi><mn>2</mn></msup><msup><mi>q</mi><mn>2</mn></msup></mfrac><msup><mi>sinh</mi><mn>2</mn></msup><mo>(</mo><mi>q</mi><mi>L</mi><mo>)</mo><mo>,</mo><mspace width="1.4em"/><msup><mi>q</mi><mn>2</mn></msup><mo>=</mo><msup><mi>&Gamma;</mi><mn>2</mn></msup><mo>&minus;</mo><msup><mrow><mo>(</mo><mi>&Delta;</mi><mi>k</mi><mo>/</mo><mn>2</mn><mo>)</mo></mrow><mn>2</mn></msup></mrow></math><span class="eqn">(2.14b)</span></div>
      <p class="tx">At &Delta;k = 0, G = cosh<sup>2</sup>(&Gamma;L): 1 + (&Gamma;L)<sup>2</sup> for small &Gamma;L, and 6.02 dB below the phase-sensitive gain for large &Gamma;L. Reported: &gt; 50 dB/cm phase-sensitive in a 6 mm waveguide and &gt; 100 dB/cm over 600 nm near 2 &micro;m <Badge code="reported" pop="r:ledezma2022" />; 71 dB (118 dB/cm) unsaturated over 1700 to 2700 nm with 4 pJ pump pulses, 88 dB (&gt; 146 dB/cm) saturated <Badge code="reported" pop="r:jankowski2022" />.</p>

      <div class="panel p24-panel lt-fig" id="p24-opa" data-variant="tech" data-pair="p24-opa">
        <div class="ph"><span>Parametric gain vs length</span><span class="seg" id="p24-ylog" role="group" aria-label="Gain axis"><button data-v="lin" class="on">dB lin</button><button data-v="log">dB log</button></span></div>
        <div class="lt-split"><div><div class="plotbox"><svg id="p24-opa-svg" class="lp" viewBox="0 0 520 250" role="img" aria-label="Gain in dB versus waveguide length: phase-sensitive, phase-insensitive at zero and set mismatch, small-gain limit">{@html I.opaSvg}</svg></div>
        <div class="lgd"><span><i class="k"></i>phase-sensitive, eq. 2.14</span><span><i class="k s2"></i>cosh<sup>2</sup>(&Gamma;L)</span><span><i class="k s3"></i>eq. 2.14b at &Delta;k</span><span><i class="k s5"></i>1 + (&Gamma;L)<sup>2</sup></span></div>
        </div><div><div class="ctl"><label for="p24-eta">&eta;<sub>norm</sub></label><input id="p24-eta" type="range" min="0" max={LOG.eta[2]} step="1" value={lpos(a.eta, LOG.eta)}><output id="p24-eta-o" for="p24-eta">{OUT.eta(a.eta)}</output></div>
        <div class="ctl"><label for="p24-pp">pump P<sub>p</sub>, peak</label><input id="p24-pp" type="range" min="0" max={LOG.Pp[2]} step="1" value={lpos(a.Pp, LOG.Pp)}><output id="p24-pp-o" for="p24-pp">{OUT.Pp(a.Pp)}</output></div>
        <div class="ctl"><label for="p24-l">length L</label><input id="p24-l" type="range" min="0.1" max="20" step="0.1" value={a.Lmm}><output id="p24-l-o" for="p24-l">{OUT.L(a.Lmm)}</output></div>
        <div class="ctl"><label for="p24-dk">mismatch &Delta;k</label><input id="p24-dk" type="range" min="0" max="5" step="0.01" value={a.dk}><output id="p24-dk-o" for="p24-dk">{OUT.dk(a.dk)}</output></div>
        <table class="ro" id="p24-opa-ro">{@html I.opaRo}</table></div></div>
        <div class="pf">&eta;<sub>norm</sub> of measured SHG waveguides: 2600 %/W/cm<sup>2</sup> (default) <Badge code="reported" pop="r:wang2018optica" />, 4600 <Badge code="reported" pop="r:rao2019" />, 9600 <Badge code="reported" pop="r:li2024apn" />; P<sub>p</sub>, L, &Delta;k and the shared &Gamma; <Badge code="template" pop="p24-tpl-opa" />; curves <Badge code="derived" pop="p24-der-gain" />. Undepleted pump, no loss.</div>
      </div>

      <div class="p24v lt-fig" data-variant="visual" data-pair="p24-opa">
        <div class="v-inst">
          <div class="v-stage"><svg id="p24v-opa" class="lp" viewBox="0 0 760 420" role="img" aria-label="Waveguide amplifier: amplified and de-amplified quadratures as wedges in dB along the chip, and gain curves versus position">{@html I.vOpa}</svg></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:8ch"><label for="p24v-pp">Pump peak power</label><output id="p24v-pp-o" for="p24v-pp">{OUT.Pp(a.Pp)}</output><input class="v-range" id="p24v-pp" type="range" min="0" max={LOG.Pp[2]} step="1" value={lpos(a.Pp, LOG.Pp)}></div>
            <div class="v-ctl" style="--w:7ch"><label for="p24v-l">Chip length</label><output id="p24v-l-o" for="p24v-l">{OUT.L(a.Lmm)}</output><input class="v-range" id="p24v-l" type="range" min="0.1" max="20" step="0.1" value={a.Lmm}></div>
            <div class="v-ctl" style="--w:11ch"><label for="p24v-dk">Phase mismatch &Delta;k</label><output id="p24v-dk-o" for="p24v-dk">{OUT.dk(a.dk)}</output><input class="v-range" id="p24v-dk" type="range" min="0" max="5" step="0.01" value={a.dk}></div>
            <div class="v-ctl"><span class="v-lab">&eta;<sub>norm</sub>, measured SHG waveguides (%/W/cm<sup>2</sup>)</span><div class="v-seg" id="p24v-eta" role="group" aria-label="Normalized efficiency"><button type="button" data-v="2600" class="on">2600</button><button type="button" data-v="4600">4600</button><button type="button" data-v="9600">9600</button></div></div>
            <div class="v-ctl"><span class="v-lab">Gain axis</span><div class="v-seg" id="p24v-ylog" role="group" aria-label="Gain axis"><button type="button" data-v="lin" class="on">dB linear</button><button type="button" data-v="log">dB log</button></div></div>
            <dl class="v-hud">
              <dt>&Gamma; = (&eta;<sub>norm</sub>P<sub>p</sub>)<sup>1/2</sup></dt><dd id="p24v-agam">{I.vOpaHud.Gamma}</dd>
              <dt>Gain per length, eq. 2.14</dt><dd id="p24v-adb">{I.vOpaHud.dBcm}</dd>
              <dt>Amplified quadrature</dt><dd id="p24v-aps">{I.vOpaHud.Gps}</dd>
              <dt>De-amplified quadrature</dt><dd id="p24v-adq">{I.vOpaHud.Gdq}</dd>
              <dt>Phase-insensitive, &Delta;k = 0</dt><dd id="p24v-api0">{I.vOpaHud.Gpi0}</dd>
              <dt>Phase-insensitive at &Delta;k</dt><dd id="p24v-api">{I.vOpaHud.Gpi}</dd>
              <dt>&Delta;k / 2&Gamma;</dt><dd id="p24v-arat">{I.vOpaHud.ratio}</dd>
            </dl>
          </div>
        </div>
        <p class="v-cap">Chip lit up to the set length. Undepleted pump, no loss. Dashed: phase-sensitive gain; solid: cosh<sup>2</sup>(&Gamma;L); dashed gray: at the set &Delta;k; dotted: 1 + (&Gamma;L)<sup>2</sup>.</p>
        <div class="v-prov">
          <span>&eta;<sub>norm</sub>: 2600 <Badge code="reported" pop="r:wang2018optica" />, 4600 <Badge code="reported" pop="r:rao2019" />, 9600 <Badge code="reported" pop="r:li2024apn" /></span>
          <span>pump power, length, &Delta;k, shared &Gamma; for the non-degenerate curves <Badge code="template" pop="p24-tpl-opa" /></span>
          <span>gain: eq. 2.14 and 2.14b <Badge code="derived" pop="p24-der-gain" /></span>
          <span>pump 775 nm spectral; signal 1550 nm <span class="term" data-pop="v-false">false color</span></span>
        </div>
      </div>

      <h3 class="h3">Resonator threshold</h3>
      <p class="tx">Coupled-mode theory, H/&hbar; = g(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub>a<sub>i</sub> + h.c.), energy decay rates &kappa;<sub>p</sub>, &kappa;<sub>s</sub>, &kappa;<sub>i</sub>, pump input coupling &kappa;<sub>p,ex</sub>, all detunings zero (<span class="term" data-pop="g:opo-threshold">OPO threshold</span>):</p>
      <div class="eq"><math display="block"><mrow><msubsup><mrow><mo>|</mo><msub><mi>a</mi><mi>p</mi></msub><mo>|</mo></mrow><mi>th</mi><mn>2</mn></msubsup><mo>=</mo><mfrac><mrow><msub><mi>&kappa;</mi><mi>s</mi></msub><msub><mi>&kappa;</mi><mi>i</mi></msub></mrow><mrow><mn>4</mn><msup><mi>g</mi><mn>2</mn></msup></mrow></mfrac><mo>,</mo><mspace width="1.4em"/><msub><mi>P</mi><mi>th</mi></msub><mo>=</mo><mfrac><mrow><mi>&hbar;</mi><msub><mi>&omega;</mi><mi>p</mi></msub><msubsup><mi>&kappa;</mi><mi>p</mi><mn>2</mn></msubsup><msub><mi>&kappa;</mi><mi>s</mi></msub><msub><mi>&kappa;</mi><mi>i</mi></msub></mrow><mrow><mn>16</mn><msup><mi>g</mi><mn>2</mn></msup><msub><mi>&kappa;</mi><mrow><mi>p</mi><mo>,</mo><mi>ex</mi></mrow></msub></mrow></mfrac></mrow></math><span class="eqn">(2.15)</span></div>
      <p class="tx">Above threshold the intracavity pump clamps at that value. For &kappa;<sub>s</sub> = &kappa;<sub>i</sub> and &omega;<sub>s</sub> = &omega;<sub>i</sub> = &omega;<sub>p</sub>/2 the summed signal and idler output is</p>
      <div class="eq"><math display="block"><mrow><msub><mi>P</mi><mrow><mi>s</mi><mo>+</mo><mi>i</mi></mrow></msub><mo>=</mo><msub><mi>P</mi><mi>th</mi></msub><mfrac><mrow><mn>4</mn><msub><mi>&kappa;</mi><mrow><mi>s</mi><mo>,</mo><mi>ex</mi></mrow></msub><msub><mi>&kappa;</mi><mrow><mi>p</mi><mo>,</mo><mi>ex</mi></mrow></msub></mrow><mrow><msub><mi>&kappa;</mi><mi>s</mi></msub><msub><mi>&kappa;</mi><mi>p</mi></msub></mrow></mfrac><mrow><mo>(</mo><msqrt><mrow><mi>P</mi><mo>/</mo><msub><mi>P</mi><mi>th</mi></msub></mrow></msqrt><mo>&minus;</mo><mn>1</mn><mo>)</mo></mrow></mrow></math><span class="eqn">(2.15b)</span></div>
      <p class="tx">Conversion P<sub>s+i</sub>/P peaks at P = 4 P<sub>th</sub> with the value &kappa;<sub>s,ex</sub>&kappa;<sub>p,ex</sub>/(&kappa;<sub>s</sub>&kappa;<sub>p</sub>): 25% at critical coupling, 100% only for fully overcoupled modes <Badge code="derived" pop="p24-der-pth" />. Threshold scales as Q<sup>&minus;3</sup> when all three modes are resonant (triply resonant), and as Q<sup>&minus;2</sup> for signal and idler resonant with a single-pass pump (doubly resonant, DRO) <Badge code="derived" pop="p24-der-scal" />. A singly resonant OPO (SRO) resonates one wave only: higher threshold, but signal and idler need not both sit on resonances <Badge code="reported" pop="r:hwang2023" />.</p>

      <div class="panel p24-panel lt-fig" id="p24-sc">
        <div class="ph"><span>OPO threshold vs intrinsic Q, other inputs from the L1 OPO figure</span><span>eq. 2.15</span></div>
        <div class="lt-split"><div><div class="plotbox"><svg id="p24-sc-svg" class="lp" viewBox="0 0 520 250" role="img" aria-label="Threshold power versus intrinsic Q for three sweeps, log-log">{@html I.scSvg}</svg></div>
        <div class="lgd"><span><i class="k"></i>Q<sub>p</sub> = Q<sub>s</sub> = Q<sub>i</sub> = Q</span><span><i class="k s2"></i>Q<sub>s</sub> = Q<sub>i</sub> = Q, Q<sub>p</sub> fixed</span><span><i class="k p24-s6"></i>Q<sub>p</sub> = Q, Q<sub>s</sub> fixed</span><span>ticks on the P<sub>th</sub> axis: reported 19.6 and 30 &micro;W</span></div>
        </div><div><table class="ro" id="p24-sc-ro">{@html I.scRo}</table></div></div>
        <div class="pf">Slopes d log P<sub>th</sub> / d log Q <Badge code="derived" pop="p24-der-scal" />; marker: current inputs (L1 controls) <Badge code="template" pop="p24-tpl-opo" />.</div>
      </div>

      <h3 class="h3">Reported devices</h3>
      <div class="scrollx">
        <table class="idx p24-dev">
          <thead><tr><th>Device</th><th>Threshold or output</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>TFLN PPLN ring, telecom</td><td>about 30 &micro;W; 11% pump to signal + idler at 93 &micro;W</td><td class="b0"><Badge code="reported" pop="r:lu2021" /></td></tr>
            <tr><td>TFLN circuit, SHG + OPO</td><td>tens of &micro;W; &gt; 1 THz tuning by changing the pump frequency by hundreds of MHz</td><td class="b0"><Badge code="reported" pop="r:mckenna2022" /></td></tr>
            <tr><td>microdisk, Q &gt; 10<sup>8</sup></td><td>19.6 &micro;W</td><td class="b0"><Badge code="reported" pop="r:gao2021" /></td></tr>
            <tr><td>dispersion-engineered PPLN, 100 ns pulses near 1 &micro;m</td><td>tuning 1.53 to 3.25 &micro;m, tens of mW</td><td class="b0"><Badge code="reported" pop="r:ledezma2023" /></td></tr>
            <tr><td>femtosecond OPO combs</td><td>1.5 to 3.3 &micro;m, femtojoule thresholds, up-converted to 620 nm</td><td class="b0"><Badge code="reported" pop="r:roy2023" /></td></tr>
            <tr><td>SRO, TFLN on sapphire</td><td>1.5 to 3.3 &micro;m; &gt; 25 mW at 3.2 &micro;m, 15%</td><td class="b0"><Badge code="reported" pop="r:hwang2023" /></td></tr>
            <tr><td>electrically tuned mid-IR OPO</td><td>22 THz, 2.7 to 3.4 &micro;m</td><td class="b0"><Badge code="reported" pop="r:hwang2026" /></td></tr>
            <tr><td>frequency-modulated OPO comb</td><td>&gt; 93% internal pump to comb, about 200 modes</td><td class="b0"><Badge code="reported" pop="r:stokowski2024" /></td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="h3">Tuning</h3>
      <p class="tx">Bulk PPLN OPOs <span class="term" data-pop="r:myers1995">(Myers et al. 1995)</span> tune with the <span class="term" data-pop="g:qpm">QPM</span> period and the crystal temperature. Bulk CLN, pump 1064 nm: &Lambda; = 29.91 &micro;m phase-matches signal 1550 nm and idler 3393 nm <Badge code="derived" pop="p24-der-tune" />, n<sub>e</sub> from <Badge code="P-db" pop="r:zelmon1997" text="Zelmon 1997, 21 °C" />. Temperature tuning uses <Badge code="S" pop="r:jundt1997" text="Jundt 1997, 20-250 °C" />. Each point solves <span class="term" data-pop="g:phase-matching">&Delta;k = 0</span> with 1/&lambda;<sub>p</sub> = 1/&lambda;<sub>s</sub> + 1/&lambda;<sub>i</sub>; at 21 &deg;C the two models differ by 14 nm in signal <Badge code="derived" pop="p24-der-tune" />.</p>

      <div class="panel p24-panel lt-fig" id="p24-tu" data-variant="tech" data-pair="p24-tu">
        <div class="ph"><span>OPO tuning, bulk CLN, pump 1064 nm, e + e &rarr; e, first order</span><span>&Delta;k = 0, energy conserved per point</span></div>
        <div class="lt-split">
          <div class="plotbox"><svg id="p24-ta" class="lp" viewBox="0 0 520 260" role="img" aria-label="Signal and idler wavelength versus poling period">{@html I.taSvg}</svg></div>
          <div class="plotbox"><svg id="p24-tb" class="lp" viewBox="0 0 520 260" role="img" aria-label="Signal and idler frequency versus temperature at the set period">{@html I.tbSvg}</svg></div>
        </div>
        <div class="lgd"><span><i class="k"></i>left: Zelmon 21 &deg;C; right: signal</span><span><i class="k s2"></i>left: Jundt at T; right: idler</span><span><i class="k p24-s6"></i>left: Jundt at 20, 66, 112, 158, 204, 250 &deg;C</span><span>&#9670; Zelmon &#9671; Jundt at the cursor</span></div>
        <div class="ctl"><label for="p24-lam">period &Lambda;</label><input id="p24-lam" type="range" min="26" max="31.6" step="0.01" value={t.L}><output id="p24-lam-o" for="p24-lam">{OUT.lam(t.L)}</output></div>
        <div class="ctl"><label for="p24-t">temperature T</label><input id="p24-t" type="range" min="20" max="250" step="0.5" value={t.T}><output id="p24-t-o" for="p24-t">{OUT.T(t.T)}</output></div>
        <table class="ro" id="p24-tu-ro">{@html I.tuRo}</table>
        <div class="pf">Curves end where the idler leaves the 5 &micro;m model window or at degeneracy (&lambda;<sub>s</sub> = &lambda;<sub>i</sub> = 2128 nm). Period thermal expansion not included. Defaults <Badge code="template" pop="p24-tpl-tune" />; tuning <Badge code="derived" pop="p24-der-tune" />.</div>
      </div>

      <div class="p24v lt-fig" data-variant="visual" data-pair="p24-tu">
        <div class="v-inst">
          <div class="v-stage"><svg id="p24v-fan" class="lp" viewBox="0 0 760 470" role="img" aria-label="Tuning fan: signal and idler wavelength versus poling period at six temperatures and at the set temperature; photon-energy bar with pump frequency split into signal and idler">{@html I.fan}</svg></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:8ch"><label for="p24v-t">Crystal temperature</label><output id="p24v-t-o" for="p24v-t">{OUT.T(t.T)}</output><input class="v-range" id="p24v-t" type="range" min="20" max="250" step="0.5" value={t.T}></div>
            <div class="v-ctl" style="--w:8ch"><label for="p24v-lam">Poling period</label><output id="p24v-lam-o" for="p24v-lam">{OUT.lam(t.L)}</output><input class="v-range" id="p24v-lam" type="range" min="26" max="31.6" step="0.01" value={t.L}></div>
            <dl class="v-hud">
              <dt>Signal, Jundt at T</dt><dd id="p24v-fs">{I.fanHud.s}</dd>
              <dt>Idler, Jundt at T</dt><dd id="p24v-fi">{I.fanHud.i}</dd>
              <dt>Signal, Zelmon 21 &deg;C</dt><dd id="p24v-fzs">{I.fanHud.zs}</dd>
              <dt>Idler, Zelmon 21 &deg;C</dt><dd id="p24v-fzi">{I.fanHud.zi}</dd>
              <dt>Degenerate &Lambda;, Zelmon</dt><dd id="p24v-fdz">{I.fanHud.degZ}</dd>
              <dt>Degenerate &Lambda;, Jundt at T</dt><dd id="p24v-fdj">{I.fanHud.degJ}</dd>
              <dt>Signal shift per kelvin</dt><dd id="p24v-fds">{I.fanHud.dS}</dd>
              <dt>Idler shift per kelvin</dt><dd id="p24v-fdi">{I.fanHud.dI}</dd>
              <dt>|1 &minus; &lambda;<sub>p</sub>/&lambda;<sub>s</sub> &minus; &lambda;<sub>p</sub>/&lambda;<sub>i</sub>|</dt><dd id="p24v-fres">{I.fanHud.res}</dd>
            </dl>
            <p class="v-cap">Drag the temperature: the bold curve swings through the fan (20 to 250 &deg;C, faint), signal and idler move in opposite directions, and the bar below keeps &nu;<sub>s</sub> + &nu;<sub>i</sub> = &nu;<sub>p</sub>. Dotted: Zelmon 21 &deg;C. Curves end where the idler leaves the 5 &micro;m model window or at degeneracy (&lambda;<sub>s</sub> = &lambda;<sub>i</sub> = 2128 nm). Period thermal expansion not included.</p>
          </div>
        </div>
        <div class="v-prov">
          <span>n<sub>e</sub>(&lambda;, T): Jundt 1997 <Badge code="S" pop="r:jundt1997" /></span>
          <span>29.91 &micro;m: 1550 / 3393 nm at 21 &deg;C, Zelmon 1997 <Badge code="P-db" pop="r:zelmon1997" /> <Badge code="derived" pop="p24-der-tune" /></span>
          <span>temperature, period defaults <Badge code="template" pop="p24-tpl-tune" /></span>
          <span>all waves infrared: <span class="term" data-pop="v-false">false color</span>, hatched and dashed</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Conventions and error sources">
    <div class="sh"><h2 class="biref">L3 Conventions and error sources</h2><span class="meta">coupling-rate factors, quoted powers, resonance shifts</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx p24-conv">
          <thead><tr><th>Hamiltonian</th><th>Threshold intracavity pump</th><th>Relative to eq. 2.15 at equal numerical g</th></tr></thead>
          <tbody>
            <tr><td>g(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub>a<sub>i</sub> + h.c.), non-degenerate</td><td>&kappa;<sub>s</sub>&kappa;<sub>i</sub>/4g<sup>2</sup></td><td>eq. 2.15</td></tr>
            <tr><td>(g/2)(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub><sup>2</sup> + h.c.), degenerate</td><td>&kappa;<sub>s</sub><sup>2</sup>/4g<sup>2</sup></td><td>same form, &kappa;<sub>i</sub> &rarr; &kappa;<sub>s</sub> <Badge code="derived" pop="p24-der-conv" /></td></tr>
            <tr><td>g(a<sub>p</sub><sup>&dagger;</sup>a<sub>s</sub><sup>2</sup> + h.c.), degenerate</td><td>&kappa;<sub>s</sub><sup>2</sup>/16g<sup>2</sup></td><td>4&times; lower <Badge code="derived" pop="p24-der-conv" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="tx">Eq. 2.15 uses energy decay rates and a non-degenerate Hamiltonian. Published g values are compared only after conversion to one Hamiltonian.</p>
      <p class="tx">Threshold is quoted as on-chip pump power in the bus waveguide; fiber-coupled thresholds include facet loss.</p>
      <p class="tx">In a doubly or triply resonant OPO, signal and idler must both sit on resonances. With unequal free spectral ranges the oscillation hops between clusters of mode pairs as the pump tunes; this is one way a pump change of hundreds of MHz can move the emission by &gt; 1 THz <Badge code="reported" pop="r:mckenna2022" /> (mechanism as interpreted here).</p>
      <p class="tx">Photorefraction shifts resonances with power (blue shift; chapter 04) and competes with the thermal red shift during threshold sweeps; cladding removal mitigates it in TFLN rings <Badge code="reported" pop="r:xu2021" />.</p>
      <p class="tx">Review: integrated PPLN OPOs, CW vs femtosecond pumping, sub-&micro;m poling for mirrorless OPOs <span class="term" data-pop="r:wang2026apr">(Wang et al. 2026)</span>.</p>
    </div>
  </section>

  <SectionEnd slug="parametric" refs={data.content.refList} />
</ChapterPage>
