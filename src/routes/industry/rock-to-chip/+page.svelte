<!-- 8.1 Rock to chip (manuscript 8.1): L1 value chain F8.01, L2 node facts, L3 niobium per wafer F8.11. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import ValueChain from "$lib/figures/industry/ValueChain.svelte";
  import NbCalc from "$lib/figures/industry/NbCalc.svelte";
  import { CHAIN, CHAIN_EXTRA } from "$lib/figures/industry/facts";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { ATLAS_POP, NB_POP } from "$lib/figures/industry/commonpops";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();
  useChapterPops(CHAIN, { "i8-atlas": ATLAS_POP, "i8-nbwafer": NB_POP });
  onMount(() => installRangeFill());
</script>

<ChapterPage crumbs={crumbs8("8.1")} title="8.1 Rock to chip"
  depth={[{ id: "l1", label: "L1 The chain" }, { id: "l2", label: "L2 Node facts" }, { id: "l3", label: "L3 Niobium per wafer" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 The chain">
    <div class="sh"><h2 class="biref">L1 The chain</h2><span class="meta">10 steps; facts accessed 2026-10-24/25</span></div>
    <div class="body">
      <p class="tx">Lithium niobate is about 63% niobium by weight. Almost all of that niobium is mined in Brazil as <span class="term" data-pop="g:pyrochlore">pyrochlore</span> ore, mostly for steel <G g="F" r="r:usgs2026nb" />. A 6-inch wafer holds about 26 g of niobium; even 2 million such wafers a year would use about 0.05% of world niobium output <G g="E" r="i8-nbwafer" />. Supply limits, if any, sit downstream in oxide refining, crystal growth, and thin-film bonding <G g="E" r="i8-supply" />.</p>
      <p class="fine">Select a step to open its card: facts with grade and source, companies from the table of section 8.2.</p>
      <div class="i8-fig"><ValueChain atlasFact={data.atlasFact} /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Node facts">
    <div class="sh"><h2 class="biref">L2 Node facts</h2><span class="meta">grades F, V, T, derived; T/C printed where it applies</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx i8-nt">
          <thead><tr><th>Step</th><th>Fact</th><th>Grade</th></tr></thead>
          <tbody>
            {#each CHAIN as n (n.id)}
              {#each n.facts as f, i (f.t)}
                <tr><td>{i === 0 ? n.label : ""}</td><td>{f.t}</td><td class="i8-g"><G g={f.g} r={f.r} /></td></tr>
              {/each}
              {#if n.id === "ore_nb"}{#each CHAIN_EXTRA as x (x.f.t)}<tr><td></td><td>{x.f.t}</td><td class="i8-g"><G g={x.f.g} r={x.f.r} /></td></tr>{/each}{/if}
              {#if n.atlasFact}<tr><td></td><td>{data.atlasFact.t}</td><td class="i8-g"><Badge code="derived" pop="i8-atlas" /></td></tr>{/if}
            {/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Companies named on the cards appear only if they are in the table of section 8.2 (grades F, V, T). Niobium and lithium end-use statistics do not separate LN and LT (N/A).</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Niobium per wafer">
    <div class="sh"><h2 class="biref">L3 How much niobium is in a wafer</h2><span class="meta">estimate, assumptions stated</span></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>Formula LiNbO<sub>3</sub>, molar mass 147.84 g/mol (Li 6.94, Nb 92.906, O 15.999); Nb mass fraction 62.8%. The <span class="term" data-pop="g:congruent-ln">congruent</span>, Li-deficient crystal ([Li]/[Nb] = 0.94, Li-site vacancy model) has 148.43 g/mol and 63.2% Nb: 25.9 g instead of 25.8 g per 6-inch wafer <Badge code="derived" pop="i8-cong" />.</li>
        <li>Density 4,642.8 kg/m<sup>3</sup> (congruent, SAW grade) <Badge code="P" pop="r:kushibiki1999" />.</li>
        <li>150 mm &times; 0.5 mm wafer, flats ignored: volume 8.84 cm<sup>3</sup>, mass 41.0 g LN, 25.8 g Nb. 200 mm &times; 0.5 mm: 72.9 g LN, 45.8 g Nb.</li>
        <li>Scenario: 2.1 M 6-inch-equivalent wafers per year (the size of TDG Holding's 2029 plan <G g="V" r="r:tdg2026ir" />, which mixes piezoelectric LT and LN wafers; treated here as all LN, an upper bound) need 54 t Nb, 0.05% of 2025 world mine output; with boule and kerf losses of 2 to 5&times; (assumed), 0.1 to 0.25%.</li>
        <li>Niobium mining does not constrain LN supply <G g="E" r="i8-supply" />. Constraints, if any, sit in high-purity <span class="term" data-pop="g:nb2o5">Nb<sub>2</sub>O<sub>5</sub></span> refining, crystal growth, and thin-film bonding capacity.</li>
      </ul>
      <div class="i8-fig"><NbCalc /></div>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; }
  .i8-ul li { margin-bottom: 4px; }
  .i8-nt td:first-child { white-space: nowrap; }
</style>
