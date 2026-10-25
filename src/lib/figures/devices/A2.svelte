<!-- A2 Velocity-matching map: atlas n_RF vs n_g (TFLN, TFLT), shape = electrode type, size = length; click a mark to load
     it into F6.04 (window event "dv-preset"). TECH: mono scatter + legend row; VISUAL: colour scatter + 44 px legend. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { chartA2, ET_SHAPE, lenR } from "./charts";
  import { atlasHover, qual, type Pt } from "./atlas";
  import { marker } from "./svgplot";

  let { init, pts, stamp }: { init: { T: string; V: string }; pts: Pt[]; stamp: string } = $props();
  let host: HTMLElement;
  const within = $derived(pts.filter((d) => Math.abs(d.y - d.x) <= 0.1 + 1e-9).length);
  const ETS: [string, string][] = [["tw_gsg", "GSG"], ["tw_cpw", "CPW"], ["tw_gssg", "GSSG"], ["cl_twe", "T-rail"], ["slow_wave", "slow wave"], ["lumped", "lumped"], ["", "other / none"]];
  const glyph = (et: string, big = false): string => `<svg viewBox="-7 -8 14 16" aria-hidden="true">${marker(ET_SHAPE[et] ?? "plus", 0, 0, big ? 5 : 4.5, "lgm")}</svg>`;
  onMount(() => {
    const state = { sel: "" };
    const hov = atlasHover((d) => [["n<sub>g</sub>", d.ng_opt, "", qual(d, "ng_opt")], ["n<sub>RF</sub>", d.n_rf, "", qual(d, "n_rf")], ["Z<sub>0</sub>", d.z0_ohm, "Ω", qual(d, "z0_ohm")],
      ["RF loss", d.rf_loss_db_per_cm, `dB/cm${d.rf_loss_freq_ghz ? ` at ${d.rf_loss_freq_ghz} GHz` : ""}`, undefined], ["3 dB", d.bw3db_ghz, "GHz", qual(d, "bw3db_ghz")], ["length", d.length_mm, "mm", undefined]]);
    const h = mountFig(host, {
      id: "a2", state,
      plots: { a2: (s, w, hh, look) => chartA2(pts, String(s.sel), w, hh, look) },
      hover: async (id) => { const x = await hov(id); return x ? `${x}<div class="hc-l">click: load into the EO response plot</div>` : null; },
      pick: (id) => { h.set({ sel: id }); window.dispatchEvent(new CustomEvent("dv-preset", { detail: id })); },
    });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="a2" data-look="tech">
    <div class="ph"><span>Velocity matching: n<sub>RF</sub> vs n<sub>g</sub>, TFLN and TFLT device rows</span><span class="dim">{pts.length} rows; {within} within |&Delta;n| &le; 0.10</span></div>
    <div class="dv-pw h360" data-p="a2">{@html init.T}</div>
    <div class="lg">{#each ETS as [k, l] (k)}<span>{@html glyph(k)}{l}</span>{/each}<span>size: length 1, 5, 10, 20 mm</span><span>band: |n<sub>RF</sub> &minus; n<sub>g</sub>| &le; 0.10</span></div>
    <div class="pf"><span style="white-space:normal">Rows that report both indices <Badge code="reported" pop="atlas" />; click a mark to load it into the EO response plot above.</span><span class="stampl">{@html stamp}</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="a2" data-look="visual">
    <div class="v-stage"><div class="dv-pw h480" data-p="a2">{@html init.V}</div></div>
    <div class="v-lgd">{#each ETS as [k, l] (k)}<span>{@html glyph(k, true)}{l}</span>{/each}</div>
    <div class="v-prov"><span>{pts.length} published traveling-wave LN and LT modulators that report both indices <Badge code="reported" pop="atlas" />; band: |n<sub>RF</sub> &minus; n<sub>g</sub>| &le; 0.10; size: length 1, 5, 10, 20 mm; {within} sit within 0.10 of the diagonal, where the microwave keeps pace with the light. Marker size grows with electrode length; click one to load it into the response model above.</span><span>{@html stamp}</span></div>
  </div>
</div>
