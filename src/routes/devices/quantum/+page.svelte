<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F611 from "$lib/figures/devices/F611.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Squeezing, pairs, conversion, transducers", L3: "Definitions" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.11"}<F611 init={data.f611.init} rows={data.f611.rows} />{/if}
  {/snippet}
</DevSection>
