<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F609 from "$lib/figures/devices/F609.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Devices and values", L3: "Threshold model and comparability" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.09"}<F609 init={data.f609} hov={data.hov} />{/if}
  {/snippet}
</DevSection>
