<!-- 8.3 Wafer size and lane rate (manuscript 8.3): L1 wafer ladder F8.03 and lane-rate ladder F8.04, L2 milestone tables,
     L3 what a line announcement is and is not. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import WaferLadder from "$lib/figures/industry/WaferLadder.svelte";
  import LaneLadder from "$lib/figures/industry/LaneLadder.svelte";
  import DiesPerWafer from "$lib/figures/industry/DiesPerWafer.svelte";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { onMount } from "svelte";
  import Stamp from "$lib/figures/industry/Stamp.svelte";
  import { WAFER_MS, LANE_MS } from "$lib/figures/industry/facts";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { ATLAS_POP, cardPops } from "$lib/figures/industry/commonpops";

  let { data }: { data: PageData } = $props();
  onMount(() => installRangeFill());
  useChapterPops(null, { "i8-atlas": ATLAS_POP, ...cardPops((() => data.cards)()) });
</script>

<ChapterPage crumbs={crumbs8("8.3")} title="8.3 Wafer size and lane rate"
  depth={[{ id: "l1", label: "L1 Bigger and faster" }, { id: "l2", label: "L2 Milestones" }, { id: "l3", label: "L3 Reading announcements" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Bigger and faster">
    <div class="sh"><h2 class="biref">L1 Bigger wafers, faster lanes</h2><span class="meta">{WAFER_MS.length} wafer milestones, {LANE_MS.length} lane-rate milestones</span></div>
    <div class="body">
      <p class="tx">Larger wafers carry more chips per process step; thin-film wafers (<span class="term" data-pop="g:lnoi-ltoi">LNOI</span>) are made by <span class="term" data-pop="g:ion-slicing">ion slicing</span> and bonding. Between 2023 and 2026, 6- and 8-inch thin-film LN lines were announced in China, Europe, and Taiwan, two of them inside merchant silicon foundries (UMC/Wavetek <G g="T/C" r="r:r09-s19" />, X-FAB <G g="F" r="r:xfab-2026-01-19" />). By 2026, vendors stated 200 Gb/s-<span class="term" data-pop="g:per-lane-rate">per-lane</span> TFLN products available and 400 Gb/s per lane sampling <G g="V" r="r:r09-s18" />.</p>
      <div class="i8-fig"><WaferLadder /></div>
      <h3 class="h3">Dies per wafer</h3>
      <p class="tx">A modulator die is long and narrow; the number that fits on a wafer grows faster than the wafer area because fewer dies are lost at the edge. Set the die size and the edge exclusion.</p>
      <div class="i8-fig"><DiesPerWafer /></div>
      <h3 class="h3">Lane rate: research and products</h3>
      <div class="i8-fig"><LaneLadder pts={data.pts} max={data.max} /><Stamp /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Milestones">
    <div class="sh"><h2 class="biref">L2 Milestones</h2><span class="meta">dated, graded; reported = authors' values</span></div>
    <div class="body">
      <h3 class="h3">Wafer milestones</h3>
      <div class="scrollx"><table class="idx i8-mt"><thead><tr><th>Date</th><th>Milestone</th><th>Wafer</th><th>Grade</th></tr></thead><tbody>
        {#each WAFER_MS as m, i (i)}<tr><td>{m.date}</td><td>{m.t}</td><td class="i8-nw">{m.label}</td><td class="i8-g"><G g={m.g} r={m.r} /></td></tr>{/each}
      </tbody></table></div>
      <h3 class="h3">Lane-rate milestones</h3>
      <div class="scrollx"><table class="idx i8-mt"><thead><tr><th>Date</th><th>Milestone</th><th>Kind</th><th>Grade</th></tr></thead><tbody>
        {#each LANE_MS as m (m.t)}<tr><td>{m.date}</td><td>{m.t}</td><td>{m.research ? "research" : "product"}</td><td class="i8-g"><G g={m.g} r={m.r} /></td></tr>{/each}
      </tbody></table></div>
      <p class="tx">Atlas yearly maximum symbol rate, TFLN: {data.max.TFLN.map(([y, v]) => `${y} ${v}`).join(", ")} GBd; TFLT: {data.max.TFLT.map(([y, v]) => `${y} ${v}`).join(", ")} GBd <Badge code="derived" pop="i8-atlas" />.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Reading announcements">
    <div class="sh"><h2 class="biref">L3 Reading announcements</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>A "line" announcement is not a capacity figure; wafer starts per month are public only as targets (CCRAFT 2,000 wafers per month by 2030 <G g="V" r="r:r09-s16" />).</li>
        <li>Bulk LN (SAW, 8-inch at TDG) and thin-film LN (LNOI, 8-inch foundry lines) are different wafer products; the ladder labels each milestone with its product.</li>
        <li>The 12-inch outline carries only an LG-graded secondary claim; no primary source for a 12-inch LN wafer was read.</li>
        <li>Die counts are gross: the formula &pi;d<sup>2</sup>/(4S) &minus; &pi;d/&radic;(2S) (usable diameter d, die area S) and the exact number of whole dies placed on a grid inside the usable circle (best of four offsets); no scribe lanes, flats, notch, or yield.</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
  .i8-nw { white-space: nowrap; }
</style>
