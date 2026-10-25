<!-- F6.10 Resonant EO comb. TECH: mono stem plot (dB) + controls. VISUAL: ring with microwave electrodes and the comb
     drawn as dashed false-color stems; plot; 44 px controls. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { COMB_DEFAULT, combArt, combOuts, combPlot, type CombState } from "./f610";

  let { init, hov }: { init: { plT: string; plV: string; art: string; outs: Record<string, string> }; hov: Record<string, string> } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: CombState = { ...COMB_DEFAULT };
    const h = mountFig(host, { id: "f610", state, plots: { pl: (s, w, hh, look) => combPlot(s, w, hh, look), art: (s, w, hh) => combArt(s, w, hh) }, outs: (s) => combOuts(s), hover: (id) => hov[id] ?? null });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f610" data-look="tech">
    <div class="ph"><span>Resonant EO comb, through port, critical coupling, FSR 10 GHz</span><span class="dim">model; 1201 lines computed (±6 THz)</span></div>
    <div class="dv-pw h280" data-p="pl">{@html init.plT}</div>
    <div class="ro" aria-live="polite"><span>lines above &minus;60 dB <b data-o="n" style="width:5ch">{@html O.n}</b></span><span>span <b data-o="span" style="width:9ch">{@html O.span}</b></span><span><b data-o="edge" style="width:30ch;text-align:left">{@html O.edge}</b></span></div>
    <div class="ctl"><label for="f610-b">Modulation index &beta;</label><input id="f610-b" type="range" data-k="beta" min="0" max="3.14159" step="0.01" value="1"><output data-o="beta">{@html O.beta}</output></div>
    <div class="ctl"><label for="f610-q">Intrinsic Q</label><input id="f610-q" type="range" data-k="Qi" data-log min="5" max="7" step="0.01" value={Math.log10(1.5e6)}><output data-o="Qi">{@html O.Qi}</output></div>
    <div class="ctl"><span class="k">Dispersion</span><div class="seg" data-k="disp" role="group" aria-label="Dispersion"><button type="button" data-v="0" class="on">off</button><button type="button" data-v="1">on (D<sub>2</sub>/2&pi; = 10 kHz)</button></div><output><Badge code="template" pop="st:template" /></output></div>
    <div class="pf"><span style="white-space:normal">Model <Badge code="derived" pop="st:derived" />: lumped phase modulation &beta; = &pi;V/V<sub>&pi;</sub> per round trip at exactly one FSR (round-trip recursion; with dispersion, coupled-mode sideband equations). FSR and D<sub>2</sub> are templates. A stronger drive flattens the triangular envelope on the dB axis, so more lines clear &minus;60 dB. Bracket: &gt; 900 lines at about 10 GHz reported by Zhang 2019 <Badge code="reported" pop="r:zhang2019nat" />, a reference, not a fit.</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f610" data-look="visual">
    <div class="v-stage v-frame"><div class="dv-pw h260" data-p="art">{@html init.art}</div></div>
    <div class="v-figrow" style="margin-top:28px">
      <div class="v-stage"><div class="dv-pw h360" data-p="pl">{@html init.plV}</div></div>
      <div>
        <div class="v-ctl" style="--w:6ch"><span class="v-lab">Lines within 60 dB</span><output data-o="n">{@html O.n}</output></div>
        <dl class="v-hud"><dt>Optical span</dt><dd data-o="span">{@html O.span}</dd></dl>
        <div class="v-ctls" style="grid-template-columns:minmax(0,1fr)">
          <div class="v-ctl" style="--w:8ch"><label for="f610v-b">Drive (modulation index)</label><output data-o="beta">{@html O.beta}</output><input id="f610v-b" type="range" data-k="beta" min="0" max="3.14159" step="0.01" value="1"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f610v-q">Intrinsic Q</label><output data-o="Qi">{@html O.Qi}</output><input id="f610v-q" type="range" data-k="Qi" data-log min="5" max="7" step="0.01" value={Math.log10(1.5e6)}></div>
          <div class="v-ctl"><span class="v-lab">Dispersion</span><div class="v-seg" data-k="disp" role="group" aria-label="Dispersion"><button type="button" data-v="0" class="on">off</button><button type="button" data-v="1">on (D<sub>2</sub>/2&pi; = 10 kHz)</button></div></div>
        </div>
      </div>
    </div>
    <div class="v-prov"><span>A stronger drive flattens the triangular envelope on the dB axis, so more lines clear &minus;60 dB. Model <Badge code="derived" pop="st:derived" />: through port, critical coupling, lumped phase modulation &beta; = &pi;V/V<sub>&pi;</sub> per round trip at exactly one FSR (round-trip recursion; with dispersion, coupled-mode sideband equations); FSR 10 GHz and D<sub>2</sub> are templates <Badge code="template" pop="st:template" />. Bracket: &gt; 900 lines at about 10 GHz reported by Zhang 2019 <Badge code="reported" pop="r:zhang2019nat" />, a reference, not a fit. Lines at telecom wavelengths drawn in <span class="ir">false color</span>.</span></div>
  </div>
</div>
