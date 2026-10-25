<!-- Figure slot for chapter 07 (figures.md F7.1-F7.10): number, title, operating text from the manuscript, then the
     figure component (each renders its TECH and VISUAL variants). -->
<script lang="ts">
  import { FIGS } from "./data";
  import type { Ev } from "./events";
  import FamilyTree from "./figs/FamilyTree.svelte";
  import Boule from "./figs/Boule.svelte";
  import OpoDial from "./figs/OpoDial.svelte";
  import Plate from "./figs/Plate.svelte";
  import SawRipple from "./figs/SawRipple.svelte";
  import Diffusion from "./figs/Diffusion.svelte";
  import ThinFilm from "./figs/ThinFilm.svelte";
  import Stripes from "./figs/Stripes.svelte";
  import BitRate from "./figs/BitRate.svelte";
  import IonSlice from "./figs/IonSlice.svelte";
  import Ticker from "./figs/Ticker.svelte";
  import AtlasPlot from "./figs/AtlasPlot.svelte";

  let { fig, title, cap, tick, atlas = null }: { fig: string; title: string; cap: string; tick: Ev[]; atlas?: { repo: string; sha: string; date: string; pts: { id: string; pl: string; vpil: number; bw: number; year: number; gt: boolean; who: string; title: string; venue: string; doi: string; url: string }[] } | null } = $props();
  const no = $derived(fig.replace("F", ""));
  const name = $derived(title || FIGS[fig]?.title || "");
</script>

<figure class="hx-fig" id="fig-{no.replace('.', '-')}">
  <figcaption class="hx-figc"><b>{name}</b>{#if cap}<span class="hx-figt">&nbsp;&mdash; {@html cap}</span>{/if}</figcaption>
  {#if fig === "F7.1"}<FamilyTree />
  {:else if fig === "F7.2"}<Boule />
  {:else if fig === "F7.2b"}<OpoDial />
  {:else if fig === "F7.3"}<Plate />
  {:else if fig === "F7.4"}<SawRipple />
  {:else if fig === "F7.5"}<Diffusion />
  {:else if fig === "F7.5b"}<ThinFilm />
  {:else if fig === "F7.6"}<Stripes />
  {:else if fig === "F7.7"}<BitRate />
  {:else if fig === "F7.8"}<IonSlice />
  {:else if fig === "F7.10"}<Ticker evs={tick} />
  {:else if fig === "F7.9" && atlas}<AtlasPlot {atlas} />
  {:else}<div class="nodata hx-nod">No data.</div>
  {/if}
</figure>
