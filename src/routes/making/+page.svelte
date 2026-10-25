<!-- Chapter 05 landing: door text, the Process viewer (F05-01, full width), sections with figures and matching steps. -->
<script lang="ts">
  import "$lib/figures/making/making.css";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops } from "$lib/content/pops";
  import ProcessViewer from "$lib/figures/making/ProcessViewer.svelte";
  import { MK_SECTIONS, mkHref, FIG_TITLES } from "$lib/figures/making/sections";
  import { hashOf } from "$lib/figures/making/flow";

  let { data } = $props();
  // svelte-ignore state_referenced_locally
  usePops(data.pops);
  const stepNo = (id: string): string => {
    const r = data.flow.order.ridge_duv.includes(id) ? "ridge_duv" : "strip_dlc";
    return String(data.flow.order[r].indexOf(id) + 1).padStart(2, "0") + (r === "strip_dlc" && !data.flow.order.ridge_duv.includes(id) ? "s" : data.flow.order.strip_dlc.includes(id) ? "" : "r");
  };
  const link = (id: string): string => `/making/process-viewer/${hashOf(data.flow.order.ridge_duv.includes(id) ? "ridge_duv" : "strip_dlc", id, 0)}`;
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "05 Making" }]} title="05 Making it"
  depth={[{ id: "l1", label: "From powder to chip" }, { id: "sections", label: "Sections" }]}>
  <section class="lay mk-body" id="l1" data-pair="l1" data-spine="From powder to chip">
    <div class="sh"><h2 class="biref">From powder to chip</h2><span class="meta">Process viewer: 30 steps, 2 device routes</span></div>
    <div class="body">
      {@html data.door}
      <div class="mk-figs"><ProcessViewer flow={data.flow} uid="pv-door" /></div>
    </div>
  </section>
  <section class="lay mk-body" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx kw mk-t">
          <thead><tr><th>No.</th><th>Section</th><th>Figures</th><th>Process viewer steps</th></tr></thead>
          <tbody>
            {#each MK_SECTIONS as s (s.no)}
              <tr><td>{s.no}</td><td class="h"><a href={mkHref(s)}>{data.titles[s.no]}</a></td><td>{s.figs.map((f) => FIG_TITLES[f]).join("; ") || "–"}</td><td>{#if s.steps.length}{#each s.steps as id, i (id)}{i ? " " : ""}<a href={link(id)}>{stepNo(id)}</a>{/each}{:else}–{/if}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Step numbers follow the ridge route (r: ridge only, s: strip only). Each viewer value has a status badge: reported, derived, or template; analog values come from a paper other than the route's anchor or from LiTaO<sub>3</sub>.</p>
    </div>
  </section>
</ChapterPage>
