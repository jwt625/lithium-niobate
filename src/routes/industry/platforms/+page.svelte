<!-- 8.4 Platform comparison from the atlas (manuscript 8.4): L1 charts B1-B6 (F8.05), L2 readings and platform cards
     (F8.10), L3 what the sample is and is not. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import PlatformCharts from "$lib/figures/industry/PlatformCharts.svelte";
  import Rivals from "$lib/figures/industry/Rivals.svelte";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { ATLAS_POP, cardPops } from "$lib/figures/industry/commonpops";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();
  useChapterPops(null, { "i8-atlas": ATLAS_POP, ...cardPops((() => data.cards)()) });
  onMount(() => installRangeFill());
  const st = (p: string) => data.stats.find((s) => s.plat === p);
  const yrMax = (p: string, y: number): number => Math.max(0, ...data.b2.filter((q) => q.p === p && q.yr === y && q.baud !== null).map((q) => q.baud as number));
  const b3 = (p: string, y: number): number => data.b3[p]?.[y]?.[0] ?? 0;
  const b3o = (p: string, y: number): number => (data.b3[p]?.[y]?.[0] ?? 0) - (data.b3[p]?.[y]?.[1] ?? 0);
  const lineMax = $derived(data.b2.reduce((a, q) => (q.line !== null && q.line > a.v ? { v: q.line, id: q.id } : a), { v: 0, id: "" }));
</script>

<ChapterPage crumbs={crumbs8("8.4")} title="8.4 Platform comparison from the atlas"
  depth={[{ id: "l1", label: "L1 Charts" }, { id: "l2", label: "L2 Readings" }, { id: "l3", label: "L3 The sample" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Charts">
    <div class="sh"><h2 class="biref">L1 One device per mark</h2><span class="meta">eo-modulator-atlas, commit eb97f96</span></div>
    <div class="body">
      <p class="tx">Each mark below is one published device; LN and its sibling LT are highlighted. Hover a mark for its paper, values, and evidence file.</p>
      <div class="i8-fig" data-variant="tech"><PlatformCharts v={false} b1={data.b1} b2={data.b2} b3={data.b3} b4={data.b4} b5={data.b5} b6={data.b6} pa={data.pa} /></div>
      <div class="i8-fig" data-variant="visual"><PlatformCharts v={true} b1={data.b1} b2={data.b2} b3={data.b3} b4={data.b4} b5={data.b5} b6={data.b6} pa={data.pa} /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Readings">
    <div class="sh"><h2 class="biref">L2 Readings</h2><span class="meta">statements about the atlas sample at the pinned commit</span></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>TFLN telecom push-pull V&pi;L median {st("TFLN")?.vpil.med?.toFixed(2)} V cm (n = {st("TFLN")?.vpil.n}) vs TFLT {st("TFLT")?.vpil.med?.toFixed(2)} (n = {st("TFLT")?.vpil.n}); TFLN bandwidth median &ge; {data.tflnBw.med} GHz (n = {data.tflnBw.n}, {(data.tflnBw.lb * 100).toFixed(0)}% lower bounds), maximum {data.tflnBw.max} GHz <Badge code="derived" pop="i8-atlas" />.</li>
        <li>TFLT papers: {b3("TFLT", 2024)} (2024), {b3("TFLT", 2025)} (2025), {b3("TFLT", 2026)} (2026; {b3o("TFLT", 2026)} of them OFC-tagged). TFLT holds the atlas line-rate maximum ({lineMax.v} Gb/s, Xu et al., OFC 2026 Th4A.2).</li>
        <li>Highest symbol rate per year for TFLN rose from {yrMax("TFLN", 2018)} GBd (2018) to {yrMax("TFLN", 2026)} GBd (2026); BTO reached {yrMax("BTO", 2025)} GBd (2025), SiPh {yrMax("SiPh", 2025)} GBd (2025), InP {yrMax("InP", 2026)} GBd (2026), polymer {yrMax("Polymer", 2026)} GBd (2026).</li>
        <li>Footprint: median electrode length TFLN {st("TFLN")?.len.med} mm, TFLT {st("TFLT")?.len.med}, InP {st("InP")?.len.med}, BTO {st("BTO")?.len.med?.toFixed(2)}, SiPh {st("SiPh")?.len.med}, polymer {st("Polymer")?.len.med} mm.</li>
        <li>Wafers: {data.b4.nanoln} of {data.b4.stated} TFLN/TFLT papers that name a supplier name NanoLN (TFLN {data.b4.tfln[0]} of {data.b4.tfln[1]}, TFLT {data.b4.tflt[0]} of {data.b4.tflt[1]}).</li>
        <li>Integration: in 2026, {data.b5[2026].foundry_native} of {data.b5[2026].total} TFLN/TFLT papers report a foundry-native process, {data.b5[2026].bonded_heterogeneous} bonded-heterogeneous, {data.b5[2026].micro_transfer_printed} micro-transfer-printed, and {data.b5[2026].o_band} have O-band rows (2022: {data.b5[2022].foundry_native} foundry-native, {data.b5[2022].o_band} O-band of {data.b5[2022].total}).</li>
      </ul>
      <h3 class="h3">Neighbors and rivals</h3>
      <Rivals stats={data.stats} />
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 The sample">
    <div class="sh"><h2 class="biref">L3 The sample</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>The atlas is a curated <span class="term" data-pop="g:atlas-sample">sample</span> of 233 papers (web search, author-group follow-up, landmark papers, OFC 2026); it is not a census and per-year counts are not growth rates.</li>
        <li>Bounds are drawn as arrows; V&pi;L comparisons use the push-pull convention only; SiPh has no push-pull telecom rows and is absent from the default V&pi;L view.</li>
        <li>Plotted V&pi;L = reported DC V&pi;L, else V&pi; &times; length / 10 (DC), else reported RF V&pi;L; never converted between conventions.</li>
        <li>Platform mapping: TFLN = lithium niobate rows without titanium in-diffusion; TFLT = lithium tantalate; Other includes bulk Ti:LN, AlGaAs, graphene/2D, GeSi EAM, and the remaining materials.</li>
        <li>Source rights in the atlas: 66 papers open-license, 167 restricted (facts and locators only).</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
</style>
