<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigValueChain from "$lib/figures/making/FigValueChain.svelte";
  let { data } = $props();
</script>

<SectionPage {data}>
  {#snippet fig()}<FigValueChain />{/snippet}
</SectionPage>
