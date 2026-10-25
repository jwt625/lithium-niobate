<!-- 8.7 LN in your life (manuscript 8.7): L1 ten cards F8.08, L2 card sources, L3 what the cards do not claim. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import LifeCards from "$lib/figures/industry/LifeCards.svelte";
  import { LIFE } from "$lib/figures/industry/facts";
  import { REFS } from "$lib/figures/industry/pops8";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { NB_POP } from "$lib/figures/industry/commonpops";
  useChapterPops(LIFE, { "i8-nbwafer": NB_POP });
  const pub = (key: string): string => key.slice(2).split("+").map((id) => { const r = REFS.find((x) => x.id === id); return r?.publisher ?? id; }).join("; ");
</script>

<ChapterPage crumbs={crumbs8("8.7")} title="8.7 LN in your life"
  depth={[{ id: "l1", label: "L1 Ten objects" }, { id: "l2", label: "L2 Sources" }, { id: "l3", label: "L3 What is not claimed" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Ten objects">
    <div class="sh"><h2 class="biref">L1 Ten objects</h2></div>
    <div class="body">
      <div class="i8-fig"><LifeCards /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Sources">
    <div class="sh"><h2 class="biref">L2 Sources per card</h2></div>
    <div class="body">
      <div class="scrollx"><table class="idx"><thead><tr><th>#</th><th>Object</th><th>Sources</th><th>Grade</th></tr></thead><tbody>
        {#each LIFE as c (c.n)}<tr><td>{c.n}</td><td class="h">{c.obj}</td><td>{pub(c.r)}{c.n === 10 ? "; section 8.1 L3 estimate" : ""}</td><td class="i8-g"><G g={c.g} r={c.r} /></td></tr>{/each}
      </tbody></table></div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 What is not claimed">
    <div class="sh"><h2 class="biref">L3 What the cards do not claim</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>Cards never state counts of LN devices per phone, car, or home: no public source separates LN from LT.</li>
        <li>The LT vs LN share of SAW filter volume has no public quantitative source (N/A).</li>
        <li>No claim is made that green laser pointers use LN.</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
</style>
