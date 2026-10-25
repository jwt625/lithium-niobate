<!-- fig-04-09 Thermal calculator (thermal.ts). dn_e/dT(lambda, T) from the Jundt 1997 Sellmeier (coefficients S); dn/dT at
     632 nm from the Moretti 2005 linear fits quoted by Schwesyg (S, 300-515 K); dn_o/dT at 633/1064/1550 nm recomputed from
     the cti1999 Sellmeier (derived from V, spot values; no curve). Thermal lens f = pi w^2 K_th / (alpha P L dn/dT), valid
     for f >> L. Ring shift lambda Gamma dn/dT / n_g with template Gamma, n_g. Gayer 2008 MgO:LN coefficients excluded. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import Src from "./ui/Src.svelte";
  import TCtl from "./ui/TCtl.svelte";
  import VCtl from "./ui/VCtl.svelte";
  import Seg from "./ui/Seg.svelte";
  import { dnedT, morettiDnDT, thermalLensFocal, thermalShiftPerK } from "$lib/physics/thermal.ts";
  import { axis, px, path, ticks, logspace } from "./plot.ts";
  import { e, f } from "./fmtq.ts";
  import { spectral } from "../spectral.ts";

  const dnE_ = (l: number, t: number): number => dnedT(Math.min(5, Math.max(0.4, l)), Math.min(250, Math.max(20, t)));
  let lgL = $state(Math.log10(1.55));
  let T = $state(25);
  let src = $state<"je" | "me" | "mo">("je");
  let lgP = $state(1);
  let lgW = $state(Math.log10(150));
  let lgA = $state(Math.log10(0.005));
  let Lmm = $state(20);
  let K = $state<"3.92" | "5.97" | "5.0">("3.92");
  let G = $state(0.8);
  let ng = $state(2.3);

  const lam = $derived(10 ** lgL);
  const visBeam = $derived(lam <= 0.7);
  const beamCol = $derived(visBeam ? spectral(lam * 1000, 1, 0.04) : "var(--v-ir1550)");
  const TK = $derived(T + 273.15);
  const dnE = $derived(dnE_(lam, T));
  const morOK = $derived(TK >= 300 && TK <= 515);
  const dnUse = $derived(src === "je" ? dnE : morOK ? morettiDnDT(src === "me" ? "e" : "o", TK) : Number.NaN);
  const fLens = $derived(thermalLensFocal(10 ** lgW * 1e-6, +K, 10 ** lgA * 100, 10 ** lgP, Lmm * 1e-3, dnUse));
  const ringPmK = $derived(thermalShiftPerK(lam * 1e-6, G, dnUse, ng) * 1e12);
  function example(): void { lgP = 1; lgW = Math.log10(150); lgA = Math.log10(0.005); Lmm = 20; T = 100; K = "5.0"; src = "me"; lgL = Math.log10(0.6328); }

  // plot
  const W = 760, H = 250, X0 = 52, X1 = 744, Y0 = 18, Y1 = 214;
  const xa = axis(0.4, 5, X0, X1, true), ya = axis(0, 7e-5, Y1, Y0);
  const ls = logspace(0.4, 5, 160);
  const curve = $derived(path(xa, ya, ls, Float64Array.from(ls, (l) => dnE_(l, T))));
  const CTI = [{ l: 1.55, v: 0.41e-5 }, { l: 1.064, v: 0.54e-5 }, { l: 0.633, v: 0.94e-5 }];
  const yTicks = [0, 1e-5, 2e-5, 3e-5, 4e-5, 5e-5, 6e-5, 7e-5];

  // VISUAL lens drawing: crystal at x 60..60+L scaled, focus at f (mm) on a 0..300 mm axis
  const VX0 = 60, VX1 = 620, SPAN = 300;
  const mm = (x: number) => VX0 + (x / SPAN) * (VX1 - VX0);
  const fInWin = $derived(Number.isFinite(fLens) && fLens > 0 && fLens * 1e3 < SPAN - Lmm);
  const fx = $derived(fInWin ? mm(Lmm + fLens * 1e3) : VX1);
  const wPx = $derived(Math.min(40, 6 + 10 * Math.log10(10 ** lgW / 10)));
  const dialA = $derived(Math.PI * (0.9 - 0.8 * Math.min(1, Math.max(0, (Number.isFinite(ringPmK) ? ringPmK : 0) / 40))));
</script>

<div class="q-fig" id="fig-04-09">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Thermal calculator: dn/dT, thermal lens, ring shift</span><span>congruent LN</span></div>
    <div class="q-pside">
      <div>
        <svg class="q-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Thermo-optic coefficients versus wavelength">
          {#each [0.4, 0.5, 0.633, 1.064, 1.55, 2, 3, 5] as l (l)}<line class="gl" x1={px(xa, l)} x2={px(xa, l)} y1={Y0} y2={Y1} /><text x={px(xa, l)} y={Y1 + 13} text-anchor="middle">{l}</text>{/each}
          {#each yTicks as v (v)}<line class="gl" x1={X0} x2={X1} y1={px(ya, v)} y2={px(ya, v)} /><text x={X0 - 4} y={px(ya, v) + 3} text-anchor="end">{(v * 1e5).toFixed(0)}</text>{/each}
          <rect class="fr" x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
          <path class="c0" d={curve} />
          {#each CTI as c (c.l)}<rect x={px(xa, c.l) - 3.5} y={px(ya, c.v) - 3.5} width="7" height="7" class="mko" /><text x={px(xa, c.l) + 6} y={px(ya, c.v) + 3} class="lab">o, vendor</text>{/each}
          {#if morOK}<circle cx={px(xa, 0.632)} cy={px(ya, morettiDnDT("e", TK))} r="4" class="mk" /><circle cx={px(xa, 0.632)} cy={px(ya, morettiDnDT("o", TK))} r="4" class="mk" /><text x={px(xa, 0.632) - 6} y={px(ya, morettiDnDT("e", TK)) - 6} text-anchor="end" class="lab">Moretti e</text><text x={px(xa, 0.632) - 6} y={px(ya, morettiDnDT("o", TK)) + 12} text-anchor="end" class="lab">Moretti o</text>{/if}
          <path d="M{px(xa, 1.523) - 4} {px(ya, 3.34e-5)} l4 -5 l4 5 l-4 5 Z" class="mk" /><text x={px(xa, 1.523) + 7} y={px(ya, 3.34e-5) + 12} class="lab">1523 nm, 300 K</text>
          <line class="cur" x1={px(xa, lam)} x2={px(xa, lam)} y1={Y0} y2={Y1} />
          <text x={X0} y={Y0 - 5}>dn/dT (10⁻⁵ /K)</text><text x={(X0 + X1) / 2} y={H - 4} text-anchor="middle">λ (µm), log</text>
          <text x={X1 - 4} y={Y0 + 12} text-anchor="end" class="labf">line: dnₑ/dT, Jundt, at T</text>
        </svg>
      </div>
      <div class="q-side">
        <div class="q-cells">
          <div class="q-cell"><span>dn/dT used</span><b class="q-o">{e(dnUse, 2, false)} /K</b></div>
          <div class="q-cell"><span>thermal lens f</span><b class="q-o">{Number.isFinite(fLens) ? e(fLens * 1e3, 1, false) : "     n/a"} mm</b><span class="q-ok">f/L {Number.isFinite(fLens) ? f(fLens * 1e3 / Lmm, 1, 6) : "   n/a"}; formula assumes f &gt;&gt; L</span></div>
          <div class="q-cell"><span>ring shift</span><b class="q-o">{Number.isFinite(ringPmK) ? f(ringPmK, 1, 6) : "   n/a"} pm/K</b></div>
        </div>
        <dl class="q-kv">
          <dt>dn<sub>e</sub>/dT at λ, T</dt><dd>{e(dnE, 2, false)} /K</dd>
          <dt>Moretti 632 nm e / o</dt><dd>{morOK ? `${e(morettiDnDT("e", TK), 2, false)} / ${e(morettiDnDT("o", TK), 2, false)}` : "outside 300-515 K   "}</dd>
          <dt>λ</dt><dd>{f(lam, 3, 6)} µm</dd>
        </dl>
        <button type="button" class="q-tbtn" onclick={example}>load the thesis lens example</button>
        <p class="q-note">Thesis example (10 W, w 150 &micro;m, 0.005 cm<sup>&minus;1</sup>, 20 mm, 100 &deg;C, 5 W/(m K)): 61 mm from its own formula with Moretti dn<sub>e</sub>/dT at 632 nm; the thesis states about 100 mm. Which dn/dT it used is not stated.</p>
      </div>
    </div>
    <TCtl id="f9-l-t" label="Wavelength" bind:value={lgL} min={Math.log10(0.4)} max={Math.log10(5)} step={0.0001} out="{f(lam, 3, 6)} µm" />
    <TCtl id="f9-T-t" label="Temperature" bind:value={T} min={20} max={200} step={1} out="{f(T, 0, 4)} °C" />
    <TCtl id="f9-p-t" label="Lens: power" bind:value={lgP} min={-1} max={2} step={0.01} out="{e(10 ** lgP, 2)} W" />
    <TCtl id="f9-w-t" label="Lens: radius w" bind:value={lgW} min={1} max={3} step={0.0001} out="{f(10 ** lgW, 0, 5)} µm" />
    <TCtl id="f9-a-t" label="Lens: α" bind:value={lgA} min={-4} max={-1} step={0.0001} out="{e(10 ** lgA, 2)} /cm" />
    <TCtl id="f9-L-t" label="Lens: length" bind:value={Lmm} min={1} max={50} step={0.5} out="{f(Lmm, 1, 5)} mm" />
    <TCtl id="f9-g-t" label="Ring: Γ" bind:value={G} min={0.5} max={1} step={0.01} out={f(G, 2, 5)} />
    <TCtl id="f9-n-t" label="Ring: n<sub>g</sub>" bind:value={ng} min={2.0} max={2.4} step={0.01} out={f(ng, 2, 5)} />
    <div class="ctl"><span class="k">dn/dT for lens, ring</span><Seg bind:value={src} options={[["je", "e, Jundt (λ, T)"], ["me", "e, Moretti 632"], ["mo", "o, Moretti 632"]]} label="dn/dT source" /><span></span></div>
    <div class="ctl"><span class="k">K<sub>th</sub>, W/(m K)</span><Seg bind:value={K} options={[["3.92", "3.92 CLN"], ["5.97", "5.97 near-SLN"], ["5.0", "5.0 thesis"]]} label="Thermal conductivity" /><span></span></div>
    <div class="pf">
      <span>Jundt dn<sub>e</sub>/dT <Badge code="derived" pop="f9-j" /></span>
      <span>Moretti fits <Src id="schwesyg2011" loc="Eqs. 2.26-2.27" code="S" cite={false} /></span>
      <span>1523 nm value <Src id="moretti2005" loc="via Zhu 2021" code="S" cite={false} /></span>
      <span>dn<sub>o</sub>/dT spot values from a vendor Sellmeier <Src id="cti1999" code="V" cite={false} /></span>
      <span>K<sub>th</sub> <Src id="volk2008" loc="Table 1.1" code="P-comp" cite={false} /></span>
      <span>lens formula <Src id="schwesyg2011" loc="Eq. 2.28" code="S" cite={false} /></span>
      <span>&Gamma;, n<sub>g</sub>: model parameters, no data <Badge code="template" pop="f9-t" /></span>
      <span>Gayer 2008 MgO:LN excluded (anomalous dn/dT)</span>
    </div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>A crystal that becomes a lens</h3><span class="q-vq">absorbed power heats the beam path; dn/dT &gt; 0 focuses</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 660 300" role="img" aria-label="Beam through a heated crystal converging to the thermal focus, drawn to scale along the axis">
          <defs><radialGradient id="f9-heat" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff7a3d" stop-opacity="0.6" /><stop offset="1" stop-color="#ff7a3d" stop-opacity="0" /></radialGradient></defs>
          <rect x={mm(0)} y="70" width={Math.max(4, mm(Lmm) - mm(0))} height="120" class="q-xtal" />
          <ellipse cx={(mm(0) + mm(Lmm)) / 2} cy="130" rx={Math.max(6, (mm(Lmm) - mm(0)) / 2)} ry="40" fill="url(#f9-heat)" style="opacity:{Math.min(1, (10 ** lgP * 10 ** lgA) / 0.05).toFixed(3)}" />
          <path style="stroke:{beamCol}" class:q-ir={!visBeam} d="M10 {130 - wPx} L{mm(Lmm)} {130 - wPx} L{fx} {fInWin ? 130 : 130 - wPx * 0.5} M10 {130 + wPx} L{mm(Lmm)} {130 + wPx} L{fx} {fInWin ? 130 : 130 + wPx * 0.5}" class="q-beam ir-el" />
          {#if fInWin}<circle cx={fx} cy="130" r="5" class="q-focus" style="fill:{beamCol}" /><text x={fx} y="112" text-anchor="middle" class="q-vt">focus</text>{:else}<text x={VX1 - 4} y="112" text-anchor="end" class="q-vt">focus beyond 300 mm</text>{/if}
          {#each [0, 50, 100, 150, 200, 250, 300] as d (d)}<line x1={mm(d)} x2={mm(d)} y1="226" y2="232" class="ax" /><text x={mm(d)} y="248" text-anchor="middle">{d} mm</text>{/each}
          <line x1={mm(0)} x2={VX1} y1="226" y2="226" class="ax" />
          <text x={mm(0)} y="60" class="q-vt">crystal, {f(Lmm, 0, 2)} mm</text>
          <text x="330" y="284" text-anchor="middle" class="q-vt">axis to scale; beam width not to scale; beam at {f(lam, 3, 5)} µm{visBeam ? ", computed spectral color" : ", false color, dashed"}</text>
        </svg>
        <svg class="q-svg" viewBox="0 0 660 120" role="img" aria-label="Dial of the ring resonance shift per kelvin">
          <path d="M268 100 A62 62 0 0 1 392 100" class="q-dial" />
          <path d="M330 100 L{(330 + 56 * Math.cos(dialA)).toFixed(1)} {(100 - 56 * Math.sin(dialA)).toFixed(1)}" class="q-needle" />
          <text x="250" y="104" text-anchor="end" class="q-vt">0</text><text x="410" y="104" class="q-vt">40 pm/K</text>
          <text x="330" y="22" text-anchor="middle" class="q-vv">{Number.isFinite(ringPmK) ? f(ringPmK, 1, 5) : "n/a"} pm/K ring shift</text>
        </svg>
      </div>
      <div class="q-vctl">
        <VCtl id="f9-p-v" label="Beam power" bind:value={lgP} min={-1} max={2} step={0.01} out="{f(10 ** lgP, 1, 5)} W" w={8} />
        <VCtl id="f9-a-v" label="Absorption" bind:value={lgA} min={-4} max={-1} step={0.0001} out="{e(10 ** lgA, 1, false)} /cm" w={11} />
        <VCtl id="f9-w-v" label="Beam radius" bind:value={lgW} min={1} max={3} step={0.0001} out="{f(10 ** lgW, 0, 4)} µm" w={8} />
        <VCtl id="f9-L-v" label="Crystal length" bind:value={Lmm} min={1} max={50} step={0.5} out="{f(Lmm, 1, 4)} mm" w={8} />
        <VCtl id="f9-l-v" label="Wavelength" bind:value={lgL} min={Math.log10(0.4)} max={Math.log10(5)} step={0.0001} out="{f(lam, 3, 5)} µm" w={8} />
        <div class="v-ctl"><span class="v-lab">dn/dT for the lens and ring</span><Seg kind="v" bind:value={src} options={[["je", "e, Jundt"], ["me", "e, Moretti"], ["mo", "o, Moretti"]]} label="dn/dT source" /></div>
        <div class="v-ctl"><span class="v-lab">Thermal conductivity, W/(m K)</span><Seg kind="v" bind:value={K} options={[["3.92", "3.92 CLN"], ["5.97", "5.97 NSLN"], ["5.0", "5.0 thesis"]]} label="Thermal conductivity" /></div>
        <VCtl id="f9-T-v" label="Temperature" bind:value={T} min={20} max={200} step={1} out="{f(T, 0, 3)} °C" w={6} />
        <div class="q-vrow"><button type="button" class="q-vbtn" onclick={example}>Thesis example</button></div>
        <dl class="v-hud">
          <dt>Focal length</dt><dd>{Number.isFinite(fLens) ? e(fLens * 1e3, 1, false) : "n/a"} mm</dd>
          <dt>f / L (formula assumes f &gt;&gt; L)</dt><dd>{Number.isFinite(fLens) ? f(fLens * 1e3 / Lmm, 1, 6) : "n/a"}</dd>
          <dt>dn/dT used</dt><dd>{e(dnUse, 2, false)} /K</dd>
          <dt>Source of dn/dT</dt><dd>{src === "je" ? "e, Jundt at λ, T" : src === "me" ? "e, Moretti 632 nm" : "o, Moretti 632 nm"}</dd>
          <dt>Ring Γ, n<sub>g</sub> (template)</dt><dd>{f(G, 2, 4)}, {f(ng, 2, 4)}</dd>
        </dl>
        <p class="v-cap">Thesis example (10 W, 150 µm, 0.005 cm⁻¹, 20 mm, 100 °C, 5 W/(m K)): 61 mm from its own formula with the Moretti dn<sub>e</sub>/dT at 632 nm; the thesis states about 100 mm, and which dn/dT it used is not stated.</p>
      </div>
    </div>
    <div class="v-prov"><span>dn<sub>e</sub>/dT, Jundt <Badge code="derived" pop="f9-j" /></span><span>Moretti fits <Src id="schwesyg2011" loc="Eqs. 2.26-2.27" code="S" cite={false} /></span><span>1523 nm value <Src id="moretti2005" loc="via Zhu 2021" code="S" cite={false} /></span><span>dn<sub>o</sub>/dT spot values from a vendor Sellmeier <Src id="cti1999" code="V" cite={false} /></span><span>lens formula <Src id="schwesyg2011" loc="Eq. 2.28" code="S" cite={false} /></span><span>K<sub>th</sub> <Src id="volk2008" loc="Table 1.1" code="P-comp" cite={false} /></span><span>Gayer 2008 MgO:LN excluded (anomalous dn/dT)</span><span>ring Γ, n<sub>g</sub>: model parameters <Badge code="template" pop="f9-t" /></span></div>
  </div>
</div>

<style>
  .q-cells { display: grid; gap: 6px; }
  .q-cell { border: 1px solid var(--rule2); padding: 4px 8px; display: grid; font: 400 10.5px/16px var(--mono); color: var(--fg3); }
  .q-cell b { font: 400 16px/22px var(--mono); color: var(--fg); }
  .q-ok { color: var(--fg2); white-space: nowrap; }
  .q-tbtn { justify-self: start; background: none; border: 1px solid var(--rule2); color: var(--fg2); font: 400 10.5px/1 var(--mono); letter-spacing: 0.06em; padding: 5px 8px; cursor: pointer; }
  .q-tbtn:hover { background: var(--fg); color: var(--bg); }
  .q-xtal { fill: color-mix(in srgb, var(--v-ln) 16%, transparent); stroke: var(--v-ln); stroke-width: 1.5; }
  .q-beam { fill: none; stroke-width: 2; }
  .q-beam.q-ir { stroke-dasharray: 6 4; }
  .q-vt { font: 500 calc(13px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text3) !important; }
  .q-vv { font: 500 calc(16px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text) !important; font-variant-numeric: tabular-nums; }
  .q-dial { fill: none; stroke: var(--v-line2); stroke-width: 6; }
  .q-needle { stroke: var(--v-l532); stroke-width: 2.5; }
  .q-vrow { display: flex; gap: 12px; }
</style>
