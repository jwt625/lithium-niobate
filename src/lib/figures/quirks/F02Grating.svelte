<!-- fig-04-02 Fringes to field: 1D photorefractive grating (prslab.ts grating1D, closed-form steady state with mean(E) = 0)
     with the diffusion closed form (volk2008 Eq. 3.9) overlaid. Photovoltaic field in phase with the fringes, diffusion
     field shifted a quarter period. TECH: four aligned normalized rows. VISUAL: fringes, charge glyphs, index ribbon,
     caliper between fringe peak and index peak. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { grating1D, diffusionFieldAmplitude, diffusionField } from "$lib/physics/prslab.ts";
  import { e, f, sf } from "./fmtq.ts";

  let lgL = $state(0); // log10 um
  let m = $state(0.5);
  let w = $state(1);
  let T = $state(295);
  let diff = $state(true);

  const N = 256;
  const Lam = $derived(10 ** lgL * 1e-6);
  const g = $derived(grating1D({ N, periods: 2, Lambda_m: Lam, m, I0_W_m2: 1e4, kG_m_per_V: 2.8e-11 * w, alpha_per_m: 1000, kappa_S_m_per_W: 1e-14, sigmaDark_S_m: 1e-15, epsR: 28, T_K: T, diffusion: diff }));
  const Edif1 = $derived(diffusionFieldAmplitude(Lam, T, 1));
  const zero = $derived(m < 1e-6 || (!diff && w === 0));
  const phase = $derived(zero ? 0 : g.phase_deg);

  function norm(a: Float64Array, centre = true): { v: number[]; amp: number } {
    let mean = 0;
    if (centre) { for (const x of a) mean += x; mean /= a.length; }
    let amp = 0;
    for (const x of a) amp = Math.max(amp, Math.abs(x - mean));
    return { v: Array.from(a, (x) => (amp > 0 ? (x - mean) / amp : 0)), amp };
  }
  const rows = $derived([
    { k: "I", lab: "I(z) − Ī", n: norm(g.I), unit: "W/m²" },
    { k: "rho", lab: "ρ(z)", n: norm(g.rho), unit: "C/m³" },
    { k: "E", lab: "space-charge E(z)", n: norm(g.E), unit: "V/m" },
    { k: "dn", lab: "Δnₑ(z) − mean", n: norm(g.dn), unit: "" },
  ]);
  // closed-form diffusion field on the same grid, scaled to the E row
  const difRow = $derived.by(() => {
    if (!diff || m < 1e-6) return null;
    const a = Float64Array.from(g.z, (z) => diffusionField(z, Lam, T, m));
    const en = norm(g.E);
    return Array.from(a, (x) => (en.amp > 0 ? x / en.amp : 0));
  });

  // ---------- TECH geometry ----------
  const W = 780, RH = 50, X0 = 150, X1 = 768, H = 4 * RH + 22;
  const xz = (i: number) => X0 + (i / (N - 1)) * (X1 - X0);
  const rowPath = (v: number[], k: number) => v.map((y, i) => `${i ? "L" : "M"}${xz(i).toFixed(1)} ${(k * RH + RH / 2 - y * (RH / 2 - 6)).toFixed(1)}`).join("");

  // ---------- VISUAL geometry ----------
  const VW = 640, VH = 300, VX0 = 30, VX1 = 610;
  const vx = (i: number) => VX0 + (i / N) * (VX1 - VX0);
  const fringes = $derived(Array.from({ length: 64 }, (_, k) => { const i = Math.floor((k + 0.5) * (N / 64)); return { x: VX0 + (k / 64) * (VX1 - VX0), w: (VX1 - VX0) / 64 + 0.5, a: g.I[i] / Math.max(...g.I) }; }));
  const charges = $derived.by(() => {
    const r = norm(g.rho);
    return Array.from({ length: 40 }, (_, k) => { const i = Math.floor((k + 0.5) * (N / 40)); return { x: VX0 + ((k + 0.5) / 40) * (VX1 - VX0), s: r.v[i] }; });
  });
  const ribbon = $derived.by(() => {
    const d = norm(g.dn).v;
    const top = d.map((y, i) => `${i ? "L" : "M"}${vx(i).toFixed(1)} ${(232 - y * 26).toFixed(1)}`).join("");
    return `${top}L${vx(N - 1).toFixed(1)} 262 L${VX0} 262 Z`;
  });
  const ribbonLine = $derived(norm(g.dn).v.map((y, i) => `${i ? "L" : "M"}${vx(i).toFixed(1)} ${(232 - y * 26).toFixed(1)}`).join(""));
  // fringe peak at z = 0 and z = Lambda (two periods: x0 + half width); index peak shifted by phase
  const per = (VX1 - VX0) / 2;
  const xI = VX0 + per; // fringe peak (z = Lambda)
  const xN = $derived(xI - (phase / 360) * per);
</script>

<div class="q-fig" id="fig-04-02">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Fringes to field: 1D grating along c, two periods, steady state</span><span>rows normalized to their amplitude</span></div>
    <div class="q-pside"><div>
    <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Intensity, charge density, space-charge field and index change along two grating periods">
      {#each rows as r, k (r.k)}
        <line class="gl" x1={X0} x2={X1} y1={k * RH + RH / 2} y2={k * RH + RH / 2} />
        <text x="4" y={k * RH + RH / 2 - 3} class="labf">{r.lab}</text>
        <text x="4" y={k * RH + RH / 2 + 10}>{e(r.n.amp, 2, false)} {r.unit}</text>
        <path class="c0" d={rowPath(r.n.v, k)} />
        {#if r.k === "E" && difRow}<path class="c1" d={rowPath(difRow, k)} />{/if}
      {/each}
      {#each [0, 0.5, 1, 1.5, 2] as zz (zz)}<line class="gl" x1={X0 + (zz / 2) * (X1 - X0)} x2={X0 + (zz / 2) * (X1 - X0)} y1="0" y2={4 * RH} /><text x={X0 + (zz / 2) * (X1 - X0)} y={4 * RH + 14} text-anchor="middle">{zz} Λ</text>{/each}
    </svg></div>
    <div class="q-side"><dl class="q-kv">
      <dt>phase, Δn vs I</dt><dd>{sf(phase, 1, 6)} deg</dd>
      <dt>E<sub>dif</sub> per unit m</dt><dd>{e(Edif1, 2, false)} V/m</dd>
      <dt>|E<sub>1</sub>|, fundamental</dt><dd>{e(g.E1_V_m, 2, false)} V/m</dd>
      <dt>Λ</dt><dd>{f(10 ** lgL, 2, 5)} µm</dd>
      <dt>m</dt><dd>{f(m, 2, 5)}</dd>
    </dl><p class="q-note">Photovoltaic field: local, in phase with the fringes. Diffusion field: from bright to dark, a quarter period off. Set k<sub>G</sub> to 0 to see 90 deg; diffusion off gives 0 deg.</p></div></div>
    <TCtl id="f2-l-t" label="Period Λ" bind:value={lgL} min={-0.7} max={1.3} step={0.01} out="{f(10 ** lgL, 2, 5)} µm" />
    <TCtl id="f2-m-t" label="Modulation m" bind:value={m} min={0} max={0.95} step={0.01} out={f(m, 2, 5)} />
    <TCtl id="f2-w-t" label="Photovoltaic k<sub>G</sub>" bind:value={w} min={0} max={1} step={0.01} out="{f(w, 2, 4)} × Fe" />
    <TCtl id="f2-T-t" label="Temperature" bind:value={T} min={77} max={400} step={1} out="{f(T, 0, 4)} K" />
    <div class="ctl"><span class="k">Diffusion</span><Seg bind:value={diff} options={[[true, "on"], [false, "off"]]} label="Diffusion current" /><span></span></div>
    <div class="pf"><span>dashed: closed form Eq. 3.9, diffusion only <Src id="volk2008" loc="Eq. 3.9" code="P-comp" cite={false} /></span><span>k<sub>G</sub>(Fe) <Src id="volk2008" loc="p. 59" code="P-comp" cite={false} /></span><span>I<sub>0</sub>, &kappa;, &sigma;<sub>d</sub>, &alpha;: model parameters, no data <Badge code="template" pop="f2-tmpl" /></span><span>phase: fundamental Fourier components of &Delta;n and I</span></div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>Fringes to field</h3><span class="q-vq">1D grating along c, two periods, steady state</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 {VW} {VH}" role="img" aria-label="Light fringes, migrating charge and the resulting index grating with a caliper marking their phase shift">
          <text x={VX0} y="24" class="q-vt">light, 532 nm</text>
          {#each fringes as fr, k (k)}<rect x={fr.x} y="34" width={fr.w} height="64" fill="var(--v-l532)" opacity={(0.08 + 0.85 * fr.a).toFixed(3)} />{/each}
          <rect x={VX0} y="104" width={VX1 - VX0} height="80" class="q-strip" />
          <text x={VX0} y="122" class="q-vt">charge</text>
          {#each charges as c, k (k)}{#if Math.abs(c.s) > 0.08}<text x={c.x} y={150 + 7} text-anchor="middle" class={c.s > 0 ? "q-pos" : "q-neg"} style="font-size:{(10 + 14 * Math.abs(c.s)).toFixed(1)}px">{c.s > 0 ? "+" : "−"}</text>{/if}{/each}
          <text x={VX0} y="200" class="q-vt">index change</text>
          <path d={ribbon} class="q-rib" />
          <path d={ribbonLine} class="q-ribl" />
          <!-- caliper -->
          <line x1={xI} x2={xI} y1="34" y2="270" class="q-cal0" />
          <line x1={xN} x2={xN} y1="196" y2="270" class="q-cal1" />
          <path d="M{xI} 280 L{xN} 280" class="q-cal" />
          <path d="M{xI} 274 L{xI} 286 M{xN} 274 L{xN} 286" class="q-cal" />
          <text x={(xI + xN) / 2} y="296" text-anchor="middle" class="q-vv">{sf(phase, 1, 6)}°</text>
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f2-w-v" label="Photovoltaic current" bind:value={w} min={0} max={1} step={0.01} out="{f(w, 2, 4)} × Fe" w={9} />
        <VCtl id="f2-l-v" label="Fringe period" bind:value={lgL} min={-0.7} max={1.3} step={0.01} out="{f(10 ** lgL, 2, 5)} µm" w={8} />
        <VCtl id="f2-m-v" label="Fringe contrast" bind:value={m} min={0} max={0.95} step={0.01} out={f(m, 2, 4)} w={5} />
        <VCtl id="f2-T-v" label="Temperature" bind:value={T} min={77} max={400} step={1} out="{f(T, 0, 3)} K" w={6} />
        <div class="v-ctl"><span class="v-lab">Diffusion current</span><Seg kind="v" bind:value={diff} options={[[true, "On"], [false, "Off"]]} label="Diffusion current" /></div>
        <dl class="v-hud">
          <dt>Index peak behind fringe peak</dt><dd>{sf(phase, 1, 6)}°</dd>
          <dt>Diffusion field per unit contrast</dt><dd>{e(Edif1, 2, false)} V/m</dd>
          <dt>Field amplitude, fundamental</dt><dd>{e(g.E1_V_m, 2, false)} V/m</dd>
        </dl>
        <p class="v-cap">Photovoltaic field: local, in phase with the fringes. Diffusion field: from bright to dark, a quarter period off. Set k<sub>G</sub> to 0 to see 90 deg; diffusion off gives 0 deg.</p>
      </div>
    </div>
    <div class="v-prov"><span>Glass constant at 1 × the Fe value <Src id="volk2008" loc="p. 59" code="P-comp" cite={false} /></span><span>diffusion field, Eq. 3.9 <Src id="volk2008" code="P-comp" cite={false} /></span><span>intensity, conductivities: model parameters, no data <Badge code="template" pop="f2-tmpl" /></span><span>phase: fundamental Fourier components of Δn and I</span></div>
  </div>
</div>

<style>
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-strip { fill: color-mix(in srgb, var(--v-ln) 10%, transparent); stroke: var(--v-ln); stroke-width: 1; }
  .q-pos { fill: var(--v-au) !important; font-family: var(--v-ui) !important; font-weight: 600; }
  .q-neg { fill: var(--nb) !important; font-family: var(--v-ui) !important; font-weight: 600; }
  .q-rib { fill: var(--v-l532-dim); }
  .q-ribl { fill: none; stroke: var(--v-l532); stroke-width: 2; }
  .q-cal0 { stroke: var(--v-l532); stroke-width: 1; stroke-dasharray: 3 3; }
  .q-cal1 { stroke: var(--v-text); stroke-width: 1; stroke-dasharray: 3 3; }
  .q-cal { stroke: var(--v-text); stroke-width: 1.5; fill: none; }
  .q-vv { font: 500 calc(15px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; font-variant-numeric: tabular-nums; }
</style>
