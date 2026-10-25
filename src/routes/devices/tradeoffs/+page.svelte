<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import A1 from "$lib/figures/devices/A1.svelte";
  import A45 from "$lib/figures/devices/A45.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "What the atlas sample shows", L3: "Sample and conventions" }}>
  {#snippet fig(id: string)}
    {#if id === "A1"}<A1 init={data.a1.init} pts={data.a1.pts} stamp={data.stamp} />
    {:else if id === "A4"}<A45 init={data.f606.init} a4={data.f606.a4} a5={data.f606.a5} stamp={data.stamp} />
    {/if}
  {/snippet}
</DevSection>
