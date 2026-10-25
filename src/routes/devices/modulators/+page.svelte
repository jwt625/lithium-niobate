<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  import F602 from "$lib/figures/devices/F602.svelte";
  import F603 from "$lib/figures/devices/F603.svelte";
  import F607 from "$lib/figures/devices/F607.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Transfer function, VπL, families", L3: "How Vπ and bandwidth are measured" }}>
  {#snippet fig(id: string)}
    {#if id === "F6.02"}<F602 init={data.f602.init} devs={data.f602.devs} cap={data.b.doc.caps["F6.02"] ?? ""} />
    {:else if id === "F6.03"}<F603 init={data.f603.init} pts={data.f603.pts} stamp={data.stamp} />
    {:else if id === "F6.07"}<F607 init={data.f607.init} pts={data.f607.pts} stamp={data.stamp} />
    {/if}
  {/snippet}
</DevSection>
