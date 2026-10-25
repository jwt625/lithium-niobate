<script lang="ts">
  import type { PageData } from "./$types";
  import { usePops } from "$lib/content/pops";
  import DevSection from "$lib/figures/devices/DevSection.svelte";
  let { data }: { data: PageData } = $props();
  usePops(data.b.pops);
</script>

<DevSection doc={data.b.doc} sources={data.b.sources} labels={{ L1: "Phenomenon", L2: "Devices and values", L3: "Comparability" }} />
