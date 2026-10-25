<!-- A1 (F6.05) V_pi L vs 3 dB bandwidth by platform; year slider replays 2017-2026 (opacity only, fixed axes); bounds are
     arrows. TECH: mono scatter, toggle row, legend with counts. VISUAL: colour scatter, 44 px platform chips. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { A1_DEFAULT, a1Outs, chartA1, type A1State } from "./charts";
  import { atlasHover, qual, qualVpil, PLATFORMS, shapeOf, platCls, type Pt } from "./atlas";
  import { marker } from "./svgplot";

  let { init, pts, stamp }: { init: { T: string; V: string; outs: Record<string, string> }; pts: Pt[]; stamp: string } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  const glyph = (p: string): string => `<svg viewBox="-7 -8 14 16" aria-hidden="true" class="dv-plot"><g class="${platCls(p)}">${marker(shapeOf(p), 0, 0, 4.5, `mk ${platCls(p)}`)}</g></svg>`;
  onMount(() => {
    const state: A1State = { ...A1_DEFAULT };
    const hov = atlasHover((d) => [["3 dB bandwidth", d.bw3db_ghz, "GHz", qual(d, "bw3db_ghz")], ["V<sub>&pi;</sub>L", d.vpil_best, "V cm", qualVpil(d)], ["band", undefined, d.band ?? "", undefined]]);
    const h = mountFig(host, { id: "a1", state, plots: { a1: (s, w, hh, look) => chartA1(pts, s, w, hh, look) }, outs: (s) => a1Outs(pts, s), hover: (id) => hov(id) });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="a1" data-look="tech">
    <div class="ph"><span>V<sub>&pi;</sub>L vs 3 dB EO bandwidth, MZM and IQ device rows</span><span class="dim"><span data-o="all" style="white-space:pre">{O.all}</span> points, <span data-o="gt" style="white-space:pre">{O.gt}</span> bandwidth lower bounds</span></div>
    <div class="dv-pw h360" data-p="a1">{@html init.T}</div>
    <div class="lg">
      {#each PLATFORMS as p (p)}<span class="tg"><button type="button" data-t="pl_{p}" class="on">{@html glyph(p)}{p} <span class="n" data-o="n_{p}">{O[`n_${p}`]}</span></button></span>{/each}
      {#if O.n_SiPh.trim() === "0"}<span>SiPh: no push-pull V<sub>&pi;</sub>L rows under the default filter</span>{/if}
    </div>
    <div class="ctl"><label for="a1-y">Published up to</label><input id="a1-y" type="range" data-k="year" min="2017" max="2026" step="1" value="2026"><output data-o="year">{O.year}</output></div>
    <div class="ctlrow"><span class="tg"><button type="button" data-t="bands">all bands</button></span><span class="tg"><button type="button" data-t="conv">all V<sub>&pi;</sub> conventions (hollow)</button></span><span class="tg"><button type="button" data-t="design">design rows (crosses, simulated)</button></span></div>
    <div class="pf"><span style="white-space:normal">Default: device rows, telecom band (O, C, L, CL), push-pull convention; V<sub>&pi;</sub>L = reported DC value, else V<sub>&pi;</sub>&middot;L, else reported RF value <Badge code="reported" pop="atlas" />. Arrow: bandwidth stated as a lower bound, drawn at the stated value. No frontier is fitted.</span><span class="stampl">{@html stamp}</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="a1" data-look="visual">
    <div class="v-stage"><div class="dv-pw h480" data-p="a1">{@html init.V}</div></div>
    <div class="v-chips" aria-label="Platforms">{#each PLATFORMS as p (p)}<button type="button" data-t="pl_{p}" class="on">{@html glyph(p)}{p}<span class="n" data-o="n_{p}">{O[`n_${p}`]}</span></button>{/each}</div>
    <div class="v-ctls">
      <div class="v-ctl" style="--w:5ch"><label for="a1v-y">Published up to</label><output data-o="year">{O.year}</output><input id="a1v-y" type="range" data-k="year" min="2017" max="2026" step="1" value="2026"></div>
      <div class="v-ctl"><span class="v-lab">Include</span><div class="v-chips" style="margin:4px 0 0; grid-area: in"><button type="button" data-t="bands">all bands</button><button type="button" data-t="conv">all conventions</button><button type="button" data-t="design">simulated designs</button></div></div>
    </div>
    <div class="v-prov"><span>Each mark is one published device; arrows mark bandwidths that ran past the instrument (67 and 110 GHz), drawn at the stated value. Drag the year to replay 2017 to 2026. Default: device rows, telecom band (O, C, L, CL), push-pull convention; V<sub>&pi;</sub>L = reported DC value, else V<sub>&pi;</sub>&middot;L, else reported RF value <Badge code="reported" pop="atlas" />. No frontier is fitted.</span><span>{@html stamp}</span></div>
  </div>
</div>
