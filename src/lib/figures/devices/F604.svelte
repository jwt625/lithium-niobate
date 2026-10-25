<!-- F6.04 Traveling-wave EO response. TECH: mono response plot with 3 dB line and single-effect limits, two control
     blocks, preset list of atlas rows. VISUAL: electrode strip with the RF voltage the light sees along the electrode
     (moves only while a control is operated, effects on) + response curve + 44 px controls. Listens for "dv-preset". -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { TW_DEFAULT, twArt, twOuts, twPlot, type TWPreset, type TWState } from "./f604";
  import { fxOn } from "../dom";

  let { init, presets, stamp }: { init: { plT: string; plV: string; art: string; outs: Record<string, string> }; presets: TWPreset[]; stamp: string } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: TWState = { ...TW_DEFAULT };
    const load = (id: string): void => {
      const p = presets.find((x) => x.id === id);
      if (!p) return;
      Object.assign(state, { preset: id, nRF: p.nRF, ng: p.ng });
      if (p.Z0 != null) state.Z0 = Math.min(80, Math.max(20, p.Z0));
      if (p.loss != null) { state.loss = Math.min(15, p.loss); state.fref = p.fref ?? 67; }
      if (p.L != null) state.L = Math.min(40, Math.max(0.5, p.L));
    };
    let raf = 0, t0 = 0;
    const h = mountFig(host, {
      id: "f604", state,
      plots: { pl: (s, w, hh, look) => twPlot(s, presets, w, hh, look), art: (s, w, hh) => twArt(s, w, hh) },
      outs: (s) => twOuts(s),
      onChange: (s, k) => {
        if (k === "preset") load(String(s.preset));
        else if (k !== "logf" && k !== "ph") s.preset = "";
        if (k !== "ph" && fxOn() && !raf) { t0 = performance.now(); const step = (now: number) => { h.set({ ph: ((now - t0) / 1000) * 2 * Math.PI * 0.6 }); raf = now - t0 < 1200 ? requestAnimationFrame(step) : 0; }; raf = requestAnimationFrame(step); }
      },
    });
    const onPreset = (e: Event) => { const id = (e as CustomEvent<string>).detail; load(id); h.set({ preset: id }); host.querySelector<HTMLElement>("[data-fig='f604']")?.scrollIntoView({ block: "nearest" }); };
    window.addEventListener("dv-preset", onPreset);
    return () => { h.dispose(); cancelAnimationFrame(raf); window.removeEventListener("dv-preset", onPreset); };
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f604" data-look="tech">
    <div class="ph"><span>EO response, forward + reflected wave, Z<sub>S</sub> = 50 &Omega;</span><span class="dim">0 to 300 GHz</span></div>
    <div class="dv-pw h280" data-p="pl">{@html init.plT}</div>
    <div class="ro" aria-live="polite">
      <span>f<sub>3dB</sub> <b data-o="f3" style="width:10ch">{@html O.f3}</b></span><span>|n<sub>RF</sub> &minus; n<sub>g</sub>| <b data-o="dn" style="width:5ch">{@html O.dn}</b></span>
      <span>RF loss at f<sub>3dB</sub> <b data-o="lossf3" style="width:8ch">{@html O.lossf3}</b></span><span>f<sub>vel</sub> <b data-o="fvel" style="width:10ch">{@html O.fvel}</b></span><span>f<sub>loss</sub> <b data-o="floss" style="width:10ch">{@html O.floss}</b></span>
    </div>
    <div class="ctl"><label for="f604-pre">Atlas preset</label><select id="f604-pre" data-k="preset"><option value="">manual</option>{#each presets as p (p.id)}<option value={p.id}>{p.lb ?? p.id} · nRF {p.nRF} · ng {p.ng}{p.bw != null ? ` · ${p.gt ? ">" : ""}${p.bw} GHz` : ""}</option>{/each}</select><output>{presets.length} rows</output></div>
    <div class="dv-grid">
      <div>
        <div class="ctl"><label for="f604-L">Length L</label><input id="f604-L" type="range" data-k="L" min="0.5" max="40" step="0.1" value="10"><output data-o="L">{@html O.L}</output></div>
        <div class="ctl"><label for="f604-nr">n<sub>RF</sub></label><input id="f604-nr" type="range" data-k="nRF" min="1.8" max="4.5" step="0.01" value="2.25"><output data-o="nRF">{@html O.nRF}</output></div>
        <div class="ctl"><label for="f604-ng">n<sub>g</sub></label><input id="f604-ng" type="range" data-k="ng" min="2" max="4.5" step="0.01" value="2.25"><output data-o="ng">{@html O.ng}</output></div>
        <div class="ctl"><span class="k">f axis</span><div class="seg" data-k="logf" role="group" aria-label="Frequency axis"><button type="button" data-v="0" class="on">linear</button><button type="button" data-v="1">log</button></div><output></output></div>
      </div>
      <div>
        <div class="ctl"><label for="f604-a">RF loss at <span data-o="fref" style="display:inline-block;width:7ch;white-space:nowrap">{@html O.fref}</span></label><input id="f604-a" type="range" data-k="loss" min="0" max="15" step="0.05" value="3"><output data-o="loss">{@html O.loss}</output></div>
        <div class="ctl"><span class="k">Loss scaling</span><div class="seg" data-k="expo" role="group" aria-label="Loss frequency exponent"><button type="button" data-v="0.5" class="on">&radic;f skin</button><button type="button" data-v="1">f dielectric</button></div><output></output></div>
        <div class="ctl"><label for="f604-z">Z<sub>0</sub></label><input id="f604-z" type="range" data-k="Z0" min="20" max="80" step="0.5" value="50"><output data-o="Z0">{@html O.Z0}</output></div>
        <div class="ctl"><label for="f604-zl">Z<sub>L</sub> <span class="tg"><button type="button" data-t="match" class="on">= Z<sub>0</sub></button></span></label><input id="f604-zl" type="range" data-k="ZL" min="20" max="80" step="0.5" value="50"><output data-o="ZL">{@html O.ZL}</output></div>
      </div>
    </div>
    <div class="pf"><span style="white-space:normal">Model <Badge code="derived" pop="st:derived" />: transmission line with forward and load-reflected waves, source reflection, light transit at n<sub>g</sub> (model in L2 below; model class of <span class="ref" data-pop="r:alferness1982">Alferness 1982</span> and <span class="ref" data-pop="r:chung1991">Chung 1991</span>); response normalized to its DC value. Dashed verticals: velocity-only and loss-only 3 dB limits. Presets load n<sub>RF</sub>, n<sub>g</sub> and, where the row has them, Z<sub>0</sub>, RF loss and length; the marker is the row's reported bandwidth (arrow = lower bound).</span><span class="stampl">{@html stamp}</span></div>
  </div>

  <div class="dvv" data-variant="visual" data-fig="f604" data-look="visual">
    <div class="v-stage v-frame"><div class="dv-pw h260" data-p="art">{@html init.art}</div></div>
    <div class="v-figrow" style="margin-top:28px">
      <div class="v-stage"><div class="dv-pw h360" data-p="pl">{@html init.plV}</div></div>
      <div>
        <div class="v-ctl" style="--w:10ch"><span class="v-lab">3 dB bandwidth</span><output data-o="f3">{@html O.f3}</output></div>
        <dl class="v-hud"><dt>Index mismatch</dt><dd data-o="dn">{@html O.dn}</dd><dt>Velocity limit</dt><dd data-o="fvel">{@html O.fvel}</dd><dt>Loss limit (6.4 dB)</dt><dd data-o="floss">{@html O.floss}</dd><dt>RF loss at f<sub>3dB</sub></dt><dd data-o="lossf3">{@html O.lossf3}</dd></dl>
        <div class="v-ctl" style="margin-top:18px"><label for="f604v-pre">Atlas device</label><select id="f604v-pre" data-k="preset"><option value="">manual</option>{#each presets as p (p.id)}<option value={p.id}>{p.lb ?? p.id} · nRF {p.nRF} · ng {p.ng}{p.bw != null ? ` · ${p.gt ? ">" : ""}${p.bw} GHz` : ""}</option>{/each}</select></div>
      </div>
    </div>
    <div class="v-ctls">
      <div class="v-ctl" style="--w:8ch"><label for="f604v-L">Electrode length</label><output data-o="L">{@html O.L}</output><input id="f604v-L" type="range" data-k="L" min="0.5" max="40" step="0.1" value="10"></div>
      <div class="v-ctl" style="--w:5ch"><label for="f604v-nr">RF index</label><output data-o="nRF">{@html O.nRF}</output><input id="f604v-nr" type="range" data-k="nRF" min="1.8" max="4.5" step="0.01" value="2.25"></div>
      <div class="v-ctl" style="--w:5ch"><label for="f604v-ng">Optical group index</label><output data-o="ng">{@html O.ng}</output><input id="f604v-ng" type="range" data-k="ng" min="2" max="4.5" step="0.01" value="2.25"></div>
      <div class="v-ctl" style="--w:11ch"><label for="f604v-a">RF loss</label><output data-o="loss">{@html O.loss}</output><input id="f604v-a" type="range" data-k="loss" min="0" max="15" step="0.05" value="3"></div>
      <div class="v-ctl" style="--w:8ch"><label for="f604v-z">Line impedance</label><output data-o="Z0">{@html O.Z0}</output><input id="f604v-z" type="range" data-k="Z0" min="20" max="80" step="0.5" value="50"></div>
      <div class="v-ctl"><span class="v-lab">Loss scaling</span><div class="v-seg" data-k="expo" role="group" aria-label="Loss frequency exponent"><button type="button" data-v="0.5" class="on">&radic;f skin</button><button type="button" data-v="1">f dielectric</button></div></div>
      <div class="v-ctl" style="--w:8ch"><label for="f604v-zl">Load impedance Z<sub>L</sub></label><output data-o="ZL">{@html O.ZL}</output><input id="f604v-zl" type="range" data-k="ZL" min="20" max="80" step="0.5" value="50"></div>
      <div class="v-ctl"><span class="v-lab">Load</span><div class="v-chips" style="margin:4px 0 0; grid-area: in"><button type="button" data-t="match" class="on">Z<sub>L</sub> = Z<sub>0</sub></button></div></div>
      <div class="v-ctl"><span class="v-lab">Frequency axis</span><div class="v-seg" data-k="logf" role="group" aria-label="Frequency axis"><button type="button" data-v="0" class="on">linear</button><button type="button" data-v="1">log</button></div></div>
    </div>
    <div class="v-prov"><span>Model: transmission line with forward and load-reflected waves, source impedance Z<sub>S</sub> = 50 &Omega;, light transit at n<sub>g</sub>; model class of <span class="ref" data-pop="r:alferness1982">Alferness 1982</span> and <span class="ref" data-pop="r:chung1991">Chung 1991</span>; response normalized to its DC value; dashed verticals: velocity-only and loss-only 3 dB limits; presets load n<sub>RF</sub>, n<sub>g</sub> and, where present, Z<sub>0</sub>, RF loss and length; marker = reported bandwidth (arrow = lower bound). Set n<sub>RF</sub> = n<sub>g</sub> and loss 0: the response is flat at every length. The strip shows the RF voltage that one optical pulse sees as it crosses the electrode at 100 GHz; the 1550 nm path is drawn in <span class="ir">false color</span>. <Badge code="derived" pop="st:derived" /></span><span>{@html stamp}</span></div>
  </div>
</div>
