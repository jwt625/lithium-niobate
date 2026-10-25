<!-- F6.11 Transducer efficiency vs year. TECH: mono scatter (shape = mechanism, fill = temperature). VISUAL: device glyphs
     (ring, phononic crystal, disk). Toggle hides internal and on-chip values. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { TX_DEFAULT, txHover, txPlot, type TxRow, type TxState } from "./f611";

  let { init, rows }: { init: { T: string; V: string }; rows: TxRow[] } = $props();
  let host: HTMLElement;
  onMount(() => {
    const state: TxState = { ...TX_DEFAULT };
    const h = mountFig(host, { id: "f611", state, plots: { pl: (s, w, hh, look) => txPlot(rows, s, w, hh, look) }, hover: (id) => txHover(rows, id) });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f611" data-look="tech">
    <div class="ph"><span>Microwave-optical transduction efficiency, LN devices</span><span class="dim">{rows.length} values, {rows.length - 1} devices</span></div>
    <div class="dv-pw h280" data-p="pl">{@html init.T}</div>
    <div class="lg"><span>&#9675; cavity EO</span><span>&#9633; piezo-optomechanical</span><span>&#9671; bulk LN EO (not thin film)</span><span>filled: cryogenic; hollow: room temperature or not stated</span><span>line: same device, total and internal</span></div>
    <div class="ctlrow"><span class="tg"><button type="button" data-t="hide">hide internal and on-chip values</button></span><span class="seg" data-k="log" role="group" aria-label="y axis"><button type="button" data-v="1" class="on">log</button><button type="button" data-v="0">linear</button></span></div>
    <div class="pf"><span style="white-space:normal">Values as reported (transducer table above) <Badge code="reported" pop="st:reported" />; definitions differ (total, internal, on chip; most abstracts do not name one) and added noise is not shown. Year: Crossref issued year.</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f611" data-look="visual">
    <div class="v-stage"><div class="dv-pw h360" data-p="pl">{@html init.V}</div></div>
    <div class="v-lgd"><span>ring: cavity EO</span><span>beam with holes: piezo-optomechanical</span><span>disk: bulk LN whispering gallery</span><span>filled: cryogenic, hollow: room temperature or not stated</span></div>
    <div class="v-chips"><button type="button" data-t="hide">Hide internal and on-chip values</button><span class="v-seg" data-k="log" role="group" aria-label="y axis"><button type="button" data-v="1" class="on">log</button><button type="button" data-v="0">linear</button></span></div>
    <div class="v-prov"><span>Hiding internal and on-chip values leaves the end-to-end numbers. Values as reported (transducer table above) <Badge code="reported" pop="st:reported" />; definitions differ (total, internal, on chip; most abstracts do not name one) and added noise is not shown. Dashed line: same device, total and internal. Year: Crossref issued year.</span></div>
  </div>
</div>
