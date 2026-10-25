<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F612 from "$lib/figures/devices/F612.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Facts with sources", L3: "Gaps" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.12"}<F612 init={data.f612.init} cuts={data.f612.cuts} />{/if}
  {/snippet}
</DevSection>
