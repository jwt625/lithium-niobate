<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import A6 from "$lib/figures/devices/A6.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Records table", L3: "Provisional status" }}>
  {#snippet fig(id: string)}
    {#if id === "A6"}<A6 rows={data.rows} />{/if}
  {/snippet}
</DevSection>
