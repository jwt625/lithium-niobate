<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F604 from "$lib/figures/devices/F604.svelte";
  import A2 from "$lib/figures/devices/A2.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Line model, limits, levers", L3: "Atlas RF columns and measurement" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.04"}<F604 init={data.f604.init} presets={data.f604.presets} stamp={data.stamp} />
    {:else if id === "A2"}<A2 init={data.a2.init} pts={data.a2.pts} stamp={data.stamp} />
    {/if}
  {/snippet}
</DevSection>
