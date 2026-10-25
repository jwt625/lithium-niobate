<!-- F6.06: A4 footprint (V_pi vs electrode length, iso-V_pi L lines) and A5 V_pi L vs wavelength (TFLN, TFLT) with the
     F6.03 model curve; one fixed box, two-state toggle. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { chartA4, chartA5 } from "./charts";
  import { atlasHover, qual, qualVpil, type Pt } from "./atlas";
  import { pad } from "../fmt";

  let { init, a4, a5, stamp }: { init: { T: string; V: string }; a4: Pt[]; a5: Pt[]; stamp: string } = $props();
  let host: HTMLElement;
  onMount(() => {
    const state = { view: "a4", gap: 5, Gamma: 0.5 };
    const h4 = atlasHover((d) => [["length", d.length_mm, "mm", qual(d, "length_mm")], ["V<sub>&pi;</sub> (DC)", d.vpi_dc_v, "V", qual(d, "vpi_dc_v")], ["V<sub>&pi;</sub>L", d.vpil_best, "V cm", qualVpil(d)]]);
    const h5 = atlasHover((d) => [["wavelength", d.wavelength_nm, "nm", undefined], ["V<sub>&pi;</sub>L", d.vpil_best, "V cm", qualVpil(d)], ["class", undefined, d.device_class ?? "", undefined]]);
    const h = mountFig(host, {
      id: "f606", state,
      plots: { v: (s, w, hh, look) => (s.view === "a5" ? chartA5(a5, { gap: Number(s.gap), Gamma: Number(s.Gamma) }, w, hh, look) : chartA4(a4, w, hh, look)) },
      outs: (s) => ({ gap: `${pad(Number(s.gap).toFixed(1), 4)} µm`, Gamma: pad(Number(s.Gamma).toFixed(2), 4), n: s.view === "a5" ? `${a5.length} rows, TFLN and TFLT, all bands` : `${a4.length} rows, telecom, all platforms` }),
      hover: (id) => (state.view === "a5" ? h5(id) : h4(id)),
    });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f606" data-look="tech">
    <div class="ph"><span><span class="seg" data-k="view" role="group" aria-label="View"><button type="button" data-v="a4" class="on">Footprint</button><button type="button" data-v="a5">Wavelength</button></span></span><span class="dim" data-o="n" style="display:inline-block;width:40ch;text-align:right;white-space:nowrap;overflow:hidden">{a4.length} rows, telecom, all platforms</span></div>
    <div class="dv-pw h360" data-p="v">{@html init.T}</div>
    <div class="dv-grid">
      <div class="ctl"><label for="f606-g">Model gap (wavelength view) <Badge code="template" pop="st:template" /></label><input id="f606-g" type="range" data-k="gap" min="1" max="15" step="0.1" value="5"><output data-o="gap">  5.0 µm</output></div>
      <div class="ctl"><label for="f606-G">Model &Gamma; (wavelength view) <Badge code="template" pop="st:template" /></label><input id="f606-G" type="range" data-k="Gamma" min="0.1" max="1" step="0.01" value="0.5"><output data-o="Gamma">0.50</output></div>
    </div>
    <div class="pf"><span style="white-space:normal">Footprint: device rows, MZM/IQ, telecom, push-pull, V<sub>&pi;</sub> (DC) and length; dashed: constant V<sub>&pi;</sub>L = 0.1, 0.3, 1, 3, 10 V cm. Wavelength: TFLN/TFLT push-pull rows, all classes; dashed: V<sub>&pi;</sub>L = &lambda;g/(2n<sub>e</sub><sup>3</sup>r<sub>33</sub>&Gamma;) with Zelmon n<sub>e</sub> and r<sub>33</sub> 30.8 pm/V <Badge code="derived" pop="st:derived" />; shaded: O, E, S, C, L bands. <Badge code="reported" pop="atlas" /></span><span class="stampl">{@html stamp}</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f606" data-look="visual">
    <div class="v-seg" data-k="view" role="group" aria-label="View"><button type="button" data-v="a4" class="on">Footprint</button><button type="button" data-v="a5">Wavelength</button></div>
    <div class="v-stage" style="margin-top:18px"><div class="dv-pw h480" data-p="v">{@html init.V}</div></div>
    <div class="v-ctls">
      <div class="v-ctl" style="--w:8ch"><label for="f606v-g">Model gap (wavelength view)</label><output data-o="gap">  5.0 µm</output><input id="f606v-g" type="range" data-k="gap" min="1" max="15" step="0.1" value="5"></div>
      <div class="v-ctl" style="--w:5ch"><label for="f606v-G">Model overlap &Gamma;</label><output data-o="Gamma">0.50</output><input id="f606v-G" type="range" data-k="Gamma" min="0.1" max="1" step="0.01" value="0.5"></div>
    </div>
    <div class="v-prov"><span>Footprint: drive voltage against electrode length; the dashed diagonals are constant V<sub>&pi;</sub>L. Wavelength: shorter wavelengths need less voltage-length (V<sub>&pi;</sub>L scales with &lambda;/n<sup>3</sup> and the gap shrinks with the mode); gold dashed curve = V<sub>&pi;</sub>L = &lambda;g/(2n<sub>e</sub><sup>3</sup>r<sub>33</sub>&Gamma;) with template gap and overlap <Badge code="template" pop="st:template" />, Zelmon n<sub>e</sub> and r<sub>33</sub> 30.8 pm/V <Badge code="derived" pop="st:derived" />. Footprint: device rows, MZM/IQ, telecom, push-pull, V<sub>&pi;</sub> (DC) and length; dashed: V<sub>&pi;</sub>L = 0.1, 0.3, 1, 3, 10 V cm. Wavelength: TFLN/TFLT push-pull rows, all classes; shaded: O, E, S, C, L bands. <Badge code="reported" pop="atlas" /></span><span>{@html stamp}</span></div>
  </div>
</div>
