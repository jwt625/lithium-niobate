<!-- F6.07 Ring modulator with A7 (atlas bandwidth vs loaded Q). TECH: two mono panels + control rows. VISUAL: illustrated
     ring whose dashed 1550 nm glow follows the stored energy at the laser, plus the two panels. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { RING_DEFAULT, ringArt, ringOuts, ringPlot, type RingState } from "./f607";
  import { chartA7 } from "./charts";
  import { atlasHover, qual, type Pt } from "./atlas";

  let { init, pts, stamp }: { init: { trT: string; trV: string; a7T: string; a7V: string; art: string; outs: Record<string, string> }; pts: Pt[]; stamp: string } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: RingState = { ...RING_DEFAULT };
    const hov = atlasHover((d) => [["loaded Q", d.q_loaded, "", qual(d, "q_loaded")], ["3 dB bandwidth", d.bw3db_ghz, "GHz", qual(d, "bw3db_ghz")]]);
    const h = mountFig(host, {
      id: "f607", state,
      plots: { tr: (s, w, hh, look) => ringPlot(s, w, hh, look), a7: (s, w, hh, look) => chartA7(pts, s.QL, w, hh, look), art: (s, w, hh) => ringArt(s, w, hh) },
      outs: (s) => ringOuts(s),
      hover: (id) => hov(id),
    });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f607" data-look="tech">
    <div class="ph"><span>Ring modulator, all-pass, critical coupling, 1550 nm</span><span class="dim">{pts.length} atlas rows</span></div>
    <div class="dv-grid">
      <div class="dv-pw h260" data-p="tr">{@html init.trT}</div>
      <div class="dv-pw h260" data-p="a7">{@html init.a7T}</div>
    </div>
    <div class="ro" aria-live="polite">
      <span>Q<sub>L</sub> <b data-o="QL" style="width:7ch">{@html O.QL}</b></span><span>linewidth <b data-o="lw" style="width:10ch">{@html O.lw}</b></span>
      <span>&tau;<sub>ph</sub> <b data-o="tau" style="width:9ch">{@html O.tau}</b></span><span>shift <b data-o="shift" style="width:9ch">{@html O.shift}</b></span><span>T at laser <b data-o="T" style="width:5ch">{@html O.T}</b></span>
    </div>
    <div class="ctl"><label for="f607-q">Loaded Q</label><input id="f607-q" type="range" data-k="QL" data-log min="3.30103" max="5.30103" step="0.005" value="4"><output data-o="QL">{@html O.QL}</output></div>
    <div class="ctl"><label for="f607-t">Tuning <Badge code="template" pop="st:template" /></label><input id="f607-t" type="range" data-k="tune" min="1" max="30" step="0.5" value="7"><output data-o="tune">{@html O.tune}</output></div>
    <div class="ctl"><label for="f607-v">Voltage V</label><input id="f607-v" type="range" data-k="V" min="-5" max="5" step="0.05" value="0"><output data-o="V">{@html O.V}</output></div>
    <div class="ctl"><label for="f607-d">Laser detuning</label><input id="f607-d" type="range" data-k="det" min="-3" max="3" step="0.05" value="-0.5"><output data-o="det">{@html O.det}</output></div>
    <div class="pf"><span style="white-space:normal">Linewidth &nu;<sub>0</sub>/Q<sub>L</sub>, photon lifetime Q<sub>L</sub>/(2&pi;&nu;<sub>0</sub>) <Badge code="derived" pop="st:derived" />. Tuning default 7 pm/V; the Wang 2018 Q 50,000 ring reports 0.007 nm/V <Badge code="reported" pop="a:wang2018-rt-q50k" />. Ring radius 100 µm and n<sub>g</sub> 2.3 set the FSR only <Badge code="template" pop="st:template" />. Detuning in linewidths of the unbiased resonance. Right plot: filled = EO S21, hollow = photon-lifetime estimate, arrow = lower bound; dashed line = linewidth.</span><span class="stampl">{@html stamp}</span></div>
  </div>

  <div class="dvv" data-variant="visual" data-fig="f607" data-look="visual">
    <div class="v-stage v-frame" style="height: clamp(300px, 40vw, 460px)"><div class="dv-pw" style="height:100%" data-p="art">{@html init.art}</div></div>
    <div style="margin-top:28px">
      <div>
        <div class="v-ctls" style="margin-top:0">
          <div class="v-ctl" style="--w:8ch"><label for="f607v-q">Loaded Q</label><output data-o="QL">{@html O.QL}</output><input id="f607v-q" type="range" data-k="QL" data-log min="3.30103" max="5.30103" step="0.005" value="4"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f607v-v">Voltage</label><output data-o="V">{@html O.V}</output><input id="f607v-v" type="range" data-k="V" min="-5" max="5" step="0.05" value="0"></div>
          <div class="v-ctl" style="--w:8ch"><label for="f607v-d">Laser detuning (linewidths)</label><output data-o="det">{@html O.det}</output><input id="f607v-d" type="range" data-k="det" min="-3" max="3" step="0.05" value="-0.5"></div>
        </div>
        <dl class="v-hud">
          <dt>Linewidth (speed scale)</dt><dd data-o="lw">{@html O.lw}</dd><dt>Photon lifetime</dt><dd data-o="tau">{@html O.tau}</dd>
          <dt>Resonance shift</dt><dd data-o="shift">{@html O.shift}</dd><dt>T at the laser</dt><dd data-o="T">{@html O.T}</dd>
        </dl>
      </div>
    </div>
    <div class="v-figrow" style="margin-top:32px">
      <div class="v-stage"><div class="dv-pw h300" data-p="tr">{@html init.trV}</div></div>
      <div class="v-stage"><div class="dv-pw h300" data-p="a7">{@html init.a7V}</div></div>
    </div>
    <div class="v-prov"><span>Tuning 7 pm/V <Badge code="template" pop="st:template" />; the Wang 2018 Q 50,000 ring reports 0.007 nm/V <Badge code="reported" pop="a:wang2018-rt-q50k" />. Ring radius 100 µm and n<sub>g</sub> 2.3 set the FSR only <Badge code="template" pop="st:template" />. Linewidth &nu;<sub>0</sub>/Q<sub>L</sub> and photon lifetime Q<sub>L</sub>/(2&pi;&nu;<sub>0</sub>) <Badge code="derived" pop="st:derived" />. The ring glow is the computed circulating power at the laser, in <span class="ir">false color</span>. Right: {pts.length} atlas resonant modulators; filled = EO S21, hollow = photon-lifetime estimate, arrow = lower bound; dashed line = linewidth.</span><span>{@html stamp}</span></div>
  </div>
</div>
