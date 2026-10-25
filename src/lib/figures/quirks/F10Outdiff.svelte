<!-- fig-04-10 Li out-diffusion profile (schlarb.ts, composition.ts). Deficit dc(z) = dc_s erfc(z / (2 sqrt(D t))) with
     dc_s and sqrt(Dt) templates (no sourced diffusion coefficient); n_e(z), n_o(z) from the generalized Sellmeier (status S,
     400-1200 nm, undoped); Curie temperature from the Bordui fit (P-comp), Iyi fit shown alongside. Bulk 48.38 mol%. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { liDeficitProfile, outDiffusionIndex, schlarbDnDc } from "$lib/physics/schlarb.ts";
  import { tcBordui, tcIyi } from "$lib/physics/composition.ts";
  import { axis, px, path, ticks, linspace } from "./plot.ts";
  import { e, f, sf } from "./fmtq.ts";

  const CB = 48.38;
  let dcs = $state(0.5);
  let lgD = $state(0); // log10 um, sqrt(D t)
  let lam = $state<632.8 | 1064>(632.8);

  const sD = $derived(10 ** lgD * 1e-6);
  const us = linspace(0, 6, 121); // depth in units of sqrt(Dt)
  const dc = $derived(Float64Array.from(us, (u) => liDeficitProfile(u * sD, dcs, sD)));
  const dne = $derived(Float64Array.from(us, (u) => outDiffusionIndex("e", lam, CB, u * sD, dcs, sD)));
  const dno = $derived(Float64Array.from(us, (u) => outDiffusionIndex("o", lam, CB, u * sD, dcs, sD)));
  const tc = $derived(Float64Array.from(dc, (d) => tcBordui(CB - d)));
  const dne0 = $derived(dne[0]), dno0 = $derived(dno[0]);
  const ge = $derived(dne0 > 1e-9), go = $derived(dno0 > 1e-9);
  const slopeE = schlarbDnDc("e", 632.8, CB), slopeO = schlarbDnDc("o", 632.8, CB);

  const W = 760, RH = 120, X0 = 70, X1 = 744;
  const xa = axis(0, 6, X0, X1);
  const yc = axis(0, 1.6, 10 + RH - 18, 14);
  const yn = axis(-2e-3, 1.6e-2, 2 * RH - 18, RH + 14);
  const yt = axis(1080, 1150, 3 * RH - 18, 2 * RH + 14);
  const H = 3 * RH + 26;

  // VISUAL: dot lattice thinned near the surface (deterministic hash), rays
  const hash = (i: number) => { let x = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
  const dots = $derived.by(() => {
    const out: { x: number; y: number }[] = [];
    for (let j = 0; j < 14; j++) for (let i = 0; i < 34; i++) {
      const u = (j + 0.5) / 14 * 6; // depth units
      const miss = liDeficitProfile(u * sD, dcs, sD) / 1.5; // up to 1 at 1.5 mol% (exaggerated for display)
      if (hash(j * 97 + i) < miss * 0.9) continue;
      out.push({ x: 40 + i * 17 + (j % 2) * 8, y: 60 + j * 15 });
    }
    return out;
  });
  const VY = (u: number) => 60 + (u / 6) * 210;
  // turning depth for the e ray: where dn_e falls to 30% of the surface value
  const turnU = $derived.by(() => { if (!ge) return 0; for (let i = 0; i < us.length; i++) if (dne[i] < 0.3 * dne0) return us[i]; return 6; });
  const eRay = $derived.by(() => { if (!ge) return `M40 ${VY(0.2)} L620 ${VY(6)}`; const yb = VY(turnU); let s = `M40 ${VY(0.05)}`; for (let k = 1; k <= 8; k++) s += ` L${40 + k * 72.5} ${k % 2 ? yb : VY(0.05)}`; return s; });
  const oRay = `M40 ${VY(0.05)} L360 ${VY(6)}`;
  const colE = $derived(lam === 632.8 ? "var(--v-l633)" : "var(--v-ir1064)");
</script>

<div class="q-fig" id="fig-04-10">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Li<sub>2</sub>O out-diffusion: deficit, index change, Curie temperature vs depth</span><span>bulk 48.38 mol% Li<sub>2</sub>O, 24.5 °C</span></div>
    <div class="q-pside">
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Lithium deficit, index changes and Curie temperature versus depth">
          {#each ticks(xa, 6) as t (t.v)}<line class="gl" x1={t.p} x2={t.p} y1="10" y2={3 * RH - 18} /><text x={t.p} y={3 * RH - 4} text-anchor="middle">{t.label}</text>{/each}
          <rect class="fr" x={X0} y="14" width={X1 - X0} height={RH - 32} /><rect class="fr" x={X0} y={RH + 14} width={X1 - X0} height={RH - 32} /><rect class="fr" x={X0} y={2 * RH + 14} width={X1 - X0} height={RH - 32} />
          {#each [0, 0.5, 1, 1.5] as v (v)}<text x={X0 - 4} y={px(yc, v) + 3} text-anchor="end">{v}</text>{/each}
          {#each [0, 5e-3, 1e-2, 1.5e-2] as v (v)}<text x={X0 - 4} y={px(yn, v) + 3} text-anchor="end">{(v * 1e3).toFixed(0)}</text>{/each}
          <line class="gl" x1={X0} x2={X1} y1={px(yn, 0)} y2={px(yn, 0)} />
          {#each [1080, 1110, 1140] as v (v)}<text x={X0 - 4} y={px(yt, v) + 3} text-anchor="end">{v}</text>{/each}
          <path class="c0" d={path(xa, yc, us, dc)} />
          <path class="c0" d={path(xa, yn, us, dne)} /><path class="c1" d={path(xa, yn, us, dno)} />
          <path class="c0" d={path(xa, yt, us, tc)} /><path class="c3" d={path(xa, yt, us, Float64Array.from(dc, (d) => tcIyi(CB - d)))} />
          <text x={X0 + 6} y="26" class="labf">Li2O deficit (mol%)</text>
          <text x={X0 + 6} y={RH + 26} class="labf">Δn ×10³: e solid, o dashed</text>
          <text x={X0 + 6} y={2 * RH + 26} class="labf">Curie temperature (°C): Bordui solid, Iyi dotted</text>
          <text x={(X0 + X1) / 2} y={H - 2} text-anchor="middle">depth z / √(Dt)   (1 unit = {f(10 ** lgD, 2, 5)} µm, template)</text>
        </svg>
      </div>
      <div class="q-side">
        <dl class="q-kv">
          <dt>Δc<sub>s</sub>, surface deficit</dt><dd>{f(dcs, 2, 5)} mol%</dd>
          <dt>Δn<sub>e</sub>(0)</dt><dd>{e(dne0, 2)}</dd>
          <dt>Δn<sub>o</sub>(0)</dt><dd>{e(dno0, 2)}</dd>
          <dt>T<sub>c</sub>(0), Bordui fit</dt><dd>{f(tc[0], 0, 5)} °C</dd>
          <dt>T<sub>c</sub>(0), Iyi fit</dt><dd>{f(tcIyi(CB - dcs), 0, 5)} °C</dd>
          <dt>surface index raised</dt><dd>e: {ge ? "yes" : "no "}   o: {go ? "yes" : "no "}</dd>
          <dt>dn<sub>e</sub>/dc, 632.8 nm</dt><dd>{e(slopeE, 2)} /mol%</dd>
          <dt>dn<sub>o</sub>/dc, 632.8 nm</dt><dd>{e(slopeO, 2)} /mol%</dd>
        </dl>
        <p class="q-note">Guided means the surface index is raised (&Delta;n(0) &gt; 0); whether a mode exists also depends on depth and wavelength. Losing Li<sub>2</sub>O raises n<sub>e</sub> and lowers n<sub>o</sub> slightly.</p>
      </div>
    </div>
    <TCtl id="f10-c-t" label="Surface deficit" bind:value={dcs} min={0} max={1.5} step={0.01} out="{f(dcs, 2, 5)} mol%" />
    <TCtl id="f10-d-t" label="√(Dt)" bind:value={lgD} min={-1} max={Math.log10(20)} step={0.005} out="{f(10 ** lgD, 2, 6)} µm" />
    <div class="ctl"><span class="k">Wavelength</span><Seg bind:value={lam} options={[[632.8, "632.8 nm"], [1064, "1064 nm"]]} label="Wavelength" /><span></span></div>
    <div class="pf">
      <span>n(c, &lambda;): generalized Sellmeier, 400-1200 nm, about 2&times;10<sup>&minus;3</sup> accuracy <Src id="volk2008" loc="Eqs. 6.9-6.10, Table 6.1" code="S" cite={false} /></span>
      <span>T<sub>c</sub> slope 39.06-39.26 &deg;C per mol% <Src id="volk2008" loc="Eqs. 6.2-6.3" code="P-comp" cite={false} /></span>
      <span>D, dc<sub>s</sub>: model parameters, no data <Badge code="template" pop="f10-t" /></span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>A skin that guides one polarization</h3><span class="q-vq">bulk 48.38 mol% Li₂O, 24.5 °C; n<sub>e</sub> rises, n<sub>o</sub> falls</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 660 300" role="img" aria-label="Crystal cross-section with lithium sites thinning toward the surface, an extraordinary ray trapped in the skin and an ordinary ray leaking into the substrate">
          <rect x="30" y="50" width="600" height="230" class="q-blk" />
          {#each dots as d, i (i)}<circle cx={d.x} cy={d.y} r="2" class="q-li" />{/each}
          {#if ge}<rect x="30" y="50" width="600" height={VY(turnU) - 50} class="q-skin" />{/if}
          <path d={eRay} class="q-ray" style="stroke:{colE}" class:ir={lam === 1064} />
          <path d={oRay} class="q-ray q-o" style="stroke:{colE}" class:ir={lam === 1064} />
          <text x="34" y="40" class="q-vt">surface (Li-poor)</text>
          <text x="626" y="40" text-anchor="end" class="q-vt">{ge ? "e: index raised in the skin" : "e: no raised index"}</text>
          <text x="370" y="278" class="q-vt">o: leaks into the substrate</text>
          <text x="34" y="294" class="q-vt">Li-site thinning exaggerated: 90% of dots removed at a 1.5 mol% deficit</text>
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f10-c-v" label="Surface Li₂O deficit" bind:value={dcs} min={0} max={1.5} step={0.01} out="{f(dcs, 2, 4)} mol%" w={10} />
        <VCtl id="f10-d-v" label="Diffusion length √(Dt)" bind:value={lgD} min={-1} max={Math.log10(20)} step={0.005} out="{f(10 ** lgD, 2, 5)} µm" w={9} />
        <div class="v-ctl"><span class="v-lab">Light</span><Seg kind="v" bind:value={lam} options={[[632.8, "632.8 nm"], [1064, "1064 nm"]]} label="Wavelength" /></div>
        <dl class="v-hud">
          <dt>Surface Δn<sub>e</sub></dt><dd>{sf(dne0 * 1e3, 2, 7)}×10⁻³</dd>
          <dt>Surface Δn<sub>o</sub></dt><dd>{sf(dno0 * 1e3, 2, 7)}×10⁻³</dd>
          <dt>Surface T<sub>c</sub>, Bordui / Iyi</dt><dd>{f(tc[0], 0, 5)} / {f(tcIyi(CB - dcs), 0, 5)} °C</dd>
        </dl>
        <p class="v-cap">A raised surface index (Δn(0) &gt; 0) is necessary for guiding; whether a mode exists also depends on depth and wavelength.</p>
        <p class="v-cap">Raise the deficit and the extraordinary ray locks into the skin while the ordinary ray spills out: the physics of the 1973 out-diffused "thin-film" modulator.</p>
      </div>
    </div>
    <div class="v-prov"><span>index model <Src id="volk2008" loc="Eqs. 6.9-6.10" code="S" cite={false} /></span><span>Curie fits <Src id="volk2008" code="P-comp" cite={false} /></span><span>deficit and diffusion length: model parameters, no data <Badge code="template" pop="f10-t" /></span><span>632.8 nm in computed spectral color; 1064 nm in false color, dashed</span></div>
  </div>
</div>

<style>
  .q-blk { fill: color-mix(in srgb, var(--v-ln) 10%, var(--v-ink0)); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-li { fill: var(--v-text3); }
  .q-skin { fill: color-mix(in srgb, var(--v-l532) 10%, transparent); }
  .q-ray { fill: none; stroke-width: 2.5; }
  .q-ray.ir { stroke-dasharray: 6 4; }
  .q-ray.q-o { opacity: 0.55; stroke-dasharray: 2 4; }
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
</style>
