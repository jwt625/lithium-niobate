<!-- F6.08 SHG converter. TECH: mono log-log P2(P1) with undepleted and depleted laws + control rows. VISUAL: poled
     waveguide at 2 px/um with pump fading and second harmonic growing along z, plot below, 44 px controls. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { SHG_DEFAULT, shgArt, shgOuts, shgPlot, type ShgState } from "./f608";

  let { init, hov }: { init: { plT: string; plV: string; art: string; outs: Record<string, string> }; hov: Record<string, string> } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: ShgState = { ...SHG_DEFAULT };
    const h = mountFig(host, { id: "f608", state, plots: { pl: (s, w, hh, look) => shgPlot(s, w, hh, look), art: (s, w, hh) => shgArt(s, w, hh) }, outs: (s) => shgOuts(s), hover: (id) => hov[id] ?? null });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f608" data-look="tech">
    <div class="ph"><span>SHG in a TFLN PPLN waveguide, phase matched, lossless</span><span class="dim">normalized &eta; in %/W/cm<sup>2</sup></span></div>
    <div class="dv-pw h280" data-p="pl">{@html init.plT}</div>
    <div class="ro" aria-live="polite"><span>&eta;L<sup>2</sup> <b data-o="etaL2" style="width:12ch">{@html O.etaL2}</b></span><span>P<sub>2&omega;</sub> <b data-o="P2" style="width:11ch">{@html O.P2}</b></span><span>conversion <b data-o="conv" style="width:7ch">{@html O.conv}</b></span><span>&Lambda; (bulk) <b data-o="Lam" style="width:9ch">{@html O.Lam}</b></span></div>
    <div class="ctl"><label for="f608-e">&eta;<sub>norm</sub></label><input id="f608-e" type="range" data-k="eta" data-log min="2" max="4" step="0.005" value={Math.log10(2600)}><output data-o="eta">{@html O.eta}</output></div>
    <div class="ctl"><label for="f608-L">Length L</label><input id="f608-L" type="range" data-k="L" min="1" max="30" step="0.1" value="4"><output data-o="L">{@html O.L}</output></div>
    <div class="ctl"><label for="f608-P">Pump P<sub>&omega;</sub></label><input id="f608-P" type="range" data-k="P1" data-log min="-1" max="3" step="0.01" value={Math.log10(20)}><output data-o="P1">{@html O.P1}</output></div>
    <div class="ctl"><label for="f608-l">Pump &lambda;</label><input id="f608-l" type="range" data-k="lam" min="1.4" max="1.7" step="0.001" value="1.55"><output data-o="lam">{@html O.lam}</output></div>
    <div class="pf"><span style="white-space:normal">Default &eta;<sub>norm</sub> 2,600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:wang2018optica" />; highest normalized TFLN waveguide value in the papers cited here 9,600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:li2024apn" /> (its 85% absolute conversion has no stated pump power; not plotted). Marker: &gt; 80% at 20 mW <Badge code="reported" pop="r:chen2024nn" />. Laws <Badge code="derived" pop="st:derived" />; &Lambda; = &lambda;/(2(n<sub>2&omega;</sub> &minus; n<sub>&omega;</sub>)) with bulk Zelmon n<sub>e</sub>, 21 C <Badge code="P-db" pop="r:zelmon1997" /> (waveguide periods are shorter). Above a few tens of mW the slope-2 line bends over: the pump is used up.</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f608" data-look="visual">
    <div class="v-stage v-frame"><div class="dv-pw h240" data-p="art">{@html init.art}</div></div>
    <div class="v-figrow" style="margin-top:28px">
      <div class="v-stage"><div class="dv-pw h360" data-p="pl">{@html init.plV}</div></div>
      <div>
        <div class="v-ctl" style="--w:9ch"><span class="v-lab">Conversion</span><output data-o="conv">{@html O.conv}</output></div>
        <dl class="v-hud"><dt>Second-harmonic power</dt><dd data-o="P2">{@html O.P2}</dd><dt>&eta;L<sup>2</sup></dt><dd data-o="etaL2">{@html O.etaL2}</dd><dt>Poling period (bulk)</dt><dd data-o="Lam">{@html O.Lam}</dd></dl>
        <div class="v-ctls" style="grid-template-columns:minmax(0,1fr)">
          <div class="v-ctl" style="--w:9ch"><label for="f608v-P">Pump power</label><output data-o="P1">{@html O.P1}</output><input id="f608v-P" type="range" data-k="P1" data-log min="-1" max="3" step="0.01" value={Math.log10(20)}></div>
          <div class="v-ctl" style="--w:8ch"><label for="f608v-L">Length</label><output data-o="L">{@html O.L}</output><input id="f608v-L" type="range" data-k="L" min="1" max="30" step="0.1" value="4"></div>
          <div class="v-ctl" style="--w:14ch"><label for="f608v-e">Normalized efficiency</label><output data-o="eta">{@html O.eta}</output><input id="f608v-e" type="range" data-k="eta" data-log min="2" max="4" step="0.005" value={Math.log10(2600)}></div>
          <div class="v-ctl" style="--w:7ch"><label for="f608v-l">Pump wavelength</label><output data-o="lam">{@html O.lam}</output><input id="f608v-l" type="range" data-k="lam" min="1.4" max="1.7" step="0.001" value="1.55"></div>
        </div>
      </div>
    </div>
    <div class="v-prov"><span>Above a few tens of mW the slope-2 line bends over: the pump is used up. Laws: undepleted P<sub>2&omega;</sub> = &eta;L<sup>2</sup>P<sub>&omega;</sub><sup>2</sup>, depleted P<sub>&omega;</sub> tanh<sup>2</sup>(&radic;(&eta;P<sub>&omega;</sub>) L) <Badge code="derived" pop="st:derived" />. Domain stripes are drawn at the computed bulk period from Zelmon n<sub>e</sub>, 21 C <Badge code="P-db" pop="r:zelmon1997" /> (waveguide periods are shorter). Default efficiency 2,600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:wang2018optica" />; highest normalized TFLN waveguide value in the papers cited here 9,600 %/W/cm<sup>2</sup> <Badge code="reported" pop="r:li2024apn" /> (its 85% absolute conversion has no stated pump power; not plotted). Marker: &gt; 80% at 20 mW <Badge code="reported" pop="r:chen2024nn" />.</span></div>
  </div>
</div>
