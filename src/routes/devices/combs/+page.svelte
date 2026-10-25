<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F610 from "$lib/figures/devices/F610.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Devices and values", L3: "Model and open values" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.10"}<F610 init={data.f610} hov={data.hov} />{/if}
  {/snippet}
</DevSection>
