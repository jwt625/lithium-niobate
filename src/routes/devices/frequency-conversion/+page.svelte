<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F608 from "$lib/figures/devices/F608.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Conversion laws and devices", L3: "What sets the efficiency" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.08"}<F608 init={data.f608} hov={data.hov} />{/if}
  {/snippet}
</DevSection>
