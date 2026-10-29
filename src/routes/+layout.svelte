<!-- Shell: effects layer, masthead, spine, page, BABY book stage (shown instead of the page in BABY), footer, popup engine.
     Page shell settings come from the site registry by path (metaFor) with optional per-page overrides returned from a
     page load as { meta }. -->
<script lang="ts">
  import "$lib/styles/tech.css";
  import "$lib/styles/chapter.css";
  import "$lib/styles/visual.css";
  import "$lib/styles/baby.css";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { initUi } from "$lib/stores/ui.svelte";
  import { metaFor } from "$lib/content/site";
  import { qpmPeriodSHG } from "$lib/figures/optics";
  import Masthead from "$lib/components/Masthead.svelte";
  import Spine from "$lib/components/Spine.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Popups from "$lib/components/Popups.svelte";
  import Effects from "$lib/components/Effects.svelte";
  import BabyStage from "$lib/babies/runtime/BabyStage.svelte";
  import { usePops } from "$lib/content/pops";
  import { SHELL_POPS } from "$lib/content/pops-landing";

  let { children }: { children: Snippet } = $props();
  initUi();
  usePops(SHELL_POPS, "shell");

  const meta = $derived({ ...metaFor(page.url.pathname), ...(page.data.meta ?? {}) });
  // VISUAL section rules repeat the band's QPM period at 2 px per um (visual.css --v-dom)
  const dom = $derived((qpmPeriodSHG(meta.qpm) * 2).toFixed(3));
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description}>
</svelte:head>

<div class="app" class:chp={!meta.landing} style="--v-dom:{dom}px">
  <Effects />
  <Masthead qpm={meta.qpm} chapter={meta.chapter} />
  <Spine />
  <main data-pagefind-body>
    {@render children()}
  </main>
  <BabyStage />
  <Footer here={meta.here} keys={meta.keys} keyDefs={meta.keyDefs} aside={meta.aside} lattice={meta.landing} />
  <Popups />
</div>
