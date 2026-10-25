<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigPE from "$lib/figures/making/FigPE.svelte";
  let { data } = $props();
</script>

<SectionPage {data}>
  {#snippet fig()}<FigPE />{/snippet}
</SectionPage>
