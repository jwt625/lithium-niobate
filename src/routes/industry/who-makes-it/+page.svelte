<!-- 8.2 Who grows, slices, fabs, and builds (manuscript 8.2): L1 ecosystem map F8.02, L2 verified entries and atlas fabs,
     L3 what "verified" means and what is left out. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import Ecosystem from "$lib/figures/industry/Ecosystem.svelte";
  import Stamp from "$lib/figures/industry/Stamp.svelte";
  import { COMPANIES, CORRECTIONS, NOT_SHOWN_C, NOT_SHOWN_LG } from "$lib/figures/industry/facts";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { ATLAS_POP } from "$lib/figures/industry/commonpops";

  let { data }: { data: PageData } = $props();
  useChapterPops(COMPANIES, { "i8-atlas": ATLAS_POP });
  const maxF = $derived(Math.max(...data.fabs.map((x) => x[1])));
  const maxC = $derived(Math.max(...data.countries.map((x) => x[1])));
</script>

<ChapterPage crumbs={crumbs8("8.2")} title="8.2 Who grows, slices, fabs, and builds"
  depth={[{ id: "l1", label: "L1 Ecosystem" }, { id: "l2", label: "L2 Entries" }, { id: "l3", label: "L3 What verified means" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Ecosystem">
    <div class="sh"><h2 class="biref">L1 Ecosystem by stage and region</h2><span class="meta">{COMPANIES.length} entries, grades F, V, T</span></div>
    <div class="body">
      <p class="tx">Crystal growers that list LN or LT on their own product pages include Sumitomo Metal Mining and Shin-Etsu (LT only) <G g="F" r="r:smm-ltln+shinetsu-lt" />. One supplier, NanoLN, is named in {data.b4.nanoln} of the {data.b4.stated} published TFLN/TFLT papers that state where their wafers came from <Badge code="derived" pop="i8-atlas" />. Since 2023, companies and institutes in China, the US, Europe, and Taiwan have announced thin-film LN production or pilot <span class="term" data-pop="g:foundry">foundry</span> lines (<a class="u" href="/industry/wafers-and-lanes/">8.3</a>).</p>
      <div class="i8-fig"><Ecosystem /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Entries">
    <div class="sh"><h2 class="biref">L2 Entries</h2><span class="meta">page read on the access date</span></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx i8-vt">
          <thead><tr><th>Stage</th><th>Company</th><th>Region</th><th>Verified fact</th><th>Date</th><th>Grade</th></tr></thead>
          <tbody>
            {#each COMPANIES as c (c.name + c.fact)}<tr><td>{c.stage}</td><td class="h">{c.name}</td><td>{c.region}</td><td>{c.fact}</td><td class="i8-nw">{c.date}</td><td class="i8-g"><G g={c.g} r={c.r} /></td></tr>{/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Corrections: {CORRECTIONS}</p>

      <h3 class="h3">Who fabricates published devices (atlas)</h3>
      <p class="tx">Fab facility and affiliation country of {data.papers} TFLN/TFLT atlas papers <Badge code="derived" pop="i8-atlas" />: university and shared cleanrooms lead; commercial and foundry entries are few. A paper counts once per facility and once per country.</p>
      <div class="i8-bars2">
        <div>
          <div class="lbl">Facility (top 3, then commercial or national-lab entries)</div>
          {#each data.fabs as [k, n] (k)}<div class="i8-hb"><span class="i8-hb-l">{k}</span><span class="i8-hb-b"><i style="width:{(n / maxF) * 100}%"></i></span><span class="i8-num">{String(n).padStart(2, "\u2007")}</span></div>{/each}
        </div>
        <div>
          <div class="lbl">Affiliation country (ISO code)</div>
          {#each data.countries as [k, n] (k)}<div class="i8-hb"><span class="i8-hb-l">{k}</span><span class="i8-hb-b"><i style="width:{(n / maxC) * 100}%"></i></span><span class="i8-num">{String(n).padStart(2, "\u2007")}</span></div>{/each}
        </div>
      </div>
      <Stamp />
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 What verified means">
    <div class="sh"><h2 class="biref">L3 What "verified" means</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>"Verified" here means the page was opened and read on the access date; it does not mean the claim was checked independently (that is grade F for dated events and statements only).</li>
        <li>Not shown, graded C (page not opened): {NOT_SHOWN_C}.</li>
        <li>Not shown, graded LG (direction only): {NOT_SHOWN_LG}.</li>
        <li>Company names are given in English as the company or the cited source writes them.</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
  .i8-nw { white-space: nowrap; }
  .i8-vt td:first-child { white-space: nowrap; }
  .i8-bars2 { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 24px; margin: 8px 0; }
  .i8-hb { display: grid; grid-template-columns: minmax(0, 1fr) minmax(60px, 0.8fr) 3ch; gap: 8px; align-items: center; font-size: 12px; line-height: 20px; color: var(--fg2); }
  .i8-hb-l { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .i8-hb-b { height: 8px; border: 1px solid var(--rule2); }
  .i8-hb-b i { display: block; height: 100%; background: var(--fg3); }
  :global(:root[data-mode="visual"]) .i8-hb { font: 400 14px/26px var(--v-ui); color: var(--v-text2); }
  :global(:root[data-mode="visual"]) .i8-hb-b { height: 12px; border-color: var(--v-line); }
  :global(:root[data-mode="visual"]) .i8-hb-b i { background: var(--nb); }
  @media (max-width: 760px) { .i8-bars2 { grid-template-columns: minmax(0, 1fr); } }
</style>
