<!-- Chapter 2.1 Birefringence and the index ellipsoid (manuscript content/chapters/02-light/manuscript.md sec. 2.1):
     L1 conoscope of a z-cut plate under a transverse field (F2-01), L2 index ellipsoid and walk-off (F2-03), dispersion
     models with errata (F2-02), thermo-optic coefficients, L3 how each number is computed and measured. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/birefringence.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { P21_POPS } from "$lib/figures/light/f21-pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { eyeRingSVG } from "$lib/figures/visual/bench";
  import { mountCono21 } from "$lib/figures/light/f21-cono-mount";
  import { mountEll21 } from "$lib/figures/light/f21-ell-mount";
  import { mountDisp21 } from "$lib/figures/light/f21-disp-mount";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";

  let { data }: { data: PageData } = $props();
  const N = $derived(data.N);
  const I = $derived(data.init);
  usePops(LIGHT_POPS);
  usePops(P21_POPS);
  // svelte-ignore state_referenced_locally
  usePops(data.content.pops);
  const eyeRing = eyeRingSVG();

  let first: HTMLElement;
  onMount(() => {
    const root = first.closest("main") as HTMLElement;
    const offs = [installRangeFill(), mountCono21(root), mountEll21(root), mountDisp21(root)];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("birefringence")} title="2.1 Birefringence and the index ellipsoid"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Computation and measurement" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={first}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">z-cut plate between crossed polarizers</span></div>
    <div class="body">
      <p class="tx">LiNbO<sub>3</sub> is optically <span class="term" data-pop="g:uniaxial-crystal">uniaxial</span> and negative: light polarized along the <i>c</i> axis sees the <span class="term" data-pop="g:extraordinary-index">extraordinary index</span> n<sub>e</sub>, light polarized perpendicular to it sees the <span class="term" data-pop="g:ordinary-index">ordinary index</span> n<sub>o</sub>, and n<sub>e</sub> &lt; n<sub>o</sub>. At 1550 nm, n<sub>o</sub> = {N.no1550} and n<sub>e</sub> = {N.ne1550}, a <span class="term" data-pop="g:birefringence">birefringence</span> of {N.dn1550} <Badge code="P-db" pop="r:zelmon1997" /> <Badge code="derived" pop="d21-zel" />.</p>
      <p class="tx">Between crossed polarizers in a cone of convergent light (<span class="term" data-pop="g:conoscopy">conoscopy</span>), a z-cut plate shows a dark cross (<span class="term" data-pop="g:isogyre">isogyres</span>) and concentric dark rings (<span class="term" data-pop="g:isochrome">isochromes</span>). For a 1.00 mm plate at 632.8 nm the first three dark rings sit at {N.rings[0]}, {N.rings[1]} and {N.rings[2]}&deg; from the axis, in air <Badge code="derived" pop="d21-ring" />. A field across the plate, along <i>x</i> or <i>y</i>, makes the crystal biaxial through r<sub>22</sub>: the single <span class="term" data-pop="g:optic-axis">optic axis</span> splits in two and the cross opens into two hyperbolic brushes around the <span class="term" data-pop="g:melatope">melatopes</span>.</p>

      <div class="panel lt-fig" id="c21" data-variant="tech" data-pair="c21">
        <div class="ph"><span>Conoscope: z-cut LN, P &parallel; x, A &parallel; y, NA 0.55</span><span id="c21-src-h">632.8 nm, gray</span></div>
        <div class="lt-split">
          <div class="c21-eye"><div class="c21-stage"><canvas id="c21-cv" aria-label="Conoscopic figure of the z-cut plate"></canvas><svg id="c21-ov" viewBox="0 0 100 100" aria-hidden="true">{@html I.c21.ov}</svg></div></div>
          <div class="c21-side">
            <div class="ctl"><label for="c21-e-in">Field E &perp; c</label><input id="c21-e-in" type="range" min="0" max="5" step="0.05" value="0"><output id="c21-e-o">0.00 kV/mm</output></div>
            <div class="ctl"><label for="c21-d-in">Thickness d</label><input id="c21-d-in" type="range" min="0.2" max="2" step="0.01" value="1"><output id="c21-d-o">1.00 mm</output></div>
            <div class="ctl seg2"><span class="k">E along</span><div class="seg" id="c21-dir" role="group" aria-label="Field direction"><button data-v="x" class="on">x</button><button data-v="y">y</button></div></div>
            <div class="ctl seg2"><span class="k">Source</span><div class="seg" id="c21-src" role="group" aria-label="Source"><button data-v="mono" class="on">monochromatic</button><button data-v="white">white</button></div></div>
            <div class="ctl"><label for="c21-lam-in">Source &lambda;</label><input id="c21-lam-in" type="range" min="400" max="700" step="0.5" value="632.8"><output id="c21-lam-o">632.8 nm</output></div>
            <div class="ctl seg2"><span class="k">r set</span><div class="seg" id="c21-set" role="group" aria-label="Pockels coefficient set"><button data-v="kaminow" class="on">S Kaminow 1980</button><button data-v="turner">S Turner 1966</button><button data-v="zook">T Zook 1967</button></div></div>
            <table class="ro c21-ro"><colgroup><col><col class="cv"></colgroup><tbody>
              <tr><td>&Delta;n induced along z, at &lambda;</td><td class="v" id="c21-dn">{I.c21.ro.dn}</td></tr>
              <tr><td>retardance along z</td><td class="v" id="c21-ret">{I.c21.ro.ret}</td></tr>
              <tr><td>optic-axis tilt in air, exact</td><td class="v" id="c21-tilt">{I.c21.ro.tilt}</td></tr>
              <tr><td>first order, r<sub>22</sub> only</td><td class="v" id="c21-tiltFO">{I.c21.ro.tiltFO}</td></tr>
              <tr><td>state</td><td class="v" id="c21-state">{I.c21.ro.state}</td></tr>
              <tr><td>in-plane slow axis from x</td><td class="v" id="c21-axis">{I.c21.ro.axis}</td></tr>
              <tr><td>ring 1 at E = 0, at &lambda;</td><td class="v" id="c21-ring">{I.c21.ro.ring}</td></tr>
            </tbody></table>
          </div>
        </div>
        <div class="pf"><span id="c21-set-h">{@html I.c21.head}</span><Badge code="P-comp" pop="r:weis1985" /><span>reticle: 5&deg; in air; ticks below the axis: exact dark-ring angles at E = 0 and &lambda;; +: computed optic axes; the source slider selects a monochromatic wavelength (white light: luminance)</span><span>indices <Badge code="P-db" pop="r:zelmon1997" /></span><span>numbers <Badge code="derived" pop="d21-field" /></span></div>
      </div>

      <div class="v-c21" id="v-c21" data-variant="visual" data-pair="c21">
        <div class="v-bench">
          <div>
            <div class="v-bench-art"><svg id="v-c21-bench" viewBox="0 0 880 300" role="img" aria-label="Conoscope bench: lamp, polarizer along x, condenser, LN plate between electrodes, objective, analyzer along y, Bertrand lens">{@html I.c21.bench}</svg></div>
            <div class="v-bench-ctl">
              <div class="v-group"><h3>Lamp</h3><div class="v-seg" id="v-c21-src" role="group" aria-label="Source"><button type="button" data-v="white" class="on">White</button><button type="button" data-v="mono">Monochromatic</button></div><div class="v-ctl" style="--w:9ch"><label for="v-c21-lam-in">Wavelength</label><output id="v-c21-lam-o">632.8 nm</output><input id="v-c21-lam-in" type="range" min="400" max="700" step="0.5" value="632.8"></div></div>
              <div class="v-group"><h3>LN plate</h3><div class="v-ctl" style="--w:8ch"><label for="v-c21-d-in">Thickness d</label><output id="v-c21-d-o">1.00 mm</output><input id="v-c21-d-in" type="range" min="0.2" max="2" step="0.01" value="1"></div></div>
              <div class="v-group"><h3>Electrodes</h3><div class="v-ctl" style="--w:11ch"><label for="v-c21-e-in">Field E &perp; c</label><output id="v-c21-e-o">0.00 kV/mm</output><input id="v-c21-e-in" type="range" min="0" max="5" step="0.05" value="0"></div><div class="v-seg" id="v-c21-dir" role="group" aria-label="Field direction"><button type="button" data-v="x" class="on">Along x</button><button type="button" data-v="y">Along y</button></div></div>
            </div>
            <div class="v-ctl v-c21-set"><span class="v-lab">Pockels coefficients</span><div class="v-seg" id="v-c21-set" role="group" aria-label="Pockels coefficient set"><button type="button" data-v="kaminow" class="on">Kaminow 1980, clamped</button><button type="button" data-v="turner">Turner 1966, clamped</button><button type="button" data-v="zook">Zook 1967, free</button></div></div>
          </div>
          <div class="v-eyepiece">
            <div class="v-eye"><canvas id="v-c21-cv" aria-label="Eyepiece view of the conoscopic figure"></canvas><svg viewBox="0 0 100 100" aria-hidden="true">{@html eyeRing}</svg></div>
            <div class="v-ret"><canvas id="v-c21-leg" aria-label="Retardation sequence from the center to the NA edge at E = 0"></canvas><div class="v-ret-ticks"><span>0</span><span style="left:100%">NA 0.55 edge</span></div></div>
            <dl class="v-hud">
              <dt>&Delta;n induced, at &lambda;</dt><dd id="v-c21-dn">{I.c21.ro.dn}</dd>
              <dt>Optic axes, tilt in air</dt><dd id="v-c21-tilt">{I.c21.ro.tilt}</dd>
              <dt>First order, r<sub>22</sub> only</dt><dd id="v-c21-tiltFO">{I.c21.ro.tiltFO}</dd>
              <dt>In-plane slow axis from x</dt><dd id="v-c21-axis">{I.c21.ro.axis}</dd>
              <dt>Retardance along z</dt><dd id="v-c21-ret">{I.c21.ro.ret}</dd>
              <dt>State</dt><dd id="v-c21-state">{I.c21.ro.state}</dd>
              <dt>First dark ring, E = 0, at &lambda;</dt><dd id="v-c21-ring">{I.c21.ro.ring}</dd>
              <dt>Retardation at the NA edge</dt><dd id="v-c21-g">&nbsp;</dd>
            </dl>
          </div>
        </div>
        <div class="v-prov"><span>Indices <Badge code="P-db" pop="r:zelmon1997" /></span><span id="v-c21-set-h">{@html I.c21.head}</span><Badge code="P-comp" pop="r:weis1985" /><span>eyepiece frame: 3m mirror-plane traces</span><span>Exact plane-wave retardance; tilt <Badge code="derived" pop="d21-field" /></span></div>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">index ellipsoid, dispersion, thermo-optics</span></div>
    <div class="body">
      <h3 class="h3">Index ellipsoid</h3>
      <p class="tx">With no field, in the crystal frame (IEEE Std 176-1987, z = c) <Badge code="P" pop="r:ieee176" />, the <span class="term" data-pop="g:index-ellipsoid">index ellipsoid</span> is</p>
      <div class="eq"><math display="block"><mrow><mfrac><msup><mi>x</mi><mn>2</mn></msup><msubsup><mi>n</mi><mi>o</mi><mn>2</mn></msubsup></mfrac><mo>+</mo><mfrac><msup><mi>y</mi><mn>2</mn></msup><msubsup><mi>n</mi><mi>o</mi><mn>2</mn></msubsup></mfrac><mo>+</mo><mfrac><msup><mi>z</mi><mn>2</mn></msup><msubsup><mi>n</mi><mi>e</mi><mn>2</mn></msubsup></mfrac><mo>=</mo><mn>1</mn></mrow></math><span class="eqn">(2.1)</span></div>
      <p class="tx">A wave whose wave vector makes the angle &theta; with <i>c</i> has one ordinary index n<sub>o</sub> and one extraordinary index</p>
      <div class="eq"><math display="block"><mrow><mfrac><mn>1</mn><mrow><msub><mi>n</mi><mi>e</mi></msub><msup><mrow><mo>(</mo><mi>&theta;</mi><mo>)</mo></mrow><mn>2</mn></msup></mrow></mfrac><mo>=</mo><mfrac><mrow><msup><mi>cos</mi><mn>2</mn></msup><mi>&theta;</mi></mrow><msubsup><mi>n</mi><mi>o</mi><mn>2</mn></msubsup></mfrac><mo>+</mo><mfrac><mrow><msup><mi>sin</mi><mn>2</mn></msup><mi>&theta;</mi></mrow><msubsup><mi>n</mi><mi>e</mi><mn>2</mn></msubsup></mfrac></mrow></math><span class="eqn">(2.2)</span></div>
      <p class="tx">The extraordinary Poynting vector <span class="term" data-pop="g:walk-off">walks off</span> the wave vector by &rho;, tan &rho; = (n<sub>e</sub>(&theta;)<sup>2</sup>/2)(1/n<sub>e</sub><sup>2</sup> &minus; 1/n<sub>o</sub><sup>2</sup>) sin 2&theta;. Largest walk-off: {N.wo[0].r}&deg; at &theta; = {N.wo[0].t}&deg; (632.8 nm), {N.wo[1].r}&deg; at {N.wo[1].t}&deg; (1064 nm), {N.wo[2].r}&deg; at {N.wo[2].t}&deg; (1550 nm) <Badge code="derived" pop="d21-wo" />.</p>

      <ModeVariant>
        {#snippet tech()}
        <div class="panel lt-fig" id="e21" data-pair="e21">
          <div class="ph"><span>Index ellipsoid, E = 0: section normal to k, n<sub>e</sub>(&theta;), &rho;</span><span>Zelmon 1997 CLN, 21 &deg;C</span></div>
          <div class="lt-split">
            <div><pre class="ascii e21-ascii" id="e21-ascii" aria-label="ASCII render of the index ellipsoid with the section normal to k">{I.e21.ascii}</pre><div class="lgd"><span>* k</span><span>+ S (drawn walk-off)</span><span>- / | \ section ellipse; &middot; hidden</span></div></div>
            <div>
              <div class="ctl"><label for="e21-th-in">Polar angle &theta;</label><input id="e21-th-in" type="range" min="0" max="90" step="0.5" value="40"><output id="e21-th-o">40.0°</output></div>
              <div class="ctl"><label for="e21-ph-in">Azimuth &phi;</label><input id="e21-ph-in" type="range" min="0" max="360" step="1" value="30"><output id="e21-ph-o"> 30°</output></div>
              <div class="ctl"><label for="e21-lam-in">Wavelength</label><input id="e21-lam-in" type="range" min="0" max="1000" step="1" value="627"><output id="e21-lam-o">{I.e21.ro.lam}</output></div>
              <table class="ro e21-ro"><colgroup><col><col class="cv"></colgroup><tbody>
                <tr><td>n<sub>o</sub> (ordinary wave)</td><td class="v" id="e21-no">{I.e21.ro.no}</td></tr>
                <tr><td>n<sub>e</sub>(&theta;) (extraordinary wave)</td><td class="v" id="e21-nth">{I.e21.ro.nth}</td></tr>
                <tr><td>n<sub>e</sub>(&theta;) &minus; n<sub>o</sub></td><td class="v" id="e21-dn">{I.e21.ro.dn}</td></tr>
                <tr><td>walk-off &rho;</td><td class="v" id="e21-rho">{I.e21.ro.rho}</td></tr>
                <tr><td>largest &rho; at this &lambda;</td><td class="v" id="e21-mx">{I.e21.ro.mx}</td></tr>
              </tbody></table>
              <div class="plotbox"><svg class="lp" id="e21-plot" viewBox="0 0 560 210" role="img" aria-label="Walk-off and extraordinary index versus polar angle">{@html I.e21.plot}</svg></div>
              <div class="lgd"><span><i class="k"></i>&rho;(&theta;)</span><span><i class="k s2"></i>n<sub>e</sub>(&theta;), right scale</span><span>dotted: &theta; of largest &rho;</span></div>
            </div>
          </div>
          <div class="pf"><span>Drawing exaggerated, numbers exact <Badge code="derived" pop="d21-ell" /></span><span>indices <Badge code="P-db" pop="r:zelmon1997" /></span></div>
        </div>
        {/snippet}
        {#snippet visual()}
        <div class="v-inst" id="v-e21" data-pair="e21">
          <div class="v-ell-stage v-frame" id="v-e21-stage" tabindex="0" role="img" aria-label="Index ellipsoid with the wave vector k, the section normal to k and the Poynting vector S; drag or arrow keys to orbit"><div class="v-ell-lab" aria-hidden="true"></div></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:6ch"><label for="v-e21-th-in">Wave vector from c, &theta;</label><output id="v-e21-th-o">40.0°</output><input id="v-e21-th-in" type="range" min="0" max="90" step="0.5" value="40"></div>
            <div class="v-ctl" style="--w:5ch"><label for="v-e21-ph-in">Azimuth &phi;</label><output id="v-e21-ph-o"> 30°</output><input id="v-e21-ph-in" type="range" min="0" max="360" step="1" value="30"></div>
            <div class="v-ctl" style="--w:8ch"><label for="v-e21-lam-in">Wavelength</label><output id="v-e21-lam-o">{I.e21.ro.lam}</output><input id="v-e21-lam-in" type="range" min="0" max="1000" step="1" value="627"></div>
            <dl class="v-hud">
              <dt>Ordinary index</dt><dd id="v-e21-no">{I.e21.ro.no}</dd>
              <dt>Extraordinary index n<sub>e</sub>(&theta;)</dt><dd id="v-e21-nth">{I.e21.ro.nth}</dd>
              <dt>n<sub>e</sub>(&theta;) &minus; n<sub>o</sub></dt><dd id="v-e21-dn">{I.e21.ro.dn}</dd>
              <dt>Walk-off of S from k</dt><dd id="v-e21-rho">{I.e21.ro.rho}</dd>
              <dt>Largest walk-off</dt><dd id="v-e21-mx">{I.e21.ro.mx}</dd>
            </dl>
            <p class="v-cap">Drawn: semi-axes 1 + 10 (n<sub>i</sub>/n&#772; &minus; 1); S is the normal of the drawn surface. k in the color of the chosen wavelength (infrared: <span class="term" data-pop="v-false">false color</span>, dashed). <Badge code="derived" pop="d21-ell" /></p>
          </div>
        </div>
        {/snippet}
      </ModeVariant>

      <h3 class="h3">Dispersion</h3>
      <p class="tx">Zelmon et al. fitted congruent LN (<span class="term" data-pop="g:cln-congruent-ln">CLN</span>) at 21 &deg;C over 0.4 to 5.0 &micro;m with a three-term <span class="term" data-pop="g:sellmeier-equation">Sellmeier equation</span> <Badge code="P-db" pop="r:zelmon1997" />:</p>
      <div class="eq"><math display="block"><mrow><msup><mi>n</mi><mn>2</mn></msup><mo>&minus;</mo><mn>1</mn><mo>=</mo><munderover><mo>&sum;</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mn>3</mn></munderover><mfrac><mrow><msub><mi>B</mi><mi>i</mi></msub><msup><mi>&lambda;</mi><mn>2</mn></msup></mrow><mrow><msup><mi>&lambda;</mi><mn>2</mn></msup><mo>&minus;</mo><msub><mi>C</mi><mi>i</mi></msub></mrow></mfrac><mo>,</mo><mspace width="1em"/><mi>&lambda;</mi><mtext>&#8197;in&#8197;&micro;m,&#8197;</mtext><msub><mi>C</mi><mi>i</mi></msub><mtext>&#8197;in&#8197;&micro;m</mtext><msup><mi></mi><mn>2</mn></msup></mrow></math><span class="eqn">(2.3)</span></div>
      <div class="scrollx"><table class="idx">
        <thead><tr><th>Axis</th><th class="r">B<sub>1</sub></th><th class="r">C<sub>1</sub></th><th class="r">B<sub>2</sub></th><th class="r">C<sub>2</sub></th><th class="r">B<sub>3</sub></th><th class="r">C<sub>3</sub></th><th class="r">Status</th></tr></thead>
        <tbody>
          <tr><td>o</td><td class="num">2.6734</td><td class="num">0.01764</td><td class="num">1.2290</td><td class="num">0.05914</td><td class="num">12.614</td><td class="num">474.60</td><td class="r"><Badge code="P-db" pop="r:zelmon1997" /></td></tr>
          <tr><td>e</td><td class="num">2.9804</td><td class="num">0.02047</td><td class="num">0.5981</td><td class="num">0.0666</td><td class="num">8.9543</td><td class="num">416.08</td><td class="r"><Badge code="P-db" pop="r:zelmon1997" /></td></tr>
        </tbody>
      </table></div>
      <p class="fine">Coefficients transcribed from the paper by refractiveindex.info (CC0) <Badge code="P-db" pop="r:rii2024" />; the paper itself is not held.</p>

      <h3 class="h3">Computed indices, 21 &deg;C <Badge code="derived" pop="d21-zel" /></h3>
      <div class="scrollx"><table class="idx">
        <thead><tr><th>&lambda; (&micro;m)</th><th class="r">n<sub>o</sub></th><th class="r">n<sub>e</sub></th><th class="r">n<sub>e</sub> &minus; n<sub>o</sub></th><th class="r"><span class="term" data-pop="g:group-index">n<sub>g,o</sub></span></th><th class="r">n<sub>g,e</sub></th></tr></thead>
        <tbody>
          {#each data.table as r (r.l)}<tr><td>{r.l}</td><td class="num">{r.no}</td><td class="num">{r.ne}</td><td class="num">{r.dn}</td><td class="num">{r.ngo}</td><td class="num">{r.nge}</td></tr>{/each}
        </tbody>
      </table></div>
      <p class="tx">The birefringence shrinks by a factor {N.birRatio} from 0.4 to 5 &micro;m. The group index has its minimum where material group-velocity dispersion (GVD) changes sign: {N.gvdE} &micro;m (e) and {N.gvdO} &micro;m (o) <Badge code="derived" pop="d21-gvd" />.</p>
      <p class="tx">Check against measurement: <span class="term" data-pop="r:nelson1974">Nelson and Mikulyak</span> measured n<sub>o</sub> = {N.nel[0].o}, n<sub>e</sub> = {N.nel[0].e} at 632.8 nm and 24.5 &deg;C, and {N.nel[1].o}, {N.nel[1].e} at 1060 nm <Badge code="P-comp" pop="d21-nel" />. Zelmon gives {N.nel[0].zo}, {N.nel[0].ze} at 632.8 nm: n<sub>o</sub> differs by {N.nel[0].dno}, n<sub>e</sub> by {N.nel[0].d}.</p>

      <ModeVariant>
        {#snippet tech()}
        <div class="panel lt-fig" id="d21" data-pair="d21">
          <div class="ph"><span>Index, group index, birefringence and dn/dT vs wavelength</span><span id="d21-flag" class="d21-flag">{I.d21.flag}</span></div>
          <div class="lt-split d21-split"><div><div class="plotbox"><svg class="lp" id="d21-svg" viewBox="0 0 600 300" role="img" aria-label="Index models versus wavelength">{@html I.d21.svgT}</svg></div></div><div><div class="ctl"><label for="d21-lam-in">Wavelength</label><input id="d21-lam-in" type="range" min="0" max="1000" step="1" value="627"><output id="d21-lam-o">1550 nm</output></div>
          <div class="ctl"><label for="d21-t-in">Temperature</label><input id="d21-t-in" type="range" min="20" max="250" step="1" value="21"><output id="d21-t-o"> 21 °C</output></div>
          <div class="ctl seg2"><span class="k">Quantity</span><div class="seg" id="d21-q" role="group" aria-label="Quantity"><button data-v="n" class="on">n</button><button data-v="ng">n<sub>g</sub></button><button data-v="bir">n<sub>e</sub> &minus; n<sub>o</sub></button><button data-v="dndt">dn/dT</button></div></div>
          <div class="ctl seg2"><span class="k">Crystal</span><div class="seg" id="d21-v" role="group" aria-label="Crystal variant"><button data-v="cln" class="on">CLN</button><button data-v="mgo5">5% MgO:CLN</button><button data-v="sln">1% MgO:SLN</button></div></div>
          <div class="ctl seg2"><span class="k">MgO5 table</span><div class="seg" id="d21-err" role="group" aria-label="Zelmon 5 mol% MgO table"><button data-v="corrected" class="on">corrected (erratum)</button><button data-v="printed">as printed 1997</button></div></div>
          <div class="ctl seg2"><span class="k">&lambda; axis</span><div class="seg" id="d21-log" role="group" aria-label="Wavelength axis"><button data-v="log" class="on">log</button><button data-v="lin">linear</button></div></div>
          <div class="scrollx"><table class="ro d21-ro"><colgroup><col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5"></colgroup><tbody id="d21-rows">{@html I.d21.rowsT}</tbody></table></div>
          <table class="ro d21-sp"><colgroup><col><col class="cv"></colgroup><tbody><tr><td>largest spread between models of one axis at the cursor</td><td class="v" id="d21-spread">{I.d21.spread}</td></tr></tbody></table></div></div>
          <div class="pf"><span>bars above the plot: validity window of each model (hatched: outside)</span><span>&bull; &#9675; Nelson and Mikulyak, 24.5 &deg;C <Badge code="P-comp" pop="d21-nel" /></span><span>Zelmon <Badge code="P-db" pop="r:zelmon1997" /></span><span>Jundt <Badge code="S" pop="r:jundt1997" /></span><span>Gayer <Badge code="P" pop="r:gayer2008" /></span><span>erratum <Badge code="reported" pop="r:zelmon1997err" /></span><span>models evaluated <Badge code="derived" pop="d21-jg" /></span></div>
        </div>
        {/snippet}
        {#snippet visual()}
        <div class="v-inst" id="v-d21" data-pair="d21">
          <div class="v-stage"><svg class="lp" id="v-d21-svg" viewBox="0 0 760 400" role="img" aria-label="Index models versus wavelength over the spectrum">{@html I.d21.svgV}</svg></div>
          <div class="v-side">
            <div class="v-ctl" style="--w:8ch"><label for="v-d21-lam-in">Wavelength</label><output id="v-d21-lam-o">1550 nm</output><input id="v-d21-lam-in" type="range" min="0" max="1000" step="1" value="627"></div>
            <div class="v-ctl" style="--w:7ch"><label for="v-d21-t-in">Temperature</label><output id="v-d21-t-o"> 21 °C</output><input id="v-d21-t-in" type="range" min="20" max="250" step="1" value="21"></div>
            <div class="v-ctl"><span class="v-lab">Quantity</span><div class="v-seg" id="v-d21-q" role="group" aria-label="Quantity"><button type="button" data-v="n" class="on">Index</button><button type="button" data-v="ng">Group index</button><button type="button" data-v="bir">Birefringence</button><button type="button" data-v="dndt">dn/dT</button></div></div>
            <div class="v-ctl"><span class="v-lab">Crystal</span><div class="v-seg" id="v-d21-v" role="group" aria-label="Crystal variant"><button type="button" data-v="cln" class="on">Congruent</button><button type="button" data-v="mgo5">5% MgO</button><button type="button" data-v="sln">1% MgO:SLN</button></div></div>
            <div class="v-ctl"><span class="v-lab">Zelmon 5% MgO table</span><div class="v-seg" id="v-d21-err" role="group" aria-label="Zelmon 5 mol% MgO table"><button type="button" data-v="corrected" class="on">Corrected</button><button type="button" data-v="printed">As printed, 1997</button></div></div>
            <dl class="v-hud" id="v-d21-rows">{@html I.d21.rowsV}</dl>
            <dl class="v-hud"><dt>Model spread, one axis</dt><dd id="v-d21-spread">{I.d21.spread}</dd></dl>
            <p class="v-flag" id="v-d21-flag">{I.d21.flag}</p>
            <p class="v-cap">Bars above the plot: validity window of each model (hatched outside). Filled and open dots: Nelson and Mikulyak, 24.5 &deg;C, n<sub>o</sub> and n<sub>e</sub> <Badge code="P-comp" pop="d21-nel" />. Zelmon is defined at 21 &deg;C only.</p>
          </div>
        </div>
        <div class="v-prov"><span>Zelmon <Badge code="P-db" pop="r:zelmon1997" /></span><span>Jundt <Badge code="S" pop="r:jundt1997" /></span><span>Gayer <Badge code="P" pop="r:gayer2008" /></span><span>Erratum <Badge code="reported" pop="r:zelmon1997err" /></span><span>Infrared in <span class="term" data-pop="v-false">false color</span></span></div>
        {/snippet}
      </ModeVariant>

      <h3 class="h3">Models and errata</h3>
      <div class="scrollx"><table class="idx">
        <thead><tr><th>Model</th><th>Material</th><th>Axes</th><th>T range</th><th>Status</th><th>Erratum or caveat</th></tr></thead>
        <tbody>
          <tr><td class="h">Zelmon 1997</td><td>CLN</td><td>o, e</td><td>21 &deg;C only</td><td class="b0"><Badge code="P-db" pop="r:zelmon1997" /></td><td>none for CLN</td></tr>
          <tr><td class="h">Zelmon 1997</td><td>5 mol% MgO:CLN</td><td>o, e</td><td>21 &deg;C only</td><td class="b0"><Badge code="P-db" pop="r:zelmon1997" /></td><td>Table 2 o/e headings switched; erratum published 2026-10-22 <Badge code="reported" pop="r:zelmon1997err" />; the swap was stated in print in 2008 <Badge code="P" pop="r:gayer2008" />. Coefficients copied from the 1997 table give n<sub>e</sub> &gt; n<sub>o</sub>, impossible for negative uniaxial LN</td></tr>
          <tr><td class="h">Jundt 1997</td><td>CLN</td><td>e only</td><td>20 to 250 &deg;C</td><td class="b0"><Badge code="S" pop="r:jundt1997" /></td><td>primary not held; f = (T &minus; 24.5)(T + 570.82) as transcribed</td></tr>
          <tr><td class="h">Gayer 2008</td><td>5 mol% MgO:CLN, 1% MgO:SLN</td><td>e (both); o (MgO5)</td><td>n<sub>e</sub> 20 to 200 &deg;C; n<sub>o</sub> to 1620 nm, about 20 to 100 &deg;C</td><td class="b0"><Badge code="P" pop="r:gayer2008" /></td><td>erratum replaces Fig. 3 only, Table 1 unchanged <Badge code="P" pop="r:gayer2008err" />; dn/dT from its b coefficients is anomalous (below)</td></tr>
          <tr><td class="h">Schlarb, generalized</td><td>CLN to SLN, Mg, Zn, In</td><td>o, e</td><td>400 to 1200 nm</td><td class="b0"><Badge code="S" pop="r:volk2008" /></td><td>accuracy about 2&times;10<sup>&minus;3</sup>; 1993-1996 primaries not held</td></tr>
          <tr><td class="h">Edwards and Lawrence 1984</td><td>CLN</td><td>o, e</td><td>T-dependent</td><td class="b0"><span class="ref" data-pop="r:edwards1984">[Edwards 1984]</span></td><td>coefficients not entered</td></tr>
        </tbody>
      </table></div>
      <p class="tx">At 1550 nm: Jundt n<sub>e</sub> = {N.jE} at 24.5 &deg;C vs Zelmon {N.ze1550} at 21 &deg;C <Badge code="derived" pop="d21-jg" />. Gayer 5 mol% MgO: n<sub>e</sub> = {N.gay.e}, n<sub>o</sub> = {N.gay.o} at 24.5 &deg;C <Badge code="derived" pop="d21-jg" />. Composition moves n<sub>e</sub> far more than n<sub>o</sub>: near-stoichiometric LN (SLN) has n<sub>o</sub> = 2.288, n<sub>e</sub> = 2.190 at 633 nm <Badge code="P-comp" pop="r:volk2008" />, so n<sub>e</sub> drops by 0.012 relative to CLN while n<sub>o</sub> changes by +1.5&times;10<sup>&minus;3</sup>; the generalized Sellmeier gives {N.sch.o} and {N.sch.e} at 50.0 mol% Li<sub>2</sub>O <Badge code="S" pop="d21-sch" />.</p>

      <h3 class="h3"><span class="term" data-pop="g:thermo-optic-coefficient">Thermo-optic coefficients</span></h3>
      <div class="scrollx"><table class="idx">
        <thead><tr><th>Quantity</th><th class="r">Value (1/K)</th><th>Condition</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td class="h">dn<sub>e</sub>/dT</td><td class="num">{@html N.jdn[0]} / {@html N.jdn[1]} / {@html N.jdn[2]}</td><td>CLN, 632.8 / 1064 / 1550 nm, 25 &deg;C, Jundt</td><td class="b0"><Badge code="S" pop="r:jundt1997" /> <Badge code="derived" pop="d21-jg" /></td></tr>
          <tr><td class="h">dn<sub>e</sub>/dT</td><td class="num">{@html N.mor.e}</td><td>CLN, 632 nm, 300 K, fit (&minus;2.6 + 22.4&times;10<sup>&minus;3</sup> T)&times;10<sup>&minus;5</sup></td><td class="b0"><Badge code="S" pop="r:schwesyg2011" /> <Badge code="derived" pop="d21-mor" /></td></tr>
          <tr><td class="h">dn<sub>o</sub>/dT</td><td class="num">{@html N.mor.o}</td><td>CLN, 632 nm, 300 K, fit (&minus;1.7 + 6.9&times;10<sup>&minus;3</sup> T)&times;10<sup>&minus;5</sup></td><td class="b0"><Badge code="S" pop="r:schwesyg2011" /> <Badge code="derived" pop="d21-mor" /></td></tr>
          <tr><td class="h">dn<sub>e</sub>/dT</td><td class="num">3.34&times;10<sup>&minus;5</sup></td><td>CLN, 1523 nm, 300 K</td><td class="b0"><Badge code="S" pop="r:zhu2021" /></td></tr>
          <tr><td class="h">dn/dT from Gayer b coefficients</td><td class="num">{@html N.gdn[0]} (MgO5 e), {@html N.gdn[1]} (MgO5 o), {@html N.gdn[2]} (1% MgO:SLN e)</td><td>1550 nm, 24.5 &deg;C; not physical, not for absolute dn/dT</td><td class="b0"><Badge code="derived" pop="d21-jg" /></td></tr>
        </tbody>
      </table></div>
      <p class="tx">n<sub>e</sub> is about ten times more temperature-sensitive than n<sub>o</sub>, so heating a plate changes its birefringence almost entirely through n<sub>e</sub>. Moretti's measured range is 320 to 515 K in the abstract and 300 to 515 K in the title <Badge code="reported" pop="r:moretti2005" />.</p>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Computation and measurement">
    <div class="sh"><h2 class="biref">L3 Computation and measurement</h2><span class="meta">conoscope, field-induced biaxiality, Sellmeier evaluation, error budget</span></div>
    <div class="body">
      <h3 class="h3">Conoscope</h3>
      <p class="tx">Each pixel is one propagation direction (u, v) = sin &theta;<sub>air</sub> (cos &phi;, sin &phi;). Each eigenwave is refracted with its own index (the extraordinary angle by fixed-point iteration of eq. 2.2), so the retardation &Gamma; = (2&pi;d/&lambda;)(n<sub>slow</sub> cos &theta;<sub>slow</sub> &minus; n<sub>fast</sub> cos &theta;<sub>fast</sub>) is exact for plane waves. Between crossed polarizers I = sin<sup>2</sup>(2&psi;) sin<sup>2</sup>(&Gamma;/2), &psi; the azimuth of the eigen-polarization relative to the polarizer: dark rings at &Gamma; = 2&pi;m, isogyres where &psi; = 0 or 90&deg;. Fresnel transmission differences between the eigenwaves are neglected. White light: I(&lambda;) summed over eleven Gaussian-weighted samples from 420 to 680 nm <span class="ref" data-pop="r:bornwolf">[Born &amp; Wolf]</span>. The ring angles in L1 come from the exact phase, not the small-angle formula.</p>

      <h3 class="h3">Field-induced biaxiality</h3>
      <p class="tx">For E along x or y on a z-cut plate, the in-plane impermeability splits by r<sub>22</sub>E, so the birefringence for propagation along z is n<sub>o</sub><sup>3</sup>r<sub>22</sub>E. At 632.8 nm, E = 1 kV/mm and r<sub>22</sub> = {N.r22K} pm/V (clamped; Turner 1966 and Kaminow et al. 1980 agree <Badge code="P-comp" pop="r:weis1985" />), this is {@html N.fdn}, a retardation of {N.fret} rad for d = 1 mm <Badge code="derived" pop="d21-field" />. To first order the optic axes tilt from c by &theta; with (n<sub>o</sub> &minus; n<sub>e</sub>) sin<sup>2</sup>&theta; = n<sub>o</sub><sup>3</sup>r<sub>22</sub>E: {N.tFO.i}&deg; inside, {N.tFO.e}&deg; in air. The exact eigen-decomposition with the full tensor gives {N.tKx.i}&deg; / {N.tKx.e}&deg; for E along x and {N.tKy.i}&deg; / {N.tKy.e}&deg; for E along y (Kaminow set, r<sub>51</sub> = {N.r51K} pm/V); the Turner set (r<sub>51</sub> = {N.r51T} pm/V) gives {N.tTx.i}&deg; / {N.tTx.e}&deg; for E along x <Badge code="derived" pop="d21-field" />. The difference between x and y comes from r<sub>51</sub>, which the first-order formula omits; it reaches about 3%. A static field on an unclamped plate sees the free coefficients (Zook et al.: r<sub>22</sub> = {N.r22Z} pm/V <Badge code="P-comp" pop="r:weis1985" />), which roughly double the effect.</p>

      <h3 class="h3">Evaluating Sellmeier models</h3>
      <p class="tx">Inputs are vacuum wavelength in &micro;m and temperature in &deg;C; every model refuses input outside its stated window. Tests: n<sub>e</sub> &lt; n<sub>o</sub> over the whole window (catches the 5 mol% MgO swap); Zelmon CLN at 1.55 &micro;m: n<sub>o</sub> = 2.21111, n<sub>e</sub> = 2.13756. Group index and GVD from analytic derivatives of n<sup>2</sup>(&lambda;).</p>

      <h3 class="h3">Error budget at 1550 nm <Badge code="derived" pop="d21-budget" /></h3>
      <p class="tx">Zelmon (21 &deg;C) and Jundt (24.5 &deg;C) differ by {@html N.dZJ} in n<sub>e</sub>; 3.5 K &times; dn<sub>e</sub>/dT gives {@html N.dT} of that, the remaining {@html N.dRes} is model-to-model spread. This spread moves the first-order SHG QPM period at 1550 nm by {N.dPer} nm ({N.pZ} vs {N.pJ} &micro;m). Composition and doping dominate every other uncertainty for n<sub>e</sub> (0.012 between CLN and SLN at 633 nm); indices here are for CLN unless another variant (SLN, 5 mol% MgO:CLN, 1% MgO:SLN) is named.</p>

      <h3 class="h3">Primary-data caveats</h3>
      <p class="tx">Weis &amp; Gaylord Table 2 misprints n<sub>o</sub> at 472.7 nm as 3.3597; the neighbouring rows give 2.3597 <Badge code="P" pop="r:weis1985" />. Machine ingestion of that table needs the fix. The Zelmon and Jundt papers are not held: their coefficients are database (P-db) and secondary (S) transcriptions.</p>
    </div>
  </section>

  <SectionEnd slug="birefringence" refs={data.content.refList} />
</ChapterPage>
