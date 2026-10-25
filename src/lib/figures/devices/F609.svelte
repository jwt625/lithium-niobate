<!-- F6.09 OPO threshold (triply resonant, classical). TECH: mono log-log output vs pump with the threshold kink and
     reported thresholds. VISUAL: ring dark below threshold, lit above; plot; 44 px controls. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { OPO_DEFAULT, opoArt, opoOuts, opoPlot, type OpoState } from "./f609";

  let { init, hov }: { init: { plT: string; plV: string; art: string; outs: Record<string, string> }; hov: Record<string, string> } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: OpoState = { ...OPO_DEFAULT };
    const h = mountFig(host, { id: "f609", state, plots: { pl: (s, w, hh, look) => opoPlot(s, w, hh, look), art: (s, w, hh) => opoArt(s, w, hh) }, outs: (s) => opoOuts(s), hover: (id) => hov[id] ?? null });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f609" data-look="tech">
    <div class="ph"><span>OPO, triply resonant, 775 nm pump, degenerate 1550 nm</span><span class="dim">classical steady state; spontaneous emission not drawn</span></div>
    <div class="dv-pw h280" data-p="pl">{@html init.plT}</div>
    <div class="ro" aria-live="polite"><span>P<sub>th</sub> <b data-o="Pth" style="width:11ch">{@html O.Pth}</b></span><span>signal <b data-o="Psig" style="width:11ch">{@html O.Psig}</b></span><span><b data-o="state" style="width:15ch;text-align:left">{@html O.state}</b></span></div>
    <div class="ctl"><label for="f609-q">Intrinsic Q</label><input id="f609-q" type="range" data-k="Qi" data-log min="5" max="8" step="0.01" value="6"><output data-o="Qi">{@html O.Qi}</output></div>
    <div class="ctl"><label for="f609-g">g/2&pi; <Badge code="template" pop="st:template" /></label><input id="f609-g" type="range" data-k="g" data-log min="4" max="7" step="0.01" value="6"><output data-o="g">{@html O.g}</output></div>
    <div class="ctl"><label for="f609-p">Pump power</label><input id="f609-p" type="range" data-k="P" data-log min="0" max="4" step="0.01" value="2"><output data-o="P">{@html O.P}</output></div>
    <div class="ctl"><span class="k">Coupling</span><div class="seg" data-k="reg" role="group" aria-label="Coupling regime"><button type="button" data-v="under">under</button><button type="button" data-v="critical" class="on">critical</button><button type="button" data-v="over">over</button></div><output></output></div>
    <div class="pf"><span style="white-space:normal">P<sub>th</sub> = &hbar;&omega;<sub>p</sub>&kappa;<sub>p</sub><sup>2</sup>&kappa;<sub>s</sub>&kappa;<sub>i</sub> / (16 g<sup>2</sup>&kappa;<sub>p,ex</sub>) <Badge code="derived" pop="st:derived" />; all three modes share the intrinsic Q; under / over coupling = Q<sub>i</sub>/Q<sub>c</sub> 0.5 / 2 <Badge code="template" pop="st:template" />. g is a display range (PPLN rings: g/2&pi; about 1.2 MHz <Badge code="reported" pop="r:lu2020optica" />). Ticks at the bottom: reported on-chip thresholds <Badge code="reported" pop="r:gao2021njp" /> <Badge code="reported" pop="r:lu2021optica" /> <Badge code="reported" pop="r:mckenna2022" /> (bar: "tens of µW").</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f609" data-look="visual">
    <div class="v-figrow">
      <div class="v-stage v-frame"><div class="dv-pw h300" data-p="art">{@html init.art}</div></div>
      <div>
        <div class="v-ctl" style="--w:11ch"><span class="v-lab">Threshold</span><output data-o="Pth">{@html O.Pth}</output></div>
        <dl class="v-hud"><dt>Signal output</dt><dd data-o="Psig">{@html O.Psig}</dd><dt>State</dt><dd data-o="state">{@html O.state}</dd></dl>
        <div class="v-ctls" style="grid-template-columns:minmax(0,1fr)">
          <div class="v-ctl" style="--w:11ch"><label for="f609v-p">Pump power</label><output data-o="P">{@html O.P}</output><input id="f609v-p" type="range" data-k="P" data-log min="0" max="4" step="0.01" value="2"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f609v-q">Intrinsic Q</label><output data-o="Qi">{@html O.Qi}</output><input id="f609v-q" type="range" data-k="Qi" data-log min="5" max="8" step="0.01" value="6"></div>
          <div class="v-ctl" style="--w:10ch"><label for="f609v-g">Nonlinear coupling g/2&pi;</label><output data-o="g">{@html O.g}</output><input id="f609v-g" type="range" data-k="g" data-log min="4" max="7" step="0.01" value="6"></div>
          <div class="v-ctl"><span class="v-lab">Coupling</span><div class="v-seg" data-k="reg" role="group" aria-label="Coupling regime"><button type="button" data-v="under">under</button><button type="button" data-v="critical" class="on">critical</button><button type="button" data-v="over">over</button></div></div>
        </div>
      </div>
    </div>
    <div class="v-stage" style="margin-top:28px"><div class="dv-pw h360" data-p="pl">{@html init.plV}</div></div>
    <div class="v-prov"><span>The ring lights exactly at the computed threshold. Classical steady state; spontaneous emission not drawn. P<sub>th</sub> = &hbar;&omega;<sub>p</sub>&kappa;<sub>p</sub><sup>2</sup>&kappa;<sub>s</sub>&kappa;<sub>i</sub> / (16 g<sup>2</sup>&kappa;<sub>p,ex</sub>) <Badge code="derived" pop="st:derived" />; all three modes share the intrinsic Q; under / over coupling = Q<sub>i</sub>/Q<sub>c</sub> 0.5 / 2 <Badge code="template" pop="st:template" />. g is a display range <Badge code="template" pop="st:template" /> (PPLN rings: g/2&pi; about 1.2 MHz <Badge code="reported" pop="r:lu2020optica" />). Ticks: reported on-chip thresholds <Badge code="reported" pop="r:gao2021njp" /> <Badge code="reported" pop="r:lu2021optica" /> <Badge code="reported" pop="r:mckenna2022" />. Pump at 775 nm in spectral color, signal and idler at 1550 nm in <span class="ir">false color</span>.</span></div>
  </div>
</div>
