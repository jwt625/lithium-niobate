<!-- fig-04-04 Ring sweep: thermal (red shift) versus photorefractive (blue shift) in a TFLN ring. thermal.ts ringSweep:
     adiabatic cavity field, backward-Euler thermal ODE (follows the branch, hysteresis), exact exponential photorefractive
     step (tau_pr = eps eps0 / (sigma_d + kappa I), opposite sign, lin2021). All ring, thermal and photorefractive values are
     templates except dn_e/dT (S or derived) and r33 (P-comp). Both sweep directions are computed and overlaid. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { ringSweep, RING_SWEEP_TEMPLATE } from "$lib/physics/thermal.ts";
  import { axis, px, path, ticks } from "./plot.ts";
  import { e, f, sf } from "./fmtq.ts";

  let { preset = "pr" }: { preset?: "pr" | "thermal" } = $props();
  // svelte-ignore state_referenced_locally
  const id0 = preset === "pr" ? "f4" : "f4b";
  let lgP = $state(0); // log10 mW
  let lgR = $state(0); // log10 nm/s
  // svelte-ignore state_referenced_locally
  let pr = $state(preset === "pr");
  let prS = $state(1);
  let clad = $state<"sio2" | "air">("sio2");
  let dnSrc = $state<"S" | "J">("J");
  let hi = $state<"up" | "down">("up");
  let pos = $state(0.32); // VISUAL scrub, fraction of the sweep (default near the dip of the default state)

  const BASE = RING_SWEEP_TEMPLATE.params;
  const L0 = BASE.lambda0_m, LA = L0 - 40e-12, LB = L0 + 60e-12;
  const KAPPA = 1e-16;
  const params = $derived({
    ...BASE, P_W: 10 ** lgP * 1e-3, sweepRate_m_s: 10 ** lgR * 1e-9, dndT: dnSrc === "S" ? 3.34e-5 : BASE.dndT,
    prGain_A_per_W: pr ? prS * 6.6e4 * KAPPA * (clad === "air" ? 0.2 : 1) : 0, kappa_S_m_per_W: KAPPA,
    sigmaDark_S_m: clad === "air" ? 1e-12 : 1e-14, maxSteps: 16000, nOut: 480,
  });
  const up = $derived(ringSweep({ ...params, lambdaStart_m: LA, lambdaStop_m: LB }));
  const dn = $derived(ringSweep({ ...params, lambdaStart_m: LB, lambdaStop_m: LA }));
  const cur = $derived(hi === "up" ? up : dn);
  const gTh = $derived((BASE.Gamma / BASE.ng) * params.dndT);
  const gPr = (BASE.Gamma / BASE.ng) * -1 * 0.5 * BASE.n ** 3 * BASE.r33_m_per_V;
  const maxAbs = (a: Float64Array) => a.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m), 0);
  const shTh = $derived(L0 * gTh * maxAbs(cur.dTcav)); // m
  const shPr = $derived(L0 * gPr * maxAbs(cur.Esc));
  const minT = (r: typeof up) => r.T.reduce((m, x) => Math.min(m, x), 1);

  // ---------- TECH plots ----------
  const W = 760, H = 300, X0 = 54, X1 = 744, Y0 = 18, Y1 = 256;
  const xa = axis(-40, 60, X0, X1), ya = axis(0, 1.05, Y1, Y0);
  const rel = (r: typeof up) => Float64Array.from(r.lambda, (l) => (l - L0) * 1e12);
  const pUp = $derived(path(xa, ya, rel(up), up.T));
  const pDn = $derived(path(xa, ya, rel(dn), dn.T));
  const IW = 300, IH = 150;
  const ia = $derived(axis(0, cur.t[cur.t.length - 1] || 1, 36, 290));
  const nrm = (a: Float64Array) => { const m = Math.max(1e-30, ...Array.from(a, Math.abs)); return Float64Array.from(a, (x) => Math.abs(x) / m); };
  const iy = axis(0, 1.05, 128, 14);
  const pTh = $derived(path(ia, iy, cur.t, nrm(cur.dTcav)));
  const pE = $derived(path(ia, iy, cur.t, nrm(cur.Esc)));

  // ---------- VISUAL ----------
  const k = $derived(Math.min(cur.T.length - 1, Math.max(0, Math.round(pos * (cur.T.length - 1)))));
  const dTmax = $derived(Math.max(1e-9, ...Array.from(cur.dTcav)));
  const Emax = $derived(Math.max(1e-9, ...Array.from(cur.Esc, Math.abs)));
  const lamK = $derived((cur.lambda[k] - L0) * 1e12);
  const glow = $derived(1 - cur.T[k]); // intracavity fraction (through-port dip depth)
  const vxa = axis(-40, 60, 40, 620), vya = axis(0, 1.05, 380, 270);
  const vUp = $derived(path(vxa, vya, rel(up), up.T));
  const vDn = $derived(path(vxa, vya, rel(dn), dn.T));
  const charges = $derived(Array.from({ length: 18 }, (_, i) => ({ a: (i / 18) * 2 * Math.PI, on: i < Math.round((18 * Math.abs(cur.Esc[k])) / Emax) })));
  let raf = 0;
  function play(): void {
    cancelAnimationFrame(raf);
    if (document.documentElement.dataset.fx !== "on") { pos = 1; return; }
    const t0 = performance.now();
    const step = (): void => { const u = Math.min(1, (performance.now() - t0) / 3000); pos = u; if (u < 1) raf = requestAnimationFrame(step); };
    pos = 0;
    raf = requestAnimationFrame(step);
  }
  onMount(() => () => cancelAnimationFrame(raf));
</script>

<div class="q-fig" id="fig-04-04{preset === 'pr' ? '' : '-th'}">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Ring sweep: through-port T(&lambda;), both directions</span><span>solid: &lambda; increasing; dashed: decreasing</span></div>
    <div class="q-pside">
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Ring transmission versus laser wavelength for increasing and decreasing sweeps">
          {#each ticks(xa, 9) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1={Y0} y2={Y1} /><text x={t.p} y={Y1 + 14} text-anchor="middle">{t.label}</text>{/each}
          {#each ticks(ya, 5) as t (t.v)}<line class="gl" x1={X0} x2={X1} y1={t.p} y2={t.p} /><text x={X0 - 5} y={t.p + 3} text-anchor="end">{t.label}</text>{/each}
          <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          <path class="c1" d={pDn} />
          <path class="c0" d={pUp} />
          <text x={(X0 + X1) / 2} y={H - 8} text-anchor="middle">laser wavelength − 1550 nm (pm)</text>
          <text x={X0} y={Y0 - 5}>T</text>
        </svg>
      </div>
      <div class="q-side">
        <svg class="q-svg" viewBox="0 0 {IW} {IH}" role="img" aria-label="Cavity temperature and space-charge field versus time during the highlighted sweep">
          <rect class="fr" x="36" y="14" width="254" height="114" />
          <path class="c0" d={pTh} />
          <path class="c1" d={pE} />
          <text x="36" y="10">normalized, {hi === "up" ? "λ increasing" : "λ decreasing"}</text>
          <text x="36" y="142">0</text><text x="290" y="142" text-anchor="end">{e(cur.t[cur.t.length - 1], 1, false)} s</text>
          <text x="286" y="110" text-anchor="end" class="labf">cavity ΔT</text><text x="286" y="122" text-anchor="end" class="lab">|space-charge E|, dashed</text>
        </svg>
        <dl class="q-kv">
          <dt>sweep</dt><dd>{e(10 ** lgR, 2)} nm/s</dd>
          <dt>P</dt><dd>{e(10 ** lgP, 2)} mW</dd>
          <dt>thermal shift, max</dt><dd>{e(shTh * 1e12, 2)} pm</dd>
          <dt>PR shift, max</dt><dd>{e(shPr * 1e12, 2)} pm</dd>
          <dt>T<sub>min</sub> up / down</dt><dd>{f(minT(up), 3, 5)} / {f(minT(dn), 3, 5)}</dd>
          <dt>Q<sub>L</sub>, linewidth</dt><dd>{e(up.QL, 2, false)}, {f(up.linewidth_m * 1e12, 2, 5)} pm</dd>
        </dl>
      </div>
    </div>
    <TCtl id="{id0}-p-t" label="Pump power" bind:value={lgP} min={-2} max={2} step={0.02} out="{e(10 ** lgP, 2)} mW" />
    <TCtl id="{id0}-r-t" label="Sweep speed" bind:value={lgR} min={-3} max={3} step={0.02} out="{e(10 ** lgR, 2)} nm/s" />
    <TCtl id="{id0}-s-t" label="PR strength" bind:value={prS} min={0} max={10} step={0.1} out="{f(prS, 1, 5)} ×" disabled={!pr} />
    <div class="ctl"><span class="k">Photorefraction</span><Seg bind:value={pr} options={[[true, "on"], [false, "off"]]} label="Photorefraction" /><span></span></div>
    <div class="ctl"><span class="k">Cladding</span><Seg bind:value={clad} options={[["sio2", "SiO2-clad"], ["air", "air-clad"]]} label="Cladding preset" /><span></span></div>
    <div class="ctl"><span class="k">dn<sub>e</sub>/dT</span><Seg bind:value={dnSrc} options={[["J", "3.75e-5 Jundt"], ["S", "3.34e-5 Moretti"]]} label="dn/dT source" /><span></span></div>
    <div class="ctl"><span class="k">Inset</span><Seg bind:value={hi} options={[["up", "λ up"], ["down", "λ down"]]} label="Inset sweep direction" /><span></span></div>
    <div class="pf">
      <span>dn<sub>e</sub>/dT 1550 nm: Jundt 1997 Sellmeier, coefficients <Src id="jundt1997" code="S" cite={false} />, derivative <Badge code="derived" pop="f4-dn" /> or 1523 nm <Src id="moretti2005" code="S" cite={false} /></span>
      <span>r<sub>33</sub> 30.8 pm/V <Src id="weis1985" code="P-comp" cite={false} /></span><span>n<sub>e</sub> 2.1376 at 1550 nm <Badge code="P-db" pop="q-zel" /></span>
      <span>PR sign opposite to thermal <Src id="lin2021" code="reported" cite={false} /></span>
      <span>cladding trend <Src id="xu2021oe" code="reported" cite={false} /></span>
      <span>R 100 &micro;m, Q<sub>i</sub> 10<sup>6</sup>, n<sub>g</sub> 2.3, &Gamma; 0.8, R<sub>th</sub>, &tau;<sub>th</sub>, &kappa;, &sigma;<sub>d</sub>, PR gain: model parameters, no data <Badge code="template" pop="f4-tmpl" /></span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>{preset === "pr" ? "Heat pulls, charge pushes" : "The thermal triangle"}</h3><span class="q-vq">TFLN ring, radius 100 µm, 1550 nm laser swept across one resonance</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 660 410" role="img" aria-label="Top view of a ring resonator with heat and space charge, and the transmission versus laser wavelength">
          <defs><radialGradient id="{id0}-heat"><stop offset="0.55" stop-color="#ff7a3d" stop-opacity="0" /><stop offset="0.8" stop-color="#ff7a3d" stop-opacity="0.55" /><stop offset="1" stop-color="#ff7a3d" stop-opacity="0" /></radialGradient></defs>
          <circle cx="330" cy="128" r="122" fill="url(#{id0}-heat)" style="opacity:{(cur.dTcav[k] / dTmax).toFixed(3)}" />
          <circle cx="330" cy="128" r="92" class="q-wg" />
          <circle cx="330" cy="128" r="92" class="q-light ir-el" style="opacity:{(0.15 + 0.85 * glow).toFixed(3)}" />
          <line x1="80" x2="580" y1="232" y2="232" class="q-wg" />
          <line x1="80" x2="580" y1="232" y2="232" class="q-light ir-el" style="opacity:{(0.25 + 0.75 * cur.T[k]).toFixed(3)}" />
          {#each charges as c, i (i)}{#if c.on}<text x={330 + 72 * Math.cos(c.a)} y={128 + 72 * Math.sin(c.a) + 4} text-anchor="middle" class="q-ch">{cur.Esc[k] >= 0 ? "+" : "−"}</text>{/if}{/each}
          <text x="80" y="224" class="q-vt">bus, 1550 nm false color</text>
          <text x="580" y="224" text-anchor="end" class="q-vt">ΔT {f(cur.dTcav[k], 2, 6)} K</text>
          {#each ticks(vxa, 6) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1="270" y2="380" /><text x={t.p} y="396" text-anchor="middle">{t.label} pm</text>{/each}
          <text x="34" y="276" text-anchor="end">1</text><text x="34" y="384" text-anchor="end">0</text><text x="40" y="262">T</text>
          <path d={vDn} class="q-vdn" />
          <path d={vUp} class="q-vup" />
          <line x1={px(vxa, lamK)} x2={px(vxa, lamK)} y1="262" y2="384" class="q-cursor" />
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="{id0}-p-v" label="Pump power" bind:value={lgP} min={-2} max={2} step={0.02} out="{e(10 ** lgP, 1, false)} mW" w={10} />
        <VCtl id="{id0}-r-v" label="Sweep speed" bind:value={lgR} min={-3} max={3} step={0.02} out="{e(10 ** lgR, 1, false)} nm/s" w={11} />
        <div class="v-ctl"><span class="v-lab">Photorefraction</span><Seg kind="v" bind:value={pr} options={[[true, "On"], [false, "Off"]]} label="Photorefraction" /></div>
        <VCtl id="{id0}-s-v" label="Photorefraction strength" bind:value={prS} min={0} max={10} step={0.1} out="{f(prS, 1, 5)} ×" w={8} disabled={!pr} />
        <div class="v-ctl"><span class="v-lab">Cladding</span><Seg kind="v" bind:value={clad} options={[["sio2", "SiO₂-clad"], ["air", "Air-clad"]]} label="Cladding preset" /></div>
        <div class="v-ctl"><span class="v-lab">dn<sub>e</sub>/dT, 10⁻⁵ /K</span><Seg kind="v" bind:value={dnSrc} options={[["J", "3.75 Jundt"], ["S", "3.34 Moretti"]]} label="dn/dT source" /></div>
        <div class="v-ctl"><span class="v-lab">Direction shown by the laser</span><Seg kind="v" bind:value={hi} options={[["up", "Red-ward"], ["down", "Blue-ward"]]} label="Sweep direction" /></div>
        <VCtl id="{id0}-x-v" label="Laser position in the sweep" bind:value={pos} min={0} max={1} step={0.002} out="{sf(lamK, 1, 7)} pm" w={10} />
        <div class="q-vrow"><button type="button" class="q-vbtn" onclick={play}>Sweep</button></div>
        <dl class="v-hud">
          <dt>Transmission</dt><dd>{f(cur.T[k], 3, 6)}</dd>
          <dt>Thermal shift, max</dt><dd>{sf(shTh * 1e12, 1, 7)} pm</dd>
          <dt>Photorefractive shift, max</dt><dd>{sf(shPr * 1e12, 1, 7)} pm</dd>
          <dt>Loaded Q, linewidth</dt><dd>{e(up.QL, 2, false)}, {f(up.linewidth_m * 1e12, 2, 5)} pm</dd>
        </dl>
      </div>
    </div>
    <div class="v-prov"><span>dn/dT 1550 nm, Jundt coefficients <Src id="jundt1997" code="S" cite={false} />, derivative <Badge code="derived" pop="f4-dn" /> or 1523 nm <Src id="moretti2005" code="S" cite={false} /></span><span>r<sub>33</sub> 30.8 pm/V <Src id="weis1985" code="P-comp" cite={false} /></span><span>n<sub>e</sub> 2.1376 at 1550 nm <Badge code="P-db" pop="q-zel" /></span><span>cladding trend <Src id="xu2021oe" code="reported" cite={false} /></span><span>R 100 µm, Q<sub>i</sub> 10⁶, n<sub>g</sub> 2.3, Γ 0.8</span><span>opposite-sign photorefraction <Src id="lin2021" code="reported" cite={false} /></span><span>ring, heat sinking, photoconductivity: model parameters, no data <Badge code="template" pop="f4-tmpl" /></span><span>light: 1550 nm, <span class="term" data-pop="v-false">false color</span>, dashed</span></div>
  </div>
</div>

<style>
  .q-wg { fill: none; stroke: var(--v-line2); stroke-width: 9; }
  .q-light { fill: none; stroke: var(--v-ir1550); stroke-width: 3; stroke-dasharray: 7 5; }
  .q-ch { font: 600 calc(15px * var(--q-k)) var(--v-ui) !important; fill: var(--v-au) !important; }
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; font-variant-numeric: tabular-nums; }
  .q-vup { fill: none; stroke: var(--v-ir1550); stroke-width: 2; stroke-dasharray: 6 3; }
  .q-vdn { fill: none; stroke: var(--v-text3); stroke-width: 1.5; stroke-dasharray: 2 3; }
  .q-cursor { stroke: var(--v-text); stroke-width: 1.5; }
  .q-vrow { display: flex; gap: 12px; }
</style>
