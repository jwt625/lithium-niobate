<!-- Chapter 2.2, the Pockels effect (port of mockup/chapter.html): L1 phenomenon (bulk calculator, MZM of Li et al. 2026), L2 the
     3m r tensor (matrix explorer / index ellipsoid, coefficient sets, device mapping), L3 the power-normalized EO overlap of
     the cross-section of Li et al. 2026 from FEM data (/data/eo-overlap-li2026aa.json). Facts and sources: DevLog-003 chapter spec. -->
<script lang="ts">
  import "./pockels.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { POCKELS_POPS } from "$lib/content/pops-pockels";
  import { P22_POPS } from "./pops22";
  import { rtDefault } from "./rt-default";
  import { mountEO } from "$lib/figures/eo";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";
  import { initMZM } from "$lib/figures/visual/mzm";
  import { initEllipsoid } from "$lib/figures/visual/ellipsoid";

  let { data }: { data: PageData } = $props();
  rtDefault();
  usePops(POCKELS_POPS);
  usePops(P22_POPS);
  const I = $derived(data.init);

  let body: HTMLElement;
  onMount(() => {
    const root = body.closest("main") as HTMLElement;
    const offs = [mountEO(root), installRangeFill(), whenVisual(() => initMZM(root)), whenVisual(() => initEllipsoid(root))];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "02 Light", href: "/light/" }, { label: "2.2" }]} title="2.2 The Pockels effect"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 The r tensor" }, { id: "l3", label: "L3 Evaluating the overlap" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">bulk; MZM of Li et al. 2026</span></div>
    <div class="body">
      <p class="tx">A field <i>E</i> changes the optical impermeability 1/<i>n</i><sup>2</sup> of a non-centrosymmetric crystal linearly. With field and optical polarization both along the polar axis <i>c</i> (= <i>z</i>), the extraordinary index shifts by</p>
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><msub><mi>n</mi><mi>e</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><msub><mi>E</mi><mi>z</mi></msub><mo>,</mo><mspace width="1.2em"/><mi>&Delta;</mi><mi>&phi;</mi><mo>=</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi></mrow><mi>&lambda;</mi></mfrac><mi>&Delta;</mi><msub><mi>n</mi><mi>e</mi></msub><mi>L</mi></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Sign: a positive <i>r</i><sub>33</sub><i>E</i><sub><i>z</i></sub> lowers <i>n</i><sub>e</sub>. A phase shift of &pi; needs <i>E</i>&middot;<i>L</i> = &lambda; / (<i>n</i><sub>e</sub><sup>3</sup> <i>r</i><sub>33</sub>) for a uniform field that fills the mode.</p>

      <div class="v-mzm-wrap" data-variant="visual" data-pair="mzm">
        <div class="v-mzm">
          <div class="v-mzm-art" id="v-mzm-art">{@html I.vArt}</div>
          <div class="v-mzm-side">
            <div class="v-plot" id="v-mzm-curve">{@html I.vCurve}</div>
            <div class="v-ctl" style="--w:8ch"><label for="v-v">Drive voltage V</label><output id="v-v-o" for="v-v">{I.vMzm.v}</output><input class="v-range" id="v-v" type="range" min="-6" max="6" step="0.01" value="0"></div>
            <dl class="v-hud"><dt>Phase per arm</dt><dd id="v-ph">{I.vMzm.ph}</dd><dt>V / V<sub>&pi;</sub></dt><dd id="v-vr">{I.vMzm.vr}</dd><dt>Transmission T</dt><dd id="v-t">{I.vMzm.t}</dd></dl>
          </div>
        </div>
        <div class="v-prov">
          <span>V<sub>&pi;</sub> 2.90 V at 1550 nm <Badge code="reported" pop="li2026aa" /></span>
          <span>dashed: engine FEM, V<sub>&pi;</sub>L 2.697 V&middot;cm over 0.9 cm <Badge code="engine" pop="engine" /></span>
          <span>9 mm x-cut TFLN on silicon, G-S-G coplanar line, one waveguide per gap (push-pull); T = cos<sup>2</sup>(&pi;V / 2V<sub>&pi;</sub>), zero bias phase</span>
          <span>light: 1550 nm, <span class="term" data-pop="v-false">false color</span></span>
        </div>
      </div>

      <div class="duo">
        <div class="panel" id="calc">
          <div class="ph"><span>Bulk: field and polarization along c</span><span id="calc-lam-h"></span></div>
          <div class="ctl"><label for="c-lam">Wavelength &lambda;</label><input id="c-lam" type="range" min="0.40" max="5.00" step="0.01" value="1.55"><output id="c-lam-o">1.55 µm</output></div>
          <div class="ctl"><label for="c-e">Field E<sub>z</sub></label><input id="c-e" type="range" min="-10" max="10" step="0.1" value="1"><output id="c-e-o">1.0 V/µm</output></div>
          <table class="kv" id="calc-out">{@html I.calc}</table>
          <div class="pf">r<sub>33</sub> is held at its 633 nm clamped value; no 1550 nm EO coefficients exist in the sources held. n<sub>e</sub>(&lambda;): Zelmon et al. 1997 Sellmeier, valid 0.4 to 5.0 &micro;m.</div>
        </div>

        <div class="panel" id="mzm" data-variant="tech" data-pair="mzm">
          <div class="ph"><span>MZM, Li et al. 2026: T(V)</span><span><span class="b r" data-pop="li2026aa">reported V<sub>&pi;</sub> 2.90 V</span></span></div>
          <div class="mzm-plot"><svg id="mzm-svg" viewBox="0 0 520 210" role="img" aria-label="Transmission versus drive voltage">{@html I.mzmSvg}</svg></div>
          <div class="ctl"><label for="mzm-v">Drive voltage V</label><input id="mzm-v" type="range" min="-6" max="6" step="0.01" value="0"><output id="mzm-v-o">0.00 V</output></div>
          <table class="kv" id="mzm-out">{@html I.mzmOut}</table>
          <div class="pf">9 mm x-cut TFLN on silicon, G-S-G coplanar line, one waveguide per gap: the two arms see opposite fields (push-pull). T = cos<sup>2</sup>(&pi;V / 2V<sub>&pi;</sub>), zero bias phase. Dashed: engine FEM, same cross-section (L3), V<sub>&pi;</sub>L 2.697 V&middot;cm over 0.9 cm <Badge code="engine" pop="engine" />.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay" id="l2" data-pair="l2" data-spine="L2 The r tensor">
    <div class="sh"><h2 class="biref">L2 The r tensor</h2><span class="meta">point group 3m</span></div>
    <div class="body">
      <p class="tx">Index ellipsoid and its first-order perturbation, contracted index <i>I</i>: 1 = <i>xx</i>, 2 = <i>yy</i>, 3 = <i>zz</i>, 4 = <i>yz</i>, 5 = <i>xz</i>, 6 = <i>xy</i>; <i>j</i> runs over the field components.</p>
      <div class="eq"><math display="block"><mrow><munder><mo>&sum;</mo><mrow><mi>i</mi><mo>,</mo><mi>j</mi></mrow></munder><msub><mrow><mo>(</mo><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>)</mo></mrow><mrow><mi>i</mi><mi>j</mi></mrow></msub><msub><mi>x</mi><mi>i</mi></msub><msub><mi>x</mi><mi>j</mi></msub><mo>=</mo><mn>1</mn><mo>,</mo><mspace width="1.4em"/><mi>&Delta;</mi><msub><mrow><mo>(</mo><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>)</mo></mrow><mi>I</mi></msub><mo>=</mo><munderover><mo>&sum;</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mn>3</mn></munderover><msub><mi>r</mi><mrow><mi>I</mi><mi>j</mi></mrow></msub><msub><mi>E</mi><mi>j</mi></msub><mo>,</mo><mspace width="1.4em"/><mi>&delta;</mi><msub><mi>n</mi><mi>k</mi></msub><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>k</mi><mn>3</mn></msubsup><mi>&Delta;</mi><msub><mrow><mo>(</mo><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>)</mo></mrow><mrow><mi>k</mi><mi>k</mi></mrow></msub></mrow></math><span class="eqn">(2)</span></div>
      <p class="tx">Point group 3m, <i>x</i> perpendicular to a mirror plane, <i>z</i> along <i>c</i>: four independent coefficients. The last relation holds for polarization along a principal axis <i>k</i>; off-diagonal terms (<i>I</i> = 4, 5, 6) rotate the principal axes instead.</p>

      <ModeVariant>
        {#snippet tech()}
        <div class="panel" id="rt" data-pair="rt">
          <div class="ph"><span>r<sub>Ij</sub> at E = 1 V/&micro;m, &lambda; = <span data-lam="1.55">1550 nm</span></span><span id="rt-set-h">{I.rt.set}</span></div>
          <div class="rt-ctl">
            <span class="lbl">Field</span><div class="seg" id="rt-e" role="group" aria-label="Field direction"><button data-v="0">E<sub>x</sub></button><button data-v="1">E<sub>y</sub></button><button data-v="2" class="on">E<sub>z</sub></button></div>
            <span class="lbl">Polarization</span><div class="seg" id="rt-p" role="group" aria-label="Optical polarization"><button data-v="0">x</button><button data-v="1">y</button><button data-v="2" class="on">z</button></div>
            <span class="lbl">Set</span><div class="seg" id="rt-s" role="group" aria-label="Coefficient set"><button data-v="kaminow" class="on">S Kaminow</button><button data-v="turner">S Turner</button><button data-v="free">T Zook/Bernal</button></div>
          </div>
          <div class="rt-grid">
            <div class="scrollx"><table class="mx rt-mx" id="rt-mx" aria-label="3m Pockels matrix">{@html I.rt.mx}</table></div>
            <div class="rt-res">
              <table class="kv" id="rt-vec">{@html I.rt.vec}</table>
              <div><table class="kv" id="rt-dn">{@html I.rt.dn}</table><table class="kv" id="rt-rot">{@html I.rt.rot}</table></div>
            </div>
          </div>
          <div class="pf">Highlight: <span class="key on">diagonal entry for the chosen polarization</span> <span class="key rot">off-diagonal: axis rotation</span> <span class="key oth">diagonal entry for another polarization</span></div>
        </div>
        {/snippet}
        {#snippet visual()}
        <div class="v-ell" id="v-ell" data-pair="rt">
          <div class="v-ell-stage v-frame" id="v-ell-stage" tabindex="0" role="img" aria-label="Index ellipsoid of LN at 1550 nm under a 1 V per micrometer field; drag or arrow keys to orbit"><div class="v-ell-lab" aria-hidden="true"></div></div>
          <div class="v-ell-side">
            <div class="v-ctl"><span class="v-lab">Field, 1 V/&micro;m along</span><div class="v-seg" id="v-rt-e" role="group" aria-label="Field direction"><button type="button" data-v="0">E<sub>x</sub></button><button type="button" data-v="1">E<sub>y</sub></button><button type="button" data-v="2" class="on">E<sub>z</sub></button></div></div>
            <div class="v-ctl"><span class="v-lab">Optical polarization, 1550 nm</span><div class="v-seg" id="v-rt-p" role="group" aria-label="Optical polarization"><button type="button" data-v="0">x</button><button type="button" data-v="1">y</button><button type="button" data-v="2" class="on">z</button></div></div>
            <div class="v-ctl"><span class="v-lab">Coefficient set</span><div class="v-seg" id="v-rt-s" role="group" aria-label="Coefficient set"><button type="button" data-v="kaminow" class="on">S Kaminow</button><button type="button" data-v="turner">S Turner</button><button type="button" data-v="free">T Zook/Bernal</button></div></div>
            <dl class="v-hud">
              <dt>Index along the polarization</dt><dd id="v-ell-n">{I.ell.n}</dd>
              <dt>&delta;n first order</dt><dd id="v-ell-dn">{I.ell.dn}</dd>
              <dt>Principal indices</dt><dd id="v-ell-st">{I.ell.st}</dd>
              <dt>Largest principal-axis tilt</dt><dd id="v-ell-tilt">{I.ell.tilt}</dd>
              <dt class="full">r<sub>13</sub> / r<sub>22</sub> / r<sub>33</sub> / r<sub>51</sub> of the set</dt><dd class="full" id="v-ell-rs">{I.ell.rs}</dd>
            </dl>
            <p class="v-cap">Drawn: &Delta;(1/n<sup>2</sup>) &times;500 before the eigen-decomposition; semi-axis 1 + 10 (n<sub>i</sub>/n&#772; &minus; 1); wireframe at E = 0. Numbers: exact, unscaled. <Badge code="derived" pop="v-ell" /></p>
          </div>
        </div>
        {/snippet}
      </ModeVariant>

      <h3 class="h3">Coefficients (pm/V)</h3>
      <div class="scrollx">
        <table class="idx coef" id="coef">
          <thead><tr><th>Set</th><th>Condition</th><th class="r">r<sub>13</sub></th><th class="r">r<sub>22</sub></th><th class="r">r<sub>33</sub></th><th class="r">r<sub>51</sub></th><th class="r">Status</th></tr></thead>
          <tbody>
            <tr data-set="kaminow" class="sel"><td class="h">Kaminow et al. 1980</td><td>clamped (S); preferred by Weis &amp; Gaylord</td><td class="r num">7.7</td><td class="r num">3.4</td><td class="r num">28.8</td><td class="r num">18.2</td><td class="r"><Badge code="P-comp" pop="wg85" /></td></tr>
            <tr data-set="turner"><td class="h">Turner 1966</td><td>clamped (S)</td><td class="r num">8.6</td><td class="r num">3.4</td><td class="r num">30.8</td><td class="r num">28</td><td class="r"><Badge code="P-comp" pop="wg85" /></td></tr>
            <tr data-set="free"><td class="h">Zook et al. 1967</td><td>free (T)</td><td class="r num">10.0</td><td class="r num">6.81</td><td class="r num">32.2</td><td class="r dim">&ndash;</td><td class="r"><Badge code="P-comp" pop="wg85" /></td></tr>
            <tr><td class="h">Lenzo 1966</td><td>free (T)</td><td class="r dim">&ndash;</td><td class="r num">6.7</td><td class="r dim">&ndash;</td><td class="r dim">&ndash;</td><td class="r"><Badge code="P-comp" pop="wg85" /></td></tr>
            <tr data-set="free"><td class="h">Bernal 1966</td><td>free (T)</td><td class="r dim">&ndash;</td><td class="r dim">&ndash;</td><td class="r dim">&ndash;</td><td class="r num">32</td><td class="r"><Badge code="P-comp" pop="wg85" /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Clamped (S): strain fixed, above the acoustic resonances. Free (T): includes the piezoelectric-photoelastic contribution, below them. No 1550 nm values in the sources held. The L3 engine run uses the Turner 1966 set. Click a row to load it above.</p>

      <h3 class="h3">Device mapping</h3>
      <div class="scrollx">
        <table class="idx map">
          <thead><tr><th>Cut</th><th>Propagation</th><th>Optical field</th><th>Static field</th><th>Coefficient</th><th>Index change</th></tr></thead>
          <tbody>
            <tr><td class="h">x-cut</td><td>y (in plane)</td><td>TE, lateral = z</td><td>in-plane, lateral = z</td><td class="h">r<sub>33</sub></td><td>&minus;&frac12; n<sub>e</sub><sup>3</sup> r<sub>33</sub> E</td></tr>
            <tr><td class="h">z-cut</td><td>in plane</td><td>TM, vertical = z</td><td>vertical = z</td><td class="h">r<sub>33</sub></td><td>&minus;&frac12; n<sub>e</sub><sup>3</sup> r<sub>33</sub> E</td></tr>
            <tr><td class="h">z-cut plate</td><td>z (along c)</td><td>any, in xy</td><td>in-plane, x or y</td><td class="h">r<sub>22</sub></td><td>birefringence n<sub>o</sub><sup>3</sup> r<sub>22</sub> E; axes at 45&deg; for E<sub>x</sub>, along x, y for E<sub>y</sub></td></tr>
            <tr><td class="h">Li et al. 2026 (x-cut MZM)</td><td>y</td><td>TE</td><td>lateral, 6 &micro;m gap</td><td class="h">r<sub>33</sub> <span class="dim" id="map-r33">{@html I.num.mapR33}</span></td><td><a class="lk" href="#l3">L3</a></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">The z-cut plate row is the conoscope on the landing page: E &perp; c makes the uniaxial crystal biaxial.</p>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Evaluating the overlap">
    <div class="sh"><h2 class="biref">L3 Evaluating the overlap</h2><span class="meta">FEM: eo-modulator-atlas engine, full-vector solver, geometry of Li et al. 2026, exported <span id="l3-date">{@html I.num.date}</span> <Badge code="engine" pop="engine" /></span></div>
    <div class="body">
      <p class="tx">First-order perturbation of a guided mode normalized to power <i>P</i>, with <i>&Delta;&epsilon;</i> = &minus;<i>&epsilon;</i> <i>&Delta;</i>(<i>&epsilon;</i><sup>&minus;1</sup>) <i>&epsilon;</i>:</p>
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><mi>&beta;</mi><mo>=</mo><mfrac><mrow><mi>&omega;</mi><msub><mi>&epsilon;</mi><mn>0</mn></msub></mrow><mrow><mn>4</mn><mi>P</mi></mrow></mfrac><mo>&int;</mo><msup><mi mathvariant="bold">E</mi><mo>*</mo></msup><mo>&middot;</mo><mi>&Delta;</mi><mi>&epsilon;</mi><mo>&middot;</mo><mi mathvariant="bold">E</mi><mspace width="0.2em"/><mi>d</mi><mi>A</mi><mo>,</mo><mspace width="1.4em"/><mi>P</mi><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>&int;</mo><mi>Re</mi><mo>(</mo><mi mathvariant="bold">E</mi><mo>&times;</mo><msup><mi mathvariant="bold">H</mi><mo>*</mo></msup><mo>)</mo><mo>&middot;</mo><mover><mi>z</mi><mo>^</mo></mover><mspace width="0.2em"/><mi>d</mi><mi>A</mi></mrow></math><span class="eqn">(3)</span></div>
      <p class="tx">x-cut TE, <b>E</b> &asymp; <i>E<sub>x</sub></i> along <i>c</i>: <i>&Delta;&epsilon;<sub>xx</sub></i> = &minus;<i>n</i><sub>e</sub><sup>4</sup> <i>r</i><sub>33</sub> <i>E</i><sub><i>x</i></sub><sup>RF</sup>, and <i>H<sub>y</sub></i> = <i>n</i><sub>eff</sub> <i>E<sub>x</sub></i> / <i>Z</i><sub>0</sub> makes <i>P</i> = (<i>n</i><sub>eff</sub> / 2<i>Z</i><sub>0</sub>) &int;|<i>E<sub>x</sub></i>|<sup>2</sup> d<i>A</i>. With <i>e<sub>x</sub></i> the static field per terminal volt:</p>
      <div class="eq"><math display="block"><mrow><mfrac><mrow><mi>d</mi><msub><mi>n</mi><mi>eff</mi></msub></mrow><mrow><mi>d</mi><mi>V</mi></mrow></mfrac><mo>=</mo><mo>&minus;</mo><mfrac><mrow><msubsup><mi>n</mi><mi>e</mi><mn>4</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub></mrow><mrow><mn>2</mn><msub><mi>n</mi><mi>eff</mi></msub></mrow></mfrac><mfrac><mrow><msub><mo>&int;</mo><mi>LN</mi></msub><msub><mi>e</mi><mi>x</mi></msub><msup><mrow><mo>|</mo><msub><mi>E</mi><mi>x</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi></mrow><mrow><mo>&int;</mo><msup><mrow><mo>|</mo><msub><mi>E</mi><mi>x</mi></msub><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi></mrow></mfrac></mrow></math><span class="eqn">(4)</span></div>
      <p class="tx">Conventional overlap with gap <i>g</i>, and the push-pull half-wave product it implies (engine: V<sub>&pi;</sub>L = &lambda; / 2|d<i>n</i><sub>A</sub> &minus; d<i>n</i><sub>B</sub>|):</p>
      <div class="eq"><math display="block"><mrow><mi>&Gamma;</mi><mo>=</mo><mfrac><mi>g</mi><mi>V</mi></mfrac><mfrac><mrow><msub><mo>&int;</mo><mi>LN</mi></msub><msubsup><mi>E</mi><mi>x</mi><mi>RF</mi></msubsup><msup><mrow><mo>|</mo><mi mathvariant="bold">E</mi><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi></mrow><mrow><mo>&int;</mo><msup><mrow><mo>|</mo><mi mathvariant="bold">E</mi><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>A</mi></mrow></mfrac><mo>,</mo><mspace width="1em"/><mi>&Delta;</mi><mi>n</mi><mo>=</mo><mo>&minus;</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><mi>&Gamma;</mi><mfrac><mi>V</mi><mi>g</mi></mfrac><mo>,</mo><mspace width="1em"/><msub><mi>V</mi><mi>&pi;</mi></msub><mi>L</mi><mo>=</mo><mfrac><mrow><mi>&lambda;</mi><mi>g</mi></mrow><mrow><mn>2</mn><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><mi>&Gamma;</mi></mrow></mfrac><mo>=</mo><mfrac><mi>&lambda;</mi><mrow><mn>2</mn><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><mover><mi>E</mi><mo>&#xAF;</mo></mover></mrow></mfrac></mrow></math><span class="eqn">(5)</span></div>
      <p class="tx" id="l3-why">{@html I.num.why}</p>

      <div class="figgrid" id="figs">
        <div class="fig" id="fa"><div class="ph"><span>(a) |E<sub>x</sub>|<sup>2</sup> / max, optical, P = 1 W</span><span class="dim" id="fa-pk">{@html I.faPk}</span></div><canvas tabindex="0" aria-label="Optical intensity map; arrow keys move the probe"></canvas><div class="cb"><canvas></canvas><span class="lo">&ndash;</span><span class="u">|E<sub>x</sub>|<sup>2</sup> / |E<sub>x</sub>|<sup>2</sup><sub>max</sub></span><span class="hi">&ndash;</span></div></div>
        <div class="fig" id="fb"><div class="ph"><span>(b) e<sub>x</sub>, static field per terminal volt</span><span class="dim" id="fb-pk">{@html I.fbPk}</span></div><canvas tabindex="0" aria-label="Static field map; arrow keys move the probe"></canvas><div class="cb"><canvas></canvas><span class="lo">&ndash;</span><span class="u">(V/&micro;m)/V</span><span class="hi">&ndash;</span></div></div>
        <div class="fig wide" id="fc"><div class="ph"><span>(c) integrand d n<sub>eff</sub>/dV per area, signed, LN only</span><span class="seg" id="fc-t" role="group" aria-label="Integrand"><button data-v="integrand" class="on">total</button><button data-v="integrand_r33">r<sub>33</sub> only</button></span></div><canvas tabindex="0" aria-label="Integrand map; arrow keys move the probe"></canvas><div class="cb"><canvas></canvas><span class="lo">&ndash;</span><span class="u">1/(V &micro;m<sup>2</sup>)</span><span class="hi">&ndash;</span></div></div>
      </div>
      <div class="readout" id="ro" aria-live="polite">{@html I.ro}</div>

      <div class="duo l3b">
        <div class="fig" id="fd"><div class="ph"><span>(d) &int; integrand dx vs y</span><span class="dim">bars: total; line: r<sub>33</sub></span></div><svg id="fd-svg" role="img" aria-label="Depth profile of the integrand"></svg><div class="readout pad" id="fd-ro">{@html I.fdRo}</div><div class="readout pad" id="fd-sum">{@html I.fdSum}</div></div>
        <div class="ntabw">
          <table class="idx ntab" id="ntab"><colgroup><col><col class="cv"><col class="cu"><col class="cs"></colgroup><thead><tr><th>Quantity</th><th class="r">Value</th><th>Unit</th><th class="r">Source</th></tr></thead><tbody>{@html I.num.ntab}</tbody></table>
        </div>
      </div>
      <p class="fine" id="l3-grid-note">{@html I.num.note}</p>
    </div>
  </section>
</ChapterPage>
