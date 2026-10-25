<!-- Atlas stamp under every atlas chart (chart-specs 1.1): source repository, pinned commit, commit date, fetch date. -->
<script lang="ts">
  import { ATLAS, PATLAS } from "./facts";
  let { pa = false }: { pa?: boolean } = $props();
</script>

<div class="i8-stamp">
  <span>atlas <a class="u" href="{ATLAS.repo}/tree/{ATLAS.commit}">{ATLAS.commit.slice(0, 7)}</a> &middot; {ATLAS.date} &middot; fetched {ATLAS.fetched}</span>
  <span><a class="u" href={ATLAS.repo}>github.com/jwt625/eo-modulator-atlas</a>, no license file upstream</span>
  {#if pa}<span>cross-check: <a class="u" href="{PATLAS.repo}/tree/{PATLAS.commit}">photonics-atlas {PATLAS.commit.slice(0, 7)}</a> &middot; {PATLAS.date}</span>{/if}
</div>
