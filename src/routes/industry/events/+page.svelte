<!-- 8.8 Events (manuscript 8.8): L1 timeline F8.09 from the generated public event set, L2 counts, L3 file and grading. -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Timeline from "$lib/figures/industry/Timeline.svelte";
  import { crumbs8 } from "$lib/figures/industry/sections";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { GRADE_DEF } from "$lib/figures/industry/refs";

  let { data }: { data: PageData } = $props();
  const esc = (x: string): string => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;");
  const gdefs = (g: string): string => [...new Set(g.match(/LG|F|V|T|C|E/g) ?? [])].map((k) => `<b>${k}</b>: ${GRADE_DEF[k]}.`).join(" ");
  useChapterPops(null, Object.fromEntries((() => data.evs)().map((e) => [`ev:${e.id}`, {
    h: esc(e.title), body: `<span class='v'>${esc(e.date)}</span>. ${esc(e.orgs)}. ${gdefs(e.grade)}${e.note ? ` ${esc(e.note)}` : ""}`,
    src: `<a href='${esc(e.url)}'>${esc(e.src)}</a>, accessed ${esc(e.accessed)}`,
  }])));
  const count = (f: (e: PageData["evs"][number]) => boolean): number => data.evs.filter(f).length;
  const REG = ["CN", "US", "EU", "JP", "TW"], STG = ["wafer", "foundry", "product", "funding", "other"];
</script>

<ChapterPage crumbs={crumbs8("8.8")} title="8.8 Events, 2020-2026"
  depth={[{ id: "l1", label: "L1 Timeline" }, { id: "l2", label: "L2 Counts" }, { id: "l3", label: "L3 The event file" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Timeline">
    <div class="sh"><h2 class="biref">L1 Timeline</h2><span class="meta">{data.evs.length} dated events, {data.evs[0]?.date} to {data.evs[data.evs.length - 1]?.date}</span></div>
    <div class="body">
      <p class="tx">Filter by grade, region, or stage; select a mark to bring its row or card into view.</p>
      <div class="i8-fig"><Timeline evs={data.evs} /></div>
    </div>
  </section>

  <section class="lay" id="l2" data-pair="l2" data-spine="L2 Counts">
    <div class="sh"><h2 class="biref">L2 Counts</h2><span class="meta">over the {data.evs.length} public events; an event can carry several regions</span></div>
    <div class="body">
      <div class="scrollx"><table class="idx"><thead><tr><th>Stage</th>{#each REG as r (r)}<th class="r">{r}</th>{/each}<th class="r">All</th></tr></thead><tbody>
        {#each STG as s (s)}<tr><td>{s}</td>{#each REG as r (r)}<td class="r num">{count((e) => e.stage === s && e.region.includes(r)) || ""}</td>{/each}<td class="r num">{count((e) => e.stage === s)}</td></tr>{/each}
      </tbody></table></div>
      <p class="fine">Stage from the event tags (foundry, then wafer, then product, then funding; everything else other). Region from the tags: CN, US, EU (Europe and Switzerland), JP, TW.</p>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 The event file">
    <div class="sh"><h2 class="biref">L3 The event file</h2></div>
    <div class="body">
      <ul class="tx i8-ul">
        <li>Fields per event: <code>date</code>, <code>title</code>, <code>organizations</code>, <code>tags</code>, <code>grade</code>, and citations with <code>url</code> and <code>accessed</code>. The same records are served at <a class="u" href="/api/v1/events/industry.json">/api/v1/events/industry.json</a>.</li>
        <li>Default view: grades F, V, T. T/C marks an event read only through trade-press coverage because the primary page returned an error; it is shown with its grade printed. C-graded events are not listed.</li>
        <li>Dates at month or year precision are drawn at the middle of that month or year.</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-ul { padding-left: 18px; } .i8-ul li { margin-bottom: 4px; }
</style>
