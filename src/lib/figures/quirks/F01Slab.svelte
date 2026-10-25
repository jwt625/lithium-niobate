<!-- fig-04-01 Write and erase: reduced band-transport slab (prslab.ts). A Gaussian beam (w template) writes the open-circuit
     field E(x, z, t) = E_sat (1 - exp(-t/tau_lit)) locally (uniform-illumination formula applied point by point, absorption
     along the beam); lights off: E decays with tau_dark = eps eps0 / sigma_d. Delta n_e = -(1/2) n_e^3 r33 |E| (decrease in
     the lit region, chen1969). TECH: ASCII cross-section (log levels) + |E|(t) log-log. VISUAL: bench with the scar seen
     as refraction of a background grid, lights-off clock. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { SLAB_PRESETS, SLAB_MATERIAL, slabState, scFieldWrite, scFieldErase, pockelsDeltaN } from "$lib/physics/prslab.ts";
  import { axis, px, path, ticks, logspace } from "./plot.ts";
  import { e, dur, pow10 } from "./fmtq.ts";

  type PresetId = "fe" | "cln" | "mgo5" | "nsln";
  let lgI = $state(0); // log10 W/cm^2
  let lgT = $state(1); // log10 s exposure
  let preset = $state<PresetId>("fe");
  let lgSd = $state(-15); // log10 S/m
  let dark = $state(false);
  let lgD = $state(5); // log10 s in the dark
  let shownD = $state(5); // animated display of lgD (VISUAL clock)

  const EPS = SLAB_MATERIAL.eps33.value, NE = SLAB_MATERIAL.ne633.value, R33 = SLAB_MATERIAL.r33T_m_per_V.value;
  const DN_PER_E = Math.abs(pockelsDeltaN(NE, R33, 1));
  const THICK = 1e-3; // slab thickness along the beam, m (template geometry)

  const P = $derived(SLAB_PRESETS.find((p) => p.id === preset) ?? SLAB_PRESETS[0]);
  const I = $derived(10 ** lgI * 1e4); // W/m^2
  const sd = $derived(10 ** lgSd);
  const tExp = $derived(10 ** lgT);
  const st = $derived(slabState(P, I, sd, EPS));
  /** field magnitude at intensity Iloc after exposure, then after tDark in the dark */
  function fieldAt(Iloc: number, tD: number): number {
    const s = slabState(P, Iloc, sd, EPS);
    const Ew = Math.abs(scFieldWrite(tExp, s.Esat, s.tauLit));
    return dark ? Math.abs(scFieldErase(tD, Ew, s.tauDark)) : Ew;
  }
  const tDark = $derived(10 ** lgD);
  const Enow = $derived(fieldAt(I, tDark));
  const dnNow = $derived(-DN_PER_E * Enow);
  const tauDarkTxt = $derived(dur(st.tauDark).trim());

  // ---------- TECH plot: |E|(t), log-log; right axis |dn_e| ----------
  const W = 560, H = 250, L0 = 52, R0 = 500, T0 = 26, B0 = 214;
  const xa = axis(1e-3, 1e7, L0, R0, true), ya = axis(1, 1e8, B0, T0, true);
  const ts = logspace(1e-3, 1e7, 241);
  const curve = $derived.by(() => {
    const ys = Float64Array.from(ts, (t) => {
      if (t <= tExp) return Math.abs(scFieldWrite(t, st.Esat, st.tauLit));
      const Ew = Math.abs(scFieldWrite(tExp, st.Esat, st.tauLit));
      return dark ? Math.abs(scFieldErase(t - tExp, Ew, st.tauDark)) : Math.abs(scFieldWrite(t, st.Esat, st.tauLit));
    });
    return path(xa, ya, ts, ys);
  });
  const xt = ticks(xa, 5, 2), yt = ticks(ya, 5, 2);
  const dnTicks = [-9, -7, -5, -3].map((k) => ({ k, p: px(ya, 10 ** k / DN_PER_E) }));

  // ---------- ASCII cross-section: x across the beam (+-2.4 w), z along the beam (absorption) ----------
  const RAMP = " .:-=+*#%";
  const COLS = 64, ROWS = 9;
  const ascii = $derived.by(() => {
    const lines: string[] = [];
    for (let r = 0; r < ROWS; r++) {
      const z = (r / (ROWS - 1)) * THICK;
      let s = "";
      for (let c = 0; c < COLS; c++) {
        const x = ((c + 0.5) / COLS - 0.5) * 4.8; // in units of w
        const Iloc = I * Math.exp(-2 * x * x) * Math.exp(-P.alpha_per_m * z);
        const dn = DN_PER_E * fieldAt(Iloc, tDark);
        const lv = dn <= 0 ? 0 : Math.max(0, Math.min(8, Math.floor(((Math.log10(dn) + 8) / 5) * 8) + 1));
        s += RAMP[dn < 1e-8 ? 0 : lv];
      }
      lines.push(s);
    }
    return lines.join("\n");
  });

  // ---------- VISUAL bench ----------
  const VW = 640, VH = 300;
  const CX0 = 250, CX1 = 560, CY0 = 70, CY1 = 250; // crystal front face
  const DNFS = 5e-4; // full-scale |dn| for the drawing (linear)
  const shownTD = $derived(10 ** shownD);
  const wPx = 22; // beam 1/e^2 radius in drawing px
  const BY = (CY0 + CY1) / 2;
  const grid = $derived.by(() => {
    // horizontal grid lines behind the crystal, bent by the transverse index gradient (deflection ~ L d(dn)/dy, exaggerated)
    const lines: string[] = [];
    for (let k = -4; k <= 4; k++) {
      const y0 = BY + k * 19;
      let s = "";
      for (let xi = 0; xi <= 40; xi++) {
        const x = CX0 + 8 + (xi / 40) * (CX1 - CX0 - 16);
        const yUnits = (y0 - BY) / wPx;
        const g = gradAt(yUnits);
        const depth = (x - CX0) / (CX1 - CX0);
        const dy = -2400 * depth * (g / DNFS);
        s += `${xi ? "L" : "M"}${x.toFixed(1)} ${(y0 + Math.max(-14, Math.min(14, dy))).toFixed(1)}`;
      }
      lines.push(s);
    }
    return lines;
  });
  function gradAt(yu: number): number {
    const h = 0.05;
    const f = (y: number) => DN_PER_E * fieldAt(I * Math.exp(-2 * y * y), shownTD);
    return ((f(yu + h) - f(yu - h)) / (2 * h)) * (1 / 400); // per drawing px scale
  }
  const scarOp = $derived(Math.min(1, (DN_PER_E * fieldAt(I, shownTD)) / DNFS));
  const beamOp = $derived(dark ? 0.1 : 0.35 + 0.65 * Math.min(1, (lgI + 2) / 8));
  // VISUAL timeline strip
  const SW = 640, SH = 120, SL = 40, SR = 620, ST = 14, SB = 92;
  const sxa = axis(1e-3, 1e7, SL, SR, true), sya = axis(1e-9, 1e-2, SB, ST, true);
  const vcurve = $derived.by(() => {
    const ys = Float64Array.from(ts, (t) => {
      const Ew = t <= tExp ? Math.abs(scFieldWrite(t, st.Esat, st.tauLit)) : dark ? Math.abs(scFieldErase(t - tExp, Math.abs(scFieldWrite(tExp, st.Esat, st.tauLit)), st.tauDark)) : Math.abs(scFieldWrite(t, st.Esat, st.tauLit));
      return Ew * DN_PER_E;
    });
    return path(sxa, sya, ts, ys);
  });
  const nowX = $derived(px(sxa, Math.min(1e7, tExp + (dark ? shownTD : 0))));

  let anim = 0;
  function toggleDark(): void {
    dark = !dark;
    cancelAnimationFrame(anim);
    if (!dark || document.documentElement.dataset.fx !== "on") { shownD = lgD; return; }
    const t0 = performance.now(), target = lgD, from = 0;
    const step = (): void => {
      const u = Math.min(1, (performance.now() - t0) / 1200);
      shownD = from + (target - from) * (1 - (1 - u) ** 3);
      if (u < 1) anim = requestAnimationFrame(step);
    };
    shownD = from;
    anim = requestAnimationFrame(step);
  }
  $effect(() => { shownD = lgD; });
  onMount(() => () => cancelAnimationFrame(anim));
  const speed = $derived(dark ? e(tDark / 1.2, 1, false) : "");
  const PRESETS: [PresetId, string][] = [["fe", "LiNbO<sub>3</sub>:Fe"], ["cln", "congruent"], ["mgo5", "5% MgO"], ["nsln", "near-stoich."]];
  const VPRESETS: [PresetId, string][] = [["fe", "Fe"], ["cln", "CLN"], ["mgo5", "MgO 5%"], ["nsln", "NSLN"]];
</script>

<div class="q-fig" id="fig-04-01">
  <!-- ================= TECH ================= -->
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Write and erase: |E<sub>sc</sub>| and &Delta;n<sub>e</sub> of a Gaussian beam track</span><span>open circuit, local saturation</span></div>
    <div class="q-two">
      <div>
        <div class="q-cap">cross-section, x across beam (&plusmn;2.4 w), z along beam (1 mm); |&Delta;n<sub>e</sub>| log levels 10<sup>&minus;8</sup>..10<sup>&minus;3</sup> <span class="q-ramp">{RAMP}</span></div>
        <pre class="q-ascii q-slab" aria-label="ASCII cross-section of the index change">{ascii}</pre>
      </div>
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Space-charge field versus time, log-log">
          {#each xt as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={T0} y2={B0} />{#if t.label}<text x={t.p} y={B0 + 13} text-anchor="middle">{t.label}</text>{/if}{/each}
          {#each yt as t (t.v)}<line class="gl" x1={L0} x2={R0} y1={t.p} y2={t.p} />{#if t.label}<text x={L0 - 4} y={t.p + 3} text-anchor="end">{t.label}</text>{/if}{/each}
          {#each dnTicks as t (t.k)}<line class="ax" x1={R0} x2={R0 + 4} y1={t.p} y2={t.p} /><text x={R0 + 6} y={t.p + 3}>{pow10(t.k)}</text>{/each}
          <rect class="fr" x={L0} y={T0} width={R0 - L0} height={B0 - T0} />
          <line class="cur" x1={px(xa, tExp)} x2={px(xa, tExp)} y1={T0} y2={B0} />
          <path class="c0" d={curve} />
          <text x={(L0 + R0) / 2} y={H - 4} text-anchor="middle">t (s)</text>
          <text x={L0} y={T0 - 8} text-anchor="start">|E| (V/m)</text>
          <text x={R0} y={T0 - 8} text-anchor="end">|&Delta;n<tspan dy="2" font-size="8">e</tspan><tspan dy="-2">|</tspan></text>
        </svg>
      </div>
    </div>
    <TCtl id="f1-i-t" label="Intensity I" bind:value={lgI} min={-2} max={6} step={0.05} out="{e(10 ** lgI, 2)} W/cm²" />
    <TCtl id="f1-t-t" label="Exposure t" bind:value={lgT} min={-1} max={4} step={0.05} out="{e(tExp, 2)} s" />
    <TCtl id="f1-s-t" label="σ<sub>d</sub>" bind:value={lgSd} min={-16} max={-14} step={0.05} out="{e(sd, 2)} S/m" />
    <TCtl id="f1-d-t" label="Time in dark" bind:value={lgD} min={0} max={7} step={0.05} out="{e(tDark, 2)} s" disabled={!dark} />
    <div class="ctl"><span class="k">Crystal</span><Seg bind:value={preset} options={PRESETS} label="Crystal preset" /><span></span></div>
    <div class="ctl"><span class="k">Light</span><div class="seg" role="group" aria-label="Lights"><button type="button" class:on={!dark} onclick={() => dark && toggleDark()}>on</button><button type="button" class:on={dark} onclick={() => !dark && toggleDark()}>off</button></div><span></span></div>
    <div class="q-ro">
      <span>I         <b>{e(10 ** lgI, 2)}</b> W/cm²</span>
      <span>|E<sub>sat</sub>|    <b>{e(Math.abs(st.Esat), 2)}</b> V/m</span>
      <span>Δn<sub>e</sub> now   <b>{e(dnNow, 2)}</b></span>
      <span>τ lit     <b>{e(st.tauLit, 2)}</b> s</span>
      <span>τ dark    <b>{e(st.tauDark, 2)}</b> s = <b>{dur(st.tauDark)}</b></span>
    </div>
    <div class="pf">
      <span>k<sub>G</sub>(Fe) 2.8&times;10<sup>&minus;9</sup> cm/V <Src id="volk2008" loc="p. 59" code="P-comp" cite={false} /></span>
      <span>&sigma;<sub>d</sub> range <Src id="volk2008" loc="p. 60" code="P-comp" cite={false} /></span>
      <span>&alpha;, &kappa;, w, 1 mm <Badge code="template" pop="f1-tmpl" /></span>
      <span>MgO: &kappa; &times;100 <Src id="bryan1984" code="reported" cite={false} /></span>
      <span>&epsilon;<sub>33</sub> 28, n<sub>e</sub> 2.2028, r<sub>33</sub><sup>T</sup> 32.2 pm/V <Src id="weis1985" code="P-comp" cite={false} /></span>
      <span>model parameter, no data: &alpha;, &kappa;</span>
    </div>
  </figure>

  <!-- ================= VISUAL ================= -->
  <div class="q-vfig" data-variant="visual">
    <header><h3>Write a scar, turn the light off</h3><span class="q-vq">532 nm beam into a 1 mm slab; bulk photovoltaic field, open circuit, local saturation</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg q-bench" viewBox="0 0 {VW} {VH}" role="img" aria-label="Laser beam writing an index scar into a crystal; the background grid bends where the index changed">
          <defs>
            <linearGradient id="f1-beam" x1="0" x2="1"><stop offset="0" stop-color="var(--v-l532)" stop-opacity="0.9" /><stop offset="1" stop-color="var(--v-l532)" stop-opacity="0.35" /></linearGradient>
            <filter id="f1-glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          <!-- laser -->
          <rect x="20" y={BY - 22} width="110" height="44" class="q-laser" />
          <text x="75" y={BY + 4} text-anchor="middle" class="q-lt">532 nm</text>
          <!-- crystal: top face + front face -->
          <path d="M{CX0} {CY0} L{CX0 + 40} {CY0 - 28} L{CX1 + 40} {CY0 - 28} L{CX1} {CY0} Z" class="q-ln-top" />
          <path d="M{CX1} {CY0} L{CX1 + 40} {CY0 - 28} L{CX1 + 40} {CY1 - 28} L{CX1} {CY1} Z" class="q-ln-side" />
          <rect x={CX0} y={CY0} width={CX1 - CX0} height={CY1 - CY0} class="q-ln-front" />
          <!-- background grid seen through the crystal -->
          <g class="q-grid">{#each grid as d, k (k)}<path {d} />{/each}</g>
          <!-- scar glow -->
          <rect x={CX0 + 2} y={BY - wPx * 1.3} width={CX1 - CX0 - 4} height={wPx * 2.6} class="q-scar" style="opacity:{(0.85 * scarOp).toFixed(3)}" filter="url(#f1-glow)" />
          <!-- beam -->
          <g style="opacity:{beamOp.toFixed(3)}" class="q-beamg">
            <rect x="130" y={BY - 3} width={CX0 - 130} height="6" fill="var(--v-l532)" />
            <rect x={CX0} y={BY - 3} width={CX1 - CX0} height="6" fill="url(#f1-beam)" />
            <rect x="130" y={BY - 6} width={CX1 - 130} height="12" fill="var(--v-l532)" opacity="0.25" filter="url(#f1-glow)" />
          </g>
          <text x={CX0} y={CY1 + 22} class="q-vl">+c &rarr;</text>
          <text x={CX1} y={CY1 + 22} text-anchor="end" class="q-vl">grid bend &times;2400 L&middot;&part;&Delta;n/&part;y, drawn</text>
          {#if dark}<text x={CX1 + 40} y={CY0 - 38} text-anchor="end" class="q-vclock">dark {dur(shownTD).trim()}  &middot;  time &times;{speed}</text>{:else}<text x={CX1 + 40} y={CY0 - 38} text-anchor="end" class="q-vclock">exposure {dur(tExp).trim()}</text>{/if}
        </svg>
        <svg class="q-svg q-strip" viewBox="0 0 {SW} {SH}" role="img" aria-label="Index change at the beam centre versus time">
          {#each ticks(sxa, 5, 2) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={ST} y2={SB} />{#if t.label}<text x={t.p} y={SB + 16} text-anchor="middle">{t.label} s</text>{/if}{/each}
          {#each [-8, -6, -4] as k (k)}<line class="gl" x1={SL} x2={SR} y1={px(sya, 10 ** k)} y2={px(sya, 10 ** k)} /><text x={SL - 4} y={px(sya, 10 ** k) + 4} text-anchor="end">{pow10(k)}</text>{/each}
          <path class="c0" d={vcurve} />
          <line class="q-now" x1={nowX} x2={nowX} y1={ST} y2={SB} />
          <text x={SR} y={ST - 2} text-anchor="end">|&Delta;n<tspan dy="3" font-size="9">e</tspan><tspan dy="-3">| at the beam centre</tspan></text>
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f1-i-v" label="Intensity" bind:value={lgI} min={-2} max={6} step={0.05} out="{e(10 ** lgI, 1, false)} W/cm²" w={15} />
        <VCtl id="f1-t-v" label="Exposure" bind:value={lgT} min={-1} max={4} step={0.05} out={dur(tExp)} w={11} />
        <div class="v-ctl"><span class="v-lab">Crystal</span><Seg kind="v" bind:value={preset} options={VPRESETS} label="Crystal preset" /></div>
        <VCtl id="f1-s-v" label="Dark conductivity" bind:value={lgSd} min={-16} max={-14} step={0.05} out="{e(sd, 1, false)} S/m" w={12} />
        <div class="q-vrow"><button type="button" class="q-vbtn" class:on={dark} onclick={toggleDark}>{dark ? "Lights on" : "Lights off"}</button></div>
        <VCtl id="f1-d-v" label="Time in the dark" bind:value={lgD} min={0} max={7} step={0.05} out={dur(tDark)} w={11} disabled={!dark} />
        <dl class="v-hud">
          <dt>Index change now</dt><dd>{e(dnNow, 2)}</dd>
          <dt>Saturated field</dt><dd>{e(Math.abs(st.Esat), 2, false)} V/m</dd>
          <dt>Scar lifetime, lit</dt><dd>{dur(st.tauLit)}</dd>
          <dt>Scar lifetime, dark</dt><dd>{dur(st.tauDark)}</dd>
        </dl>
      </div>
    </div>
    <div class="v-prov">
      <span>k<sub>G</sub> Fe <Src id="volk2008" loc="p. 59" code="P-comp" cite={false} /></span>
      <span>&sigma;<sub>d</sub> range <Src id="volk2008" loc="p. 60" code="P-comp" cite={false} /></span>
      <span>MgO: photoconductivity &times;100 <Src id="bryan1984" code="reported" cite={false} /></span>
      <span>absorption, photoconductivity, beam size: model parameters, no data <Badge code="template" pop="f1-tmpl" /></span>
      <span>&epsilon;<sub>33</sub> 28, n<sub>e</sub> 2.2028, r<sub>33</sub><sup>T</sup> 32.2 pm/V <Src id="weis1985" code="P-comp" cite={false} /></span>
      <span>beam: 532 nm, computed spectral color</span>
    </div>
  </div>
</div>

<style>
  .q-cap { padding: 4px 8px 0; font: 400 10.5px/15px var(--mono); color: var(--fg3); }
  .q-ramp { white-space: pre; color: var(--fg); border: 1px solid var(--rule); padding: 0 2px; }
  .q-slab { height: 128px; border-top: 1px dashed var(--rule); margin: 4px 8px 8px; padding: 6px 0; }
    .q-laser { fill: var(--v-ink2); stroke: var(--v-line2); stroke-width: 2; }
  .q-lt { font: 500 calc(14px * var(--q-k)) var(--v-ui) !important; fill: var(--v-l532) !important; }
  .q-ln-front { fill: color-mix(in srgb, var(--v-ln) 14%, transparent); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-ln-top { fill: color-mix(in srgb, var(--v-ln) 24%, transparent); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-ln-side { fill: color-mix(in srgb, var(--v-ln) 8%, transparent); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-grid path { fill: none; stroke: var(--v-text3); stroke-width: 1; opacity: 0.7; }
  .q-scar { fill: var(--v-l532); transition: opacity 240ms var(--v-ease); }
  .q-beamg { transition: opacity 240ms var(--v-ease); }
  .q-vl { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-vclock { font: 500 calc(15px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; font-variant-numeric: tabular-nums; white-space: pre; }
  .q-strip { border-top: 1px solid var(--v-line); }
  .q-now { stroke: var(--v-text2); stroke-width: 1.5; stroke-dasharray: 3 3; }
  .q-vrow { display: flex; gap: 12px; }
</style>
