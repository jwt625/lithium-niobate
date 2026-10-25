<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F601 from "$lib/figures/devices/F601.svelte";
  import { DEV_SECTIONS, secHref } from "$lib/figures/devices/nav";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection landing doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Families and maturity" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.01"}<F601 />{/if}
  {/snippet}
  {#snippet extra()}
    <section class="lay dv" id="sections" data-pair="sections" data-spine="Sections">
      <div class="sh"><h2 class="biref">Sections</h2><span class="meta">6.1 to 6.12</span></div>
      <div class="body">
        <div class="scrollx">
          <table class="idx kw">
            <thead><tr><th>No.</th><th>Section</th></tr></thead>
            <tbody>{#each DEV_SECTIONS as s (s.no)}<tr><td>{s.no}</td><td class="h"><a href={secHref(s)}>{s.title}</a></td></tr>{/each}</tbody>
          </table>
        </div>
      </div>
    </section>
  {/snippet}
</DevSection>
