<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigCz from "$lib/figures/making/FigCz.svelte";
  let { data } = $props();
</script>

<SectionPage {data}>
  {#snippet fig()}<FigCz />{/snippet}
</SectionPage>
