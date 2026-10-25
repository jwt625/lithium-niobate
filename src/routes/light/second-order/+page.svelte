<!-- Chapter 2.3 Second-order nonlinear optics: L1 phenomenon (SHG along the crystal), L2 quantitative model (d tensor, d values as a labelled spread, field mapping, phase matching, QPM periods, eq. 2.13 over the d33 spread,
     measured efficiencies, acceptance bandwidths, phase-matching calculator), L3 normalizations and conventions (efficiency ledger, overlap, coupled-mode equations, error sources). Text and numbers: content/chapters/02-light. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/second-order.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { F23_POPS } from "$lib/figures/light/f23-pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { logMap } from "$lib/figures/light/ctl";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";
  import { mount6 } from "$lib/figures/light/f23-dtensor";
  import { mount7 } from "$lib/figures/light/f23-pm";
  import { mount8, ETA } from "$lib/figures/light/f23-shg";
  import { mount9, mountSort, MEAS } from "$lib/figures/light/f23-ledger";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  usePops(F23_POPS);
  usePops(data.content.pops);
  const I = $derived(data.init);
  const T7 = $derived(data.init.t7);
  // default slider positions (log-mapped sliders use integer steps 0..1000)
  const SP = { p8: logMap(1e-3, 10).from(0.01), l8: logMap(0.1, 50).from(10), l7: logMap(0.1, 50).from(10), e9: logMap(100, 40000).from(2600), l9: logMap(0.1, 50).from(5), q9: logMap(1e4, 1e8).from(1e5), g9: logMap(0.1, 10).from(1) };
  const dn1064 = $derived((Number(T7.dn1064) * 1e3).toFixed(2));

  /** VISUAL tab groups: panes share one grid cell (inactive ones hidden, still sized), so switching moves nothing. */
  function mountTabs(root: HTMLElement): () => void {
    const offs: (() => void)[] = [];
    for (const g of root.querySelectorAll<HTMLElement>(".f23-tabs")) {
      const btns = [...g.querySelectorAll<HTMLButtonElement>(":scope > .f23-tabbar button")];
      for (const b of btns) {
        const h = (): void => { g.dataset.tab = b.dataset.v ?? "0"; for (const x of btns) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); } };
        b.addEventListener("click", h);
        offs.push(() => b.removeEventListener("click", h));
      }
    }
    return () => offs.forEach((f) => f());
  }

  let first: HTMLElement;
  onMount(() => {
    const root = first.closest("main") as HTMLElement;
    const offs = [installRangeFill(), mount8(root, whenVisual), mount6(root, whenVisual), mount7(root, whenVisual), mount9(root, whenVisual), mountSort(root), mountTabs(root)];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("second-order")} title="2.3 Second-order nonlinear optics"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Normalizations and conventions" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={first}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">SHG 1550 &rarr; 775 nm, bulk CLN and TFLN</span></div>
    <div class="body">
      <p class="tx">The polarization of LN contains a term quadratic in the optical field (<span class="term" data-pop="g:second-order-susceptibility">&chi;<sup>(2)</sup></span>), so two photons merge into one at the sum frequency (<span class="term" data-pop="g:sfg">SFG</span>; <span class="term" data-pop="g:shg">SHG</span> when both are equal) or one photon splits into two (<span class="term" data-pop="g:dfg">DFG</span>; <span class="term" data-pop="g:opa">parametric amplification</span>). The largest coefficient, <i>d</i><sub>33</sub>, couples fields all polarized along <i>c</i>.</p>
      <p class="tx">Dispersion makes 775 nm light slower than 1550 nm light in bulk <span class="term" data-pop="g:cln-congruent-ln">CLN</span>: the second harmonic slips out of phase after the <span class="term" data-pop="g:coherence-length">coherence length</span> <i>L</i><sub>c</sub> = &pi;/&Delta;<i>k</i> = 9.495 &micro;m <Badge code="derived" pop="f23-qpm" /> and converts back. Reversing the ferroelectric domain every <i>L</i><sub>c</sub> (period &Lambda; = 18.99 &micro;m, <span class="term" data-pop="g:ppln">PPLN</span>) restarts the growth in every domain, and the harmonic power grows as <i>L</i><sup>2</sup>. In a <span class="term" data-pop="g:lnoi-tfln">TFLN</span> waveguide etched from a sub-micrometre film the period is near 4 &micro;m, set by waveguide dispersion <Badge code="reported" pop="r:wang2018optica" />; measured normalized efficiencies reach thousands of percent per watt per square centimetre (L2).</p>

      <!-- SHG along z, TECH -->
      <div class="panel f23p" id="f08" data-variant="tech" data-pair="f08">
        <div class="ph"><span>SHG along z, 1550 &rarr; 775 nm, e + e &rarr; e</span><span>RK4 &middot; eq. 2.13 &middot; tanh&sup2;</span></div>
        <div class="lt-split">
          <div>
            <pre class="ascii" id="f08-ascii">{I.f8.ascii}</pre>
            <div class="plotbox" id="f08-plot">{@html I.f8.plot}</div>
            <div class="lgd"><span><span class="k"></span>RK4, coupled-mode equations</span><span><span class="k s2"></span>undepleted, eq. 2.13</span><span><span class="k s3"></span>P<sub>0</sub> tanh&sup2;, QPM</span></div>
          </div>
          <div>
            <div class="ctl seg2"><span class="lbl">Poling</span><div class="seg" id="f08-pol" role="group" aria-label="Poling"><button data-v="none">none</button><button data-v="qpm" class="on">QPM</button></div></div>
            <div class="ctl seg2"><span class="lbl">Unpoled &Delta;k</span><div class="seg" id="f08-grat" role="group" aria-label="Phase mismatch without poling"><button data-v="bulk" class="on">bulk 2&pi;/18.99 &micro;m</button><button data-v="tfln">TFLN 2&pi;/4 &micro;m</button></div></div>
            <div class="ctl seg2"><span class="lbl">&eta;<sub>norm</sub>, %/W/cm&sup2;</span><div class="seg" id="f08-eta" role="group" aria-label="Measured normalized efficiency">{#each ETA as e, i (e.id)}<button data-v={String(i)} class={i === 1 ? "on" : ""} title={e.who}>{e.v}</button>{/each}</div></div>
            <div class="ctl"><label for="f08-p">Pump P<sub>&omega;</sub>(0)</label><input id="f08-p" type="range" min="0" max="1000" step="1" value={SP.p8}><output id="f08-p-o" for="f08-p">{I.fmt8.P}</output></div>
            <div class="ctl"><label for="f08-l">Length L</label><input id="f08-l" type="range" min="0" max="1000" step="1" value={SP.l8}><output id="f08-l-o" for="f08-l">{I.fmt8.L}</output></div>
            <div class="ctl"><label for="f08-d">Duty cycle D</label><input id="f08-d" type="range" min="0.1" max="0.9" step="0.01" value="0.5"><output id="f08-d-o" for="f08-d">{I.fmt8.D}</output></div>
            <div class="ctl"><label for="f08-a">Loss, both waves</label><input id="f08-a" type="range" min="0" max="3" step="0.05" value="0"><output id="f08-a-o" for="f08-a">{I.fmt8.loss}</output></div>
            <div class="ctl seg2"><span class="lbl">P axis</span><div class="seg" id="f08-ax" role="group" aria-label="Power axis"><button data-v="lin" class="on">lin</button><button data-v="log">log</button></div></div>
            <table class="ro f23ro" id="f08-ro">{@html I.f8.ro}</table>
          </div>
        </div>
        <div class="pf">&eta;<sub>norm</sub>: measured values (L2 table) <Badge code="reported" pop="r:wang2018optica" />; loss and D are inputs <Badge code="template" pop="f23-f08" />. QPM: domain-averaged coupling. Unpoled: full d<sub>33</sub> with the bulk or TFLN mismatch; the harmonic oscillates with period 2L<sub>c</sub>. Strip: 1 character = L/60; &plusmn; = domains finer than one character.</div>
      </div>

      <!-- SHG along z, VISUAL -->
      <div class="v-f23 f23-2c" id="v08" data-variant="visual" data-pair="f08">
        <div class="f23-main">
          <div class="v-stage f23-vst"><div class="f23-mag" id="v08-mag">{@html I.f8.mag}</div><div id="v08-stage">{@html I.f8.stage}</div></div>
          <p class="v-cap"><b>Drawn</b>top: the guide from z = 0 at 2 px per &micro;m (at most the first 450 &micro;m); middle: the whole guide, 775 nm glow scaled to its maximum in each view; dashed: 1550 nm pump, width = remaining power. Poling off: the glow pulses every coherence length. Periodic poling: it grows monotonically; at watts the curve bends from L&sup2; to tanh&sup2; as the pump thins. Curves: RK4 of the coupled-mode equations (solid), undepleted eq. 2.13 (dashed), P<sub>0</sub> tanh&sup2; (dotted, QPM). QPM uses the domain-averaged coupling &kappa;&sup2; = &eta;<sub>norm</sub> sin&sup2;(&pi;D); without poling the full d<sub>33</sub> acts with the bulk or TFLN mismatch. Loss and duty cycle are inputs <Badge code="template" pop="f23-f08" />.</p>
          <div class="v-prov">
          <span>&eta;<sub>norm</sub> measured <Badge code="reported" pop="r:wang2018optica" /></span>
          <span>curves: coupled-mode RK4, eq. 2.13, tanh&sup2; <Badge code="derived" pop="f23-f08" /></span>
          <span>pump 1550 nm: <span class="term" data-pop="v-false">false color</span>, dashed; SH 775 nm: deep red</span>
        </div>
        </div>
        <div class="f23-side">
          <div class="v-ctls">
          <div class="v-ctl"><span class="v-lab">Poling</span><div class="v-seg" id="v08-pol" role="group" aria-label="Poling"><button type="button" data-v="none">Off</button><button type="button" data-v="qpm" class="on">Periodic (QPM)</button></div></div>
          <div class="v-ctl"><span class="v-lab">Mismatch without poling</span><div class="v-seg" id="v08-grat" role="group" aria-label="Phase mismatch without poling"><button type="button" data-v="bulk" class="on">Bulk CLN</button><button type="button" data-v="tfln">TFLN</button></div></div>
          <div class="v-ctl"><span class="v-lab">Measured &eta;<sub>norm</sub>, %/W/cm&sup2;</span><div class="v-seg" id="v08-eta" role="group" aria-label="Measured normalized efficiency">{#each ETA as e, i (e.id)}<button type="button" data-v={String(i)} class={i === 1 ? "on" : ""} title={e.who}>{e.v}</button>{/each}</div></div>
          <div class="v-ctl"><span class="v-lab">Power axis</span><div class="v-seg" id="v08-ax" role="group" aria-label="Power axis"><button type="button" data-v="lin" class="on">Linear</button><button type="button" data-v="log">Log</button></div></div>
          <div class="v-ctl" style="--w:8ch"><label for="v08-p">Pump power</label><output id="v08-p-o" for="v08-p">{I.fmt8.P}</output><input id="v08-p" type="range" min="0" max="1000" step="1" value={SP.p8}></div>
          <div class="v-ctl" style="--w:8ch"><label for="v08-l">Length</label><output id="v08-l-o" for="v08-l">{I.fmt8.L}</output><input id="v08-l" type="range" min="0" max="1000" step="1" value={SP.l8}></div>
          <div class="v-ctl" style="--w:5ch"><label for="v08-d">Duty cycle</label><output id="v08-d-o" for="v08-d">{I.fmt8.D}</output><input id="v08-d" type="range" min="0.1" max="0.9" step="0.01" value="0.5"></div>
          <div class="v-ctl" style="--w:10ch"><label for="v08-a">Loss, both waves</label><output id="v08-a-o" for="v08-a">{I.fmt8.loss}</output><input id="v08-a" type="range" min="0" max="3" step="0.05" value="0"></div>
          </div>
          <dl class="v-hud" id="v08-hud">{@html I.f8.hud}</dl>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">3m d tensor, eq. 2.10 to 2.13</span></div>
    <div class="body">
      <div class="f23-tabs" data-tab="0">
        <div class="v-seg f23-tabbar" data-variant="visual" role="group" aria-label="d tensor"><button type="button" data-v="0" class="on">Tensor form</button><button type="button" data-v="1">Values (pm/V)</button><button type="button" data-v="2">Field mapping</button></div>
        <div class="f23-panes">
        <div class="f23-pane" data-i="0">
      <h3 class="h3">d tensor</h3>
      <p class="tx"><span class="term" data-pop="g:contracted-voigt-index">Contracted index</span> <i>l</i>: 1 = <i>xx</i>, 2 = <i>yy</i>, 3 = <i>zz</i>, 4 = <i>yz</i>, 5 = <i>xz</i>, 6 = <i>xy</i>. Point group 3m with <span class="term" data-pop="g:kleinman-symmetry">Kleinman symmetry</span> (d<sub>15</sub> = d<sub>24</sub> = d<sub>31</sub>; <span class="f23-ref" data-pop="r:kleinman1962">Kleinman 1962</span>):</p>
      <div class="eq"><math display="block"><mrow><mi>d</mi><mo>=</mo><mrow><mo>(</mo><mtable>
        <mtr><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd><mtd><msub><mi>d</mi><mn>31</mn></msub></mtd><mtd><mo>&minus;</mo><msub><mi>d</mi><mn>22</mn></msub></mtd></mtr>
        <mtr><mtd><mo>&minus;</mo><msub><mi>d</mi><mn>22</mn></msub></mtd><mtd><msub><mi>d</mi><mn>22</mn></msub></mtd><mtd><mn>0</mn></mtd><mtd><msub><mi>d</mi><mn>31</mn></msub></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd></mtr>
        <mtr><mtd><msub><mi>d</mi><mn>31</mn></msub></mtd><mtd><msub><mi>d</mi><mn>31</mn></msub></mtd><mtd><msub><mi>d</mi><mn>33</mn></msub></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd><mtd><mn>0</mn></mtd></mtr>
      </mtable><mo>)</mo></mrow></mrow></math><span class="eqn">(2.10)</span></div>
      <div class="eq"><math display="block"><mrow><msub><mi>P</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mn>2</mn><mi>&omega;</mi><mo stretchy="false">)</mo><mo>=</mo><mn>2</mn><msub><mi>&epsilon;</mi><mn>0</mn></msub><munder><mo>&sum;</mo><mi>l</mi></munder><msub><mi>d</mi><mrow><mi>i</mi><mi>l</mi></mrow></msub><msub><mrow><mo stretchy="false">(</mo><msubsup><mi>E</mi><mi>x</mi><mn>2</mn></msubsup><mo>,</mo><msubsup><mi>E</mi><mi>y</mi><mn>2</mn></msubsup><mo>,</mo><msubsup><mi>E</mi><mi>z</mi><mn>2</mn></msubsup><mo>,</mo><mn>2</mn><msub><mi>E</mi><mi>y</mi></msub><msub><mi>E</mi><mi>z</mi></msub><mo>,</mo><mn>2</mn><msub><mi>E</mi><mi>x</mi></msub><msub><mi>E</mi><mi>z</mi></msub><mo>,</mo><mn>2</mn><msub><mi>E</mi><mi>x</mi></msub><msub><mi>E</mi><mi>y</mi></msub><mo stretchy="false">)</mo></mrow><mi>l</mi></msub></mrow></math><span class="eqn">(2.11)</span></div>
      <p class="tx">Complex-amplitude convention of <span class="f23-ref" data-pop="r:boyd2008">Boyd 2008</span>; &chi;<sup>(2)</sup> = 2<i>d</i>. For two distinct input frequencies (SFG) the prefactor is 4&epsilon;<sub>0</sub>.</p>
        </div>
        <div class="f23-pane" data-i="1">
      <h3 class="h3">Values (pm/V)</h3>
      <p class="tx">No source held tabulates a post-1997 absolute d set: every value below is a legacy-scale compilation, a secondary table without per-cell references, or unverified. No set is used as default.</p>
      <div class="scrollx">
        <table class="idx f23t f23-dset">
          <thead><tr><th>Source</th><th>Fundamental</th><th class="r">d<sub>33</sub></th><th class="r">d<sub>31</sub></th><th class="r">d<sub>22</sub></th><th>Scale</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Volk &amp; Wohlecke Table 1.2 (CLN), citing Nikogosyan 2005</td><td>1.06 &micro;m</td><td class="num">34</td><td class="num">6</td><td class="num">3</td><td>legacy</td><td class="r"><Badge code="P-comp" pop="r:volk2008" /></td></tr>
            <tr><td class="h">same, near-SLN</td><td>1.06 &micro;m</td><td class="num">42</td><td class="num">5</td><td class="num">2.5</td><td>legacy</td><td class="r"><Badge code="P-comp" pop="r:volk2008" /></td></tr>
            <tr><td class="h">Zhu et al. review Table 1 (no per-cell reference)</td><td>1064 nm</td><td class="num">&minus;27.0</td><td class="num">&minus;4.3</td><td class="num">2.10</td><td>not stated</td><td class="r"><Badge code="S" pop="r:zhu2021" /></td></tr>
            <tr><td class="h">Shoji et al. 1997, absolute scale</td><td>1.064 &micro;m</td><td class="num">25.2 claimed</td><td class="num">about 4.6 claimed</td><td class="num">&ndash;</td><td>post-1997</td><td class="r"><Badge code="U" pop="r:shoji1997" /></td></tr>
            <tr><td class="h">Kitamoto et al. 1995, parametric fluorescence</td><td>488 / 532 nm pump</td><td class="num">&ndash;</td><td class="num">4.8 &plusmn; 0.5 / 4.3 &plusmn; 0.5 claimed</td><td class="num">&ndash;</td><td>post-1997 method</td><td class="r"><Badge code="U" pop="r:kitamoto1995" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Weis &amp; Gaylord 1985 has no SHG d table. The legacy d<sub>33</sub> = 34 pm/V is 35% above the claimed 25.2 pm/V <Badge code="U" pop="r:shoji1997" />, which attributes the older values to multiple-reflection errors (claim, abstract only). <span class="term" data-pop="g:millers-rule">Miller's rule</span> scales &chi;<sup>(2)</sup> with the product of the linear susceptibilities at the three frequencies; Shoji et al. report that it holds poorly for LN (claim) <Badge code="U" pop="r:shoji1997" />.</p>
        </div>
        <div class="f23-pane" data-i="2">
      <h3 class="h3">Field mapping (eq. 2.10, no further assumption)</h3>
      <div class="scrollx">
        <table class="idx f23t f23-map">
          <thead><tr><th>Cut, mode</th><th>Fields</th><th>Active coefficient</th><th>Phase matching</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:x-cut">x-cut</span>, TE, propagation y</td><td>E along z at &omega; and 2&omega;</td><td class="h">d<sub>33</sub></td><td>QPM, type 0 (e + e &rarr; e)</td></tr>
            <tr><td class="h"><span class="term" data-pop="g:z-cut">z-cut</span>, TM</td><td>E mostly along z</td><td class="h">d<sub>33</sub></td><td>QPM, type 0</td></tr>
            <tr><td class="h">z-cut, TE, in-plane field at &alpha; from x</td><td>E in xy</td><td>TE SH: &minus;2&epsilon;<sub>0</sub>d<sub>22</sub>E&sup2; sin 3&alpha;, largest for E along y (propagation x), zero for E along x (propagation y); TM SH via d<sub>31</sub></td><td>modal or QPM</td></tr>
            <tr><td class="h">bulk, type I (o + o &rarr; e)</td><td>ordinary inputs, no z component</td><td>d<sub>31</sub>, d<sub>22</sub> only</td><td>birefringent, angle-tuned</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine"><span class="term" data-pop="g:birefringent-phase-matching">Birefringent phase matching</span> never uses d<sub>33</sub>: ordinary inputs have no z component, so only the xx, yy, xy columns act.</p>
        </div>
        </div>
      </div>

      <!-- d tensor, TECH -->
      <div class="panel f23p" id="f06" data-variant="tech" data-pair="f06">
        <div class="ph"><span>d tensor: which coefficient a cut and polarization uses</span><span class="f23-slot" id="f06-sb">{@html I.f6.sb}</span></div>
        <div class="lt-split">
          <div>
            <div class="ctl seg2"><span class="lbl">Cut</span><div class="seg" id="f06-cut" role="group" aria-label="Cut"><button data-v="x" class="on">x-cut</button><button data-v="y">y-cut</button><button data-v="z">z-cut</button></div></div>
            <div class="ctl seg2"><span class="lbl">Input field</span><div class="seg" id="f06-pol" role="group" aria-label="Input polarization"><button data-v="te" class="on">TE</button><button data-v="tm">TM</button><button data-v="tetm">TE + TM (SFG)</button></div></div>
            <div class="ctl"><label for="f06-psi">Propagation in the plane</label><input id="f06-psi" type="range" min="0" max="180" step="1" value="0"><output id="f06-psi-o" for="f06-psi">{"  0°"}</output></div>
            <div class="ctl seg2"><span class="lbl">Coefficient set</span><div class="seg" id="f06-set" role="group" aria-label="Coefficient set"><button data-v="sym" class="on">symbolic</button><button data-v="volk">Volk CLN</button><button data-v="vsln">Volk near-SLN</button><button data-v="zhu">Zhu</button></div></div>
            <div class="scrollx"><table class="idx f23t f23-resp" id="f06-tab">{@html I.f6.tab}</table></div>
          </div>
          <div>
            <div class="scrollx f23-mxw"><table class="mx f23-mx" id="f06-mx" aria-label="3m d matrix, active coefficients inverted">{@html I.f6.mx}</table></div>
            <pre class="ascii" id="f06-ascii">{I.f6.ascii}</pre>
            <div class="f23-info" id="f06-info">{@html I.f6.info}</div>
          </div>
        </div>
        <div class="pf">Propagation angle from the first in-plane axis (x-cut: y; y-cut and z-cut: x) toward the second. TE: in-plane field perpendicular to k; TM: field along the wafer normal. z-cut TE puts E in the xy plane, the field of an ordinary wave in bulk. Inverted cells: coefficients the input drives. Rotating z-cut TE through 180&deg; never drives d<sub>33</sub>, and the TE response repeats every 120&deg;. Numbers: 1.06 &micro;m values of the selected set.</div>
      </div>

      <!-- d tensor, VISUAL -->
      <div class="v-f23 f23-2c" id="v06" data-variant="visual" data-pair="f06">
        <div class="f23-main">
          <div class="v-stage" id="v06-stage">{@html I.f6.stage}</div>
          <p class="v-cap">z-cut TE puts E in the xy plane, the field of an ordinary wave in bulk: rotating it through 180&deg; never drives d<sub>33</sub>, only d<sub>31</sub> and d<sub>22</sub>, and the TE response repeats every 120&deg;. x-cut TE is driven by d<sub>33</sub> alone. Propagation angle from the first in-plane axis (x-cut: y; y-cut and z-cut: x) toward the second; TE: in-plane field perpendicular to k; TM: field along the wafer normal. Numbers: 1.06 &micro;m values of the selected set.</p>
          <div class="v-prov">
          <span>input 1550 nm: <span class="term" data-pop="v-false">false color</span>, dashed, double arrow = oscillating field</span>
          <span>radiated P(2&omega;), 775 nm: deep red, drawn downstream along k; with symbols, one arrow per coefficient</span>
        </div>
        </div>
        <div class="f23-side">
          <div class="v-ctls">
          <div class="v-ctl"><span class="v-lab">Crystal cut</span><div class="v-seg" id="v06-cut" role="group" aria-label="Cut"><button type="button" data-v="x" class="on">x-cut</button><button type="button" data-v="y">y-cut</button><button type="button" data-v="z">z-cut</button></div></div>
          <div class="v-ctl"><span class="v-lab">Input field</span><div class="v-seg" id="v06-pol" role="group" aria-label="Input polarization"><button type="button" data-v="te" class="on">TE</button><button type="button" data-v="tm">TM</button><button type="button" data-v="tetm">TE + TM</button></div></div>
          <div class="v-ctl" style="--w:5ch"><label for="v06-psi">Propagation in the plane</label><output id="v06-psi-o" for="v06-psi">{"\u2007\u20070°"}</output><input id="v06-psi" type="range" min="0" max="180" step="1" value="0"></div>
          <div class="v-ctl"><span class="v-lab f23-labs">Coefficients <span class="f23-slot" id="v06-sb">{@html I.f6.sb}</span></span><div class="v-seg" id="v06-set" role="group" aria-label="Coefficient set"><button type="button" data-v="sym" class="on">Symbols</button><button type="button" data-v="volk">Volk CLN</button><button type="button" data-v="vsln">Volk SLN</button><button type="button" data-v="zhu">Zhu</button></div></div>
          </div>
          <dl class="v-hud f23-hud6" id="v06-hud">{@html I.f6.hud}</dl>
        </div>
      </div>

      <div class="f23-tabs" data-tab="0">
        <div class="v-seg f23-tabbar" data-variant="visual" role="group" aria-label="Phase matching and efficiency"><button type="button" data-v="0" class="on">Phase matching</button><button type="button" data-v="1">Quasi-phase matching</button><button type="button" data-v="2">Undepleted SHG</button><button type="button" data-v="3">Depletion, focusing</button><button type="button" data-v="4">Measured efficiencies</button><button type="button" data-v="5">Acceptance bandwidths</button></div>
        <div class="f23-panes">
        <div class="f23-pane" data-i="0">
      <h3 class="h3">Phase matching</h3>
      <p class="tx">Wave-vector mismatch with an <i>m</i>-th order grating of period &Lambda; (<span class="term" data-pop="g:phase-matching">phase matching</span> at &Delta;<i>k</i> = 0):</p>
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><mi>k</mi><mo>=</mo><msub><mi>k</mi><mn>3</mn></msub><mo>&minus;</mo><msub><mi>k</mi><mn>1</mn></msub><mo>&minus;</mo><msub><mi>k</mi><mn>2</mn></msub><mo>&minus;</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi><mi>m</mi></mrow><mi>&Lambda;</mi></mfrac></mrow></math><span class="eqn">(2.12)</span></div>
      <p class="tx"><b>Birefringent, type I SHG, bulk CLN, 21 &deg;C.</b> 1550 nm: &theta;<sub>pm</sub> = {T7.bpm[0].th}&deg; from <i>c</i>, SH <span class="term" data-pop="g:walk-off">walk-off</span> {T7.bpm[0].rho}&deg; <Badge code="derived" pop="f23-bpm" />; 2000 nm: {T7.bpm[1].th}&deg; <Badge code="derived" pop="f23-bpm" />. 1064 nm: no angle exists, since n<sub>e</sub>(532 nm) &minus; n<sub>o</sub>(1064 nm) = +{dn1064}&times;10<sup>&minus;3</sup> &gt; 0 <Badge code="derived" pop="f23-bpm" />; 1064 nm type-I SHG in CLN needs temperature tuning (noncritical phase matching).</p>
        </div>
        <div class="f23-pane" data-i="1">
      <p class="tx"><b><span class="term" data-pop="g:qpm">Quasi-phase matching</span>.</b> Order <i>m</i>, <span class="term" data-pop="g:duty-cycle">duty cycle</span> <i>D</i> (Fourier coefficient of the square-wave sign of d; form as in <span class="f23-ref" data-pop="r:fejer1992">Fejer et al. 1992</span>), so (2/&pi;) d<sub>33</sub> at <i>D</i> = 0.5, <i>m</i> = 1:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>d</mi><mi>eff</mi></msub><mo>=</mo><mfrac><mn>2</mn><mrow><mi>m</mi><mi>&pi;</mi></mrow></mfrac><msub><mi>d</mi><mn>33</mn></msub><mi>sin</mi><mo stretchy="false">(</mo><mi>m</mi><mi>&pi;</mi><mi>D</mi><mo stretchy="false">)</mo></mrow></math></div>
      <div class="scrollx">
        <table class="idx f23t f23-qpm">
          <thead><tr><th>Process, bulk CLN, e + e &rarr; e, 21 &deg;C</th><th class="r">&Lambda; (&micro;m)</th><th class="r">L<sub>c</sub> = &Lambda;/2 (&micro;m)</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each T7.qpm as r (r[0])}<tr><td class="h">{r[0]}</td><td class="num">{r[1]}</td><td class="num">{r[2]}</td><td class="r"><Badge code="derived" pop="f23-qpm" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Jundt n<sub>e</sub> at 24.5 &deg;C gives {T7.jundt245} &micro;m for 1550 nm SHG <Badge code="derived" pop="f23-jun" />. TFLN waveguides shift the period to a few &micro;m because n<sub>eff</sub> disperses differently from bulk n<sub>e</sub>; x-cut films have been poled at 600 nm <Badge code="reported" pop="r:zhao2020jap" /> and 747 nm periods <Badge code="reported" pop="r:nagy2020" />. Early thin-film PPLN converters: <span class="f23-ref" data-pop="r:chang2016">Chang et al. 2016</span>.</p>
        </div>
        <div class="f23-pane" data-i="2">
      <h3 class="h3">Undepleted and depleted SHG</h3>
      <div class="eq"><math display="block"><mrow><msub><mi>P</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><mo>=</mo><msub><mi>&eta;</mi><mi>norm</mi></msub><msubsup><mi>P</mi><mi>&omega;</mi><mn>2</mn></msubsup><msup><mi>L</mi><mn>2</mn></msup><msup><mi>sinc</mi><mn>2</mn></msup><mo>(</mo><mfrac><mrow><mi>&Delta;</mi><mi>k</mi><mi>L</mi></mrow><mn>2</mn></mfrac><mo>)</mo><mo>,</mo><mspace width="1.2em"/><msub><mi>&eta;</mi><mi>norm</mi></msub><mo>=</mo><mfrac><mrow><mn>8</mn><msup><mi>&pi;</mi><mn>2</mn></msup><msubsup><mi>d</mi><mi>eff</mi><mn>2</mn></msubsup></mrow><mrow><msub><mi>&epsilon;</mi><mn>0</mn></msub><mi>c</mi><msubsup><mi>n</mi><mi>&omega;</mi><mn>2</mn></msubsup><msub><mi>n</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><msubsup><mi>&lambda;</mi><mi>&omega;</mi><mn>2</mn></msubsup><msub><mi>A</mi><mi>eff</mi></msub></mrow></mfrac></mrow></math><span class="eqn">(2.13)</span></div>
      <p class="tx"><span class="term" data-pop="g:normalized-conversion-efficiency">&eta;<sub>norm</sub></span> computed from d<sub>33</sub> inherits the d spread. Eq. 2.13 at 1550 nm with bulk indices, <span class="term" data-pop="g:effective-area">A<sub>eff</sub></span> = 1 &micro;m&sup2; <Badge code="template" pop="f23-aeff" />, d<sub>eff</sub> = (2/&pi;) d<sub>33</sub>:</p>
      <div class="scrollx">
        <table class="idx f23t f23-eta">
          <thead><tr><th>d<sub>33</sub> source</th><th class="r">d<sub>33</sub> (pm/V)</th><th class="r">d<sub>eff</sub> (pm/V)</th><th class="r">&eta;<sub>norm</sub> (%/W/cm&sup2;)</th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr><td class="h">Volk &amp; Wohlecke, CLN, legacy scale <Badge code="P-comp" pop="r:volk2008" /></td><td class="num">{I.eta[0].d33}</td><td class="num">{I.eta[0].deff}</td><td class="num">{I.eta[0].eta}</td><td class="r"><Badge code="derived" pop="f23-eta" /></td></tr>
            <tr><td class="h">same, near-SLN <Badge code="P-comp" pop="r:volk2008" /></td><td class="num">{I.eta[1].d33}</td><td class="num">{I.eta[1].deff}</td><td class="num">{I.eta[1].eta}</td><td class="r"><Badge code="derived" pop="f23-eta" /></td></tr>
            <tr><td class="h">Zhu et al. review, |d<sub>33</sub>| <Badge code="S" pop="r:zhu2021" /></td><td class="num">{I.eta[2].d33}</td><td class="num">{I.eta[2].deff}</td><td class="num">{I.eta[2].eta}</td><td class="r"><Badge code="derived" pop="f23-eta" /></td></tr>
            <tr><td class="h">Shoji et al. 1997, claimed <Badge code="U" pop="r:shoji1997" /></td><td class="num">{I.eta[3].d33} claimed</td><td class="num">{I.eta[3].deff}</td><td class="num">{I.eta[3].eta} claimed</td><td class="r"><Badge code="U" pop="r:shoji1997" /></td></tr>
          </tbody>
        </table>
      </div>
        </div>
        <div class="f23-pane" data-i="3">
      <p class="tx">Depleted, at &Delta;<i>k</i> = 0 (<span class="f23-ref" data-pop="r:armstrong1962">Armstrong et al. 1962</span>):</p>
      <div class="eq"><math display="block"><mrow><msub><mi>P</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><mo>=</mo><msub><mi>P</mi><mn>0</mn></msub><msup><mi>tanh</mi><mn>2</mn></msup><mo>(</mo><msqrt><mrow><msub><mi>&eta;</mi><mi>norm</mi></msub><msub><mi>P</mi><mn>0</mn></msub></mrow></msqrt><mi>L</mi><mo>)</mo></mrow></math></div>
      <p class="tx">Bulk focusing cannot reach the <i>L</i><sup>2</sup> law: a Gaussian beam diffracts, the optimum confocal parameter is <i>b</i> = <i>L</i>/2.84 <Badge code="reported" pop="r:boydkleinman1968" />, and <i>P</i><sub>2&omega;</sub> then grows only linearly in <i>L</i>. Waveguides hold <i>A</i><sub>eff</sub> fixed over centimetres, hence the <i>L</i><sup>2</sup> law and the 1/<i>A</i><sub>eff</sub> gain.</p>
        </div>
        <div class="f23-pane" data-i="4">
      <h3 class="h3">Measured normalized efficiencies</h3>
      <div class="f23-sorth"><span class="lbl">Sort</span><div class="seg" id="f23-sort" role="group" aria-label="Sort the table"><button data-v="list" class="on">as listed</button><button data-v="date">date</button><button data-v="value">value within normalization</button></div></div>
      <div class="scrollx">
        <table class="idx f23t f23-meas">
          <thead><tr><th>Device</th><th>Value</th><th>Normalization</th><th>Date</th><th class="r">Status</th></tr></thead>
          <tbody id="f23-meas-b" data-free>
            {#each MEAS as m, i (m.pop + m.date + i)}<tr data-i={i}><td class="h">{@html m.dev}</td><td class="num l">{m.val}</td><td>{m.norm}</td><td class="num l">{m.date}</td><td class="r"><Badge code="reported" pop={m.pop} /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Waveguides: %/W/cm&sup2; = P<sub>2&omega;</sub>/(P<sub>&omega;</sub>&sup2;L&sup2;); rings: %/W. The two units are not convertible without a model (L3). Dates: issue dates.</p>
        </div>
        <div class="f23-pane" data-i="5">
      <h3 class="h3"><span class="term" data-pop="f23-acc">Acceptance bandwidths</span></h3>
      <p class="tx">sinc&sup2;(<i>x</i>/2) falls to one half at <i>x</i> = &plusmn;2.783, so the full width at half maximum in any parameter <i>q</i> is</p>
      <div class="eq"><math display="block"><mrow><mi>&delta;</mi><mi>q</mi><mo>=</mo><mfrac><mrow><mn>2</mn><mo>&times;</mo><mn>2.783</mn></mrow><mrow><mi>L</mi><mo>|</mo><mo>&part;</mo><mi>&Delta;</mi><mi>k</mi><mo>/</mo><mo>&part;</mo><mi>q</mi><mo>|</mo></mrow></mfrac><mo>=</mo><mfrac><mn>5.566</mn><mrow><mi>L</mi><mo>|</mo><mo>&part;</mo><mi>&Delta;</mi><mi>k</mi><mo>/</mo><mo>&part;</mo><mi>q</mi><mo>|</mo></mrow></mfrac></mrow></math></div>
      <div class="scrollx">
        <table class="idx f23t f23-acc">
          <thead><tr><th>SHG pump, bulk CLN, first-order QPM</th><th class="r">FWHM in &lambda;<sub>&omega;</sub> &times; L, Zelmon 21 &deg;C (nm cm)</th><th class="r">FWHM in T &times; L, Jundt 25 &deg;C (K cm)</th><th class="r">d&lambda;<sub>&omega;</sub>/dT, Jundt 25 &deg;C (nm/K)</th></tr></thead>
          <tbody>
            {#each T7.acc as a (a.pump)}<tr><td class="h">{a.pump}</td><td class="num">{a.fwL} <Badge code="derived" pop="f23-acc" /></td><td class="num">{a.fwT} <Badge code="derived" pop="f23-jun" /></td><td class="num">{a.tune} <Badge code="derived" pop="f23-jun" /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Thermal expansion of the period not included. The temperature acceptance shifts with the reference temperature: 1550 nm SHG {T7.acc[1].fwT245} K cm at 24.5 &deg;C, {T7.acc[1].fwT21} K cm at 21 &deg;C <Badge code="derived" pop="f23-jun" />.</p>
      <p class="tx"><span class="term" data-pop="g:group-velocity-mismatch">Group-velocity mismatch</span>, bulk, e-polarized 1550/775 nm: &Delta;n<sub>g</sub> = {T7.dng}, {T7.gvm} fs/mm <Badge code="derived" pop="f23-acc" />. Comparison with a TFLN device: Zhao et al. report a 1 nm linewidth for 5 mm and 0.1 nm/&deg;C tuning <Badge code="reported" pop="r:zhao2020oe" />; bulk CLN scaled to 5 mm gives {T7.zhao5mm} nm <Badge code="derived" pop="f23-acc" /> and 0.115 nm/K <Badge code="derived" pop="f23-jun" />. Waveguide dispersion lets nanophotonic PPLN cancel group-velocity mismatch and run femtosecond SHG with &lt; 100 fJ <Badge code="reported" pop="r:jankowski2020" />.</p>
        </div>
        </div>
      </div>

      <!-- phase matching, TECH -->
      <div class="panel f23p" id="f07" data-variant="tech" data-pair="f07">
        <div class="ph"><span>Phase matching, bulk CLN, eq. 2.12</span><span>e + e &rarr; e QPM; o + o &rarr; e BPM</span></div>
        <div class="lt-split">
          <div>
            <div class="ctl seg2"><span class="lbl">Pump (SHG)</span><div class="seg" id="f07-pump" role="group" aria-label="Pump wavelength"><button data-v="1.064">1064 nm</button><button data-v="1.55" class="on">1550 nm</button></div></div>
            <div class="ctl seg2"><span class="lbl">Process</span><div class="seg" id="f07-proc" role="group" aria-label="Process"><button data-v="shg" class="on">SHG</button><button data-v="sfg">SFG</button><button data-v="dfg">DFG</button></div></div>
            <div class="ctl"><label for="f07-l1">&lambda;<sub>1</sub></label><input id="f07-l1" type="range" min="0.4" max="5" step="0.001" value="1.55"><output id="f07-l1-o" for="f07-l1">{I.fmt7.l1}</output></div>
            <div class="ctl"><label for="f07-l2">&lambda;<sub>2</sub> (SFG, DFG)</label><input id="f07-l2" type="range" min="0.4" max="5" step="0.001" value="1.064"><output id="f07-l2-o" for="f07-l2">{I.fmt7.l2}</output></div>
            <div class="ctl seg2"><span class="lbl">QPM order m</span><div class="seg" id="f07-m" role="group" aria-label="QPM order"><button data-v="1" class="on">1</button><button data-v="3">3</button><button data-v="5">5</button></div></div>
            <div class="ctl"><label for="f07-d">Duty cycle D</label><input id="f07-d" type="range" min="0.1" max="0.9" step="0.01" value="0.5"><output id="f07-d-o" for="f07-d">{I.fmt7.D}</output></div>
            <div class="ctl"><label for="f07-l">Length L</label><input id="f07-l" type="range" min="0" max="1000" step="1" value={SP.l7}><output id="f07-l-o" for="f07-l">{I.fmt7.L}</output></div>
            <div class="ctl"><label for="f07-t">Operating T</label><input id="f07-t" type="range" min="20" max="250" step="0.5" value="40"><output id="f07-t-o" for="f07-t">{I.fmt7.T}</output></div>
            <div class="ctl"><label for="f07-dl">Period offset &Delta;&Lambda;</label><input id="f07-dl" type="range" min="-100" max="100" step="0.5" value="0"><output id="f07-dl-o" for="f07-dl">{I.fmt7.dL}</output></div>
            <div class="ctl seg2"><span class="lbl">n<sub>e</sub> for &Lambda;</span><div class="seg" id="f07-model" role="group" aria-label="Index model for the period"><button data-v="zel" class="on">Zelmon 21 &deg;C</button><button data-v="jun">Jundt at T</button></div></div>
            <table class="ro f23ro" id="f07-ro">{@html I.f7.ro}</table>
          </div>
          <div>
            <div class="ctl seg2 f23-axc"><span class="lbl">Curve versus</span><div class="seg" id="f07-ax" role="group" aria-label="Phase-matching curve versus"><button data-v="lam">pump &lambda;</button><button data-v="T" class="on">temperature</button><button data-v="per">period offset</button></div></div>
            <div class="plotbox" id="f07-plots">{@html I.f7.plots}</div>
            <pre class="ascii" id="f07-ascii">{I.f7.ascii}</pre>
          </div>
        </div>
        <div class="pf">&lambda;<sub>1</sub>: fundamental (SHG), first input (SFG), pump (DFG); &lambda;<sub>2</sub>: second input (SFG), signal (DFG, idler from energy conservation). Fixed grating &Lambda;<sub>g</sub> = m&Lambda;<sub>1</sub>(&lambda;<sub>&omega;</sub>, 40 &deg;C, Jundt) + &Delta;&Lambda;, operated at T: the curve shows sinc&sup2;(&Delta;kL/2) of that grating versus the selected parameter, band = FWHM, marker = operating point; the bar shows the generated SH power relative to a matched first-order grating with D = 0.5 <Badge code="derived" pop="f23-det" />. Jundt n<sub>e</sub> is defined from 20 to 250 &deg;C, so a curve ends where T leaves that window. Period expansion with T not included. BPM angle: Zelmon 21 &deg;C. TFLN strip: reported period <Badge code="reported" pop="r:wang2018optica" />.</div>
      </div>

      <!-- phase matching, VISUAL -->
      <div class="v-f23 f23-2c" id="v07" data-variant="visual" data-pair="f07">
        <div class="f23-main">
          <div class="v-stage f23-vst"><div class="f23-strips" id="v07-strips">{@html I.f7.strips}</div><div id="v07-stage">{@html I.f7.stage}</div></div>
          <p class="v-cap"><b>Drawn</b>domains at 2 px per &micro;m: the computed bulk period (1550 nm SHG: 38 px) above the reported TFLN period (8 px). Below, a fixed grating &Lambda;<sub>g</sub> = m&Lambda;<sub>1</sub>(40 &deg;C, Jundt) + &Delta;&Lambda;: the generated beam, in the color of its wavelength, is as bright as sinc&sup2;(&Delta;kL/2) allows; heat the crystal or offset the period and it fades, then flickers through the side lobes. The curve shows the same sinc&sup2; versus the selected parameter, area inside the FWHM filled, diamond = operating point. First wavelength: fundamental (SHG), first input (SFG) or pump (DFG); second: second input (SFG) or signal (DFG, idler from energy conservation). Curve and beam: Jundt n<sub>e</sub>, defined from 20 to 250 &deg;C, so a curve ends where T leaves that window; brightness relative to a matched first-order grating with D = 0.5. Period expansion with T not included. Type-I angle: Zelmon 21 &deg;C.</p>
          <div class="v-prov">
          <span>periods, angles, bandwidths <Badge code="derived" pop="f23-qpm" /></span>
          <span>temperature values: Jundt <Badge code="derived" pop="f23-jun" /></span>
          <span>detuned beam and curve <Badge code="derived" pop="f23-det" /></span>
          <span>TFLN period <Badge code="reported" pop="r:wang2018optica" /></span>
          <span>IR: <span class="term" data-pop="v-false">false color</span>, dashed</span>
        </div>
        </div>
        <div class="f23-side">
          <div class="v-ctls">
            <div class="v-ctl"><span class="v-lab">Pump, SHG</span><div class="v-seg" id="v07-pump" role="group" aria-label="Pump wavelength"><button type="button" data-v="1.064">1064 nm</button><button type="button" data-v="1.55" class="on">1550 nm</button></div></div>
            <div class="v-ctl"><span class="v-lab">Process</span><div class="v-seg" id="v07-proc" role="group" aria-label="Process"><button type="button" data-v="shg" class="on">SHG</button><button type="button" data-v="sfg">SFG</button><button type="button" data-v="dfg">DFG</button></div></div>
            <div class="v-ctl" style="--w:9ch"><label for="v07-l1">Fundamental, input 1 or pump</label><output id="v07-l1-o" for="v07-l1">{I.fmt7.l1}</output><input id="v07-l1" type="range" min="0.4" max="5" step="0.001" value="1.55"></div>
            <div class="v-ctl" style="--w:9ch"><label for="v07-l2">Input 2 or signal</label><output id="v07-l2-o" for="v07-l2">{I.fmt7.l2}</output><input id="v07-l2" type="range" min="0.4" max="5" step="0.001" value="1.064"></div>
            <div class="v-ctl"><span class="v-lab">QPM order</span><div class="v-seg" id="v07-m" role="group" aria-label="QPM order"><button type="button" data-v="1" class="on">1st</button><button type="button" data-v="3">3rd</button><button type="button" data-v="5">5th</button></div></div>
            <div class="v-ctl" style="--w:5ch"><label for="v07-d">Duty cycle</label><output id="v07-d-o" for="v07-d">{I.fmt7.D}</output><input id="v07-d" type="range" min="0.1" max="0.9" step="0.01" value="0.5"></div>
            <div class="v-ctl" style="--w:8ch"><label for="v07-l">Crystal length</label><output id="v07-l-o" for="v07-l">{I.fmt7.L}</output><input id="v07-l" type="range" min="0" max="1000" step="1" value={SP.l7}></div>
            <div class="v-ctl" style="--w:8ch"><label for="v07-t">Operating temperature</label><output id="v07-t-o" for="v07-t">{I.fmt7.T}</output><input id="v07-t" type="range" min="20" max="250" step="0.5" value="40"></div>
            <div class="v-ctl" style="--w:9ch"><label for="v07-dl">Period offset &Delta;&Lambda;</label><output id="v07-dl-o" for="v07-dl">{I.fmt7.dL}</output><input id="v07-dl" type="range" min="-100" max="100" step="0.5" value="0"></div>
            <div class="v-ctl"><span class="v-lab">Index model for the period</span><div class="v-seg" id="v07-model" role="group" aria-label="Index model"><button type="button" data-v="zel" class="on">Zelmon 21 &deg;C</button><button type="button" data-v="jun">Jundt at T</button></div></div>
            <div class="v-ctl"><span class="v-lab">Curve versus</span><div class="v-seg" id="v07-ax" role="group" aria-label="Phase-matching curve versus"><button type="button" data-v="lam">Pump &lambda;</button><button type="button" data-v="T" class="on">Temperature</button><button type="button" data-v="per">Period</button></div></div>
          </div>
          <dl class="v-hud" id="v07-hud">{@html I.f7.hud}</dl>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Normalizations and conventions">
    <div class="sh"><h2 class="biref">L3 Normalizations and conventions</h2><span class="meta">%/W/cm&sup2;, %/W, absolute %, pulse energy</span></div>
    <div class="body">
      <div class="f23-tabs" data-tab="0">
        <div class="v-seg f23-tabbar" data-variant="visual" role="group" aria-label="Normalizations and conventions"><button type="button" data-v="0" class="on">Normalizations</button><button type="button" data-v="1">Ring build-up</button><button type="button" data-v="2">Overlap</button><button type="button" data-v="3">Coupled-mode equations</button><button type="button" data-v="4">Error sources</button></div>
        <div class="f23-panes">
        <div class="f23-pane" data-i="0">
      <h3 class="h3">Why the efficiency numbers do not compare directly</h3>
      <div class="scrollx">
        <table class="idx f23t f23-norm">
          <thead><tr><th>Normalization</th><th>Definition</th><th>Valid when</th><th>Breaks when</th></tr></thead>
          <tbody>
            <tr><td class="h">%/W/cm&sup2; (&eta;<sub>norm</sub>)</td><td>P<sub>2&omega;</sub>/(P<sub>&omega;</sub>&sup2;L&sup2;), low-power slope, phase matched</td><td>uniform QPM, no loss, undepleted; on-chip powers</td><td>nonuniform film or poling (effective length &lt; L, so &eta;<sub>norm</sub> falls with L); loss; quoted with fiber-coupled powers</td></tr>
            <tr><td class="h">%/W</td><td>P<sub>2&omega;</sub>/P<sub>&omega;</sub>&sup2; for one device</td><td>rings and resonators; also whole waveguides</td><td>compares devices of different length or Q; a ring value scales with resonant build-up</td></tr>
            <tr><td class="h">absolute %</td><td>P<sub>2&omega;</sub>/P<sub>&omega;</sub> at a stated pump</td><td>high-power, depleted regime</td><td>says nothing about low-power efficiency</td></tr>
            <tr><td class="h">pulse energy (fJ, pJ)</td><td>energy at which a stated conversion or gain is reached</td><td>femtosecond, dispersion-engineered devices</td><td>not convertible to CW numbers without the pulse shape</td></tr>
          </tbody>
        </table>
      </div>
        </div>
        <div class="f23-pane" data-i="1">
      <p class="tx">Ring build-up from coupled-mode theory, H/&#295; = g(a&sup2;b<sup>&dagger;</sup> + h.c.), energy decay rates &kappa;<sub>a</sub> (fundamental), &kappa;<sub>b</sub> (SH), external rates &kappa;<sub>a,ex</sub>, &kappa;<sub>b,ex</sub>, zero detuning <Badge code="derived" pop="f23-ring" />:</p>
      <div class="eq"><math display="block"><mrow><mfrac><msub><mi>P</mi><mi>b</mi></msub><msubsup><mi>P</mi><mi>a</mi><mn>2</mn></msubsup></mfrac><mo>=</mo><mfrac><mrow><mn>64</mn><msup><mi>g</mi><mn>2</mn></msup><msubsup><mi>&kappa;</mi><mrow><mi>a</mi><mo>,</mo><mi>ex</mi></mrow><mn>2</mn></msubsup><msub><mi>&kappa;</mi><mrow><mi>b</mi><mo>,</mo><mi>ex</mi></mrow></msub><msub><mi>&omega;</mi><mi>b</mi></msub></mrow><mrow><mi>&#295;</mi><msubsup><mi>&omega;</mi><mi>a</mi><mn>2</mn></msubsup><msubsup><mi>&kappa;</mi><mi>a</mi><mn>4</mn></msubsup><msubsup><mi>&kappa;</mi><mi>b</mi><mn>2</mn></msubsup></mrow></mfrac><mspace width="0.8em"/><mover><mo>&rarr;</mo><mrow><msub><mi>&kappa;</mi><mi>ex</mi></msub><mo>=</mo><mi>&kappa;</mi><mo>/</mo><mn>2</mn></mrow></mover><mspace width="0.8em"/><mfrac><mrow><mn>16</mn><msup><mi>g</mi><mn>2</mn></msup></mrow><mrow><mi>&#295;</mi><msub><mi>&omega;</mi><mi>a</mi></msub><msubsup><mi>&kappa;</mi><mi>a</mi><mn>2</mn></msubsup><msub><mi>&kappa;</mi><mi>b</mi></msub></mrow></mfrac></mrow></math></div>
      <p class="tx">At fixed g a ring's %/W therefore scales as Q<sup>3</sup>. Published definitions of g differ by numerical factors, so g values from different papers are compared only after conversion to one Hamiltonian. &eta;<sub>norm</sub> scales as 1/(&lambda;&sup2;A<sub>eff</sub>) at fixed d<sub>eff</sub> (eq. 2.13); A<sub>eff</sub> itself scales roughly with &lambda;&sup2; in a geometrically scaled guide, and d<sub>eff</sub> disperses (Miller). Blue SHG at 33,000 %/W/cm&sup2; <Badge code="reported" pop="r:park2022" /> and 1550 nm SHG at 2600 to 9600 %/W/cm&sup2; are therefore not ranked by one number.</p>
        </div>
        <div class="f23-pane" data-i="2">
      <h3 class="h3">Overlap</h3>
      <p class="tx">For dominant field components normalized to unit power, the integral in the numerator runs where d is nonzero (LN, with sign flips in poled regions). Some authors fold n<sub>eff</sub> into this definition.</p>
      <div class="eq"><math display="block"><mrow><mfrac><mn>1</mn><msub><mi>A</mi><mi>eff</mi></msub></mfrac><mo>=</mo><mfrac><msup><mrow><mo>|</mo><msub><mo>&int;</mo><msup><mi>&chi;</mi><mrow><mo>(</mo><mn>2</mn><mo>)</mo></mrow></msup></msub><msubsup><mi>E</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow><mo>*</mo></msubsup><msubsup><mi>E</mi><mi>&omega;</mi><mn>2</mn></msubsup><mi>d</mi><mi>A</mi><mo>|</mo></mrow><mn>2</mn></msup><mrow><msup><mrow><mo>(</mo><mo>&int;</mo><msup><mrow><mo>|</mo><msub><mi>E</mi><mi>&omega;</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi><mo>)</mo></mrow><mn>2</mn></msup><mo>&int;</mo><msup><mrow><mo>|</mo><msub><mi>E</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi></mrow></mfrac></mrow></math></div>
        </div>
        <div class="f23-pane" data-i="3">
      <h3 class="h3">Coupled-mode equations</h3>
      <p class="tx">|A|&sup2; = power, fields written as A exp(i(&omega;t &minus; kz)), the complex conjugate of the convention in Boyd, so phases of A carry the opposite sign (<span class="f23-ref" data-pop="r:armstrong1962">Armstrong et al. 1962</span>). The equations conserve P<sub>&omega;</sub> + P<sub>2&omega;</sub> (Manley-Rowe) and reproduce eq. 2.13 and the tanh&sup2; law; the SHG figure in L1 integrates them by RK4.</p>
      <div class="eq"><math display="block"><mrow><mfrac><mrow><mi>d</mi><msub><mi>A</mi><mi>&omega;</mi></msub></mrow><mrow><mi>d</mi><mi>z</mi></mrow></mfrac><mo>=</mo><mo>&minus;</mo><mi>i</mi><mi>&kappa;</mi><msub><mi>A</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub><msubsup><mi>A</mi><mi>&omega;</mi><mo>*</mo></msubsup><msup><mi>e</mi><mrow><mo>&minus;</mo><mi>i</mi><mi>&Delta;</mi><mi>k</mi><mi>z</mi></mrow></msup><mo>,</mo><mspace width="1.2em"/><mfrac><mrow><mi>d</mi><msub><mi>A</mi><mrow><mn>2</mn><mi>&omega;</mi></mrow></msub></mrow><mrow><mi>d</mi><mi>z</mi></mrow></mfrac><mo>=</mo><mo>&minus;</mo><mi>i</mi><mi>&kappa;</mi><msubsup><mi>A</mi><mi>&omega;</mi><mn>2</mn></msubsup><msup><mi>e</mi><mrow><mi>i</mi><mi>&Delta;</mi><mi>k</mi><mi>z</mi></mrow></msup><mo>,</mo><mspace width="1.2em"/><msup><mi>&kappa;</mi><mn>2</mn></msup><mo>=</mo><msub><mi>&eta;</mi><mi>norm</mi></msub></mrow></math></div>
        </div>
        <div class="f23-pane" data-i="4">
      <h3 class="h3">Error sources in measured &eta;<sub>norm</sub></h3>
      <p class="tx">Facet-loss calibration at two wavelengths (the SH often exits multimode); poling duty-cycle errors and missing domains (d<sub>eff</sub> falls as sin &pi;D; <span class="f23-ref" data-pop="r:fejer1992">Fejer et al. 1992</span>); film-thickness variation that moves the phase-matching wavelength along the device, which adapted poling compensates (<span class="f23-ref" data-pop="r:chen2024nn">Chen et al. 2024</span>); photorefraction and green-induced infrared absorption at high SH power (chapter 04). The d scale carries the largest systematic uncertainty: 25 vs 34 pm/V changes &eta;<sub>norm</sub> by 1.85&times; <Badge code="derived" pop="f23-eta" />.</p>
      <p class="fine">Reviews: TFLN platform (<span class="f23-ref" data-pop="r:zhu2021">Zhu et al. 2021</span>); LN photonics from UV to microwave (<span class="f23-ref" data-pop="r:boes2023">Boes et al. 2023</span>); LNOI phase-matching schemes (BPM, modal, QPM) and tuning effects (<span class="f23-ref" data-pop="r:you2024">You et al. 2024</span>).</p>
        </div>
        </div>
      </div>

      <!-- efficiency ledger, TECH -->
      <div class="panel f23p" id="f09" data-variant="tech" data-pair="f09">
        <div class="ph"><span>Reported SHG efficiencies by date</span><span>one unit per panel</span></div>
        <div class="lt-split">
          <div>
            <div class="plotbox" id="f09-plot" data-sweep>{@html I.f9.plot}</div>
            <div class="f23-hov" id="f09-hov">{@html I.f9.hov}</div>
            <div class="lgd"><span>&#9632; waveguide %/W/cm&sup2;</span><span>&#9633; DFG %/W/cm&sup2;</span><span>&#9650; waveguide %/W</span><span>&#9670; ring %/W</span><span><span class="k s3"></span>converter</span><span><span class="k s5"></span>ring model</span></div>
          </div>
          <div>
            <div class="ctl seg2"><span class="lbl">Show</span><div class="seg" role="group" aria-label="Series"><button id="f09-wg" class="on" aria-pressed="true">waveguide</button><button id="f09-ring" class="on" aria-pressed="true">ring</button><button id="f09-dfg" class="on" aria-pressed="true">DFG</button></div></div>
            <div class="ctl seg2"><span class="lbl">y axes</span><div class="seg" id="f09-ax" role="group" aria-label="Axis scale"><button data-v="log" class="on">log</button><button data-v="lin">lin</button></div></div>
            <div class="ctl"><label for="f09-eta">&eta;<sub>norm</sub></label><input id="f09-eta" type="range" min="0" max="1000" step="1" value={SP.e9}><output id="f09-eta-o" for="f09-eta">{I.fmt9.eta}</output></div>
            <div class="ctl"><label for="f09-l">Waveguide L</label><input id="f09-l" type="range" min="0" max="1000" step="1" value={SP.l9}><output id="f09-l-o" for="f09-l">{I.fmt9.L}</output></div>
            <div class="ctl"><label for="f09-q">Ring Q (both modes)</label><input id="f09-q" type="range" min="0" max="1000" step="1" value={SP.q9}><output id="f09-q-o" for="f09-q">{I.fmt9.Q}</output></div>
            <div class="ctl"><label for="f09-g">Ring g/2&pi; <Badge code="template" pop="f23-gtpl" /></label><input id="f09-g" type="range" min="0" max="1000" step="1" value={SP.g9}><output id="f09-g-o" for="f09-g">{I.fmt9.g}</output></div>
            <table class="ro f23ro" id="f09-ro">{@html I.f9.ro}</table>
          </div>
        </div>
        <div class="pf">Hover a marker for its record. Values: the L2 table, each as reported. Ring model: 1550 nm fundamental, critical coupling. The Q slider moves only the lower panel.</div>
      </div>

      <!-- efficiency ledger, VISUAL -->
      <div class="v-f23 f23-2c" id="v09" data-variant="visual" data-pair="f09">
        <div class="f23-main">
          <div class="v-stage" id="v09-plot" data-sweep>{@html I.f9.vplot}</div>
          <p class="v-f23-dev" id="v09-dev">{@html I.f9.vdev}</p>
          <p class="v-cap"><b>Drawn</b>upper panel per watt and square centimetre, lower panel per watt for one device; a point never appears on a panel of another unit. Drag Q: the ring line climbs as Q&sup3; past the ring records while the upper panel stays still. Marker fill: color of the generated light where the source gives the pump wavelength; IR output dashed. Values: the measured-efficiency table in L2, each as reported. Ring model: 1550 nm fundamental, critical coupling, Q<sub>a</sub> = Q<sub>b</sub> = Q; g/2&pi; is a display parameter <Badge code="template" pop="f23-gtpl" />.</p>
          <div class="v-prov">
          <span>records as reported <Badge code="reported" pop="r:wang2018optica" /></span>
          <span>converter and ring model <Badge code="derived" pop="f23-ring" /></span>
          <span>gold rule: the 1993 field-poled waveguide <Badge code="reported" pop="r:yamada1993" /></span>
        </div>
        </div>
        <div class="f23-side">
          <div class="v-ctls">
          <div class="v-ctl"><span class="v-lab">Show</span><div class="v-seg" role="group" aria-label="Series"><button type="button" id="v09-wg" class="on" aria-pressed="true">Waveguides</button><button type="button" id="v09-ring" class="on" aria-pressed="true">Rings</button><button type="button" id="v09-dfg" class="on" aria-pressed="true">DFG</button></div></div>
          <div class="v-ctl"><span class="v-lab">Vertical scale</span><div class="v-seg" id="v09-ax" role="group" aria-label="Axis scale"><button type="button" data-v="log" class="on">Log</button><button type="button" data-v="lin">Linear</button></div></div>
          <div class="v-ctl" style="--w:13ch"><label for="v09-eta">Normalized efficiency</label><output id="v09-eta-o" for="v09-eta">{I.fmt9.eta}</output><input id="v09-eta" type="range" min="0" max="1000" step="1" value={SP.e9}></div>
          <div class="v-ctl" style="--w:8ch"><label for="v09-l">Waveguide length</label><output id="v09-l-o" for="v09-l">{I.fmt9.L}</output><input id="v09-l" type="range" min="0" max="1000" step="1" value={SP.l9}></div>
          <div class="v-ctl" style="--w:9ch"><label for="v09-q">Ring quality factor Q</label><output id="v09-q-o" for="v09-q">{I.fmt9.Q}</output><input id="v09-q" type="range" min="0" max="1000" step="1" value={SP.q9}></div>
          <div class="v-ctl" style="--w:9ch"><label for="v09-g">Ring coupling g/2&pi; <Badge code="template" pop="f23-gtpl" /></label><output id="v09-g-o" for="v09-g">{I.fmt9.g}</output><input id="v09-g" type="range" min="0" max="1000" step="1" value={SP.g9}></div>
          </div>
          <dl class="v-hud" id="v09-hud">{@html I.f9.hud}</dl>
        </div>
      </div>

          </div>
  </section>

  <SectionEnd slug="second-order" refs={data.content.refList} />
</ChapterPage>
