<!-- F8.07 Market range strips: one hatched bar per publisher from base value to forecast value on a log US$ axis
     (10 M to 10 B), grouped by product definition; every bar LG or LG/C; no sum, average, or consensus line; no currency
     conversion (the China-only CNY figure stays text). "Base year only" lines up the base values alone. -->
<script lang="ts">
  import G from "./G.svelte";
  import MarketPlot from "./MarketPlot.svelte";
  let { v }: { v: boolean } = $props();
  let baseOnly = $state(false);
</script>

<div class="i8-mk" class:v>
  <div class={v ? "i8-mk-ctl v" : "i8-ctlrow"}>
    <span class="lbl">View</span>
    <div class={v ? "v-seg" : "seg"} role="group" aria-label="View"><button type="button" class:on={!baseOnly} onclick={() => (baseOnly = false)}>base to forecast</button><button type="button" class:on={baseOnly} onclick={() => (baseOnly = true)}>base year only</button></div>
    <span class="i8-mk-n">every bar <G g="LG" r="r:mkt-valuates" /> or <G g="LG/C" r="r:mkt-qyr" />; publishers' own numbers, not recomputed</span>
  </div>
  <div class="i8-mk-w"><MarketPlot {v} nar={false} {baseOnly} /></div>
  <div class="i8-mk-n2"><MarketPlot {v} nar={true} {baseOnly} /></div>

</div>

<style>
  .i8-mk { border: 1px solid var(--rule2); background: var(--bg); box-shadow: 3px 3px 0 var(--shadow); }
  .i8-mk .seg button { padding: 3px 8px; }
  .i8-mk-n { font-size: 11.5px; color: var(--fg3); }
  .i8-mk-n2 { display: none; }
  @media (max-width: 640px) { .i8-mk-w { display: none; } .i8-mk-n2 { display: block; } }
  .i8-mk.v { border: 1px solid var(--v-line); background: var(--v-ink1); box-shadow: none; padding: 16px; }
  .i8-mk-ctl.v { display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: center; margin-bottom: 12px; }
  .i8-mk-ctl.v .lbl { font: 500 14px/20px var(--v-ui); letter-spacing: 0; text-transform: none; color: var(--v-text3); }
  .v .i8-mk-n { font: 400 14px/21px var(--v-ui); color: var(--v-text3); }
</style>
