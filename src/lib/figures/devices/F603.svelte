<!-- F6.03 V_pi L calculator with the A3 implied-overlap scatter. TECH: line-drawn cross-section + monochrome scatter +
     mono controls. VISUAL: to-scale cross-section (Au, LN, SiO2, field lines, 1550 nm mode, overlap) + colour scatter. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { CALC_DEFAULT, calcOuts, crossSection, type CalcState } from "./f603";
  import { chartA3, gammaImplied, R33 } from "./charts";
  import { atlasHover, type Pt } from "./atlas";

  let { init, pts, stamp }: { init: { xsT: string; xsV: string; a3T: string; a3V: string; outs: Record<string, string> }; pts: Pt[]; stamp: string } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: CalcState = { ...CALC_DEFAULT };
    const byId = new Map(pts.map((p) => [p.id, p]));
    const hov = atlasHover((d) => {
      const p = byId.get(d.device_id);
      return [["gap", d.electrode_gap_um, "µm", undefined], ["wavelength", d.wavelength_nm, "nm", undefined], ["V<sub>&pi;</sub>L", d.vpil_best, "V cm", undefined],
        ["&Gamma; implied", p ? gammaImplied(p, R33[state.r33] ?? 30.8) : undefined, "", undefined]];
    });
    const h = mountFig(host, {
      id: "f603", state,
      plots: { xs: (s, w, hh, look) => crossSection(s, w, hh, look), a3: (s, w, hh, look) => chartA3(pts, s, w, hh, look) },
      outs: (s) => calcOuts(s),
      hover: (id) => hov(id),
    });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f603" data-look="tech">
    <div class="ph"><span>V<sub>&pi;</sub>L = &lambda;g / (2 n<sub>e</sub><sup>3</sup> r<sub>33</sub> &Gamma;), push-pull, x-cut TE</span><span class="dim">{pts.length} atlas rows</span></div>
    <div class="dv-grid">
      <div class="dv-pw h280" data-p="xs">{@html init.xsT}</div>
      <div class="dv-pw h280" data-p="a3">{@html init.a3T}</div>
    </div>
    <div class="ro" aria-live="polite">
      <span>V<sub>&pi;</sub>L <b data-o="vpil" style="width:10ch">{@html O.vpil}</b></span><span>n<sub>e</sub> <b data-o="ne" style="width:6ch">{@html O.ne}</b></span>
      <span>&Gamma; <b data-o="Gamma" style="width:4ch">{@html O.Gamma}</b></span><span>vs 1.55 µm <b data-o="rel" style="width:6ch">{@html O.rel}</b></span>
    </div>
    <div class="ctl"><label for="f603-g">Gap g <Badge code="template" pop="st:template" /></label><input id="f603-g" type="range" data-k="gap" min="1" max="15" step="0.1" value="5"><output data-o="gap">{@html O.gap}</output></div>
    <div class="ctl"><label for="f603-G">Overlap &Gamma; <Badge code="template" pop="st:template" /></label><input id="f603-G" type="range" data-k="Gamma" min="0.1" max="1" step="0.01" value="0.5"><output data-o="Gamma">{@html O.Gamma}</output></div>
    <div class="ctl"><label for="f603-l">Wavelength &lambda;</label><input id="f603-l" type="range" data-k="lam" min="0.4" max="4" step="0.005" value="1.55"><output data-o="lam">{@html O.lam}</output></div>
    <div class="ctl"><span class="k">r<sub>33</sub> source</span><div class="seg" data-k="r33" role="group" aria-label="r33 source"><button type="button" data-v="turner" class="on">30.8 Turner 1966</button><button type="button" data-v="kaminow">28.8 Kaminow 1980</button></div><output><Badge code="P-comp" pop="r:weis1985" /></output></div>
    <div class="ctl"><span class="k">Scatter y axis</span><div class="seg" data-k="logy" role="group" aria-label="y axis scale"><button type="button" data-v="1" class="on">log</button><button type="button" data-v="0">linear</button></div><output></output></div>
    <div class="pf"><span style="white-space:normal">r<sub>33</sub>: 633 nm clamped values (no primary 1550 nm value in the sources held). n<sub>e</sub>(&lambda;): Zelmon 1997, 21 C <Badge code="P-db" pop="r:zelmon1997" />. Scatter: &Gamma;<sub>implied</sub> = &lambda;g / (2 n<sub>e</sub><sup>3</sup> r<sub>33</sub> V<sub>&pi;</sub>L) per atlas row <Badge code="derived" pop="atlas" />; hollow: slow light, material-enhancement claim, hybrid Si/SiN, unetched LN; rows within 12% of &lambda; in full tone; crosshair = slider state.</span><span class="stampl">{@html stamp}</span></div>
  </div>

  <div class="dvv" data-variant="visual" data-fig="f603" data-look="visual">
    <div class="v-figrow">
      <div class="v-stage v-frame"><div class="dv-pw h340" data-p="xs">{@html init.xsV}</div></div>
      <div>
        <div class="v-ctl" style="--w:10ch"><span class="v-lab">V<sub>&pi;</sub>L, push-pull</span><output data-o="vpil">{@html O.vpil}</output></div>
        <dl class="v-hud">
          <dt>n<sub>e</sub> at &lambda; (Zelmon 1997)</dt><dd data-o="ne">{@html O.ne}</dd>
          <dt>r<sub>33</sub> (633 nm, clamped)</dt><dd data-o="r33">{@html O.r33}</dd>
          <dt>Reduction vs 1.55 µm</dt><dd data-o="rel">{@html O.rel}</dd>
        </dl>
        <div class="v-ctls" style="grid-template-columns: minmax(0,1fr)">
          <div class="v-ctl" style="--w:8ch"><label for="f603v-l">Wavelength</label><output data-o="lam">{@html O.lam}</output><input id="f603v-l" type="range" data-k="lam" min="0.4" max="4" step="0.005" value="1.55"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f603v-g">Electrode gap</label><output data-o="gap">{@html O.gap}</output><input id="f603v-g" type="range" data-k="gap" min="1" max="15" step="0.1" value="5"></div>
          <div class="v-ctl" style="--w:5ch"><label for="f603v-G">Overlap &Gamma;</label><output data-o="Gamma">{@html O.Gamma}</output><input id="f603v-G" type="range" data-k="Gamma" min="0.1" max="1" step="0.01" value="0.5"></div>
          <div class="v-ctl"><span class="v-lab">r<sub>33</sub> source</span><div class="v-seg" data-k="r33" role="group" aria-label="r33 source"><button type="button" data-v="turner" class="on">Turner 30.8</button><button type="button" data-v="kaminow">Kaminow 28.8</button></div></div>
        </div>
      </div>
    </div>
    <div class="v-stage" style="margin-top:32px"><div class="dv-pw h360" data-p="a3">{@html init.a3V}</div></div>
    <div class="v-chips" data-k="logy" role="group" aria-label="y axis scale"><button type="button" data-v="1" class="on">log &Gamma;</button><button type="button" data-v="0">linear &Gamma;</button></div>
    <div class="v-prov"><span>Gap and overlap are templates <Badge code="template" pop="st:template" />; r<sub>33</sub> <Badge code="P-comp" pop="r:weis1985" />; mode drawn at 1550 nm in <span class="ir">false color</span>, vertical scale exaggerated. Scatter: &Gamma;<sub>implied</sub> = &lambda;g / (2 n<sub>e</sub><sup>3</sup> r<sub>33</sub> V<sub>&pi;</sub>L) for {pts.length} x-cut push-pull TFLN rows <Badge code="derived" pop="atlas" />, n<sub>e</sub> from Zelmon 1997 at 21 C <Badge code="P-db" pop="r:zelmon1997" />; the shaded region &Gamma; &gt; 1 is outside the lateral-gap model. Hollow: slow light, material-enhancement claim, hybrid Si/SiN, unetched LN; rows within 12% of the chosen wavelength in full tone; crosshair = slider state.</span><span>{@html stamp}</span></div>
  </div>
</div>
