<!-- Chapter 2.7, waveguides in TFLN (manuscript content/chapters/02-light/manuscript.md sec. 2.7): L1 the Li et al. 2026 rib to
     scale and the reserved mode lattice, L2 x-cut vs z-cut, ring anisotropy, hybridization, loss and
     Q records, L3 loss mechanisms, mode computation, loss measurement, errors. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import "$lib/figures/light/tfln-waveguides.css";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import SectionEnd from "$lib/figures/light/SectionEnd.svelte";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";
  import { crumbsFor } from "$lib/figures/light/sections";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";
  import { F27_POPS } from "$lib/figures/light/f27-pops";
  import { mountRingTech, initRingVisual } from "$lib/figures/light/f27-ring";
  import { mountLossTech, initLossVisual, RECS, FLOOR, BULK, GAP } from "$lib/figures/light/f27-loss";
  import { mountModesTech, initModesVisual } from "$lib/figures/light/f27-modes";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  usePops(F27_POPS);
  usePops(data.content.pops);
  const I = $derived(data.init);
  const plotted = (r: (typeof RECS)[number]): string => (r.how === "q-bound" ? `< ${r.dbm.toFixed(3)}` : String(r.dbm));

  let body: HTMLElement;
  onMount(() => {
    const root = body.closest("main") as HTMLElement;
    const offs = [mountModesTech(root), mountRingTech(root), mountLossTech(root), installRangeFill(), whenVisual(() => initModesVisual(root)), whenVisual(() => initRingVisual(root)), whenVisual(() => initLossVisual(root))];
    return () => offs.forEach((f) => f());
  });
</script>

<ChapterPage crumbs={crumbsFor("tfln-waveguides")} title="2.7 Waveguides in TFLN"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Quantitative model" }, { id: "l3", label: "L3 Mechanisms, computation, measurement" }]}>

  <!-- ================= L1 ================= -->
  <section class="lay lt" id="l1" data-pair="l1" data-spine="L1 Phenomenon" bind:this={body}>
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">rib waveguide of Li et al. 2026, x-cut, 1550 nm</span></div>
    <div class="body">
      <p class="tx">Thin-film LN on insulator (<span class="term" data-pop="g:lnoi-tfln">LNOI, TFLN</span>) is a crystalline film, 300 to 900 nm thick in one supplier's range <Badge code="V" pop="r:nanoln" />, bonded on a silica layer. Partial etching leaves a <span class="term" data-pop="g:rib-waveguide">rib</span> on a thinner slab: Li et al. 2026 use a 300 nm film, 120 nm slab and 3.5 &micro;m rib <Badge code="reported" pop="r:li2026aa" />. The mode fills a cross-section of order &lambda;<sup>2</sup>, the index contrast to the silica cladding allows tight bends, and electrodes sit micrometres from the guide (6 &micro;m gap in Li et al. 2026 <Badge code="reported" pop="r:li2026aa" />).</p>
      <p class="tx"><span class="term" data-pop="g:propagation-loss">Propagation loss</span>: 0.27 dB/cm on 4- and 6-inch wafers patterned by deep-UV lithography <Badge code="reported" pop="r:luke2020" />; 1.3 dB/m in dry-etched rings (<span class="term" data-pop="g:q-factor">intrinsic Q</span> 29 million) <Badge code="reported" pop="r:zhu2024" />; Q above 1e8 in chemo-mechanically polished rings <Badge code="reported" pop="r:gao2022" />. The material limit of annealed ion-sliced film is estimated at 0.2 dB/m (Q 1.6e8) <Badge code="reported" pop="r:shamsansari2022" />.</p>

      <!-- cross-section and mode lattice, TECH -->
        <div class="panel lt-fig f27-xs" id="f27-xs" data-variant="tech" data-pair="f215">
          <div class="ph"><span>Rib of Li et al. 2026, x-cut, to scale</span><span><Badge code="engine" pop="f27-geom" /></span></div>
          <div class="lt-split">
            <div class="plotbox">{@html I.xsT}</div>
            <div class="f27-side">
          <table class="ro f27-vt">
            <tbody>
              <tr><td class="k">film t / etch e / slab</td><td class="v">300 / 180 / 120 nm</td><td class="s"><Badge code="reported" pop="r:li2026aa" /></td></tr>
              <tr><td class="k">top width w</td><td class="v">3.5 µm</td><td class="s"><Badge code="reported" pop="r:li2026aa" /></td></tr>
              <tr><td class="k">sidewall, reference not stated</td><td class="v">60°</td><td class="s"><Badge code="reported" pop="r:li2026aa" /></td></tr>
              <tr><td class="k">cladding, PECVD SiO<sub>2</sub></td><td class="v">2 µm</td><td class="s"><Badge code="reported" pop="r:li2026aa" /></td></tr>
              <tr><td class="k">electrode gap, Au</td><td class="v">6 µm</td><td class="s"><Badge code="reported" pop="r:li2026aa" /></td></tr>
              <tr><td class="k">n<sub>eff</sub>, TE, 1550 nm</td><td class="v">1.7696</td><td class="s"><Badge code="engine" pop="r:atlas-engine" /></td></tr>
              <tr><td class="k">n<sub>g</sub>, TE, 1550 nm</td><td class="v">2.135</td><td class="s"><Badge code="engine" pop="r:atlas-engine" /></td></tr>
            </tbody>
          </table>
          <div class="pf">Drawn from the engine model of the reported geometry: sidewall 60&deg; from the substrate plane, Au 1.0 &micro;m on the slab, buried SiO<sub>2</sub> 4.7 &micro;m (broken). One scale for both axes.</div>
            </div>
          </div>
        </div>

        <div class="panel lt-fig f27-lat" id="f27-lat" data-variant="tech" data-pair="f215m">
          <div class="ph"><span>Rib modes: n<sub>eff</sub> vs top width, TE0 / TM0 / TE1</span><span>full-vector FEM <Badge code="engine" pop="r:atlas-engine" /></span></div>
          <div class="lt-split">
            <div class="plotbox"><svg class="lp" id="f27-msvg" viewBox="0 0 600 340" role="img" aria-label="Effective index versus rib top width for the TE0, TM0 and TE1 modes at the chosen geometry">{@html I.mSvg}</svg>
              <div class="lgd"><span><i class="k"></i>TE0</span><span><i class="k s2"></i>TM0</span><span><i class="k s3"></i>TE1</span><span><i class="k f27-kfl"></i><span class="term" data-pop="f27-flags">flagged</span></span><span><i class="k s6"></i>slab, film t <Badge code="derived" pop="f27-slab" /></span><span>&#9671; Li et al. 2026 rib <Badge code="engine" pop="r:atlas-engine" /></span><span>hatch: outside lattice</span></div>
            </div>
            <div class="f27-side">
              <div class="ctl"><label for="f27-m-t-in">Film t</label><input id="f27-m-t-in" type="range" min="300" max="900" step="10" value="400"><output id="f27-m-t-o" for="f27-m-t-in">{I.mRo.t}</output></div>
              <div class="ctl"><label for="f27-m-e-in">Etch fraction</label><input id="f27-m-e-in" type="range" min="0.2" max="1" step="0.01" value="0.6"><output id="f27-m-e-o" for="f27-m-e-in">{I.mRo.e}</output></div>
              <div class="ctl"><label for="f27-m-w-in">Top width w</label><input id="f27-m-w-in" type="range" min="0" max="1000" step="1" value={I.wPos}><output id="f27-m-w-o" for="f27-m-w-in">{I.mRo.w}</output></div>
              <div class="ctl seg2"><span class="lbl">Sidewall</span><div class="seg" id="f27-m-sw" role="group" aria-label="Sidewall angle"><button data-v="60" class="on" aria-pressed="true">60°</button><button data-v="70" aria-pressed="false">70°</button><button data-v="80" aria-pressed="false">80°</button></div></div>
              <div class="ctl seg2"><span class="lbl">&lambda;</span><div class="seg" id="f27-m-lam" role="group" aria-label="Wavelength"><button data-v="0.775" aria-pressed="false">0.775 µm</button><button data-v="1.064" aria-pressed="false">1.064 µm</button><button data-v="1.55" class="on" aria-pressed="true">1.55 µm</button></div></div>
              <div class="ctl seg2"><span class="lbl">Cut</span><div class="seg" id="f27-m-cut" role="group" aria-label="Wafer cut"><button data-v="x" class="on" aria-pressed="true">x-cut</button><button data-v="z" aria-pressed="false">z-cut</button></div></div>
              <div class="ctl seg2"><span class="lbl">Readout mode</span><div class="seg" id="f27-m-mode" role="group" aria-label="Mode for the readout"><button data-v="TE0" class="on" aria-pressed="true">TE0</button><button data-v="TM0" aria-pressed="false">TM0</button><button data-v="TE1" aria-pressed="false">TE1</button></div></div>
              <div class="ctl seg2"><span class="lbl">Preset</span><span><button type="button" class="f27-logb" id="f27-m-li" data-act="li">Li et al. 2026 rib, w 3.5 µm</button></span></div>
              <table class="ro f27-mro">
                <tbody>
                  <tr><td>n<sub>eff</sub></td><td class="v" id="f27-m-neff">{I.mRo.neff}</td><td>n<sub>g</sub></td><td class="v" id="f27-m-ng">{I.mRo.ng}</td></tr>
                  <tr><td>A<sub>eff</sub></td><td class="v" id="f27-m-aeff">{I.mRo.aeff}</td><td>LN fraction</td><td class="v" id="f27-m-ln">{I.mRo.ln}</td></tr>
                  <tr><td>TE fraction</td><td class="v" id="f27-m-te">{I.mRo.te}</td><td><span class="term" data-pop="f27-flags">status</span></td><td class="v" id="f27-m-st">{I.mRo.st}</td></tr>
                </tbody>
              </table>
              <div class="f27-gap">Li et al. 2026 rib, w 3.5 µm (outside the width axis), TE0, direct solve: n<sub>eff</sub> <b>1.7696</b>, n<sub>g</sub> <b>2.135</b> <Badge code="engine" pop="r:atlas-engine" /></div>
            </div>
          </div>
          <div class="scrollx"><table class="idx f27-held">
            <thead><tr><th>Held-out error, median / p95</th><th class="r">clean / flagged</th><th class="r">n<sub>eff</sub> clean</th><th class="r">n<sub>eff</sub> flagged</th><th class="r">n<sub>eff</sub> all</th><th class="r">n<sub>g</sub> clean</th><th class="r">n<sub>g</sub> flagged</th><th class="r">n<sub>g</sub> all</th></tr></thead>
            <tbody>{@html I.held}</tbody>
          </table></div>
          <div class="pf">{I.src} <Badge code="engine" pop="f27-lat" /></div>
        </div>

      <!-- cross-section and mode lattice, VISUAL -->
      <div data-variant="visual" data-pair="f215">
        <div class="v-inst">
          <div class="v-stage f27-stage-x" id="f27-xs-v">{@html I.xsV}</div>
          <div class="v-side">
            <dl class="v-hud f27-hud3">
              <dt>Film / etch / slab</dt><dd>300 / 180 / 120 nm</dd><dd class="s"><Badge code="reported" pop="r:li2026aa" /></dd>
              <dt>Top width</dt><dd>3.5 µm</dd><dd class="s"><Badge code="reported" pop="r:li2026aa" /></dd>
              <dt>Sidewall</dt><dd>60°</dd><dd class="s"><Badge code="reported" pop="r:li2026aa" /></dd>
              <dt>PECVD SiO<sub>2</sub> cladding</dt><dd>2 µm</dd><dd class="s"><Badge code="reported" pop="r:li2026aa" /></dd>
              <dt>Au electrode gap</dt><dd>6 µm</dd><dd class="s"><Badge code="reported" pop="r:li2026aa" /></dd>
              <dt>n<sub>eff</sub>, TE, 1550 nm</dt><dd>1.7696</dd><dd class="s"><Badge code="engine" pop="r:atlas-engine" /></dd>
              <dt>n<sub>g</sub>, TE, 1550 nm</dt><dd>2.135</dd><dd class="s"><Badge code="engine" pop="r:atlas-engine" /></dd>
            </dl>
            <p class="v-cap"><b>To scale.</b> x-cut film, light along y, c across the gap: TE light and the electrode field both lie along c. Sidewall reference direction not stated in the paper; drawn 60&deg; from the substrate plane as in the engine model, Au 1.0 &micro;m thick on the slab, buried oxide (4.7 &micro;m) broken. <Badge code="engine" pop="f27-geom" /></p>
          </div>
        </div>
      </div>
      <div class="v-inst" data-variant="visual" data-pair="f215m">
        <div class="v-stage f27-stage-m" id="f27-vmodes">{@html I.mVis}</div>
        <div class="v-side">
          <div class="v-ctl" style="--w:7ch"><label for="f27-vm-t-in">Film thickness</label><output id="f27-vm-t-o" for="f27-vm-t-in">{I.mRo.t}</output><input id="f27-vm-t-in" type="range" min="300" max="900" step="10" value="400"></div>
          <div class="v-ctl" style="--w:5ch"><label for="f27-vm-e-in">Etch fraction</label><output id="f27-vm-e-o" for="f27-vm-e-in">{I.mRo.e}</output><input id="f27-vm-e-in" type="range" min="0.2" max="1" step="0.01" value="0.6"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f27-vm-w-in">Top width</label><output id="f27-vm-w-o" for="f27-vm-w-in">{I.mRo.w}</output><input id="f27-vm-w-in" type="range" min="0" max="1000" step="1" value={I.wPos}></div>
          <div class="v-ctl"><span class="v-lab">Sidewall</span><div class="v-seg" id="f27-vm-sw" role="group" aria-label="Sidewall angle"><button type="button" data-v="60" class="on" aria-pressed="true">60°</button><button type="button" data-v="70" aria-pressed="false">70°</button><button type="button" data-v="80" aria-pressed="false">80°</button></div></div>
          <div class="v-ctl"><span class="v-lab">Wavelength</span><div class="v-seg" id="f27-vm-lam" role="group" aria-label="Wavelength"><button type="button" data-v="0.775" aria-pressed="false">0.775 µm</button><button type="button" data-v="1.064" aria-pressed="false">1.064 µm</button><button type="button" data-v="1.55" class="on" aria-pressed="true">1.55 µm</button></div></div>
          <div class="v-ctl"><span class="v-lab">Cut</span><div class="v-seg" id="f27-vm-cut" role="group" aria-label="Wafer cut"><button type="button" data-v="x" class="on" aria-pressed="true">x-cut</button><button type="button" data-v="z" aria-pressed="false">z-cut</button></div></div>
          <div class="v-ctl"><span class="v-lab">Mode in the readout</span><div class="v-seg" id="f27-vm-mode" role="group" aria-label="Mode for the readout"><button type="button" data-v="TE0" class="on" aria-pressed="true">TE0</button><button type="button" data-v="TM0" aria-pressed="false">TM0</button><button type="button" data-v="TE1" aria-pressed="false">TE1</button></div></div>
          <div class="v-seg f27-tog"><button type="button" id="f27-vm-li" data-act="li">Li et al. 2026 rib, w 3.5 µm</button></div>
          <dl class="v-hud">
            <dt>n<sub>eff</sub></dt><dd id="f27-vm-neff">{I.mRo.neff}</dd>
            <dt>n<sub>g</sub></dt><dd id="f27-vm-ng">{I.mRo.ng}</dd>
            <dt>A<sub>eff</sub></dt><dd id="f27-vm-aeff">{I.mRo.aeff}</dd>
            <dt>LN fraction</dt><dd id="f27-vm-ln">{I.mRo.ln}</dd>
            <dt>TE fraction</dt><dd id="f27-vm-te">{I.mRo.te}</dd>
            <dt><span class="term" data-pop="f27-flags">Status</span></dt><dd id="f27-vm-st">{I.mRo.st}</dd>
          </dl>
          <dl class="v-hud f27-hud3">
            <dt>Li et al. 2026 rib, w 3.5 µm, TE0</dt><dd>1.7696 / 2.135</dd><dd class="s"><Badge code="engine" pop="r:atlas-engine" /></dd>
          </dl>
          <p class="v-cap"><b>Ellipse: |E<sub>x</sub>| and |E<sub>y</sub>| shares of the readout mode</b> (TE fraction), not a polarization state; light at 1064 and 1550 nm in <span class="term" data-pop="v-false">false color</span>, dashed. Grey band on a curve: <span class="term" data-pop="f27-flags">flagged</span> lattice points; dotted lines: slab of thickness t <Badge code="derived" pop="f27-slab" />; diamond: Li et al. 2026 engine value, outside the width axis.</p>
        </div>
      </div>
      <div data-variant="visual" data-pair="f215mh">
        <div class="scrollx"><table class="idx f27-held">
          <thead><tr><th>Held-out error, median / p95</th><th class="r">clean / flagged</th><th class="r">n<sub>eff</sub> clean</th><th class="r">n<sub>eff</sub> flagged</th><th class="r">n<sub>eff</sub> all</th><th class="r">n<sub>g</sub> clean</th><th class="r">n<sub>g</sub> flagged</th><th class="r">n<sub>g</sub> all</th></tr></thead>
          <tbody>{@html I.held}</tbody>
        </table></div>
        <p class="v-cap f27-src">{I.src} <Badge code="engine" pop="f27-lat" /></p>
      </div>
    </div>
  </section>

  <!-- ================= L2 ================= -->
  <section class="lay lt" id="l2" data-pair="l2" data-spine="L2 Quantitative model">
    <div class="sh"><h2 class="biref">L2 Quantitative model</h2><span class="meta">x-cut vs z-cut, ring anisotropy, loss vs Q</span></div>
    <div class="body">
      <p class="tx"><b>Geometry.</b> Film thickness <i>t</i>, etch depth <i>e</i> (slab <i>t</i> &minus; <i>e</i>), top width <i>w</i>, sidewall angle; cladding air or oxide. Li et al. 2026: <i>t</i> = 300 nm, <i>e</i> = 180 nm, slab 120 nm, <i>w</i> = 3.5 &micro;m, sidewall 60&deg; (reference direction not stated), 2 &micro;m PECVD SiO<sub>2</sub> cladding <Badge code="reported" pop="r:li2026aa" />; engine n<sub>eff</sub> = 1.7696, n<sub>g</sub> = 2.135 at 1550 nm <Badge code="engine" pop="r:atlas-engine" />.</p>

      <h3 class="h3"><span class="term" data-pop="g:x-cut">x-cut</span> vs <span class="term" data-pop="g:z-cut">z-cut</span></h3>
      <div class="scrollx">
        <table class="idx f27-tab">
          <thead><tr><th></th><th>x-cut, propagation along y</th><th>z-cut</th></tr></thead>
          <tbody>
            <tr><td class="h"><span class="term" data-pop="g:te-tm-quasi-modes">TE</span> index</td><td>n<sub>e</sub> <span class="num">2.1376</span> at 1550 nm <Badge code="derived" pop="f27-idx" /></td><td>n<sub>o</sub> <span class="num">2.2111</span> <Badge code="derived" pop="f27-idx" />, same in every in-plane direction</td></tr>
            <tr><td class="h">TM index</td><td>n<sub>o</sub></td><td>n<sub>e</sub></td></tr>
            <tr><td class="h">EO, in-plane electrodes</td><td>TE uses r<sub>33</sub></td><td>TE uses r<sub>22</sub>; TM with vertical field uses r<sub>33</sub></td></tr>
            <tr><td class="h">&chi;<sup>(2)</sup></td><td>TE type 0 uses d<sub>33</sub></td><td>TM uses d<sub>33</sub></td></tr>
            <tr><td class="h">rings</td><td>TE index varies around the ring</td><td>TE isotropic in plane</td></tr>
            <tr><td class="h">poling</td><td>coplanar in-plane electrodes, field nonuniform with depth</td><td>vertical field through the stack</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Indices: Zelmon Sellmeier, congruent LN, 21 &deg;C. Coefficient mapping: <a href="/light/pockels-effect/">2.2</a> (r tensor) and <a href="/light/second-order/">2.3</a> (d tensor).</p>

      <p class="tx"><b>Anisotropy around a ring (x-cut, bulk approximation).</b> For TE propagating at angle &phi; from crystal z within the film plane, the in-plane polarization sees</p>
      <div class="eq"><math display="block"><mrow><mfrac><mn>1</mn><msup><mrow><mi>n</mi><mo>(</mo><mi>&phi;</mi><mo>)</mo></mrow><mn>2</mn></msup></mfrac><mo>=</mo><mfrac><mrow><msup><mi>cos</mi><mn>2</mn></msup><mi>&phi;</mi></mrow><msubsup><mi>n</mi><mi>o</mi><mn>2</mn></msubsup></mfrac><mo>+</mo><mfrac><mrow><msup><mi>sin</mi><mn>2</mn></msup><mi>&phi;</mi></mrow><msubsup><mi>n</mi><mi>e</mi><mn>2</mn></msubsup></mfrac></mrow></math></div>
      <p class="tx">varying between n<sub>e</sub> (propagation along y) and n<sub>o</sub> (propagation along z): 2.1376 to 2.2111 at 1550 nm <Badge code="derived" pop="f27-ring" />, mode confinement ignored. The local phase velocity, the QPM condition and the r<sub>33</sub> projection all vary twice per round trip.</p>

      <!-- ring, TECH -->
      <div class="panel lt-fig" id="f27-ringp" data-variant="tech" data-pair="f215r">
        <div class="ph"><span>Ring: in-plane TE index n(&phi;), bulk approximation</span><span><Badge code="derived" pop="f27-ring" /></span></div>
        <div class="lt-split">
          <div class="f27-polar-w"><svg class="lp" id="f27-polar" viewBox="0 0 380 380" role="img" aria-label="Polar plot of the in-plane TE index versus propagation angle from crystal z">{@html I.polar}</svg></div>
          <div class="f27-side">
            <div class="ctl seg2"><span class="lbl">Wafer</span><div class="seg" id="f27-r-cut" role="group" aria-label="Wafer cut"><button data-v="x" class="on" aria-pressed="true">x-cut TE</button><button data-v="z" aria-pressed="false">z-cut TE</button></div></div>
            <div class="ctl"><label for="f27-r-phi-in">&phi; from z (x-cut), from x (z-cut)</label><input id="f27-r-phi-in" type="range" min="0" max="360" step="1" value="30"><output id="f27-r-phi-o" for="f27-r-phi-in">{I.ring.phi}</output></div>
            <div class="ctl"><label for="f27-r-lam-in">Wavelength &lambda;</label><input id="f27-r-lam-in" type="range" min="0.40" max="5.00" step="0.01" value="1.55"><output id="f27-r-lam-o" for="f27-r-lam-in">{I.ring.lam}</output></div>
            <table class="ro">
              <tbody>
                <tr><td>n(&phi;)</td><td class="v" id="f27-r-n">{I.ring.n}</td><td>&Delta;n in plane</td><td class="v" id="f27-r-dn">{I.ring.dn}</td></tr>
                <tr><td>n<sub>o</sub></td><td class="v" id="f27-r-no">{I.ring.no}</td><td>n<sub>e</sub></td><td class="v" id="f27-r-ne">{I.ring.ne}</td></tr>
              </tbody>
            </table>
            <div class="lgd"><span><i class="k"></i>n(&phi;)</span><span><i class="k s3"></i>n<sub>o</sub></span><span><i class="k s6"></i>n<sub>e</sub></span></div>
            <div class="pf">Square: current &phi;. Radial axis offset (inner circle at the lowest labelled index). Zelmon CLN, 21 &deg;C, 0.40 to 5.00 &micro;m; film indices may differ.</div>
          </div>
        </div>
      </div>

      <!-- ring, VISUAL -->
      <div class="v-inst" data-variant="visual" data-pair="f215r">
        <div class="v-stage f27-stage-w" id="f27-wafer">{@html I.wafer}</div>
        <div class="v-side">
          <div class="v-ctl" style="--w:5ch"><label for="f27-vr-phi-in">Rotate the wafer</label><output id="f27-vr-phi-o" for="f27-vr-phi-in">{I.ring.phi}</output><input id="f27-vr-phi-in" type="range" min="0" max="360" step="1" value="30"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f27-vr-lam-in">Wavelength</label><output id="f27-vr-lam-o" for="f27-vr-lam-in">{I.ring.lam}</output><input id="f27-vr-lam-in" type="range" min="0.40" max="5.00" step="0.01" value="1.55"></div>
          <div class="v-ctl"><span class="v-lab">Wafer cut</span><div class="v-seg" id="f27-vr-cut" role="group" aria-label="Wafer cut"><button type="button" data-v="x" class="on" aria-pressed="true">x-cut</button><button type="button" data-v="z" aria-pressed="false">z-cut</button></div></div>
          <dl class="v-hud">
            <dt>n(&phi;) at the probe</dt><dd id="f27-vr-n">{I.ring.n}</dd>
            <dt>n<sub>o</sub></dt><dd id="f27-vr-no">{I.ring.no}</dd>
            <dt>n<sub>e</sub></dt><dd id="f27-vr-ne">{I.ring.ne}</dd>
            <dt>In-plane span</dt><dd id="f27-vr-dn">{I.ring.dn}</dd>
          </dl>
          <p class="v-cap"><b>Band brightness = TE index.</b> Two bright and two dark arcs per round trip turn with the crystal; the probe stays at the top, where &phi; is the angle between the light and c (x-cut) or x (z-cut). Bulk approximation, mode confinement ignored; ring not to scale. Indices: Zelmon Sellmeier, congruent LN, 21 &deg;C, 0.40 to 5.00 &micro;m; film indices may differ. <Badge code="derived" pop="f27-ring" /></p>
        </div>
      </div>

      <p class="tx"><b>Mode hybridization.</b> Where a TE and a TM mode of the same waveguide would cross in n<sub>eff</sub>, any broken symmetry (slanted sidewalls, a slab on one side, an off-axis crystal orientation) couples them into hybrid modes with an anticrossing (<span class="term" data-pop="g:mode-hybridization">hybridization</span>). In TFLN ridges this affects even the fundamental modes (<span class="term" data-pop="r:pan2019">Pan et al. 2019</span>). In x-cut strip waveguides the hybrid regions depend on dimensions, sidewall angle and wavelength, and tapers through them convert TM0 to higher-order TE (99.5%, numerical) <Badge code="reported" pop="r:kaushalram2020" />. In x-cut microrings the rotating birefringence converts TE to TM and creates avoided mode crossings that suppress one four-wave-mixing sideband <Badge code="reported" pop="r:tan2024" />. Arrayed-waveguide gratings need anisotropy-aware layouts (<span class="term" data-pop="r:wangc2024">Wang 2024</span>).</p>

      <p class="tx"><b>Loss and Q.</b></p>
      <div class="eq"><math display="block"><mrow><mi>&alpha;</mi><mo>=</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi><msub><mi>n</mi><mi>g</mi></msub></mrow><mrow><msub><mi>Q</mi><mi>i</mi></msub><mi>&lambda;</mi></mrow></mfrac><mo>,</mo><mspace width="1.4em"/><msub><mi>&alpha;</mi><mi>dB</mi></msub><mo>=</mo><mn>4.343</mn><mi>&alpha;</mi></mrow></math><span class="eqn">(2.20)</span></div>
      <p class="tx">At 1550 nm with <span class="term" data-pop="g:group-index">n<sub>g</sub></span> = 2.3 <Badge code="template" pop="f27-ng" />: Q<sub>i</sub> = 1e7 &rarr; 4.05 dB/m; 2.9e7 &rarr; 1.40 dB/m; 1.6e8 &rarr; 0.25 dB/m <Badge code="derived" pop="f27-conv" />. Published conversions use each device's own n<sub>g</sub> (e.g. 1.3 dB/m for Q<sub>i</sub> 29 million <Badge code="reported" pop="r:zhu2024" />).</p>

      <!-- loss and Q, TECH -->
      <div class="panel lt-fig" id="f27-lossp" data-variant="tech" data-pair="f216">
        <div class="ph"><span>Loss and Q records vs year</span><span><button type="button" class="f27-logb on" id="f27-l-log" aria-pressed="true">log loss axis</button></span></div>
        <div class="lt-split">
          <div class="plotbox"><svg class="lp" id="f27-lsvg" viewBox="0 0 600 330" role="img" aria-label="Propagation loss of TFLN records versus year with the material and bulk absorption floors">{@html I.lossT}</svg>
            <div class="lgd"><span>&#9632; loss reported</span><span>&#9633;&darr; Q only, n<sub>g</sub> 2.3 <Badge code="template" pop="f27-qb" /></span><span><i class="k s2"></i>material limit <Badge code="reported" pop="r:shamsansari2022" /></span><span>band <Badge code="derived" pop="f27-band" /></span><span><i class="k s6"></i>bulk CLN <Badge code="derived" pop="f27-bulk" /></span><span><i class="k f27-kc"></i>converter</span></div>
          </div>
          <div class="f27-side">
            <div class="ctl"><label for="f27-l-q-tx">Q<sub>i</sub></label><input id="f27-l-q-in" type="range" min="0" max="1000" step="1" value={I.qPos} aria-label="Intrinsic Q, log scale"><input class="f27-num" id="f27-l-q-tx" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value={I.qTx}></div>
            <div class="ctl"><label for="f27-l-ng-in">n<sub>g</sub> <Badge code="template" pop="f27-ng" /></label><input id="f27-l-ng-in" type="range" min="1.80" max="2.60" step="0.001" value="2.3"><output id="f27-l-ng-o" for="f27-l-ng-in">{I.ng}</output></div>
            <div class="ctl"><label for="f27-l-lam-in">Wavelength &lambda;</label><input id="f27-l-lam-in" type="range" min="0.40" max="2.00" step="0.005" value="1.55"><output id="f27-l-lam-o" for="f27-l-lam-in">{I.lam}</output></div>
            <div class="ctl"><label for="f27-l-a-tx">or type &alpha;, dB/m</label><span></span><input class="f27-num" id="f27-l-a-tx" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value={I.aTx}></div>
            <table class="ro">
              <tbody>
                <tr><td>&alpha;<sub>dB</sub></td><td class="v" id="f27-l-db">{I.loss.db}</td><td>&alpha;</td><td class="v" id="f27-l-a">{I.loss.a}</td></tr>
                <tr><td>Q<sub>i</sub></td><td class="v" id="f27-l-q">{I.loss.q}</td><td>to floor</td><td class="v" id="f27-l-f">{I.loss.f}</td></tr>
              </tbody>
            </table>
            <div class="f27-gap">Best dry-etched ring (Zhu et al. 2024) to the material floor: <b>{GAP.q.toFixed(1)}&times;</b> in Q, <b>{GAP.loss.toFixed(1)}&times;</b> in loss <Badge code="derived" pop="f27-gap" /></div>
            <div class="pf">Type Q<sub>i</sub> (e.g. 1.6e8) or &alpha;; eq. 2.20 converts with the n<sub>g</sub> and &lambda; set here. Q<sub>i</sub> slider 1e5 to 1e9.</div>
          </div>
        </div>
      </div>

      <!-- loss and Q, VISUAL -->
      <div class="v-inst" data-variant="visual" data-pair="f216">
        <div class="v-stage f27-stage-s" id="f27-stair">{@html I.lossV}</div>
        <div class="v-side">
          <div class="v-ctl f27-qrow" style="--w:9ch"><label for="f27-vl-q-tx">Intrinsic Q, type or slide</label><input class="f27-num" id="f27-vl-q-tx" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value={I.qTx}><input id="f27-vl-q-in" type="range" min="0" max="1000" step="1" value={I.qPos} aria-label="Intrinsic Q, log scale"></div>
          <div class="v-ctl" style="--w:6ch"><label for="f27-vl-ng-in">Group index n<sub>g</sub> <Badge code="template" pop="f27-ng" /></label><output id="f27-vl-ng-o" for="f27-vl-ng-in">{I.ng}</output><input id="f27-vl-ng-in" type="range" min="1.80" max="2.60" step="0.001" value="2.3"></div>
          <div class="v-ctl" style="--w:9ch"><label for="f27-vl-lam-in">Wavelength</label><output id="f27-vl-lam-o" for="f27-vl-lam-in">{I.lam}</output><input id="f27-vl-lam-in" type="range" min="0.40" max="2.00" step="0.005" value="1.55"></div>
          <div class="v-ctl f27-qrow" style="--w:9ch"><label for="f27-vl-a-tx">Or type the loss, dB/m</label><input class="f27-num" id="f27-vl-a-tx" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value={I.aTx}></div>
          <dl class="v-hud">
            <dt>Loss</dt><dd id="f27-vl-db">{I.loss.db}</dd>
            <dt>&alpha;</dt><dd id="f27-vl-a">{I.loss.a}</dd>
            <dt>Q<sub>i</sub></dt><dd id="f27-vl-q">{I.loss.q}</dd>
            <dt>Floor Q / Q<sub>i</sub></dt><dd id="f27-vl-f">{I.loss.f}</dd>
          </dl>
          <div class="v-seg f27-tog"><button type="button" id="f27-vl-log" class="on" aria-pressed="true">Log loss axis</button></div>
          <p class="f27-gapv">Best dry-etched ring to the floor: <b>{GAP.q.toFixed(1)}&times;</b> in Q, <b>{GAP.loss.toFixed(1)}&times;</b> in loss. <Badge code="derived" pop="f27-gap" /></p>
          <p class="v-cap"><b>Rim brightness = Q.</b> Rings sorted by loss; dashed rims: Q only, placed with n<sub>g</sub> 2.3 at 1550 nm <Badge code="template" pop="f27-qb" />. Band: material floor <Badge code="reported" pop="r:shamsansari2022" /> <Badge code="derived" pop="f27-band" />; dashed line: bulk absorption <Badge code="derived" pop="f27-bulk" />. Type 1.6e8 to land on the band.</p>
        </div>
      </div>

      <h3 class="h3">Loss and Q records</h3>
      <div class="scrollx">
        <table class="idx f27-tab f27-rec">
          <thead><tr><th>Platform</th><th>Loss or Q</th><th class="r">Plotted, dB/m</th><th>Date</th><th>Source</th></tr></thead>
          <tbody>
            {#each RECS as r (r.id)}
              <tr><td class="h">{r.plat}</td><td>{@html r.val}</td><td class="num">{plotted(r)}{#if r.how === "unit"} <Badge code="derived" pop="f27-unit" />{:else if r.how === "q-bound"} <Badge code="template" pop="f27-qb" />{/if}</td><td class="lp0">{r.date}</td><td class="b0">{r.cite} <Badge code="reported" pop={r.src} /></td></tr>
            {/each}
            <tr><td class="h">material limit, annealed ion-sliced film</td><td>Q 1.6e8; 0.2 dB/m</td><td class="num">{FLOOR.dbm} <Badge code="reported" pop={FLOOR.src} /></td><td class="lp0">2022-08-01</td><td class="b0">Shams-Ansari et al. 2022 <Badge code="reported" pop={FLOOR.src} /></td></tr>
            <tr><td class="h">bulk CLN absorption, 390 to 3800 nm</td><td>&lt; 1e&minus;4 to 2 /cm</td><td class="num">{BULK.dbm.toFixed(3)} <Badge code="derived" pop="f27-bulk" /></td><td class="lp0">2015</td><td class="b0">Leidinger et al. 2015 <Badge code="reported" pop={BULK.src} /></td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">1e&minus;4 /cm = 0.043 dB/m. Q-only rows are plotted as upper bounds on loss at n<sub>g</sub> = 2.3, 1550 nm.</p>
    </div>
  </section>

  <!-- ================= L3 ================= -->
  <section class="lay lt" id="l3" data-pair="l3" data-spine="L3 Mechanisms, computation, measurement">
    <div class="sh"><h2 class="biref">L3 Mechanisms, computation, measurement</h2><span class="meta">loss mechanisms, FEM, ring fits</span></div>
    <div class="body">
      <h3 class="h3">Loss mechanisms</h3>
      <ul class="tx">
        <li>Sidewall and top-surface roughness scattering, set by lithography and Ar<sup>+</sup> milling (redeposition: chapter 05).</li>
        <li>Material absorption: transition-metal impurities give up to 0.04 /cm in as-grown crystals, H-related bands about 0.001 /cm at 2300 to 2800 nm; annealing lowers absorption up to 10&times; <Badge code="P" pop="r:schwesyg2011" />. Ion-slicing damage: post-fabrication annealing raises the material-limited Q (<span class="term" data-pop="r:shamsansari2022">Shams-Ansari et al. 2022</span>).</li>
        <li>Cladding absorption in the mid-IR: silica absorbs beyond 2.5 &micro;m, which motivates LN on sapphire <Badge code="reported" pop="r:mishra2021" />.</li>
        <li>Bend radiation and substrate leakage (slab modes, thin buried oxide).</li>
        <li>Metal absorption where electrodes approach the mode; Li et al. 2026 attribute their 2.8 dB on-chip loss to splitters, propagation and electrode absorption <Badge code="reported" pop="r:li2026aa" />.</li>
        <li>Photorefractive and charge effects at high power (chapter 04); removing the dielectric cladding mitigates photorefraction in rings <Badge code="reported" pop="r:xu2021" />.</li>
      </ul>

      <h3 class="h3">Computing modes</h3>
      <p class="tx">Full-vector finite-element method (FEM) with the anisotropic permittivity rotated into the lab frame (x lateral, y vertical, z propagation; x-cut with propagation along crystal y puts crystal z along lab x) (<span class="term" data-pop="r:atlas-engine">eo-modulator-atlas engine</span>). A scalar or effective-index solver is wrong for high-contrast anisotropic ribs. The n<sub>eff</sub> 1.7696 and n<sub>g</sub> 2.135 <Badge code="engine" pop="r:atlas-engine" /> of the Li et al. 2026 rib come from this solver.</p>

      <h3 class="h3">Measuring loss</h3>
      <p class="tx">Ring transmission fits give loaded Q and, with the coupling regime identified (under- vs overcoupled), intrinsic Q; conversion to dB/m needs n<sub>g</sub> from the measured <span class="term" data-pop="g:free-spectral-range">FSR</span>:</p>
      <div class="eq"><math display="block"><mrow><mi>FSR</mi><mo>=</mo><mfrac><msup><mi>&lambda;</mi><mn>2</mn></msup><mrow><msub><mi>n</mi><mi>g</mi></msub><msub><mi>L</mi><mi>rt</mi></msub></mrow></mfrac></mrow></math></div>
      <p class="tx">Cut-back measurements separate propagation from facet loss but need many lengths for sub-dB/cm accuracy.</p>

      <h3 class="h3">Errors</h3>
      <p class="tx">Bulk Zelmon indices at 21 &deg;C stand in for film indices; ion-sliced and annealed films may differ (composition, residual strain, Li out-diffusion: chapters 01, 05). Film-thickness nonuniformity across a wafer moves n<sub>eff</sub> and therefore the QPM wavelength (<a href="/light/second-order/">2.3</a>) and ring resonances. Real x-cut ring modes need an azimuthal treatment of the confined mode; the ring index above is the bulk indicatrix projection.</p>
    </div>
  </section>

  <SectionEnd slug="tfln-waveguides" refs={data.content.refList} />
</ChapterPage>
