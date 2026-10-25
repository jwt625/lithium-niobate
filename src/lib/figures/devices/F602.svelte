<!-- F6.02 Modulator bench. TECH: T(V) line plot + monochrome eye raster + mono control rows. VISUAL: 3D TFLN MZM die
     (scenes/mzm-die, li2026aa geometry) + transfer curve + colour eye + 44 px controls. One state drives both. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { BENCH_DEFAULT, benchOuts, benchTF, drawEye, type BenchDev, type BenchState } from "./f602";
  import { convName } from "./atlas";
  import { cssVar, fxOn, isVisual, onUi } from "../dom";
  import { whenVisual } from "../visual/lifecycle";

  let { init, devs, cap = "" }: { init: { tfT: string; tfV: string; outs: Record<string, string> }; devs: BenchDev[]; cap?: string } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;

  const noteFor = (s: BenchState): string => {
    const d = devs.find((x) => x.id === s.dev);
    if (!d) return "V<sub>&pi;</sub> and f<sub>3dB</sub> are display templates; pick an atlas row to load measured values.";
    const conv = d.conv === "mzm_push_pull" ? "push-pull MZM convention" : `V<sub>&pi;</sub> convention: ${convName(d.conv)}; used as stated, not converted`;
    return `${d.lb ?? d.id} (${d.pl}): V<sub>&pi;</sub> ${d.vpi} V (${d.vsrc}), 3 dB ${d.gt ? "&gt; " : ""}${d.f3} GHz${d.gt ? " (lower bound, used at the stated value)" : ""}; ${conv}.`;
  };

  onMount(() => {
    const state: BenchState = { ...BENCH_DEFAULT };
    const col = (look: string) => look === "visual"
      ? { bg: cssVar("--v-ink1") || "#0a0d13", fg: cssVar("--v-l532") || "#45ff9c", rule: cssVar("--v-line2") || "#364258", tx: cssVar("--v-text3") || "#8a8578" }
      : { bg: cssVar("--bg") || "#0d0d0e", fg: cssVar("--fg") || "#e6e5e0", rule: cssVar("--rule2") || "#3d3e42", tx: cssVar("--fg3") || "#7d7c77" };
    let scene: { setState: (p: Record<string, unknown>) => void; setTheme: (t?: "dark" | "light") => void; setMode: (m: "visual" | "tech") => void; dispose: () => void } | null = null;
    // pulses travel only while a control is operated and for 1.2 s after (no idle animation, DevLog-003b sec. 6)
    let active = false, timer = 0;
    // RF crest phase difference phi_b + pi Vpp / (2 Vpi) (trough phi_b - pi Vpp / (2 Vpi)), same as the bias +- swing readout
    const toScene = (s: BenchState) => { const pb = (s.phiB * Math.PI) / 180; scene?.setState({ V: 0, biasRad: pb, rfPhaseRad: pb + (Math.PI * s.vpp) / (2 * s.vpi), driven: active && fxOn() }); };
    const poke = (): void => { active = true; clearTimeout(timer); timer = window.setTimeout(() => { active = false; toScene(state); }, 1200); };
    const h = mountFig(host, {
      id: "f602",
      state,
      plots: { tf: (s, w, hh, look) => benchTF(s, w, hh, look) },
      canvas: { eye: (c, s, look) => drawEye(c, s, look, col(look)) },
      outs: (s) => ({ ...benchOuts(s), note: noteFor(s) }),
      onChange: (s, k) => {
        if (k === "dev") { const d = devs.find((x) => x.id === s.dev); if (d) { s.vpi = Math.min(30, d.vpi); s.f3 = Math.min(300, d.f3); } }
        if (k === "vpi" || k === "f3") s.dev = "";
      },
      after: (s, k) => { if (k) poke(); toScene(s); },
    });
    const stage = host.querySelector<HTMLElement>("[data-scene]");
    const offV = whenVisual(() => {
      let alive = true;
      if (stage) void import("$lib/scenes/index").then(({ scenes }) => scenes["mzm-die"]()).then(({ mount }) => {
        if (!alive) return;
        scene = mount(stage, { mode: "visual", state: { V: 0, biasRad: (state.phiB * Math.PI) / 180, driven: false, inset: true }, label: "TFLN Mach-Zehnder modulator die, Li 2026 geometry; drag to orbit" }) as unknown as typeof scene;
        toScene(state);
      }).catch(() => { if (stage) stage.innerHTML = '<p class="nodata">3D die not available in this browser (WebGL); the transfer curve and eye below carry the numbers.</p>'; });
      return { repaint: () => { scene?.setTheme(); toScene(state); }, dispose: () => { alive = false; scene?.dispose(); scene = null; } };
    });
    const offU = onUi(() => { if (!isVisual()) scene?.setState({ driven: false }); });
    return () => { h.dispose(); offV(); offU(); clearTimeout(timer); };
  });
</script>

<div class="dvf-wrap" bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f602" data-look="tech">
    <div class="ph"><span>MZM bench: transfer T(V) and optical eye</span><span class="dim">first-order drive low-pass at f<sub>3dB</sub>; PRBS9</span></div>
    <div class="dv-grid">
      <div class="dv-pw h260" data-p="tf">{@html init.tfT}</div>
      <div class="dv-pw h260"><canvas class="dv-cv" data-c="eye" aria-label="Optical eye diagram, two unit intervals"></canvas></div>
    </div>
    <div class="ro" aria-live="polite">
      <span>V<sub>&pi;</sub> <b data-o="vpi" style="width:7ch">{@html O.vpi}</b></span><span>bias <b data-o="bias" style="width:7ch">{@html O.bias}</b></span>
      <span>V<sub>pp</sub>/V<sub>&pi;</sub> <b data-o="vr" style="width:4ch">{@html O.vr}</b></span><span>ER <b data-o="er" style="width:8ch">{@html O.er}</b></span>
      <span>&Delta;&phi; <b data-o="dphi" style="width:15ch">{@html O.dphi}</b></span><span>eye height <b data-o="eye" style="width:4ch">{@html O.eye}</b></span><span>baud/f<sub>3dB</sub> <b data-o="ratio" style="width:5ch">{@html O.ratio}</b></span>
    </div>
    <div class="ctl"><label for="f602-dev">Atlas row</label><select id="f602-dev" data-k="dev"><option value="">template (Vπ 2.00 V, 100 GHz)</option>{#each devs as d (d.id)}<option value={d.id}>{d.lb ?? d.id} · {d.vpi} V · {d.gt ? ">" : ""}{d.f3} GHz{d.conv === "mzm_push_pull" ? "" : ` · ${convName(d.conv)}`}</option>{/each}</select><output>{devs.length} rows</output></div>
    <div class="ctl"><label for="f602-vpi">V<sub>&pi;</sub> <Badge code="template" pop="st:template" /></label><input id="f602-vpi" type="range" data-k="vpi" min="0.5" max="10" step="0.05" value="2"><output data-o="vpi">{@html O.vpi}</output></div>
    <div class="ctl"><label for="f602-f3">f<sub>3dB</sub> <Badge code="template" pop="st:template" /></label><input id="f602-f3" type="range" data-k="f3" min="10" max="300" step="1" value="100"><output data-o="f3">{@html O.f3}</output></div>
    <div class="ctl"><label for="f602-phi">Bias phase &phi;<sub>b</sub></label><input id="f602-phi" type="range" data-k="phiB" min="-180" max="180" step="1" value="-90"><output data-o="phib">{@html O.phib}</output></div>
    <div class="ctl"><label for="f602-vpp">Drive swing V<sub>pp</sub></label><input id="f602-vpp" type="range" data-k="vpp" min="0.1" max="8" step="0.05" value="1"><output data-o="vpp">{@html O.vpp}</output></div>
    <div class="ctl"><label for="f602-baud">Symbol rate</label><input id="f602-baud" type="range" data-k="baud" min="10" max="250" step="1" value="100"><output data-o="baud">{@html O.baud}</output></div>
    <div class="ctl"><span class="k">Format</span><div class="seg" data-k="fmt" role="group" aria-label="Format"><button type="button" data-v="nrz" class="on">NRZ</button><button type="button" data-v="pam4">PAM4</button></div><output></output></div>
    <div class="pf"><span data-o="note" class="note3">V<sub>&pi;</sub> and f<sub>3dB</sub> are display templates; pick an atlas row to load measured values.</span></div>
    {#if cap}<div class="cap">{@html cap}</div>{/if}
  </div>

  <div class="dvv" data-variant="visual" data-fig="f602" data-look="visual">
    <div class="v-stage v-frame" style="height: clamp(300px, 42vw, 460px)" data-scene></div>
    <p class="v-cap" style="margin-top:12px">Die: Li 2026 (device d) geometry from eo-modulator-atlas (9 mm G-S-G line, x-cut) <Badge code="reported" pop="a:li2026aa-d" />; output arm brightness follows T at the bias point; light at 1550 nm in <span class="ir">false color</span>. Drag to orbit.</p>
    <div class="v-figrow" style="margin-top:28px">
      <div class="v-stage"><div class="dv-pw h300" data-p="tf">{@html init.tfV}</div></div>
      <div class="v-stage"><div class="dv-pw h300"><canvas class="dv-cv" data-c="eye" aria-label="Optical eye diagram"></canvas></div></div>
    </div>
    <div class="v-ctls">
      <div class="v-ctl" style="--w:9ch"><label for="f602v-baud">Symbol rate</label><output data-o="baud">{@html O.baud}</output><input id="f602v-baud" type="range" data-k="baud" min="10" max="250" step="1" value="100"></div>
      <div class="v-ctl" style="--w:8ch"><label for="f602v-vpp">Drive swing</label><output data-o="vpp">{@html O.vpp}</output><input id="f602v-vpp" type="range" data-k="vpp" min="0.1" max="8" step="0.05" value="1"></div>
      <div class="v-ctl" style="--w:6ch"><label for="f602v-phi">Bias phase</label><output data-o="phib">{@html O.phib}</output><input id="f602v-phi" type="range" data-k="phiB" min="-180" max="180" step="1" value="-90"></div>
      <div class="v-ctl" style="--w:8ch"><label for="f602v-f3">Bandwidth f<sub>3dB</sub></label><output data-o="f3">{@html O.f3}</output><input id="f602v-f3" type="range" data-k="f3" min="10" max="300" step="1" value="100"></div>
      <div class="v-ctl" style="--w:8ch"><label for="f602v-vpi">V<sub>&pi;</sub></label><output data-o="vpi">{@html O.vpi}</output><input id="f602v-vpi" type="range" data-k="vpi" min="0.5" max="10" step="0.05" value="2"></div>
      <div class="v-ctl"><span class="v-lab">Format</span><div class="v-seg" data-k="fmt" role="group" aria-label="Format"><button type="button" data-v="nrz" class="on">NRZ</button><button type="button" data-v="pam4">PAM4</button></div></div>
    </div>
    <div class="v-ctl" style="margin-top:22px"><label for="f602v-dev">Load a measured device (atlas)</label><select id="f602v-dev" data-k="dev"><option value="">template values</option>{#each devs as d (d.id)}<option value={d.id}>{d.lb ?? d.id}: {d.vpi} V, {d.gt ? ">" : ""}{d.f3} GHz{d.conv === "mzm_push_pull" ? "" : `, ${convName(d.conv)}`}</option>{/each}</select></div>
    <dl class="v-hud">
      <dt>Arm phase difference &Delta;&phi; (bias ± swing)</dt><dd data-o="dphi">{@html O.dphi}</dd><dt>Eye height (of T = 0..1)</dt><dd data-o="eye">{@html O.eye}</dd><dt>Static extinction</dt><dd data-o="er">{@html O.er}</dd>
      <dt>V<sub>pp</sub> / V<sub>&pi;</sub></dt><dd data-o="vr">{@html O.vr}</dd><dt>Symbol rate / f<sub>3dB</sub></dt><dd data-o="ratio">{@html O.ratio}</dd>
    </dl>
    <div class="v-prov"><span data-o="note" class="note3">V<sub>&pi;</sub> and f<sub>3dB</sub> are display templates; pick an atlas row to load measured values.</span><span>model: PRBS9 drive, first-order low-pass, T = cos<sup>2</sup>(&pi;V/2V<sub>&pi;</sub> + &phi;<sub>b</sub>/2) <Badge code="derived" pop="st:derived" /></span></div>
  </div>
</div>
